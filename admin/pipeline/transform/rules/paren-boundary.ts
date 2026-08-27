import type { SourceEntry } from '../../body/types.ts';
import { mapFields } from '../fields.ts';
import { serialize, type TextToken, type Token, tokenize } from '../html.ts';
import { type Anchor, anchors } from '../links.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/**
 * The two paren-boundary rows of batch 4, both of them a `(` or a `)`
 * sitting on the wrong side of an `</a>`.
 *
 * ## What the two rows are
 *
 * `anchor-swallows-close-paren` (525 occurrences / 493 entries) is the
 * second half of a two-anchor Tosefta citation. Jastrow prints
 * `Tosef. Sabb. XVI (XVII), 6` — chapter XVI in the common recension,
 * XVII in the variant, halakha 6 — and Sefaria's markup splits it
 * across two anchors with the boundary drawn one character too far
 * right:
 *
 *     <a P>Tosef. Sabb. XVI</a> (<a V>XVII), 6</a>
 *
 * The `(` is set outside the variant anchor and its `)` inside it, so
 * a reader sees the closing paren rendered as part of the link. 100%
 * of the row (525 of 525) is this shape; there is no single-anchor
 * form. `toseftaCloseParen` redraws that one boundary:
 *
 *     <a P>Tosef. Sabb. XVI</a> (<a V>XVII</a>), 6
 *
 * `open-paren-in-anchor-display` (225 occurrences / 214 entries) is
 * the OPPOSITE polarity in the same tag — `<a>(TEXT</a>)` — and
 * `openParenInAnchorDisplay` carries its `(` out to the left. The two
 * never claim the same bytes: measured corpus-wide, 0 span
 * intersections, though **9 entries carry both shapes at different
 * offsets**, so an entry-level disjointness test would report a false
 * collision here. The spans are the test, not the rids.
 *
 * ## One walk, one rule shipped, one row still blocked
 *
 * `anchor-swallows-close-paren` is entangled with
 * `tosefta-variant-chapter-halakha-loss` (414 occurrences / 391
 * entries), which is its primary-anchor arm seen from the other end:
 * the same 525 pairs, of which 414 leave the PRIMARY with a
 * chapter-only `data-ref` (`Tosefta Shabbat 16`, halakha dropped) and
 * 111 give it a halakha disagreeing with print. The catalogue CALLED
 * the two fixes one edit; that claim was retracted on both rows on
 * 2026-08-26 (`ONE EDIT FIXES BOTH` and `THE BOUNDARY FIX AND THE
 * HALAKHA FIX ARE THE SAME EDIT`, quoted where they stood), and what
 * survives is one WALK — `toseftaSplits` below — that both repairs
 * would consume.
 *
 * **The halakha half is NOT shipped, and the reason is the gate.**
 * The repair would write `Tosefta Shabbat 16:6` onto the primary,
 * `Tosefta Shabbat 16` being the primary's own input target and `:6`
 * the suffix of the variant's own `Tosefta Shabbat 17:6` — spec §3.2
 * case 4, declared through `TransformResult.recombined`. Probed
 * against the real `checkLinkTargets` on both attributes — the probe
 * is kept as a live test in `paren-boundary.test.ts`, green ON THE
 * REFUSAL, so that widening the gate breaks it and sends whoever did
 * the widening straight back here — it is REFUSED:
 *
 *     recombined "Tosefta Shabbat 16:6" is not a prefix of
 *     "Tosefta Shabbat 16" joined to a suffix of "Tosefta Shabbat 17:6"
 *
 * `rejoinsFrom`'s tightening of 2026-08-24 requires the part of the
 * tail the split discards to be a prefix of the head. The only viable
 * split keeps `:6` and discards `Tosefta Shabbat 17`, which is not a
 * prefix of `Tosefta Shabbat 16`; the href side fails identically
 * (`/Tosefta_Shabbat.17` against `/Tosefta_Shabbat.16`). That is the
 * tightening working as designed rather than a defect — its own
 * docstring names "minting a wrong verse in the head's own work
 * without moving the work at all" as a probe it exists to reject, and
 * this edit is structurally that shape. The gate has no handle to
 * separate "halakha taken from a real sibling anchor" from "halakha
 * minted", because the discarded-prefix test is the only handle it
 * has.
 *
 * Every other assignment of the pair's four input targets
 * (`Tosefta Shabbat 16`, `/Tosefta_Shabbat.16`, `Tosefta Shabbat 17:6`,
 * `/Tosefta_Shabbat.17.6`) to `head`/`tail` was tried and none clears.
 * Case 3 cannot license it either: its remainder must occur in the
 * anchor's own DISPLAY, and the primary's is `Tosef. Sabb. XVI` — no
 * `:` and no `6`. That is precisely why case 4 exists for
 * `ib-targum-work-loss`, and precisely what the tightening later
 * narrowed.
 *
 * WHERE THE GAP ACTUALLY IS, since the docstring does not name it:
 * the tightening's legitimate shape is two targets differing in the
 * WORK, where the discarded prefix of the tail genuinely is a prefix
 * of the head (an href's leading `/`). These two differ in the
 * CHAPTER of the SAME work, and `rejoinsFrom` has no reading that
 * separates that from head-extension.
 *
 * ## The evidence the deferred repair rests on, kept here for the
 * ruling
 *
 * Print reads `Tosef. Sabb. XVI (XVII), 6`, and the halakha `6` is
 * witnessed TWICE in the entry's own input: in the variant's
 * `data-ref` (`Tosefta Shabbat 17:6`) and again in the variant's
 * DISPLAY text (`XVII), 6`) — the catalogue measured that agreement at
 * 525 of 525. That is strictly more evidence than case 4 asks for,
 * which is why the refusal is a gap in the gate rather than a verdict
 * on the repair, and it is the seed of whatever case eventually
 * licenses it.
 *
 * Widening case 4 (or adding a sixth case) is a ruling on a SHARED
 * gate, not an implementation choice inside one rule module. Ruled
 * 2026-08-26 (Brian): the row is left unresolved, no
 * `toseftaPrimaryHalakha` is exported — registering a rule the gate
 * refuses would halt the migration rather than repair anything — and
 * the gate ruling becomes its own branch after batch 4. The
 * population is pinned in `paren-boundary.test.ts` so the figure
 * survives the wait.
 *
 * ## What shipping half the edit does, and what it does not
 *
 * `anchor-swallows-close-paren`'s own `reason` says "Re-splitting the
 * boundary so ')' falls outside the anchor and the print halakha
 * reaches the primary IS ONE EDIT, and it fixes both rows." **Half of
 * that is now false: one edit fixes one row.** `toseftaCloseParen`
 * closes `anchor-swallows-close-paren` and leaves
 * `tosefta-variant-chapter-halakha-loss` open, so nobody should read
 * a green run here as the pair being retired.
 *
 * Moving the `)` alone is still a strict improvement and nothing
 * regresses: the rendered display becomes right — the paren stops
 * being drawn as part of the link — and the primary's `data-ref`
 * stays exactly as wrong as it already was, neither repaired nor
 * damaged further. The two halves are independent in that direction.
 *
 * ## REGISTRATION ORDER, FOR WHOEVER SHIPS THE HALAKHA RULE
 *
 * **THE DEFERRED `toseftaPrimaryHalakha` MUST BE REGISTERED STRICTLY
 * BEFORE `toseftaCloseParen`, NOT MERELY ADJACENT TO IT.** The
 * direction is the whole of the requirement, and getting it backwards
 * is silent.
 *
 * `toseftaCloseParen` DESTROYS `toseftaSplits`'s own predicate. A
 * variant's display is `XVII), 6` before the boundary move and `XVII`
 * after it, and `VARIANT_DISPLAY` is anchored at both ends, so a
 * repaired pair is no longer a pair. `run.ts` feeds each rule the
 * PREVIOUS rule's output, so a halakha rule registered after this one
 * would see 0 splits and repair 0 primaries.
 *
 * That failure is invisible to every check this module has.
 * `count.ts` measures each rule ALONE against the pinned snapshot, so
 * it would keep reporting 414 while the composed migration repaired
 * nothing — green everywhere, nothing done, which is the worst shape
 * a defect can take here. Task 0's commutation gate will report the
 * pair as non-commuting, which is expected and must be declared; what
 * it will NOT tell you is which order is the correct one. This
 * paragraph is that answer.
 *
 * The corpus tier asserts the destruction directly
 * (`survivingSwallows` goes 525 → 0, computed from the OUTPUT), so
 * the fact this paragraph rests on is measured rather than asserted.
 *
 * ## WHAT THE ANCHOR-COUNT INVARIANT DOES AND DOES NOT ESTABLISH
 *
 * Both rules are checked for an invariant anchor count across every
 * edit, and that check is load-bearing — these rules move bytes across
 * tag boundaries and dropping an `</a>` is exactly how they would go
 * wrong. But it is worth being blunt about its reach, because it is
 * easy to read as more than it is:
 *
 * **An invariant anchor count is NOT "no link lost", and neither is
 * the four-gate stack.** `<a>(</a>)` is a well-formed anchor with an
 * EMPTY display — a link with nothing to click — and it clears the
 * anchor count, `checkMarkup`, `checkNoNewText` and `checkLinkTargets`
 * alike. `openParenInAnchorDisplay` would produce exactly that from a
 * one-character display, and nothing in the stack would object.
 *
 * The live population of such displays is 0, and the guard is
 * therefore fail-closed rather than a live repair — but the CLAIM has
 * to be sized to the evidence. What the corpus tier asserts instead is
 * the stronger property the invariant does not give: the number of
 * anchors with an EMPTY DISPLAY is itself invariant across every edit,
 * so no anchor is hollowed out. "0 links lost" rests on that pair of
 * assertions together, never on the count alone.
 *
 * ## The selection, re-measured here rather than inherited
 *
 * A VARIANT is an anchor whose stripped display matches
 * `^[IVXLC]+\),\s*\d+$`; its PRIMARY is the anchor immediately
 * preceding it in document order within the same field. Measured over
 * `fieldsOf` on the pinned snapshot, reproducing the catalogue write-
 * back to the digit: **525 pairs / 493 entries**, of which **414 occ /
 * 391 ent** have a chapter-only primary and **111 occ / 107 ent** a
 * disagreeing one. The OCCURRENCE split is additive (414 + 111 = 525);
 * the ENTRY split is not, because 5 entries carry both arms
 * (391 + 107 − 5 = 493). So the halakha row is a STRICT SUBSET of this
 * one — 391 of 493 entries — never an equal population. Corroborating figures, all reproduced: **0
 * orphan variants** (every variant has a preceding anchor), **0
 * unusable** anchors in either role (no malformed, interior or
 * unclosed member), **0 variants carrying inner markup**, **0 variants
 * whose own `data-ref` lacks a `:`**, and **0 pairs outside
 * `definition`**.
 *
 * No special case on work name: 521 primaries are Tosefta and 4 are
 * Mishnah (A02838, C01414, G00541, H01421), and they are the same
 * shape. The rule reads structure, never a work.
 */

/** A variant anchor's display: a roman chapter, the swallowed `)`,
 * then the print halakha — `XVII), 6`. Anchored at both ends, so a
 * display carrying anything else is not this row. */
const VARIANT_DISPLAY = /^[IVXLC]+\),\s*\d+$/u;

