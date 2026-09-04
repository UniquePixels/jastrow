/**
 * Corpus gates for phase 2.3 item 3's population.
 *
 * Two of these are the reason the module exists, and each is written
 * so it can fail:
 *
 * - **`ADJUDICATED` re-derives.** The frozen 65 are re-computed from
 *   the detector rather than restated, so the day a rule moves one of
 *   them out of the residue this fails instead of silently excluding
 *   an entry that is no longer there.
 * - **Healed is not pre-patch.** `healedCorpus()` reverting to
 *   `loadPrePatchCorpus()` is the exact regression this whole change
 *   exists to prevent, and it would be invisible to every other gate:
 *   the chunk inputs would still be well-formed, the ids would still
 *   be right, and the agents would author against text that does not
 *   exist at apply time. The gate pins the number of sweep entries
 *   the transforms actually move.
 *
 * `healedCorpus()` reads the snapshot itself — it is the function
 * under test, not a stage this file is composing. The comparison side
 * comes from `corpus-fixture.ts` as the tier requires.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import {
	composedEntries,
	repairedEntries,
} from '../transform/rules/corpus-fixture.ts';
import { applyTransforms } from '../transform/run.ts';
import { type AnomalyHint, entryAnomalyHints } from './anomalies.ts';
import { byCodeUnit } from './chunks.ts';
import { LINK_KINDS } from './link-anomalies.ts';
import {
	ADJUDICATED,
	buildTables,
	healedCorpus,
	residueRids,
	residueTranches,
	sweepRids,
} from './residue-sweep.ts';

/** The population figures this change was scoped against, measured on
 * `v2` at f668102. A move in any of them is a real change to what
 * item 3 sweeps and must be read, not re-baselined. */
const RESIDUE: number = 4047;
const ADJUDICATED_COUNT: number = 65;
const SWEEP: number = RESIDUE - ADJUDICATED_COUNT;
/** Sweep entries whose TEXT a transform rewrote — 52.6%.
 *
 * The predicate is byte difference, not "a rule fired": 2,137 sweep
 * entries produce a transform record and **2,093 of them come out
 * different**, the other 44 recording a claim that changes nothing a
 * reader or an agent could see. The bytes are what matters here,
 * because the question this number answers is how much of the
 * population an agent would read differently. */
const TOUCHED: number = 2093;

/** One healed corpus, its tables and its sweep list, built once for
 * the whole file, **from the production function**.
 *
 * The tier's rule is that a corpus file takes its stages from
 * `corpus-fixture.ts` rather than re-reading the 41MB snapshot, and
 * this file is the justified exception: `healedCorpus()` IS the
 * subject, and it is what `prep-residue` calls to build every chunk
 * input.
 *
 * A first draft composed the stage here from `composedEntries()` and
 * added a gate comparing the two. This version replaced it **for the
 * design reason only, not a cost one**: there, every other gate in
 * the file tested a private reimplementation rather than the shipped
 * function. The two cost the same in the tier — each pays exactly one
 * extra read of the snapshot, the draft in its comparison gate and
 * this one in its memo. A standalone run makes the draft look 130s to
 * this one's 97s, but that gap is the shared fixture being cold, and
 * in the tier it is already warm.
 *
 * Stage costs on `v2` at f668102: `healedCorpus()` **97.2s**,
 * `buildTables` 1.3s, `residueRids` 4.6s — the snapshot read
 * dominates and the detector passes are noise beside it.
 *
 * The tier's own numbers, same machine, same session: 380 tests /
 * 506.9s without this file, 387 / 637.4s and 387 / 702.7s with it.
 * **Do not read a delta off those.** The commutation gate does
 * identical work in all three and moved 88.2s -> 90.9s -> 94.4s
 * across them, so the run-to-run noise is ~7% and swamps the
 * difference between the two designs. See the sibling lesson in
 * `feedback_one_ci_run_is_not_a_ratio`: this file costs roughly one
 * snapshot read, and that is the honest statement of it. */
interface Healed {
	corpus: Map<string, SourceEntry>;
	rids: string[];
	tables: ReturnType<typeof buildTables>;
}

let healedMemo: Promise<Healed> | undefined;

async function buildHealed(): Promise<Healed> {
	const corpus = await healedCorpus();
	const tables = buildTables([...corpus.values()]);
	return { corpus, rids: sweepRids(residueRids(corpus, tables)), tables };
}

function healed(): Promise<Healed> {
	healedMemo ??= buildHealed();
	return healedMemo;
}

const hintKey = (hint: AnomalyHint): string => `${hint.kind}|${hint.detail}`;
const kindOf = (key: string): string => key.slice(0, key.indexOf('|'));

function measure(
	corpus: readonly SourceEntry[],
	tables: ReturnType<typeof buildTables>,
): Map<string, Set<string>> {
	const out = new Map<string, Set<string>>();
	for (const entry of corpus) {
		const hints = entryAnomalyHints(
			entry,
			tables.abbrev,
			tables.index,
			tables.hebrew,
		);
		if (hints.length > 0) {
			out.set(entry.rid, new Set(hints.map(hintKey)));
		}
	}
	return out;
}

