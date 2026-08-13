import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { parseManifest } from '../research/manifest.ts';
import {
	applyEntryPatches,
	corpusPreflight,
	createPhaseTracker,
	PhaseViolation,
	patchesByRid,
	postApplyAssertions,
} from './apply.ts';
import { contentAnchor, type SemanticPatch } from './schema.ts';

const PIN = `sha256:${'a'.repeat(64)}`;

/** Two-sense entry: an OCR `l)` first sense and a healthy second. */
function makeEntry(): SourceEntry {
	return {
		content: {
			senses: [
				{ definition: 'l) emergency. Nidd. 9b' },
				{ definition: 'pressure, need, v. dochak.', number: '—2)' },
			],
		},
		headword: 'test-word',
		rid: 'D00436',
	};
}

/** A valid replace patch against makeEntry()'s first sense. */
function ocrPatch(overrides: Partial<SemanticPatch> = {}): SemanticPatch {
	const expected = 'l) emergency. Nidd. 9b';
	return {
		confidence: 'high',
		defect_class: 'ocr-marker',
		expected_before: expected,
		expected_occurrences: 1,
		id: 'P000001',
		occurrence_index: 1,
		op: 'replace',
		payload: { find: 'l)', replace: '1)' },
		prompt_version: 'v1',
		rationale: 'OCR l) for 1)',
		rid: 'D00436',
		snapshot: PIN,
		target: `sense[]:${contentAnchor(expected)}`,
		...overrides,
	} as SemanticPatch;
}

/** A valid retag patch against makeEntry()'s second sense. */
function retagPatch(): SemanticPatch {
	const expected = 'pressure, need, v. dochak.';
	return {
		confidence: 'high',
		defect_class: 'lost-marker',
		expected_before: expected,
		expected_occurrences: 1,
		id: 'P000002',
		occurrence_index: 1,
		op: 'retag',
		payload: { number: '2)' },
		prompt_version: 'v1',
		rationale: 'normalize dash form',
		rid: 'D00436',
		snapshot: PIN,
		target: `sense[—2)]:${contentAnchor(expected)}`,
	} as SemanticPatch;
}

describe('createPhaseTracker', () => {
	it('runs the manifest order start to finish', () => {
		const phases = createPhaseTracker();
		expect(phases.run('text-repairs', () => 1)).toBe(1);
		expect(phases.run('structural-repairs', () => 2)).toBe(2);
		expect(phases.run('patch-apply', () => 3)).toBe(3);
		expect(phases.run('consumer-output', () => 4)).toBe(4);
	});

	it('allows skipping nothing implicitly: prerequisites must have run', () => {
		const phases = createPhaseTracker();
		expect(() => phases.run('patch-apply', () => 0)).toThrow(PhaseViolation);
		expect(() => phases.run('patch-apply', () => 0)).toThrow(
			'requires incomplete phase(s): text-repairs, structural-repairs',
		);
	});

	it('aborts on out-of-order phases', () => {
		const phases = createPhaseTracker();
		phases.run('text-repairs', () => 0);
		phases.run('structural-repairs', () => 0);
		phases.run('patch-apply', () => 0);
		expect(() => phases.run('text-repairs', () => 0)).toThrow(PhaseViolation);
	});

	it('rejects a phase the manifest does not know', () => {
		const phases = createPhaseTracker();
		expect(() =>
			phases.run('publish' as Parameters<typeof phases.run>[0], () => 0),
		).toThrow('unknown phase');
	});

	it('does not mark a throwing phase as completed', () => {
		const phases = createPhaseTracker();
		expect(() =>
			phases.run('text-repairs', () => {
				throw new Error('boom');
			}),
		).toThrow('boom');
		expect(() => phases.run('structural-repairs', () => 0)).toThrow(
			'requires incomplete phase(s): text-repairs',
		);
	});
});

