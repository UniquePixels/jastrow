# Jastrow page index

Which printed page and column of Marcus Jastrow's *Dictionary of the
Targumim…* (London: Luzac, 1903) each entry begins in. An input to the
import, which writes each entry's `page` from it; after the import the
entry file's `page` is the record, and nothing looks a page up here.
Ruling `11-05 page index` in [`docs/decisions.md`](../../../docs/decisions.md).

## `columns.jsonl`

One row per printed **block**, in print order (3,396 rows):

```json
{"column":"a","first":"A00000","last":"A00012","page":1}
```

| Field | Meaning |
|---|---|
| `page` | Printed page number, 1–1705. Every copy of the 1903 edition prints the same numbers |
| `column` | `a` = left, `b` = right |
| `first`, `last` | The first and last entry (Sefaria `rid`) that **begin** in the block |

Rid order is print order and rids run without gaps within a letter, so
a row's range names every entry in it. An entry that runs on into the
next column or page is placed where it begins. A block in which no
entry begins (one long entry filling a whole column) has no row.

**A block is a column, except where a letter changes mid-page.** There
Jastrow sets a full-width letter heading: the old letter fills the top
of both columns, the new letter the bottom of both, and the reading
order is a-top, b-top, a-bottom, b-bottom. Each column then has two
blocks and two rows, the old letter's first. That is why every letter
starts in column a. On p. 275 column b's top block starts no entry, so
column a's two blocks are adjacent rows:

```json
{"column":"a","first":"C01432","last":"C01432","page":275}
{"column":"a","first":"D00000","last":"D00006","page":275}
{"column":"b","first":"D00007","last":"D00021","page":275}
```

The loader (`admin/pipeline/page-index.ts`) refuses a row with a bad
column, page or rid, a range that runs backwards or across a letter,
and a row out of print order (which is what stops an entry being placed
twice). The import's gate 8 checks the map against the source both
ways: every entry placed, and nothing placed that is not an entry.

## What this file does not hold

**No scan information.** A leaf number, an Internet Archive identifier
or an image link belongs to one scan, and scans change. Pages are what
the print fixes. How a printed page is linked on the scan the patch
evidence cites is
[`admin/pipeline/patch/scan.ts`](../../../admin/pipeline/patch/scan.ts).

**No research output.** The per-entry confidence, the guide-word OCR,
the letter starts and the build report are in the archived build (see
"Provenance").

## Provenance

1. **Scans.** The University of Toronto copy of the 1903 edition, as
   scanned by the Internet Archive (`dictionaryoftarg01jastuoft`,
   `dictionaryoftarg02jastuoft`), with Tesseract hOCR of every leaf.
2. **Build, 2026-08-17.** A deterministic script chain placed each
   entry. No model was used. Tesseract can't read the small pointed
   Hebrew, so the build aligned text instead of recognising
   headwords:
   - Sefaria's `rid` order gives print order.
   - 4-grams of Latin words that occur once in both the OCR and the
     Sefaria text served as anchors (Jastrow's glosses and citations
     OCR well).
   - Each entry was placed from its nearest anchor and kept in
     non-decreasing print order.
   - A second pass pinned each letter's first entry under its
     full-width heading.

   Checked against hand-made columns for pp. 1–235, the build put
   96.1% of entries (5,508) on the exact page and column.
3. **Rebuild, 2026-11-05.** Ruling `11-05 page index` reduced the
   build's per-headword rows to this block map and dropped its scan
   fields. The new map places all 32,512 entries exactly as those rows
   did, apart from the corrections below.
4. **Corrections.** Each is read off the scan by a person and listed
   below. Placements the build marked uncertain are tracked as one
   issue,
   [#219](https://github.com/UniquePixels/jastrow/issues/219).

The build's code is at the tag `archive/v2-research-2026-09`. Its
files and full method are in
[`docs/archive/page-index-build-2026-08-17/`](../../../docs/archive/page-index-build-2026-08-17/README.md).

## Corrections since the build

Each is read off the scan and recorded here.

- **2026-11-05, vol. 1's last two entries.** The build placed כָּתַת
  (K01393) and כְּתַת (K01394) on vol. 1's back cover, which its leaf
  offset read as a "p. 690" that vol. 2 also prints. The scan shows
  both in p. 683 column b, under the running head כתת. Vol. 1's text
  ends on p. 683; vol. 2 opens on p. 685.
- **2026-11-05, five entries around p. 415.** The build had זרף and
  זְרַף (G00731–G00732) on p. 414b, זְרַק ch. (G00735) on p. 415b and
  זֵתָא and זֵתִים (G00740–G00741) on p. 415a, all `medium`. The scan
  shows p. 414b ending with זַרְעִית ch. (G00730); p. 415a opening with
  זרף, under the running head זרף, through זְרַק ch.; and p. 415b
  running from זִרְקְתָא to זֵתִים, above the ח heading. The three
  rows now read 414b G00723–G00730, 415a G00731–G00735 and 415b
  G00736–G00741, and the five entry files match.

## Rights

Derived from public-domain scans; see
[`docs/archive/print-hocr/README.md`](../../../docs/archive/print-hocr/README.md)
for their provenance and the credit owed upstream.
