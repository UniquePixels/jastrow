/**
 * Registry ORDER, as opposed to registry COVERAGE (`registry.test.ts`).
 *
 * Coverage asks whether every catalogued row has an owner. This file
 * asks whether the owners run in an order that lets each of them do
 * its job — the one class of defect `bun transform:count` is
 * structurally unable to see, because it runs every rule alone.
 *
 * Batch 1 is why this file exists. Its RTL trio passed every unit test
 * and every isolated count with the wrapper rules in the wrong order,
 * and left 62 entries newly bare: dropping a redundant outer span
 * re-exposes the Hebrew it covered, and `bare-rtl-hebrew` had already
 * run by then. The composed corpus pass found it; nothing else could.
 *
 * Four orderings are asserted, each stating a behavioural rule rather
 * than pinning today's arrangement:
 *
 * 1. **Unlink before retarget.** A retarget rule copies a target off a
 *    neighbouring anchor. If an unlink rule is going to DELETE that
 *    anchor, the target it carries is a wrong link, and adopting it
 *    propagates the error instead of removing it. So every anchor an
 *    unlink rule will remove must already be gone before any
 *    antecedent search runs. WIDENED 2026-08-27 to cover `CORROBORATE`
 *    as well as `RETARGET`: `toseftaPrimaryHalakha` does not adopt a
 *    neighbour's target, it assembles one from a neighbour's suffix and
 *    a neighbour's printed digits, which is the same dependency on the
 *    neighbour still being there.
 *
 *    A FIFTH ordering rides alongside it and is asserted separately,
 *    because it is about one pair rather than two classes:
 *    `toseftaPrimaryHalakha` STRICTLY BEFORE `toseftaCloseParen`. The
 *    two rows are entangled, so rule 2 already requires them adjacent;
 *    adjacency is direction-blind and the direction is the whole
 *    requirement, since the close-paren rule destroys the display
 *    predicate the halakha rule selects on.
 * 2. **Entangled rows occupy a gap-free span.** Read off the live
 *    catalogue's `entangledWith` graph rather than a list here, so a
 *    new edge in `patterns.jsonl` is enforced the moment it is
 *    recorded. `registry.test.ts` unit-tests `checkAdjacency` on
 *    synthetic cliques; this runs it against the real graph and the
 *    real registry.
 *
 *    That aggregate passes on an EMPTY graph, though — `checkAdjacency`
 *    skips any component with fewer than two registered members — so
 *    the clusters themselves are pinned as a set, DERIVED from the
 *    catalogue by `entangledClusters` rather than named one by one.
 *    Naming them one by one was tried and was not enough: it left the
 *    rtl 3-clique pinned by nothing, and it could never cover a
 *    cluster that becomes live when a `PENDING` row's rule ships.
 *    What is NOT covered, and cannot be from here, is a row whose edge
 *    was never recorded at all — see `checkAdjacency`'s own limitation
 *    note in `registry.ts`.
 *
 *    Both of those ask whether what the gate SEES is correct. A third
 *    assertion asks whether it sees everything: `unaccountedEdges`
 *    walks the edges the catalogue records and requires each one
 *    touching a registered rule to land inside a derived cluster,
 *    which is either validated or reported. Three separate defects on
 *    this branch were all the same shape — an edge leaving the gate's
 *    view without a word — and that is the conservation law they were
 *    each a corner of. It does not subsume the derived-set pin: an
 *    edge DELETED from the catalogue is not a recorded edge, so only
 *    the pinned set notices that.
 * 3. **The three `ib-` retargets keep their documented relative
 *    order.** `registry.ts`'s retarget-after-retarget note (Task 7,
 *    used by Task 8) is the mirror of rule 1: a retarget reading the
 *    anchor sequence must run AFTER any rule that REPAIRS an anchor it
 *    might adopt, or it copies a target its neighbour is about to
 *    correct. Appending below is the safe default, and this pins it.
 *    The three populations are pairwise disjoint on today's corpus
 *    (Task 8 measured all six permutations: 6,212 records each,
 *    identical addresses), so the order is currently free — which is a
 *    fact about this corpus, not a licence to reorder them after a
 *    re-fetch.
 * 4. **Unlink before wrap.** Added 2026-08-26 by
 *    `fix/rtl-unlink-order`, and it is rule 1 one level up: an unlink
 *    rule drops an anchor and RE-EXPOSES the text that anchor covered.
 *    A wrap rule declines text that is already inside a link — that is
 *    the correct predicate, not a bug — so with the unlinks running
 *    afterwards the exposed text is never wrapped by anyone. Four of
 *    the six unlink rows are entangled with `bare-rtl-hebrew` by
 *    measurement (441 / 170 / 80 / 50 entries), which puts them under
 *    `checkAdjacency` — but adjacency is DIRECTION-BLIND, and which
 *    side of the wrap rules they sit on is the entire defect. Nothing
 *    else in the tree holds that direction.
 *
 *    Both sides of this one are earned sets rather than literals. The
 *    first draft wrote the wrap side as three hardcoded ids, which
 *    left a fourth rtl wrap rule free to classify into `NEITHER`,
 *    satisfy the exhaustiveness assertion below, and leave this
 *    assertion silently passing above the unlinks — the exact vacuity
 *    the next paragraph warns about.
 *
 * The classification in `registry-classes.ts` is asserted EXHAUSTIVE. Without that, a
 * rule added to `RULES` and to none of the sets would satisfy every
 * ordering above vacuously, and this file would go quietly blind at
 * exactly the moment it is most needed. Batch 3a added a fourth set
 * rather than widening a third: `gershayim-breaks-ref-attribute`
 * writes a link target without adopting one from a neighbour, which
 * is neither `RETARGET` nor `NEITHER` as those are defined. The gate's
 * case 6 added a FIFTH on the same reasoning (2026-08-27) — `RESTORE`,
 * for a rule that writes a target by relocating bytes inside the
 * anchor's OWN damaged tag — rather than stretching `GLYPH` to cover a
 * second, differently-shaped declaration. Case 7 added a SIXTH the same
 * day — `CORROBORATE`, for a rule that MINTS a target from two the
 * input holds plus a sibling's printed digits. It is not `RETARGET`
 * either, and the distinction is worth stating because it is the
 * closest call of the six: a retarget ADOPTS a neighbour's whole
 * target, where this assembles a target no anchor carries. Rule 1's
 * hazard — an unlink rule deleting the antecedent — applies to both, so
 * `CORROBORATE` is placed under rule 1 alongside `RETARGET` rather than
 * exempted from it.
 *
 * And exhaustive is not the same as earned. `registry.order.corpus.test.ts`
 * makes membership of `UNLINK`, `WRAP`, `GLYPH`, `RESTORE`, `CORROBORATE`
 * and `NEITHER` a measurement over all 32,512 entries rather than an
 * author's claim. `RETARGET` is the one set that cannot be earned that
 * way, and the note there says why.
 *
 * The sets themselves live in `registry-classes.ts`, shared with that
 * corpus file. Everything here reads only `RULES` and
 * `data/patches/patterns.jsonl`, so it runs on every `bun qa`.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { parsePatterns } from '../research/patterns.ts';
import { textOf } from './no-new-text.ts';
import {
	checkAdjacency,
	entangledClusters,
	RULES,
	unaccountedEdges,
} from './registry.ts';
import {
	CLASSES,
	CORROBORATE,
	MINT,
	RETARGET,
	rtlSpanCoverageOf,
	UNLINK,
	WRAP,
} from './registry-classes.ts';

const catalogue = parsePatterns(
	await Bun.file('data/patches/patterns.jsonl').text(),
);

const ids = RULES.map((rule) => rule.id);

/** A registered rule's position, THROWING on an unregistered id:
 * `indexOf`'s -1 is less than every real position, so an ordering
 * constraint whose subject was renamed or dropped would PASS while
 * asserting nothing. */