/** One two-anchor Tosefta citation, in document order. */
interface Split {
	primary: Anchor;
	variant: Anchor;
}

/** Whether either editor would touch this anchor — the same three
 * refusals `links.ts`'s `assertUsable` throws on, tested rather than
 * caught so a pair can be SKIPPED instead of aborting the field.
 * Measured 0 corpus-wide in either role; the guard is fail-closed
 * against a re-fetch, not a live population. */
function usable(anchor: Anchor): boolean {
	return !(anchor.malformed || anchor.interior) && anchor.close !== -1;
}

/**
 * Whether an anchor's display is built from text alone, with no tag
 * token between its `open` and its `close`.
 *
 * REQUIRED BY BOTH BOUNDARY MOVES, and the reason is crossed nesting
 * rather than tidiness. Each rule relocates one of the anchor's own
 * tags past a text character; if a DIFFERENT element opens inside the
 * anchor and closes inside it too, the moved tag can land between that
 * element's open and its close:
 *
 *     <a V><i>XVII), 6</i></a>  →  <a V><i>XVII</a>), 6</i>
 *
 * That output is crossed, not merely ugly, and it is invisible to
 * every gate a registered rule faces — `checkMarkup` compares a
 * well-formedness DELTA and reads both sides as equally damaged,
 * `checkNoNewText` sees an identical multiset, `checkLinkTargets` sees
 * an unchanged target, and the anchor count is unmoved. Nothing would
 * catch it.
 *
 * `strandsOpenParen` carried this guard from the start (it is the
 * catalogue predicate's own `[^<]*`); `toseftaSplits` did not, and a
 * reviewer's constructed `<i>` variant walked straight through all
 * four checks. Live population is 0 — measured 0 variants carrying
 * inner markup corpus-wide — so this is fail-closed hardening against
 * a re-fetch or against composition, in the same spirit as `usable`
 * above, not a repair of anything shipped.
 */
