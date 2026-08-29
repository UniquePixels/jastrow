# The stranded stem head — a predicate, a corrected count, and the first minted grammar block

**Status: design, 2026-08-29.** Phase 2 batch 6c. Scope ruled by Brian
the same day: the rule takes the top-level slice and the parenthetical
slice; the child-sense slice becomes a `judgment` row; the two
cross-reference slices are recorded as false positives that over-measured
the row rather than as rows of their own.

Batch 6b's report is the immediate ancestor:
[`transform-batch-6b.md`](../v2/transform-batch-6b.md), and its spec —
[`2026-08-28-structural-repairs-design.md`](2026-08-28-structural-repairs-design.md)
— is where the phase and the loss gate this batch relies on were built.
The transform contract itself is
[`2026-08-22-transform-module-design.md`](2026-08-22-transform-module-design.md).

## 1. The row had no predicate, and that is the whole problem

`stranded-stem-head` was catalogued at **544 entries** in discovery
round 1. Nothing anywhere in the repo records how that number was
obtained — not the row's own `reason`, not the round-1 report, not the
chunk manifests. Batch 6a tried to reconstruct it and got **582
occurrences / 575 entries**, which it correctly declined to call a
reproduction, and 6a's own reconstruction is likewise unrecorded beyond
a three-line sketch.

So this batch's first deliverable is not a rule. It is a predicate:

```text
^[\s,;.=]*<i>\s*LABEL(\s*[/,]\s*LABEL)*\s*</i>
```

over `definition` at every sense depth, where `LABEL` is one of **45
binyan names derived from the corpus's own `verbal_stem` field** — the
70 distinct values it holds, minus batch 6b's 19-value non-binyan
enumeration, minus the six multi-label headings (`"Hithpa. a. Nithpa."`
and kin). The vocabulary is frozen in `rules/stem-section.ts` in the
`abbrev-vocab.ts` style, and
`rules/stem-section-corpus.test.ts` re-derives it live and fails if
upstream moves.

Deriving the vocabulary from `verbal_stem` rather than inventing it is
the load-bearing choice. The defect IS "this label should have been a
`verbal_stem` and was not", so the set of labels that can be stranded
is exactly the set the parser writes there when it succeeds.

## 2. Where the population is measured, and the finding that follows

| Measured on | Occurrences | Entries |
|---|---:|---:|
| raw source | 360 | 359 |
| after `applyRepairs` | 360 | 359 |
| after `applyRepairs` + the whole `text-repairs` pass | **561** | **555** |

**The population nearly doubles between raw source and the place a
structural rule stands, and the entire gap is one upstream rule.**
Stepping the corpus forward one rule at a time:

| Rule | Before | After | Δ |
|---|---:|---:|---:|
| `label-period-outside-italic` | 360 | 562 | **+202** |
| `italic-swallowed-terminal-period` | 562 | 561 | −1 |

`label-period-outside-italic` moves a section head's period inside its
own italic — `<i>Pa</i>.` → `<i>Pa.</i>`. A predicate about what is
INSIDE an italic run therefore *cannot be measured* before that rule has
run: on raw source 202 of these heads spell their period outside the
tag and are invisible to it.

This is batch 6a's lesson at its sharpest. 6a found two rows whose
populations were already ZERO after `applyRepairs`; this row is the
mirror case, where the composed population is nearly twice the raw one.
Both say the same thing: **a row's count is a claim about a place in the
pipeline, and a count with no place attached is not a measurement.**

`applyRepairs` alone changes nothing here (360 → 360), which is worth
stating rather than assuming — it was the mechanism that dissolved both
of 6a's rows.

## 3. Two model constraints, measured rather than argued

Before any repair could be designed, two facts about the target model
had to be established. Both are corpus measurements, not readings of the
schema.

### 3.1 `buildStem` drops `sense.definition`

`dry-run.ts:193`:

```ts
function buildStem(rid: string, sense: SourceSense, acc: BuildAcc): BodyStem {
	const { grammar } = sense;
	return {
		forms: grammar?.binyan_form ?? [],
		senses: (sense.senses ?? []).flatMap(...),
		stem: grammar?.verbal_stem ?? '',
	};
}
```

`sense.definition` is never read. So the obvious repair — attach a
`grammar` object to the sense that carries the head and leave its text
alone — **deletes that text at build time**, and does so invisibly: all
four gates in `run.ts` read `SourceEntry` fields, where the definition
is still present. This is the same shape as batch 3a's two-owners
failure and batch 4's `rejoin-chopped` collision: a defect that only
exists in the composition, which no per-rule gate can see.

