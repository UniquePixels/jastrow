# Post-issues fixes (2026-10-22)

PR #n, under ruling `10-13 correction policy`
([`docs/decisions.md`](../../../../../../docs/decisions.md) §9), case
1 throughout: a transcription error where print is right is corrected
with no annotation; the patch rationale is the only trace.

**One new reviewed patch, P000930, and three amended in place**
(P000388, P000389, P000881), all in
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl). D00164
takes its first `repaired` record in
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl); the
amended patches keep their ids and records. P000930's
`prompt_version` is `post-issues-2026-10-22` and its `snapshot` is
`sha256:75bbc5ee…`. This directory holds only this README.

| Patch | rid | Op | What changed |
|---|---|---|---|
| P000930 | D00164 | `replace` (new) | `Gen. R. s. 8, beg. דיו` re-aimed from D00500 (ink) to D00501 `דְּיוֹ` II (two) |
| P000881 | U00344 | `reform` (amended) | the last form `שׁוּחַ)` → `(שׁוּחַ)`, and `display` `{0} II, {1}, ({2})`, so the II it sets shows |
| P000388, P000389 | A01002 | `join`, `split` (amended) | the rationale's evidence: leaf 62's hOCR and scan, not leaf 61's (review ledger L70) |

## D00164 `דּוּ` III (282a)

`(δύο, only in certain compounds) two, double. Lev. R. s. 14, beg. דו
פרצופין נברא Adam was created with two faces …; Gen. R. s. 8, beg. דיו;
Ber. 68ᵃ; a. e.— … V. דְּיוֹ II.` The `דיו` is Gen. R.'s own spelling of
the phrase Lev. R. quotes: D00682 `דִּיפְּרוֹסוֹף` quotes the same
passage as `Gen. R. s. 8 beg. דיו פרצופים וכ׳`. It is D00501 `דְּיוֹ` II,
`(δι-) two, double, a Greek prefix, sometimes used as a separate word
(δύο)`, the entry D00164 names in its last words. Sefaria's linker
pointed it at D00500 `דְּיוֹ` I (ink), the slip review ledger L73 left
open. It is a word of Jastrow's, the Greek `two`, so the link is
re-aimed, not removed (A00627's Gesenius cite, P000915, was removed
because it names no entry of Jastrow's). The hOCR of the line does not
read the word: `דו פרצ' beg. 1"; Ber. 68°; a.e.— Ex. 4.8.5 REMAN ,8 .8`
([282a · leaf 305](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$306/full/1400,/0/default.jpg)).

## U00344 `שְׁוַוח` II (1529b)

PR #187's P000881 set print's II on form 0 but no `display`, because
the line's parentheses did not balance: Sefaria's last alternate is
`שׁוּחַ)`. The hOCR (ABBYY, Hebrew as Latin glyphs read right to left)
reads the line `'mid  n,  n"u;,  (rno") .  h. n*,  d  /0  &««?,  &e`:
`שְׁוַוח II, שְׁוַח, (שׁוּחַ) = h. שׁוּחַ, to bend, be`. The `)` is
print's, and Sefaria dropped the `(`. The amended reform writes the
form `(שׁוּחַ)` (the stored text stays `שׁוּחַ`; the parentheses go to
`display`) and supplies `{0} II, {1}, ({2})`, the template ten
entries already carry. The line leaves the review report's
`paren-group-close-unknown` (32 → 31). P000881 moves from the Sefaria
appendix to its review list (`not mechanical for op`: a `display`
that sets a layout), since the one patch now states two of Sefaria's
slips, the numeral and the parenthesis.

## A01002 `אַחֲוָה` (39a)

P000388 and P000389 quoted the hOCR and linked the scan of leaf 61
(p. 38b), where `אָח` cites the same Gen. R. s. 89. They now quote
A01002's own column on leaf 62 (p. 39, by the page index) and link
`$63`. The hOCR has no words for the line that carries the join's
evidence, so the rationale quotes the lines either side of it and names
the scan read of 2026-10-16. The `find`, `replace` and
`expected_before` are unchanged, and the re-import changes no entry for
them; `bun data:sefaria` moves both from the review list (`scan link
outside the entry`) to the appendix.

## Witness

The re-import (`rm -rf data/entries/[A-Z] && bun data:import && bun
qa:format`) changes exactly D00164 and U00344; every gate is green.
