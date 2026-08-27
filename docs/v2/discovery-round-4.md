# Discovery round 4 — reconciliation, not a sweep

**Status: DONE (2026-08-21).** Round 4 was spent reconciling the
catalogue against itself rather than sweeping 22 more chunks. That was
round 3's recommendation and Brian's call.

`patterns.jsonl` is still at **149 rows** — a reconciliation pass adds no
rows by design. `isSaturated(rows, 4)` = **`false`**, unchanged and
unchangeable: round 3 added 29 rows with `round: 3 > 2`, so the predicate
cannot clear until round 5 at the earliest. **The arithmetic gate and the
evidence have now diverged for two rounds running.**

| | |
|---|---|
| Entanglements resolved | 4 pairs, 8 rows |
| Row-internal contradictions ruled | 1 (`same-anchor-positional-mislink`) |
| Audit flags answered | 2 (`binyan-form-leading-space`, the polarity collision) |
| Maintainer rulings taken | 1 (`label-period-outside-italic` — house style) |
| Rows re-measured independently | 9 |
| New rows | **0** (by design) |
| Schema change | `Pattern.entangledWith` + `checkEntanglement` |

Every figure below was measured directly against the pinned snapshot
(`data/source/jastrow-dictionary.jsonl`, sha256 `4c64ff03…`, matching
`data/patches/snapshot.lock`), not carried over from a round-3 agent
report.

## The catalogue could not express the problem

Round 3 found three pairs of rows that own the same records and one row
whose two rules contradict each other. `Pattern` had six fields and none
of them could say so. A transform author reading `patterns.jsonl` saw
four independent rows and would have written four transforms, two of
which rewrite the same anchors.

Round 4 adds one optional field:

```ts
/** Rows owning the same records, or contending over the same objects. */
entangledWith?: string[];
```

and `checkEntanglement(rows)`, which reports unknown ids, self-links and
one-sided edges. The graph is currently symmetric and closed across 8
rows in 4 pairs. The *nature* of each entanglement stays in `reason`,
which is where the catalogue already keeps its nuance.

## Verdicts

### 1. `trailing-em-dash-tail` × `sense-number-outside-closed-grammar` — one edit

**Reproduced to the digit.** 132 senses / 130 entries end in a dangling
em-dash; 101 of them precede a `*N)` sibling; 101 of 107 `*N)` markers
(94.4%) carry the residue, against 8 of 2,644 plain `N)` (0.3%) and **0
of 5,442 `—N)` (0.0%)**. The mechanism is not in doubt: the upstream
marker regex captures `—` before a digit but not across an asterisk.

Repair is **rejoin, not trim**, and it must fix both sides at once.

> **Trap recorded for the next re-measurer.** Senses nest —
> `sense.senses`, 4,043 of them. A non-recursive walk returns 109/108
> and silently loses a quarter of the population. This pass made that
> mistake first and only caught it by failing to reproduce a figure it
> expected to reproduce.

### 2. `anchor-swallows-close-paren` ⊃ `tosefta-variant-chapter-halakha-loss` — containment, not symmetry

Round 3 called these "two rows viewing one citation from opposite ends".
Measurement says the relation is **containment**:

- 525 anchors / 493 entries match `(<a>ROMAN), N</a>`.

  > **CORRECTED 2026-08-26 (impl/phase-2-batch-4).** This bullet read
  > *"525 anchors / 493 entries match `(<a>ROMAN), N</a>` — the
  > catalogued 494 reproduces."* **493 is not 494.** The predicate is
  > exact and reproduces to the anchor; the arithmetic in the sentence
  > did not. Batch 4 corrected `anchor-swallows-close-paren`'s
  > `corpusCount` 494 → 493 and rewrote the same sentence where it also
  > stood in the row's own `reason`; this copy was missed at the time.
  > See the spec's §2.1.
- **525 of 525 (100%) are the second half of a two-anchor split.** There
  is no single-anchor form of this defect.
