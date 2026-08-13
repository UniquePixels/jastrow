import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { contentAnchor, type SemanticPatch } from '../patch/schema.ts';
import type { EntryResult } from './manifest.ts';
import {
	buildPilotReport,
	type ChunkOutput,
	DEFAULT_SAMPLE,
	type IngestContext,
	ingestChunk,
	renderPilotReport,
	selectSample,
} from './verify.ts';

const PIN = `sha256:${'a'.repeat(64)}`;
const DEFINITION = 'first meaning.—2) second meaning.';

function makeEntry(rid: string, definition: string = DEFINITION): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword: 'test',
		rid,
	};
}

/** A valid patch against `definition`, anchor computed for real. */
function makePatch(
	overrides: Partial<SemanticPatch> & { id: string; rid: string },
	definition: string = DEFINITION,
): SemanticPatch {
	return {
		confidence: 'high',
		defect_class: 'implied-one',
		expected_before: definition,
		expected_occurrences: 1,
		occurrence_index: 1,
		op: 'split',
		payload: { marker: '—2)' },
		prompt_version: 'v1',
		rationale: 'in-text run with no 1) before it',
		snapshot: PIN,
		target: `sense[]:${contentAnchor(definition)}`,
		...overrides,
	} as SemanticPatch;
}

function record(
	overrides: Partial<EntryResult> & { rid: string },
): EntryResult {
	return { disposition: 'clean', patches: [], ...overrides };
}

function jsonl(values: unknown[]): string {
	return values.map((v) => JSON.stringify(v)).join('\n');
}

function makeContext(
	rids: string[],
	overrides: Partial<IngestContext> = {},
): IngestContext {
	return {
		entries: new Map(rids.map((rid) => [rid, makeEntry(rid)])),
		pin: PIN,
		promptVersion: 'v1',
		rids,
		...overrides,
	};
}

function output(patches: unknown[], records: unknown[]): ChunkOutput {
	return {
		chunkId: 'chunk-00001',
		manifestText: jsonl(records),
		patchesText: jsonl(patches),
	};
}

