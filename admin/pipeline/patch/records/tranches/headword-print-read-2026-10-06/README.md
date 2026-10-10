# Headword print reads of 2026-10-06

The maintainer read the 1903 scan (Internet Archive, University of
Toronto copy: `dictionaryoftarg01jastuoft`, `dictionaryoftarg02jastuoft`)
against the 96 answer blocks of
[`docs/headword-worklist.md`](../../../../../../docs/headword-worklist.md)
and ticked them on 2026-10-06; the ticked worklist is the one committed
at `ed8261aaa` (PR #154). This directory records the patches those
answers decided. Rows whose answer was "nothing to fix" are on the
reviewed-kept list (`admin/pipeline/report/records/reviewed-kept.jsonl`,
ruling `10-06 reviewed kept`) and are not here.

## Where the patches are

**57 patches on 49 entries, P000311–P000367, in
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl), with one
`repaired` record per rid in
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl).** That
is how #139 recorded P000309 and P000310, and it is the only place the
loader reads a person's patches: `loadReviewedCorpus` stamps them
`author: 'human'` and applies them first. A `patches.jsonl` or
`manifest.jsonl` in this directory would be read as an agent sweep
tranche (`TRANCHES` in `admin/pipeline/patch/apply.ts`), so this
directory holds the README only. P000311–P000358 (48 on 40 entries)
came in PR #155; P000359–P000367, the nine OCR spellings on linked
headwords, followed once ruling `10-09 link key` let a spelling
correction keep its links (below). None of the 49 rids had a patch in
any tranche or in `reviewed/` before; four carry agent `clean` or `needs_*`
records with no patch (A00311, A00889, A01319, B00935), which nothing
here supersedes: reviewed patches sit outside Ruling C's one record
per rid.

Every patch's `rationale` quotes the answer (its ticked box and the
maintainer's note, verbatim), names the worklist row, and carries the
hOCR line and the scan leaf. `prompt_version` is
`headword-print-read-2026-10-06`, and every `expected_before` is the
composed entry as the import meets it (after both transform phases),
pinned to snapshot `sha256:75bbc5ee…`.

## What kind of change

| Kind | Patches | Entries | What the patch does |
|---|---|---|---|
| Pile B: a numeral Sefaria dropped | 10 | 10 | `reform` sets `homographs` on `headwords[0]` and a `display` that shows it |
| A numeral print sets beside a sibling | 13 + 8 | 13 | the same; on 8 of them Sefaria had moved the numeral into the head of the first definition, and a companion `delete` or `replace` takes it out of the gloss so the reader sees it once (U01006, U01008, U01138, U01570, U01634, V00809, V00254, U02097) |
| Implied I (ruling 10-06) | 14 | 14 | `reform` sets `homograph: 1, implied: true` on the form X10 names; `display` is unchanged |
| OCR glyph or vowel | 3 + 9 | 12 | `reform` rewrites one form's text; the 9 (P000359–P000367) are on headwords live links name |

**The numerals ride beside the line, never in its text** (ruling
`10-09 reform homographs`). When they were written, the patched
`headword` was also the string internal links resolved by: 18 of the 21 primaries that take a printed numeral
here are named by live links (58 in all), and 12 of the 13 that take
an implied I (42). Writing ` I` into the string would dangle every one
of them (gate 6). (Since ruling `10-09 link key` links resolve by the
line before patches, but a printed numeral belongs beside the forms in
any case.) So `forms` repeat the line as it stands, and the
numeral goes in `homographs`. The 8 gloss fixes remove only the
numeral and the space before it (and nothing else), which the
`homograph-roman-stranded-in-definition` detector confirms: 22 rows →
14.

**A spelling correction keeps its links** (ruling `10-09 link key`).
Internal links resolve by each rid's headword line as the transform
phases leave it, before any patch, so the nine spelling fixes on
linked headwords (P000359–P000367) move `headwords[0]` and the URL
name while the 29 links that name Sefaria's spelling keep resolving to
the same rids. Two are glyph corrections under HW-ocr-dalet (M00724
vav → zayin, J00737 vav → yod); seven are a vowel or mark.

**No mark was typed.** Each of the nine linked-headword corrections
(P000359–P000367) takes its word from the stored bytes of its sequence
neighbour, and the generator checked that the two differ by exactly
the one code point the maintainer read.

