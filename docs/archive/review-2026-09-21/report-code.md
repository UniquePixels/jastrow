# Code review — `admin/pipeline` at `12a40a30` (branch `review/2026-09-20-comprehensive`)

Read-only review, 2026-09-20. Every claim cites a file:line that was read. Paths are relative to `admin/pipeline/` unless prefixed. Scripts and raw outputs in the scratchpad: `docstrings.ts`/`docstrings.out`, `dead.ts`/`dead.out`, `hygiene-hits.txt`, `hygiene-counts.txt`, `qa.log`, `invariants.log`.

## Executive summary

1. **Gates:** `bun qa` exit 0 — `qa:format` changed 0 files, lint "Found 149 infos" (not counted by `--error-on-warnings`), 1481/1481 unit tests pass, tsc clean. `bun run transform:invariants` 11/11 pass in 211 s.
2. **Docstrings:** 493 exports across 95 non-test files, 396 documented = **80.3 %** — ~2 symbols above CodeRabbit's 80 % `mode: error` gate. 6 files lack a module doc. Uncovered include `applyTransforms`, the `Rule` interface, `SourceEntry`/`SourceSense`, `TruthEntry`/`TruthSense`, `Report`, `FinishContext`.
3. **Comment hygiene:** 570 narration-pattern hits in non-test source; `transform/registry.ts` has 121 and is 77 % comment (1433/1843 lines) with 155–194 lines of dated self-correction. 179 date literals outside doc-path citations; 26 "Brian ruled" by-lines; 33 `CORRECTED/MOVED/REORDERED` markers. TODO/FIXME/XXX/HACK: 0.
4. **Dead code:** 101 exports with no reference outside their own file, 85 test-only; `migrate/seed-slug-index.ts` is a run-once seeder that says it has already run; `headword-issues.ts` is an untested one-shot script with a top-level `await main()`; every export of `migrate.ts` has no importer.
5. **Bugs:** high 1 (a `text-repairs` rule can delete text unseen by any gate — documented, open); med 7; low ~10. No data-corrupting bug found on the migrate path; the serious findings are gates that cannot see a class of failure.
6. **Tests:** `migrate.ts` (734 LOC, 18 functions) has no test and is never executed; `patch/snapshot.test.ts` reads `data/source/` in the unit tier, invisible to `test-tiers.test.ts`, contrary to spec R9; `transform/run.test.ts` cannot detect a removed gate.
7. **Consistency:** every report-row emitter conforms to `{rid,bucket,kind,severity,detail}`; 0 `any`, 0 non-null `!`, 3 justified `biome-ignore`; three sort-order policies coexist.
8. **Duplication:** 7 helper pairs that should be one — including two `multiset`s that *disagree* and a patch preflight implemented twice (`migrate.ts` vs `apply-cli.ts`).
9. **Lint gate is softer than it looks:** `biome.json:44-45,196` set length/complexity rules to `"on"` (= default severity, info), so 149 findings never fail `bun qa`.
10. **Top fix:** close the `no-lost-text` phase gap and add the `run.ts` identity guard (two small changes); then trim registry.ts narration, write `migrate.test.ts`, lift the duplicates.

## 1. Gates

| sev | conf | where | claim | evidence |
|---|---|---|---|---|
| — | high | `bun qa` | Passes end to end. | `qa.log`: `1481 pass / 0 fail / 12700 expect() calls / Ran 1481 tests across 88 files. [1.79s]`; tsc silent; `EXIT=0`. `qa:format` changed nothing. |
| — | high | `bun run transform:invariants` | Passes. | `invariants.log`: `11 pass / 0 fail [211.32s]`. |
| med | high | `biome.json:44-45`, `:196` | 149 lint diagnostics are emitted at **info** and never fail the gate. | 13× `noExcessiveLinesPerFunction`, 3× `noExcessiveLinesPerFile`, 1× `noExcessiveCognitiveComplexity`, 2× `useErrorCause`, 1× `noMisleadingReturnType` shown; 129 hidden by cap. Rules configured `"on"` = default severity = info. |
| low | high | `qa.log` head | One Biome I/O error on `.vscode/settings.json` — sandbox deny-list, not a repo defect. | |

