/**
 * `continuation-marker-em-dash-loss` (batch 7,
 * `docs/v2/transform-batch-7.md` §4, §16) — shipped for its
 * HIGH-CONFIDENCE CORE only, on Brian's ruling 2026-08-29.
 *
 * ## The row, and why it could not ship whole
 *
 * Jastrow writes a continuation sense marker as `—N)`. Some carry no
 * dash. The row is catalogued at 71, and **its own audit already
 * records the residue as unsettled between 19 and 44** — round 2
 * reconstructed 45/26/19, the `stranded-open-bracket` audit 73/29/44.
 * A third reconstruction here lands inside that band and settles
 * nothing on its own.
 *
 * Over all 32,512 entries the dashless continuation markers decompose
 * four ways, and only the fourth is this row. The figures depend on
 * WHERE they are taken, so both are given:
 *
 *                                            before   after
 *     the dash is stranded on the previous
 *       sibling → `trailing-em-dash-tail`       109       8
 *     a "[" is stranded on the previous
 *       sibling → `stranded-open-bracket`        80      79
 *     previous ends ";" or "," — a print RUN,
 *       the catalogue's own "real finding that
 *       kills the naive version"                 56      56
 *     no residue at all  ← this row              36      36
 *
 * "After" is the whole `structural-repairs` phase with this rule held
 * out, which is what this rule actually receives and what
 * `continuation-marker.corpus.test.ts` asserts. **The first arm
 * collapses because this same batch repaired it**:
 * `strandedDashStarMarker` and `stemHeadMarkerChop` rejoined 101 of the
 * 109. This row's own population is unaffected either way.
 *
 * ## What ships: the entry's own witness
 *
 * Of the 36, **14 sit in a MIXED sibling list** — one whose other
 * members DO carry `—N)`. That is the internal control the row names,
 * and it is per-entry rather than corpus-wide: the entry itself
 * demonstrates the convention its own marker departs from.
 *
 * **The declaration is `copied`, not `allows`, and the difference is
 * the whole safety argument.** `allows: ['—']` would license an em dash
 * anywhere in this rule's diff, corpus-wide, on nothing but a
 * maintainer's word. `copied: ['—']` is verified by the gate against
 * THIS ENTRY'S input before it is credited — and the predicate
 * guarantees the witness exists, because a mixed list is precisely one
 * that already holds a dashed marker. The mixed-list requirement is
 * therefore load-bearing rather than decorative: drop it and the
 * declaration stops being checkable.
 *
 * ## Why 14 and not the catalogued 16
 *
 * The row names six example rids for its core. Two of them — `B00411`
 * and `C01321` — have their bare marker preceded by a definition ending
 * in `[`, so they belong to `stranded-open-bracket` under that row's
 * own later audit ("29 explained by a preceding definition ending in
 * '['"). The catalogue's 16 predates that split; the two rows are, in
 * its own words, complements. The remaining four (`A00441`, `A00842`,
 * `A01047`, `A03174`) all reproduce here.
 *
 * ## What stays on the row
 *
 * The other **22** are unmixed: no sibling in their list carries a
 * dash, so nothing in the entry witnesses the convention and no
 * declaration this gate can check is available. They keep the row, and
 * the row keeps its unsettled status honestly rather than being emptied
 * by a rule that guessed.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { stripTags } from '../no-new-text.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/** A continuation marker with no dash: bare digits and a paren. */
const BARE = /^\d+\)$/u;
/** A marker that carries one, starred or not — the witness. */
const DASHED = /^—\*?\d+\)$/u;
/** Residue belonging to another row, or the print run that is not a
 * defect at all. Tested on STRIPPED text, so a closing tag between the
 * character and the end of the field cannot hide it. */
const NOT_OURS = /[—[;,][ \t]*$/u;

/** The one codepoint this rule writes, copied from a sibling's marker. */
const DASH = '—';

/** Whether this sibling list witnesses the convention. */
function hasWitness(senses: readonly SourceSense[]): boolean {
	return senses.some(
		(sense) => sense.number !== undefined && DASHED.test(sense.number),
	);
}

/** Whether the marker at `index` is this row's defect. */
function isDefect(senses: readonly SourceSense[], index: number): boolean {
	if (index === 0) {
		return false;
	}
	const number = senses[index]?.number;
	if (number === undefined || !BARE.test(number)) {
		return false;
	}
	if (Number(number.slice(0, -1)) <= 1) {
		return false;
	}
	return !NOT_OURS.test(stripTags(senses[index - 1]?.definition ?? ''));
}

/** One level of siblings, rebuilt with every licensed repair applied.
 * Recurses first, because senses NEST. */
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
	if (!hasWitness(deepened)) {
		return deepened;
	}
	return deepened.map((sense, index) => {
		if (!isDefect(deepened, index)) {
			return sense;
		}
		records.push({
			detail: `restored the em dash on ${JSON.stringify(sense.number)}, witnessed by a sibling`,
			rid,
			ruleId: 'continuation-marker-em-dash-loss',
		});
		return { ...sense, number: `${DASH}${sense.number as string}` };
	});
}

const continuationMarkerDash: Rule = {
	apply: (entry: SourceEntry): TransformResult => {
		const records: TransformRecord[] = [];
		const senses = repairLevel(entry.content.senses, entry.rid, records);
		if (records.length === 0) {
			return { entry, records };
		}
		return {
			// One declared copy per repair. `copied` is credited per
			// declaration rather than from a shared budget — each licenses
			// one duplication of text the input holds — which is correct
			// here: every repaired marker copies the same dash the sibling
			// carries, and copying it twice is a real operation where
			// deleting it twice would not be.
			copied: records.map(() => DASH),
			entry: { ...entry, content: { ...entry.content, senses } },
			records,
		};
	},
	id: 'continuation-marker-em-dash-loss',
	phase: 'structural-repairs',
};

export { BARE, continuationMarkerDash, DASH, DASHED, hasWitness, NOT_OURS };
