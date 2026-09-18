/**
 * Controls for `validate.ts`. `truth.test.ts` passing on the committed
 * tree is a null result; these show each check CAN fire, one planted
 * defect at a time, and that it names the defect it found.
 */
import { describe, expect, it } from 'bun:test';
import type { PagePlacement } from './page.ts';
import type { SlugRow } from './slug-index.ts';
import type { TruthEntry } from './types.ts';
import {
	loadTruthFiles,
	markupProblems,
	type TruthFile,
	validateTruth,
} from './validate.ts';

function entry(id: string, slug: string, gloss: string): TruthEntry {
	return {
		id,
		slug,
		headword: { text: slug },
		page: { number: 1, column: 'a' },
		senses: [{ gloss, units: [] }],
	};
}

function tree(...entries: TruthEntry[]): TruthFile[] {
	return entries.map((e) => ({
		entry: e,
		path: `${e.id.charAt(0)}/${e.id}.json`,
	}));
}

function pagesFor(...ids: string[]): Map<string, PagePlacement> {
	return new Map(
		ids.map((id) => [id, { column: 'a', confidence: 'high', number: 1 }]),
	);
}

/** A slug index that agrees with the tree under test. Derived, not
 * hand-written: every test here plants ONE defect, and an index listing
 * fixed slugs would make a planted slug edit disagree with the index
 * too, so each such test would report two problems instead of one. The
 * index checks below plant their defect in the index itself. */
function indexFrom(files: readonly TruthFile[]): Map<string, SlugRow> {
	const rows = new Map<string, SlugRow>();
	for (const file of files) {
		const e = file.entry as Partial<TruthEntry>;
		if (typeof e.id === 'string' && typeof e.slug === 'string') {
			rows.set(e.id, { rid: e.id, slug: e.slug, status: 'live' });
		}
	}
	return rows;
}

const A = (): TruthEntry =>
	entry('A00001', 'אב', 'father, <cite ref="A00002">אבא</cite> <i>x</i>');
const B = (): TruthEntry =>
	entry(
		'A00002',
		'אבא',
		'<he>אבא</he> <cite ref="Shabbat 104a">Shab. 104ᵃ</cite>',
	);

describe('markupProblems', () => {
	it.each([
		['<i>a</i> <he>b</he> <b>c</b> <sub>d</sub> <sup>e</sup>', []],
		['<cite ref="A00002">x</cite>', []],
		[
			'<span dir="rtl">x</span>',
			['tag outside the vocabulary: <span dir="rtl">'],
		],
		['<cite>x</cite>', ['tag outside the vocabulary: <cite>']],
		['<cite ref="">x</cite>', ['tag outside the vocabulary: <cite ref="">']],
		['<he dir="rtl">x</he>', ['tag outside the vocabulary: <he dir="rtl">']],
		['<i>x</b>', ['</b> closes <i>']],
		['x</i>', ['</i> closes nothing']],
		['<he>x', ['unclosed: he']],
	])('%s', (html, expected) => {
		expect(markupProblems(html).problems).toEqual(expected);
	});

	it('collects cite refs in order', () => {
		expect(
			markupProblems('<cite ref="A00002">a</cite><cite ref="Ber. 2a">b</cite>')
				.refs,
		).toEqual(['A00002', 'Ber. 2a']);
	});
});

