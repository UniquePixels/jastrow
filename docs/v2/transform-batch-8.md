# Phase 2 batch 8 — the last blocking rows

**Scope ruled by Brian 2026-08-30: the six rows still marked
`blocking` on the transform route**, 422 catalogued instances across
four unrelated families. Not a family batch like 5, 6 or 7 — a
*property* batch. `blocking` is the catalogue's own assertion that a
rule is owed before cutover, and these were the last six rows making
it.

**One rule shipped. Two rows discarded, three withdrawn to
`judgment`.** That ratio is the batch: five of six rows asserted a rule
was owed and none of the five was right, each for a different reason.

| Row | Catalogued | Measured | Disposition |
|---|---:|---:|---|
| `plural-label-rendering-defeats-capture` | 358 | 523 | **discarded** |
| `homograph-roman-stranded-in-definition` | 23 | **23** | withdrawn to `judgment` |
| `reversed-hebrew-phrase` | 27 | **18** | withdrawn to `judgment` |
| `sense-number-outside-closed-grammar` | 6 | **6** | withdrawn to `judgment` |
| `b-h-split-across-field-boundary` | 4 | **4** | **discarded** |
| `see-particle-lost` | 4 | **4** | **rule shipped** |

## The measurement

Verified on the branch: **`RULES` 48**, `coverage()` **61** total / 49
registered / **12 pending** / 0 unaccounted / 0 duplicated. Routes
**transform 61 / 19,726 · judgment 65 / 16,626 · blocked 5 / 4,947**.
Commutation gate **287 cross-phase pairs**, 0 undeclared.
`migrate-dry` **32,512/32,512 on all four gates**, `schemaFailures=0`,
`repairFailures=0`, `transformFailures=0`, `labelQuarantines=0`,
`brokenTopSequences=34` / `startsAtTwo=8` — both identical to `v2`.
`see-particle-lost: 4 instance(s)` end to end.

**`coverage().total` 66 → 61 is the largest single drop this program
has recorded**, and it is the first batch to leave **zero blocking rows
unregistered**: all 12 remaining `PENDING` rows are non-blocking.

## 1. Four of six counts reproduced, and the two that did not are different failures

Four rows reproduced on first measurement, two of them to the rid:
`sense-number-outside-closed-grammar` at 6 with the same six rids, and
`homograph-roman-stranded-in-definition` at 23 with the catalogued list
exactly, once both false positives the row itself names are refused.
`see-particle-lost` and `b-h-split-across-field-boundary` reproduced at
4 apiece.

The two that did not, did not fail the same way.

**`plural-label-rendering-defeats-capture` reads 523 where the row says
358.** The by-label *proportions* reproduce — the capitalised `"Pl. "`
bucket loses well under 1% while the italic buckets lose most of theirs,
which is the internal control the row's whole argument rests on, and it
holds. Only the totals differ. The disposition does not turn on it (523
is a superset and survival is 100% across all of it), but the
catalogued figure is not verified and the gate pins the measured one.

**`reversed-hebrew-phrase` reads 18 where the row says 27, and that
one is a UNIT artifact rather than a scope difference.** §3.

## 2. `b-h-split` and `plural-label` are the same finding twice: the defect is in something the reader never sees

Both were discarded, and both discards turn on a claim about what
reaches a reader rather than on what the source holds.

`plural_form` is not a v2 field — `entry.schema.json` sets
`additionalProperties: false` over `{id, slug, headword, altHeadwords,
page, grammar, senses, stems}` — and nine sibling rows were already
discarded on exactly that. This row was deliberately held back from
that fold because its shape is an ABSENCE rather than debris, and
because it made a second claim the siblings did not:

> the plural forms remain present verbatim in the definition text that
> v2 does carry

**Asserted, never measured.** Measured now through `buildBody` itself,
over the whole built entry: **523 of 523**. Every declared plural run is
in what a reader is shown. Nothing is lost, and there is nowhere to
write it if it were.

