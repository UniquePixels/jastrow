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

/** The population figures this change was scoped against. A move in
 * any of them is a real change to what item 3 sweeps and must be
 * read, not re-baselined.
 *
 * Re-baselined ONCE, deliberately, on 2026-09-04: the
 * `alt_headwords` carve-out in link-anomalies.ts took
 * `one-consonant-diverge` from 817 entries to 750, and 57 residue
 * entries lost their only hint with it. Those hints were licensed by
 * sweep-v5 class 11 — the display is a spelling the target's own
 * entry records — so the sweep had been paying Opus to reject them
 * one at a time. Original figures, measured on `v2` at f668102:
 * RESIDUE 4047, ADJUDICATED 65, TOUCHED 2093.
 *
 * Re-baselined a THIRD time, 2026-09-05, for the new
 * `own-form-escape-link` rule (link-anomalies.ts). Previous figures:
 * RESIDUE 3552, TOUCHED 1825. The rule ADDS 205 entries whose only
 * hint is the new kind; none had been swept, which is tautological
 * rather than reassuring — an already-swept entry was already in the
 * residue, so its hints cannot be only the new kind. The audit that
 * matters is the adjudicated fixture below, not this count.
 *
 * Re-baselined a FOURTH time, 2026-09-05, for batch 05's two
 * headword-normalization fixes. Previous figure: RESIDUE 3757.
 *
 * The move is +2, and it is four entries, not two. Both residue
 * populations were computed from the production `residueRids` — one
 * in a worktree at the pre-fix commit, one here — and the rid sets
 * differenced, because a count cannot be differenced:
 *
 * - **B00443 LEFT.** The `own-form-escape-link` false positive the
 *   comma fix was aimed at. Its old hint text printed the bug in
 *   plain sight: `own inflected form of בִּזְיוּנָא ,`.
 * - **B00017, B00411 and B00457 ENTERED**, each on a NEW
 *   `exact-headword-diverge`: all three display `בְּזָא` and target
 *   `בְּזֵי`. They had **zero** hints before. `בְּזָא  I, II,` (B00407)
 *   used to base to itself, comma and all, so the display was never
 *   recognized as a headword and the rule could not fire.
 *
 * So a malformed base was BLINDING a detector, and the fix is worth
 * more than the false positive it was written for: -1 wrong hint,
 * +3 candidates nothing had ever been able to see. Whether those
 * three are real mislinks is the sweep's question, not this file's.
 *
 * Re-baselined a SECOND time, 2026-09-04, for the
 * `rare-dotted-variant` bare-word guard (`maxBareForRare`, see
 * anomalies.ts). Previous figures: RESIDUE 3838, TOUCHED 1988.
 *
 * The move was audited rather than accepted. Running `residueRids`
 * twice over one healed corpus — the old behaviour restored by
 * mutating `ABBREV_THRESHOLDS`, so both populations come from the
 * production code path — gives **288 dropped, 2 gained**, and
 * `rare-dotted-variant` was the ONLY hint kind any of the 288 had.
 * The guard removed exactly the class it was aimed at and nothing
 * else.
 *
 * What the dropouts are worth, measured against the four archived
 * manifests: 20 of the 288 have been swept at least once. 17 came
 * back `clean`; the other three (A00446, A01311, A01525) carry real
 * escalations that are **already recorded**, so no finding is lost by
 * dropping them. On that sample the class is ~85% clean, which is the
 * case for the guard.
 *
 * The cost is the other 268, which have never been swept. If the 15%
 * rate holds, roughly 40 of them hold something a sweep would have
 * found — not from the hint, which was wrong, but from an agent
 * reading the entry it bought a ticket into. That is a real loss and
 * it is the reason this comment exists: the entries are gone from the
 * population, not merely un-hinted. Separating "worth sweeping" from
 * "has a hint" would keep them, and would mean this file's
 * every-entry-carries-a-hint invariant no longer holds. */
const RESIDUE: number = 3759;
const ADJUDICATED_COUNT: number = 61;
const SWEEP: number = RESIDUE - ADJUDICATED_COUNT;
/** Sweep entries whose TEXT a transform rewrote — 52.7% of 3,696.
 *
 * The predicate is byte difference, not "a rule fired": 2,137 sweep
 * entries produce a transform record and **2,093 of them come out
 * different**, the other 44 recording a claim that changes nothing a
 * reader or an agent could see. The bytes are what matters here,
 * because the question this number answers is how much of the
 * population an agent would read differently. */
