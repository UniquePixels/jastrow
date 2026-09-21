import { describe, expect, it } from 'bun:test';
import {
	actionOf,
	classifyRows,
	PUBLICATION,
	publicationOf,
	RETIRING_KINDS,
} from './publication.ts';
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
	['headword-multiword', 'note'],
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
			expect(PUBLICATION.get(kind)?.publication).toBe(expected);
		}
	});
	it('gives every kind a non-empty action ending in a full stop', () => {
		for (const [kind] of TABLE) {
			const action = PUBLICATION.get(kind)?.action ?? '';
			expect(action.length).toBeGreaterThan(0);
			expect(action.endsWith('.')).toBe(true);
		}
	});
	it('names only kinds the table classifies as retiring', () => {
		for (const kind of RETIRING_KINDS) {
			expect(PUBLICATION.has(kind)).toBe(true);
		}
	});
});

describe('actionOf', () => {
	it('reads the kind row', () => {
		expect(actionOf('headword-multiword')).toContain('headword-design §4');
	});
	it('throws on a kind the table does not name', () => {
		expect(() => actionOf('new-kind')).toThrow('new-kind');
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
