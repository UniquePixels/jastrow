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

Prompts: sweep agents use `prompts/sweep-v5.md`, which supersedes
v4 (the `v. sub` redirect carve-out, and the corrected
`roman-numeral-display` prior — v4 called the kind "all inspected
ones spurious", and adjudication found 24 real mislinks among its 31
entries — see docs/v2/phase-2-roman-numerals.md). The version is pinned in code as
`PROMPT_VERSION` in `research/corpus-inputs.ts` and gated by
`prompt-version.test.ts`; the code wins over this line. Verification
uses `prompts/verify-v2.md` (signed 2026-08-14; adds the
`catchable`/`labelOnly` verdict fields). Sweep tier Sonnet,
verification tier Opus. Prep attaches `anomaly_hints` to chunk
inputs: corpus-frequency findings from `anomalies.ts` plus
link-target findings from `link-anomalies.ts`.

## Procedure

1. **Go/no-go** — maintainer confirms the usage window and batch
   size (chunks of 30 entries; 25 chunks ≈ 3–4× pilot spend).
   Record the go (timestamp) in the tranche's report.
2. **Prep** — `bun admin/pipeline/research/tranche.ts prep
   <workdir> <count>`: writes per-chunk input JSON (pre-patch
   entries + precomputed `sense_index`, pin, `promptVersion: v5`)
   for the next pending chunks; chunk progress lives in
   `data/patches/checkpoints/`.
3. **Dispatch sweep agents** — one Sonnet agent per chunk (waves
   of ~7). Each agent: read the signed sweep prompt, read its input
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
   reviews + clean reviews per `verify-v2.md`), verdicts to
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
| Size | 1,084 chunks | **3,982 entries / 133 chunks** |
| Corpus state | pre-patch (`applyRepairs` only) | **healed** (+ both transform phases) |
| Chunk ids | `chunk-00001` | `chunk-r00001` |
| Tranche ids | `tranche-01` | `residue-01` |
| Tier | Sonnet | **Opus** (tiering spec §4 Phase 2.3, decision T4) |

**Why the corpus state differs, and why it is not optional.** The
phase manifest in `patch/apply.ts` is `text-repairs` ->
`structural-repairs` -> `patch-apply`, so a patch lands on text the
54 transform rules have already rewritten. **2,093 of the 3,982 —
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
the frozen 65 from the detector and pins the 2,093, so a revert to
the pre-patch corpus fails rather than passing quietly.

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