describe('validateTruth', () => {
	it('a valid tree has no problems', () => {
		const files = tree(A(), B());
		expect(
			validateTruth(files, pagesFor('A00001', 'A00002'), indexFrom(files)),
		).toEqual([]);
	});

	it('reports a schema failure by path and drops the entry from the corpus checks', () => {
		const files: TruthFile[] = [
			{ entry: { id: 'A00001' }, path: 'A/A00001.json' },
			...tree(B()),
		];
		const problems = validateTruth(
			files,
			pagesFor('A00001', 'A00002'),
			indexFrom(files),
		);
		expect(problems).toHaveLength(2);
		expect(problems[0]).toStartWith('A/A00001.json: schema: ');
		expect(problems[1]).toBe('page-index row A00001 has no entry');
	});

	it.each([
		[
			'a file away from its home',
			[{ entry: A(), path: 'B/A00001.json' }, ...tree(B())],
			'B/A00001.json: id A00001 belongs at A/A00001.json',
		],
		[
			'a duplicate slug',
			tree(A(), { ...B(), slug: 'אב' }),
			'A00002: slug אב taken by A00001',
		],
		[
			'markup in the headword',
			tree({ ...A(), headword: { text: '<i>אב</i>' } }, B()),
			'A00001: headword.text: markup in a plain-text field',
		],
		[
			'markup in an alt headword',
			tree({ ...A(), altHeadwords: [{ text: 'אבא</he>' }] }, B()),
			'A00001: altHeadwords[0].text: markup in a plain-text field',
		],
		[
			'markup in a slug',
			tree(A(), { ...B(), slug: '<b>אבא' }),
			'A00002: slug: markup in a plain-text field',
		],
		[
			'markup in a nested stem sense label',
			tree(A(), {
				...B(),
				stems: [
					{
						stem: 'Pi.',
						forms: [],
						senses: [
							{
								gloss: 'g',
								units: [],
								senses: [{ label: '<i>a</i>', gloss: 'n', units: [] }],
							},
						],
					},
				],
			}),
			'A00002: stems[0].senses[0].senses[0].label: markup in a plain-text field',
		],
		[
			'a dangling internal cite',
			tree(A(), entry('A00002', 'אבא', '<cite ref="A09999">x</cite>')),
			'A00002: senses[0].gloss: cite ref A09999 names no entry',
		],
		[
			'a bad tag in a nested sense unit',
			tree(A(), {
				...B(),
				senses: [
					{
						gloss: 'g',
						units: [],
						senses: [{ gloss: 'n', units: ['<u>x</u>'] }],
					},
				],
			}),
			'A00002: senses[0].senses[0].units[0]: tag outside the vocabulary: <u>',
		],
		[
			'a bad tag in a stem form',
			tree(A(), {
				...B(),
				stems: [
					{
						stem: 'Nif.',
						forms: ['<he>x'],
						senses: [{ gloss: 'g', units: [] }],
					},
				],
			}),
			'A00002: stems[0].forms[0]: unclosed: he',
		],
		[
			'a page edited in truth alone',
			tree(A(), { ...B(), page: { number: 2, column: 'b' } }),
			'A00002: page p2b but the page index says p1a',
		],
	])('reports %s', (_name, files, expected) => {
		expect(
			validateTruth(files, pagesFor('A00001', 'A00002'), indexFrom(files)),
		).toEqual([expected]);
	});

	it('reads files at every depth, so a misplaced one is reported', async () => {
		const { files, problems } = await loadTruthFiles(
			'admin/pipeline/migrate/fixtures/truth-tree',
		);
		expect(problems).toEqual([]);
		expect(files.map((f) => f.path)).toEqual([
			'A/A00001.json',
			'A/old/A00003.json',
			'A00002.json',
		]);
		expect(
			validateTruth(
				files,
				pagesFor('A00001', 'A00002', 'A00003'),
				indexFrom(files),
			),
		).toEqual([
			'A/old/A00003.json: id A00003 belongs at A/A00003.json',
			'A00002.json: id A00002 belongs at A/A00002.json',
		]);
	});

	it('reports page-index coverage both ways', () => {
		expect(
			validateTruth(
				tree(A(), B()),
				pagesFor('A00001', 'A00003'),
				indexFrom(tree(A(), B())),
			),
		).toEqual([
			'A00002: no page-index row (truth has p1a)',
			'page-index row A00003 has no entry',
		]);
	});
});

/** The slug-index checks (R10, §7.1). `truth.test.ts` passing on the
 * committed tree says nothing on its own — these plant one defect in
 * the index at a time and show each clause names what it found.
 *
 * Every case runs through `check`, so a test is its planted defect and
 * its expected message and nothing else. Spelling each call out cost
 * 35 duplicated lines and failed Sonar's 3% gate on new code. */
