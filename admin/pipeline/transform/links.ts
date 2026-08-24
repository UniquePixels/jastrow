/**
 * The anchor view over `html.ts`'s token stream (batch-2 spec §3).
 *
 * Every rule that reads or writes a link goes through here, so
 * attribute parsing exists once. Two parsers would drift, and the
 * corpus contains tags that defeat a naive one — an `href` missing its
 * closing quote absorbs the following `</a>` into the attribute value
 * (`unterminated-href-swallows-closing-tag`, 2 instances, batch 4).
 * `opensScope` from `html.ts` is the single authority on that shape;
 * this module reports an anchor whose OWN opening tag fails it as
 * `malformed`, and both editors refuse.
 *
 * That is not the only way an anchor's tokens can be fake. When a
 * malformed tag's `attributeInterior` region never recovers — J00597's
 * shape, per `html.ts`'s own docs on that function — every tag after
 * it, however well-formed on its own, tokenizes as attribute VALUE
 * text, not document markup. A later `<a href="/Bava_Metzia.38b">…</a>`
 * in that tail reads as a perfectly good anchor by every local test:
 * its own opening tag passes `opensScope`, it closes, its `href`
 * parses. It is still not real markup — editing it would write bytes
 * into a `data-ref` (or `href`) VALUE upstream, corrupting a field
 * `html.ts` has already flagged as damaged. This module calls that
 * case `interior` and refuses it exactly like `malformed`, checking the
 * anchor's `open` and `close` token indices against
 * `attributeInterior(tokens)`, computed once per call (`rules/rtl.ts`
 * makes the same call for the same reason: two independent readings of
 * where the interior ends would be free to drift, and did once).
 *
 * THE WHOLE INTERIOR POPULATION, named (measured 2026-08-24, task 11;
 * batch-2 task 0 left the composition of its `interior: 12` open, with
 * the twelfth member's source tag unidentified). Over every field
 * `fieldsOf` walks: 170,182 anchors, `malformed: 2`, `close === -1: 3`,
 * `interior: 12` — and **all twelve interior anchors are in ONE entry,
 * J00597, trapped by ONE damaged tag**, its first anchor's unterminated
 * href `href="/Jastrow,_דִּלְדֵּל.1</a>`, which swallows the rest of the
 * field. There is no twelfth source to find; there was only ever one.
 * That single tag is the catalogued row
 * `unterminated-href-swallows-closing-tag` (2, blocking, PENDING), so
 * repairing that row retires this refusal's entire live population.
 */
import {
	attributeInterior,
	opensScope,
	type TagToken,
	type Token,
} from './html.ts';

// Hoisted per lint/performance/useTopLevelRegex. The `d` flag records
// each group's [start, end) span so `retarget` can splice the VALUE
// text in place — reassembling the tag from parsed parts would drop
// `class`, `dir` and attribute order, none of which this module reads.
//
// The value class is LAZY rather than a negated set. `[^"']*` excluded
// BOTH quote characters, so a value holding an apostrophe never matched
// at all (see below); `[^"]*` would read every value in the corpus
// today — all 340,360 are double-quoted — but would silently over-run a
// single-quoted one. `[\s\S]*?` stops at whichever delimiter `\k<q>`
// captured, so it is correct for either without assuming the corpus's.
// `tagValue` is always one tag, so it cannot cross a `>`.
const ATTR = (name: string): RegExp =>
	new RegExp(
		String.raw`\b${name}\s*=\s*(?<q>["'])(?<value>[\s\S]*?)\k<q>`,
		'du',
	);
const HREF = ATTR('href');
const DATA_REF = ATTR('data-ref');
/** The two attributes a target is written in, with the names the
 * refusal messages use. */
const ATTRIBUTES = [
	['href', HREF],
	['data-ref', DATA_REF],
] as const;

interface Anchor {
	/** Index of the `</a>` in the token array; -1 when unclosed. */
	close: number;
	dataRef: string;
	/** Display text with tags stripped. */
	display: string;
	href: string;
	/** This anchor's `open` or `close` token sits inside another tag's
	 * unrecovered `attributeInterior` region — the tokens exist only as
	 * the tail of a DIFFERENT tag's damaged attribute value, not as
	 * document markup, even though this anchor reads as well-formed in
	 * isolation. Neither editor will touch it. Independent of
	 * `malformed`, which is about this anchor's OWN opening tag. */
	interior: boolean;
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
	interior: ReadonlySet<number>,
): Anchor {
	// Safe: every caller passes an index it just found by scanning
	// `tokens` for a `kind: 'tag'` entry, so this is always a TagToken.
	const tag = tokens[open] as TagToken;
	return {
		close,
		dataRef: attrValue(tag.value, DATA_REF),
		display: displayOf(tokens, open, close),
		href: attrValue(tag.value, HREF),
		interior: interior.has(open) || (close !== -1 && interior.has(close)),
		malformed: !opensScope(tag.value),
		open,
	};
}

