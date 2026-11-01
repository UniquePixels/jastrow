# C5: cite retargets ש–ת, maintainer re-read (prepared 2026-10-31, read 2026-10-31)

Group 3, batch 5 of 12, of
[`docs/review-checklist-2026-10-25.md`](../../../../../../docs/review-checklist-2026-10-25.md):
the 27 pending cite retargets whose family starts with ש–ת, one
maintainer block each, with the maintainer's reads of 2026-10-31 and
their application (§ Applied), as C1's, C2's, C3's and C4's were
([`c1-rereads-2026-10-27`](../c1-rereads-2026-10-27/README.md), PR #200;
[`c2-rereads-2026-10-27`](../c2-rereads-2026-10-27/README.md), PR #202;
[`c3-rereads-2026-10-30`](../c3-rereads-2026-10-30/README.md), PR #203;
[`c4-rereads-2026-10-30`](../c4-rereads-2026-10-30/README.md), PR #204).
This directory holds only this README; the records changed are in
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl).
C5 is the last cite-retarget batch: with its reads applied, no record
of `cite-retargets-2026-10-15` is `pending`.

## Why these 27

Ruling `10-26 patch evidence`
([`docs/decisions.md`](../../../../../../docs/decisions.md)): every
reviewed patch carries `evidence`, and the import refuses a
text-changing patch that stands on Sefaria's text alone unless it is
`pending`. The backfill
([`evidence-backfill-2026-10-26`](../evidence-backfill-2026-10-26/README.md))
left all 27 here as `{"kind": "sefaria-only", "pending": true}`. They
still apply.

All 27 are retargets from
[`cite-retargets-2026-10-15`](../cite-retargets-2026-10-15/README.md)
(PR #178), case 1 of ruling `10-13 correction policy`: the cite's text
(`v. שָׁחוֹר I`) is Jastrow's, Sefaria's linker aimed it at a member of
the word's family that lacks the numeral, and the patch re-aims it at
the one member that carries it. No print was read when they were
written. The read turns each into `maintainer-read` (a scan read),
`hOCR` (a Latin-only claim, quoted verbatim) or `jastrow-text`, or
withdraws the patch, or re-aims it (§ Applied).

## The set

The checklist's predicate, run on
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl) at
`c29945a52`:

```bash
P=admin/pipeline/patch/records/reviewed/patches.jsonl
D='def fam: .rationale | capture("cite.s text reads [\"`](?<w>[^\"`]+)[\"`]").w | explode | map(select(. >= 1488 and . <= 1514)) | implode | .[0:1];
def retarget: .evidence.pending and .prompt_version == "cite-retargets-2026-10-15";'
jq -c "$D select(retarget and fam >= \"ש\" and fam <= \"ת\")" $P
```

**27 records over 26 entries, 15 families**, as the checklist's table
says. The same predicate without the family bounds returns these 27 and
no others: they are every `pending` record of
`cite-retargets-2026-10-15` left. One entry holds two records:

- V00728 `תַּנּוּיֵי` holds P000785 and P000786, a chained pair in its
  one sense, which cites `תְּנֵי I` twice (`(infin. Pa. of תְּנֵי I)` in
  the gloss head and `[Ib. 49ᵃ, v. תְּנֵי I]` at its end). P000785's
  `find` carries the `)` and space after the first cite, which makes
  that cite its only match; P000786 applies on the definition P000785
  leaves, where its `find` matches the second cite alone (in the
  definition as Sefaria has it, that `find` matches both).

Chained means the second record's `expected_before` is the first's with
the first applied, and its target hash differs for that reason (checked
by script, which reads C4's Q00839 as chained and R00687 as not). A
family is the cite word's consonants (ruling 10-05). The 27 ids below
equal the predicate's output (diffed).

Every citing entry is in vol. 2: the page index
([`data/page-index/`](../../../../../../data/page-index/README.md))
places all 26 on pages 1241–1703, whose `columns.jsonl` leaves (564–1026)
are page − 677, as its "Scan coordinates" give.

Checked by script on all 27:

- each is a `replace`, not `status: provisional`, whose `payload.find`
  occurs in `expected_before` once, and whose `payload.find` and
  `payload.replace` differ only in the anchor's `href` and `data-ref`,
  the visible text the same;
- the old `href` and `data-ref` are the link key (`sefariaHeadword`) of
  the entry Sefaria links, the new ones the target's (the same checks
  with `find` and `replace` swapped fail on all 27);
- the target is the one entry of the family (every entry with a
  headword form of the cite word's consonants) that carries the cite's
  numeral on a headword form, and the entry Sefaria links does not carry
  it: on 26 it carries a different numeral, and on P000761 it (U01306)
  carries none (see that block);
- none of the 27 cites is followed by `ch.` in the entry as it stands.

`removes` is absent on all 195 records of `cite-retargets-2026-10-15`
(27 of them pending at `c29945a52`, all C5's), so every block's
**Removes** line says none.

## How to read a block

Each block gives the entry, the scan link at the leaf the page index
gives it, and the hOCR line that holds the cite, first. The proposal
is last and collapsed. Read the print, then tick **one** box and write
what print shows on the `Read:` line. To re-aim a cite at another
target, tick withdraw and name that target on the `Read:` line, as C1's
B01237 and N00106 were
([C1 § Applied](../c1-rereads-2026-10-27/README.md#applied-2026-10-27)).
A block with both boxes ticked goes back to the reader
([`DESIGN.md` §5 "Patch process"](../../../../DESIGN.md#patch-process)).

**What the hOCR can witness.** Latin text, numerals, punctuation and
position only, never a Hebrew reading
([`DESIGN.md` §5 "Patch evidence"](../../../../DESIGN.md#patch-evidence)).
The Roman numeral after the cite word is Latin, so the hOCR can witness
it; the Hebrew word before it needs the scan. **Every citing entry here
is in vol. 2**, whose hOCR (ABBYY 8) holds no Hebrew character at all
(none on any quoted line, checked by script). ABBYY read the Hebrew
type as Latin letters, digits and marks, so each Hebrew word stands in
a quoted line as a run like `KW5` or `TWrtJ`: that run is not a reading
of the Hebrew, and it is not repeated per block. A line set in Hebrew
alone can drop out or garble: six blocks here are one-line
cross-references (U00254, U00526, U00629, U01241, V00155, V00921), each
located by the lines of the entries before and after it, and the
vol. 2 hOCR drops such lines elsewhere (C4's M02374 and Q00500). Here
every one has a line, but U01241's is garbled and is given to it by
position only; its block says why. The other lines are located by the
Latin around the cite. Each quoted line is copied by script from
`leafLines` (`admin/pipeline/patch/hocr.ts`); no line quoted here holds
a bidi mark or a backtick, and every hOCR fragment a note quotes is on
its leaf (checked by script). Where the hOCR reads the numeral as a
lower-case `i` (U00629, V00155), reads `I, II` as `i, ii` (V00921),
runs it into the Latin run (Q02021 `fl2^JI`, U01961 `Wowil`), or loses
it in a garbled line (U01241), that is the OCR's reading: the scan
decides. Where the hOCR and the scan read disagree, a second read is
needed.

**The `ch.` rule (10-15).** A cite that reads `X N ch.` names the
`ch.` line print sets after `X N`, not `X N` itself. None of the 27
cites is followed by `ch.` in the entry as it stands (checked by
script). Note it on the `Read:` line if print shows one; that is a
withdraw, or a re-aim at the `ch.` line. In C1 the maintainer also
re-aimed two cites with no `ch.` at the `ch.` line because the citing
line is Aramaic (B01237 and N00106 → B01153). Here no target has an
unnumbered `ch.` line after it: the entry after each of the 15 targets
carries its own numeral, except U01306 after U01305, which is not a
`ch.` entry (`f. (preced.) = h. שַׁלְוָה`; checked by script). One
citing entry is itself a `ch.` entry: U01961 `שְׁרֵי, שְׁרָא, שְׁרֵא`
(`ch. same to untie, unharness`, citing `תִּגְרָא I`). Four targets are
themselves `ch.` lines that carry their own I, cited by six blocks:
U02021 `שְׁרַק I, שְׁרֵיק` (`ch. same`), U01295 `שִׁלְיָא, שִׁלְיָיא,
שִׁי׳ I` (`ch. same quiet, unconcern`), V00743 `תְּנֵי I, תְּנָא` (`ch.
same to repeat, do a second time`) and V00979 `תְּרֵי, תְּרָא I`
(`ch.,`). The entry after each is numbered (U02022 `שְׁרַק II`, U01296
`שִׁלְיָא, שִׁי׳ II`, V00744 `תְּנֵי II`, V00980 `תְּרֵי, תְּרָא II`),
so none is the unnumbered `ch.` line 10-15 names. Each of these blocks
says which case it is.

**Numeral on a later form.** A target's numeral can sit on a later
form of its head line than the one the cite spells: U00170 `שִׁבְקָא,
שִׁי׳ I` carries I on the abbreviation `שִׁי׳`, and U01305 `שְׁלֵיו,
שְׁלֵיוָא, שְׁלֵוָוא I` on its third form `שְׁלֵוָוא`, while P000761's
cite spells its second, `שְׁלֵיוָא`. **12 of the 27 blocks** are of
this shape, all in the eight families no reform touched (see "Reading
order"); each says so under "The patch's target", as an observation
only. In the other 15, the target carries the numeral on its first form,
the form the cite spells. Ruling `10-30 one numeral per line`
([`docs/decisions.md`](../../../../../../docs/decisions.md)) has
decided the question these notes raised in C1 and C2: a numeral print
sets anywhere on a head line is that line's numeral, so `X I` names the
line by its first form and the retarget's link is right as it stands.
No reform gives the cited form a numeral of its own, and none is
written for this batch; the read confirms the cite and its target only.

**Conventions in the blocks.** A headword is the entry's `display`
with its forms filled in; "numeral I on form 2" names the form that
carries it, which is often not the cite's spelling (the audit's
`match`). Each family heading lists the family's members (every entry
with a headword form of the cite word's consonants) as they are stored.
"The cite as Sefaria has it" is `expected_before` with tags stripped,
cut to about 60 characters before the cite and 40 after; the whole
entry is in the entry file. Where the cite runs over to the next
column on another leaf, the block links that leaf's scan too. IIIF's
`$n` is leaf `n − 1`, so leaf `L` links as `$L+1`
([`data/page-index/README.md`](../../../../../../data/page-index/README.md),
"Scan coordinates"; vol. 2 is `dictionaryoftarg02jastuoft`).

## Reading order

The checklist asks a batch to read first the members in a family a
homograph reform touched (the patches agent's `stale.py`), then the
rest. `stale.py` is not in the repository, and its counts (284
retargets, 63 touched) are over a population other than these, so its
split cannot be reproduced. The reviewed records give one instead:
seven of the 15 families have a member with a reviewed `reform` patch
(checked by script on all 59 entries whose headword consonants match a
family's; the same script finds C1's P000290 and P000321 as a control),
all from `headword-print-read-2026-10-06`, each the maintainer's print
read of 2026-10-06:

- in six, the reform restores the target's own I, which Sefaria's text
  had dropped: P000312 (U00524 `שׁוּקָא I, שׁוּקָה`), P000313 (U00627
  `שָׁחוֹר I, שְׁחוֹרָה`), P000314 (U00820 `שִׁידָּא I, שִׁדָּא`),
  P000317 (U02021 `שְׁרַק I, שְׁרֵיק`), P000318 (V00743 `תְּנֵי I,
  תְּנָא`) and P000332 (U01570 `שָׁנָה I`, where Sefaria had set the I
  in the gloss head; P000333 takes it out of the gloss);
- in the seventh, P000320 gives U01268 `שֶׁלַח II (שְׁלוּחַ)` its II;
  the family's target, U01267 `שֶׁלַח I`, carries its own.

So the blocks run in two parts: first those seven families' 15 records
(שׁוּקָא, שָׁחוֹר, שִׁידָּא, שֶׁלַח, שָׁנָה, שְׁרַק, תְּנֵי), then the
other eight families' 12 (שִׁבְקָא, שִׁיפּוּי, שִׁיקּוּר, שִׁלְיָא,
שְׁלֵיוָא, תִּגְרָא, תִּכְלָא, תְּרֵי); within each part, family order
(the family's consonants), then rid; within an entry, patch order. Each
block of the first part names its family's reform. No other reviewed
patch touches a member of the 15 families.

A note on P000761 (family שְׁלֵיוָא): Sefaria links U01306 `שְׁלֵיוָא,
שְׁלֵוָוא, שְׁלֵיוְתָא`, which carries no numeral in the stored entry,
though the cite reads `v. שְׁלֵיוָא I, II`. Whether print numbers
U01306 is a question about that line, outside this batch; the block
records what the hOCR shows of it, and proposes nothing.

## The blocks

### Family שׁוּקָא

Members (every entry with a headword form of the consonants שוקא):
U00523 `שׁוֹקָא`, U00524 `שׁוּקָא I, שׁוּקָה`, U00525 `שׁוּקָא II`,
U01824 `שָׁקָא, שַׁקָּא, שׁוֹקָא`.

#### U00526 · P000750

- **Entry**: U00526 `שׁוּקָה`, vol. 2, 1541a, leaf 864.
  Entry file: [`data/entries/U/U00526.json`](../../../../../../data/entries/U/U00526.json)
- **Scan crop**: [scan 1541a · leaf 864](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$865/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 864, line 48 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  npl©, v. KJ3TO I.
  ```

  Located by position: line 47 ends U00525 (`V. Xpr%®.`) and line 49 is
  U00527 (`pTw, v. njsijtf.`). Line 48 is this one-line cross-reference,
  the numeral read `I`: `v. KJ3TO I.`
