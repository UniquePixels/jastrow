# Residue batch 05 — residue-01 chunks r00015–r00019, sweep-v9

The first batch in which **every entry was new ground**, and the first
field test of `own-form-escape-link`. Maintainer go recorded
**2026-09-05 14:43 CDT**; usage baseline marked
`2026-09-05T19:44:57.245Z`. Sweep tier Opus, prompt `sweep-v9`
(signed 2026-09-04), verification `verify-v3`, corpus stage `healed`.
Population 3,757 residue / 3,696 sweep / 124 chunks, after
`own-form-escape-link` shipped in `a192670`.

**150 of 150 entries had never been swept** — against 140 in batch 04,
121 in batch 03 and 3 in batch 02. The rid ledger went 423 → 573,
growing by exactly the 150 prep predicted. That number is the result
of a tooling fix made before dispatch, not of luck; see the next
section.

## Prep offered a batch covering six new entries

`pendingChunks` returned chunks in **positional** order and the caller
slices from the head. Membership is deliberately conservative — a
chunk holding even one unswept rid is dispatched in full — and
`own-form-escape-link` had just interleaved 205 new entries into an
already-swept head, leaving eleven old chunks holding one or two each.

The default prep therefore offered `chunk-r00001`–`r00005`: **150
entries covering 6 unswept ones.**

Measured across all 124 chunks before dispatching:

| Chunk state | Chunks | Unswept entries held |
| --- | --- | --- |
| Fully swept (skipped) | 3 | 0 |
| Partly swept (dispatched in full) | 11 | 37 of 330 |
| Never touched | 110 | 3,300 |

The drag is bounded and sits entirely in `r00001`–`r00014`. The
maintainer chose to fix the ordering rather than skip past it by hand.
`pendingChunks` now ranks by unswept count, stably; membership is
untouched and a chunk with a single unswept rid is still returned. The
re-prep produced `r00015`–`r00019`, 150 of 150 never swept.

This is the third time positional chunk ids have cost a run — the
first two are recorded in the RUNBOOK's "Progress is tracked by rid"
section, where three consecutive batches swept the same 162 entries.
The rid ledger fixed *skipping*; this fixes *ordering*, which is the
half the ledger could not reach.

## Measured

| Measure | Batch 05 | Batch 04 | Batch 03 | Batch 02 |
| --- | --- | --- | --- | --- |
| Entries | 150 | 150 | 150 | 150 |
| **Never swept** | **150** | 140 | 121 | 3 |
| clean | 39 | 48 | 55 | 58 |
| repaired | 1 | 1 | 0 | 1 |
| needs_print_check | 22 | 25 | 17 | 39 |
| needs_human_judgment | 88 | 76 | 78 | 52 |
| Patches accepted / rejected | 2 / 0 | 3 / 0 | 3 / 0 | 4 / 0 |
| **Sampled error rate** | **0.0%** | 0.0% | 0.0% | 0.0% |
| Clean-sample catchable-miss rate | 13.3% | 6.7% | 33.3% | 20.0% |
| Verifier discoveries | 1 | 1 | 0 | 1 |
| Escalation queue | 110 | 101 | 95 | 91 |

Per-chunk (patches; clean/repaired/print/judgment): r00015 0
(10/0/6/14), r00016 0 (5/0/5/20), r00017 1 (10/0/2/18), r00018 0
(7/0/6/17), r00019 1 (7/1/3/19).

## Gates

- **Patch error gate (≤5%): PASSES at 0.0%.** 2 sampled, 2 `ok`, 0
  label-only, 0 substantive. The verifier re-implemented `applyPatch`
  and `validateNoNewText` from the contract rather than calling the
  repo's code, replayed both patches against the state they land on,
  and reproduced both rationales' corpus counts exactly (paren-outside
  1,351 vs paren-inside 404, control 101,225; `1]` once in the entire
  corpus).
- **Catchable-miss gate: retired** (tiering spec T1). 13.3% — 2
  catchable misses in 15 sampled clean entries. A02942 is a discovery,
  not a catchable miss, and is not in the rate.
- Ingest: 5 chunks, 2 patches, **0 rejects**.

### A vacuous reading of the miss gate, caught and corrected

The first render of this report said **0.0% on 0 clean entries
sampled**. The report harness passed `sample.clean` entry *objects*
where `buildPilotReport` expects rids, so `sample.clean.includes(v.rid)`
matched nothing and the gate reported a pass while seeing none of the
fifteen verdicts. It was caught only because the `Clean entries
sampled` row prints the denominator next to the rate. A rate whose
denominator is not shown beside it is not a reading.

