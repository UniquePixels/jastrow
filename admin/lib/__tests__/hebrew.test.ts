import { describe, expect, it } from 'bun:test';
import {
	HEBREW,
	hebrewRuns,
	lettersOnly,
	toComparisonForm,
	withoutMarks,
} from '../hebrew.ts';

describe('HEBREW', () => {
	// The audit's near-miss: a pasted literal class decomposed יִ into
	// yod + hiriq and produced U+05B4–U+FB4F, swallowing em-dashes and
	// superscripts. This test is that bug, frozen.
	it('rejects the lookalikes the decomposed class swallowed', () => {
		for (const ch of ['—', 'ᵃ', "'", '(', '"', 'a', '1']) {
			expect(new RegExp(`[${HEBREW}]`, 'u').test(ch)).toBe(false);
		}
	});

	it('accepts letters, points and geresh', () => {
		for (const ch of ['א', 'ת', 'ִ', '׳', '״', 'װ']) {
			expect(new RegExp(`[${HEBREW}]`, 'u').test(ch)).toBe(true);
		}
	});
});

describe('hebrewRuns', () => {
	it('delimits the run inside a mixed node', () => {
		expect(hebrewRuns('cmp. שָׁלוֹם a. fr.')).toEqual([{ end: 12, start: 5 }]);
	});

	// `אל"ף` — gershayim typed as an ASCII quote. Split into two runs,
	// Task 5 would wrap each half in its own bidi span and reorder the
	// word, stranding the quote outside.
	it('keeps an ASCII gershayim inside one run', () => {
		expect(hebrewRuns('אל"ף')).toEqual([{ end: 4, start: 0 }]);
	});

	it('keeps an ASCII geresh inside one run', () => {
		expect(hebrewRuns("ד'ה")).toEqual([{ end: 3, start: 0 }]);
	});

	// A bare U+0307 stranded after a `</span>` reattaches to the wrong base.
	it('keeps a combining dot above inside one run', () => {
		expect(hebrewRuns('מנא̇ תקל̇')).toEqual([{ end: 9, start: 0 }]);
	});

	it('joins across a no-break space', () => {
		expect(hebrewRuns('\u05d0\u00a0\u05d1')).toEqual([{ end: 3, start: 0 }]);
	});

	it('does not absorb a trailing space into the run', () => {
		expect(hebrewRuns('א ')).toEqual([{ end: 1, start: 0 }]);
	});

	it('finds several runs in one value', () => {
		expect(hebrewRuns('א a ב')).toEqual([
			{ end: 1, start: 0 },
			{ end: 5, start: 4 },
		]);
	});

	it('reports no run for a value with no Hebrew', () => {
		expect(hebrewRuns('cmp. a. fr.—')).toEqual([]);
	});
});

describe('toComparisonForm', () => {
	it('folds two mark orders of one word together', () => {
		// Bet with dagesh then qamats, and with qamats then dagesh: one
		// word to a reader, two strings to a Map.
		const typed = 'ב\u05BC\u05B8';
		const canonical = 'ב\u05B8\u05BC';
		expect(typed).not.toBe(canonical);
		expect(toComparisonForm(typed)).toBe(toComparisonForm(canonical));
	});

	it('makes a run of whitespace one space, and trims the ends', () => {
		expect(toComparisonForm(' בַּד  V\t')).toBe('בַּד V'.normalize('NFC'));
	});
});

describe('withoutMarks', () => {
	it('drops points, accents, the maqaf and the combining dot', () => {
		expect(withoutMarks('הֵיכ־')).toBe('היכ');
		expect(withoutMarks('מנא\u0307')).toBe('מנא');
	});

	it('keeps spaces, geresh and the star', () => {
		expect(withoutMarks('*אָב בֵּית קִי׳')).toBe('*אב בית קי׳');
	});
});

describe('lettersOnly', () => {
	it('keeps the 22 letters alone', () => {
		expect(lettersOnly('*אָב בֵּית קִי׳ II')).toBe('אבביתקי');
	});

	it('reads a presentation-form letter as its base', () => {
		expect(lettersOnly('\uFB2E')).toBe('א');
	});
});
