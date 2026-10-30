# C3: cite retargets ס–ע, maintainer re-read (2026-10-30)

Group 3, batch 3 of 12, of
[`docs/review-checklist-2026-10-25.md`](../../../../../../docs/review-checklist-2026-10-25.md):
the 40 pending cite retargets whose family starts with ס–ע, one
maintainer block each. **No patch record, entry or checklist change.**
This directory holds only this README; a later commit applies the reads,
as C1's and C2's did
([`c1-rereads-2026-10-27`](../c1-rereads-2026-10-27/README.md), PR #200;
[`c2-rereads-2026-10-27`](../c2-rereads-2026-10-27/README.md), PR #202).

## Why these 40

Ruling `10-26 patch evidence`
([`docs/decisions.md`](../../../../../../docs/decisions.md)): every
reviewed patch carries `evidence`, and the import refuses a
text-changing patch that stands on Sefaria's text alone unless it is
`pending`. The backfill
([`evidence-backfill-2026-10-26`](../evidence-backfill-2026-10-26/README.md))
left all 40 here as `{"kind": "sefaria-only", "pending": true}`. They
still apply.

All 40 are retargets from
[`cite-retargets-2026-10-15`](../cite-retargets-2026-10-15/README.md)
(PR #178), case 1 of ruling `10-13 correction policy`: the cite's text
(`v. סִירָה I`) is Jastrow's, Sefaria's linker aimed it at a member of
the word's family that lacks the numeral, and the patch re-aims it at
the one member that carries it. No print was read when they were
written. The read turns each into `maintainer-read` (a scan read),
`hOCR` (a Latin-only claim, quoted verbatim) or `jastrow-text`, or
withdraws the patch, or re-aims it (see "After the reads").

## The set

The checklist's predicate, run on
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl) at
`45fced487`:

```bash
P=admin/pipeline/patch/records/reviewed/patches.jsonl
D='def fam: .rationale | capture("cite.s text reads [\"`](?<w>[^\"`]+)[\"`]").w | explode | map(select(. >= 1488 and . <= 1514)) | implode | .[0:1];
def retarget: .evidence.pending and .prompt_version == "cite-retargets-2026-10-15";'
jq -c "$D select(retarget and fam >= \"ס\" and fam <= \"ע\")" $P
```

**40 records over 35 entries, 12 families**, as the checklist's table
says. Five entries hold two records each:

- O00829 holds P000670 and P000671, a chained `find ×2` pair in one
  unnumbered sense (the second applies on the definition the first
  leaves).
- O01402 holds P000676 and P000677, two cites in different senses (`1)`
  and `—2)`), each applying on its own.
- O01610 holds P000679 and P000680, a chained pair in one unnumbered
  sense, as O00829's.
- P00970 holds P000690 and P000691, two cites in different fields (the
  lament quotation and the Pi.), each applying on its own.
- P01522 holds P000693 and P000694, two cites in different fields (the
  head's etymology and sense `1)`), each applying on its own.

Chained means the second record's `expected_before` is the first's with
the first applied, and its target hash differs for that reason; on the
other three the second's `expected_before` still holds the first's
`find` (checked by script, which reads C2's R00130 as chained and N00935
as not). A family is the cite word's consonants (ruling 10-05). The 40
ids below equal the predicate's output (diffed).

Every citing entry is in vol. 2: the page index
([`data/page-index/`](../../../../../../data/page-index/README.md))
places all 35 on pages 830–1682, whose `columns.jsonl` leaves (153–1005)
are page − 677, as its "Scan coordinates" give.

Checked by script on all 40:

- each is a `replace`, not `status: provisional`, whose `payload.find`
  occurs in `expected_before` once, and whose `payload.find` and
  `payload.replace` differ only in the anchor's `href` and `data-ref`,
  the visible text the same;
- the old `href` and `data-ref` are the link key (`sefariaHeadword`) of
  the entry Sefaria links, the new ones the target's;
- the target is the one entry of the family (every entry with a
  headword form of the cite word's consonants) that carries the cite's
  numeral on a headword form, and the entry Sefaria links carries a
  different numeral;
- none of the 40 cites is followed by `ch.` in the entry as it stands.

`removes` is absent on all 195 records of `cite-retargets-2026-10-15`
(96 of them still pending: C3's, C4's and C5's), so every block's
**Removes** line says none.

## How to read a block

Each block gives the entry, the scan link at the leaf the page index
gives it, and the hOCR line that holds the cite, first. The proposal
is last and collapsed. Read the print, then tick **one** box and write
what print shows on the `Read:` line. A block with both boxes ticked
goes back to the reader
([`DESIGN.md` §5 "Patch process"](../../../../DESIGN.md#patch-process)).

**What the hOCR can witness.** Latin text, numerals, punctuation and
position only, never a Hebrew reading
([`DESIGN.md` §5 "Patch evidence"](../../../../DESIGN.md#patch-evidence)).
The Roman numeral after the cite word is Latin, so the hOCR can witness
it; the Hebrew word before it needs the scan. **Every citing entry here
is in vol. 2**, whose hOCR (ABBYY 8) holds no Hebrew character at all
(none on any quoted line, checked by script). ABBYY read the Hebrew
type as Latin letters, digits and marks, so each Hebrew word stands in
a quoted line as a run like `Naaib` or `130`: that run is not a reading
of the Hebrew, and it is not repeated per block. A line set in Hebrew
alone can come out as vowel points only (O00702) or drop out (O00929's
cite). Each line is located by the Latin around the cite, or, for a
one-line cross-reference, by the lines of the entries before and after
it. Each quoted line is copied by script from `leafLines`
(`admin/pipeline/patch/hocr.ts`); no line quoted here holds a bidi mark.
Where the hOCR reads the numeral as `l`, `i` or `L`, sets it against
the garbled word with no space (`&0316II`), or does not read it at all,
that is the OCR's reading: the scan decides. Where the hOCR and the
scan read disagree, a second read is needed.

**The `ch.` rule (10-15).** A cite that reads `X N ch.` names the
`ch.` line print sets after `X N`, not `X N` itself. None of the 40
cites is followed by `ch.` in the entry as it stands (checked by
script). Note it on the `Read:` line if print shows one; that is a
withdraw, or a re-aim at the `ch.` line. In C1 the maintainer also
re-aimed two cites with no `ch.` at the `ch.` line because the citing
line is Aramaic (B01237 and N00106 → B01153). Here, of the 12 targets
only O00659 `סִילּוֹן, סִלּ׳ II` has a `ch.` line after it (O00660
`סִילּוֹנָה`, `m. ch. same, tube.`, checked by script). None of its five
citing entries (O00579, O00661, O01004, R00615, S00964) is a `ch.`
entry; each of those blocks names it. Two citing entries are themselves
`ch.` entries, O00090 `סְבַר IV, …` (`ch. same hope`, after O00089
`סֵבֶר`) and P00613 `עִינּוּיָא, עִנּ׳ I` (`ch. = עִינּוּי I`), and
neither's target has a `ch.` line after it. Two targets are themselves
`ch.` lines that carry their own I: O00085 `סְבַר, סְבֵיר I` (`ch. same`,
after O00084 `סָבַר`) and P00613. The entry after each is numbered
(O00086 `סְבַר II`; P00614 `עִינּוּיָא, עִנּ׳ II`, headed `ch.` but
carrying II), so neither is the unnumbered `ch.` line 10-15 names.

**Numeral on a later form.** A target's numeral can sit on a later
form of its head line than the one the cite spells: O00699 `סִימְטָא,
סִמְ׳ I` carries I on the abbreviation `סִמְ׳`, and O00832 `סִירָה,
סִירָא I` on the full form `סִירָא`, while the cites read `סִימְטָא I`
and `סִירָה I`. **33 of the 40 blocks** are of this shape (all but the
seven of the family עוֹנָה, whose target P00294 `עוֹנָה I` carries I on
its first form); each says so under "The patch's target", as an
observation only. Ruling `10-30 one numeral per line`
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
family's consonants), then rid; within an entry, patch order.

What the reviewed records do show: no member of the 12 families has a
reviewed `reform` patch (checked by script on every entry whose
headword consonants match a family's; the same script finds C1's
P000290 and P000321 as a control). Five members carry other reviewed
patches, all cite retargets: four are citing entries of this batch,
O00088 (P000658) and O00090 (P000659) of סְבַר, O00579 (P000664) of
סִידּוּר and P00613 (P000687) of עִינּוּיָא, and O00658 `סִילּוֹן I` of
סִילּוֹן carries C2's P000665, confirmed 2026-10-30. Three entries play
two parts here: O00579 cites `סִילּוֹן II` and is the target of P000685;
P00613 cites `עִינּוּי I` and is the target of P000688; O00090 is the
entry Sefaria links for its own cite (P000659) and for P000658 and
P000787. No block carries a reform note.

## The blocks

### Family סְבַר

#### O00088 · P000658

- **Entry**: O00088 `סַבַּר`, vol. 2, 952b, leaf 275.
  Entry file: [`data/entries/O/O00088.json`](../../../../../../data/entries/O/O00088.json)
- **Scan crop**: [scan 952b · leaf 275](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$276/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 275, line 74 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  XIX, 32 Ms. a. some ed., (ed. Berl. 130, v. 130 I).— PI.
  ```

  The numeral reads `I`: `(ed. Berl. 130, v. 130 I).` Both Hebrew words,
  `סָבַר` and the cite word, come out as `130`.
- **The cite as Sefaria has it**: `…Targ. O. Lev. XIX, 32 Ms. a. some
  ed., (ed. Berl. סָבַר, v. סְבַר I).—Pl. סַבָּרִין. Targ. Y. II, Gen.
  XLIX…`
  Sefaria links O00090 `סְבַר IV, סִבְרָא, סִי׳, סוֹבָרָא` (numeral IV
  on form 1, `סְבַר`).
- **The patch's target**: O00085 `סְבַר, סְבֵיר I` (numeral I on form 2,
  `סְבֵיר`).
  **The numeral sits on a later form**: form 2, `סְבֵיר`, not the cite's
  `סְבַר` (form 1); an observation only, see "Numeral on a later form"
  above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:0297d24c`:

```text
<a class="refLink" href="/Jastrow,_סְבַר IV.1" data-ref="Jastrow, סְבַר IV 1"><span dir="rtl">סְבַר</span> I</a>
→
<a class="refLink" href="/Jastrow,_סְבַר.1" data-ref="Jastrow, סְבַר 1"><span dir="rtl">סְבַר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 78): the cite's
text reads "סְבַר I", Sefaria links O00090 "סְבַר IV, סִבְרָא, סִי׳,
סוֹבָרָא", the only family member numbered I is O00085 "סְבַר, סְבֵיר
I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סְבַר I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### O00090 · P000659

