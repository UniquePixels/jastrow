import type { SourceEntry } from '../../body/types.ts';
import { mapFields } from '../fields.ts';
import { stripTags } from '../no-new-text.ts';
import type { Rule, TransformResult } from '../types.ts';

/**
 * `italic-swallows-close-paren` (Task 6) — 8 genuine of 10 raw
 * occurrences / 10 entries, and the ONE row of batch 3b's four
 * escalation rows that turned out repairable.
 *
 * An italic run swallows the closing paren of a parenthetical opened
 * in plain text BEFORE the tag, so the `(` is set in roman type and
 * its `)` in italic. The repair moves the paren out of the run and,
 * where gloss text follows it, reopens the run after it:
 * `<i>def) ghi</i>` → `<i>def</i>) <i>ghi</i>`.
 *
 * ## CLASS A, not Class B: this rule inserts nothing
 *
 * The task-6 brief calls the split Class B, "which inserts one space,
 * so it declares `copied: [' ']` per insertion under ruling R2". It
 * does not insert one. The space between the moved `)` and the
 * reopened run is the TAIL'S OWN leading space, lifted from inside
 * the run to outside it — all 6 split members already carry it — and
 * where a tail carries none, none is created. `no-new-text.ts` strips
 * tags before comparing, so this rule's text multiset is identical
 * before and after in every case, by construction. Declaring
 * `copied: [' ']` would therefore be a claim about bytes the rule
 * never writes, in a permanent record, which is this branch's named
 * recurring defect; the declaration is omitted and the corpus tier
 * asserts the text equality instead.
 *
 * Emitting `<i>def</i>) <i> ghi</i>` — the literal reading of the
 * brief, keeping the tail's space inside the reopened run and adding
 * a second one outside — would insert a real space AND hand
 * `emphasis-run-edge-space` (304) six new `<i>␣` members, a defect in
 * another catalogued row's locus. Declined for that reason, and the
 * corpus tier pins that row's population unchanged.
 *
 * ## Where the defect count lives, and why "text unchanged" is the
 * POINT here rather than the failure
 *
 * Under the ruling of 2026-08-25 (Brian) a repair for a rendered harm
 * must fix the rendered text, and three rules on this branch shipped
 * green while repairing nothing a reader could see. Read carelessly,
 * "this rule leaves the text byte-identical" is a confession of
 * exactly that failure. It is not, and the difference is worth being
 * explicit about, because a reviewer who conflates the two will
 * reject this rule for the wrong reason.
 *
 * Task 4's em-dash rule was a TEXT repair whose text output did not
 * change: it claimed to close a seam a reader could see, fired 278
 * times, and left the rendered output identical — the claim and the
 * effect disagreed. This row's harm was never in the characters. Its
 * `description` is "an italic run SWALLOWS the closing paren", and
 * what a reader sees is a `)` set in italic type while the `(` it
 * closes is roman. That is a STYLING defect, and the repair moves the
 * paren across a tag boundary — the tag is the whole of the defect
 * and the whole of the fix, so the character sequence has no business
 * changing. A version of this rule that DID change the text would be
 * inventing or destroying characters.
 *
 * So the defect count is measured where the defect lives, on the
 * MARKUP: italic runs holding a surplus `)` go **10 → 2** corpus-wide
 * (the 2 survivors being the convention members below) and the
 * shipped population goes **8 → 0**. `italic-paren-corpus.test.ts`
 * asserts that as a DELTA, never as an invariant, and pairs the
 * text-equality assertion with `touched.toHaveLength(8)` so a no-op
 * cannot satisfy both — the equality is there to discriminate this
 * construction from the space-inserting one the brief proposed, not
 * to certify that nothing happened.
 *
 * ## TWO OF THE TEN ARE NOT DAMAGE
 *
 * The row's audit: "2 of the 10 raw hits are not paren damage but
 * lettered sub-sense markers 'a)' inside an italic — CONVENTION."
 * They are Q01198 (`<i>a) for appearance sake, formally</i>`) and
 * S02102 (`<i>any projection, point; a) beam, ray.</i>`), so the
 * marker is excluded at a run's head AND mid-run, not just at the
 * head. `SUBSENSE_MARKER` declines a LONE Latin letter before the
 * paren — never any letter, which would decline `roll)`, `join)` and
 * six other genuine members. The row is written back 10 → 8.
 *
 * ## The falsifier, reproduced
 *
 * If Jastrow's print set the paren inside the italic type, the
 * reverse polarity would appear too. Measured on the pinned snapshot:
 * 47,073 italic runs, 47,063 paren-balanced, **10 with a surplus `)`
 * and 0 with a surplus `(`**. A 0.02% one-directional tail is what a
 * boundary-drift defect predicts and what a print convention cannot.
 * (The catalogue's 47,028 / 46,990 counted runs with a tag-free body;
 * allowing inner markup, as U01849 requires, gives these figures and
 * recovers the catalogued 10 exactly. Both are OCCURRENCE counts, and
 * here they equal the entry count.)
 *
 * ## The standing check: three catalogued siblings, all declined
 *
 * The row's own `reason` names this the "italic-side mirror" of three
 * rows, and each could be spelled with the characters this rule
 * matches. All three are declined by PREDICATE, in any registration
 * order, and each decline is pinned by a test:
 *
 * - `open-paren-in-anchor-display` (214) and `open-paren-in-rtl-span`
 *   (89) are the OPEN polarity — a surplus `(` inside the tag with
 *   its closer outside. This rule fires only on a surplus `)`, and
 *   the corpus holds 0 runs of the other polarity anyway, so the
 *   decline is fail-closed against composition rather than a live
 *   population.
 * - `anchor-swallows-close-paren` (494) is the same polarity in a
 *   different tag — `(<a>ROMAN), N</a>` — and an anchor CAN sit
 *   inside an italic run (U01849's does). `swallowedParenAt` returns
 *   -1 when the surplus paren falls inside an anchor display, so a
 *   `(<i><a>VI), 13</a></i>` spelling stays that row's whole
 *   property. 0 of today's 10 need it.
 *
 * Disjoint from this module's own three space-inserting seam rules by
 * construction: theirs match a paren ADJACENT to a tag from outside
 * (`)<i>`, `)</a><i>`, `</i>(`), this one a paren INSIDE a run's body
 * with text on both sides of the tag boundary it moves.
 */

