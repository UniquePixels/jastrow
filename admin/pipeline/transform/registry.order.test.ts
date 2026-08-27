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
 *    antecedent search runs.
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
 * The classification below is asserted EXHAUSTIVE. Without that, a
 * rule added to `RULES` and to none of the sets would satisfy every
 * ordering above vacuously, and this file would go quietly blind at
 * exactly the moment it is most needed. Batch 3a added a fourth set
 * rather than widening a third: `gershayim-breaks-ref-attribute`
 * writes a link target without adopting one from a neighbour, which
 * is neither `RETARGET` nor `NEITHER` as those are defined. The gate's
 * case 6 added a FIFTH on the same reasoning (2026-08-27) — `RESTORE`,
 * for a rule that writes a target by relocating bytes inside the
 * anchor's OWN damaged tag — rather than stretching `GLYPH` to cover a
 * second, differently-shaped declaration.
 *
 * And exhaustive is not the same as earned. The corpus pass at the
 * bottom of this file makes membership of `UNLINK`, `WRAP`, `GLYPH`,
 * `RESTORE` and `NEITHER` a measurement over all 32,512 entries rather
 * than an author's claim. `RETARGET` is the one set that cannot be
 * earned that way, and the note there says why.
 */
import { describe, expect, it } from 'bun:test';
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry } from '../body/types.ts';
import { parsePatterns } from '../research/patterns.ts';
import type { TagToken } from './html.ts';
import { DIR_RTL, opensScope, tokenize } from './html.ts';
import { anchors } from './links.ts';
import { fieldsOf, textOf } from './no-new-text.ts';
import {
	checkAdjacency,
	entangledClusters,
	RULES,
	unaccountedEdges,
} from './registry.ts';

const catalogue = parsePatterns(
	await Bun.file('data/patches/patterns.jsonl').text(),
);

/** Rules that REMOVE an anchor, keeping its display text (link spec
 * §2). Every one of them can destroy an antecedent a retarget rule
 * would otherwise read. */
const UNLINK = new Set([
	'apparatus-cite-linked-as-scripture',
	'ellipsis-fragment-anchored',
	'geresh-letter-numeral-mislink',
	// Batch 4's two doubled-anchor rows. Both drop the OUTER layer of a
	// pair sharing one target, so both declare `unlinks` — and rules 1
	// and 4 then require them above every retarget and every wrap rule,
	// which is why they are registered where they are and not beside
	// the rest of their batch.
	//
	// Listing them here is a CLAIM, not an exemption: the corpus pass
	// at the bottom of this file asserts this literal set equals the
	// rules that ever declare an anchor removal across all 32,512
	// entries, so a name that does not belong — or one missing — fails
	// there. (CORRECTED 2026-08-26, impl/phase-2-batch-4: this said the
	// two were "earned into this set by the corpus pass below rather
	// than by being listed here", while listing them. The corpus pass
	// FALSIFIES the list; it does not build it.)
	'nested-anchor-swallows-punctuation',
	'nonsense-dup-anchor',
	'plural-to-feminine-final-letter-mislink',
	'prefixed-geresh-abbrev-mislink',
	'rabbi-name-linked-as-bible-book',
]);

/** Rules that WRITE a link target sourced from another anchor in the
 * same entry — gate cases 2, 3 and 4. `registry.ts` calls these
 * retargets; the link spec's §4 table calls the shape "compose". Same
 * set either way. */
const RETARGET = new Set([
	'ib-targum-work-loss',
	'ib-yoma-2a',
	'sifre-ib-resolves-to-yalkut',
]);