- **Entry**: O00090 `סְבַר IV, סִבְרָא, סִי׳, סוֹבָרָא`, vol. 2, 952b,
  leaf 275.
  Entry file: [`data/entries/O/O00090.json`](../../../../../../data/entries/O/O00090.json)
- **Scan crop**: [scan 952b · leaf 275](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$276/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 275, lines 107–108 (Latin-only
  evidence: witnesses the numeral and position, not the Hebrew)

  ```text
  a. fr.— 3) opinion. Y. Ab. Zar. I, 40a niB^p (ed. Krot. <*»),
  v. lap I, Ithpa.
  ```

  Line 107 is sense 3 and its Y. Ab. Zar. reference; line 108 is the
  cite, the numeral read `I`: `v. lap I, Ithpa.`
- **The cite as Sefaria has it**: `opinion. Y. Ab. Zar. I, 40ᵃ סִיבְרָה
  (ed. Krot. סוּ׳), v. סְבַר I, Ithpa`
  Sefaria links O00090 `סְבַר IV, סִבְרָא, סִי׳, סוֹבָרָא` (numeral IV
  on form 1, `סְבַר`).
  Sefaria links the citing entry to itself: O00090 is the entry the cite
  sits in.
- **The patch's target**: O00085 `סְבַר, סְבֵיר I` (numeral I on form 2,
  `סְבֵיר`).
  **The numeral sits on a later form**: form 2, `סְבֵיר`, not the cite's
  `סְבַר` (form 1); an observation only, see "Numeral on a later form"
  above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—3)]:b9e7d5f4`:

```text
<a class="refLink" href="/Jastrow,_סְבַר IV.1" data-ref="Jastrow, סְבַר IV 1"><span dir="rtl">סְבַר</span> I</a>
→
<a class="refLink" href="/Jastrow,_סְבַר.1" data-ref="Jastrow, סְבַר 1"><span dir="rtl">סְבַר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 79): the cite's
text reads "סְבַר I", Sefaria links O00090 "סְבַר IV, סִבְרָא, סִי׳,
סוֹבָרָא", the only family member numbered I is O00085 "סְבַר, סְבֵיר
I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סְבַר I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### V00757 · P000787

- **Entry**: V00757 `תִּסְבָּרָא, תִּיסְ׳, תּוּסְ׳`, vol. 2, 1682b,
  leaf 1005.
  Entry file: [`data/entries/V/V00757.json`](../../../../../../data/entries/V/V00757.json)
- **Scan crop**: [scan 1682b · leaf 1005](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1006/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 1005, lines 69–71 (Latin-only
  evidence: witnesses the numeral and position, not the Hebrew)

  ```text
  fcOil&Tl, 'OTV&^Tl m. (Ithpe. noun of *ae, v.
  tt:.:.: «'
  ia& I Ithpoel; cmp. Syr. Kniat) P. Sm. 2514) storehouse,
  ```

  Line 69 is the head (`m. (Ithpe. noun of *ae, v.`) and line 70 vowel
  points only; line 71 is the cite, the numeral read `I`: `ia& I
  Ithpoel;`.
- **The cite as Sefaria has it**: `(Ithpe. noun of סְבַר, v. סְבַר I
  Ithpoel; cmp. Syr. סיברתא P. Sm. 2514) …`
  Sefaria links O00090 `סְבַר IV, סִבְרָא, סִי׳, סוֹבָרָא` (numeral IV
  on form 1, `סְבַר`).
- **The patch's target**: O00085 `סְבַר, סְבֵיר I` (numeral I on form 2,
  `סְבֵיר`).
  **The numeral sits on a later form**: form 2, `סְבֵיר`, not the cite's
  `סְבַר` (form 1); an observation only, see "Numeral on a later form"
  above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:4a334d46`:

```text
<a class="refLink" href="/Jastrow,_סְבַר IV.1" data-ref="Jastrow, סְבַר IV 1"><span dir="rtl">סְבַר</span> I</a>
→
<a class="refLink" href="/Jastrow,_סְבַר.1" data-ref="Jastrow, סְבַר 1"><span dir="rtl">סְבַר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 218): the cite's
text reads "סְבַר I", Sefaria links O00090 "סְבַר IV, סִבְרָא, סִי׳,
סוֹבָרָא", the only family member numbered I is O00085 "סְבַר, סְבֵיר
I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סְבַר I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family סִיגְנָא

#### O00157 · P000661

- **Entry**: O00157 `סִגְנָא III`, vol. 2, 955b, leaf 278.
  Entry file: [`data/entries/O/O00157.json`](../../../../../../data/entries/O/O00157.json)
- **Scan crop**: [scan 955b · leaf 278](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$279/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 278, line 99 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  ^:Ti6iii,n^p,v.N33ipn.
  ```

  Located by position: line 98 is O00156 `סִגְנָא II` (`SJ^D II, v.
  X3xii3>lO.`) and line 100 is O00158, with its parenthesis (`-ji^p
  (D13JD j, v. -,13310.`), so line 99 is this one-line cross-reference.
  The head's `III` may be the `iii` of `^:Ti6iii`; the cite,
  `v.N33ipn.`, has no `II`. The numeral is not read.
- **The cite as Sefaria has it**: `, סִגְנַאי, v. סִיגְנָא II`
  Sefaria links O00563 `סִיגְנָא I` (numeral I on form 1, `סִיגְנָא`).
- **The patch's target**: O00564 `סִיגְנָא, סִגְ׳ II, כְּפַר ס׳`
  (numeral II on form 2, `סִגְ׳`).
  **The numeral sits on a later form**: form 2, `סִגְ׳`, not the cite's
  `סִיגְנָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:d3540280`:

```text
<a class="refLink" href="/Jastrow,_סִיגְנָא I.1" data-ref="Jastrow, סִיגְנָא I 1"><span dir="rtl">סִיגְנָא</span> II</a>
→
<a class="refLink" href="/Jastrow,_סִיגְנָא.1" data-ref="Jastrow, סִיגְנָא 1"><span dir="rtl">סִיגְנָא</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 81): the cite's
text reads "סִיגְנָא II", Sefaria links O00563 "סִיגְנָא I", the only
family member numbered II is O00564 "סִיגְנָא, סִגְ׳ II, כְּפַר ס׳".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִיגְנָא II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### O00160 · P000662

- **Entry**: O00160 `סִגְנַיי`, vol. 2, 955b, leaf 278.
  Entry file: [`data/entries/O/O00160.json`](../../../../../../data/entries/O/O00160.json)
- **Scan crop**: [scan 955b · leaf 278](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$279/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 278, line 105 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  '"Jp, v. i«3ip II.
  ```

  Located by position: the one-line cross-reference after O00159's lines
  101–104. The numeral reads `II`: `v. i«3ip II.`
- **The cite as Sefaria has it**: `, v. סִיגְנָא II`
  Sefaria links O00563 `סִיגְנָא I` (numeral I on form 1, `סִיגְנָא`).
- **The patch's target**: O00564 `סִיגְנָא, סִגְ׳ II, כְּפַר ס׳`
  (numeral II on form 2, `סִגְ׳`).
  **The numeral sits on a later form**: form 2, `סִגְ׳`, not the cite's
  `סִיגְנָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:e49f9e71`:

```text
<a class="refLink" href="/Jastrow,_סִיגְנָא I.1" data-ref="Jastrow, סִיגְנָא I 1"><span dir="rtl">סִיגְנָא</span> II</a>
→
<a class="refLink" href="/Jastrow,_סִיגְנָא.1" data-ref="Jastrow, סִיגְנָא 1"><span dir="rtl">סִיגְנָא</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 82): the cite's
text reads "סִיגְנָא II", Sefaria links O00563 "סִיגְנָא I", the only
family member numbered II is O00564 "סִיגְנָא, סִגְ׳ II, כְּפַר ס׳".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִיגְנָא II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### O00569 · P000663

- **Entry**: O00569 `סִיגְנַיי`, vol. 2, 976a, leaf 299.
  Entry file: [`data/entries/O/O00569.json`](../../../../../../data/entries/O/O00569.json)
- **Scan crop**: [scan 976a · leaf 299](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$300/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 299, line 25 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  ^"OJT&, V.&0316II.
  ```

  Located by position: line 24 is O00568 (`pi. constr. of ^G.`) and line
  26 is O00570 (`D^p,^pI,^.0ft3WG.`). The cite reads `V.&0316II.`, the
  `II` set against the garbled word with no space. No separate `II` is
  read.
- **The cite as Sefaria has it**: `, v. סִיגְנָא II`
  Sefaria links O00563 `סִיגְנָא I` (numeral I on form 1, `סִיגְנָא`).
- **The patch's target**: O00564 `סִיגְנָא, סִגְ׳ II, כְּפַר ס׳`
  (numeral II on form 2, `סִגְ׳`).
  **The numeral sits on a later form**: form 2, `סִגְ׳`, not the cite's
  `סִיגְנָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:e49f9e71`:

```text
<a class="refLink" href="/Jastrow,_סִיגְנָא I.1" data-ref="Jastrow, סִיגְנָא I 1"><span dir="rtl">סִיגְנָא</span> II</a>
→
<a class="refLink" href="/Jastrow,_סִיגְנָא.1" data-ref="Jastrow, סִיגְנָא 1"><span dir="rtl">סִיגְנָא</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 83): the cite's
text reads "סִיגְנָא II", Sefaria links O00563 "סִיגְנָא I", the only
family member numbered II is O00564 "סִיגְנָא, סִגְ׳ II, כְּפַר ס׳".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִיגְנָא II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### O00929 · P000673

- **Entry**: O00929 `סִכְנִין, סִכְנִי, סִי׳`, vol. 2, 992a, leaf 315.
  Entry file: [`data/entries/O/O00929.json`](../../../../../../data/entries/O/O00929.json)
- **Scan crop**: [scan 992a · leaf 315](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$316/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 315, lines 51–52 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Tosef. Nidd. in, 11 ^333 n3)p3 the Valley of S.— Cmp.
  "j"0D&, Gen. B. s. 19, v. ^33G.
  ```

  Line 51 ends with the cite's `Cmp.` (`the Valley of S.— Cmp.`); line
  52 is the next entry, O00930 (`Gen. B. s. 19, v. ^33G.`). The cite
  word and its `II` are on no line of the leaf: the hOCR does not read
  them. The scan decides.
- **The cite as Sefaria has it**: `…khnin.—Tosef. Nidd. III, 11 בקעת
  סכני the Valley of S.—Cmp. סִיגְנָא II.`
  Sefaria links O00563 `סִיגְנָא I` (numeral I on form 1, `סִיגְנָא`).
- **The patch's target**: O00564 `סִיגְנָא, סִגְ׳ II, כְּפַר ס׳`
  (numeral II on form 2, `סִגְ׳`).
  **The numeral sits on a later form**: form 2, `סִגְ׳`, not the cite's
  `סִיגְנָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:29f10ef6`:

```text
<a class="refLink" href="/Jastrow,_סִיגְנָא I.1" data-ref="Jastrow, סִיגְנָא I 1"><span dir="rtl">סִיגְנָא</span> II</a>
→
<a class="refLink" href="/Jastrow,_סִיגְנָא.1" data-ref="Jastrow, סִיגְנָא 1"><span dir="rtl">סִיגְנָא</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 94): the cite's
text reads "סִיגְנָא II", Sefaria links O00563 "סִיגְנָא I", the only
family member numbered II is O00564 "סִיגְנָא, סִגְ׳ II, כְּפַר ס׳".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִיגְנָא II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family סִידּוּר

