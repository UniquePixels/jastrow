/**
 * The reviewed-kept list (`docs/decisions.md`, 10-06 reviewed kept):
 * report rows a person read against the print and found right as
 * stored, so they stop coming back as questions.
 *
 * The record file (`REVIEWED_KEPT_PATH` in `paths.ts`) is one JSON
 * object per line. A record keeps a row that matches it on all three
 * of `shape`, `rid` and `text` (compared in NFC). The report moves such
 * a row into its own section rather than dropping it, and names every
 * record no row matches as STALE: a patch that changed the stored text,
 * or a detector change that renamed the shape, sends the row back to
 * its shape section and the record to a person, never into silence.
 */

/** One record: the row it keeps (`shape`, `rid`, `text` in NFC), why
 * (`reason`), who read it (`source`) and when (`date`). */
interface KeptRecord {
	date: string;
	reason: string;
	rid: string;
	shape: string;
	source: string;
	text: string;
}

/** The fields every record carries, each a non-empty string. */
const KEPT_FIELDS = [
	'date',
	'reason',
	'rid',
	'shape',
	'source',
	'text',
] as const;

/** Read the record file: one JSON object per non-blank line. A line
 * that does not parse, or lacks a field, throws with its line number:
 * a malformed record would otherwise keep nothing and say nothing. */
function parseReviewedKept(jsonl: string): KeptRecord[] {
	const records: KeptRecord[] = [];
	for (const [i, line] of jsonl.split('\n').entries()) {
		if (line.trim() === '') {
			continue;
		}
		const value: Record<string, unknown> = JSON.parse(line);
		const bad = KEPT_FIELDS.filter(
			(key) => typeof value[key] !== 'string' || value[key] === '',
		);
		if (bad.length > 0) {
			throw new Error(
				`reviewed-kept line ${i + 1}: ${bad.join(', ')} missing or empty`,
			);
		}
		records.push(value as unknown as KeptRecord);
	}
	return records;
}

/** The three keys a record and a row are matched on, joined. The text
 * is compared in NFC: combining marks order differently, and a byte
 * comparison of Hebrew is a bug. */
function keyOf(row: { rid: string; shape: string; text: string }): string {
	return [row.shape, row.rid, row.text.normalize('NFC')].join('\n');
}

/** A row the list keeps, beside the record that keeps it. */
interface Kept<T> {
	record: KeptRecord;
	row: T;
}

/** Rows split three ways: those the list keeps, those it does not,
 * and the records no row matched. Every row comes back in exactly one
 * of the first two, so nothing is dropped. */
interface KeptSplit<T> {
	kept: Kept<T>[];
	open: T[];
	stale: KeptRecord[];
}

/** Split `rows` by `records`. A record matching several rows keeps
 * each of them; a record matching none is stale. */
function splitKept<T extends { rid: string; shape: string; text: string }>(
	rows: readonly T[],
	records: readonly KeptRecord[],
): KeptSplit<T> {
	const byKey = new Map(records.map((r) => [keyOf(r), r]));
	const used = new Set<string>();
	const kept: Kept<T>[] = [];
	const open: T[] = [];
	for (const row of rows) {
		const key = keyOf(row);
		const record = byKey.get(key);
		if (record === undefined) {
			open.push(row);
		} else {
			used.add(key);
			kept.push({ record, row });
		}
	}
	const stale = records.filter((r) => !used.has(keyOf(r)));
	return { kept, open, stale };
}

export type { Kept, KeptRecord, KeptSplit };
export { parseReviewedKept, splitKept };
