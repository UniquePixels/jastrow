# Consolidation Step 4 — Report Rows and Patch Drift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `bun pipeline:migrate` reports structured rows, per-rule counts and per-patch outcomes, and a patch whose precondition no longer holds becomes a report row instead of refusing the run.

**Architecture:** A new pure module `patch/drift.ts` classifies a patch that no longer resolves as `upstream-fixed` or `upstream-changed`. `patch/apply.ts` and `body/compose.ts` gain an opt-in `drift` mode (default unchanged, so research tools and the corpus tier see no change). `migrate/report.ts` replaces its three string lists with one `ReportRow[]`, adds rule counts, patch outcomes and a snapshot header; `migrate.ts` wires it and adds `--strict`, which restores today's refusals exactly.

**Tech Stack:** Bun, TypeScript, `bun:test`, Biome, jq (verification only).

**Spec:** `docs/specs/2026-09-13-pipeline-consolidation-design.md` §3.1, §3.3, §4.2, §11 step 4.

## Global Constraints

- **Truth is byte-identical.** No file under `data/entries/` changes. On the committed snapshot every patch still applies, so every gate tally stays exactly as `docs/v2/migration-blessing.md` shows today (bodyRoundTrips 32512/32512, headwordRoundTrip 76104/76104, textConservation 232579/232579, schema 32512/32512, chain 32514/32514, internalTargets 0/0, slugs 32512/32512, pages 32512/32512, composition 65024/65024).
- **Defaults do not move.** `applyEntryPatches`, `applyCarryOver`, `corpusPreflight` and `composeEntry` behave exactly as today when the new argument/option is omitted. `research:apply`, `body/migrate-dry.ts`, `patch/apply.corpus.test.ts` and `migrate/gates.corpus.test.ts` are not edited.
- **`migrate/finish.ts` is not edited.** `gates.corpus.test.ts` pins its `markupCarries` strings; rows are built from its `rid: detail` lines in `migrate.ts`.
- **Blessing text is preserved.** Every line the current blessing doc renders is still rendered byte-identically, except the one `Patch corpus:` header line. New content is additions only.
- **`--strict` = today's behaviour:** a stale pin refuses the run, and a drifted patch is a patch problem (gate 9 red).
- Every commit: run `bun qa` first; `git commit -s`; subject `<emoji> <type>(<scope>): <description>` ≤ 50 chars; message ends with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Work only in `<worktree-root>` (branch `feat/consolidation-step4`, off `origin/v2` at `96d87b78`).

**User decisions (already made):**
- Pin mismatch → one count in the report header only; each patch is judged by its own `expected_before`; `--strict` restores refusal; spec §4.2 is reworded to say so. (Brian, 2026-09-14)
- Required status checks on `v2` (§5.2) are deferred until near release; note the deferral in the spec in this PR, change no repository setting. (Brian, 2026-09-14)

---

### Task 1: Patch drift classification

**Goal:** A pure function that says whether a patch's precondition holds on an entry and, if not, whether the source already reads as the patch leaves it.

**Files:**
- Create: `admin/pipeline/patch/drift.ts`
- Test: `admin/pipeline/patch/drift.test.ts`

**Acceptance Criteria:**
- [ ] `classifyDrift(entry, patch)` returns `undefined` when the target resolves exactly `expected_occurrences` times.
- [ ] Returns `'upstream-fixed'` when the target resolves 0 times and a contiguous sibling run at any depth equals (number + definition) the senses the patch produces from its own `expected_before`.
- [ ] Returns `'upstream-changed'` for every other mismatch, including a partial count (found > 0), a sense-deleting patch, and a patch that cannot apply to its own `expected_before`.
- [ ] 9 tests in `drift.test.ts` pass.

**Verify:** `bun test admin/pipeline/patch/drift.test.ts` → `9 pass, 0 fail`

**Steps:**

- [ ] **Step 1: Write the failing test** — `admin/pipeline/patch/drift.test.ts`:

```ts
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
		expect(classifyDrift(entryWith({ definition: OCR_BEFORE }), patch())).toBe(
			undefined,
		);
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
		expect(classifyDrift(entryWith({ definition: before, number: '2)' }), retag)).toBe(
			'upstream-fixed',
		);
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test admin/pipeline/patch/drift.test.ts`
Expected: FAIL — `Cannot find module './drift.ts'`

- [ ] **Step 3: Write the implementation** — `admin/pipeline/patch/drift.ts`:

```ts
/**
 * Patch drift (consolidation spec §3.3, §4.2): a patch whose
 * precondition — its target resolving `expected_occurrences` times —
 * no longer holds on the entry it meets. Sefaria correcting an entry is
 * the expected cause; the run reports the patch rather than refusing.
 *
 * `upstream-fixed` is claimed only when it can be shown: the target is
 * gone entirely AND the senses the patch would have produced are
 * present, number and definition both. Everything else is
 * `upstream-changed` and goes to a person to re-judge — a wrong "fixed"
 * archives a patch that was still needed, a wrong "changed" costs one
 * look.
 */
import type { SourceEntry, SourceSense } from '../body/types.ts';
import {
	applyPatch,
	PatchApplyError,
	parseTarget,
	resolveTarget,
	type SemanticPatch,
	walkSenses,
} from './schema.ts';

type DriftOutcome = 'upstream-changed' | 'upstream-fixed';

/** The senses a patch leaves where its target stood, computed by
 * applying it to an entry holding only that target. `undefined` when
 * the patch removes the sense outright (nothing to look for) or cannot
 * apply even to its own `expected_before`. */
function postState(patch: SemanticPatch): SourceSense[] | undefined {
	const { token } = parseTarget(patch.target);
	const sense: SourceSense =
		token === ''
			? { definition: patch.expected_before }
			: { definition: patch.expected_before, number: token };
	const alone: SourceEntry = {
		content: { senses: [sense] },
		headword: '',
		rid: patch.rid,
	};
	try {
		const after = applyPatch(alone, {
			...patch,
			expected_occurrences: 1,
			occurrence_index: 1,
		});
		return after.content.senses.length === 0 ? undefined : after.content.senses;
	} catch (error) {
		if (error instanceof PatchApplyError) {
			return undefined;
		}
		throw error;
	}
}

function sameSense(a: SourceSense, b: SourceSense): boolean {
	return (
		(a.number ?? '') === (b.number ?? '') &&
		(a.definition ?? '') === (b.definition ?? '')
	);
}

/** Whether `run` appears as consecutive siblings anywhere in the tree. */
function holdsRun(entry: SourceEntry, run: readonly SourceSense[]): boolean {
	for (const { index, siblings } of walkSenses(entry)) {
		const matches = run.every((want, k) => {
			const got = siblings[index + k];
			return got !== undefined && sameSense(got, want);
		});
		if (matches) {
			return true;
		}
	}
	return false;
}

/** `undefined` when the patch's precondition holds on `entry`;
 * otherwise which kind of drift it is. */
function classifyDrift(
	entry: SourceEntry,
	patch: SemanticPatch,
): DriftOutcome | undefined {
	const found = resolveTarget(entry, parseTarget(patch.target)).length;
	if (found === patch.expected_occurrences) {
		return;
	}
	if (found !== 0) {
		return 'upstream-changed';
	}
	const after = postState(patch);
	return after !== undefined && holdsRun(entry, after)
		? 'upstream-fixed'
		: 'upstream-changed';
}

export type { DriftOutcome };
export { classifyDrift };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test admin/pipeline/patch/drift.test.ts`
Expected: `9 pass, 0 fail`

