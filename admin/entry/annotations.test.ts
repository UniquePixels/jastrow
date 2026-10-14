// biome-ignore-all lint/style/noExcessiveLinesPerFile: a table-driven suite; one planted defect per row, and the fixtures they share read as one unit.
/**
 * Controls for the annotation clause of the entry contract
 * (`annotations.ts`; ANNOTATIONS.md §2, ruling `10-13 correction
 * policy`). No committed entry carries an annotation yet, so `bun
 * data:validate` passing is a null result for every check here: each
 * case plants one defect and names the problem it must raise.
 *
 * Every case runs through `validateEntry`, so the schema half (shape,
 * enums, patterns) and the code half (the field resolves, `stored`
 * agrees, `kept` ⇔ printed = stored, one per field) are held as one
 * contract, the way a hand edit meets it.
 */
import { describe, expect, it } from 'bun:test';
import { entryAnnotations, isIsoDate } from './annotations.ts';
import {
	type Annotation,
	type Entry,
	type FormObject,
	SCHEMA_VERSION,
	type Sense,
} from './types.ts';
import { validateEntry } from './validate.ts';

const PATH = 'A/A00001.json';

/** A valid case-2 note on a gloss: print's `fathr`, our `father`. */
function note(over: Partial<Annotation> = {}): Annotation {
	return {
		field: 'gloss',
		kind: 'print-error',
		printed: 'fathr',
		stored: 'father',
		evidence: 'the scan reads fathr',
		source: 'P000001',
		date: '2026-10-13',
		...over,
	};
}

/** The one entry every case plants into: form I with a display that
 * sets it, and one labelled sense with two units. */
function base(
	form: Partial<FormObject> = {},
	sense: Partial<Sense> = {},
): Entry {
	return {
		schemaVersion: SCHEMA_VERSION,
		id: 'A00001',
		sefariaHeadword: 'אב',
		headwords: [{ text: 'אב', homograph: 1, ...form }],
		display: '{0} I',
		senses: [
			{ gloss: 'father, <i>x</i>', label: '1', units: ['u0', 'u1'], ...sense },
		],
	};
}

/** A note in one positional call, so each table row stays one line. */
function n(
	field: string,
	printed: string,
	stored: string,
	kind = 'print-error',
): Annotation {
	return note({
		field: field as Annotation['field'],
		kind: kind as Annotation['kind'],
		printed,
		stored,
	});
}

const onForm = (...notes: Annotation[]): Entry => base({ annotations: notes });
const onSense = (...notes: Annotation[]): Entry =>
	base({}, { annotations: notes });

/** What the contract says about one planted entry. */
async function problemsOf(entry: unknown): Promise<string[]> {
	return await validateEntry(entry, PATH);
}

describe('annotations: what passes', () => {
	it.each([
		['a gloss print-error, stored a substring', onSense(note())],
		['a units[1] note', onSense(n('units[1]', 'v1', 'u1'))],
		['a label renumber', onSense(n('label', '', '1'))],
		['a kept label', onSense(n('label', '1', '1', 'kept'))],
		[
			'an illegible gloss reading',
			onSense(n('gloss', 'f?ther', 'father', 'illegible')),
		],
		['a homograph I on a form', onForm(n('homograph', '', 'I'))],
		['a form text print-error', onForm(n('text', 'אד', 'אב'))],
		['two fields on one sense', onSense(note(), n('label', '', '1'))],
		[
			'a nested stem sense',
			{
				...base(),
				stems: [
					{
						forms: [],
						senses: [
							{
								gloss: 'g',
								senses: [
									{
										annotations: [note({ stored: 'n' })],
										gloss: 'n',
										units: [],
									},
								],
								units: [],
							},
						],
						stem: 'Pi.',
					},
				],
			},
		],
	] as [string, Entry][])('%s', async (_name, entry) => {
		expect(await problemsOf(entry)).toEqual([]);
	});
});

