/**
 * `trailing-em-dash-tail` (batch 7, `docs/v2/transform-batch-7.md` §1)
 * — the second rule to run in the `structural-repairs` phase batch 6b
 * wired.
 *
 * ## The defect, and it is one event catalogued twice
 *
 * A sense's definition ends in a bare em dash and the NEXT sibling's
 * `number` is `*N)`. Print reads `—*2)`: one continuation marker,
 * starred. The upstream marker regex captures `—` before a digit but
 * NOT across an asterisk, so the marker split in two — the dash
 * stranded at the end of the previous definition, the `*2)` left in
 * the `number` field without it.
 *
 * The catalogue holds this as two rows, `trailing-em-dash-tail` (130)
 * and `sense-number-outside-closed-grammar` (111), found independently
 * in letters G and L, and both say the same thing: they are one event
 * and MUST BE TRANSFORMED IN ONE STEP. A rule that only trimmed the
 * dash would leave `*3)`; a rule that only normalized the number would
 * leave the dash doubled.
 *
 * ## The mechanism is proven by contrast, and it reproduces
 *
 * Measured on the entry this phase receives —
 * `applyTransforms(applyRepairs(source).entry, 'text-repairs')` — over
 * all 32,512 entries:
 *
 * - 132 senses / 130 entries end in a stranded em dash;
 * - of 107 `*N)` markers, **101 (94.4%)** carry one;
 * - of 2,644 plain `N)` markers at position > 0, **8 (0.3%)** do;
 * - of 5,442 `—N)` markers, **0 (0.0%)** do.
 *
 * The asterisk is the whole mechanism. All 101 definitions end in the
 * dash with NO trailing space, so unlike `stemHeadMarkerChop` this
 * rule deletes nothing and declares no `removes`: the dash MOVES from
 * `definition` into `number`, `fieldsOf` walks both, and the move is
 * text-neutral to `checkNoNewText` and `no-lost-text` alike.
 *
 * ## What this rule writes that the corpus does not yet hold
 *
 *     before  "…; a. fr.—"   next  number: "*2)"   "<i>he who</i>. …"
 *     after   "…; a. fr."    next  number: "—*2)"  "<i>he who</i>. …"
 *
 * `stemHeadMarkerChop` could argue that `—2)` is the corpus's own
 * spelling, 3,985 `number` fields deep. **This rule cannot: `—*N)`
 * occurs 0 times corpus-wide today.** What licenses it instead is the
 * MODEL, not the population — `body/labels.ts`'s `LABEL` is
 * `/^(?<dash>—)?(?<star>\*)?(?<label>\d+|[a-z])\)$/u`, dash and star
 * as independent fields in that order, and `printLabel` regenerates
 * `—*2)` byte-exactly from `{dash: true, star: true, label: '2'}`. The
 * combination is unattested, not ungrammatical, and the reason it is
 * unattested is the upstream split this rule repairs.
 *
 * ## The refusal, and the residue it leaves on the row
 *
 * The predicate requires BOTH sides: a stranded dash and a `*N)`
 * sibling. That refuses two populations on purpose.
 *
 * **6 of the 107 `*N)` markers have no stranded dash before them** —
 * `A00510`, `A02000`, `B00005`, `M00591`, `N01131`, `P01184`. They
 * reconcile the catalogued token census exactly (`*2)` 74 − 72,
 * `*3)` 19 − 18, `*1)` 3 − 0), and `A02000`'s predecessor ends `—[`,
 * which is `stranded-open-bracket`'s shape rather than this one. They
 * stay on `sense-number-outside-closed-grammar`, re-scoped to them.
 *
 * **31 of the 132 stranded dashes have no `*N)` sibling** — 16
 * entry-final, 7 next-sibling-unnumbered, 8 next-sibling-bare — and
 * they stay on `trailing-em-dash-tail`. The row's reading is that the
 * dash is a SEPARATOR, not debris, so for those 31 there is nothing
 * yet to separate and no repair this rule can license.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/** The dash that moves. Not deleted anywhere — written into `number` in
 * the same step — so it is declared through neither `removes` nor
 * `allows`. */
const DASH = '—';
/** A definition ending in a bare em dash, as `endsWith(DASH)`.
 *
 * NO WHITESPACE ALLOWANCE, and that is the point: all 101 members end
 * in the dash itself, so admitting trailing space would silently take
 * in a shape nothing has measured and would hand
 * `trailing-whitespace-definition` (10, still `PENDING`) new members —
 * the sibling-row growth batch 3b found by hand. The row's PUBLISHED
 * predicate is wider (`/—[ \t]*$/u`), and
 * `sense-marker-corpus.test.ts` measures both so the 8 spaced members
 * are counted rather than invisible. */
function endsInStrandedDash(definition: string): boolean {
	return definition.endsWith(DASH);
}

/** The starred continuation marker, exactly as the upstream split left
 * it: star, digits, close paren, nothing else. */
const STAR_MARKER = /^\*\d+\)$/u;

/** The repair this pair licenses, or `null`. `left` must end in a
 * stranded dash; `right` must carry a starred marker and text of its
 * own. */
function repairFor(
	left: SourceSense,
	right: SourceSense | undefined,
): { marker: string; trimmed: string } | null {
	if (left.definition === undefined || !endsInStrandedDash(left.definition)) {
		return null;
	}
	if (right?.number === undefined || !STAR_MARKER.test(right.number)) {
		return null;
	}
	// Every one of the 101 siblings is a leaf holding a definition. A
	// marker introduces text; a sibling with none is not the shape the
	// row measured, so it is refused rather than renumbered.
	if (right.definition === undefined) {
		return null;
	}
	return {
		marker: `${DASH}${right.number}`,
		trimmed: left.definition.slice(0, -DASH.length),
	};
}

/** One level of siblings, rebuilt with every licensed repair applied.
 * Recurses first so a nested run is repaired at its own depth — senses
 * NEST (4,043 of them), and round 4 records that a non-recursive walk
 * returns 109 of the 132 tails and loses a quarter of the population. */
function repairLevel(
	senses: readonly SourceSense[],
	rid: string,
	records: TransformRecord[],
): SourceSense[] {
	const deepened = senses.map((sense) =>
		sense.senses === undefined
			? sense
			: { ...sense, senses: repairLevel(sense.senses, rid, records) },
	);
	const out = deepened.map((sense) => ({ ...sense }));
	for (const [index, sense] of out.entries()) {
		const next = out[index + 1];
		const repair = repairFor(sense, next);
		if (repair === null || next === undefined) {
			continue;
		}
		sense.definition = repair.trimmed;
		next.number = repair.marker;
		records.push({
			detail: `rejoined stranded em dash onto ${JSON.stringify(repair.marker)}`,
			rid,
			ruleId: 'trailing-em-dash-tail',
		});
	}
	return out;
}

const strandedDashStarMarker: Rule = {
	apply: (entry: SourceEntry): TransformResult => {
		const records: TransformRecord[] = [];
		const senses = repairLevel(entry.content.senses, entry.rid, records);
		if (records.length === 0) {
			return { entry, records };
		}
		return {
			entry: { ...entry, content: { ...entry.content, senses } },
			records,
		};
	},
	id: 'trailing-em-dash-tail',
	phase: 'structural-repairs',
};

export { DASH, endsInStrandedDash, STAR_MARKER, strandedDashStarMarker };
