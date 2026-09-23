# Tranche 01 — the pre-patch chunk sweep

The first sweep of the corpus, run against `applyRepairs` output before
any transform rule existed. That is the `pre-patch` corpus stage
(Ruling E, `admin/pipeline/patch/apply.ts`): its anchors are authored
against text the rules later rewrote, so migration does not accept this
tranche. Ruling F carries a pre-patch patch over anyway, unless an
accepted patch already targets its exact `(rid, target)`.

> **2026-09-22 — 59 of this directory's 64 patches left.**
> `admin/pipeline/patch/records/` holds only what the import run
> applies (Brian's ruling). 58 were
> `superseded`: a transform rule now reaches the defect first, so the
> run absorbed them and applied nothing. P000009 was consolidated away
> under Ruling F — batch-02's P000079 targets the same `(rid, target)`,
> and the healed patch wins. All 59 are at
> [`docs/archive/patches-retired-2026-09-22/tranches/tranche-01/`](../../../../../../docs/archive/patches-retired-2026-09-22/tranches/tranche-01/),
> with the 45 `repaired` records that held them and the sweep-era
> residue (`rejects.jsonl`, `report-batch-01.md`, `report-batch-02.md`,
> the two `verdicts-batch-01-*.jsonl`).

## What is still here

`patches.jsonl` holds the five patches the run carries and applies:
P000018, P000025, P000027, P000031, P000050.

`manifest.jsonl` holds 1,455 records — the sweep's judgment on every
entry it read, less the 45 `repaired` records whose patches retired.
Nine of them are `needs_*` escalations that had carried a retired
patch: the escalation, the rid and the disposition are untouched, and
only the reference to the patch is gone. The retired patch's own text
is in the archive directory above, under the same rid, for anyone
re-judging the escalation.

The 195 escalations here are unresolved by design — every one defers to
post-go-live under Ruling D, and `bun data:import` runs with
`escalations: 'defer'`.
