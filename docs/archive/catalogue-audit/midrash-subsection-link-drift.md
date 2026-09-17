# Audit — `midrash-subsection-link-drift` (catalogued 3,941)

**Verdict: RE-SCOPE to 188 occurrences / 179 entries.** ~75% of the
population carries a sub-section that is *correct and more precise than
the display* — Sefaria's segment addressing, not drift. A transform
written against this row (strip the sub-section, or flag it for review)
would degrade roughly 3,500 correct links to chapter granularity.

## Probe and raw figure

Reading taken from the description alone: anchors whose *display* is a
Midrash section citation `<Book> R. s. <N>`, whose *data-ref* is a
Sefaria Midrash Rabbah ref carrying a `:sub-section` beyond the section
number.

| Figure | Value |
|---|---|
| displays matching `R. s. N` | 8,676 |
| …with a Rabbah data-ref | 7,909 |
| **members (occurrences)** | **4,821** |
| **members (distinct entries)** | **3,559** |
| distinct (entry, sense) units | 3,897 |

**3,941 could not be reproduced.** No natural variant lands on it: 3,559
entries / 3,897 sense-units / 4,821 occurrences / 4,779 distinct
(rid,ref) / 4,237 top-level-sense-only / 5,519 if any book counts /
8,118 if the display filter is dropped. The catalogued figure sits
between the entry and occurrence counts, closest to sense-units (3,897,
−1.1%). **Recorded as a discrepancy; 3,941 was not adopted.**

Structural facts: all 4,821 refs have exactly 2 numeric components; the
ref's chapter equals the display's section in 4,820/4,821; books are
Bereishit 2,235 / Vayikra 938 / Bamidbar 854 / Shemot 633 / Devarim 157
/ Ruth 4. Sub-section rate is ~60% uniformly across all six books, so it
is not a book-level property.

## Does this population have more than one job? — at least four

Partitioned by what immediately follows `</a>` in the stored HTML:

| Job | Occ | Verdict |
|---|---:|---|
| **A. `<sup>N</sup>` follows and matches the ref's sub** | 67 | **CONVENTION** — and the row's premise is *false* here: the display **does** show the sub-section, as Jastrow's printed superscript |
| **A′. `<sup>N</sup>` follows and contradicts the ref's sub** | 38 | DEFECT — but owned by a neighbouring row |
| **B. `beg.` / `end` follows** | 654 (321/333) | **mostly CONVENTION** — the sub *encodes* the qualifier: `beg.` → sub ≤2 in 210/321 (65%); `end` → sub ∈ {last, last−1} in 270/333 (81%) |
| **C. plain, quote follows** | 1,890 | mixed — ~68% correct (CONVENTION), ~21% wrong (DEFECT) |
| **C′. plain, no quote at all** | 2,172 | **INDETERMINATE** — nothing in corpus or display to resolve against |
| **D. bare digit follows (anchor truncated mid-numeral)** | 1 | DEFECT, different kind |

**The dominant job is precision enrichment, not drift.** Sefaria Midrash
Rabbah is segment-addressed (`Bereshit Rabbah 53:13`); the linker
resolved each citation to the paragraph actually quoted. Three pieces of
evidence that it is content-driven rather than a fixed collapse:

- **215 of 225 distinct display strings map to more than one
  sub-section** (`Gen. R. s. 53` → 11 different paragraphs across the
  corpus). Only 15 of 4,821 occurrences sit under a single-valued
  display.
- **Sub `:1` is only 9.4%** — no default-fill signature. Quote-bearing
  and quote-less members have statistically identical sub distributions
  (7.1% vs 7.0% at `:1`; mean 8.03 vs 8.14).
- **Verified against Sefaria's own Hebrew text** (v3 API,
  `return_format=text_only`, matching Jastrow's quoted Hebrew after
  niqqud-stripping, skipping geresh-abbreviated words): a random link
  would hit ~10%; **the observed hit rate is 68%.**

## Sample read

`random.seed(20260818); random.sample(range(4821), 12)` — uniform, drawn
before any class partition existed. Each read in flattened sense
context, then adjudicated against the Sefaria chapter text.

