/**
 * Fixture tier for `stranded-tail.ts`'s two rules, plus the corpus tier
 * that pins the populations the module doc states — `stranded-
 * tail.ts`'s own doc has the measured numbers and the design
 * rationale; this file is where they are asserted.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { tokenize } from '../html.ts';
import { anchors } from '../links.ts';
import { checkMarkup } from '../markup.ts';
import { fieldsOf } from '../no-new-text.ts';
import type { Rule } from '../types.ts';
import { sourceEntries } from './corpus-fixture.ts';
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

/** Whether two sorted tag lists are the same multiset, position for
 * position — `anchorTags` already sorts both sides, so this is a plain
 * elementwise compare. */
function sameTags(a: readonly string[], b: readonly string[]): boolean {
	return a.length === b.length && a.every((tag, i) => tag === b[i]);
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
 * is the reason `digitMoveAt` has a refusal at all. `applyRepairs` runs
 * before every transform, and `rejoin-chopped` folds a phantom sense
 * number back into the preceding flow — in S01040 landing `2)`
 * immediately behind `<a … data-ref="Genesis 4:2">Gen. IV, 2</a>`.
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

/** One rule's running total over the corpus walk: occurrences, entries
 * touched, and the three invariants asserted once at the end rather
 * than inside the loop (lint/nursery/noConditionalExpect) — any
 * `checkMarkup` problem, any rid whose anchor count drifted, and any
 * rid whose anchor tag bytes (AC3: no `href`/`data-ref` written)
 * drifted. */
interface Tally {
	drift: string[];
	entries: Set<string>;
	occurrences: number;
	problems: string[];
	tagDrift: string[];
}

function freshTally(): Tally {
	return {
		drift: [],
		entries: new Set(),
		occurrences: 0,
		problems: [],
		tagDrift: [],
	};
}

/** Apply `rule` to `entry` and fold the result into `tally` — the body
 * of the per-entry, per-rule check, pulled out of the corpus test's own
 * callback so that callback stays under
 * lint/complexity/noExcessiveCognitiveComplexity. */
function tallyOne(entry: SourceEntry, rule: Rule, tally: Tally): void {
	const result = rule.apply(entry);
	if (result.records.length === 0) {
		return;
	}
	// Measured AFTER the apply, and only on the entries that actually
	// fired. `Rule.apply` MUST treat `entry` as immutable
	// (`transform/types.ts`), so these read the same source bytes they
	// would have before the call — but almost every one of the 32,512
	// entries returns above, and computing them first tokenized the
	// whole corpus twice per rule to throw the answer away.
	const before = anchorCount(entry);
	const beforeTags = anchorTags(entry);
	tally.occurrences += result.records.length;
	tally.entries.add(entry.rid);
	tally.problems.push(...checkMarkup(entry, result.entry));
	if (anchorCount(result.entry) !== before) {
		tally.drift.push(entry.rid);
	}
	if (!sameTags(beforeTags, anchorTags(result.entry))) {
		tally.tagDrift.push(entry.rid);
	}
}

describe('corpus tier', () => {
	it('both rows reproduce; the superscript row is T/U/V only, and neither regresses markup, anchor count, or anchor tag bytes', async () => {
		const sup = freshTally();
		const dig = freshTally();
		for (const entry of await sourceEntries()) {
			tallyOne(entry, superscriptInsideAnchor, sup);
			tallyOne(entry, truncatedCitationDigit, dig);
		}
		expect([...sup.problems, ...dig.problems]).toEqual([]);
		expect([...sup.drift, ...dig.drift]).toEqual([]);
		expect([...sup.tagDrift, ...dig.tagDrift]).toEqual([]);
		expect(sup.occurrences).toBe(182);
		expect(sup.entries.size).toBe(160);
		expect([...new Set([...sup.entries].map((r) => r[0]))].sort()).toEqual([
			'T',
			'U',
			'V',
		]);
		expect(dig.occurrences).toBe(14);
		// AC2 names the fourteen rids explicitly — pinned by IDENTITY, not
		// only by count, so a predicate that swapped one rid for another
		// fails here (fix round 1, finding I1).
		expect([...dig.entries].sort()).toEqual([
			'D00989',
			'G00065',
			'H00054',
			'H00504',
			'H01172',
			'H01271',
			'M01467',
			'N00044',
			'N01108',
			'O01097',
			'O01464',
			'Q01590',
			'R00351',
			'S01753',
		]);
	}, 120_000);
});
