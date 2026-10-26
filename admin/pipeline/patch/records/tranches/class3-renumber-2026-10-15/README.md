# Class 3 renumber under ruling 10-13 (2026-10-15)

Data PR (iii) of [`docs/archive/correction-audit.md`](../../../../../../docs/archive/correction-audit.md)
§7, PR #176. It renumbers the 18 doubled sense numbers that the class 3
scan review kept as printed, updates the one cross-reference that names
a renumbered sense (S01849), and records U01512's `a) … 2)` as kept.

## The ruling

Ruling `10-13 correction policy` ([`docs/decisions.md`](../../../../../../docs/decisions.md)
§9, [`admin/entry/ANNOTATIONS.md`](../../../../../entry/ANNOTATIONS.md))
makes a doubled sense number case 2: a print error whose intended value
the run determines. Each run is renumbered, every label after the
doubled one becoming the one before it plus 1, and each changed label
carries one annotation with print's number. A renumber also updates
every cross-reference that names the old number, with its own
annotation.

This supersedes the "split here and keep print's number" ticks of
2026-10-12 (17 entries) and P00059's `1,2,3,4,4,6` note, which
[the class 3 README](../class3-2026-10-12/README.md) applied as
printed under ruling `10-10 print lettering gap`; 10-13 superseded
that ruling. The splits stand: they cut where print cuts. Only the
labels after each doubled one move. The maintainer confirmed P00059's
`4 4 6` → `4 5 6` and the S01849 update on 2026-10-14. Print's `6`
in P00059 stays, since it already follows the new `5`.

U01512's participle prints `a)` then `2)`. Ruling 10-12 kept both,
and under 10-13 it is case 3: `a) b)` and `1) 2)` are both plausible,
so it stays as printed and gains a `kept` annotation.

## Where the patches are