/** Rules that neither remove an anchor nor write a target, so rule 1
 * says nothing about where they sit. The RTL trio used to live here —
 * it moved to `WRAP` on 2026-08-26, because rule 4 DOES say where it
 * sits and a set nothing pins is a set a fourth wrap rule can dodge;
 * `shuruk-as-yod-display-corruption` edits DISPLAY
 * text inside an anchor whose target is already correct and leaves
 * every `href`/`data-ref` byte-identical; and
 * `ascii-quote-as-gershayim-in-body` (batch 3a) repairs a glyph in
 * document text only, every `<…>` tag coming through byte-identical —
 * which is exactly what separates it from its own twin in `GLYPH`
 * below.
 *
 * BATCH 3b ADDS TWELVE, and they are the set's first real test rather
 * than a bulk append. 110 of their seams sit directly against an
 * anchor's closing tag — 57 `</a><i>` and 53 `)</a><i>` (CORRECTED
 * 2026-08-26 from 165, the pre-decline arithmetic 112 + 53, written
 * before both patterns gained the `(?![.,;:?!])` guard) — so "does not
 * move a
 * target" is a claim about markup they demonstrably edit ADJACENT to,
 * not one they are trivially incapable of breaking. Batch 3a's
 * headline finding was a link regression that every per-rule
 * measurement missed. The corpus pass below and
 * `body/pipeline-links.test.ts` are the two things that can see it.
 *
 * Rule 1 says nothing about where any of the twelve sit, but plenty
 * else does: four measured constraints order them among THEMSELVES,
 * and those live in `registry.ts`'s own block comments because they
 * are not about unlinks and retargets at all.
 *
 * Membership here is EARNED rather than declared: the corpus pass at
 * the bottom of this file checks that no rule in this set ever
 * declares an anchor removal and that none of them changes a single
 * `href` or `data-ref` anywhere in 32,512 entries. */
const NEITHER = new Set([
	'anchor-italic-no-space',
	// BATCH 4 ADDS FOUR, and they are the set's second real test after
	// batch 3b's twelve. These four move one of the anchor's own tags
	// across the text beside it — `</a>` across a `)`, a `<sup>` run or
	// a digit, and in `open-paren-in-anchor-display` the OPENING tag
	// across a `(` (CORRECTED 2026-08-26, impl/phase-2-batch-4: this
	// said all four move "the anchor's own closing tag", which is true
	// of three of them; the open-paren rule is the opposite polarity in
	// the opposite tag) — so "removes no anchor and writes no target"
	// is a claim about markup they demonstrably rewrite INSIDE, not one
	// they are incapable of breaking. The corpus pass below earns it:
	// every anchor's parsed
	// `href`/`data-ref` pair is compared before and after over all
	// 32,512 entries, and `stranded-tail.test.ts` compares the whole
	// opening-tag multiset besides.
	'anchor-swallows-close-paren',
	'ascii-quote-as-gershayim-in-body',
	'citation-number-truncated-outside-anchor',
	'em-dash-section-break-in-own-italic',
	'emphasis-run-edge-space',
	'geresh-abbrev-space-loss',
	'italic-close-paren-nospace',
	'italic-lone-punctuation',
	'italic-swallowed-terminal-period',
	'italic-swallows-close-paren',
	'label-period-outside-italic',
	'open-paren-in-anchor-display',
	'paren-tag-no-space',
	'shuruk-as-yod-display-corruption',
	'superscript-subsection-stranded-outside-anchor',
	'trailing-whitespace-definition',
	'translit-italic-space-loss',
]);

/** Rules that MOVE `dir="rtl"` wrapper markup — the subject of rule 4's
 * second half, and a set rather than a literal so that a fourth wrap
 * rule cannot land in `NEITHER`, satisfy the exhaustiveness assertion
 * and leave rule 4 passing vacuously above the unlinks.
 *
 * Like `UNLINK`, membership is EARNED over all 32,512 entries, and by
 * the conjunction the rtl module already claims for itself: "They move
 * wrappers; the text bytes are untouched" (`rules/rtl.ts`). So a WRAP
 * rule is one that, somewhere in the corpus,
 *
 *   (a) changes how many characters sit under a `<span dir="rtl">`
 *       scope, AND
 *   (b) never changes the tag-stripped text, in any entry.
 *
 * Both halves are load-bearing, and (b) carries MORE of the weight
 * since round 4 made (a) position-sensitive. Measured over the corpus:
 * under the old character-count signature (a) alone admitted the trio
 * plus `geresh-abbrev-space-loss`; under the position signature it
 * admits the trio plus SEVEN — every seam rule that inserts or deletes
 * a space, because shifting the stripped text shifts every rtl offset
 * after it. All seven are excluded by (b), and the set is unchanged,
 * but a future weakening of (b) would now over-collect badly rather
 * than by one. (b) alone, meanwhile, admits every unlink rule.
 *
 * Together they measure exactly the trio, and they measure the
 * PROPERTY rather than the names: a fourth rule that moves rtl
 * wrappers joins this set or fails the corpus test below. The
 * conjunction's own blind spot, stated rather than left to be found: a
 * rule that moves a wrapper AND edits text in the same pass fails (b)
 * and would be missed. No shipped rule does both, and the two classes
 * have stayed disjoint through four batches, but that is a fact about
 * today's rules and not a property of the measurement. `dir="rtl"` on an ANCHOR is deliberately not counted — an
 * unlink rule removing `<a dir="rtl">` changes rtl coverage without
 * being a wrap rule, and rule 4 is about the two classes being
 * distinct. */
