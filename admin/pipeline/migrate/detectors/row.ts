/**
 * What a class detector is and what it emits (consolidation spec §4:
 * a review detector DETECTS ONLY and emits a row; it repairs nothing).
 * The `bucket` is added once, by `classes.ts`, so no detector can file
 * itself as a pipeline fault.
 */
import type { ReportRow } from '../report.ts';
import type { TruthEntry } from '../types.ts';

/** A review row before its bucket: `{rid, kind, severity, detail}`. */
type ClassRow = Omit<ReportRow, 'bucket' | 'publication'>;

/** A catalogued class's detector over one finished truth entry. */
type ClassDetector = (entry: TruthEntry) => ClassRow[];

/** The one row an entry contributes to a class, or none when it holds
 * no site.
 *
 * ONE ROW PER ENTRY, NEVER PER SITE. Every one of these classes is
 * catalogued in `corpusCount` as a number of ENTRIES — `empty-stem-
 * section` is 347 sections across 342 of them — so a per-site row
 * would report a figure the catalogue cannot be read against. Each
 * site is named in `detail` instead, and none is lost. */
function entryRow(
	entry: TruthEntry,
	kind: string,
	sites: readonly string[],
): ClassRow[] {
	if (sites.length === 0) {
		return [];
	}
	return [
		{ detail: sites.join('; '), kind, rid: entry.id, severity: 'review' },
	];
}

export type { ClassDetector, ClassRow };
export { entryRow };
