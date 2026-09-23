# Post-consolidation review — 2026-09-21

**Status: findings and proposed actions, awaiting Brian's decisions (§9).**
Reviewed at `v2` = `12a40a30` (PR #114). Five independent review
passes — code, structure, data schema, pipeline, open issues — each ran
its own scripts; every count below comes from a command that was run,
and the five full reports with their evidence sit in
[`docs/archive/review-2026-09-21/`](../review-2026-09-21/).
Nothing in the tree was changed by the review.

## 1. Verdict against the bar

The bar (Brian, 2026-09-20): the pipeline is done when (a) its data
files can be consumed by compile/admin, (b) any remaining data defect is
correctable in the admin tool after go-live, and (c) it reproducibly
emits the data, an issue list split into must-fix-now vs
fix-after-go-live, and a list of corrections for Sefaria.

| Bar | Verdict | Decisive fact |
|---|---|---|
| (a) data files | **PARTIAL** | Emits 32,512 entries, 0 dropped, 0 markup residue, 0 schema violations (ajv 32,512/32,512), every ref/slug/alias/page row resolves. But the committed tree is one PR behind: a from-scratch `--write` differs by 17 entry files + both slug-index files (#114's 16 patches were never written). |
| (b) defects correctable later | **PARTIAL** | Nothing found that a post-go-live edit could not fix, **except the rows that move a URL**: A01175, A01345, V00518, S01780, U00489 (#113), A02823, and P00855/6/60 (#39). Only 5 of those 8 appear in the review report. |
| (c) reproducible outputs | **NOT MET** | Dry run is byte-reproducible (100 s, tree clean after). The blocks/defer split is wrong in both directions (§6). The Sefaria list is hand-written, cites archived research, and no rule or patch feeds it. |

## 2. Ten headline findings

| # | Finding | sev | conf | Where |
|---|---|---|---|---|
| 1 | 271 of the 300 `headword-unparsed` **blocks** are multi-word headwords flagged only for a space (`LEXICAL` excludes U+0020, `FORM` allows it); ≤29 truly fail, and the headword design settles all of them. | high | high | `migrate/headword.ts:25,48` |
| 2 | The 5 pattern classes step 11 ruled **blocking** (342+88+85+33+22) have **no detector** on the import path; they appear only in rule-file comments. Control: `"senses": []` in exactly 342 files. | high | high | `data/patches/patterns.jsonl` |
| 3 | `grammar.number: "pl"` written for **432 place names**: Jastrow's `pr. n. pl.` means *proper noun, place*, not plural. The test pins the mistake. | high | high | `body/grammar.ts:53`, `grammar.test.ts:24` |
| 4 | `data/entries/` is stale by one PR (19 files); the committed blessing doc's `slug-changed = 7` is the pipeline's own witness. | high | high | §1 |
| 5 | A `text-repairs` rule that deletes text passes every gate — `checkNoLostText` runs only for `structural-repairs`; and no gate catches a rule that mutates its input in place. | high | high | `transform/run.ts:61-72` |
| 6 | Six struck rulings still read as live in satellites: paren-strip (reversed 09-20) in `rules/headword.ts:135` + headword-field spec; "slug frozen at import" in D12, migrate §2.4, glossary; golden render diff in sweep-tiering; `CONFIRMED_NO_CHANGE`; migrate §6's deleted corpus tests. | high | high | §8 |
| 7 | Two rulings run *against* live code: `phrase-alt-headword-stub` still expands ~236 alternates (ruled stopped 09-20, doubles a letter in 2); the D14 "writes once" guard still refuses `--write` on a non-empty tree (R1 says permanent). | med | high | `registry.ts:951`, `migrate.ts:681` |
| 8 | Rulings C–F exist only as docstrings in `patch/apply.ts`; the "task-3 addendum" they cite is in neither the repo nor the archive tag; A and B have no trace. | high | high | `patch/apply.ts:57,102,349,361` |
| 9 | `transform/registry.ts` is 77 % comment with 155–194 lines of dated self-correction; 179 dated narration comments across the tree; docstring coverage 80.3 %, two symbols above CodeRabbit's gate; 101 dead exports. | med | high | §3 |
| 10 | Repo carries 828 MB of dead worktrees, 11 local + 5 remote merged branches, v1 wording in README/CONTRIBUTING/SECURITY/PR template/biome/renovate/CLAUDE.md, and 6 broken doc links. | med | high | §4 |

`bun qa` passes (1,481 tests, tsc clean, format no-op); `transform:invariants` 11/11 in 211 s.

## 3. Code

Full report: [`report-code.md`](../review-2026-09-21/report-code.md).

| Area | Measured | Verdict |
|---|---|---|
| Gates | `bun qa` exit 0; 149 lint findings emitted at **info** because `biome.json:44-45,196` set length/complexity rules to `"on"` | lint gate softer than it looks |
| Docstrings | 493 exports / 396 documented = 80.3 %; 6 files lack a module doc; uncovered include `applyTransforms`, `Rule`, `SourceEntry`, `TruthEntry`, `Report` | at the CodeRabbit threshold; the core contracts are the gap |
| Narration | 570 hits; `registry.ts` 121, `patch/apply.ts` 58, `link-target.ts` 38; 26 "(Brian, date)" by-lines; 33 `CORRECTED/MOVED/REORDERED` | `docs/archive/registry-history.md` already exists for this |
| Dead code | 101 unreferenced exports; `seed-slug-index.ts` (says it has run); `headword-issues.ts` untested one-shot at the pipeline root; all 8 `migrate.ts` exports unimported | |
| Correctness | high 1, med 7, low ~10; no data-corrupting bug on the migrate path; NFC rule honoured everywhere; deterministic | the serious ones are gates blind to a class |
| Tests | `migrate.ts` (734 LOC) has **no test**; `patch/snapshot.test.ts` reads `data/source/` in the unit tier (R9); `run.test.ts` cannot detect a removed gate | |
| Duplication | 7 helper pairs, two `multiset`s that disagree, patch preflight implemented twice (`migrate.ts` vs `apply-cli.ts`) | |

Top fixes, in order: close the text-phase deletion hole and add the
identity guard (`run.ts`, two small changes); write `migrate.test.ts`;
one `multiset`; move the snapshot test's source read; trim
`registry.ts` into the history doc; decide the three edge scripts;
un-duplicate the preflight; raise the lint rules to `warn`; docstring
the contracts and un-export the dead 101.

## 4. Structure and repo

Full report: [`report-architecture.md`](../review-2026-09-21/report-architecture.md).

**Layout.** Nothing junk is tracked. The three-bucket model (R4: rules /
patches / review detectors) is not visible in the tree: `body/types.ts`
is the shared model everything imports (60+ edges), `body/compose.ts`
is the orchestrator, review detectors are mixed into `migrate/` with
stages and gates, and `body/dry-run*.ts` (888 lines of one-shot CLI) is
on the import path because `migrate.ts` imports one helper. Directory
cycle `body ↔ patch ↔ transform`.

**Docs.** Of 20 specs, 4 are canonical (overhaul, data-architecture,
migrate, consolidation) plus the glossary; 3 are wholly superseded
(sense-structure, research-process, sweep-tiering) with no banner; 12
are batch/gate-case records holding live rulings. 18 finished plans +
14 sidecars under `docs/superpowers/` are archive material by the
consolidation spec's own definition. `docs/v2/test-tiers.md` is
superseded. The flow SVG omits `data/slug-index/`.

**Safe mechanical cleanup (one PR):**

| Action | Scope |
|---|---|
| Remove 3 registered + 1 orphan worktree; prune | 828 MB |
| Delete 11 local + 5 remote merged branches (list in the report §1.3) | |
| Delete `.work/`, `.usage-mark`, `.superpowers/` scratch | |
| Fix 6 broken links; `bun remove htmlparser2` | |
| `git mv docs/v2/test-tiers.md docs/archive/`; `git mv docs/superpowers/plans docs/archive/plans` + 3 link rewrites + drop `biome.json:16` | |
| Archive-tag pointers at 5 stale code citations; v1 residue out of `biome.json`, `tsconfig.json`, `.coderabbit.yaml`, `renovate.json`, `bug.yml`, `wrangler.jsonc` | |
| One-sentence supersession pointers at the 6 satellite sites (§8) | |
| Rewrite README / SECURITY / CONTRIBUTING size policy / PR template / CLAUDE.md Tech Stack for v2 | |
| Add `data/slug-index/` to the flow SVG | needs draw.io |

## 5. Data schema

Full report: [`report-schema.md`](../review-2026-09-21/report-schema.md).

**Hard violations: 0.** ajv passes all 32,512; markup uses 6 tags and 1
attribute, all in the vocabulary; every internal ref, slug row, alias,
page row, patch id and snapshot pin resolves; all lookup keys are NFC;
no file over 1 MB; biome clean.

**Drift and defects found:**

| Finding | Count | sev |
|---|---|---|
| `pr. n. pl.` → `number: "pl"` (place names marked plural) | 432 entries | high |
| `grammar.pos` declared in the schema, no producer, no TS type | 0 uses | med |
| `gender: "c"`, `number: "du"` declared, never occur; `page`, `units` optional but 100 % present | | med |
| Nested keys in insertion order, not schema order (migrate spec §2.6) | all files | med |
| `stems[].stem` free text; marker residue (`"*."`, `"[."`, `"Compounds…"`) | 65 stems | med |
| Entries that are one empty sense | 251 | med |
| Headwords still holding a Roman numeral in `text` (the unwritten #114 patches) | 10 | med |
| Self-referencing cites / Hebrew outside `<he>` (render rule, not schema) | 2,739 / 543 files | low |
| Beyond the known 164 non-NFC: ZWJ 5, nbsp 1, tab 1, decomposed Latin diacritics 22; page-index `headword` with ASCII `"` | 68 | low |
| Page-index README: pages "1–1704" (max 1705), "monotonic" (15 descending steps, 1 unexplained); vol 1 runs to p.690, vol 2 starts p.685 | | low |
| No JSON schema for any sidecar; `data/source/migration-written.json` (§3.2 merge base) does not exist and nothing writes it | | med |

**Patch model.** 8 ops (header says seven). All target the *source*
shape; none can edit entry data (no `set-gloss`/`add-sense`, hence
#113). `author` is inferred from the directory, never recorded.
Preconditions for 8 of 10 tranches pin post-transform text, so a rule
change silently invalidates them. 11 patches on 4 rids are dropped by
one-record-per-rid consolidation with no row or count; 61 carry-over
patches are dead by construction; `bun patch:replay` exits 1 in 0.1 s
on ~600 unresolved escalations and verifies nothing.

## 6. Pipeline

Full report: [`report-pipeline.md`](../review-2026-09-21/report-pipeline.md).

**Reproducible:** dry run 100.6 s, nine gates green, tree clean
afterwards (blessing doc and review report byte-identical). Rebuild in
a throwaway worktree: 101.8 s, 19 files changed, all traced to #114.

**The three outputs today:**

| Output | Produced by | State |
|---|---|---|
| Data files | `--write` | complete and valid; committed copy stale by one PR |
| Issue split | `migrate/publication.ts` → `docs/v2/review-report.md`: blocks 302 / defer 2,204 / note 7 | ~90 % of blocks mislabelled (space check); ≥570 ruled-blocking rows undetected; `slug-changed` filed as `note` hides a stale tree; rows are `- rid: detail` with no action, owner or link |
| Sefaria list | `docs/v2/sefaria-report.md`, `upstream-issues.md` | hand-written; every evidence link goes to `docs/archive/`; register says 88 unresolved refs, the run says 0 — unreconciled |

**Also found:** headword-design §2 (`headwords[]`, `display`, `partial`,
per-form `gender`) has 0 implementation hits; `--help` or a typo runs a
full 100 s dry run (`options.ts` ignores unknown flags); README omits
`bun install`, the empty-tree precondition, `review-report.md` and gate
2; R3 (emit from source bytes) is unbuilt but 0 entries drop today.

## 7. Open issues

Full report with draft `gh` commands: [`report-issues.md`](../review-2026-09-21/report-issues.md).
18 open; 17 filed under Brian's account by AI sessions, 1 by Renovate;
only #97 came through the data-correction form. Every claim in
#102–#113 re-verified true today; the problem is ten issues for one job
whose rid tables already live in generated `headword-issues.md`.

| Action | Issues | Note |
|---|---|---|
| **Do now** | #110 (NFC on write), #39 part 1 (three `reform` patches for P00855/6/60 — no gate sees them and R10 would freeze the wrong slugs) | both S |
| Keep | #15 (Renovate; add a v2-merge checklist row for `renovate.json`), #38 (notes mechanism; only issue with no doc home), #97 (one human `replace` patch), #104 (rulings audit = §8 here), #113 (retitle as *the* pre-publication headword issue; absorb #108's 3 rids, #39's 3, U00489, A02823) | |
| Merge into one print-work issue | #102, #103, #106, #107, #109, #111 (+ print halves of #105/#113) | ~2,474 abbreviated alternates, 590 paren entries, 178 numbering gaps, 8 ellipses, gender labels |
| Close | #105 (done/superseded by #113), #18 + #42 (→ one Group D backlog row with today's counts: shape A 25 / B 99 / C 4), #37 (duplicate of `unlinked-bare-anaphor` 2,179; issue's 7,018 is stale), #39 part 2 (superseded by the hOCR page index) | |

Six doc rows to add instead of issues: headword-design §2 as a
consolidation §10 row; notes → §10 row; Group D shapes; renovate
checklist; NFC + ר/ד rows in `upstream-issues.md`; the three
slug-bearing rows no detector emits.

## 8. Decision record

Nine id schemes (V, D, B, S, T, R, Ruling C–F, dated `RULING`, informal)
hold ~80 rulings. The architecture report §5 tabulates them all; the
three classes that matter:

**Reversed but still cited as live (no pointer):**

| Ruling | Reversed by | Still live in |
|---|---|---|
| 2026-08-27 paren strip | headword-design §4 | `rules/headword.ts:135`, headword-field spec §3.2/§7.1, `registry.ts:933` |
| D12 slug frozen at import | R10 as amended 09-18 | D12, migrate spec §2.4, glossary |
| golden render diff | migrate spec §1 (09-06) | sweep-tiering §2/§3.2 |
| `CONFIRMED_NO_CHANGE` | S6 | consolidation §4.1, `reviewed/README.md` |
| corpus tests, archived tools, gone branches | steps 5–6 | migrate §6 and header, sweep-tiering §3.1, research-process §8 |

**Decided but not in code:** R3, R11, D9, D15, headword perfect-or-halt
(still a review row, not a fault), phrase-stub stop, per-form gender /
`display` / `partial`, NFC on write, S4 (3 rids still
`needs_human_judgment`), S6.

**Same ruling, different wording:** no-new-text across four layers
(agents "cannot remove" yet 7 agent `delete` patches exist); escalation
default (08-15 / T6 / 09-20); `migrate.ts` lifetime (prose permanent,
code writes once).

The fix is structural, and it is #104's deliverable: one
`docs/decisions.md` — id, date, one line, home, status, **what it
drops** — with every satellite pointing at it. Rulings C–F get their
definitions written there from the `apply.ts` docstrings; A/B are
declared non-existent unless found in session history.

## 9. Proposed sequence

Smallest set before `compile.ts` starts, then the rest.

| PR | Content | Blocks compile? |
|---|---|---|
| 1 | Mechanical cleanup (§4 table) + issue triage (§7) | no, but first: it removes the noise every later diff would carry |
| 2 | `rm -rf data/entries && bun data:import --write && bun qa:format`; commit the 19-file delta with its blessing doc | **yes** |
| 3 | Honest split: own kind for the 271 space rows; `slug-changed` not a `note`; report states the 5 undetected classes with catalogued counts; relabel by the reader-sees bar | **yes** for the list, not for the data |
| 4 | `pr. n. pl.` fix in `grammar.ts` + test; corpus baselines re-run | **yes** (432 wrong grammar values) |
| 5 | Headword schema decision (§10 Q1) — either adopt §2 with `display` optional, or freeze today's shape with `schemaVersion` | **yes** — compile's form handling and search keys hang on it |
| 6 | Gate hardening: text-phase deletion hole, identity guard, one `multiset`, `migrate.test.ts`, snapshot test tier | before publication |
| 7 | `docs/decisions.md` + supersession pointers + spec archiving (#104) | before publication |
| 8 | Detectors for the 5 blocking classes (`empty-stem-section` first: `stems[].senses == []` reproduces 342 exactly) | before publication |
| 9 | Code comments: registry narration → history doc; docstrings on contracts; un-export dead; edge scripts decided | any time |
| 10 | Post-go-live: update run (§3.2), R3, R11, NFC on write, generated Sefaria register, patch-layer rows, README operability | after |

## 10. Decisions needed

Each with a default; silence means the default.

1. **Headword shape before compile.** Ruled 2026-09-21: adopt headword-design §2 now (`headwords[]`, `display` optional, `partial`, per-form `gender`, `schemaVersion: 2`); costs, drops and deferrals are in the RULING block at the top of [headword-design.md §2](../headword-design.md). Q10 resolves with it.
2. **The five blocking classes.** Under your reader-sees ruling they block; under the "correctable post-go-live without moving a URL" bar all five defer. Which bar? *Default: they `defer` — none moves a URL — but the report must detect and show them either way.*
3. **`grammar.pos`.** Drop until produced, or seed a closed enum from the `pr. n.*` markers (1,195 entries)? *Default: seed it.*
4. **Enum tightening.** Remove `gender:"c"`, `number:"du"`; require `page`, `column`, `units`. *Default: yes.*
5. **`stems[].stem`.** Closed enum (~40 real binyan labels) with a rule for the 65 residue stems? *Default: yes.*
6. **Admin edits.** ~~Patches with new entry-data ops, or plain file edits merged by §3.2? *Default: plain edits + merge; patches stay for source-shape defects; record `author` in the record.*~~ **Ruled 2026-09-21 (maintainer): the admin tool does not create patches.** It edits the entry file only; the pipeline's update run (consolidation §3.2) keeps those edits across a re-import. Patches stay for defects in the source data. If patches are ever wanted from hand edits, they can be generated by diffing the entry files against the source data, and that process is designed then, not now. Cost: the three #113 cross-reference rows (A01175, A01345, V00518) wait for the update run. Recorded in the consolidation spec changelog.
7. **Spec archiving.** Move sense-structure, research-process, sweep-tiering to `docs/archive/specs/` with banners; banner-only on the 12 batch specs; archive `RUNBOOK.md` after lifting its three live rulings and the `Migrate Flow.drawio` sketch. *Default: yes to all.*
8. **Branch/tag collision** `archive/v2-research-2026-09`. *Default: delete the branch; every citation uses `refs/tags/`.*
9. **Code moves** (behaviour-neutral, separate PRs, invariants first): `body/types.ts` and `body/compose.ts` to the pipeline root; extract `buildTrace`, archive the dry-run trio and `page-index/verify.ts`; move `headword-issues.ts` out of the root; group review detectors under `migrate/detectors/`. *Default: yes, after PR 5.*
10. **`phrase-alt-headword-stub`.** Unregister now (moves gates, re-bless) or with the headword work? *Default: with PR 5.*
11. **Research backlog → tracker.** *Ruled 2026-09-21 (maintainer): option C.* Three umbrella issues stand in for the hand-written backlog until the admin tool's import exists — one for sense structure (Group D + the 21 implied-`1)` rids + the #18/#42 shape row), one for the 16 deferred judgment classes (Groups B and E, one checkbox per class), one for the 588 sweep escalations (lists 1–2). Each links the backlog section and carries no rid table. Headword print work needs no new issue (the triage's consolidated issue B and retitled #113 cover it); the 298 low-confidence page placements get none, per the "fix as found, never schedule" ruling. Filing rule recorded in `CONTRIBUTING.md` § Issues and `.claude/CLAUDE.md`: an issue is one defect class or one decision, never a rid list, and an AI session files or closes none without the maintainer's go in that session. Later import: `(rid, kind)` rows parent under the umbrella by kind, so no key collides. Drafts: [issues-to-file.md](../review-2026-09-21/issues-to-file.md). Considered: A (20 class issues now, ~60 if applied consistently) rebuilt the burst behind #102–#111; B (doc only) left the work with no findable home for an open-ended wait, and the `(rid, kind)` import covers report rows only, so the backlog would have needed its own importer anyway.
12. **Lint severity.** Raise length/complexity rules to `warn` (149 findings surface) or drop them? *Default: warn.*

## 11. Amendment — URL names spec (2026-09-21, PR #115)

[`2026-09-21-url-names-design.md`](2026-09-21-url-names-design.md)
landed after the review passes ran. It changes this document:

| Where | Effect |
|---|---|
| §1 (b), §6 | The eight "rows that move a URL" no longer block on URL grounds: under U6 a name may change and the old one redirects. Their remaining weight is the reader-visible headword defect. |
| §2 #4, §9 PR 2 | The rewrite still corrects 17 entry files; `data/slug-index/` retires (§7 of that spec) instead of being rewritten. Hold the data rewrite until the grammar fix, the publication split and URL-names step 1 are in, then rewrite once. |
| §5 patch model, §10 Q6 | U7 rules that an edit to one entry never has to touch a second file — a constraint on the admin-edit decision. |
| §6 issue split | `slug-unsafe` / `slug-changed` rows retire; the `headword-unparsed` `blocks` reason is reopened (spec §8). |
| §9 | New PR between 4 and 5: URL names §9 steps 1–3 (write `sefariaHeadword`, drop `slug`, name derivation + `bun qa` gates, retire `slug-index`). Compile's route map depends on it. |
| §10 Q13 | Settled by that spec §3.1: bare letters land on the exact name or the first entry, not a disambiguation page. |
