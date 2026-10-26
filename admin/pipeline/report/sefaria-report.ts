// biome-ignore-all lint/style/noExcessiveLinesPerFile: the rows, the log and the three documents rendered from them, in one place so a column cannot drift between them.
/**
 * The Sefaria appendix (`docs/decisions.md`, 10-16 upstream report):
 * the rows of data errors we send upstream, generated from the
 * reviewed patch records.
 *
 * The maintainer's bar, verbatim: "this is my reputation here, so
 * whatever is sent to them must be solid and verified. No slop, no
 * garbage, no ambiguous etc. Just solid, errors from OCR or Sefaria
 * parsing." It is built in as four hard filters, applied in order. A
 * patch that fails one goes to the review list with that filter's
 * reason, never into the appendix:
 *
 * 1. **Case 1 only** (`scopeReason`): Sefaria's own error. Never a
 *    correction of print's error (anything carrying an annotation, or
 *    citing 10-13 case 2/3/4, or a recorded deviation), never
 *    Jastrow's convention or our own structure (`NOT_UPSTREAM_CLASSES`,
 *    `NOT_UPSTREAM_OPS`).
 * 2. **Evidence** (`evidenceOf`, `retargetProof`): the rationale names
 *    print evidence (an hOCR read, a scan leaf, a maintainer print read
 *    with its date or worklist), or, for a cross-reference retarget,
 *    the cite's own words name `X N` and exactly one entry of the
 *    family carries `N` in Sefaria's own data.
 * 3. **Traceable to Sefaria's raw string** (`changeOf`): the patch's
 *    text, with its context, occurs exactly once in the RAW source
 *    record of the same rid. Patches apply after the transforms, so
 *    `expected_before` is post-transform text; where the transforms
 *    changed it, or it occurs twice, the row is not traceable.
 * 4. **Still present upstream**: the same check, read against the
 *    source as it is now. A re-fetch that fixed the error leaves the
 *    text absent, and the patch's own snapshot pin, which then differs
 *    from the source's, names the reason `no longer in source`.
 *
 * Pure: the caller (`admin/pipeline/sefaria.ts`) reads the files and
 * writes the three documents.
 */
import {
	leafOutsideEntry,
	type PageLookup,
	pageOfLeaf,
} from '../patch/locator.ts';
import type { SemanticPatch } from '../patch/schema.ts';
import {
	ABSENT,
	BOUNDARY,
	changeOf,
	EMPTY,
	type Exclusion,
	exclude,
	isExclusion,
	type RawRecord,
} from './sefaria-change.ts';
import {
	evidenceFor,
	indexSource,
	type SourceIndex,
	scopeReason,
} from './sefaria-evidence.ts';

/** One line of the submission log (`docs/sefaria-submissions.jsonl`),
 * hand-maintained by the maintainer: a batch sent, and what it named. */
interface Submission {
	batch: string;
	channel: string;
	classes?: string[];
	date: string;
	patch_ids?: string[];
	response: string;
}

/** Everything one build reads. `snapshot` is the source's pin as it is
 * now (`sha256:<hex>`). */
interface AppendixInputs {
	pages: PageLookup;
	patches: readonly SemanticPatch[];
	snapshot: string;
	source: ReadonlyMap<string, RawRecord>;
	submissions: readonly Submission[];
}

/** One appendix row: the CSV's columns, in order. */
interface AppendixRow {
	class: string;
	corrected_text: string;
	evidence: string;
	field: string;
	first_seen: string;
	patch_id: string;
	rid: string;
	scan: string;
	sefaria_headword: string;
	sefaria_oid: string;
	sefaria_text: string;
	submitted_batch: string;
}

/** One review-list row: a patch the appendix leaves out, and why. */
interface ReviewRow extends Exclusion {
	class: string;
	op: string;
	patch_id: string;
	rid: string;
}

/** The three documents and the rows behind them. */
interface SefariaAppendix {
	csv: string;
	doc: string;
	review: ReviewRow[];
	reviewCsv: string;
	rows: AppendixRow[];
}

const DATE = /\d{4}-\d{2}-\d{2}/u;
const IIIF =
	/https:\/\/iiif\.archive\.org\/iiif\/dictionaryoftarg0(?<volume>[12])jastuoft\$(?<index>\d+)\/full\/[^\s)]+/u;
