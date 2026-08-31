/** Corpus tier — LINK INTEGRITY OF THE PIPELINE, not of a rule.
 *
 * Why this file exists, stated plainly because it is the lesson rather
 * than the code. Batch 3a's own census
 * (`transform/rules/gershayim.corpus.test.ts`) applies the rules to PRISTINE
 * source, which is the right way to measure a rule and the wrong way to
 * describe a pipeline: `migrate-dry` runs `applyRepairs` FIRST and
 * transforms on the healed entry. `migrate-dry` itself counts records
 * and never scores link resolution. So nothing in the suite ran the two
 * in sequence and asked whether links still resolved — and a
 * pre-existing repair (`repairs.ts`'s class-1 gershayim escape) turned
 * out to be repairing 22 of the same 90 anchors by writing `&quot;`
 * where the transform writes `״` — two spellings of one address, which
 * cost 22 cross-links and was found by reading one instance count in a
 * report at batch close. That escape is now retired (maintainer ruling
 * 2026-08-24) and this file is what would have caught it.
 *
 * What this DOES and does NOT cover, stated rather than implied,
 * because overclaiming a gate is the same error class as the one above.
 * The gained/lost arms are DIFFERENTIAL: both run `applyRepairs` and
 * every non-gershayim rule, so a change elsewhere in either layer
 * appears on both sides and CANCELS. What the differential catches is
 * anything that interferes with the withheld pair — another layer
 * consuming its population, moving its targets, or moving the headwords
 * its targets point at. That is exactly the collision above, and it is
 * a narrow window.
 *
 * The ABSOLUTE pin below is what widens it: `after` must hold exactly
 * 71,385 resolving Jastrow targets. Any change in any layer that moves
 * the corpus-wide total fails there instead, at no extra runtime. A new
 * unlink rule will move it legitimately — update the number WITH the
 * measurement that justifies it, never to make a red test green.
 *
 * MOVED 2026-08-26 (batch 4), 72,593 -> 71,383, and this is that
 * clause being used for the first time. Batch 4 registered two unlink
 * rules — `nonsense-dup-anchor` and
 * `nested-anchor-swallows-punctuation` — which drop the OUTER layer of
 * a doubled anchor whose two layers share one target. Measured on the
 * pipeline, withholding those two rules and nothing else:
 *
 *   anchors corpus-wide            169,285 -> 168,055   (-1,230)
 *   resolving Jastrow targets       72,593 ->  71,383   (-1,210)
 *   DISTINCT (rid, data-ref) pairs 160,239 -> 160,239   (       0)
 *
 * MOVED AGAIN 2026-08-27 (fix/link-target-gate-cases), 71,383 ->
 * 71,385, and this time UPWARD: registering `unterminatedHref` — held
 * back through batch 4 because `checkLinkTargets` refused D00478, now
 * licensed by the gate's case 6 — recovers the two cross-references an
 * unterminated `href` had swallowed. Measured the same way, withholding
 * that one rule and nothing else:
 *
 *   anchors corpus-wide            168,055 -> 168,055   (       0)
 *   resolving Jastrow targets       71,385 ->  71,383   (      -2)
 *   DISTINCT (rid, data-ref) pairs 160,241 -> 160,242   (      +1)
 *
 * RESTATED 2026-08-27, same branch, and worth saying why rather than
 * just correcting the digit. The pairs line first read
 * `160,238 -> 160,239`, measured before `toseftaPrimaryHalakha`
 * registered later in this same branch — so it described a 34-rule
 * tree while the line below it described a 35-rule one, and the two
 * tables disagreed by 3 about the SAME full registry. Re-derived on
 * the current tree (35 rules, three withheld-rule passes in one run):
 * full 160,241, this rule withheld 160,242. The DELTA is unchanged at
 * +1 — the 3 is `toseftaPrimaryHalakha`'s own net, which the table
 * below accounts for — and the two figures below are unchanged too,
 * because the halakha rule moves neither.
 *
 * The third line reads BACKWARDS here and says exactly what it should.
 * The pairs LOST by registering the rule are `D00478 ""` and
 * `J00597 ""` — the empty `data-ref` a damaged tag parses to, which is
 * the defect and not an address — and the one GAINED is
 * `D00478 "Jastrow, כָּלוּל 1"`. J00597's recovered address adds no
 * distinct pair because its intact twin already carried it, which is
 * the same witness the repair reads. So: 2 addresses restored, 2
 * non-addresses retired, 0 lost.
 *
 * MOVED A THIRD TIME? NO — and that is the finding worth recording.
 * `toseftaPrimaryHalakha` registered on 2026-08-27 in the same branch
 * and gives **391 entries / 414 occurrences** a halakha their primary
 * anchor had dropped, and the absolute pin above does not move by one.
 * Tosefta addresses are not Jastrow addresses: `JASTROW_REF` matches
 * `Jastrow, <headword> <sense>` and nothing else, so this rule's whole
 * population is invisible to that counter. Measured the same way,
 * withholding that one rule and nothing else:
 *
 *   anchors corpus-wide            168,055 -> 168,055   (       0)
 *   resolving Jastrow targets       71,385 ->  71,385   (       0)
 *   DISTINCT (rid, data-ref) pairs 160,241 -> 160,238   (      -3)
 *
 * So the pin that WOULD have caught a regression here reads zero, which
 * is exactly the shape of gap this file exists to close — a rule can
 * rewrite 414 addresses and leave every number above unmoved. The
 * third `it` below is the answer: it re-derives the pairs with the rule
 * withheld and asserts the delta directly. **413 pairs gained, 410
 * lost, and all 410 of the lost are the SAME address made more precise**
 * — `A00196 Tosefta Shabbat 16` leaving as
 * `A00196 Tosefta Shabbat 16:6` arrives — so 0 addresses are lost
 * outright. 413 rather than 414 because two occurrences in one entry
 * can mint the same pair; +3 net rather than +3 arbitrary because in 3
 * entries some OTHER anchor still carries the chapter-only address, so
 * it never leaves.
 *
 * The batch-4 third line is the one that says nothing was lost: every removed
 * layer duplicated a target its inner twin still carries, so not one
 * address left the corpus. The 20 removals that were not resolving
 * Jastrow targets are the `jt-double-wrapped-citation` pairs — 2 each
 * across the 10 rids the catalogue names — which is that row's
 * population re-derived here, from the pipeline, by subtraction.
 *
 * Batch 4's other four rules move NO anchor and NO target: withholding
 * all six gives the same 72,593 as withholding the unlink pair alone.
 *
 * Cost: three withheld-rule pipelines over 32,512 entries. That is
 * expensive and it is deliberate; the cheaper per-rule measurement is
 * the one that missed this. Two of the three are built here; the third,
 * the full-registry `after`, is `composedEntries()` and costs nothing —
 * see `state()`. */
