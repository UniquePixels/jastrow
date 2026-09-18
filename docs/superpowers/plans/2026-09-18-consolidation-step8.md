# Consolidation Step 8: `repairs.ts` → Reviewed Patches Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retire every rid-keyed table in `admin/pipeline/body/repairs.ts` into the patch system as a *reviewed* (human-authored) patch group that applies after all transform rules, with the committed entry tree byte-identical before and after.

**Architecture:** A new directory `data/patches/reviewed/` holds human-authored patches. The loader stamps them `author: 'human'` from their location (a record can never claim it), which exempts them from the no-new-text rule. `composeEntry` applies them first inside `patch-apply`, before the agent (`accepted`) and `carryOver` groups, and they are kept out of Ruling C's latest-record-per-rid consolidation. Two ops are added: `join` (the reverse of `split`) and `unref` (remove one `refs[]` item). A one-shot seeder generates the patches by diffing today's pipeline against the repairs-less pipeline and proves each rid reproduces exactly.

**Tech Stack:** Bun, TypeScript, `bun:test`, Biome.

**Spec:** `docs/specs/2026-09-13-pipeline-consolidation-design.md` §4, §4.1, §4.2, §11 step 8.

## Global Constraints

- Control for the whole step: after the cut-over, `rm -rf data/entries && bun pipeline:migrate --write && bun qa:format` leaves `git status --short data/entries data/slug-index` **empty**. Any byte of drift is a failure, not an adjudication.
- All nine migrate gates stay green; `bun qa` exit 0 before every commit.
- Commit format: `<emoji> <type>(pipeline): <description>`, ≤ 50 chars, `git commit -s`, trailer `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Agent patches keep the no-new-text rule exactly as today. Only patches loaded from `data/patches/reviewed/` are exempt.
- A patch record in JSON never carries `author`; `parsePatch` rejects one that does.
- `cleanBinyanForms` is a general rule and stays in `repairs.ts`.
- Patch ids continue from the corpus maximum (`P000193` today); reviewed patches start at `P000194`.
- Hebrew keys: never normalise stored text.
- Unit tests must not read `data/source/` (spec R9). Tests that need real entries use committed fixtures under `admin/pipeline/body/fixtures/`.

**User decisions (already made):**
- "repairs.ts move to patches, we should not have two systems doing the same type of things." (2026-09-18)
- "an agent patch can not add/remove, a human patch can." Applied as: human patches skip no-new-text; the agent rule is unchanged, pending the open question below.
- Patches run last, after all transform rules, so a patch is deletable when Sefaria fixes the source (2026-09-18).

**Open (not blocking this plan):** today an agent patch may already *remove* bytes (7 `delete segment` patches, and `replace` may shorten). The quoted rule says agents cannot remove. This plan leaves agent behaviour unchanged; tightening it would invalidate existing agent patches and is its own decision.

---

## Measured facts this plan rests on

Running today's rid-keyed repairs AFTER the transforms instead of before (66 affected entries):

| Outcome | Entries |
|---|---|
| identical | 33 |
| whitespace-only difference (rejoins: a rule trimmed the phantom's leading space) | 28 |
| C00062: `הַגְּ׳` not wrapped in `<span dir="rtl">` | 1 |
| H00871: two `Ib.` citations not linked | 1 |
| repair throws (find-text changed by a rule): C01169, C01331, V00765 | 3 |

Because reviewed patches may add bytes, the seeder authors each patch against the post-transform text so the result equals today's output exactly. That is why the control can be byte-identity.

Eleven repair rids already have agent manifest records (A00675, A00913, A01069, A01194, A01350, A01662, A01989, A03277, C00062, C00244, K00081). C00062's agent patch P000091 was authored against the repaired text. Hence reviewed patches apply FIRST and stay outside Ruling C.

`REPAIRED_ORPHAN_ITEMS` and `DEFERRED` have had no reader since step 6 archived `migrate-dry.ts`. `CONFIRMED_NO_CHANGE` is read only by `repairs.test.ts`.

---

### Task 1: Reviewed patch group with human authorship

**Goal:** Load `data/patches/reviewed/`, stamp its patches `author: 'human'`, exempt them from no-new-text, and apply them first in `patch-apply`.

**Files:**
- Modify: `admin/pipeline/patch/schema.ts` (the `PatchBase` interface, `parsePatch`)
- Modify: `admin/pipeline/patch/apply.ts` (new `loadReviewedCorpus`, `applyEntryPatches`)
- Modify: `admin/pipeline/body/compose.ts` (`ComposePatches`, `applyPatchSets`)
- Modify: `admin/pipeline/migrate.ts` (`preparePatches`, `PatchGroups`, `composeOne`, `markMissingTargets`)
- Modify: `admin/pipeline/patch/apply-cli.ts` (pass the reviewed group)
- Test: `admin/pipeline/patch/schema.test.ts`, `admin/pipeline/patch/apply.test.ts`, `admin/pipeline/body/compose.test.ts`

**Acceptance Criteria:**
- [ ] `parsePatch` rejects a record containing an `author` key with reason `author is set by the loader from the patch directory, never by the record`.
- [ ] `loadReviewedCorpus(dir)` returns every patch in `<dir>/patches.jsonl` with `author: 'human'`, and the `needs_*` records of `<dir>/manifest.jsonl` as `deferred`; a missing directory returns empty arrays.
- [ ] `applyEntryPatches` accepts a byte-adding `replace` when `author === 'human'` and still rejects the same patch without it.
- [ ] `composeEntry` with `{ reviewed, accepted }` applies reviewed first: a test where an accepted patch's `expected_before` only exists after the reviewed patch passes.
- [ ] `bun pipeline:migrate` with no reviewed directory reports the same gate counts as before (no behaviour change yet).

**Verify:** `bun test admin/pipeline/patch admin/pipeline/body/compose.test.ts` → all pass; `bun qa` → exit 0.

**Steps:**

- [ ] **Step 1: Write the failing tests**

In `schema.test.ts`, reuse the file's existing valid-record builder (read the file for its name) and add:

```ts
it('rejects a record that claims its own author', () => {
	expect(() => parsePatch({ ...validRecord(), author: 'human' })).toThrow(
		'author is set by the loader from the patch directory, never by the record',
	);
});
```

In `apply.test.ts`:

```ts
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
		const result = applyEntryPatches(entry, [{ ...addsBytes, author: 'human' }]);
		expect(result.problems).toEqual([]);
		expect(result.entry.content.senses[0]?.definition).toBe('a (x) b');
	});
});

