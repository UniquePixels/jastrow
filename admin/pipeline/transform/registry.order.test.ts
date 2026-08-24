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
 * rule added to `RULES` and to neither set would satisfy every
 * ordering above vacuously, and this file would go quietly blind at
 * exactly the moment it is most needed.
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
	'bare-rtl-hebrew',
	'latin-token-inside-rtl-span',
	'redundant-outer-rtl-span',
	'shuruk-as-yod-display-corruption',
]);

const ids = RULES.map((rule) => rule.id);
const at = (id: string): number => ids.indexOf(id);

describe('registry order', () => {
	// Guards the three tests below against going vacuous: a new rule in
	// none of the sets is unclassified, and the orderings would then say
	// nothing about it while still passing.
	it('every registered rule is classified', () => {
		const unclassified = ids.filter(
			(id) => !(UNLINK.has(id) || RETARGET.has(id) || NEITHER.has(id)),
		);
		expect(unclassified).toEqual([]);
		// And the other direction — a set naming a rule that no longer
		// exists is a stale classification, not a passing test.
		const missing = [...UNLINK, ...RETARGET, ...NEITHER].filter(
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

	// The geresh pair is the batch's only registered entanglement, so
	// the assertion above would hold on an empty graph too. Naming it
	// here makes the coverage real: if the edge is ever dropped from
	// `patterns.jsonl`, this fails rather than passing vacuously.
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

	it('the three ib- retargets keep their documented relative order', () => {
		expect(at('ib-yoma-2a')).toBeLessThan(at('sifre-ib-resolves-to-yalkut'));
		expect(at('sifre-ib-resolves-to-yalkut')).toBeLessThan(
			at('ib-targum-work-loss'),
		);
	});
});
