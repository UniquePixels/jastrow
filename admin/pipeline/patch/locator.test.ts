/** `leafOutsideEntry` over a hand-built page lookup: one vol. 1 entry
 * on p. 62 running to p. 63, which the evidence scan shows on leaves
 * 85 and 86 (`scan.ts`). */
import { describe, expect, it } from 'bun:test';
import { leafOutsideEntry, type PageLookup } from './locator.ts';

const PAGES: PageLookup = {
	entries: new Map([
		['A00001', { column: 'a', lastPage: 63, page: 62, volume: 1 }],
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
	['A00001', 2, 85, 'leaf 85 is p. 762; the entry is on p. 62–63'],
	['A00001', 1, 999, 'leaf 999 is p. ?; the entry is on p. 62–63'],
	['Z99999', 1, 85, 'leaf 85 is p. 62; the entry is on p. ?–?'],
];

describe('leafOutsideEntry', () => {
	it.each(LEAVES)('%s vol. %d leaf %d', (rid, volume, leaf, outside) => {
		expect(leafOutsideEntry(PAGES, rid, volume, leaf) ?? '').toBe(outside);
	});
});