- **The cite as Sefaria has it**: `, v. שׁוּקָא I`
  Sefaria links U00525 `שׁוּקָא II` (numeral II on form 1, `שׁוּקָא`).
- **The patch's target**: U00524 `שׁוּקָא I, שׁוּקָה` (numeral I on form
  1, `שׁוּקָא`).
  The target's I is a restored numeral: Sefaria's text dropped it, and
  reform P000312 sets it on the line by the maintainer's print read
  (2026-10-06, leaf 864). The family is one a reform touched, so this
  block is read first (see "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:75f99c75`:

```text
<a class="refLink" href="/Jastrow,_שׁוּקָא II.1" data-ref="Jastrow, שׁוּקָא II 1"><span dir="rtl">שׁוּקָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_שׁוּקָא.1" data-ref="Jastrow, שׁוּקָא 1"><span dir="rtl">שׁוּקָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 178): the cite's
text reads "שׁוּקָא I", Sefaria links U00525 "שׁוּקָא II", the only
family member numbered I is U00524 "שׁוּקָא I, שׁוּקָה".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שׁוּקָא I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed on follow-up (the first pass left the block unticked); no free-text read.

### Family שָׁחוֹר

Members (every entry with a headword form of the consonants שחור):
U00627 `שָׁחוֹר I, שְׁחוֹרָה`, U00628 `שָׁחוֹר II`.

#### U00629 · P000752

- **Entry**: U00629 `שְׁחוֹרָה`, vol. 2, 1546b, leaf 869.
  Entry file: [`data/entries/U/U00629.json`](../../../../../../data/entries/U/U00629.json)
- **Scan crop**: [scan 1546b · leaf 869](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$870/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 869, line 62 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  rninfi v. -m& i.
  ```

  Located by position: lines 60–61 are U00628 (`II m. (irns I)
  hair-pinchers;`) and line 63 is U00630 (`coals, v. animis.`). Line 62
  is this one-line cross-reference; the numeral is read as a lower-case
  `i`: `v. -m& i.` The scan decides.
- **The cite as Sefaria has it**: `, v. שָׁחוֹר I`
  Sefaria links U00628 `שָׁחוֹר II` (numeral II on form 1, `שָׁחוֹר`).
- **The patch's target**: U00627 `שָׁחוֹר I, שְׁחוֹרָה` (numeral I on
  form 1, `שָׁחוֹר`).
  The target's I is a restored numeral: Sefaria's text dropped it, and
  reform P000313 sets it on the line by the maintainer's print read
  (2026-10-06, leaf 869). The family is one a reform touched, so this
  block is read first (see "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:dc37fe76`:

```text
<a class="refLink" href="/Jastrow,_שָׁחוֹר II.1" data-ref="Jastrow, שָׁחוֹר II 1"><span dir="rtl">שָׁחוֹר</span> I</a>
→
<a class="refLink" href="/Jastrow,_שָׁחוֹר.1" data-ref="Jastrow, שָׁחוֹר 1"><span dir="rtl">שָׁחוֹר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 181): the cite's
text reads "שָׁחוֹר I", Sefaria links U00628 "שָׁחוֹר II", the only
family member numbered I is U00627 "שָׁחוֹר I, שְׁחוֹרָה".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שָׁחוֹר I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

#### U00706 · P000753

- **Entry**: U00706 `שָׁחַר II`, vol. 2, 1551b, leaf 874.
  Entry file: [`data/entries/U/U00706.json`](../../../../../../data/entries/U/U00706.json)
- **Scan crop**: [scan 1551b · leaf 874](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$875/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 874, lines 46–47 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  "ITTlJ II (b. h.; cmp. "TFi III) to be charred, black.—
  V. TWrtJ I.
  ```

  Line 46 is the head (`to be charred, black.—`); line 47 is the cite,
  the numeral read `I`: `V. TWrtJ I.`
- **The cite as Sefaria has it**: `to be charred, black.—V. שָׁחוֹר I.`
  Sefaria links U00628 `שָׁחוֹר II` (numeral II on form 1, `שָׁחוֹר`).
- **The patch's target**: U00627 `שָׁחוֹר I, שְׁחוֹרָה` (numeral I on
  form 1, `שָׁחוֹר`).
  The target's I is a restored numeral: Sefaria's text dropped it, and
  reform P000313 sets it on the line by the maintainer's print read
  (2026-10-06, leaf 869). The family is one a reform touched, so this
  block is read first (see "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:758a00ca`:

```text
<a class="refLink" href="/Jastrow,_שָׁחוֹר II.1" data-ref="Jastrow, שָׁחוֹר II 1"><span dir="rtl">שָׁחוֹר</span> I</a>
→
<a class="refLink" href="/Jastrow,_שָׁחוֹר.1" data-ref="Jastrow, שָׁחוֹר 1"><span dir="rtl">שָׁחוֹר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 183): the cite's
text reads "שָׁחוֹר I", Sefaria links U00628 "שָׁחוֹר II", the only
family member numbered I is U00627 "שָׁחוֹר I, שְׁחוֹרָה".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שָׁחוֹר I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

#### U00864 · P000755

- **Entry**: U00864 `שִׁיחוֹר`, vol. 2, 1559b, leaf 882.
  Entry file: [`data/entries/U/U00864.json`](../../../../../../data/entries/U/U00864.json)
- **Scan crop**: [scan 1559b · leaf 882](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$883/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 882, lines 66–67 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  TUTliJ m. (inb II) coal. Gitt. 19a; Sabb. 104b, v.
  •Vino I. Ex. R. s. 42 '31 'tOI n^bJ-ia . . . mx if a man has
  ```

  Line 66 is the head and the Gitt. and Sabb. references, ending `Sabb.
  104b, v.`; line 67 carries the cite on, the numeral read `I`: `•Vino
  I. Ex. R. s. 42`.
- **The cite as Sefaria has it**: `(שָׁחַר II) coal. Gitt. 19ᵃ; Sabb.
  104ᵇ, v. שָׁחוֹר I. Ex. R. s. 42 אדם … מרגלית וש׳ וכ׳ if a…`
  Sefaria links U00628 `שָׁחוֹר II` (numeral II on form 1, `שָׁחוֹר`).
- **The patch's target**: U00627 `שָׁחוֹר I, שְׁחוֹרָה` (numeral I on
  form 1, `שָׁחוֹר`).
  The target's I is a restored numeral: Sefaria's text dropped it, and
  reform P000313 sets it on the line by the maintainer's print read
  (2026-10-06, leaf 869). The family is one a reform touched, so this
  block is read first (see "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:049b62ef`:

```text
<a class="refLink" href="/Jastrow,_שָׁחוֹר II.1" data-ref="Jastrow, שָׁחוֹר II 1"><span dir="rtl">שָׁחוֹר</span> I</a>
→
<a class="refLink" href="/Jastrow,_שָׁחוֹר.1" data-ref="Jastrow, שָׁחוֹר 1"><span dir="rtl">שָׁחוֹר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 185): the cite's
text reads "שָׁחוֹר I", Sefaria links U00628 "שָׁחוֹר II", the only
family member numbered I is U00627 "שָׁחוֹר I, שְׁחוֹרָה".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שָׁחוֹר I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

#### V00601 · P000784

- **Entry**: V00601 `תַּלְמוּד`, vol. 2, 1672b, leaf 995.
  Entry file: [`data/entries/V/V00601.json`](../../../../../../data/entries/V/V00601.json)
- **Scan crop**: [scan 1672b · leaf 995](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$996/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 995, line 102 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  a. v. fr.— PL nhtobn (fern.). Cant. R. to V,ll, v. line I.
  ```

  The plural and its Cant. R. reference; the numeral reads `I`: `Cant.
  R. to V,ll, v. line I.` (`line` is the OCR's run for the Hebrew).
- **The cite as Sefaria has it**: `…); a. v. fr.—Pl. תַּלְמוּדוֹת
  (fem.). Cant. R. to V, 11, v. שָׁחוֹר I.`
  Sefaria links U00628 `שָׁחוֹר II` (numeral II on form 1, `שָׁחוֹר`).
- **The patch's target**: U00627 `שָׁחוֹר I, שְׁחוֹרָה` (numeral I on
  form 1, `שָׁחוֹר`).
  The target's I is a restored numeral: Sefaria's text dropped it, and
  reform P000313 sets it on the line by the maintainer's print read
  (2026-10-06, leaf 869). The family is one a reform touched, so this
  block is read first (see "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:b6ed8256`:

```text
<a class="refLink" href="/Jastrow,_שָׁחוֹר II.1" data-ref="Jastrow, שָׁחוֹר II 1"><span dir="rtl">שָׁחוֹר</span> I</a>
→
<a class="refLink" href="/Jastrow,_שָׁחוֹר.1" data-ref="Jastrow, שָׁחוֹר 1"><span dir="rtl">שָׁחוֹר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 215): the cite's
text reads "שָׁחוֹר I", Sefaria links U00628 "שָׁחוֹר II", the only
family member numbered I is U00627 "שָׁחוֹר I, שְׁחוֹרָה".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שָׁחוֹר I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

#### V01081 · P000789

- **Entry**: V01081 `תִּשְׁחוֹרֶת`, vol. 2, 1703b, leaf 1026.
  Entry file: [`data/entries/V/V01081.json`](../../../../../../data/entries/V/V01081.json)
- **Scan crop**: [scan 1703b · leaf 1026](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1027/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 1026, line 78 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  n"]in^J7 f. CTTO II, v. Ned. IH, 8 quot s. v. KtTBj I)
  ```

  The head line; the numeral reads `I`: `s. v. KtTBj I)`.
- **The cite as Sefaria has it**: `(שָׁחַר II, v. Ned. III, 8 quot. s.
  v. שָׁחוֹר I)`
  Sefaria links U00628 `שָׁחוֹר II` (numeral II on form 1, `שָׁחוֹר`).
- **The patch's target**: U00627 `שָׁחוֹר I, שְׁחוֹרָה` (numeral I on
  form 1, `שָׁחוֹר`).
  The target's I is a restored numeral: Sefaria's text dropped it, and
  reform P000313 sets it on the line by the maintainer's print read
  (2026-10-06, leaf 869). The family is one a reform touched, so this
  block is read first (see "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:38a9fd31`:

```text
<a class="refLink" href="/Jastrow,_שָׁחוֹר II.1" data-ref="Jastrow, שָׁחוֹר II 1"><span dir="rtl">שָׁחוֹר</span> I</a>
→
<a class="refLink" href="/Jastrow,_שָׁחוֹר.1" data-ref="Jastrow, שָׁחוֹר 1"><span dir="rtl">שָׁחוֹר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 221): the cite's
text reads "שָׁחוֹר I", Sefaria links U00628 "שָׁחוֹר II", the only
family member numbered I is U00627 "שָׁחוֹר I, שְׁחוֹרָה".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שָׁחוֹר I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

### Family שִׁידָּא

Members (every entry with a headword form of the consonants שידא):
U00819 `שֵׁיד, שֵׁידָא`, U00820 `שִׁידָּא I, שִׁדָּא`, U00821 `שִׁידָּא
II`.

#### U00254 · P000748

- **Entry**: U00254 `שִׁדָּא, שִׁדָא`, vol. 2, 1524a, leaf 847.
  Entry file: [`data/entries/U/U00254.json`](../../../../../../data/entries/U/U00254.json)
- **Scan crop**: [scan 1524a · leaf 847](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$848/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 847, line 8 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  OTtt5, Sift v. KW5 I.
  ```

  Located by position: lines 6–7 are U00253 (`v. •'TU.`) and line 10
  opens U00255 (`(b. h.) to overpower, rob.`), with a line of vowel
  points (9) between. Line 8 is this one-line cross-reference, its two
  forms and the cite, the numeral read `I`: `Sift v. KW5 I.`
- **The cite as Sefaria has it**: `, v. שִׁידָּא I`
  Sefaria links U00821 `שִׁידָּא II` (numeral II on form 1, `שִׁידָּא`).
- **The patch's target**: U00820 `שִׁידָּא I, שִׁדָּא` (numeral I on
  form 1, `שִׁידָּא`).
  The target's I is a restored numeral: Sefaria's text dropped it, and
  reform P000314 sets it on the line by the maintainer's print read
  (2026-10-06, leaf 881). The family is one a reform touched, so this
  block is read first (see "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:07cfbf18`:

```text
<a class="refLink" href="/Jastrow,_שִׁידָּא II.1" data-ref="Jastrow, שִׁידָּא II 1"><span dir="rtl">שִׁידָּא</span> I</a>
→
<a class="refLink" href="/Jastrow,_שִׁידָּא.1" data-ref="Jastrow, שִׁידָּא 1"><span dir="rtl">שִׁידָּא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 176): the cite's
text reads "שִׁידָּא I", Sefaria links U00821 "שִׁידָּא II", the only
family member numbered I is U00820 "שִׁידָּא I, שִׁדָּא".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שִׁידָּא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

### Family שֶׁלַח

Members (every entry with a headword form of the consonants שלח): U01265
`שָׁלַח`, U01266 `שְׁלַח`, U01267 `שֶׁלַח I`, U01268 `שֶׁלַח II
(שְׁלוּחַ)`, U01269 `שֶׁלַח III`, U01270 `שֶׁלַח IV`.

#### U01271 · P000762

- **Entry**: U01271 `שִׁלְחָא, שִׁי׳ I`, vol. 2, 1580b, leaf 903.
  Entry file: [`data/entries/U/U01271.json`](../../../../../../data/entries/U/U01271.json)
- **Scan crop**: [scan 1580b · leaf 903](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$904/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 903, line 108 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  ^nblij, '"^ I m. = h. rftttS I. Men. 35a ItQ i?ma "3
  ```

  The head line of U01271, then the cite, the numeral read `I`: `= h.
  rftttS I. Men. 35a`.
- **The cite as Sefaria has it**: `= h. שֶׁלַח I. Men. 35ᵃ כי מיתלי ביה
  בש׳ וכ׳ when you…`
  Sefaria links U01270 `שֶׁלַח IV` (numeral IV on form 1, `שֶׁלַח`).
- **The patch's target**: U01267 `שֶׁלַח I` (numeral I on form 1,
  `שֶׁלַח`).
  A member of the family, U01268 `שֶׁלַח II (שְׁלוּחַ)`, carries its II
  by reform P000320 (the maintainer's print read, 2026-10-06, leaf 903);
  neither the target nor the entry Sefaria links is touched by it. The
  family is one a reform touched, so this block is read first (see
  "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:409ac913`:

```text
<a class="refLink" href="/Jastrow,_שֶׁלַח IV.1" data-ref="Jastrow, שֶׁלַח IV 1"><span dir="rtl">שֶׁלַח</span> I</a>
→
<a class="refLink" href="/Jastrow,_שֶׁלַח I.1" data-ref="Jastrow, שֶׁלַח I 1"><span dir="rtl">שֶׁלַח</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 192): the cite's
text reads "שֶׁלַח I", Sefaria links U01270 "שֶׁלַח IV", the only family
member numbered I is U01267 "שֶׁלַח I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שֶׁלַח I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

### Family שָׁנָה

Members (every entry with a headword form of the consonants שנה): U00972
`שֵׁינָה, שֵׁנָה`, U01570 `שָׁנָה I`, U01571 `שָׁנָה II`, U01572
`שֵׁנָה`, U01585 `שני, שָׁנָה`.

#### Q02021 · P000704

- **Entry**: Q02021 `פָּרַשׁ`, vol. 2, 1241b, leaf 564; continues into
  1242b, leaf 565.
  Entry file: [`data/entries/Q/Q02021.json`](../../../../../../data/entries/Q/Q02021.json)
- **Scan crop**: [scan 1241b · leaf 564](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$565/full/1400,/0/default.jpg); the cite is in 1242b, [scan 1242b · leaf 565](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$566/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 565, line 71 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  (the verse) to you; v. fl2^JI. Gen.R. s. 31 'B xbl and did
  ```

  In 1242b, where the entry runs on, located by the Latin around the
  cite (`(the verse) to you; v.` and `Gen.R. s. 31`). The Latin run and
  the numeral run together, `v. fl2^JI.`: its last `I` may be the
  numeral, but the hOCR does not read it as a token of its own. The scan
  decides.
- **The cite as Sefaria has it**: `… פֵירְשׁוּ לך they did not interpret
  (the verse) to you; v. שָׁנָה I. Gen. R. s. 31 ולא פ׳ and did not
  expla…`
  Sefaria links U01571 `שָׁנָה II` (numeral II on form 1, `שָׁנָה`).
- **The patch's target**: U01570 `שָׁנָה I` (numeral I on form 1,
  `שָׁנָה`).
  The target is itself a one-line cross-reference (`, v. שני`, to U01585
  `שני, שָׁנָה`).
  The target's I is a restored numeral: Sefaria's text set it in the
  gloss head, not on the line; reform P000332 sets it on the line and
  P000333 takes it out of the gloss, by the maintainer's print read
  (2026-10-06, leaf 927). The family is one a reform touched, so this
  block is read first (see "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—5)]:002dc71d`:

```text
<a class="refLink" href="/Jastrow,_שָׁנָה II.1" data-ref="Jastrow, שָׁנָה II 1"><span dir="rtl">שָׁנָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_שָׁנָה.1" data-ref="Jastrow, שָׁנָה 1"><span dir="rtl">שָׁנָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 126): the cite's
text reads "שָׁנָה I", Sefaria links U01571 "שָׁנָה II", the only family
member numbered I is U01570 "שָׁנָה I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שָׁנָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

#### U01568 · P000769

- **Entry**: U01568 `שִׁנְאָן`, vol. 2, 1604b, leaf 927.
  Entry file: [`data/entries/U/U01568.json`](../../../../../../data/entries/U/U01568.json)
- **Scan crop**: [scan 1604b · leaf 927](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$928/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 927, line 58 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  "jSjp m. (b. h.; v. nsio I) repetition, double. Pesik.
  ```

  The head line; the numeral reads `I`: `(b. h.; v. nsio I) repetition`.
- **The cite as Sefaria has it**: `v. שָׁנָה I) repetition, double.
  Pesik. Baḥod., p. …`
  Sefaria links U01571 `שָׁנָה II` (numeral II on form 1, `שָׁנָה`).
- **The patch's target**: U01570 `שָׁנָה I` (numeral I on form 1,
  `שָׁנָה`).
  The target is itself a one-line cross-reference (`, v. שני`, to U01585
  `שני, שָׁנָה`).
  The target's I is a restored numeral: Sefaria's text set it in the
  gloss head, not on the line; reform P000332 sets it on the line and
  P000333 takes it out of the gloss, by the maintainer's print read
  (2026-10-06, leaf 927). The family is one a reform touched, so this
  block is read first (see "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:2f37d036`:

```text
<a class="refLink" href="/Jastrow,_שָׁנָה II.1" data-ref="Jastrow, שָׁנָה II 1"><span dir="rtl">שָׁנָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_שָׁנָה.1" data-ref="Jastrow, שָׁנָה 1"><span dir="rtl">שָׁנָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 199): the cite's
text reads "שָׁנָה I", Sefaria links U01571 "שָׁנָה II", the only family
member numbered I is U01570 "שָׁנָה I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שָׁנָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

#### V00072 · P000777

- **Entry**: V00072 `תְּבַר, תַּבְרָא, תְּבָרָא`, vol. 2, 1645b, leaf
  968; continues into 1646a, leaf 969.
  Entry file: [`data/entries/V/V00072.json`](../../../../../../data/entries/V/V00072.json)
- **Scan crop**: [scan 1645b · leaf 968](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$969/full/1400,/0/default.jpg); the cite is in 1646a, [scan 1646a · leaf 969](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$970/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 969, lines 7–8 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  tween the two clauses of the Mishnah); he that taught
  the one &c, v. !"I5T2J I ; [R. Hananel : excommunication (v.
  ```

  In 1646a, where the entry runs on: line 7 is sense `2)`'s gloss (`he
  that taught`); line 8 is the cite, the numeral read `I`: `v. !"I5T2J I
  ;`.
- **The cite as Sefaria has it**: `…two clauses of the Mishnah); he that
  taught the one &c., v. שָׁנָה I; [R. Ḥănanel: excommunication (v.
  infra…`
  Sefaria links U01571 `שָׁנָה II` (numeral II on form 1, `שָׁנָה`).
- **The patch's target**: U01570 `שָׁנָה I` (numeral I on form 1,
  `שָׁנָה`).
  The target is itself a one-line cross-reference (`, v. שני`, to U01585
  `שני, שָׁנָה`).
  The target's I is a restored numeral: Sefaria's text set it in the
  gloss head, not on the line; reform P000332 sets it on the line and
  P000333 takes it out of the gloss, by the maintainer's print read
  (2026-10-06, leaf 927). The family is one a reform touched, so this
  block is read first (see "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[—2)]:795da16a`:

```text
<a class="refLink" href="/Jastrow,_שָׁנָה II.1" data-ref="Jastrow, שָׁנָה II 1"><span dir="rtl">שָׁנָה</span> I</a>
→
<a class="refLink" href="/Jastrow,_שָׁנָה.1" data-ref="Jastrow, שָׁנָה 1"><span dir="rtl">שָׁנָה</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 208): the cite's
text reads "שָׁנָה I", Sefaria links U01571 "שָׁנָה II", the only family
member numbered I is U01570 "שָׁנָה I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שָׁנָה I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

### Family שְׁרַק

Members (every entry with a headword form of the consonants שרק): U02019
`שָׂרָק`, U02020 `שָׁרַק`, U02021 `שְׁרַק I, שְׁרֵיק`, U02022 `שְׁרַק
II`, U02023 `שְׁרַק III`.

#### T01055 · P000745

- **Entry**: T01055 `רַקְרַק`, vol. 2, 1498a, leaf 821.
  Entry file: [`data/entries/T/T01055.json`](../../../../../../data/entries/T/T01055.json)
- **Scan crop**: [scan 1498a · leaf 821](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$822/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 821, lines 32–33 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  p Jp J rakrak, imitation of a bird's shriek. Hull. 63a
  Ar., v. p113 I.
  ```

  Line 32 is the head (`rakrak, imitation of a bird's shriek. Hull.
  63a`); line 33 is the cite, the numeral read `I`: `Ar., v. p113 I.`
- **The cite as Sefaria has it**: `raḳraḳ, imitation of a bird’s shriek.
  Ḥull. 63ᵃ Ar., v. שְׁרַק I.`
  Sefaria links U02022 `שְׁרַק II` (numeral II on form 1, `שְׁרַק`).
- **The patch's target**: U02021 `שְׁרַק I, שְׁרֵיק` (numeral I on form
  1, `שְׁרַק`).
  The target is itself a `ch.` line that carries I (`ch. same`); the
  entry after it, U02022 `שְׁרַק II`, is not an unnumbered `ch.` line.
  The target's I is a restored numeral: Sefaria's text dropped it, and
  reform P000317 sets it on the line by the maintainer's print read
  (2026-10-06, leaf 957). The family is one a reform touched, so this
  block is read first (see "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:9f7a1c9e`:

```text
<a class="refLink" href="/Jastrow,_שְׁרַק II.1" data-ref="Jastrow, שְׁרַק II 1"><span dir="rtl">שְׁרַק</span> I</a>
→
<a class="refLink" href="/Jastrow,_שְׁרַק.1" data-ref="Jastrow, שְׁרַק 1"><span dir="rtl">שְׁרַק</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 173): the cite's
text reads "שְׁרַק I", Sefaria links U02022 "שְׁרַק II", the only family
member numbered I is U02021 "שְׁרַק I, שְׁרֵיק".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שְׁרַק I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

#### U02027 · P000775

- **Entry**: U02027 `שְׁרַקְרַק`, vol. 2, 1634a, leaf 957.
  Entry file: [`data/entries/U/U02027.json`](../../../../../../data/entries/U/U02027.json)
- **Scan crop**: [scan 1634a · leaf 957](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$958/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 957, lines 46–47 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  pHpnipm. I)(p5ti III, cmp. 5<pT^pT 5 popular etymol.
  fr. pyo I, q. v.) name of an unclean bird, gier-eagle or
  ```

  Line 46 is the head (`(p5ti III, cmp.` … `popular etymol.`); line 47
  is the cite, the numeral read `I`: `fr. pyo I, q. v.)`.
- **The cite as Sefaria has it**: `(שְׁרַק III, cmp. יְרַקְרֵיקָא;
  popular etymol. fr. שְׁרַק I, q. v.) name of an unclean bird, gier-e…`
  Sefaria links U02022 `שְׁרַק II` (numeral II on form 1, `שְׁרַק`).
- **The patch's target**: U02021 `שְׁרַק I, שְׁרֵיק` (numeral I on form
  1, `שְׁרַק`).
  The target is itself a `ch.` line that carries I (`ch. same`); the
  entry after it, U02022 `שְׁרַק II`, is not an unnumbered `ch.` line.
  The target's I is a restored numeral: Sefaria's text dropped it, and
  reform P000317 sets it on the line by the maintainer's print read
  (2026-10-06, leaf 957). The family is one a reform touched, so this
  block is read first (see "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:bb765c7f`:

```text
<a class="refLink" href="/Jastrow,_שְׁרַק II.1" data-ref="Jastrow, שְׁרַק II 1"><span dir="rtl">שְׁרַק</span> I</a>
→
<a class="refLink" href="/Jastrow,_שְׁרַק.1" data-ref="Jastrow, שְׁרַק 1"><span dir="rtl">שְׁרַק</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 205): the cite's
text reads "שְׁרַק I", Sefaria links U02022 "שְׁרַק II", the only family
member numbered I is U02021 "שְׁרַק I, שְׁרֵיק".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שְׁרַק I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

### Family תְּנֵי

Members (every entry with a headword form of the consonants תני): V00742
`תני, תָּנָה`, V00743 `תְּנֵי I, תְּנָא`, V00744 `תְּנֵי II`, V00745
`תִּנְיָין, תִּנְיָינָא, תִּנְיָ׳, תִּינְ׳`, V00746 `תִּנְיָינוּת,
תִּנְיָ׳, תִּי׳`.

#### V00728 · P000785

- **Entry**: V00728 `תַּנּוּיֵי`, vol. 2, 1680b, leaf 1003.
  Entry file: [`data/entries/V/V00728.json`](../../../../../../data/entries/V/V00728.json)
- **Scan crop**: [scan 1680b · leaf 1003](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1004/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 1003, line 74 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  ^HTl m. (infin. Pa. of 13PI I) teaching or studying
  ```

  The head line; the numeral reads `I`: `(infin. Pa. of 13PI I)
  teaching`.
- **The cite as Sefaria has it**: `(infin. Pa. of תְּנֵי I) teaching or
  studying (Mishnah). Taan. 24…`
  Sefaria links V00744 `תְּנֵי II` (numeral II on form 1, `תְּנֵי`).
  The entry holds the cite twice, both in its one sense: `(infin. Pa. of
  תְּנֵי I)` in the gloss head and `[Ib. 49ᵃ, v. תְּנֵי I]` at its end.
  This record is the first, P000786 the second.
- **The patch's target**: V00743 `תְּנֵי I, תְּנָא` (numeral I on form
  1, `תְּנֵי`).
  The target is itself a `ch.` line that carries I (`ch. same to repeat,
  do a second time`); the entry after it, V00744 `תְּנֵי II`, is not an
  unnumbered `ch.` line.
  The target's I is a restored numeral: Sefaria's text dropped it, and
  reform P000318 sets it on the line by the maintainer's print read
  (2026-10-06, leaf 1004). The family is one a reform touched, so this
  block is read first (see "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:43cd3fcc`:

```text
<a class="refLink" href="/Jastrow,_תְּנֵי II.1" data-ref="Jastrow, תְּנֵי II 1"><span dir="rtl">תְּנֵי</span> I</a>) 
→
<a class="refLink" href="/Jastrow,_תְּנֵי.1" data-ref="Jastrow, תְּנֵי 1"><span dir="rtl">תְּנֵי</span> I</a>) 
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 216): the cite's
text reads "תְּנֵי I", Sefaria links V00744 "תְּנֵי II", the only family
member numbered I is V00743 "תְּנֵי I, תְּנָא". Its `find` and `replace`
end with the `)` and space after the cite, which makes the first cite
the only match. It applies first; P000786 applies on the definition this
patch leaves.

</details>

**The maintainer's read**:

- [x] confirm — print reads `תְּנֵי I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

#### V00728 · P000786

- **Entry**: V00728 `תַּנּוּיֵי`, vol. 2, 1680b, leaf 1003.
  Entry file: [`data/entries/V/V00728.json`](../../../../../../data/entries/V/V00728.json)
- **Scan crop**: [scan 1680b · leaf 1003](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1004/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 1003, lines 80–81 (Latin-only
  evidence: witnesses the numeral and position, not the Hebrew)

  ```text
  Ktrabn, v. Eabb. D. S. a. 1. note 400); Ber. 20a some ed.
  ?VQ (v. Eabb. D. S. a. 1. note 30).— [Ib. 49a, v. WJ I].
  ```

  Line 80 is the Snh. note and the Ber. reference; line 81 ends the
  entry with the cite, the numeral read `I`: `[Ib. 49a, v. WJ I].`
- **The cite as Sefaria has it**: `… ed. תַּנּוּיֵ (v. Rabb. D. S. a. l.
  note 30).—[Ib. 49ᵃ, v. תְּנֵי I].`
  Sefaria links V00744 `תְּנֵי II` (numeral II on form 1, `תְּנֵי`).
  The second of the two cites; P000785 is the first.
- **The patch's target**: V00743 `תְּנֵי I, תְּנָא` (numeral I on form
  1, `תְּנֵי`).
  The target is itself a `ch.` line that carries I (`ch. same to repeat,
  do a second time`); the entry after it, V00744 `תְּנֵי II`, is not an
  unnumbered `ch.` line.
  The target's I is a restored numeral: Sefaria's text dropped it, and
  reform P000318 sets it on the line by the maintainer's print read
  (2026-10-06, leaf 1004). The family is one a reform touched, so this
  block is read first (see "Reading order").
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:72fca62b`:

```text
<a class="refLink" href="/Jastrow,_תְּנֵי II.1" data-ref="Jastrow, תְּנֵי II 1"><span dir="rtl">תְּנֵי</span> I</a>
→
<a class="refLink" href="/Jastrow,_תְּנֵי.1" data-ref="Jastrow, תְּנֵי 1"><span dir="rtl">תְּנֵי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 217): the cite's
text reads "תְּנֵי I", Sefaria links V00744 "תְּנֵי II", the only family
member numbered I is V00743 "תְּנֵי I, תְּנָא". It applies after
P000785, on the definition that patch leaves: its `find` occurs twice in
the definition as Sefaria has it, and once after P000785 applies.

</details>

**The maintainer's read**:

- [x] confirm — print reads `תְּנֵי I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

### Family שִׁבְקָא

Members (every entry with a headword form of the consonants שבקא):
U00170 `שִׁבְקָא, שִׁי׳ I`, U00171 `שִׁבְקָא, שִׁי׳ II`.

#### U00132 · P000746

- **Entry**: U00132 `שְׁבִיק`, vol. 2, 1514b, leaf 837.
  Entry file: [`data/entries/U/U00132.json`](../../../../../../data/entries/U/U00132.json)
- **Scan crop**: [scan 1514b · leaf 837](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$838/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 837, line 82 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  p"QID m- (P5^> v. &tpt3p.I) abandoned; spontaneous
  ```

  The head line; the numeral read `I`, set against the Latin run by a
  period: `v. &tpt3p.I) abandoned`.
- **The cite as Sefaria has it**: `(שְׁבַק; v. שִׁבְקָא I) abandoned;
  spontaneous growth. Targ. Y…`
  Sefaria links U00171 `שִׁבְקָא, שִׁי׳ II` (numeral II on form 2,
  `שִׁי׳`).
- **The patch's target**: U00170 `שִׁבְקָא, שִׁי׳ I` (numeral I on form
  2, `שִׁי׳`).
  **The numeral sits on a later form**: form 2, `שִׁי׳`, not the cite's
  `שִׁבְקָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:1b27cc5d`:

```text
<a class="refLink" href="/Jastrow,_שִׁבְקָא ².1" data-ref="Jastrow, שִׁבְקָא ² 1"><span dir="rtl">שִׁבְקָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_שִׁבְקָא.1" data-ref="Jastrow, שִׁבְקָא 1"><span dir="rtl">שִׁבְקָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 174): the cite's
text reads "שִׁבְקָא I", Sefaria links U00171 "שִׁבְקָא, שִׁי׳ II", the
only family member numbered I is U00170 "שִׁבְקָא, שִׁי׳ I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שִׁבְקָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

### Family שִׁיפּוּי

Members (every entry with a headword form of the consonants שיפוי):
U01012 `שִׁיפּוּי, שִׁפּ׳ I`, U01013 `שִׁיפּוּי, שִׁפּ׳ II`.

#### U01706 · P000771

- **Entry**: U01706 `שְׁפָאִים, שְׁפָאִין`, vol. 2, 1613b, leaf 936.
  Entry file: [`data/entries/U/U01706.json`](../../../../../../data/entries/U/U01706.json)
- **Scan crop**: [scan 1613b · leaf 936](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$937/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 936, line 74 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Ib. rrXETO (Ms. M. rT*WI$ v. •mt*6 I).— Trnsf. tPTQ -XETO
  ```

  The Ms. M. variant of the Ab. Zar. reference; the numeral reads `I`:
  `(Ms. M. rT*WI$ v. •mt*6 I).—`.
- **The cite as Sefaria has it**: `…about those chips? Ib. שְׁפָאֶיהָ
  (Ms. M. שִׁיפּוּיֶיהָ, v. שִׁיפּוּי I).—Trnsf. שְׁפָאֵי עידית (cmp.
  בִּיזְלֵי…`
  Sefaria links U01013 `שִׁיפּוּי, שִׁפּ׳ II` (numeral II on form 2,
  `שִׁפּ׳`).
- **The patch's target**: U01012 `שִׁיפּוּי, שִׁפּ׳ I` (numeral I on
  form 2, `שִׁפּ׳`).
  **The numeral sits on a later form**: form 2, `שִׁפּ׳`, not the cite's
  `שִׁיפּוּי` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:1e6eb002`:

```text
<a class="refLink" href="/Jastrow,_שִׁיפּוּי ².1" data-ref="Jastrow, שִׁיפּוּי ² 1"><span dir="rtl">שִׁיפּוּי</span> I</a>
→
<a class="refLink" href="/Jastrow,_שִׁיפּוּי.1" data-ref="Jastrow, שִׁיפּוּי 1"><span dir="rtl">שִׁיפּוּי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 201): the cite's
text reads "שִׁיפּוּי I", Sefaria links U01013 "שִׁיפּוּי, שִׁפּ׳ II",
the only family member numbered I is U01012 "שִׁיפּוּי, שִׁפּ׳ I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שִׁיפּוּי I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

