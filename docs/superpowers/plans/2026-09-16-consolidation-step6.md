# Consolidation Step 6 — Archive Move and `package.json` Reduction

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove research-process code, docs and reports from `v2` into a
git archive ref and `docs/archive/`, leaving only the three buckets of
spec §4 (rules, patches, review detectors) plus the scripts that run them.

**Architecture:** Two helper modules move out of the archive set first
(`research/{patterns,manifest}.ts` → `patch/`; three helpers out of
`body/census.ts`), so the deletions that follow are pure removals. A
branch and tag record the tree before deletion. Docs, registry
commentary and research data move to `docs/archive/` on `v2`.
`package.json` drops the scripts whose entry points are gone.

**Tech Stack:** Bun, TypeScript, Biome, git.

**Spec:** [`docs/specs/2026-09-13-pipeline-consolidation-design.md`](../../specs/2026-09-13-pipeline-consolidation-design.md)
— §8 (archive), §4.1 (where current code goes), §11 step 6.

## Global Constraints

- **Never delete a production input.** `data/patches/pilot/` and
  `data/patches/tranches/` are both loaded by `admin/pipeline/patch/apply.ts`,
  which is on the `migrate` path. `data/patches/patterns.jsonl` is read by
  `transform/count.ts` and `snapshot.lock` by `patch/snapshot.ts`. None of
  these move.
- **Zero behaviour change.** `bun pipeline:migrate` must produce the same
  entry data after step 6 as before it. No rule, patch, gate or registry
  order changes in this step.
- **`bun qa` green after every task.** That is `biome format --write`,
  `biome check --error-on-warnings`, `bun test --path-ignore-patterns='**/*.corpus.test.ts'`,
  and `tsc --noEmit --skipLibCheck`.
- **Commit format:** `<emoji> <type>(pipeline): <description>`, 50 char max,
  imperative, lowercase. Sign off every commit (`git commit -s`).
- **Branch:** feature branch off `v2`, never commit to `v2` or `main` directly.

**User decisions (already made):**
- `data/patches/catalogue-audit/` **moves** to `docs/archive/`, and the 11
  surviving pipeline source files that cite paths inside it are rewritten in
  the same commit (Brian, 2026-09-16).
- `research:apply` is **renamed `pipeline:patches`**, not folded into migrate;
  `patch/apply-cli.ts` stays runnable on its own (Brian, 2026-09-16).

---

## Measured ground truth (2026-09-16, this session)

These numbers were measured on `v2` at `d540382b`, not taken from the spec.
Where they disagree with §8, the plan follows the measurement and Task 9
corrects the spec.

| Fact | Measured | §8 says |
|---|---|---|
| Source files unreachable from any surviving root or test | 20, plus `seed-sense-runs.ts` by cascade = 21 | — |
| `research/` | 14 src / 5,058 lines + 15 test / 3,960 lines | part of "17,746" |
| `provenance/` | 6 src / 800 lines + 3 test / 305 lines | "1,174" |
| `body/census.ts` helpers needed by survivors | **three** — `walkSenses`, `stripTags`, **`classifyBoundary`** | "both helpers" (two) |
| `body/census.ts` importers | 10 modules/tests; **6** outlive step 6 | "nine … six outlive" |
| `patch/seed-tranche.ts` | imports `research/{chunks,tranche}.ts`; must archive | **not named in §4.1** |
| `patch/seed-sense-runs.ts` | imports `./seed-tranche.ts`; **cannot survive** (controller Ruling 1) | called a survivor — wrong |
| `data/patches/tranches/` | read by production `patch/apply.ts` | not named — correctly not archived |
| `data/patches/catalogue-audit/` | 41 docs, cited by **11** surviving source files | move named, citation cost not noted |
| `research/{patterns,manifest}.ts` importers | 11 (incl. `transform/registry.ts`, `transform/count.ts`, `patch/apply-cli.ts`) | "move into `patch/` first" |
| Registry `PENDING` block | 490 lines | "487 lines" |
| `.claude/worktrees/` | 6 dirs; only 2 are registered git worktrees | "two stale worktrees today" |
| `transform/rules/headword-census.ts` | only reference in `headword.ts` is prose at line 130, not an import | "lost its only importer" ✓ |
| `package.json` scripts | **25** (step 5 added `transform:invariants`) | 24 |

### The archive set (21 source files + their tests)

`research/` minus `patterns.ts` and `manifest.ts`: `anomalies.ts`,
`chunks.ts`, `corpus-inputs.ts`, `headword-index.ts`, `hebrew-anomalies.ts`,
`link-anomalies.ts`, `residue-sweep.ts`, `residue.ts`, `sample.ts`,
`tranche.ts`, `usage-report.ts`, `verify.ts`.

All of `provenance/`: `audit.ts`, `baseline-audit.ts`, `baseline-transform.ts`,
`compare-entries.ts`, `mine.ts`, `parse-jsonl-diff.ts`.

`body/`: `census.ts`, `review.ts`, `migrate-dry.ts`, `implied-one-census.ts`,
`fixtures/extract.ts`.

`patch/`: `seed-implied-one.ts`, `seed-tranche.ts`, `seed-sense-runs.ts` —
all three fall together via `seed-tranche.ts` → `research/chunks.ts`.

`page-index/` build code: `align.ts`, `bands.ts`, `build.ts`, `columns.ts`,
`emit.ts`, `hocr.ts`, `layout.ts`, `monotonic.ts`, `spine.ts`
— **not** `verify.ts`, which stays (`pageindex:verify`).

`transform/rules/headword-census.ts`.