## 2. Docstring coverage

**Method:** TypeScript AST walk over every `*.ts` under `admin/pipeline` excluding tests and fixtures; exported names resolved through trailing `export { … }` lists; "covered" = a `/** */` block immediately above the declaration.

**Totals:** 95 files · 493 exports · 396 covered · 97 missing · **80.3 %**. CodeRabbit: `.coderabbit.yaml:18-20` `pre_merge_checks.docstrings.mode: error`, default threshold 80 %, scored on the PR diff.

**Files without a module-level doc (6):** `migrate/page.ts`, `migrate/slug-index.ts`*, `migrate/slug.ts`*, `transform/rules/italic-paren.ts`, `transform/rules/paren-boundary.ts`, `transform/rules/v-sub-twin.ts`. (*Open with a doc block but no blank line before the first declaration.)

**Per-file uncovered, worst first:** `migrate/report.ts` 8/18 · `migrate/slug-index.ts` 6/17 · `patch/schema.ts` 5/32 · `body/types.ts` 4/6 · `migrate/types.ts` 4/5 · `patch/apply.ts` 4/28 · `migrate/cite.ts` 3/8 · `transform/html.ts` 3/14 · 2 each: `body/compose`, `body/dry-run-report`, `body/dry-run`, `body/form-sections`, `body/lettered`, `body/rejoin`, `body/repairs`, `migrate/finish`, `migrate/markup`, `transform/links`, `rules/duplication`, `rules/edge-trim`, `rules/unlink` · 1 each: 33 further files. Full list in `docstrings.out`.

**Uncovered exports of note:** `transform/run.ts:50 applyTransforms`; `transform/types.ts:465 Rule`; `body/types.ts:19,26,50,56 SourceSense/SourceEntry/BodyStem/BodyEntry`; `migrate/types.ts:8,15,22,28 FormObject/TruthSense/TruthStem/TruthEntry`; `migrate/finish.ts:13,19 FinishContext/Finished`; `migrate/slug-index.ts:191,198 writeSlugIndex/writeAliases`; `migrate/report.ts:7,8,10,21,53,58,69,101` incl. `Report`; 17 rule consts in `transform/rules/*.ts`; `patch/schema.ts:52,53,198 Confidence/PatchOp/SemanticPatch`; `patch/apply.ts:53,54,61,163`.

**Stale / wrong / narrating docstrings:**

| sev | conf | file:line | claim |
|---|---|---|---|
| med | high | `migrate.ts:673-677` | `main`'s docstring says "the migration is a one-shot" — contradicts R1 and the module doc. |
| med | high | `patch/no-new-text.ts:36-38` | Comment on `MARKER_TOKENS` describes a "non-global twin" that does not exist; regex is `/gu`. |
| med | high | `transform/no-lost-text.ts:48-51` | Docstring claims the NUL separator never enters the multiset; code has no NUL skip (live probe confirmed). |
| low | high | `transform/no-new-text.ts:5` | "the 80 rules" — there are 55. |
| low | high | `types.ts:481`, `registry.ts:106,311,1173`, `types.ts:12`, `no-new-text.ts:15` | Six stale line-number cross-references. |
| low | high | `migrate/biome.ts:1-13` | Module doc is a bug story. |
| low | high | `migrate/orphan-refs.ts:1-8,13-28` | Describes the module by what it replaced. |
| low | high | `headword-issues.ts:349-355, 385-394` | Docstrings narrate the file's own revisions. |
| low | high | `patch/apply-cli.ts:112-118` | Comment documents dead code instead of removing it. |

## 3. Comment hygiene

Counts = `grep -E` line hits in non-test source (tests in parentheses). `TODO`/`FIXME`/`XXX`/`HACK`/`deprecated`: **0**.

