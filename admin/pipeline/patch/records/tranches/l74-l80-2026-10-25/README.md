# L74, L80, L82, L83: four maintainer reads (2026-10-25)

PR #196, review ledger L74, L80, L82 and L83, under ruling `10-13
correction policy` ([`docs/decisions.md`](../../../../../../docs/decisions.md)).
The maintainer's four scan reads of 2026-10-25. U01686 gets the
homograph I that Jastrow's own text gives it (case 2, annotated); the two cites that
name it are re-aimed at it (case 1), and A01194 gets back the three
Hebrew phrases Sefaria lost inside `(b. h. …)` (case 1). The last two
checklist blocks, answered on `docs/checklist-batch-3` (`efc91fc8e`,
merged here): A01161's forms are set in print's order (case 1), and
P000232, which removed a `refs` item M01355's text cites, is
withdrawn. `docs/maintainer-checklist.md` now holds no blocks; both
are in `docs/headword-worklist.md` § Applied from the maintainer
checklist (2026-10-25). Every patch is in
[`../../reviewed/`](../../reviewed/); the new ones have
`prompt_version` `l74-l80-2026-10-25`, snapshot `sha256:75bbc5ee…`.

## What changed

| | patch | rid | op | case |
|---|---|---|---|---|
| new | P000936 | U01686 `שַׁעַר` | `reform`, `homographs` `{form: 0, homograph: 1}`, `display` `{0} I` | 2, annotated `print-error` |
| new | P000937 | U01689 `שַׁעֲרָא` II | `replace`: the cite's link U01679 → U01686 | 1 |
| new | P000938 | U00991 `שִׁיעוּר` | `replace`: the cite's link U01679 → U01686 | 1 |
| amended in place: payload and rationale | P000197 | A01194 `אֵיזֶה` | `replace`: `h. <` → the three phrases and the `)` | 1 |
| amended in place: payload and rationale | P000300 | A01161 `אֵידֵין` | `reform`: the forms in print's order, `display` `{0}, {1} {2} ({3}) {4}` | 1 |
| withdrawn, bytes moved to [`docs/archive/patches-retired-2026-10-25/`](../../../../../../docs/archive/patches-retired-2026-10-25/README.md) | P000232 | M01355 `מִכְוַור` | `unref` of `Rosh Hashanah 23b` | — |

Manifest: U01686, U01689 and U00991 are new `repaired` records naming
their patch; A01194 still names P000197 alone, and A01161 P000300.
M01355's record, which named only P000232, is removed.

## L74: U01686 `שַׁעַר` takes the I

The maintainer read 1612b: print sets **no** numeral on U01686 (hOCR
`"1510 m. (b. h.; iSta to divide, break open) 1) gate,`, leaf 935).
He rules the I is set on Jastrow's own text, which names `שַׁעַר I`
twice, both times for U01686's second sense, `market, market price`:

- U01689 `שַׁעֲרָא` II (1613a · leaf 936): `m. = h. שַׁעַר I, 2, market
  price` (hOCR `&^'^>* II m. = b. -rf I, 2, market price. Ruth R.`);
- U00991 `שִׁיעוּר` (1565a · leaf 888): `Y. B. Bath. V, end, 15ᵇ לש׳ for
  regulating the market prices, v. שַׁעַר I` (hOCR `end, 15b 'tt)b for
  regulating the market prices, v. ",rr I.`).

Sefaria links both to U01679 `שָׁעַר` I, the verb `to keep the gate`,
which carries an I: the numeral matches, the pointing does not, so the
correction audit's numeral list (§5) never saw them.

- **P000936** (case 2) sets the I through `homographs` (ruling 10-09
  reform homographs), so the headword string the links resolve by is
  untouched, and displays it (`{0} I`, rule 3). Its annotation, as the
  import writes it:

  ```json
  {"field": "homograph", "kind": "print-error", "printed": "", "stored": "I",
   "evidence": "Jastrow's text names שַׁעַר I: U01689 \"= h. שַׁעַר I, 2, market price\" and U00991 \"v. שַׁעַר I\" (market prices), both U01686's sense 2; print sets no numeral (1612b, maintainer scan read 2026-10-25)",
   "source": "P000936", "date": "2026-10-25"}
  ```

