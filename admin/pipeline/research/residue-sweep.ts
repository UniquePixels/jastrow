/**
 * The population phase 2.3 item 3 sweeps, and the corpus state it is
 * swept in (sweep tiering spec §4 Phase 2.3, "one targeted Opus pass
 * over the judgment residue only").
 *
 * ## Why this is not `tranche.ts prep`
 *
 * The batch path chunks the WHOLE corpus from `loadPrePatchCorpus()`
 * — source plus `applyRepairs`, and no transforms. Both halves are
 * wrong for 2.3:
 *
 * 1. **Population.** 2.3 sweeps the residue, not the corpus. The
 *    batch path would hand agents 1,084 chunks of which roughly one
 *    entry in eight carries a hint.
 * 2. **Corpus state.** The committed phase manifest
 *    (`patch/apply.ts`) is `text-repairs` -> `structural-repairs` ->
 *    `patch-apply`, so a patch lands on text the 54 transform rules
 *    have ALREADY rewritten. An agent reading pre-transform text
 *    authors against a string that does not exist at apply time, and
 *    re-reports defects the rules have already fixed.
 *
 * The second one is the load-bearing difference and it is measured.
 * State the predicate, because two readings of "touched" disagree:
 * **2,137 sweep entries produce a transform record, and 2,093 of
 * them — 52.6% of the population — come out with different bytes.**
 * The other 44 record a claim that changes nothing a reader sees.
 * 2,093 is the number the gate pins, because the question it answers
 * is how much of the population an agent would READ differently.
 *
 * When batches 01 and 02 ran that overlap was near zero, because the
 * rules did not exist yet — which is why the batch path could read
 * PRE and be right, and why it stopped being right without anyone
 * changing it.
 *
 * **The sweep prompt has always said so.** `sweep-v5.md`'s Input
 * table describes the chunk as
 *
 * > 20–40 full `SourceEntry` records, in the exact byte state the
 * > patch-apply phase will see (after the pipeline's deterministic
 * > text/structural passes)
 *
 * so this module does not change the contract — it makes the code
 * meet the one already written down. `prep` has been violating it
 * silently since the first transform rule shipped.
 *
 * ## What `healedCorpus()` is
 *
 * `applyRepairs` then both transform phases in `migrate-dry`'s order
 * — the same composition `residue.ts` calls POST, so the population
 * this module chunks is the population that script reports. Running
 * the phases in the other order measures a pipeline that does not
 * exist.
 *
 * ## The exclusion list
 *
 * 2.3's three items partition the residue. Items 1 and 2 were
 * adjudicated by hand and are reported in
 * `docs/v2/phase-2-created-hints.md` and
 * `docs/v2/phase-2-roman-numerals.md`; item 3 is everything else.
 * `ADJUDICATED` is frozen here rather than recomputed because it
 * records a historical fact — these 65 entries were read on
 * 2026-09-03 — and a computed set would silently move the day a rule
 * changes. `residue-sweep.corpus.test.ts` re-derives it and fails on
 * drift, which is the only thing that keeps a frozen list honest.
 */
import { applyRepairs } from '../body/repairs.ts';
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry } from '../body/types.ts';
import { applyTransforms } from '../transform/run.ts';
import { buildAbbrevTable, entryAnomalyHints } from './anomalies.ts';
import {
	buildTranches,
	byCodeUnit,
	CHUNK_SIZE,
	type Chunk,
	chunkCorpus,
	corpusFingerprint,
	TRANCHE_SIZE,
	type Tranche,
} from './chunks.ts';
import { buildHeadwordIndex } from './headword-index.ts';
import { buildHebrewTable } from './hebrew-anomalies.ts';

const SOURCE = 'data/source/jastrow-dictionary.jsonl';

/** Id prefixes for this population. They keep the `chunk-`/`tranche-`
 * stem `ingest`'s glob and the checkpoint directory expect, and the
 * `r` is what stops `chunk-r00001` from colliding with the batch
 * path's `chunk-00001`, which names a different rid set. */
const RESIDUE_CHUNK_PREFIX = 'chunk-r';
const RESIDUE_TRANCHE_PREFIX = 'residue-';

/** The 65 residue entries items 1 and 2 already adjudicated: 35
 * carrying a hint the rules created, 31 carrying
 * `roman-numeral-display`, overlapping at I00311 (35 + 31 - 1 = 65).
 *
 * Frozen, and re-derived by the corpus gate. Sweeping them again
 * would spend Opus on 65 entries whose disposition is written down,
 * and would invite an agent to contradict a documented judgment. */
