# D00503 `דֵּיו`: an OCR nun for vav (2026-10-16)

Review ledger L73, PR #n, under ruling `10-13 correction policy`
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
rationale names case 1 and print evidence, so all five enter the
Sefaria appendix once PR #183 (`bun data:sefaria`, not on this branch)
merges. Run from #183's tree against this branch's records, the
generator reads 299 appendix rows, these five among them: P000821 with
the evidence `scan leaf 319` (its rationale says "scan read", which
the filter's `print read` does not match, so the row carries the leaf
and no date), and P000822–P000825 with `maintainer print read
2026-10-16` and their own leaf.

## The detector gap

Nothing flagged D00503, because the headword report compares headwords
with each other, never with how Jastrow's own cross-references spell a
word. Review ledger L72 measures that shape.
