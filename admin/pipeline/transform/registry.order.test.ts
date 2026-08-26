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
 * Three orderings are asserted, each stating a behavioural rule rather
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
 *
 * The classification below is asserted EXHAUSTIVE. Without that, a
 * rule added to `RULES` and to none of the sets would satisfy every
 * ordering above vacuously, and this file would go quietly blind at
 * exactly the moment it is most needed. Batch 3a added a fourth set
 * rather than widening a third: `gershayim-breaks-ref-attribute`
 * writes a link target without adopting one from a neighbour, which
 * is neither `RETARGET` nor `NEITHER` as those are defined.
 *
 * And exhaustive is not the same as earned. The corpus pass at the
 * bottom of this file makes membership of `UNLINK`, `GLYPH` and
 * `NEITHER` a measurement over all 32,512 entries rather than an
 * author's claim. `RETARGET` is the one set that cannot be earned
 * that way, and the note there says why.
 */
import { describe, expect, it } from 'bun:test';
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry } from '../body/types.ts';
import { parsePatterns } from '../research/patterns.ts';
import { tokenize } from './html.ts';
import { anchors } from './links.ts';
import { fieldsOf } from './no-new-text.ts';
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
 * says nothing about where they sit. The RTL trio rewrites wrapper
 * markup around text; `shuruk-as-yod-display-corruption` edits DISPLAY
 * text inside an anchor whose target is already correct and leaves
 * every `href`/`data-ref` byte-identical; and
 * `ascii-quote-as-gershayim-in-body` (batch 3a) repairs a glyph in
 * document text only, every `<…>` tag coming through byte-identical —
 * which is exactly what separates it from its own twin in `GLYPH`
 * below.
 *
 * BATCH 3b ADDS TWELVE, and they are the set's first real test rather
 * than a bulk append. 165 of their seams sit directly against an
 * anchor's closing tag — `</a><i>`, `)</a><i>` — so "does not move a
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
	'ascii-quote-as-gershayim-in-body',
	'bare-rtl-hebrew',
	'em-dash-section-break-in-own-italic',
	'emphasis-run-edge-space',
	'geresh-abbrev-space-loss',
	'italic-close-paren-nospace',
	'italic-lone-punctuation',
	'italic-swallowed-terminal-period',
	'italic-swallows-close-paren',
	'label-period-outside-italic',
	'latin-token-inside-rtl-span',
	'paren-tag-no-space',
	'redundant-outer-rtl-span',
	'shuruk-as-yod-display-corruption',
	'trailing-whitespace-definition',
	'translit-italic-space-loss',
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

const ids = RULES.map((rule) => rule.id);
const at = (id: string): number => ids.indexOf(id);

describe('registry order', () => {
	// Guards the orderings below against going vacuous: a new rule in
	// none of the sets is unclassified, and they would then say nothing
	// about it while still passing.
	it('every registered rule is classified', () => {
		const unclassified = ids.filter(
			(id) =>
				!(
					UNLINK.has(id) ||
					RETARGET.has(id) ||
					NEITHER.has(id) ||
					GLYPH.has(id)
				),
		);
		expect(unclassified).toEqual([]);
		// And the other direction — a set naming a rule that no longer
		// exists is a stale classification, not a passing test.
		const missing = [...UNLINK, ...RETARGET, ...NEITHER, ...GLYPH].filter(
			(id) => !ids.includes(id),
		);
		expect(missing).toEqual([]);
	});

	it('every unlink rule precedes every retarget rule', () => {
		const lastUnlink = Math.max(...[...UNLINK].map(at));
		const firstRetarget = Math.min(...[...RETARGET].map(at));
		expect(lastUnlink).toBeLessThan(firstRetarget);
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
			[
				'bare-rtl-hebrew',
				'latin-token-inside-rtl-span',
				'redundant-outer-rtl-span',
			],
			['geresh-letter-numeral-mislink', 'prefixed-geresh-abbrev-mislink'],
			['italic-swallowed-terminal-period', 'label-period-outside-italic'],
		]);
	});

	// The same clusters, now checked for contiguity one by one rather
	// than through `checkAdjacency`'s aggregate — so a failure names the
	// cluster and its span, and so this test cannot be satisfied by
	// there being no clusters at all.
	it('every derived cluster occupies a gap-free span', () => {
		const clusters = entangledClusters(catalogue, RULES);
		expect(clusters).toHaveLength(4);
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
	// Empty today over 18 recorded entries / 9 undirected edges: 5 have
	// both endpoints registered and sit inside the three clusters
	// above, and 4 have neither endpoint registered, which execution
	// order cannot be wrong about. It is NOT a restatement of
	// `checkAdjacency` returning clean — a dropped component leaves
	// that clean and lands here.
	it('every recorded edge touching the registry is validated or reported', () => {
		expect(unaccountedEdges(catalogue, RULES)).toEqual([]);
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
 * Declarations earn `UNLINK` and `GLYPH` in both directions, because
 * a rule that removes an anchor MUST declare `unlinks` and a rule that
 * writes a target by glyph substitution MUST declare `glyphCorrected`
 * — `run.ts`'s gates fail otherwise. They cannot earn `RETARGET`:
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
			for (const rule of RULES) {
				const out = rule.apply(source);
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
				if (NEITHER.has(rule.id) && targetsOf(out.entry) !== before) {
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

describe('the classification is earned, not declared', () => {
	it('exactly the UNLINK rules ever remove an anchor', async () => {
		await scan();
		expect(everDeclared('unlinks')).toEqual([...UNLINK].toSorted(byId));
	}, 180_000);

	it('exactly the GLYPH rules ever correct a target in place', async () => {
		await scan();
		expect(everDeclared('glyphCorrected')).toEqual([...GLYPH].toSorted(byId));
	}, 180_000);

	it('no NEITHER rule removes an anchor or moves a target', async () => {
		await scan();
		expect([...MOVED_A_TARGET]).toEqual([]);
		expect(
			[...NEITHER].filter((id) => (DECLARED.get(id)?.size ?? 0) > 0),
		).toEqual([]);
	}, 180_000);
});
