/**
 * The corpus tier for `rules/paren-boundary.ts`, in its own file
 * beside `edge-trim-corpus`, `italic-paren-corpus` and
 * `seam-space-corpus` — the module's convention for a tier that reads
 * all 32,512 entries.
 *
 * Three things are asserted here that the fixture tier cannot reach:
 * the catalogued populations, the per-entry gate stack (including the
 * empty-display invariant the anchor count does NOT give — see the
 * rule module's docstring), and the COMPOSITION of the two rules in
 * both orders. That last one is why this file exists rather than a
 * paragraph: the module claims the two rules are disjoint, and 9
 * corpus entries carry both shapes, so the claim is testable on live
 * data instead of being left as prose.
 */
import { describe, expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry } from '../../body/types.ts';
import { tokenize } from '../html.ts';
import { checkLinkTargets } from '../link-target.ts';
import { anchors } from '../links.ts';
import { checkMarkup } from '../markup.ts';
import { checkNoNewText, fieldsOf } from '../no-new-text.ts';
import type { Rule, TransformResult } from '../types.ts';
import {
	openParenInAnchorDisplay,
	toseftaCloseParen,
	toseftaSplits,
} from './paren-boundary.ts';

/** One row's running totals: occurrences, and the entries they fall
 * in. `count.ts` measures ENTRIES; the catalogue reasons quote both. */
interface Tally {
	entries: Set<string>;
	occurrences: number;
}

const tally = (): Tally => ({ entries: new Set<string>(), occurrences: 0 });

const add = (into: Tally, rid: string, by: number): void => {
	if (by > 0) {
		into.occurrences += by;
		into.entries.add(rid);
	}
};

const anchorsOf = (entry: SourceEntry): ReturnType<typeof anchors> =>
	fieldsOf(entry).flatMap((text) => anchors(tokenize(text)));

/** One entry's anchor figures.
 *
 * `hollow` counts anchors whose DISPLAY is empty — a link with nothing
 * to click. It is here because an invariant anchor count does NOT
 * establish "no link lost": `<a>(</a>)` clears the count and all four
 * gates while being a hollowed-out link. See the rule module's
 * docstring. */
interface Baseline {
	hollow: number;
	links: number;
}

/** Both figures off ONE `anchorsOf` walk. They used to be two
 * functions each doing their own walk, called on the same input entry
 * by both `sweep` and `composeBothWays` — four redundant tokenizations
 * of every one of the 32,512 entries. Computing the input side once
 * per entry and passing it down is the whole of that saving; no
 * assertion changes. */
const baselineOf = (entry: SourceEntry): Baseline => {
	const found = anchorsOf(entry);
	return {
		hollow: found.filter((anchor) => anchor.display === '').length,
		links: found.length,
	};
};

/**
 * Every gate a registered rule would face, run per entry so a
 * violation names the entry that caused it rather than a total.
 *
 * The two COUNT assertions carry their identification in a label
 * rather than in the failure alone. `expect(3).toBe(4)` over 32,512
 * entries and two rules names neither the entry nor the rule, which is
 * useless precisely when it fires; comparing labelled strings puts the
 * rid and the rule id in the diff.
 */
function assertClean(
	entry: SourceEntry,
	base: Baseline,
	pairs: readonly [Rule, TransformResult][],
): void {
	const { hollow, links } = base;
	for (const [rule, result] of pairs) {
		const at = `${entry.rid} under ${rule.id}`;
		const got = baselineOf(result.entry);
		expect(`${got.links} anchors at ${at}`).toBe(`${links} anchors at ${at}`);
		expect(`${got.hollow} empty displays at ${at}`).toBe(
			`${hollow} empty displays at ${at}`,
		);
		expect(checkLinkTargets(entry, result.entry, result)).toEqual([]);
		expect(checkNoNewText(entry, result.entry, rule)).toEqual([]);
		expect(checkMarkup(entry, result.entry)).toEqual([]);
	}
}

/** The shared walk's two arms over one entry: a primary whose
 * `data-ref` has no `:` lost its halakha, one that has a `:` carries a
 * halakha disagreeing with print. */
function splitArms(entry: SourceEntry): { disagree: number; lost: number } {
	const primaries = fieldsOf(entry).flatMap((text) =>
		toseftaSplits(tokenize(text)).map(({ primary }) => primary),
	);
	const disagree = primaries.filter((p) => p.dataRef.includes(':')).length;
	return { disagree, lost: primaries.length - disagree };
}

const splitsIn = (entry: SourceEntry): number =>
	fieldsOf(entry).reduce(
		(sum, text) => sum + toseftaSplits(tokenize(text)).length,
		0,
	);

/** `open-paren-in-anchor-display`'s own site count, read back off an
 * entry — the OUTPUT-side half `splitsIn` already gives the other row.
 * Asymmetric coverage is how the empty-display hole stayed invisible:
 * a rule with no output-side delta is a rule nobody has looked at
 * afterwards. */
function openParenSitesIn(entry: SourceEntry): number {
	return fieldsOf(entry)
		.flatMap((text) => {
			const tokens = tokenize(text);
			return anchors(tokens).map((anchor) => {
				const after = tokens[anchor.close + 1];
				return (
					anchor.display.startsWith('(') &&
					after?.kind === 'text' &&
					after.value.startsWith(')')
				);
			});
		})
		.filter(Boolean).length;
}

/** Serialize an entry's fields for order-comparison. `fieldsOf` walks
 * a stable field order, so two entries with equal field lists are
 * byte-identical everywhere any rule here can write. */
const fieldsKey = (entry: SourceEntry): string =>
	JSON.stringify(fieldsOf(entry));