describe('ingestChunk', () => {
	it('accepts a valid chunk: split + chained retag', () => {
		const split = makePatch({ id: 'P000001', rid: 'A00001' });
		const retag = makePatch(
			{
				id: 'P000002',
				op: 'retag',
				payload: { number: '1)' },
				rid: 'A00001',
			},
			'first meaning.',
		);
		const result = ingestChunk(
			output(
				[split, retag],
				[
					record({
						disposition: 'repaired',
						patches: ['P000001', 'P000002'],
						rid: 'A00001',
					}),
					record({ rid: 'A00002' }),
				],
			),
			makeContext(['A00001', 'A00002']),
		);
		expect(result.problems).toEqual([]);
		expect(result.rejects).toEqual([]);
		expect(result.patches.map((p) => p.id)).toEqual(['P000001', 'P000002']);
		expect(result.records).toHaveLength(2);
	});

	it('rejects a pin mismatch and re-dispositions the record', () => {
		const patch = makePatch({
			id: 'P000001',
			rid: 'A00001',
			snapshot: `sha256:${'b'.repeat(64)}`,
		});
		const result = ingestChunk(
			output(
				[patch],
				[
					record({
						disposition: 'repaired',
						patches: ['P000001'],
						rid: 'A00001',
					}),
				],
			),
			makeContext(['A00001']),
		);
		expect(result.problems).toEqual([]);
		expect(result.patches).toEqual([]);
		expect(result.rejects).toHaveLength(1);
		expect(result.rejects[0]?.reason).toContain('snapshot pin');
		const entry = result.records.find((r) => r.rid === 'A00001');
		expect(entry?.disposition).toBe('needs_human_judgment');
		expect(entry?.patches).toEqual([]);
		expect(entry?.escalation).toContain('P000001');
	});

	it('rejects a wrong prompt_version and a rid outside the chunk', () => {
		const wrongVersion = makePatch({
			id: 'P000001',
			prompt_version: 'v0',
			rid: 'A00001',
		});
		const outsider = makePatch({ id: 'P000002', rid: 'Z99999' });
		const result = ingestChunk(
			output(
				[wrongVersion, outsider],
				[
					record({
						disposition: 'needs_human_judgment',
						escalation: 'carries rejected work',
						patches: ['P000001', 'P000002'],
						rid: 'A00001',
					}),
				],
			),
			makeContext(['A00001']),
		);
		expect(result.rejects.map((r) => r.patchId).sort()).toEqual([
			'P000001',
			'P000002',
		]);
		expect(result.patches).toEqual([]);
	});

	it('salvages ids from a schema-invalid patch line', () => {
		const result = ingestChunk(
			output(
				[{ id: 'P000009', op: 'nonsense', rid: 'A00001' }],
				[
					record({
						disposition: 'needs_human_judgment',
						escalation: 'agent emitted an invalid patch',
						patches: ['P000009'],
						rid: 'A00001',
					}),
				],
			),
			makeContext(['A00001']),
		);
		expect(result.problems).toEqual([]);
		expect(result.rejects[0]?.patchId).toBe('P000009');
		expect(result.rejects[0]?.rid).toBe('A00001');
	});

	it('no-new-text violation re-dispositions needs_print_check', () => {
		const patch = makePatch({
			id: 'P000001',
			op: 'replace',
			payload: { find: 'first', replace: 'worst' },
			rid: 'A00001',
		});
		const result = ingestChunk(
			output(
				[patch],
				[
					record({
						disposition: 'repaired',
						patches: ['P000001'],
						rid: 'A00001',
					}),
				],
			),
			makeContext(['A00001']),
		);
		expect(result.rejects[0]?.redisposition).toBe('needs_print_check');
		expect(result.records[0]?.disposition).toBe('needs_print_check');
	});

	it('rejects a stale expected_before (target resolves nowhere)', () => {
		const stale = 'not the current definition.';
		const patch = makePatch(
			{
				id: 'P000001',
				op: 'retag',
				payload: { number: '1)' },
				rid: 'A00001',
			},
			stale,
		);
		const result = ingestChunk(
			output(
				[patch],
				[
					record({
						disposition: 'repaired',
						patches: ['P000001'],
						rid: 'A00001',
					}),
				],
			),
			makeContext(['A00001']),
		);
		expect(result.rejects[0]?.reason).toContain('resolved to 0');
		expect(result.records[0]?.disposition).toBe('needs_human_judgment');
	});

	it('rejects both halves of an overlapping-target pair', () => {
		const first = makePatch({ id: 'P000001', rid: 'A00001' });
		const second = makePatch({ id: 'P000002', rid: 'A00001' });
		const result = ingestChunk(
			output(
				[first, second],
				[
					record({
						disposition: 'needs_human_judgment',
						escalation: 'overlap emitted by agent',
						patches: ['P000001', 'P000002'],
						rid: 'A00001',
					}),
				],
			),
			makeContext(['A00001']),
		);
		expect(result.rejects.map((r) => r.patchId).sort()).toEqual([
			'P000001',
			'P000002',
		]);
		expect(result.patches).toEqual([]);
	});

	it('manifest incompleteness is chunk-fatal', () => {
		const result = ingestChunk(
			output([], [record({ rid: 'A00001' })]),
			makeContext(['A00001', 'A00002']),
		);
		expect(result.problems.join(' ')).toContain('A00002');
		expect(result.records).toEqual([]);
	});

	it('manifest listing an unknown patch id is chunk-fatal', () => {
		const result = ingestChunk(
			output(
				[],
				[
					record({
						disposition: 'repaired',
						patches: ['P000404'],
						rid: 'A00001',
					}),
				],
			),
			makeContext(['A00001']),
		);
		expect(result.problems.join(' ')).toContain('P000404');
	});
});