- **P000937, P000938** (case 1) re-aim each cite's anchor at U01686 by
  its link key (ruling 10-09 link key): the pre-patch line, bare
  `שַׁעַר`. The find is the one anchor `href="/Jastrow,_שָׁעַר I.1"`
  whose visible text is `שַׁעַר I`; U00991's etymology link to the verb
  (`(שָׁעַר)`, its own `<a dir="rtl" …>`) is a different string and is
  not touched. The visible text is unchanged and neither carries an
  annotation.

`nameOf`: U01686 `שַׁעַר` → `שַׁעַר I`. No collision: U01687 is
`שַׁעַר II`, and U01679's `שָׁעַר I` is pointed with qamats (the names
gate is green). No other entry's text names `שַׁעַר I` (a corpus search
of `data/entries/` finds only these two cites). The name change is
pre-publication (U2, U6).

## L80: A01194's `(b. h. …)`

The maintainer sent a scan crop of 46b (leaf 69). The line reads:

```text
אֵיזֶה, אֵיזֶהוּ, אֵזֶ׳ m., אֵיזוּ f. (b. h. אֵיזֶה=אֵי זֶה, אֵיזֶה הוּא, אֵי זוּ) who? what? which? Ab. IV, 1 …
```

The hOCR has the line mirrored (lines 12 and 13 of leaf 69:
`אי זַה=אֶיזֶה WPS, SN m., 1% +. (b. h.‏ ,איזה` /
`ארזהו חכם who? what? which? Ab. TV,1‏ (אֶר זז אה הא`), which agrees on
the `=` and the run's shape but cannot spell it.

**Mechanism: P000197 amended in place**, not a second `replace`.
P000197's `replace` already sits on that seam (`h. <` → `h.) <`, the
`)` PR #193 confirmed), and a second patch on the same sense would have
to anchor to the text P000197 leaves. The records' practice for a
reviewed patch whose target still stands is to amend it in place
(P000194 and P000268 in PR #193). The id, target, `expected_before`,
snapshot and `prompt_version` are unchanged. The payload is now:

```text
h. <  →  h. <span dir="rtl">אֵיזֶה</span>=<span dir="rtl">אֵי זֶה</span>, <span dir="rtl">אֵיזֶה הוּא</span>, <span dir="rtl">אֵי זוּ</span>) <
```

Each phrase is its own Hebrew run, as the entry's others are (the
source's `<span dir="rtl">`, `<he>` in the entry file). The `=` stays
outside the runs, as every one of the corpus's 150 `</he> = <he>` does;
it is set tight, as print sets it here. The pointing is as read, in
NFC, and no vowel is added beyond it. The rationale's 2026-10-25
amendment paragraph is rewritten: it no longer says the phrases are not
restored, so the appendix's partial filter lets the row through.

The feminine on the line is `אֵיזוּ` (shuruk), as A01195's headword and
A01194's cite store it: a first read as `אֵיזוֹ` was the controller's,
corrected by the maintainer the same day, so nothing else moves. The
last phrase, `אֵי זוּ`, is written with the same shuruk.

A01194's gloss, before and after:

| | gloss head |
|---|---|
| before | `m., <cite ref="A01195"><he>אֵיזוּ</he></cite> f. (b. h.) <i>who? what? which?</i> …` |
| after | `m., <cite ref="A01195"><he>אֵיזוּ</he></cite> f. (b. h. <he>אֵיזֶה</he>=<he>אֵי זֶה</he>, <he>אֵיזֶה הוּא</he>, <he>אֵי זוּ</he>) <i>who? what? which?</i> …` |

Text conservation: the new file is the old one with exactly
` <he>אֵיזֶה</he>=<he>אֵי זֶה</he>, <he>אֵיזֶה הוּא</he>, <he>אֵי זוּ</he>`
inserted after `(b. h.` (script-checked: 73 characters, nothing else in the file moves).

## L83: A01161's form order

The maintainer's line (`XXXXX m., XXXX XXXXX (XXXXX) XXXXX f. ....`,
2026-10-22) fixed every form but two; on 2026-10-25 he ticked
`אַיְידָא` (then `(אַיְידִי) אֵידְנָא f.`). Print sets:

```text
אֵידֵין m., אֵידָא אַיְידָא (אַיְידִי) אֵידְנָא f.
```

P000300 is amended in place (id, target, `expected_before`, snapshot
and `prompt_version` unchanged). Its payload was the legacy
`{headword, alt_headwords}`, the split alone in Sefaria's order; it is
now `{display, forms}`:

