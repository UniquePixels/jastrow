/**
 * `unterminated-href-swallows-closing-tag` (batch-4 task 5).
 *
 * Two anchors in the corpus — D00478 and J00597, and no others — open
 * an `href` quote they never close. The `</a>` that should have
 * followed the tag supplies the tag's own `>` instead, so `html.ts`
 * reads the opening tag as MALFORMED (`opensScope` is false: the tag
 * body holds another `<`) and everything after it as the tail of that
 * tag's attribute value rather than as document markup. The
 * cross-reference the tag was written to carry is invisible to every
 * consumer: the parser reports `href: ''` and `data-ref: ''`, because
 * neither attribute has a closing quote to parse against.
 *
 * ## Why this row must run FIRST
 *
 * `links.ts` marks every anchor trapped in an unrecovered
 * `attributeInterior` region as `interior`, and BOTH of its editors
 * refuse those outright. In J00597 that is twelve anchors — the
 * entire corpus-wide `interior` population, all of them in that one
 * entry, all of them behind this one tag. No other rule can reach
 * them until this one runs. TASK 7 MUST PLACE THIS RULE FIRST in
 * `registry.ts`'s `RULES`: it shares the `text-repairs` phase with
 * every other rule (`structural-repairs` runs AFTER `text-repairs`
 * per `admin/pipeline/patch/apply.ts:56-57`, which is the wrong side
 * of every rule that edits an anchor this one frees), so ordering
 * within the phase is the only thing that sequences it.
 *
 * ## Two shapes, one defect
 *
 * The damage is the same missing quote in both entries; what differs
 * is how much of the tag survived it.
 *
 * **D00478 — the tag's tail is intact.** The bytes read
 * `…v. <a dir="rtl" … href="/Jastrow,_כָּלוּל.1</a>" data-ref="Jastrow, כָּלוּל 1">כָּלוּל</a>.`
 * — the closing quote, the `data-ref` and the `>` are all still
 * there, just after the swallowed `</a>`. So the repair is a pure
 * REORDERING: lift the `</a>` out of the attribute and put it back
 * where it was taken from, immediately before the `<a>` that absorbed
 * it, which is exactly where the enclosing (and currently unclosed)
 * `Mekhilta` anchor should have ended. Not one byte is added or
 * dropped.
 *
 * **J00597 — the tag's tail is gone.** The bytes read
 * `(cmp. <a dir="rtl" … href="/Jastrow,_דִּלְדֵּל.1</a><a class="refLink" href="/Bava_Metzia.38b" …>`
 * — the quote, the `data-ref` and the `>` were lost with the damage,
 * so reordering alone cannot produce a tag. The missing markup is
 * reconstructed from a WITNESS: the same anchor occurs intact later in
 * the very same definition,
 * `<a dir="rtl" class="refLink" href="/Jastrow,_דִּלְדֵּל.1" data-ref="Jastrow, דִּלְדֵּל 1">דִּלְדִּל</a>`,
 * and its `data-ref` is matched to the damaged tag by an exact `href`
 * equality. With no such witness the rule declines the instance and
 * leaves the field alone — fail-closed, so a third instance appearing
 * after a source re-fetch is repaired when the evidence is there and
 * skipped when it is not, never guessed at and never a crash.
 *
 * ## What this rule deliberately does NOT do
 *
 * - **It writes no display text.** The J00597 repair yields an anchor
 *   with an EMPTY display, because the witness's display (`דִּלְדִּל`) is
 *   TEXT and copying it would add codepoints. Every byte this rule
 *   introduces is markup, which `no-new-text.ts` strips before
 *   counting, so the text multiset only ever SHRINKS and the rule
 *   needs no `allows` and no `copied`. Restoring the display would be
 *   a `copied` declaration and a separate maintainer ruling; it is
 *   flagged in the task report rather than taken here.
 * - **It does not close J00597's OTHER unclosed anchor.**
 *   `/Shir_HaShirim_Rabbah.1` (token 93) simply has no `</a>` anywhere
 *   in the source — one of the corpus's three `close === -1` anchors,
 *   a different catalogue row. This rule moves bytes that exist; it
 *   does not mint a closing tag.
 * - **It does not touch J00597's duplicated run.** That definition
 *   repeats a long passage almost verbatim; that is
 *   `adjacent-verbatim-repetition` / `duplicated-definition-opening-run`,
 *   both declined from batch 4 by the scope ruling of 2026-08-26.
 *
 * ## The population is two, pinned by IDENTITY
 *
 * `malformed-href.test.ts`'s corpus tier asserts the fired rids are
 * exactly `['D00478', 'J00597']`, not that there are two of them. A
 * count alone would let a widened predicate swap one member for
 * another and still pass.
 *
 * ## The link-target gate does NOT license D00478 — measured, not assumed
 *
 * `link-target.ts` builds its input target set from the input's PARSED
 * anchors, and the whole nature of this defect is that the damaged
 * tag's attributes do not parse: D00478's malformed anchor reads
 * `href: ''`, `data-ref: ''`. So `/Jastrow,_כָּלוּל.1` and
 * `Jastrow, כָּלוּל 1` — which are present in the input as raw BYTES,
 * inside the damaged tag and in the text token behind it — are absent
 * from the set case 1/2 tests membership against, and the repair is
 * reported as a fabrication. Cases 3 and 4 cannot rescue it either:
 * the nearest input target is `Jastrow, כָּלָה 1`, whose common prefix
 * leaves a remainder (`וּל 1`) holding a space and a `1` that the
 * anchor's display (`כָּלוּל`) does not, and no input target ends in that
 * remainder. Case 5 is gershayim-only. This rule therefore DECLARES
 * NOTHING — a false claim would be worse than an honest failure — and
 * `malformed-href.test.ts` PINS the gate's verdict on both entries so
 * the gap is a recorded measurement rather than a surprise at
 * registration time.
 *
 * J00597 is clean by contrast, and for the reason the witness exists:
 * its intact twin puts both spellings in the input's parsed target
 * set, so case 1/2 licenses the repair outright.
 *
 * This is structurally the same gap case 5 was invented to close — a
 * repair whose evidence lives in raw tag bytes the parser cannot read
 * — and closing it needs a gate case, which is a maintainer ruling and
 * not this task's to make.
 */
