# Audit — `post-anchor-numeral-duplication` (catalogued 11)

**Which copy is the intruder?** The row's own record says nobody
established one, and therefore proposed no delete. **This audit does not
overturn that, but it narrows it.** Measurement supplies two facts the
row did not have, and both point the same way — at the *bare trailing*
copy:

- Deleting the bare copy leaves `<a>…חַבְלָא I</a>.`, a shape attested
  **681 occurrences** corpus-wide. Deleting the display numeral leaves
  `<a>…חַבְלָא</a>. I.`, a shape attested **1 occurrence** corpus-wide
  (`K00130`, itself unexplained). A **681 : 1** asymmetry.
- In **2 of the 11**, the anchor's `data-ref` carries a superscript
  homograph marker (`²`) where the display carries `I` — `O01416`
  (`Jastrow, סָפַר ² 1` / display `סַפְרָא I`) and `O00123`
  (`Jastrow, סְגֵי ² 1` / display `סְגֵי I`). The display numeral
  therefore **disagrees with the ref's own numeral** in those two, so it
  cannot have been copied from the ref. It is print text.

**But the mechanism is still undetermined, and that is why this audit
proposes no delete either.** All 11 duplicates are numeral `I` against a
clean distribution in which `II` is the *most* common numeral. Neither
candidate mechanism predicts that skew (see "The open problem"). A
transform that deletes bytes on an unexplained mechanism is the thing
this batch's own standard forbids.

**Recommendation: withdraw to `judgment` (11 occurrences / 11 entries),
with this audit published and the 681 : 1 asymmetry recorded in the
row** so a maintainer ruling naming the bare copy as the intruder is a
one-sentence decision rather than a fresh investigation.

**The alternative, stated:** rule now that the bare trailing copy is the
intruder and ship a delete rule for all 11 occurrences. It is defensible
on the two facts above in a way it was not when the row was written, and
it is cheap to reverse — 11 entries, on a pinned snapshot. What it costs
if wrong is 11 print-sourced numerals silently removed, with no
surviving trace of the duplication that would let a later reader notice.

Everything below is measured on the pinned snapshot
(`data/source/jastrow-dictionary.jsonl`, sha256 `4c64ff03…`, verified
against `data/patches/snapshot.lock` before the run), walking every
`content.senses[].definition` recursively through `sense.senses` across
all 32,512 entries. **`occ` is occurrences, `ent` is distinct entries.**

## Claim 1 — the defect subset: 11 occ / 11 ent. **Reproduces exactly.**

Predicate: a close tag whose display ends in a Roman numeral, followed
by separator `.`, the **same** numeral, and nothing else to the end of
the definition.

| Figure | Row claims | Measured | |
|---|---|---|---|
| occurrences | 11 | **11** | ✓ |
| entries | 11 | **11** | ✓ |
| via `</a>` | 10 | **10** | ✓ |
| via unlinked `</span>` | 1 | **1** | ✓ |
| numeral `I` | all | **11 of 11** | ✓ |
| definition-terminal | all | **11 of 11** | ✓ |
| letter `A` | 0 | **0** | ✓ |
| letter `H` | 3 | **3** | ✓ |

The eleven rids, named:

| Close tag | rids |
|---|---|
| `</a>` (10) | `H00085`, `I00619`, `H01073`, `H01370`, `M02691`, `O01416`, `N00957`, `O00123`, `R00702`, `U01778` |
| `</span>` (1) | `P01496` |

Exactly the ten and the one the row names, with no twelfth candidate.
The subset is also **robust to the predicate**: every family variant
tried below returns the same 11 rids.

Representative occurrences, verbatim from the snapshot:

```html
H00085  <i>injury</i>, v. <a … data-ref="Jastrow, חַבְלָא I 1"><span dir="rtl">חַבְלָא</span> I</a>. I.
M02691  <i>bitter</i>, v. <a … data-ref="Jastrow, מָרִיר I 1"><span dir="rtl">מָרִיר</span> I</a>. I.
P01496  <i>to pervert</i>, v. <span dir="rtl">עָשִׁיק I</span>. I.
```

