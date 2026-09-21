# Consolidation Step 5 — Retire the Corpus Tier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Per-PR CI checks code and entry data only: the Rebuild and Corpus Audit jobs are gone, every test in the corpus tier that does not need the source data runs in `bun qa`, and the two invariant checks run locally through one script.

**Architecture:** A TypeScript classifier (Appendix A) sorted the 405 tests in the 45 `*.corpus.test.ts` files by whether each one reaches a value built from `data/source/`. Before anything is deleted, its verdicts become a committed inventory of retired checks (Appendix B). Fixed-input tests move into `*.test.ts` files with their bodies byte-identical, which Appendix C checks. Registry order's static half moves to the unit tier, with its classification sets extracted into a shared module. Gershayim's eight real-entry fixtures become a committed JSONL file. `test-tiers.test.ts` gains a guard that every remaining corpus file is run by `transform:invariants` or awaits the step-6 archive.

**Tech Stack:** Bun 1.3.14, TypeScript (compiler API for the appendix scripts), `bun:test`, Biome, GitHub Actions YAML, jq.

**Spec:** `docs/specs/2026-09-13-pipeline-consolidation-design.md` §5.1, §5.3, §8, §10, §11 step 5.

## Measured baseline (at `03167f0d`)

| Measure | Value |
|---|---|
| unit tier, `bun qa:test` | 1,421 pass, 0 fail, 91 files, 1.93 s |
| corpus tier | 45 files, 405 tests: 217 reach source data, 188 do not |
| CI jobs in `ci-lint.yml` | `quality`, `rebuild`, `corpus`, `corpus-audit`, `dependency-review` |

The spec's "~190 hand-written example tests" was a grep estimate. The classifier replaces it:

| Disposition | Tests | What happens |
|---|---:|---|
| moved | 182 | body unchanged, into a `*.test.ts` (29 of them from the two invariant files) |
| converted | 11 | `rules/gershayim`: bodies unchanged, their eight real entries read from a committed fixture instead of the snapshot |
| kept | 11 | stay in `transform/commutation.corpus.test.ts` (1) and `transform/registry.order.corpus.test.ts` (10) |
| research | 10 | `research/residue-sweep.corpus.test.ts` (9), `body/implied-one-census.corpus.test.ts` (1): untouched, run by nothing, archived with their code in step 6 |
| deleted | 191 | listed in `docs/v2/retired-corpus-checks.md` before removal |

**Controls already run on the classifier.**

- **Positive:** `rules/section-break.corpus.test.ts` reads the corpus in all 5 tests; the classifier reports 5 corpus.
- **Over-reach:** a re-run seeded only by `corpus-fixture.ts` flips 8 verdicts. All 8 were read by hand:
  - `body/labels.corpus.test.ts:165` reads `body/fixtures/*.jsonl`, not source data. It is **moved**; the inventory script special-cases it.
  - `rules/headword.corpus.test.ts:53–228` (7 tests) read `headword-census.ts`, which walks all 32,512 entries. Correctly corpus.
- **Wrong way round:** `patch/apply.corpus.test.ts:167` never reads source data, but it pins 190 patches and 2,800 manifest records. It is a count pin and is **deleted**.
- **Rid-picked fixtures:** `rules/gershayim.corpus.test.ts:123–294` read eight named rids out of the snapshot. That is a corpus read, but the tests are examples, so they are **converted** (Task 4).
- **Byte-identity checker:** Appendix C reported 22 same on an unchanged file, and 2 changed after two planted one-character edits.

## Global Constraints

- **No data changes.** No file under `data/` changes. `registry.ts` and every rule module change in comments only.
- **Moved tests are byte-identical.** For every destination file, Appendix C prints `0 changed`. The only `new` test in the whole plan is `registry order > parenAltHeadword runs STRICTLY BEFORE phraseAltHeadwordStub` (Task 2), plus the tier guard in `test-tiers.test.ts` (Task 8), which Appendix C is not run on.
- **Unit tier at the end:** `bun qa:test` → `1616 pass`, `0 fail` (1,421 + 182 moved + 11 converted + 1 direction pin + 1 tier guard), under 3 s.
- **Corpus tier at the end:** exactly 4 `*.corpus.test.ts` files holding 21 tests.
- **Grep with `-a`.** `rules/v-sub-twin.corpus.test.ts` holds a NUL byte, and plain `grep` silently skips such files. Every verification grep uses `git grep -a`.
- **History documents are not edited:** `docs/v2/transform-batch-*.md`, `docs/v2/phase-2-*.md`, `docs/superpowers/plans/*` (except this plan), and `docs/specs/*` (except the consolidation spec). They move to `docs/archive/` in step 6.
- **Never run a bare `bun test`.** It runs every tier. Use `bun qa:test`, a file path, or `bun run transform:invariants`.
- **Every commit:**
  - Run `bun qa` first and commit with `git commit -s`.
  - Subject is `<emoji> <type>(<scope>): <description>`, ≤ 50 chars.
  - Message ends with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- **Branch.** Work on `feat/consolidation-step5` (off `v2` at `03167f0d`; this plan is its first commit). If git reports `could not lock config file`, the sandbox blocked a `.git/config` write: rerun that one command unsandboxed.
- **Appendix scripts.** They are run, never committed. Copy each into the repo root as `.<name>.tmp.ts` (so it resolves `typescript` from `node_modules`), run it, and delete it.

**User decisions (already made):**
- `migrate` is not CI work; per-PR CI never reads the source data (R9, Brian, 2026-09-15).
- The Rebuild job, the Corpus Audit job, the Invariants CI job and `expected-counts.json` are withdrawn (Brian, 2026-09-15).
- Commutation and registry order run locally, before rule-code PRs, through one `package.json` script; not CI (Brian, 2026-09-15).
- Drift and "creates no defect" checks worth keeping become review detectors later, with no pinned number (§5.1, §10; Brian, 2026-09-15).
- Required status checks on `v2` stay deferred (§5.2; Brian, 2026-09-14).

**Plan defaults (not yet confirmed by Brian):**

| # | Default | Why the spec does not already settle it |
|---|---|---|
| D1 | Registry order's 21 static assertions move to the unit tier, with the classification sets in a new `transform/registry-classes.ts`. | §5.1 names the whole file as a local check. It predates the finding that 21 of its 31 tests read only `RULES` and `patterns.jsonl`. Leaving them local takes every direction pin out of CI. |
| D2 | Gershayim's 11 rid-picked tests keep running from a committed 8-entry fixture. | §5.1 moves only tests "that never read the source data". These read eight entries of it, and their header argues a hand-written string cannot stand in. |
| D3 | The two research corpus files stay, run by nothing, until step 6. | §5.3 says research tests "leave with that code (§8)", which is step 6. |
| D4 | The script is named `transform:invariants`. | §8 says only "the invariants runner". Step 10 decides prefixes. |
| D5 | A static direction pin replaces `rules/headword.corpus.test.ts:410`. | `registry.order.corpus.test.ts:895–900` says the paren→phrase direction is pinned only in `headword.corpus.test.ts`; adjacency checks cannot see direction. Deleting it without a replacement loses the pin. |

---

### Task 1: Inventory of retired checks

**Goal:** A committed list of the 191 tests this plan deletes, each linked to its source at `03167f0d` and assigned a kind, written before any corpus file changes.

**Files:**
- Create: `docs/v2/retired-corpus-checks.md`

**Acceptance Criteria:**
- [ ] The Appendix A classifier prints `TOTAL corpus=217 example=188 files=45/45`.
- [ ] Appendix B prints `deleted: 191, research: 10, moved: 182, kept: 11, converted: 11`.
- [ ] `docs/v2/retired-corpus-checks.md` has 191 table rows, and none has the kind `other`.
- [ ] `rules/headword.corpus.test.ts:410` has the kind `order`.

**Verify:** `grep -c '^| \[' docs/v2/retired-corpus-checks.md` → `191`; `grep -c '| other |' docs/v2/retired-corpus-checks.md` → `0`

**Steps:**

- [ ] **Step 1: Classify**

Write Appendix A verbatim to `.classify.tmp.ts` in the repository root, then:

```bash
mkdir -p .work
bun .classify.tmp.ts .work/step5-classify.json | tail -1
```

Expected: `TOTAL corpus=217 example=188 files=45/45`

- [ ] **Step 2: Generate the inventory**

Write Appendix B verbatim to `.inventory.tmp.ts`, then:

```bash
bun .inventory.tmp.ts .work/step5-classify.json 03167f0d
```

Expected: first object `{ deleted: 191, research: 10, moved: 182, kept: 11, converted: 11 }`; last line `wrote docs/v2/retired-corpus-checks.md (191 rows)`.

- [ ] **Step 3: Resolve every `other` row by reading the test**

About 32 rows start as `other`. For each one, open the linked test body and set the kind column:

| Kind | Choose it when the test… |
|---|---|
| `count` | asserts a number or a rid list measured on this export |
| `derived-table` | re-derives a hand-kept table, allowlist or vocabulary from the export and requires it unchanged |
| `no-defect` | asserts a rule creates, loses or leaves no defect, or passes a gate, across the export |
| `order` | shows two rules disagree by registration order |

`rules/headword.corpus.test.ts:410` (`the paren rule must run first, and the orders disagree`) is `order`.

Then pick 10 `count` rows and 5 `no-defect` rows at random, read their bodies, and correct any mislabel. The keyword heuristic is first-match. Update the summary sentence above the table (`191 tests: N count, …`) to the final tallies.

- [ ] **Step 4: Verify and clean up**

```bash
grep -c '^| \[' docs/v2/retired-corpus-checks.md
grep -c '| other |' docs/v2/retired-corpus-checks.md
rm .classify.tmp.ts .inventory.tmp.ts
git status --short
```

Expected: `191`, `0`, and only `?? docs/v2/retired-corpus-checks.md`. Keep `.work/step5-classify.json`: Tasks 5 and 6 use its line ranges.

- [ ] **Step 5: Commit**

