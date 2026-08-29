/**
 * `stem-head-marker-chop` (batch 6b, spec
 * `docs/specs/2026-08-28-structural-repairs-design.md` §3) — and the
 * FIRST rule to run in the `structural-repairs` phase, which stood
 * wired-but-empty from Phase 1 until this batch.
 *
 * ## The defect
 *
 * A numbered sense `1)` ends with a bare `—2)` marker and nothing
 * after it. The text that marker introduces is in the NEXT sibling,
 * which carries no `number` at all — so the entry renders a sense 1
 * that trails off into a marker, followed by an unlabelled block that
 * is really sense 2.
 *
 * Measured on the entry as this phase actually receives it —
 * `applyTransforms(applyRepairs(source).entry, 'text-repairs')`, not
 * raw source — the population is **18**, every one of them ending in
 * the exact byte run `—2) `, 17 nested inside a stem block and one at
 * top level (`A01509`), and in none of them does the sibling carry a
 * `grammar` block of its own.
 *
 * ## The repair, and why it invents nothing
 *
 *     before  1) "… v. supra.—2) "   next  number: null   "to grow strong…"
 *     after   1) "… v. supra."       next  number: "—2)"  "to grow strong…"
 *
 * The marker MOVES from the definition into the field that exists to
 * hold it. `—2)` is the corpus's own spelling — **3,985 `number`
 * fields already hold exactly that string** — so this writes a value
 * the model carries rather than a new convention, and `fieldsOf`
 * walks `sense.number`, so the move is text-neutral to both text
 * gates.
 *
 * ## What it deletes, and why that is declared
 *
 * One space: the marker's own trailing space, declared through
 * `removes`. Leaving it would end 18 definitions in whitespace and so
 * hand `trailing-whitespace-definition` (10, still `PENDING`) 18 new
 * members — a rule growing a sibling row's population is the failure
 * batch 3b found by hand, and the reason this rule states its deletion
 * instead of tidying quietly.
 *
 * ## The refusal, and it is the point of the row
 *
 * Dropping the "and nothing after it" clause finds **28**, not 18. Of
 * the ten extra, seven are duplicated-token residue and **three are
 * stranded real text** — the genuine opening of sense 2, sitting after
 * the marker. A rule written as "delete the marker" would destroy text
 * in three entries. This one matches only an EMPTY residue, so all ten
 * are refused by the predicate rather than by a guard, and they stay
 * in the row for a later ruling.
 *
 * ## Idempotence and the second marker
 *
 * The rule repairs at most one marker per sibling pair. `P00816`
 * carries a chopped `—3)` inside the sibling this rule renumbers, so
 * that entry keeps one unnumbered sibling after the pass — recorded
 * rather than chased, since a second pass would need the same evidence
 * for a different position and the row's count is stated at 18.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/** The one shape this rule accepts: a definition ending in a sense
 * marker plus its single trailing space, with nothing after it.
 * Anchored at the end, so any residue — text, punctuation, a second
 * marker — fails the match rather than being trimmed away. */
const CHOPPED_TAIL = /(?<marker>—\d+\)) $/u;

/** The marker's trailing space: the only text this rule removes. */
const REMOVED = ' ';

interface Repair {
	marker: string;
	trimmed: string;
}

/** The repair this pair licenses, or `null`. `left` must be a numbered
 * sense whose definition ends in a chopped marker; `right` must be a
 * sibling that has text of its own and no number to overwrite. */
function repairFor(
	left: SourceSense,
	right: SourceSense | undefined,
): Repair | null {
	if (left.number !== '1)' || left.definition === undefined) {
		return null;
	}
	// `right.number != null` is the one loose comparison in this file and
	// it is deliberate: the corpus stores an unnumbered sense as JSON
	// `null`, which `SourceSense['number']` types as `string |
	// undefined`, so both spellings occur at runtime and only the loose
	// test rejects a sibling that already carries a number either way.
	if (right?.definition === undefined || right.number != null) {
		return null;
	}
	const match = CHOPPED_TAIL.exec(left.definition);
	const marker = match?.groups?.['marker'];
	if (marker === undefined) {
		return null;
	}
	return {
		marker,
		trimmed: left.definition.slice(0, -(marker.length + REMOVED.length)),
	};
}

/** One level of siblings, rebuilt with every licensed repair applied.
 * Recurses first so a nested run is repaired at its own depth — 17 of
 * the 18 members are children of a stem block. */
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
		const repair = repairFor(sense, out[index + 1]);
		const next = out[index + 1];
		if (repair === null || next === undefined) {
			continue;
		}
		sense.definition = repair.trimmed;
		next.number = repair.marker;
		records.push({
			detail: `moved chopped marker ${JSON.stringify(repair.marker)} onto the unnumbered sibling`,
			rid,
			ruleId: 'stem-head-marker-chop',
		});
	}
	return out;
}

const stemHeadMarkerChop: Rule = {
	apply: (entry: SourceEntry): TransformResult => {
		const records: TransformRecord[] = [];
		const senses = repairLevel(entry.content.senses, entry.rid, records);
		if (records.length === 0) {
			return { entry, records };
		}
		return {
			entry: { ...entry, content: { ...entry.content, senses } },
			records,
			// One declared space per marker moved: the gate credits
			// `removes` as a multiset, so a rule that dropped two spaces
			// while declaring one still fails.
			removes: records.map(() => REMOVED),
		};
	},
	id: 'stem-head-marker-chop',
	phase: 'structural-repairs',
};

export { stemHeadMarkerChop };