**`P01496` is structurally unlike the other ten and the row does not say
so.** In the ten anchor cases the numeral sits *outside* the `dir="rtl"`
span and *inside* the anchor (`<span>חַבְלָא</span> I</a>`); in `P01496`
it sits *inside* the span (`<span dir="rtl">עָשִׁיק I</span>`) and there
is no anchor at all. Any delete rule would need two different edits, not
one — a fact that matters to the alternative above.

## Claim 2 — the separator census. **Does not reproduce, and the two prior statements of it disagree with each other.**

The row's `reason` says the raw family is **87 hits** splitting **three
ways**: comma + different numerals 59, empty 16, period + same numeral
11 (= 86). The design spec §4.1 says it splits **four ways**: comma 56,
empty 16, period 11, semicolon 2 (= 85), and calls that "exactly as
recorded". It is not what the row records. Neither total is what the
corpus holds.

The family total is **predicate-sensitive**, and the sensitivity is
itself the finding. Measured over definitions:

| Family predicate | occ | `,` | empty | `.` | `;` |
|---|---:|---:|---:|---:|---:|
| display **ends** in a numeral, `</a>` only | 82 | 55 | 16 | 11 | 0 |
| display **ends** in a numeral, `</a>` + `</span>` | 88 | 60 | 16 | 12 | 0 |
| display **contains** a numeral, `</a>` only | **88** | 57 | 18 | 11 | **2** |
| display **contains** a numeral, `</a>` + `</span>` | 94 | 62 | 18 | 12 | 2 |
| row claims | 87 | 59 | 16 | 11 | — |
| spec §4.1 claims | (85) | 56 | 16 | 11 | 2 |

**The semicolon arm exists only under "contains".** Its two members are
`A02964` (display `Y. Sot. I, 17ᵇ`, bare `IX`) and `K00297` (display
`Y. Snh. IV, beg. 22ᵃ`, bare `III`) — displays whose numeral is *medial*,
not terminal. So the spec's `;` 2 is real and recoverable, and it pins
the family predicate as "contains": under "ends in", the semicolon count
is **0 corpus-wide** (5 close-tag-then-semicolon-then-numeral hits exist,
none with a display numeral). Under that same "contains" predicate the
comma arm is **57**, not 56, and the empty arm **18**, not 16.

**No tested predicate returns 87, 86, or 85.** The nearest are 88 occ /
86 ent — 87 sits between the occurrence and entry counts of the same
measurement, the same signature `anchor-swallows-close-paren`'s 494
carried. Recorded as a discrepancy; **87 was not adopted**, and neither
was 85.

Two sub-classes neither census names, both under the "contains"
predicate:

- **empty separator + SAME numeral, 5 occurrences.** Four of them
  (`B00720` `Pes. I</a>I, s. 13`; `M01983` `R. Hash. I</a>I (I), 2`;
  `O01024` `Ab. Zar. I</a>I, end`; `V00695` `Ḥag. I</a>I, 77ᵈ bot.`) are
  not duplication at all — the anchor is **truncated mid-numeral**,
  `Pes. II` split across the closing tag. They belong with
  `citation-number-truncated-outside-anchor`, not here. The fifth
  (`M01494`, display `Lev. VIII). Y. Yoma I, 38`) is a false positive of
  the "contains" predicate alone: its display numeral is medial.
- **period + DIFFERENT numeral, 1 occurrence** (`H00147`,
  `…חַגָּא II</a>. V. Fr. M’bo, p. 79ᵇ`). The `V.` is the abbreviation
  *vide*, not a Roman numeral — a false positive of any numeral-shaped
  predicate, and the reason the defect subset needs the
  same-numeral test as well as the period test.

**The row's own framing survives this.** Its load-bearing claim is that
the defect is isolated by the **conjunction** of all three tests
(period + same numeral + definition-terminal), not by any one of them.
That is exactly what the table shows: the period arm alone contains a
false positive, the same-numeral test alone contains 5 truncations, and
only the conjunction lands on the 11.

