// biome-ignore-all lint/style/noExcessiveLinesPerFile: a table-driven suite; the cases and the fixtures they share read as one unit.
import { describe, expect, it } from 'bun:test';
import type { ComposeResult } from '../compose.ts';
import type {
	AcceptedCorpus,
	ApplyProblem,
	PatchDrift,
} from '../patch/apply.ts';
import { patchesByRid } from '../patch/apply.ts';
import type { EntryResult } from '../patch/manifest.ts';
import { contentAnchor, type SemanticPatch } from '../patch/schema.ts';
import {
	markMissingTargets,
	type PatchGroups,
	recordConsolidatedAway,
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

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('markMissingTargets', () => {
	it('marks gate 9 and adds a fault row naming every patch id for a missing rid', () => {
		const accepted = patch({ id: 'P000001' });
		const carryOver = patch({ id: 'P000002' });
		const groups: PatchGroups = {
			accepted: patchesByRid([accepted]),
			carryOver: patchesByRid([carryOver]),
			drift: 'outcome',
			reviewed: new Map(),
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

	it('includes reviewed patches in the missing-target report', () => {
		const reviewed = patch({ id: 'P000003' });
		const groups: PatchGroups = {
			accepted: new Map(),
			carryOver: new Map(),
			drift: 'outcome',
			reviewed: patchesByRid([reviewed]),
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
				detail: 'P000003: no source entry with this rid',
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
			reviewed: new Map(),
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

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
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

/** A minimal `AcceptedCorpus`, overridable per test — only the fields
 * `recordConsolidatedAway` reads are exercised. */
function acceptedCorpus(overrides: Partial<AcceptedCorpus>): AcceptedCorpus {
	return {
		carryOver: [],
		dropped: [],
		droppedCarryOver: [],
		patches: [],
		records: [],
		superseded: {
			patches: 0,
			prePatch: { overlapping: 0, patches: 0, records: 0 },
			records: 0,
		},
		...overrides,
	};
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('recordConsolidatedAway', () => {
	it('a fixture with two records for one rid yields one kept, one dropped row', () => {
		const earlier: EntryResult = {
			disposition: 'repaired',
			patches: ['P000001'],
			rid: RID,
		};
		const later: EntryResult = {
			disposition: 'repaired',
			patches: ['P000002'],
			rid: RID,
		};
		const report = createReport();
		recordConsolidatedAway(
			acceptedCorpus({ dropped: [earlier], records: [later] }),
			report,
		);
		expect(report.rows).toEqual([
			{
				bucket: 'patch',
				detail: 'P000001 dropped: P000002 is the later record for D00001',
				kind: 'patch-consolidated-away',
				rid: RID,
				severity: 'info',
			},
		]);
		expect(report.patches.consolidatedAway).toBe(1);
	});

	it('adds nothing when nothing was dropped', () => {
		const report = createReport();
		recordConsolidatedAway(acceptedCorpus({}), report);
		expect(report.rows).toEqual([]);
		expect(report.patches.consolidatedAway).toBe(0);
	});

	it('one row per patch on a dropped record that lists several', () => {
		const earlier: EntryResult = {
			disposition: 'repaired',
			patches: ['P000001', 'P000002'],
			rid: RID,
		};
		const later: EntryResult = {
			disposition: 'repaired',
			patches: ['P000003'],
			rid: RID,
		};
		const report = createReport();
		recordConsolidatedAway(
			acceptedCorpus({ dropped: [earlier], records: [later] }),
			report,
		);
		expect(report.rows.map((r) => r.detail)).toEqual([
			'P000001 dropped: P000003 is the later record for D00001',
			'P000002 dropped: P000003 is the later record for D00001',
		]);
		expect(report.patches.consolidatedAway).toBe(2);
	});

	it('names the kept record by disposition when the later sweep repaired nothing', () => {
		const earlier: EntryResult = {
			disposition: 'repaired',
			patches: ['P000001'],
			rid: RID,
		};
		const later: EntryResult = {
			disposition: 'needs_print_check',
			escalation: 'a byte the entry does not carry',
			patches: [],
			rid: RID,
		};
		const report = createReport();
		recordConsolidatedAway(
			acceptedCorpus({ dropped: [earlier], records: [later] }),
			report,
		);
		expect(report.rows[0]?.detail).toBe(
			'P000001 dropped: no patch (needs_print_check) is the later record for D00001',
		);
	});

	it('reports a carry-over patch dropped by target overlap with an accepted patch', () => {
		const kept = patch({ id: 'P000005', rid: RID });
		const overlapping = patch({ id: 'P000001', rid: RID });
		const report = createReport();
		recordConsolidatedAway(
			acceptedCorpus({ droppedCarryOver: [overlapping], patches: [kept] }),
			report,
		);
		expect(report.rows).toEqual([
			{
				bucket: 'patch',
				detail: 'P000001 dropped: P000005 is the later record for D00001',
				kind: 'patch-consolidated-away',
				rid: RID,
				severity: 'info',
			},
		]);
		expect(report.patches.consolidatedAway).toBe(1);
	});
});