#### P00573 · P000685

- **Entry**: P00573 `עִילּוּי, עִלּ׳`, vol. 2, 1070a, leaf 393.
  Entry file: [`data/entries/P/P00573.json`](../../../../../../data/entries/P/P00573.json)
- **Scan crop**: [scan 1070a · leaf 393](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$394/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 393, line 44 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  a man, I vow his value (instead of 13"iS, v. "WPOI). Arakh.
  ```

  The cite reads `v. "WPOI).`: any `I` is fused into the garbled word.
  No separate `I` is read.
- **The cite as Sefaria has it**: `…ays pointing at a man, I vow his
  value (instead of ערכו, v. סִידּוּר I). Arakh. VIII, 7; Tem. VII, 3
  הקדש ע׳, …`
  Sefaria links O00580 `סִידּוּר II` (numeral II on form 1, `סִידּוּר`).
- **The patch's target**: O00579 `סִידּוּר, סִדּ׳ I` (numeral I on form
  2, `סִדּ׳`).
  **The numeral sits on a later form**: form 2, `סִדּ׳`, not the cite's
  `סִידּוּר` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:c3e0e10a`:

```text
<a class="refLink" href="/Jastrow,_סִידּוּר II.1" data-ref="Jastrow, סִידּוּר II 1"><span dir="rtl">סִידּוּר</span> I</a>
→
<a class="refLink" href="/Jastrow,_סִידּוּר.1" data-ref="Jastrow, סִידּוּר 1"><span dir="rtl">סִידּוּר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 106): the cite's
text reads "סִידּוּר I", Sefaria links O00580 "סִידּוּר II", the only
family member numbered I is O00579 "סִידּוּר, סִדּ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִידּוּר I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family סִיכְרָא

#### O00743 · P000668

- **Entry**: O00743 `סִינָּרָא, סִנָּ׳`, vol. 2, 983b, leaf 306.
  Entry file: [`data/entries/O/O00743.json`](../../../../../../data/entries/O/O00743.json)
- **Scan crop**: [scan 983b · leaf 306](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$307/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 306, line 66 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  earth from under seven door-sockets; v. X^s^O I.
  ```

  The numeral reads `I`: `door-sockets; v. X^s^O I.`
- **The cite as Sefaria has it**: `… seven specimens of earth from under
  seven door-sockets; v. סִיכְרָא I.`
  Sefaria links O00654 `סִיכְרָא, סִכְ׳ II` (numeral II on form 2,
  `סִכְ׳`).
- **The patch's target**: O00653 `סִיכְרָא, סִכְ׳ I` (numeral I on form
  2, `סִכְ׳`).
  **The numeral sits on a later form**: form 2, `סִכְ׳`, not the cite's
  `סִיכְרָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:436c14e6`:

```text
<a class="refLink" href="/Jastrow,_סִיכְרָא ².1" data-ref="Jastrow, סִיכְרָא ² 1"><span dir="rtl">סִיכְרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_סִיכְרָא.1" data-ref="Jastrow, סִיכְרָא 1"><span dir="rtl">סִיכְרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 89): the cite's
text reads "סִיכְרָא I", Sefaria links O00654 "סִיכְרָא, סִכְ׳ II", the
only family member numbered I is O00653 "סִיכְרָא, סִכְ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִיכְרָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family סִילּוֹן

#### O00579 · P000664

- **Entry**: O00579 `סִידּוּר, סִדּ׳ I`, vol. 2, 976a, leaf 299;
  continues into 976b, same leaf.
  Entry file: [`data/entries/O/O00579.json`](../../../../../../data/entries/O/O00579.json)
- **Scan crop**: [scan 976a · leaf 299](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$300/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 299, lines 51–52 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  rangement, order. Gen. R.s. 32 dVii> btt) illlid the natural
  order, v. yi^t? II. Y. Meg. IV, 75a bot. dl* bttJ 11116 yrtVB
  ```

  Line 51 is the Gen. R. s. 32 reference; line 52 is the cite, the
  numeral read `II`: `order, v. yi^t? II.`
- **The cite as Sefaria has it**: `…der. Gen. R. s. 32 סִידּוּרוֹ של
  עולם the natural order, v. סִילּוֹן II. Y. Meg. IV, 75ᵃ bot. שהיא
  סִדּוּרוֹ של…`
  Sefaria links O00658 `סִילּוֹן I` (numeral I on form 1, `סִילּוֹן`).
- **The patch's target**: O00659 `סִילּוֹן, סִלּ׳ II` (numeral II on
  form 2, `סִלּ׳`).
  **The numeral sits on a later form**: form 2, `סִלּ׳`, not the cite's
  `סִילּוֹן` (form 1); an observation only, see "Numeral on a later
  form" above.
  **The family has a `ch.` line after the target** (10-15): O00660
  `סִילּוֹנָה` (`m. ch. same, tube.`). The citing entry, O00579, is not
  a `ch.` entry; the cite follows its Gen. R. s. 32 quotation. The cite
  reads `סִילּוֹן II` with no `ch.` after it, so 10-15 does not point it
  there; it is named only so the read can rule it out.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:1f250629`:

```text
<a class="refLink" href="/Jastrow,_סִילּוֹן I.1" data-ref="Jastrow, סִילּוֹן I 1"><span dir="rtl">סִילּוֹן</span> II</a>
→
<a class="refLink" href="/Jastrow,_סִילּוֹן.1" data-ref="Jastrow, סִילּוֹן 1"><span dir="rtl">סִילּוֹן</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 84): the cite's
text reads "סִילּוֹן II", Sefaria links O00658 "סִילּוֹן I", the only
family member numbered II is O00659 "סִילּוֹן, סִלּ׳ II".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִילּוֹן II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### O00661 · P000666

- **Entry**: O00661 `סילונית`, vol. 2, 980a, leaf 303.
  Entry file: [`data/entries/O/O00661.json`](../../../../../../data/entries/O/O00661.json)
- **Scan crop**: [scan 980a · leaf 303](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$304/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 303, line 6 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  rP31TD, v. "p^d II.— Yalk. Lev. 537, v. rYai^d.
  ```

  The numeral reads `II`: `v. "p^d II.— Yalk. Lev. 537`.
- **The cite as Sefaria has it**: `, v. סִילּוֹן II.—Yalk. Lev. 537, v.
  סִירוֹנִית.`
  Sefaria links O00658 `סִילּוֹן I` (numeral I on form 1, `סִילּוֹן`).
- **The patch's target**: O00659 `סִילּוֹן, סִלּ׳ II` (numeral II on
  form 2, `סִלּ׳`).
  **The numeral sits on a later form**: form 2, `סִלּ׳`, not the cite's
  `סִילּוֹן` (form 1); an observation only, see "Numeral on a later
  form" above.
  **The family has a `ch.` line after the target** (10-15): O00660
  `סִילּוֹנָה` (`m. ch. same, tube.`). The citing entry, O00661, is a
  one-line cross-reference, not a `ch.` entry. The cite reads `סִילּוֹן
  II` with no `ch.` after it, so 10-15 does not point it there; it is
  named only so the read can rule it out.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:2c04e8c4`:

```text
<a class="refLink" href="/Jastrow,_סִילּוֹן I.1" data-ref="Jastrow, סִילּוֹן I 1"><span dir="rtl">סִילּוֹן</span> II</a>
→
<a class="refLink" href="/Jastrow,_סִילּוֹן.1" data-ref="Jastrow, סִילּוֹן 1"><span dir="rtl">סִילּוֹן</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 87): the cite's
text reads "סִילּוֹן II", Sefaria links O00658 "סִילּוֹן I", the only
family member numbered II is O00659 "סִילּוֹן, סִלּ׳ II".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִילּוֹן II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### O01004 · P000674

- **Entry**: O01004 `סָלַל II`, vol. 2, 995a, leaf 318; continues into
  995b, same leaf.
  Entry file: [`data/entries/O/O01004.json`](../../../../../../data/entries/O/O01004.json)
- **Scan crop**: [scan 995a · leaf 318](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$319/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 318, lines 52–53 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  >^Q II (b. h.) to tread, press; (cmp. 12523) to make a
  path, pave.— Denom. fkpp, D^D, 'pV>pn.
  ```

  Line 52 is the head (`(b. h.) to tread, press;`); line 53 ends with
  the three denominatives, the cite last: `'pV>pn.`. No `II` is read.
- **The cite as Sefaria has it**: `…p. כָּבַשׁ) to make a path,
  pave.—Denom. מְסִלָּה, סוּלָּם, סִילּוֹן II.`
  Sefaria links O00658 `סִילּוֹן I` (numeral I on form 1, `סִילּוֹן`).
- **The patch's target**: O00659 `סִילּוֹן, סִלּ׳ II` (numeral II on
  form 2, `סִלּ׳`).
  **The numeral sits on a later form**: form 2, `סִלּ׳`, not the cite's
  `סִילּוֹן` (form 1); an observation only, see "Numeral on a later
  form" above.
  **The family has a `ch.` line after the target** (10-15): O00660
  `סִילּוֹנָה` (`m. ch. same, tube.`). The citing entry, O01004, is the
  b. h. verb, not a `ch.` entry; the cite is the last of its
  denominatives. The cite reads `סִילּוֹן II` with no `ch.` after it, so
  10-15 does not point it there; it is named only so the read can rule
  it out.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:20ed3537`:

```text
<a class="refLink" href="/Jastrow,_סִילּוֹן I.1" data-ref="Jastrow, סִילּוֹן I 1"><span dir="rtl">סִילּוֹן</span> II</a>
→
<a class="refLink" href="/Jastrow,_סִילּוֹן.1" data-ref="Jastrow, סִילּוֹן 1"><span dir="rtl">סִילּוֹן</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 95): the cite's
text reads "סִילּוֹן II", Sefaria links O00658 "סִילּוֹן I", the only
family member numbered II is O00659 "סִילּוֹן, סִלּ׳ II".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִילּוֹן II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### R00615 · P000712

