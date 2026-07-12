import { describe, expect, it } from 'bun:test';
import Ajv2020 from 'ajv/dist/2020';
import entrySchema from './entry.schema.json' with { type: 'json' };

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validate = ajv.compile(entrySchema);

function errorPaths(): string[] {
	return (validate.errors ?? []).map((error) => error.instancePath || '/');
}

type Entry = Record<string, unknown>;

const minimalEntry: Entry = {
	id: 'A00014',
	slug: 'אב-2',
	headword: { text: 'אָב' },
	senses: [{ gloss: 'father' }],
};

const fullEntry: Entry = {
	...minimalEntry,
	headword: { text: 'אָב', homograph: 2 },
	altHeadwords: [{ text: 'אבא', reconstructed: true }],
	page: { number: 2, column: 'a' },
	grammar: { gender: 'm', number: 'pl', pos: 'noun' },
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
			senses: [{ label: 'a', gloss: 'nested sense' }],
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

describe('entry.schema.json valid entries', () => {
	it('accepts a minimal valid entry', () => {
		expect(validate(minimalEntry)).toBe(true);
	});

	it('accepts a full-featured entry', () => {
		expect(validate(fullEntry)).toBe(true);
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
		entry: { ...minimalEntry, senses: [{ label: '1' }] },
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
			stems: [{ stem: 'Nif.', senses: [{ gloss: 'passive sense' }] }],
		},
		errorPath: '/stems/0',
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
