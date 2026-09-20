import { describe, expect, it } from 'bun:test';
import { classifyRows, PUBLICATION, publicationOf } from './publication.ts';
import { createReport, lineRow, type Publication } from './report.ts';

// Spec §3.1.1, one tuple per kind.
const TABLE: ReadonlyArray<readonly [string, Publication]> = [
	['headword-unparsed', 'blocks'],
	['slug-unsafe', 'blocks'],
	['upstream-fixed', 'blocks'],
	['upstream-changed', 'blocks'],
	['page-confidence-low', 'defer'],
	['page-confidence-medium', 'defer'],
	['markup-carry', 'defer'],
	['review-deferred', 'defer'],
	['slug-changed', 'note'],
	['slug-new', 'note'],
	['slug-alias-new', 'note'],
	['slug-bare-held', 'note'],
	['slug-frozen-stem-drift', 'note'],
];

describe('PUBLICATION', () => {
	it('agrees in size with the test table, so an unlisted kind fails here', () => {
		expect(PUBLICATION.size).toBe(TABLE.length);
	});
	it('maps every table kind to the table value', () => {
		for (const [kind, expected] of TABLE) {
			expect(PUBLICATION.get(kind)).toBe(expected);
		}
	});
});

describe('publicationOf', () => {
	for (const [kind, expected] of TABLE) {
		it(`${kind} → ${expected}`, () => {
			expect(publicationOf({ bucket: 'review', kind })).toBe(expected);
		});
	}
	it('leaves a pipeline fault unclassified', () => {
		expect(
			publicationOf({ bucket: 'pipeline', kind: 'composition-failed' }),
		).toBeUndefined();
	});
	it('throws on a review kind the table does not name', () => {
		expect(() => publicationOf({ bucket: 'review', kind: 'new-kind' })).toThrow(
			'new-kind',
		);
	});
	it('does not read inherited object keys as kinds', () => {
		expect(() =>
			publicationOf({ bucket: 'review', kind: 'constructor' }),
		).toThrow('constructor');
	});
});

describe('classifyRows', () => {
	it('stamps review rows and leaves faults bare', () => {
		const report = createReport();
		report.rows = [
			lineRow('A00001: x', 'slug-unsafe'),
			lineRow('A00002: y', 'finish-failed', 'pipeline', 'fault'),
		];
		classifyRows(report);
		expect(report.rows[0]?.publication).toBe('blocks');
		expect('publication' in (report.rows[1] ?? {})).toBe(false);
	});
});
