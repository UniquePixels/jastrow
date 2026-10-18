# Correction audit under ruling 10-13

This is the audit that ruling `10-13 correction policy`
([`decisions.md`](decisions.md) §9) requires and
[`admin/entry/ANNOTATIONS.md`](../admin/entry/ANNOTATIONS.md) §4 sized:
every population the ruling touches, row by row, with the disposition
under the ruling's four cases and the patch a data PR writes for it.
It is a hand-written audit, not a generated report, and it changes
nothing: no entry, patch record or code. The data PRs of §7 execute
from it. Review ledger L64; plan group 6b, item 3.

**Measured at `98804214d`** (`v2`, PR #172), on the committed tree
(32,512 entries) and the 439 patch records under
`admin/pipeline/patch/records/` (288 rids). No entry file has changed
since `c9f572cfa`, where ANNOTATIONS.md §4 was measured, so its counts
and these agree where they overlap; §5 explains the one place this
audit's predicate counts five more rows than §4's.

## How to read it

- The four cases are the ruling's. **Case 1**: a transcription error
  (Sefaria or its OCR) where print is right; corrected silently, the
  patch `rationale` is the trace. **Case 2**: a print error whose
  intended value is determined; corrected, with an annotation `kind:
  'print-error'`. **Case 3**: a print oddity with more than one
  plausible intent; kept, annotated `kept`. **Case 4**: print
  illegible; our best reading, annotated `illegible`.
- A patch sketch gives the op, its target and payload, and the
  `annotation` the record carries (`{kind, printed, evidence, date}`;
  the import adds `field`, `stored` and `source`). Targets are written
  the way the records write them (`sense[—4)]:<hash>`,
  `forms:<hash>`); the hash is the data PR's to compute from
  `expected_before`.
- A scan link opens the 1903 leaf the page index gives for that rid
  (`data/page-index/`), as the worklists do. hOCR quotes are verbatim
  from `data/print/hocr/` (volume 1 is Tesseract, volume 2 ABBYY),
  bidi marks dropped.
- Every count is the output of a script run at `98804214d`; §8 states
  each predicate so the count can be reproduced.

## Summary

| Population | Disposition under 10-13 | Count | Data PR |
|---|---|---|---|
| Implied I, proven by Jastrow's text | case 2: keep the I, display it, annotate | 5 entries | (i) |
| Implied I, sequence only | withdrawn: retire the reform patch, add a reviewed-kept record | 9 entries | (i) |
| Their cross-references | case 1: retarget the link to the I | 10 links in 10 entries | (i) |
| RP8 implied `1)` | case 2, kept: annotate `printed: ''`, `stored: '1'` | 61 patches on 61 entries (36 move from agent tranches to `reviewed/`; D00072 converts) | (ii), done in PR #175 |
| Class 3 doubled numbers | case 2: renumber, one annotation per changed label | 18 entries, 24 annotations | (iii), done in PR #176 |
| S01849's `עָבַר Pi. 4)` | case 2: rewrite to `Pi. 5)`, annotated | 1 | (iii), done in PR #176 |
| U01512's `a) … 2)` | case 3: `annotate`, `kept` | 1 | (iii), done in PR #176 |
| S01780's half-printed qamats | case 4: ticked in round 2, annotated `illegible` | 1 | (iv), done in PR #177 |
| Round 2 (L46) | your ticks, applied under 10-13 | 16 questions | (iv), done in PR #177 |
| Single-numeral cross-references whose target lacks the numeral | 222 determined retargets (case 1; the 10 above among them); 74 rows to read, in 48 worklist questions | 296 rows | (v); determined half (v-a) done in PR #178: 196 retargets |
| P00790's Hif. run | case 2: `a b c d f g h` → `a b c d e f g` | 1 | after L59; done in PR #180: the `relabel` P000812, 3 annotations |
| M00491's implied `1)`, which L36's split of its `—*2)` exposed | case 2: `retag`, annotated `printed: ''`, `stored: '1'`, as RP8's 61 | 1 | group 11 leftovers; done in PR #182: P000815 |
| Past patches with no case | D00341's bracket move and G00675's disambiguator: no annotation | 3 | none |

The mechanisms the data PRs lack or must confirm are collected at the
end of §7.

## 1. Implied I (14 entries)

**Done in PR #174** (data PR (i)): the five reforms amended in place
with a `display` and an annotation, the nine retired with a
reviewed-kept record each, the ten retargets P000544–P000553, and
`implied` retired from the contract. The tranche README,
[`admin/pipeline/patch/records/tranches/implied-i-2026-10-14/`](../admin/pipeline/patch/records/tranches/implied-i-2026-10-14/README.md),
records the result. One correction to the table below: the nine
withdrawals change eight names, not nine. B00537's name is its primary
`בִּיָּא`; its I was on the alternate `בִּיאָה`.

Ruling 10-13 amends 10-06: an implied I is set only where Jastrow's own
text names `X I`. Every entry carrying `implied: true` was found (14,
each set by one reviewed `reform` with `homographs`, P000342–P000355),
and every `<cite>` in the corpus whose text is the form's consonants
followed by `I` was collected, whatever its link target. Five forms are
named `X I` by at least one cite; nine are named by none, and no
plain-text `<he>X</he> I` names any of the fourteen. Each of the 14
reforms' `forms` equals the snapshot's line (headword and
`alt_headwords`), so the reform sets the numeral and changes nothing
else.

| rid | headword now | the II | patch | Jastrow names `X I` | disposition | patch sketch | scan |
|---|---|---|---|---|---|---|---|
| A00311 | `אַגְמָא I (implied)` | A00312 `אַגְמָא II` | P000342 | none | withdrawn: bare, reviewed-kept | retire P000342; reviewed-kept `X10` record on A00312 | [13a · leaf 36](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$37/full/1400,/0/default.jpg) |
| A00889 | `אוֹרְיָין I (implied), אוֹרְיָאן` | A00890 `אוֹרְיָין II, אוֹרְיוֹן` | P000343 | A00882, M01329 | case 2: keep, display, annotate | amend P000343: `homographs: [{form: 0, homograph: 1}]`, `display: "{0} I, {1}"`, `annotation: {kind: 'print-error', printed: '', evidence: <the cites>}` | [34b · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| A02041 | `אֲמָנָה I (implied)` | A02042 `אֲמָנָה II` | P000344 | H01410 | case 2: keep, display, annotate | amend P000344: `homographs: [{form: 0, homograph: 1}]`, `display: "{0} I"`, `annotation: {kind: 'print-error', printed: '', evidence: <the cites>}` | [77b · leaf 100](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$101/full/1400,/0/default.jpg) |
| B00537 | `בִּיָּא, בִּיָיא, בִּיָּה, בִּיָיה, בִּיאָה I (implied)` | B00538 `בִּיאָה II` | P000345 | none | withdrawn: bare, reviewed-kept | retire P000345; reviewed-kept `X10` record on B00538 | [158b · leaf 181](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$182/full/1400,/0/default.jpg) |
| B00935 | `בַּנַּאי I (implied)` | B00936 `בַּנַּאי II, בַּנָּאָה, רַבַּנַּאי` | P000346 | none | withdrawn: bare, reviewed-kept | retire P000346; reviewed-kept `X10` record on B00936 | [176b · leaf 199](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$200/full/1400,/0/default.jpg) |
| C00176 | `גְּדוּדִית I (implied)` | C00177 `גְּדוּדִית II` | P000347 | none | withdrawn: bare, reviewed-kept | retire P000347; reviewed-kept `X10` record on C00177 | [210b · leaf 233](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$234/full/1400,/0/default.jpg) |
| D00442 | `דִּי I (implied)` | D00443 `דִּי II` | P000348 | D00595 | case 2: keep, display, annotate | amend P000348: `homographs: [{form: 0, homograph: 1}]`, `display: "{0} I"`, `annotation: {kind: 'print-error', printed: '', evidence: <the cites>}` | [293b · leaf 316](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$317/full/1400,/0/default.jpg) |
| H00432 | `חוּצָה I (implied)` | H00433 `חוּצָה II` | P000349 | none | withdrawn: bare, reviewed-kept | retire P000349; reviewed-kept `X10` record on H00433 | [438a · leaf 461](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$462/full/1400,/0/default.jpg) |
| H01290 | `חַנִּין I (implied)` | H01291 `חַנִּין II` | P000350 | none | withdrawn: bare, reviewed-kept | retire P000350; reviewed-kept `X10` record on H01291 | [483a · leaf 506](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$507/full/1400,/0/default.jpg) |
| J00112 | `יָהּ I (implied)` | J00113 `יָהּ II` | P000351 | none | withdrawn: bare, reviewed-kept | retire P000351; reviewed-kept `X10` record on J00113 | [565b · leaf 588](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$589/full/1400,/0/default.jpg) |
| O00994 | `סְלִיקוּסְתָּא I (implied)` | O00995 `סְלִיקוּסְתָּא II` | P000352 | none | withdrawn: bare, reviewed-kept | retire P000352; reviewed-kept `X10` record on O00995 | [995a · leaf 318](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$319/full/1400,/0/default.jpg) |
| Q00964 | `פְּלוּגְתָּא I (implied), פְּלֻגְ׳` | Q00965 `פְּלוּגְתָּא II, פְּלוּגְתָּה` | P000353 | Q00942, V00833 | case 2: keep, display, annotate | amend P000353: `homographs: [{form: 0, homograph: 1}]`, `display: "{0} I, {1}"`, `annotation: {kind: 'print-error', printed: '', evidence: <the cites>}` | [1177a · leaf 500](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$501/full/1400,/0/default.jpg) |
| Q01398 | `פַּפָּא I (implied)` | Q01399 `פַּפָּא II, נְהַר פּ׳` | P000354 | none | withdrawn: bare, reviewed-kept | retire P000354; reviewed-kept `X10` record on Q01399 | [1203b · leaf 526](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$527/full/1400,/0/default.jpg) |
| S00336 | `קוּלְיָא I (implied), קוֹ׳` | S00337 `קוּלְיָא II, קַלְיָא` | P000355 | S00961, S01262, S01321, S01360 | case 2: keep, display, annotate | amend P000355: `homographs: [{form: 0, homograph: 1}]`, `display: "{0} I, {1}"`, `annotation: {kind: 'print-error', printed: '', evidence: <the cites>}` | [1328a · leaf 651](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$652/full/1400,/0/default.jpg) |

**The patch for the five.** Each existing reform is amended in place,
so the annotation's `source` is the patch that already sets the
numeral, and the rid keeps one patch per target: `homographs` loses
`implied` (`[{form: 0, homograph: 1}]`), the reform gains the
`display` that sets the ` I` (A00889, Q00964 and S00336 `{0} I, {1}`;
A02041 and D00442 `{0} I`), and it gains

```json
"annotation": {"kind": "print-error", "printed": "", "evidence": "Jastrow's text names `אוֹרְיָין I`: A00882 `v. אוֹרְיָין I`; M01329 `Ar. (v. אוֹרְיָין I)`", "date": "2026-10-14"}
```

with each entry's own cites as evidence (§1.1). In the same PR rule 3
loses its implied clause and `implied` leaves the contract
(ANNOTATIONS.md §2).

**The patch for the nine.** No op is needed to remove the numeral: it
is ours, set by the reform, so the data PR retires the reform (its
bytes to `docs/archive/patches-retired-<date>/`, as PR #160 retired
28, and its `manifest.jsonl` record removed). The form goes back to
bare, the name loses its I (U6: free before go-live), and the X10 row
the headword report then prints for the II is answered by a
reviewed-kept record (ruling 10-06 reviewed kept):

```json
{"shape": "X10 first homograph unnumbered: implied I candidate", "rid": "A00312", "text": "אַגְמָא", "reason": "ruling 10-13: no text of Jastrow's names `אַגְמָא I`; a sole bare candidate before the II is no proof", "source": "ruling 10-13 correction policy", "date": "2026-10-14"}
```

with `rid` and `text` the II's (A00312, B00538, B00936, C00177,
H00433, H01291, J00113, O00995, Q01399). ANNOTATIONS.md §4 says
worklist round 2 also asks whether print sets an I beside A00311; it
does not. The first list asked it (row A00312), and the answer that
P000342 quotes, "no numeral beside it", already says print sets none,
so the withdrawal stands.

### 1.1 The proof for the five, cite by cite

The ten cites are Jastrow's text as Sefaria transcribed it. The hOCR is
quoted where its line was found: it reads `I` at Q00942, V00833, S01321
(`i.`) and S01360, `l)` at M01329 and `ll>` at S00961; the line was
not found for A00882, D00595, H01410 (volume 1) or S01262.

| proves | cite in | the cite in context | hOCR | scan |
|---|---|---|---|---|
| A00889 | A00882 | …, v. **אוֹרְיָין I**… | line not found | [34a · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| A00889 | M01329 | …Gen. R. s. 50, beg. Ar. (v. **אוֹרְיָין I**); Lev. R. s. 27 מתורין (corr. acc.).… | `iers. Gen.R. s.50, beg. Ar.(v. "p^ixl); Lev.R.s. 27 "p-llha` | [780b · leaf 103](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$104/full/1400,/0/default.jpg) |
| A02041 | H01410 | …Gen. R. s. 32, a. e. מח׳ אמנה, v. **אֲמָנָה I**. … | line not found | [489b · leaf 512](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$513/full/1400,/0/default.jpg) |
| D00442 | D00595 | … v. **דִּי I**… | line not found | [299b · leaf 322](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$323/full/1400,/0/default.jpg) |
| Q00964 | Q00942 | …Targ. II Sam. XXII, 44 ed. Wil., v. **פְּלוּגְתָּא I**.… | `XXII, 44 ed. Wil., v. xmibs I.` | [1176b · leaf 499](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$500/full/1400,/0/default.jpg) |
| Q00964 | V00833 | …f. = **פְּלוּגְתָּא I**, difference of opinion. … | `^•V'.>?"^ f- — KtWbp I, difference of opinion. Y.` | [1687a · leaf 1010](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1011/full/1400,/0/default.jpg) |
| S00336 | S00961 | …, v. **קוּלְיָא I**… | `Lev. R. b. 15; Yalk. Esth. 1056 (not rb*p), v. Klip ll>` | [1360a · leaf 683](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$684/full/1400,/0/default.jpg) |
| S00336 | S01262 | …, v. **קוּלְיָא I**… | line not found | [1372b · leaf 695](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$696/full/1400,/0/default.jpg) |
| S00336 | S01321 | …Ib. XXV, 18 (ed. Wil. קָלַיָּא pl.).—V. **קוּלְיָא I**.… | `17 (some ed. *-&%). lb. XXV, 18 (ed. Wil. 6$J3 pi.).— V.` / `Vrtap i.` | [1375b · leaf 698](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$699/full/1400,/0/default.jpg) |
| S00336 | S01360 | …, Targ. Ez. XXVII, 17, quot. in Rashi a. l., misreading for קלווא, v. **קוּלְיָא I**… | `reading for xii'-p, v. x^p I.` | [1378b · leaf 701](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$702/full/1400,/0/default.jpg) |

### 1.2 Their 10 cross-references

Sefaria's linker points all ten at the II. The target is Sefaria's
error and the text is Jastrow's, so each is case 1: a `replace` on the
citing sense whose `find` is the source anchor (it occurs once in its
definition in all ten) and whose `replace` is the same anchor naming
the I's link key (ruling 10-09 link key: the snapshot's line as the
transforms leave it; here the I's bare `sefariaHeadword`, which
existing links into all five already resolve by). No annotation. The
precedent is P000306 (B00097), which re-aimed an anchor the same way.
For A00882:

```json
{"op": "replace", "target": "sense[]:<hash>", "payload": {"find": "<a class=\"refLink\" href=\"/Jastrow,_אוֹרְיָין II.1\" data-ref=\"Jastrow, אוֹרְיָין II 1\"><span dir=\"rtl\">אוֹרְיָין</span> I</a>", "replace": "<a class=\"refLink\" href=\"/Jastrow,_אוֹרְיָין.1\" data-ref=\"Jastrow, אוֹרְיָין 1\"><span dir=\"rtl\">אוֹרְיָין</span> I</a>"}}
```

| citing rid | source sense | key now → key after | retarget |
|---|---|---|---|
| A00882 | `senses[0]` | `אוֹרְיָין II` → `אוֹרְיָין` | A00890 → **A00889** |
| M01329 | `senses[0]` | `אוֹרְיָין II` → `אוֹרְיָין` | A00890 → **A00889** |
| H01410 | `senses[1].senses[0]` | `אֲמָנָה II` → `אֲמָנָה` | A02042 → **A02041** |
| D00595 | `senses[0]` | `דִּי II` → `דִּי` | D00443 → **D00442** |
| Q00942 | `senses[4]` | `פְּלוּגְתָּא II` → `פְּלוּגְתָּא` | Q00965 → **Q00964** |
| V00833 | `senses[0]` | `פְּלוּגְתָּא II` → `פְּלוּגְתָּא` | Q00965 → **Q00964** |
| S00961 | `senses[0]` | `קוּלְיָא II` → `קוּלְיָא` | S00337 → **S00336** |
| S01262 | `senses[0]` | `קוּלְיָא II` → `קוּלְיָא` | S00337 → **S00336** |
| S01321 | `senses[0]` | `קוּלְיָא II` → `קוּלְיָא` | S00337 → **S00336** |
| S01360 | `senses[0]` | `קוּלְיָא II` → `קוּלְיָא` | S00337 → **S00336** |

Round 2's two text-proven implied Is, H00319 (`חוּל I`) and I00077
(`טְבַע I`), are not among the 14: they are new, ticked in your working
copy, and go in data PR (iv) with the same patch shape as the five.

## 2. RP8's implied `1)` (61 patches)

**Done in PR #175** (data PR (ii);
[`admin/pipeline/patch/records/tranches/rp8-marks-2026-10-14/`](../admin/pipeline/patch/records/tranches/rp8-marks-2026-10-14/README.md)):
24 retags annotated in place, 36 moved to `reviewed/` with their 37
`implied-one` splits, D00072 converted (P000554, P000555); the
blessing reads 66 annotations. Two corrections to what follows: the
print read B01321's, C01169's and U01787's rationale cites is
body-review doc 01 (note 1, and C01169's Unclassified row), not doc 04;
and in eight rows "the data now" is not the built entry's path to the
label (C01393, D00072, D00325, G00652, K00030, K00156, P00856,
U01787): the tranche README gives each one's.

Case 2, kept: a `2)` after an unlabelled first sense determines the
`1)`. Each owes `annotation: {kind: 'print-error', printed: '',
evidence: …, date: '2026-10-14'}`; the import writes it on the sense's
`label` with `stored: '1'`. For the 57 with a companion split the
evidence is that split's marker (`a —2) follows the unlabelled first
sense`); for B01321, C01169 and U01787 it is the print read their
reviewed rationale cites (review doc 04).

### 2.1 Where they sit decides the patch

Only a reviewed patch may carry an annotation (`applyPatch` refuses
one on an agent patch). **36 of the 60 `retag` patches are agent
records** (33 in `seed-doc-08-implied-one`, one each in
`batch-02-2026-09-04`, `residue-01` and `seed-doc-08-sense-runs`), so
the RP8 data PR moves each, with its companion split, into
`reviewed/`, and removes them from their tranche manifests. The split
moves too so the pair keeps its order: reviewed patches apply before
agent ones. The other 24 retags are already reviewed and gain the
field in place; D00072 converts (§2.3).

### 2.2 The 61

| # | rid | headword | patch (where) | companion | the data now | 10-13 patch | scan |
|---|---|---|---|---|---|---|---|
| 1 | A00339 | `אֲגַר III, אַגְרָא I` | P000079 `retag` (batch-02-2026-09-04) | P000078 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [14a · leaf 37](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$38/full/1400,/0/default.jpg) |
| 2 | A00628 | `אוֹי` | P000093 `retag` (seed-doc-08-implied-one) | P000092 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [24b · leaf 47](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$48/full/1400,/0/default.jpg) |
| 3 | A02056 | `אֶמְצַע` | P000095 `retag` (seed-doc-08-implied-one) | P000094 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [78b · leaf 101](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$102/full/1400,/0/default.jpg) |
| 4 | A02731 | `אָפַל` | P000097 `retag` (seed-doc-08-implied-one) | P000096 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [105a · leaf 128](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$129/full/1400,/0/default.jpg) |
| 5 | A03305 | `אֶשְׁכּוֹל, אֶשְׁכֹּל` | P000099 `retag` (seed-doc-08-implied-one) | P000098 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [128a · leaf 151](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$152/full/1400,/0/default.jpg) |
| 6 | B00134 | `בָּדִיד` | P000101 `retag` (seed-doc-08-implied-one) | P000100 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [140a · leaf 163](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$164/full/1400,/0/default.jpg) |
| 7 | B00807 | `בְּלָאוֹת, בְּלָיוֹת` | P000103 `retag` (seed-doc-08-implied-one) | P000102 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [170b · leaf 193](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$194/full/1400,/0/default.jpg) |
| 8 | B00881 | `בָּלַם I` | P000090 `retag` (residue-01) | P000089 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [173b · leaf 196](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$197/full/1400,/0/default.jpg) |
| 9 | B01131 | `בִּקְעָה` | P000105 `retag` (seed-doc-08-implied-one) | P000104 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [186b · leaf 209](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$210/full/1400,/0/default.jpg) |
| 10 | B01321 | `בַּרְקַאי II` | P000209 `retag` (reviewed) | — | `senses[0]` labelled `1` | add `annotation` | [197a · leaf 220](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$221/full/1400,/0/default.jpg) |
| 11 | C00095 | `גְּבִינִי` | P000107 `retag` (seed-doc-08-implied-one) | P000106 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [206b · leaf 229](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$230/full/1400,/0/default.jpg) |
| 12 | C00252 | `גָּדַשׁ` | P000109 `retag` (seed-doc-08-implied-one) | P000108 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [215a · leaf 238](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$239/full/1400,/0/default.jpg) |
| 13 | C00460 | `גּוֹפָן, גּוֹפְנִין` | P000111 `retag` (seed-doc-08-implied-one) | P000110 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [225b · leaf 248](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$249/full/1400,/0/default.jpg) |
| 14 | C00580 | `גִּזְרָה, גִּיזְרָה` | P000113 `retag` (seed-doc-08-implied-one) | P000112 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [232a · leaf 255](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$256/full/1400,/0/default.jpg) |
| 15 | C00805 | `גִּיר, גִּירָא I` | P000116 `retag` (seed-doc-08-implied-one) | P000114 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [241b · leaf 264](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$265/full/1400,/0/default.jpg) |
| 16 | C01169 | `גַּסְטְרָא` | P000212 `retag` (reviewed) | — | `senses[0]` labelled `1` | add `annotation` | [260b · leaf 283](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$284/full/1400,/0/default.jpg) |
| 17 | C01393 | `גְּרַר` | P000462 `retag` (reviewed) | P000463 `—2)` | `senses[0]` labelled `1` | add `annotation` | [272b · leaf 295](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$296/full/1400,/0/default.jpg) |
| 18 | D00038 | `דָּבַב I` | P000118 `retag` (seed-doc-08-implied-one) | P000117 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [276a · leaf 299](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$300/full/1400,/0/default.jpg) |
| 19 | D00072 | `דָּבֵק, דָּבַק` | P000214 `replace` (reviewed) | — | `stems[1].senses[0]` labelled `1` | retire; `retag` `1)` + `split` `—2)` (§2.3) | [277b · leaf 300](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$301/full/1400,/0/default.jpg) |
| 20 | D00249 | `דּוּכָן` | P000120 `retag` (seed-doc-08-implied-one) | P000119 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [285a · leaf 308](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$309/full/1400,/0/default.jpg) |
| 21 | D00325 | `דּוּק` | P000464 `retag` (reviewed) | P000465 `—2)` | `senses[1]` labelled `1` | add `annotation` | [287b · leaf 310](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$311/full/1400,/0/default.jpg) |
| 22 | D00807 | `דִּלְדֵּל, דִּילְ׳` | P000122 `retag` (seed-doc-08-implied-one) | P000121 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [308b · leaf 331](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$332/full/1400,/0/default.jpg) |
| 23 | E00005 | `הָא I` | P000125 `retag` (seed-doc-08-implied-one) | P000123 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [327a · leaf 350](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$351/full/1400,/0/default.jpg) |
| 24 | E00443 | `הִין II` | P000127 `retag` (seed-doc-08-implied-one) | P000126 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [348a · leaf 371](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$372/full/1400,/0/default.jpg) |
| 25 | E00679 | `הֲנָיָיה, הֲנייא, הֲנָאָה` | P000129 `retag` (seed-doc-08-implied-one) | P000128 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [358a · leaf 381](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$382/full/1400,/0/default.jpg) |
| 26 | G00173 | `זוּל I` | P000466 `retag` (reviewed) | P000467 `—2)` | `senses[0]` labelled `1` | add `annotation` | [386b · leaf 409](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$410/full/1400,/0/default.jpg) |
| 27 | G00403 | `זֵיק` | P000131 `retag` (seed-doc-08-implied-one) | P000130 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [395b · leaf 418](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$419/full/1400,/0/default.jpg) |
| 28 | G00652 | `זָקַק` | P000468 `retag` (reviewed) | P000469 `—2)` | `senses[1]` labelled `1` | add `annotation` | [410a · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$434/full/1400,/0/default.jpg) |
| 29 | H00242 | `חוֹבָה` | P000133 `retag` (seed-doc-08-implied-one) | P000132 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [429a · leaf 452](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$453/full/1400,/0/default.jpg) |
| 30 | H00507 | `חֶזְוָא, חֶזְוָוא, חֵיזְוָא I` | P000135 `retag` (seed-doc-08-implied-one) | P000134 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [442a · leaf 465](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$466/full/1400,/0/default.jpg) |
| 31 | H00547 | `חָזִית` | P000137 `retag` (seed-doc-08-implied-one) | P000136 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [444a · leaf 467](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$468/full/1400,/0/default.jpg) |
| 32 | H01864 | `חָשַׁק` | P000139 `retag` (seed-doc-08-implied-one) | P000138 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [511b · leaf 534](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$535/full/1400,/0/default.jpg) |
| 33 | I00111 | `טוּבָא` | P000142 `retag` (seed-doc-08-implied-one) | P000140 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [521b · leaf 544](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$545/full/1400,/0/default.jpg) |
| 34 | I00466 | `טַכְסִיס, טַקְסִיס` | P000144 `retag` (seed-doc-08-implied-one) | P000143 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [535b · leaf 558](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$559/full/1400,/0/default.jpg) |
| 35 | I00638 | `טָפַח II` | P000146 `retag` (seed-doc-08-implied-one) | P000145 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [546a · leaf 569](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$570/full/1400,/0/default.jpg) |
| 36 | I00661 | `טְפַל` | P000149 `retag` (seed-doc-08-implied-one) | P000147 `—2)` | `stems[1].senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [547b · leaf 570](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$571/full/1400,/0/default.jpg) |
| 37 | I00853 | `טַרְסִיס` | P000151 `retag` (seed-doc-08-implied-one) | P000150 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [555b · leaf 578](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$579/full/1400,/0/default.jpg) |
| 38 | J00114 | `יְהַב` | P000153 `retag` (seed-doc-08-implied-one) | P000152 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [565b · leaf 588](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$589/full/1400,/0/default.jpg) |
| 39 | J00459 | `יִסּוּר, יִיסּוּר` | P000155 `retag` (seed-doc-08-implied-one) | P000154 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [582b · leaf 605](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$606/full/1400,/0/default.jpg) |
| 40 | J00627 | `ירי, יָרָה` | P000426 `retag` (reviewed) | P000427 `—2)` | `senses[0]` labelled `1` | add `annotation` | [596a · leaf 619](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$620/full/1400,/0/default.jpg) |
| 41 | J00657 | `יֶרֶק` | P000428 `retag` (reviewed) | P000429 `—2)` | `senses[0]` labelled `1` | add `annotation` | [597b · leaf 620](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$621/full/1400,/0/default.jpg) |
| 42 | K00030 | `כָּבֵד I` | P000430 `retag` (reviewed) | P000431 `—2)` | `stems[0].senses[0]` labelled `1` | add `annotation` | [606b · leaf 629](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$630/full/1400,/0/default.jpg) |
| 43 | K00121 | `כְּדִי I, כַּדִּי, כְּדֵי` | P000432 `retag` (reviewed) | P000433 `—2)` | `senses[0]` labelled `1` | add `annotation` | [613a · leaf 636](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$637/full/1400,/0/default.jpg) |
| 44 | K00156 | `כהי, כָּהָה` | P000434 `retag` (reviewed) | P000435 `—2)` | `senses[0]` labelled `1` | add `annotation` | [614b · leaf 637](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$638/full/1400,/0/default.jpg) |
| 45 | K00859 | `כָּנַן` | P000436 `retag` (reviewed) | P000437 `—2)` | `stems[0].senses[0]` labelled `1` | add `annotation` | [649a · leaf 672](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$673/full/1400,/0/default.jpg) |
| 46 | N00235 | `נִדְנוּד, נִי׳` | P000438 `retag` (reviewed) | P000439 `—2)` | `senses[0]` labelled `1` | add `annotation` | [879b · leaf 202](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$203/full/1400,/0/default.jpg) |
| 47 | N00577 | `נָטַף` | P000440 `retag` (reviewed) | P000441 `—2)` | `senses[0]` labelled `1` | add `annotation` | [901a · leaf 224](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$225/full/1400,/0/default.jpg) |
| 48 | N01162 | `נָקַד I` | P000442 `retag` (reviewed) | P000443 `—2)` | `senses[0]` labelled `1` | add `annotation` | [931a · leaf 254](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$255/full/1400,/0/default.jpg) |
| 49 | P00816 | `עֲלַל I` | P000190 `retag` (seed-doc-08-sense-runs) | P000191 `—2)`, P000192 `—3)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [1083b · leaf 406](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$407/full/1400,/0/default.jpg) |
| 50 | P00856 | `עָמַך II` | P000161 `retag` (seed-doc-08-implied-one) | P000156 `—2)` | `senses[1]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [1086a · leaf 409](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$410/full/1400,/0/default.jpg) |
| 51 | P01055 | `עֵסֶק II` | P000444 `retag` (reviewed) | P000445 `—2)` | `senses[0]` labelled `1` | add `annotation` | [1099a · leaf 422](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$423/full/1400,/0/default.jpg) |
| 52 | Q00990 | `פָּלַח` | P000164 `retag` (seed-doc-08-implied-one) | P000162 `—2)` | `senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [1178a · leaf 501](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$502/full/1400,/0/default.jpg) |
| 53 | Q01352 | `פֶּסֶק` | P000446 `retag` (reviewed) | P000447 `—2)` | `senses[0]` labelled `1` | add `annotation` | [1200b · leaf 523](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$524/full/1400,/0/default.jpg) |
| 54 | S00826 | `קְטַר, קְטֵיר` | P000448 `retag` (reviewed) | P000449 `—2)` | `senses[0]` labelled `1` | add `annotation` | [1353a · leaf 676](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$677/full/1400,/0/default.jpg) |
| 55 | S01355 | `קָלַל` | P000167 `retag` (seed-doc-08-implied-one) | P000165 `—2)` | `stems[0].senses[0]` labelled `1` | move to `reviewed/` with its companion, add `annotation` | [1377b · leaf 700](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$701/full/1400,/0/default.jpg) |
| 56 | S01731 | `קְפֵי, קְפָא` | P000450 `retag` (reviewed) | P000451 `—2)` | `senses[0]` labelled `1` | add `annotation` | [1400b · leaf 723](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$724/full/1400,/0/default.jpg) |
| 57 | T00243 | `רדי, רָדָה II` | P000452 `retag` (reviewed) | P000453 `—2)` | `senses[0]` labelled `1` | add `annotation` | [1452a · leaf 775](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$776/full/1400,/0/default.jpg) |
| 58 | T00375 | `רוּם, רִים` | P000454 `retag` (reviewed) | P000455 `—2)` | `senses[0]` labelled `1` | add `annotation` | [1460a · leaf 783](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$784/full/1400,/0/default.jpg) |
| 59 | T00538 | `רָחַק` | P000456 `retag` (reviewed) | P000457 `—2)` | `stems[1].senses[0]` labelled `1` | add `annotation` | [1469a · leaf 792](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$793/full/1400,/0/default.jpg) |
| 60 | U00960 | `שִׁימּוּר, שִׁמּ׳` | P000458 `retag` (reviewed) | P000459 `—2)` | `senses[0]` labelled `1` | add `annotation` | [1563b · leaf 886](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$887/full/1400,/0/default.jpg) |
| 61 | U01787 | `שְׁפַע` | P000285 `retag` (reviewed) | — | `senses[0]` labelled `1` | add `annotation` | [1618b · leaf 941](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$942/full/1400,/0/default.jpg) |

### 2.3 D00072

P000214 is a `replace` that writes `1)` into the text (`.) <i>` →
`.) 1) <i>`). It never becomes a label: the committed entry's Kal
sense is unlabelled, its gloss reads ` (b. h.) 1) <i>to cleave,
adhere, stick</i>. `, and the `—2)` run sits inside a unit. An
annotation on a `replace` describes a gloss or unit substring, not a
label. **The source segment allows a `retag`**: the snapshot's first
definition holds `—2)` exactly once. So the RP8 PR retires P000214 and
writes the pair every other row has: a `retag` `sense[]` → `1)`
carrying the annotation, then a `split` at `—2)`. Kal then reads `1 2`
as print divides it, with `(b. h.)` at the head of sense 1 as the
other 57 keep their lead. No new op is needed.

## 3. Class 3 doubled numbers (18 entries, 24 annotations) and S01849

**Done in PR #176** (data PR (iii)): the 24 `retag`s are P000556–P000579,
S01849's `replace` is P000580, and every list below now reads as its
"after" column
([tranche README](../admin/pipeline/patch/records/tranches/class3-renumber-2026-10-15/README.md)).
The two searches, re-run there on the re-imported tree, find the same
184 links and the same two hits.

Ruling 10-13 flips class 3's "keep print's number": each run is
renumbered, one annotation per changed label. The table reads the
committed labels (they match the right-hand lists of
[the class 3 README](../admin/pipeline/patch/records/tranches/class3-2026-10-12/README.md))
and renumbers every label after the doubled one to previous + 1. Each
changed label is one reviewed `retag`, appended after the entry's
splits (P000518–P000537) and targeting the source sense as they left
it (for the second `N`, the sibling the split made; the two `—N)`
senses differ by hash), with payload `{number: '—M)'}` and

```json
"annotation": {"kind": "print-error", "printed": "4", "evidence": "print sets 4) twice (B01153, 188b); the run 1 2 *3 4 4 determines the second as 5 (class 3 scan review, ticked 2026-10-12)", "date": "2026-10-14"}
```

A `split` cannot carry an annotation, so the renumber is a separate
`retag`: 24 new patches.

| rid | headword | section | labels now → after | annotations | `retag` per changed label (label: print → stored) | split patch(es) | links in; sense named | scan |
|---|---|---|---|---|---|---|---|---|
| B01153 | `בַּר, בָּר, בָּרָא` | senses | `1 2 *3 4 4` → `1 2 *3 4 5` | 1 | `4` → `5` | P000518 | 21; none | [188b · leaf 211](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$212/full/1400,/0/default.jpg) |
| B01299 | `בְּרַם` | senses | `· 1 2 3 3` → `· 1 2 3 4` | 1 | `3` → `4` | P000519 | 3; none | [196a · leaf 219](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$220/full/1400,/0/default.jpg) |
| C00399 | `גּוֹלְמָא` | senses | `1 2 2 3` → `1 2 3 4` | 2 | `2` → `3`; `3` → `4` | P000520 | 7; none | [222a · leaf 245](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$246/full/1400,/0/default.jpg) |
| C00871 | `גַּלְגַּל` | senses | `· 1 2 3 3` → `· 1 2 3 4` | 1 | `3` → `4` | P000521 | 11; none | [244b · leaf 267](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$268/full/1400,/0/default.jpg) |
| C00872 | `גַּלְגַּל, גִּלְגְּלָא, גִּילְ׳` | senses | `1 2 3 4 4` → `1 2 3 4 5` | 1 | `4` → `5` | P000522 | 7; none | [245a · leaf 268](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$269/full/1400,/0/default.jpg) |
| G00456 | `זְכֵי, זְכָא` | Kal | `1 2 3 4 4` → `1 2 3 4 5` | 1 | `4` → `5` | P000523 | 5; none | [399a · leaf 422](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$423/full/1400,/0/default.jpg) |
| H00940 | `חֲכַם, חֲכִים, חַכִּים` | Kal | `· 1 2 2 3` → `· 1 2 3 4` | 2 | `2` → `3`; `3` → `4` | P000524 | 9; none | [462b · leaf 485](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$486/full/1400,/0/default.jpg) |
| H01899 | `חָתַם` | Kal | `1 2 2 3` → `1 2 3 4` | 2 | `2` → `3`; `3` → `4` | P000525 | 5; none | [513b · leaf 536](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$537/full/1400,/0/default.jpg) |
| I00712 | `טָרַד` | Kal | `· 1 2 3 3 4 (a b)` → `· 1 2 3 4 5 (a b)` | 2 | `3` → `4`; `4` → `5` | P000526 | 19; none | [550a · leaf 573](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$574/full/1400,/0/default.jpg) |
| K00086 | `כֵּבַשׁ II, כִּבְשָׁא, כִּיבְשָׁא` | senses | `1 2 3 4 5 6 6` → `1 2 3 4 5 6 7` | 1 | `6` → `7` | P000527 | 4; none | [611b · leaf 634](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$635/full/1400,/0/default.jpg) |
| K01280 | `כָּרַת` | Kal | `1 2 3 3` → `1 2 3 4` | 1 | `3` → `4` | P000528 | 8; none | [674a · leaf 697](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$698/full/1400,/0/default.jpg) |
| M00596 | `מוּקְצֶה` | senses | `· 1 2 3 4 4` → `· 1 2 3 4 5` | 1 | `4` → `5` | P000529 | 16; none | [747b · leaf 70](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$71/full/1400,/0/default.jpg) |
| M02130 | `מַעֲלָה` | senses | `· 1 2 3 3 (a b c d)` → `· 1 2 3 4 (a b c d)` | 1 | `3` → `4` | P000530 | 3; none | [817a · leaf 140](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$141/full/1400,/0/default.jpg) |
| N01139 | `נָצַץ, נוּץ` | Hif. | `1 2 2` → `1 2 3` | 1 | `2` → `3` | P000531 | 9; none | [929b · leaf 252](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$253/full/1400,/0/default.jpg) |
| P00059 | `עָבַר` | Pi. | `1 2 3 4 4 6` → `1 2 3 4 5 6` | 1 | `4` → `5` | P000532–P000534 | 33; S01849 `Pi. 4)` | [1038a · leaf 361](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$362/full/1400,/0/default.jpg) |
| Q01502 | `פָּקַע` | Hif. | `1 2 2 3` → `1 2 3 4` | 2 | `2` → `3`; `3` → `4` | P000535 | 11; none | [1210a · leaf 533](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$534/full/1400,/0/default.jpg) |
| S00151 | `קְדַם` | Af. | `1 2 3 3 4` → `1 2 3 4 5` | 2 | `3` → `4`; `4` → `5` | P000536 | 3; none | [1316b · leaf 639](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$640/full/1400,/0/default.jpg) |
| V00909 | `תְּקַף, תְּקֵיף` | Kal | `1 2 3 4 4` → `1 2 3 4 5` | 1 | `4` → `5` | P000537 | 2; none | [1693b · leaf 1016](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1017/full/1400,/0/default.jpg) |

**Cross-references that name a renumbered sense.** Two searches over
every gloss and unit of the 32,512 entries: (1) every `<cite>` whose
`ref` is one of the 18 rids or P00790, with its own text ending `N)`,
or the 30 characters after it starting with an optional stem
abbreviation (`Pi.`, `Hif.`, `Af.` and the rest), an optional dash or
star, and `N)` or a letter `)`; (2) every `<he>` word outside a cite
whose consonants are one of those entries' forms, followed by the same
pattern. Of the 184 links into the 19 entries, search (1) finds two
hits and search (2) none; search (2)'s pattern fires 91 times across
the corpus, so its silence here is not a blind pattern. None of the 18
entries holds an in-entry `supra`, `infra`, `preced.` or `next` with a
sense number.

| hit | text | names | disposition |
|---|---|---|---|
| S01849 `units[2]` | `v. עָבַר Pi. 4). Y. Shek. l. c.` | P00059's second Pi. `4)` (the city limits) | case 2: `replace` `{find: "4). Y. Shek.", replace: "5). Y. Shek."}`, the shortest balanced substring holding the `4)` that occurs once (the snapshot holds `4)` once in that definition), annotated `printed: "4). Y. Shek."`, evidence `P00059's Pi. run prints 4) twice; this names the second (the city limits)`. [1408b · leaf 731](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$732/full/1400,/0/default.jpg) |
| P00791 `stems[0].senses[0]` | `preced.` then ` Hif. c) to balance` | P00790's Hif. `c)` | none: `c` keeps its letter under the L59 relabel (`a b c d` stay); confirmed in PR #180, P00791's file unchanged |

