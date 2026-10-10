# Group D patch sets of 2026-10-10

The maintainer ticked the Group D sense worklist
([`docs/sense-worklist.md`](../../../../../../docs/sense-worklist.md)) on
2026-10-10; the ticked worklist is the one committed at `8914fce25`. For
classes 5–8 he ticked "write a reviewed patch set", each with the note
"as recomended". For the implied-`1)` rows his note reads "As per your
recomendation": the 17 the hOCR shows unnumbered are implied, while the
four OCR `l)` rows and R00586's dropped `1)` are corrections. This
directory records the patches those answers decided. It also records
review ledger L52: the body-review 08 decisions
([`docs/archive/body-review/08-implied-one-candidates.md`](../../../../../../docs/archive/body-review/08-implied-one-candidates.md))
that were decided and never applied. That is four confirmed implied
`1)`s, seven OCR `l)`s and three print reads (D00919, L52's fourth print
read, is in class 8).

## Where the patches are

**142 patches on 75 entries, P000368–P000509, are in
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl).** Each
rid has one `repaired` record in
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl). PR #155
and PR #156 were recorded the same way, and `reviewed/` is the only
place the loader reads a person's patches: `loadReviewedCorpus` stamps
them `author: 'human'` and applies them first. A `patches.jsonl` or
`manifest.jsonl` in this directory would be read as an agent sweep
tranche (`TRANCHES` in `admin/pipeline/patch/apply.ts`), so this
directory holds only this README.

Before this set, none of the 75 rids had a patch in any tranche or in
`reviewed/`, so nothing is double-patched. Five carry agent `clean` or
`needs_*` records with no patch (A01002, A01136, A01429, A01620,
A02547). Nothing here supersedes them, because reviewed patches sit
outside Ruling C's one record per rid. K00081, L00565 and O01387, which
the reviewed `retag`s P000184–P000189 numbered earlier, are not
touched.

Each patch's `rationale` names its ruling and quotes the maintainer's
words: the ticked box and its note, or the body-review 08 decision
cell, verbatim. It states the rule the patch follows, with its
precedent, and carries the hOCR line and the scan leaf. A line that
could not be matched is cited as "not found in the hOCR", with the
scan link alone. `prompt_version` is `group-d-2026-10-10`. Every
`expected_before` is the entry as the import meets it: after both
transform phases and any earlier reviewed patch on the same rid,
pinned to snapshot `sha256:75bbc5ee…`. Patches on one rid chain in file
order, so each one's target is the sense as the patch before it left
it.

## What kind of change

