# ASCII apostrophe after a dotted letter (2026-11-06)

**Eleven reviewed patches, P000944–P000954** (cases 1–5, then 6–11), appended to
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl), with one
`repaired` manifest record per rid. `prompt_version` is
`ascii-geresh-after-dot-2026-11-06`; this directory holds only this
README, the print check the maintainer ticked on 2026-11-06. Case 1
under ruling `10-13 correction policy`: print is right, Sefaria's glyph
is wrong, no annotation. Patches rather than entry edits alone, on the
maintainer's go of 2026-11-06, so a re-import reproduces the fix
(ruling `09-21 admin edits` would otherwise keep it in the entry files
only). Reproduce the records with:

```sh
jq -c 'select(.prompt_version=="ascii-geresh-after-dot-2026-11-06")' \
  admin/pipeline/patch/records/reviewed/patches.jsonl
```

## What this is

Five places in stored entries where an ASCII `'` comes right after a
Hebrew letter. All five are in wordplay quotes, where Jastrow puts a dot
above the letters a word is being read from (`מ̇ד̇ה̇ב̇ה`). In each case
the dotted letter plus `'` looks like a shortened word, and an
abbreviation in Jastrow normally takes a geresh `׳`. C01432 has real
gereshes in the same quote (`מא׳ ק׳`).

**Why the import left them:** no import rule turns an ASCII `'` into a
geresh. The gershayim rules handle `"` and `׳'`, and `vkh-geresh` mints
`׳` only on `וכ`.

Each patch is a `replace` on the one sense holding the apostrophe: its
`find` is the dotted letters plus `'`, its `replace` the same letters
plus U+05F3, and it declares `removes: "'"`. Every one of the five
entries already writes `׳` elsewhere. The patch strings were copied
from the composed definitions by script, not retyped.

## Cases

### 1. B00472 בָּחוּר — p. 154b

