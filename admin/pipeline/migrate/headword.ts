/**
 * Headword decomposition (migrate spec §2.1). One grammar over the
 * marked string Sefaria stores — `*?text( ROMAN)?( SUPERSCRIPT)?` —
 * into the form object of spec §2.2, with the byte-exact regeneration
 * that gate 2 demands built into the parse: a string whose regenerated
 * form does not equal the input is NOT decomposed. It keeps the whole
 * string as `text`, round-trips trivially, and is reported for review.
 */
import type { FormObject } from './types.ts';

// `text` is restricted to Hebrew letters/points (the LEXICAL range,
// escapes only — see below) plus a bare space, never `.+?`. A bare
// `.+?` lets the lazy quantifier's backtracking cross a comma or `=`
// and stop at whichever trailing roman numeral it meets first — e.g.
// 'אוּרְיָה  I, II' (a two-homograph list) would parse as text
// 'אוּרְיָה  I,' with homograph II, silently dropping the 'I'. Comma
// and `=` are outside this class, so a marked string that needs one
// to separate its parts fails the match entirely and falls back to
// the whole-string/unparsed branch below, where it belongs.
// The combining dot above (U+0307) is split into its own
// alternative — biome's noMisleadingCharacterClass rejects a mark
// escape sitting next to a base-character escape in one class as
// ambiguous, so the class becomes an alternation of the base range
// and the lone mark.
const FORM =
	/^(?<star>\*)?(?<text>(?:[\u05D0-\u05EA\u0591-\u05C7\u05F3\u05F4\u0020]|\u0307)+?)(?: (?<roman>[IVXLC]+))?(?: (?<sup>[⁰¹²³⁴⁵⁶⁷⁸⁹]+))?$/u;
const SUP_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const ROMAN: ReadonlyArray<readonly [number, string]> = [
	[100, 'C'],
	[90, 'XC'],
	[50, 'L'],
	[40, 'XL'],
	[10, 'X'],
	[9, 'IX'],
	[5, 'V'],
	[4, 'IV'],
	[1, 'I'],
];
/** Hebrew letters, points and accents, geresh/gershayim, maqaf, the
 * combining dot above (U+0307). Anything else in `text` — a space, a
 * Latin letter, a digit, `=` — is worth an eye. */
// Escapes, never pasted literals: a combining mark typed into a class
// attaches to its neighbour and the range silently widens (html.ts).
// U+05D0–U+05EA letters · U+0591–U+05C7 points, accents and Hebrew
// punctuation — U+05BE maqaf sits inside that range, so naming it
// again would be a duplicate · U+05F3/F4 geresh and gershayim ·
// U+0307 combining dot above.
const LEXICAL = /^(?:[\u05D0-\u05EA\u0591-\u05C7\u05F3\u05F4]|\u0307)+$/u;
/** `LEXICAL` plus the bare space `FORM` admits. A parsed `text` that
 * matches this and holds a space is a MULTI-WORD form \u2014 one expression
 * written as several words \u2014 and nothing else is out of the set. */
const LEXICAL_WITH_SPACE =
	/^(?:[\u05D0-\u05EA\u0591-\u05C7\u05F3\u05F4 ]|\u0307)+$/u;
/** A doubled space between two words. `decomposeForm` only refuses a
 * LEADING or trailing one (`text.trim() !== text`), so this is what
 * separates a word gap from H1's separator defect \u2014 `headword-issues.ts`
 * files the same shape under `double-space` and calls it wrong. */
const DOUBLE_SPACE = '  ';

interface Decomposed {
	form: FormObject;
	parsed: boolean;
}

/** Which review row a flagged form becomes.
 *
 * - `headword-unparsed` \u2014 the grammar could not account for the string,
 *   or `text` carries something the lexical set has no reading for.
 * - `headword-multiword` \u2014 `text` is lexical apart from a space it uses
 *   to separate words. A legitimate form, not a defect
 *   (`docs/v2/headword-design.md` \u00A74: reduplication, spaced variants,
 *   phrase headwords and phrase alternates), listed so the count stays
 *   visible.
 */
type HeadwordReviewKind = 'headword-multiword' | 'headword-unparsed';

/** Every headword review kind, as a lookup. A `Record` over the union
 * rather than an array, so adding a kind is a TYPE ERROR here instead
 * of a silent omission from `renderBlessing`'s headword list and
 * `headword-issues.ts`'s flagged column — both of which used to name
 * the kinds by hand, where the compiler could not see them. */
const HEADWORD_REVIEW_KINDS: Readonly<Record<HeadwordReviewKind, true>> = {
	'headword-multiword': true,
	'headword-unparsed': true,
};

/** Whether a report row's kind is one this detector mints. */
function isHeadwordReviewKind(kind: string): boolean {
	return Object.hasOwn(HEADWORD_REVIEW_KINDS, kind);
}

/** Why a form is on the headword review list, and under which kind. */
interface HeadwordReview {
	kind: HeadwordReviewKind;
	reason: string;
}