- Primaries: 521 Tosefta, 4 Mishnah.
- The variant anchor's halakha matches print **525 of 525**; its boundary
  swallows the `)` **525 of 525**.
- The primary is the broken end: of the 525 pairs, **414 occurrences**
  have a chapter-only primary and **111** a primary carrying a halakha,
  of which **only 7 agree with print**. 514 of 521 Tosefta primaries
  wrong. Both figures are OCCURRENCES; by ENTRY the two arms are 391
  and 107, and they are not additive — 5 entries carry both, so
  391 + 107 − 5 = 493.

So the halakha-loss row has **no members outside** the close-paren row.
The containment is strict: 391 of the 493 entries, never all of them.

> **CORRECTED 2026-08-26 (impl/phase-2-batch-4).** This verdict closed
> *"Re-splitting the boundary so `)` falls outside and the print halakha
> reaches the primary is **one edit** and fixes both."* **It is one
> WALK, not one edit, and only the boundary half shipped.** Batch 4
> registered `toseftaCloseParen`, which moves the `)` and writes no
> target; the halakha carry was never written, because `link-target.ts`
> case 4's 2026-08-24 tightening requires the tail's discarded prefix to
> be a prefix of the head and `Tosefta Shabbat 17` is not a prefix of
> `Tosefta Shabbat 16` — case 3 fails too, its remainder `:6` not
> occurring in the primary's display `Tosef. Sabb. XVI`. **The
> containment measured above is untouched**; what does not hold is that
> one edit discharges both rows. `tosefta-variant-chapter-halakha-loss`
> stays in `PENDING`, and the gate ruling is its own PR (Brian,
> 2026-08-26). The same retraction stands on both catalogue rows and in
> `admin/pipeline/transform/rules/paren-boundary.ts`.

**`anchor-swallows-close-paren` had no `reason` at all** — see §5.

### 3. `interior-consonant-mislink` × `plural-inflection-anchor-escapes-entry` — decomposition, and blocked

Not a merge. An independent re-measure of the stated rule returns **516
anchors / 490 entries** — a *fifth* figure alongside the row's own 464 /
495 / 642 / 708. That settles it: **the count is an output of the rule,
not a property of the corpus.**

The overlap reproduces in magnitude: **195 of 516 (37.8%)** displays are
a declared inflected form of the host — a floor, since round 3's 45% also
counted `grammar.binyan_form`. The substitution census is ר-dominated
(ד/ר 34, ל/ר 33, מ/ר 28, נ/ר 23, ב/כ 23), consistent with round 3's
finding that part of the population is OCR damage to the **display**,
where the link is correct and the repair direction inverts.

**Do not size or transform this row until the comparison rule is pinned.**

### 4. `same-anchor-positional-mislink` — ruled

The `ch.`-marker rule governs; **round 2's skeleton-relatedness carve-out
is retired.** The row no longer contains two rules that disagree.

Reproduction of the re-scoped predicate returns **277 anchors / 244
entries** — again not 374 / 284, so the row's own warning that its entry
figure never comes within 20% stands and **the count remains
unreliable.** Of those 277, 82 are host/target skeleton-identical
homograph siblings: the contested set.

**The `ch.` gap is wider than round 3 reported**: 30 of those 82 hosts
(37%) carry a `ch.` marker somewhere in the entry that the
`language_code`-only test cannot see — against round 3's 21 of 101
(21%). Any transform must read the marker out of the entry text.

### 5. The polarity collision — it is not a convention at all, it is batch variance

The audit framed `label-period-outside-italic` × `italic-swallowed-
terminal-period` as opposite-polarity rules split by token count. Round 4
first measured per label, then asked **why** the corpus disagrees with
itself. The second question is the one that mattered.

**Hold the label fixed and the disagreement is per-rid-letter, and
near-unanimous inside each letter:**