describe('loadReviewedCorpus', () => {
	it('stamps every patch human and returns deferred records', async () => {
		const corpus = await loadReviewedCorpus(`${import.meta.dir}/fixtures/reviewed`);
		expect(corpus.patches.every((p) => p.author === 'human')).toBe(true);
		expect(corpus.deferred.map((r) => r.rid)).toEqual(['D00470']);
	});
	it('is empty when the directory does not exist', async () => {
		expect(await loadReviewedCorpus('/nonexistent')).toEqual({ deferred: [], patches: [] });
	});
});
```

`patchFor` is a helper this test file adds if it doesn't have one: it builds a valid `SemanticPatch` whose `target` is `senseTarget(sense)` and whose `expected_before` is the sense's definition, with `snapshot: 'sha256:' + '0'.repeat(64)`, `prompt_version: 'test'`, `confidence: 'high'`, `rationale: 't'`, `defect_class: 't'`, `id: 'P999999'`.

Create the fixture `admin/pipeline/patch/fixtures/reviewed/patches.jsonl` (one valid replace patch for A00001) and `manifest.jsonl` with two lines: a `repaired` record for A00001 listing that patch id, and `{"disposition":"needs_human_judgment","escalation":"implied 1) inside a Pl. section — structure unresolved","patches":[],"rid":"D00470"}`.

In `compose.test.ts`, add a test building a two-step chain: a reviewed `replace` turning `a b` into `a c`, and an accepted `replace` whose `expected_before` is `a c`. Assert both apply (`patchesApplied === 2`).

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `bun test admin/pipeline/patch admin/pipeline/body/compose.test.ts`
Expected: FAIL (`loadReviewedCorpus` not exported, `author` accepted).

- [ ] **Step 3: Implement**

`schema.ts`: add to `PatchBase`:

```ts
	/** Set only by the loader, from the directory a patch was read from:
	 * `data/patches/reviewed/` holds patches a person wrote from a print
	 * check, and they may add bytes (maintainer ruling 2026-09-18). A
	 * record never carries it. */
	author?: 'human';
```

In `parsePatch`, before the `reasons.length > 0` check:

```ts
	if ('author' in raw) {
		reasons.push(
			'author is set by the loader from the patch directory, never by the record',
		);
	}
```

`apply.ts`: add

```ts
/** Human-authored patches (consolidation spec §4.2, step 8). Kept out
 * of `TRANCHES` on purpose: Ruling C keeps one record per rid, and 11
 * reviewed rids also have agent records. */
const REVIEWED_DIR = 'data/patches/reviewed';

interface ReviewedCorpus {
	/** `needs_*` records: items a person has flagged and not repaired. */
	deferred: EntryResult[];
	patches: SemanticPatch[];
}

async function loadReviewedCorpus(dir = REVIEWED_DIR): Promise<ReviewedCorpus> {
	const patches = (await loadCorpus(`${dir}/patches.jsonl`)).map(
		(patch) => ({ ...patch, author: 'human' as const }),
	);
	const records = await loadManifest(`${dir}/manifest.jsonl`);
	return {
		deferred: records.filter((r) => r.disposition.startsWith('needs_')),
		patches,
	};
}
```

In `applyEntryPatches`, wrap the no-new-text call:

```ts
			if (patch.author !== 'human') {
				const verdict = validateNoNewText(patch, current, next);
				if (!verdict.ok) {
					problems.push({
						patchId: patch.id,
						reason: `${verdict.reason} — entry re-dispositions ${verdict.redisposition}`,
						rid: patch.rid,
					});
					continue;
				}
			}
