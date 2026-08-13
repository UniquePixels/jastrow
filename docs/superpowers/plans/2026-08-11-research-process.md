# Research Process — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers-extended-cc:subagent-driven-development (recommended) or
> superpowers-extended-cc:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement
[docs/specs/2026-08-10-research-process-design.md](../../specs/2026-08-10-research-process-design.md):
the LLM sweep as a **patch generator** — deterministic substrate
first (snapshot pin, semantic patch schema, no-new-text validator,
entry-result manifest, apply engine), then the sweep machinery
(chunker, versioned prompt, verification sampler), then gated
tranches over all 32,512 entries, synthesis, and the script
extraction loop. Recreatability lives in the committed patch
corpus, never in re-running the model.

**Architecture:** Two new pipeline areas. `admin/pipeline/patch/`
is pipeline-owned: patch schema, validators, snapshot pin, and the
apply engine `body:migrate-dry` gains as a phase. `admin/pipeline/
research/` is sweep-owned: chunker, prompt artifacts, entry-result
manifest, verification sampler. The corpus and manifest are JSONL
under `data/patches/`, committed per tranche. Sweep agents run
in-session on plan usage (Sonnet 5; Opus 5 verification tier);
Batch API is the fallback (spec §3).

**Tech Stack:** Bun + TypeScript (tabs, biome), `bun:test`, JSONL
source at `data/source/jastrow-dictionary.jsonl` (32,512 entries).

