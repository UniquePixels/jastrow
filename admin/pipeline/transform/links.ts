/**
 * The anchor view over `html.ts`'s token stream (batch-2 spec §3).
 *
 * Every rule that reads or writes a link goes through here, so
 * attribute parsing exists once. Two parsers would drift, and the
 * corpus contains tags that defeat a naive one — an `href` missing its
 * closing quote absorbs the following `</a>` into the attribute value
 * (`unterminated-href-swallows-closing-tag`, 2 instances, batch 4).
 * `opensScope` from `html.ts` is the single authority on that shape;
 * this module reports it as `malformed` and both editors refuse.
 */
import { opensScope, type TagToken, type Token } from './html.ts';

// Hoisted per lint/performance/useTopLevelRegex. The `d` flag records
// each group's [start, end) span so `retarget` can splice the VALUE
// text in place — reassembling the tag from parsed parts would drop
// `class`, `dir` and attribute order, none of which this module reads.
const ATTR = (name: string): RegExp =>
	new RegExp(String.raw`\b${name}\s*=\s*(?<q>["'])(?<value>[^"']*)\k<q>`, 'du');
const HREF = ATTR('href');
const DATA_REF = ATTR('data-ref');

interface Anchor {
	/** Index of the `</a>` in the token array; -1 when unclosed. */
	close: number;
	dataRef: string;
	/** Display text with tags stripped. */
	display: string;
	href: string;
	/** The opening tag is damaged; neither editor will touch it. */
	malformed: boolean;
	/** Index of the `<a …>` in the token array. */
	open: number;
}

interface Target {
	dataRef: string;
	href: string;
}

/** Read one attribute's value out of a raw tag string. Empty when the
 * attribute is absent — callers that need to distinguish "absent" from
 * "empty" don't exist yet, so this module doesn't invent the
 * distinction. */
function attrValue(tagValue: string, attr: RegExp): string {
	return attr.exec(tagValue)?.groups?.['value'] ?? '';
}

/** Concatenate only `kind: 'text'` tokens strictly between `open` and
 * `close` (or to the end of the stream when unclosed), so a nested
 * `<span dir="rtl">` contributes its text and not its tags. */
function displayOf(
	tokens: readonly Token[],
	open: number,
	close: number,
): string {
	const upper = close === -1 ? tokens.length : close;
	let text = '';
	for (const token of tokens.slice(open + 1, upper)) {
		if (token.kind === 'text') {
			text += token.value;
		}
	}
	return text;
}

function buildAnchor(
	tokens: readonly Token[],
	open: number,
	close: number,
): Anchor {
	const tag = tokens[open] as TagToken;
	return {
		close,
		dataRef: attrValue(tag.value, DATA_REF),
		display: displayOf(tokens, open, close),
		href: attrValue(tag.value, HREF),
		malformed: !opensScope(tag.value),
		open,
	};
}

/**
 * Every `<a>` in the stream, one `Anchor` per opening tag, in document
 * order.
 *
 * A single stack pairs each open with the next `</a>` that pops it —
 * anchors do not nest in this corpus, so depth never exceeds one, but
 * the stack costs nothing and needs no such assumption. An opening tag
 * left on the stack when the walk ends has no closing tag at all and is
 * reported with `close: -1`; a visibly malformed opening tag (one that
 * fails `opensScope`) is reported with `malformed: true` regardless of
 * whether a later `</a>` happens to pop it — `DAMAGED` in the test file
 * is exactly that case, since its swallowed `</a>` is embedded in the
 * `href` and a real one still follows.
 */
function anchors(tokens: readonly Token[]): Anchor[] {
	const found: Anchor[] = [];
	const stack: number[] = [];
	for (const [at, token] of tokens.entries()) {
		if (token.kind !== 'tag' || token.name !== 'a') {
			continue;
		}
		if (token.close) {
			const open = stack.pop();
			if (open !== undefined) {
				found.push(buildAnchor(tokens, open, at));
			}
		} else {
			stack.push(at);
		}
	}
	for (const open of stack) {
		found.push(buildAnchor(tokens, open, -1));
	}
	return found.sort((a, b) => a.open - b.open);
}

/** The one gate both editors share. A malformed opening tag is refused
 * before an unclosed one is even checked — when an anchor is both, one
 * refusal reason is enough, and `malformed` is the more specific of the
 * two. */
function assertUsable(anchor: Anchor): void {
	if (anchor.malformed) {
		throw new Error('links: refusing to edit a malformed anchor');
	}
	if (anchor.close === -1) {
		throw new Error('links: refusing to edit an unclosed anchor');
	}
}

/** Replace one attribute's VALUE span in place, leaving the quote
 * style, the attribute name, whitespace and every other attribute
 * exactly as written. */
function replaceAttrValue(
	tagValue: string,
	attr: RegExp,
	next: string,
): string {
	const match = attr.exec(tagValue);
	const span = match?.indices?.groups?.['value'];
	if (span === undefined) {
		throw new Error('links: anchor has no such attribute to retarget');
	}
	const [start, end] = span;
	return tagValue.slice(0, start) + next + tagValue.slice(end);
}

/**
 * Rewrite an anchor's `href` and `data-ref` to `target`, leaving every
 * other byte of the opening tag — and every other token — untouched.
 * Returns a new token array; the input is never mutated (`count.ts`
 * deep-freezes the corpus).
 */
function retarget(
	tokens: readonly Token[],
	anchor: Anchor,
	target: Target,
): Token[] {
	assertUsable(anchor);
	const tag = tokens[anchor.open] as TagToken;
	const value = replaceAttrValue(
		replaceAttrValue(tag.value, HREF, target.href),
		DATA_REF,
		target.dataRef,
	);
	return tokens.map((token, at) =>
		at === anchor.open ? { ...tag, value } : token,
	);
}

/**
 * Drop the anchor's opening and closing tags, keeping every token
 * between them — including any nested markup, which `unlink` does not
 * inspect. Removes exactly two tokens; the rest of the stream is
 * returned by reference-equal tokens, only the array itself is new.
 */
function unlink(tokens: readonly Token[], anchor: Anchor): Token[] {
	assertUsable(anchor);
	return tokens.filter((_, at) => at !== anchor.open && at !== anchor.close);
}

export type { Anchor, Target };
export { anchors, retarget, unlink };