describe('corpusPreflight', () => {
	it('passes a consistent corpus + manifest + pin', () => {
		const patches = [ocrPatch(), retagPatch()];
		const records = parseManifest(
			JSON.stringify({
				disposition: 'repaired',
				patches: ['P000001', 'P000002'],
				rid: 'D00436',
			}),
		);
		expect(corpusPreflight(patches, records, PIN)).toEqual([]);
	});

	it('reports every stale pin, corpus problem, and gate block together', () => {
		const stale = `sha256:${'b'.repeat(64)}`;
		const patches = [
			ocrPatch({ snapshot: stale }),
			ocrPatch({ id: 'P000003', snapshot: stale }), // duplicate target too
		];
		const records = parseManifest(
			[
				JSON.stringify({
					disposition: 'repaired',
					patches: ['P000001', 'P000003'],
					rid: 'D00436',
				}),
				JSON.stringify({
					disposition: 'needs_print_check',
					escalation: 'lost text',
					patches: [],
					rid: 'E00001',
				}),
			].join('\n'),
		);
		const problems = corpusPreflight(patches, records, PIN);
		const reasons = problems.map((p) => p.reason);
		expect(reasons.filter((r) => r.includes('snapshot pin'))).toHaveLength(2);
		expect(reasons.some((r) => r.includes('overlapping patches'))).toBe(true);
		expect(reasons.some((r) => r.includes('unresolved needs_*'))).toBe(true);
		expect(reasons.some((r) => r.includes('maintenance-track rebase'))).toBe(
			true,
		);
	});
});

describe('applyEntryPatches', () => {
	it("chains a rid's patches in corpus order", () => {
		const { entry, problems } = applyEntryPatches(makeEntry(), [
			ocrPatch(),
			retagPatch(),
		]);
		expect(problems).toEqual([]);
		expect(entry.content.senses[0]?.definition).toBe('1) emergency. Nidd. 9b');
		expect(entry.content.senses[1]?.number).toBe('2)');
	});

	it('records a drifted expected_before and still applies the rest', () => {
		const drifted = ocrPatch({
			expected_before: 'l) emergency. Nidd. 9a',
			target: `sense[]:${contentAnchor('l) emergency. Nidd. 9a')}`,
		});
		const { entry, problems } = applyEntryPatches(makeEntry(), [
			drifted,
			retagPatch(),
		]);
		expect(problems).toHaveLength(1);
		expect(problems[0]?.patchId).toBe('P000001');
		expect(problems[0]?.reason).toContain('resolved to 0 sense(s)');
		// The healthy patch still landed against the last good state.
		expect(entry.content.senses[1]?.number).toBe('2)');
		expect(entry.content.senses[0]?.definition).toBe('l) emergency. Nidd. 9b');
	});

	it('rejects an invention through the no-new-text floor', () => {
		const inventing = ocrPatch({
			payload: { find: 'emergency', replace: 'EMERGENCY!' },
		});
		const { entry, problems } = applyEntryPatches(makeEntry(), [inventing]);
		expect(problems).toHaveLength(1);
		expect(problems[0]?.reason).toContain('needs_print_check');
		expect(entry.content.senses[0]?.definition).toBe('l) emergency. Nidd. 9b');
	});
});

describe('postApplyAssertions', () => {
	it('rejects an apply that left its target unchanged', () => {
		const noop = ocrPatch({ payload: { find: 'l)', replace: 'l)' } });
		// Apply by hand: a find==replace patch leaves the entry identical.
		const entry = makeEntry();
		expect(() => postApplyAssertions(entry, noop)).toThrow(
			'did not change its target',
		);
	});

	it('accepts a genuine change', () => {
		const { entry, problems } = applyEntryPatches(makeEntry(), [ocrPatch()]);
		expect(problems).toEqual([]);
		expect(entry.content.senses[0]?.definition).toContain('1)');
	});
});

describe('patchesByRid', () => {
	it('groups by rid preserving corpus order', () => {
		const a = ocrPatch();
		const b = retagPatch();
		const other = ocrPatch({ id: 'P000009', rid: 'A00001' });
		const groups = patchesByRid([a, other, b]);
		expect(groups.get('D00436')?.map((p) => p.id)).toEqual([
			'P000001',
			'P000002',
		]);
		expect(groups.get('A00001')?.map((p) => p.id)).toEqual(['P000009']);
	});
});
