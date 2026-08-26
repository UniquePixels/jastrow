# Audit — `citation-quote-seam-period` (catalogued 43 entries)

**Verdict: WITHDRAWN from `transform` to `judgment`.** The row's
predicate now reproduces exactly and its null model is strong, but the
period is NOT unambiguously surplus: at least one member's period is
load-bearing, three more are ambiguous the same way, and a second
reading — the period is print's own and a form label was dropped after
it — survives for all seven of the non-quotation members.

`corpusCount` UNCHANGED at **43 entries / 44 occurrences**.

## The predicate, pinned

The row was catalogued at "44 occurrences / 43 entries" with no probe
published. The naive reading of its description — a period between a
closing anchor and an opening `dir="rtl"` span — gives:

```text
</a>. <span dir="rtl">                          54 occurrences / 53 entries
  … anchor is a CITATION (data-ref not "Jastrow, …")   44 / 43   <- catalogued
  … anchor is a Jastrow cross-reference                10 / 10
```

**44 / 43 to the unit.** The ten excluded are dictionary
cross-reference anchors (`= <a>גִּזְבָּר</a>. Dan. III, 2`), not
citations introducing a quotation, and are not this row's population.

## Null model

| Gap between a citation anchor and the `dir="rtl"` span it precedes | Occ |
|---|---|
| `␣` — no punctuation | **33,223** |
| `)␣` | 3,960 |
| `␣bot.␣` / `␣top␣` / `,␣end␣` — locators | 3,473 |
| `.—Pl.␣` | 496 |
| `.␣` — this row | **44** |

0.13%, as catalogued.

## All 44 read, classified mechanically

The discriminator: does an English translation follow the Hebrew span?
If it does, the Hebrew is a QUOTATION of the preceding citation and
nothing belongs between them but a space. If it does not, the Hebrew is
doing something else and the period may be ending a preceding
statement.

| | Occ |
|---|---|
| Translation follows — quotation shape, period looks surplus | **37** |
| No translation — the Hebrew is a form, a variant, or a gloss note | **7** |

The seven: A00714, B01136, B01377, C00278, J00283, M02503, M00701.

Ten members were read in full rather than in window — A00198, A00714,
A02350, B01136, C00278, H01536, J00283, M00701, M02488, and B00932
(the last one a control: it sits in the naive 54 and NOT in the 44, and
confirms the citation-anchor restriction cuts the right ten).

## The load-bearing member

**A00714**, rendered:

> …—Pl. אוּמִּין. Targ. Y. Gen. XXV, 3. **Gen. R. s. 61.** אוּמַּיָּא־,
> אוּמַּיָּיא; אוּמֵּי. Targ. Ps. CXVIII, 1.

The Hebrew after that period is a plural-form VARIANT LIST, not a
quotation of Gen. R. s. 61. The entry alternates FORM → CITATIONS →
FORM → CITATIONS, and the period is what ends the first form's citation
list. Delete it and the entry reads as though `אוּמַּיָּא־` were quoted
from Gen. R. s. 61 — a form heading welded onto a citation, which is
not a repair but a new defect.

B01377 (`Sabb. 25ᵇ. בנות אזנים, v. אֹזֶן`), M00701 and M02503 are
ambiguous in the same way: the Hebrew is followed by a cross-reference
or an editorial note, not a translation.

## The second reading, which cannot be excluded from the entry

The corpus writes `.—Pl. ` **496** times at exactly this seam. Drop
`—Pl.` from `</a>.—Pl. <span>` and what remains is `</a>. <span>` —
this row's shape, with the period print's own and a LABEL missing
rather than a period surplus. Nothing inside an entry distinguishes
"surplus period" from "dropped label" for any of the seven.

## The subset this audit hands forward without writing

The 37 translated members are a mechanical predicate, the defect is
visible in rendered text, and a deletion for them alone would be
writable. It is not written here, for two reasons: the task's own rule
is that one load-bearing member routes the row, and re-cutting a row
until a shippable subset falls out is the move this branch has spent
three tasks correcting. Proposed id if a maintainer wants it:
`citation-quote-seam-period-quoted` (37 occurrences / 37 entries).

## Which test this row failed

**No repair exists for the row as catalogued** — the same one of the
two tests named in `batch-3b-withdrawals.md` that row's summary
records. Not "no defect" and not "no writable rule" — a rule is
writable for 37 of 44; what is missing is a reason to believe the
period is surplus in the other seven, and the row is one row.

## What a re-run will find

44 occurrences / 43 entries under the citation-anchor predicate; 54/53
without it; 37 followed by an English translation and 7 not; 33,223
clean seams; 496 `.—Pl. ` seams.
