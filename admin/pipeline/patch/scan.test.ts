/** Evidence-scan links (`scan.ts`): built from a printed page, read
 * back to it, at the edges of each volume's text. */
import { describe, expect, it } from 'bun:test';
import { pageOfUrl, pageUrl, pageUrls, volumeOfPage } from './scan.ts';

const BASE = 'https://archive.org/details/dictionaryoftarg0';

type Case = readonly [page: number, url: string | undefined];
const PAGES: readonly Case[] = [
	[2, `${BASE}1jastuoft/page/n25`],
	[10, `${BASE}1jastuoft/page/10`],
	[682, `${BASE}1jastuoft/page/682`],
	[683, `${BASE}1jastuoft/page/n706`],
	[684, undefined],
	[685, `${BASE}2jastuoft/page/n8`],
	[776, `${BASE}2jastuoft/page/776`],
	[1705, `${BASE}2jastuoft/page/1705`],
	[1706, undefined],
	[0, undefined],
];

/** The cases that are dictionary pages, for the round trip. */
const LINKED = PAGES.flatMap(([page, url]) =>
	url === undefined ? [] : [[page, url] as const],
);

describe('pageUrl', () => {
	it.each(PAGES)('p. %d links to %p', (page, url) => {
		expect(pageUrl(page)).toBe(url);
	});
});

describe('pageOfUrl', () => {
	it.each(LINKED)('reads p. %d back from its link', (page, url) => {
		expect(pageOfUrl(url)).toBe(page);
	});
	it.each([
		['a page outside its volume', `${BASE}1jastuoft/page/776`],
		['a foreign item', 'https://archive.org/details/Jastrow/page/10'],
		['a label the viewer lacks', `${BASE}1jastuoft/page/683`],
		['a leaf index for a labelled page', `${BASE}1jastuoft/page/n33`],
	])('refuses %s', (_, url) => {
		expect(pageOfUrl(url)).toBeUndefined();
	});
});

describe('pageUrls', () => {
	it('finds every scan link in prose, in order', () => {
		const prose = `scan 10a (${BASE}1jastuoft/page/10); then ${BASE}2jastuoft/page/776.`;
		expect(pageUrls(prose)).toEqual([
			`${BASE}1jastuoft/page/10`,
			`${BASE}2jastuoft/page/776`,
		]);
	});
});

describe('volumeOfPage', () => {
	it('puts p. 684, which prints no dictionary text, in no volume', () => {
		expect([volumeOfPage(683), volumeOfPage(684), volumeOfPage(685)]).toEqual([
			1,
			undefined,
			2,
		]);
	});
});