function at(id: string): number {
	const index = ids.indexOf(id);
	if (index < 0) {
		throw new Error(`registry order: no rule registered as '${id}'`);
	}
	return index;
}

/** A registered rule's phase, throwing for the same reason `at` does. */
function phaseOf(id: string): string {
	const rule = RULES.find((r) => r.id === id);
	if (rule === undefined) {
		throw new Error(`registry order: no rule registered as '${id}'`);
	}
	return rule.phase;
}

/**
 * INDEX IS NOT EXECUTION ORDER ACROSS PHASES, and rules 1 and 4 below
 * are index comparisons.
 *
 * `applyTransforms` filters by phase and `patch/apply.ts`'s manifest
 * runs `text-repairs` to completion before `structural-repairs` starts,
 * so a structural rule runs after EVERY text rule whatever its index.
 * An index assertion over a cross-phase pair is therefore not merely
 * violated by such a rule — it is UNSATISFIABLE by one, and could only
 * be "satisfied" by registering the rule early in a list whose own
 * comment says structural rules sit last so it reads in execution
 * order.
 *
 * This is batch 6c's phase-blindness in a second gate. The commutation
 * gate had the mirror of it — a cross-phase pair has ONE order, so
 * composing it both ways read as an undeclared entanglement — and the
 * fix there is the fix here: SKIP, and COUNT, so the exemption is
 * visible rather than silent.
 *
 * What makes the skip legitimate is not the phase name. Rule 1 guards
 * against a retarget adopting a target off an anchor that an unlink
 * will later DELETE; batch 7's two duplication rules remove an anchor
 * from a duplicated run, so the twin survives and the antecedent does
 * not go away. That is earned in `registry.order.corpus.test.ts`'s
 * "the cross-phase unlink rules orphan no target" over all 32,512
 * entries — every anchor they remove leaves a surviving copy of
 * the same target in the same entry — 42 of 42 as composed, and
 * asserted there rather than here.
 */
