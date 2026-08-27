/**
 * The stranded-tail pair (batch-4 task 4): two catalogue rows in which
 * a citation's own tail printed OUTSIDE the anchor that should carry
 * it — `</a><sup>N</sup>` and `<a>…N</a>M` — both members of the
 * "outside-the-anchor blindness family" `citation-number-truncated-
 * outside-anchor`'s own `reason` names as its fourth instance. Neither
 * rule touches a link's target: both move existing bytes back inside
 * the tag that already carries the address, which is why both are
 * `apply`-safe without any `allows` — nothing is invented, only
 * relocated.
 *
 * ## `superscriptInsideAnchor`
 *
 * `superscript-subsection-stranded-outside-anchor`: a printed
 * sub-section superscript sits immediately after the anchor's own
 * `</a>` instead of inside it — `…Gen. R. s. 7</a><sup>7</sup>` reads
 * as if the superscript were ordinary text following the citation,
 * when it is the citation's own sub-section number. Measured
 * **182 occurrences / 160 entries**, corpus-wide, recursive through
 * `sense.senses` — the catalogue's own corrected figure (its `reason`
 * records the same two numbers after two rounds of measurement) and
 * reproduced independently here by walking every `definition` field for
 * the literal three-token shape `<sup>`, one text token, `</sup>`,
 * immediately following an anchor's close with no intervening token.
 *
 * **Confined to letters T, U and V.** The catalogue's `reason` claims
 * this; `stranded-tail.test.ts`'s corpus tier ASSERTS it against a
 * fresh walk rather than assuming it, because a claim the row makes
 * about the corpus is exactly the kind of claim this batch exists to
 * test, not inherit. The predicate itself carries no letter check —
 * confinement is a fact this rule's population happens to have, not a
 * condition it enforces, so a future corpus edit that broke the
 * confinement would show up as a test failure naming the letter, not
 * as a silently narrowed rule.
 *
 * The superscript's own text is never inspected for content: the shape
 * check is purely structural (three tokens, that order, immediately
 * after the close), and every corpus occurrence happens to hold a bare
 * number, but nothing here requires that.
 *
 * ## `truncatedCitationDigit`
 *
 * `citation-number-truncated-outside-anchor`: an anchor's own display
 * stops one or more digits short of the printed number, stranding the
 * remainder as bare text immediately after `</a>` — `<a>…B. Kam. XI,
 * 2</a>8` prints as "…XI, 28" but the link's display reads "…XI, 2".
 * Measured **14 occurrences / 14 entries**, corpus-wide, matching the
 * catalogue exactly. Requires two things at once: the anchor's own
 * display (tags stripped) ends in a digit, and the text token
 * immediately following `</a>` begins with one or more digits — a
 * corpus scan found runs of 1 and 2 stranded digits (`8`, `19`, `56`),
 * so the leading run is taken to its full length rather than one
 * character, and the text token is SPLIT: the leading digit run moves
 * inside the anchor, and any remainder stays outside exactly where it
 * was, now immediately after the anchor's `</a>`.
 *
 * **Correction (fix round 1):** an earlier draft of this paragraph
 * claimed "11 of 14 occurrences have [a remainder] — more text
 * follows the stranded digits". Measured over all 14: **14 of 14 carry
 * a non-empty remainder**, not 11 — there is no empty-remainder
 * minority in this corpus. The `remainder.length > 0 ? […] : []` arm
 * in `digitMoveAt` below is therefore DEFENSIVE, not a documented
 * corpus case: it is exercised only by this file's synthetic fixture
 * (`ib. …2</a>8` with nothing after the `8`), never by a real
 * occurrence, and should be read that way rather than as evidence of a
 * 3-occurrence slice that does not exist.
 *
 * **It declines a sense marker.** A stranded run closed by `)` —
 * `</a>2)` — is Jastrow's printed sense number and not a citation
 * tail, and moving it inside would write a citation the source never
 * printed. Added at registration (batch 4 task 7) against a live case
 * the composed pipeline manufactures and this rule alone never sees:
 * `digitMoveAt`'s own docstring carries the entry, the census that
 * says the refusal costs nothing on the 14, and the fail-closed
 * trade-off it accepts.
 *
 * **One of the 14 is only partially repaired: O01464.** Its text reads
 * `… Ned. 5</a>5ᵇ, [read as:] …` — a folio-side superscript `ᵇ`
 * immediately follows the stranded digit. `digitMoveAt` moves the
 * leading digit run (`5`) and stops, so the result is
 * `Ned. 55</a>ᵇ, …`: the number is now correct but `ᵇ` — which was
 * already outside the anchor before this rule ran — is left stranded
 * exactly where it was. That is plan-consistent (this rule's shape is
 * digits only, per the brief), not a regression, and not a new defect
 * this rule introduces; it is recorded here so the residue is a known
 * limit of this row's repair rather than a surprise on a later read.
 *
 * **Deliberately leaves `data-ref` reading the truncated number.** The
 * correctly-resolved address is a Sefaria lookup on the REPAIRED
 * display text, and inferring that lookup result is not this rule's
 * job — Sefaria resolution is a compile-time concern (Task 6's), not a
 * transform's, and a transform rule that guessed a `data-ref` would be
 * inventing a target from nothing in the input. What this rule writes
 * is the one thing print actually supplies: the full display text, the
 * digit put back where Jastrow set it. The rendered mismatch between
 * that corrected display and the still-truncated `data-ref` is the
 * row's own known residue, not an oversight here.
 *
 * ## Shared shape
 *
 * Both rules are the same move, differing only in what qualifies as
 * the stranded run: take a token run sitting immediately after an
 * anchor's `</a>` and re-insert it before that `</a>`, leaving the
 * anchor's own opening tag — and so its `href`/`data-ref` — completely
 * untouched. Both refuse an anchor that is malformed, sits inside
 * another tag's damaged attribute interior, or is unclosed, the same
 * three refusals `links.ts`'s `assertUsable` names and `unlink.ts`'s
 * `usable` checks without throwing (restated here rather than
 * imported, since `unlink.ts`'s copy is private — the same choice
 * `misc-links.ts` makes for the same check).
 *
 * Both operate on the token stream (`tokenize`/`serialize`), never on
 * regex over raw HTML: an attribute value containing a literal `</a>`
 * exists in this corpus (`links.ts`'s own module doc), and a
 * string-level scan for a closing tag would be fooled by it. Neither
 * rule adds or removes an `<a>`/`</a>` — anchor count is unchanged by
 * construction, and the tag-balance axis `markup.ts`'s `checkMarkup`
 * measures cannot regress: the superscript move re-nests an existing
 * balanced pair one level deeper without touching either tag's name or
 * closure, and the digit move touches no tag at all.
 *
 * `TransformResult.records` carries one record per OCCURRENCE moved,
 * not one per definition touched — a DEFINITION holding two stranded
 * tails produces two records, and for the superscript row 14
 * DEFINITIONS do (154 hold exactly one) — because the corpus tier
 * below sums `records.length` as the occurrence count the catalogue
 * rows are stated in. Stated at the ENTRY level instead (the unit
 * `corpusCount` uses), the superscript row's 160 entries split 140
 * with 1 occurrence, 18 with 2, and 2 with 3 — 140 + 36 + 6 = 182,
 * matching the occurrence total above. (Corrected in fix round 1: an
 * earlier draft named "14 corpus entries" here, which mixed the
 * definition-level and entry-level counts under one unit.)
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import type { Token } from '../html.ts';
import { serialize, tokenize } from '../html.ts';
import type { Anchor } from '../links.ts';
import { anchors } from '../links.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

// Hoisted per lint/performance/useTopLevelRegex.
const LEADING_DIGITS_RE = /^(?<digits>\d+)/u;
const DISPLAY_ENDS_DIGIT_RE = /\d$/u;
/** A stranded digit run closed by `)` is a SENSE MARKER, not a
 * citation tail — see `digitMoveAt`'s refusal. */
