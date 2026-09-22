# Residue batch 06 — residue-01 chunks r00021–r00025, sweep-v10

The first batch under **v10**, and the second in a row where every
entry was new ground. Maintainer go recorded **2026-09-05 21:02 CDT**;
usage baseline marked `2026-09-06T02:02:24.339Z`. Sweep tier Opus,
prompt `sweep-v10` (signed 2026-09-05), verification `verify-v3`,
corpus stage `healed`. Population 3,759 residue / 3,698 sweep / 124
chunks.

**150 of 150 entries had never been swept.** The rid ledger went
573 → 723, growing by exactly the 150 prep predicted.

## The ordering fix held through its first re-chunk

`RESIDUE` moved 3,757 → 3,759 between batches, which re-cuts every
chunk. Prep offered `r00021`–`r00025`, skipping `r00020`. That was
checked rather than assumed: **`r00020` holds 28 unswept entries and
stays pending**, correctly ranked behind the fully-virgin chunks by
`pendingChunks`. Nothing was dropped.

One consequence worth knowing. `r00019` was swept in full by batch 05,
and the +2 residue move shifted the cut so it now holds **2 unswept**.
Every population move manufactures new boundary stragglers this way;
they accumulate at the tail for one later batch to clear in a single
pass, which is what the ordering change was for.

## Measured

| Measure | Batch 06 | Batch 05 | Batch 04 | Batch 03 |
| --- | --- | --- | --- | --- |
| Entries | 150 | 150 | 150 | 150 |
| **Never swept** | **150** | 150 | 140 | 121 |
| clean | 40 | 39 | 48 | 55 |
| repaired | 0 | 1 | 1 | 0 |
| needs_print_check | 21 | 22 | 25 | 17 |
| needs_human_judgment | 89 | 88 | 76 | 78 |
| Patches accepted / rejected | 3 / 0 | 2 / 0 | 3 / 0 | 3 / 0 |
| **Sampled error rate** | **0.0%** | 0.0% | 0.0% | 0.0% |
| Clean-sample catchable-miss rate | 13.3% | 13.3% | 6.7% | 33.3% |
| Verifier discoveries | 0 | 1 | 1 | 0 |
| Escalation queue | 110 | 110 | 101 | 95 |

Per-chunk (patches; clean/repaired/print/judgment): r00021 2
(7/0/6/17), r00022 0 (8/0/5/17), r00023 0 (8/0/3/19), r00024 1
(10/0/2/18), r00025 0 (7/0/5/18).

## Gates

- **Patch error gate (≤5%): PASSES at 0.0%.** 3 sampled, 3 `ok`, 0
  label-only, 0 substantive. The verifier re-implemented `applyPatch`
  and `validateNoNewText` outside the repo and replayed both chains
  against its own implementation — including **independently deriving**
  B00881's chain anchor `dc4aac70` from the post-split host rather than
  trusting the sweep's script-computed value.
- **Catchable-miss gate: retired** (tiering spec T1). 13.3% — 2 in 15.
- Ingest: 5 chunks, 3 patches, **0 rejects**.
- **Rejection audit: 16 audited, 0 mis-grounded**, matching batch 05.
  Two thin-but-correct sub-claims were named and, per the standing
  blind-spot clause, not scored.

## The batch's most valuable finding is a code bug

`chunk-r00023` traced one of its two false positives to
`buildHeadwordIndex`, and it is real. **Two of the loop's seven maps
overwrite where the other five merge:**

```
recordedSkeletons.set(base, recordedSkel);   // replaces
redirect.set(base, to);                      // replaces
```

`alts`, `bySkeleton`, `skeletonOwners` and `formsOf` in the same loop
all read-modify-write. These two do not, and no comment justifies the
difference — in a loop where every other decision is commented.

`baseHeadword` strips homograph numerals, so an entire homograph family
collapses to one key and **the last entry written wins**:

| | Count |
| --- | --- |
| base keys total (control) | 30,078 |
| base keys with ≥2 entries | **2,053** |
| entries whose contribution is discarded | **2,434** |
| redirect stubs shadowed by a same-base sibling | **121** |

