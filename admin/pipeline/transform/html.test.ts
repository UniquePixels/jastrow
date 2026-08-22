import { describe, expect, it } from 'bun:test';
import { HEBREW, hebrewRuns, serialize, tokenize } from './html.ts';

describe('tokenize', () => {
	it('round-trips a nested definition byte-for-byte', () => {
		const html = 'quote <a href="/x">Ber. 2ᵃ</a> <span dir="rtl">שָׁלוֹם</span>.';
		expect(serialize(tokenize(html))).toBe(html);
	});

	it('marks text inside dir=rtl and outside it', () => {
		const tokens = tokenize('a <span dir="rtl">שָׁלוֹם</span> b');
		const texts = tokens.filter((t) => t.kind === 'text');
		expect(texts.map((t) => t.rtl)).toEqual([false, true, false]);
	});

	it('rtl is inherited through nesting', () => {
		const tokens = tokenize('<span dir="rtl">א<i>g</i>ב</span>');
		expect(tokens.filter((t) => t.kind === 'text').every((t) => t.rtl)).toBe(
			true,
		);
	});

	it('reports the ancestry in effect for a closing tag', () => {
		const tags = tokenize('<span dir="rtl">א</span>').filter(
			(t) => t.kind === 'tag',
		);
		// The open sits outside its own dir; the close is still inside it.
		expect(tags.map((t) => t.rtl)).toEqual([false, true]);
	});

	// J00597: an unterminated href swallows a `</a>`, so the tag reads as
	// an OPEN that never closes. Pushing its dir="rtl" leaked rtl over all
	// 34 later text tokens, pure Latin included.
	it('does not push rtl from a malformed open tag', () => {
		const tokens = tokenize(
			'<a dir="rtl" href="/x.1</a>B. Mets. 38<span dir="rtl">א</span>',
		);
		const texts = tokens.filter((t) => t.kind === 'text');
		expect(texts.map((t) => t.value)).toEqual(['B. Mets. 38', 'א']);
		// Latin stays ltr, and the well-formed span after it still works.
		expect(texts.map((t) => t.rtl)).toEqual([false, true]);
	});

	it('round-trips malformed markup byte-for-byte', () => {
		const html = '<a dir="rtl" href="/x.1</a>" data-ref="x">א</a> tail';
		expect(serialize(tokenize(html))).toBe(html);
	});
});

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