- **Entry**: R00615 `צִנּוֹרָא II, צִנּוֹרָה I, צִנּוֹרֶת, צִי׳`, vol.
  2, 1291a, leaf 614; continues into 1291b, same leaf.
  Entry file: [`data/entries/R/R00615.json`](../../../../../../data/entries/R/R00615.json)
- **Scan crop**: [scan 1291a · leaf 614](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$615/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 614, line 50 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  1) splash from a spout (cmp. "Vrc II), trnsf. (pTI br) '%
  ```

  The numeral reads `II`: `(cmp. "Vrc II), trnsf.`
- **The cite as Sefaria has it**: `splash from a spout (cmp. סִילּוֹן
  II), trnsf. צ׳ (של רוק) ejection of spittl…`
  Sefaria links O00658 `סִילּוֹן I` (numeral I on form 1, `סִילּוֹן`).
- **The patch's target**: O00659 `סִילּוֹן, סִלּ׳ II` (numeral II on
  form 2, `סִלּ׳`).
  **The numeral sits on a later form**: form 2, `סִלּ׳`, not the cite's
  `סִילּוֹן` (form 1); an observation only, see "Numeral on a later
  form" above.
  **The family has a `ch.` line after the target** (10-15): O00660
  `סִילּוֹנָה` (`m. ch. same, tube.`). The citing entry, R00615, is not
  a `ch.` entry; the cite is in sense `1)`'s gloss (`splash from a
  spout`). The cite reads `סִילּוֹן II` with no `ch.` after it, so 10-15
  does not point it there; it is named only so the read can rule it out.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:406c0b17`:

```text
<a class="refLink" href="/Jastrow,_סִילּוֹן I.1" data-ref="Jastrow, סִילּוֹן I 1"><span dir="rtl">סִילּוֹן</span> II</a>
→
<a class="refLink" href="/Jastrow,_סִילּוֹן.1" data-ref="Jastrow, סִילּוֹן 1"><span dir="rtl">סִילּוֹן</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 134): the cite's
text reads "סִילּוֹן II", Sefaria links O00658 "סִילּוֹן I", the only
family member numbered II is O00659 "סִילּוֹן, סִלּ׳ II".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִילּוֹן II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### S00964 · P000723

- **Entry**: S00964 `קִילוֹן`, vol. 2, 1360a, leaf 683.
  Entry file: [`data/entries/S/S00964.json`](../../../../../../data/entries/S/S00964.json)
- **Scan crop**: [scan 1360a · leaf 683](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$684/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 683, line 34 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  by swipe and bucket; v. "pS^OII.
  ```

  The cite reads `v. "pS^OII.`, the `II` set against the garbled word
  with no space. No separate `II` is read.
- **The cite as Sefaria has it**: `… comment. הסילון) a field irrigated
  by swipe and bucket; v. סִילּוֹן II.`
  Sefaria links O00658 `סִילּוֹן I` (numeral I on form 1, `סִילּוֹן`).
- **The patch's target**: O00659 `סִילּוֹן, סִלּ׳ II` (numeral II on
  form 2, `סִלּ׳`).
  **The numeral sits on a later form**: form 2, `סִלּ׳`, not the cite's
  `סִילּוֹן` (form 1); an observation only, see "Numeral on a later
  form" above.
  **The family has a `ch.` line after the target** (10-15): O00660
  `סִילּוֹנָה` (`m. ch. same, tube.`). The citing entry, S00964, is not
  a `ch.` entry; the cite closes its B. Bath. 99ᵇ quotation (`a field
  irrigated by swipe and bucket`). The cite reads `סִילּוֹן II` with no
  `ch.` after it, so 10-15 does not point it there; it is named only so
  the read can rule it out.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:a5be526f`:

```text
<a class="refLink" href="/Jastrow,_סִילּוֹן I.1" data-ref="Jastrow, סִילּוֹן I 1"><span dir="rtl">סִילּוֹן</span> II</a>
→
<a class="refLink" href="/Jastrow,_סִילּוֹן.1" data-ref="Jastrow, סִילּוֹן 1"><span dir="rtl">סִילּוֹן</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 148): the cite's
text reads "סִילּוֹן II", Sefaria links O00658 "סִילּוֹן I", the only
family member numbered II is O00659 "סִילּוֹן, סִלּ׳ II".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִילּוֹן II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family סִימְטָא

#### M02410 · P000642

- **Entry**: M02410 `מִקָּח`, vol. 2, 830b, leaf 153.
  Entry file: [`data/entries/M/M02410.json`](../../../../../../data/entries/M/M02410.json)
- **Scan crop**: [scan 830b · leaf 153](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$154/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 153, lines 76–77 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  for slaves. Sifra B'har ch. VII, Par. 6 (Yalk. Lev. 667 fipbfi),
  v. Naaib I. — isaal 'a, v. isaa.
  ```

  Line 76 is the Sifra and Yalk. reference (`Sifra B'har ch. VII, Par. 6
  (Yalk. Lev. 667`); line 77 is the cite, the numeral read `I`: `v.
  Naaib I.`
- **The cite as Sefaria has it**: `…aves. Sifra B’har ch. VII, Par. 6
  (Yalk. Lev. 667 הלקח), v. סִימְטָא I.—מ׳ וממכר, v. מִמְכָּר.`
  Sefaria links O00700 `סִימְטָא, סִמְ׳ II` (numeral II on form 2,
  `סִמְ׳`).
- **The patch's target**: O00699 `סִימְטָא, סִמְ׳ I` (numeral I on form
  2, `סִמְ׳`).
  **The numeral sits on a later form**: form 2, `סִמְ׳`, not the cite's
  `סִימְטָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:ce0be8e3`:

```text
<a class="refLink" href="/Jastrow,_סִימְטָא ².1" data-ref="Jastrow, סִימְטָא ² 1"><span dir="rtl">סִימְטָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_סִימְטָא.1" data-ref="Jastrow, סִימְטָא 1"><span dir="rtl">סִימְטָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 61): the cite's
text reads "סִימְטָא I", Sefaria links O00700 "סִימְטָא, סִמְ׳ II", the
only family member numbered I is O00699 "סִימְטָא, סִמְ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִימְטָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### O00702 · P000667

- **Entry**: O00702 `סִימְטָיוֹת`, vol. 2, 981a, leaf 304.
  Entry file: [`data/entries/O/O00702.json`](../../../../../../data/entries/O/O00702.json)
- **Scan crop**: [scan 981a · leaf 304](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$305/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 304, line 45 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  T : • t : •
  ```

  Located by position only: line 44 is O00701 (`■jf^'p^rT^p^.sub^.`, its
  `sub`) and line 46 is O00703 (`Targ. Y. Lev. XIX, 14 ed. Vien.,
  read:`), so print's one-line O00702 sits at line 45, where the hOCR
  reads vowel points and dots only: no `v.`, no numeral. The scan
  decides.
- **The cite as Sefaria has it**: `, v. סִימְטָא I`
  Sefaria links O00700 `סִימְטָא, סִמְ׳ II` (numeral II on form 2,
  `סִמְ׳`).
- **The patch's target**: O00699 `סִימְטָא, סִמְ׳ I` (numeral I on form
  2, `סִמְ׳`).
  **The numeral sits on a later form**: form 2, `סִמְ׳`, not the cite's
  `סִימְטָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:3e2f4517`:

```text
<a class="refLink" href="/Jastrow,_סִימְטָא ².1" data-ref="Jastrow, סִימְטָא ² 1"><span dir="rtl">סִימְטָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_סִימְטָא.1" data-ref="Jastrow, סִימְטָא 1"><span dir="rtl">סִימְטָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 88): the cite's
text reads "סִימְטָא I", Sefaria links O00700 "סִימְטָא, סִמְ׳ II", the
only family member numbered I is O00699 "סִימְטָא, סִמְ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִימְטָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### V00089 · P000778

- **Entry**: V00089 `תַּגָּר`, vol. 2, 1646b, leaf 969; continues into
  1647a, leaf 970.
  Entry file: [`data/entries/V/V00089.json`](../../../../../../data/entries/V/V00089.json)
- **Scan crop**: [scan 1646b · leaf 969](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$970/full/1400,/0/default.jpg); the cite is in 1647a, [scan 1647a · leaf 970](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$971/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 970, line 9 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  ofLydda. Pes.50b, a.e. X^a^'P, v.Xa/r^L Ib. *,n^an ",n
  ```

  The entry runs over from 1646b (leaf 969) into 1647a. Line 9 holds the
  Pes. 50ᵇ reference and the cite, `v.Xa/r^L`, the numeral read as `L`
  set against the garbled word. No `I` is read.
- **The cite as Sefaria has it**: `…גָּרֵי לוד the vendors of Lydda.
  Pes. 50ᵇ, a. e. ת׳ סימטא, v. סִימְטָא I. Ib. הן ותַגָּרֵיהֶן ותגרי
  תגריהן they …`
  Sefaria links O00700 `סִימְטָא, סִמְ׳ II` (numeral II on form 2,
  `סִמְ׳`).
- **The patch's target**: O00699 `סִימְטָא, סִמְ׳ I` (numeral I on form
  2, `סִמְ׳`).
  **The numeral sits on a later form**: form 2, `סִמְ׳`, not the cite's
  `סִימְטָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:eca3c57f`:

```text
<a class="refLink" href="/Jastrow,_סִימְטָא ².1" data-ref="Jastrow, סִימְטָא ² 1"><span dir="rtl">סִימְטָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_סִימְטָא.1" data-ref="Jastrow, סִימְטָא 1"><span dir="rtl">סִימְטָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 209): the cite's
text reads "סִימְטָא I", Sefaria links O00700 "סִימְטָא, סִמְ׳ II", the
only family member numbered I is O00699 "סִימְטָא, סִמְ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִימְטָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family סִיפּוּק

#### O01402 · P000676

- **Entry**: O01402 `סָפַק I`, vol. 2, 1015b, leaf 338.
  Entry file: [`data/entries/O/O01402.json`](../../../../../../data/entries/O/O01402.json)
- **Scan crop**: [scan 1015b · leaf 338](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$339/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 338, lines 97–98 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  strikes the hip, claps hands or dances by a flame (a su-
  perstitious practice) ; a. e. — V. p1E"p I. — 2) (cmp. C,p3, "Op3)
  ```

  Line 97 is the Tosef. Sabb. gloss (`dances by a flame`); line 98 is
  the cite, the numeral read `I`: `a. e. — V. p1E"p I.`
