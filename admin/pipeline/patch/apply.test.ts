import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import {
	applyCarryOver,
	applyEntryPatches,
	consolidate,
	corpusPreflight,
	createPhaseTracker,
	loadReviewedCorpus,
	orderedDirs,
	PhaseViolation,
	patchesByRid,
	postApplyAssertions,
	type ReviewedCorpus,
	reviewedManifestProblems,
	stalePins,
} from './apply.ts';
import type { EntryResult } from './manifest.ts';
import { parseManifest } from './manifest.ts';
import {
	applyPatch,
	contentAnchor,
	type SemanticPatch,
	senseTarget,
} from './schema.ts';

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

/** A `reform` whose payload sets only the line's layout: the forms
 * are `makeEntry()`'s own, so its target — the forms block — is
 * byte-identical after the apply (headword design §4 "Parentheses",
 * ruled 2026-09-22; A02823 is the row). */
function displayOnlyReform(): SemanticPatch {
	const expected = 'test-word';
	return {
		confidence: 'high',
		defect_class: 'headword-paren-placement',
		expected_before: expected,
		expected_occurrences: 1,
		id: 'P000003',
		occurrence_index: 1,
		op: 'reform',
		payload: { display: '({0}) {1} I', forms: [expected] },
		prompt_version: 'v1',
		rationale: 'the print sets the parentheses on the headword',
		rid: 'D00436',
		snapshot: PIN,
		target: `forms:${contentAnchor(expected)}`,
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

/** A valid patch against `entry`'s first sense, targeted and anchored
 * from its live content — the human-authored-patch tests need an
 * `op`/`payload` of their choosing rather than `ocrPatch`'s fixed
 * replace. */
function patchFor(
	entry: SourceEntry,
	op: SemanticPatch['op'],
	payload: SemanticPatch['payload'],
): SemanticPatch {
	const sense = entry.content.senses[0];
	if (sense === undefined) {
		throw new Error('fixture broken');
	}
	const definition = sense.definition ?? '';
	return {
		confidence: 'high',
		defect_class: 't',
		expected_before: definition,
		expected_occurrences: 1,
		id: 'P999999',
		occurrence_index: 1,
		op,
		payload,
		prompt_version: 'test',
		rationale: 't',
		rid: entry.rid,
		snapshot: `sha256:${'0'.repeat(64)}`,
		target: senseTarget(sense),
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

describe('corpusPreflight — escalations policy (Ruling D)', () => {
	function unresolvedRecord(): EntryResult[] {
		return parseManifest(
			JSON.stringify({
				disposition: 'needs_human_judgment',
				escalation: 'unresolved finding',
				patches: [],
				rid: 'E00002',
			}),
		);
	}

	it('blocks by default on an unresolved needs_* record', () => {
		const problems = corpusPreflight([], unresolvedRecord(), PIN);
		expect(problems.some((p) => p.reason.includes('unresolved needs_*'))).toBe(
			true,
		);
	});

	it("reports nothing under {escalations: 'defer'}", () => {
		const problems = corpusPreflight([], unresolvedRecord(), PIN, {
			escalations: 'defer',
		});
		expect(problems).toEqual([]);
	});
});

describe('orderedDirs — Ruling E stage filtering', () => {
	it('keeps every found directory in TRANCHES ingest order when stage is omitted', () => {
		expect(
			orderedDirs(['batch-01-2026-09-04', 'tranche-01', 'residue-01']),
		).toEqual(['tranche-01', 'batch-01-2026-09-04', 'residue-01']);
	});

	it("filters to 'healed' directories, excluding pre-patch tranche-01", () => {
		expect(
			orderedDirs(
				['tranche-01', 'calibration-2026-09-04', 'batch-01-2026-09-04'],
				'healed',
			),
		).toEqual(['calibration-2026-09-04', 'batch-01-2026-09-04']);
	});

	it("filters to 'pre-patch', keeping only tranche-01", () => {
		expect(
			orderedDirs(['tranche-01', 'calibration-2026-09-04'], 'pre-patch'),
		).toEqual(['tranche-01']);
	});

	it('throws on a directory TRANCHES does not name, regardless of stage filter', () => {
		expect(() => orderedDirs(['tranche-99'])).toThrow(
			'unordered tranche directory "tranche-99": add it to TRANCHES',
		);
		expect(() => orderedDirs(['tranche-99'], 'healed')).toThrow(
			'unordered tranche directory "tranche-99": add it to TRANCHES',
		);
	});
});

describe('consolidate — Ruling C latest-wins', () => {
	it('keeps only the later record for a re-swept rid, dropping its patch', () => {
		const earlier: EntryResult = {
			disposition: 'repaired',
			patches: ['P000001'],
			rid: 'A00001',
		};
		const later: EntryResult = {
			disposition: 'repaired',
			patches: ['P000002'],
			rid: 'A00001',
		};
		const p1 = ocrPatch({ id: 'P000001', rid: 'A00001' });
		const p2 = ocrPatch({ id: 'P000002', rid: 'A00001' });
		const result = consolidate([earlier, later], [p1, p2]);
		expect(result.records).toEqual([later]);
		expect(result.patches.map((p) => p.id)).toEqual(['P000002']);
		expect(result.superseded).toEqual({ patches: 1, records: 1 });
	});

	it('leaves a rid with one record untouched', () => {
		const record: EntryResult = {
			disposition: 'repaired',
			patches: ['P000001'],
			rid: 'A00002',
		};
		const p1 = ocrPatch({ id: 'P000001', rid: 'A00002' });
		const result = consolidate([record], [p1]);
		expect(result.records).toEqual([record]);
		expect(result.patches).toEqual([p1]);
		expect(result.superseded).toEqual({ patches: 0, records: 0 });
	});

	it('throws on a patch no record — kept or superseded — lists', () => {
		// P000002 is not named by ANY record, so it is not a Ruling C
		// supersession (a later sweep replacing an earlier one) — it is
		// an ingest bug, and must fail loudly rather than being folded
		// into `superseded.patches` as if a record had dropped it.
		const record: EntryResult = {
			disposition: 'repaired',
			patches: ['P000001'],
			rid: 'A00003',
		};
		const p1 = ocrPatch({ id: 'P000001', rid: 'A00003' });
		const orphan = ocrPatch({ id: 'P000002', rid: 'A00003' });
		expect(() => consolidate([record], [p1, orphan])).toThrow(
			'patch(es) no manifest record lists: P000002',
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
		expect(() => postApplyAssertions(entry, entry, noop)).toThrow(
			'did not change its target',
		);
	});

	it('accepts a reform that set only the line`s display', () => {
		// Headword design §4 "Parentheses" (ruled 2026-09-22): a
		// reviewed patch may correct a LAYOUT the source got wrong while
		// the forms stay as the source has them — so the forms block,
		// which is the patch's target, is byte-identical on purpose.
		const before = makeEntry();
		const after = { ...before, display: '({0}) {1} I' };
		expect(() =>
			postApplyAssertions(before, after, displayOnlyReform()),
		).not.toThrow();
	});

	it('still rejects a reform that changed nothing at all', () => {
		const before = makeEntry();
		expect(() =>
			postApplyAssertions(before, before, displayOnlyReform()),
		).toThrow('did not change its target');
	});

	it('accepts a genuine change', () => {
		const { entry, problems } = applyEntryPatches(makeEntry(), [ocrPatch()]);
		expect(problems).toEqual([]);
		expect(entry.content.senses[0]?.definition).toContain('1)');
	});
});

describe('applyCarryOver — Ruling F', () => {
	it('absorbs a patch whose pre-state no longer resolves', () => {
		// Apply the ocr patch for real first — the entry no longer reads
		// "l) emergency", so the same patch, offered as carry-over, finds
		// its pre-state already gone (a transform rule got there first, in
		// the real pipeline).
		const alreadyHealed = applyPatch(makeEntry(), ocrPatch());
		const result = applyCarryOver(alreadyHealed, [ocrPatch()]);
		expect(result.absorbed).toEqual(['P000001']);
		expect(result.carried).toEqual([]);
		expect(result.problems).toEqual([]);
		expect(result.entry).toBe(alreadyHealed);
	});

	it('carries and applies a patch whose pre-state is still present', () => {
		const result = applyCarryOver(makeEntry(), [ocrPatch()]);
		expect(result.absorbed).toEqual([]);
		expect(result.carried).toEqual(['P000001']);
		expect(result.problems).toEqual([]);
		expect(result.entry.content.senses[0]?.definition).toBe(
			'1) emergency. Nidd. 9b',
		);
	});

	it('orders carry-over patches by id regardless of input order, chaining state', () => {
		const result = applyCarryOver(makeEntry(), [retagPatch(), ocrPatch()]);
		expect(result.carried).toEqual(['P000001', 'P000002']);
		expect(result.problems).toEqual([]);
		expect(result.entry.content.senses[0]?.definition).toBe(
			'1) emergency. Nidd. 9b',
		);
		expect(result.entry.content.senses[1]?.number).toBe('2)');
	});

	it('records a problem for a carried patch that fails its gate, without absorbing it', () => {
		const inventing = ocrPatch({
			payload: { find: 'emergency', replace: 'EMERGENCY!' },
		});
		const result = applyCarryOver(makeEntry(), [inventing]);
		expect(result.absorbed).toEqual([]);
		expect(result.carried).toEqual(['P000001']);
		expect(result.problems).toHaveLength(1);
		expect(result.problems[0]?.reason).toContain('needs_print_check');
	});

	it('reports a problem — not absorption — for a wrong-count pre-state', () => {
		// The target still resolves (found=1), just not at the count the
		// patch declares (expected_occurrences: 2). That is neither "the
		// defect is gone" (found=0, absorb) nor "the defect is exactly as
		// declared" (found===expected, carry) — a transform changed the
		// entry into a third state the carry-over pre-check must not wave
		// through as absorbed.
		const mismatched = ocrPatch({ expected_occurrences: 2 });
		const source = makeEntry();
		const result = applyCarryOver(source, [mismatched]);
		expect(result.absorbed).toEqual([]);
		expect(result.carried).toEqual([]);
		expect(result.problems).toHaveLength(1);
		expect(result.problems[0]?.patchId).toBe('P000001');
		expect(result.problems[0]?.reason).toContain('resolves 1 time(s)');
		// Never applied, so the untouched entry reference comes back.
		expect(result.entry).toBe(source);
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

describe('stalePins / corpusPreflight pins option (consolidation §4.2)', () => {
	const stale = `sha256:${'b'.repeat(64)}`;

	it('lists the patches pinned to a different snapshot', () => {
		const patches = [ocrPatch({ snapshot: stale }), retagPatch()];
		expect(stalePins(patches, PIN).map((p) => p.id)).toEqual(['P000001']);
	});

	it("skips only the pin check under pins: 'skip'", () => {
		const patches = [
			ocrPatch({ snapshot: stale }),
			ocrPatch({ id: 'P000003', snapshot: stale }),
		];
		const records = parseManifest(
			JSON.stringify({
				disposition: 'repaired',
				patches: ['P000001', 'P000003'],
				rid: 'D00436',
			}),
		);
		const reasons = corpusPreflight(patches, records, PIN, {
			escalations: 'defer',
			pins: 'skip',
		}).map((p) => p.reason);
		expect(reasons.some((r) => r.includes('snapshot pin'))).toBe(false);
		expect(reasons.some((r) => r.includes('overlapping patches'))).toBe(true);
	});
});

describe("applyEntryPatches — drift 'outcome'", () => {
	it('reports a drifted patch as upstream-changed and still applies the rest', () => {
		const drifted = ocrPatch({
			expected_before: 'l) emergency. Nidd. 9a',
			target: `sense[]:${contentAnchor('l) emergency. Nidd. 9a')}`,
		});
		const result = applyEntryPatches(
			makeEntry(),
			[drifted, retagPatch()],
			'outcome',
		);
		expect(result.problems).toEqual([]);
		expect(result.drifted).toEqual([
			{ outcome: 'upstream-changed', patchId: 'P000001', rid: 'D00436' },
		]);
		expect(result.entry.content.senses[1]?.number).toBe('2)');
	});

	it('reports a patch whose fix is already in the source as upstream-fixed', () => {
		const fixed = applyPatch(makeEntry(), ocrPatch());
		const result = applyEntryPatches(fixed, [ocrPatch()], 'outcome');
		expect(result.problems).toEqual([]);
		expect(result.drifted.map((d) => d.outcome)).toEqual(['upstream-fixed']);
		expect(result.entry).toBe(fixed);
	});

	it('returns no drift in the default mode', () => {
		const fixed = applyPatch(makeEntry(), ocrPatch());
		const result = applyEntryPatches(fixed, [ocrPatch()]);
		expect(result.drifted).toEqual([]);
		expect(result.problems).toHaveLength(1);
	});
});

describe("applyCarryOver — drift 'outcome'", () => {
	it('reports a wrong-count pre-state as upstream-changed, not a problem', () => {
		const mismatched = ocrPatch({ expected_occurrences: 2 });
		const source = makeEntry();
		const result = applyCarryOver(source, [mismatched], 'outcome');
		expect(result.problems).toEqual([]);
		expect(result.drifted).toEqual([
			{ outcome: 'upstream-changed', patchId: 'P000001', rid: 'D00436' },
		]);
		expect(result.carried).toEqual([]);
		expect(result.entry).toBe(source);
	});
});

describe('human-authored patches', () => {
	const entry: SourceEntry = {
		content: { senses: [{ definition: 'a b', number: '1)' }] },
		headword: 'x',
		rid: 'A00001',
	};
	const addsBytes = {
		...patchFor(entry, 'replace', { find: 'a b', replace: 'a (x) b' }),
	};
	it('rejects new bytes from an agent patch', () => {
		expect(applyEntryPatches(entry, [addsBytes]).problems).toHaveLength(1);
	});
	it('allows new bytes from a human patch', () => {
		const result = applyEntryPatches(entry, [
			{ ...addsBytes, author: 'human' },
		]);
		expect(result.problems).toEqual([]);
		expect(result.entry.content.senses[0]?.definition).toBe('a (x) b');
	});
});

describe('loadReviewedCorpus', () => {
	it('stamps every patch human and returns deferred records', async () => {
		const corpus = await loadReviewedCorpus(
			`${import.meta.dir}/fixtures/reviewed`,
		);
		expect(corpus.patches.every((p) => p.author === 'human')).toBe(true);
		expect(corpus.deferred.map((r) => r.rid)).toEqual(['D00470']);
	});
	it('is empty when the directory does not exist', async () => {
		expect(await loadReviewedCorpus('/nonexistent')).toEqual({
			deferred: [],
			patches: [],
			records: [],
		});
	});
	it('returns every manifest record, not only the deferred ones', async () => {
		const corpus = await loadReviewedCorpus(
			`${import.meta.dir}/fixtures/reviewed`,
		);
		expect(corpus.records.map((r) => r.rid)).toEqual(['A00001', 'D00470']);
	});
});

describe('reviewedManifestProblems', () => {
	const load = (): Promise<ReviewedCorpus> =>
		loadReviewedCorpus(`${import.meta.dir}/fixtures/reviewed`);
	it('is empty when manifest and patches reconcile', async () => {
		expect(reviewedManifestProblems(await load())).toEqual([]);
	});
	it('flags a reviewed patch no manifest row lists', async () => {
		const corpus = await load();
		const first = corpus.patches[0];
		if (first === undefined) {
			throw new Error('fixture broken');
		}
		corpus.patches.push({ ...first, id: 'P900002' });
		expect(reviewedManifestProblems(corpus)).toEqual([
			{
				reason:
					'reviewed manifest: corpus patch P900002 is not listed by any record',
				rid: 'A00001',
			},
		]);
	});
	it('flags a manifest row naming a patch that does not exist', async () => {
		const corpus = await load();
		corpus.patches = [];
		expect(reviewedManifestProblems(corpus)).toEqual([
			{
				reason:
					'reviewed manifest: listed patch P900001 does not exist in the corpus',
				rid: 'A00001',
			},
		]);
	});
});