/** Hints present in `b` and absent from `a`, per rid. */
function gains(
	a: Map<string, Set<string>>,
	b: Map<string, Set<string>>,
): Map<string, string[]> {
	const out = new Map<string, string[]>();
	for (const [rid, keys] of b) {
		const had = a.get(rid) ?? new Set<string>();
		const gained = [...keys].filter((k) => !had.has(k));
		if (gained.length > 0) {
			out.set(rid, gained);
		}
	}
	return out;
}

describe('the sweep population', () => {
	// Carries the file's cold-start cost: the first `healed()` builds
	// the stage and its three corpus-wide tables. Everything after it
	// rides the memo.
	it('is the residue minus the adjudicated, and both numbers hold', async () => {
		const { corpus, rids, tables } = await healed();
		expect(residueRids(corpus, tables).length).toBe(RESIDUE);
		expect(rids.length).toBe(SWEEP);
	}, 180_000);

	it('carries a hint on every entry — no chunk is empty work', async () => {
		const { corpus, rids, tables } = await healed();
		const hintless = rids.filter(
			(rid) =>
				entryAnomalyHints(
					corpus.get(rid) as SourceEntry,
					tables.abbrev,
					tables.index,
					tables.hebrew,
				).length === 0,
		);
		expect(hintless).toEqual([]);
	});

	it('contains no entry items 1 and 2 already adjudicated', async () => {
		const sweep = new Set((await healed()).rids);
		expect(ADJUDICATED.filter((rid) => sweep.has(rid))).toEqual([]);
	});

	it('chunks into whole tranches that cover it exactly once', async () => {
		const { rids } = await healed();
		const { tranches } = residueTranches(rids);
		const covered = tranches.flatMap((t) => t.chunks.flatMap((c) => c.rids));
		expect(covered.length).toBe(rids.length);
		expect(new Set(covered).size).toBe(rids.length);
		expect([...covered].sort(byCodeUnit)).toEqual(rids);
	});
});

describe('HEALED IS NOT PRE-PATCH — the regression this module exists to prevent', () => {
	it('rewrites 2,093 of the sweep entries, so a revert to pre-patch cannot pass', async () => {
		const { corpus, rids } = await healed();
		const pre = new Map(
			(await repairedEntries()).map((e) => [e.rid, JSON.stringify(e)]),
		);
		const moved = rids.filter(
			(rid) => pre.get(rid) !== JSON.stringify(corpus.get(rid)),
		);
		expect(moved.length).toBe(TOUCHED);
	});

	// The composition itself, against the shared fixture's stages. The
	// memo above IS `healedCorpus()`, so this is what says that
	// function is repairs + text-repairs + structural-repairs and not
	// some other pipeline — without it, `healedCorpus()` could compose
	// the wrong phases and every gate here would agree with it.
	// `composedEntries()` is memoised across the tier, so the only new
	// work is the last phase.
	it('healedCorpus() is repairs + both phases, in migrate-dry order', async () => {
		const { corpus } = await healed();
		const expected = new Map(
			(await composedEntries()).map((e) => [
				e.rid,
				JSON.stringify(applyTransforms(e, 'structural-repairs').entry),
			]),
		);
		expect(corpus.size).toBe(expected.size);
		const wrong = [...corpus].filter(
			([rid, entry]) => expected.get(rid) !== JSON.stringify(entry),
		);
		expect(wrong.map(([rid]) => rid)).toEqual([]);
	}, 120_000);
});

describe('ADJUDICATED re-derives from the detector', () => {
	it('is exactly the 35 created-hint entries union the 31 roman ones', async () => {
		// The POST side is the memo's — rebuilding it here would be
		// three more corpus-wide table passes for an identical result,
		// on a tier already close to the runner wall.
		const { corpus, tables: postTables } = await healed();
		const post = [...corpus.values()];
		const pre = [...(await repairedEntries())];
		const preTables = buildTables(pre);
		const before = measure(pre, preTables);
		const fixed = measure(post, preTables);
		const after = measure(post, postTables);

		// Item 1: hints the rules created. Two readings, because the
		// fixed-table one cannot see a link hint a headword repair
		// creates — the argument is in phase-2-created-hints.md.
		const item1 = new Set(gains(before, fixed).keys());
		const linkKinds = new Set<string>(LINK_KINDS);
		for (const [rid, keys] of gains(before, after)) {
			if (keys.some((k) => linkKinds.has(kindOf(k)))) {
				item1.add(rid);
			}
		}
		// Item 2: every entry still carrying roman-numeral-display.
		const item2 = new Set<string>();
		for (const [rid, keys] of after) {
			if ([...keys].some((k) => kindOf(k) === 'roman-numeral-display')) {
				item2.add(rid);
			}
		}
		expect(item1.size).toBe(35);
		expect(item2.size).toBe(31);
		expect([...new Set([...item1, ...item2])].sort(byCodeUnit)).toEqual([
			...ADJUDICATED,
		]);
	}, 180_000);
});