The named case reproduces exactly. Five entries base to `בַּר`
(B01152–B01156); `recordedSkeletons['בַּר']` holds only `["בר"]`,
because B01156 is written last and its one alt has the same skeleton as
its base. B01153's recorded `בָּרָא` — the form the sweep needed to see
— is gone, so `own-form-escape-link` fired on a correct link.

This also corrects a figure in batch 05's own record. That report noted
7,690 bare stubs against a `redirect` map of 7,680 and explained the
gap as "ten bases carry two stub entries between them". That was this
bug's footprint, and it was under-counted: **121 stubs are shadowed**,
not ten. The ten was the residue after collisions, not the collisions.

Two verifiers confirmed the collapse reaches their own samples
(C00174's `גָּדַד I`/`II` family, B00774's `מַכּוֹשׁ` family) while
noting that no verdict of theirs rested on the index — both read the
target entries directly.

**The fix is deliberately held out of this batch.** Changing a detector
moves the residue fingerprint, and a fingerprint move mid-batch would
invalidate the ingest this report describes. It lands next, between
batches, like the clause-1 floor before it.

## v10 shipped with v9 in its body

The output-contract field table, checklist item 7 and both
worked-example patch records still said `v9` while the header, Input
table and sign-off said `v10`. **Two sweep agents caught it
independently**, both applied the "code wins over this document" rule,
and both emitted `v10`. No tranche output is affected.

v7, v8 and v9 each updated their body correctly; the v6 → v7 changelog
records the same defect in v6. Fixed in `95e0ac2`, and recorded in
v10's own changelog rather than patched quietly, because three of that
changelog's four items are cases of a document arguing from a stale
premise. The operational rule is now written there: **when cutting
vN+1, grep the whole file for `v<N>`, not just the header.**

## The two catchable misses

**B01112 `בְּקָא` — the recall gap v10 names, arriving on schedule.**
The anchor displaying `בָּקֵי`, this entry's own printed participle,
links out to B01118 `בָּקִי` "expert, versed" — a different lemma. No
hint fired because `own-form-escape-link`'s "target records the form"
exemption is computed on `recordedSkeletons`, which is skeleton-level,
so `בָּקֵי` and `בָּקִי` compare equal.

That is verbatim the weakness v10's own row warns about ("blind to
sense, so it suppresses real defects where target and display differ
only by niqqud"), now observed rather than predicted. **And both
corroborators from the asterisk sizing settled it**: B01117 `בְּקִי` is
a redirect stub whose whole content is `, v. בְּקָא` — a reciprocal
back-link — and N01194 `נְקֵי` opens `[Targ. Prov. XVII, 3, v. בְּקָא.]`,
sending this exact citation home.

**C00299 `גּוּך` — a defect class with no catalog row.** The headword
is written with a final kaf while every form the entry itself attests
ends in dalet: "sec. r. of אָגַד I", "denom. גִּיד", "Polel גּוֹדֵד",
"לֹא תָגוּדוּ". The corpus places it `גּוּגְמֵי → גּוּך → גּוּד`, out
of alphabetical order.

It has a knock-on the sweep also missed: **C00170's `v. גּוּד` lands on
C00300**, a pointer entry reading ", forms of גדד a. נגד.", rather than
on this root entry. The sweep's own `hint_notes` called C00170's
`v. גּוּד` "this host's root" — true in substance, and resolving
elsewhere precisely because the headword is corrupt.

**No patch op writes headwords**, so `needs_human_judgment` is the
correct disposition and a `corrupt-headword` class is the proposal.
The verifier weighted its corroboration honestly rather than
overselling: 277 of 32,511 adjacent pairs violate ordering anyway, and
9,619 entries have no inbound anchor, so both signals are support and
not proof. It explicitly declined to say whether C00299 is a one-off or
the tip of a ד/ך population.

