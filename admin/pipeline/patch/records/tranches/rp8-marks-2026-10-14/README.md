# RP8 marks under ruling 10-13 (2026-10-14)

Data PR (ii) of [`docs/correction-audit.md`](../../../../../../docs/correction-audit.md)
§7, PR #n. It gives each of the 61 implied `1)` labels that ruling RP8
carried into the data the annotation ruling 10-13 owes it.

## The ruling

Ruling `10-13 correction policy` ([`docs/decisions.md`](../../../../../../docs/decisions.md)
§9, [`admin/entry/ANNOTATIONS.md`](../../../../../entry/ANNOTATIONS.md))
checked RP8 and kept it. A `2)` after an unlabelled first sense
determines the `1)`, so an implied `1)` is case 2: a print error whose
intended value is determined, corrected and annotated. The labels
stay; each gains `annotation: {kind: 'print-error', printed: '',
evidence, date: '2026-10-14'}` on its `retag`, which the import writes
on the built sense's `label` as `{field: 'label', stored: '1', source:
<the retag>}`. The evidence is the `—2)` that follows the unlabelled
first sense, except for B01321, C01169 and U01787, whose `2)` was
already its own sense in the source: theirs is the print read their
rationale cites (body-review doc 01, note 1 and its Unclassified row).

Only a reviewed patch may carry an annotation (`corpusPreflight`
refuses one on an agent patch; ANNOTATIONS.md §3), which decides the
three moves.

## Where the patches are

In [`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl), with
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl), as for
every tranche of a person's patches; this directory holds only this
README.

1. **24 reviewed retags amended in place.** Each keeps its id, target
   and `expected_before`, gains the `annotation`, and its `rationale`
   keeps its text with an amendment appended, as PR #174 amended the
   five implied-I reforms. The 24: P000209 (B01321), P000212 (C01169),
   P000285 (U01787), and the 21 `implied-one` retags PR #160 wrote
   (the even ids P000426–P000458 and P000462–P000468).
2. **36 agent retags moved with their companion splits.** 33 from
   `seed-doc-08-implied-one`, one each from `batch-02-2026-09-04`
   (A00339), `residue-01` (B00881) and `seed-doc-08-sense-runs`
   (P00816). Each retag and every `implied-one` split on its rid (37
   splits: P00816 has two, `—2)` and `—3)`) left its tranche's
   `patches.jsonl` and was appended to `reviewed/patches.jsonl` in its
   original order, keeping its id. The retag gained the annotation; both
   gained a sentence in the `rationale` saying where they came from. The
   pair keeps its order: reviewed patches apply before agent ones, and
   the split and retag stay in their committed order within the rid.
   Each rid has a new `repaired` record in `reviewed/manifest.jsonl`.
   In the tranche manifests:
   - 26 `repaired` records named only the moved pair and were removed.
     No earlier tranche names any of those rids, so no earlier record
     becomes the latest and nothing is resurrected.
   - 8 `repaired` records keep their `swallowed-marker` splits, which
     stay agent patches: C00805 (P000115), E00005 (P000124), I00111
     (P000141), I00661 (P000148), P00856 (P000157–P000160), Q00990
     (P000163), S01355 (P000166) and P00816 (P000193). Each splits a
     later marker out of the sense the moved `—2)` split creates, so it
     still applies after it.
   - A00339 (`batch-02-2026-09-04`) and B00881 (`residue-01`) keep their
     `needs_human_judgment` records, with `patches: []`: the escalation
     (class 11 wrong link targets) is unresolved and still reports, and
     A00339 stays the latest of its three records, as before.

   Ruling C's one record per rid is for agent tranches; `reviewed/` is
   outside it (its README), and no rid is newly named by two agent
   tranches. `loadAcceptedCorpus` still supersedes nothing (the
   blessing reads 0 consolidated away). The no-new-text floor exempts a
   reviewed patch; nothing else read these as agent patches: no
   `patterns.jsonl` row, test or `transform:count` baseline counts
   them.