```bash
bun qa
git add docs/v2/retired-corpus-checks.md
git commit -s -m "📖 doc(pipeline): inventory retired corpus checks" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Registry order's static assertions into `bun qa`

**Goal:** The 21 registry-order tests that need no source data run in the unit tier, plus one new static pin for the paren→phrase direction. The corpus file keeps only the 10 tests that earn each class over the data.

**Files:**
- Create: `admin/pipeline/transform/registry-classes.ts`
- Create: `admin/pipeline/transform/registry.order.test.ts`
- Modify: `admin/pipeline/transform/registry.order.corpus.test.ts`

**Acceptance Criteria:**
- [ ] `bun test admin/pipeline/transform/registry.order.test.ts` → `22 pass`, `0 fail`.
- [ ] Appendix C on the unit file → `21 same, 0 changed, 1 new`. The one `NEW` is `registry order > parenAltHeadword runs STRICTLY BEFORE phraseAltHeadwordStub`.
- [ ] Appendix C on the corpus file → `10 same, 0 changed, 0 new`.
- [ ] `bun test admin/pipeline/transform/registry.order.corpus.test.ts` → `10 pass`, `0 fail`.
- [ ] The new pin fails when its two ids are swapped (negative control, then reverted).
- [ ] No moved comment says "this file", "below", "above" or "bottom" about something that is now in the other file.

**Verify:** `bun test admin/pipeline/transform/registry.order.test.ts` → `22 pass`

**Steps:**

Line numbers are `registry.order.corpus.test.ts` at `03167f0d`. Take each range from `git show 03167f0d:admin/pipeline/transform/registry.order.corpus.test.ts` so that edits already made do not shift them.

| Base lines | Content | Destination |
|---|---|---|
| 1–119 | module docstring (the four ordering rules and the ten classes) | `registry.order.test.ts` |
| 120–134 | imports | rewritten per file (below) |
| 136–138 | `const catalogue` | `registry.order.test.ts` |
| 140–544 | the eleven class sets (`UNLINK` … `FIELD`) with their comments | `registry-classes.ts` |
| 546–561 | `CLASSES` | `registry-classes.ts` |
| 563–649 | `ids`, `at`, `phaseOf`, `crossPhasePairs`, `lastWithin` | `registry.order.test.ts` |
| 651–1116 | `describe('registry order', …)` | `registry.order.test.ts` |
| 1118–1154 | corpus-pass docstring, `DECLARED`, `MOVED_*` | stays |
| 1156–1243 | `opensRtlSpan`, `extend`, `coverageSignatureIn`, `rtlSpanCoverageOf` | `registry-classes.ts` |
| 1245–1322 | `targetsOf`, `scanned`, `scan`, `byId`, `everDeclared` | stays |
| 1324–1328 | `defOnly` | `registry.order.test.ts` |
| 1330–1381 | `describe('the rtl coverage signature', …)` | `registry.order.test.ts` |
| 1383–1613 | `describe('the classification is earned, not declared', …)` | stays |

- [ ] **Step 1: Write the new direction pin first, in place, and watch it pass on today's order**

Insert after the test `holamMaterMigration runs STRICTLY BEFORE shinSinDotRestore` (base line 775) in `registry.order.corpus.test.ts`:

```ts
	// THE FIFTH DIRECTION PIN, moved here from the retired
	// `rules/headword.corpus.test.ts:410` (consolidation step 5), which
	// held it in the shape of the corpus disagreement: composed
	// paren-first the phrase rule fires 236 times, phrase-first 235
	// (`B00780`, `A02403`; `registry.ts` carries the mechanism). The pair
	// is declared `entangledWith`, so rule 2 requires them adjacent, and
	// adjacency is direction-blind. This is what holds the direction.
	it('parenAltHeadword runs STRICTLY BEFORE phraseAltHeadwordStub', () => {
		expect(at('parenthesized-alt-headword')).toBeLessThan(
			at('phrase-alt-headword-stub'),
		);
	});
```

Run: `bun test admin/pipeline/transform/registry.order.corpus.test.ts -t 'parenAltHeadword'`
Expected: `1 pass`. Measured at `03167f0d`, the two ids sit at indices 35 and 36, both in `text-repairs`.

- [ ] **Step 2: Negative control**

Swap the two ids in the new test's `expect`, run the same command, and confirm `1 fail`. Swap them back and confirm `1 pass`.

- [ ] **Step 3: Create `admin/pipeline/transform/registry-classes.ts`**

Header and imports:

```ts
/**
 * The registry's rule classes, shared by the two halves of the
 * registry-order check.
 *
 * `registry.order.test.ts` (unit tier) asserts the ORDER the classes
 * imply: every registered rule is classified, unlink rules precede the
 * rules that read a neighbour's target, and the direction pins.
 * `registry.order.corpus.test.ts` (run by `bun run
 * transform:invariants`) EARNS membership over all 32,512 entries: a
 * rule is in `UNLINK` because it removes an anchor there, not because
 * a comment says so.
 *
 * Split out of `registry.order.corpus.test.ts` in consolidation step 5,
 * so that the order assertions run on every `bun qa` without reading
 * the source data.
 */
import type { SourceEntry } from '../body/types.ts';
import type { TagToken } from './html.ts';
import { DIR_RTL, opensScope, tokenize } from './html.ts';
import { fieldsOf } from './no-new-text.ts';
```

Then paste base lines 140–561 and 1156–1243 verbatim, and end with:

```ts
export {
	CLASSES,
	CORROBORATE,
	coverageSignatureIn,
	FIELD,
	GLYPH,
	MINT,
	NEITHER,
	POINT,
	RESTORE,
	RETARGET,
	rtlSpanCoverageOf,
	UNLINK,
	VOUCH,
	WRAP,
};
```

If `bun qa:lint` reports an import in this file as unused, delete that import. If it reports `opensRtlSpan` or `extend` as needed elsewhere, export them.

- [ ] **Step 4: Create `admin/pipeline/transform/registry.order.test.ts`**

1. Paste base lines 1–119 (docstring). In its last paragraph, change "The corpus pass at the bottom of this file makes membership" to "`registry.order.corpus.test.ts` makes membership", and add a final paragraph:

```ts
 *
 * The sets themselves live in `registry-classes.ts`, shared with that
 * corpus file. Everything here reads only `RULES` and
 * `data/patches/patterns.jsonl`, so it runs on every `bun qa`.
```

2. Imports:

```ts
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { parsePatterns } from '../research/patterns.ts';
import {
	CLASSES,
	CORROBORATE,
	coverageSignatureIn,
	MINT,
	RETARGET,
	rtlSpanCoverageOf,
	UNLINK,
	WRAP,
} from './registry-classes.ts';
import {
	checkAdjacency,
	entangledClusters,
	RULES,
	unaccountedEdges,
} from './registry.ts';
```

3. Then paste, in this order:
   - base 136–138 (`catalogue`);
   - base 563–649;
   - base 651–1116, with Step 1's new test;
   - base 1324–1328 (`defOnly`);
   - base 1330–1381.

   Add or remove named imports until `bun qa:tsc` and `bun qa:lint` are clean. The classes the describe block names are the source of truth for that list.

- [ ] **Step 5: Strip the corpus file**

Delete from `registry.order.corpus.test.ts` everything that Step 4 moved, plus base 140–561 and 1156–1243. Replace base lines 1–119 with:

```ts
/**
 * Registry order's classes, EARNED over the corpus.
 *
 * `registry.order.test.ts` asserts the order the classes in
 * `registry-classes.ts` imply. This file is the other half: one pass
 * over all 32,512 entries records what every rule actually declares
 * and moves, and requires each class to be exactly the rules that
 * behave that way. A rule in the wrong class would let an ordering
 * assertion pass while saying nothing about it.
 *
 * It reads the source data, so it is not CI work (consolidation spec
 * R9). Run it with `bun run transform:invariants` before a PR that
 * registers, reclassifies or reorders a rule.
 */
```

Import the sets and the rtl helpers the remaining code uses from `./registry-classes.ts`. Delete imports that `bun qa:lint` reports unused.

- [ ] **Step 6: Fix stale positional references**

```bash
git grep -a -n -E 'this file|below|above|bottom' -- admin/pipeline/transform/registry-classes.ts admin/pipeline/transform/registry.order.test.ts admin/pipeline/transform/registry.order.corpus.test.ts
```

For each hit, check whether the thing it points at is still where the comment says. If it is not, name the file (for example "the corpus pass in `registry.order.corpus.test.ts`"). Comments only; Appendix C compares test calls, not comments.

- [ ] **Step 7: Verify**

Write Appendix C verbatim to `.verify-moves.tmp.ts` in the repository root, then:

```bash
bun qa:tsc && bun qa:lint
bun test admin/pipeline/transform/registry.order.test.ts
bun .verify-moves.tmp.ts 03167f0d admin/pipeline/transform/registry.order.test.ts admin/pipeline/transform/registry.order.corpus.test.ts
bun .verify-moves.tmp.ts 03167f0d admin/pipeline/transform/registry.order.corpus.test.ts admin/pipeline/transform/registry.order.corpus.test.ts
bun test admin/pipeline/transform/registry.order.corpus.test.ts
```

Expected, in order:
- clean;
- `22 pass`;
- `NEW registry order > parenAltHeadword runs STRICTLY BEFORE phraseAltHeadwordStub` then `21 same, 0 changed, 1 new`;
- `10 same, 0 changed, 0 new`;
- `10 pass` (about 4 minutes).

Keep `.verify-moves.tmp.ts` until Task 6; it is untracked, so do not `git add` it.

- [ ] **Step 8: Commit**

```bash
bun qa
git add admin/pipeline/transform/registry-classes.ts admin/pipeline/transform/registry.order.test.ts admin/pipeline/transform/registry.order.corpus.test.ts
git commit -s -m "🌈 improve(pipeline): run static registry order in qa" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Commutation helper tests into `bun qa`

**Goal:** The 8 tests of `changingRids` and `nonCommutingPairs` over hand-built entries run in the unit tier. The corpus file keeps only the registry-wide commutation gate.

