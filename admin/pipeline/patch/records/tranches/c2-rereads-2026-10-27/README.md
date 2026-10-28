# C2: cite retargets ח–נ, maintainer re-read (2026-10-27)

Group 3, batch 2 of 12, of
[`docs/review-checklist-2026-10-25.md`](../../../../../../docs/review-checklist-2026-10-25.md):
the 39 pending cite retargets whose family starts with ח–נ, one
maintainer block each. **No patch record, entry or checklist change.**
This directory holds only this README; a later commit applies the reads,
as C1's did ([`c1-rereads-2026-10-27`](../c1-rereads-2026-10-27/README.md),
PR #200).

## Why these 39

Ruling `10-26 patch evidence`
([`docs/decisions.md`](../../../../../../docs/decisions.md)): every
reviewed patch carries `evidence`, and the import refuses a
text-changing patch that stands on Sefaria's text alone unless it is
`pending`. The backfill
([`evidence-backfill-2026-10-26`](../evidence-backfill-2026-10-26/README.md))
left all 39 here as `{"kind": "sefaria-only", "pending": true}`. They
still apply.

All 39 are retargets from
[`cite-retargets-2026-10-15`](../cite-retargets-2026-10-15/README.md)
(PR #178), case 1 of ruling `10-13 correction policy`: the cite's text
(`v. חִיזְרָא I`) is Jastrow's, Sefaria's linker aimed it at a member of
the word's family that lacks the numeral, and the patch re-aims it at
the one member that carries it. No print was read when they were
written. The read turns each into `maintainer-read` (a scan read),
`hOCR` (a Latin-only claim, quoted verbatim) or `jastrow-text`, or
withdraws the patch, or re-aims it (see "After the reads").

## The set

The checklist's predicate, run on
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl) at
`079ef2a2d`:

```bash
P=admin/pipeline/patch/records/reviewed/patches.jsonl
D='def fam: .rationale | capture("cite.s text reads [\"`](?<w>[^\"`]+)[\"`]").w | explode | map(select(. >= 1488 and . <= 1514)) | implode | .[0:1];
def retarget: .evidence.pending and .prompt_version == "cite-retargets-2026-10-15";'
jq -c "$D select(retarget and fam >= \"ח\" and fam <= \"נ\")" $P
```

**39 records over 37 entries, 23 families**, as the checklist's table
says. Two entries hold two records each. N00935 holds P000654 and
P000655, two cites in different senses (`1)` and `—2)`), each applying
on its own. R00130 holds P000705 and P000706, a chained `find ×2` pair
in sense `—2)` (the second applies on the definition the first leaves).
A family is the cite word's consonants (ruling 10-05). The 39 ids below
equal the predicate's output (diffed).

Checked by script on all 39: each is a `replace` whose `payload.find`
and `payload.replace` differ only in the anchor's `href` and
`data-ref`, and whose visible text is the same. `removes` is absent on
all 195 records of `cite-retargets-2026-10-15` (135 of them still
pending), so every block's **Removes** line says none.

## How to read a block

Each block gives the entry, the scan link at the leaf the page index
([`data/page-index/`](../../../../../../data/page-index/README.md))
gives it, and the hOCR line that holds the cite, first. The proposal
is last and collapsed. Read the print, then tick **one** box and write
what print shows on the `Read:` line. A block with both boxes ticked
goes back to the reader
([`DESIGN.md` §5 "Patch process"](../../../../DESIGN.md#patch-process)).

**What the hOCR can witness.** Latin text, numerals, punctuation and
position only, never a Hebrew reading
([`DESIGN.md` §5 "Patch evidence"](../../../../DESIGN.md#patch-evidence)).
The Roman numeral after the cite word is Latin, so the hOCR can witness
it; the Hebrew word before it needs the scan. Vol. 1's hOCR (Tesseract
`heb+eng`) garbles Hebrew and often mirrors it; vol. 2's (ABBYY 8)
holds no Hebrew character at all. **Every quoted line's Hebrew is
garbled**; this is not repeated per block. Each quoted line is copied
by script from `leafLines` (`admin/pipeline/patch/hocr.ts`), invisible
bidi marks included; the note under it quotes fragments with those
marks dropped. Where the hOCR reads the numeral as `1`, `l`, `L` or a
lower-case `i`, fuses it into the garbled word, or does not read it at
all, that is the OCR's reading: the scan decides. Where the hOCR and
the scan read disagree, a second read is needed.

**The `ch.` rule (10-15).** A cite that reads `X N ch.` names the
`ch.` line print sets after `X N`, not `X N` itself. None of the 39
cites is followed by `ch.` in the entry as it stands (checked by
script). Note it on the `Read:` line if print shows one; that is a
withdraw, or a re-aim at the `ch.` line. In C1 the maintainer also
re-aimed two cites with no `ch.` at the `ch.` line because the citing
line is Aramaic (B01237 and N00106 → B01153). Here, of the 23 targets
only H01764 `חָרַר I` has a `ch.` line after it (H01765 `חֲרַר`, checked
by script), and its one citing line, H01653's, is Hebrew; that block
names it. Nine citing entries are themselves `ch.` (Aramaic) entries
(K00759, N00704, N00935, N01042, N01346, S00151, S01841, S02103,
U01871), but none of their targets has a `ch.` line after it.

**Numeral on a later form.** A target's numeral can sit on a later
form of its head line than the one the cite spells: H00701 `חִיזְרָא,
חִזְ׳ I` carries I on `חִזְ׳`, while the cite reads `חִיזְרָא I`.
Print's
numeral numbers the consonant sequence it follows (ruling 10-05), so if
print sets it after the later form only, the cite is Jastrow's own text
naming the earlier form as I, and the maintainer may want a reform
giving that form the numeral (10-13 case 2), as P000940 (A02412
`אִסְטְרַטְיָא, אִיסְ׳ I`) and P000941 (B00049) did in C1. **34 of the
39
blocks** are of this shape (all but G00734, M02691, H01653, R00805 and
V00547); each says so under "The patch's target". The read can say,
for the target's head line, whether print sets the numeral beside the
cited form too; a reform is a separate record and not part of the
confirm.

**Conventions in the blocks.** A headword is the entry's `display`
with its forms filled in; "numeral I on form 2" names the form that
carries it, which is often not the cite's spelling (the audit's
`match`). "The cite as Sefaria has it" is `expected_before` with tags
stripped, cut to about 60 characters before the cite and 40 after; the
whole entry is in the entry file. IIIF's `$n` is leaf `n − 1`, so leaf
`L` links as `$L+1`
([`data/page-index/README.md`](../../../../../../data/page-index/README.md),
"Scan coordinates").

## Reading order

The checklist asks a batch to read first the members in a family a
homograph reform touched (the patches agent's `stale.py`), then the
rest. `stale.py` is not in the repository, and its counts (284
retargets, 63 touched) are over a population other than these, so that
split cannot be reproduced here. The blocks are in family order (the
family's consonants), then rid; within R00130, patch order.

What the reviewed records do show: none of the 23 families has a
reviewed patch on any member, `reform` or other (checked by script on
every entry whose headword consonants match a family's; the same
script finds C1's P000290, P000321 and P000940). No block carries a
reform note.

## The blocks

### Family חִדְקָא

#### H00210 · P000623

- **Entry**: H00210 `חִדְקָאָה`, vol. 1, 427a, leaf 450.
  Entry file: [`data/entries/H/H00210.json`](../../../../../../data/entries/H/H00210.json)
- **Scan crop**: [scan 427a · leaf 450](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$451/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 450, line 73 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  im. (derisive denominative of REI) de-
  ```

  The parenthesis reads `(derisive denominative of REI)`; any `I` is
  fused into the garbled word. No separate `I` is read.
- **The cite as Sefaria has it**: `(derisive denominative of חִדְקָא I)
  descendant of a thorny race. Erub. 101…`
  Sefaria links H00209 `חִדְקָא, חִי׳ II` (numeral II on form 2,
  `חִי׳`).
- **The patch's target**: H00208 `חִדְקָא, חִידְ׳ I` (numeral I on form
  2, `חִידְ׳`).
  **The numeral sits on a later form**: form 2, `חִידְ׳`, not the cite's
  `חִדְקָא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:d2c5f144`:

```text
<a class="refLink" href="/Jastrow,_חִדְקָא ².1" data-ref="Jastrow, חִדְקָא ² 1"><span dir="rtl">חִדְקָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_חִדְקָא.1" data-ref="Jastrow, חִדְקָא 1"><span dir="rtl">חִדְקָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 38): the cite's
text reads "חִדְקָא I", Sefaria links H00209 "חִדְקָא, חִי׳ II", the
only family member numbered I is H00208 "חִדְקָא, חִידְ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `חִדְקָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family חִיזְרָא

#### C00041 · P000611

- **Entry**: C00041 `גְּבָבָא`, vol. 1, 204a, leaf 227.
  Entry file: [`data/entries/C/C00041.json`](../../../../../../data/entries/C/C00041.json)