| `Pa.` | H | C | P | T | … | E | J | K | M | N |
|---|---|---|---|---|---|---|---|---|---|---|
| inside | 27 | 17 | 27 | 29 | | 0 | 0 | 0 | 0 | 0 |
| outside | 0 | 0 | 0 | 0 | | 9 | 10 | 16 | 18 | 22 |

`Af.` behaves the same way: 11/11 inside in H, 17/17 inside in P, but
13/13 outside in K and 20/20 outside in M.

**Jastrow's print typography does not change by alphabet position.** This
is processing batch variance, and for these labels corpus frequency
measures which batches were larger — nothing about the source.

Four alternative explanations were tested and all came back flat:

| Control | inside vs outside |
|---|---|
| grammar context (`verbal_stem` present / absent) | 72% either way |
| position (label at head of definition / mid-definition) | 70% / 72% |
| nesting depth (0 / 1) | 72% / 73% |
| what follows the label (anchor / Hebrew span / plain word) | 64% / 64% / 83% |

**The correct discriminator is cross-letter unanimity, not the
percentage.** A label is a real convention only if letters agree and no
letter unanimously opposes:

| Verdict | Labels |
|---|---|
| **Real — period INSIDE** | `Hif.` (18 letters, 0 opposing), `Ithpa.` (15), `Ithpe.` (14), `Pl.` (12), `Pi.` (11), `Nif.` (9) |
| **Real — period OUTSIDE** | `Part. pass.` (10 letters unanimous) |
| **Batch noise, no warrant** | `Pa.`, `Af.`, `Fem.`, `pl.`, `Nithpa.`, `Pe.`, `Hithpa.`, `Du.`, `Part.`, `sing.`, `m.`, `ḳ.`, `Saf.` |

**A percentage bar misclassifies in both directions**, which is why an
earlier draft of this section got it wrong: `Hithpa.` is 83% but has two
unanimously opposing letters and is batch noise; `Part. pass.` is 79% and
is a real convention across ten letters.

`label-period-outside-italic`'s own quoted example, `Af.`, sits in the
batch set. **The row has no corpus warrant in either direction and cannot
be transformed on frequency grounds.**

`italic-swallowed-terminal-period` is unaffected — its population is
ordinary word-final gloss runs (87.7% outside over 26,528), and the
abbreviation class it already excludes by construction is exactly where
the batch noise lives.

> Both forms still render byte-identically — 0 double-period artifacts,
> 0 bodies ending `..`. Nothing is lost either way; this is a
> consistency question, not a text-integrity one.

#### Ruled (Brian, 2026-08-21): house style — all labels take the period inside

The ruling keeps the row's repair **direction** and replaces its
**warrant**. `label-period-outside-italic` is no longer justified by
corpus frequency — which for 13 of 20 labels measures processing batches
— but by a house-style decision the corpus cannot settle.

| | |
|---|---|
| Count re-scoped | **608 → 945 entries** (668 → 1,106 occurrences) |
| Widened by | `Part. pass.` 266, `Pa.` 171, `Af.` 123, `Fem.` 118, `Pi.` 59, `Nithpa.` 43, and 7 smaller |
| Already conforming | 1,935 label runs |
| Effect | label markup goes from 63.6% to 100% consistent |

**Accepted cost, stated plainly:** `Part. pass.` is a genuine ten-letter
unanimous *outside* convention, and the ruling overrides it — 266
occurrences are normalised against their own attested usage. That is a
deliberate consistency-over-fidelity trade, and it is safe to make only
because both forms render byte-identically.

**The collision is now closed by object class, not polarity:** labels
belong to `label-period-outside-italic` (period inside); ordinary
word-final gloss runs belong to `italic-swallowed-terminal-period`
(period outside, 87.7% over 26,528). The two rows are disjoint by
construction and can be transformed independently — but that row's 123
misfiled label occurrences must be removed from its population first, or
they will be moved in the wrong direction.

### 6. `binyan-form-leading-space` — flag withdrawn, it is a defect