import type { SourceEntry } from '../../body/types.ts';
import { mapFields } from '../fields.ts';
import { opensScope, tokenize } from '../html.ts';
import { type Anchor, anchors } from '../links.ts';
import { fieldsOf } from '../no-new-text.ts';
import type { Rule, TransformResult } from '../types.ts';

const RULE_ID = 'unterminated-href-swallows-closing-tag';

/**
 * An opening `<a>` tag whose `href` value runs straight into the
 * `</a>` that should have followed the tag.
 *
 * Hoisted per lint/performance/useTopLevelRegex, so every use resets
 * `lastIndex` first. Both character classes exclude `<` and `>`: the
 * match must stop at the FIRST swallowed close, and the attribute run
 * before `href` must stay inside one tag. Only the double-quoted form
 * is matched — all 340,360 corpus attribute values are double-quoted,
 * and a single-quoted instance would be declined rather than
 * mis-repaired.
 */
const DAMAGED = /<a\b[^<>]*\bhref\s*=\s*"(?<url>[^"<>]*)<\/a>/gu;

/** The swallowed close tag, which is always the tail of a `DAMAGED`
 * match by construction. */
const CLOSE = '</a>';

/** Whether the bytes after a `DAMAGED` match complete the tag — the
 * D00478 shape, where the closing quote, the remaining attributes and
 * the `>` all survived just past the swallowed `</a>`. `[^<>]*` keeps
 * the completion inside one tag, so a match here means lifting the
 * `</a>` out yields a well-formed opening tag with no other change. */
const TAG_TAIL = /^"[^<>]*>/u;

/** Attribute values this rule refuses to write into a tag. A witness
 * `data-ref` holding a quote or an angle bracket would produce markup
 * as damaged as what it replaced, so the instance is declined
 * instead. No corpus `data-ref` contains one; the guard is for the
 * re-fetch. */