#### U01714 · P000772

- **Entry**: U01714 `שְׁפוּד`, vol. 2, 1614a, leaf 937.
  Entry file: [`data/entries/U/U01714.json`](../../../../../../data/entries/U/U01714.json)
- **Scan crop**: [scan 1614a · leaf 937](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$938/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 937, lines 15–16 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  bidden meat. Bets. 28b; a. fr. — [Tosef. Meil. 1,25, v.
  19nQ I.]— PL f1»^. Y. Naz. 1. c; a. e.
  ```

  Line 15 is the Bets. and Tosef. Meïl. reference, ending `[Tosef. Meil.
  1,25, v.`; line 16 carries the cite on, the numeral read `I`: `19nQ
  I.]—`.
- **The cite as Sefaria has it**: `…h forbidden meat. Bets. 28ᵇ; a.
  fr.—[Tosef. Meïl. I, 25, v. שִׁיפּוּי I.]—Pl. שְׁפוּדִין. Y. Naz. l.
  c.; a. e.`
  Sefaria links U01013 `שִׁיפּוּי, שִׁפּ׳ II` (numeral II on form 2,
  `שִׁפּ׳`).
- **The patch's target**: U01012 `שִׁיפּוּי, שִׁפּ׳ I` (numeral I on
  form 2, `שִׁפּ׳`).
  **The numeral sits on a later form**: form 2, `שִׁפּ׳`, not the cite's
  `שִׁיפּוּי` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:d46edbbd`:

```text
<a class="refLink" href="/Jastrow,_שִׁיפּוּי ².1" data-ref="Jastrow, שִׁיפּוּי ² 1"><span dir="rtl">שִׁיפּוּי</span> I</a>
→
<a class="refLink" href="/Jastrow,_שִׁיפּוּי.1" data-ref="Jastrow, שִׁיפּוּי 1"><span dir="rtl">שִׁיפּוּי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 202): the cite's
text reads "שִׁיפּוּי I", Sefaria links U01013 "שִׁיפּוּי, שִׁפּ׳ II",
the only family member numbered I is U01012 "שִׁיפּוּי, שִׁפּ׳ I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שִׁיפּוּי I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

### Family שִׁיקּוּר

Members (every entry with a headword form of the consonants שיקור):
U01046 `שִׁיקּוּר, שִׁקּ׳ I`, U01047 `שִׁיקּוּר II`.

#### U00973 · P000758

- **Entry**: U00973 `שִׁינּוּי, שִׁנּ׳`, vol. 2, 1564a, leaf 887;
  continues into 1564b, same leaf.
  Entry file: [`data/entries/U/U00973.json`](../../../../../../data/entries/U/U00973.json)
- **Scan crop**: [scan 1564a · leaf 887](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$888/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 887, line 63 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Hob., ch. XIX, Par. 11 ; Meil. 18a, v.*BJ*«$ I.-Pl. &**&*$,
  ```

  The Sifra and Me'il. references; the numeral reads `I`: `Meil. 18a,
  v.*BJ*«$ I.-Pl.`
- **The cite as Sefaria has it**: `…ised).—Sifra Vayikra, Ḥob., ch. XIX,
  Par. 11; Meïl. 18ᵃ, v. שִׁיקּוּר I.—Pl. שִׁינּוּיִים, שִׁינּוּיִין. B.
  Kam…`
  Sefaria links U01047 `שִׁיקּוּר II` (numeral II on form 1,
  `שִׁיקּוּר`).
- **The patch's target**: U01046 `שִׁיקּוּר, שִׁקּ׳ I` (numeral I on
  form 2, `שִׁקּ׳`).
  **The numeral sits on a later form**: form 2, `שִׁקּ׳`, not the cite's
  `שִׁיקּוּר` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:2863a7ba`:

```text
<a class="refLink" href="/Jastrow,_שִׁיקּוּר II.1" data-ref="Jastrow, שִׁיקּוּר II 1"><span dir="rtl">שִׁיקּוּר</span> I</a>
→
<a class="refLink" href="/Jastrow,_שִׁיקּוּר.1" data-ref="Jastrow, שִׁיקּוּר 1"><span dir="rtl">שִׁיקּוּר</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 188): the cite's
text reads "שִׁיקּוּר I", Sefaria links U01047 "שִׁיקּוּר II", the only
family member numbered I is U01046 "שִׁיקּוּר, שִׁקּ׳ I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שִׁיקּוּר I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

### Family שִׁלְיָא

Members (every entry with a headword form of the consonants שליא):
U01233 `שְׁלֵיָא`, U01295 `שִׁלְיָא, שִׁלְיָיא, שִׁי׳ I`, U01296
`שִׁלְיָא, שִׁי׳ II`, U01297 `שִׁלְיָא, שִׁי׳, שִׁלְיָה`, U01338
`שִׁלְיְתָא, שִׁלְיָא, שִׁלְיי׳, שִׁילְ׳`.

#### U01298 · P000763

- **Entry**: U01298 `שְׁלִיאָיִית`, vol. 2, 1582b, leaf 905.
  Entry file: [`data/entries/U/U01298.json`](../../../../../../data/entries/U/U01298.json)
- **Scan crop**: [scan 1582b · leaf 905](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$906/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 905, line 95 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  n",|"1J^*l5,U adv. (iVr II, v. X^83 I) without concern,
  ```

  The head line; the numeral reads `I`: `(iVr II, v. X^83 I) without
  concern,` (the `II` before it is the etymology's `שְׁלֵי II`).
- **The cite as Sefaria has it**: `adv. (שְׁלֵי II, v. שִׁלְיָא I)
  without concern, unawares. Targ. Prov.…`
  Sefaria links U01296 `שִׁלְיָא, שִׁי׳ II` (numeral II on form 2,
  `שִׁי׳`).
- **The patch's target**: U01295 `שִׁלְיָא, שִׁלְיָיא, שִׁי׳ I` (numeral
  I on form 3, `שִׁי׳`).
  **The numeral sits on a later form**: form 3, `שִׁי׳`, not the cite's
  `שִׁלְיָא` (form 1); an observation only, see "Numeral on a later
  form" above.
  The target is itself a `ch.` line that carries I (`ch. same quiet,
  unconcern`); the entry after it, U01296 `שִׁלְיָא, שִׁי׳ II`, is not
  an unnumbered `ch.` line.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:5f4cdeb3`:

```text
<a class="refLink" href="/Jastrow,_שִׁלְיָא ².1" data-ref="Jastrow, שִׁלְיָא ² 1"><span dir="rtl">שִׁלְיָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_שִׁלְיָא.1" data-ref="Jastrow, שִׁלְיָא 1"><span dir="rtl">שִׁלְיָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 193): the cite's
text reads "שִׁלְיָא I", Sefaria links U01296 "שִׁלְיָא, שִׁי׳ II", the
only family member numbered I is U01295 "שִׁלְיָא, שִׁלְיָיא, שִׁי׳ I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שִׁלְיָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

