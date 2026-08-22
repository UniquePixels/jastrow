# Sweep Tiering — Discovery, Automation, Ship

- **Status:** approved 2026-08-17 (maintainer)
- **Supersedes:** the exhaustive-sweep cadence in
  [research-process design §4.5](2026-08-10-research-process-design.md)
  and the per-batch miss-rate gate in `data/patches/RUNBOOK.md`
- **Parent:** [v2 overhaul](2026-07-03-v2-overhaul-design.md)

## 1. Context & Problem

The gated corpus sweep was built to run over all 1,084 chunks. At
the observed cadence that is months of wall-clock and a cost the
maintainer flagged as higher than planned.

Three findings from batches 01–02 reframe what the sweep is for.

**The pipeline is not blocked.** `bun body:migrate-dry` already
composes all 32,512 entries and passes every gate: rejoin, units,
lettered and form-section round-trips at 32,512/32,512, full-corpus
schema validation with 0 failures, 0 label quarantines
(`docs/v2/body-migration.md`). Page and column are solved by
migration rule 6 from the baseline deployed files plus 107 hand
edits and 289 corrections. Nothing in the sweep gates the
transform; the sweep improves the *content* flowing through it.

**The miss-rate gate is unreachable by construction.** Four
measurements — 7.4%, 7.6%, 7.6%, 8.2% against a 2% limit — across
two prompt versions and a detector that provably closed the prior
gap. Each Opus verification pass re-derives what "should" have been
found and reliably notices new shapes, so the metric measures the
second-pass advantage rather than sweep quality. A three-chunk
experiment (2026-08-17) confirmed the tier gap is real — Opus
sweeping the same chunks found 25 escalations against Sonnet's 17
and caught 3 of 4 known misses — but also that upgrading the model
does not close the gate: A00989 slipped past both tiers and Opus
surfaced four findings neither tier had before.

**The sweep's real product is pattern classes, not patches.** Batch
02 alone yielded roughly nine *new* systemic patterns (the catalogue
in §4 Phase 1 also carries the two established in batch 01), with
corpus counts from 73 to 20,298 entries. One deterministic rule
derived from a pattern fixes every instance; sweeping for further
instances of a known pattern is wasted spend.

## 2. Strategy

Sweep to **discovery saturation**, convert every pattern to a
deterministic transform, and reserve LLM judgment for the residue
that no rule can decide. Ship on migration gates plus a golden-file
render diff. Continue quality work after launch.

## 3. Decisions

| # | Decision |
|---|----------|
| T1 | The per-batch catchable-miss-rate gate is retired. Batches are gated on **pattern saturation**, not defect discovery. |
| T2 | The substantive patch-error gate (≤5%) stays. It has passed every batch (0.0% in batch 02, both rounds). |
| T3 | Discovery sampling is **stratified across all 22 rid letters**. Everything swept to date (57 chunks) sits inside letter A — 5.3% of the corpus, 49% of one letter. |
| T4 | Discovery tier is **Opus**. The volume drop makes it affordable, and structural changes get baked into the new format. |
| T5 | A pattern with a corpus-wide count and no per-entry judgment becomes a **deterministic transform**, never an LLM task. |
| T6 | Blocking = breaks the render **or** would be baked in by the transform. Everything else defers to post-launch. |
| T7 | Batch 02 round 2 is **accepted and committed** under T1, with its breach recorded. Its 30 patches and 120 escalations are evidence, not waste. |

## 4. Phases

### Phase 1 — Discover

Opus sweeps stratified samples until the pattern catalogue stops
growing.