- [ ] **Step 5: Quality gate and commit**

```bash
bun qa
git add admin/pipeline/patch/drift.ts admin/pipeline/patch/drift.test.ts
git commit -s -m "🦄 new(patch): classify patch drift" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Opt-in drift mode and pin option in apply/compose

**Goal:** `applyEntryPatches`, `applyCarryOver` and `composeEntry` can report drift as outcomes instead of problems, and `corpusPreflight` can skip the pin check — all opt-in, defaults unchanged.

**Files:**
- Modify: `admin/pipeline/patch/apply.ts` (`PreflightOptions` ~l.280, `corpusPreflight` ~l.309, `applyEntryPatches` ~l.488, `applyCarryOver` ~l.541, exports)
- Modify: `admin/pipeline/body/compose.ts` (`ComposePatches`, `ComposeResult`, `composeEntry` patch-apply phase)
- Test: `admin/pipeline/patch/apply.test.ts`, `admin/pipeline/body/compose.test.ts`

**Acceptance Criteria:**
- [ ] `stalePins(patches, pin)` returns the patches whose `snapshot` differs from `pin`.
- [ ] `corpusPreflight(..., { pins: 'skip' })` reports no `snapshot pin` problem but still reports overlapping patches; omitting `pins` behaves as today.
- [ ] `applyEntryPatches(entry, patches, 'outcome')` returns `drifted: PatchDrift[]` and no problem for a drifted patch; with no third argument a drifted patch is a problem (existing test at `apply.test.ts:286` passes unchanged) and `drifted` is `[]`.
- [ ] `applyCarryOver(entry, patches, 'outcome')` reports a wrong-count pre-state as `upstream-changed` drift, not a problem; the existing wrong-count test passes unchanged.
- [ ] `composeEntry(source, { accepted, drift: 'outcome' })` returns `patchDrift` and excludes drifted patches from `patchesApplied`.
- [ ] `bun qa:test` passes; no existing test edited.

**Verify:** `bun test admin/pipeline/patch/apply.test.ts admin/pipeline/body/compose.test.ts` → all pass, 0 fail

**Steps:**

- [ ] **Step 1: Write the failing tests.** Append to `admin/pipeline/patch/apply.test.ts` (add `stalePins` to the `./apply.ts` import list):

```ts
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
```

Append inside `describe('composeEntry', …)` in `admin/pipeline/body/compose.test.ts` (add imports `import { contentAnchor, type SemanticPatch } from '../patch/schema.ts';`):

```ts
	it("reports a drifted patch as an outcome under drift 'outcome', a problem by default", async () => {
		const source = await loadFixture('C01331');
		const missing = 'text this entry does not carry';
		const drifting = {
			confidence: 'high',
			defect_class: 'test-drift',
			expected_before: missing,
			expected_occurrences: 1,
			id: 'P999999',
			occurrence_index: 1,
			op: 'replace',
			payload: { find: 'carry', replace: 'bear' },
			prompt_version: 'v1',
			rationale: 'drift fixture',
			rid: 'C01331',
			snapshot: `sha256:${'a'.repeat(64)}`,
			target: `sense[]:${contentAnchor(missing)}`,
		} as SemanticPatch;
		const outcome = composeEntry(source, {
			accepted: [drifting],
			drift: 'outcome',
		});
		expect(outcome.patchProblems).toEqual([]);
		expect(outcome.patchDrift).toEqual([
			{ outcome: 'upstream-changed', patchId: 'P999999', rid: 'C01331' },
		]);
		expect(outcome.patchesApplied).toBe(0);
		const byDefault = composeEntry(source, { accepted: [drifting] });
		expect(byDefault.patchProblems).toHaveLength(1);
		expect(byDefault.patchDrift).toEqual([]);
		expect(byDefault.patchesApplied).toBe(0);
	});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test admin/pipeline/patch/apply.test.ts admin/pipeline/body/compose.test.ts`
Expected: FAIL — `stalePins` not exported / `drifted` undefined / `patchDrift` undefined.

- [ ] **Step 3: Implement in `admin/pipeline/patch/apply.ts`.**

Add the import `import { classifyDrift, type DriftOutcome } from './drift.ts';` and, after the `ApplyProblem` interface:

```ts
/** What a patch whose precondition no longer holds becomes
 * (consolidation spec §4.2). `problem`: an apply problem, as the
 * research track has always treated it and as `--strict` restores.
 * `outcome`: a `PatchDrift` row — not a problem; the run continues. */
type DriftMode = 'outcome' | 'problem';

/** One patch skipped because its precondition no longer holds. */
interface PatchDrift {
	outcome: DriftOutcome;
	patchId: string;
	rid: string;
}

/** Patches pinned to a snapshot other than `currentPin`. Every patch
 * pins one hash over the whole export, so a new export makes this every
 * patch at once — which is why migrate reports it as a count and judges
 * each patch by its own `expected_before` instead. */
function stalePins(
	patches: readonly SemanticPatch[],
	currentPin: string,
): SemanticPatch[] {
	return patches.filter((patch) => patch.snapshot !== currentPin);
}
```

In `PreflightOptions` add:

```ts
	/** `block` (default): a stale snapshot pin is a problem. `skip`: it
	 * is not checked here — migrate counts it with `stalePins` and
	 * judges each patch by its precondition (consolidation spec §4.2). */
	pins?: 'block' | 'skip';
```

Replace the pin loop at the top of `corpusPreflight` with:

```ts
	if ((options?.pins ?? 'block') === 'block') {
		for (const patch of stalePins(patches, currentPin)) {
			problems.push({
				patchId: patch.id,
				reason: `snapshot pin ${patch.snapshot} does not match current ${currentPin} — maintenance-track rebase required (spec §6)`,
				rid: patch.rid,
			});
		}
	}
```

Replace `applyEntryPatches` with:

```ts
/** Apply one rid's patches in committed corpus order, chaining state.
 * Every problem is recorded (the failing patch is skipped, later
 * patches still try against the last good state) so a run reports
 * all drift at once. Under `drift: 'outcome'` a patch whose
 * precondition no longer holds is a `drifted` row instead of a
 * problem. */
