# ASCII apostrophe after a dotted letter (2026-11-06)

**Five reviewed patches, P000944–P000948**, appended to
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

**Why the import left them:** they have a dot above (U+0307) between the
letter and the `'`, and no geresh rule handles an ASCII `'` in that
position.

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

## How these were found

Every string in all 32,512 files under `data/entries/` was matched
against `(?<=[א-ת][֑-ׇ̇]*)'`, a Hebrew letter
with any points or dot above, then an ASCII apostrophe. It returned
exactly these five.

## Verification

- `bun data:import` from an empty `data/entries/`, then
  `bun qa:format`: exactly five entry files changed, each by one
  character, `'` → `׳`, at the place the case above names. Every gate
  green.
- Against the run before these records: `evidenceLocator` 568 → 573,
  `declaredLoss` 773 → 778 (116 → 121 reviewed patches removing
  474 → 479 codepoints), patch corpus 773 → 778 reviewed,
  817 → 822 applied.
- `bun data:sefaria`: 471 → 476 appendix rows; the review list stays
  at 302.
- `bun data:validate`: 32,512 files, 0 problems.
