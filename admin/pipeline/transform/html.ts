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
const HEBREW = '\\u0591-\\u05C7\\u05D0-\\u05EA\\u05F0-\\u05F4\\uFB1D-\\uFB4F';

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
 */
const HEBREW_ATOM = `[${HEBREW}]\\u0307*`;
const HEBREW_RUN = new RegExp(
	`(?:${HEBREW_ATOM})+(?:[ \\u00A0'"](?:${HEBREW_ATOM})+)*`,
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
		} else if (opensScope(value)) {
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
export {
	attributeInterior,
	DIR_RTL,
	HEBREW,
	hebrewRuns,
	opensScope,
	serialize,
	tokenize,
};