### Family שְׁלֵיוָא

Members (every entry with a headword form of the consonants שליוא):
U01305 `שְׁלֵיו, שְׁלֵיוָא, שְׁלֵוָוא I`, U01306 `שְׁלֵיוָא, שְׁלֵוָוא,
שְׁלֵיוְתָא`.

#### U01241 · P000761

- **Entry**: U01241 `שְׁלֵוְותָּא, שְׁלֵיוְתָא`, vol. 2, 1579a,
  leaf 902.
  Entry file: [`data/entries/U/U01241.json`](../../../../../../data/entries/U/U01241.json)
- **Scan crop**: [scan 1579a · leaf 902](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$903/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 902, line 13 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  pm5awm'>5olT.^Vttsi,iL
  ```

  Located by position: line 11 is U01240 (`w, v. n1?12 ch.`) and line 15
  opens U01243 (`m. (nVr) l) messenger, agent, deputy.`). Print sets two
  one-line cross-references between them, U01241 (this one) and U01242
  (`, v. sub שִׁיל׳`). The hOCR has one garbled line there (13), next
  after line 11 and its points (12); a line of points (14) and empty
  space follow it, above line 15, where the second would sit. So line 13
  is most likely this one. It reads no `v.` and no `I`: its end,
  `si,iL`, may be the I, II of the cite misread. The scan decides.
- **The cite as Sefaria has it**: `, v. שְׁלֵיוָא I, II.`
  Sefaria links U01306 `שְׁלֵיוָא, שְׁלֵוָוא, שְׁלֵיוְתָא` (no numeral
  on any form).
  The cite reads `v. שְׁלֵיוָא I, II`: the link covers `שְׁלֵיוָא I`
  only, and the `, II` after it is plain text.
  U01306 carries no numeral in the stored entry; the target is the only
  member of the family numbered at all. The cite's `, II` names a second
  member, and U01306's head line in the hOCR (vol. 2 leaf 906, line 20)
  reads `Bff^fcOi'W n, srp?Tf.(preced.)` with an `n,` after its first
  Latin run, where print may set `II` (as `n` is read for `II`
  elsewhere). That is a question about U01306's own line, not about this
  patch, and is noted only.