The repair must therefore move the text into a CHILD sense, which is
where a parsed stem block already keeps it.

### 3.2 `stems[]` has no representation below top level

`dry-run.ts:252` tests `.grammar` on `content.senses` only, never on a
child. And the corpus agrees: **0 of 32,512 entries carry a `grammar`
object below top level.** A rule that wrote one would mint a shape the
model has never held and the builder never reads.

That single fact decides the disposition of 100 of the 561.

## 4. The repair

```text
before  senses[0] = { definition: ", <i>Pi.</i> <span>אִבֵּק</span>, … " }
after   senses[0] = { definition: "",
                      grammar: { verbal_stem: "Pi." },
                      senses: [ { definition: "<span>אִבֵּק</span>, … " } ] }
```

The label MOVES into `grammar.verbal_stem`, a field `fieldsOf` walks
(`no-new-text.ts:125`), so it is text-neutral to both text gates —
exactly the shape `stemHeadMarkerChop` established for `number`. The
sense's own `number`, if it had one, goes to the child; the sense's own
children follow the new text child in order.

### 4.1 `binyan_form` is left empty, deliberately

A parsed block carries the Hebrew forms in `binyan_form`. This rule
writes none.

**230 of the rule's 436 members open with an `<a dir="rtl">` anchor
form** (199 with an rtl span, 7 with a parenthetical), and
`binyan_form` items are plain strings in both the source shape and
`entry.schema.json`. Lifting one would strip the anchor and discard a
link target — precisely what `checkLinkTargets` exists to defend.
(Across the whole 561-member population the anchor count is 267; that
figure is about the row, not about what ships.) The
form stays in the child's prose, where the reader sees it either way;
what the entry gains is the stem's NAME, which is the thing that was
missing. `BodyStem.forms` comes out `[]`, which the schema permits
(`forms` has no `minItems`).

This is a deliberate partial repair and is recorded as one. Lifting the
forms is available later if the model grows a place for a linked form.

### 4.2 What it deletes

The seam only:

| Deleted run | n |
|---|---:|
| `", "` | 275 |
| `""` (definition opens with the run) | 126 |
| `"; "` | 26 |
| `" , "` | 8 |
| `" ; "` | 1 |

plus the single space between `</i>` and what follows, once per repair.
Both runs are declared through `removes`, which the loss gate credits as
a multiset.

Measured over all 436 through `buildTrace` — the rendered body, not the
source fields, because §3.1 is why the source fields are the wrong place
to look: **1,065 codepoints lost, every one of them a space, comma or
semicolon, and 0 codepoints invented.**

## 5. The population, partitioned

The partition is exhaustive and mutually exclusive; the corpus test
asserts that the six slices sum to 561.

| Slice | n | Disposition |
|---|---:|---|
| top-level sense 0, single label, space then something | **436** | **the rule** |
| child sense (depth 1) | 100 | new `judgment` row `stem-head-in-child-sense` |
| `Label of X` gloss | 14 | not the defect — over-measurement |
| etymology-paren remnant | 7 | refused on shape; stays on the row |
| `= Label` cross-reference | 2 | not the defect — over-measurement |
| double head / paren-prefixed head | 2 | real; a shape this rule does not take |

### 5.1 The two slices that are not the defect at all

`Label of X` — `<i>Pi.</i> of <a>בָּסַם</a>, q. v.` — is a gloss, not a
section head: the headword *is* the Pi. of another article, and there is
no section for a block to hold. `= Label` — `" = <i>Pa.</i> Targ. …"` —
is a cross-reference to a stem the entry already carries elsewhere
(`B01369` has a real `Pa.` block at index 2, so repairing it would mint
a duplicate).

Sixteen entries between them, and they are part of why the catalogued
544 was too high. They are recorded in the row's `reason` rather than
promoted to rows, because a row asserts a defect and there is none here.

### 5.2 The child-sense slice is a model question

The 100 carry the same defect and cannot be repaired by this mechanism,
for the reason measured in §3.2. Both repairs actually available are
rulings rather than transforms:

- **Hoist** the sense to top level. This reorders the reader's page
  inside 100 entries and changes what `rejoinGlossHead` reads.
- **Grow the model** so a sense may carry stems of its own.

They become `stem-head-in-child-sense` (`route: judgment`), on the
batch-6b precedent — `coverage()` reads a row as registered the moment
any rule claims its id, so a 436-of-561 rule keeping the whole row would
have retired these 100 into silence. This is the same sentence that
closes `empty-stem-section` and `stem-label-not-a-binyan-name`: a model
question wearing a transform row's clothes.