function applyEntryPatches(
	entry: SourceEntry,
	patches: readonly SemanticPatch[],
	drift: DriftMode = 'problem',
): { drifted: PatchDrift[]; entry: SourceEntry; problems: ApplyProblem[] } {
	let current = entry;
	const drifted: PatchDrift[] = [];
	const problems: ApplyProblem[] = [];
	for (const patch of patches) {
		if (drift === 'outcome') {
			const outcome = classifyDrift(current, patch);
			if (outcome !== undefined) {
				drifted.push({ outcome, patchId: patch.id, rid: patch.rid });
				continue;
			}
		}
		try {
			const next = applyPatch(current, patch);
			postApplyAssertions(next, patch);
			const verdict = validateNoNewText(patch, current, next);
			if (!verdict.ok) {
				problems.push({
					patchId: patch.id,
					reason: `${verdict.reason} — entry re-dispositions ${verdict.redisposition}`,
					rid: patch.rid,
				});
				continue;
			}
			current = next;
		} catch (error) {
			if (
				error instanceof PatchApplyError ||
				error instanceof PatchFormatError
			) {
				problems.push({
					patchId: patch.id,
					reason: error.message,
					rid: patch.rid,
				});
				continue;
			}
			throw error;
		}
	}
	return { drifted, entry: current, problems };
}
```

In `applyCarryOver`: add the parameter `drift: DriftMode = 'problem'`, add `drifted: PatchDrift[]` to the return type and a `const drifted: PatchDrift[] = [];`, and replace the wrong-count branch with:

```ts
		if (found !== patch.expected_occurrences) {
			// found > 0 here, so this is never "fixed": some matches remain.
			if (drift === 'outcome') {
				drifted.push({
					outcome: 'upstream-changed',
					patchId: patch.id,
					rid: patch.rid,
				});
				continue;
			}
			problems.push({
				patchId: patch.id,
				reason: `carry-over pre-state target ${patch.target} resolves ${found} time(s); expected ${patch.expected_occurrences} — neither absorbed nor safe to apply`,
				rid: patch.rid,
			});
			continue;
		}
```

and return `{ absorbed, carried, drifted, entry: current, problems }`. Add `DriftMode`, `PatchDrift` to `export type { … }` and `stalePins` to `export { … }`.

- [ ] **Step 4: Implement in `admin/pipeline/body/compose.ts`.**

Import `type DriftMode, type PatchDrift` from `../patch/apply.ts`. In `ComposePatches` add:

```ts
	/** Drift policy for both patch sets (consolidation spec §4.2).
	 * Omitted: `problem`, the research-track behaviour. */
	drift?: DriftMode | undefined;
```

In `ComposeResult` add:

```ts
	/** Patches skipped because their precondition no longer holds
	 * (`drift: 'outcome'` only; always empty otherwise). */
	patchDrift: PatchDrift[];
```

Replace the `patch-apply` phase body with:

```ts
	const patched = phases.run('patch-apply', () => {
		const afterAccepted =
			accepted === undefined
				? {
						drifted: [] as PatchDrift[],
						entry: structural.entry,
						problems: [] as ApplyProblem[],
					}
				: applyEntryPatches(structural.entry, accepted, patches?.drift);
		const acceptedApplied =
			accepted === undefined
				? 0
				: accepted.length -
					afterAccepted.problems.length -
					afterAccepted.drifted.length;
		if (carryGroup === undefined) {
			return {
				absorbed: [] as string[],
				applied: acceptedApplied,
				carried: [] as string[],
				drifted: afterAccepted.drifted,
				entry: afterAccepted.entry,
				problems: afterAccepted.problems,
			};
		}
		const carry = applyCarryOver(
			afterAccepted.entry,
			carryGroup,
			patches?.drift,
		);
		// `carry.problems` mixes two sources: a pre-check problem for a
		// patch that never joined `carried` at all, and an apply-gate
		// failure for one that did. Only the second kind should reduce
		// the carried count — subtracting the whole list can undercount
		// (or go negative) the moment a pre-check problem exists.
		const carriedIds = new Set(carry.carried);
		const carriedFailures = carry.problems.filter(
			(problem) =>
				problem.patchId !== undefined && carriedIds.has(problem.patchId),
		).length;
		return {
			absorbed: carry.absorbed,
			applied: acceptedApplied + carry.carried.length - carriedFailures,
			carried: carry.carried,
			drifted: [...afterAccepted.drifted, ...carry.drifted],
			entry: carry.entry,
			problems: [...afterAccepted.problems, ...carry.problems],
		};
	});
```

and add `patchDrift: patched.drifted,` to the returned object.

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun test admin/pipeline/patch/apply.test.ts admin/pipeline/body/compose.test.ts`
Expected: all pass, 0 fail.

- [ ] **Step 6: Quality gate and commit**

```bash
bun qa
git add admin/pipeline/patch/apply.ts admin/pipeline/patch/apply.test.ts admin/pipeline/body/compose.ts admin/pipeline/body/compose.test.ts
git commit -s -m "🌈 improve(patch): opt-in drift mode, pin option" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Structured report rows, rule counts, patch outcomes

**Goal:** `migrate/report.ts` carries one `ReportRow[]`, per-rule counts, per-patch outcomes and a snapshot header, and the blessing doc renders them while keeping every existing line's text.

**Files:**
- Modify: `admin/pipeline/migrate/report.ts`
- Test: `admin/pipeline/migrate/report.test.ts`

**Acceptance Criteria:**
- [ ] `Report` has `rows`, `rules`, `patchOutcomes`, `snapshot: { pin, stalePins }`, and `patches.{upstreamFixed, upstreamChanged}`; `headwordReview`, `markupCarries`, `nonHighPages` are gone.
- [ ] `lineRow('A00002: x: y', kind)` → `{ rid: 'A00002', detail: 'x: y', kind, bucket: 'review', severity: 'review' }`; a line without `': '` throws.
- [ ] `createRuleCounter(names)` gives every named rule a row (0 included), in `names` order, then unregistered names in first-seen order; `entries` counts distinct rids.
- [ ] `renderBlessing` renders row sections as `- <rid>: <detail>`, a `## Rule counts` table `| rule | fired | entries |`, `## Patches needing re-judgment`, `## Pipeline faults`, and the snapshot line.
- [ ] `bun test admin/pipeline/migrate/report.test.ts` passes.

**Verify:** `bun test admin/pipeline/migrate/report.test.ts` → all pass, 0 fail

**Steps:**

- [ ] **Step 1: Rewrite the test file** — replace `greenReport` and the `renderBlessing` describe in `admin/pipeline/migrate/report.test.ts`; keep the `createReport`, `isGreen` and `writeReport` describes as they are. Update the import to `import { createReport, createRuleCounter, GATE_NAMES, isGreen, lineRow, renderBlessing, writeReport } from './report.ts';`.

