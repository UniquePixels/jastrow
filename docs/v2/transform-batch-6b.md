# Transform batch 6b — the structural phase, and the gate it needed

**Status: shipped 2026-08-28.** The `structural-repairs` phase runs for
the first time since the phase manifest was written in Phase 1; a
fourth gate joined the three that run per rule; two rules shipped, one
in each phase; the largest unaudited row gained an audit and then left
the queue on a ruling; and two new `judgment` rows were opened so that
partial rules could not take their rows' remainders off the queue.

The registry holds **41 rules**; `coverage()` reads **0 unaccounted / 0
duplicated** over a transform route of **68 rows / 20,672 instances**.
`PENDING` 29 → **26**.

Spec: [`2026-08-28-structural-repairs-design.md`](../specs/2026-08-28-structural-repairs-design.md).
Audit: `data/patches/catalogue-audit/empty-stem-section.md`.
Predecessor: [`transform-batch-6a.md`](transform-batch-6a.md).
`stranded-stem-head` (582 occ / 575 ent) is 6c's, by Brian's ruling.

## The findings that outlive the tasks

**1. THE THREE GATES COULD NOT SEE A DELETION, AND NOW ONE CAN.**
`checkNoNewText` is a sub-multiset test, so an emptied definition
passes it; `checkMarkup` reads well-formedness; `checkLinkTargets`
reads anchor targets. Nothing in the stack could distinguish text
MOVED from text DROPPED — the one axis a structural rule is most
likely to get wrong. `no-lost-text.ts` mirrors the text gate in the
other direction, with a per-call `removes` declaration mirroring
`copied`.

**2. The gate is scoped, and the boundary is measured rather than
asserted.** 10 of the 39 rules shipped before this batch already delete
text — 4,504 codepoints, most of it substitution the multiset reads as
a deletion plus an addition. Enforcing globally would have meant
retrofitting ten declarations in the PR that introduced the gate, so
`structural-repairs` rules are gated and the others are PINNED at their
measured counts in `body/deletion-baseline.corpus.test.ts`.

**3. That pin caught its first rule within the hour — this batch's
own.** The baseline table was written at ten rules / 4,504 codepoints
from a measurement taken before the batch's rules existed. Adding
`asteriskStemStrayPeriod` (3 entries, 6 codepoints) failed the test,
which is exactly what it is for. The table now reads eleven / 4,510.

**4. A partial rule must not take its row's remainder off the queue.**
`coverage()` reads a row as registered the moment any rule claims its
id. `asterisk-stem-label` had 69 members of which a rule can repair 3,
and `stem-head-marker-chop` has 28 of which a rule can safely repair
18. Registering against the whole rows would have retired 66 + 10 live
defects into silence. Both were split instead — the batch-4 precedent —
and the two new rows are `judgment`, because in both cases what blocks
a rule is a ruling, not a predicate.

**5. Two of batch 6's rows turn out not to be transform work at all,
and they fail in different places.** `stem-label-not-a-binyan-name`
(66) needs `stems[].forms` to carry the reconstruction siglum the way
`formObject.reconstructed` already does for headwords — a SCHEMA
question. `empty-stem-section` (347 sections / 342 entries) needs no
data change whatever: nothing is missing, and showing consecutive
senseless stem blocks as one run is a PHASE 4 RENDERING decision. It
left the transform queue on that distinction (§4), the first row to do
so.

## 1. The phase

`patch/apply.ts:56-57` has carried `structural-repairs` in the
committed manifest since Phase 1, and `migrate-dry.ts` ran it as
`() => undefined`. Wiring it was three edits:

- `processEntry` runs `applyTransforms(entry, 'structural-repairs')` in
  the phase slot, with the same per-entry containment the
  `text-repairs` half has, and **everything downstream now reads that
  output** — the one line that makes the phase load-bearing rather
  than decorative.
- `assertNoStructuralRules` became `assertStructuralPhaseWired`. The
  old guard caught a rule with no phase to run in; the new one catches
  a phase with no rule, which would otherwise pass every test in the
  suite while quietly reverting the wiring.
- `run.ts` gained the fourth gate, phase-scoped.

Verified end to end: `bun run body:migrate-dry` reports
`stem-head-marker-chop: 18 instance(s)`, all four gates at
32,512/32,512, `schemaFailures=0`, `transformFailures=0`, and
`brokenTopSequences=34` / `startsAtTwo=8` — **identical to the figures
on `v2` before this branch**, measured by stashing the branch and
re-running.

## 2. `stem-head-marker-chop` — 18 of 28

A numbered sense `1)` ends in a bare `—2)` and nothing else; the text
that marker introduces sits in the next, unnumbered sibling. The rule
MOVES the marker into that sibling's `number`:

| | sense `1)` | sibling |
|---|---|---|
| before | `… v. supra.—2) ` | `number: null`, `to grow strong…` |
| after | `… v. supra.` | `number: "—2)"`, `to grow strong…` |

