import { describe, expect, it } from 'bun:test';
import { decomposeForm, regenerateForm, reviewReason } from './headword.ts';
import type { FormObject } from './types.ts';

const CASES: ReadonlyArray<readonly [string, FormObject, boolean]> = [
	['אֵב', { text: 'אֵב' }, true],
	['אָב II', { homograph: 2, text: 'אָב' }, true],
	['א ²', { disambiguator: 2, text: 'א' }, true],
	['אָב II ²', { disambiguator: 2, homograph: 2, text: 'אָב' }, true],
	['*כְּפַר', { reconstructed: true, text: 'כְּפַר' }, true],
	['*אָבַד I', { homograph: 1, reconstructed: true, text: 'אָבַד' }, true],
	['חָבַב XIV', { homograph: 14, text: 'חָבַב' }, true],
	['אוּרְיָה  I, II', { text: 'אוּרְיָה  I, II' }, false],
	['בַּד  V', { text: 'בַּד  V' }, false],
	['אִידְרְעָא = אֶדְרְעָא', { text: 'אִידְרְעָא = אֶדְרְעָא' }, false],
];

describe('decomposeForm', () => {
	for (const [marked, form, parsed] of CASES) {
		it(`decomposes ${marked}`, () => {
			expect(decomposeForm(marked)).toEqual({ form, parsed });
		});
		it(`round-trips ${marked}`, () => {
			expect(regenerateForm(decomposeForm(marked).form)).toBe(marked);
		});
	}
	it('refuses a non-canonical numeral rather than renumbering it', () => {
		expect(decomposeForm('אב IIII')).toEqual({
			form: { text: 'אב IIII' },
			parsed: false,
		});
	});
});

describe('reviewReason', () => {
	it('is silent on a clean pointed form', () => {
		expect(reviewReason(decomposeForm('אָב II'))).toBeUndefined();
	});
	it('names an unparsed form', () => {
		expect(reviewReason(decomposeForm('בַּד  V'))).toEqual({
			kind: 'headword-unparsed',
			reason: 'grammar did not parse',
		});
	});
	// headword-design §4 rules these legitimate: a phrase lemma,
	// reduplication and a spaced variant. The space is the ONLY character
	// outside the lexical set in all 271 of them.
	for (const marked of ['בֵּי אֱלִישָׁפָט', 'דא דא', 'פּוּם בְדִיתָא']) {
		it(`calls ${marked} a multi-word form, not a parse failure`, () => {
			expect(reviewReason(decomposeForm(marked))).toEqual({
				kind: 'headword-multiword',
				reason: 'multi-word form; the space is its only non-lexical character',
			});
		});
	}
	// Unreachable while `FORM`'s class is `LEXICAL` plus a space, which
	// is why these are asserted on a hand-built `Decomposed` rather than
	// on a marked string: the branch has to be right the day that widens.
	it('still calls a parsed non-lexical form unparsed', () => {
		expect(reviewReason({ form: { text: 'אb' }, parsed: true })).toEqual({
			kind: 'headword-unparsed',
			reason: 'text carries characters outside the lexical set',
		});
	});
	it('does not call a space-free form multi-word', () => {
		expect(reviewReason({ form: { text: 'א=ב' }, parsed: true })).toEqual({
			kind: 'headword-unparsed',
			reason: 'text carries characters outside the lexical set',
		});
	});
});
