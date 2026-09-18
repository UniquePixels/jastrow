import { describe, expect, it } from 'bun:test';
import type { SourceEntry, SourceSense } from '../body/types.ts';
import { classifyDrift } from './drift.ts';
import { contentAnchor, type SemanticPatch } from './schema.ts';

const PIN = `sha256:${'a'.repeat(64)}`;
const OCR_BEFORE = 'l) emergency. Nidd. 9b';

/** A replace patch fixing an OCR `l)` → `1)`, overridable per test. */
function patch(overrides: Partial<SemanticPatch> = {}): SemanticPatch {
	const before = overrides.expected_before ?? OCR_BEFORE;
	return {
		confidence: 'high',
		defect_class: 'ocr-marker',
		expected_before: before,
		expected_occurrences: 1,
		id: 'P000001',
		occurrence_index: 1,
		op: 'replace',
		payload: { find: 'l)', replace: '1)' },
		prompt_version: 'v1',
		rationale: 'fixture',
		rid: 'D00436',
		snapshot: PIN,
		target: `sense[]:${contentAnchor(before)}`,
		...overrides,
	} as SemanticPatch;
}

function entryWith(...senses: SourceSense[]): SourceEntry {
	return { content: { senses }, headword: 'test-word', rid: 'D00436' };
}

describe('classifyDrift', () => {
	it('is undefined when the precondition holds', () => {
		expect(
			classifyDrift(entryWith({ definition: OCR_BEFORE }), patch()),
		).toBeUndefined();
	});

	it('is upstream-fixed when the source already reads as the replace leaves it', () => {
		const entry = entryWith({ definition: '1) emergency. Nidd. 9b' });
		expect(classifyDrift(entry, patch())).toBe('upstream-fixed');
	});

	it('is upstream-changed when the source reads as neither before nor after', () => {
		const entry = entryWith({ definition: 'l) emergency. Nidd. 10a' });
		expect(classifyDrift(entry, patch())).toBe('upstream-changed');
	});

	it('compares the number token too: a retag already applied is upstream-fixed', () => {
		const before = 'pressure, need.';
		const retag = patch({
			expected_before: before,
			op: 'retag',
			payload: { number: '2)' },
			target: `sense[—2)]:${contentAnchor(before)}`,
		});
		expect(
			classifyDrift(entryWith({ definition: before, number: '2)' }), retag),
		).toBe('upstream-fixed');
	});

	it('matches a split as a contiguous sibling run', () => {
		const split = patch({
			expected_before: 'a thing. 2) other thing',
			op: 'split',
			payload: { marker: '2)' },
		});
		const entry = entryWith(
			{ definition: 'a thing. ' },
			{ definition: ' other thing', number: '2)' },
		);
		expect(classifyDrift(entry, split)).toBe('upstream-fixed');
	});

	it('finds the post-state at any depth', () => {
		const entry = entryWith({
			definition: 'head',
			senses: [{ definition: '1) emergency. Nidd. 9b' }],
		});
		expect(classifyDrift(entry, patch())).toBe('upstream-fixed');
	});

	it('never calls a sense-deleting patch fixed: a gone sense looks like an edit', () => {
		const deleting = patch({ op: 'delete', payload: { scope: 'sense' } });
		expect(classifyDrift(entryWith({ definition: 'other' }), deleting)).toBe(
			'upstream-changed',
		);
	});

	it('calls a partial count changed even when one sense reads as fixed', () => {
		const twice = patch({ expected_occurrences: 2 });
		const entry = entryWith(
			{ definition: OCR_BEFORE },
			{ definition: '1) emergency. Nidd. 9b' },
		);
		expect(classifyDrift(entry, twice)).toBe('upstream-changed');
	});

	it('calls a patch that cannot apply to its own expected_before changed', () => {
		const broken = patch({ payload: { find: 'zz', replace: 'yy' } });
		expect(classifyDrift(entryWith({ definition: 'other' }), broken)).toBe(
			'upstream-changed',
		);
	});

	it('never calls a multi-occurrence patch fixed: found===0 means every occurrence changed', () => {
		const twice = patch({ expected_occurrences: 2 });
		const entry = entryWith({ definition: '1) emergency. Nidd. 9b' });
		expect(classifyDrift(entry, twice)).toBe('upstream-changed');
	});

	it('reports upstream-changed for an unref whose item is already gone', () => {
		const item = 'Yoma 2a';
		const unref = patch({
			expected_before: item,
			op: 'unref',
			payload: {},
			target: `refs[${item}]:${contentAnchor(item)}`,
		});
		const entryWithoutItem: SourceEntry = {
			content: { senses: [{ definition: 'x' }] },
			headword: 'test-word',
			refs: ['Pes. 4b'],
			rid: 'D00436',
		};
		expect(classifyDrift(entryWithoutItem, unref)).toBe('upstream-changed');
	});
});
