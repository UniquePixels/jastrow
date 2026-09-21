/** Which review rows block v2 publication (consolidation spec §3.1.1),
 * and what a reader of the review report is meant to DO about each
 * kind. The pair is fixed per kind; a review or patch kind this table
 * does not name throws, so a new kind cannot ship unclassified.
 *
 * The bar for `blocks` (maintainer, 2026-09-20): the reader sees a
 * defect that cannot be corrected in the admin tool after go-live. */
import type { Publication, Report, ReportRow } from './report.ts';

/** One kind's entry: where it lands in the report, and the one
 * sentence the report prints once at the top of its section. */
interface KindRule {
	/** Imperative, one sentence, no rid — it heads the whole section. */
	action: string;
	publication: Publication;
}

const PUBLICATION: ReadonlyMap<string, KindRule> = new Map([
	[
		// One of the five catalogued blocking classes now detected on the
		// import path (`migrate/detectors/`). `blocking: true` in the
		// catalogue gates the CUTOVER; `defer` here answers the separate
		// question of what a reader can correct after go-live, and none
		// of the five moves a URL (post-consolidation review §10,
		// decision 2).
		'empty-stem-section',
		{
			action:
				'Nothing to correct in the data: the blank stem heading shares the gloss of the block after it, and presenting a run of senseless stems as one is a rendering change (Phase 4).',
			publication: 'defer',
		},
	],
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
		// — no longer holds under the URL names spec (§8: a name may
		// change and the old one redirects), so what is left is the
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
		'homograph-roman-stranded-in-definition',
		{
			action:
				'Leave it until the anchor side is settled: moving the numeral into the headword alone would dangle 37 live anchors against the 3 that mis-resolve today.',
			publication: 'defer',
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
		'open-paren-in-rtl-span',
		{
			action:
				'Move the paren out of the Hebrew span in the admin tool after go-live so bidi draws it on the side the print page shows.',
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
		'slug-alias-new',
		{
			action: 'Nothing to do: a new alias is what a regenerating run adds.',
			publication: 'note',
		},
	],
	[
		'slug-bare-held',
		{
			action: 'Nothing to do: the bare stem keeps the owner it already had.',
			publication: 'note',
		},
	],
	[
		'slug-changed',
		{
			action:
				'Re-run `bun data:import --write` and commit the entry tree, or the committed slugs disagree with this run.',
			publication: 'note',
		},
	],
	[
		'slug-frozen-stem-drift',
		{
			action:
				'Nothing to do while names are unfrozen; the stem moved under a frozen slug.',
			publication: 'note',
		},
	],
	[
		'slug-new',
		{
			action: 'Nothing to do: a new entry takes a new slug.',
			publication: 'note',
		},
	],
	[
		'slug-unsafe',
		{
			action:
				'Patch the headword so the derived name carries no URL-unsafe character.',
			publication: 'blocks',
		},
	],
	[
		'stranded-open-bracket',
		{
			action:
				'Rejoin the bracketed span against the print page in the admin tool after go-live; deleting the stray bracket would discard the editorial marking it carries.',
			publication: 'defer',
		},
	],
	[
		'superscript-subsection-contradicts-link-sub-section',
		{
			action:
				'Adjudicate the printed superscript against the linked text and correct the losing side in the admin tool after go-live; no offset recovers it.',
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

/** The kinds that retire with the URL names work, and where that is
 * ruled. Rendered as one line in the report header so a reader is not
 * left triaging rows that are on their way out. */
const RETIRING_KINDS = [
	'slug-alias-new',
	'slug-bare-held',
	'slug-changed',
	'slug-frozen-stem-drift',
	'slug-new',
	'slug-unsafe',
] as const;

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
export { actionOf, classifyRows, PUBLICATION, publicationOf, RETIRING_KINDS };