```

Export `loadReviewedCorpus`, `REVIEWED_DIR` and `type ReviewedCorpus`.

`compose.ts`: add `reviewed?: readonly SemanticPatch[] | undefined;` to `ComposePatches` (doc: "human-authored, applied first"). In `applyPatchSets`, run `applyEntryPatches(entry, reviewed, patches?.drift)` first when present, feed its `entry` into the accepted step, and fold its `problems`, `drifted` and applied count (`reviewed.length - problems - drifted`) into the returned totals.

`migrate.ts` `preparePatches`: load `loadReviewedCorpus()`, include its patches in the `applySet` passed to `corpusPreflight` (id uniqueness and pins) but NOT in `reconcileOnly` or `records`. Add `reviewed: patchesByRid(reviewed.patches)` to `PatchGroups`; in `composeOne` pass `reviewed: groups.reviewed.get(source.rid)` and include it in the `recordPatchOutcomes` list; delete it from `groups.reviewed` alongside the other two (line ~263) so `markMissingTargets` reports reviewed patches whose rid never appeared. Push one report row per deferred record: `lineRow(`${r.rid}: ${r.escalation}`, 'review-deferred')`. Set `report.patches.reviewed = reviewed.patches.length` (add the field to `Report` in `migrate/report.ts`, default 0, and render it in the blessing's patch section beside `accepted`).

`apply-cli.ts`: load the reviewed corpus and pass `reviewed` into `composeEntry` the same way.

- [ ] **Step 4: Run the tests**

Run: `bun test admin/pipeline/patch admin/pipeline/body/compose.test.ts && bun qa`
Expected: PASS, exit 0.

- [ ] **Step 5: Confirm no behaviour change**

Run: `bun pipeline:migrate 2>&1 | grep -E "^gate|failures=[1-9]"`
Expected: nine gates, all `failures=0`; `git diff --stat docs/v2/migration-blessing.md` shows only the new `reviewed` count line (value 0).

- [ ] **Step 6: Commit**

```bash
git add admin/pipeline docs/v2/migration-blessing.md
git commit -s -m "🦄 new(pipeline): reviewed patches by a person" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: `join` op

**Goal:** Add `join`, the reverse of `split`: fold a numbered sense back into the text flow it was cut from.

**Files:**
- Modify: `admin/pipeline/patch/schema.ts` (`PatchOp`, payload type, `payloadReasons`, `parsePatch` op list, `applyPatch`)
- Test: `admin/pipeline/patch/schema.test.ts`, `admin/pipeline/patch/no-new-text.test.ts`

**Acceptance Criteria:**
- [ ] Joining sense `2)` at index 1 appends `"2)" + its definition` to sense 0's definition and removes it.
- [ ] Joining the sense at index 0 prepends its number to its own definition and deletes the `number` key (the key is absent, not `undefined`).
- [ ] Joining into a preceding sense that has `grammar` throws `PatchApplyError` "no text flow to join into".
- [ ] `payloadReasons('join', {x: 1})` returns `['join payload must be an empty object']`.
- [ ] An agent `join` passes no-new-text (it conserves bytes).

**Verify:** `bun test admin/pipeline/patch` → all pass.

**Steps:**

- [ ] **Step 1: Write the failing tests**

```ts
describe('join', () => {
	it('folds a phantom sense into the preceding flow', () => {
		const entry = entryOf([
			{ definition: 'see (v. X', number: '1)' },
			{ definition: ' Y) night', number: '2)' },
		]);
		const out = applyPatch(entry, patchFor(entry, 'join', {}, 1));
		expect(out.content.senses).toEqual([
			{ definition: 'see (v. X2) Y) night', number: '1)' },
		]);
	});
	it('unnumbers a phantom that opens the list', () => {
		const entry = entryOf([{ definition: ' Y) night', number: '2)' }]);
		const out = applyPatch(entry, patchFor(entry, 'join', {}, 0));
		expect(out.content.senses).toEqual([{ definition: '2) Y) night' }]);
		expect('number' in (out.content.senses[0] ?? {})).toBe(false);
	});
	it('refuses to join into a stem header', () => {
		const entry = entryOf([
			{ definition: '', grammar: { verbal_stem: 'Pi.' } },
			{ definition: ' x', number: '2)' },
		]);
		expect(() => applyPatch(entry, patchFor(entry, 'join', {}, 1))).toThrow(
			'no text flow to join into',
		);
	});
});
```

`entryOf(senses)` builds `{ content: { senses }, headword: 'x', rid: 'A00001' }`; `patchFor(entry, op, payload, senseIndex)` targets the top-level sense at that index. Add both helpers to the test file if absent. In `no-new-text.test.ts`, add a case asserting `validateNoNewText` returns `{ ok: true }` for the first join above.

- [ ] **Step 2: Run to confirm failure**

Run: `bun test admin/pipeline/patch/schema.test.ts`
Expected: FAIL, `op must be one of …`.

- [ ] **Step 3: Implement**

```ts
type PatchOp = 'delete' | 'join' | 'move' | 'replace' | 'retag' | 'split' | 'unref';

/** Fold the target sense back into the text flow it was cut from — the
 * reverse of `split`, for a sense Sefaria minted at a cross-reference's
 * own `N)`. Its number token and definition are appended to the
 * preceding sibling's definition and the sense is removed; a target
 * with no preceding sibling keeps its place, loses its `number`, and
 * takes the token as the head of its definition. Byte-conserving. */
type JoinPayload = Record<string, never>;

interface JoinPatch extends PatchBase {
	op: 'join';
	payload: JoinPayload;
}
```

Add `JoinPatch` to `SemanticPatch`. In `payloadReasons`:

```ts
		case 'join':
			return Object.keys(p).length === 0
				? []
				: ['join payload must be an empty object'];
```

Add `'join'` to the `ops` array in `parsePatch`. In `applyPatch`:

```ts
		case 'join': {
			const token = position.sense.number ?? '';
			const previous = position.siblings[position.index - 1];
			if (position.index === 0) {
				position.sense.definition = token + definition;
				// The key must vanish so an unnumbered sense serialises as one
				// (exactOptionalPropertyTypes forbids assigning undefined).
				// biome-ignore lint/performance/noDelete: key must vanish
				delete position.sense.number;
			} else if (previous === undefined || previous.grammar !== undefined) {
				throw new PatchApplyError(patch.id, 'no text flow to join into');
			} else {
				previous.definition = (previous.definition ?? '') + token + definition;
				position.siblings.splice(position.index, 1);
			}
			break;
		}
```

