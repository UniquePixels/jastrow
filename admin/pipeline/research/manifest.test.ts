import { describe, expect, it } from 'bun:test';
import type { SemanticPatch } from '../patch/schema.ts';
import {
	type EntryResult,
	ManifestFormatError,
	parseManifest,
	parseManifestLine,
	reconcilePatches,
	replayGate,
	unresolvedNeeds,
	validateManifest,
} from './manifest.ts';

/** Minimal valid record per disposition, for building test lines. */
const CLEAN = { disposition: 'clean', patches: [], rid: 'A00001' };
const REPAIRED = {
	disposition: 'repaired',
	patches: ['P000001'],
	rid: 'B00002',
};
const NEEDS_PRINT = {
	disposition: 'needs_print_check',
	escalation: 'lost parenthetical; repair requires print',
	patches: [],
	rid: 'C00003',
};
const NEEDS_HUMAN = {
	disposition: 'needs_human_judgment',
	escalation: 'ambiguous sense boundary',
	patches: ['P000002'],
	resolution: { decided_on: '2026-08-12', decision: 'split per proposal' },
	rid: 'D00004',
};

function line(record: unknown): string {
	return JSON.stringify(record);
}

/** A minimal corpus patch for reconciliation tests. */
function makePatch(id: string, rid: string): SemanticPatch {
	return {
		confidence: 'high',
		defect_class: 'ocr-marker',
		expected_before: 'l) emergency',
		expected_occurrences: 1,
		id,
		occurrence_index: 1,
		op: 'replace',
		payload: { find: 'l)', replace: '1)' },
		prompt_version: 'v1',
		rationale: 'OCR glyph confusion',
		rid,
		snapshot: `sha256:${'a'.repeat(64)}`,
		target: `sense[]:${'0'.repeat(8)}`,
	};
}

describe('parseManifestLine', () => {
	it('parses every disposition shape', () => {
		for (const record of [CLEAN, REPAIRED, NEEDS_PRINT, NEEDS_HUMAN]) {
			expect(parseManifestLine(line(record), 1).rid).toBe(
				(record as { rid: string }).rid,
			);
		}
	});

	it('rejects invalid JSON with the line number', () => {
		expect(() => parseManifestLine('{nope', 7)).toThrow('manifest line 7');
	});

	it('rejects a bad rid and a bad disposition together', () => {
		try {
			parseManifestLine(
				line({ disposition: 'fixed', patches: [], rid: 'nope' }),
				1,
			);
			throw new Error('expected ManifestFormatError');
		} catch (e) {
			if (!(e instanceof ManifestFormatError)) {
				throw e;
			}
			expect(e.reasons).toHaveLength(2);
			expect(e.reasons[0]).toContain('rid');
			expect(e.reasons[1]).toContain('disposition');
		}
	});

	it('rejects a clean entry carrying patches', () => {
		expect(() =>
			parseManifestLine(line({ ...CLEAN, patches: ['P000009'] }), 1),
		).toThrow('clean entry cannot carry patches');
	});

	it('rejects a repaired entry with no patches', () => {
		expect(() =>
			parseManifestLine(line({ ...REPAIRED, patches: [] }), 1),
		).toThrow('requires at least one patch');
	});

	it('rejects needs_* rows without escalation', () => {
		const { escalation, ...bare } = NEEDS_PRINT;
		expect(escalation).toBeDefined();
		expect(() => parseManifestLine(line(bare), 1)).toThrow(
			'non-empty escalation',
		);
	});

	it('rejects escalation on a repaired row', () => {
		expect(() =>
			parseManifestLine(line({ ...REPAIRED, escalation: 'found more' }), 1),
		).toThrow('only allowed on needs_*');
	});

	it('rejects resolution on a clean row', () => {
		expect(() =>
			parseManifestLine(
				line({
					...CLEAN,
					resolution: { decided_on: '2026-08-12', decision: 'ok' },
				}),
				1,
			),
		).toThrow('resolution is only allowed on needs_* rows');
	});

	it('rejects a resolution without a review date', () => {
		expect(() =>
			parseManifestLine(
				line({
					...NEEDS_HUMAN,
					resolution: { decided_on: 'yesterday', decision: 'ok' },
				}),
				1,
			),
		).toThrow('YYYY-MM-DD');
	});

	it('rejects repeated patch ids in one record', () => {
		expect(() =>
			parseManifestLine(
				line({ ...REPAIRED, patches: ['P000001', 'P000001'] }),
				1,
			),
		).toThrow('must not repeat');
	});
});

