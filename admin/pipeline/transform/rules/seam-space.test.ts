import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { checkNoNewText } from '../no-new-text.ts';
import {
	anchorItalicSpace,
	gereshAbbrevSpace,
	italicParenSpace,
	parenTagSpace,
	translitItalicSpace,
} from './seam-space.ts';

function entryWith(definition: string): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword: 'x',
		rid: 'A00001',
	} as SourceEntry;
}

const defOf = (e: SourceEntry): string => e.content.senses[0]?.definition ?? '';

describe('seam-space rules', () => {
	it('anchorItalicSpace opens the </a><i> seam', () => {
		const out = anchorItalicSpace.apply(
			entryWith('<a href="/x">preced.</a><i>Pi.</i>'),
		);
		expect(defOf(out.entry)).toBe('<a href="/x">preced.</a> <i>Pi.</i>');
	});

	it('parenTagSpace opens both )<i> and )</a><i>', () => {
		expect(defOf(parenTagSpace.apply(entryWith('(a)<i>b</i>')).entry)).toBe(
			'(a) <i>b</i>',
		);
		expect(
			defOf(
				parenTagSpace.apply(entryWith('<a href="/x">(a)</a><i>b</i>')).entry,
			),
		).toBe('<a href="/x">(a)</a> <i>b</i>');
	});

	it('italicParenSpace opens the </i>( seam', () => {
		expect(defOf(italicParenSpace.apply(entryWith('<i>a</i>(b)')).entry)).toBe(
			'<i>a</i> (b)',
		);
	});

	it('translitItalicSpace opens Arab.<i>', () => {
		expect(
			defOf(translitItalicSpace.apply(entryWith('Arab.<i>ġaḥama</i>')).entry),
		).toBe('Arab. <i>ġaḥama</i>');
	});

	// Deviates from the task-3 brief's literal fixture ('נ׳היא' bare,
	// no wrapper): the row scopes to Hebrew QUOTATION text, which
	// `gereshAbbrevSpace` reads as "inside a dir=\"rtl\" span"
	// (task-3-report.md measures why — the one naive-pattern hit this
	// excludes, P01521, sits in `alt_headwords`, a plain-text field
	// that never carries markup, not in quotation text at all). A bare
	// string has no rtl ancestor by construction, so the un-wrapped
	// fixture cannot exercise the scoped rule and is wrapped here to
	// actually test it.
	it('gereshAbbrevSpace opens נ׳היא inside Hebrew quotation text', () => {
		expect(
			defOf(
				gereshAbbrevSpace.apply(entryWith('<span dir="rtl">נ׳היא</span>'))
					.entry,
			),
		).toBe('<span dir="rtl">נ׳ היא</span>');
	});
});

// Fix round 1: pins the three narrowings that carry this whole task.
// Without these, deleting `(?<!\))` from `ANCHOR_SEAM`, deleting the
// `looksTransliterated` guard, or dropping the `!token.rtl` check all
// leave every existing test green while silently re-admitting a
// population this module deliberately declines (see the module doc's
// "Two owners, one seam", the translit narrowing, and the geresh
// `dir="rtl"` scoping). Each pin uses the repo's identity-return idiom
// (`italic-period.test.ts`, `gershayim.test.ts`, `misc-links.test.ts`):
// a rule that declines a case must hand back the caller's own object.
describe('the three narrowings decline their boundary cases', () => {
	it('anchorItalicSpace declines a paren-adjacent </a><i> seam', () => {
		const entry = entryWith('<a href="/x">(a)</a><i>b</i>');
		expect(anchorItalicSpace.apply(entry).entry).toBe(entry);
	});

	it('translitItalicSpace declines an ordinary gloss italic', () => {
		const entry = entryWith('or<i> town</i>');
		expect(translitItalicSpace.apply(entry).entry).toBe(entry);
	});

	it('gereshAbbrevSpace declines a geresh outside dir="rtl" text', () => {
		const entry = entryWith('נ׳היא');
		expect(gereshAbbrevSpace.apply(entry).entry).toBe(entry);
	});
});

describe('the space budget is exact, not blanket', () => {
	it('no rule sets allows', () => {
		for (const rule of [
			anchorItalicSpace,
			gereshAbbrevSpace,
			italicParenSpace,
			parenTagSpace,
			translitItalicSpace,
		]) {
			expect(rule.allows).toBeUndefined();
		}
	});

	it('two insertions declare two copies', () => {
		const out = anchorItalicSpace.apply(
			entryWith('<a href="/x">a</a><i>b</i> and <a href="/y">c</a><i>d</i>'),
		);
		expect(out.copied).toEqual([' ', ' ']);
	});

	it('the gate rejects an under-declared insertion', () => {
		const before = entryWith(
			'<a href="/x">a</a><i>b</i> <a href="/y">c</a><i>d</i>',
		);
		const after = anchorItalicSpace.apply(before);
		const problems = checkNoNewText(before, after.entry, anchorItalicSpace, [
			' ',
		]);
		expect(problems.length).toBeGreaterThan(0);
	});
});