describe('selectSample', () => {
	const patches = [
		...['P000001', 'P000002', 'P000003'].map((id) =>
			makePatch({ confidence: 'low', id, rid: 'A00001' }),
		),
		...['P000004', 'P000005'].map((id) =>
			makePatch({ confidence: 'med', id, rid: 'A00002' }),
		),
		...Array.from({ length: 20 }, (_, i) =>
			makePatch({
				confidence: 'high',
				id: `P0001${String(i).padStart(2, '0')}`,
				rid: 'A00003',
			}),
		),
	];
	const records = Array.from({ length: 40 }, (_, i) =>
		record({ rid: `C${String(i).padStart(5, '0')}` }),
	);

	it('takes every low/med patch, samples high and clean', () => {
		const sample = selectSample(records, patches, {
			...DEFAULT_SAMPLE,
			seed: 7,
		});
		expect(sample.lowMed.map((p) => p.id).sort()).toEqual([
			'P000001',
			'P000002',
			'P000003',
			'P000004',
			'P000005',
		]);
		// 20 high × 0.2 = 4 → min 5 applies.
		expect(sample.high).toHaveLength(5);
		expect(sample.high.every((p) => p.confidence === 'high')).toBe(true);
		// 40 clean × 0.1 = 4 → min 10 applies.
		expect(sample.clean).toHaveLength(10);
	});

	it('is deterministic under a fixed seed and moves with it', () => {
		const config = { ...DEFAULT_SAMPLE, seed: 42 };
		const a = selectSample(records, patches, config);
		const b = selectSample(records, patches, config);
		expect(a).toEqual(b);
		const c = selectSample(records, patches, { ...DEFAULT_SAMPLE, seed: 43 });
		expect([...a.high, ...c.high].length).toBeGreaterThan(0);
	});

	it('never samples beyond the pool', () => {
		const sample = selectSample(records.slice(0, 3), patches.slice(0, 2), {
			cleanRate: 0.5,
			highRate: 0.5,
			minClean: 10,
			minHigh: 5,
			seed: 1,
		});
		expect(sample.clean).toHaveLength(3);
		expect(sample.high).toHaveLength(0);
	});
});

describe('buildPilotReport', () => {
	const records = [
		record({ rid: 'A00001' }),
		record({ disposition: 'repaired', patches: ['P000001'], rid: 'A00002' }),
		record({
			disposition: 'needs_print_check',
			escalation: 'lost parenthetical',
			patches: [],
			rid: 'A00003',
		}),
	];
	const sample = {
		clean: ['A00001'],
		high: [makePatch({ id: 'P000001', rid: 'A00002' })],
		lowMed: [],
	};

	it('computes rates from verdicts and counts the queue', () => {
		const report = buildPilotReport(
			records,
			[
				{
					patchId: 'P000404',
					reason: 'x',
					redisposition: 'needs_human_judgment',
					rid: 'A00002',
				},
			],
			sample,
			[{ note: 'wrong boundary', ok: false, patchId: 'P000001' }],
			[{ missed: true, note: 'swallowed marker', rid: 'A00001' }],
		);
		expect(report.errorRate).toBe(1);
		expect(report.missRate).toBe(1);
		expect(report.escalationQueue).toBe(1);
		expect(report.patchesAccepted).toBe(1);
		expect(report.patchesRejected).toBe(1);
		const rendered = renderPilotReport(report, 'Pilot');
		expect(rendered).toContain('100.0%');
		expect(rendered).toContain('Wrong patches: P000001');
		expect(rendered).toContain('Missed clean entries: A00001');
	});

	it('rates are zero when nothing was sampled', () => {
		const report = buildPilotReport(
			records,
			[],
			{ clean: [], high: [], lowMed: [] },
			[],
			[],
		);
		expect(report.errorRate).toBe(0);
		expect(report.missRate).toBe(0);
	});
});