import { describe, expect, it } from 'bun:test';
import { tokenize } from '../transform/html.ts';
import { anchors } from '../transform/links.ts';
import { fieldsOf } from '../transform/no-new-text.ts';
import { RULES } from '../transform/registry.ts';
import {
	composedEntries,
	repairedEntries,
	sourceEntries,
} from '../transform/rules/corpus-fixture.ts';
import { applyTransforms } from '../transform/run.ts';
import { REPAIRED_ORPHAN_ITEMS } from './repairs.ts';
import type { SourceEntry } from './types.ts';

/** A Jastrow address is the headword string VERBATIM followed by the
 * sense number, so the headword is read GREEDILY. A lazy read that
 * strips a trailing roman numeral loses 7,536 honest links and — worse
 * — resolves 1,131 anchors, across 288 distinct addresses, to a
 * DIFFERENT headword than the greedy read does. See
 * `transform/rules/gershayim.corpus.test.ts` and
 * `docs/v2/transform-batch-3a.md` §8.3. */
const JASTROW_REF = /^Jastrow, (?<headword>.+) (?<sense>\d+)$/u;

const GERSHAYIM = '״';

/** The two rules under test here by their absence: the "before" corpus
 * is the pipeline with the gershayim pair withheld. */
const GERSHAYIM_RULES = new Set([
	'ascii-quote-as-gershayim-in-body',
	'gershayim-breaks-ref-attribute',
]);

