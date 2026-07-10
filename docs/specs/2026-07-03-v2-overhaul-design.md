# V2 Overhaul — Design Spec

- **Date:** 2026-07-03
- **Status:** Draft — pending maintainer review
- **Supersedes:** Decision D3 of
  [2026-06-04-contribution-readiness.md](2026-06-04-contribution-readiness.md)
  (see Decision V1 below)

## 1. Context & Problem

The dictionary data has accumulated structural problems that create
ongoing overhead: abbreviations are not linked, part-of-speech tags are
sparse, pagination coverage is unaudited, entries with multiple
headwords are missing their alternates, headword numbering (I, II)
is inconsistent, some entries do not render correctly, and there is
no way to add new entries.

The root cause is provenance. The true data chain is:

```
Sefaria MongoDB → (unremembered extraction) → data/raw/
              → (old pipeline) → current JSONL → manual edits
```

Two of the four transformation steps are undocumented, and at least
one documented step is proven lossy: Sefaria's source lists alternate
headwords that the processing dropped (the "missing headwords" issue).
`data/raw/` is therefore an **untrusted intermediate**, not a source.

Separately, the admin tool (local Bun server, `data/admin/`) supports
only a single trusted local operator. Opening the project to
collaborators requires git-aware editing, attribution, issue
integration, and a unified dev setup.

## 2. Strategy

Build v2 alongside v1 rather than renovating in place:

1. A new, fully documented pipeline from the true Sefaria source.
2. A new schema designed for the known gaps (alternate headwords,
   grammar tags, provenance) rather than retrofitted.
3. A new admin tool built for collaboration.
4. A frontend refactor consuming the v2 data, last.

Manual edits made since the original transform are not lost: the
admin tool writes minimal per-line JSONL diffs, so the edit history
is reconstructable from git and replayable onto v2 data.

## 3. Decisions

| ID | Decision |
|----|----------|
| V1 | Rebuild data from the true Sefaria source with a scripted, re-runnable, fully documented pipeline. **Supersedes D3** ("pipeline is a one-time relic, never re-run"). D3's rationale (the old pipeline is unreproducible) is exactly why v2 must replace it. |
| V2 | `v2` is a long-lived integration branch off `main`. Feature branches PR into `v2` with the same review rigor as `main` (CI, CodeRabbit, human review, squash merges). |
| V3 | Subtractive start: the first PRs into `v2` delete the v1 app files while keeping the rails — `.github/` workflows and templates, biome config, `package.json`, `scripts/lib/` validators, docs slated for revision, and `data/`. No orphan branch (preserves shared history and a clean final merge). |
| V4 | New code is written at its **final paths** (`index.html`, `assets/`, `data/admin/`, …) from day one. No `v2/` subdirectory; no path rewriting at cutover. |
| V5 | `data/` (current JSONL, raw files, annotations) stays on `v2` until edit-mining (1.3) and the divergence audit (1.2) are complete, then is deleted in its own PR. |
| V6 | Schema v2 is designed in its own spec with its own review gate (task 2.1). It is the keystone decision and is not buried inside an implementation PR. |
| V7 | Reviews and checkpoints are part of the plan, not optional: every PR is reviewed (automated + human), and no phase begins until the previous phase's checkpoint is explicitly passed by the maintainer. |
| V8 | Data-edit freeze: once Phase 1 starts, no further manual data edits on `main` except urgent corrections, which must be logged for a second mining pass at cutover. |
| V9 | `main` is merged into `v2` weekly to prevent drift. |

## 4. Phases

Each phase is a chain of small PRs into `v2`. "Done when" is the
phase's exit evidence, reviewed at the phase checkpoint (§5).

### Phase 0 — Rails

