# Discovery round 2 — sweep complete, consolidation pending

**Status: sweep DONE (22/22 chunks). Consolidation into `patterns.jsonl` NOT
done.** This document is the handoff. Read it before resuming Task 8.

| | |
|---|---|
| Chunks | 22 of 22 reported, one per rid letter A–V |
| Entries | 660 (30 per chunk), zero overlap with round 1 |
| Patches | 20, in `data/patches/discovery-round-2/*.patches.jsonl` |
| Manifest rows | 660, all JSON-valid |
| Raw candidates | 66, recorded in `discovery-round-2-candidates.md` |
| Detector | calibrated first (Task 9); 96 of 660 entries hinted |
| `patterns.jsonl` | still 80 rows, max round 1 — **round 2 not folded in yet** |

## Where things physically are

Everything is committed to the repo. Nothing needed lives in scratchpad any
more.

- `data/patches/discovery-round-2/` — 22 manifests, 22 patch files, and the
  shared `agent-brief.md` the sweep agents ran against.
- `docs/v2/discovery-round-2-candidates.md` — the full per-chunk record: every
  candidate raised, every candidate killed, with corpus counts and letter-A
  membership. **This is the input to consolidation.** Round 1 did not preserve
  its equivalent; round 2 does.

## What round 2 was for

Round 2 exists to test whether discovery has saturated — whether the sweep is
still finding new systemic pattern classes or has started returning what it
already knows. Round 1 catalogued 80 patterns; agents this round were given all
80 as an exclusion list and told plainly that finding nothing is a real result.

## The headline result is a correction, not a discovery

`same-anchor-positional-mislink` is catalogued at **3,183 instances**. Chunk
01013 re-measured it and found the population is two different things:

| Sub-population | Count | Verdict |
|---|---|---|
| Host and previous headword skeletons **related** | 2,882 | **Correct links.** The legitimate `X ch. same` cognate convention. |
| The two are **unrelated** words | 544 | Genuinely wrong. Crispest defensible subset: 374 anchors / 284 entries. |

The row is roughly **85% false positives**. A deterministic transform written
against its current definition would have rewritten 2,882 correct cognate
links. Re-measure this row to 374 (or 544 loose) **before Phase 2 writes
anything against it.**

This also resolves a puzzle six chunks kept reporting without settling: `same`
anchors drift while `next art.`/`preced. art.` never do. `same` does not drift
— it has two jobs and the linker only knows one.

## Merges required before folding into the catalogue

Four pairs of agents in different letters, unable to see each other's work,
independently found the same shape. Convergence at this rate is itself a
saturation signal. Each pair is ONE row, not two.

| Shape | Found by | Resolution |
|---|---|---|
| Stacked impossible niqqud | 00720 (68/47, letter P) and 01049 (93/59, letter V) | Counts differ only because exclusion sets differ. Pick one set, re-measure. Both name L00247. 00720 adds: repair is **not** deterministic → print-check generator, not a script fix. |
| Roman numeral stranded in definition | 01013 (23, letter U) and 01049 (17, letter V) | Take 01013's 23 — it names its 2 false positives. |
| Non-binyan `verbal_stem` debris | 00609 (26) and 01013 (21) | Same four sub-shapes, same exemplars. Widens catalogued `asterisk-stem-label` (43) to ~69 total. |
| Plural declared but not captured | 00948 (358, with mechanism) and 00803 (73, "unexplained") | **00948 explains 00803's gap.** Keep 00948's measurement and mechanism; credit 00803's independent detection. |

Two further re-partitions, where a new candidate carves a subset out of another
candidate rather than standing beside it:

- **`verse-paren-false-sense-split` (13) vs `unmatched-opening-paren` (462).**
  10 of the 13 sit inside the 462, but that row's reading is "text was lost,
  needs a print check". For these 10 that reading is wrong: all 13 balance
  perfectly once the `number` field's `)` is counted, so no text was lost — the
  paren migrated into `number`. Repair is structural, no page consult.
- **`bh-semicolon-open-etymology` (14) vs `unmatched-opening-paren` (462).**
  J00093 יָד is named by both. The 14 is very likely a strict subset: the
  members that also lost their language fields entirely. Probably one row with
  a sub-family, not two rows.

## Strongest genuinely new candidates

- **`holam-migrated-off-mater-vav`** — 558 occ / 308 entries, 111 in letter A.
  The holam of a *holam male* sits on the consonant before the mater vav
  instead of on the vav. Two controls kill the "it's just this corpus's
  encoding convention" reading: 10 headwords carry **both** encodings in one
  string (A02608 `אָפֹּובַּלְסְמוֹן` — wrong on `פֹּו`, right on `מוֹן`), and 56 of the 103
  bad headwords have their corrected spelling attested verbatim elsewhere.
  Deterministic fix: move U+05B9 one position right.
- **`binyan-form-leading-space`** — 523 of 523 (100.0%), 457 entries, all 22
  letters. Every non-empty `grammar.binyan_form` item after index 0 begins with
  a leading space; index 0 never does; all other arrays are clean. A 100% rate
  is the signature of a split-on-delimiter that never strips — **this should be
  findable in the migration code directly**, not repaired downstream.
- **`plural-label-rendering-defeats-capture`** — 358 entries, 42 in letter A.
  The extractor is keyed to the *rendering* of the plural label, not its
  meaning: canonical `Pl. ` misses 0.4%, `<i>Pl</i>.` misses 86.7%. The
  near-perfect canonical bucket is the internal control.
