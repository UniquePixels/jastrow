/** `leafOutsideEntry` and `pageOfLeaf` over a hand-built page lookup:
 * vol. 1 pages 61–63 on leaves 84–86, one entry on 62 running to 63. */
import { describe, expect, it } from 'bun:test';
import { leafOutsideEntry, type PageLookup, pageOfLeaf } from './locator.ts';

const PAGES: PageLookup = {
	entries: new Map([
		['A00001', { column: 'a', lastPage: 63, page: 62, volume: 1 }],
	]),
	leaves: new Map([
		['1:61', 84],
		['1:62', 85],
		['1:63', 86],
	]),
};

type Leaf = readonly [
	rid: string,
	volume: number,
	leaf: number,
	outside: string,
];
const LEAVES: readonly Leaf[] = [
	['A00001', 1, 85, ''],
	['A00001', 1, 86, ''],
	['A00001', 1, 84, 'leaf 84 is p. 61; the entry is on p. 62–63'],
	['A00001', 2, 85, 'leaf 85 is p. ?; the entry is on p. 62–63'],
	['A00001', 1, 999, 'leaf 999 is p. ?; the entry is on p. 62–63'],
	['Z99999', 1, 85, 'leaf 85 is p. 62; the entry is on p. ?–?'],
];

describe('leafOutsideEntry', () => {
	it.each(LEAVES)('%s vol. %d leaf %d', (rid, volume, leaf, outside) => {
		expect(leafOutsideEntry(PAGES, rid, volume, leaf) ?? '').toBe(outside);
	});
});

describe('pageOfLeaf', () => {
	it('reads a leaf back to its page, within its volume', () => {
		expect([pageOfLeaf(PAGES, 1, 85), pageOfLeaf(PAGES, 2, 85)]).toEqual([
			62,
			undefined,
		]);
	});
});
