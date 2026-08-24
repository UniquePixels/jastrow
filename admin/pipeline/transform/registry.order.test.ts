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
 */
import { describe, expect, it } from 'bun:test';
import { parsePatterns } from '../research/patterns.ts';
import { checkAdjacency, RULES } from './registry.ts';

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
 * every `href`/`data-ref` byte-identical. Both were measured free of
 * position (see `registry.ts`). */
const NEITHER = new Set([
	'ascii-quote-as-gershayim-in-body',
	'bare-rtl-hebrew',
	'latin-token-inside-rtl-span',
	'redundant-outer-rtl-span',
	'shuruk-as-yod-display-corruption',
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

	// `checkAdjacency` skips any cluster with fewer than two REGISTERED
	// members, so the assertion above would hold on an empty graph too.
	// Naming each registered entanglement here makes the coverage real:
	// drop an edge from `patterns.jsonl` and this fails, where the
	// assertion above would quietly go back to passing on nothing.
	it('the geresh pair is entangled in the catalogue and adjacent in the registry', () => {
		const row = catalogue.find((r) => r.id === 'geresh-letter-numeral-mislink');
		expect(row?.entangledWith).toEqual(['prefixed-geresh-abbrev-mislink']);
		expect(
			Math.abs(
				at('geresh-letter-numeral-mislink') -
					at('prefixed-geresh-abbrev-mislink'),
			),
		).toBe(1);
	});

	// The gershayim pair (batch 3a), the second registered entanglement
	// and the reason the comment above says "each". The edge was written
	// into `patterns.jsonl` in the same task that registered the rules,
	// precisely so `checkAdjacency` would have a cluster to judge rather
	// than two singletons it skips.
	it('the gershayim pair is entangled in the catalogue and adjacent in the registry', () => {
		const body = catalogue.find(
			(r) => r.id === 'ascii-quote-as-gershayim-in-body',
		);
		const tag = catalogue.find(
			(r) => r.id === 'gershayim-breaks-ref-attribute',
		);
		expect(body?.entangledWith).toEqual(['gershayim-breaks-ref-attribute']);
		expect(tag?.entangledWith).toEqual(['ascii-quote-as-gershayim-in-body']);
		expect(
			at('gershayim-breaks-ref-attribute') -
				at('ascii-quote-as-gershayim-in-body'),
		).toBe(1);
	});

	it('the three ib- retargets keep their documented relative order', () => {
		expect(at('ib-yoma-2a')).toBeLessThan(at('sifre-ib-resolves-to-yalkut'));
		expect(at('sifre-ib-resolves-to-yalkut')).toBeLessThan(
			at('ib-targum-work-loss'),
		);
	});
});