## `own-form-escape-link`: the first out-of-sample measurement

The detector shipped 2026-09-05, **after v9 was signed**, so its hints
arrived with no row in the prompt's table — the shape v9's own
changelog names as "the flood the table exists to prevent". The
dispatch supplied a provisional row and told every agent the
detector's 17/20 fixture score is **in-sample** and carries no
authority. Each agent reported its hints separately.

| Chunk | Hints | Real mislinks | False positives |
| --- | --- | --- | --- |
| r00015 | 6 | 6 | 0 |
| r00016 | 9 | 8 | 1 |
| r00017 | 1 | 1 | 0 |
| r00018 | 10 | 10 | 0 |
| r00019 | 4 | 3 | 1 |
| **Total** | **30** | **28** | **2** |

**Read this as precision on what the detector chose to flag, and
nothing else.** It is not comparable to the 10-of-20 base rate of the
362-anchor parent class: that rate describes the population the
detector was built to *sort*, and a sorter that works should score far
above it. Four agents said explicitly that they were ruling nearly all
their hints one way, which is what the dispatch asked for and is the
reason the number can be read at all.

The measurement carries no recall. Every chunk that looked found
misses.

### Both false positives are the same exemption, and it has three gaps

Exemption (b) — *the target is a bare `, v. X` stub redirecting back
to the host* — is matched too narrowly.

| Entry | The stub shape the exemption did not match |
| --- | --- |
| A03316 | a citation precedes the `v.`: `Targ. I Chr. I, 20, v. אַשְׁלָא`. Reciprocity is exact — the host's next clause quotes the same citation back |
| B00443 | the stub's `data-ref` says `בִּזְיוּנָא I` while its display says `II`, so a ref-keyed resolver never sees the host; and the host's headword string is `בִּזְיוּנָא , II`, a stray comma, so a string-keyed match fails too |
| B00138 | the stub redirects to the host's **etymon** (בְּדַח) rather than to the host. Not a false positive — the agent escalated it with the reservation stated — but the same widening would drop it |

Nine of 32,512 headwords contain a comma (counted at B00443), which
bounds the B00443 mechanism.

### Exemption (a) suppresses real defects, exactly as predicted

Exemption (a) — *the target records the displayed form* — is
form-level and blind to sense. Two chunks found real mislinks it hides:

| Entry | Missed because |
| --- | --- |
| A03431's `אַתְנָן` → A03435 | the target headword `אֶתְנָן` matches the display at skeleton level, niqqud only. Both forms are in A03431's own `plural_form` `['אַתְנָן','אַתְנֵי']`; the sibling anchor `אַתְנֵי` WAS hinted, this one was not |
| B00108 | two plural anchors point at the same wrong target; only one was hinted, because the other matched the target headword as an exact string |

`docs/v2/phase-2-inflection-gap.md` predicted this in advance for the
927-anchor bucket: *"No comparison of letters can separate 'links to
the entry that is this form' from 'links to a homograph that merely
spells it'."* This is its first field confirmation, on anchors nobody
chose.

**No corpus scale is claimed.** `chunk-r00017` ran a crude predicate
returning 982 rows and refused to call it a defect count, saying
plainly that nearly all are benign links to an entry that really does
record the form and that it could not separate the harmful subset
mechanically. Treat 982 as a superset.

## A recorded round-1 claim is falsified

`headword-index.ts` lines 99–103 document `EDITORIAL_ASTERISK` with:
*"Round-1 letters B and J found this independently: 1,339 `*`
headwords, 1,412 anchors whose display is exactly the de-asterisked
target, all correct."*

**A03269 is a counter-example**, and it is one of this batch's two
catchable misses. Its anchor displays `ארז` in "disting. fr. ארז
*male cedar*" and targets `*ארז` (A03047), the verb root "to penetrate
deeply … to be prickly, dry, hard". The cedar noun is A03048 `אֶרֶז`
"(b. h.) cedar". The reader clicking "male cedar" lands on a verb
about being prickly.

The mechanism is in the code, not in the data. `twinHint` returns
early on `base === target`, and `baseHeadword` strips the editorial
`*`, so an anchor displaying `ארז` at target `*ארז` compares
string-identical and is never hinted — even when the de-asterisked
skeleton is carried by a second, non-asterisked entry.