const IIIF_ALL = new RegExp(IIIF.source, 'gu');

// ---------------------------------------------------------------- rows

const scanUrl = (volume: number, leaf: number): string =>
	`https://iiif.archive.org/iiif/dictionaryoftarg0${volume}jastuoft$${leaf + 1}/full/1400,/0/default.jpg`;

/** Every scan the rationale links must show a page the entry is on
 * (its own page to the page the next entry starts on): evidence read off
 * another leaf is not evidence for this entry. */
function scanProblem(
	patch: SemanticPatch,
	pages: PageLookup,
): Exclusion | undefined {
	for (const linked of patch.rationale.matchAll(IIIF_ALL)) {
		const outside = leafOutsideEntry(
			pages,
			patch.rid,
			Number(linked.groups?.['volume']),
			Number(linked.groups?.['index']) - 1,
		);
		if (outside !== undefined) {
			return exclude('scan link outside the entry', outside);
		}
	}
	return undefined;
}

/** The scan column: the leaf the rationale links, or else the leaf of
 * the page the entry starts on (page index), marked so. */
function scanOf(patch: SemanticPatch, pages: PageLookup): string {
	const linked = IIIF.exec(patch.rationale);
	if (linked !== null) {
		const volume = Number(linked.groups?.['volume']);
		const leaf = Number(linked.groups?.['index']) - 1;
		const page = pageOfLeaf(pages, volume, leaf);
		const where = page === undefined ? '' : `p. ${page} · `;
		return `vol. ${volume} ${where}leaf ${leaf} · ${linked[0]}`;
	}
	const entry = pages.entries.get(patch.rid);
	const leaf =
		entry === undefined
			? undefined
			: pages.leaves.get(`${entry.volume}:${entry.page}`);
	if (entry === undefined || leaf === undefined) {
		return '';
	}
	return `vol. ${entry.volume} p. ${entry.page}${entry.column} · leaf ${leaf} · ${scanUrl(entry.volume, leaf)} (entry start)`;
}

/** The first batch of the log that names the patch, or names its
 * class and was sent on or after the patch was first seen: a batch that
 * sent a class cannot have sent a row found after it went out. */
function batchOf(
	patch: SemanticPatch,
	submissions: readonly Submission[],
	firstSeen: string,
): string {
	return (
		submissions.find(
			(s) =>
				(s.patch_ids ?? []).includes(patch.id) ||
				((s.classes ?? []).includes(patch.defect_class) && firstSeen <= s.date),
		)?.batch ?? ''
	);
}

/** One patch through every filter: its row, or the first exclusion. */
function rowOf(
	patch: SemanticPatch,
	inputs: AppendixInputs,
	index: SourceIndex,
): AppendixRow | Exclusion {
	const out = scopeReason(patch);
	const record = inputs.source.get(patch.rid);
	if (out !== undefined) {
		return out;
	}
	if (record === undefined) {
		return exclude('no source record', patch.rid);
	}
	const evidence = evidenceFor(patch, index);
	if ('reason' in evidence) {
		return evidence;
	}
	const scanned = scanProblem(patch, inputs.pages);
	if (scanned !== undefined) {
		return scanned;
	}
	const change = changeOf(patch, record);
	if (isExclusion(change)) {
		return change.reason === 'not traceable to source' &&
			patch.snapshot !== inputs.snapshot
			? exclude('no longer in source', `pinned to ${patch.snapshot}`)
			: change;
	}
	if (change.sefaria === change.corrected) {
		return exclude('no change in Sefaria’s fields', change.field);
	}
	const firstSeen = DATE.exec(patch.prompt_version)?.[0];
	if (firstSeen === undefined) {
		return exclude('no tranche date', patch.prompt_version);
	}
	return {
		class: patch.defect_class,
		corrected_text: change.corrected,
		evidence: evidence.evidence,
		field: change.field,
		first_seen: firstSeen,
		patch_id: patch.id,
		rid: patch.rid,
		scan: scanOf(patch, inputs.pages),
		sefaria_headword: record.headword,
		sefaria_oid: record._id.$oid,
		sefaria_text: change.sefaria,
		submitted_batch: batchOf(patch, inputs.submissions, firstSeen),
	};
}

