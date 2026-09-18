import { describe, expect, it } from 'bun:test';
import {
	type AliasRow,
	auditAliases,
	changedSlugs,
	loadAliases,
	loadSlugIndex,
	type SlugFact,
	type SlugRow,
	serialiseAliases,
	serialiseSlugIndex,
	unsafeSlugs,
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
	it('rejects a null row instead of destructuring it', async () => {
		// `null` would otherwise throw a bare TypeError, losing the path
		// and the offending line.
		await expect(loadSlugIndex(fixture('slug-index-null-row'))).rejects.toThrow(
			'row rejected',
		);
	});
	it('rejects a slug that is not in NFC', async () => {
		// The fixture holds U+FB2A, the precomposed shin-with-dot
		// presentation form, whose NFC is the decomposed pair. An NFC row
		// and an NFD row are two Map keys resolving to one URL, so the
		// duplicate checks would pass and two entries would share a name.
		await expect(loadSlugIndex(fixture('slug-index-nfd'))).rejects.toThrow(
			'slug not in NFC',
		);
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
	it('rejects an array row', async () => {
		// An array reads every field as undefined, so without this guard
		// the refusal would name the shape check rather than the row.
		await expect(
			loadAliases(fixture('slug-aliases-array-row')),
		).rejects.toThrow('row rejected');
	});
	it('rejects an alias that is not in NFC', async () => {
		await expect(loadAliases(fixture('slug-aliases-nfd'))).rejects.toThrow(
			'slug not in NFC',
		);
	});
});

describe('auditAliases', () => {
	const FAMILY: SlugFact[] = [
		{ rid: 'A00012', slug: 'אב-1' },
		{ rid: 'A00013', slug: 'אב-2' },
	];

	it('proposes the bare stem, pointing at the -1 member', () => {
		const audit = auditAliases(FAMILY, new Map());
		expect(audit.add).toEqual([{ rid: 'A00012', slug: 'אב' }]);
		expect(audit.bareHeld).toEqual([]);
		expect(audit.problems).toEqual([]);
	});

	it('leaves an existing alias alone, even pointing at a later rid', () => {
		// An alias is frozen like a slug: it never re-points, so a member
		// with a lower rid appearing later does not take it over.
		const audit = auditAliases(FAMILY, new Map([['אב', 'A00013']]));
		expect(audit.add).toEqual([]);
	});

	it('gives a lone entry no alias', () => {
		const audit = auditAliases([{ rid: 'B00001', slug: 'בד' }], new Map());
		expect(audit.add).toEqual([]);
	});

	it('reports a family whose bare stem is a real slug', () => {
		const audit = auditAliases(
			[
				{ rid: 'A00012', slug: 'אב' },
				{ rid: 'A00013', slug: 'אב-1' },
			],
			new Map(),
		);
		expect(audit.add).toEqual([]);
		expect(audit.bareHeld).toEqual(['A00012: אב is a real slug; no alias']);
	});

	it('reports a family with no -1 member rather than picking one', () => {
		const audit = auditAliases(
			[
				{ rid: 'A00012', slug: 'אב-2' },
				{ rid: 'A00013', slug: 'אב-3' },
			],
			new Map(),
		);
		expect(audit.problems).toEqual(['A00012: no אב-1 among 2 members']);
	});

	it('keeps a drifted entry in the family its SLUG names', () => {
		// A00012 holds אב-1 while its headword now stems to גמל — the
		// slug-frozen-stem-drift case the run tolerates. Grouping by the
		// headword would file it under גמל, leave family אב without a -1
		// member, and raise a pipeline fault over a review-level drift.
		const audit = auditAliases(
			[
				{ rid: 'A00012', slug: 'אב-1' },
				{ rid: 'A00013', slug: 'אב-2' },
			],
			new Map(),
		);
		expect(audit.problems).toEqual([]);
		expect(audit.add).toEqual([{ rid: 'A00012', slug: 'אב' }]);
	});
});

describe('unsafeSlugs', () => {
	it('names a slug carrying anything that is not part of a word', () => {
		// The old URL-hostile list found 12 of 22: it had no `,`, Roman
		// numeral or superscript. The rule is now an allow-list.
		expect(
			unsafeSlugs([
				{ rid: 'A00610', slug: '*(אוזפיה)' },
				{ rid: 'A01175', slug: 'אידרעא-=-אדרעא' },
				{ rid: 'B00407', slug: 'בזא-I,-II,' },
				{ rid: 'P00224', slug: '(עוזרד-²' },
				{ rid: 'A00013', slug: 'אב-2' },
			]),
		).toEqual([
			'A00610: *(אוזפיה)',
			'A01175: אידרעא-=-אדרעא',
			'B00407: בזא-I,-II,',
			'P00224: (עוזרד-²',
		]);
	});
	it('leaves Hebrew letters, geresh, gershayim and a family number alone', () => {
		expect(
			unsafeSlugs([
				{ rid: 'A00013', slug: 'אב-2' },
				{ rid: 'P00137', slug: 'ע׳-עדיא' },
				{ rid: 'P00731', slug: 'עכ״ום' },
			]),
		).toEqual([]);
	});
});

describe('changedSlugs', () => {
	const committed = new Map<string, SlugRow>([
		['A00012', { rid: 'A00012', slug: 'אב-1', status: 'live' }],
		['A00013', { rid: 'A00013', slug: 'אב-2', status: 'live' }],
		['A00020', { rid: 'A00020', slug: 'אבא', status: 'retired' }],
	]);
	it('names every rid whose slug differs from the committed index', () => {
		expect(
			changedSlugs(
				[
					{ rid: 'A00012', slug: 'אב-1' },
					{ rid: 'A00013', slug: 'אב' },
					{ rid: 'A00030', slug: 'אבד' },
				],
				committed,
			),
		).toEqual([
			'A00013: אב-2 → אב',
			'A00030: (none) → אבד',
			'A00020: אבא → (none)',
		]);
	});
	it('is empty when the run reproduces the index', () => {
		expect(
			changedSlugs(
				[
					{ rid: 'A00012', slug: 'אב-1' },
					{ rid: 'A00013', slug: 'אב-2' },
					{ rid: 'A00020', slug: 'אבא' },
				],
				committed,
			),
		).toEqual([]);
	});
});
