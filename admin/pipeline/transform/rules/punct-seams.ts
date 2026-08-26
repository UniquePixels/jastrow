/**
 * `em-dash-section-break-in-own-italic` and its residue,
 * `italic-lone-punctuation`.
 *
 * ## `emDashSectionBreak` is Class C, not Class A — RULING (Brian,
 * 2026-08-25) reclassified it after fix round 1
 *
 * The first version of this rule preserved `stripTags` byte-for-byte,
 * on the belief (inherited from the batch spec's class table and the
 * brief) that this row was Class A — move markup, never touch text.
 * It was measured, and it does nothing a reader can see: 0 of 270
 * entries change their rendered text, because the row's own
 * `description` and `reason` define the defect as the SPACE, not the
 * tag split — *"section em-dash carried into its own italic run, so
 * the tag seam renders 'gloss. — Pl.' where the corpus norm is
 * 'gloss.—Pl.'"* — and quantify it: 230 spaced occurrences across 226
 * entries, against a tight (`.—`) population elsewhere in the corpus.
 * That population is **20,420** by direct occurrence count
 * (`fieldsOf`/`stripTags` over every text field, matching how this
 * gate itself reads text) — not the 20,195 first cited here, which
 * came from a `grep`-based count over the raw JSONL file rather than
 * this gate's own field scope and undercounts by 225. 20,420 is the
 * figure a re-run of the corpus-tier test below actually returns. A
 * rule that keeps the space repairs nothing regardless of which of
 * the two figures it is measured against.
 *
 * The ruling: repair it as a DELETION. The row is Class C. This needs
 * no `allows` — deleting a character is a sub-multiset SHRINK, which
 * `checkNoNewText` permits by construction, the same escape hatch
 * this module's fix-round-1 self-review named and then, under the
 * wrong classification, correctly declined to use.
 *
 * ## Fix round 2: the first deletion consumed the WRONG space
 *
 * Round 1's deletion only removed the space BETWEEN the two `<i>`
 * runs, leaving the space AFTER the merged run's `</i>` untouched —
 * `<i>noble.—</i> Pl.`, which reads `.— Pl.` in rendered text. That is
 * still off-norm: measured corpus-wide, tight `.—` is followed by a
 * space only 59 times out of 20,420 (0.29%) and by a non-space 20,361
 * times (99.71%). Round 1's own cited 19-occurrence precedent for
 * `.—</i> Pl.` is itself inside that 59-count tail, not a second
 * convention — 19 real instances is not nothing, but it is the same
 * minority the row's `reason` field is measuring when it calls `.—`
 * the norm, not an exception to it. The row's norm, stated literally,
 * is `gloss.—Pl.`: zero space, anywhere.
 *
 * One substitution still handles both shapes the catalogued 278
 * cover, but the empty-label branch now also consumes the TRAILING
 * space (the labelled branch never had one — see below):
 *
 * ```
 * BEFORE: <i>noble.</i> <i>—</i> Pl. <span dir="rtl">…
 * AFTER:  <i>noble.—</i>Pl. <span dir="rtl">…
 * ```
 *
 * Real corpus strings, found before writing the replacement:
 *
 * - The 230/278 empty-label shape (`A00144`, `A00667`, …): `.</i>
 *   <i>—</i> Pl.` → `.—</i>Pl.`, zero space on either side of the
 *   dash. This exact tight, no-trailing-space shape has direct (if
 *   rare) precedent corpus-wide (`<i>…wine vessel.—</i>Pl.`), and
 *   matches the corpus-wide norm measured above.
 * - The 48/278 labelled shape (`A02503`, `B00012`, …): `.</i>
 *   <i>—Pl</i>` → `.—Pl</i>`, gloss and label merged into one run
 *   with no separating space — unchanged from round 1, since this
 *   shape never had a trailing space to begin with (the label sits
 *   INSIDE the merged run, immediately before its own `</i>`). This
 *   shape has direct corpus precedent (`<i>the hereafter.—Pl.</i>`,
 *   `<i>vagina.—Fem</i>`, `<i>to extend.—Part. pass.</i>`,
 *   `<i>detached part.—Pl.</i>`, and 7 more — 11 occurrences total,
 *   corrected from round 1's undercount of 8, see below) — Jastrow
 *   writes both the merged-run and the separate-run label
 *   conventions, and the merged one requires no branching in the
 *   replacement, so it is what this rule produces.
 *
 * Measured on the full corpus: the spaced `. —` defect (either shape,
 * read through `stripTags`) in the 270 touched entries goes **278
 * before → 0 after** (widened from round 1's 230, which counted only
 * the empty-label shape). The NEW off-norm shape this round fixes,
 * tight-dash-then-space (`.— `), is unchanged by this rule at **2
 * before → 2 after** — those 2 are `Q01352` and `U00925`'s own
 * PRE-EXISTING, correctly-formed `.—</i> Pl.` text elsewhere in the
 * same entries (one of round 1's own 19-occurrence precedent group),
 * untouched by this rule's edit at a different locus in the same
 * body; the rule creates zero NEW instances of it. `run.ts`'s own
 * gates, re-run directly over all 270 firing entries: `checkNoNewText`
 * 0 problems, `checkMarkup` 0 problems, codepoint multiset delta
 * exactly `{" ": −508}` (230 empty-label occurrences × 2 spaces each,
 * plus 48 labelled × 1 space each = 460 + 48 = 508) and nothing else
 * moves. `punct-seams.test.ts`'s corpus-tier test asserts the 278→0
 * delta and the 2-before/2-after non-creation check directly, rather
 * than an invariant that a no-op rule would also satisfy — see that
 * test's own docstring for why a touch-count vacuity guard alone
 * cannot tell a repair from a reshuffle.
 *
 * ## `italicLonePunctuation` excludes the em-dash by construction,
 * not by running second
 *
 * `italic-lone-punctuation` is catalogued as the RESIDUE of this row:
 * of 259 single-character non-alphanumeric italic runs corpus-wide,
 * 230 are `<i>—</i>` (already `emDashSectionBreak`'s, each preceded
 * by `.</i> `) and 28 are `[.?;]` (this row's). The 259th is
 * `I00129`'s `<i>͗</i>` — U+0357 COMBINING RIGHT HALF RING ABOVE, a
 * diacritic mid-transliteration (`ṭ` + `ûz` + `͗` + `i.ṭuśi`), not
 * punctuation at all. The catalogue's own residue arithmetic (258 − 230
 * = 28) undercounted by one lone-punctuation-looking non-match; its
 * `corpusCount` of 29 is one more than its own `reason` field's stated
 * breakdown (`. x21, ? x5, ; x2` sums to 28). 28 is correct; see
 * task-4-report.md for the full reconciliation Task 7 should write
 * back.
 *
 * `LONE_PUNCTUATION`'s character class is `[.?;]` — it has no way to
 * match an em-dash, or a combining mark, at all, in either
 * registration order, so the exclusion holds even if this rule ran
 * alone, or first, or against a corpus this file has never seen.
 * `checkAdjacency()` only reads `entangledWith` and this pair carries
 * no such edge (spec §8), so the disjointness has to live in the
 * predicate, not in registry position or in a comment promising it
 * does.
 *
 * One of the 21 periods is `B00957`'s `esp<i>.</i>` — the exact case
 * `rules/italic-period.ts`'s empty-body guard declines rather than
 * claims, because unwrapping it is this row's job, not
 * `italicGlossPeriodOutside`'s. This rule performs exactly that
 * unwrap: `esp<i>.</i>` → `esp.`, restoring the abbreviation's own dot
 * to plain text beside the word it belongs to.
 *
 * ## REGISTRY-ORDER HAZARD, measured: `emDashSectionBreak` must run
 * before `italic-swallowed-terminal-period` — NOT before
 * `label-period-outside-italic`, which never touches this seam
 *
 * `SECTION_BREAK` needs its input's first run to still read
 * `<i>gloss.</i>` — period INSIDE, immediately before `</i>`. That is
 * exactly the shape `italic-period.ts`'s `italicGlossPeriodOutside`
 * hunts (its `INSIDE` pattern), and for every gloss that is not
 * itself a label it rewrites that run to `<i>gloss</i>.` before this
 * rule ever gets a chance to run — moving the period outside the tag
 * and destroying the seam. Measured on the full corpus: running
 * `italicGlossPeriodOutside` first costs `emDashSectionBreak` **all
 * 270 of its 270 entries — zero survive**. Run in the required order
 * instead, and at SEAM granularity nothing downstream re-touches the
 * merged run — 278 of 278 merged seams survive intact, because the
 * merge leaves each run ending in `—`, never `.`, which `INSIDE`
 * cannot match. **At ENTRY granularity `italicGlossPeriodOutside`
 * still fires on 23 of the 270 afterward**, at OTHER, unrelated
 * periods elsewhere in the same entry's body — a distinct locus, not
 * a re-opening of this row's own seam, and not a problem this rule
 * needs to prevent.
 *
 * `labelPeriodInside` is NOT part of this hazard — measured
 * separately, running it first leaves **270 of 270 entries
 * surviving**, unchanged: its own pattern needs a period already
 * sitting after `</i>`, which the raw seam never presents, so it
 * never touches this row's population in either order. The claim in
 * fix round 1 that this rule must also precede `labelPeriodInside`
 * was unmeasured and wrong; only the `italicGlossPeriodOutside` half
 * is load-bearing.
 *
 * This ordering constraint is not recorded as an `entangledWith`
 * edge — `checkAdjacency` cannot see it, the same blind spot the
 * batch's own spec names in §8 for the sibling ordering constraint
 * between this row and `italicLonePunctuation`. Task 7 must place
 * `emDashSectionBreak` **before** `italic-swallowed-terminal-period`
 * in registry order, in addition to (not instead of) the already-known
 * constraint that it precede `italic-lone-punctuation`.
 */