A near-miss recorded for the method: the **source** text of C00299
reads `(sec. r. of (sec. r. of`, a class-6 duplication. The **healed**
stage the agent actually read has it at one occurrence, already
repaired by a transform. Reporting it would have been the corpus-stage
trap running in the other direction.

## `own-form-escape-link`: the measurement continues

| Batch | Hints | Real | False positives |
| --- | --- | --- | --- |
| 05 | 30 | 28 | 2 |
| **06** | **38** | **36** | **2** |
| **Total** | **68** | **64** | **4** |

Per chunk this batch: r00021 5/5/0, r00022 11/10/1, r00023 8/7/1,
r00024 7/7/0, r00025 7/7/0.

Read it as precision on what the detector chose to flag, not as a rate
over the class it sorts. Both of this batch's false positives are
exemption failures, and neither is a shape batch 05 found:

| Entry | Cause |
| --- | --- |
| B01237 | the `recordedSkeletons` overwrite above — the index had lost the form the target records |
| B01102 | a **prose-lead stub** (`ditches, v. בִּצְעָה`), which the batch-05 `STUB_LEAD` widening explicitly refuses; **and** a plene/defective pair (`בִּיצְעִין` vs `בִּצְעִין`) the matres-kept comparison cannot see |

**B01102 names a genuine design tension.** Batch 05 established that
the "records the form" exemption is too **broad** — it suppresses real
defects differing only by niqqud (B01112 above is a fresh instance).
B01102 shows the same exemption is too **narrow** for matres.
Loosening for one tightens the wrong way for the other. This is not a
threshold to retune; it wants the corroborators — a reciprocal
back-link, a shared citation — that decided both the asterisk sample
and B01112.

Recall misses continue to outnumber precision failures. B01239, B01317
and C00153 each carry the same defect as a hinted sibling and arrived
unhinted, all suppressed by the same form-level exemption.

## The dispatch addenda earned their place

The four rules v10 does not carry were the batch's most productive
instructions.

- **Citation anchors (addendum 3).** Batch 05's two misses were both
  anchors the sweep never reached. Told to check them, agents found
  unhinted citation mislinks in three chunks — C00244's `I Chr. IV`
  against `data-ref="I Chronicles 4:39"`, B01138's `Tanḥ. ed. Bub.
  B'resh. 23` → `Genesis 23`, B00937's Tosefta arms splitting 6:1 from
  7:14, and B00753's Midrash Tehillim chapter disagreement (measured:
  45 of 843 disagree, 798 agree — not systemic).
- **The asterisk blind spot (addendum 4).** It fired the day after it
  was written. **C00403 displays `ארז` — the cedar of Num. XIX, 6 —
  and lands on `*ארז`, the verb root**: a third instance of the A03269
  shape, found by an agent who knew only that the region was unhinted.
  C00193's `גְּדֵי` → `*גְּדֵי` is a fourth. Two agents also checked
  their starred anchors and correctly found **no** exposure, recording
  why (single-owner skeleton; disambiguating numeral present).
- **Rejection grounding (addendum 1)** and **the JSONL grep trap
  (addendum 2)** held: 16 audited at 0 mis-grounded, and one agent
  caught itself when a control returned zero on a pattern it knew
  fired.

All four remain candidates for v11.

## Counted, not escalated

Every figure parsed line-by-line with a positive control and its stage
stated; each reported once rather than per entry.

- **Unlinked `Ib.` citations: 3,256 unlinked against 5,795 anchored**
  (control: unlinked `the` = 65,969). **Larger than the unlinked-`Y.`
  row v10 already carries** at 893/2,190, and it has no row — so an
  agent has nothing telling it not to escalate. The strongest v11
  candidate.
- **`Tanḥ.` anchors resolve to a plain Torah book in 134 of 134 cases**
  (control: 168,913 anchors parsed). No row covers it.
- **`same` displays:** 1,056 sense-text anchors, 1,047 resolving to
  rid−1, of which 599 sit inside a stem block where the rule is wrong.
  Consistent with batch 05's independent count on a wider predicate.
