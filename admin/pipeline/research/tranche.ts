#!/usr/bin/env bun
import { existsSync } from 'node:fs';
import process from 'node:process';
/**
 * Tranche batch tooling (research-process plan Task 8; spec
 * docs/specs/2026-08-10-research-process-design.md §4.5).
 *
 * Thin CLI over the tested machinery (chunks.ts, verify.ts,
 * manifest.ts): everything a gated batch needs between the
 * maintainer's go and the tranche commit. Sweep/verification agents
 * are dispatched by the session driving this (see
 * data/patches/RUNBOOK.md); this file only prepares their inputs and
 * validates/accumulates their outputs.
 *
 *   bun admin/pipeline/research/tranche.ts prep <workdir> [count]
 *     Select the next `count` (default 25) pending chunks of the
 *     first unfinished tranche and write per-chunk input JSON
 *     (entries in pre-patch state + precomputed sense_index) to
 *     <workdir>/inputs/.
 *
 *   bun admin/pipeline/research/tranche.ts ingest <workdir>
 *     Validate every <workdir>/out/chunk-*.{patches,manifest}.jsonl
 *     agent output via ingestChunk, renumber ids to corpus-unique,
 *     accumulate into data/patches/tranches/<tranche>/, mark
 *     succeeded chunks complete in the checkpoint, and write the
 *     verification sample item files. Chunk-fatal problems are
 *     printed; those chunks stay pending (re-sweep).
 *
 * The exported helpers carry the only real logic (sense_index
 * construction, corpus-unique renumbering) and are covered by
 * tranche.test.ts.
 */
import { applyRepairs } from '../body/repairs.ts';
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry, SourceSense } from '../body/types.ts';
import {
	contentAnchor,
	PATCH_ID,
	type SemanticPatch,
} from '../patch/schema.ts';
import {
	type AnomalyHint,
	buildAbbrevTable,
	entryAnomalyHints,
} from './anomalies.ts';
import { buildHeadwordIndex } from './link-anomalies.ts';
import {
	buildCheckpoint,
	buildTranches,
	type Chunk,
	chunkCorpus,
	corpusFingerprint,
	loadCheckpoint,
	markComplete,
	pendingChunks,
	saveCheckpoint,
	type Tranche,
} from './chunks.ts';
import type { EntryResult } from './manifest.ts';
import {
	type IngestResult,
	ingestChunk,
	type RejectRecord,
	selectSample,
} from './verify.ts';

const PROMPT_VERSION = 'v4';
const SNAPSHOT_LOCK = 'data/patches/snapshot.lock';
const SOURCE = 'data/source/jastrow-dictionary.jsonl';
const TRANCHES_DIR = 'data/patches/tranches';
/** Maintainer thresholds (pilot acceptance, 2026-08-13). */
const THRESHOLDS = { errorRate: 0.05, missRate: 0.02 };
const SAMPLE_CONFIG = {
	cleanRate: 0.1,
	highRate: 0.2,
	minClean: 15,
	minHigh: 8,
	seed: 20_260_813,
};

/** One row of the precomputed per-entry sense index the sweep
 * prompt's Input section promises. */
interface SenseIndexRow {
	anchor: string;
	number: string;
	path: string;
}

/** Document-order sense index with dotted paths ("0", "0.1", …). */
function senseIndex(entry: SourceEntry): SenseIndexRow[] {
	const rows: SenseIndexRow[] = [];
	const walk = (senses: readonly SourceSense[], prefix: string): void => {
		for (const [i, sense] of senses.entries()) {
			const path = prefix === '' ? String(i) : `${prefix}.${i}`;
			rows.push({
				anchor: contentAnchor(sense.definition ?? ''),
				number: sense.number ?? '',
				path,
			});
			if (sense.senses !== undefined) {
				walk(sense.senses, path);
			}
		}
	};
	walk(entry.content.senses, '');
	return rows;
}

/** The next free `P<6 digits>` number given every id already in
 * use (0 when none). */
function maxPatchNumber(ids: Iterable<string>): number {
	let max = 0;
	for (const id of ids) {
		if (PATCH_ID.test(id)) {
			max = Math.max(max, Number(id.slice(1)));
		}
	}
	return max;
}

/** Renumber one ingested chunk's patch ids to be corpus-unique,
 * starting after `after`. Manifest references follow. */
function renumber(
	result: IngestResult,
	after: number,
): { next: number; patches: SemanticPatch[]; records: EntryResult[] } {
	const idMap = new Map<string, string>();
	let n = after;
	for (const patch of result.patches) {
		n += 1;
		idMap.set(patch.id, `P${String(n).padStart(6, '0')}`);
	}
	return {
		next: n,
		patches: result.patches.map((p) => ({
			...p,
			id: idMap.get(p.id) ?? p.id,
		})),
		records: result.records.map((r) => ({
			...r,
			patches: r.patches.map((id) => idMap.get(id) ?? id),
		})),
	};
}