const SENSE_MARKER_RE = /^\)/u;

/** The same three refusals `links.ts`'s `assertUsable` throws on,
 * checked here (as `unlink.ts`'s private `usable` does) so a rule's
 * predicate can skip such an anchor rather than crash on it: this
 * module never calls `retarget`/`unlink`, so it never gets that
 * assertion for free. */
function usable(anchor: Anchor): boolean {
	return !(anchor.malformed || anchor.interior) && anchor.close !== -1;
}

/**
 * Whether `anchor`'s `</a>` is immediately followed by `<sup>`, one
 * text token, `</sup>` — with nothing between the anchor's close and
 * the `<sup>` open, and nothing but that one text token inside the
 * `<sup>`…`</sup>` pair. Returns the token stream with that three-token
 * run moved to just before the anchor's `</a>`, or `undefined` when the
 * shape does not match at this anchor.
 */
function superscriptMoveAt(
	tokens: readonly Token[],
	anchor: Anchor,
): Token[] | undefined {
	const { close } = anchor;
	const supOpen = tokens[close + 1];
	if (supOpen?.kind !== 'tag' || supOpen.close || supOpen.name !== 'sup') {
		return;
	}
	const supText = tokens[close + 2];
	if (supText?.kind !== 'text') {
		return;
	}
	const supClose = tokens[close + 3];
	if (supClose?.kind !== 'tag' || !supClose.close || supClose.name !== 'sup') {
		return;
	}
	return [
		...tokens.slice(0, close),
		supOpen,
		supText,
		supClose,
		tokens[close] as Token,
		...tokens.slice(close + 4),
	];
}