`unref` is added to `PatchOp` here only so the union is written once; Task 3 implements it. Until then `payloadReasons` returns `['unref is not implemented']` for it and `parsePatch`'s `ops` list does not include it.

- [ ] **Step 4: Run tests**

Run: `bun test admin/pipeline/patch && bun qa`
Expected: PASS, exit 0.

- [ ] **Step 5: Commit**

```bash
git add admin/pipeline/patch
git commit -s -m "🦄 new(pipeline): join op, the reverse of split" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: `unref` op with a `refs[…]` target

**Goal:** Remove one item from an entry's `refs[]` through a patch.

**Files:**
- Modify: `admin/pipeline/patch/schema.ts` (`REFS_TARGET`, new `countTarget`, `parsePatch`, `applyPatch`)
- Modify: `admin/pipeline/patch/apply.ts` (`postApplyAssertions`, `applyCarryOver` use `countTarget`)
- Modify: `admin/pipeline/patch/drift.ts` (`classifyDrift` uses `countTarget`; `postState` returns `undefined` for `unref`)
- Test: `admin/pipeline/patch/schema.test.ts`, `admin/pipeline/patch/drift.test.ts`

**Acceptance Criteria:**
- [ ] A patch with `op: 'unref'`, `target: 'refs[Yoma 2a]:<anchor>'`, `expected_before: 'Yoma 2a'` removes that item and leaves the others in order.
- [ ] `unref` with a `sense[…]` target, or any other op with a `refs[…]` target, is rejected by `parsePatch`.
- [ ] Applying when the item is absent throws `PatchApplyError`; under `drift: 'outcome'` it reports `upstream-changed`.
- [ ] `postApplyAssertions` passes after a successful unref.

**Verify:** `bun test admin/pipeline/patch` → all pass.

**Steps:**

- [ ] **Step 1: Write the failing tests**

```ts
describe('unref', () => {
	const entry: SourceEntry = {
		content: { senses: [{ definition: 'x', number: '1)' }] },
		headword: 'x',
		refs: ['Yoma 2a', 'Yoma 2a:3', 'Pes. 4b'],
		rid: 'D00541',
	};
	const unref = (item: string) =>
		parsePatch({ ...baseFields('D00541'), expected_before: item, op: 'unref',
			payload: {}, target: `refs[${item}]:${contentAnchor(item)}` });
	it('removes exactly the named item', () => {
		expect(applyPatch(entry, unref('Yoma 2a')).refs).toEqual(['Yoma 2a:3', 'Pes. 4b']);
	});
	it('throws when the item is gone', () => {
		expect(() => applyPatch(entry, unref('Git. 9a'))).toThrow(PatchApplyError);
	});
	it('only pairs unref with a refs target', () => {
		expect(() => parsePatch({ ...baseFields('D00541'), expected_before: 'x', op: 'unref',
			payload: {}, target: `sense[1)]:${contentAnchor('x')}` })).toThrow('unref needs a refs[…] target');
	});
});
```

`baseFields(rid)` returns the shared valid fields (`id`, `rid`, `snapshot`, `confidence`, `rationale`, `defect_class`, `prompt_version`). Export `contentAnchor` from `schema.ts` if it is not already. In `drift.test.ts`, assert `classifyDrift(entryWithoutItem, unref('Yoma 2a'))` is `'upstream-changed'`.

- [ ] **Step 2: Run to confirm failure**

Run: `bun test admin/pipeline/patch/schema.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
/** `refs[<item>]:<anchor>` — the one non-sense target, used by `unref`. */
const REFS_TARGET = /^refs\[(?<item>.+)\]:(?<anchor>[0-9a-f]{8})$/u;

/** How many places a patch's target resolves to in `entry`: senses for
 * every op but `unref`, which counts its item in `refs[]`. The one
 * count every caller shares, so apply, drift and carry-over agree. */
function countTarget(entry: SourceEntry, patch: SemanticPatch): number {
	if (patch.op === 'unref') {
		return (entry.refs ?? []).filter((r) => r === patch.expected_before).length;
	}
	return resolveTarget(entry, parseTarget(patch.target)).length;
}
```

In `parsePatch`, parse the target by op: `unref` requires `REFS_TARGET` (reason `unref needs a refs[…] target`) and every other op requires `TARGET` (reason `refs[…] targets are only for unref`); the anchor self-consistency check applies to both. Add `'unref'` to `ops`; `payloadReasons('unref', p)` requires an empty object like `join`.

In `applyPatch`, handle `unref` before `parseTarget`/`resolveTarget`:

```ts
	if (patch.op === 'unref') {
		const copy = structuredClone(entry);
		const refs = copy.refs ?? [];
		const hits = refs.flatMap((r, i) => (r === patch.expected_before ? [i] : []));
		if (hits.length !== patch.expected_occurrences) {
			throw new PatchApplyError(patch.id,
				`refs item resolved ${hits.length} time(s); expected ${patch.expected_occurrences}`);
		}
		const at = hits[patch.occurrence_index - 1] ?? -1;
		copy.refs = refs.filter((_, i) => i !== at);
		return copy;
	}
```

Replace `resolveTarget(…, parseTarget(patch.target)).length` with `countTarget(…, patch)` in `postApplyAssertions`, `applyCarryOver` and `classifyDrift`. In `postState`, `if (patch.op === 'unref') return;` first.

- [ ] **Step 4: Run tests**

Run: `bun test admin/pipeline/patch && bun qa`
Expected: PASS, exit 0.

- [ ] **Step 5: Commit**

```bash
git add admin/pipeline/patch
git commit -s -m "🦄 new(pipeline): unref op for refs items" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Seed `data/patches/reviewed/` from `repairs.ts`

