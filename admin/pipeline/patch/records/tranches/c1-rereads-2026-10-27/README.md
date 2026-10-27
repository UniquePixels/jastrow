# C1: cite retargets א–ז, maintainer re-read (2026-10-27)

Group 3, batch 1 of 12, of
[`docs/review-checklist-2026-10-25.md`](../../../../../../docs/review-checklist-2026-10-25.md):
the 31 pending cite retargets whose family starts with א–ז, one
maintainer block each. **No patch record, entry or checklist change.**
This directory holds only this README; a later PR applies the reads.

## Why these 31

Ruling `10-26 patch evidence`
([`docs/decisions.md`](../../../../../../docs/decisions.md)): every
reviewed patch carries `evidence`, and the import refuses a
text-changing patch that stands on Sefaria's text alone unless it is
`pending`. The backfill
([`evidence-backfill-2026-10-26`](../evidence-backfill-2026-10-26/README.md))
left all 31 here as `{"kind": "sefaria-only", "pending": true}`. They
still apply.

All 31 are retargets from
[`cite-retargets-2026-10-15`](../cite-retargets-2026-10-15/README.md)
(PR #178), case 1 of ruling `10-13 correction policy`: the cite's text
(`v. בַּר I`) is Jastrow's, Sefaria's linker aimed it at a member of
the word's family that lacks the numeral, and the patch re-aims it at
the one member that carries it. No print was read when they were
written. The read turns each into `maintainer-read` (a scan read),
`hOCR` (a Latin-only claim, quoted verbatim) or `jastrow-text`, or
withdraws the patch.

## The set

The checklist's predicate, run on
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl) at
`d67aa2b98`:

```bash
P=admin/pipeline/patch/records/reviewed/patches.jsonl
D='def fam: .rationale | capture("cite.s text reads [\"`](?<w>[^\"`]+)[\"`]").w | explode | map(select(. >= 1488 and . <= 1514)) | implode | .[0:1];
def retarget: .evidence.pending and .prompt_version == "cite-retargets-2026-10-15";'
jq -c "$D select(retarget and fam >= \"א\" and fam <= \"ז\")" $P
```

**31 records over 30 entries, 14 families**, as the checklist's table
says. D00003 holds two, P000616 and P000617, a chained `find ×2` pair
(the second applies on the definition the first leaves). A family is
the cite word's consonants (ruling 10-05). The 31 ids below equal the
predicate's output (diffed).

Checked by script on all 31: each is a `replace` whose `payload.find`
and `payload.replace` differ only in the anchor's `href` and
`data-ref`, and whose visible text is the same. `removes` is absent on
all 166 retargets, so every block's **Removes** line says none.

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
marks dropped. Where the hOCR reads the numeral as `1`, `l` or `J`, or
not at all, that is the OCR's reading: the scan decides. Where the
hOCR and the scan read disagree, a second read is needed.

**The `ch.` rule (10-15).** A cite that reads `X N ch.` names the
`ch.` line print sets after `X N`, not `X N` itself. None of the 31
cites is followed by `ch.` in the entry as it stands (checked by
script). Note it on the `Read:` line if print shows one; that is a
withdraw.

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
retargets, 63 touched) are over a population other than these 166, so
that split cannot be reproduced here. The blocks are in family order,
then rid; within D00003, patch order.

What the reviewed records do show: two of the 14 families have a
reviewed `reform` on a member. בַּד: B00098, the target, P000290
(maintainer read 2026-10-25). גִּיב: C00609, the target, P000321,
whose `I` Sefaria dropped and a maintainer read of 2026-10-06 set.
Each block names such a patch under the target.

## The blocks

### Family אָדָא

#### D00003 · P000616

- **Entry**: D00003 `דָּא I, דָּה`, vol. 1, 275a, leaf 298.
  Entry file: [`data/entries/D/D00003.json`](../../../../../../data/entries/D/D00003.json)
- **Scan crop**: [scan 275a · leaf 298](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$299/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 298, lines 67–68 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Oh PTT +) (זאת,מי-א-‎ this ; with (ְהַרָא) ראה הפק‎
  NT. Targ. Gen. I, 23; a. fr, — Ned. 41* (prov.)
  ```

  The cite falls at the end of line 67 or the start of line 68; no `I`
  is read after it. Line 68's `Gen. I, 23` is the Targum reference
  (`Gen. II, 23` in Sefaria's text), not the cite.
- **The cite as Sefaria has it**: `(= h. זוֹ, זֹאת) this; with prefix ה,
  (הֲדָא) הָדָא, cmp. אָדָא I. Targ. Gen. II, 23; a. fr.—Ned. 41ᵃ (pr…`
  Sefaria links A00372 `אָדָא IV` (numeral IV on form 1, `אָדָא`).
- **The patch's target**: A00369 `אָדָא I, הָדָא` (numeral I on form 1,
  `אָדָא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:405c952d`:

```text
<a class="refLink" href="/Jastrow,_אָדָא IV.1" data-ref="Jastrow, אָדָא IV 1"><span dir="rtl">אָדָא</span> I</a>. 
→
<a class="refLink" href="/Jastrow,_אָדָא I.1" data-ref="Jastrow, אָדָא I 1"><span dir="rtl">אָדָא</span> I</a>. 
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 30): the cite's
text reads "אָדָא I", Sefaria links A00372 "אָדָא IV", the only family
member numbered I is A00369 "אָדָא I, הָדָא".

</details>

**The maintainer's read**:

- [x] confirm — print reads `אָדָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

#### D00003 · P000617

- **Entry**: D00003 `דָּא I, דָּה`, vol. 1, 275a, leaf 298.
  Entry file: [`data/entries/D/D00003.json`](../../../../../../data/entries/D/D00003.json)
- **Scan crop**: [scan 275a · leaf 298](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$299/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 298, line 72 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  - וב"‎ this proves &e., + הרא הרא דכתרב--.1 אֶרָא‎ (abbr. (הח"ד‎
  ```

  The numeral reads as the digit: `.1 אֶרָא`, mirrored; no `I` is read.
- **The cite as Sefaria has it**: `…. Succ. I, 52ᶜ top הדא אמרה היא הדא
  וכ׳ this proves &c., v. אָדָא I.—הדא היא דכתיב (abbr. הה״ד) it is
  this…`
  Sefaria links A00372 `אָדָא IV` (numeral IV on form 1, `אָדָא`).
- **The patch's target**: A00369 `אָדָא I, הָדָא` (numeral I on form 1,
  `אָדָא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:0dd8d5bb`:

```text
<a class="refLink" href="/Jastrow,_אָדָא IV.1" data-ref="Jastrow, אָדָא IV 1"><span dir="rtl">אָדָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_אָדָא I.1" data-ref="Jastrow, אָדָא I 1"><span dir="rtl">אָדָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 31): the cite's
text reads "אָדָא I", Sefaria links A00372 "אָדָא IV", the only family
member numbered I is A00369 "אָדָא I, הָדָא". It applies after P000616,
on the definition that patch leaves.

</details>

**The maintainer's read**:

- [x] confirm — print reads `אָדָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

#### P00118 · P000682

- **Entry**: P00118 `עָדָא I, עֲדָא`, vol. 2, 1043a, leaf 366.
  Entry file: [`data/entries/P/P00118.json`](../../../../../../data/entries/P/P00118.json)
- **Scan crop**: [scan 1043a · leaf 366](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$367/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 366, line 20 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  ST? I or ST? f. = XIX I. Bekh. 45b filEX '3 this
  ```

  The line's first `I` is the headword's (`עָדָא I`); the cite's reads
  `I`: `f. = XIX I. Bekh.`
- **The cite as Sefaria has it**: `f. = אָדָא I. Bekh. 45ᵇ ע׳ אמרה this
  proves. Pes. 53…`
  Sefaria links A00372 `אָדָא IV` (numeral IV on form 1, `אָדָא`).
- **The patch's target**: A00369 `אָדָא I, הָדָא` (numeral I on form 1,
  `אָדָא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:d8993ec5`:

```text
<a class="refLink" href="/Jastrow,_אָדָא IV.1" data-ref="Jastrow, אָדָא IV 1"><span dir="rtl">אָדָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_אָדָא I.1" data-ref="Jastrow, אָדָא I 1"><span dir="rtl">אָדָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 103): the cite's
text reads "אָדָא I", Sefaria links A00372 "אָדָא IV", the only family
member numbered I is A00369 "אָדָא I, הָדָא".

</details>

**The maintainer's read**:

- [x] confirm — print reads `אָדָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

### Family אוּרְיָא

#### A00895 · P000597

- **Entry**: A00895 `אוּרִית`, vol. 1, 34b, leaf 57.
  Entry file: [`data/entries/A/A00895.json`](../../../../../../data/entries/A/A00895.json)
- **Scan crop**: [scan 34b · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg)
- **hOCR**: no line found for this cite on leaf 57 (searched 57, the
  entry's only leaf); scan read required.
  Lines 76–80 of leaf 57 are five short lines, between the entry glossed
  `pr. n. Uriél, name of an angel` (line 74) and the line that ends `h.
  a. ch.` (line 81). Their Hebrew is garbled and they stand in print's
  order, not the rids', so the hOCR cannot say which line is A00895.
  Line 77 reads `אוּריה I, V. NPN.`: an `I` after the line's first word,
  not after a cite.
- **The cite as Sefaria has it**: `, v. אוּרְיָא I`
  Sefaria links A00878 `אוּרְיָא, אוּרְיָה II, אוּרְיָיא` (numeral II on
  form 2, `אוּרְיָה`).
- **The patch's target**: A00877 `אוּרְיָא, אוּרְיָה I, אוּרִית`
  (numeral I on form 2, `אוּרְיָה`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:dbe13f37`:

```text
<a class="refLink" href="/Jastrow,_אוּרְיָא ².1" data-ref="Jastrow, אוּרְיָא ² 1"><span dir="rtl">אוּרְיָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_אוּרְיָא.1" data-ref="Jastrow, אוּרְיָא 1"><span dir="rtl">אוּרְיָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 5): the cite's
text reads "אוּרְיָא I", Sefaria links A00878 "אוּרְיָא, אוּרְיָה II,
אוּרְיָיא", the only family member numbered I is A00877 "אוּרְיָא,
אוּרְיָה I, אוּרִית".

</details>

**The maintainer's read**:

- [x] confirm — print reads `אוּרְיָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

### Family אִסְטְרַטְיָא

#### A02560 · P000598

- **Entry**: A02560 `אִסְרַטְיָא, אִיסְ׳ I`, vol. 1, 98b, leaf 121.
  Entry file: [`data/entries/A/A02560.json`](../../../../../../data/entries/A/A02560.json)
- **Scan crop**: [scan 98b · leaf 121](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$122/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 121, line 10 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  camp, station. Y.‏ ,1 אֶסטרשרא=1 זאיסי ,אסרטיא
  ```

  The numerals on the line read as the digit `1` (`=1`, `,1`) in a
  mirrored Hebrew run; no `I` is read.
- **The cite as Sefaria has it**: `= אִסְטְרַטְיָא I, camp, station. Y.
  Shek. VII, 50ᶜ bot.`
  Sefaria links A02413 `אִסְטְרַטְיָא II, (אִסְרַטְיָא), אִיסְ׳`
  (numeral II on form 1, `אִסְטְרַטְיָא`).
- **The patch's target**: A02412 `אִסְטְרַטְיָא, אִיסְ׳ I` (numeral I on
  form 2, `אִיסְ׳`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:c6f5d902`:

```text
<a class="refLink" href="/Jastrow,_אִסְטְרַטְיָא II.1" data-ref="Jastrow, אִסְטְרַטְיָא II 1"><span dir="rtl">אִסְטְרַטְיָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_אִסְטְרַטְיָא.1" data-ref="Jastrow, אִסְטְרַטְיָא 1"><span dir="rtl">אִסְטְרַטְיָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 6): the cite's
text reads "אִסְטְרַטְיָא I", Sefaria links A02413 "אִסְטְרַטְיָא II,
אִסְרַטְיָא, אִיסְ׳", the only family member numbered I is A02412
"אִסְטְרַטְיָא, אִיסְ׳ I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `אִסְטְרַטְיָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): This looks more like the pattern of references providing evidence of giving I to an entry, with annotation

Outcome (2026-10-27): confirmed. The working copy left both boxes blank; the confirm is the maintainer's decision of 2026-10-27, after a scan read. The cite is also Jastrow's own text naming A02412's form `אִסְטְרַטְיָא` as I (10-05: the `I` print sets after `אִיסְ׳` numbers that form's sequence, not the first form's), so reform P000940 gives form 0 homograph I, displayed and annotated `print-error` (10-13 case 2).

#### O01590 · P000678

- **Entry**: O01590 `סְרַטְיָא`, vol. 2, 1025b, leaf 348.
  Entry file: [`data/entries/O/O01590.json`](../../../../../../data/entries/O/O01590.json)
- **Scan crop**: [scan 1025b · leaf 348](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$349/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 348, line 87 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  &TT31Q f. (= X^anaax I) camp, station. Sabb. 6a 'B
  ```

  The numeral reads `I`: `(= X^anaax I) camp, station.`
- **The cite as Sefaria has it**: `(= אִסְטְרַטְיָא I) camp, station.
  Sabb. 6ᵃ ס׳ ופלטיא וכ׳…`
  Sefaria links A02413 `אִסְטְרַטְיָא II, (אִסְרַטְיָא), אִיסְ׳`
  (numeral II on form 1, `אִסְטְרַטְיָא`).
- **The patch's target**: A02412 `אִסְטְרַטְיָא, אִיסְ׳ I` (numeral I on
  form 2, `אִיסְ׳`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:30dea82b`:

```text
<a class="refLink" href="/Jastrow,_אִסְטְרַטְיָא II.1" data-ref="Jastrow, אִסְטְרַטְיָא II 1"><span dir="rtl">אִסְטְרַטְיָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_אִסְטְרַטְיָא.1" data-ref="Jastrow, אִסְטְרַטְיָא 1"><span dir="rtl">אִסְטְרַטְיָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 99): the cite's
text reads "אִסְטְרַטְיָא I", Sefaria links A02413 "אִסְטְרַטְיָא II,
אִסְרַטְיָא, אִיסְ׳", the only family member numbered I is A02412
"אִסְטְרַטְיָא, אִיסְ׳ I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `אִסְטְרַטְיָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): A second cite, with same thing, this is evidence as above.

Outcome (2026-10-27): confirmed. The working copy left both boxes blank; the confirm is the maintainer's decision of 2026-10-27, after a scan read. The cite is also Jastrow's own text naming A02412's form `אִסְטְרַטְיָא` as I (10-05: the `I` print sets after `אִיסְ׳` numbers that form's sequence, not the first form's), so reform P000940 gives form 0 homograph I, displayed and annotated `print-error` (10-13 case 2).

### Family בָּב

#### B00051 · P000600

- **Entry**: B00051 `בָּבָא I`, vol. 1, 136b, leaf 159.
  Entry file: [`data/entries/B/B00051.json`](../../../../../../data/entries/B/B00051.json)
- **Scan crop**: [scan 136b · leaf 159](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$160/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 159, line 2 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  NI2 I, +. בּבִיסָא .₪ זַבָּב‎
  ```

  The line's one `I` follows its first word (`NI2 I,`), where the
  headword `בָּבָא I` stands; no `I` follows a later word.
- **The cite as Sefaria has it**: `, v. בָּב I a. בָּבִיתָא.`
  Sefaria links B00050 `בָּב II, בַּב נַהֲרָא` (numeral II on form 1,
  `בָּב`).
- **The patch's target**: B00049 `בָּב, בָּאב, בָּבָא I` (numeral I on
  form 3, `בָּבָא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:6e15f656`:

```text
<a class="refLink" href="/Jastrow,_בָּב II.1" data-ref="Jastrow, בָּב II 1"><span dir="rtl">בָּב</span> I</a>
→
<a class="refLink" href="/Jastrow,_בָּב.1" data-ref="Jastrow, בָּב 1"><span dir="rtl">בָּב</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 8): the cite's
text reads "בָּב I", Sefaria links B00050 "בָּב II, בַּב נַהֲרָא", the
only family member numbered I is B00049 "בָּב, בָּאב, בָּבָא I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `בָּב I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): As above

Outcome (2026-10-27): confirmed. The working copy left both boxes blank; the confirm is the maintainer's decision of 2026-10-27, after a scan read. The cite is also Jastrow's own text naming B00049's form `בָּב` as I (10-05: the `I` print sets after `בָּבָא` numbers that form's sequence, not the first form's), so reform P000941 gives form 0 homograph I, displayed and annotated `print-error` (10-13 case 2).

#### B00058 · P000601

- **Entry**: B00058 `בָּבִיתָא I, בַּבְתָּא, (בַּבַּיְיתָא)`, vol. 1,
  136b, leaf 159.
  Entry file: [`data/entries/B/B00058.json`](../../../../../../data/entries/B/B00058.json)
- **Scan crop**: [scan 136b · leaf 159](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$160/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 159, line 38 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  the innermost or the gates of His thought, v.321]. Targ. |
  ```

  The cite is fused into `v.321]`; no `I` is read.
- **The cite as Sefaria has it**: `…(ed. בָּבֵי) the innermost or the
  gates of His thought, v. בָּב I]. Targ. Prov. VII, 2 בבתא (Ms.
  בבייתא).…`
  Sefaria links B00050 `בָּב II, בַּב נַהֲרָא` (numeral II on form 1,
  `בָּב`).
- **The patch's target**: B00049 `בָּב, בָּאב, בָּבָא I` (numeral I on
  form 3, `בָּבָא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:605b242d`:

```text
<a class="refLink" href="/Jastrow,_בָּב II.1" data-ref="Jastrow, בָּב II 1"><span dir="rtl">בָּב</span> I</a>
→
<a class="refLink" href="/Jastrow,_בָּב.1" data-ref="Jastrow, בָּב 1"><span dir="rtl">בָּב</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 9): the cite's
text reads "בָּב I", Sefaria links B00050 "בָּב II, בַּב נַהֲרָא", the
only family member numbered I is B00049 "בָּב, בָּאב, בָּבָא I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `בָּב I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): as above

Outcome (2026-10-27): confirmed. The working copy left both boxes blank; the confirm is the maintainer's decision of 2026-10-27, after a scan read. The cite is also Jastrow's own text naming B00049's form `בָּב` as I (10-05: the `I` print sets after `בָּבָא` numbers that form's sequence, not the first form's), so reform P000941 gives form 0 homograph I, displayed and annotated `print-error` (10-13 case 2).

#### M02321 · P000640

- **Entry**: M02321 `מְצִיעַ, מְצִיעָא`, vol. 2, 826b, leaf 149.
  Entry file: [`data/entries/M/M02321.json`](../../../../../../data/entries/M/M02321.json)
- **Scan crop**: [scan 826b · leaf 149](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$150/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 149, line 61 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  age. Ned. 81b top R.N. (ed. twya).— KSWa N33. v.33l.—
  ```

  The numeral reads `l`, fused to the cite word: `v.33l.—`. No `I` is
  read.
- **The cite as Sefaria has it**: `…dle, average. Ned. 31ᵇ top R. N.
  (ed. מיצעא).—בבא מציעא. v. בָּב I.—[מְצִיעַיָּא, Targ. Prov. XXIX, 13
  Ms.…`
  Sefaria links B00050 `בָּב II, בַּב נַהֲרָא` (numeral II on form 1,
  `בָּב`).
- **The patch's target**: B00049 `בָּב, בָּאב, בָּבָא I` (numeral I on
  form 3, `בָּבָא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:6c4bc769`:

```text
<a class="refLink" href="/Jastrow,_בָּב II.1" data-ref="Jastrow, בָּב II 1"><span dir="rtl">בָּב</span> I</a>
→
<a class="refLink" href="/Jastrow,_בָּב.1" data-ref="Jastrow, בָּב 1"><span dir="rtl">בָּב</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 59): the cite's
text reads "בָּב I", Sefaria links B00050 "בָּב II, בַּב נַהֲרָא", the
only family member numbered I is B00049 "בָּב, בָּאב, בָּבָא I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `בָּב I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): as above

Outcome (2026-10-27): confirmed. The working copy left both boxes blank; the confirm is the maintainer's decision of 2026-10-27, after a scan read. The cite is also Jastrow's own text naming B00049's form `בָּב` as I (10-05: the `I` print sets after `בָּבָא` numbers that form's sequence, not the first form's), so reform P000941 gives form 0 homograph I, displayed and annotated `print-error` (10-13 case 2).

#### S01439 · P000727

- **Entry**: S01439 `קַמָּא, קַמָּאָה`, vol. 2, 1383b, leaf 706.
  Entry file: [`data/entries/S/S01439.json`](../../../../../../data/entries/S/S01439.json)
- **Scan crop**: [scan 1383b · leaf 706](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$707/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 706, line 89 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  ities. Ib. 48b; a. fr— "p X33, v. 32 I.— PL \xap. Naz. 56b
  ```

  The numeral reads `I`: `v. 32 I.—`.
- **The cite as Sefaria has it**: `…first of the quoted authorities. Ib.
  48ᵇ; a. fr.—בבא ק׳, v. בָּב I.—Pl. קַמָּאֵי. Naz. 56ᵇ Rashi (ed.
  קדמא…`
  Sefaria links B00050 `בָּב II, בַּב נַהֲרָא` (numeral II on form 1,
  `בָּב`).
- **The patch's target**: B00049 `בָּב, בָּאב, בָּבָא I` (numeral I on
  form 3, `בָּבָא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:dbbef2fd`:

```text
<a class="refLink" href="/Jastrow,_בָּב II.1" data-ref="Jastrow, בָּב II 1"><span dir="rtl">בָּב</span> I</a>
→
<a class="refLink" href="/Jastrow,_בָּב.1" data-ref="Jastrow, בָּב 1"><span dir="rtl">בָּב</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 155): the cite's
text reads "בָּב I", Sefaria links B00050 "בָּב II, בַּב נַהֲרָא", the
only family member numbered I is B00049 "בָּב, בָּאב, בָּבָא I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `בָּב I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): as above

Outcome (2026-10-27): confirmed. The working copy left both boxes blank; the confirm is the maintainer's decision of 2026-10-27, after a scan read. The cite is also Jastrow's own text naming B00049's form `בָּב` as I (10-05: the `I` print sets after `בָּבָא` numbers that form's sequence, not the first form's), so reform P000941 gives form 0 homograph I, displayed and annotated `print-error` (10-13 case 2).

### Family בַּד

#### B00211 · P000602

- **Entry**: B00211 `*בּוּדְיָא`, vol. 1, 144a, leaf 167.
  Entry file: [`data/entries/B/B00211.json`](../../../../../../data/entries/B/B00211.json)
- **Scan crop**: [scan 144a · leaf 167](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$168/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 167, line 89 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  a mat of reeds. [The best‏ (צ בד (denom. of‏ .6 בודיא*
  ```

  The parenthesis reads `(צ בד (denom. of`, mirrored; no `V` is read.
- **The cite as Sefaria has it**: `c. (denom. of בַּד V) a mat of reeds.
  [The best versions, ho…`
  Sefaria links B00097 `בַּד IV` (numeral IV on form 1, `בַּד`).
- **The patch's target**: B00098 `בַּד V` (numeral V on form 1, `בַּד`).
  Note: B00098 carries reviewed patch P000290 (`reform`,
  headword-separator; evidence `maintainer-read` 2026-10-25).
  Note: B00097 carries reviewed patch P000306 (`replace`,
  headword-separator-anchor; evidence `maintainer-read` 2026-10-25).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:08b20773`:

```text
<a class="refLink" href="/Jastrow,_בַּד IV.1" data-ref="Jastrow, בַּד IV 1"><span dir="rtl">בַּד</span> V</a>
→
<a class="refLink" href="/Jastrow,_בַּד V.1" data-ref="Jastrow, בַּד V 1"><span dir="rtl">בַּד</span> V</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 10): the cite's
text reads "בַּד V", Sefaria links B00097 "בַּד IV", the only family
member numbered V is B00098 "בַּד V".

</details>

**The maintainer's read**:

- [x] confirm — print reads `בַּד V` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

### Family בְּזֵי

#### B00981 · P000608

- **Entry**: B00981 `בסי, בְּסָא`, vol. 1, 178a, leaf 201.
  Entry file: [`data/entries/B/B00981.json`](../../../../../../data/entries/B/B00981.json)
- **Scan crop**: [scan 178a · leaf 201](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$202/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 201, line 85 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  WaT; cmp. us.‏ . ץצ to despise;‏ (ב-
  ```

  The cite sits between `to despise;` and `cmp.` on this line; no `I` is
  read.
- **The cite as Sefaria has it**: `(v. בסס) to trample upon; hence (with
  ב־) to despise; v. בְּזֵי I; cmp. בְּטַשׁ.`
  Sefaria links B00436 `בְּזֵי, בְּזָא II` (numeral II on form 2,
  `בְּזָא`).
- **The patch's target**: B00435 `בְּזֵי, בְּזָא I` (numeral I on form
  2, `בְּזָא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:3a7e2e8d`:

```text
<a class="refLink" href="/Jastrow,_בְּזֵי ².1" data-ref="Jastrow, בְּזֵי ² 1"><span dir="rtl">בְּזֵי</span> I</a>
→
<a class="refLink" href="/Jastrow,_בְּזֵי.1" data-ref="Jastrow, בְּזֵי 1"><span dir="rtl">בְּזֵי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 17): the cite's
text reads "בְּזֵי I", Sefaria links B00436 "בְּזֵי, בְּזָא II", the
only family member numbered I is B00435 "בְּזֵי, בְּזָא I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `בְּזֵי I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

#### O01224 · P000675

- **Entry**: O01224 `סְנֵי, סְנָא`, vol. 2, 1006b, leaf 329; continues
  onto 1007a (leaf 330).
  Entry file: [`data/entries/O/O01224.json`](../../../../../../data/entries/O/O01224.json)
- **Scan crop**: [scan 1006b · leaf 329](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$330/full/1400,/0/default.jpg) · [scan 1007a · leaf 330](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$331/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 330, line 11 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  v. supra) one whose reputation is bad, v. "^a I. lb. 14b
  ```

  On p. 1007a, the entry's second page. The numeral reads `I`: `is bad,
  v. "^a I.`
- **The cite as Sefaria has it**: `…M. (ed. דסְנָאֵי, v. supra) one
  whose reputation is bad, v. בְּזֵי I. Ib. 14ᵇ סַנְיָין שמייהו (Ms. M.
  סני; M…`
  Sefaria links B00436 `בְּזֵי, בְּזָא II` (numeral II on form 2,
  `בְּזָא`).
- **The patch's target**: B00435 `בְּזֵי, בְּזָא I` (numeral I on form
  2, `בְּזָא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:cf67e6d2`:

```text
<a class="refLink" href="/Jastrow,_בְּזֵי ².1" data-ref="Jastrow, בְּזֵי ² 1"><span dir="rtl">בְּזֵי</span> I</a>
→
<a class="refLink" href="/Jastrow,_בְּזֵי.1" data-ref="Jastrow, בְּזֵי 1"><span dir="rtl">בְּזֵי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 96): the cite's
text reads "בְּזֵי I", Sefaria links B00436 "בְּזֵי, בְּזָא II", the
only family member numbered I is B00435 "בְּזֵי, בְּזָא I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `בְּזֵי I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

### Family בִּיזָּא

#### B00224 · P000603

- **Entry**: B00224 `בּוּזְתָא, (בִּיזְתָא)`, vol. 1, 144b, leaf 167.
  Entry file: [`data/entries/B/B00224.json`](../../../../../../data/entries/B/B00224.json)
- **Scan crop**: [scan 144b · leaf 167](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$168/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 167, line 17 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Targ. Ps, OXIX, 22.—V. ד בֶּיזָא‎
  ```

  The line ends `V. ד בֶּיזָא`; no `II` is read.
- **The cite as Sefaria has it**: `(v. בוז) contempt, contumely. Targ.
  Ps. CXIX, 22.—V. בִּיזָּא II.`
  Sefaria links B00560 `בִּיזָּא I, בִּזָּא, בִּיזְתָא` (numeral I on
  form 1, `בִּיזָּא`).
- **The patch's target**: B00561 `בִּיזָּא, בִּזָּא II, בִּיזְתָא,
  בִּזְּתָא` (numeral II on form 2, `בִּזָּא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:d61b723a`:

```text
<a class="refLink" href="/Jastrow,_בִּיזָּא I.1" data-ref="Jastrow, בִּיזָּא I 1"><span dir="rtl">בִּיזָּא</span> II</a>
→
<a class="refLink" href="/Jastrow,_בִּיזָּא.1" data-ref="Jastrow, בִּיזָּא 1"><span dir="rtl">בִּיזָּא</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 11): the cite's
text reads "בִּיזָּא II", Sefaria links B00560 "בִּיזָּא I, בִּזָּא,
בִּיזְתָא", the only family member numbered II is B00561 "בִּיזָּא,
בִּזָּא II, בִּיזְתָא, בִּזְּתָא".

</details>

**The maintainer's read**:

- [x] confirm — print reads `בִּיזָּא II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

#### B00564 · P000607

- **Entry**: B00564 `בִּיזָּה`, vol. 1, 160a, leaf 183.
  Entry file: [`data/entries/B/B00564.json`](../../../../../../data/entries/B/B00564.json)
- **Scan crop**: [scan 160a · leaf 183](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$184/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 183, line 67 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  ib.; emp. NMI"2 s. v. NIB Il) 513 כמח‎ how often did
  ```

  The numeral reads `Il` (`s. v. NIB Il)`), not `II`.
- **The cite as Sefaria has it**: `…Lam. R. to II, 13 (ref. to אעידך
  ib.; cmp. בִּיזְּתָא s. v. בִּיזָּא II) כמה ב׳ וכ׳ how often did I
  give you th…`
  Sefaria links B00560 `בִּיזָּא I, בִּזָּא, בִּיזְתָא` (numeral I on
  form 1, `בִּיזָּא`).
- **The patch's target**: B00561 `בִּיזָּא, בִּזָּא II, בִּיזְתָא,
  בִּזְּתָא` (numeral II on form 2, `בִּזָּא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:08011bf4`:

```text
<a class="refLink" href="/Jastrow,_בִּיזָּא I.1" data-ref="Jastrow, בִּיזָּא I 1"><span dir="rtl">בִּיזָּא</span> II</a>
→
<a class="refLink" href="/Jastrow,_בִּיזָּא.1" data-ref="Jastrow, בִּיזָּא 1"><span dir="rtl">בִּיזָּא</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 16): the cite's
text reads "בִּיזָּא II", Sefaria links B00560 "בִּיזָּא I, בִּזָּא,
בִּיזְתָא", the only family member numbered II is B00561 "בִּיזָּא,
בִּזָּא II, בִּיזְתָא, בִּזְּתָא".

</details>

**The maintainer's read**:

- [x] confirm — print reads `בִּיזָּא II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

#### P00150 · P000683

- **Entry**: P00150 `עָדִיתָא, עֲדִיתָא II`, vol. 2, 1044b, leaf 367.
  Entry file: [`data/entries/P/P00150.json`](../../../../../../data/entries/P/P00150.json)
- **Scan crop**: [scan 1044b · leaf 367](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$368/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 367, lines 75–76 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Prov. XVI, 19.— Lam. R. to II, 13 (ref. to 7"H5N, ib.), v.
  NJiB II.— 2) choice dwelling, v. Kn*pS.
  ```

  Line 75 ends `ib.), v.`; line 76 opens `NJiB II.—`. The numeral reads
  `II`.
- **The cite as Sefaria has it**: `…. Prov. XVI, 19.—Lam. R. to II, 13
  (ref. to אעידך, ib.), v. בִּיזָּא II.`
  Sefaria links B00560 `בִּיזָּא I, בִּזָּא, בִּיזְתָא` (numeral I on
  form 1, `בִּיזָּא`).
- **The patch's target**: B00561 `בִּיזָּא, בִּזָּא II, בִּיזְתָא,
  בִּזְּתָא` (numeral II on form 2, `בִּזָּא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:9e979845`:

```text
<a class="refLink" href="/Jastrow,_בִּיזָּא I.1" data-ref="Jastrow, בִּיזָּא I 1"><span dir="rtl">בִּיזָּא</span> II</a>
→
<a class="refLink" href="/Jastrow,_בִּיזָּא.1" data-ref="Jastrow, בִּיזָּא 1"><span dir="rtl">בִּיזָּא</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 104): the cite's
text reads "בִּיזָּא II", Sefaria links B00560 "בִּיזָּא I, בִּזָּא,
בִּיזְתָא", the only family member numbered II is B00561 "בִּיזָּא,
בִּזָּא II, בִּיזְתָא, בִּזְּתָא".

</details>

**The maintainer's read**:

- [x] confirm — print reads `בִּיזָּא II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

### Family בַּר

#### B01237 · P000610

- **Entry**: B01237 `ברי, בְּרָא`, vol. 1, 192a, leaf 215; continues
  into 192b, same leaf.
  Entry file: [`data/entries/B/B01237.json`](../../../../../../data/entries/B/B01237.json)
- **Scan crop**: [scan 192a · leaf 215](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$216/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 215, line 44 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  so strong &c.) .--9( (v. "2 I, 8232) to grow wild. וא‎ 0
  ```

  The numeral reads `I`: `(v. "2 I, 8232) to grow wild`.
- **The cite as Sefaria has it**: `(v. בַּר I, בָּרָא) to grow wild.
  Nidd. 50ᵇ (expla…`
  Sefaria links B01156 `בַּר IV, בָּר` (numeral IV on form 1, `בַּר`).
- **The patch's target**: B01152 `בַּר I` (numeral I on form 1, `בַּר`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—3)]:7e0e1394`:

```text
<a class="refLink" href="/Jastrow,_בַּר IV.1" data-ref="Jastrow, בַּר IV 1"><span dir="rtl">בַּר</span> I</a>
→
<a class="refLink" href="/Jastrow,_בַּר I.1" data-ref="Jastrow, בַּר I 1"><span dir="rtl">בַּר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 24): the cite's
text reads "בַּר I", Sefaria links B01156 "בַּר IV, בָּר", the only
family member numbered I is B01152 "בַּר I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `בַּר I` and the numeral names the target
  above
- [x] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): The reference specifies the aramic entry, so I believe B01153 is the correct target.

Outcome (2026-10-27): re-aimed at B01153 (not withdrawn). The line is Aramaic, so the cite names the `ch.` line B01153 `בַּר, בָּר, בָּרָא`, not Hebrew B01152 `בַּר I`; the patch now aims at B01153 by its link key (`בַּר`), as P000795 does for this family's `בַּר I ch.`. This goes beyond 10-15's letter: the cite carries no `ch.`, and the target rests on the maintainer's read of the line's language.

#### N00106 · P000648

- **Entry**: N00106 `נְבָרָא, נְבָארָא`, vol. 2, 870b, leaf 193;
  continues onto 871a (leaf 194).
  Entry file: [`data/entries/N/N00106.json`](../../../../../../data/entries/N/N00106.json)
- **Scan crop**: [scan 870b · leaf 193](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$194/full/1400,/0/default.jpg) · [scan 871a · leaf 194](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$195/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 193, line 107 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  ^133, SHS23 m. (cmp. 12 I ; corresp. to h. 3^C)
  ```

  The numeral reads `I`: `(cmp. 12 I ;`.
- **The cite as Sefaria has it**: `(cmp. בַּר I; corresp. to h. סִיב)
  covering, bast, b…`
  Sefaria links B01156 `בַּר IV, בָּר` (numeral IV on form 1, `בַּר`).
- **The patch's target**: B01152 `בַּר I` (numeral I on form 1, `בַּר`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:65cb1da7`:

```text
<a class="refLink" href="/Jastrow,_בַּר IV.1" data-ref="Jastrow, בַּר IV 1"><span dir="rtl">בַּר</span> I</a>
→
<a class="refLink" href="/Jastrow,_בַּר I.1" data-ref="Jastrow, בַּר I 1"><span dir="rtl">בַּר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 68): the cite's
text reads "בַּר I", Sefaria links B01156 "בַּר IV, בָּר", the only
family member numbered I is B01152 "בַּר I".

</details>

**The maintainer's read**:

- [ ] confirm — print reads `בַּר I` and the numeral names the target
  above
- [x] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): In this case the referent is armaic, and while the reference does not spcify the aramaic version, the language of the full line (compare to hebrew) makes be belive it is.  As such it would target B01153 .

I also think this gives enough evidence to add I to B01153 with anotation.

Outcome (2026-10-27): re-aimed at B01153 (not withdrawn). The line is Aramaic, so the cite names the `ch.` line B01153 `בַּר, בָּר, בָּרָא`, not Hebrew B01152 `בַּר I`; the patch now aims at B01153 by its link key (`בַּר`), as P000795 does for this family's `בַּר I ch.`. This goes beyond 10-15's letter: the cite carries no `ch.`, and the target rests on the maintainer's read of the line's language.

B01153 takes no homograph: by 10-15 a `ch.` line carries no numeral, and `בַּר I` would collide with B01152 `בַּר I` in the names gate (`nameCollisions`, `admin/entry/validate.ts`). The maintainer asked; the answer is no (2026-10-27).

#### V00196 · P000782

- **Entry**: V00196 `תּוֹךְ II`, vol. 2, 1652a, leaf 975; continues into
  1652b, same leaf.
  Entry file: [`data/entries/V/V00196.json`](../../../../../../data/entries/V/V00196.json)
- **Scan crop**: [scan 1652a · leaf 975](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$976/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 975, line 53 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  thereby. Yoma 72b, v. 131; a. fr. — PI. nisin. Gitt. 20a
  ```

  The cite reads `v. 131;`; no separate `I` is read.
- **The cite as Sefaria has it**: `…e unclean, its inside is not
  affected thereby. Yoma 72ᵇ, v. בַּר I; a. fr.—Pl. תּוֹכוֹת. Gitt. 20ᵃ
  חק ת׳,…`
  Sefaria links B01156 `בַּר IV, בָּר` (numeral IV on form 1, `בַּר`).
- **The patch's target**: B01152 `בַּר I` (numeral I on form 1, `בַּר`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:92ffc07d`:

```text
<a class="refLink" href="/Jastrow,_בַּר IV.1" data-ref="Jastrow, בַּר IV 1"><span dir="rtl">בַּר</span> I</a>
→
<a class="refLink" href="/Jastrow,_בַּר I.1" data-ref="Jastrow, בַּר I 1"><span dir="rtl">בַּר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 213): the cite's
text reads "בַּר I", Sefaria links B01156 "בַּר IV, בָּר", the only
family member numbered I is B01152 "בַּר I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `בַּר I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): This one is hebrew not aramic, so I think you are correct.

### Family גִּיב

#### C00269 · P000612

- **Entry**: C00269 `גּוּב`, vol. 1, 216b, leaf 239.
  Entry file: [`data/entries/C/C00269.json`](../../../../../../data/entries/C/C00269.json)
- **Scan crop**: [scan 216b · leaf 239](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$240/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 239, line 52 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Pa..3, v.25 1. [Targ. Adieu, "‏ ,גרב
  ```

  The numeral reads as the digit: `v.25 1.`; no `I` is read.
- **The cite as Sefaria has it**: `גַּיֵּיב, v. גִּיב I. [Targ. Prov.
  IX, 3 Ms., v. גִּיב II.]`
  Sefaria links C00610 `גִּיב II` (numeral II on form 1, `גִּיב`).
- **The patch's target**: C00609 `גִּיב I, גּוּב` (numeral I on form 1,
  `גִּיב`).
  Note: C00609 carries reviewed patch P000321 (`reform`,
  headword-numeral-dropped; evidence `maintainer-read` 2026-10-06).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:ca7a3a32`:

```text
<a class="refLink" href="/Jastrow,_גִּיב II.1" data-ref="Jastrow, גִּיב II 1"><span dir="rtl">גִּיב</span> I</a>
→
<a class="refLink" href="/Jastrow,_גִּיב.1" data-ref="Jastrow, גִּיב 1"><span dir="rtl">גִּיב</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 26): the cite's
text reads "גִּיב I", Sefaria links C00610 "גִּיב II", the only family
member numbered I is C00609 "גִּיב I, גּוּב".

</details>

**The maintainer's read**:

- [x] confirm — print reads `גִּיב I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): Your patch is bad.  Since there is another patch that will lable C00609 with I, this patch needs to use that.

Resolved (2026-10-27): the patch is right as written. Links resolve by `sefariaHeadword` (ruling `10-09 link key`), and C00609's key is `גִּיב` whatever numeral P000321's reform displays, so `href="/Jastrow,_גִּיב.1"` already names C00609. Confirm ticked on the maintainer's decision of 2026-10-27; the working copy left both boxes blank.

### Family גִּשְׁתָּא

#### H00519 · P000624

- **Entry**: H00519 `חָזוּתָא`, vol. 1, 442b, leaf 465.
  Entry file: [`data/entries/H/H00519.json`](../../../../../../data/entries/H/H00519.json)
- **Scan crop**: [scan 442b · leaf 465](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$466/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 465, line 35 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Hull. 47" M2 resembling wood in appearance, v, NMWA I.
  ```

  The numeral reads `I`: `in appearance, v, NMWA I.`
- **The cite as Sefaria has it**: `…mprovement. Ḥull. 47ᵇ בח׳ resembling
  wood in appearance, v. גִּשְׁתָּא I. Sabb. 77ᵃ התם משום ח׳ there it
  treats…`
  Sefaria links C01428 `גִּשְׁתָּא, גִּישְׁ׳ II` (numeral II on form 2,
  `גִּישְׁ׳`).
- **The patch's target**: C01427 `גִּשְׁתָּא, גִּישְׁ׳ I` (numeral I on
  form 2, `גִּישְׁ׳`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—3)]:233c91ff`:

```text
<a class="refLink" href="/Jastrow,_גִּשְׁתָּא ².1" data-ref="Jastrow, גִּשְׁתָּא ² 1"><span dir="rtl">גִּשְׁתָּא</span> I</a>
→
<a class="refLink" href="/Jastrow,_גִּשְׁתָּא.1" data-ref="Jastrow, גִּשְׁתָּא 1"><span dir="rtl">גִּשְׁתָּא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 39): the cite's
text reads "גִּשְׁתָּא I", Sefaria links C01428 "גִּשְׁתָּא, גִּישְׁ׳
II", the only family member numbered I is C01427 "גִּשְׁתָּא, גִּישְׁ׳
I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `גִּשְׁתָּא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

### Family דּוּרָא

#### D00353 · P000618

- **Entry**: D00353 `*דּוּרַאי`, vol. 1, 289b, leaf 312.
  Entry file: [`data/entries/D/D00353.json`](../../../../../../data/entries/D/D00353.json)
- **Scan crop**: [scan 289b · leaf 312](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$313/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 312, lines 14–15 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  es, 25° (Ma, M. WT; Rashi: the lord of my eillage,‏
  eT).‏ ,¥
  ```

  Line 14 ends `the lord of my eillage,`; the cite is on line 15, which
  reads `eT). ,¥`. No `I` is read.
- **The cite as Sefaria has it**: `…; Pes. 25ᵇ (Ms. M. דודאי; Rashi: the
  lord of my village, v. דּוּרָא I).`
  Sefaria links D00351 `*דּוּרָא IV` (numeral IV on form 1, `דּוּרָא`).
- **The patch's target**: D00347 `דּוּרָא I` (numeral I on form 1,
  `דּוּרָא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:de64f405`:

```text
<a class="refLink" href="/Jastrow,_*דּוּרָא IV.1" data-ref="Jastrow, *דּוּרָא IV 1"><span dir="rtl">דּוּרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_דּוּרָא I.1" data-ref="Jastrow, דּוּרָא I 1"><span dir="rtl">דּוּרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 32): the cite's
text reads "דּוּרָא I", Sefaria links D00351 "דּוּרָא IV", the only
family member numbered I is D00347 "דּוּרָא I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `דּוּרָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

#### D00361 · P000619

- **Entry**: D00361 `דּוּרָה`, vol. 1, 289b, leaf 312.
  Entry file: [`data/entries/D/D00361.json`](../../../../../../data/entries/D/D00361.json)
- **Scan crop**: [scan 289b · leaf 312](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$313/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 312, line 40 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  .זז ,1 wes‏ .+ ,דורה
  ```

  The entry reads `v. דּוּרָא I, II`; the line reads `,1 wes`, mirrored,
  the numeral as the digit `1`. No `I` is read.
- **The cite as Sefaria has it**: `, v. דּוּרָא I, II.`
  Sefaria links D00351 `*דּוּרָא IV` (numeral IV on form 1, `דּוּרָא`).
- **The patch's target**: D00347 `דּוּרָא I` (numeral I on form 1,
  `דּוּרָא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:8dc18983`:

```text
<a class="refLink" href="/Jastrow,_*דּוּרָא IV.1" data-ref="Jastrow, *דּוּרָא IV 1"><span dir="rtl">דּוּרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_דּוּרָא I.1" data-ref="Jastrow, דּוּרָא I 1"><span dir="rtl">דּוּרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 33): the cite's
text reads "דּוּרָא I", Sefaria links D00351 "דּוּרָא IV", the only
family member numbered I is D00347 "דּוּרָא I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `דּוּרָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

### Family דִּילְמָא

#### D00844 · P000620

- **Entry**: D00844 `דִּלְמָא I, II,`, vol. 1, 310b, leaf 333.
  Entry file: [`data/entries/D/D00844.json`](../../../../../../data/entries/D/D00844.json)
- **Scan crop**: [scan 310b · leaf 333](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$334/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 333, line 46 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  nT 1, 11, v. webs J, זז‎
  ```

  The line opens with the headword's `1, 11,`; after the cite it reads
  `v. webs J,`, the numeral as `J`. No `I` is read.
- **The cite as Sefaria has it**: `v. דִּילְמָא I, II.`
  Sefaria links D00608 `דִּילְמָא, דִּלְמָא II` (numeral II on form 2,
  `דִּלְמָא`).
- **The patch's target**: D00607 `דִּילְמָא, דִּלְמָא I` (numeral I on
  form 2, `דִּלְמָא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:6257cec6`:

```text
<a class="refLink" href="/Jastrow,_דִּילְמָא ².1" data-ref="Jastrow, דִּילְמָא ² 1"><span dir="rtl">דִּילְמָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_דִּילְמָא.1" data-ref="Jastrow, דִּילְמָא 1"><span dir="rtl">דִּילְמָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 35): the cite's
text reads "דִּילְמָא I", Sefaria links D00608 "דִּילְמָא, דִּלְמָא II",
the only family member numbered I is D00607 "דִּילְמָא, דִּלְמָא I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `דִּילְמָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

#### U01409 · P000765

- **Entry**: U01409 `שֶׁמָּא`, vol. 2, 1591a, leaf 914.
  Entry file: [`data/entries/U/U01409.json`](../../../../../../data/entries/U/U01409.json)
- **Scan crop**: [scan 1591a · leaf 914](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$915/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 914, line 40 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  SSw (=ntt^, v.KaVnl) [/"or why,-] 1) lest, perhaps.
  ```

  The cite reads as one token, `v.KaVnl)`; no separate numeral is read.
- **The cite as Sefaria has it**: `(= שַׁלָּמָּה, v. דִּילְמָא I) [for
  why,]`
  Sefaria links D00608 `דִּילְמָא, דִּלְמָא II` (numeral II on form 2,
  `דִּלְמָא`).
- **The patch's target**: D00607 `דִּילְמָא, דִּלְמָא I` (numeral I on
  form 2, `דִּלְמָא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:7b3a71c3`:

```text
<a class="refLink" href="/Jastrow,_דִּילְמָא ².1" data-ref="Jastrow, דִּילְמָא ² 1"><span dir="rtl">דִּילְמָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_דִּילְמָא.1" data-ref="Jastrow, דִּילְמָא 1"><span dir="rtl">דִּילְמָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 195): the cite's
text reads "דִּילְמָא I", Sefaria links D00608 "דִּילְמָא, דִּלְמָא II",
the only family member numbered I is D00607 "דִּילְמָא, דִּלְמָא I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `דִּילְמָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

#### U01539 · P000767

- **Entry**: U01539 `שָׁמַשׁ, שִׁימֵּשׁ`, vol. 2, 1601b, leaf 924;
  continues onto 1602a (leaf 925).
  Entry file: [`data/entries/U/U01539.json`](../../../../../../data/entries/U/U01539.json)
- **Scan crop**: [scan 1601b · leaf 924](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$925/full/1400,/0/default.jpg) · [scan 1602a · leaf 925](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$926/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 924, line 106 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  v. X33"|ll; a. fr. — Euphem. iroB '83, or only '83 to per-
  ```

  The cite reads `v. X33"|ll;`; no separate `I` is read.
- **The cite as Sefaria has it**: `…R. Hash. 3ᵃ כי משמש וכ׳ ki serves
  for four meanings &c., v. דִּילְמָא I; a. fr.—Euphem. ש׳ מטתו, or only
  ש׳ to…`
  Sefaria links D00608 `דִּילְמָא, דִּלְמָא II` (numeral II on form 2,
  `דִּלְמָא`).
- **The patch's target**: D00607 `דִּילְמָא, דִּלְמָא I` (numeral I on
  form 2, `דִּלְמָא`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:d4e349e0`:

```text
<a class="refLink" href="/Jastrow,_דִּילְמָא ².1" data-ref="Jastrow, דִּילְמָא ² 1"><span dir="rtl">דִּילְמָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_דִּילְמָא.1" data-ref="Jastrow, דִּילְמָא 1"><span dir="rtl">דִּילְמָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 197): the cite's
text reads "דִּילְמָא I", Sefaria links D00608 "דִּילְמָא, דִּלְמָא II",
the only family member numbered I is D00607 "דִּילְמָא, דִּלְמָא I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `דִּילְמָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

### Family דִּיסְתָּנָא

#### D01149 · P000621

- **Entry**: D01149 `דָּשְׁנָא, דִּישְׁנָא`, vol. 1, 326b, leaf 349.
  Entry file: [`data/entries/D/D01149.json`](../../../../../../data/entries/D/D01149.json)
- **Scan crop**: [scan 326b · leaf 349](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$350/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 349, line 28 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  such a gift, 1. 6. is this an adequate reward? V. רִסְמֶנָא‎ 1.
  ```

  The numeral reads as the digit: `V. רִסְמֶנָא 1.`; no `I` is read.
- **The cite as Sefaria has it**: `…treat for such a gift, i.e. is this
  an adequate reward? V. דִּיסְתָּנָא I.`
  Sefaria links D00668 `דִּיסְתָּנָא, דִּסְ׳ II` (numeral II on form 2,
  `דִּסְ׳`).
- **The patch's target**: D00667 `דִּיסְתָּנָא, דִּסְ׳ I` (numeral I on
  form 2, `דִּסְ׳`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:a11cd7bb`:

```text
<a class="refLink" href="/Jastrow,_דִּיסְתָּנָא ².1" data-ref="Jastrow, דִּיסְתָּנָא ² 1"><span dir="rtl">דִּיסְתָּנָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_דִּיסְתָּנָא.1" data-ref="Jastrow, דִּיסְתָּנָא 1"><span dir="rtl">דִּיסְתָּנָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 36): the cite's
text reads "דִּיסְתָּנָא I", Sefaria links D00668 "דִּיסְתָּנָא, דִּסְ׳
II", the only family member numbered I is D00667 "דִּיסְתָּנָא, דִּסְ׳
I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `דִּיסְתָּנָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

#### H01243 · P000626

- **Entry**: H01243 `חֲמָתָא`, vol. 1, 481a, leaf 504.
  Entry file: [`data/entries/H/H01243.json`](../../../../../../data/entries/H/H01243.json)
- **Scan crop**: [scan 481a · leaf 504](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$505/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 504, line 74 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Bitt, 67" bot, (Ar. ,(חטותא‎ +. IMO 1. Kidd.
  ```

  The numeral reads as the digit: `+. IMO 1. Kidd.`; no `I` is read.
- **The cite as Sefaria has it**: `…. XXVII, 23 (Var. חֲמוֹתָא).—Gitt.
  67ᵇ bot. (Ar. חמותא), v. דִּיסְתָּנָא I. Kidd. 12ᵇ חֲמָתֵיה; Yeb. 52ᵃ
  חימתיה (c…`
  Sefaria links D00668 `דִּיסְתָּנָא, דִּסְ׳ II` (numeral II on form 2,
  `דִּסְ׳`).
- **The patch's target**: D00667 `דִּיסְתָּנָא, דִּסְ׳ I` (numeral I on
  form 2, `דִּסְ׳`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:57a5c6e1`:

```text
<a class="refLink" href="/Jastrow,_דִּיסְתָּנָא ².1" data-ref="Jastrow, דִּיסְתָּנָא ² 1"><span dir="rtl">דִּיסְתָּנָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_דִּיסְתָּנָא.1" data-ref="Jastrow, דִּיסְתָּנָא 1"><span dir="rtl">דִּיסְתָּנָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 41): the cite's
text reads "דִּיסְתָּנָא I", Sefaria links D00668 "דִּיסְתָּנָא, דִּסְ׳
II", the only family member numbered I is D00667 "דִּיסְתָּנָא, דִּסְ׳
I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `דִּיסְתָּנָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

#### H01325 · P000627

- **Entry**: H01325 `חֲנַק`, vol. 1, 485a, leaf 508; continues into
  485b, same leaf.
  Entry file: [`data/entries/H/H01325.json`](../../../../../../data/entries/H/H01325.json)
- **Scan crop**: [scan 485a · leaf 508](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$509/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 1 leaf 508, line 24 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  him; .א‎ o7® MEE, / 1.
  ```

  The line sits between `would rather choke` (line 23) and `to hang
  one's self` (line 25); it reads `/ 1.` where the cite stands, the
  numeral as the digit `1`. No `I` is read.
- **The cite as Sefaria has it**: `…נֵיה I would rather choke him; a.
  e.—Gitt. 67ᵇ דחַנְקָא, v. דִּיסְתָּנָא I.`
  Sefaria links D00668 `דִּיסְתָּנָא, דִּסְ׳ II` (numeral II on form 2,
  `דִּסְ׳`).
- **The patch's target**: D00667 `דִּיסְתָּנָא, דִּסְ׳ I` (numeral I on
  form 2, `דִּסְ׳`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:13ef5476`:

```text
<a class="refLink" href="/Jastrow,_דִּיסְתָּנָא ².1" data-ref="Jastrow, דִּיסְתָּנָא ² 1"><span dir="rtl">דִּיסְתָּנָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_דִּיסְתָּנָא.1" data-ref="Jastrow, דִּיסְתָּנָא 1"><span dir="rtl">דִּיסְתָּנָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 42): the cite's
text reads "דִּיסְתָּנָא I", Sefaria links D00668 "דִּיסְתָּנָא, דִּסְ׳
II", the only family member numbered I is D00667 "דִּיסְתָּנָא, דִּסְ׳
I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `דִּיסְתָּנָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

#### T00665 · P000741

- **Entry**: T00665 `ריסתנא`, vol. 2, 1475b, leaf 798.
  Entry file: [`data/entries/T/T00665.json`](../../../../../../data/entries/T/T00665.json)
- **Scan crop**: [scan 1475b · leaf 798](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$799/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 798, line 71 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  &On©*H, v. fconp1*] I.
  ```

  The numeral reads `I`: `v. fconp1*] I.`
- **The cite as Sefaria has it**: `, v. דִּיסְתָּנָא I`
  Sefaria links D00668 `דִּיסְתָּנָא, דִּסְ׳ II` (numeral II on form 2,
  `דִּסְ׳`).
- **The patch's target**: D00667 `דִּיסְתָּנָא, דִּסְ׳ I` (numeral I on
  form 2, `דִּסְ׳`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:c03f4b42`:

```text
<a class="refLink" href="/Jastrow,_דִּיסְתָּנָא ².1" data-ref="Jastrow, דִּיסְתָּנָא ² 1"><span dir="rtl">דִּיסְתָּנָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_דִּיסְתָּנָא.1" data-ref="Jastrow, דִּיסְתָּנָא 1"><span dir="rtl">דִּיסְתָּנָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 169): the cite's
text reads "דִּיסְתָּנָא I", Sefaria links D00668 "דִּיסְתָּנָא, דִּסְ׳
II", the only family member numbered I is D00667 "דִּיסְתָּנָא, דִּסְ׳
I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `דִּיסְתָּנָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

### Family זִימָּה

#### U00736 · P000754

- **Entry**: U00736 `שָׁטוּף`, vol. 2, 1552b, leaf 875; continues onto
  1553a (leaf 876).
  Entry file: [`data/entries/U/U00736.json`](../../../../../../data/entries/U/U00736.json)
- **Scan crop**: [scan 1552b · leaf 875](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$876/full/1400,/0/default.jpg) · [scan 1553a · leaf 876](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$877/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 875, line 107 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  passion, dissolute. Sabb. 152a, v.ffipir I; a.e.— PI. ^SiaiD.
  ```

  The numeral reads `I`: `v.ffipir I;`.
- **The cite as Sefaria has it**: `carried away by passion, dissolute.
  Sabb. 152ᵃ, v. זִימָּה I; a. e.—Pl. שְׁטוּפִין. Num. R. s. 2022…`
  Sefaria links G00362 `זִימָּה, זִמָּה II` (numeral II on form 2,
  `זִמָּה`).
- **The patch's target**: G00361 `זִימָּה, זִמָּה I` (numeral I on form
  2, `זִמָּה`).
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:a6dcdf5f`:

```text
<a class="refLink" href="/Jastrow,_זִימָּה ².1" data-ref="Jastrow, זִימָּה ² 1"><span dir="rtl">זִימָּה</span> I</a>
→
<a class="refLink" href="/Jastrow,_זִימָּה.1" data-ref="Jastrow, זִימָּה 1"><span dir="rtl">זִימָּה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 184): the cite's
text reads "זִימָּה I", Sefaria links G00362 "זִימָּה, זִמָּה II", the
only family member numbered I is G00361 "זִימָּה, זִמָּה I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `זִימָּה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-27): confirmed by tick, no free-text read.

## Summary

| | count |
|---|---|
| records | 31 |
| entries | 30 |
| families | 14 |
| hOCR line found | 30 |
| of those, the hOCR reads the numeral the cite names | 10 |
| of those, the numeral is misread (`1`, `l`, `Il`, `J`, `צ`) or not read | 20 |
| no hOCR line found | 1 |

**The hOCR reads the numeral (10)**: B01237 (P000610), H00519
(P000624), N00106 (P000648), O01224 (P000675), O01590 (P000678),
P00118 (P000682), P00150 (P000683), S01439 (P000727), T00665
(P000741), U00736 (P000754).

**No hOCR line found (1)**: A00895 (P000597). Leaf 57 holds the
entry's stub among five short lines the hOCR cannot tell apart; the
scan decides.

The other 20 have a line, located by the Latin around the cite, on
which the hOCR does not read the cite's numeral. Their read is the
scan's.

| family | rids | patch ids | leaf(s) | hOCR line found (y/n) |
|---|---|---|---|---|
| אָדָא | D00003, D00003, P00118 | P000616, P000617, P000682 | 298, 298, 366 | y, y, y (reads numeral) |
| אוּרְיָא | A00895 | P000597 | 57 | n |
| אִסְטְרַטְיָא | A02560, O01590 | P000598, P000678 | 121, 348 | y, y (reads numeral) |
| בָּב | B00051, B00058, M02321, S01439 | P000600, P000601, P000640, P000727 | 159, 159, 149, 706 | y, y, y, y (reads numeral) |
| בַּד | B00211 | P000602 | 167 | y |
| בְּזֵי | B00981, O01224 | P000608, P000675 | 201, 330 | y, y (reads numeral) |
| בִּיזָּא | B00224, B00564, P00150 | P000603, P000607, P000683 | 167, 183, 367 | y, y, y (reads numeral) |
| בַּר | B01237, N00106, V00196 | P000610, P000648, P000782 | 215, 193, 975 | y (reads numeral), y (reads numeral), y |
| גִּיב | C00269 | P000612 | 239 | y |
| גִּשְׁתָּא | H00519 | P000624 | 465 | y (reads numeral) |
| דּוּרָא | D00353, D00361 | P000618, P000619 | 312, 312 | y, y |
| דִּילְמָא | D00844, U01409, U01539 | P000620, P000765, P000767 | 333, 914, 924 | y, y, y |
| דִּיסְתָּנָא | D01149, H01243, H01325, T00665 | P000621, P000626, P000627, P000741 | 349, 504, 508, 798 | y, y, y, y (reads numeral) |
| זִימָּה | U00736 | P000754 | 875 | y (reads numeral) |

## After the reads

A follow-up PR sets each record's `evidence` from its tick, removes
`pending`, and changes nothing else in the record:

- **confirm** → `evidence.kind` `maintainer-read`, with `reader`,
  `date`, `volume` and `leaf` (the leaf the block names), e.g.
  `{"date": "2026-10-28", "kind": "maintainer-read", "leaf": 57,
  "reader": "Brian", "volume": 1}`. Where the hOCR line
  above reads the numeral, it may be quoted in the rationale as well;
  the `kind` stays the read.
- **withdraw** → the record leaves `reviewed/patches.jsonl` for
  `docs/archive/patches-retired-<date>/`, and the cite's link goes
  back to Sefaria's target.
- A block with both boxes ticked, or a `Read:` line that disagrees with
  the hOCR line, goes back for a second read. Its record is left as it
  is, `sefaria-only` and `pending`, so the import keeps applying it as
  it does today; only its evidence update waits. A retarget the read
  puts in dispute is set `status: provisional` in that PR, which holds
  it out of the apply (DESIGN §5 "Patch process").

The from-scratch import (`rm -rf data/entries/[A-Z] && bun data:import
&& bun qa:format`) is the witness: a confirm changes no entry file, and
each withdraw changes one cite `ref` in its entry.

## For the maintainer

One question before the read: **for the 10 blocks where the hOCR reads
the numeral, is the hOCR quote enough, or does every block need a scan
read?** The hOCR can witness the numeral, but not the cite's Hebrew
word, and the target depends on the word too: the patch picks a member
of the word's family. Recommendation: a scan read for all 31, since no
one has read the cite word in print for any of them. Default if
unanswered: all 31 are read against the scan, as the blocks are set
up.
