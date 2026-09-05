# Residue batch 03 — residue-01 chunks r00005–r00009, sweep-v8

The first residue batch to leave the head of the corpus. Maintainer go
recorded **2026-09-04 20:07 CDT**; usage baseline marked
`2026-09-05T01:21:03.162Z`. Sweep tier Opus, prompt `sweep-v8`
(signed 2026-09-04), verification `verify-v3`, corpus stage `healed`,
pin `sha256:75bbc5ee7…`. Population 3,777 entries / 126 chunks.

## What this batch is, and why the comparison columns changed meaning

Batches 01 and 02 and the v5 calibration all swept
`chunk-r00001..r00005`, which is always the first 150 rids in sort
order. **They were the same entries** — batch 01 ∩ batch 02 = 147/150.
The cause and the fix are in the runbook's "Progress is tracked by rid,
not by chunk id"; the short version is that a chunk id names a position,
the population moved under every batch, and clearing the stale ids threw
away the progress with them.

Batch 03 ran after that fix, on a checkpoint seeded with the 162 rids
the three archived manifests record. It drew `chunk-r00005..r00009`,
**121 of whose 150 entries had never been swept**. The remaining 29 are
the tail of the old head, in `chunk-r00005`: the skip rule only drops a
chunk when *every* rid in it is swept, because dropping a partly-swept
chunk would silently drop the unswept entries in it.

So the table below compares 121-new entries against three runs of the
same 150. **It is not a controlled comparison, and this time the
direction of the confound is the opposite of what batches 01 and 02
claimed for themselves.**

## Measured

| Measure | Batch 03 | Batch 02 | Batch 01 | v5 calibration |
| --- | --- | --- | --- | --- |
| Entries | 150 | 150 | 150 | 150 |
| Previously swept | 29 | 147 | 141 | — |
| clean | 55 | 58 | 52 | 49 |
| repaired | 0 | 1 | 2 | 0 |
| needs_print_check | 17 | 39 | 43 | 34 |
| needs_human_judgment | 78 | 52 | 53 | 67 |
| Patches accepted / rejected | 3 / 0 | 4 / 0 | 5 / 0 | 4 / 0 |
| **Sampled error rate** | **0.0%** | 0.0% | 0.0% | 0.0% |
| Clean-sample miss rate (catchable) | **33.3%** | 20.0% | 13.3% | 26.7% |
| Verifier discoveries | 0 | 1 | 1 | 3 |

Per-chunk: r00005 0 patches (12/4/14), r00006 1 (13/2/15), r00007 1
(14/2/14), r00008 1 (6/4/20), r00009 0 (10/5/15).

## Gates

- **Patch error gate (≤5%): PASSES at 0.0%.** All 3 sampled patches
  verified `ok`, 0 label-only, 0 substantive. The verifier
  re-implemented `applyPatch` and `validateNoNewText` independently,
  replayed each chain, and checked anchor self-consistency
  (`sha256(expected_before)[:8]` == target anchor), the pin, and
  `prompt_version` against `PROMPT_VERSION` in the code.
- **Catchable-miss gate: retired** (tiering spec T1). 33.3%.
- Ingest: 5 chunks, 3 patches, **0 rejects**.

**On the 33.3%: do not read it as a regression yet.** Five misses in
fifteen sampled entries. At n=15 the 95% interval runs roughly 12–62%,
which contains every prior batch's figure, so this is not
distinguishable from 20.0% or 13.3% on the arithmetic alone. What *is*
new is the ground: this is the first miss rate measured mostly on
entries no sweep agent had seen before. Whether the earlier figures
were flattered by the repetition is a real question, and one batch
cannot answer it.

## The five misses, and why "look harder" is the wrong reading

| Entry | Class | Hint | Failure mode |
| --- | --- | --- | --- |
| A01180 | 11 wrong-link-target | fired | rejected on a stated false premise |
| A01243 | 11 wrong-link-target | fired | rejected citing another entry's text |
| A00931 | 8 sub-token loss | none | 3 instances, under the 20× threshold |
| A01066 | 8 lost-parenthetical | none needed | entry-local paren arithmetic |
| A01023 | 11 wrong-link-target | none | inside v8's deliberate exclusion |

**Two of the five are a rejection defect, not a detection defect.** On
A01180 the sweep rejected an `exact-headword-diverge` hint saying it
"could find no separate הִי headword" — there are two, `הִי I` and
`הִי II`, and the sibling display `הוּ` in the same parenthesis links to
its own stub. On A01243 the sweep rejected a `niqqud-twin-target` hint
by quoting "opens 'to perforate, break through'" — that is A00840's
text; the anchor targets A00841, whose entire content is
`Part. pass. נָאוֹר clear`. Both rejections were confident, specific,
and about the wrong entry. Loosening a detector does not touch this
shape; the hint already fired and was argued away.

**A01023 is the uncomfortable one.** Its display `אָחוּי` — the entry's
own `Part. pass.`, glossed right beside the anchor — links to
`חוי ² 1`, which records `אחוי` as its own Af. form. That is exactly
the case `71f4936` taught `inflection-escape-link` to exclude
(691 → 560). The narrowing was right on its named control and still
lets this through, so the exclusion is over-broad by at least one
shape: the host's *own* recorded participle should not be excusable by
the target's records. Per v7's ruling, being recorded makes a link
possible, not correct.