| # | Work | Done when |
|---|------|-----------|
| 1.1 | Accept and commit batch 02 round 2; fold the 7 verifier finds and A01546 in as escalations; record the breach; update `RUNBOOK.md` for T1/T2 | Tranche JSONL + report + checkpoint committed; runbook gate text matches T1 |
| 1.2 | Stratified sampler, seeded and reproducible. **One round = one chunk per rid letter = 22 chunks / 660 entries.** | Sampler emits chunk inputs; selection recorded |
| 1.3 | Sweep each round with Opus under sweep-v4; log every new pattern class with its corpus-wide count | Round report lists new patterns or states none |
| 1.4 | Repeat until **two consecutive rounds add no new pattern class**. Minimum two rounds (44 chunks, 1,320 entries). | Saturation declared in writing |

Known patterns already awaiting rules (counts corpus-wide):
slash-less Jerusalem Talmud href 7,679; raw space before href
disambiguator 9,805; `data-ref` absent from `refs[]` 20,298;
unlinked `v. <span dir=rtl>` cross-references 796; gender label left
in definition 575; `Ib.` anchors resolving to Yoma 2a 312;
non-sense-field duplicate anchor wrap ~1,220; bare RTL Hebrew
~4,900 senses; `)<i>` / `)</a><i>` missing space 126; empty
`plural_form` slot 703; `data-ref` whose skeleton is absent from the
corpus 2,572.

### Phase 2 — Automate

| # | Work | Done when |
|---|------|-----------|
| 2.1 | Each catalogued pattern becomes a transform with tests and a corpus count, or a written reason it cannot | Every catalogue row resolved |
| 2.2 | Re-run the structural detector after the rules land; measure the residue | Residue count reported (pre-rule baseline: 3,630 entries, 11.2%) |
| 2.3 | One targeted Opus pass over the judgment residue only — principally sense-marker splits | Residue swept; patches ingested |
| 2.4 | Fix the known detector defect: `HOMOGRAPH` in `link-anomalies.ts` does not strip superscript digits, so `X II` vs `X ²` fires a false `exact-headword-diverge` | Test added; A01346 no longer fires |

Detector recall on blocking classes measured at 25/25 for batch 02
round 2. All ten catchable misses across both rounds fell in
non-blocking classes (8, 11, 5) — the tier's demonstrated weakness
sits entirely in deferred work.

### Phase 3 — Validate & Ship

| # | Work | Done when |
|---|------|-----------|
| 3.1 | Apply patches and rules; re-run `bun body:migrate-dry` | Gates hold at 32,512/32,512, 0 schema failures, 0 quarantines |
| 3.2 | Golden-file render diff over all entries (v2 overhaul Phase 4 builds these first) | Every entry renders; diffs reviewed |
| 3.3 | Quarantine review: anything rendering wrong goes to eyes-on regardless of defect class | Quarantine list empty or accepted |
| 3.4 | Ship v2 | Cutover per v2 overhaul Phase 5 |

Post-launch, unchanged by this spec: `grammar.pos` enrichment, and
the Phase 2 quality sweep over classes 8, 9, 11, 12 — link targets,
lost text, print errors — run week by week against live data.

## 5. Risks

| Risk | Mitigation |
|------|------------|
| Patterns do not generalise across letters; M behaves unlike A | T3 stratification surfaces this in round 1. A letter-specific pattern is a finding, not a failure; it extends Phase 1 by a round. |
| Saturation declared early — a rare pattern appears after Phase 1 closes | Golden-file render diff (3.2) is an independent net that does not depend on knowing the class. Post-launch sweep catches the rest. |
| Blocking defect that neither detector nor sweep sees | Same net. Recall evidence is n=25 and self-referential; the render diff is the empirical check. |
| Sweep patches collide with hand-curated `repairs.ts` edits on one entry | Unverified. Check composition before Phase 3.1; `repairs.ts` asserts its find-text matches exactly once and fails loudly, so a collision surfaces rather than corrupts. |
| Cost creep returns in Phase 2.3 | The residue is bounded and measured at 2.2 before any agent runs. |

## 6. Changelog

| Date | Change |
|------|--------|
| 2026-08-17 | Spec written. Supersedes the exhaustive-sweep cadence and the miss-rate gate after batch 02 breached it twice under a working remediation. |
