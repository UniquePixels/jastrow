/** Gate 11 and the evidence accounting (ruling `10-26 patch
 * evidence`): `checkEvidenceLocators` against stub sources, the
 * provisional rows and the pending count. */
import { describe, expect, it } from 'bun:test';
import type { ComposeResult } from '../compose.ts';
import {
	contentAnchor,
	type PatchEvidence,
	type SemanticPatch,
} from '../patch/schema.ts';
import { checkEvidenceLocators, type EvidenceSources } from './gates.ts';
import { recordPatchOutcomes, recordProvisional } from './patches.ts';
import { createReport } from './report.ts';

const RID = 'A00001';

/** A replace patch on `RID` with the given evidence and id. */
function patch(id: string, evidence?: PatchEvidence): SemanticPatch {
	return {
		defect_class: 'test-class',
		...(evidence === undefined ? {} : { evidence }),
		expected_before: 'x',
		expected_occurrences: 1,
		id,
		occurrence_index: 1,
		op: 'replace',
		payload: { find: 'x', replace: 'y' },
		prompt_version: 'v1',
		rationale: 'fixture',
		rid: RID,
		snapshot: `sha256:${'a'.repeat(64)}`,
		target: `sense[]:${contentAnchor('x')}`,
	} as SemanticPatch;
}

/** Page 62 shows `RID`; no other page does. */
const SOURCES: EvidenceSources = {
	outside: (rid: string, page: number): string | undefined =>
		rid === RID && page === 62
			? undefined
			: `p. ${page} is not the entry's (p. 62–62)`,
};

const ocr = (page: number): PatchEvidence => ({
	kind: 'hOCR',
	page,
	quote: '928 2) affliction',
});
const read = (page?: number): PatchEvidence => ({
	date: '2026-10-25',
	kind: 'maintainer-read',
	reader: 'B',
	...(page === undefined ? {} : { page }),
});

type Located = readonly [
	name: string,
	evidence: PatchEvidence,
	passes: boolean,
	failure: string,
];
const LOCATED: readonly Located[] = [
	["an OCR read on the entry's page", ocr(62), true, ''],
	['an OCR read off the entry', ocr(9), false, "p. 9 is not the entry's"],
	["a located read on the entry's page", read(62), true, ''],
	['a located read off the entry', read(12), false, "p. 12 is not the entry's"],
];

describe('checkEvidenceLocators (gate 11)', () => {
	it.each(LOCATED)('%s', (_name, evidence, passes, failure) => {
		const t = checkEvidenceLocators([patch('P000001', evidence)], SOURCES);
		expect([t.pass, t.total]).toEqual([passes ? 1 : 0, 1]);
		expect(t.failures.join('\n')).toContain(failure);
	});

	it('marks nothing for evidence without a page', () => {
		const unlocated = [
			patch('P000001', read()),
			patch('P000002', { kind: 'sefaria-only', pending: true }),
			patch('P000003'),
		];
		expect(checkEvidenceLocators(unlocated, SOURCES)).toEqual({
			failures: [],
			pass: 0,
			total: 0,
		});
	});
});

describe('recordProvisional', () => {
	it('lists and counts each held patch, applying none', () => {
		const report = createReport();
		recordProvisional([patch('P000001'), patch('P000002')], report);
		expect(report.patches.provisional).toBe(2);
		expect(report.rows.map((r) => [r.kind, r.rid, r.severity])).toEqual([
			['patch-provisional', RID, 'review'],
			['patch-provisional', RID, 'review'],
		]);
		expect(report.patchOutcomes).toEqual([]);
	});
});

describe('recordPatchOutcomes counts the pending patches that applied', () => {
	it('counts an applied pending patch, not a failed one or a read', () => {
		const report = createReport();
		const pending: PatchEvidence = { kind: 'sefaria-only', pending: true };
		const result = {
			carryOver: { absorbed: [], carried: [], claimed: [] },
			patchDrift: [],
			patchProblems: [{ patchId: 'P000002', reason: 'x', rid: RID }],
		} as unknown as ComposeResult;
		recordPatchOutcomes(
			RID,
			[
				patch('P000001', pending),
				patch('P000002', pending),
				patch('P000003', read()),
			],
			result,
			report,
		);
		expect(report.patches.pending).toBe(1);
	});
});
