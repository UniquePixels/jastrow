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

const PRIMARY =
	'<a class="refLink" href="/Tosefta_Shabbat.16" data-ref="Tosefta Shabbat 16">';
const VARIANT =
	'<a class="refLink" href="/Tosefta_Shabbat.17.6" data-ref="Tosefta Shabbat 17:6">';
const SPLIT = `${PRIMARY}Tosef. Sabb. XVI</a> (${VARIANT}XVII), 6</a>`;

/** `headword` is present because `fieldsOf` walks it unconditionally. */
const def = (html: string): SourceEntry => ({
	content: { senses: [{ definition: html }] },
	headword: 'h',
	rid: 'A00196',
});

const definitionOf = (entry: SourceEntry): string | undefined =>
	entry.content.senses[0]?.definition;

const anchorCount = (entry: SourceEntry): number => {
	let count = 0;
	for (const text of fieldsOf(entry)) {
		count += anchors(tokenize(text)).length;
	}
	return count;
};

describe('toseftaCloseParen', () => {
	it('moves the ")" outside the variant anchor', () => {
		const out = toseftaCloseParen.apply(def(SPLIT));
		expect(definitionOf(out.entry)).toBe(
			`${PRIMARY}Tosef. Sabb. XVI</a> (${VARIANT}XVII</a>), 6`,
		);
		expect(out.records).toHaveLength(1);
	});

	it('leaves a plain Tosefta anchor with no parenthetical alone', () => {
		const plain = def(`${PRIMARY}Tosef. Sabb. XVI, 6</a>`);
		expect(toseftaCloseParen.apply(plain).entry).toBe(plain);
	});

	it('declines a variant with no preceding anchor', () => {
		const orphan = def(`Tosef. Sabb. (${VARIANT}XVII), 6</a>`);
		expect(toseftaCloseParen.apply(orphan).entry).toBe(orphan);
	});

	it('repairs both pairs when one field holds two', () => {
		const out = toseftaCloseParen.apply(def(`${SPLIT} and ${SPLIT}`));
		expect(out.records).toHaveLength(2);
		expect(definitionOf(out.entry)).toBe(
			`${PRIMARY}Tosef. Sabb. XVI</a> (${VARIANT}XVII</a>), 6 and ${PRIMARY}Tosef. Sabb. XVI</a> (${VARIANT}XVII</a>), 6`,
		);
	});

	it('recurses into nested senses', () => {
		const nested: SourceEntry = {
			content: { senses: [{ senses: [{ definition: SPLIT }] }] },
			headword: 'h',
			rid: 'A00196',
		};
		const out = toseftaCloseParen.apply(nested);
		expect(out.records).toHaveLength(1);
		expect(out.entry.content.senses[0]?.senses?.[0]?.definition).toContain(
			'XVII</a>), 6',
		);
	});

	it('changes no target, so the gate passes with nothing declared', () => {
		const src = def(SPLIT);
		const out = toseftaCloseParen.apply(src);
		expect(checkLinkTargets(src, out.entry, out)).toEqual([]);
	});

	it('treats the entry as immutable', () => {
		const src = def(SPLIT);
		Object.freeze(src);
		Object.freeze(src.content);
		expect(() => toseftaCloseParen.apply(src)).not.toThrow();
		expect(definitionOf(src)).toBe(SPLIT);
	});
});

describe('openParenInAnchorDisplay', () => {
	const A =
		'<a dir="rtl" class="refLink" href="/Jastrow,_ס.1" data-ref="Jastrow, ס 1">';

	it('moves the opening paren outside, touching no target', () => {
		const out = openParenInAnchorDisplay.apply(def(`${A}(ס</a>)`));
		expect(definitionOf(out.entry)).toBe(`(${A}ס</a>)`);
		expect(out.recombined).toBeUndefined();
		expect(out.records).toHaveLength(1);
	});

	it('leaves an anchor whose paren closes inside alone', () => {
		const B = '<a class="refLink" href="/x.1" data-ref="x 1">';
		const balanced = def(`${B}(both here)</a>`);
		expect(openParenInAnchorDisplay.apply(balanced).entry).toBe(balanced);
	});

	it('declines an anchor carrying inner markup', () => {
		const B = '<a class="refLink" href="/x.1" data-ref="x 1">';
		const inner = def(`${B}(<i>x</i></a>)`);
		expect(openParenInAnchorDisplay.apply(inner).entry).toBe(inner);
	});

	it('changes no target, so the gate passes with nothing declared', () => {
		const src = def(`${A}(ס</a>)`);
		const out = openParenInAnchorDisplay.apply(src);
		expect(checkLinkTargets(src, out.entry, out)).toEqual([]);
	});

	it('declines the opposite polarity, which is the other row', () => {
		const split = def(SPLIT);
		expect(openParenInAnchorDisplay.apply(split).entry).toBe(split);
	});
});

