# Residue batch 04 — residue-01 chunks r00009–r00013, sweep-v9

The first batch on substantially fresh ground, and the first under v9.
Maintainer go recorded **2026-09-05 11:35 CDT**; usage baseline marked
`2026-09-05T16:39:42.798Z`. Sweep tier Opus, prompt `sweep-v9`
(signed 2026-09-04), verification `verify-v3`, corpus stage `healed`,
pin `sha256:75bbc5ee7…`. Population 3,552 residue / 3,491 sweep /
117 chunks, after the detector recalibration in `10075f4`.

**140 of 150 entries had never been swept** — against 121 in batch 03
and 3 in batch 02. The rid ledger went 283 → 423, growing by exactly
the 140 prep predicted.

## Measured

| Measure | Batch 04 | Batch 03 | Batch 02 | Batch 01 |
| --- | --- | --- | --- | --- |
| Entries | 150 | 150 | 150 | 150 |
| Previously swept | **10** | 29 | 147 | 141 |
| clean | 48 | 55 | 58 | 52 |
| repaired | 1 | 0 | 1 | 2 |
| needs_print_check | 25 | 17 | 39 | 43 |
| needs_human_judgment | 76 | 78 | 52 | 53 |
| Patches accepted / rejected | 3 / 0 | 3 / 0 | 4 / 0 | 5 / 0 |
| **Sampled error rate** | **0.0%** | 0.0% | 0.0% | 0.0% |
| Clean-sample catchable-miss rate | **6.7%** | 33.3% | 20.0% | 13.3% |
| Verifier discoveries | 1 | 0 | 1 | 1 |
| Escalation queue | 101 | 95 | 91 | 96 |

Per-chunk: r00009 2 patches (9/1/5/15), r00010 1 (12/0/6/12),
r00011 0 (8/0/5/17), r00012 0 (13/0/5/12), r00013 0 (6/0/4/20).

## Gates

- **Patch error gate (≤5%): PASSES at 0.0%.** 3 sampled, 3 `ok`, 0
  label-only, 0 substantive. The verifier re-implemented `applyPatch`
  and `validateNoNewText` from the contract and replayed each chain,
  including the A01873 chain in order against the post-first-patch
  state.
- **Catchable-miss gate: retired** (tiering spec T1). 6.7% — 1
  catchable miss (A02408) in 15 sampled clean entries. A02072 is a
  discovery, not a catchable miss, and is not counted in the rate.
- Ingest: 5 chunks, 3 patches, **0 rejects**.

## The rejection defect: measured, and not reproduced

Batch 03's two worst misses were hints the sweep rejected confidently
while citing text belonging to a different entry. That is not a
detection failure and no threshold reaches it, so this batch's
dispatch prompt added one rule: **a hint rejection must rest on the
target entry's own text, read from the corpus — and if the target's
text cannot be found, escalate rather than rule clean.** The three
clean-review agents were each asked to audit every rejection's stated
grounds against the target's real content.

**Result: 0 of 15 rejections mis-grounded.** Every load-bearing quote
checked out.

Two qualifications, because a clean result on a new gate deserves
them:

1. **n=15, one batch.** Batch 03's rate on the same measure was 2 in
   5 sampled. This is directional, not established.
2. **The measure cannot see a thin-but-correct rejection.** A02055's
   note concedes indeterminacy — "nothing in the host distinguishes
   it from חָמַץ" — and dispositions `clean` anyway, which under the
   `niqqud-twin-target` row is the shape that should route to
   `needs_human_judgment`. The verifier declined to score it, because
   a corpus control settles the question (all 11 anchors displaying
   unvocalized `חמץ` target `חָמֵץ I`; discriminating control `אמם` →
   אָמַם 7/7, `עמם` → עֲמַם I 3/3). So the conclusion is right and the
   stated grounds are thinner than the conclusion. Nothing scores.

And one thing worth recording in the sweep's favour: **a verifier
caught itself.** Reviewing A01798 it first read the sweep's citation
of C00123 as fabricated off a truncated dump — precisely the batch-03
failure it was hunting — then ran a positive control (`Adonai` 3×
corpus-wide, `Adonai, El` 1×, in C00123) and found the sweep correct
and itself wrong. Batch 01's report warned that the miss rate
"measures one agent's reading on the day at least as much as it
measures the sweep". This is the first time that instability has been
caught inside a pass rather than between two.

## A defect shape that has now appeared twice

| Batch | Entry | The display | Why no hint fired |
| --- | --- | --- | --- |
| 03 | A01023 | the host's own `Part. pass. אָחוּי` | lives in sense prose; `ownForms` harvests only `binyan_form`, `plural_form`, `alt_headwords` |
| 04 | A02408 | the host's own plurals of "paved way" | the detector's skeleton-match exclusion covers it |

Both are the same shape — **the display is the host entry's own
inflected form and the link leaves the entry** — and both were found
only by the prompt's mandatory display-vs-target check. Different
exclusions are implicated, so this is not one bug; it is a class of
gap around the inflection rules.

Batch 03's report attributed A01023 to `inflection-escape-link`'s
exclusion and recommended narrowing it. That attribution was wrong —
the field data showed the rule never fired at all — and the change was
correctly not made. A02408 is a second, independent instance with a
different cause, which is enough to justify sizing the class properly
rather than reacting to either case alone.

**The mandatory display-vs-target check is now the sweep's most
productive rule.** Unhinted class-11 mislinks it caught this batch:
A01688, A01906, A01961, A01989, A01999, A02061, A02258, A02324,
A02408, A02667, A02711, A02733, A02770.

