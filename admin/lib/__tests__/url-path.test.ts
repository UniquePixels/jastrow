import { describe, expect, it } from 'bun:test';
import { buildEntryPaths, toUrlWord } from '../url-path.ts';

describe('toUrlWord', () => {
	it('keeps letters, maqaf, geresh and gershayim, drops the rest', () => {
		expect(toUrlWord('*אָמַר')).toBe('אמר');
		expect(toUrlWord('בית־יוני')).toBe('בית־יוני');
		expect(toUrlWord('עָ׳ עַדְיָא')).toBe('ע׳_עדיא');
		expect(toUrlWord('עי״ן')).toBe('עי״ן');
		expect(toUrlWord('אָב II')).toBe('אב');
		expect(toUrlWord('א ²')).toBe('א');
		expect(toUrlWord('(?)בַּלְוָוטִי')).toBe('בלווטי');
	});

	it('reads mark order alike (NFC first)', () => {
		expect(toUrlWord('בַּד'.normalize('NFD'))).toBe(toUrlWord('בַּד'));
	});

	it('joins a whitespace run as one underscore', () => {
		expect(toUrlWord('א \t ב')).toBe('א_ב');
	});
});

describe('buildEntryPaths', () => {
	it('numbers a word in rid order, whatever order it is given', () => {
		const e = (
			id: string,
			text: string,
		): { headwords: { text: string }[]; id: string } => ({
			headwords: [{ text }],
			id,
		});
		const paths = buildEntryPaths([
			e('A02062', 'אָמַר'),
			e('A02060', 'אֲמַר'),
			e('A02061', 'אִמֵּר'),
			e('B00001', 'בָּא'),
		] as never);
		expect([...paths]).toEqual([
			['A02060', '/אמר'],
			['A02061', '/אמר-2'],
			['A02062', '/אמר-3'],
			['B00001', '/בא'],
		]);
	});
});
