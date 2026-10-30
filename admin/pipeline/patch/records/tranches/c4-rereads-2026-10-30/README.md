# C4: cite retargets פ–ר, maintainer re-read (2026-10-30)

Group 3, batch 4 of 12, of
[`docs/review-checklist-2026-10-25.md`](../../../../../../docs/review-checklist-2026-10-25.md):
the 29 pending cite retargets whose family starts with פ–ר, one
maintainer block each. **No patch record, entry or checklist change.**
This directory holds only this README; a later commit applies the reads,
as C1's, C2's and C3's did
([`c1-rereads-2026-10-27`](../c1-rereads-2026-10-27/README.md), PR #200;
[`c2-rereads-2026-10-27`](../c2-rereads-2026-10-27/README.md), PR #202;
[`c3-rereads-2026-10-30`](../c3-rereads-2026-10-30/README.md), PR #203).

## Why these 29

Ruling `10-26 patch evidence`
([`docs/decisions.md`](../../../../../../docs/decisions.md)): every
reviewed patch carries `evidence`, and the import refuses a
text-changing patch that stands on Sefaria's text alone unless it is
`pending`. The backfill
([`evidence-backfill-2026-10-26`](../evidence-backfill-2026-10-26/README.md))
left all 29 here as `{"kind": "sefaria-only", "pending": true}`. They
still apply.

All 29 are retargets from
[`cite-retargets-2026-10-15`](../cite-retargets-2026-10-15/README.md)
(PR #178), case 1 of ruling `10-13 correction policy`: the cite's text
(`v. צִיר I`) is Jastrow's, Sefaria's linker aimed it at a member of
the word's family that lacks the numeral, and the patch re-aims it at
the one member that carries it. No print was read when they were
written. The read turns each into `maintainer-read` (a scan read),
`hOCR` (a Latin-only claim, quoted verbatim) or `jastrow-text`, or
withdraws the patch, or re-aims it (see "After the reads").

## The set

The checklist's predicate, run on
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl) at
`36e99d5d3`:

```bash
P=admin/pipeline/patch/records/reviewed/patches.jsonl
D='def fam: .rationale | capture("cite.s text reads [\"`](?<w>[^\"`]+)[\"`]").w | explode | map(select(. >= 1488 and . <= 1514)) | implode | .[0:1];
def retarget: .evidence.pending and .prompt_version == "cite-retargets-2026-10-15";'
jq -c "$D select(retarget and fam >= \"פ\" and fam <= \"ר\")" $P
```

**29 records over 27 entries, 20 families**, as the checklist's table
says. Two entries hold two records each:

- Q00839 holds P000698 and P000699, a chained pair in sense `1)`, which
  cites `פֵּירוּכָא I` twice (`= פֵּירוּכָא I.` and `v. פֵּירוּכָא I.`).
  P000698's `find` carries the period and space after the first cite,
  which makes that cite its only match; P000699 applies on the
  definition P000698 leaves, where its `find` matches the second cite
  alone.
- R00687 holds P000714 and P000715, two cites in different senses (`1)`
  and `—3)`) and of different families (צִיפּוֹרֵי and צִיפּוֹרִין),
  each applying on its own.

Chained means the second record's `expected_before` is the first's with
the first applied, and its target hash differs for that reason; on
R00687 the second's `expected_before` holds neither the first's `find`
nor its `replace` (checked by script, which reads C3's O01610 as
chained and O01402 as not). A family is the cite word's consonants
(ruling 10-05). The 29 ids below equal the predicate's output (diffed).

Every citing entry is in vol. 2: the page index
([`data/page-index/`](../../../../../../data/page-index/README.md))
places all 27 on pages 829–1637, whose `columns.jsonl` leaves (152–960)
are page − 677, as its "Scan coordinates" give.

Checked by script on all 29:

- each is a `replace`, not `status: provisional`, whose `payload.find`
  occurs in `expected_before` once, and whose `payload.find` and
  `payload.replace` differ only in the anchor's `href` and `data-ref`,
  the visible text the same;
- the old `href` and `data-ref` are the link key (`sefariaHeadword`) of
  the entry Sefaria links, the new ones the target's (the same checks
  with `find` and `replace` swapped fail on all 29);
- the target is the one entry of the family (every entry with a
  headword form of the cite word's consonants) that carries the cite's
  numeral on a headword form, and the entry Sefaria links carries a
  different numeral;
- none of the 29 cites is followed by `ch.` in the entry as it stands.

`removes` is absent on all 195 records of `cite-retargets-2026-10-15`
(56 of them still pending: C4's 29 and C5's 27), so every block's
**Removes** line says none.

## How to read a block

Each block gives the entry, the scan link at the leaf the page index
gives it, and the hOCR line that holds the cite, first. The proposal
is last and collapsed. Read the print, then tick **one** box and write
what print shows on the `Read:` line. To re-aim a cite at another
target, tick withdraw and name that target on the `Read:` line, as C1's
B01237 and N00106 were (see "After the reads"). A block with both boxes
ticked goes back to the reader
([`DESIGN.md` §5 "Patch process"](../../../../DESIGN.md#patch-process)).

**What the hOCR can witness.** Latin text, numerals, punctuation and
position only, never a Hebrew reading
([`DESIGN.md` §5 "Patch evidence"](../../../../DESIGN.md#patch-evidence)).
The Roman numeral after the cite word is Latin, so the hOCR can witness
it; the Hebrew word before it needs the scan. **Every citing entry here
is in vol. 2**, whose hOCR (ABBYY 8) holds no Hebrew character at all
(none on any quoted line, checked by script). ABBYY read the Hebrew
type as Latin letters, digits and marks, so each Hebrew word stands in
a quoted line as a run like `Xp^s` or `KppB`: that run is not a reading
of the Hebrew, and it is not repeated per block. A line set in Hebrew
alone can drop out: two one-line cross-references here have no hOCR
line at all (M02374 and Q00500), and their blocks say so and name the
lines around the gap. Each line is located by the Latin around the
cite, or, for a one-line cross-reference, by the lines of the entries
before and after it. Each quoted line is copied by script from
`leafLines` (`admin/pipeline/patch/hocr.ts`); no line quoted here holds
a bidi mark or a backtick, and every hOCR fragment a note quotes is on
its leaf (checked by script). Where the hOCR reads the numeral as `L`
or `EL` (N00379, R00687's P000715), as a lower-case `i` (S01278,
S01508), or reads `I, II` as `i, n` (R00416, S01930), that is the OCR's
reading: the scan decides. Where the hOCR and the scan read disagree, a
second read is needed.

**The `ch.` rule (10-15).** A cite that reads `X N ch.` names the
`ch.` line print sets after `X N`, not `X N` itself. None of the 29
cites is followed by `ch.` in the entry as it stands (checked by
script). Note it on the `Read:` line if print shows one; that is a
withdraw, or a re-aim at the `ch.` line. In C1 the maintainer also
re-aimed two cites with no `ch.` at the `ch.` line because the citing
line is Aramaic (B01237 and N00106 → B01153). Here, of the 20 targets
only R00448 `צִיר I` has a `ch.` line after it (R00449 `צִיר, צִירָא`,
`ch. same.`, checked by script). Neither of its two citing entries is a
`ch.` entry: R00241 `צוּר II` is a b. h. verb and R00460 `צִירָן` the
Mishnah's noun (Bekh. VII, 3); both blocks name it. Five citing
entries are themselves `ch.` entries: Q01983 `פִּרְקָא, פִּי׳` (`ch.
same cross-road`, citing `פִּיקָא I`), T00329 `רְוַוח, רְוַח II, …`
(`ch. same open space, room`) and T00346 `רוּחָא` (`ch. same`), both
citing `רְוַוח I`, U01557 `שֵׁן, שִׁנָּא, שִׁי׳` (`ch. same`, citing
`פִּילָא I`) and U02092 `שְׁתֵי, שְׁתָא` (`ch. same`, citing `קִיסְטָא
I`); none of their four targets has a `ch.` line after it. Seven
targets are themselves `ch.` lines that carry their own I, cited by
nine blocks: R00506 `צְלֵי, צְלָא I`, Q00663 `פִּיל, פִּילָא I`,
S00402 `קוּמְצָא, קוֹ׳, קָמְצָא I`, T00327 `רְוַוח, רְוַח I` and
T00082 `רְבֵי, רְבָא I` (each `ch. same`), S01567 `קְנֵי, קְנָא I`
(`ch., v. infra.`) and S00584 `קוֹרָה I` (`ch., v. קוֹרָא II`). The
entry after each is numbered (R00507 II, Q00664 `פִּיל III, פִּילָא
II`, S00403 II, T00083 II, S00585 `קוֹרָה II`) or a b. h. entry
(T00328 `רֶוַוח, רֵוַח, רֵי׳`, S01568 `קני, קָנָה`), so none is the
unnumbered `ch.` line 10-15 names. Each of these blocks says which
case it is.

**Numeral on a later form.** A target's numeral can sit on a later
form of its head line than the one the cite spells: S00065 `קִבְלָא,
קִי׳ II, קוּבְלָא` carries II on the abbreviation `קִי׳`, and R00414
`צִיפּוֹרֵי, צִיפּוֹרִים, צִיפּוֹרִין, צִפּ׳ II` on its fourth form
`צִפּ׳`, while P000715's cite spells its third, `צִיפּוֹרִין`. **23 of
the 29 blocks** are of this shape; each says so under "The patch's
target", as an observation only. The other six: four targets carry the
numeral on their first form (R00448 `צִיר I`, cited twice; R00712
`צְפַר I`; S00584 `קוֹרָה I`), and the two cites of the family פִּילָא
spell Q00663's second form, `פִּילָא`, the one that carries the I.
Ruling `10-30 one numeral per line`
([`docs/decisions.md`](../../../../../../docs/decisions.md)) has
decided the question these notes raised in C1 and C2: a numeral print
sets anywhere on a head line is that line's numeral, so `X I` names the
line by its first form and the retarget's link is right as it stands.
No reform gives the cited form a numeral of its own, and none is
written for this batch; the read confirms the cite and its target only.

**Conventions in the blocks.** A headword is the entry's `display`
with its forms filled in; "numeral I on form 2" names the form that
carries it, which is often not the cite's spelling (the audit's
`match`). "The cite as Sefaria has it" is `expected_before` with tags
stripped, cut to about 60 characters before the cite and 40 after; the
whole entry is in the entry file. Where the cite runs over to the next
column on another leaf, the block links that leaf's scan too. IIIF's
`$n` is leaf `n − 1`, so leaf `L` links as `$L+1`
([`data/page-index/README.md`](../../../../../../data/page-index/README.md),
"Scan coordinates"; vol. 2 is `dictionaryoftarg02jastuoft`).

## Reading order

The checklist asks a batch to read first the members in a family a
homograph reform touched (the patches agent's `stale.py`), then the
rest. `stale.py` is not in the repository, and its counts (284
retargets, 63 touched) are over a population other than these, so that
split cannot be reproduced here. The blocks are in family order (the
family's consonants), then rid; within an entry, patch order. R00687's
two records fall under two families, צִיפּוֹרֵי and צִיפּוֹרִין, which
are next to each other in that order: P000714 is the last block of the
first, P000715 the only block of the second.

What the reviewed records do show: no member of the 20 families has a
reviewed `reform` patch (checked by script on all 75 entries whose
headword consonants match a family's; the same script finds C1's
P000290 and P000321 as a control). Three members carry other reviewed
patches, all cite retargets: R00399 `צִינְּתָא, צִנְּ׳ I`, the target
of P000711, carries P000708, which re-aims its own cite `צִנָּה III`
(another family) and was confirmed 2026-10-25; R00416 `צִיפּוֹרִים,
צִיפּוֹרִין`, a member of the family צִיפּוֹרִין, is the citing entry of
P000709; T00329 `רְוַוח, רְוַח II, …`, a member of the family רְוַוח,
is the citing entry of P000739. Three entries play two parts here:
T00329 cites `רְוַוח I` and is the entry Sefaria links for its own cite
(P000739) and for P000740; R00413 `צִיפּוֹרֵי, צִיפּוֹרִין, צִפּ׳ I` is
the target of P000709 and P000714 and the entry Sefaria links for
P000715; R00414 `צִיפּוֹרֵי, צִיפּוֹרִים, צִיפּוֹרִין, צִפּ׳ II` is the
target of P000715 and the entry Sefaria links for P000709 and P000714.
No block carries a reform note.

## The blocks

### Family פִּיטְמָא

#### Q00500 · P000696

- **Entry**: Q00500 `פְּטוּמָא`, vol. 2, 1154b, leaf 477.
  Entry file: [`data/entries/Q/Q00500.json`](../../../../../../data/entries/Q/Q00500.json)
- **Scan crop**: [scan 1154b · leaf 477](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$478/full/1400,/0/default.jpg)
- **hOCR line**: no hOCR line found (vol. 2 leaf 477, located by the
  lines around it)

  Line 75 is Q00499 (`dtjs, rata©, v. sub '-^b.`) and line 78 opens
  Q00503 (`TlDS m. (*i»B) discharge, exemption`). Between them print
  sets three one-line cross-references, Q00500 (this one), Q00501 and
  Q00502; the hOCR has one garbled line there (76, `naiE? or nains, v.
  n^`, with no numeral) and a line of vowel points (77), with empty
  space above line 76 where the first of the three would sit. No line
  can be given to Q00500, and none of them reads an `I`. The scan
  decides.