/** A homograph number as the roman numeral Jastrow prints. */
function intToRoman(n: number): string {
	let rest = n;
	let out = '';
	for (const [value, glyph] of ROMAN) {
		while (rest >= value) {
			out += glyph;
			rest -= value;
		}
	}
	return out;
}

/** A roman numeral back to its number, or NaN when the string is not
 * one this table can consume whole — the caller treats NaN as "this
 * did not parse" rather than guessing at a partial reading. */
function romanToInt(s: string): number {
	let total = 0;
	let rest = s;
	for (const [value, glyph] of ROMAN) {
		while (rest.startsWith(glyph)) {
			total += value;
			rest = rest.slice(glyph.length);
		}
	}
	return rest === '' ? total : Number.NaN;
}

/** A disambiguator as superscript digits. */
function intToSup(n: number): string {
	return [...String(n)].map((d) => SUP_DIGITS[Number(d)] ?? '').join('');
}

/** Superscript digits back to a number, or NaN on any character that
 * is not one — see `romanToInt` for why a partial read is refused. */
function supToInt(s: string): number {
	let out = '';
	for (const ch of s) {
		const digit = SUP_DIGITS.indexOf(ch);
		if (digit < 0) {
			return Number.NaN;
		}
		out += String(digit);
	}
	return Number(out);
}

/** The marked display string a form object stands for. */
function regenerateForm(form: FormObject): string {
	let out = form.reconstructed ? `*${form.text}` : form.text;
	if (form.homograph !== undefined) {
		out += ` ${intToRoman(form.homograph)}`;
	}
	if (form.disambiguator !== undefined) {
		out += ` ${intToSup(form.disambiguator)}`;
	}
	return out;
}

/** Decompose a marked headword string. Never throws: what the grammar
 * cannot reproduce byte-for-byte is kept whole as `text`. */
function decomposeForm(marked: string): Decomposed {
	const unparsed: Decomposed = { form: { text: marked }, parsed: false };
	const groups = FORM.exec(marked)?.groups;
	if (groups === undefined) {
		return unparsed;
	}
	const text = groups['text'];
	// Two guards rather than one `||`: collapsed, the pair reads as an
	// optional chain (`text?.trim() !== text`) that is FALSE when `text`
	// is undefined — the opposite of what this guard owes its caller.
	if (text === undefined) {
		return unparsed;
	}
	if (text.trim() !== text) {
		return unparsed;
	}
	const form: FormObject = { text };
	if (groups['star'] !== undefined) {
		form.reconstructed = true;
	}
	const roman = groups['roman'];
	if (roman !== undefined) {
		form.homograph = romanToInt(roman);
	}
	const sup = groups['sup'];
	if (sup !== undefined) {
		form.disambiguator = supToInt(sup);
	}
	const numeric = [form.homograph, form.disambiguator].every(
		(n) => n === undefined || (Number.isInteger(n) && n >= 1),
	);
	if (numeric && regenerateForm(form) === marked) {
		return { form, parsed: true };
	}
	return unparsed;
}

/** Why a decomposed form belongs on the review list, or `undefined`.
 *
 * The space is split out from the rest of the non-lexical set rather
 * than lumped with it. `FORM` admits U+0020 and `LEXICAL` does not, so
 * every multi-word headword parses and is then flagged for its space
 * alone — 271 of the 300 rows the report called `headword-unparsed` on
 * 2026-09-20, each one a form headword-design §4 rules legitimate. The
 * last branch stays for a `text` that is neither: it cannot arise
 * while `FORM`'s class is `LEXICAL` + space, and it is the branch that
 * has to be right the moment that class widens.
 *
 * A DOUBLED space is not a word gap. `decomposeForm` refuses only a
 * leading or trailing one, so `אב  גד` would otherwise parse, match
 * the multi-word test and be demoted to a note — while §4 rules a
 * doubled space an H1 separator defect and `headword-issues.ts` files
 * it as `double-space`. It stays `headword-unparsed`. */
function reviewReason(decomposed: Decomposed): HeadwordReview | undefined {
	if (!decomposed.parsed) {
		return { kind: 'headword-unparsed', reason: 'grammar did not parse' };
	}
	const { text } = decomposed.form;
	if (LEXICAL.test(text)) {
		return;
	}
	if (text.includes(DOUBLE_SPACE)) {
		return {
			kind: 'headword-unparsed',
			reason: 'text carries a doubled space between words',
		};
	}
	if (LEXICAL_WITH_SPACE.test(text) && text.includes(' ')) {
		return {
			kind: 'headword-multiword',
			reason: 'multi-word form; the space is its only non-lexical character',
		};
	}
	return {
		kind: 'headword-unparsed',
		reason: 'text carries characters outside the lexical set',
	};
}

export type { Decomposed, HeadwordReview, HeadwordReviewKind };
export { decomposeForm, isHeadwordReviewKind, regenerateForm, reviewReason };