describe('validateTruth against the slug index', () => {
	const files = tree(A(), B());
	const FAMILY = tree(
		entry('A00001', 'גמל-1', 'x'),
		entry('A00002', 'גמל-2', 'y'),
	);

	/** Validate `on` with its own derived index, after `plant` has had a
	 * chance to corrupt that index, and with `aliases`. */
	function check(
		plant: (index: Map<string, SlugRow>) => void = () => undefined,
		aliases: Map<string, string> = new Map(),
		on: TruthFile[] = files,
	): string[] {
		const index = indexFrom(on);
		plant(index);
		const ids = on.map((f) => (f.entry as TruthEntry).id);
		return validateTruth(on, pagesFor(...ids), index, aliases);
	}

	const row =
		(rid: string, slug: string, status: 'live' | 'retired') =>
		(index: Map<string, SlugRow>): void => {
			index.set(rid, { rid, slug, status });
		};

	it('reports an entry with no index row', () => {
		expect(check((index) => index.delete('A00002'))).toEqual([
			'A00002: no slug-index row (truth has אבא)',
		]);
	});

	it('reports a slug that disagrees with its row', () => {
		// The dangerous direction: a hand edit changes the slug, the
		// index still says the old one, and the next run reassigns from
		// the index and moves the URL back.
		expect(check(row('A00002', 'גמל', 'live'))).toEqual([
			'A00002: slug אבא but the slug index says גמל',
		]);
	});

	it('reports a retired row whose entry still exists', () => {
		expect(check(row('A00002', 'אבא', 'retired'))).toEqual([
			'A00002: slug-index row is retired but the entry exists',
		]);
	});

	it('reports a live row with no entry', () => {
		expect(check(row('A00009', 'גמל', 'live'))).toEqual([
			'slug-index row A00009 is live but has no entry',
		]);
	});

	it('accepts a retired row with no entry: that is what reserving is', () => {
		expect(check(row('A00009', 'גמל', 'retired'))).toEqual([]);
	});

	it('reports an alias pointing at the wrong member of its family', () => {
		// The dangerous shape: the rid exists, so an existence check
		// passes, while /גמל resolves to a member of another family
		// entirely. A00002 holds אבא, not גמל-1.
		expect(check(undefined, new Map([['גמל', 'A00002']]))).toEqual([
			'alias גמל points at A00002, which holds אבא not גמל-1',
		]);
	});

	it('accepts an alias pointing at the -1 member', () => {
		expect(check(undefined, new Map([['גמל', 'A00001']]), FAMILY)).toEqual([]);
	});

	it('reports an alias that is also a live entry\u2019s slug', () => {
		// `/אב` cannot be both an entry and a redirect. The run calls this
		// family slug-bare-held and gives it no alias; a hand edit could.
		expect(check(undefined, new Map([['אב', 'A00002']]))).toEqual([
			"alias אב is also A00001's slug",
		]);
	});

	it('reports a collision family with no alias row at all', () => {
		// The gap a "validate what exists" check cannot see: delete the
		// alias row and the bare URL disappears while bun qa stays green.
		expect(check(undefined, new Map(), FAMILY)).toEqual([
			'family גמל has no alias row',
		]);
	});

	it('reports an alias reusing a RETIRED row\u2019s slug', () => {
		// A retired slug is reserved so nothing else takes it — an alias
		// no less than an entry.
		expect(
			check(row('A00009', 'גמל', 'retired'), new Map([['גמל', 'A00002']])),
		).toEqual(["alias גמל is also A00009's slug"]);
	});

	it('reports a family with rows but no -1 member', () => {
		// No valid alias target exists at all. auditAliases returns this
		// as a problem rather than an `add`, so dropping it would let the
		// tree pass with no canonical bare URL for the family.
		const orphaned = tree(
			entry('A00001', 'גמל-2', 'x'),
			entry('A00002', 'גמל-3', 'y'),
		);
		expect(check(undefined, new Map(), orphaned)).toEqual([
			'A00001: no גמל-1 among 2 members',
		]);
	});

	it('reports an alias pointing at a rid the index does not name', () => {
		expect(check(undefined, new Map([['גמל', 'A00009']]))).toEqual([
			'alias גמל points at A00009, which has no index row',
		]);
	});

	it('accepts an alias whose target has retired', () => {
		// The retirement path. Demanding a LIVE target would deadlock:
		// keeping the alias would fail this check, and deleting it would
		// fail "family has no alias row". A frozen alias outlives its
		// target's entry and the retired row keeps it routable.
		const survivor = tree(entry('A00002', 'גמל-2', 'y'));
		expect(
			check(
				row('A00001', 'גמל-1', 'retired'),
				new Map([['גמל', 'A00001']]),
				survivor,
			),
		).toEqual([]);
	});
});