**Files:**
- Create: `admin/pipeline/transform/commutation.test.ts`
- Modify: `admin/pipeline/transform/commutation.corpus.test.ts`

**Acceptance Criteria:**
- [ ] `bun test admin/pipeline/transform/commutation.test.ts` → `8 pass`, `0 fail`.
- [ ] Appendix C → `8 same, 0 changed, 0 new` (unit file), and `1 same, 0 changed, 0 new` (corpus file).
- [ ] `bun test admin/pipeline/transform/commutation.corpus.test.ts` → `1 pass`, `0 fail`.

**Verify:** `bun test admin/pipeline/transform/commutation.test.ts` → `8 pass`

**Steps:**

- [ ] **Step 1: Create `commutation.test.ts`**

It is base lines 13–207 of `commutation.corpus.test.ts` (the `entryOf` … `wrapHebrew` / `silentRewrite` fixtures and the three `describe` blocks), under these imports:

```ts
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import {
	changingRids,
	nonCommutingPairs,
	type PairStats,
} from './commutation.ts';
import type { Rule, TransformResult } from './types.ts';
```

- [ ] **Step 2: Strip the corpus file**

Delete base lines 13–207 from `commutation.corpus.test.ts`. Its imports become:

```ts
import { describe, expect, it } from 'bun:test';
import { parsePatterns } from '../research/patterns.ts';
import { nonCommutingPairs, type PairStats } from './commutation.ts';
import { ORDERED, RULES } from './registry.ts';
import { sourceEntries } from './rules/corpus-fixture.ts';
```

In the retained gate's comment at base lines 330–336, replace "registering a rule additionally needs `bun run audit:corpus`" with "registering a rule additionally needs `bun run transform:invariants`".

- [ ] **Step 3: Verify**

```bash
bun qa:tsc && bun qa:lint
bun test admin/pipeline/transform/commutation.test.ts
bun .verify-moves.tmp.ts 03167f0d admin/pipeline/transform/commutation.test.ts admin/pipeline/transform/commutation.corpus.test.ts
bun .verify-moves.tmp.ts 03167f0d admin/pipeline/transform/commutation.corpus.test.ts admin/pipeline/transform/commutation.corpus.test.ts
bun test admin/pipeline/transform/commutation.corpus.test.ts
```

Expected: clean; `8 pass`; `8 same, 0 changed, 0 new`; `1 same, 0 changed, 0 new`; `1 pass` (about 4 minutes).

- [ ] **Step 4: Commit**

```bash
bun qa
git add admin/pipeline/transform/commutation.test.ts admin/pipeline/transform/commutation.corpus.test.ts
git commit -s -m "🌈 improve(pipeline): unit-test commutation helpers" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Gershayim fixtures from a committed file

**Goal:** The 11 gershayim tests over eight real entries, and the file's 2 fixed-input tests, run in the unit tier from a committed 8-line JSONL file. The file's 5 corpus measurements are deleted.

**Files:**
- Create: `admin/pipeline/transform/rules/fixtures/gershayim.jsonl`
- Create: `admin/pipeline/transform/rules/gershayim.test.ts`
- Delete: `admin/pipeline/transform/rules/gershayim.corpus.test.ts`

**Acceptance Criteria:**
- [ ] The fixture holds exactly 8 lines, whose `.rid` values are `A00000 A00009 A00253 A00692 B00752 C01225 M01940 U01408` in that order. Each line is byte-identical to its line in `data/source/jastrow-dictionary.jsonl`.
- [ ] `bun test admin/pipeline/transform/rules/gershayim.test.ts` → `13 pass`, `0 fail`.
- [ ] Appendix C → `13 same, 0 changed, 0 new`.
- [ ] `gershayim.test.ts` carries no corpus signal; `admin/pipeline/test-tiers.test.ts` passes.

**Verify:** `bun test admin/pipeline/transform/rules/gershayim.test.ts` → `13 pass`

**Steps:**

- [ ] **Step 1: Extract the fixture**

```bash
mkdir -p admin/pipeline/transform/rules/fixtures
grep -a -E '"rid":"(A00000|A00009|A00253|A00692|B00752|C01225|M01940|U01408)"' data/source/jastrow-dictionary.jsonl > admin/pipeline/transform/rules/fixtures/gershayim.jsonl
wc -l < admin/pipeline/transform/rules/fixtures/gershayim.jsonl
jq -r .rid admin/pipeline/transform/rules/fixtures/gershayim.jsonl | tr '\n' ' '
```

Expected: `8`, then `A00000 A00009 A00253 A00692 B00752 C01225 M01940 U01408`. If the count is not 8, a rid string also matched inside another line: stop and report it. Do not hand-edit the file.

- [ ] **Step 2: Create `gershayim.test.ts` from the corpus file**

```bash
git mv admin/pipeline/transform/rules/gershayim.corpus.test.ts admin/pipeline/transform/rules/gershayim.test.ts
```

Then, in `gershayim.test.ts`:

1. Delete the five corpus tests and the comment blocks directly above each: base ranges 296–585. That is everything after `every fixture clears all three gates, in both orders`, which ends at base line 294.
2. Replace the docstring (base 1–34) with:

```ts
/**
 * The gershayim pair, FIXTURE TIER.
 *
 * Every fixture is a REAL entry, because each one is here for a
 * property of the data that a hand-written string could not witness:
 * `B00752` and `C01225` are damaged anchors carrying no `dir`
 * attribute, `A00253` and `U01408` put two abbreviations in one token,
 * `M01940` sets a combining dot between the letter and the quote, and
 * `A00692` is on the decline register — a minority slot the rule
 * corrects in place and does not move. Writing those shapes by hand
 * would test the predicate against the author's memory of the data
 * rather than against the data.
 *
 * The eight entries are frozen, byte for byte, in
 * `fixtures/gershayim.jsonl` (extracted from the 2026-07-04 export in
 * consolidation step 5), so this file runs on every `bun qa` without
 * reading the source data. The corpus measurements it used to carry —
 * the locus partition, the link-integrity census, order-freedom over
 * every entry — are listed in `docs/v2/retired-corpus-checks.md`.
 */
```

3. Replace `import { sourceEntries } from './corpus-fixture.ts';` with `import { readSourceEntries } from '../../body/source.ts';`.
4. Replace the loader (base lines 65–73) with:

```ts
const FIXTURE_PATH = `${import.meta.dir}/fixtures/gershayim.jsonl`;

const FIXTURES = new Map<string, SourceEntry>();
for await (const source of readSourceEntries(FIXTURE_PATH)) {
	FIXTURES.set(source.rid, source);
}
```

5. Delete imports `bun qa:lint` reports unused. The deleted tests used `redundantOuterRtl`, `bareRtlHebrew`, `latinTokenInsideRtl` and `Anchor`; check each before deleting it.

- [ ] **Step 3: Verify**

```bash
bun qa:tsc && bun qa:lint
bun test admin/pipeline/transform/rules/gershayim.test.ts
bun .verify-moves.tmp.ts 03167f0d admin/pipeline/transform/rules/gershayim.test.ts admin/pipeline/transform/rules/gershayim.corpus.test.ts
bun test admin/pipeline/test-tiers.test.ts
```

Expected: clean; `13 pass`; `13 same, 0 changed, 0 new`; `3 pass`.

- [ ] **Step 4: Commit**

```bash
bun qa
git add admin/pipeline/transform/rules/fixtures/gershayim.jsonl admin/pipeline/transform/rules/gershayim.test.ts admin/pipeline/transform/rules/gershayim.corpus.test.ts
git commit -s -m "🌈 improve(pipeline): freeze gershayim fixture entries" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Link-rule examples into `bun qa`

**Goal:** The 71 fixed-input tests in five link-rule corpus files run in the unit tier, and those files' 27 corpus tests are deleted.

**Files:**
- Rename + modify: `admin/pipeline/transform/rules/anaphora.corpus.test.ts` → `anaphora.test.ts`
- Rename + modify: `admin/pipeline/transform/rules/geresh.corpus.test.ts` → `geresh.test.ts`
- Rename + modify: `admin/pipeline/transform/rules/misc-links.corpus.test.ts` → `misc-links.test.ts`
- Rename + modify: `admin/pipeline/transform/rules/unlink.corpus.test.ts` → `unlink.test.ts`
- Rename + modify: `admin/pipeline/transform/rules/unlink-nesting.corpus.test.ts` → `unlink-nesting.test.ts`

**Acceptance Criteria:**
- [ ] Each destination passes, and Appendix C reports `0 changed, 0 new` with these `same` counts: anaphora 29, geresh 10, misc-links 15, unlink 16, unlink-nesting 1.
- [ ] No destination imports `corpus-fixture.ts`; `bun test admin/pipeline/test-tiers.test.ts` passes.
- [ ] `bun qa:test` → `1535 pass`, `0 fail`.

**Verify:** `bun qa:test 2>&1 | grep -E '^ *[0-9]+ (pass|fail)'` → `1535 pass`, `0 fail`

**Steps:**

The method is the same for each file; the table gives the numbers. Corpus-test ranges are base (`03167f0d`) lines from `.work/step5-classify.json`.

| File (`transform/rules/`) | Keep | Delete these test ranges |
|---|---:|---|
| `anaphora` | 29 | 356–360, 362–373, 386–404, 420–436, 452–470, 487–517, 537–556, 766–770, 772–779, 781–785, 787–801, 808–826, 871–878, 1150–1154, 1156–1171, 1173–1190, 1192–1206, 1208–1215, 1220–1240, 1291–1315, 1317–1343, 1345–1382 |
| `geresh` | 10 | 282–296, 304–317 |
| `misc-links` | 15 | 327–352, 472–484, 486–498, 512–531 |
| `unlink` | 16 | 265–272 |
| `unlink-nesting` | 1 | 73–94 |

- [ ] **Step 1: For each file, rename, then strip**

