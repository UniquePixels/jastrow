# Scaled sweep runbook (Task 8)

Per-batch procedure for the gated corpus sweep (spec §4.5; plan
Task 8). Every batch is maintainer-gated: **no step 2 without a
recorded go**. Gates (sweep tiering spec, 2026-08-17):

- **Patch error gate (kept):** halt on a sampled **substantive error
  rate > 5%**. A patch failure is *substantive* unless the verifier
  marks it `labelOnly` (repair correct, metadata slip).
- **Catchable-miss gate (retired 2026-08-17, spec T1):** four
  measurements across two prompt versions sat at 7.4–8.2% against a 2%
  limit, including one round where every prior miss was caught. Each
  verification pass re-derives what should have been found, so the
  metric tracked the second-pass advantage rather than sweep quality.
  Misses are still recorded and folded in as escalations; they no
  longer halt a batch.
- **Saturation gate (new):** discovery rounds stop when two
  consecutive rounds add no new systemic pattern class
  (`data/patches/patterns.jsonl`).

Prompts: **read the version out of the code, never out of this
file.** The sweep version in force is `PROMPT_VERSION` in
`research/corpus-inputs.ts`, gated by `prompt-version.test.ts`, and
the document it names is `prompts/sweep-<PROMPT_VERSION>.md`. The
code wins over every prose line here.

This paragraph used to name the version, and it was **two bumps
stale** — it said `v8` while v9 ran, and pointed at `sweep-v5.md`
while both v8 and v9 were in force. `verify-v3.md` had the identical
defect in its Companion line and fixed it the same way, by naming the
pinned source instead of a version. A stale premise in an operating
document is the expensive kind of error: an agent following it
correctly still reaches the wrong grounds (v10 changelog, items 2–4).

Verification uses the highest `prompts/verify-vN.md` — currently
`verify-v3.md`, which added the `catchable`/`labelOnly` verdict
fields. Nothing gates that one, so check the directory. Prep attaches
`anomaly_hints` to chunk inputs: corpus-frequency findings from
`anomalies.ts` plus link-target findings from `link-anomalies.ts`.
For the tier, read the table in the residue section below — it is
Sonnet on the batch path and **Opus** on the residue path.

## Procedure

1. **Go/no-go** — maintainer confirms the usage window and batch
   size (chunks of 30 entries; 25 chunks ≈ 3–4× pilot spend).
   Record the go (timestamp) in the tranche's report.

   **Mark the usage baseline before dispatching:**

   ```
   bun usage --mark .usage-mark                      # before step 3
   bun usage --since @.usage-mark --project jastrow  # after step 4
   ```

   `admin/pipeline/research/usage-report.ts` reads Claude Code's own per-session
   transcripts, so a run can be costed from disk afterwards rather
   than watched live. It reports `main` and `subagent` separately on
   purpose: sweep agents are `isSidechain` records, and the
   statusline's window percentage **skips them**, so that figure
   understates a sweep by whatever the subagent row says. Tokens
   only — the transcripts carry no billing.

   `--project` matches a substring of the project slug and is worth
   passing: without it the report spans **every** project on the
   machine, so unrelated work lands in the sweep's number.
2. **Prep** — `bun admin/pipeline/research/tranche.ts prep
   <workdir> <count>`: writes per-chunk input JSON (pre-patch
   entries + precomputed `sense_index`, pin, `promptVersion` — the
   `PROMPT_VERSION` named above, never a version hardcoded here) for
   the next pending chunks; chunk progress lives in
   `data/patches/checkpoints/`.
3. **Dispatch sweep agents** — one agent per chunk (waves of ~7).
   **Tier depends on the path: Sonnet on the batch path, Opus on the
   residue path** (tiering spec §4 Phase 2.3, decision T4). Read the
   tier off the table in the residue section below, not off this
   line. Each agent: read the signed sweep prompt, read its input
   JSON, write `<workdir>/out/<chunkId>.patches.jsonl` +
   `.manifest.jsonl`. Repo files are never touched by agents, and
   agents judge their own chunk only — keep session notes outside
   the workdir so they cannot cross-contaminate judgments
   (batch-02 round 1).
4. **Ingest** — `bun admin/pipeline/research/tranche.ts ingest
   <workdir>`: validates every chunk output (schema, pin, overlap,
   chained apply, no-new-text), renumbers ids corpus-unique,
   appends accepted output to
   `data/patches/tranches/<tranche>/{patches,manifest,rejects}.jsonl`,
   marks succeeded chunks complete in the checkpoint, and writes
   `sample-patches.json` / `sample-clean.json`. Chunk-fatal
   problems print and stay pending — re-dispatch those chunks.
