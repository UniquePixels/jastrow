/** `parsePageIndex` over small block files given as text. */
import { describe, expect, it } from 'bun:test';
import { parsePageIndex } from './page-index.ts';

interface Block {
	column: string;
	first: string;
	last: string;
	page: number;
}

const block = (
	column: string,
	first: string,
	last: string,
	page: number,
): Block => ({ column, first, last, page });

/** A block file of `rows`, one JSON object per line. */
const text = (rows: readonly Block[]): string =>
	`${rows.map((r) => JSON.stringify(r)).join('\n')}\n`;

describe('parsePageIndex', () => {
	it('places every rid in each range on its page and column', () => {
		const pages = parsePageIndex(
			text([
				block('a', 'A00000', 'A00002', 1),
				block('b', 'A00003', 'A00003', 1),
				block('a', 'B00000', 'B00001', 134),
			]),
		);
		expect(pages.get('A00002')).toEqual({ column: 'a', number: 1 });
		expect(pages.get('A00003')).toEqual({ column: 'b', number: 1 });
		expect(pages.get('B00001')).toEqual({ column: 'a', number: 134 });
		expect(pages.size).toBe(6);
	});
	it('names a line that is not JSON', () => {
		expect(() => parsePageIndex('{"column":\n')).toThrow(
			/page index row rejected/u,
		);
	});
	it('lets column a follow b where a letter starts (p. 415)', () => {
		const pages = parsePageIndex(
			text([
				block('a', 'G00731', 'G00735', 415),
				block('b', 'G00736', 'G00741', 415),
				block('a', 'H00000', 'H00006', 415),
			]),
		);
		expect(pages.get('H00000')).toEqual({ column: 'a', number: 415 });
	});
	it('keeps two blocks of one column apart (a letter-change page)', () => {
		const pages = parsePageIndex(
			text([
				block('a', 'C01432', 'C01432', 275),
				block('a', 'D00000', 'D00006', 275),
			]),
		);
		expect([pages.get('C01432'), pages.get('D00006')]).toEqual([
			{ column: 'a', number: 275 },
			{ column: 'a', number: 275 },
		]);
	});
});

describe('parsePageIndex refuses', () => {
	it.each([
		['a column other than a/b', block('c', 'A00000', 'A00001', 1)],
		['a non-integer page', block('a', 'A00000', 'A00001', 1.5)],
		['a malformed rid', block('a', 'A0000', 'A00001', 1)],
		['a backwards range', block('a', 'A00002', 'A00001', 1)],
		['a range across a letter', block('a', 'A00000', 'B00001', 1)],
	])('%s', (_, row) => {
		expect(() => parsePageIndex(text([row]))).toThrow(
			/page index row rejected/u,
		);
	});
	it.each([
		[
			'an overlapping range',
			[block('a', 'A00000', 'A00002', 1), block('b', 'A00002', 'A00003', 1)],
		],
		[
			'a column that runs backwards within a letter',
			[block('b', 'A00013', 'A00014', 1), block('a', 'A00015', 'A00016', 1)],
		],
		[
			'a page that runs backwards',
			[block('a', 'A00000', 'A00002', 2), block('b', 'A00003', 'A00004', 1)],
		],
	])('%s', (_, rows) => {
		expect(() => parsePageIndex(text(rows))).toThrow(/out of print order/u);
	});
});