- **The cite as Sefaria has it**: `…s or dances by a flame (a
  superstitious practice); a. e.—V. סִיפּוּק I.`
  Sefaria links O00789 `סִיפּוּק, סִפּ׳ II` (numeral II on form 2,
  `סִפּ׳`).
- **The patch's target**: O00788 `סִיפּוּק, סִפּ׳ I` (numeral I on form
  2, `סִפּ׳`).
  **The numeral sits on a later form**: form 2, `סִפּ׳`, not the cite's
  `סִיפּוּק` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:ad5b7466`:

```text
<a class="refLink" href="/Jastrow,_סִיפּוּק ².1" data-ref="Jastrow, סִיפּוּק ² 1"><span dir="rtl">סִיפּוּק</span> I</a>
→
<a class="refLink" href="/Jastrow,_סִיפּוּק.1" data-ref="Jastrow, סִיפּוּק 1"><span dir="rtl">סִיפּוּק</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 97): the cite's
text reads "סִיפּוּק I", Sefaria links O00789 "סִיפּוּק, סִפּ׳ II", the
only family member numbered I is O00788 "סִיפּוּק, סִפּ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִיפּוּק I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### O01402 · P000677

- **Entry**: O01402 `סָפַק I`, vol. 2, 1015b, leaf 338.
  Entry file: [`data/entries/O/O01402.json`](../../../../../../data/entries/O/O01402.json)
- **Scan crop**: [scan 1015b · leaf 338](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$339/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 338, line 106 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  engrafted on an old tree; a. fr. — V. psiQ^p I.
  ```

  The numeral reads `I`: `a. fr. — V. psiQ^p I.`
- **The cite as Sefaria has it**: `…ct to ‘Orlah) which one engrafted on
  an old tree; a. fr.—V. סִיפּוּק I.`
  Sefaria links O00789 `סִיפּוּק, סִפּ׳ II` (numeral II on form 2,
  `סִפּ׳`).
- **The patch's target**: O00788 `סִיפּוּק, סִפּ׳ I` (numeral I on form
  2, `סִפּ׳`).
  **The numeral sits on a later form**: form 2, `סִפּ׳`, not the cite's
  `סִיפּוּק` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:295ffaf3`:

```text
<a class="refLink" href="/Jastrow,_סִיפּוּק ².1" data-ref="Jastrow, סִיפּוּק ² 1"><span dir="rtl">סִיפּוּק</span> I</a>
→
<a class="refLink" href="/Jastrow,_סִיפּוּק.1" data-ref="Jastrow, סִיפּוּק 1"><span dir="rtl">סִיפּוּק</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 98): the cite's
text reads "סִיפּוּק I", Sefaria links O00789 "סִיפּוּק, סִפּ׳ II", the
only family member numbered I is O00788 "סִיפּוּק, סִפּ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִיפּוּק I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family סִירָה

#### O00827 · P000669

- **Entry**: O00827 `סִיר`, vol. 2, 986b, leaf 309; continues into 987a,
  leaf 310.
  Entry file: [`data/entries/O/O00827.json`](../../../../../../data/entries/O/O00827.json)
- **Scan crop**: [scan 986b · leaf 309](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$310/full/1400,/0/default.jpg); the cite is in 987a, [scan 987a · leaf 310](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$311/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 310, lines 3–4 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  kindred) consumed there (in Moab). — ["TO thorn, v.
  rmj l]
  ```

  The entry runs over from 986b (leaf 309) into 987a. Line 3 ends the
  Num. R. quotation and opens the bracket (`(in Moab). — ["TO thorn,
  v.`); line 4 is the cite, the numeral read as `l`: `rmj l]`. No `I` is
  read.
- **The cite as Sefaria has it**: `…ents and kindred) consumed there (in
  Moab).—[סִיר thorn, v. סִירָה I.]`
  Sefaria links O00833 `סִירָה, סִירָא II` (numeral II on form 2,
  `סִירָא`).
- **The patch's target**: O00832 `סִירָה, סִירָא I` (numeral I on form
  2, `סִירָא`).
  **The numeral sits on a later form**: form 2, `סִירָא`, not the cite's
  `סִירָה` (form 1); an observation only, see "Numeral on a later form"
  above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:4857d118`:

```text
<a class="refLink" href="/Jastrow,_סִירָה ².1" data-ref="Jastrow, סִירָה ² 1"><span dir="rtl">סִירָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_סִירָה.1" data-ref="Jastrow, סִירָה 1"><span dir="rtl">סִירָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 90): the cite's
text reads "סִירָה I", Sefaria links O00833 "סִירָה, סִירָא II", the
only family member numbered I is O00832 "סִירָה, סִירָא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִירָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### O00829 · P000670

- **Entry**: O00829 `סִירָא II`, vol. 2, 987a, leaf 310.
  Entry file: [`data/entries/O/O00829.json`](../../../../../../data/entries/O/O00829.json)
- **Scan crop**: [scan 987a · leaf 310](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$311/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 310, line 7 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  ^n*D II m. (v. nTO I) thorn. Midr. Sam. ch. II, v.
  ```

  The numeral reads `I`: `(v. nTO I) thorn.`
- **The cite as Sefaria has it**: `(v. סִירָה I) thorn. Midr. Sam. ch.
  II, v. שַׂעֲרָא.—P…`
  Sefaria links O00833 `סִירָה, סִירָא II` (numeral II on form 2,
  `סִירָא`).
- **The patch's target**: O00832 `סִירָה, סִירָא I` (numeral I on form
  2, `סִירָא`).
  **The numeral sits on a later form**: form 2, `סִירָא`, not the cite's
  `סִירָה` (form 1); an observation only, see "Numeral on a later form"
  above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:2ea772f1`:

```text
<a class="refLink" href="/Jastrow,_סִירָה ².1" data-ref="Jastrow, סִירָה ² 1"><span dir="rtl">סִירָה</span> I</a>) 
→
<a class="refLink" href="/Jastrow,_סִירָה.1" data-ref="Jastrow, סִירָה 1"><span dir="rtl">סִירָה</span> I</a>) 
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 91): the cite's
text reads "סִירָה I", Sefaria links O00833 "סִירָה, סִירָא II", the
only family member numbered I is O00832 "סִירָה, סִירָא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִירָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### O00829 · P000671

- **Entry**: O00829 `סִירָא II`, vol. 2, 987a, leaf 310.
  Entry file: [`data/entries/O/O00829.json`](../../../../../../data/entries/O/O00829.json)
- **Scan crop**: [scan 987a · leaf 310](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$311/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 310, lines 8–9 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  x-rr.— PL yrrtf. Targ. Is. XXXIV, 13.— [Hebr. XTO, v.
  rrrn? i, n).
  ```

  Line 8 ends `[Hebr. XTO, v.`; line 9 is the cite, `rrrn? i, n).`, the
  numeral as a lower-case `i` and the `II` after it as `n`. No `I` is
  read.
- **The cite as Sefaria has it**: `…שַׂעֲרָא.—Pl. סִירִין. Targ. Is.
  XXXIV, 13.—[Hebr. סִירָא, v. סִירָה I, II).`
  Sefaria links O00833 `סִירָה, סִירָא II` (numeral II on form 2,
  `סִירָא`).
  The cite reads `v. סִירָה I, II`: the link covers `סִירָה I` only, and
  the `, II` after it is plain text.
- **The patch's target**: O00832 `סִירָה, סִירָא I` (numeral I on form
  2, `סִירָא`).
  **The numeral sits on a later form**: form 2, `סִירָא`, not the cite's
  `סִירָה` (form 1); an observation only, see "Numeral on a later form"
  above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:ae9109d2`:

```text
<a class="refLink" href="/Jastrow,_סִירָה ².1" data-ref="Jastrow, סִירָה ² 1"><span dir="rtl">סִירָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_סִירָה.1" data-ref="Jastrow, סִירָה 1"><span dir="rtl">סִירָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 92): the cite's
text reads "סִירָה I", Sefaria links O00833 "סִירָה, סִירָא II", the
only family member numbered I is O00832 "סִירָה, סִירָא I". It applies
after P000670, on the definition that patch leaves.

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִירָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### O00861 · P000672

- **Entry**: O00861 `סִירְתָּא`, vol. 2, 988a, leaf 311; continues into
  988b, same leaf.
  Entry file: [`data/entries/O/O00861.json`](../../../../../../data/entries/O/O00861.json)
- **Scan crop**: [scan 988a · leaf 311](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$312/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 311, line 44 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  NFlTP f.=h. rnTO I, ttoro. Targ. Y. Num. XIX, 2.—
  ```

  The numeral reads `I`: `f.=h. rnTO I, ttoro.` (`ttoro` is the gloss
  `thorn`, misread).
- **The cite as Sefaria has it**: `= h. סִירָה I, thorn. Targ. Y. Num.
  XIX, 2.—Pesik. Sh…`
  Sefaria links O00833 `סִירָה, סִירָא II` (numeral II on form 2,
  `סִירָא`).
- **The patch's target**: O00832 `סִירָה, סִירָא I` (numeral I on form
  2, `סִירָא`).
  **The numeral sits on a later form**: form 2, `סִירָא`, not the cite's
  `סִירָה` (form 1); an observation only, see "Numeral on a later form"
  above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:13813464`:

```text
<a class="refLink" href="/Jastrow,_סִירָה ².1" data-ref="Jastrow, סִירָה ² 1"><span dir="rtl">סִירָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_סִירָה.1" data-ref="Jastrow, סִירָה 1"><span dir="rtl">סִירָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 93): the cite's
text reads "סִירָה I", Sefaria links O00833 "סִירָה, סִירָא II", the
only family member numbered I is O00832 "סִירָה, סִירָא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִירָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### O01610 · P000679

- **Entry**: O01610 `סֵרָיוּת, סֵי׳`, vol. 2, 1026b, leaf 349; continues
  into 1027a, leaf 350.
  Entry file: [`data/entries/O/O01610.json`](../../../../../../data/entries/O/O01610.json)
- **Scan crop**: [scan 1026b · leaf 349](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$350/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 349, line 104 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  110, Ex. XXXII, 8, cmp. nip a. rYTO I) Dims 1113253 0 IBM
  ```

  The numeral reads `I`: `cmp. nip a. rYTO I)`.
- **The cite as Sefaria has it**: `…h. Ex. R. s. 42 (ref. to סָרוּ, Ex.
  XXXII, 8, cmp. סָרָה a. סִירָה I) נעשו ס׳ נעשו כובים (not כזבים) they
  have…`
  Sefaria links O00833 `סִירָה, סִירָא II` (numeral II on form 2,
  `סִירָא`).
- **The patch's target**: O00832 `סִירָה, סִירָא I` (numeral I on form
  2, `סִירָא`).
  **The numeral sits on a later form**: form 2, `סִירָא`, not the cite's
  `סִירָה` (form 1); an observation only, see "Numeral on a later form"
  above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:412f3e13`:

```text
<a class="refLink" href="/Jastrow,_סִירָה ².1" data-ref="Jastrow, סִירָה ² 1"><span dir="rtl">סִירָה</span> I</a>) 
→
<a class="refLink" href="/Jastrow,_סִירָה.1" data-ref="Jastrow, סִירָה 1"><span dir="rtl">סִירָה</span> I</a>) 
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 100): the cite's
text reads "סִירָה I", Sefaria links O00833 "סִירָה, סִירָא II", the
only family member numbered I is O00832 "סִירָה, סִירָא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִירָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### O01610 · P000680