```ts
function greenReport(): Report {
	const gates = Object.fromEntries(
		GATE_NAMES.map((name) => [
			name,
			name === 'internalTargets'
				? { failures: [], pass: 0, total: 0 }
				: greenTally(),
		]),
	) as Record<GateName, Tally>;
	return {
		entries: 1,
		gates,
		patchOutcomes: [],
		patches: {
			absorbed: 0,
			accepted: 0,
			applied: 0,
			carried: 0,
			upstreamChanged: 0,
			upstreamFixed: 0,
		},
		quarantine: [],
		rows: [],
		rules: [],
		slugCollisions: {},
		snapshot: { pin: `sha256:${'a'.repeat(64)}`, stalePins: 0 },
		unresolved: [],
		written: 1,
	};
}

describe('lineRow', () => {
	it('splits a finishEntry line at the first ": " only', () => {
		expect(lineRow('A00002: senses[0].gloss: carried i', 'markup-carry')).toEqual({
			bucket: 'review',
			detail: 'senses[0].gloss: carried i',
			kind: 'markup-carry',
			rid: 'A00002',
			severity: 'review',
		});
	});

	it('throws on a line with no rid prefix', () => {
		expect(() => lineRow('no prefix here', 'markup-carry')).toThrow('rid');
	});
});

describe('createRuleCounter', () => {
	it('rows every registered rule, zeros included, then unregistered ones', () => {
		const counter = createRuleCounter(['a', 'b']);
		counter.add('b', 'A00001');
		counter.add('b', 'A00001');
		counter.add('b', 'A00002');
		counter.add('z', 'A00003');
		expect(counter.rows()).toEqual([
			{ entries: 0, fired: 0, rule: 'a' },
			{ entries: 2, fired: 3, rule: 'b' },
			{ entries: 1, fired: 1, rule: 'z' },
		]);
	});
});

describe('renderBlessing', () => {
	it('renders every section, rows as "rid: detail" under their own heading', () => {
		const report = greenReport();
		report.rows = [
			lineRow('A00002: ambiguous vocalization', 'headword-unparsed'),
			lineRow('A00002: senses[0].gloss: carried i', 'markup-carry'),
			{
				bucket: 'review',
				detail: 'p12a (low)',
				kind: 'page-confidence-low',
				rid: 'A00003',
				severity: 'review',
			},
			{
				bucket: 'patch',
				detail: 'P000001 (ocr-marker): re-judge',
				kind: 'upstream-changed',
				rid: 'A00005',
				severity: 'review',
			},
			{
				bucket: 'pipeline',
				detail: 'transform: boom',
				kind: 'composition-failed',
				rid: 'A00006',
				severity: 'fault',
			},
		];
		report.rules = [{ entries: 2, fired: 3, rule: 'bare-rtl-hebrew' }];
		report.snapshot.stalePins = 4;
		report.slugCollisions = { '2': 3 };
		const quarantine: QuarantineRow[] = [
			{ note: 'no match', rid: 'A00004', target: 'שלום' },
		];
		report.quarantine = quarantine;
		const sample: Sample = {
			rid: 'A00013',
			source: { headword: 'אָב I', rid: 'A00013' },
			truth: {
				headword: { text: 'אָב I' },
				id: 'A00013',
				senses: [],
				slug: 'av-i',
			} satisfies TruthEntry,
		};
		const doc = renderBlessing(report, [sample]);
		const section = (heading: string): string => {
			const start = doc.indexOf(`## ${heading}\n`);
			const end = doc.indexOf('\n## ', start + 1);
			return doc.slice(start, end === -1 ? undefined : end);
		};
		expect(doc).toContain('4 patch(es) pinned to a different snapshot');
		expect(doc).toContain('| Gate |');
		expect(section('Pipeline faults')).toContain('- A00006: transform: boom');
		expect(section('Headword review')).toContain('- A00002: ambiguous vocalization');
		expect(section('Headword review')).not.toContain('p12a');
		expect(section('Markup carried across unit boundaries')).toContain(
			'- A00002: senses[0].gloss: carried i',
		);
		expect(section('Page placements needing review')).toContain('- A00003: p12a (low)');
		expect(section('Patches needing re-judgment')).toContain(
			'- A00005: P000001 (ocr-marker): re-judge',
		);
		expect(section('Rule counts')).toContain('| bare-rtl-hebrew | 3 | 2 |');
		expect(doc).toContain('## Slug collisions');
		expect(doc).toContain('## Quarantined internal targets');
		expect(doc).toContain('### A00013');
	});

	it('renders empty-list placeholders when a report has nothing to review', () => {
		const doc = renderBlessing(greenReport(), []);
		expect(doc).toContain('_none_');
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test admin/pipeline/migrate/report.test.ts`
Expected: FAIL — `lineRow` / `createRuleCounter` not exported.

- [ ] **Step 3: Implement in `admin/pipeline/migrate/report.ts`.** Add, after the imports (`import type { DriftOutcome } from '../patch/drift.ts';`):

```ts
type Bucket = 'patch' | 'pipeline' | 'review';
type Severity = 'fault' | 'review';

/** One report row (consolidation spec §3.1): the one shape every
 * review item, patch re-judgment and pipeline fault shares, so a later
 * run can be diffed against this one and the admin tool can route rows
 * by `bucket`. */
interface ReportRow {
	bucket: Bucket;
	detail: string;
	kind: string;
	rid: string;
	severity: Severity;
}

/** A rule's tally over one run. COMPOSED: each rule sees the text the
 * rules before it left, so this is not `transform:count`'s rule-alone
 * figure. */
interface RuleCount {
	entries: number;
	fired: number;
	rule: string;
}

interface RuleCounter {
	add(rule: string, rid: string): void;
	rows(): RuleCount[];
}

type PatchOutcome = 'applied' | 'superseded' | DriftOutcome;

/** What happened to one patch the run offered to an entry (spec §3.3).
 * A patch that failed its apply gate has no outcome: it is a
 * `patch-failed` fault row and a red gate 9. */
interface PatchOutcomeRow {
	outcome: PatchOutcome;
	patchId: string;
	rid: string;
}
```

Replace the `Report` interface and `createReport` with:

```ts
interface Report {
	entries: number;
	gates: Record<GateName, Tally>;
	patchOutcomes: PatchOutcomeRow[];
	/** Patch accounting (Ruling F; consolidation spec §4.2). Every skip
	 * is counted here as well as listed as a row. */
	patches: {
		absorbed: number;
		accepted: number;
		applied: number;
		carried: number;
		upstreamChanged: number;
		upstreamFixed: number;
	};
	quarantine: QuarantineRow[];
	rows: ReportRow[];
	rules: RuleCount[];
	/** collision size → number of stems of that size */
	slugCollisions: Record<string, number>;
	/** The snapshot this run read, and how many patches pin another one.
	 * A stale pin skips nothing; each patch is judged by its own
	 * precondition (spec §4.2). */
	snapshot: { pin: string; stalePins: number };
	unresolved: Unresolved[];
	written: number;
}
```

```ts
function createReport(): Report {
	const gates = Object.fromEntries(
		GATE_NAMES.map((name) => [name, tally()]),
	) as Record<GateName, Tally>;
	return {
		entries: 0,
		gates,
		patchOutcomes: [],
		patches: {
			absorbed: 0,
			accepted: 0,
			applied: 0,
			carried: 0,
			upstreamChanged: 0,
			upstreamFixed: 0,
		},
		quarantine: [],
		rows: [],
		rules: [],
		slugCollisions: {},
		snapshot: { pin: '', stalePins: 0 },
		unresolved: [],
		written: 0,
	};
}

/** A `rid: detail` line from `finishEntry` as a row. The rid is the
 * text before the FIRST `: ` — details themselves contain `: `. */
function lineRow(
	line: string,
	kind: string,
	bucket: Bucket = 'review',
	severity: Severity = 'review',
): ReportRow {
	const at = line.indexOf(': ');
	if (at === -1) {
		throw new Error(`report line has no "rid: " prefix: ${line}`);
	}
	return {
		bucket,
		detail: line.slice(at + 2),
		kind,
		rid: line.slice(0, at),
		severity,
	};
}

/** Per-rule tallies for one run. Every name given up front gets a row
 * even at 0 — a zero is information ("Sefaria fixed it" or "the rule
 * is dead", spec §3.1). A name seen but not given still gets a row,
 * after the given ones, so no firing is ever dropped. */
function createRuleCounter(names: readonly string[]): RuleCounter {
	const tallies = new Map<string, { fired: number; rids: Set<string> }>(
		names.map((name) => [name, { fired: 0, rids: new Set<string>() }]),
	);
	return {
		add(rule, rid) {
			let t = tallies.get(rule);
			if (t === undefined) {
				t = { fired: 0, rids: new Set<string>() };
				tallies.set(rule, t);
			}
			t.fired++;
			t.rids.add(rid);
		},
		rows() {
			return [...tallies].map(([rule, t]) => ({
				entries: t.rids.size,
				fired: t.fired,
				rule,
			}));
		},
	};
}

/** Matching rows as `rid: detail`, in the order the run found them —
 * the same text the blessing doc rendered before rows existed. */
function rowLines(
	report: Report,
	match: (row: ReportRow) => boolean,
): string[] {
	return report.rows.filter(match).map((r) => `${r.rid}: ${r.detail}`);
}

function ruleRows(report: Report): string[] {
	return report.rules.map((r) => `| ${r.rule} | ${r.fired} | ${r.entries} |`);
}
```

Replace the head of `renderBlessing`'s array, through the `## Page placements needing review` section, with:

```ts
		'# Migration blessing — evidence',
		'',
		`Generated by \`bun pipeline:migrate\` over ${report.entries} entries. ${isGreen(report) ? 'Every gate is green.' : 'At least one gate is RED.'}`,
		'',
		`Snapshot \`${report.snapshot.pin}\`: ${report.snapshot.stalePins} patch(es) pinned to a different snapshot, each judged by its own \`expected_before\`.`,
		'',
		`Patch corpus: ${report.patches.accepted} accepted, ${report.patches.applied} applied, ${report.patches.absorbed} carry-over absorbed, ${report.patches.carried} carried, ${report.patches.upstreamFixed} upstream-fixed, ${report.patches.upstreamChanged} upstream-changed.`,
		'',
		'## Gates',
		'',
		'| Gate | pass / total | failures |',
		'|---|---|---|',
		...gateRows(report),
		'',
		'## Pipeline faults',
		'',
		list(
			rowLines(report, (r) => r.severity === 'fault'),
			'none',
		),
		'',
		'## Headword review',
		'',
		list(
			rowLines(report, (r) => r.kind === 'headword-unparsed'),
			'none',
		),
		'',
		'## Markup carried across unit boundaries',
		'',
		list(
			rowLines(report, (r) => r.kind === 'markup-carry'),
			'none',
		),
		'',
		'## Page placements needing review',
		'',
		list(
			rowLines(report, (r) => r.kind.startsWith('page-confidence-')),
			'none',
		),
		'',
		'## Patches needing re-judgment',
		'',
		list(
			rowLines(report, (r) => r.bucket === 'patch'),
			'none',
		),
		'',
		'## Rule counts',
		'',
		'Composed counts: each rule sees the text the rules before it left.',
		'',
		'| rule | fired | entries |',
		'|---|---|---|',
		...ruleRows(report),
		'',
```

(the `## Slug collisions`, `## Quarantined internal targets` and `## Samples` sections that follow stay unchanged). Update the exports:

```ts
export type {
	GateName,
	PatchOutcome,
	PatchOutcomeRow,
	Report,
	ReportRow,
	RuleCount,
	RuleCounter,
	Sample,
};
export {
	BLESSING_PATH,
	createReport,
	createRuleCounter,
	GATE_NAMES,
	isGreen,
	lineRow,
	REPORT_PATH,
	renderBlessing,
	writeReport,
};
```

Update the file's top docblock to: `/** The migration report (migrate spec §4.2; consolidation spec §3.1): every gate as a tally, structured rows, rule counts, patch outcomes, and the evidence doc the maintainer blesses. */`

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test admin/pipeline/migrate/report.test.ts`
Expected: all pass. (`bun qa:tsc` will fail on `migrate.ts` until Task 4 — that is expected; do not commit until Task 4's wiring compiles.)

- [ ] **Step 5: Stage only.** `git add admin/pipeline/migrate/report.ts admin/pipeline/migrate/report.test.ts` — this lands in Task 4's commit because `migrate.ts` does not type-check against the new `Report` until then.

---

### Task 4: Wire rows, rule counts, drift and `--strict` into migrate

**Goal:** `bun pipeline:migrate` fills the new report, judges patches by precondition, counts stale pins, and refuses on either only under `--strict` — with truth byte-identical and the blessing doc changed by additions plus one header line.

**Files:**
- Modify: `admin/pipeline/migrate.ts`
- Modify: `docs/v2/migration-blessing.md` (regenerated by the run, committed)

**Acceptance Criteria:**
- [ ] `bun qa` passes (format, lint, unit tests, tsc).
- [ ] Dry run exits 0; all nine gate tallies equal the Global Constraints numbers.
- [ ] `git diff docs/v2/migration-blessing.md | grep '^-[^-]'` prints exactly one line, the old `Patch corpus: 113 accepted, 118 applied, 61 carry-over absorbed, 5 carried.`
- [ ] Report JSON: `snapshot.stalePins` 0, `patches.upstreamFixed` 0, `patches.upstreamChanged` 0, `patchOutcomes` = 118 `applied` + 61 `superseded`, 0 `fault` rows, `rules` length = `RULES.length + 7`.
- [ ] Rebuild: `rm -rf data/entries && bun pipeline:migrate --write` then `git status --porcelain -- data/entries` prints nothing.

**Verify:** `bun pipeline:migrate && jq '{stale: .snapshot.stalePins, fixed: .patches.upstreamFixed, changed: .patches.upstreamChanged, outcomes: (.patchOutcomes | group_by(.outcome) | map({(.[0].outcome): length}) | add), faults: ([.rows[] | select(.severity == "fault")] | length), rules: (.rules | length)}' data/source/migration-report.json` → `stale 0, fixed 0, changed 0, outcomes {applied: 118, superseded: 61}, faults 0, rules RULES.length+7`

**Steps:**

- [ ] **Step 1: Imports and constants.** In `admin/pipeline/migrate.ts`:
  - `ComposeResult` type import from `./body/compose.ts`.
  - From `./migrate/report.ts` add `createRuleCounter`, `lineRow`, `type RuleCounter`.
  - From `./patch/apply.ts` add `type DriftMode`, `stalePins`.
  - Add `import type { DriftOutcome } from './patch/drift.ts';` and `import { RULES } from './transform/registry.ts';`.
  - Update the header docblock: `Run: bun pipeline:migrate [--write] [--strict]`, and add the sentence: `A patch whose precondition no longer holds, or that pins another snapshot, is a report row; \`--strict\` makes either refuse the run (consolidation spec §4.2).`

```ts
/** `repairs.ts` pass names (`PassName`), counted as rules alongside
 * the registry (consolidation spec §4.1). A pass missing here still
 * gets a row when it fires — only its zero row would be lost. */
const REPAIR_PASSES = [
	'rejoin-chopped',
	'implied-one',
	'marker-reinsert',
	'label-repair',
	'binyan-cleanup',
	'cite-wrap',
	'refs-removal',
] as const;

const DRIFT_DETAIL: Record<DriftOutcome, string> = {
	'upstream-changed': 'the source changed under this patch; re-judge it',
	'upstream-fixed':
		'the source already reads as this patch leaves it; archive the patch',
};
```

- [ ] **Step 2: `PatchGroups` and `preparePatches`.**

```ts
/** The rid-grouped patch sets `composeOne` applies (Ruling F), and the
 * drift policy they apply under. */
interface PatchGroups {
	accepted: Map<string, SemanticPatch[]>;
	carryOver: Map<string, SemanticPatch[]>;
	drift: DriftMode;
}
```

```ts
/** Preflight the accepted patch corpus and group it by rid. The full
 * apply set (accepted + carry-over, Ruling F) is corpus-checked
 * together, the manifest reconciles against the accepted set only, and
 * every escalation defers to post-go-live (Ruling D). A stale snapshot
 * pin is counted, not refused, unless `strict` (consolidation §4.2). */
async function preparePatches(
	report: Report,
	strict: boolean,
): Promise<PatchGroups> {
	const accepted = await loadAcceptedCorpus();
	const applySet = [...accepted.patches, ...accepted.carryOver];
	const pin = `sha256:${(await computeSnapshot()).combined}`;
	report.snapshot = { pin, stalePins: stalePins(applySet, pin).length };
	const preflight = corpusPreflight(applySet, accepted.records, pin, {
		escalations: 'defer',
		pins: strict ? 'block' : 'skip',
		reconcileOnly: accepted.patches,
	});
	if (preflight.length > 0) {
		throw new Error(
			`patch-corpus preflight failed (${preflight.length} problem(s)):\n${preflight
				.map((p) => `${p.patchId ?? p.rid ?? '(corpus)'}: ${p.reason}`)
				.join('\n')}`,
		);
	}
	report.patches.accepted = accepted.patches.length;
	return {
		accepted: patchesByRid(accepted.patches),
		carryOver: patchesByRid(accepted.carryOver),
		drift: strict ? 'problem' : 'outcome',
	};
}
```

- [ ] **Step 3: Patch outcomes, and `composeOne`.**

```ts
/** One outcome row per patch this entry was offered (spec §3.3). A
 * drifted patch is also a review row and a header count; a patch that
 * failed its apply gate gets no outcome — it is a fault row instead. */
function recordPatchOutcomes(
	rid: string,
	offered: readonly SemanticPatch[],
	result: ComposeResult,
	report: Report,
): void {
	const failed = new Set(result.patchProblems.map((p) => p.patchId));
	const drifted = new Map(result.patchDrift.map((d) => [d.patchId, d.outcome]));
	const absorbed = new Set(result.carryOver.absorbed);
	for (const patch of offered) {
		const drift = drifted.get(patch.id);
		if (drift !== undefined) {
			report.patchOutcomes.push({ outcome: drift, patchId: patch.id, rid });
			report.rows.push({
				bucket: 'patch',
				detail: `${patch.id} (${patch.defect_class}): ${DRIFT_DETAIL[drift]}`,
				kind: drift,
				rid,
				severity: 'review',
			});
			if (drift === 'upstream-fixed') {
				report.patches.upstreamFixed++;
			} else {
				report.patches.upstreamChanged++;
			}
		} else if (absorbed.has(patch.id)) {
			report.patchOutcomes.push({ outcome: 'superseded', patchId: patch.id, rid });
		} else if (!failed.has(patch.id)) {
			report.patchOutcomes.push({ outcome: 'applied', patchId: patch.id, rid });
		}
	}
}
```

Replace `composeOne` with:

```ts
/** One entry through the composer and the body round-trip gate. A
 * composition failure is recorded on gate 9 and as a fault row, and the
 * entry is dropped from pass 2 — the walk keeps going so one run lists
 * every failure. */
function composeOne(
	source: SourceEntry,
	groups: PatchGroups,
	report: Report,
	rules: RuleCounter,
): Composed | undefined {
	const accepted = groups.accepted.get(source.rid);
	const carryOver = groups.carryOver.get(source.rid);
	try {
		const result = composeEntry(source, {
			accepted,
			carryOver,
			drift: groups.drift,
		});
		for (const record of result.repairRecords) {
			rules.add(`repairs:${record.pass}`, record.rid);
		}
		for (const record of result.transformRecords) {
			rules.add(record.ruleId, record.rid);
		}
		report.patches.applied += result.patchesApplied;
		report.patches.absorbed += result.carryOver.absorbed.length;
		report.patches.carried += result.carryOver.carried.length;
		recordPatchOutcomes(
			source.rid,
			[...(accepted ?? []), ...(carryOver ?? [])],
			result,
			report,
		);
		for (const problem of result.patchProblems) {
			report.rows.push({
				bucket: 'pipeline',
				detail: `${problem.patchId ?? '(no patch id)'}: ${problem.reason}`,
				kind: 'patch-failed',
				rid: source.rid,
				severity: 'fault',
			});
		}
		const patchDetail = result.patchProblems
			.map((p) => `${p.patchId ?? source.rid}: ${p.reason}`)
			.join('; ');
		mark(
			report.gates.composition,
			result.patchProblems.length === 0,
			`${source.rid}: ${patchDetail}`,
		);
		const trace = result.phases.run('consumer-output', () =>
			buildTrace(result.entry),
		);
		const gates = evaluateRoundTrip(result.entry, trace);
		mark(
			report.gates.bodyRoundTrips,
			gates.rejoin && gates.units && gates.lettered && gates.formSection,
			`${source.rid}: body round-trip`,
		);
		return { body: trace.body, entry: result.entry, source };
	} catch (error) {
		const kind = error instanceof TransformFailure ? 'transform' : 'repair';
		const message = error instanceof Error ? error.message : String(error);
		mark(report.gates.composition, false, `${source.rid}: ${kind}: ${message}`);
		report.rows.push({
			bucket: 'pipeline',
			detail: `${kind}: ${message}`,
			kind: 'composition-failed',
			rid: source.rid,
			severity: 'fault',
		});
		return;
	}
}
```

If Biome reports `noExcessiveCognitiveComplexity` on `composeOne`, move the two `rules.add` loops into `function countRules(result: ComposeResult, rules: RuleCounter): void` and the `patch-failed` loop into `function recordPatchProblems(rid: string, result: ComposeResult, report: Report): void`, with the same bodies.

- [ ] **Step 4: `composeAll`.**

```ts
/** Pass 1: compose every entry; composition failures land on gate 9. */
async function composeAll(report: Report, strict: boolean): Promise<Composed[]> {
	const groups = await preparePatches(report, strict);
	const rules = createRuleCounter([
		...RULES.map((rule) => rule.id),
		...REPAIR_PASSES.map((pass) => `repairs:${pass}`),
	]);
	const composed: Composed[] = [];
	for await (const source of readSourceEntries()) {
		report.entries++;
		const one = composeOne(source, groups, report, rules);
		if (one !== undefined) {
			composed.push(one);
		}
		groups.accepted.delete(source.rid);
		groups.carryOver.delete(source.rid);
	}
	report.rules = rules.rows();
	// …the existing `missing` loop stays unchanged…
	return composed;
}
```

- [ ] **Step 5: `finishAll` rows.** Replace the three `report.headwordReview.push` / `report.markupCarries.push` / non-high `report.nonHighPages.push` sites with:

```ts
		report.rows.push(
			...finished.headwordReview.map((line) =>
				lineRow(line, 'headword-unparsed'),
			),
			...finished.markupCarries.map((line) => lineRow(line, 'markup-carry')),
			...finished.problems.map((line) =>
				lineRow(line, 'finish-failed', 'pipeline', 'fault'),
			),
		);
```

(placed where the first two pushes were, before the `mark(report.gates.composition, …)` call, which stays), and

```ts
		if (page !== undefined && page.confidence !== 'high') {
			report.rows.push({
				bucket: 'review',
				detail: `p${page.number}${page.column} (${page.confidence})`,
				kind: `page-confidence-${page.confidence}`,
				rid: c.source.rid,
				severity: 'review',
			});
		}
```

- [ ] **Step 6: `printGates` and `main`.** Replace the second `console.log` in `printGates` with:

```ts
	const kinds = new Map<string, number>();
	for (const row of report.rows) {
		kinds.set(row.kind, (kinds.get(row.kind) ?? 0) + 1);
	}
	console.log(
		`unresolved=${report.unresolved.length} ${[...kinds].map(([k, n]) => `${k}=${n}`).join(' ')}`,
	);
	console.log(
		`stalePins=${report.snapshot.stalePins} upstreamFixed=${report.patches.upstreamFixed} upstreamChanged=${report.patches.upstreamChanged}`,
	);
```

In `main`, add `const strict = process.argv.includes('--strict');` after `write`, and call `composeAll(report, strict)`.

- [ ] **Step 7: Quality gate.**

Run: `bun qa`
Expected: format clean, lint 0 warnings, unit tests pass, tsc clean.

- [ ] **Step 8: Dry run and report checks.**

```bash
bun pipeline:migrate
```

Expected: every `gate …` line matches the Global Constraints tallies; exit 0. Then:

```bash
bun -e "import { RULES } from './admin/pipeline/transform/registry.ts'; console.log(RULES.length + 7)"
jq '{stale: .snapshot.stalePins, fixed: .patches.upstreamFixed, changed: .patches.upstreamChanged, outcomes: (.patchOutcomes | group_by(.outcome) | map({(.[0].outcome): length}) | add), faults: ([.rows[] | select(.severity == "fault")] | length), rules: (.rules | length), zeroRules: ([.rules[] | select(.fired == 0)] | length)}' data/source/migration-report.json
git diff docs/v2/migration-blessing.md | grep '^-[^-]'
```

Expected: `rules` equals the first number; `stale 0, fixed 0, changed 0, outcomes {"applied": 118, "superseded": 61}, faults 0`; the grep prints exactly the old `Patch corpus:` line. Record `zeroRules` for the PR body. If any expectation fails, stop and report the output — do not adjust the expectation.

- [ ] **Step 9: Rebuild equals truth.**

```bash
rm -rf data/entries
bun pipeline:migrate --write
git status --porcelain -- data/entries
```

Expected: last command prints nothing.

- [ ] **Step 10: Commit** (includes Task 3's staged files and the regenerated blessing doc)

```bash
git add admin/pipeline/migrate.ts admin/pipeline/migrate/report.ts admin/pipeline/migrate/report.test.ts docs/v2/migration-blessing.md
git commit -s -m "🌈 improve(migrate): report rows, drift, --strict" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Planted drift control

**Goal:** Show end to end that a changed export makes one patch `upstream-fixed`, counts every pin as stale, keeps gates green, and that `--strict` refuses the same input — then restore the snapshot.

**Files:**
- Create (scratch, not committed): `<scratchpad>/probe-upstream-fixed.ts`
- Temporarily modify, then restore: `data/source/jastrow-dictionary.jsonl`, `docs/v2/migration-blessing.md`

**Acceptance Criteria:**
- [ ] Probe run exits 0 with all nine gates green.
- [ ] `patches.upstreamFixed` is 1, and `patchOutcomes` has an `upstream-fixed` row for exactly the patch id the probe printed.
- [ ] `snapshot.stalePins` equals `patches.accepted + patches.absorbed + patches.carried` from the same report.
- [ ] `bun pipeline:migrate --strict` on the probe input exits non-zero and its output contains `snapshot pin`.
- [ ] After restore, `git status --porcelain` prints nothing.

**Verify:** `jq '{fixed: .patches.upstreamFixed, stale: .snapshot.stalePins, applySet: (.patches.accepted + .patches.absorbed + .patches.carried), row: [.patchOutcomes[] | select(.outcome == "upstream-fixed")]}' data/source/migration-report.json` → `fixed 1`, `stale == applySet`, one row naming the probed patch

**Steps:**

- [ ] **Step 1: Write the probe script** at the scratch path above:

```ts
/** Plant an upstream fix: rewrite ONE accepted replace patch's target
 * text in the committed snapshot to the text the patch produces.
 * Run from the worktree root. `--skip N` tries the Nth candidate. */
const ROOT = process.cwd();
const { loadAcceptedCorpus } = await import(`${ROOT}/admin/pipeline/patch/apply.ts`);
const SOURCE = 'data/source/jastrow-dictionary.jsonl';
const skipAt = process.argv.indexOf('--skip');
let skip = skipAt === -1 ? 0 : Number(process.argv[skipAt + 1]);
const { patches } = await loadAcceptedCorpus();
const lines = (await Bun.file(SOURCE).text()).split('\n');
const count = (hay: string, needle: string) => hay.split(needle).length - 1;
for (const p of patches) {
	if (p.op !== 'replace') continue;
	const at = p.expected_before.indexOf(p.payload.find);
	const fixed =
		p.expected_before.slice(0, at) +
		p.payload.replace +
		p.expected_before.slice(at + p.payload.find.length);
	const before = JSON.stringify(p.expected_before).slice(1, -1);
	const after = JSON.stringify(fixed).slice(1, -1);
	const hits = lines.flatMap((line, i) =>
		line.includes(p.rid) && count(line, before) === 1 ? [i] : [],
	);
	if (hits.length !== 1) continue;
	if (skip-- > 0) continue;
	const i = hits[0] as number;
	lines[i] = (lines[i] as string).replace(before, () => after);
	await Bun.write(SOURCE, lines.join('\n'));
	console.log(`planted upstream fix for ${p.id} (${p.rid})`);
	process.exit(0);
}
console.error('no candidate found');
process.exit(1);
```

- [ ] **Step 2: Plant and run.**

```bash
bun <scratchpad>/probe-upstream-fixed.ts
bun pipeline:migrate
```

Then run the **Verify** jq. Expected: as in Acceptance Criteria. If the run reports the probed patch as `upstream-changed` instead (a rule rewrote the planted text before patch-apply), restore (Step 4), and retry Step 2 with `--skip 1`, then `--skip 2`, up to `--skip 4`. If no candidate gives `upstream-fixed`, stop and report every attempt's output.

- [ ] **Step 3: Strict refuses the same input.**

```bash
bun pipeline:migrate --strict 2>&1 | tail -5; echo "exit=${PIPESTATUS[0]}"
```

Expected: non-zero exit, output contains `snapshot pin`. (`PIPESTATUS` is bash; under zsh use `${pipestatus[1]}`.)

- [ ] **Step 4: Restore.**

```bash
git checkout -- data/source/jastrow-dictionary.jsonl docs/v2/migration-blessing.md
git status --porcelain
```

Expected: `git status --porcelain` prints nothing. Keep the probe's patch id and the jq output for the PR body. No commit.

---

### Task 6: Spec rulings, docs, review, PR

**Goal:** The spec and pipeline README describe what was built and record both 2026-09-14 rulings; the whole branch passes a local review and is opened as a PR into `v2`.

**Files:**
- Modify: `docs/specs/2026-09-13-pipeline-consolidation-design.md` (§3.1, §4.2, §5.2, §11 step 3, §12)
- Modify: `admin/pipeline/README.md` (report description near line 116)

**Acceptance Criteria:**
- [ ] §4.2 states: a stale pin is a header count and skips nothing; each patch is judged by its precondition; `upstream-changed` covers partial counts and sense deletions; `--strict` restores both refusals.
- [ ] §3.1 lists the `bucket`, `severity` and `kind` values actually emitted and says rule counts are composed.
- [ ] §5.2 records the deferral of required checks; §11 step 3 points at it; §12 has a 2026-09-14 row for both.
- [ ] README describes the report as rows + rule counts + patch outcomes and names `--strict`.
- [ ] `bun qa` passes; a local code review of `git diff origin/v2...HEAD` has no unaddressed high/medium finding.
- [ ] PR open against `v2` with evidence from Tasks 4 and 5.

**Verify:** `grep -n "stalePins\|--strict\|Deferred" docs/specs/2026-09-13-pipeline-consolidation-design.md admin/pipeline/README.md` → hits in §3.1/§4.2/§5.2 and the README

**Steps:**

- [ ] **Step 1: §3.1.** After the JSON example block, insert:

```markdown
| Field | Values |
|---|---|
| `bucket` | `review` (a data judgment), `patch` (a patch to re-judge), `pipeline` (a code fault) |
| `severity` | `review`; `fault` for every `pipeline` row |
| `kind` | `headword-unparsed`, `page-confidence-low`, `page-confidence-medium`, `markup-carry`, `upstream-fixed`, `upstream-changed`, `composition-failed`, `patch-failed`, `finish-failed` |

Rule counts are *composed*: each rule sees the text the rules before
it left, so a count differs from `bun transform:count`'s rule-alone
figure. Every registered rule and `repairs.ts` pass has a row, zeros
included.
```

- [ ] **Step 2: §4.2.** Replace the section body with:

```markdown
Before this step, a snapshot-pin mismatch on any patch refused the
whole run. Every patch pins one hash over the whole export, so a new
export mismatches all of them at once, and the pin cannot say which
patches still hold. Under R3 (maintainer, 2026-09-14):

- A stale pin is one count in the report header
  (`snapshot.stalePins`). It skips nothing.
- Each patch is judged by its own precondition: its target must
  resolve `expected_occurrences` times. If it does not, the patch is
  skipped and reported `upstream-fixed` (the target is gone and the
  senses the patch would produce are present) or `upstream-changed`
  (anything else, including a partial count and a sense-deleting
  patch, which cannot be told apart from an edit).
- `--strict` restores both refusals: a stale pin or a drifted patch
  fails the run.

Silent skipping is never allowed: every skip is a row and a count in
the report header.
```

- [ ] **Step 3: §5.2, §11, §12.** Append to §5.2:

```markdown
**Deferred (maintainer, 2026-09-14):** revisited near the v2 release.
A failing check already has to be overridden to merge, so raising the
setting now adds nothing.
```

Change §11 item 3 to `3. Rebuild CI job and data validation in \`bun qa\` (§5); required checks deferred (§5.2).` Add a §12 row:

```markdown
| 2026-09-14 | Step 4: §4.2 a stale pin is a header count and each patch is judged by its precondition, `--strict` restores refusal; §3.1 row fields and kinds as built, rule counts are composed; §5.2 required checks deferred to near release |
```

- [ ] **Step 4: README.** Read `admin/pipeline/README.md` lines 100–135. Rewrite the paragraph that introduces `data/source/migration-report.json` so it says: the report holds the nine gate tallies, one row per review item, patch re-judgment or pipeline fault (`{ rid, bucket, kind, severity, detail }`), a composed count per rule, and an outcome per patch (`applied`, `superseded`, `upstream-fixed`, `upstream-changed`); a stale snapshot pin is a count, not a refusal; `bun pipeline:migrate --strict` refuses on a stale pin or a drifted patch. Also correct the sentence "a failing entry is emitted from source bytes with a review row, not dropped": that is R3's target, not today's behaviour — a composition failure is a `composition-failed` fault row, turns gate 9 red, and the entry is dropped. Keep the surrounding text.

- [ ] **Step 5: Quality gate and commit.**

```bash
bun qa
git add docs/specs/2026-09-13-pipeline-consolidation-design.md admin/pipeline/README.md
git commit -s -m "📖 doc(specs): step 4 rulings and report rows" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Local review.** Run the `code-review` skill (medium) over `git diff origin/v2...HEAD`. Fix confirmed high/medium findings in a follow-up commit (`bun qa` first); list anything not fixed in the PR body under "Known, not fixed here".

- [ ] **Step 7: Push and open the PR** (network needs the sandbox disabled).

```bash
git push -u origin feat/consolidation-step4
gh pr create --base v2 --title "🌈 improve(pipeline): report rows and patch drift" --body-file <body.md>
```

Body: sequence step 4 of 9 (§3.1, §4.2); a "What changes" table (drift classification, opt-in drift mode, report rows/rule counts/outcomes, `--strict`, spec rulings); "Evidence" with the Task 4 gate tallies, jq output, blessing-diff result, rebuild result, and the Task 5 probe id + jq + strict exit; "Known, not fixed here": R3's "emit a failing entry from source bytes" is still not built (composition failures drop the entry), and `research:apply` / `migrate-dry.ts` keep the strict behaviour until step 6 archives them. End with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
