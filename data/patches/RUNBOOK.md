# Scaled sweep runbook (Task 8)

Per-batch procedure for the gated corpus sweep (spec §4.5; plan
Task 8). Every batch is maintainer-gated: **no step 2 without a
recorded go**. Thresholds (pilot acceptance 2026-08-13): halt and
re-sweep a batch whose sampled **error rate > 5%** or clean-sample
**miss rate > 2%**.

Prompts: sweep agents use `prompts/sweep-v2.md` (signed
2026-08-13); verification uses `prompts/verify-v1.md`. Sweep tier
Sonnet, verification tier Opus.

## Procedure

1. **Go/no-go** — maintainer confirms the usage window and batch
   size (chunks of 30 entries; 25 chunks ≈ 3–4× pilot spend).
   Record the go (timestamp) in the tranche's report.
2. **Prep** — `bun admin/pipeline/research/tranche.ts prep
   <workdir> <count>`: writes per-chunk input JSON (pre-patch
   entries + precomputed `sense_index`, pin, `promptVersion: v2`)
   for the next pending chunks; chunk progress lives in
   `data/patches/checkpoints/`.
3. **Dispatch sweep agents** — one Sonnet agent per chunk (waves
   of ~7). Each agent: read `sweep-v2.md`, read its input JSON,
   write `<workdir>/out/<chunkId>.patches.jsonl` +
   `.manifest.jsonl`. Repo files are never touched by agents.
4. **Ingest** — `bun admin/pipeline/research/tranche.ts ingest
   <workdir>`: validates every chunk output (schema, pin, overlap,
   chained apply, no-new-text), renumbers ids corpus-unique,
   appends accepted output to
   `data/patches/tranches/<tranche>/{patches,manifest,rejects}.jsonl`,
   marks succeeded chunks complete in the checkpoint, and writes
   `sample-patches.json` / `sample-clean.json`. Chunk-fatal
   problems print and stay pending — re-dispatch those chunks.
5. **Verification** — Opus agents over the sample files (patch
   reviews + clean reviews per `verify-v1.md`), verdicts to
   `<workdir>/verdicts-*.jsonl`.
6. **Report + threshold check** — build the batch report
   (`buildPilotReport`/`renderPilotReport` from `verify.ts`) with
   the verdicts; compare against the thresholds above. Breach →
   batch is not committed; failure feeds the prompt/catalog and
   the affected chunks re-sweep (reset their checkpoint entries).
7. **Commit** — batch report + tranche JSONL + checkpoint in one
   commit before the next batch starts.

## State

- Pilot (chunks 00001–00007, rids A00000–A00209) accepted and
  committed under `pilot/` — recorded complete in the tranche-01
  checkpoint.
- Corpus: 1,084 chunks / 11 tranches; 7 chunks done as of
  2026-08-13.
- Maintainer decisions on accumulated `needs_*` rows happen before
  replay (Task 10); the manifest gate enforces it.