## 4. P00790, U01512 and S01780

| rid | the data now | case | patch | scan |
|---|---|---|---|---|
| P00790 | Hif. sense 2 has seven children `a`–`g`; `e`, `f`, `g` are annotated `printed` `f`, `g`, `h` (P000812, PR #180). Until then it held `a b c d`, with `f) g) h)` left in `d`'s text (L55) | 2 | waited on L59's lettered relabel: `a b c d f g h` → `a b c d e f g`, one annotation per changed child label (`printed` `f`, `g`, `h`), evidence `print skips e) (1081a); the run determines it`. **Done in PR #180:** the `relabel` P000812, payload `{run: [a b c d f g h], to: [a b c d e f g]}`; Hif. sense 2 has seven children `a`–`g`, and `e`, `f`, `g` carry `printed` `f`, `g`, `h`. The re-import changes P00790 alone | [1081a · leaf 404](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$405/full/1400,/0/default.jpg) |
| U01512 | Af. `1 2 · (a 2)`: the nest of P000543 | 3 | `annotate` on the nest's `2)` child, payload `{field: 'label'}`, annotation `{kind: 'kept', printed: '2', evidence: 'print sets a) then 2): read as 1) 2) or a) b); kept (ruling 10-12; your note "2)", 2026-10-12)', date: '2026-10-14'}`. To confirm in the PR: that an `annotate` target reaches a child a `nest` made. **Done in PR #176:** P000581; the target reaches the nested child with no code change | [1599a · leaf 922](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$923/full/1400,/0/default.jpg) |
| S01780 | `קֵץ`, `קִצ`, `ּא`, `קִי׳`: the alternate torn in two | 4 | ticked in round 2 (working copy): `קִצָּא`, with your note that only part of the qamats printed. Two chained reviewed `reform`s, because a reform that changes the number of forms cannot carry an annotation: first rejoin `קִצ` + `ּא` (case 1, no annotation), then respell `קִצּא` → `קִצָּא` with `{kind: 'illegible', printed: 'קִצּא', evidence: 'only the vertical stroke of the qamats printed; S01120 spells the word קִצָּא', date: …}`. **Done in PR #177:** P000588 rejoins the form (no annotation), P000589 respells it with the `illegible` annotation, its evidence quoting your note; the two reforms chain in corpus order with no code change | [1404a · leaf 727](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$728/full/1400,/0/default.jpg) |

