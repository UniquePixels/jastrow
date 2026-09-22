/** The review report (consolidation spec §3.1.1): every review and
 * patch row of a run, split by whether it blocks v2 publication, plus
 * the catalogued classes that block by ruling and have no detector to
 * emit a row. The admin tool's tracker integration reads the deferred
 * rows. */
import { type Pattern, parsePatterns } from '../patch/patterns.ts';
import { DETECTED_CLASSES } from './detectors/classes.ts';
import { actionOf } from './publication.ts';
import type { Publication, Report, ReportRow } from './report.ts';

const REVIEW_REPORT_PATH = 'docs/v2/review-report.md';
const PATTERNS_PATH = 'data/patches/patterns.jsonl';
const CATALOGUED_TITLE = 'Catalogued, not yet detected';

const SECTIONS: ReadonlyArray<readonly [Publication, string]> = [
	['blocks', 'Before publication'],
	['defer', 'Deferred'],
	['note', 'Notes'],
];

/** Catalogued classes the maintainer ruled blocking that no detector
 * on the import path can see, largest first.
 *
 * `judgment` and `blocked` are named rather than "not `transform`". A
 * transform-routed class is answered by a registered rule that DOES
 * run on the import path, so it is not undetected — but `route` is
 * optional and absent until a row is triaged, and an UNTRIAGED row has
 * not been ruled `defer` by anyone. Listing it under a section that
 * cites that ruling would put words in the maintainer's mouth, so it
 * waits for its route. `status: candidate` excludes rows already
 * resolved. The counts are the catalogue's own `corpusCount`, measured
 * when the class was catalogued, not by this run.
 *
 * A class whose id is a REGISTERED DETECTOR KIND leaves the list the
 * moment that detector ships: the run then emits rows of its own,
 * which are counted and triaged in the sections above, and listing it
 * here as well would double-count it. `detected` is a parameter only
 * so a test can hand in a set of its own; the run takes the default. */
function undetectedClasses(
	rows: readonly Pattern[],
	detected: ReadonlySet<string> = DETECTED_CLASSES,
): Pattern[] {
	return rows
		.filter(
			(r) =>
				r.blocking === true &&
				(r.route === 'judgment' || r.route === 'blocked') &&
				r.status === 'candidate' &&
				!detected.has(r.id),
		)
		.toSorted(
			(a, b) => b.corpusCount - a.corpusCount || a.id.localeCompare(b.id, 'en'),
		);
}

/** The catalogue's undetected blocking classes, read at render time.
 * These are not report rows — they have no rid — so they are rendered
 * from the catalogue rather than counted with the run's rows. */
async function loadUndetectedClasses(
	path: string = PATTERNS_PATH,
	detected: ReadonlySet<string> = DETECTED_CLASSES,
): Promise<Pattern[]> {
	return undetectedClasses(
		parsePatterns(await Bun.file(path).text()),
		detected,
	);
}

/** One section: a `###` block per kind, kinds alphabetical, the kind's
 * one-line action once under its heading, then the rows in run order;
 * `_none_` when the section is empty. */
function section(title: string, rows: readonly ReportRow[]): string[] {
	const head = [`## ${title} (${rows.length})`, ''];
	if (rows.length === 0) {
		return [...head, '_none_'];
	}
	// A fixed locale keeps the committed report's order the same on
	// every machine.
	const kinds = [...new Set(rows.map((r) => r.kind))].toSorted((a, b) =>
		a.localeCompare(b, 'en'),
	);
	return [
		...head,
		...kinds.flatMap((kind, i) => {
			const lines = rows
				.filter((r) => r.kind === kind)
				.map((r) => `- ${r.rid}: ${r.detail}`);
			const block = [
				`### ${kind} (${lines.length})`,
				'',
				`**What to do:** ${actionOf(kind)}`,
				'',
				...lines,
			];
			return i === kinds.length - 1 ? block : [...block, ''];
		}),
	];
}

