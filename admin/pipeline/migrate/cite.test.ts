import { describe, expect, it } from 'bun:test';
import {
	buildHeadwordMap,
	checkQuarantine,
	createResolver,
	internalTarget,
	loadQuarantine,
} from './cite.ts';

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

describe('quarantine', () => {
	it('loads an empty list when the file is absent', async () => {
		expect(
			await loadQuarantine(`${import.meta.dir}/no-such-file.json`),
		).toEqual([]);
	});
	it('names unlisted and stale rows', () => {
		const result = checkQuarantine(
			[{ rid: 'A00001', target: 'x' }],
			[{ note: 'reviewed', rid: 'A00002', target: 'y' }],
		);
		expect(result.unlisted).toEqual(['A00001\tx']);
		expect(result.stale).toEqual(['A00002\ty']);
	});
});
