/**
 * Class A (batch-3b spec §3, §6) — the em-dash section break and the
 * lone-punctuation residue it leaves behind.
 *
 * ## `emDashSectionBreak`: a merge, not a move — the brief's literal
 * replacement does not survive contact with the corpus
 *
 * The brief proposed `.—</i>` as the replacement for
 * `.</i> <i>—</i> `, written before anyone had read a real
 * occurrence. It does not survive contact with one: every one of the
 * 278 occurrences carries a REAL text space between `</i>` and the
 * second `<i>` — `stripTags` on `<i>noble.</i> <i>—</i> Pl.` is
 * `"noble. — Pl."`, not `"noble.— Pl."` — so a replacement that drops
 * that space changes the STRIPPED text, which a Class A rule may
 * never do (spec §6 measure (1); `italic-period.ts`'s module doc
 * states the same invariant for its own pair). The corpus does write
 * the tight, spaceless `.—` form 20,195 times elsewhere, and that is
 * exactly what makes the brief's guess look plausible, but that form
 * belongs to entries that never carried this space to begin with.
 * Deleting it here would be curing one defect by introducing a
 * second, smaller one — and `checkNoNewText`'s sub-multiset gate
 * would even let it through, because a deletion always passes a
 * sub-multiset check. This rule's own `stripTags` invariant test,
 * below in `punct-seams.test.ts`, is the only thing that would have
 * caught it.
 *
 * The actual defect is simpler than either replacement assumes: one
 * continuous italic run — the gloss, its terminal period, the
 * section-break dash, and (sometimes) a trailing label — was split
 * into two ADJACENT sibling runs at the space, for no reason the text
 * itself needs. The repair removes that split: delete the closing
 * `</i>` and the following `<i>`, and keep every character between
 * them exactly where it was, so the run's original opening tag simply
 * keeps running until the dash's own close tag. Nothing is added,
 * nothing is deleted, nothing changes order —
 * `stripTags(before) === stripTags(after)` on the nose, verified
 * below across all 278 occurrences with zero mismatches
 * (task-4-report.md has the full measurement).
 *
 * One substitution handles both shapes the catalogued 278 cover,
 * without branching: the 230/226 that close immediately (`<i>—</i>`,
 * label empty) and the 48 where the run instead carries a trailing
 * label glued to the dash with no space of its own (`—Pl.`,
 * `—Part. pass`, `—Hif.`, …) — the label, whatever it holds, rides
 * through the named group unchanged.
 *
 * ## `italicLonePunctuation` excludes the em-dash by construction,
 * not by running second
 *
 * `italic-lone-punctuation` is catalogued as the RESIDUE of this row:
 * of 258 lone-punctuation runs corpus-wide, 230 are `<i>—</i>` and
 * every one of those 230 is already `emDashSectionBreak`'s (preceded
 * by `.</i> `). Cataloguing both rows at full size would double-count
 * those 230. `LONE_PUNCTUATION`'s character class is `[.?;]` — it has
 * no way to match an em-dash at all, in either registration order, so
 * the exclusion holds even if this rule ran alone, or first, or
 * against a corpus this file has never seen. `checkAdjacency()` only
 * reads `entangledWith` and this pair carries no such edge (spec §8),
 * so the disjointness has to live in the predicate, not in registry
 * position or in a comment promising it does.
 *
 * Measured on the raw corpus, independent of `emDashSectionBreak` (as
 * the batch's own measurement method requires): 28 occurrences — 21
 * periods, 5 question marks, 2 semicolons — against a catalogued 29;
 * task-4-report.md has the one-instance reconciliation.
 *
 * One of those 21 periods is `B00957`'s `esp<i>.</i>` — the exact
 * case `rules/italic-period.ts`'s empty-body guard declines rather
 * than claims, because unwrapping it is this row's job, not
 * `italicGlossPeriodOutside`'s. This rule performs exactly that
 * unwrap: `esp<i>.</i>` → `esp.`, restoring the abbreviation's own dot
 * to plain text beside the word it belongs to.
 *
 * ## UNRECORDED REGISTRY-ORDER HAZARD: `emDashSectionBreak` MUST run
 * before `label-period-outside-italic` / `italic-swallowed-terminal-period`
 *
 * `SECTION_BREAK` needs its input's first run to still read
 * `<i>gloss.</i>` — period INSIDE, immediately before `</i>`. That is
 * exactly the shape `italic-period.ts`'s `italicGlossPeriodOutside`
 * hunts (its `INSIDE` pattern), and for every gloss that is not
 * itself a label it REWRITES that run to `<i>gloss</i>.` before this
 * rule ever gets a chance to run — moving the period outside the tag
 * and destroying the `.</i>` seam `SECTION_BREAK` requires. Measured
 * on the full corpus: running `italicGlossPeriodOutside` first costs
 * `emDashSectionBreak` **all 270 of its 270 entries — zero survive**,
 * because none of the sampled glosses (`noble`, `all silk`, `enigma`,
 * `Spaniard`, …) are abbreviation labels, so `isLabel` never declines
 * them. `labelPeriodInside` cannot rescue the loss either: it only
 * fires on a period already outside the tag, which is precisely the
 * damaged shape `italicGlossPeriodOutside` just produced, and it
 * declines every one of these bodies for the same reason (none is a
 * label). Run in the required order instead, `italicGlossPeriodOutside`
 * finds nothing left to move afterward — `SECTION_BREAK`'s merge
 * leaves the run ending in `—`, never `.` — so nothing downstream
 * re-touches it.
 *
 * `italicLonePunctuation` carries no version of this hazard.
 * `italicGlossPeriodOutside`'s `INSIDE` pattern can only ever reach a
 * `?` or `;` body through a literal `.` its regex requires and these
 * bodies do not have, and for a `.` body specifically (`<i>.</i>`)
 * `isEmpty` — Task 2's own guard, kept precisely so this row would
 * have something to unwrap — declines it outright. `labelPeriodInside`'s
 * `OUTSIDE` pattern needs a period already sitting after `</i>`, which
 * none of these three raw shapes ever present. So its placement
 * relative to that pair is free either way.
 *
 * This is not recorded as an `entangledWith` edge — `checkAdjacency`
 * cannot see it, the same blind spot the batch's own spec names in
 * §8 for the sibling ordering constraint between this row and
 * `italicLonePunctuation`. Task 7 must place `emDashSectionBreak`
 * **before** `label-period-outside-italic` and
 * `italic-swallowed-terminal-period` in registry order, not merely
 * before `italic-lone-punctuation`.
 */
import type { SourceEntry } from '../../body/types.ts';
import { mapFields } from '../fields.ts';
import type { Rule, TransformResult } from '../types.ts';

/** `.</i> <i>—LABEL</i>` — a section-break dash (with an optional
 * label glued to it) split into a sibling italic run instead of
 * continuing the gloss's own. `label` rides through unchanged; see
 * the module doc for why the replacement never inspects it. */
const SECTION_BREAK = /\.<\/i> <i>—(?<label>[^<]*)<\/i>/gu;

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

/** Merges the gloss run and the section-break dash's sibling run back
 * into one — see the module doc for why this is a merge rather than
 * the brief's originally guessed tight-dash replacement. */
const emDashSectionBreak: Rule = build(
	'em-dash-section-break-in-own-italic',
	(text) =>
		text.replaceAll(
			SECTION_BREAK,
			(_whole, label: string) => `. —${label}</i>`,
		),
	'section-break dash merged back into its gloss’s own italic run',
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