## The geresh-abbreviation resolver

Three agents reported a shared mechanism, and two of them gave
different counts for it (17 vs 18). Counted here directly over 72,257
parsed anchors, positive control 1,104 anchors whose `data-ref`
carries a `²`/`³` suffix:

| Display | Anchors | Distinct targets | Resolves to |
| --- | --- | --- | --- |
| `אִיסְ׳` | **18** | 1 | `*אִסְטַבְלָא` |
| `אפי׳` | 11 | 1 | `אֶפִּיטְרוֹפּוֹס` |
| `אִי׳` | 5 | 1 | `*אִכְרוּם` |
| `אִצְ׳` | 3 | 1 | `אִיסְטְבָא` |
| `אִיצְ׳` | 2 | 1 | `אִיסְטְבָא` |

18, not 17. **The load-bearing number is the "1", not the sizes:**
every one of these abbreviations resolves to exactly one entry, with
zero variation across 39 anchors. `chunk-r00013` characterised the
rule as *the lowest-rid entry recording that abbreviation in
`alt_headwords`*; the counts here are consistent with that, though the
lowest-rid rule itself is untested.

So this is one resolver behaviour with 39 instances, not 39
independent mislinks — and it is **not** script-slatable as a blanket
rewrite, because `אִיסְ׳` genuinely abbreviates several different
words and the fixed target is right for some of them. The tractable
form is a detector that flags any anchor whose display is a geresh
abbreviation with more than one plausible expansion. Roughly 20 of the
39 have now been swept.

## Between-batch candidates

1. **`rare-dotted-variant` still misfires, from a different cause.**
   v9's `maxBareForRare` guard removed the English-gloss-word subclass
   (390 → 219 firing tokens). `chunk-r00013` rejected 4 more —
   `Aft.`, `Ep.`, `Gott. Vortr.`, `Teb. Yom` — which are bibliographic
   abbreviations appearing bare zero times, so the guard was never
   going to reach them. This is the "correct but rare abbreviation"
   class the recalibration's docstring named and left unaddressed.
2. **A depth-0 hole in the `stem-head-in-child-sense` row.** A02039
   carries a class-5 Pi. head loose in its **depth-0** lead sense; the
   v8 row is depth-1. The agent named it inside an escalation the
   entry already needed and explicitly declined to claim a corpus
   scale, calling its own 1,019-entry count a loose upper bound that
   also catches in-citation `<i>Hof.</i>` glosses.
3. **`׳'` for gershayim — a discovery, script-slatable.** A02072's
   Y. Sabb. quotation writes the mark as geresh + ASCII apostrophe.
   25 occurrences across 20 entries, every one a Hebrew acronym;
   dominant rendering is a bare ASCII double quote at 2,256
   occurrences across 1,387 entries. Positive control: 61,948 plain
   gereshes, 0 real `״`. Sized like the two rows v9 added.
4. **`same` displays.** 1,055 of 1,056 target `prev_hw` (control: 1
   does not), and 599 sit inside a stem or nested sense where the
   referent is the host's own Pe. `chunk-r00009` escalated it once as
   a systemic candidate rather than 599 times, and explicitly did not
   slate it.

## v9's new rows worked

`refs`/`data-ref` disagreement and unlinked `Y. <tractate>` citations
were left unescalated by name in A02082, A02181, A02376 and
throughout, and every agent listed them among the systemics it
deliberately passed over. Those are escalations that would have
flooded the queue in batch 03.

## A tooling trap that cost two agents a pass

A raw `grep`/regex against `data/source/jastrow-dictionary.jsonl`
matches **escaped** JSON, so any predicate containing a double quote
silently returns zero. Two sweep agents hit it independently;
`chunk-r00013` caught it only because **its positive control also
returned zero**, which is the whole point of insisting on one. Parse
the lines. This was added to the verification dispatch and belongs in
the next prompt revision.

## Queued from outside the sample

**H01213 (חֲמַץ)** — a class-6 verbatim duplication in its `Af. 1)`
sense and a class-10 nested duplicate `<a>` wrap in sense `1)`. Found
by a verifier while checking A02055's skeleton carriers. In no
batch-04 chunk.

## Cost

| Origin | Msgs | Input | Output |
| --- | --- | --- | --- |
| subagent (Opus) | 547 | 80,885,810 | 132,687 |
| main | 48 | 16,519,053 | 82,825 |
| **total** | **595** | **97,404,863** | **215,512** |

Fresh 1,190 · cache-write 3,283,873 · cache-read 94,119,800. Up from
batch 03's 77.4M, on nine agents rather than nine and 140 new entries
rather than 121.

**87 chunks pending in residue-01**, plus tranche 2.

## Recommendation

**Commit this batch.** Error gate 0.0%, zero rejects, and the lowest
catchable-miss rate of any run.

Do not read 6.7% against batch 03's 33.3% as a fourfold improvement.
The samples are 15 entries each, the populations differ, and batch 03
was the first run on mostly-new ground while this one is the second.
What can be said is narrower and still worth something: the specific
failure the prompt rule targeted did not recur in 15 audited
rejections.

Before batch 05, the strongest candidate is **sizing the
own-inflected-form gap** (A01023 / A02408). It is the only finding
with two independent instances, it is invisible to both detectors that
should cover it, and the mandatory display-vs-target check is
currently the only thing catching it — which means it is caught by an
agent reading carefully rather than by anything deterministic.
