# Discovery round 3 — swept and folded

**Status: DONE (2026-08-19).** 22 of 22 chunks swept and folded.
`patterns.jsonl` is at **149 rows**. `isSaturated(rows, 3)` = **`false`**,
so **round 4 is required** — and this time the arithmetic is not the only
reason.

| | |
|---|---|
| Chunks | 22 of 22, one per rid letter A–V; successors of round 2's, so zero overlap by construction |
| Entries | 660 (30 per chunk), all manifests JSON-valid at 30 rows |
| Dispositions | 498 clean, 117 needs_human_judgment, 30 needs_print_check, 15 repaired |
| Patches | 30, in `data/patches/discovery-round-3/*.patches.jsonl` |
| New rows | **29** (28 candidate, 1 discarded) |
| Rows re-measured or flagged | **29** |
| Catalogue | 120 → **149** |
| Chunks finding no new pattern | **3** (J, K, V) |

Raw per-chunk record: `docs/v2/discovery-round-3-candidates.md`. Shared
contract: `data/patches/discovery-round-3/agent-brief.md`.

## What was different about this round

Round 2's yield was low and the catalogue audit then found **13 of 13
rows misdescribed**, always the same way: a probe confirmed its own
description and never asked whether the population had a second job. So
the brief required three answers from every candidate — *does this
population have more than one job*, *what is the null model*, *what would
falsify this* — and said plainly that **raising fewer, better candidates
is the right outcome**.

That requirement did most of the work. A sample of what it caught, all
from the agents themselves:

- **`shin-sin-dot-drop`** raw population 1,269; **1,167 of those are
  Jastrow's bare proclitic ש, which is dotted only 47.97% of the time —
  a coin flip.** Reporting the raw figure would have inflated the row 14×.
- **`guttural-initial-simple-sheva`**: word-*medial* guttural + simple
  sheva occurs 2,744 times legitimately. **A naive rule would have been
  97.4% false positives.**
- **`ellipsis-fragment-anchored`**: `…` followed by Hebrew occurs 7,157
  times and **7,063 (98.7%) are left unanchored**, so anchoring is the
  1.3% misfire — the candidate survived its own null model.
- **`section-break-terminator-loss`**: the first-pass detector returned
  15 and **5 were false positives with a different job**, so the raw
  figure would have overstated the row by 50%.
- One agent **killed its own candidate** (201 occurrences) on a null
  model, then **withdrew an escalation it had already written** because
  the same null applied to it.
- One agent found a bug in its own probe mid-flight — Jastrow's `*`
  headword prefix was blocking legitimate matches, inflating 184 to 327
  — and reported the corrected figure.
- One agent's **first reading was falsified by its own control**: it read
  `emphasis-run-edge-space` as lost section-break em-dashes, measured
  1,534 stem-head runs, found the em-dash is not the norm, and reported
  the candidate as markup drift instead.

## Convergence — eight independent pairs or triples

Agents could not see each other's work. Convergence at this rate is
itself the saturation signal round 2 named.

| Shape | Found independently in | Figures |
|---|---|---|
| Definition opening run written twice | M, P, Q | 93/91, 81/79, 88/85 — **and all three name the same six letter-A rids** |
| Bare homograph silently resolved to member I | G, O | 1,492/1,363, 1,532/1,358 |
| Vocalized display links to a skeleton twin | E, F/G, T (+ Q dissenting) | 35, 149, 156 (Q: 212, killed) |
| Shin/sin dot dropped | D, U | 38/34, 89/77 |
| `trailing-em-dash-tail` × `sense-number-outside-closed-grammar` are one defect | G, L | 101 of 132 both times |
| `corrigendum-reading-linked`'s uncounted `(not X)` cue | I, K, V | 439/421, 439/421, 459/441 |
| Tosefta halakha loss = `anchor-swallows-close-paren` | M, S | ~558/520, 528/496 |
| Entry-final comma | A, G | 10, 10 |

Two of those matched **to the digit** across different letters.

## The one thing the sweep disagreed about

Four chunks measured the vocalized-twin shape and reached 35 / 149 / 156
/ 212 depending on how much artefact they subtracted. **Letters E, F/G
and T raised it; letter Q killed it** as "a blast radius, not a defect
set".

All four agree the population is impure. **They differ on whether an
impure population deserves a row** — a maintainer question, not an
arithmetic one. It is folded as `vocalized-twin-ignored` at the crispest
derivation (34 entries) with the full spread and Q's objection recorded
in the row's own `reason`.

Worth noting: **two agents independently rediscovered A01201**, the
maintainer-verified batch-02 catchable miss, inside this population — and
one found it sitting inside the very group its own decisive-looking
numeral test would have cleared.

## Re-measurements, again outweighing the discoveries

The largest corrections, all in the rows' `reason` fields:

| Row | Was | Now | Why |
|---|---:|---:|---|
| `tosefta-variant-chapter-halakha-loss` | 32 | **388** | the row measured only the single-anchor form; the corpus uses a two-anchor split |
| `geresh-abbrev-fixed-sink` | 572 | **970** | four independent measurements; the spread is threshold, not error |
| `corrigendum-reading-linked` | 330 | **771** | a second cue (`(not X)`) the row counted none of, overlap exactly 0 |
| `geresh-letter-numeral-mislink` | 608 | **475** | the count did not implement its own description |
| `multiword-abbrev-mislink` | 22 | **62** | 24 display→target pairs, 62 of 64 mislinked |
| `h-cognate-self-link` | 50 | **85** | blind to its largest locus (`language_reference`) |
| `empty-lead-sense` | 73 | **84** | whitespace-only lead senses have the identical consequence |
| `dangling-denom-tail` | 10 | **17** | the 7 missing rows all end `—Denom.**:**` with a colon |