/** The third rule under test by its absence, added 2026-08-27. Its
 * population is invisible to `resolvingTargets` — see the docstring —
 * so the only way to see what it does is to withhold it and diff the
 * (rid, data-ref) pairs. */
const HALAKHA_RULE = 'tosefta-variant-chapter-halakha-loss';

/** Separator for a `(rid, data-ref)` key. U+001F rather than a space,
 * because a `data-ref` holds spaces and a key that cannot be split back
 * apart is a key the refinement test below cannot read. */
const SEP = '\u001f';

/** Every DISTINCT `(rid, data-ref)` pair in the corpus. Distinct rather
 * than positional, unlike `resolvingTargets`: the question here is
 * which ADDRESSES an entry carries, not how many anchors carry them. */
function refPairs(corpus: readonly SourceEntry[]): Set<string> {
	const pairs = new Set<string>();
	for (const entry of corpus) {
		for (const field of fieldsOf(entry)) {
			for (const anchor of anchors(tokenize(field))) {
				pairs.add(`${entry.rid}${SEP}${anchor.dataRef}`);
			}
		}
	}
	return pairs;
}

/** How many anchors the corpus holds, in total. */
function anchorCount(corpus: readonly SourceEntry[]): number {
	return corpus.reduce(
		(sum, entry) =>
			sum + fieldsOf(entry).flatMap((field) => anchors(tokenize(field))).length,
		0,
	);
}

/** The `text-repairs` phase over an ALREADY-REPAIRED entry, with some
 * rules withheld. The `applyRepairs` step is not repeated here because
 * `repairedEntries()` has already paid for it once for the whole run —
 * see `state()`. */
function withheld(
	repaired: SourceEntry,
	rules: readonly (typeof RULES)[number][],
): SourceEntry {
	return applyTransforms(repaired, 'text-repairs', rules).entry;
}

/** Every anchor in the corpus, keyed by `rid|walk-position`. Keying on
 * the target STRING instead would collapse an entry's duplicate targets
 * into one set member and under-count the delta — measured at 88 rather
 * than 90 when batch 3a tried it. */
function resolvingTargets(corpus: readonly SourceEntry[]): Set<string> {
	const headwords = new Set(corpus.map((entry) => entry.headword));
	const resolving = new Set<string>();
	for (const entry of corpus) {
		let position = 0;
		for (const field of fieldsOf(entry)) {
			for (const anchor of anchors(tokenize(field))) {
				const key = `${entry.rid}|${position}`;
				position++;
				const headword = JASTROW_REF.exec(anchor.dataRef)?.groups?.['headword'];
				if (headword !== undefined && headwords.has(headword)) {
					resolving.add(key);
				}
			}
		}
	}
	return resolving;
}

/** The four corpus stages this file compares, computed ONCE and shared
 * by the assertions below. They are separate `it`s because they fail for
 * different reasons and the message should say which; they are one walk
 * because a pass over 32,512 entries through the whole registry is
 * expensive and none of the four needs its own.
 *
 * ## Three of the four come from the shared fixture
 *
 * `source`, `repaired` and the full-registry `after` are exactly
 * `corpus-fixture.ts`'s three stages, so this file takes them rather
 * than rebuilding them: `after` IS `composedEntries()` by construction
 * (`applyTransforms` defaults its `rules` to `RULES`), and the two
 * withheld-rule pipelines start from `repairedEntries()` instead of
 * repeating `applyRepairs` twice more. Only `before` and
 * `withoutHalakha` are built here.
 *
 * ## What that costs and what it buys, both measured
 *
 * MEASURED 2026-08-31 on an arm64 macOS dev machine under Bun 1.3.14,
 * against a 48-rule registry. Run ALONE this file got SLOWER, 178s ->
 * 218s: nothing else consumes the fixture, so its three retained stages
 * are pure overhead here. Run as part of the corpus tier — which is how
 * CI runs it — the tier went 534s -> 452s, because the 21 other files
 * that import the fixture now find it already built. The counterfactual
 * is the measurement that settles it: the same tier with only this
 * file's conversion reverted is 534s.
 *
 * Read those two numbers together before "optimising" this file again.
 * A per-file timing taken from a shared-memo run is NOT attributable —
 * the build lands on whichever file calls first, and that is this one.
 *
 * The FIRST `it` bears the whole cost; the others await a resolved
 * promise. CI runs roughly 2x slower, which is why the timeout below is
 * 600s. Re-measure when rules are added: a stale cost estimate here is
 * what set the old timeout too low. */