5. **Verification** — Opus agents over the sample files (patch
   reviews + clean reviews per the highest `prompts/verify-vN.md` —
   currently `verify-v3.md`, per the paragraph above), verdicts to
   `<workdir>/verdicts-*.jsonl`.
6. **Report + threshold check** — build the batch report
   (`buildPilotReport`/`renderPilotReport` from `verify.ts`) with
   the verdicts; compare against the gates above. Error-gate breach
   → batch is not committed; failure feeds the prompt/catalog and
   the affected chunks re-sweep (reset their checkpoint entries).
7. **Commit** — batch report + tranche JSONL + checkpoint in one
   commit before the next batch starts.

## Phase 2.3 item 3 — the residue sweep

Same seven steps, with a different prep command and a different
population. `admin/pipeline/research/residue-sweep.ts` carries the
argument; the operational differences are:

| | Batch path | Residue path |
|---|---|---|
| Prep | `tranche.ts prep` | `tranche.ts prep-residue` |
| Population | all 32,512 entries | the residue, minus the 65 items 1–2 adjudicated |
| Size | 1,084 chunks | **3,697 entries / 124 chunks** (3,982 / 133 at first cut; detector work moved it — 3,926, 3,885, 3,777, 3,491, UP to 3,696 when `own-form-escape-link` shipped 2026-09-05, then 3,698 and 3,697 as headword normalization was fixed) |
| Corpus state | pre-patch (`applyRepairs` only) | **healed** (+ both transform phases) |
| Chunk ids | `chunk-00001` | `chunk-r00001` |
| Tranche ids | `tranche-01` | `residue-01` |
| Tier | Sonnet | **Opus** (tiering spec §4 Phase 2.3, decision T4) |

**Why the corpus state differs, and why it is not optional.** The
phase manifest in `patch/apply.ts` is `text-repairs` ->
`structural-repairs` -> `patch-apply`, so a patch lands on text the
54 transform rules have already rewritten. **1,945 of the 3,697 —
52.6% — read differently after the rules.** An agent handed
pre-patch text authors anchors against a string that does not exist
at apply time, and re-reports defects the rules already fixed. When
batches 01 and 02 ran this overlap was near zero, because the rules
did not exist yet.

**This is not a new contract.** `sweep-v5.md`'s Input table already
describes the chunk as *"in the exact byte state the patch-apply
phase will see (after the pipeline's deterministic text/structural
passes)"*. `prep-residue` makes the code meet the promise the prompt
has been making; `prep` has been quietly breaking it since the first
transform rule shipped.

Every chunk input records which state it was built from, in
`corpusStage` (`pre-patch` | `healed`). `ingest` needs no flag: it
reads the tranche id out of the input and resolves the matching
chunking and fingerprint.

Gates: `residue-sweep.test.ts` (unit) and
`residue-sweep.corpus.test.ts` (corpus). The corpus one re-derives
the frozen 61 from the detector and pins the 1,946, so a revert to
the pre-patch corpus fails rather than passing quietly. Its pinned
figures have been re-baselined three times, each time with the
movement audited in the constants' own docstring — a move in them is a change
to what item 3 sweeps, and reading it is the point.

## Progress is tracked by rid, not by chunk id

A chunk id is **positional**. `chunkCorpus` sorts the population and
cuts from the top, so `chunk-r00001` is whatever the first 30 entries
are *today*. Every detector fix moves the residue, which renumbers
every chunk, which is why a checkpoint pins a corpus fingerprint and
`completed` is discarded when it moves.

Discarding `completed` used to discard the progress with it. Three
consecutive residue runs — the v5 calibration, batch 01 and batch 02 —
each swept `chunk-r00001..r00005`, and each time that meant the head
of the corpus:

| Pair | Shared rids |
| --- | --- |
| batch 01 ∩ batch 02 | 147 / 150 |
| calibration ∩ batch 01 | 141 / 150 |
| calibration ∩ batch 02 | 139 / 150 |
| **distinct entries, all three runs** | **162** |