1. `git mv admin/pipeline/transform/rules/<name>.corpus.test.ts admin/pipeline/transform/rules/<name>.test.ts`
2. Delete each listed range, bottom-up so that earlier line numbers hold. Take with each range the comment block directly above its `it(`: a comment block that ends on the line before a deleted test belongs to that test.
3. Delete `import { sourceEntries } …` / `composedEntries` / `repairedEntries` from `./corpus-fixture.ts`.
4. Delete every module-level declaration and statement that only deleted tests used. Examples are `censusOnce`, `sightings` and `targumSightings` in `anaphora`, and `unobservedConvention` callers in `unlink`. `bun qa:lint` reports each as unused; `bun qa:tsc` reports anything still referenced. Repeat until both are clean.
5. Where the file's docstring describes a corpus tier or corpus-wide measurement this file no longer makes, rewrite that sentence. Say the measurement was retired in consolidation step 5 and is listed in `docs/v2/retired-corpus-checks.md`.

- [ ] **Step 2: Verify each file**

```bash
for n in anaphora geresh misc-links unlink unlink-nesting; do
  bun .verify-moves.tmp.ts 03167f0d admin/pipeline/transform/rules/$n.test.ts admin/pipeline/transform/rules/$n.corpus.test.ts
  bun test admin/pipeline/transform/rules/$n.test.ts 2>&1 | grep -E '^ *[0-9]+ (pass|fail)'
done
bun test admin/pipeline/test-tiers.test.ts
bun qa:test 2>&1 | grep -E '^ *[0-9]+ (pass|fail)'
```

Expected: `29 same`, `10 same`, `15 same`, `16 same`, `1 same`, each with `0 changed, 0 new` and a matching `N pass` / `0 fail`; test-tiers `3 pass`; `1535 pass`, `0 fail`.

- [ ] **Step 3: Commit**

```bash
bun qa
git add -A admin/pipeline/transform/rules/
git commit -s -m "🌈 improve(pipeline): unit-test link rule examples" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Remaining examples into `bun qa`

**Goal:** The last 80 fixed-input tests leave the corpus tier: 79 from seven files, and 1 appended to an existing unit file. Those files' 32 corpus tests are deleted.

**Files:**
- Rename + modify: `admin/pipeline/transform/rules/italic-period.corpus.test.ts` → `italic-period.test.ts`
- Rename + modify: `admin/pipeline/transform/rules/punct-seams.corpus.test.ts` → `punct-seams.test.ts`
- Rename + modify: `admin/pipeline/transform/rules/stranded-tail.corpus.test.ts` → `stranded-tail.test.ts`
- Rename + modify: `admin/pipeline/transform/rules/nested-anchor.corpus.test.ts` → `nested-anchor.test.ts`
- Rename + modify: `admin/pipeline/body/labels.corpus.test.ts` → `labels.test.ts`
- Rename + modify: `admin/pipeline/transform/abbrev-vocab.corpus.test.ts` → `abbrev-vocab.test.ts`
- Rename + modify: `admin/pipeline/transform/rules/plural-capture.corpus.test.ts` → `plural-capture.test.ts`
- Modify: `admin/pipeline/transform/rules/sense-marker.test.ts` (append one test)
- Delete: `admin/pipeline/transform/rules/sense-marker.corpus.test.ts`

**Acceptance Criteria:**
- [ ] Appendix C reports `0 changed, 0 new` with these `same` counts: italic-period 19, punct-seams 18, stranded-tail 14, nested-anchor 13, labels 10, abbrev-vocab 4, plural-capture 1, sense-marker 12 (11 existing + 1 appended).
- [ ] Each destination passes; `labels.test.ts` finishes in under 0.2 s.
- [ ] `bun qa:test` → `1615 pass`, `0 fail`.

**Verify:** `bun qa:test 2>&1 | grep -E '^ *[0-9]+ (pass|fail)'` → `1615 pass`, `0 fail`

**Steps:**

| File | Keep | Delete these base test ranges |
|---|---:|---|
| `transform/rules/italic-period` | 19 | 283–309 |
| `transform/rules/punct-seams` | 18 | 325–331, 335–341, 352–361, 369–373 |
| `transform/rules/stranded-tail` | 14 | 241–278 |
| `transform/rules/nested-anchor` | 13 | 161–265, 274–291 |
| `body/labels` | 10 | 134–149 (keep 165–173, the fixture sweep) |
| `transform/abbrev-vocab` | 4 | 55–67 |
| `transform/rules/plural-capture` | 1 | 210–218, 236–243, 273–281 |

- [ ] **Step 1: The seven renames**

Apply Task 5 Step 1's method (rename, delete ranges bottom-up with their comment blocks, drop corpus imports and orphaned declarations until lint and tsc are clean, fix the docstring) to each row above. File-specific notes:

- `body/labels`: `EXPECTED_QUARANTINE`'s drift check lived in the deleted corpus sweep. Keep `checkLabel` and `checkAllLabels`, which the fixture sweep uses. `walkSenses` stays imported from `./census.ts`, which Task 10 records for step 6.
- `transform/abbrev-vocab`: delete `pinned`, `onPinnedSnapshot` and the `computeSnapshot`/`LOCK_PATH`/`parseLock` import with the deleted test. Rewrite the docstring above them to say the re-derivation was retired.
- `transform/rules/plural-capture`: the kept test is `has no v2 destination to be repaired into`; keep `TIMEOUT`. Delete the census, `measured` and `memo`.

- [ ] **Step 2: Append to `sense-marker.test.ts`**

Copy base lines 270–297 of `sense-marker.corpus.test.ts` (the `// ---- 7.` heading through the end of `records the deleted entanglement edge as deleted`) to the end of `admin/pipeline/transform/rules/sense-marker.test.ts`. Add `import { parsePatterns } from '../../research/patterns.ts';` in sorted position. Then:

```bash
git rm admin/pipeline/transform/rules/sense-marker.corpus.test.ts
```

- [ ] **Step 3: Verify**

```bash
C=admin/pipeline
for p in transform/rules/italic-period transform/rules/punct-seams transform/rules/stranded-tail transform/rules/nested-anchor body/labels transform/abbrev-vocab transform/rules/plural-capture; do
  bun .verify-moves.tmp.ts 03167f0d $C/$p.test.ts $C/$p.corpus.test.ts
  bun test $C/$p.test.ts 2>&1 | grep -E '^ *[0-9]+ (pass|fail)|Ran '
done
bun .verify-moves.tmp.ts 03167f0d $C/transform/rules/sense-marker.test.ts $C/transform/rules/sense-marker.corpus.test.ts $C/transform/rules/sense-marker.test.ts
bun test $C/transform/rules/sense-marker.test.ts 2>&1 | grep -E '^ *[0-9]+ (pass|fail)'
bun qa:test 2>&1 | grep -E '^ *[0-9]+ (pass|fail)'
rm .verify-moves.tmp.ts
```

Expected:
- `same` counts 19, 18, 14, 13, 10, 4, 1, each `0 changed, 0 new` with matching passes;
- `labels.test.ts` `Ran 10 tests … [<0.2s]`;
- sense-marker `12 same, 0 changed, 0 new`, `12 pass`;
- `1615 pass`, `0 fail`.

- [ ] **Step 4: Commit**

```bash
bun qa
git add -A admin/pipeline/
git commit -s -m "🌈 improve(pipeline): unit-test remaining examples" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Delete the all-corpus files

**Goal:** The 27 corpus files with no test that runs without the source data are deleted. Their 132 tests are already in the inventory.

**Files:**
- Delete (`admin/pipeline/`): `body/binyan-cleanup.corpus.test.ts`, `body/deletion-baseline.corpus.test.ts`, `body/pipeline-links.corpus.test.ts`, `migrate/gates.corpus.test.ts`, `migrate/headword.corpus.test.ts`, `patch/apply.corpus.test.ts`, `transform/links.corpus.test.ts`
- Delete (`admin/pipeline/transform/rules/`): `anaphora-mint`, `continuation-marker`, `duplication`, `edge-trim`, `geresh-apostrophe`, `gloss-head-rejoin`, `headword`, `holam-mater`, `impossible-dagesh`, `italic-paren`, `malformed-href`, `paren-boundary`, `seam-space`, `section-break`, `see-particle`, `shin-sin`, `stem-section`, `stem`, `unlink-scope`, `v-sub-twin` (each `.corpus.test.ts`)

**Acceptance Criteria:**
- [ ] Exactly 4 `*.corpus.test.ts` files remain: `transform/commutation`, `transform/registry.order`, `research/residue-sweep`, `body/implied-one-census`.
- [ ] Every deleted file's tests appear in `docs/v2/retired-corpus-checks.md` (the counts per file match).
- [ ] `bun qa` passes; `bun qa:test` → `1615 pass`.

**Verify:** `git ls-files '*.corpus.test.ts'` → the 4 files above

**Steps:**

- [ ] **Step 1: Cross-check against the inventory before deleting**

```bash
for f in body/binyan-cleanup body/deletion-baseline body/pipeline-links migrate/gates migrate/headword patch/apply transform/links transform/rules/anaphora-mint transform/rules/continuation-marker transform/rules/duplication transform/rules/edge-trim transform/rules/geresh-apostrophe transform/rules/gloss-head-rejoin transform/rules/headword transform/rules/holam-mater transform/rules/impossible-dagesh transform/rules/italic-paren transform/rules/malformed-href transform/rules/paren-boundary transform/rules/seam-space transform/rules/section-break transform/rules/see-particle transform/rules/shin-sin transform/rules/stem-section transform/rules/stem transform/rules/unlink-scope transform/rules/v-sub-twin; do
  printf '%s %s\n' "$(jq --arg f "admin/pipeline/$f.corpus.test.ts" '[.[]|select(.file==$f)]|length' .work/step5-classify.json)" "$(grep -c "\`$f.corpus.test.ts:" docs/v2/retired-corpus-checks.md)"
done | awk '{ s+=$1; if ($1 != $2) bad++ } END { print s, bad+0 }'
```

Expected: `132 0`. If `.work/step5-classify.json` is gone, rerun Task 1 Step 1 at `03167f0d` in a scratch worktree first.

- [ ] **Step 2: Delete**

