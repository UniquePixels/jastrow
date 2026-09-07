# Residue batch 01 — residue-01 chunks r00001–r00005, sweep-v6

The first residue batch under the re-derived population and the
signed v6 prompt. Maintainer go recorded **2026-09-04 10:45 CDT**;
usage baseline marked `2026-09-04T16:12:32.805Z`.

Sweep tier Opus, prompt `sweep-v6` (signed 2026-09-04), verification
`verify-v3`, corpus stage `healed`, pin `sha256:75bbc5ee7…`.
Population 3,926 entries / 131 chunks — see
[`../calibration-2026-09-04/README.md`](../calibration-2026-09-04/README.md)
for the v5 measurement run that produced the fixes behind it.

## Measured

| Measure | Value | v5 calibration |
| --- | --- | --- |
| Entries | 150 | 150 |
| clean | 52 | 49 |
| repaired | 2 | 0 |
| needs_print_check | 43 | 34 |
| needs_human_judgment | 53 | 67 |
| Patches accepted | 5 | 4 |
| Patches rejected at ingest | 0 | 0 |
| Sampled error rate (substantive) | **0.0%** | 0.0% |
| Label-only patch slips | 0 | 0 |
| Clean entries sampled | 15 | 15 |
| Clean-sample miss rate (catchable) | **13.3%** | 26.7% |
| Verifier discoveries | 1 | 3 |
| Escalation queue | 96 | 101 |

Missed clean entries: A00911, A00520. Discovery: A00260.

~~**The two columns are not a controlled comparison.** The detector
fixes moved the residue, which re-cut the chunking, so these are a
different 150 entries. Read the miss-rate halving as directional.~~

**CORRECTED 2026-09-04.** This is wrong. The re-cut renumbered the
chunks but did not move them: chunk ids are assigned over the
rid-sorted population from the top, and both runs swept
`chunk-r00001..r00005`, so both swept the head. **141 of these 150
entries are the same entries the v5 calibration swept.** The
comparison is far closer to controlled than this paragraph claims,
which strengthens the miss-rate halving rather than weakening it.
See the runbook's "Progress is tracked by rid, not by chunk id".

## Gates

- **Patch error gate (≤5%): PASSES at 0.0%.** All five sampled
  patches verified `ok`, none label-only. The verifier re-implemented
  `applyPatch` and `validateNoNewText` and replayed each chain
  independently, including the chained anchor
  `53fe95ad = sha256(post-split host)[:8]`.
- **Catchable-miss gate: retired** (tiering spec T1). 13.3%, down
  from 26.7%.
- Ingest: 5 chunks, 5 patches, **0 rejects**.

## What the fixes did

**Confirmed working.** A00622 moved `clean` → `needs_print_check`,
and A00674 with it. Both were `clean` in the v5 run and A00622 was a
verifier-confirmed catchable miss there. The cause is exactly the
repair: the hint now reads `rare 'Mid.' (3x) beside dominant
'Midr.', 'Mic.', 'Midd.'`, where before `Midd.` was invisible at 97
against a `minSibling` of 100. The sweep found all three corpus
`Mid.` anomalies (A00622, A00674, A00775) unaided.

**The v6 tie-break is being used by name** — agents routed A00647,
A00877, A00879 and A00913 under it. In the v5 run agents were
inventing that convention and splitting on it.

## What the fixes did NOT reach

**`Den.` → `Denom.` (A00441-shape) is out of range, not
mis-thresholded.** `Den.` occurs once corpus-wide; the word it
abbreviates, `Denom.`, occurs 260 times but sits at edit distance
**two**. `ed1Siblings` only ever considers distance one, so the true
sibling was never a candidate at any threshold — the hint names
`Gen.` (7,192), `Dem.` (433) and `Dan.` (209) and steers the agent
away. Extending to distance two changes hint volume corpus-wide and
needs its own calibration.

## Defects in this batch's own tooling

### 1. `sweep-v6.md` carries five stale `v5` strings

The header and changelog say v6; the Input table (:205), both worked
patch examples (:687–688), the output-contract field table (:788)
and checklist item 7 (:856) still say v5. `PatchBase.prompt_version`
is an unvalidated `string`, so **no gate can catch a v5-stamped v6
patch**. Every agent that could report it did; all four emitted `v6`
from the dispatcher input under the code-wins rule. Author error in
the v6 draft, not an agent error.

### 2. ~~v6's class-10 correction is still narrower than the code~~

**WITHDRAWN 2026-09-04, after batch 02.** This finding was wrong. It
read `validateNoNewText`'s whole-entry pooling as licensing a
`replace` to draw on bytes from elsewhere in the entry. It does not:
the untouched remainder still occupies its own share of the pool in
the after-state, so the arithmetic reduces to `replace ⊆ find` plus
the closed-grammar marker allowance. Measured against the validator —
adding one space that occurs elsewhere in the same entry is rejected;
a pure reorder within `find` passes.