/** An italic run with its whole body, inner markup included — the
 * walk stops at the first `<i>` or `</i>`, so a body may carry an
 * anchor or an rtl span but never a nested run. */
const ITALIC_RUN = /<i>(?<body>(?:(?!<\/?i>)[\s\S])*)<\/i>/gu;

/** Tags and text in order, so paren depth is counted over TEXT only:
 * an attribute value may hold a paren and must never close one. */
const SEGMENT = /<[^>]*>|[^<]+/gu;

/** An opening anchor tag, for the `anchor-swallows-close-paren`
 * decline. */
const ANCHOR_OPEN = /^<a\b/u;

/** A LONE Latin letter immediately before the paren — `a)` at a run's
 * head or after a separator. The lettered sub-sense marker the row's
 * audit calls convention, and the whole of the 10 → 8 exclusion. */
const SUBSENSE_MARKER = /(?:^|[\s;,.:—])[A-Za-z]$/u;

/** Whether a remainder is gloss text rather than trailing
 * punctuation. A punctuation-only remainder gets no run of its own —
 * `<i>.—</i>` would be a new `italic-lone-punctuation` member.
 *
 * Applied to `stripTags(rest)`, never to raw `rest`. `ITALIC_RUN`'s
 * body class excludes only `<i>`/`</i>`, so a run body — and therefore
 * a remainder — may legitimately carry an anchor or an rtl span
 * (`swallowedParenAt`'s docstring says so, and U01849 is the live
 * case). Against raw bytes a letter in a tag NAME or an ATTRIBUTE
 * would read as gloss text: `</a>` alone would score, and
 * `<span dir="rtl"></span>` would make an empty remainder look
 * glossed, reopening a run around nothing.
 *
 * MEASURED, so the guard is not mistaken for a live repair: of the 8
 * members that reach this test corpus-wide, **0** carry any markup in
 * the remainder at all, and **0** decide differently raw vs stripped.
 * The whole-corpus output is byte-identical with the strip and without
 * it, alone and composed through the registry. This is fail-closed
 * hardening against a re-fetch, in the same spirit as the
 * `(?![.,;:?!])` declines in `seam-space.ts` — resolve by
 * construction, so the answer does not depend on what today's corpus
 * happens not to contain. */
