import { describe, expect, it } from 'bun:test';
import { firstQuote } from './quote.ts';

/** [name, text, the quote `firstQuote` reads, or undefined] */
type Case = readonly [string, string, string | undefined];

const CASES: readonly Case[] = [
	[
		'a backticked run',
		'hOCR line: `IT m. (v. 928 2)` on leaf 85',
		'IT m. (v. 928 2)',
	],
	[
		'a double-quoted run closed before a clause end',
		'hOCR: "foo bar"; leaf 85',
		'foo bar',
	],
	['a stray inner quote is read whole', 'hOCR: "a "b" c". Then', 'a "b" c'],
	['a quote at the end of the text', 'hOCR "last words"', 'last words'],
	['an unclosed backtick is skipped', 'a ` b "c"', 'c'],
	// The next two are the lazy scan's own readings, kept as the regex the
	// backfill ran with had them: the first close that a clause end follows.
	['an empty pair opens a run', 'x "" "y"', '" "y'],
	['a run cannot cross a line', 'hOCR: "one\ntwo" "three"', ' "three'],
	['no quote', 'hOCR, leaf 85, no quote given', undefined],
];

describe('firstQuote', () => {
	for (const [name, text, expected] of CASES) {
		it(name, () => {
			expect(firstQuote(text)).toBe(expected);
		});
	}
});