v6's wording was correct. Acting on this finding put a wrong rule
into sweep-v7, and two batch-02 agents then reported the *correct*
comment in `patch/schema.ts` as stale. The v7 changelog carries the
erratum.

### 3. The `alt_headwords` carve-out is vocalization-sensitive

`isAttestedVariant` does exact string membership on
`index.alts.get(baseHeadword(target))`, and `recordedVariant` strips
tags, the editorial asterisk and parentheses but **not niqqud**. So a
recorded alt stored vocalized (`(גּוּם)` → `גּוּם`) never matches an
unvocalized display (`גום`), and the hint fires anyway — A00307 and
A00529. v6's hint table asserts the exclusion without that
qualification, so the prompt currently overclaims what the code does.

Comparing on `skeleton()` inside `divergeHint` would close it, and is
safe there specifically: that rule fires only where the display is
not a corpus headword, so the A00988 collision cannot arise. It
changes hint volume, therefore re-chunks — it must land between
batches, never during one.

### 4. Checklist item 8 still has nowhere to write

v6 requires every hint judged "with a reason you could defend to the
verification tier", and `manifest.ts` forbids `escalation` on `clean`
and `repaired` rows. Both `repaired` entries this batch (A00337,
A00878) rejected hints with no recorded reason. Carried over from the
v5 calibration unfixed.

### 5. Class 6 prescribes an op that cannot express its own case

Class 6's repair is `delete` (scope `segment`), and `delete`'s
segment must occur exactly once. A00337's defect is the adjacent
self-overlapping duplicate `).).`: every framing unique enough for
`delete` also swallows the `</a>` markup, so `replace` is the only
legal expression. Two agents hit this independently. The catalog
should say so.

## Standing questions the prompt should answer

- **Why `exact-headword-diverge` does not get the `alt_headwords`
  carve-out.** Four agents across two runs have now asked. The answer
  is A00988: `אַבָּא I` prints as `אַבָּא I, אָב`, so `אָב` really is
  one of its headwords — and the link is still wrong, because the
  host `אָח I` is Hebrew and its etymology `cmp. אָב` means the
  Hebrew `אָב II`. Being recorded makes a link possible, not correct.
  455 anchors over 304 entries sit in that collision. Until class 11
  says this, every agent re-derives it at Opus rates.
- **The empty trailing `plural_form` slot — 703 of the 6,113 entries
  that have the field.** Mechanical, non-sense-field, script-shaped,
  and on no systemic list, so a diligent agent must escalate 703
  identical rows. Belongs in the script-slated table. (This resolves
  the v5 run's contradictory denominators, 32,512 vs 6,113.)
- **`rare-dotted-variant` fires on English words.** `Mars.`, `nets.`,
  `Ther.`, `nut.`, `tub.`, `Lang.`, `camp.`, `then.` across both
  runs — two of four hints in one verifier sub-sample. The rule
  matches an abbreviation shape without excluding English vocabulary.

## A caution about the miss rate itself

**A00575 was a catchable-adjacent miss in the v5 run and `clean`
here, judged by two different Opus verifiers on the same bytes.** One
read the `חרי` anchor as landing on "to be hot" where the sense wants
bore/perforate; the other found display and target byte-identical on
the corpus's only unvocalized `חרי` headword and ruled it outside the
class-11 signature.

The tiering spec retired the catchable-miss gate because "each
verification pass invents new forensic techniques and finds new
defect shapes". This is the same instability in the other direction —
a pass declining to find what its predecessor found. The miss rate
measures one agent's reading on the day at least as much as it
measures the sweep.

Related: agents in both runs reliably located anomalies and
unreliably diagnosed their causes — the `Ib.`/Yoma "rule gap" that
was a documented exclusion, the A00913 "corruption" that was a
transform repairing a mis-parse, and the A00307 carve-out failure
attributed to parentheses when the cause is niqqud. Findings from
this tier are leads, and each was worth checking against the code.

## Cost

Whole batch — 5 sweep agents, 4 verification agents, orchestration:

| Origin | Msgs | Input | Output |
| --- | --- | --- | --- |
| subagent (Opus) | 488 | 66,585,927 | 77,536 |
| main | 53 | 18,159,628 | 100,644 |
| **total** | **541** | **84,745,555** | **178,180** |

Fresh 1,079 · cache-write 3,317,996 · cache-read 81,426,480. Sweep
only, before verification: 59,815,241 in / 117,669 out. Comparable to
the v5 calibration's 87.7M, on a batch that produced one more patch
and half the miss rate.

At this cadence — the maintainer's measure is roughly one third of a
five-hour usage window per batch — the remaining 126 chunks are about
25 batches.

## Recommendation

Land the five tooling defects above before the next batch. Four are
prompt or catalog edits; only the vocalization fix touches code, and
that one re-chunks, so it must be the last change before a batch
rather than the first after one.
