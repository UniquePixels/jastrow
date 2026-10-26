/** Gate 12, `declaredLoss`, and the loss accounting: a reviewed
 * patch's `removes` against what the apply removed, and the blessing's
 * counts. */
import { describe, expect, it } from 'bun:test';
import { contentAnchor, type SemanticPatch } from '../patch/schema.ts';
import { markDeclaredLoss, tally } from './gates.ts';
import { recordLosses } from './patches.ts';
import { createReport, renderBlessing } from './report.ts';

/** A reviewed replace patch with the given id and declaration. */
function patch(id: string, removes?: string): SemanticPatch {
	return {
		author: 'human',
		defect_class: 'test-class',
		expected_before: 'x',
		expected_occurrences: 1,
		id,
		occurrence_index: 1,
		op: 'replace',
		payload: { find: 'x', replace: 'y' },
		prompt_version: 'v1',
		rationale: 'fixture',
		...(removes === undefined ? {} : { removes }),
		rid: 'A00001',
		snapshot: `sha256:${'a'.repeat(64)}`,
		target: `sense[]:${contentAnchor('x')}`,
	} as SemanticPatch;
}

// [what, declared, removed, passes, failure]
const MARKS: readonly (readonly [
	string,
	string | undefined,
	string,
	boolean,
	string,
])[] = [
	['removes nothing, declares nothing', undefined, '', true, ''],
	['declares what it removes', 'l', 'l', true, ''],
	[
		'removes what it does not declare',
		undefined,
		'l',
		false,
		'A00001: P1: removes "l" undeclared',
	],
	[
		'declares what it does not remove',
		'I',
		'',
		false,
		'A00001: P1: declares "I" it does not remove',
	],
	[
		'both at once',
		'I',
		'l',
		false,
		'A00001: P1: removes "l" undeclared; declares "I" it does not remove',
	],
];

describe('markDeclaredLoss (gate 12)', () => {
	it.each(MARKS)('%s', (...[, declared, removed, passes, failure]) => {
		const t = tally();
		markDeclaredLoss(t, patch('P1', declared), removed);
		expect(t).toEqual({
			failures: passes ? [] : [failure],
			pass: passes ? 1 : 0,
			total: 1,
		});
	});
});

describe('recordLosses', () => {
	it('marks every applied reviewed patch and counts the two sides apart', () => {
		const report = createReport();
		recordLosses(
			[patch('P1', 'l'), patch('P2')],
			{
				losses: [
					{ patchId: 'P1', removed: 'l', rid: 'A00001' },
					{ patchId: 'P2', removed: '', rid: 'A00001' },
					{ patchId: 'P3', removed: 'same.', rid: 'A00001' },
				],
			},
			report,
		);
		expect(report.gates.declaredLoss).toEqual({
			failures: [],
			pass: 2,
			total: 2,
		});
		expect(report.patches.loss).toEqual({
			agent: { codepoints: 5, patches: 1 },
			reviewed: { codepoints: 1, patches: 1 },
		});
		expect(renderBlessing(report, [])).toContain(
			'Patch loss: 1 reviewed patch(es) remove visible characters, 1 codepoint(s) in all, each declared in `removes`; 1 agent patch(es) remove 5.',
		);
	});
});