function crossPhasePairs(
	left: ReadonlySet<string>,
	right: readonly string[],
): number {
	let skipped = 0;
	for (const l of left) {
		for (const r of right) {
			if (phaseOf(l) !== phaseOf(r)) {
				skipped++;
			}
		}
	}
	return skipped;
}

/** The largest index among `left` members sharing a phase with some
 * `right` member — the only comparison an index can honestly make. */
function lastWithin(
	left: ReadonlySet<string>,
	right: readonly string[],
): number {
	const phases = new Set(right.map(phaseOf));
	const same = [...left].filter((id) => phases.has(phaseOf(id)));
	// `Math.max(...[])` is -Infinity, which is less than every index — so
	// an empty intersection would make rules 1 and 4 pass while comparing
	// NOTHING, leaving the counted skip as the only evidence they ran.
	// That is precisely the "silence mistaken for coverage" failure the
	// surrounding comments name, so it throws instead. Hardening: the
	// intersection is non-empty today.
	if (same.length === 0) {
		throw new Error(
			'registry order: no same-phase member to compare — the assertion would pass vacuously',
		);
	}
	return Math.max(...same.map(at));
}

describe('registry order', () => {
	// Guards the orderings below against going vacuous: a new rule in
	// none of the sets is unclassified, and they would then say nothing
	// about it while still passing.
	it('every registered rule is classified', () => {
		const unclassified = ids.filter((id) => !CLASSES.some((c) => c.has(id)));
		expect(unclassified).toEqual([]);
		// And the other direction — a set naming a rule that no longer
		// exists is a stale classification, not a passing test.
		const claimed = CLASSES.flatMap((c) => [...c]);
		expect(claimed.filter((id) => !ids.includes(id))).toEqual([]);
		// Same guard, for the instrument every ordering assertion below
		// runs through — pinned so it cannot revert to a bare `indexOf`.
		expect(() => at('no-such-rule')).toThrow(/no rule registered/u);
	});

	// Rule 1, asserted over `RETARGET`, `CORROBORATE` and `MINT`
	// together. The corroborating rule reads a NEIGHBOURING anchor for
	// its tail and its digits, and the minting rule reads one for the
	// whole target, so an unlink rule that deletes that neighbour
	// changes what either reads — the same hazard, whether the target is
	// adopted whole, assembled, or copied onto an anchor that did not
	// exist.
	it('every unlink rule precedes every rule that sources a target from a neighbour', () => {
		const readers = [...RETARGET, ...CORROBORATE, ...MINT];
		const firstReader = Math.min(...readers.map(at));
		expect(lastWithin(UNLINK, readers)).toBeLessThan(firstReader);
		// The skip is COUNTED, never silent. A skip nobody counts is the
		// "silence mistaken for coverage" failure `link-target.ts` names.
		// The figure is a PRODUCT — 2 structural unlink rules × 5
		// text-phase readers (3 `RETARGET` + 1 `CORROBORATE` + 1 `MINT`)
		// — so it moves whenever either side grows, and re-deriving it is
		// how a reader checks the growth was where they expected. 8 → 10
		// on 2026-09-06 for the mint.
		expect(crossPhasePairs(UNLINK, readers)).toBe(10);
	});

	// THE DIRECTION, AND THE FAILURE IT PREVENTS IS SILENT.
	// `toseftaCloseParen` rewrites a variant's display from `XVII), 6`
	// to `XVII`, and `VARIANT_DISPLAY` is anchored at both ends, so it
	// DESTROYS the predicate `toseftaSplits` selects on. `run.ts` feeds
	// each rule the previous rule's output, so the reverse order leaves
	// `toseftaPrimaryHalakha` seeing 0 splits and repairing 0 primaries
	// — while `bun transform:count`, which runs every rule ALONE against
	// the pinned snapshot, keeps reporting 391 MATCH. Green everywhere,
	// nothing done.
	//
	// `checkAdjacency` cannot hold this. The two rows ARE declared
	// `entangledWith` each other, so it requires them to occupy a
	// gap-free span — and it is DIRECTION-BLIND, so it is satisfied by
	// either arrangement. The commutation gate reports the pair
	// non-commuting, which is expected and declared, and it does not say
	// which order is right either. This assertion is the only thing in
	// the tree that does.
	it('toseftaPrimaryHalakha runs STRICTLY BEFORE toseftaCloseParen', () => {
		expect(at('tosefta-variant-chapter-halakha-loss')).toBeLessThan(
			at('anchor-swallows-close-paren'),
		);
	});

	// THE SECOND DIRECTION PIN, and it was found the way the first one
	// should have been — by the commutation gate, before anything
	// shipped. `strandedStemHead` moves a stem label out of
	// `content.senses[0]` and the remainder into a child sense, which
	// brings a duplicated run to OFFSET 0 where `duplicatedOpeningRun`
	// can see it. On `R00223` that is the whole difference: the opening
	// rule repairs 88 alone and 89 composed after the stem rule.
	//
	// The two rows are declared `entangledWith` each other, so rule 2
	// requires them adjacent — and adjacency is DIRECTION-BLIND, which
	// is exactly the gap the tosefta pin exists to fill. Reversed, the
	// duplicate at `R00223` is never exposed and never repaired, while
	// every per-rule count still reports what it always did.
	it('strandedStemHead runs STRICTLY BEFORE duplicatedOpeningRun', () => {
		expect(at('stranded-stem-head')).toBeLessThan(
			at('duplicated-definition-opening-run'),
		);
	});

	// THE THIRD DIRECTION PIN, and the second the commutation gate found
	// before anything shipped. `strandedDashStarMarker` writes `—*3)`
	// onto a sibling, which CREATES the dashed-sibling witness
	// `continuationMarkerDash` requires — so reversed, `A00337`'s bare
	// `2)` has no witness and is never repaired, while every per-rule
	// count still reads normal.
	//
	// The pair is declared `entangledWith`, so rule 2 requires them
	// adjacent, and adjacency is direction-blind. This is what holds the
	// direction.
	it('strandedDashStarMarker runs STRICTLY BEFORE continuationMarkerDash', () => {
		expect(at('trailing-em-dash-tail')).toBeLessThan(
			at('continuation-marker-em-dash-loss'),
		);
	});

	// THE FOURTH DIRECTION PIN, and the third the commutation gate found
	// before anything shipped — `v-sub-redirect-stub-mislink ×
	// holam-migrated-off-mater-vav @ S01645`. Nothing in the catalogue
	// connected the two rows and no amount of reading either module
	// would have.
	//
	// `S01645`'s stub points at `Jastrow, קוּסְדֹּור 1`, and that target
	// CARRIES the migrated holam. `vSubRedirectTwin`'s frozen table is
	// keyed on the exact current target, so with the holam rule first
	// the key no longer matches and the retarget is silently lost —
	// while every per-rule count still reads normal.
	//
	// The pair is declared `entangledWith`, so rule 2 requires them
	// adjacent, and adjacency is direction-blind. This is what holds the
	// direction.
	it('vSubRedirectTwin runs STRICTLY BEFORE holamMaterMigration', () => {
		expect(at('v-sub-redirect-stub-mislink')).toBeLessThan(
			at('holam-migrated-off-mater-vav'),
		);
	});

	// The batch-10 block's own internal direction, for the same hazard
	// one rule later: `shinSinDotRestore`'s twin table is keyed on exact
	// bytes, so it must read text whose holams the rule above has
	// already canonicalised.
	it('holamMaterMigration runs STRICTLY BEFORE shinSinDotRestore', () => {
		expect(at('holam-migrated-off-mater-vav')).toBeLessThan(
			at('shin-sin-dot-drop'),
		);
	});

	// THE FIFTH DIRECTION PIN, moved here from the retired
	// `rules/headword.corpus.test.ts:410` (consolidation step 5), which
	// held it in the shape of the corpus disagreement: composed
	// paren-first the phrase rule fires 236 times, phrase-first 235
	// (`B00780`, `A02403`; `registry.ts` carries the mechanism). The pair
	// is declared `entangledWith`, so rule 2 requires them adjacent, and
	// adjacency is direction-blind. This is what holds the direction.
	it('parenAltHeadword runs STRICTLY BEFORE phraseAltHeadwordStub', () => {
		expect(at('parenthesized-alt-headword')).toBeLessThan(
			at('phrase-alt-headword-stub'),
		);
	});

	// Rule 4, UNLINK BEFORE WRAP — see the header for why. Asserted
	// over the whole of BOTH sets, never over the ids that happen to be
	// in them today: `at()` throws on an unregistered id, `CLASSES`
	// requires every registered rule to be in some set, and the corpus
	// pass in `registry.order.corpus.test.ts` requires `UNLINK` and
	// `WRAP` to be exactly the rules that behave that way. A new rule on
	// either side therefore fails something loudly rather than widening a
	// gap this test cannot see.
	it('every unlink rule precedes every rtl wrap rule', () => {
		const wraps = [...WRAP];
		const firstWrap = Math.min(...wraps.map(at));
		expect(lastWithin(UNLINK, wraps)).toBeLessThan(firstWrap);
		// Counted for the same reason as rule 1, and also a product:
		// 2 structural unlink rules × 3 text-phase wrap rules.
		expect(crossPhasePairs(UNLINK, wraps)).toBe(6);
	});

	it('the live catalogue’s entangled clusters occupy a gap-free span', () => {
		expect(checkAdjacency(catalogue, RULES)).toEqual([]);
	});

	// SELF-COUNTING, and it replaces two hand-written per-cluster tests
	// this task briefly shipped. Those pinned the geresh and gershayim
	// pairs by name, which left the rtl 3-clique — a third registered
	// entanglement — pinned by nothing: strip its edges from the
	// catalogue and scatter the trio and `checkAdjacency` returns clean.
	// A convention of "one named test per cluster" has nothing enforcing
	// it, and the moment a PENDING row's rule ships its cluster starts
	// mattering with no test aware of it.
	//
	// So the set under test is DERIVED from the catalogue by
	// `entangledClusters` (every component with two or more registered
	// members) and only the expectation is written here. Strip a
	// cluster's edges and it leaves the derived set, failing this;
	// scatter its members and it fails the span test below; register a
	// new entangled pair and this fails until the pair is listed, which
	// is the point at which someone has to look.
	it('the registered entanglement clusters are exactly these', () => {
		expect(entangledClusters(catalogue, RULES).map((c) => c.ids)).toEqual([
			// THREE clusters became FOUR on 2026-08-27
			// (fix/link-target-gate-cases), and this one is the arrival the
			// comment above anticipated: "it could never cover a cluster
			// that becomes live when a `PENDING` row's rule ships". The
			// tosefta pair's edge was always recorded; until
			// `toseftaPrimaryHalakha` shipped, only one endpoint was
			// registered, so `entangledClusters` skipped the component and
			// `unaccountedEdges` reported it instead. Both changed in the
			// same commit, and the two pins moved in opposite directions —
			// this one grew by a cluster, that one shrank by a line.
			//
			// Its span is 2 and the two rules are adjacent, which the span
			// test below checks. What NEITHER checks is the DIRECTION, and
			// the direction is the whole requirement here — see
			// `toseftaPrimaryHalakha runs STRICTLY BEFORE
			// toseftaCloseParen` above.
			['anchor-swallows-close-paren', 'tosefta-variant-chapter-halakha-loss'],
			['ascii-quote-as-gershayim-in-body', 'gershayim-breaks-ref-attribute'],
			// FOUR clusters became THREE on 2026-08-26
			// (fix/rtl-unlink-order), and the merges are the point rather
			// than bookkeeping. `commutation.ts` measured seven
			// non-commuting pairs the catalogue had never recorded;
			// declaring them joined the rtl 3-clique to the geresh pair and
			// to two more unlink rows (one 7-rule component), and joined the
			// period pair to the em-dash and edge-space rules (one 4-rule
			// component). Both components are now under the span test below,
			// which is what the declaration buys.
			[
				'bare-rtl-hebrew',
				'ellipsis-fragment-anchored',
				'geresh-letter-numeral-mislink',
				'latin-token-inside-rtl-span',
				'plural-to-feminine-final-letter-mislink',
				'prefixed-geresh-abbrev-mislink',
				'redundant-outer-rtl-span',
			],
			// SIX became SEVEN, and the second of the two arrived the same
			// way as the first — reported by the commutation gate as
			// `trailing-em-dash-tail × continuation-marker-em-dash-loss @
			// A00337`, never recorded in the catalogue. Writing `—*3)`
			// onto a sibling CREATES the dashed-sibling witness the
			// continuation rule requires, so the direction is load-bearing
			// and is pinned separately above.
			['continuation-marker-em-dash-loss', 'trailing-em-dash-tail'],
			// FIVE clusters became SEVEN at batch 7 — this one and the pair
			// above it — and both arrived by a
			// route none of the others did: the edge was NEVER IN THE
			// CATALOGUE. `checkAdjacency`'s limitation note names exactly
			// this case — "a row whose edge was never recorded at all" — and
			// the commutation gate is what recorded it, reporting
			// `stranded-stem-head × duplicated-definition-opening-run @
			// R00223` as an undeclared non-commuting pair before either
			// rule's PR existed.
			//
			// Its direction is load-bearing and is pinned separately above,
			// for the same reason the tosefta pair's is: the stem rule
			// EXPOSES the duplicate by moving a label out of `senses[0]`,
			// so reversed the repair at `R00223` never happens and every
			// per-rule count still reads normal.
			['duplicated-definition-opening-run', 'stranded-stem-head'],
			[
				'em-dash-section-break-in-own-italic',
				'emphasis-run-edge-space',
				'italic-swallowed-terminal-period',
				'label-period-outside-italic',
			],
			// FOUR clusters became FIVE on 2026-08-28 (batch 5), and this
			// one is the first entanglement in this registry between two
			// rules that touch NO MARKUP AT ALL. Its spec had argued the
			// batch would add no edge, reasoning about the rules already
			// registered and never checking its own pair; the commutation
			// gate of PR #50 is what caught it.
			//
			// The pair does not commute by one occurrence in each
			// direction. `B00780` holds `'(עֵין ב׳)'`, whose stub token is
			// `'ב׳)'` — `expandStub` refuses anything following the geresh,
			// so phrase-first cannot see it, while paren-first strips the
			// delimiters and it expands. `A02403`'s `'אסת׳ )'` moves the
			// other way, becoming a single token that leaves the phrase
			// population. Composed paren-first the phrase rule fires 236
			// times; phrase-first, 235.
			//
			// Its span is 2 and the two are adjacent, which the span test
			// below checks. As with the tosefta pair, what that does NOT
			// check is the DIRECTION, and here the direction is the whole
			// requirement — pinned in `rules/headword.corpus.test.ts` in
			// the shape of the disagreement rather than as the winning
			// order, so a reorder fails with the reason attached.
			// SEVEN became EIGHT at batch 10, and this one arrived by the
			// same route as the two batch-7 pairs: the edge was NEVER IN
			// THE CATALOGUE, and the commutation gate reported it as
			// `v-sub-redirect-stub-mislink × holam-migrated-off-mater-vav
			// @ S01645` before the batch's PR existed. Neither module
			// mentions the other and no amount of reading them would have
			// found it.
			//
			// `S01645`'s stub points at `Jastrow, קוּסְדֹּור 1`, and that
			// target CARRIES the migrated holam. `vSubRedirectTwin`'s
			// frozen table is keyed on the exact current target, so with
			// the holam rule first the key stops matching and the retarget
			// is silently lost — while every per-rule count still reads
			// normal. Its direction is pinned separately above.
			//
			// The transferable form is worth keeping: A TABLE KEYED ON
			// DAMAGED BYTES IS DISABLED BY ANY RULE THAT REPAIRS THEM.
			// Batch 9 called that table's key fail-closed and it is — but
			// fail-closed here loses a correct repair rather than
			// preventing a wrong one.
			['holam-migrated-off-mater-vav', 'v-sub-redirect-stub-mislink'],
			['parenthesized-alt-headword', 'phrase-alt-headword-stub'],
		]);
	});

	// The same clusters, now checked for contiguity one by one rather
	// than through `checkAdjacency`'s aggregate — so a failure names the
	// cluster and its span, and so this test cannot be satisfied by
	// there being no clusters at all.
	it('every derived cluster occupies a gap-free span', () => {
		const clusters = entangledClusters(catalogue, RULES);
		expect(clusters).toHaveLength(8);
		for (const cluster of clusters) {
			const span = Math.max(...cluster.at) - Math.min(...cluster.at) + 1;
			expect(`${cluster.ids.join(', ')} span ${span}`).toBe(
				`${cluster.ids.join(', ')} span ${cluster.at.length}`,
			);
		}
	});

	// The invariant the three adjacency fixes were each a corner of: a
	// recorded entanglement touching the registry must produce a
	// validated cluster or a reported problem, never silence. Both of
	// the tests above answer "is what the gate sees correct?"; this one
	// answers "does the gate see everything it should?", which is the
	// question all three defects slipped through.
	//
	// Over 34 recorded entries / 17 undirected edges (measured
	// 2026-08-26, batch 4): 13 have both endpoints registered and sit
	// inside the three clusters above, 2 have neither endpoint
	// registered — which execution order cannot be wrong about — and 2
	// have exactly ONE registered endpoint. Those last two are the
	// deferrals pinned below, and they are why this no longer reads
	// empty.
	//
	// CORRECTED 2026-08-26 (batch 4). This read "Empty today over 32
	// recorded entries / 16 undirected edges: 13 … and 3 have neither
	// endpoint registered". The 16 became 17 with batch 4's mutual
	// JT/nested edge, and one of the 3 neither-registered edges became
	// a one-registered edge the moment `nestedAnchorDuplicate` shipped.
	//
	// CORRECTED 2026-08-26 (fix/rtl-unlink-order). This block said "18
	// recorded entries / 9 undirected edges: 5 have both endpoints
	// registered … and 4 have neither endpoint registered". The totals
	// were right for v2 and this branch's seven declarations move them
	// to 32 / 16 — but the SPLIT was already wrong before this branch
	// touched it: recomputed on v2 it is 6 both-registered and 3
	// neither, not 5 and 4. Declaring seven edges between registered
	// rules cannot move the neither-registered count at all, so the 3
	// below is not a change, it is the number that should always have
	// been there. Recorded rather than quietly overwritten, on this
	// branch's own rule for a stale claim.
	//
	// It is NOT a restatement of
	// `checkAdjacency` returning clean — a dropped component leaves
	// that clean and lands here.
	//
	// NO LONGER EMPTY, as of batch 4 (2026-08-26), and this is the day
	// `registry.ts`'s own note said would come: "it fails the day a rule
	// ships ahead of a still-`PENDING` partner". It ships TWICE at once,
	// and the two lines below are the RECORD of those deferrals rather
	// than a relaxation of the gate. The function is untouched; what is
	// pinned is its exact output, so a THIRD unaccounted edge, or either
	// of these two changing, fails here and sends the next reader to
	// this comment.
	//
	// Both have a registered endpoint and a `PENDING` one, and in both
	// the deferral is a SHARED-GATE ruling rather than a missing
	// predicate:
	//
	// - `anchor-swallows-close-paren` shipped as `toseftaCloseParen`;
	//   `tosefta-variant-chapter-halakha-loss` (414 occ / 391 ent) is
	//   refused by `link-target.ts` case 4, whose 2026-08-24 tightening
	//   requires the discarded part of `tail` to be a prefix of `head`
	//   — and `Tosefta Shabbat 17` is not a prefix of
	//   `Tosefta Shabbat 16`. Its slot in `RULES` is marked, STRICTLY
	//   BEFORE `toseftaCloseParen`, and the direction is load-bearing.
	// - `nested-anchor-swallows-punctuation` shipped as
	//   `nestedAnchorDuplicate`; `jt-double-wrapped-citation` will never
	//   have a rule at all, because that rule already repairs all 10 of
	//   its entries. It is named in `registry.ts`'s `COVERED` and
	//   `coverage()` counts it as owned — but `unaccountedEdges` asks a
	//   different question, about EXECUTION ORDER, and a row with no
	//   rule of its own has no position to be ordered against. Reporting
	//   it is correct.
	//
	// The line either resolves to `[]` when the halakha rule ships, or
	// keeps one entry for as long as the JT row stays a catalogue row
	// with no rule. Whichever happens, it happens here, in the open.
	//
	// RESOLVED IN PART, 2026-08-27 (fix/link-target-gate-cases), and
	// this is the sentence above coming true. `toseftaPrimaryHalakha`
	// shipped, so the tosefta edge now has BOTH endpoints registered and
	// lands inside a derived cluster instead of being reported: the
	// pinned output SHRINKS from two lines to one. The pin is updated,
	// not relaxed — the surviving line is still asserted exactly, so a
	// third unaccounted edge, or the JT line changing, still fails here.
	//
	// The one that remains is the one that has no rule to be ordered
	// against at all: `jt-double-wrapped-citation` is repaired in full
	// by `nestedAnchorDuplicate` and is named in `registry.ts`'s
	// `COVERED`, so `coverage()` counts it as owned — but a row with no
	// rule of its own has no position, and `unaccountedEdges` asks about
	// EXECUTION ORDER. Reporting it is correct, and it will keep being
	// reported for as long as that stays true.
	it('every recorded edge touching the registry is validated or reported', () => {
		expect(unaccountedEdges(catalogue, RULES)).toEqual([
			'jt-double-wrapped-citation ~ nested-anchor-swallows-punctuation: recorded entanglement is invisible to the adjacency gate',
		]);
	});

	// Batch 3b's two MEASURED ordering constraints, neither of which is
	// an `entangledWith` edge, so `checkAdjacency` above is blind to
	// both. Each cost is a corpus measurement, not a judgement:
	// running `italic-swallowed-terminal-period` before the em-dash rule
	// leaves that rule 0 of its 270 entries, and before
	// `emphasis-run-edge-space` it never sees the 29 seams whose
	// terminal period a captured space is hiding (11 entries, 1,567 →
	// 1,578 composed). See `registry.ts`'s batch 3b block.
	it('the two rules feeding italic-swallowed-terminal-period precede it', () => {
		expect(at('em-dash-section-break-in-own-italic')).toBeLessThan(
			at('italic-swallowed-terminal-period'),
		);
		expect(at('emphasis-run-edge-space')).toBeLessThan(
			at('italic-swallowed-terminal-period'),
		);
	});

	// The label pair's INTERNAL order. `checkAdjacency` sees the edge
	// and so requires the two to be adjacent, but it is indifferent to
	// which comes first, and which comes first is the whole point:
	// `labelPeriodInside` removes labels from the population the gloss
	// rule then reads, so that rule's exclusion clause is an assertion
	// that already holds rather than a filter it must get right.
	it('labelPeriodInside leads the label pair', () => {
		expect(at('label-period-outside-italic')).toBeLessThan(
			at('italic-swallowed-terminal-period'),
		);
	});

	// Class B seam repair before the label predicate reads the run
	// body: a missing space at `</a><i>` or `)<i>` changes what that
	// body IS. Asserted over the whole Class B set rather than a
	// representative, so adding a sixth seam rule outside the block
	// fails here.
	it('every space-inserting seam rule precedes the label pair', () => {
		const seams = [
			'anchor-italic-no-space',
			'geresh-abbrev-space-loss',
			'italic-close-paren-nospace',
			'paren-tag-no-space',
			'translit-italic-space-loss',
		];
		const lastSeam = Math.max(...seams.map(at));
		expect(lastSeam).toBeLessThan(at('label-period-outside-italic'));
	});

	// `trailingWhitespaceDefinition` trims the entry's deepest-last
	// sense and must see it as every other rule leaves it.
	// `emphasis-run-edge-space` is the only rule that could hand it a
	// member; running last is what makes the measured 0 the whole
	// answer rather than a claim about one pair.
	//
	// RESTATED IN BATCH 6b, when the registry stopped being a single
	// phase: "last" now means last among `text-repairs` rules, since
	// `applyTransforms` filters by phase and a `structural-repairs` rule
	// cannot hand this one anything — it runs in a pass that has not
	// started when this rule finishes. Asserted as the last text-repairs
	// POSITION rather than as `RULES.length - 1`, so a structural rule
	// appended after it does not quietly retire the constraint.
	it('trailingWhitespaceDefinition runs last among text-repairs', () => {
		const textIds = RULES.filter((rule) => rule.phase === 'text-repairs').map(
			(rule) => rule.id,
		);
		expect(at('trailing-whitespace-definition')).toBe(
			ids.indexOf(textIds[textIds.length - 1] as string),
		);
		// And the structural rules really are after it, so the phase
		// filter is not doing the work of an ordering nobody checked.
		const structural = RULES.filter(
			(rule) => rule.phase === 'structural-repairs',
		);
		for (const rule of structural) {
			expect(at(rule.id)).toBeGreaterThan(at('trailing-whitespace-definition'));
		}
	});

	it('the three ib- retargets keep their documented relative order', () => {
		expect(at('ib-yoma-2a')).toBeLessThan(at('sifre-ib-resolves-to-yalkut'));
		expect(at('sifre-ib-resolves-to-yalkut')).toBeLessThan(
			at('ib-targum-work-loss'),
		);
	});
});

