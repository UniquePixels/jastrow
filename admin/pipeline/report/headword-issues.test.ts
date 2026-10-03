import { describe, expect, it } from 'bun:test';
import type { Entry } from '../../entry/types.ts';
import { buildHeadwordIssues } from './headword-issues.ts';

// Two entries whose primary headword is a maqaf fragment (X5), so each
// yields exactly one issue row. Only the first one's line is on the
// processor's review list.
const MAQAF_FORM = 'הֵיכ־';

function entry(id: string): Entry {
	return {
		schemaVersion: 2,
		id,
		sefariaHeadword: MAQAF_FORM,
		headwords: [{ text: MAQAF_FORM }],
		senses: [{ gloss: 'x', units: [] }],
	};
}

/** The csv's `processor_flagged` column, keyed by rid. */
function flaggedByRid(csv: string): Map<string, string> {
	const out = new Map<string, string>();
	for (const line of csv.trim().split('\n').slice(1)) {
		const cells = line.slice(1, -1).split('","');
		out.set(cells[1] ?? '', cells.at(-1) ?? '');
	}
	return out;
}

describe('buildHeadwordIssues: the flagged column', () => {
	// The detail is what `finishEntry` mints: the whole line, then the
	// parser's reason. The review targets the LINE, so every form on it
	// has been seen.
	const rows = [
		{
			detail: `${MAQAF_FORM}, אַבְיוּ — an item has no Hebrew in it`,
			kind: 'headword-unparsed',
			rid: 'A00001',
		},
		// A non-headword kind on the second rid must not flag it.
		{ detail: 'markup', kind: 'markup-carry', rid: 'A00002' },
	];
	const issues = buildHeadwordIssues([entry('A00001'), entry('A00002')], rows);
	const flagged = flaggedByRid(issues.csv);

	it('a form whose line the processor reviewed is flagged', () => {
		expect(flagged.get('A00001')).toBe('true');
	});

	it('a form on an unreviewed line is not', () => {
		expect(flagged.get('A00002')).toBe('false');
	});

	it('the summary table counts the flagged row', () => {
		expect(issues.doc).toContain('| X5 maqaf fragment | 2 | 2 | 0 | 1 |');
	});
});
