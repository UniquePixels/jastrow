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
 *   bun admin/pipeline/research/tranche.ts prep-residue <workdir> [count]
 *     The same, for phase 2.3 item 3: the population is the
 *     detector's residue minus the 65 entries items 1 and 2 already
 *     adjudicated, and the entries are written in HEALED state
 *     (repairs + both transform phases) rather than pre-patch.
 *     `residue-sweep.ts` argues why both differences are required.
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
import type { SourceEntry } from '../body/types.ts';
import { PATCH_ID, type SemanticPatch } from '../patch/schema.ts';
import { type AnomalyHint, entryAnomalyHints } from './anomalies.ts';
import {
	buildCheckpoint,
	buildTranches,
	byCodeUnit,
	type Chunk,
	chunkCorpus,
	corpusFingerprint,
	loadCheckpoint,
	markComplete,
	pendingChunks,
	saveCheckpoint,
	type Tranche,
} from './chunks.ts';
import {
	buildChunkInput,
	type CorpusStage,
	loadPrePatchCorpus,
	PROMPT_VERSION,
	senseIndex,
	writeChunkInput,
} from './corpus-inputs.ts';
import type { EntryResult } from './manifest.ts';
import {
	buildTables,
	healedCorpus,
	isResidueTranche,
	residueRids,
	residueTranches,
	sweepRids,
	type Tables,
	type TrancheSet,
} from './residue-sweep.ts';
import {
	type IngestResult,
	ingestChunk,
	type RejectRecord,
	selectSample,
} from './verify.ts';

const SNAPSHOT_LOCK = 'data/patches/snapshot.lock';
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

/** The first tranche of a chunking with pending chunks, its
 * checkpoint, and its pending list. Takes the tranches and their
 * fingerprint rather than the rids so both populations can use it:
 * a checkpoint pins the fingerprint of the rid list it was cut from,
 * and the residue's list is not the corpus's. */
async function nextPending(
	tranches: readonly Tranche[],
	fingerprint: string,
): Promise<{ pending: Chunk[]; tranche: Tranche }> {
	for (const tranche of tranches) {
		const checkpoint =
			(await loadCheckpoint(tranche.id)) ??
			buildCheckpoint(tranche, fingerprint);
		const pending = pendingChunks(tranche, checkpoint, fingerprint);
		if (pending.length > 0) {
			return { pending, tranche };
		}
	}
	throw new Error('no pending chunks — this population is fully swept');
}

/** The first tranche with pending chunks, its checkpoint, and its
 * pending list. */
async function nextWork(rids: readonly string[]): Promise<{
	pending: Chunk[];
	tranche: Tranche;
}> {
	return await nextPending(
		buildTranches(chunkCorpus(rids)),
		corpusFingerprint(rids),
	);
}

/** Write one batch of chunk inputs. Shared by both prep paths so the
 * two cannot drift in what an agent sees — the sweep prompt's Input
 * section is a contract, and the only thing the paths may differ on
 * is which corpus state and which population they were handed. */
async function writeChunks(args: {
	batch: readonly Chunk[];
	corpus: Map<string, SourceEntry>;
	corpusStage: CorpusStage;
	pin: string;
	tables: Tables;
	trancheId: string;
	workdir: string;
}): Promise<void> {
	for (const chunk of args.batch) {
		const hints: Record<string, AnomalyHint[]> = {};
		for (const rid of chunk.rids) {
			const entryHints = entryAnomalyHints(
				args.corpus.get(rid) as SourceEntry,
				args.tables.abbrev,
				args.tables.index,
				args.tables.hebrew,
			);
			if (entryHints.length > 0) {
				hints[rid] = entryHints;
			}
		}
		await writeChunkInput(
			args.workdir,
			buildChunkInput({
				chunk,
				corpusStage: args.corpusStage,
				entries: args.corpus,
				hints,
				pin: args.pin,
				promptVersion: PROMPT_VERSION,
				tranche: args.trancheId,
			}),
		);
		console.log(
			`${chunk.id} (${args.trancheId}): ${chunk.rids[0]}..${chunk.rids.at(-1)}`,
		);
	}
}

