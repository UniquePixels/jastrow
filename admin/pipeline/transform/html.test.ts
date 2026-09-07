import { describe, expect, it } from 'bun:test';
import { HEBREW, hebrewRuns, serialize, tagSpans, tokenize } from './html.ts';

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
	// an OPEN that never closes. Pushing its dir="rtl" mislabelled 56 of
	// its later tokens — 28 of them TEXT tokens, pure Latin included.
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

describe('quote-aware tag scanning', () => {
	// The latent gap named on PR #71: `[^>]*` closed a tag at the first
	// `>` even inside a quoted attribute value, exposing the rest of the
	// attribute as document TEXT — where a text-repair rule may edit it.
	// 0 corpus tags carry a `>` in a value today; a re-fetch could.
	const texts = (html: string): string[] =>
		tokenize(html)
			.filter((t) => t.kind === 'text')
			.map((t) => t.value);

	it('keeps a tag whole when a double-quoted value holds >', () => {
		const html = '<a href="/x>y" data-ref="z">t</a>';
		expect(texts(html)).toEqual(['t']);
		expect(tokenize(html)[0]?.value).toBe('<a href="/x>y" data-ref="z">');
	});

	it('keeps a tag whole when a single-quoted value holds >', () => {
		expect(texts("<a href='/x>y'>t</a>")).toEqual(['t']);
	});

	// 452 corpus hrefs hold an apostrophe inside a double-quoted value
	// (`/Tosefta_Ma'asrot.1.4`). It must not open a single-quoted scan.
	it('reads an apostrophe inside a double-quoted value as literal', () => {
		expect(texts(`<a href="/Ma'asrot>1" data-ref="x">t</a>`)).toEqual(['t']);
	});

	// Per the HTML tokenizer, a quote is a delimiter only where a value
	// starts — after `=`. Elsewhere it is an ordinary tag-body byte.
	it('opens a quoted value only after =', () => {
		expect(texts('<a "x>t" y>u</a>')).toEqual(['t" y>u']);
	});

	// An unterminated value keeps today's reading: the tag ends at the
	// first `>`. So do the two corpus tags whose value swallowed a `</a>`
	// (see the malformed cases above) — a `<` inside a value is that
	// damage, not a literal, and the tokenizer's malformed-tag doctrine
	// keeps reading it as before.
	it('falls back to the first > when a quoted value never closes', () => {
		expect(tokenize('<a href="/x>t</a>').map((t) => t.value)).toEqual([
			'<a href="/x>',
			't',
			'</a>',
		]);
	});

	it('round-trips a >-holding attribute byte-for-byte', () => {
		const html = '<a href="/x>y" data-ref="a>b">t</a> <i>q</i>';
		expect(serialize(tokenize(html))).toBe(html);
	});
});

describe('tagSpans', () => {
	it('reports each tag as a [start, end) span', () => {
		expect(tagSpans('a<b>c<i x=">">d')).toEqual([
			{ end: 4, start: 1 },
			{ end: 14, start: 5 },
		]);
	});

	it('reports no span for a < that never closes', () => {
		expect(tagSpans('<a href="x ב')).toEqual([]);
	});

	it('reports no span for a < not followed by a tag name', () => {
		expect(tagSpans('a < b > c')).toEqual([]);
	});
});