**Not declared `entangledWith`.** The two populations partition one
predicate with zero overlap, so neither can own the other's records —
which is what `entangledWith` asserts. Declaring it would also strand an
`unaccountedEdges` deferral (a rule shipping ahead of a still-`PENDING`
partner) for a contention that does not exist. Batch 6b's own two splits
declare no edge either.

## 6. The falsifier

A rule that MINTS a stem section must not mint one the entry already
has, and no gate in `run.ts` can see a duplicate — `checkNoNewText` is
satisfied because the label is text the entry already held.

**In 0 of the 436 does the entry carry another top-level block with the
same `verbal_stem`.** 112 carry a block with a different stem name; 317
carry none at all. Asserted in the corpus test, where a future widening
that started duplicating fails rather than shipping.

## 7. The commutation gate was phase-blind

Registering this rule made the gate report four undeclared
non-commuting pairs:

```text
bare-rtl-hebrew × stranded-stem-head @ A00626
emphasis-run-edge-space × stranded-stem-head @ M02371
label-period-outside-italic × stranded-stem-head @ A00189
italic-swallowed-terminal-period × stranded-stem-head @ M00771
```

All four are cross-phase. **A cross-phase pair has one order, not two.**
`apply.ts`'s committed manifest runs `text-repairs` to completion and
only then `structural-repairs`, so `structural ∘ text` is the only
composition the pipeline can produce, and `text ∘ structural` is not an
alternative the registry could be reordered into. Comparing them asks
whether a counterfactual the manifest forbids agrees with the real one;
a disagreement is the phase boundary WORKING.

Nor could the finding be *recorded* the way the gate demands.
`entangledWith` is a claim about registry ADJACENCY — `checkAdjacency`
requires declared pairs to sit gap-free — and adjacency across a phase
boundary is not a thing the registry can express.

`nonCommutingPairs` now skips cross-phase pairs and **counts them**, in
`PairStats.crossPhasePairs` (80 today: 40 text rules × 2 structural
ones), asserted alongside `composedPairs + crossPhasePairs ===
totalPairs`. A skip nobody counts is the "silence mistaken for coverage"
failure `link-target.ts` named; this one is on the log line and in an
assertion.

**Batch 6b did not reveal the gap**, because its one structural rule
happened to commute with all 40 text rules. A gate's blind spot found by
the second member of a class is a gate that was passing for the wrong
reason on the first.

The real dependency the gate was gesturing at — this rule's population
depending on `label-period-outside-italic`'s output — is pinned by
measurement instead, in `rules/stem-section-corpus.test.ts`.

## 8. The bracket collision, closed

Batch 6a raised it and 6b deferred it: the six `verbal_stem: "[."`
members might already belong to `stranded-open-bracket`, and neither
rule should be written before that was checked.

**They are disjoint.** `stranded-open-bracket` reproduces at 87
occurrences / 85 entries (definition ending in a bare unclosed `[`), and
its entry set shares **zero** members with the eight delimiter-label
blocks. 6a's balance claim reproduces exactly: all 6 `"[."` blocks are
bracket-unbalanced at −1 in their own text, `"(."` (`U00230`) is
paren-unbalanced at −1 with its text beginning `") "`, and `"[[."`
(`P01197`) is balance 0 and is not this repair.

Either rule may now be written without claiming the other's members.
Neither is written here — both belong to
`stem-label-not-a-binyan-name` and `stranded-open-bracket`, whose own
batches will take them.

## 9. What none of this can see

- **The 267 discarded form-links are not discarded, but they are not
  captured either.** `BodyStem.forms` is `[]` for all 436. Nothing in
  the suite asserts that a stem block SHOULD carry forms, so a later
  rule that lifted them would not be contradicting anything here — but
  neither would a reader consulting `stems[].forms` learn that these
  436 have their forms one level down in prose. Recorded here and in
  the row.
- **Whether a top-level sense 0 opening with a stem label is always a
  stem section.** The falsifier in §6 rules out duplication and the two
  cross-reference slices are excluded by predicate, but the reading
  itself — that print set a section head there — rests on the
  vocabulary being the parser's own and on 112 entries where a sibling
  block confirms the pattern. It is not proved for the 317 with no
  sibling block.
- **The hoist option for the 100.** Nothing here measures what hoisting
  would do to `rejoinGlossHead` or to sense order. That measurement
  belongs to whoever takes `stem-head-in-child-sense`.