## Claim 3 — the clean numeral distribution. **Three of four numerals reproduce exactly; `I` does not.**

The "correct rendering": a definition-terminal `</a>` whose display ends
in a Roman numeral, with nothing following but the terminal period.

| Numeral | Row claims | Measured |
|---|---:|---:|
| `II` | 347 | **347** ✓ |
| `I` | 279 | **281** ✗ (+2) |
| `III` | 47 | **47** ✓ |
| `IV` | 6 | **6** ✓ |
| **`I`–`IV` subtotal** | **679** | **681** |
| `V`–`XXXIV` (13 further numerals) | — | 16 |
| **all numerals** | — | **697** |

The row's 679 is the `I`–`IV` restriction, which it does not state, and
its `I` count is 2 short. The distribution's *shape* — `II` dominant,
`I` second, a long thin tail — reproduces unchanged, and the shape is
what the open problem rests on.

## Claim 4 — the null model. **The composite reproduces exactly; its two halves do not.**

The row: *"the correct rendering has 679 definition-terminal occurrences
and terminal bare ' I.' arising for unrelated reasons is 5, so 11
against 684 is a 1.6% residue."*

Measured: definition-terminal bare Roman numerals not emitted by a close
tag number **14** with numeral `I`, of which **11 are the defect
itself**. The unrelated residue is therefore **3**, not 5 — `A00028`
(`…Midr. Sam. ch. I.`, a chapter number), `B00883` and `K00130`.

**681 + 3 = 684.** The row's **679 + 5 = 684**. The base reproduces to
the unit; only its partition moved. **11 / 684 = 1.61%** — the residue
figure stands exactly as recorded.

## The open problem — unchanged, and it is what blocks the delete

Under numeral-blind duplication, p(`I`) = 281 / 681 = 0.4126, so

> **P(all 11 duplicates are `I`) = 0.4126¹¹ = 5.9 × 10⁻⁵**

reproducing the row's `p ≈ 5e-5` (its own figures give 5.6 × 10⁻⁵). The
skew is real at either count.

The consequence is the row's, restated with the measurement behind it:

- **"The wrapper copied the display token."** Predicts the duplicate
  numeral tracks whatever the display holds — so **`II` cases, 347 of
  them available**. There are **none**. Dead.
- **"The linker appended its resolved homograph numeral to the
  display."** Predicts the display numeral always equals the ref's
  numeral. It does not: `O01416` and `O00123` carry `²` in the ref
  against `I` in the display. Dead, and dead on this row's own members
  rather than by analogy.

So both mechanisms that would name a copy are excluded, and the copy
that the **shape asymmetry** names (681 : 1) is named by attestation
rather than by mechanism. That is a strong prior, not a determination.

**What would settle it:** the print facsimile for any one of the eleven.
`v. חַבְלָא I.` printed once ends the question. This audit cannot reach
it, and no corpus-internal evidence substitutes for it — every
corpus-internal test above is a test of the *linker's* behaviour, and
the question is what the *page* says.

## Verdict

`route: judgment`, 11 occurrences / 11 entries, pending a maintainer
ruling that names the intruder. **The ruling is not written into
`patterns.jsonl` by this audit** — it is Brian's to make, and a `route`
change ahead of it would be exactly the silence module design §6 forbids.

Count corrections owed to the row's `reason` if the ruling lands, none
of which change `corpusCount` (11 is exact on both axes):

- the raw family is **88 occ / 86 ent** under the predicate that yields
  the spec's semicolon arm, not 87;
- the separator census is `,` 57 / empty 18 / `.` 11 / `;` 2, not
  59 / 16 / 11 and not 56 / 16 / 11 / 2;
- the clean `I` count is **281**, the `I`–`IV` base **681**;
- the unrelated terminal-`I` residue is **3**, not 5 — with **684** and
  **1.6%** unchanged.