**Goal:** Generate one reviewed patch set that turns each repair rid's repairs-less post-transform state into exactly today's post-transform state, proven per rid.

**Files:**
- Modify: `admin/pipeline/body/repairs.ts` (export `cleanBinyanForms`, add `REPAIR_RIDS`)
- Create: `admin/pipeline/patch/seed-reviewed.ts`
- Create: `data/patches/reviewed/patches.jsonl`, `data/patches/reviewed/manifest.jsonl`, `data/patches/reviewed/README.md`
- Test: `admin/pipeline/patch/seed-reviewed.test.ts`

**Acceptance Criteria:**
- [ ] For every rid the seeder handles, applying its generated patches to `transforms(binyanOnly(source))` deep-equals `transforms(applyRepairs(source).entry)`; the seeder throws on the first rid where it does not.
- [ ] Every generated patch parses with `parsePatch`, has a unique id ≥ `P000194`, pins the current `data/patches/snapshot.lock` hash, and names its review doc in `rationale`.
- [ ] The manifest has one `repaired` record per patched rid and three `needs_human_judgment` records (D00470, K00081, R00519) carrying `DEFERRED`'s text as `escalation`.
- [ ] The seeder refuses to run if `data/patches/reviewed/patches.jsonl` exists.
- [ ] A unit test on committed fixtures proves the diff-to-patches function on a rejoin, a retag and a byte-adding replace.

**Verify:** `bun test admin/pipeline/patch/seed-reviewed.test.ts` → pass; `bun admin/pipeline/patch/seed-reviewed.ts` → prints `wrote N patches for M rids; deferred=3` and exits 0 (a non-reproducing rid throws).

**Steps:**

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'bun:test';
import { patchesFor } from './seed-reviewed.ts';
import { applyPatch } from './schema.ts';

describe('patchesFor', () => {
	const base = { content: { senses: [
		{ definition: 'see (v. X', number: '1)' },
		{ definition: 'Y) night', number: '2)' },
	] }, headword: 'x', rid: 'A00913' };
	const want = { content: { senses: [
		{ definition: 'see (v. X2) Y) night', number: '1)' },
	] }, headword: 'x', rid: 'A00913' };
	it('reproduces want exactly from base', () => {
		const patches = patchesFor(base, want, { chopToken: '2)', firstId: 194, pin: PIN, rationale: 'doc 01' });
		const out = patches.reduce((e, p) => applyPatch(e, p), base);
		expect(out).toEqual(want);
		expect(patches.map((p) => p.op)).toEqual(['join', 'replace']);
	});
});
```

(`join` gives `see (v. X2)Y) night`; the replace adds the space the old order kept.) Add two more cases: a retag (`-2)` → `—2)`) producing `['retag']`, and a C00062-style replace that adds `<span dir="rtl">…</span>` producing `['replace']`. `PIN` is `'sha256:' + 'a'.repeat(64)`.

- [ ] **Step 2: Run to confirm failure**

Run: `bun test admin/pipeline/patch/seed-reviewed.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `patchesFor` and the CLI**

`repairs.ts`: export `cleanBinyanForms`, and export `REPAIR_RIDS` as the sorted union of the keys of `CHOPPED`, `IMPLIED_ONE`, `DASH_LABELS`, `REFS_REMOVALS`, the rids of `IMPLIED_ONE_TEXT`, `REINSERTS`, `CITE_WRAPS`, and `'D00341'`. Also export `CHOPPED`, `DEFERRED` (already) for the seeder.

`seed-reviewed.ts` (one-shot, not a `package.json` script; header comment in the style of `migrate/seed-slug-index.ts`):

```ts
interface SeedOptions { chopToken?: string; firstId: number; pin: string; rationale: string }

/** The patches that turn `base` into `want`, in apply order: unref for
 * each refs item `want` lacks, a join for the chopped sense, a retag
 * for each sense whose number differs, then one replace per sense whose
 * definition still differs. Each patch is built against the state the
 * previous one left, so every target and expected_before is exact. */
function patchesFor(base: SourceEntry, want: SourceEntry, o: SeedOptions): SemanticPatch[] {
	const out: SemanticPatch[] = [];
	let state = structuredClone(base);
	const emit = (op: PatchOp, target: string, before: string, payload: object) => {
		const patch = parsePatch({
			confidence: 'high', defect_class: `reviewed-${op}`, expected_before: before,
			expected_occurrences: 1, id: `P${String(o.firstId + out.length).padStart(6, '0')}`,
			occurrence_index: 1, op, payload, prompt_version: 'human-review-2026-08-05',
			rationale: o.rationale, rid: base.rid, snapshot: o.pin, target,
		});
		state = applyPatch(state, patch);
		out.push(patch);
	};
	for (const item of base.refs ?? []) {
		if (!(want.refs ?? []).includes(item)) {
			emit('unref', `refs[${item}]:${contentAnchor(item)}`, item, {});
		}
	}
	if (o.chopToken !== undefined) {
		const phantom = state.content.senses.find((s) => s.number === o.chopToken);
		if (phantom === undefined) throw new Error(`${base.rid}: no phantom ${o.chopToken}`);
		emit('join', senseTarget(phantom), phantom.definition ?? '', {});
	}
	const pairs = () => zipSenses(state, want); // throws if tree shapes differ
	for (const [got, target] of pairs()) {
		if ((got.number ?? '') !== (target.number ?? '')) {
			emit('retag', senseTarget(got), got.definition ?? '', { number: target.number });
		}
	}
	for (const [got, target] of pairs()) {
		const before = got.definition ?? '';
		const after = target.definition ?? '';
		if (before !== after) {
			const { find, replace } = minimalUniqueSpan(before, after);
			emit('replace', senseTarget(got), before, { find, replace });
		}
	}
	if (JSON.stringify(state) !== JSON.stringify(want)) {
		throw new Error(`${base.rid}: seeded patches do not reproduce the repaired entry`);
	}
	return out;
}
```

