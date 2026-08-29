# Phase 2 batch 6c — the stranded stem head

**2026-08-29.** One row, one rule, one new row, and a gate blind spot
the rule uncovered. Spec:
[`2026-08-29-stranded-stem-head-design.md`](../specs/2026-08-29-stranded-stem-head-design.md).
Audit: [`stranded-stem-head.md`](../../data/patches/catalogue-audit/stranded-stem-head.md).
Ancestor: [`transform-batch-6b.md`](transform-batch-6b.md).

## What shipped

| | Before 6c | After |
|---|---:|---:|
| `RULES` | 41 | **42** |
| `PENDING` | 26 | **25** |
| `coverage()` total | 68 | 68 |
| transform route | 68 rows / 20,672 | **68 rows / 20,424** |
| judgment route | 59 rows / 16,337 | **60 rows / 16,437** |
| blocked route | 5 / 4,947 | 5 / 4,947 |
| suite | 1,109 pass | **1,140 pass** |

`migrate-dry` gates 32,512/32,512 with `schemaFailures=0` and
`transformFailures=0`; `brokenTopSequences=34` / `startsAtTwo=8`
unchanged. `stranded-stem-head: 436 instance(s)` on the migration
report. `transform:count` MATCHes at 296 (mismatches 7 → 6).

## 1. The finding that matters most

**A row's count is a claim about a PLACE in the pipeline, and this row's
count had no place attached.**

`stranded-stem-head` was catalogued at 544 entries in round 1 with no
predicate recorded anywhere — not in the row, not in the round-1 report,
not in the chunk manifests. Batch 6a reconstructed 582 / 575 and rightly
declined to call it reproduced.

Under a predicate written down for the first time:

| Measured on | Occurrences | Entries |
|---|---:|---:|
| raw source | 360 | 359 |
| after `applyRepairs` | 360 | 359 |
| after `applyRepairs` + `text-repairs` | **561** | **555** |

The population nearly doubles, and the whole gap is **one upstream
rule**: `label-period-outside-italic` moves a section head's period
inside its own italic (`<i>Pa</i>.` → `<i>Pa.</i>`) and takes the count
from 360 to 562 in a single step; `italic-swallowed-terminal-period`
returns one.

Batch 6a found two rows whose populations were already ZERO after
`applyRepairs` and discarded them. This is the mirror: a row whose real
population is nearly twice what raw source shows. The transferable step
is the same one — measure where the rule will actually stand — and 6a's
`[[feedback_measure_post_repairs]]` now has an instance in each
direction.

## 2. The rule

436 of the 561. `senses[0]`, no `grammar`, a single-label italic run, a
space and then something.

```text
before  senses[0] = { definition: ", <i>Pi.</i> <span>אִבֵּק</span>, … " }
after   senses[0] = { definition: "",
                      grammar: { verbal_stem: "Pi." },
                      senses: [ { definition: "<span>אִבֵּק</span>, … " } ] }
```

The label MOVES into `grammar.verbal_stem`, which `fieldsOf` walks, so
it is text-neutral to both text gates — `stemHeadMarkerChop`'s shape,
one field over. The rest goes into a CHILD sense, and that is not a
stylistic choice:

**`buildStem` drops `sense.definition` entirely** (`dry-run.ts:193`
reads `sense.senses` and nothing else). Attaching a grammar object to
the sense and leaving its text in place would delete that text at build
time, invisibly — all four gates in `run.ts` read `SourceEntry` fields,
where the definition is still sitting. Same shape as batch 3a's
two-owners failure and batch 4's `rejoin-chopped` collision: a defect
that exists only in the composition.

**`binyan_form` is left empty on purpose.** 230 of the rule's 436
members open with an `<a dir="rtl">` anchor form (199 an rtl span, 7 a
parenthetical) and `binyan_form` items are plain strings, so lifting
one discards a link target. (267 is the anchor count over the whole
561, not over what ships.) The form stays in the child's prose
where the reader sees it either way; what the entry gains is the stem's
NAME. `BodyStem.forms` comes out `[]`, which the schema permits. A
deliberate partial repair, recorded as one.

**Text accounting, measured through `buildTrace` over all 436:** 0
codepoints invented, 1,065 lost — 755 spaces, 283 commas, 27 semicolons,
which is exactly the seam prefix plus one space per repair, both
declared through `removes`.

**The falsifier came back empty, and is a guard anyway.** A rule that
MINTS a stem section must not mint one the entry already has, and no
gate can see a duplicate — the label is text the input held, so both
text gates are satisfied. In **0 of 436** does the entry carry another
top-level block with the same `verbal_stem` (112 carry a different one,
317 carry none). `alreadyHasStem` refuses the case regardless: "no
member does this" is a fact about one snapshot, not a property of the
rule.

## 3. The row is re-scoped, not retired whole

| Slice | n | Disposition |
|---|---:|---|
| top-level sense 0 | **436** | the rule |
| child sense (depth 1) | 100 | new row `stem-head-in-child-sense` |
| `Label of X` gloss | 14 | not the defect |
| etymology-paren remnant | 7 | refused on shape |
| `= Label` cross-reference | 2 | not the defect |
| double / paren-prefixed head | 2 | real, shape not taken |

