# Transform batch 5 — headword field integrity

**Status: shipped 2026-08-28.** Four rules over four catalogue rows,
one row withdrawn to `judgment` on a published audit, **no count
corrected**, and one entanglement the batch's own spec had argued could
not exist. The registry now holds **39 rules**; `coverage()` reads
**0 unaccounted / 0 duplicated** over a transform route that shrank
from **72 rows to 71**.

Spec: [`2026-08-27-headword-field-integrity-design.md`](../specs/2026-08-27-headword-field-integrity-design.md).
Withdrawal audit: `data/patches/catalogue-audit/abbrev-headword-stub.md`.

## The findings that outlive the tasks

**1. Every one of the five catalogued counts reproduced on first
measurement. That has not happened before in this program** — batch 2
corrected three counts, 3a one, 3b seven, batch 4 two. It is worth
saying why rather than claiming a trend: three of the five predicates
are one-liners over a field, and the other two came with a
discriminator already written into their `reason` by an earlier audit.
Rows whose audit was done carefully reproduce; that is the pattern, not
"the catalogue is now reliable."

**2. `parenthesized-alt-headword`'s "unclosed" items are not unclosed.
They are one print group torn at its internal comma.** The catalogue
read *"alt_headwords item wrapped in the print parentheses, sometimes
unclosed"*. A00083 is canonical:

```
headword אַבְזָקַת   alt_headwords ['(אַבְזָקָא', 'אַבְזָקָה)']
```

**69 of the 84 open-only items pair with a later close-only item in the
same array** — 52 adjacent, 17 spanning intervening items that are
inside the parentheses too. That leaves **15 unmatched opens and 12
unmatched closes**, and one further item whose close sits mid-string
with its open in a different item: **28 items carrying an unmatched
delimiter, 27 of them inside the two one-sided buckets.** This is an
upstream **split-site** defect of the same family as
`binyan-form-leading-space`, whose own `reason` calls a 100% rate *"the
signature of a split-on-delimiter that never strips"*. §3.

**3. THE BATCH'S OWN TWO RULES DO NOT COMMUTE, AND THE SPEC HAD ARGUED
NO ENTANGLEMENT WAS POSSIBLE.** The spec's §1 reasoned that the batch's
rules touch fields no shipped rule touches — true, and irrelevant: it
was a claim about the OTHER rules and never checked the pair against
each other. `B00780` holds `'(עֵין ב׳)'`; the phrase rule refuses
anything following the geresh, so phrase-first cannot see it, while
paren-first strips the delimiters and it expands. Composed the two
orders read **236 against 235**. Caught by the commutation gate shipped
in PR #50, in the one batch that had argued it had nothing to find. §4.

**4. The registry's first `TransformResult.copied` user, and the gate
was proved live rather than quiet.** `phraseAltHeadwordStub` is the only
rule in this batch that adds text. `types.ts` names this exact case on
`allows`: *"A copy of existing per-entry text (the tail of a headword
recovered into an alt-headword, say) cannot be expressed here … Declare
those through `TransformResult.copied` instead."* A negative test
declares a string the entry does not hold and asserts `applyTransforms`
throws — without it the batch could only have claimed the gate did not
complain. §5.

**5. A rule that rewrites `headword` is a link rule.** Two of the six
headwords `abbrevFusedHeadword` would have repaired are named by an
anchor in another entry, so repairing them broke two live links. The
DIFFERENTIAL link assertion could not see it and the ABSOLUTE pin could.
Both are declined; the rule ships for 4 of 7. §8.

**6. Two permanent records were false or conditional before this batch
read them, and one of them was mine.** `abbrev-fused-headword`'s
`reason` claimed all seven members alphabetize by their second token;
A02002 alphabetizes by its third. `abbrev-headword-stub`'s `reason`
ended *"RAISE ONLY IF THAT ROW'S DISPOSITION IS UPHELD"* naming a row
whose disposition was not upheld. And the spec written at the start of
this batch carried a sub-shape table that counted one bucket in groups
while the others counted occurrences. §6.

