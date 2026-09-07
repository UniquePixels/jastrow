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
		expect(reviewReason(decomposeForm('בַּד  V'))).toBe('grammar did not parse');
	});
	it('names a phrase lemma', () => {
		expect(reviewReason(decomposeForm('בֵּי אֱלִישָׁפָט'))).toBe(
			'text carries characters outside the lexical set',
		);
	});
});