const WRAP = new Set([
	'bare-rtl-hebrew',
	'latin-token-inside-rtl-span',
	'redundant-outer-rtl-span',
]);

/** Rules that rewrite a link target IN PLACE, by glyph substitution
 * on the anchor's OWN bytes — gate case 5, and a fourth class rather
 * than a corner of `NEITHER` because these rules DO write a target.
 *
 * Rule 1 still says nothing about where they sit, and the reason is
 * the source of the target rather than the fact of writing one: a
 * retarget adopts a NEIGHBOURING anchor, which an unlink rule may be
 * about to delete, while a glyph correction reads only the anchor it
 * is repairing. There is no antecedent to be handed a wrong address
 * by. The registry appends the pair last anyway (see `registry.ts`),
 * and that placement is measured free — moving the pair to the front
 * of `RULES` leaves all 32,512 entries byte-identical, and the pair
 * fires on the same 1,386 / 85 entries composed as it does alone. */
const GLYPH = new Set(['gershayim-breaks-ref-attribute']);

/** Rules that RESTORE a link target by relocating bytes inside the
 * anchor's own damaged tag — gate case 6, and a fifth class on exactly
 * the reasoning that made `GLYPH` a fourth. These rules DO write a
 * target, so `NEITHER` is false of them; they adopt it from no
 * neighbour, so `RETARGET` is false too.
 *
 * Rule 1 says nothing about where they sit, for `GLYPH`'s reason — a
 * restoration reads only the anchor it is repairing, so there is no
 * antecedent an unlink rule could destroy underneath it. Something
 * else does: `unterminatedHref` runs FIRST in `RULES`, because the
 * damage it repairs makes the tokenizer read every following anchor as
 * `interior` and both editors refuse those. That is a placement
 * argument about the PARSER rather than about targets, so it lives in
 * `registry.ts`'s own block and not in one of the four rules here.
 *
 * Membership is EARNED exactly as `GLYPH`'s is, and by the same
 * mechanism: a rule that writes a target this way MUST declare
 * `restored` or `run.ts`'s gate refuses it, so the corpus pass below
 * asserts this literal set equals the rules that ever declare one. */
const RESTORE = new Set(['unterminated-href-swallows-closing-tag']);

/** The six classifications, named ONCE. Both halves of the
 * classification test read this, so a seventh class added to one half
 * and forgotten in the other is not a thing that can happen. */