- **The cite as Sefaria has it**: `, v. פִּיטְמָא I`
  Sefaria links Q00629 `פִּיטְמָא II, פִּיטְמָה, פִּטְ׳` (numeral II on
  form 1, `פִּיטְמָא`).
- **The patch's target**: Q00628 `פִּיטְמָא, פִּטְ׳ I` (numeral I on
  form 2, `פִּטְ׳`).
  **The numeral sits on a later form**: form 2, `פִּטְ׳`, not the cite's
  `פִּיטְמָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:49ab0141`:

```text
<a class="refLink" href="/Jastrow,_פִּיטְמָא II.1" data-ref="Jastrow, פִּיטְמָא II 1"><span dir="rtl">פִּיטְמָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_פִּיטְמָא.1" data-ref="Jastrow, פִּיטְמָא 1"><span dir="rtl">פִּיטְמָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 117): the cite's
text reads "פִּיטְמָא I", Sefaria links Q00629 "פִּיטְמָא II, פִּיטְמָה,
פִּטְ׳", the only family member numbered I is Q00628 "פִּיטְמָא, פִּטְ׳
I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `פִּיטְמָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family פִּילָא

#### S00491 · P000722

- **Entry**: S00491 `קוּפָּא I`, vol. 2, 1337b, leaf 660.
  Entry file: [`data/entries/S/S00491.json`](../../../../../../data/entries/S/S00491.json)
- **Scan crop**: [scan 1337b · leaf 660](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$661/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 660, line 85 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  or needle, eye. Ber. 55b; B. Mets. 38b, v. xb'a I. Hull. 48b
  ```

  Sense `2)`'s Ber. and B. Mets. references; the numeral reads `I`: `B.
  Mets. 38b, v. xb'a I.`
- **The cite as Sefaria has it**: `…he head of a pin or needle, eye.
  Ber. 55ᵇ; B. Mets. 38ᵇ, v. פִּילָא I. Ḥull. 48ᵇ אי ק׳ לבר וכ׳ if the
  head is…`
  Sefaria links Q00666 `פִּילָא IV` (numeral IV on form 1, `פִּילָא`).
- **The patch's target**: Q00663 `פִּיל, פִּילָא I` (numeral I on form
  2, `פִּילָא`).
  The cite spells form 2, `פִּילָא`, the form that carries the numeral.
  The target is itself a `ch.` line that carries I (`ch. same; …
  ivory`); the entry after it, Q00664 `פִּיל III, פִּילָא II`, is not an
  unnumbered `ch.` line.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:c10c4964`:

```text
<a class="refLink" href="/Jastrow,_פִּילָא IV.1" data-ref="Jastrow, פִּילָא IV 1"><span dir="rtl">פִּילָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_פִּיל ².1" data-ref="Jastrow, פִּיל ² 1"><span dir="rtl">פִּילָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 145): the cite's
text reads "פִּילָא I", Sefaria links Q00666 "פִּילָא IV", the only
family member numbered I is Q00663 "פִּיל, פִּילָא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `פִּילָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### U01557 · P000768

- **Entry**: U01557 `שֵׁן, שִׁנָּא, שִׁי׳`, vol. 2, 1603b, leaf 926;
  continues into 1604a, leaf 927.
  Entry file: [`data/entries/U/U01557.json`](../../../../../../data/entries/U/U01557.json)
- **Scan crop**: [scan 1603b · leaf 926](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$927/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 926, lines 97–98 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  "jEJ, fet|tfj, '^ ch. same. Targ. O. Deut. XXXII, 24.
  Targ. Ex. XXI, 24. Targ. I Kings X, 22 (v. xb/Q I), lb. 18.
  ```

  Line 97 is the head (`'^ ch. same. Targ. O. Deut. XXXII, 24.`); line
  98 is the cite, the numeral read `I`: `(v. xb/Q I), lb. 18.`
- **The cite as Sefaria has it**: `…Deut. XXXII, 24. Targ. Ex. XXI, 24.
  Targ. I Kings X, 22 (v. פִּילָא I). Ib. 18. Targ. I Sam. XIV, 4; a.
  fr.—Y…`
  Sefaria links Q00666 `פִּילָא IV` (numeral IV on form 1, `פִּילָא`).
  The citing entry, U01557, is itself a `ch.` entry (`ch. same`); the
  cite has no `ch.` after it.
- **The patch's target**: Q00663 `פִּיל, פִּילָא I` (numeral I on form
  2, `פִּילָא`).
  The cite spells form 2, `פִּילָא`, the form that carries the numeral.
  The target is itself a `ch.` line that carries I (`ch. same; …
  ivory`); the entry after it, Q00664 `פִּיל III, פִּילָא II`, is not an
  unnumbered `ch.` line.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:dee95a2d`:

```text
<a class="refLink" href="/Jastrow,_פִּילָא IV.1" data-ref="Jastrow, פִּילָא IV 1"><span dir="rtl">פִּילָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_פִּיל ².1" data-ref="Jastrow, פִּיל ² 1"><span dir="rtl">פִּילָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 198): the cite's
text reads "פִּילָא I", Sefaria links Q00666 "פִּילָא IV", the only
family member numbered I is Q00663 "פִּיל, פִּילָא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `פִּילָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family פִּיקָא

#### P00089 · P000681

- **Entry**: P00089 `עָגַל`, vol. 2, 1041a, leaf 364.
  Entry file: [`data/entries/P/P00089.json`](../../../../../../data/entries/P/P00089.json)
- **Scan crop**: [scan 1041a · leaf 364](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$365/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 364, lines 35–36 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  VII, 4 npiZZ esn ifcysryB 13; Tosef. ib.VHI, 8 'SI &08
  (v. R. 8. to Ohol. 1. c), v. Xp^s I.— 2) to roll, v. supra.
  ```

  Line 35 is the Ohol. and Tosef. reference of the Hif.; line 36 is the
  cite, the numeral read `I`: `v. Xp^s I.— 2) to roll`.
- **The cite as Sefaria has it**: `…ef. ib. VIII, 8 שעִגְּלוּ וכ׳ (v. R.
  S. to Ohol. l. c.), v. פִּיקָא I.`
  Sefaria links Q00797 `פִּיקָא, פִּיקָה II` (numeral II on form 2,
  `פִּיקָה`).
- **The patch's target**: Q00796 `פִּיקָא, פִּיקָה I` (numeral I on form
  2, `פִּיקָה`).
  **The numeral sits on a later form**: form 2, `פִּיקָה`, not the
  cite's `פִּיקָא` (form 1); an observation only, see "Numeral on a
  later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:a5e5cee9`:

```text
<a class="refLink" href="/Jastrow,_פִּיקָא ².1" data-ref="Jastrow, פִּיקָא ² 1"><span dir="rtl">פִּיקָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_פִּיקָא.1" data-ref="Jastrow, פִּיקָא 1"><span dir="rtl">פִּיקָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 102): the cite's
text reads "פִּיקָא I", Sefaria links Q00797 "פִּיקָא, פִּיקָה II", the
only family member numbered I is Q00796 "פִּיקָא, פִּיקָה I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `פִּיקָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### Q01983 · P000703

- **Entry**: Q01983 `פִּרְקָא, פִּי׳`, vol. 2, 1240a, leaf 563.
  Entry file: [`data/entries/Q/Q01983.json`](../../../../../../data/entries/Q/Q01983.json)
- **Scan crop**: [scan 1240a · leaf 563](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$564/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 563, lines 35–36 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Y. Lev. VIII, 23, sq. lb. XIV, 14; a. e— Tosef. Neg. IV, 12
  neck, v. KppB I. — PL as ab. Y. Taan. II, 66a bot; Y. Meg.
  ```

  Line 35 is the Targ. Y. Lev. and Tosef. Neg. reference; line 36 is the
  cite, the numeral read `I`: `neck, v. KppB I.`
- **The cite as Sefaria has it**: `…III, 23, sq. Ib. XIV, 14; a.
  e.—Tosef. Neg. IV, 12 neck, v. פִּיקָא I.—Pl. as ab. Y. Taan. II, 66ᵃ
  bot.; Y. M…`
  Sefaria links Q00797 `פִּיקָא, פִּיקָה II` (numeral II on form 2,
  `פִּיקָה`).
  The citing entry, Q01983, is itself a `ch.` entry (`ch. same
  cross-road`); the cite has no `ch.` after it.
- **The patch's target**: Q00796 `פִּיקָא, פִּיקָה I` (numeral I on form
  2, `פִּיקָה`).
  **The numeral sits on a later form**: form 2, `פִּיקָה`, not the
  cite's `פִּיקָא` (form 1); an observation only, see "Numeral on a
  later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—3)]:1adbc39b`:

```text
<a class="refLink" href="/Jastrow,_פִּיקָא ².1" data-ref="Jastrow, פִּיקָא ² 1"><span dir="rtl">פִּיקָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_פִּיקָא.1" data-ref="Jastrow, פִּיקָא 1"><span dir="rtl">פִּיקָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 125): the cite's
text reads "פִּיקָא I", Sefaria links Q00797 "פִּיקָא, פִּיקָה II", the
only family member numbered I is Q00796 "פִּיקָא, פִּיקָה I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `פִּיקָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### S00097 · P000718

- **Entry**: S00097 `קֶבֶר`, vol. 2, 1312b, leaf 635; continues into
  1313a, leaf 636.
  Entry file: [`data/entries/S/S00097.json`](../../../../../../data/entries/S/S00097.json)
- **Scan crop**: [scan 1312b · leaf 635](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$636/full/1400,/0/default.jpg); the cite is in 1313a, [scan 1313a · leaf 636](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$637/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 636, lines 27–28 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  the laws of levitical cleanness connected with the open-
  ing of the womb do not apply, unless &c, v. Xp^E I ; Tosef.
  ```

  The entry runs over from 1312b (leaf 635) into 1313a. Line 27 is the
  Ohol. gloss (`the laws of levitical cleanness connected with the
  open-`); line 28 is the cite, the numeral read `I`: `unless &c, v.
  Xp^E I ;`.
- **The cite as Sefaria has it**: `…d with the opening of the womb do
  not apply, unless &c., v. פִּיקָא I; Tosef. ib. VIII, 8; a. fr.`
  Sefaria links Q00797 `פִּיקָא, פִּיקָה II` (numeral II on form 2,
  `פִּיקָה`).
- **The patch's target**: Q00796 `פִּיקָא, פִּיקָה I` (numeral I on form
  2, `פִּיקָה`).
  **The numeral sits on a later form**: form 2, `פִּיקָה`, not the
  cite's `פִּיקָא` (form 1); an observation only, see "Numeral on a
  later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:704c7734`:

```text
<a class="refLink" href="/Jastrow,_פִּיקָא ².1" data-ref="Jastrow, פִּיקָא ² 1"><span dir="rtl">פִּיקָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_פִּיקָא.1" data-ref="Jastrow, פִּיקָא 1"><span dir="rtl">פִּיקָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 140): the cite's
text reads "פִּיקָא I", Sefaria links Q00797 "פִּיקָא, פִּיקָה II", the
only family member numbered I is Q00796 "פִּיקָא, פִּיקָה I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `פִּיקָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family פֵּירוּכָא

#### Q00839 · P000698

- **Entry**: Q00839 `פֵּירוּכְיָיא, פֵּר׳`, vol. 2, 1170b, leaf 493.
  Entry file: [`data/entries/Q/Q00839.json`](../../../../../../data/entries/Q/Q00839.json)
- **Scan crop**: [scan 1170b · leaf 493](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$494/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 493, line 85 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  fcf^OITB, 'lD f. 1) = K3^B I. Targ. Y. Lev. II, 16,
  ```

  The head line holds the first cite, the numeral read `I`: `1) = K3^B
  I. Targ. Y. Lev. II, 16,`.
- **The cite as Sefaria has it**: `= פֵּירוּכָא I. Targ. Y. Lev. II, 16,
  v. פֵּירוּכָא I.`
  Sefaria links Q00838 `פֵּירוּכָא, פֵּר׳ II` (numeral II on form 2,
  `פֵּר׳`).
  Sense `1)` holds the cite twice (`= פֵּירוּכָא I.` and `v. פֵּירוּכָא
  I.`): this record is the first, P000699 the second.
- **The patch's target**: Q00837 `פֵּירוּכָא, פֵּר׳ I` (numeral I on
  form 2, `פֵּר׳`).
  **The numeral sits on a later form**: form 2, `פֵּר׳`, not the cite's
  `פֵּירוּכָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:eb2733b0`:

```text
<a class="refLink" href="/Jastrow,_פֵּירוּכָא ².1" data-ref="Jastrow, פֵּירוּכָא ² 1"><span dir="rtl">פֵּירוּכָא</span> I</a>. 
→
<a class="refLink" href="/Jastrow,_פֵּירוּכָא.1" data-ref="Jastrow, פֵּירוּכָא 1"><span dir="rtl">פֵּירוּכָא</span> I</a>. 
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 119): the cite's
text reads "פֵּירוּכָא I", Sefaria links Q00838 "פֵּירוּכָא, פֵּר׳ II",
the only family member numbered I is Q00837 "פֵּירוּכָא, פֵּר׳ I". Its
`find` and `replace` end with the period and space after the cite (`.
`), which makes the first cite the only match. It applies first; P000699
applies on the definition this patch leaves.

</details>

**The maintainer's read**:

- [ ] confirm — print reads `פֵּירוּכָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### Q00839 · P000699

- **Entry**: Q00839 `פֵּירוּכְיָיא, פֵּר׳`, vol. 2, 1170b, leaf 493.
  Entry file: [`data/entries/Q/Q00839.json`](../../../../../../data/entries/Q/Q00839.json)
- **Scan crop**: [scan 1170b · leaf 493](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$494/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 493, lines 85–86 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  fcf^OITB, 'lD f. 1) = K3^B I. Targ. Y. Lev. II, 16,
  v. SOWi's I.— 2) (=h. hWo) dry ears.— PI. y*3WB, "is.
  ```

  Line 85 is the head and the first cite (P000698); line 86 is this
  cite, the numeral read `I`: `v. SOWi's I.— 2)`.
- **The cite as Sefaria has it**: `= פֵּירוּכָא I. Targ. Y. Lev. II, 16,
  v. פֵּירוּכָא I.`
  Sefaria links Q00838 `פֵּירוּכָא, פֵּר׳ II` (numeral II on form 2,
  `פֵּר׳`).
  The second of the two cites in sense `1)`; P000698 is the first.
- **The patch's target**: Q00837 `פֵּירוּכָא, פֵּר׳ I` (numeral I on
  form 2, `פֵּר׳`).
  **The numeral sits on a later form**: form 2, `פֵּר׳`, not the cite's
  `פֵּירוּכָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:0f7a6670`:

```text
<a class="refLink" href="/Jastrow,_פֵּירוּכָא ².1" data-ref="Jastrow, פֵּירוּכָא ² 1"><span dir="rtl">פֵּירוּכָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_פֵּירוּכָא.1" data-ref="Jastrow, פֵּירוּכָא 1"><span dir="rtl">פֵּירוּכָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 120): the cite's
text reads "פֵּירוּכָא I", Sefaria links Q00838 "פֵּירוּכָא, פֵּר׳ II",
the only family member numbered I is Q00837 "פֵּירוּכָא, פֵּר׳ I". It
applies after P000698, on the definition that patch leaves.

</details>

**The maintainer's read**:

- [ ] confirm — print reads `פֵּירוּכָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family פִּסְיוֹנָא

#### Q01284 · P000700

- **Entry**: Q01284 `פִּסְיָינְתָּא`, vol. 2, 1195a, leaf 518.
  Entry file: [`data/entries/Q/Q01284.json`](../../../../../../data/entries/Q/Q01284.json)