- **Entry**: O01610 `סֵרָיוּת, סֵי׳`, vol. 2, 1026b, leaf 349; continues
  into 1027a, leaf 350.
  Entry file: [`data/entries/O/O01610.json`](../../../../../../data/entries/O/O01610.json)
- **Scan crop**: [scan 1026b · leaf 349](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$350/full/1400,/0/default.jpg); the cite is in 1027a, [scan 1027a · leaf 350](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$351/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 350, lines 4–5 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  carried to mud, and refuse to refuse (v. iOp, a. correct
  quot. s. v.).— V. rinia I, 2.
  ```

  The entry runs over from 1026b (leaf 349) into 1027a. Line 5 is the
  cite, the numeral read `I`: `V. rinia I, 2.`
- **The cite as Sefaria has it**: `…d refuse to refuse (v. טִינָּא, a.
  correct quot. s. v.).—V. סִירָה I, 2.`
  Sefaria links O00833 `סִירָה, סִירָא II` (numeral II on form 2,
  `סִירָא`).
  The cite reads `V. סִירָה I, 2.`: the `2` matches the target's second
  sense, `refuse, foul matter`.
- **The patch's target**: O00832 `סִירָה, סִירָא I` (numeral I on form
  2, `סִירָא`).
  **The numeral sits on a later form**: form 2, `סִירָא`, not the cite's
  `סִירָה` (form 1); an observation only, see "Numeral on a later form"
  above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:04f8b2bf`:

```text
<a class="refLink" href="/Jastrow,_סִירָה ².1" data-ref="Jastrow, סִירָה ² 1"><span dir="rtl">סִירָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_סִירָה.1" data-ref="Jastrow, סִירָה 1"><span dir="rtl">סִירָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 101): the cite's
text reads "סִירָה I", Sefaria links O00833 "סִירָה, סִירָא II", the
only family member numbered I is O00832 "סִירָה, סִירָא I". It applies
after P000679, on the definition that patch leaves.

</details>

**The maintainer's read**:

- [ ] confirm — print reads `סִירָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family עוֹנָה

#### P00291 · P000684

- **Entry**: P00291 `עוּן`, vol. 2, 1053b, leaf 376; continues into
  1054a, leaf 377.
  Entry file: [`data/entries/P/P00291.json`](../../../../../../data/entries/P/P00291.json)
- **Scan crop**: [scan 1053b · leaf 376](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$377/full/1400,/0/default.jpg); the cite is in 1054a, [scan 1054a · leaf 377](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$378/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 377, lines 23–24 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  times and hours are auspicious &c; [Comment, on dtfjnan
  d^nS1 explain "31" as denomin. of n315 I]; Tosef. Sabb.
  ```

  The entry runs over from 1053b (leaf 376) into 1054a. Line 24 is the
  cite, the numeral read `I`: `as denomin. of n315 I];`.
- **The cite as Sefaria has it**: `…us &c.; [Comment. on המחשב עתים
  explain עונן as denomin. of עוֹנָה I]; Tosef. Sabb. VII (VIII), 14
  נותני עתי…`
  Sefaria links P00297 `עוֹנָה IV` (numeral IV on form 1, `עוֹנָה`).
- **The patch's target**: P00294 `עוֹנָה I` (numeral I on form 1,
  `עוֹנָה`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:e78caa3a`:

```text
<a class="refLink" href="/Jastrow,_עוֹנָה IV.1" data-ref="Jastrow, עוֹנָה IV 1"><span dir="rtl">עוֹנָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_עוֹנָה I.1" data-ref="Jastrow, עוֹנָה I 1"><span dir="rtl">עוֹנָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 105): the cite's
text reads "עוֹנָה I", Sefaria links P00297 "עוֹנָה IV", the only family
member numbered I is P00294 "עוֹנָה I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עוֹנָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### P01021 · P000692

- **Entry**: P01021 `עַנְתָא, עוּ׳, עִי׳`, vol. 2, 1097a, leaf 420.
  Entry file: [`data/entries/P/P01021.json`](../../../../../../data/entries/P/P01021.json)
- **Scan crop**: [scan 1097a · leaf 420](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$421/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 420, line 37 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  SrJ?, '$, '"£f. = h. MiWI, 1) marital duty. Targ.
  ```

  The head line: the cite reads `= h. MiWI, 1) marital duty.`, any `I`
  fused into the garbled word. No separate `I` is read.
- **The cite as Sefaria has it**: `= h. עוֹנָה I,`
  Sefaria links P00297 `עוֹנָה IV` (numeral IV on form 1, `עוֹנָה`).
- **The patch's target**: P00294 `עוֹנָה I` (numeral I on form 1,
  `עוֹנָה`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:3349bcd4`:

```text
<a class="refLink" href="/Jastrow,_עוֹנָה IV.1" data-ref="Jastrow, עוֹנָה IV 1"><span dir="rtl">עוֹנָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_עוֹנָה I.1" data-ref="Jastrow, עוֹנָה I 1"><span dir="rtl">עוֹנָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 113): the cite's
text reads "עוֹנָה I", Sefaria links P00297 "עוֹנָה IV", the only family
member numbered I is P00294 "עוֹנָה I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עוֹנָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### P01522 · P000693

- **Entry**: P01522 `עֵת`, vol. 2, 1128a, leaf 451; continues into
  1128b, same leaf.
  Entry file: [`data/entries/P/P01522.json`](../../../../../../data/entries/P/P01522.json)
- **Scan crop**: [scan 1128a · leaf 451](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$452/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 451, line 51 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  rC? f. (b. h. ; contr. of ms, v. TO; or of MS, v. n31S I)
  ```

  The head's etymology; the numeral reads `I`: `or of MS, v. n31S I)`.
- **The cite as Sefaria has it**: `, v. עוּד; or of ענת, v. עוֹנָה I)
  [duration, turn,]`
  Sefaria links P00297 `עוֹנָה IV` (numeral IV on form 1, `עוֹנָה`).
- **The patch's target**: P00294 `עוֹנָה I` (numeral I on form 1,
  `עוֹנָה`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:b0d33cca`:

```text
<a class="refLink" href="/Jastrow,_עוֹנָה IV.1" data-ref="Jastrow, עוֹנָה IV 1"><span dir="rtl">עוֹנָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_עוֹנָה I.1" data-ref="Jastrow, עוֹנָה I 1"><span dir="rtl">עוֹנָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 114): the cite's
text reads "עוֹנָה I", Sefaria links P00297 "עוֹנָה IV", the only family
member numbered I is P00294 "עוֹנָה I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עוֹנָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### P01522 · P000694

- **Entry**: P01522 `עֵת`, vol. 2, 1128a, leaf 451; continues into
  1128b, same leaf.
  Entry file: [`data/entries/P/P01522.json`](../../../../../../data/entries/P/P01522.json)
- **Scan crop**: [scan 1128a · leaf 451](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$452/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 451, line 53 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  'onah. Tosef. Ber.1, 1 ; a. e., v. niis I.— 2) time. Pes. 109a;
  ```

  The numeral reads `I`: `a. e., v. niis I.— 2) time.`
- **The cite as Sefaria has it**: `…twenty-fourth part of an ʿonah.
  Tosef. Ber. I, 1; a. e., v. עוֹנָה I.`
  Sefaria links P00297 `עוֹנָה IV` (numeral IV on form 1, `עוֹנָה`).
- **The patch's target**: P00294 `עוֹנָה I` (numeral I on form 1,
  `עוֹנָה`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:6f59d9d4`:

```text
<a class="refLink" href="/Jastrow,_עוֹנָה IV.1" data-ref="Jastrow, עוֹנָה IV 1"><span dir="rtl">עוֹנָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_עוֹנָה I.1" data-ref="Jastrow, עוֹנָה I 1"><span dir="rtl">עוֹנָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 115): the cite's
text reads "עוֹנָה I", Sefaria links P00297 "עוֹנָה IV", the only family
member numbered I is P00294 "עוֹנָה I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עוֹנָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### Q01449 · P000702

- **Entry**: Q01449 `פָּקַד`, vol. 2, 1206b, leaf 529; continues into
  1207a, leaf 530.
  Entry file: [`data/entries/Q/Q01449.json`](../../../../../../data/entries/Q/Q01449.json)