The audit's consuming question is answered: **nothing consumes the
space.** The trailing-whitespace precedent turned on `rejoin.ts`
consuming edge whitespace as a separator between rejoined fragments;
`binyan_form` is never rejoined.

- `admin/pipeline/body/rejoin.ts` never references the field (0
  occurrences).
- `admin/pipeline/body/dry-run.ts:196` passes it straight through as
  discrete array elements — `forms: grammar?.binyan_form ?? []` into
  `BodyStem.forms` — where no separator is possible.
- `admin/pipeline/body/repairs.ts:452` `cleanBinyanForms` **already
  trims them** under the 06 decision.

The pipeline has been treating the space as debris all along. The only
open question was whether it was right to. It is.

## The finding round 4 did not go looking for

**17 candidate rows carry no `reason` at all** — no caveat, no
derivation, no audit status — covering **4,442 instances**:

| Rows | Instances | Largest |
|---|---|---|
| 17 (all `candidate`) | 4,442 | `unlinked-v-span` 796, `parenthesized-alt-headword` 580, `homograph-numeral-mismatch` 538, `redundant-outer-rtl-span` 529 |

Regenerate the list from the file rather than copying it.

This matters because of the exact argument that justified the Tier A
audit: **a row with no caveat reads as a settled measurement.** The 20
deferred Tier B rows at least warn the reader that their counts are
uncertain. These 17 do not.

And the one bare row round 4 happened to examine —
`anchor-swallows-close-paren`, 494, the largest row in the catalogue with
no reason — turned out to **contain a second 388-count row entirely** and
to have **zero members** of the single-anchor form anyone would have
assumed it described. That is a base rate of one, but it is not a
reassuring one.

**The bare-reason rows are now a better-evidenced risk than the 20
deferred Tier B rows.**

## What reconciliation showed about the catalogue's method

A clean split emerged, and it is the most portable thing round 4 found:

| Rows whose predicate is **pinned** | Rows whose predicate is **prose** |
|---|---|
| Reproduced to the digit: 132/130, 101/107, 8/2,644, 0/5,442, 525/525, 111, 7 | Never reproduced: 516 vs 464/495/642/708; 277 vs 374; 195 vs 241 |
| `trailing-em-dash-tail`, `sense-number-outside-closed-grammar`, `anchor-swallows-close-paren`, `tosefta-variant-chapter-halakha-loss` | `interior-consonant-mislink`, `same-anchor-positional-mislink`, `plural-inflection-anchor-escapes-entry` |

**A count is only a measurement if its predicate is executable.**
Otherwise it is an estimate wearing a measurement's clothes, and the
audit's finding that 13 of 13 rows were misdescribed is what that looks
like at scale. This belongs in the brief for any future round alongside
round 3's three required answers.

## Next actions

1. **[open — Brian's call]** Rule on `vocalized-twin-ignored` (34).
   Three chunks raised it, one killed it; all four agree the population
   is impure at ~60–70% precision. The question is whether an impure
   population earns a row, and it is not an arithmetic one.
2. **[ruled 2026-08-21]** `label-period-outside-italic`: house style,
   all labels take the period inside. Row re-scoped to 945 entries. The
   remaining work is to strip the 123 misfiled label occurrences out of
   `italic-swallowed-terminal-period` before either row is transformed.
3. **[open — Brian's call]** The 17 bare-reason rows (4,442 instances) —
   audit, or accept the risk explicitly. Carried over from the audit's
   own next-action 1, now better evidenced than the 20 deferred Tier B
   rows it was raised about.
4. **Ingest the 30 round-3 patches** through the normal apply path. Still
   validated but not applied; untouched by this pass.
5. **Sequence the transform families** the audit identified as entangled
   (the RTL-wrapper trio, the gershayim pass, the anchor-escape family).
   The four pairs reconciled here are now machine-readable via
   `entangledWith`; those families are not yet.
6. **Round 5** clears the saturation gate only if it adds nothing. Given
   two rounds where re-measurement outweighed discovery, the honest
   question is whether the gate is measuring the right thing.