**7. `markup.ts` and `link-target.ts` were inert for an entire batch,
and that needed a new classification rather than a quiet exemption** —
`FIELD`, an eighth class, earned by its own corpus assertion rather than
diluting `NEITHER`. §7. Note finding 5 against it: inert gates are not
the same as no exposure.

## 1. Scope as ruled, scope as shipped

**Scope ruled 2026-08-27 (Brian): 5 rows / 879 catalogued entries**,
entanglement-closed at the batch boundary.

| Row | Catalogued | Disposition |
|---|---:|---|
| `parenthesized-alt-headword` | 580 | rule `parenAltHeadword` |
| `phrase-alt-headword-stub` | 236 | rule `phraseAltHeadwordStub` |
| `abbrev-headword-stub` | 34 | **withdrawn** to `judgment` |
| `gender-pair-headword-line-collapse` | 22 | rule `genderPairAltDuplicate` |
| `abbrev-fused-headword` | 7 | rule `abbrevFusedHeadword` (4 of 7) |

**Four registered `Rule` objects disposing of all five rows** — the four
rules' own rows plus the withdrawal. The three units are not
interchangeable and each count below names its own: catalogue rows,
designed rules, registered `Rule` objects.

### What the migration actually repaired

`bun body:migrate-dry`, which is the composed pipeline rather than any
rule measured alone:

```
transform parenthesized-alt-headword:          652 instance(s)
transform phrase-alt-headword-stub:            236 instance(s)
transform abbrev-fused-headword:                 4 instance(s)
transform gender-pair-headword-line-collapse:   22 instance(s)
```

`transform:count` reads three explained DELTAs against these, because it
measures every rule ALONE against pristine source while the migration
composes them:

| Row | measured alone | catalogued | why |
|---|---:|---:|---|
| `parenthesized-alt-headword` | 579 | 580 | A01480's only occurrence is a refusal |
| `phrase-alt-headword-stub` | 228 | 236 | 9 refusals; one more needs the paren rule first |
| `abbrev-fused-headword` | 4 | 7 | 1 shape refusal, 2 link refusals |
| `gender-pair-headword-line-collapse` | 22 | 22 | MATCH |

**No `corpusCount` was corrected.** Writing the smaller figure into any
of these would assert those entries do not carry the defect, and they
do — they need an operation this batch does not have.

**914 instances**, against 879 catalogued ENTRIES — the units differ,
and 654 paren occurrences live in 580 entries.

## 2. Registry and catalogue state

| | Before | After |
|---|---:|---:|
| `RULES` | 35 | **39** |
| `PENDING` | 36 | **31** |
| `coverage().total` | 72 | **71** |
| unaccounted / duplicated | 0 / 0 | **0 / 0** |
| suite | 1,007 pass / 0 fail | **1,062 pass / 0 fail** |
| commutation gate | 35 rules, 9 non-commuting | **39 rules, 10 non-commuting, 0 undeclared** |
| entanglement clusters | 4 | **5** |
| `unaccountedEdges()` | 1 line | 1 line (unchanged) |

Route totals, recomputed from the catalogue rather than typed:

```
transform  71 / 21,983
judgment   56 / 15,919
blocked     5 /  4,947
```

## 3. `parenthesized-alt-headword` — 652 of 654

The seven-bucket taxonomy PARTITIONS the population — the buckets sum
to 654 and an `unbucketed` list is asserted empty, so a shape nobody
anticipated fails a test rather than falling into a default branch.
That is how the row came to be described as "sometimes unclosed" in the
first place.

| Bucket | Occ |
|---|---:|
| wrapped-whole `(X)` | 464 |
| starred wrapped `*(X)` | 18 |
| wrapped + homograph mark `(X) I` | 5 |
| open-only | 84 |
| close-only | 81 |
| interior optional-letter — **REFUSED** | 1 |
| stray close — **REFUSED** | 1 |