- **Scan crop**: [scan 1195a · leaf 518](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$519/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 518, line 21 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  tf?lDn"C9, v. xsros II.
  ```

  Located by position: line 20 ends Q01283 (`Mekh. Bo, s. 11; Yalk. ib.
  200`), and line 23 is Q01285 (`fctlPD^DD, v. tmectsa.`) after a line
  of vowel points. The numeral reads `II`: `v. xsros II.`
- **The cite as Sefaria has it**: `, v. פִּסְיוֹנָא II`
  Sefaria links Q01279 `פִּסְיוֹן, פִּסְיוֹנָא I` (numeral I on form 2,
  `פִּסְיוֹנָא`).
- **The patch's target**: Q01280 `פִּסְיוֹנָא, פִּיסְ׳ II` (numeral II
  on form 2, `פִּיסְ׳`).
  **The numeral sits on a later form**: form 2, `פִּיסְ׳`, not the
  cite's `פִּסְיוֹנָא` (form 1); an observation only, see "Numeral on a
  later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:c0e67c73`:

```text
<a class="refLink" href="/Jastrow,_פִּסְיוֹן.1" data-ref="Jastrow, פִּסְיוֹן 1"><span dir="rtl">פִּסְיוֹנָא</span> II</a>
→
<a class="refLink" href="/Jastrow,_פִּסְיוֹנָא.1" data-ref="Jastrow, פִּסְיוֹנָא 1"><span dir="rtl">פִּסְיוֹנָא</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 122): the cite's
text reads "פִּסְיוֹנָא II", Sefaria links Q01279 "פִּסְיוֹן,
פִּסְיוֹנָא I", the only family member numbered II is Q01280
"פִּסְיוֹנָא, פִּיסְ׳ II".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `פִּסְיוֹנָא II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family צִינְּתָא

#### R00488 · P000711

- **Entry**: R00488 `צְלוֹ, צְלוֹתָא, צְלוּ׳`, vol. 2, 1282b, leaf 605.
  Entry file: [`data/entries/R/R00488.json`](../../../../../../data/entries/R/R00488.json)
- **Scan crop**: [scan 1282b · leaf 605](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$606/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 605, line 67 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  this is no prayer (need not be prayed for), v. KHpX I.
  ```

  The Y. Snh. X, 29ᶜ gloss; the numeral reads `I`: `v. KHpX I.`
- **The cite as Sefaria has it**: `…. לית הדא צ׳ this is no prayer (need
  not be prayed for), v. צִינְּתָא I. Ib. הא צ׳ … צְלוֹתָךְ this is a
  prayer…`
  Sefaria links R00400 `צִינְּתָא, צִנְּ׳ II` (numeral II on form 2,
  `צִנְּ׳`).
- **The patch's target**: R00399 `צִינְּתָא, צִנְּ׳ I` (numeral I on
  form 2, `צִנְּ׳`).
  **The numeral sits on a later form**: form 2, `צִנְּ׳`, not the cite's
  `צִינְּתָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:ed6bbe5b`:

```text
<a class="refLink" href="/Jastrow,_צִינְּתָא ².1" data-ref="Jastrow, צִינְּתָא ² 1"><span dir="rtl">צִינְּתָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_צִינְּתָא.1" data-ref="Jastrow, צִינְּתָא 1"><span dir="rtl">צִינְּתָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 133): the cite's
text reads "צִינְּתָא I", Sefaria links R00400 "צִינְּתָא, צִנְּ׳ II",
the only family member numbered I is R00399 "צִינְּתָא, צִנְּ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `צִינְּתָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family צִיפּוֹרֵי

#### R00416 · P000709

- **Entry**: R00416 `צִיפּוֹרִים, צִיפּוֹרִין`, vol. 2, 1279a, leaf 602.
  Entry file: [`data/entries/R/R00416.json`](../../../../../../data/entries/R/R00416.json)
- **Scan crop**: [scan 1279a · leaf 602](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$603/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 602, line 29 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  D^T®^, TTtBHS, v. -nisn? i, n.
  ```

  Located by position: line 28 ends R00415 (`Sabb.IV, end, 7a: a. fr.`)
  and line 30 is R00417 (`f. OnisiXlI) of Sepphoris.`). The cite reads
  `v. -nisn? i, n.`, the numeral as a lower-case `i` and the `II` after
  it as `n`. No `I` is read.
- **The cite as Sefaria has it**: `, v. צִיפּוֹרֵי I, II.`
  Sefaria links R00414 `צִיפּוֹרֵי, צִיפּוֹרִים, צִיפּוֹרִין, צִפּ׳ II`
  (numeral II on form 4, `צִפּ׳`).
  The cite reads `v. צִיפּוֹרֵי I, II`: the link covers `צִיפּוֹרֵי I`
  only, and the `, II` after it is plain text.
- **The patch's target**: R00413 `צִיפּוֹרֵי, צִיפּוֹרִין, צִפּ׳ I`
  (numeral I on form 3, `צִפּ׳`).
  **The numeral sits on a later form**: form 3, `צִפּ׳`, not the cite's
  `צִיפּוֹרֵי` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:7491f9a8`:

```text
<a class="refLink" href="/Jastrow,_צִיפּוֹרֵי ².1" data-ref="Jastrow, צִיפּוֹרֵי ² 1"><span dir="rtl">צִיפּוֹרֵי</span> I</a>
→
<a class="refLink" href="/Jastrow,_צִיפּוֹרֵי.1" data-ref="Jastrow, צִיפּוֹרֵי 1"><span dir="rtl">צִיפּוֹרֵי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 131): the cite's
text reads "צִיפּוֹרֵי I", Sefaria links R00414 "צִיפּוֹרֵי,
צִיפּוֹרִים, צִיפּוֹרִין, צִפּ׳ II", the only family member numbered I
is R00413 "צִיפּוֹרֵי, צִיפּוֹרִין, צִפּ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `צִיפּוֹרֵי I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### R00687 · P000714

- **Entry**: R00687 `צִפּוֹרֶן, צִיפּ׳`, vol. 2, 1296a, leaf 619;
  continues into 1296b, same leaf.
  Entry file: [`data/entries/R/R00687.json`](../../../../../../data/entries/R/R00687.json)
- **Scan crop**: [scan 1296a · leaf 619](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$620/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 619, lines 53–54 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  from the body is) like getting a nail out of the gullet, v.
  •n^X I; a.fr.— Gen.R. s.45 '31 i6l nidK b® 'JJ'Ttt"^ rather
  ```

  Line 53 is the Koh. R. gloss (`like getting a nail out of the gullet,
  v.`); line 54 is the cite, the numeral read `I`: `•n^X I; a.fr.`
- **The cite as Sefaria has it**: `…from the body is) like getting a
  nail out of the gullet, v. צִיפּוֹרֵי I; a. fr.—Gen. R. s. 45
  צִיפָּרְנָן של אב…`
  Sefaria links R00414 `צִיפּוֹרֵי, צִיפּוֹרִים, צִיפּוֹרִין, צִפּ׳ II`
  (numeral II on form 4, `צִפּ׳`).
  The target's own entry cites the same passage: R00413 ends `Koh. R. to
  VI, 7 כציפורן, v. צִפּוֹרֶן.` (its entry file).
  R00687 holds two records of this batch, in two families: P000714
  (`צִיפּוֹרֵי I`, family צִיפּוֹרֵי) and P000715 (`צִיפּוֹרִין II`,
  family צִיפּוֹרִין); this is the first, in sense `1)`. They are
  independent: they sit in different senses (`1)` and `—3)`), and each
  applies on its own.
- **The patch's target**: R00413 `צִיפּוֹרֵי, צִיפּוֹרִין, צִפּ׳ I`
  (numeral I on form 3, `צִפּ׳`).
  **The numeral sits on a later form**: form 3, `צִפּ׳`, not the cite's
  `צִיפּוֹרֵי` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:0e39730e`:

```text
<a class="refLink" href="/Jastrow,_צִיפּוֹרֵי ².1" data-ref="Jastrow, צִיפּוֹרֵי ² 1"><span dir="rtl">צִיפּוֹרֵי</span> I</a>
→
<a class="refLink" href="/Jastrow,_צִיפּוֹרֵי.1" data-ref="Jastrow, צִיפּוֹרֵי 1"><span dir="rtl">צִיפּוֹרֵי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 136): the cite's
text reads "צִיפּוֹרֵי I", Sefaria links R00414 "צִיפּוֹרֵי,
צִיפּוֹרִים, צִיפּוֹרִין, צִפּ׳ II", the only family member numbered I
is R00413 "צִיפּוֹרֵי, צִיפּוֹרִין, צִפּ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `צִיפּוֹרֵי I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family צִיפּוֹרִין

#### R00687 · P000715

- **Entry**: R00687 `צִפּוֹרֶן, צִיפּ׳`, vol. 2, 1296a, leaf 619;
  continues into 1296b, same leaf.
  Entry file: [`data/entries/R/R00687.json`](../../../../../../data/entries/R/R00687.json)