**Carried decisions:** All spec §3 locked decisions. From the
parked `impl/sense-structure-repair` branch: the 53 decided doc-08
rows, the deferred-row rulings (D00470/K00081/R00519), and the
K00081 tail-duplication class (register #19) carry forward as
seed material for the defect catalog — maintainer decisions are
inputs, never re-litigated by agents.

---

## Task flow

| Task | Blocked by | User gate? |
|---|---|---|
| 1 snapshot pin | — | |
| 2 patch schema + validators | — | |
| 3 entry-result manifest | 2 | |
| 4 apply engine + phase manifest | 1, 2, 3 | |
| 5 chunker + tranche checkpoints | — | |
| 6 sweep prompt v1 + defect catalog | 2, 3 | **YES** |
| 7 pilot tranche + verification | 4, 5, 6 | **YES** |
| 8 scaled sweep tranches | 7 | **YES** (each) |
| 9 synthesis + script extraction | 8 | |
| 10 recounts + evidence docs | 9 | **YES** |

---

## Task 1: Snapshot hash + corpus pin

**Goal:** The canonical snapshot hash (spec §3, §5.1): sha256 over
the committed decoded snapshot files in a fixed file order. Every
patch pins it; preflight compares it; the maintenance track rebases
it — never silently.

**Files:** Create `admin/pipeline/patch/snapshot.ts` (+ colocated
test). Commit the current hash as `data/patches/snapshot.lock`.

**Acceptance Criteria:**
- [ ] Fixed, documented file list and order (the decoded snapshot
      files under `data/source/`, source data only — not reports)
- [ ] Hash is deterministic across runs; test asserts the lock file
      matches a fresh computation of the working tree
- [ ] Mismatch output names the changed file(s) and says the fix is
      a reviewed maintenance-track rebase (spec §6), not re-locking

**Verify:** `bun test admin/pipeline/patch/snapshot.test.ts` → pass.

## Task 2: Semantic patch schema + validators

**Goal:** The patch contract (spec §4.3) as code: five ops with
op-specific payload schemas, stable targets, corpus preflight
rules, and the no-new-text validator — the cheap floor that runs
on everything.

**Files:** Create `admin/pipeline/patch/schema.ts`,
`no-new-text.ts` (+ colocated tests, fixtures per op).

**Acceptance Criteria:**
- [ ] Types + JSONL parse for `split` / `retag` / `move` /
      `delete` / `replace`; each op's payload shape fixed here and
      able to encode sibling creation + deterministic placement
      (the S1 splitter contract)
- [ ] Stable target resolver: marker token + content-hash anchor,
      never array index; carries an expected occurrence count
      (normally exactly 1) and fails loudly on any other count
- [ ] Corpus preflight: patches validate in committed order; two
      patches touching overlapping target regions of one rid is a
      validation error at preflight
- [ ] No-new-text validator: per op, derives permitted source
      bytes and rejects any applied result containing bytes not
      drawn from them; only synthesized tokens permitted are
      sense-number markers from the closed grammar (`N)` / `—N)`);
      a rejected patch re-dispositions its entry
      `needs_print_check`
- [ ] Fixtures: one accepting and one rejecting case per op

**Verify:** `bun test admin/pipeline/patch/` → pass.

## Task 3: Entry-result manifest

**Goal:** The audit trail and gate (spec §4.4): one JSONL record
per input rid, exactly one disposition each, with patch ids,
escalation details, and eventual maintainer decisions on `needs_*`
rows.

**Files:** Create `admin/pipeline/research/manifest.ts` (+
colocated test).

**Acceptance Criteria:**
- [ ] Disposition enum: `clean` / `repaired` /
      `needs_print_check` / `needs_human_judgment` — exactly one
      per rid
- [ ] Completeness check: record set equals the input rid set
      (missing or duplicate rid fails)
- [ ] `needs_*` records carry escalation detail and a maintainer
      decision slot; a gate helper reports unresolved `needs_*`
      rows (replay refuses on any)

**Verify:** `bun test admin/pipeline/research/manifest.test.ts` →
pass.

## Task 4: Patch apply engine + phase manifest

**Goal:** The pipeline track (spec §5): a committed ordered phase
manifest with runtime-asserted preconditions, and the apply engine —
preflight first, then write, self-verifying via `expected_before`.

**Files:** Create `admin/pipeline/patch/apply.ts` (+ colocated
test); wire into `admin/pipeline/body/migrate-dry.ts`; add
`research:apply` (dry mode) to `package.json`.

**Acceptance Criteria:**
- [ ] Preflight checks (a) corpus snapshot pin equals current
      snapshot hash and (b) every patch's `expected_before` +
      occurrence count — reporting **all** mismatches together
      before aborting, never just the first
- [ ] Applies in committed corpus order; every structural apply is
      followed by a round-trip re-parse assertion
- [ ] Refuses to run while the entry-result manifest has any
      unresolved `needs_*` record
- [ ] Committed ordered phase manifest: marker/text passes →
      structural repairs → patch apply → consumer-facing output;
      each phase's preconditions asserted at runtime; a violated
      assertion aborts the run
- [ ] With an empty corpus, `body:migrate-dry` gates hold at
      32,512/32,512

**Verify:** `bun test admin/pipeline/patch/apply.test.ts && bun run
body:migrate-dry` → pass, gates unchanged.

## Task 5: Chunker + tranche checkpoints

**Goal:** Deterministic, resumable work division (spec §4.1.2,
§4.5): ~20–40-entry chunks, 2–4K-entry tranches, checkpointed by
rid so a failed run loses at most one chunk.

**Files:** Create `admin/pipeline/research/chunks.ts` (+ colocated
test).

**Acceptance Criteria:**
- [ ] Deterministic chunking of the corpus (rid-ordered), chunk
      size 20–40, tranche size 2–4K, both configurable constants
- [ ] Checkpoint file records completed chunks per tranche; resume
      skips completed chunks; test covers resume mid-tranche
- [ ] Chunk ids are stable across runs (re-chunking after a resume
      cannot reassign entries)

**Verify:** `bun test admin/pipeline/research/chunks.test.ts` →
pass.

## Task 6: Sweep prompt v1 + defect catalog (USER GATE)

**Goal:** The committed, versioned prompt artifact (spec §4.2) that
makes 1,000+ independent agent runs produce identical judgment
calls — plus the recorded maintainer call on the remaining doc-08
rows.

**USER GATE — maintainer signs prompt v1 before any tranche runs.**

**Files:** Create `admin/pipeline/research/prompts/sweep-v1.md`.
Update `docs/v2/body-review/08-implied-one-candidates.md` header
and spec §8 with the doc-08 ruling.

**Acceptance Criteria:**
- [x] Prompt contains all §4.2 elements: role + full target entry
      schema; defect catalog with one example per class (implied-1,
      swallowed `—N)` markers, OCR `l)`/`1)`, unnumbered senses
      missing their number field, unclassified binyan/section
      heads, chopped + duplicated tails, anchor-boundary markup,
      lost parentheticals, print-error carryovers); canonical
      repair conventions; the never-invent-text constraint;
      output contract (patch schema, dispositions, manifest, JSONL)
- [x] Seed material carried: the 53 decided doc-08 rows and
      deferred rulings appear as worked examples / pre-decided
      inputs the sweep must not contradict
- [x] Maintainer call recorded: the 26 undecided doc-08 rows are
      folded into the sweep (2026-08-13) — written into the doc-08
      header and spec §8
- [x] Prompt is versioned (`v1`); tranche outputs will record it

**Verify:** maintainer sign-off captured 2026-08-13 in the plan
checklist and doc-08 header ("Prompt v1 signed: maintainer,
2026-08-13").

## Task 7: Pilot tranche + verification machinery (USER GATE)

**Goal:** One small calibration tranche (~200 entries) end-to-end —
sweep, ingest validation, verification sample, measured error and
miss rates — before any real spend. The verification sampler (spec
§4.1.6) is built here.

**USER GATE — usage go/no-go before the run; maintainer sets
thresholds and accepts (or re-sweeps) after.**

**Files:** Create `admin/pipeline/research/verify.ts` (+ colocated
test), verifier prompt artifact. Tranche output committed under
`data/patches/`.

**Acceptance Criteria:**
- [x] Ingest validates every agent record against schema +
      no-new-text before it enters the corpus; rejects are logged
      and re-dispositioned (1 pilot reject, auto-re-dispositioned)
- [x] Sampler selects: every low- and med-confidence patch, a
      random sample of high-confidence patches, and a random
      sample of `clean` entries (the false-negative measure);
      sampled records go to the Opus 5 tier
- [x] Pilot report: sampled error rate 33.3% (1/3,
      classification-only), miss rate 3.3% (1/30), escalation
      queue 10 — thresholds set: error ≤5%, miss ≤2% per tranche
- [x] Pilot output (JSONL + escalation queue + report) committed
      under data/patches/pilot/; five feedback items recorded for
      prompt/catalog v2 (report §Feedback)

**Verify:** `bun test admin/pipeline/research/verify.test.ts` →
pass (14 tests); pilot accepted by maintainer 2026-08-13
(report.md §Acceptance).

## Task 8: Scaled sweep tranches (USER GATE, each)

**Goal:** Sweep the full corpus in fixed-size tranches (spec §4.5),
each gated on current usage windows, each committed before the next
starts.

**USER GATE — go/no-go per tranche; usage cannot be monitored from
inside a session, so the gate is manual by design.**

**Files:** Tranche outputs under `data/patches/`; checkpoint files
from Task 5.

**Acceptance Criteria:**
- [ ] Every tranche: go/no-go recorded → sweep → ingest validation
      → verification sample within accepted thresholds → commit
- [ ] A threshold breach halts promotion of that tranche, feeds
      the failure back into the prompt/defect catalog, and
      re-sweeps the affected chunks
- [ ] After the final tranche the entry-result manifest is
      complete: exactly one record per corpus rid (32,512)

**Verify:** manifest completeness check green; every tranche
commit present.

## Task 9: Synthesis + script extraction loop

**Goal:** Corpus-wide passes per-entry agents cannot do (spec
§4.1.5, §4.1.7): cross-entry pattern synthesis, then the
write-script → re-run → recompute-redundancy → retire loop until
stable.

**Files:** Create `admin/pipeline/research/synthesis.ts`,
`admin/pipeline/patch/redundancy.ts` (+ colocated tests).
Deterministic scripts land in the pipeline phase manifest.

**Acceptance Criteria:**
- [ ] Synthesis report: defect-class counts, cross-entry patterns
      (e.g. the K00081 tail-duplication class); new classes feed
      the catalog and re-sweep affected chunks
- [ ] Redundancy rule enforced in code: a patch is redundant only
      when the pipeline's current output already equals the
      patch's post-state; a bare `expected_before` mismatch routes
      to maintainer review instead of retirement
- [ ] Loop runs until stable; the residual corpus is only the
      one-off, infeasible-to-script residue

**Verify:** `bun test admin/pipeline/patch/redundancy.test.ts` →
pass; retirement log reviewed.

## Task 10: Recounts + evidence docs (USER GATE)

**Goal:** Measured evidence that the pipeline now corrects the
data: recounts at target (brokenTopSequences=0, startsAtTwo=0) or
enumerated signed sets; documents match the measured output.

**USER GATE — maintainer signs the final numbers (standing gate).**

**Files:** Update `docs/v2/body-migration.md`,
`docs/v2/upstream-issues.md` (register counts),
`docs/v2/body-review/00-INDEX.md`, spec §7 known-limits notes.

**Acceptance Criteria:**
- [ ] Recounts at target or every exception enumerated and signed
      with a review date
- [ ] Documented numbers equal captured pipeline output
- [ ] Follow-on work stubbed, not started: the `needs_print_check`
      vision/print tier and the maintenance track (spec §6) each
      get their own plan

**Verify:** `bun run body:migrate-dry` output matches the
documented numbers; maintainer sign-off captured.

---

## Out of scope (follow-on plans)

- **Print-check tier** — vision-capable pass over page images for
  the `needs_print_check` queue (spec §3 print-lookup decision).
- **Maintenance track** — upstream diff report + patch
  rebase/retire workflow (spec §6). Requires the apply engine and
  corpus from this plan; nothing else blocks on it.