- **Scan crop**: [scan 204a · leaf 227](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$228/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 227, line 77 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  wool &. Ib. 8%, v. NIM —Pl. "235. Gitt. 68.‏
  ```

  The cite sits between `Ib. 8%, v.` and `—Pl.`; it reads `NIM`, with no
  numeral after it. No `I` is read.
- **The cite as Sefaria has it**: `…ג׳ דע׳ חיורא between a lump of white
  wool &c. Ib. 8ᵃ, v. חִיזְרָא I.—Pl. גְּבָבֵי. Gitt. 68ᵃ`
  Sefaria links H00702 `חִיזְרָא, חִזְ׳ II` (numeral II on form 2,
  `חִזְ׳`).
- **The patch's target**: H00701 `חִיזְרָא, חִזְ׳ I` (numeral I on form
  2, `חִזְ׳`).
  **The numeral sits on a later form**: form 2, `חִזְ׳`, not the cite's
  `חִיזְרָא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:d20efc8d`:

```text
<a class="refLink" href="/Jastrow,_חִיזְרָא ².1" data-ref="Jastrow, חִיזְרָא ² 1"><span dir="rtl">חִיזְרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_חִיזְרָא.1" data-ref="Jastrow, חִיזְרָא 1"><span dir="rtl">חִיזְרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 25): the cite's
text reads "חִיזְרָא I", Sefaria links H00702 "חִיזְרָא, חִזְ׳ II", the
only family member numbered I is H00701 "חִיזְרָא, חִזְ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `חִיזְרָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### H00878 · P000625

- **Entry**: H00878 `חִירְזָא, חִרְזָא`, vol. 1, 460a, leaf 483.
  Entry file: [`data/entries/H/H00878.json`](../../../../../../data/entries/H/H00878.json)
- **Scan crop**: [scan 460a · leaf 483](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$484/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 483, line 93 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  hedges. B. Mets. 103 Ar. Var., v. SIDI.‏
  ```

  The cite reads `v. SIDI.`; any `I` is fused into the garbled word. No
  separate `I` is read.
- **The cite as Sefaria has it**: `…a thorny shrub used for hedges. B.
  Mets. 103ᵇ Ar. Var., v. חִיזְרָא I.`
  Sefaria links H00702 `חִיזְרָא, חִזְ׳ II` (numeral II on form 2,
  `חִזְ׳`).
- **The patch's target**: H00701 `חִיזְרָא, חִזְ׳ I` (numeral I on form
  2, `חִזְ׳`).
  **The numeral sits on a later form**: form 2, `חִזְ׳`, not the cite's
  `חִיזְרָא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:40a3213a`:

```text
<a class="refLink" href="/Jastrow,_חִיזְרָא ².1" data-ref="Jastrow, חִיזְרָא ² 1"><span dir="rtl">חִיזְרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_חִיזְרָא.1" data-ref="Jastrow, חִיזְרָא 1"><span dir="rtl">חִיזְרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 40): the cite's
text reads "חִיזְרָא I", Sefaria links H00702 "חִיזְרָא, חִזְ׳ II", the
only family member numbered I is H00701 "חִיזְרָא, חִזְ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `חִיזְרָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### N01346 · P000657

- **Entry**: N01346 `נְשַׁר I`, vol. 2, 942b, leaf 265.
  Entry file: [`data/entries/N/N01346.json`](../../../../../../data/entries/N/N01346.json)
- **Scan crop**: [scan 942b · leaf 265](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$266/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 265, line 71 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  backwards (when you attempt to pull it out), v. N11nn I.
  ```

  The numeral reads `I`: `pull it out), v. N11nn I.`
- **The cite as Sefaria has it**: `…which tears backwards (when you
  attempt to pull it out), v. חִיזְרָא I.`
  Sefaria links H00702 `חִיזְרָא, חִזְ׳ II` (numeral II on form 2,
  `חִזְ׳`).
- **The patch's target**: H00701 `חִיזְרָא, חִזְ׳ I` (numeral I on form
  2, `חִזְ׳`).
  **The numeral sits on a later form**: form 2, `חִזְ׳`, not the cite's
  `חִיזְרָא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:78cbcfea`:

```text
<a class="refLink" href="/Jastrow,_חִיזְרָא ².1" data-ref="Jastrow, חִיזְרָא ² 1"><span dir="rtl">חִיזְרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_חִיזְרָא.1" data-ref="Jastrow, חִיזְרָא 1"><span dir="rtl">חִיזְרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 77): the cite's
text reads "חִיזְרָא I", Sefaria links H00702 "חִיזְרָא, חִזְ׳ II", the
only family member numbered I is H00701 "חִיזְרָא, חִזְ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `חִיזְרָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### O00658 · P000665

- **Entry**: O00658 `סִילּוֹן I`, vol. 2, 979b, leaf 302.
  Entry file: [`data/entries/O/O00658.json`](../../../../../../data/entries/O/O00658.json)
- **Scan crop**: [scan 979b · leaf 302](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$303/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 302, line 82 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  (in the direction opposite to that of its knots, v. K'npri I) ;
  ```

  The numeral reads `I`: `its knots, v. K'npri I)`.
- **The cite as Sefaria has it**: `…(in the direction opposite to that
  of its knots, v. חִיזְרָא I); Lev. R. s. 4 כסִילָּן.—[Midr. Till. t…`
  Sefaria links H00702 `חִיזְרָא, חִזְ׳ II` (numeral II on form 2,
  `חִזְ׳`).
- **The patch's target**: H00701 `חִיזְרָא, חִזְ׳ I` (numeral I on form
  2, `חִזְ׳`).
  **The numeral sits on a later form**: form 2, `חִזְ׳`, not the cite's
  `חִיזְרָא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:65e96d7a`:

```text
<a class="refLink" href="/Jastrow,_חִיזְרָא ².1" data-ref="Jastrow, חִיזְרָא ² 1"><span dir="rtl">חִיזְרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_חִיזְרָא.1" data-ref="Jastrow, חִיזְרָא 1"><span dir="rtl">חִיזְרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 86): the cite's
text reads "חִיזְרָא I", Sefaria links H00702 "חִיזְרָא, חִזְ׳ II", the
only family member numbered I is H00701 "חִיזְרָא, חִזְ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `חִיזְרָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### U01871 · P000773

- **Entry**: U01871 `שְׁקַל`, vol. 2, 1623b, leaf 946.
  Entry file: [`data/entries/U/U01871.json`](../../../../../../data/entries/U/U01871.json)
- **Scan crop**: [scan 1623b · leaf 946](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$947/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 946, line 81 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  take thy goodness), v. XiTin I ; a. e.— 2) to carry. Men. 85*;
  ```

  The numeral reads `I`: `take thy goodness), v. XiTin I ;`. Line 80's
  `XSp? I.` is the cite before it (`נִיבָא I`), not this one.
- **The cite as Sefaria has it**: `…(not שקולא; better: שְׁקוֹלִי וכ׳
  take thy goodness), v. חִיזְרָא I; a. e.`
  Sefaria links H00702 `חִיזְרָא, חִזְ׳ II` (numeral II on form 2,
  `חִזְ׳`).
- **The patch's target**: H00701 `חִיזְרָא, חִזְ׳ I` (numeral I on form
  2, `חִזְ׳`).
  **The numeral sits on a later form**: form 2, `חִזְ׳`, not the cite's
  `חִיזְרָא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:9fd88a21`:

```text
<a class="refLink" href="/Jastrow,_חִיזְרָא ².1" data-ref="Jastrow, חִיזְרָא ² 1"><span dir="rtl">חִיזְרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_חִיזְרָא.1" data-ref="Jastrow, חִיזְרָא 1"><span dir="rtl">חִיזְרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 203): the cite's
text reads "חִיזְרָא I", Sefaria links H00702 "חִיזְרָא, חִזְ׳ II", the
only family member numbered I is H00701 "חִיזְרָא, חִזְ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `חִיזְרָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family חִסְדָּא

#### H01341 · P000628

- **Entry**: H01341 `חִסְדָּאָה`, vol. 1, 486b, leaf 509.
  Entry file: [`data/entries/H/H01341.json`](../../../../../../data/entries/H/H01341.json)
- **Scan crop**: [scan 486b · leaf 509](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$510/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 509, line 5 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  ANION .מז‎ (denom. of חִסְדָא‎ I) kind, ופקות‎
  ```

  The numeral reads `I`: `(denom. of חִסְדָא I) kind,`.
- **The cite as Sefaria has it**: `(denom. of חִסְדָּא I) kind,
  pleasing.—Pl. חִסְדָּאִין. Gitt.…`
  Sefaria links H01340 `חִסְדָּא, חִי׳ III` (numeral III on form 2,
  `חִי׳`).
- **The patch's target**: H01338 `חֶסֶד, חִסְדָּא, חִיסְ׳ I` (numeral I
  on form 3, `חִיסְ׳`).
  **The numeral sits on a later form**: form 3, `חִיסְ׳`, not the cite's
  `חִסְדָּא` (form 2); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:3b362fc4`:

```text
<a class="refLink" href="/Jastrow,_חִסְדָּא ².1" data-ref="Jastrow, חִסְדָּא ² 1"><span dir="rtl">חִסְדָּא</span> I</a>
→
<a class="refLink" href="/Jastrow,_חֶסֶד ².1" data-ref="Jastrow, חֶסֶד ² 1"><span dir="rtl">חִסְדָּא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 43): the cite's
text reads "חִסְדָּא I", Sefaria links H01340 "חִסְדָּא, חִי׳ III", the
only family member numbered I is H01338 "חֶסֶד, חִסְדָּא, חִיסְ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `חִסְדָּא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family חֲרוּבָא

#### S01841 · P000732

- **Entry**: S01841 `קְצָצִין`, vol. 2, 1408a, leaf 731.
  Entry file: [`data/entries/S/S01841.json`](../../../../../../data/entries/S/S01841.json)
- **Scan crop**: [scan 1408a · leaf 731](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$732/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 731, lines 24–25 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  *pZS(5 cb. same, capsules, pods. T.KU.1,27" fiSty,
  v. mufpr; i.
  ```

  Line 24 is the entry's head and its Y. Kil. reference (`cb. same,
  capsules, pods.`); line 25 is the cite, `v. mufpr; i.`, the numeral as
  a lower-case `i`. No `I` is read.
- **The cite as Sefaria has it**: `, capsules, pods. Y. Kil. I, 27ᵃ
  קְצָצוֹי, v. חֲרוּבָא I.`
  Sefaria links H01614 `חֲרוּבָא, חֲרוּבָה II, כפר ח׳` (numeral II on
  form 2, `חֲרוּבָה`).
- **The patch's target**: H01613 `חֲרוּבָא, חֲרוּבָה I` (numeral I on
  form 2, `חֲרוּבָה`).
  **The numeral sits on a later form**: form 2, `חֲרוּבָה`, not the
  cite's `חֲרוּבָא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:b8f35d49`:

```text
<a class="refLink" href="/Jastrow,_חֲרוּבָא ².1" data-ref="Jastrow, חֲרוּבָא ² 1"><span dir="rtl">חֲרוּבָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_חֲרוּבָא.1" data-ref="Jastrow, חֲרוּבָא 1"><span dir="rtl">חֲרוּבָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 160): the cite's
text reads "חֲרוּבָא I", Sefaria links H01614 "חֲרוּבָא, חֲרוּבָה II,
כפר ח׳", the only family member numbered I is H01613 "חֲרוּבָא, חֲרוּבָה
I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `חֲרוּבָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### V01117 · P000790

- **Entry**: V01117 `תְּתוּבָא, תְּתוּבָה`, vol. 2, 1705b, leaf 1028.
  Entry file: [`data/entries/V/V01117.json`](../../../../../../data/entries/V/V01117.json)
- **Scan crop**: [scan 1705b · leaf 1028](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1029/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 1028, line 85 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  a.fr.— Lev. R.s. 35, v. Sannl; ib.s.13; Yalk. la. 256; a. e.
  ```

  The numeral reads `l`, fused to the cite word: `Lev. R.s. 35, v.
  Sannl;`. No `I` is read.
- **The cite as Sefaria has it**: `…XC, 2. Targ. II Chr. XXXIII, 13; a.
  fr.—Lev. R. s. 35, v. חֲרוּבָא I; ib. s. 13; Yalk. Is. 256; a. e.`
  Sefaria links H01614 `חֲרוּבָא, חֲרוּבָה II, כפר ח׳` (numeral II on
  form 2, `חֲרוּבָה`).
- **The patch's target**: H01613 `חֲרוּבָא, חֲרוּבָה I` (numeral I on
  form 2, `חֲרוּבָה`).
  **The numeral sits on a later form**: form 2, `חֲרוּבָה`, not the
  cite's `חֲרוּבָא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:0025a579`:

```text
<a class="refLink" href="/Jastrow,_חֲרוּבָא ².1" data-ref="Jastrow, חֲרוּבָא ² 1"><span dir="rtl">חֲרוּבָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_חֲרוּבָא.1" data-ref="Jastrow, חֲרוּבָא 1"><span dir="rtl">חֲרוּבָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 222): the cite's
text reads "חֲרוּבָא I", Sefaria links H01614 "חֲרוּבָא, חֲרוּבָה II,
כפר ח׳", the only family member numbered I is H01613 "חֲרוּבָא, חֲרוּבָה
I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `חֲרוּבָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family חָרַר

#### H01653 · P000629

- **Entry**: H01653 `חַרְחוֹר`, vol. 1, 501a, leaf 524.
  Entry file: [`data/entries/H/H01653.json`](../../../../../../data/entries/H/H01653.json)
- **Scan crop**: [scan 501a · leaf 524](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$525/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 524, line 73 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  v. “7 1) [point of a‏ חור m. creduptie. of‏ ו
  ```

  The parenthesis is mirrored; the cite reads `v. “7 1)`, the numeral as
  the digit `1`. No `I` is read.
- **The cite as Sefaria has it**: `(reduplic. of חור, v. חָרַר I) [point
  of a lance, v. Maim. to Kel. XI…`
  Sefaria links H01770 `חָרַר IV` (numeral IV on form 1, `חָרַר`).
- **The patch's target**: H01764 `חָרַר I` (numeral I on form 1,
  `חָרַר`).
  **The family has a `ch.` line after the target** (10-15): H01765
  `חֲרַר` (`ch. same, to perforate.—Part. pa…`). The citing line is
  Hebrew (the Mishnah of Kel. XIII, 3), not Aramaic, so 10-15 does not
  point the cite there; it is named only so the read can rule it out.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:7bfce193`:

```text
<a class="refLink" href="/Jastrow,_חָרַר IV.1" data-ref="Jastrow, חָרַר IV 1"><span dir="rtl">חָרַר</span> I</a>
→
<a class="refLink" href="/Jastrow,_חָרַר I.1" data-ref="Jastrow, חָרַר I 1"><span dir="rtl">חָרַר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 45): the cite's
text reads "חָרַר I", Sefaria links H01770 "חָרַר IV", the only family
member numbered I is H01764 "חָרַר I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `חָרַר I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family חֲשַׁךְ

#### S00151 · P000719

- **Entry**: S00151 `קְדַם`, vol. 2, 1316b, leaf 639.
  Entry file: [`data/entries/S/S00151.json`](../../../../../../data/entries/S/S00151.json)
- **Scan crop**: [scan 1316b · leaf 639](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$640/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 639, line 94 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  XIX, 2; a. fr.— Ber. 8a '31 W&i; WWfl W^lfe ▼. "'^" I-
  ```

  The numeral reads `I`, with a stray `-` after it: `W^lfe ▼. "'^" I-`.
  Line 95's `v. T^n I` is the next cite (Sefaria's `הֲשַׁךְ I`), not
  this one.
- **The cite as Sefaria has it**: `…XIX, 2; a. fr.—Ber. 8ᵃ מְקַדְּמֵי
  וכ׳; קַדִּימוּ וחשיכו, v. חֲשַׁךְ I. Tam. 27ᵇ וקַדֵּים וכ׳, v. הֲשַׁךְ
  I; a…`
  Sefaria links H01849 `חֲשַׁךְ, חֲשׁוֹךְ II` (numeral II on form 2,
  `חֲשׁוֹךְ`).
- **The patch's target**: H01848 `חֲשַׁךְ, חֲשׁוֹךְ I` (numeral I on
  form 2, `חֲשׁוֹךְ`).
  **The numeral sits on a later form**: form 2, `חֲשׁוֹךְ`, not the
  cite's `חֲשַׁךְ` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:9ee1b9ef`:

```text
<a class="refLink" href="/Jastrow,_חֲשַׁךְ ².1" data-ref="Jastrow, חֲשַׁךְ ² 1"><span dir="rtl">חֲשַׁךְ</span> I</a>
→
<a class="refLink" href="/Jastrow,_חֲשַׁךְ.1" data-ref="Jastrow, חֲשַׁךְ 1"><span dir="rtl">חֲשַׁךְ</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 141): the cite's
text reads "חֲשַׁךְ I", Sefaria links H01849 "חֲשַׁךְ, חֲשׁוֹךְ II", the
only family member numbered I is H01848 "חֲשַׁךְ, חֲשׁוֹךְ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `חֲשַׁךְ I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family יִתְרָא

#### J00739 · P000630

- **Entry**: J00739 `יְתֵירָא`, vol. 1, 604a, leaf 627.
  Entry file: [`data/entries/J/J00739.json`](../../../../../../data/entries/J/J00739.json)
- **Scan crop**: [scan 604a · leaf 627](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$628/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 627, line 95 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  NT m, cord, y. Sint 1‏
  ```

  The line reads `cord, y. Sint 1`, `y.` the OCR's `v.` and the numeral
  as the digit `1`. No `I` is read.
- **The cite as Sefaria has it**: `cord, v. יִתְרָא I.`
  Sefaria links J00752 `יִתְרָא II` (numeral II on form 1, `יִתְרָא`).
- **The patch's target**: J00751 `יִתְרָא, יִי׳ I` (numeral I on form 2,
  `יִי׳`).
  **The numeral sits on a later form**: form 2, `יִי׳`, not the cite's
  `יִתְרָא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:05a9acf4`:

```text
<a class="refLink" href="/Jastrow,_יִתְרָא II.1" data-ref="Jastrow, יִתְרָא II 1"><span dir="rtl">יִתְרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_יִתְרָא.1" data-ref="Jastrow, יִתְרָא 1"><span dir="rtl">יִתְרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 46): the cite's
text reads "יִתְרָא I", Sefaria links J00752 "יִתְרָא II", the only
family member numbered I is J00751 "יִתְרָא, יִי׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `יִתְרָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### J00746 · P000631

- **Entry**: J00746 `יָתַר`, vol. 1, 604b, leaf 627.
  Entry file: [`data/entries/J/J00746.json`](../../../../../../data/entries/J/J00746.json)
- **Scan crop**: [scan 604b · leaf 627](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$628/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 627, line 14 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  cord, v. Ron i] to be rich, plentiful. ;‏
  ```

  The cite reads `cord, v. Ron i]`, the numeral as a lower-case `i`. No
  `I` is read.
- **The cite as Sefaria has it**: `[to be strong; denom. יֶתֶר cord, v.
  יִתְרָא I,] to be rich, plentiful.`
  Sefaria links J00752 `יִתְרָא II` (numeral II on form 1, `יִתְרָא`).
- **The patch's target**: J00751 `יִתְרָא, יִי׳ I` (numeral I on form 2,
  `יִי׳`).
  **The numeral sits on a later form**: form 2, `יִי׳`, not the cite's
  `יִתְרָא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:fd6f1efe`:

```text
<a class="refLink" href="/Jastrow,_יִתְרָא II.1" data-ref="Jastrow, יִתְרָא II 1"><span dir="rtl">יִתְרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_יִתְרָא.1" data-ref="Jastrow, יִתְרָא 1"><span dir="rtl">יִתְרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 47): the cite's
text reads "יִתְרָא I", Sefaria links J00752 "יִתְרָא II", the only
family member numbered I is J00751 "יִתְרָא, יִי׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `יִתְרָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### L00204 · P000635

- **Entry**: L00204 `לוּדְקְיָא`, vol. 2, 695a, leaf 18.
  Entry file: [`data/entries/L/L00204.json`](../../../../../../data/entries/L/L00204.json)
- **Scan crop**: [scan 695a · leaf 18](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$19/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 18, line 49 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  (v. i:ib). M.Kat.26a, v. SW}I. B.Mets. 84a, v. p"}S. Y.Ab.
  ```

  The cite reads `M.Kat.26a, v. SW}I.`; the `I` is fused into the
  garbled word, so no separate `I` is read.
- **The cite as Sefaria has it**: `…of Asia Minor, counted to Lydia (v.
  לוּד). M. Kat. 26ᵃ, v. יִתְרָא I. B. Mets. 84ᵃ, v. עֲרַק. Y. Ab. Zar.
  II…`
  Sefaria links J00752 `יִתְרָא II` (numeral II on form 1, `יִתְרָא`).
- **The patch's target**: J00751 `יִתְרָא, יִי׳ I` (numeral I on form 2,
  `יִי׳`).
  **The numeral sits on a later form**: form 2, `יִי׳`, not the cite's
  `יִתְרָא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:fb5ecddd`:

```text
<a class="refLink" href="/Jastrow,_יִתְרָא II.1" data-ref="Jastrow, יִתְרָא II 1"><span dir="rtl">יִתְרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_יִתְרָא.1" data-ref="Jastrow, יִתְרָא 1"><span dir="rtl">יִתְרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 52): the cite's
text reads "יִתְרָא I", Sefaria links J00752 "יִתְרָא II", the only
family member numbered I is J00751 "יִתְרָא, יִי׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `יִתְרָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family כָּהֵן

#### K00162 · P000632

- **Entry**: K00162 `כָּהֵין`, vol. 1, 615a, leaf 638.
  Entry file: [`data/entries/K/K00162.json`](../../../../../../data/entries/K/K00162.json)
- **Scan crop**: [scan 615a · leaf 638](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$639/full/1400,/0/default.jpg)
- **hOCR**: no line found for this cite on leaf 638 (searched 638, the
  entry's only leaf); scan read required.
  The entry is a one-line cross-reference in 615a. Between K00158's
  lines (86–87) and K00163's first line (89) the hOCR sets only line 88,
  where print sets four short entries, K00159 to K00162; line 88 holds
  the Latin of none of them, and no other line on the leaf can be tied
  to K00162.
- **The cite as Sefaria has it**: `, v. כָּהֵן I`
  Sefaria links K00166 `כָּהֵן` (no numeral on any form).
- **The patch's target**: K00165 `כָּהֵן, כָּהֵין, כַּהֲנָא I` (numeral
  I on form 3, `כַּהֲנָא`).
  **The numeral sits on a later form**: form 3, `כַּהֲנָא`, not the
  cite's `כָּהֵן` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:901a4dfc`:

```text
<a class="refLink" href="/Jastrow,_כָּהֵן ².1" data-ref="Jastrow, כָּהֵן ² 1"><span dir="rtl">כָּהֵן</span> I</a>
→
<a class="refLink" href="/Jastrow,_כָּהֵן.1" data-ref="Jastrow, כָּהֵן 1"><span dir="rtl">כָּהֵן</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 48): the cite's
text reads "כָּהֵן I", Sefaria links K00166 "כָּהֵן", the only family
member numbered I is K00165 "כָּהֵן, כָּהֵין, כַּהֲנָא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `כָּהֵן I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### K00171 · P000633

- **Entry**: K00171 `כַּהַנְתָּא`, vol. 1, 615b, leaf 638.
  Entry file: [`data/entries/K/K00171.json`](../../../../../../data/entries/K/K00171.json)
- **Scan crop**: [scan 615b · leaf 638](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$639/full/1400,/0/default.jpg)
- **hOCR**: no line found for this cite on leaf 638 (searched 638, the
  entry's only leaf); scan read required.
  The entry is a one-line cross-reference in 615b. Lines 41–45 are five
  short lines after K00169 (which ends on line 40), where print sets
  K00170 to K00174, five cross-references with little Latin beyond `v.`;
  their Hebrew is garbled and none reads a Roman numeral. By order line
  42 would be K00171's, but nothing on it ties it to this cite, so the
  hOCR witnesses nothing here.
- **The cite as Sefaria has it**: `, v. כָּהֵן I`
  Sefaria links K00166 `כָּהֵן` (no numeral on any form).
- **The patch's target**: K00165 `כָּהֵן, כָּהֵין, כַּהֲנָא I` (numeral
  I on form 3, `כַּהֲנָא`).
  **The numeral sits on a later form**: form 3, `כַּהֲנָא`, not the
  cite's `כָּהֵן` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:901a4dfc`:

```text
<a class="refLink" href="/Jastrow,_כָּהֵן ².1" data-ref="Jastrow, כָּהֵן ² 1"><span dir="rtl">כָּהֵן</span> I</a>
→
<a class="refLink" href="/Jastrow,_כָּהֵן.1" data-ref="Jastrow, כָּהֵן 1"><span dir="rtl">כָּהֵן</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 49): the cite's
text reads "כָּהֵן I", Sefaria links K00166 "כָּהֵן", the only family
member numbered I is K00165 "כָּהֵן, כָּהֵין, כַּהֲנָא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `כָּהֵן I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family כְּלֵי

#### K00759 · P000634

- **Entry**: K00759 `כְּלַל`, vol. 1, 644a, leaf 667.
  Entry file: [`data/entries/K/K00759.json`](../../../../../../data/entries/K/K00759.json)
- **Scan crop**: [scan 644a · leaf 667](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$668/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 667, line 105 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  0111,4; a. e.—[Kidd. 81% ,מכלליה‎ read : לחו‎ "b>, v. "b2 L.]
  ```

  The bracket ends `v. "b2 L.]`, the numeral as `L`. No `I` is read.
- **The cite as Sefaria has it**: `…Ib. CIII, 4; a. e.—[Kidd. 81ᵇ
  מכלליה, read: מכלי להו, v. כְּלֵי I.]`
  Sefaria links K00717 `כְּלֵי, כְּלָא II` (numeral II on form 2,
  `כְּלָא`).
- **The patch's target**: K00716 `כְּלֵי, כְּלָא I` (numeral I on form
  2, `כְּלָא`).
  **The numeral sits on a later form**: form 2, `כְּלָא`, not the cite's
  `כְּלֵי` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:1f8fb7df`:

```text
<a class="refLink" href="/Jastrow,_כְּלֵי ².1" data-ref="Jastrow, כְּלֵי ² 1"><span dir="rtl">כְּלֵי</span> I</a>
→
<a class="refLink" href="/Jastrow,_כְּלֵי.1" data-ref="Jastrow, כְּלֵי 1"><span dir="rtl">כְּלֵי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 50): the cite's
text reads "כְּלֵי I", Sefaria links K00717 "כְּלֵי, כְּלָא II", the
only family member numbered I is K00716 "כְּלֵי, כְּלָא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `כְּלֵי I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### S02103 · P000735

- **Entry**: S02103 `קְרַן II, קֶרֶן, קַרְנָא I`, vol. 2, 1422b, leaf
  745; continues onto 1423a (leaf 746).
  Entry file: [`data/entries/S/S02103.json`](../../../../../../data/entries/S/S02103.json)
- **Scan crop**: [scan 1422b · leaf 745](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$746/full/1400,/0/default.jpg) · [scan 1423a · leaf 746](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$747/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 746, line 15 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  79a; B. Kam. 3a, v. i]?3l. Y. M. Kat. II, 81b top 'pi S03X
  ```

  On p. 1423a, the entry's second page. The numeral reads `l`, fused to
  the cite word: `B. Kam. 3a, v. i]?3l.`. No `I` is read.
- **The cite as Sefaria has it**: `principal, stock. B. Mets. 79ᵃ; B.
  Kam. 3ᵃ, v. כְּלֵי I. Y. M. Kat. II, 81ᵇ top אגרא וק׳ קרן הו…`
  Sefaria links K00717 `כְּלֵי, כְּלָא II` (numeral II on form 2,
  `כְּלָא`).
- **The patch's target**: K00716 `כְּלֵי, כְּלָא I` (numeral I on form
  2, `כְּלָא`).
  **The numeral sits on a later form**: form 2, `כְּלָא`, not the cite's
  `כְּלֵי` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—4)]:0aee606b`:

```text
<a class="refLink" href="/Jastrow,_כְּלֵי ².1" data-ref="Jastrow, כְּלֵי ² 1"><span dir="rtl">כְּלֵי</span> I</a>
→
<a class="refLink" href="/Jastrow,_כְּלֵי.1" data-ref="Jastrow, כְּלֵי 1"><span dir="rtl">כְּלֵי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 163): the cite's
text reads "כְּלֵי I", Sefaria links K00717 "כְּלֵי, כְּלָא II", the
only family member numbered I is K00716 "כְּלֵי, כְּלָא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `כְּלֵי I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family כִּנָּרָא

#### M03062 · P000645

- **Entry**: M03062 `מְתִיק, מְתִיקָא`, vol. 2, 862a, leaf 185.
  Entry file: [`data/entries/M/M03062.json`](../../../../../../data/entries/M/M03062.json)
- **Scan crop**: [scan 862a · leaf 185](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$186/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 185, lines 25–26 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  "iP/na. Targ. Cant. II, 5 (ed. Amst. ^rra).— Meg. 6a, v.
  K1S3I.
  ```

  Line 25 ends `Meg. 6a, v.`; line 26 is the cite alone, `K1S3I.`. The
  `I` is fused into the garbled word, so no separate `I` is read.
- **The cite as Sefaria has it**: `…Targ. Cant. II, 5 (ed. Amst.
  מַתִּיקָן).—Meg. 6ᵃ, v. כִּנָּרָא I.`
  Sefaria links K00877 `כִּנְּרָא, כִּנָּרָא II` (numeral II on form 2,
  `כִּנָּרָא`).
- **The patch's target**: K00876 `כִּנָּרָא, כִּי׳ I` (numeral I on form
  2, `כִּי׳`).
  **The numeral sits on a later form**: form 2, `כִּי׳`, not the cite's
  `כִּנָּרָא` (form 1); see "Numeral on a later form" above.
  The proposal's two anchors look alike but differ in the nun's vowel:
  `href` and `data-ref` move from K00877's link key `כִּנְּרָא` (sheva)
  to K00876's `כִּנָּרָא` (qamats) (ruling `10-09 link key`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:4a60cec7`:

```text
<a class="refLink" href="/Jastrow,_כִּנְּרָא.1" data-ref="Jastrow, כִּנְּרָא 1"><span dir="rtl">כִּנָּרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_כִּנָּרָא.1" data-ref="Jastrow, כִּנָּרָא 1"><span dir="rtl">כִּנָּרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 65): the cite's
text reads "כִּנָּרָא I", Sefaria links K00877 "כִּנְּרָא, כִּנָּרָא
II", the only family member numbered I is K00876 "כִּנָּרָא, כִּי׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `כִּנָּרָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family לוּז

#### V00547 · P000783

- **Entry**: V00547 `תְּכֵלֶת`, vol. 2, 1668b, leaf 991; continues onto
  1669a (leaf 992).
  Entry file: [`data/entries/V/V00547.json`](../../../../../../data/entries/V/V00547.json)
- **Scan crop**: [scan 1668b · leaf 991](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$992/full/1400,/0/default.jpg) · [scan 1669a · leaf 992](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$993/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 991, line 109 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  the city of Luz where they dye the fkheleth (v. tlV I).
  ```

  The numeral reads `I`: `(v. tlV I).`
- **The cite as Sefaria has it**: `…ת׳ that is the city of Luz where
  they dye the t’kheleth (v. לוּז I). Men. IV, 1, v. עָכַב. Ib. 38ᵃ מצוה
  ……`
  Sefaria links L00229 `לוּז IV` (numeral IV on form 1, `לוּז`).
- **The patch's target**: L00225 `לוּז I` (numeral I on form 1, `לוּז`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:f225b25d`:

```text
<a class="refLink" href="/Jastrow,_לוּז IV.1" data-ref="Jastrow, לוּז IV 1"><span dir="rtl">לוּז</span> I</a>
→
<a class="refLink" href="/Jastrow,_לוּז I.1" data-ref="Jastrow, לוּז I 1"><span dir="rtl">לוּז</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 214): the cite's
text reads "לוּז I", Sefaria links L00229 "לוּז IV", the only family
member numbered I is L00225 "לוּז I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `לוּז I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family לְוִיָּה

#### L00351 · P000636

- **Entry**: L00351 `לְחֵינְתָא, לְחֵנְתָא, (לְחֵינָ׳)`, vol. 2, 703a,
  leaf 26.
  Entry file: [`data/entries/L/L00351.json`](../../../../../../data/entries/L/L00351.json)
- **Scan crop**: [scan 703a · leaf 26](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$27/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 26, line 14 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  cmp. JW, M*ib II) lj concubine (=h. sabs); 2) maidservant
  ```

  The numeral reads `II`: `cmp. JW, M*ib II)`.
- **The cite as Sefaria has it**: `(לחן, cmp. לוח, to join; cmp. זוּג,
  לְוִיָּה II)`
  Sefaria links L00254 `לִוִיָּה, לְוִיָּיה I` (numeral I on form 2,
  `לְוִיָּיה`).
- **The patch's target**: L00255 `לְוִיָּה, לְיִיָּיה II, לִוְיָה`
  (numeral II on form 2, `לְיִיָּיה`).
  **The numeral sits on a later form**: form 2, `לְיִיָּיה`, not the
  cite's `לְוִיָּה` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:af0e782b`:

```text
<a class="refLink" href="/Jastrow,_לִוִיָּה.1" data-ref="Jastrow, לִוִיָּה 1"><span dir="rtl">לְוִיָּה</span> II</a>
→
<a class="refLink" href="/Jastrow,_לְוִיָּה.1" data-ref="Jastrow, לְוִיָּה 1"><span dir="rtl">לְוִיָּה</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 53): the cite's
text reads "לְוִיָּה II", Sefaria links L00254 "לִוִיָּה, לְוִיָּיה I",
the only family member numbered II is L00255 "לְוִיָּה, לְיִיָּיה II,
לִוְיָה".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `לְוִיָּה II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family לָקִישׁ

#### T00717 · P000742

- **Entry**: T00717 `ריִ״ש, רֵישׁ I`, vol. 2, 1477b, leaf 800.
  Entry file: [`data/entries/T/T00717.json`](../../../../../../data/entries/T/T00717.json)
- **Scan crop**: [scan 1477b · leaf 800](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$801/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 800, line 102 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  [i^pb Mil, v. STpb L]
  ```

  The bracket reads `v. STpb L]`, the numeral as `L`. No `I` is read.
- **The cite as Sefaria has it**: `…Reshes, or Reshes so as to look like
  Daleths.—[ריש לקיש, v. לָקִישׁ I.]`
  Sefaria links L00694 `לָקִישׁ II, לַקִּישׁ, לְקִישָׁא` (numeral II on
  form 1, `לָקִישׁ`).
- **The patch's target**: L00693 `לָקִישׁ, לְקִישָׁא I` (numeral I on
  form 2, `לְקִישָׁא`).
  **The numeral sits on a later form**: form 2, `לְקִישָׁא`, not the
  cite's `לָקִישׁ` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:23152b12`:

```text
<a class="refLink" href="/Jastrow,_לָקִישׁ II.1" data-ref="Jastrow, לָקִישׁ II 1"><span dir="rtl">לָקִישׁ</span> I</a>
→
<a class="refLink" href="/Jastrow,_לָקִישׁ.1" data-ref="Jastrow, לָקִישׁ 1"><span dir="rtl">לָקִישׁ</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 170): the cite's
text reads "לָקִישׁ I", Sefaria links L00694 "לָקִישׁ II, לַקִּישׁ,
לְקִישָׁא", the only family member numbered I is L00693 "לָקִישׁ,
לְקִישָׁא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `לָקִישׁ I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### U01517 · P000766

- **Entry**: U01517 `שִׁמְעוֹן`, vol. 2, 1600a, leaf 923.
  Entry file: [`data/entries/U/U01517.json`](../../../../../../data/entries/U/U01517.json)
- **Scan crop**: [scan 1600a · leaf 923](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$924/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 923, lines 39–40 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Keth. 54b. Gitt. 47a. Y. Yeb. VIII, 9(1 bot.; a. v. fr., v.
  srpb I; a. other Amoraim; v. Fr. M'bo p. 127a-130a.
  ```

  Line 39 ends `a. v. fr., v.`; line 40 opens `srpb I;`. The numeral
  reads `I`.
- **The cite as Sefaria has it**: `…Keth. 54ᵇ. Gitt. 47ᵃ. Y. Yeb. VIII,
  9ᵈ bot.; a. v. fr., v. לָקִישׁ I; a. other Amoraim; v. Fr. M’bo p.
  127ᵃ–…`
  Sefaria links L00694 `לָקִישׁ II, לַקִּישׁ, לְקִישָׁא` (numeral II on
  form 1, `לָקִישׁ`).
- **The patch's target**: L00693 `לָקִישׁ, לְקִישָׁא I` (numeral I on
  form 2, `לְקִישָׁא`).
  **The numeral sits on a later form**: form 2, `לְקִישָׁא`, not the
  cite's `לָקִישׁ` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—4)]:a353cedf`:

```text
<a class="refLink" href="/Jastrow,_לָקִישׁ II.1" data-ref="Jastrow, לָקִישׁ II 1"><span dir="rtl">לָקִישׁ</span> I</a>
→
<a class="refLink" href="/Jastrow,_לָקִישׁ.1" data-ref="Jastrow, לָקִישׁ 1"><span dir="rtl">לָקִישׁ</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 196): the cite's
text reads "לָקִישׁ I", Sefaria links L00694 "לָקִישׁ II, לַקִּישׁ,
לְקִישָׁא", the only family member numbered I is L00693 "לָקִישׁ,
לְקִישָׁא I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `לָקִישׁ I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family מְהוּלְתָּא

#### M00351 · P000637

- **Entry**: M00351 `מְהוּלָא I`, vol. 2, 737a, leaf 60.
  Entry file: [`data/entries/M/M00351.json`](../../../../../../data/entries/M/M00351.json)
- **Scan crop**: [scan 737a · leaf 60](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$61/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 60, line 7 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  N~T!E I f. = Xttb^ina II. Keth.8a "3 "U a festival of
  ```

  The line's first `I` is the headword's (`מְהוּלָא I`); the cite's
  reads `II`: `f. = Xttb^ina II.`
- **The cite as Sefaria has it**: `f. = מְהוּלְתָּא II. Keth. 8ᵃ בי מ׳ a
  festival of circumcis…`
  Sefaria links M00353 `מְהוּלְתָּא I` (numeral I on form 1,
  `מְהוּלְתָּא`).
- **The patch's target**: M00354 `מְהוּלְתָּא, מָ׳ II` (numeral II on
  form 2, `מָ׳`).
  **The numeral sits on a later form**: form 2, `מָ׳`, not the cite's
  `מְהוּלְתָּא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:4d97eeb8`:

```text
<a class="refLink" href="/Jastrow,_מְהוּלְתָּא I.1" data-ref="Jastrow, מְהוּלְתָּא I 1"><span dir="rtl">מְהוּלְתָּא</span> II</a>
→
<a class="refLink" href="/Jastrow,_מְהוּלְתָּא.1" data-ref="Jastrow, מְהוּלְתָּא 1"><span dir="rtl">מְהוּלְתָּא</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 54): the cite's
text reads "מְהוּלְתָּא II", Sefaria links M00353 "מְהוּלְתָּא I", the
only family member numbered II is M00354 "מְהוּלְתָּא, מָ׳ II".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `מְהוּלְתָּא II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### M00372 · P000638

- **Entry**: M00372 `מֻהְלְתָא`, vol. 2, 737b, leaf 60.
  Entry file: [`data/entries/M/M00372.json`](../../../../../../data/entries/M/M00372.json)
- **Scan crop**: [scan 737b · leaf 60](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$61/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 60, line 72 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  fcCDHD, v. xnbvna II.
  ```

  The numeral reads `II`: `v. xnbvna II.`
- **The cite as Sefaria has it**: `, v. מְהוּלְתָּא II`
  Sefaria links M00353 `מְהוּלְתָּא I` (numeral I on form 1,
  `מְהוּלְתָּא`).
- **The patch's target**: M00354 `מְהוּלְתָּא, מָ׳ II` (numeral II on
  form 2, `מָ׳`).
  **The numeral sits on a later form**: form 2, `מָ׳`, not the cite's
  `מְהוּלְתָּא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:928aef7e`:

```text
<a class="refLink" href="/Jastrow,_מְהוּלְתָּא I.1" data-ref="Jastrow, מְהוּלְתָּא I 1"><span dir="rtl">מְהוּלְתָּא</span> II</a>
→
<a class="refLink" href="/Jastrow,_מְהוּלְתָּא.1" data-ref="Jastrow, מְהוּלְתָּא 1"><span dir="rtl">מְהוּלְתָּא</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 55): the cite's
text reads "מְהוּלְתָּא II", Sefaria links M00353 "מְהוּלְתָּא I", the
only family member numbered II is M00354 "מְהוּלְתָּא, מָ׳ II".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `מְהוּלְתָּא II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family מְחִי

#### M01112 · P000639

- **Entry**: M01112 `*מֵיחָא`, vol. 2, 772a, leaf 95.
  Entry file: [`data/entries/M/M01112.json`](../../../../../../data/entries/M/M01112.json)
- **Scan crop**: [scan 772a · leaf 95](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$96/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 95, line 4 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Sn D m. (hPa, v. ^na 1) stirred flour in a dish, paste.
  ```

  The numeral reads as the digit: `(hPa, v. ^na 1)`. No `I` is read.
- **The cite as Sefaria has it**: `(מְחַח, v. מְחִי I) stirred flour in
  a dish, paste. Sabb.…`
  Sefaria links M00859 `מְחִי, מְחָא II` (numeral II on form 2,
  `מְחָא`).
- **The patch's target**: M00858 `מְחִי, מְחָא I, (מְחַח)` (numeral I on
  form 2, `מְחָא`).
  **The numeral sits on a later form**: form 2, `מְחָא`, not the cite's
  `מְחִי` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:e64cade1`:

```text
<a class="refLink" href="/Jastrow,_מְחִי ².1" data-ref="Jastrow, מְחִי ² 1"><span dir="rtl">מְחִי</span> I</a>
→
<a class="refLink" href="/Jastrow,_מְחִי.1" data-ref="Jastrow, מְחִי 1"><span dir="rtl">מְחִי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 56): the cite's
text reads "מְחִי I", Sefaria links M00859 "מְחִי, מְחָא II", the only
family member numbered I is M00858 "מְחִי, מְחָא I, מְחַח".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `מְחִי I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### M03078 · P000646

- **Entry**: M03078 `מִתְמְהָא, מִתְמְחָא`, vol. 2, 863a, leaf 186.
  Entry file: [`data/entries/M/M03078.json`](../../../../../../data/entries/M/M03078.json)
- **Scan crop**: [scan 863a · leaf 186](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$187/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 186, line 23 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Krayo, arena, v.-*roi.
  ```

  The cite reads `v.-*roi.`, a lower-case `i` fused to the garbled word.
  No `I` is read.
- **The cite as Sefaria has it**: `, v. מְחִי I`
  Sefaria links M00859 `מְחִי, מְחָא II` (numeral II on form 2,
  `מְחָא`).
- **The patch's target**: M00858 `מְחִי, מְחָא I, (מְחַח)` (numeral I on
  form 2, `מְחָא`).
  **The numeral sits on a later form**: form 2, `מְחָא`, not the cite's
  `מְחִי` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:be7c45ff`:

```text
<a class="refLink" href="/Jastrow,_מְחִי ².1" data-ref="Jastrow, מְחִי ² 1"><span dir="rtl">מְחִי</span> I</a>
→
<a class="refLink" href="/Jastrow,_מְחִי.1" data-ref="Jastrow, מְחִי 1"><span dir="rtl">מְחִי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 66): the cite's
text reads "מְחִי I", Sefaria links M00859 "מְחִי, מְחָא II", the only
family member numbered I is M00858 "מְחִי, מְחָא I, מְחַח".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `מְחִי I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family מֵישְׁרָא

#### M02803 · P000644

- **Entry**: M02803 `מֵשָׁארָא`, vol. 2, 848b, leaf 171.
  Entry file: [`data/entries/M/M02803.json`](../../../../../../data/entries/M/M02803.json)
- **Scan crop**: [scan 848b · leaf 171](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$172/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 171, line 101 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  fcOKOT, v. vrveha I.
  ```

  The numeral reads `I`: `fcOKOT, v. vrveha I.`
- **The cite as Sefaria has it**: `, v. מֵישְׁרָא I`
  Sefaria links M01319 `מֵישְׁרָא II, מֵישְׁרֵי` (numeral II on form 1,
  `מֵישְׁרָא`).
- **The patch's target**: M01318 `מֵישָׁרָא, מֵישְׁרָא, מֵשְׁ׳ I`
  (numeral I on form 3, `מֵשְׁ׳`).
  **The numeral sits on a later form**: form 3, `מֵשְׁ׳`, not the cite's
  `מֵישְׁרָא` (form 2); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:ec8ee61a`:

```text
<a class="refLink" href="/Jastrow,_מֵישְׁרָא II.1" data-ref="Jastrow, מֵישְׁרָא II 1"><span dir="rtl">מֵישְׁרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_מֵישָׁרָא.1" data-ref="Jastrow, מֵישָׁרָא 1"><span dir="rtl">מֵישְׁרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 63): the cite's
text reads "מֵישְׁרָא I", Sefaria links M01319 "מֵישְׁרָא II,
מֵישְׁרֵי", the only family member numbered I is M01318 "מֵישָׁרָא,
מֵישְׁרָא, מֵשְׁ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `מֵישְׁרָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family מָרָה

#### G00734 · P000622

- **Entry**: G00734 `זָרַק`, vol. 1, 415a, leaf 438; continues into
  415b, same leaf.
  Entry file: [`data/entries/G/G00734.json`](../../../../../../data/entries/G/G00734.json)
- **Scan crop**: [scan 415a · leaf 438](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$439/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 438, line 61 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Kot. 108° בָרָה .+ ורוק וכ'‎ Bebb, 41, | תירק טרשות‎
  ```

  The line opens `Kot. 108°` (Keth. 103ᵇ); the cite is in the mirrored
  run `בָרָה .+`, `.+` the OCR's `v.`. No `I` is read.
- **The cite as Sefaria has it**: `to sprinkle; to cast, throw. Keth.
  103ᵇ זְרוֹק וכ׳, v. מָרָה I. Sabb. XI, 1 הזוֹרֵק מרשות וכ׳ he who t…`
  Sefaria links M02564 `מָרָה IV` (numeral IV on form 1, `מָרָה`).
- **The patch's target**: M02561 `מָרָה I` (numeral I on form 1,
  `מָרָה`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:912677aa`:

```text
<a class="refLink" href="/Jastrow,_מָרָה IV.1" data-ref="Jastrow, מָרָה IV 1"><span dir="rtl">מָרָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_מָרָה I.1" data-ref="Jastrow, מָרָה I 1"><span dir="rtl">מָרָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 37): the cite's
text reads "מָרָה I", Sefaria links M02564 "מָרָה IV", the only family
member numbered I is M02561 "מָרָה I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `מָרָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### M02691 · P000643

- **Entry**: M02691 `מְרִירְתָּא`, vol. 2, 843b, leaf 166.
  Entry file: [`data/entries/M/M02691.json`](../../../../../../data/entries/M/M02691.json)
- **Scan crop**: [scan 843b · leaf 166](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$167/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 166, line 97 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  affection of the gall, v.rtTOl; a. e.— Keth. 50a rWrt Tia
  ```

  The numeral reads `l`, fused to the cite word: `v.rtTOl;`. No `I` is
  read.
- **The cite as Sefaria has it**: `…Targ. Y. Ex. XXIII, 25 מחת מ׳
  affection of the gall, v. מָרָה I; a. e.—Keth. 50ᵃ מרר׳ דדַיָּה וכ׳
  the g…`
  Sefaria links M02564 `מָרָה IV` (numeral IV on form 1, `מָרָה`).
- **The patch's target**: M02561 `מָרָה I` (numeral I on form 1,
  `מָרָה`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:dd5d906a`:

```text
<a class="refLink" href="/Jastrow,_מָרָה IV.1" data-ref="Jastrow, מָרָה IV 1"><span dir="rtl">מָרָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_מָרָה I.1" data-ref="Jastrow, מָרָה I 1"><span dir="rtl">מָרָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 62): the cite's
text reads "מָרָה I", Sefaria links M02564 "מָרָה IV", the only family
member numbered I is M02561 "מָרָה I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `מָרָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family נִגְדָּא

#### N00301 · P000649

- **Entry**: N00301 `נוּגְדָּא`, vol. 2, 883b, leaf 206.
  Entry file: [`data/entries/N/N00301.json`](../../../../../../data/entries/N/N00301.json)
- **Scan crop**: [scan 883b · leaf 206](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$207/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 206, line 81 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  S^JRD, v. BttM I, U, a. K1313.
  ```

  The numeral reads `I`: `v. BttM I, U, a.`, the `II` after it as `U`.
- **The cite as Sefaria has it**: `, v. נִגְדָּא I, II, a. נוּגְרָא.`
  Sefaria links N00122 `נִגְדָּא, נִי׳ II` (numeral II on form 2,
  `נִי׳`).
- **The patch's target**: N00121 `נִגְדָּא, נִי׳ I` (numeral I on form
  2, `נִי׳`).
  **The numeral sits on a later form**: form 2, `נִי׳`, not the cite's
  `נִגְדָּא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:1c677acc`:

```text
<a class="refLink" href="/Jastrow,_נִגְדָּא ².1" data-ref="Jastrow, נִגְדָּא ² 1"><span dir="rtl">נִגְדָּא</span> I</a>
→
<a class="refLink" href="/Jastrow,_נִגְדָּא.1" data-ref="Jastrow, נִגְדָּא 1"><span dir="rtl">נִגְדָּא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 69): the cite's
text reads "נִגְדָּא I", Sefaria links N00122 "נִגְדָּא, נִי׳ II", the
only family member numbered I is N00121 "נִגְדָּא, נִי׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `נִגְדָּא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family נְחוּשְׁתָּן

#### R00130 · P000705

- **Entry**: R00130 `צָהַב`, vol. 2, 1264a, leaf 587; continues into
  1264b, same leaf.
  Entry file: [`data/entries/R/R00130.json`](../../../../../../data/entries/R/R00130.json)
- **Scan crop**: [scan 1264a · leaf 587](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$588/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 587, line 61 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  burnished, gold-like. Midd. II, 3, a. e., v. "Pipina I. — Part,
  ```

  The numeral reads `I`: `Midd. II, 3, a. e., v. "Pipina I.`
- **The cite as Sefaria has it**: `…to be bright, burnished, gold-like.
  Midd. II, 3, a. e., v. נְחוּשְׁתָּן I.—Part. pass. מוּצְהָב; f.
  מוּצְהֶבֶת. Y…`
  Sefaria links N00482 `נְחוּשְׁתָּן, נְחֻשְׁ׳ II` (numeral II on form
  2, `נְחֻשְׁ׳`).
- **The patch's target**: N00481 `נְחוּשְׁתָּן, נְחֻשְׁ׳ I` (numeral I
  on form 2, `נְחֻשְׁ׳`).
  **The numeral sits on a later form**: form 2, `נְחֻשְׁ׳`, not the
  cite's `נְחוּשְׁתָּן` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:11561962`:

```text
<a class="refLink" href="/Jastrow,_נְחוּשְׁתָּן ².1" data-ref="Jastrow, נְחוּשְׁתָּן ² 1"><span dir="rtl">נְחוּשְׁתָּן</span> I</a>.—Part. 
→
<a class="refLink" href="/Jastrow,_נְחוּשְׁתָּן.1" data-ref="Jastrow, נְחוּשְׁתָּן 1"><span dir="rtl">נְחוּשְׁתָּן</span> I</a>.—Part. 
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 127): the cite's
text reads "נְחוּשְׁתָּן I", Sefaria links N00482 "נְחוּשְׁתָּן,
נְחֻשְׁ׳ II", the only family member numbered I is N00481 "נְחוּשְׁתָּן,
נְחֻשְׁ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `נְחוּשְׁתָּן I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### R00130 · P000706

- **Entry**: R00130 `צָהַב`, vol. 2, 1264a, leaf 587; continues into
  1264b, same leaf.
  Entry file: [`data/entries/R/R00130.json`](../../../../../../data/entries/R/R00130.json)
- **Scan crop**: [scan 1264a · leaf 587](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$588/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 587, line 63 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  v. -,tni»sina i. [ib. rrma mwn, Ms. m. 2 nanxa.]— 3) (cmp.
  ```

  The cite reads `v. -,tni»sina i.`, the numeral as a lower-case `i`. No
  `I` is read.
- **The cite as Sefaria has it**: `…f. מוּצְהֶבֶת. Yoma 38ᵃ (some ed.
  מְצוּהֶבֶת Pu.), v. נְחוּשְׁתָּן I. [Ib. והיתה מאירה, Ms. M. 2
  מַצְהֶבֶת.]`
  Sefaria links N00482 `נְחוּשְׁתָּן, נְחֻשְׁ׳ II` (numeral II on form
  2, `נְחֻשְׁ׳`).
- **The patch's target**: N00481 `נְחוּשְׁתָּן, נְחֻשְׁ׳ I` (numeral I
  on form 2, `נְחֻשְׁ׳`).
  **The numeral sits on a later form**: form 2, `נְחֻשְׁ׳`, not the
  cite's `נְחוּשְׁתָּן` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:4c1625ee`:

```text
<a class="refLink" href="/Jastrow,_נְחוּשְׁתָּן ².1" data-ref="Jastrow, נְחוּשְׁתָּן ² 1"><span dir="rtl">נְחוּשְׁתָּן</span> I</a>
→
<a class="refLink" href="/Jastrow,_נְחוּשְׁתָּן.1" data-ref="Jastrow, נְחוּשְׁתָּן 1"><span dir="rtl">נְחוּשְׁתָּן</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 128): the cite's
text reads "נְחוּשְׁתָּן I", Sefaria links N00482 "נְחוּשְׁתָּן,
נְחֻשְׁ׳ II", the only family member numbered I is N00481 "נְחוּשְׁתָּן,
נְחֻשְׁ׳ I". It applies after P000705, on the definition that patch
leaves.

</details>

**The maintainer's read**:

- [ ] confirm — print reads `נְחוּשְׁתָּן I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### S01376 · P000726

- **Entry**: S01376 `קְלִנְתְּיָא`, vol. 2, 1379a, leaf 702.
  Entry file: [`data/entries/S/S01376.json`](../../../../../../data/entries/S/S01376.json)
- **Scan crop**: [scan 1379a · leaf 702](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$703/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 702, line 48 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Yoina38a WWfep (Ms. M. xrv^bp), v. 'jmj*^ L
  ```

  The numeral reads `L`: `v. 'jmj*^ L`. No `I` is read.
- **The cite as Sefaria has it**: `…Tosef. Yoma II, 4; Yoma 38ᵃ קלוניתא
  (Ms. M. קלניתא), v. נְחוּשְׁתָּן I.`
  Sefaria links N00482 `נְחוּשְׁתָּן, נְחֻשְׁ׳ II` (numeral II on form
  2, `נְחֻשְׁ׳`).
- **The patch's target**: N00481 `נְחוּשְׁתָּן, נְחֻשְׁ׳ I` (numeral I
  on form 2, `נְחֻשְׁ׳`).
  **The numeral sits on a later form**: form 2, `נְחֻשְׁ׳`, not the
  cite's `נְחוּשְׁתָּן` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:00d17d02`:

```text
<a class="refLink" href="/Jastrow,_נְחוּשְׁתָּן ².1" data-ref="Jastrow, נְחוּשְׁתָּן ² 1"><span dir="rtl">נְחוּשְׁתָּן</span> I</a>
→
<a class="refLink" href="/Jastrow,_נְחוּשְׁתָּן.1" data-ref="Jastrow, נְחוּשְׁתָּן 1"><span dir="rtl">נְחוּשְׁתָּן</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 154): the cite's
text reads "נְחוּשְׁתָּן I", Sefaria links N00482 "נְחוּשְׁתָּן,
נְחֻשְׁ׳ II", the only family member numbered I is N00481 "נְחוּשְׁתָּן,
נְחֻשְׁ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `נְחוּשְׁתָּן I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family נִיפְלָא

#### N01042 · P000656

- **Entry**: N01042 `נָפִיל, נְפִילָא I`, vol. 2, 924a, leaf 247.
  Entry file: [`data/entries/N/N01042.json`](../../../../../../data/entries/N/N01042.json)
- **Scan crop**: [scan 924a · leaf 247](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$248/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 247, line 6 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  —PI. 'pV'BS, v. xbEP3 1.
  ```

  The numeral reads as the digit: `v. xbEP3 1.`. No `I` is read.
- **The cite as Sefaria has it**: `Orion.—Pl. נְפִילִין, v. נִיפְלָא I.`
  Sefaria links N00738 `נִיפְלָא II` (numeral II on form 1, `נִיפְלָא`).
- **The patch's target**: N00737 `נִיפְלָא, נִפְ׳ I` (numeral I on form
  2, `נִפְ׳`).
  **The numeral sits on a later form**: form 2, `נִפְ׳`, not the cite's
  `נִיפְלָא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:be778ebe`:

```text
<a class="refLink" href="/Jastrow,_נִיפְלָא II.1" data-ref="Jastrow, נִיפְלָא II 1"><span dir="rtl">נִיפְלָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_נִיפְלָא.1" data-ref="Jastrow, נִיפְלָא 1"><span dir="rtl">נִיפְלָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 76): the cite's
text reads "נִיפְלָא I", Sefaria links N00738 "נִיפְלָא II", the only
family member numbered I is N00737 "נִיפְלָא, נִפְ׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `נִיפְלָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family נִסָּא

#### N00935 · P000654

- **Entry**: N00935 `נִסָּיוֹן, נִסְיוֹנָא, נִי׳`, vol. 2, 916b, leaf
  239.
  Entry file: [`data/entries/N/N00935.json`](../../../../../../data/entries/N/N00935.json)
- **Scan crop**: [scan 916b · leaf 239](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$240/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 239, line 103 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  56b, v. 803 1. — 2) tvonder, providential escape, salvation.
  ```

  The numeral reads as the digit: `56b, v. 803 1.`. No `I` is read.
- **The cite as Sefaria has it**: `…Ex. XV, 25; a. e.—Ib. XVII, 7, v.
  נִסֵּיתָא.—Ber. 56ᵇ, v. נִסָּא I.`
  Sefaria links N00914 `נִסָּא II, נִסָּה, נִי׳` (numeral II on form 1,
  `נִסָּא`).
- **The patch's target**: N00913 `נֵס, נִסָּא, נִי׳ I` (numeral I on
  form 3, `נִי׳`).
  **The numeral sits on a later form**: form 3, `נִי׳`, not the cite's
  `נִסָּא` (form 2); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:87d4f6c5`:

```text
<a class="refLink" href="/Jastrow,_נִסָּא II.1" data-ref="Jastrow, נִסָּא II 1"><span dir="rtl">נִסָּא</span> I</a>
→
<a class="refLink" href="/Jastrow,_נֵס.1" data-ref="Jastrow, נֵס 1"><span dir="rtl">נִסָּא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 74): the cite's
text reads "נִסָּא I", Sefaria links N00914 "נִסָּא II, נִסָּה, נִי׳",
the only family member numbered I is N00913 "נֵס, נִסָּא, נִי׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `נִסָּא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

#### N00935 · P000655

- **Entry**: N00935 `נִסָּיוֹן, נִסְיוֹנָא, נִי׳`, vol. 2, 916b, leaf
  239.
  Entry file: [`data/entries/N/N00935.json`](../../../../../../data/entries/N/N00935.json)
- **Scan crop**: [scan 916b · leaf 239](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$240/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 239, line 109 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  attend on the Sabbath eve). Lam. R.to I, 1, v. N03 1; a.e.
  ```

  The numeral reads as the digit: `Lam. R.to I, 1, v. N03 1;`. The `I`
  before it is the reference (Lam. R. to I, 1), not the cite. No `I` is
  read after the cite.
- **The cite as Sefaria has it**: `…induced to attend on the Sabbath
  eve). Lam. R. to I, 1, v. נִסָּא I; a. e.`
  Sefaria links N00914 `נִסָּא II, נִסָּה, נִי׳` (numeral II on form 1,
  `נִסָּא`).
- **The patch's target**: N00913 `נֵס, נִסָּא, נִי׳ I` (numeral I on
  form 3, `נִי׳`).
  **The numeral sits on a later form**: form 3, `נִי׳`, not the cite's
  `נִסָּא` (form 2); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:e40f20e9`:

```text
<a class="refLink" href="/Jastrow,_נִסָּא II.1" data-ref="Jastrow, נִסָּא II 1"><span dir="rtl">נִסָּא</span> I</a>
→
<a class="refLink" href="/Jastrow,_נֵס.1" data-ref="Jastrow, נֵס 1"><span dir="rtl">נִסָּא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 75): the cite's
text reads "נִסָּא I", Sefaria links N00914 "נִסָּא II, נִסָּה, נִי׳",
the only family member numbered I is N00913 "נֵס, נִסָּא, נִי׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `נִסָּא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family נִסְכָּא

#### N00704 · P000652

- **Entry**: N00704 `נִיסּוּךְ, נִיסּוּכָא, נִסּ׳`, vol. 2, 906a, leaf
  229.
  Entry file: [`data/entries/N/N00704.json`](../../../../../../data/entries/N/N00704.json)
- **Scan crop**: [scan 906a · leaf 229](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$230/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 229, lines 49–50 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  0. some ed. Targ. Y. ib. XV, 13 (not X^rttdS); a. fr.— V.
  aodsi.
  ```

  Line 49 ends `a. fr.— V.`; line 50 is the cite alone, `aodsi.`. No
  separate `I` is read.
- **The cite as Sefaria has it**: `…some ed. Targ. Y. ib. XV, 13 (not
  נְסוּכְיָיא); a. fr.—V. נִסְכָּא I.`
  Sefaria links N00950 `נִסְכָּא, נִי׳ II` (numeral II on form 2,
  `נִי׳`).
- **The patch's target**: N00949 `נִסְכָּא, נִי׳ I` (numeral I on form
  2, `נִי׳`).
  **The numeral sits on a later form**: form 2, `נִי׳`, not the cite's
  `נִסְכָּא` (form 1); see "Numeral on a later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:e108d83e`:

```text
<a class="refLink" href="/Jastrow,_נִסְכָּא ².1" data-ref="Jastrow, נִסְכָּא ² 1"><span dir="rtl">נִסְכָּא</span> I</a>
→
<a class="refLink" href="/Jastrow,_נִסְכָּא.1" data-ref="Jastrow, נִסְכָּא 1"><span dir="rtl">נִסְכָּא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 72): the cite's
text reads "נִסְכָּא I", Sefaria links N00950 "נִסְכָּא, נִי׳ II", the
only family member numbered I is N00949 "נִסְכָּא, נִי׳ I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `נִסְכָּא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

### Family נֵצֶר

#### R00805 · P000716

- **Entry**: R00805 `צַרְצוּר`, vol. 2, 1305a, leaf 628.
  Entry file: [`data/entries/R/R00805.json`](../../../../../../data/entries/R/R00805.json)
- **Scan crop**: [scan 1305a · leaf 628](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$629/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 628, line 23 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  3irl)?; v. "CB I.
  ```

  The numeral reads `I`: `v. "CB I.`
- **The cite as Sefaria has it**: `…because it does not go by the name
  of חָגָב)?; v. נֵצֶר I.`
  Sefaria links N01147 `נֵצֶר IV` (numeral IV on form 1, `נֵצֶר`).
- **The patch's target**: N01144 `נֵצֶר I` (numeral I on form 1,
  `נֵצֶר`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:9b792e5d`:

```text
<a class="refLink" href="/Jastrow,_נֵצֶר IV.1" data-ref="Jastrow, נֵצֶר IV 1"><span dir="rtl">נֵצֶר</span> I</a>
→
<a class="refLink" href="/Jastrow,_נֵצֶר I.1" data-ref="Jastrow, נֵצֶר I 1"><span dir="rtl">נֵצֶר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 138): the cite's
text reads "נֵצֶר I", Sefaria links N01147 "נֵצֶר IV", the only family
member numbered I is N01144 "נֵצֶר I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `נֵצֶר I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read: ________________________________ (what print shows, incl. `ch.` if present; date; second-read note if hOCR and scan disagree)

## Summary

| | count |
|---|---|
| records | 39 |
| entries | 37 |
| families | 23 |
| hOCR line found | 37 |
| of those, the hOCR reads the numeral the cite names | 14 |
| of those, the numeral is misread (`1`, `l`, `L`, `i`), fused into the word, or not read | 23 |
| no hOCR line found | 2 |
| the target's numeral sits on a later form than the cite's | 34 |
| a `ch.` line follows the target | 1 (H01653, citing line Hebrew) |

**The hOCR reads the numeral (14)**: H01341 (P000628), L00351
(P000636, `II`), M00351 (P000637, `II`), M00372 (P000638, `II`), M02803
(P000644), N00301 (P000649), N01346 (P000657), O00658 (P000665), R00130
(P000705), R00805 (P000716), S00151 (P000719, read `I-`), U01517
(P000766), U01871 (P000773), V00547 (P000783).

**No hOCR line found (2)**: K00162 (P000632) and K00171 (P000633), both
one-line cross-references on leaf 638 (615a and 615b). The hOCR sets
fewer lines than print has entries on 615a, and the short lines on 615b
cannot be told apart; the scan decides.

The other 23 have a line, located by the Latin around the cite, on
which the hOCR does not read the cite's numeral. Their read is the
scan's.

| family | rids | patch ids | leaf(s) | hOCR line found (y/n) |
|---|---|---|---|---|
| חִדְקָא | H00210 | P000623 | 450 | y |
| חִיזְרָא | C00041, H00878, N01346, O00658, U01871 | P000611, P000625, P000657, P000665, P000773 | 227, 483, 265, 302, 946 | y, y, y (reads numeral), y (reads numeral), y (reads numeral) |
| חִסְדָּא | H01341 | P000628 | 509 | y (reads numeral) |
| חֲרוּבָא | S01841, V01117 | P000732, P000790 | 731, 1028 | y, y |
| חָרַר | H01653 | P000629 | 524 | y |
| חֲשַׁךְ | S00151 | P000719 | 639 | y (reads numeral) |
| יִתְרָא | J00739, J00746, L00204 | P000630, P000631, P000635 | 627, 627, 18 | y, y, y |
| כָּהֵן | K00162, K00171 | P000632, P000633 | 638, 638 | n, n |
| כְּלֵי | K00759, S02103 | P000634, P000735 | 667, 746 | y, y |
| כִּנָּרָא | M03062 | P000645 | 185 | y |
| לוּז | V00547 | P000783 | 991 | y (reads numeral) |
| לְוִיָּה | L00351 | P000636 | 26 | y (reads numeral) |
| לָקִישׁ | T00717, U01517 | P000742, P000766 | 800, 923 | y, y (reads numeral) |
| מְהוּלְתָּא | M00351, M00372 | P000637, P000638 | 60, 60 | y (reads numeral), y (reads numeral) |
| מְחִי | M01112, M03078 | P000639, P000646 | 95, 186 | y, y |
| מֵישְׁרָא | M02803 | P000644 | 171 | y (reads numeral) |
| מָרָה | G00734, M02691 | P000622, P000643 | 438, 166 | y, y |
| נִגְדָּא | N00301 | P000649 | 206 | y (reads numeral) |
| נְחוּשְׁתָּן | R00130, R00130, S01376 | P000705, P000706, P000726 | 587, 587, 702 | y (reads numeral), y, y |
| נִיפְלָא | N01042 | P000656 | 247 | y |
| נִסָּא | N00935, N00935 | P000654, P000655 | 239, 239 | y, y |
| נִסְכָּא | N00704 | P000652 | 229 | y |
| נֵצֶר | R00805 | P000716 | 628 | y (reads numeral) |

## After the reads

A follow-up commit on this PR sets each record from its tick, removes
`pending`, and changes nothing else in the record unless the read
re-aims it:

- **confirm** → `evidence.kind` `maintainer-read`, with `reader`,
  `date`, `volume` and `leaf` (the leaf of the block's hOCR line, or
  the entry's leaf where there is none), e.g.
  `{"date": "2026-10-28", "kind": "maintainer-read", "leaf": 638,
  "reader": "Brian", "volume": 1}`. Where the hOCR line above reads
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

A read that says print sets the numeral only after a later form (see
"Numeral on a later form") is a separate, new `reform` record under
10-13 case 2, as P000940 and P000941 were in C1, with its own evidence;
it does not change the retarget.

The from-scratch import (`rm -rf data/entries/[A-Z] && bun data:import
&& bun qa:format`) is the witness: a confirm changes no entry file, and
each withdraw or re-aim changes one cite `ref` in its entry.