/** The snapshot pin every chunk input carries. */
async function readPin(): Promise<string> {
	return (await Bun.file(SNAPSHOT_LOCK).text())
		.split('\n')[0]
		?.trim() as string;
}

async function prep(workdir: string, count: number): Promise<void> {
	const pin = await readPin();
	const entries = await loadPrePatchCorpus();
	const tables = buildTables([...entries.values()]);
	const { pending, tranche } = await nextWork([...entries.keys()]);
	const batch = pending.slice(0, count);
	await writeChunks({
		batch,
		corpus: entries,
		corpusStage: 'pre-patch',
		pin,
		tables,
		trancheId: tranche.id,
		workdir,
	});
	console.log(
		`prepared ${batch.length} chunk(s); ${pending.length - batch.length} more pending in ${tranche.id}`,
	);
}

/** Phase 2.3 item 3's prep: the residue population, in healed state.
 * Everything that differs from `prep` is argued in
 * `residue-sweep.ts`; nothing here decides policy. */
async function prepResidue(workdir: string, count: number): Promise<void> {
	const pin = await readPin();
	const corpus = await healedCorpus();
	const tables = buildTables([...corpus.values()]);
	const residue = residueRids(corpus, tables);
	const rids = sweepRids(residue);
	const { fingerprint, tranches } = residueTranches(rids);
	console.log(
		`residue ${residue.length} entries; ${residue.length - rids.length} adjudicated and excluded; sweeping ${rids.length} in ${tranches.length} tranche(s)`,
	);
	const work = await nextPending(tranches, fingerprint);
	const batch = work.pending.slice(0, count);
	await writeChunks({
		batch,
		corpus,
		corpusStage: 'healed',
		pin,
		tables,
		trancheId: work.tranche.id,
		workdir,
	});
	console.log(
		`prepared ${batch.length} chunk(s); ${work.pending.length - batch.length} more pending in ${work.tranche.id}`,
	);
}

/** The residue population's chunking. Separate from the resolver so
 * the cost is visible: it reads the snapshot and runs both transform
 * phases, which an ingest of batch-path output must never pay. */
async function buildResidueSet(): Promise<TrancheSet> {
	const corpus = await healedCorpus();
	const tables = buildTables([...corpus.values()]);
	return residueTranches(sweepRids(residueRids(corpus, tables)));
}

/** Resolve a tranche id to the chunking and fingerprint of ITS
 * population, building each at most once.
 *
 * Two populations, two chunkings, two fingerprints. A residue
 * checkpoint pins the fingerprint of the RESIDUE rid list, so
 * resolving one against the corpus fingerprint would reject every
 * resume with "the corpus changed". The residue side is lazy for the
 * reason `buildResidueSet` gives. */
function trancheResolver(
	corpusRids: readonly string[],
): (trancheId: string) => Promise<TrancheSet> {
	const corpusSet: TrancheSet = {
		fingerprint: corpusFingerprint(corpusRids),
		tranches: buildTranches(chunkCorpus(corpusRids)),
	};
	let residueSet: TrancheSet | undefined;
	return async (trancheId: string): Promise<TrancheSet> => {
		if (!isResidueTranche(trancheId)) {
			return corpusSet;
		}
		residueSet ??= await buildResidueSet();
		return residueSet;
	};
}

/** Which population a tranche id belongs to. */
type Family = 'corpus' | 'residue';

/** The family of `trancheId`, refusing a workdir that has already
 * yielded the other one.
 *
 * `readEntries` is keyed by rid and every residue rid is also a
 * corpus rid, so a workdir carrying both prep paths would have the
 * two corpus states of one entry overwrite each other — silently, in
 * glob order, which puts `chunk-r00001` after `chunk-00001`. Refused
 * rather than disambiguated: a mixed workdir is an operating
 * mistake, and the RUNBOOK gives each batch its own. */
function familyOf(
	seen: Family | undefined,
	trancheId: string,
	chunkId: string,
	workdir: string,
): Family {
	const family: Family = isResidueTranche(trancheId) ? 'residue' : 'corpus';
	if (seen !== undefined && seen !== family) {
		throw new Error(
			`${workdir} mixes populations: ${chunkId} is ${family} and an earlier chunk was ${seen}. They are built from different corpus states, so one workdir must hold one of them — ingest them separately.`,
		);
	}
	return family;
}

