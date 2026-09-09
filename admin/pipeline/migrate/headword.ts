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

interface Decomposed {
	form: FormObject;
	parsed: boolean;
}

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

function intToSup(n: number): string {
	return [...String(n)].map((d) => SUP_DIGITS[Number(d)] ?? '').join('');
}

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

/** Why a decomposed form belongs on the review list, or `undefined`. */
function reviewReason(decomposed: Decomposed): string | undefined {
	if (!decomposed.parsed) {
		return 'grammar did not parse';
	}
	return LEXICAL.test(decomposed.form.text)
		? undefined
		: 'text carries characters outside the lexical set';
}

export type { Decomposed };
export { decomposeForm, regenerateForm, reviewReason };
