import { describe, expect, it } from 'bun:test';
import {
	actionOf,
	classifyRows,
	PUBLICATION,
	publicationOf,
} from './publication.ts';
import { createReport, lineRow, type Publication } from './report.ts';

// Spec §3.1.1, one tuple per kind.
const TABLE: ReadonlyArray<readonly [string, Publication]> = [
	['headword-unparsed', 'blocks'],
	['upstream-fixed', 'blocks'],
	['upstream-changed', 'blocks'],
	['page-confidence-low', 'defer'],
	['page-confidence-medium', 'defer'],
	['markup-carry', 'defer'],
	['review-deferred', 'defer'],
	// The five catalogued classes `migrate/detectors/` now detects.
	['empty-stem-section', 'defer'],
	['homograph-roman-stranded-in-definition', 'defer'],
	['open-paren-in-rtl-span', 'defer'],
	['stranded-open-bracket', 'defer'],
	['superscript-subsection-contradicts-link-sub-section', 'defer'],
	['headword-duplicate-form', 'defer'],
	['headword-partial-only', 'note'],
	['paren-group-close-unknown', 'defer'],
	['patch-consolidated-away', 'note'],
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
	it('names no retired kind: `headword-multiword` went with the parser', () => {
		// The old per-item grammar admitted a space its lexical set did
		// not, so every legitimate multi-word form was flagged for the
		// space alone. The line parser says nothing about one, and a kind
		// left behind here would be triaged as live work.
		expect(PUBLICATION.has('headword-multiword')).toBe(false);
	});
	it('names no slug kind: names replaced them (URL names spec §7)', () => {
		// The six `slug-*` kinds retired WITH the field. A kind left
		// behind here would be triaged as live work by a reader of the
		// review report, and nothing on the import path can emit it.
		expect(
			[...PUBLICATION.keys()].filter((k) => k.startsWith('slug-')),
		).toEqual([]);
	});
});

describe('actionOf', () => {
	it('reads the kind row', () => {
		expect(actionOf('paren-group-close-unknown')).toContain('display template');
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
			lineRow('A00001: x', 'headword-unparsed'),
			lineRow('A00002: y', 'finish-failed', 'pipeline', 'fault'),
		];
		classifyRows(report);
		expect(report.rows[0]?.publication).toBe('blocks');
		expect('publication' in (report.rows[1] ?? {})).toBe(false);
	});
});