| rid | display | data-ref | Judgement |
|---|---|---|---|
| N00935 | `Gen. R. s. 63` | Bereishit Rabbah 63:8 | citation in a parenthesis, no quote span — unverifiable |
| D00635 | `Gen. R. s. 22` | Bereishit Rabbah 22:7 | quote not found in ch. 22 (13 segs) — indeterminate |
| R00667 | `Num. R. s. 19` | Bamidbar Rabbah 19:3 | parallel-citation chain, no quote — unverifiable |
| J00426 | `Lev. R. s. 9` | Vayikra Rabbah 9:6 | bare name-index citation — unverifiable |
| M01759 | `Num. R. s. 13` | Bamidbar Rabbah 13:20 | quote `שלשלמה הביאו האומות מ׳` is in **13:14** — **DEFECT** |
| S01250 | `Gen. R. s. 23, end` | Bereishit Rabbah 23:7 | ch. 23 has exactly 7 segs; quote in seg 7 — **CORRECT, and the sub encodes the visible "end"** |
| N00175 | `Lev. R. s. 34` | Vayikra Rabbah 34:7 | quote is a cross-ref, not a passage — unverifiable |
| S01883 | `Gen. R. s. 96` | Bereishit Rabbah 96:4 | followed by `(ref. to ויקרבו…)`, not a quote span — unverifiable |
| O00085 | `Gen. R. s. 34` | Bereishit Rabbah 34:15 | reads `s. 34; s. 38 הוה מסבר ליה…` — the quote belongs to **s. 38**; the `:15` on s. 34 is asserted with nothing to support it |
| J00544 | `Gen. R. s. 56` | Bereishit Rabbah 56:4 | citation is a *mention* inside `(quoted in 'Rashi' to …)` — the `:4` invents a locus for a bibliographic mention |
| V00547 | `Num. R. s. 18` | Bamidbar Rabbah 18:3 | carries `<sup>3</sup>`; sup = ref sub; quote in seg 3 — **CORRECT and displayed** |
| M02671 | `Ex. R. s. 1` | Shemot Rabbah 1:25 | `Ex. R. s. 1; a. v. fr.` — no quote — unverifiable |

Two additional systematic samples, same method (`seed=7`, `seed=13`),
restricted to members with a resolvable Hebrew quote span:

- **plain, n=100** → 68 SUB_CORRECT, 21 SUB_WRONG, 11 quote-not-found
- **`beg.`/`end`, n=90** → 59 SUB_CORRECT, 22 SUB_WRONG, 9 not-found
- **pooled wrong rate among adjudicable: 43/170 = 25.3%** (95% CI ≈
  19–32%)

Five SUB_WRONG calls were hand-verified against the raw Hebrew to rule
out matcher error — all single, unambiguous hits in a different
paragraph (D00411's quote `אידחילת מיניה` is in Vayikra Rabbah **9:9**,
linked 9:8 — and the corpus links the *adjacent* quote from T01051
correctly to 9:9).

## Letter A

**372 occurrences / 286 entries** = 7.7% of occurrences against letter
A's 10.6% corpus share. Present and substantial. Breakdown: 194
plain-bare, 108 plain-quoted, 70 `beg./end`, **0 `<sup>`**. The zero is
real — the printed-superscript notation is confined to letters T (6),
U (24), V (8), matching the neighbouring row's own note. In the
re-scoped subset, letter A holds 23 of 179 entries (12.8%).

## Disposition

**RE-SCOPE to the self-evidencing subset** — links whose sub-section
contradicts a locus the display *does* state, or that cannot exist.
Fully deterministic, no external adjudication. Excludes the `<sup>`
class, which is owned elsewhere.

| Criterion | Occ | Entries |
|---|---:|---:|
| sub-section exceeds the chapter's paragraph count (Sefaria `/api/shape`) | 16 | 16 |
| display says `beg.` but sub ≥ 3 | 111 | 105 |
| display says `end` but sub < last−1 | 61 | 60 |
| **union** | **188** | **179** |

The `beg.`-but-deep criterion was validated: a 40-member random sample
(30 adjudicable) was **80% wrong** against Sefaria (24/30) versus the
25% baseline.