- **The patch's target**: U01305 `שְׁלֵיו, שְׁלֵיוָא, שְׁלֵוָוא I`
  (numeral I on form 3, `שְׁלֵוָוא`).
  **The numeral sits on a later form**: form 3, `שְׁלֵוָוא`, not the
  cite's `שְׁלֵיוָא` (form 2); an observation only, see "Numeral on a
  later form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:2112f7de`:

```text
<a class="refLink" href="/Jastrow,_שְׁלֵיוָא.1" data-ref="Jastrow, שְׁלֵיוָא 1"><span dir="rtl">שְׁלֵיוָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_שְׁלֵיו.1" data-ref="Jastrow, שְׁלֵיו 1"><span dir="rtl">שְׁלֵיוָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 191): the cite's
text reads "שְׁלֵיוָא I", Sefaria links U01306 "שְׁלֵיוָא, שְׁלֵוָוא,
שְׁלֵיוְתָא", the only family member numbered I is U01305 "שְׁלֵיו,
שְׁלֵיוָא, שְׁלֵוָוא I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `שְׁלֵיוָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

### Family תִּגְרָא

Members (every entry with a headword form of the consonants תגרא):
V00090 `תַּגָּר, תַּגָּרָא`, V00092 `תִּגְרָא, תִּי׳ I`, V00093
`תִּגְרָא, תִּי׳ II`, V00094 `תִּגְּרָא, תִּי׳`, V00095 `תַּגָּרָא`,
V00096 `תַּגְרָא`.

#### U01961 · P000774

- **Entry**: U01961 `שְׁרֵי, שְׁרָא, שְׁרֵא`, vol. 2, 1630a, leaf 953;
  continues into 1630b, same leaf.
  Entry file: [`data/entries/U/U01961.json`](../../../../../../data/entries/U/U01961.json)
- **Scan crop**: [scan 1630a · leaf 953](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$954/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 953, lines 51–52 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Ned.62a KUP-Q "WOTI ib Vtti take my case up first. Yeb.
  I00a '31 VQijB, v. Wowil; a. e.— 2) to allow, permit; 'to
  ```

  Line 51 is the Ned. reference, ending `Yeb.`; line 52 holds the Yeb.
  reference and the cite, the numeral not read as a token of its own:
  `v. Wowil; a. e.`, the Latin run and whatever stands for the numeral
  garbled together. The scan decides.
