# Jastrow page/column index

The first headword beginning in each printed column of Marcus Jastrow's
*Dictionary of the Targumim…* (London: Luzac, 1903), plus the page and column
of every one of the 32,512 headwords.

Built by `admin/pipeline/page-index/build.ts`. Checked by
`admin/pipeline/page-index/verify.ts`.

## Files

| File | Rows | What it is |
|---|---|---|
| `columns.jsonl` | 3,370 | One record per printed column — **the deliverable** |
| `entries.jsonl` | 32,512 | Page + column for every headword |
| `letters.json` | 22 | Where each Hebrew letter's section starts, to column granularity |
| `build-report.json` | — | Counts and derived offsets from the last build |

### `columns.jsonl`

```json
{"column":"a","confidence":"high","continuedFrom":"C00540","guideOcr":"גורדייתא",
 "headword":"גּוֹרְדַּיְיתָא","leaf":250,"letter":"ג","letterChange":false,
 "page":227,"rid":"C00541","volume":1}
```

| Field | Meaning |
|---|---|
| `page` | Printed page number, 1–1704 |
| `column` | `a` = left, `b` = right |
| `headword`, `rid` | The first entry **beginning** in this column, keyed to Sefaria's `rid` |
| `continuedFrom` | `rid` of the previous entry, whose text usually runs over into the top of this column |
| `letter` | Hebrew letter section this entry belongs to |
| `letterChange` | `true` if this page carries a full-width letter heading (see below) |
| `volume`, `leaf` | Internet Archive scan coordinates (see *Scan coordinates*) |
| `guideOcr` | The guide word as Tesseract read it — evidence, not input (see *Accuracy*) |
| `confidence` | `high` / `medium` / `low` — see *Confidence* |

## What "first headword" means

The first entry that **begins** in the column. A column normally opens partway
through the previous entry, and `continuedFrom` names that entry.

This is the same convention Jastrow himself uses for the guide word printed at
the top of each page. On p.227 the left column opens mid-entry, continuing
`גּוֹרְדְּיָינִי` from p.226, and the printed guide word is `גורדייתא` — the entry
that starts a third of the way down the column, not the text at the top of it.

## Letter changes split the page horizontally, not by column

When Jastrow starts a new letter mid-page he does **not** break at the column.
The old letter fills the top of the page across *both* columns, a full-width
letter heading follows, and the new letter fills the bottom across *both*.

On p.134 that means column a holds aleph words at the top and beth words at the
bottom, and so does column b. Reading order is therefore **a-top, b-top,
a-bottom, b-bottom** — four blocks, not two.

A consequence worth stating: since the lower band begins at the lower-*left*
block, **every one of the 22 letters starts in column a**. Any index claiming a
letter starts in column b has the reading order wrong.

21 pages carry such a heading (one per letter change; א needs none). They are
flagged with `letterChange: true` in `columns.jsonl`, and their column heads are
still the first headword *beginning* in that physical column — which on a
letter-change page belongs to the **old** letter, since the top band comes
first.

## Scan coordinates

Pinned to the Internet Archive scans of the 1903 two-volume set. Reprints do
**not** share this pagination.

| Volume | IA identifier | Leaves | `printedPage` |
|---|---|---|---|
| 1 | `dictionaryoftarg01jastuoft` | 718 | `leaf − 23` |
| 2 | `dictionaryoftarg02jastuoft` | 1070 | `leaf + 677` |

Both offsets were derived from the page numbers the print carries, agreeing on
252/355 readable leaves in vol. 1 and 873/946 in vol. 2, with no competing
value; the runners-up are all digit-corruption (`677` misread as `77`). Both
were then confirmed visually against the scans.

A leaf's image is `https://iiif.archive.org/iiif/<identifier>$<leaf+1>/full/1400,/0/default.jpg`.

## Method

Tesseract cannot read Jastrow's small pointed Hebrew reliably, so the build does
not try to *recognise* headwords. Instead it *aligns*:

1. Sefaria's `rid` sorts the 32,512 entries into print order (22 contiguous
   letter runs, no gaps).
2. Both volumes' hOCR is read as one continuous book; each page is split at the
   gutter into two columns — or into four blocks where a letter heading divides
   it horizontally.
3. 4-grams of Latin words unique to both streams give 386,101 anchor points,
   reduced to a strictly monotonic chain. Jastrow's English glosses and citation
   strings OCR well and are highly distinctive.
4. Each entry is placed by shifting from its nearest anchor at the local
   OCR-to-reference token ratio (~1.5, not 1 — Tesseract turns much of the
   Hebrew into Latin-looking noise that the tokeniser keeps).
5. Placements are projected onto the nearest non-decreasing sequence, since the
   print cannot put entry *i+1* before entry *i*.

The build runs **twice**. The first pass reads every page as two columns and
says which leaf each letter change lands on. Each letter section opens with an
essay on the letter itself — "He, the fifth letter of the Alphabet" — so that
line is then located in the OCR, which fixes the heading's leaf and height
exactly. The second pass re-reads those 21 pages as four blocks and pins each
letter's first entry to the top of its lower-left block.

Locating the heading by *geometry* was tried first and is not reliable: keying
on a wide vertical gap in both columns fires on 65 leaves in volume 1 alone,
because OCR dropping lines leaves gaps that look the same. Tightened, it still
put ה's heading on p.326 — a page whose every entry is ד.

## Accuracy

The prior-data comparisons need `--prior <dir>` on v2; see `verify.ts`.

| Check | Result |
|---|---|
| Prior hand-made columns, pp. 1–235 (5,508 entries) | **96.1%** exact page+column |
| Printed guide words, where OCR'd (209 pages) | 60.3% confirm; the rest are mostly unreadable OCR, not contradictions |
| Column heads / layouts read off the scans by eye | 11 of 11 correct |
| Monotonicity | guaranteed structurally |

Known limits:

- **All 22 letters start in column a**, as the layout requires — a standing
  check on the reading order.
- **248 of 3,618 blocks carry no head.** Most are front and back matter; some
  are real columns wholly occupied by one long entry.
- **`confidence: medium`** (680 columns) means the two bracketing anchors
  disagreed about the column and the nearer one was taken. **`low`** (27) means
  the nearest anchor was more than 40 tokens away. Treat both as needing review.
- The guide-word check is weak in aggregate because the header OCR is poor, but
  it is decisive per-page, and it caught two real errors during development
  (pp. 10 and 19).

The eleven read by eye: pp. 226a, 227a, 776a, 900a, 900b, 19a, 134a, 134b, the
ח heading on p.415, the ה heading on p.327, and p.326 confirmed to carry *no*
heading (every entry on it is ד) — the last of which falsified an earlier
geometric guess.

### This index disagrees with the shipped `p` field

The `p` field in `data/jastrow-part*.jsonl` is **one page low throughout volume
2** (every page from 677 on). That was diagnosed, not assumed: volume 2's leaf
99 prints the page number `776`, and its text — "two kinds of wheat", and the
entry `מִנּוּי` opening the right column — matches the scan of that leaf. So the
offset is `776 − 99 = 677`; the shipped data implies 676.

The effect on the comparison is stark: volume 1 entries agree with the shipped
`p` on ~96% of rows, while volume 2 entries differ by exactly +1 on ~93%.

The shipped `col` field covers only pp. 1–235 and is `?` for the other 83% of
entries.