const UNWRITABLE = /["<>]/u;

/**
 * Anchor nesting depth immediately before byte `index`.
 *
 * A `DAMAGED` tag whose depth is at least one sits inside an anchor
 * that is still open, which is where the swallowed `</a>` came from —
 * that is the precondition for the reordering repair, and without it
 * the repair would emit a stray close tag. Counted with `tokenize`'s
 * own stack discipline (`opensScope`), so an earlier malformed tag
 * contributes nothing rather than a phantom open.
 */
function anchorDepthAt(html: string, index: number): number {
	let depth = 0;
	for (const token of tokenize(html.slice(0, index))) {
		if (token.kind !== 'tag' || token.name !== 'a') {
			continue;
		}
		if (token.close) {
			depth--;
		} else if (opensScope(token.value)) {
			depth++;
		}
	}
	return depth;
}

/**
 * Every `data-ref` the entry's own input can vouch for, keyed by the
 * `href` it was written beside.
 *
 * Built over `fieldsOf` — the entry-wide field enumeration, not one
 * definition — because the witness need only be somewhere in the same
 * entry, and computed ONCE per `apply` rather than per field.
 * Malformed anchors are excluded (their attributes do not parse, so
 * they vouch for nothing) but `interior` ones are NOT: an interior
 * anchor's bytes are genuinely in the input, and `link-target.ts`'s
 * own input set includes them for the same reason. The first witness
 * for a given `href` wins; the corpus offers exactly one.
 */
function witnessesOf(entry: SourceEntry): Map<string, string> {
	const found = new Map<string, string>();
	for (const field of fieldsOf(entry)) {
		for (const anchor of anchors(tokenize(field))) {
			if (anchor.malformed || anchor.href === '' || anchor.dataRef === '') {
				continue;
			}
			if (!found.has(anchor.href)) {
				found.set(anchor.href, anchor.dataRef);
			}
		}
	}
	return found;
}

/** How many of `list` are unusable in each of the two ways this
 * repair is supposed to retire. Compared before and after so a repair
 * that made either worse is discarded. */
function unusableOf(list: readonly Anchor[]): {
	interior: number;
	malformed: number;
} {
	return {
		interior: list.filter((a) => a.interior).length,
		malformed: list.filter((a) => a.malformed).length,
	};
}

/**
 * Whether `after` is an acceptable rewrite of `before`.
 *
 * The rule's own safety net, and the reason a third instance arriving
 * with an unanticipated shape is DECLINED rather than mis-repaired:
 * the rewrite must leave no `href` still carrying a close tag, must
 * not increase either unusable count, and must preserve the anchor
 * count — `link-target.ts` fails outright on `anchor count grew`, and
 * a count that fell would be an undeclared unlink.
 */
function improves(before: string, after: string): boolean {
	const was = anchors(tokenize(before));
	const now = anchors(tokenize(after));
	const wasBad = unusableOf(was);
	const nowBad = unusableOf(now);
	return (
		now.length === was.length &&
		nowBad.malformed <= wasBad.malformed &&
		nowBad.interior <= wasBad.interior &&
		!now.some((anchor) => anchor.href.includes(CLOSE))
	);
}

/**
 * The bytes that replace one `DAMAGED` match, or `undefined` when the
 * instance cannot be repaired from the evidence available.
 *
 * `head` is the match with its swallowed `</a>` removed — an opening
 * tag truncated mid-attribute. The two arms differ only in what has
 * to follow it: the D00478 arm finds the rest of the tag already in
 * the source and only has to relocate the `</a>` ahead of the tag;
 * the J00597 arm has to write the closing quote, the witness
 * `data-ref` and the `>`, then park the same `</a>` immediately after
 * so the anchor closes with an empty display.
 */
function repairOne(
	html: string,
	match: RegExpExecArray,
	witness: ReadonlyMap<string, string>,
): string | undefined {
	const [whole] = match;
	const head = whole.slice(0, whole.length - CLOSE.length);
	const rest = html.slice(match.index + whole.length);
	if (TAG_TAIL.test(rest)) {
		return anchorDepthAt(html, match.index) > 0 ? CLOSE + head : undefined;
	}
	const url = match.groups?.['url'] ?? '';
	const ref = witness.get(url);
	if (ref === undefined || UNWRITABLE.test(ref)) {
		return;
	}
	return `${head}" data-ref="${ref}">${CLOSE}`;
}

/**
 * One field with every repairable instance rewritten, plus a detail
 * line per instance.
 *
 * Returns the input string by reference when nothing was repaired, so
 * `mapFields` can report the entry unchanged and `apply` can hand
 * back the caller's own object. The whole-field `improves` check runs
 * last and discards the rewrite wholesale if it failed, which keeps
 * the fail-closed guarantee at the level a partial repair could
 * otherwise slip past.
 */
function repairField(
	html: string,
	witness: ReadonlyMap<string, string>,
): {
	details: string[];
	text: string;
} {
	if (!html.includes(CLOSE)) {
		return { details: [], text: html };
	}
	const details: string[] = [];
	let out = '';
	let at = 0;
	DAMAGED.lastIndex = 0;
	let match = DAMAGED.exec(html);
	while (match !== null) {
		const repaired = repairOne(html, match, witness);
		if (repaired !== undefined) {
			out += html.slice(at, match.index) + repaired;
			at = match.index + match[0].length;
			details.push(`href ${JSON.stringify(match.groups?.['url'] ?? '')}`);
		}
		match = DAMAGED.exec(html);
	}
	if (details.length === 0) {
		return { details: [], text: html };
	}
	const text = out + html.slice(at);
	return improves(html, text) ? { details, text } : { details: [], text: html };
}

/**
 * `unterminated-href-swallows-closing-tag`: 2 occurrences across 2
 * entries, both in a sense `definition`.
 *
 * Walks every field through `fields.ts`'s `mapFields` rather than a
 * private definition walk — that module is the one WRITER over the
 * field set `no-new-text.ts` reads, so nothing this rule writes can
 * land outside the text gate's view. It recurses through nested
 * senses; a hand-rolled walk that stopped at the top level would be
 * both unmapped and unseen.
 *
 * No `allows`, no `copied`, no `unlinks` and no target claim of any
 * kind: every byte written is markup, no anchor is removed, and the
 * one target the gate does refuse (D00478's) is refused because the
 * gate cannot read the input bytes that prove it — see the module
 * docstring.
 */
const unterminatedHref: Rule = {
	apply(entry: SourceEntry): TransformResult {
		const witness = witnessesOf(entry);
		const details: string[] = [];
		const out = mapFields(entry, (html) => {
			const repaired = repairField(html, witness);
			details.push(...repaired.details);
			return repaired.text;
		});
		if (out === undefined || details.length === 0) {
			return { entry, records: [] };
		}
		return {
			entry: out,
			records: details.map((detail) => ({
				detail,
				rid: entry.rid,
				ruleId: RULE_ID,
			})),
		};
	},
	id: RULE_ID,
	phase: 'text-repairs',
};

export { unterminatedHref };
