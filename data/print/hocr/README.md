# Print hOCR

The raw OCR of the two scans that `data/page-index/` is pinned to, kept in the
repo so the page index can always be re-checked against the exact bytes it was
built from. Internet Archive re-runs OCR on items (vol. 1 was re-done with
Tesseract 5 in 2021), so fetching again later may return a different file with
the same name.

Other uploads of the 1903 set on archive.org are **different scans** with
different leaf counts, for example `DictionaryOfTargumsTalmudsAndMidrashlit.index.aramhebJastrow.1903.2vols`
(700/704 and 1,034/1,065 leaves). Their leaf numbers do not line up with the page
index. Use only the two items below.

## Source

Scanned 2009 by the University of Toronto, Robarts Library; sponsored by the
Ontario Council of University Libraries. The work (Jastrow, 1903) is public
domain, and neither item carries a licence or rights field. Internet Archive's
terms of use allow access for scholarship and research.

| Volume | IA identifier | Leaves | OCR engine | Bytes | MD5 (as IA publishes it) | IA mtime |
|---|---|---|---|---|---|---|
| 1 | `dictionaryoftarg01jastuoft` | 718 | Tesseract 5.0.0-rc2 | 107,057,907 | `3072586eac50d1bb2bc30d11b26bf3a1` | 2021-11-23 |
| 2 | `dictionaryoftarg02jastuoft` | 1,070 | ABBYY FineReader 8 → hOCR | 159,086,837 | `7284a58f8575ae46948964865cf3a56e` | 2021-10-02 |

Downloaded 2026-09-21 from
`https://archive.org/download/<identifier>/<identifier>_hocr.html`.

## Layout

Each volume's `<identifier>_hocr.html` is cut into chunks of 100 leaves and
gzipped:

```text
<identifier>/leaves-0000-0099.html.gz
<identifier>/leaves-0100-0199.html.gz
...
```

The cuts fall immediately before a `<div class="ocr_page">`, so each chunk
holds whole pages. The first chunk also carries the document `<head>`, and the
last one carries the closing tags. A chunk is therefore **not** a standalone
HTML document. Leaf `n` is in the chunk whose range contains `n`; the numbering
matches `leaf` in `data/page-index/`.

Chunks are gzipped with no name and a zero timestamp, so re-running the split
reproduces the same bytes.

## Reassembling and verifying

Concatenating a volume's chunks in name order gives back IA's file exactly:

```bash
cat data/print/hocr/dictionaryoftarg01jastuoft/*.html.gz | gunzip | md5
```

That should print the MD5 from the table above (`md5sum` on Linux).