- **Scan crop**: [scan 1296a · leaf 619](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$620/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 619, lines 68–69 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  atus), a spice. Ker. 6a; Y. YomaIV,41d; a. e.; v. nVn'J.—
  [Ex. R. s. 3, a. e. "plBi2, v. f+fafif EL]
  ```

  Line 68 is sense `3)`'s references; line 69 is the bracketed cite, the
  numeral read as `EL`: `v. f+fafif EL]`. No `II` is read.
- **The cite as Sefaria has it**: `…IV, 41ᵈ; a. e.; v. שְׁחֵלֶת.—[Ex. R.
  s. 3, a. e. ציפורן, v. צִיפּוֹרִין II.]`
  Sefaria links R00413 `צִיפּוֹרֵי, צִיפּוֹרִין, צִפּ׳ I` (numeral I on
  form 3, `צִפּ׳`).
  The target's own entry ends with the same reference: R00414 `a.
  fr.—Ex. R. s. 3, a. e. ציפורן (corr. acc.).` (its entry file).
  Sefaria's link and the target swap with P000714's: P000714 moves its
  cite from R00414 to R00413, this one moves its cite from R00413 to
  R00414.
  R00687 holds two records of this batch, in two families: P000714
  (`צִיפּוֹרֵי I`, family צִיפּוֹרֵי) and P000715 (`צִיפּוֹרִין II`,
  family צִיפּוֹרִין); this is the second, in sense `—3)`. They are
  independent: they sit in different senses (`1)` and `—3)`), and each
  applies on its own.
- **The patch's target**: R00414 `צִיפּוֹרֵי, צִיפּוֹרִים, צִיפּוֹרִין,
  צִפּ׳ II` (numeral II on form 4, `צִפּ׳`).
  **The numeral sits on a later form**: form 4, `צִפּ׳`, not the cite's
  `צִיפּוֹרִין` (form 3); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—3)]:8cf29185`:

```text
<a class="refLink" href="/Jastrow,_צִיפּוֹרֵי.1" data-ref="Jastrow, צִיפּוֹרֵי 1"><span dir="rtl">צִיפּוֹרִין</span> II</a>
→
<a class="refLink" href="/Jastrow,_צִיפּוֹרֵי ².1" data-ref="Jastrow, צִיפּוֹרֵי ² 1"><span dir="rtl">צִיפּוֹרִין</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 137): the cite's
text reads "צִיפּוֹרִין II", Sefaria links R00413 "צִיפּוֹרֵי,
צִיפּוֹרִין, צִפּ׳ I", the only family member numbered II is R00414
"צִיפּוֹרֵי, צִיפּוֹרִים, צִיפּוֹרִין, צִפּ׳ II".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `צִיפּוֹרִין II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family צִיר

#### R00241 · P000707

- **Entry**: R00241 `צוּר II`, vol. 2, 1270b, leaf 593.
  Entry file: [`data/entries/R/R00241.json`](../../../../../../data/entries/R/R00241.json)
- **Scan crop**: [scan 1270b · leaf 593](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$594/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 593, line 88 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  [4) (cmp. 11T) to press, v. -PX I.]
  ```

  The bracketed sense `4)`; the numeral reads `I`: `to press, v. -PX
  I.]`
- **The cite as Sefaria has it**: `(cmp. זוּר) to press, v. צִיר I.]`
  Sefaria links R00452 `צִיר IV` (numeral IV on form 1, `צִיר`).
- **The patch's target**: R00448 `צִיר I` (numeral I on form 1, `צִיר`).
  **A `ch.` line follows the target** (10-15): R00449 `צִיר, צִירָא`
  (`ch. same.`). The citing entry, R00241 `צוּר II`, is a b. h. verb,
  not a `ch.` entry; the cite is in its bracketed sense `4)`. The cite
  reads `צִיר I` with no `ch.` after it, so 10-15 does not point it
  there; it is named only so the read can rule it out.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[4)]:e16b38f0`:

```text
<a class="refLink" href="/Jastrow,_צִיר IV.1" data-ref="Jastrow, צִיר IV 1"><span dir="rtl">צִיר</span> I</a>
→
<a class="refLink" href="/Jastrow,_צִיר I.1" data-ref="Jastrow, צִיר I 1"><span dir="rtl">צִיר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 129): the cite's
text reads "צִיר I", Sefaria links R00452 "צִיר IV", the only family
member numbered I is R00448 "צִיר I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `צִיר I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### R00460 · P000710

- **Entry**: R00460 `צִירָן`, vol. 2, 1281a, leaf 604; continues into
  1281b, same leaf.
  Entry file: [`data/entries/R/R00460.json`](../../../../../../data/entries/R/R00460.json)
- **Scan crop**: [scan 1281a · leaf 604](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$605/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 604, line 53 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  "FpS m. (denom. of "PS I) one whose eyes discharge a
  ```

  The head line; the numeral reads `I`: `(denom. of "PS I)`.
- **The cite as Sefaria has it**: `(denom. of צִיר I) one whose eyes
  discharge a briny liqui…`
  Sefaria links R00452 `צִיר IV` (numeral IV on form 1, `צִיר`).
- **The patch's target**: R00448 `צִיר I` (numeral I on form 1, `צִיר`).
  **A `ch.` line follows the target** (10-15): R00449 `צִיר, צִירָא`
  (`ch. same.`). The citing entry, R00460 `צִירָן`, is the Mishnah's
  noun (Bekh. VII, 3), not a `ch.` entry. The cite reads `צִיר I` with
  no `ch.` after it, so 10-15 does not point it there; it is named only
  so the read can rule it out.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:0dd64ae5`:

```text
<a class="refLink" href="/Jastrow,_צִיר IV.1" data-ref="Jastrow, צִיר IV 1"><span dir="rtl">צִיר</span> I</a>
→
<a class="refLink" href="/Jastrow,_צִיר I.1" data-ref="Jastrow, צִיר I 1"><span dir="rtl">צִיר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 132): the cite's
text reads "צִיר I", Sefaria links R00452 "צִיר IV", the only family
member numbered I is R00448 "צִיר I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `צִיר I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family צְלֵי

#### N00379 · P000650

- **Entry**: N00379 `נוּן, נוּנָא`, vol. 2, 888a, leaf 211.
  Entry file: [`data/entries/N/N00379.json`](../../../../../../data/entries/N/N00379.json)
- **Scan crop**: [scan 888a · leaf 211](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$212/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 211, line 45 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  •W Targ. Deut. IV, 18 ; a. fr.— Y. Naz. IX, 57d,v. ^bx L—
  ```

  Line 45 holds the plural's Targ. Deut. reference and the cite, the
  numeral read as `L` run into the dash after it: `57d,v. ^bx L—`. No
  `I` is read.
- **The cite as Sefaria has it**: `…יָּיה, נוּנֵי Targ. Deut. IV, 18; a.
  fr.—Y. Naz. IX, 57ᵈ, v. צְלֵי I.—Y. Ned. IV, beg. 39ᶜ, v. חל; a. fr.`
  Sefaria links R00507 `צְלֵי, צְלָא II` (numeral II on form 2,
  `צְלָא`).
- **The patch's target**: R00506 `צְלֵי, צְלָא I` (numeral I on form 2,
  `צְלָא`).
  **The numeral sits on a later form**: form 2, `צְלָא`, not the cite's
  `צְלֵי` (form 1); an observation only, see "Numeral on a later form"
  above.
  The target is itself a `ch.` line that carries I (`ch. same`); the
  entry after it, R00507 `צְלֵי, צְלָא II`, is not an unnumbered `ch.`
  line.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:3715cb1c`:

```text
<a class="refLink" href="/Jastrow,_צְלֵי ².1" data-ref="Jastrow, צְלֵי ² 1"><span dir="rtl">צְלֵי</span> I</a>
→
<a class="refLink" href="/Jastrow,_צְלֵי.1" data-ref="Jastrow, צְלֵי 1"><span dir="rtl">צְלֵי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 70): the cite's
text reads "צְלֵי I", Sefaria links R00507 "צְלֵי, צְלָא II", the only
family member numbered I is R00506 "צְלֵי, צְלָא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `צְלֵי I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family צְפַר

#### R00681 · P000713

- **Entry**: R00681 `צִפּוֹר, צִיפּ׳`, vol. 2, 1295b, leaf 618;
  continues into 1296a, leaf 619.
  Entry file: [`data/entries/R/R00681.json`](../../../../../../data/entries/R/R00681.json)
- **Scan crop**: [scan 1295b · leaf 618](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$619/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 618, line 105 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  "fte'I, 'B"^ c. (b. h. ; v. nss I) 1) bird. Ab. Zar. IU, 1
  ```

  The head line, at the foot of 1295b; the numeral reads `I`: `(b. h. ;
  v. nss I) 1) bird.`
- **The cite as Sefaria has it**: `c. (b. h.; v. צְפַר I)`
  Sefaria links R00715 `צְפַר IV, צַפְרָא` (numeral IV on form 1,
  `צְפַר`).
- **The patch's target**: R00712 `צְפַר I` (numeral I on form 1,
  `צְפַר`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:5e655c68`:

```text
<a class="refLink" href="/Jastrow,_צְפַר IV.1" data-ref="Jastrow, צְפַר IV 1"><span dir="rtl">צְפַר</span> I</a>
→
<a class="refLink" href="/Jastrow,_צְפַר I.1" data-ref="Jastrow, צְפַר I 1"><span dir="rtl">צְפַר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 135): the cite's
text reads "צְפַר I", Sefaria links R00715 "צְפַר IV, צַפְרָא", the only
family member numbered I is R00712 "צְפַר I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `צְפַר I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family קִבְלָא

#### M02374 · P000641

- **Entry**: M02374 `מִקְּבֵיל, מַקְבֵּיל`, vol. 2, 829a, leaf 152.
  Entry file: [`data/entries/M/M02374.json`](../../../../../../data/entries/M/M02374.json)
- **Scan crop**: [scan 829a · leaf 152](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$153/full/1400,/0/default.jpg)
- **hOCR line**: no hOCR line found (vol. 2 leaf 152, located by the
  lines around it)

  Line 7 ends M02373 (`Lag. "paipa). Targ. Is. XLIV, 12 (ed. Wil.
  paipa).`) and line 8 opens M02375 (`iTl'D'SpD f. pi. (a jocular denom.
  of nbsp, adopted`). Print's one-line M02374 sits between them, where
  the hOCR sets no line: the boxes of lines 7 and 8 leave about two
  lines' height empty. The scan decides.
