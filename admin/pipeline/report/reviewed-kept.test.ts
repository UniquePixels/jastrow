/**
 * The reviewed-kept list (`docs/decisions.md`, 10-06 reviewed kept)
 * through the headword-issues report: a listed row moves to its own
 * section and out of its shape's count, an unlisted row stays, and a
 * record no row matches is reported stale rather than dropped.
 */
import { describe, expect, it } from 'bun:test';
import type { Entry } from '../../entry/types.ts';
import { buildHeadwordIssues } from './headword-issues.ts';
import { type KeptRecord, parseReviewedKept } from './reviewed-kept.ts';

// A maqaf fragment (X5): one issue row per entry.
const MAQAF_FORM = 'הֵיכ־';

/** An entry whose only headword is the maqaf fragment. */
function entry(id: string): Entry {
	return {
		schemaVersion: 2,
		id,
		sefariaHeadword: MAQAF_FORM,
		headwords: [{ text: MAQAF_FORM }],
		senses: [{ gloss: 'x', units: [] }],
	};
}

/** One csv column, keyed by rid (7 is `reviewed_kept`). */
function columnByRid(csv: string, column: number): Map<string, string> {
	const out = new Map<string, string>();
	for (const line of csv.trim().split('\n').slice(1)) {
		const cells = line.slice(1, -1).split('","');
		out.set(cells[1] ?? '', cells[column] ?? '');
	}
	return out;
}

/** A record keeping the X5 row of `rid`, whose text is `text`. */
function keep(rid: string, text = MAQAF_FORM): KeptRecord {
	return {
		date: '2026-10-06',
		reason: 'print has it as stored',
		rid,
		shape: 'X5 maqaf fragment',
		source: 'maintainer print read',
		text,
	};
}

describe('buildHeadwordIssues: the reviewed-kept list (10-06)', () => {
	const two = [entry('A00001'), entry('A00002')];

	it('moves a listed row to its section and out of its shape count', () => {
		const issues = buildHeadwordIssues(two, [], [keep('A00002')]);
		expect(issues.doc).toContain('| X5 maqaf fragment | 1 | 1 | 0 | 0 |');
		expect(issues.doc).toContain('| Reviewed, kept | 1 | 1 | 0 | 0 |');
		expect(issues.doc).toContain('## Reviewed, kept (1)');
		expect(issues.doc).toContain('## Reviewed, kept: stale records (0)');
		expect(issues.kept).toBe(1);
	});

	it('marks the kept row in the csv, and only that row', () => {
		const kept = columnByRid(
			buildHeadwordIssues(two, [], [keep('A00002')]).csv,
			7,
		);
		expect(kept.get('A00002')).toBe('print has it as stored');
		expect(kept.get('A00001')).toBe('');
	});

	it('leaves an unlisted row in its shape', () => {
		const issues = buildHeadwordIssues(two, []);
		expect(issues.doc).toContain('| X5 maqaf fragment | 2 | 2 | 0 | 0 |');
		expect(issues.doc).toContain('| Reviewed, kept | 0 | 0 | 0 | 0 |');
	});

	it('reports a record whose text no longer matches as stale', () => {
		const issues = buildHeadwordIssues(two, [], [keep('A00002', 'הֵיכָ־')]);
		expect(issues.doc).toContain('| X5 maqaf fragment | 2 | 2 | 0 | 0 |');
		expect(issues.doc).toContain('## Reviewed, kept: stale records (1)');
		expect(issues.doc).toContain(
			'| [A00002](https://jastrow.app/#rid:A00002) | X5 maqaf fragment | הֵיכָ־ |',
		);
		expect(issues.stale).toBe(1);
	});

	it('matches the text in NFC', () => {
		const decomposed = MAQAF_FORM.normalize('NFD');
		expect(
			buildHeadwordIssues(two, [], [keep('A00002', decomposed)]).kept,
		).toBe(1);
	});
});

describe('parseReviewedKept', () => {
	it('reads one record per line and skips blank lines', () => {
		const line = JSON.stringify(keep('A00002'));
		expect(parseReviewedKept(`${line}\n\n${line}\n`)).toHaveLength(2);
	});

	it('refuses a record missing a field, by line number', () => {
		const { reason: _dropped, ...partial } = keep('A00002');
		expect(() => parseReviewedKept(JSON.stringify(partial))).toThrow(
			'reviewed-kept line 1: reason missing or empty',
		);
	});
});