```bash
git rm admin/pipeline/body/{binyan-cleanup,deletion-baseline,pipeline-links}.corpus.test.ts \
  admin/pipeline/migrate/{gates,headword}.corpus.test.ts \
  admin/pipeline/patch/apply.corpus.test.ts \
  admin/pipeline/transform/links.corpus.test.ts \
  admin/pipeline/transform/rules/{anaphora-mint,continuation-marker,duplication,edge-trim,geresh-apostrophe,gloss-head-rejoin,headword,holam-mater,impossible-dagesh,italic-paren,malformed-href,paren-boundary,seam-space,section-break,see-particle,shin-sin,stem-section,stem,unlink-scope,v-sub-twin}.corpus.test.ts
git ls-files '*.corpus.test.ts'
```

Expected: the 4 files named in the acceptance criteria.

- [ ] **Step 3: Verify and commit**

```bash
bun qa
bun qa:test 2>&1 | grep -E '^ *[0-9]+ (pass|fail)'
git commit -s -m "🧺 chore(pipeline): delete retired corpus tests" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

Expected: `1615 pass`, `0 fail`.

---

### Task 8: Tier guard, invariants script, CI jobs

**Goal:**
- A test fails if a corpus-tier file is run by nothing without being named as awaiting the archive.
- `bun run transform:invariants` runs the two invariant files.
- `ci-lint.yml` has no Rebuild or Corpus Audit job.

**Files:**
- Modify: `admin/pipeline/test-tiers.test.ts`
- Modify: `package.json`
- Delete: `admin/pipeline/audit-corpus.sh`
- Modify: `.gitignore:33-34`
- Modify: `.github/workflows/ci-lint.yml`

**Acceptance Criteria:**
- [ ] The new test fails, naming both invariant files, before the script exists, and passes after.
- [ ] Negative control: removing `registry.order` from the script makes it fail, naming that file.
- [ ] `bun run transform:invariants` → `11 pass`, `0 fail`; its wall time is recorded for Task 10.
- [ ] Workflow jobs parse as `[ "quality", "dependency-review" ]`.
- [ ] `bun qa:test` → `1616 pass`, `0 fail`.

**Verify:** `bun -e "console.log(Object.keys(Bun.YAML.parse(await Bun.file('.github/workflows/ci-lint.yml').text()).jobs))"` → `[ "quality", "dependency-review" ]`

**Steps:**

- [ ] **Step 1: Write the failing guard**

Append to `admin/pipeline/test-tiers.test.ts`:

```ts
/** Corpus-tier files no script runs. Each is a test of research code
 * and leaves with that code in consolidation step 6 (spec §8); nothing
 * else may join this list. */
const AWAITING_ARCHIVE: ReadonlySet<string> = new Set([
	'admin/pipeline/body/implied-one-census.corpus.test.ts',
	'admin/pipeline/research/residue-sweep.corpus.test.ts',
]);

it('every corpus-tier file is run by transform:invariants or awaits the archive', async () => {
	// CI no longer runs the corpus tier (consolidation spec R9), so a
	// corpus file no script names is a test nobody runs — the failure
	// has to name it.
	const pkg = (await Bun.file('package.json').json()) as {
		scripts: Record<string, string>;
	};
	const script = pkg.scripts['transform:invariants'] ?? '';
	const named = script
		.split(/\s+/u)
		.filter((word) => word.endsWith('.corpus.test.ts'));
	const onDisk = await Array.fromAsync(
		new Bun.Glob('admin/**/*.corpus.test.ts').scan({ cwd: '.', onlyFiles: true }),
	);
	const unrun = onDisk
		.filter((path) => !(named.includes(path) || AWAITING_ARCHIVE.has(path)))
		.sort();
	expect(unrun).toEqual([]);
	// And the other direction: a name that matches no file runs nothing.
	const missing = named.filter((path) => !onDisk.includes(path));
	expect(missing).toEqual([]);
	expect(named.length).toBeGreaterThan(0);
});
```

Run: `bun test admin/pipeline/test-tiers.test.ts`
Expected: `1 fail`. `unrun` lists `admin/pipeline/transform/commutation.corpus.test.ts` and `admin/pipeline/transform/registry.order.corpus.test.ts`.

- [ ] **Step 2: Scripts**

In `package.json`, delete `"audit:corpus": …` and add, in sorted position after `"research:residue"`:

```json
		"transform:invariants": "bun test admin/pipeline/transform/commutation.corpus.test.ts admin/pipeline/transform/registry.order.corpus.test.ts",
```

(`transform:count` sorts before it.) Then:

```bash
git rm admin/pipeline/audit-corpus.sh
```

Delete from `.gitignore` the two lines `# corpus-tier shard logs (admin/pipeline/audit-corpus.sh)` and `corpus-shard-*.log`, and the blank line before them.

Run: `bun test admin/pipeline/test-tiers.test.ts`
Expected: `4 pass`.

- [ ] **Step 3: Negative control**

Delete ` admin/pipeline/transform/registry.order.corpus.test.ts` from the script, run the test, and confirm `1 fail` naming that path. Restore the script and confirm `4 pass`.

- [ ] **Step 4: Update the tier docstring**

In `test-tiers.test.ts`, replace the docstring's second paragraph (base lines 6–12) with:

```ts
 * `bun test` is split in two. The UNIT tier is every `*.test.ts` that
 * does not touch the pinned snapshot; it runs in about two seconds and
 * is CI's `Test` job. The CORPUS tier is every `*.corpus.test.ts`; it
 * loads all 32,512 entries of `data/source/jastrow-dictionary.jsonl`
 * (~41 MB) and takes minutes. It is not CI work (consolidation spec R9):
 * the two invariant checks in it run locally through `bun run
 * transform:invariants`, and the last test below fails on a corpus file
 * that script does not run.
```

In the paragraph at base lines 32–44, replace `census.ts`, `review.ts`, … `research/corpus-inputs.ts` with the same list minus `headword-census.ts` (its only importer is gone). Leave the rest unchanged.

- [ ] **Step 5: CI**

In `.github/workflows/ci-lint.yml`:
- delete the `rebuild:` job with the comment block above it (base lines 59–103);
- delete the `corpus:` job with its comment (105–151);
- delete the `corpus-audit:` job (153–167).

Replace the `Test` comment (base lines 33–35) with:

```yaml
          # Every *.test.ts: code, and validation of every entry data
          # file, in about two seconds. Never reads data/source/
          # (consolidation spec R9); the two invariant checks run
          # locally with `bun run transform:invariants`.
```

Run: `bun -e "console.log(Object.keys(Bun.YAML.parse(await Bun.file('.github/workflows/ci-lint.yml').text()).jobs))"`
Expected: `[ "quality", "dependency-review" ]`

- [ ] **Step 6: Run the invariants once**

```bash
time bun run transform:invariants 2>&1 | grep -E '^ *[0-9]+ (pass|fail)|^real'
```

Expected: `11 pass`, `0 fail`. Write down the `real` time; Task 10 quotes it.

- [ ] **Step 7: Verify and commit**

```bash
bun qa
bun qa:test 2>&1 | grep -E '^ *[0-9]+ (pass|fail)'
git add package.json .gitignore .github/workflows/ci-lint.yml admin/pipeline/test-tiers.test.ts
git commit -s -m "🚦 ci(pipeline): drop corpus and rebuild jobs" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

Expected: `1616 pass`, `0 fail`.

---

### Task 9: Comments that name retired files

**Goal:** No code comment under `admin/` points a reader at a corpus test file that no longer exists, or claims a retired check still runs.

**Files:**
- Modify (comments only; counts at `03167f0d`):
  - `admin/pipeline/transform/registry.ts` (36)
  - `admin/pipeline/transform/rules/anaphora.ts` (6)
  - `admin/pipeline/transform/rules/unlink.ts` (5)
  - `admin/pipeline/transform/rules/headword.ts` (4)
  - `admin/pipeline/transform/abbrev-vocab.ts`, `admin/pipeline/transform/types.ts` (3 each)
  - two each: `link-target.ts`, `rules/{duplication,geresh,holam-mater,italic-period,misc-links,nested-anchor,punct-seams,stem-section}.ts`, `rules/headword-census.ts`
  - one each: `commutation.ts`, `gershayim.ts`, `no-lost-text.ts`, `rules/{continuation-marker,edge-trim,impossible-dagesh,italic-paren,paren-boundary,see-particle,sense-marker,shin-sin,stranded-tail,v-sub-twin}.ts`
- Modify (comments only): `admin/pipeline/patch/apply-cli.test.ts`, `admin/pipeline/transform/{gershayim,links,registry}.test.ts`, `admin/pipeline/transform/rules/{duplication,edge-trim,headword,italic-paren,malformed-href,paren-boundary,seam-space,stem-section,v-sub-twin}.test.ts`

**Acceptance Criteria:**
- [ ] The stale-name grep below prints nothing.
- [ ] Every remaining `registry.order.corpus.test.ts` reference is about a class being EARNED over the data. At base those are `registry.ts:120`, `:185`, `:332`. References to a static pin name `registry.order.test.ts`; references to a class set name `registry-classes.ts`.
- [ ] No comment says a retired check runs "on every `bun qa`", "re-derives … and fails", or "is the only thing" that pins something, unless that check still exists.
- [ ] `git diff --stat 03167f0d -- admin/pipeline/transform/registry.ts` shows only comment lines changed (reviewed by eye; `bun qa` passes).

**Verify:** `git grep -a -n -E '[A-Za-z0-9./-]+\.corpus\.test\.ts' -- admin | grep -a -v -E '(commutation|registry\.order|residue-sweep|implied-one-census)\.corpus\.test\.ts|\*\.corpus\.test\.ts'` → no output

**Steps:**

- [ ] **Step 1: List the hits**

```bash
git grep -a -n -E '[A-Za-z0-9./-]+\.corpus\.test\.ts' -- admin | grep -a -v -E '\*\.corpus\.test\.ts'
```

- [ ] **Step 2: Rewrite each hit by what it claims**

| The comment points at… | Rewrite to |
|---|---|
| a test that moved (Tasks 2–6) | the new `*.test.ts` path |
| a static registry-order pin (direction, unlink-before-retarget, cluster set, `unaccountedEdges`, "rule 1/4", "last text-repairs rule") | `registry.order.test.ts` |
| a registry class set's definition | `registry-classes.ts` |
| a class being earned over all entries | leave `registry.order.corpus.test.ts` |
| a count, rid list or population measured by a deleted test | keep the figure; say it was "measured on the 2026-07-04 export by a corpus check retired in consolidation step 5 (`docs/v2/retired-corpus-checks.md`)" |
| a deleted re-derivation or no-defect check described as running ("re-derives from the live snapshot and fails if it drifts", "on every `bun qa`") | past tense, plus: "It no longer runs; on a new export this is a review-detector candidate (consolidation spec §10), listed in `docs/v2/retired-corpus-checks.md`." |
| the paren→phrase direction (`registry.ts:935`, `registry.order.corpus.test.ts:895–900` at base, now in `registry.order.test.ts`) | "pinned by the direction test in `registry.order.test.ts`; the disagreement (236 vs 235) was measured by `rules/headword.corpus.test.ts:410`, retired in consolidation step 5" |
| a sibling-file header ("the corpus tier lives in `X.corpus.test.ts`") | "The corpus tier this file was split from was retired in consolidation step 5; its checks are listed in `docs/v2/retired-corpus-checks.md`." |

Two special cases:
- **`research/residue-sweep.ts`**: leave its two references. That corpus file still exists until step 6.
- **`rules/headword-census.ts`**: its references stay accurate as history (the census's only caller is gone). Add one line to its docstring: "No importer remains after consolidation step 5; archived in step 6 (spec §8)."

- [ ] **Step 3: Verify**

```bash
git grep -a -n -E '[A-Za-z0-9./-]+\.corpus\.test\.ts' -- admin | grep -a -v -E '(commutation|registry\.order|residue-sweep|implied-one-census)\.corpus\.test\.ts|\*\.corpus\.test\.ts'
git grep -a -n 'registry.order.corpus.test.ts' -- admin
git grep -a -n -E 'audit:corpus|Corpus Audit' -- admin .github package.json
bun qa
```

Expected:
- first command: no output;
- second: only earned-class references (`registry.ts` 3 lines, plus `registry-classes.ts`, `registry.order.test.ts`, `test-tiers.test.ts` and `package.json` naming the file);
- third: no output;
- `bun qa` passes.

- [ ] **Step 4: Commit**

```bash
git add -A admin/
git commit -s -m "📖 doc(pipeline): repoint comments at live tests" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 10: Documents, spec amendment, review, PR