- **The cite as Sefaria has it**: `, v. קִבְלָא II`
  Sefaria links S00066 `קִבְלָא, קִי׳ III` (numeral III on form 2,
  `קִי׳`).
- **The patch's target**: S00065 `קִבְלָא, קִי׳ II, קוּבְלָא` (numeral
  II on form 2, `קִי׳`).
  **The numeral sits on a later form**: form 2, `קִי׳`, not the cite's
  `קִבְלָא` (form 1); an observation only, see "Numeral on a later form"
  above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:e056d5ee`:

```text
<a class="refLink" href="/Jastrow,_קִבְלָא ².1" data-ref="Jastrow, קִבְלָא ² 1"><span dir="rtl">קִבְלָא</span> II</a>
→
<a class="refLink" href="/Jastrow,_קִבְלָא.1" data-ref="Jastrow, קִבְלָא 1"><span dir="rtl">קִבְלָא</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 60): the cite's
text reads "קִבְלָא II", Sefaria links S00066 "קִבְלָא, קִי׳ III", the
only family member numbered II is S00065 "קִבְלָא, קִי׳ II, קוּבְלָא".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `קִבְלָא II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### S00070 · P000717

- **Entry**: S00070 `קַבָּלָה I`, vol. 2, 1310a, leaf 633.
  Entry file: [`data/entries/S/S00070.json`](../../../../../../data/entries/S/S00070.json)
- **Scan crop**: [scan 1310a · leaf 633](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$634/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 633, line 43 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  book?; Tanh. Huck. 6; a. fr.— [Ber.62a, v. xb3p II.]— [In
  ```

  The numeral reads `II`: `[Ber.62a, v. xb3p II.]`
- **The cite as Sefaria has it**: `…om a post-Mosaic book?; Tanḥ. Ḥuck.
  6; a. fr.—[Ber. 62ᵃ, v. קִבְלָא II.]—[In later Hebrew ק׳ Kabbalah,
  mystic …`
  Sefaria links S00066 `קִבְלָא, קִי׳ III` (numeral III on form 2,
  `קִי׳`).
- **The patch's target**: S00065 `קִבְלָא, קִי׳ II, קוּבְלָא` (numeral
  II on form 2, `קִי׳`).
  **The numeral sits on a later form**: form 2, `קִי׳`, not the cite's
  `קִבְלָא` (form 1); an observation only, see "Numeral on a later form"
  above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:cdeb0c02`:

```text
<a class="refLink" href="/Jastrow,_קִבְלָא ².1" data-ref="Jastrow, קִבְלָא ² 1"><span dir="rtl">קִבְלָא</span> II</a>
→
<a class="refLink" href="/Jastrow,_קִבְלָא.1" data-ref="Jastrow, קִבְלָא 1"><span dir="rtl">קִבְלָא</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 139): the cite's
text reads "קִבְלָא II", Sefaria links S00066 "קִבְלָא, קִי׳ III", the
only family member numbered II is S00065 "קִבְלָא, קִי׳ II, קוּבְלָא".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `קִבְלָא II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### S00231 · P000720

- **Entry**: S00231 `קוּבְלָא`, vol. 2, 1323b, leaf 646.
  Entry file: [`data/entries/S/S00231.json`](../../../../../../data/entries/S/S00231.json)
- **Scan crop**: [scan 1323b · leaf 646](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$647/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 646, line 96 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  ablllp, v. steal? II.
  ```

  Located by position: line 95 is S00230 (`J<W2p,Y. rasp.`) and line 97
  is S00232 (`D^znp, D^bznp, v. w^a.`). The numeral reads `II`: `v.
  steal? II.`
- **The cite as Sefaria has it**: `, v. קִבְלָא II`
  Sefaria links S00066 `קִבְלָא, קִי׳ III` (numeral III on form 2,
  `קִי׳`).
- **The patch's target**: S00065 `קִבְלָא, קִי׳ II, קוּבְלָא` (numeral
  II on form 2, `קִי׳`).
  **The numeral sits on a later form**: form 2, `קִי׳`, not the cite's
  `קִבְלָא` (form 1); an observation only, see "Numeral on a later form"
  above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:e056d5ee`:

```text
<a class="refLink" href="/Jastrow,_קִבְלָא ².1" data-ref="Jastrow, קִבְלָא ² 1"><span dir="rtl">קִבְלָא</span> II</a>
→
<a class="refLink" href="/Jastrow,_קִבְלָא.1" data-ref="Jastrow, קִבְלָא 1"><span dir="rtl">קִבְלָא</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 142): the cite's
text reads "קִבְלָא II", Sefaria links S00066 "קִבְלָא, קִי׳ III", the
only family member numbered II is S00065 "קִבְלָא, קִי׳ II, קוּבְלָא".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `קִבְלָא II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family קוּמְצָא

#### S01486 · P000729

- **Entry**: S01486 `קָמְצָא`, vol. 2, 1386b, leaf 709.
  Entry file: [`data/entries/S/S01486.json`](../../../../../../data/entries/S/S01486.json)
- **Scan crop**: [scan 1386b · leaf 709](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$710/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 709, line 82 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  NHEp, v. asaip I, II.
  ```

  Located by position: line 81 is S01485 (`Y 2p> v. yaip.`) and line 83
  is S01487's head (`fc^Qp I c. 1)`). The numeral reads `I`: `v. asaip
  I, II.`
- **The cite as Sefaria has it**: `, v. קוּמְצָא I, II.`
  Sefaria links S00403 `קוּמְצָא, קָמְצָא II` (numeral II on form 2,
  `קָמְצָא`).
  The cite reads `v. קוּמְצָא I, II`: the link covers `קוּמְצָא I` only,
  and the `, II` after it is plain text.
- **The patch's target**: S00402 `קוּמְצָא, קוֹ׳, קָמְצָא I` (numeral I
  on form 3, `קָמְצָא`).
  **The numeral sits on a later form**: form 3, `קָמְצָא`, not the
  cite's `קוּמְצָא` (form 1); an observation only, see "Numeral on a
  later form" above.
  The target is itself a `ch.` line that carries I (`ch. same`); the
  entry after it, S00403 `קוּמְצָא, קָמְצָא II`, is not an unnumbered
  `ch.` line.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:d0d56240`:

```text
<a class="refLink" href="/Jastrow,_קוּמְצָא ².1" data-ref="Jastrow, קוּמְצָא ² 1"><span dir="rtl">קוּמְצָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_קוּמְצָא.1" data-ref="Jastrow, קוּמְצָא 1"><span dir="rtl">קוּמְצָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 157): the cite's
text reads "קוּמְצָא I", Sefaria links S00403 "קוּמְצָא, קָמְצָא II",
the only family member numbered I is S00402 "קוּמְצָא, קוֹ׳, קָמְצָא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `קוּמְצָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family קוֹרָה

#### S02080 · P000734

- **Entry**: S02080 `קָרִיר II, קְרִירָא, קְרִירְתָּא`, vol. 2, 1421a,
  leaf 744; continues into 1421b, same leaf.
  Entry file: [`data/entries/S/S02080.json`](../../../../../../data/entries/S/S02080.json)
- **Scan crop**: [scan 1421a · leaf 744](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$745/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 744, lines 50–51 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Hull. 46b, v. "ana L Sabb.55», v. trtjE; a.fr. — 2) (cmp.
  mip I) satisfaction, pleasure. Gen. R. s. 47 . . . ""'pan KP
  ```

  Line 50 ends with sense `2)`'s opening (`— 2) (cmp.`); line 51 is the
  cite, the numeral read `I`: `mip I) satisfaction, pleasure.`
- **The cite as Sefaria has it**: `(cmp. קוֹרָה I) satisfaction,
  pleasure. Gen. R. s. 47 …`
  Sefaria links S00587 `קוֹרָה IV` (numeral IV on form 1, `קוֹרָה`).
- **The patch's target**: S00584 `קוֹרָה I` (numeral I on form 1,
  `קוֹרָה`).
  The target is itself a `ch.` line that carries I (`ch., v. קוֹרָא
  II`); the entry after it, S00585 `קוֹרָה II`, is not an unnumbered
  `ch.` line.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:07d00e46`:

```text
<a class="refLink" href="/Jastrow,_קוֹרָה IV.1" data-ref="Jastrow, קוֹרָה IV 1"><span dir="rtl">קוֹרָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_קוֹרָה I.1" data-ref="Jastrow, קוֹרָה I 1"><span dir="rtl">קוֹרָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 162): the cite's
text reads "קוֹרָה I", Sefaria links S00587 "קוֹרָה IV", the only family
member numbered I is S00584 "קוֹרָה I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `קוֹרָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family קִיסְטָא

#### U02092 · P000776

- **Entry**: U02092 `שְׁתֵי, שְׁתָא`, vol. 2, 1637b, leaf 960.
  Entry file: [`data/entries/U/U02092.json`](../../../../../../data/entries/U/U02092.json)