450 agent-entries covered 162 of 3,777. The checkpoint now carries a
second ledger, `swept`, holding **rids**, which are stable across a
re-cut. `markComplete` writes both; `carryForward` drops `completed`
and keeps `swept`; `pendingChunks` skips any chunk whose rids are
*all* swept. `resolveCheckpoint` is the single place that decides
between resume, carry-forward and fresh, so `prep` and `ingest`
cannot disagree.

Two consequences worth knowing before reading a batch report:

- **A partly-swept chunk is still dispatched in full.** The rule is
  deliberately conservative — skipping a chunk that holds even one
  unswept entry would drop that entry silently. At a boundary this
  costs up to 29 re-swept entries in one chunk.
- **Pending chunks are ordered by unswept count, not by position**
  (2026-09-05). Conservative membership is only affordable if the
  batch does not have to *start* with the thin chunks. When
  `own-form-escape-link` shipped it interleaved 205 new entries into
  an already-swept head, leaving eleven old chunks holding one or two
  each; batch 05's prep offered 150 entries covering **6** unswept
  ones while 110 untouched 30-of-30 chunks waited behind them.
  `pendingChunks` now ranks by how much of a chunk is left, stably,
  so the whole chunks go first and the stragglers accumulate to the
  tail for one later batch to pay off. **Read the `never swept`
  column of a batch report before accepting it** — the ordering makes
  a thin batch unlikely, not impossible.
- **The cross-batch comparisons in the archived reports are wrong
  about their own samples.** Batch 01's README says the re-chunk made
  these "a different 150 entries"; 141 of them were the same. Read
  the v5 → v6 → v7 miss-rate movement (26.7% → 13.3% → 20.0%) as a
  near-controlled comparison on 139 shared entries, which makes v7's
  regression harder to explain away, not easier.

## State

- Pilot (chunks 00001–00007, rids A00000–A00209) accepted and
  committed under `pilot/` — recorded complete in the tranche-01
  checkpoint.
- Corpus: 1,084 chunks / 11 tranches; 57 chunks done as of
  2026-08-17 (pilot 7 + batch-01's 25 + batch-02's 25).
- **Batch 02 round 1 (2026-08-17, not committed):** chunks
  00033–00057 passed the error threshold outright (0/15 sampled
  patches wrong, 0 label-only) but breached the miss threshold at
  7.6%. Four of the five catchable misses were one class — class 11
  `wrong-link-target`, found by the same entry-local display-vs-
  `data-ref` test (A01486, A00988, A01525, A01133); the fifth
  (A01008) a class-8 citation comma. Maintainer chose
  fix-detection-and-re-sweep. Remediation: `link-anomalies.ts`
  (4 rules, calibrated 1,910 entries / 5.9% corpus-wide), a
  Roman-numeral comma rule in `anomalies.ts` (18 instances against
  46,161), and sweep-v4. All five misses now arrive as hints.
- **Batch 02 round 2 (2026-08-17, accepted and committed under
  spec decision T7):** re-swept 00033–00057 under sweep-v4; every
  round-1 miss caught, but the miss threshold breached again at
  8.2% on five different entries across three classes with no
  shared root cause. Accepted per the
  [sweep tiering spec](../../docs/specs/2026-08-17-sweep-tiering-design.md)
  — T1 retires the catchable-miss-rate gate in favour of pattern
  saturation, T2 keeps the error gate. Eight verifier finds folded
  in as escalations; post-fold escalation queue 128. Full record in
  `tranches/tranche-01/report-batch-02.md`.
- Maintainer decisions on accumulated `needs_*` rows happen before
  replay (Task 10); the manifest gate enforces it. **Review cadence
  (maintainer, 2026-08-15):** per-batch escalation review is waived —
  batch-01 sampling established that queue items are genuinely
  human-review-worthy (9 rulings reviewed, 1 false alarm). All
  `needs_*` rows accumulate into one consolidated report at the end
  of the sweep.
- **Triage (maintainer, 2026-08-15):** every escalation defaults to
  `post-go-live` — these are pre-existing source defects, not
  pipeline regressions, so none block shipping. `blocking` is a
  per-item override applied during the consolidated review.
  Recorded in the resolution text (a structured `triage` field on
  rows comes with the consolidated-report tooling).
- **Wrong-reference handling (maintainer, 2026-08-15, A00363/A00571
  precedents):** transcription-level errors (OCR glyphs) are fixed
  and confidently relinked; print-level bad references are delinked
  with an apparatus note (print reading → problem → Sefaria's
  choice → other candidates → action); pure linker overreach is
  delinked silently.