- **Scan crop**: [scan 1206b · leaf 529](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$530/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 529, line 80 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  does not visit her (in due time, v. WIS I). Ib. mat 3^n
  ```

  The numeral reads `I`: `(in due time, v. WIS I).`
- **The cite as Sefaria has it**: `…62ᵇ ואינו פוֹקְדָהּ and does not
  visit her (in due time, v. עוֹנָה I). Ib. חייב אדם לִפְקוֹד וכו׳ a man
  is b…`
  Sefaria links P00297 `עוֹנָה IV` (numeral IV on form 1, `עוֹנָה`).
- **The patch's target**: P00294 `עוֹנָה I` (numeral I on form 1,
  `עוֹנָה`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:c89009fe`:

```text
<a class="refLink" href="/Jastrow,_עוֹנָה IV.1" data-ref="Jastrow, עוֹנָה IV 1"><span dir="rtl">עוֹנָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_עוֹנָה I.1" data-ref="Jastrow, עוֹנָה I 1"><span dir="rtl">עוֹנָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 124): the cite's
text reads "עוֹנָה I", Sefaria links P00297 "עוֹנָה IV", the only family
member numbered I is P00294 "עוֹנָה I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עוֹנָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### T00218 · P000737

- **Entry**: T00218 `רֶגַע`, vol. 2, 1450a, leaf 773.
  Entry file: [`data/entries/T/T00218.json`](../../../../../../data/entries/T/T00218.json)
- **Scan crop**: [scan 1450a · leaf 773](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$774/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 773, line 39 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Y. Ber. 1, 2d top. Tosef. Ber. 1, 1, v. fi315> I; a. e.
  ```

  The numeral reads `I`: `Tosef. Ber. 1, 1, v. fi315> I; a. e.`
- **The cite as Sefaria has it**: `…o II, 18 כדי לאמרו; Y. Ber. I, 2ᵈ
  top. Tosef. Ber. I, 1, v. עוֹנָה I; a. e.`
  Sefaria links P00297 `עוֹנָה IV` (numeral IV on form 1, `עוֹנָה`).
- **The patch's target**: P00294 `עוֹנָה I` (numeral I on form 1,
  `עוֹנָה`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:068fb2e4`:

```text
<a class="refLink" href="/Jastrow,_עוֹנָה IV.1" data-ref="Jastrow, עוֹנָה IV 1"><span dir="rtl">עוֹנָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_עוֹנָה I.1" data-ref="Jastrow, עוֹנָה I 1"><span dir="rtl">עוֹנָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 165): the cite's
text reads "עוֹנָה I", Sefaria links P00297 "עוֹנָה IV", the only family
member numbered I is P00294 "עוֹנָה I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עוֹנָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### U01635 · P000770

- **Entry**: U01635 `שָׁעָה II`, vol. 2, 1609b, leaf 932.
  Entry file: [`data/entries/U/U01635.json`](../../../../../../data/entries/U/U01635.json)
- **Scan crop**: [scan 1609b · leaf 932](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$933/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 932, line 90 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Ber. I, 1, a. e., v. TOtP I. Ber. 7a, v. r;~. Ib.b, a. e. 'rn
  ```

  The numeral reads `I`: `Ber. I, 1, a. e., v. TOtP I.`
- **The cite as Sefaria has it**: `…arying according to the season.
  Tosef. Ber. I, 1, a. e., v. עוֹנָה I. Ber. 7ᵃ, v. רֶגַע. Ib. 7ᵇ, a. e.
  הש׳ מ…`
  Sefaria links P00297 `עוֹנָה IV` (numeral IV on form 1, `עוֹנָה`).
- **The patch's target**: P00294 `עוֹנָה I` (numeral I on form 1,
  `עוֹנָה`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:18845bce`:

```text
<a class="refLink" href="/Jastrow,_עוֹנָה IV.1" data-ref="Jastrow, עוֹנָה IV 1"><span dir="rtl">עוֹנָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_עוֹנָה I.1" data-ref="Jastrow, עוֹנָה I 1"><span dir="rtl">עוֹנָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 200): the cite's
text reads "עוֹנָה I", Sefaria links P00297 "עוֹנָה IV", the only family
member numbered I is P00294 "עוֹנָה I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עוֹנָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family עִימְעוּם

#### P00591 · P000686

- **Entry**: P00591 `עִימּוּם`, vol. 2, 1070b, leaf 393.
  Entry file: [`data/entries/P/P00591.json`](../../../../../../data/entries/P/P00591.json)
- **Scan crop**: [scan 1070b · leaf 393](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$394/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 393, line 97 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  D^1^, v. D^a^s I.
  ```

  Located by position: line 98 is P00592's head (`'ffl I m. (denom.
  of`), and line 97 is the last one-line cross-reference before it. The
  numeral reads `I`: `v. D^a^s I.`
- **The cite as Sefaria has it**: `, v. עִימְעוּם I`
  Sefaria links P00596 `עִימְעוּם, עִמְ׳ II` (numeral II on form 2,
  `עִמְ׳`).
- **The patch's target**: P00595 `עִימְעוּם, עִמְעוּם I` (numeral I on
  form 2, `עִמְעוּם`).
  **The numeral sits on a later form**: form 2, `עִמְעוּם`, not the
  cite's `עִימְעוּם` (form 1); an observation only, see "Numeral on a
  later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:e0504b56`:

```text
<a class="refLink" href="/Jastrow,_עִימְעוּם ².1" data-ref="Jastrow, עִימְעוּם ² 1"><span dir="rtl">עִימְעוּם</span> I</a>
→
<a class="refLink" href="/Jastrow,_עִימְעוּם.1" data-ref="Jastrow, עִימְעוּם 1"><span dir="rtl">עִימְעוּם</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 107): the cite's
text reads "עִימְעוּם I", Sefaria links P00596 "עִימְעוּם, עִמְ׳ II",
the only family member numbered I is P00595 "עִימְעוּם, עִמְעוּם I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עִימְעוּם I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### P00871 · P000689

- **Entry**: P00871 `עמּוּם`, vol. 2, 1087b, leaf 410.
  Entry file: [`data/entries/P/P00871.json`](../../../../../../data/entries/P/P00871.json)
- **Scan crop**: [scan 1087b · leaf 410](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$411/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 410, line 59 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  WilSS^t v. aisa^si.
  ```

  Located by position: line 58 ends P00870 (`marriage, but not a
  female`) and line 60 is P00872 (`Dins?, v. &$».`). The cite reads `v.
  aisa^si.`, any `I` fused into the garbled word as a lower-case `i`. No
  separate `I` is read.
- **The cite as Sefaria has it**: `, v. עִימְעוּם I`
  Sefaria links P00596 `עִימְעוּם, עִמְ׳ II` (numeral II on form 2,
  `עִמְ׳`).
- **The patch's target**: P00595 `עִימְעוּם, עִמְעוּם I` (numeral I on
  form 2, `עִמְעוּם`).
  **The numeral sits on a later form**: form 2, `עִמְעוּם`, not the
  cite's `עִימְעוּם` (form 1); an observation only, see "Numeral on a
  later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:e0504b56`:

```text
<a class="refLink" href="/Jastrow,_עִימְעוּם ².1" data-ref="Jastrow, עִימְעוּם ² 1"><span dir="rtl">עִימְעוּם</span> I</a>
→
<a class="refLink" href="/Jastrow,_עִימְעוּם.1" data-ref="Jastrow, עִימְעוּם 1"><span dir="rtl">עִימְעוּם</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 110): the cite's
text reads "עִימְעוּם I", Sefaria links P00596 "עִימְעוּם, עִמְ׳ II",
the only family member numbered I is P00595 "עִימְעוּם, עִמְעוּם I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עִימְעוּם I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family עִינּוּי

#### P00613 · P000687

- **Entry**: P00613 `עִינּוּיָא, עִנּ׳ I`, vol. 2, 1072b, leaf 395.
  Entry file: [`data/entries/P/P00613.json`](../../../../../../data/entries/P/P00613.json)
- **Scan crop**: [scan 1072b · leaf 395](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$396/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 395, line 73 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  fcT^"^, 'TJ I «sfc.-"WttI. Targ. Jer. IX, 19 (h. text
  ```

  The head line: `«sfc.` is the `ch.` and `-"WttI.` the cite, any `I`
  fused into the garbled word. No separate `I` is read. (Line 76,
  P00614's head, reads `ch.` and its `II` as such.)
- **The cite as Sefaria has it**: `ch. = עִינּוּי I. Targ. Jer. IX, 19
  (h. text קינה). Targ…`
  Sefaria links P00612 `עִינּוּי, עִנּ׳ II` (numeral II on form 2,
  `עִנּ׳`).
- **The patch's target**: P00611 `עִינּוּי, עִנּ׳ I` (numeral I on form
  2, `עִנּ׳`).
  **The numeral sits on a later form**: form 2, `עִנּ׳`, not the cite's
  `עִינּוּי` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:4f17956d`:

```text
<a class="refLink" href="/Jastrow,_עִינּוּי ².1" data-ref="Jastrow, עִינּוּי ² 1"><span dir="rtl">עִינּוּי</span> I</a>
→
<a class="refLink" href="/Jastrow,_עִינּוּי.1" data-ref="Jastrow, עִינּוּי 1"><span dir="rtl">עִינּוּי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 108): the cite's
text reads "עִינּוּי I", Sefaria links P00612 "עִינּוּי, עִנּ׳ II", the
only family member numbered I is P00611 "עִינּוּי, עִנּ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עִינּוּי I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### P00970 · P000690

- **Entry**: P00970 `עני, עָנָה I`, vol. 2, 1093a, leaf 416.
  Entry file: [`data/entries/P/P00970.json`](../../../../../../data/entries/P/P00970.json)
- **Scan crop**: [scan 1093a · leaf 416](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$417/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 416, lines 24–25 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  !Tnnx PVOT9 "J3131 one speaks, and all repeat in chorus
  after her, v. *e&*9 I. Ber. 47a QiSWl iBa f0» t&Q*® 12
  ```

  Line 24 is the M. Kat. gloss (`one speaks, and all repeat in chorus`);
  line 25 is the cite, the numeral read `I`: `after her, v. *e&*9 I.`
- **The cite as Sefaria has it**: `…ות אחריה one speaks, and all repeat
  in chorus after her, v. עִינּוּי I. Ber. 47ᵃ עד שיכלה אמן מפי העוֹנִים
  unt…`
  Sefaria links P00612 `עִינּוּי, עִנּ׳ II` (numeral II on form 2,
  `עִנּ׳`).
- **The patch's target**: P00611 `עִינּוּי, עִנּ׳ I` (numeral I on form
  2, `עִנּ׳`).
  **The numeral sits on a later form**: form 2, `עִנּ׳`, not the cite's
  `עִינּוּי` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:492cb061`:

```text
<a class="refLink" href="/Jastrow,_עִינּוּי ².1" data-ref="Jastrow, עִינּוּי ² 1"><span dir="rtl">עִינּוּי</span> I</a>
→
<a class="refLink" href="/Jastrow,_עִינּוּי.1" data-ref="Jastrow, עִינּוּי 1"><span dir="rtl">עִינּוּי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 111): the cite's
text reads "עִינּוּי I", Sefaria links P00612 "עִינּוּי, עִנּ׳ II", the
only family member numbered I is P00611 "עִינּוּי, עִנּ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עִינּוּי I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### P00970 · P000691

- **Entry**: P00970 `עני, עָנָה I`, vol. 2, 1093a, leaf 416.
  Entry file: [`data/entries/P/P00970.json`](../../../../../../data/entries/P/P00970.json)
- **Scan crop**: [scan 1093a · leaf 416](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$417/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 416, lines 47–48 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Pi. "^^''•3, to speak or sing in chorus, esp. to lament.
  M. Kat. Ill, 9, niasa, v. ""is'1:? I.
  ```

  Line 47 is the Pi. (`to speak or sing in chorus, esp. to lament.`);
  line 48 is the cite, the numeral read `I`: `v. ""is'1:? I.`
- **The cite as Sefaria has it**: `…ng in chorus, esp. to lament. M.
  Kat. III, 9, מְעַנּוֹת, v. עִינּוּי I.`
  Sefaria links P00612 `עִינּוּי, עִנּ׳ II` (numeral II on form 2,
  `עִנּ׳`).
- **The patch's target**: P00611 `עִינּוּי, עִנּ׳ I` (numeral I on form
  2, `עִנּ׳`).
  **The numeral sits on a later form**: form 2, `עִנּ׳`, not the cite's
  `עִינּוּי` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:5a0a946d`:

```text
<a class="refLink" href="/Jastrow,_עִינּוּי ².1" data-ref="Jastrow, עִינּוּי ² 1"><span dir="rtl">עִינּוּי</span> I</a>
→
<a class="refLink" href="/Jastrow,_עִינּוּי.1" data-ref="Jastrow, עִינּוּי 1"><span dir="rtl">עִינּוּי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 112): the cite's
text reads "עִינּוּי I", Sefaria links P00612 "עִינּוּי, עִנּ׳ II", the
only family member numbered I is P00611 "עִינּוּי, עִנּ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עִינּוּי I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### S00412 · P000721

- **Entry**: S00412 `קוּן, קִין`, vol. 2, 1334a, leaf 657.
  Entry file: [`data/entries/S/S00412.json`](../../../../../../data/entries/S/S00412.json)
- **Scan crop**: [scan 1334a · leaf 657](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$658/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 657, line 46 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  sing dirges, v. MS^p a. *mf9 I; a. fr.
  ```

  The numeral reads `I`: `sing dirges, v. MS^p a. *mf9 I; a. fr.`
- **The cite as Sefaria has it**: `…ey (the lamenting women) must not
  sing dirges, v. קִינָה a. עִינּוּי I; a. fr.`
  Sefaria links P00612 `עִינּוּי, עִנּ׳ II` (numeral II on form 2,
  `עִנּ׳`).
- **The patch's target**: P00611 `עִינּוּי, עִנּ׳ I` (numeral I on form
  2, `עִנּ׳`).
  **The numeral sits on a later form**: form 2, `עִנּ׳`, not the cite's
  `עִינּוּי` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:e3d4b0d3`:

```text
<a class="refLink" href="/Jastrow,_עִינּוּי ².1" data-ref="Jastrow, עִינּוּי ² 1"><span dir="rtl">עִינּוּי</span> I</a>
→
<a class="refLink" href="/Jastrow,_עִינּוּי.1" data-ref="Jastrow, עִינּוּי 1"><span dir="rtl">עִינּוּי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 144): the cite's
text reads "עִינּוּי I", Sefaria links P00612 "עִינּוּי, עִנּ׳ II", the
only family member numbered I is P00611 "עִינּוּי, עִנּ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עִינּוּי I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### S01024 · P000724

- **Entry**: S01024 `קִינָה`, vol. 2, 1362b, leaf 685; continues into
  1363a, leaf 686.
  Entry file: [`data/entries/S/S01024.json`](../../../../../../data/entries/S/S01024.json)
- **Scan crop**: [scan 1362b · leaf 685](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$686/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 685, line 85 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  &c, v. ^IS"1? I. Ber. 7b (ref. to Ps. Ill, 1) '31 'p ... Tata
  ```

  The numeral reads `I`: `&c, v. ^IS"1? I. Ber. 7b`.
- **The cite as Sefaria has it**: `… וכ׳ a lamentation is called ḳinah,
  when one speaks &c., v. עִינּוּי I. Ber. 7ᵇ (ref. to Ps. III, 1) מזמור
  … ק…`
  Sefaria links P00612 `עִינּוּי, עִנּ׳ II` (numeral II on form 2,
  `עִנּ׳`).
- **The patch's target**: P00611 `עִינּוּי, עִנּ׳ I` (numeral I on form
  2, `עִנּ׳`).
  **The numeral sits on a later form**: form 2, `עִנּ׳`, not the cite's
  `עִינּוּי` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:06f4e834`:

```text
<a class="refLink" href="/Jastrow,_עִינּוּי ².1" data-ref="Jastrow, עִינּוּי ² 1"><span dir="rtl">עִינּוּי</span> I</a>
→
<a class="refLink" href="/Jastrow,_עִינּוּי.1" data-ref="Jastrow, עִינּוּי 1"><span dir="rtl">עִינּוּי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 149): the cite's
text reads "עִינּוּי I", Sefaria links P00612 "עִינּוּי, עִנּ׳ II", the
only family member numbered I is P00611 "עִינּוּי, עִנּ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עִינּוּי I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family עִינּוּיָא