- **The cite as Sefaria has it**: `…אי ברישא take my case up first. Yeb.
  100ᵃ שָׁרֵינָא וכ׳, v. תִּגְרָא I; a. e.`
  Sefaria links V00093 `תִּגְרָא, תִּי׳ II` (numeral II on form 2,
  `תִּי׳`).
  The citing entry, U01961, is itself a `ch.` entry (`ch. same to untie,
  unharness`); the cite has no `ch.` after it.
- **The patch's target**: V00092 `תִּגְרָא, תִּי׳ I` (numeral I on form
  2, `תִּי׳`).
  **The numeral sits on a later form**: form 2, `תִּי׳`, not the cite's
  `תִּגְרָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[1)]:527d9ecb`:

```text
<a class="refLink" href="/Jastrow,_תִּגְרָא ².1" data-ref="Jastrow, תִּגְרָא ² 1"><span dir="rtl">תִּגְרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_תִּגְרָא.1" data-ref="Jastrow, תִּגְרָא 1"><span dir="rtl">תִּגְרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 204): the cite's
text reads "תִּגְרָא I", Sefaria links V00093 "תִּגְרָא, תִּי׳ II", the
only family member numbered I is V00092 "תִּגְרָא, תִּי׳ I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `תִּגְרָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

#### V00100 · P000779

- **Entry**: V00100 `תִּגְרָנָא, תִּי׳`, vol. 2, 1647b, leaf 970.
  Entry file: [`data/entries/V/V00100.json`](../../../../../../data/entries/V/V00100.json)
