# Audit — `reversed-hebrew-phrase` (27 → 18)

**RULED 2026-08-30 (Brian): WITHDRAWN TO `judgment`,** `route:
judgment` in `patterns.jsonl`, the id taken out of `PENDING` in
`admin/pipeline/transform/registry.ts`. `status` stays `candidate` and
`corpusCount` is left at the catalogued 27 with the corrected figure in
the `reason`, as `empty-stem-section` and `homograph-numeral-mismatch`
were left.

**Two things are wrong with this row, and they are independent:** the
count is an artifact of the unit it was measured in, and the mechanism
it names is not the mechanism in the data. Neither is why it was
withdrawn. It was withdrawn because no individual repair has evidence
of its own.

## 1. The count is 18, not 27, and the difference is the unit

The row counts "runs". A run is not a thing the source marks; it has to
be defined, and the definition decides the count.

Measured at the unit a **reader** sees — the text content of one
`<span dir="rtl">` element, which is how the corpus delimits a Hebrew
quotation — over all 32,512 entries at the composed stage:

| | |
|---|---:|
| Multi-word rtl spans | **61,539** |
| Ending in the particle `וכ׳` only | **17,092** |
| **Beginning with it only** | **18** |
| Carrying it at both ends | 3 |
| Carrying it only medially | 49 |

The catalogued 27 comes from whitespace-delimited runs over text with
markup **stripped**, and that does two things at once:

- **It merges spans print separates.** A trailing `וכ׳</span>` followed
  by `<span dir="rtl">חלה` strips to `וכ׳ חלה`, one "run" that was two,
  and it reads as particle-leading.
- **It splits spans at an internal ellipsis.** `תבור … וכ׳ מאספמיא` is
  one span in which the particle correctly trails its own clause before
  an ellipsis-resumed one. Stripped and split on whitespace, the tail
  `וכ׳ מאספמיא` reads as a fresh particle-leading run. `K01233`,
  `K01244` and `K01275` are all this shape.

Of the 27 whitespace runs, **12 have a tag between the particle and the
next word** in the raw markup. Those twelve were never one phrase.

## 2. The mechanism is rotation, and the row is named for reversal

The row's description is "short bare-Hebrew phrase stored with its words
in reverse of the corpus's order (bidi/visual-order extraction
artifact)", and its arm (a) is built on that: two-word runs whose
*reversed bigram* is attested.

For the 18, full reversal produces word salad. `H00087`:

```text
stored     וכ׳ אין מודדין אלא בח׳
reversed   בח׳ אלא מודדין אין וכ׳     <- not Hebrew
rotated    אין מודדין אלא בח׳ וכ׳
```

The English immediately beside it in the same definition reads
"Sabbath distances must be measured with a rope of fifty cubits'
length", which is `אין מודדין אלא בח׳` plus a trailing "and so forth".
The damage is that **one token is at the wrong end**, not that the
phrase is backwards.

Both shapes may well exist upstream — arm (a)'s two-word bigrams
(`התורה מן` for `מן התורה`) are plausibly true reversals. But they are
**two mechanisms in one row**, and the row keeps the count of one and
the description of the other.

## 3. Why no rule ships: 17 of the 18 have no witness

Each particle-leading span's body was tested both ways as a substring
across all 61,539 spans — is `<body> וכ׳` better attested than
`וכ׳ <body>`?

| | |
|---|---:|
| Rotated form better attested | **1 of 18** |
| Current order better attested | 15 of 18 |
| Tied | 2 of 18 |

The single supported member is `K00761` — body `הוא`, attested 53 times
trailing against 1 leading — and it is the row's own cited example. The
other 17 bodies occur **exactly once** in the corpus: their own damaged
instance. The "current order better attested" column is that same
instance counting itself, not evidence for the status quo.

So every repair but one would rest solely on the aggregate positional
convention — 18 against 17,092 — with **nothing in its own entry
witnessing it**. That is precisely the standard `continuationMarkerDash`
refused in batch 7, where the rule shipped its 14 witnessed members and
left 22 unwitnessed on the row rather than acting on the population
argument alone.

A rule for `K00761` alone was considered and rejected: it repairs one
entry and leaves the row blocking.

## 4. The row's claimed corroboration witnesses the defect, not the fix

> Corroborated independently by `quotes[]`, which mirrors the inverted
> body order (`A00172`, `A00188`).

`A00188`'s `quotes[]` is `[[null, "הסופרים אָבָק", null]]` — the reverse
of `אבק הסופרים`, "dust of the scribes". So `quotes[]` carries the same
inversion the body does.

That is corroboration that **the defect is real and upstream of both
fields**, which is worth having. It is not corroboration of any repair:
two fields agreeing on a wrong order is one extraction pass reaching two
destinations, not two witnesses to a correct one. The row reads it as
support for the transform; it is support for the *finding*.

## 5. Why `judgment` and not a discard

There is a defect. `Erub. V, 4` is followed by Hebrew opening on "and
so forth" and glossed in English without it, and a Hebrew reader sees
that. Asserting no defect exists would be false.

What cannot be stated is the repair, per member. `judgment` is the right
route for exactly that: the row stays surfaced, with its count corrected
to 18, its mechanism corrected to rotation, and its blocker removed.

## What would reopen it as a transform

Either of:

- **A per-entry witness.** If the corpus grows a second instance of any
  of the 17 bodies in the trailing order, that member becomes
  witnessable on `continuationMarkerDash`'s own terms.
- **A ruling that the positional convention alone suffices.** 18 against
  17,092 is a stronger ratio than `sectionBreakTerminator`'s 11 against
  7,250, and rotation is a pure MOVE — it invents nothing, so it needs
  neither `allows` nor `copied` and passes both text gates trivially.
  What it lacks is not gate coverage but per-instance evidence, and that
  is a maintainer's call rather than a measurement.
