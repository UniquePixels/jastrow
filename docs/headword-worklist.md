# Headword worklist: the primary rows before go-live

## Status

**Refreshed 2026-10-13.** Round 2, just below, is brought up to date
and waits for your ticks. Every fact in it was re-read on 2026-10-13
from the committed entries (`v2` at `ead4a4d75`) and from the headword
report, which a dry import regenerates byte-identical to the committed
one. All 16 questions are still open: no PR since #156 touched their
headwords, none is on the reviewed-kept list, and none is cleared by a
ruling without your print read. Each block now ends with a
recommendation, and the round opens with a summary table.

**2026-10-09.** Your 96 answers of 2026-10-06 are processed in
[PR #155](https://github.com/UniquePixels/jastrow/pull/155) and
[PR #156](https://github.com/UniquePixels/jastrow/pull/156): **57 reviewed
patches on 49 entries** (P000311–P000367), each with your answer, the
hOCR line and the scan leaf, listed in
[`records/tranches/headword-print-read-2026-10-06/`](../admin/pipeline/patch/records/tranches/headword-print-read-2026-10-06/README.md).
#155 wrote 48 of them; the nine OCR spellings on headwords that live
links name (P000359–P000367) followed in #156, once ruling `10-09 link
key` let links resolve by the spelling before patches (review ledger
L49), and each of their answer blocks below says so. The reviewed-kept
list holds 34 records (30 since #154; J00713, U02098, P01246 and P01247
added in #155). U00488 with U00489 (L50) is the one fix you answered
that is still not applied, because the pipeline cannot express it. The
14 answers and two notes that need another look are round 2, just
below; tick it the same way.

After the re-import the report reads X10 17 (12 primary), X8 76 (45),
X9 5 (0), X5 140 (113), reviewed-kept 34 (before #155: X10 50 (45), X8
83 (52), X9 15 (10), X5 141 (114), kept 30; after #155: X10 18 (13), X8
77 (46), X9 12 (7)). The 2026-10-13 dry import reads the same.

The piles further down are the list as you answered it, kept for the
record; regenerate it before reading its counts again.

## Round 2: needs another look

Tick ONE box per block. Add a note only where a box asks for one, and
skip anything you like. Each block's `Recommendation:` line is a
default you can accept by ticking the box it names.

How to read the blocks:

- The table is the family as the committed entries store it (`v2` at
  `ead4a4d75`), with the hOCR line of each row and its scan. The hOCR
  is verbatim apart from removed bidi marks. Volume 1 is Tesseract,
  which garbles Hebrew and reads a numeral as `IL`, `IT`, `11`, `111`
  or `]`; volume 2 is ABBYY, which reads numerals well. The scan column
  is the page index's page and leaf (`data/page-index/`); the link
  opens that leaf.
- "Shape now" is the row in `docs/reports/headword-issues.md`: X8 a
  numbering gap, X10 an implied-I candidate (the unnumbered form just
  before a II), X1 a form that starts with a mark.
- Jastrow often names a homograph with its numeral elsewhere in the
  dictionary (`v. חוּל I`). Where such a cross-reference shows which
  word he counts as I, the block quotes it with its rid. Sefaria's link
  for a reference is its own guess, and the block says so where it
  points elsewhere.
- The rulings the recommendations rest on: `10-05 homograph sequence`
  (numerals number the consonants within five entries, so a pair
  pointed apart can be one I, II), `10-06 implied I` (the unnumbered
  first homograph before a II takes an implied I, set by reviewed
  patch after a print read), `10-06 reviewed kept` (a "nothing to fix"
  goes to the kept list) and HW-roman (a numeral stays on the form
  print sets it on).
- Confidence: high where the print's own text (the hOCR line or a
  cross-reference) shows it and a ruling decides the outcome; medium
  where only one of the two does; low where neither does.
- Where a fact found on 2026-10-13 changed a block's question or
  options, the block says what changed. Your round-1 answer is quoted
  where it is the reason for asking again.

| rid | headword | shape now | question in five words | recommendation | confidence |
|---|---|---|---|---|---|
| A03217 | `אָרַע` II | X8 | does A03215 take I? | A03215 takes the implied I | high |
| B01159 | `בְּרָא` II | X8 | is B01158's `בְּרָא I` a form? | yes: store it as B01158's alternate | high |
| G00527 | `זְמַם` I | X8 | is G00529 bare in print? | yes: kept | high |
| H01101 | `חֵלֶף` II | X8 | H01100: tsere or hiriq? | tsere: `חֵלֶף I` | high |
| H01222 | `חֲמַר` III | X8 | ch. lines bare, then III? | yes: kept | high |
| I00081 | `טְבַע` II | X10 | which form takes the I? | I00077, implied | medium |
| U02013 | `שְׂרַף` II | X10 | a numeral beside U02012? | none: U02012 takes the implied I | medium |
| H00321 | `חוּל` II | X10 | which form takes the I? | H00319, implied | high |
| C00773 | `גִּיס` II | X10 | is C00772 the I? | yes: implied I | medium |
| E00114 | `הֲדָיָא` II | X10 | is E00113 the I? | yes: implied I | medium |
| T00376 | `רוּם` II | X10 | which form takes the I? | T00374, implied | medium |
| U01397 | `שִׁלְשֵׁל` II | X10 | where is U01396's I? | after the abbreviation, on the alternate | high |
| N00260 | `נְהִי` II | X8 | is there a `נְהִי` I? | no: kept | high |
| V00523 | `תַּכָּא` II | X10 | V00522's parenthesis: where exactly? | a comma, then the parenthesis | medium |
| J00321, J00327 | `ַיי`, `ַיְידָא` | X1 | a placeholder for the underline? | keep as stored | medium |
| S01780 | `קֵץ` (ch.) | X1, X3 (alternates) | a qamats under the tsade? | yes, `קִצָּא` | high |

E00008 (`הִא` III) asked why it was flagged and needs no answer: the
consonants `הא` carry I and II twice (E00005 `הָא` I and E00006 `הָא`
II; E00006's alternate `הֵא` I and E00007 `הֵא` II), so the sequence
rule sees each numeral given twice and cannot clear `הִא` III. The data is what print sets, and the row stays
on the reviewed-kept list. A03217 asked the same; its block says why.
U00489's mark question is not asked again: review ledger L46 records it
as moot once U00488 takes I, and both wait on L50.

### `אָרַע`: A03217 (`אָרַע` II)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A03215](https://jastrow.app/#rid:A03215) | `אָרַע` | `YIN (V3, v. (רעע to strike against. Nif.` | [124b · leaf 147](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$148/full/1400,/0/default.jpg) |
| [A03216](https://jastrow.app/#rid:A03216) | `אֲרַע I` | `JN I ch. (in Targ. Y.; in O.` | [124b · leaf 147](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$148/full/1400,/0/default.jpg) |
| [A03217](https://jastrow.app/#rid:A03217) | `אָרַע II` | `"JIN IT (35, cmp. 3, Hif. on, >` | [124b · leaf 147](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$148/full/1400,/0/default.jpg) |
| [A03218](https://jastrow.app/#rid:A03218) | `אֲרַע II` | `II (Targ. ¥., 0. טפט 257 qv), Pa. 27 ארק` | [125a · leaf 148](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$149/full/1400,/0/default.jpg) |

Shape now: X8 (`missing 1; 1 unnumbered: A03215=—; A03217=2`).

**Why it was flagged** (your note asked): the report keys a family on its exact spelling, and A03215 is spelled `אָרַע` like A03217, with no numeral. So it sees `אָרַע` II with no `אָרַע` I. You read A03216 `אֲרַע` I and A03217 `אָרַע` II as the numbered pair, and no numeral beside A03215.

Found 2026-10-13: A03218 `אֲרַע` II, the `ch.` line of A03217, which round 2's first version left out. So print sets two pairs: the Hebrew A03215 (bare) and A03217 II, and the Aramaic A03216 I and A03218 II. The dictionary calls A03215's word `אָרַע I` six times: A03223 `(אָרַע I) chance`, M00016 `(אָרַע I) event`, V00895 `Ber. IV, 2, v. אָרַע I` (Ber. IV, 2 is quoted in A03215), and M02308, P01342 and P01411, whose links Sefaria points at A03216.

**Question.** Is A03215 (`to strike against`, from `רעע`) the I of the Hebrew pair, or a word of its own outside the I, II run?

Changed 2026-10-13: the old "no" box asked you to write how print numbers A03215; A03218 and the cross-references give that answer two boxes to tick.

- **A03215**
  - [ ] the I of the pair, unnumbered in print: A03215 takes the implied I (name `אָרַע I`; nothing displayed)
  - [ ] the I of the pair, and print sets I beside it (name `אָרַע I`; the I displayed)
  - [ ] a word of its own outside the run; as stored: nothing to fix (the row goes to the reviewed-kept list)
  - [ ] can't tell from the scan
  - note: 

Recommendation: implied I (high): the hOCR line `YIN (V3, v. (רעע to strike against.` sets no numeral, you read none, and Jastrow's own cross-references call this word `אָרַע I`, so ruling 10-06 gives A03215 the implied I (their links are a separate question, as in L51).

### `בְּרָא`: B01159 (`בְּרָא` II, son)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [B01154](https://jastrow.app/#rid:B01154) | `בַּר II`, `בְּרָא` | `,זזבר בְּרַא m. ch. (b. h, "2 poetic;` | [188b · leaf 211](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$212/full/1400,/0/default.jpg) |
| [B01157](https://jastrow.app/#rid:B01157) | `בָּרָא I` | `NUTS I owteide, forest &e., v. “31 ch.` | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| [B01158](https://jastrow.app/#rid:B01158) | `בָּרָא II`; gloss opens `, בְּרָא I to create` | `NSIT, x31 ₪ create, +. ברי` | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| [B01159](https://jastrow.app/#rid:B01159) | `בְּרָא II` | `NW 11 son, +. בַר וו` | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| [B01237](https://jastrow.app/#rid:B01237) | `ברי`, `בְּרָא` | `:בל בְּרָא ch. same; 1) fo create. Targ.` | [192a · leaf 215](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$216/full/1400,/0/default.jpg) |

Shape now: X8 (`missing 1; 2 unnumbered: B01154/alt=—; B01159=2; B01237/alt=—`).

You read no numeral beside either alternate `בְּרָא` (B01154, of `בַּר` II; B01237, of `ברי`). Found 2026-10-13: B01158's stored gloss opens `, בְּרָא I to create, v. ברי.`, so its line reads `בָּרָא II, בְּרָא I to create, v. ברי`: the `בְּרָא I` is a second form of B01158's line that Sefaria cut into the gloss head, form and numeral both. It did the same to the numerals of U02097's alternate (P000340–P000341 moved that I back to it) and V00522's; here the form went too. The hOCR shows two forms and a comma before `create`. P00501 `Snh. 65ᵇ; 67ᵇ, v. בְּרָא I` names the same word (creating a calf). Round 2's first version read the gloss head as a cross-reference that no line holds.

**Question.** Is the `בְּרָא I` at the head of B01158's gloss a second form of B01158's line?

Changed 2026-10-13: the old "no: print numbers a `בְּרָא` I (say which entry)" box now names the entry.

- **B01158**
  - [ ] yes: store `בְּרָא` as B01158's second form with I and take it out of the gloss (HW-roman; B01158's name is unchanged)
  - [ ] no, it is a cross-reference: the gap is Jastrow's; as stored: nothing to fix (the row goes to the reviewed-kept list)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the stored gloss and the hOCR line `NSIT, x31 ₪ create` both set a second form beside `בָּרָא II` before the gloss `to create`, and HW-roman keeps its I on that form, as U02097's alternate already does.

### `זְמַם`: G00527 (missing II)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [G00526](https://jastrow.app/#rid:G00526) | `זָמַם I` | `BERIT (b.b.; emp, ,רטפ (רבב fo mumble; to meditate,` | [403a · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |
| [G00527](https://jastrow.app/#rid:G00527) | `זְמַם I` | `זמם ] onsme.` | [403a · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |
| [G00528](https://jastrow.app/#rid:G00528) | `זָמַם II` | `SET IL (emp. Ses) fo the wp, to` | [403a · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |
| [G00529](https://jastrow.app/#rid:G00529) | `זְמַם` | `os ch.-same, lo muscle. Targ. ¥. 11 Gen.` | [403b · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |
| [G00530](https://jastrow.app/#rid:G00530) | `זָמַם III` | `זָמם 111 to be filthy, +. oe.` | [403b · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |
| [G00531](https://jastrow.app/#rid:G00531) | `זְמַם III` | `"Cf 111, Ripe, over (emp, S50 fo be comfommdad` | [403b · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |
| [G00533](https://jastrow.app/#rid:G00533) | `זְמָם II` | `DST 11 m. (ost 1( נש (v. (וסזם` | [403b · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |
| [G00534](https://jastrow.app/#rid:G00534) | `זְמַם`, `זְמָמָא` | not found in the hOCR | [403b · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |

Shape now: X8 (`missing 2; 2 unnumbered: G00527=1; G00529=—; G00531=3; G00534=—`).

You read no numeral beside G00529 or G00534. Found 2026-10-13: G00526 `זָמַם` I and G00530 `זָמַם` III, which round 2's first version left out. Print runs the Hebrew verbs I, II, III (G00526, G00528, G00530), each followed by its `ch.` line: G00527 I, G00529 bare, G00531 III. The II the spelling `זְמַם` lacks is G00529, not G00528, so the old question (whether G00528 is the run's II) no longer fits. G00527's hOCR column now quotes its own line; the old quote was a line of G00526's `Hof.`. The page index puts G00527 and G00528 in 403a, where the hOCR has them at the top of the right-hand column; the leaf is the same.

**Question.** Does print leave G00529 `זְמַם` (`ch. same, to muzzle`) bare between the `ch.` lines I and III?

Changed 2026-10-13: the question names G00529, and the "no" box says what it would change.

- **G00527**
  - [ ] yes: the gap is Jastrow's own; as stored: nothing to fix (the row goes to the reviewed-kept list)
  - [ ] no, print sets II beside G00529 (name `זְמַם II`; the II displayed)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): you read no numeral beside G00529, its hOCR line `os ch.-same, lo muscle.` shows none where G00527's and G00531's show `]` and `111`, and no ruling supplies a II print leaves out.

### `חֵלֶף`: H01101 (`חֵלֶף` II)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00780](https://jastrow.app/#rid:H00780) | `חֵילֶף`, `חֵלֶף` | `non, non m. (חלף) a species of salt` | [456b · leaf 479](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$480/full/1400,/0/default.jpg) |
| [H01099](https://jastrow.app/#rid:H01099) | `חֲלַף I`, `חֲלֵיף` | `חלף 8 חליף ch. same, to pass by,` | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |
| [H01100](https://jastrow.app/#rid:H01100) | `חִלֶף I` | `חלף I m. (preced, wds.) 1) shoot. —` | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |
| [H01101](https://jastrow.app/#rid:H01101) | `חֵלֶף II` | `720 II m. (préced. wds.) reversion. Y. Sabb,` | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |

Shape now: X8 (`missing 1; 1 unnumbered: H00780/alt=—; H01101=2`).

You read no numeral beside H00780's alternate `חֵלֶף`, which is 321 entries back. The likelier I is H01100, stored `חִלֶף` I with a **hiriq** under ח, while H01101 has a **tsere**; both are glossed `(preced. wds.)`. Found 2026-10-13: the dictionary spells H01100's word with a tsere twice: H01057 `pl. חֲלִיפוֹת shoots, v. חֵלֶף I` and H01105 `חִלְפוֹת, חֲלָפוֹת, v. חֵלֶף I`. `shoots` is H01100's sense 1. Sefaria links both to H01101, since no `חֵלֶף I` is stored.

**Question.** How does print point H01100?

- **H01100**
  - [ ] `חֵלֶף` I (tsere, like H01101): the stored hiriq is a slip, and the name changes to `חֵלֶף I`
  - [ ] `חִלֶף` I (hiriq), as stored: one run pointed apart; as stored: nothing to fix (the row goes to the reviewed-kept list)
  - [ ] can't tell from the scan
  - note: 

Recommendation: tsere (high): the hOCR is unpointed (`חלף I m.`), but Jastrow's own two cross-references to this word, both for its `shoots`, spell it `חֵלֶף I` with a tsere, so the single hiriq reads as Sefaria's OCR slip.

### `חֲמַר`: H01222 (`חֲמַר` III; missing I, II)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H01218](https://jastrow.app/#rid:H01218) | `חָמַר I` | `חמר 1 (emp. “3 1) to join; to` | [479b · leaf 502](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$503/full/1400,/0/default.jpg) |
| [H01219](https://jastrow.app/#rid:H01219) | `חֲמַר` | `“WPT .ג same.` | [479b · leaf 502](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$503/full/1400,/0/default.jpg) |
| [H01220](https://jastrow.app/#rid:H01220) | `חָמַר II` | `זמר זז .0( h.) [to be hot.) 1)` | [479b · leaf 502](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$503/full/1400,/0/default.jpg) |
| [H01221](https://jastrow.app/#rid:H01221) | `חֲמַר` | `חמר ch. same, 1) to be hot, parched.` | [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |
| [H01222](https://jastrow.app/#rid:H01222) | `חֲמַר III`, `חַמְרָא I` | `“VAM ITT, זַחְמַרָא (preced.) wine (b.h. V2). Targ.` | [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |
| [H01224](https://jastrow.app/#rid:H01224) | `חַמָּר I` | `WAM I m. ch. (v. V2 11; emp.` | [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |

Shape now: X8 (`missing 1,2; 2 unnumbered: H01219=—; H01221=—; H01222=3`).

You read no numeral beside H01219 or H01221. This is pile D's shape: the Hebrew verbs `חָמַר` I and II (qamats) are numbered, the Aramaic `ch. same` lines between are not, and the noun `חֲמַר` III numbers on from them. The sequence rule stops at H01224 `חַמָּר` I, a second I within five entries. H01219's hOCR column now quotes its own headword line; the old quote was its `Pa.` line. Found 2026-10-13: Jastrow's cross-references count the two `ch.` lines as I and II without print numbering them: M00902 `(חֲמַר I) a pile of debris` (H01219's `to pile up`), H01190 `(חֲמַר II) strong leaven` and H01224 `v. חֲמַר II` (H01221's `to be hot`), H01227 `wine, v. חֲמַר III` (H01222). Four rows of this shape are already kept: I00618, M02850, S00061, U00710.

**Question.** Does print number the Hebrew verbs I and II, leave H01219 and H01221 bare, and set III on H01222?

- **H01222**
  - [ ] yes; as stored: nothing to fix (the row goes to the reviewed-kept list)
  - [ ] no (say what print numbers in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the hOCR sets no numeral on either `ch.` line (`“WPT .ג same.`, `חמר ch. same`) and `ITT` on H01222, the shape of the four kept rows, and no ruling supplies the I and II that only the cross-references name.

### `טְבַע`: I00081 (`טְבַע` II)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [I00076](https://jastrow.app/#rid:I00076) | `טָבַע I` | `YA I (v. וג emp. מֶבָל I) 1)` | [518b · leaf 541](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$542/full/1400,/0/default.jpg) |
| [I00077](https://jastrow.app/#rid:I00077) | `טְבַע` | `מבע ch. same. Targ. Y. Gen. IV, 8.—'Targ.` | [518b · leaf 541](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$542/full/1400,/0/default.jpg) |
| [I00078](https://jastrow.app/#rid:I00078) | `טָבַע II` | `yaa II [to round, shape, denom. 92%, fr. wh` | [518b · leaf 541](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$542/full/1400,/0/default.jpg) |
| [I00079](https://jastrow.app/#rid:I00079) | `טְבַע` | `FAS oh. same, fo assume shape, Targ. Prov, VIM,` | [519a · leaf 542](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$543/full/1400,/0/default.jpg) |
| [I00080](https://jastrow.app/#rid:I00080) | `טֶבַע` | `93S ₪. (v. 234 1) 1) 600%, medal, war פ' של tay` | [519a · leaf 542](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$543/full/1400,/0/default.jpg) |
| [I00081](https://jastrow.app/#rid:I00081) | `טְבַע II`, `טִבְעָא`, `טִיבְ׳ I` | `Sa I 3, “SS I ch, same, coin; Teb'a.` | [519a · leaf 542](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$543/full/1400,/0/default.jpg) |

Shape now: X10 (`I00080 טֶבַע stands just before the II`; `I00077=—; I00079=—; I00081=2`).

You read no numeral beside I00077 or I00079. I00081 `טְבַע` II is glossed `ch. same` as **I00080 `טֶבַע`** (segol, a noun), which the first list never asked about, and X10 names I00080 for the implied I. I00081's hOCR column now quotes its own headword line; the old quote was its third line. Found 2026-10-13: Jastrow calls I00077 (`ch. same` as `טָבַע I`, to sink) `טְבַע I` twice: I00121 `טוֹבְעָנָא m. (טְבַע I) flood` and O00179 `Sabb. 108ᵇ, v. טְבַע I` (the Lake of Sodom; Sefaria links it to I00076). I00077 is four entries before the II, inside the five-entry window of 10-05.

**Question.** Which form takes the implied I?

Changed 2026-10-13: the question asked only about I00080; the cross-references add I00077, so it now asks which form, as H00321's and T00376's do.

- **I00081**
  - [ ] I00077 `טְבַע` (`ch. same` as `טָבַע I`; name `טְבַע I`; nothing displayed)
  - [ ] I00080 `טֶבַע` (the noun, as X10 names; name `טֶבַע I`; nothing displayed)
  - [ ] print sets I beside I00080 (name `טֶבַע I`; the I displayed)
  - [ ] something else (say what in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: I00077 (medium): the hOCR shows no numeral on I00077, I00079 or I00080, and the only `טְבַע I` the dictionary names is I00077's `to sink`; ruling 10-06 gives that form the implied I.

### `שְׂרַף`: U02013 (`שְׂרַף` II)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U02008](https://jastrow.app/#rid:U02008) | `שָׂרָף I` | `I T t ^ ^b# h> ""--J ^` | [1633a · leaf 956](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$957/full/1400,/0/default.jpg) |
| [U02009](https://jastrow.app/#rid:U02009) | `שָׂרָף II` | `*pl2 II m. (b. h.) Seraph, an angel.— PI. B^ETto. Hag.` | [1633a · leaf 956](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$957/full/1400,/0/default.jpg) |
| [U02010](https://jastrow.app/#rid:U02010) | `שָׂרָף` | `*[^0 cb., pi. fcWnr same, v. N*E_-C.` | [1633a · leaf 956](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$957/full/1400,/0/default.jpg) |
| [U02011](https://jastrow.app/#rid:U02011) | `שָׂרָף III` | `^\|Tw III (b.h.) pr. n. m. Saroph. B. Bath.91b.` | [1633a · leaf 956](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$957/full/1400,/0/default.jpg) |
| [U02012](https://jastrow.app/#rid:U02012) | `שְׂרָף` | `m. (r-r I) acrid substance, esp. vegetable sap` | [1633a · leaf 956](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$957/full/1400,/0/default.jpg) |
| [U02013](https://jastrow.app/#rid:U02013) | `שְׂרַף II` | `l-*l I-I cb.same, esp.balsam. Targ. Y. Gen. XXXVII,` | [1633b · leaf 956](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$957/full/1400,/0/default.jpg) |

Shape now: X10 (`U02012 שְׂרָף stands just before the II`; `U02004=—; U02006=—; U02013=2`).

You read no numeral beside U02004 or U02006. U02013 `שְׂרַף` II is glossed `ch. same` as **U02012 `שְׂרָף`** (*acrid substance*), which the first list never asked about, and X10 names U02012 for the implied I. Found 2026-10-13: ABBYY, which reads U02009's II and U02011's III, sets nothing before U02012's `m.` (the Hebrew glyphs are lost). Unlike I00081, no cross-reference names a `שְׂרַף I` or `שְׂרָף I` for these words, and the `ch.` verbs U02004 and U02006 are nine and seven entries back, outside the five-entry window of 10-05.

**Question.** Does print set a numeral beside U02012 `שְׂרָף`?

- **U02012**
  - [ ] no numeral: U02012 takes the implied I (name `שְׂרָף I`; nothing displayed)
  - [ ] print sets I beside U02012
  - [ ] something else (say what in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: no numeral, implied I (medium): the hOCR shows none before U02012's `m. (שָׂרַף I) acrid substance`, U02013 is its `ch. same`, and it is the one unnumbered form of the spelling within the window ruling 10-06 reaches.

### `חוּל`: H00321 (`חוּל` II)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00319](https://jastrow.app/#rid:H00319) | `חוּל` | `חול (b. l.; emp. 55m) [to turn around,` | [432b · leaf 455](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$456/full/1400,/0/default.jpg) |
| [H00320](https://jastrow.app/#rid:H00320) | `חוּל` | `חול ch. same, 1) to dance. Part, >.` | [432b · leaf 455](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$456/full/1400,/0/default.jpg) |
| [H00321](https://jastrow.app/#rid:H00321) | `חוּל II` | `חול IL (v. mbm) to be smooth, quiet,` | [432b · leaf 455](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$456/full/1400,/0/default.jpg) |
| [H00322](https://jastrow.app/#rid:H00322) | `חוּל` | `חול ch, same; to be smooth, lax ;` | [432b · leaf 455](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$456/full/1400,/0/default.jpg) |

Shape now: X10 (`H00320 חוּל stands just before the II`; `H00319=—; H00320=—; H00321=2; H00322=—`).

You read no numeral beside H00319, H00320 or H00322. Ruling 10-06 (taken after your read) gives the unnumbered first homograph of a run an implied I. X10 names H00320, the form just before the II, but H00320 is the verb's `ch. same` line; the Hebrew verb is H00319. Found 2026-10-13: Jastrow names H00319 `חוּל I` three times: H00355 `חוֹלֵל m. (b. h.; חוּל I) dancer`, H00733 `חַיִיל … (b. h.; חוּל I) [surrounding, protection,] army`, and H00731 `חָיֵיל, v. חוּל I ch.`, where `חָיֵיל` is the participle H00320 gives (`Part. חָיֵיל`), so `חוּל I ch.` is H00320 and `חוּל I` is H00319. Sefaria links all three to H00323 `חוֹל` I (sand).

**Question.** Which form takes the implied I?

- **H00321**
  - [ ] H00319 `חוּל` (the Hebrew verb)
  - [ ] H00320 `חוּל` (its `ch. same` line, as X10 names)
  - [ ] neither: no implied I here; as stored: nothing to fix (the row goes to the reviewed-kept list)
  - note: 

Recommendation: H00319 (high): the hOCR sets no numeral on it, and Jastrow's own cross-references name the Hebrew verb `חוּל I` and H00320 its `ch.`, so ruling 10-06's implied I goes on H00319.

### `גִּיס`: C00773 (`גִּיס` II)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C00772](https://jastrow.app/#rid:C00772) | `גֵּיס` | `גוס m. (024; cmp. גנז a. ;כנס Syr. גסא divitiae P.` | [240a · leaf 263](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$264/full/1400,/0/default.jpg) |
| [C00773](https://jastrow.app/#rid:C00773) | `גִּיס II`, `גָּיֵיס` | `O NAIL, ברכ m, (Os U1) intimate, familiar.` | [240a · leaf 263](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$264/full/1400,/0/default.jpg) |
| [C00774](https://jastrow.app/#rid:C00774) | `גִּיס II` | `on IT m. (v. preced., emp. רסא 111(` | [240b · leaf 263](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$264/full/1400,/0/default.jpg) |

Shape now: X10 (`C00772 גֵּיס stands just before the II`; `C00773=2; C00774=2`).

You answered "the gap is Jastrow's own". Ruling 10-06, taken after your read, stores an implied I on the unnumbered first homograph of a run, and X10 names C00772 `גֵּיס` (tsere), just before the II. Found 2026-10-13: C00772's line sets nothing after `גוס m.`, and C00773's `NAIL` is likely Tesseract's `IL` for II (H00321's line reads `חול IL`). The cross-references do not settle which word Jastrow counts as I: C00707 `גָּיֵיס, v. גִּיס II` and C00710 name C00773 II through its alternate, while C00841 `(v. גִּיס I) familiar` and K00444 `opp. גיס, v. גִּיס I` name the familiar word I.

**Question.** Is C00772 `גֵּיס` the unnumbered I of `גִּיס` II?

- **C00773**
  - [ ] yes: C00772 takes the implied I (name `גֵּיס I`; nothing displayed)
  - [ ] no, C00772 is another word; as stored: nothing to fix (the row goes to the reviewed-kept list)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): print leaves C00772 bare and numbers the next form II, same consonants and adjacent, which is the case ruling 10-06 decides; medium because two cross-references call the familiar word I.

### `הֲדָיָא`: E00114 (`הֲדָיָא` II)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [E00113](https://jastrow.app/#rid:E00113) | `הֶדְיָא` | `(¥. preced.) presence, dircetness; TS openly,` | [333a · leaf 356](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$357/full/1400,/0/default.jpg) |
| [E00114](https://jastrow.app/#rid:E00114) | `הֲדָיָא II`, `הֲדָיָה`, `בַּר ה׳`, `בֶּן ה׳` | `hing on Hao )1 ה bird of the` | [333a · leaf 356](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$357/full/1400,/0/default.jpg) |

Shape now: X10 (`E00113 הֶדְיָא stands just before the II`; `E00114=2`).

You answered "the gap is Jastrow's own". X10 names E00113 `הֶדְיָא`, just before the II. Found 2026-10-13: Tesseract reads neither headword (E00113's line starts at its gloss; E00114's numeral is not legible), and no cross-reference names a `הֶדְיָא I` or `הֲדָיָא I`.

**Question.** Is E00113 `הֶדְיָא` the unnumbered I of `הֲדָיָא` II?

- **E00114**
  - [ ] yes: E00113 takes the implied I (name `הֶדְיָא I`; nothing displayed)
  - [ ] no, E00113 is another word; as stored: nothing to fix (the row goes to the reviewed-kept list)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): you read no I anywhere, and E00113 is the unnumbered form with the same consonants just before the II, which is the case ruling 10-06 decides; the hOCR cannot show either numeral.

### `רוּם`: T00376 (`רוּם` II)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [T00374](https://jastrow.app/#rid:T00374) | `רוּם`, `רִים` | `D!D,D"H (b.h.) [to swing,] to be high, lifted` | [1460a · leaf 783](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$784/full/1400,/0/default.jpg) |
| [T00375](https://jastrow.app/#rid:T00375) | `רוּם`, `רִים` | `WT\t D"H ch. same, to be high. Targ.Ps.` | [1460a · leaf 783](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$784/full/1400,/0/default.jpg) |
| [T00376](https://jastrow.app/#rid:T00376) | `רוּם II`, `רוֹם` | `UT\ II, Din m. (b.h; preced.) height. Ber.` | [1460b · leaf 783](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$784/full/1400,/0/default.jpg) |
| [T00377](https://jastrow.app/#rid:T00377) | `רוּם`, `רוּמָא I` | `D^TU^ETl I ch. same, I) height. Targ. Y.` | [1460b · leaf 783](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$784/full/1400,/0/default.jpg) |

Shape now: X10 (`T00375 רוּם stands just before the II`; `T00374=—; T00375=—; T00376=2; T00377=—`).

You answered "the gap is Jastrow's own". T00377's I sits on its alternate `רוּמָא`, which pairs with T00378 `רוּמָא` II (Rome), so it does not bear on `רוּם`. X10 names T00375 for the implied I, but T00375 is the verb's `ch. same` line; the Hebrew verb is T00374. Found 2026-10-13: no cross-reference names a `רוּם I`; U01270 names T00376 `רוּם II`.

**Question.** Which form takes the implied I?

- **T00376**
  - [ ] T00374 `רוּם` (the Hebrew verb)
  - [ ] T00375 `רוּם` (its `ch. same` line, as X10 names)
  - [ ] neither: no implied I here; as stored: nothing to fix (the row goes to the reviewed-kept list)
  - note: 

Recommendation: T00374 (medium): ABBYY sets no numeral on T00374 or T00375, ruling 10-06 puts the implied I on the first unnumbered form, and in the same shape at H00321 Jastrow's cross-references name the Hebrew verb I; here none does.

### `שִׁלְשֵׁל`: U01397 (`שִׁלְשֵׁל` II)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01396](https://jastrow.app/#rid:U01396) | `שִׁלְשֵׁל`, `שִׁילְ׳`, `שִׁלֵּשׁ` | `*I5"'w, '**',!" I, (apocop.) ETil" (Vri I) to` | [1589b · leaf 912](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$913/full/1400,/0/default.jpg) |
| [U01397](https://jastrow.app/#rid:U01397) | `שִׁלְשֵׁל II` | `5J2J52J II (cmp. bVr I) 1) to chain,` | [1589b · leaf 912](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$913/full/1400,/0/default.jpg) |
| [U01398](https://jastrow.app/#rid:U01398) | `שַׁלְשֵׁל I` | `y^yi I ch. same.` | [1589b · leaf 912](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$913/full/1400,/0/default.jpg) |

Shape now: X10 (`U01396 שִׁלְשֵׁל stands just before the II`; `U01396=—; U01397=2`).

You answered "the gap is Jastrow's own". The hOCR sets `I` after U01396's second form, the abbreviation `שִׁילְ׳`. Under HW-roman a numeral stays on the form print sets it on, so an I there is stored on that alternate and no name changes. Found 2026-10-13: the run just before sets its numerals the same way and stores them on the abbreviation: U01391 `שִׁלְשׁוּל, שִׁי׳ I` (hOCR `Tiw >w, *w I m.`), U01392 `שִׁי׳ II`, U01393 `שׁי׳ III`. Jastrow calls U01396's word `שִׁלְשֵׁל I` (U01399 `= h. שִׁלְשֵׁל I, to let down`; U01391 `(שִׁלְשֵׁל I) letting down`).

**Question.** Where on U01396's line does print set the I?

- **U01396**
  - [ ] after the abbreviation `שִׁילְ׳`: store it on that alternate
  - [ ] there is no I on the line: U01396 takes the implied I (name `שִׁלְשֵׁל I`)
  - [ ] after `שִׁלְשֵׁל` itself: U01396 takes I (name `שִׁלְשֵׁל I`, displayed)
  - [ ] can't tell from the scan
  - note: 

Recommendation: after the abbreviation (high): ABBYY reads `I,` after the second form, as on U01391's line, and HW-roman stores it there as U01391–U01393 store theirs; U01397's X10 row may then need a reviewed-kept record, as U02098's I on a form spelled apart has.

### `נְהִי`: N00260 (`נְהִי` II)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [N00259](https://jastrow.app/#rid:N00259) | `נְהֵי I` | `^nD I (b. h. nn3; cmp. dn3) to move; to be in com-` | [881b · leaf 204](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$205/full/1400,/0/default.jpg) |
| [N00260](https://jastrow.app/#rid:N00260) | `נְהִי II` | `"TI3 II m. (b.h.; v. preced.) commotion; lamentation,` | [881b · leaf 204](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$205/full/1400,/0/default.jpg) |
| [N00261](https://jastrow.app/#rid:N00261) | `נְהֵי`, `נְהִי II` | `"113 or *T\j II (="lin3; v. \in) let` | [881b · leaf 204](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$205/full/1400,/0/default.jpg) |

Shape now: X8 (`missing 1; 0 unnumbered: N00260=2; N00261/alt=2`).

You ticked "print spells them differently, so the gap is real" and noted the data is print-accurate. That box asked you to find the I, and no `נְהִי` I is stored. N00259's hOCR column now quotes its own headword line; the old quote was its `Ithpe.` line. Found 2026-10-13: no cross-reference names a `נְהִי I`; four name N00259 `נְהֵי I` (N00270, N00271, N01385, R00263), and N00869 `(= נְהֵי מִי) … v. נְהֵי II` names N00261, whose II print sets after both its forms.

**Question.** Is there a `נְהִי` I in print?

- **N00260**
  - [ ] no: the gap is Jastrow's own; as stored: nothing to fix (the row goes to the reviewed-kept list)
  - [ ] yes (say which entry in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: no, kept (high): N00260's line reads `II m. (b.h.; v. preced.)`, so its I is N00259 `נְהֵי I`, pointed apart as 10-05 allows, and only N00261's second II keeps the detector from clearing the pair.

### `תַּכָּא`: V00523 (`תַּכָּא` II)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [V00522](https://jastrow.app/#rid:V00522) | `תֻּכָּא`, `תַּכָּא` | `fcCPl, (&G~ i), v. OH` | [1667b · leaf 990](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$991/full/1400,/0/default.jpg) |
| [V00523](https://jastrow.app/#rid:V00523) | `תַּכָּא II` | `KVi'Fj II m. (v. preced. art.; cmp. Assyr.` | [1667b · leaf 990](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$991/full/1400,/0/default.jpg) |

Shape now: X10 (`V00522/alt תַּכָּא stands just before the II`; `V00522/alt=—; V00523=2`).

You read the I beside V00522's alternate `תַּכָּא`, and noted it landed in the gloss with the alternate's closing parenthesis: V00522's gloss opens ` I), v. תּוּכָּא`. The opening parenthesis is in no stored byte, so where it goes is the one thing the patch cannot read off the data. Found 2026-10-13: V00522's line, which round 2's first version did not find, reads `fcCPl, (&G~ i), v. OH`: the first form, a comma, then the parenthesis around the alternate and `i` for its I.

**Question.** How does print set V00522's line?

- **V00522**
  - [ ] `תֻּכָּא (תַּכָּא I), v. …`: the parenthesis opens before the alternate
  - [ ] `תֻּכָּא, (תַּכָּא I), v. …`: a comma, then the parenthesis
  - [ ] something else (say what in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: a comma, then the parenthesis (medium): ABBYY reads `fcCPl, (&G~ i),`, a comma after the first form and `(` before the alternate; medium because ABBYY can misread a comma.

### J00321 and J00327: the placeholder letter

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [J00321](https://jastrow.app/#rid:J00321) | `ַיי` | `I, נְכְּהָיי=פָיר band; v. ביר .לור` | [576a · leaf 599](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$600/full/1400,/0/default.jpg) |
| [J00327](https://jastrow.app/#rid:J00327) | `ַיְידָא` | `NT` then `=9 ve RT 8. TMD.` | [576a · leaf 599](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$600/full/1400,/0/default.jpg) |

Shape now: X1 (each headword starts with a vowel mark).

Your notes: each headword is a long underline (about three letters wide) standing for any one letter, with a patah under it, then `יי` (J00321) or `יידא` (J00327). The entries store the patah with no letter under it, which HW-prefix keeps as an ending entry. Each gloss names the words the underline stands for: J00321 `כַּיי = כְּהַיי; לַיי = לְהַיי; v. כַּיי, לַיי`, J00327 `v. הַיְידָא a. לַיְידָא`.

**Question.** Keep the stored form, or store a placeholder for the underline?

- **J00321, J00327**
  - [ ] keep as stored (the bare patah; names `ַיי`, `ַיְידָא`)
  - [ ] store a placeholder for the underline (say which character in the note)
  - note: 

Recommendation: keep as stored (medium): the glosses already name every word the underline stands for, HW-prefix files the bare patah as an ending entry, and no ruling picks a character for print's rule, which is a mark of the page rather than a letter.

### S01780: the alternates `קִצָּא`, `קִי׳`

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [S01780](https://jastrow.app/#rid:S01780) | `קֵץ`, `קִצ`, `ּא`, `קִי׳` | `>, 5S22p, "p ch. same. Targ. 0. Gen. VI, 13. Targ.` | [1404a · leaf 727](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$728/full/1400,/0/default.jpg) |

Shape now: X1 (the alternate `ּא` starts with a dagesh) and X3 (the alternate `קִצ` ends in a non-final letter).

You gave the alternates as `קִצָּא` and `קִי׳`. The source holds `קִצ` and `ּא`, torn, and joining their bytes gives `קִצּא`: a dagesh in the tsade and **no qamats**. No vowel is inferred. Found 2026-10-13: round 2's first version said no stored spelling carries the qamats; one does. S01120's line `קִיצּ־, קִיצָּא, v. קֵץ, קִצָּא` is Jastrow's cross-reference to this word and spells it with the qamats, and S00026 reads `קִצָּא` with ed. Lag. The patch would still rest on your print read, not on a copy of those bytes.

**Question.** Does print set a qamats under the tsade?

- **S01780**
  - [ ] yes, `קִצָּא` (qamats and dagesh): the qamats is your print read
  - [ ] no, `קִצּא` as the bytes join
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes, `קִצָּא` (high): your round-1 read gave the qamats, and Jastrow's own cross-reference to the word (S01120) spells it the same; the hOCR `5S22p` cannot show pointing.

## The first list (answered 2026-10-06)

An entry's URL name is computed from `headwords[0]` at read time
(`admin/entry/names.ts`), Roman numeral and superscript included. A
fix to a primary headword after go-live changes a published name, and
U6 then requires a permanent redirect through the `formerNames` ledger
that does not exist yet (review ledger L23). So a primary-headword
defect is cheapest fixed now. Everything else can wait for the admin
tool.

`docs/reports/headword-issues.md` lists 382 rows whose role is
`headword` (H6 6, X1 2, X5 115, X7 123, X8 104, X9 32). Most are settled by
rulings already in [`decisions.md`](decisions.md). This file sorts
them so only the rows that truly need the print are left for you, with
the print evidence beside each one. Nothing here changes entry data.

## Summary

| Pile | Rows | What it means | Who acts |
|---|---|---|---|
| C | 81 | The evidence is ambiguous or the hOCR is too noisy. One print read each | You tick a box per question; Claude writes the patches |
| B | 11 | The fix is determinable: the hOCR shows a numeral Sefaria dropped | You tick a box per row below; Claude writes the patch |
| A | 286 | A ruling keeps the shape as printed, or the hOCR confirms the stored numbering | Nobody |
| D | 4 | Not a name problem: no fix would change a URL name | Nobody now |

| Shape | Rows | A | B | C | D |
|---|---|---|---|---|---|
| H6 multi-word | 6 | 6 | 0 | 0 | 0 |
| X1 leading mark | 2 | 2 | 0 | 0 | 0 |
| X5 maqaf | 115 | 113 | 0 | 2 | 0 |
| X7 abbreviation | 123 | 123 | 0 | 0 | 0 |
| X8 numbering gap | 104 | 42 | 10 | 52 | 0 |
| X9 pointing in a sequence | 32 | 0 | 1 | 27 | 4 |
| **Total** | **382** | **286** | **11** | **81** | **4** |

X8 is worked per family: each X8 row is one family of entries spelled
alike, and its fix often lands on a sibling rid, not the row's own.
X9 is worked per sequence: each X9 row is one place where a numbered
sequence changes its pointing ([decisions](decisions.md) 10-05).
Pile B is untouched, but one of its rows is now X9: U01774, the
family check for U01772. The sequence rule pairs U01774 `שְׁפַל` II
with U01771 `שָׁפֵל` I, while the hOCR reads U01772 `שְׁפַל` as I.
That pairing is the rule's known blind spot; pile B's fix ends it.

Outside the 382: U00489's primary is the single letter `ש`, a name
defect the report flags only on its alternate. It is in
[the five X1 and #113 rids](#the-five-x1-and-113-rids) below, in pile C.

## Pile C: needs your print read (81)

Each row names the scan leaf; the page link opens the Internet Archive image. The hOCR column is the OCR of that print line, copied as it is. Volume 1 (pages 1–676) is Tesseract and garbles Hebrew; volume 2 (677–1704) is ABBYY, which turns Hebrew into Latin noise but reads Roman numerals well. Under each question are answer boxes. Open the scan link, tick ONE box (change `[ ]` to `[x]`), and add a note only if a box asks for one or you saw something else. You never need to type Hebrew: describe it in words ("hataf patah under the alef") and Claude builds the spelling and shows it back to you. Skip any question you like; unticked questions simply stay open. When you stop, tell Claude: it reads the ticks, writes the reviewed patches, re-imports, and opens a PR that shows every change for you to approve. You write no patch and use no tool.

### X5 maqaf rows that are not prefixes (2)

| | rid | stored | hOCR, verbatim | scan | question |
|---|---|---|---|---|---|
| | [D00616](https://jastrow.app/#rid:D00616) | `דימונ־ק־` | `“OI, +. יניק` | [300a · leaf 323](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$324/full/1400,/0/default.jpg) | Is the headword printed `דימונ־ק־` (two maqafs), or another notation such as `דימונ׳ק׳`? The hOCR line is illegible. |
| | [S01339](https://jastrow.app/#rid:S01339) | `קְלִיסְטַנְרִ־` | `"""DUQD'Op m.(corrupt.ofquestionarius)ea-ec!^tOMer.` | [1375b · leaf 698](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$699/full/1400,/0/default.jpg) | A noun (`m.`) ending in a maqaf. Does print end the word in a maqaf or a letter (yod)? The page index puts it on 1376b; the hOCR line is on 1375b. |

**Your answers** (tick one per row):

- **D00616**: stored `דימונ־ק־`
  - [ ] print has it as stored
  - [x] print has something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: ocr error, the maqefs are actually yods - דימוניקי

- **S01339**: stored `קְלִיסְטַנְרִ־`
  - [x] print has it as stored
  - [ ] print has something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: correct page is 1376b


### X9 Pointing: a mark is missing on one spelling (15)

Each of these was an X8 row while the report keyed a family on its exact spelling. Its numerals run once through a sequence of one consonant skeleton ([decisions](decisions.md) 10-05), so the numbering is complete; the pointing is what is left. One spelling lacks a mark its sequence neighbour has, letter for letter, so one stored headword is likely a slip. On `headwords[0]` the fix changes that entry's URL name. Nothing is inferred: the print decides.

#### `אִילפָא` I, `אִילְפָא` II (row [A01311](https://jastrow.app/#rid:A01311))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A01310](https://jastrow.app/#rid:A01310) | `אִילפָא I` | `NONI, NDON +. ,אלף) FD"; Assyr. élippu) ship,` | [50a · leaf 73](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$74/full/1400,/0/default.jpg) |
| [A01311](https://jastrow.app/#rid:A01311) | `אִילְפָא II` | `אילפא. 11 pr. .ם .גת Ifa, an Amora,` | [50a · leaf 73](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$74/full/1400,/0/default.jpg) |

**Question.** `אִילפָא` (A01310, I) is stored with no mark under ל; its sequence neighbour `אִילְפָא` (A01311, II) has sheva. Is the letter pointed in print?

  - [x] print has the mark: the stored `אִילפָא` is missing it
  - [ ] print has no mark there: `אִילפָא` is right as stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: mark this as an ocr error for the upstream correction report
  - applied 2026-10-09: P000364 sets A01310 `אִילפָא I` → `אִילְפָא I`, the stored bytes of A01311 (ruling `10-09 link key`); the 4 links naming Sefaria's spelling still resolve to A01310


#### `אימָּא` I, `אִימָּא` II (row [A01320](https://jastrow.app/#rid:A01320))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A01319](https://jastrow.app/#rid:A01319) | `אימָּא I` | `אמא 1 distaff, +. max 1.` | [50a · leaf 73](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$74/full/1400,/0/default.jpg) |
| [A01320](https://jastrow.app/#rid:A01320) | `אִימָּא II` | `1אימא ,אמא TIN f. ch. (=h. 58) 1)` | [50a · leaf 73](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$74/full/1400,/0/default.jpg) |
| [A01321](https://jastrow.app/#rid:A01321) | `אִימָּא III` | `NON III pr. n. f. [or title; cmp.` | [50b · leaf 73](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$74/full/1400,/0/default.jpg) |

**Question.** `אימָּא` (A01319, I) is stored with no mark under א; its sequence neighbour `אִימָּא` (A01320, II) has hiriq. Is the letter pointed in print?

  - [x] print has the mark: the stored `אימָּא` is missing it
  - [ ] print has no mark there: `אימָּא` is right as stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: ocr error


#### `אִיסטְוָוא` I, `אִיסְטְוָוא` II (row [A01420](https://jastrow.app/#rid:A01420))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A01411](https://jastrow.app/#rid:A01411) | alt `אִיסְטְוָוא` (of `אִיסְטְבָא`) | not found in the hOCR | [54a · leaf 77](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$78/full/1400,/0/default.jpg) |
| [A01419](https://jastrow.app/#rid:A01419) | `אִיסטְוָוא I` | not found in the hOCR | [54b · leaf 77](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$78/full/1400,/0/default.jpg) |
| [A01420](https://jastrow.app/#rid:A01420) | `אִיסְטְוָוא II` | `איסטווא Il, ‘ON (m.?) (Isp. noun of סול` | [54b · leaf 77](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$78/full/1400,/0/default.jpg) |

**Question.** `אִיסטְוָוא` (A01419, I) is stored with no mark under ס; its sequence neighbour `אִיסְטְוָוא` (A01420, II) has sheva. Is the letter pointed in print?

  - [ ] print has the mark: the stored `אִיסטְוָוא` is missing it
  - [x] print has no mark there: `אִיסטְוָוא` is right as stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: This is likely a textual error but would require extensive research.  I would love an issue oppened on it, as I think it is a fascinating question.


#### `גִּיהא` I, `גִּיהָא` II (row [C00650](https://jastrow.app/#rid:C00650))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C00649](https://jastrow.app/#rid:C00649) | `גִּיהא I` | not found in the hOCR | [235b · leaf 258](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$259/full/1400,/0/default.jpg) |
| [C00650](https://jastrow.app/#rid:C00650) | `גִּיהָא II` | not found in the hOCR | [235b · leaf 258](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$259/full/1400,/0/default.jpg) |

**Question.** `גִּיהא` (C00649, I) is stored with no mark under ה; its sequence neighbour `גִּיהָא` (C00650, II) has qamats. Is the letter pointed in print?

  - [x] print has the mark: the stored `גִּיהא` is missing it
  - [ ] print has no mark there: `גִּיהא` is right as stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: ocr error
  - applied 2026-10-09: P000365 sets C00649 `גִּיהא I` → `גִּיהָא I`, the stored bytes of C00650 (ruling `10-09 link key`); the 4 links naming Sefaria's spelling still resolve to C00649


#### `הֲקָצה` I, `הֲקָצָה` II (row [E00802](https://jastrow.app/#rid:E00802))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [E00801](https://jastrow.app/#rid:E00801) | `הֲקָצה I` | `ASP If. (y"P) waking up. Midr. Till. to` | [364b · leaf 387](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$388/full/1400,/0/default.jpg) |
| [E00802](https://jastrow.app/#rid:E00802) | `הֲקָצָה II` | `הקצה 11 .+ ,קוץ) (קצץ cutting, שפתים- הצת` | [364b · leaf 387](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$388/full/1400,/0/default.jpg) |

**Question.** `הֲקָצה` (E00801, I) is stored with no mark under צ; its sequence neighbour `הֲקָצָה` (E00802, II) has qamats. Is the letter pointed in print?

  - [ ] print has the mark: the stored `הֲקָצה` is missing it
  - [x] print has no mark there: `הֲקָצה` is right as stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: Another likley textual issue, add with other, fascinating I say.....


#### `הִרְהוּן` I, `הרְהוּן` II (row [E00837](https://jastrow.app/#rid:E00837))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [E00836](https://jastrow.app/#rid:E00836) | `הִרְהוּן I` | not found in the hOCR | [366a · leaf 389](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$390/full/1400,/0/default.jpg) |
| [E00837](https://jastrow.app/#rid:E00837) | `הרְהוּן II` | `הרתון IT m. wrin-soaked dung, v. ההון a.` | [366a · leaf 389](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$390/full/1400,/0/default.jpg) |

**Question.** `הרְהוּן` (E00837, II) is stored with no mark under ה; its sequence neighbour `הִרְהוּן` (E00836, I) has hiriq. Is the letter pointed in print?

  - [ ] print has the mark: the stored `הרְהוּן` is missing it
  - [x] print has no mark there: `הרְהוּן` is right as stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: another to add to that textual issues research issue


#### `חֲבִילא` I, `חֲבִילָא` II (row [H00067](https://jastrow.app/#rid:H00067))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00066](https://jastrow.app/#rid:H00066) | `חֲבִילא I` | not found in the hOCR | [419a · leaf 442](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$443/full/1400,/0/default.jpg) |
| [H00067](https://jastrow.app/#rid:H00067) | `חֲבִילָא II` | `two nations) is severed —Pl. pian. Lev. BR.` | [419a · leaf 442](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$443/full/1400,/0/default.jpg) |

**Question.** `חֲבִילא` (H00066, I) is stored with no mark under ל; its sequence neighbour `חֲבִילָא` (H00067, II) has qamats. Is the letter pointed in print?

  - [ ] print has the mark: the stored `חֲבִילא` is missing it
  - [x] print has no mark there: `חֲבִילא` is right as stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: as above


#### `חַיְיתָא` II, `חַיְּיתָא` III (row [H00749](https://jastrow.app/#rid:H00749))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00747](https://jastrow.app/#rid:H00747) | `חַיְיתָא I` | `7 1, NENT 1 (adj), v. .חר —2)` | [455a · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |
| [H00748](https://jastrow.app/#rid:H00748) | `חַיְיתָא II` | `Targ. 0. Gen. 1, 28. Ib. 30 rom` | [455a · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |
| [H00749](https://jastrow.app/#rid:H00749) | `חַיְּיתָא III` | `הייפא LTT, היסא + ₪ א ;יח rary,` | [455b · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |
| [H00750](https://jastrow.app/#rid:H00750) | `חַיְּיתָא` | `,חויתא התא 1 .₪ ,חות) 6 נָחַת .₪` | [455b · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |

**Question.** `חַיְיתָא` (H00748, II) is stored with no dagesh on י; its sequence neighbour `חַיְּיתָא` (H00749, III) has it. Is the letter pointed that way in print? Note the unnumbered H00750 too.

  - [ ] print has the mark: the stored `חַיְיתָא` is missing it
  - [x] print has no mark there: `חַיְיתָא` is right as stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `טְבִיעה` I, `טְבִיעָה` II (row [I00057](https://jastrow.app/#rid:I00057))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [I00056](https://jastrow.app/#rid:I00056) | `טְבִיעה I` | `‘on מן ‘Tee שהסרתל whom 1 saved from` | [517a · leaf 540](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$541/full/1400,/0/default.jpg) |
| [I00057](https://jastrow.app/#rid:I00057) | `טְבִיעָה II` | not found in the hOCR | [517a · leaf 540](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$541/full/1400,/0/default.jpg) |

**Question.** `טְבִיעה` (I00056, I) is stored with no mark under ע; its sequence neighbour `טְבִיעָה` (I00057, II) has qamats. Is the letter pointed in print?

  - [ ] print has the mark: the stored `טְבִיעה` is missing it
  - [x] print has no mark there: `טְבִיעה` is right as stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: textual issue research


#### `מָצַּר` I, `מָצַר` II (row [M02354](https://jastrow.app/#rid:M02354))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [M02352](https://jastrow.app/#rid:M02352) | `מָצַּר I` | `IIEIZ I (sec. r. of -ns) to twist,` | [827b · leaf 150](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$151/full/1400,/0/default.jpg) |
| [M02354](https://jastrow.app/#rid:M02354) | `מָצַר II` | `"I22S H (denom. of nsa) to rfe/?7»« the` | [827b · leaf 150](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$151/full/1400,/0/default.jpg) |

**Question.** `מָצַר` (M02354, II) is stored with no dagesh on צ; its sequence neighbour `מָצַּר` (M02352, I) has it. Is the letter pointed that way in print?

  - [ ] print has the mark: the stored `מָצַר` is missing it
  - [x] print has no mark there: `מָצַר` is right as stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `מרוּצָה` I, `מְרוּצָה` II (row [M02602](https://jastrow.app/#rid:M02602))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [M02601](https://jastrow.app/#rid:M02601) | `מרוּצָה I` | `M^ID I f. (b. h. ; y!Ti) running.` | [839a · leaf 162](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$163/full/1400,/0/default.jpg) |
| [M02602](https://jastrow.app/#rid:M02602) | `מְרוּצָה II` | `n^lQ"II f. (b.h.; yin) oppression, arrogance. Ruth` | [839b · leaf 162](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$163/full/1400,/0/default.jpg) |

**Question.** `מרוּצָה` (M02601, I) is stored with no mark under מ; its sequence neighbour `מְרוּצָה` (M02602, II) has sheva. Is the letter pointed in print?

  - [x] print has the mark: the stored `מרוּצָה` is missing it
  - [ ] print has no mark there: `מרוּצָה` is right as stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: upstream log
  - applied 2026-10-09: P000366 sets M02601 `מרוּצָה I` → `מְרוּצָה I`, the stored bytes of M02602 (ruling `10-09 link key`); the 1 link naming Sefaria's spelling still resolves to M02601


#### `נָּקִי` I, `נָקִי` II (row [N01196](https://jastrow.app/#rid:N01196))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [N01195](https://jastrow.app/#rid:N01195) | `נָּקִי I` | `"pJ I m. (b.h.; preced.) clean, clear; bare.` | [932b · leaf 255](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$256/full/1400,/0/default.jpg) |
| [N01196](https://jastrow.app/#rid:N01196) | `נָקִי II` | `"'pO II m. (preced.) a young lamb (v.` | [932b · leaf 255](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$256/full/1400,/0/default.jpg) |

**Question.** `נָקִי` (N01196, II) is stored with no dagesh on נ; its sequence neighbour `נָּקִי` (N01195, I) has it. Is the letter pointed that way in print?

  - [ ] print has the mark: the stored `נָקִי` is missing it
  - [x] print has no mark there: `נָקִי` is right as stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `עִוּזָּא` I, `עוּזָּא` II (row [P00219](https://jastrow.app/#rid:P00219))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P00218](https://jastrow.app/#rid:P00218) | `עִוּזָּא I` | `Sll!? I, Sl> m. (cmp. preced.) name of` | [1049a · leaf 372](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$373/full/1400,/0/default.jpg) |
| [P00219](https://jastrow.app/#rid:P00219) | `עוּזָּא II` | `#V\V II, nvi'J, 'l" (b. h.) pr. n.` | [1049a · leaf 372](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$373/full/1400,/0/default.jpg) |

**Question.** `עוּזָּא` (P00219, II) is stored with no mark under ע; its sequence neighbour `עִוּזָּא` (P00218, I) has hiriq. Is the letter pointed in print?

  - [ ] print has the mark: the stored `עוּזָּא` is missing it
  - [ ] print has no mark there: `עוּזָּא` is right as stored
  - [x] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 218 should not have the chirik either, upstream log
  - applied 2026-10-09: P000367 sets P00218 `עִוּזָּא I` → `עוּזָּא I`, the stored bytes of P00219 (ruling `10-09 link key`); the 3 links naming Sefaria's spelling still resolve to P00218


#### `ענָוָה` I, `עֲנָוָה` II (row [P00959](https://jastrow.app/#rid:P00959))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P00958](https://jastrow.app/#rid:P00958) | `ענָוָה I` | `H13^ I, (fT02) f. (H5S I) dimne response` | [1092a · leaf 415](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$416/full/1400,/0/default.jpg) |
| [P00959](https://jastrow.app/#rid:P00959) | `עֲנָוָה II` | `niD^ II f. (b.h. ; SiiSH) humility, lowliness,` | [1092a · leaf 415](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$416/full/1400,/0/default.jpg) |

**Question.** `ענָוָה` (P00958, I) is stored with no mark under ע; its sequence neighbour `עֲנָוָה` (P00959, II) has hataf patah. Is the letter pointed in print?

  - [ ] print has the mark: the stored `ענָוָה` is missing it
  - [x] print has no mark there: `ענָוָה` is right as stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: textual issue research


#### `קְבַל` III, `קְבל` IV (row [S00064](https://jastrow.app/#rid:S00064))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [S00059](https://jastrow.app/#rid:S00059) | `קָבַל II` | `5Dj> II (cmp. b2M) to feel oppressed; to` | [1309a · leaf 632](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$633/full/1400,/0/default.jpg) |
| [S00061](https://jastrow.app/#rid:S00061) | `קְבַל III` | `33p III, ^"Gp (cmp. preced.) [to be thick,]` | [1309b · leaf 632](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$633/full/1400,/0/default.jpg) |
| [S00064](https://jastrow.app/#rid:S00064) | `קְבל IV` | `bnp iv, Stjg, abnj?, &h$>, 'np, ':rp i` | [1309b · leaf 632](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$633/full/1400,/0/default.jpg) |

**Question.** `קְבל` (S00064, IV) is stored with no mark under ב; its sequence neighbour `קְבַל` (S00061, III) has patah. Is the letter pointed in print? The hOCR reads `bnp iv` (lowercase), which the reader does not count. The same sequence changes pointing once more, `קָבַל` II to `קְבַל` III (S00061); that one is in pile D.

  - [ ] print has the mark: the stored `קְבל` is missing it
  - [x] print has no mark there: `קְבל` is right as stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


### X9 Pointing: the vowels differ (12)

Here a vowel stands where the sequence neighbour has another one. That is usually deliberate, a Hebrew word beside its Aramaic counterpart or a loan word, but not always: A01964's sheva under the alef looks like a slip. The question is only whether print has both spellings as stored.

#### `אֱגוֹרָא` I, `אֲגוֹרָא` II (row [A00279](https://jastrow.app/#rid:A00279))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A00278](https://jastrow.app/#rid:A00278) | `אֱגוֹרָא I` | `NTUN 1 אִיגורָא ch. same; esp. heathen altar` | [12a · leaf 35](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$36/full/1400,/0/default.jpg) |
| [A00279](https://jastrow.app/#rid:A00279) | `אֲגוֹרָא II` | `אִגורָא II £.(ay0p4) market-place, court-session, court.` | [12a · leaf 35](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$36/full/1400,/0/default.jpg) |

**Question.** `אֱגוֹרָא` (A00278, I) and `אֲגוֹרָא` (A00279, II) are pointed differently: א: hataf segol vs hataf patah. Are both printed as stored?

  - [x] yes, both as stored: nothing to fix
  - [ ] no, `אֱגוֹרָא` is wrong in print terms (say what you see in the note)
  - [ ] no, `אֲגוֹרָא` is wrong (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `אָכַל` I, `אֲכַל` II (row [A01698](https://jastrow.app/#rid:A01698))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A01697](https://jastrow.app/#rid:A01697) | alt `אָכַל I` (of `אֲכַל`) | `1 ch. 1) eame—tet, Se75, מרכול Tare` | [63a · leaf 86](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$87/full/1400,/0/default.jpg) |
| [A01698](https://jastrow.app/#rid:A01698) | `אֲכַל II` | `SON 11). 1. of (כול fo measure. Ned.` | [63b · leaf 86](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$87/full/1400,/0/default.jpg) |

**Question.** `אָכַל` (A01697, I) and `אֲכַל` (A01698, II) are pointed differently: א: qamats vs hataf patah. Are both printed as stored? This was pile A (HW-roman): Sefaria's line for A01697 is `אֲכַל, אָכַל I`, with the I on the second form, so A01697's primary `אֲכַל` is unnumbered. The page index puts A01697 on 63a; the hOCR line quoted for it is in 63b.

  - [x] yes, both as stored: nothing to fix
  - [ ] no, `אָכַל` is wrong in print terms (say what you see in the note)
  - [ ] no, `אֲכַל` is wrong (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `אְמָא` I, `אֲמָא` II (row [A01965](https://jastrow.app/#rid:A01965))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A01964](https://jastrow.app/#rid:A01964) | `אְמָא I` | `אמא 1 NON +. pox. Targ. 0. 604,111,` | [74a · leaf 97](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$98/full/1400,/0/default.jpg) |
| [A01965](https://jastrow.app/#rid:A01965) | `אֲמָא II` | `NONIL Vas, fut. ,רימא imper. NDR ( 1/28` | [74a · leaf 97](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$98/full/1400,/0/default.jpg) |

**Question.** `אְמָא` (A01964, I) and `אֲמָא` (A01965, II) are pointed differently: א: sheva vs hataf patah. Are both printed as stored?

  - [ ] yes, both as stored: nothing to fix
  - [x] no, `אְמָא` is wrong in print terms (say what you see in the note)
  - [ ] no, `אֲמָא` is wrong (say what you see in the note)
  - [ ] can't tell from the scan
  - note: both are patach sh'va. ocr error
  - applied 2026-10-09: P000361 sets A01964 `אְמָא I` → `אֲמָא I`, the stored bytes of A01965 (ruling `10-09 link key`); the 5 links naming Sefaria's spelling still resolve to A01964


#### `בָּסַר` II, `בְּסַר` III (row [B01014](https://jastrow.app/#rid:B01014))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [B01010](https://jastrow.app/#rid:B01010) | `בָּסַר I` | `4 (בסס fo tread upom; trnef. .צ) בע` | [179b · leaf 202](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$203/full/1400,/0/default.jpg) |
| [B01011](https://jastrow.app/#rid:B01011) | `בְּסַר` | `7023 ch. same, Targ. Ps. LXIX, 34; a.` | [180a · leaf 203](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$204/full/1400,/0/default.jpg) |
| [B01012](https://jastrow.app/#rid:B01012) | `בָּסַר II` | `703 II (7/3, v. (בסם to begin to` | [180a · leaf 203](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$204/full/1400,/0/default.jpg) |
| [B01013](https://jastrow.app/#rid:B01013) | `בְּסַר²` | `בסר ch. same. 1) Part. "O32 m., NOR` | [180a · leaf 203](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$204/full/1400,/0/default.jpg) |
| [B01014](https://jastrow.app/#rid:B01014) | `בְּסַר III` | `OA ,זז N TOD flesh, +. iva, בּמְרָא` | [180a · leaf 203](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$204/full/1400,/0/default.jpg) |

**Question.** `בָּסַר` (B01012, II) and `בְּסַר` (B01014, III) are pointed differently: ב: qamats and dagesh vs sheva and dagesh. Are both printed as stored? New in this list: under the exact-spelling key `בְּסַר` III looked complete, because B01369 and B01370 carry a `בְּסַר` I and II for another word. B01011 and B01013 (`בְּסַר²`) are the unnumbered `ch. same` lines between.

  - [x] yes, both as stored: nothing to fix
  - [ ] no, `בָּסַר` is wrong in print terms (say what you see in the note)
  - [ ] no, `בְּסַר` is wrong (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `דְּיוֹ` I, `דִּיוֹ` II (row [D00501](https://jastrow.app/#rid:D00501))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [D00500](https://jastrow.app/#rid:D00500) | `דְּיוֹ I` | `דיר 1 5 .₪) he; 5) fluid, writing` | [296a · leaf 319](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$320/full/1400,/0/default.jpg) |
| [D00501](https://jastrow.app/#rid:D00501) | `דִּיוֹ II` | `דייר 11 (ét-) two, double, a Greek prefix,` | [296a · leaf 319](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$320/full/1400,/0/default.jpg) |

**Question.** `דְּיוֹ` (D00500, I) and `דִּיוֹ` (D00501, II) are pointed differently: ד: sheva and dagesh vs hiriq and dagesh. Are both printed as stored?

  - [ ] yes, both as stored: nothing to fix
  - [ ] no, `דְּיוֹ` is wrong in print terms (say what you see in the note)
  - [x] no, `דִּיוֹ` is wrong (say what you see in the note)
  - [ ] can't tell from the scan
  - note: both have sh'va, ocr error
  - applied 2026-10-09: P000362 sets D00501 `דִּיוֹ II` → `דְּיוֹ II`, the stored bytes of D00500 (ruling `10-09 link key`); the 6 links naming Sefaria's spelling still resolve to D00501


#### `חְלָמָה` I, `חֲלָמָה` II (row [H01089](https://jastrow.app/#rid:H01089))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H01088](https://jastrow.app/#rid:H01088) | alt `חְלָמָה I` (of `חֲלָמָא`) | `Set (FIRST T) +. cates 1) 5 sort` | [471a · leaf 494](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$495/full/1400,/0/default.jpg) |
| [H01089](https://jastrow.app/#rid:H01089) | `חֲלָמָה II` | not found in the hOCR | [471a · leaf 494](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$495/full/1400,/0/default.jpg) |

**Question.** `חְלָמָה` (H01088, I) and `חֲלָמָה` (H01089, II) are pointed differently: ח: sheva vs hataf patah. Are both printed as stored?

  - [x] yes, both as stored: nothing to fix
  - [ ] no, `חְלָמָה` is wrong in print terms (say what you see in the note)
  - [ ] no, `חֲלָמָה` is wrong (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `חָרִב` I, `חָרֵב` II (row [H01579](https://jastrow.app/#rid:H01579))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H01577](https://jastrow.app/#rid:H01577) | `חָרִב I` | `an I (b. h.) to be burned, dried` | [498a · leaf 521](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$522/full/1400,/0/default.jpg) |
| [H01579](https://jastrow.app/#rid:H01579) | `חָרֵב II` | `חרב 11 ,ו nn, an f. (b. h.;` | [498a · leaf 521](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$522/full/1400,/0/default.jpg) |
| [H01580](https://jastrow.app/#rid:H01580) | `חָרֵב` | not found in the hOCR | [498a · leaf 521](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$522/full/1400,/0/default.jpg) |

**Question.** `חָרִב` (H01577, I) and `חָרֵב` (H01579, II) are pointed differently: ר: hiriq vs tsere. Are both printed as stored? Note the unnumbered H01580 too.

  - [ ] yes, both as stored: nothing to fix
  - [ ] no, `חָרִב` is wrong in print terms (say what you see in the note)
  - [x] no, `חָרֵב` is wrong (say what you see in the note)
  - [ ] can't tell from the scan
  - note: both are chirik, ocr error
  - applied 2026-10-09: P000363 sets H01579 `חָרֵב II` → `חָרִב II`, the stored bytes of H01577 (ruling `10-09 link key`); the 3 links naming Sefaria's spelling still resolve to H01579


#### `מָסַר` I, `מְסַר` II (row [M02008](https://jastrow.app/#rid:M02008))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [M02007](https://jastrow.app/#rid:M02007) | alt `מָסַר I` (of `מְסַר`) | `ICE, ("iDC) I ch. same. Targ. Gen. XXXIX,` | [811a · leaf 134](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$135/full/1400,/0/default.jpg) |
| [M02008](https://jastrow.app/#rid:M02008) | `מְסַר II` | `"1C/Q II, Pa. ")®/2 (denom. of tf-C-a) to` | [811a · leaf 134](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$135/full/1400,/0/default.jpg) |

**Question.** `מָסַר` (M02007, I) and `מְסַר` (M02008, II) are pointed differently: מ: qamats vs sheva. Are both printed as stored? This was pile A (HW-roman): Sefaria's line for M02007 is `מְסַר, (מָסַר) I`, with the I on the form in parentheses, so M02007's primary `מְסַר` is unnumbered.

  - [x] yes, both as stored: nothing to fix
  - [ ] no, `מָסַר` is wrong in print terms (say what you see in the note)
  - [ ] no, `מְסַר` is wrong (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `מַרְעֵיתָא` I, `מַרְעִיתָא` II (row [M02740](https://jastrow.app/#rid:M02740))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [M02739](https://jastrow.app/#rid:M02739) | alt `מַרְעֵיתָא I` (of `מַרְעִית II`) | `rP^"]D IT, Sn"^l2 If. = xnria, evil &c.` | [845b · leaf 168](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$169/full/1400,/0/default.jpg) |
| [M02740](https://jastrow.app/#rid:M02740) | `מַרְעִיתָא II` | `Sri'*?T3 II f. ch.=h. nr-.a. Targ. I Chr.` | [845b · leaf 168](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$169/full/1400,/0/default.jpg) |

**Question.** `מַרְעֵיתָא` (M02739, I) and `מַרְעִיתָא` (M02740, II) are pointed differently: ע: tsere vs hiriq. Are both printed as stored?

  - [ ] yes, both as stored: nothing to fix
  - [x] no, `מַרְעֵיתָא` is wrong in print terms (say what you see in the note)
  - [ ] no, `מַרְעִיתָא` is wrong (say what you see in the note)
  - [ ] can't tell from the scan
  - note: both are chirik, ocr error


#### `עֲטַר` I, `עַטַר` II (row [P00477](https://jastrow.app/#rid:P00477))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P00476](https://jastrow.app/#rid:P00476) | `עֲטַר I` | `"TE25 I same. Targ. Ps. LXXIII, 6 '31` | [1064b · leaf 387](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$388/full/1400,/0/default.jpg) |
| [P00477](https://jastrow.app/#rid:P00477) | `עַטַר II` | `Pa. "OB to abolish entirely. Targ. II Chr.` | [1065a · leaf 388](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$389/full/1400,/0/default.jpg) |
| [P00478](https://jastrow.app/#rid:P00478) | `עֲטַר III` | `~l"^3? III (preced. wds., cmp. lap) [to whirl` | [1065a · leaf 388](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$389/full/1400,/0/default.jpg) |

**Question.** `עֲטַר` (P00476, I) and `עַטַר` (P00477, II) are pointed differently: ע: hataf patah vs patah. Are both printed as stored?

  - [x] yes, both as stored: nothing to fix
  - [ ] no, `עֲטַר` is wrong in print terms (say what you see in the note)
  - [ ] no, `עַטַר` is wrong (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 447 is actually on page 1064b


#### `פִּרְכֵּס` I, `פִּרִכֵּס` II (row [Q01863](https://jastrow.app/#rid:Q01863))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [Q01862](https://jastrow.app/#rid:Q01862) | `פִּרְכֵּס I` | `02PlD I (enlargement of TpB) to rub, scrape.` | [1229b · leaf 552](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$553/full/1400,/0/default.jpg) |
| [Q01863](https://jastrow.app/#rid:Q01863) | `פִּרִכֵּס II` | `D2T© II (preced.) [to rub, grind,] to move` | [1229b · leaf 552](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$553/full/1400,/0/default.jpg) |

**Question.** `פִּרְכֵּס` (Q01862, I) and `פִּרִכֵּס` (Q01863, II) are pointed differently: ר: sheva vs hiriq. Are both printed as stored?

  - [x] yes, both as stored: nothing to fix
  - [ ] no, `פִּרְכֵּס` is wrong in print terms (say what you see in the note)
  - [ ] no, `פִּרִכֵּס` is wrong (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `רְחִים` I, `רִחִים` II (row [T00500](https://jastrow.app/#rid:T00500))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [T00499](https://jastrow.app/#rid:T00499) | `רְחִים I` | `DTP I m. (preced.) love. Targ. Cant. VII,` | [1466a · leaf 789](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$790/full/1400,/0/default.jpg) |
| [T00500](https://jastrow.app/#rid:T00500) | `רִחִים II` | `DTl II, NET") m. (preced.) beloved, friend;` | [1466a · leaf 789](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$790/full/1400,/0/default.jpg) |

**Question.** `רְחִים` (T00499, I) and `רִחִים` (T00500, II) are pointed differently: ר: sheva vs hiriq. Are both printed as stored?

  - [x] yes, both as stored: nothing to fix
  - [ ] no, `רְחִים` is wrong in print terms (say what you see in the note)
  - [ ] no, `רִחִים` is wrong (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


### X8 Pointing differs, but the numerals are not one sequence (4)

These four were in the pointing section and stay X8: the sequence rule does not clear them, so their questions are unchanged. N00260: `נְהִי` II is given twice (N00260, N00261) with no superscript. P01246 and P01247: the `ערב` run gives I and II twice (P01242 `עָרַב` I, P01246 `עָרֵב` I). M02162: its I sits on an abbreviation, `מַעֲצַ׳`, whose letters differ.

#### `מַעֲצַרְתָּא`: missing I (row [M02162](https://jastrow.app/#rid:M02162))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [M02161](https://jastrow.app/#rid:M02161) | `מַעְצַרְתָּא` | `fctFH^iC, '2912 I f. (preced.) press-room (=h. rTtS` | [818b · leaf 141](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$142/full/1400,/0/default.jpg) |
| [M02162](https://jastrow.app/#rid:M02162) | `מַעֲצַרְתָּא II` | `STm^Q II f- (isr; cmp. rrow, KFnssi) meeting` | [819a · leaf 142](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$143/full/1400,/0/default.jpg) |

**Question.** M02161 is numbered I through its abbreviation `מַעֲצַ׳ I` (HW-roman), and the hOCR reads `I` on its line; its primary is stored `מַעְצַרְתָּא` (sheva under the ayin) while this family is `מַעֲצַרְתָּא` (hataf patah). Does print spell the two alike? If yes, one stored headword has a slip and its name changes; the numbering is complete either way.

  - [x] nothing to fix: the gap is Jastrow's own
  - [ ] there is a fix (say what print shows in the note)
  - [ ] can't tell from the scan
  - note: this pattern is due to the ambiguity of jastrow using numerals.  We are going to defualt to the print.


#### `נְהִי`: missing I (row [N00260](https://jastrow.app/#rid:N00260))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [N00259](https://jastrow.app/#rid:N00259) | `נְהֵי I` | `Ithpe. "W«J to follow eagerly. Targ. I Sam.` | [881b · leaf 204](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$205/full/1400,/0/default.jpg) |
| [N00260](https://jastrow.app/#rid:N00260) | `נְהִי II` | `"TI3 II m. (b.h.; v. preced.) commotion; lamentation,` | [881b · leaf 204](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$205/full/1400,/0/default.jpg) |
| [N00261](https://jastrow.app/#rid:N00261) | alt `נְהִי II` (of `נְהֵי`) | `"113 or *T\j II (="lin3; v. \in) let` | [881b · leaf 204](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$205/full/1400,/0/default.jpg) |

**Question.** N00259 holds the I as `נְהֵי`; this family is `נְהִי`. They differ only in ה: tsere vs hiriq (N00259 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [x] print spells them differently, so the gap is real
  - [ ] print spells both as `נְהֵי` (the way N00259 has it)
  - [ ] print spells both as `נְהִי` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: I have no idea what Jastwor is doing here, but our data is print accurate


#### `עָרֵב`: missing II (row [P01246](https://jastrow.app/#rid:P01246))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P01244](https://jastrow.app/#rid:P01244) | `עָרַב II` | `ml }J II (b. h.; v. preced.; cmp.` | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01246](https://jastrow.app/#rid:P01246) | `עָרֵב I` | `3 }/ I (b. h.; cmp. d'jSI) [to` | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01247](https://jastrow.app/#rid:P01247) | `עָרִב II` | `J y II m.(b.h.; preced. )spiced, sweet ;` | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01249](https://jastrow.app/#rid:P01249) | `עָרֵב III` | `3™)^ III m. (Sns I, 2) bondsman, surety.` | [1111a · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |
| [P01253](https://jastrow.app/#rid:P01253) | `עֲרָב II` | `J */ II pr. n. pi. 'Arab, near` | [1111b · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |

**Question (answers both this family and `עָרִב` below).** P01247 is stored `עָרִב II` with a hiriq, sitting between P01246 `עָרֵב I` and P01249 `עָרֵב III`, which have a tsere. Only P01247's spelling is in question. Is P01247 printed `עָרֵב II` (tsere, like its neighbours) or `עָרִב II` (hiriq, as stored)?

  - [ ] print has `עָרֵב II` (tsere): P01247's stored spelling is wrong, and its name changes
  - [x] print has `עָרִב II` (hiriq): P01247 is right as stored, and this family's gap is Jastrow's
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `עָרִב`: missing I (row [P01247](https://jastrow.app/#rid:P01247))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P01242](https://jastrow.app/#rid:P01242) | `עָרַב I` | `3HP I (b. h.; cmp. 3nx) [to insert,` | [1109b · leaf 432](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$433/full/1400,/0/default.jpg) |
| [P01246](https://jastrow.app/#rid:P01246) | `עָרֵב I` | `3 }/ I (b. h.; cmp. d'jSI) [to` | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01247](https://jastrow.app/#rid:P01247) | `עָרִב II` | `J y II m.(b.h.; preced. )spiced, sweet ;` | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01249](https://jastrow.app/#rid:P01249) | `עָרֵב III` | `3™)^ III m. (Sns I, 2) bondsman, surety.` | [1111a · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |
| [P01252](https://jastrow.app/#rid:P01252) | `עֲרָב I` | `J 1/ I ch. (b. h.) 1) pr.` | [1111b · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |

**Question.** The same question as the `עָרֵב` family above: one answer there covers both rows.


### X8 Volume 1: the numeral is not legible in the hOCR (26)

Tesseract reads a stored numeral beside its headword 22% of the time (control below), so a missing numeral cannot be read here. The question is the same for each: is the missing numeral printed beside an unnumbered sibling?

#### `אַגְמָא`: missing I (row [A00312](https://jastrow.app/#rid:A00312))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A00311](https://jastrow.app/#rid:A00311) | `אַגְמָא` | not found in the hOCR | [13a · leaf 36](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$37/full/1400,/0/default.jpg) |
| [A00312](https://jastrow.app/#rid:A00312) | `אַגְמָא II` | `גב 11 pr. ₪. pl Agma, in Babylon.` | [13a · leaf 36](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$37/full/1400,/0/default.jpg) |

**Question.** Does print set I beside A00311? If it sits after `אַגְמָא`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside A00311
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: Legit missing, lets put ones like this in a differnt textual issues research issue.


#### `אֲוָנָא`: missing I (row [A00719](https://jastrow.app/#rid:A00719))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A00719](https://jastrow.app/#rid:A00719) | `אֲוָנָא II` | `NIN 11 NIN pr. n. pl. (v. foreg.)` | [28a · leaf 51](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$52/full/1400,/0/default.jpg) |

**Question.** No entry spelled `אֲוָנָא` lacks a numeral. Is I printed on a neighbour, or is the gap Jastrow's?

  - [x] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: 718 is teh I, this is a wierd case because yod and vav can do wierd things


#### `אוֹרְיָין`: missing I (row [A00890](https://jastrow.app/#rid:A00890))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A00889](https://jastrow.app/#rid:A00889) | `אוֹרְיָין` | `TTS, היאן “AN m: same; 1) the Law.` | [34b · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| [A00890](https://jastrow.app/#rid:A00890) | `אוֹרְיָין II` | `PATNI, אוריון (v. foreg.) pr. n. m. Oryan,` | [34b · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |

**Question.** Does print set I beside A00889? If it sits after `אוֹרְיָין`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside A00889
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: add to textual research issue 


#### `אֲמָנָה`: missing I (row [A02042](https://jastrow.app/#rid:A02042))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A02041](https://jastrow.app/#rid:A02041) | `אֲמָנָה` | `TITON £.(o.t.; v.preced.) 1) faith, trust. B.Bath. 45°;` | [77b · leaf 100](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$101/full/1400,/0/default.jpg) |
| [A02042](https://jastrow.app/#rid:A02042) | `אֲמָנָה II` | not found in the hOCR | [78a · leaf 101](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$102/full/1400,/0/default.jpg) |

**Question.** Does print set I beside A02041? If it sits after `אֲמָנָה`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside A02041
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: add to resarch issue


#### `אָרַע`: missing I (row [A03217](https://jastrow.app/#rid:A03217))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A03215](https://jastrow.app/#rid:A03215) | `אָרַע` | `YIN (V3, v. (רעע to strike against. Nif.` | [124b · leaf 147](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$148/full/1400,/0/default.jpg) |
| [A03216](https://jastrow.app/#rid:A03216) | `אֲרַע I` | `JN I ch. (in Targ. Y.; in O.` | [124b · leaf 147](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$148/full/1400,/0/default.jpg) |
| [A03217](https://jastrow.app/#rid:A03217) | `אָרַע II` | `"JIN IT (35, cmp. 3, Hif. on, >` | [124b · leaf 147](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$148/full/1400,/0/default.jpg) |

**Question.** Does print set I beside A03215? If it sits after `אָרַע`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside A03215
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: i dont understand why this was flagged?  Need to double check the detector 3216 holds I and 3217 holds II


#### `בּוּרְסִי`: missing I (row [B00382](https://jastrow.app/#rid:B00382))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [B00382](https://jastrow.app/#rid:B00382) | `בּוּרְסִי II` | not found in the hOCR | [150b · leaf 173](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$174/full/1400,/0/default.jpg) |
| [B00383](https://jastrow.app/#rid:B00383) | `בּוּרְסִי II²` | not found in the hOCR | [150b · leaf 173](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$174/full/1400,/0/default.jpg) |

**Question.** No entry spelled `בּוּרְסִי` lacks a numeral. Is I printed on a neighbour, or is the gap Jastrow's?

  - [x] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: add to issue, likely a textual mistake


#### `בִּיאָה`: missing I (row [B00538](https://jastrow.app/#rid:B00538))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [B00537](https://jastrow.app/#rid:B00537) | alt `בִּיאָה` (of `בִּיָּא`) | `NUD, ND, TAB, ביוח (AND) + ae` | [158b · leaf 181](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$182/full/1400,/0/default.jpg) |
| [B00538](https://jastrow.app/#rid:B00538) | `בִּיאָה II` | not found in the hOCR | [159a · leaf 182](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$183/full/1400,/0/default.jpg) |

**Question.** Does print set I beside B00537 (on an alternate)? An alternate carries no name, so only the display changes.

  - [ ] yes, print sets I beside B00537
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: add to issue


#### `בַּנַּאי`: missing I (row [B00936](https://jastrow.app/#rid:B00936))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [B00935](https://jastrow.app/#rid:B00935) | `בַּנַּאי` | `אר בכ m. h.a. ch. ("22) builder, mason.` | [176b · leaf 199](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$200/full/1400,/0/default.jpg) |
| [B00936](https://jastrow.app/#rid:B00936) | `בַּנַּאי II` | `בנאי 11 FINI, a. "W237 ב'=) )34 .עס` | [176b · leaf 199](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$200/full/1400,/0/default.jpg) |

**Question.** Does print set I beside B00935? If it sits after `בַּנַּאי`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside B00935
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: add to research issue


#### `בְּרָא`: missing I (row [B01159](https://jastrow.app/#rid:B01159))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [B01154](https://jastrow.app/#rid:B01154) | alt `בְּרָא` (of `בַּר II`) | `,זזבר בְּרַא m. ch. (b. h, "2 poetic;` | [188b · leaf 211](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$212/full/1400,/0/default.jpg) |
| [B01157](https://jastrow.app/#rid:B01157) | `בָּרָא I` | not found in the hOCR | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| [B01159](https://jastrow.app/#rid:B01159) | `בְּרָא II` | not found in the hOCR | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| [B01237](https://jastrow.app/#rid:B01237) | alt `בְּרָא` (of `ברי`) | `:בל בְּרָא ch. same; 1) fo create. Targ.` | [192b · leaf 215](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$216/full/1400,/0/default.jpg) |

**Question.** Does print set I beside B01154 (on an alternate), B01237 (on an alternate)? An alternate carries no name, so only the display changes.

  - [ ] yes, print sets I beside B01154
  - [ ] yes, print sets I beside B01237
  - [x] no numeral beside any of them
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `גְּדוּדִית`: missing I (row [C00177](https://jastrow.app/#rid:C00177))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C00176](https://jastrow.app/#rid:C00176) | `גְּדוּדִית` | `בדודית .+ (dimin. of 393) small troop. Pl.` | [210b · leaf 233](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$234/full/1400,/0/default.jpg) |
| [C00177](https://jastrow.app/#rid:C00177) | `גְּדוּדִית II` | `גדודית 11 + נְדַגָּדד) cmp. Ps. LXV, 11)` | [210b · leaf 233](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$234/full/1400,/0/default.jpg) |

**Question.** Does print set I beside C00176? If it sits after `גְּדוּדִית`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside C00176
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: add to issue


#### `גִּיב`: missing I (row [C00610](https://jastrow.app/#rid:C00610))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C00609](https://jastrow.app/#rid:C00609) | `גִּיב` | not found in the hOCR | [234a · leaf 257](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$258/full/1400,/0/default.jpg) |
| [C00610](https://jastrow.app/#rid:C00610) | `גִּיב II` | `גיב ה m, (גַב=) back, top. Targ. Prov.` | [234a · leaf 257](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$258/full/1400,/0/default.jpg) |

**Question.** Does print set I beside C00609? If it sits after `גִּיב`, that entry gets `homograph` and a new name.

  - [x] yes, print sets I beside C00609
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: add to issue


#### `גִּיס`: missing I (row [C00773](https://jastrow.app/#rid:C00773))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C00773](https://jastrow.app/#rid:C00773) | `גִּיס II` | `O NAIL, ברכ m, (Os U1) intimate, familiar.` | [240a · leaf 263](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$264/full/1400,/0/default.jpg) |
| [C00774](https://jastrow.app/#rid:C00774) | `גִּיס II²` | `on IT m. (v. preced., emp. רסא 111(` | [240b · leaf 263](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$264/full/1400,/0/default.jpg) |

**Question.** No entry spelled `גִּיס` lacks a numeral. Is I printed on a neighbour, or is the gap Jastrow's?

  - [x] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: 


#### `גְּנַה`: missing I (row [C01130](https://jastrow.app/#rid:C01130))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C01130](https://jastrow.app/#rid:C01130) | `גְּנַה II` | `LL to cut, pass swiftly, Torg, Pe, VIII,` | [259a · leaf 282](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$283/full/1400,/0/default.jpg) |

**Question.** No entry spelled `גְּנַה` lacks a numeral. Is I printed on a neighbour, or is the gap Jastrow's?

  - [x] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: 1129 Already has I


#### `דִּי`: missing I (row [D00443](https://jastrow.app/#rid:D00443))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [D00002](https://jastrow.app/#rid:D00002) | alt `דִּי` (of `דְּ־`) | `quod), Targ. Gon, א ,וא ,42 Ib. 1X,` | [275a · leaf 298](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$299/full/1400,/0/default.jpg) |
| [D00442](https://jastrow.app/#rid:D00442) | `דִּי` | `ד" (hs. my, cmp. ;73 קפס to bh.` | [293b · leaf 316](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$317/full/1400,/0/default.jpg) |
| [D00443](https://jastrow.app/#rid:D00443) | `דִּי II` | `די ]1 האר for if. יצ BR. Hash.` | [293b · leaf 316](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$317/full/1400,/0/default.jpg) |

**Question.** Does print set I beside D00002 (on an alternate), D00442? If it sits after `דִּי`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside D00002
  - [ ] yes, print sets I beside D00442
  - [x] no numeral beside any of them
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: add to issue


#### `הִא`: missing I, II (row [E00008](https://jastrow.app/#rid:E00008))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [E00005](https://jastrow.app/#rid:E00005) | `הָא I` | not found in the hOCR | [327a · leaf 350](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$351/full/1400,/0/default.jpg) |
| [E00006](https://jastrow.app/#rid:E00006) | `הָא II` | `הא ₪ ]הא (v. preced.) an interjection, 1)` | [328a · leaf 351](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$352/full/1400,/0/default.jpg) |
| [E00007](https://jastrow.app/#rid:E00007) | `הֵא II` | `הא II, הא הא pr. n. m. 16-76.` | [328a · leaf 351](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$352/full/1400,/0/default.jpg) |
| [E00008](https://jastrow.app/#rid:E00008) | `הִא III` | `NT 111 name of a worm, v. 17.` | [328a · leaf 351](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$352/full/1400,/0/default.jpg) |

**Question.** No entry spelled `הִא` lacks a numeral. Is I, II printed on a neighbour, or is the gap Jastrow's?

  - [x] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: This is not a gap all numerals are present.  This is another case of looking at detector to see why this is flagged.


#### `הֲדָיָא`: missing I (row [E00114](https://jastrow.app/#rid:E00114))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [E00114](https://jastrow.app/#rid:E00114) | `הֲדָיָא II` | not found in the hOCR | [333a · leaf 356](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$357/full/1400,/0/default.jpg) |

**Question.** No entry spelled `הֲדָיָא` lacks a numeral. Is I printed on a neighbour, or is the gap Jastrow's?

  - [x] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: add to issue


#### `זְמַם`: missing II (row [G00527](https://jastrow.app/#rid:G00527))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [G00527](https://jastrow.app/#rid:G00527) | `זְמַם I` | `.וו .הרתורם orem fo be proven a falee` | [403b · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |
| [G00528](https://jastrow.app/#rid:G00528) | `זָמַם II` | `SET IL (emp. Ses) fo the wp, to` | [403b · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |
| [G00529](https://jastrow.app/#rid:G00529) | `זְמַם` | `os ch.-same, lo muscle. Targ. ¥. 11 Gen.` | [403b · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |
| [G00531](https://jastrow.app/#rid:G00531) | `זְמַם III` | not found in the hOCR | [403b · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |
| [G00533](https://jastrow.app/#rid:G00533) | `זְמָם II` | `DST 11 m. (ost 1( נש (v. (וסזם` | [403b · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |
| [G00534](https://jastrow.app/#rid:G00534) | `זְמַם²` | not found in the hOCR | [403b · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |

**Question.** Does print set II beside G00529, G00534? If it sits after `זְמַם`, `זְמַם`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets II beside G00529
  - [ ] yes, print sets II beside G00534
  - [x] no numeral beside any of them
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `חוּל`: missing I (row [H00321](https://jastrow.app/#rid:H00321))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00319](https://jastrow.app/#rid:H00319) | `חוּל` | `חול (b. l.; emp. 55m) [to turn around,` | [432b · leaf 455](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$456/full/1400,/0/default.jpg) |
| [H00320](https://jastrow.app/#rid:H00320) | `חוּל²` | `חול ch. same, 1) to dance. Part, >.` | [432b · leaf 455](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$456/full/1400,/0/default.jpg) |
| [H00321](https://jastrow.app/#rid:H00321) | `חוּל II` | `חול IL (v. mbm) to be smooth, quiet,` | [432b · leaf 455](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$456/full/1400,/0/default.jpg) |
| [H00322](https://jastrow.app/#rid:H00322) | `חוּל³` | `חול ch, same; to be smooth, lax ;` | [432b · leaf 455](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$456/full/1400,/0/default.jpg) |
| [H00323](https://jastrow.app/#rid:H00323) | `חוֹל I` | `I (, ןא חול 1 or חלל ;` | [433a · leaf 456](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$457/full/1400,/0/default.jpg) |

**Question.** Does print set I beside H00319, H00320, H00322? If it sits after `חוּל`, `חוּל`, `חוּל`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside H00319
  - [ ] yes, print sets I beside H00320
  - [ ] yes, print sets I beside H00322
  - [x] no numeral beside any of them
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `חוּצָה`: missing I (row [H00433](https://jastrow.app/#rid:H00433))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00432](https://jastrow.app/#rid:H00432) | `חוּצָה` | `חוצה .£ (b. hb.) חוץ-=(1 ;11 (followed by` | [438a · leaf 461](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$462/full/1400,/0/default.jpg) |
| [H00433](https://jastrow.app/#rid:H00433) | `חוּצָה II` | `חוצה II 5 (preced.) 1)=n2ix"n, outsider, stranger` | [438a · leaf 461](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$462/full/1400,/0/default.jpg) |

**Question.** Does print set I beside H00432? If it sits after `חוּצָה`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside H00432
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: add to issue


#### `חֵלֶף`: missing I (row [H01101](https://jastrow.app/#rid:H01101))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00780](https://jastrow.app/#rid:H00780) | alt `חֵלֶף` (of `חֵילֶף`) | `non, non m. (חלף) a species of salt` | [456b · leaf 479](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$480/full/1400,/0/default.jpg) |
| [H01099](https://jastrow.app/#rid:H01099) | `חֲלַף I` | `חלף 8 חליף ch. same, to pass by,` | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |
| [H01100](https://jastrow.app/#rid:H01100) | `חִלֶף I` | `חלף I m. (preced, wds.) 1) shoot. —` | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |
| [H01101](https://jastrow.app/#rid:H01101) | `חֵלֶף II` | `720 II m. (préced. wds.) reversion. Y. Sabb,` | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |

**Question.** Does print set I beside H00780 (on an alternate)? An alternate carries no name, so only the display changes.

  - [ ] yes, print sets I beside H00780
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `חֲמַר`: missing I, II (row [H01222](https://jastrow.app/#rid:H01222))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H01218](https://jastrow.app/#rid:H01218) | `חָמַר I` | `חמר 1 (emp. “3 1) to join; to` | [479b · leaf 502](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$503/full/1400,/0/default.jpg) |
| [H01219](https://jastrow.app/#rid:H01219) | `חֲמַר` | `Pa. "gi, Af. אַהסדר as preced. Hif.—Y. Shek,` | [479b · leaf 502](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$503/full/1400,/0/default.jpg) |
| [H01220](https://jastrow.app/#rid:H01220) | `חָמַר II` | `זמר זז .0( h.) [to be hot.) 1)` | [479b · leaf 502](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$503/full/1400,/0/default.jpg) |
| [H01221](https://jastrow.app/#rid:H01221) | `חֲמַר²` | `חמר ch. same, 1) to be hot, parched.` | [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |
| [H01222](https://jastrow.app/#rid:H01222) | `חֲמַר III` | `“VAM ITT, זַחְמַרָא (preced.) wine (b.h. V2). Targ.` | [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |
| [H01224](https://jastrow.app/#rid:H01224) | `חַמָּר I` | `WAM I m. ch. (v. V2 11; emp.` | [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |
| [H01225](https://jastrow.app/#rid:H01225) | `חַמָּר II` | `חמר IT m. h. (denom. of (חמור ass-driver,` | [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |

**Question.** Does print set I, II beside H01219, H01221? If it sits after `חֲמַר`, `חֲמַר`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I, II beside H01219
  - [ ] yes, print sets I, II beside H01221
  - [x] no numeral beside any of them
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: add to issue


#### `חַנִּין`: missing I (row [H01291](https://jastrow.app/#rid:H01291))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H01290](https://jastrow.app/#rid:H01290) | `חַנִּין` | not found in the hOCR | [483a · leaf 506](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$507/full/1400,/0/default.jpg) |
| [H01291](https://jastrow.app/#rid:H01291) | `חַנִּין II` | not found in the hOCR | [483a · leaf 506](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$507/full/1400,/0/default.jpg) |

**Question.** Does print set I beside H01290? If it sits after `חַנִּין`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside H01290
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `טְבַע`: missing I (row [I00081](https://jastrow.app/#rid:I00081))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [I00076](https://jastrow.app/#rid:I00076) | `טָבַע I` | `YA I (v. וג emp. מֶבָל I) 1)` | [518b · leaf 541](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$542/full/1400,/0/default.jpg) |
| [I00077](https://jastrow.app/#rid:I00077) | `טְבַע` | `מבע ch. same. Targ. Y. Gen. IV, 8.—'Targ.` | [518b · leaf 541](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$542/full/1400,/0/default.jpg) |
| [I00079](https://jastrow.app/#rid:I00079) | `טְבַע²` | not found in the hOCR | [519a · leaf 542](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$543/full/1400,/0/default.jpg) |
| [I00081](https://jastrow.app/#rid:I00081) | `טְבַע II` | `rg. Y. Gon. 22 (od. ררכטונא ; +.` | [519a · leaf 542](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$543/full/1400,/0/default.jpg) |

**Question.** Does print set I beside I00077, I00079? If it sits after `טְבַע`, `טְבַע`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside I00077
  - [ ] yes, print sets I beside I00079
  - [x] no numeral beside any of them
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `יָהּ`: missing I (row [J00113](https://jastrow.app/#rid:J00113))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [J00112](https://jastrow.app/#rid:J00112) | `יָהּ` | `FT" (v. bh.) Yah, abbreviation of the Tetragrammaton.` | [565b · leaf 588](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$589/full/1400,/0/default.jpg) |
| [J00113](https://jastrow.app/#rid:J00113) | `יָהּ II` | `"הז 11 (interj.) Oh! exclamation of distrem. Gen.` | [565b · leaf 588](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$589/full/1400,/0/default.jpg) |

**Question.** Does print set I beside J00112? If it sits after `יָהּ`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside J00112
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: add to issue


#### `יְתֵב`: missing I (row [J00713](https://jastrow.app/#rid:J00713))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [J00713](https://jastrow.app/#rid:J00713) | `יְתֵב II` | not found in the hOCR | [603a · leaf 626](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$627/full/1400,/0/default.jpg) |

**Question.** No entry spelled `יְתֵב` lacks a numeral. Is I printed on a neighbour, or is the gap Jastrow's?

  - [ ] the gap is Jastrow's own: nothing to fix
  - [x] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: 712 alternate


#### `יַתִּיר`: missing I (row [J00738](https://jastrow.app/#rid:J00738))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [J00737](https://jastrow.app/#rid:J00737) | alt `יְתֵיר׳` (of `יַתִּור I`) | `TENT, NYE m., ירא RETA יתיר' +` | [604a · leaf 627](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$628/full/1400,/0/default.jpg) |
| [J00738](https://jastrow.app/#rid:J00738) | `יַתִּיר II` | `יפיר 11 pr. n. pl. Yattir, v. spy.` | [604a · leaf 627](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$628/full/1400,/0/default.jpg) |

**Question.** No entry spelled `יַתִּיר` lacks a numeral. Is I printed on a neighbour, or is the gap Jastrow's?

  - [ ] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: 737 contains an ocr error the correct spelling for the primary headword is yod not a vav
  - applied 2026-10-09: P000360 sets J00737 `יַתִּור I` → `יַתִּיר I`, the stored bytes of J00738 (ruling `10-09 link key`); the 2 links naming Sefaria's spelling still resolve to J00737


### X8 Volume 2: no numeral read (17)

ABBYY reads stored numerals 88% of the time, but not on these lines: the unnumbered sibling's line is not found, garbled, or not clean enough to call.

#### `סְלִיקוּסְתָּא`: missing I (row [O00995](https://jastrow.app/#rid:O00995))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [O00994](https://jastrow.app/#rid:O00994) | `סְלִיקוּסְתָּא` | `J^t^p^D f. (Pales of pbp, by false etymology` | [995a · leaf 318](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$319/full/1400,/0/default.jpg) |
| [O00995](https://jastrow.app/#rid:O00995) | `סְלִיקוּסְתָּא II` | `^P^bDlI f. (Pales of pbp) refuse of boiled` | [995a · leaf 318](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$319/full/1400,/0/default.jpg) |

**Question.** Does print set I beside O00994? If it sits after `סְלִיקוּסְתָּא`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside O00994
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: add to issue


#### `פְּלוּגְתָּא`: missing I (row [Q00965](https://jastrow.app/#rid:Q00965))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [Q00964](https://jastrow.app/#rid:Q00964) | `פְּלוּגְתָּא` | `ffsTUIx1!;, 3 >if ch.same, l)=ii}\ti?separation (of races).` | [1177a · leaf 500](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$501/full/1400,/0/default.jpg) |
| [Q00965](https://jastrow.app/#rid:Q00965) | `פְּלוּגְתָּא II` | `SrU* ^? II, HP Jfi >5 pr. n.` | [1177b · leaf 500](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$501/full/1400,/0/default.jpg) |

**Question.** Does print set I beside Q00964? If it sits after `פְּלוּגְתָּא`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside Q00964
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: add to issue


#### `פַּפָּא`: missing I (row [Q01399](https://jastrow.app/#rid:Q01399))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [Q01398](https://jastrow.app/#rid:Q01398) | `פַּפָּא` | `SSD (tradit. pronunc. SBE) pr. n. m. Pappa` | [1203b · leaf 526](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$527/full/1400,/0/default.jpg) |
| [Q01399](https://jastrow.app/#rid:Q01399) | `פַּפָּא II` | `Xr £ II, B ™lj [m pr. n.` | [1203b · leaf 526](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$527/full/1400,/0/default.jpg) |

**Question.** Does print set I beside Q01398? If it sits after `פַּפָּא`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside Q01398
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: add to issue


#### `קוּלְיָא`: missing I (row [S00337](https://jastrow.app/#rid:S00337))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [S00336](https://jastrow.app/#rid:S00336) | `קוּלְיָא` | `fcVylp, lp m. ("hp II) parched grain; flour` | [1328a · leaf 651](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$652/full/1400,/0/default.jpg) |
| [S00337](https://jastrow.app/#rid:S00337) | `קוּלְיָא II` | `fcv"*p II, PS yp m. (preced.) ashes of` | [1328a · leaf 651](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$652/full/1400,/0/default.jpg) |

**Question.** Does print set I beside S00336? If it sits after `קוּלְיָא`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside S00336
  - [x] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: add to issue


#### `שְׁבַע`: missing I (row [U00158](https://jastrow.app/#rid:U00158))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U00156](https://jastrow.app/#rid:U00156) | `שְׁבַע` | `?2ti i, Krtej f, asntf, rratf, '£ ,` | [1515b · leaf 838](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$839/full/1400,/0/default.jpg) |
| [U00158](https://jastrow.app/#rid:U00158) | `שְׁבַע II` | `3?Dp II ch., Ithpa. VSBMM, It hpe. 5BTBX` | [1515b · leaf 838](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$839/full/1400,/0/default.jpg) |
| [U00159](https://jastrow.app/#rid:U00159) | `שָׂבֵעַ I` | `•Zl^ I, m. (b.h, ; next w.) sated,` | [1516a · leaf 839](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$840/full/1400,/0/default.jpg) |

**Question.** Does print set I beside U00156? If it sits after `שְׁבַע`, that entry gets `homograph` and a new name.

  - [x] yes, print sets I beside U00156
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `שַׁחְפָּא`: missing I (row [U00683](https://jastrow.app/#rid:U00683))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U00682](https://jastrow.app/#rid:U00682) | `שַׁחְפָּא` | `t : — » t:— - -• i` | [1549b · leaf 872](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$873/full/1400,/0/default.jpg) |
| [U00683](https://jastrow.app/#rid:U00683) | `שַׁחְפָּא II` | `SSHlp II m. (Cjno I) rubbish.— PI. ■■bto.` | [1549b · leaf 872](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$873/full/1400,/0/default.jpg) |

**Question.** Does print set I beside U00682? If it sits after `שַׁחְפָּא`, that entry gets `homograph` and a new name.

  - [x] yes, print sets I beside U00682
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `שְׁיָירָא`: missing II (row [U00910](https://jastrow.app/#rid:U00910))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U00910](https://jastrow.app/#rid:U00910) | `שְׁיָירָא I` | `H1ni^j I ch. same. Targ. Y. I Deut.` | [1561b · leaf 884](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$885/full/1400,/0/default.jpg) |
| [U00911](https://jastrow.app/#rid:U00911) | `שְׁיָירָא` | `fcn^ti IT, rTT^j I f. fiitt; b. h.` | [1562a · leaf 885](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$886/full/1400,/0/default.jpg) |
| [U00912](https://jastrow.app/#rid:U00912) | alt `שְׁיָירָא III` (of `שְׁיָירָה`) | `m^ttj II, feH^ti III f. (v. ^) blood-relations,` | [1562a · leaf 885](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$886/full/1400,/0/default.jpg) |
| [U00914](https://jastrow.app/#rid:U00914) | alt `שְׁיָירָא` (of `שְׁיַירְתָּא`) | `mryQ, nrrr'4 "!?$> ^T% s"3'4 =` | [1562a · leaf 885](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$886/full/1400,/0/default.jpg) |

**Question.** Does print set II beside U00911, U00914 (on an alternate)? If it sits after `שְׁיָירָא`, that entry gets `homograph` and a new name.

  - [x] yes, print sets II beside U00911
  - [ ] yes, print sets II beside U00914
  - [ ] no numeral beside any of them
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `שִׁיפָה`: missing I (row [U01007](https://jastrow.app/#rid:U01007))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01000](https://jastrow.app/#rid:U01000) | alt `שִׁיפָה` (of `שִׁיף`) | `EfTD m., n3*w f. (r«j II) rubbed of,` | [1565b · leaf 888](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$889/full/1400,/0/default.jpg) |
| [U01006](https://jastrow.app/#rid:U01006) | `שִׁיפָה` | `T • T •` | [1565b · leaf 888](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$889/full/1400,/0/default.jpg) |
| [U01007](https://jastrow.app/#rid:U01007) | `שִׁיפָה II` | not found in the hOCR | [1565b · leaf 888](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$889/full/1400,/0/default.jpg) |
| [U01008](https://jastrow.app/#rid:U01008) | `שִׁיפָה²` | not found in the hOCR | [1566a · leaf 889](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$890/full/1400,/0/default.jpg) |

**Question.** Does print set I beside U01000 (on an alternate), U01006, U01008? If it sits after `שִׁיפָה`, `שִׁיפָה`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside U01000
  - [x] yes, print sets I beside U01006
  - [ ] yes, print sets I beside U01008
  - [ ] no numeral beside any of them
  - [x] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 1008 is III


#### `שֵׁיצָיוּ`: missing I (row [U01036](https://jastrow.app/#rid:U01036))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01035](https://jastrow.app/#rid:U01035) | alt `שֵׁיצָיוּ` (of `שֵׁיצְיוּ`) | `1 '1 «, • J. - 1 Nk` | [1567b · leaf 890](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$891/full/1400,/0/default.jpg) |
| [U01036](https://jastrow.app/#rid:U01036) | `שֵׁיצָיוּ II` | `1 J» w II (preced.) pr. n. pi.` | [1567b · leaf 890](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$891/full/1400,/0/default.jpg) |

**Question.** Does print set I beside U01035 (on an alternate)? An alternate carries no name, so only the display changes.

  - [x] yes, print sets I beside U01035
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `שְׁכַח`: missing I (row [U01139](https://jastrow.app/#rid:U01139))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01138](https://jastrow.app/#rid:U01138) | `שְׁכַח` | `Pa. ndra same. Y. Erub. I, 18d top` | [1572a · leaf 895](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$896/full/1400,/0/default.jpg) |
| [U01139](https://jastrow.app/#rid:U01139) | `שְׁכַח II` | `rptD II, Af. ndrax (ndran) (preced.) [to uncover,]` | [1572b · leaf 895](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$896/full/1400,/0/default.jpg) |

**Question.** Does print set I beside U01138? If it sits after `שְׁכַח`, that entry gets `homograph` and a new name.

  - [x] yes, print sets I beside U01138
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `שָׁנָה`: missing I (row [U01571](https://jastrow.app/#rid:U01571))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01570](https://jastrow.app/#rid:U01570) | `שָׁנָה` | not found in the hOCR | [1604b · leaf 927](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$928/full/1400,/0/default.jpg) |
| [U01571](https://jastrow.app/#rid:U01571) | `שָׁנָה II` | `HDID II f. (b. h.; y$i, v. Halevy,` | [1604b · leaf 927](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$928/full/1400,/0/default.jpg) |
| [U01585](https://jastrow.app/#rid:U01585) | alt `שָׁנָה` (of `שני`) | `- w, ( i» w1 (b.h.) 1) to` | [1605a · leaf 928](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$929/full/1400,/0/default.jpg) |

**Question.** Does print set I beside U01570, U01585 (on an alternate)? If it sits after `שָׁנָה`, that entry gets `homograph` and a new name.

  - [x] yes, print sets I beside U01570
  - [ ] yes, print sets I beside U01585
  - [ ] no numeral beside any of them
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `שָׁעָה`: missing I (row [U01635](https://jastrow.app/#rid:U01635))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01634](https://jastrow.app/#rid:U01634) | `שָׁעָה` | not found in the hOCR | [1609b · leaf 932](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$933/full/1400,/0/default.jpg) |
| [U01635](https://jastrow.app/#rid:U01635) | `שָׁעָה II` | `TV w II f. (Dan. IV, 16; preced.,` | [1609b · leaf 932](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$933/full/1400,/0/default.jpg) |
| [U01652](https://jastrow.app/#rid:U01652) | alt `שָׁעָה` (of `שעי`) | `n2?l£!, TTJND (b. h.) 1) (cmp.nsia, nnia) to` | [1610b · leaf 933](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$934/full/1400,/0/default.jpg) |
| [U01699](https://jastrow.app/#rid:U01699) | alt `שָׁעָה` (of `שַׁעְתָּא`) | `wW,»n^,^(n^) f.=h. twa, ^,` | [1613a · leaf 936](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$937/full/1400,/0/default.jpg) |

**Question.** Does print set I beside U01634, U01652 (on an alternate), U01699 (on an alternate)? If it sits after `שָׁעָה`, that entry gets `homograph` and a new name.

  - [x] yes, print sets I beside U01634
  - [ ] yes, print sets I beside U01652
  - [ ] yes, print sets I beside U01699
  - [ ] no numeral beside any of them
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `שְׂרַף`: missing I (row [U02013](https://jastrow.app/#rid:U02013))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U02003](https://jastrow.app/#rid:U02003) | `שָׂרַף I` | `•^PID I (b. h.; onomatop.) [to sip, absorb,` | [1632b · leaf 955](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$956/full/1400,/0/default.jpg) |
| [U02004](https://jastrow.app/#rid:U02004) | `שְׂרַף` | `^"Ip ch. same. Targ. O. Gen. XI, 3` | [1632b · leaf 955](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$956/full/1400,/0/default.jpg) |
| [U02006](https://jastrow.app/#rid:U02006) | `שְׂרַף²` | `*)H web. same. Naz.361' CJWTB rvb r—r Kpi` | [1633a · leaf 956](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$957/full/1400,/0/default.jpg) |
| [U02008](https://jastrow.app/#rid:U02008) | `שָׂרָף I` | `I T t ^ ^b# h> ""--J ^` | [1633a · leaf 956](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$957/full/1400,/0/default.jpg) |
| [U02013](https://jastrow.app/#rid:U02013) | `שְׂרַף II` | `l-*l I-I cb.same, esp.balsam. Targ. Y. Gen. XXXVII,` | [1633b · leaf 956](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$957/full/1400,/0/default.jpg) |

**Question.** Does print set I beside U02004, U02006? If it sits after `שְׂרַף`, `שְׂרַף`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside U02004
  - [ ] yes, print sets I beside U02006
  - [x] no numeral beside any of them
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `שַׁתְיָא`: missing I (row [U02098](https://jastrow.app/#rid:U02098))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U02097](https://jastrow.app/#rid:U02097) | `שַׁתְיָא` | not found in the hOCR | [1637b · leaf 960](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$961/full/1400,/0/default.jpg) |
| [U02098](https://jastrow.app/#rid:U02098) | `שַׁתְיָא II` | `NTIIS II f. <= h. hJW^ II, foundation.` | [1638a · leaf 961](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$962/full/1400,/0/default.jpg) |

**Question.** Does print set I beside U02097? If it sits after `שַׁתְיָא`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside U02097
  - [ ] no numeral beside it
  - [x] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: The I sits on the alt of 2097 (side note, looks like it got misplaced into gloss)


#### `תּוּף`: missing I (row [V00255](https://jastrow.app/#rid:V00255))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [V00254](https://jastrow.app/#rid:V00254) | `תּוּף` | not found in the hOCR | [1655a · leaf 978](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$979/full/1400,/0/default.jpg) |
| [V00255](https://jastrow.app/#rid:V00255) | `תּוּף II` | `Spfl II m. (r~ II) spittle. Keth. 61b` | [1655a · leaf 978](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$979/full/1400,/0/default.jpg) |

**Question.** Does print set I beside V00254? If it sits after `תּוּף`, that entry gets `homograph` and a new name.

  - [x] yes, print sets I beside V00254
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: looks like the I ended up in gloss


#### `תַּכָּא`: missing I (row [V00523](https://jastrow.app/#rid:V00523))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [V00522](https://jastrow.app/#rid:V00522) | alt `תַּכָּא` (of `תֻּכָּא`) | not found in the hOCR | [1667b · leaf 990](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$991/full/1400,/0/default.jpg) |
| [V00523](https://jastrow.app/#rid:V00523) | `תַּכָּא II` | `KVi'Fj II m. (v. preced. art.; cmp. Assyr.` | [1667b · leaf 990](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$991/full/1400,/0/default.jpg) |

**Question.** Does print set I beside V00522 (on an alternate)? An alternate carries no name, so only the display changes.

  - [x] yes, print sets I beside V00522
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: the I landed in gloss along with the alt headwords closing )


#### `תָּפַח`: missing II (row [V00808](https://jastrow.app/#rid:V00808))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [V00808](https://jastrow.app/#rid:V00808) | `תָּפַח I` | `n£r. I (Tafel of riBl) to be blown` | [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |
| [V00809](https://jastrow.app/#rid:V00809) | `תָּפַח` | not found in the hOCR | [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |
| [V00810](https://jastrow.app/#rid:V00810) | `תָּפַח III` | `nCvl III — PEB II , to drip,` | [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |
| [V00812](https://jastrow.app/#rid:V00812) | `תְּפַח II` | `TOPl II, Ithpe. nsnx, Ithpa. PBPX (v. PEi;` | [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |

**Question.** Does print set II beside V00809? If it sits after `תָּפַח`, that entry gets `homograph` and a new name.

  - [x] yes, print sets II beside V00809
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


### X8 One-off questions (5)

Each needs its own look; the question says what.

#### `מַזֶּה`: missing I (row [M00725](https://jastrow.app/#rid:M00725))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [M00724](https://jastrow.app/#rid:M00724) | `מַוֶּה I` | not found in the hOCR | [753b · leaf 76](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$77/full/1400,/0/default.jpg) |
| [M00725](https://jastrow.app/#rid:M00725) | `מַזֶּה II` | `t nU II m. (!it:) the priest appointed` | [753b · leaf 76](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$77/full/1400,/0/default.jpg) |

**Question.** M00724 is stored `מַוֶּה I` (vav) and glossed `= מַה זֶה` (what is this?). Is the print `מַזֶּה I` (zayin)? If so M00724's headword and name change (a glyph correction, HW-ocr-dalet) and this family is complete. ABBYY cannot show the glyph, so the scan decides.

  - [ ] nothing to fix: the gap is Jastrow's own
  - [x] there is a fix (say what print shows in the note)
  - [ ] can't tell from the scan
  - note: as you thought, ocr error correct letter is zayin
  - applied 2026-10-09: P000359 sets M00724 `מַוֶּה I` → `מַזֶּה I`, the stored bytes of M00725 (ruling `10-09 link key`); the 1 link naming Sefaria's spelling still resolves to M00724


#### `פַּנְיָא`: missing I, II (row [Q01193](https://jastrow.app/#rid:Q01193))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [Q01191](https://jastrow.app/#rid:Q01191) | alt `פַּנְיָא` (of `פְּנֵי II`) | `":s n, ■»» m., arsg (rns) i c.=h.` | [1189a · leaf 512](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$513/full/1400,/0/default.jpg) |
| [Q01192](https://jastrow.app/#rid:Q01192) | `פַּנְיָא` | `2tf*^*> S"j3 II m. CIS; sub X»Oin or` | [1189a · leaf 512](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$513/full/1400,/0/default.jpg) |
| [Q01193](https://jastrow.app/#rid:Q01193) | `פַּנְיָא III` | `S*25 III pr. n. 'B lfi3 AT'Aar (Cano/` | [1189a · leaf 512](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$513/full/1400,/0/default.jpg) |

**Question.** Q01191 numbers its primary `פְּנֵי II` and sets `I` after the bracketed `(פַּנְיָה)`; Q01192 holds `פַּנְיָיא II`. Which entry is `פַּנְיָא I` in print?

  - [x] nothing to fix: the gap is Jastrow's own
  - [ ] there is a fix (say what print shows in the note)
  - [ ] can't tell from the scan
  - note: 


#### `קָרָחָא`: missing I (row [S01975](https://jastrow.app/#rid:S01975))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [S01973](https://jastrow.app/#rid:S01973) | alt `קָרָחָא` (of `קְרַח II`) | `nnpii^rnpi, srnpm. i)=h.n^p,v.nipch.-` | [1415b · leaf 738](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$739/full/1400,/0/default.jpg) |
| [S01974](https://jastrow.app/#rid:S01974) | `קַרְחָא II` | `Snip II, ^nip I m.=b.h. nip, frost, ice,` | [1415b · leaf 738](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$739/full/1400,/0/default.jpg) |
| [S01975](https://jastrow.app/#rid:S01975) | `קָרָחָא II` | `Strip II, Pimp m. (fiip I) [scraper, wool-dresser;` | [1415b · leaf 738](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$739/full/1400,/0/default.jpg) |

**Question.** S01973's `I` sits mid-line on `קַרְחָא`, not on its third form `קָרָחָא`. Is `קָרָחָא` numbered I anywhere in print, or is the gap Jastrow's?

  - [x] nothing to fix: the gap is Jastrow's own
  - [ ] there is a fix (say what print shows in the note)
  - [ ] can't tell from the scan
  - note: 


#### `רוּם`: missing I (row [T00376](https://jastrow.app/#rid:T00376))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [T00374](https://jastrow.app/#rid:T00374) | `רוּם` | `D!D,D"H (b.h.) [to swing,] to be high, lifted` | [1460a · leaf 783](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$784/full/1400,/0/default.jpg) |
| [T00375](https://jastrow.app/#rid:T00375) | `רוּם²` | `WT\t D"H ch. same, to be high. Targ.Ps.` | [1460a · leaf 783](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$784/full/1400,/0/default.jpg) |
| [T00376](https://jastrow.app/#rid:T00376) | `רוּם II` | `UT\ II, Din m. (b.h; preced.) height. Ber.` | [1460b · leaf 783](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$784/full/1400,/0/default.jpg) |
| [T00377](https://jastrow.app/#rid:T00377) | `רוּם³` | `D^TU^ETl I ch. same, I) height. Targ. Y.` | [1460b · leaf 783](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$784/full/1400,/0/default.jpg) |

**Question.** T00377's `I` sits on its alternate `רוּמָא` and numbers that word, not `רוּם`. The verb T00374 `רוּם, רִים` shows no numeral in the hOCR. Is `רוּם I` printed anywhere, or did Jastrow number II alone?

  - [x] nothing to fix: the gap is Jastrow's own
  - [ ] there is a fix (say what print shows in the note)
  - [ ] can't tell from the scan
  - note: 


#### `שִׁלְשֵׁל`: missing I (row [U01397](https://jastrow.app/#rid:U01397))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01396](https://jastrow.app/#rid:U01396) | `שִׁלְשֵׁל` | `*I5"'w, '**',!" I, (apocop.) ETil" (Vri I) to` | [1589b · leaf 912](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$913/full/1400,/0/default.jpg) |
| [U01397](https://jastrow.app/#rid:U01397) | `שִׁלְשֵׁל II` | `5J2J52J II (cmp. bVr I) 1) to chain,` | [1589b · leaf 912](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$913/full/1400,/0/default.jpg) |
| [U01398](https://jastrow.app/#rid:U01398) | `שַׁלְשֵׁל I` | `y^yi I ch. same.` | [1589b · leaf 912](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$913/full/1400,/0/default.jpg) |

**Question.** The hOCR sets `I` after the second form, the abbreviation `שִׁילְ׳`, not after `שִׁלְשֵׁל`. If the numeral numbers the entry, U01396 gets `homograph: 1` on `headwords[0]` and its name becomes `שִׁלְשֵׁל I`. If it belongs to the abbreviation (HW-roman: it stays where print sets it), it goes on that alternate and the name does not change.

  - [x] nothing to fix: the gap is Jastrow's own
  - [ ] there is a fix (say what print shows in the note)
  - [ ] can't tell from the scan
  - note: 


## Pile B: fix determinable (11)

In each family the hOCR (volume 2, ABBYY) reads the missing numeral right after the first form of an unnumbered sibling, and reads the family's stored numeral beside its numbered member on the same pages, so the page read is checked against the data. Sefaria dropped the numeral; the fix restores it as `homograph` on `headwords[0]` with the numeral after `{0}` in `display`. That changes the sibling's name, so it must land before go-live. Open the scan to confirm, then tick a box in the answers under the table.

| | change | now | proposed | hOCR, verbatim | scan |
|---|---|---|---|---|---|
| | [U00378](https://jastrow.app/#rid:U00378) | `שׁוֹט` | `homograph: 1`, name `שׁוֹט I` | `"3TJ3 I, T2"i w*E w pr.n.pl. Shot-Mishot, Samosata,`; family check [U00379](https://jastrow.app/#rid:U00379): `ETiCj II m. (b.h.; MRS I) rod, scourge.` | [1531b · leaf 854](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$855/full/1400,/0/default.jpg) |
| | [U00488](https://jastrow.app/#rid:U00488) | `שׁוּף` | `homograph: 1`, name `שׁוּף I` | `^1123 I(b.h.;= C]ti3) to blow. Num. E.s. 5,`; family check [U00490](https://jastrow.app/#rid:U00490): `^fllD II \)to smooth, rub, polish, sharpen; to` | [1538b · leaf 861](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$862/full/1400,/0/default.jpg) |
| | [U00524](https://jastrow.app/#rid:U00524) | `שׁוּקָא` | `homograph: 1`, name `שׁוּקָא I` | `Xj^lEJ I, nj5!HDf.=h.pralI, desire, pleasure, satis-`; family check [U00525](https://jastrow.app/#rid:U00525): `kSp'liL1 II m. = h. pl'tf III, market,` | [1541a · leaf 864](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$865/full/1400,/0/default.jpg) |
| | [U00627](https://jastrow.app/#rid:U00627) | `שָׁחוֹר` | `homograph: 1`, name `שָׁחוֹר I` | `Tjrrcj I m., rnlni^ f. (b.h.; TjiB H)`; family check [U00628](https://jastrow.app/#rid:U00628): `i IMUj II m. (irns I) hair-pinchers; (oth.` | [1546a · leaf 869](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$870/full/1400,/0/default.jpg) |
| | [U00820](https://jastrow.app/#rid:U00820) | `שִׁידָּא` | `homograph: 1`, name `שִׁידָּא I` | `SS^tT I, ST£J m. (cmp. T>, a. W$ty`; family check [U00821](https://jastrow.app/#rid:U00821): `S^nD II m. (v. next w.) chest, box.` | [1558a · leaf 881](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$882/full/1400,/0/default.jpg) |
| | [U01268](https://jastrow.app/#rid:U01268) | `שֶׁלַח` | `homograph: 2`, name `שֶׁלַח II` | `nb£J II (rnbtS) m. (nVo) [stripped of its`; family check [U01267](https://jastrow.app/#rid:U01267): `H!*up I m. (preced.) hide, fresh skin. Makhsh.` | [1580b · leaf 903](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$904/full/1400,/0/default.jpg) |
| | [U01348](https://jastrow.app/#rid:U01348) | `שָׁלֵם` | `homograph: 1`, name `שָׁלֵם I` | `Dv — I, D**«T (b. h.) Jo be`; family check [U01350](https://jastrow.app/#rid:U01350): `«- II m. (b. h.: preced.) whole, complete.` | [1585b · leaf 908](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$909/full/1400,/0/default.jpg) |
| | [U01772](https://jastrow.app/#rid:U01772) | `שְׁפַל` | `homograph: 1`, name `שְׁפַל I` | `2DID I, * £uJ ch. same, to fall`; family check [U01774](https://jastrow.app/#rid:U01774): `bSDCJ II ch. same, lowly. Targ. Prov. XVI,` | [1617b · leaf 940](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$941/full/1400,/0/default.jpg) |
| | [U02021](https://jastrow.app/#rid:U02021) | `שְׁרַק` | `homograph: 1`, name `שְׁרַק I` | `pTip I, p"1"]^? ch.same. Targ.Lam.II,15, sq. Targ.`; family check [U02022](https://jastrow.app/#rid:U02022): `p"W 11 = re, to glide, slide. Nidd.3b` | [1634a · leaf 957](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$958/full/1400,/0/default.jpg) |
| | [V00743](https://jastrow.app/#rid:V00743) | `תְּנֵי` | `homograph: 1`, name `תְּנֵי I` | `V>*. I' ^V*. ch- 8ame' ^ to rePeat,`; family check [V00744](https://jastrow.app/#rid:V00744): `"071 II (cmp. *\|3ia) to be pointed, sharp.` | [1681b · leaf 1004](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1005/full/1400,/0/default.jpg) |
| | [V00844](https://jastrow.app/#rid:V00844) | `תְּפַס` | `homograph: 1`, name `תְּפַס I` | `DDri I, JD^ri ch. same, to seize, catch.`; family check [V00845](https://jastrow.app/#rid:V00845): `OSDri II (sec. r. of b^E) to break;` | [1688b · leaf 1011](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1012/full/1400,/0/default.jpg) |

**Your answers** (tick one per row):

- **U00378**: `שׁוֹט` becomes `שׁוֹט I`
  - [x] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U00488**: `שׁוּף` becomes `שׁוּף I`
  - [x] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U00524**: `שׁוּקָא` becomes `שׁוּקָא I`
  - [x] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U00627**: `שָׁחוֹר` becomes `שָׁחוֹר I`
  - [x] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U00820**: `שִׁידָּא` becomes `שִׁידָּא I`
  - [x] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U01268**: `שֶׁלַח` becomes `שֶׁלַח II`
  - [x] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U01348**: `שָׁלֵם` becomes `שָׁלֵם I`
  - [x] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U01772**: `שְׁפַל` becomes `שְׁפַל I`
  - [x] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U02021**: `שְׁרַק` becomes `שְׁרַק I`
  - [x] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **V00743**: `תְּנֵי` becomes `תְּנֵי I`
  - [x] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **V00844**: `תְּפַס` becomes `תְּפַס I`
  - [x] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


Every proposed name was checked against all 32,512 current names with
`nameKey`; none is taken. All 11 sit in ש and ת (pages 1531–1688), and
in each the print sets the numeral right after the first form.
Why the drops cluster there was not traced.

Notes on two rows:

- **U00488.** Taking it frees the bare name `שׁוּף`, which U00489
  (#113) can then hold with no mark, as print sets it. See
  [the five X1 and #113 rids](#the-five-x1-and-113-rids).
- **U01268.** Its `display` is unset today. The same hOCR line also
  settles the layout: `{0} II ({1})`.

## The five X1 and #113 rids

J00321 and J00327 are the two X1 primary rows. V00518, S01780 and
U00489 are the rids still open in
[#113](https://github.com/UniquePixels/jastrow/issues/113); the report
flags them on their alternates only, so they are not among the 382.

| rid | stored | hOCR, verbatim | scan | pile |
|---|---|---|---|---|
| [J00321](https://jastrow.app/#rid:J00321) | `ַיי` | `I, נְכְּהָיי=פָיר band; v. ביר .לור` | [576a · leaf 599](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$600/full/1400,/0/default.jpg) | A, HW-prefix (ending entry) |
| [J00327](https://jastrow.app/#rid:J00327) | `ַיְידָא` | `NT` then `=9 ve RT 8. TMD.` | [576a · leaf 599](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$600/full/1400,/0/default.jpg) | A, HW-prefix (ending entry) |
| [V00518](https://jastrow.app/#rid:V00518) | `תִּישַׁע`, `ת`, `ּשַׁע` | `ptfft` then `V. S1DF1 ch.` | [1667a · leaf 990](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$991/full/1400,/0/default.jpg) | D |
| [S01780](https://jastrow.app/#rid:S01780) | `קֵץ²`, `קִצ`, `ּא`, `קִי׳` | `>, 5S22p, "p ch. same. Targ. 0. Gen. VI, 13. Targ.` | [1404a · leaf 727](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$728/full/1400,/0/default.jpg) | D |
| [U00489](https://jastrow.app/#rid:U00489) | `ש`, `ׁוּף` | `*\|1EJ ch. same, 1) to blow. Gen. E. s. 2 . .` | [1538b · leaf 861](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$862/full/1400,/0/default.jpg) | C |

**Your answer for U00489** (its primary is stored as the single letter `ש`; the hOCR shows no numeral on its line):

- **U00489**
  - [x] print's headword is `שׁוּף` with no numeral or superscript
  - [ ] print shows a numeral or superscript on it (write it in the note)
  - [ ] can't tell from the scan
  - note: 

- **J00321, J00327.** Ending entries, the mirror of the maqaf prefixes;
  HW-prefix names both. J00321's line is the one whose gloss reads
  `כַּיי = כְּהַיי`, and the leading `I,` is the bare patah read as a
  letter. J00327's line is illegible. The name keeps the leading vowel.

321 headword is an underline (representing any letter), with a patah under it followed by yod yod
327 headword is similar an underline (representing any letter), with a patah under it followed by yod yod dalet alef

Note that in printe the underline is fairly long like about 3 character width, but it represents one letter placeholder

  
- **V00518.** The line sits between `תִּישּׁוּעַ` and `תִּיתוּרָא` and has
  the shape of your print reading `תִּישַׁע, v. תְּשַׁע ch.` The fix
  moves `v. תְּשַׁע` into the gloss and drops the two fragments. The
  primary stays `תִּישַׁע`, so the name does not change.

  Correct
  
- **S01780.** The hOCR sets no Roman numeral: the line reads as
  `קֵץ, קִצָּא, קִי׳ ch. same`. The `²` is Sefaria's disambiguator from
  S01779 `קֵץ`, and the name needs it either way. The fragments are
  alternates; their spelling is print work that changes no name.

heir spelling is print work - what you have are the correct spellings: קִצָּא, קִי׳

- [ ] **U00489.** The text is determinable: `ש` + `ׁוּף` joins byte for
  byte to `שׁוּף` (#113), as Q00752's join did. The hOCR shows no
  numeral after it (`ch. same` follows the headword). The mark is the
  question. If you take pile B's U00488 row (`שׁוּף` → `שׁוּף I`), the
  bare name `שׁוּף` is free and U00489 can take it with no mark, as
  print sets it. If not, U00489 needs a disambiguator; U00491 already
  holds `²`. Which?

I am not sure what you are asking here

## Pile A: ruled legitimate (286)

Each row is a shape a ruling keeps as printed, or a family whose
numbering the hOCR confirms. The predicate column says what was checked
on every row, so a count that matches a ruling is not the only proof.

| Shape | Ruling | Predicate checked on each row | Rows |
|---|---|---|---|
| H6 | HW-phrase-hw | multi-word primary with no abbreviation, gloss a cross-reference | 3 |
| H6 | HW-abbrev-primary | multi-word primary holding a `׳` word; form is `partial` | 3 |
| X1 | HW-prefix (endings) | primary opens with a bare vowel point; gloss a cross-reference | 2 |
| X5 | HW-prefix | ends in a maqaf; gloss calls it a prefix, formative, article or contraction | 36 |
| X5 | HW-prefix (count) | ends in a maqaf; gloss is a cross-reference to the free form, a `read:` correction, or `only with suffix` | 76 |
| X5 | HW-prefix (count) | two words joined by a maqaf, B00761 `בית־יוני` | 1 |
| X7 | HW-acronyms | holds gershayim (`״` or `"`) | 68 |
| X7 | HW-acronyms | one letter and a geresh: a numeral letter | 21 |
| X7 | HW-truncated | two or more letters ending in a geresh, no gershayim | 34 |
| X8 | HW-roman | the missing numeral is stored on another form of an unnumbered sibling's own entry | 39 |
| X8 | print (hOCR) | the hOCR shows the stored numerals, and no numeral beside the unnumbered sibling | 3 |

**Reconciliation against the counts the rulings quote.**

- **HW-prefix, 144 rows.** Today: X5 115 primary + 27 alternate + the
  2 X1 endings = 144. It matches, but the ruling's prose names
  prefixes and endings, and only 36 of the 115 primaries are prefixes.
  76 are bound forms (`חֲבֵיר־, v. חָבֵר`: the stem before a suffix)
  and one is a maqaf compound. The ruling's own count ("115
  headwords") is the whole X5 population, so it covered them; the
  wording does not (ledger L37). B00761's hOCR, `,ביתחיוני .+ “0h 3).`,
  shows no gap between the two words, as a maqaf would. The 2 X5 rows
  in pile C are D00616 (a maqaf mid-word) and S01339 (a noun ending in
  one).
- **HW-acronyms, 99 rows.** Today: 68 primary + 10 alternate
  gershayim acronyms = 78, and 21 numeral letters: 99. Letter names
  such as `אל״ף` and `בי״ת` are among the 78.
- **HW-truncated, 34 rows.** 34 primaries. This ruling is no longer
  in `decisions.md`: the 2026-09-22 prune moved it to
  [`archive/decisions-2026-09-22.md`](archive/decisions-2026-09-22.md)
  although it governs 34 live primaries (ledger L37). Its home is
  [`archive/headword-design.md`](archive/headword-design.md) §4.
- **HW-abbrev-primary, 3 rows; HW-phrase-hw, 3 rows.** Both match by
  rid (K00107, P00137, A02002; A00436, A01881, C00517).
- **HW-redup, 3; HW-spaced, 8.** None is a primary today; all 11 are
  alternates, so none is in the 382.
- **HW-homograph-gaps, 178 families.** The report had 177 (136
  primary + 41 alternate) while it keyed a family on its exact
  spelling. Under 10-05 it numbers by sequence and has 140 (104 + 36);
  the 37 it cleared are X9 rows. The one missing family was not traced.
- **HW-roman.** It quotes no X8 count. 39 families resolve under it
  (41 until A01698 and M02008 became X9 under 10-05):
  Sefaria hung the numeral on the line's last form (`סְבַר, סְבֵיר I`),
  so the family's first spelling looks unnumbered. In 27 of the 30
  volume-2 families (28 of 31 with M02008) the hOCR reads that numeral
  on the holder's line.
  The cost HW-roman accepted is visible here: those 39 entries' names
  carry no numeral although print numbers them.

<details>
<summary>The 286 rids by shape</summary>

**H6, HW-phrase-hw (3):** [A00436](https://jastrow.app/#rid:A00436), [A01881](https://jastrow.app/#rid:A01881), [C00517](https://jastrow.app/#rid:C00517)

**H6, HW-abbrev-primary (3):** [A02002](https://jastrow.app/#rid:A02002), [K00107](https://jastrow.app/#rid:K00107), [P00137](https://jastrow.app/#rid:P00137)

**X1, HW-prefix endings (2):** [J00321](https://jastrow.app/#rid:J00321), [J00327](https://jastrow.app/#rid:J00327)

**X5, HW-prefix, prefixes (36):** [A00007](https://jastrow.app/#rid:A00007), [A00008](https://jastrow.app/#rid:A00008), [A00012](https://jastrow.app/#rid:A00012), [A00367](https://jastrow.app/#rid:A00367), [A00515](https://jastrow.app/#rid:A00515), [A00661](https://jastrow.app/#rid:A00661), [A00954](https://jastrow.app/#rid:A00954), [A01109](https://jastrow.app/#rid:A01109), [A01396](https://jastrow.app/#rid:A01396), [A01410](https://jastrow.app/#rid:A01410), [A01638](https://jastrow.app/#rid:A01638), [A01765](https://jastrow.app/#rid:A01765), [A02317](https://jastrow.app/#rid:A02317), [A02345](https://jastrow.app/#rid:A02345), [A02864](https://jastrow.app/#rid:A02864), [A03392](https://jastrow.app/#rid:A03392), [B00003](https://jastrow.app/#rid:B00003), [B00004](https://jastrow.app/#rid:B00004), [B00093](https://jastrow.app/#rid:B00093), [D00002](https://jastrow.app/#rid:D00002), [D00445](https://jastrow.app/#rid:D00445), [D00502](https://jastrow.app/#rid:D00502), [D00937](https://jastrow.app/#rid:D00937), [E00002](https://jastrow.app/#rid:E00002), [E00003](https://jastrow.app/#rid:E00003), [E00095](https://jastrow.app/#rid:E00095), [E00373](https://jastrow.app/#rid:E00373), [E00413](https://jastrow.app/#rid:E00413), [E00530](https://jastrow.app/#rid:E00530), [F00025](https://jastrow.app/#rid:F00025), [K00002](https://jastrow.app/#rid:K00002), [L00002](https://jastrow.app/#rid:L00002), [M00002](https://jastrow.app/#rid:M00002), [M00230](https://jastrow.app/#rid:M00230), [S00002](https://jastrow.app/#rid:S00002), [U00002](https://jastrow.app/#rid:U00002)

**X5, HW-prefix, bound forms (76):** [A02029](https://jastrow.app/#rid:A02029), [A03212](https://jastrow.app/#rid:A03212), [B00551](https://jastrow.app/#rid:B00551), [C00086](https://jastrow.app/#rid:C00086), [C00547](https://jastrow.app/#rid:C00547), [C01133](https://jastrow.app/#rid:C01133), [D00490](https://jastrow.app/#rid:D00490), [D00585](https://jastrow.app/#rid:D00585), [D00588](https://jastrow.app/#rid:D00588), [D00595](https://jastrow.app/#rid:D00595), [D00596](https://jastrow.app/#rid:D00596), [D00764](https://jastrow.app/#rid:D00764), [D00769](https://jastrow.app/#rid:D00769), [G00517](https://jastrow.app/#rid:G00517), [H00076](https://jastrow.app/#rid:H00076), [H01188](https://jastrow.app/#rid:H01188), [H01528](https://jastrow.app/#rid:H01528), [J00328](https://jastrow.app/#rid:J00328), [J00692](https://jastrow.app/#rid:J00692), [K00049](https://jastrow.app/#rid:K00049), [K00261](https://jastrow.app/#rid:K00261), [K00824](https://jastrow.app/#rid:K00824), [K01012](https://jastrow.app/#rid:K01012), [K01169](https://jastrow.app/#rid:K01169), [K01180](https://jastrow.app/#rid:K01180), [K01307](https://jastrow.app/#rid:K01307), [K01361](https://jastrow.app/#rid:K01361), [L00522](https://jastrow.app/#rid:L00522), [L00549](https://jastrow.app/#rid:L00549), [L00625](https://jastrow.app/#rid:L00625), [M00159](https://jastrow.app/#rid:M00159), [M00289](https://jastrow.app/#rid:M00289), [M00593](https://jastrow.app/#rid:M00593), [M01084](https://jastrow.app/#rid:M01084), [M01247](https://jastrow.app/#rid:M01247), [M01409](https://jastrow.app/#rid:M01409), [M01658](https://jastrow.app/#rid:M01658), [M02474](https://jastrow.app/#rid:M02474), [M02794](https://jastrow.app/#rid:M02794), [N00629](https://jastrow.app/#rid:N00629), [N00964](https://jastrow.app/#rid:N00964), [O00582](https://jastrow.app/#rid:O00582), [O01363](https://jastrow.app/#rid:O01363), [O01375](https://jastrow.app/#rid:O01375), [P00502](https://jastrow.app/#rid:P00502), [P00707](https://jastrow.app/#rid:P00707), [P01118](https://jastrow.app/#rid:P01118), [P01170](https://jastrow.app/#rid:P01170), [P01335](https://jastrow.app/#rid:P01335), [P01340](https://jastrow.app/#rid:P01340), [P01348](https://jastrow.app/#rid:P01348), [P01359](https://jastrow.app/#rid:P01359), [Q00705](https://jastrow.app/#rid:Q00705), [Q00900](https://jastrow.app/#rid:Q00900), [R00307](https://jastrow.app/#rid:R00307), [R00353](https://jastrow.app/#rid:R00353), [R00370](https://jastrow.app/#rid:R00370), [S00353](https://jastrow.app/#rid:S00353), [S00377](https://jastrow.app/#rid:S00377), [S01016](https://jastrow.app/#rid:S01016), [S01120](https://jastrow.app/#rid:S01120), [S01223](https://jastrow.app/#rid:S01223), [S01435](https://jastrow.app/#rid:S01435), [S01436](https://jastrow.app/#rid:S01436), [S01824](https://jastrow.app/#rid:S01824), [T00496](https://jastrow.app/#rid:T00496), [U00887](https://jastrow.app/#rid:U00887), [U00968](https://jastrow.app/#rid:U00968), [U01026](https://jastrow.app/#rid:U01026), [U01083](https://jastrow.app/#rid:U01083), [U01471](https://jastrow.app/#rid:U01471), [V00445](https://jastrow.app/#rid:V00445), [V00738](https://jastrow.app/#rid:V00738), [V00761](https://jastrow.app/#rid:V00761), [V00819](https://jastrow.app/#rid:V00819), [V00960](https://jastrow.app/#rid:V00960)

**X5, HW-prefix, maqaf compound (1):** [B00761](https://jastrow.app/#rid:B00761)

**X7, HW-acronyms, acronyms (68):** [A00010](https://jastrow.app/#rid:A00010), [A00409](https://jastrow.app/#rid:A00409), [A01042](https://jastrow.app/#rid:A01042), [A01065](https://jastrow.app/#rid:A01065), [A01069](https://jastrow.app/#rid:A01069), [A01764](https://jastrow.app/#rid:A01764), [A01935](https://jastrow.app/#rid:A01935), [A01936](https://jastrow.app/#rid:A01936), [A03391](https://jastrow.app/#rid:A03391), [B00751](https://jastrow.app/#rid:B00751), [B00757](https://jastrow.app/#rid:B00757), [B00974](https://jastrow.app/#rid:B00974), [C00743](https://jastrow.app/#rid:C00743), [C01036](https://jastrow.app/#rid:C01036), [C01224](https://jastrow.app/#rid:C01224), [D00791](https://jastrow.app/#rid:D00791), [D00810](https://jastrow.app/#rid:D00810), [D00863](https://jastrow.app/#rid:D00863), [D00983](https://jastrow.app/#rid:D00983), [E00004](https://jastrow.app/#rid:E00004), [E00141](https://jastrow.app/#rid:E00141), [E00295](https://jastrow.app/#rid:E00295), [E00326](https://jastrow.app/#rid:E00326), [F00004](https://jastrow.app/#rid:F00004), [G00007](https://jastrow.app/#rid:G00007), [G00338](https://jastrow.app/#rid:G00338), [H00897](https://jastrow.app/#rid:H00897), [I00458](https://jastrow.app/#rid:I00458), [J00083](https://jastrow.app/#rid:J00083), [J00087](https://jastrow.app/#rid:J00087), [J00158](https://jastrow.app/#rid:J00158), [J00318](https://jastrow.app/#rid:J00318), [K00977](https://jastrow.app/#rid:K00977), [L00564](https://jastrow.app/#rid:L00564), [L00607](https://jastrow.app/#rid:L00607), [M00914](https://jastrow.app/#rid:M00914), [M01200](https://jastrow.app/#rid:M01200), [M01490](https://jastrow.app/#rid:M01490), [M01644](https://jastrow.app/#rid:M01644), [M01690](https://jastrow.app/#rid:M01690), [M01810](https://jastrow.app/#rid:M01810), [M02383](https://jastrow.app/#rid:M02383), [N00378](https://jastrow.app/#rid:N00378), [N00910](https://jastrow.app/#rid:N00910), [N01391](https://jastrow.app/#rid:N01391), [O01096](https://jastrow.app/#rid:O01096), [P00169](https://jastrow.app/#rid:P00169), [P00548](https://jastrow.app/#rid:P00548), [P00600](https://jastrow.app/#rid:P00600), [P00731](https://jastrow.app/#rid:P00731), [Q00002](https://jastrow.app/#rid:Q00002), [Q00141](https://jastrow.app/#rid:Q00141), [Q00157](https://jastrow.app/#rid:Q00157), [Q00436](https://jastrow.app/#rid:Q00436), [Q00459](https://jastrow.app/#rid:Q00459), [R00099](https://jastrow.app/#rid:R00099), [S00487](https://jastrow.app/#rid:S00487), [T00237](https://jastrow.app/#rid:T00237), [T00717](https://jastrow.app/#rid:T00717), [T00804](https://jastrow.app/#rid:T00804), [T00840](https://jastrow.app/#rid:T00840), [U00967](https://jastrow.app/#rid:U00967), [U01614](https://jastrow.app/#rid:U01614), [U01649](https://jastrow.app/#rid:U01649), [V00024](https://jastrow.app/#rid:V00024), [V00042](https://jastrow.app/#rid:V00042), [V00077](https://jastrow.app/#rid:V00077), [V00983](https://jastrow.app/#rid:V00983)

**X7, HW-acronyms, numeral letters (21):** [A00006](https://jastrow.app/#rid:A00006), [B00002](https://jastrow.app/#rid:B00002), [C00002](https://jastrow.app/#rid:C00002), [D00001](https://jastrow.app/#rid:D00001), [E00001](https://jastrow.app/#rid:E00001), [F00001](https://jastrow.app/#rid:F00001), [H00001](https://jastrow.app/#rid:H00001), [I00001](https://jastrow.app/#rid:I00001), [J00001](https://jastrow.app/#rid:J00001), [K00001](https://jastrow.app/#rid:K00001), [L00001](https://jastrow.app/#rid:L00001), [M00001](https://jastrow.app/#rid:M00001), [N00002](https://jastrow.app/#rid:N00002), [O00001](https://jastrow.app/#rid:O00001), [P00001](https://jastrow.app/#rid:P00001), [Q00001](https://jastrow.app/#rid:Q00001), [R00001](https://jastrow.app/#rid:R00001), [S00001](https://jastrow.app/#rid:S00001), [T00001](https://jastrow.app/#rid:T00001), [U00001](https://jastrow.app/#rid:U00001), [V00001](https://jastrow.app/#rid:V00001)

**X7, HW-truncated (34):** [A02161](https://jastrow.app/#rid:A02161), [A02411](https://jastrow.app/#rid:A02411), [B00398](https://jastrow.app/#rid:B00398), [B00983](https://jastrow.app/#rid:B00983), [C00618](https://jastrow.app/#rid:C00618), [C00737](https://jastrow.app/#rid:C00737), [D00826](https://jastrow.app/#rid:D00826), [D00957](https://jastrow.app/#rid:D00957), [D00963](https://jastrow.app/#rid:D00963), [E00197](https://jastrow.app/#rid:E00197), [E00433](https://jastrow.app/#rid:E00433), [E00842](https://jastrow.app/#rid:E00842), [E00856](https://jastrow.app/#rid:E00856), [G00401](https://jastrow.app/#rid:G00401), [K00302](https://jastrow.app/#rid:K00302), [N00665](https://jastrow.app/#rid:N00665), [O00671](https://jastrow.app/#rid:O00671), [O00672](https://jastrow.app/#rid:O00672), [Q00385](https://jastrow.app/#rid:Q00385), [Q01625](https://jastrow.app/#rid:Q01625), [Q01633](https://jastrow.app/#rid:Q01633), [Q01858](https://jastrow.app/#rid:Q01858), [S00240](https://jastrow.app/#rid:S00240), [S00269](https://jastrow.app/#rid:S00269), [S00462](https://jastrow.app/#rid:S00462), [S00463](https://jastrow.app/#rid:S00463), [S00958](https://jastrow.app/#rid:S00958), [S01151](https://jastrow.app/#rid:S01151), [U01593](https://jastrow.app/#rid:U01593), [U01626](https://jastrow.app/#rid:U01626), [V00107](https://jastrow.app/#rid:V00107), [V00154](https://jastrow.app/#rid:V00154), [V00228](https://jastrow.app/#rid:V00228), [V00841](https://jastrow.app/#rid:V00841)

**X8, HW-roman (39), with the entry that holds the numeral:** [A01735](https://jastrow.app/#rid:A01735) (on A01734), [A02363](https://jastrow.app/#rid:A02363) (on A02362), [A02413](https://jastrow.app/#rid:A02413) (on A02412), [A02824](https://jastrow.app/#rid:A02824) (on A02823), [B00050](https://jastrow.app/#rid:B00050) (on B00049), [B00560](https://jastrow.app/#rid:B00560) (on B00561), [E00697](https://jastrow.app/#rid:E00697) (on E00696), [J00752](https://jastrow.app/#rid:J00752) (on J00751), [K00345](https://jastrow.app/#rid:K00345) (on K00344), [L00290](https://jastrow.app/#rid:L00290) (on L00289), [L00694](https://jastrow.app/#rid:L00694) (on L00693), [M01319](https://jastrow.app/#rid:M01319) (on M01318), [M02547](https://jastrow.app/#rid:M02547) (on M02546), [N00738](https://jastrow.app/#rid:N00738) (on N00737), [N00914](https://jastrow.app/#rid:N00914) (on N00913), [O00086](https://jastrow.app/#rid:O00086) (on O00085), [O00122](https://jastrow.app/#rid:O00122) (on O00120, O00121), [O00156](https://jastrow.app/#rid:O00156) (on O00155), [O00352](https://jastrow.app/#rid:O00352) (on O00351), [O00499](https://jastrow.app/#rid:O00499) (on O00498), [O00563](https://jastrow.app/#rid:O00563) (on O00564), [O00580](https://jastrow.app/#rid:O00580) (on O00579), [P00230](https://jastrow.app/#rid:P00230) (on P00229), [P01418](https://jastrow.app/#rid:P01418) (on P01417), [Q00629](https://jastrow.app/#rid:Q00629) (on Q00628), [Q01320](https://jastrow.app/#rid:Q01320) (on Q01319), [Q02092](https://jastrow.app/#rid:Q02092) (on Q02090), [Q02095](https://jastrow.app/#rid:Q02095) (on Q02094), [R00293](https://jastrow.app/#rid:R00293) (on R00292), [R00608](https://jastrow.app/#rid:R00608) (on R00607), [R00615](https://jastrow.app/#rid:R00615) (on R00614), [S01065](https://jastrow.app/#rid:S01065) (on S01064), [T00337](https://jastrow.app/#rid:T00337) (on T00336), [T00895](https://jastrow.app/#rid:T00895) (on T00892, T00893), [U00881](https://jastrow.app/#rid:U00881) (on U00880), [U00883](https://jastrow.app/#rid:U00883) (on U00882), [U01047](https://jastrow.app/#rid:U01047) (on U01046), [V00543](https://jastrow.app/#rid:V00543) (on V00541, V00542), [V01023](https://jastrow.app/#rid:V01023) (on V01022)

**X8, print confirms the stored numbering (3):** [N00186](https://jastrow.app/#rid:N00186), [N00343](https://jastrow.app/#rid:N00343), [U01687](https://jastrow.app/#rid:U01687)

</details>

### X8: the print confirms the stored numbering (3)

These rest on the hOCR, not a ruling, so the evidence is here to spot-check. Each line shows the numbered member's stored numeral, and a grammar word straight after the unnumbered sibling's headword, where a numeral would sit.

| rid | family | what the hOCR shows | scan |
|---|---|---|---|
| [N00186](https://jastrow.app/#rid:N00186) | `נְגַר` I missing | N00185 `נְגַר`: `UJ ch. same; 1) to scrape, plane, saw.`<br>N00186 `נְגַר II`: `uL II pr. n. m. N'gar, legendary name` | [876a · leaf 199](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$200/full/1400,/0/default.jpg) |
| [N00343](https://jastrow.app/#rid:N00343) | `נוֹחַ` I missing | N00342 `נוֹחַ`: `nlO m. (b. h. ; preced.) rest; satisfaction.`<br>N00343 `נוֹחַ II`: `n"D II m., nnlD f. (preced. wds.) 1)`<br>N00344 `נוֹחַ III`: not found in the hOCR | [886b · leaf 209](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$210/full/1400,/0/default.jpg) |
| [U01687](https://jastrow.app/#rid:U01687) | `שַׁעַר` I missing | U01686 `שַׁעַר`: `"1510 m. (b. h.; iSta to divide, break`<br>U01687 `שַׁעַר II`: `"15^0 II m. (b. h.; 1$tt5ll) estimation, proportion.—` | [1612b · leaf 935](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$936/full/1400,/0/default.jpg) |

## Pile D: not a name problem (4)

In each family the gap is only in exact spelling. The missing numerals
sit on the Hebrew verb spelled with qamets (`שָׁחַר I`–`III`), and
the numbered row is the Aramaic verb with sheva that Jastrow numbers
on from them (`שְׁחַר IV`). The unnumbered siblings are the
`ch. same` lines, which print does not number. No entry needs a
numeral, so no name changes.

Since 10-05 the report reads these four as X9, not X8: each
sequence's numerals run once, and the qamets against sheva is the
pointing X9 asks about. They stay here because the evidence below
already answers it: a Hebrew verb and its Aramaic counterpart, which
print numbers in one run. S00061's sequence changes pointing once more,
at S00064 (`קְבל` IV, no patah); that question is in pile C.

| rid | family | why the name does not change | scan |
|---|---|---|---|
| [I00618](https://jastrow.app/#rid:I00618) | `טְעַן` | the missing I, II is on I00614, I00616, spelled with other vowels; numbering runs I..III once across the consonant family. The unnumbered I00615, I00617 are the Aramaic `ch. same` lines, which print leaves unnumbered: I00615 `73, מעין ch. same, to plead. Keth. 105"`; I00617 `79, מעון ch, same, 1) to be laden;` | [544a · leaf 567](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$568/full/1400,/0/default.jpg) |
| [M02850](https://jastrow.app/#rid:M02850) | `מְשַׁח` | the missing I, II is on M02846, M02848, spelled with other vowels; numbering runs I..IV once across the consonant family. The unnumbered M02847, M02849 are the Aramaic `ch. same` lines, which print leaves unnumbered: M02847 `riw^2 ch. same. Targ. 0. Gen. XXXI, 13.`; M02849 `nCQ ch. same. Targ. Y. Gen. X, 25.` | [851a · leaf 174](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$175/full/1400,/0/default.jpg) |
| [S00061](https://jastrow.app/#rid:S00061) | `קְבַל` | the missing I, II is on S00057, S00059, spelled with other vowels; numbering runs I..IV once across the consonant family. The unnumbered S00058, S00060 are the Aramaic `ch. same` lines, which print leaves unnumbered: S00058 `3Dp ch. same, 1) (with TDK) to visit.`; S00060 `J Jp ch. same, to cry out, complain,` | [1309a · leaf 632](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$633/full/1400,/0/default.jpg) |
| [U00710](https://jastrow.app/#rid:U00710) | `שְׁחַר` | the missing I, II, III is on U00704, U00706, U00708, spelled with other vowels; numbering runs I..IV once across the consonant family. The unnumbered U00705, U00707, U00709 are the Aramaic `ch. same` lines, which print leaves unnumbered: U00705 `""iniD ch. same, to search, inquire. Targ. Is.`; U00707 `Hof. "inavi fo become black, v. supra.`; U00709 `™irn£? ch. same. Ex. R. s. 47 "ppTl` | [1551a · leaf 874](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$875/full/1400,/0/default.jpg) |

**Your answers** (these four are sequences where the Hebrew verb, pointed with qamets, is numbered and the Aramaic `ch. same` lines between are not; tick one per row):

- **I00618**: `טְעַן` and its Hebrew neighbours
  - [x] print numbers the Hebrew verb and leaves the Aramaic lines unnumbered, as stored: nothing to fix
  - [ ] print numbers an Aramaic line too (say which rid and numeral in the note)
  - [ ] a spelling here is wrong in print terms (say which rid and what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **M02850**: `מְשַׁח` and its Hebrew neighbours
  - [x] print numbers the Hebrew verb and leaves the Aramaic lines unnumbered, as stored: nothing to fix
  - [ ] print numbers an Aramaic line too (say which rid and numeral in the note)
  - [ ] a spelling here is wrong in print terms (say which rid and what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **S00061**: `קְבַל` and its Hebrew neighbours
  - [x] print numbers the Hebrew verb and leaves the Aramaic lines unnumbered, as stored: nothing to fix
  - [ ] print numbers an Aramaic line too (say which rid and numeral in the note)
  - [ ] a spelling here is wrong in print terms (say which rid and what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U00710**: `שְׁחַר` and its Hebrew neighbours
  - [x] print numbers the Hebrew verb and leaves the Aramaic lines unnumbered, as stored: nothing to fix
  - [ ] print numbers an Aramaic line too (say which rid and numeral in the note)
  - [ ] a spelling here is wrong in print terms (say which rid and what you see in the note)
  - [ ] can't tell from the scan
  - note: 

## How this was produced

Read-only scripts over the committed tree at `f1e2982f5`, importing the
repo's own `nameOf`, `normalizeHeadword`, `ocrSimilarity` and
`intToRoman`. Hebrew was compared in NFC, or as consonants with every
mark stripped. Nothing in `data/` was written.

**Rows.** `docs/reports/headword-issues.csv`, role `headword`: 382.
For X8, each family was rebuilt the way `homographGapRows` builds it
(exact NFC spelling, alternates included). Then it was widened to
every entry within six rids whose consonants match.

**That first version assumed a homograph family is one exact
spelling.** It is not. Jastrow numbers homographs as they stand in
unpointed texts and the vowels are editorial, so one numbered sequence
can be pointed two ways (`אֱגוֹרָא` I, Aramaic; `אֲגוֹרָא` II, a Greek
loan). The exact key reported such a sequence as a gap, and the old
pointing section asked whether print spells the two alike: the wrong
question. On 2026-10-05 the report changed to number by sequence
([decisions](decisions.md) 10-05) and this list follows it. 32 primary
X8 rows became X9: 25 from that section (P00476 and P00477 now one
row), A01698 and M02008 from pile A, the four pile D rows and pile B's
U01774; B01014 is new, a sequence the exact key had hidden. The X9
tables reuse the earlier hOCR reads. The lines for the nine rids not
read before (A01697, A01698, B01010–B01014, M02007, M02008) were found
by hand in `data/print/hocr/` and quoted the same way: the first eight
words in visual order, bidi marks dropped as the reader dropped them.

**The hOCR reader.** Each leaf of `data/print/hocr/` was split into
columns at the page's midline. Lines indented past the column's median
margin were taken as entry starts. The entries placed in a column and
its two neighbours (`data/page-index/entries.jsonl`) were aligned to
those starts in print order. The score was the overlap between the
line's Latin words and the first Latin words of the entry's gloss,
plus, in volume 1, the OCR similarity of the Hebrew. A numeral counts
when one of `I`, `II`, `III`, `IV`, `V`, `VI` is among the line's
second to fourth words, before any citation abbreviation. A numeral
glued to `(`, `m.` or `f.` also counts. The quotes are the first
eight words of that line in visual order, unedited.

**Control.** The reader was run on a fixed sample before it was
trusted:

| Sample | Volume 1 (Tesseract) | Volume 2 (ABBYY) |
|---|---|---|
| 400 entries with a stored numeral on `headwords[0]` | 184 | 216 |
| line found | 140 (76%) | 190 (88%) |
| stored numeral read beside the headword | 31 of 140 (22%); 65 (46%) allowing `11`, `IL`, `IT` | 168 of 190 (88%) |
| 400 entries with no numeral on any form: line found | 107 of 177 | 128 of 223 |
| a numeral read anyway | 1 (1%) | 4 (3%); some look real, see L38 |
| grammar word straight after the headword, single-form entries (600 drawn each way) | — | numbered: 7 of 228 lines (3%); unnumbered: 125 of 192 (65%) |

Volume 1 is too weak to rest a fix on, so no volume-1 row is in pile
B; they are in C with the line quoted. In volume 2 a row went to B
only when the hOCR read the missing numeral beside an unnumbered
sibling's first form, and read the family's stored numeral on its
numbered member: a check on the same pages. A row is "print confirms"
(A) only when a grammar word follows the sibling's headword directly,
which happens to a numbered line 3% of the time.

**X8 piles, in order.**

1. A, HW-roman: an unnumbered sibling's own entry stores the missing
   numeral on another form. Three that fit the test but where the
   numeral visibly numbers a different word went to C (T00376,
   S01975, Q01193).
2. B: the volume-2 read above. One, where print sets the numeral after
   the second form (U01397), went to C, since where the numeral goes
   decides whether the name changes.
3. D or C, pointing: neighbours spelled with other points hold the
   missing numerals, once each. (Superseded on 10-05: such a family is
   now X9, a pointing question; the four this step sent to C that the
   sequence rule does not clear stay X8.) D only for the Hebrew/Aramaic verb
   pairs (qamets against sheva on the first letter), which print
   numbers in one run. Any other difference, a missing mark or another
   vowel, is C: no vowel is inferred, so the print says whether one
   spelling is a slip.
4. Volume 2: the hOCR shows the stored numerals and nothing beside the
   unnumbered sibling (A), or the read is unclear (C).
5. Volume 1: C.

**What moves a row.** A print read moves a C row to B (a fix) or to A
(the print confirms the stored data). A B row whose scan does not show
the numeral goes to C. A new ruling, say on where a numeral printed
after the first of several forms belongs, would settle the rows that
hinge on it. A re-import that changes a headword moves its row with
it: re-run the report before working this list.

## Cross-reference numerals (2026-10-14)

A new list, from the correction audit
([`correction-audit.md`](correction-audit.md) §5): cites whose text
names a homograph numeral (`v. סְגֵי I`) that the entry Sefaria links
them to does not carry. 296 such cites exist at `98804214d`. For 222
the family holds exactly one entry with that numeral and the cite's
spelling, so the link is Sefaria's error and is retargeted without a
question (case 1, audit §5.1). The other 74 need your read; they are
here as 48 questions, one per family and numeral named. Tick the same
way as round 2: ONE box per bullet, a note only where a box asks for
one; each block's `Recommendation:` is a default you can accept by
ticking the box it names.

How to read the blocks:

- The table is the family as the committed entries store it (every
  form within five entries whose consonants match the cite's word,
  ruling 10-05), with the hOCR line of each member where it was found
  (backticks in the OCR shown as `'`) and its scan.
- The cites follow, each in its context as the entry stores it, with
  the entry Sefaria links it to and the cite's hOCR line where found.
- Then what reading the family found, the question and the options.
  The options name the ruling's case: **case 1** (Sefaria's or the
  OCR's error; a retarget, or a numeral print sets that Sefaria
  dropped, restored and displayed, no annotation), **case 2** (print's
  error, determined by Jastrow's own text; corrected and annotated),
  **case 3** (kept as printed, with a `kept` annotation).
- "Retarget only; no numeral set" is the option where a cite names a
  `ch.` line by its Hebrew word's numeral and the family's numbering
  is already whole: the link moves, nothing is renumbered.
- Confidence: high where the text and the hOCR or a ruling settle it;
  medium where one of them does; low where neither does.

| cites | text | class | question in five words | recommendation | confidence |
|---|---|---|---|---|---|
| A00627 | `אָוָה III` | target numbered otherwise | Gesenius, not Jastrow? | yes: delink | high |
| A01864 | `אִלְמָלֵא I` | one bare member | a numeral after אִלְמָלֵא? | kept as printed | low |
| A02360 | `אִסְטְלִי I` | one bare member | A02378 the I? | A02378; scan decides case | medium |
| C00147 | `גּוּבְתָּא I` | no carrier | C00294 I, C00295 II? | C00294 is the I | medium |
| H00303 | `גִּזְרָא I` | one bare member | gloss-head I is the numeral? | yes: move it to the form | high |
| C00841, K00444 | `גִּיס I` | one bare member | cites stay on C00773? | yes: kept | high |
| C00538 | `גְּנַח II` | one bare member | C01130 is גְּנַח II? | yes: retarget to C01130 | high |
| M00854 | `חֲטִי I` | a carrier, not settled | which entry is חֲטִי I? | H00614, retarget only | medium |
| M00454, S00922 | `חַיְיתָא IV` | a carrier, not settled | H00750 is the IV? | yes: retarget | high |
| P00639 | `חֵיפָא III` | one bare member | where is חֵיפָא III? | kept | low |
| H01057, H01105 | `חֵלֶף I` | a carrier, not settled | H01100 is חֵלֶף I? | yes: retarget | high |
| H01224 | `חֲמַר II` | a carrier, not settled | which entry is חֲמַר II? | H01221, retarget only | medium |
| J00114 | `יְתֵב I` | a carrier, not settled | J00712 is יְתֵב I? | yes: retarget | high |
| M02423 | `מַוֶּה II` | a carrier, not settled | print reads מַזֶּה II? | retarget to M00725 | medium |
| O00278 | `מְשַׁח I` | a carrier, not settled | which entry is מְשַׁח I? | M02847, retarget only | medium |
| H01095, N00626, U00934 | `נָוֶה III` | target numbered otherwise | N00317 is נָוֶה III? | yes: line + retarget | high |
| N00660 | `נוֹחַ I` | target numbered otherwise | N00342 takes I? | yes: case 2 I | high |
| O00123, O00154, O00159, O00249, O00550, O00554 | `סְגֵי I` | a carrier, not settled | which סְגֵי I, סַגִּי I? | O00120; O00123 takes I | high / medium |
| P00136, P00477, P00506 | `עֲדֵי I` | a carrier, not settled | which entry is עֲדֵי I? | P00129, retarget only | medium |
| P00859, P00866, Q01968 | `עָמַד II` | target numbered otherwise | P00856 is עָמַד II? | yes: retarget | high |
| P00973 | `עֲנֵי I` | a carrier, not settled | which entry is עֲנֵי I? | P00971, retarget only | high |
| P01347 | `עָרֵב II` | a carrier, not settled | P01247 is עָרֵב II? | yes: retarget | high |
| P01275 | `עֵרָבוֹן II` | one bare member | P01273 takes II? | yes: case 2 II | high |
| Q02018 | `פַּרְפֵּר I` | a carrier, not settled | which entry is פַּרְפֵּר I? | Q01962, retarget only | medium |
| S01308 | `צִבְעָא I` | a carrier, not settled | R00058 or R00061? | R00058 | medium |
| R00162, R00759 | `צְדֵי I` | a carrier, not settled | which entry is צְדֵי I? | R00101, retarget only | medium |
| R00715 | `צְפר I` | a carrier, not settled | R00712 is צְפַר I? | yes: retarget | high |
| S01462 | `קיּץ I` | a carrier, not settled | S00528 is קוּץ I? | yes: retarget | high |
| S00305 | `קִיטְרָא I` | one bare member | a numeral after קִיטְרָא? | kept as printed | low |
| M02733, M02738 | `רָעָה I` | no carrier | T00889 or T00882? | T00889, retarget only | medium |
| U00126, U00779, U00807 | `שַׁב I` | no carrier | U00059 is שַׁב I? | U00059; scan decides | high / low |
| U00107, U00801 | `שְׁבַט II` | target numbered otherwise | U00105 is שְׁבַט II? | U00105 is the II | high |
| U00362, U00518 | `שְׁוַוח II` | target numbered otherwise | U00344 II, U00345 III? | yes; III dropped | high |
| U00835 | `שַׁוְיָא II` | one bare member | U00396 is שַׁוְיָא II? | U00396 is the II | high |
| U01637 | `שׁוּעַ I` | no carrier | which entry is שׁוּעַ I? | U00475 | low |
| P01145, U00043, U00490 | `שׁוּף I` | target numbered otherwise | U00488 is שׁוּף I? | yes: retarget | high |
| N01120 | `שׁוּתָא III` | target numbered otherwise | U00583, and its numeral? | U00583; I, II dropped | medium / high |
| U01014 | `שָׁיפּוּי I` | a carrier, not settled | U01012 is שִׁיפּוּי I? | yes: retarget | high |
| U01064, U01066 | `שֵׁירוּתָא III` | target numbered otherwise | U01071 is the III? | yes; II, III dropped | high |
| U01112, U02071 | `שִׁית IV` | one bare member | U01103 is שִׁית IV? | U01103 is the IV | high |
| U01243 | `שׁלַח II` | a carrier, not settled | U01268 is שֶׁלַח II? | yes: retarget | high |
| U01502 | `שָׁמִין II` | one bare member | print sets II on U01470? | yes: case 1 | high |
| U01503 | `שָׁמֵן II` | target numbered otherwise | U01498 is שָׁמֵן II? | U01498 is the II | high |
| U00045 | `שְׁפֵי I` | a carrier, not settled | which entry is שְׁפֵי I? | U01735, retarget only | medium |
| U02059 | `שֵׁשׁ III` | one bare member | U02056 is שֵׁשׁ III? | U02056 is the III | high |
| V00277, V00282 | `תּוֹר III` | target numbered otherwise | print sets III on V00275? | yes: case 1 | high |
| V00570 | `תַּלְמָא II` | one bare member | print sets II on V00600? | yes: case 1 | high |
| T00434, V00848 | `תְּפֵי I` | no carrier | V00815 I, V00816 II? | yes; II dropped | high |

### `אָוָה III`: A00627 (target numbered otherwise)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A00626](https://jastrow.app/#rid:A00626) | `אוי, אָוָה I` | not found in the hOCR | [24a · leaf 47](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$48/full/1400,/0/default.jpg) |
| [A00627](https://jastrow.app/#rid:A00627) | `אוי, אָוָה II` | not found in the hOCR | [24a · leaf 47](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$48/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [A00627](https://jastrow.app/#rid:A00627): …, √אה, cmp. הא; v. חָוָה , a. Ges. H. Dict. s. v. **אָוָה III**) to point, mark. Denom. אוֹת … Sefaria links it to A00627 `אוי, אָוָה II`. [24a · leaf 47](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$48/full/1400,/0/default.jpg)

The cite sits in A00627's own etymology: `(b. h., √אה, cmp. הא; v. חָוָה, a. Ges. H. Dict. s. v. אָוָה III)`. `s. v.` names an entry of Gesenius's Hebrew dictionary, not of Jastrow's, and Sefaria's linker pointed it at A00627 itself.

**Question.** Is `אָוָה III` here Gesenius's entry?

- **A00627**
  - [ ] yes: Gesenius's `אָוָה III`; remove the link, keep the text (case 1, silent: 08-15's linker overreach)
  - [ ] no: it names a Jastrow entry (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: Gesenius (high): the words before it are `a. Ges. H. Dict. s. v.`; Jastrow numbers `אָוָה` I and II only.

### `אִלְמָלֵא I`: A01864 (one bare member)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A01918](https://jastrow.app/#rid:A01918) | `אִלְמָלֵא, אִלְמָלֵי, אִילְ׳` | not found in the hOCR | [71b · leaf 94](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$95/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [A01864](https://jastrow.app/#rid:A01864): …m, somehow) unless, but for (followed by ש־; cmp. **אִלְמָלֵא I**). … Sefaria links it to A01918 `אִלְמָלֵא, אִלְמָלֵי, אִילְ׳`. [69b · leaf 92](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$93/full/1400,/0/default.jpg)

The dictionary has one `אִלְמָלֵא` (A01918) and no `אִלְמָלֵא II` anywhere, so no entry carries the numeral the cite names, and no II makes an I.

**Question.** What does print set after `אִלְמָלֵא` in A01864's `cmp. אִלְמָלֵא I`?

- **A01864**
  - [ ] print sets `I`: kept as printed; the link stays on A01918 (case 3: a `kept` annotation on the cite)
  - [ ] print sets no numeral: the `I` is Sefaria's; remove it from the cite (case 1)
  - [ ] something else (say what in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: kept (low): nothing in the dictionary explains the `I`, and volume 1's hOCR does not reach the line.

### `אִסְטְלִי I`: A02360 (one bare member)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A02378](https://jastrow.app/#rid:A02378) | `אִסְטַלִּי, אִסְטוֹלִי, אִיסְ׳` | `1. (צ “resting " place, road- station. Y’lamd. to Deut.` | [90b · leaf 113](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$114/full/1400,/0/default.jpg) |
| [A02379](https://jastrow.app/#rid:A02379) | `אִסְטְלִי, אִסְטוֹלִי, אִיסְ׳ II` | `.אַסטַליות “Sino Ey q. v.) letter, dying injunction, Pl.` | [90b · leaf 113](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$114/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [A02360](https://jastrow.app/#rid:A02360): …, v. **אִסְטְלִי I**, II.… Sefaria links it to A02379 `אִסְטְלִי, אִסְטוֹלִי, אִיסְ׳ II`. [90a · leaf 113](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$114/full/1400,/0/default.jpg)

A02360 `אִסְטוֹלִי` reads `v. אִסְטְלִי I, II`, naming both words. A02379 is the II. A02378 `אִסְטַלִּי` (resting place) is the only bare member, three letters pointed apart (patah and dagesh where A02379 has sheva), which 10-05 allows inside one sequence. The hOCR line before A02378's `resting place` reads `1.`, which may be a printed I.

**Question.** Is A02378 Jastrow's `אִסְטְלִי I`, and does print set the I?

- **A02378**
  - [ ] yes, and print sets I beside it: Sefaria dropped it (case 1: `reform.homographs`, displayed, no annotation); retarget the cite
  - [ ] yes, and print sets no numeral: A02378 takes I from this cite (case 2: annotated `printed: ''`); retarget the cite
  - [ ] no: the cite names another word (say which)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes, A02378 (medium): the cite names I and II side by side and A02378 is the only unnumbered member; the scan decides between case 1 and case 2.

### `גּוּבְתָּא I`: C00147 (no carrier)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C00294](https://jastrow.app/#rid:C00294) | `גּוּבְתָּא, גַּבְתָּא, גּוּפְתָּא` | not found in the hOCR | [217b · leaf 240](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$241/full/1400,/0/default.jpg) |
| [C00295](https://jastrow.app/#rid:C00295) | `גּוּבְתָא` | `the tube contain- ג' דכוחלא 3 channel. Targ. 11 Esth. I,` | [218a · leaf 241](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$242/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [C00147](https://jastrow.app/#rid:C00147): …, v. **גּוּבְתָּא I**… Sefaria links it to C00294 `גּוּבְתָּא, גַּבְתָּא, גּוּפְתָּא`. [209b · leaf 232](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$233/full/1400,/0/default.jpg)

C00147 is `גַּבְתָּא`, an alternate of C00294 (`גּוּבְתָּא, גַּבְתָּא, גּוּפְתָּא`, hill), and its `v. גּוּבְתָּא I` points back at C00294, where Sefaria links it. The next entry, C00295 `גּוּבְתָא` (reservoir, tube), is the only other member; neither carries a numeral.

**Question.** Does print number C00294 I (and C00295 II)?

- **C00294**
  - [ ] print sets I on C00294 and II on C00295: both dropped by Sefaria (case 1)
  - [ ] print sets none: C00294 takes I from this cite (case 2, annotated); C00295 then has no II (say in the note if it should)
  - [ ] kept as printed: no numeral on either (case 3: `kept` on the cite)
  - [ ] can't tell from the scan
  - note: 

Recommendation: C00294 is the I (medium): the cite comes from C00294's own alternate's entry; the scan decides whether print numbers them.

### `גִּזְרָא I`: H00303 (one bare member)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C00577](https://jastrow.app/#rid:C00577) | `גִּזְרָא, גִּיזְרָא` | not found in the hOCR | [232a · leaf 255](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$256/full/1400,/0/default.jpg) |
| [C00578](https://jastrow.app/#rid:C00578) | `גִּזְרָא, גִּיזְרָא II` | `fold, flock. Targ. Prov. XXX, 31 753 בית Ms. (ed. (גרורא` | [232a · leaf 255](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$256/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [H00303](https://jastrow.app/#rid:H00303): … c. (= b. h. חֹטֶר, v. חֲטַר; cmp. **גִּזְרָא I**) staff, scepter. … Sefaria links it to C00578 `גִּזְרָא, גִּיזְרָא II`. [431b · leaf 454](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$455/full/1400,/0/default.jpg)

C00577's first gloss opens `, I ch.`: print sets `גִּזְרָא, גִּיזְרָא I ch.` and Sefaria cut the numeral into the gloss head, as at U01006 and U01138 (P000326/P000327, P000330/P000331). H00303's `cmp. גִּזְרָא I` names it; Sefaria links the II (C00578). The headword report lists C00578's alternate as X10.

**Question.** Is the `I` at the head of C00577's gloss print's numeral for the line?

- **C00577**
  - [ ] yes: move it onto the form (`reform.homographs` + `replace` removing ` I` from the gloss head, case 1) and retarget H00303's cite to C00577
  - [ ] no (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the gloss head holds exactly the numeral the cite names, and the pattern is the one pile B's numerals-in-gloss repaired.

### `גִּיס I`: C00841, K00444 (one bare member)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C00772](https://jastrow.app/#rid:C00772) | `גֵּיס` | `Sm.757) spoils, heaped up treasures. Pl. "072. 9` | [240a · leaf 263](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$264/full/1400,/0/default.jpg) |
| [C00773](https://jastrow.app/#rid:C00773) | `גִּיס II, גָּיֵיס` | `O NAIL, ברכ m, (Os U1) intimate, familiar. Keth.85` | [240a · leaf 263](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$264/full/1400,/0/default.jpg) |
| [C00774](https://jastrow.app/#rid:C00774) | `גִּיס II` | `husband, brother-in-law. Suh, Il, 4 (27) Jorn .צ) ib.` | [240b · leaf 263](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$264/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [C00841](https://jastrow.app/#rid:C00841): …m. (v. **גִּיס I**) familiar. … Sefaria links it to C00773 `גִּיס II, גָּיֵיס`. [243a · leaf 266](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$267/full/1400,/0/default.jpg)
- [K00444](https://jastrow.app/#rid:K00444): … מִיכְזַז כ׳ מינה Ar. (ed. מיב׳ ב׳), opp. גיס, v. **גִּיס I**. … Sefaria links it to C00773 `גִּיס II, גָּיֵיס`. hOCR: `him his son is shy. Ib. 112 * top כ' מ"נה N15" Ar. (ed.`. [628a · leaf 651](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$652/full/1400,/0/default.jpg)

Two cites, C00841 `m. (v. גִּיס I) familiar` and K00444 `opp. גיס, v. גִּיס I`, are linked to C00773 `גִּיס II` (intimate, familiar). The meaning they quote is C00773's, which print numbers II; C00772 `גֵּיס` (spoils) is the only bare member. Your round 2 note on C00773 (in your working copy, not yet committed) finds too much ambiguity for an implied I.

**Question.** Do these two cites stay on C00773 as printed?

- **C00841, K00444**
  - [ ] yes: the link stays; print's `I` is kept (case 3: a `kept` annotation on each cite)
  - [ ] C00772 takes I and both cites move to it (case 2)
  - [ ] something else (say what in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: kept (high): the cites quote C00773's meaning, and your round 2 answer rules out an implied I here.

### `גְּנַח II`: C00538 (one bare member)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C01128](https://jastrow.app/#rid:C01128) | `גָּנַח` | not found in the hOCR | [259a · leaf 282](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$283/full/1400,/0/default.jpg) |
| [C01129](https://jastrow.app/#rid:C01129) | `גְּנַח I` | `sme, fo groam, rumble (of the underground 6 נָכָדז` | [259a · leaf 282](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$283/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [C00538](https://jastrow.app/#rid:C00538): …B. Mets. 90ᵇ top Ms. M., v. **גְּנַח II**.… Sefaria links it to C01129 `גְּנַח I`. [229a · leaf 252](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$253/full/1400,/0/default.jpg)

C00538 (`גְּזַז`, to cut) reads `v. גְּנַח II`. C01130, stored `גְּנַה II` (to cut, pass swiftly), is that word: its `ה` is a slip for `ח`, which hides it from a consonant search, and Sefaria links the cite to C01129 `גְּנַח I`.

**Question.** Is C01130 Jastrow's `גְּנַח II`?

- **C00538**
  - [ ] yes: retarget to C01130 (case 1); C01130's `ה` goes to the headword list as an OCR question
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): C01130's gloss `to cut, pass swiftly` is the meaning C00538 refers to, and no other `גנח` II exists.

### `חֲטִי I`: M00854 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00613](https://jastrow.app/#rid:H00613) | `חטי, חָטָא, חָטָה I` | `Fl. to Levy Targ. Dict. 5 4242),] to live in luxury, to` | [448b · leaf 471](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$472/full/1400,/0/default.jpg) |
| [H00614](https://jastrow.app/#rid:H00614) | `חֲטִי` | `ees pert m used to comfort, tender, ל` | [449a · leaf 472](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$473/full/1400,/0/default.jpg) |
| [H00615](https://jastrow.app/#rid:H00615) | `חטי, חָטָא II` | `MOM, NGAI ). א [to miss.) to fail, err, sin.` | [449a · leaf 472](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$473/full/1400,/0/default.jpg) |
| [H00616](https://jastrow.app/#rid:H00616) | `חֲטִי, חֲטָא` | `ch, same. Targ. ¥.Gen. XLIX,3. Targ.` | [449a · leaf 472](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$473/full/1400,/0/default.jpg) |
| [H00617](https://jastrow.app/#rid:H00617) | `חֳטִי` | `m.=Non, esp. unexpiated sin, consequence of \| ומ"` | [449a · leaf 472](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$473/full/1400,/0/default.jpg) |
| [H00618](https://jastrow.app/#rid:H00618) | `חֲטָי` | `5 קד \| ch. same, Dan. IV, 24.— 1%. with suffix ot.` | [449a · leaf 472](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$473/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [M00854](https://jastrow.app/#rid:M00854): …delicate, v. **חֲטִי I**.—מָחְטֵי, Targ. Job I, 22, v.… Sefaria links it to H00616 `חֲטִי, חֲטָא`. hOCR: `""■UnC! delicate,?. "W»L— Wa^ Targ. JobI,22,v. HBTOO.`. [759a · leaf 82](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$83/full/1400,/0/default.jpg)

M00854 `מִחְטֵי` (delicate) reads `v. חֲטִי I`; Sefaria links H00616 (`חֲטִי, חֲטָא`, the ch. of H00615 `חָטָא II`, to sin). The only I is H00613 `חטי, חָטָא, חָטָה I` (to live in luxury); its `ch. same`, H00614 `חֲטִי` (tender), is spelled exactly as the cite. Jastrow names a ch. line by its Hebrew word's numeral elsewhere (round 2: `טְבַע I` is I00077).

**Question.** Which entry is Jastrow's `חֲטִי I`?

- **M00854**
  - [ ] H00614 `חֲטִי` (`ch. same` of `חָטָה I`): retarget; no numeral set on it
  - [ ] H00614, and it takes I (case 2, annotated)
  - [ ] H00613 `חָטָה I`: retarget there
  - [ ] can't tell from the scan
  - note: 

Recommendation: H00614, retarget only (medium): its spelling and meaning (tender) match; the family's Hebrew numbering I, II is complete, so no gap needs the text to fill it.

### `חַיְיתָא IV`: M00454, S00922 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00747](https://jastrow.app/#rid:H00747) | `חַיְיתָא I, חַיְתָא` | not found in the hOCR | [455a · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |
| [H00748](https://jastrow.app/#rid:H00748) | `חַיְיתָא II, חַיְתָא` | not found in the hOCR | [455a · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |
| [H00749](https://jastrow.app/#rid:H00749) | `חַיְּיתָא III, חַיָּתָא` | not found in the hOCR | [455b · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |
| [H00750](https://jastrow.app/#rid:H00750) | `חַיְּיתָא, חַיְּתָא IV` | `pera ₪. lrabs, P-ben. 1408) pouch, bog. Oi 45* התפרלי or` | [455b · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [M00454](https://jastrow.app/#rid:M00454): …Ḥull. 45ᵃ, v. **חַיְיתָא IV**. … Sefaria links it to H00747 `חַיְיתָא I, חַיְתָא`. [740a · leaf 63](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$64/full/1400,/0/default.jpg)
- [S00922](https://jastrow.app/#rid:S00922): …Keth. 93ᵃ, a. e. חייתא דק׳, v. **חַיְיתָא IV**; a. fr.—Trnsf. … Sefaria links it to H00747 `חַיְיתָא I, חַיְתָא`. hOCR: `anin). Keth. 93a, a. e. 'pi xrvTi, v. xn^nrv; a. fr.—`. [1358b · leaf 681](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$682/full/1400,/0/default.jpg)

M00454 and S00922 read `v. חַיְיתָא IV` (M00454 after `Ḥull. 45ᵃ`); Sefaria links the I (H00747). The only IV is H00750 `חַיְּיתָא, חַיְּתָא IV` (pouch, bag), whose own text cites `Ḥull. 45ᵃ`. The cite's spelling lacks H00750's dagesh in the yod.

**Question.** Is H00750 Jastrow's `חַיְיתָא IV`?

- **M00454, S00922**
  - [ ] yes: retarget both to H00750 (case 1)
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the only IV in the family, and the Talmud passage matches.

### `חֵיפָא III`: P00639 (one bare member)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00839](https://jastrow.app/#rid:H00839) | `חֵיפָא I` | `attack, Targ. Prov, XXVIII, 4 (h, text Dow), Ih, I, 8` | [459a · leaf 482](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$483/full/1400,/0/default.jpg) |
| [H00840](https://jastrow.app/#rid:H00840) | `חֵיפָא II` | not found in the hOCR | [459a · leaf 482](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$483/full/1400,/0/default.jpg) |
| [H00841](https://jastrow.app/#rid:H00841) | `חִיפָּא` | not found in the hOCR | [459a · leaf 482](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$483/full/1400,/0/default.jpg) |
| [H00843](https://jastrow.app/#rid:H00843) | `חֵיפָה I, חֵיפָא, בֵּית ח׳` | `a harbor of the Mediterranean Sea, south of` | [459a · leaf 482](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$483/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [P00639](https://jastrow.app/#rid:P00639): …pr. n. m.ʿEfa, v. **חֵיפָא III**.… Sefaria links it to H00840 `חֵיפָא II`. [1073b · leaf 396](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$397/full/1400,/0/default.jpg)

P00639 `עֵיפָא II` (pr. n. m. ʿEfa) reads `v. חֵיפָא III`; Sefaria links H00840 `חֵיפָא II` (pr. n. pl., v. Haifa). The family numbers I and II only; H00841 `חִיפָּא` (border in webs) is the only bare member and is no proper name.

**Question.** Which entry is Jastrow's `חֵיפָא III`?

- **P00639**
  - [ ] none in the data: print's III names a word Sefaria lacks; the link stays (case 3: `kept` on the cite)
  - [ ] H00840: print's `III` is a slip for `II` (case 2: the cite's text annotated)
  - [ ] H00841 takes III (case 2)
  - [ ] can't tell from the scan
  - note: 

Recommendation: kept (low): a personal name ʿEfa matches no stored `חֵיפָא`; read the column for a third `חֵיפָא` line.

### `חֵלֶף I`: H01057, H01105 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H01098](https://jastrow.app/#rid:H01098) | `חָלַף` | not found in the hOCR | [471b · leaf 494](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$495/full/1400,/0/default.jpg) |
| [H01099](https://jastrow.app/#rid:H01099) | `חֲלַף I, חֲלֵיף` | `ch. same, to pass by, be gone. Targ. חליף 8 חלף` | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |
| [H01100](https://jastrow.app/#rid:H01100) | `חִלֶף I` | not found in the hOCR | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |
| [H01101](https://jastrow.app/#rid:H01101) | `חֵלֶף II` | `או ח' is not perhaps the reverse the case?` | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |
| [H01102](https://jastrow.app/#rid:H01102) | `חֶלֶף` | `me-Helef מחלם ח' )33 Meg.1,70* bot. (ref. to Josh. XIX,` | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |
| [H01103](https://jastrow.app/#rid:H01103) | `חֲלַף II, חוֹלַף` | `Aon II, חולף m, st. constr. (הלף) in place of, %%-` | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [H01057](https://jastrow.app/#rid:H01057): … pl. חֲלִיפוֹת shoots, v. **חֵלֶף I**.… Sefaria links it to H01101 `חֵלֶף II`. [469a · leaf 492](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$493/full/1400,/0/default.jpg)
- [H01105](https://jastrow.app/#rid:H01105): …, v. **חֵלֶף I**… Sefaria links it to H01101 `חֵלֶף II`. [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg)

H01057 (`pl. חֲלִיפוֹת shoots, v. חֵלֶף I`) and H01105 (`v. חֵלֶף I`) are linked to H01101 `חֵלֶף II`. Two entries carry I: H01099 `חֲלַף I` (ch., to pass) and H01100 `חִלֶף I` (shoot). Your round 2 tick on H01101 (in your working copy) respells H01100 `חֵלֶף I`, tsere, as an OCR slip.

**Question.** Is H01100 Jastrow's `חֵלֶף I`?

- **H01057, H01105**
  - [ ] yes: retarget both to H01100 (case 1), after round 2's respelling
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): H01100's gloss is `1) shoot`, the meaning H01057 quotes, and round 2 already respells it `חֵלֶף`.

### `חֲמַר II`: H01224 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H01218](https://jastrow.app/#rid:H01218) | `חָמַר I` | not found in the hOCR | [479b · leaf 502](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$503/full/1400,/0/default.jpg) |
| [H01219](https://jastrow.app/#rid:H01219) | `חֲמַר` | not found in the hOCR | [479b · leaf 502](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$503/full/1400,/0/default.jpg) |
| [H01220](https://jastrow.app/#rid:H01220) | `חָמַר II` | not found in the hOCR | [479b · leaf 502](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$503/full/1400,/0/default.jpg) |
| [H01221](https://jastrow.app/#rid:H01221) | `חֲמַר` | `ch. same, 1) to be hot, parched. Targ. Job חמר` | [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |
| [H01222](https://jastrow.app/#rid:H01222) | `חֲמַר III, חַמְרָא I` | `Num. VI, 3; a. fr. —Targ. Hos. III, 1 "723 ed. Lag.` | [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |
| [H01223](https://jastrow.app/#rid:H01223) | `חֲמָר, חֲמָרָא, חַמְרָא II` | `trnsf. workingman ’s contrivance, jack ₪0. Targ Is. XXI,7.` | [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |
| [H01224](https://jastrow.app/#rid:H01224) | `חַמָּר I` | `mourning. Targ. Ps. XXXV, 14; XXXVIII, 7 Ms. (ed.` | [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |
| [H01225](https://jastrow.app/#rid:H01225) | `חַמָּר II` | `of beasts of burden. Kidd. IV, 14, a. e., v. 533. Kel.` | [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |
| [H01226](https://jastrow.app/#rid:H01226) | `חַמָּר, חַמָּרָא` | `“Van, חמרא ch. same, Y. Taan. I, 64" bot. ח' אנא` | [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [H01224](https://jastrow.app/#rid:H01224): …m. ch. (v. **חֲמַר II**; cmp. חָמַם) dark; trnsf. mou… Sefaria links it to H01222 `חֲמַר III, חַמְרָא I`. hOCR: `WAM I m. ch. (v. V2 11; emp. 02m) dark; trnsf.`. [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg)

H01224 `חַמָּר I` (dark) reads `m. ch. (v. חֲמַר II; cmp. חָמַם)`; Sefaria links H01222 `חֲמַר III` (wine). Entries carrying II: H01220 `חָמַר II` (to be hot, glow), H01223 (`חַמְרָא II`, ass) and H01225 `חַמָּר II` (ass-driver). `dark` derives from `to glow, parch`, whose `ch. same` is H01221 `חֲמַר` (to be hot, parched), spelled exactly as the cite. Your round 2 tick on H01222 (in your working copy) says print leaves the ch. lines bare.

**Question.** Which entry is Jastrow's `חֲמַר II`?

- **H01224**
  - [ ] H01221 `חֲמַר` (`ch. same` of `חָמַר II`): retarget; no numeral set
  - [ ] H01220 `חָמַר II`: retarget there
  - [ ] something else (say what in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: H01221, retarget only (medium): spelling and meaning match, and round 2 keeps the ch. lines bare.

### `יְתֵב I`: J00114 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [J00712](https://jastrow.app/#rid:J00712) | `יתֵב, יְתֵיב I` | `7% ותיב 1 ch.=h. 30, to sit, dwell &e.; to be in-` | [602b · leaf 625](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$626/full/1400,/0/default.jpg) |
| [J00713](https://jastrow.app/#rid:J00713) | `יְתֵב II` | `give (not used in perf. tense). ניתיב ליח 19° .ה eres` | [603a · leaf 626](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$627/full/1400,/0/default.jpg) |
| [J00714](https://jastrow.app/#rid:J00714) | `יָתֵב, יָתֵיב` | `20 Bes od. Berl. (ed, “sre pl). Targ., 0. Num, XIV, 14.` | [603a · leaf 626](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$627/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [J00114](https://jastrow.app/#rid:J00114): …תיהב דיהבת וכ׳, read: תִּתְיַתַּב … דיַתְּבַת, v. **יְתֵב I**.]… Sefaria links it to J00713 `יְתֵב II`. [565b · leaf 588](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$589/full/1400,/0/default.jpg)

J00114 `יְהַב` reads `v. יְתֵב I`; Sefaria links J00713 `יְתֵב II`. The only I is J00712, stored `יתֵב, יְתֵיב I`: its first form lacks the sheva the cite has, which is why the pointing check did not settle it.

**Question.** Is J00712 Jastrow's `יְתֵב I`?

- **J00114**
  - [ ] yes: retarget to J00712 (case 1)
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the only I of the consonants; the missing sheva is J00712's own stored spelling.

### `מַוֶּה II`: M02423 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [M00724](https://jastrow.app/#rid:M00724) | `מַזֶּה I` | `23 (ref. to Ex. IV, 2) '21 fift 3VO ilrt -JTO 'a 'what is` | [753b · leaf 76](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$77/full/1400,/0/default.jpg) |
| [M00725](https://jastrow.app/#rid:M00725) | `מַזֶּה II` | `t nU II m. (!it:) the priest appointed to do the sprink-` | [753b · leaf 76](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$77/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [M02423](https://jastrow.app/#rid:M02423): …Ber. 28ᵃ, a. e., v. **מַוֶּה II**.… Sefaria links it to M00724 `מַזֶּה I`. [831a · leaf 154](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$155/full/1400,/0/default.jpg)

M02423 reads `Ber. 28ᵃ, a. e., v. מַוֶּה II`; Sefaria links M00724 `מַזֶּה I`. `מַוֶּה` is no headword: its `ו` is a slip for `ז`, and M00725 `מַזֶּה II` (the priest appointed to sprinkle) is the II. Review ledger L51 asks this.

**Question.** Is the cite `מַזֶּה II` in print?

- **M02423**
  - [ ] yes: retarget to M00725 and correct the cite's `ו` to `ז` (both case 1)
  - [ ] print reads `מַוֶּה`: retarget, and annotate the cite's spelling (case 2)
  - [ ] can't tell from the scan
  - note: 

Recommendation: the first (medium): M00725 is the only II; the scan decides whose slip the `ו` is.

### `מְשַׁח I`: O00278 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [M02846](https://jastrow.app/#rid:M02846) | `מָשַׁח I` | `nilJ'/Q I (b. h.) to siroi«, smear; esp. to anoint; to in-` | [850b · leaf 173](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$174/full/1400,/0/default.jpg) |
| [M02847](https://jastrow.app/#rid:M02847) | `מְשַׁח` | `riw^2 ch. same. Targ. 0. Gen. XXXI, 13. Targ. Ps.` | [851a · leaf 174](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$175/full/1400,/0/default.jpg) |
| [M02848](https://jastrow.app/#rid:M02848) | `מָשַׁח II` | `r!UJ - II to stretch, measure. Denom. nisja, hlTKfcl.` | [851a · leaf 174](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$175/full/1400,/0/default.jpg) |
| [M02849](https://jastrow.app/#rid:M02849) | `מְשַׁח` | `nCQ ch. same. Targ. Y. Gen. X, 25. Targ. Ez. XL, 5;` | [851a · leaf 174](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$175/full/1400,/0/default.jpg) |
| [M02850](https://jastrow.app/#rid:M02850) | `מְשַׁח III, מִשְׁחָא, מִישְׁ׳ I` | not found in the hOCR | [851a · leaf 174](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$175/full/1400,/0/default.jpg) |
| [M02851](https://jastrow.app/#rid:M02851) | `מְשַׁח IV, מִשְׁחָא, מִי׳ II` | `length. Targ. II Chr. IV, 2 "2 Bin measuring line ; a. e. —` | [851a · leaf 174](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$175/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [O00278](https://jastrow.app/#rid:O00278): …, 15 אנא משיחין ed. Lag. (ed. Wil. מָשְׁחָא), fr. **מְשַׁח I**.]… Sefaria links it to M02851 `מְשַׁח IV, מִשְׁחָא, מִי׳ II`. hOCR: `Prov. VIII, 15 -pH^a X3X ed. Lag. (ed. Wil. KTOpa), fr.`. [962b · leaf 285](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$286/full/1400,/0/default.jpg)

O00278 `סוּחַ` reads `fr. מְשַׁח I`; Sefaria links M02851 `מְשַׁח IV` (measure). M02846 `מָשַׁח I` (to anoint) carries the I; its `ch. same` M02847 `מְשַׁח` is spelled exactly as the cite. M02850 `מְשַׁח III, מִשְׁחָא, מִישְׁ׳ I` (oil) carries an I on its abbreviation.

**Question.** Which entry is Jastrow's `מְשַׁח I`?

- **O00278**
  - [ ] M02847 `מְשַׁח` (`ch. same` of `מָשַׁח I`): retarget; no numeral set
  - [ ] M02846 `מָשַׁח I`
  - [ ] M02850 (the noun, I on `מִישְׁ׳`)
  - [ ] can't tell from the scan
  - note: 

Recommendation: M02847, retarget only (medium): the cite's spelling is the ch. verb's, and `fr.` names a verb.

### `נָוֶה III`: H01095, N00626, U00934 (target numbered otherwise)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [N00314](https://jastrow.app/#rid:N00314) | `נָוָה` | not found in the hOCR | [884a · leaf 207](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$208/full/1400,/0/default.jpg) |
| [N00315](https://jastrow.app/#rid:N00315) | `נָוֶה I` | `njJ I m., (=nx3) becoming, handsome. Arakh.III, 1` | [884a · leaf 207](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$208/full/1400,/0/default.jpg) |
| [N00316](https://jastrow.app/#rid:N00316) | `נָוֶה II` | `place, circle, dwelling. Y. Ber. IX, 13c bot. (ref. to Jer.` | [884a · leaf 207](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$208/full/1400,/0/default.jpg) |
| [N00317](https://jastrow.app/#rid:N00317) | `נָוֶה` | `n" J, ni" \|J III pr. n. pi. Naveh, east of Gadara in` | [884b · leaf 207](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$208/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [H01095](https://jastrow.app/#rid:H01095): …r. n. pl.Ḥallamish (Rock), a place near Naveh (v. **נָוֶה III**) and inhabited by hostile gen… Sefaria links it to N00316 `נָוֶה II`. hOCR: `Naveh (v.33 111( and inhabited by hostile gentiles. Lev.`. [471b · leaf 494](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$495/full/1400,/0/default.jpg)
- [N00626](https://jastrow.app/#rid:N00626): …pr. n. pl.Nayah (prob. to be read נוה, v. **נָוֶה III**). … Sefaria links it to N00316 `נָוֶה II`. hOCR: `J"!" pr.n.pl. Nay ah (prob. to be read hl3, v. hi 3 III).`. [903a · leaf 226](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$227/full/1400,/0/default.jpg)
- [U00934](https://jastrow.app/#rid:U00934): …5ᵃ top רבי ש׳ דינוה; Ruth R. to II, 19, a. e., v. **נָוֶה III**.—… Sefaria links it to N00316 `נָוֶה II`. hOCR: `Sabb. II, 5a top ITW 'O T3.1; Buth E. to II, 19, a. e., v.`. [1562b · leaf 885](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$886/full/1400,/0/default.jpg)

Three cites (H01095, N00626, U00934) read `v. נָוֶה III` for the place Naveh; Sefaria links N00316 `נָוֶה II`. N00317 (Naveh, a place east of Gadara) is that word: its first gloss opens `, נָוֶוה III pr. n. pl.`, so print sets `נָוֶה, נָוֶוה III` and Sefaria cut the alternate and the numeral into the gloss head. The hOCR reads `n" J, ni" |J III pr. n. pi. Naveh`.

**Question.** Is N00317 Jastrow's `נָוֶה III`?

- **H01095, N00626, U00934**
  - [ ] yes: move `נָוֶוה III` from N00317's gloss head onto its line (`reform` with `homographs`, case 1) and retarget the three cites
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the gloss head, the hOCR and the three cites agree.

### `נוֹחַ I`: N00660 (target numbered otherwise)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [N00340](https://jastrow.app/#rid:N00340) | `נוּחַ` | `"j (b. h.) to rest, lie; to be at ease, rest satisfied. —` | [885b · leaf 208](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$209/full/1400,/0/default.jpg) |
| [N00341](https://jastrow.app/#rid:N00341) | `נוּחַ` | `vQ ch. same; part. pass. f»3. Targ. Y. Deut. XXII, 11` | [885b · leaf 208](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$209/full/1400,/0/default.jpg) |
| [N00342](https://jastrow.app/#rid:N00342) | `נוֹחַ` | `nlO m. (b. h. ; preced.) rest; satisfaction. Tosef. Sot.` | [886b · leaf 209](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$210/full/1400,/0/default.jpg) |
| [N00343](https://jastrow.app/#rid:N00343) | `נוֹחַ II, נוֹחָה` | not found in the hOCR | [886b · leaf 209](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$210/full/1400,/0/default.jpg) |
| [N00344](https://jastrow.app/#rid:N00344) | `נוֹחַ III` | not found in the hOCR | [886b · leaf 209](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$210/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [N00660](https://jastrow.app/#rid:N00660): …m. = h. **נוֹחַ I**, … Sefaria links it to N00343 `נוֹחַ II, נוֹחָה`. [904a · leaf 227](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$228/full/1400,/0/default.jpg)

N00660 `נְיָיח` (rest) reads `m. = h. נוֹחַ I`; Sefaria links N00343 `נוֹחַ II`. N00342 `נוֹחַ` (rest; satisfaction) is the noun meant, and the headword report already names it as N00343's implied-I candidate (X10). No numeral is visible before its `m.` in the hOCR (`nlO m. (b. h. ; preced.) rest`).

**Question.** Does `נוֹחַ I` make N00342 the I?

- **N00342**
  - [ ] yes: N00342 takes I (case 2: Jastrow's text names `נוֹחַ I`; annotated, displayed) and the cite is retargeted
  - [ ] print sets I beside N00342 (case 1)
  - [ ] no (say why in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes, case 2 (high): the text names the I, the meaning matches, and X10 already points at N00342.

### `סְגֵי I`: O00123, O00154, O00159, O00249, O00550, O00554 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [O00120](https://jastrow.app/#rid:O00120) | `סְגֵי, סְגָא I` | `VTn, 11) 1) io swell, rise, grow, spread, increase, thrive.` | [953b · leaf 276](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$277/full/1400,/0/default.jpg) |
| [O00121](https://jastrow.app/#rid:O00121) | `סְגֵי, סְגָא II` | not found in the hOCR | [954a · leaf 277](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$278/full/1400,/0/default.jpg) |
| [O00122](https://jastrow.app/#rid:O00122) | `סְגֵי III, סַגְיָא I` | `Targ. Gen. XXXII, 13 (12) Xg^D (0. ed. Vien. ">apa; some` | [954a · leaf 277](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$278/full/1400,/0/default.jpg) |
| [O00123](https://jastrow.app/#rid:O00123) | `סַגִּי, סַגִּיא, סַגִּיאָה` | not found in the hOCR | [954a · leaf 277](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$278/full/1400,/0/default.jpg) |
| [O00124](https://jastrow.app/#rid:O00124) | `סַגִּי, סַגִּיא II` | `is no way, it is impossible. Keth. 95 b Mb 13M"1 xbl '0 nb` | [954b · leaf 277](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$278/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [O00123](https://jastrow.app/#rid:O00123): …spreading, v. **סְגֵי I**. I.… Sefaria links it to O00121 `סְגֵי, סְגָא II`. [954a · leaf 277](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$278/full/1400,/0/default.jpg)
- [O00154](https://jastrow.app/#rid:O00154): …m.(b. h.  v. **סְגֵי I**; cmp. רַב) grandee, chief, vi… Sefaria links it to O00121 `סְגֵי, סְגָא II`. [955b · leaf 278](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$279/full/1400,/0/default.jpg)
- [O00159](https://jastrow.app/#rid:O00159): …f. pl. (v. **סְגֵי I**, cmp. מוּרְבִּית) [made of tw… Sefaria links it to O00121 `סְגֵי, סְגָא II`. hOCR: `ni'J^P f. pi. (v. i3p I, cmp. pia^a) [made of twigs,`. [955b · leaf 278](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$279/full/1400,/0/default.jpg)
- [O00249](https://jastrow.app/#rid:O00249): …much, very, v. **סַגִּי I**.… Sefaria links it to O00124 `סַגִּי, סַגִּיא II`. [961a · leaf 284](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$285/full/1400,/0/default.jpg)
- [O00550](https://jastrow.app/#rid:O00550): …m. (v. **סְגֵי I**; cmp. סוּגְיָינָא; for the ap… Sefaria links it to O00121 `סְגֵי, סְגָא II`. hOCR: `TO II m. (v. iad I; cmp. M^Mb; for the apocopate`. [975a · leaf 298](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$299/full/1400,/0/default.jpg)
- [O00554](https://jastrow.app/#rid:O00554): …m. (constr. of סֵיגְוָא; **סְגֵי I**) plenty of, much; very. … Sefaria links it to O00121 `סְגֵי, סְגָא II`. hOCR: `WD, *lSO m. (constr. of Nia^d; ">ad I) plenty of, much;`. [975b · leaf 298](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$299/full/1400,/0/default.jpg)

Five cites read `סְגֵי I` for `to grow, increase` (O00123 `spreading`, O00154 `grandee`, O00159, O00550, O00554 `plenty of, much`); Sefaria links them to O00121 `סְגֵי, סְגָא II`. Two entries carry I: O00120 `סְגֵי, סְגָא I` (to swell, rise, grow, increase) and O00122 `סְגֵי III, סַגְיָא I` (multitude), whose I numbers its alternate `סַגְיָא`. The sixth, O00249 `סוּגּוּ` (much, very), reads `v. סַגִּי I`; Sefaria links O00124 `סַגִּי, סַגִּיא II` (impossible), and O00123 `סַגִּי, סַגִּיא, סַגִּיאָה` is the bare member X10 names for O00124's I.

**Question.** Which entries are `סְגֵי I` and `סַגִּי I`?

- **O00123, O00154, O00159, O00550, O00554 (`סְגֵי I`)**
  - [ ] O00120: retarget all five (case 1)
  - [ ] O00122
  - [ ] something else (say what in the note)
  - [ ] can't tell from the scan
  - note: 
- **O00249 (`סַגִּי I`)**
  - [ ] O00123 takes I (case 2: Jastrow's text names `סַגִּי I`; annotated) and the cite moves to it
  - [ ] O00120 (the verb)
  - [ ] something else (say what in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: O00120 for the five (high: its gloss is the meaning they quote); O00123 for O00249 (medium: the cite's spelling, and the form X10 names).

### `עֲדֵי I`: P00136, P00477, P00506 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P00128](https://jastrow.app/#rid:P00128) | `עדי, עָדָה I` | `110 and bin,] to pass by; to pass away, v. next w.` | [1043b · leaf 366](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$367/full/1400,/0/default.jpg) |
| [P00129](https://jastrow.app/#rid:P00129) | `עֲדֵי, עֲדָא` | `"•, ST? ch. same, 1) (corresp. to h. 133) to pass by,` | [1043b · leaf 366](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$367/full/1400,/0/default.jpg) |
| [P00130](https://jastrow.app/#rid:P00130) | `עדי, עָדָה II` | not found in the hOCR | [1044a · leaf 367](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$368/full/1400,/0/default.jpg) |
| [P00131](https://jastrow.app/#rid:P00131) | `עֲדֵי, עֲדָא` | `'"!•, Si/ ch. same, to strip, tear; to make spoil.` | [1044a · leaf 367](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$368/full/1400,/0/default.jpg) |
| [P00132](https://jastrow.app/#rid:P00132) | `עֲדִי I` | `"H.5 I m. (preced.) spoil. Targ. Is. XXXIII, 23 (ed.` | [1044a · leaf 367](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$368/full/1400,/0/default.jpg) |
| [P00133](https://jastrow.app/#rid:P00133) | `עֲדִי II` | `on, cZoiaA:, ornament. Meg. 12b bot., v. 1P3. Esth. R. to` | [1044a · leaf 367](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$368/full/1400,/0/default.jpg) |
| [P00134](https://jastrow.app/#rid:P00134) | `עָדִי` | `"H-? pr. n. m. 'Adi. Ab. Zar. 33a; Men. 69b, v. W*na.` | [1044a · leaf 367](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$368/full/1400,/0/default.jpg) |
| [P00135](https://jastrow.app/#rid:P00135) | `עָדֵי I` | `"H-? I (v. «W I) here is, here are. Ber. 42a N3B3 '5` | [1044a · leaf 367](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$368/full/1400,/0/default.jpg) |
| [P00136](https://jastrow.app/#rid:P00136) | `עָדֵי II` | `Targ. Zech. XIV, 6 (some ed. TO; h. text rYnp, v. Rashi` | [1044a · leaf 367](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$368/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [P00136](https://jastrow.app/#rid:P00136): …m. (**עֲדֵי I**), sub נהורא, passing light, f… Sefaria links it to P00131 `עֲדֵי, עֲדָא`. hOCR: `"H2? II m. (TO I), sub fffttt, passing light, flash.`. [1044a · leaf 367](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$368/full/1400,/0/default.jpg)
- [P00477](https://jastrow.app/#rid:P00477): …נו); (ed. Wil. עֲדַן עֲטָרוּ מננא, corr. acc.; v. **עֲדֵי I**). … Sefaria links it to P00131 `עֲדֵי, עֲדָא`. [1064b · leaf 387](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$388/full/1400,/0/default.jpg)
- [P00506](https://jastrow.app/#rid:P00506): …m. (v. **עֲדֵי I**, Pa.) carrying, going with ch… Sefaria links it to P00131 `עֲדֵי, עֲדָא`. hOCR: `II V, ^s m. (v.^rl, Pa.) carrying, going with child.`. [1067a · leaf 390](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$391/full/1400,/0/default.jpg)

Three cites read `עֲדֵי I`: P00136 (`passing light`), P00477 and P00506 (`carrying`, Pa.); Sefaria links P00131 (`עֲדֵי, עֲדָא`, ch. of `עָדָה II`, to strip). Entries carrying I: P00128 `עדי, עָדָה I` (to pass by), P00132 `עֲדִי I` (spoil) and P00135 `עָדֵי I` (here is). P00129 `עֲדֵי, עֲדָא` is the `ch. same` of `עָדָה I` (to pass by), spelled exactly as the cites.

**Question.** Which entry is Jastrow's `עֲדֵי I`?

- **P00136, P00477, P00506**
  - [ ] P00129 (`ch. same` of `עָדָה I`): retarget all three; no numeral set
  - [ ] P00128 `עָדָה I`
  - [ ] another (say which, per cite, in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: P00129, retarget only (medium): the spelling and `passing` match; the noun Is (P00132, P00135) are pointed otherwise.

### `עָמַד II`: P00859, P00866, Q01968 (target numbered otherwise)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P00857](https://jastrow.app/#rid:P00857) | `עֲמַד` | `"□• ch. same, to stoy, dwell, v. IE" II.` | [1086b · leaf 409](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$410/full/1400,/0/default.jpg) |
| [P00858](https://jastrow.app/#rid:P00858) | `עֹמֶד, עוֹ׳` | `^'raW dipad lias stay where thou standest.` | [1086b · leaf 409](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$410/full/1400,/0/default.jpg) |
| [P00859](https://jastrow.app/#rid:P00859) | `עָמָד I` | `ID^ I m. (v. las H, 2) urln-soaked dung. Gen. R. s. 39` | [1086b · leaf 409](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$410/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [P00859](https://jastrow.app/#rid:P00859): …m. (v. **עָמַד II**, 2) urin-soaked dung. … Sefaria links it to P00859 `עָמָד I`. hOCR: `ID^ I m. (v. las H, 2) urln-soaked dung. Gen. R. s. 39`. [1086b · leaf 409](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$410/full/1400,/0/default.jpg)
- [P00866](https://jastrow.app/#rid:P00866) (in `language_reference`): …m.(b. h.; **עָמַד II)**column, stand. … Sefaria links it to P00859 `עָמָד I`. [1087a · leaf 410](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$411/full/1400,/0/default.jpg)
- [Q01968](https://jastrow.app/#rid:Q01968): …n of the fence is larger than the ruined part, v. **עָמַד II**. … Sefaria links it to P00859 `עָמָד I`. hOCR: `unimpaired portion of the fence is larger than the ruined`. [1237a · leaf 560](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$561/full/1400,/0/default.jpg)

Three cites read `עָמַד II` (P00859 itself, P00866 `column`, Q01968 `fence`); Sefaria links P00859 `עָמָד I` (dung). The verb is stored `עָמַך I` (P00855) and `עָמַך II` (P00856): a final kaf where print has `ד`, which hides both from a consonant search. P00866's cite sits in `language_reference`, which no patch op reaches (review ledger L50).

**Question.** Is P00856 (`עָמַך II`) Jastrow's `עָמַד II`?

- **P00859, P00866, Q01968**
  - [ ] yes: retarget the three to P00856 (case 1; P00866 waits on L50); P00855/P00856's `ך` goes to the headword list as an OCR question
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): `column` and `stand` are the verb's, and the `ך` for `ד` is an OCR glyph slip like F00009's (HW-ocr-dalet).

### `עֲנֵי I`: P00973 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P00970](https://jastrow.app/#rid:P00970) | `עני, עָנָה I` | `to speak; to respond; to speak or sing in chorus; to anstcer.` | [1093a · leaf 416](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$417/full/1400,/0/default.jpg) |
| [P00971](https://jastrow.app/#rid:P00971) | `עֲנֵי, עֲנָא, עֲנָה` | `*'35\|, W? 0~l!D3?) ch. same. Targ. II Esth. VI, 10.` | [1093a · leaf 416](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$417/full/1400,/0/default.jpg) |
| [P00972](https://jastrow.app/#rid:P00972) | `עני, עָנָה II` | `"02, (132 II (b. h. ; cmp. ii3X) to press, be pressed;` | [1093b · leaf 416](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$417/full/1400,/0/default.jpg) |
| [P00973](https://jastrow.app/#rid:P00973) | `עֲנֵי, עֲנָא` | not found in the hOCR | [1093b · leaf 416](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$417/full/1400,/0/default.jpg) |
| [P00974](https://jastrow.app/#rid:P00974) | `עֹנִי` | not found in the hOCR | [1093b · leaf 416](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$417/full/1400,/0/default.jpg) |
| [P00975](https://jastrow.app/#rid:P00975) | `עַנִּי` | `"02 ch. = h. ">ab. Targ. 0. Deut. XVI, 3 ed. Berl. (oth.` | [1094a · leaf 417](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$418/full/1400,/0/default.jpg) |
| [P00976](https://jastrow.app/#rid:P00976) | `עָנִי` | `nD3? m. (b. h.; nssil) [afflicted, humble,] poor. Sabb.` | [1094a · leaf 417](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$418/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [P00973](https://jastrow.app/#rid:P00973): … וכ׳; [Rashi interprets: give answer, my lord, v. **עֲנֵי I**].… Sefaria links it to P00973 `עֲנֵי, עֲנָא`. [1093b · leaf 416](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$417/full/1400,/0/default.jpg)

P00973's own text reads `Rashi interprets: give answer, my lord, v. עֲנֵי I`, and Sefaria links it to P00973 itself. The only I is P00970 `עני, עָנָה I` (to answer); its `ch. same` is P00971 `עֲנֵי, עֲנָא, עֲנָה`, spelled exactly as the cite.

**Question.** Which entry is Jastrow's `עֲנֵי I`?

- **P00973**
  - [ ] P00971 (`ch. same` of `עָנָה I`): retarget; no numeral set
  - [ ] P00970 `עָנָה I`
  - [ ] can't tell from the scan
  - note: 

Recommendation: P00971, retarget only (high): `answer` is its meaning and its spelling is the cite's.

### `עָרֵב II`: P01347 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P01242](https://jastrow.app/#rid:P01242) | `עָרַב I` | `3HP I (b. h.; cmp. 3nx) [to insert, press into, inter-` | [1109b · leaf 432](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$433/full/1400,/0/default.jpg) |
| [P01243](https://jastrow.app/#rid:P01243) | `עֲרַב, עֲרֵיב` | `3 }Jf J™" ch. same, 1) to vouch for, be surety for.` | [1110a · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01244](https://jastrow.app/#rid:P01244) | `עָרַב II` | `Del. Assyr. Handw., p. 1 26) to go in, (cmp. aid) to set. —` | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01245](https://jastrow.app/#rid:P01245) | `עֲרַב` | not found in the hOCR | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01246](https://jastrow.app/#rid:P01246) | `עָרֵב I` | `cmp. esp. Targ. Ex. XXX, 35,] to be sweet, pleasant. Lam.` | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01247](https://jastrow.app/#rid:P01247) | `עָרִב II` | `J y II m.(b.h.; preced. )spiced, sweet ; pleasing. Dem.` | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01248](https://jastrow.app/#rid:P01248) | `עָרֵּב` | not found in the hOCR | [1111a · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |
| [P01249](https://jastrow.app/#rid:P01249) | `עָרֵב III` | `I, 4 '31 'S i? son bring me one to go security, and I shall` | [1111a · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |
| [P01250](https://jastrow.app/#rid:P01250) | `עֹרֵב` | not found in the hOCR | [1111a · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |
| [P01251](https://jastrow.app/#rid:P01251) | `עֶרֶב` | `'S3 in the evening (at prayer) ; a. v.fr. — Trnsf. decline. Gen.` | [1111a · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |
| [P01252](https://jastrow.app/#rid:P01252) | `עֲרָב I` | not found in the hOCR | [1111b · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |
| [P01253](https://jastrow.app/#rid:P01253) | `עֲרָב II` | `J */ II pr. n. pi. 'Arab, near Sepphoris in Upper` | [1111b · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |
| [P01254](https://jastrow.app/#rid:P01254) | `עֵרֶב` | `I, 5 'S din a thread of the woof (thicker than that of` | [1111b · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [P01347](https://jastrow.app/#rid:P01347): …m. = h. **עָרֵב II**, sweet, pleasing. … Sefaria links it to P01249 `עָרֵב III`. [1117a · leaf 440](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$441/full/1400,/0/default.jpg)

P01347 `עָרִיב` reads `m. = h. עָרֵב II, sweet, pleasing`; Sefaria links P01249 `עָרֵב III` (surety). Three entries carry II; P01247, stored `עָרִב II`, is glossed `spiced, sweet; pleasing`. Its hiriq against the cite's tsere is what kept the pointing check from settling it.

**Question.** Is P01247 Jastrow's `עָרֵב II`?

- **P01347**
  - [ ] yes: retarget to P01247 (case 1)
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the cite quotes P01247's gloss word for word.

### `עֵרָבוֹן II`: P01275 (one bare member)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P01272](https://jastrow.app/#rid:P01272) | `עֵרָבוֹן, עֵי׳ I` | not found in the hOCR | [1112b · leaf 435](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$436/full/1400,/0/default.jpg) |
| [P01273](https://jastrow.app/#rid:P01273) | `עֵרָבוֹן, עֵי׳` | not found in the hOCR | [1112b · leaf 435](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$436/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [P01275](https://jastrow.app/#rid:P01275): …n transactions between a man and his neighbor (v. **עֵרָבוֹן II**); Yalk. ib. 150. … Sefaria links it to P01273 `עֵרָבוֹן, עֵי׳`. hOCR: `from going security in transactions between a man and`. [1113a · leaf 436](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$437/full/1400,/0/default.jpg)

P01275 `עֲרֵבוּת` reads `(v. עֵרָבוֹן II)` for going security, and Sefaria links it to P01273 `עֵרָבוֹן, עֵי׳` (pledge), which carries no numeral; P01272 `עֵרָבוֹן, עֵי׳ I` (mingling) is the I. The hOCR shows none on P01273 (`VCnS?, ^V m. (b. h.; 31SI) 1) pledge`).

**Question.** Does P01273 take II?

- **P01273**
  - [ ] yes: P01273 takes II (case 2: Jastrow's text names `עֵרָבוֹן II`; annotated, displayed); the link already points there
  - [ ] print sets II beside P01273 (case 1)
  - [ ] no: kept as printed (case 3)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes, case 2 (high): the family has an I and no II, and the text names the II with the meaning P01273 carries.

### `פַּרְפֵּר I`: Q02018 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [Q01961](https://jastrow.app/#rid:Q01961) | `פִּרְפֵּר, פִּירְ׳ I` | `pulverize. Tosef. Sabb. XII (XIII) 14 '31 "ppdlba T"]B"©a` | [1236b · leaf 559](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$560/full/1400,/0/default.jpg) |
| [Q01962](https://jastrow.app/#rid:Q01962) | `פַּרְפֵּר` | not found in the hOCR | [1236b · leaf 559](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$560/full/1400,/0/default.jpg) |
| [Q01963](https://jastrow.app/#rid:Q01963) | `פִּרְפֵּר, פִּירְ׳ II` | `to move convulsively, struggle (in agony). Snh. 37b aiim` | [1236b · leaf 559](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$560/full/1400,/0/default.jpg) |
| [Q01964](https://jastrow.app/#rid:Q01964) | `פַּרְפֵּר` | `"l£pD ch. same. Targ. Y. Gen. XLII, 21 "jStfTp IB-iBa` | [1236b · leaf 559](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$560/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [Q02018](https://jastrow.app/#rid:Q02018): …Targ. Ps. XXII, 15 Ms., v. **פַּרְפֵּר I**.—… Sefaria links it to Q01964 `פַּרְפֵּר`. hOCR: `crumbled. Targ. Ps. XXII, 15 Ms., v. "iSHB I.— Pes. 74b`. [1241b · leaf 564](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$565/full/1400,/0/default.jpg)

Q02018 `פְּרַר` reads `Targ. Ps. XXII, 15 Ms., v. פַּרְפֵּר I`; Sefaria links Q01964 `פַּרְפֵּר` (ch. of `פִּרְפֵּר II`). The I is Q01961 `פִּרְפֵּר, פִּירְ׳ I` (Hebrew, to pulverize); its `ch. same`, Q01962 `פַּרְפֵּר`, is spelled exactly as the cite, and a Targum passage is Aramaic. The hOCR reads the `I` (`Targ. Ps. XXII, 15 Ms., v. "iSHB I.`).

**Question.** Which entry is Jastrow's `פַּרְפֵּר I`?

- **Q02018**
  - [ ] Q01962 (`ch. same` of `פִּרְפֵּר I`): retarget; no numeral set
  - [ ] Q01961 `פִּרְפֵּר I`
  - [ ] can't tell from the scan
  - note: 

Recommendation: Q01962, retarget only (medium): spelling and language match.

### `צִבְעָא I`: S01308 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [R00058](https://jastrow.app/#rid:R00058) | `צֶבַע, צִבְעָא, צִי׳ I` | `"21, H"21, '"1 I ch. same, constr. 53S. Targ. Ex.` | [1259b · leaf 582](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$583/full/1400,/0/default.jpg) |
| [R00060](https://jastrow.app/#rid:R00060) | `צַבָּעָא` | `S"~I£ ch.same. Gitt.52b 'S n"i3S Amram, the dyer.—` | [1259b · leaf 582](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$583/full/1400,/0/default.jpg) |
| [R00061](https://jastrow.app/#rid:R00061) | `צִבְעָא, צִי׳ I` | not found in the hOCR | [1259b · leaf 582](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$583/full/1400,/0/default.jpg) |
| [R00062](https://jastrow.app/#rid:R00062) | `צִבְעָא, צִי׳ II` | `&C2X, '~1 II f. (S3S I) finger, toe, fang. Targ. Y.` | [1259b · leaf 582](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$583/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [S01308](https://jastrow.app/#rid:S01308): … clean bird). Y. Pes. III, beg. 29ᵈ דיִקְלוֹט, v. **צִבְעָא I**; a. fr.—… Sefaria links it to R00062 `צִבְעָא, צִי׳ II`. hOCR: `Y. Pes.III, beg. 29d albp^n, v. KKMI; a. fr. — Meil. llb,`. [1374b · leaf 697](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$698/full/1400,/0/default.jpg)

S01308 `קְלַט` reads `v. צִבְעָא I` (dye); Sefaria links R00062 `צִבְעָא, צִי׳ II` (finger). Two entries carry I: R00058 `צֶבַע, צִבְעָא, צִי׳ I` (ch. same, dye) and R00061 `צִבְעָא, צִי׳ I`, a cross-reference line `v. צֶבַע ch.` that points at R00058.

**Question.** Which entry is Jastrow's `צִבְעָא I`?

- **S01308**
  - [ ] R00058 (the article): retarget (case 1)
  - [ ] R00061 (the cross-reference line)
  - [ ] can't tell from the scan
  - note: 

Recommendation: R00058 (medium): R00061 only sends the reader to it.

### `צְדֵי I`: R00162, R00759 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [R00100](https://jastrow.app/#rid:R00100) | `צדי, צָדָה I` | `"IX, mil I (cmp. is) to lie in wait, aim; to hunt,` | [1261b · leaf 584](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$585/full/1400,/0/default.jpg) |
| [R00101](https://jastrow.app/#rid:R00101) | `צְדֵי, צְדָא` | `"HS, Sill ch. same, to hunt, capture. Targ.Ps.XXXV, 8` | [1262a · leaf 585](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$586/full/1400,/0/default.jpg) |
| [R00102](https://jastrow.app/#rid:R00102) | `צדי, צָדָה II` | `to remove (the inhabitants of), nm&e desolate. Gen. B.` | [1262a · leaf 585](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$586/full/1400,/0/default.jpg) |
| [R00103](https://jastrow.app/#rid:R00103) | `צְדֵי, צְדָא` | `"HS, SIS ch. same, to desolate. Targ. Ps. IX, 7 xrvns` | [1262a · leaf 585](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$586/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [R00162](https://jastrow.app/#rid:R00162): …Targ. Prov. VI, 26 (Ms. צדיא, v. **צְדֵי I**). … Sefaria links it to R00103 `צְדֵי, צְדָא`. hOCR: `Targ. Prov.VI, 2. Ib. Ill, 26.— Lev. R.s. 30 '21 NlMl lisnx`. [1266a · leaf 589](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$590/full/1400,/0/default.jpg)
- [R00759](https://jastrow.app/#rid:R00759): …their wombs cut.—[Targ. Prov. XVIII, 1; XX, 3, v. **צְדֵי I**.]… Sefaria links it to R00103 `צְדֵי, צְדָא`. hOCR: `their wombs cut.— [Targ. Prov. XVIII, 1 ; XX, 3, v. "^TX I.]`. [1301a · leaf 624](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$625/full/1400,/0/default.jpg)

R00162 and R00759 read `v. צְדֵי I` after Targum passages; Sefaria links R00103 (`צְדֵי, צְדָא`, ch. of `צָדָה II`, to desolate). The I is R00100 `צדי, צָדָה I` (to lie in wait, hunt); its `ch. same`, R00101 `צְדֵי, צְדָא` (to hunt), is spelled exactly as the cites.

**Question.** Which entry is Jastrow's `צְדֵי I`?

- **R00162, R00759**
  - [ ] R00101 (`ch. same` of `צָדָה I`): retarget both; no numeral set
  - [ ] R00100 `צָדָה I`
  - [ ] can't tell from the scan
  - note: 

Recommendation: R00101, retarget only (medium): spelling and Targum match.

### `צְפר I`: R00715 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [R00711](https://jastrow.app/#rid:R00711) | `צָפַר` | `IDS (b. h., v. 1BX II) to circle; v. rTV<$X II. [Y.Ter.` | [1298b · leaf 621](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$622/full/1400,/0/default.jpg) |
| [R00712](https://jastrow.app/#rid:R00712) | `צְפַר I` | `"IDS I (cmp. h6S) [to be bright; denom. X^EX; (of` | [1298b · leaf 621](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$622/full/1400,/0/default.jpg) |
| [R00713](https://jastrow.app/#rid:R00713) | `צְפַר II` | `to plait one round. Y. Sabb. VII, 10c top pBip liFt 'pn` | [1298b · leaf 621](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$622/full/1400,/0/default.jpg) |
| [R00714](https://jastrow.app/#rid:R00714) | `צְפַר III, צִפְרָא` | `Yomali end, 39b ICTOp 'S n">nS3SX3 n^ 'Wl and he drew` | [1298b · leaf 621](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$622/full/1400,/0/default.jpg) |
| [R00715](https://jastrow.app/#rid:R00715) | `צְפַר IV, צַפְרָא` | not found in the hOCR | [1298b · leaf 621](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$622/full/1400,/0/default.jpg) |
| [R00716](https://jastrow.app/#rid:R00716) | `צִפֹּר` | not found in the hOCR | [1298b · leaf 621](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$622/full/1400,/0/default.jpg) |
| [R00717](https://jastrow.app/#rid:R00717) | `צִפַּר, צִפְּרָא, צִפּוֹר, צִפּוֹרָא, צִי׳` | `bird. Targ. 0T. Gen. VII, 14 (Y.11ES). Targ. 0. Lev. XIV, 5` | [1298b · leaf 621](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$622/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [R00715](https://jastrow.app/#rid:R00715): …istling signal.—Pl. as ab Y. Ḥag. II, 78ᵃ top, v. **צְפר I**.—[… Sefaria links it to R00715 `צְפַר IV, צַפְרָא`. hOCR: `a. e!— 2) tvhistling signal. — PL as ab Y. Hag. II, 78a top,`. [1298b · leaf 621](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$622/full/1400,/0/default.jpg)

R00715 `צְפַר IV` (signal) reads in its own text `Y. Ḥag. II, 78ᵃ top, v. צְפר I`, and Sefaria links it to R00715 itself. Its gloss opens `m. (צְפַר I)`, naming R00712 `צְפַר I`. The cite's `צְפר` lacks the patah.

**Question.** Is R00712 Jastrow's `צְפַר I` here?

- **R00715**
  - [ ] yes: retarget to R00712 (case 1)
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): R00715's own etymology names R00712.

### `קיּץ I`: S01462 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [S00526](https://jastrow.app/#rid:S00526) | `קָוַץ` | not found in the hOCR | [1339a · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00527](https://jastrow.app/#rid:S00527) | `קְוַץ` | `7]p ch. same. Succ. 23b KTNg Ar. (ed. '113), v. ptt.` | [1339a · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00528](https://jastrow.app/#rid:S00528) | `קוּץ I` | not found in the hOCR | [1339a · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00529](https://jastrow.app/#rid:S00529) | `קוּץ` | not found in the hOCR | [1339a · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00530](https://jastrow.app/#rid:S00530) | `קוּץ II` | not found in the hOCR | [1339a · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00531](https://jastrow.app/#rid:S00531) | `קוּץ III` | not found in the hOCR | [1339a · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00532](https://jastrow.app/#rid:S00532) | `קוּץ` | not found in the hOCR | [1339a · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00533](https://jastrow.app/#rid:S00533) | `קוּץ IV` | not found in the hOCR | [1339b · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00534](https://jastrow.app/#rid:S00534) | `קוֹץ I` | `bot. (ref. to Mic. VH, 18) '31 rU 'pi JT'bx a fat tail with` | [1339b · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00535](https://jastrow.app/#rid:S00535) | `קוֹץ II` | `Ill, 74b bot. (ref. to Mish. ib. Ill, 7, 'you must not inter-` | [1340a · leaf 663](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$664/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [S01462](https://jastrow.app/#rid:S01462): …Yalk. Lev. 626, v. **קיּץ I**.… Sefaria links it to S00533 `קוּץ IV`. hOCR: `aversion. Yalk. Lev. 626, v. *f ap I.`. [1385a · leaf 708](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$709/full/1400,/0/default.jpg)

S01462 `קָמֵט` (aversion) reads `Yalk. Lev. 626, v. קיּץ I`; the cite's `קיּץ` is a garbled `קוּץ`, and Sefaria links S00533 `קוּץ IV`. S01462's other `קוּץ I` cite resolves to S00528 `קוּץ I` (to feel loathing) by exact spelling and is in the retarget table.

**Question.** Is S00528 Jastrow's `קוּץ I` here too?

- **S01462**
  - [ ] yes: retarget to S00528 (case 1) and correct the cite's `קיּץ` to `קוּץ` (case 1, if the scan reads `קוּץ`)
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): `aversion` is S00528's meaning, and the same entry's other cite names it.

### `קִיטְרָא I`: S00305 (one bare member)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [S00922](https://jastrow.app/#rid:S00922) | `קִיטְרָא, קוּטְ׳, קִטְ׳` | `yn-J^p, fp^p, 'dp, 'dip. Targ.II Esth. VI, 10 trwiri 'p` | [1358b · leaf 681](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$682/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [S00305](https://jastrow.app/#rid:S00305): …, v. **קִיטְרָא I**… Sefaria links it to S00922 `קִיטְרָא, קוּטְ׳, קִטְ׳`. [1326b · leaf 649](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$650/full/1400,/0/default.jpg)

S00305 `קוּטְרָא` reads `v. קִיטְרָא I`, linked to S00922 `קִיטְרָא, קוּטְ׳, קִטְ׳` (knot). The dictionary has no other `קִיטְרָא`, so no II makes an I.

**Question.** What does print set after `קִיטְרָא` in S00305?

- **S00305**
  - [ ] print sets `I`: kept as printed (case 3: `kept` on the cite)
  - [ ] print sets no numeral: the `I` is Sefaria's; remove it (case 1)
  - [ ] something else (say what in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: kept (low): nothing explains the `I`; S00922's own gloss opens `(קְטַר I)`, so the numeral may belong to the verb.

### `רָעָה I`: M02733, M02738 (no carrier)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [T00881](https://jastrow.app/#rid:T00881) | `רָעָה` | not found in the hOCR | [1486a · leaf 809](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$810/full/1400,/0/default.jpg) |
| [T00882](https://jastrow.app/#rid:T00882) | `רָעָה` | not found in the hOCR | [1486a · leaf 809](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$810/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [M02733](https://jastrow.app/#rid:M02733) (in `language_reference`): …m.(b. h.; **רָעָה I)**pasture. … Sefaria links it to T00882 `רָעָה`. [845b · leaf 168](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$169/full/1400,/0/default.jpg)
- [M02738](https://jastrow.app/#rid:M02738) (in `language_reference`): …f.(b. h.; **רָעָה I)**pasture-ground, pasture. … Sefaria links it to T00882 `רָעָה`. [845b · leaf 168](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$169/full/1400,/0/default.jpg)

M02733 `מִרְעֶה` and M02738 `מַרְעִית I` read `(b. h.; רָעָה I) pasture`, both in `language_reference`. Sefaria links T00882 `רָעָה`, a cross-reference line (`to feed, v. רעי`) that points at the verb T00889 `רעי, רָעָה` (to pasture, feed), eight entries on and outside the five-entry window.

**Question.** Where should `רָעָה I` point?

- **M02733, M02738**
  - [ ] T00889 (the verb): retarget both once an op reaches `language_reference` (L50); no numeral set
  - [ ] T00882 (the cross-reference line): the link stays
  - [ ] something else (say what in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: T00889, retarget only (medium): it holds the meaning; whether print numbers it I is a headword question this list does not ask.

### `שַׁב I`: U00126, U00779, U00807 (no carrier)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U00058](https://jastrow.app/#rid:U00058) | `שֵׁב` | not found in the hOCR | [1509b · leaf 832](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$833/full/1400,/0/default.jpg) |
| [U00059](https://jastrow.app/#rid:U00059) | `שַׁב, שֵׁב, שֵׁיב` | `Targ/o. Gen. XXIX, 27, sq. ed. Berl. (oth. ed. Xn313i3 ;` | [1509b · leaf 832](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$833/full/1400,/0/default.jpg) |
| [U00060](https://jastrow.app/#rid:U00060) | `שַׁב, שַׁבָּא, שׁוּבָּא` | not found in the hOCR | [1509b · leaf 832](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$833/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [U00126](https://jastrow.app/#rid:U00126): …, v. **שַׁב I**… Sefaria links it to U00060 `שַׁב, שַׁבָּא, שׁוּבָּא`. [1514a · leaf 837](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$838/full/1400,/0/default.jpg)
- [U00779](https://jastrow.app/#rid:U00779): …seven, v. **שַׁב I**.… Sefaria links it to U00060 `שַׁב, שַׁבָּא, שׁוּבָּא`. [1556a · leaf 879](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$880/full/1400,/0/default.jpg)
- [U00807](https://jastrow.app/#rid:U00807): …, v. **שַׁב I**… Sefaria links it to U00060 `שַׁב, שַׁבָּא, שׁוּבָּא`. [1557b · leaf 880](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$881/full/1400,/0/default.jpg)

Three cites (U00126 `שְׁבִיסְרָאָה`, U00779 `שֵׁיב` seven, U00807 `שֵׁיבְסַר`) read `v. שַׁב I`; Sefaria links U00060 `שַׁב, שַׁבָּא, שׁוּבָּא` (pre-eminence). U00059 `שַׁב, שֵׁב, שֵׁיב` (= h. `שֶׁבַע`, seven) is the word all three quote. No member carries a numeral.

**Question.** Which entry is Jastrow's `שַׁב I`, and does print number it?

- **U00126, U00779, U00807**
  - [ ] U00059, and print sets I on it and II on U00060: dropped by Sefaria (case 1); retarget the three
  - [ ] U00059 takes I from these cites (case 2, annotated); retarget the three
  - [ ] U00059, retarget only; no numeral set
  - [ ] can't tell from the scan
  - note: 

Recommendation: U00059 (high for the target); the numeral is the scan's to decide (low).

### `שְׁבַט II`: U00107, U00801 (target numbered otherwise)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U00102](https://jastrow.app/#rid:U00102) | `שָׁבַט` | `the weaving rod, to make the iveb close (v. Sm. Ant. s. v.` | [1512b · leaf 835](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$836/full/1400,/0/default.jpg) |
| [U00103](https://jastrow.app/#rid:U00103) | `שְׁבַט I` | `»w I ch. (v. preced.) to strike tvith the rod, to beat.` | [1512b · leaf 835](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$836/full/1400,/0/default.jpg) |
| [U00104](https://jastrow.app/#rid:U00104) | `שֵׁבֶט` | not found in the hOCR | [1512b · leaf 835](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$836/full/1400,/0/default.jpg) |
| [U00105](https://jastrow.app/#rid:U00105) | `שְׁבַט, שִׁבְטָא, שֵׁיבַט, שִׁיבְטָא, שׁוּ׳` | `1 ) rod, sfa/f. Targ. Prov. XXII, 8. Ib. X, 13 (Ar. a. Levita` | [1513a · leaf 836](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$837/full/1400,/0/default.jpg) |
| [U00106](https://jastrow.app/#rid:U00106) | `שְׁבָט` | `of the Jewish calendar, of thirty days, beginning between` | [1513a · leaf 836](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$837/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [U00107](https://jastrow.app/#rid:U00107): …, v. **שְׁבַט II**… Sefaria links it to U00103 `שְׁבַט I`. [1513a · leaf 836](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$837/full/1400,/0/default.jpg)
- [U00801](https://jastrow.app/#rid:U00801): …, v. **שְׁבַט II**… Sefaria links it to U00103 `שְׁבַט I`. [1557b · leaf 880](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$881/full/1400,/0/default.jpg)

U00107 `שִׁבְטָא` and U00801 `שֵׁיבַט, שִׁיבְטָא` read `v. שְׁבַט II`; Sefaria links U00103 `שְׁבַט I` (ch., to strike with the rod). Both citing headwords are alternates of U00105 `שְׁבַט, שִׁבְטָא, שֵׁיבַט, שִׁיבְטָא, שׁוּ׳` (rod, staff), which carries no numeral; the family has an I and no II.

**Question.** Is U00105 Jastrow's `שְׁבַט II`?

- **U00105**
  - [ ] yes, print sets II on it: dropped by Sefaria (case 1); retarget both
  - [ ] yes, print sets none: U00105 takes II (case 2, annotated); retarget both
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high for the target): the citing headwords are U00105's own alternates; the scan decides case 1 or 2.

### `שְׁוַוח II`: U00362, U00518 (target numbered otherwise)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U00343](https://jastrow.app/#rid:U00343) | `שְׁוַוח I` | `XXVII, 25 ed. Lag. (some ed. n"r, corr. ace; ed. Wil.` | [1529b · leaf 852](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$853/full/1400,/0/default.jpg) |
| [U00344](https://jastrow.app/#rid:U00344) | `שְׁוַוח, שְׁוַח, שׁוּחַ` | not found in the hOCR | [1529b · leaf 852](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$853/full/1400,/0/default.jpg) |
| [U00345](https://jastrow.app/#rid:U00345) | `שְׁוַוח, שְׁוַח` | `m Vj III, nid m. (preced.) pit. Targ. Pa. VII, 16` | [1530a · leaf 853](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$854/full/1400,/0/default.jpg) |
| [U00346](https://jastrow.app/#rid:U00346) | `שַׁוַּוח, שַׁוַּח` | `Targ. Job XXII, 29 tOrVHOa 'ID troubled on account of sin` | [1530a · leaf 853](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$854/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [U00362](https://jastrow.app/#rid:U00362): … ch. same, v. **שְׁוַוח II**.—Part. שָׁיֵחַ; f. שָׁיְחָא, … Sefaria links it to U00343 `שְׁוַוח I`. hOCR: `HID, ITtp ch. same, v.niyr II.— Part. tT^D; f. fctrrr,`. [1530b · leaf 853](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$854/full/1400,/0/default.jpg)
- [U00518](https://jastrow.app/#rid:U00518): …, Targ. Ps. LXXIV, 3 משווק, משוק, v. **שְׁוַוח II**… Sefaria links it to U00343 `שְׁוַוח I`. hOCR: `p"l©, Targ. Ps. LXXIV, 3 pYlBO, plttJO, v. Wf*k} II.`. [1540b · leaf 863](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$864/full/1400,/0/default.jpg)

U00362 `שׁוּחַ, שְׁיַח` (`ch. same, v. שְׁוַוח II`) and U00518 read `v. שְׁוַוח II`; Sefaria links U00343 `שְׁוַוח I`. U00344 `שְׁוַוח, שְׁוַח, שׁוּחַ` (= h. `שׁוּחַ`) is the II the first quotes. Sefaria dropped numerals in this family: the hOCR reads U00345 (pit) as `m Vj III, nid m. (preced.) pit.`, a III the data lacks.

**Question.** Is U00344 Jastrow's `שְׁוַוח II` (and U00345 its III)?

- **U00344**
  - [ ] yes, and print sets II on it: case 1; retarget both cites
  - [ ] yes, print sets none: U00344 takes II (case 2, annotated); retarget both
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 
- **U00345**
  - [ ] print sets III: dropped by Sefaria (case 1, `reform.homographs`, displayed)
  - [ ] no numeral in print
  - [ ] can't tell from the scan
  - note: 

Recommendation: U00344 is the II and U00345 takes III (high): the hOCR shows U00345's III, and U00362 is U00344's own `ch. same` spelling.

### `שַׁוְיָא II`: U00835 (one bare member)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U00395](https://jastrow.app/#rid:U00395) | `שָׁוְי, שַׁוְיָא I` | not found in the hOCR | [1533a · leaf 856](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$857/full/1400,/0/default.jpg) |
| [U00396](https://jastrow.app/#rid:U00396) | `שַׁוְיָא, שַׁוְויָא, שִׁיוְו׳, שִׁוּוּיָא, שִׁיוּוּ׳` | `Cy~) [that which is levelled, smooth,] couch. Targ. Y.` | [1533a · leaf 856](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$857/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [U00835](https://jastrow.app/#rid:U00835): …, v. **שַׁוְיָא II**… Sefaria links it to U00395 `שָׁוְי, שַׁוְיָא I`. [1558b · leaf 881](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$882/full/1400,/0/default.jpg)

U00835 `שִׁיוְוָיא, שִׁיוּוּיָא` reads `v. שַׁוְיָא II`; Sefaria links U00395 `שָׁוְי, שַׁוְיָא I`. The citing headwords are alternates of U00396 `שַׁוְיָא, שַׁוְויָא, שִׁיוְו׳, …` (couch), the only bare member.

**Question.** Is U00396 Jastrow's `שַׁוְיָא II`?

- **U00396**
  - [ ] yes, print sets II on it: case 1; retarget
  - [ ] yes, print sets none: U00396 takes II (case 2, annotated); retarget
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high for the target): the citing headwords are U00396's alternates; the scan decides case 1 or 2.

### `שׁוּעַ I`: U01637 (no carrier)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U00475](https://jastrow.app/#rid:U00475) | `שׁוּעַ` | not found in the hOCR | [1537b · leaf 860](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$861/full/1400,/0/default.jpg) |
| [U00476](https://jastrow.app/#rid:U00476) | `שׁוּעַ` | `51123 oh. same, l)[to smooth over,] to plaster. Targ.O.` | [1538a · leaf 861](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$862/full/1400,/0/default.jpg) |
| [U00477](https://jastrow.app/#rid:U00477) | `שָׁוַע` | not found in the hOCR | [1538a · leaf 861](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$862/full/1400,/0/default.jpg) |
| [U00478](https://jastrow.app/#rid:U00478) | `שׁוֹעַ` | `E. introd.(E.Joh 1) (ref. to Is. XXII, 5) ^..."pp-ipa 1TI1D` | [1538a · leaf 861](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$862/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [U01637](https://jastrow.app/#rid:U01637): …Gen. R. s. 44 היה לבו רפה כש׳, v. **שׁוּעַ I**. … Sefaria links it to U00476 `שׁוּעַ`. [1610a · leaf 933](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$934/full/1400,/0/default.jpg)

U01637 `שַׁעֲוָה` (wax) reads `v. שׁוּעַ I`; Sefaria links U00476 `שׁוּעַ` (ch. same, to smooth over, plaster). No member carries a numeral: U00475 `שׁוּעַ` (Hebrew, cmp. `שעע`), U00476 its `ch. same`, U00477 `שָׁוַע`, U00478 `שׁוֹעַ` (rock).

**Question.** Which entry is Jastrow's `שׁוּעַ I`?

- **U01637**
  - [ ] U00475 (the Hebrew verb): retarget; numeral as print sets it (say in the note)
  - [ ] U00476 (as linked): kept (case 3: `kept` on the cite)
  - [ ] something else (say what in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: U00475 (low): `wax` derives from `to be smooth`; whether print numbers a `שׁוּעַ I, II` is for the scan.

### `שׁוּף I`: P01145, U00043, U00490 (target numbered otherwise)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U00488](https://jastrow.app/#rid:U00488) | `שׁוּף` | `^1123 I(b.h.;= C]ti3) to blow. Num. E.s. 5, beg. ...fWl` | [1538b · leaf 861](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$862/full/1400,/0/default.jpg) |
| [U00490](https://jastrow.app/#rid:U00490) | `שׁוּף II` | `^fllD II \)to smooth, rub, polish, sharpen; to smear` | [1539a · leaf 862](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$863/full/1400,/0/default.jpg) |
| [U00491](https://jastrow.app/#rid:U00491) | `שׁוּף` | `*\|*HU ch. same, 1) to rub (with oil), anoint; to rub off.` | [1539a · leaf 862](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$863/full/1400,/0/default.jpg) |
| [U00492](https://jastrow.app/#rid:U00492) | `שׁוּף III` | `*psLl III m. (preced.) smooth-faced.— PL tfBttJ, '*">-■` | [1539b · leaf 862](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$863/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [P01145](https://jastrow.app/#rid:P01145): …Midr. Till. to Ps. XCII, v. **שׁוּף I**; a. fr.… Sefaria links it to U00490 `שׁוּף II`. hOCR: `a man of troubles (a very poor man). Midr. Till, to Ps.`. [1104a · leaf 427](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$428/full/1400,/0/default.jpg)
- [U00043](https://jastrow.app/#rid:U00043): … (b. h.) = **שׁוּף I**, to blow, pant, long for. … Sefaria links it to U00490 `שׁוּף II`. hOCR: `tfttflj II (b. h.) = fcpttj 1, to bloiv, pant, long for. Midr.`. [1508b · leaf 831](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$832/full/1400,/0/default.jpg)
- [U00490](https://jastrow.app/#rid:U00490): …. acc.).—[Midr. Till. to Ps. XCII וישופני עקב, v. **שׁוּף I**.]… Sefaria links it to U00490 `שׁוּף II`. [1539a · leaf 862](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$863/full/1400,/0/default.jpg)

Three cites read `v. שׁוּף I` (P01145; U00043 `= שׁוּף I, to blow, pant`; U00490's own text); Sefaria links U00490 `שׁוּף II`. U00488 `שׁוּף` (to blow) is the I: the hOCR reads `^1123 I(b.h.;= C]ti3) to blow.`, and review ledger L50 already holds U00488's numeral, which Sefaria stored in `language_reference`.

**Question.** Is U00488 Jastrow's `שׁוּף I`?

- **P01145, U00043, U00490**
  - [ ] yes: retarget the three to U00488 (case 1), with L50's fix of its numeral
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the hOCR, the gloss `to blow` and L50 agree.

### `שׁוּתָא III`: N01120 (target numbered otherwise)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U00580](https://jastrow.app/#rid:U00580) | `שׁוּתָא I` | not found in the hOCR | [1544a · leaf 867](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$868/full/1400,/0/default.jpg) |
| [U00581](https://jastrow.app/#rid:U00581) | `שׁוּתָא II` | `Handw., p. 648) [destruction,] shutha, a severe south wind;` | [1544a · leaf 867](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$868/full/1400,/0/default.jpg) |
| [U00582](https://jastrow.app/#rid:U00582) | `שׁוּתָּא, שׁוּתָא` | `Pfl., p. 264) sproutings of the caper-tree. Ber. 36a C]b:£` | [1544a · leaf 867](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$868/full/1400,/0/default.jpg) |
| [U00583](https://jastrow.app/#rid:U00583) | `שׁוּתָּא, שׁוּתָא` | `made of frame work or a block. B. Kam. 117a 'IB K1PP` | [1544a · leaf 867](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$868/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [N01120](https://jastrow.app/#rid:N01120): …B. Kam. 117ᵃ מנצו, v. **שׁוּתָא III**; a. e.… Sefaria links it to U00581 `שׁוּתָא II`. [928b · leaf 251](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$252/full/1400,/0/default.jpg)

N01120 reads `B. Kam. 117ᵃ מנצו, v. שׁוּתָא III`; Sefaria links U00581 `שׁוּתָא II`. `B. Kam. 117ᵃ` is U00583's passage (trap made of frame work), and the hOCR shows Sefaria dropped two numerals: U00582 `fctrfittj I (or J^ritt?) f.` and U00583 `JtfTTlO II (or &CTO) f.`, print's `שׁוּתָּא I (or שׁוּתָא)` and `שׁוּתָּא II`.

**Question.** Is U00583 the word the cite names, and what of its numeral?

- **N01120**
  - [ ] U00583: retarget; print's `III` in the cite stays (case 3: `kept`, since print numbers U00583 `II`)
  - [ ] U00583: retarget; the cite's `III` is print's slip for `II` (case 2, annotated)
  - [ ] something else (say what in the note)
  - [ ] can't tell from the scan
  - note: 
- **U00582, U00583**
  - [ ] print sets I on U00582 and II on U00583: dropped by Sefaria (case 1)
  - [ ] no
  - [ ] can't tell from the scan
  - note: 

Recommendation: U00583, kept (medium); U00582 I and U00583 II restored (high, from the hOCR).

### `שָׁיפּוּי I`: U01014 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01012](https://jastrow.app/#rid:U01012) | `שִׁיפּוּי, שִׁפּ׳ I` | `Mell. Ill," 8 (14*) "TODS (Talm. ed. ^13103, Bashi ">1B103.);` | [1566a · leaf 889](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$890/full/1400,/0/default.jpg) |
| [U01013](https://jastrow.app/#rid:U01013) | `שִׁיפּוּי, שִׁפּ׳ II` | not found in the hOCR | [1566a · leaf 889](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$890/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [U01014](https://jastrow.app/#rid:U01014): …f. pl. (v. **שָׁיפּוּי I**) [chips?,] name of a sort of … Sefaria links it to U01013 `שִׁיפּוּי, שִׁפּ׳ II`. hOCR: `*\|**;*l5*w f. pi. (v. "Wti I) [chips'1.,] name of a sort of`. [1566a · leaf 889](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$890/full/1400,/0/default.jpg)

U01014 `שִׁיפּוּיָין` (chips?) reads `f. pl. (v. שָׁיפּוּי I)`; Sefaria links U01013 `שִׁיפּוּי, שִׁפּ׳ II`. The only I is U01012 `שִׁיפּוּי, שִׁפּ׳ I` (planing, shaving). The cite's qamats differs from the stored hiriq; the hOCR reads the `I` (`(v. "Wti I)`).

**Question.** Is U01012 Jastrow's `שִׁיפּוּי I`?

- **U01014**
  - [ ] yes: retarget to U01012 (case 1)
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the only I, and `chips` fits `planing`.

### `שֵׁירוּתָא III`: U01064, U01066 (target numbered otherwise)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01069](https://jastrow.app/#rid:U01069) | `שֵׁירוּתָא, שֵׁר׳ I` | `angels (v. rt«5). Targ. Y. Gen. XVIII, 20; a. fr.` | [1569a · leaf 892](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$893/full/1400,/0/default.jpg) |
| [U01070](https://jastrow.app/#rid:U01070) | `שֵׁירוּתָא, שֵׁר׳, שֵׁירוּ, שֵׁרוּ I` | `Targ. Jer. II, 3. Targ. Job VIII, 7; v. "sppa.` | [1569a · leaf 892](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$893/full/1400,/0/default.jpg) |
| [U01071](https://jastrow.app/#rid:U01071) | `שֵׁירוּתָא, שֵׁר׳, שֵׁירוּ, שֵׁרוּ II` | not found in the hOCR | [1569a · leaf 892](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$893/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [U01064](https://jastrow.app/#rid:U01064): …, v. **שֵׁירוּתָא III**… Sefaria links it to U01070 `שֵׁירוּתָא, שֵׁר׳, שֵׁירוּ, שֵׁרוּ I`. [1569a · leaf 892](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$893/full/1400,/0/default.jpg)
- [U01066](https://jastrow.app/#rid:U01066): …, v. **שֵׁירוּתָא III**… Sefaria links it to U01070 `שֵׁירוּתָא, שֵׁר׳, שֵׁירוּ, שֵׁרוּ I`. [1569a · leaf 892](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$893/full/1400,/0/default.jpg)

U01064 `שֵׁירָוָון` and U01066 `שִׁירְוָן` read `v. שֵׁירוּתָא III`; Sefaria links U01070 (beginning). The hOCR shows print numbering the family I, II, III on the first form: U01069 `… I ch. same`, U01070 `… HIE II, …, t")E3 I f. … beginning`, U01071 `… *"K£3 III, T\% Tit II f. … encampment` (meal, ration). Sefaria kept only the numerals on the last forms.

**Question.** Is U01071 Jastrow's `שֵׁירוּתָא III`?

- **U01064, U01066**
  - [ ] yes: retarget both to U01071 (case 1)
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 
- **U01070, U01071**
  - [ ] print sets II on U01070's and III on U01071's first form: dropped by Sefaria (case 1)
  - [ ] no
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes, and both numerals restored (high): the hOCR reads them, and `encampment` fits the cites.

### `שִׁית IV`: U01112, U02071 (one bare member)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01100](https://jastrow.app/#rid:U01100) | `שִׁית I` | `n*U I (b. h.; sec. r. of i"iV<U) to place, set, make.` | [1570a · leaf 893](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$894/full/1400,/0/default.jpg) |
| [U01101](https://jastrow.app/#rid:U01101) | `שִׁית II` | `esp. Shith, a pit by the side of the altar into which the` | [1570a · leaf 893](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$894/full/1400,/0/default.jpg) |
| [U01102](https://jastrow.app/#rid:U01102) | `שִׁית III` | `Tosef. ib. 1, 1 ; Erub. 18a; Ber. 40b (expl. DTlNri ',"173).` | [1570a · leaf 893](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$894/full/1400,/0/default.jpg) |
| [U01103](https://jastrow.app/#rid:U01103) | `שִׁית, שֵׁית, שִׁיתָּא, שִׁיתָּה, שִׁתָּ׳` | `Targ. Gen. VII, 6 (0. ed. Berl. tVV ; ed.Vien. Pi^!). Ib. XXX, 20` | [1570a · leaf 893](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$894/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [U01112](https://jastrow.app/#rid:U01112): …, v. **שִׁית IV**… Sefaria links it to U01100 `שִׁית I`. [1570b · leaf 893](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$894/full/1400,/0/default.jpg)
- [U02071](https://jastrow.app/#rid:U02071): …, six, v. **שִׁית IV**.… Sefaria links it to U01100 `שִׁית I`. [1636b · leaf 959](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$960/full/1400,/0/default.jpg)

U01112 `שֵׁיתְסַר` and U02071 `שִׁתְּ, שֵׁת, שִׁתָּא` (six) read `v. שִׁית IV`; Sefaria links U01100 `שִׁית I`. U01103 `שִׁית, שֵׁית, …` (= h. `שֵׁשׁ`, six) is the word they quote and the only bare member after I, II, III.

**Question.** Is U01103 Jastrow's `שִׁית IV`?

- **U01103**
  - [ ] yes, print sets IV on it: dropped by Sefaria (case 1); retarget both
  - [ ] yes, print sets none: U01103 takes IV (case 2, annotated); retarget both
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high for the target): it is `six`; the scan decides case 1 or 2.

### `שׁלַח II`: U01243 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01265](https://jastrow.app/#rid:U01265) | `שָׁלַח` | `n>It3 (.b.h.; cmp. n?'2) to draw out; to stretch forth;` | [1579b · leaf 902](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$903/full/1400,/0/default.jpg) |
| [U01266](https://jastrow.app/#rid:U01266) | `שְׁלַח` | `n^Dch. same, 1) to send, send off. Targ. Num.XIII,2.` | [1580a · leaf 903](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$904/full/1400,/0/default.jpg) |
| [U01267](https://jastrow.app/#rid:U01267) | `שֶׁלַח I` | `H!*up I m. (preced.) hide, fresh skin. Makhsh. V, 6` | [1580b · leaf 903](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$904/full/1400,/0/default.jpg) |
| [U01268](https://jastrow.app/#rid:U01268) | `שֶׁלַח II, שְׁלוּחַ` | `pressed olive the stone of which slips out at a touch. — PL` | [1580b · leaf 903](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$904/full/1400,/0/default.jpg) |
| [U01269](https://jastrow.app/#rid:U01269) | `שֶׁלַח III` | not found in the hOCR | [1580b · leaf 903](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$904/full/1400,/0/default.jpg) |
| [U01270](https://jastrow.app/#rid:U01270) | `שֶׁלַח IV` | `of a step. Midd. II, 3; 111,6 nas Wl?*Jl and the depth of` | [1580b · leaf 903](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$904/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [U01243](https://jastrow.app/#rid:U01243): …pressed olive, v. **שׁלַח II**.… Sefaria links it to U01269 `שֶׁלַח III`. [1579a · leaf 902](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$903/full/1400,/0/default.jpg)

U01243 `שָׁלוּחַ` reads `pressed olive, v. שׁלַח II`; Sefaria links U01269 `שֶׁלַח III`. U01268 `שֶׁלַח II, שְׁלוּחַ` is glossed with the same pressed olive; the cite's `שׁלַח` lacks the segol.

**Question.** Is U01268 Jastrow's `שֶׁלַח II`?

- **U01243**
  - [ ] yes: retarget to U01268 (case 1)
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the citing headword is U01268's alternate and the gloss matches.

### `שָׁמִין II`: U01502 (one bare member)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01469](https://jastrow.app/#rid:U01469) | `שָׁמִין I` | `an Italian Isar (As). Kidd. 12* ''O? rWTl ^niO the 8hamin` | [1595b · leaf 918](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$919/full/1400,/0/default.jpg) |
| [U01470](https://jastrow.app/#rid:U01470) | `שָׁמִין, שְׁמֵין` | not found in the hOCR | [1595b · leaf 918](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$919/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [U01502](https://jastrow.app/#rid:U01502): … c. (v. **שָׁמִין II**) fat, rich. … Sefaria links it to U01469 `שָׁמִין I`. [1598a · leaf 921](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$922/full/1400,/0/default.jpg)

U01502 `שְׁמֵנָא` reads `c. (v. שָׁמִין II) fat, rich`; Sefaria links U01469 `שָׁמִין I` (a coin). U01470 `שָׁמִין, שְׁמֵין` (fat) is the II: the hOCR reads `■pQti II, "fDp m. = h. ip/r, fat.`, a numeral Sefaria dropped.

**Question.** Does print set II on U01470?

- **U01470**
  - [ ] yes: U01470 takes II (case 1, `reform.homographs`, displayed) and the cite is retargeted
  - [ ] no: U01470 takes II from the cite (case 2, annotated)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes, case 1 (high): the hOCR reads it.

### `שָׁמֵן II`: U01503 (target numbered otherwise)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01496](https://jastrow.app/#rid:U01496) | `שָׁמֵן I` | `"\|CtH3 I (b. h.) [to 6e smooth,] to be fat.` | [1597a · leaf 920](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$921/full/1400,/0/default.jpg) |
| [U01497](https://jastrow.app/#rid:U01497) | `שְׁמֵן` | not found in the hOCR | [1597b · leaf 920](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$921/full/1400,/0/default.jpg) |
| [U01498](https://jastrow.app/#rid:U01498) | `שָׁמֵן, שְׁמֵנָה, שְׁמֵי׳` | `rich. Keth. 61a 'O loa fat meat. Pes. 42*. Hull. 451' "^a` | [1597b · leaf 920](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$921/full/1400,/0/default.jpg) |
| [U01499](https://jastrow.app/#rid:U01499) | `שְׁמַן` | not found in the hOCR | [1597b · leaf 920](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$921/full/1400,/0/default.jpg) |
| [U01500](https://jastrow.app/#rid:U01500) | `שֶׁמֶן` | `TQ23 m. (b. h.; preced. wds.) oil, fat. Sabb. II, 1 'w` | [1597b · leaf 920](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$921/full/1400,/0/default.jpg) |
| [U01501](https://jastrow.app/#rid:U01501) | `שִׁמָּן` | not found in the hOCR | [1598a · leaf 921](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$922/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [U01503](https://jastrow.app/#rid:U01503): …, v. **שָׁמֵן II**… Sefaria links it to U01496 `שָׁמֵן I`. [1598a · leaf 921](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$922/full/1400,/0/default.jpg)

U01503 `שְׁמֵנָה` reads `v. שָׁמֵן II`; Sefaria links U01496 `שָׁמֵן I` (to be fat). U01503's headword is an alternate of U01498 `שָׁמֵן, שְׁמֵנָה, שְׁמֵי׳` (fat, rich), which carries no numeral; the family has an I and no II.

**Question.** Is U01498 Jastrow's `שָׁמֵן II`?

- **U01498**
  - [ ] yes, print sets II on it: case 1; retarget
  - [ ] yes, print sets none: U01498 takes II (case 2, annotated); retarget
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high for the target): the citing headword is its alternate; the scan decides case 1 or 2.

### `שְׁפֵי I`: U00045 (a carrier, not settled)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01734](https://jastrow.app/#rid:U01734) | `שפי, שָׁפָה I` | `^&D, HSD^j I (b.h.; cmp. C11-BII) 1) to crush.— Part,` | [1614b · leaf 937](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$938/full/1400,/0/default.jpg) |
| [U01735](https://jastrow.app/#rid:U01735) | `שְׁפֵי, שְׁפָא` | `"£3, S£w ch. same, 1) to crush, rub, grind. Targ.` | [1615a · leaf 938](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$939/full/1400,/0/default.jpg) |
| [U01736](https://jastrow.app/#rid:U01736) | `שפי, שָׁפָה II` | not found in the hOCR | [1615a · leaf 938](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$939/full/1400,/0/default.jpg) |
| [U01737](https://jastrow.app/#rid:U01737) | `שְׁפֵי, שְׁפָא` | `Sabb'. 98b fnili *0 in? ''Btth they made the boards slant-` | [1615a · leaf 938](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$939/full/1400,/0/default.jpg) |
| [U01738](https://jastrow.app/#rid:U01738) | `שפי, שָׁפָה III` | `at ease; to be relieved. Nidd. IV, 4 n»3 nsa RMHfc and` | [1615b · leaf 938](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$939/full/1400,/0/default.jpg) |
| [U01739](https://jastrow.app/#rid:U01739) | `שְׁפֵי, שְׁפָא` | `^£C, S£tl5 ch. same, to be quiet, at ease.—V. ■*$` | [1615b · leaf 938](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$939/full/1400,/0/default.jpg) |
| [U01740](https://jastrow.app/#rid:U01740) | `שֶׁפִי` | `"Dll'm. (preced.) quiet, ease. Targ. Y. II Num. XXIII, 3;` | [1615b · leaf 938](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$939/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [U00045](https://jastrow.app/#rid:U00045): …, v. **שְׁפֵי I**… Sefaria links it to U01737 `שְׁפֵי, שְׁפָא`. [1508b · leaf 831](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$832/full/1400,/0/default.jpg)

U00045 `שָׁאפֵי` reads `v. שְׁפֵי I`; Sefaria links U01737 (`שְׁפֵי, שְׁפָא`, ch. of `שָׁפָה II`, to incline). The I is U01734 `שפי, שָׁפָה I` (to crush); its `ch. same`, U01735 `שְׁפֵי, שְׁפָא` (to crush, rub, grind), is spelled exactly as the cite.

**Question.** Which entry is Jastrow's `שְׁפֵי I`?

- **U00045**
  - [ ] U01735 (`ch. same` of `שָׁפָה I`): retarget; no numeral set
  - [ ] U01734 `שָׁפָה I`
  - [ ] can't tell from the scan
  - note: 

Recommendation: U01735, retarget only (medium): the spelling is the ch. verb's.

### `שֵׁשׁ III`: U02059 (one bare member)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U02054](https://jastrow.app/#rid:U02054) | `שֵׁשׁ I` | not found in the hOCR | [1635b · leaf 958](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$959/full/1400,/0/default.jpg) |
| [U02055](https://jastrow.app/#rid:U02055) | `שֵׁשׁ II` | `':* rTWB . . . VB those things concerning which shesh is` | [1636a · leaf 959](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$960/full/1400,/0/default.jpg) |
| [U02056](https://jastrow.app/#rid:U02056) | `שֵׁשׁ, שִׁשָּׁה` | `(Y. a. Bab. ed. 1251153) at six hours and a half (from sunrise).` | [1636a · leaf 959](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$960/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [U02059](https://jastrow.app/#rid:U02059): …, v. **שֵׁשׁ III**… Sefaria links it to U02055 `שֵׁשׁ II`. [1636a · leaf 959](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$960/full/1400,/0/default.jpg)

U02059 `שִׁשִּׁים` (sixty) reads `v. שֵׁשׁ III`; Sefaria links U02055 `שֵׁשׁ II` (white linen). U02056 `שֵׁשׁ, שִׁשָּׁה` (six) is the only bare member after I, II.

**Question.** Is U02056 Jastrow's `שֵׁשׁ III`?

- **U02056**
  - [ ] yes, print sets III on it: dropped by Sefaria (case 1); retarget
  - [ ] yes, print sets none: U02056 takes III (case 2, annotated); retarget
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high for the target): sixty is derived from six; the scan decides case 1 or 2.

### `תּוֹר III`: V00277, V00282 (target numbered otherwise)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [V00271](https://jastrow.app/#rid:V00271) | `תּוּר I` | `"flr* I (b. h. ; v. illi) [to go around; cmp. )>btt,) to espy.` | [1656a · leaf 979](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$980/full/1400,/0/default.jpg) |
| [V00272](https://jastrow.app/#rid:V00272) | `תּוּר II` | `r\T\ II ch. (contr. of 15M, v. 112) to be awake. —` | [1656a · leaf 979](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$980/full/1400,/0/default.jpg) |
| [V00273](https://jastrow.app/#rid:V00273) | `תּוֹר I` | not found in the hOCR | [1656a · leaf 979](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$980/full/1400,/0/default.jpg) |
| [V00274](https://jastrow.app/#rid:V00274) | `תּוֹר II` | `1 IvlII m. (b.h.; onomatop.) turtle-dove. Kinn. II, 5` | [1656a · leaf 979](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$980/full/1400,/0/default.jpg) |
| [V00275](https://jastrow.app/#rid:V00275) | `תּוֹר, תּוֹרָא I` | `"IT) III, STlFl I m. = h. Titt, ox. Targ. Ex. XXI,` | [1656a · leaf 979](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$980/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [V00277](https://jastrow.app/#rid:V00277): …m. (denom. of **תּוֹר III**) ox-driver, plougher with oxe… Sefaria links it to V00274 `תּוֹר II`. hOCR: `fcO"iP]> nv) m. (denom. of Tinill) ox-driver, plougher`. [1656b · leaf 979](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$980/full/1400,/0/default.jpg)
- [V00282](https://jastrow.app/#rid:V00282): …m. (v. בָּאלָא; = תור ברא, v. **תּוֹר III**) aurochs. … Sefaria links it to V00274 `תּוֹר II`. [1656b · leaf 979](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$980/full/1400,/0/default.jpg)

V00277 (`denom. of תּוֹר III`, ox-driver) and V00282 (`aurochs, v. תּוֹר III`) are linked to V00274 `תּוֹר II` (turtle-dove). V00275 `תּוֹר, תּוֹרָא I` (ox) is the III: the hOCR reads `"IT) III, STlFl I m. = h. Titt, ox.`, print's `תּוֹר III, תּוֹרָא I`. Sefaria kept the I on the alternate and dropped the III.

**Question.** Does print set III on V00275's first form?

- **V00275**
  - [ ] yes: V00275 form 0 takes III (case 1, `reform.homographs`, displayed); retarget both cites
  - [ ] no
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the hOCR reads it and both cites mean the ox.

### `תַּלְמָא II`: V00570 (one bare member)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [V00599](https://jastrow.app/#rid:V00599) | `תְּלָמָא, תַּלְמָא I` | `H72b?,, NCTTl I ch.same. Targ. Job XXXI, 10. Targ.` | [1672a · leaf 995](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$996/full/1400,/0/default.jpg) |
| [V00600](https://jastrow.app/#rid:V00600) | `תַּלְמָא, תְּלָאמָא` | not found in the hOCR | [1672a · leaf 995](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$996/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [V00570](https://jastrow.app/#rid:V00570): …, v. **תַּלְמָא II**… Sefaria links it to V00599 `תְּלָמָא, תַּלְמָא I`. [1670a · leaf 993](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$994/full/1400,/0/default.jpg)

V00570 `תְּלָאמָא` reads `v. תַּלְמָא II`; Sefaria links V00599 `תְּלָמָא, תַּלְמָא I`. V00600 `תַּלְמָא, תְּלָאמָא` (twin) is the II: its alternate is the citing headword, and the hOCR reads `tf*£x»'_ II, kSCSx^i m. (Assyr. talimu`, a numeral Sefaria dropped.

**Question.** Does print set II on V00600?

- **V00600**
  - [ ] yes: V00600 takes II (case 1, displayed); retarget
  - [ ] no: V00600 takes II from the cite (case 2, annotated)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes, case 1 (high): the hOCR reads it.

### `תְּפֵי I`: T00434, V00848 (no carrier)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [V00815](https://jastrow.app/#rid:V00815) | `תְּפֵי, תְּפַף` | `you all spit with the same spittle, your opinions are all` | [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |
| [V00816](https://jastrow.app/#rid:V00816) | `תְּפֵי, תְּפָא` | `"©Fl II fctDT. (denom. of K"Bn) to set on for cooking.` | [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |
| [V00817](https://jastrow.app/#rid:V00817) | `תָּפִי, טָפִי` | not found in the hOCR | [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |
| [V00818](https://jastrow.app/#rid:V00818) | `תְּפִי, תַּפְיָא, תַּפְיָיה, תִּי׳` | not found in the hOCR | [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |

The cites, as the entries store them:

- [T00434](https://jastrow.app/#rid:T00434): …יקא; ed. זיקא), v. חַמָּת. Ib. 99ᵇ; Nidd. 42ᵃ, v. **תְּפֵי I**.… Sefaria links it to V00816 `תְּפֵי, תְּפָא`. hOCR: `Ib. 99b; Nidd. 42a, v. ^BPiI.`. [1463b · leaf 786](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$787/full/1400,/0/default.jpg)
- [V00848](https://jastrow.app/#rid:V00848): …to spit, v. **תְּפֵי I**.… Sefaria links it to V00816 `תְּפֵי, תְּפָא`. [1689a · leaf 1012](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1013/full/1400,/0/default.jpg)

T00434 (`Nidd. 42ᵃ, v. תְּפֵי I`) and V00848 `תְּפַף II` (`to spit, v. תְּפֵי I`) are linked to V00816 `תְּפֵי, תְּפָא` (to set on for cooking). V00815 `תְּפֵי, תְּפַף` (to spit; Nidd. 42ᵃ) is the word both quote. The hOCR reads V00816 as `"©Fl II fctDT.`, a II Sefaria dropped; V00815's line is not in the hOCR.

**Question.** Is V00815 Jastrow's `תְּפֵי I` (and V00816 its II)?

- **V00815**
  - [ ] yes, print sets I on it: case 1; retarget both
  - [ ] yes, print sets none: V00815 takes I (case 2, annotated); retarget both
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 
- **V00816**
  - [ ] print sets II: dropped by Sefaria (case 1, displayed)
  - [ ] no
  - [ ] can't tell from the scan
  - note: 

Recommendation: V00815 is the I and V00816 takes II (high): the hOCR reads the II, and both cites quote V00815.
