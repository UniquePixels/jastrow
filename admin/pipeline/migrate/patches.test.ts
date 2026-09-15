import { describe, expect, it } from 'bun:test';
import type { ComposeResult } from '../body/compose.ts';
import type { ApplyProblem, PatchDrift } from '../patch/apply.ts';
import { patchesByRid } from '../patch/apply.ts';
import { contentAnchor, type SemanticPatch } from '../patch/schema.ts';
import {
	markMissingTargets,
	type PatchGroups,
	recordPatchOutcomes,
} from './patches.ts';
import { createReport } from './report.ts';

const PIN = `sha256:${'a'.repeat(64)}`;
const MISSING_RID = 'Z99999';
const RID = 'D00001';

/** A minimal replace patch, overridable per test — same shape as
 * `patch/drift.test.ts`'s fixture. */
function patch(overrides: Partial<SemanticPatch> = {}): SemanticPatch {
	const before = overrides.expected_before ?? 'anything';
	return {
		confidence: 'high',
		defect_class: 'ocr-marker',
		expected_before: before,
		expected_occurrences: 1,
		id: 'P000001',
		occurrence_index: 1,
		op: 'replace',
		payload: { find: 'a', replace: 'b' },
		prompt_version: 'v1',
		rationale: 'fixture',
		rid: MISSING_RID,
		snapshot: PIN,
		target: `sense[]:${contentAnchor(before)}`,
		...overrides,
	} as SemanticPatch;
}

/** A `ComposeResult` stub for `recordPatchOutcomes`: only the three
 * fields it reads (`patchProblems`, `patchDrift`,
 * `carryOver.absorbed`) need real values; everything else is a
 * minimal stub typed via `as ComposeResult`. */
function composeResult(overrides: {
	absorbed?: string[];
	carried?: string[];
	patchDrift?: PatchDrift[];
	patchProblems?: ApplyProblem[];
}): ComposeResult {
	return {
		carryOver: {
			absorbed: overrides.absorbed ?? [],
			carried: overrides.carried ?? [],
		},
		patchDrift: overrides.patchDrift ?? [],
		patchesApplied: 0,
		patchProblems: overrides.patchProblems ?? [],
	} as ComposeResult;
}

describe('markMissingTargets', () => {
	it('marks gate 9 and adds a fault row naming every patch id for a missing rid', () => {
		const accepted = patch({ id: 'P000001' });
		const carryOver = patch({ id: 'P000002' });
		const groups: PatchGroups = {
			accepted: patchesByRid([accepted]),
			carryOver: patchesByRid([carryOver]),
			drift: 'outcome',
		};
		const report = createReport();
		markMissingTargets(groups, report);
		expect(report.gates.composition).toEqual({
			failures: [`no source entry with rid ${MISSING_RID}`],
			pass: 0,
			total: 1,
		});
		expect(report.rows).toEqual([
			{
				bucket: 'pipeline',
				detail: 'P000001, P000002: no source entry with this rid',
				kind: 'patch-target-missing',
				rid: MISSING_RID,
				severity: 'fault',
			},
		]);
	});

	it('adds nothing for empty groups', () => {
		const groups: PatchGroups = {
			accepted: new Map(),
			carryOver: new Map(),
			drift: 'outcome',
		};
		const report = createReport();
		markMissingTargets(groups, report);
		expect(report.gates.composition).toEqual({
			failures: [],
			pass: 0,
			total: 0,
		});
		expect(report.rows).toEqual([]);
	});
});

