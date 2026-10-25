# Maintainer checklist: what waits on you

One section waits on you as of 2026-10-25: [Scan reads for the
Sefaria appendix (2026-10-22)](#scan-reads-for-the-sefaria-appendix-2026-10-22),
now 2 blocks (review ledger L71, L82, L83). PR #193 applied the other
29 blocks; they are in [`headword-worklist.md`](headword-worklist.md)
§ Applied from the maintainer checklist (2026-10-25). Held: § Two
spellings in one form (5 patches), whose display needs a rule change
before it can be written, and M01355's `refs` item, asked again. Neither
is a pre-publication item: neither changes a `headwords[0]`. This file keeps the
pre-publication items, by your ruling of 2026-10-18 under your blocker
definition ([`review-ledger.md`](review-ledger.md) § Definitions): the
answers that change a `headwords[0]`, since the URL name is computed
from it and a name changed after go-live costs a redirect forever (U6;
redirects are unbuilt, L23). PR #187 applied every block you answered;
they are in [`headword-worklist.md`](headword-worklist.md) § Applied
from the maintainer checklist (2026-10-22). The deferred questions are
GitHub issues #188 and #189, with their rows in
[`post-go-live-review.md`](post-go-live-review.md), and the
textual-research rows are #190's (and #153's), in
[`headword-worklist.md`](headword-worklist.md) § Textual-research
candidates (#190; the X9 five in #153).

Future batches add their sections here, one question per block: tick
ONE box per bullet, and write a `note:` only where the box you tick
asks for one. A block's `Recommendation:` is a default you can accept
by ticking the box it names. When you are done, say "checklist done",
and a PR applies the ticks: an answer that changes the data becomes a
reviewed patch, and a "kept", "no word" or "can't tell" is recorded
instead (a reviewed-kept record or the review ledger row). A ticked
item leaves this file when a PR applies it; its history lives in the
worklists ([`headword-worklist.md`](headword-worklist.md),
[`sense-worklist.md`](sense-worklist.md)) and the tranche READMEs under
[`admin/pipeline/patch/records/tranches/`](../admin/pipeline/patch/records/tranches/).

| section | items | source PR | ledger row |
|---|---|---|---|
| [Scan reads for the Sefaria appendix (2026-10-22)](#scan-reads-for-the-sefaria-appendix-2026-10-22) | 2 blocks, 6 patches (29 of the first 30 applied in PR #193) | #192, #193 | L71, L82, L83 |

## Scan reads for the Sefaria appendix (2026-10-22)

Review ledger L71, PR #192; PR #193 applied 29 of the 30 blocks and 60 of the 66 patches (in [`headword-worklist.md`](headword-worklist.md) § Applied from the maintainer checklist (2026-10-25)). Two blocks are left: the five two-spelling headwords, held for a rule, and M01355's `refs` item, asked again.

The hOCR is verbatim, invisible bidi marks included. Volume 1 is
Tesseract (Hebrew runs mirrored, `I` read as `1` or `l`); volume 2 is
ABBYY (Hebrew read as Latin glyphs, numerals read well).

| block | patches |
|---|---|
| [Two spellings in one form](#two-spellings-in-one-form) | 5 |
| [M01355 `מִכְוַור`: the `refs` item `Rosh Hashanah 23b`](#m01355-מִכְוַור-the-refs-item-rosh-hashanah-23b) | 1 |

#### Two spellings in one form

Covers 5 patches (P000297, P000298, P000299, P000300, P000301). The patches' claim: print sets the two spellings as two forms, a comma between them.

| rid | Sefaria's text | hOCR, verbatim | scan |
|---|---|---|---|
| [I00158](https://jastrow.app/#rid:I00158) | `טְוִיָּיה טְוִיָּה` (alt `טְוִויָּה`) | `FIPS £. (PS) spinning, Babb, 74".‏ > ח` | [523b · leaf 546](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$547/full/1400,/0/default.jpg) |
| [I00654](https://jastrow.app/#rid:I00654) | `טְפֵילָה טְפֵילָא` | no readable line | [547a · leaf 570](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$571/full/1400,/0/default.jpg) |
| [M02116](https://jastrow.app/#rid:M02116) | `מַעְיָינָא מַעְיָנָא` | `fcO^Q S j"^Q ch. same, belly, ivomb, bowels. Targ.` | [816a · leaf 139](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$140/full/1400,/0/default.jpg) |
| [A01161](https://jastrow.app/#rid:A01161) | `אֵידֵין` (alt `אֵידְנָא, אַיְידָא אֵידָא, (אַיְידִי)`) | no readable line | [45a · leaf 68](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$69/full/1400,/0/default.jpg) |
| [M02868](https://jastrow.app/#rid:M02868) | `מְשֵׁיזֵב` (alt `מְשֵׁיזְבָא מְשֵׁיזִיב`) | no readable line | [852a · leaf 175](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$176/full/1400,/0/default.jpg) |

Why held: I00158 `FIPS £. (PS) spinning`: the two forms are not read; I00654 no readable head line; M02116 `fcO^Q S j"^Q ch. same`: the two forms are not read; A01161 no readable head line; M02868 no readable head line.

**Question.** Does print separate the two spellings with a comma?

- **I00158** (P000297)
  - [ ] yes: two forms
  - [ ] no: print sets them as stored
  - [ ] can't tell from the scan
  - note: XXX or XXX, XXXX m. ...  ( I need your anaylsis here, but my gut feeling, especially for indexing is to list as alt, but set display as print)
- **I00654** (P000298)
  - [ ] yes: two forms
  - [ ] no: print sets them as stored
  - [ ] can't tell from the scan
  - note: XXXXX XXXXX, v. ....
- **M02116** (P000299)
  - [ ] yes: two forms
  - [ ] no: print sets them as stored
  - [ ] can't tell from the scan
  - note: XXXX, XXXXX m. ....
- **A01161** (P000300)
  - [ ] yes: two forms
  - [ ] no: print sets them as stored
  - [ ] can't tell from the scan
  - note: XXXXX m., XXXX XXXXX (XXXXX) XXXXX f. ....
- **M02868** (P000301)
  - [ ] yes: two forms
  - [ ] no: print sets them as stored
  - [ ] can't tell from the scan
  - note: XXXX, XXXXXX, XXXXXX m. ....

Recommendation: yes (high): two complete spellings of one word, as the forms around them are set.

**Held in PR #193.** Your notes are read, with your gut and its analysis: store every spelling as a form, so each is a lookup key, and set `display` to print's layout, with `or` as literal text where print sets it. The entry contract accepts that (`admin/entry/headword-rules.ts`), but the import's gate 2 does not: a template a patch supplies must keep the line's notation, and `or` is a word the source line does not carry (`gates.ts`, `checkHeadwordLine`; a probe of I00158's `{0} or {1}, {2}` fails with `[] → [or×1]`). The smallest change is to let `or` pass that count the way the comma does, with a ruling first (review ledger L83; the change and a test sketch are in the tranche README [`checklist-batch-2-2026-10-25`](../admin/pipeline/patch/records/tranches/checklist-batch-2-2026-10-25/README.md) § E). Your `X` runs, mapped to the stored forms by word count and order:

| rid | your line | forms, in order | print's display | stored today |
|---|---|---|---|---|
| I00158 | `XXX or XXX, XXXX m. ...` | `טְוִיָּיה`, `טְוִיָּה`, `טְוִויָּה` | `{0} or {1}, {2}` (needs the rule) | `{0}, {1}, {2}` |
| I00654 | `XXXXX XXXXX, v. ....` | `טְפֵילָה`, `טְפֵילָא` (no comma between; `, v.` is the gloss) | `{0} {1}` | `{0}, {1}` |
| M02116 | `XXXX, XXXXX m. ....` | `מַעְיָינָא`, `מַעְיָנָא` | `{0}, {1}` | the same |
| M02868 | `XXXX, XXXXXX, XXXXXX m. ....` | `מְשֵׁיזֵב`, `מְשֵׁיזְבָא`, `מְשֵׁיזִיב` | `{0}, {1}, {2}` | the same |
| A01161 | `XXXXX m., XXXX XXXXX (XXXXX) XXXXX f. ....` | `אֵידֵין`, then `אֵידָא` (the one four-letter form), then `אֵידְנָא` or `אַיְידָא`, `(אַיְידִי)`, and the other | not settled | `{0}, {1}, {2}, {3}, ({4})` |

I00158: your line has `m.`, the entry's gloss `f.` (`f. (טָוָה) spinning`).

**Question 1.** May `display` carry print's `or` between two spellings (a ruling, then the gate change with its tests)?

- [ ] yes: allow `or`; a PR writes I00158 `{0} or {1}, {2}`, I00654 `{0} {1}`, and confirms M02116 and M02868 as stored
- [ ] no: keep `or` out of `display`; a PR writes I00654 `{0} {1}`, confirms M02116 and M02868, and leaves I00158 as stored
- note:

**Question 2.** A01161: which form stands right after `אֵידָא`, before `(אַיְידִי)`?

- [ ] `אֵידְנָא` (then `(אַיְידִי) אַיְידָא f.`)
- [ ] `אַיְידָא` (then `(אַיְידִי) אֵידְנָא f.`)
- [ ] can't tell from the scan
- note:

Recommendation: yes on 1 (medium): `or` is print's own word between spellings, and it is the only literal the change admits; 2 is yours to read.

#### M01355 `מִכְוַור`: the `refs` item `Rosh Hashanah 23b`

Covers 1 patch (P000232). The patch removes Sefaria's `refs` item `Rosh Hashanah 23b` as a place the entry never cites (review doc 02, 2026-08-05). You ticked both boxes in the first round ("no: the removal stands" and "yes"), with the note "There is a Y. R. Shan. II 58a".

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [M01355](https://jastrow.app/#rid:M01355) | `…—Y. R. Hash. II, 58ᵃ top הרי מ׳ וגדור; (Bab. ib. 23ᵇ; Tosef. ib. II (I), 2 חרים וכייר), v. גְּדוֹר; …` | no readable line | [781b · leaf 104](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$105/full/1400,/0/default.jpg) |

Why asked again: right after the Yerushalmi you found, the entry cites `Bab. ib. 23ᵇ`, the Babylonian Rosh Hashanah 23b, and that is the place Sefaria's `refs` item names. Sefaria's text leaves the cite unlinked. If print reads `Bab. ib. 23ᵇ` there, the item has a basis and the removal is wrong. `refs` never reaches our entry files, so nothing in our data changes either way; the answer decides only what is sent to Sefaria (review ledger L82).

**Question.** Does print read `(Bab. ib. 23ᵇ; …)` after `Y. R. Hash. II, 58ᵃ top`?

- **M01355** (P000232)
  - [ ] yes: `Bab. ib. 23ᵇ` (the removal is wrong; a PR withdraws P000232)
  - [ ] no: print cites no Bavli 23b (the removal stands; say what it reads in the note)
  - [ ] can't tell from the scan
  - note:

Recommendation: yes (high): the cite is in Sefaria's own text of the entry, and `ib.` there can only be Rosh Hashanah.
