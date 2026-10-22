# Maintainer checklist: what waits on you

One section waits on you as of 2026-10-22: [Scan reads for the
Sefaria appendix (2026-10-22)](#scan-reads-for-the-sefaria-appendix-2026-10-22),
30 blocks (review ledger L71, PR #192). It is not a pre-publication item
unless a headword block's answer is "no". This file keeps the
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
| [Scan reads for the Sefaria appendix (2026-10-22)](#scan-reads-for-the-sefaria-appendix-2026-10-22) | 30 blocks, 66 patches (4 read against the patch) | #192 | L71 |

## Scan reads for the Sefaria appendix (2026-10-22)

Review ledger L71, PR #192. The Sefaria appendix (`bun data:sefaria`)
holds back a reviewed patch whose rationale names no print read
(`no print evidence` in [`reports/sefaria-review.csv`](reports/sefaria-review.csv)).
There were 133. PR #192 quoted the hOCR line into the rationale of the
67 whose line shows the fact (48 are now appendix rows; 19 wait on the
appendix's traceability filter, not on evidence); the tranche README
[`l71-evidence-2026-10-22`](../admin/pipeline/patch/records/tranches/l71-evidence-2026-10-22/README.md)
lists all 133. These blocks are the other 66: 62 where the hOCR is
garbled, missing or cannot show the claim, and first, 4 where it reads
**against** the patch.

A "yes" becomes, in a later PR, your dated print read in the patch's
rationale, which the appendix's evidence filter accepts; a "no"
becomes a fix of the patch (and of its entry); a "can't tell" leaves
the patch held, with this section named. Most answers change nothing
in our data. A "no" on a headword block would change the stored
headword, and so the entry's URL name.

The hOCR is verbatim, invisible bidi marks included. Volume 1 is
Tesseract (Hebrew runs mirrored, `I` read as `1` or `l`); volume 2 is
ABBYY (Hebrew read as Latin glyphs, numerals read well). The stored
column of a cross-reference block is the entry's text, the cite in
bold; the others show Sefaria's text, which the patch corrects.

30 blocks, 66 patches:

| block | patches |
|---|---|
| [A00675 `אוּלָם` II: `261)` or `26 1)`](#a00675-אוּלָם-ii-261-or-26-1) | 1 |
| [Q02162 `פְּתִיחָה`: `Ez. XXXVII, 1` or `12)`](#q02162-פְּתִיחָה-ez-xxxvii-1-or-12) | 1 |
| [U01063 `שֵׁירוּ`: which entry is `שֵׁירוּתָא II`](#u01063-שֵׁירוּ-which-entry-is-שֵׁירוּתָא-ii) | 1 |
| [A02823 `אַפְרִיקִי`: which form wears the parentheses](#a02823-אַפְרִיקִי-which-form-wears-the-parentheses) | 1 |
| [`אוֹרְיָין I`: A00882, M01329](#אוֹרְיָין-i-a00882-m01329) | 2 |
| [`אֲמָנָה I`: H01410](#אֲמָנָה-i-h01410) | 1 |
| [`דִּי I`: D00595](#דִּי-i-d00595) | 1 |
| [`קוּלְיָא I`: S01262, S01321](#קוּלְיָא-i-s01262-s01321) | 2 |
| [`טְבַע I`: O00179](#טְבַע-i-o00179) | 1 |
| [`חוּל I`: H00731, H00355, H00733](#חוּל-i-h00731-h00355-h00733) | 3 |
| [`אוּרְיָא II`: A00863, A00887, A03020, A00864](#אוּרְיָא-ii-a00863-a00887-a03020-a00864) | 4 |
| [`בּוֹר I`: B00367, B01142, B00335](#בּוֹר-i-b00367-b01142-b00335) | 3 |
| [`בִּזְיוּנָא II`: B00450, B00453](#בִּזְיוּנָא-ii-b00450-b00453) | 2 |
| [`גַּוָּוזָא II`: C00343, C00351, C01130](#גַּוָּוזָא-ii-c00343-c00351-c01130) | 3 |
| [`נִיר I`: N00034](#נִיר-i-n00034) | 1 |
| [`סְגֵי II`: O00125, T00814](#סְגֵי-ii-o00125-t00814) | 2 |
| [`צִנָּה III`: Q00440, R00399](#צִנָּה-iii-q00440-r00399) | 2 |
| [`רְעִי I`: Q00538, T00895](#רְעִי-i-q00538-t00895) | 2 |
| [`שִׁיטָּה III`: Q01373, U00888](#שִׁיטָּה-iii-q01373-u00888) | 3 |
| [`בַּר I ch.`: B01157, B01160, B01215, B01237, U02087](#בַּר-i-ch-b01157-b01160-b01215-b01237-u02087) | 5 |
| [`קוּץ I`: S00534](#קוּץ-i-s00534) | 1 |
| [Phantom sense boundaries, volume 1](#phantom-sense-boundaries-volume-1) | 4 |
| [A01194 `אֵיזֶה`: the `)` after `b. h.`](#a01194-אֵיזֶה-the--after-b-h) | 1 |
| [H00871 `חִירָה`: the two `Ib.` after the Mekhilta](#h00871-חִירָה-the-two-ib-after-the-mekhilta) | 1 |
| [`refs` items with no basis in the entry](#refs-items-with-no-basis-in-the-entry) | 3 |
| [`בַּד V` (B00098) and the link that names it (B00097)](#בַּד-v-b00098-and-the-link-that-names-it-b00097) | 2 |
| [A stray comma before the numeral](#a-stray-comma-before-the-numeral) | 3 |
| [A gloss comma inside the headword](#a-gloss-comma-inside-the-headword) | 3 |
| [Two spellings in one form](#two-spellings-in-one-form) | 5 |
| [`X = Y` heads](#x--y-heads) | 2 |

### Read against the patch (4)

These four are not amended: the hOCR line reads against the patch's claim or its corrected text, so each may be a wrong correction (review ledger L75–L78; H00871's block below is L79).

#### A00675 `אוּלָם` II: `261)` or `26 1)`

Covers 1 patch (P000194). The patch: `p. 18; 26 ‖ 1) Ulam`: the page is `26`, the `1` and `)` are the lost marker.

| rid | Sefaria's text | hOCR, verbatim | scan |
|---|---|---|---|
| [A00675](https://jastrow.app/#rid:A00675) | `…Neub. Géogr. p. 18; 261) Ulam (Porta)…` | `Onom.; Neub. Géogr. p. 18; 261) 1) Ulam (Porta) a place` | [26a · leaf 49](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$50/full/1400,/0/default.jpg) |

What the hOCR shows: print reads `261) 1) Ulam`: the page number `261)` AND the marker `1)`; the patch turns `261)` into `26 1)`, dropping print's `1)` of the page and its paren (the sense worklist already lists A00675 as `p. 18; 261) 1) Ulam`).

**Question.** Does print read `p. 18; 261) 1) Ulam`, the page `261` and then the marker `1)`?

- **A00675** (P000194)
  - [ ] yes: `261) 1)`; the patch is wrong, and a PR rewrites it to keep `261)` and insert ` 1)`
  - [ ] no: print reads `26 1)` as the patch has it
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the hOCR reads both, and the sense worklist already quotes A00675 as `p. 18; 261) 1) Ulam` (class 7's false hits).

#### Q02162 `פְּתִיחָה`: `Ez. XXXVII, 1` or `12)`

Covers 1 patch (P000268). The patch: `a. fr.—2) פְּתִיחַת נדר`: the marker `—2)` is reinserted; the verse stays `Ez. XXXVII, 1;`.

| rid | Sefaria's text | hOCR, verbatim | scan |
|---|---|---|---|
| [Q02162](https://jastrow.app/#rid:Q02162) | `…is used (Ez. XXXVII, 1; a. fr.— פְּתִיחַת נדר…` | `surrection) opening is used (Ez. XXXVII, 12); a. fr. —` / `2) Ti3 nrpnB (v. nns) offering reasons for regretting a` | [1253b · leaf 576](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$577/full/1400,/0/default.jpg) |

What the hOCR shows: print reads `(Ez. XXXVII, 12); a. fr. — 2)`: the `—2)` the patch inserts is there, but Sefaria also lost `2)` of the verse number, which the patch leaves as `Ez. XXXVII, 1;` (and its link `Ezekiel 37:1`); the corrected text would still differ from print.

**Question.** Does print read `(Ez. XXXVII, 12); a. fr. — 2)`, the verse `12` with its `)` as well as the marker?

- **Q02162** (P000268)
  - [ ] yes: `12);` and `—2)`; a PR widens the patch to restore the verse and its link (Ezekiel 37:12)
  - [ ] no: print reads `XXXVII, 1;` as Sefaria has it
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): ABBYY reads digits well, and Ez. XXXVII, 12 is the verse about opening graves the gloss describes.

#### U01063 `שֵׁירוּ`: which entry is `שֵׁירוּתָא II`

Covers 1 patch (P000760). The patch: the patch re-aims `שֵׁירוּתָא II` at U01071.

| rid | Sefaria's text | hOCR, verbatim | scan |
|---|---|---|---|
| [U01063](https://jastrow.app/#rid:U01063) | `…, v. **שֵׁירוּתָא II**, III.`, linked by Sefaria to U01070 | `fcfffl"Ptt£ HIE II, r~Mw, t")E3 I f. Cnti) beginning.` | [1569a · leaf 892](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$893/full/1400,/0/default.jpg) |

What the hOCR shows: print numbers U01070 `II` on its first form (`HIE II`; PR #187 set it, P000893, from the maintainer's tick) and U01071 `III`, so U01063's `v. שֵׁירוּתָא II, III` names U01070 then U01071: Sefaria's own link to U01070 is right, and this retarget to U01071 now points the `II` at the `III`.

**Question.** With print setting `II` on U01070's first form and `III` on U01071's (your tick, PR #187), does `שֵׁירוּתָא II, III` name U01070 and U01071, so Sefaria's link was right?

- **U01063** (P000760)
  - [ ] yes: U01070; a PR withdraws P000760 and points the `III` at U01071
  - [ ] no: keep the patch (say why in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): it is your own reading of the family in the `שֵׁירוּתָא III` block (PR #187), and the hOCR reads `HIE II` on U01070's line; P000760 (PR #178) predates it.

#### A02823 `אַפְרִיקִי`: which form wears the parentheses

Covers 1 patch (P000308). The patch: print sets `(אַפְרִיקִי) אַפְרִיקָא I`: `display` `({0}) {1} I`.

| rid | Sefaria's text | hOCR, verbatim | scan |
|---|---|---|---|
| [A02823](https://jastrow.app/#rid:A02823) | `אַפְרִיקִי` (alt `(אַפְרִיקָא) I`) | `NI pr. n. pl. (Africa, ‘Agpexk) 1‏ (אפריקא)` | [108b · leaf 131](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$132/full/1400,/0/default.jpg) |

What the hOCR shows: the one parenthesized form, leftmost on the head line, reads `(אפריקא)`: the alternate's letters, where the patch sets the parentheses on `אַפְרִיקִי` (`({0}) {1} I`). Volume 1 is Tesseract and may have misread one letter; HW-A02823's own scan check (2026-09-22) read it the patch's way.

**Question.** Which form does print set in parentheses at the head of A02823?

- **A02823** (P000308)
  - [ ] `(אַפְרִיקִי) אַפְרִיקָא I`, as the patch has it
  - [ ] `(אַפְרִיקָא) אַפְרִיקִי I`, as the hOCR reads it (say so in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: read the scan (low): the hOCR reads the parenthesized form's letters as `אפריקא`, leftmost on the line; HW-A02823's check of 2026-09-22 read the patch's way.

### Held for a scan read (62)

#### `אוֹרְיָין I`: A00882, M01329

Covers 2 patches (P000544, P000545). Sefaria links them [A00890](https://jastrow.app/#rid:A00890) `אוֹרְיָין II`; the patches link [A00889](https://jastrow.app/#rid:A00889) `אוֹרְיָין`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [A00882](https://jastrow.app/#rid:A00882) | …, v. **אוֹרְיָין I**… | `v. .1אורירן‎` | [34a · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| [M01329](https://jastrow.app/#rid:M01329) | …ders, frontiers. Gen. R. s. 50, beg. Ar. (v. **אוֹרְיָין I**); Lev. R. s. 27 מתורין (… | `iers. Gen.R. s.50, beg. Ar.(v. "p^ixl); Lev.R.s. 27 "p-llha` | [780b · leaf 103](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$104/full/1400,/0/default.jpg) |

Why held: A00882 `v. .1אורירן`: the numeral reads `1`; M01329 `Ar.(v. "p^ixl)`: the numeral reads `l`.

**Question.** Does print read `אוֹרְיָין I` at each cite?

- **A00882** (P000544)
  - [ ] yes: print reads `אוֹרְיָין I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **M01329** (P000545)
  - [ ] yes: print reads `אוֹרְיָין I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): Sefaria's text reads `I` at both cites and its own A00890 is `II`; the maintainer's print read of 2026-10-06 found no numeral beside A00889, and P000343 set its implied I.

#### `אֲמָנָה I`: H01410

Covers 1 patch (P000546). Sefaria links it [A02042](https://jastrow.app/#rid:A02042) `אֲמָנָה II`; the patch links [A02041](https://jastrow.app/#rid:A02041) `אֲמָנָה`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [H01410](https://jastrow.app/#rid:H01410) | …red meal). Gen. R. s. 32, a. e. מח׳ אמנה, v. **אֲמָנָה I**. Ḥull. 25ᵃ, v. חֲטִיטָה.… | no readable line | [489b · leaf 512](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$513/full/1400,/0/default.jpg) |

Why held: H01410 the cite's line is not found.

**Question.** Does print read `אֲמָנָה I` at this cite?

- **H01410** (P000546)
  - [ ] yes: print reads `אֲמָנָה I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): Sefaria's text reads `I`, and Sefaria's own A02042 is `II`.

#### `דִּי I`: D00595

Covers 1 patch (P000547). Sefaria links it [D00443](https://jastrow.app/#rid:D00443) `דִּי II`; the patch links [D00442](https://jastrow.app/#rid:D00442) `דִּי`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [D00595](https://jastrow.app/#rid:D00595) | …v. **דִּי I**… | no readable line | [299b · leaf 322](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$323/full/1400,/0/default.jpg) |

Why held: D00595 the cite's line is not found.

**Question.** Does print read `דִּי I` at this cite?

- **D00595** (P000547)
  - [ ] yes: print reads `דִּי I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): Sefaria's text reads `I`, and Sefaria's own D00443 is `II`.

#### `קוּלְיָא I`: S01262, S01321

Covers 2 patches (P000551, P000552). Sefaria links them [S00337](https://jastrow.app/#rid:S00337) `קוּלְיָא II`; the patches link [S00336](https://jastrow.app/#rid:S00336) `קוּלְיָא`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [S01262](https://jastrow.app/#rid:S01262) | …, v. **קוּלְיָא I**… | no readable line | [1372b · leaf 695](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$696/full/1400,/0/default.jpg) |
| [S01321](https://jastrow.app/#rid:S01321) | …ָא). Ib. XXV, 18 (ed. Wil. קָלַיָּא pl.).—V. **קוּלְיָא I**.… | `Vrtap i.` | [1376a · leaf 699](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$700/full/1400,/0/default.jpg) |

Why held: S01262 the cite's line is not found; S01321 `Vrtap i.`: the numeral reads `i`.

**Question.** Does print read `קוּלְיָא I` at each cite?

- **S01262** (P000551)
  - [ ] yes: print reads `קוּלְיָא I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **S01321** (P000552)
  - [ ] yes: print reads `קוּלְיָא I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): Sefaria's text reads `I`; print sets `II` on S00337 (`fcv"*p II, PS yp m. (preced.) ashes of an alkaline`, 1328a · leaf 651).

#### `טְבַע I`: O00179

Covers 1 patch (P000590). Sefaria links it [I00076](https://jastrow.app/#rid:I00076) `טָבַע I`; the patch links [I00077](https://jastrow.app/#rid:I00077) `טְבַע`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [O00179](https://jastrow.app/#rid:O00179) | …e of Sodom (usu. ימא דמילחא). Sabb. 108ᵇ, v. **טְבַע I**; a. e.… | `Sodom (usu. xrf3">al sa^). Sabb. 108b, v. 3J3-J I; a. e.` | [956b · leaf 279](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$280/full/1400,/0/default.jpg) |

Why held: O00179 the cite reads `I`, but print's `טְבַע I` may name I00076 `טָבַע I` (print sets that I) as well as I00077 its `ch.` line; the vowels that decide are not in the hOCR.

**Question.** Does print read `טְבַע I` at this cite?

- **O00179** (P000590)
  - [ ] yes: print reads `טְבַע I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: can't tell (low): print's `I` stands, but which of the two entries it names rests on the cite's vowels, which the hOCR does not read; a "no" keeps Sefaria's link.

#### `חוּל I`: H00731, H00355, H00733

Covers 3 patches (P000591, P000807, P000808). Sefaria links them [H00323](https://jastrow.app/#rid:H00323) `חוֹל I`; the patches link [H00320](https://jastrow.app/#rid:H00320) `חוּל ²`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [H00731](https://jastrow.app/#rid:H00731) | …, v. **חוּל I** ch.… | `on, חול זר‎ 1 ch.` | [454b · leaf 477](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$478/full/1400,/0/default.jpg) |
| [H00355](https://jastrow.app/#rid:H00355) | …**חוּל I)**… | no readable line | [434b · leaf 457](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$458/full/1400,/0/default.jpg) |
| [H00733](https://jastrow.app/#rid:H00733) | …**חוּל I)**… | no readable line | [454b · leaf 477](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$478/full/1400,/0/default.jpg) |

Why held: H00731 the numeral reads `1`; and the target is a `ch.` line (ruling 10-15), which print cannot pick; H00355 the cite's line (language_reference) is not found; H00733 the cite's line (language_reference) is not found.

**Question.** Does print read `חוּל I` at each cite?

- **H00731** (P000591)
  - [ ] yes: print reads `חוּל I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **H00355** (P000807)
  - [ ] yes: print reads `חוּל I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **H00733** (P000808)
  - [ ] yes: print reads `חוּל I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): Sefaria's text reads `I` at all three; round 2 (PR #177) numbered H00319 `I` from Jastrow's text, these cites among it, and aimed H00731's `I ch.` at H00320 by your tick.

#### `אוּרְיָא II`: A00863, A00887, A03020, A00864

Covers 4 patches (P000595, P000596, P000599, P000791). Sefaria links them [A00880](https://jastrow.app/#rid:A00880) `אוֹרְיָא ²`; the patches link [A00878](https://jastrow.app/#rid:A00878) `אוּרְיָא ²`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [A00863](https://jastrow.app/#rid:A00863) | …, v. **אוּרְיָא II** a. אֻרְוָה.… | no readable line | [33b · leaf 56](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$57/full/1400,/0/default.jpg) |
| [A00887](https://jastrow.app/#rid:A00887) | …, v. **אוּרְיָא II** h. a. ch.… | `NTN, 0 אררא‎ 1 h. a. ch.` | [34a · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| [A03020](https://jastrow.app/#rid:A03020) | …v. **אוּרְיָא II**) manger, crib.—Pl. אֻרְו… | `TPN f. (b. h.; v. אהּרְלָא‎ 11( manger, crib.— Pl. רות‎` | [116a · leaf 139](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$140/full/1400,/0/default.jpg) |
| [A00864](https://jastrow.app/#rid:A00864) | …, v. **אוּרְיָא II** ch., a. אֵדֶר I.… | no readable line | [33b · leaf 56](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$57/full/1400,/0/default.jpg) |

Why held: A00863 the cite's line is not found; A00887 `1 h. a. ch.`: the numeral reads `1`; A03020 `11(`: the numeral is misread and mirrored; A00864 the cite's line is not found; and the target is a `ch.` line (ruling 10-15), which print cannot pick.

**Question.** Does print read `אוּרְיָא II` at each cite?

- **A00863** (P000595)
  - [ ] yes: print reads `אוּרְיָא II`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **A00887** (P000596)
  - [ ] yes: print reads `אוּרְיָא II`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **A03020** (P000599)
  - [ ] yes: print reads `אוּרְיָא II`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **A00864** (P000791)
  - [ ] yes: print reads `אוּרְיָא II`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): Sefaria's own text reads `II` at all four.

#### `בּוֹר I`: B00367, B01142, B00335

Covers 3 patches (P000604, P000609, P000797). Sefaria links them [B00333](https://jastrow.app/#rid:B00333) `בּוֹר II`; the patches link [B00332](https://jastrow.app/#rid:B00332) `בֹּור I`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [B00367](https://jastrow.app/#rid:B00367) | …(v. ברך) something hollow, absurdity; cmp. **בּוֹר I**. Keth. 63ᵇ; Ḥull. 88ᵇ; <… | `surdity; emp. “Hal. Keth. 68"; Hull. 88"; Shebu.` | [150b · leaf 173](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$174/full/1400,/0/default.jpg) |
| [B01142](https://jastrow.app/#rid:B01142) | …בַּקָּרִין (v. בָּקַר, cmp. b. h. בַּעַר a. **בּוֹר I**) [empty,] light-minded,… | `“ES, cmp. b-h. “SZ 8. TSI)‏ .ז) שרי .₪ זז קרא"` | [187a · leaf 210](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$211/full/1400,/0/default.jpg) |
| [B00335](https://jastrow.app/#rid:B00335) | …**בּוֹר I**… | no readable line | [149a · leaf 172](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$173/full/1400,/0/default.jpg) |

Why held: B00367 `emp. “Hal.`: the cite is misread; B01142 the cite is misread; B00335 the cite's line (language_reference) is not found.

**Question.** Does print read `בּוֹר I` at each cite?

- **B00367** (P000604)
  - [ ] yes: print reads `בּוֹר I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **B01142** (P000609)
  - [ ] yes: print reads `בּוֹר I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **B00335** (P000797)
  - [ ] yes: print reads `בּוֹר I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): Sefaria's own text reads `I`, and Sefaria's B00333 is `II`.

#### `בִּזְיוּנָא II`: B00450, B00453

Covers 2 patches (P000605, P000606). Sefaria links them [B00442](https://jastrow.app/#rid:B00442) `בִּזְיוּנָא I`; the patches link [B00443](https://jastrow.app/#rid:B00443) `בִּזְיוּנָא , II`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [B00450](https://jastrow.app/#rid:B00450) | …, v. **בִּזְיוּנָא II**… | no readable line | [153b · leaf 176](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$177/full/1400,/0/default.jpg) |
| [B00453](https://jastrow.app/#rid:B00453) | …, v. **בִּזְיוּנָא II**… | no readable line | [153b · leaf 176](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$177/full/1400,/0/default.jpg) |

Why held: B00450 the cite's line is not found; B00453 the cite's line is not found.

**Question.** Does print read `בִּזְיוּנָא II` at each cite?

- **B00450** (P000605)
  - [ ] yes: print reads `בִּזְיוּנָא II`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **B00453** (P000606)
  - [ ] yes: print reads `בִּזְיוּנָא II`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): Sefaria's own text reads `II`, and Sefaria's B00442 is `I`.

#### `גַּוָּוזָא II`: C00343, C00351, C01130

Covers 3 patches (P000613, P000614, P000615). Sefaria links them [C00328](https://jastrow.app/#rid:C00328) `גַּוָּוזָא I`; the patches link [C00329](https://jastrow.app/#rid:C00329) `גַּוָּוזָא , II`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [C00343](https://jastrow.app/#rid:C00343) | …castrate, v. **גַּוָּוזָא II**.… | `AN castrate, vy. 81955 I.` | [220a · leaf 243](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$244/full/1400,/0/default.jpg) |
| [C00351](https://jastrow.app/#rid:C00351) | …(a fictitious denom. of **גַּוָּוזָא II**) Gavzania (Eunuchia), a… | `NI pr. n. pl. (a fictitious denom. of NTs 11)` | [220b · leaf 243](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$244/full/1400,/0/default.jpg) |
| [C01130](https://jastrow.app/#rid:C01130) | …גוזז, a. מגנחין for מְגַוְּוזִין, denom. of **גַּוָּוזָא II**. Cmp. form of letters, S… | `TMV, denom, of RPL. Cmp. form of letters, Sabb.` | [259a · leaf 282](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$283/full/1400,/0/default.jpg) |

Why held: C00343 `vy. 81955 I.`: the numeral reads `I`, not `II`; C00351 `NTs 11)`: the numeral reads `11`; C01130 `denom, of RPL.`: no numeral.

**Question.** Does print read `גַּוָּוזָא II` at each cite?

- **C00343** (P000613)
  - [ ] yes: print reads `גַּוָּוזָא II`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **C00351** (P000614)
  - [ ] yes: print reads `גַּוָּוזָא II`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **C01130** (P000615)
  - [ ] yes: print reads `גַּוָּוזָא II`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium) if the scan shows `II` at C00343: the hOCR reads `I.` there, so read that cite first.

#### `נִיר I`: N00034

Covers 1 patch (P000647). Sefaria links it [N00787](https://jastrow.app/#rid:N00787) `נִיר IV`; the patch links [N00782](https://jastrow.app/#rid:N00782) `נִיר I`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [N00034](https://jastrow.app/#rid:N00034) | …, v. **נִיר I**… | `1&0, v.-..:i. k` | [867a · leaf 190](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$191/full/1400,/0/default.jpg) |

Why held: N00034 `1&0, v.-..:i. k`: no numeral.

**Question.** Does print read `נִיר I` at this cite?

- **N00034** (P000647)
  - [ ] yes: print reads `נִיר I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): two other cites of `נִיר I` read `I` in the hOCR (P000651, P000738, now in the appendix).

#### `סְגֵי II`: O00125, T00814

Covers 2 patches (P000660, P000743). Sefaria links them [O00122](https://jastrow.app/#rid:O00122) `סְגֵי III`; the patches link [O00121](https://jastrow.app/#rid:O00121) `סְגֵי ²`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [O00125](https://jastrow.app/#rid:O00125) | …, v. **סְגֵי II**, III.… | `&0 30 I, v. w 11, in.` | [954b · leaf 277](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$278/full/1400,/0/default.jpg) |
| [T00814](https://jastrow.app/#rid:T00814) | …oes his trickery consist? Ib. לסגויי בר׳, v. **סְגֵי II**; a. e.… | `'13, v. "".".Oil; a. e.` | [1483a · leaf 806](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$807/full/1400,/0/default.jpg) |

Why held: O00125 `v. w 11, in.`: the numerals read `11, in`; T00814 `v. "".".Oil`: no numeral.

**Question.** Does print read `סְגֵי II` at each cite?

- **O00125** (P000660)
  - [ ] yes: print reads `סְגֵי II`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **T00814** (P000743)
  - [ ] yes: print reads `סְגֵי II`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): Sefaria's own text reads `II`.

#### `צִנָּה III`: Q00440, R00399

Covers 2 patches (P000695, P000708). Sefaria links them [R00608](https://jastrow.app/#rid:R00608) `צִנָּה II`; the patches link [R00609](https://jastrow.app/#rid:R00609) `צִנָּה ²`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [Q00440](https://jastrow.app/#rid:Q00440) | …. פַּחִים (only in connection with צנים), v. **צִנָּה III**.—[For פחי נפש, v. פְּחִי… | `nection with COS), v. nSS IIL— [For WE3 TtB, v. "TIB.]` | [1151a · leaf 474](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$475/full/1400,/0/default.jpg) |
| [R00399](https://jastrow.app/#rid:R00399) | …= h. **צִנָּה III**, cold. Targ. Y. II, Gen.… | `Xr^S/iS I f. = h. fiSXHI, cold. Targ. Y. II Gen.` | [1278a · leaf 601](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$602/full/1400,/0/default.jpg) |

Why held: Q00440 `v. nSS IIL—`: the numeral reads `IIL`; R00399 `fiSXHI`: the numeral is fused into the word.

**Question.** Does print read `צִנָּה III` at each cite?

- **Q00440** (P000695)
  - [ ] yes: print reads `צִנָּה III`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **R00399** (P000708)
  - [ ] yes: print reads `צִנָּה III`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): the hOCR reads `IIL` at Q00440, one stroke off `III`.

#### `רְעִי I`: Q00538, T00895

Covers 2 patches (P000697, P000744). Sefaria links them [T00893](https://jastrow.app/#rid:T00893) `רְעִי ²`; the patches link [T00892](https://jastrow.app/#rid:T00892) `רְעִי`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [Q00538](https://jastrow.app/#rid:Q00538) | …ל) mast-ox. Sabb. XX, 4; Y. ib. 17ᶜ bot., v. **רְעִי I**.… | `btt> 11115) mast-ox. Sabb. XX, 4; Y. ib. 17c bot., v. *p)l` | [1156b · leaf 479](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$480/full/1400,/0/default.jpg) |
| [T00895](https://jastrow.app/#rid:T00895) | …(v. **רְעִי I**) pasture. Targ. II Esth.… | `■tf] in, Kjjn, awn (awn n) m. (v. wd` | [1487a · leaf 810](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$811/full/1400,/0/default.jpg) |

Why held: Q00538 `v. *p)l`: no numeral; T00895 `(v. wd`: no numeral.

**Question.** Does print read `רְעִי I` at each cite?

- **Q00538** (P000697)
  - [ ] yes: print reads `רְעִי I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **T00895** (P000744)
  - [ ] yes: print reads `רְעִי I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): T00013's cite of `רְעִי I` reads `I` in the hOCR (P000736, now in the appendix), and print sets `I` on T00892.

#### `שִׁיטָּה III`: Q01373, U00888

Covers 3 patches (P000701, P000756, P000757). Sefaria links them [U00883](https://jastrow.app/#rid:U00883) `שִׁיטָּה II`; the patches link [U00884](https://jastrow.app/#rid:U00884) `שִׁיטָּה ²`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [Q01373](https://jastrow.app/#rid:Q01373) | …) 3 (Var. פָּאוֹטוֹת); Y. ib. V, 47ᶜ top, v. **שִׁיטָּה III**; Y. Erub. VII, 24ᶜ bot.… | `v. na^ia HI ; Y. Erub. VII, 24c bot. rYbi^B.` | [1201b · leaf 524](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$525/full/1400,/0/default.jpg) |
| [U00888](https://jastrow.app/#rid:U00888) | …form) = h. **שִׁיטָּה III**,… | `nfispeS f., sta^ m., (ma^ h. form) =h. r*f$ m,` | [1560b · leaf 883](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$884/full/1400,/0/default.jpg) |
| [U00888](https://jastrow.app/#rid:U00888) | …ed two modes of developing the same idea, v. **שִׁיטָּה III**. Y. Ber. IX, 13ᵃ; a. e.… | no readable line | [1560b · leaf 883](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$884/full/1400,/0/default.jpg) |

Why held: Q01373 `v. na^ia HI ;`: the numeral reads `HI`; U00888 `=h. r*f$ m,`: no numeral; U00888 the cite's line is not found.

**Question.** Does print read `שִׁיטָּה III` at each cite?

- **Q01373** (P000701)
  - [ ] yes: print reads `שִׁיטָּה III`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **U00888** (P000756)
  - [ ] yes: print reads `שִׁיטָּה III`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **U00888** (P000757)
  - [ ] yes: print reads `שִׁיטָּה III`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): the hOCR reads `HI` at Q01373; U00383's cite reads `III` (P000749, now in the appendix), and print sets `III` on U00884.

#### `בַּר I ch.`: B01157, B01160, B01215, B01237, U02087

Covers 5 patches (P000792, P000793, P000794, P000795, P000796). Sefaria links them [B01156](https://jastrow.app/#rid:B01156) `בַּר IV`; the patches link [B01153](https://jastrow.app/#rid:B01153) `בַּר`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [B01157](https://jastrow.app/#rid:B01157) | …outside, forest &c., v. **בַּר I** ch.… | `NUTS I owteide, forest &e., v. “31 ch.` | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| [B01160](https://jastrow.app/#rid:B01160) | …(v. **בַּר I** ch.)… | `- : sem. (¥. “Sl ch.) 1) external,` | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| [B01215](https://jastrow.app/#rid:B01215) | …(v. **בַּר I** ch.) outside, rejected;… | `MENT 4 טר‎ ch) outside, rejedied ; cmp. מרייותון‎` | [191b · leaf 214](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$215/full/1400,/0/default.jpg) |
| [B01237](https://jastrow.app/#rid:B01237) | …(v. **בַּר I** ch., Pi. 2) to expel, ex… | `Is. XL, 20.—*4) (v. "2 1 ch,, a. MNI2; cmp. Ot Pi. 2) to‏` | [192b · leaf 215](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$216/full/1400,/0/default.jpg) |
| [U02087](https://jastrow.app/#rid:U02087) | …B. Bath. 90ᵇ ש׳ מלבר, v. **בַּר I** ch. Bekh. 50ᵃ דל זוזא וש… | `-1--2, v. -a I ch. Bekh. 50a '"iff! XT17 b*l deduct one Zuz` | [1637a · leaf 960](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$961/full/1400,/0/default.jpg) |

Why held: B01157 `v. “31 ch.`: no numeral; and the target is a `ch.` line (ruling 10-15); B01160 `(¥. “Sl ch.)`: no numeral; and the target is a `ch.` line (ruling 10-15); B01215 `טר ch)`: no numeral; and the target is a `ch.` line (ruling 10-15); B01237 `(v. "2 1 ch,,`: the numeral reads `1`; and the target is a `ch.` line (ruling 10-15); U02087 the cite reads `v. -a I ch.`, but the target is a `ch.` line (ruling 10-15), which print cannot pick between B01152 and B01153.

**Question.** Does print read `בַּר I ch.` at each cite?

- **B01157** (P000792)
  - [ ] yes: print reads `בַּר I ch.`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **B01160** (P000793)
  - [ ] yes: print reads `בַּר I ch.`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **B01215** (P000794)
  - [ ] yes: print reads `בַּר I ch.`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **B01237** (P000795)
  - [ ] yes: print reads `בַּר I ch.`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 
- **U02087** (P000796)
  - [ ] yes: print reads `בַּר I ch.`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): U02087's cite reads `v. -a I ch.` in the hOCR; the `ch.` line is the maintainer's ruling 10-15.

#### `קוּץ I`: S00534

Covers 1 patch (P000804). Sefaria links it [S00533](https://jastrow.app/#rid:S00533) `קוּץ IV`; the patch links [S00528](https://jastrow.app/#rid:S00528) `קוּץ I`.

| rid | stored (the cite in bold) | hOCR, verbatim | scan |
|---|---|---|---|
| [S00534](https://jastrow.app/#rid:S00534) | …קָוַץ or **קוּץ I**)… | `7"1p I m- (b. h.; yip or "ppl) 1) thorn. R. Hash. 17a` | [1339b · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |

Why held: S00534 `(b. h.; yip or "ppl)`: the numeral reads `l`.

**Question.** Does print read `קוּץ I` at this cite?

- **S00534** (P000804)
  - [ ] yes: print reads `קוּץ I`
  - [ ] no (say what it reads in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): two other cites of `קוּץ I` read `I` in the hOCR (P000728, P000803, now in the appendix), and print sets `I` on S00528.

#### Phantom sense boundaries, volume 1

Covers 4 patches (P000195, P000203, P000206, P000223). The patches' claim: print runs on: the `N)` closes the parenthesis before it, and no sense marker stands there.

| rid | Sefaria's text | hOCR, verbatim | scan |
|---|---|---|---|
| [A00913](https://jastrow.app/#rid:A00913) | `…(v. אוֹר ‖ 2) evening, night. Pes. 2ᵃ; 2ᵇ או…` | `= אור +) .+ אִרְתָא‎ 9) coening, night. Pes. אור א *י2‎` | [35a · leaf 58](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$59/full/1400,/0/default.jpg) |
| [A03277](https://jastrow.app/#rid:A03277) | `…אֵשֶׁת Ps. LVIII, 9; אוש or אשש, v. אשש ‖ 2) [groping, cmp. גוש, גשש,] mol…` | `mole. Gen.‏ [,כשש ,גוש (groping, cmp.‏ (פאשש .+ ,א` | [127a · leaf 150](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$151/full/1400,/0/default.jpg) |
| [B00656](https://jastrow.app/#rid:B00656) | `…(בִּינִיתָא Ar. s. v. בין ‖ 2) f. (v. בִּינָא III) thread, a…` | `5 11 Qerys Ar.s.v. בין‎ 2( 1. (v-RS SL) thrend,` | [163b · leaf 186](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$187/full/1400,/0/default.jpg) |
| [I00149](https://jastrow.app/#rid:I00149) | `…in pl.; = טפטפ׳, v. טִיפְטֵף ‖ 2) [something glistening,] beads…` | `.] beads used as charms, ornament worn \|` | [523a · leaf 546](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$547/full/1400,/0/default.jpg) |

Why held: A00913 `9) coening`: the label and the gloss are misread; A03277 mirrored Hebrew run; no `2)` in the line; B00656 `2( 1.`: the label is mirrored; I00149 `.] beads used as charms`: the label is missing.

**Question.** Does print run on at the `‖` (the `N)` inside the parenthesis, no sense break)?

- **A00913** (P000195)
  - [ ] yes: print runs on
  - [ ] no: print starts a sense there
  - [ ] can't tell from the scan
  - note: 
- **A03277** (P000203)
  - [ ] yes: print runs on
  - [ ] no: print starts a sense there
  - [ ] can't tell from the scan
  - note: 
- **B00656** (P000206)
  - [ ] yes: print runs on
  - [ ] no: print starts a sense there
  - [ ] can't tell from the scan
  - note: 
- **I00149** (P000223)
  - [ ] yes: print runs on
  - [ ] no: print starts a sense there
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): each `N)` follows a cross-reference whose parenthesis it closes, as in the 32 of this class whose hOCR reads it.

#### A01194 `אֵיזֶה`: the `)` after `b. h.`

Covers 1 patch (P000197). The patch: print closes the parenthesis: `(b. h.) who?`.

| rid | Sefaria's text | hOCR, verbatim | scan |
|---|---|---|---|
| [A01194](https://jastrow.app/#rid:A01194) | `…אֵיזוּ f. (b. h. who? what? which? Ab.…` | `אי זַה=אֶיזֶה WPS, SN m., 1% +. (b. h.‏ ,איזה` | [46b · leaf 69](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$70/full/1400,/0/default.jpg) |

Why held: A01194 the Hebrew run is mirrored; the `)` the patch inserts is not readable.

**Question.** Does print read `(b. h.)`, closing the parenthesis?

- **A01194** (P000197)
  - [ ] yes: `(b. h.)`
  - [ ] no (say what it reads)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): every `(b. h.` etymology closes before the gloss.

#### H00871 `חִירָה`: the two `Ib.` after the Mekhilta

Covers 1 patch (P000221). The patch: the two bare `Ib.` cite `Exodus 14`: the patch wraps each in a link to it.

| rid | Sefaria's text | hOCR, verbatim | scan |
|---|---|---|---|
| [H00871](https://jastrow.app/#rid:H00871) | `…Mekh. B’shall. s. 1 (ref. to Pi-Haḥiroth, Ex. XIV, 2) מה ח׳ וכ׳ what was the nature of these rocks?—They were not slanting but abrupt &c. Ib. הח׳ מצד וכ׳ the rocks were on one side, and Migdol &c. Ib. איו ח׳…` | `—They were not slanting but abrupt ₪6. Ib, הח" מצד וכ'‎` | [460a · leaf 483](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$484/full/1400,/0/default.jpg) |

Why held: H00871 the `Ib.` is there, but a link target is not something print shows; and print's `Ib.` follows `Mekh. B’shall. s. 1`, so it may cite the Mekhilta, not `Exodus 14`.

**Question.** Do the two `Ib.` cite Exodus 14 (not the Mekhilta passage before them)?

- **H00871** (P000221)
  - [ ] yes: Exodus 14
  - [ ] no: they cite the Mekhilta (the patch is wrong, and a PR unwraps them)
  - [ ] can't tell from the scan
  - note: 

Recommendation: no (medium): `Ib.` after `Mekh. B’shall. s. 1` reads as the Mekhilta; the `Ex. XIV, 2` is inside its parenthesis.

#### `refs` items with no basis in the entry

Covers 3 patches (P000217, P000232, P000264). The patches' claim: the entry cites no such place, so the item is removed.

| rid | Sefaria's text | hOCR, verbatim | scan |
|---|---|---|---|
| [D00541](https://jastrow.app/#rid:D00541) | `refs` lists `Yoma 2a` | no readable line | [297b · leaf 320](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$321/full/1400,/0/default.jpg) |
| [M01355](https://jastrow.app/#rid:M01355) | `refs` lists `Rosh Hashanah 23b` | no readable line | [781b · leaf 104](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$105/full/1400,/0/default.jpg) |
| [Q00890](https://jastrow.app/#rid:Q00890) | `refs` lists `Yoma 2a:3` | no readable line | [1172b · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$496/full/1400,/0/default.jpg) |

Why held: D00541 an absent citation: no hOCR line can show that print does not cite `Yoma 2a`; M01355 an absent citation: no hOCR line can show that print does not cite `Rosh Hashanah 23b`; Q00890 an absent citation: no hOCR line can show that print does not cite `Yoma 2a:3`.

**Question.** Does print's entry cite that place anywhere (an `Ib.` included)?

- **D00541** (P000217)
  - [ ] no: print cites no such place (the removal stands)
  - [ ] yes (say where)
  - [ ] can't tell from the scan
  - note: 
- **M01355** (P000232)
  - [ ] no: print cites no such place (the removal stands)
  - [ ] yes (say where)
  - [ ] can't tell from the scan
  - note: 
- **Q00890** (P000264)
  - [ ] no: print cites no such place (the removal stands)
  - [ ] yes (say where)
  - [ ] can't tell from the scan
  - note: 

Recommendation: no (high): the review of 2026-08-05 checked each entry's text, `Ib.` included; the scan read only confirms it.

#### `בַּד V` (B00098) and the link that names it (B00097)

Covers 2 patches (P000290, P000306). The patches' claim: print sets `בַּד V`: one form, its numeral after it.

| rid | Sefaria's text | hOCR, verbatim | scan |
|---|---|---|---|
| [B00098](https://jastrow.app/#rid:B00098) | `בַּד  V` | `single stalk, twig; also (b. h.) pole, =‏ (בדד) m.‏ בד` | [138b · leaf 161](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$162/full/1400,/0/default.jpg) |
| [B00097](https://jastrow.app/#rid:B00097) | `next w. → Jastrow, בַּד  V` | `\| stalks (v. preced. a. next w.); Yoma 71". 10. 35% bad is` | [138b · leaf 161](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$162/full/1400,/0/default.jpg) |

Why held: B00098 the bold headword is not read; no `V`; B00097 rests on B00098's `V` (P000290), which the hOCR does not show.

**Question.** Does print set `בַּד V` at B00098?

- **B00098** (P000290)
  - [ ] yes: `בַּד V`
  - [ ] no (say what it sets)
  - [ ] can't tell from the scan
  - note: 
- **B00097** (P000306)
  - [ ] yes: `בַּד V`
  - [ ] no (say what it sets)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the doubled space is a data slip, and B00097 cites it as `next w.`.

#### A stray comma before the numeral

Covers 3 patches (P000291, P000292, P000293). The patches' claim: print sets the numeral straight after the form, with no comma.

| rid | Sefaria's text | hOCR, verbatim | scan |
|---|---|---|---|
| [B00443](https://jastrow.app/#rid:B00443) | `בִּזְיוּנָא , II` | `NON FS, I mn. (rst, +. NOM. Mand. Gr, § 119) slit.` | [153b · leaf 176](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$177/full/1400,/0/default.jpg) |
| [C00329](https://jastrow.app/#rid:C00329) | `גַּוָּוזָא , II` | `MINS, LT m. (v. preced.) castrate, eunuch; in gen.` | [219b · leaf 242](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$243/full/1400,/0/default.jpg) |
| [M00447](https://jastrow.app/#rid:M00447) | `מוֹזְלָא , I` | no readable line | [740a · leaf 63](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$64/full/1400,/0/default.jpg) |

Why held: B00443 `NON FS, I mn.`: the headword and numeral are misread; C00329 `MINS, LT m.`: the numeral is misread; M00447 no readable head line.

**Question.** Does print set the numeral straight after the form, with no comma?

- **B00443** (P000291)
  - [ ] yes: no comma
  - [ ] no: print has the comma
  - [ ] can't tell from the scan
  - note: 
- **C00329** (P000292)
  - [ ] yes: no comma
  - [ ] no: print has the comma
  - [ ] can't tell from the scan
  - note: 
- **M00447** (P000293)
  - [ ] yes: no comma
  - [ ] no: print has the comma
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the entry before or after carries the other numeral of the pair.

#### A gloss comma inside the headword

Covers 3 patches (P000294, P000295, P000296). The patches' claim: print sets `X I, II`, and the comma after `II` opens the gloss `v. …`.

| rid | Sefaria's text | hOCR, verbatim | scan |
|---|---|---|---|
| [A02356](https://jastrow.app/#rid:A02356) | `אִסְטְוָוא  I, II,` | no readable line | [90a · leaf 113](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$114/full/1400,/0/default.jpg) |
| [B00407](https://jastrow.app/#rid:B00407) | `בְּזָא  I, II,` | no readable line | [151b · leaf 174](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$175/full/1400,/0/default.jpg) |
| [D00844](https://jastrow.app/#rid:D00844) | `דִּלְמָא  I, II,` | no readable line | [310b · leaf 333](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$334/full/1400,/0/default.jpg) |

Why held: A02356 no readable head line; B00407 no readable head line; D00844 no readable head line.

**Question.** Does print set `X I, II, v. …`, the last comma before the cross-reference?

- **A02356** (P000294)
  - [ ] yes
  - [ ] no (say what it sets)
  - [ ] can't tell from the scan
  - note: 
- **B00407** (P000295)
  - [ ] yes
  - [ ] no (say what it sets)
  - [ ] can't tell from the scan
  - note: 
- **D00844** (P000296)
  - [ ] yes
  - [ ] no (say what it sets)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the gloss is the cross-reference `v. … I, II`.

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
  - note: 
- **I00654** (P000298)
  - [ ] yes: two forms
  - [ ] no: print sets them as stored
  - [ ] can't tell from the scan
  - note: 
- **M02116** (P000299)
  - [ ] yes: two forms
  - [ ] no: print sets them as stored
  - [ ] can't tell from the scan
  - note: 
- **A01161** (P000300)
  - [ ] yes: two forms
  - [ ] no: print sets them as stored
  - [ ] can't tell from the scan
  - note: 
- **M02868** (P000301)
  - [ ] yes: two forms
  - [ ] no: print sets them as stored
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): two complete spellings of one word, as the forms around them are set.

#### `X = Y` heads

Covers 2 patches (P000309, P000310). The patches' claim: print's headword is X, and `= Y` is its gloss.

| rid | Sefaria's text | hOCR, verbatim | scan |
|---|---|---|---|
| [A01175](https://jastrow.app/#rid:A01175) | `אִידְרְעָא = אֶדְרְעָא` | no readable line | [45b · leaf 68](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$69/full/1400,/0/default.jpg) |
| [A01345](https://jastrow.app/#rid:A01345) | `אִימְנוֹן = הִמְנוֹן` | no readable line | [51a · leaf 74](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$75/full/1400,/0/default.jpg) |

Why held: A01175 no readable head line; A01345 no readable head line.

**Question.** Does print set X as the headword, with `= Y` after it as its gloss?

- **A01175** (P000309)
  - [ ] yes
  - [ ] no (say what it sets)
  - [ ] can't tell from the scan
  - note: 
- **A01345** (P000310)
  - [ ] yes
  - [ ] no (say what it sets)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): `=` introduces a gloss throughout the dictionary.