Helpers in the same file:
- `zipSenses(a, b)`: walks both sense trees in document order (reuse `walkSenses` from `schema.ts`), returns `[SourceSense, SourceSense][]`, and throws `"<rid>: sense trees differ in shape"` if the counts or parent/child layout differ. It re-walks on each call, so the second call sees retagged numbers.
- `minimalUniqueSpan(before, after)`: strip the common prefix and suffix; take the differing middle of `before` as `find` and of `after` as `replace`; while `find` is empty or occurs more than once in `before`, widen both by one character on each side (both strings share the same context characters). Returns `{ find, replace }`.

CLI `main()`:
1. Refuse if `data/patches/reviewed/patches.jsonl` exists.
2. `pin` = the first line of `data/patches/snapshot.lock`; `firstId` = 1 + the largest id in `loadCorpus()` (raw, every stage) → 194.
3. For each source entry (`readSourceEntries()`) whose rid is in `REPAIR_RIDS`:
   - `base = applyTransforms(applyTransforms(binyanOnly(source), 'text-repairs').entry, 'structural-repairs').entry`, where `binyanOnly` deep-copies and runs `cleanBinyanForms`;
   - `want` = the same two transform calls on `applyRepairs(source).entry`;
   - `rationale` = `review doc <01|02|04> (repairs.ts <TABLE>): <the table comment's one-line reason>`, from a small rid→text map the seeder builds from the tables;
   - `patchesFor(base, want, { chopToken: CHOPPED[rid], firstId: next, pin, rationale })`.
4. Write `patches.jsonl` (one JSON line per patch, keys in the order `parsePatch` returns them), then `manifest.jsonl`: a `repaired` record per rid with its patch ids, and the three `DEFERRED` rows as `needs_human_judgment` with the table text as `escalation`. Rid order.
5. Print `wrote N patches for M rids; deferred=3`.

- [ ] **Step 4: Run the unit test, then the seeder**

Run: `bun test admin/pipeline/patch/seed-reviewed.test.ts && bun admin/pipeline/patch/seed-reviewed.ts`
Expected: PASS; seeder prints the summary with M = number of `REPAIR_RIDS` whose repair changes the entry (66 by the ordering measurement).

- [ ] **Step 5: Write `data/patches/reviewed/README.md`**

It states: what the directory is (patches a person wrote from a print check; spec §4.2); that the loader marks them `author: human` and they may add bytes; that they apply first in `patch-apply`, before agent patches, and are outside Ruling C; that they were seeded on 2026-09-18 from `repairs.ts` review docs 01–06 and every rid was proven to reproduce the old output; and it lists the 19 `CONFIRMED_NO_CHANGE` rids as "swallowed boundary, text already matches print; upstream issue only, no patch" (the table itself is deleted in Task 5).

- [ ] **Step 6: Commit the seeder only**

The generated `data/patches/reviewed/` files are NOT committed here. With `repairs.ts` still running, the reviewed patches would find their targets already repaired and fail gate 9, so the data lands in Task 5's commit together with the table deletion. Leave the three generated files untracked in the working tree.

```bash
git add admin/pipeline/body/repairs.ts admin/pipeline/patch/seed-reviewed.ts admin/pipeline/patch/seed-reviewed.test.ts
git commit -s -m "🦄 new(pipeline): seeder for reviewed patches" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Cut over — delete the rid tables

**Goal:** `repairs.ts` keeps only the general binyan cleanup; the entry tree rebuilds byte-identical.

**Files:**
- Modify: `admin/pipeline/body/repairs.ts` (delete `CHOPPED`, `IMPLIED_ONE`, `IMPLIED_ONE_TEXT`, `REINSERTS`, `DASH_LABELS`, the D00341 branch, `CITE_WRAPS`, `REFS_REMOVALS`, `DEFERRED`, `CONFIRMED_NO_CHANGE`, `REPAIR_RIDS`, and their engine functions; `PassName` becomes `'binyan-cleanup'`)
- Modify: `admin/pipeline/body/repairs.test.ts` (keep only the binyan-cleanup test and the untouched-entry test)
- Modify: `admin/pipeline/migrate.ts` (`REPAIR_PASSES = ['binyan-cleanup']`)
- Delete: `admin/pipeline/patch/seed-reviewed.ts` and its test (they import the deleted tables; the seeder ran once in Task 4, and git history keeps it; say so in the reviewed README)
- Add: `data/patches/reviewed/{patches.jsonl,manifest.jsonl,README.md}` (generated in Task 4, committed here so no commit has both the tables and the patches)
- Modify: `docs/v2/migration-blessing.md` (regenerated)

**Acceptance Criteria:**
- [ ] `grep -nE "CHOPPED|REINSERTS|CITE_WRAPS|REFS_REMOVALS|DASH_LABELS|IMPLIED_ONE|DEFERRED|CONFIRMED_NO_CHANGE" admin/pipeline --include='*.ts' -r` finds no definitions (comments naming the history are fine).
- [ ] After `rm -rf data/entries && bun pipeline:migrate --write && bun qa:format`, `git status --short data/entries data/slug-index` prints nothing.
- [ ] The run reports `patch-failed=0`, zero reviewed-patch drift rows, three `review-deferred` rows, and `patches.applied` up by the number of reviewed patches.
- [ ] The blessing diff contains only: the six `repairs:*` rows other than `binyan-cleanup` removed, patch counts, and the `review-deferred` rows. Any rule-count row change is listed in the commit body with the rids that moved it.
- [ ] `bun run transform:invariants` passes, or each failure is written up for the maintainer before merging.

**Verify:** `rm -rf data/entries && bun pipeline:migrate --write && bun qa:format && git status --short data/entries data/slug-index` → empty output.

**Steps:**

- [ ] **Step 1: Delete the tables and their engine code** as listed under Files. `applyRepairs` becomes:

```ts
/** Apply the general repairs to (a deep copy of) `source`. Pure. The
 * rid-keyed repairs that lived here moved to `data/patches/reviewed/`
 * in consolidation step 8 (spec §4.1). */
