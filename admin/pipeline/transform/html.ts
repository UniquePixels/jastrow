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
const TAG_NAME = /^<\/?(?<name>[a-zA-Z][a-zA-Z0-9]*)/u;
/** `dir="rtl"` on a tag's own attributes. Quotes optional and either
 * flavour. Exported because every rule that moves an rtl wrapper needs
 * the same predicate, and a second copy would be free to drift from
 * the one the tokenizer resolves ancestry with. */
const DIR_RTL = /\bdir\s*=\s*(?<q>["']?)rtl\k<q>/u;

/**
 * Hebrew, built from explicit ranges — NEVER a pasted literal class.
 * A literal `יִ` decomposes to yod + hiriq, and a pasted range built
 * from one silently becomes U+05B4–U+FB4F, which swallows em-dashes,
 * superscript letters and curly quotes (catalogue audit,
 * data/patches/catalogue-audit/bare-rtl-hebrew.md).
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
	/** An ancestor element carries dir="rtl". The tag's own dir does not
	 * count, so an opening `<span dir="rtl">` is itself `false`. A
	 * CLOSING tag reports the ancestry in effect immediately before it
	 * closes, so the `</span>` of an rtl span is `true` — the pair is
	 * deliberately asymmetric. */
	rtl: boolean;
	value: string;
}

type Token = TagToken | TextToken;

/** Whether an opening tag opens a scope on the stack. Self-closing
 * forms do not. Neither does a visibly malformed tag — a `<` inside the
 * tag body means a swallowed closing tag supplied this tag's `>`, so the
 * element never closes and its `dir` would leak to end of input.
 *
 * Exported because a rule needs the same predicate — but the two arms
 * differ and must be read apart. After the MALFORMED arm, what follows
 * is not document text at all: it is the tail of that tag's own
 * attributes, and must not be rewritten. That tail is a REGION, not
 * one token — `attributeInterior` below is the single authority on
 * where it ends, and both the rule and the gate that backstops it read
 * it from there. After the SELF-CLOSING arm the following text IS
 * ordinary document text, so a caller wanting only the malformed
 * reading must exclude `endsWith('/>')` itself. Keeping one definition
 * here means the tokenizer stays the single authority on what counts
 * as a malformed open tag. */
function opensScope(value: string): boolean {
	return !(value.endsWith('/>') || value.slice(1).includes('<'));
}

/** An extent within one field, as [start, end) offsets — a tag for
 * `tagSpans`, a Hebrew run for `hebrewRuns`. */
interface Span {
	end: number;
	start: number;
}

const LT = 0x3c;
const GT = 0x3e;
const SLASH = 0x2f;
const EQUALS = 0x3d;
const DQUOTE = 0x22;
const SQUOTE = 0x27;

function isAsciiLetter(code: number): boolean {
	return (code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a);
}

function isTagWhitespace(code: number): boolean {
	return code === 0x20 || code === 0x09 || code === 0x0a || code === 0x0d;
}

/** Where an ASCII letter starts a tag NAME after the `<` at `at` —
 * that is, the offset of the letter, or -1 when `<` is not a tag. */
function tagNameStart(html: string, at: number): number {
	const after = html.charCodeAt(at + 1) === SLASH ? at + 2 : at + 1;
	return isAsciiLetter(html.charCodeAt(after)) ? after : -1;
}

/**
 * The offset just past the attribute value beginning at `from` (the
 * byte after an `=`), following the HTML tokenizer: optional
 * whitespace, then either `"` or `'` opens a QUOTED value that runs to
 * its matching quote, a `>` inside it being literal — or anything else
 * begins an UNQUOTED value that runs to the next whitespace or `>`,
 * with `=` and quote characters inside it literal. The unquoted arm
 * matters even though 0 corpus values are unquoted: without it a
 * `x=foo="b>c"` re-opened a quoted scan at the inner `="` and pulled
 * the document text after the real `>` into the tag.
 *
 * Returns -1 when a quoted value is DAMAGED, and the caller then falls
 * back to the legacy scan for the whole tag. Two shapes are damage:
 *
 * - A `</` inside the value. That is the corpus's one real attribute
 *   defect — an unterminated `href` swallowing its own `</a>` (D00478,
 *   J00597) — and it must keep the reading every gate was measured
 *   against. Only `</`, not a bare `<`: a bare `<` in a closed value is
 *   not that defect, and treating it as one would send the tag back to
 *   its first `>` and re-open the gap on the NEXT value.
 * - A closing quote that is not followed by whitespace, `/`, `>` or
 *   the end of input — the only places a browser accepts one. A tag
 *   that has LOST a quote (`dir="rtl>אל"ף`) would otherwise borrow the
 *   next quote from document text and swallow a Hebrew run into the
 *   tag token, unseen by every text rule; and the 2,305 ASCII
 *   gershayim in this corpus are exactly that supply of quotes. A
 *   browser does swallow it. This scanner, like `attributeInterior`,
 *   prefers to freeze damage where it is rather than spread it.
 */
function valueEnd(html: string, from: number): number {
	let at = from;
	while (isTagWhitespace(html.charCodeAt(at))) {
		at++;
	}
	const quote = html.charCodeAt(at);
	if (quote !== DQUOTE && quote !== SQUOTE) {
		while (at < html.length) {
			const code = html.charCodeAt(at);
			if (code === GT || isTagWhitespace(code)) {
				break;
			}
			at++;
		}
		return at;
	}
	for (let i = at + 1; i < html.length; i++) {
		const code = html.charCodeAt(i);
		if (code === quote) {
			return closesValue(html.charCodeAt(i + 1)) ? i + 1 : -1;
		}
		if (code === LT && html.charCodeAt(i + 1) === SLASH) {
			return -1;
		}
	}
	return -1;
}

/** Whether the byte after a closing quote is one a browser accepts
 * there. `NaN` (end of input) passes: the tag then has no `>` and
 * `tagEnd` reports no tag at all. */
function closesValue(code: number): boolean {
	return (
		Number.isNaN(code) || code === GT || code === SLASH || isTagWhitespace(code)
	);
}

/** The legacy reading — `<[^>]*>` — for a damaged tag body. */
function legacyTagEnd(html: string, at: number): number {
	const gt = html.indexOf('>', at);
	return gt === -1 ? -1 : gt + 1;
}

/**
 * The offset just past the tag opened by the `<` at `at`, or -1 when
 * that `<` opens no tag (no ASCII letter after it, or no `>` after it
 * at all — the `<` is then document text, as it was to `<[^>]*>`).
 *
 * Quote-aware where the old regex was not: a `>` inside a quoted
 * attribute value does not end the tag. `[^>]*` stopped at it and
 * exposed the rest of the attribute as document TEXT, which any
 * text-repair rule could then edit. 0 corpus tags carry such a `>`
 * today; the reading is for the re-fetch that might. A quote is a
 * delimiter only after an attribute's `=`, as in a browser: a `=`
 * inside the tag name or one preceded by whitespace begins a NAME
 * there, so a stray quote after either cannot open a value.
 *
 * Every other shape reads exactly as `<[^>]*>` read it, by
 * construction: a damaged value (see `valueEnd` for the two shapes)
 * sends the whole tag to `legacyTagEnd`, and an unquoted value ends at
 * whitespace or `>` as it does to a browser. The corpus tier measures
 * that equivalence over all 637,648 tags.
 */
function tagEnd(html: string, at: number): number {
	let i = tagNameStart(html, at);
	if (i === -1) {
		return -1;
	}
	// The tag name runs to whitespace, `/` or `>`; a `=` inside it is a
	// name byte, so the attribute loop starts after it.
	while (i < html.length) {
		const code = html.charCodeAt(i);
		if (code === GT) {
			return i + 1;
		}
		if (code === SLASH || isTagWhitespace(code)) {
			break;
		}
		i++;
	}
	for (; i < html.length; i++) {
		const code = html.charCodeAt(i);
		if (code === GT) {
			return i + 1;
		}
		if (code === EQUALS && !isTagWhitespace(html.charCodeAt(i - 1))) {
			const past = valueEnd(html, i + 1);
			if (past === -1) {
				return legacyTagEnd(html, at);
			}
			// `past - 1` so the loop's own increment lands on `past`.
			i = past - 1;
		}
	}
	return -1;
}

/**
 * Every tag in `html` as a [start, end) span, in document order — the
 * definition of "where a tag is" that `tokenize` and every rule that
 * masks tags by FUNCTION share (`gershayim.ts` and
 * `rules/geresh-apostrophe.ts` each once carried a `<[^<>]*>` of their
 * own, free to drift; the drift is what let a `>` in an attribute
 * value hand attribute bytes to a text repair). Prefer `mapTagsAndText`
 * below over walking these spans by hand.
 *
 * Not yet shared: six rules keep a `<[^>]*>` ATOM inside a larger
 * regex, where a function cannot be called — `abbrev-vocab.ts`,
 * `rules/duplication.ts`, `impossible-dagesh.ts`, `italic-period.ts`,
 * `section-break.ts`, `see-particle.ts`. They agree with this scanner
 * on every one of today's 637,648 tags and disagree only on a `>` in
 * a quoted value, which the corpus does not hold; each would need its
 * pattern rewritten around a pre-masked field to close that.
 *
 * Spans never overlap and never nest; the text between consecutive
 * spans is document text.
 */
function tagSpans(html: string): Span[] {
	const spans: Span[] = [];
	let from = 0;
	let start = html.indexOf('<', from);
	while (start !== -1) {
		const end = tagEnd(html, start);
		if (end === -1) {
			from = start + 1;
		} else {
			spans.push({ end, start });
			from = end;
		}
		start = html.indexOf('<', from);
	}
	return spans;
}

/**
 * `html` with every tag passed through `onTag` and every run of
 * document text between tags through `onText`, concatenated back in
 * order. Offsets are preserved whenever both callbacks are
 * length-preserving, which is how a rule builds a mask it can splice
 * against the original.
 *
 * This is the one walk over `tagSpans` the rules use: `gershayim.ts`
 * for both of its loci and `rules/geresh-apostrophe.ts` for its mask.
 * Three hand-rolled copies of the same eight lines drifted once on
 * their tag reading; the tail flush and the `at` bookkeeping are the
 * next places they would.
 */
function mapTagsAndText(
	html: string,
	onText: (text: string) => string,
	onTag: (tag: string) => string,
): string {
	let out = '';
	let at = 0;
	for (const span of tagSpans(html)) {
		out +=
			onText(html.slice(at, span.start)) +
			onTag(html.slice(span.start, span.end));
		at = span.end;
	}
	return out + onText(html.slice(at));
}

/** Split markup into text and tag tokens, resolving `dir="rtl"`
 * ancestry with a tag stack. Unbalanced markup does not throw, which
 * keeps a damaged entry tokenizable — the damage is what the rules are
 * here to find. Two consequences of that tolerance are load-bearing:
 *
 * - A close pops the TOP of the stack whatever element it belongs to;
 *   it is not matched by name. On an empty stack it pops nothing (0
 *   corpus cases).
 * - A visibly malformed open tag — one whose body contains another `<`,
 *   because a swallowed `</a>` inside an unterminated attribute value
 *   supplied its `>` — is NOT pushed. Pushing it would leak its
 *   `dir="rtl"` over every later token, since nothing ever pops it.
 *   That mislabelled 58 tokens across D00478 and J00597 — 29 of them
 *   TEXT tokens (D00478 1, J00597 28), the rest tags — and would have
 *   fed correct markup to the `latin-token-inside-rtl-span` rule.
 *   The damage stays fully visible in the tag token's raw `value`, so
 *   the catalogue row `unterminated-href-swallows-closing-tag` remains
 *   findable. */
function tokenize(html: string): Token[] {
	const tokens: Token[] = [];
	const stack: boolean[] = [];
	let at = 0;
	const depth = (): boolean => stack.some(Boolean);
	for (const span of tagSpans(html)) {
		if (span.start > at) {
			tokens.push({
				kind: 'text',
				rtl: depth(),
				value: html.slice(at, span.start),
			});
		}
		const value = html.slice(span.start, span.end);
		const close = value.startsWith('</');
		const name = (TAG_NAME.exec(value)?.groups?.['name'] ?? '').toLowerCase();
		tokens.push({ close, kind: 'tag', name, rtl: depth(), value });
		if (close) {
			stack.pop();
		} else if (opensScope(value)) {
			stack.push(DIR_RTL.test(value));
		}
		at = span.end;
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

/** Whether an opening tag fails to open a scope BECAUSE it is visibly
 * malformed — its body holds another `<`, so a swallowed closing tag
 * supplied its `>` and the attribute value it was inside runs on past
 * the tag token.
 *
 * `opensScope`'s OTHER arm — a self-closing `<br/>` — opens no scope
 * either, but a self-closing tag is well-formed and the text after it
 * is ordinary document text, so it is excluded here explicitly.
 * (Corpus-wide: 0 self-closing tags, so the two readings cannot
 * diverge on today's data; the distinction is for whoever adds one.) */
function swallowedClose(value: string): boolean {
	return !(opensScope(value) || value.endsWith('/>'));
}

/**
 * Which tokens sit inside an attribute VALUE rather than in the
 * document, as indices into `tokens`.
 *
 * A region opens on a visibly malformed open tag — the swallowed `</a>`
 * of `href="/Jastrow,_כָּלוּל.1</a>" data-ref="…">` supplied that tag's
 * `>`, so the attribute value runs on past the tag token — and closes
 * at the end of the first TEXT token carrying a `>`, which is the
 * attribute's own terminator. That terminating token is itself
 * interior: its head is still attribute value.
 *
 * This is the ONE definition of the region. `damageOf` in `markup.ts`
 * counts the tag tokens it holds on the attribute axis, and
 * `bare-rtl-hebrew` in `rules/rtl.ts` refuses to rewrite the text
 * tokens it holds. Those two must agree by construction: a rule
 * allowed to write where the gate counts damage is a rule whose only
 * defence is the gate halting the pipeline. They disagreed once — the
 * rule asked only whether the PREVIOUS token was the malformed tag —
 * and the divergence was live on J00597.
 *
 * The reading is deliberately conservative and is NOT a browser's: a
 * browser ends a double-quoted value at the next `"`, while this ends
 * it only on a `>` in document text. D00478's region recovers after a
 * few tokens; J00597's never does, so the rest of that field is
 * interior. Being wrong in this direction only freezes markup that is
 * already damaged.
 *
 * Returned as a set, computed once per token stream, because callers
 * walk every token: recomputing the region per token would be
 * quadratic on a 180-token definition.
 */
function attributeInterior(tokens: readonly Token[]): Set<number> {
	const interior = new Set<number>();
	let open = false;
	for (const [at, token] of tokens.entries()) {
		if (open) {
			interior.add(at);
		}
		if (token.kind === 'text') {
			if (open && token.value.includes('>')) {
				open = false;
			}
		} else if (!token.close && swallowedClose(token.value)) {
			// Idempotent inside an already-open region, so no `open` guard.
			open = true;
		}
	}
	return interior;
}

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

export type { Span, TagToken, TextToken, Token };
export {
	attributeInterior,
	DIR_RTL,
	HEBREW,
	HEBREW_ATOM,
	hebrewRuns,
	mapTagsAndText,
	opensScope,
	serialize,
	tagSpans,
	tokenize,
};
