#!/usr/bin/env bun
/**
 * Stratified discovery sampler (sweep tiering spec Phase 1.2).
 *
 * Everything swept before 2026-08-17 sits inside rid letter A — 5.3%
 * of the corpus, 49% of one letter — so pattern discovery to date is
 * biased to a single alphabetic region. A round is one chunk per rid
 * letter: 22 chunks, 660 entries, spread across the whole dictionary.
 *
 *   bun admin/pipeline/research/sample.ts <workdir> <round>
 *
 * Selection is a pure function of (chunks, completed, round), so a
 * round is reproducible and re-runnable.
 */
import process from 'node:process';
import type { SourceEntry } from '../body/types.ts';
import {
	type AnomalyHint,
	buildAbbrevTable,
	entryAnomalyHints,
} from './anomalies.ts';
import type { Chunk } from './chunks.ts';
import { chunkCorpus, loadCheckpoint } from './chunks.ts';
import {
	buildChunkInput,
	loadPrePatchCorpus,
	writeChunkInput,
} from './corpus-inputs.ts';
import { buildHeadwordIndex } from './headword-index.ts';
import { buildHebrewTable } from './hebrew-anomalies.ts';

const SNAPSHOT_LOCK = 'data/patches/snapshot.lock';
const PROMPT_VERSION = 'v4';
/** Fixed so a round is reproducible; changing it reshuffles history. */
const SEED = 20_260_817;
/** Mersenne prime modulus — keeps the hash inside a safe integer and
 * avoids bitwise operators (biome `noBitwiseOperators`). */
const MODULUS = 2_147_483_647;

/** Deterministic non-negative hash of a key. */
function hash(key: string): number {
	let h = SEED % MODULUS;
	for (const ch of key) {
		h = (h * 31 + (ch.codePointAt(0) ?? 0)) % MODULUS;
	}
	return h;
}

/** One unswept chunk per rid letter for `round`. Letters whose chunks
 * are all complete are skipped. */
function stratifiedRound(
	chunks: readonly Chunk[],
	completed: ReadonlySet<string>,
	round: number,
): Chunk[] {
	const byLetter = new Map<string, Chunk[]>();
	for (const chunk of chunks) {
		if (completed.has(chunk.id)) {
			continue;
		}
		const letter = chunk.rids[0]?.[0];
		if (letter === undefined) {
			continue;
		}
		const group = byLetter.get(letter) ?? [];
		group.push(chunk);
		byLetter.set(letter, group);
	}
	const picked: Chunk[] = [];
	for (const [letter, group] of [...byLetter].sort(([a], [b]) =>
		a.localeCompare(b),
	)) {
		picked.push(group[hash(`${letter}:${round}`) % group.length] as Chunk);
	}
	return picked;
}

async function sample(workdir: string, round: number): Promise<void> {
	const pin = (await Bun.file(SNAPSHOT_LOCK).text()).split('\n')[0]?.trim();
	const entries = await loadPrePatchCorpus();
	const abbrevTable = buildAbbrevTable(entries.values());
	const headwordIndex = buildHeadwordIndex(entries.values());
	const hebrewTable = buildHebrewTable(entries.values());
	const chunks = chunkCorpus([...entries.keys()]);
	const checkpoint = await loadCheckpoint('tranche-01');
	const completed = new Set(checkpoint?.completed ?? []);
	const picked = stratifiedRound(chunks, completed, round);
	for (const chunk of picked) {
		const hints: Record<string, AnomalyHint[]> = {};
		for (const rid of chunk.rids) {
			const entryHints = entryAnomalyHints(
				entries.get(rid) as SourceEntry,
				abbrevTable,
				headwordIndex,
				hebrewTable,
			);
			if (entryHints.length > 0) {
				hints[rid] = entryHints;
			}
		}
		await writeChunkInput(
			workdir,
			buildChunkInput({
				chunk,
				entries,
				hints,
				pin: pin as string,
				promptVersion: PROMPT_VERSION,
				tranche: 'discovery',
			}),
		);
		console.log(`${chunk.id}: ${chunk.rids[0]}..${chunk.rids.at(-1)}`);
	}
	console.log(`round ${round}: ${picked.length} chunk(s) prepared`);
}

if (import.meta.main) {
	const [workdir, roundArg] = process.argv.slice(2);
	if (workdir === undefined || roundArg === undefined) {
		console.error('usage: sample.ts <workdir> <round>');
		process.exit(1);
	}
	await sample(workdir, Number(roundArg));
}

export { stratifiedRound };