function applyRepairs(source: SourceEntry): { entry: SourceEntry; records: RepairRecord[] } {
	const entry = structuredClone(source);
	const records: RepairRecord[] = [];
	cleanBinyanForms(entry, records);
	return { entry, records };
}
```

Rewrite the file header to say the same, and drop the `deviation` register text (the reviewed patches' `rationale` carries it; note that in the reviewed README). Keep `RepairRecord.deviation` only if something still reads it; `grep -rn "deviation" admin/pipeline` decides.

- [ ] **Step 2: Update `repairs.test.ts`** to the binyan-cleanup test (line ~185) and the untouched-entry test (A00013 or any fixture entry with no binyan form). Remove the fixture files under `admin/pipeline/body/fixtures/` only if `grep -rn "<fixture name>" admin` finds no other reader.

- [ ] **Step 3: Rebuild and diff**

```bash
bun qa
rm -rf data/entries && bun pipeline:migrate --write && bun qa:format
git status --short data/entries data/slug-index
git diff --stat docs/v2/migration-blessing.md
```

Expected: `bun qa` exit 0; the `git status` line prints nothing. If any entry differs, stop: restore with `git checkout -- data/entries`, find which reviewed patch for that rid is wrong, and fix the seeded record by hand (the seeder is gone). Do not proceed on a non-empty diff.

- [ ] **Step 4: Run the invariants tier**

Run: `bun run transform:invariants`
Expected: PASS (~4 min). The corpus tests read `repairedEntries()`, which now holds fewer repairs. A failure means a rule interaction measured on repaired text changed; record it rather than editing a baseline.

- [ ] **Step 5: Commit**

```bash
git add -A admin/pipeline data/patches/reviewed docs/v2/migration-blessing.md
git commit -s -m "🧺 chore(pipeline): retire repairs.ts rid tables" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Make the orphan-refs obligation a real gate

**Goal:** `REPAIRED_ORPHAN_ITEMS` stopped being checked when `migrate-dry.ts` was archived; give `migrate` a check that fails when one of those 24 entries loses its citation basis.

**Files:**
- Create: `admin/pipeline/migrate/orphan-refs.ts`
- Modify: `admin/pipeline/migrate.ts` (call it after composition; its failures are fault rows and fail the run)
- Modify: `admin/pipeline/body/repairs.ts` (delete `REPAIRED_ORPHAN_ITEMS`; the table moves into `orphan-refs.ts`)
- Test: `admin/pipeline/migrate/orphan-refs.test.ts`

**Acceptance Criteria:**
- [ ] `unbasedOrphans(entries)` returns `rid: item` for each of the 24 table items whose composed entry has no `data-ref="<item>"` anywhere in its sense tree.
- [ ] A unit test plants a miss (an entry for `P00331` with no `Eruvin 88b:1` anchor) and gets exactly that line back; the same entry with the anchor returns `[]`.
- [ ] On the committed corpus `bun pipeline:migrate` reports `orphan-ref-unbased=0`, and a local edit that removes one reviewed CITE-wrap patch makes it report 1 and exit non-zero (then revert the edit).

**Verify:** `bun test admin/pipeline/migrate/orphan-refs.test.ts` → pass; `bun pipeline:migrate 2>&1 | grep orphan-ref-unbased` → `orphan-ref-unbased=0`.

**Steps:**

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'bun:test';
import { unbasedOrphans } from './orphan-refs.ts';

const withAnchor = (rid: string, ref: string) => ({
	content: { senses: [{ definition: `<a class="refLink" data-ref="${ref}">Ib.</a>` }] },
	headword: 'x', rid,
});

describe('unbasedOrphans', () => {
	it('names an obligated entry that lost its anchor', () => {
		expect(unbasedOrphans([withAnchor('P00331', 'Yoma 2a')])).toEqual(['P00331: Eruvin 88b:1']);
	});
	it('passes when the anchor is present', () => {
		expect(unbasedOrphans([withAnchor('P00331', 'Eruvin 88b:1')])).toEqual([]);
	});
	it('ignores entries outside the table', () => {
		expect(unbasedOrphans([withAnchor('A00001', 'x')])).toEqual([]);
	});
});
```

- [ ] **Step 2: Run to confirm failure**, then implement `orphan-refs.ts`: move the `REPAIRED_ORPHAN_ITEMS` table and its full doc comment across byte-for-byte (`git show HEAD:admin/pipeline/body/repairs.ts | sed -n '/^const REPAIRED_ORPHAN_ITEMS/,/^};/p'`, never retyped: the table holds gershayim). Then:

```ts
/** `rid: item` for every obligated refs item its composed entry no
 * longer carries an inline citation for. */
