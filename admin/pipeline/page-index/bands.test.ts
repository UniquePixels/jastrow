import { describe, expect, it } from 'bun:test';
import { essayScore, findEssayLine } from './bands.ts';
import type { RawLeaf } from './columns.ts';

// Mirrors S00000's opening tokens closely enough to reproduce the bug: "the"
// and "of" each appear twice in the first twelve probe tokens.
const PROBE = [
	'the',
	'fifth',
	'letter',
	'of',
	'the',
	'alphabet',
	'it',
	'interchanges',
	'with',
	'a',
	'also',
	'of',
];

describe('essayScore', () => {
	it('does not let a repeated probe token stand in for distinct hits', () => {
		// Only "the" and "of" are present, but each counts twice in the raw
		// probe list. A line made of nothing else must not reach the
		// ESSAY_MIN_HITS=4 threshold on two distinct words alone.
		expect(essayScore('the of the of', PROBE)).toBeLessThan(4);
	});

	it('still accepts a line that genuinely opens the essay', () => {
		expect(
			essayScore('he, the fifth letter of the alphabet', PROBE),
		).toBeGreaterThanOrEqual(4);
	});
});

describe('findEssayLine', () => {
	const leaf = (linesA: RawLeaf['linesA']): RawLeaf => ({
		guideLeft: 'left',
		guideRight: 'right',
		leaf: 200,
		linesA,
		linesB: [],
		printedPage: 300,
	});

	it('does not pick a line matching only on repeated probe tokens', () => {
		const leaves = new Map([[200, leaf([{ text: 'the of the of', y: 500 }])]]);
		expect(findEssayLine(leaves, PROBE, 200)).toBeNull();
	});

	it('picks the leaf and y of the genuine essay opening', () => {
		const leaves = new Map([
			[
				200,
				leaf([
					{ text: 'unrelated heading text', y: 100 },
					{ text: 'he, the fifth letter of the alphabet', y: 500 },
				]),
			],
		]);
		expect(findEssayLine(leaves, PROBE, 200)).toEqual({ leaf: 200, y: 500 });
	});
});
