# Print evidence for the held Sefaria rows (2026-10-22)

PR #192, review ledger L71. The Sefaria appendix (`bun data:sefaria`,
[`../../../../report/sefaria-evidence.ts`](../../../../report/sefaria-evidence.ts))
held back 133 reviewed patches as `no print evidence`: Sefaria's own
errors whose rationale names no print read. The maintainer's bar for
anything sent: "solid and verified, no slop, no ambiguous". This
tranche quotes the hOCR wherever the line shows the patch's fact, and
leaves the rest held, with the reason, for a scan read.

**No new patch and no entry change.** 67 patches in
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl) are
amended in place: id, target, payload, `expected_before` and
`prompt_version` unchanged, the rationale extended by one paragraph,

```text
Amendment 2026-10-22 (review ledger L71): Print evidence (hOCR,
<page><col> · leaf <n>, 2026-10-22): "<verbatim line>"[ / "<next line>"];
<what the line shows> (<IIIF link of that leaf>).
```

which the evidence filter reads as `hOCR; scan leaf <n>`. The
re-import (`rm -rf data/entries/[A-Z] && bun data:import && bun
qa:format`) changes no entry file. This directory holds only this
README.

## How the lines were read

- **Where.** The entry's page and column from the page index
  (`data/page-index/entries.jsonl`), the leaf from `columns.jsonl`, and
  every page from the entry's own to the page the next entry starts on:
  the range the appendix's scan check allows (`scanProblem`). The
  column a line is in comes from its x position on the leaf.
- **What a line is.** One `ocr_line` of `data/print/hocr/`: its words'
  text, HTML entities decoded, each stripped and joined by one space.
  Nothing is typed: an amendment names lines by (volume, leaf, line
  number) and the script copies their text, invisible bidi marks
  included.
