# Residue batch 02 — residue-01 chunks r00001–r00005, sweep-v7

Second residue batch, on the 3,885-entry population. Maintainer go
recorded **2026-09-04 14:38 CDT**; usage baseline marked
`2026-09-04T19:54:37.161Z`. Sweep tier Opus, prompt `sweep-v7`
(signed 2026-09-04), verification `verify-v3`, corpus stage `healed`,
pin `sha256:75bbc5ee7…`.

**This batch breached the error gate on its first pass and was
re-swept.** The breach analysis is
[`docs/v2/phase-2-batch-02-breach.md`](../../../docs/v2/phase-2-batch-02-breach.md);
this report covers the batch as committed.

## Measured

| Measure | Batch 02 | Batch 01 | v5 calibration |
| --- | --- | --- | --- |
| Entries | 150 | 150 | 150 |
| clean | 58 | 52 | 49 |
| repaired | 1 | 2 | 0 |
| needs_print_check | 39 | 43 | 34 |
| needs_human_judgment | 52 | 53 | 67 |
| Patches accepted / rejected | 4 / 0 | 5 / 0 | 4 / 0 |
| **Sampled error rate** | **0.0%** | 0.0% | 0.0% |
| Clean-sample miss rate (catchable) | 20.0% | 13.3% | 26.7% |
| Verifier discoveries | 1 | 1 | 3 |
| Escalation queue | 91 | 96 | 101 |

Missed clean entries: A00644, A00229, A00952. Discovery: A00818.

**CORRECTION 2026-09-04 — the Batch 01 column is the same entries.**
This batch swept `chunk-r00001..r00005`, and so did batch 01 and the
v5 calibration; chunk ids are positional over the rid-sorted
population, so all three swept the head. **147 of these 150 rids are
batch 01's**, and 139 are also the calibration's. The three columns
above are a near-controlled v5/v6/v7 comparison on shared entries,
not three independent samples — so v7's rise to 20.0% is a
regression on the same entries, not sampling noise. Progress is now
tracked by rid; see the runbook.

`hint_notes` coverage: **125 of 150 rows**.

## Gates

- **Patch error gate (≤5%): PASSES at 0.0%** on the re-swept batch.
  On the first pass it read 20.0% — 1 substantive failure in 5
  sampled, every accepted patch sampled.
- **Catchable-miss gate: retired** (tiering spec T1). 20.0%.

## What the re-sweep did and did not fix

`chunk-r00003` was re-swept under a class 7 armed with corpus
evidence (1,820 period-outside / 0 period-inside / 6,821 control).
The agent was told nothing about the failure, and the superseded
outputs were withheld, so this was a test of the prompt rather than a
correction handed over.

It returned **0 patches**. The bad patch is gone; the correct one was
not written. The batch-02 verifier had ruled A00475's defect real and
its class right, faulting only the repair's direction, and the correct
form `Keth. 104ᵇ</a>. 2)` is a legal reorder of the find text.

So the outcome is safe, not good: a wrong patch traded for a missed
repair. Two readings, not separable from one run — the evidence table
made boundary repairs feel risky, or this agent simply did not see the
defect. The second is plausible; agents in this batch split on A00575
the same way. A00475 keeps a `needs_print_check` row for its `At.`
finding, so the entry is escalated rather than lost.

**If class 7 keeps producing nothing, the honest conclusion is that
boundary repairs want a mechanical check rather than agent
diligence.** One run does not show that.

## Near-miss worth recording: patch ids are reused

Ingest renumbers accepted patches corpus-unique. The re-sweep dropped
A00475's patch, which freed `P000080` — and the next ingest assigned
that id to the A00878 patch. Carrying the earlier verification
verdicts across **by patch id** therefore pulled the old failure
verdict onto a passing patch and reported a 25.0% error rate.

Verdicts must be carried by `(rid, op)` or re-derived. A gate reading
built on reused ids is not a gate reading. The same hazard applies to
anything that joins tranche data across an ingest.

## Findings

**Acted on this batch:** class 7 now carries the corpus evidence for
punctuation placement, not just the invariant.

**Queued, code, therefore re-chunks — land after this batch:**

- `inflection-escape-link` compares the display against the target's
  *headword* only, never the target's own `plural_form`. A00450 and
  A00516 are false positives on that shape; 2 of 3 in one chunk. A
  verifier measured the kind's premise: **a `Pl.` anchor targets a
  headword other than its host in 1,021 of 1,349 cases corpus-wide**,
  so escaping is the norm rather than a defect signature.

**Queued, prompt:**

- The empty `{}` sense-head node — 73 entries corpus-wide (72 with
  `sense[1] = "1)"`), plus 11 whitespace-only heads, against 2,212
  contentful heads. Counted, not extrapolated. Belongs on the
  script-slated table.
- `Ib.` → `Yoma 2a:N`, the segment-bearing sibling arm of the shipped
  `ib-yoma-2a` rule. The re-sweep agent counted 300 `Ib*` anchors
  targeting `Yoma 2a*` — 260 bare, 40 segmented — and correctly
  identified it as the documented, deliberately-uncatalogued arm
  rather than a novel find, because it read the audit file. It is on
  no script-slated list, so every agent meeting it re-derives it.
- `empty-stem-section` (342 entries) and `stem-head-in-child-sense`
  (100 entries) are maintainer-ruled but named nowhere in the prompt,
  so a diligent agent escalates them.

**Standing, unresolved across three batches:** `rare-dotted-variant`
fires on ordinary English words — precision 4/14 in one chunk this
batch. The rule matches an abbreviation shape without excluding
English vocabulary.

## Why the miss rate moved

13.3% → 20.0%. Three of this batch's catchable misses were found by
the verifier reading the sweep's **stated reason** for rejecting a
hint and finding the premise false — A00519's "no headword is exactly
`הִי`" (there are two), A00952's appeal to `alt_headwords` (the v7
§11 collision), A00229's undocumented carve-out. Those reasons exist
only because `hint_notes` shipped with v7.

The likeliest reading is that auditability rose and the measured rate
followed. It is a reading, not a proof.

## Cost

Whole batch, including the breach round and the re-sweep:

| Origin | Input | Output |
| --- | --- | --- |
| subagent (Opus) | 79,695,699 | 168,572 |
| main | 45,993,054 | 152,566 |
| **total** | **125,688,753** | **321,138** |

679 messages. Higher than batch 01's 84.7M because it paid for a full
verification round, a re-sweep, and a second partial verification.
A clean batch at this cadence is roughly one third of a five-hour
usage window; this one cost about half again as much.

125 chunks remain.