describe('annotations: the schema half', () => {
	it.each([
		['an empty list, never []', base({}, { annotations: [] }), 'minItems'],
		[
			'a kind outside the enum',
			onSense(n('gloss', 'fathr', 'father', 'typo')),
			'allowedValues',
		],
		[
			'a source that is not P + 6 digits',
			onSense(note({ source: 'P00001' })),
			'^P\\\\d{6}$',
		],
		[
			'a date that is not YYYY-MM-DD',
			onSense(note({ date: '13/10/2026' })),
			'\\\\d{4}-',
		],
		['an empty evidence', onSense(note({ evidence: '' })), 'minLength'],
		[
			'a field outside the five shapes',
			onSense(n('units[01]', 'fathr', 'father')),
			'pattern',
		],
		[
			'a key the shape does not name',
			onSense({ ...note(), extra: 1 } as Annotation),
			'additionalProperties',
		],
		[
			'a missing key',
			onSense({ ...note(), source: undefined } as unknown as Annotation),
			'required',
		],
	] as [string, Entry, string][])(
		'refuses %s',
		async (_name, entry, keyword) => {
			const problems = await problemsOf(entry);
			expect(problems).toHaveLength(1);
			expect(problems[0]).toStartWith(`${PATH}: schema: `);
			expect(problems[0]).toContain(keyword);
		},
	);
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one table, one row per check; splitting it would scatter the clause it pins.
describe('annotations: the code half', () => {
	it.each([
		[
			'a calendar date that does not exist',
			onSense(note({ date: '2026-02-30' })),
			'senses[0].annotations[0]: date 2026-02-30 is not a calendar date',
		],
		[
			'a sense field on a form',
			onForm(note()),
			'headwords[0].annotations[0]: field gloss does not resolve on a form',
		],
		[
			'a form field on a sense',
			onSense(n('text', 'fathr', 'אב')),
			'senses[0].annotations[0]: field text does not resolve on a sense',
		],
		[
			'a homograph on a form with none',
			{
				...base(),
				display: '{0}',
				headwords: [{ annotations: [n('homograph', '', 'I')], text: 'אב' }],
			},
			'headwords[0].annotations[0]: field homograph does not resolve on a form',
		],
		[
			'a label on an unlabelled sense',
			{
				...base(),
				senses: [{ annotations: [n('label', '', '1')], gloss: 'g', units: [] }],
			},
			'senses[0].annotations[0]: field label does not resolve on a sense',
		],
		[
			'units[n] past the last unit',
			onSense(n('units[2]', 'v', 'u')),
			'senses[0].annotations[0]: field units[2] does not resolve on a sense',
		],
		[
			'a text stored unequal to the form',
			onForm(n('text', 'אד', 'אבא')),
			'headwords[0].annotations[0]: stored "אבא" but text holds "אב"',
		],
		[
			'a homograph stored as an arabic number',
			onForm(n('homograph', '', '1')),
			'headwords[0].annotations[0]: stored "1" but homograph holds "I"',
		],
		[
			'a label stored unequal to the label',
			onSense(n('label', '', '2')),
			'senses[0].annotations[0]: stored "2" but label holds "1"',
		],
		[
			'a gloss stored that is not in the gloss',
			onSense(n('gloss', 'fathr', 'mother')),
			'senses[0].annotations[0]: stored "mother" does not occur in gloss',
		],
		[
			'a unit stored that is not in the unit',
			onSense(n('units[0]', 'v', 'u1')),
			'senses[0].annotations[0]: stored "u1" does not occur in units[0]',
		],
		[
			'kept, with printed and stored apart',
			onSense(n('gloss', 'fathr', 'father', 'kept')),
			'senses[0].annotations[0]: kind kept, but printed "fathr" is not stored "father"',
		],
		[
			'a print-error with printed equal to stored',
			onSense(n('gloss', 'father', 'father')),
			'senses[0].annotations[0]: kind print-error, but printed equals stored "father"',
		],
		[
			'an illegible with printed equal to stored',
			onSense(n('gloss', 'father', 'father', 'illegible')),
			'senses[0].annotations[0]: kind illegible, but printed equals stored "father"',
		],
		[
			'two notes on one field',
			onSense(note(), n('gloss', 'fther', 'father')),
			'senses[0]: 2 annotations on gloss; at most one per field',
		],
	] as [string, Entry, string][])('refuses %s', async (_name, entry, tail) => {
		expect(await problemsOf(entry)).toEqual([`A00001: ${tail}`]);
	});
});

describe('isIsoDate', () => {
	it.each([
		['2026-10-13', true],
		['2024-02-29', true],
		['2026-02-29', false],
		['2026-13-01', false],
		['2026-1-01', false],
		['20261013', false],
	])('%s → %p', (value, expected) => {
		expect(isIsoDate(value)).toBe(expected);
	});
});

describe('entryAnnotations', () => {
	it('walks forms, then senses, then stems, nested senses included, with paths', () => {
		const entry: Entry = {
			...base(
				{
					annotations: [
						note({
							field: 'homograph',
							printed: '',
							stored: 'I',
							source: 'P000001',
						}),
					],
				},
				{
					annotations: [note({ source: 'P000002' })],
					senses: [
						{
							annotations: [note({ source: 'P000003', stored: 'n' })],
							gloss: 'n',
							units: [],
						},
					],
				},
			),
			stems: [
				{
					forms: [],
					senses: [
						{
							annotations: [note({ source: 'P000004', stored: 's' })],
							gloss: 's',
							units: [],
						},
					],
					stem: 'Pi.',
				},
			],
		};
		expect(
			[...entryAnnotations(entry)].map(
				(a) => `${a.path} ${a.annotation.source}`,
			),
		).toEqual([
			'headwords[0].annotations[0] P000001',
			'senses[0].annotations[0] P000002',
			'senses[0].senses[0].annotations[0] P000003',
			'stems[0].senses[0].annotations[0] P000004',
		]);
	});

	it('yields nothing for an entry with no annotations', () => {
		expect([...entryAnnotations(base())]).toEqual([]);
	});
});