| pattern | src (test) | verdict |
|---|---|---|
| `2026-` | 230 (77) | 51 are doc-path/tag/tranche citations; **179** dated narration. |
| `Ruling`/`RULING` | 49 (6) | Labels `Ruling C–F` defined only in archived research docs; `patch/apply.ts` uses them 30+ times. |
| `Brian` | 26 (10) | By-line + date on a ruling. |
| `PR #` / `#NN` | 6 / 9 | Narration. |
| `step N` | 77 (38) | Consolidation step numbers; narration once shipped. |
| `batch N` | 110 (36) | Research-batch numbers; narration except `apply.ts:118-141` (directory names). |
| `tranche` | 12 (11) | Load-bearing in `apply.ts:118-141`; narration elsewhere. |
| `used to` / `no longer` / `previously` | 18 / 28 / 1 | Narration by construction. |
| `legacy` | 9 | `body/cite.ts:49-74`, `transform/html.ts:184-227` name a fallback parse mode — keep. |
| `PENDING` | 31 (20) | Enum value in `commutation.ts:73` — keep there. |
| `CORRECTED`/`MOVED`/`REORDERED` | 33 | registry.ts 13, then paren-boundary, malformed-href, registry-classes, link-target 3 each, etc. |

**Hits by file:** `transform/registry.ts` 121 · `patch/apply.ts` 58 · `transform/link-target.ts` 38 · `rules/anaphora.ts` 24 · `transform/types.ts` 18 · `rules/headword.ts` 17 · `rules/unlink.ts` 16 · `transform/registry-classes.ts` 16 · `rules/paren-boundary.ts` 13 · `rules/malformed-href.ts` 12 · `transform/links.ts` 10 · `transform/abbrev-vocab.ts` 9.

**Comment share:** registry.ts 77 % · types.ts 88 % · link-target.ts 59 % · rules/anaphora.ts 68 % · patch/apply.ts 30 % · migrate.ts 18 %.

Key rows: `transform/registry.ts` 155–194 dated self-correction lines (`:127, :262, :333, :574-575, :1696-1697, :1793`), while `:1419-1420` says `docs/archive/registry-history.md` exists for exactly this. `patch/apply.ts:101-144, 349-367, 425-458, 506-514, 641` docstrings framed as "(task-3 addendum-3, Ruling F)". `migrate.ts:134-138, 257-262, 588-595`; `migrate/gates.ts:80-85, 263, 457-458`; `migrate/slug-index.ts:58, 277-280`; `migrate/validate.ts:347`; `patch/apply-cli.ts:65-69, 112-118`; 26 "(Brian, date)" attributions across rules; `body/*` module docs describing step-8 moves; `transform/count.ts:1-54` 54-line module doc.

## 4. Dead code / unused

**Totals:** DEAD **101** · TEST-ONLY **85** · non-test modules with no non-test importer and no script: 5 (`migrate/validate.ts` by design; `migrate/seed-slug-index.ts`; `transform/registry-classes.ts`, `transform/commutation.ts`, `transform/rules/corpus-fixture.ts` — invariants support).

| sev | conf | file | claim |
|---|---|---|---|
| med | high | `headword-issues.ts` (569 LOC) | One-shot script at pipeline root: no exports, no test, top-level `await main()` at `:569`; writes its own `docs/v2/headword-issues.{md,csv}` instead of report rows; re-implements `slugStem` mark stripping. Either port shape checks into `migrate/` as tested review rows or archive. |
| med | high | `migrate/seed-slug-index.ts` | Run-once seeder whose own doc (`:2-12`) says it has run; imported only by its test. Analogous `patch/seed-reviewed.ts` was archived. |
| med | high | `migrate.ts:725-734` | All eight exports have zero importers; no `migrate.test.ts`. |
| low | high | `patch/apply.ts:53,54,59` | `CORPUS_PATH`, `MANIFEST_PATH`, `REVIEWED_DIR` exported, unreferenced. |
| low | high | `patch/schema.ts:99` | `ReformPayload` unreferenced. |
| low | high | `patch/patterns.ts:57,87,92,101,114,146` | `SATURATION_ROUNDS`, `renderPatterns` dead; four more test-only. |
| low | high | `patch/snapshot.ts:53,163` + 5 test-only | `hashSnapshotFiles`, `verifySnapshot` dead. |
| low | high | `patch/manifest.ts:22,29,34,83,278` | Five dead exports. |
| low | high | `transform/rules/*` | 30 rule-internal helpers exported but unreferenced. |
| low | med | `transform/count.ts` | Compares to `patterns.jsonl` `corpusCount` pins the spec withdrew; no test. Keep or archive. |
| — | high | fixtures | No unused fixture; no tracked `.DS_Store`. |