- **When a line shows the fact,** matched mechanically:
  - `reviewed-join` (a phantom sense at a citation's own `N)`): the
    line has `N)` not preceded by a dash, with one of the next sense's
    first three words within 32 characters after it. Print runs on, so
    the `N)` closes the parenthesis or citation and is no marker.
  - `reviewed-replace` reinsertions: the marker the patch inserts
    (`1)`, or `—2)` with its em dash) followed by the text after it.
    The three bare-citation wraps: the cite (`Ib. 88b`) and the cite
    its `Ib.` resolves to (`Erub.`).
  - `reviewed-retag` (`-2)` for `—2)`): an em dash before `2)`,
    followed by the sense's first words.
  - `cross-reference-target`: the cite's own line, in the citing
    entry, with the Roman numeral standing alone after a word that
    follows `v.`, `cmp.`, `;`, `—`, `=` or `(`. That is the cite's text
    in print. Where the hOCR reads them, the line of the entry the
    patch links and of the one Sefaria links are added with their
    numerals (each matched the same way), by page and leaf without a
    scan link, since the appendix admits a scan link only on the citing
    entry's pages.
- **Script-verified.** Every amendment, read back from
  `patches.jsonl`: each quoted line is a verbatim substring of its
  leaf's hOCR text and sits in the rationale in quotes; the token check
  above passes; every other field equals `v2`'s. **67 of 67 passed.**
  Controls: the held lines of A00913 (`9) coening`), B00656 (`2( 1.`)
  and I00149 fail the join check, a neighbouring line fails it for
  A01662, an ASCII hyphen fails the dash check, and `II` fails on
  Q00942's `v. xmibs I.`.

## Results

| class | patches | quoted: appendix row | quoted: held by `not traceable to source` | quoted: held by `not mechanical for op` | scan read (checklist) | read against the patch |
|---|---|---|---|---|---|---|
| `cross-reference-target` | 55 | 16 | 0 | 0 | 38 | 1 |
| `reviewed-join` | 36 | 17 | 11 | 4 | 4 | 0 |
| `reviewed-replace` | 18 | 12 | 2 | 0 | 2 | 2 |
| `reviewed-retag` | 5 | 3 | 2 | 0 | 0 | 0 |
| `headword-two-forms` | 5 | 0 | 0 | 0 | 5 | 0 |
| `headword-separator` | 4 | 0 | 0 | 0 | 4 | 0 |
| `reviewed-unref` | 3 | 0 | 0 | 0 | 3 | 0 |
| `headword-gloss-comma` | 3 | 0 | 0 | 0 | 3 | 0 |
| `headword-equals-variant` | 2 | 0 | 0 | 0 | 2 | 0 |
| `headword-separator-anchor` | 1 | 0 | 0 | 0 | 1 | 0 |
| `headword-paren-placement` | 1 | 0 | 0 | 0 | 0 | 1 |
| **total** | 133 | 48 | 15 | 4 | 62 | 4 |

**Appendix 383 → 431 rows (+48); `no print evidence` 133 → 66.** The
19 quoted but held are no longer held for evidence: 15 are `not
traceable to source` (our transforms changed the text before the patch,
so the generator cannot find it once in Sefaria's string) and 4 are
`not mechanical for op` (a join into the entry's own head: J00301,
O01360, P01088, P01094). They wait on the appendix generator, not on
print.

### Read against the patch (4): not amended

Review ledger L75–L78. Each is listed in the checklist's
[Read against the patch](../../../../../../docs/maintainer-checklist.md#read-against-the-patch-4)
for the maintainer.

- **P000194, A00675**: print reads `p. 18; 261) 1) Ulam`, the page
  `261)` and the marker `1)` (hOCR 26a · leaf 49: `Onom.; Neub. Géogr.
  p. 18; 261) 1) Ulam (Porta) a place`). The patch turns `261)` into
  `26 1)`, losing print's `1)` of the page number and its parenthesis.
  The sense worklist already lists A00675 so (class 7's false hits);
  `docs/sefaria-report.md` §3's example still reads it the patch's way.
- **P000268, Q02162**: print reads `(Ez. XXXVII, 12); a. fr. — 2)`
  (1253b · leaf 576). The `—2)` the patch reinserts is there, but
  Sefaria also lost the verse's `2)`, which the patch leaves as
  `Ez. XXXVII, 1;` with its link to Ezekiel 37:1. The corrected text
  would still differ from print.
- **P000760, U01063**: `v. שֵׁירוּתָא II, III`. PR #187 set print's II
  on U01070's first form and III on U01071's from the maintainer's
  tick (P000893, P000894; hOCR 1569a · leaf 892: `fcfffl"Ptt£ HIE II,
  r~Mw, t")E3 I f. Cnti) beginning.`), so `II` names U01070, Sefaria's
  own link. This retarget (PR #178) predates that and now aims the
  `II` at the `III`.
- **P000308, A02823**: the one parenthesized form, leftmost on the head
  line, reads `(אפריקא)`, the alternate's letters (108b · leaf 131:
  `NI pr. n. pl. (Africa, ‘Agpexk) 1‏ (אפריקא)`), where the patch
  parenthesizes `אַפְרִיקִי`. Volume 1 is Tesseract and may misread one
  letter; HW-A02823's own scan check (2026-09-22) read it the patch's
  way. A scan read decides.

Held for a scan read, with print arguing against it (review ledger
L79): **P000221** (H00871) wraps two bare `Ib.` in links to Exodus 14, but print's
`Ib.` follows `Mekh. B’shall. s. 1`, so it reads as the Mekhilta.

### Held for a scan read (62)

The hOCR line is garbled (volume 1's Tesseract reads `I` as `1` or
`l` and mirrors Hebrew runs), missing, or cannot show the claim (an
absent citation; a numeral print sets on a bold Hebrew headword; a
`ch.` line that ruling 10-15, not print, picks; a cite whose vowels
decide between two entries). They are the checklist's
[Scan reads for the Sefaria appendix (2026-10-22)](../../../../../../docs/maintainer-checklist.md#scan-reads-for-the-sefaria-appendix-2026-10-22):
26 blocks, grouped by cross-reference family (17 blocks, 38 patches)
and by class (9 blocks, 24 patches), plus the 4 above.

### L71's other items

- **§1's three ך/ד headwords** (P00855, P00856, P00860) are appendix
  rows since PR #187 (`headword-ocr-glyph`, the maintainer's print read
  of 2026-10-22): L71's text was stale on them.
- **U00311 `ורע` → `ודע`** (report §18): no patch written. The hOCR
  reads the quotation as Latin glyphs, `to refute. Ab.II, 14 '31
  3il25ni25 na Wi that you may know` (1528a · leaf 851), so it cannot
  tell ר from ד. It stays informational until a scan read.

## All 133

`page · leaf` is the leaf of the quoted (or read) line; the line is
verbatim (backticks shown as `'`).

| patch | rid | class | disposition | page · leaf | hOCR, or why held |
|---|---|---|---|---|---|
| P000194 | A00675 | `reviewed-replace` | **read against the patch** | [26a · leaf 49](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$50/full/1400,/0/default.jpg) | `Onom.; Neub. Géogr. p. 18; 261) 1) Ulam (Porta) a place` |
| P000195 | A00913 | `reviewed-join` | scan read (checklist) | [35a · leaf 58](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$59/full/1400,/0/default.jpg) | `= אור +) .+ אִרְתָא‎ 9) coening, night. Pes. אור א *י2‎`: `9) coening`: the label and the gloss are misread |
| P000197 | A01194 | `reviewed-replace` | scan read (checklist) | [46b · leaf 69](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$70/full/1400,/0/default.jpg) | `אי זַה=אֶיזֶה WPS, SN m., 1% +. (b. h.‏ ,איזה`: the Hebrew run is mirrored; the `)` the patch inserts is not readable |
| P000198 | A01662 | `reviewed-join` | quoted: appendix row | [62a · leaf 85](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$86/full/1400,/0/default.jpg) | `IT m. (v. 928 2) affliction, calamity. B. Mets. 59”;‏ א` |
| P000200 | A03089 | `reviewed-replace` | quoted: appendix row | [119a · leaf 142](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$143/full/1400,/0/default.jpg) | `JS pr. n,m. (Gen, XIV, 1) Aryokh, 1) homiletic` |
| P000201 | A03104 | `reviewed-join` | quoted: appendix row | [120a · leaf 143](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$144/full/1400,/0/default.jpg) | `NOTIN אַריך.צ).5‎ I, 2) preparation, future (v.77),` |
| P000203 | A03277 | `reviewed-join` | scan read (checklist) | [127a · leaf 150](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$151/full/1400,/0/default.jpg) | `mole. Gen.‏ [,כשש ,גוש (groping, cmp.‏ (פאשש .+ ,א`: mirrored Hebrew run; no `2)` in the line |
| P000204 | B00534 | `reviewed-join` | quoted: appendix row | [158b · leaf 181](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$182/full/1400,/0/default.jpg) | `wns (v. uwn2) to tread; to kick, knock down 0 th` |
| P000206 | B00656 | `reviewed-join` | scan read (checklist) | [163b · leaf 186](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$187/full/1400,/0/default.jpg) | `5 11 Qerys Ar.s.v. בין‎ 2( 1. (v-RS SL) thrend,`: `2( 1.`: the label is mirrored |
| P000207 | B00991 | `reviewed-join` | quoted: held by `not traceable to source` | [178b · leaf 201](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$202/full/1400,/0/default.jpg) | `m. (v. preced. 2) fermenting wine,‏ בּסמָא בְּסִימָא` |
| P000210 | C00062 | `reviewed-replace` | quoted: appendix row | [205a · leaf 228](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$229/full/1400,/0/default.jpg) | `in ‘woe’; a. fr.—2) 9m Divine Majesty, the Lord.‏` |
| P000211 | C00244 | `reviewed-join` | quoted: held by `not traceable to source` | [214b · leaf 237](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$238/full/1400,/0/default.jpg) | `(relieve us); B. Bath. 91>.—Lev. RB. 1 (play on Abigdc / I Chr. IV, 4) הרבה גודרין וכ'‎ Israel had many fence` |
| P000213 | C01331 | `reviewed-replace` | quoted: held by `not traceable to source` | [268a · leaf 291](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$292/full/1400,/0/default.jpg) | `mill (cmp, 273 1),] 1) griva, a dry measure (סְאֶה=)‎ Ab.` |
| P000217 | D00541 | `reviewed-unref` | scan read (checklist) |  | no readable line: an absent citation: no hOCR line can show that print does not cite `Yoma 2a` |
| P000218 | G00655 | `reviewed-replace` | quoted: appendix row | [411a · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$435/full/1400,/0/default.jpg) | `71 (cmp. Byr. וק"‎ P. Ben. 1181) 1) fo 4 fling,` |
| P000219 | H00709 | `reviewed-join` | quoted: appendix row | [453a · leaf 476](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$477/full/1400,/0/default.jpg) | `m. ch. (v. preced. 2), being raised in luxury,‏ חימויָא` |
| P000220 | H00871 | `reviewed-join` | quoted: appendix row | [460a · leaf 483](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$484/full/1400,/0/default.jpg) | `human figures. Mekh. B’shall. 8. 1 (ref. to Pi-Hahiroth, / Ex. XIV, 2) מה ח' וכ'‎ what was the nature of these rocks?` |
| P000221 | H00871 | `reviewed-replace` | scan read (checklist) | [460a · leaf 483](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$484/full/1400,/0/default.jpg) | `—They were not slanting but abrupt ₪6. Ib, הח" מצד וכ'‎`: the `Ib.` is there, but a link target is not something print shows; and print's `Ib.` follows `Mekh. B’shall. s. 1`, so it may cite the Mekhilta, not `Exodus 14` |
| P000222 | I00137 | `reviewed-join` | quoted: appendix row | [522b · leaf 545](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$546/full/1400,/0/default.jpg) | `)00006( Taurus Amanus (v. Myx 11, 2) corresp. to` |
| P000223 | I00149 | `reviewed-join` | scan read (checklist) | [523a · leaf 546](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$547/full/1400,/0/default.jpg) | `.] beads used as charms, ornament worn \|`: `.] beads used as charms`: the label is missing |
| P000224 | I00753 | `reviewed-join` | quoted: appendix row | [552a · leaf 575](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$576/full/1400,/0/default.jpg) | `DDO ,רטרט==טרט)‎ emp. 2355; v. Ine 2) toplait straps,` |
| P000226 | J00301 | `reviewed-join` | quoted: held by `not mechanical for op` | [575a · leaf 598](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$599/full/1400,/0/default.jpg) | `OFT (b. .א‎ or; +. האס‎ 2) fo connect, be connected. —` |
| P000228 | K01188 | `reviewed-join` | quoted: appendix row | [669a · leaf 692](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$693/full/1400,/0/default.jpg) | `TH. (¥. בר‎ 2) fortified place, in gen. city, capital.` |
| P000230 | L00346 | `reviewed-join` | quoted: held by `not traceable to source` | [702b · leaf 25](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$26/full/1400,/0/default.jpg) | `^^tO* 't^^ f- P1- (v- ^^ 2) Palisades> whence` |
| P000232 | M01355 | `reviewed-unref` | scan read (checklist) |  | no readable line: an absent citation: no hOCR line can show that print does not cite `Rosh Hashanah 23b` |
| P000233 | M02309 | `reviewed-retag` | quoted: held by `not traceable to source` | [826a · leaf 149](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$150/full/1400,/0/default.jpg) | `burnt-offering &c— 2) to suck. Sabb. 54b Wnta^y. rV«.` |
| P000234 | N00327 | `reviewed-join` | quoted: held by `not traceable to source` | [885a · leaf 208](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$209/full/1400,/0/default.jpg) | `JTO, Tti III, S5T13 I m. (v.bs. ch. 2) loom, also Me` |
| P000236 | N00740 | `reviewed-join` | quoted: appendix row | [907b · leaf 230](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$231/full/1400,/0/default.jpg) | `"IS J pr. n. pi. (Assyr. Nipur, modern Niffer, v. Schr. / KAT.T2,p.572)^/ar.YomalOa(identifiedwithn3b3)^3Ms.` |
| P000238 | N01153 | `reviewed-replace` | quoted: appendix row | [930a · leaf 253](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$254/full/1400,/0/default.jpg) | `"lS\|^-, "^ pr. n . m. Nacai (Lucas, v. Neub. Stud. Bibl. I, / p. 61); 1) NIBd '3 N. the scribe (or teacher). Gen.E.s.79` |
| P000239 | N01381 | `reviewed-join` | quoted: appendix row | [944b · leaf 267](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$268/full/1400,/0/default.jpg) | `rrSHJD II (v. P. Sm. 2480; cmp. nro Pi. 2) to distrain,` |
| P000241 | O00120 | `reviewed-replace` | quoted: appendix row | [953b · leaf 276](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$277/full/1400,/0/default.jpg) | `^P, SJD I (b. h. n;t', Jtato; Saf. of ''W; cmp. Job / VTn, 11) 1) io swell, rise, grow, spread, increase, thrive.` |
| P000242 | O00408 | `reviewed-retag` | quoted: appendix row | [969a · leaf 292](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$293/full/1400,/0/default.jpg) | `the interpretations of the Rabbis, Deut.XVII, 11); a.fr. — / 2) to pass away, cease. Num. B. s. 9 (ref. to Am. VI, 7)` |
| P000243 | O00821 | `reviewed-join` | quoted: held by `not traceable to source` | [986b · leaf 309](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$310/full/1400,/0/default.jpg) | `^"Jpnp II, 'pp m. (v. 1ge II, a.P.Sm. p. 2722) rock- / lichen (fucus); red paint. Gitt. II, 3, expl. ib. 19a WllpG.` |
| P000245 | O01360 | `reviewed-join` | quoted: held by `not mechanical for op` | [1013b · leaf 336](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$337/full/1400,/0/default.jpg) | `PuTO f. (b. h.; v. *,Ep 2) [storage,] freight-ship. Taan.` |
| P000246 | O01397 | `reviewed-join` | quoted: held by `not traceable to source` | [1015a · leaf 338](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$339/full/1400,/0/default.jpg) | `3DSC m. (v. ^Ep 2) frame, bench, stool. Kidd. 70atJ` |
| P000248 | P00286 | `reviewed-join` | quoted: appendix row | [1053a · leaf 376](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$377/full/1400,/0/default.jpg) | `\|(>E I-/ m. (v. Xpair I, 2) reserved person, trickster.` |
| P000250 | P00331 | `reviewed-replace` | quoted: appendix row | [1056b · leaf 379](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$380/full/1400,/0/default.jpg) | `llb (insert la^ni). Erub. VIII, 9 '31 nptna 'S a pit (in / Ib. 88b '31 p^tna 'S (masc). Tosef. ib. IX (VI), 18. Mikv.` |
| P000251 | P00539 | `reviewed-join` | quoted: held by `not traceable to source` | [1068b · leaf 391](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$392/full/1400,/0/default.jpg) | `M~)!3n3? m. (V> -Hyps 2) separation, deed of partition` |
| P000253 | P00805 | `reviewed-join` | quoted: appendix row | [1083b · leaf 406](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$407/full/1400,/0/default.jpg) | `?VD"vP f. (preced., v. b^bs 2) reality. Gen. R. a. 23` |
| P000255 | P00859 | `reviewed-join` | quoted: appendix row | [1086b · leaf 409](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$410/full/1400,/0/default.jpg) | `ID^ I m. (v. las H, 2) urln-soaked dung. Gen. R. s. 39` |
| P000257 | P01088 | `reviewed-join` | quoted: held by `not mechanical for op` | [1101a · leaf 424](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$425/full/1400,/0/default.jpg) | `"" m. (b. h.; v. *Z2 2) tree, pole; u-ood. Esth. R. to` |
| P000259 | P01094 | `reviewed-join` | quoted: held by `not mechanical for op` | [1101a · leaf 424](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$425/full/1400,/0/default.jpg) | `32£3? m. (b. h.; £2> 2) trouble, toil; that which is` |
| P000261 | P01404 | `reviewed-replace` | quoted: appendix row | [1121a · leaf 444](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$445/full/1400,/0/default.jpg) | `0. Ex. VII, 28. Targ. Y. II ib.XXI, 18 ; a. fr.— 'r(i) VTaOBi` |
| P000262 | P01436 | `reviewed-join` | quoted: held by `not traceable to source` | [1123a · leaf 446](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$447/full/1400,/0/default.jpg) | `^£p^ m. (b.h.; v. S)fS 2) cloud; spray; mist; 'Arafel,` |
| P000264 | Q00890 | `reviewed-unref` | scan read (checklist) |  | no readable line: an absent citation: no hOCR line can show that print does not cite `Yoma 2a:3` |
| P000265 | Q01974 | `reviewed-replace` | quoted: appendix row | [1238a · leaf 561](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$562/full/1400,/0/default.jpg) | `a. fr. — 2) lawlessness, licentiousness, demoralization. Gen.` |
| P000266 | Q02145 | `reviewed-join` | quoted: appendix row | [1252a · leaf 575](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$576/full/1400,/0/default.jpg) | `nnS m. (fifiB Pi. 2) engraver. PI. B-fifiB. Y. Shek.` |
| P000268 | Q02162 | `reviewed-replace` | **read against the patch** | [1253b · leaf 576](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$577/full/1400,/0/default.jpg) | `surrection) opening is used (Ez. XXXVII, 12); a. fr. —` |
| P000269 | R00096 | `reviewed-join` | quoted: held by `not traceable to source` | [1261b · leaf 584](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$585/full/1400,/0/default.jpg) | `"v'llS m. (v. plTS 2) Sadducee, a member of the sect` |
| P000271 | S00490 | `reviewed-replace` | quoted: appendix row | [1337b · leaf 660](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$661/full/1400,/0/default.jpg) | `SD"lp II m. (rsp; cmp. Syr. XElp vectis, P.Sm. 3551) / 1) lever, carrying pole. Targ. Y. Num. IV, 12 (h.textoiE).` |
| P000272 | S01040 | `reviewed-join` | quoted: held by `not traceable to source` | [1363b · leaf 686](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$687/full/1400,/0/default.jpg) | `"O^p, 1nJnp, H^p, 'np m. (v. ',lp; cmp. y»p bnin / Gen. IV, 22) artist, esp. metal-worker, silversmith. Targ.` |
| P000274 | S01230 | `reviewed-replace` | quoted: appendix row | [1371a · leaf 694](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$695/full/1400,/0/default.jpg) | `law deals most leniently. Yoma VIII, 8 'p niTUS ?S for / attached); ib. 85b '31 'p *,n IPX these are the minor trans-` |
| P000275 | S02030 | `reviewed-retag` | quoted: held by `not traceable to source` | [1419a · leaf 742](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$743/full/1400,/0/default.jpg) | `a call (ib. XLIX, 1); a. fr. — 2) reading esp. from the` |
| P000276 | U00261 | `reviewed-join` | quoted: held by `not traceable to source` | [1524a · leaf 847](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$848/full/1400,/0/default.jpg) | `mii! c. (b. h.; cmp. Tito; v. Del. Assyr. Handw. s. v. / sid(d)u, p. 642) tract of land, field. Shehi. I, 1, a. fr. fTTto` |
| P000278 | U00398 | `reviewed-join` | quoted: appendix row | [1533b · leaf 856](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$857/full/1400,/0/default.jpg) | `iTl ill", iT" w f. (▼. n-r Pi. 2) levelling, overcoming` |
| P000280 | U00745 | `reviewed-retag` | quoted: appendix row | [1553a · leaf 876](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$877/full/1400,/0/default.jpg) | `Hif. naian 1 ) same, v. supra. — 2) (with 3) to fool, jest.` |
| P000281 | U00939 | `reviewed-retag` | quoted: appendix row | [1563a · leaf 886](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$887/full/1400,/0/default.jpg) | `R. introd. (R. Abbahu 1); a. e— 2) (cmp. nrfctfa) letting` |
| P000282 | U01556 | `reviewed-replace` | quoted: appendix row | [1603a · leaf 926](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$927/full/1400,/0/default.jpg) | `a. fr.— 2) any organ of the body resembling teeth, gland. —` |
| P000283 | U01674 | `reviewed-join` | quoted: appendix row | [1611b · leaf 934](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$935/full/1400,/0/default.jpg) | `1^123 (b. h.; cmp. Syr. ")&ra, P. Sm. 4012) to be smooth,` |
| P000286 | V00166 | `reviewed-join` | quoted: appendix row | [1651a · leaf 974](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$975/full/1400,/0/default.jpg) | `*mn , T,T\T. m. ch. (v. nrtfi 2) regret. Targ. Y. Ex.` |
| P000288 | V00704 | `reviewed-replace` | quoted: appendix row | [1679a · leaf 1002](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1003/full/1400,/0/default.jpg) | `a. fr. — 2) Absalom's sister. Meg. 25b '31 'ni "jia^fct Pitt93>a` |
| P000289 | V00765 | `reviewed-replace` | quoted: held by `not traceable to source` | [1683a · leaf 1006](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1007/full/1400,/0/default.jpg) | `B,. in trod. (R. Josh. 2); (Snh. 96b; Gitt57b nma); a. fr.— / 2) to spurt. Cant. R. to III, 6 nkTttfri T«rl bs rasx VO` |
| P000290 | B00098 | `headword-separator` | scan read (checklist) | [138b · leaf 161](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$162/full/1400,/0/default.jpg) | `single stalk, twig; also (b. h.) pole, =‏ (בדד) m.‏ בד`: the bold headword is not read; no `V` |
| P000291 | B00443 | `headword-separator` | scan read (checklist) | [153b · leaf 176](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$177/full/1400,/0/default.jpg) | `NON FS, I mn. (rst, +. NOM. Mand. Gr, § 119) slit.`: `NON FS, I mn.`: the headword and numeral are misread |
| P000292 | C00329 | `headword-separator` | scan read (checklist) | [219b · leaf 242](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$243/full/1400,/0/default.jpg) | `MINS, LT m. (v. preced.) castrate, eunuch; in gen.`: `MINS, LT m.`: the numeral is misread |
| P000293 | M00447 | `headword-separator` | scan read (checklist) |  | no readable line: no readable head line |
| P000294 | A02356 | `headword-gloss-comma` | scan read (checklist) |  | no readable line: no readable head line |
| P000295 | B00407 | `headword-gloss-comma` | scan read (checklist) |  | no readable line: no readable head line |
| P000296 | D00844 | `headword-gloss-comma` | scan read (checklist) |  | no readable line: no readable head line |
| P000297 | I00158 | `headword-two-forms` | scan read (checklist) | [523b · leaf 546](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$547/full/1400,/0/default.jpg) | `FIPS £. (PS) spinning, Babb, 74".‏ > ח`: `FIPS £. (PS) spinning`: the two forms are not read |
| P000298 | I00654 | `headword-two-forms` | scan read (checklist) |  | no readable line: no readable head line |
| P000299 | M02116 | `headword-two-forms` | scan read (checklist) | [816a · leaf 139](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$140/full/1400,/0/default.jpg) | `fcO^Q S j"^Q ch. same, belly, ivomb, bowels. Targ.`: `fcO^Q S j"^Q ch. same`: the two forms are not read |
| P000300 | A01161 | `headword-two-forms` | scan read (checklist) |  | no readable line: no readable head line |
| P000301 | M02868 | `headword-two-forms` | scan read (checklist) |  | no readable line: no readable head line |
| P000306 | B00097 | `headword-separator-anchor` | scan read (checklist) | [138b · leaf 161](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$162/full/1400,/0/default.jpg) | `\| stalks (v. preced. a. next w.); Yoma 71". 10. 35% bad is`: rests on B00098's `V` (P000290), which the hOCR does not show |
| P000308 | A02823 | `headword-paren-placement` | **read against the patch** | [108b · leaf 131](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$132/full/1400,/0/default.jpg) | `NI pr. n. pl. (Africa, ‘Agpexk) 1‏ (אפריקא)` |
| P000309 | A01175 | `headword-equals-variant` | scan read (checklist) |  | no readable line: no readable head line |
| P000310 | A01345 | `headword-equals-variant` | scan read (checklist) |  | no readable line: no readable head line |
| P000544 | A00882 | `cross-reference-target` | scan read (checklist) | [34a · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) | `v. .1אורירן‎`: `v. .1אורירן`: the numeral reads `1` |
| P000545 | M01329 | `cross-reference-target` | scan read (checklist) | [780b · leaf 103](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$104/full/1400,/0/default.jpg) | `iers. Gen.R. s.50, beg. Ar.(v. "p^ixl); Lev.R.s. 27 "p-llha`: `Ar.(v. "p^ixl)`: the numeral reads `l` |
| P000546 | H01410 | `cross-reference-target` | scan read (checklist) |  | no readable line: the cite's line is not found |
| P000547 | D00595 | `cross-reference-target` | scan read (checklist) |  | no readable line: the cite's line is not found |
| P000548 | Q00942 | `cross-reference-target` | quoted: appendix row | [1176b · leaf 499](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$500/full/1400,/0/default.jpg) | `XXII, 44 ed. Wil., v. xmibs I.` |
| P000549 | V00833 | `cross-reference-target` | quoted: appendix row | [1687a · leaf 1010](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1011/full/1400,/0/default.jpg) | `^•V'.>?"^ f- — KtWbp I, difference of opinion. Y.` |
| P000550 | S00961 | `cross-reference-target` | quoted: appendix row | [1360a · leaf 683](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$684/full/1400,/0/default.jpg) | `»;# p, v. K$p I.` |
| P000551 | S01262 | `cross-reference-target` | scan read (checklist) |  | no readable line: the cite's line is not found |
| P000552 | S01321 | `cross-reference-target` | scan read (checklist) | [1376a · leaf 699](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$700/full/1400,/0/default.jpg) | `Vrtap i.`: `Vrtap i.`: the numeral reads `i` |
| P000553 | S01360 | `cross-reference-target` | quoted: appendix row | [1378b · leaf 701](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$702/full/1400,/0/default.jpg) | `ttt2j*p, Targ. Ez. XXVII, 17, quot. in Rashi a. 1., mis- / reading for xii'-p, v. x^p I.` |
| P000590 | O00179 | `cross-reference-target` | scan read (checklist) | [956b · leaf 279](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$280/full/1400,/0/default.jpg) | `Sodom (usu. xrf3">al sa^). Sabb. 108b, v. 3J3-J I; a. e.`: the cite reads `I`, but print's `טְבַע I` may name I00076 `טָבַע I` (print sets that I) as well as I00077 its `ch.` line; the vowels that decide are not in the hOCR |
| P000591 | H00731 | `cross-reference-target` | scan read (checklist) | [454b · leaf 477](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$478/full/1400,/0/default.jpg) | `on, חול זר‎ 1 ch.`: the numeral reads `1`; and the target is a `ch.` line (ruling 10-15), which print cannot pick |
| P000595 | A00863 | `cross-reference-target` | scan read (checklist) |  | no readable line: the cite's line is not found |
| P000596 | A00887 | `cross-reference-target` | scan read (checklist) | [34a · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) | `NTN, 0 אררא‎ 1 h. a. ch.`: `1 h. a. ch.`: the numeral reads `1` |
| P000599 | A03020 | `cross-reference-target` | scan read (checklist) | [116a · leaf 139](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$140/full/1400,/0/default.jpg) | `TPN f. (b. h.; v. אהּרְלָא‎ 11( manger, crib.— Pl. רות‎`: `11(`: the numeral is misread and mirrored |
| P000604 | B00367 | `cross-reference-target` | scan read (checklist) | [150b · leaf 173](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$174/full/1400,/0/default.jpg) | `surdity; emp. “Hal. Keth. 68"; Hull. 88"; Shebu.`: `emp. “Hal.`: the cite is misread |
| P000605 | B00450 | `cross-reference-target` | scan read (checklist) |  | no readable line: the cite's line is not found |
| P000606 | B00453 | `cross-reference-target` | scan read (checklist) |  | no readable line: the cite's line is not found |
| P000609 | B01142 | `cross-reference-target` | scan read (checklist) | [187a · leaf 210](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$211/full/1400,/0/default.jpg) | `“ES, cmp. b-h. “SZ 8. TSI)‏ .ז) שרי .₪ זז קרא"`: the cite is misread |
| P000613 | C00343 | `cross-reference-target` | scan read (checklist) | [220a · leaf 243](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$244/full/1400,/0/default.jpg) | `AN castrate, vy. 81955 I.`: `vy. 81955 I.`: the numeral reads `I`, not `II` |
| P000614 | C00351 | `cross-reference-target` | scan read (checklist) | [220b · leaf 243](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$244/full/1400,/0/default.jpg) | `NI pr. n. pl. (a fictitious denom. of NTs 11)`: `NTs 11)`: the numeral reads `11` |
| P000615 | C01130 | `cross-reference-target` | scan read (checklist) | [259a · leaf 282](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$283/full/1400,/0/default.jpg) | `TMV, denom, of RPL. Cmp. form of letters, Sabb.`: `denom, of RPL.`: no numeral |
| P000647 | N00034 | `cross-reference-target` | scan read (checklist) | [867a · leaf 190](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$191/full/1400,/0/default.jpg) | `1&0, v.-..:i. k`: `1&0, v.-..:i. k`: no numeral |
| P000651 | N00416 | `cross-reference-target` | quoted: appendix row | [890a · leaf 213](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$214/full/1400,/0/default.jpg) | `n J as a verb, v. "PS I.` |
| P000653 | N00869 | `cross-reference-target` | quoted: appendix row | [913a · leaf 236](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$237/full/1400,/0/default.jpg) | `Yoma 64a '3 TO, v. Irt II.— '3 t5M (abbrev. 3"n) tf is really` |
| P000660 | O00125 | `cross-reference-target` | scan read (checklist) | [954b · leaf 277](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$278/full/1400,/0/default.jpg) | `&0 30 I, v. w 11, in.`: `v. w 11, in.`: the numerals read `11, in` |
| P000695 | Q00440 | `cross-reference-target` | scan read (checklist) | [1151a · leaf 474](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$475/full/1400,/0/default.jpg) | `nection with COS), v. nSS IIL— [For WE3 TtB, v. "TIB.]`: `v. nSS IIL—`: the numeral reads `IIL` |
| P000697 | Q00538 | `cross-reference-target` | scan read (checklist) | [1156b · leaf 479](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$480/full/1400,/0/default.jpg) | `btt> 11115) mast-ox. Sabb. XX, 4; Y. ib. 17c bot., v. *p)l`: `v. *p)l`: no numeral |
| P000701 | Q01373 | `cross-reference-target` | scan read (checklist) | [1201b · leaf 524](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$525/full/1400,/0/default.jpg) | `v. na^ia HI ; Y. Erub. VII, 24c bot. rYbi^B.`: `v. na^ia HI ;`: the numeral reads `HI` |
| P000708 | R00399 | `cross-reference-target` | scan read (checklist) | [1278a · leaf 601](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$602/full/1400,/0/default.jpg) | `Xr^S/iS I f. = h. fiSXHI, cold. Targ. Y. II Gen.`: `fiSXHI`: the numeral is fused into the word |
| P000728 | S01462 | `cross-reference-target` | quoted: appendix row | [1385a · leaf 708](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$709/full/1400,/0/default.jpg) | `OEjp m. (preced.; cmp. y*p I) [shrinking,] feeling` |
| P000731 | S01795 | `cross-reference-target` | quoted: appendix row | [1404b · leaf 727](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$728/full/1400,/0/default.jpg) | `SHIlZp m. (y^p; cmp. b&'WJ II) castrate, eunuch. —` |
| P000736 | T00013 | `cross-reference-target` | quoted: appendix row | [1436a · leaf 759](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$760/full/1400,/0/default.jpg) | `a. Pes., v. Babb. D. S. a. 1. note 90, v. "VSn I.] — 'l mn` |
| P000738 | T00245 | `cross-reference-target` | quoted: appendix row | [1452a · leaf 775](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$776/full/1400,/0/default.jpg) | `cmp. Gen. 1,28 ; cmp.1i? I], to plough. Targ. Ps. CXXIX, 3-1*1*1` |
| P000743 | T00814 | `cross-reference-target` | scan read (checklist) | [1483a · leaf 806](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$807/full/1400,/0/default.jpg) | `'13, v. "".".Oil; a. e.`: `v. "".".Oil`: no numeral |
| P000744 | T00895 | `cross-reference-target` | scan read (checklist) | [1487a · leaf 810](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$811/full/1400,/0/default.jpg) | `■tf] in, Kjjn, awn (awn n) m. (v. wd`: `(v. wd`: no numeral |
| P000747 | U00141 | `cross-reference-target` | quoted: appendix row | [1515a · leaf 838](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$839/full/1400,/0/default.jpg) | `■ ^^w m. (PBr <o (fra^ along, cmp. b.h. bBJB; cmp. / isiobo III) snail without the shell. Sabb. 77b, v. rwS;` |
| P000749 | U00383 | `cross-reference-target` | quoted: appendix row | [1532a · leaf 855](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$856/full/1400,/0/default.jpg) | `ni3Ti3, Y. Kidd. II, 62d 1CWB ba •«, v. rT»^ III.` |
| P000756 | U00888 | `cross-reference-target` | scan read (checklist) | [1560b · leaf 883](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$884/full/1400,/0/default.jpg) | `nfispeS f., sta^ m., (ma^ h. form) =h. r*f$ m,`: `=h. r*f$ m,`: no numeral |
| P000757 | U00888 | `cross-reference-target` | scan read (checklist) |  | no readable line: the cite's line is not found |
| P000760 | U01063 | `cross-reference-target` | **read against the patch** | [1569a · leaf 892](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$893/full/1400,/0/default.jpg) | `fcfffl"Ptt£ HIE II, r~Mw, t")E3 I f. Cnti) beginning.` |
| P000764 | U01400 | `cross-reference-target` | quoted: appendix row | [1590a · leaf 913](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$914/full/1400,/0/default.jpg) | `5IlJ5u III (v. \K&$ III) to relax, loosen the botvels.` |
| P000791 | A00864 | `cross-reference-target` | scan read (checklist) |  | no readable line: the cite's line is not found; and the target is a `ch.` line (ruling 10-15), which print cannot pick |
| P000792 | B01157 | `cross-reference-target` | scan read (checklist) | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) | `NUTS I owteide, forest &e., v. “31 ch.`: `v. “31 ch.`: no numeral; and the target is a `ch.` line (ruling 10-15) |
| P000793 | B01160 | `cross-reference-target` | scan read (checklist) | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) | `- : sem. (¥. “Sl ch.) 1) external,`: `(¥. “Sl ch.)`: no numeral; and the target is a `ch.` line (ruling 10-15) |
| P000794 | B01215 | `cross-reference-target` | scan read (checklist) | [191b · leaf 214](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$215/full/1400,/0/default.jpg) | `MENT 4 טר‎ ch) outside, rejedied ; cmp. מרייותון‎`: `טר ch)`: no numeral; and the target is a `ch.` line (ruling 10-15) |
| P000795 | B01237 | `cross-reference-target` | scan read (checklist) | [192b · leaf 215](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$216/full/1400,/0/default.jpg) | `Is. XL, 20.—*4) (v. "2 1 ch,, a. MNI2; cmp. Ot Pi. 2) to‏`: `(v. "2 1 ch,,`: the numeral reads `1`; and the target is a `ch.` line (ruling 10-15) |
| P000796 | U02087 | `cross-reference-target` | scan read (checklist) | [1637a · leaf 960](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$961/full/1400,/0/default.jpg) | `-1--2, v. -a I ch. Bekh. 50a '"iff! XT17 b*l deduct one Zuz`: the cite reads `v. -a I ch.`, but the target is a `ch.` line (ruling 10-15), which print cannot pick between B01152 and B01153 |
| P000797 | B00335 | `cross-reference-target` | scan read (checklist) |  | no readable line: the cite's line (language_reference) is not found |
| P000800 | M01517 | `cross-reference-target` | quoted: appendix row | [788a · leaf 111](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$112/full/1400,/0/default.jpg) | `m. (b. h. ; yfc I) lodging. Snh. 95b TTSb . . . p*f*` |
| P000801 | M02939 | `cross-reference-target` | quoted: appendix row | [857a · leaf 180](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$181/full/1400,/0/default.jpg) | `nj^jD I m. (b.h.; nsd I) lieutenant, viceroy. Midr.` |
| P000803 | S00286 | `cross-reference-target` | quoted: appendix row | [1326a · leaf 649](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$650/full/1400,/0/default.jpg) | `"\2rlp (b. h. ; cmp. "1p I) [to shrink,] to feel aversion,` |
| P000804 | S00534 | `cross-reference-target` | scan read (checklist) | [1339b · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) | `7"1p I m- (b. h.; yip or "ppl) 1) thorn. R. Hash. 17a`: `(b. h.; yip or "ppl)`: the numeral reads `l` |
| P000807 | H00355 | `cross-reference-target` | scan read (checklist) |  | no readable line: the cite's line (language_reference) is not found |
| P000808 | H00733 | `cross-reference-target` | scan read (checklist) |  | no readable line: the cite's line (language_reference) is not found |