/** Read a JSONL file into raw lines (empty when absent). */
async function jsonlLines(path: string): Promise<string[]> {
	const file = Bun.file(path);
	if (!(await file.exists())) {
		return [];
	}
	return (await file.text()).split('\n').filter((l) => l.trim() !== '');
}

/** Every patch id already committed anywhere under data/patches/. */
async function committedPatchIds(): Promise<string[]> {
	const ids: string[] = [];
	const files = ['data/patches/pilot/patches.jsonl'];
	if (existsSync(TRANCHES_DIR)) {
		const glob = new Bun.Glob('*/patches.jsonl');
		for await (const hit of glob.scan({ cwd: TRANCHES_DIR })) {
			files.push(`${TRANCHES_DIR}/${hit}`);
		}
	}
	for (const path of files) {
		for (const line of await jsonlLines(path)) {
			const raw = JSON.parse(line) as { id?: string };
			if (typeof raw.id === 'string') {
				ids.push(raw.id);
			}
		}
	}
	return ids;
}

/** The full corpus in pre-patch state, keyed by rid. */
async function loadPrePatchCorpus(): Promise<Map<string, SourceEntry>> {
	const entries = new Map<string, SourceEntry>();
	for await (const entry of readSourceEntries(SOURCE)) {
		entries.set(entry.rid, applyRepairs(entry).entry);
	}
	return entries;
}

/** The first tranche with pending chunks, its checkpoint, and its
 * pending list. */
async function nextWork(rids: readonly string[]): Promise<{
	pending: Chunk[];
	tranche: Tranche;
}> {
	const fingerprint = corpusFingerprint([...rids].sort());
	const tranches = buildTranches(chunkCorpus(rids));
	for (const tranche of tranches) {
		const checkpoint =
			(await loadCheckpoint(tranche.id)) ??
			buildCheckpoint(tranche, fingerprint);
		const pending = pendingChunks(tranche, checkpoint, fingerprint);
		if (pending.length > 0) {
			return { pending, tranche };
		}
	}
	throw new Error('no pending chunks — the corpus sweep is complete');
}

async function prep(workdir: string, count: number): Promise<void> {
	const pin = (await Bun.file(SNAPSHOT_LOCK).text()).split('\n')[0]?.trim();
	const entries = await loadPrePatchCorpus();
	const abbrevTable = buildAbbrevTable(entries.values());
	const headwordIndex = buildHeadwordIndex(entries.values());
	const { pending, tranche } = await nextWork([...entries.keys()]);
	const batch = pending.slice(0, count);
	for (const chunk of batch) {
		const chunkEntries = chunk.rids.map((rid) => entries.get(rid));
		const hints: Record<string, AnomalyHint[]> = {};
		for (const rid of chunk.rids) {
			const entryHints = entryAnomalyHints(
				entries.get(rid) as SourceEntry,
				abbrevTable,
				headwordIndex,
			);
			if (entryHints.length > 0) {
				hints[rid] = entryHints;
			}
		}
		await Bun.write(
			`${workdir}/inputs/${chunk.id}.json`,
			JSON.stringify(
				{
					anomaly_hints: hints,
					chunkId: chunk.id,
					entries: chunkEntries,
					pin,
					promptVersion: PROMPT_VERSION,
					sense_index: Object.fromEntries(
						chunk.rids.map((rid) => [
							rid,
							senseIndex(entries.get(rid) as SourceEntry),
						]),
					),
					tranche: tranche.id,
				},
				null,
				'\t',
			),
		);
		console.log(
			`${chunk.id} (${tranche.id}): ${chunk.rids[0]}..${chunk.rids.at(-1)}`,
		);
	}
	console.log(
		`prepared ${batch.length} chunk(s); ${pending.length - batch.length} more pending in ${tranche.id}`,
	);
}