/**
 * Whether `anchor`'s own display ends in a digit and its `</a>` is
 * immediately followed by a text token beginning with one or more
 * digits. Returns the token stream with the leading digit run spliced
 * inside the anchor and any remainder of that text token left in place
 * immediately after it, or `undefined` when the shape does not match.
 *
 * ## THE SENSE-MARKER REFUSAL, added at registration (batch 4 task 7)
 *
 * A digit run closed by `)` — `</a>2)` — is declined. It is Jastrow's
 * printed SENSE NUMBER, not the tail of the citation before it, and
 * swallowing it writes a citation the source never printed.
 *
 * This is not a hypothetical. The rule measures 14 occurrences on the
 * pinned snapshot and the migration composes it AFTER `applyRepairs`,
 * where `rejoin-chopped` folds a phantom `2)` back into the preceding
 * flow — and in S01040 it lands immediately behind
 * `<a … data-ref="Genesis 4:2">Gen. IV, 2</a>`. Without this refusal
 * the pipeline (never `bun transform:count`, which runs every rule
 * alone against the raw snapshot) produced
 * `<a … data-ref="Genesis 4:2">Gen. IV, 22</a>)`: a link whose display
 * reads a verse the entry does not cite, pointing at the verse it
 * does. A 15th member of this population, MANUFACTURED by an earlier
 * pass, and the only one the reader would have been misled by.
 *
 * The refusal costs nothing measurable and the census is why it is
 * phrased this narrowly. Over all 32,512 raw entries the remainder
 * after the digit run is ` ` (4), ` (`, ` I`, ` t`, ` נ`, `, `, `.]`,
 * `.—`, `; ` (2) and `ᵇ,` — 14 of 14, and NOT ONE begins with `)`. The
 * single `)` in the corpus is S01040's, and only after repairs.
 *
 * FAIL-CLOSED, deliberately, and the cost is stated rather than
 * hidden: a genuine `(cmp. B. Kam. XI, 2</a>8)` would be declined too,
 * and this corpus holds none. Declining leaves the defect exactly as
 * it was; moving wrongly invents a citation. Those are not
 * symmetrical, so the tie goes to declining.
 */