const ADJUDICATED: readonly string[] = [
	'A00717',
	'A00722',
	'A00907',
	'A01133',
	'A01250',
	'A01451',
	'A01465',
	'A01548',
	'A01619',
	'A01672',
	'A01839',
	'A01904',
	'A01947',
	'A02145',
	'A03060',
	'A03097',
	'B00289',
	'B00404',
	'B00906',
	'B01005',
	'B01137',
	'C00016',
	'C00641',
	'C00746',
	'C00792',
	'C00870',
	'C01276',
	'C01403',
	'D00461',
	'D00471',
	'E00341',
	'E00772',
	'E00833',
	'G00268',
	'G00549',
	'H00091',
	'H00254',
	'H00509',
	'H00582',
	'H00843',
	'I00311',
	'I00606',
	'K00110',
	'K00566',
	'L00086',
	'M00044',
	'M01154',
	'M01883',
	'M02495',
	'M02913',
	'O00026',
	'O01073',
	'O01354',
	'P00569',
	'Q01046',
	'Q01117',
	'Q01652',
	'S00114',
	'S01082',
	'S01668',
	'T00173',
	'U00776',
	'U01065',
	'V00586',
	'V00652',
];

/** The three corpus-wide comparison tables, built from ONE corpus
 * state. Each is a frequency comparison across every entry, so tables
 * built from a subset would judge an entry against a different
 * population than the detector does. */
interface Tables {
	abbrev: ReturnType<typeof buildAbbrevTable>;
	hebrew: ReturnType<typeof buildHebrewTable>;
	index: ReturnType<typeof buildHeadwordIndex>;
}

function buildTables(entries: readonly SourceEntry[]): Tables {
	return {
		abbrev: buildAbbrevTable(entries.values()),
		hebrew: buildHebrewTable(entries.values()),
		index: buildHeadwordIndex(entries.values()),
	};
}

/** The corpus in the state a patch is applied to: `applyRepairs`,
 * then `text-repairs`, then `structural-repairs`. Keyed by rid and
 * insertion-ordered by the source file, like `loadPrePatchCorpus`. */
async function healedCorpus(): Promise<Map<string, SourceEntry>> {
	const entries = new Map<string, SourceEntry>();
	for await (const source of readSourceEntries(SOURCE)) {
		const repaired = applyRepairs(source).entry;
		const text = applyTransforms(repaired, 'text-repairs').entry;
		entries.set(source.rid, applyTransforms(text, 'structural-repairs').entry);
	}
	return entries;
}

/** Every rid the detector still flags in the healed corpus — the
 * residue itself, before item 1 and item 2 are taken out of it. */
function residueRids(
	corpus: Map<string, SourceEntry>,
	tables: Tables,
): string[] {
	const rids: string[] = [];
	for (const entry of corpus.values()) {
		const hints = entryAnomalyHints(
			entry,
			tables.abbrev,
			tables.index,
			tables.hebrew,
		);
		if (hints.length > 0) {
			rids.push(entry.rid);
		}
	}
	return rids.sort(byCodeUnit);
}

/** The residue minus the entries items 1 and 2 adjudicated: item 3's
 * population. Throws when the frozen list names a rid the residue
 * does not contain, because that means the exclusion is silently
 * removing nothing and the gate below has stopped being able to
 * fail. */
function sweepRids(residue: readonly string[]): string[] {
	const inResidue = new Set(residue);
	const missing = ADJUDICATED.filter((rid) => !inResidue.has(rid));
	if (missing.length > 0) {
		throw new Error(
			`ADJUDICATED names ${missing.length} rid(s) absent from the residue (${missing.join(', ')}) — items 1 and 2 were adjudicated against a different corpus state; re-derive before sweeping`,
		);
	}
	const excluded = new Set(ADJUDICATED);
	return residue.filter((rid) => !excluded.has(rid));
}

/** One population's chunking, with the fingerprint its checkpoints
 * pin. Returned together because a checkpoint carries the fingerprint
 * of the rid list it was cut from, and the residue's list is not the
 * corpus's — resolving a residue tranche against the corpus
 * fingerprint would reject every resume. */
interface TrancheSet {
	fingerprint: string;
	tranches: Tranche[];
}

/** Cut the sweep population into chunks and tranches under this
 * module's own id prefixes. */
function residueTranches(rids: readonly string[]): TrancheSet {
	const chunks: Chunk[] = chunkCorpus(rids, CHUNK_SIZE, RESIDUE_CHUNK_PREFIX);
	return {
		fingerprint: corpusFingerprint(rids),
		tranches: buildTranches(chunks, TRANCHE_SIZE, RESIDUE_TRANCHE_PREFIX),
	};
}

/** Whether a tranche id belongs to this population. `ingest` reads
 * the id out of a chunk input written by whichever prep path built
 * it, so this is how it tells which chunking to resolve against. */
function isResidueTranche(trancheId: string): boolean {
	return trancheId.startsWith(RESIDUE_TRANCHE_PREFIX);
}

export type { Tables, TrancheSet };
export {
	ADJUDICATED,
	buildTables,
	healedCorpus,
	isResidueTranche,
	RESIDUE_CHUNK_PREFIX,
	RESIDUE_TRANCHE_PREFIX,
	residueRids,
	residueTranches,
	sweepRids,
};