#### P00624 · P000688

- **Entry**: P00624 `עִינִּיתָא`, vol. 2, 1072b, leaf 395.
  Entry file: [`data/entries/P/P00624.json`](../../../../../../data/entries/P/P00624.json)
- **Scan crop**: [scan 1072b · leaf 395](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$396/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 395, line 92 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  ^rn3n3?, v. bt^ttt? I.— [Lam. R. to IV, 18 ST'n,'3i3J some
  ```

  The numeral reads `I`: `v. bt^ttt? I.— [Lam. R. to IV, 18`.
- **The cite as Sefaria has it**: `, v. עִינּוּיָא I.—[Lam. R. to IV, 18
  עיניתיה some ed., v…`
  Sefaria links P00614 `עִינּוּיָא, עִנּ׳ II` (numeral II on form 2,
  `עִנּ׳`).
- **The patch's target**: P00613 `עִינּוּיָא, עִנּ׳ I` (numeral I on
  form 2, `עִנּ׳`).
  **The numeral sits on a later form**: form 2, `עִנּ׳`, not the cite's
  `עִינּוּיָא` (form 1); an observation only, see "Numeral on a later
  form" above.
  The target is itself a `ch.` line that carries I (`ch. = עִינּוּי I`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:d70c6ec5`:

```text
<a class="refLink" href="/Jastrow,_עִינּוּיָא ².1" data-ref="Jastrow, עִינּוּיָא ² 1"><span dir="rtl">עִינּוּיָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_עִינּוּיָא.1" data-ref="Jastrow, עִינּוּיָא 1"><span dir="rtl">עִינּוּיָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 109): the cite's
text reads "עִינּוּיָא I", Sefaria links P00614 "עִינּוּיָא, עִנּ׳ II",
the only family member numbered I is P00613 "עִינּוּיָא, עִנּ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `עִינּוּיָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

## Summary

| | count |
|---|---|
| records | 40 |
| entries | 35 |
| families | 12 |
| hOCR line found | 40 |
| of those, the hOCR reads the numeral the cite names | 27 |
| of those, the numeral is misread (`l`, `i`, `L`), fused into the word, or not read | 13 |
| no hOCR line found | 0 |
| the target's numeral sits on a later form than the cite's | 33 |
| a `ch.` line follows the target | 5 (the family סִילּוֹן: O00579, O00661, O01004, R00615, S00964; none a `ch.` entry) |

**The hOCR reads the numeral (27)**: M02410 (P000642), O00088
(P000658), O00090 (P000659), O00160 (P000662, `II`), O00579 (P000664,
`II`), O00661 (P000666, `II`), O00743 (P000668), O00829 (P000670),
O00861 (P000672), O01402 (P000676, P000677), O01610 (P000679,
P000680), P00291 (P000684), P00591 (P000686), P00624 (P000688), P00970
(P000690, P000691), P01522 (P000693, P000694), Q01449 (P000702),
R00615 (P000712, `II`), S00412 (P000721), S01024 (P000724), T00218
(P000737), U01635 (P000770), V00757 (P000787).

**The numeral is not read (13)**: misread as `l` in O00827 (P000669),
as `i` in O00829 (P000671) and as `L` in V00089 (P000778); fused into
the garbled word in O00569 (P000663, `II`), P00573 (P000685), P00613
(P000687), P00871 (P000689), P01021 (P000692) and S00964 (P000723,
`II`); absent from a line located by its neighbours in O00157
(P000661), O00702 (P000667, vowel points only), O00929 (P000673, the
cite word dropped) and O01004 (P000674). Their read is the scan's.

| family | rids | patch ids | leaf(s) | hOCR line found (y/n) |
|---|---|---|---|---|
| סְבַר | O00088, O00090, V00757 | P000658, P000659, P000787 | 275, 275, 1005 | y (reads numeral), y (reads numeral), y (reads numeral) |
| סִיגְנָא | O00157, O00160, O00569, O00929 | P000661, P000662, P000663, P000673 | 278, 278, 299, 315 | y, y (reads numeral), y, y |
| סִידּוּר | P00573 | P000685 | 393 | y |
| סִיכְרָא | O00743 | P000668 | 306 | y (reads numeral) |
| סִילּוֹן | O00579, O00661, O01004, R00615, S00964 | P000664, P000666, P000674, P000712, P000723 | 299, 303, 318, 614, 683 | y (reads numeral), y (reads numeral), y, y (reads numeral), y |
| סִימְטָא | M02410, O00702, V00089 | P000642, P000667, P000778 | 153, 304, 970 | y (reads numeral), y, y |
| סִיפּוּק | O01402, O01402 | P000676, P000677 | 338, 338 | y (reads numeral), y (reads numeral) |
| סִירָה | O00827, O00829, O00829, O00861, O01610, O01610 | P000669, P000670, P000671, P000672, P000679, P000680 | 310, 310, 310, 311, 349, 350 | y, y (reads numeral), y, y (reads numeral), y (reads numeral), y (reads numeral) |
| עוֹנָה | P00291, P01021, P01522, P01522, Q01449, T00218, U01635 | P000684, P000692, P000693, P000694, P000702, P000737, P000770 | 377, 420, 451, 451, 529, 773, 932 | y (reads numeral), y, y (reads numeral), y (reads numeral), y (reads numeral), y (reads numeral), y (reads numeral) |
| עִימְעוּם | P00591, P00871 | P000686, P000689 | 393, 410 | y (reads numeral), y |
| עִינּוּי | P00613, P00970, P00970, S00412, S01024 | P000687, P000690, P000691, P000721, P000724 | 395, 416, 416, 657, 685 | y, y (reads numeral), y (reads numeral), y (reads numeral), y (reads numeral) |
| עִינּוּיָא | P00624 | P000688 | 395 | y (reads numeral) |

The leaf is the hOCR line's; for O00827, O01610's P000680, P00291 and
V00089 it is the leaf after the entry's own, where the cite runs over.

## After the reads

A follow-up commit on this PR sets each record from its tick, removes
`pending`, and changes nothing else in the record unless the read
re-aims it:

- **confirm** → `evidence.kind` `maintainer-read`, with `reader`,
  `date`, `volume` and `leaf` (the leaf of the block's hOCR line),
  e.g. `{"date": "2026-10-31", "kind": "maintainer-read", "leaf": 310,
  "reader": "Brian", "volume": 2}`. Where the hOCR line above reads
  the numeral, it may be quoted in the rationale as well; the `kind`
  stays the read.
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