26 patches, P000556–P000581, appended to
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl); each
rid's `repaired` record in
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl) names
them after its earlier patches (S01849's record is new). This
directory holds only this README. `prompt_version` is
`class3-renumber-2026-10-15`; every `snapshot` is `sha256:75bbc5ee…`,
the pin the class 3 splits carry.

1. **24 `retag`s on the 18 entries** (P000556–P000579), one per changed
   label, appended after the entry's splits. A `split` cannot carry an
   annotation, so the renumber is its own patch. Each targets the
   source sense as the splits left it (`sense[—N)]:<hash>`; where a run
   holds `—N)` twice, the two senses' hashes differ, and each target
   resolves to exactly one sense), with payload `{number: '—M)'}` and

   ```json
   "annotation": {"kind": "print-error", "printed": "4", "evidence": "print sets 4) twice (B01153, 188b); the run 1 2 *3 4 4 determines this as 5 (class 3 scan review, ticked 2026-10-12; ruling 10-13)", "date": "2026-10-14"}
   ```

   The import writes it on the built sense's `label` as `{field:
   'label', stored: '5', source: 'P000556'}`. The evidence names the
   doubled number, the page where print sets it the second time (the
   page of the split's in-text marker; for six rows, C00871, H00940,
   M00596, P00059, Q01502 and V00909, a later column than the entry's
   first page, which the audit's scan link gives) and the numbered run
   as the splits left it, `·` and lettered children left out. Print's star stays:
   B01153's `*3` is before the doubled `4` and does not move.
2. **S01849's `replace`** (P000580) on the definition holding
   `v. עָבַר Pi. 4)`: `{find: '4). Y. Shek.', replace: '5). Y. Shek.'}`,
   the shortest balanced substring holding the `4)` that occurs once
   (the definition holds `4)` once), annotated

   ```json
   "annotation": {"kind": "print-error", "printed": "4). Y. Shek.", "evidence": "P00059's Pi. run prints 4) twice; this names the second (the city limits), renumbered 5 under 10-13", "date": "2026-10-14"}
   ```

   The import finds the replacement in exactly one unit (`units[2]`),
   as ANNOTATIONS.md §3 restricts an annotated `replace`.
3. **U01512's `annotate`** (P000581), the first `annotate` in the
   corpus, on the nested `—2)` child the `nest` P000543 made, payload
   `{field: 'label'}`:

   ```json
   "annotation": {"kind": "kept", "printed": "2", "evidence": "print sets a) then 2): a) b) or 1) 2) are both possible; kept as printed (ruling 10-12; the maintainer's note \"2)\", 2026-10-12)", "date": "2026-10-14"}
   ```

   An `annotate` target reaches a child a `nest` made with no code
   change: `walkSenses` (`patch/schema.ts`) visits a source sense's
   children, and `buildTextChild` (`body/trace.ts`) builds a nested
   list's items through `senseMarks`, which carries the draft to the
   built child's label.

## The 18

The label lists are the affected list, written as the class 3 README
writes them: `·` an unlabelled sense, `(…)` the children of the sense
before it, `*` print's star. `senses` is the entry's own list; a
verb's Kal list is its top level. Each retag names the sense by its
first italic gloss. The scan is the leaf where print sets the doubled
number the second time.

| # | rid | headword | section | labels before → after | split(s) | `retag`s (label: print → stored) | annotations | scan |
|---|---|---|---|---|---|---|---|---|
| 1 | B01153 | `בַּר, בָּר, בָּרָא` | senses | `1 2 *3 4 4` → `1 2 *3 4 5` | P000518 | P000556 `4` → `5` (`outside`) | 1 | [188b · leaf 211](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$212/full/1400,/0/default.jpg) |
| 2 | B01299 | `בְּרַם` | senses | `· 1 2 3 3` → `· 1 2 3 4` | P000519 | P000557 `3` → `4` (`truly!, surely!`) | 1 | [196a · leaf 219](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$220/full/1400,/0/default.jpg) |
| 3 | C00399 | `גּוֹלְמָא` | senses | `1 2 2 3` → `1 2 3 4` | P000520 | P000558 `2` → `3` (`stone`); P000559 `3` → `4` (`hill`) | 2 | [222a · leaf 245](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$246/full/1400,/0/default.jpg) |
| 4 | C00871 | `גַּלְגַּל` | senses | `· 1 2 3 3` → `· 1 2 3 4` | P000521 | P000560 `3` → `4` (`globule, grain`) | 1 | [245a · leaf 268](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$269/full/1400,/0/default.jpg) |
| 5 | C00872 | `גַּלְגַּל, גִּלְגְּלָא, גִּילְ׳` | senses | `1 2 3 4 4` → `1 2 3 4 5` | P000522 | P000561 `4` → `5` (`a sort of girdle`) | 1 | [245a · leaf 268](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$269/full/1400,/0/default.jpg) |
| 6 | G00456 | `זְכֵי, זְכָא` | Kal | `1 2 3 4 4` → `1 2 3 4 5` | P000523 | P000562 `4` → `5` (`to take possession, acquire a title`) | 1 | [399a · leaf 422](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$423/full/1400,/0/default.jpg) |
| 7 | H00940 | `חֲכַם, חֲכִים, חַכִּים` | Kal | `· 1 2 2 3` → `· 1 2 3 4` | P000524 | P000563 `2` → `3` (`to sleep with`); P000564 `3` → `4` (`to be clear, evident`) | 2 | [463a · leaf 486](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$487/full/1400,/0/default.jpg) |
| 8 | H01899 | `חָתַם` | Kal | `1 2 2 3` → `1 2 3 4` | P000525 | P000565 `2` → `3` (`to sign, subscribe`); P000566 `3` → `4` (`to close`) | 2 | [513b · leaf 536](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$537/full/1400,/0/default.jpg) |
| 9 | I00712 | `טָרַד` | Kal | `· 1 2 3 3 4 (a b)` → `· 1 2 3 4 5 (a b)` | P000526 | P000567 `3` → `4` (`to weary, make unsteady`); P000568 `4` → `5` (`to stir up`) | 2 | [550a · leaf 573](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$574/full/1400,/0/default.jpg) |
| 10 | K00086 | `כֵּבַשׁ II, כִּבְשָׁא, כִּיבְשָׁא` | senses | `1 2 3 4 5 6 6` → `1 2 3 4 5 6 7` | P000527 | P000569 `6` → `7` (`recess, enceinte`) | 1 | [611b · leaf 634](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$635/full/1400,/0/default.jpg) |
| 11 | K01280 | `כָּרַת` | Kal | `1 2 3 3` → `1 2 3 4` | P000528 | P000570 `3` → `4` (`to decide, make final`) | 1 | [674a · leaf 697](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$698/full/1400,/0/default.jpg) |
| 12 | M00596 | `מוּקְצֶה` | senses | `· 1 2 3 4 4` → `· 1 2 3 4 5` | P000529 | P000571 `4` → `5` (`muktseh, that which is not counted on for use on the Sabbath or Holy Day`) | 1 | [748a · leaf 71](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$72/full/1400,/0/default.jpg) |
| 13 | M02130 | `מַעֲלָה` | senses | `· 1 2 3 3 (a b c d)` → `· 1 2 3 4 (a b c d)` | P000530 | P000572 `3` → `4` (`height, on high`) | 1 | [817a · leaf 140](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$141/full/1400,/0/default.jpg) |
| 14 | N01139 | `נָצַץ, נוּץ` | Hif. | `1 2 2` → `1 2 3` | P000531 | P000573 `2` → `3` (`to cause to sprout`) | 1 | [929b · leaf 252](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$253/full/1400,/0/default.jpg) |
| 15 | P00059 | `עָבַר` | Pi. | `1 2 3 4 4 6` → `1 2 3 4 5 6` | P000532–P000534 | P000574 `4` → `5` (`to extend the city limits`) | 1 | [1039a · leaf 362](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$363/full/1400,/0/default.jpg) |
| 16 | Q01502 | `פָּקַע` | Hif. | `1 2 2 3` → `1 2 3 4` | P000535 | P000575 `2` → `3` (`to cause breaking loose`); P000576 `3` → `4` (`to break up, unsettle the market, to raise prices arbitrarily, create a panic`) | 2 | [1210b · leaf 533](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$534/full/1400,/0/default.jpg) |
| 17 | S00151 | `קְדַם` | Af. | `1 2 3 3 4` → `1 2 3 4 5` | P000536 | P000577 `3` → `4` (`to be earlier than, be quick in doing`); P000578 `4` → `5` (`to give preference to`) | 2 | [1316b · leaf 639](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$640/full/1400,/0/default.jpg) |
| 18 | V00909 | `תְּקַף, תְּקֵיף` | Kal | `1 2 3 4 4` → `1 2 3 4 5` | P000537 | P000579 `4` → `5` (`to get hot, ferment, get sour`) | 1 | [1694a · leaf 1017](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1018/full/1400,/0/default.jpg) |

24 annotations in all: 12 entries carry one, 6 (C00399, H00940,
H01899, I00712, Q01502, S00151) carry two.

## S01849 and U01512

| rid | headword | before | after | patch | annotation | scan |
|---|---|---|---|---|---|---|
| S01849 | `קַצְרָא III, קַצְרָה II` | `units[2]`: `v. עָבַר Pi. 4). Y. Shek. l. c.` | `v. עָבַר Pi. 5). Y. Shek. l. c.` | P000580 `replace` | `print-error` on `units[2]`, `printed: '4). Y. Shek.'`, `stored: '5). Y. Shek.'` | [1408b · leaf 731](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$732/full/1400,/0/default.jpg) |
| U01512 | `שְׁמַע I` | Af. `1 2 · (a 2)` | unchanged | P000581 `annotate` | `kept` on the nested `2`, `printed: '2'`, `stored: '2'` | [1599b · leaf 922](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$923/full/1400,/0/default.jpg) |

**Cross-references into a renumbered sense.** The audit's two searches
(§3), re-run on the re-imported tree: (1) every `<cite>` whose `ref`
is one of the 18 rids or P00790, with its text ending `N)` or the 30
characters after it opening with an optional stem abbreviation, an
optional dash or star and `N)` or a letter `)`; (2) every `<he>` word
outside a cite whose consonants are one of those entries' forms,
followed by the same pattern. 184 links into the 19 entries; search
(1) finds the same two hits as the audit, S01849 (now `Pi. 5)`) and
P00791's `preced. Hif. c)` (P00790's `c` keeps its letter); search (2)
finds none, while its pattern fires 102 times across the corpus (the
audit's pattern, written separately, fired 91), so its silence is not
a blind pattern. None of the 18 holds an in-entry `supra`, `infra`,
`preced.` or `next` with a sense number.

## What the re-import shows

`rm -rf data/entries/[A-Z] && bun data:import && bun qa:format`
changed exactly 20 entry files: the 18, S01849 and U01512. Every gate
is green, gate 10 (contract) included, and the blessing reads `Patch
corpus: 422 reviewed, 40 accepted, 467 applied` (396 and 441 before)
and `Annotations: 92 written (91 print-error, 1 kept, 0 illegible)`:
PR #174's 5, PR #175's 61 and these 26. Checked by script against the
tree before:

- each of the 18 affected lists reads as the table's right-hand list;
- each renumbered sense carries exactly one annotation, `{field:
  'label', kind: 'print-error', printed: <old>, stored: <new>, source:
  <its retag>}`, 24 in all, as many per entry as the table gives;
- with those annotations removed and each label set back to `printed`,
  every one of the 18 files is identical to the tree before: no byte of
  text moved;
- S01849: `units[2]` differs by `4` → `5` only, and with that
  annotation removed and `printed` put back the file is identical;
- U01512: one `kept` annotation, on the Af. participle's nested `2`;
  with it removed the file is identical.

`bun data:validate` reports 0 problems. No `body/` or `transform/` file
and no baseline moved, so `transform:invariants` did not need to run.
The class 3 detector was retired in PR #167, so nothing reports there.