### Three findings that change how a transform must be written

- **`same-anchor-positional-mislink` contains two rules that contradict
  each other on 101 anchors** — found independently by letters U and V at
  the same figure. Round 2's convention carve-out ("skeletons related ⇒
  cognate convention") and the re-scoped predicate give opposite verdicts
  on homograph siblings. V supplies the proof text that the carve-out is
  the wrong one; U adds that 21 of the 101 hosts carry a `ch.` marker the
  row's `language_code`-only test cannot see. **Write against the
  `ch.`-marker rule.**
- **`trailing-em-dash-tail` and `sense-number-outside-closed-grammar` are
  one event counted twice.** The upstream marker regex captures `—`
  before a digit but not across an asterisk, so `—*2)` splits into a tail
  and a number. **The em-dash is not debris to delete — it is the
  following marker's separator.**
- **`interior-consonant-mislink` is 45% double-counted** with
  `plural-inflection-anchor-escapes-entry`, and in 28 further members
  **the link is correct and the display text is the defect** — a class-8
  print check, the opposite repair direction.

### And two corrections to rulings made in the audit

- **`doubled-space-as-text-loss-locator` must NOT be widened.** Round 2
  flagged it under-measured by ~92; round 3 measured the tag-hidden half
  at 13.1% paren imbalance against a **length-matched null of 11.7%** —
  no loss signal — while the literal half holds at 40.7%. The row's 41%
  corroborator survives a control for the first time. **Flag withdrawn.**
- **`plural-form-empty-slot` was discarded on a reading that misses a
  third of its slots.** 246 of 755 mark an inflected form the extractor
  dropped (`constr.` 160), and 337 construct forms are lost corpus-wide.
  The discard may still stand on the v2-field ground; what does not stand
  is the claim that the slots reach nothing.

## The audit's four uncatalogued populations — all four resolved

| Population | Disposition |
|---|---|
| Geresh abbreviation in `plural_form` (1,131/1,007) | **Folded** as `geresh-abbrev-in-plural-form`, discarded on the standing plural_form ground. Reproduced byte-for-byte by three chunks independently. |
| ASCII gershayim outside `dir=rtl` (409) | **Folded** as `ascii-gershayim-outside-body-text`; field-slot counts corroborated by two chunks. |
| JT double-wrapped citations (20/10) | **Folded** as `jt-double-wrapped-citation`. |
| `neighbor-rid-mislink` residual class E (198) | **KILLED.** The ה↔א arm is **≥97% convention** — 204 of 292 have the display declared in the target's own `alt_headwords`, and only 6 corpus-wide have a competing entry with no warrant. Null model: 10.6% of א-final headword skeletons have a ה-final twin **by Jastrow's own lemmatization**. A deterministic sub-slice of 70 anchors / 65 entries exists where the linker had a correct choice; the rest is not a defect population. |

## Saturation

`isSaturated(rows, round)` uses `SATURATION_ROUNDS = 2`.

- **`isSaturated(rows, 3)` = `false`.** 67 rows carry `round > 1`.
- **`isSaturated(rows, 4)` = `false`**, because round 3 added 29 rows
  with `round: 3 > 2`. This holds regardless of what round 4 finds.
- **`isSaturated(rows, 5)` = `true`** if and only if rounds 4 and 5 both
  add nothing.

**Round 4 is required.** But the evidence and the gate now point in
different directions, and that should be weighed rather than deferred:

**For continuing:** round 3 added 29 rows, which is not a dry sweep.
Several are large (Tanhuma 1,137 entries, the homograph default 1,358).

**Against:** three of 22 chunks found nothing new. Eight convergent
pairs appeared — agents rediscovering each other's shapes is what a
saturated population looks like. And **the re-measurements were again
worth more than the discoveries**: the sweep corrected eight row counts,
found two rows that are one row, found a row whose two rules contradict
each other, and withdrew a round-2 flag on a control the original
measurement never had.

**Recommendation, and it is Brian's call:** the discovery question looks
answered. What is not answered is whether the catalogue is *coherent* —
round 3 found three separate cases of two rows owning the same records,
and one row internally inconsistent. **Round 4's budget may be better
spent reconciling the catalogue against itself than sweeping 22 more
chunks.** That is the same judgement round 2 raised and the audit
partly executed; round 3's evidence strengthens it.

## Next actions

1. **[open — Brian's call]** Round 4's shape: another 22-chunk sweep, or
   a reconciliation pass over the rows round 3 found entangled.
2. **Reconcile the row pairs round 3 identified as one defect each:**
   `trailing-em-dash-tail` × `sense-number-outside-closed-grammar`;
   `tosefta-variant-chapter-halakha-loss` × `anchor-swallows-close-paren`;
   `interior-consonant-mislink` × `plural-inflection-anchor-escapes-entry`.
3. **Resolve `same-anchor-positional-mislink`'s internal contradiction**
   before any transform reads that row.
4. **Rule on `vocalized-twin-ignored`** — three chunks raised it, one
   killed it, and the decision is whether an impure population earns a
   row.
5. **Ingest the 30 round-3 patches** through the normal apply path; they
   are validated but not applied.
6. The polarity collision, `binyan-form-leading-space`, and the 20
   deferred Tier B rows from the audit all remain open.