/** Everything one entry contributes, so the corpus loop stays a loop
 * and not a function `noExcessiveLinesPerFunction` has to forgive. */
interface Totals {
	/** Entries carrying BOTH arms of the shared walk. Non-zero, which is
	 * why the two arms' ENTRY counts do not sum to 493 the way their
	 * occurrence counts sum to 525. */
	bothArms: number;
	disagree: number;
	inducedClose: number;
	inducedOpen: number;
	lost: number;
	openSitesAfter: number;
	orderDependent: number;
	splitsAfter: number;
}

const ZERO: Totals = {
	bothArms: 0,
	disagree: 0,
	inducedClose: 0,
	inducedOpen: 0,
	lost: 0,
	openSitesAfter: 0,
	orderDependent: 0,
	splitsAfter: 0,
};

/**
 * The disjointness claim, COMPOSED rather than asserted in prose.
 *
 * Run the pair both ways and require the same bytes, and require
 * neither rule to hand the other a site it did not already have. 9
 * corpus entries carry both shapes at different offsets, so this is
 * live evidence rather than a vacuous check over untouched entries.
 */
function composeBothWays(
	entry: SourceEntry,
	base: Baseline,
	c: TransformResult,
	p: TransformResult,
): Pick<Totals, 'inducedClose' | 'inducedOpen' | 'orderDependent'> {
	const closeThenOpen = openParenInAnchorDisplay.apply(c.entry);
	const openThenClose = toseftaCloseParen.apply(p.entry);
	assertClean(entry, base, [
		[openParenInAnchorDisplay, closeThenOpen],
		[toseftaCloseParen, openThenClose],
	]);
	return {
		inducedClose: openThenClose.records.length - c.records.length,
		inducedOpen: closeThenOpen.records.length - p.records.length,
		orderDependent:
			fieldsKey(closeThenOpen.entry) === fieldsKey(openThenClose.entry) ? 0 : 1,
	};
}

/** Every row's tally, accumulated in one pass over the corpus. Split
 * out of the `it` so neither is a function the line-length lint has to
 * forgive; the assertions read better on their own anyway. */
async function sweep(): Promise<{
	close: Tally;
	disagree: Tally;
	halakha: Tally;
	pairs: Tally;
	paren: Tally;
	sum: Totals;
}> {
	const close = tally();
	const paren = tally();
	const pairs = tally();
	const halakha = tally();
	const disagree = tally();
	let sum: Totals = ZERO;
	for await (const entry of readSourceEntries()) {
		const base = baselineOf(entry);
		const c = toseftaCloseParen.apply(entry);
		const p = openParenInAnchorDisplay.apply(entry);
		add(close, entry.rid, c.records.length);
		add(paren, entry.rid, p.records.length);
		assertClean(entry, base, [
			[toseftaCloseParen, c],
			[openParenInAnchorDisplay, p],
		]);
		const arms = splitArms(entry);
		add(pairs, entry.rid, arms.disagree + arms.lost);
		add(halakha, entry.rid, arms.lost);
		add(disagree, entry.rid, arms.disagree);
		const composed = composeBothWays(entry, base, c, p);
		sum = {
			bothArms: sum.bothArms + (arms.lost > 0 && arms.disagree > 0 ? 1 : 0),
			disagree: sum.disagree + arms.disagree,
			inducedClose: sum.inducedClose + composed.inducedClose,
			inducedOpen: sum.inducedOpen + composed.inducedOpen,
			lost: sum.lost + arms.lost,
			openSitesAfter: sum.openSitesAfter + openParenSitesIn(p.entry),
			orderDependent: sum.orderDependent + composed.orderDependent,
			splitsAfter: sum.splitsAfter + splitsIn(c.entry),
		};
	}
	return { close, disagree, halakha, pairs, paren, sum };
}

describe('corpus tier', () => {
	it('all three rows reproduce, and no link is lost', async () => {
		const { close, disagree, halakha, pairs, paren, sum } = await sweep();
		// anchor-swallows-close-paren, catalogued 493 ENTRIES.
		expect(close.occurrences).toBe(525);
		expect(close.entries.size).toBe(493);
		// The population the shared walk sees, and its two arms.
		expect(pairs.occurrences).toBe(525);
		expect(pairs.entries.size).toBe(493);
		expect(sum.disagree).toBe(111);
		// tosefta-variant-chapter-halakha-loss, catalogued 391 ENTRIES.
		// Pinned, NOT repaired — see `paren-boundary.test.ts`'s blocked
		// describe and the rule module's docstring.
		expect(sum.lost).toBe(414);
		expect(halakha.occurrences).toBe(414);
		expect(halakha.entries.size).toBe(391);
		// STRICT SUBSET, not an equal population, and the entry counts
		// are not additive the way the occurrence counts are:
		// 414 + 111 = 525 but 391 + 107 - 5 = 493.
		expect(disagree.occurrences).toBe(111);
		expect(disagree.entries.size).toBe(107);
		expect(sum.bothArms).toBe(5);
		// open-paren-in-anchor-display, catalogued 214 ENTRIES.
		expect(paren.occurrences).toBe(225);
		expect(paren.entries.size).toBe(214);
		// Both defect counts as a DELTA, measured on the markup, each
		// read back off its own rule's OUTPUT.
		expect(sum.splitsAfter).toBe(0);
		expect(sum.openSitesAfter).toBe(0);
		// The two rules commute, and neither induces a site for the
		// other — the disjointness the module docstring claims.
		expect(sum.orderDependent).toBe(0);
		expect(sum.inducedClose).toBe(0);
		expect(sum.inducedOpen).toBe(0);
	}, 600_000);
});
