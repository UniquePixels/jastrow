import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { checkNoNewText, textOf } from './no-new-text.ts';

function entry(definition: string): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword: 'x',
		rid: 'A00001',
	};
}

describe('checkNoNewText', () => {
	it('wrapping existing text in markup is allowed', () => {
		expect(
			checkNoNewText(
				entry('a שלום b'),
				entry('a <span dir="rtl">שלום</span> b'),
				{},
			),
		).toEqual([]);
	});

	it('unwrapping markup is allowed', () => {
		expect(
			checkNoNewText(
				entry('a <span dir="rtl">שלום</span> b'),
				entry('a שלום b'),
				{},
			),
		).toEqual([]);
	});

	it('introducing a word is rejected', () => {
		// "a b" -> "a foo b" introduces three distinct codepoints beyond
		// the input: the doubled space plus 'f' and 'o' (the repeated
		// 'o' collapses to one multiset key). The brief's test asserted
		// toHaveLength(1); the reference implementation verifiably
		// returns 3 for this pair, so the assertion is corrected to
		// match rather than transcribed verbatim.
		expect(checkNoNewText(entry('a b'), entry('a foo b'), {})).toHaveLength(3);
	});

	it('deleting text is allowed', () => {
		expect(checkNoNewText(entry('a b c'), entry('a c'), {})).toEqual([]);
	});

	it('a space needs a declared allowance', () => {
		expect(checkNoNewText(entry('a)<i>b'), entry('a) <i>b'), {})).toHaveLength(
			1,
		);
		expect(
			checkNoNewText(entry('a)<i>b'), entry('a) <i>b'), { allows: [' '] }),
		).toEqual([]);
	});
});

describe('textOf', () => {
	it('includes content.morphology', () => {
		const withMorphology: SourceEntry = {
			content: { morphology: 'm.', senses: [] },
			headword: 'x',
			rid: 'A00001',
		};
		expect(textOf(withMorphology)).toContain('m.');
	});

	it('includes sense.number', () => {
		const withNumber: SourceEntry = {
			content: { senses: [{ definition: 'a', number: '1)' }] },
			headword: 'x',
			rid: 'A00001',
		};
		expect(textOf(withNumber)).toContain('1)');
	});

	it('walks nested senses', () => {
		const nested: SourceEntry = {
			content: {
				senses: [
					{
						definition: 'top',
						number: '1)',
						senses: [{ definition: 'nested', number: 'a)' }],
					},
				],
			},
			headword: 'x',
			rid: 'A00001',
		};
		const text = textOf(nested);
		expect(text).toContain('top');
		expect(text).toContain('nested');
		expect(text).toContain('a)');
	});

	it('gates a rule that edits a nested sense, not just the top level', () => {
		const before: SourceEntry = {
			content: {
				senses: [
					{
						definition: 'top',
						number: '1)',
						senses: [{ definition: 'nested', number: 'a)' }],
					},
				],
			},
			headword: 'x',
			rid: 'A00001',
		};
		const after: SourceEntry = {
			content: {
				senses: [
					{
						definition: 'top',
						number: '1)',
						senses: [{ definition: 'nestedZ', number: 'a)' }],
					},
				],
			},
			headword: 'x',
			rid: 'A00001',
		};
		expect(checkNoNewText(before, after, {})).toHaveLength(1);
	});
});
