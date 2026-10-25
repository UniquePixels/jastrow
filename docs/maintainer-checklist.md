# Maintainer checklist: what waits on you

One section waits on you as of 2026-10-25: [Scan reads for the
Sefaria appendix (2026-10-22)](#scan-reads-for-the-sefaria-appendix-2026-10-22),
now 2 blocks (review ledger L71, L82, L83). PR #193 applied the other
29 blocks, and PR #n four of the five two-spelling patches under ruling
`10-25 display or`; they are in [`headword-worklist.md`](headword-worklist.md)
§ Applied from the maintainer checklist (2026-10-25). Held: A01161's
form order (1 patch) and M01355's `refs` item, asked again. Neither
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
| [Scan reads for the Sefaria appendix (2026-10-22)](#scan-reads-for-the-sefaria-appendix-2026-10-22) | 2 blocks, 2 patches (29 of the first 30 applied in PR #193, four of the 30th's five in PR #n) | #192, #193, #n | L71, L82, L83 |

## Scan reads for the Sefaria appendix (2026-10-22)

Review ledger L71, PR #192; PR #193 applied 29 of the 30 blocks and 60 of the 66 patches, and PR #n four more (in [`headword-worklist.md`](headword-worklist.md) § Applied from the maintainer checklist (2026-10-25)). Two blocks are left: A01161's form order and M01355's `refs` item, asked again.

The hOCR is verbatim, invisible bidi marks included. Volume 1 is
Tesseract (Hebrew runs mirrored, `I` read as `1` or `l`); volume 2 is
ABBYY (Hebrew read as Latin glyphs, numerals read well).

| block | patches |
|---|---|
| [Two spellings in one form: A01161](#two-spellings-in-one-form-a01161) | 1 |
| [M01355 `מִכְוַור`: the `refs` item `Rosh Hashanah 23b`](#m01355-מִכְוַור-the-refs-item-rosh-hashanah-23b) | 1 |

#### Two spellings in one form: A01161

Covers 1 patch (P000300). PR #n applied the other four under ruling `10-25 display or` (the block, byte for byte, is in [`headword-worklist.md`](headword-worklist.md) § Applied from the maintainer checklist (2026-10-25)): `display` may carry print's `or`, and every spelling stays a form. A01161 is left, because its order is not settled.

| rid | Sefaria's text | hOCR, verbatim | scan |
|---|---|---|---|
| [A01161](https://jastrow.app/#rid:A01161) | `אֵידֵין` (alt `אֵידְנָא, אַיְידָא אֵידָא, (אַיְידִי)`) | no readable line | [45a · leaf 68](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$69/full/1400,/0/default.jpg) |

Your note: `XXXXX m., XXXX XXXXX (XXXXX) XXXXX f. ....`. Five runs, five forms, but print's order is not Sefaria's: the first run is `אֵידֵין`, the four-letter run is `אֵידָא` (the only four-letter form, fourth in Sefaria), `(XXXXX)` is `אַיְידִי`, and the two five-letter runs either side of it are `אֵידְנָא` and `אַיְידָא`, in an order nothing in the note shows. Stored today: `{0}, {1}, {2}, {3}, ({4})`.

**Question.** A01161: which form stands right after `אֵידָא`, before `(אַיְידִי)`?

- **A01161** (P000300)
  - [ ] `אֵידְנָא` (then `(אַיְידִי) אַיְידָא f.`)
  - [ ] `אַיְידָא` (then `(אַיְידִי) אֵידְנָא f.`)
  - [ ] can't tell from the scan
  - note:

Recommendation: none: this one is yours to read.

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