// ----------------------------------------------------------- the log

const SUBMISSION_STRINGS = ['batch', 'channel', 'date'] as const;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/u;

/** Whether `text` is a real calendar date written `YYYY-MM-DD`: the
 * shape, and a day that exists (`2026-13-01` and `2026-02-30` do not).
 * `batchOf` compares these strings, so a date in any other form would
 * compare wrongly without a word. */
function isIsoDate(text: string): boolean {
	if (!ISO_DATE.test(text)) {
		return false;
	}
	const date = new Date(`${text}T00:00:00Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(text);
}

function listOf(value: unknown): string[] | undefined {
	return Array.isArray(value) && value.every((v) => typeof v === 'string')
		? value
		: undefined;
}

/** What is wrong with one parsed log line, or `[]`. */
function submissionProblems(value: Record<string, unknown>): string[] {
	const problems = SUBMISSION_STRINGS.filter(
		(key) => typeof value[key] !== 'string' || value[key] === '',
	).map((key) => `${key} missing or empty`);
	const date = value['date'];
	if (typeof date === 'string' && date !== '' && !isIsoDate(date)) {
		problems.push(`date "${date}" is not a YYYY-MM-DD date`);
	}
	if (typeof value['response'] !== 'string') {
		problems.push('response missing (use "" until one comes)');
	}
	const ids = listOf(value['patch_ids']);
	const classes = listOf(value['classes']);
	if (ids === undefined && classes === undefined) {
		problems.push('names neither patch_ids nor classes');
	}
	return problems;
}

/** Read the submission log: one JSON object per non-blank line, each a
 * batch the maintainer sent. A malformed line throws with its number,
 * because a batch read wrongly marks rows new that Sefaria already has. */
function parseSubmissions(text: string): Submission[] {
	const out: Submission[] = [];
	for (const [i, line] of text.split('\n').entries()) {
		if (line.trim() === '') {
			continue;
		}
		let value: unknown;
		try {
			value = JSON.parse(line);
		} catch (error) {
			throw new Error(`sefaria-submissions line ${i + 1}: not JSON`, {
				cause: error,
			});
		}
		const problems =
			typeof value === 'object' && value !== null && !Array.isArray(value)
				? submissionProblems(value as Record<string, unknown>)
				: ['not a JSON object'];
		if (problems.length > 0) {
			throw new Error(
				`sefaria-submissions line ${i + 1}: ${problems.join('; ')}`,
			);
		}
		out.push(value as Submission);
	}
	return out;
}

// ---------------------------------------------------------- rendering

const COLUMNS: readonly (keyof AppendixRow)[] = [
	'rid',
	'sefaria_oid',
	'sefaria_headword',
	'class',
	'field',
	'sefaria_text',
	'corrected_text',
	'evidence',
	'scan',
	'patch_id',
	'first_seen',
	'submitted_batch',
];

const REVIEW_COLUMNS: readonly (keyof ReviewRow)[] = [
	'patch_id',
	'rid',
	'class',
	'op',
	'reason',
	'detail',
];

const quote = (value: string): string => `"${value.replaceAll('"', '""')}"`;

function csvOf<T>(columns: readonly (keyof T)[], rows: readonly T[]): string {
	const lines = [columns.map(String).join(',')];
	for (const row of rows) {
		lines.push(columns.map((c) => quote(String(row[c]))).join(','));
	}
	return `${lines.join('\n')}\n`;
}

function countBy<T>(
	items: readonly T[],
	key: (item: T) => string,
): [string, number][] {
	const counts = new Map<string, number>();
	for (const item of items) {
		counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
	}
	return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** The class table: rows, new and submitted per class. */
function classLines(rows: readonly AppendixRow[]): string[] {
	const lines = ['| class | rows | new | submitted |', '|---|---|---|---|'];
	for (const [name, n] of countBy(rows, (r) => r.class)) {
		const sent = rows.filter(
			(r) => r.class === name && r.submitted_batch !== '',
		).length;
		lines.push(`| ${name} | ${n} | ${n - sent} | ${sent} |`);
	}
	return lines;
}

/** The log table, and any patch id it names that no row carries: a row
 * Sefaria has that left the appendix (fixed upstream, or refiltered). */
function logLines(
	rows: readonly AppendixRow[],
	submissions: readonly Submission[],
): string[] {
	if (submissions.length === 0) {
		return ['No batch has been sent yet: every row is new.'];
	}
	const lines = [
		'| batch | date | channel | rows | response |',
		'|---|---|---|---|---|',
	];
	for (const s of submissions) {
		const n = rows.filter((r) => r.submitted_batch === s.batch).length;
		lines.push(
			`| ${s.batch} | ${s.date} | ${s.channel} | ${n} | ${s.response} |`,
		);
	}
	const ids = new Set(rows.map((r) => r.patch_id));
	const gone = submissions.flatMap((s) =>
		(s.patch_ids ?? []).filter((id) => !ids.has(id)),
	);
	lines.push(
		'',
		gone.length === 0
			? 'Every patch id the log names is an appendix row.'
			: `Patch ids the log names that no appendix row carries (fixed upstream, or refiltered): ${gone.join(', ')}.`,
	);
	return lines;
}

function render(
	rows: readonly AppendixRow[],
	review: readonly ReviewRow[],
	submissions: readonly Submission[],
): string {
	const fresh = rows.filter((r) => r.submitted_batch === '').length;
	const lines = [
		'# Sefaria appendix — summary',
		'',
		'Generated by `bun data:sefaria` from the reviewed patch records, the',
		'raw source and the submission log (`docs/sefaria-submissions.jsonl`).',
		'The rows are `sefaria-appendix.csv`; every patch a filter refused is',
		'in `sefaria-review.csv` with its reason. The filters, and how to read',
		'a row, are in [`../sefaria-report.md`](../sefaria-report.md).',
		'',
		`**${rows.length} rows** (${fresh} new, ${rows.length - fresh} submitted); ${review.length} patches in the review list.`,
		'',
		'## Rows by class',
		'',
		...classLines(rows),
		'',
		'## Excluded by reason',
		'',
		'| reason | patches |',
		'|---|---|',
		...countBy(review, (r) => r.reason).map(
			([reason, n]) => `| ${reason} | ${n} |`,
		),
		'',
		'## Submitted',
		'',
		...logLines(rows, submissions),
		'',
		'## Notation',
		'',
		`- \`${BOUNDARY}\` in a text cell is a boundary between two sense objects: the text after it is the next sense, its \`number\` first.`,
		`- \`${ABSENT}\` is a field the record does not carry; \`${EMPTY}\` is a field left empty.`,
		'- A `field` of the form `content.senses[0–1]` names two adjacent senses, read as the first definition, then the boundary, the second number and the second definition.',
		'- `alt_headwords` and `refs` without an index are the whole array, as JSON.',
	];
	return `${lines.join('\n')}\n`;
}

/** Every reviewed patch through the four filters, rendered. */
function buildSefariaAppendix(inputs: AppendixInputs): SefariaAppendix {
	const index = indexSource(inputs.source, inputs.patches);
	const rows: AppendixRow[] = [];
	const review: ReviewRow[] = [];
	for (const patch of inputs.patches) {
		const result = rowOf(patch, inputs, index);
		if ('reason' in result) {
			review.push({
				...result,
				class: patch.defect_class,
				op: patch.op,
				patch_id: patch.id,
				rid: patch.rid,
			});
		} else {
			rows.push(result);
		}
	}
	rows.sort(
		(a, b) =>
			a.class.localeCompare(b.class) ||
			a.rid.localeCompare(b.rid) ||
			a.patch_id.localeCompare(b.patch_id),
	);
	review.sort(
		(a, b) =>
			a.reason.localeCompare(b.reason) || a.patch_id.localeCompare(b.patch_id),
	);
	return {
		csv: csvOf(COLUMNS, rows),
		doc: render(rows, review, inputs.submissions),
		review,
		reviewCsv: csvOf(REVIEW_COLUMNS, review),
		rows,
	};
}

export type {
	AppendixInputs,
	AppendixRow,
	ReviewRow,
	SefariaAppendix,
	Submission,
};
export { buildSefariaAppendix, parseSubmissions };