Counted on the source snapshot, by parsing every line, with a live
control:

| | Count |
| --- | --- |
| Jastrow anchors (control) | 72,222 |
| anchors targeting a `*` headword | 2,261 |
| …whose de-asterisked skeleton is carried by ≥2 entries | **491** |

Spot-reading the other six `*ארז` anchors found at least two more of
the same shape outside the sample (C00403, S00183 — both mean the
cedar noun, both point at the verb root). **The 491 is an unmeasured
exposure, not a defect count**; none of it has been adjudicated. The
docstring's "all correct" should not survive to the next batch
unqualified.

## The second catchable miss

**B00459** — the anchor displaying `Lam. R. to II, 17` carries
`data-ref="Eichah Rabbah 1:1"`. Chapter II against chapter 1, and the
surrounding gloss quotes `בצע אמרתו`, which is Lamentations II, 17: the
display is right and the destination is wrong.

It is **not** the systemic Eichah sink. Of 669 `Lam. R. to <ch>`
anchors, 2 disagree with their target chapter (this one and A01351);
positive control 639 agree. 132 of the 134 anchors landing on
`Eichah Rabbah 1:1` display chapter I, which is at least
chapter-consistent.

Catchable: one target lookup decides it. The sweep's `hint_notes`
enumerated only the two *Jastrow* anchors and left every citation
anchor uncompared — the mandatory display-vs-target check was not run
across the entry.

## The discovery

**A02942** — `(corr. ed. acc.)` after `Ned. 41ᵃ` occurs **exactly once
corpus-wide**, against `corr. acc.` 3,010×, `(ed. …, corr. acc.)` 432×
and `ed. corr. acc.` 2× (both real usages). v9 class 8's
stereotyped-formula shape; likeliest a lost variant reading between
`ed.` and `corr. acc.`, so `needs_print_check`. Marked
`catchable: false` — only corpus-frequency forensics beyond the
supplied hints separates it. The same rare-run scan over all five of
that verifier's entries, with a positive control (max run `a. fr.`
9,820), turned up no other genuine singleton.

## The rejection audit held

Batch 03 lost two entries to hints rejected confidently while the
stated grounds quoted a *different* entry's text. Batch 04 added the
rule — a rejection must rest on the target's own text, read from the
corpus, and escalate rather than rule clean when that text cannot be
found — and audited 15 rejections at 0 mis-grounded.

**Batch 05: 16 rejections audited across the three clean verifiers, 0
mis-grounded.** Every load-bearing quote checked out, including
A02949's four-target rejection and A03031's reciprocal-stub argument.

One **thin-but-correct** rejection was met and, per the standing
blind-spot clause, not scored: A03261 picks שְׁגַר I on the target's
own Af. sense, then closes with "the reader lands correctly either
way" — a refusal to pick where the v9 row requires picking — and
asserts that the Hebrew שָׁגַר "is linked separately and correctly"
without reading it. The verifier read U00233 and found the assertion
true. Conclusion right, grounds thinner than the conclusion. This is
the second batch running in which the measure has been unable to see
this shape.

## Detector and prompt defects found

1. **`one-consonant-diverge`'s "display is no corpus headword" test
   looks like exact-string.** A03274's hint asserts `שור` is no corpus
   headword; `שׁוּר I`, `שׁוּר II`, `שׁוּר III` and `שׁוּר` all are. An
   unvocalized display can never match a vocalized headword under an
   exact test. The anchor is a real mislink, but on different grounds
   than the hint states — a hint that argues from a false premise
   teaches an agent the wrong test.
2. **`abbrev-mislink`'s redirect-stub carve-out appears to key on the
   literal `v. sub`.** A02983's whole content is `, v. אַרְגְּוָו׳` —
   the identical redirect-stub shape without "sub" — and it still
   produced a hint.
3. **v9 never says the `ib-yoma-2a` bare arm has 103 declines.** The
   sweep justified B00459's `Ib.` → `Yoma 2a` anchor as "the
   documented sibling arm"; the sibling arm is the *segmented*
   `Yoma 2a:N`, and this anchor is the shipped rule's own bare-arm
   population, specifically one of its declines (its antecedent is
   printed but never anchored, so there is nothing lawful to copy).
   Right conclusion, wrong grounds — and v9 gives an agent no way to
   tell a decline from a repair. Worth a row.