`b-h-split` is the same shape from the other side. `rejoinGlossHead`
concatenates the four gloss-head fragments in print order and invents no
separator, so `" ch. = b."` and `" h. מוּג, to melt."` are contiguous
again the moment the gloss head is built. `rejoin.ts`'s own header
already names this class — "this is what heals the K00664-class
mid-phrase paren straddle" — and this row is another instance of it,
not a new defect. **4 of 4 read `b. h.` in the built body.**

Both are DISCARDS rather than `judgment` withdrawals, on
`binyan-form-*`'s distinction: a withdrawal says no rule can be stated
while the defect stands, a discard says something already owns it. Here
the owners are the body model's own field selection and its own
definition of the gloss head.

### The gates assert the premise, not the helper

Both discards are pinned:
`rules/plural-capture.corpus.test.ts` and
`rules/gloss-head-rejoin.corpus.test.ts`. Both measure through
`buildBody`, which calls `rejoinGlossHead` at `dry-run.ts:241`, rather
than through the helper alone — **a discard resting on the helper would
survive a builder that stopped calling it**, and all four `b-h` defects
would be back with the helper still green. The rejoin gate keeps the two
assertions in separate `it`s so a failure says which half broke.

The plural gate asserts the SCHEMA fact directly as its §3, because the
discard is only as durable as that: give `plural_form` a v2 destination
and all ten rows reopen together. Making that a test failure is better
than making it something a future reader has to remember.

## 3. `reversed-hebrew-phrase`: the count was a unit artifact and the mechanism was wrong

The row counts "runs", and a run is not a thing the source marks — it
has to be defined, and the definition decides the count. Measured at the
unit a reader actually sees, the text of one `<span dir="rtl">`:

| | |
|---|---:|
| Multi-word rtl spans | **61,539** |
| Ending in the particle `וכ׳` only | **17,092** |
| **Beginning with it only** | **18** |
| Both ends | 3 |
| Medial only | 49 |

The catalogued 27 counts whitespace runs over text with markup
**stripped**, which does two wrong things at once: it merges spans print
separates (`וכ׳</span> <span>חלה` strips to one run), and it splits
spans at an internal ellipsis, so `תבור … וכ׳ מאספמיא` — where the
particle correctly trails its own clause — yields a spurious
particle-leading tail. **12 of the 27 have a tag between the particle
and the next word**; those were never one phrase.

**The mechanism is rotation, and the row is named for reversal.** Full
reversal produces word salad:

```text
stored     וכ׳ אין מודדין אלא בח׳
reversed   בח׳ אלא מודדין אין וכ׳      <- not Hebrew
rotated    אין מודדין אלא בח׳ וכ׳
```

The English beside it in the same definition reads "Sabbath distances
must be measured with a rope of fifty cubits' length" — the rotation.
One token is at the wrong end; the phrase is not backwards. Both shapes
may exist upstream (the row's arm (a) two-word bigrams are plausibly
true reversals), but the row keeps the count of one arm and the
description of the other.

### What actually blocked the rule: 17 of 18 have no witness

Each body was tested both ways as a substring across all 61,539 spans.
The rotated form is better attested for **1 of 18** — `K00761`, at 53
against 1, and it is the row's own cited example. **The other 17 bodies
occur exactly once in the corpus: their own damaged instance.**

So every repair but one would rest solely on the aggregate 18-against-
17,092 positional convention with nothing in its own entry witnessing
it — the standard `continuationMarkerDash` refused in batch 7, when it
shipped 14 witnessed members and left 22 rather than act on a population
argument.

### The row's corroboration witnesses the defect, not the fix

`A00188`'s `quotes[]` holds `הסופרים אָבָק`, itself the reverse of
`אבק הסופרים`. The row reads that as independent corroboration. It is
corroboration that **the defect is real and upstream of both fields**,
which is worth having — but two fields agreeing on a wrong order is one
extraction pass reaching two destinations, not two witnesses to a right
one.

## 4. `homograph-roman-stranded`: reproduces exactly, and still cannot ship