3. **D00072 converted.** P000214, a `replace` that wrote `1)` into the
   gloss (`.) <i>` → `.) 1) <i>`), never became a label, so it could not
   carry a label annotation. It is retired to
   [`docs/archive/patches-retired-2026-10-14/`](../../../../../../docs/archive/patches-retired-2026-10-14/README.md),
   and D00072 gets the pair every other row has, with the same target
   and `expected_before`: P000554, a `retag` of the first source sense
   to `1)` carrying the annotation, then P000555, a `split` at `—2)`
   (which the definition holds once). Its manifest record names the two.

`prompt_version` `rp8-marks-2026-10-14` marks the two new patches; the
moved and amended ones keep theirs.

## The 61

"The entry now" is the built entry's path to the labelled sense, which
carries the one annotation.

| # | rid | headword | patch (before this PR) | companion | the entry now | 10-13 patch | annotation | scan |
|---|---|---|---|---|---|---|---|---|
| 1 | A00339 | `אֲגַר III, אַגְרָא I` | P000079 `retag` (batch-02-2026-09-04) | P000078 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000078; annotated | `source: P000079`; the `—2)` after the unlabelled first sense | [14a · leaf 37](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$38/full/1400,/0/default.jpg) |
| 2 | A00628 | `אוֹי` | P000093 `retag` (seed-doc-08-implied-one) | P000092 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000092; annotated | `source: P000093`; the `—2)` after the unlabelled first sense | [24b · leaf 47](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$48/full/1400,/0/default.jpg) |
| 3 | A02056 | `אֶמְצַע` | P000095 `retag` (seed-doc-08-implied-one) | P000094 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000094; annotated | `source: P000095`; the `—2)` after the unlabelled first sense | [78b · leaf 101](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$102/full/1400,/0/default.jpg) |
| 4 | A02731 | `אָפַל` | P000097 `retag` (seed-doc-08-implied-one) | P000096 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000096; annotated | `source: P000097`; the `—2)` after the unlabelled first sense | [105a · leaf 128](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$129/full/1400,/0/default.jpg) |
| 5 | A03305 | `אֶשְׁכּוֹל, אֶשְׁכֹּל` | P000099 `retag` (seed-doc-08-implied-one) | P000098 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000098; annotated | `source: P000099`; the `—2)` after the unlabelled first sense | [128a · leaf 151](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$152/full/1400,/0/default.jpg) |
| 6 | B00134 | `בָּדִיד` | P000101 `retag` (seed-doc-08-implied-one) | P000100 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000100; annotated | `source: P000101`; the `—2)` after the unlabelled first sense | [140a · leaf 163](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$164/full/1400,/0/default.jpg) |
| 7 | B00807 | `בְּלָאוֹת, בְּלָיוֹת` | P000103 `retag` (seed-doc-08-implied-one) | P000102 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000102; annotated | `source: P000103`; the `—2)` after the unlabelled first sense | [170b · leaf 193](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$194/full/1400,/0/default.jpg) |
| 8 | B00881 | `בָּלַם I` | P000090 `retag` (residue-01) | P000089 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000089; annotated | `source: P000090`; the `—2)` after the unlabelled first sense | [173b · leaf 196](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$197/full/1400,/0/default.jpg) |
| 9 | B01131 | `בִּקְעָה` | P000105 `retag` (seed-doc-08-implied-one) | P000104 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000104; annotated | `source: P000105`; the `—2)` after the unlabelled first sense | [186b · leaf 209](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$210/full/1400,/0/default.jpg) |
| 10 | B01321 | `בַּרְקַאי II` | P000209 `retag` (reviewed) | — | `senses[0]` labelled `1` | annotated in place | `source: P000209`; print read (body-review doc 01) | [197a · leaf 220](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$221/full/1400,/0/default.jpg) |
| 11 | C00095 | `גְּבִינִי` | P000107 `retag` (seed-doc-08-implied-one) | P000106 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000106; annotated | `source: P000107`; the `—2)` after the unlabelled first sense | [206b · leaf 229](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$230/full/1400,/0/default.jpg) |
| 12 | C00252 | `גָּדַשׁ` | P000109 `retag` (seed-doc-08-implied-one) | P000108 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000108; annotated | `source: P000109`; the `—2)` after the unlabelled first sense | [215a · leaf 238](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$239/full/1400,/0/default.jpg) |
| 13 | C00460 | `גּוֹפָן, גּוֹפְנִין` | P000111 `retag` (seed-doc-08-implied-one) | P000110 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000110; annotated | `source: P000111`; the `—2)` after the unlabelled first sense | [225b · leaf 248](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$249/full/1400,/0/default.jpg) |
| 14 | C00580 | `גִּזְרָה, גִּיזְרָה` | P000113 `retag` (seed-doc-08-implied-one) | P000112 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000112; annotated | `source: P000113`; the `—2)` after the unlabelled first sense | [232a · leaf 255](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$256/full/1400,/0/default.jpg) |
| 15 | C00805 | `גִּיר, גִּירָא I` | P000116 `retag` (seed-doc-08-implied-one) | P000114 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000114; annotated | `source: P000116`; the `—2)` after the unlabelled first sense | [241b · leaf 264](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$265/full/1400,/0/default.jpg) |
| 16 | C01169 | `גַּסְטְרָא` | P000212 `retag` (reviewed) | — | `senses[0]` labelled `1` | annotated in place | `source: P000212`; print read (body-review doc 01) | [260b · leaf 283](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$284/full/1400,/0/default.jpg) |
| 17 | C01393 | `גְּרַר` | P000462 `retag` (reviewed) | P000463 `—2)` | `stems[0].senses[0]` labelled `1` | annotated in place | `source: P000462`; the `—2)` after the unlabelled first sense | [272b · leaf 295](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$296/full/1400,/0/default.jpg) |
| 18 | D00038 | `דָּבַב I` | P000118 `retag` (seed-doc-08-implied-one) | P000117 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000117; annotated | `source: P000118`; the `—2)` after the unlabelled first sense | [276a · leaf 299](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$300/full/1400,/0/default.jpg) |
| 19 | D00072 | `דָּבֵק, דָּבַק` | P000214 `replace` (reviewed) | P000555 `—2)` (new) | `senses[0]` labelled `1` | P000214 retired; `retag` P000554 + `split` P000555 (`—2)`) | `source: P000554`; the `—2)` after the unlabelled first sense | [277b · leaf 300](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$301/full/1400,/0/default.jpg) |
| 20 | D00249 | `דּוּכָן` | P000120 `retag` (seed-doc-08-implied-one) | P000119 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000119; annotated | `source: P000120`; the `—2)` after the unlabelled first sense | [285a · leaf 308](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$309/full/1400,/0/default.jpg) |
| 21 | D00325 | `דּוּק` | P000464 `retag` (reviewed) | P000465 `—2)` | `stems[1].senses[0]` labelled `1` | annotated in place | `source: P000464`; the `—2)` after the unlabelled first sense | [287b · leaf 310](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$311/full/1400,/0/default.jpg) |
| 22 | D00807 | `דִּלְדֵּל, דִּילְ׳` | P000122 `retag` (seed-doc-08-implied-one) | P000121 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000121; annotated | `source: P000122`; the `—2)` after the unlabelled first sense | [308b · leaf 331](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$332/full/1400,/0/default.jpg) |
| 23 | E00005 | `הָא I` | P000125 `retag` (seed-doc-08-implied-one) | P000123 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000123; annotated | `source: P000125`; the `—2)` after the unlabelled first sense | [327a · leaf 350](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$351/full/1400,/0/default.jpg) |
| 24 | E00443 | `הִין II` | P000127 `retag` (seed-doc-08-implied-one) | P000126 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000126; annotated | `source: P000127`; the `—2)` after the unlabelled first sense | [348a · leaf 371](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$372/full/1400,/0/default.jpg) |
| 25 | E00679 | `הֲנָיָיה, הֲנייא, הֲנָאָה` | P000129 `retag` (seed-doc-08-implied-one) | P000128 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000128; annotated | `source: P000129`; the `—2)` after the unlabelled first sense | [358a · leaf 381](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$382/full/1400,/0/default.jpg) |
| 26 | G00173 | `זוּל I` | P000466 `retag` (reviewed) | P000467 `—2)` | `senses[0]` labelled `1` | annotated in place | `source: P000466`; the `—2)` after the unlabelled first sense | [386b · leaf 409](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$410/full/1400,/0/default.jpg) |
| 27 | G00403 | `זֵיק` | P000131 `retag` (seed-doc-08-implied-one) | P000130 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000130; annotated | `source: P000131`; the `—2)` after the unlabelled first sense | [395b · leaf 418](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$419/full/1400,/0/default.jpg) |
| 28 | G00652 | `זָקַק` | P000468 `retag` (reviewed) | P000469 `—2)` | `stems[4].senses[0]` labelled `1` | annotated in place | `source: P000468`; the `—2)` after the unlabelled first sense | [410a · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$434/full/1400,/0/default.jpg) |
| 29 | H00242 | `חוֹבָה` | P000133 `retag` (seed-doc-08-implied-one) | P000132 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000132; annotated | `source: P000133`; the `—2)` after the unlabelled first sense | [429a · leaf 452](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$453/full/1400,/0/default.jpg) |
| 30 | H00507 | `חֶזְוָא, חֶזְוָוא, חֵיזְוָא I` | P000135 `retag` (seed-doc-08-implied-one) | P000134 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000134; annotated | `source: P000135`; the `—2)` after the unlabelled first sense | [442a · leaf 465](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$466/full/1400,/0/default.jpg) |
| 31 | H00547 | `חָזִית` | P000137 `retag` (seed-doc-08-implied-one) | P000136 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000136; annotated | `source: P000137`; the `—2)` after the unlabelled first sense | [444a · leaf 467](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$468/full/1400,/0/default.jpg) |
| 32 | H01864 | `חָשַׁק` | P000139 `retag` (seed-doc-08-implied-one) | P000138 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000138; annotated | `source: P000139`; the `—2)` after the unlabelled first sense | [511b · leaf 534](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$535/full/1400,/0/default.jpg) |
| 33 | I00111 | `טוּבָא` | P000142 `retag` (seed-doc-08-implied-one) | P000140 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000140; annotated | `source: P000142`; the `—2)` after the unlabelled first sense | [521b · leaf 544](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$545/full/1400,/0/default.jpg) |
| 34 | I00466 | `טַכְסִיס, טַקְסִיס` | P000144 `retag` (seed-doc-08-implied-one) | P000143 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000143; annotated | `source: P000144`; the `—2)` after the unlabelled first sense | [535b · leaf 558](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$559/full/1400,/0/default.jpg) |
| 35 | I00638 | `טָפַח II` | P000146 `retag` (seed-doc-08-implied-one) | P000145 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000145; annotated | `source: P000146`; the `—2)` after the unlabelled first sense | [546a · leaf 569](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$570/full/1400,/0/default.jpg) |
| 36 | I00661 | `טְפַל` | P000149 `retag` (seed-doc-08-implied-one) | P000147 `—2)` | `stems[1].senses[0]` labelled `1` | moved to `reviewed/` with P000147; annotated | `source: P000149`; the `—2)` after the unlabelled first sense | [547b · leaf 570](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$571/full/1400,/0/default.jpg) |
| 37 | I00853 | `טַרְסִיס` | P000151 `retag` (seed-doc-08-implied-one) | P000150 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000150; annotated | `source: P000151`; the `—2)` after the unlabelled first sense | [555b · leaf 578](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$579/full/1400,/0/default.jpg) |
| 38 | J00114 | `יְהַב` | P000153 `retag` (seed-doc-08-implied-one) | P000152 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000152; annotated | `source: P000153`; the `—2)` after the unlabelled first sense | [565b · leaf 588](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$589/full/1400,/0/default.jpg) |
| 39 | J00459 | `יִסּוּר, יִיסּוּר` | P000155 `retag` (seed-doc-08-implied-one) | P000154 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000154; annotated | `source: P000155`; the `—2)` after the unlabelled first sense | [582b · leaf 605](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$606/full/1400,/0/default.jpg) |
| 40 | J00627 | `ירי, יָרָה` | P000426 `retag` (reviewed) | P000427 `—2)` | `senses[0]` labelled `1` | annotated in place | `source: P000426`; the `—2)` after the unlabelled first sense | [596a · leaf 619](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$620/full/1400,/0/default.jpg) |
| 41 | J00657 | `יֶרֶק` | P000428 `retag` (reviewed) | P000429 `—2)` | `senses[0]` labelled `1` | annotated in place | `source: P000428`; the `—2)` after the unlabelled first sense | [597b · leaf 620](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$621/full/1400,/0/default.jpg) |
| 42 | K00030 | `כָּבֵד I` | P000430 `retag` (reviewed) | P000431 `—2)` | `stems[2].senses[0]` labelled `1` | annotated in place | `source: P000430`; the `—2)` after the unlabelled first sense | [606b · leaf 629](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$630/full/1400,/0/default.jpg) |
| 43 | K00121 | `כְּדִי I, כַּדִּי, כְּדֵי` | P000432 `retag` (reviewed) | P000433 `—2)` | `senses[0]` labelled `1` | annotated in place | `source: P000432`; the `—2)` after the unlabelled first sense | [613a · leaf 636](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$637/full/1400,/0/default.jpg) |
| 44 | K00156 | `כהי, כָּהָה` | P000434 `retag` (reviewed) | P000435 `—2)` | `stems[0].senses[0]` labelled `1` | annotated in place | `source: P000434`; the `—2)` after the unlabelled first sense | [614b · leaf 637](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$638/full/1400,/0/default.jpg) |
| 45 | K00859 | `כָּנַן` | P000436 `retag` (reviewed) | P000437 `—2)` | `stems[0].senses[0]` labelled `1` | annotated in place | `source: P000436`; the `—2)` after the unlabelled first sense | [649a · leaf 672](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$673/full/1400,/0/default.jpg) |
| 46 | N00235 | `נִדְנוּד, נִי׳` | P000438 `retag` (reviewed) | P000439 `—2)` | `senses[0]` labelled `1` | annotated in place | `source: P000438`; the `—2)` after the unlabelled first sense | [879b · leaf 202](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$203/full/1400,/0/default.jpg) |
| 47 | N00577 | `נָטַף` | P000440 `retag` (reviewed) | P000441 `—2)` | `senses[0]` labelled `1` | annotated in place | `source: P000440`; the `—2)` after the unlabelled first sense | [901a · leaf 224](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$225/full/1400,/0/default.jpg) |
| 48 | N01162 | `נָקַד I` | P000442 `retag` (reviewed) | P000443 `—2)` | `senses[0]` labelled `1` | annotated in place | `source: P000442`; the `—2)` after the unlabelled first sense | [931a · leaf 254](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$255/full/1400,/0/default.jpg) |
| 49 | P00816 | `עֲלַל I` | P000190 `retag` (seed-doc-08-sense-runs) | P000191 `—2)`, P000192 `—3)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000191, P000192; annotated | `source: P000190`; the `—2)` after the unlabelled first sense | [1083b · leaf 406](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$407/full/1400,/0/default.jpg) |
| 50 | P00856 | `עָמַך II` | P000161 `retag` (seed-doc-08-implied-one) | P000156 `—2)` | `stems[0].senses[0]` labelled `1` | moved to `reviewed/` with P000156; annotated | `source: P000161`; the `—2)` after the unlabelled first sense | [1086a · leaf 409](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$410/full/1400,/0/default.jpg) |
| 51 | P01055 | `עֵסֶק II` | P000444 `retag` (reviewed) | P000445 `—2)` | `senses[0]` labelled `1` | annotated in place | `source: P000444`; the `—2)` after the unlabelled first sense | [1099a · leaf 422](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$423/full/1400,/0/default.jpg) |
| 52 | Q00990 | `פָּלַח` | P000164 `retag` (seed-doc-08-implied-one) | P000162 `—2)` | `senses[0]` labelled `1` | moved to `reviewed/` with P000162; annotated | `source: P000164`; the `—2)` after the unlabelled first sense | [1178a · leaf 501](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$502/full/1400,/0/default.jpg) |
| 53 | Q01352 | `פֶּסֶק` | P000446 `retag` (reviewed) | P000447 `—2)` | `senses[0]` labelled `1` | annotated in place | `source: P000446`; the `—2)` after the unlabelled first sense | [1200b · leaf 523](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$524/full/1400,/0/default.jpg) |
| 54 | S00826 | `קְטַר, קְטֵיר` | P000448 `retag` (reviewed) | P000449 `—2)` | `senses[0]` labelled `1` | annotated in place | `source: P000448`; the `—2)` after the unlabelled first sense | [1353a · leaf 676](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$677/full/1400,/0/default.jpg) |
| 55 | S01355 | `קָלַל` | P000167 `retag` (seed-doc-08-implied-one) | P000165 `—2)` | `stems[0].senses[0]` labelled `1` | moved to `reviewed/` with P000165; annotated | `source: P000167`; the `—2)` after the unlabelled first sense | [1377b · leaf 700](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$701/full/1400,/0/default.jpg) |
| 56 | S01731 | `קְפֵי, קְפָא` | P000450 `retag` (reviewed) | P000451 `—2)` | `senses[0]` labelled `1` | annotated in place | `source: P000450`; the `—2)` after the unlabelled first sense | [1400b · leaf 723](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$724/full/1400,/0/default.jpg) |
| 57 | T00243 | `רדי, רָדָה II` | P000452 `retag` (reviewed) | P000453 `—2)` | `senses[0]` labelled `1` | annotated in place | `source: P000452`; the `—2)` after the unlabelled first sense | [1452a · leaf 775](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$776/full/1400,/0/default.jpg) |
| 58 | T00375 | `רוּם, רִים` | P000454 `retag` (reviewed) | P000455 `—2)` | `senses[0]` labelled `1` | annotated in place | `source: P000454`; the `—2)` after the unlabelled first sense | [1460a · leaf 783](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$784/full/1400,/0/default.jpg) |
| 59 | T00538 | `רָחַק` | P000456 `retag` (reviewed) | P000457 `—2)` | `stems[1].senses[0]` labelled `1` | annotated in place | `source: P000456`; the `—2)` after the unlabelled first sense | [1469a · leaf 792](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$793/full/1400,/0/default.jpg) |
| 60 | U00960 | `שִׁימּוּר, שִׁמּ׳` | P000458 `retag` (reviewed) | P000459 `—2)` | `senses[0]` labelled `1` | annotated in place | `source: P000458`; the `—2)` after the unlabelled first sense | [1563b · leaf 886](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$887/full/1400,/0/default.jpg) |
| 61 | U01787 | `שְׁפַע` | P000285 `retag` (reviewed) | — | `stems[0].senses[0]` labelled `1` | annotated in place | `source: P000285`; print read (body-review doc 01) | [1618b · leaf 941](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$942/full/1400,/0/default.jpg) |

## D00072

Before, the Kal sense was unlabelled and read ` (b. h.) 1) <i>to
cleave, adhere, stick</i>. `, with `—2) <i>to join, glue, affix</i>`
inside its third unit. After, Kal reads `1 2` as print divides it:
sense 1 ` (b. h.) <i>to cleave, adhere, stick</i>. `, ending `he joined
the Sodomites.`, and sense 2 ` <i>to join, glue, affix</i>. `, with
`(b. h.)` at the head of sense 1 as the other entries keep their lead.
The entry's labels go from `– | – | 1 2 | – | –` (Kal, Nif., Pi., Hif.,
Hithpa.) to `1 2 | – | 1 2 | – | –`. With the tags stripped, the
concatenated text of every gloss and unit differs from before only by
the `1)` and the `—2)` that left it for the labels.

## What the re-import shows

`rm -rf data/entries/[A-Z] && bun data:import && bun qa:format`
changed exactly 61 entry files. Every gate is green, gate 10 (contract)
included, and the blessing reads `Patch corpus: 396 reviewed, 40
accepted, 441 applied` (322, 113 and 440 before) and `Annotations: 66
written (66 print-error, 0 kept, 0 illegible)`: PR #174's 5 and these
61. Checked by script against the tree before:

- for all 61, the labelled sense's `label` is `1` and it carries exactly
  one annotation, `{field: 'label', kind: 'print-error', printed: '',
  stored: '1', source: <the retag>}`, on the sense whose text the
  retag's `expected_before` names;
- the 60 other than D00072: each file's diff is the one `annotations`
  array (and the comma before it), so with annotations masked the entry
  is byte-identical;
- D00072: as above.

No `body/` or `transform/` file and no baseline moved, so
`transform:invariants` did not need to run.