/** Append this batch's accepted output to one tranche's files and
 * mark its chunks complete. */
async function accumulateTranche(args: {
	accepted: readonly SemanticPatch[];
	chunkIds: readonly string[];
	records: readonly EntryResult[];
	rejects: readonly RejectRecord[];
	set: TrancheSet;
	trancheId: string;
}): Promise<void> {
	const { fingerprint, tranches } = args.set;
	const dir = `${TRANCHES_DIR}/${args.trancheId}`;
	const mine = (rid: string): boolean =>
		args.chunkIds.some((c) => inChunk(tranches, c, rid));
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
		args.accepted.filter((p) => mine(p.rid)),
	);
	await append(
		'manifest.jsonl',
		args.records.filter((r) => mine(r.rid)),
	);
	await append(
		'rejects.jsonl',
		args.rejects.filter((r) => mine(r.rid)),
	);
	const tranche = tranches.find((t) => t.id === args.trancheId);
	if (tranche === undefined) {
		throw new Error(`unknown tranche ${args.trancheId}`);
	}
	let checkpoint =
		(await loadCheckpoint(args.trancheId)) ??
		buildCheckpoint(tranche, fingerprint);
	for (const chunkId of args.chunkIds) {
		checkpoint = markComplete(checkpoint, chunkId);
	}
	await saveCheckpoint(checkpoint);
	console.log(
		`${args.trancheId}: +${args.chunkIds.length} chunk(s) complete (${checkpoint.completed.length}/${tranche.chunks.length})`,
	);
}