function digitMoveAt(
	tokens: readonly Token[],
	anchor: Anchor,
): Token[] | undefined {
	if (!DISPLAY_ENDS_DIGIT_RE.test(anchor.display)) {
		return;
	}
	const { close } = anchor;
	const tail = tokens[close + 1];
	if (tail?.kind !== 'text') {
		return;
	}
	const digits = LEADING_DIGITS_RE.exec(tail.value)?.groups?.['digits'];
	if (digits === undefined) {
		return;
	}
	const remainder = tail.value.slice(digits.length);
	if (SENSE_MARKER_RE.test(remainder)) {
		return;
	}
	const lead: Token = { kind: 'text', rtl: tail.rtl, value: digits };
	const rest: Token[] =
		remainder.length > 0
			? [{ kind: 'text', rtl: tail.rtl, value: remainder }]
			: [];
	return [
		...tokens.slice(0, close),
		lead,
		tokens[close] as Token,
		...rest,
		...tokens.slice(close + 2),
	];
}

/** The first usable anchor in `tokens` for which `moveAt` finds a move,
 * applied — or `undefined` when no usable anchor qualifies. A top-level
 * function per lint/nursery/noLoopFunc, matching `unlink.ts`'s
 * `firstUsableMatch`: the caller reassigns its own token array on every
 * iteration, and a closure declared inside that loop would be rebuilt
 * on every pass for no benefit. */
function firstMove(
	tokens: readonly Token[],
	moveAt: (tokens: readonly Token[], anchor: Anchor) => Token[] | undefined,
): Token[] | undefined {
	let found: Token[] | undefined;
	for (const anchor of anchors(tokens)) {
		if (!usable(anchor)) {
			continue;
		}
		found = moveAt(tokens, anchor);
		if (found !== undefined) {
			break;
		}
	}
	return found;
}

/**
 * Repeatedly apply `moveAt` to `definition`'s token stream until no
 * usable anchor qualifies, returning the final text and how many times
 * it moved. Re-derives `anchors(tokens)` fresh on every pass (inside
 * `firstMove`) rather than computing them once up front: a move
 * changes token positions — inserting three tokens before an anchor's
 * close shifts that anchor's own `close` index, and splitting a text
 * token shifts everything after it by one — so an index computed
 * before one move does not necessarily still name the same token after
 * it. `unlink.ts`'s `unlinkMatching` documents the bug this exact
 * shortcut caused there; re-deriving is the same fix applied here from
 * the start rather than after a regression.
 *
 * One call moves at most one occurrence per pass, so the loop's
 * iteration count IS the occurrence count for this one definition —
 * `moveOverDefinitions` below turns that into one `TransformRecord` per
 * occurrence, which is what lets the corpus tier sum `records.length`
 * as the occurrence total the catalogue rows are stated in.
 */
function moveMatching(
	definition: string,
	moveAt: (tokens: readonly Token[], anchor: Anchor) => Token[] | undefined,
): { moves: number; text: string } {
	let next: readonly Token[] = tokenize(definition);
	let moves = 0;
	for (;;) {
		const moved = firstMove(next, moveAt);
		if (moved === undefined) {
			break;
		}
		next = moved;
		moves += 1;
	}
	return { moves, text: moves === 0 ? definition : serialize(next) };
}

/** The per-call state `moveSense`/`moveSenses` thread through the
 * recursive walk, bundled into one object rather than passed as four
 * separate parameters so neither function trips
 * lint/style/useMaxParams. */
interface MoveContext {
	moveAt: (tokens: readonly Token[], anchor: Anchor) => Token[] | undefined;
	records: TransformRecord[];
	rid: string;
	ruleId: string;
}

/** Push one `TransformRecord` per occurrence `moveMatching` moved in one
 * definition — never one record for the whole definition regardless of
 * how many times it moved — which is what lets the corpus tier sum
 * `records.length` as an occurrence count rather than a
 * definitions-touched count (see `moveMatching`'s doc). */