[Scan, vol. 1 p. 154](https://archive.org/details/dictionaryoftarg01jastuoft/page/154)
· [entry file](../../../../../../data/entries/B/B00472.json) · `senses[0].units[0]`

> I have made thee `א̇ב` a father of the nations, **`ב̇' נתתיך וכ׳`** I
> have made thee a chosen one among the nations.

`ב̇'` stands for בחור.

- [x] Print has `ב̇׳` (geresh) — change `'` to `׳`
- [ ] Print has something else: ______

### 2. C01432 גִּתִּית — p. 275a

[Scan, vol. 1 p. 275](https://archive.org/details/dictionaryoftarg01jastuoft/page/275)
· [entry file](../../../../../../data/entries/C/C01432.json) · `senses[0].units[1]`

The line is at the top of column **b** (the entry starts in column a and
runs over). Sharper images of the same line:

- [Frankfurt, the three words only](https://sammlungen.ub.uni-frankfurt.de/i3f/v20/1265418/pct:48,12.6,16,3.4/full/0/default.jpg)
  (UB Frankfurt 1903 copy, full resolution; black and white)
- [Frankfurt, the whole quote](https://sammlungen.ub.uni-frankfurt.de/i3f/v20/1265418/pct:48,10,47,7/full/0/default.jpg)
- [Claremont, the whole quote](https://iiif.archive.org/iiif/dictionaryoftarg0001jast$301/pct:48,11,47,5/full/0/default.jpg)
  (greyscale, softer)

> (play on `א̇ב̇ג̇ת̇א`) **`א̇ב̇יא ג̇ית̇' מא׳ ק׳`** I shall bring the wine
> treaders &c.

`ג̇ית̇'` stands for גיתות (or similar). The same quote has real
gereshes on `מא׳ ק׳`.

- [x] Print has `ג̇ית̇׳` (geresh) — change `'` to `׳`
- [ ] Print has something else: ______

### 3. L00518 לֵיצָנוּתָא — p. 709b

[Scan, vol. 2 p. 709](https://archive.org/details/dictionaryoftarg02jastuoft/page/709)
· [entry file](../../../../../../data/entries/L/L00518.json) · `senses[0].units[2]`

> (phonetic etymol. of `מ̇פ̇ל̇צ̇ת`) **`דהוה מ̇פ̇ל̇יא ל̇יצ̇'`** for it
> carried lasciviousness to an extreme.

`ל̇יצ̇'` stands for ליצנותא.

- [x] Print has `ל̇יצ̇׳` (geresh) — change `'` to `׳`
- [ ] Print has something else: ______

### 4. M00252 מִדָּה — p. 732a

[Scan, vol. 2 p. 732](https://archive.org/details/dictionaryoftarg02jastuoft/page/732)
· [entry file](../../../../../../data/entries/M/M00252.json) · `senses[1].units[0]`

> (play on `מ̇ד̇ה̇ב̇ה`) **`מ̇אד̇ מ̇אד̇ ה̇ב̇א בלא מ̇'`** bring much, very
> much, without measure.

`מ̇'` stands for מדה.

- [x] Print has `מ̇׳` (geresh) — change `'` to `׳`
- [ ] Print has something else: ______

### 5. S01511 קִנְאָה — p. 1387b

[Scan, vol. 2 p. 1387](https://archive.org/details/dictionaryoftarg02jastuoft/page/1387)
· [entry file](../../../../../../data/entries/S/S01511.json) · `senses[0].units[3]`

> (play on `קינה וכ׳`) **`כל מי שיש לו ק̇' … וד̇ומ̇ס שוכן ע̇ד̇י ע̇ד̇ וכ׳`**
> if a man has cause for anger against a fellowman and …

`ק̇'` stands for קנאה.

- [x] Print has `ק̇׳` (geresh) — change `'` to `׳`
- [ ] Print has something else: ______

## Six more, found in review (P000949–P000954)

Same defect, a dotted letter and an ASCII `'` in a wordplay quote, but
here the import moved the `'` out of the Hebrew span, so the stored text
reads `<he>ג̇</he>'`. The scan above missed them because the `'` no
longer follows the letter. These are all of them: the stored entries
hold exactly six `</he>'`.

The patch puts `׳` back INSIDE the span: at patch time (before the
`span` → `he` conversion) its `find` is `ג̇</span>'` and its `replace`
`ג̇׳</span>`. Each crop link is the one line, from the UB Frankfurt 1903
copy at full resolution. The maintainer ticked all six on 2026-11-06.

These six land in the Sefaria appendix's review list, not the appendix,
as `not traceable to source`: their `find` exists only after the import
moved the `'`, so it is not in Sefaria's raw record. 53 earlier patches
share that filter.

### 6. C00020 גֵּאִים — p. 202b

[Scan, vol. 1 p. 202](https://archive.org/details/dictionaryoftarg01jastuoft/page/202)
· [Frankfurt, the line](https://sammlungen.ub.uni-frankfurt.de/i3f/v20/1265345/pct:50,24.3,50,2.6/1100,/0/default.jpg)
· [entry file](../../../../../../data/entries/C/C00020.json) · `senses[0].units[0]`

> (play on `ש̇ר̇י̇ג̇י̇ם̇`, Gen. XL, 10) **`<he>שלשה ש̇ר̇י̇ ג̇</he>' <he>בכל וכ׳</he>`**
> the three princes …

- [x] Print has `ג̇׳` (geresh) — change to `<he>שלשה ש̇ר̇י̇ ג̇׳</he>`
- [ ] Print has something else: ______

### 7. K01358 כְּתִיבָה — p. 681a

[Scan, vol. 1 p. 681](https://archive.org/details/dictionaryoftarg01jastuoft/page/681)
· [Frankfurt, the line](https://sammlungen.ub.uni-frankfurt.de/i3f/v20/1265824/pct:0,19.0,50,2.6/1100,/0/default.jpg)
· [entry file](../../../../../../data/entries/K/K01358.json) · `senses[1].units[3]`

> (expl. `אָנֹכִי`, Ex. XX, 2) **`<he>א̇מירה נ̇עימה כ̇</he>' <he>י̇היבה</he>`**
> a sweet proclamation, a writing, a gift

- [x] Print has `כ̇׳` (geresh) — change to `<he>א̇מירה נ̇עימה כ̇׳</he>`
- [ ] Print has something else: ______

### 8. K01388 כֶּתֶר — p. 682b

[Scan, vol. 1 p. 682](https://archive.org/details/dictionaryoftarg01jastuoft/page/682)
· [Frankfurt, the line](https://sammlungen.ub.uni-frankfurt.de/i3f/v20/1265825/pct:50,63.9,50,2.6/1100,/0/default.jpg)
· [entry file](../../../../../../data/entries/K/K01388.json) · `senses[0].units[1]`

> Sabb. 104ᵃ (play on letters `כ̇ ל̇`) **`<he>וקושר לך כ̇</he>' <he>ל̇עוה״ב</he>`**
> and he will wreathe a crown for thee …

- [x] Print has `כ̇׳` (geresh) — change to `<he>וקושר לך כ̇׳</he>`
- [ ] Print has something else: ______

### 9. Q00188 פּוּטִיאֵל — p. 1140b

[Scan, vol. 2 p. 1140](https://archive.org/details/dictionaryoftarg02jastuoft/page/1140)
· [Frankfurt, the line](https://sammlungen.ub.uni-frankfurt.de/i3f/v20/1266289/pct:50,12.9,50,3.0/1100,/0/default.jpg)
· [entry file](../../../../../../data/entries/Q/Q00188.json) · `senses[0].gloss`

> Mekh. Yithro, ʿĂmal., s. 1 **`<he>פ̇וט̇</he>' <he>שנפ̇ט̇ר מע״ז</he>`**
> Jethro was surnamed Putiel …

- [x] Print has `פ̇וט̇׳` (geresh) — change to `<he>פ̇וט̇׳</he>`
- [ ] Print has something else: ______

### 10. Q01908 פָּרַס, פָּרַשׂ — p. 1232a

[Scan, vol. 2 p. 1232](https://archive.org/details/dictionaryoftarg02jastuoft/page/1232)
· [Frankfurt, the line](https://sammlungen.ub.uni-frankfurt.de/i3f/v20/1266381/pct:5,90.6,55,4.2/1100,/0/default.jpg)
· [entry file](../../../../../../data/entries/Q/Q01908.json) · `senses[3].units[4]`

> (ref. to …, Job XXVI, 9) **`<he>פ̇</he>' <he>ר̇חום ש̇די ז̇יו וכ׳</he>`**
> the Merciful Almighty spread …

- [x] Print has `פ̇׳` (geresh) — change to `<he>פ̇׳</he>`
- [ ] Print has something else: ______

### 11. V00546 תַּכְלִית — p. 1668b

[Scan, vol. 2 p. 1668](https://archive.org/details/dictionaryoftarg02jastuoft/page/1668)
· [Frankfurt, the line](https://sammlungen.ub.uni-frankfurt.de/i3f/v20/1266817/pct:50,81.0,50,2.6/1100,/0/default.jpg)
· [entry file](../../../../../../data/entries/V/V00546.json) · `senses[0].units[0]`

> Num. R. s. 18¹² **`<he>ויש אומרים ת̇</he>' <he>כלייה וכ׳</he>`** and some
> say (the `ת` in …) intimates *takhlith* …

- [x] Print has `ת̇׳` (geresh) — change to `<he>ויש אומרים ת̇׳</he>`
- [ ] Print has something else: ______

## How these were found

Every string in all 32,512 files under `data/entries/` was matched
against `(?<=[א-ת][֑-ׇ̇]*)'`, a Hebrew letter
with any points or dot above, then an ASCII apostrophe. It returned
exactly cases 1–5. Cases 6–11 were found in review by searching the
same files for `</he>'`, which returned exactly those six. The raw
Sefaria file holds 12 such apostrophes after a Hebrew letter: these
eleven, plus Q00188's `quotes[0][1]`, a field v2 does not keep.

## Verification

- `bun data:import` from an empty `data/entries/`, then
  `bun qa:format`, once per batch: exactly eleven entry files changed
  in all, each by one character at the place its case names. Cases 1–5:
  `'` → `׳`. Cases 6–11: `</he>'` → `׳</he>`. Every gate green.
- Against the run before these records: `evidenceLocator` 568 → 579,
  `declaredLoss` 773 → 784 (116 → 127 reviewed patches removing
  474 → 485 codepoints), patch corpus 773 → 784 reviewed,
  817 → 828 applied.
- `bun data:sefaria`: 471 → 476 appendix rows (cases 1–5); review list
  302 → 308 (cases 6–11, `not traceable to source`).
- `bun data:validate`: 32,512 files, 0 problems.