async function ingest(workdir: string): Promise<void> {
	// Only the rid ORDER is wanted here — the corpus chunking and its
	// fingerprint. The entries an agent actually read come off the
	// chunk inputs (`readEntries` below), so nothing in this function
	// judges a patch against a re-derived corpus any more.
	const rids = [...(await loadPrePatchCorpus()).keys()];
	const setFor = trancheResolver(rids);
	let after = maxPatchNumber(await committedPatchIds());
	const accepted: SemanticPatch[] = [];
	const records: EntryResult[] = [];
	const rejects: RejectRecord[] = [];
	const done = new Map<string, string[]>();
	// The entries the AGENTS read, taken from the chunk inputs rather
	// than re-derived from the corpus. The verification sample below
	// shows a patch beside its entry, and a patch's `expected_before`
	// is byte-exact against the state its author was handed — which
	// for a residue chunk is the healed text, not the pre-patch text
	// `loadPrePatchCorpus()` returns. Reading them back off the input
	// is right for both paths and cannot drift from either.
	const readEntries = new Map<string, SourceEntry>();
	// ...and keyed by rid, which is only safe while one workdir holds
	// ONE population. Every residue rid is also a corpus rid, so a
	// workdir carrying both prep paths would have the two stages of the
	// same entry overwrite each other — silently, and in glob order,
	// which puts `chunk-r00001` after `chunk-00001`. Refused rather
	// than disambiguated: a mixed workdir is an operating mistake, and
	// the RUNBOOK gives each batch its own.
	let family: 'corpus' | 'residue' | undefined;
	// Chunks already marked complete must not be ingested twice: the
	// append below is unconditional, so a second run over the same
	// workdir would duplicate every accepted patch and manifest row.
	const completedByTranche = new Map<string, Set<string>>();
	const alreadyComplete = async (
		trancheId: string,
		chunkId: string,
	): Promise<boolean> => {
		let seen = completedByTranche.get(trancheId);
		if (seen === undefined) {
			seen = new Set((await loadCheckpoint(trancheId))?.completed ?? []);
			completedByTranche.set(trancheId, seen);
		}
		return seen.has(chunkId);
	};
	const glob = new Bun.Glob('chunk-*.json');
	const inputFiles: string[] = [];
	for await (const hit of glob.scan({ cwd: `${workdir}/inputs` })) {
		inputFiles.push(hit);
	}
	for (const name of inputFiles.sort(byCodeUnit)) {
		const input = (await Bun.file(`${workdir}/inputs/${name}`).json()) as {
			chunkId: string;
			entries: SourceEntry[];
			pin: string;
			promptVersion: string;
			tranche: string;
		};
		if (await alreadyComplete(input.tranche, input.chunkId)) {
			console.log(
				`SKIP ${input.chunkId}: already complete in ${input.tranche}`,
			);
			continue;
		}
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
		family = familyOf(family, input.tranche, input.chunkId, workdir);
		for (const entry of input.entries) {
			readEntries.set(entry.rid, entry);
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
		await accumulateTranche({
			accepted,
			chunkIds,
			records,
			rejects,
			set: await setFor(trancheId),
			trancheId,
		});
	}
	// Verification sample over this batch's output only.
	const sample = selectSample(records, accepted, SAMPLE_CONFIG);
	const files = sampleFiles(sample, accepted, readEntries);
	await Bun.write(
		`${workdir}/sample-patches.json`,
		JSON.stringify(files.patches, null, '\t'),
	);
	await Bun.write(
		`${workdir}/sample-clean.json`,
		JSON.stringify(files.clean, null, '\t'),
	);
	console.log(
		`SAMPLE lowMed=${sample.lowMed.length} high=${sample.high.length} clean=${sample.clean.length} — thresholds error≤${THRESHOLDS.errorRate * 100}% miss≤${THRESHOLDS.missRate * 100}%`,
	);
}

/** One row of `sample-patches.json`: a patch, the whole chain on its
 * entry, and the entry itself. */
interface SamplePatchRow {
	chain: SemanticPatch[];
	entry: SourceEntry | undefined;
	patchUnderReview: string;
}

/** The two verification sample files, built from `entries` — which
 * MUST be the entries the sweep agents were handed, not a corpus
 * re-derived here.
 *
 * A patch's `expected_before` is byte-exact against the state its
 * author read. For a residue chunk that is the healed text, and
 * 2,093 of those entries differ from the pre-patch corpus. Showing a
 * verifier the pre-patch entry beside a patch written against the
 * healed one makes every such patch look wrong, which would breach
 * the substantive-error gate (spec T2) on a batch that is fine.
 * Extracted from `ingest` so that property has somewhere to be
 * asserted. */
function sampleFiles(
	sample: ReturnType<typeof selectSample>,
	accepted: readonly SemanticPatch[],
	entries: ReadonlyMap<string, SourceEntry>,
): { clean: { entry: SourceEntry | undefined }[]; patches: SamplePatchRow[] } {
	const byRid = new Map<string, SemanticPatch[]>();
	for (const patch of accepted) {
		byRid.set(patch.rid, [...(byRid.get(patch.rid) ?? []), patch]);
	}
	return {
		clean: sample.clean.map((rid) => ({ entry: entries.get(rid) })),
		patches: [...sample.lowMed, ...sample.high].map((p) => ({
			chain: byRid.get(p.rid) ?? [],
			entry: entries.get(p.rid),
			patchUnderReview: p.id,
		})),
	};
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
	} else if (mode === 'prep-residue' && workdir !== undefined) {
		await prepResidue(workdir, Number(countArg ?? 25));
	} else if (mode === 'ingest' && workdir !== undefined) {
		await ingest(workdir);
	} else {
		console.error(
			'usage: tranche.ts prep <workdir> [count] | tranche.ts prep-residue <workdir> [count] | tranche.ts ingest <workdir>',
		);
		process.exit(1);
	}
}

// `senseIndex` is re-exported rather than forwarded with
// `export … from`. SonarCloud's S7763 asks for the forward and
// Biome's `noBarrelFile` refuses it; Biome is the enforced gate
// (`bun qa`), S7763 is a MINOR that does not move the quality gate,
// so the conflict resolves that way. Kept because `tranche.test.ts`
// imports it from here.
export {
	maxPatchNumber,
	renumber,
	SAMPLE_CONFIG,
	sampleFiles,
	senseIndex,
	THRESHOLDS,
};