**A01066 needed no detector at all** — 4 `(` against 3 `)` on
tag-stripped sense text, with no `language_reference` for the
cross-field carve-out to apply. The corpus-wide census the verifier
took, with a control: 31,296 balanced, 462 net-unclosed, 754
excess-closer of 32,512. Within this batch's 150, only A01066 and
A01429 carry a net unclosed opener, and A01429 *was* caught
(`needs_human_judgment`, reported as a false sense split).

## Detector findings worth a between-batch slot

Each of these changes hint volume, so each re-chunks and must land
between batches, never during one.

1. **`rare-dotted-variant` fires on English words — third confirmation.**
   All 8 of chunk-r00007's hints were English gloss words (`King.`,
   `dam.`, `hart.`, `prow.`, `dawn.`, `duct.`, `Sat.`, `Corr.`), and
   chunk-r00009 rejected 2 more. Batch 01's README already listed 8
   from two earlier runs. ~18 false hints across four runs from one
   rule.
2. **The 20× threshold is too tight for genuine sub-token loss.**
   A00931's `cmp` for `cmp.` sits at 3 bare against 24 `format.`;
   A01243's `Zepph.` at 6 against ~58 `Sepph*`. Batch 01's catchable
   miss A00074 (`bot` for `bot.`) was the same shape. The two
   findings pull opposite ways — one rule too loose, one too tight —
   so they are separate calibrations, not one.
3. **`inflection-escape-link`'s exclusion is over-broad** — see
   A01023 above.
4. **Two systemic shapes have no script-slated row**, so a diligent
   agent must escalate them by hand: `refs` disagrees with the entry's
   own `data-ref` set in **20,476 of 32,512** entries (12,036 agree),
   and unlinked `Y. <tractate>` citations run **893** across 768
   entries against 2,190 linked. Rows for both are cheap insurance
   against exactly the flood the table exists to prevent.
5. **Offered, not asserted:** the folio superscript sits outside the
   closing `</a>` in 12 places corpus-wide against 39,353 inside. The
   rendered text is identical either way, so this is markup
   normalization, not a defect.

## Agent-reported leads, unverified

Recorded as leads because agents in every batch have located anomalies
reliably and diagnosed causes unreliably. None of these were checked
against the code or corpus by the orchestrator.

- 10 abbrev-mislinks in chunk-r00008 share one mechanism — a geresh
  display abbreviating the host's own **אס־ spelling twin**, linking
  instead to whichever entry records `אִסְ׳`/`אִסְפַּ׳`/`אִסְק׳` in
  `alt_headwords`. Agent counted 22 such anchors corpus-wide, 10 here.
- 158 entries carry the stub form `", v. X׳"`; 125 target a headword
  whose consonantal skeleton differs from the host's. Five of
  chunk-r00009's escalations are that shape.
- **A01486 reproduces unchanged at the healed stage.** It was one of
  the four class-11 misses that drove the August batch-02 remediation
  and `link-anomalies.ts`. If that holds, the remediation did not
  reach its own named case — the shape
  `feedback_audit_named_controls` warns about.

## Did the 29 re-swept entries earn their place?

Partly, and the answer is checkable rather than rhetorical. Two of the
prior batches' named catchable misses fall in batch 03's rids:

| Prior miss | Prior disposition | Batch 03 |
| --- | --- | --- |
| A00952 (batch 02) | `clean` | **`needs_human_judgment`** |
| A00911 (batch 01) | `clean` | `clean` — still missed |

One caught unaided under v8, one reproduced. On n=2 that is an
observation, not a rate.

## Cost

Whole batch — 5 sweep agents, 4 verification agents, orchestration:

| Origin | Msgs | Input | Output |
| --- | --- | --- | --- |
| subagent (Opus) | 500 | 66,093,944 | 163,853 |
| main | 61 | 11,280,634 | 84,978 |
| **total** | **561** | **77,374,578** | **248,831** |

Fresh 1,119 · cache-write 3,062,317 · cache-read 74,311,142.
Comparable to batch 01's 84.7M on a batch that produced two fewer
patches — and, for the first time, 121 entries of new coverage.

At roughly one third of a five-hour window per batch, the remaining
**91 pending chunks in residue-01** plus tranche 2 are about 25 more
batches.

## Recommendation

**Commit this batch.** The error gate passes at 0.0% with zero
rejects, and the miss rate is not gated.

Before batch 04, land the between-batch detector work as one change
set — items 1–4 above — and re-chunk once rather than three times. The
`inflection-escape-link` exclusion (item 3) is the one that touches
judgment rather than volume, and it is the one with a named
counter-example, so it should carry a control that fires on A01023.

The rejection defect behind A01180 and A01243 is not a detector fix.
If it recurs in batch 04 it wants a prompt change: a hint rejection
should be required to quote the *target* entry's text, not a
recollection of it.