This is the batch's most important finding, because nothing was wrong
with the row.

Its predicate was never written down; stated for the first time (a
leading Roman numeral, optionally after a comma, refused before a
lower-case letter or apostrophe, and refused before a CAPITALISED Latin
abbreviation) it reproduces the catalogued 23 to the rid. Both false
positives the row names are accounted for by those two guards —
`F00006` "V'elleh" by the first, `R00657` "II Chr." by the second.

**The destination is the headword**, because v2 has no homograph field.
That makes it a headword rewrite, and
[[feedback_headword_is_a_namespace]] is what applies.

| | |
|---|---:|
| Rewrites that would dangle at least one live anchor | **17 of 23** |
| Anchors that would dangle | **37** |
| Entries no anchor names by the bare headword | 6 |
| Collisions with an existing headword | 0 |

The row records the exposure as **3** — the anchors whose *display*
shows a numeral. The 37 are the anchors whose *target* is the bare
headword, which is the set a rewrite breaks, and the row never measured
it. This is batch 5's `LINKED_HEADWORDS` finding with the ratio
inverted: 2 of 7 refused there, 17 of 23 here.

**And the counterpart repair is on the other route.** The row names it
itself — `homograph-numbering-schism` is "the anchor side of the same
superscript schism to this row's entry side" — and that row is
`judgment`. So the anchors are never retargeted, and repairing the entry
side alone converts 37 anchors that resolve today into 37 that resolve
to nothing. **A repair that is correct in isolation and harmful in
composition is not a transform this pipeline can ship.**

Its whole family was already there: five of the six homograph rows are
`judgment`. This was the last one on `transform`.

### An undeclared entanglement no gate could have found

`unnumbered-terminal-homograph` (129, also blocking, also `judgment`)
names `שִׁיעֲתָא` among its 18 families. That is `U00997`/`U00998`, two
of these 23 — and **neither row carries an `entangledWith` naming the
other**; both are `[]`.

Nothing in the gates could have surfaced it. `checkAdjacency` reads
declared edges. The commutation gate composes registered RULES, and
neither row has one. Both endpoints are unregistered, which is exactly
the condition batch 7 showed `unaccountedEdges` is blind to by
construction — so this edge was found by reading, and nothing in the
suite could have found it otherwise.

### The `²` question, raised and not settled

Six of the 23 already carry a `²` in the headword, and appending the
print numeral gives `"תְּאֵב ² II"` — marked twice by two different
systems. **The `²` is demonstrably not the print numeral**: `U00997`
`שִׁיעֲתָא` is print **II** while `U00998` `שִׁיעֲתָא ²` is print
**III**, so `²` counts records sharing a spelling while the Roman
numeral counts Jastrow's homographs. Reconciling them is a model
decision and nothing in the v2 specs makes it.

## 5. `sense-number-outside-closed-grammar`: batch 7's remainder had nothing left in it

Batch 7 re-scoped this row 111 → 6 and kept it on the queue rather than
discarding it, "because discarding it would leave those 6 surfaced by
nothing executable". Batch 8 read the 6.

Batch 7 had already established that the star is a **parsed field**, not
a quarantine trigger — `body/labels.ts`'s `LABEL` is
`/^(?<dash>—)?(?<star>\*)?(?<label>\d+|[a-z])\)$/u` and `printLabel`
round-trips every one byte-exactly. So a rule here would not be
repairing a parse failure; it would be asserting a missing em dash and
writing one.

Measured on each member's predecessor, they split three ways and no arm
survives:

| Members | Shape | Is a dash owed? |
|---|---|---|
| `B00005`, `N01131`, `P01184` (`*1)`) | first numbered sibling of the run | **No** — the convention never puts one there, and each has a following `—2)` |
| `A02000` (`*2)`) | predecessor ends `—[` | Already `stranded-open-bracket`'s, per batch 7 |
| `A00510` (`*3)`) | predecessor ends `". "`; **has** a dashed sibling | Witnessable via `copied` |
| `M00591` (`*2)`) | predecessor ends `". "`; **no** dashed sibling | Only via `allows` — refused |

