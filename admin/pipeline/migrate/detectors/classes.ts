/**
 * The class-detector bucket (consolidation spec §4 "review detector",
 * §10 "port judgment-class detectors"): the catalogued classes the
 * maintainer ruled blocking that the import path can now see for
 * itself. Each detects only and emits rows; none repairs anything,
 * and all five are `defer` for publication (post-consolidation review
 * §10, decision 2).
 *
 * `DETECTED_CLASSES` is what the review report subtracts from the
 * catalogue, so a class leaves the "Catalogued, not yet detected"
 * section the moment its detector is registered here — the list and
 * the rows cannot drift apart. `CLASS_ACTIONS` is what the kind table
 * reads: the detector owns the sentence a reader acts on, so the
 * table keeps one row per class instead of a paragraph.
 */
import type { ReportRow } from '../report.ts';
import type { TruthEntry } from '../types.ts';
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
 * row count for a kind reads directly against `corpusCount`. */
interface ClassRule {
	action: string;
	detect: ClassDetector;
}

const CLASS_RULES: ReadonlyMap<string, ClassRule> = new Map([
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
function detectClasses(entry: TruthEntry): ReportRow[] {
	return [...CLASS_RULES.values()].flatMap((rule) =>
		rule.detect(entry).map((row) => ({ ...row, bucket: 'review' as const })),
	);
}

export type { ClassRule };
export { CLASS_ACTIONS, DETECTED_CLASSES, detectClasses };