- **Scan crop**: [scan 1637b · leaf 960](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$961/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 960, line 77 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  thou drankest ten &c, v. XEO^p I. Yeb. 65b X30 XT OTR
  ```

  The numeral reads `I`: `&c, v. XEO^p I.`
- **The cite as Sefaria has it**: `… Lev. R. s. 12 עשרה … אִישְׁתֵּית
  thou drankest ten &c., v. קִיסְטָא I. Yeb. 65ᵇ אִישְׁתִּיָא סמא וכ׳
  she dran…`
  Sefaria links S01065 `קִיסְטָא II, קִיסְטָה` (numeral II on form 1,
  `קִיסְטָא`).
  The citing entry, U02092, is itself a `ch.` entry (`ch. same`); the
  cite has no `ch.` after it.
- **The patch's target**: S01064 `קִיסְטְ, קִיסְטָא, קִסְ׳ I` (numeral I
  on form 3, `קִסְ׳`).
  **The numeral sits on a later form**: form 3, `קִסְ׳`, not the cite's
  `קִיסְטָא` (form 2); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:0414b4cc`:

```text
<a class="refLink" href="/Jastrow,_קִיסְטָא II.1" data-ref="Jastrow, קִיסְטָא II 1"><span dir="rtl">קִיסְטָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_קִיסְטְ.1" data-ref="Jastrow, קִיסְטְ 1"><span dir="rtl">קִיסְטָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 207): the cite's
text reads "קִיסְטָא I", Sefaria links S01065 "קִיסְטָא II, קִיסְטָה",
the only family member numbered I is S01064 "קִיסְטְ, קִיסְטָא, קִסְ׳
I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `קִיסְטָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family קְלַסְטֵיר

#### S01278 · P000725

- **Entry**: S01278 `קלוסטור, קלוסטר`, vol. 2, 1373a, leaf 696.
  Entry file: [`data/entries/S/S01278.json`](../../../../../../data/entries/S/S01278.json)
- **Scan crop**: [scan 1373a · leaf 696](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$697/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 696, line 12 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  TitibTbp, -rcabibp, v. -«o^ i.
  ```

  Located by position: line 11 is S01277 (`bT3j?, NOlbp, v. sub 'rp.`)
  and line 13 is S01279 (`bTttSblbp, v. vr&ft*.`). The cite reads
  `v. -«o^ i.`, the numeral as a lower-case `i`. No `I` is read.
- **The cite as Sefaria has it**: `, v. קְלַסְטֵיר I`
  Sefaria links S01385 `קְלַסְטֵיר, קְלַסְטָר II, קְלַסְתָּר` (numeral
  II on form 2, `קְלַסְטָר`).
- **The patch's target**: S01384 `קְלַסְטֵיר, קְלַסְטָר I` (numeral I on
  form 2, `קְלַסְטָר`).
  **The numeral sits on a later form**: form 2, `קְלַסְטָר`, not the
  cite's `קְלַסְטֵיר` (form 1); an observation only, see "Numeral on a
  later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:17955c19`:

```text
<a class="refLink" href="/Jastrow,_קְלַסְטֵיר ².1" data-ref="Jastrow, קְלַסְטֵיר ² 1"><span dir="rtl">קְלַסְטֵיר</span> I</a>
→
<a class="refLink" href="/Jastrow,_קְלַסְטֵיר.1" data-ref="Jastrow, קְלַסְטֵיר 1"><span dir="rtl">קְלַסְטֵיר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 151): the cite's
text reads "קְלַסְטֵיר I", Sefaria links S01385 "קְלַסְטֵיר, קְלַסְטָר
II, קְלַסְתָּר", the only family member numbered I is S01384
"קְלַסְטֵיר, קְלַסְטָר I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `קְלַסְטֵיר I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family קְנֵי

#### S01508 · P000730

- **Entry**: S01508 `קְנָא`, vol. 2, 1387b, leaf 710.
  Entry file: [`data/entries/S/S01508.json`](../../../../../../data/entries/S/S01508.json)
- **Scan crop**: [scan 1387b · leaf 710](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$711/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 710, line 101 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  sjp, Pa. te, v. ^p i.
  ```

  Located by position: line 100 is S01507 (`Sjp, Pi. X?p, v. "Op I.`)
  and line 102 is S01509 (`SDp to buy, v. ^p II.`). The cite reads `Pa.
  te, v. ^p i.`, the numeral as a lower-case `i`. No `I` is read.
- **The cite as Sefaria has it**: `קַנֵּי, v. קְנֵי I.`
  Sefaria links S01569 `קְנֵי, קְנָא II` (numeral II on form 2,
  `קְנָא`).
  The entry's first link, the Pa. form `קַנֵּי`, already points at
  S01567, the target; only the cite's anchor moves.
- **The patch's target**: S01567 `קְנֵי, קְנָא I` (numeral I on form 2,
  `קְנָא`).
  **The numeral sits on a later form**: form 2, `קְנָא`, not the cite's
  `קְנֵי` (form 1); an observation only, see "Numeral on a later form"
  above.
  The target is itself a `ch.` line that carries I (`ch., v. infra.`);
  the entry after it, S01568 `קני, קָנָה` (a b. h. verb), is not an
  unnumbered `ch.` line.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:0043e4c5`:

```text
<a class="refLink" href="/Jastrow,_קְנֵי ².1" data-ref="Jastrow, קְנֵי ² 1"><span dir="rtl">קְנֵי</span> I</a>
→
<a class="refLink" href="/Jastrow,_קְנֵי.1" data-ref="Jastrow, קְנֵי 1"><span dir="rtl">קְנֵי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 158): the cite's
text reads "קְנֵי I", Sefaria links S01569 "קְנֵי, קְנָא II", the only
family member numbered I is S01567 "קְנֵי, קְנָא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `קְנֵי I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family קִרְוָא

#### S01930 · P000733

- **Entry**: S01930 `קִרְוָה, קִרְוָוא, קִרְוָוה, (קרוות)`, vol. 2,
  1413a, leaf 736.
  Entry file: [`data/entries/S/S01930.json`](../../../../../../data/entries/S/S01930.json)