- **A 4-entry etymology cluster, fully contained in one chunk:**
  C00059, C00062, C00101, C00130 all anchor a `b. h.` root `גבר` to
  the Chaldaic גְּבַר I rather than the Hebrew גָּבַר — exactly 4
  entries corpus-wide, all four in r00024 (control: 4,174 entries carry
  any `language_reference` data-ref). One ruling settles all four.
- `בִּי׳` → בִּדּוּר is uniform 10/10; `בער` → בְּעַר I is uniform
  10/10; `Esth. R. to I, 3` → `Esther Rabbah 1:15` is 25/25.
- Superscript-digit headwords **806–807**; final-kaf headwords 382;
  orphan entries 9,619 / 32,512; adjacent-pair ordering violations
  277 / 32,511.

## A negative result worth keeping

A verifier tested whether the `Ib.` → `Yoma 2a` segment-granularity
shape generalizes: **399 of 4,364** `Ib*` anchors following a segmented
antecedent land on a bare daf, but nearly all name a *different* daf.
So bareness is resolver granularity, not the anaphoric bug, and
B00815's `Ibid.` → bare `Bekhorot 44a` after `Bekhorot 44a:8` is the
benign case. No finding — and worth having established, because v10's
new decline guidance invites exactly this question.

## Two small detector fixes queued

1. **`inflection-escape-link` has no redirect-stub exemption** while
   `own-form-escape-link` does. C00064's `גְּבוּרָן` → C00061 is
   precisely that shape, so the hint was a structural false positive
   the sweep had to reject by hand. Cheap to close — and it interacts
   with the held index fix, since 121 shadowed stubs mean the redirect
   exemption is already blind in places. Re-measure both kinds after.
2. **A citation the sweep left implicit.** P000091's pre-decided input
   is **doc-01** line 95 (numbering gap, print-verified), not doc-08 —
   C00062 is absent from doc-08. doc-01's header says such rows "must
   be structurally split", so the patch completes that ruling. The
   rationale rests only on the numbering gap, which is independently
   sufficient; nothing is mis-grounded.

## Cost

| Origin | Msgs | Input | Output |
| --- | --- | --- | --- |
| subagent (Opus) | 675 | 104,205,425 | 100,929 |
| main | 77 | 25,838,346 | 93,896 |
| **total** | **752** | **130,043,771** | **194,825** |

Fresh 1,509 · cache-write 3,826,515 · cache-read 126,215,747. Nine
agents, as in batch 05, against batch 05's 108.2M — up 20% on the same
150 new entries, most of it the index-bug investigation carried inside
the sweep chunks.

Batch 05 is archived here as well. As with batches 03 and 04 it should
have been archived **before** this batch ran; ingest appends, so
residue-01 briefly held both. Split by append order and verified: 150
rows each, zero rid overlap, and the last 150 match the prepped
batch-06 rids exactly.

**89 chunks pending in residue-01**, plus tranche 2.

## Recommendation

**Commit this batch.** Error gate 0.0%, zero rejects, 150 of 150
entries new, 16 of 16 rejections grounded, and the highest patch count
of any residue batch.

The 13.3% miss rate equals batch 05's on the same sample size. Neither
should be read as a trend at n=15. What the four misses across the two
batches share is more useful than the rate: **three of the four were
anchors or fields the sweep never reached** — citation anchors in batch
05, the headword itself in C00299 — and the fourth (B01112) was
suppressed by a detector exemption whose weakness the prompt already
documents.

Before batch 07, in priority order:

1. **Land the `buildHeadwordIndex` merge fix.** It is held from this
   batch on purpose, it has a named reproducing case, and it silently
   degrades two exemptions across 2,053 base keys. Audit the residue
   movement by differencing rid sets, not counts.
2. **Re-measure `own-form-escape-link` and `inflection-escape-link`
   after that fix**, and add the redirect-stub exemption to the latter.
   Both false positives this batch were exemption failures; one of them
   is the bug itself.
3. **Cut sweep-v11** with the four standing dispatch addenda, the
   unlinked-`Ib.` row, and the `Tanḥ.` row.
