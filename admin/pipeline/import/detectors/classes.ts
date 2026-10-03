/**
 * The class-detector bucket (consolidation spec §4 "review detector",
 * §10 "port judgment-class detectors"): the catalogued classes the
 * maintainer ruled blocking that the import path can now see for
 * itself, plus `empty-body`, which no catalogue row matches exactly
 * (see its file). Each detects only and emits rows; none repairs
 * anything, and all six are `defer` for publication (post-consolidation
 * review §10, decision 2; `empty-body` by the review ledger's L08).
 *
 * `DETECTED_CLASSES` is what the review report subtracts from the
 * catalogue, so a class leaves the "Catalogued, not yet detected"
 * section the moment its detector is registered here — the list and
 * the rows cannot drift apart. `CLASS_ACTIONS` is what the kind table
 * reads: the detector owns the sentence a reader acts on, so the
 * table keeps one row per class instead of a paragraph.
 */

import type { Entry } from '../../../entry/types.ts';
import { mark } from '../gates.ts';
import type { Report, ReportRow } from '../report.ts';
import {
	detectEmptyBody,
	EMPTY_BODY,
	EMPTY_BODY_ACTION,
} from './empty-body.ts';
import {
	detectEmptyStemSection,
	EMPTY_STEM_SECTION,
	EMPTY_STEM_SECTION_ACTION,
} from './empty-stem-section.ts';
import {
	detectHomographRomanStranded,
	HOMOGRAPH_ROMAN_STRANDED,
	HOMOGRAPH_ROMAN_STRANDED_ACTION,
} from './homograph-roman-stranded-in-definition.ts';
import {
	detectOpenParenInRtlSpan,
	OPEN_PAREN_IN_RTL_SPAN,
	OPEN_PAREN_IN_RTL_SPAN_ACTION,
} from './open-paren-in-rtl-span.ts';
import type { ClassDetector } from './row.ts';
import {
	detectStrandedOpenBracket,
	STRANDED_OPEN_BRACKET,
	STRANDED_OPEN_BRACKET_ACTION,
} from './stranded-open-bracket.ts';
import {
	detectSuperscriptSubsectionContradicts,
	SUPERSCRIPT_SUBSECTION_CONTRADICTS,
	SUPERSCRIPT_SUBSECTION_CONTRADICTS_ACTION,
} from './superscript-subsection-contradicts-link-sub-section.ts';

/** One registered class: what finds it, and what to do about a row.
 * The catalogue id is the map key and the report `kind`, so the run's
 * row count for a kind reads directly against `corpusCount`. The one
 * key that is not a catalogue id, `empty-body`, is subtracted from the
 * catalogue harmlessly: no row carries it. */
interface ClassRule {
	action: string;
	detect: ClassDetector;
}

const CLASS_RULES: ReadonlyMap<string, ClassRule> = new Map([
	[EMPTY_BODY, { action: EMPTY_BODY_ACTION, detect: detectEmptyBody }],
	[
		EMPTY_STEM_SECTION,
		{ action: EMPTY_STEM_SECTION_ACTION, detect: detectEmptyStemSection },
	],
	[
		HOMOGRAPH_ROMAN_STRANDED,
		{
			action: HOMOGRAPH_ROMAN_STRANDED_ACTION,
			detect: detectHomographRomanStranded,
		},
	],
	[
		OPEN_PAREN_IN_RTL_SPAN,
		{ action: OPEN_PAREN_IN_RTL_SPAN_ACTION, detect: detectOpenParenInRtlSpan },
	],
	[
		STRANDED_OPEN_BRACKET,
		{ action: STRANDED_OPEN_BRACKET_ACTION, detect: detectStrandedOpenBracket },
	],
	[
		SUPERSCRIPT_SUBSECTION_CONTRADICTS,
		{
			action: SUPERSCRIPT_SUBSECTION_CONTRADICTS_ACTION,
			detect: detectSuperscriptSubsectionContradicts,
		},
	],
]);

/** The catalogue ids a detector on the import path now answers. */
const DETECTED_CLASSES: ReadonlySet<string> = new Set(CLASS_RULES.keys());

/** Catalogue id → the one sentence `publication.ts` prints under its
 * section heading. Every one of these kinds is `defer`, which that
 * table states once rather than per class. */
const CLASS_ACTIONS: ReadonlyMap<string, string> = new Map(
	[...CLASS_RULES].map(([kind, rule]) => [kind, rule.action]),
);

/** Every class row one finished entry contributes, bucketed. The
 * `bucket` is stamped here and nowhere else, so no detector can file
 * itself as a pipeline fault and skip publication classification. */
function detectClasses(entry: Entry): ReportRow[] {
	return [...CLASS_RULES.values()].flatMap((rule) =>
		rule.detect(entry).map((row) => ({ ...row, bucket: 'review' as const })),
	);
}

/** The kind of the fault `checkSilentClasses` files. */
const CLASS_DETECTOR_SILENT = 'class-detector-silent';

/** The floor under `DETECTED_CLASSES`: every registered class must
 * produce at least one row on the run, or the run faults.
 *
 * Registration alone is what takes a class off the review report's
 * "Catalogued, not yet detected" list, so a detector whose predicate
 * quietly stops matching — a transform reordered ahead of it, a tag
 * renamed — would erase the class in BOTH places at once: no rows
 * under its kind and no catalogue line either, reading exactly as
 * though it had been resolved, with every gate green.
 *
 * A fault and not a review row, and so a red gate 9 like every other
 * fault (DESIGN §9): a fault that did not refuse the write would be
 * the one fault a run could ship past. A class that truly reached zero
 * (Sefaria fixed every instance) is retired deliberately — its
 * detector unregistered and its catalogue row resolved — rather than
 * by a silence nobody chose. One mark per class, so gate 9's total
 * counts the classes checked.
 *
 * Run after the last `detectClasses` row is pushed. `detected` is a
 * parameter only so a test can hand in a set of its own. */
function checkSilentClasses(
	report: Report,
	detected: ReadonlySet<string> = DETECTED_CLASSES,
): void {
	const seen = new Set(report.rows.map((row) => row.kind));
	for (const kind of detected) {
		const detail = `${kind}: the detector produced 0 rows on this run`;
		mark(report.gates.composition, seen.has(kind), detail);
		if (!seen.has(kind)) {
			report.rows.push({
				bucket: 'pipeline',
				detail,
				kind: CLASS_DETECTOR_SILENT,
				rid: 'corpus',
				severity: 'fault',
			});
		}
	}
}

export type { ClassRule };
export { CLASS_ACTIONS, checkSilentClasses, DETECTED_CLASSES, detectClasses };