- **Scan crop**: [scan 1413a · leaf 736](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$737/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 736, line 56 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  nr5?> *!TJ?i nir& (pvy), v. »££ i, n.
  ```

  Located by position: line 55 is S01929 (`nip, T.irtp.`) and line 58 is
  S01931's head (`m. (Tip to be round`), after a mark (57). The cite
  reads `v. »££ i, n.`, the numeral as a lower-case `i` and the `II`
  after it as `n`. No `I` is read.
- **The cite as Sefaria has it**: `, v. קִרְוָא I, II.`
  Sefaria links S01924 `קִרְוָא, קִרְוָוא, קִי׳ II, (קִרְוָה, קֵרְוָוה)`
  (numeral II on form 3, `קִי׳`).
  The cite reads `v. קִרְוָא I, II`: the link covers `קִרְוָא I` only,
  and the `, II` after it is plain text.
- **The patch's target**: S01923 `קִרְוָא, קִרְוָוא, קִי׳ I` (numeral I
  on form 3, `קִי׳`).
  **The numeral sits on a later form**: form 3, `קִי׳`, not the cite's
  `קִרְוָא` (form 1); an observation only, see "Numeral on a later form"
  above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:1dfb90d2`:

```text
<a class="refLink" href="/Jastrow,_קִרְוָא ².1" data-ref="Jastrow, קִרְוָא ² 1"><span dir="rtl">קִרְוָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_קִרְוָא.1" data-ref="Jastrow, קִרְוָא 1"><span dir="rtl">קִרְוָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 161): the cite's
text reads "קִרְוָא I", Sefaria links S01924 "קִרְוָא, קִרְוָוא, קִי׳
II, קִרְוָה, קֵרְוָוה", the only family member numbered I is S01923
"קִרְוָא, קִרְוָוא, קִי׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `קִרְוָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family רְבֵי

#### U00543 · P000751

- **Entry**: U00543 `שׁוּרְבִּינָא, שׁוּרְבָּנָא`, vol. 2, 1542a,
  leaf 865.
  Entry file: [`data/entries/U/U00543.json`](../../../../../../data/entries/U/U00543.json)
- **Scan crop**: [scan 1542a · leaf 865](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$866/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 865, line 16 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  fcC1^!^, bCHT]1!© m. (Shaf. of ^ I) a species
  ```

  The head line, after a line of vowel points (15); the numeral reads
  `I`: `(Shaf. of ^ I) a species`.
- **The cite as Sefaria has it**: `(Shaf. of רְבֵי I) a species of
  cedar. R. Hash. 23ᵃ (expl…`
  Sefaria links T00084 `רְבֵי, רְבָא III` (numeral III on form 2,
  `רְבָא`).
- **The patch's target**: T00082 `רְבֵי, רְבָא I` (numeral I on form 2,
  `רְבָא`).
  **The numeral sits on a later form**: form 2, `רְבָא`, not the cite's
  `רְבֵי` (form 1); an observation only, see "Numeral on a later form"
  above.
  The target is itself a `ch.` line that carries I (`ch. same to grow,
  increase`); the entry after it, T00083 `*רְבֵי, רְבָא II`, is not an
  unnumbered `ch.` line.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:23bf8359`:

```text
<a class="refLink" href="/Jastrow,_רְבֵי ².1" data-ref="Jastrow, רְבֵי ² 1"><span dir="rtl">רְבֵי</span> I</a>
→
<a class="refLink" href="/Jastrow,_רְבֵי.1" data-ref="Jastrow, רְבֵי 1"><span dir="rtl">רְבֵי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 180): the cite's
text reads "רְבֵי I", Sefaria links T00084 "רְבֵי, רְבָא III", the only
family member numbered I is T00082 "רְבֵי, רְבָא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `רְבֵי I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family רְוַוח

#### T00329 · P000739

- **Entry**: T00329 `רְוַוח, רְוַח II, רַוְוחָא, רַוְחָא`, vol. 2,
  1457a, leaf 780; continues into 1457b, same leaf.
  Entry file: [`data/entries/T/T00329.json`](../../../../../../data/entries/T/T00329.json)
- **Scan crop**: [scan 1457a · leaf 780](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$781/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 780, lines 62–63 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Wil. '•.-.); a. fr.-[Targ. Y. I Deut. XXXII, 24 ",Ttni, read:
  •pnn, v. nil") I.]— 2) relief. Targ.O.Ex.IX,28. Targ.Esth.
  ```

  Line 62 is the bracketed Targ. Y. I Deut. XXXII, 24 note (`read:`);
  line 63 is the cite, the numeral read `I`: `v. nil") I.]`
- **The cite as Sefaria has it**: `…. fr.—[Targ. Y. I Deut. XXXII, 24
  רווחין, read: רוּחִין, v. רְוַוח I.]`
  Sefaria links T00329 `רְוַוח, רְוַח II, רַוְוחָא, רַוְחָא` (numeral II
  on form 2, `רְוַח`).
  Sefaria links the citing entry to itself: T00329 is the entry the cite
  sits in.
  The citing entry, T00329, is itself a `ch.` entry (`ch. same open
  space, room`); the cite has no `ch.` after it.
- **The patch's target**: T00327 `רְוַוח, רְוַח I` (numeral I on form 2,
  `רְוַח`).
  **The numeral sits on a later form**: form 2, `רְוַח`, not the cite's
  `רְוַוח` (form 1); an observation only, see "Numeral on a later form"
  above.
  The target is itself a `ch.` line that carries I (`ch. same to be
  wide, extend`); the entry after it, T00328 `רֶוַוח, רֵוַח, רֵי׳` (a b.
  h. noun), is not an unnumbered `ch.` line.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:70f9329f`:

```text
<a class="refLink" href="/Jastrow,_רְוַוח ².1" data-ref="Jastrow, רְוַוח ² 1"><span dir="rtl">רְוַוח</span> I</a>
→
<a class="refLink" href="/Jastrow,_רְוַוח.1" data-ref="Jastrow, רְוַוח 1"><span dir="rtl">רְוַוח</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 167): the cite's
text reads "רְוַוח I", Sefaria links T00329 "רְוַוח, רְוַח II, רַוְוחָא,
רַוְחָא", the only family member numbered I is T00327 "רְוַוח, רְוַח I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `רְוַוח I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### T00346 · P000740

- **Entry**: T00346 `רוּחָא`, vol. 2, 1458b, leaf 781.
  Entry file: [`data/entries/T/T00346.json`](../../../../../../data/entries/T/T00346.json)
- **Scan crop**: [scan 1458b · leaf 781](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$782/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 781, line 79 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Deut. XXXII, 24. Targ* Y.I ib.pmil (corr. ace), v. mil I;
  ```

  The numeral reads `I`: `(corr. ace), v. mil I;`
- **The cite as Sefaria has it**: `…rg. Deut. XXXII, 24. Targ. Y. I ib.
  רווחין (corr. acc.), v. רְוַוח I; a. fr.—Y. Shek. V, end, 49ᵇ רבהון
  דרוּ…`
  Sefaria links T00329 `רְוַוח, רְוַח II, רַוְוחָא, רַוְחָא` (numeral II
  on form 2, `רְוַח`).
  The citing entry, T00346, is itself a `ch.` entry (`ch. same`); the
  cite has no `ch.` after it.
- **The patch's target**: T00327 `רְוַוח, רְוַח I` (numeral I on form 2,
  `רְוַח`).
  **The numeral sits on a later form**: form 2, `רְוַח`, not the cite's
  `רְוַוח` (form 1); an observation only, see "Numeral on a later form"
  above.
  The target is itself a `ch.` line that carries I (`ch. same to be
  wide, extend`); the entry after it, T00328 `רֶוַוח, רֵוַח, רֵי׳` (a b.
  h. noun), is not an unnumbered `ch.` line.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:346f271d`:

```text
<a class="refLink" href="/Jastrow,_רְוַוח ².1" data-ref="Jastrow, רְוַוח ² 1"><span dir="rtl">רְוַוח</span> I</a>
→
<a class="refLink" href="/Jastrow,_רְוַוח.1" data-ref="Jastrow, רְוַוח 1"><span dir="rtl">רְוַוח</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 168): the cite's
text reads "רְוַוח I", Sefaria links T00329 "רְוַוח, רְוַח II, רַוְוחָא,
רַוְחָא", the only family member numbered I is T00327 "רְוַוח, רְוַח I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `רְוַוח I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

## Summary

| | count |
|---|---|
| records | 29 |
| entries | 27 |
| families | 20 |
| hOCR line found | 27 |
| of those, the hOCR reads the numeral the cite names | 21 |
| of those, the numeral is misread (`L`, `EL`, `i`, `i, n`) | 6 |
| no hOCR line found | 2 |
| the target's numeral sits on a later form than the cite's | 23 |
| a `ch.` line follows the target | 2 (the family צִיר: R00241, R00460; neither a `ch.` entry) |
| the citing entry is a `ch.` entry | 5 (Q01983, T00329, T00346, U01557, U02092) |
| the target is itself a `ch.` line carrying its numeral | 9 blocks, 7 targets |

**The hOCR reads the numeral (21)**: P00089 (P000681), Q00839
(P000698, P000699), Q01284 (P000700, `II`), Q01983 (P000703), R00241
(P000707), R00460 (P000710), R00488 (P000711), R00681 (P000713),
R00687 (P000714), S00070 (P000717, `II`), S00097 (P000718), S00231
(P000720, `II`), S00491 (P000722), S01486 (P000729), S02080 (P000734),
T00329 (P000739), T00346 (P000740), U00543 (P000751), U01557
(P000768), U02092 (P000776).

**The numeral is not read (8)**: misread as `L` in N00379 (P000650)
and as `EL` in R00687 (P000715, `II`); as a lower-case `i` in S01278
(P000725) and S01508 (P000730); `I, II` read as `i, n` in R00416
(P000709) and S01930 (P000733); no hOCR line at all for M02374
(P000641, `II`) and Q00500 (P000696). Their read is the scan's.

| family | rids | patch ids | leaf(s) | hOCR line found (y/n) |
|---|---|---|---|---|
| פִּיטְמָא | Q00500 | P000696 | 477 | n |
| פִּילָא | S00491, U01557 | P000722, P000768 | 660, 926 | y (reads numeral), y (reads numeral) |
| פִּיקָא | P00089, Q01983, S00097 | P000681, P000703, P000718 | 364, 563, 636 | y (reads numeral), y (reads numeral), y (reads numeral) |
| פֵּירוּכָא | Q00839, Q00839 | P000698, P000699 | 493, 493 | y (reads numeral), y (reads numeral) |
| פִּסְיוֹנָא | Q01284 | P000700 | 518 | y (reads numeral) |
| צִינְּתָא | R00488 | P000711 | 605 | y (reads numeral) |
| צִיפּוֹרֵי | R00416, R00687 | P000709, P000714 | 602, 619 | y, y (reads numeral) |
| צִיפּוֹרִין | R00687 | P000715 | 619 | y |
| צִיר | R00241, R00460 | P000707, P000710 | 593, 604 | y (reads numeral), y (reads numeral) |
| צְלֵי | N00379 | P000650 | 211 | y |
| צְפַר | R00681 | P000713 | 618 | y (reads numeral) |
| קִבְלָא | M02374, S00070, S00231 | P000641, P000717, P000720 | 152, 633, 646 | n, y (reads numeral), y (reads numeral) |
| קוּמְצָא | S01486 | P000729 | 709 | y (reads numeral) |
| קוֹרָה | S02080 | P000734 | 744 | y (reads numeral) |
| קִיסְטָא | U02092 | P000776 | 960 | y (reads numeral) |
| קְלַסְטֵיר | S01278 | P000725 | 696 | y |
| קְנֵי | S01508 | P000730 | 710 | y |
| קִרְוָא | S01930 | P000733 | 736 | y |
| רְבֵי | U00543 | P000751 | 865 | y (reads numeral) |
| רְוַוח | T00329, T00346 | P000739, P000740 | 780, 781 | y (reads numeral), y (reads numeral) |

The leaf is the hOCR line's; for S00097 (P000718) it is the leaf after
the entry's own, where the cite runs over. M02374 and Q00500 have no
hOCR line, and their leaf is the entry's own, as the page index gives
it.

## After the reads

A follow-up commit on this PR sets each record from its tick, removes
`pending`, and changes nothing else in the record unless the read
re-aims it:

- **confirm** → `evidence.kind` `maintainer-read`, with `reader`,
  `date`, `volume` and `leaf` (the leaf of the block's hOCR line, or
  the entry's own leaf where the block has none), e.g. `{"date":
  "2026-10-31", "kind": "maintainer-read", "leaf": 619, "reader":
  "Brian", "volume": 2}`. Where the hOCR line above reads the numeral,
  it may be quoted in the rationale as well; the `kind` stays the read.
- **withdraw** → the record leaves `reviewed/patches.jsonl` for
  `docs/archive/patches-retired-<date>/`, and the cite's link goes
  back to Sefaria's target.
- **re-aim** → where the read names a different target (in C1, a
  withdraw tick whose `Read:` line named it: the maintainer read
  B01237's and N00106's lines as Aramaic and re-aimed both at the
  `ch.` line B01153), `payload.replace` aims at the read's
  target by its link key; `find`, `expected_before` and `target` are
  unchanged; the `rationale` carries a dated amendment paragraph; and
  `evidence` is the maintainer's read, as for a confirm.
- A block with both boxes ticked, or a `Read:` line that disagrees with
  the hOCR line, goes back for a second read. Its record is left as it
  is, `sefaria-only` and `pending`, so the import keeps applying it as
  it does today; only its evidence update waits. A retarget the read
  puts in dispute is set `status: provisional` in that commit, which
  holds it out of the apply (DESIGN §5 "Patch process").

No read here adds a `reform`. Under ruling `10-30 one numeral per
line`, a numeral print sets anywhere on a head line is that line's, and
a patch adds a numeral only to a line that carries none. A read that
finds print's numeral only after a later form (see "Numeral on a later
form") confirms the retarget as it stands; it is not a reform under
10-13 case 2, and C1's two such reforms, P000940 and P000941, are
retired (PR #202).

The from-scratch import (`rm -rf data/entries/[A-Z] && bun data:import
&& bun qa:format`) is the witness: a confirm changes no entry file, and
each withdraw or re-aim changes one cite `ref` in its entry.
