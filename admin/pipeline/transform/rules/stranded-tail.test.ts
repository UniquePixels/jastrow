/**
 * Fixture tier for `stranded-tail.ts`'s two rules — `stranded-tail.ts`'s
 * own doc has the measured numbers and the design rationale.
 *
 * The corpus tier that pinned the populations the module doc states
 * (both rows' occurrence and entry counts, plus the no-regression
 * invariants on markup, anchor count and anchor tag bytes) was retired
 * in consolidation step 5 and is listed in
 * `docs/v2/retired-corpus-checks.md`.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../types.ts';
import { tokenize } from '../html.ts';
import { anchors } from '../links.ts';
import { checkMarkup } from '../markup.ts';
import { fieldsOf } from '../no-new-text.ts';
import {
	superscriptInsideAnchor,
	truncatedCitationDigit,
} from './stranded-tail.ts';

const def = (html: string, rid = 'T00914'): SourceEntry => ({
	content: { senses: [{ definition: html }] },
	headword: 'h',
	rid,
});
const M =
	'<a class="refLink" href="/Midrash_Rabbah.7" data-ref="Midrash Rabbah 7">';

/** Anchors across every field a rule can edit, summed — the "entry's
 * anchor count" the global constraint asks each rule to leave alone. */
function anchorCount(entry: SourceEntry): number {
	return fieldsOf(entry).reduce(
		(total, field) => total + anchors(tokenize(field)).length,
		0,
	);
}

/** Every anchor's own raw opening-tag bytes, across every field a rule
 * can edit, sorted so two entries can be compared as a MULTISET rather
 * than by position — position can shift (the superscript move re-nests
 * without adding or removing an anchor) while the tag bytes themselves
 * must not. This is AC3, "neither rule writes a `data-ref` or an
 * `href`", made checkable rather than left to a `toContain` on one
 * fixture's own surviving target. */
function anchorTags(entry: SourceEntry): string[] {
	return fieldsOf(entry)
		.flatMap((field) => anchors(tokenize(field)).map((a) => a.tag))
		.sort();
}

describe('superscriptInsideAnchor', () => {
	it('moves the superscript inside, target untouched', () => {
		const out = superscriptInsideAnchor.apply(
			def(`${M}Gen. R. s. 7</a><sup>7</sup>`),
		);
		expect(out.entry.content.senses[0]?.definition).toBe(
			`${M}Gen. R. s. 7<sup>7</sup></a>`,
		);
		expect(out.entry.content.senses[0]?.definition).toContain(
			'data-ref="Midrash Rabbah 7"',
		);
	});

	it('leaves a superscript already inside alone', () => {
		const inside = def(`${M}Gen. R. s. 7<sup>7</sup></a>`);
		expect(superscriptInsideAnchor.apply(inside).entry).toBe(inside);
	});

	it('leaves a superscript not adjacent to a close tag alone', () => {
		const apart = def(`${M}Gen. R. s. 7</a> and <sup>7</sup>`);
		expect(superscriptInsideAnchor.apply(apart).entry).toBe(apart);
	});

	it('reports one record per occurrence moved, not per definition', () => {
		const twice: SourceEntry = {
			content: {
				senses: [
					{
						definition: `${M}Gen. R. s. 7</a><sup>7</sup>; and ${M}ib. 8</a><sup>8</sup>`,
					},
				],
			},
			headword: 'h',
			rid: 'T00001',
		};
		const out = superscriptInsideAnchor.apply(twice);
		expect(out.records).toHaveLength(2);
	});

	it('passes checkMarkup with a non-positive delta and keeps the anchor count', () => {
		const before = def(`${M}Gen. R. s. 7</a><sup>7</sup>`);
		const out = superscriptInsideAnchor.apply(before);
		expect(checkMarkup(before, out.entry)).toEqual([]);
		expect(anchorCount(out.entry)).toBe(anchorCount(before));
	});

	it('sets no allows and leaves every anchor tag byte-identical', () => {
		const before = def(`${M}Gen. R. s. 7</a><sup>7</sup>`);
		const out = superscriptInsideAnchor.apply(before);
		expect(superscriptInsideAnchor.allows).toBeUndefined();
		expect(anchorTags(out.entry)).toEqual(anchorTags(before));
	});
});