**Ruling (Brian, 2026-08-27): strip the delimiters, no new form-object
mark, no schema change.** Because the ruling is strip-only, every
sub-shape yields the same output under one blanket operation — the
taxonomy is the rule's EVIDENCE that the strip is safe, not a branch in
its code.

**Two refusals, selected by shape and asserted by rid.** `A01480`'s
`'אִיסְפְּלָנִית(א)'` is print's optional-final-letter convention, not a
group; stripping keeps the plene reading and silently discards the
other. `A01394`'s `'אֵינָשׁ) אִינְשָׁא'` is the tear landing at the wrong
offset, its open living in a different item; stripping yields a
two-word item that is neither a phrase lemma nor a spelling.

**579 entries against a catalogued 580, and both are right.** A01480's
only paren occurrence is one of the refusals, so `transform:count` reads
`DELTA -1` permanently. Writing 579 into `corpusCount` would assert
that entry does not carry the defect; it does, and needs a different
operation.

### Two measured negatives, and why they were owed

`gender-pair-headword-line-collapse` is DEFINED by a duplicate string in
`alt_headwords`. If stripping could produce a second copy of a sibling
item, rule 1 would manufacture members of rule 4's population — the
collision batch 3b found four times and gated zero times. Measured over
all 8,673 alt-bearing entries: **0 new duplicates, 0 items emptied**
(the second discharging `formObject`'s `text: minLength 1`). Both are
re-measured on the RULE's output, not only on a blanket strip.

### Forward hazard: the 18 starred alts

**Every starred `alt_headwords` item in the corpus also carries
parentheses** — `starOcc: 18, starEnt: 18, starWithParen: 18` — and they
are the same 18 the data architecture reports as *"529 Roman, 18
starred"*. After this batch all 18 are bare `*X`, a shape the source has
never held. A reconstructed-mark decomposer written to `^\*` works
either way; one written to the observed `*(` shape would silently stop
marking all 18. Asserted as a test: 0 bare `*X` before, **18 after**.

## 4. The entanglement the spec said would not exist

The spec's §1 stated the batch adds no `entangledWith` edge. It was
never measured. Both directions were, once the rules existed:

| Order | paren fires | phrase fires |
|---|---:|---:|
| paren → phrase | 652 | **236** |
| phrase → paren | 652 | 235 |

`B00780` holds `'(עֵין ב׳)'`, whose stub token is `'ב׳)'`; `expandStub`
refuses anything following the geresh. `A02403`'s `'אסת׳ )'` moves the
other way — the strip leaves a single token, so it LEAVES the phrase
population rather than entering it.

So `parenthesized-alt-headword` registers **strictly before**
`phrase-alt-headword-stub`, the edge is declared on both rows, and
`checkAdjacency()` holds them gap-free. The pin is written in the shape
of the DISAGREEMENT rather than as the winning order, so a later reorder
fails with the reason attached.

**The transferable part:** the spec's argument was about the rules
already in the registry and was silently generalised to the rules the
batch was about to add. An entanglement claim is a claim about a PAIR,
and a batch that ships two rules has a pair of its own.

## 5. `phrase-alt-headword-stub` — 236, and a ruling extended

The predicate must delete Roman homograph marks before counting tokens.
The naive reading (a geresh and a space) selects **410 entries / 419
occurrences**; the 175 extra are single-word stubs carrying a numeral
(`I` 92, `II` 77, `III` 5, `IV` 1) belonging to the parent row's job 1,
for which no deterministic expansion exists. Excluding them recovers
236 / 244 exactly, and the test asserts the mistake as well as the fix.

### Nine refusals, and six of them extend Brian's ruling of 2026-08-22

That ruling killed `abbrev-in-alt-headwords`'s already-written rule
because expansion there *"assumes the headword's remaining vowels are
the variant's"*. It names this row as surviving — *"substitutes a whole
headword token, no vowel inference"* — and that holds for 233 of the
244, because these stubs are not variant spellings OF the headword but
the headword itself standing inside a phrase.

