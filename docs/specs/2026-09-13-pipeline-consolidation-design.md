# Pipeline Consolidation — Design Spec

- **Date:** 2026-09-13
- **Status:** Draft from the 2026-09-11/13 review session (maintainer +
  Claude). Rulings in §2 are the maintainer's; everything else is the
  plan to make them true.
- **Supersedes:** decision D14 of
  [2026-07-08-v2-data-architecture-design.md](2026-07-08-v2-data-architecture-design.md)
  §6 ("`migrate.ts` runs once, gets blessed, then retires into repo
  history"). Amends `admin/pipeline/README.md` accordingly.
- **Does not change:** the entry data schema, the transform rules, the
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
| `package.json` scripts | 24: 6 pipeline, 8 QA, 10 research relics. **Corrected 2026-09-16 (step 6):** 25 at the start of step 6 — step 5 added `transform:invariants` after this row was measured. 25 minus the 12 archived leaves 13, not the 12 step 6 predicted: `body:dry-run` survives because `migrate.ts` imports `dry-run.ts`'s `buildTrace` |
| Corpus test tier | 45 files, 14,443 lines, 12–13 min of CI; 3 files check code invariants, ~40 pin per-rule counts to the 2026-07-04 snapshot. **Corrected 2026-09-15:** 2 files are code invariants (`body/pipeline-links`, the third named, is mostly counts), and the count files also hold ~190 hand-written example tests that never read the source data (estimate: synchronous `it(`/`test(` calls outside the two invariant files, by grep; not verified per test) **Measured 2026-09-15 (step 5):** 405 tests; 182 read no source data and 11 read eight fixed entries, so 193 moved to the unit tier; 191 were deleted and 21 remain (plan `docs/superpowers/plans/2026-09-15-consolidation-step5.md`, which also records the classifier and its controls) |
| Branch protection on `v2` | no required status checks |
| Biome | 240 info diagnostics, 0 warnings; scans 32,512 data files by accident |
| SonarCloud | all 82 issues are the v1 app on `main`; no v2 branch exists |

The pipeline works and reproduces its output. The repository around it
still records the research process rather than the reproducible path,
and the July ruling that migrate is a one-shot contradicts the goal.

### 1.1 Terms (R8)

| Term | What it is | Where |
|---|---|---|
| **source data** | Sefaria's export: the dictionary, lexicons and manifest `fetch` writes | `data/source/` |
| **entry data** | one JSON file per entry; made by `migrate`, then edited by people and the admin tool. Earlier documents and code call it "truth" | `data/entries/<L>/<rid>.json` |
| **compiled data** | entry data built for the web app | not built yet (data-architecture §3) |
| **reference data** | our own lookup inputs the pipeline reads alongside the source data: the print page/column index and the slug index (§7.1), and it may grow | `data/page-index/`, `data/slug-index/` |
| **correction data** | our own per-entry fixes: patches and quarantined link targets | `data/patches/`, `data/quarantine/` |

Reports (the migration report, the blessing doc, build reports) are
evidence, not data. Research notes still filed beside the data are
archive material (§8).

`migrate` is renamed **import**, and the commands that move data between
forms share a `data:` prefix: `data:fetch`, `data:import`,
`data:compile`. Until the step-10 sweep, code, scripts and the body of
this spec keep the old names. The full vocabulary, with old-to-new
mappings, is [`docs/glossary.md`](../glossary.md).

## 2. Rulings (maintainer, 2026-09-12/15)

| ID | Ruling |
|---|---|
| R1 | **`migrate.ts` is permanent and re-runnable.** D14's "retires into repo history" is withdrawn. A run regenerates a candidate tree and reports; it never silently overwrites edited truth. |
| R2 | **Entry data is the edited layer; the page index is ours to correct.** `data/entries/` is what people and the admin tool edit. Hand edits are *not* re-recorded as pipeline inputs (withdrawn 2026-09-14: that mandate would push the admin tool toward writing patches). The one exception is page/column: we are the source of that data, so when the admin tool changes an entry's page or column it must also update `data/page-index/entries.jsonl`, or a fresh rebuild loses the correction. **Note for the admin-tool build.** Text corrections we hope to see fixed upstream by Sefaria; the rest survive a rebuild by the merge in §3.2. |
| R3 | **Resilient, not unattended.** The pipeline never chokes on the data it is given: a failing entry is emitted from source bytes with a review row, not dropped. Every run still ends in a report a person reads before the output ships. |
| R4 | **Three buckets.** Pipeline code is a *rule* (detect + fix, general), a *patch* (one entry's judged fix, applied when its precondition holds), or a *review detector* (detect only, emit a row). Everything else is research and is archived. |
| R5 | **One formatter.** Biome formats `data/entries/`. The pipeline formats as its last step, the admin tool formats what it writes, contributors run `bun qa`, CI checks. |
| R6 | **The pipeline runs on the current Sefaria export.** `fetch` is step 1, not a side path. The snapshot it writes is committed with the entry data it produced, so any run is reproducible afterwards without a download. The update process (a new export against edited truth, §3.2) is designed here in outline and built after the §11 sequence. A Sefaria schema change is a code change and out of scope. |
| R7 | **Review items become issues** in the tracker the admin tool integrates with (GitHub Issues or similar). Until that tool exists, one consolidated review document stands in. |
| R8 | **Data terms** (2026-09-15). Source data is Sefaria's export; entry data is `data/entries/` (formerly "truth"); compiled data is what the web app loads; reference data is our lookup input (today the page index); correction data is patches and quarantine. `migrate` becomes import; data commands take a `data:` prefix (`data:fetch`, `data:import`, `data:compile`). Defined in §1.1 and `docs/glossary.md`. |
| R9 | **`migrate` is not CI work** (2026-09-15). It runs when a person chooses to: a new export or a rule change. That person reads the report and commits the output with the source data it came from. Per-PR CI checks code and validates entry data; it never runs `migrate` and never reads the source data. |
| R10 | **A published slug never changes** (2026-09-17). A slug, once published, keeps naming the same entry for good, and is never handed to a different one. The assignment is recorded in `data/slug-index/entries.jsonl` and read as an input by every run; it is not inferred from the entry tree, so a deleted entry's slug stays reserved rather than falling free. A collision family's bare stem is a frozen alias to its first member (`data/slug-index/aliases.jsonl`), unless a member already holds the bare stem as its own slug — then the bare name is that entry and the family has no alias (§7.3, `slug-bare-held`). What moves a slug is our own headword rules, not Sefaria: 20% of slugs differ between the source and composed spellings (§7). **Binds at v2 publication, not before** (2026-09-18): nothing is published yet, so until then every run regenerates slugs and aliases the way it regenerates entries, and `--write` rewrites the index. Publication flips `SLUGS_FROZEN`; from then the rest of this ruling holds (§7.1). |
| R11 | **The write is atomic** (2026-09-17). `import` composes, gates and reports in full before it touches `data/entries/`, and replaces the tree in one move only on a clean run. The "refuse unless the tree is empty" guard goes with it: it is a relic of the withdrawn D14, not a safety property. What the new tree *contains* is decided by §3.2's merge — never a blind overwrite of hand edits — and the guard is not replaced by an interactive prompt: a two-minute run would prompt long after the person walked away, it would block any scripted use, and `data/entries/` is committed, so git already makes a bad write recoverable. Built with the update run (§10), not in §11 step 7. |

## 3. Target shape of the pipeline

```
data/source/            source data      (Sefaria's export, from fetch)
data/page-index/        reference data   (print locators, ours; admin tool corrects)
data/patches/           correction data  (per-entry judgments, ours; admin tool appends)
data/quarantine/        correction data  (unresolved targets, ours)
        │
        ▼
bun pipeline:migrate    rules → patches → review detectors → gates → format
        │
        ├── data/entries/<L>/<rid>.json      entry data (committed; people edit)
        └── data/source/migration-report.json + docs/v2/migration-blessing.md
        │
        ▼
bun pipeline:compile    entry data → compiled data (data-architecture §3, not yet built)
```

The normal run is `fetch` then `migrate`: pull the current export,
process it, read the report. The flow is drawn in
[`docs/pipeline-flow.drawio.svg`](../pipeline-flow.drawio.svg)
(renders on GitHub; opens in draw.io for editing), derived from the
maintainer's sketch `docs/Migrate Flow.drawio`. The snapshot `fetch`
writes to `data/source/` is committed in the same PR as the entry data
it produced. That is what makes the run reproducible afterwards: anyone
with a clone can empty `data/entries/` (a write run refuses otherwise)
and run `migrate --write` alone against the committed source data, with
no download, and get the entry data as that run wrote it. A
difference is a hand edit, or a rule or patch change, merged since
(§3.2). Nobody needs to do this routinely, and CI does not (R9).

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

### 3.1.1 The review report and the publication gate (2026-09-18)

Every run also writes `docs/v2/review-report.md`, committed next to
the blessing doc. It renders **every** row whose bucket is `review` or
`patch` (the blessing doc does not: `review-deferred` and the `slug-*`
kinds reached only the uncommitted JSON), in two sections: rows that
must be resolved before v2 is published, and rows that can wait. The
deferred rows are what the admin tool's tracker integration opens as
issues (§10); the review report is that integration's input, so each
row carries a third field:

| `publication` | Meaning | Becomes an issue? |
|---|---|---|
| `blocks` | must be resolved before v2 is published | resolved first; an issue only if it is not |
| `defer` | can be resolved after publication | yes |
| `note` | a run observation, not a work item | no |

The value is fixed per row kind (maintainer, 2026-09-18):

| Kind | `publication` | Why |
|---|---|---|
| `headword-unparsed` | `blocks` | the headword makes the slug, and slugs freeze at publication (R10) |
| `slug-unsafe` | `blocks` | same: a slug cannot be corrected once published |
| `upstream-fixed`, `upstream-changed` | `blocks` | a patch whose precondition moved must be re-judged before the output is trusted |
| `page-confidence-low`, `page-confidence-medium` | `defer` | the page index is ours and correctable later; no URL depends on it |
| `markup-carry` | `defer` | the composer already closes the tag; the row records where |
| `review-deferred` | `defer` | sense-structure questions; the entry renders |
| `slug-changed`, `slug-new`, `slug-alias-new`, `slug-bare-held`, `slug-frozen-stem-drift` | `note` | slug movement between runs; expected while slugs are unfrozen (R10) |

Pipeline faults are not in this table: they already refuse the write
(gate 9). A kind with no entry is a code error, so a new review kind
cannot ship unclassified.

`headword-unparsed`'s lexical check admits a single space between
words: 276 of its 309 rows today are multi-word headwords that parse
and carry nothing else outside the lexical set (step 9). The one that
looks otherwise, `A02002` (`*כְּפַר א׳ אָמוּס`), is clean too: its `*`
is the reconstructed-form marker, which the grammar strips before the
check.

**The publication gate.** v2 is published only when the review
report's `blocks` section is empty **and** §11 step 11 has ruled
every research class that still blocks the cutover.
These rows are one candidate baseline for the maintenance dry run
(§3.3; its baseline is open), which is why the shape is fixed now.

### 3.2 Fresh run vs update run

The only difference between the two is whether hand edits exist in
entry data that a new run would overwrite. A fresh fork has none. The
maintained repo does, and the entry data schema carries no edit provenance,
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
makes the last write reproducible and auditable, and it is one
candidate baseline for the maintenance dry run (§3.3). No provenance
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
compare the result with a baseline (open, below), and open one issue
listing entries added or removed, rule counts that moved, patches
flagged `upstream-fixed` or `upstream-changed`, and new review rows.
No entry data is written. A person decides whether to run the update
(§3.2) from that issue.

**Open (2026-09-15), until this process is brainstormed (§10):**

- **Trigger.** A scheduled run may conflict with R9, since it runs
  `migrate` in automation. Scheduled, on demand, or something else is
  undecided.
- **Baseline.** Which committed artifact the result is compared with
  is undecided. Candidates named elsewhere in this spec are the
  report rows (§3.1) and the committed snapshot (§3.2). The report
  file itself is not a candidate as things stand: `migration-report.json`
  is not committed (D2); only the blessing doc is.

## 4. The three buckets (R4)

| Bucket | Contract | On different data |
|---|---|---|
| **Rules** (`transform/rules/`, general logic in `body/repairs.ts`) | detect + fix, declared claim, count-independent | fire on whatever matches; report the count |
| **Patches** (`data/patches/` — agent tranches plus `reviewed/`, the rid-keyed repairs `repairs.ts` held until step 8 — and `data/quarantine/`) | precondition + one entry's fix | apply when `expected_before` matches; otherwise a review row |
| **Review detectors** | detect only | emit rows |

### 4.1 Where current code goes

| Today | Bucket | Work |
|---|---|---|
| 50 registered transform rules | rules | none |
| `repairs.ts` general pass (`binyan-cleanup`) | rules | none |
| `repairs.ts` hand tables: `CHOPPED`, `IMPLIED_ONE`, `DASH_LABELS`, `REFS_REMOVALS`, `DEFERRED`, `REPAIRED_ORPHAN_ITEMS` | patches | *Shipped, step 8.* Converted; tables deleted — breakdown below |
| 147 accepted patches, quarantine rows | patches | none beyond §4.2 |
| headword grammar, page confidence, markup carry (in `migrate/`) | review detectors | emit structured rows |
| 72 judgment classes in `data/patches/patterns.jsonl` | review detectors, where a detector exists in archived research code | port detectors one class at a time; not a prerequisite for anything else |
| `research/`, `provenance/`, `body/{census,review,migrate-dry,implied-one-census,fixtures/extract}.ts`, `patch/seed-implied-one.ts`, `patch/seed-tranche.ts`, `patch/seed-sense-runs.ts`, `page-index/` build code | archive (§8) | move. **Corrected 2026-09-16 (step 6):** this row named `seed-implied-one.ts` only; `seed-tranche.ts` imports `../research/chunks.ts` and `seed-sense-runs.ts` imports `seed-tranche.ts`, so all three seeders archive together |

**Where each table went** (step 8; measured 2026-09-18 from the
seeder's actual output — `data/patches/reviewed/patches.jsonl` and
`manifest.jsonl` — never from this plan). `admin/pipeline/patch/seed-reviewed.ts`
ran once and wrote 96 patches, `P000194`–`P000289`, for 66 rids: 36
`join`, 48 `replace`, 9 `retag`, 3 `unref`. The reviewed manifest
records 66 `repaired` rids and 3 `needs_human_judgment` (`D00470`,
`K00081`, `R00519`).

| Table | Went to |
|---|---|
| `CHOPPED` (36) | reviewed `join` (36) + `replace` (29) where a rule used to fix spacing or links |
| `IMPLIED_ONE` (3), `DASH_LABELS` (5), `D00341` | reviewed `retag` (9, including `D00341`) + `replace` (1) for `D00341`'s `[` |
| `IMPLIED_ONE_TEXT` (1), `REINSERTS` (14), `CITE_WRAPS` (3) | reviewed `replace` (18), byte-adding |
| `REFS_REMOVALS` (3) | reviewed `unref` (3) |
| `DEFERRED` (3) | `needs_human_judgment` records in the reviewed manifest → `review-deferred` rows |
| `CONFIRMED_NO_CHANGE` (19) | listed in `data/patches/reviewed/README.md`; no patch |
| `REPAIRED_ORPHAN_ITEMS` (24) | `admin/pipeline/migrate/orphan-refs.ts`, a real gate again |

### 4.2 Patch preflight

Before this step, a snapshot-pin mismatch on any patch refused the
whole run. Every patch pins one hash over the whole export, so a new
export mismatches all of them at once, and the pin cannot say which
patches still hold. Under R3 (maintainer, 2026-09-14):

- A stale pin is one count in the report header
  (`snapshot.stalePins`). It skips nothing.
- Each ACCEPTED patch is judged by its own precondition: its target
  must resolve `expected_occurrences` times. If it does not, the
  patch is skipped and reported `upstream-fixed` (the target is gone,
  the patch is single-occurrence, and the senses it would produce are
  present) or `upstream-changed` (anything else, including a partial
  count, a multi-occurrence patch, and a sense-deleting patch, which
  cannot be told apart from an edit).
- A carry-over patch is different: `applyCarryOver` resolves its
  target against the healed entry BEFORE any drift check, and a
  target resolving 0 times there is recorded `absorbed` — reported
  `superseded`, not drift-classified — by construction (on the
  committed snapshot this means a repair or rule absorbed the
  defect). This is a known gap: on a new export, an upstream rewrite
  of a carry-over target also reads 0 resolutions and is
  indistinguishable from an absorbed one, so it too reports
  `superseded` rather than `upstream-changed`. See §10.
- `--strict` restores both refusals: a stale pin or a drifted
  accepted patch fails the run.

Silent skipping is never allowed: every skip is a row and a count in
the report header.

**Who may add bytes** (maintainer, 2026-09-18). A patch a person wrote
from a print check lives in `data/patches/reviewed/`; the loader
marks it human and the no-new-text rule does not apply. Agent patches
are unchanged. Reviewed patches apply first in `patch-apply` and are
outside Ruling C.

The maintainer's ruling in full: "an agent patch can not add/remove, a
human patch can." Agent patches are unchanged by this step: the
no-new-text validator (`patch/no-new-text.ts`) still holds every
agent-authored patch to a sub-multiset of the original entry's bytes,
plus the closed-grammar marker allowance on `retag`/`split`/`replace`
(maintainer ruling, 2026-08-11). **Open, not decided:** an agent patch
may already *remove* bytes — 7 `delete segment` patches in the
accepted corpus today, and a `replace` may shorten the text it
targets — which the "remove" half of the 2026-09-18 ruling would
forbid if read literally. Left for the maintainer.

## 5. Gates, tests, and CI

### 5.1 What verifies what

Under R9, per-PR CI never runs `migrate` and never reads the source
data. Everything that processes the whole export happens when a person
runs it.

| Check | Verifies | Where it runs |
|---|---|---|
| nine migrate gates | the entry data a run produces | inside `migrate`, every run |
| migrate report and blessing doc | what a run did: rule counts, patch outcomes, review rows | read by the person who ran `migrate`; the blessing doc is committed in the same PR as the source data and entry data it describes |
| entry data validation (schema, file path, closed tag vocabulary, balanced markup, slug uniqueness, slug == slug-index row both ways, internal cite targets, page == page-index row both ways) | any change to entry data: by `migrate`, the admin tool, or hand. A safeguard, independent of which export produced the data | `migrate/validate.ts`, run over the tree by `migrate/truth.test.ts` in `bun qa`; CI job **Test** |
| hand-written example tests | what one rule does to a small, fixed input | unit tier in `bun qa`; CI job **Test**. 193 of them lived inside `*.corpus.test.ts` files and moved to `*.test.ts` in step 5; 11 of those run on eight real entries frozen in `transform/rules/fixtures/gershayim.jsonl` |
| commutation and registry order's earned classes (`transform/commutation.corpus.test.ts`, `transform/registry.order.corpus.test.ts`) | the rule *code*: rules that edit the same text have a declared, justified order | run locally, by choice, before a PR that changes rule code or registry order: `bun run transform:invariants`; not CI. Each reads the source data and takes 3–4 min. Registry order's static assertions (every rule classified, the direction pins, cluster spans) read no data and run in `bun qa` from `transform/registry.order.test.ts`, sharing `transform/registry-classes.ts` with the corpus half |

Withdrawn 2026-09-15:

| Was | Why withdrawn |
|---|---|
| CI job **Rebuild** (delete `data/entries/`, `migrate --write --strict`, require an empty diff) | It fails permanently on the first hand edit to entry data, which R2 makes the edited layer; and under R9 `migrate` is not CI work. `--strict` stays as a flag for a person's run on the committed source data |
| CI job **Corpus Audit** (45 `*.corpus.test.ts` files; ~33 runner-minutes and 12 min wall per push, with a history of timeouts) | ~40 files pin counts measured on one export, so every new export means re-analysing them by hand; on the committed source data the gates and report already cover them |
| per-rule count pins, and the planned `expected-counts.json` | The blessing doc's rule-count table is regenerated by every `migrate` run and committed with it; a second copy is maintenance with no gain. The file was never built |
| path-filtered CI job **Invariants** | replaced by the local run above |

The retired corpus files also hold checks that are not counts: some
re-derive a hand-kept table from the source data (e.g. that the
linked-headword allowlist is exactly what the export targets), others
assert a rule creates no new defect across the export. On the
committed source data the gates make them redundant; on a new export
they are the only warning. Each one worth keeping becomes a review
detector (R4) that emits a report row, with no pinned number (§10);
the rest are deleted with the tier. Step 5 deleted 191 such tests; each
is listed with its kind (count, derived-table, no-defect, order) in
`docs/v2/retired-corpus-checks.md`, which is where that detector work
starts.

### 5.2 Required checks on `v2`

Enable required status checks: Lint, Type Check, Test.

**Deferred (maintainer, 2026-09-14):** revisited near the v2 release.
A failing check already has to be overridden to merge, so raising the
setting now adds nothing.

### 5.3 Test tiers after the change

One CI tier: `*.test.ts` (unit, ~2 s, 1.3 s of it entry data
validation). The two invariant files keep the `*.corpus.test.ts` name,
so `bun qa:test` skips them, and `test-tiers.test.ts` keeps guarding
that name. Every other corpus file is taken apart: its hand-written
example tests move to a `*.test.ts` beside the rule, its count pins
are deleted, and tests of research code leave with that code (§8).
Two corpus files test research code (`research/residue-sweep`,
`body/implied-one-census`); nothing runs them after step 5, and they
leave with that code in step 6. `test-tiers.test.ts` fails on any other
corpus file `transform:invariants` does not run.

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

A slug is an entry's URL name: the headword stripped of points,
hyphen-joined, and numbered when several headwords strip to the same
stem — `אַב־`, `אָב` and `אֵב` all stem to `אב`, so A00012–A00016 hold
`אב-1` … `אב-5`. 4,412 stems are shared, and 11,640 of the 32,512
entries (36%) are numbered members of such a family.

The stem also drops Jastrow's editorial notation (2026-09-18): `*`,
`(…)`, `?`, `,`, a Roman homograph numeral and a superscript. A parsed
headword has lost these already — 1,337, 2,870 and 806 entries for
`*`, numeral and superscript — so this makes the 20 unparsed headwords
that kept them agree. `=` is kept: A01175 and A01345 are cross
references the headword work still owes, and `slug-unsafe` names them.
The change moved 26 slugs: 20 lost notation, 6 renumbered because a
cleaned stem joined an existing family.

**Frozen at publication, not now** (2026-09-18). Step 7 shipped the
index as a binding input straight away. That was backwards: R10 is
about a *published* slug, and nothing is published. Until v2 ships,
`SLUGS_FROZEN` (`admin/pipeline/migrate/slug-index.ts`) is `false`. A run assigns from
scratch, reports each slug that moved against the committed index as
`slug-changed`, and `--write` rewrites both index files. The machinery
below — prior assignment, retired rows, frozen aliases, the relaxed
gate-6 clause — is kept and switches on with that constant. It must
not be flipped before index maintenance ships with R11: a frozen run
assigns a new rid a slug but does not write it back, so the next run
would assign it afresh.

**What actually moves a slug** (measured 2026-09-17). Not a new entry
from Sefaria: Jastrow is a closed 1903 text, rids come from the export
rather than from us, and they run dense and contiguous — 22 unbroken
letter runs, no gaps. It is our own rules. Assigning from the *source*
headwords instead of the composed ones moves **6,570 slugs, 20% of the
corpus**: gershayim normalisation (`אאלר״ן` / `אאלר"ן`), homograph
extraction (`אב-2` / `אב-I`), superscript homographs (`א-2` / `א-²`).
Every one of those is a transform rule we are still revising — step 8,
the ported judgment-class detectors, the 309 unparsed headwords. So 20%
of published URLs hang on decisions not yet final, and freezing is what
cuts that cord.

### 7.1 The slug index (R10)

`data/slug-index/entries.jsonl` records the assignment: one row per rid,
`{"rid","slug","status"}`, rid-sorted, 32,512 rows and 1.73 MB as the
tree stands. It is reference data (§1.1) — once frozen, the pipeline
reads it as an input. `status` is `live` or `retired`; a retired row keeps its slug
reserved so a URL is never handed to a different word.

**Who writes it.** Before publication, `migrate --write`, from the
run's own assignment. After it, a frozen run reports the rows the index
is missing (`slug-new`, `slug-alias-new`) and writes nothing; appending
a row for each new rid and retiring the absent ones is index
maintenance, and it ships with the atomic write (R11, §10).

The record lives there rather than being read back off `data/entries/`
because under R11's atomic swap the old entry tree is gone at the moment
the new one is written. The index is not.

It duplicates the `slug` field of every entry file. A gate keeps that
honest rather than a promise: entry-data validation checks slug against
index row both ways, in `bun qa` (§5.1). `data/page-index/entries.jsonl`
sets the precedent — it already carries a duplicated `headword` column
as a human-readable check.

It is a *routing* index (slug → which entry), not a search index.
Search needs headword → rid, which `compile.ts` builds from entry data
(data-architecture §3); putting headwords here would be a third copy of
them.

### 7.2 Bare-stem aliases

`data/slug-index/aliases.jsonl` gives a collision family's bare stem a
destination: `{"rid","slug"}`, 4,412 rows and 0.15 MB, the bare stem
pointing at the family's first member — the one holding `stem-1`. Typing
`אב` reaches the start of the run rather than nothing.

Not *every* family: one whose bare stem is already some member's own slug
has no alias to give, because a name cannot be both an entry and a
redirect. That is the `slug-bare-held` row of §7.3, and it arises only
under freezing. All 4,412 families have an alias as the tree stands.

Once frozen, an alias is frozen exactly as a slug is. It is assigned once and never
re-points, even if a member with a lower rid arrives later; a name that
moves is the thing this section exists to prevent.

It may therefore outlive its target's entry. When the `stem-1` member
retires, the alias stays pointed at that retired row and the row keeps
it routable; requiring a live target would leave no valid state at all,
since deleting the alias fails the "every family has one" check and
keeping it would fail a liveness check.

The alias row is data, not behaviour. Whether the app redirects the bare
name to the first entry or shows a disambiguation page listing the whole
family is an app decision, changeable at any time without a slug moving.

Sefaria has no equivalent (measured 2026-09-17): its canonical URL is
`Jastrow,_<pointed headword>_<numeral>`, and both `Jastrow,_אָב` and
`Jastrow,_אב` return 404. The unpointed form is still a real key for
them — `/api/words/אב` returns the whole family across their lexicons —
but it is an API, not a URL. A bare-stem route puts us slightly ahead of
the source.

### 7.3 Assignment under freezing

Applies once `SLUGS_FROZEN` is `true`. Before that every rid is a new
rid in an empty index.

| Case | Result |
|---|---|
| rid has an index row | keeps that slug, whatever its headword says now |
| new rid, stem unused | takes the bare stem |
| new rid, stem already held | takes the lowest unused number in that family; no existing member moves |
| entry deleted | row kept, `status: "retired"`; slug never reissued |
| headword respelled, so its stem no longer matches its slug | slug stands; review row `slug-frozen-stem-drift` |

Freezing means the numbering stops being a function of the corpus. Where
that shows is a stem first held by a single entry: that entry keeps the
bare slug when a second one arrives, so the family's bare name is a
real slug rather than an alias. Gate 6 keeps checking uniqueness for
every rid, and applies its "a collided stem must not hold the bare slug"
clause only to families with no frozen member — for a frozen one it is a
review row, not a failure. A moved URL is the one outcome none of this
trades away.

## 8. Archive

| What | Where | Note |
|---|---|---|
| research code (§4.1 last row) and its 4,265 test lines | tag `archive/v2-research-2026-09` + branch of the same name; deleted from `v2` | dead code is not linted, typed, or tested. `research/patterns.ts` and `research/manifest.ts` move into `patch/` first; the pipeline imports them |
| page-index build code | same archive branch | stays re-runnable; `data/page-index/README.md` already documents the method and is kept with the data |
| research docs: `discovery-round-*`, `transform-batch-*`, `phase-2-*`, `body-*`, `pattern-triage`, `catalogue-audit`, `baseline-audit`, `divergence-audit`, `body-review/` | `docs/archive/` on `v2` | history stays readable and linkable |
| registry `PENDING` commentary (490 lines inside an empty array) | `docs/archive/registry-history.md` | zero behaviour change |
| `.superpowers/`, `.claude/worktrees/*`, `.worktrees/` | delete stale entries | two stale worktrees today |
| research notes filed beside the data: `data/patches/{catalogue-audit,discovery-round-2,discovery-round-3,checkpoints}/`, `data/source/divergence-report.json` | `docs/archive/` on `v2` | reports, not correction data or source data (§1.1); confirm no file is a `migrate` input before moving. Not `data/patches/pilot/`: `patch/apply.ts` loads it as carry-over patches. **Cost measured 2026-09-16:** 11 surviving source files cited paths inside `data/patches/catalogue-audit/` and were rewritten to `docs/archive/catalogue-audit/` in the same commit — the maintainer's decision, not an accident |
| `data/patches/tranches/` | stays | **Added 2026-09-16:** not named above. It is a production input, read by `patch/apply.ts` alongside `pilot/`; neither is archived |
| `audit:corpus`, `admin/pipeline/audit-corpus.sh` | deleted | *Shipped in step 5*, alongside the Corpus Audit job (§5.1) — not step 6 work |
| `transform/rules/headword-census.ts`; `walkSenses`, `stripTags` and `classifyBoundary` in `body/census.ts` | archive with the research code | `headword-census.ts` lost its only importer in step 5. `census.ts` cannot leave with it: nine modules import `walkSenses` today, and six outlive step 6 — `body/dry-run-report.ts`, `patch/seed-sense-runs.ts`, and the `labels`, `form-sections`, `lettered` and `units` body tests. `seed-sense-runs.ts` also imports `stripTags`. Move both helpers into a module that stays before archiving `census.ts`. **Corrected 2026-09-16 (step 6):** the helper count is three, not two — `body/units.ts` imports a third, `classifyBoundary`, and is on the migrate path. The six-survivor count was right for the wrong reason: it counted `patch/seed-sense-runs.ts`, which could not survive (it imports `./seed-tranche.ts`, which imports `../research/chunks.ts`; all three seeders archived together, their output committed under `data/patches/tranches/` and read by production `patch/apply.ts`, so nothing was lost), and missed `body/units.ts`, which does. The six that actually outlive step 6 are `body/units.ts`, `body/dry-run-report.ts`, and the `labels`, `form-sections`, `lettered` and `units` body tests. All three helpers moved into `body/sense-walk.ts`, which stays, before `census.ts` was archived |

**Wart, unresolved (2026-09-16):** the archive branch and tag share
the name `archive/v2-research-2026-09`, so a bare
`archive/v2-research-2026-09` reference is ambiguous to git
("refname is ambiguous"). Both `refs/heads/` and `refs/tags/` resolve
it correctly, and every citation written into source code uses
`refs/tags/`. Left for the maintainer to decide whether to rename one
of them.

`package.json` after the move: `pipeline:fetch`, `pipeline:migrate`,
`pipeline:compile` (when built), `pipeline:patches`, `pageindex:verify`,
`qa*`, the invariants runner, `transform:count` (§3.1's rule-alone
counter, still live), and `body:dry-run` (survives because
`migrate.ts` imports `dry-run.ts`'s `buildTrace`). `research:apply` is
renamed `pipeline:patches`; it is the patch engine, not research, and
stays runnable on its own.

## 9. Documents

| Document | Change |
|---|---|
| `admin/pipeline/README.md` | rewrite around §3: inputs, stages, report, buckets; delete every "one-time" and "retires" |
| `docs/specs/2026-07-08-v2-data-architecture-design.md` §6 | strike D14's one-shot wording with a pointer here; changelog row |
| `docs/v2/review-queue.md` (new, interim per R7) | *Superseded 2026-09-18 by the two rows below.* Planned as one hand-written list of every open review item; measuring it showed half of it is pipeline output, which must be generated, and half is research, which is not pipeline at all |
| `docs/v2/review-report.md` (new, generated) | every review and patch row of the last run, split by `publication` (§3.1.1) |
| `docs/v2/research-backlog.md` (new, hand-written) | what the research left open: sweep escalations, the implied-`1)` census, pattern classes with no rule, with the cutover-blocking classes in their own section. Imported into the tracker once one is chosen, then archived with the rest of the research |
| `docs/v2/sefaria-report.md` | add register rows #16 (implied sense 1) and #6b (nested anchors, different targets); then send. *Sections added, step 9; sending is the maintainer's* |
| `docs/v2/upstream-issues.md` | mark rows reported when sent |
| `CONTRIBUTING.md`, `.claude/CLAUDE.md`, `docs/v2/test-tiers.md`, `.github/workflows/ci-lint.yml` comments | one CI test tier; no Corpus Audit, no Rebuild; the invariants script is run locally before rule-code PRs (step 5) |
| every document that calls `data/entries/` "truth", `docs/pipeline-flow.drawio.svg` included | §1.1 terms (step 10) |

## 10. Later, pinned here so they are not lost

| Item | Owner spec |
|---|---|
| Update run: three-way merge of §3.2, conflict rows, then blessing; the atomic write and the retirement of the empty-tree guard (R11) | its own spec, built after §11 (R6) |
| Maintenance dry run (§3.3; brainstorm first: scheduling is open against R9); the CI egress allowlist must admit `storage.googleapis.com` and the runner must hold a 2.4 GB streamed download | after §11 |
| **Admin tool: a page/column edit must also update `data/page-index/entries.jsonl`** (R2) | admin tool spec |
| Review rows → tracker issues; idempotent on `(rid, kind)`; batching for volume (thousands of rows will not work as one issue each) | admin tool spec |
| `compile.ts` | data-architecture §3 |
| Port judgment-class detectors from archived research code | ad hoc, one class per PR |
| Review the 298 low-confidence page placements | review queue |
| **Sefaria URL compatibility:** a route where swapping `sefaria.org` for `jastrow.app` finds the word. Their canonical name is `Jastrow,_<headword>` using the export's `headword` string verbatim, so the mapping is a column we already hold; the work is routing and percent-encoding | `docs/v2/url-routes.md`, app work |
| Drift and "creates no defect" checks from the retired corpus files: each one worth keeping becomes a review detector emitting report rows, with no pinned numbers (§5.1) | ad hoc, one per PR; start from `docs/v2/retired-corpus-checks.md` |
| Drift-classify carry-over zero-match (check target on pre-transform source; 3 of 66 carry-overs are exceptions to that test: P000024, P000029, P000027) | after §11 |
| Import `docs/v2/research-backlog.md` into the tracker, then archive it | admin tool spec |

## 11. Sequence

Small PRs into `v2`, in this order; each stands alone.

Steps 1–4 have shipped and are kept as history.

1. *Shipped (#85, #86).* This spec, the D14 strike-through, and the
   README rewrite (§9).
2. *Shipped (#88).* Biome config and the format step (§6).
3. *Shipped (#89), partly withdrawn.* Data validation in `bun qa`
   stays. The Rebuild CI job it added is withdrawn by R9 and removed
   in step 5; required checks deferred (§5.2).
4. *Shipped (#90).* Structured report rows and the patch-preflight
   change (§3.1, §4.2).
5. *Shipped (#92).* Remove the Rebuild and Corpus Audit CI jobs; move hand-written
   example tests to the unit tier; delete count pins; the two invariant
   files become a local script (§5.1, §5.3).
6. *Shipped (#93).* Archive move and `package.json` reduction (§8).
   36 source files and 27 tests archived to branch and tag
   `archive/v2-research-2026-09`; 35 research documents and
   `body-review/` (9 files) moved to `docs/archive/`; 490 lines of
   registry `PENDING` commentary extracted to
   `docs/archive/registry-history.md`; four research directories and
   the divergence report moved out of `data/`; `package.json` cut
   from 25 scripts to 13 with `research:apply` renamed
   `pipeline:patches`; `biome.json` taught to leave `docs/archive`
   alone. Nine migrate gates green throughout, with counts
   byte-identical to `docs/v2/migration-blessing.md`.
7. *Shipped (#95).* Slug freezing (§7): `data/slug-index/` seeded from the committed
   tree (32,512 index rows, 4,407 aliases), `assignSlugs` taught to
   take prior assignments, gate 6 relaxed for frozen families, five
   review rows, and the index-agreement check in entry-data
   validation. The control is that a dry run's nine gates and blessing
   counts do not move: freezing is a no-op on a corpus that has never
   been rebuilt, so any movement means the logic is wrong. R11's write
   mechanics and index maintenance on write are *not* in this step
   (§10). **Outcome:** two dry runs, before and after the validation
   gate, left `migration-blessing.md` byte-identical with every freeze
   counter at zero — `slug-new`, `slug-frozen-stem-drift`,
   `slug-alias-new` and `slug-bare-held` — so freezing moved nothing on
   a corpus never rebuilt. `slug-unsafe=12` is the fifth row kind and
   reports a property of the headwords, not movement. The
   validation gate was seen to fail on a planted one-character slug
   edit. Two row kinds beyond the three the plan named —
   `slug-alias-new` and `slug-unsafe`; the latter reports 12 slugs
   carrying Jastrow's editorial notation (`*`, `(…)`, `=`, `?`) into a
   URL. Plan and findings:
   [`docs/superpowers/plans/2026-09-17-consolidation-step7.md`](../superpowers/plans/2026-09-17-consolidation-step7.md).
   **Follow-up (2026-09-18):** the freeze was premature and is switched
   off until publication (R10, §7); `slugStem` drops editorial notation,
   moving 26 slugs and taking `slug-unsafe` from 12 to 2; `unsafeSlugs`
   became an allow-list (it had found 12 of the 22 notation slugs).
   Nine gates green; a second dry run reported `slug-changed=0`.
8. *Shipped (#98).* `repairs.ts` hand tables → patches (§4.1).
   `seed-reviewed.ts` ran once and wrote 96 patches (`P000194`–
   `P000289`) for 66 rids: 36 `join`, 48 `replace`, 9 `retag`, 3
   `unref`; the reviewed manifest records 66 `repaired` and 3
   `needs_human_judgment` (`D00470`, `K00081`, `R00519`). Before the
   cut-over, an ordering measurement over the 66 repaired rids found
   33 identical whether the old repair ran before or after the
   transforms, 28 differing only in whitespace, 2 differing in real
   text (`C00062`'s rtl span, `H00871`'s two `Ib.` links), and 3
   broken outright (`C01169`, `C01331`, `V00765`) — every seeded patch
   was authored against post-transform text, so all 66 reproduce it
   exactly regardless. Cut-over (`rm -rf data/entries && bun
   pipeline:migrate --write && bun qa:format`): `git status --short
   data/entries data/slug-index` came back empty, so the entry tree
   is byte-identical; patches applied rose 118 → 214; `bun run
   transform:invariants` 11/11. Three blessing rule-count rows moved:
   `paren-tag-no-space` 136 → 108 (the 28 rejoin rids), `bare-rtl-hebrew`
   5120 → 5121 (`N00327`), `unlinked-bare-anaphor` 1750 → 1749
   (`H00871`); the six non-binyan `repairs:*` rows are gone. The
   orphan gate (`migrate/orphan-refs.ts`, row kind
   `orphan-ref-unbased`) is a real gate again: a green run reports 0,
   and the positive control (`P00331`'s cite-wrap patch removed)
   reports 1 and exits 1.
9. Review report, research backlog, Sefaria report refresh (§3.1.1,
   §9). *Reworked 2026-09-18.* Planned as one hand-written review
   queue; measuring it split it in two. **Done:** `sefaria-report.md`
   gained §6b (`O00832`, the only different-target nesting in all
   32,512 entries — the outer anchor wraps two inner ones, not one)
   and §16 (implied sense 1: 44 entries confirmed in review, 21 not
   yet reviewed); `upstream-issues.md` rows #6b and #16 carry the same
   counts. Sending the report, and marking rows reported, is the
   maintainer's. **To do:** the `publication` field and
   `docs/v2/review-report.md` (§3.1.1); `headword-unparsed` stops
   firing on a space between words; `docs/v2/research-backlog.md`
   replaces the hand-written queue. The control is a dry run: gates
   and rule counts unchanged, `headword-unparsed` 309 → 33, and
   today's report 35 `blocks` (33 headwords, 2 slugs) and 2,204
   `defer`.
   Measuring the queue corrected four figures §9 had carried: 276 of
   the 309 unparsed headwords parse (all multi-word); `D00341` was repaired in step 8,
   leaving 3 deferred rows, not 4; `patterns.jsonl` has 5 `blocked`
   classes, not 1; and the earlier chunk sweep (pilot and
   `tranche-01`, on pre-patch text) left 101 escalations the residue
   sweep never revisited, on top of the 487. It also found 32 open
   research classes still flagged `blocking: true` (step 11).
10. Terms sweep (§1.1, `docs/glossary.md`): documents say source,
    entry, compiled, reference and correction data, and import for
    migrate; `package.json` scripts become `data:fetch`, `data:import`
    (and `data:compile` when built). Which other scripts take the
    `data:` prefix, and whether code identifiers such as `migrate.ts`
    and `migrate/truth.test.ts` are renamed, is decided then.

11. Research backlog triage (added 2026-09-18). The pattern catalogue
    still flags 32 open classes `blocking: true` — 31 on the `judgment`
    route and `open-paren-in-rtl-span` on `blocked`, 6,489 instances
    as catalogued — under sweep-tiering T6 ("blocking = breaks the
    render or would be baked in"). The 2026-08-15 triage ruling that
    no sweep *escalation* blocks shipping does not reach these class
    flags, and nothing reconciled the two. For each class: recount it
    on current entry data (some were flagged before later rules
    changed the text), draft keep-blocking or defer against T6, and
    the maintainer rules. A class that still blocks is fixed before
    publication (§3.1.1); the rest go to the tracker with the backlog.
    The 23 blocking classes on the `transform` route each have a
    registered rule and are not in scope.

## 12. Changelog

| Date | Change |
|---|---|
| 2026-09-13 | Initial draft from the review session; rulings R1–R7 recorded |
| 2026-09-14 | R2 narrowed to the page-index note; R6 reworded: the pipeline runs on the current export and commits the snapshot it used; §3.2 three-way merge as the fresh-vs-update mechanism; §3.3 patch lifecycle (`upstream-fixed` / `upstream-changed`) and the scheduled maintenance dry run; report routing per the maintainer's flow diagram |
| 2026-09-14 | PR #85 review: §3.2 base is the truth tree as last written, never a rebuild with current rules; identified by a content-addressed git tree id (`writtenTree`) in a committed file, not by a commit sha; §6 biome rationale corrected (`*` does not cross `/`) |
| 2026-09-14 | Step 4: §4.2 a stale pin is a header count and each patch is judged by its precondition, `--strict` restores refusal; §3.1 row fields and kinds as built, rule counts are composed; §5.2 required checks deferred to near release |
| 2026-09-14 | Final-fix wave: §5.1 Rebuild runs `--strict`; §4.2 carry-over zero-match documented as `superseded`, not drift-classified, with the gap pinned at §10 |
| 2026-09-15 | R8 data terms (§1.1; "truth" becomes entry data) and R9 `migrate` is not CI work. §5 rewritten: Rebuild, Corpus Audit, the Invariants CI job and `expected-counts.json` withdrawn; invariants run locally; ~190 hand-written example tests move to the unit tier; drift checks become review detectors (§10). §1 corpus-tier measurement corrected; §3.3 scheduling marked open against R9 pending a brainstorm; §11 step 5 rewritten, step 10 added. R8 extended: `migrate` becomes import with `data:` command prefix; vocabulary moved to new `docs/glossary.md` |
| 2026-09-15 | Step 5: Rebuild and Corpus Audit jobs removed; 193 corpus-tier tests moved to the unit tier (182 fixed-input, 11 on a committed gershayim fixture), 191 deleted and inventoried in `docs/v2/retired-corpus-checks.md`; registry order split so its static assertions run in `bun qa`; paren→phrase direction pinned statically; `transform:invariants` script and tier guard added; §1, §5.1, §5.3, §8, §10, §11 amended |
| 2026-09-16 | Step 6: research code archived at `archive/v2-research-2026-09`; docs and research data to `docs/archive/`; registry `PENDING` commentary extracted; `package.json` 25 → 13 scripts (not the 24 → 12 the plan predicted; step 5 had already added `transform:invariants`, and `body:dry-run` survives). §8 corrected: three census helpers, not two (`classifyBoundary` is on the migrate path); `patch/seed-tranche.ts` and `patch/seed-sense-runs.ts` added to the §4.1 archive list; `data/patches/tranches/` named as a production input |
| 2026-09-17 | R10 (a published slug never changes; the assignment is recorded in `data/slug-index/entries.jsonl`, not inferred from the entry tree) and R11 (the write is atomic; the empty-tree guard is a D14 relic and retires with the update run, and is not replaced by a prompt). §7 rewritten with §7.1 the index and §7.2 the assignment rules; §1.1 reference data, §5.1 validation row and §10 row 1 amended; §11 step 7 spelled out and step 6's PR number backfilled |
| 2026-09-17 | Maintainer's challenge to the slug design answered by measurement: the hazard is not Sefaria adding entries (Jastrow is a closed 1903 text, rids are dense and contiguous) but our own headword rules — 6,570 slugs, 20% of the corpus, differ between the source and composed spellings. The rid-renumbering contingency was dropped; §7 rewritten around the measured reason. §7.2 bare-stem aliases added (4,407 rows, frozen like slugs) after the ruling that every family's bare name must reach its first member; Sefaria 404s on both bare forms and exposes the family through `/api/words/` only. `docs/v2/url-routes.md` opened for the Sefaria URL-compatibility route and the landing-behaviour choice; both listed in §10 |
| 2026-09-17 | Step 7: `data/slug-index/` seeded (32,512 rows, 4,407 aliases); `assignSlugs` takes the prior assignment; `migrate` reads the index and emits five review rows; gate 6's bare-slug clause relaxed for frozen families; entry-data validation checks slug against index row both ways. Nine gates green and the blessing doc byte-identical across two dry runs. `slug-unsafe` added as a fifth row kind: 12 slugs carry editorial notation into a URL. The "11,627 numbered members" figure corrected to 11,626 — P00224's slug ends `-²`, which a loose digit test counted |
| 2026-09-18 | Maintainer overruled step 7's freeze: R10 binds at v2 publication, not during development. `SLUGS_FROZEN = false` until then — runs regenerate slugs and aliases, report `slug-changed`, and `--write` rewrites the index; the frozen path is kept behind the switch. `slugStem` drops `*`, `(…)`, `?`, `,`, Roman numerals and superscripts, keeps `=`: 26 slugs moved, aliases 4,407 → 4,412, numbered members 11,626 → 11,640, `slug-unsafe` 12 → 2. `unsafeSlugs` is now an allow-list. §7, §7.1–7.3 and step 7 amended |
| 2026-09-18 | Step 8: `repairs.ts`'s rid-keyed hand tables converted to reviewed patches (§4.1) and the tables deleted; §4.2 "Who may add bytes" records the authorship ruling and its open question on agent removals; §11 step 8 spelled out with measured numbers. Rule and helper comments elsewhere that quote a count "measured after `applyRepairs`" are left as dated measurements of that snapshot — `applyRepairs` itself changed (rid-keyed passes moved out) but the count a comment recorded is still what that run measured, so those comments are not edited one by one |
| 2026-09-18 | Step 9 reworked (maintainer): import writes `docs/v2/review-report.md`, every review row tagged `publication: blocks / defer / note` by kind, and v2 publishes only with no `blocks` rows (§3.1.1); research leftovers go to a hand-written `docs/v2/research-backlog.md`, imported into the tracker then archived — the hand-written `review-queue.md` is withdrawn. Step 11 added: triage the 32 open research classes still flagged as blocking the cutover. Four §9 figures corrected by measurement; `sefaria-report.md` §6b and §16 added, register rows #6b and #16 recounted; step 8's PR number backfilled |