## 5. Correctness

| sev | conf | file:line | claim | evidence |
|---|---|---|---|---|
| **high** | high | `transform/run.ts:70-72`; `no-lost-text.ts:35-43` | `checkNoLostText` runs only for `structural-repairs`; a `text-repairs` rule that deletes text passes every gate. | The docstring says so itself; gate 3 compares after transforms. |
| med | high | `transform/run.ts:61-64` | No identity guard: an in-place mutating rule makes all four gates compare an object with itself. | `types.ts:474-491`: "Nothing detects this." |
| med | high | `no-lost-text.ts:52-58` | Counts U+0000, contrary to docstring; a structural rule removing an empty field is refused with a message naming NUL. | Live probe. Fail-closed. |
| med | high | `no-new-text.ts:197-198`; `no-lost-text.ts:120-121` | Both text gates are codepoint multisets over the whole entry: reorderings and cross-field moves invisible. | Probe passed a headword→definition move + reversal. |
| med | high | `no-new-text.ts:182,198` | `Rule.allows` licenses unlimited copies per codepoint, not one; `registry.ts:1234-1236` declares "one period per member". | |
| med | high | `migrate.ts:139-182` vs `apply-cli.ts:43-64`; `migrate/patches.ts:74-95` vs `apply-cli.ts:125-141` | Patch preflight implemented twice; the CLI copy is inside `import.meta.main` and untestable. | |
| med | med | `migrate/publication.ts:6-20`; `migrate.ts:702`; `review-report.ts:44-45` | `classifyRows` runs once; any review row pushed later is unstamped and rendered in no section. | Add an assertion in `renderReviewReport`. |
| low | high | `migrate.ts:559-566` | `internalTargets` tally: `unlisted` not subtracted from `pass`; gate can print `N/N` with failures (still refused by `isGreen`). | |
| low | high | `gates.ts:161`, `slug.ts:144`, `cite.ts:136`, `apply.ts:672`, `registry.ts:1657…`, `headword-issues.ts` ×8 | Bare `localeCompare` where the project elsewhere sorts by code unit or pins `'en'`; `cite.ts:136` keys carry Hebrew and feed the committed blessing doc. | |
| low | high | `patch/apply.ts:697` | `drift` not forwarded; harmless because `:679` already required exact count. | |
| low | high | `body/compose.ts:56-59, 214-217` | `TransformFailure` rethrown without `{ cause }`. | |
| low | high | `apply.ts:302`; `slug-index.ts:87` | JSONL readers split on `\n` only. | |
| low | med | `slug.ts:63`; `slug-index.ts:219,281` | A headword ending in an ASCII digit would file as `stem-N`; none exists. | |
| — | high | Unicode | No violation of the NFC rule: `.normalize()` only on keys/lookups; non-NFC index rows are rejected not normalised; `contentAnchor` hashes raw bytes. | |
| — | high | Determinism | No `Date.now`/`Math.random` on the run path; glob scans sorted or fixed-order. | |
| — | high | Error paths | No swallowing catch on the run path. | |
| — | high | Vacuity | `isGreen` refuses on 0 entries and 0/0 gates (except internalTargets); `mark()` bumps total; `checkQuarantine` fails an unreviewed row. Sound. | |

