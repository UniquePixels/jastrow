/** Which review rows block v2 publication (consolidation spec §3.1.1).
 * The value is fixed per kind; a review or patch kind this table does
 * not name throws, so a new kind cannot ship unclassified. */
import type { Publication, Report, ReportRow } from './report.ts';

const PUBLICATION: ReadonlyMap<string, Publication> = new Map([
	['headword-unparsed', 'blocks'],
	['markup-carry', 'defer'],
	['page-confidence-low', 'defer'],
	['page-confidence-medium', 'defer'],
	['review-deferred', 'defer'],
	['slug-alias-new', 'note'],
	['slug-bare-held', 'note'],
	['slug-changed', 'note'],
	['slug-frozen-stem-drift', 'note'],
	['slug-new', 'note'],
	['slug-unsafe', 'blocks'],
	['upstream-changed', 'blocks'],
	['upstream-fixed', 'blocks'],
]);

/** The row's publication class; `undefined` for a pipeline fault. */
function publicationOf(
	row: Pick<ReportRow, 'bucket' | 'kind'>,
): Publication | undefined {
	if (row.bucket === 'pipeline') {
		return;
	}
	const publication = PUBLICATION.get(row.kind);
	if (publication === undefined) {
		throw new Error(
			`review kind "${row.kind}" has no publication class (spec §3.1.1)`,
		);
	}
	return publication;
}

/** Stamp every review and patch row in place. Run once, after the last
 * row is pushed and before the report is written or rendered. */
function classifyRows(report: Report): void {
	for (const row of report.rows) {
		const publication = publicationOf(row);
		if (publication !== undefined) {
			row.publication = publication;
		}
	}
}

export { classifyRows, PUBLICATION, publicationOf };