The same holds for the three earlier corrections (P000356–P000358).
A01319 and M02739's alternate take their whole word from the stored bytes of their sequence neighbour (A01320
`אִימָּא`, M02740 `מַרְעִיתָא`), and the generator checked that each
differs from the stored form by exactly the mark the maintainer read
(a hiriq added; a tsere read as hiriq). D00616's two maqafs become
yods, checked against the spelling the maintainer typed, `דימוניקי`;
the stored form is unpointed and stays so.

## What the answers decided that is not here

- **U00488 and U00489.** U00488's I is in `language_reference`, which
  no op edits, and U00489's join makes a second composed `שׁוּף` (the
  headword map refuses duplicates) and dangles the 13 links that name
  `ש`. Review ledger L50.
- **V00522**: the I and the alternate's closing `)` are in the gloss,
  and the opening `(` is in no source byte: where print sets it is a
  round-2 question in the worklist.
- **J00713** (`712 alternate`) and **U02098** (the I on U02097's
  alternate): the stored numbering is what print sets once U02097 is
  patched, so both went to the reviewed-kept list. So did **P01246 and
  P01247**, whose one answer ("P01247 is right as stored, and this
  family's gap is Jastrow's") is a "nothing to fix" the first seeding
  of that list missed.
- **14 answers and two notes that need another look** are round 2 of the worklist.

## Every patch

| patches | rid | kind | change | answer (worklist row) | evidence |
|---|---|---|---|---|---|
| P000311 | U00378 | pile B numeral | `headwords[0]` takes I; display `{0} I, {1}` | confirmed: print shows that numeral beside it (U00378) | `"3TJ3 I, T2"i w*E w pr.n.pl. Shot-Mishot, Samosata,`; family check U00379: `ETiCj II m. (b.h.; MRS I) rod, scourge.`; [1531b · leaf 854](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$855/full/1400,/0/default.jpg) |
| P000312 | U00524 | pile B numeral | `headwords[0]` takes I; display `{0} I, {1}` | confirmed: print shows that numeral beside it (U00524) | `Xj^lEJ I, nj5!HDf.=h.pralI, desire, pleasure, satis-`; family check U00525: `kSp'liL1 II m. = h. pl'tf III, market,`; [1541a · leaf 864](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$865/full/1400,/0/default.jpg) |
| P000313 | U00627 | pile B numeral | `headwords[0]` takes I; display `{0} I, {1}` | confirmed: print shows that numeral beside it (U00627) | `Tjrrcj I m., rnlni^ f. (b.h.; TjiB H)`; family check U00628: `i IMUj II m. (irns I) hair-pinchers; (oth.`; [1546a · leaf 869](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$870/full/1400,/0/default.jpg) |
| P000314 | U00820 | pile B numeral | `headwords[0]` takes I; display `{0} I, {1}` | confirmed: print shows that numeral beside it (U00820) | `SS^tT I, ST£J m. (cmp. T>, a. W$ty`; family check U00821: `S^nD II m. (v. next w.) chest, box.`; [1558a · leaf 881](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$882/full/1400,/0/default.jpg) |
| P000315 | U01348 | pile B numeral | `headwords[0]` takes I; display `{0} I, {1}` | confirmed: print shows that numeral beside it (U01348) | `Dv — I, D**«T (b. h.) Jo be`; family check U01350: `«- II m. (b. h.: preced.) whole, complete.`; [1585b · leaf 908](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$909/full/1400,/0/default.jpg) |
| P000316 | U01772 | pile B numeral | `headwords[0]` takes I; display `{0} I, {1}` | confirmed: print shows that numeral beside it (U01772) | `2DID I, * £uJ ch. same, to fall`; family check U01774: `bSDCJ II ch. same, lowly. Targ. Prov. XVI,`; [1617b · leaf 940](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$941/full/1400,/0/default.jpg) |
| P000317 | U02021 | pile B numeral | `headwords[0]` takes I; display `{0} I, {1}` | confirmed: print shows that numeral beside it (U02021) | `pTip I, p"1"]^? ch.same. Targ.Lam.II,15, sq. Targ.`; family check U02022: `p"W 11 = re, to glide, slide. Nidd.3b`; [1634a · leaf 957](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$958/full/1400,/0/default.jpg) |
| P000318 | V00743 | pile B numeral | `headwords[0]` takes I; display `{0} I, {1}` | confirmed: print shows that numeral beside it (V00743) | `V>*. I' ^V*. ch- 8ame' ^ to rePeat,`; family check V00744: `"071 II (cmp. *\\|3ia) to be pointed, sharp.`; [1681b · leaf 1004](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1005/full/1400,/0/default.jpg) |
| P000319 | V00844 | pile B numeral | `headwords[0]` takes I; display `{0} I, {1}` | confirmed: print shows that numeral beside it (V00844) | `DDri I, JD^ri ch. same, to seize, catch.`; family check V00845: `OSDri II (sec. r. of b^E) to break;`; [1688b · leaf 1011](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1012/full/1400,/0/default.jpg) |
| P000320 | U01268 | pile B numeral | `headwords[0]` takes II; display `{0} II ({1})` | confirmed: print shows that numeral beside it (U01268) | `nb£J II (rnbtS) m. (nVo) [stripped of its`; family check U01267: `H!*up I m. (preced.) hide, fresh skin. Makhsh.`; [1580b · leaf 903](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$904/full/1400,/0/default.jpg) |
| P000321 | C00609 | printed numeral | `headwords[0]` takes I; display `{0} I, {1}` | yes, print sets I beside C00609 — "add to issue" (C00610) | not found in the hOCR; [234a · leaf 257](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$258/full/1400,/0/default.jpg) |
| P000322 | U00156 | printed numeral | `headwords[0]` takes I; display `{0} I, {1}, {2}, {3}, {4}, {5}, {6}` | yes, print sets I beside U00156 (U00158) | `?2ti i, Krtej f, asntf, rratf, '£ ,`; [1515b · leaf 838](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$839/full/1400,/0/default.jpg) |
| P000323 | U00682 | printed numeral | `headwords[0]` takes I; display `{0} I, {1}, {2}` | yes, print sets I beside U00682 (U00683) | `t : — » t:— - -• i`; [1549b · leaf 872](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$873/full/1400,/0/default.jpg) |
| P000324 | U00911 | printed numeral | `headwords[0]` takes II; display `{0} II, {1} I` | yes, print sets II beside U00911 (U00910) | `fcn^ti IT, rTT^j I f. fiitt; b. h.`; [1562a · leaf 885](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$886/full/1400,/0/default.jpg) |
| P000325 | U01035 | printed numeral | `headwords[1]` takes I; display `{0}, {1} I, {2}, {3}` | yes, print sets I beside U01035 (U01036) | `1 '1 «, • J. - 1 Nk`; [1567b · leaf 890](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$891/full/1400,/0/default.jpg) |
| P000326, P000327 | U01006 | printed numeral | `headwords[0]` takes I; display `{0} I`; numeral out of the gloss head | yes, print sets I beside U01006; a different numeral or mark is there (write it in the note) — "1008 is III" (U01007) | `T • T •`; [1565b · leaf 888](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$889/full/1400,/0/default.jpg) |
| P000328, P000329 | U01008 | printed numeral | `headwords[0]` takes III; display `{0} III`; numeral out of the gloss head | yes, print sets I beside U01006; a different numeral or mark is there (write it in the note) — "1008 is III" (U01007) | not found in the hOCR; [1566a · leaf 889](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$890/full/1400,/0/default.jpg) |
| P000330, P000331 | U01138 | printed numeral | `headwords[0]` takes I; display `{0} I`; numeral out of the gloss head | yes, print sets I beside U01138 (U01139) | `Pa. ndra same. Y. Erub. I, 18d top`; [1572a · leaf 895](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$896/full/1400,/0/default.jpg) |
| P000332, P000333 | U01570 | printed numeral | `headwords[0]` takes I; display `{0} I`; numeral out of the gloss head | yes, print sets I beside U01570 (U01571) | not found in the hOCR; [1604b · leaf 927](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$928/full/1400,/0/default.jpg) |
| P000334, P000335 | U01634 | printed numeral | `headwords[0]` takes I; display `{0} I`; numeral out of the gloss head | yes, print sets I beside U01634 (U01635) | not found in the hOCR; [1609b · leaf 932](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$933/full/1400,/0/default.jpg) |
| P000336, P000337 | V00809 | printed numeral | `headwords[0]` takes II; display `{0} II`; numeral out of the gloss head | yes, print sets II beside V00809 (V00808) | not found in the hOCR; [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |
| P000338, P000339 | V00254 | numeral in gloss | `headwords[0]` takes I; display `{0} I`; numeral out of the gloss head | yes, print sets I beside V00254 — "looks like the I ended up in gloss" (V00255) | not found in the hOCR; [1655a · leaf 978](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$979/full/1400,/0/default.jpg) |
| P000340, P000341 | U02097 | numeral in gloss | `headwords[1]` takes I; display `{0}, {1} I`; numeral out of the gloss head | a different numeral or mark is there (write it in the note) — "The I sits on the alt of 2097 (side note, looks like it got misplaced into gloss)" (U02098) | not found in the hOCR; [1637b · leaf 960](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$961/full/1400,/0/default.jpg) |
| P000342 | A00311 | implied I | `headwords[0]` takes I (implied) | no numeral beside it — "Legit missing, lets put ones like this in a differnt textual issues research issue." (A00312) | not found in the hOCR; [13a · leaf 36](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$37/full/1400,/0/default.jpg) |
| P000343 | A00889 | implied I | `headwords[0]` takes I (implied) | no numeral beside it — "add to textual research issue" (A00890) | `TTS, היאן “AN m: same; 1) the Law.`; [34b · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| P000344 | A02041 | implied I | `headwords[0]` takes I (implied) | no numeral beside it — "add to resarch issue" (A02042) | `TITON £.(o.t.; v.preced.) 1) faith, trust. B.Bath. 45°;`; [77b · leaf 100](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$101/full/1400,/0/default.jpg) |
| P000345 | B00537 | implied I | `headwords[4]` takes I (implied) | no numeral beside it — "add to issue" (B00538) | `NUD, ND, TAB, ביוח (AND) + ae`; [158b · leaf 181](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$182/full/1400,/0/default.jpg) |
| P000346 | B00935 | implied I | `headwords[0]` takes I (implied) | no numeral beside it — "add to research issue" (B00936) | `אר בכ m. h.a. ch. ("22) builder, mason.`; [176b · leaf 199](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$200/full/1400,/0/default.jpg) |
| P000347 | C00176 | implied I | `headwords[0]` takes I (implied) | no numeral beside it — "add to issue" (C00177) | `בדודית .+ (dimin. of 393) small troop. Pl.`; [210b · leaf 233](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$234/full/1400,/0/default.jpg) |
| P000348 | D00442 | implied I | `headwords[0]` takes I (implied) | no numeral beside any of them — "add to issue" (D00443) | `ד" (hs. my, cmp. ;73 קפס to bh.`; [293b · leaf 316](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$317/full/1400,/0/default.jpg) |
| P000349 | H00432 | implied I | `headwords[0]` takes I (implied) | no numeral beside it — "add to issue" (H00433) | `חוצה .£ (b. hb.) חוץ-=(1 ;11 (followed by`; [438a · leaf 461](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$462/full/1400,/0/default.jpg) |
| P000350 | H01290 | implied I | `headwords[0]` takes I (implied) | no numeral beside it (H01291) | not found in the hOCR; [483a · leaf 506](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$507/full/1400,/0/default.jpg) |
| P000351 | J00112 | implied I | `headwords[0]` takes I (implied) | no numeral beside it — "add to issue" (J00113) | `FT" (v. bh.) Yah, abbreviation of the Tetragrammaton.`; [565b · leaf 588](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$589/full/1400,/0/default.jpg) |
| P000352 | O00994 | implied I | `headwords[0]` takes I (implied) | no numeral beside it — "add to issue" (O00995) | `J^t^p^D f. (Pales of pbp, by false etymology`; [995a · leaf 318](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$319/full/1400,/0/default.jpg) |
| P000353 | Q00964 | implied I | `headwords[0]` takes I (implied) | no numeral beside it — "add to issue" (Q00965) | `ffsTUIx1!;, 3 >if ch.same, l)=ii}\ti?separation (of races).`; [1177a · leaf 500](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$501/full/1400,/0/default.jpg) |
| P000354 | Q01398 | implied I | `headwords[0]` takes I (implied) | no numeral beside it — "add to issue" (Q01399) | `SSD (tradit. pronunc. SBE) pr. n. m. Pappa`; [1203b · leaf 526](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$527/full/1400,/0/default.jpg) |
| P000355 | S00336 | implied I | `headwords[0]` takes I (implied) | no numeral beside it — "add to issue" (S00337) | `fcVylp, lp m. ("hp II) parched grain; flour`; [1328a · leaf 651](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$652/full/1400,/0/default.jpg) |
| P000356 | D00616 | OCR glyph / vowel | `דימונ־ק־` → `דימוניקי` | print has something else (say what you see in the note) — "ocr error, the maqefs are actually yods - דימוניקי" (D00616) | `“OI, +. יניק`; [300a · leaf 323](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$324/full/1400,/0/default.jpg) |
| P000357 | A01319 | missing mark | `אימָּא I` → `אִימָּא I` | print has the mark: the stored `אימָּא` is missing it — "ocr error" (A01320) | `אמא 1 distaff, +. max 1.`; [50a · leaf 73](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$74/full/1400,/0/default.jpg) |
| P000358 | M02739 | OCR glyph / vowel | `מַרְעֵיתָא I` → `מַרְעִיתָא I` | no, `מַרְעֵיתָא` is wrong in print terms (say what you see in the note) — "both are chirik, ocr error" (M02740) | `rP^"]D IT, Sn"^l2 If. = xnria, evil &c.`; [845b · leaf 168](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$169/full/1400,/0/default.jpg) |
| P000359 | M00724 | OCR glyph | `מַוֶּה I` → `מַזֶּה I` (the bytes of M00725) | there is a fix (say what print shows in the note) — "as you thought, ocr error correct letter is zayin" (M00725) | not found in the hOCR; [753b · leaf 76](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$77/full/1400,/0/default.jpg) |
| P000360 | J00737 | OCR glyph | `יַתִּור I` → `יַתִּיר I` (the bytes of J00738) | no box ticked — "737 contains an ocr error the correct spelling for the primary headword is yod not a vav" (J00738) | `TENT, NYE m., ירא RETA יתיר' +`; [604a · leaf 627](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$628/full/1400,/0/default.jpg) |
| P000361 | A01964 | OCR vowel / mark | `אְמָא I` → `אֲמָא I` (the bytes of A01965) | no, `אְמָא` is wrong in print terms (say what you see in the note) — "both are patach sh'va. ocr error" (A01965) | `אמא 1 NON +. pox. Targ. 0. 604,111,`; [74a · leaf 97](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$98/full/1400,/0/default.jpg) |
| P000362 | D00501 | OCR vowel / mark | `דִּיוֹ II` → `דְּיוֹ II` (the bytes of D00500) | no, `דִּיוֹ` is wrong (say what you see in the note) — "both have sh'va, ocr error" (D00501) | `דייר 11 (ét-) two, double, a Greek prefix,`; [296a · leaf 319](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$320/full/1400,/0/default.jpg) |
| P000363 | H01579 | OCR vowel / mark | `חָרֵב II` → `חָרִב II` (the bytes of H01577) | no, `חָרֵב` is wrong (say what you see in the note) — "both are chirik, ocr error" (H01579) | `חרב 11 ,ו nn, an f. (b. h.;`; [498a · leaf 521](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$522/full/1400,/0/default.jpg) |
| P000364 | A01310 | OCR vowel / mark | `אִילפָא I` → `אִילְפָא I` (the bytes of A01311) | print has the mark: the stored `אִילפָא` is missing it — "mark this as an ocr error for the upstream correction report" (A01311) | `NONI, NDON +. ,אלף) FD"; Assyr. élippu) ship,`; [50a · leaf 73](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$74/full/1400,/0/default.jpg) |
| P000365 | C00649 | OCR vowel / mark | `גִּיהא I` → `גִּיהָא I` (the bytes of C00650) | print has the mark: the stored `גִּיהא` is missing it — "ocr error" (C00650) | not found in the hOCR; [235b · leaf 258](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$259/full/1400,/0/default.jpg) |
| P000366 | M02601 | OCR vowel / mark | `מרוּצָה I` → `מְרוּצָה I` (the bytes of M02602) | print has the mark: the stored `מרוּצָה` is missing it — "upstream log" (M02602) | `M^ID I f. (b. h. ; y!Ti) running.`; [839a · leaf 162](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$163/full/1400,/0/default.jpg) |
| P000367 | P00218 | OCR vowel / mark | `עִוּזָּא I` → `עוּזָּא I` (the bytes of P00219) | something else (say what you see in the note) — "218 should not have the chirik either, upstream log" (P00219) | `Sll!? I, Sl> m. (cmp. preced.) name of`; [1049a · leaf 372](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$373/full/1400,/0/default.jpg) |