- **Scan crop**: [scan 1647b · leaf 970](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$971/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 970, line 59 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Xw~JiF, P m. (v. xn;p I) quarrelsome man. Targ.
  ```

  The head line; the numeral reads `I`: `(v. xn;p I) quarrelsome man.`
- **The cite as Sefaria has it**: `(v. תִּגְרָא I) quarrelsome man.
  Targ. Prov. XXII, 10 …`
  Sefaria links V00093 `תִּגְרָא, תִּי׳ II` (numeral II on form 2,
  `תִּי׳`).
- **The patch's target**: V00092 `תִּגְרָא, תִּי׳ I` (numeral I on form
  2, `תִּי׳`).
  **The numeral sits on a later form**: form 2, `תִּי׳`, not the cite's
  `תִּגְרָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:caad3d51`:

```text
<a class="refLink" href="/Jastrow,_תִּגְרָא ².1" data-ref="Jastrow, תִּגְרָא ² 1"><span dir="rtl">תִּגְרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_תִּגְרָא.1" data-ref="Jastrow, תִּגְרָא 1"><span dir="rtl">תִּגְרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 210): the cite's
text reads "תִּגְרָא I", Sefaria links V00093 "תִּגְרָא, תִּי׳ II", the
only family member numbered I is V00092 "תִּגְרָא, תִּי׳ I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `תִּגְרָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

#### V00101 · P000780

- **Entry**: V00101 `תִּגְרְתָא, תִּי׳`, vol. 2, 1647b, leaf 970.
  Entry file: [`data/entries/V/V00101.json`](../../../../../../data/entries/V/V00101.json)
- **Scan crop**: [scan 1647b · leaf 970](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$971/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 970, line 62 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  tfn"]JFl, '"Fl f. = Xnap I. Targ. Ps. XXXI, 21 px- : t
  ```

  The head line; the numeral reads `I`: `f. = Xnap I. Targ. Ps. XXXI,
  21`.
- **The cite as Sefaria has it**: `f. = תִּגְרָא I. Targ. Ps. XXXI, 21
  תִּיגְרַאת Ms. (ed.…`
  Sefaria links V00093 `תִּגְרָא, תִּי׳ II` (numeral II on form 2,
  `תִּי׳`).
- **The patch's target**: V00092 `תִּגְרָא, תִּי׳ I` (numeral I on form
  2, `תִּי׳`).
  **The numeral sits on a later form**: form 2, `תִּי׳`, not the cite's
  `תִּגְרָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:dd5c5858`:

```text
<a class="refLink" href="/Jastrow,_תִּגְרָא ².1" data-ref="Jastrow, תִּגְרָא ² 1"><span dir="rtl">תִּגְרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_תִּגְרָא.1" data-ref="Jastrow, תִּגְרָא 1"><span dir="rtl">תִּגְרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 211): the cite's
text reads "תִּגְרָא I", Sefaria links V00093 "תִּגְרָא, תִּי׳ II", the
only family member numbered I is V00092 "תִּגְרָא, תִּי׳ I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `תִּגְרָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

#### V00155 · P000781

- **Entry**: V00155 `תוגרא`, vol. 2, 1650b, leaf 973.
  Entry file: [`data/entries/V/V00155.json`](../../../../../../data/entries/V/V00155.json)
- **Scan crop**: [scan 1650b · leaf 973](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$974/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 973, line 82 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  isijnn, v. «isn i.
  ```

  Located by position: lines 80–81 are V00154 (`Y. Sot. VII, end, 22a` …
  `nb, v. "n.`) and line 83 is V00156 (`NTiFl, pi. Trim, xnxiin, v.
  Kniin.`). Line 82 is this one-line cross-reference; the numeral is
  read as a lower-case `i`: `v. «isn i.` The scan decides.
- **The cite as Sefaria has it**: `, v. תִּגְרָא I`
  Sefaria links V00093 `תִּגְרָא, תִּי׳ II` (numeral II on form 2,
  `תִּי׳`).
- **The patch's target**: V00092 `תִּגְרָא, תִּי׳ I` (numeral I on form
  2, `תִּי׳`).
  **The numeral sits on a later form**: form 2, `תִּי׳`, not the cite's
  `תִּגְרָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:6d1f738b`:

```text
<a class="refLink" href="/Jastrow,_תִּגְרָא ².1" data-ref="Jastrow, תִּגְרָא ² 1"><span dir="rtl">תִּגְרָא</span> I</a>
→
<a class="refLink" href="/Jastrow,_תִּגְרָא.1" data-ref="Jastrow, תִּגְרָא 1"><span dir="rtl">תִּגְרָא</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 212): the cite's
text reads "תִּגְרָא I", Sefaria links V00093 "תִּגְרָא, תִּי׳ II", the
only family member numbered I is V00092 "תִּגְרָא, תִּי׳ I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `תִּגְרָא I` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

### Family תִּכְלָא

Members (every entry with a headword form of the consonants תכלא):
V00540 `תַּכֵּל, תַּכָּלָא, תָּכְלָא`, V00541 `תְּכָל, תִּכְלָא, תִּי׳
I`, V00542 `תִּכְלָא, תִּי׳ II`, V00543 `תִּכְלָא III`, V00544 `תכלא,
תיכלא`.

#### U01060 · P000759

- **Entry**: U01060 `שִׁירָא, שִׁירָאָה`, vol. 2, 1568b, leaf 891.
  Entry file: [`data/entries/U/U01060.json`](../../../../../../data/entries/U/U01060.json)
- **Scan crop**: [scan 1568b · leaf 891](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$892/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 891, line 82 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  Snh.67b, v. N3*13III. Ber. 56a, v. 8&WI II. Y.Sabb.VI, 8b
  ```

  The line holds two cites, `v. N3*13III` (`כְּרִיכָא III`, not this
  patch) and this one, the numeral read `II`: `Ber. 56a, v. 8&WI II.`
- **The cite as Sefaria has it**: `…s filial respect). Snh. 67ᵇ, v.
  כְּרִיכָא III. Ber. 56ᵃ, v. תִּכְלָא II. Y. Sabb. VI, 8ᵇ bot. (expl.
  שֵׁרוֹת, I…`
  Sefaria links V00543 `תִּכְלָא III` (numeral III on form 1,
  `תִּכְלָא`).
- **The patch's target**: V00542 `תִּכְלָא, תִּי׳ II` (numeral II on
  form 2, `תִּי׳`).
  **The numeral sits on a later form**: form 2, `תִּי׳`, not the cite's
  `תִּכְלָא` (form 1); an observation only, see "Numeral on a later
  form" above.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:054d0438`:

```text
<a class="refLink" href="/Jastrow,_תִּכְלָא III.1" data-ref="Jastrow, תִּכְלָא III 1"><span dir="rtl">תִּכְלָא</span> II</a>
→
<a class="refLink" href="/Jastrow,_תִּכְלָא.1" data-ref="Jastrow, תִּכְלָא 1"><span dir="rtl">תִּכְלָא</span> II</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 189): the cite's
text reads "תִּכְלָא II", Sefaria links V00543 "תִּכְלָא III", the only
family member numbered II is V00542 "תִּכְלָא, תִּי׳ II".

</details>

**The maintainer's read**:

- [x] confirm — print reads `תִּכְלָא II` and the numeral names the
  target above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

### Family תְּרֵי

Members (every entry with a headword form of the consonants תרי): V00977
`*תָּרַי`, V00978 `תרי, תָּרָה`, V00979 `תְּרֵי, תְּרָא I`, V00980
`תְּרֵי, תְּרָא II`, V00981 `תְּרֵי, תַּרְיֵי, תְּרֵין, תַּרְתֵּי,
תַּרְתָּא, תַּרְתֵּין`.

#### V00921 · P000788

- **Entry**: V00921 `תְּרָא`, vol. 2, 1694b, leaf 1017.
  Entry file: [`data/entries/V/V00921.json`](../../../../../../data/entries/V/V00921.json)
- **Scan crop**: [scan 1694b · leaf 1017](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1018/full/1400,/0/default.jpg)
- **hOCR line**: hOCR vol. 2 leaf 1017, line 83 (Latin-only evidence:
  witnesses the numeral and position, not the Hebrew)

  ```text
  bPFl, v. *» i, ii.
  ```

  Located by position: line 81 is V00920 (`&TO, v. snin II.`) and line
  85 opens V00923 (`m. (W) fat, esp.`), with lines of vowel points
  (82, 84) between. Line 83 has one form and two numerals, as this entry
  does, so it is this one; V00922 (two forms and II alone) has no line
  of its own. The I, II of the cite is read as `i, ii`: `v. *» i, ii.`
  The scan decides.
- **The cite as Sefaria has it**: `, v. תְּרֵי I, II.`
  Sefaria links V00980 `תְּרֵי, תְּרָא II` (numeral II on form 2,
  `תְּרָא`).
  The cite reads `v. תְּרֵי I, II`: the link covers `תְּרֵי I` only, and
  the `, II` after it is plain text.
- **The patch's target**: V00979 `תְּרֵי, תְּרָא I` (numeral I on form
  2, `תְּרָא`).
  **The numeral sits on a later form**: form 2, `תְּרָא`, not the cite's
  `תְּרֵי` (form 1); an observation only, see "Numeral on a later form"
  above.
  The target is itself a `ch.` line that carries I (`ch.,`); the entry
  after it, V00980 `תְּרֵי, תְּרָא II`, is not an unnumbered `ch.` line.
- **Removes**: none (the visible text is unchanged; only the link target
  moves).

<details><summary>proposal</summary>

`replace`, `sense[]:c4e3ef90`:

```text
<a class="refLink" href="/Jastrow,_תְּרֵי ².1" data-ref="Jastrow, תְּרֵי ² 1"><span dir="rtl">תְּרֵי</span> I</a>
→
<a class="refLink" href="/Jastrow,_תְּרֵי.1" data-ref="Jastrow, תְּרֵי 1"><span dir="rtl">תְּרֵי</span> I</a>
```

Case 1 under 10-13 (docs/correction-audit.md §5.1 row 220): the cite's
text reads "תְּרֵי I", Sefaria links V00980 "תְּרֵי, תְּרָא II", the
only family member numbered I is V00979 "תְּרֵי, תְּרָא I".

</details>

**The maintainer's read**:

- [x] confirm — print reads `תְּרֵי I` and the numeral names the target
  above
- [ ] withdraw — print reads otherwise, or the cite is `ch.` (10-15), or
  the target is wrong

Read (Brian, 2026-10-31): confirmed by tick, no free-text read.

## Summary

| | count |
|---|---|
| records | 27 |
| entries | 26 |
| families | 15 |
| hOCR line found | 27 (U01241's by position only) |
| of those, the hOCR reads the numeral the cite names | 21 |
| of those, the numeral is not read (`i`, `i, ii`, run into the Latin run, garbled) | 6 |
| no hOCR line found | 0 |
| the target's numeral sits on a later form than the cite's | 12 |
| a `ch.` line follows the target | 0 |
| the citing entry is a `ch.` entry | 1 (U01961) |
| the target is itself a `ch.` line carrying its numeral | 6 blocks, 4 targets |
| the family has a reviewed `reform` (read first) | 15 records, 7 families |
| chained pairs | 1 (V00728: P000785, then P000786) |

**The hOCR reads the numeral (21)**: T01055 (P000745), U00132
(P000746), U00254 (P000748), U00526 (P000750), U00706 (P000753),
U00864 (P000755), U00973 (P000758), U01060 (P000759, `II`), U01271
(P000762), U01298 (P000763), U01568 (P000769), U01706 (P000771),
U01714 (P000772), U02027 (P000775), V00072 (P000777), V00100
(P000779), V00101 (P000780), V00601 (P000784), V00728 (P000785,
P000786), V01081 (P000789).

**The numeral is not read (6)**: as a lower-case `i` in U00629
(P000752) and V00155 (P000781); `I, II` read as `i, ii` in V00921
(P000788); run into the Latin run in Q02021 (P000704, `fl2^JI`) and
U01961 (P000774, `Wowil`); lost in U01241's garbled line (P000761,
located by position). Their read is the scan's.

| family | rid | patch | leaf | hOCR line | numeral in the hOCR | numeral on a later form |
|---|---|---|---|---|---|---|
| שׁוּקָא | U00526 | P000750 | 864 | found | read | no |
| שָׁחוֹר | U00629 | P000752 | 869 | found | not read | no |
| שָׁחוֹר | U00706 | P000753 | 874 | found | read | no |
| שָׁחוֹר | U00864 | P000755 | 882 | found | read | no |
| שָׁחוֹר | V00601 | P000784 | 995 | found | read | no |
| שָׁחוֹר | V01081 | P000789 | 1026 | found | read | no |
| שִׁידָּא | U00254 | P000748 | 847 | found | read | no |
| שֶׁלַח | U01271 | P000762 | 903 | found | read | no |
| שָׁנָה | Q02021 | P000704 | 565 | found | not read | no |
| שָׁנָה | U01568 | P000769 | 927 | found | read | no |
| שָׁנָה | V00072 | P000777 | 969 | found | read | no |
| שְׁרַק | T01055 | P000745 | 821 | found | read | no |
| שְׁרַק | U02027 | P000775 | 957 | found | read | no |
| תְּנֵי | V00728 | P000785 | 1003 | found | read | no |
| תְּנֵי | V00728 | P000786 | 1003 | found | read | no |
| שִׁבְקָא | U00132 | P000746 | 837 | found | read | yes |
| שִׁיפּוּי | U01706 | P000771 | 936 | found | read | yes |
| שִׁיפּוּי | U01714 | P000772 | 937 | found | read | yes |
| שִׁיקּוּר | U00973 | P000758 | 887 | found | read | yes |
| שִׁלְיָא | U01298 | P000763 | 905 | found | read | yes |
| שְׁלֵיוָא | U01241 | P000761 | 902 | found | not read | yes |
| תִּגְרָא | U01961 | P000774 | 953 | found | not read | yes |
| תִּגְרָא | V00100 | P000779 | 970 | found | read | yes |
| תִּגְרָא | V00101 | P000780 | 970 | found | read | yes |
| תִּגְרָא | V00155 | P000781 | 973 | found | not read | yes |
| תִּכְלָא | U01060 | P000759 | 891 | found | read | yes |
| תְּרֵי | V00921 | P000788 | 1017 | found | not read | yes |

The leaf is the hOCR line's; for Q02021 (P000704) and V00072 (P000777)
it is the leaf after the entry's own, where the cite runs over. No
block lacks an hOCR line, so no leaf here is the entry's own by
default.

## Applied (2026-10-31)

The maintainer's reads of 2026-10-31, applied in PR #205. All 27
blocks are ticked `confirm`; no `Read:` line was filled and no block
carries a note, so each reads "confirmed by tick, no free-text read",
as C1's to C4's silent confirms did. U00526's P000750 was left
unticked on the first pass; asked, the maintainer answered "Confirm"
the same day, and its `Read:` line records the follow-up.

**27 confirmed, 0 withdrawn, 0 re-aimed.** Each record's `evidence`
becomes `{"date": "2026-10-31", "kind": "maintainer-read", "leaf": L,
"reader": "Brian", "volume": 2}`, with the leaf of the block's hOCR
line (all 27 have one; for Q02021's P000704 and V00072's P000777 it is
the leaf after the entry's own, where the cite runs over); `pending`
is removed and nothing else in the record changes (checked by script:
27 lines of `reviewed/patches.jsonl` differ, each in `evidence`
alone; the line count is unchanged). Nothing goes to `docs/archive/`.
P000785 is confirmed, so the V00728 pair applies in order as it
stands and P000786 changes in `evidence` alone.

**The proposals, checked by script (2026-10-31)**, as C2's to C4's
were. On all 27: each is a `replace`, not `status: provisional`,
whose `find` differs from its `replace` and sits once in its
`expected_before`; the visible text (tags stripped) is the same on
both sides; each new `href` and `data-ref` is the target entry's
`sefariaHeadword`, and each old one the Sefaria-linked entry's (the
two rids the rationale names); the target carries the cite's numeral
on a headword form and the Sefaria-linked entry does not (26 carry a
different one; P000761's U01306 carries none). 0 problems; the same
checks with `find` and `replace` swapped fail on all 27.

**No reforms.** 12 blocks have the target's numeral on a later form
than the cite spells ("Numeral on a later form"); the other 15 need
nothing. Under ruling `10-30 one numeral per line`
([`docs/decisions.md`](../../../../../../docs/decisions.md) §10) a
numeral print sets anywhere on a headword line is that line's numeral,
so the 12 notes stand as observations only, no patch adds a numeral,
and the 27 confirmed retargets are the whole batch. What the hOCR
suggests of U01306's line (P000761's block) is not read and adds
nothing.

**The last cite-retarget batch.** With C5 applied, no record of
`cite-retargets-2026-10-15` is `pending` (the second query below
returns 0 lines, 27 before); none of the 81 records still `pending`
is a cite retarget.

**The witness.** `rm -rf data/entries/[A-Z] && bun data:import && bun
qa:format` changes no entry file: a confirm changes only a record's
evidence. `bun data:validate`: 32,512 files, 0 problems.

**The import blessing**, against the committed report at `c29945a52`:
`patches.pending` 108 → 81 (measured); gate 11 `evidenceLocator`
539 → 566 marks (the 27 new locators), gate 12 `declaredLoss` 771
and gate 13 `citeNumeral` 8,938 unchanged, all green; everything
else unchanged (reviewed 771, applied 815, annotations 118, loss,
headword issues 2,919 rows). `bun data:sefaria` regenerates the
appendix (483 rows) and the review list (288) byte-identical: the
appendix's evidence column is read from the rationale
(`evidenceOf`, `admin/pipeline/report/sefaria-evidence.ts`), which a
confirm does not change.

The batch, reproduced:

```bash
P=admin/pipeline/patch/records/reviewed/patches.jsonl
IDS='["P000704","P000745","P000746","P000748","P000750","P000752","P000753","P000755","P000758","P000759","P000761","P000762","P000763","P000769","P000771","P000772","P000774","P000775","P000777","P000779","P000780","P000781","P000784","P000785","P000786","P000788","P000789"]'
jq -c --argjson ids "$IDS" 'select(.id as $i | $ids | index($i)) | {id, rid, evidence}' $P
jq -c 'select(.evidence.pending and .prompt_version == "cite-retargets-2026-10-15")' $P
```

27 records, each `maintainer-read` 2026-10-31 with no `pending`;
`jq -s '[.[] | select(.evidence.pending)] | length' $P` gives 81,
108 before.
