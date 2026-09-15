# Pipeline Consolidation — Design Spec

- **Date:** 2026-09-13
- **Status:** Draft from the 2026-09-11/13 review session (maintainer +
  Claude). Rulings in §2 are the maintainer's; everything else is the
  plan to make them true.
- **Supersedes:** decision D14 of
  [2026-07-08-v2-data-architecture-design.md](2026-07-08-v2-data-architecture-design.md)
  §6 ("`migrate.ts` runs once, gets blessed, then retires into repo
  history"). Amends `admin/pipeline/README.md` accordingly.
- **Does not change:** the truth schema, the transform rules, the
  compile design (data-architecture §3), or the committed data.

## 1. Context

A full review of the v2 branch on 2026-09-11 measured the pipeline
against its original goal (overhaul design V1: a *scripted,
re-runnable, fully documented* pipeline from the Sefaria source to the
files the admin tool and compiler use, plus a review list, plus
patches for what cannot be done deterministically).

| Measured | Result |
|---|---|
| `bun pipeline:migrate` dry run | 1 min 57 s, nine gates green |
| Fresh `--write` vs committed `data/entries/` | identical after `biome format` (2,785 files differ only by array reflow before it) |
| Non-test code under `admin/`, and the share reachable from `migrate.ts` | 36,952 lines; ~77 modules on the migrate path |
| `research/`, `provenance/`, one-time `body/` tools | 17,746 + 1,174 + 2,822 lines; 2 files needed by migrate |
| `package.json` scripts | 24: 6 pipeline, 8 QA, 10 research relics |
| Corpus test tier | 45 files, 14,443 lines, 12–13 min of CI; 3 files check code invariants, ~40 pin per-rule counts to the 2026-07-04 snapshot |
| Branch protection on `v2` | no required status checks |
| Biome | 240 info diagnostics, 0 warnings; scans 32,512 data files by accident |
| SonarCloud | all 82 issues are the v1 app on `main`; no v2 branch exists |

The pipeline works and reproduces its output. The repository around it
still records the research process rather than the reproducible path,
and the July ruling that migrate is a one-shot contradicts the goal.

## 2. Rulings (maintainer, 2026-09-12/13)

| ID | Ruling |
|---|---|
| R1 | **`migrate.ts` is permanent and re-runnable.** D14's "retires into repo history" is withdrawn. A run regenerates a candidate tree and reports; it never silently overwrites edited truth. |
| R2 | **Truth is the edited layer; the page index is ours to correct.** `data/entries/` is what people and the admin tool edit. Hand edits are *not* re-recorded as pipeline inputs (withdrawn 2026-09-14: that mandate would push the admin tool toward writing patches). The one exception is page/column: we are the source of that data, so when the admin tool changes an entry's page or column it must also update `data/page-index/entries.jsonl`, or a fresh rebuild loses the correction. **Note for the admin-tool build.** Text corrections we hope to see fixed upstream by Sefaria; the rest survive a rebuild by the merge in §3.2. |
| R3 | **Resilient, not unattended.** The pipeline never chokes on the data it is given: a failing entry is emitted from source bytes with a review row, not dropped. Every run still ends in a report a person reads before the output ships. |
| R4 | **Three buckets.** Pipeline code is a *rule* (detect + fix, general), a *patch* (one entry's judged fix, applied when its precondition holds), or a *review detector* (detect only, emit a row). Everything else is research and is archived. |
| R5 | **One formatter.** Biome formats `data/entries/`. The pipeline formats as its last step, the admin tool formats what it writes, contributors run `bun qa`, CI checks. |
| R6 | **The pipeline runs on the current Sefaria export.** `fetch` is step 1, not a side path. The snapshot it writes is committed with the truth it produced, so any run is reproducible afterwards without a download. The update process (a new export against edited truth, §3.2) is designed here in outline and built after the §11 sequence. A Sefaria schema change is a code change and out of scope. |
| R7 | **Review items become issues** in the tracker the admin tool integrates with (GitHub Issues or similar). Until that tool exists, one consolidated review document stands in. |

## 3. Target shape of the pipeline

```
data/source/            committed Sefaria snapshot   (input, from fetch)
data/page-index/        committed print locators      (input, ours; admin tool corrects)
data/patches/           committed per-entry judgments (input, ours; admin tool appends)
data/quarantine/        committed unresolved targets  (input, ours)
        │
        ▼
bun pipeline:migrate    rules → patches → review detectors → gates → format
        │
        ├── data/entries/<L>/<rid>.json      truth (committed, derived)
        └── data/source/migration-report.json + docs/v2/migration-blessing.md
        │
        ▼
bun pipeline:compile    truth → serving artifacts (data-architecture §3, not yet built)
```

The normal run is `fetch` then `migrate`: pull the current export,
process it, read the report. The flow is drawn in
[`docs/pipeline-flow.drawio.svg`](../pipeline-flow.drawio.svg)
(renders on GitHub; opens in draw.io for editing), derived from the
maintainer's sketch `docs/Migrate Flow.drawio`. The snapshot `fetch`
writes to `data/source/` is committed in the same PR as the truth it
produced. That is what makes the run reproducible afterwards: CI, or a
fresh clone, runs `migrate` alone against the committed snapshot and
gets the committed truth byte-for-byte, with no download.

### 3.1 The report is the review list

`migration-report.json` becomes structured rows, one shape for every
kind:

```json
{ "rid": "A00077", "bucket": "review", "kind": "headword-unparsed",
  "severity": "review", "detail": "?אִיבּוּס — grammar did not parse" }
```

| Field | Values |
|---|---|
| `bucket` | `review` (a data judgment), `patch` (a patch to re-judge), `pipeline` (a code fault) |
| `severity` | `review`; `fault` for every `pipeline` row |
| `kind` | `headword-unparsed`, `page-confidence-low`, `page-confidence-medium`, `markup-carry`, `upstream-fixed`, `upstream-changed`, `composition-failed`, `patch-failed`, `finish-failed`, `patch-target-missing` |

Rule counts are *composed*: each rule sees the text the rules before
it left, so a count differs from `bun transform:count`'s rule-alone
figure. Every registered rule and `repairs.ts` pass has a row, zeros
included.

| Section | Rows | Blocking? |
|---|---|---|
| Gates | nine tallies against fixed totals (unchanged) | red gate = run refuses to write |
| Rule counts | one row per rule: fired N times on M entries | never; a count of 0 is information ("Sefaria fixed it" or "the rule is dead") |
| Patch outcomes | applied / upstream-fixed / upstream-changed / superseded, per patch (§3.3) | never; the two upstream outcomes are review rows |
| Review rows | headword-unparsed, page-confidence-low/medium, markup-carry, plus the judgment classes' detectors as they are wired | never |
| Pipeline faults | composition-failed, patch-failed, finish-failed, patch-target-missing | each also fails gate 9 (composition), so a run with any fault refuses to write |

Rows route two ways, as the flow diagram draws it: data judgments
(review rows, the two upstream patch outcomes) go to the admin tool's
tracker integration; pipeline faults are ordinary code issues.

The blessing doc renders the same report; nothing is hand-written.
These rows are what the maintenance dry run (§3.3) diffs against,
which is why the shape is fixed now.

### 3.2 Fresh run vs update run

The only difference between the two is whether hand edits exist in
truth that a new run would overwrite. A fresh fork has none. The
maintained repo does, and the truth schema carries no edit provenance,
so the run cannot tell an edit from a source change by looking at a
file. It can tell by rebuilding:

| Term | Meaning |
|---|---|
| base | `data/entries/` **as the pipeline last wrote it**. After the write, `migrate` computes the git tree object id of `data/entries/` and records it as `writtenTree` in a committed file, `data/source/migration-written.json`. A tree id is content-addressed: it is computable before the commit exists, it does not name the commit that carries it, and it survives rebases and squash merges. Base is recovered with `git read-tree <writtenTree>` into a temporary index (the migration report itself is not committed, D2, so it cannot carry this) |
| ours | current `data/entries/` |
| theirs | `migrate` of the *new* snapshot with current rules and patches |

`ours − base` is exactly the set of hand edits, because base is the
pipeline's own output before anyone touched it. Base is *not* rebuilt
from the old snapshot with current rules: rules and patches may have
changed since that write, and a rebuilt base would fold those changes
into "hand edits" (review finding, PR #85). Rule changes belong on the
theirs side, where they are merged like any source change.

The update run applies a per-entry three-way merge: theirs where
ours == base, ours where theirs == base, and a review row where all
three differ. The committed snapshot is still required: it is what
makes the last write reproducible and auditable, and what the
maintenance dry run (§3.3) diffs the new export against. No provenance
field and no patch re-recording is needed.

### 3.3 Patch lifecycle and the maintenance dry run

When Sefaria corrects an entry, the patch that fixed it locally loses
its precondition. `migrate` reports each such patch as one of two
outcomes (the research-process spec §6 already asks for this):

| Outcome | Test | Action |
|---|---|---|
| `upstream-fixed` | new source text already equals the patch's post-state (or its class-specific equivalent) | archive the patch |
| `upstream-changed` | new source differs from both the patch's before and after | re-judge; review row |

A scheduled dry run makes this routine: on a cadence (monthly, or on
demand), fetch to a temporary directory, run `migrate` dry against it,
diff the report against the committed report, and open one issue
listing entries added or removed, rule counts that moved, patches
flagged `upstream-fixed` or `upstream-changed`, and new review rows.
Nothing is written. A person decides whether to run the update (§3.2)
from that issue.

## 4. The three buckets (R4)

| Bucket | Contract | On different data |
|---|---|---|
| **Rules** (`transform/rules/`, general logic in `body/repairs.ts`) | detect + fix, declared claim, count-independent | fire on whatever matches; report the count |
| **Patches** (`data/patches/`, `data/quarantine/`, and the rid-keyed tables now in `repairs.ts`) | precondition + one entry's fix | apply when `expected_before` matches; otherwise a review row |
| **Review detectors** | detect only | emit rows |

### 4.1 Where current code goes

| Today | Bucket | Work |
|---|---|---|
| 50 registered transform rules | rules | none |
| `repairs.ts` general passes (rejoin, units, lettered, form sections) | rules | none |
| `repairs.ts` hand tables: `CHOPPED`, `IMPLIED_ONE`, `DASH_LABELS`, `REFS_REMOVALS`, `DEFERRED`, `REPAIRED_ORPHAN_ITEMS` | patches | convert each row to a patch; delete the tables |
| 147 accepted patches, quarantine rows | patches | none beyond §4.2 |
| headword grammar, page confidence, markup carry (in `migrate/`) | review detectors | emit structured rows |
| 72 judgment classes in `data/patches/patterns.jsonl` | review detectors, where a detector exists in archived research code | port detectors one class at a time; not a prerequisite for anything else |
| `research/`, `provenance/`, `body/{census,review,migrate-dry,implied-one-census,fixtures/extract}.ts`, `patch/seed-implied-one.ts`, `page-index/` build code | archive (§8) | move |

### 4.2 Patch preflight

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

## 5. Gates, tests, and CI

### 5.1 What verifies what

| Check | Verifies | Where it runs |
|---|---|---|
| nine migrate gates | the data | inside `migrate`, every run |
| rebuild == truth | the committed truth is what the pipeline produces from the committed snapshot | CI job **Rebuild**: delete `data/entries/`, `migrate --write --strict` (no fetch; formats as its last step; `--strict` because on the committed snapshot a stale pin or a drifted patch can only be an authoring mistake, so CI refuses the run rather than merely reporting drift the way the default run does for a new export), then `git status` on the tree and the blessing doc must be empty; ~2 min |
| data validation (schema, file path, closed tag vocabulary, balanced markup, slug uniqueness, internal cite targets, page == page-index row both ways) | any hand edit to truth | `migrate/validate.ts`, run over the tree by `migrate/truth.test.ts` in `bun qa`; CI job **Test** |
| commutation, registry order, link-target totals (3 files) | the rule *code* | CI job **Invariants**, path-filtered to `admin/pipeline/transform/**` |
| ~40 per-rule count pins | that rules fire N times on one snapshot | **retired**: replaced by rule-count rows in the report and an `expected-counts.json` for the committed snapshot that the Rebuild job compares |

### 5.2 Required checks on `v2`

Enable required status checks: Lint, Type Check, Test, Rebuild,
Invariants. Corpus Audit as a required name goes away with the tier.

**Deferred (maintainer, 2026-09-14):** revisited near the v2 release.
A failing check already has to be overridden to merge, so raising the
setting now adds nothing.

### 5.3 Test tiers after the change

`*.test.ts` (unit, ~2 s, 1.3 s of it the truth-tree validation) and
the three invariant files. The
`*.corpus.test.ts` naming convention and `test-tiers.test.ts` guard
stay for those three; the other 42 corpus files leave with the
research code or are deleted where they only pinned counts.

## 6. Formatting (R5)

| Where | Change |
|---|---|
| `biome.json` | include `data/entries/**/*.json` deliberately. Today those files are checked only because the `!data/*.json` exclude matches JSON files directly under `data/` and never reaches `data/entries/` (Biome's `*` does not match `/`); the inclusion is a side effect, not a decision. Linter off for that path; drop the four stale overrides (`data/admin/**`, `scripts/*.ts`, `.commitlintrc.ts`, `**/*.js`) |
| `migrate.ts` | `--write` ends with `biome format --write data/entries`, run by `migrate.ts` itself (a second command in the `package.json` script would receive `--write` instead of migrate; PR #88 shipped that bug) |
| admin tool | formats every file it writes (biome is a dev dependency) |
| CI | `biome ci` keeps *checking*; it never rewrites or commits |
| contributors | `bun qa` before every commit, data-only PRs included |

Diff noise from array reflow is accepted in exchange for one canonical
form for humans, the tool, and the pipeline.

## 7. Slugs

`migrate/slug.ts` says "assigned once, then frozen" but `assignSlugs`
takes no prior assignment and renumbers every collision family from
scratch. Under R1 a rebuild must read the existing truth's slugs first
and only assign to rids that have none. This is required before any
rebuild after an entry is added, and is cheap to do now.

## 8. Archive

| What | Where | Note |
|---|---|---|
| research code (§4.1 last row) and its 4,265 test lines | tag `archive/v2-research-2026-09` + branch of the same name; deleted from `v2` | dead code is not linted, typed, or tested. `research/patterns.ts` and `research/manifest.ts` move into `patch/` first; the pipeline imports them |
| page-index build code | same archive branch | stays re-runnable; `data/page-index/README.md` already documents the method and is kept with the data |
| research docs: `discovery-round-*`, `transform-batch-*`, `phase-2-*`, `body-*`, `pattern-triage`, `catalogue-audit`, `baseline-audit`, `divergence-audit`, `body-review/` | `docs/archive/` on `v2` | history stays readable and linkable |
| registry `PENDING` commentary (487 lines inside an empty array) | `docs/archive/registry-history.md` | zero behaviour change |
| `.superpowers/`, `.claude/worktrees/*`, `.worktrees/` | delete stale entries | two stale worktrees today |

`package.json` after the move: `pipeline:fetch`, `pipeline:migrate`,
`pipeline:compile` (when built), `pageindex:verify`, `qa*`, the
invariants runner. `research:apply` is renamed `pipeline:patches` or
folded into migrate; it is the patch engine, not research.

## 9. Documents

| Document | Change |
|---|---|
| `admin/pipeline/README.md` | rewrite around §3: inputs, stages, report, buckets; delete every "one-time" and "retires" |
| `docs/specs/2026-07-08-v2-data-architecture-design.md` §6 | strike D14's one-shot wording with a pointer here; changelog row |
| `docs/v2/review-queue.md` (new, interim per R7) | every open review list in one place with a coverage note: 309 unparsed headwords; 2,191 non-high page placements; 487 sweep escalations **measured over letters A–C only**; 72 judgment classes; 4 undecided body-review rows (D00470, K00081, R00519, D00341); `open-paren-in-rtl-span` (89 entries, still `route: blocked`, no rule) |
| `docs/v2/sefaria-report.md` | add register rows #16 (implied sense 1) and #6b (nested anchors, different targets); then send |
| `docs/v2/upstream-issues.md` | mark rows reported when sent |

## 10. Later, pinned here so they are not lost

| Item | Owner spec |
|---|---|
| Update run: three-way merge of §3.2, conflict rows, then blessing | its own spec, built after §11 (R6) |
| Maintenance dry run on a schedule (§3.3); the CI egress allowlist must admit `storage.googleapis.com` and the runner must hold a 2.4 GB streamed download | after §11 |
| **Admin tool: a page/column edit must also update `data/page-index/entries.jsonl`** (R2) | admin tool spec |
| Review rows → tracker issues; idempotent on `(rid, kind)`; batching for volume (thousands of rows will not work as one issue each) | admin tool spec |
| `compile.ts` | data-architecture §3 |
| Port judgment-class detectors from archived research code | ad hoc, one class per PR |
| Review the 298 low-confidence page placements | review queue |

## 11. Sequence

Small PRs into `v2`, in this order; each stands alone.

1. This spec, the D14 strike-through, and the README rewrite (§9).
2. Biome config and the format step (§6). One mechanical follow-up if
   any committed file changes shape.
3. Rebuild CI job and data validation in `bun qa` (§5); required
   checks deferred (§5.2).
4. Structured report rows and the patch-preflight change (§3.1, §4.2).
5. Retire the count-pin corpus tests; path-filtered Invariants job (§5.1).
6. Archive move and `package.json` reduction (§8).
7. Slug freezing (§7).
8. `repairs.ts` hand tables → patches (§4.1).
9. Review-queue doc and Sefaria report refresh (§9).

## 12. Changelog

| Date | Change |
|---|---|
| 2026-09-13 | Initial draft from the review session; rulings R1–R7 recorded |
| 2026-09-14 | R2 narrowed to the page-index note; R6 reworded: the pipeline runs on the current export and commits the snapshot it used; §3.2 three-way merge as the fresh-vs-update mechanism; §3.3 patch lifecycle (`upstream-fixed` / `upstream-changed`) and the scheduled maintenance dry run; report routing per the maintainer's flow diagram |
| 2026-09-14 | PR #85 review: §3.2 base is the truth tree as last written, never a rebuild with current rules; identified by a content-addressed git tree id (`writtenTree`) in a committed file, not by a commit sha; §6 biome rationale corrected (`*` does not cross `/`) |
| 2026-09-14 | Step 4: §4.2 a stale pin is a header count and each patch is judged by its precondition, `--strict` restores refusal; §3.1 row fields and kinds as built, rule counts are composed; §5.2 required checks deferred to near release |