| Kind | Patches | Entries | What the patches do |
|---|---|---|---|
| 5 `continuation-marker-fully-absent` | 6 | 4 | `retag` the unnumbered paragraph with print's `—2)`; G00652 and U01512 open on a stray `)` and also get print's lost opener back (`(cmp. `, `(v. `) by `replace` |
| 6 `first-sense-debris-stranding-language-label` | 14 | 14 | `delete` (scope `segment`) the duplicated run from the lead's in-text `1)` to its end. The label stays once: in the text kept before the `1)`, or in the morphology and language fields joined in front of the lead |
| 7 `verse-paren-false-sense-split` | 17 | 13 | `join` the sense Sefaria minted from a citation's own `N)` back into the sense before it; in A01002, A01620, C01063 and O01635 print's real marker was left in the text, and a `split` lifts it out |
| 8 `chopped-marker-with-residue` | 21 | 9 | six are a duplicate `same.`: `delete` `—2) same.` from sense 1 and `retag` the stranded sense `—2)`. In K00808 and S02111 the residue is sense 2's real opening (`as preced.`, `(of wine)`): `delete` it from sense 1, `replace` it back at the head of the stranded sense byte for byte, then `retag`. D00919 follows the maintainer's 2026-08-07 print read |
| implied `1)` | 42 | 21 | `retag` the host `1)` and `split` its in-text `—2)` out: the 17 and L52's four confirmed rows. Recorded as a deviation from print (register #16), as the doc-08 seed recorded the others |
| OCR `l)` | 34 | 11 | `replace` the glyph `l)` with `1)`, `split` it out of the lead, then `split` `—2)` (E00298's precedent). E00741's `l)` opens its stem sense, so there the glyph is lifted out and the sense retagged (E00148's precedent). G00363 also splits print's `3)`, the "uncategorized 2 and 3" the maintainer noted |
| dropped `1)` | 8 | 4 | `retag` and `split`, recorded as `missing-number` because print sets the `1)`: R00586 and L52's three print reads (B00771, G00233, H01202) |

G00652 is in two rows, class 5 and L52's confirmed implied `1)` (its
Pi. section), so the entry column sums to 76 for 75 entries.

## What the rulings decided that is not here

- **Three entries where the rule does not decide the edit** are round
  2 of the worklist, each with a specific question:
  - J00199 (class 5): the opener of `מלכות)` is not in the hOCR.
  - D01114 (class 8): print's `—3) as preced. 2)` holds a `2)` the
    data lost.
  - B00753 (class 8's sibling): print's `—11) in compounds, denoting
    receptacle` lost `1) in compounds, denoting`.
- **P00790** (class 7's one split of our own) is not a patch. It is the
  lettered splitter's bug, L53, and PR #158 fixes it there.
- **A00675 and T00998**, which class 7's widened predicate also finds,
  are not false splits: print sets a real `1)` and text was lost before
  it.
- **D00792**, whose body-review 08 cell reads only "common", is not
  decided and is not here.
- **Class 3** (`self-numbered-intext-marker`) is "can't decide yet". Its
  answer and a fresh question are in the worklist. This set takes 4 of
  its 26 rows out of the class (A01002, A01620, C01063, O01635, class 7's
  real markers), leaving 22.
- G00173's Polel and F00116's Pa., the "unclassified binyan" notes in
  their body-review 08 cells, are untouched. F00116's Pa. is already a
  stem block. G00173's Polel `1)`, `—2)` still sit at the top level after
  the implied `1)`, `2)`; that is the `stranded-stem-head` family, not
  this set.

## Known shape: a join keeps Sefaria's lost space

A `join` conserves bytes: it appends the token and the minted sense's
text as they stand. Where Sefaria's split ate the space after the
citation's `)`, the joined text reads `Pi. 2)praise`. That happens in
A01620, H00806, P01397 and V00144 (`Af.1)vomit`, where the space before
the numeral went too), as it did in 28 of the 36 earlier
`reviewed-join` patches. The repair is a one-byte `replace` per site,
and it is recorded as a ledger row rather than folded in here.

## Every patch

Labels are read off the entry before and after: `·` is an unlabelled
sense, and `/ Hif.` opens a stem section.

| patches | rid | class | change | labels before → after | scan |
|---|---|---|---|---|---|
| P000368 | G00217 | 5 | number the unnumbered sense `—2)` | `· 1 · / Hif. 1 2 3` → `· 1 2 / Hif. 1 2 3` | [388b · leaf 411](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$412/full/1400,/0/default.jpg) |
| P000369–P000370, P000468–P000469 | G00652 | 5; implied (L52) | restore the lost opener `(cmp. `; number it `—2)`; number the host `1)`; split `—2)` out | `· 1 · / Nif. · 1 2 3 / Hif. · / Hof. · / Nithpa. 1 2 3 / Pi. ·` → `· 1 2 / Nif. · 1 2 3 / Hif. · / Hof. · / Nithpa. 1 2 3 / Pi. 1 2` | [410a · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$434/full/1400,/0/default.jpg) |
| P000371 | R00565 | 5 | number the Hif. section's second sense `—2)` | `· / Nif. · / Pi. · / Hif. 1 ·` → `· / Nif. · / Pi. · / Hif. 1 2` | [1287a · leaf 610](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$611/full/1400,/0/default.jpg) |
| P000372–P000373 | U01512 | 5 | restore the lost opener `(v. `; number it `—2)` | `· / Pa. 1 · / Af. 1 2 / Ithpa. / Ithpe. 1 2` → `· / Pa. 1 2 / Af. 1 2 / Ithpa. / Ithpe. 1 2` | [1599a · leaf 922](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$923/full/1400,/0/default.jpg) |
| P000374 | A02547 | 6 | delete the duplicated `1) = next w. Targ. O. f. pl. ch.` from the lead | `· 1` → `· 1` | [97b · leaf 120](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$121/full/1400,/0/default.jpg) |
| P000375 | D00543 | 6 | delete the duplicated `1) same.) ch.` from the lead | `· 1 2 3 4` → `· 1 2 3 4` | [297b · leaf 320](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$321/full/1400,/0/default.jpg) |
| P000376 | J00606 | 6 | delete the duplicated `1) same. ch. (v. P. Sm. 1630)` from the lead | `· 1 2` → `· 1 2` | [594b · leaf 617](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$618/full/1400,/0/default.jpg) |
| P000377 | N00287 | 6 | delete the duplicated `1) a place in the Arabian desert. (Wood-River),` from the lead | `· 1` → `· 1` | [883a · leaf 206](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$207/full/1400,/0/default.jpg) |
| P000378 | N00931 | 6 | delete the duplicated `1) same. f.` from the lead | `· 1` → `· 1` | [916b · leaf 239](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$240/full/1400,/0/default.jpg) |
| P000379 | O00151 | 6 | delete the duplicated `1) (adj.) same. ch.` from the lead | `· 1 2` → `· 1 2` | [955b · leaf 278](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$279/full/1400,/0/default.jpg) |
| P000380 | P00191 | 6 | delete the duplicated `1) cake. m. (v. next w.)` from the lead | `· 1 2` → `· 1 2` | [1047b · leaf 370](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$371/full/1400,/0/default.jpg) |
| P000381 | Q01287 | 6 | delete the duplicated `1) as preced. 1. ch.` from the lead | `· 1 2` → `· 1 2` | [1195a · leaf 518](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$519/full/1400,/0/default.jpg) |
| P000382 | N00992 | 6 | delete the duplicated `1) sister of Tubal-Cain.` from the lead | `· 1 2` → `· 1 2` | [920b · leaf 243](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$244/full/1400,/0/default.jpg) |
| P000383 | O00068 | 6 | delete the duplicated `1) same.)` from the lead | `· 1 2` → `· 1 2` | [950a · leaf 273](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$274/full/1400,/0/default.jpg) |
| P000384 | P00426 | 6 | delete the duplicated `1) the priest and scribe.` from the lead | `· 1 2` → `· 1 2` | [1062b · leaf 385](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$386/full/1400,/0/default.jpg) |
| P000385 | R00093 | 6 | delete the duplicated `1) the high priest under David and Solomon.` from the lead | `· 1 2` → `· 1 2` | [1261b · leaf 584](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$585/full/1400,/0/default.jpg) |
| P000386 | S00552 | 6 | delete the duplicated `1) in man.` from the lead | `· 1 2` → `· 1 2` | [1340b · leaf 663](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$664/full/1400,/0/default.jpg) |
| P000387 | U00703 | 6 | delete the duplicated `1) same.` from the lead | `· 1 2` → `· 1 2` | [1551b · leaf 874](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$875/full/1400,/0/default.jpg) |
| P000388–P000389 | A01002 | 7 | join the minted `2)` back into `…Gen. XLI, 2)`; split print's real `—2)` out | `1 2` → `1 2` | [39a · leaf 61](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$62/full/1400,/0/default.jpg) |
| P000390 | A01136 | 7 | join the minted `1)` back into `…note 1)` | `· 1` → `·` | [44b · leaf 67](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$68/full/1400,/0/default.jpg) |
| P000391 | A01429 | 7 | join the minted `1)` back into `…Cant. VII, 1)` | `· 1` → `·` | [55a · leaf 78](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$79/full/1400,/0/default.jpg) |
| P000392–P000393 | A01620 | 7 | join the minted `2)` back into `…Pi. 2)`; split print's real `—2)` out | `1 2` → `1 2` | [60b · leaf 83](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$84/full/1400,/0/default.jpg) |
| P000394 | B01172 | 7 | join the minted `3)` back into `…I Kings V, 3)` | `· 1 2 3` → `· 1 2` | [190a · leaf 213](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$214/full/1400,/0/default.jpg) |
| P000395–P000396 | C01063 | 7 | join the minted `3)` back into `…Hos. I, 3)`; split print's real `—3)` out | `· 1 2 3 4 5 6 / Pi. 1 2 / Nif. ·` → `· 1 2 3 4 5 6 / Pi. 1 2 / Nif. ·` | [255a · leaf 278](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$279/full/1400,/0/default.jpg) |
| P000397 | G00433 | 7 | join the minted `1)` back into `…note 1)` | `· 1` → `·` | [397b · leaf 420](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$421/full/1400,/0/default.jpg) |
| P000398 | H00806 | 7 | join the minted `1)` back into `…Is. LXIII, 1)` | `· 1` → `·` | [457b · leaf 480](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$481/full/1400,/0/default.jpg) |
| P000399 | N00045 | 7 | join the minted `1)` back into `…Is. XL, 1)` | `· 1` → `·` | [867b · leaf 190](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$191/full/1400,/0/default.jpg) |
| P000400–P000401 | O01635 | 7 | join the minted `2)` back into `…note 2)`; split print's real `—2)` out | `· 1 2 / Pa. · 1 2 3 / Ithpe. ·` → `· 1 2 / Pa. · 1 2 3 / Ithpe. ·` | [1027b · leaf 350](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$351/full/1400,/0/default.jpg) |
| P000402 | P01397 | 7 | join the minted `1)` back into `…Gen. III, 1)` | `· 1` → `·` | [1120b · leaf 443](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$444/full/1400,/0/default.jpg) |
| P000403 | R00407 | 7 | join the minted `1)` back into `…P. Sm. 3431)` | `· 1` → `·` | [1278b · leaf 601](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$602/full/1400,/0/default.jpg) |
| P000404 | V00144 | 7 | join the minted `1)` back into `…Af. 1)` | `· 1` → `·` | [1650a · leaf 973](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$974/full/1400,/0/default.jpg) |
| P000405–P000406 | C01079 | 8 | delete the chopped `—2) same.` from sense 1; number the stranded sense `—2)` | `· / Pa. 1 · / Ithpa. / Ithpe. 1 2` → `· / Pa. 1 2 / Ithpa. / Ithpe. 1 2` | [256b · leaf 279](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$280/full/1400,/0/default.jpg) |
| P000407–P000408 | D00634 | 8 | delete the chopped `—2) same.` from sense 1; number the stranded sense `—2)` | `· / Pa. 1 2 / Ithpe. · / Ithpa. 1 ·` → `· / Pa. 1 2 / Ithpe. · / Ithpa. 1 2` | [301a · leaf 324](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$325/full/1400,/0/default.jpg) |
| P000409–P000410 | M02308 | 8 | delete the chopped `—2) same.` from sense 1; number the stranded sense `—2)` | `· / Pi. 1 · 3 / Hithpa. ·` → `· / Pi. 1 2 3 / Hithpa. ·` | [825b · leaf 148](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$149/full/1400,/0/default.jpg) |
| P000411–P000412 | O00975 | 8 | delete the chopped `—2) same.` from sense 1; number the stranded sense `—2)` | `· / Pa. 1 ·` → `· / Pa. 1 2` | [994a · leaf 317](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$318/full/1400,/0/default.jpg) |
| P000413–P000414 | S00811 | 8 | delete the chopped `—2) same.` from sense 1; number the stranded sense `—2)` | `· / Pa. 1 · / Ithpe. ·` → `· / Pa. 1 2 / Ithpe. ·` | [1352a · leaf 675](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$676/full/1400,/0/default.jpg) |
| P000415–P000416 | V00892 | 8 | delete the chopped `—2) same.` from sense 1; number the stranded sense `—2)` | `· / Pa. 1 · / Ithpa. · / Af. 1 2` → `· / Pa. 1 2 / Ithpa. · / Af. 1 2` | [1691a · leaf 1014](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1015/full/1400,/0/default.jpg) |
| P000417–P000419 | K00808 | 8 | lift `—2) as preced.` off the end of sense 1; put `as preced.` at the head of the stranded sense; number it `—2)` | `· / Pa. · / Af. 1 ·` → `· / Pa. · / Af. 1 2` | [646b · leaf 669](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$670/full/1400,/0/default.jpg) |
| P000420–P000422 | S02111 | 8 | lift `—2) (of wine)` off the end of sense 1; put `(of wine)` at the head of the stranded sense; number it `—2)` | `· / Nif. · / Hif. 1 ·` → `· / Nif. · / Hif. 1 2` | [1423a · leaf 746](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$747/full/1400,/0/default.jpg) |
| P000423–P000425 | D00919 | 8 | drop the dangling `—2) v.` from sense 1; drop the duplicated `v. preced.—2)` prefix; number it `—2)` | `1 ·` → `1 2` | [315a · leaf 338](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$339/full/1400,/0/default.jpg) |
| P000426–P000427 | J00627 | implied | number the host `1)`; split `—2)` out | `· / Hif. 1 2 3` → `1 2 / Hif. 1 2 3` | [596a · leaf 619](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$620/full/1400,/0/default.jpg) |
| P000428–P000429 | J00657 | implied | number the host `1)`; split `—2)` out | `·` → `1 2` | [597b · leaf 620](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$621/full/1400,/0/default.jpg) |
| P000430–P000431 | K00030 | implied | number the host `1)`; split `—2)` out | `· / Pi. 1 2 3 / Hithpa. / Nithpa. · / Hif. 1 2 3 4` → `· / Pi. 1 2 3 / Hithpa. / Nithpa. 1 2 / Hif. 1 2 3 4` | [606b · leaf 629](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$630/full/1400,/0/default.jpg) |
| P000432–P000433 | K00121 | implied | number the host `1)`; split `—2)` out | `·` → `1 2` | [613a · leaf 636](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$637/full/1400,/0/default.jpg) |
| P000434–P000435 | K00156 | implied | number the host `1)`; split `—2)` out | `1 2 / Pi. · / Hif. 1 2` → `1 2 / Pi. 1 2 / Hif. 1 2` | [614b · leaf 637](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$638/full/1400,/0/default.jpg) |
| P000436–P000437 | K00859 | implied | number the host `1)`; split `—2)` out | `· / Pi. ·` → `· / Pi. 1 2` | [649a · leaf 672](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$673/full/1400,/0/default.jpg) |
| P000438–P000439 | N00235 | implied | number the host `1)`; split `—2)` out | `·` → `1 2` | [879b · leaf 202](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$203/full/1400,/0/default.jpg) |
| P000440–P000441 | N00577 | implied | number the host `1)`; split `—2)` out | `· / Pi. · / Nif. 1 2 / Hif. ·` → `1 2 / Pi. · / Nif. 1 2 / Hif. ·` | [901a · leaf 224](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$225/full/1400,/0/default.jpg) |
| P000442–P000443 | N01162 | implied | number the host `1)`; split `—2)` out | `· / Nif. ·` → `1 2 / Nif. ·` | [931a · leaf 254](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$255/full/1400,/0/default.jpg) |
| P000444–P000445 | P01055 | implied | number the host `1)`; split `—2)` out | `·` → `1 2` | [1099a · leaf 422](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$423/full/1400,/0/default.jpg) |
| P000446–P000447 | Q01352 | implied | number the host `1)`; split `—2)` out | `·` → `1 2` | [1200b · leaf 523](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$524/full/1400,/0/default.jpg) |
| P000448–P000449 | S00826 | implied | number the host `1)`; split `—2)` out | `· / Pa. ·` → `1 2 / Pa. ·` | [1353a · leaf 676](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$677/full/1400,/0/default.jpg) |
| P000450–P000451 | S01731 | implied | number the host `1)`; split `—2)` out | `· / Af. 1 2 3 / Ithpe. ·` → `1 2 / Af. 1 2 3 / Ithpe. ·` | [1400b · leaf 723](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$724/full/1400,/0/default.jpg) |
| P000452–P000453 | T00243 | implied | number the host `1)`; split `—2)` out | `· / Nif. ·` → `1 2 / Nif. ·` | [1452a · leaf 775](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$776/full/1400,/0/default.jpg) |
| P000454–P000455 | T00375 | implied | number the host `1)`; split `—2)` out | `· / Af. 1 2 / Ithpa. / Ithpe. 1 2 3 / Polel. · / Ithpol. · / Palp. · / Ithpalp. · 1 2` → `1 2 / Af. 1 2 / Ithpa. / Ithpe. 1 2 3 / Polel. · / Ithpol. · / Palp. · / Ithpalp. · 1 2` | [1460a · leaf 783](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$784/full/1400,/0/default.jpg) |
| P000456–P000457 | T00538 | implied | number the host `1)`; split `—2)` out | `· / Pi. · / Hif. · / Hithpa. / Nithpa. ·` → `· / Pi. · / Hif. 1 2 / Hithpa. / Nithpa. ·` | [1469a · leaf 792](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$793/full/1400,/0/default.jpg) |
| P000458–P000459 | U00960 | implied | number the host `1)`; split `—2)` out | `·` → `1 2` | [1563b · leaf 886](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$887/full/1400,/0/default.jpg) |
| P000460–P000461 | R00586 | dropped `1)` | number the host `1)`; split `—2)` out | `1 / Ithpalp. ·` → `1 / Ithpalp. 1 2` | [1289a · leaf 612](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$613/full/1400,/0/default.jpg) |
| P000462–P000463 | C01393 | implied (L52) | number the host `1)`; split `—2)` out | `1 2 3 / Pa. · / Ithpa. 1 2` → `1 2 3 / Pa. 1 2 / Ithpa. 1 2` | [272b · leaf 295](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$296/full/1400,/0/default.jpg) |
| P000464–P000465 | D00325 | implied (L52) | number the host `1)`; split `—2)` out | `· 1 2 / Pa. 1 2 3 / Af. ·` → `· 1 2 / Pa. 1 2 3 / Af. 1 2` | [287b · leaf 311](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$312/full/1400,/0/default.jpg) |
| P000466–P000467 | G00173 | implied (L52) | number the host `1)`; split `—2)` out | `· 1 2 / Hif. 1 2 / Hof. ·` → `1 2 1 2 / Hif. 1 2 / Hof. ·` | [386b · leaf 409](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$410/full/1400,/0/default.jpg) |
| P000470–P000471 | B00771 | dropped `1)` (L52) | number the host `1)`; split `—2)` out | `· ·` → `· 1 2` | [169a · leaf 192](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$193/full/1400,/0/default.jpg) |
| P000472–P000473 | G00233 | dropped `1)` (L52) | number the host `1)`; split `—2)` out | `1 2 / Pa. ·` → `1 2 / Pa. 1 2` | [389b · leaf 412](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$413/full/1400,/0/default.jpg) |
| P000474–P000475 | H01202 | dropped `1)` (L52) | number the host `1)`; split `—2)` out | `· / Pa. · / Af. · / Ithpa. / Ithpe. 1 2` → `· / Pa. · / Af. 1 2 / Ithpa. / Ithpe. 1 2` | [478a · leaf 501](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$502/full/1400,/0/default.jpg) |
| P000476–P000478 | R00075 | OCR `l)` | correct the OCR `l)` to `1)`; split `1)` out of the lead; split `—2)` out | `·` → `· 1 2` | [1260a · leaf 583](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$584/full/1400,/0/default.jpg) |
| P000479–P000481 | R00291 | OCR `l)` | correct the OCR `l)` to `1)`; split `1)` out of the lead; split `—2)` out | `·` → `· 1 2` | [1274a · leaf 597](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$598/full/1400,/0/default.jpg) |
| P000482–P000484 | U00884 | OCR `l)` | correct the OCR `l)` to `1)`; split `1)` out of the lead; split `—2)` out | `·` → `· 1 2` | [1560a · leaf 883](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$884/full/1400,/0/default.jpg) |
| P000485–P000487 | V00652 | OCR `l)` | correct the OCR `l)` to `1)`; split `1)` out of the lead; split `—2)` out | `· / Af. 1 2` → `· 1 2 / Af. 1 2` | [1675b · leaf 998](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$999/full/1400,/0/default.jpg) |
| P000488–P000490 | D00436 | OCR `l)` (L52) | correct the OCR `l)` to `1)`; split `1)` out of the lead; split `—2)` out | `·` → `· 1 2` | [293a · leaf 316](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$317/full/1400,/0/default.jpg) |
| P000491–P000493 | D01009 | OCR `l)` (L52) | correct the OCR `l)` to `1)`; split `1)` out of the lead; split `—2)` out | `·` → `· 1 2` | [319a · leaf 342](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$343/full/1400,/0/default.jpg) |
| P000494–P000496 | E00741 | OCR `l)` (L52) | lift the OCR `l)` out of the text; number the host `1)`; split `—2)` out | `· 1 2 3 4 / Pa. · / Af. · / Ithpa. / Ithpe. 1 2` → `· 1 2 3 4 / Pa. 1 2 / Af. · / Ithpa. / Ithpe. 1 2` | [361a · leaf 384](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$385/full/1400,/0/default.jpg) |
| P000497–P000499 | E00918 | OCR `l)` (L52) | correct the OCR `l)` to `1)`; split `1)` out of the lead; split `—2)` out | `·` → `· 1 2` | [369b · leaf 392](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$393/full/1400,/0/default.jpg) |
| P000500–P000502 | E00940 | OCR `l)` (L52) | correct the OCR `l)` to `1)`; split `1)` out of the lead; split `—2)` out | `·` → `· 1 2` | [370b · leaf 393](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$394/full/1400,/0/default.jpg) |
| P000503–P000505 | F00116 | OCR `l)` (L52) | correct the OCR `l)` to `1)`; split `1)` out of the lead; split `—2)` out | `· / Pa. · / Ithpa. 1 2` → `· / Pa. · 1 2 / Ithpa. 1 2` | [376b · leaf 399](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$400/full/1400,/0/default.jpg) |
| P000506–P000509 | G00363 | OCR `l)` (L52) | correct the OCR `l)` to `1)`; split `1)` out of the lead; split `—2)` out; split `3)` out | `·` → `· 1 2 3` | [394b · leaf 417](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$418/full/1400,/0/default.jpg) |
