/** The evidence scan's leaf ↔ page conversion (`scan.ts`), at the
 * edges of each volume's text. */
import { describe, expect, it } from 'bun:test';
import { leafOfPage, pageOfLeaf, volumeOfPage } from './scan.ts';

type Case = readonly [volume: number, leaf: number, page: number | undefined];
const LEAVES: readonly Case[] = [
	[1, 24, 1],
	[1, 706, 683],
	[1, 713, undefined],
	[1, 23, undefined],
	[2, 8, 685],
	[2, 99, 776],
	[2, 1028, 1705],
	[2, 1029, undefined],
	[2, 7, undefined],
	[3, 100, undefined],
];

/** The cases that are dictionary pages, for the inverse. */
const TEXT_LEAVES = LEAVES.flatMap(([volume, leaf, page]) =>
	page === undefined || (volume !== 1 && volume !== 2)
		? []
		: [[volume, leaf, page] as const],
);

describe('pageOfLeaf', () => {
	it.each(LEAVES)('vol. %d leaf %d is p. %p', (volume, leaf, page) => {
		expect(pageOfLeaf(volume, leaf)).toBe(page);
	});
});

describe('leafOfPage', () => {
	it.each(TEXT_LEAVES)(
		'inverts vol. %d leaf %d (p. %d)',
		(volume, leaf, page) => {
			expect(leafOfPage(page)).toEqual({ leaf, volume });
		},
	);
	it('places no leaf for p. 684, which prints no dictionary text', () => {
		expect([leafOfPage(684), volumeOfPage(684)]).toEqual([
			undefined,
			undefined,
		]);
	});
});
