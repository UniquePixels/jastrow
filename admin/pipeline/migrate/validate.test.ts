/**
 * Controls for `validate.ts`. `truth.test.ts` passing on the committed
 * tree is a null result; these show each check CAN fire, one planted
 * defect at a time, and that it names the defect it found.
 */
import { describe, expect, it } from 'bun:test';
import type { PagePlacement } from './page.ts';
import { SCHEMA_VERSION, type TruthEntry } from './types.ts';
import {
	loadTruthFiles,
	markupProblems,
	type TruthFile,
	validateTruth,
} from './validate.ts';

/** `headword` and `sefariaHeadword` are both the given word, so a
 * planted defect in either is the only thing the tree disagrees on. */
function entry(id: string, headword: string, gloss: string): TruthEntry {
	return {
		schemaVersion: SCHEMA_VERSION,
		id,
		sefariaHeadword: headword,
		headwords: [{ text: headword }],
		display: '{0}',
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

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('validateTruth', () => {
	it('a valid tree has no problems', async () => {
		const files = tree(A(), B());
		expect(await validateTruth(files, pagesFor('A00001', 'A00002'))).toEqual(
			[],
		);
	});

	it('reports a schema failure by path and drops the entry from the corpus checks', async () => {
		const files: TruthFile[] = [
			{ entry: { id: 'A00001' }, path: 'A/A00001.json' },
			...tree(B()),
		];
		const problems = await validateTruth(files, pagesFor('A00001', 'A00002'));
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
			'a duplicate current name',
			tree(A(), { ...B(), headwords: [{ text: 'אב' }] }),
			'A00002: name אב taken by A00001',
		],
		[
			'a name that collides only once the notation is stripped',
			// §4 drops `( ) ? ,` from the name: `(אב)` and `אב` are two
			// headwords and one URL, which nothing but this check sees.
			tree(A(), { ...B(), headwords: [{ text: '(אב)' }] }),
			'A00002: name אב taken by A00001',
		],
		[
			'a duplicate sefariaHeadword',
			tree(A(), { ...B(), sefariaHeadword: 'אב' }),
			'A00002: sefariaHeadword אב taken by A00001',
		],
		[
			'markup in the headword',
			tree({ ...A(), headwords: [{ text: '<i>אב</i>' }] }, B()),
			'A00001: headwords[0].text: markup in a plain-text field',
		],
		[
			'markup in an alt headword',
			tree(
				{
					...A(),
					headwords: [{ text: 'אב' }, { text: 'אבא</he>' }],
					display: '{0}, {1}',
				},
				B(),
			),
			'A00001: headwords[1].text: markup in a plain-text field',
		],
		[
			'markup in sefariaHeadword',
			tree(A(), { ...B(), sefariaHeadword: '<b>אבא' }),
			'A00002: sefariaHeadword: markup in a plain-text field',
		],
		[
			'markup in a former name',
			// `formerNames` is absent from every entry until publication;
			// the check is in place so the field cannot arrive unguarded.
			tree(A(), { ...B(), formerNames: ['<i>אבא'] }),
			'A00002: formerNames[0]: markup in a plain-text field',
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
		// The §3.1 rules, one planted defect each. Rule 4 is armed and
		// HELD (`headword-rules.ts`), so it has no case here — its
		// controls live in `headword-rules.test.ts`, where the switch can
		// be read on both settings.
		[
			'a display that names the wrong slots (rule 1)',
			tree(A(), {
				...B(),
				display: '{0}, {2}',
				headwords: [{ text: 'אבא' }, { text: 'אבב' }],
			}),
			'A00002: display names slots [0,2] for 2 form(s) (§3.1 rule 1)',
		],
		[
			'Hebrew written into the display (rule 2)',
			tree(A(), { ...B(), display: '{0} אב' }),
			'A00002: display carries Hebrew "א" (§3.1 rule 2)',
		],
		[
			'a numeral in the display the form does not carry (rule 3)',
			tree(A(), { ...B(), display: '{0} II' }),
			'A00002: display says homograph II but the form says undefined (§3.1 rule 3)',
		],
		[
			'a partial alternate with no full sibling (rule 5)',
			tree(A(), {
				...B(),
				display: '{0}, {1}',
				headwords: [
					{ partial: true, text: 'אבא' },
					{ partial: true, text: 'אבב' },
				],
			}),
			'A00002: headwords[1] is partial with no full sibling, so the entry has no lookup key (§3.1 rule 5)',
		],
	])('reports %s', async (_name, files, expected) => {
		expect(await validateTruth(files, pagesFor('A00001', 'A00002'))).toEqual([
			expected,
		]);
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
			await validateTruth(files, pagesFor('A00001', 'A00002', 'A00003')),
		).toEqual([
			'A/old/A00003.json: id A00003 belongs at A/A00003.json',
			'A00002.json: id A00002 belongs at A/A00002.json',
		]);
	});

	it('reports page-index coverage both ways', async () => {
		expect(
			await validateTruth(tree(A(), B()), pagesFor('A00001', 'A00003')),
		).toEqual([
			'A00002: no page-index row (truth has p1a)',
			'page-index row A00003 has no entry',
		]);
	});
});