**The measurement found an edge the ruling did not anticipate.** 58 of
the 244 stubs carry points on their final letter. In **52** the stub's
pointing matches the headword's exactly, so nothing is chosen. In **6**
it does not:

```
T00566  פּוּנְדְּקָא רְ׳   headword רִטִיבְתָּא   sheva against hiriq
M00643  הַר הַמּ׳       headword מוֹרִיָּה     dagesh present against absent
```

Substituting would override a vowel the source wrote **in this very
field** with a different one from another field. All six are REFUSED,
fail-closed: where the entry's two fields disagree about a vowel, the
rule declines rather than picks. The other three refusals are ambiguity
— two geresh tokens (`H00247`), a three-consonant truncation whose final
letter is not the headword's first (`A02403`), and one that needs the
paren rule first (`B00780`).

`transform:count` reads `DELTA -8` for this row, measured alone.

## 6. Records that were false or conditional

**`abbrev-fused-headword` (7 → 4 repaired).** The `reason` claimed *"In
all 7, prev_hw/next_hw alphabetize by the SECOND token, proving the
abbreviation is prefix debris."* `A02002` is `'*כְּפַר א׳ אָמוּס'`, between
`אֱמוּנָה` and `אֲמוֹרָא` — it alphabetizes by `אָמוּס`, its **third**
token, and its shape is the toponym *Kfar Ammus* with its interior token
stubbed: `phrase-alt-headword-stub`'s shape in the `headword` field.
Refused by requiring the geresh token to come first.

**`abbrev-headword-stub` (34) — withdrawn to `judgment`, ruled by Brian
2026-08-28.** The row's own `reason` made itself conditional on a
disposition that was never upheld. The audit measured all four candidate
sources for the elided tail:

| Source | Members |
|---|---:|
| An `alt_headwords` item extending the stem | **4** (11.8%) |
| An alt item that does not extend the stem | 4 |
| Neither `alt_headwords` nor `refs` | 4 |
| `refs` / anchors — naming the redirect TARGET, a different lemma | 26 |

The parent row was withdrawn at 65.5%, and the shortfall here is
structural rather than a threshold miss: **the stub IS the headword**,
so no fuller spelling of the lexeme exists in the entry by construction.

The audit also **confirms the row's two self-linkers at exactly two**,
and finds they are LIVE definition anchors rather than `refs[]` entries
— `D00826` reads `', v. <a … data-ref="Jastrow, דִּלָט׳ 1">דִּילָט׳</a>'`,
so a reader clicks *"see X"* and returns to the same entry. **That
defect is owned by no row**, is a link defect rather than a
headword-field one, and is recorded for when the link family is next
opened. A mark-blind predicate returns three by pulling in `S01151`,
whose ref is the real homograph `קִיר I`; the row's count was right and
a looser predicate is what makes it look wrong.

**The spec's own sub-shape table**, written at the start of this batch,
counted one bucket in groups while the others counted occurrences and
omitted six items. Corrected in place with the retraction attached.

## 7. A whole batch under one gate, and a new classification

Every rule here edits `headword`, `alt_headwords` or
`content.morphology`, none of which carries a tag anywhere in this
corpus. `markup.ts` has no delta to compare and `link-target.ts` is
never reached: **`no-new-text.ts` was the only live gate for the entire
batch.**

That could have been handled by adding four ids to `NEITHER`, and it
would have been wrong. `NEITHER`'s value is that its members
*demonstrably edit adjacent to* anchors and are measured not to break
them — explicitly *not* rules *"trivially incapable"* of it. These four
are exactly the trivial case, so they got an eighth class, **`FIELD`**,
whose membership is earned by its own corpus assertion: over all 32,512
entries, no value these rules read or write ever contains a `<`. A
future member that edited a definition fails there rather than
inheriting an exemption.

## 8. Rewriting a headword breaks the links that name it

**The sharpest finding of the batch, and it was caught by a pin rather
than by an argument.** `abbrevFusedHeadword` rewrites headwords; two of
them are named by an anchor in a DIFFERENT entry:

```
K00108 anchor  data-ref="Jastrow, כִּדְ׳ כַּדְבוּבָא 1"   → K00107
P00132 anchor  data-ref="Jastrow, עָ׳ עַדְיָא 1"       → P00137
```

`body/pipeline-links.test.ts`'s absolute pin fell from **71,385 to
71,383**. Its differential assertion — *"gains exactly 90 resolving
targets and loses none"* — **stayed green**, because the rule under test
sits on both sides of that comparison. The absolute pin is the only
thing in the suite that could see it, and its own comment says it exists
for exactly this reason.

A dead link is worse for a reader than an awkward headword, so both are
declined and the rule ships for **4 of 7**. The full repair is a
headword rewrite AND a retarget of the pointing anchor, which crosses
into `link-target.ts` and is therefore its own PR (Brian's ruling
2026-08-26, the #50 shape). `LINKED_HEADWORDS` is an enumerated
exception and is asserted equal to exactly the fused-shape headwords the
corpus targets, so a re-fetch that adds or removes a pointing anchor
fails a test rather than silently changing what ships.

**The generalisation, and it reaches past this batch: a rule that
rewrites `headword` is a link rule whether or not it touches an anchor.**
The corpus addresses entries BY HEADWORD STRING, so the field is a
target namespace and not only a display. Nothing in the `FIELD`
classification says so — those rules are exempt from the anchor
questions because they touch no markup, and this one broke links
without touching any.

## 8a. Forward hazard: 8 stale chain pointers

`abbrevFusedHeadword` rewrites 4 headwords and touches no neighbour's
pointer, leaving **exactly 8 stale `prev_hw`/`next_hw` values** — one on
each side of each repaired entry, perfectly uniform. The data
architecture's §5 gate walks that chain and compares against `headword`
AS A STRING; batch 3a left 68 entries diverging the same way, and this
is additive to that.

**`SourceEntry` does not model the chain at all** — `prev_hw` and
`next_hw` are in the JSONL and survive `readSourceEntries`, but the type
the migration reads has no such properties. Nothing in the type system
points at the field the gate walks, which is part of why the hazard is
easy to miss. The corpus test reads them through a narrow structural
type rather than widening a production type.

## 9. What none of this can see

**Nothing gates `alt_headwords` for meaning.** Every check in this batch
is arithmetic over codepoints and array lengths: counts, partitions,
multiset containment, duplicate detection. A rule that stripped the
correct delimiters from the wrong 654 items would pass all of them. The
same is true of the 236 substitutions — `copied` proves each string came
from the entry's own headword, not that the headword belonged in that
phrase.

What stands behind the meaning is the parent row's audit, which read
eight randomly drawn members in context, and this batch's refusals,
which decline wherever the data is ambiguous rather than choosing.

## 10. Open items

1. **`content.morphology` on 21 entries** stays wrong (`'f.'` on a
   masculine headword). Repairing it needs `allows: ['m.']`, which
   flattens to codepoints and would permit unlimited `m` and `.`
   anywhere in the rule's diff. Carried as a judgment item.
2. **The two self-terminating redirect anchors** (`D00826`, `S00462`)
   are a live rendered defect owned by no catalogue row.
3. **`A01480`'s optional-letter paren** wants an operation this batch
   does not have — arguably two index entries rather than one.
4. **`A02002`** is a phrase stub in the `headword` field; one member is
   not a population, and it is refused rather than expanded.
5. **`K00107` and `P00137`** need their headword repaired AND the
   anchor that names them retargeted, as one unit. Gate work, so its
   own PR.
6. **The `+4` gershayim**, recorded rather than open: `gershayimInBody`
   repairs an ASCII quote in a headword and `phraseAltHeadwordStub`
   then copies that headword into `alt_headwords`, duplicating the
   mark. The phrase rule run alone against raw source adds ZERO — only
   the composed pipeline can see it, which is batch 3a's finding
   recurring in the direction it predicted. All four are
   `copied`-declared and verified.
