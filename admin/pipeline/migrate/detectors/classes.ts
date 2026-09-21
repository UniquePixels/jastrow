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
 * the rows cannot drift apart.
 */
import type { ReportRow } from '../report.ts';
import type { TruthEntry } from '../types.ts';
import {
	detectEmptyStemSection,
	EMPTY_STEM_SECTION,
} from './empty-stem-section.ts';
import {
	detectHomographRomanStranded,
	HOMOGRAPH_ROMAN_STRANDED,
} from './homograph-roman-stranded-in-definition.ts';
import {
	detectOpenParenInRtlSpan,
	OPEN_PAREN_IN_RTL_SPAN,
} from './open-paren-in-rtl-span.ts';
import type { ClassDetector } from './row.ts';
import {
	detectStrandedOpenBracket,
	STRANDED_OPEN_BRACKET,
} from './stranded-open-bracket.ts';
import {
	detectSuperscriptSubsectionContradicts,
	SUPERSCRIPT_SUBSECTION_CONTRADICTS,
} from './superscript-subsection-contradicts-link-sub-section.ts';

/** Catalogue id → its detector. The id is the report `kind`, so the
 * run's row count for a kind reads directly against the catalogue's
 * `corpusCount`. */
const CLASS_DETECTORS: ReadonlyMap<string, ClassDetector> = new Map([
	[EMPTY_STEM_SECTION, detectEmptyStemSection],
	[HOMOGRAPH_ROMAN_STRANDED, detectHomographRomanStranded],
	[OPEN_PAREN_IN_RTL_SPAN, detectOpenParenInRtlSpan],
	[STRANDED_OPEN_BRACKET, detectStrandedOpenBracket],
	[SUPERSCRIPT_SUBSECTION_CONTRADICTS, detectSuperscriptSubsectionContradicts],
]);

/** The catalogue ids a detector on the import path now answers. */
const DETECTED_CLASSES: ReadonlySet<string> = new Set(CLASS_DETECTORS.keys());

/** Every class row one finished entry contributes, bucketed. The
 * `bucket` is stamped here and nowhere else, so no detector can file
 * itself as a pipeline fault and skip publication classification. */
function detectClasses(entry: TruthEntry): ReportRow[] {
	return [...CLASS_DETECTORS.values()].flatMap((detect) =>
		detect(entry).map((row) => ({ ...row, bucket: 'review' as const })),
	);
}

export { CLASS_DETECTORS, DETECTED_CLASSES, detectClasses };
