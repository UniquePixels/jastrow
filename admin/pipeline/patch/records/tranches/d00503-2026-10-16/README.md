# D00503 `דֵּיו`: an OCR nun for vav (2026-10-16)

Review ledger L73, PR #184, under ruling `10-13 correction policy`
([`docs/decisions.md`](../../../../../../docs/decisions.md) §9), case
1: a transcription error where print is right is corrected with no
annotation; the patch rationale is the only trace.

**Five reviewed patches, P000821–P000825, on four entries**, appended
to [`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl), with
one `repaired` record per rid in
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl). None
of the four rids had a record before. `prompt_version` is
`d00503-2026-10-16` and `snapshot` is `sha256:75bbc5ee…`. This
directory holds only this README.

| Patch | rid | Op | What it does |
|---|---|---|---|
| P000821 | D00503 | `reform` | the form `דֵּין` → `דֵּיו` (the line `*דֵּין` → `*דֵּיו`) |
| P000822 | D00446 | `replace` | its gloss's `v. דֵּיו)` re-aimed from D00500 to D00503 |
| P000823 | D00446 | `replace` | its unit's `Cant. R. to II, 9, v. דֵּיו.` re-aimed the same way |
| P000824 | I00568 | `replace` | `(= טְעַן דֵּו, v. דֵּיו; …)` re-aimed the same way |
| P000825 | Q01189 | `replace` | `Y. Ber. IX, 13ᵃ sq. פַּנִּינָן יתיה, v. דֵּיו` re-aimed the same way |

## The evidence

D00503 is stored `*דֵּין` (starred: `reconstructed`), lead `m. (v.
דְּוַי)`, p. 296a. Its meanings are `faintness, trouble, sickness` and
an interjection of love-longing, `Oh! Ah!`, the reading of Cant. R. to
II, 9.

- **The scan.** The maintainer read the 1903 scan on 2026-10-16: the
  final letter is a vav, not a nun
  ([296a · leaf 319](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$320/full/1400,/0/default.jpg)).
  The hOCR gives no help: it reads the headword `aa` (`aa m. (v. "3%)
  1) faintness, trouble, sickness. Y.`).
- **The alphabet.** The neighbours are D00502 `דיו־` and D00504
  `דֵּיוָא`. `דיו` sorts between them; `דין` sorts after `דיוא` and
  breaks the order.
- **Jastrow's own spelling.** Four cites spell the word `דֵּיו`, with
  D00503's tsere, and each names one of its meanings. Sefaria linked
  all four to D00500 `דְּיוֹ` I (ink), which has a sheva and a holam:
  - D00446 `*דִּיאֵו` (294a): `(דאו = דאו formed like עִוֵּר, v. דֵּיו)
    longing, faint, love-sick. Cant. R. to II, 9, v. דֵּיו.` D00503's
    second meaning quotes the same Cant. R. to II, 9.
  - I00568 `טַנְדּוּ` (540b): `(= טְעַן דֵּו, v. דֵּיו; cmp. טוּנָא I)
    adv. with a load of grief, in trouble`: D00503's `trouble`.
  - Q01189 `פְּנֵי` I (1188b), Pa. `to free, acquit. Y. Ber. IX, 13ᵃ sq.
    פַּנִּינָן יתיה, v. דֵּיו`: D00503's first meaning quotes the same
    passage, `Y. Ber. IX, 13ᵃ bot. ד׳ ליה וכ׳ he was in trouble; (so) we
    let him pass`.

The brief named D00446 only. Grepping every internal cite whose Hebrew
reads `דיו` or `דין` turned up I00568 and Q01189, the same mislink with
the same evidence, so they are written here too. The other cites of
that shape are not D00503's: D00580's unpointed `דיו` (`masc.`, ink:
D00500 is right), the `דְּיוֹ` cites of D00500 and D00501, and D00442's
`cmp. דֵּין` (D00632, `this`). D00164's unpointed `דיו` (`Gen. R. s. 8,
beg. דיו`, Gen. R.'s reading of `דו פרצופין`, two faces) is linked to
D00500 (ink) where the word is D00501's Greek `two`, or no
cross-reference at all; it is a different question, left open on
review ledger L73. No cite names D00503 by its old spelling `דֵּין`.
D00504's `v. preced.` names D00503 and is unchanged.

## The patches

**P000821** is a `reform` on the forms block, `expected_before`
`*דֵּין` (the line as the transform phases leave it), `forms`
`["*דֵּיו"]`. No letter is typed: the word is the stored bytes of
D00446's cite text, which differ from the stored form by exactly one
code point, U+05DF final nun → U+05D5 vav (checked). The star stays, so
the form stays `reconstructed`, and `display` stays `*{0}`.
`sefariaHeadword` stays Sefaria's spelling, `*דֵּין`. Under ruling
`10-09 link key` the links resolve by the pre-patch line, so the
retargets below name D00503 by `*דֵּין`, and no link that names
Sefaria's spelling dangles.

**P000822–P000825** are `replace`s in the pattern of P000595–P000790
(the cross-reference retargets, PR #178): `find` is Sefaria's anchor
and `replace` the same anchor with `href` and `data-ref` naming
D00503's link key (`/Jastrow,_*דֵּין.1`, `Jastrow, *דֵּין 1`). The
visible text is unchanged byte for byte. D00446 holds the anchor twice
in one sense, so each `find` carries its neighbours (`, v. …)` and `,
v. ….`) to occur once, and P000823's `expected_before` is the sense as
P000822 leaves it, as D00003's P000616 and P000617 did. Each rationale
names the cite's page and leaf first, then the maintainer's print read
of D00503.

## What changed

The re-import changes four entry files, each by the one field the
patch names:

| rid | Before | After |
|---|---|---|
| D00503 | `headwords[0].text` `דֵּין`; name `*דֵּין`; `display` `*{0}` | `דֵּיו`; name `*דֵּיו`; `display` `*{0}` |
| D00446 | two cites `ref="D00500"` | `ref="D00503"` |
| I00568 | one cite `ref="D00500"` | `ref="D00503"` |
| Q01189 | one cite `ref="D00500"` | `ref="D00503"` |

The new name `*דֵּיו` is held by D00503 alone (the names gate,
65,024/65,024). Every gate is green; `bun data:validate` reads 0
problems; the import blessing's patch count moves 661 → 666 reviewed
and 706 → 711 applied, and its annotations are unchanged (99 written),
as case 1 carries none.

## Upstream

The reform and the four retargets are Sefaria's errors (an OCR glyph,
and a linker that chose the nearest correctly spelled entry), and each
rationale names case 1 and print evidence, so all five are Sefaria
appendix rows. `bun data:sefaria` (PR #183, merged into this branch)
moves the appendix from 294 rows to 299
([`docs/reports/sefaria-appendix.csv`](../../../../../../docs/reports/sefaria-appendix.csv)):
`cross-reference-target` 167 → 171 and `headword-ocr-glyph` 4 → 5; the
review list stays at 367. Every row's evidence reads `maintainer print
read 2026-10-16` and a leaf: P000821's `scan leaf 319`, P000822–P000825
their own entry's leaf.

## The detector gap (review ledger L72)

Nothing flagged D00503, because the headword report compares headwords
with each other, never with how Jastrow's own cross-references spell a
word. A scratch script (not committed) measured that shape on `v2` at
`fc444fa66`, over the 62,833 internal cites whose Hebrew text has two
letters or more. "One confusion letter" is one substitution within a
group of `CONFUSION_GROUPS` (`admin/entry/hebrew.ts`), every other
letter equal; "pointed" also requires every mark equal.

| Shape | Mode | Rows | Entries |
|---|---|---|---|
| 1: the cite differs from every form of its target, from one by one confusion letter | consonants | 326 | 276 |
| 1 | pointed | 226 | 191 |
| 2: the cite's consonants match its target, and an entry within five of the target has a form one confusion letter from the cite (none equal) | consonants | 8,547 | 2,755 |
| 2 | pointed (the cite also differs from every target form) | 239 | 134 |

The positive control holds: D00446, I00568 and Q01189 → D00500, with
D00503 one letter away, are three shape 2 pointed rows on `v2`, and
none on this branch (236 rows, 133 entries).

**The first 15 pointed rows of each, in source order**, read against
the entries, the hOCR and the scan links (no image downloaded):

| # | Shape 1 row | Reading |
|---|---|---|
| 1 | A00081 `אַכְוַר׳` → A01675 (`… אַכְוַו׳`) | mislink: `v. אַכְוַר׳` names A01676 `אַכְוַרְנְקָא` |
| 2 | A00411 `אַזְכָּרָח` → A00972 `אַזְכָּרָה` | OCR slip in the cite's text (`b. h.` is `אזכרה`) |
| 3 | A00856 `צְפַרְרֵּעַ` → R00718 `צְפַרְדֵּעַ` | OCR slip in the cite's text (a dagesh in `ר`) |
| 4–6 | A00863, A00878, A00879 `אֻרְוָה` → A03020 `אֻרְיָה` | **headword OCR**: A03020 sorts as `ארוה`, pl. `אֻרְווֹת` |
| 7 | A00917 `ed. Ven. אַוְשָׁהָא` → A02303 `אַנְשָׁהָא` | Jastrow's variant reading; A02303 sorts as `אנש` |
| 8 | A01050 `אַחֲרוֹנִית` → A00513 `אַהֲרוֹנִית` | mislink (last ≠ Aaronide) |
| 9–10 | A01120, A01664 `אַבְאָבִית` → A00021 `אַכְאָבִית` | **headword OCR**: the hOCR and the alphabet read `אבאבית` |
| 11 | A01168 `עִירָּנָא` → P00515 `עִידָּן …` | OCR slip in the cite's text (a dagesh in `ר`) |
| 12 | A01671 `אַכְוַר׳` → A01675 | mislink, as row 1 |
| 13 | A01702 `Var. lect. אַכְלְכָא` → A01702 itself | Jastrow's variant reading, linked to itself |
| 14 | A02104 `read אַנְגִּירָא?` → A02990 `אַרְגִּירָא` | mislink (an emendation linked to a near word) |
| 15 | A02446 `Pl. … אֲסִירֵי` → A02438 `אֲסִינֵי` | mislink (a plural linked to a stub) |

Shape 1: 5 of 15 headword OCR (two entries), 5 mislinks, 3 slips in
the cite's own text, 2 variant readings: 33%.

| # | Shape 2 row (cite → target; the neighbour one letter away) | Reading |
|---|---|---|
| 1 | A00041 `אבדימא` → A00040; A00036 `אבדומא` | a different stub word; link right |
| 2–9 | A00437, A00612, A00996, A01008 `אחז` → A01021; A01023 and A01024 `אחי` | a root cite beside a different root; link right (8 rows) |
| 10 | A00742 `Mish. Nap. ותינייקי` → F00107; F00110 `ותירייקי` | Jastrow's variant stub; link right |
| 11 | A01021 `sec. r. of חזז` → H00520; H00525 `חזי` | a different root; link right |
| 12–13 | A01201 `v. זְמַר I` → G00539; G00536, G00538 `זְמַן` | a different word; link right |
| 14 | A01525 `b. h. נָסַס` → N00953; N00954 `נָסַע` | a different word; link right |
| 15 | A01672 `Rashi אבוז` → A00064; A00060 `אבוד` | Jastrow's variant stub; link right |

Shape 2: 0 of 15. Both raw shapes are below the 70% bar.

**The alphabet is the third witness.** Keeping only rows where the
suspect form is the entry's `headwords[0]`, its stored spelling sorts
outside its two neighbours in the source (finals read as medials) and
the cite's spelling sorts between them, as D00503's `דין` fails and
`דיו` fits between `דיו־` and `דֵּיוָא`:

| Mode | Entries | Read as headword OCR |
|---|---|---|
| pointed, both shapes | 14: A00021, A03020, K00228, K00780, U01011 (shape 1); D00503, H00980, P00609, P00860, R00152, R00171, S00216, U00721, U01223 (shape 2) | 14 (P00609 medium) |
| consonants, beyond those | 12: A00718, A01632, C00299, C01130, C01208, L00051, L00602, M01544, N00084, R00169, V00140, V00485 | 4 likely (A00718, A01632, C00299, C01130), 3 plausible (M01544, N00084, R00169), 4 not (L00051, L00602: stubs spelled as their own `v.` target; V00140, whose gloss `Tavakh` transliterates the stored letter; V00485 `תֵּיקֵי`, a real word out of order), C01208 unclear |

Two misses show the witness's limit: P00855 and P00856 `עָמַך`
(`docs/sefaria-report.md` §1) are shape 2 pointed rows, but they stand
side by side, so each one's slip hides the other's from a check that
reads only the immediate neighbours. The worklist section
[`docs/headword-worklist.md` § Cross-reference spellings (2026-10-16)](../../../../../../docs/headword-worklist.md#cross-reference-spellings-2026-10-16)
asks the 13 pointed rows (with P00855 and P00856) and the 4 likely
consonant rows for a scan read.
