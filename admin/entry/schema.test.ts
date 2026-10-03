import { describe, expect, it } from 'bun:test';
import Ajv2020 from 'ajv/dist/2020';
import { SCHEMA_PATH } from './paths.ts';
import { validateEntry } from './validate.ts';

// A runtime read, like the module's own two load sites: the schema
// is handed to the module through paths.ts, not compiled in, so this
// is the one place a change to its shape is checked at all.
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validate = ajv.compile(await Bun.file(SCHEMA_PATH).json());

function errorPaths(): string[] {
	return (validate.errors ?? []).map((error) => error.instancePath || '/');
}

type Fixture = Record<string, unknown>;

const minimalEntry: Fixture = {
	schemaVersion: 2,
	id: 'A00014',
	sefariaHeadword: 'אָב II',
	headwords: [{ text: 'אָב' }],
	senses: [{ gloss: 'father', units: [] }],
};

const fullEntry: Fixture = {
	...minimalEntry,
	// A gender on every headword and none on `grammar` (HW-gender): the
	// schema cannot hold a file to that rule, so this fixture keeps it
	// rather than leaning on the schema's silence.
	headwords: [
		{ text: 'אָב', homograph: 2, gender: 'm' },
		{ text: 'אבא', reconstructed: true, partial: true, gender: 'f' },
	],
	display: '{0} II m., *({1}) f.',
	page: { number: 2, column: 'a' },
	grammar: { number: 'pl', pos: 'noun' },
	senses: [
		{
			gloss: 'm. (b. h.), const. <cite ref="A00013">אֲבִי</cite>, father.',
			units: ['<cite ref="Shabbat 104a">Shab. 104a</cite> example.'],
		},
		{ label: '1', gloss: 'first sense', units: ['unit text'] },
		{
			label: '2',
			gloss: 'second sense',
			units: ['unit text'],
			senses: [{ label: 'a', gloss: 'nested sense', units: [] }],
		},
	],
	stems: [
		{
			stem: 'Nif.',
			forms: ['נֶאֱבַד'],
			senses: [{ gloss: 'passive sense', units: ['unit text'] }],
		},
	],
};

const deepRecursionEntry: Fixture = {
	...minimalEntry,
	senses: [
		{
			gloss: 'top',
			units: [],
			senses: [
				{
					gloss: 'mid',
					units: [],
					senses: [{ gloss: 'bottom', units: [] }],
				},
			],
		},
	],
};

describe('entry.schema.json valid entries', () => {
	it('accepts a minimal valid entry', () => {
		expect(validate(minimalEntry), JSON.stringify(validate.errors)).toBe(true);
	});

	it('accepts a full-featured entry', () => {
		expect(validate(fullEntry), JSON.stringify(validate.errors)).toBe(true);
	});

	it('accepts an entry carrying both genders, which only validateEntry refuses (HW-gender)', async () => {
		const both = {
			...minimalEntry,
			headwords: [{ text: 'אָב', gender: 'm' }],
			display: '{0} m.',
			grammar: { gender: 'm' },
		};
		expect(validate(both), JSON.stringify(validate.errors)).toBe(true);
		expect(await validateEntry(both, 'A/A00014.json')).toEqual([
			'A00014: grammar.gender beside a form gender on headwords [0]; an entry carries one or the other, never both (HW-gender)',
		]);
	});

	it('accepts a sense nested two levels deep', () => {
		expect(validate(deepRecursionEntry), JSON.stringify(validate.errors)).toBe(
			true,
		);
	});
});

const invalidCases: { name: string; entry: unknown; errorPath: string }[] = [
	{
		name: 'an unknown top-level field',
		entry: { ...minimalEntry, refs: ['Shabbat 104a'] },
		errorPath: '/',
	},
	{
		name: 'a sense missing gloss',
		entry: { ...minimalEntry, senses: [{ label: '1', units: [] }] },
		errorPath: '/senses/0',
	},
	{
		name: 'a sense missing units',
		entry: { ...minimalEntry, senses: [{ gloss: 'g' }] },
		errorPath: '/senses/0',
	},
	{
		name: 'a bad id pattern',
		entry: { ...minimalEntry, id: 'A014' },
		errorPath: '/id',
	},
	{
		name: 'an empty senses array',
		entry: { ...minimalEntry, senses: [] },
		errorPath: '/senses',
	},
	{
		name: 'a page without number',
		entry: { ...minimalEntry, page: { column: 'a' } },
		errorPath: '/page',
	},
	{
		name: 'a stems item missing forms',
		entry: {
			...minimalEntry,
			stems: [
				{ stem: 'Nif.', senses: [{ gloss: 'passive sense', units: [] }] },
			],
		},
		errorPath: '/stems/0',
	},
	{
		name: 'a sense with an unknown extra property',
		entry: { ...minimalEntry, senses: [{ gloss: 'g', units: [], bogus: 1 }] },
		errorPath: '/senses/0',
	},
	{
		name: 'a lowercase id letter',
		entry: { ...minimalEntry, id: 'a00014' },
		errorPath: '/id',
	},
	{
		name: 'an id with an extra digit',
		entry: { ...minimalEntry, id: 'A000144' },
		errorPath: '/id',
	},
	{
		name: 'an invalid page column',
		entry: { ...minimalEntry, page: { number: 2, column: 'z' } },
		errorPath: '/page/column',
	},
	{
		name: 'an empty grammar object',
		entry: { ...minimalEntry, grammar: {} },
		errorPath: '/grammar',
	},
	{
		name: 'a headword with homograph below minimum',
		entry: { ...minimalEntry, headwords: [{ text: 'x', homograph: 0 }] },
		errorPath: '/headwords/0/homograph',
	},
	{
		name: 'an entry with no headwords at all',
		entry: { ...minimalEntry, headwords: [] },
		errorPath: '/headwords',
	},
	{
		name: 'a schemaVersion that is not 2',
		entry: { ...minimalEntry, schemaVersion: 1 },
		errorPath: '/schemaVersion',
	},
	{
		name: 'the pre-rewrite headword/altHeadwords pair',
		entry: {
			...minimalEntry,
			headword: { text: 'x' },
			altHeadwords: [{ text: 'y' }],
		},
		errorPath: '/',
	},
	{
		name: 'a partial that is false rather than absent',
		entry: { ...minimalEntry, headwords: [{ text: 'x', partial: false }] },
		errorPath: '/headwords/0/partial',
	},
	{
		name: 'a reconstructed that is false rather than absent',
		entry: {
			...minimalEntry,
			headwords: [{ text: 'x', reconstructed: false }],
		},
		errorPath: '/headwords/0/reconstructed',
	},
	{
		name: 'a gender outside m/f on a form',
		entry: { ...minimalEntry, headwords: [{ text: 'x', gender: 'c' }] },
		errorPath: '/headwords/0/gender',
	},
	{
		name: 'an empty display string',
		entry: { ...minimalEntry, display: '' },
		errorPath: '/display',
	},
	{
		name: 'a stems forms item that is an empty string',
		entry: {
			...minimalEntry,
			stems: [
				{
					stem: 'Nif.',
					forms: [''],
					senses: [{ gloss: 'passive sense', units: [] }],
				},
			],
		},
		errorPath: '/stems/0/forms/0',
	},
];

describe('entry.schema.json invalid entries', () => {
	for (const { name, entry, errorPath } of invalidCases) {
		it(`rejects ${name}`, () => {
			expect(validate(entry)).toBe(false);
			expect(errorPaths()).toContain(errorPath);
		});
	}
});