function unbasedOrphans(entries: readonly SourceEntry[]): string[] {
	const lines: string[] = [];
	for (const entry of entries) {
		const items = REPAIRED_ORPHAN_ITEMS[entry.rid];
		if (items === undefined) continue;
		const text = [...walkSensesDeep(entry.content.senses)].map((s) => s.definition ?? '').join('\n');
		for (const item of items) {
			if (!text.includes(`data-ref="${item}"`)) lines.push(`${entry.rid}: ${item}`);
		}
	}
	return lines;
}
```

- [ ] **Step 3: Wire it into `migrate.ts`** after `composeAll`: `unbasedOrphans(composed.map((c) => c.entry))` → `lineRow(l, 'orphan-ref-unbased', 'pipeline', 'fault')`, and push each line into `report.gates.composition.failures` so `isGreen` fails the run. Add `orphan-ref-unbased` to the printed kind counts (printed even at zero, like the slug kinds).

- [ ] **Step 4: Positive control.** Temporarily delete P00331's cite-wrap line from `data/patches/reviewed/patches.jsonl` and its id from the manifest, run `bun pipeline:migrate`, confirm `orphan-ref-unbased=1` and a non-zero exit, then `git checkout -- data/patches/reviewed`.

- [ ] **Step 5: Commit**

```bash
git add admin/pipeline docs/v2/migration-blessing.md
git commit -s -m "🦠 fix(pipeline): gate the orphan-refs obligation" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Documents

**Goal:** The spec, READMEs and pipeline comments describe the one patch system.

**Files:**
- Modify: `docs/specs/2026-09-13-pipeline-consolidation-design.md` (§4 bucket table, §4.1, §4.2, §11 step 8 outcome, §12 changelog)
- Modify: `data/patches/RUNBOOK.md` (a short "Reviewed patches" section pointing at `data/patches/reviewed/README.md`)
- Modify: `admin/pipeline/body/compose.ts`, `admin/pipeline/transform/rules/corpus-fixture.ts`, `admin/pipeline/patch/apply.ts` (comments that describe `applyRepairs` as literal repairs before the rules)

**Acceptance Criteria:**
- [ ] §4.1's `repairs.ts` row lists all ten rid-keyed tables and special cases with where each went (patches, review rows, a gate, the reviewed README).
- [ ] §4.2 states the authorship rule and quotes the 2026-09-18 ruling; it says agent patches are unchanged and names the open question about agent removals.
- [ ] Step 8 in §11 is marked shipped with measured numbers: patches seeded, rids, the 33/28/2/3 ordering measurement, entry tree byte-identical, invariants result.
- [ ] `grep -rn "literal repairs first" admin/pipeline` finds nothing.
- [ ] Rule comments quoting counts "measured after `applyRepairs`" are left as dated measurements; the spec changelog says so once rather than editing each.

**Verify:** `bun qa` → exit 0; `grep -rn "literal repairs first" admin/pipeline` → no output.

**Steps:**

- [ ] **Step 1:** Rewrite §4.1's `repairs.ts hand tables` row as a sub-table:

| Table | Went to |
|---|---|
| `CHOPPED` (36) | reviewed `join` (+ `replace` where a rule used to fix spacing or links) |
| `IMPLIED_ONE` (3), `DASH_LABELS` (5), D00341 | reviewed `retag` (+ `replace` for D00341's `[`) |
| `IMPLIED_ONE_TEXT` (1), `REINSERTS` (14), `CITE_WRAPS` (3) | reviewed `replace`, byte-adding |
| `REFS_REMOVALS` (3) | reviewed `unref` |
| `DEFERRED` (3) | `needs_human_judgment` records in the reviewed manifest → `review-deferred` rows |
| `CONFIRMED_NO_CHANGE` (19) | listed in `data/patches/reviewed/README.md`; no patch |
| `REPAIRED_ORPHAN_ITEMS` (24) | `migrate/orphan-refs.ts`, a real gate again |

Fill the counts in the "Went to" column from the seeder's actual output, not from this plan.

- [ ] **Step 2:** Add to §4.2: "**Who may add bytes** (maintainer, 2026-09-18). A patch a person wrote from a print check lives in `data/patches/reviewed/`; the loader marks it human and the no-new-text rule does not apply. Agent patches are unchanged. Reviewed patches apply first in `patch-apply` and are outside Ruling C." Add the changelog row and the step-8 outcome paragraph.

- [ ] **Step 3:** Update the three code comments; run `bun qa`.

- [ ] **Step 4: Commit**

```bash
git add docs data/patches/RUNBOOK.md admin/pipeline
git commit -s -m "📖 doc(pipeline): one patch system (step 8)" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Self-review notes

- Spec coverage: §4.1's `repairs.ts` row → Tasks 4–5; the two non-repair tables → Tasks 4 (DEFERRED) and 6 (orphans); §4.2 authorship → Tasks 1, 7; step-8 outcome → Task 7.
- Type names used across tasks: `loadReviewedCorpus`, `ReviewedCorpus`, `REVIEWED_DIR`, `author?: 'human'`, `countTarget`, `REFS_TARGET`, `JoinPayload`, `patchesFor`, `unbasedOrphans`, `REPAIR_RIDS`: each defined once, in the task that introduces it.
- Task 4's seeder is deleted in Task 5 because it imports the tables Task 5 deletes; its output is committed and proven per rid at seed time.
