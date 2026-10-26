/** The hOCR reader against a two-leaf fixture
 * (`fixtures/hocr/dictionaryoftarg01jastuoft/leaves-0000-0001.html.gz`),
 * never the real hOCR: that is read only inside the import. */
import { describe, expect, it } from 'bun:test';
import { leafLines, quoteOnLeaf } from './hocr.ts';

const ROOT = 'admin/pipeline/patch/fixtures/hocr';

type Quote = readonly [quote: string, found: boolean, why: string];
const QUOTES: readonly Quote[] = [
	['IT m. (v. 928 2) affliction,', true, 'a whole line'],
	['928 2)', true, 'part of a line'],
	['affliction, B. Mets. "59"', true, 'across two lines'],
	['B.   Mets.\n"59"', true, 'whitespace collapsed'],
	['B. Mets. "59" &c.', true, 'entities decoded, the bidi mark dropped'],
	['IT m. (v. 928 2) affliction;', false, 'a misquoted mark'],
	['it m. (v. 928 2)', false, 'case is not folded'],
	['to rivet, forge;', false, 'a line of the other leaf'],
	['  ', false, 'an empty quote'],
];

describe('leafLines', () => {
	it('reads each line of a leaf as its words joined by one space', async () => {
		expect(await leafLines(1, 0, ROOT)).toEqual([
			'ALEPH',
			'IT m. (v. 928 2) affliction,',
			'B. Mets.‏ "59" &c.',
		]);
	});

	it('reads the next leaf of the same chunk', async () => {
		expect(await leafLines(1, 1, ROOT)).toEqual(['to rivet, forge;']);
	});

	it('returns nothing for a leaf no chunk holds', async () => {
		expect(await leafLines(1, 2, ROOT)).toBeUndefined();
	});
});

describe('quoteOnLeaf', () => {
	it.each(QUOTES)('%p → %p (%s)', async (quote, found) => {
		const lines = (await leafLines(1, 0, ROOT)) ?? [];
		expect(quoteOnLeaf(lines, quote)).toBe(found);
	});
});
