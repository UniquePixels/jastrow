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

/** Every review and patch kind this pipeline can emit, as
 * `[kind, publication, action]`.
 *
 * ONE LINE PER KIND, and deliberately not an object literal per kind.
 * Fifteen identical `{ action: …, publication: … }` wrappers are the
 * same three lines of punctuation fifteen times over, which reads as
 * duplication to a human and to Sonar alike; the tuple puts the three
 * things a reader wants — which kind, where it lands, what to do —
 * on the line they are asking about. The shape is restored by the
 * `.map` below, so `KindRule` is unchanged for every reader of it. */
const KIND_RULES: ReadonlyArray<readonly [string, Publication, string]> = [
	// New 2026-09-21 with the §2 shape. `partial` says "shown as
	// printed, never a lookup key", so an entry whose alternates are
	// ALL partial has no alternate search key until the print work in
	// #107 expands them. Nothing about the data is wrong — the row
	// exists so that population stays counted rather than becoming
	// invisible the moment the rule stops expanding abbreviations.
	[
		'headword-partial-only',
		'note',
		'Nothing to correct: the alternates are printed short, and expanding them against the print is #107. The entry is still found by its primary form.',
	],
	// `headword-multiword` retired 2026-09-21. It existed because the
	// old per-item grammar admitted a space its lexical set did not,
	// so every legitimate multi-word form (reduplication, spaced
	// variants, phrase headwords) was flagged for the space alone.
	// The line parser keeps a multi-word form as one form and says
	// nothing about it, which is what headword-design §4 rules.
	//
	// `blocks`, and the bar is unchanged: what a reader sees is a raw
	// notation-carrying string where a word should be. Under the §2
	// shape the population is what §3 calls a TEXT DEFECT — a `=`
	// introducing a gloss reference, a Latin word that is no numeral
	// — rather than anything the grammar merely could not fit.
	[
		'headword-unparsed',
		'blocks',
		'Correct the headword text at source or by patch so the line parses; the reader sees the raw string until then.',
	],
	// §3.1 rule 6's duplicate check, reported rather than halted on:
	// neither §3 nor §4 rules on what a repeated form means, and
	// print may set a word twice on one line for a reason the source
	// cannot show. Four entries over the committed tree.
	[
		'headword-duplicate-form',
		'defer',
		'Read the printed line and decide whether the repeat is print’s or the extractor’s; drop the duplicate form by patch if it is the latter. Nothing downstream reads an alternate as a key, so the entry is unaffected meanwhile.',
	],
	// headword-design §4's H2 rows and A01394. The forms are clean and
	// ARE written; only the layout is unsettled, and §3 rules that
	// display uncertainty does not block go-live. A flagged row is a
	// ticket, not a guess: no default template is invented.
	[
		'paren-group-close-unknown',
		'defer',
		'Read the printed line and add the display template by hand; two readings are possible from the source and neither is assumed. The entry renders without its grouping meanwhile.',
	],
	[
		'markup-carry',
		'defer',
		'Nothing to do: the composer closed the tag; the row records where the run crossed a unit boundary.',
	],
	[
		'page-confidence-low',
		'defer',
		'Check the placement against the print and correct it in the admin tool after go-live; no URL depends on it.',
	],
	[
		'page-confidence-medium',
		'defer',
		'Check the placement against the print and correct it in the admin tool after go-live; no URL depends on it.',
	],
	[
		'review-deferred',
		'defer',
		'Answer the sense-structure question in the admin tool after go-live; the entry renders meanwhile.',
	],
	[
		'upstream-changed',
		'blocks',
		'Re-judge the patch against the new export before the output is trusted.',
	],
	[
		'upstream-fixed',
		'blocks',
		'Archive the patch: the new export already carries its post-state.',
	],
	// Consolidation spec §4.2: Ruling C's one-record-per-rid consolidation
	// (and its carry-over overlap counterpart, Ruling F) drops a patch
	// whenever a later sweep's record for the same rid wins — silently,
	// until this row. The kept record already speaks for the rid, so
	// there is nothing left to correct; the row exists so the drop is
	// never invisible (`patch/apply.ts`'s `AcceptedCorpus.dropped` /
	// `droppedCarryOver`, `migrate/patches.ts`'s `recordConsolidatedAway`).
	[
		'patch-consolidated-away',
		'note',
		'Compare the dropped patch against the kept one; if it fixed something the kept one does not, re-file it as a reviewed patch.',
	],
];

/** The lookup behind every publication decision: the detected classes
 * and the kinds stated above, as one map from kind to rule. Read
 * through `ruleOf`, whose throw on a kind it does not hold is what
 * stops a new kind reaching the report unclassified. */
const PUBLICATION: ReadonlyMap<string, KindRule> = new Map([
	...CLASS_KINDS,
	...KIND_RULES.map(
		([kind, publication, action]): readonly [string, KindRule] => [
			kind,
			{ action, publication },
		],
	),
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