**Stays:** `transform/{commutation,registry-classes}.ts` and
`transform/rules/corpus-fixture.ts` (the `transform:invariants` script),
`migrate/validate.ts` (step 3's data validation, run by `migrate/truth.test.ts`).

---

### Task 1: Move `patterns.ts` and `manifest.ts` into `patch/`

**Goal:** The two research modules the pipeline actually imports leave
`research/` so the directory can be deleted whole.

**Files:**
- Move: `admin/pipeline/research/patterns.ts` → `admin/pipeline/patch/patterns.ts`
- Move: `admin/pipeline/research/patterns.test.ts` → `admin/pipeline/patch/patterns.test.ts`
- Move: `admin/pipeline/research/manifest.ts` → `admin/pipeline/patch/manifest.ts`
- Move: `admin/pipeline/research/manifest.test.ts` → `admin/pipeline/patch/manifest.test.ts`
- Modify (import path only): `admin/pipeline/body/migrate-dry.ts`,
  `admin/pipeline/patch/apply-cli.ts`, `admin/pipeline/patch/apply.test.ts`,
  `admin/pipeline/transform/count.ts`, `admin/pipeline/transform/registry.ts`,
  `admin/pipeline/transform/registry.test.ts`,
  `admin/pipeline/transform/registry.order.test.ts`,
  `admin/pipeline/transform/commutation.corpus.test.ts`,
  `admin/pipeline/transform/rules/sense-marker.test.ts`

**Acceptance Criteria:**
- [ ] `git mv` was used — the file bytes are unchanged, not retyped
- [ ] No string `research/patterns` or `research/manifest` survives anywhere
      under `admin/`
- [ ] `bun qa` green
- [ ] `bun run transform:invariants` green (it reads `commutation.corpus.test.ts`,
      which is one of the rewritten files)

**Verify:** `bun qa && bun run transform:invariants` → both exit 0

**Steps:**

- [ ] **Step 1: Branch off `v2`**

```bash
cd /Users/brian/Repositories/websites/jastrow
git status --short   # must be empty
git switch -c chore/consolidation-step6 v2
```

- [ ] **Step 2: Move the four files with `git mv`, not by retyping**

Retyping a file decodes `\u` escapes and other byte-level detail that a
test-call checker cannot see. Move the bytes.

```bash
cd /Users/brian/Repositories/websites/jastrow/admin/pipeline
git mv research/patterns.ts      patch/patterns.ts
git mv research/patterns.test.ts patch/patterns.test.ts
git mv research/manifest.ts      patch/manifest.ts
git mv research/manifest.test.ts patch/manifest.test.ts
```

- [ ] **Step 3: Rewrite the import paths**

The moved files are now siblings of `patch/apply-cli.ts` and one level
deeper relative to `transform/`. Rewrite by depth:

```bash
cd /Users/brian/Repositories/websites/jastrow/admin/pipeline
# from patch/ — the modules are now siblings
sed -i '' "s|'../research/manifest.ts'|'./manifest.ts'|g; s|'../research/patterns.ts'|'./patterns.ts'|g" \
  patch/apply-cli.ts patch/apply.test.ts patch/patterns.test.ts patch/manifest.test.ts
# from transform/ and body/ — one hop up, then into patch/
sed -i '' "s|'../research/manifest.ts'|'../patch/manifest.ts'|g; s|'../research/patterns.ts'|'../patch/patterns.ts'|g" \
  body/migrate-dry.ts transform/count.ts transform/registry.ts transform/registry.test.ts \
  transform/registry.order.test.ts transform/commutation.corpus.test.ts
# from transform/rules/ — two hops up
sed -i '' "s|'../../research/patterns.ts'|'../../patch/patterns.ts'|g" \
  transform/rules/sense-marker.test.ts
```

- [ ] **Step 4: Prove no stale path survives**

```bash
cd /Users/brian/Repositories/websites/jastrow
! grep -rn "research/patterns\|research/manifest" --include='*.ts' admin/
```

Expected: exit 0 (no matches). If it prints a line, fix that file and re-run.

- [ ] **Step 5: Run the gates**

```bash
cd /Users/brian/Repositories/websites/jastrow
bun qa && bun run transform:invariants
```

Expected: both exit 0. `transform:invariants` takes ~4 min.

- [ ] **Step 6: Commit**

```bash
cd /Users/brian/Repositories/websites/jastrow
git add -A
git commit -s -m "🧺 chore(pipeline): move patterns and manifest to patch

The pipeline imports both from research/, which step 6 archives.
They are patch-engine inputs, not research: patterns.jsonl drives
the registry and count, manifest drives the patch replay gate.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Split the surviving helpers out of `body/census.ts`

**Goal:** `walkSenses`, `stripTags` and `classifyBoundary` move to a module
that stays, so `census.ts` can be archived.

**Files:**
- Create: `admin/pipeline/body/sense-walk.ts`
- Modify: `admin/pipeline/body/census.ts` (import the three, drop the
  definitions and their re-exports)
- Modify: `admin/pipeline/body/units.ts:10`,
  `admin/pipeline/body/dry-run-report.ts:11`,
  `admin/pipeline/body/labels.test.ts:2`,
  `admin/pipeline/body/form-sections.test.ts:2`,
  `admin/pipeline/body/lettered.test.ts:2`,
  `admin/pipeline/body/units.test.ts:2`

**Acceptance Criteria:**
- [ ] `body/sense-walk.ts` exports `walkSenses`, `classifyBoundary`,
      `stripTags` and the `Boundary` type. `stripTags` is exported **for now**
      because `census.ts` calls it directly at six sites that are not part of
      this move (`originHead`, `precedingText`, `letteredRun`, `pluralSection`,
      `formSectionCandidates`, `classifyOpener`). Task 4 deletes `census.ts`
      and drops the export then (controller Ruling 2, revised)
- [ ] The three function bodies are byte-identical to the originals
- [ ] The 6 importers that outlive Task 4 point at `sense-walk.ts`:
      `body/units.ts`, `body/dry-run-report.ts`, and the `labels`,
      `form-sections`, `lettered`, `units` body tests
- [ ] `census.ts`'s export block is **unchanged**, so the five importers Task 4
      deletes keep compiling untouched (controller Ruling 6)
- [ ] `bun qa` green — all four stages, including `tsc --noEmit`

**Verify:** `bun qa` → exit 0 (all four stages, `tsc` included), and
`grep -rn "from '\./census.ts'\|from '\.\./body/census.ts'" admin/pipeline --include='*.ts'`
prints exactly five files — `body/census.test.ts`, `body/implied-one-census.ts`,
`body/review.ts`, `patch/seed-sense-runs.ts`, `patch/seed-implied-one.ts` —
every one of them deleted in Task 4

**Steps:**

- [ ] **Step 1: Create `body/sense-walk.ts`**

The three helpers are self-contained: `stripTags` needs only the `TAGS`
regex, `classifyBoundary` needs `stripTags` and the `Boundary` type, and
`walkSenses` needs only the `SourceSense` type.

```typescript
/**
 * Sense-tree and tag helpers shared across the body model. Extracted
 * from `census.ts` (consolidation spec §8) so the census tool could be
 * archived without taking its callers with it; the bodies are
 * unchanged from that file.
 */
import type { SourceSense } from './types.ts';

type Boundary =
	| 'sense-start'
	| 'period'
	| 'dash'
	| 'semicolon'
	| 'comma'
	| 'embedded';

const TAGS = /<[^>]+>/gu;
// Strips to a fixed point so fragments re-composed by one pass
// (`<scr<i>ipt>`-style) can't survive (CodeQL js/incomplete-
// multi-character-sanitization); corpus-verified byte-identical to
// the single-pass version over all 32,512 entries.
const stripTags = (text: string): string => {
	let out = text;
	let prev: string;
	do {
		prev = out;
		out = out.replace(TAGS, '');
	} while (out !== prev);
	return out;
};

/** Classify the (tag-stripped) text immediately before a citation
 * anchor into the punctuation class it ends on. Empty text means the
 * anchor opens its sense outright. */
function classifyBoundary(before: string): Boundary {
	const t = stripTags(before).trimEnd();
	if (t === '') {
		return 'sense-start';
	}
	if (t.endsWith('—')) {
		return 'dash';
	}
	if (t.endsWith('.')) {
		return 'period';
	}
	if (t.endsWith(';')) {
		return 'semicolon';
	}
	if (t.endsWith(',')) {
		return 'comma';
	}
	return 'embedded';
}

/** Depth-first walk over a sense tree, yielding every node including
 * nested sub-senses. */
function* walkSenses(senses: SourceSense[]): Generator<SourceSense> {
	for (const sense of senses) {
		yield sense;
		if (sense.senses) {
			yield* walkSenses(sense.senses);
		}
	}
}

export type { Boundary };
export { classifyBoundary, stripTags, walkSenses };
```

- [ ] **Step 2: Remove the three from `census.ts` and import them instead**

In `admin/pipeline/body/census.ts`:
1. Delete the `Boundary` type (lines 17–24), the `TAGS` const and
   `stripTags` (lines 25–41), `classifyBoundary` (lines 43–61), and
   `walkSenses` (lines 266–275). Line numbers are from `v2@d540382b`;
   confirm by content before cutting.
2. Add to the import block near the top:

```typescript
import { type Boundary, classifyBoundary, stripTags, walkSenses } from './sense-walk.ts';
```

3. **Leave the export block at the end exactly as it is.** `census.ts` goes
   on exporting `classifyBoundary`, `stripTags`, `walkSenses` and the
   `Boundary` type — now as a re-export of what it imported in 2.2, not as
   its own definitions. This is deliberate (controller Ruling 6): five files
   still import those symbols from `census.ts`, and all five are deleted in
   Task 4, so repointing them here would be work thrown away and trimming the
   export here would break `tsc` for a whole task. The re-export lives for
   exactly one task and disappears with the file.

   The five: `body/census.test.ts`, `body/implied-one-census.ts`,
   `body/review.ts`, `patch/seed-sense-runs.ts`, `patch/seed-implied-one.ts`.
   Do not touch any of them.

- [ ] **Step 3: Repoint the 6 surviving importers**

```bash
cd /Users/brian/Repositories/websites/jastrow/admin/pipeline
sed -i '' "s|from './census.ts'|from './sense-walk.ts'|" \
  body/units.ts body/dry-run-report.ts \
  body/labels.test.ts body/form-sections.test.ts body/lettered.test.ts body/units.test.ts
```

Note `body/units.ts` imports `classifyBoundary` — the helper §8 did not
name. Do not assume the sed only touched `walkSenses` call sites.

- [ ] **Step 4: Run the gates**

```bash
cd /Users/brian/Repositories/websites/jastrow
bun qa
```

Expected: exit 0. A `tsc` error naming `classifyBoundary` or `Boundary`
means the export block in Step 2.3 was over-trimmed.

- [ ] **Step 5: Commit**

```bash
cd /Users/brian/Repositories/websites/jastrow
git add -A
git commit -s -m "🧺 chore(pipeline): split sense-walk from census

census.ts is archived in step 6, but three of its helpers are on the
migrate path: walkSenses, stripTags, and classifyBoundary, which
body/units.ts imports. Bodies unchanged.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Record the archive ref before deleting anything

**Goal:** A branch and tag hold the research code, so §8's "stays
re-runnable" is true and nothing is lost.

**Files:** none modified — git refs only.

**Acceptance Criteria:**
- [ ] Branch `archive/v2-research-2026-09` exists at the current HEAD
- [ ] Tag `archive/v2-research-2026-09` exists at the same commit
- [ ] Both refs are **local only** — this task does not push (controller
      Ruling 5: a push to a shared remote is the maintainer's call, and a local
      tag is exactly as durable as the branch the work lives on)
- [ ] `git show archive/v2-research-2026-09:admin/pipeline/page-index/build.ts | head -1`
      prints the file's first line

**Verify:** `git show archive/v2-research-2026-09:admin/pipeline/research/verify.ts | wc -l` → `584`,
and `git show archive/v2-research-2026-09:admin/pipeline/body/census.ts | wc -l` → the
current `census.ts` line count (Task 2 shrank it; the archive must hold the
post-Task-2 file, since that is the tree Task 4 deletes from)

**Steps:**

- [ ] **Step 1: Create the branch and tag at HEAD**

HEAD is the Task 2 commit: the tree still holds every file the archive
must preserve, with the two helper moves already applied so the archived
tree compiles.

```bash
cd /Users/brian/Repositories/websites/jastrow
git branch archive/v2-research-2026-09
git tag -a archive/v2-research-2026-09 -m "Research-process code as of consolidation step 6

Holds admin/pipeline/{research,provenance}/, the body census and
review tools, the patch seeders, and the page-index build code.
Deleted from v2 by consolidation spec §8; kept here re-runnable."
```

- [ ] **Step 2: Verify the ref holds the code**

```bash
cd /Users/brian/Repositories/websites/jastrow
git show archive/v2-research-2026-09:admin/pipeline/research/verify.ts | wc -l
git show archive/v2-research-2026-09:admin/pipeline/page-index/build.ts | head -1
```

Expected: `584`, then the first line of `build.ts`.

- [ ] **Step 3: Do NOT push — confirm the refs are local and stop**

The plan originally pushed both refs here. That is withdrawn (controller
Ruling 5): pushing to a shared remote is the maintainer's call, and the
maintainer will push these alongside the PR branch. A local tag is exactly as
durable as the branch this work lives on, so Task 4's deletions are safe
either way.

```bash
cd /Users/brian/Repositories/websites/jastrow
git branch --list 'archive/*'
git tag --list 'archive/*'
git ls-remote --heads origin 'archive/*' 2>/dev/null || true
```

Expected: the branch and tag exist locally; the remote listing is empty or
unreachable. Both are correct. Do not run `git push` in this task.

---

### Task 4: Delete the archived code from `v2`

**Goal:** The 20 source files and their tests leave the working branch;
nothing else changes.

**Files:**
- Delete: `admin/pipeline/research/` (whole directory, now 12 src + 13 test files)
- Delete: `admin/pipeline/provenance/` (whole directory)
- Delete: `admin/pipeline/body/{census,review,migrate-dry,implied-one-census}.ts`
  and their `.test.ts` / `.corpus.test.ts` siblings — `census.test.ts` included;
  it and four others still import from `census.ts` by Ruling 6
- Delete: `admin/pipeline/body/fixtures/extract.ts`
- Delete: `admin/pipeline/patch/{seed-implied-one,seed-tranche,seed-sense-runs}.ts` and their tests
- Delete: `admin/pipeline/page-index/{align,bands,build,columns,emit,hocr,layout,monotonic,spine}.ts`
  and their tests
- Delete: `admin/pipeline/transform/rules/headword-census.ts`
- Modify: `admin/pipeline/transform/rules/headword.ts:130` (comment cites the
  deleted census file)

**Acceptance Criteria:**
- [ ] `admin/pipeline/research/` and `admin/pipeline/provenance/` do not exist
- [ ] `admin/pipeline/page-index/verify.ts` **does** exist and still runs
- [ ] `admin/pipeline/patch/` retains `apply.ts`, `apply-cli.ts`, `schema.ts`,
      `snapshot.ts`, `patterns.ts`, `manifest.ts` — no `seed-*.ts` remains
- [ ] `body/sense-walk.ts` no longer exports `stripTags` — with `census.ts`,
      `implied-one-census.ts`, `review.ts` and `seed-sense-runs.ts` all deleted,
      its only caller is `classifyBoundary` in the same module (Task 2 exported
      it solely for `census.ts`'s six call sites)
- [ ] No surviving `.ts` file imports a deleted module
- [ ] `bun qa` green; `bun run transform:invariants` green
- [ ] `bun pipeline:migrate` (dry run) completes with nine gates green

**Verify:** `bun qa && bun run transform:invariants && bun pipeline:migrate` → all exit 0, migrate reports nine gates green

**Steps:**

- [ ] **Step 1: Delete the directories and files**

```bash
cd /Users/brian/Repositories/websites/jastrow/admin/pipeline
git rm -r --quiet research provenance
git rm --quiet body/census.ts body/census.test.ts \
  body/review.ts body/review.test.ts \
  body/migrate-dry.ts body/migrate-dry.test.ts \
  body/implied-one-census.ts body/implied-one-census.test.ts \
  body/implied-one-census.corpus.test.ts \
  body/fixtures/extract.ts \
  patch/seed-implied-one.ts patch/seed-implied-one.test.ts \
  patch/seed-tranche.ts \
  patch/seed-sense-runs.ts patch/seed-sense-runs.test.ts \
  transform/rules/headword-census.ts
git rm --quiet page-index/align.ts page-index/bands.ts page-index/build.ts \
  page-index/columns.ts page-index/emit.ts page-index/hocr.ts \
  page-index/layout.ts page-index/monotonic.ts page-index/spine.ts
```

Some of the named `.test.ts` files may not exist — `git rm` fails loudly on
a missing path, which is the desired signal. Drop only paths it reports as
`did not match any files`, and note which in the commit body.

- [ ] **Step 2: Delete the seeders' tests if they reference deleted modules**

```bash
cd /Users/brian/Repositories/websites/jastrow/admin/pipeline
grep -rln "implied-one-census\|seed-tranche\|/census\.ts\|research/\|provenance/" --include='*.test.ts' .
```

Every file this prints imports something now gone. `git rm` each one, then
re-run until it prints nothing. The three seeders go together: `seed-sense-runs.ts` and
`seed-implied-one.ts` both import `./seed-tranche.ts`, which imports
`../research/chunks.ts`.

- [ ] **Step 3: Confirm the seeders' outputs survive the deletion**

The generators go; their committed output must not. `patch/apply.ts` loads
`data/patches/tranches/`, which holds `seed-doc-08-sense-runs/` and
`seed-doc-08-implied-one/`.

```bash
cd /Users/brian/Repositories/websites/jastrow
ls data/patches/tranches/seed-doc-08-sense-runs data/patches/tranches/seed-doc-08-implied-one
```

Expected: both directories list their files. If either is missing, stop —
deleting a generator whose output is gone loses the patches.

- [ ] **Step 4: Drop the `stripTags` export from `sense-walk.ts`**

Task 2 exported it only so `census.ts` could import it. That file is now gone,
and the body-side `stripTags` has one caller left: `classifyBoundary`, in the
same module. Change the export line to:

```typescript
export { classifyBoundary, walkSenses };
```

Then prove nothing else wanted it:

```bash
cd /Users/brian/Repositories/websites/jastrow
grep -rn "stripTags" --include='*.ts' admin/pipeline/body admin/pipeline/patch admin/pipeline/migrate
```

Expected: only `body/sense-walk.ts`'s own definition and the `classifyBoundary`
call. The many `stripTags` hits under `admin/pipeline/transform/` are a
**different function** — `transform/no-new-text.ts` defines and exports its
own. Do not touch it.

- [ ] **Step 5: Fix the dangling comment in `headword.ts`**

```bash
cd /Users/brian/Repositories/websites/jastrow/admin/pipeline
sed -n '126,134p' transform/rules/headword.ts
```

Rewrite the sentence at line 130 so it names the archive ref instead of the
deleted file, for example:

```
 * All of it was pinned in `headword-census.ts`, archived at
 * `archive/v2-research-2026-09` (consolidation spec §8); it was
```

- [ ] **Step 6: Prove nothing dangles**

```bash
cd /Users/brian/Repositories/websites/jastrow
! grep -rn "pipeline/research/\|pipeline/provenance/\|body/census\.ts\|implied-one-census\|page-index/build\.ts\|headword-census" \
  --include='*.ts' admin/
```

Expected: exit 0. Any hit is a live reference to a deleted file.

- [ ] **Step 7: Run the gates, including a real migrate dry run**

`bun qa` cannot see a break in the migrate path that only shows at runtime,
so run migrate itself.

```bash
cd /Users/brian/Repositories/websites/jastrow
bun qa && bun run transform:invariants && bun pipeline:migrate
```

Expected: `bun qa` and `transform:invariants` exit 0; `pipeline:migrate`
finishes in ~2 min reporting nine gates green. A gate that moved means a
deletion changed behaviour — stop and investigate, do not re-pin.

- [ ] **Step 8: Commit**

```bash
cd /Users/brian/Repositories/websites/jastrow
git add -A
git commit -s -m "🧺 chore(pipeline): archive the research code

Removes admin/pipeline/{research,provenance}/, the body census and
review tools, two patch seeders and the page-index build code, all
kept at archive/v2-research-2026-09. Dead code is not linted, typed
or tested; spec §8.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Registry `PENDING` commentary → `docs/archive/registry-history.md`

**Goal:** 490 lines of historical prose inside an empty array move to a
document, with zero behaviour change.

**Files:**
- Create: `docs/archive/registry-history.md`
- Modify: `admin/pipeline/transform/registry.ts` (the `PENDING` block, ~490 lines)

**Acceptance Criteria:**
- [ ] `PENDING` is still exported and still an empty array — the gate at
      `registry.ts:1997` (`new Set(PENDING)`) still reads it
- [ ] `docs/archive/registry-history.md` holds the removed commentary verbatim,
      with a header saying where it came from and at which commit
- [ ] `registry.ts` keeps a pointer comment to the new document
- [ ] `bun qa` green; `bun run transform:invariants` green
- [ ] `git diff` on `registry.ts` shows only comment lines removed

**Verify:** `bun run transform:invariants` → exit 0, and
`bun test admin/pipeline/transform/registry.test.ts` → pass

**Steps:**

- [ ] **Step 1: Locate the block**

```bash
cd /Users/brian/Repositories/websites/jastrow/admin/pipeline
awk '/const PENDING/,/^\];/' transform/registry.ts | wc -l   # expect 490
grep -n 'const PENDING' transform/registry.ts
grep -n 'PENDING' transform/registry.ts                       # note every use
```

Uses to preserve: the declaration, `new Set(PENDING)` near line 1997, and
the export near line 2328.

- [ ] **Step 2: Extract the commentary into the archive doc**

```bash
cd /Users/brian/Repositories/websites/jastrow
mkdir -p docs/archive
{
  printf '# Registry `PENDING` history\n\n'
  printf 'Commentary lifted verbatim from `admin/pipeline/transform/registry.ts`\n'
  printf 'by consolidation step 6 (spec §8). It recorded which rows left\n'
  printf '`PENDING` in which transform batch; the array itself is empty and\n'
  printf 'stays in the code. Extracted at `%s`.\n\n' "$(git rev-parse --short HEAD)"
  printf '```text\n'
  awk '/const PENDING/,/^\];/' admin/pipeline/transform/registry.ts
  printf '```\n'
} > docs/archive/registry-history.md
```

- [ ] **Step 3: Replace the block in `registry.ts`**

Cut the extracted range and leave the declaration plus a pointer:

```typescript
/** Rows awaiting registration. Empty since transform batch 10; the
 * per-batch history of what left this array is archived at
 * `docs/archive/registry-history.md` (consolidation spec §8). */
const PENDING: readonly string[] = [];
```

Keep the declared type exactly as it was before the edit — read the original
line rather than copying the one above if they differ.

- [ ] **Step 4: Confirm only comments moved**

```bash
cd /Users/brian/Repositories/websites/jastrow
git diff --stat admin/pipeline/transform/registry.ts
git diff admin/pipeline/transform/registry.ts | grep '^+' | grep -v '^+++' | grep -vE '^\+\s*(\*|/\*|//)' 
```

Expected: the second command prints only the `const PENDING` line and its
closing. Any other added code line is a behaviour change — revert it.

- [ ] **Step 5: Run the gates**

```bash
cd /Users/brian/Repositories/websites/jastrow
bun qa && bun run transform:invariants
```

Expected: both exit 0. `transform:invariants` is the check that sees registry
order, so it is not optional here.

- [ ] **Step 6: Commit**

```bash
cd /Users/brian/Repositories/websites/jastrow
git add -A
git commit -s -m "📖 doc(pipeline): archive PENDING commentary

490 lines of batch-by-batch commentary sat inside an empty array.
Moved verbatim to docs/archive/registry-history.md; PENDING and its
gate are unchanged.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Move the research documents to `docs/archive/`

**Goal:** 35 research documents and `body-review/` leave `docs/v2/`, which
keeps only the documents the pipeline's readers need.

**Files:**
- Move to `docs/archive/`: `docs/v2/{baseline-audit,body-census,body-dryrun,body-migration,catalogue-audit,divergence-audit,pattern-triage}.md`,
  `docs/v2/discovery-round-{1,2,2-candidates,3,3-candidates,4}.md`,
  `docs/v2/phase-2-*.md` (10 files), `docs/v2/transform-batch-*.md` (12 files),
  `docs/v2/body-review/`
- Modify: any document or source file linking to a moved path

**Acceptance Criteria:**
- [ ] 35 files + `body-review/` are under `docs/archive/`
- [ ] `docs/v2/` retains `migration-blessing.md`, `retired-corpus-checks.md`,
      `sefaria-report.md`, `test-tiers.md`, `upstream-issues.md`
- [ ] No surviving file links to a `docs/v2/<moved>` path
- [ ] `bun qa` green

**Verify:** `grep -rn "docs/v2/\(phase-2\|transform-batch\|discovery-round\|body-review\|baseline-audit\|catalogue-audit\|divergence-audit\|pattern-triage\|body-census\|body-dryrun\|body-migration\)" --include='*.md' --include='*.ts' . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=archive` → no output

**Steps:**

- [ ] **Step 1: Move them**

```bash
cd /Users/brian/Repositories/websites/jastrow
mkdir -p docs/archive
git mv docs/v2/baseline-audit.md docs/v2/body-census.md docs/v2/body-dryrun.md \
       docs/v2/body-migration.md docs/v2/catalogue-audit.md \
       docs/v2/divergence-audit.md docs/v2/pattern-triage.md docs/archive/
git mv docs/v2/discovery-round-*.md docs/archive/
git mv docs/v2/phase-2-*.md docs/archive/
git mv docs/v2/transform-batch-*.md docs/archive/
git mv docs/v2/body-review docs/archive/body-review
ls docs/v2   # expect 5 files
```

- [ ] **Step 2: Find and rewrite every link to a moved path**

```bash
cd /Users/brian/Repositories/websites/jastrow
grep -rln "docs/v2/\(phase-2\|transform-batch\|discovery-round\|body-review\|baseline-audit\|catalogue-audit\|divergence-audit\|pattern-triage\|body-census\|body-dryrun\|body-migration\)" \
  --include='*.md' --include='*.ts' . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=archive
```

For each file listed, `sed -i '' 's|docs/v2/|docs/archive/|g'` is **not** safe
— it would rewrite links to the five documents that stayed. Rewrite each
match by name:

```bash
# example shape; extend the alternation to cover exactly the files that moved
sed -i '' -E 's|docs/v2/(phase-2-[a-z0-9-]+\.md)|docs/archive/\1|g; s|docs/v2/(transform-batch-[0-9a-c]+\.md)|docs/archive/\1|g' <file>
```

Also check relative links from inside `docs/v2/` and `docs/specs/` — a doc
that said `transform-batch-9.md` with no directory now needs `../archive/`.

- [ ] **Step 3: Prove no link dangles**

```bash
cd /Users/brian/Repositories/websites/jastrow
grep -rn "docs/v2/\(phase-2\|transform-batch\|discovery-round\|body-review\|baseline-audit\|catalogue-audit\|divergence-audit\|pattern-triage\|body-census\|body-dryrun\|body-migration\)" \
  --include='*.md' --include='*.ts' . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=archive
```

Expected: no output.

- [ ] **Step 4: Run the gates and commit**

```bash
cd /Users/brian/Repositories/websites/jastrow
bun qa
git add -A
git commit -s -m "📖 doc: archive the research documents

35 round, batch and phase reports plus body-review/ move from
docs/v2/ to docs/archive/; history stays readable and linkable.
docs/v2/ keeps the five documents the pipeline's readers need.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Move the research data out of `data/`, rewrite the 11 citations

**Goal:** Reports filed beside the data move to `docs/archive/`; the 11
surviving source files that cite `data/patches/catalogue-audit/` are updated
in the same commit (user decision).

**Files:**
- Move to `docs/archive/`: `data/patches/{catalogue-audit,discovery-round-2,discovery-round-3,checkpoints}/`,
  `data/source/divergence-report.json`
- Modify: the 11 `admin/pipeline/**/*.ts` files citing `data/patches/catalogue-audit`
  (includes `transform/html.ts`, `transform/registry.ts`,
  `transform/rules/{anaphora,geresh,gershayim,rtl,v-sub-twin}.ts`)

**Acceptance Criteria:**
- [ ] `data/patches/` retains `pilot/`, `tranches/`, `patterns.jsonl`,
      `snapshot.lock`, `RUNBOOK.md` — all production inputs
- [ ] No string `data/patches/catalogue-audit` survives under `admin/`
- [ ] No string `data/patches/checkpoints` survives under `admin/`
      (its only reader, `research/chunks.ts`, was deleted in Task 4)
- [ ] `bun pipeline:migrate` dry run: nine gates green, same report counts
      as before the move
- [ ] `bun qa` green

**Verify:** `bun pipeline:migrate && bun qa` → both exit 0, nine gates green

**Steps:**

- [ ] **Step 1: Confirm nothing production reads what is about to move**

Do this before the move, not after.

```bash
cd /Users/brian/Repositories/websites/jastrow
grep -rn "data/patches/catalogue-audit\|data/patches/discovery-round\|data/patches/checkpoints\|divergence-report" \
  --include='*.ts' admin/ | grep -v '^\s*\*\|//' 
```

Expected: no output — every remaining mention is a doc comment, not a read.
If a line shows an actual `readFile`/path constant, stop: that directory is
an input, not a report, and Task 9 records the correction.

- [ ] **Step 2: Move them**

```bash
cd /Users/brian/Repositories/websites/jastrow
git mv data/patches/catalogue-audit   docs/archive/catalogue-audit
git mv data/patches/discovery-round-2 docs/archive/patches-discovery-round-2
git mv data/patches/discovery-round-3 docs/archive/patches-discovery-round-3
git mv data/patches/checkpoints       docs/archive/patches-checkpoints
git mv data/source/divergence-report.json docs/archive/divergence-report.json
ls data/patches   # expect: RUNBOOK.md patterns.jsonl pilot snapshot.lock tranches
```

`docs/archive/catalogue-audit.md` already exists from Task 6 — the new
directory `docs/archive/catalogue-audit/` sits beside it, which is fine on
a case-sensitive and a case-insensitive filesystem alike since the names
differ by extension. Confirm both exist after the move.

- [ ] **Step 3: Rewrite the 11 citations**

```bash
cd /Users/brian/Repositories/websites/jastrow
grep -rl "data/patches/catalogue-audit" --include='*.ts' admin/pipeline | tee /tmp/cite-files
xargs sed -i '' 's|data/patches/catalogue-audit|docs/archive/catalogue-audit|g' < /tmp/cite-files
```

- [ ] **Step 4: Prove no stale citation survives**

```bash
cd /Users/brian/Repositories/websites/jastrow
! grep -rn "data/patches/catalogue-audit\|data/patches/checkpoints\|data/patches/discovery-round" \
  --include='*.ts' --include='*.md' . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=archive
```

Expected: exit 0.

- [ ] **Step 5: Run migrate, not just `bun qa`**

A moved input shows as a runtime failure, which `bun qa` cannot see.

```bash
cd /Users/brian/Repositories/websites/jastrow
bun pipeline:migrate && bun qa
```

Expected: nine gates green and the same report header counts as the Task 4
run. A changed count means something moved that was an input.

- [ ] **Step 6: Commit**

```bash
cd /Users/brian/Repositories/websites/jastrow
git add -A
git commit -s -m "📖 doc: archive reports filed beside the data

catalogue-audit, the two discovery rounds, checkpoints and the
divergence report are evidence, not correction data (spec §1.1).
The 11 rule files citing catalogue-audit paths follow them.
pilot/ and tranches/ stay: patch/apply.ts loads both.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Reduce `package.json` and delete the stale workspaces

**Goal:** `package.json` lists only scripts whose entry points still exist;
stale worktree and brainstorm directories go.

**Files:**
- Modify: `package.json`
- Delete: `.worktrees/`, `.superpowers/` stale entries, unregistered
  `.claude/worktrees/agent-*` directories
- Modify: `.gitignore` if it names a deleted path

**Acceptance Criteria:**
- [ ] Every remaining script's entry file exists
- [ ] Scripts after the change: `pipeline:fetch`, `pipeline:migrate`,
      `pipeline:patches`, `pageindex:verify`, `transform:count`,
      `transform:invariants`, `qa`, `qa:ci`, `qa:format`, `qa:lint`,
      `qa:test`, `qa:tsc` — 12, down from 25
- [ ] `bun run pipeline:patches --help` (or its no-arg usage output) runs
- [ ] The two registered git worktrees are removed only if `git worktree list`
      shows them as prunable; `agent-*` directories that are not registered
      worktrees are plain directories and are deleted
- [ ] `bun qa` green

**Verify:** `for s in $(node -e "console.log(Object.values(require('./package.json').scripts).join('\n'))" | grep -o 'admin/[^ ]*\.ts'); do test -f "$s" || echo "MISSING $s"; done` → no output

**Steps:**

- [ ] **Step 1: Delete the scripts whose entry points are gone**

These 13 go: `body:census`, `body:dry-run`, `body:implied-one-census`,
`body:migrate-dry`, `body:review`, `pageindex:build`, `patch:seed-implied-one`,
`patch:seed-sense-runs`, `provenance:audit`, `provenance:baseline`,
`provenance:mine`, `research:residue`, `usage`.

`package.json` holds **25** scripts, not the 24 the spec's §1 measured on
2026-09-11 — step 5 added `transform:invariants` after that count. 25 minus
these 13 is 12, with `research:apply` renamed in place (controller Ruling 3).

- [ ] **Step 2: Rename `research:apply` to `pipeline:patches`**

Per the user decision. The entry point `admin/pipeline/patch/apply-cli.ts`
does not move.

```json
"pipeline:patches": "bun admin/pipeline/patch/apply-cli.ts",
```

- [ ] **Step 3: Check nothing else invokes a deleted script name**

```bash
cd /Users/brian/Repositories/websites/jastrow
grep -rn "research:apply\|body:census\|body:dry-run\|body:review\|body:migrate-dry\|body:implied-one-census\|pageindex:build\|patch:seed-\|provenance:\|research:residue\|bun usage" \
  --include='*.md' --include='*.yml' --include='*.sh' --include='*.json' \
  . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=archive
```

Rewrite each hit: `research:apply` becomes `pipeline:patches`; a reference
to a deleted script becomes a pointer to `archive/v2-research-2026-09`.
Check `.github/workflows/` and `CONTRIBUTING.md` specifically.

- [ ] **Step 4: Verify every remaining entry point exists**

```bash
cd /Users/brian/Repositories/websites/jastrow
node -e "const s=require('./package.json').scripts; for (const [k,v] of Object.entries(s)) for (const m of v.matchAll(/admin\/[^ ]*\.ts/g)) { if (!require('fs').existsSync(m[0])) console.log('MISSING', k, m[0]); }"
```

Expected: no output.

- [ ] **Step 5: Clear the stale workspaces**

```bash
cd /Users/brian/Repositories/websites/jastrow
git worktree list          # two registered: inspiring-tereshkova, peaceful-spence
git worktree prune --dry-run
```

Ask before removing a registered worktree — it may hold uncommitted work.
For each, check `git -C .claude/worktrees/<name> status --short` first; remove
only the ones that are clean and whose branch is merged.

The four `.claude/worktrees/agent-*` directories are not registered worktrees
(they do not appear in `git worktree list`), so they are plain directories:

```bash
cd /Users/brian/Repositories/websites/jastrow
rm -rf .claude/worktrees/agent-a909ff370aff4194f .claude/worktrees/agent-ac5f59ca9127416fc \
       .claude/worktrees/agent-acb12c72f8babb862 .claude/worktrees/agent-aeddecd71fe9abdcb
rm -rf .worktrees          # holds only a .DS_Store
```

`.superpowers/` holds `brainstorm/` and `sdd/` session state with its own
`.gitignore`. Delete only the brainstorm directories older than the v2 work;
list them and confirm before removing.

- [ ] **Step 6: Run the gates and commit**

```bash
cd /Users/brian/Repositories/websites/jastrow
bun qa && bun pipeline:migrate
git add -A
git commit -s -m "🧺 chore: cut package.json to pipeline scripts

25 scripts become 12: the research and one-time seeding entry points
went to archive/v2-research-2026-09 in this step. research:apply is
renamed pipeline:patches — it is the patch engine, not research.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: Amend the spec and the contributor docs

**Goal:** The spec records what step 6 actually did, including where the
measurement disagreed with §8.

**Files:**
- Modify: `docs/specs/2026-09-13-pipeline-consolidation-design.md`
  (§1 table, §4.1 last row, §8, §11 step 6, §12 changelog)
- Modify: `admin/pipeline/README.md`, `CONTRIBUTING.md`, `.claude/CLAUDE.md`
  where they name a deleted script or directory
- Modify: `docs/glossary.md` if it names a moved path

**Acceptance Criteria:**
- [ ] §11 step 6 reads `*Shipped (#NN).*` with the measured outcome
- [ ] §8 records the three corrections: three census helpers not two,
      `patch/seed-tranche.ts` added to the §4.1 archive list,
      `data/patches/tranches/` named as a production input that stays
- [ ] §12 has a `2026-09-16` changelog row
- [ ] Every path named in `CONTRIBUTING.md` and `.claude/CLAUDE.md` exists
- [ ] `bun qa` green

**Verify:** `grep -oE '(admin|data|docs)/[A-Za-z0-9_./-]+' CONTRIBUTING.md .claude/CLAUDE.md | cut -d: -f2 | sort -u | while read p; do test -e "$p" || echo "MISSING $p"; done` → no output

**Steps:**

- [ ] **Step 1: Amend §8 with the measured corrections**

Add to the `census.ts` row: the helper count is **three**, not two —
`body/units.ts` imports `classifyBoundary`, and it is on the migrate path.
§8's count of six survivors happens to be right for the wrong reason: it
counted `patch/seed-sense-runs.ts` (which cannot survive) and missed
`body/units.ts` (which does). Name the six correctly:
`body/units.ts`, `body/dry-run-report.ts`, and the `labels`,
`form-sections`, `lettered` and `units` body tests.

Add a row: `data/patches/tranches/` is a production input read by
`patch/apply.ts`, alongside `pilot/`; neither is archived.

Note the catalogue-audit move cost: 11 surviving source files cited paths
inside it and were rewritten in the same commit (the user's decision).

- [ ] **Step 2: Amend §4.1's last row**

It listed `patch/seed-implied-one.ts` but not `patch/seed-tranche.ts`, which
imports two archived research modules and could not stay. Add it.

- [ ] **Step 3: Mark §11 step 6 shipped**

```markdown
6. *Shipped (#NN).* Archive move and `package.json` reduction (§8).
   20 source files and their tests moved to branch and tag
   `archive/v2-research-2026-09`; 35 research documents and
   `body-review/` to `docs/archive/`; 490 lines of registry `PENDING`
   commentary to `docs/archive/registry-history.md`; four research
   directories and the divergence report out of `data/`. Scripts: 24 → 12,
   `research:apply` renamed `pipeline:patches`.
```

- [ ] **Step 4: Add the changelog row**

```markdown
| 2026-09-16 | Step 6: research code archived at `archive/v2-research-2026-09`; docs and research data to `docs/archive/`; registry `PENDING` commentary extracted; `package.json` 24 → 12 scripts. §8 corrected: three census helpers, not two (`classifyBoundary` is on the migrate path); `patch/seed-tranche.ts` added to the §4.1 archive list; `data/patches/tranches/` named as a production input |
```

- [ ] **Step 5: Sweep the contributor docs**

```bash
cd /Users/brian/Repositories/websites/jastrow
grep -n "research\|provenance\|body:census\|pageindex:build\|corpus" \
  CONTRIBUTING.md .claude/CLAUDE.md admin/pipeline/README.md
```

Rewrite each hit that names something now archived.

- [ ] **Step 6: Run the gates and commit**

```bash
cd /Users/brian/Repositories/websites/jastrow
bun qa
git add -A
git commit -s -m "📖 doc(pipeline): record step 6 and correct §8

§8 named two census helpers; classifyBoundary is a third and is on
the migrate path. Both remaining seeders join the §4.1 archive list
— seed-sense-runs.ts was not a survivor — and tranches/ is an input.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Open items for review before the PR

- **`patch/seed-sense-runs.ts` — resolved before execution (Ruling 1).** §8
  lists it as a survivor; it is not one. It imports `./seed-tranche.ts`,
  which imports `../research/chunks.ts`. All three seeders archive together.
  Their output is committed under `data/patches/tranches/` and read by
  `patch/apply.ts`, so nothing is lost. Task 9 records the §8 correction.
- **`transform:count`.** §8's target script list omits it, but §3.1 cites
  `bun transform:count` as live and it reads `data/patches/patterns.jsonl`.
  This plan keeps it. If §8 meant to drop it, say so before Task 8.
- **Registered worktrees.** Task 8 Step 5 stops and asks rather than removing
  `inspiring-tereshkova-23d11c` and `peaceful-spence-96b9bc` — they are real
  worktrees and may hold uncommitted work.