**Goal:**
- Contributor docs, the glossary and the spec describe one CI test tier and the local invariants script.
- The spec records what step 5 measured and shipped.
- The branch passes the local review battery and is open as a PR into `v2`.

**Files:**
- Modify: `CONTRIBUTING.md` (Tests section; PR checks line)
- Modify: `.claude/CLAUDE.md` (Test Tiers section)
- Modify: `docs/v2/test-tiers.md` (status block at top)
- Modify: `docs/glossary.md:117,118,130`
- Modify: `docs/specs/2026-09-13-pipeline-consolidation-design.md` (§1, §5.1, §5.3, §8, §10, §11, §12)

**Acceptance Criteria:**
- [ ] `git grep -a -n -E 'audit:corpus|Corpus Audit|Rebuild' -- CONTRIBUTING.md .claude/CLAUDE.md docs/glossary.md` prints only the glossary's retired-terms row.
- [ ] The spec's §11 step 5 reads `*Shipped (#N).*` with the real PR number, and §12 has a step-5 row.
- [ ] The local CodeRabbit review over the whole diff against `v2` has no unaddressed finding.
- [ ] The PR is open against `v2`; its checks include no `Rebuild` and no `Corpus Audit`, and `Lint`, `Type Check` and `Test` pass.

**Verify:** `gh pr view --json baseRefName,statusCheckRollup --jq '.baseRefName, ([.statusCheckRollup[] | select(.name | test("Rebuild|Corpus Audit"))] | length), [.statusCheckRollup[] | select(.name | test("^(Lint|Type Check|Test)$")) | .conclusion]'` → `v2`, `0`, `["SUCCESS","SUCCESS","SUCCESS"]`

**Steps:**

- [ ] **Step 1: `CONTRIBUTING.md`**

Replace the whole `## Tests` section (base lines 72–91) with:

````markdown
## Tests

`bun qa` runs every unit test (`*.test.ts`) in about two seconds, most
of it validating every entry data file. CI's `Test` job runs the same
set, and never reads the source data in `data/source/`.

Two checks of rule *code* need the whole source snapshot and take
several minutes, so they run on your machine rather than in CI:

```bash
bun run transform:invariants
```

Run it before opening a PR that registers a transform rule, changes
what a rule matches, or reorders `admin/pipeline/transform/registry.ts`.
It checks that rules editing the same text have a declared, justified
order (commutation) and that each rule's class is earned over the data
(registry order).

A test that reads the source snapshot MUST be named `*.corpus.test.ts`,
MUST take its entries from
`admin/pipeline/transform/rules/corpus-fixture.ts`, and MUST be added to
`transform:invariants`; `admin/pipeline/test-tiers.test.ts` fails the
build otherwise. An example built from real entries belongs in a
`*.test.ts` with the entries in a committed fixture file.
````

In `## Pull Requests`, change `(`Lint`, `Type Check`, `Test`, `Corpus Audit`)` to `(`Lint`, `Type Check`, `Test`)`.

- [ ] **Step 2: `.claude/CLAUDE.md`**

Replace the `## Test Tiers` section with the following, using Task 8 Step 6's measured time in place of `<M>`, rounded up to whole minutes:

```markdown
## Test Tiers

`bun test` is split by filename, and the split is enforced by
`admin/pipeline/test-tiers.test.ts`.

| Tier | Files | Command | Where | Cost |
|---|---|---|---|---|
| Unit | `*.test.ts` | `bun qa:test` | `bun qa`; CI `Test` | ~2 s |
| Invariants | `transform/{commutation,registry.order}.corpus.test.ts` | `bun run transform:invariants` | local, before rule-code PRs | ~<M> min |

Per-PR CI never reads `data/source/` (consolidation spec R9). Registering,
reclassifying or reordering a transform rule needs
`bun run transform:invariants` run locally — `bun qa` cannot see it.
A new corpus-reading test must be added to that script. Two research
corpus files (`residue-sweep`, `implied-one-census`) run nowhere and
leave in step 6.
```

- [ ] **Step 3: `docs/v2/test-tiers.md`**

Insert directly under the `# The two test tiers` heading:

```markdown
> **Superseded 2026-09-15 by consolidation step 5**
> ([spec §5](../specs/2026-09-13-pipeline-consolidation-design.md)).
> The corpus tier is no longer CI work. Its 193 tests that do not need
> the source data moved to the unit tier; the 191 that do were deleted
> and are listed in [`retired-corpus-checks.md`](retired-corpus-checks.md);
> the two invariant checks run locally with `bun run transform:invariants`.
> What follows is the 2026-08-31 record, kept as history.
```

- [ ] **Step 4: `docs/glossary.md`**

Replace line 117's second cell with: `a test of rule *code* that needs the whole snapshot: commutation, and registry order's classes earned over the data. Run locally with \`bun run transform:invariants\` before rule-code PRs; not CI. Registry order's static assertions run in \`bun qa\``

Replace line 118's second cell with: `retired by spec step 5. What is still named \`*.corpus.test.ts\` is the two invariant checks and two research files that leave in step 6`

Replace line 130's second cell with: `withdrawn 2026-09-15 (spec R9); removed from CI in spec step 5`

- [ ] **Step 5: Spec amendment**

In `docs/specs/2026-09-13-pipeline-consolidation-design.md`:

1. **§1 table, "Corpus test tier" row.** Append: ` **Measured 2026-09-15 (step 5):** 405 tests; 182 read no source data and 11 read eight fixed entries, so 193 moved to the unit tier; 191 were deleted and 21 remain (plan \`docs/superpowers/plans/2026-09-15-consolidation-step5.md\`, which also records the classifier and its controls)`
2. **§5.1 table, "hand-written example tests" row, "Verifies/Where" text.** Replace `About 190 of them live today inside \`*.corpus.test.ts\` files and move to \`*.test.ts\`` with `193 of them lived inside \`*.corpus.test.ts\` files and moved to \`*.test.ts\` in step 5; 11 of those run on eight real entries frozen in \`transform/rules/fixtures/gershayim.jsonl\``
3. **§5.1 table, "commutation and registry order" row.**
   - Replace its "Where it runs" cell with `run locally, by choice, before a PR that changes rule code or registry order: \`bun run transform:invariants\`; not CI. Each reads the source data and takes 3–4 min. Registry order's static assertions (every rule classified, the direction pins, cluster spans) read no data and run in \`bun qa\` from \`transform/registry.order.test.ts\`, sharing \`transform/registry-classes.ts\` with the corpus half`.
   - Also change that row's first cell to `commutation and registry order's earned classes (\`transform/commutation.corpus.test.ts\`, \`transform/registry.order.corpus.test.ts\`)`.
4. **§5.1, paragraph after "Withdrawn 2026-09-15".** Append the sentence: `Step 5 deleted 191 such tests; each is listed with its kind (count, derived-table, no-defect, order) in \`docs/v2/retired-corpus-checks.md\`, which is where that detector work starts.`
5. **§5.3.** Append: `Two corpus files test research code (\`research/residue-sweep\`, \`body/implied-one-census\`); nothing runs them after step 5, and they leave with that code in step 6. \`test-tiers.test.ts\` fails on any other corpus file \`transform:invariants\` does not run.`
6. **§8 table.** Add a row:

```markdown
| `transform/rules/headword-census.ts`; `walkSenses` in `body/census.ts` | archive with the research code | `headword-census.ts` lost its only importer in step 5. `body/labels.test.ts` still imports `walkSenses` from `census.ts`: move that generator next to `labels.ts` before archiving `census.ts` |
```

7. **§10, "Drift and 'creates no defect' checks" row, owner cell.** `ad hoc, one per PR; start from \`docs/v2/retired-corpus-checks.md\``
8. **§11 step 5.** Prefix the step with `*Shipped (this PR).*` and leave its text unchanged.
9. **§12.** Add a row:

```markdown
| 2026-09-15 | Step 5: Rebuild and Corpus Audit jobs removed; 193 corpus-tier tests moved to the unit tier (182 fixed-input, 11 on a committed gershayim fixture), 191 deleted and inventoried in `docs/v2/retired-corpus-checks.md`; registry order split so its static assertions run in `bun qa`; paren→phrase direction pinned statically; `transform:invariants` script and tier guard added; §1, §5.1, §5.3, §8, §10 amended |
```

- [ ] **Step 6: Verify docs and commit**

```bash
bun qa
git grep -a -n -E 'audit:corpus|Corpus Audit|Rebuild' -- CONTRIBUTING.md .claude/CLAUDE.md docs/glossary.md
git add CONTRIBUTING.md .claude/CLAUDE.md docs/v2/test-tiers.md docs/glossary.md docs/specs/2026-09-13-pipeline-consolidation-design.md
git commit -s -m "📖 doc(pipeline): one CI test tier, local invariants" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

Expected: the grep prints only `docs/glossary.md:130`.

- [ ] **Step 7: Local review battery**

Cloud CodeRabbit is skipped on this repository, so the local review is the only one.
1. `git fetch origin` (unsandboxed if DNS is blocked), then confirm `git log --oneline origin/v2..HEAD` lists only this branch's commits.
2. Run the `coderabbit:code-review` skill over the whole diff against `origin/v2`.
3. Fix or answer every finding, `bun qa` after each fix, and commit fixes as `🦠 fix(pipeline): …`.

- [ ] **Step 8: Push and open the PR**

```bash
git push -u origin feat/consolidation-step5
gh pr create --base v2 --title "🧺 chore(pipeline): retire the corpus test tier" --body-file "$TMPDIR/pr-body.md"
```

`$TMPDIR/pr-body.md`:

```markdown
Consolidation spec §11 step 5 (R9: `migrate` is not CI work).

- Removes the Rebuild and Corpus Audit CI jobs.
- Moves 193 corpus-tier tests that need no source data into `bun qa`
  (bodies byte-identical, checked by script); 11 of them read eight
  real entries from a committed fixture.
- Deletes 191 tests that pinned measurements of one export, after
  listing each in `docs/v2/retired-corpus-checks.md` for the §10
  review-detector work.
- Splits registry order so its static assertions run in `bun qa`,
  and adds a static paren→phrase direction pin that the deleted
  `headword.corpus.test.ts:410` used to hold.
- Adds `bun run transform:invariants` and a tier guard that fails on
  a corpus file nothing runs.

Unit tier: 1,421 → 1,616 tests. Corpus tier: 45 files → 4.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Then replace `*Shipped (this PR).*` in spec §11 with `*Shipped (#N).*` using the number `gh` printed, `bun qa`, commit `📖 doc(pipeline): record step 5 PR number`, and push.

- [ ] **Step 9: Check CI**

Once the checks finish, run the **Verify** command above.
Expected: `v2`, `0`, `["SUCCESS","SUCCESS","SUCCESS"]`. Other checks (CodeQL, Scorecard, Dependency Review, SonarCloud) report as usual. If one of them fails, read its log before calling it pre-existing.

---

## Appendix A: `classify.ts`

Run from the repository root as `.classify.tmp.ts`. Verified at `03167f0d`: `TOTAL corpus=217 example=188 files=45/45`; with `MIN_SEEDS=1`, `corpus=209 example=196`.

```ts
/**
 * classify.ts OUT_JSON — run from the repository root.
 *
 * For every it()/test() in every tracked *.corpus.test.ts: does its
 * callback reach a value derived from the source data ("corpus"), or is
 * it an example over a fixed input? Writes one row per test to OUT_JSON
 * and prints a per-file tally.
 *
 * Seeds: names imported from a module in CORPUS_MODULES (each reads the
 * snapshot on a no-argument path); any `readSourceEntries()` call with
 * no argument; `SOURCE_PATH`. Propagation, to a fixpoint: a declaration
 * whose initializer or body references a seeded name is seeded; a
 * statement outside a test callback that references one seeds the local
 * variables it MUTATES (assignment, ++/--, .push/.set/.add/...).
 *
 * Known over-reach: importing a pure helper from a CORPUS_MODULES file
 * seeds it (`labels.corpus.test.ts:165` via `census.ts`'s `walkSenses`).
 * Re-run with MIN_SEEDS=1 (only corpus-fixture.ts) and read every test
 * whose verdict flips.
 */
import ts from 'typescript';

const out = Bun.argv[2];
if (out === undefined) {
	console.error('usage: bun classify.ts OUT_JSON');
	process.exit(2);
}
const root = `${process.cwd()}/`;
const files = (await Bun.$`git ls-files '*.corpus.test.ts'`.text())
	.trim()
	.split('\n')
	.map((f) => root + f);

const CORPUS_MODULES = Bun.env.MIN_SEEDS
	? ['corpus-fixture.ts']
	: [
			'corpus-fixture.ts',
			'dry-run.ts',
			'census.ts',
			'review.ts',
			'migrate-dry.ts',
			'count.ts',
			'headword-census.ts',
			'apply-cli.ts',
			'corpus-inputs.ts',
		];
const MUTATORS = new Set(['push', 'set', 'add', 'delete', 'clear', 'splice', 'unshift', 'sort', 'fill']);

const program = ts.createProgram(files, {
	allowImportingTsExtensions: true,
	module: ts.ModuleKind.ESNext,
	noEmit: true,
	resolveJsonModule: true,
	target: ts.ScriptTarget.ESNext,
});
const checker = program.getTypeChecker();

const calleeName = (n: ts.CallExpression): string => {
	let e = n.expression;
	while (ts.isCallExpression(e)) e = e.expression;
	if (ts.isPropertyAccessExpression(e)) e = e.expression;
	return ts.isIdentifier(e) ? e.text : '';
};
const isTestCall = (n: ts.Node): n is ts.CallExpression =>
	ts.isCallExpression(n) && ['it', 'test'].includes(calleeName(n));
const isDescribe = (n: ts.Node): n is ts.CallExpression =>
	ts.isCallExpression(n) && calleeName(n) === 'describe';
const declOf = (id: ts.Identifier): ts.Declaration | undefined =>
	checker.getSymbolAtLocation(id)?.declarations?.[0];

type Row = { file: string; line: number; end: number; name: string; corpus: boolean; refs: string[] };
const rows: Row[] = [];

for (const file of files) {
	const sf = program.getSourceFile(file);
	if (sf === undefined) throw new Error(`not parsed: ${file}`);
	const seeded = new Set<ts.Declaration>();
	const callbacks = new Set<ts.Node>();

	for (const st of sf.statements) {
		if (ts.isImportDeclaration(st) && ts.isStringLiteral(st.moduleSpecifier)) {
			const spec = st.moduleSpecifier.text;
			const nb = st.importClause?.namedBindings;
			if (CORPUS_MODULES.some((m) => spec.endsWith(`/${m}`)) && nb && ts.isNamedImports(nb)) {
				for (const el of nb.elements) seeded.add(el);
			}
		}
	}
	const refs = (n: ts.Node): string[] => {
		const hits = new Set<string>();
		const walk = (m: ts.Node): void => {
			if (ts.isCallExpression(m) && ts.isIdentifier(m.expression) && m.expression.text === 'readSourceEntries' && m.arguments.length === 0) hits.add('<readSourceEntries()>');
			if (ts.isIdentifier(m)) {
				if (m.text === 'SOURCE_PATH') hits.add('<SOURCE_PATH>');
				const d = declOf(m);
				if (d && seeded.has(d)) hits.add(m.text);
			}
			ts.forEachChild(m, walk);
		};
		walk(n);
		return [...hits];
	};
	const mark = (n: ts.Node): void => {
		if (isTestCall(n)) for (const a of n.arguments) if (ts.isArrowFunction(a) || ts.isFunctionExpression(a)) callbacks.add(a);
		ts.forEachChild(n, mark);
	};
	mark(sf);

	for (let changed = true; changed; ) {
		changed = false;
		const visit = (n: ts.Node): void => {
			if (callbacks.has(n)) return;
			if ((ts.isVariableDeclaration(n) || ts.isFunctionDeclaration(n) || ts.isBindingElement(n)) && !seeded.has(n)) {
				const body = ts.isFunctionDeclaration(n) ? n.body : n.initializer;
				if (body && refs(body).length > 0) {
					seeded.add(n);
					const bind = (b: ts.Node): void => {
						if (ts.isBindingElement(b)) seeded.add(b);
						ts.forEachChild(b, bind);
					};
					if (ts.isVariableDeclaration(n)) bind(n.name);
					changed = true;
				}
			}
			const statement = ts.isExpressionStatement(n) || ts.isForOfStatement(n) || ts.isForStatement(n) || ts.isForInStatement(n) || ts.isIfStatement(n) || ts.isWhileStatement(n);
			if (statement && refs(n).length > 0) {
				const mut = (m: ts.Node): void => {
					let target: ts.Expression | undefined;
					if (ts.isBinaryExpression(m) && m.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && m.operatorToken.kind <= ts.SyntaxKind.LastAssignment) target = m.left;
					if (ts.isPostfixUnaryExpression(m) || ts.isPrefixUnaryExpression(m)) target = m.operand;
					if (ts.isCallExpression(m) && ts.isPropertyAccessExpression(m.expression) && MUTATORS.has(m.expression.name.text)) target = m.expression.expression;
					while (target && (ts.isPropertyAccessExpression(target) || ts.isElementAccessExpression(target))) target = target.expression;
					if (target && ts.isIdentifier(target)) {
						const d = declOf(target);
						if (d && d.getSourceFile() === sf && !seeded.has(d)) {
							seeded.add(d);
							changed = true;
						}
					}
					ts.forEachChild(m, mut);
				};
				mut(n);
			}
			ts.forEachChild(n, visit);
		};
		visit(sf);
	}

	const path: string[] = [];
	const lit = (n: ts.Node | undefined): string =>
		n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text : (n?.getText(sf) ?? '?');
	const collect = (n: ts.Node): void => {
		if (isDescribe(n)) {
			path.push(lit(n.arguments[0]));
			ts.forEachChild(n, collect);
			path.pop();
			return;
		}
		if (isTestCall(n)) {
			const r = refs(n);
			rows.push({
				corpus: r.length > 0,
				end: sf.getLineAndCharacterOfPosition(n.getEnd()).line + 1,
				file: file.replace(root, ''),
				line: sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1,
				name: [...path, lit(n.arguments[0])].join(' > '),
				refs: r,
			});
			return;
		}
		ts.forEachChild(n, collect);
	};
	collect(sf);
}

await Bun.write(out, JSON.stringify(rows, null, 1));
const tally = new Map<string, [number, number]>();
for (const r of rows) {
	const t = tally.get(r.file) ?? [0, 0];
	t[r.corpus ? 0 : 1]++;
	tally.set(r.file, t);
}
let c = 0;
let e = 0;
for (const [f, [nc, ne]] of [...tally].sort()) {
	console.log(`${String(nc).padStart(3)} corpus ${String(ne).padStart(3)} example  ${f}`);
	c += nc;
	e += ne;
}
console.log(`TOTAL corpus=${c} example=${e} files=${tally.size}/${files.length}`);
```

## Appendix B: `inventory.ts`

Run from the repository root as `.inventory.tmp.ts` with `CLASSIFY_JSON BASE_SHA`. Verified at `03167f0d`: `{ deleted: 191, research: 10, moved: 182, kept: 11, converted: 11 }`.

```ts
/**
 * inventory.ts — run from the repo root at the base commit, BEFORE any
 * corpus file is edited. Reads classify.json (from classify.ts) and
 * writes docs/v2/retired-corpus-checks.md plus a disposition tally.
 */
type Row = {
	file: string;
	line: number;
	end: number;
	name: string;
	corpus: boolean;
	refs: string[];
	helpers: string[];
};

const [classifyPath, base] = Bun.argv.slice(2);
if (!classifyPath || !base) {
	console.error('usage: inventory.ts CLASSIFY_JSON BASE_SHA');
	process.exit(2);
}
const rows = (await Bun.file(classifyPath).json()) as Row[];

const INVARIANT = /transform\/(commutation|registry\.order)\.corpus\.test\.ts$/u;
const RESEARCH =
	/(research\/residue-sweep|body\/implied-one-census)\.corpus\.test\.ts$/u;
const GERSHAYIM = /transform\/rules\/gershayim\.corpus\.test\.ts$/u;
const APPLY_COUNT = (r: Row): boolean =>
	r.file.endsWith('patch/apply.corpus.test.ts') && r.line === 167;

/** Tainted only through `census.ts`'s `walkSenses`; it reads
 * `body/fixtures/*.jsonl`, never the source data. */
const LABELS_FIXTURE_SWEEP = (r: Row): boolean =>
	r.file.endsWith('body/labels.corpus.test.ts') && r.line === 165;

type Disposition = 'moved' | 'converted' | 'kept' | 'research' | 'deleted';
function disposition(r: Row): Disposition {
	if (RESEARCH.test(r.file)) return 'research';
	if (INVARIANT.test(r.file)) return r.corpus ? 'kept' : 'moved';
	if (GERSHAYIM.test(r.file) && r.corpus && r.line < 300) return 'converted';
	if (APPLY_COUNT(r)) return 'deleted';
	if (LABELS_FIXTURE_SWEEP(r)) return 'moved';
	return r.corpus ? 'deleted' : 'moved';
}

/** First match wins. A heuristic: every `other` row is read by hand. */
const KINDS: ReadonlyArray<readonly [string, RegExp]> = [
	[
		'derived-table',
		/re-?deriv|frozen|allowlist|table is|live snapshot|exists|vocabulary|starts with|what the corpus targets|labels from the corpus|no drift/iu,
	],
	[
		'no-defect',
		/creates? no|never |no new|loses? no|leaves no|invents nothing|writes no|mints no|orphan no|tag-balanced|clears all|passes (all|the)|changes no|destroys no|adds or removes none|removing none|nothing left|no escaped|no rule creates|order-free|no FIELD|no NEITHER|stays|lives wholly|every written|every one of them|no damaged|no leading|no trailing|no dagesh|holds no/iu,
	],
	['count', /\d|reproduc|measures|population|exactly|pins|census|flags|finds|takes|repairs|splits|partitions|pairs|records/iu],
];
const kindOf = (name: string): string =>
	KINDS.find(([, re]) => re.test(name))?.[0] ?? 'other';

const tally = new Map<Disposition, number>();
for (const r of rows) {
	const d = disposition(r);
	tally.set(d, (tally.get(d) ?? 0) + 1);
}
console.log(Object.fromEntries(tally));

const deleted = rows
	.filter((r) => disposition(r) === 'deleted')
	.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
const kinds = new Map<string, number>();
for (const r of deleted) {
	const k = kindOf(r.name);
	kinds.set(k, (kinds.get(k) ?? 0) + 1);
}
console.log(Object.fromEntries(kinds));

const esc = (s: string): string => s.replaceAll('|', '\\|');
const lines = [
	'# Retired corpus checks',
	'',
	`Every test deleted from the corpus tier by consolidation step 5 (spec`,
	'[§5.1](../specs/2026-09-13-pipeline-consolidation-design.md), §11 step 5).',
	`Each link opens the test as it stood at \`${base}\`, the last commit`,
	'that ran it. Nothing here runs.',
	'',
	'**Why this list exists.** On the committed source data the nine',
	'`migrate` gates and the migration report cover what these tests',
	'pinned. On a *new* export the `derived-table` and `no-defect` rows',
	'were the only warning, so each one worth keeping becomes a review',
	'detector that emits report rows with no pinned number (spec §10).',
	'This is the list that work starts from.',
	'',
	'| Kind | Meaning |',
	'|---|---|',
	'| `count` | asserts a number, or a rid list, measured on one export |',
	'| `derived-table` | re-derives a hand-kept table from the export and requires it unchanged |',
	'| `no-defect` | asserts a rule creates, loses or leaves no defect across the export |',
	'| `order` | shows two rules disagree by order; a static direction pin replaces it |',
	'| `other` | not yet read; none may remain when this file is committed |',
	'',
	`${deleted.length} tests: ${[...kinds].map(([k, n]) => `${n} ${k}`).join(', ')}.`,
	'',
	'| Test | Kind |',
	'|---|---|',
	...deleted.map(
		(r) =>
			`| [\`${r.file.replace('admin/pipeline/', '')}:${r.line}\`](https://github.com/UniquePixels/jastrow/blob/${base}/${r.file}#L${r.line}-L${r.end}) ${esc(r.name)} | ${kindOf(r.name)} |`,
	),
	'',
];
await Bun.write('docs/v2/retired-corpus-checks.md', lines.join('\n'));
console.log(`wrote docs/v2/retired-corpus-checks.md (${deleted.length} rows)`);
```

## Appendix C: `verify-moves.ts`

Run from the repository root as `.verify-moves.tmp.ts` with `BASE NEW_FILE OLD_FILE...`. Controls at `03167f0d`: an unchanged file reported `22 same, 0 changed, 0 new`; two planted one-character edits reported `2 changed`. Do not pipe its output when you need the exit code.

```ts
/**
 * verify-moves.ts BASE NEW_FILE OLD_FILE [OLD_FILE...]
 *
 * For every it()/test() in NEW_FILE (working tree), find the test of the
 * same describe-path + name in any OLD_FILE as it stood at git rev BASE,
 * and compare the full call text byte for byte. Prints one line per
 * test: SAME / CHANGED / NEW, then a tally. Exit 1 on any CHANGED.
 */
import ts from 'typescript';

const [base, newFile, ...oldFiles] = Bun.argv.slice(2);
if (!base || !newFile || oldFiles.length === 0) {
	console.error('usage: verify-moves.ts BASE NEW_FILE OLD_FILE...');
	process.exit(2);
}

function tests(path: string, text: string): Map<string, string> {
	const sf = ts.createSourceFile(path, text, ts.ScriptTarget.ESNext, true);
	const out = new Map<string, string>();
	const lit = (n: ts.Node | undefined): string =>
		n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n))
			? n.text
			: (n?.getText(sf) ?? '?');
	const callee = (n: ts.CallExpression): string => {
		let e = n.expression;
		while (ts.isCallExpression(e)) e = e.expression;
		if (ts.isPropertyAccessExpression(e)) e = e.expression;
		return ts.isIdentifier(e) ? e.text : '';
	};
	const path_: string[] = [];
	const walk = (n: ts.Node): void => {
		if (ts.isCallExpression(n)) {
			const c = callee(n);
			if (c === 'describe') {
				path_.push(lit(n.arguments[0]));
				ts.forEachChild(n, walk);
				path_.pop();
				return;
			}
			if (c === 'it' || c === 'test') {
				out.set([...path_, lit(n.arguments[0])].join(' > '), n.getText(sf));
				return;
			}
		}
		ts.forEachChild(n, walk);
	};
	walk(sf);
	return out;
}

const old = new Map<string, string>();
for (const f of oldFiles) {
	const text = await Bun.$`git show ${base}:${f}`.text();
	for (const [k, v] of tests(f, text)) old.set(k, v);
}
const now = tests(newFile, await Bun.file(newFile).text());
let same = 0;
let changed = 0;
let fresh = 0;
for (const [name, text] of now) {
	const was = old.get(name);
	if (was === undefined) {
		fresh++;
		console.log(`NEW      ${name}`);
	} else if (was === text) {
		same++;
	} else {
		changed++;
		console.log(`CHANGED  ${name}`);
	}
}
console.log(`${newFile}: ${same} same, ${changed} changed, ${fresh} new`);
process.exit(changed > 0 ? 1 : 0);
```