- **`impossible-dagesh`** — 19 occ, letter A present. Self-diagnosing: a dagesh
  on ר is impossible, but the dagesh forte belongs on a doubled ד, so the
  corruption announces its own correction (`חִרּוּשׁ` ← `חִדּוּשׁ`). The 15 ר cases are
  deterministically fixable.

## Settled negatives — do not re-probe these

- **Entry-sequence integrity is perfect.** Three chunks (00682, 00841, 00948)
  independently checked `prev_hw`/`next_hw` against rid order across all 32,512
  entries: 0 mismatches, 0 rid gaps. All three correctly identified the
  apparent breaks in *file* order as JSONL interleaving artifacts. Settled.
- **No systemic stem mislabeling.** 3,421 `binyan_form`/`verbal_stem` pairs
  checked against the expected prefix consonant for all 14 prefix-marked stems:
  25 mismatches (0.7%), essentially all legitimate imperatives, participles or
  Hebraisms. Hif. 0/591, Ithpa. 0/472, Nithpa. 0/216.
- **Asterisk in refs is internally consistent.** 0 of 72,257 anchors name an
  unstarred form whose only headword is starred.
- **`next art.` / `preced. art.` anchors resolve correctly.** All 100 checked.

## Saturation call — the arithmetic

`isSaturated(rows, round)` uses `SATURATION_ROUNDS = 2`: it computes
`cutoff = round - 2` and returns true only when no catalogue row has
`round > cutoff`.

- **At round 2: not saturated.** `cutoff = 0`, and round 1's 69 rows all have
  `round = 1 > 0`.
- **At round 3: cannot be saturated either**, because round 2 added rows with
  `round = 2 > 1`. This holds regardless of what round 3 finds.
- **Round 4 is the earliest possible declaration**, and only if rounds 3 and 4
  both add nothing new.

> **Trap — do not run the saturation check before folding round 2 in.**
> Verified against the current catalogue: with round 2 *not* yet folded,
> `isSaturated(rows, 3)` returns **`true`**. That is a false declaration — it
> reads the absence of round-2 rows as "round 2 found nothing" when in fact
> round 2 has not been recorded yet. Fold first (next action 1), then check
> (next action 4). Confirmed by simulation: with even one `round: 2` row
> present, `isSaturated(rows, 3)` correctly returns `false`.

So the formal gate is not close. But the *evidence* is pointing at saturation,
and the two should be weighed together rather than one deferring to the other:

- Yield per chunk fell from 5–8 patterns in round 1 to 1–4 in round 2.
- One chunk (00466) returned **zero** new patterns, killing all four of its own
  candidates with corpus counts.
- Four convergent pairs — agents finding each other's shapes independently.
- Two agents volunteered saturation reads without being asked. Chunk 00803:
  "two of my four raised leads died on corpus counts of 1... the remaining
  yield concentrated in *re-partitioning* already-catalogued populations."
  Chunk 01013: "the remaining value sitting in *re-measuring* round-1 rows
  rather than finding new ones."

**Recommendation for whoever picks this up:** the pattern-discovery question is
substantially answered. The remaining yield is in re-measuring round-1 rows,
not in finding new ones — and the `same`-anchor result shows re-measurement is
where the actual risk to Phase 2 lives. Consider putting round 3's budget into
auditing the existing 80 rows rather than sweeping 22 more chunks. That is a
judgment call for Brian, not one to make silently.

## Next actions, in order

1. **Fold round 2 into `patterns.jsonl`** with `round: 2`, applying the merges
   and re-partitions above. Source: `discovery-round-2-candidates.md`.
2. **Re-measure `same-anchor-positional-mislink`** from 3,183 to 374/544. This
   is the one item that is actively dangerous if left alone.
3. **Re-measure the other rows round 2 corrected:** `asterisk-stem-label`
   43 → ~69, `plural-form-empty-slot` (add the 486-slot `binyan_form` twin),
   `stranded-open-bracket` (under-measured per 00841).
4. **Run `isSaturated(rows, 2)`** and record the result — expected `false`, per
   the arithmetic above. The point is the audit trail, not the answer.
5. **Decide round 3's shape** with Brian: another 22-chunk sweep, or an audit
   pass over the 80 existing rows.

## Detector calibration notes for Phase 2

Round 2 surfaced four concrete detector defects worth fixing before any further
sweep:

- The **alt_headwords carve-out must be checked before the exact-headword rule
  fires** — Q01327 was a false positive because the display's bare form is
  separately a headword.
- **One-letter geresh forms are exempt** from the detector, yet P00371's own
  `alt_headwords` is exactly `["עוֹ׳"]` — the exemption is too broad.
- **`bare-abbrev` does not cover the conjunction `a.`** (13 corpus-wide).
- **`hebrew-rare-confusable` will miss the `impossible-dagesh` cases** whose
  corrected token does not clear the ≥100× threshold (`פַּנְדּוּרָה`, `סִידּוּק`) — which
  is why that rule earns a place beside the detector rather than inside it.

## Carried-forward items (not from round 2)

- The 57 chunks accepted before the catalogue existed still need re-checking
  against the full pattern set.
- `alt-headword-collision` sits at `corpusCount: 0` and needs sizing. Round 2
  supplied a textbook instance: P00390's `בן ע׳` → `*עָקוֹשׁ I`, whose
  `alt_headwords` holds `בֶּן ע׳`, the only occurrence of that string corpus-wide.
- `etymology-head-pseudo-sense` (1,553) needs a maintainer ruling.
- The patch / `repairs.ts` composition check is still owed before Phase 3.
