/** `pageOutsideEntry` over a hand-built page lookup: one entry on
 * p. 62 running to p. 63. */
import { describe, expect, it } from 'bun:test';
import { type PageLookup, pageOutsideEntry } from './locator.ts';

const PAGES: PageLookup = {
	entries: new Map([['A00001', { column: 'a', lastPage: 63, page: 62 }]]),
};

type Case = readonly [rid: string, page: number, outside: string];
const CASES: readonly Case[] = [
	['A00001', 62, ''],
	['A00001', 63, ''],
	['A00001', 61, "p. 61 is not the entry's (p. 62–63)"],
	['A00001', 64, "p. 64 is not the entry's (p. 62–63)"],
	['Z99999', 62, "p. 62 is not the entry's (p. ?–?)"],
];

describe('pageOutsideEntry', () => {
	it.each(CASES)('%s p. %d', (rid, page, outside) => {
		expect(pageOutsideEntry(PAGES, rid, page) ?? '').toBe(outside);
	});
});