describe('recordPatchOutcomes', () => {
	it('applied: a patch with no problems or drift gets an applied outcome', () => {
		const p1 = patch({ id: 'P1', rid: RID });
		const report = createReport();
		recordPatchOutcomes(RID, [p1], composeResult({}), report);
		expect(report.patchOutcomes).toEqual([
			{ outcome: 'applied', patchId: 'P1', rid: RID },
		]);
		expect(report.rows.filter((r) => r.bucket === 'patch')).toEqual([]);
		expect(report.patches.upstreamFixed).toBe(0);
		expect(report.patches.upstreamChanged).toBe(0);
	});

	it('upstream-fixed: a fixed drift becomes a patch outcome, review row, and header count', () => {
		const p1 = patch({ id: 'P1', rid: RID });
		const report = createReport();
		recordPatchOutcomes(
			RID,
			[p1],
			composeResult({
				patchDrift: [{ outcome: 'upstream-fixed', patchId: 'P1', rid: RID }],
			}),
			report,
		);
		expect(report.patchOutcomes).toEqual([
			{ outcome: 'upstream-fixed', patchId: 'P1', rid: RID },
		]);
		expect(report.patches.upstreamFixed).toBe(1);
		const patchRows = report.rows.filter((r) => r.bucket === 'patch');
		expect(patchRows).toHaveLength(1);
		expect(patchRows[0]?.kind).toBe('upstream-fixed');
		expect(patchRows[0]?.detail.startsWith('P1 (')).toBe(true);
	});

	it('upstream-changed: a changed drift becomes a patch outcome, review row, and header count', () => {
		const p1 = patch({ id: 'P1', rid: RID });
		const report = createReport();
		recordPatchOutcomes(
			RID,
			[p1],
			composeResult({
				patchDrift: [{ outcome: 'upstream-changed', patchId: 'P1', rid: RID }],
			}),
			report,
		);
		expect(report.patchOutcomes).toEqual([
			{ outcome: 'upstream-changed', patchId: 'P1', rid: RID },
		]);
		expect(report.patches.upstreamChanged).toBe(1);
		const patchRows = report.rows.filter((r) => r.bucket === 'patch');
		expect(patchRows).toHaveLength(1);
		expect(patchRows[0]?.kind).toBe('upstream-changed');
	});

	it('superseded: a carry-over absorbed patch gets a superseded outcome and no row', () => {
		const p1 = patch({ id: 'P1', rid: RID });
		const report = createReport();
		recordPatchOutcomes(RID, [p1], composeResult({ absorbed: ['P1'] }), report);
		expect(report.patchOutcomes).toEqual([
			{ outcome: 'superseded', patchId: 'P1', rid: RID },
		]);
		expect(report.rows.filter((r) => r.bucket === 'patch')).toEqual([]);
	});

	it('failed: a patch with an apply problem gets no outcome and no row', () => {
		const p1 = patch({ id: 'P1', rid: RID });
		const report = createReport();
		recordPatchOutcomes(
			RID,
			[p1],
			composeResult({ patchProblems: [{ patchId: 'P1', reason: 'broke' }] }),
			report,
		);
		expect(report.patchOutcomes).toEqual([]);
		expect(report.rows.filter((r) => r.bucket === 'patch')).toEqual([]);
	});

	it('carried then failed: a carried patch that still failed gets no outcome and no row', () => {
		const p1 = patch({ id: 'P1', rid: RID });
		const report = createReport();
		recordPatchOutcomes(
			RID,
			[p1],
			composeResult({
				carried: ['P1'],
				patchProblems: [{ patchId: 'P1', reason: 'broke' }],
			}),
			report,
		);
		expect(report.patchOutcomes).toEqual([]);
		expect(report.rows.filter((r) => r.bucket === 'patch')).toEqual([]);
	});

	it('partition: each offered patch lands in exactly the bucket its result names', () => {
		const p1 = patch({ id: 'P1', rid: RID });
		const p2 = patch({ id: 'P2', rid: RID });
		const p3 = patch({ id: 'P3', rid: RID });
		const p4 = patch({ id: 'P4', rid: RID });
		const offered = [p1, p2, p3, p4];
		const report = createReport();
		const result = composeResult({
			absorbed: ['P3'],
			patchDrift: [{ outcome: 'upstream-changed', patchId: 'P2', rid: RID }],
			patchProblems: [{ patchId: 'P4', reason: 'broke' }],
		});
		recordPatchOutcomes(RID, offered, result, report);
		expect(report.patchOutcomes).toEqual([
			{ outcome: 'applied', patchId: 'P1', rid: RID },
			{ outcome: 'upstream-changed', patchId: 'P2', rid: RID },
			{ outcome: 'superseded', patchId: 'P3', rid: RID },
		]);
		const patchRows = report.rows.filter((r) => r.bucket === 'patch');
		expect(patchRows).toHaveLength(1);
		expect(patchRows[0]?.kind).toBe('upstream-changed');

		// Invariant: outcome rows + problems with a patch id among the
		// offered set === offered count. No offered patch is silently
		// dropped or double-counted between the two record kinds.
		const offeredIds = new Set(offered.map((p) => p.id));
		const problemIds = new Set(
			result.patchProblems
				.map((p) => p.patchId)
				.filter((id): id is string => id !== undefined && offeredIds.has(id)),
		);
		expect(report.patchOutcomes.length + problemIds.size).toBe(offered.length);
	});
});
