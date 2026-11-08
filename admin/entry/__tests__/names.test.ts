/**
 * `names.ts` against the URL names spec's own worked examples (§4,
 * §6). Every Hebrew case below is a real rid, named in the comment, so
 * a formula change is measured against the corpus the spec measured.
 */
import { describe, expect, it } from 'bun:test';
import {
	deriveFormName,
	findNameProblems,
	getPrimaryName,
	namePath,
} from '../names.ts';
import { type Entry, type FormObject, SCHEMA_VERSION } from '../schema.ts';

/** The `line` of each problem, in order — what every caller renders. */
function lines(problems: ReadonlyArray<{ line: string }>): string[] {
	return problems.map((p) => p.line);
}

/** `[what it shows, form, name]`. One-line tuples rather than object
 * literals: Sonar's duplication gate fails on a table of near-identical
 * objects. */
const CASES: ReadonlyArray<readonly [string, FormObject, string]> = [
	['a plain form is its own name', { text: 'אָב' }, 'אָב'],
	[
		'B00825: the (?) query is dropped, the star stays',
		{ text: '*(?)בַּלְוָוטִי' },
		'*בַּלְוָוטִי',
	],
	[
		'A01175: `=` stays — the cross reference is still owed',
		{ text: 'אִידְרְעָא = אֶדְרְעָא' },
		'אִידְרְעָא = אֶדְרְעָא',
	],
	[
		'a parsed reconstructed form takes the star from the flag (U5)',
		{ reconstructed: true, text: 'טְפֵי' },
		'*טְפֵי',
	],
	['its plain twin does not', { text: 'טְפֵי' }, 'טְפֵי'],
	[
		'a homograph numeral is spaced, as Sefaria spaces it',
		{ homograph: 2, text: 'אָב' },
		'אָב II',
	],
	[
		'A00015: the disambiguator is not (spec §4 formula)',
		{ disambiguator: 2, homograph: 2, text: 'אָב' },
		'אָב II²',
	],
	['a bare disambiguator, A00001', { disambiguator: 2, text: 'א' }, 'א²'],
	[
		'an I set by correction is named like any I (10-13)',
		{ homograph: 1, text: 'אוֹרְיָין' },
		'אוֹרְיָין I',
	],
	['a two-digit disambiguator', { disambiguator: 12, text: 'א' }, 'א¹²'],
	['a comma is dropped', { text: 'אֵב, אֵיב' }, 'אֵב אֵיב'],
	['parentheses go, the word inside stays', { text: '(אוֹב)' }, 'אוֹב'],
	['a gap left by stripping collapses', { text: 'אב ( ) גד' }, 'אב גד'],
	['an edge space left by stripping is trimmed', { text: '(אב) ' }, 'אב'],
	['a multi-word form keeps its one space', { text: 'נְהַר פּ' }, 'נְהַר פּ'],
];

describe('deriveFormName', () => {
	it.each(CASES.map((c) => [c[0], c[1], c[2]]))(
		'%s',
		(_what, form, expected) => {
			expect(deriveFormName(form as FormObject)).toBe(expected as string);
		},
	);

	it('returns the name in comparison form (ruling 11-07)', () => {
		// Bet with dagesh then qamats, and with qamats then dagesh: one
		// word, two strings. The name is compared as it comes out, so
		// both spellings must name it alike.
		const typed = 'ב\u05BC\u05B8';
		const canonical = 'ב\u05B8\u05BC';
		expect(typed).not.toBe(canonical);
		expect(deriveFormName({ text: typed })).toBe(
			deriveFormName({ text: canonical }),
		);
	});
});

describe('namePath', () => {
	it('spells each space as an underscore', () => {
		expect(namePath('נְהַר פּ II')).toBe('נְהַר_פּ_II');
	});
});

/** The smallest entry `getPrimaryName`/`findNameProblems` read. */
function at(id: string, form: FormObject): Entry {
	return {
		headwords: [form],
		id,
		schemaVersion: SCHEMA_VERSION,
		sefariaHeadword: id,
		senses: [],
	};
}

describe('getPrimaryName', () => {
	it('reads the primary headword form', () => {
		expect(
			getPrimaryName(
				at('A00015', { disambiguator: 2, homograph: 2, text: 'אָב' }),
			),
		).toBe('אָב II²');
	});
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('findNameProblems', () => {
	it('is empty when every name differs', () => {
		expect(
			findNameProblems([
				at('A00001', { text: 'אב' }),
				at('A00002', { text: 'גד' }),
			]),
		).toEqual([]);
	});

	it('carries the rid as a field, not as a prefix of the line', () => {
		// Gate 7 marks per rid. Recovering the rid by slicing the prose
		// would make every mark miss the day the message gains a prefix,
		// and the gate would pass 2n/2n with collisions in place.
		const [problem] = findNameProblems([
			at('A00001', { text: 'אב' }),
			at('A00002', { text: 'אב' }),
		]);
		expect(problem?.rid).toBe('A00002');
	});

	it('reports a name that strips to nothing', () => {
		// Uniqueness cannot see this: one entry whose text is all
		// notation collides with nobody and would end up reachable by no
		// URL at all.
		expect(lines(findNameProblems([at('A00001', { text: '(?)' })]))).toEqual([
			'A00001: name is empty from "(?)"',
		]);
	});

	it('names the LATER entry and the owner, in the order given', () => {
		// Which side is reported matters: the first entry in rid order
		// keeps the name, and the row tells the editor which entry needs
		// the disambiguator (spec §4).
		expect(
			lines(
				findNameProblems([
					at('A00001', { text: 'אב' }),
					at('A00002', { text: 'אב' }),
					at('A00003', { text: 'אב' }),
				]),
			),
		).toEqual([
			'A00002: name אב taken by A00001',
			'A00003: name אב taken by A00001',
		]);
	});

	it('catches a pair that collides only after the notation is stripped', () => {
		expect(
			lines(
				findNameProblems([
					at('A00001', { text: 'אב' }),
					at('A00002', { text: '(אב)' }),
				]),
			),
		).toEqual(['A00002: name אב taken by A00001']);
	});

	it('catches a pair that differs only by mark order', () => {
		// Not `אָב` under NFC and NFD: one mark has one order, so those
		// are the same string and the case would pass with no
		// normalization at all.
		expect(
			findNameProblems([
				at('A00001', { text: 'ב\u05B8\u05BC' }),
				at('A00002', { text: 'ב\u05BC\u05B8' }),
			]),
		).toHaveLength(1);
	});

	it('catches two names the URL path spells alike', () => {
		// Two strings, one path: the gate compares what the URL will be.
		expect(
			lines(
				findNameProblems([
					at('A00001', { text: 'אב גד' }),
					at('A00002', { text: 'אב_גד' }),
				]),
			),
		).toEqual(['A00002: name אב_גד taken by A00001']);
	});

	it('keeps the 23 star/plain pairs apart (U5)', () => {
		expect(
			findNameProblems([
				at('A00001', { reconstructed: true, text: 'טְפֵי' }),
				at('A00002', { text: 'טְפֵי' }),
			]),
		).toEqual([]);
	});
});