function tagFree(tokens: readonly Token[], anchor: Anchor): boolean {
	return !tokens
		.slice(anchor.open + 1, anchor.close)
		.some((inner) => inner.kind === 'tag');
}

/**
 * Every `{ primary, variant }` pair in this token stream.
 *
 * The ONE predicate walk both entangled rows consume, so they cannot
 * disagree about the population — the failure mode the catalogue's own
 * three mutually inconsistent round-3 readings of this shape (522/526/
 * ~558 pairs) are a record of. `anchors()` is the only parser of
 * anchor attributes here; a regex over raw HTML would be a second one,
 * free to drift.
 *
 * Task 1 verified this selection against a textually adjacent regex
 * (`<a\b[^>]*>[^<]*</a>\s*\(<a\b[^>]*>[IVXLC]+\),\s*\d+</a>`) and the
 * two return the IDENTICAL entry set, because the separator between
 * the two anchors is the literal `" ("` in 414 of 414 occurrences with
 * no intervening markup anywhere in the corpus. Document order is
 * preferred anyway: it needs no assumption about what sits between the
 * two tags.
 */
function toseftaSplits(tokens: readonly Token[]): Split[] {
	const found = anchors(tokens);
	const splits: Split[] = [];
	for (const [at, variant] of found.entries()) {
		const primary = found[at - 1];
		if (
			primary === undefined ||
			!VARIANT_DISPLAY.test(variant.display) ||
			!(usable(primary) && usable(variant)) ||
			// The variant is the anchor whose boundary moves, so it is
			// the one that can be crossed — see `tagFree`. The primary
			// is never re-split (the deferred halakha rule rewrites its
			// ATTRIBUTES, which cannot cross anything), so it carries no
			// such requirement and none is imposed on it.
			!tagFree(tokens, variant)
		) {
			continue;
		}
		splits.push({ primary, variant });
	}
	return splits;
}

