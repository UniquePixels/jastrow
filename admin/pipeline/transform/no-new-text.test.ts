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

describe('textOf — fields beyond content (spec §5)', () => {
	it('includes headword', () => {
		const e: SourceEntry = {
			content: { senses: [] },
			headword: 'ariba',
			rid: 'A00001',
		};
		expect(textOf(e)).toContain('ariba');
	});

	it('includes alt_headwords', () => {
		const e: SourceEntry = {
			alt_headwords: ['foo', 'bar'],
			content: { senses: [] },
			headword: 'x',
			rid: 'A00001',
		};
		const text = textOf(e);
		expect(text).toContain('foo');
		expect(text).toContain('bar');
	});

	it('includes plural_form', () => {
		const e: SourceEntry = {
			content: { senses: [] },
			headword: 'x',
			plural_form: ['xs'],
			rid: 'A00001',
		};
		expect(textOf(e)).toContain('xs');
	});

	it('includes language_reference, tags stripped', () => {
		const e: SourceEntry = {
			content: { senses: [] },
			headword: 'x',
			language_reference: 'cmp. <a dir="rtl">em</a>',
			rid: 'A00001',
		};
		const text = textOf(e);
		expect(text).toContain('cmp. ');
		expect(text).toContain('em');
		expect(text).not.toContain('<a');
	});

	it('includes quotes, skipping nulls, tags stripped', () => {
		const e: SourceEntry = {
			content: { senses: [] },
			headword: 'x',
			quotes: [[null, 'dleit assa', '<i>incurable</i>']],
			rid: 'A00001',
		};
		const text = textOf(e);
		expect(text).toContain('dleit assa');
		expect(text).toContain('incurable');
		expect(text).not.toContain('<i>');
	});

	it('excludes refs (body model §5, B7 — machine identifiers, not text)', () => {
		const withRefs: SourceEntry = {
			content: { senses: [] },
			headword: 'x',
			refs: ['Jastrow, foo 1'],
			rid: 'A00001',
		};
		const withoutRefs: SourceEntry = {
			content: { senses: [] },
			headword: 'x',
			rid: 'A00001',
		};
		expect(textOf(withRefs)).toBe(textOf(withoutRefs));
	});

	it('includes language_code, tags stripped (round-2 fix)', () => {
		const e: SourceEntry = {
			content: { senses: [] },
			headword: 'x',
			language_code: 'ch. = <a dir="rtl">em</a>',
			rid: 'A00001',
		};
		const text = textOf(e);
		expect(text).toContain('ch. = ');
		expect(text).toContain('em');
		expect(text).not.toContain('<a');
	});

	it('includes sense.grammar.binyan_form, each string tag-stripped (round-2 fix)', () => {
		const e: SourceEntry = {
			content: {
				senses: [
					{
						definition: 'a',
						grammar: { binyan_form: ['אוֹבֵיד', 'second'] },
					},
				],
			},
			headword: 'x',
			rid: 'A00001',
		};
		const text = textOf(e);
		expect(text).toContain('אוֹבֵיד');
		expect(text).toContain('second');
	});

	it('includes sense.grammar.verbal_stem (round-2 fix)', () => {
		const e: SourceEntry = {
			content: {
				senses: [{ definition: 'a', grammar: { verbal_stem: 'Pi.' } }],
			},
			headword: 'x',
			rid: 'A00001',
		};
		expect(textOf(e)).toContain('Pi.');
	});

	it('walks grammar fields inside nested senses too', () => {
		const e: SourceEntry = {
			content: {
				senses: [
					{
						definition: 'top',
						senses: [
							{
								definition: 'nested',
								grammar: { verbal_stem: 'Nested-stem' },
							},
						],
					},
				],
			},
			headword: 'x',
			rid: 'A00001',
		};
		expect(textOf(e)).toContain('Nested-stem');
	});
});