New description: *Midrash "X R. s. N" link whose Sefaria :sub-section
contradicts the locus the display itself states — "beg." resolved to
paragraph 3 or later, "end" resolved before the chapter's penultimate
paragraph, or a sub-section past the chapter's end.*

**Secondary figure to record, not to transform against:** a further
**~1,190 occurrences (95% CI ≈ 910–1,530)** across the non-`<sup>`
population carry a sub-section naming the wrong paragraph. These are
real defects but are **not identifiable from the corpus alone** — each
requires matching the quoted Hebrew against the Sefaria chapter text.
2,172 members (45%) have no quote at all and are unverifiable by any
available means.

## What would have falsified this

The load-bearing claim is "the sub-section is correct precision, not
drift". It would have been overturned by **the sub-section being a fixed
or defaulted value** — one `X R. s. N` display always resolving to the
same paragraph regardless of what is quoted, or a heavy pile-up at `:1`.
Both were checked explicitly:

- display-string → sub fan-out: **215 of 225 display strings map to ≥2
  distinct subs**; only 15 of 4,821 occurrences sit under a
  single-valued display. Not a collapse.
- `:1` share: **9.4%**, identical between quote-bearing (7.1%) and
  quote-less (7.0%) members. Not a default-fill.
- content agreement: **68% of quote-bearing plain members land on the
  exact paragraph containing the quote**, against a ~10% random
  baseline.

Had any gone the other way, this would have been a genuine large-N
defect and the recommendation would have been COUNT CONFIRMED or
RE-MEASURE upward.

**Could not determine:** whether the app's renderer emits `<sup>`. The
front-end source is not in this repository. The sub-section digit *is*
present in the stored display HTML for 105 members, so "the display
never shows it" is false at the data layer for those regardless.

## Overlap

- **`superscript-subsection-stranded-outside-anchor` (160)** — owns the
  entire `<sup>` class (105 occurrences, including all 38 contradiction
  cases). **Worth flagging to that row:** 12 of its contradiction cases
  were adjudicated against Sefaria, and **the printed superscript is
  right and the link's sub wrong in 9, the reverse in 2, both plausible
  in 1** — so that row's members carry their own correct answer and are
  deterministically fixable.

  > **RETRACTED 2026-08-26 (impl/phase-2-batch-4).** The conclusion
  > drawn above — *"that row's members carry their own correct answer
  > and are deterministically fixable"* — **does not follow from this
  > audit's own figures and is withdrawn.** 12 of the 38 occurrences
  > were adjudicated, not 38, so 26 carry an answer nobody read; and
  > within the 12 the print was wrong in 2 and undecidable in 1, so even
  > the read slice is not self-answering. Measured across all 38: the
  > deltas between the printed superscript and the ref's sub-section
  > spread −17 to +20, modal −1 at 9 of 38 occurrences (24%), 26 below
  > and 12 above — no constant offset and no dominant direction.
  > Brian ruled on 2026-08-26 that the 38 occ / 33 ent become their own
  > row, `superscript-subsection-contradicts-link-sub-section`, **route
  > `judgment`**. The parent row keeps a BOUNDARY MOVE that touches no
  > `href` and no `data-ref`; **no shipped rule writes a sub-section
  > into a `data-ref`**, which would be a target edit needing a
  > `link-target.ts` case and a maintainer ruling. See
  > `data/patches/catalogue-audit/superscript-subsection-stranded.md`.
- **`citation-number-truncated-outside-anchor` (14, r2)** — owns the
  single bare-digit member R00351 (`>Gen. R. s. 1</a>8`, ref Bereishit
  Rabbah 18:1).
- **`midrash-section-cite-as-bible-chapter` (255)** — adjacent failure
  mode on the same citation class (section number read as a Bible
  chapter); disjoint, since all members here have Rabbah refs.
- **`post-anchor-numeral-mismatch` (91, r2)** — same `</a>` + numeral
  shape, but Roman numerals; disjoint.

No overlap with `same-anchor-positional-mislink`,
`homograph-collapse-link`, or the `refs[]` rows.
