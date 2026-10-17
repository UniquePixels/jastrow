# Maintainer checklist: what waits on you

Every item that waits on the maintainer, and nothing else. Each block
asks one question: tick ONE box per bullet, and write a `note:` only
where the box you tick asks for one. A block's `Recommendation:` is a
default you can accept by ticking the box it names. When you are
done, say "checklist done", and the ticks are turned into patches. An
item leaves this file when a PR applies it; its history (the answer,
what was written, the patch ids) lives in the worklists
([`headword-worklist.md`](headword-worklist.md),
[`sense-worklist.md`](sense-worklist.md)) and the tranche READMEs
under
[`admin/pipeline/patch/records/tranches/`](../admin/pipeline/patch/records/tranches/).
Started 2026-10-16 (PR #PRNUM) by moving the open sections out of
`headword-worklist.md`; `sense-worklist.md` has no unticked question.

| section | items | source PR | ledger row |
|---|---|---|---|
| [Cross-reference numerals (2026-10-14)](#cross-reference-numerals-2026-10-14) | 48 questions, 74 cites | #173 | L64 |
| [Cross-reference spellings (2026-10-16)](#cross-reference-spellings-2026-10-16) | 17 blocks, 19 entries | #184 | L72 |
| [Scan reads for L65–L66 (2026-10-16)](#scan-reads-for-l65l66-2026-10-16) | 3 blocks | #185 | L65, L66 |
| [X11: one-letter primaries (2026-10-15)](#x11-one-letter-primaries-2026-10-15) | 2 blocks | #181 | L39 |
| [Textual-research candidates (for #153)](#textual-research-candidates-for-153) | 18 rows to paste (23 listed; 5 already in #153) | #181 | L47 |

One rid is asked twice: M02423's cite `v. מַוֶּה II`. Its numerals
block (`מַוֶּה II`) was written before PR #182, whose P000817 re-aimed
the cite at M00725 (review ledger L51); what is left of it is the cite's
letter, vav or zayin, which the § Scan reads block for L65 asks
directly. One scan read answers both.

## Cross-reference numerals (2026-10-14)

**Status:** the determined retargets are applied in PR #178 (196
cites on 184 entries; [`correction-audit.md`](correction-audit.md)
§5.1 lists the 16 not written there: 10 in `language_reference`
waiting on review ledger L50, and 6 `X I ch.` cites held for a read).
The 48 questions below still wait on your ticks.

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
  ruling 10-05), with the hOCR line of each member where one matched
  its gloss (backticks in the OCR shown as `'`; "no line matched" means
  the alignment found none, not that print lacks the line) and its
  scan.
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
| [A00626](https://jastrow.app/#rid:A00626) | `אוי, אָוָה I` | no line matched | [24a · leaf 47](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$48/full/1400,/0/default.jpg) |
| [A00627](https://jastrow.app/#rid:A00627) | `אוי, אָוָה II` | no line matched | [24a · leaf 47](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$48/full/1400,/0/default.jpg) |

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
| [A01918](https://jastrow.app/#rid:A01918) | `אִלְמָלֵא, אִלְמָלֵי, אִילְ׳` | no line matched | [71b · leaf 94](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$95/full/1400,/0/default.jpg) |

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
| [C00294](https://jastrow.app/#rid:C00294) | `גּוּבְתָּא, גַּבְתָּא, גּוּפְתָּא` | no line matched | [217b · leaf 240](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$241/full/1400,/0/default.jpg) |
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
| [C00577](https://jastrow.app/#rid:C00577) | `גִּזְרָא, גִּיזְרָא` | no line matched | [232a · leaf 255](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$256/full/1400,/0/default.jpg) |
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
| [C01128](https://jastrow.app/#rid:C01128) | `גָּנַח` | no line matched | [259a · leaf 282](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$283/full/1400,/0/default.jpg) |
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
| [H00747](https://jastrow.app/#rid:H00747) | `חַיְיתָא I, חַיְתָא` | no line matched | [455a · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |
| [H00748](https://jastrow.app/#rid:H00748) | `חַיְיתָא II, חַיְתָא` | no line matched | [455a · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |
| [H00749](https://jastrow.app/#rid:H00749) | `חַיְּיתָא III, חַיָּתָא` | no line matched | [455b · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |
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
| [H00840](https://jastrow.app/#rid:H00840) | `חֵיפָא II` | no line matched | [459a · leaf 482](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$483/full/1400,/0/default.jpg) |
| [H00841](https://jastrow.app/#rid:H00841) | `חִיפָּא` | no line matched | [459a · leaf 482](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$483/full/1400,/0/default.jpg) |
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
| [H01098](https://jastrow.app/#rid:H01098) | `חָלַף` | no line matched | [471b · leaf 494](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$495/full/1400,/0/default.jpg) |
| [H01099](https://jastrow.app/#rid:H01099) | `חֲלַף I, חֲלֵיף` | `ch. same, to pass by, be gone. Targ. חליף 8 חלף` | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |
| [H01100](https://jastrow.app/#rid:H01100) | `חִלֶף I` | no line matched | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |
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
| [H01218](https://jastrow.app/#rid:H01218) | `חָמַר I` | no line matched | [479b · leaf 502](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$503/full/1400,/0/default.jpg) |
| [H01219](https://jastrow.app/#rid:H01219) | `חֲמַר` | no line matched | [479b · leaf 502](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$503/full/1400,/0/default.jpg) |
| [H01220](https://jastrow.app/#rid:H01220) | `חָמַר II` | no line matched | [479b · leaf 502](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$503/full/1400,/0/default.jpg) |
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
| [M02850](https://jastrow.app/#rid:M02850) | `מְשַׁח III, מִשְׁחָא, מִישְׁ׳ I` | no line matched | [851a · leaf 174](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$175/full/1400,/0/default.jpg) |
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
| [N00314](https://jastrow.app/#rid:N00314) | `נָוָה` | no line matched | [884a · leaf 207](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$208/full/1400,/0/default.jpg) |
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
| [N00343](https://jastrow.app/#rid:N00343) | `נוֹחַ II, נוֹחָה` | no line matched | [886b · leaf 209](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$210/full/1400,/0/default.jpg) |
| [N00344](https://jastrow.app/#rid:N00344) | `נוֹחַ III` | no line matched | [886b · leaf 209](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$210/full/1400,/0/default.jpg) |

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
| [O00121](https://jastrow.app/#rid:O00121) | `סְגֵי, סְגָא II` | no line matched | [954a · leaf 277](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$278/full/1400,/0/default.jpg) |
| [O00122](https://jastrow.app/#rid:O00122) | `סְגֵי III, סַגְיָא I` | `Targ. Gen. XXXII, 13 (12) Xg^D (0. ed. Vien. ">apa; some` | [954a · leaf 277](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$278/full/1400,/0/default.jpg) |
| [O00123](https://jastrow.app/#rid:O00123) | `סַגִּי, סַגִּיא, סַגִּיאָה` | no line matched | [954a · leaf 277](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$278/full/1400,/0/default.jpg) |
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
| [P00130](https://jastrow.app/#rid:P00130) | `עדי, עָדָה II` | no line matched | [1044a · leaf 367](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$368/full/1400,/0/default.jpg) |
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
| [P00973](https://jastrow.app/#rid:P00973) | `עֲנֵי, עֲנָא` | no line matched | [1093b · leaf 416](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$417/full/1400,/0/default.jpg) |
| [P00974](https://jastrow.app/#rid:P00974) | `עֹנִי` | no line matched | [1093b · leaf 416](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$417/full/1400,/0/default.jpg) |
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
| [P01245](https://jastrow.app/#rid:P01245) | `עֲרַב` | no line matched | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01246](https://jastrow.app/#rid:P01246) | `עָרֵב I` | `cmp. esp. Targ. Ex. XXX, 35,] to be sweet, pleasant. Lam.` | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01247](https://jastrow.app/#rid:P01247) | `עָרִב II` | `J y II m.(b.h.; preced. )spiced, sweet ; pleasing. Dem.` | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01248](https://jastrow.app/#rid:P01248) | `עָרֵּב` | no line matched | [1111a · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |
| [P01249](https://jastrow.app/#rid:P01249) | `עָרֵב III` | `I, 4 '31 'S i? son bring me one to go security, and I shall` | [1111a · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |
| [P01250](https://jastrow.app/#rid:P01250) | `עֹרֵב` | no line matched | [1111a · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |
| [P01251](https://jastrow.app/#rid:P01251) | `עֶרֶב` | `'S3 in the evening (at prayer) ; a. v.fr. — Trnsf. decline. Gen.` | [1111a · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |
| [P01252](https://jastrow.app/#rid:P01252) | `עֲרָב I` | no line matched | [1111b · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |
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
| [P01272](https://jastrow.app/#rid:P01272) | `עֵרָבוֹן, עֵי׳ I` | no line matched | [1112b · leaf 435](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$436/full/1400,/0/default.jpg) |
| [P01273](https://jastrow.app/#rid:P01273) | `עֵרָבוֹן, עֵי׳` | `VCnS?, ^V m. (b. h.; 31SI) 1) pledge, earnest-money.` | [1112b · leaf 435](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$436/full/1400,/0/default.jpg) |

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
| [Q01962](https://jastrow.app/#rid:Q01962) | `פַּרְפֵּר` | no line matched | [1236b · leaf 559](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$560/full/1400,/0/default.jpg) |
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
| [R00061](https://jastrow.app/#rid:R00061) | `צִבְעָא, צִי׳ I` | no line matched | [1259b · leaf 582](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$583/full/1400,/0/default.jpg) |
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
| [R00715](https://jastrow.app/#rid:R00715) | `צְפַר IV, צַפְרָא` | no line matched | [1298b · leaf 621](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$622/full/1400,/0/default.jpg) |
| [R00716](https://jastrow.app/#rid:R00716) | `צִפֹּר` | no line matched | [1298b · leaf 621](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$622/full/1400,/0/default.jpg) |
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
| [S00526](https://jastrow.app/#rid:S00526) | `קָוַץ` | no line matched | [1339a · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00527](https://jastrow.app/#rid:S00527) | `קְוַץ` | `7]p ch. same. Succ. 23b KTNg Ar. (ed. '113), v. ptt.` | [1339a · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00528](https://jastrow.app/#rid:S00528) | `קוּץ I` | no line matched | [1339a · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00529](https://jastrow.app/#rid:S00529) | `קוּץ` | no line matched | [1339a · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00530](https://jastrow.app/#rid:S00530) | `קוּץ II` | no line matched | [1339a · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00531](https://jastrow.app/#rid:S00531) | `קוּץ III` | no line matched | [1339a · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00532](https://jastrow.app/#rid:S00532) | `קוּץ` | no line matched | [1339a · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| [S00533](https://jastrow.app/#rid:S00533) | `קוּץ IV` | no line matched | [1339b · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
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
| [T00881](https://jastrow.app/#rid:T00881) | `רָעָה` | no line matched | [1486a · leaf 809](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$810/full/1400,/0/default.jpg) |
| [T00882](https://jastrow.app/#rid:T00882) | `רָעָה` | no line matched | [1486a · leaf 809](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$810/full/1400,/0/default.jpg) |

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
| [U00058](https://jastrow.app/#rid:U00058) | `שֵׁב` | no line matched | [1509b · leaf 832](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$833/full/1400,/0/default.jpg) |
| [U00059](https://jastrow.app/#rid:U00059) | `שַׁב, שֵׁב, שֵׁיב` | `Targ/o. Gen. XXIX, 27, sq. ed. Berl. (oth. ed. Xn313i3 ;` | [1509b · leaf 832](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$833/full/1400,/0/default.jpg) |
| [U00060](https://jastrow.app/#rid:U00060) | `שַׁב, שַׁבָּא, שׁוּבָּא` | no line matched | [1509b · leaf 832](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$833/full/1400,/0/default.jpg) |

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
| [U00104](https://jastrow.app/#rid:U00104) | `שֵׁבֶט` | no line matched | [1512b · leaf 835](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$836/full/1400,/0/default.jpg) |
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
| [U00344](https://jastrow.app/#rid:U00344) | `שְׁוַוח, שְׁוַח, שׁוּחַ` | no line matched | [1529b · leaf 852](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$853/full/1400,/0/default.jpg) |
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
| [U00395](https://jastrow.app/#rid:U00395) | `שָׁוְי, שַׁוְיָא I` | no line matched | [1533a · leaf 856](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$857/full/1400,/0/default.jpg) |
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
| [U00475](https://jastrow.app/#rid:U00475) | `שׁוּעַ` | no line matched | [1537b · leaf 860](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$861/full/1400,/0/default.jpg) |
| [U00476](https://jastrow.app/#rid:U00476) | `שׁוּעַ` | `51123 oh. same, l)[to smooth over,] to plaster. Targ.O.` | [1538a · leaf 861](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$862/full/1400,/0/default.jpg) |
| [U00477](https://jastrow.app/#rid:U00477) | `שָׁוַע` | no line matched | [1538a · leaf 861](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$862/full/1400,/0/default.jpg) |
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

Since PR #179 U00488 carries I (L50's fix), so the three are determined and wait only on this tick.

### `שׁוּתָא III`: N01120 (target numbered otherwise)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U00580](https://jastrow.app/#rid:U00580) | `שׁוּתָא I` | no line matched | [1544a · leaf 867](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$868/full/1400,/0/default.jpg) |
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
| [U01013](https://jastrow.app/#rid:U01013) | `שִׁיפּוּי, שִׁפּ׳ II` | no line matched | [1566a · leaf 889](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$890/full/1400,/0/default.jpg) |

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
| [U01071](https://jastrow.app/#rid:U01071) | `שֵׁירוּתָא, שֵׁר׳, שֵׁירוּ, שֵׁרוּ II` | `SnrP'4 *"K£3 III, T\% Tit II f. (r?) [nwf,` | [1569a · leaf 892](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$893/full/1400,/0/default.jpg) |

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
| [U01269](https://jastrow.app/#rid:U01269) | `שֶׁלַח III` | no line matched | [1580b · leaf 903](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$904/full/1400,/0/default.jpg) |
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
| [U01470](https://jastrow.app/#rid:U01470) | `שָׁמִין, שְׁמֵין` | `■pQti II, "fDp m. = h. ip/r, fat. Targ. Y. Gen.` | [1595b · leaf 918](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$919/full/1400,/0/default.jpg) |

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
| [U01497](https://jastrow.app/#rid:U01497) | `שְׁמֵן` | no line matched | [1597b · leaf 920](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$921/full/1400,/0/default.jpg) |
| [U01498](https://jastrow.app/#rid:U01498) | `שָׁמֵן, שְׁמֵנָה, שְׁמֵי׳` | `rich. Keth. 61a 'O loa fat meat. Pes. 42*. Hull. 451' "^a` | [1597b · leaf 920](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$921/full/1400,/0/default.jpg) |
| [U01499](https://jastrow.app/#rid:U01499) | `שְׁמַן` | no line matched | [1597b · leaf 920](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$921/full/1400,/0/default.jpg) |
| [U01500](https://jastrow.app/#rid:U01500) | `שֶׁמֶן` | `TQ23 m. (b. h.; preced. wds.) oil, fat. Sabb. II, 1 'w` | [1597b · leaf 920](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$921/full/1400,/0/default.jpg) |
| [U01501](https://jastrow.app/#rid:U01501) | `שִׁמָּן` | no line matched | [1598a · leaf 921](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$922/full/1400,/0/default.jpg) |

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
| [U01736](https://jastrow.app/#rid:U01736) | `שפי, שָׁפָה II` | no line matched | [1615a · leaf 938](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$939/full/1400,/0/default.jpg) |
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
| [U02054](https://jastrow.app/#rid:U02054) | `שֵׁשׁ I` | no line matched | [1635b · leaf 958](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$959/full/1400,/0/default.jpg) |
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
| [V00273](https://jastrow.app/#rid:V00273) | `תּוֹר I` | no line matched | [1656a · leaf 979](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$980/full/1400,/0/default.jpg) |
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
| [V00600](https://jastrow.app/#rid:V00600) | `תַּלְמָא, תְּלָאמָא` | `tf*£x»'_ II, kSCSx^i m. (Assyr. talimu, Del. Assyr.` | [1672a · leaf 995](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$996/full/1400,/0/default.jpg) |

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
| [V00817](https://jastrow.app/#rid:V00817) | `תָּפִי, טָפִי` | no line matched | [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |
| [V00818](https://jastrow.app/#rid:V00818) | `תְּפִי, תַּפְיָא, תַּפְיָיה, תִּי׳` | no line matched | [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |

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

## Cross-reference spellings (2026-10-16)

**Status:** 19 entries in 17 blocks wait on your ticks. Nothing is
written until you tick; a later data PR turns each "yes" into a
reviewed `reform` (case 1, no annotation, as D00503's P000821 in PR #184)
and re-aims the cites whose pointing names the corrected entry.

A new list, from review ledger L72: headwords one OCR letter away from
the spelling Jastrow's own cross-references use, where the alphabet
agrees with Jastrow. D00503 `דֵּין` was the first: the scan reads
`דֵּיו`, four cites spell it so, and Sefaria linked all four to D00500
`דְּיוֹ` (ink) because the right entry was misspelled. Each block below
has three witnesses: (1) cites whose text differs from the stored form
by one letter of a pair the OCR confuses (`hebrew.ts`'s
`CONFUSION_GROUPS`), (2) the stored spelling sorts outside its two
neighbours in the source while the cites' spelling sorts between them,
and (3) the entry's own text, where it helps. The hOCR rarely settles
it: volume 1's Tesseract garbles the Hebrew of a headword, and volume
2's ABBYY reads none; so each needs your scan read, as D00503 did.

Tick ONE box per bullet, a note only where a box asks for one; each
block's `Recommendation:` is a default you can accept by ticking the
box it names. "Yes" renames the entry (U6: free before go-live).
Confidence: high where all three witnesses agree; medium where two do.

| rid | stored | Jastrow's text spells | neighbours (source order) | recommendation |
|---|---|---|---|---|
| A00021 | `אַכְאָבִית` | `אַבְאָבִית` (8 cites) | `אִבָּא` … `אבאטיס` | yes, bet (high) |
| A03020 | `אֻרְיָה` | `אֻרְוָה` (3 cites) | `אָרוֹד` … `אַרְוָוד` | yes, vav (high) |
| K00228 | `כּוֹזְכָא` | `כּוֹזְבָא` (1 cite; gloss `Koz’ba`) | `כּוֹזָב` … `כּוּזָה` | yes, bet (high) |
| K00780 | `כַּלְקִירָא` | `כַּלְקִידָא` (1 cite) | `כַּלַּקְטֵירִין` … `כַּלְקִיס` | yes, dalet (high) |
| U01011 | `שִׁופּוּט` | `שִׁיפּוּט` (1 cite) | `שִׂיפְוָונִיֹּות` … `שִׁיפּוּי` | yes, yod (high) |
| H00980 | `חָלַך` | `חָלַד` (4 cites) | `חֲלַגְלוֹג` … `חֲלַד` | yes, dalet (high) |
| P00609 | `עֵינָיָון` | `עֵינָוָון` (2 cites) | `עִינּוּג` … `עִינְוָון` | yes, vav (medium) |
| R00152 | `צַיַּאר` | `צַוַּאר` (1 cite; `צַוָּאר` 4) | `צַוָּאר` … `צַוַּארְנוֹיָיתָא` | yes, vav (high) |
| R00171 | `צְיַוח` | `צְוַוח` (3 cites) | `צָוַוח` … `צְוָוחָא` | yes, vav (high) |
| S00216 | `קַיָּא` | `קַוָּא` (2 cites) | `קַו` … `קוּא` | yes, vav (high) |
| U00721 | `שַׁהְרֵר` | `שַׁחְרֵר` (1 cite) | `שִׁחֲרֵר` … `שְׁחַרְתָּא` | yes, ḥet (high) |
| U01223 | `שִׁלְחֵי` | `שִׁלְהֵי` (2 cites) | `שִׁלְהֲוֵי` … `שַׁלְהֵי I` | yes, he (high) |
| P00855, P00856, P00860 | `עָמַך I`, `עָמַך II`, `עֶמֶך` | `עָמַד` (16 cites), `עֶמֶד` | `עמאוקו` … `*עֲמַד`; `עָמָד I` … `עֲמָדָה II` | yes, dalet, all three (high) |
| A00718 | `אַיְנָא I` | `אֲוָנָא` (A00749) | `אוֹן` … `אֲוָנָא II` | yes, vav (medium) |
| A01632 | `אֶושָּׁתָא` | `אִישְׁתָּא` (a neighbour's spelling) | `אִישַׁת` … `אֶישְׁתָּא` | yes, yod (medium) |
| C00299 | `גּוּך` | `גּוּד` (C00300's spelling, 5 cites) | `גּוּגְמֵי` … `גּוּד` | yes, dalet (medium) |
| C01130 | `גְּנַה II` | `גְּנַח` (6 cites; C00538 `גְּנַח II`) | `גְּנַח I` … `גני` | yes, ḥet (high) |

Not asked: the measurement's other order-witnessed rows (review ledger
L72). M01544 `מלו` (its gloss quotes `מלי גאלה`), N00084 `נְבִיָּוא`
(`v. נְבִיָּא`) and R00169 `צַיָּואָה` are plausible but carry one
witness each; L00051, L00602, V00140, V00485 and C01208 read as print's
own spelling.

### `אַבְאָבִית`: A00021 (stored `אַכְאָבִית`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A00021](https://jastrow.app/#rid:A00021) | `אַכְאָבִית, אֲבָבִית, עַבְעָבִית, עֲבָבִית, עַוְעָוִית` | `עועוית שבבית MAY, ,אִבְבִית ,אבאבית` | [2b · leaf 25](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$26/full/1400,/0/default.jpg) |

Eight cites spell the word `אַבְאָבִית` and Sefaria links all eight
here: A01120, A01664 (`חמה וא׳, a vers. for אַבְאָבִית`), H00909,
H00938, H01152, P00012, P00056 and P00237 (`v. אַבְאָבִית`). The hOCR's
first word is `אבאבית`, and the entry stands between A00020 `אִבָּא`
and A00022 `אבאטיס`, where `אבאבית` sorts and `אכאבית` (under `אכ`,
p. 62) does not. Its alternates `אֲבָבִית, עַבְעָבִית` reduplicate the
same `אב`.

**Question.** Does print read `אַבְאָבִית` (bet) where A00021 stores
`אַכְאָבִית`?

- **A00021**
  - [ ] yes: `אַבְאָבִית` (case 1; the name changes)
  - [ ] no: print reads `אַכְאָבִית`; as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the hOCR, the alphabet and eight cites
agree.

### `אֻרְוָה`: A03020 (stored `אֻרְיָה`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A03020](https://jastrow.app/#rid:A03020) | `אֻרְיָה` | `TPN f. (b. h.; v. אהּרְלָא 11( manger, crib.— Pl. רות` | [116a · leaf 139](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$140/full/1400,/0/default.jpg) |

`f. (b. h.; v. אוּרְיָא II) manger, crib.—Pl. אֻרְווֹת`. The biblical
word is `אֻרְוָה` (pl. `אֻרְוֹת`), and three cites spell it so, all
linked here: A00863 (`v. אוּרְיָא II a. אֻרְוָה`), A00878 (`b. h.
אֻרְוָה q. v.`) and A00879 (`ch. (= b. h. אֻרְוָה) crib`). The entry
stands between A03019 `אָרוֹד` and A03021 `אַרְוָוד`: `ארוה` sorts
there, `אריה` would follow `ארווד`. The hOCR misreads the headword.

**Question.** Does print read `אֻרְוָה` (vav) where A03020 stores
`אֻרְיָה`?

- **A03020**
  - [ ] yes: `אֻרְוָה` (case 1; the name changes)
  - [ ] no: print reads `אֻרְיָה`; as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the cites, the plural and the alphabet
agree.

### `כּוֹזְבָא`: K00228 (stored `כּוֹזְכָא`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [K00228](https://jastrow.app/#rid:K00228) | `כּוֹזְכָא, כּוֹזְבָה, כּוֹזִיבָא` | `(Bar-) Koz’ ba, name of the leader of the Jewish uprising` | [618a · leaf 641](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$642/full/1400,/0/default.jpg) |

Bar Kozba: the gloss transliterates `Koz’ba`, the alternates are
`כּוֹזְבָה` and `כּוֹזִיבָא`, and K00230 reads `כּוֹזִיבָא, v.
כּוֹזְבָא` (linked here). The entry stands between K00227 `כּוֹזָב`
(`v. next w.`) and K00229 `כּוּזָה`; `כוזבא` sorts there, `כוזכא`
after `כוזה`.

**Question.** Does print read `כּוֹזְבָא` (bet) where K00228 stores
`כּוֹזְכָא`?

- **K00228**
  - [ ] yes: `כּוֹזְבָא` (case 1; the name changes)
  - [ ] no: print reads `כּוֹזְכָא`; as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the gloss, the alternates, the cite and
the alphabet agree.

### `כַּלְקִידָא`: K00780 (stored `כַּלְקִירָא`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [K00780](https://jastrow.app/#rid:K00780) | `כַּלְקִירָא` | `NT PD vas` | [645b · leaf 668](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$669/full/1400,/0/default.jpg) |
| [K00782](https://jastrow.app/#rid:K00782) | `כלקירא` | `wae .+ ,כלקירא` | same |

Both are `, v. כַּלְכִּיד`. K00753 reads `Y. Peah VIII, 21ᵃ top (סלק׳)
כלקורא, read: כַּלְקִידָא` and Sefaria links it to K00780. K00780
stands before K00781 `כַּלְקִיס`, where `כלקידא` sorts; K00782, after
it, is where `כלקירא` sorts, and its hOCR reads `כלקירא`. So print
likely sets both spellings, `ד` first.

**Question.** Does print read `כַּלְקִידָא` (dalet) where K00780 stores
`כַּלְקִירָא`?

- **K00780**
  - [ ] yes: `כַּלְקִידָא` (case 1; the name changes)
  - [ ] no: print reads `כַּלְקִירָא` twice; as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the cite's `read:` and the alphabet agree,
and K00782 keeps the `ר` spelling in its own place.

### `שִׁיפּוּט`: U01011 (stored `שִׁופּוּט`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01011](https://jastrow.app/#rid:U01011) | `שִׁופּוּט, שִׁפּ׳` | `13* S"1^ 5*CJ m. (L'B'O, v. XUBlO) childishness, folly,` | [1566a · leaf 889](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$890/full/1400,/0/default.jpg) |

`m. (שפט, v. שִׁפְטָא) childishness, folly, vanity`. The stored form
sets a hiriq before a bare vav, which no word does; U00497 reads `V.
שִׁיפּוּט` (linked here), and the alternate `שִׁפּ׳` is the defective
spelling of the same word. The entry stands between U01010
`שִׂיפְוָונִיֹּות` and U01012 `שִׁיפּוּי`, where `שיפוט` sorts and
`שופוט` does not.

**Question.** Does print read `שִׁיפּוּט` (yod) where U01011 stores
`שִׁופּוּט`?

- **U01011**
  - [ ] yes: `שִׁיפּוּט` (case 1; the name changes)
  - [ ] no: as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the pointing, the cite and the alphabet
agree.

### `חָלַד`: H00980 (stored `חָלַך`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00980](https://jastrow.app/#rid:H00980) | `חָלַך` | `om (emp. 55m) to undermine, cave, dig. Pes. 118` | [464b · leaf 487](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$488/full/1400,/0/default.jpg) |

`(cmp. חלל) to undermine, cave, dig`, followed by H00981 `חֲלַד ch.
same` and H00982 `חֶלֶד m. (b. h.; preced.) mould`. Four cites spell
the Hebrew verb `חָלַד`, with this entry's qamats and patah, and
Sefaria links them to H00981, the `ch.` line: E00561, H00330 (`f.
(חָלַד; cmp. b. h. חֹלֶד)`), H00990 and U01212 (`contr. of שחלד, v.
חָלַד`). The entry stands between H00979 `חֲלַגְלוֹג` and H00981
`חֲלַד`, where `חלד` sorts and `חלך` does not.

**Question.** Does print read `חָלַד` (dalet) where H00980 stores
`חָלַך`?

- **H00980**
  - [ ] yes: `חָלַד` (case 1; the name changes, and the four cites move here)
  - [ ] no: as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): `ch. same` names this word, and the cites
and the alphabet agree.

### `עֵינָוָון`: P00609 (stored `עֵינָיָון`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P00609](https://jastrow.app/#rid:P00609) | `עֵינָיָון` | no line matched | [1072a · leaf 395](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$396/full/1400,/0/default.jpg) |

`, pl. of עֵינָא`. P00602 and P00618 spell `עֵינָוָון` (P00618: `Pl.
עֵינְוָותָא, עִינְוָתָא, עֵינָוָון`) and Sefaria links them to P00610
`עִינְוָון, v. sub ענ׳`, the next entry. P00609 stands between P00608
`עִינּוּג` and P00610 `עִינְוָון`, where `עינוון` sorts and `עיניון`
does not. Less sure than the others: P00618's list is the plural of
`ענוותא` (meekness), not of `עֵינָא`, so the cites may name P00610
correctly and witness only the spelling.

**Question.** Does print read `עֵינָוָון` (vav) where P00609 stores
`עֵינָיָון`?

- **P00609**
  - [ ] yes: `עֵינָוָון` (case 1; the name changes; the cites stay on P00610)
  - [ ] no: as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): the alphabet and the spelling agree; the
cites' meaning does not settle it.

### `צַוַּאר`: R00152 (stored `צַיַּאר`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [R00152](https://jastrow.app/#rid:R00152) | `צַיַּאר, צַוַּר, צַוְּרָא, צַוּו׳` | `IfvX, !>£» JS i'1-tj riS ch. same; mostly in pi.` | [1265b · leaf 588](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$589/full/1400,/0/default.jpg) |

`ch. same; mostly in pl. constr. צַוְּורֵי, צַוְּרֵי`, after R00151
`צַוָּאר` (neck). Every alternate has the vav, and R00176 reads `v.
צַוַּאר`, this entry's patah (Sefaria links it to R00151). It stands
between R00151 `צַוָּאר` and R00153 `צַוַּארְנוֹיָיתָא`, where `צואר`
sorts and `ציאר` does not.

**Question.** Does print read `צַוַּאר` (vav) where R00152 stores
`צַיַּאר`?

- **R00152**
  - [ ] yes: `צַוַּאר` (case 1; the name changes)
  - [ ] no: as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): `ch. same`, the alternates and the
alphabet agree.

### `צְוַוח`: R00171 (stored `צְיַוח`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [R00171](https://jastrow.app/#rid:R00171) | `צְיַוח, צְוַח` | `T^niXch. l)same. Targ. Gen. XXVII, 34. Targ.` | [1266b · leaf 589](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$590/full/1400,/0/default.jpg) |

`ch. 1) same` after R00170 `צָוַוח` (to cry, shout). Its alternate is
`צְוַח`, and three cites spell `צְוַוח` with this entry's sheva
(M00338, S01995, U00220), linked to R00170. It stands between R00170
`צָוַוח` and R00172 `צְוָוחָא`, where `צווח` sorts and `ציוח` does not.

**Question.** Does print read `צְוַוח` (vav) where R00171 stores
`צְיַוח`?

- **R00171**
  - [ ] yes: `צְוַוח` (case 1; the name changes, and the three cites move here)
  - [ ] no: as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): `ch. same`, the alternate, the cites and
the alphabet agree.

### `קַוָּא`: S00216 (stored `קַיָּא`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [S00216](https://jastrow.app/#rid:S00216) | `קַיָּא` | `fc^P ch. (preced., v. P. Sm. 3510; cmp. 6M3) [circle,` | [1323a · leaf 646](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$647/full/1400,/0/default.jpg) |

`ch. (preced., v. P. Sm. 3510; cmp. כַּוָּא) [circle, window,] web`,
after S00215 `קַו` (line). S00308 and S00878 (`pl. קֵיוָן, v. קַוָּא`)
spell `קַוָּא`, linked to S00217 `קוּא` (to spit). It stands between
`קַו` and `קוּא`, where `קוא` sorts and `קיא` does not. Its own plural
reads `קַיִּין`, likely the same slip.

**Question.** Does print read `קַוָּא` (vav) where S00216 stores
`קַיָּא`?

- **S00216**
  - [ ] yes: `קַוָּא` (case 1; the name changes, and the two cites move here)
  - [ ] no: as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: (and the plural `קַיִּין`?)

Recommendation: yes (high): `preced.` names `קַו`, and `cmp. כַּוָּא`,
the cites and the alphabet agree.

### `שַׁחְרֵר`: U00721 (stored `שַׁהְרֵר`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U00721](https://jastrow.app/#rid:U00721) | `שַׁהְרֵר` | no line matched | [1552a · leaf 875](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$876/full/1400,/0/default.jpg) |

`ch. same`, after U00720 `שִׁחֲרֵר` (to set free). U00000 lists
Shafel forms `שִׁחֲרֵר, שַׁחְרֵר, שִׁלְהֵב`: its `שַׁחְרֵר` is this
entry's pointing (Sefaria links it to U00720). It stands between
U00720 and U00722 `שְׁחַרְתָּא`, where `שחרר` sorts and `שהרר` does
not.

**Question.** Does print read `שַׁחְרֵר` (ḥet) where U00721 stores
`שַׁהְרֵר`?

- **U00721**
  - [ ] yes: `שַׁחְרֵר` (case 1; the name changes, and U00000's cite moves here)
  - [ ] no: as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): `ch. same`, the cite and the alphabet
agree.

### `שִׁלְהֵי`: U01223 (stored `שִׁלְחֵי`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01223](https://jastrow.app/#rid:U01223) | `שִׁלְחֵי, שִׁי׳` | `"•H JD, ntp m. pi. (used as sing.) (flbui) tail, end. Targ.` | [1578a · leaf 901](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$902/full/1400,/0/default.jpg) |

`m. pl. (used as sing.) (שְׁלָה) tail, end`: the root `שלה` has a he.
U00936 and U01215 (`denom. שִׁלְהֵי`) spell `שִׁלְהֵי`, linked to
U01224 `שַׁלְהֵי I` (to weary). It stands between U01222 `שִׁלְהֲוֵי`
and U01224 `שַׁלְהֵי I`, where `שלהי` sorts and `שלחי` does not.

**Question.** Does print read `שִׁלְהֵי` (he) where U01223 stores
`שִׁלְחֵי`?

- **U01223**
  - [ ] yes: `שִׁלְהֵי` (case 1; the name changes, and the two cites move here)
  - [ ] no: as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the root in its own etymology, the cites
and the alphabet agree.

### `עָמַד`: P00855, P00856, P00860 (stored `עָמַך`, `עֶמֶך`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P00855](https://jastrow.app/#rid:P00855) | `עָמַך I` | `1123? I=^X, to estimate. Y. Naz. IX, end, 58a; Y. Snh.` | [1086a · leaf 409](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$410/full/1400,/0/default.jpg) |
| [P00856](https://jastrow.app/#rid:P00856) | `עָמַך II` | no line matched | same |
| [P00860](https://jastrow.app/#rid:P00860) | `עֶמֶך, עָמָך, עֲמָדָה` | no line matched | [1086b · leaf 409](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$410/full/1400,/0/default.jpg) |

Already in [`sefaria-report.md`](sefaria-report.md) §1 (print `עָמַד
I`, `עָמַד II`, `עֶמֶד`), and in § Cross-reference numerals, block
`עָמַד II`, which sends the `ך` here. P00855 is `= אָמַד, to
estimate`; P00856 is `(b. h.) to stand`; P00860 is `f., v. עוּמָד`
with the alternate `עֲמָדָה`. Sixteen cites spell `עָמַד` and P00276
`עֶמֶד`; Sefaria links them to P00859 `עָמָד I` (dung). The two verbs
stand side by side, so each one's slip hides the other's from the
alphabet check (L72's recall gap); P00860 passes it.

**Question.** Does print read `ד` where these three store `ך`?

- **P00855, P00856**
  - [ ] yes: `עָמַד I`, `עָמַד II` (case 1; the names change)
  - [ ] no: as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 
- **P00860**
  - [ ] yes: `עֶמֶד, עָמָד` (case 1; the name changes)
  - [ ] no: as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes for all three (high): the sefaria-report's print
read, the glosses and the cites agree. Which of the 16 cites name the
verb, rather than P00859's noun, is the § Cross-reference numerals
question's to settle.

### `אַוְנָא`: A00718 (stored `אַיְנָא I`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A00718](https://jastrow.app/#rid:A00718) | `אַיְנָא I, אַוְונָא, אֲוָונָא` | `425, ron, ,חון a. has, (מעון [circle], night-lodging, station` | [28a · leaf 51](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$52/full/1400,/0/default.jpg) |
| [A00719](https://jastrow.app/#rid:A00719) | `אֲוָנָא II` | `NIN 11 NIN pr. n. pl. (v. foreg.) Avana, on the` | same |

`m. (v. foreg. ws.; cmp. גנן, חָנָה, חוּן, a. עוֹנָה, מָעוֹן) [circle],
night-lodging`, between A00717 `אוֹן` and A00719 `אֲוָנָא II` (Avana,
`v. foreg.`). Its alternates are `אַוְונָא, אֲוָונָא`; the I pairs it
with a `אונא` II; and A00749 (`cmp. אֲוָנָא`, linked here) spells it
with a vav. Under `אי` it would stand pages later.

**Question.** Does print read `אַוְנָא I` (vav) where A00718 stores
`אַיְנָא I`?

- **A00718**
  - [ ] yes: `אַוְנָא I` (case 1; the name changes)
  - [ ] no: as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): the numeral, the alternates and the
alphabet agree; no cite has this form's own pointing.

### `אֶישָּׁתָא`: A01632 (stored `אֶושָּׁתָא`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A01632](https://jastrow.app/#rid:A01632) | `אֶושָּׁתָא` | `NODS fire, +. wes.` | [61a · leaf 84](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$85/full/1400,/0/default.jpg) |

`fire, v. אֶשָּׁא`. The stored form sets a segol before a bare vav,
which no word does; its neighbours are A01631 `אִישַׁת` and A01633
`אֶישְׁתָּא` (six), where `אישתא` sorts and `אושתא` does not. No cite
names it: the cites that spelled `אִישְׁתָּא` are A01633's.

**Question.** Does print read `אֶישָּׁתָא` (yod) where A01632 stores
`אֶושָּׁתָא`?

- **A01632**
  - [ ] yes: `אֶישָּׁתָא` (case 1; the name changes)
  - [ ] no: print reads another spelling (say which in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): the pointing and the alphabet agree;
Jastrow's text has no cite of it.

### `גּוּד`: C00299 (stored `גּוּך`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C00299](https://jastrow.app/#rid:C00299) | `גּוּך` | `Voda, + 233. \| [2016]--.גָי (sec. r. of 38 1( to bind; denom. )1 גוד to form a. (גדוד (denom. of (2--[.גְּדזּד vis, fr. which` | [218a · leaf 241](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$242/full/1400,/0/default.jpg) |

`(sec. r. of אָגַד I) to bind; denom. גִּיד.—[Polel גּוֹדֵד, fr. which
גְּדוּד.]`, then `(denom. of גדוד) to form a faction`: a verb `גוד`.
The next entries are C00300 `גּוּד, forms of גדד a. נגד` and C00301
`*גּוֹד` (leather bag); five cites spell `גּוּד` (C00166, C00168,
C00170, C00304, C00626), linked to C00300. C00299 stands between
C00298 `גּוּגְמֵי` and C00300 `גּוּד`, where `גוד` sorts and `גוך`
does not.

**Question.** Does print read `גּוּד` (dalet) where C00299 stores
`גּוּך`?

- **C00299**
  - [ ] yes: `גּוּד` (case 1; the name changes; a numeral beside it or C00300 goes in the note)
  - [ ] no: as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (medium): the gloss names the root `גוד` and the
alphabet agrees; which of C00299 and C00300 the cites mean needs the
page.

### `גְּנַח II`: C01130 (stored `גְּנַה II`)

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C01130](https://jastrow.app/#rid:C01130) | `*גְּנַה II` | `LL to cut, pass swiftly, Torg, Pe, VIII, ® Ar.` | [259a · leaf 282](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$283/full/1400,/0/default.jpg) |

§ Cross-reference numerals, block `גְּנַח II`, asks whether C00538's
`v. גְּנַח II` names this entry and sends its `ה` here. It is numbered
II right after C01129 `גְּנַח I` (your 2026-10-06 note on its X8 row:
"1129 Already has I"); its own text reads `גנח prob. misread for
גוזז`; six cites spell `גְּנַח`. It stands between `גְּנַח I` and
C01131 `גני`, where `גנח` sorts and `גנה` does not.

**Question.** Does print read `גְּנַח II` (ḥet) where C01130 stores
`גְּנַה II`?

- **C01130**
  - [ ] yes: `גְּנַח II` (case 1; the name changes)
  - [ ] no: as stored (reviewed-kept)
  - [ ] can't tell from the scan
  - note: 

Recommendation: yes (high): the numeral, its own text, the cites and
the alphabet agree.

## Scan reads for L65–L66 (2026-10-16)

**Status:** 3 blocks wait on your ticks. Nothing is written until you
tick; a later data PR turns each answer that reads a word into a
reviewed `replace` (case 1 of ruling `10-13 correction policy`, no
annotation: the words are print's and the loss is Sefaria's). A
"kept", "no word" or "can't tell" tick writes no text patch: it is
recorded in the review ledger row (L65, L66). These are review ledger
L65 and L66, left by PR #182 (`leftovers-2026-10-16`): the hOCR saw
each word, but cannot read it well enough to write it, and a word is
never guessed.

They sit here rather than in `sense-worklist.md` because each is a
headword's spelling in the text around it: a cite's display of
M00725's headword (M02423), and the Biblical Hebrew word an etymology
paren names, the headword's own root (M00712, Q01198). None changes a
sense's shape.

Volume 2's hOCR is ABBYY, which keeps the Latin and reads Hebrew as
Latin glyphs, right to left: in `v. n<a II` (`v. מזה II`) the `a` is
`מ`, the `<` is `ז` or `ו`, and the `n` is `ה`. Tick ONE box per
bullet, a note only where a box asks for one; each `Recommendation:`
names the box it would tick.

| rid | stored | hOCR | question | recommendation |
|---|---|---|---|---|
| M02423 | `v. מַוֶּה II` (cite to M00725) | `v. n<a II.` | vav or zayin | zayin (medium) |
| M00712 | `(denom. of מֶזֶג; b. h.) to mix` | `(denom. of Ma; b. h. T^a) to mix` | the dropped word before `)` | `מזג` (medium) |
| Q01198 | `c. pl. (b. h.;) front, face` | `(b.h.; ftyz) front, face` | the dropped word before `)` | `פנה` (medium) |

### `מַזֶּה II` in M02423's cite (L65)

| rid | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| [M02423](https://jastrow.app/#rid:M02423) | `… they are as unfit for lustration as wood-ashes. Ber. 28ᵃ, a. e., v. מַוֶּה II.` | `as  wood-ashes.  Ber.  28a,  a.  e.,  v.  n<a  II.` | [831a · leaf 154](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$155/full/1400,/0/default.jpg) |

P000817 (PR #182) re-aimed this cite at M00725 `מַזֶּה II`, the priest
who sprinkles, whose own text cites the same `Ber. 28a`; the link is
right. Its display still reads `מַוֶּה` with a vav, where the entry it
names has a zayin. The same vav-for-zayin OCR glyph was on M00724's
headword (`מַוֶּה I`), which P000359 corrected to `מַזֶּה I`. M02173's
cite to the same entry already reads `מַזֶּה II`. The hOCR's `<`
cannot tell the two letters apart.

**Question.** Does print read `מַזֶּה II` (zayin) in M02423's last
cite?

- **M02423**
  - [ ] `מַזֶּה` (zayin): the cite's display is respelled (case 1)
  - [ ] `מַוֶּה` (vav), as stored: kept
  - [ ] can't tell from the scan
  - note: 

Recommendation: `מַזֶּה` (zayin), medium: the entry it names, its
sibling `מַזֶּה I` and M02173's cite all have the zayin, and the vav is
the OCR glyph P000359 already fixed once; only the scan can show it.

### The word before M00712's `)` (L66)

| rid | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| [M00712](https://jastrow.app/#rid:M00712) | `(denom. of מֶזֶג; b. h.) to mix wine with water, spices &c.; to temper; …` | `AVD  (denom.  of  Ma;  b.  h.  T^a)  to  mix  icine  icith  xcater,` | [752b · leaf 75](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$76/full/1400,/0/default.jpg) |

Sefaria dropped a Hebrew word and the `)` after `b. h.`; P000818
(PR #182) put the `)` back, so the lettered run splits as print divides
it, and left the word out. The hOCR sets three glyphs there, `T^a`,
which read right to left as `מ`, `ז`, `ג`: the verb's own root, as
the paren reads "denominative of `מֶזֶג`; Biblical Hebrew `מזג`". Whether
print points it, and how, the hOCR cannot say.

**Question.** What word does print set between `b. h.` and `)` in
M00712's head?

- **M00712**
  - [ ] print reads `מזג` (unpointed)
  - [ ] print reads something else (write it in the note, pointing included)
  - [ ] no word there
  - [ ] can't tell from the scan
  - note: 

Recommendation: print reads `מזג`, medium: three glyphs sit there on
the hOCR and they read as the headword's consonants, the Biblical
Hebrew word `b. h.` names; the pointing, if any, needs the scan.

### The word before Q01198's `)` (L66)

| rid | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| [Q01198](https://jastrow.app/#rid:Q01198) | `c. pl. (b. h.;) front, face; countenance, person. Pesik. Baḥod., …` | `D  mile. pi. (b.h.;  ftyz)  front,  face; countenance, person.` | [1189a · leaf 512](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$513/full/1400,/0/default.jpg) |

As in M00712, Sefaria dropped the word and the `)`, and P000819
(PR #182) restored only the `)`. The hOCR reads `ftyz` after `b.h.;`,
four glyphs where `פנה`, the root of `פָּנִים`, has three letters, so a
glyph may be split or the word may be longer (`פנים`, `פנה`, pointed or
not).

**Question.** What word does print set between `(b. h.;` and `)` in
Q01198's head?

- **Q01198**
  - [ ] print reads `פנה`
  - [ ] print reads something else (write it in the note, pointing included)
  - [ ] no word there
  - [ ] can't tell from the scan
  - note: 

Recommendation: print reads `פנה`, medium: Jastrow names the root
after `b. h.;` (`(b. h.; נָטַע) plantation`, M01035), and `פנה` is
`פָּנִים`'s; the hOCR's four glyphs leave the length open, so this one
needs the scan most.

## X11: one-letter primaries (2026-10-15)

The headword report's X11 shape (review ledger L39) names a primary of
one consonant past its letter's opening entries: no word print sets,
but a line Sefaria split at a vowel, as it split U00489's `שׁוּף`
(rejoined in #179). Each is a name defect: the entry's URL name is
the one letter. Two rows, both read on the scan 2026-10-15.

### `חָ, רַ, ת`: H01792

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H01792](https://jastrow.app/#rid:H01792) | `חָ`, `רַ`, `ת` | `DM conjempsir)toengrave. Part past Pere` | [507b · leaf 530](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$531/full/1400,/0/default.jpg) |

Print sets one word, `חָרַת`, then `(b. h.; cmp. חָרַשׁ) to engrave`.

**Question.** Is the headword `חָרַת`, one form?

- **H01792**
  - [ ] yes: rejoin the three forms as `חָרַת` (a reviewed patch, as #179 rejoined U00489)
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: rejoin as `חָרַת` (high): the scan sets one word, and the three stored pieces concatenate to it with no letter added or lost.

### `תִּ, כְבּוֹסֶת`: V00524

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [V00524](https://jastrow.app/#rid:V00524) | `תִּ`, `כְבּוֹסֶת` | `nD"QD?l f. (033) washing (clothes). Ex. R. s. 23 "pX` | [1667b · leaf 990](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$991/full/1400,/0/default.jpg) |

Print sets one word, `תִּכְבּוֹסֶת`, then `f. (כָּבַס) washing (clothes)`.

**Question.** Is the headword `תִּכְבּוֹסֶת`, one form?

- **V00524**
  - [ ] yes: rejoin the two forms as `תִּכְבּוֹסֶת` (a reviewed patch)
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: rejoin as `תִּכְבּוֹסֶת` (high): the scan sets one word, and the two stored pieces concatenate to it with no letter added or lost.

## Textual-research candidates (for #153)

**To do (no ticks):** paste the 18 new rows below, the 17 X8 rows and C00773, into #153 or into the separate issue A00312's note asks for, then say so.


Your notes asked for these rows to go to a textual-research issue
(review ledger L47). Nothing here was posted. The five X9 rows are
already in [#153](https://github.com/UniquePixels/jastrow/issues/153)
and are listed for reference only; the X8 rows and C00773 are new,
written so you can paste them into #153 yourself, or into the
separate issue A00312's note asks for. Your notes are quoted as
written. The scan is the leaf the row's question
linked.

### X9: no mark in print (5, already in #153)

You answered "print has no mark there" on each: two spellings of one
numbered sequence that print points apart.

| rid | headword | your note | scan |
|---|---|---|---|
| [A01420](https://jastrow.app/#rid:A01420) | `אִיסְטְוָוא` II (I is A01419 `אִיסטְוָוא`) | "This is likely a textual error but would require extensive research. I would love an issue oppened on it, as I think it is a fascinating question." | [leaf 77](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$78/full/1400,/0/default.jpg) |
| [E00802](https://jastrow.app/#rid:E00802) | `הֲקָצָה` II (I is E00801 `הֲקָצה`) | "Another likley textual issue, add with other, fascinating I say....." | [leaf 387](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$388/full/1400,/0/default.jpg) |
| [E00837](https://jastrow.app/#rid:E00837) | `הרְהוּן` II (I is E00836 `הִרְהוּן`) | "another to add to that textual issues research issue" | [leaf 389](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$390/full/1400,/0/default.jpg) |
| [I00057](https://jastrow.app/#rid:I00057) | `טְבִיעָה` II (I is I00056 `טְבִיעה`) | "textual issue research" | [leaf 540](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$541/full/1400,/0/default.jpg) |
| [P00959](https://jastrow.app/#rid:P00959) | `עֲנָוָה` II (I is P00958 `ענָוָה`) | "textual issue research" | [leaf 415](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$416/full/1400,/0/default.jpg) |

### X8: a missing numeral print does not set (17)

You answered "no numeral beside it" or "the gap is Jastrow's own" on
each but C00610, where you answered that print sets I beside C00609
`גִּיב`. Under ruling 10-13 the bare form stays bare unless Jastrow's own
text names it `X I`. A00312's note asks for these in a different
issue from the X9 five.

| rid | headword | your note | scan |
|---|---|---|---|
| [A00312](https://jastrow.app/#rid:A00312) | `אַגְמָא` II; A00311 bare | "Legit missing, lets put ones like this in a differnt textual issues research issue." | [leaf 36](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$37/full/1400,/0/default.jpg) |
| [A00890](https://jastrow.app/#rid:A00890) | `אוֹרְיָין` II; A00889 bare | "add to textual research issue" | [leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| [A02042](https://jastrow.app/#rid:A02042) | `אֲמָנָה` II; A02041 bare | "add to resarch issue" | [leaf 101](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$102/full/1400,/0/default.jpg) |
| [B00382](https://jastrow.app/#rid:B00382) | `בּוּרְסִי` II, and B00383 `בּוּרְסִי` II²; no I | "add to issue, likely a textual mistake" | [leaf 173](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$174/full/1400,/0/default.jpg) |
| [B00538](https://jastrow.app/#rid:B00538) | `בִּיאָה` II; B00537/alt bare | "add to issue" | [leaf 182](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$183/full/1400,/0/default.jpg) |
| [B00936](https://jastrow.app/#rid:B00936) | `בַּנַּאי` II; B00935 bare | "add to research issue" | [leaf 199](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$200/full/1400,/0/default.jpg) |
| [C00177](https://jastrow.app/#rid:C00177) | `גְּדוּדִית` II; C00176 bare | "add to issue" | [leaf 233](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$234/full/1400,/0/default.jpg) |
| [C00610](https://jastrow.app/#rid:C00610) | `גִּיב` II; C00609, which print numbers I | "add to issue" | [leaf 257](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$258/full/1400,/0/default.jpg) |
| [D00443](https://jastrow.app/#rid:D00443) | `דִּי` II; D00442 bare | "add to issue" | [leaf 316](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$317/full/1400,/0/default.jpg) |
| [E00114](https://jastrow.app/#rid:E00114) | `הֲדָיָא` II; no I | "add to issue" | [leaf 356](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$357/full/1400,/0/default.jpg) |
| [H00433](https://jastrow.app/#rid:H00433) | `חוּצָה` II; H00432 bare | "add to issue" | [leaf 461](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$462/full/1400,/0/default.jpg) |
| [H01222](https://jastrow.app/#rid:H01222) | `חֲמַר` III; no I, II on `חֲמַר` | "add to issue" | [leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |
| [J00113](https://jastrow.app/#rid:J00113) | `יָהּ` II; J00112 bare | "add to issue" | [leaf 588](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$589/full/1400,/0/default.jpg) |
| [O00995](https://jastrow.app/#rid:O00995) | `סְלִיקוּסְתָּא` II; O00994 bare | "add to issue" | [leaf 318](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$319/full/1400,/0/default.jpg) |
| [Q00965](https://jastrow.app/#rid:Q00965) | `פְּלוּגְתָּא` II; Q00964 bare | "add to issue" | [leaf 500](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$501/full/1400,/0/default.jpg) |
| [Q01399](https://jastrow.app/#rid:Q01399) | `פַּפָּא` II; Q01398 bare | "add to issue" | [leaf 526](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$527/full/1400,/0/default.jpg) |
| [S00337](https://jastrow.app/#rid:S00337) | `קוּלְיָא` II; S00336 bare | "add to issue" | [leaf 651](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$652/full/1400,/0/default.jpg) |

### Round 2: `גִּיס` (1)

C00772 `גֵּיס` is bare before C00773 `גִּיס` II and C00774 `גִּיס` II.
C00707 and C00710 name C00773 II, while C00841 `(v. גִּיס I) familiar`
and K00444 call the familiar word I, which print numbers II. Kept bare
in PR #177.

| rid | headword | your note | scan |
|---|---|---|---|
| [C00773](https://jastrow.app/#rid:C00773) | `גִּיס` II, `גָּיֵיס` | "To much ambuiguity here honestly. So no implied anything, and maybe an issue to dig in on." | [leaf 263](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$264/full/1400,/0/default.jpg) |