describe('checkNoNewText — the gate sees every text field (spec §5)', () => {
	it('rejects a rule that edits alt_headwords exclusively', () => {
		// Before this fix, textOf only walked content — a rule touching
		// nothing but alt_headwords passed unconditionally, no matter
		// what it wrote.
		const before: SourceEntry = {
			alt_headwords: ['abc'],
			content: { senses: [] },
			headword: 'x',
			rid: 'A00001',
		};
		const after: SourceEntry = {
			alt_headwords: ['abcXYZ'],
			content: { senses: [] },
			headword: 'x',
			rid: 'A00001',
		};
		expect(checkNoNewText(before, after, {})).not.toEqual([]);
	});

	// Round 2: three fields the re-review found still vacuous, verified
	// against the reference implementation before the fix (each
	// returned [] although the rewrite fabricated text wholesale).
	// Reproduces the exact three cases the review cited.

	it('rejects a rule that rewrites grammar.binyan_form exclusively', () => {
		const before: SourceEntry = {
			content: {
				senses: [{ definition: 'a', grammar: { binyan_form: ['x'] } }],
			},
			headword: 'x',
			rid: 'A00001',
		};
		const after: SourceEntry = {
			content: {
				senses: [{ definition: 'a', grammar: { binyan_form: ['xINVENTED'] } }],
			},
			headword: 'x',
			rid: 'A00001',
		};
		expect(checkNoNewText(before, after, {})).not.toEqual([]);
	});

	it('rejects a rule that rewrites grammar.verbal_stem exclusively', () => {
		const before: SourceEntry = {
			content: {
				senses: [{ definition: 'a', grammar: { verbal_stem: 'Pi.' } }],
			},
			headword: 'x',
			rid: 'A00001',
		};
		const after: SourceEntry = {
			content: {
				senses: [{ definition: 'a', grammar: { verbal_stem: 'FABRICATED' } }],
			},
			headword: 'x',
			rid: 'A00001',
		};
		expect(checkNoNewText(before, after, {})).not.toEqual([]);
	});

	it('rejects a rule that rewrites language_code exclusively', () => {
		const before: SourceEntry = {
			content: { senses: [] },
			headword: 'x',
			language_code: '(b. h.;',
			rid: 'A00001',
		};
		const after: SourceEntry = {
			content: { senses: [] },
			headword: 'x',
			language_code: 'TOTALLY NEW TEXT',
			rid: 'A00001',
		};
		expect(checkNoNewText(before, after, {})).not.toEqual([]);
	});
});

describe('checkNoNewText — copied (spec §5.1)', () => {
	// Mirrors abbrev-in-alt-headwords: a rule recovers an elided tail
	// from the entry's own headword into alt_headwords. The tail's
	// codepoints then appear twice in the entry (once in headword,
	// once in the new alt_headword) against once in the input, so a
	// plain sub-multiset check rejects a rule that invented nothing.
	const before: SourceEntry = {
		alt_headwords: ['xyz'],
		content: { senses: [] },
		headword: 'xyzTAIL',
		rid: 'A00001',
	};
	const after: SourceEntry = {
		alt_headwords: ['xyzTAIL'],
		content: { senses: [] },
		headword: 'xyzTAIL',
		rid: 'A00001',
	};

	it('a copy present in the input is credited and passes', () => {
		expect(checkNoNewText(before, after, {}, ['TAIL'])).toEqual([]);
	});

	it('the same duplication without a declared copy is rejected', () => {
		expect(checkNoNewText(before, after, {})).not.toEqual([]);
	});

	it('a declared copy absent from the input is a violation, not an allowance', () => {
		expect(checkNoNewText(entry('a b'), entry('a b'), {}, ['nowhere'])).toEqual(
			['A00001: declared copy "nowhere" does not occur in the input'],
		);
	});

	it('declaring one copy does not permit two duplications', () => {
		// "ab" -> "abbb" needs TWO extra 'b's; declaring the copy once
		// only credits one.
		expect(checkNoNewText(entry('ab'), entry('abbb'), {}, ['b'])).not.toEqual(
			[],
		);
	});

	it('a declared copy cannot span a seam between two fields (round-2 fix)', () => {
		// headword 'ab' + alt_headwords ['cd'] never contained the
		// substring 'bc' — it only appears if the two fields are
		// concatenated directly. FIELD_SEP between textOf's parts must
		// block this from being accepted as a "copy", even though the
		// entry is otherwise unchanged (isolating the seam check from
		// any separate new-text finding).
		const unchanged: SourceEntry = {
			alt_headwords: ['cd'],
			content: { senses: [] },
			headword: 'ab',
			rid: 'A00001',
		};
		expect(checkNoNewText(unchanged, unchanged, {}, ['bc'])).toEqual([
			'A00001: declared copy "bc" does not occur in the input',
		]);
	});
});
