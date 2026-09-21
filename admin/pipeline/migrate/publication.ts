/** Which review rows block v2 publication (consolidation spec §3.1.1),
 * and what a reader of the review report is meant to DO about each
 * kind. The pair is fixed per kind; a review or patch kind this table
 * does not name throws, so a new kind cannot ship unclassified.
 *
 * The bar for `blocks` (maintainer, 2026-09-20): the reader sees a
 * defect that cannot be corrected in the admin tool after go-live. */
import { CLASS_ACTIONS } from './detectors/classes.ts';
import type { Publication, Report, ReportRow } from './report.ts';

/** One kind's entry: where it lands in the report, and the one
 * sentence the report prints once at the top of its section. */
interface KindRule {
	/** Imperative, one sentence, no rid — it heads the whole section. */
	action: string;
	publication: Publication;
}

/** The catalogued blocking classes `migrate/detectors/` detects, all
 * `defer` and stated once rather than a row each: `blocking: true` in
 * the catalogue gates the CUTOVER, while this table answers the
 * separate question of what a reader can correct after go-live, and
 * none of the five moves a URL (post-consolidation review §10,
 * decision 2). Each detector carries its own action sentence. */
const CLASS_KINDS: ReadonlyArray<readonly [string, KindRule]> = [
	...CLASS_ACTIONS,
].map(([kind, action]) => [kind, { action, publication: 'defer' }]);

const PUBLICATION: ReadonlyMap<string, KindRule> = new Map([
	...CLASS_KINDS,
	[
		// Split out of `headword-unparsed` 2026-09-21: `FORM` admits a
		// space and `LEXICAL` does not, so every multi-word headword
		// parsed and was then flagged for the space alone — 271 of the 300
		// rows the report called blocking. headword-design §4 rules the
		// shape legitimate (reduplication, spaced variants, phrase
		// headwords and phrase alternates), and it renders as printed.
		'headword-multiword',
		{
			action:
				'Nothing to do: a multi-word form is legitimate (headword-design §4); the rows are listed so the count stays visible.',
			publication: 'note',
		},
	],
	[
		// `blocks` FOR NOW, and the reason is reopened. The original one
		// — "the headword makes the slug, and slugs freeze at publication"
		// — died with the slug itself: a name may change and the old one
		// redirects (URL names spec U6, §8), so what is left is the
		// reader-visible headword defect. Re-ruled with the headword
		// schema decision (post-consolidation review §10 Q1).
		'headword-unparsed',
		{
			action:
				'Correct the headword text at source or by patch so the grammar accounts for it; the reader sees the raw string until then.',
			publication: 'blocks',
		},
	],
	[
		'markup-carry',
		{
			action:
				'Nothing to do: the composer closed the tag; the row records where the run crossed a unit boundary.',
			publication: 'defer',
		},
	],
	[
		'page-confidence-low',
		{
			action:
				'Check the placement against the print and correct it in the admin tool after go-live; no URL depends on it.',
			publication: 'defer',
		},
	],
	[
		'page-confidence-medium',
		{
			action:
				'Check the placement against the print and correct it in the admin tool after go-live; no URL depends on it.',
			publication: 'defer',
		},
	],
	[
		'review-deferred',
		{
			action:
				'Answer the sense-structure question in the admin tool after go-live; the entry renders meanwhile.',
			publication: 'defer',
		},
	],
	[
		'upstream-changed',
		{
			action:
				'Re-judge the patch against the new export before the output is trusted.',
			publication: 'blocks',
		},
	],
	[
		'upstream-fixed',
		{
			action:
				'Archive the patch: the new export already carries its post-state.',
			publication: 'blocks',
		},
	],
]);

/** The rule for a review or patch kind; throws on a kind the table
 * does not name (spec §3.1.1). */
function ruleOf(kind: string): KindRule {
	const rule = PUBLICATION.get(kind);
	if (rule === undefined) {
		throw new Error(
			`review kind "${kind}" has no publication class (spec §3.1.1)`,
		);
	}
	return rule;
}

/** What the report tells a reader to do about this kind. */
function actionOf(kind: string): string {
	return ruleOf(kind).action;
}

/** The row's publication class; `undefined` for a pipeline fault. */
function publicationOf(
	row: Pick<ReportRow, 'bucket' | 'kind'>,
): Publication | undefined {
	if (row.bucket === 'pipeline') {
		return;
	}
	return ruleOf(row.kind).publication;
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

export type { KindRule };
export { actionOf, classifyRows, PUBLICATION, publicationOf };