/** One entry differing from another only in its lone definition — the
 * two-argument fixture the signature tests below compare. */
function defOnly(definition: string): SourceEntry {
	return { content: { senses: [{ definition }] }, headword: 'x', rid: 'A1' };
}

/**
 * The signature earning its own claim, which round 2's `inertRules`
 * lesson says it has to: a hardening whose effectiveness is unasserted
 * is indistinguishable from one that does nothing.
 *
 * These are unit cases, not corpus cases. `registry.order.corpus.test.ts`'s
 * `exactly the WRAP rules ever move an rtl wrapper` proves what the
 * signature says about TODAY'S rules; it cannot prove what it would
 * say about a rule none of them is, and that is the whole point of
 * the round-4 change.
 */
describe('the rtl coverage signature', () => {
	// THE EVASION ROUND 4 CLOSED. Same wrapper, same four covered
	// characters, same tag-stripped text — only the position moves. The
	// character-count signature this replaced returned 2 for both and
	// saw nothing, so a rule doing only this satisfied neither half of
	// the WRAP conjunction and landed in NEITHER, out of rule 4's reach.
	it('distinguishes a wrapper that slides along unchanged text', () => {
		const before = defOnly('<span dir="rtl">אב</span>גד');
		const after = defOnly('אב<span dir="rtl">גד</span>');
		expect(textOf(before)).toBe(textOf(after));
		expect(rtlSpanCoverageOf(before)).not.toBe(rtlSpanCoverageOf(after));
	});

	// THE FALSE POSITIVE THE MERGE PREVENTS, and the reason `extend`
	// exists. Unwrapping a non-span tag INSIDE an rtl span leaves the
	// same wrapper over the same characters; without merging contiguous
	// runs it would split one run into three and read as wrapper work,
	// pulling `italicLonePunctuation` and its neighbours into WRAP.
	it('ignores a non-span tag removed from inside a wrapper', () => {
		const before = defOnly('<span dir="rtl">א<i>ב</i>גד</span>');
		const after = defOnly('<span dir="rtl">אבגד</span>');
		expect(textOf(before)).toBe(textOf(after));
		expect(rtlSpanCoverageOf(before)).toBe(rtlSpanCoverageOf(after));
	});

	// The span TALLY, which `extend`'s merge (in `registry-classes.ts`)
	// makes necessary: two abutting
	// wrappers cover exactly the ranges one does, so ranges alone cannot
	// tell them apart. Neither half of the signature is sufficient.
	it('distinguishes one wrapper from two that abut', () => {
		const before = defOnly('<span dir="rtl">אבגד</span>');
		const after = defOnly('<span dir="rtl">אב</span><span dir="rtl">גד</span>');
		expect(rtlSpanCoverageOf(before)).not.toBe(rtlSpanCoverageOf(after));
	});

	// Anchor-borne dir="rtl" is not wrapper markup for this purpose, and
	// that exclusion is what keeps every unlink rule out of WRAP.
	it('ignores dir="rtl" on an anchor', () => {
		const plain = defOnly('אבגד');
		const linked = defOnly('<a dir="rtl" href="/x">אבגד</a>');
		expect(rtlSpanCoverageOf(plain)).toBe(rtlSpanCoverageOf(linked));
	});
});