/** The catalogued-but-undetected section: one line per class — id,
 * catalogued count, publication class — and a sentence saying why it
 * holds no rids. */
function cataloguedSection(classes: readonly Pattern[]): string[] {
	const entries = classes.reduce((sum, c) => sum + c.corpusCount, 0);
	return [
		`## ${CATALOGUED_TITLE} (${classes.length} classes, ${entries} entries)`,
		'',
		'No detector on the import path can see a class listed here, so it produces no rows above and is counted in neither `blocks` nor `defer`. Counts are the catalogue\'s own `corpusCount` in `data/patches/patterns.jsonl`, measured when the class was catalogued, not by this run. Porting what is left is consolidation spec §10, "port judgment-class detectors"; an empty list means every catalogued blocking class is now a kind above.',
		'',
		'They are `defer` for publication: none moves a URL (post-consolidation review §10, decision 2). The catalogue keeps `blocking: true` on each — that flag gates the CUTOVER, which is a separate question from what a reader can correct after go-live.',
		'',
		'**What to do:** write the detector under `admin/pipeline/migrate/detectors/` and register it; the class then leaves this list and its rows are triaged above under its own kind.',
		'',
		...(classes.length === 0
			? ['_none_']
			: classes.map((c) => `- ${c.id} — ${c.corpusCount} entries — defer`)),
	];
}

/** Every non-pipeline row must carry a `publication` stamp before the
 * report renders. `classifyRows` runs once in `migrate.ts`, so a row
 * pushed after that call would land in no section at all and vanish
 * from the document without changing a single count. This turns that
 * into a failed run naming the kind. */
function assertClassified(report: Report): void {
	for (const row of report.rows) {
		if (row.bucket !== 'pipeline' && row.publication === undefined) {
			throw new Error(
				`review kind "${row.kind}" reached the review report unclassified; classifyRows must run after the last row is pushed`,
			);
		}
	}
}

/** The whole review report: a summary row per `publication` value plus
 * the catalogued classes, then a section for each in `SECTIONS` order
 * — `blocks`, `defer`, `note` — and the catalogued section last. Every
 * section renders even when empty (`_none_`), so a missing one is a
 * bug rather than a run with nothing to report, and the `blocks` count
 * can be read as the publication gate directly. */
function renderReviewReport(
	report: Report,
	catalogued: readonly Pattern[],
): string {
	assertClassified(report);
	const by = (p: Publication): ReportRow[] =>
		report.rows.filter((r) => r.publication === p);
	const cataloguedEntries = catalogued.reduce(
		(sum, c) => sum + c.corpusCount,
		0,
	);
	return [
		'# Review report',
		'',
		`Generated by \`bun data:import\` over ${report.entries} entries: every review and patch row of the run, by whether it must be resolved before v2 is published (consolidation spec §3.1.1). Deferred rows become tracker issues; notes do not. A row \`blocks\` when the reader sees a defect that cannot be corrected in the admin tool after go-live (maintainer, 2026-09-20).`,
		'',
		'Names replace slugs (`docs/specs/2026-09-21-url-names-design.md`): the six slug review kinds are gone, a name collision is a gate failure (§7), and §8 reopens why `headword-unparsed` blocks.',
		'',
		'| Publication | Rows |',
		'|---|---|',
		...SECTIONS.map(([p]) => `| ${p} | ${by(p).length} |`),
		`| ${CATALOGUED_TITLE.toLowerCase()} | 0 rows (${catalogued.length} classes, ${cataloguedEntries} entries) |`,
		...SECTIONS.flatMap(([p, title]) => ['', ...section(title, by(p))]),
		'',
		...cataloguedSection(catalogued),
	].join('\n');
}

export {
	loadUndetectedClasses,
	PATTERNS_PATH,
	REVIEW_REPORT_PATH,
	renderReviewReport,
	undetectedClasses,
};