const HAS_LETTER = /\p{L}/u;

/** The remainder's own leading whitespace, which moves outside the
 * run with the paren instead of being duplicated. */
const LEADING_SPACE = /^\s*/u;

/** A walk's running state: how deep inside the run's own parens we
 * are, how deep inside an anchor display, and the offset found. */
interface ParenScan {
	anchors: number;
	at: number;
	depth: number;
}

/** Anchor nesting, tracked so a surplus paren inside an anchor display
 * can be declined to `anchor-swallows-close-paren`. */
function scanTag(chunk: string, scan: ParenScan): void {
	if (ANCHOR_OPEN.test(chunk)) {
		scan.anchors += 1;
	} else if (chunk === '</a>') {
		scan.anchors -= 1;
	}
}

/** Whether this text chunk holds the surplus paren, writing its offset
 * (or -1, for an anchor's own) into `scan.at`. */
function scanText(chunk: string, base: number, scan: ParenScan): boolean {
	for (let at = 0; at < chunk.length; at += 1) {
		if (chunk[at] === '(') {
			scan.depth += 1;
		} else if (chunk[at] === ')') {
			if (scan.depth === 0) {
				scan.at = scan.anchors > 0 ? -1 : base + at;
				return true;
			}
			scan.depth -= 1;
		}
	}
	return false;
}

/**
 * The offset in `body` of a close paren whose opener sits outside the
 * run, or -1 for none — including the case where the paren sits
 * inside an anchor display, which is `anchor-swallows-close-paren`'s.
 */
function swallowedParenAt(body: string): number {
	const scan: ParenScan = { anchors: 0, at: -1, depth: 0 };
	for (const segment of body.matchAll(SEGMENT)) {
		const [chunk] = segment;
		if (chunk.startsWith('<')) {
			scanTag(chunk, scan);
		} else if (scanText(chunk, segment.index ?? 0, scan)) {
			return scan.at;
		}
	}
	return -1;
}

/** One run, repaired — or handed back unchanged when it is balanced,
 * is a lettered sub-sense marker, belongs to a sibling row, or would
 * leave an empty run behind. */
function moveParenOut(whole: string, body: string): string {
	const at = swallowedParenAt(body);
	if (at < 0) {
		return whole;
	}
	const head = body.slice(0, at);
	if (head.trim() === '' || SUBSENSE_MARKER.test(head)) {
		return whole;
	}
	const tail = body.slice(at + 1);
	const space = LEADING_SPACE.exec(tail)?.[0] ?? '';
	const rest = tail.slice(space.length);
	return HAS_LETTER.test(stripTags(rest))
		? `<i>${head}</i>)${space}<i>${rest}</i>`
		: `<i>${head}</i>)${tail}`;
}

/** A close paren an italic run swallowed from a parenthetical opened
 * before the tag — see the docstring above for the 10 → 8 convention
 * exclusion, the 0-of-47,073 falsifier, and the three declines. */
const italicSwallowsCloseParen: Rule = {
	apply(entry: SourceEntry): TransformResult {
		let moved = 0;
		const healed = mapFields(entry, (text) =>
			text.replaceAll(ITALIC_RUN, (whole: string, body: string) => {
				const out = moveParenOut(whole, body);
				if (out !== whole) {
					moved += 1;
				}
				return out;
			}),
		);
		if (healed === undefined) {
			return { entry, records: [] };
		}
		return {
			entry: healed,
			records: [
				{
					detail: `${moved} swallowed close paren(s) moved outside their italic run`,
					rid: entry.rid,
					ruleId: 'italic-swallows-close-paren',
				},
			],
		};
	},
	id: 'italic-swallows-close-paren',
	phase: 'text-repairs',
};

export { italicSwallowsCloseParen };