4. **A stage trap that cost one sweep agent a finding, and one
   verifier confirmed.** Resolving a **healed**-stage `data-ref`
   against a **source**-stage headword index yields false "dangling
   target" readings. A03300's three `Jastrow, אַשְׁוָתָא` refs carry a
   shin-dot the source spelling lacks. The agent caught it with a
   control — only 81 of 73,469 source-stage Jastrow anchors genuinely
   fail to resolve — and withdrew the finding. This was in the
   verification dispatch and belongs in the next prompt revision.

## Counted, not escalated

Each figure below was taken by parsing the JSONL line by line with a
positive control, and reported once rather than per entry.

- **`same` displays:** 3,428 anchors; 3,408 target the immediately
  preceding entry; 0 self; 593 sit inside a stem-marked sense. Two
  agents reproduced this independently, agreeing to within one
  headword-resolution edge (3,408 vs 3,409 "other" split). Batch 04
  measured the same shape at 1,055/1,056 on a narrower predicate.
- **Top-level `2)` without its em-dash:** 138, against 2,961 `—2)`
  (control: 3,289 top-level `1)`). No catalog class covers a marker
  missing its em-dash.
- **Unbalanced delimiters:** 1,210 paren-unbalanced and 121
  bracket-unbalanced entries against 31,252 balanced — so B00181,
  B00220 and B00270 are escalated per entry, not proposed as a row.
- **`plural_form` empty elements:** 703 of 6,113 — 595 trailing, 140
  non-trailing — matching v9's systemic 703 exactly, so the row was
  read as covering the non-trailing position too.
- **`plural_form` values that are a bare Roman numeral:** 57.
- **Headwords containing a comma:** 9 of 32,512.
- **Space-before-semicolon:** 150, control `; ` 54,332. Whitespace
  only, no class.

## v9's script-slated rows held again

`refs`/`data-ref` disagreement and unlinked `Y. <tractate>` citations
were named and passed over by agents across all five chunks, as in
batch 04. Neither flooded the queue.

## The mandatory display-vs-target check, again

Unhinted class-11 mislinks it caught this batch: A02895, A02951,
A02988, A03004 (×2), A03049, A03081, A03137, A03180, A03230, A03314,
B00211, B00099, B00254, B00129, B00328, B00349, B00387, B00451,
B00468, B00005, B00024, B00038, B00045, B00049. It remains the
sweep's most productive rule, and both of this batch's catchable
misses are entries where it was **not** run across every anchor.

## Cost

| Origin | Msgs | Input | Output |
| --- | --- | --- | --- |
| subagent (Opus) | 624 | 89,300,089 | 150,040 |
| main | 122 | 18,871,421 | 124,387 |
| **total** | **746** | **108,171,510** | **274,427** |

Fresh 1,492 · cache-write 4,151,587 · cache-read 104,018,431. Nine
agents, as in batch 04 (five sweep + three clean + one patch), against
batch 04's 97.4M — up 11%, on 150 new entries rather than 140.

**116 chunks pending in residue-01**, plus tranche 2. 121 were
actionable before dispatch (11 partly swept, 110 never touched, per
the table above); this batch's five chunks came entirely from the
never-touched pool, so 121 − 5 = 116.

## Recommendation

**Commit this batch.** Error gate 0.0%, zero rejects, 150 of 150
entries new, and 16 of 16 rejections correctly grounded.

The 13.3% miss rate is higher than batch 04's 6.7% and should not be
read as a regression: n=15 both times, different populations, and this
batch's two misses are both anchors an agent did not *reach* rather
than anchors it judged wrongly. What the two have in common is worth
more than the rate — in each, the entry-local display-vs-target check
was run on the Jastrow anchors and not on the rest.

Before batch 06, in priority order:

1. **Widen `own-form-escape-link`'s exemption (b)** to the three stub
   shapes above. Two of this batch's 30 hints are false positives and
   both are that exemption; the fix is small and the evidence is
   three named entries.
2. **Qualify the `EDITORIAL_ASTERISK` docstring.** "All correct" is
   falsified by A03269 with two more spotted. The 491-anchor exposure
   should be sized before it is trusted, and the claim should not sit
   in the code unqualified in the meantime.
3. **Cut sweep-v10.** Four prompt-level defects are queued: the
   `own-form-escape-link` row (currently dispatch-level only), the
   `ib-yoma-2a` decline count, the stage trap, and the
   `one-consonant-diverge` false-premise hint.

Note that item 2 changes hint volume and therefore re-chunks, so like
the clause-1 floor it must land **between** batches.