import type { SourceEntry } from '../../body/types.ts';
import { mapFields } from '../fields.ts';
import type { Rule, TransformResult } from '../types.ts';

/** `.</i> <i>—</i> ` (empty label, WITH its trailing space — the
 * space that survived round 1) or `.</i> <i>—LABEL</i>` (a label
 * glued to the dash, no trailing space of its own) — a section-break
 * dash split into a sibling italic run instead of continuing the
 * gloss's own. Two alternatives rather than one optional group because
 * the two shapes need different amounts of trailing text consumed;
 * `label` is `undefined` when the first alternative matches. See the
 * module doc, "fix round 2", for why the trailing space in the first
 * alternative must be consumed too. */
const SECTION_BREAK = /\.<\/i> <i>—<\/i> |\.<\/i> <i>—(?<label>[^<]+)<\/i>/gu;

/** A lone punctuation mark — never an em-dash — wrapped in its own
 * italic run. See the module doc, "excludes the em-dash by
 * construction". */
const LONE_PUNCTUATION = /<i>(?<mark>[.?;])<\/i>/gu;

function build(
	id: string,
	repair: (text: string) => string,
	detail: string,
): Rule {
	return {
		apply(entry: SourceEntry): TransformResult {
			const healed = mapFields(entry, repair);
			return healed === undefined
				? { entry, records: [] }
				: { entry: healed, records: [{ detail, rid: entry.rid, ruleId: id }] };
		},
		id,
		phase: 'text-repairs',
	};
}

/** Deletes the section break's stray tag split AND every space it
 * straddled — both the middle one and, for the empty-label shape, the
 * trailing one round 1 missed — closing the gloss's own italic run on
 * the tight `.—` the corpus otherwise writes 20,420 times. See the
 * module doc, "Class C, not Class A" and "fix round 2", for the ruling
 * that authorised the deletion and the corpus precedent behind both
 * shapes. */
const emDashSectionBreak: Rule = build(
	'em-dash-section-break-in-own-italic',
	(text) =>
		text.replaceAll(SECTION_BREAK, (_whole, label: string | undefined) =>
			label === undefined ? '.—</i>' : `.—${label}</i>`,
		),
	'section-break dash closed to the corpus norm ".—", tag split and space removed',
);

/** Unwraps an italic run holding nothing but one punctuation mark —
 * see the module doc for the residue relationship with
 * `emDashSectionBreak`. */
const italicLonePunctuation: Rule = build(
	'italic-lone-punctuation',
	(text) => text.replaceAll(LONE_PUNCTUATION, (_whole, mark: string) => mark),
	'italic unwrapped from a lone punctuation mark',
);

export { emDashSectionBreak, italicLonePunctuation };