const CLASSES: ReadonlySet<string>[] = [
	UNLINK,
	RETARGET,
	NEITHER,
	GLYPH,
	RESTORE,
	WRAP,
];

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

	it('every unlink rule precedes every retarget rule', () => {
		const lastUnlink = Math.max(...[...UNLINK].map(at));
		const firstRetarget = Math.min(...[...RETARGET].map(at));
		expect(lastUnlink).toBeLessThan(firstRetarget);
	});

	// Rule 4, UNLINK BEFORE WRAP — see the header for why. Asserted
	// over the whole of BOTH sets, never over the ids that happen to be
	// in them today: `at()` throws on an unregistered id, `CLASSES`
	// requires every registered rule to be in some set, and the corpus
	// pass below requires `UNLINK` and `WRAP` to be exactly the rules
	// that behave that way. A new rule on either side therefore fails
	// something loudly rather than widening a gap this test cannot see.
	it('every unlink rule precedes every rtl wrap rule', () => {
		const lastUnlink = Math.max(...[...UNLINK].map(at));
		const firstWrap = Math.min(...[...WRAP].map(at));
		expect(lastUnlink).toBeLessThan(firstWrap);
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
			[
				'em-dash-section-break-in-own-italic',
				'emphasis-run-edge-space',
				'italic-swallowed-terminal-period',
				'label-period-outside-italic',
			],
		]);
	});

	// The same clusters, now checked for contiguity one by one rather
	// than through `checkAdjacency`'s aggregate — so a failure names the
	// cluster and its span, and so this test cannot be satisfied by
	// there being no clusters at all.
	it('every derived cluster occupies a gap-free span', () => {
		const clusters = entangledClusters(catalogue, RULES);
		expect(clusters).toHaveLength(3);
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
	it('every recorded edge touching the registry is validated or reported', () => {
		expect(unaccountedEdges(catalogue, RULES)).toEqual([
			'anchor-swallows-close-paren ~ tosefta-variant-chapter-halakha-loss: recorded entanglement is invisible to the adjacency gate',
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
	it('trailingWhitespaceDefinition runs last', () => {
		expect(at('trailing-whitespace-definition')).toBe(RULES.length - 1);
	});

	it('the three ib- retargets keep their documented relative order', () => {
		expect(at('ib-yoma-2a')).toBeLessThan(at('sifre-ib-resolves-to-yalkut'));
		expect(at('sifre-ib-resolves-to-yalkut')).toBeLessThan(
			at('ib-targum-work-loss'),
		);
	});
});

/**
 * The classification above, EARNED over the corpus rather than
 * declared in a docstring — the review's question about the two
 * "rule 1 says nothing" buckets (`NEITHER` and `GLYPH`).
 *
 * One pass, shared by the three tests below, recording what each rule
 * ever declares to the gates and whether any `NEITHER` rule ever moves
 * an anchor's target.
 *
 * Behind a lazily-awaited cached promise, on `body/pipeline-links.
 * test.ts`'s shape, rather than at module scope. Module evaluation is
 * covered by NO test timeout, so a slow corpus there fails the suite
 * with nothing naming the cause; and the cost — 32,512 entries times
 * every rule — is paid on every import of this file, including a
 * filtered run of the cheap registry-order tests above, which need
 * none of it.
 *
 * WHAT THIS CAN AND CANNOT EARN, measured rather than assumed.
 * Declarations earn `UNLINK`, `GLYPH` and `RESTORE` in both
 * directions, because a rule that removes an anchor MUST declare
 * `unlinks`, a rule that writes a target by glyph substitution MUST
 * declare `glyphCorrected`, and a rule that restores one out of a
 * damaged tag MUST declare `restored` — `run.ts`'s gates fail
 * otherwise. They cannot earn `RETARGET`:
 * gate case 2 admits a target COPIED VERBATIM from another anchor in
 * the same entry with no declaration at all, and `ib-yoma-2a` is the
 * live proof — it retargets 188 entries and declares nothing corpus-
 * wide. So `NEITHER`'s "writes no target" half is earned the other
 * way, by walking every anchor's parsed `href` and `data-ref` before
 * and after and requiring them identical.
 */
const DECLARED = new Map<string, Set<string>>(
	RULES.map((rule) => [rule.id, new Set<string>()]),
);
const MOVED_A_TARGET = new Set<string>();
const MOVED_A_WRAPPER = new Set<string>();
const MOVED_TEXT = new Set<string>();

/** An opening tag that puts text into rtl.
 *
 * `<span dir="rtl">` only. Scopes are tracked by hand rather than read
 * off `Token.rtl`, which reports ANY rtl ancestor and so counts
 * `<a dir="rtl">` too — counting anchors would put every unlink rule in
 * `WRAP`, which is precisely the distinction rule 4 rests on. */
function opensRtlSpan(token: TagToken): boolean {
	return token.name === 'span' && DIR_RTL.test(token.value);
}

/** Append `[from, to)` to `runs`, extending the previous run instead
 * when the two abut. The merge is not cosmetic: without it, inserting
 * or removing a NON-span tag inside an rtl span splits one run into
 * several and the rule reads as a wrapper move. `italicLonePunctuation`
 * unwrapping `<i>.</i>` is the live case. */
function extend(runs: number[][], from: number, to: number): void {
	const last = runs.at(-1);
	if (last?.[1] === from) {
		last[1] = to;
		return;
	}
	runs.push([from, to]);
}

/**
 * WHERE the `<span dir="rtl">` wrappers sit in one field: how many
 * there are, and which offset ranges of the TAG-STRIPPED text they
 * cover, contiguous runs merged.
 *
 * POSITION-SENSITIVE, and it has to be. This was a single character
 * COUNT per field until review round 4, which meant a rule that MOVED
 * a wrapper without changing how much text it covers — `covers 4
 * characters from offset 0` becoming `covers 4 characters from offset
 * 7` — produced the same count and the same stripped text, satisfied
 * NEITHER half of the `WRAP` conjunction, and landed in `NEITHER`
 * where rule 4 could not see it. The same evasion the 3-id literal
 * had, one level down.
 *
 * WHAT THE SIGNATURE DISTINGUISHES, since the next reader needs the
 * boundary rather than the intent:
 *
 * - a wrapper appearing or disappearing (the count moves);
 * - a wrapper growing, shrinking, or SLIDING along the text (the
 *   ranges move) — this is what round 4 added;
 * - a wrapper whose text is edited underneath it, only insofar as the
 *   edit changes lengths. Text edits are the OTHER half of the
 *   conjunction and are caught there, by `textOf`.
 *
 * WHAT IT DOES NOT DISTINGUISH:
 *
 * - splitting one rtl span into two that abut and cover exactly the
 *   same characters, or the reverse. The merge makes those identical
 *   ranges — but not identical COUNTS, so the span tally catches it.
 *   Both halves are needed; neither is sufficient.
 * - which span covers which range, when two spans swap identical
 *   ranges. No rule can do this without moving text, which `textOf`
 *   catches.
 * - anything about `<a dir="rtl">`, deliberately — see
 *   `opensRtlSpan`.
 */
function coverageSignatureIn(field: string): [number, number[][]] {
	const scopes: boolean[] = [];
	const runs: number[][] = [];
	let opens = 0;
	// `offset`, not `at` — the module's `at(id)` is the registry-position
	// helper every ordering assertion runs through, and shadowing it here
	// is a `noShadow` warning that `qa:lint --error-on-warnings` fails on.
	let offset = 0;
	for (const token of tokenize(field)) {
		if (token.kind === 'text') {
			if (scopes.includes(true) && token.value.length > 0) {
				extend(runs, offset, offset + token.value.length);
			}
			offset += token.value.length;
		} else if (token.close) {
			scopes.pop();
		} else if (opensScope(token.value)) {
			const rtl = opensRtlSpan(token);
			opens += rtl ? 1 : 0;
			scopes.push(rtl);
		}
	}
	return [opens, runs];
}

function rtlSpanCoverageOf(entry: SourceEntry): string {
	return JSON.stringify(fieldsOf(entry).map(coverageSignatureIn));
}

/** Every anchor's parsed target pair, in walk order. */
function targetsOf(entry: SourceEntry): string {
	return JSON.stringify(
		fieldsOf(entry).flatMap((field) =>
			anchors(tokenize(field)).map((anchor) => [anchor.href, anchor.dataRef]),
		),
	);
}

let scanned: Promise<void> | null = null;

/** The corpus pass itself, run once however many tests await it. */
function scan(): Promise<void> {
	scanned ??= (async (): Promise<void> => {
		for await (const source of readSourceEntries()) {
			const before = targetsOf(source);
			const coverage = rtlSpanCoverageOf(source);
			const text = textOf(source);
			for (const rule of RULES) {
				const out = rule.apply(source);
				if (out.entry !== source) {
					if (rtlSpanCoverageOf(out.entry) !== coverage) {
						MOVED_A_WRAPPER.add(rule.id);
					}
					if (textOf(out.entry) !== text) {
						MOVED_TEXT.add(rule.id);
					}
				}
				const kinds = DECLARED.get(rule.id) as Set<string>;
				if ((out.unlinks ?? 0) > 0) {
					kinds.add('unlinks');
				}
				if ((out.composed ?? []).length > 0) {
					kinds.add('composed');
				}
				if ((out.recombined ?? []).length > 0) {
					kinds.add('recombined');
				}
				if ((out.glyphCorrected ?? []).length > 0) {
					kinds.add('glyphCorrected');
				}
				if ((out.restored ?? []).length > 0) {
					kinds.add('restored');
				}
				if (
					(NEITHER.has(rule.id) || WRAP.has(rule.id)) &&
					targetsOf(out.entry) !== before
				) {
					MOVED_A_TARGET.add(rule.id);
				}
			}
		}
	})();
	return scanned;
}

/** Explicit rather than `toSorted()`'s implicit UTF-16 order
 * (`typescript:S2871`), and the SAME comparator on both sides of every
 * comparison below — two orderings would make an equal pair of sets
 * read as unequal. */
const byId = (a: string, b: string): number => a.localeCompare(b);

/** Rules that ever declared `kind` over the whole corpus, sorted. */
function everDeclared(kind: string): string[] {
	return [...DECLARED]
		.filter(([, kinds]) => kinds.has(kind))
		.map(([id]) => id)
		.toSorted(byId);
}

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
 * These are unit cases, not corpus cases. `exactly the WRAP rules ever
 * move an rtl wrapper` below proves what the signature says about
 * TODAY'S rules; it cannot prove what it would say about a rule none
 * of them is, and that is the whole point of the round-4 change.
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

	// The span TALLY, which the merge above makes necessary: two abutting
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

describe('the classification is earned, not declared', () => {
	it('exactly the UNLINK rules ever remove an anchor', async () => {
		await scan();
		expect(everDeclared('unlinks')).toEqual([...UNLINK].toSorted(byId));
	}, 180_000);

	it('exactly the GLYPH rules ever correct a target in place', async () => {
		await scan();
		expect(everDeclared('glyphCorrected')).toEqual([...GLYPH].toSorted(byId));
	}, 180_000);

	// `RESTORE` earned on `GLYPH`'s mechanism: gate case 6 licenses a
	// target only against a `restored` declaration, so a rule that
	// restores one and does not declare it is refused by `run.ts` rather
	// than quietly classified here. Both directions, like `GLYPH`: a
	// rule declaring `restored` and missing from this set fails, and a
	// name in this set that never declares one fails too.
	it('exactly the RESTORE rules ever restore a target from damaged bytes', async () => {
		await scan();
		expect(everDeclared('restored')).toEqual([...RESTORE].toSorted(byId));
	}, 180_000);

	it('no NEITHER or WRAP rule removes an anchor or moves a target', async () => {
		await scan();
		expect([...MOVED_A_TARGET]).toEqual([]);
		expect(
			[...NEITHER, ...WRAP].filter((id) => (DECLARED.get(id)?.size ?? 0) > 0),
		).toEqual([]);
	}, 180_000);

	// `WRAP` earned, and the reason rule 4's second side is a set. The
	// conjunction is the rtl module's own claim about itself: it moves
	// wrappers (a) and leaves the text bytes alone (b). Measured:
	// `geresh-abbrev-space-loss` satisfies (a) alone — its inserted
	// space sometimes lands inside an rtl span — and is excluded by
	// (b); every unlink rule satisfies (b) alone and is excluded by
	// (a), because anchor-borne `dir="rtl"` is not counted.
	//
	// A fourth rtl wrap rule therefore cannot ship quietly: it fails
	// HERE until it is added to `WRAP`, and adding it to `WRAP` puts it
	// under rule 4. That is the hole the first draft of rule 4 left,
	// which wrote the wrap side as three hardcoded ids.
	it('exactly the WRAP rules ever move an rtl wrapper', async () => {
		await scan();
		const moversOnly = [...MOVED_A_WRAPPER]
			.filter((id) => !MOVED_TEXT.has(id))
			.toSorted(byId);
		expect(moversOnly).toEqual([...WRAP].toSorted(byId));
	}, 180_000);
});
