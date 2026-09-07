import { describe, expect, it } from 'bun:test';
import type { ColumnRecord, RawLeaf } from './columns.ts';
import { blocksOf, columnAt, deriveOffset } from './columns.ts';

const leaf = (): RawLeaf => ({
	guideLeft: 'left',
	guideRight: 'right',
	leaf: 157,
	linesA: [
		{ text: 'aleph one', y: 300 },
		{ text: 'aleph two', y: 400 },
		{ text: 'beth one', y: 2000 },
		{ text: 'beth two', y: 2100 },
	],
	linesB: [
		{ text: 'aleph three', y: 310 },
		{ text: 'beth three', y: 2010 },
	],
	printedPage: 134,
});

describe('blocksOf', () => {
	it('reads an ordinary page as column a then column b', () => {
		const blocks = blocksOf(leaf(), null);
		expect(blocks.map((b) => `${b.column}-${b.band}`)).toEqual([
			'a-full',
			'b-full',
		]);
		expect(blocks[0]?.lines).toHaveLength(4);
		expect(blocks[1]?.lines).toHaveLength(2);
	});

	it('reads a letter-change page across both columns before either lower half', () => {
		// This is the correction that matters: Jastrow does not break at the
		// column when the letter changes, so b-top precedes a-bottom.
		const blocks = blocksOf(leaf(), 1000);
		expect(blocks.map((b) => `${b.column}-${b.band}`)).toEqual([
			'a-top',
			'b-top',
			'a-bottom',
			'b-bottom',
		]);
	});

	it('splits each column at the heading', () => {
		const blocks = blocksOf(leaf(), 1000);
		expect(blocks[0]?.lines.map((l) => l.text)).toEqual([
			'aleph one',
			'aleph two',
		]);
		expect(blocks[1]?.lines.map((l) => l.text)).toEqual(['aleph three']);
		expect(blocks[2]?.lines.map((l) => l.text)).toEqual([
			'beth one',
			'beth two',
		]);
		expect(blocks[3]?.lines.map((l) => l.text)).toEqual(['beth three']);
	});

	it('puts a line exactly on the split into the lower band', () => {
		const blocks = blocksOf(leaf(), 2000);
		expect(blocks[2]?.lines.map((l) => l.text)).toEqual([
			'beth one',
			'beth two',
		]);
	});
});

describe('deriveOffset', () => {
	it('takes the modal difference, ignoring misread numerals', () => {
		// Tesseract read p.227 as "237"; the mode must survive that.
		const read = new Map([
			[250, 237],
			[253, 230],
			[254, 231],
			[255, 232],
		]);
		expect(deriveOffset(read)).toBe(-23);
	});

	it('returns 0 when nothing was read', () => {
		expect(deriveOffset(new Map())).toBe(0);
	});
});

describe('columnAt', () => {
	const cols: ColumnRecord[] = [
		{
			band: 'full',
			column: 'a',
			guide: '',
			leaf: 1,
			printedPage: 1,
			tokenEnd: 10,
			tokenStart: 0,
			volume: 1,
		},
		{
			band: 'full',
			column: 'b',
			guide: '',
			leaf: 1,
			printedPage: 1,
			tokenEnd: 25,
			tokenStart: 10,
			volume: 1,
		},
	];

	it('finds the block holding a token offset', () => {
		expect(columnAt(cols, 0)?.column).toBe('a');
		expect(columnAt(cols, 9)?.column).toBe('a');
		expect(columnAt(cols, 10)?.column).toBe('b');
		expect(columnAt(cols, 24)?.column).toBe('b');
	});

	it('returns null past the end', () => {
		expect(columnAt(cols, 25)).toBeNull();
		expect(columnAt([], 0)).toBeNull();
	});
});