function pushOccurrenceRecords(
	ctx: MoveContext,
	detail: string,
	moves: number,
): void {
	for (let i = 0; i < moves; i += 1) {
		ctx.records.push({ detail, rid: ctx.rid, ruleId: ctx.ruleId });
	}
}

/** Rewrite one sense's own `definition`, recursing into `sense.senses`
 * when present — senses NEST, the same shape `unlink.ts`'s
 * `unlinkOverDefinitions` and `misc-links.ts`'s `rewriteOverDefinitions`
 * each walk for the same reason. Neither is reusable here: the former
 * REMOVES anchors and the latter pushes one record per definition
 * touched rather than one per occurrence, which this rule's corpus tier
 * needs `records.length` to count instead (see `moveMatching`'s doc). */
function moveSense(sense: SourceSense, ctx: MoveContext): SourceSense {
	let { definition } = sense;
	if (definition !== undefined) {
		const { moves, text } = moveMatching(definition, ctx.moveAt);
		if (moves > 0) {
			definition = text;
			pushOccurrenceRecords(ctx, text, moves);
		}
	}
	return {
		...sense,
		...(definition === undefined ? {} : { definition }),
		...(sense.senses === undefined
			? {}
			: { senses: moveSenses(sense.senses, ctx) }),
	};
}

/** `moveSense` mapped over one level of `senses`. Split from
 * `moveSense` (rather than a closure declared inside it) so the
 * recursion reads as two named functions calling each other instead of
 * a self-referential closure — and so `moveOverDefinitions` has one
 * entry point to call with the entry's top-level senses. */
function moveSenses(
	senses: readonly SourceSense[],
	ctx: MoveContext,
): SourceSense[] {
	return senses.map((sense) => moveSense(sense, ctx));
}

/**
 * Rewrite every definition in the entry, recursing through nested
 * senses via `moveSenses`/`moveSense`, and return the accumulated
 * records alongside a new entry — or the input entry unchanged when
 * nothing moved, satisfying `Rule.apply`'s "same reference when
 * unchanged" contract.
 */
function moveOverDefinitions(
	entry: SourceEntry,
	ruleId: string,
	moveAt: (tokens: readonly Token[], anchor: Anchor) => Token[] | undefined,
): TransformResult {
	const records: TransformRecord[] = [];
	const rewritten = moveSenses(entry.content.senses, {
		moveAt,
		records,
		rid: entry.rid,
		ruleId,
	});
	return {
		entry:
			records.length === 0
				? entry
				: { ...entry, content: { ...entry.content, senses: rewritten } },
		records,
	};
}

/**
 * A printed sub-section superscript (`</a><sup>N</sup>`) pulled inside
 * its anchor, becoming `<sup>N</sup></a>`. The link's own `href` and
 * `data-ref` are never touched — see the module doc's "Confined to
 * letters T, U and V" for the measured population and why the
 * confinement is asserted rather than encoded in this predicate.
 */
const superscriptInsideAnchor: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		moveOverDefinitions(
			entry,
			'superscript-subsection-stranded-outside-anchor',
			superscriptMoveAt,
		),
	id: 'superscript-subsection-stranded-outside-anchor',
	phase: 'text-repairs',
};

/**
 * A citation anchor's truncated trailing digit(s), stranded just past
 * its `</a>`, moved inside — `<a>…XI, 2</a>8` becomes `<a>…XI, 28</a>`.
 * The anchor's `data-ref` is deliberately left reading the truncated
 * number; see the module doc's "Deliberately leaves `data-ref`" section
 * for why resolving the correct address is out of this rule's scope.
 */
const truncatedCitationDigit: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		moveOverDefinitions(
			entry,
			'citation-number-truncated-outside-anchor',
			digitMoveAt,
		),
	id: 'citation-number-truncated-outside-anchor',
	phase: 'text-repairs',
};

export {
	digitMoveAt,
	superscriptInsideAnchor,
	superscriptMoveAt,
	truncatedCitationDigit,
};
