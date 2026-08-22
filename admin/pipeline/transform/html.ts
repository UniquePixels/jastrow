/**
 * Minimal HTML token stream for the Phase 2 transforms
 * (docs/specs/2026-08-22-transform-module-design.md §3).
 *
 * Definitions are flat, hand-authored markup — spans, anchors, italics,
 * superscripts. A tokenizer is the right tool rather than a regex
 * because rules need `dir="rtl"` ANCESTRY, and rather than a library
 * because this repository carries zero runtime dependencies.
 *
 * The contract every rule relies on: `serialize(tokenize(s)) === s`.
 */

// Hoisted per lint/performance/useTopLevelRegex.
const TAG = /<\/?[a-zA-Z][^>]*>/gu;
const TAG_NAME = /^<\/?(?<name>[a-zA-Z][a-zA-Z0-9]*)/u;
const DIR_RTL = /\bdir\s*=\s*(?<q>["']?)rtl\k<q>/u;

/**
 * Hebrew, built from explicit ranges — NEVER a pasted literal class.
 * A literal `יִ` decomposes to yod + hiriq, and a pasted range built
 * from one silently becomes U+05B4–U+FB4F, which swallows em-dashes,
 * superscript letters and curly quotes (catalogue audit,
 * data/patches/catalogue-audit/bare-rtl-hebrew.md).
 *
 * U+0591–U+05C7 points and accents · U+05D0–U+05EA letters (final
 * forms included) · U+05F3–U+05F4 geresh and gershayim ·
 * U+FB1D–U+FB4F presentation forms.
 */
const HEBREW = '\\u0591-\\u05C7\\u05D0-\\u05EA\\u05F3-\\u05F4\\uFB1D-\\uFB4F';
const HEBREW_RUN = new RegExp(`[${HEBREW}]+(?:[ \\u00A0][${HEBREW}]+)*`, 'gu');

interface TextToken {
	kind: 'text';
	/** An ancestor element carries dir="rtl". */
	rtl: boolean;
	value: string;
}

interface TagToken {
	close: boolean;
	kind: 'tag';
	name: string;
	/** An ancestor element carries dir="rtl" (the tag's own dir does
	 * not count — an opening rtl span is itself `false`). */
	rtl: boolean;
	value: string;
}

type Token = TagToken | TextToken;

/** Split markup into text and tag tokens, resolving `dir="rtl"`
 * ancestry with a tag stack. Unbalanced markup does not throw: a stray
 * close pops nothing, which keeps a damaged entry tokenizable — the
 * damage is what the rules are here to find. */
function tokenize(html: string): Token[] {
	const tokens: Token[] = [];
	const stack: boolean[] = [];
	let at = 0;
	TAG.lastIndex = 0;
	let match = TAG.exec(html);
	const depth = (): boolean => stack.some(Boolean);
	while (match !== null) {
		if (match.index > at) {
			tokens.push({
				kind: 'text',
				rtl: depth(),
				value: html.slice(at, match.index),
			});
		}
		const [value] = match;
		const close = value.startsWith('</');
		const name = (TAG_NAME.exec(value)?.groups?.['name'] ?? '').toLowerCase();
		tokens.push({ close, kind: 'tag', name, rtl: depth(), value });
		if (close) {
			stack.pop();
		} else if (!value.endsWith('/>')) {
			stack.push(DIR_RTL.test(value));
		}
		at = match.index + value.length;
		match = TAG.exec(html);
	}
	if (at < html.length) {
		tokens.push({ kind: 'text', rtl: depth(), value: html.slice(at) });
	}
	return tokens;
}

/** Inverse of `tokenize`. Byte-exact on unmodified streams. */
function serialize(tokens: readonly Token[]): string {
	return tokens.map((token) => token.value).join('');
}

/** Maximal Hebrew runs within one text value, as [start, end) offsets.
 * Interior single spaces between Hebrew tokens stay inside the run;
 * 4,691 of 5,679 bare nodes mix Hebrew and Latin, so a rule must wrap
 * the RUN, never the node. */
function hebrewRuns(value: string): { end: number; start: number }[] {
	const runs: { end: number; start: number }[] = [];
	HEBREW_RUN.lastIndex = 0;
	let match = HEBREW_RUN.exec(value);
	while (match !== null) {
		runs.push({ end: match.index + match[0].length, start: match.index });
		match = HEBREW_RUN.exec(value);
	}
	return runs;
}

export type { TagToken, TextToken, Token };
export { HEBREW, hebrewRuns, serialize, tokenize };
