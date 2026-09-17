import { describe, expect, it } from 'bun:test';
import {
	type AliasRow,
	loadAliases,
	loadSlugIndex,
	type SlugRow,
	serialiseAliases,
	serialiseSlugIndex,
} from './slug-index.ts';

/** Committed fixtures, as `page.test.ts` uses for the page index: the
 * loaders are exercised on a real read, and a test run writes nothing
 * into the repository. */
function fixture(name: string): string {
	return `${import.meta.dir}/fixtures/${name}.jsonl`;
}

const ROWS: SlugRow[] = [
	{ rid: 'A00014', slug: 'אב-3', status: 'live' },
	{ rid: 'A00012', slug: 'אב-1', status: 'live' },
	{ rid: 'A00013', slug: 'אב-2', status: 'retired' },
];

describe('serialiseSlugIndex', () => {
	it('sorts by rid and ends with a newline', async () => {
		expect(serialiseSlugIndex(ROWS)).toBe(
			await Bun.file(fixture('slug-index')).text(),
		);
	});
	it('writes the slug in NFC', () => {
		// The same slug decomposed: a lookup keyed on it must not depend
		// on which normalisation the caller happened to hold.
		const out = serialiseSlugIndex([
			{ rid: 'A00012', slug: 'אב-1'.normalize('NFD'), status: 'live' },
		]);
		expect(out).toBe('{"rid":"A00012","slug":"אב-1","status":"live"}\n');
	});
});

describe('serialiseAliases', () => {
	it('sorts by slug and omits status', () => {
		const aliases: AliasRow[] = [
			{ rid: 'B00001', slug: 'בב' },
			{ rid: 'A00012', slug: 'אב' },
		];
		expect(serialiseAliases(aliases)).toBe(
			'{"rid":"A00012","slug":"אב"}\n{"rid":"B00001","slug":"בב"}\n',
		);
	});
});

describe('loadSlugIndex', () => {
	it('reads rows in file order and keeps status', async () => {
		const index = await loadSlugIndex(fixture('slug-index'));
		expect([...index.keys()]).toEqual(['A00012', 'A00013', 'A00014']);
		expect(index.get('A00013')).toEqual({
			rid: 'A00013',
			slug: 'אב-2',
			status: 'retired',
		});
	});
	it('rejects one slug held by two rids', async () => {
		await expect(
			loadSlugIndex(fixture('slug-index-duplicate-slug')),
		).rejects.toThrow('slug אב-1 held by A00012 and A00013');
	});
	it('rejects a duplicate rid', async () => {
		await expect(
			loadSlugIndex(fixture('slug-index-duplicate-rid')),
		).rejects.toThrow('duplicate rid A00012');
	});
	it('rejects an unknown status', async () => {
		await expect(
			loadSlugIndex(fixture('slug-index-bad-status')),
		).rejects.toThrow('row rejected');
	});
	it('rejects a malformed rid', async () => {
		await expect(loadSlugIndex(fixture('slug-index-bad-rid'))).rejects.toThrow(
			'row rejected',
		);
	});
	it('names the line that does not parse', async () => {
		await expect(loadSlugIndex(fixture('slug-index-unparsed'))).rejects.toThrow(
			'does not parse',
		);
	});
	it('ignores blank lines', async () => {
		const index = await loadSlugIndex(fixture('slug-index-blank-lines'));
		expect(index.size).toBe(1);
	});
});

describe('loadAliases', () => {
	it('maps bare stem to rid', async () => {
		expect(await loadAliases(fixture('slug-aliases'))).toEqual(
			new Map([['אב', 'A00012']]),
		);
	});
	it('rejects an alias that resolves two ways', async () => {
		await expect(
			loadAliases(fixture('slug-aliases-duplicate')),
		).rejects.toThrow('duplicate alias אב');
	});
});
