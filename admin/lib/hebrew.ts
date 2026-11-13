/**
 * Hebrew character classes and run-finding for markup text.
 *
 * Not HTML: these read the TEXT between tags, which `html.ts` hands
 * over. Kept apart from the tokenizer so each file holds one job.
 */

import type { Span } from './html.ts';

/**
 * Hebrew, built from explicit ranges — NEVER a pasted literal class.
 * A literal `יִ` decomposes to yod + hiriq, and a pasted range built
 * from one silently becomes U+05B4–U+FB4F, which swallows em-dashes,
 * superscript letters and curly quotes (catalogue audit,
 * docs/archive/catalogue-audit/bare-rtl-hebrew.md).
 *
 * U+0591–U+05C7 points and accents · U+05D0–U+05EA letters (final
 * forms included) · U+05F0–U+05F4 the yod-yod/vav-yod ligatures plus
 * geresh and gershayim · U+FB1D–U+FB4F presentation forms.
 */
const HEBREW: string = String.raw`\u0591-\u05C7\u05D0-\u05EA\u05F0-\u05F4\uFB1D-\uFB4F`;

/**
 * What may sit INSIDE a Hebrew run but not in `HEBREW` itself.
 *
 * U+0307 combining dot above is a combining mark on a Hebrew base
 * (1,635 corpus tokens: `מנא̇ מנא̇ תקל̇ ופר̇סין̇`). It must stay inside the
 * run — a bare dot left after a `</span>` reattaches to the wrong base.
 * It is matched only as a SUFFIX of a Hebrew base, never as a class
 * member in its own right: U+0307 also spells Jastrow's Latin
 * transliterations (`haġan` is g + U+0307), and admitting it to the
 * class opened a Hebrew run around that Latin letter's diacritic.
 *
 * ASCII `'` and `"` are geresh and gershayim typed as ASCII (2,024 and
 * 27 tokens: `אל"ף`). They are interior JOINERS only, never class
 * members, so `[HEBREW]` still rejects a bare quote per the acceptance
 * criterion. Without them a single word splits into two runs and Task
 * 5 would wrap each half in its own bidi span, reordering the word.
 *
 * A literal TAB joins Hebrew in 4 tokens and is deliberately excluded —
 * a tab inside a wrapper span is not clearly desirable.
 *
 * Exported since batch 3a: the gershayim predicate
 * (`transform/gershayim.ts`) needs "a Hebrew letter with its marks" in
 * its LOOKBEHIND, because one corpus occurrence (M01940) puts U+0307
 * between the letter and the ASCII quote and a bare `(?<=[HEBREW])`
 * misses it. Exporting the atom rather than restating it there keeps
 * that definition in one place — the two would otherwise be free to
 * drift, and the drift would be invisible: a narrower copy repairs one
 * occurrence fewer while reporting a clean run.
 */
const HEBREW_ATOM: string = String.raw`[${HEBREW}]\u0307*`;
const HEBREW_RUN = new RegExp(
	String.raw`(?:${HEBREW_ATOM})+(?:[ \u00A0'"](?:${HEBREW_ATOM})+)*`,
	'gu',
);

/** Maximal Hebrew runs within one text value, as [start, end) offsets.
 * Interior single spaces between Hebrew tokens stay inside the run;
 * 4,691 of 5,679 bare nodes mix Hebrew and Latin, so a rule must wrap
 * the RUN, never the node. */
function hebrewRuns(value: string): Span[] {
	const runs: Span[] = [];
	HEBREW_RUN.lastIndex = 0;
	let match = HEBREW_RUN.exec(value);
	while (match !== null) {
		runs.push({ end: match.index + match[0].length, start: match.index });
		match = HEBREW_RUN.exec(value);
	}
	return runs;
}

/** Every run of whitespace, which the comparison form makes one space. */
const WHITESPACE_RUN = /\s+/gu;

/** A point, an accent or a punctuation mark of the Hebrew block
 * (U+0591–U+05C7: the maqaf, paseq and sof pasuq among them), or the
 * combining dot above (U+0307, see `HEBREW_ATOM`). Read only after NFD,
 * which splits a precomposed or presentation-form letter into its base
 * and its marks. The dot is its own alternative because biome's
 * noMisleadingCharacterClass rejects a mark escape beside a base escape
 * in one class.
 *
 * Exported WITHOUT the `g` flag: a global regex carries `lastIndex`
 * between calls, so a caller's `.test()` on a shared one would answer
 * by where the last call stopped. `withoutMarks` builds its own global
 * copy. */
const HEBREW_MARK = /[\u0591-\u05C7]|\u0307/u;
const HEBREW_MARKS = new RegExp(HEBREW_MARK.source, 'gu');

/** Anything but one of the 22 letters, final forms included. */
const NOT_LETTER = /[^\u05D0-\u05EA]/gu;

/** One superscript digit, the glyph of Sefaria's superscript number.
 * Print sets none, and no field holds one (ruling `11-13 url words`).
 * Listed by code point: three of them (¹ ² ³) sit in Latin-1, the
 * rest at U+2070. Exported without the `g` flag (see `HEBREW_MARK`). */
const SUPERSCRIPT_DIGIT = /[\u00B2\u00B3\u00B9\u2070\u2074-\u2079]/u;

/** The form two strings are compared in, to decide whether they are
 * the same word (ruling `11-07 one comparison rule`): NFC, every run of
 * whitespace one space, trimmed. NFC because Hebrew marks can be stored
 * in more than one order and still read alike; whitespace because a
 * reader cannot see a doubled or edge space either (B00098's source
 * headword `בַּד  V` has two).
 *
 * For comparison only: nothing stored is rewritten by it. Every
 * comparison of one word against another goes through it, and a
 * function that builds a URL word starts from this form
 * (`toUrlWord`). Whether two spellings share their consonants is
 * a different question: `withoutMarks` and `lettersOnly` below. */
function toComparisonForm(text: string): string {
	return text.normalize('NFC').replaceAll(WHITESPACE_RUN, ' ').trim();
}

/** The text with every Hebrew mark removed (see `HEBREW_MARK`), and everything
 * else kept: letters, spaces, geresh and gershayim, the `*`. Two
 * spellings of one word that differ only in pointing come out alike,
 * word by word. Returned in NFD. */
function withoutMarks(text: string): string {
	return text.normalize('NFD').replaceAll(HEBREW_MARKS, '');
}

/** The text's Hebrew letters alone: no marks, no spaces, no punctuation
 * or numerals. Coarser than `withoutMarks`: `אב בית` and `אבבית` come
 * out alike. */
function lettersOnly(text: string): string {
	return text.normalize('NFD').replaceAll(NOT_LETTER, '');
}

export {
	HEBREW,
	HEBREW_ATOM,
	HEBREW_MARK,
	hebrewRuns,
	lettersOnly,
	SUPERSCRIPT_DIGIT,
	toComparisonForm,
	withoutMarks,
};