**The 100 are a MODEL question, and the measurement is what makes that
more than an opinion.** `buildTrace` tests `.grammar` on
`content.senses` only, and **0 of 32,512 entries carry a grammar object
below top level**. Writing one would mint a shape the model has never
held and the builder never reads. The two repairs actually available —
hoist the sense to top level, or grow the model so a sense may carry
stems — are both rulings.

The split obeys batch 6b's rule: `coverage()` reads a row as registered
the moment any rule claims its id, so a 436-of-561 rule keeping the
whole row would have retired the other 125 into silence.

**16 of the 561 are not the defect at all**, and they are part of why
544 was too high. `Pi. of בָּסַם` is a gloss — the headword *is* that
stem of another article, and there is no section for a block to hold.
`= Pa.` is a cross-reference to a stem the entry carries elsewhere;
`B01369` has a real `Pa.` block already, so "repairing" it would mint a
duplicate. Recorded in the row's `reason` rather than promoted to rows,
because a row asserts a defect.

## 4. The commutation gate was phase-blind

Registering the rule produced four undeclared non-commuting pairs, all
cross-phase:

```text
bare-rtl-hebrew × stranded-stem-head @ A00626
emphasis-run-edge-space × stranded-stem-head @ M02371
label-period-outside-italic × stranded-stem-head @ A00189
italic-swallowed-terminal-period × stranded-stem-head @ M00771
```

**A cross-phase pair has one order, not two.** `apply.ts`'s committed
manifest runs `text-repairs` to completion and only then
`structural-repairs`, so `structural ∘ text` is the only composition the
pipeline can produce. Comparing it against `text ∘ structural` asks
whether a counterfactual the manifest forbids agrees with the real one;
a disagreement there is the phase boundary working.

Nor was the finding *recordable* the way the gate demanded.
`entangledWith` is a claim about registry ADJACENCY — `checkAdjacency`
requires declared pairs to sit gap-free — and adjacency across a phase
boundary is not something the registry can express.

`nonCommutingPairs` now skips cross-phase pairs and **counts them**:
`PairStats.crossPhasePairs`, 80 today (40 text rules × 2 structural),
asserted alongside `composedPairs + crossPhasePairs === totalPairs` and
printed on the gate's own log line. A skip nobody counts is the "silence
mistaken for coverage" failure `link-target.ts` named.

**Batch 6b did not reveal this**, because its one structural rule
happened to commute with all 40 text rules. A gate's blind spot found by
the SECOND member of a class is a gate that was passing for the wrong
reason on the first — and it is worth asking, at each of the remaining
structural rows, which gate has only ever been exercised one way.

The dependency the gate was gesturing at is real and is pinned by
measurement instead, in `rules/stem-section-corpus.test.ts`: the
raw-to-composed attribution of §1 is an assertion, not a note.

## 5. Two smaller things, both caught by tests rather than by reading

- **`stem-corpus.test.ts` counted the whole structural phase.** It read
  `run.records.length` after `applyTransforms(…, 'structural-repairs')`
  and asserted 18. With a second structural rule registered it saw 454.
  Now filtered by `ruleId`. The class of defect is batch 4's: a test
  whose subject was implicit and became wrong when the world grew.
- **`registry.order.test.ts` refused the rule until it was classified.**
  Working as designed — `stranded-stem-head` joins `NEITHER`, whose
  membership is EARNED by the corpus pass at the bottom of that file
  (removes no anchor, writes no `href` or `data-ref` in 32,512 entries),
  not declared.

## 6. The bracket collision, closed

Raised by 6a, deferred by 6b: the six `verbal_stem: "[."` blocks might
already belong to `stranded-open-bracket`.

**They are disjoint.** `stranded-open-bracket` reproduces at 87 occ / 85
ent and shares zero entries with the eight delimiter-label blocks. 6a's
balance claim reproduces exactly: all six `"[."` at −1 bracket, `"(."`
(`U00230`) at −1 paren with its text beginning `") "`, `"[[."`
(`P01197`) at 0 and not that repair. Either rule may now be written
without claiming the other's members; neither is written here.

## 7. What this batch cannot see

- **The 230 anchor-borne form links survive in child prose and are not
  captured in `BodyStem.forms`.** That field is `[]` for all 436 and
  nothing asserts that a stem block should carry forms, so a later
  lifting rule contradicts nothing here — but a reader consulting
  `stems[].forms` will not learn that these 436 keep their forms one
  level down.
- **Whether sense 0 opening with a stem label is ALWAYS a section
  head.** Confirmed by a sibling block in 112 entries and by the
  vocabulary being the parser's own; not proved for the 317 entries with
  no sibling block.
- **What hoisting would do to the 100.** Nothing here measures its
  effect on `rejoinGlossHead` or on sense order. That belongs to
  whoever takes `stem-head-in-child-sense`.
- **The general check 3a proposed and nobody has run** is still open:
  measure every pending row's population after `applyRepairs` rather
  than on raw source. This row is the third instance in two batches
  where doing it changed the answer.