| # | Work | Done when |
|---|------|-----------|
| 0.1 | Create `v2` branch; apply branch protection (PRs required, reviews required) | Protection verified active |
| 0.2 | Update GitHub Actions branch filters and CodeRabbit config so PRs targeting `v2` get full CI + review | A throwaway test PR into `v2` demonstrates CI and CodeRabbit both running |
| 0.3 | Deletion PR per Decision V3 | Tree is rails + `data/` only |
| 0.4 | Record freeze date (V8) and merge cadence (V9) | Written into this spec |

### Phase 1 — Source & Provenance

| # | Work | Done when |
|---|------|-----------|
| 1.1 | Source acquisition: identify the canonical Sefaria channel for the Jastrow lexicon (MongoDB dump lexicon collection, Sefaria-Export, or API); script and document the fetch | Fresh source in hand; fetch is re-runnable |
| 1.2 | Divergence audit: fresh source vs `data/raw/` | Written report of what the forgotten extraction changed (silent fixes it made must become deliberate v2 pipeline rules) |
| 1.3 | Edit-mining: reconstruct all manual edits from JSONL git history | Replay set produced (entry id → change list) |

### Phase 2 — Schema & Pipeline v2

| # | Work | Done when |
|---|------|-----------|
| 2.1 | Schema v2 spec: alternate headwords (first-class), grammar/POS, abbreviation linking, markup model (semantic tags vs allow-listed HTML), storage format (per-entry files vs sharded JSONL vs current), provenance/change-log fields, new-entry markers and id allocation | Separate spec reviewed and approved at CP-2a |
| 2.2 | Pipeline v2: fetch → documented transform rules → validate → emit | Full run reproducible from scratch; every rule logged |
| 2.3 | Replay mined edits; human-reconcile misfits | Replay report: applied / needs-review / dropped |
| 2.4 | Validation suite v2 (schema, markup, uniqueness, golden checks) in CI | Enforced on all `v2` data PRs |

### Phase 3 — Admin Tool v2

Planned in detail at CP-2 (informed by schema v2). Scope:

- Unified dev server: one command serving the app and admin panel.
- Git-aware editing: branch awareness, refuse dirty-main edits,
  commit/PR flow from the tool, per-edit attribution.
- GitHub issues integration (`gh`/API as the issue data source).
- AI assist for narrow verifiable tasks (abbr links, POS tags,
  headword extraction, render triage) with approve-every-change UX.
- Annotations migrated off the single 3.3 MB `annotations.json`
  (into issues or per-entry storage).

### Phase 4 — Frontend on v2 Data

Planned in detail at CP-3. Scope:

- Renderer for schema v2, with golden-file regression tests built
  **first** (render all entries, snapshot, diff).
- Entry action menu (share / report / admin / link) replacing the
  share-only dropdown.
- Data-loader/IndexedDB/service-worker rework (fixes the known
  stale-cache coupling).
- Entry and site layout overhaul.

### Phase 5 — Cutover

- Delete v1 data from `v2` (per V5).
- Parity checks: entry counts, spot renders, search behavior.
- Docs rewrite: CONTRIBUTING, architecture, data schema.
- Squash-merge `v2` → `main`; deploy; monitor.

## 5. Checkpoints & Review Protocol

Two review layers:

1. **Per-PR** (continuous): CI, CodeRabbit, and maintainer review on
   every PR into `v2`. Small PRs; the existing size-guard applies.
2. **Checkpoints** (gates): a discussion at each phase boundary plus
   named decision gates. No next phase until the checkpoint passes.

At every checkpoint: reorient (branch, goal, last action), review the
exit evidence, explicitly re-ask the standing decisions listed for
that checkpoint, and record the outcome in this spec's changelog (§7).
Rethinking a prior choice at a checkpoint is expected, not a failure.