/**
 * Every `<a>` in the stream, one `Anchor` per opening tag, in document
 * order.
 *
 * `attributeInterior` is computed once up front, not per anchor —
 * walking a 180-token definition once per anchor found in it would be
 * quadratic, and every anchor built below needs the same set.
 *
 * A single stack pairs each open with the next `</a>` that pops it,
 * which is LOAD-BEARING, not a hedge against an assumption that
 * doesn't hold: anchors DO nest in this corpus. Corrected 2026-08-23 —
 * this docstring used to claim the opposite ("anchors do not nest in
 * this corpus, so depth never exceeds one"), which a reviewer's
 * corpus-wide count disproved and which had already caused a real bug
 * in `unlink.ts`'s `unlinkMatching` (see that function's docstring).
 * Measured: 477 nested pairs across 465 entries in `definition` text,
 * both members usable in every pair. `language_reference` carries 757
 * pairs across 756 entries, 755 of them sharing one `data-ref` — the
 * shape the pending `nonsense-dup-anchor` row (route: transform,
 * catalogued 755) targets. The LIFO stack pairs a nested pair
 * correctly regardless of the claim above being false: the inner
 * `</a>` pops the most recently pushed (innermost) open before the
 * outer `</a>` pops what's left. An opening tag left on the stack when
 * the walk ends has no closing tag at all and is
 * reported with `close: -1`; a visibly malformed opening tag (one that
 * fails `opensScope`) is reported with `malformed: true` regardless of
 * whether a later `</a>` happens to pop it — `DAMAGED` in the test file
 * is exactly that case, since its swallowed `</a>` is embedded in the
 * `href` and a real one still follows. A well-formed-looking `<a>`
 * whose `open` or `close` token sits inside an EARLIER tag's
 * unrecovered interior region is reported with `interior: true` — see
 * the module docstring and the `J00597` test fixture.
 */
function anchors(tokens: readonly Token[]): Anchor[] {
	const interior = attributeInterior(tokens);
	const found: Anchor[] = [];
	const stack: number[] = [];
	for (const [at, token] of tokens.entries()) {
		if (token.kind !== 'tag' || token.name !== 'a') {
			continue;
		}
		if (token.close) {
			const open = stack.pop();
			if (open !== undefined) {
				found.push(buildAnchor(tokens, open, at, interior));
			}
		} else {
			stack.push(at);
		}
	}
	for (const open of stack) {
		found.push(buildAnchor(tokens, open, -1, interior));
	}
	return found.sort((a, b) => a.open - b.open);
}

/** The one gate both editors share. Checked in order of how specific
 * the damage is to THIS anchor: `malformed` (this anchor's own opening
 * tag is broken) before `interior` (this anchor is fine on its own but
 * sits inside a DIFFERENT tag's damage) before unclosed (nothing is
 * broken, a `</a>` is simply missing). An anchor can be more than one
 * of these at once — the leftover-stack case in `anchors()` reports
 * `close: -1` for a malformed open whether or not it also happens to be
 * unclosed — and one refusal reason is enough. */
function assertUsable(anchor: Anchor): void {
	if (anchor.malformed) {
		throw new Error('links: refusing to edit a malformed anchor');
	}
	if (anchor.interior) {
		throw new Error(
			'links: refusing to edit an anchor inside another tag’s damaged attribute interior',
		);
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
 * Both attributes must PARSE before either is rewritten. `retarget`
 * writes an address in two spellings, so an anchor it can only half
 * rewrite is one it must not touch at all — and the failure should
 * name the attribute rather than surfacing as
 * `replaceAttrValue`'s generic throw from inside a nested call.
 *
 * Measured 2026-08-24 over all 170,182 corpus anchors, by substring so
 * the parser's own limits do not colour the count: **170,180 carry
 * both `href` and `data-ref`, 2 carry `href` alone, 0 carry `data-ref`
 * alone.** No shipped rule reaches those 2 — a composed pass over all
 * 32,512 entries throws 0 times — but a throw inside a rule is a
 * migration failure rather than a soft error, and "no rule reaches it
 * today" is the argument that preceded two latent bugs in this batch.
 *
 * A LARGER population once hit the same wall and no longer does.
 * **452 anchors across 417 entries carried both attributes and parsed
 * as neither**, because `ATTR`'s value class was `[^"']*` and their
 * values hold an apostrophe (`Tosefta Ma'asrot 1:4`,
 * `Tosefta Shevi'it 4:11`). Every one of the 452 was an apostrophe
 * case; none was anything else. That was a parser defect rather than a
 * corpus defect, and batch 2 deferred it because widening the class
 * changes what every rule and the link-target gate SEE corpus-wide.
 *
 * FIXED 2026-08-24, measured before batch 3 rather than asserted. The
 * widening is **purely additive**: over the 170,180 opening tags that
 * are well-formed enough to scan — the corpus's 170,182 anchors less
 * the 2 whose `href` swallows their own `</a>`, which no value class
 * can read — `href` and `data-ref` each gain 452 values, **0 values
 * change** and **0 are lost**. Both corpus gates are byte-identical across the
 * change — `transform:count` reports the same 13 rules / 11 MATCH /
 * `ib-yoma-2a` −124 / `sifre-ib-resolves-to-yalkut` −5, and
 * `body:migrate-dry`'s report file diffs empty. No shipped rule fires
 * differently; what changed is only what the parser can SEE.
 *
 * It did overturn a claim three records carried. O00242's bare `Ib.`
 * was described as "carrying no `data-ref` at all"; it carries
 * `Avot D'Rabbi Natan 1:7`, which the old class could not read, and
 * that address matches its own nearest antecedent EXACTLY. See
 * `rules/anaphora.ts` and `catalogue-audit/ib-yoma-2a.md` §2c/§3.2 for
 * what the correction does to the row's evidence, which it strengthens.
 */
function assertRetargetable(tagValue: string): void {
	for (const [name, attr] of ATTRIBUTES) {
		if (attr.exec(tagValue) === null) {
			throw new Error(
				`links: refusing to retarget an anchor whose ${name} does not parse`,
			);
		}
	}
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
	// Safe: `anchor.open` came from `anchors(tokens)` scanning this same
	// stream for `kind: 'tag'` entries, so it always indexes a TagToken.
	const tag = tokens[anchor.open] as TagToken;
	assertRetargetable(tag.value);
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