/** Where in the token stream a character at `offset` in an anchor's
 * DISPLAY actually lives — `{ at }` the token index, `{ into }` the
 * offset inside that token's value. `undefined` when the display is
 * shorter than the offset, which the callers' own predicates already
 * exclude.
 *
 * Display is the concatenation of the TEXT tokens between `open` and
 * `close` (`links.ts`'s `displayOf`), so the walk skips tags for the
 * same reason that function does — and so an offset stays meaningful
 * even for a display assembled from more than one text token. */
function siteOf(
	tokens: readonly Token[],
	anchor: Anchor,
	offset: number,
): { at: number; into: number } | undefined {
	let seen = 0;
	let site: { at: number; into: number } | undefined;
	for (
		let at = anchor.open + 1;
		at < anchor.close && site === undefined;
		at++
	) {
		const token = tokens[at];
		if (token === undefined || token.kind !== 'text') {
			continue;
		}
		if (seen + token.value.length > offset) {
			site = { at, into: offset - seen };
		} else {
			seen += token.value.length;
		}
	}
	return site;
}

/** A text token carrying `value`, borrowing `rtl` from the token it
 * was split out of. Only `value` survives serialization
 * (`html.ts`'s `serialize` joins values), but a token that lies about
 * its ancestry is a trap for whoever reads one next. */
function textLike(token: Token, value: string): TextToken {
	return { kind: 'text', rtl: token.rtl, value };
}

/**
 * Rebuild the stream with each index in `emit` replaced by the tokens
 * it maps to, and each index in `drop` removed.
 *
 * Both rules below are a boundary MOVE — a tag and a paren swap
 * places — which is two edits at two separate indices that must land
 * in one pass, because a per-occurrence splice would invalidate every
 * later index. Neither map may add or remove a TAG token: the anchor
 * count is invariant across every edit here, and the corpus tier
 * asserts it.
 */