async function ingest(workdir: string): Promise<void> {
	const entries = await loadPrePatchCorpus();
	const rids = [...entries.keys()];
	const fingerprint = corpusFingerprint([...rids].sort());
	const tranches = buildTranches(chunkCorpus(rids));
	let after = maxPatchNumber(await committedPatchIds());
	const accepted: SemanticPatch[] = [];
	const records: EntryResult[] = [];
	const rejects: RejectRecord[] = [];
	const done = new Map<string, string[]>();
	const glob = new Bun.Glob('chunk-*.json');
	const inputFiles = [];
	for await (const hit of glob.scan({ cwd: `${workdir}/inputs` })) {
		inputFiles.push(hit);
	}
	for (const name of inputFiles.sort()) {
		const input = (await Bun.file(`${workdir}/inputs/${name}`).json()) as {
			chunkId: string;
			entries: SourceEntry[];
			pin: string;
			promptVersion: string;
			tranche: string;
		};
		const patchesFile = Bun.file(
			`${workdir}/out/${input.chunkId}.patches.jsonl`,
		);
		const manifestFile = Bun.file(
			`${workdir}/out/${input.chunkId}.manifest.jsonl`,
		);
		if (!((await patchesFile.exists()) && (await manifestFile.exists()))) {
			console.log(`SKIP ${input.chunkId}: missing agent output`);
			continue;
		}
		const result = ingestChunk(
			{
				chunkId: input.chunkId,
				manifestText: await manifestFile.text(),
				patchesText: await patchesFile.text(),
			},
			{
				entries: new Map(input.entries.map((e) => [e.rid, e])),
				pin: input.pin,
				promptVersion: input.promptVersion,
				rids: input.entries.map((e) => e.rid),
			},
		);
		if (result.problems.length > 0) {
			console.log(`FATAL ${input.chunkId} (stays pending):`);
			for (const p of result.problems) {
				console.log(`  ${p}`);
			}
			continue;
		}
		const renumbered = renumber(result, after);
		after = renumbered.next;
		accepted.push(...renumbered.patches);
		records.push(...renumbered.records);
		rejects.push(...result.rejects);
		const list = done.get(input.tranche) ?? [];
		list.push(input.chunkId);
		done.set(input.tranche, list);
		console.log(
			`${input.chunkId}: accepted=${renumbered.patches.length} rejects=${result.rejects.length}`,
		);
	}
	// Accumulate per tranche and mark chunks complete.
	for (const [trancheId, chunkIds] of done) {
		const dir = `${TRANCHES_DIR}/${trancheId}`;
		const append = async (
			file: string,
			lines: readonly unknown[],
		): Promise<void> => {
			const path = `${dir}/${file}`;
			const existing = await jsonlLines(path);
			const all = [...existing, ...lines.map((v) => JSON.stringify(v))];
			await Bun.write(path, all.length > 0 ? `${all.join('\n')}\n` : '');
		};
		await append(
			'patches.jsonl',
			accepted.filter((p) => chunkIds.some((c) => inChunk(tranches, c, p.rid))),
		);
		await append(
			'manifest.jsonl',
			records.filter((r) => chunkIds.some((c) => inChunk(tranches, c, r.rid))),
		);
		await append('rejects.jsonl', rejects);
		const tranche = tranches.find((t) => t.id === trancheId);
		if (tranche === undefined) {
			throw new Error(`unknown tranche ${trancheId}`);
		}
		let checkpoint =
			(await loadCheckpoint(trancheId)) ??
			buildCheckpoint(tranche, fingerprint);
		for (const chunkId of chunkIds) {
			checkpoint = markComplete(checkpoint, chunkId);
		}
		await saveCheckpoint(checkpoint);
		console.log(
			`${trancheId}: +${chunkIds.length} chunk(s) complete (${checkpoint.completed.length}/${tranche.chunks.length})`,
		);
	}
	// Verification sample over this batch's output only.
	const sample = selectSample(records, accepted, SAMPLE_CONFIG);
	const byRid = new Map(
		accepted.map((p) => [p.rid, accepted.filter((q) => q.rid === p.rid)]),
	);
	await Bun.write(
		`${workdir}/sample-patches.json`,
		JSON.stringify(
			[...sample.lowMed, ...sample.high].map((p) => ({
				chain: byRid.get(p.rid) ?? [],
				entry: entries.get(p.rid),
				patchUnderReview: p.id,
			})),
			null,
			'\t',
		),
	);
	await Bun.write(
		`${workdir}/sample-clean.json`,
		JSON.stringify(
			sample.clean.map((rid) => ({ entry: entries.get(rid) })),
			null,
			'\t',
		),
	);
	console.log(
		`SAMPLE lowMed=${sample.lowMed.length} high=${sample.high.length} clean=${sample.clean.length} — thresholds error≤${THRESHOLDS.errorRate * 100}% miss≤${THRESHOLDS.missRate * 100}%`,
	);
}

/** Whether a rid belongs to a chunk id under the current corpus
 * chunking. */
function inChunk(
	tranches: readonly Tranche[],
	chunkId: string,
	rid: string,
): boolean {
	for (const tranche of tranches) {
		for (const chunk of tranche.chunks) {
			if (chunk.id === chunkId) {
				return chunk.rids.includes(rid);
			}
		}
	}
	return false;
}

if (import.meta.main) {
	const [mode, workdir, countArg] = process.argv.slice(2);
	if (mode === 'prep' && workdir !== undefined) {
		await prep(workdir, Number(countArg ?? 25));
	} else if (mode === 'ingest' && workdir !== undefined) {
		await ingest(workdir);
	} else {
		console.error(
			'usage: tranche.ts prep <workdir> [count] | tranche.ts ingest <workdir>',
		);
		process.exit(1);
	}
}

export { maxPatchNumber, renumber, SAMPLE_CONFIG, senseIndex, THRESHOLDS };