## 5. The 296 cross-reference numerals

**The population.** Every internal `<cite>` (its `ref` a rid) in any
gloss or unit whose visible text is one word and one Roman numeral,
and whose target entry carries that numeral on no form. ANNOTATIONS.md
§4 counted 291 of 3,829 with the text exactly `<word> <numeral>`, and
that predicate reproduces 291 of 3,829 here. Five more cites carry the
numeral with a closing parenthesis inside the cite (`לוּן I)`,
`רָעָה I)` twice, `עָמַד II)`, `שָׁנָה I)`), so the population
here is 296 of 3,922; the five are marked in the counts.

**The classes**, by machine, in this order:

- **(a) A member carries the numeral.** The family is every form,
  alternates included, whose consonants (every point stripped, as
  10-05) equal the cite word's, cut into runs wherever two members are
  more than five entries apart; the cite's family is the run holding
  its target. A carrier is a family entry other than the target that
  carries the numeral, on the matching form first, else anywhere on
  its line. **Determined (222)**: exactly one carrier, or exactly one
  whose form is spelled as the cite, and that carrier's form is spelled
  as the cite: Sefaria's linker picked the wrong member; case 1,
  retarget. **To read (29)**: several carriers and no single exact
  spelling (15), or one carrier pointed otherwise (14).
- **(b) No carrier, and the family has exactly one bare entry** (no
  numeral anywhere on its line): 15. Candidate evidence under 10-13:
  Jastrow's text names a numeral no entry carries.
- **(c) No carrier, and the target carries a different numeral**: 21.
- **(d) Anything else** (the target bare, and no bare member or
  several): 9.

| class | names I | names II–V | total | of which the five `…)` texts |
|---|---|---|---|---|
| (a) determined | 177 | 45 | 222 | 2 |
| (a) to read | 23 | 6 | 29 | 0 |
| (b) | 6 | 9 | 15 | 0 |
| (c) | 4 | 17 | 21 | 1 |
| (d) | 9 | 0 | 9 | 2 |
| total | 219 | 77 | 296 | 5 |

ANNOTATIONS.md §4's split of the 291 (215 naming I, 76 naming II or
higher) reads 219 and 77 here with the five added.