`—2)` is the corpus's own spelling — **3,985 `number` fields already
hold that exact string** — and the corpus test asserts the DELTA, +18,
rather than that total, which is not this batch's to own. The one deletion is
the marker's trailing space, declared through `removes: [' ']`;
leaving it would have handed `trailing-whitespace-definition` (10, still
`PENDING`) eighteen new members.

**The refusal is the row's whole point.** Dropping the "and nothing
after it" clause finds 28. Of the ten extra, seven are duplicated-token
residue and **three are the genuine opening of sense 2** — a rule
written as "delete the marker" destroys text in three entries, and no
gate that existed before this batch would have reported it. The rule
matches only an empty residue, and the corpus test asserts the
residue-bearing count is the same before and after.

Measured where the rule stands — after `applyRepairs` AND the whole
`text-repairs` pass, not on raw source — the population is 18, every
one ending in the exact run `—2) `, 17 nested in a stem block, 1 at top
level.

## 3. `asterisk-stem-label`, re-scoped 69 → 3

Three members carry a valid label with a stray appended space-period
(`"Pa. ."` ×2, `"Af. ."`); the rule drops the two characters. The other
66 became `stem-label-not-a-binyan-name` (judgment, blocking):

| Sub-shape | n |
|---|---:|
| `"*."` / `"* ."` — siglum, stem name gone | 44 |
| punctuation debris `"[."` ×6, `"[[."`, `"(."`, `",."`, `"."` | 10 |
| print section heads (`"Compounds: ."`, `"Fem."`, `"Pl."`, …) | 9 |
| `"*Pa."`, `"*Nif."`, `"*Ithpe."` — siglum WITH a valid label | 3 |

The bracket sub-shape carries its own falsifier and is the most nearly
repairable of the four: all 6 `"[."` members are bracket-unbalanced at
exactly **−1** in their own block, and the `"(."` member likewise, so
the delimiter belongs at the head of the block's text. That population
may already belong to `stranded-open-bracket`, whose audit partitions
152 into 87 / 49 / 18 — **the collision must be checked before either
rule is written.**

## 4. `empty-stem-section` — audited, and withdrawn

The row had no `reason`. It has one now, a published audit, and a
ruling: **WITHDRAWN to `judgment` (Brian, 2026-08-28)**, on the
distinction that decides it — **a display concern, not a data one.**

That is a fourth way for a row to leave `transform`, and worth naming
alongside the three the registry ledger already records. The eight
`judgment` withdrawals failed on INFERENCE, on DESTINATION, or on
there being no defect; the three discards failed because another
mechanism already owned the defect. This row fails none of those: the
data is complete, and the fix is a rendering decision that changes no
bytes.

Uniformity is total: 347 sections, all top level, all carrying a real
label and form, all followed immediately by another stem block, and
**all 347 ending their `binyan_form` with an empty slot** — the residue
of a print heading (`Pa. בַּהַית, Af. אַבְהֵית to put to shame`) split at
its comma. Nothing is lost: `buildStem` gives the block
`{forms, senses: [], stem}`, the schema permits it, and the reader sees
what print shows. What no repair can do is *say* that the two blocks
share a gloss — duplicating it invents text, merging needs a joining
string the input does not hold, and the schema has no way to express
the grouping.

## 5. Catalogue and registry state

| | before | after |
|---|---|---|
| `RULES` | 39 | **41** |
| `PENDING` | 29 | **26** |
| `coverage()` | 69 total, 0/0 | **69 total, 0/0** |
| transform route | 69 / 21,080 | **68 / 20,672** |
| judgment route | 56 / 15,919 | **59 / 16,337** |
| unaudited transform rows | 4 (2 blocking) | **3 (1 blocking)** |

One row left `transform` — `empty-stem-section`, on the ruling above.
The two rows this batch SPLIT stayed: `asterisk-stem-label` is still
there, re-scoped 69 → 3, with its 66 alongside it in `judgment`.

Tests: **1,107 pass / 0 fail** (1,067 before). Commutation gate: 41
rules, 820 pairs, 10 non-commuting, 0 undeclared.

## 6. What none of this can see

- **The loss gate is scoped.** A `text-repairs` rule may still delete
  freely; only the pinned baseline notices, and only in aggregate.
- **`removes` is a claim, not a proof.** The gate checks the declared
  string occurs in the input and credits it once. It cannot tell
  whether deleting it was right.
- **The chop rule reads one sibling.** `P00816` holds a chopped `—3)`
  inside the sibling this rule renumbers, so that entry keeps one
  unnumbered sibling after the pass.
- **Nothing here measures the print.** Every claim about what Jastrow
  set is an inference from the corpus's own regularities — including
  the one this batch leans on hardest, that a trailing empty slot marks
  a split heading.