| Checkpoint | After | Evidence reviewed | Explicitly open to rethink |
|------------|-------|-------------------|----------------------------|
| CP-0 | Phase 0 | Test-PR run, protected branch, tree state | Branching model itself (V2–V4) |
| CP-1 | Phase 1 | Divergence audit, replay set size | **Is the fresh-source restart still right?** If the audit shows little divergence and small replay cost, proceed; if it shows chaos, reconsider scope |
| CP-2a | Task 2.1 | Schema v2 spec | **Data structure, storage format, markup model, any new libraries/deps for the pipeline** |
| CP-2 | Phase 2 | Pipeline run logs, replay report, validation results | Data quality go/no-go before building tools on it; detailed Phase 3 planning happens here |
| CP-3 | Phase 3 | Working admin tool, collab workflow walkthrough | Dev-server approach, AI provider/integration choices; detailed Phase 4 planning happens here |
| CP-4 | Phase 4 | Golden-test results, perf + a11y checks | Layout decisions before they ship |
| CP-5 | Phase 5 | Parity checks | Cutover go/no-go (the one hard-to-reverse step) |

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Workflows silently skip PRs targeting `v2` (branch filters) | Task 0.2 verifies with a live test PR before anything else lands |
| Fresh Sefaria source has upstream errors the old extraction silently fixed | Divergence audit (1.2) converts silent fixes into documented rules |
| Edit replay is not fully mechanical | Replay report classifies every edit; misfits get human reconciliation (2.3) |
| `v2` drifts from `main` | Weekly merges (V9); data-edit freeze (V8) |
| Renderer/layout changes regress entries invisibly | Golden-file tests precede renderer work (Phase 4) |
| Scope creep inside phases | Phases 3–5 are deliberately not task-planned yet; each is planned at its opening checkpoint using what earlier phases learned |

## 7. Changelog

| Date | Change |
|------|--------|
| 2026-07-03 | Initial draft from brainstorm (maintainer + Claude) |
| 2026-07-04 | **CP-0 passed.** Rails verified live: test PR #22 into `v2` ran ci-data (`Validate data`), ci-lint (`Lint`/`Test`/`Type Check`), CodeQL, and received a CodeRabbit APPROVED review; closed unmerged. Branch protection verified (`pr:true, force:false, del:false`). Subtractive start merged (PR #23). Maintainer re-asked and **reconfirmed V2, V3, V4**. |
| 2026-07-04 | **V5 superseded at CP-0** (maintainer ratified): the subtractive start was expanded to also remove `data/` (incl. `data/raw/` and the v1 admin tool), `scripts/`, `ci-data.yml`, and all dependencies from `v2`. v1 data and validators live in git history on `main`; Phase 1 tools read raw data via `git show origin/main:…`. Phase 1 artifacts land in `data/source/` on `v2`. Known gap accepted: no data-validation/size-guard CI on `v2` until pipeline v2's suite (task 2.4). |
| 2026-07-04 | **Data-edit freeze on `main` in effect (V8)** — Phase 1 begins. Urgent v1 data corrections must be logged for a second mining pass at cutover. |
| 2026-07-10 | **CP-1 passed.** Maintainer re-asked the verbatim question and **confirmed the fresh-source restart**. Evidence: divergence audit (`docs/v2/divergence-audit.md` on `v2`) — 0 dropped/added entries, 3 headword diffs (fresh Sefaria wrong; legacy ד readings correct, maintainer 2026-07-06), one enrichment (page/column) to re-implement deliberately; edit mining — 22,164 edits = 22,057 scripted + 107 hand page fixes (caf242a); baseline audit (`docs/v2/baseline-audit.md` on `v2`) — one pre-git fix session (182 column + 3 page fixes, C00363–C00544). Full v1 human-edit ledger: **289 print-locator fixes, zero text edits**. Ratified: both correction sets roll into live data **after** the pipeline is complete — page/column via migration rule 6 sourced from **baseline deployed files** (not raw), the 3 headwords via the manual-correction layer (plus an upstream Sefaria issue). Maintainer will personally review the mined edits before they enter v2 truth. Phase 2 proceeds. |