**The 74 rows to read** ((a) to read, (b), (c), (d)) are a new
worklist section, one question per family and numeral, 48 questions:
moved from `headword-worklist.md` to `maintainer-checklist.md` in
PR #186, then split on 2026-10-18: the 8 answered that day are in
[`maintainer-checklist.md` § Cross-reference numerals: answered 2026-10-18 (8)](maintainer-checklist.md#cross-reference-numerals-answered-2026-10-18-8),
the 18 whose answer may rename an entry in
[§ Cross-reference numerals: may rename an entry (18)](maintainer-checklist.md#cross-reference-numerals-may-rename-an-entry-18)
there, and the other 22, deferred post go-live 2026-10-18 by the
maintainer's blocker definition, in
[`post-go-live-review.md` § Cross-reference numerals (2026-10-14)](post-go-live-review.md#cross-reference-numerals-2026-10-14).
(b) is there too, beyond what (c) and (d) alone would need: a single
bare member is a candidate, not a proof, and reading the 13 (b)
families shows why (the bare member is sometimes the target itself or
a word of another meaning). Reading the families also found Sefaria
dropping numerals print sets (the hOCR reads U00345 `III`, U01470
`II`, V00275 `III`, V00600 `II`, V00816 `II`, U01070 `II`, U01071
`III`, U00582 `I`, U00583 `II`), and slips that hide a member from the
consonant search (C01130 `גְּנַה` for `גְּנַח`; P00855 and P00856
`עָמַך` for `עָמַד`; C00577 and N00317 with the numeral cut into the
gloss head). Each block says so.

### 5.1 (a) determined: 222 retargets

**Done in PR #178** (data PR (v-a)): 196 retargets, P000595–P000790 on
184 entries, each a `replace` of the source anchor as below, with no
annotation
([`tranches/cite-retargets-2026-10-15/`](../admin/pipeline/patch/records/tranches/cite-retargets-2026-10-15/README.md)).
The set was recomputed at `b70aab115` by this section's predicate,
which reproduces this table row for row at `98804214d`, and reads 215
determined there. **Out, 10:** the ten of §1.2 (rows 3, 34, 44, 57,
121, 147, 150, 152, 153, 219), done in PR #174. **In, 3, not
written:** H00731 `חוּל I ch.` (PR #177 numbered H00319 I, but the
round 2 tick aimed this cite at H00320, the `ch.` line, and it stays),
and H01057 and H01105 `חֵלֶף I` (determined since PR #177 respelled
H01100; they wait on the worklist question `חֵלֶף I`). **Not written
here, 16:** the 10 `language_reference` rows (12, 19, 51, 58, 64, 85,
143, 146, 179, 182), which wait on L50; and 6 rows whose cite reads
`X I ch.` (2, 20, 21, 22, 23, 206), held for a read, since Jastrow's
`X I ch.` names the unnumbered `ch.` line after `X I` (B01153 for the
five `בַּר I ch.`, A00879 for `אוּרְיָא II ch.`), as H00731's tick
read it, not the Hebrew `X I` this predicate finds. The six
`find ×2` pairs are two chained patches each: the first widens `find`
with the text after the anchor, the second finds the bare anchor on
the definition the first leaves. All 30 `†` keys resolved (gate 6).
The predicate after: 287 cites → 91, 215 determined → 19.

**The 16, done in PR #179** (data PR (v-b),
[`tranches/language-reference-2026-10-15/`](../admin/pipeline/patch/records/tranches/language-reference-2026-10-15/README.md)).
The 10 `language_reference` rows are retargeted by a `replace` on the
new `language_reference:` target (review ledger L50; P000797–P000806),
with H00355 and H00733 `חוּל I)` → H00319 from PR #177 (P000807,
P000808), which this predicate never counted: their old target,
H00323 `חוֹל I`, carries the numeral. The 6 `X I ch.` rows go to the
`ch.` line under ruling `10-15 ch. cross-reference` (P000791–P000796).
Case 1, no annotation. The predicate after: 91 cites → 81 (the 10),
and 19 determined → 12. The 6 stay in it, as H00731 does: the `ch.`
line carries no numeral, which is the ruling's stated cost. The other
5 determined are H01057 and H01105 (`חֵלֶף I`) and P01145, U00043 and
U00490 `שׁוּף I`, which became determined when U00488 took print's I
in the same PR; all five wait on their worklist questions.

Case 1. The patch is §1.2's: a `replace` of the source anchor with one
naming the target's link key; no annotation. `match` says where the
carrier's numeral sits: `form`, on the form spelled as the cite (78);
`line`, on another form of its line (144, nearly all an abbreviation
`X, X׳ I` or a second spelling). Two caveats for the data PR, both
marked in the table. **10 rows sit in `language_reference`** (the `ch.
= h. X I` field), which no patch op can edit (review ledger L50); they
wait on that op. **12 rows** are six pairs where one definition holds
the same anchor twice (`find ×2`), so each `find` takes neighbouring
text to be unique, or one `replace` spans both. A `†` marks the 30
targets no existing link resolves to, so their link key is not yet
witnessed by one; the data PR reads it from the import's own map
(gate 6 refuses a dangling href). The ten of §1.2 are rows of this
table.

| # | citing rid | the cite in context | Sefaria links | retarget to | match | where | scan |
|---|---|---|---|---|---|---|---|
| 1 | A00863 | …, v. **אוּרְיָא II** a. אֻרְוָה.… | A00880 `אוֹרְיָא, אוּרְיָא III` | **A00878** `אוּרְיָא, אוּרְיָה II, אוּרְיָיא` | line | sense | [33b · leaf 56](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$57/full/1400,/0/default.jpg) |
| 2 | A00864 | …, v. **אוּרְיָא II** ch., a. אֵדֶר I.… | A00880 `אוֹרְיָא, אוּרְיָא III` | **A00878** `אוּרְיָא, אוּרְיָה II, אוּרְיָיא` | line | sense | [33b · leaf 56](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$57/full/1400,/0/default.jpg) |
| 3 | A00882 | …, v. **אוֹרְיָין I**… | A00890 `אוֹרְיָין II, אוֹרְיוֹן` | **A00889** `אוֹרְיָין I (implied), אוֹרְיָאן` | form | sense | [34a · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| 4 | A00887 | …, v. **אוּרְיָא II** h. a. ch.… | A00880 `אוֹרְיָא, אוּרְיָא III` | **A00878** `אוּרְיָא, אוּרְיָה II, אוּרְיָיא` | line | sense | [34a · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| 5 | A00895 | …, v. **אוּרְיָא I**… | A00878 `אוּרְיָא, אוּרְיָה II, אוּרְיָיא` | **A00877** `אוּרְיָא, אוּרְיָה I, אוּרִית` | line | sense | [34b · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| 6 | A02560 | …f. = **אִסְטְרַטְיָא I**, camp, station. … | A02413 `אִסְטְרַטְיָא II, אִסְרַטְיָא, אִיסְ׳` | **A02412** `אִסְטְרַטְיָא, אִיסְ׳ I` | line | sense | [98b · leaf 121](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$122/full/1400,/0/default.jpg) |
| 7 | A03020 | …f.(b. h.; v. **אוּרְיָא II**) manger, crib.—Pl. אֻרְווֹת. … | A00880 `אוֹרְיָא, אוּרְיָא III` | **A00878** `אוּרְיָא, אוּרְיָה II, אוּרְיָיא` | line | sense | [116a · leaf 139](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$140/full/1400,/0/default.jpg) |
| 8 | B00051 | …, v. **בָּב I** a. בָּבִיתָא.… | B00050 `בָּב II, בַּב נַהֲרָא` | **B00049** `בָּב, בָּאב, בָּבָא I` | line | sense | [136b · leaf 159](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$160/full/1400,/0/default.jpg) |
| 9 | B00058 | …he innermost or the gates of His thought, v. **בָּב I**]. … | B00050 `בָּב II, בַּב נַהֲרָא` | **B00049** `בָּב, בָּאב, בָּבָא I` | line | sense | [136b · leaf 159](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$160/full/1400,/0/default.jpg) |
| 10 | B00211 | … c. (denom. of **בַּד V**) a mat of reeds. [The best ve… | B00097 `בַּד IV` | **B00098** `בַּד V` † | form | sense | [144a · leaf 167](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$168/full/1400,/0/default.jpg) |
| 11 | B00224 | …Targ. Ps. CXIX, 22.—V. **בִּיזָּא II**.… | B00560 `בִּיזָּא I, בִּזָּא, בִּיזְתָא` | **B00561** `בִּיזָּא, בִּזָּא II, בִּיזְתָא, בִּזְּתָא` | line | sense | [144b · leaf 167](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$168/full/1400,/0/default.jpg) |
| 12 | B00335 | …m. ch. = h.**בּוֹר I** Targ. Prov. XII, 1; XXX, 2 (h… | B00333 `בּוֹר II` | **B00332** `בּוֹר I` † | form | language_reference | [149a · leaf 172](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$173/full/1400,/0/default.jpg) |
| 13 | B00367 | …. (v. ברך) something hollow, absurdity; cmp. **בּוֹר I**. … | B00333 `בּוֹר II` | **B00332** `בּוֹר I` † | form | sense | [150b · leaf 173](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$174/full/1400,/0/default.jpg) |
| 14 | B00450 | …, v. **בִּזְיוּנָא II**… | B00442 `בִּזְיוּנָא I, בִּיזְיוּנָא, בֵּי זְיוּנָא, בֵּי זְיָינָא` | **B00443** `בִּזְיוּנָא II` † | form | sense | [153b · leaf 176](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$177/full/1400,/0/default.jpg) |
| 15 | B00453 | …, v. **בִּזְיוּנָא II**… | B00442 `בִּזְיוּנָא I, בִּיזְיוּנָא, בֵּי זְיוּנָא, בֵּי זְיָינָא` | **B00443** `בִּזְיוּנָא II` † | form | sense | [153b · leaf 176](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$177/full/1400,/0/default.jpg) |
| 16 | B00564 | …13 (ref. to אעידך ib.; cmp. בִּיזְּתָא s. v. **בִּיזָּא II**) כמה ב׳ וכ׳ how often did I g… | B00560 `בִּיזָּא I, בִּזָּא, בִּיזְתָא` | **B00561** `בִּיזָּא, בִּזָּא II, בִּיזְתָא, בִּזְּתָא` | line | sense | [160a · leaf 183](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$184/full/1400,/0/default.jpg) |
| 17 | B00981 | …trample upon; hence (with ב־) to despise; v. **בְּזֵי I**; cmp. בְּטַשׁ.… | B00436 `בְּזֵי, בְּזָא II` | **B00435** `בְּזֵי, בְּזָא I` | line | sense | [178a · leaf 201](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$202/full/1400,/0/default.jpg) |
| 18 | B01142 | … בַּקָּרִין (v. בָּקַר, cmp. b. h. בַּעַר a. **בּוֹר I**) [empty,] light-minded, thoug… | B00333 `בּוֹר II` | **B00332** `בּוֹר I` † | form | sense | [187b · leaf 210](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$211/full/1400,/0/default.jpg) |
| 19 | B01155 | …m.(b. h.; ברר; v. **בַּר I**)clear, bright, clean, pure. … | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | form | language_reference | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| 20 | B01157 | …outside, forest &c., v. **בַּר I** ch.… | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | form | sense | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| 21 | B01160 | …m. (v. **בַּר I** ch.)… | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | form | sense | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| 22 | B01215 | …f. (v. **בַּר I** ch.) outside, rejected; cmp. … | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | form | sense | [191b · leaf 214](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$215/full/1400,/0/default.jpg) |
| 23 | B01237 | … (v. **בַּר I** ch., Pi. 2) to expel, exile. … | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | form | sense | [192a · leaf 215](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$216/full/1400,/0/default.jpg) |
| 24 | B01237 | … (v. **בַּר I**, בָּרָא) to grow wild. … | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | form | sense | [192a · leaf 215](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$216/full/1400,/0/default.jpg) |
| 25 | C00041 | …Ib. 8ᵃ, v. **חִיזְרָא I**.—Pl. גְּבָבֵי. … | H00702 `חִיזְרָא, חִזְ׳ II` | **H00701** `חִיזְרָא, חִזְ׳ I` | line | sense | [204a · leaf 227](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$228/full/1400,/0/default.jpg) |
| 26 | C00269 | …גַּיֵּיב, v. **גִּיב I**. [Targ. Prov. IX, 3 Ms., v. ג… | C00610 `גִּיב II` | **C00609** `גִּיב I, גּוּב` | form | sense | [216b · leaf 239](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$240/full/1400,/0/default.jpg) |
| 27 | C00343 | …castrate, v. **גַּוָּוזָא II**.… | C00328 `גַּוָּוזָא I` | **C00329** `גַּוָּוזָא II` † | form | sense | [220a · leaf 243](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$244/full/1400,/0/default.jpg) |
| 28 | C00351 | …pr. n. pl. (a fictitious denom. of **גַּוָּוזָא II**) Gavzania (Eunuchia), a ficti… | C00328 `גַּוָּוזָא I` | **C00329** `גַּוָּוזָא II` † | form | sense | [220b · leaf 243](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$244/full/1400,/0/default.jpg) |
| 29 | C01130 | … גוזז, a. מגנחין for מְגַוְּוזִין, denom. of **גַּוָּוזָא II**. Cmp. form of letters, Sabb. … | C00328 `גַּוָּוזָא I` | **C00329** `גַּוָּוזָא II` † | form | sense | [259a · leaf 282](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$283/full/1400,/0/default.jpg) |
| 30 | D00003 | …את) this; with prefix ה, (הֲדָא) הָדָא, cmp. **אָדָא I**. … | A00372 `אָדָא IV` | **A00369** `אָדָא I, הָדָא` † | form | sense, find ×2 | [275a · leaf 298](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$299/full/1400,/0/default.jpg) |
| 31 | D00003 | …top הדא אמרה היא הדא וכ׳ this proves &c., v. **אָדָא I**.—הדא היא דכתיב (abbr. הה״ד) i… | A00372 `אָדָא IV` | **A00369** `אָדָא I, הָדָא` † | form | sense, find ×2 | [275a · leaf 298](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$299/full/1400,/0/default.jpg) |
| 32 | D00353 | … M. דודאי; Rashi: the lord of my village, v. **דּוּרָא I**).… | D00351 `דּוּרָא IV` | **D00347** `דּוּרָא I` † | form | sense | [289b · leaf 312](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$313/full/1400,/0/default.jpg) |
| 33 | D00361 | …, v. **דּוּרָא I**, II.… | D00351 `דּוּרָא IV` | **D00347** `דּוּרָא I` † | form | sense | [289b · leaf 312](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$313/full/1400,/0/default.jpg) |
| 34 | D00595 | … v. **דִּי I**… | D00443 `דִּי II` | **D00442** `דִּי I (implied)` | form | sense | [299b · leaf 322](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$323/full/1400,/0/default.jpg) |
| 35 | D00844 | … v. **דִּילְמָא I**, II.… | D00608 `דִּילְמָא, דִּלְמָא II` | **D00607** `דִּילְמָא, דִּלְמָא I` | line | sense | [310b · leaf 333](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$334/full/1400,/0/default.jpg) |
| 36 | D01149 | … a gift, i.e. is this an adequate reward? V. **דִּיסְתָּנָא I**.… | D00668 `דִּיסְתָּנָא, דִּסְ׳ II` | **D00667** `דִּיסְתָּנָא, דִּסְ׳ I` | line | sense | [326b · leaf 349](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$350/full/1400,/0/default.jpg) |
| 37 | G00734 | …Keth. 103ᵇ זְרוֹק וכ׳, v. **מָרָה I**. … | M02564 `מָרָה IV` | **M02561** `מָרָה I` † | form | sense | [415a · leaf 438](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$439/full/1400,/0/default.jpg) |
| 38 | H00210 | …m. (derisive denominative of **חִדְקָא I**) descendant of a thorny race.… | H00209 `חִדְקָא, חִי׳ II` | **H00208** `חִדְקָא, חִידְ׳ I` | line | sense | [427a · leaf 450](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$451/full/1400,/0/default.jpg) |
| 39 | H00519 | …l. 47ᵇ בח׳ resembling wood in appearance, v. **גִּשְׁתָּא I**. … | C01428 `גִּשְׁתָּא, גִּישְׁ׳ II` | **C01427** `גִּשְׁתָּא, גִּישְׁ׳ I` | line | sense | [442b · leaf 465](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$466/full/1400,/0/default.jpg) |
| 40 | H00878 | …B. Mets. 103ᵇ Ar. Var., v. **חִיזְרָא I**.… | H00702 `חִיזְרָא, חִזְ׳ II` | **H00701** `חִיזְרָא, חִזְ׳ I` | line | sense | [460a · leaf 483](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$484/full/1400,/0/default.jpg) |
| 41 | H01243 | …Gitt. 67ᵇ bot. (Ar. חמותא), v. **דִּיסְתָּנָא I**. … | D00668 `דִּיסְתָּנָא, דִּסְ׳ II` | **D00667** `דִּיסְתָּנָא, דִּסְ׳ I` | line | sense | [481a · leaf 504](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$505/full/1400,/0/default.jpg) |
| 42 | H01325 | …Gitt. 67ᵇ דחַנְקָא, v. **דִּיסְתָּנָא I**.… | D00668 `דִּיסְתָּנָא, דִּסְ׳ II` | **D00667** `דִּיסְתָּנָא, דִּסְ׳ I` | line | sense | [485a · leaf 508](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$509/full/1400,/0/default.jpg) |
| 43 | H01341 | …m. (denom. of **חִסְדָּא I**) kind, pleasing.—Pl. חִסְדָּא… | H01340 `חִסְדָּא, חִי׳ III` | **H01338** `חֶסֶד, חִסְדָּא, חִיסְ׳ I` | line | sense | [486b · leaf 509](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$510/full/1400,/0/default.jpg) |
| 44 | H01410 | …Gen. R. s. 32, a. e. מח׳ אמנה, v. **אֲמָנָה I**. … | A02042 `אֲמָנָה II` | **A02041** `אֲמָנָה I (implied)` | form | sense | [489b · leaf 512](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$513/full/1400,/0/default.jpg) |
| 45 | H01653 | …m. (reduplic. of חור, v. **חָרַר I**) [point of a lance, v. Maim. … | H01770 `חָרַר IV` | **H01764** `חָרַר I` † | form | sense | [501a · leaf 524](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$525/full/1400,/0/default.jpg) |
| 46 | J00739 | …m.cord, v. **יִתְרָא I**.… | J00752 `יִתְרָא II` | **J00751** `יִתְרָא, יִי׳ I` † | line | sense | [604a · leaf 627](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$628/full/1400,/0/default.jpg) |
| 47 | J00746 | …ר, עתר) [to be strong; denom. יֶתֶר cord, v. **יִתְרָא I**,] to be rich, plentiful.… | J00752 `יִתְרָא II` | **J00751** `יִתְרָא, יִי׳ I` † | line | sense | [604b · leaf 627](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$628/full/1400,/0/default.jpg) |
| 48 | K00162 | …, v. **כָּהֵן I**… | K00166 `כָּהֵן` | **K00165** `כָּהֵן, כָּהֵין, כַּהֲנָא I` | line | sense | [615a · leaf 638](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$639/full/1400,/0/default.jpg) |
| 49 | K00171 | …, v. **כָּהֵן I**… | K00166 `כָּהֵן` | **K00165** `כָּהֵן, כָּהֵין, כַּהֲנָא I` | line | sense | [615b · leaf 638](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$639/full/1400,/0/default.jpg) |
| 50 | K00759 | … a. e.—[Kidd. 81ᵇ מכלליה, read: מכלי להו, v. **כְּלֵי I**.]… | K00717 `כְּלֵי, כְּלָא II` | **K00716** `כְּלֵי, כְּלָא I` | line | sense | [644a · leaf 667](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$668/full/1400,/0/default.jpg) |
| 51 | K00999 | … ch. = h.**כּוֹפֶר I** , cyprus flower.—Pl. כְּפוֹרִ… | K00345 `כּוֹפֶר II` | **K00344** `כּוֹפֶר, כֹּפֶר I` | line | language_reference | [658a · leaf 681](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$682/full/1400,/0/default.jpg) |
| 52 | L00204 | …M. Kat. 26ᵃ, v. **יִתְרָא I**. … | J00752 `יִתְרָא II` | **J00751** `יִתְרָא, יִי׳ I` † | line | sense | [695a · leaf 18](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$19/full/1400,/0/default.jpg) |
| 53 | L00351 | …f. (לחן, cmp. לוח, to join; cmp. זוּג, **לְוִיָּה II**) … | L00254 `לִוִיָּה, לְוִיָּיה I` | **L00255** `לְוִיָּה, לְיִיָּיה II, לִוְיָה` † | line | sense | [703a · leaf 26](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$27/full/1400,/0/default.jpg) |
| 54 | M00351 | … f. = **מְהוּלְתָּא II**. … | M00353 `מְהוּלְתָּא I` | **M00354** `מְהוּלְתָּא, מָ׳ II` | line | sense | [737a · leaf 60](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$61/full/1400,/0/default.jpg) |
| 55 | M00372 | …, v. **מְהוּלְתָּא II**… | M00353 `מְהוּלְתָּא I` | **M00354** `מְהוּלְתָּא, מָ׳ II` | line | sense | [737b · leaf 60](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$61/full/1400,/0/default.jpg) |
| 56 | M01112 | …m. (מְחַח, v. **מְחִי I**) stirred flour in a dish, pas… | M00859 `מְחִי, מְחָא II` | **M00858** `מְחִי, מְחָא I, מְחַח` | line | sense | [772a · leaf 95](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$96/full/1400,/0/default.jpg) |
| 57 | M01329 | …Gen. R. s. 50, beg. Ar. (v. **אוֹרְיָין I**); Lev. R. s. 27 מתורין (corr.… | A00890 `אוֹרְיָין II, אוֹרְיוֹן` | **A00889** `אוֹרְיָין I (implied), אוֹרְיָאן` | form | sense | [780b · leaf 103](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$104/full/1400,/0/default.jpg) |
| 58 | M01517 | …m.(b. h.; **לוּן I)**lodging. … | L00290 `לוּן II` | **L00289** `לוּן, לִין I` | line | language_reference | [788a · leaf 111](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$112/full/1400,/0/default.jpg) |
| 59 | M02321 | …ed. 31ᵇ top R. N. (ed. מיצעא).—בבא מציעא. v. **בָּב I**.—[מְצִיעַיָּא, Targ. Prov. XX… | B00050 `בָּב II, בַּב נַהֲרָא` | **B00049** `בָּב, בָּאב, בָּבָא I` | line | sense | [826b · leaf 149](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$150/full/1400,/0/default.jpg) |
| 60 | M02374 | …, v. **קִבְלָא II**… | S00066 `קִבְלָא, קִי׳ III` | **S00065** `קִבְלָא, קִי׳ II, קוּבְלָא` | line | sense | [829a · leaf 152](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$153/full/1400,/0/default.jpg) |
| 61 | M02410 | …ar ch. VII, Par. 6 (Yalk. Lev. 667 הלקח), v. **סִימְטָא I**.—מ׳ וממכר, v. מִמְכָּר.… | O00700 `סִימְטָא, סִמְ׳ II` | **O00699** `סִימְטָא, סִמְ׳ I` | line | sense | [830b · leaf 153](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$154/full/1400,/0/default.jpg) |
| 62 | M02691 | …. XXIII, 25 מחת מ׳ affection of the gall, v. **מָרָה I**; a. e.—… | M02564 `מָרָה IV` | **M02561** `מָרָה I` † | form | sense | [843b · leaf 166](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$167/full/1400,/0/default.jpg) |
| 63 | M02803 | …, v. **מֵישְׁרָא I**… | M01319 `מֵישְׁרָא II, מֵישְׁרֵי` | **M01318** `מֵישָׁרָא, מֵישְׁרָא, מֵשְׁ׳ I` | line | sense | [848b · leaf 171](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$172/full/1400,/0/default.jpg) |
| 64 | M02939 | …m.(b. h.; **שָׁנָה I)**lieutenant, viceroy. … | U01571 `שָׁנָה II` | **U01570** `שָׁנָה I` | form | language_reference | [857a · leaf 180](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$181/full/1400,/0/default.jpg) |
| 65 | M03062 | …Meg. 6ᵃ, v. **כִּנָּרָא I**.… | K00877 `כִּנְּרָא, כִּנָּרָא II` | **K00876** `כִּנָּרָא, כִּי׳ I` | line | sense | [862a · leaf 185](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$186/full/1400,/0/default.jpg) |
| 66 | M03078 | …, v. **מְחִי I**… | M00859 `מְחִי, מְחָא II` | **M00858** `מְחִי, מְחָא I, מְחַח` | line | sense | [863a · leaf 186](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$187/full/1400,/0/default.jpg) |
| 67 | N00034 | …, v. **נִיר I**… | N00787 `נִיר IV` | **N00782** `נִיר I, נוּר` † | form | sense | [867a · leaf 190](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$191/full/1400,/0/default.jpg) |
| 68 | N00106 | …m. (cmp. **בַּר I**; corresp. to h. סִיב) coverin… | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | form | sense | [870b · leaf 193](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$194/full/1400,/0/default.jpg) |
| 69 | N00301 | …, v. **נִגְדָּא I**, II, a. נוּגְרָא.… | N00122 `נִגְדָּא, נִי׳ II` | **N00121** `נִגְדָּא, נִי׳ I` | line | sense | [883b · leaf 206](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$207/full/1400,/0/default.jpg) |
| 70 | N00379 | …rg. Deut. IV, 18; a. fr.—Y. Naz. IX, 57ᵈ, v. **צְלֵי I**.—Y. Ned. IV, beg. 39ᶜ, v. חל;… | R00507 `צְלֵי, צְלָא II` | **R00506** `צְלֵי, צְלָא I` | line | sense | [888a · leaf 211](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$212/full/1400,/0/default.jpg) |
| 71 | N00416 | … as a verb, v. **נִיר I**… | N00787 `נִיר IV` | **N00782** `נִיר I, נוּר` † | form | sense | [890a · leaf 213](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$214/full/1400,/0/default.jpg) |
| 72 | N00704 | …. Y. ib. XV, 13 (not נְסוּכְיָיא); a. fr.—V. **נִסְכָּא I**.… | N00950 `נִסְכָּא, נִי׳ II` | **N00949** `נִסְכָּא, נִי׳ I` | line | sense | [906a · leaf 229](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$230/full/1400,/0/default.jpg) |
| 73 | N00869 | …Yoma 64ᵃ נהי נ׳, v. **נְהֵי II**.—הכי נ׳ (abbrev. ה״נ) it is r… | N00259 `נְהֵי I` | **N00261** `נְהֵי, נְהִי II` | form | sense | [913a · leaf 236](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$237/full/1400,/0/default.jpg) |
| 74 | N00935 | …Ber. 56ᵇ, v. **נִסָּא I**.… | N00914 `נִסָּא II, נִסָּה, נִי׳` | **N00913** `נֵס, נִסָּא, נִי׳ I` | line | sense | [916b · leaf 239](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$240/full/1400,/0/default.jpg) |
| 75 | N00935 | …Lam. R. to I, 1, v. **נִסָּא I**; a. e.… | N00914 `נִסָּא II, נִסָּה, נִי׳` | **N00913** `נֵס, נִסָּא, נִי׳ I` | line | sense | [916b · leaf 239](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$240/full/1400,/0/default.jpg) |
| 76 | N01042 | …Orion.—Pl. נְפִילִין, v. **נִיפְלָא I**.… | N00738 `נִיפְלָא II` | **N00737** `נִיפְלָא, נִפְ׳ I` † | line | sense | [924a · leaf 247](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$248/full/1400,/0/default.jpg) |
| 77 | N01346 | …kwards (when you attempt to pull it out), v. **חִיזְרָא I**.… | H00702 `חִיזְרָא, חִזְ׳ II` | **H00701** `חִיזְרָא, חִזְ׳ I` | line | sense | [942b · leaf 265](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$266/full/1400,/0/default.jpg) |
| 78 | O00088 | …IX, 32 Ms. a. some ed., (ed. Berl. סָבַר, v. **סְבַר I**).—Pl. סַבָּרִין. … | O00090 `סְבַר IV, סִבְרָא, סִי׳, סוֹבָרָא` | **O00085** `סְבַר, סְבֵיר I` | line | sense | [952b · leaf 275](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$276/full/1400,/0/default.jpg) |
| 79 | O00090 | …b. Zar. I, 40ᵃ סִיבְרָה (ed. Krot. סוּ׳), v. **סְבַר I**, Ithpa… | O00090 `סְבַר IV, סִבְרָא, סִי׳, סוֹבָרָא` | **O00085** `סְבַר, סְבֵיר I` | line | sense | [952b · leaf 275](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$276/full/1400,/0/default.jpg) |
| 80 | O00125 | …, v. **סְגֵי II**, III.… | O00122 `סְגֵי III, סַגְיָא I` | **O00121** `סְגֵי, סְגָא II` | line | sense | [954b · leaf 277](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$278/full/1400,/0/default.jpg) |
| 81 | O00157 | …, סִגְנַאי, v. **סִיגְנָא II**… | O00563 `סִיגְנָא I` | **O00564** `סִיגְנָא, סִגְ׳ II, כְּפַר ס׳` | line | sense | [955b · leaf 278](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$279/full/1400,/0/default.jpg) |
| 82 | O00160 | …, v. **סִיגְנָא II**… | O00563 `סִיגְנָא I` | **O00564** `סִיגְנָא, סִגְ׳ II, כְּפַר ס׳` | line | sense | [955b · leaf 278](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$279/full/1400,/0/default.jpg) |
| 83 | O00569 | …, v. **סִיגְנָא II**… | O00563 `סִיגְנָא I` | **O00564** `סִיגְנָא, סִגְ׳ II, כְּפַר ס׳` | line | sense | [976a · leaf 299](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$300/full/1400,/0/default.jpg) |
| 84 | O00579 | … 32 סִידּוּרוֹ של עולם the natural order, v. **סִילּוֹן II**. … | O00658 `סִילּוֹן I` | **O00659** `סִילּוֹן, סִלּ׳ II` | line | sense | [976a · leaf 299](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$300/full/1400,/0/default.jpg) |
| 85 | O00581 | … ch. = h.**סִידּוּר I** , arrangement, order, row. … | O00580 `סִידּוּר II` | **O00579** `סִידּוּר, סִדּ׳ I` | line | language_reference | [976b · leaf 299](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$300/full/1400,/0/default.jpg) |
| 86 | O00658 | … direction opposite to that of its knots, v. **חִיזְרָא I**); Lev. R. s. 4 כסִילָּן.—[Mid… | H00702 `חִיזְרָא, חִזְ׳ II` | **H00701** `חִיזְרָא, חִזְ׳ I` | line | sense | [979b · leaf 302](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$303/full/1400,/0/default.jpg) |
| 87 | O00661 | …, v. **סִילּוֹן II**.—… | O00658 `סִילּוֹן I` | **O00659** `סִילּוֹן, סִלּ׳ II` | line | sense | [980a · leaf 303](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$304/full/1400,/0/default.jpg) |
| 88 | O00702 | …, v. **סִימְטָא I**… | O00700 `סִימְטָא, סִמְ׳ II` | **O00699** `סִימְטָא, סִמְ׳ I` | line | sense | [981a · leaf 304](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$305/full/1400,/0/default.jpg) |
| 89 | O00743 | …s of earth from under seven door-sockets; v. **סִיכְרָא I**.… | O00654 `סִיכְרָא, סִכְ׳ II` | **O00653** `סִיכְרָא, סִכְ׳ I` | line | sense | [983b · leaf 306](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$307/full/1400,/0/default.jpg) |
| 90 | O00827 | …d) consumed there (in Moab).—[סִיר thorn, v. **סִירָה I**.]… | O00833 `סִירָה, סִירָא II` | **O00832** `סִירָה, סִירָא I` | line | sense | [986b · leaf 309](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$310/full/1400,/0/default.jpg) |
| 91 | O00829 | …m. (v. **סִירָה I**) thorn. Midr. Sam. ch. II, v.… | O00833 `סִירָה, סִירָא II` | **O00832** `סִירָה, סִירָא I` | line | sense, find ×2 | [987a · leaf 310](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$311/full/1400,/0/default.jpg) |
| 92 | O00829 | …Targ. Is. XXXIV, 13.—[Hebr. סִירָא, v. **סִירָה I**, II).… | O00833 `סִירָה, סִירָא II` | **O00832** `סִירָה, סִירָא I` | line | sense, find ×2 | [987a · leaf 310](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$311/full/1400,/0/default.jpg) |
| 93 | O00861 | …f. = h. **סִירָה I**, thorn. … | O00833 `סִירָה, סִירָא II` | **O00832** `סִירָה, סִירָא I` | line | sense | [988a · leaf 311](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$312/full/1400,/0/default.jpg) |
| 94 | O00929 | …idd. III, 11 בקעת סכני the Valley of S.—Cmp. **סִיגְנָא II**.… | O00563 `סִיגְנָא I` | **O00564** `סִיגְנָא, סִגְ׳ II, כְּפַר ס׳` | line | sense | [992a · leaf 315](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$316/full/1400,/0/default.jpg) |
| 95 | O01004 | …make a path, pave.—Denom. מְסִלָּה, סוּלָּם, **סִילּוֹן II**.… | O00658 `סִילּוֹן I` | **O00659** `סִילּוֹן, סִלּ׳ II` | line | sense | [995a · leaf 318](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$319/full/1400,/0/default.jpg) |
| 96 | O01224 | …י, v. supra) one whose reputation is bad, v. **בְּזֵי I**. … | B00436 `בְּזֵי, בְּזָא II` | **B00435** `בְּזֵי, בְּזָא I` | line | sense | [1006b · leaf 329](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$330/full/1400,/0/default.jpg) |
| 97 | O01402 | …a flame (a superstitious practice); a. e.—V. **סִיפּוּק I**.… | O00789 `סִיפּוּק, סִפּ׳ II` | **O00788** `סִיפּוּק, סִפּ׳ I` | line | sense | [1015b · leaf 338](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$339/full/1400,/0/default.jpg) |
| 98 | O01402 | …hich one engrafted on an old tree; a. fr.—V. **סִיפּוּק I**.… | O00789 `סִיפּוּק, סִפּ׳ II` | **O00788** `סִיפּוּק, סִפּ׳ I` | line | sense | [1015b · leaf 338](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$339/full/1400,/0/default.jpg) |
| 99 | O01590 | …f. (= **אִסְטְרַטְיָא I**) camp, station. … | A02413 `אִסְטְרַטְיָא II, אִסְרַטְיָא, אִיסְ׳` | **A02412** `אִסְטְרַטְיָא, אִיסְ׳ I` | line | sense | [1025b · leaf 348](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$349/full/1400,/0/default.jpg) |
| 100 | O01610 | … (ref. to סָרוּ, Ex. XXXII, 8, cmp. סָרָה a. **סִירָה I**) נעשו ס׳ נעשו כובים (not כזבי… | O00833 `סִירָה, סִירָא II` | **O00832** `סִירָה, סִירָא I` | line | sense, find ×2 | [1026b · leaf 349](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$350/full/1400,/0/default.jpg) |
| 101 | O01610 | … (ref. to סָרוּ, Ex. XXXII, 8, cmp. סָרָה a. **סִירָה I**) נעשו ס׳ נעשו כובים (not כזבי… | O00833 `סִירָה, סִירָא II` | **O00832** `סִירָה, סִירָא I` | line | sense, find ×2 | [1026b · leaf 349](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$350/full/1400,/0/default.jpg) |
| 102 | P00089 | … שעִגְּלוּ וכ׳ (v. R. S. to Ohol. l. c.), v. **פִּיקָא I**.… | Q00797 `פִּיקָא, פִּיקָה II` | **Q00796** `פִּיקָא, פִּיקָה I` | line | sense | [1041a · leaf 364](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$365/full/1400,/0/default.jpg) |
| 103 | P00118 | … f. = **אָדָא I**. … | A00372 `אָדָא IV` | **A00369** `אָדָא I, הָדָא` † | form | sense | [1043a · leaf 366](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$367/full/1400,/0/default.jpg) |
| 104 | P00150 | …Lam. R. to II, 13 (ref. to אעידך, ib.), v. **בִּיזָּא II**.… | B00560 `בִּיזָּא I, בִּזָּא, בִּיזְתָא` | **B00561** `בִּיזָּא, בִּזָּא II, בִּיזְתָא, בִּזְּתָא` | line | sense | [1044b · leaf 367](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$368/full/1400,/0/default.jpg) |
| 105 | P00291 | …t. on המחשב עתים explain עונן as denomin. of **עוֹנָה I**]; Tosef. Sabb. VII (VIII), 14… | P00297 `עוֹנָה IV` | **P00294** `עוֹנָה I` † | form | sense | [1053b · leaf 376](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$377/full/1400,/0/default.jpg) |
| 106 | P00573 | … a man, I vow his value (instead of ערכו, v. **סִידּוּר I**). … | O00580 `סִידּוּר II` | **O00579** `סִידּוּר, סִדּ׳ I` | line | sense | [1070a · leaf 393](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$394/full/1400,/0/default.jpg) |
| 107 | P00591 | …, v. **עִימְעוּם I**… | P00596 `עִימְעוּם, עִמְ׳ II` | **P00595** `עִימְעוּם, עִמְעוּם I` | line | sense | [1070b · leaf 393](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$394/full/1400,/0/default.jpg) |
| 108 | P00613 | … ch. = **עִינּוּי I**. … | P00612 `עִינּוּי, עִנּ׳ II` | **P00611** `עִינּוּי, עִנּ׳ I` | line | sense | [1072b · leaf 395](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$396/full/1400,/0/default.jpg) |
| 109 | P00624 | …, v. **עִינּוּיָא I**.—[Lam. R. to IV, 18 עיניתיה s… | P00614 `עִינּוּיָא, עִנּ׳ II` | **P00613** `עִינּוּיָא, עִנּ׳ I` † | line | sense | [1072b · leaf 395](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$396/full/1400,/0/default.jpg) |
| 110 | P00871 | …, v. **עִימְעוּם I**… | P00596 `עִימְעוּם, עִמְ׳ II` | **P00595** `עִימְעוּם, עִמְעוּם I` | line | sense | [1087b · leaf 410](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$411/full/1400,/0/default.jpg) |
| 111 | P00970 | …eaks, and all repeat in chorus after her, v. **עִינּוּי I**. … | P00612 `עִינּוּי, עִנּ׳ II` | **P00611** `עִינּוּי, עִנּ׳ I` | line | sense | [1093a · leaf 416](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$417/full/1400,/0/default.jpg) |
| 112 | P00970 | …M. Kat. III, 9, מְעַנּוֹת, v. **עִינּוּי I**.… | P00612 `עִינּוּי, עִנּ׳ II` | **P00611** `עִינּוּי, עִנּ׳ I` | line | sense | [1093a · leaf 416](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$417/full/1400,/0/default.jpg) |
| 113 | P01021 | …f. = h. **עוֹנָה I**, … | P00297 `עוֹנָה IV` | **P00294** `עוֹנָה I` † | form | sense | [1097a · leaf 420](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$421/full/1400,/0/default.jpg) |
| 114 | P01522 | …. h.; contr. of עדת , v. עוּד; or of ענת, v. **עוֹנָה I**) [duration, turn,] … | P00297 `עוֹנָה IV` | **P00294** `עוֹנָה I` † | form | sense | [1128a · leaf 451](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$452/full/1400,/0/default.jpg) |
| 115 | P01522 | …Tosef. Ber. I, 1; a. e., v. **עוֹנָה I**.… | P00297 `עוֹנָה IV` | **P00294** `עוֹנָה I` † | form | sense | [1128a · leaf 451](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$452/full/1400,/0/default.jpg) |
| 116 | Q00440 | …. פַּחִים (only in connection with צנים), v. **צִנָּה III**.—[For פחי נפש, v. פְּחִי.]… | R00608 `צִנָּה II, צִינָּה II` | **R00609** `צִנָּה, צִינָּה III` † | line | sense | [1151a · leaf 474](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$475/full/1400,/0/default.jpg) |
| 117 | Q00500 | …, v. **פִּיטְמָא I**… | Q00629 `פִּיטְמָא II, פִּיטְמָה, פִּטְ׳` | **Q00628** `פִּיטְמָא, פִּטְ׳ I` | line | sense | [1154b · leaf 477](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$478/full/1400,/0/default.jpg) |
| 118 | Q00538 | …Sabb. XX, 4; Y. ib. 17ᶜ bot., v. **רְעִי I**.… | T00893 `רְעִי, רְיעִי II` | **T00892** `רְעִי, רֵיעִי I` † | line | sense | [1156b · leaf 479](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$480/full/1400,/0/default.jpg) |
| 119 | Q00839 | …f. = **פֵּירוּכָא I**. … | Q00838 `פֵּירוּכָא, פֵּר׳ II` | **Q00837** `פֵּירוּכָא, פֵּר׳ I` | line | sense, find ×2 | [1170b · leaf 493](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$494/full/1400,/0/default.jpg) |
| 120 | Q00839 | …Targ. Y. Lev. II, 16, v. **פֵּירוּכָא I**.… | Q00838 `פֵּירוּכָא, פֵּר׳ II` | **Q00837** `פֵּירוּכָא, פֵּר׳ I` | line | sense, find ×2 | [1170b · leaf 493](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$494/full/1400,/0/default.jpg) |
| 121 | Q00942 | …Targ. II Sam. XXII, 44 ed. Wil., v. **פְּלוּגְתָּא I**.… | Q00965 `פְּלוּגְתָּא II, פְּלוּגְתָּה` | **Q00964** `פְּלוּגְתָּא I (implied), פְּלֻגְ׳` | form | sense | [1176b · leaf 499](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$500/full/1400,/0/default.jpg) |
| 122 | Q01284 | …, v. **פִּסְיוֹנָא II**… | Q01279 `פִּסְיוֹן, פִּסְיוֹנָא I` | **Q01280** `פִּסְיוֹנָא, פִּיסְ׳ II` | line | sense | [1195a · leaf 518](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$519/full/1400,/0/default.jpg) |
| 123 | Q01373 | …) 3 (Var. פָּאוֹטוֹת); Y. ib. V, 47ᶜ top, v. **שִׁיטָּה III**; Y. Erub. VII, 24ᶜ bot. פַּיּ… | U00883 `שִׁיטָּה II` | **U00884** `שִׁיטָּה, שִׁטָּה III` † | line | sense | [1201b · leaf 524](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$525/full/1400,/0/default.jpg) |
| 124 | Q01449 | …דָהּ and does not visit her (in due time, v. **עוֹנָה I**). … | P00297 `עוֹנָה IV` | **P00294** `עוֹנָה I` † | form | sense | [1206b · leaf 529](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$530/full/1400,/0/default.jpg) |
| 125 | Q01983 | …Tosef. Neg. IV, 12 neck, v. **פִּיקָא I**.—Pl. as ab. Y. Taan. II, 66ᵃ … | Q00797 `פִּיקָא, פִּיקָה II` | **Q00796** `פִּיקָא, פִּיקָה I` | line | sense | [1240a · leaf 563](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$564/full/1400,/0/default.jpg) |
| 126 | Q02021 | …hey did not interpret (the verse) to you; v. **שָׁנָה I**. … | U01571 `שָׁנָה II` | **U01570** `שָׁנָה I` | form | sense | [1241b · leaf 564](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$565/full/1400,/0/default.jpg) |
| 127 | R00130 | …Midd. II, 3, a. e., v. **נְחוּשְׁתָּן I**.—Part. pass. מוּצְהָב; f. מוּ… | N00482 `נְחוּשְׁתָּן, נְחֻשְׁ׳ II` | **N00481** `נְחוּשְׁתָּן, נְחֻשְׁ׳ I` | line | sense, find ×2 | [1264a · leaf 587](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$588/full/1400,/0/default.jpg) |
| 128 | R00130 | …Yoma 38ᵃ (some ed. מְצוּהֶבֶת Pu.), v. **נְחוּשְׁתָּן I**. [Ib. והיתה מאירה, Ms. M. 2 מ… | N00482 `נְחוּשְׁתָּן, נְחֻשְׁ׳ II` | **N00481** `נְחוּשְׁתָּן, נְחֻשְׁ׳ I` | line | sense, find ×2 | [1264a · leaf 587](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$588/full/1400,/0/default.jpg) |
| 129 | R00241 | … (cmp. זוּר) to press, v. **צִיר I**.]… | R00452 `צִיר IV` | **R00448** `צִיר I` † | form | sense | [1270b · leaf 593](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$594/full/1400,/0/default.jpg) |
| 130 | R00399 | …f. = h. **צִנָּה III**, cold. … | R00608 `צִנָּה II, צִינָּה II` | **R00609** `צִנָּה, צִינָּה III` † | line | sense | [1278a · leaf 601](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$602/full/1400,/0/default.jpg) |
| 131 | R00416 | …, v. **צִיפּוֹרֵי I**, II.… | R00414 `צִיפּוֹרֵי, צִיפּוֹרִים, צִיפּוֹרִין, צִפּ׳ II` | **R00413** `צִיפּוֹרֵי, צִיפּוֹרִין, צִפּ׳ I` | line | sense | [1279a · leaf 602](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$603/full/1400,/0/default.jpg) |
| 132 | R00460 | …m. (denom. of **צִיר I**) one whose eyes discharge a b… | R00452 `צִיר IV` | **R00448** `צִיר I` † | form | sense | [1281a · leaf 604](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$605/full/1400,/0/default.jpg) |
| 133 | R00488 | …is is no prayer (need not be prayed for), v. **צִינְּתָא I**. … | R00400 `צִינְּתָא, צִנְּ׳ II` | **R00399** `צִינְּתָא, צִנְּ׳ I` | line | sense | [1282b · leaf 605](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$606/full/1400,/0/default.jpg) |
| 134 | R00615 | …splash from a spout (cmp. **סִילּוֹן II**), trnsf. צ׳ (של רוק) ejection… | O00658 `סִילּוֹן I` | **O00659** `סִילּוֹן, סִלּ׳ II` | line | sense | [1291a · leaf 614](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$615/full/1400,/0/default.jpg) |
| 135 | R00681 | … c. (b. h.; v. **צְפַר I**) … | R00715 `צְפַר IV, צַפְרָא` | **R00712** `צְפַר I` † | form | sense | [1295b · leaf 618](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$619/full/1400,/0/default.jpg) |
| 136 | R00687 | …s) like getting a nail out of the gullet, v. **צִיפּוֹרֵי I**; a. fr.—… | R00414 `צִיפּוֹרֵי, צִיפּוֹרִים, צִיפּוֹרִין, צִפּ׳ II` | **R00413** `צִיפּוֹרֵי, צִיפּוֹרִין, צִפּ׳ I` | line | sense | [1296a · leaf 619](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$620/full/1400,/0/default.jpg) |
| 137 | R00687 | … v. שְׁחֵלֶת.—[Ex. R. s. 3, a. e. ציפורן, v. **צִיפּוֹרִין II**.]… | R00413 `צִיפּוֹרֵי, צִיפּוֹרִין, צִפּ׳ I` | **R00414** `צִיפּוֹרֵי, צִיפּוֹרִים, צִיפּוֹרִין, צִפּ׳ II` | line | sense | [1296a · leaf 619](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$620/full/1400,/0/default.jpg) |
| 138 | R00805 | …se it does not go by the name of חָגָב)?; v. **נֵצֶר I**.… | N01147 `נֵצֶר IV` | **N01144** `נֵצֶר I` † | form | sense | [1305a · leaf 628](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$629/full/1400,/0/default.jpg) |
| 139 | S00070 | …c book?; Tanḥ. Ḥuck. 6; a. fr.—[Ber. 62ᵃ, v. **קִבְלָא II**.]—[In later Hebrew ק׳ Kabbala… | S00066 `קִבְלָא, קִי׳ III` | **S00065** `קִבְלָא, קִי׳ II, קוּבְלָא` | line | sense | [1310a · leaf 633](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$634/full/1400,/0/default.jpg) |
| 140 | S00097 | …ing of the womb do not apply, unless &c., v. **פִּיקָא I**; Tosef. ib. VIII, 8; a. fr.… | Q00797 `פִּיקָא, פִּיקָה II` | **Q00796** `פִּיקָא, פִּיקָה I` | line | sense | [1312b · leaf 635](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$636/full/1400,/0/default.jpg) |
| 141 | S00151 | …Ber. 8ᵃ מְקַדְּמֵי וכ׳; קַדִּימוּ וחשיכו, v. **חֲשַׁךְ I**. … | H01849 `חֲשַׁךְ, חֲשׁוֹךְ II` | **H01848** `חֲשַׁךְ, חֲשׁוֹךְ I` | line | sense | [1316b · leaf 639](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$640/full/1400,/0/default.jpg) |
| 142 | S00231 | …, v. **קִבְלָא II**… | S00066 `קִבְלָא, קִי׳ III` | **S00065** `קִבְלָא, קִי׳ II, קוּבְלָא` | line | sense | [1323b · leaf 646](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$647/full/1400,/0/default.jpg) |
| 143 | S00286 | …(b. h.; cmp. **קוּץ I**) [to shrink,] to feel aversio… | S00533 `קוּץ IV` | **S00528** `קוּץ I` † | form | language_reference | [1326a · leaf 649](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$650/full/1400,/0/default.jpg) |
| 144 | S00412 | …ng women) must not sing dirges, v. קִינָה a. **עִינּוּי I**; a. fr.… | P00612 `עִינּוּי, עִנּ׳ II` | **P00611** `עִינּוּי, עִנּ׳ I` | line | sense | [1334a · leaf 657](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$658/full/1400,/0/default.jpg) |
| 145 | S00491 | …Ber. 55ᵇ; B. Mets. 38ᵇ, v. **פִּילָא I**. … | Q00666 `פִּילָא IV` | **Q00663** `פִּיל, פִּילָא I` † | form | sense | [1337b · leaf 660](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$661/full/1400,/0/default.jpg) |
| 146 | S00534 | …m.(b. h.; קָוַץ or **קוּץ I**)thorn. … | S00533 `קוּץ IV` | **S00528** `קוּץ I` † | form | language_reference | [1339b · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| 147 | S00961 | …, v. **קוּלְיָא I**… | S00337 `קוּלְיָא II, קַלְיָא` | **S00336** `קוּלְיָא I (implied), קוֹ׳` | form | sense | [1360a · leaf 683](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$684/full/1400,/0/default.jpg) |
| 148 | S00964 | …ן) a field irrigated by swipe and bucket; v. **סִילּוֹן II**.… | O00658 `סִילּוֹן I` | **O00659** `סִילּוֹן, סִלּ׳ II` | line | sense | [1360a · leaf 683](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$684/full/1400,/0/default.jpg) |
| 149 | S01024 | …ion is called ḳinah, when one speaks &c., v. **עִינּוּי I**. … | P00612 `עִינּוּי, עִנּ׳ II` | **P00611** `עִינּוּי, עִנּ׳ I` | line | sense | [1362b · leaf 685](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$686/full/1400,/0/default.jpg) |
| 150 | S01262 | …, v. **קוּלְיָא I**… | S00337 `קוּלְיָא II, קַלְיָא` | **S00336** `קוּלְיָא I (implied), קוֹ׳` | form | sense | [1372b · leaf 695](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$696/full/1400,/0/default.jpg) |
| 151 | S01278 | …, v. **קְלַסְטֵיר I**… | S01385 `קְלַסְטֵיר, קְלַסְטָר II, קְלַסְתָּר` | **S01384** `קְלַסְטֵיר, קְלַסְטָר I` | line | sense | [1373a · leaf 696](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$697/full/1400,/0/default.jpg) |
| 152 | S01321 | …Ib. XXV, 18 (ed. Wil. קָלַיָּא pl.).—V. **קוּלְיָא I**.… | S00337 `קוּלְיָא II, קַלְיָא` | **S00336** `קוּלְיָא I (implied), קוֹ׳` | form | sense | [1375b · leaf 698](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$699/full/1400,/0/default.jpg) |
| 153 | S01360 | …ot. in Rashi a. l., misreading for קלווא, v. **קוּלְיָא I**… | S00337 `קוּלְיָא II, קַלְיָא` | **S00336** `קוּלְיָא I (implied), קוֹ׳` | form | sense | [1378b · leaf 701](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$702/full/1400,/0/default.jpg) |
| 154 | S01376 | … II, 4; Yoma 38ᵃ קלוניתא (Ms. M. קלניתא), v. **נְחוּשְׁתָּן I**.… | N00482 `נְחוּשְׁתָּן, נְחֻשְׁ׳ II` | **N00481** `נְחוּשְׁתָּן, נְחֻשְׁ׳ I` | line | sense | [1379a · leaf 702](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$703/full/1400,/0/default.jpg) |
| 155 | S01439 | …Ib. 48ᵇ; a. fr.—בבא ק׳, v. **בָּב I**.—Pl. קַמָּאֵי. … | B00050 `בָּב II, בַּב נַהֲרָא` | **B00049** `בָּב, בָּאב, בָּבָא I` | line | sense | [1383b · leaf 706](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$707/full/1400,/0/default.jpg) |
| 156 | S01462 | …m. (preced.; cmp. **קוּץ I**) [shrinking,] feeling aversio… | S00533 `קוּץ IV` | **S00528** `קוּץ I` † | form | sense | [1385a · leaf 708](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$709/full/1400,/0/default.jpg) |
| 157 | S01486 | …, v. **קוּמְצָא I**, II.… | S00403 `קוּמְצָא, קָמְצָא II` | **S00402** `קוּמְצָא, קוֹ׳, קָמְצָא I` | line | sense | [1386b · leaf 709](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$710/full/1400,/0/default.jpg) |
| 158 | S01508 | …קַנֵּי, v. **קְנֵי I**.… | S01569 `קְנֵי, קְנָא II` | **S01567** `קְנֵי, קְנָא I` | line | sense | [1387b · leaf 710](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$711/full/1400,/0/default.jpg) |
| 159 | S01795 | …m. (קְצַץ; cmp. **גַּוָּוזָא II**) castrate, eunuch.—Pl. קְצוּצ… | C00328 `גַּוָּוזָא I` | **C00329** `גַּוָּוזָא II` † | form | sense | [1404b · leaf 727](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$728/full/1400,/0/default.jpg) |
| 160 | S01841 | …Y. Kil. I, 27ᵃ קְצָצוֹי, v. **חֲרוּבָא I**.… | H01614 `חֲרוּבָא, חֲרוּבָה II, כפר ח׳` | **H01613** `חֲרוּבָא, חֲרוּבָה I` † | line | sense | [1408a · leaf 731](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$732/full/1400,/0/default.jpg) |
| 161 | S01930 | …, v. **קִרְוָא I**, II.… | S01924 `קִרְוָא, קִרְוָוא, קִי׳ II, קִרְוָה, קֵרְוָוה` | **S01923** `קִרְוָא, קִרְוָוא, קִי׳ I` | line | sense | [1413a · leaf 736](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$737/full/1400,/0/default.jpg) |
| 162 | S02080 | … (cmp. **קוֹרָה I**) satisfaction, pleasure. … | S00587 `קוֹרָה IV` | **S00584** `קוֹרָה I` † | form | sense | [1421a · leaf 744](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$745/full/1400,/0/default.jpg) |
| 163 | S02103 | …B. Mets. 79ᵃ; B. Kam. 3ᵃ, v. **כְּלֵי I**. … | K00717 `כְּלֵי, כְּלָא II` | **K00716** `כְּלֵי, כְּלָא I` | line | sense | [1422b · leaf 745](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$746/full/1400,/0/default.jpg) |
| 164 | T00013 | …p. a. Pes., v. Rabb. D. S. a. l. note 90, v. **רְעִי I**.]—בית ר׳ digestive organ, cro… | T00893 `רְעִי, רְיעִי II` | **T00892** `רְעִי, רֵיעִי I` † | line | sense | [1436a · leaf 759](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$760/full/1400,/0/default.jpg) |
| 165 | T00218 | …Tosef. Ber. I, 1, v. **עוֹנָה I**; a. e.… | P00297 `עוֹנָה IV` | **P00294** `עוֹנָה I` † | form | sense | [1450a · leaf 773](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$774/full/1400,/0/default.jpg) |
| 166 | T00245 | …Gen. I, 28; cmp. **נִיר I**], to plough. … | N00787 `נִיר IV` | **N00782** `נִיר I, נוּר` † | form | sense | [1452a · leaf 775](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$776/full/1400,/0/default.jpg) |
| 167 | T00329 | … I Deut. XXXII, 24 רווחין, read: רוּחִין, v. **רְוַוח I**.]… | T00329 `רְוַוח, רְוַח II, רַוְוחָא, רַוְחָא` | **T00327** `רְוַוח, רְוַח I` | line | sense | [1457a · leaf 780](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$781/full/1400,/0/default.jpg) |
| 168 | T00346 | …Targ. Y. I ib. רווחין (corr. acc.), v. **רְוַוח I**; a. fr.—Y. Shek. V, end, 49ᵇ … | T00329 `רְוַוח, רְוַח II, רַוְוחָא, רַוְחָא` | **T00327** `רְוַוח, רְוַח I` | line | sense | [1458b · leaf 781](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$782/full/1400,/0/default.jpg) |
| 169 | T00665 | …, v. **דִּיסְתָּנָא I**… | D00668 `דִּיסְתָּנָא, דִּסְ׳ II` | **D00667** `דִּיסְתָּנָא, דִּסְ׳ I` | line | sense | [1475b · leaf 798](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$799/full/1400,/0/default.jpg) |
| 170 | T00717 | …es so as to look like Daleths.—[ריש לקיש, v. **לָקִישׁ I**.]… | L00694 `לָקִישׁ II, לַקִּישׁ, לְקִישָׁא` | **L00693** `לָקִישׁ, לְקִישָׁא I` † | line | sense | [1477b · leaf 800](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$801/full/1400,/0/default.jpg) |
| 171 | T00814 | …oes his trickery consist? Ib. לסגויי בר׳, v. **סְגֵי II**; a. e.… | O00122 `סְגֵי III, סַגְיָא I` | **O00121** `סְגֵי, סְגָא II` | line | sense | [1483a · leaf 806](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$807/full/1400,/0/default.jpg) |
| 172 | T00895 | …m. (v. **רְעִי I**) pasture. Targ. II Esth. IV, … | T00893 `רְעִי, רְיעִי II` | **T00892** `רְעִי, רֵיעִי I` † | line | sense | [1487a · leaf 810](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$811/full/1400,/0/default.jpg) |
| 173 | T01055 | …Ḥull. 63ᵃ Ar., v. **שְׁרַק I**.… | U02022 `שְׁרַק II` | **U02021** `שְׁרַק I, שְׁרֵיק` | form | sense | [1498a · leaf 821](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$822/full/1400,/0/default.jpg) |
| 174 | U00132 | …m. (שְׁבַק; v. **שִׁבְקָא I**) abandoned; spontaneous growt… | U00171 `שִׁבְקָא, שִׁי׳ II` | **U00170** `שִׁבְקָא, שִׁי׳ I` | line | sense | [1514b · leaf 837](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$838/full/1400,/0/default.jpg) |
| 175 | U00141 | … (שבל to drag along, cmp. b. h. שֹׁבֶל; cmp. **שִׁלְשׁוּל III**) snail without the shell. … | U01392 `שִׁלְשׁוּל, שִׁי׳ II` | **U01393** `שִׁלְשׁוּל, שׁי׳ III` † | line | sense | [1515a · leaf 838](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$839/full/1400,/0/default.jpg) |
| 176 | U00254 | …, v. **שִׁידָּא I**… | U00821 `שִׁידָּא II` | **U00820** `שִׁידָּא I, שִׁדָּא` | form | sense | [1524a · leaf 847](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$848/full/1400,/0/default.jpg) |
| 177 | U00383 | …, Y. Kidd. II, 62ᵈ ש׳ של שיער, v. **שִׁיטָּה III**… | U00883 `שִׁיטָּה II` | **U00884** `שִׁיטָּה, שִׁטָּה III` † | line | sense | [1532a · leaf 855](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$856/full/1400,/0/default.jpg) |
| 178 | U00526 | …, v. **שׁוּקָא I**… | U00525 `שׁוּקָא II` | **U00524** `שׁוּקָא I, שׁוּקָה` | form | sense | [1541a · leaf 864](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$865/full/1400,/0/default.jpg) |
| 179 | U00535 | …(b. h.; cmp. **שְׁיָירָא II**) מִדְבַּר ש׳ desert of Shur (… | U00912 `שְׁיָירָה, שְׁיָירָא III` | **U00911** `שְׁיָירָא II, שְׁיָירָה I` | form | language_reference | [1541b · leaf 864](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$865/full/1400,/0/default.jpg) |
| 180 | U00543 | …m. (Shaf. of **רְבֵי I**) a species of cedar. … | T00084 `רְבֵי, רְבָא III` | **T00082** `רְבֵי, רְבָא I` | line | sense | [1542a · leaf 865](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$866/full/1400,/0/default.jpg) |
| 181 | U00629 | …, v. **שָׁחוֹר I**… | U00628 `שָׁחוֹר II` | **U00627** `שָׁחוֹר I, שְׁחוֹרָה` † | form | sense | [1546b · leaf 869](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$870/full/1400,/0/default.jpg) |
| 182 | U00704 | …(b. h.; cmp. **חָרַר I**)to break through, dig; to sea… | H01770 `חָרַר IV` | **H01764** `חָרַר I` † | form | language_reference | [1551b · leaf 874](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$875/full/1400,/0/default.jpg) |
| 183 | U00706 | … h.; cmp. חָרַר III)to be charred, black.—V. **שָׁחוֹר I**.… | U00628 `שָׁחוֹר II` | **U00627** `שָׁחוֹר I, שְׁחוֹרָה` † | form | sense | [1551b · leaf 874](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$875/full/1400,/0/default.jpg) |
| 184 | U00736 | …Sabb. 152ᵃ, v. **זִימָּה I**; a. e.—Pl. שְׁטוּפִין. … | G00362 `זִימָּה, זִמָּה II` | **G00361** `זִימָּה, זִמָּה I` | line | sense | [1552b · leaf 875](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$876/full/1400,/0/default.jpg) |
| 185 | U00864 | …Gitt. 19ᵃ; Sabb. 104ᵇ, v. **שָׁחוֹר I**. … | U00628 `שָׁחוֹר II` | **U00627** `שָׁחוֹר I, שְׁחוֹרָה` † | form | sense | [1559b · leaf 882](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$883/full/1400,/0/default.jpg) |
| 186 | U00888 | … h. form) = h. **שִׁיטָּה III**, … | U00883 `שִׁיטָּה II` | **U00884** `שִׁיטָּה, שִׁטָּה III` † | line | sense | [1560b · leaf 883](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$884/full/1400,/0/default.jpg) |
| 187 | U00888 | …ed two modes of developing the same idea, v. **שִׁיטָּה III**. … | U00883 `שִׁיטָּה II` | **U00884** `שִׁיטָּה, שִׁטָּה III` † | line | sense | [1560b · leaf 883](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$884/full/1400,/0/default.jpg) |
| 188 | U00973 | …yikra, Ḥob., ch. XIX, Par. 11; Meïl. 18ᵃ, v. **שִׁיקּוּר I**.—Pl. שִׁינּוּיִים, שִׁינּוּיִ… | U01047 `שִׁיקּוּר II` | **U01046** `שִׁיקּוּר, שִׁקּ׳ I` | line | sense | [1564a · leaf 887](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$888/full/1400,/0/default.jpg) |
| 189 | U01060 | …Ber. 56ᵃ, v. **תִּכְלָא II**. … | V00543 `תִּכְלָא III` | **V00542** `תִּכְלָא, תִּי׳ II` | line | sense | [1568b · leaf 891](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$892/full/1400,/0/default.jpg) |
| 190 | U01063 | …, v. **שֵׁירוּתָא II**, III.… | U01070 `שֵׁירוּתָא, שֵׁר׳, שֵׁירוּ, שֵׁרוּ I` | **U01071** `שֵׁירוּתָא, שֵׁר׳, שֵׁירוּ, שֵׁרוּ II` † | line | sense | [1569a · leaf 892](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$893/full/1400,/0/default.jpg) |
| 191 | U01241 | …, v. **שְׁלֵיוָא I**, II.… | U01306 `שְׁלֵיוָא, שְׁלֵוָוא, שְׁלֵיוְתָא` | **U01305** `שְׁלֵיו, שְׁלֵיוָא, שְׁלֵוָוא I` | line | sense | [1579a · leaf 902](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$903/full/1400,/0/default.jpg) |
| 192 | U01271 | …m. = h. **שֶׁלַח I**. … | U01270 `שֶׁלַח IV` | **U01267** `שֶׁלַח I` † | form | sense | [1580b · leaf 903](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$904/full/1400,/0/default.jpg) |
| 193 | U01298 | … adv. (שְׁלֵי II, v. **שִׁלְיָא I**) without concern, unawares. … | U01296 `שִׁלְיָא, שִׁי׳ II` | **U01295** `שִׁלְיָא, שִׁלְיָיא, שִׁי׳ I` | line | sense | [1582b · leaf 905](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$906/full/1400,/0/default.jpg) |
| 194 | U01400 | … (v.**שִׁלְשׁוּל III**) to relax, loosen the bowels.… | U01392 `שִׁלְשׁוּל, שִׁי׳ II` | **U01393** `שִׁלְשׁוּל, שׁי׳ III` † | line | sense | [1590a · leaf 913](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$914/full/1400,/0/default.jpg) |
| 195 | U01409 | … (= שַׁלָּמָּה, v. **דִּילְמָא I**) [for why,] … | D00608 `דִּילְמָא, דִּלְמָא II` | **D00607** `דִּילְמָא, דִּלְמָא I` | line | sense | [1591a · leaf 914](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$915/full/1400,/0/default.jpg) |
| 196 | U01517 | …Y. Yeb. VIII, 9ᵈ bot.; a. v. fr., v. **לָקִישׁ I**; a. other Amoraim; v. Fr. M’b… | L00694 `לָקִישׁ II, לַקִּישׁ, לְקִישָׁא` | **L00693** `לָקִישׁ, לְקִישָׁא I` † | line | sense | [1600a · leaf 923](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$924/full/1400,/0/default.jpg) |
| 197 | U01539 | …משמש וכ׳ ki serves for four meanings &c., v. **דִּילְמָא I**; a. fr.—Euphem. ש׳ מטתו, or o… | D00608 `דִּילְמָא, דִּלְמָא II` | **D00607** `דִּילְמָא, דִּלְמָא I` | line | sense | [1601b · leaf 924](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$925/full/1400,/0/default.jpg) |
| 198 | U01557 | …Targ. I Kings X, 22 (v. **פִּילָא I**). … | Q00666 `פִּילָא IV` | **Q00663** `פִּיל, פִּילָא I` † | form | sense | [1603b · leaf 926](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$927/full/1400,/0/default.jpg) |
| 199 | U01568 | …m.(b. h.; v. **שָׁנָה I**) repetition, double. Pesik. B… | U01571 `שָׁנָה II` | **U01570** `שָׁנָה I` | form | sense | [1604b · leaf 927](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$928/full/1400,/0/default.jpg) |
| 200 | U01635 | …Tosef. Ber. I, 1, a. e., v. **עוֹנָה I**. … | P00297 `עוֹנָה IV` | **P00294** `עוֹנָה I` † | form | sense | [1609b · leaf 932](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$933/full/1400,/0/default.jpg) |
| 201 | U01706 | …ps? Ib. שְׁפָאֶיהָ (Ms. M. שִׁיפּוּיֶיהָ, v. **שִׁיפּוּי I**).—Trnsf. שְׁפָאֵי עידית (cmp.… | U01013 `שִׁיפּוּי, שִׁפּ׳ II` | **U01012** `שִׁיפּוּי, שִׁפּ׳ I` | line | sense | [1613b · leaf 936](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$937/full/1400,/0/default.jpg) |
| 202 | U01714 | …Bets. 28ᵇ; a. fr.—[Tosef. Meïl. I, 25, v. **שִׁיפּוּי I**.]—Pl. שְׁפוּדִין. Y. Naz. l. … | U01013 `שִׁיפּוּי, שִׁפּ׳ II` | **U01012** `שִׁיפּוּי, שִׁפּ׳ I` | line | sense | [1614a · leaf 937](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$938/full/1400,/0/default.jpg) |
| 203 | U01871 | …better: שְׁקוֹלִי וכ׳ take thy goodness), v. **חִיזְרָא I**; a. e.… | H00702 `חִיזְרָא, חִזְ׳ II` | **H00701** `חִיזְרָא, חִזְ׳ I` | line | sense | [1623b · leaf 946](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$947/full/1400,/0/default.jpg) |
| 204 | U01961 | …Yeb. 100ᵃ שָׁרֵינָא וכ׳, v. **תִּגְרָא I**; a. e.… | V00093 `תִּגְרָא, תִּי׳ II` | **V00092** `תִּגְרָא, תִּי׳ I` | line | sense | [1630a · leaf 953](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$954/full/1400,/0/default.jpg) |
| 205 | U02027 | … III, cmp. יְרַקְרֵיקָא; popular etymol. fr. **שְׁרַק I**, q. v.) name of an unclean bi… | U02022 `שְׁרַק II` | **U02021** `שְׁרַק I, שְׁרֵיק` | form | sense | [1634a · leaf 957](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$958/full/1400,/0/default.jpg) |
| 206 | U02087 | …B. Bath. 90ᵇ ש׳ מלבר, v. **בַּר I** ch. … | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | form | sense | [1637a · leaf 960](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$961/full/1400,/0/default.jpg) |
| 207 | U02092 | …עשרה … אִישְׁתֵּית thou drankest ten &c., v. **קִיסְטָא I**. … | S01065 `קִיסְטָא II, קִיסְטָה` | **S01064** `קִיסְטְ, קִיסְטָא, קִסְ׳ I` | line | sense | [1637b · leaf 960](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$961/full/1400,/0/default.jpg) |
| 208 | V00072 | …the Mishnah); he that taught the one &c., v. **שָׁנָה I**; [R. Ḥănanel: excommunication… | U01571 `שָׁנָה II` | **U01570** `שָׁנָה I` | form | sense | [1645b · leaf 968](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$969/full/1400,/0/default.jpg) |
| 209 | V00089 | …Pes. 50ᵇ, a. e. ת׳ סימטא, v. **סִימְטָא I**. … | O00700 `סִימְטָא, סִמְ׳ II` | **O00699** `סִימְטָא, סִמְ׳ I` | line | sense | [1646b · leaf 969](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$970/full/1400,/0/default.jpg) |
| 210 | V00100 | …m. (v. **תִּגְרָא I**) quarrelsome man. … | V00093 `תִּגְרָא, תִּי׳ II` | **V00092** `תִּגְרָא, תִּי׳ I` | line | sense | [1647b · leaf 970](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$971/full/1400,/0/default.jpg) |
| 211 | V00101 | … f. = **תִּגְרָא I**. … | V00093 `תִּגְרָא, תִּי׳ II` | **V00092** `תִּגְרָא, תִּי׳ I` | line | sense | [1647b · leaf 970](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$971/full/1400,/0/default.jpg) |
| 212 | V00155 | …, v. **תִּגְרָא I**… | V00093 `תִּגְרָא, תִּי׳ II` | **V00092** `תִּגְרָא, תִּי׳ I` | line | sense | [1650b · leaf 973](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$974/full/1400,/0/default.jpg) |
| 213 | V00196 | …Yoma 72ᵇ, v. **בַּר I**; a. fr.—Pl. תּוֹכוֹת. … | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | form | sense | [1652a · leaf 975](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$976/full/1400,/0/default.jpg) |
| 214 | V00547 | …city of Luz where they dye the t’kheleth (v. **לוּז I**). … | L00229 `לוּז IV` | **L00225** `לוּז I` | form | sense | [1668b · leaf 991](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$992/full/1400,/0/default.jpg) |
| 215 | V00601 | …Cant. R. to V, 11, v. **שָׁחוֹר I**.… | U00628 `שָׁחוֹר II` | **U00627** `שָׁחוֹר I, שְׁחוֹרָה` † | form | sense | [1672b · leaf 995](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$996/full/1400,/0/default.jpg) |
| 216 | V00728 | …m. (infin. Pa. of **תְּנֵי I**) teaching or studying (Mishna… | V00744 `תְּנֵי II` | **V00743** `תְּנֵי I, תְּנָא` | form | sense, find ×2 | [1680b · leaf 1003](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1004/full/1400,/0/default.jpg) |
| 217 | V00728 | …(v. Rabb. D. S. a. l. note 30).—[Ib. 49ᵃ, v. **תְּנֵי I**].… | V00744 `תְּנֵי II` | **V00743** `תְּנֵי I, תְּנָא` | form | sense, find ×2 | [1680b · leaf 1003](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1004/full/1400,/0/default.jpg) |
| 218 | V00757 | …m. (Ithpe. noun of סְבַר, v. **סְבַר I** Ithpoel; cmp. Syr. סיברתא P. … | O00090 `סְבַר IV, סִבְרָא, סִי׳, סוֹבָרָא` | **O00085** `סְבַר, סְבֵיר I` | line | sense | [1682b · leaf 1005](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1006/full/1400,/0/default.jpg) |
| 219 | V00833 | …f. = **פְּלוּגְתָּא I**, difference of opinion. … | Q00965 `פְּלוּגְתָּא II, פְּלוּגְתָּה` | **Q00964** `פְּלוּגְתָּא I (implied), פְּלֻגְ׳` | form | sense | [1687a · leaf 1010](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1011/full/1400,/0/default.jpg) |
| 220 | V00921 | …, v. **תְּרֵי I**, II.… | V00980 `תְּרֵי, תְּרָא II` | **V00979** `תְּרֵי, תְּרָא I` | line | sense | [1694b · leaf 1017](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1018/full/1400,/0/default.jpg) |
| 221 | V01081 | …Ned. III, 8 quot. s. v. **שָׁחוֹר I**) … | U00628 `שָׁחוֹר II` | **U00627** `שָׁחוֹר I, שְׁחוֹרָה` † | form | sense | [1703b · leaf 1026](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1027/full/1400,/0/default.jpg) |
| 222 | V01117 | …Lev. R. s. 35, v. **חֲרוּבָא I**; ib. s. 13; Yalk. Is. 256; a.… | H01614 `חֲרוּבָא, חֲרוּבָה II, כפר ח׳` | **H01613** `חֲרוּבָא, חֲרוּבָה I` † | line | sense | [1705b · leaf 1028](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1029/full/1400,/0/default.jpg) |

### 5.2 (b): one bare member (15)

In the worklist (since PR #186 [`maintainer-checklist.md`](maintainer-checklist.md); since 2026-10-18 its answered and its renaming questions there and the rest in [`post-go-live-review.md`](post-go-live-review.md) § Cross-reference numerals), for the reason above; listed here as the population.

| # | citing rid | the cite in context | Sefaria links | the one bare member | family | scan |
|---|---|---|---|---|---|---|
| 1 | A01864 | …mehow) unless, but for (followed by ש־; cmp. **אִלְמָלֵא I**). … | A01918 `אִלְמָלֵא, אִלְמָלֵי, אִילְ׳` | A01918 `אִלְמָלֵא, אִלְמָלֵי, אִילְ׳` | A01918 `אִלְמָלֵא` | [69b · leaf 92](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$93/full/1400,/0/default.jpg) |
| 2 | A02360 | …, v. **אִסְטְלִי I**, II.… | A02379 `אִסְטְלִי, אִסְטוֹלִי, אִיסְ׳ II` | A02378 `אִסְטַלִּי, אִסְטוֹלִי, אִיסְ׳` | A02378 `אִסְטַלִּי`, A02379 `אִסְטְלִי` | [90a · leaf 113](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$114/full/1400,/0/default.jpg) |
| 3 | C00538 | …B. Mets. 90ᵇ top Ms. M., v. **גְּנַח II**.… | C01129 `גְּנַח I` | C01128 `גָּנַח` | C01128 `גָּנַח`, C01129 `גְּנַח I` | [229a · leaf 252](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$253/full/1400,/0/default.jpg) |
| 4 | C00841 | …m. (v. **גִּיס I**) familiar. … | C00773 `גִּיס II, גָּיֵיס` | C00772 `גֵּיס` | C00772 `גֵּיס`, C00773 `גִּיס II`, C00774 `גִּיס II` | [243a · leaf 266](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$267/full/1400,/0/default.jpg) |
| 5 | H00303 | … c. (= b. h. חֹטֶר, v. חֲטַר; cmp. **גִּזְרָא I**) staff, scepter. … | C00578 `גִּזְרָא, גִּיזְרָא II` | C00577 `גִּזְרָא, גִּיזְרָא` | C00577 `גִּזְרָא`, C00578 `גִּזְרָא` | [431b · leaf 454](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$455/full/1400,/0/default.jpg) |
| 6 | K00444 | …ְזַז כ׳ מינה Ar. (ed. מיב׳ ב׳), opp. גיס, v. **גִּיס I**. … | C00773 `גִּיס II, גָּיֵיס` | C00772 `גֵּיס` | C00772 `גֵּיס`, C00773 `גִּיס II`, C00774 `גִּיס II` | [628a · leaf 651](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$652/full/1400,/0/default.jpg) |
| 7 | P00639 | …pr. n. m.ʿEfa, v. **חֵיפָא III**.… | H00840 `חֵיפָא II` | H00841 `חִיפָּא` | H00839 `חֵיפָא I`, H00840 `חֵיפָא II`, H00841 `חִיפָּא`, H00843/1 `חֵיפָא` | [1073b · leaf 396](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$397/full/1400,/0/default.jpg) |
| 8 | P01275 | …nsactions between a man and his neighbor (v. **עֵרָבוֹן II**); Yalk. ib. 150. … | P01273 `עֵרָבוֹן, עֵי׳` | P01273 `עֵרָבוֹן, עֵי׳` | P01272 `עֵרָבוֹן`, P01273 `עֵרָבוֹן` | [1113a · leaf 436](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$437/full/1400,/0/default.jpg) |
| 9 | S00305 | …, v. **קִיטְרָא I**… | S00922 `קִיטְרָא, קוּטְ׳, קִטְ׳` | S00922 `קִיטְרָא, קוּטְ׳, קִטְ׳` | S00922 `קִיטְרָא` | [1326b · leaf 649](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$650/full/1400,/0/default.jpg) |
| 10 | U00835 | …, v. **שַׁוְיָא II**… | U00395 `שָׁוְי, שַׁוְיָא I` | U00396 `שַׁוְיָא, שַׁוְויָא, שִׁיוְו׳, שִׁוּוּיָא, שִׁיוּוּ׳` | U00395/1 `שַׁוְיָא I`, U00396 `שַׁוְיָא` | [1558b · leaf 881](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$882/full/1400,/0/default.jpg) |
| 11 | U01112 | …, v. **שִׁית IV**… | U01100 `שִׁית I` | U01103 `שִׁית, שֵׁית, שִׁיתָּא, שִׁיתָּה, שִׁתָּ׳` | U01100 `שִׁית I`, U01101 `שִׁית II`, U01102 `שִׁית III`, U01103 `שִׁית`, U01103/1 `שֵׁית` | [1570b · leaf 893](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$894/full/1400,/0/default.jpg) |
| 12 | U01502 | … c. (v. **שָׁמִין II**) fat, rich. … | U01469 `שָׁמִין I` | U01470 `שָׁמִין, שְׁמֵין` | U01469 `שָׁמִין I`, U01470 `שָׁמִין`, U01470/1 `שְׁמֵין` | [1598a · leaf 921](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$922/full/1400,/0/default.jpg) |
| 13 | U02059 | …, v. **שֵׁשׁ III**… | U02055 `שֵׁשׁ II` | U02056 `שֵׁשׁ, שִׁשָּׁה` | U02054 `שֵׁשׁ I`, U02055 `שֵׁשׁ II`, U02056 `שֵׁשׁ` | [1636a · leaf 959](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$960/full/1400,/0/default.jpg) |
| 14 | U02071 | …, six, v. **שִׁית IV**.… | U01100 `שִׁית I` | U01103 `שִׁית, שֵׁית, שִׁיתָּא, שִׁיתָּה, שִׁתָּ׳` | U01100 `שִׁית I`, U01101 `שִׁית II`, U01102 `שִׁית III`, U01103 `שִׁית`, U01103/1 `שֵׁית` | [1636b · leaf 959](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$960/full/1400,/0/default.jpg) |
| 15 | V00570 | …, v. **תַּלְמָא II**… | V00599 `תְּלָמָא, תַּלְמָא I` | V00600 `תַּלְמָא, תְּלָאמָא` | V00599 `תְּלָמָא`, V00599/1 `תַּלְמָא I`, V00600 `תַּלְמָא` | [1670a · leaf 993](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$994/full/1400,/0/default.jpg) |

## 6. Past patches by case

Reproduced from the 439 records at `98804214d` by the rules in §8; it
matches ANNOTATIONS.md §4 cell for cell.

| | replace | retag | split | join | delete | nest | reform | unref | total |
|---|---|---|---|---|---|---|---|---|---|
| 1, silent | 49 | 30 | 59 | 51 | 36 | 2 | 53 | 3 | 283 |
| 1, companion split of an implied-`1)` entry | 0 | 0 | 58 | 0 | 0 | 0 | 0 | 0 | 58 |
| 1 by bytes, number kept: class 3, becomes 2 | 1 | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 20 |
| 2, implied `1)` (annotation owed) | 1 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 61 |
| 2, implied I (5 owe an annotation; 9 withdrawn) | 0 | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 14 |
| 3 / 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| unclassified | 1 | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 3 |
| total | 52 | 91 | 136 | 51 | 36 | 2 | 68 | 3 | 439 |

The three unclassified:

| patch | rid | what it does | disposition |
|---|---|---|---|
| P000215 (`retag`) | D00341 | print's `[1)` becomes the label `1)` … | case 1, no annotation: with P000216 it keeps every printed byte and moves only the bracket, from the label token into the text, because a label stores the number alone. That is layout, as 10-04's dropped dash is, which 10-13 does not reopen |
| P000216 (`replace`) | D00341 | … and `[` moves into the sense text | as P000215 |
| P000307 (`reform`) | G00675 | sets the `disambiguator` that keeps G00675's name apart from G00674's (HW-xref-collision) | none: `disambiguator` is Sefaria's notation, not a correction (ANNOTATIONS.md §4) |

## 7. The data PRs, in order

1. **(i) Implied I and their cross-references.** Done in PR #174.
   Amend 5 reforms
   (P000343, P000344, P000348, P000353, P000355: drop `implied`, add
   `display` and the annotation); retire 9 (P000342, P000345–P000347,
   P000349–P000352, P000354) and add 9 reviewed-kept records; 10
   `replace` retargets. In the same PR rule 3 loses its implied
   clause, and `implied` leaves the contract and `reform.homographs`.
   Eight names lose their I. B00537's I was on its alternate
   `בִּיאָה`, so its name, the primary `בִּיָּא`, holds.
2. **(ii) RP8 marks.** Done in PR #175. 61 annotations: 24 retags in
   place; 36 retags moved with their companion splits from 4 agent
   tranches into `reviewed/`; D00072's `replace` (P000214) retired for
   a `retag` + `split` pair (P000554, P000555).
3. **(iii) Class 3 renumber.** Done in PR #176. 24 new `retag`s on
   18 entries, each annotated (P000556–P000579); S01849's `replace`
   (P000580); U01512's `annotate` (P000581).
4. **(iv) Round 2 (L46).** Done in PR #177. The 16 answers under
   10-13: 13 reviewed patches on 11 entries (P000582–P000594). The two
   text-proven Is (H00319, I00077) are displayed and annotated, and
   S01780's case-4 respelling is annotated `illegible`. H01100 is
   respelled `חֵלֶף I`, U01396's and V00522's alternates take print's
   I, and 5 cites are retargeted. 12 reviewed-kept records. H00355's
   and H00733's `חוּל I` sit in `language_reference` and wait on L50
   (applied in PR #179).
5. **(v) Cross-reference numerals.** First the 212 determined
   retargets not in (i) (10 of them wait on L50's op); then the 48
   worklist answers. The determined half, (v-a), is done in PR #178:
   196 retargets (P000595–P000790) on 184 entries; 10 rows wait on
   L50 and 6 `X I ch.` rows are held for a read (§5.1). Those 16 are
   done in PR #179, (v-b), with H00355 and H00733 from (iv): the 10
   and the two through the new `language_reference:` target, the 6
   to the `ch.` line under ruling `10-15 ch. cross-reference`. The
   determined half is complete. The 74-row worklist half waits on the
   maintainer's ticks, in
   [`maintainer-checklist.md`](maintainer-checklist.md) § Cross-reference
   numerals since PR #186. Split 2026-10-18: the 8 questions answered
   that day stay there (§ Cross-reference numerals: answered 2026-10-18
   (8)), with the 18 that may rename an entry (31 cites; § Cross-reference
   numerals: may rename an entry (18)); the other 22, 34 cites, are
   deferred post go-live 2026-10-18 by the maintainer's blocker
   definition; rows in [`post-go-live-review.md`](post-go-live-review.md).
6. **P00790**, after L59. Done in PR #180: L59's mechanism is the new
   reviewed op `relabel`, and P000812 relabels the Hif. run
   (`docs/correction-audit.md` §4;
   [`../admin/pipeline/patch/records/tranches/lettered-relabel-2026-10-16/`](../admin/pipeline/patch/records/tranches/lettered-relabel-2026-10-16/README.md)).
   Blessing: 98 annotations written (96 print-error, 1 kept, 1
   illegible).
7. **The group 11 data leftovers** (review ledger L36, L51, L57,
   L61). Done in PR #182: 8 reviewed patches on 7 entries
   (P000813–P000820) and a `join` rule. One is annotated: M00491's
   first sense is unlabelled before print's `—*2)`, so splitting the
   starred sense out leaves the RP8 shape, and P000815 numbers it
   `1)` (case 2). The rest are case 1 or change no label: three
   starred splits, one cite retarget, two restored `)`s, and a
   `relabel` whose `to` is its `run` (J00403). The `join` now sets
   print's space before the numeral as well as after it, which moves
   20 entries by one space each, no patch. Blessing: 99 annotations
   written (97 print-error, 1 kept, 1 illegible)
   ([`../admin/pipeline/patch/records/tranches/leftovers-2026-10-16/`](../admin/pipeline/patch/records/tranches/leftovers-2026-10-16/README.md)).

**Mechanisms the data PRs lack or must confirm:**

- **An annotation on an agent patch is refused**, so 36 RP8 retags,
  with their splits, move to `reviewed/` (§2.1). Records move; no code
  changes. Done in PR #175.
- **D00072 cannot be annotated as a `replace`**; it converts to a
  `retag` + `split` (§2.3). No code changes. Done in PR #175.
- **No op edits `language_reference`** (L50): 10 determined retargets
  and 3 worklist cites (P00866, M02733, M02738) wait on it. The 10
  are §5.1 rows 12, 19, 51, 58, 64, 85, 143, 146, 179 and 182, still
  waiting after PR #178. Built in PR #179: `replace` and `annotate`
  take a `language_reference:<anchor>` target, and the 10 are
  applied; the 3 worklist cites can use it once ticked.
- **No op relabels a lettered run** (L59): P00790's children are made
  at trace time, after every patch, and patch markers are digits
  only. Built in PR #180: `relabel`, a reviewed op that declares print's
  run and the children's labels on the sense, and P000812 applies it.
- **Removing an implied I needs no op**: retiring the reform restores
  the bare form. The PR's dry import should show only the numeral, the
  name and the X10 row moving.
- **To confirm in the PRs**: that an `annotate` target reaches a child
  a `nest` made (U01512; confirmed in PR #176 with no code change:
  `walkSenses` visits a sense's children and `buildTextChild` carries
  the draft), and that two chained `reform`s on one rid apply in order
  (S01780; their targets differ by hash, so the one-patch-per-target
  rule does not refuse them; confirmed in PR #177 with no code change:
  `applyEntryPatches` applies a rid's patches in corpus order, each
  on the entry the one before left, and tests in
  `patch/annotation.test.ts` pin it).

## 8. How this was produced

Read-only Python over the worktree at `98804214d`; the scripts are not
committed. Hebrew is compared in NFC, or as consonants: NFD with every
mark in U+0591–U+05C7 and U+0307 removed, as `consonants` in
`admin/pipeline/report/headword-issues.ts`.

- **Fields and cites.** Every `gloss` and every `units[n]` of every
  sense, children and stems included. A cite is
  `<cite ref="…">…</cite>`; internal when `ref` matches
  `^[A-Z]\d{5}$` (71,362 of them).
- **§1.** Forms with `implied: true` (14). A cite names `X I` when its
  visible text is two tokens, the first with the form's consonants and
  the second `I` (optionally followed by `)` or `.`).
- **§2.** Records whose op is `retag` and `defect_class` `implied-one`
  (57), the `retag`s of B01321, C01169 and U01787 (3), and P000214.
  Companions are `split`s with `defect_class` `implied-one` (58, on
  the 57 rids).
- **§3.** Label lists read from the committed entries; the renumber is
  previous + 1 for every numeric label after the first. The
  cross-reference search is as §3 states it.
- **§5.** The population predicate and classes are as §5 states them,
  window 5. Source anchors: the citing rid's snapshot definitions and
  `language_reference`, searched for an `<a … data-ref="Jastrow, K 1">`
  whose visible text equals the cite's; found for all 296. The `†`
  test aligns each entry's source anchors with its internal cites in
  document order (27,368 entries where the two counts agree) to see
  which key existing links resolve by.
- **§6.** Rules in order: P000215, P000216 and P000307 unclassified;
  `prompt_version` `class3-2026-10-12` class 3; `defect_class`
  `headword-implied-one` implied I; §2's set implied `1)`; `split` with
  `defect_class` `implied-one` companion; the rest case 1.
- **hOCR.** Lines from `data/print/hocr/`, each placed in the left or
  right half of its leaf. A quote is the best line on the rid's leaf
  (or the next) by shared Latin words with the entry's or the cite's
  text, kept only at 3 shared words or more (4 for a worklist family
  member); a line two members both claim goes to the better match.
- **Scan links.** The page index's leaf for the rid; the IIIF index is
  the leaf + 1.