describe('parseManifest', () => {
	it('parses JSONL, skipping blank lines', () => {
		const text = `${line(CLEAN)}\n\n${line(REPAIRED)}\n`;
		expect(parseManifest(text).map((r) => r.rid)).toEqual(['A00001', 'B00002']);
	});
});

describe('validateManifest (completeness)', () => {
	const records = parseManifest(
		[CLEAN, REPAIRED, NEEDS_PRINT].map(line).join('\n'),
	);

	it('passes when the record set equals the input rid set', () => {
		expect(validateManifest(records, ['A00001', 'B00002', 'C00003'])).toEqual(
			[],
		);
	});

	it('reports missing, unknown, and duplicate rids together', () => {
		const doubled = [...records, records[0] as EntryResult];
		const problems = validateManifest(doubled, ['A00001', 'B00002', 'Z09999']);
		const reasons = problems.map((p) => p.reason);
		expect(reasons).toHaveLength(3);
		expect(problems.find((p) => p.reason.includes('duplicate'))?.rids).toEqual([
			'A00001',
		]);
		expect(
			problems.find((p) => p.reason.includes('without a record'))?.rids,
		).toEqual(['Z09999']);
		expect(
			problems.find((p) => p.reason.includes('not in the input'))?.rids,
		).toEqual(['C00003']);
	});
});

describe('reconcilePatches', () => {
	const records = parseManifest([REPAIRED, NEEDS_HUMAN].map(line).join('\n'));

	it('passes when every patch is listed exactly once under its rid', () => {
		const corpus = [
			makePatch('P000001', 'B00002'),
			makePatch('P000002', 'D00004'),
		];
		expect(reconcilePatches(records, corpus)).toEqual([]);
	});

	it('reports a listed patch missing from the corpus', () => {
		const problems = reconcilePatches(records, [
			makePatch('P000002', 'D00004'),
		]);
		expect(problems.some((p) => p.reason.includes('P000001'))).toBe(true);
	});

	it('reports a corpus patch no record lists', () => {
		const corpus = [
			makePatch('P000001', 'B00002'),
			makePatch('P000002', 'D00004'),
			makePatch('P000003', 'B00002'),
		];
		const problems = reconcilePatches(records, corpus);
		expect(problems).toHaveLength(1);
		expect(problems[0]?.reason).toContain('P000003');
	});

	it('reports a rid mismatch between record and patch', () => {
		const corpus = [
			makePatch('P000001', 'X00099'),
			makePatch('P000002', 'D00004'),
		];
		const problems = reconcilePatches(records, corpus);
		expect(problems.some((p) => p.reason.includes('belongs to X00099'))).toBe(
			true,
		);
	});

	it('reports a patch listed by more than one record', () => {
		const shared = parseManifest(
			[REPAIRED, { ...NEEDS_HUMAN, patches: ['P000001'] }].map(line).join('\n'),
		);
		const problems = reconcilePatches(shared, [makePatch('P000001', 'B00002')]);
		expect(
			problems.some((p) => p.reason.includes('more than one record')),
		).toBe(true);
	});
});

describe('replayGate', () => {
	it('blocks on unresolved needs_* rows, naming every rid', () => {
		const records = parseManifest(
			[NEEDS_PRINT, { ...NEEDS_PRINT, rid: 'E00005' }, CLEAN]
				.map(line)
				.join('\n'),
		);
		expect(unresolvedNeeds(records).map((r) => r.rid)).toEqual([
			'C00003',
			'E00005',
		]);
		const gate = replayGate(records);
		expect(gate).toHaveLength(1);
		expect(gate[0]?.rids).toEqual(['C00003', 'E00005']);
	});

	it('opens once every needs_* row carries a resolution', () => {
		const records = parseManifest(
			[NEEDS_HUMAN, CLEAN, REPAIRED].map(line).join('\n'),
		);
		expect(replayGate(records)).toEqual([]);
	});
});