/**
 * THE COMPOSED-PIPELINE CASE is `declines a sense marker` below, and it
 * is the reason `digitMoveAt` has a refusal at all. `applyRepairs` used
 * to run before every transform, and its `rejoin-chopped` pass folded a
 * phantom sense number back into the preceding flow — in S01040 landing
 * `2)` immediately behind `<a … data-ref="Genesis 4:2">Gen. IV, 2</a>`.
 * (Since consolidation step 8 that rejoin is a reviewed `join` patch
 * applied after the rules; the refusal stays as a guard.)
 * Without the refusal this rule read that `2` as a truncated citation
 * tail and produced a link displaying `Gen. IV, 22`: a verse the entry
 * does not cite. The raw snapshot holds no such shape at all — 14 of 14
 * remainders begin with a space, `,`, `.`, `;` or `ᵇ` — so
 * `bun transform:count` could never have shown it.
 *
 * (This note sits outside the block rather than beside its test:
 * `noExcessiveLinesPerFunction` counts comment lines, and the block is
 * at the ceiling.)
 */
describe('truncatedCitationDigit', () => {
	const B =
		'<a class="refLink" href="/Bava_Kamma.11a" data-ref="Bava Kamma 11a">';

	it('extends the anchor over the stranded digit', () => {
		const out = truncatedCitationDigit.apply(
			def(`ib. ${B}B. Kam. XI, 2</a>8`, 'H00054'),
		);
		expect(out.entry.content.senses[0]?.definition).toBe(
			`ib. ${B}B. Kam. XI, 28</a>`,
		);
	});

	it('does not change the data-ref, which still reads the truncation', () => {
		const out = truncatedCitationDigit.apply(
			def(`ib. ${B}B. Kam. XI, 2</a>8`, 'H00054'),
		);
		expect(out.entry.content.senses[0]?.definition).toContain(
			'data-ref="Bava Kamma 11a"',
		);
	});

	it('leaves a digit separated from the close tag alone', () => {
		const apart = def(`${B}B. Kam. XI, 2</a> 8`, 'H00054');
		expect(truncatedCitationDigit.apply(apart).entry).toBe(apart);
	});

	it('leaves an anchor whose display does not end in a digit alone', () => {
		const notDigit = def(`${B}B. Kam. XI, end</a>8`, 'H00054');
		expect(truncatedCitationDigit.apply(notDigit).entry).toBe(notDigit);
	});

	it('declines a sense marker: a digit run closed by a paren', () => {
		const marker = def(`${B}Gen. IV, 2</a>2)<i>artist</i>`, 'S01040');
		expect(truncatedCitationDigit.apply(marker).entry).toBe(marker);
	});

	it('splits a multi-digit run, leaving any remainder outside', () => {
		const out = truncatedCitationDigit.apply(
			def(`${B}B. Kam. XI, 1</a>9. more text`, 'H00054'),
		);
		expect(out.entry.content.senses[0]?.definition).toBe(
			`${B}B. Kam. XI, 19</a>. more text`,
		);
	});

	it('passes checkMarkup with a non-positive delta and keeps the anchor count', () => {
		const before = def(`ib. ${B}B. Kam. XI, 2</a>8`, 'H00054');
		const out = truncatedCitationDigit.apply(before);
		expect(checkMarkup(before, out.entry)).toEqual([]);
		expect(anchorCount(out.entry)).toBe(anchorCount(before));
	});

	it('sets no allows and leaves every anchor tag byte-identical', () => {
		const before = def(`ib. ${B}B. Kam. XI, 2</a>8`, 'H00054');
		const out = truncatedCitationDigit.apply(before);
		expect(truncatedCitationDigit.allows).toBeUndefined();
		expect(anchorTags(out.entry)).toEqual(anchorTags(before));
	});
});