A rule for `A00510` alone repairs one entry and leaves five on a
blocking row. Withdrawn.

## 6. The one rule: `see-particle-lost` mints a word

The registry's second minting rule and the first to mint a word rather
than a codepoint. What licenses it is the null model, and it is of
`sectionBreakTerminator`'s shape and slightly stronger.

Measured at the stage the rule runs, over whole-definition redirect
stubs — one top-level sense, no children, the anchor the entire
definition — the particle slot is populated **7,270** times and empty
**4**:

```text
"v."  6844   "v. sub"  196   "read"  29   "pl. of"  29
"read:"  16  "v. sub."  12   "part. of"  8  "fem. of"  5
"Pi. of"  4  "v,"  4        "constr. of"  4  "imper. of"  3
```

**These twelve are the head of the distribution, not the whole of it** —
they account for 7,154 of the 7,270, with the remaining 116 spread over
a long tail of rarer particles.

**The vocabulary is the argument, not the ratio.** A slot whose fillers
were being normalised away would show a SINGLE surviving value; this one
retains a dozen distinct particles, several themselves damaged (`v,` ×4,
`read:` ×16). A convention that varied this much everywhere it was kept
did not silently mean "nothing" in four places.

### Two restrictions, and the second is worth 14

The row's own falsifier supplies the first: the broader shape
`, <a Jastrow…>` at definition start occurs **87** times and is
overwhelmingly legitimate — the print headword line's second form.
Requiring the anchor to be the entire definition is what cuts a
95%-noise candidate to four.

The second is this batch's. The same string shape occurs in **14 child
senses** of large articles, where a sub-sense that is nothing but a
cross-reference is ordinary rather than damaged. Measured across all
depths the population is 18; restricted to stubs that ARE the entry, it
is the catalogued 4. `isWholeEntryStub` is that restriction, and the
corpus gate pins the 14 it refuses.

### It is a pure insertion, and that took a second test

The first implementation matched on `definition.trim()` and rebuilt the
string from its captured groups. That silently ate edge whitespace — an
undeclared deletion in a `text-repairs` rule, invisible to
`checkNoNewText` (a sub-multiset test), and a silent change to
`trailing-whitespace-definition`'s (10, still `PENDING`) population.

The rule now splices the particle at the anchor's own offset and carries
every other byte through. The test that caught it asserts the property
rather than the output: **removing the mint from the result yields the
input exactly.**

`allows: ['v', '.', ' ']`. All three are minted — the input's only
period is the stub's own terminator, and a multiset test needs an
allowance for a second one.

## 7. The corpus census read the rule's own output, and this time it failed loudly

`composedEntries()` runs the whole `text-repairs` phase, and
`seeParticleRestore` is in that phase. Censusing on it counted the
rule's own repairs: `v.` came back **6,848** rather than 6,844, and §5's
end-to-end check got `null` from a `restoreParticle` whose input was
already repaired.

This is batch 7's implicit-subject defect again —
`continuation-marker.corpus.test.ts` hit it on its first run,
`stem.corpus.test.ts` had it fixed for `records.length` in 6c and then
hit it again in 7 on a phase delta. The difference here is the
DIRECTION of the failure. In batch 7 it made every assertion read 0 and
**pass**; here it made two of five **fail**, on the exact numbers that
moved.

Worth keeping: a census that includes its own rule fails safely when the
rule ADDS to a population it counts, and fails silently when the rule
REMOVES from one. The fix is the same either way — build the stage with
the rule held out, which `corpus-fixture.ts`'s own docstring already
prescribes — but only one of the two shapes will tell you.

## 8. The commutation pin moved to a number its own note had predicted

`crossPhasePairs` 280 → **287**, and the pin's comment had already
written down what that would mean:

> An earlier version of this note said 287, which is 41 × 7 — a 48th
> rule, not a mis-declared phase.