interface PipelineState {
	after: readonly SourceEntry[];
	before: readonly SourceEntry[];
	source: readonly SourceEntry[];
	withoutHalakha: readonly SourceEntry[];
}

let cached: Promise<PipelineState> | null = null;

function state(): Promise<PipelineState> {
	cached ??= (async (): Promise<PipelineState> => {
		const source = await sourceEntries();
		const repaired = await repairedEntries();
		const withoutPair = RULES.filter((rule) => !GERSHAYIM_RULES.has(rule.id));
		const withoutOne = RULES.filter((rule) => rule.id !== HALAKHA_RULE);
		return {
			after: await composedEntries(),
			before: repaired.map((entry) => withheld(entry, withoutPair)),
			source,
			withoutHalakha: repaired.map((entry) => withheld(entry, withoutOne)),
		};
	})();
	return cached;
}

describe('the pipeline preserves and repairs link targets', () => {
	it('gains exactly 90 resolving targets and loses none', async () => {
		const { after, before, source } = await state();
		const was = resolvingTargets(before);
		const now = resolvingTargets(after);
		const gained = [...now].filter((key) => !was.has(key));
		const lost = [...was].filter((key) => !now.has(key));
		expect({
			entries: source.length,
			gained: gained.length,
			lost: lost.slice(0, 5),
			lostCount: lost.length,
		}).toEqual({ entries: 32_512, gained: 90, lost: [], lostCount: 0 });
		// Absolute, not differential — see the module docstring. Measured
		// on this tree; `before` is 71,295. Both figures moved by the
		// same 1,210 when batch 4's two unlink rules registered, and by
		// the same 2 when `unterminatedHref` registered on 2026-08-27
		// (`unterminatedHref` runs in BOTH passes here, so its gain lands
		// on both sides and cancels out of the differential above — which
		// is exactly why the absolute pin exists). The docstring carries
		// both measurements.
		expect(now.size).toBe(71_385);
	}, 600_000);

	it('leaves no escaped quote in the corpus, and one spelling per address', async () => {
		const { after, source } = await state();
		let entities = 0;
		let marks = 0;
		let sourceMarks = 0;
		for (const entry of source) {
			for (const field of fieldsOf(entry)) {
				sourceMarks += field.split(GERSHAYIM).length - 1;
			}
		}
		for (const entry of after) {
			for (const field of fieldsOf(entry)) {
				entities += field.split('&quot;').length - 1;
				marks += field.split(GERSHAYIM).length - 1;
			}
		}
		// The retired class-1 escape wrote 44 entities — 2 attributes on
		// each of 22 tags — across 21 entries that between them hold 23
		// damaged tags. Zero entities now, and the transform's 2,305
		// marks are what replaced them.
		expect({ entities, entries: after.length }).toEqual({
			entities: 0,
			entries: 32_512,
		});
		// `marks` counts EVERY gershayim in the output, so pinning it to
		// the batch's 2,305 writes is only a statement about this batch
		// while the source contributes none of its own. That assumption
		// is asserted rather than left in a comment: a re-fetch carrying
		// a real gershayim would otherwise fail the line below with no
		// hint that the corpus, not the transform, had moved.
		expect(sourceMarks).toBe(0);
		// 2,305 became 2,309 on 2026-08-28 (batch 5), and the four are
		// COMPOSITION rather than new writes. `gershayimInBody` converts
		// the ASCII quote in a HEADWORD to `״`, and
		// `phraseAltHeadwordStub` — registered after it — then copies that
		// repaired headword into `alt_headwords`, duplicating the mark.
		// Measured: the phrase rule run alone against raw source adds
		// ZERO, because the headword it copies still holds an ASCII quote
		// there. Only the composed pipeline can see this, which is batch
		// 3a's finding recurring in the direction it predicted.
		//
		// Every one of the four is `copied`-declared and verified against
		// its own entry's post-repair input by `checkNoNewText`, so this
		// is duplicated text, not invented text.
		expect(marks).toBe(2309);
	}, 600_000);

	/**
	 * `toseftaPrimaryHalakha`'s delta, asserted rather than quoted —
	 * because nothing else in this file can see it.
	 *
	 * The absolute pin above does not move by one when this rule
	 * registers: `JASTROW_REF` matches `Jastrow, <headword> <sense>`, and
	 * a Tosefta address is not a Jastrow address, so all 414 rewritten
	 * targets are invisible to that counter. Nor does the anchor count
	 * move — the rule rewrites two attribute VALUES and touches no token.
	 * A rule can therefore change 414 addresses corpus-wide and leave
	 * every existing number in this file unmoved, which is exactly the
	 * blind spot the module docstring says this file exists to close.
	 *
	 * So the delta is derived directly, from a third pipeline pass with
	 * this one rule withheld, and stated as the spec states it: **391
	 * primaries gain a halakha, 0 addresses lost.**
	 *
	 * "0 addresses lost" is the load-bearing half and it is checked
	 * rather than assumed. Rewriting a `data-ref` REMOVES the old
	 * (rid, data-ref) pair, so 410 pairs do leave — and every one of them
	 * leaves as a REFINEMENT, with the same rid gaining that same address
	 * plus `:<halakha>`. `A00196 Tosefta Shabbat 16` goes and
	 * `A00196 Tosefta Shabbat 16:6` arrives. A rewrite that pointed an
	 * anchor somewhere unrelated would leave a pair with no such
	 * successor and fail here, which a net-count assertion could not
	 * distinguish.
	 *
	 * The two counts either side of it are pinned for the same reason the
	 * absolute pin exists: 413 gained rather than 414 because two
	 * occurrences in one entry can mint one pair, and 410 lost rather
	 * than 413 because 3 entries carry the chapter-only address on some
	 * OTHER anchor too, so it never leaves at all.
	 */
	it('gives 391 primaries a halakha and loses no address', async () => {
		const { after, withoutHalakha } = await state();
		const was = refPairs(withoutHalakha);
		const now = refPairs(after);
		const gained = [...now].filter((pair) => !was.has(pair));
		const lost = [...was].filter((pair) => !now.has(pair));
		// A lost pair is a REFINEMENT when the same entry gained that
		// same address with a locus appended.
		const stranded = lost.filter(
			(pair) => !gained.some((won) => won.startsWith(`${pair}:`)),
		);
		const entries = new Set(
			[...gained, ...lost].map((pair) => pair.split(SEP)[0]),
		);
		expect({
			anchorsAfter: anchorCount(after),
			anchorsBefore: anchorCount(withoutHalakha),
			entries: entries.size,
			gained: gained.length,
			lost: lost.length,
			stranded: stranded.slice(0, 5),
			strandedCount: stranded.length,
		}).toEqual({
			anchorsAfter: 168_055,
			anchorsBefore: 168_055,
			entries: 391,
			gained: 413,
			lost: 410,
			stranded: [],
			strandedCount: 0,
		});
	}, 600_000);

	it('gives every repaired orphan refs item an in-body basis', async () => {
		const { after } = await state();
		const unresolved: string[] = [];
		for (const entry of after) {
			const expected = REPAIRED_ORPHAN_ITEMS[entry.rid];
			if (expected === undefined) {
				continue;
			}
			const seen = new Set(
				fieldsOf(entry).flatMap((field) =>
					anchors(tokenize(field)).map((anchor) => anchor.dataRef),
				),
			);
			unresolved.push(
				...expected
					.filter((item) => !seen.has(item))
					.map((item) => `${entry.rid}: ${item}`),
			);
		}
		// This is `migrate-dry`'s `unresolvedRepairedOrphans` recount,
		// asserted at test time. The 21 class-1 rids are gated here by the
		// TRANSFORM's output now that the escape is retired, so a
		// narrowed predicate re-orphans them loudly.
		expect(unresolved).toEqual([]);
	}, 600_000);
});
