/**
 * The entangled label pair (batch-3b spec §4) — two rules, one
 * predicate, opposite polarities.
 *
 * House style, ruled by Brian on 2026-08-21 after the round-4
 * reconciliation: a grammatical or abbreviation LABEL takes its
 * terminal period INSIDE the italic, an ordinary word-final gloss
 * takes it OUTSIDE. The two are exhaustive over `<i>…</i>.` and
 * `<i>….</i>` and disjoint by `isLabel()`, which is why the catalogue
 * records them as entangled and why they are written together.
 *
 * ACCEPTED COST, STATED: `Part. pass.` is a genuine 10-letter
 * unanimous period-OUTSIDE convention and this ruling overrides it —
 * 266 occurrences normalised against their own attested usage. A
 * deliberate consistency-over-fidelity trade, safe only because both
 * forms strip to byte-identical text.
 *
 * ## Class A, and what watches it
 *
 * Both rules move ONE byte across a tag boundary and neither declares
 * an `allows`: the text multiset is unchanged by construction, so
 * `checkNoNewText` is structurally blind to everything these rules
 * do, and `checkMarkup` is a delta gate that permits pre-existing
 * damage through. The only thing that can see a mistake here is the
 * corpus-tier `stripTags` invariant in `italic-period.test.ts`, which
 * is ORDER-sensitive where the gate is a multiset. Read that test as
 * part of the rule.
 *
 * ## GRANULARITY: the whole run body, never its final token
 *
 * `ABBREVIATIONS` mixes granularities — mid-run evidence names a
 * TOKEN (`Hif`, `pass`, `hard`), run-final evidence names a whole
 * BODY (`Part. pass`, `—Pl`) — so `isLabel` can be asked about a run
 * body, about that body's final token, or about both. These rules ask
 * only about the whole body, and the choice is measured rather than
 * assumed (task-2-report.md, over the pinned snapshot):
 *
 * - widening to `isLabel(finalToken)` ADDS 87 occurrences to
 *   `labelPeriodInside`, of which 25 (28.7%) are ordinary glosses —
 *   `to become hard.`, `a third part.`, `narrow, pass.`, `to sing.`;
 * - and REMOVES 32 from `italicGlossPeriodOutside`, of which 13
 *   (40.6%) are ordinary glosses — `share, part.`, `piece, part.`,
 *   `the smooth part.`.
 *
 * In both directions the mistakes MANUFACTURE the sibling row's
 * defect: a gloss whose period is dragged inside is a fresh instance
 * of `italic-swallowed-terminal-period`, and a gloss left with its
 * period inside is one the pair failed to remove. The whole-body test
 * has nothing to trade against that — every body-granular match in
 * the period-outside population is also token-consistent (0
 * disagreements in the other direction).
 *
 * The reason behind those numbers is that a token-granular member's
 * evidence is a claim about a token sitting INSIDE a run, and that
 * says nothing about a body which merely ENDS with it: `hard` earned
 * its membership from a mid-run continuation, not from `<i>to become
 * hard</i>.`.
 *
 * THE COST OF THE CHOICE, since it is not free: 62 genuine label
 * occurrences the vocabulary holds only token-granularly are declined
 * — `—Part. pass` (19), `part. pass` (8), `Part. Pu` (5), `Part. Hof`
 * (4) and a long tail of singletons. They stay period-outside. Widening
 * the VOCABULARY to hold those bodies is the sound way to reach them;
 * widening the PREDICATE to a final token is not, because it cannot
 * reach them without also taking the 25 glosses above.
 *
 * ## SHORT MEMBERS take no guard, and that is measured too
 *
 * The vocabulary holds single letters and short transliterations
 * (`a i n s t y k r p f m sh C H M T Z gl hard Par`), and a rule
 * wanting zero false positives might reasonably want to exclude them.
 * Measured as whole run bodies on the pinned snapshot they are 80
 * period-outside occurrences against 43 already period-inside, and
 * every one inspected is Jastrow's headword-initial abbreviation in
 * running text — `a metal <i>k</i>.`, `the Tyrian <i>M</i>.`, `three
 * eggs' sizes of <i>n</i>.` — which is the ABBREVIATION half of what
 * this row's own description names. Not glosses, so not false
 * positives, so no guard.
 *
 * `T00309` is the witness that settles it: one sentence writes
 * `a <i>r.</i> and a half-<i>r</i>.`, the same abbreviation typeset
 * both ways five words apart. That is the inconsistency this pair
 * exists to remove, not a distinction it should preserve.
 *
 * ## Edge whitespace belongs to another row
 *
 * `INSIDE` requires the period to abut `</i>`, and `OUTSIDE` requires
 * the closing tag to abut the period, so `<i>destruction. </i>`
 * matches neither. That is deliberate: run-edge whitespace is
 * `emphasis-run-edge-space`'s population, and a rule that quietly
 * absorbed it would be claiming a row it is not measured against.
 *
 * What `labelPeriodInside` DOES admit is a body with edge whitespace
 * of its own, since `isLabel` trims — and all 32 such occurrences in
 * its matched population carry a LEADING space only (`<i> Part.
 * pass</i>.`), so the period is never written away from the label it
 * belongs to. Measured, not assumed; a trailing-space body would
 * produce `<i>Af .</i>`, which renders identically but reads wrong.
 */
import type { SourceEntry } from '../../body/types.ts';
import { isLabel } from '../abbrev-vocab.ts';
import { mapFields } from '../fields.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/** `<i>BODY</i>.` — period outside. */
const OUTSIDE = /<i>(?<body>[^<>]*)<\/i>\./gu;
/** `<i>BODY.</i>` — period inside. */
const INSIDE = /<i>(?<body>[^<>]*)\.<\/i>/gu;

function moveInside(text: string): string {
	return text.replaceAll(OUTSIDE, (whole, body: string) =>
		isLabel(body) ? `<i>${body}.</i>` : whole,
	);
}

function moveOutside(text: string): string {
	return text.replaceAll(INSIDE, (whole, body: string) =>
		isLabel(body) ? whole : `<i>${body}</i>.`,
	);
}

function build(id: string, move: (text: string) => string): Rule {
	return {
		apply(entry: SourceEntry): TransformResult {
			const healed = mapFields(entry, move);
			if (healed === undefined) {
				return { entry, records: [] };
			}
			const record: TransformRecord = {
				detail: 'terminal period moved across the italic boundary',
				rid: entry.rid,
				ruleId: id,
			};
			return { entry: healed, records: [record] };
		},
		id,
		phase: 'text-repairs',
	};
}

/** The label side: `<i>Af</i>.` → `<i>Af.</i>`. */
const labelPeriodInside: Rule = build(
	'label-period-outside-italic',
	moveInside,
);

/** The gloss side: `<i>destruction.</i>` → `<i>destruction</i>.`. */
const italicGlossPeriodOutside: Rule = build(
	'italic-swallowed-terminal-period',
	moveOutside,
);

export { italicGlossPeriodOutside, labelPeriodInside };
