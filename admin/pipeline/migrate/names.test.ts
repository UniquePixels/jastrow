/**
 * `names.ts` against the URL names spec's own worked examples (§4,
 * §6). Every Hebrew case below is a real rid, named in the comment, so
 * a formula change is measured against the corpus the spec measured.
 */
import { describe, expect, it } from 'bun:test';
import { deriveName, nameCollisions, nameKey, nameOf } from './names.ts';
import type { FormObject, TruthEntry } from './types.ts';

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
	['a two-digit disambiguator', { disambiguator: 12, text: 'א' }, 'א¹²'],
	['a comma is dropped', { text: 'אֵב, אֵיב' }, 'אֵב אֵיב'],
	['parentheses go, the word inside stays', { text: '(אוֹב)' }, 'אוֹב'],
	['a gap left by stripping collapses', { text: 'אב ( ) גד' }, 'אב גד'],
	['an edge space left by stripping is trimmed', { text: '(אב) ' }, 'אב'],
	['a multi-word form keeps its one space', { text: 'נְהַר פּ' }, 'נְהַר פּ'],
];

describe('deriveName', () => {
	it.each(
		CASES.map((c) => [c[0], c[1], c[2]]),
	)('%s', (_what, form, expected) => {
		expect(deriveName(form as FormObject)).toBe(expected as string);
	});

	it('never rewrites the stored text (spec §4)', () => {
		// The name of a decomposed form comes back decomposed. NFC is a
		// comparison rule, not a storage rule: normalising here would make
		// the derivation lossy against a `text` the pipeline must leave
		// byte-exact.
		const decomposed = 'אָב'.normalize('NFD');
		expect(deriveName({ text: decomposed })).toBe(decomposed);
	});
});

describe('nameKey', () => {
	it('folds the two spellings of one name together', () => {
		expect(nameKey('אָב'.normalize('NFD'))).toBe(nameKey('אָב'.normalize('NFC')));
	});
});

/** The smallest entry `nameOf`/`nameCollisions` read. */
function at(id: string, form: FormObject): TruthEntry {
	return { headword: form, id, sefariaHeadword: id, senses: [] };
}

describe('nameOf', () => {
	it('reads the primary headword form', () => {
		expect(
			nameOf(at('A00015', { disambiguator: 2, homograph: 2, text: 'אָב' })),
		).toBe('אָב II²');
	});
});

describe('nameCollisions', () => {
	it('is empty when every name differs', () => {
		expect(
			nameCollisions([
				at('A00001', { text: 'אב' }),
				at('A00002', { text: 'גד' }),
			]),
		).toEqual([]);
	});

	it('names the LATER entry and the owner, in the order given', () => {
		// Which side is reported matters: the first entry in rid order
		// keeps the name, and the row tells the editor which entry needs
		// the disambiguator (spec §4).
		expect(
			nameCollisions([
				at('A00001', { text: 'אב' }),
				at('A00002', { text: 'אב' }),
				at('A00003', { text: 'אב' }),
			]),
		).toEqual([
			'A00002: name אב taken by A00001',
			'A00003: name אב taken by A00001',
		]);
	});

	it('catches a pair that collides only after the notation is stripped', () => {
		expect(
			nameCollisions([
				at('A00001', { text: 'אב' }),
				at('A00002', { text: '(אב)' }),
			]),
		).toEqual(['A00002: name אב taken by A00001']);
	});

	it('catches a pair that differs only by normalization', () => {
		expect(
			nameCollisions([
				at('A00001', { text: 'אָב'.normalize('NFC') }),
				at('A00002', { text: 'אָב'.normalize('NFD') }),
			]),
		).toHaveLength(1);
	});

	it('keeps the 23 star/plain pairs apart (U5)', () => {
		expect(
			nameCollisions([
				at('A00001', { reconstructed: true, text: 'טְפֵי' }),
				at('A00002', { text: 'טְפֵי' }),
			]),
		).toEqual([]);
	});
});