function rebuild(
	tokens: readonly Token[],
	emit: ReadonlyMap<number, readonly Token[]>,
	drop: ReadonlySet<number>,
): Token[] {
	const out: Token[] = [];
	for (const [at, token] of tokens.entries()) {
		if (drop.has(at)) {
			continue;
		}
		const replacement = emit.get(at);
		if (replacement === undefined) {
			out.push(token);
		} else {
			out.push(...replacement);
		}
	}
	return out;
}

/**
 * Move each variant anchor's swallowed `)` — and everything after it,
 * which is the `, N` halakha — out past the `</a>`.
 *
 * The `</a>` is emitted at the paren's own site and dropped from its
 * original index, so every token that used to sit between them ends up
 * outside the anchor in its original order. Nothing is inserted and
 * nothing is deleted: the character sequence is byte-identical before
 * and after, which is the point rather than a failure. The row's
 * `description` is "anchor SWALLOWS the closing paren" and what a
 * reader sees is a `)` rendered as part of a link — a MARKUP defect,
 * whose whole fix is the tag boundary. A version of this rule that
 * changed the text would be inventing or destroying characters.
 *
 * So the defect count is measured on the markup, as a DELTA: variant
 * anchors holding a swallowed `)` go 525 → 0 corpus-wide.
 */
function moveCloseParenOut(text: string): { moved: number; out: string } {
	const tokens = tokenize(text);
	const splits = toseftaSplits(tokens);
	const emit = new Map<number, Token[]>();
	const drop = new Set<number>();
	for (const { variant } of splits) {
		const site = siteOf(tokens, variant, variant.display.indexOf(')'));
		const token = site === undefined ? undefined : tokens[site.at];
		const closer = tokens[variant.close];
		if (site === undefined || token === undefined || closer === undefined) {
			continue;
		}
		const head = token.value.slice(0, site.into);
		const tail = token.value.slice(site.into);
		emit.set(site.at, [
			...(head === '' ? [] : [textLike(token, head)]),
			closer,
			...(tail === '' ? [] : [textLike(token, tail)]),
		]);
		drop.add(variant.close);
	}
	if (emit.size === 0) {
		return { moved: 0, out: text };
	}
	return { moved: emit.size, out: serialize(rebuild(tokens, emit, drop)) };
}

/**
 * Move each `(` that opens an anchor's display out to the left of the
 * opening tag, where its `)` already sits.
 *
 * The predicate is `open-paren-in-anchor-display`'s catalogued one,
 * read off `anchors()` rather than off the raw HTML: the display opens
 * with `(`, the anchor holds no inner markup (the catalogue's
 * `[^<]*`), and the text immediately after the `</a>` opens with `)`.
 * Measured on the pinned snapshot it reproduces the row exactly —
 * **225 occurrences / 214 entries** — with **0 members carrying inner
 * markup**, **0 unusable**, and **0 whose display is left unbalanced
 * once the leading `(` is discounted**.
 *
 * CORRECTED 2026-08-26 (impl/phase-2-batch-4): this closed *"so the
 * repair never strands a `)` inside a link"*, and that clause was a
 * measurement being read as a guarantee — nothing in the code
 * enforced it. `keepsParensBalanced` below now does, in the same
 * fail-closed spirit as `usable` and `tagFree`: measured over all
 * 32,512 entries the guard declines 0 members and the row still
 * reproduces at 225 / 214, so it is hardening against a re-fetch
 * rather than a live repair.
 *
 * Changes no target at all, so it declares nothing: the opening tag is
 * copied through byte for byte and only its POSITION relative to one
 * text character moves.
 */
function moveOpenParenOut(text: string): { moved: number; out: string } {
	const tokens = tokenize(text);
	const emit = new Map<number, Token[]>();
	let moved = 0;
	for (const anchor of anchors(tokens)) {
		const site = strandsOpenParen(tokens, anchor)
			? siteOf(tokens, anchor, 0)
			: undefined;
		const token = site === undefined ? undefined : tokens[site.at];
		const opener = tokens[anchor.open];
		if (site === undefined || token === undefined || opener === undefined) {
			continue;
		}
		emit.set(anchor.open, [textLike(opener, '('), opener]);
		const rest = token.value.slice(1);
		emit.set(site.at, rest === '' ? [] : [textLike(token, rest)]);
		moved += 1;
	}
	if (moved === 0) {
		return { moved: 0, out: text };
	}
	return { moved, out: serialize(rebuild(tokens, emit, new Set())) };
}