Which is exactly what happened: a 41st `text-repairs` rule against the 7
structural ones. The note is now re-derived forward — batch 8's rule
declaring `structural-repairs` instead would have made it 40 × 8 = 320 —
so the next reader can check the growth was in the phase they expected
rather than taking 287 on trust.

## 9. Review: six findings, five real, one fabricated

One local CodeRabbit round over the whole 17-file diff. **Five of the
six were real and all five are fixed; the one Major was false.**

**The false one was the Major.** It reported that
`reversed-hebrew-phrase` had lost its `blocking` flag while its two
sibling withdrawals kept theirs, and warned this "can produce an
incorrect cutover decision". The row carries `"blocking": true` at the
line it names. The disposition script strips `blocking` only for
DISCARDS, and this is a withdrawal. Checking the finding against the
file cost a minute; acting on it would have been a wrong edit to the
catalogue. [[feedback_listen_first]].

**The two that mattered were both gates that could pass on the
regression they exist to catch.**

`gloss-head-rejoin.corpus.test.ts` joined the whole built body with a
space separator before testing for `b. h.`. **That separator would have
supplied the space itself** — a `buildBody` that re-split the two halves
across adjacent fields would still have matched, which is exactly the
failure the gate is for. It now asserts within a SINGLE intro-sense
string. It still passes, so the property is real and was merely being
tested vacuously.

`see-particle.corpus.test.ts` §5 was titled "the repair, end to end" and
called the bare `restoreParticle` function. It would have passed with
the rule mis-registered, in the wrong phase, or absent from `RULES`
entirely. It now pulls the rule from `RULES` by id and runs it through
`applyTransforms`, asserting the record and the pure-insertion property
besides.

The other three were documentation defects of one kind — **a stated
figure contradicting a measured one**:

- The plural gate's §4 was named "never a blank-string slot" and
  asserted that exactly one exists. The row claims none; the measurement
  finds one. Renamed, and the row's error recorded rather than papered
  over.
- The particle census block sums to 7,154 against a stated 7,270. It is
  the head of the distribution; 116 more sit in the tail. Labelled in
  all three places it appears.
- `phase-2-triage.md`'s downstream tables still summed to 133 rows and
  41,808 instances against the 131 / 41,299 this batch left. **The
  transform-queue table said "all 68 rows" and held 68 — it had been
  stale since batch 7.** Worse, the judgment table held 50 rows under a
  heading that said 60, and a note dated 2026-08-29 asserted "the table
  below was current" when it was ten rows short. Both tables are now
  GENERATED from `patterns.jsonl` instead of hand-maintained, and the
  false note is corrected in place. All three sections agree: 61 + 65 +
  5 = 131 rows, 19,726 + 16,626 + 4,947 = 41,299 instances.

A self-review pass before the round found one more, which review did not
raise: the rule emitted `",v. <a"` on a `",<a"` input, a particle fused
to the comma. The predicate now requires the separating space and the
corpus gate confirms the population is unchanged at 4.

## 10. What this batch has not done

- **Nothing here reads the two dash-loss candidates against print.**
  `A00510` and `M00591` are withdrawn on the absence of a corpus
  witness, not on evidence that print carries no dash. Reading the 1903
  edition would settle both.
- **The `²`-versus-Roman-numeral model question is raised and open.**
  Six entries need it answered before any homograph repair, and it
  blocks more than this row.
- **The `homograph-roman-stranded` × `unnumbered-terminal-homograph`
  edge is recorded here and in the audit, but not in `patterns.jsonl`.**
  Both rows are `judgment`, so no gate reads their `entangledWith` —
  declaring it would be documentation, and it should be done when the
  schism is worked as a whole rather than now.
- **`reversed-hebrew-phrase`'s arm (a)** — the 20 two-word bigram
  reversals — is a genuinely different mechanism that this batch
  measured only enough to separate from arm (b). It has not been
  counted at the span unit.
- **Nothing here revisits the 358-versus-523 discrepancy.** The
  disposition is safe under either figure, so the gate pins the measured
  one and the difference is recorded rather than resolved.
