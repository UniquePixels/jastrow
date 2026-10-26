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
const LINE = 'IT m. (v. 928 2) affliction,';

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

/** Leaf 85 of vol. 1 shows `RID` and holds `LINE`; nothing else does. */
const SOURCES: EvidenceSources = {
	leafLines: (volume: 1 | 2, leaf: number): Promise<string[] | undefined> =>
		Promise.resolve(volume === 1 && leaf === 85 ? [LINE] : undefined),
	outside: (rid: string, volume: number, leaf: number): string | undefined =>
		rid === RID && volume === 1 && leaf === 85
			? undefined
			: `leaf ${leaf} is p. 9; the entry is on p. 62–62`,
};

const hocr = (leaf: number, quote: string): PatchEvidence => ({
	kind: 'hOCR',
	leaf,
	quote,
	volume: 1,
});
const read = (leaf?: number): PatchEvidence => ({
	date: '2026-10-25',
	kind: 'maintainer-read',
	reader: 'B',
	...(leaf === undefined ? {} : { leaf, volume: 1 }),
});

type Located = readonly [
	name: string,
	evidence: PatchEvidence,
	passes: boolean,
	failure: string,
];
const LOCATED: readonly Located[] = [
	['an hOCR line on its leaf', hocr(85, '928 2) affliction'), true, ''],
	[
		'an hOCR quote too short to locate',
		hocr(85, '928 2)'),
		false,
		'the quote is under 12 characters',
	],
	[
		'an hOCR quote padded with spaces',
		hocr(85, '928            2)'),
		false,
		'the quote is under 12 characters',
	],
	[
		'an hOCR quote the leaf lacks',
		hocr(85, '928 2) afflictions'),
		false,
		'the quote is not on vol. 1 leaf 85',
	],
	[
		'an hOCR leaf off the entry',
		hocr(86, LINE),
		false,
		'vol. 1 leaf 86 is p. 9',
	],
	['a located read on its leaf', read(85), true, ''],
	['a located read off the entry', read(12), false, 'vol. 1 leaf 12 is p. 9'],
];

describe('checkEvidenceLocators (gate 11)', () => {
	it.each(LOCATED)('%s', async (_name, evidence, passes, failure) => {
		const t = await checkEvidenceLocators(
			[patch('P000001', evidence)],
			SOURCES,
		);
		expect([t.pass, t.total]).toEqual([passes ? 1 : 0, 1]);
		expect(t.failures.join('\n')).toContain(failure);
	});

	it('marks nothing for evidence without a leaf', async () => {
		const unlocated = [
			patch('P000001', read()),
			patch('P000002', { kind: 'sefaria-only', pending: true }),
			patch('P000003'),
		];
		expect(await checkEvidenceLocators(unlocated, SOURCES)).toEqual({
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