const TOUCHED: number = 1946;

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

/** The residue itself — before `sweepRids` takes the adjudicated out
 * of it. The re-derivation test needs the unfiltered set to ask
 * whether a derived rid is still flagged at all. */
async function residueOnly(): Promise<string[]> {
	const { corpus, tables } = await healed();
	return residueRids(corpus, tables);
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
		expect(residueRids(corpus, tables)).toHaveLength(RESIDUE);
		expect(rids).toHaveLength(SWEEP);
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
		expect(covered).toHaveLength(rids.length);
		expect(new Set(covered).size).toBe(rids.length);
		expect([...covered].sort(byCodeUnit)).toEqual(rids);
	});
});

describe('HEALED IS NOT PRE-PATCH — the regression this module exists to prevent', () => {
	it('rewrites 1,946 of the sweep entries, so a revert to pre-patch cannot pass', async () => {
		const { corpus, rids } = await healed();
		const pre = new Map(
			(await repairedEntries()).map((e) => [e.rid, JSON.stringify(e)]),
		);
		const moved = rids.filter(
			(rid) => pre.get(rid) !== JSON.stringify(corpus.get(rid)),
		);
		expect(moved).toHaveLength(TOUCHED);
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

/** Detector kinds that did not exist when phase 2.3 items 1 and 2 were
 * adjudicated (2026-09-03), and so cannot be part of re-deriving what
 * was adjudicated. `own-form-escape-link` shipped 2026-09-05 and added
 * 33 entries to item 1, doubling it to 66 — every one unadjudicated
 * and belonging IN the sweep, so counting them would have silently
 * excluded 33 entries nobody has read. */
const POST_ADJUDICATION = 'own-form-escape-link';

describe('ADJUDICATED re-derives from the detector', () => {
	it('is exactly the 33 created-hint entries union the 31 roman ones', async () => {
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
		// Both clauses read the kinds AS OF THE ADJUDICATION, so a
		// detector rule written afterwards cannot retroactively enlarge
		// what was adjudicated. See the note on `linkKinds` below.
		const item1 = new Set(
			[...gains(before, fixed)]
				.filter(([, keys]) => keys.some((k) => kindOf(k) !== POST_ADJUDICATION))
				.map(([rid]) => rid),
		);
		// The link kinds AS OF THE ADJUDICATION (phase 2.3 items 1 and
		// 2, 2026-09-03), not as of today. This clause asks which hints
		// the TRANSFORM RULES created, so a detector rule written after
		// the adjudication cannot have contributed to it — and the 61
		// entries ADJUDICATED excludes from the sweep were ruled on
		// without it. `own-form-escape-link` (2026-09-05) added 33
		// entries here and doubled item 1 to 66; every one of them is
		// unadjudicated and belongs IN the sweep, so excluding them
		// would have silently dropped 33 entries nobody has read.
		// A kind added to LINK_KINDS in future needs a deliberate
		// decision here, which is why this list is spelled out.
		const linkKinds = new Set<string>(
			LINK_KINDS.filter((k) => k !== POST_ADJUDICATION),
		);
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
		expect(item1.size).toBe(33);
		expect(item2.size).toBe(31);

		// The derivation and the exclusion list are computed against
		// DIFFERENT corpus states, and since 2026-09-04 they disagree
		// by exactly one entry. Item 1 asks "did the rules create this
		// hint", which it answers with the PRE-patch tables; the
		// residue asks "does the detector still flag this entry",
		// which `residueRids` answers with the HEALED ones. The
		// `alt_headwords` carve-out fires only on the healed side, so
		// `T00173` is derived here and is no longer in the residue.
		// ADJUDICATED excludes entries FROM THE SWEEP, so it carries
		// the intersection — an entry the sweep will never reach needs
		// no exclusion, and `sweepRids` throws if one lingers.
		//
		// Naming the straggler rather than filtering it silently is
		// the point: a second divergence fails this test.
		const derived = new Set([...item1, ...item2]);
		const inResidue = new Set(await residueOnly());
		const outsideResidue = [...derived]
			.filter((rid) => !inResidue.has(rid))
			.sort(byCodeUnit);
		expect(outsideResidue).toEqual(['A01672', 'T00173']);
		expect(
			[...derived].filter((rid) => inResidue.has(rid)).sort(byCodeUnit),
		).toEqual([...ADJUDICATED]);
	}, 180_000);
});

/** The adjudicated fixture for `own-form-escape-link`.
 *
 * 20 anchors from the inflection residue, read by two independent Opus
 * adjudicators on 2026-09-05, each verdict grounded in the target
 * entry's own corpus text (docs/v2/phase-2-inflection-gap.md). 10 are
 * real defects, 10 are correct links.
 *
 * This is the only gate on the rule that is not synthetic, and it is
 * IN-SAMPLE: the discriminator was derived from these same 20, so the
 * score below is a floor on how badly the rule can regress, not an
 * estimate of how it performs on unseen anchors. Nothing has measured
 * that yet. */
const ADJUDICATED_ANCHORS: readonly [string, string, boolean][] = [
	['A00277', 'אֵגוֹרִים', true],
	['B00178', 'בָּהוּל', true],
	['C00271', 'גּוּבֵּי', true],
	['C01262', 'גַּרְגְּרָנִיתָא', false],
	['H00109', 'חֲבֵרוֹת', false],
	['H01889', 'חֲתִימָתָא', true],
	['K00055', 'כִּבְשָׁא', false],
	['K01065', 'כְּפָתַיָּא', true],
	['M01430', 'מַכְסַנְיָיתָא', false],
	['M02523', 'מַרְגַּלְיָיתָא', false],
	['N00891', 'נמרין', false],
	['O01307', 'סְעָרִין', false],
	['P00877', 'עַמְרָא', false],
	['P01484', 'עֲשִׂירִיתָא', false],
	['Q01030', 'פַּלְטֵירִין', false],
	['S00652', 'קוּרְקְסַיָּא', true],
	['T00033', 'רִאשׁוֹנוֹת', true],
	['T00697', 'רִקּ', true],
	['U01134', 'שְׁכוּנָן', true],
	['U02037', 'שָׁרְשִׁין', true],
];

/** The three anchors the rule is KNOWN not to sort, each for a stated
 * reason. Pinned so that a change which fixes one, or breaks a fourth,
 * fails here instead of passing quietly. */
const KNOWN_FAILURES: ReadonlySet<string> = new Set([
	// Geresh display: `anchorHints` routes it to `abbrevHint`, and the
	// exemption is deliberate — the WRONG target רִיקּוּד records רִקּ׳
	// among its own forms, so the discriminator would answer
	// "recorded" and clear a real defect.
	'T00697',
	// The target records גּוֹבִי, which shares a skeleton with the
	// host's plural גּוּבֵּי while being a different word. The same
	// homograph collision as A02408; not decidable from letters.
	'C00271',
	// The host's own text says "(v. next w.)" and the link obeys it.
	// Correct, but for a reason in the HOST's prose that no comparison
	// of the two entries' forms can see.
	'M01430',
]);

describe('own-form-escape-link against the adjudicated 20', () => {
	it('reproduces every verdict it is known to be able to sort', async () => {
		const { corpus, tables } = await healed();
		const disagreed: string[] = [];
		let sorted = 0;
		for (const [rid, display, isDefect] of ADJUDICATED_ANCHORS) {
			const entry = corpus.get(rid);
			expect(entry).toBeDefined();
			const fired = entryAnomalyHints(
				entry as SourceEntry,
				tables.abbrev,
				tables.index,
				tables.hebrew,
			).some(
				(h) => h.kind === 'own-form-escape-link' && h.detail.includes(display),
			);
			if (KNOWN_FAILURES.has(rid)) {
				continue;
			}
			if (fired === isDefect) {
				sorted += 1;
			} else {
				disagreed.push(
					`${rid} '${display}' expected ${isDefect}, got ${fired}`,
				);
			}
		}
		expect(disagreed).toEqual([]);
		// Asserted, not inferred: a loop that silently matched nothing
		// would also produce an empty `disagreed`.
		expect(sorted).toBe(ADJUDICATED_ANCHORS.length - KNOWN_FAILURES.size);
	});

	it('still fails the three it is known to fail, for the stated reasons', async () => {
		const { corpus, tables } = await healed();
		for (const rid of KNOWN_FAILURES) {
			const row = ADJUDICATED_ANCHORS.find(([r]) => r === rid);
			expect(row).toBeDefined();
			const [, display, isDefect] = row as [string, string, boolean];
			const fired = entryAnomalyHints(
				corpus.get(rid) as SourceEntry,
				tables.abbrev,
				tables.index,
				tables.hebrew,
			).some(
				(h) => h.kind === 'own-form-escape-link' && h.detail.includes(display),
			);
			expect(fired).not.toBe(isDefect);
		}
	});
});