/**
 * Whether carrying the leading `(` out of this display would leave a
 * `)` behind with nothing inside the anchor to match it.
 *
 * THE HARM IS INVISIBLE TO EVERY GATE, which is why it is a guard
 * rather than a note. Moving one `(` past one tag changes no
 * tag-stripped text (`checkNoNewText` sees an identical multiset), no
 * target (`checkLinkTargets` sees an unchanged pair), no anchor count
 * and no well-formedness delta (`checkMarkup`) — so `<a>(XVII)</a>)`
 * becoming `(<a>XVII)</a>)` would ship a `)` rendered as part of a
 * link, which is the very defect `toseftaCloseParen` above exists to
 * remove. The same blind spot as the empty-display case the module
 * docstring names.
 *
 * The test is a depth scan over the display MINUS its leading `(`,
 * refusing any `)` that would go negative. An unmatched `(` left
 * behind is not this row's harm and is not refused: nothing is
 * stranded by it.
 *
 * Live population 0, both under this reading and under the stricter
 * "ends at depth 0" one — measured corpus-wide, and the row still
 * reproduces at 225 occ / 214 ent with the guard in place. Fail-closed
 * against a re-fetch, exactly like `usable` and `tagFree`.
 */
function keepsParensBalanced(display: string): boolean {
	let depth = 0;
	for (const char of display.slice(1)) {
		if (char === '(') {
			depth += 1;
		} else if (char === ')') {
			depth -= 1;
			if (depth < 0) {
				return false;
			}
		}
	}
	return true;
}

/** `open-paren-in-anchor-display`'s catalogued predicate, read off
 * `anchors()` rather than off the raw HTML, plus the balance guard
 * `moveOpenParenOut`'s docstring claims — see `keepsParensBalanced`. */
function strandsOpenParen(tokens: readonly Token[], anchor: Anchor): boolean {
	const after = tokens[anchor.close + 1];
	return (
		usable(anchor) &&
		anchor.display.startsWith('(') &&
		after?.kind === 'text' &&
		after.value.startsWith(')') &&
		tagFree(tokens, anchor) &&
		keepsParensBalanced(anchor.display)
	);
}

/** Run one boundary mapper over every field, turning its per-field
 * move count into one record per OCCURRENCE — `count.ts` measures
 * ENTRIES by `records.length > 0`, so the finer unit costs nothing
 * there and is what the corpus tier needs to reproduce an occurrence
 * figure. */
function applyBoundary(
	entry: SourceEntry,
	ruleId: string,
	detail: string,
	move: (text: string) => { moved: number; out: string },
): TransformResult {
	const records: TransformRecord[] = [];
	const healed = mapFields(entry, (text) => {
		const { moved, out } = move(text);
		for (let at = 0; at < moved; at++) {
			records.push({ detail, rid: entry.rid, ruleId });
		}
		return out;
	});
	if (healed === undefined || records.length === 0) {
		return { entry, records: [] };
	}
	return { entry: healed, records };
}

/** `anchor-swallows-close-paren` — 525 occurrences / 493 entries. */
const toseftaCloseParen: Rule = {
	apply(entry: SourceEntry): TransformResult {
		return applyBoundary(
			entry,
			'anchor-swallows-close-paren',
			'swallowed close paren moved outside its variant anchor',
			moveCloseParenOut,
		);
	},
	id: 'anchor-swallows-close-paren',
	phase: 'text-repairs',
};

/** `open-paren-in-anchor-display` — 225 occurrences / 214 entries. */
const openParenInAnchorDisplay: Rule = {
	apply(entry: SourceEntry): TransformResult {
		return applyBoundary(
			entry,
			'open-paren-in-anchor-display',
			'open paren moved outside its anchor display',
			moveOpenParenOut,
		);
	},
	id: 'open-paren-in-anchor-display',
	phase: 'text-repairs',
};

export { openParenInAnchorDisplay, toseftaCloseParen, toseftaSplits };
