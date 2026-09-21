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
	// The five catalogued classes `migrate/detectors/` now detects.
	['empty-stem-section', 'defer'],
	['homograph-roman-stranded-in-definition', 'defer'],
	['open-paren-in-rtl-span', 'defer'],
	['stranded-open-bracket', 'defer'],
	['superscript-subsection-contradicts-link-sub-section', 'defer'],
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
	it('lists exactly the slug kinds as retiring', () => {
		// Both directions: a `slug-*` kind left out of RETIRING_KINDS
		// would be triaged as live work, and a non-slug kind listed there
		// would be announced as retiring when nothing retires it.
		const retiring: string[] = [...RETIRING_KINDS];
		expect(retiring.toSorted()).toEqual(
			[...PUBLICATION.keys()].filter((k) => k.startsWith('slug-')).toSorted(),
		);
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
