import { describe, expect, it } from 'bun:test';
import {
	actionOf,
	classifyRows,
	PUBLICATION,
	publicationOf,
} from './publication.ts';
import { createReport, lineRow } from './report.ts';

describe('PUBLICATION', () => {
	it('gives every kind a non-empty action ending in a full stop', () => {
		for (const { action } of PUBLICATION.values()) {
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
	it('reads every kind from the table', () => {
		for (const [kind, rule] of PUBLICATION) {
			expect(publicationOf({ bucket: 'review', kind })).toBe(rule.publication);
		}
	});
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