| | forms | display |
|---|---|---|
| before | `אֵידֵין`, `אֵידְנָא`, `אַיְידָא`, `אֵידָא`, `(אַיְידִי)` | `{0}, {1}, {2}, {3}, ({4})` |
| after | `אֵידֵין`, `אֵידָא`, `אַיְידָא`, `(אַיְידִי)`, `אֵידְנָא` | `{0}, {1} {2} ({3}) {4}` |

A `reform`'s `forms` are the headword line's items as the source sets
them, so `(אַיְידִי)` keeps its parentheses there; the parser moves them
into `display` and stores the form as `אַיְידִי` (rule 4), as it did
before and as A02823's P000308 does with `(אַפְרִיקָא)`. The entry file
has `{3}` = `אַיְידִי` and displays `(אַיְידִי)` once.

The separators follow his line: a comma after the first form (print's
`m.,`), a space between the others (`XXXX XXXXX (XXXXX) XXXXX`). The
`m.` and `f.` are grammar, not display text. No committed `display`
carries a gender label, although rule 3 would allow one beside a form
that has a `gender`: lines with a label between forms keep it in the
gloss head or `grammar`, as A01194's `m., אֵיזוּ f.` does. Sefaria
keeps only the `f.` (its `morphology`, our `grammar.gender` and
gloss head `f. (h. …`); the `m.` after `אֵידֵין` is in neither
Sefaria's text nor ours, and this patch does not add it. The display
rules and gate 2 accept the template (`headwordLine` green). Every
spelling stays a form, and `headwords[0]` is still `אֵידֵין`, so the
name is unchanged (`nameOf` `אֵידֵין` before and after). The appendix
holds the row as `not mechanical for op` (it sets a layout), as it does
I00158's and A02823's.

## L82: P000232 withdrawn

P000232 removed M01355's `refs` item `Rosh Hashanah 23b` as baseless
(review doc 02, 2026-08-05). The entry cites it: `Y. R. Hash. II, 58ᵃ
top …; (Bab. ib. 23ᵇ; Tosef. ib. II (I), 2 …)`, where `Bab. ib. 23ᵇ`
is the Bavli Rosh Hashanah 23b, unlinked in Sefaria's text. The
maintainer ticked yes on 2026-10-25 (his note: "Yup that one is totaly
on me, I missed that!"). Withdrawing needs no op: the line moved, bytes
unchanged, to the archive, so Sefaria's item stands. `refs` never
reaches our entry files (ruling B7), so no entry file changes; P000232
was never an appendix row (`no print evidence`), so nothing is sent
either way.

## Verification

- First pass (L74, L80): `bun data:import` into an emptied `data/entries/` (the drift-check
  procedure: clear the letter directories, import, `bun qa:format`),
  then `git status` against the committed tree: four entry files
  differ, `A01194`, `U00991`, `U01686`, `U01689`; every gate green
  (`textConservation` 278545/278545, `internalTargets` 32512/32512,
  `names` 65024/65024, `headwordLine` 97630/97630). Each file was
  script-checked against the committed one: U01686 differs only in
  `headwords[0].homograph`, its `annotations` and `display`; U01689 and
  U00991 only in the cite's `ref`, U01679 → U01686; A01194 only by the
  inserted phrases. Patch corpus 768 → 771 reviewed, 812 → 815 applied;
  annotations 117 → 118 (102 → 103 `print-error`).
- Headword report: X10 4 → 3 rows (1 → 0 primary): U01687's row is
  gone.
- `bun data:validate`: 32512 files, 0 problems.
- `bun data:sefaria`: 479 → 482 appendix rows. P000937 and P000938 are
  `cross-reference-target` rows (evidence: maintainer print read
  2026-10-25; hOCR; the citing entry's leaf), and P000197 is a
  `reviewed-replace` row (it was held as `partial: print not fully
  restored`). P000936 is in the review list as our convention (the
  implied homograph I, case 2), as its annotation requires.
- Second pass (L82, L83), the same procedure: one more entry file
  differs, `A01161`, and only in the order of `headwords` and in
  `display` (the same five form objects; every other field equal,
  script-checked). M01355's file is unchanged, as expected. Every gate
  green (`headwordLine` 97632/97632). Patch corpus 771 → 770 reviewed,
  815 → 814 applied; annotations 118.
- `bun data:validate`: 0 problems. `bun data:sefaria`: 482 appendix
  rows, unchanged; the review list 289 → 288 (P000232 gone; P000300 moves
  from `no print evidence` to `not mechanical for op`), and
  `no print evidence` 2 → 0.