**Duplicated helpers:** two `multiset`s that disagree (`no-new-text.ts:148-157` vs `no-lost-text.ts:52-58`); `walkSenses`/`walkSensesDeep` (`sense-walk.ts:104-111` vs `repairs.ts:30-37`); two `stripTags` with different malformed-markup semantics; `byCodeUnit` ×2; slug family regex ×3; Hebrew points class with identical 5-line comment ×6; two id→index maps in registry.ts.

## 6. Test quality

LOC/tests on the migrate path: `migrate.ts` 734 / **none** · `body/compose.ts` 237 / 4 · `transform/run.ts` 84 / 3 · `transform/registry.ts` 1843 / 60 · `patch/apply.ts` 752 / 41 · `patch/schema.ts` 1069 / 51 · `migrate/gates.ts` 318 / 16 · `migrate/review-report.ts` 58 / 3. No test file: `headword-issues.ts` (569), `body/dry-run-report.ts` (312), `page-index/verify.ts` (222), `fetch.ts` (206), `transform/count.ts` (162).

| sev | conf | file:line | claim |
|---|---|---|---|
| high | high | `migrate.ts` | Zero tests; never executed by any test. Orchestration (gate order, quarantine, when the tree is written) is invisible to per-module tests. |
| high | high | `patch/snapshot.test.ts:15-27` | Unit-tier test reads `data/source/` (140 ms), contrary to spec R9; none of `test-tiers.test.ts`'s three signals catch it. |
| high | high | `transform/run.test.ts` | Cannot detect a removed gate; only `records` asserted, never `out.entry`. |
| med | high | `test-tiers.test.ts:110-136` | Tier split enforced by three textual signals only. |
| med | high | `body/grammar.test.ts:51-63` | `describe.skipIf` on a gitignored file that "can no longer be regenerated"; silently skips on a fresh checkout. |
| med | high | `migrate/gates.test.ts` | Pins pass/total integers read back from a prior run; `checkHeadwordRoundTrip` has no passing case. |
| med | high | `body/compose.test.ts` | `carryOver` branch only asserted empty. |
| med | high | `headword-issues.ts` | No test for the shape/gap detectors feeding headword decisions. |
| low | high | `finish.test.ts`, `drift.test.ts`, `anaphora.test.ts:506-524` | Untested branches; one `for…of (… ?? [])` vacuity pattern. |
| low | high | duplicates | Duplicate `it` titles in `paren-boundary`, `stranded-tail`, `nested-anchor` tests. |
| — | high | oracle-free patterns | None found (no skip/todo/snapshot/`>=0`). |

## 7. Consistency

Report rows conform everywhere. Rule ids kebab, identifiers camel, Sefaria fields snake — a consistent boundary. `any` 0, `!` 0, `unknown` 74 all narrowed, `biome-ignore` 3 justified. `patch/` uses typed errors; `migrate/` bare `Error` (43 sites). Three sort policies. `buildTrace` lives in `body/dry-run.ts`, a run-path module named after a research harness. Shebang on the library `patch/apply.ts` but not the CLI `migrate.ts`; `apply-cli.ts` has ~120 lines inside `import.meta.main`.

## Top 10 fixes

1. Close the text-phase deletion hole (`run.ts:70-72`).
2. Identity guard in `run.ts:61-64`.
3. Write `migrate.test.ts`; make `run.test.ts` assert `out.entry` and gate wiring.
4. Fix `no-lost-text` multiset; share one `multiset`.
5. Move `snapshot.test.ts` source reads out of the unit tier or add a tier signal.
6. Trim `transform/registry.ts` narration into `docs/archive/registry-history.md`; fix six stale cross-refs.
7. Decide `headword-issues.ts`, `seed-slug-index.ts`, `transform/count.ts`.
8. Un-duplicate the patch preflight.
9. Raise length/complexity lint rules to `warn` or drop them.
10. Docstring the core contracts; un-export the dead 101.

**Not verified:** whether any current `text-repairs` rule already deletes text; ZWJ/CGJ gap impact; the 129 hidden lint infos.
