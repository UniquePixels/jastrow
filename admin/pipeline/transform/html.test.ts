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
		for (const ch of ['א', 'ת', 'ִ', '׳', '״']) {
			expect(new RegExp(`[${HEBREW}]`, 'u').test(ch)).toBe(true);
		}
	});
});

describe('hebrewRuns', () => {
	it('delimits the run inside a mixed node', () => {
		expect(hebrewRuns('cmp. שָׁלוֹם a. fr.')).toEqual([{ end: 12, start: 5 }]);
	});
});