describe('the two rules are disjoint', () => {
	it('neither rule declares an allowance', () => {
		expect(toseftaCloseParen.allows).toBeUndefined();
		expect(openParenInAnchorDisplay.allows).toBeUndefined();
	});

	it('a field holding both shapes is repaired by each in its own place', () => {
		const A = '<a class="refLink" href="/x.1" data-ref="x 1">';
		const both = def(`${SPLIT} — ${A}(y</a>)`);
		const close = toseftaCloseParen.apply(both);
		const open = openParenInAnchorDisplay.apply(both);
		expect(close.records).toHaveLength(1);
		expect(open.records).toHaveLength(1);
		expect(definitionOf(close.entry)).toContain(`${A}(y</a>)`);
		expect(definitionOf(open.entry)).toContain('XVII), 6</a>');
	});
});

/**
 * The blocked third row, pinned rather than shipped.
 *
 * `tosefta-variant-chapter-halakha-loss` would carry the variant's own
 * halakha onto the primary through spec §3.2 case 4. The gate refuses
 * it, and this test is the proof — kept green ON THE REFUSAL so that
 * the day `link-target.ts` is widened by a ruling, this test FAILS and
 * whoever made the ruling is sent straight here.
 */
describe('tosefta-variant-chapter-halakha-loss (blocked)', () => {
	it('case 4 refuses the halakha recombination', () => {
		const src = def(SPLIT);
		const after = def(
			SPLIT.replace('Tosefta_Shabbat.16"', 'Tosefta_Shabbat.16.6"').replace(
				'data-ref="Tosefta Shabbat 16"',
				'data-ref="Tosefta Shabbat 16:6"',
			),
		);
		expect(
			checkLinkTargets(src, after, {
				recombined: [
					{
						head: 'Tosefta Shabbat 16',
						tail: 'Tosefta Shabbat 17:6',
						target: 'Tosefta Shabbat 16:6',
					},
				],
			}),
		).toEqual([
			'recombined "Tosefta Shabbat 16:6" is not a prefix of "Tosefta Shabbat 16" joined to a suffix of "Tosefta Shabbat 17:6"',
		]);
	});
});

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

/** Every gate a registered rule would face, run per entry so a
 * violation names the entry that caused it rather than a total. The
 * anchor-count invariant is the crude one and the important one: both
 * rules move bytes across tag boundaries, and that is the way it goes
 * wrong. */
function assertClean(
	entry: SourceEntry,
	pairs: readonly [Rule, TransformResult][],
): void {
	const was = anchorCount(entry);
	for (const [rule, result] of pairs) {
		expect(anchorCount(result.entry)).toBe(was);
		expect(checkLinkTargets(entry, result.entry, result)).toEqual([]);
		expect(checkNoNewText(entry, result.entry, rule)).toEqual([]);
		expect(checkMarkup(entry, result.entry)).toEqual([]);
	}
}

/** The shared walk's two arms over one entry: a primary whose
 * `data-ref` has no `:` lost its halakha, one that has a `:` carries a
 * halakha disagreeing with print. */
function splitArms(entry: SourceEntry): { disagree: number; lost: number } {
	let disagree = 0;
	let lost = 0;
	for (const text of fieldsOf(entry)) {
		for (const { primary } of toseftaSplits(tokenize(text))) {
			if (primary.dataRef.includes(':')) {
				disagree += 1;
			} else {
				lost += 1;
			}
		}
	}
	return { disagree, lost };
}

function splitsIn(entry: SourceEntry): number {
	let found = 0;
	for (const text of fieldsOf(entry)) {
		found += toseftaSplits(tokenize(text)).length;
	}
	return found;
}

describe('corpus tier', () => {
	it('all three rows reproduce, and no link is lost', async () => {
		const close = tally();
		const paren = tally();
		const pairs = tally();
		const halakha = tally();
		let disagreeOcc = 0;
		let survivingSwallows = 0;
		for await (const entry of readSourceEntries()) {
			const c = toseftaCloseParen.apply(entry);
			const p = openParenInAnchorDisplay.apply(entry);
			add(close, entry.rid, c.records.length);
			add(paren, entry.rid, p.records.length);
			assertClean(entry, [
				[toseftaCloseParen, c],
				[openParenInAnchorDisplay, p],
			]);
			const arms = splitArms(entry);
			add(pairs, entry.rid, arms.disagree + arms.lost);
			add(halakha, entry.rid, arms.lost);
			disagreeOcc += arms.disagree;
			survivingSwallows += splitsIn(c.entry);
		}
		// anchor-swallows-close-paren, catalogued 493 ENTRIES.
		expect(close.occurrences).toBe(525);
		expect(close.entries.size).toBe(493);
		// The population the shared walk sees, and its two arms.
		expect(pairs.occurrences).toBe(525);
		expect(pairs.entries.size).toBe(493);
		expect(disagreeOcc).toBe(111);
		// tosefta-variant-chapter-halakha-loss, catalogued 391 ENTRIES.
		// Pinned, NOT repaired — see the blocked describe above.
		expect(halakha.occurrences).toBe(414);
		expect(halakha.entries.size).toBe(391);
		// The defect count as a DELTA, measured on the markup.
		expect(survivingSwallows).toBe(0);
		// open-paren-in-anchor-display, catalogued 214 ENTRIES.
		expect(paren.occurrences).toBe(225);
		expect(paren.entries.size).toBe(214);
	}, 600_000);
});
