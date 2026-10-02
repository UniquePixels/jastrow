import { describe, expect, it } from 'bun:test';
import { buildHeadwordMap, createResolver, internalTarget } from './cite.ts';

const MAP = buildHeadwordMap([
	{ headword: 'אָב I', rid: 'A00013' },
	{ headword: 'חָבַב I', rid: 'H00001' },
]);

describe('internalTarget', () => {
	it('strips the prefix, the sense suffix and underscores', () => {
		expect(internalTarget('/Jastrow,_חָבַב I.1')).toBe('חָבַב I');
		expect(internalTarget('Jastrow,_%D7%90%D7%91.1')).toBe('אב');
	});
	it('is undefined for an external href', () => {
		expect(internalTarget('/Shabbat.104a')).toBeUndefined();
	});
});

describe('buildHeadwordMap', () => {
	it('refuses a duplicate headword string', () => {
		expect(() =>
			buildHeadwordMap([
				{ headword: 'x', rid: 'A00001' },
				{ headword: 'x', rid: 'A00002' },
			]),
		).toThrow(/A00001.*A00002/u);
	});
	it('refuses two headwords that differ only in combining-mark order', () => {
		expect(() =>
			buildHeadwordMap([
				{ headword: 'גֵּץ', rid: 'A00001' },
				{ headword: 'גֵּץ', rid: 'A00002' },
			]),
		).toThrow(/A00001.*A00002/u);
	});
});

describe('createResolver', () => {
	it('resolves internal, passes external, records unknown', () => {
		const unresolved: { rid: string; target: string }[] = [];
		const resolve = createResolver(MAP, 'Z00001', unresolved);
		expect(
			resolve({ dataRef: 'Jastrow, אָב I 1', href: '/Jastrow,_אָב I.1' }),
		).toBe('A00013');
		expect(resolve({ dataRef: 'Shabbat 104a', href: '/Shabbat.104a' })).toBe(
			'Shabbat 104a',
		);
		expect(
			resolve({ dataRef: 'Jastrow, גימ 1', href: '/Jastrow,_גימ.1' }),
		).toBe('גימ');
		expect(unresolved).toEqual([{ rid: 'Z00001', target: 'גימ' }]);
	});
	it('falls back to the href when an external anchor has no data-ref', () => {
		const resolve = createResolver(MAP, 'Z00001', []);
		expect(resolve({ dataRef: '', href: '/Shabbat.104a' })).toBe(
			'/Shabbat.104a',
		);
	});
});

describe('createResolver canonical equivalence', () => {
	it('resolves a target whose combining marks are in another order', () => {
		const map = buildHeadwordMap([{ headword: 'גֵּץ', rid: 'C01220' }]);
		const unresolved: { rid: string; target: string }[] = [];
		const resolve = createResolver(map, 'C00802', unresolved);
		expect(resolve({ dataRef: 'Jastrow, גֵּץ', href: '/Jastrow,_גֵּץ.1' })).toBe(
			'C01220',
		);
		expect(unresolved).toEqual([]);
	});
	it('records the target as written, not a normalized spelling', () => {
		const unresolved: { rid: string; target: string }[] = [];
		const resolve = createResolver(new Map(), 'C00802', unresolved);
		expect(resolve({ dataRef: '', href: '/Jastrow,_גֵּץ.1' })).toBe('גֵּץ');
		expect(unresolved).toEqual([{ rid: 'C00802', target: 'גֵּץ' }]);
	});
});
