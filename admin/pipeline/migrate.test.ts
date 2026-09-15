import { describe, expect, it } from 'bun:test';
import { createReport } from './migrate/report.ts';
import { markMissingTargets, type PatchGroups } from './migrate.ts';
import { patchesByRid } from './patch/apply.ts';
import { contentAnchor, type SemanticPatch } from './patch/schema.ts';

const PIN = `sha256:${'a'.repeat(64)}`;
const MISSING_RID = 'Z99999';

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
