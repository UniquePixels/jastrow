# Headword worklist: the primary rows before go-live

An entry's URL name is computed from `headwords[0]` at read time
(`admin/entry/names.ts`), Roman numeral and superscript included. A
fix to a primary headword after go-live changes a published name, and
U6 then requires a permanent redirect through the `formerNames` ledger
that does not exist yet (review ledger L23). So a primary-headword
defect is cheapest fixed now. Everything else can wait for the admin
tool.

`docs/reports/headword-issues.md` lists 382 rows whose role is
`headword` (H6 6, X1 2, X5 115, X7 123, X8 136). Most are settled by
rulings already in [`decisions.md`](decisions.md). This file sorts
them so only the rows that truly need the print are left for you, with
the print evidence beside each one. Nothing here changes entry data.

## Summary

| Pile | Rows | What it means | Who acts |
|---|---|---|---|
| C | 79 | The evidence is ambiguous or the hOCR is too noisy. One print read each | You tick a box per question; Claude writes the patches |
| B | 11 | The fix is determinable: the hOCR shows a numeral Sefaria dropped | You tick a box per row below; Claude writes the patch |
| A | 288 | A ruling keeps the shape as printed, or the hOCR confirms the stored numbering | Nobody |
| D | 4 | Not a name problem: no fix would change a URL name | Nobody now |

| Shape | Rows | A | B | C | D |
|---|---|---|---|---|---|
| H6 multi-word | 6 | 6 | 0 | 0 | 0 |
| X1 leading mark | 2 | 2 | 0 | 0 | 0 |
| X5 maqaf | 115 | 113 | 0 | 2 | 0 |
| X7 abbreviation | 123 | 123 | 0 | 0 | 0 |
| X8 numbering gap | 136 | 44 | 11 | 77 | 4 |
| **Total** | **382** | **288** | **11** | **79** | **4** |

X8 is worked per family: each X8 row is one family of entries spelled
alike, and its fix often lands on a sibling rid, not the row's own.

Outside the 382: U00489's primary is the single letter `ש`, a name
defect the report flags only on its alternate. It is in
[the five X1 and #113 rids](#the-five-x1-and-113-rids) below, in pile C.

## Pile C: needs your print read (79)

Each row names the scan leaf; the page link opens the Internet Archive image. The hOCR column is the OCR of that print line, copied as it is. Volume 1 (pages 1–676) is Tesseract and garbles Hebrew; volume 2 (677–1704) is ABBYY, which turns Hebrew into Latin noise but reads Roman numerals well. Under each question are answer boxes. Open the scan link, tick ONE box (change `[ ]` to `[x]`), and add a note only if a box asks for one or you saw something else. You never need to type Hebrew: describe it in words ("hataf patah under the alef") and Claude builds the spelling and shows it back to you. Skip any question you like; unticked questions simply stay open. When you stop, tell Claude: it reads the ticks, writes the reviewed patches, re-imports, and opens a PR that shows every change for you to approve. You write no patch and use no tool.

### X5 maqaf rows that are not prefixes (2)

| | rid | stored | hOCR, verbatim | scan | question |
|---|---|---|---|---|---|
| | [D00616](https://jastrow.app/#rid:D00616) | `דימונ־ק־` | `“OI, +. יניק` | [300a · leaf 323](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$324/full/1400,/0/default.jpg) | Is the headword printed `דימונ־ק־` (two maqafs), or another notation such as `דימונ׳ק׳`? The hOCR line is illegible. |
| | [S01339](https://jastrow.app/#rid:S01339) | `קְלִיסְטַנְרִ־` | `"""DUQD'Op m.(corrupt.ofquestionarius)ea-ec!^tOMer.` | [1375b · leaf 698](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$699/full/1400,/0/default.jpg) | A noun (`m.`) ending in a maqaf. Does print end the word in a maqaf or a letter (yod)? The page index puts it on 1376b; the hOCR line is on 1375b. |

**Your answers** (tick one per row):

- **D00616**: stored `דימונ־ק־`
  - [ ] print has it as stored
  - [ ] print has something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **S01339**: stored `קְלִיסְטַנְרִ־`
  - [ ] print has it as stored
  - [ ] print has something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


### X8 Pointing: is one stored spelling a slip? (29)

The missing numeral sits on a neighbour whose pointing differs from this family's by one mark, or by a vowel. Either the print spells the two differently (then the gap is real) or one stored headword has a slip (then its name changes). No vowel is inferred here; the print decides.

#### `אֲגוֹרָא`: missing I (row [A00279](https://jastrow.app/#rid:A00279))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A00278](https://jastrow.app/#rid:A00278) | `אֱגוֹרָא I` | `NTUN 1 אִיגורָא ch. same; esp. heathen altar` | [12a · leaf 35](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$36/full/1400,/0/default.jpg) |
| [A00279](https://jastrow.app/#rid:A00279) | `אֲגוֹרָא II` | `אִגורָא II £.(ay0p4) market-place, court-session, court.` | [12a · leaf 35](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$36/full/1400,/0/default.jpg) |

**Question.** A00278 holds the I as `אֱגוֹרָא`; this family is `אֲגוֹרָא`. They differ only in א: hataf segol vs hataf patah (A00278 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `אֱגוֹרָא` (the way A00278 has it)
  - [ ] print spells both as `אֲגוֹרָא` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `אִילְפָא`: missing I (row [A01311](https://jastrow.app/#rid:A01311))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A01310](https://jastrow.app/#rid:A01310) | `אִילפָא I` | `NONI, NDON +. ,אלף) FD"; Assyr. élippu) ship,` | [50a · leaf 73](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$74/full/1400,/0/default.jpg) |
| [A01311](https://jastrow.app/#rid:A01311) | `אִילְפָא II` | `אילפא. 11 pr. .ם .גת Ifa, an Amora,` | [50a · leaf 73](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$74/full/1400,/0/default.jpg) |

**Question.** A01310 holds the I as `אִילפָא`; this family is `אִילְפָא`. They differ only in ל: no mark vs sheva (A01310 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `אִילפָא` (the way A01310 has it)
  - [ ] print spells both as `אִילְפָא` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `אִימָּא`: missing I (row [A01320](https://jastrow.app/#rid:A01320))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A01319](https://jastrow.app/#rid:A01319) | `אימָּא I` | `אמא 1 distaff, +. max 1.` | [50a · leaf 73](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$74/full/1400,/0/default.jpg) |
| [A01320](https://jastrow.app/#rid:A01320) | `אִימָּא II` | `1אימא ,אמא TIN f. ch. (=h. 58) 1)` | [50a · leaf 73](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$74/full/1400,/0/default.jpg) |
| [A01321](https://jastrow.app/#rid:A01321) | `אִימָּא III` | `NON III pr. n. f. [or title; cmp.` | [50b · leaf 73](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$74/full/1400,/0/default.jpg) |

**Question.** A01319 holds the I as `אימָּא`; this family is `אִימָּא`. They differ only in א: no mark vs hiriq (A01319 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `אימָּא` (the way A01319 has it)
  - [ ] print spells both as `אִימָּא` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `אִיסְטְוָוא`: missing I (row [A01420](https://jastrow.app/#rid:A01420))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A01411](https://jastrow.app/#rid:A01411) | alt `אִיסְטְוָוא` (of `אִיסְטְבָא`) | not found in the hOCR | [54a · leaf 77](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$78/full/1400,/0/default.jpg) |
| [A01419](https://jastrow.app/#rid:A01419) | `אִיסטְוָוא I` | not found in the hOCR | [54b · leaf 77](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$78/full/1400,/0/default.jpg) |
| [A01420](https://jastrow.app/#rid:A01420) | `אִיסְטְוָוא II` | `איסטווא Il, ‘ON (m.?) (Isp. noun of סול` | [54b · leaf 77](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$78/full/1400,/0/default.jpg) |

**Question.** A01419 holds the I as `אִיסטְוָוא`; this family is `אִיסְטְוָוא`. They differ only in ס: no mark vs sheva (A01419 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `אִיסטְוָוא` (the way A01419 has it)
  - [ ] print spells both as `אִיסְטְוָוא` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `אֲמָא`: missing I (row [A01965](https://jastrow.app/#rid:A01965))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A01964](https://jastrow.app/#rid:A01964) | `אְמָא I` | `אמא 1 NON +. pox. Targ. 0. 604,111,` | [74a · leaf 97](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$98/full/1400,/0/default.jpg) |
| [A01965](https://jastrow.app/#rid:A01965) | `אֲמָא II` | `NONIL Vas, fut. ,רימא imper. NDR ( 1/28` | [74a · leaf 97](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$98/full/1400,/0/default.jpg) |

**Question.** A01964 holds the I as `אְמָא`; this family is `אֲמָא`. They differ only in א: sheva vs hataf patah (A01964 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `אְמָא` (the way A01964 has it)
  - [ ] print spells both as `אֲמָא` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `גִּיהָא`: missing I (row [C00650](https://jastrow.app/#rid:C00650))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C00649](https://jastrow.app/#rid:C00649) | `גִּיהא I` | not found in the hOCR | [235b · leaf 258](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$259/full/1400,/0/default.jpg) |
| [C00650](https://jastrow.app/#rid:C00650) | `גִּיהָא II` | not found in the hOCR | [235b · leaf 258](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$259/full/1400,/0/default.jpg) |

**Question.** C00649 holds the I as `גִּיהא`; this family is `גִּיהָא`. They differ only in ה: no mark vs qamets (C00649 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `גִּיהא` (the way C00649 has it)
  - [ ] print spells both as `גִּיהָא` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `דִּיוֹ`: missing I (row [D00501](https://jastrow.app/#rid:D00501))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [D00500](https://jastrow.app/#rid:D00500) | `דְּיוֹ I` | `דיר 1 5 .₪) he; 5) fluid, writing` | [296a · leaf 319](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$320/full/1400,/0/default.jpg) |
| [D00501](https://jastrow.app/#rid:D00501) | `דִּיוֹ II` | `דייר 11 (ét-) two, double, a Greek prefix,` | [296a · leaf 319](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$320/full/1400,/0/default.jpg) |

**Question.** D00500 holds the I as `דְּיוֹ`; this family is `דִּיוֹ`. They differ only in ד: sheva+dagesh vs hiriq+dagesh (D00500 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `דְּיוֹ` (the way D00500 has it)
  - [ ] print spells both as `דִּיוֹ` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `הֲקָצָה`: missing I (row [E00802](https://jastrow.app/#rid:E00802))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [E00801](https://jastrow.app/#rid:E00801) | `הֲקָצה I` | `ASP If. (y"P) waking up. Midr. Till. to` | [364b · leaf 387](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$388/full/1400,/0/default.jpg) |
| [E00802](https://jastrow.app/#rid:E00802) | `הֲקָצָה II` | `הקצה 11 .+ ,קוץ) (קצץ cutting, שפתים- הצת` | [364b · leaf 387](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$388/full/1400,/0/default.jpg) |

**Question.** E00801 holds the I as `הֲקָצה`; this family is `הֲקָצָה`. They differ only in צ: no mark vs qamets (E00801 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `הֲקָצה` (the way E00801 has it)
  - [ ] print spells both as `הֲקָצָה` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `הרְהוּן`: missing I (row [E00837](https://jastrow.app/#rid:E00837))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [E00836](https://jastrow.app/#rid:E00836) | `הִרְהוּן I` | not found in the hOCR | [366a · leaf 389](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$390/full/1400,/0/default.jpg) |
| [E00837](https://jastrow.app/#rid:E00837) | `הרְהוּן II` | `הרתון IT m. wrin-soaked dung, v. ההון a.` | [366a · leaf 389](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$390/full/1400,/0/default.jpg) |

**Question.** E00836 holds the I as `הִרְהוּן`; this family is `הרְהוּן`. They differ only in ה: hiriq vs no mark (E00836 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `הִרְהוּן` (the way E00836 has it)
  - [ ] print spells both as `הרְהוּן` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `חֲבִילָא`: missing I (row [H00067](https://jastrow.app/#rid:H00067))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00066](https://jastrow.app/#rid:H00066) | `חֲבִילא I` | not found in the hOCR | [419a · leaf 442](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$443/full/1400,/0/default.jpg) |
| [H00067](https://jastrow.app/#rid:H00067) | `חֲבִילָא II` | `two nations) is severed —Pl. pian. Lev. BR.` | [419a · leaf 442](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$443/full/1400,/0/default.jpg) |

**Question.** H00066 holds the I as `חֲבִילא`; this family is `חֲבִילָא`. They differ only in ל: no mark vs qamets (H00066 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `חֲבִילא` (the way H00066 has it)
  - [ ] print spells both as `חֲבִילָא` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `חַיְּיתָא`: missing I, II (row [H00749](https://jastrow.app/#rid:H00749))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00747](https://jastrow.app/#rid:H00747) | `חַיְיתָא I` | `7 1, NENT 1 (adj), v. .חר —2)` | [455a · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |
| [H00748](https://jastrow.app/#rid:H00748) | `חַיְיתָא II` | `Targ. 0. Gen. 1, 28. Ib. 30 rom` | [455a · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |
| [H00749](https://jastrow.app/#rid:H00749) | `חַיְּיתָא III` | `הייפא LTT, היסא + ₪ א ;יח rary,` | [455b · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |
| [H00750](https://jastrow.app/#rid:H00750) | `חַיְּיתָא` | `,חויתא התא 1 .₪ ,חות) 6 נָחַת .₪` | [455b · leaf 478](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$479/full/1400,/0/default.jpg) |

**Question.** H00747 holds the I as `חַיְיתָא`; this family is `חַיְּיתָא`. They differ only in י: sheva vs sheva+dagesh (H00747 first). H00748 holds the II as `חַיְיתָא`; this family is `חַיְּיתָא`. They differ only in י: sheva vs sheva+dagesh (H00748 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I, II. Note the unnumbered H00750 too.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `חַיְיתָא` (the way H00747 has it)
  - [ ] print spells both as `חַיְּיתָא` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `חֲלָמָה`: missing I (row [H01089](https://jastrow.app/#rid:H01089))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H01088](https://jastrow.app/#rid:H01088) | alt `חְלָמָה I` (of `חֲלָמָא`) | `Set (FIRST T) +. cates 1) 5 sort` | [471a · leaf 494](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$495/full/1400,/0/default.jpg) |
| [H01089](https://jastrow.app/#rid:H01089) | `חֲלָמָה II` | not found in the hOCR | [471a · leaf 494](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$495/full/1400,/0/default.jpg) |

**Question.** H01088 holds the I as `חְלָמָה`; this family is `חֲלָמָה`. They differ only in ח: sheva vs hataf patah (H01088 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `חְלָמָה` (the way H01088 has it)
  - [ ] print spells both as `חֲלָמָה` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `חָרֵב`: missing I (row [H01579](https://jastrow.app/#rid:H01579))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H01577](https://jastrow.app/#rid:H01577) | `חָרִב I` | `an I (b. h.) to be burned, dried` | [498a · leaf 521](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$522/full/1400,/0/default.jpg) |
| [H01579](https://jastrow.app/#rid:H01579) | `חָרֵב II` | `חרב 11 ,ו nn, an f. (b. h.;` | [498a · leaf 521](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$522/full/1400,/0/default.jpg) |
| [H01580](https://jastrow.app/#rid:H01580) | `חָרֵב` | not found in the hOCR | [498a · leaf 521](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$522/full/1400,/0/default.jpg) |

**Question.** H01577 holds the I as `חָרִב`; this family is `חָרֵב`. They differ only in ר: hiriq vs tsere (H01577 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I. Note the unnumbered H01580 too.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `חָרִב` (the way H01577 has it)
  - [ ] print spells both as `חָרֵב` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `טְבִיעָה`: missing I (row [I00057](https://jastrow.app/#rid:I00057))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [I00056](https://jastrow.app/#rid:I00056) | `טְבִיעה I` | `‘on מן ‘Tee שהסרתל whom 1 saved from` | [517a · leaf 540](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$541/full/1400,/0/default.jpg) |
| [I00057](https://jastrow.app/#rid:I00057) | `טְבִיעָה II` | not found in the hOCR | [517a · leaf 540](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$541/full/1400,/0/default.jpg) |

**Question.** I00056 holds the I as `טְבִיעה`; this family is `טְבִיעָה`. They differ only in ע: no mark vs qamets (I00056 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `טְבִיעה` (the way I00056 has it)
  - [ ] print spells both as `טְבִיעָה` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `מַעֲצַרְתָּא`: missing I (row [M02162](https://jastrow.app/#rid:M02162))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [M02161](https://jastrow.app/#rid:M02161) | `מַעְצַרְתָּא` | `fctFH^iC, '2912 I f. (preced.) press-room (=h. rTtS` | [818b · leaf 141](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$142/full/1400,/0/default.jpg) |
| [M02162](https://jastrow.app/#rid:M02162) | `מַעֲצַרְתָּא II` | `STm^Q II f- (isr; cmp. rrow, KFnssi) meeting` | [819a · leaf 142](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$143/full/1400,/0/default.jpg) |

**Question.** M02161 is numbered I through its abbreviation `מַעֲצַ׳ I` (HW-roman), and the hOCR reads `I` on its line; its primary is stored `מַעְצַרְתָּא` (sheva under the ayin) while this family is `מַעֲצַרְתָּא` (hataf patah). Does print spell the two alike? If yes, one stored headword has a slip and its name changes; the numbering is complete either way.

  - [ ] nothing to fix: the gap is Jastrow's own
  - [ ] there is a fix (say what print shows in the note)
  - [ ] can't tell from the scan
  - note: 


#### `מָצַר`: missing I (row [M02354](https://jastrow.app/#rid:M02354))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [M02352](https://jastrow.app/#rid:M02352) | `מָצַּר I` | `IIEIZ I (sec. r. of -ns) to twist,` | [827b · leaf 150](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$151/full/1400,/0/default.jpg) |
| [M02354](https://jastrow.app/#rid:M02354) | `מָצַר II` | `"I22S H (denom. of nsa) to rfe/?7»« the` | [827b · leaf 150](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$151/full/1400,/0/default.jpg) |

**Question.** M02352 holds the I as `מָצַּר`; this family is `מָצַר`. They differ only in צ: patah+dagesh vs patah (M02352 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `מָצַּר` (the way M02352 has it)
  - [ ] print spells both as `מָצַר` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `מְרוּצָה`: missing I (row [M02602](https://jastrow.app/#rid:M02602))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [M02601](https://jastrow.app/#rid:M02601) | `מרוּצָה I` | `M^ID I f. (b. h. ; y!Ti) running.` | [839a · leaf 162](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$163/full/1400,/0/default.jpg) |
| [M02602](https://jastrow.app/#rid:M02602) | `מְרוּצָה II` | `n^lQ"II f. (b.h.; yin) oppression, arrogance. Ruth` | [839b · leaf 162](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$163/full/1400,/0/default.jpg) |

**Question.** M02601 holds the I as `מרוּצָה`; this family is `מְרוּצָה`. They differ only in מ: no mark vs sheva (M02601 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `מרוּצָה` (the way M02601 has it)
  - [ ] print spells both as `מְרוּצָה` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `מַרְעִיתָא`: missing I (row [M02740](https://jastrow.app/#rid:M02740))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [M02739](https://jastrow.app/#rid:M02739) | alt `מַרְעֵיתָא I` (of `מַרְעִית II`) | `rP^"]D IT, Sn"^l2 If. = xnria, evil &c.` | [845b · leaf 168](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$169/full/1400,/0/default.jpg) |
| [M02740](https://jastrow.app/#rid:M02740) | `מַרְעִיתָא II` | `Sri'*?T3 II f. ch.=h. nr-.a. Targ. I Chr.` | [845b · leaf 168](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$169/full/1400,/0/default.jpg) |

**Question.** M02739 holds the I as `מַרְעֵיתָא`; this family is `מַרְעִיתָא`. They differ only in ע: tsere vs hiriq (M02739 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `מַרְעֵיתָא` (the way M02739 has it)
  - [ ] print spells both as `מַרְעִיתָא` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `נְהִי`: missing I (row [N00260](https://jastrow.app/#rid:N00260))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [N00259](https://jastrow.app/#rid:N00259) | `נְהֵי I` | `Ithpe. "W«J to follow eagerly. Targ. I Sam.` | [881b · leaf 204](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$205/full/1400,/0/default.jpg) |
| [N00260](https://jastrow.app/#rid:N00260) | `נְהִי II` | `"TI3 II m. (b.h.; v. preced.) commotion; lamentation,` | [881b · leaf 204](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$205/full/1400,/0/default.jpg) |
| [N00261](https://jastrow.app/#rid:N00261) | alt `נְהִי II` (of `נְהֵי`) | `"113 or *T\j II (="lin3; v. \in) let` | [881b · leaf 204](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$205/full/1400,/0/default.jpg) |

**Question.** N00259 holds the I as `נְהֵי`; this family is `נְהִי`. They differ only in ה: tsere vs hiriq (N00259 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `נְהֵי` (the way N00259 has it)
  - [ ] print spells both as `נְהִי` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `נָקִי`: missing I (row [N01196](https://jastrow.app/#rid:N01196))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [N01195](https://jastrow.app/#rid:N01195) | `נָּקִי I` | `"pJ I m. (b.h.; preced.) clean, clear; bare.` | [932b · leaf 255](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$256/full/1400,/0/default.jpg) |
| [N01196](https://jastrow.app/#rid:N01196) | `נָקִי II` | `"'pO II m. (preced.) a young lamb (v.` | [932b · leaf 255](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$256/full/1400,/0/default.jpg) |

**Question.** N01195 holds the I as `נָּקִי`; this family is `נָקִי`. They differ only in נ: qamets+dagesh vs qamets (N01195 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `נָּקִי` (the way N01195 has it)
  - [ ] print spells both as `נָקִי` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `עוּזָּא`: missing I (row [P00219](https://jastrow.app/#rid:P00219))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P00218](https://jastrow.app/#rid:P00218) | `עִוּזָּא I` | `Sll!? I, Sl> m. (cmp. preced.) name of` | [1049a · leaf 372](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$373/full/1400,/0/default.jpg) |
| [P00219](https://jastrow.app/#rid:P00219) | `עוּזָּא II` | `#V\V II, nvi'J, 'l" (b. h.) pr. n.` | [1049a · leaf 372](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$373/full/1400,/0/default.jpg) |

**Question.** P00218 holds the I as `עִוּזָּא`; this family is `עוּזָּא`. They differ only in ע: hiriq vs no mark (P00218 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `עִוּזָּא` (the way P00218 has it)
  - [ ] print spells both as `עוּזָּא` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `עֲטַר`: missing II (row [P00476](https://jastrow.app/#rid:P00476))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P00476](https://jastrow.app/#rid:P00476) | `עֲטַר I` | `"TE25 I same. Targ. Ps. LXXIII, 6 '31` | [1064b · leaf 387](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$388/full/1400,/0/default.jpg) |
| [P00477](https://jastrow.app/#rid:P00477) | `עַטַר II` | `Pa. "OB to abolish entirely. Targ. II Chr.` | [1065a · leaf 388](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$389/full/1400,/0/default.jpg) |
| [P00478](https://jastrow.app/#rid:P00478) | `עֲטַר III` | `~l"^3? III (preced. wds., cmp. lap) [to whirl` | [1065a · leaf 388](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$389/full/1400,/0/default.jpg) |

**Question.** P00477 holds the II as `עַטַר`; this family is `עֲטַר`. They differ only in ע: patah vs hataf patah (P00477 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the II.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `עַטַר` (the way P00477 has it)
  - [ ] print spells both as `עֲטַר` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `עַטַר`: missing I (row [P00477](https://jastrow.app/#rid:P00477))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P00476](https://jastrow.app/#rid:P00476) | `עֲטַר I` | `"TE25 I same. Targ. Ps. LXXIII, 6 '31` | [1064b · leaf 387](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$388/full/1400,/0/default.jpg) |
| [P00477](https://jastrow.app/#rid:P00477) | `עַטַר II` | `Pa. "OB to abolish entirely. Targ. II Chr.` | [1065a · leaf 388](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$389/full/1400,/0/default.jpg) |

**Question.** P00476 holds the I as `עֲטַר`; this family is `עַטַר`. They differ only in ע: hataf patah vs patah (P00476 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `עֲטַר` (the way P00476 has it)
  - [ ] print spells both as `עַטַר` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `עֲנָוָה`: missing I (row [P00959](https://jastrow.app/#rid:P00959))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P00958](https://jastrow.app/#rid:P00958) | `ענָוָה I` | `H13^ I, (fT02) f. (H5S I) dimne response` | [1092a · leaf 415](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$416/full/1400,/0/default.jpg) |
| [P00959](https://jastrow.app/#rid:P00959) | `עֲנָוָה II` | `niD^ II f. (b.h. ; SiiSH) humility, lowliness,` | [1092a · leaf 415](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$416/full/1400,/0/default.jpg) |

**Question.** P00958 holds the I as `ענָוָה`; this family is `עֲנָוָה`. They differ only in ע: no mark vs hataf patah (P00958 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `ענָוָה` (the way P00958 has it)
  - [ ] print spells both as `עֲנָוָה` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `עָרֵב`: missing II (row [P01246](https://jastrow.app/#rid:P01246))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [P01244](https://jastrow.app/#rid:P01244) | `עָרַב II` | `ml }J II (b. h.; v. preced.; cmp.` | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01246](https://jastrow.app/#rid:P01246) | `עָרֵב I` | `3 }/ I (b. h.; cmp. d'jSI) [to` | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01247](https://jastrow.app/#rid:P01247) | `עָרִב II` | `J y II m.(b.h.; preced. )spiced, sweet ;` | [1110b · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$434/full/1400,/0/default.jpg) |
| [P01249](https://jastrow.app/#rid:P01249) | `עָרֵב III` | `3™)^ III m. (Sns I, 2) bondsman, surety.` | [1111a · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |
| [P01253](https://jastrow.app/#rid:P01253) | `עֲרָב II` | `J */ II pr. n. pi. 'Arab, near` | [1111b · leaf 434](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$435/full/1400,/0/default.jpg) |

**Question.** P01247 is stored `עָרִב` (hiriq) between P01246 `עָרֵב I` and P01249 `עָרֵב III`, and the hOCR reads `II` beside it. Is it printed `עָרֵב II`? If so P01247's headword and name change (`עָרִב II` → `עָרֵב II`) and both rows close.

  - [ ] yes, print has `עָרֵב II`
  - [ ] no, print matches what is stored
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

**Question.** P01247 is stored `עָרִב` (hiriq) between P01246 `עָרֵב I` and P01249 `עָרֵב III`, and the hOCR reads `II` beside it. Is it printed `עָרֵב II`? If so P01247's headword and name change (`עָרִב II` → `עָרֵב II`) and both rows close.

  - [ ] yes, print has `עָרֵב II`
  - [ ] no, print matches what is stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `פִּרִכֵּס`: missing I (row [Q01863](https://jastrow.app/#rid:Q01863))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [Q01862](https://jastrow.app/#rid:Q01862) | `פִּרְכֵּס I` | `02PlD I (enlargement of TpB) to rub, scrape.` | [1229b · leaf 552](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$553/full/1400,/0/default.jpg) |
| [Q01863](https://jastrow.app/#rid:Q01863) | `פִּרִכֵּס II` | `D2T© II (preced.) [to rub, grind,] to move` | [1229b · leaf 552](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$553/full/1400,/0/default.jpg) |

**Question.** Q01862 holds the I as `פִּרְכֵּס`; this family is `פִּרִכֵּס`. They differ only in ר: sheva vs hiriq (Q01862 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `פִּרְכֵּס` (the way Q01862 has it)
  - [ ] print spells both as `פִּרִכֵּס` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `קְבל`: missing I, II, III (row [S00064](https://jastrow.app/#rid:S00064))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [S00059](https://jastrow.app/#rid:S00059) | `קָבַל II` | `5Dj> II (cmp. b2M) to feel oppressed; to` | [1309a · leaf 632](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$633/full/1400,/0/default.jpg) |
| [S00061](https://jastrow.app/#rid:S00061) | `קְבַל III` | `33p III, ^"Gp (cmp. preced.) [to be thick,]` | [1309b · leaf 632](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$633/full/1400,/0/default.jpg) |
| [S00064](https://jastrow.app/#rid:S00064) | `קְבל IV` | `bnp iv, Stjg, abnj?, &h$>, 'np, ':rp i` | [1309b · leaf 632](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$633/full/1400,/0/default.jpg) |

**Question.** S00064 is stored `קְבל` with no vowel under the bet; its neighbours are `קָבַל I` (S00057), `קָבַל II` (S00059), `קְבַל III` (S00061). Is the print `קְבַל IV`? If so its headword and name change and the numbering is complete. The hOCR reads `bnp iv` (lowercase), which the reader does not count.

  - [ ] yes, print has `קְבַל IV`
  - [ ] no, print matches what is stored
  - [ ] something else (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


#### `רִחִים`: missing I (row [T00500](https://jastrow.app/#rid:T00500))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [T00499](https://jastrow.app/#rid:T00499) | `רְחִים I` | `DTP I m. (preced.) love. Targ. Cant. VII,` | [1466a · leaf 789](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$790/full/1400,/0/default.jpg) |
| [T00500](https://jastrow.app/#rid:T00500) | `רִחִים II` | `DTl II, NET") m. (preced.) beloved, friend;` | [1466a · leaf 789](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$790/full/1400,/0/default.jpg) |

**Question.** T00499 holds the I as `רְחִים`; this family is `רִחִים`. They differ only in ר: sheva vs hiriq (T00499 first). Does print spell them alike? If yes, the slip is in one stored headword (its name changes) and the numbering is complete. If no, the gap is real: find the I.

  - [ ] print spells them differently, so the gap is real
  - [ ] print spells both as `רְחִים` (the way T00499 has it)
  - [ ] print spells both as `רִחִים` (the way this family has it)
  - [ ] print spells them alike, but neither stored spelling is right (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 


### X8 Volume 1: the numeral is not legible in the hOCR (26)

Tesseract reads a stored numeral beside its headword 22% of the time (control below), so a missing numeral cannot be read here. The question is the same for each: is the missing numeral printed beside an unnumbered sibling?

#### `אַגְמָא`: missing I (row [A00312](https://jastrow.app/#rid:A00312))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A00311](https://jastrow.app/#rid:A00311) | `אַגְמָא` | not found in the hOCR | [13a · leaf 36](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$37/full/1400,/0/default.jpg) |
| [A00312](https://jastrow.app/#rid:A00312) | `אַגְמָא II` | `גב 11 pr. ₪. pl Agma, in Babylon.` | [13a · leaf 36](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$37/full/1400,/0/default.jpg) |

**Question.** Does print set I beside A00311? If it sits after `אַגְמָא`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside A00311
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `אֲוָנָא`: missing I (row [A00719](https://jastrow.app/#rid:A00719))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A00719](https://jastrow.app/#rid:A00719) | `אֲוָנָא II` | `NIN 11 NIN pr. n. pl. (v. foreg.)` | [28a · leaf 51](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$52/full/1400,/0/default.jpg) |

**Question.** No entry spelled `אֲוָנָא` lacks a numeral. Is I printed on a neighbour, or is the gap Jastrow's?

  - [ ] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: 


#### `אוֹרְיָין`: missing I (row [A00890](https://jastrow.app/#rid:A00890))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A00889](https://jastrow.app/#rid:A00889) | `אוֹרְיָין` | `TTS, היאן “AN m: same; 1) the Law.` | [34b · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| [A00890](https://jastrow.app/#rid:A00890) | `אוֹרְיָין II` | `PATNI, אוריון (v. foreg.) pr. n. m. Oryan,` | [34b · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |

**Question.** Does print set I beside A00889? If it sits after `אוֹרְיָין`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside A00889
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `אֲמָנָה`: missing I (row [A02042](https://jastrow.app/#rid:A02042))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A02041](https://jastrow.app/#rid:A02041) | `אֲמָנָה` | `TITON £.(o.t.; v.preced.) 1) faith, trust. B.Bath. 45°;` | [77b · leaf 100](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$101/full/1400,/0/default.jpg) |
| [A02042](https://jastrow.app/#rid:A02042) | `אֲמָנָה II` | not found in the hOCR | [78a · leaf 101](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$102/full/1400,/0/default.jpg) |

**Question.** Does print set I beside A02041? If it sits after `אֲמָנָה`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside A02041
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `אָרַע`: missing I (row [A03217](https://jastrow.app/#rid:A03217))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [A03215](https://jastrow.app/#rid:A03215) | `אָרַע` | `YIN (V3, v. (רעע to strike against. Nif.` | [124b · leaf 147](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$148/full/1400,/0/default.jpg) |
| [A03216](https://jastrow.app/#rid:A03216) | `אֲרַע I` | `JN I ch. (in Targ. Y.; in O.` | [124b · leaf 147](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$148/full/1400,/0/default.jpg) |
| [A03217](https://jastrow.app/#rid:A03217) | `אָרַע II` | `"JIN IT (35, cmp. 3, Hif. on, >` | [124b · leaf 147](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$148/full/1400,/0/default.jpg) |

**Question.** Does print set I beside A03215? If it sits after `אָרַע`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside A03215
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `בּוּרְסִי`: missing I (row [B00382](https://jastrow.app/#rid:B00382))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [B00382](https://jastrow.app/#rid:B00382) | `בּוּרְסִי II` | not found in the hOCR | [150b · leaf 173](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$174/full/1400,/0/default.jpg) |
| [B00383](https://jastrow.app/#rid:B00383) | `בּוּרְסִי II²` | not found in the hOCR | [150b · leaf 173](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$174/full/1400,/0/default.jpg) |

**Question.** No entry spelled `בּוּרְסִי` lacks a numeral. Is I printed on a neighbour, or is the gap Jastrow's?

  - [ ] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: 


#### `בִּיאָה`: missing I (row [B00538](https://jastrow.app/#rid:B00538))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [B00537](https://jastrow.app/#rid:B00537) | alt `בִּיאָה` (of `בִּיָּא`) | `NUD, ND, TAB, ביוח (AND) + ae` | [158b · leaf 181](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$182/full/1400,/0/default.jpg) |
| [B00538](https://jastrow.app/#rid:B00538) | `בִּיאָה II` | not found in the hOCR | [159a · leaf 182](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$183/full/1400,/0/default.jpg) |

**Question.** Does print set I beside B00537 (on an alternate)? An alternate carries no name, so only the display changes.

  - [ ] yes, print sets I beside B00537
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `בַּנַּאי`: missing I (row [B00936](https://jastrow.app/#rid:B00936))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [B00935](https://jastrow.app/#rid:B00935) | `בַּנַּאי` | `אר בכ m. h.a. ch. ("22) builder, mason.` | [176b · leaf 199](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$200/full/1400,/0/default.jpg) |
| [B00936](https://jastrow.app/#rid:B00936) | `בַּנַּאי II` | `בנאי 11 FINI, a. "W237 ב'=) )34 .עס` | [176b · leaf 199](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$200/full/1400,/0/default.jpg) |

**Question.** Does print set I beside B00935? If it sits after `בַּנַּאי`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside B00935
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


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
  - [ ] no numeral beside any of them
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
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `גִּיב`: missing I (row [C00610](https://jastrow.app/#rid:C00610))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C00609](https://jastrow.app/#rid:C00609) | `גִּיב` | not found in the hOCR | [234a · leaf 257](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$258/full/1400,/0/default.jpg) |
| [C00610](https://jastrow.app/#rid:C00610) | `גִּיב II` | `גיב ה m, (גַב=) back, top. Targ. Prov.` | [234a · leaf 257](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$258/full/1400,/0/default.jpg) |

**Question.** Does print set I beside C00609? If it sits after `גִּיב`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside C00609
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `גִּיס`: missing I (row [C00773](https://jastrow.app/#rid:C00773))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C00773](https://jastrow.app/#rid:C00773) | `גִּיס II` | `O NAIL, ברכ m, (Os U1) intimate, familiar.` | [240a · leaf 263](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$264/full/1400,/0/default.jpg) |
| [C00774](https://jastrow.app/#rid:C00774) | `גִּיס II²` | `on IT m. (v. preced., emp. רסא 111(` | [240b · leaf 263](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$264/full/1400,/0/default.jpg) |

**Question.** No entry spelled `גִּיס` lacks a numeral. Is I printed on a neighbour, or is the gap Jastrow's?

  - [ ] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: 


#### `גְּנַה`: missing I (row [C01130](https://jastrow.app/#rid:C01130))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [C01130](https://jastrow.app/#rid:C01130) | `גְּנַה II` | `LL to cut, pass swiftly, Torg, Pe, VIII,` | [259a · leaf 282](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$283/full/1400,/0/default.jpg) |

**Question.** No entry spelled `גְּנַה` lacks a numeral. Is I printed on a neighbour, or is the gap Jastrow's?

  - [ ] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: 


#### `דִּי`: missing I (row [D00443](https://jastrow.app/#rid:D00443))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [D00002](https://jastrow.app/#rid:D00002) | alt `דִּי` (of `דְּ־`) | `quod), Targ. Gon, א ,וא ,42 Ib. 1X,` | [275a · leaf 298](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$299/full/1400,/0/default.jpg) |
| [D00442](https://jastrow.app/#rid:D00442) | `דִּי` | `ד" (hs. my, cmp. ;73 קפס to bh.` | [293b · leaf 316](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$317/full/1400,/0/default.jpg) |
| [D00443](https://jastrow.app/#rid:D00443) | `דִּי II` | `די ]1 האר for if. יצ BR. Hash.` | [293b · leaf 316](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$317/full/1400,/0/default.jpg) |

**Question.** Does print set I beside D00002 (on an alternate), D00442? If it sits after `דִּי`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside D00002
  - [ ] yes, print sets I beside D00442
  - [ ] no numeral beside any of them
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `הִא`: missing I, II (row [E00008](https://jastrow.app/#rid:E00008))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [E00005](https://jastrow.app/#rid:E00005) | `הָא I` | not found in the hOCR | [327a · leaf 350](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$351/full/1400,/0/default.jpg) |
| [E00006](https://jastrow.app/#rid:E00006) | `הָא II` | `הא ₪ ]הא (v. preced.) an interjection, 1)` | [328a · leaf 351](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$352/full/1400,/0/default.jpg) |
| [E00007](https://jastrow.app/#rid:E00007) | `הֵא II` | `הא II, הא הא pr. n. m. 16-76.` | [328a · leaf 351](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$352/full/1400,/0/default.jpg) |
| [E00008](https://jastrow.app/#rid:E00008) | `הִא III` | `NT 111 name of a worm, v. 17.` | [328a · leaf 351](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$352/full/1400,/0/default.jpg) |

**Question.** No entry spelled `הִא` lacks a numeral. Is I, II printed on a neighbour, or is the gap Jastrow's?

  - [ ] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: 


#### `הֲדָיָא`: missing I (row [E00114](https://jastrow.app/#rid:E00114))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [E00114](https://jastrow.app/#rid:E00114) | `הֲדָיָא II` | not found in the hOCR | [333a · leaf 356](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$357/full/1400,/0/default.jpg) |

**Question.** No entry spelled `הֲדָיָא` lacks a numeral. Is I printed on a neighbour, or is the gap Jastrow's?

  - [ ] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: 


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
  - [ ] no numeral beside any of them
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
  - [ ] no numeral beside any of them
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
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `חֵלֶף`: missing I (row [H01101](https://jastrow.app/#rid:H01101))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H00780](https://jastrow.app/#rid:H00780) | alt `חֵלֶף` (of `חֵילֶף`) | `non, non m. (חלף) a species of salt` | [456b · leaf 479](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$480/full/1400,/0/default.jpg) |
| [H01099](https://jastrow.app/#rid:H01099) | `חֲלַף I` | `חלף 8 חליף ch. same, to pass by,` | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |
| [H01100](https://jastrow.app/#rid:H01100) | `חִלֶף I` | `חלף I m. (preced, wds.) 1) shoot. —` | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |
| [H01101](https://jastrow.app/#rid:H01101) | `חֵלֶף II` | `720 II m. (préced. wds.) reversion. Y. Sabb,` | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |

**Question.** Does print set I beside H00780 (on an alternate)? An alternate carries no name, so only the display changes.

  - [ ] yes, print sets I beside H00780
  - [ ] no numeral beside it
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
  - [ ] no numeral beside any of them
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `חַנִּין`: missing I (row [H01291](https://jastrow.app/#rid:H01291))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [H01290](https://jastrow.app/#rid:H01290) | `חַנִּין` | not found in the hOCR | [483a · leaf 506](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$507/full/1400,/0/default.jpg) |
| [H01291](https://jastrow.app/#rid:H01291) | `חַנִּין II` | not found in the hOCR | [483a · leaf 506](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$507/full/1400,/0/default.jpg) |

**Question.** Does print set I beside H01290? If it sits after `חַנִּין`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside H01290
  - [ ] no numeral beside it
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
  - [ ] no numeral beside any of them
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
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `יְתֵב`: missing I (row [J00713](https://jastrow.app/#rid:J00713))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [J00713](https://jastrow.app/#rid:J00713) | `יְתֵב II` | not found in the hOCR | [603a · leaf 626](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$627/full/1400,/0/default.jpg) |

**Question.** No entry spelled `יְתֵב` lacks a numeral. Is I printed on a neighbour, or is the gap Jastrow's?

  - [ ] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: 


#### `יַתִּיר`: missing I (row [J00738](https://jastrow.app/#rid:J00738))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [J00737](https://jastrow.app/#rid:J00737) | alt `יְתֵיר׳` (of `יַתִּור I`) | `TENT, NYE m., ירא RETA יתיר' +` | [604a · leaf 627](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$628/full/1400,/0/default.jpg) |
| [J00738](https://jastrow.app/#rid:J00738) | `יַתִּיר II` | `יפיר 11 pr. n. pl. Yattir, v. spy.` | [604a · leaf 627](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$628/full/1400,/0/default.jpg) |

**Question.** No entry spelled `יַתִּיר` lacks a numeral. Is I printed on a neighbour, or is the gap Jastrow's?

  - [ ] the gap is Jastrow's own: nothing to fix
  - [ ] the numeral is printed on a neighbour (say which word in the note)
  - [ ] can't tell from the scan
  - note: 


### X8 Volume 2: no numeral read (17)

ABBYY reads stored numerals 88% of the time, but not on these lines: the unnumbered sibling's line is not found, garbled, or not clean enough to call.

#### `סְלִיקוּסְתָּא`: missing I (row [O00995](https://jastrow.app/#rid:O00995))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [O00994](https://jastrow.app/#rid:O00994) | `סְלִיקוּסְתָּא` | `J^t^p^D f. (Pales of pbp, by false etymology` | [995a · leaf 318](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$319/full/1400,/0/default.jpg) |
| [O00995](https://jastrow.app/#rid:O00995) | `סְלִיקוּסְתָּא II` | `^P^bDlI f. (Pales of pbp) refuse of boiled` | [995a · leaf 318](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$319/full/1400,/0/default.jpg) |

**Question.** Does print set I beside O00994? If it sits after `סְלִיקוּסְתָּא`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside O00994
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `פְּלוּגְתָּא`: missing I (row [Q00965](https://jastrow.app/#rid:Q00965))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [Q00964](https://jastrow.app/#rid:Q00964) | `פְּלוּגְתָּא` | `ffsTUIx1!;, 3 >if ch.same, l)=ii}\ti?separation (of races).` | [1177a · leaf 500](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$501/full/1400,/0/default.jpg) |
| [Q00965](https://jastrow.app/#rid:Q00965) | `פְּלוּגְתָּא II` | `SrU* ^? II, HP Jfi >5 pr. n.` | [1177b · leaf 500](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$501/full/1400,/0/default.jpg) |

**Question.** Does print set I beside Q00964? If it sits after `פְּלוּגְתָּא`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside Q00964
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `פַּפָּא`: missing I (row [Q01399](https://jastrow.app/#rid:Q01399))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [Q01398](https://jastrow.app/#rid:Q01398) | `פַּפָּא` | `SSD (tradit. pronunc. SBE) pr. n. m. Pappa` | [1203b · leaf 526](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$527/full/1400,/0/default.jpg) |
| [Q01399](https://jastrow.app/#rid:Q01399) | `פַּפָּא II` | `Xr £ II, B ™lj [m pr. n.` | [1203b · leaf 526](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$527/full/1400,/0/default.jpg) |

**Question.** Does print set I beside Q01398? If it sits after `פַּפָּא`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside Q01398
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `קוּלְיָא`: missing I (row [S00337](https://jastrow.app/#rid:S00337))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [S00336](https://jastrow.app/#rid:S00336) | `קוּלְיָא` | `fcVylp, lp m. ("hp II) parched grain; flour` | [1328a · leaf 651](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$652/full/1400,/0/default.jpg) |
| [S00337](https://jastrow.app/#rid:S00337) | `קוּלְיָא II` | `fcv"*p II, PS yp m. (preced.) ashes of` | [1328a · leaf 651](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$652/full/1400,/0/default.jpg) |

**Question.** Does print set I beside S00336? If it sits after `קוּלְיָא`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside S00336
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `שְׁבַע`: missing I (row [U00158](https://jastrow.app/#rid:U00158))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U00156](https://jastrow.app/#rid:U00156) | `שְׁבַע` | `?2ti i, Krtej f, asntf, rratf, '£ ,` | [1515b · leaf 838](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$839/full/1400,/0/default.jpg) |
| [U00158](https://jastrow.app/#rid:U00158) | `שְׁבַע II` | `3?Dp II ch., Ithpa. VSBMM, It hpe. 5BTBX` | [1515b · leaf 838](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$839/full/1400,/0/default.jpg) |
| [U00159](https://jastrow.app/#rid:U00159) | `שָׂבֵעַ I` | `•Zl^ I, m. (b.h, ; next w.) sated,` | [1516a · leaf 839](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$840/full/1400,/0/default.jpg) |

**Question.** Does print set I beside U00156? If it sits after `שְׁבַע`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside U00156
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

  - [ ] yes, print sets I beside U00682
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

  - [ ] yes, print sets II beside U00911
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
  - [ ] yes, print sets I beside U01006
  - [ ] yes, print sets I beside U01008
  - [ ] no numeral beside any of them
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `שֵׁיצָיוּ`: missing I (row [U01036](https://jastrow.app/#rid:U01036))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [U01035](https://jastrow.app/#rid:U01035) | alt `שֵׁיצָיוּ` (of `שֵׁיצְיוּ`) | `1 '1 «, • J. - 1 Nk` | [1567b · leaf 890](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$891/full/1400,/0/default.jpg) |
| [U01036](https://jastrow.app/#rid:U01036) | `שֵׁיצָיוּ II` | `1 J» w II (preced.) pr. n. pi.` | [1567b · leaf 890](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$891/full/1400,/0/default.jpg) |

**Question.** Does print set I beside U01035 (on an alternate)? An alternate carries no name, so only the display changes.

  - [ ] yes, print sets I beside U01035
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

  - [ ] yes, print sets I beside U01138
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

  - [ ] yes, print sets I beside U01570
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

  - [ ] yes, print sets I beside U01634
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
  - [ ] no numeral beside any of them
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
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `תּוּף`: missing I (row [V00255](https://jastrow.app/#rid:V00255))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [V00254](https://jastrow.app/#rid:V00254) | `תּוּף` | not found in the hOCR | [1655a · leaf 978](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$979/full/1400,/0/default.jpg) |
| [V00255](https://jastrow.app/#rid:V00255) | `תּוּף II` | `Spfl II m. (r~ II) spittle. Keth. 61b` | [1655a · leaf 978](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$979/full/1400,/0/default.jpg) |

**Question.** Does print set I beside V00254? If it sits after `תּוּף`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets I beside V00254
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `תַּכָּא`: missing I (row [V00523](https://jastrow.app/#rid:V00523))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [V00522](https://jastrow.app/#rid:V00522) | alt `תַּכָּא` (of `תֻּכָּא`) | not found in the hOCR | [1667b · leaf 990](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$991/full/1400,/0/default.jpg) |
| [V00523](https://jastrow.app/#rid:V00523) | `תַּכָּא II` | `KVi'Fj II m. (v. preced. art.; cmp. Assyr.` | [1667b · leaf 990](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$991/full/1400,/0/default.jpg) |

**Question.** Does print set I beside V00522 (on an alternate)? An alternate carries no name, so only the display changes.

  - [ ] yes, print sets I beside V00522
  - [ ] no numeral beside it
  - [ ] a different numeral or mark is there (write it in the note)
  - [ ] can't tell from the scan
  - note: 


#### `תָּפַח`: missing II (row [V00808](https://jastrow.app/#rid:V00808))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [V00808](https://jastrow.app/#rid:V00808) | `תָּפַח I` | `n£r. I (Tafel of riBl) to be blown` | [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |
| [V00809](https://jastrow.app/#rid:V00809) | `תָּפַח` | not found in the hOCR | [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |
| [V00810](https://jastrow.app/#rid:V00810) | `תָּפַח III` | `nCvl III — PEB II , to drip,` | [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |
| [V00812](https://jastrow.app/#rid:V00812) | `תְּפַח II` | `TOPl II, Ithpe. nsnx, Ithpa. PBPX (v. PEi;` | [1685b · leaf 1008](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1009/full/1400,/0/default.jpg) |

**Question.** Does print set II beside V00809? If it sits after `תָּפַח`, that entry gets `homograph` and a new name.

  - [ ] yes, print sets II beside V00809
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
  - [ ] there is a fix (say what print shows in the note)
  - [ ] can't tell from the scan
  - note: 


#### `פַּנְיָא`: missing I, II (row [Q01193](https://jastrow.app/#rid:Q01193))

| rid | stored | hOCR, verbatim | scan |
|---|---|---|---|
| [Q01191](https://jastrow.app/#rid:Q01191) | alt `פַּנְיָא` (of `פְּנֵי II`) | `":s n, ■»» m., arsg (rns) i c.=h.` | [1189a · leaf 512](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$513/full/1400,/0/default.jpg) |
| [Q01192](https://jastrow.app/#rid:Q01192) | `פַּנְיָא` | `2tf*^*> S"j3 II m. CIS; sub X»Oin or` | [1189a · leaf 512](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$513/full/1400,/0/default.jpg) |
| [Q01193](https://jastrow.app/#rid:Q01193) | `פַּנְיָא III` | `S*25 III pr. n. 'B lfi3 AT'Aar (Cano/` | [1189a · leaf 512](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$513/full/1400,/0/default.jpg) |

**Question.** Q01191 numbers its primary `פְּנֵי II` and sets `I` after the bracketed `(פַּנְיָה)`; Q01192 holds `פַּנְיָיא II`. Which entry is `פַּנְיָא I` in print?

  - [ ] nothing to fix: the gap is Jastrow's own
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

  - [ ] nothing to fix: the gap is Jastrow's own
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

  - [ ] nothing to fix: the gap is Jastrow's own
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

  - [ ] nothing to fix: the gap is Jastrow's own
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
  - [ ] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U00488**: `שׁוּף` becomes `שׁוּף I`
  - [ ] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U00524**: `שׁוּקָא` becomes `שׁוּקָא I`
  - [ ] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U00627**: `שָׁחוֹר` becomes `שָׁחוֹר I`
  - [ ] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U00820**: `שִׁידָּא` becomes `שִׁידָּא I`
  - [ ] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U01268**: `שֶׁלַח` becomes `שֶׁלַח II`
  - [ ] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U01348**: `שָׁלֵם` becomes `שָׁלֵם I`
  - [ ] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U01772**: `שְׁפַל` becomes `שְׁפַל I`
  - [ ] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **U02021**: `שְׁרַק` becomes `שְׁרַק I`
  - [ ] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **V00743**: `תְּנֵי` becomes `תְּנֵי I`
  - [ ] confirmed: print shows that numeral beside it
  - [ ] not what print shows (say what you see in the note)
  - [ ] can't tell from the scan
  - note: 

- **V00844**: `תְּפַס` becomes `תְּפַס I`
  - [ ] confirmed: print shows that numeral beside it
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
  - [ ] print's headword is `שׁוּף` with no numeral or superscript
  - [ ] print shows a numeral or superscript on it (write it in the note)
  - [ ] can't tell from the scan
  - note: 

- **J00321, J00327.** Ending entries, the mirror of the maqaf prefixes;
  HW-prefix names both. J00321's line is the one whose gloss reads
  `כַּיי = כְּהַיי`, and the leading `I,` is the bare patah read as a
  letter. J00327's line is illegible. The name keeps the leading vowel.
- **V00518.** The line sits between `תִּישּׁוּעַ` and `תִּיתוּרָא` and has
  the shape of your print reading `תִּישַׁע, v. תְּשַׁע ch.` The fix
  moves `v. תְּשַׁע` into the gloss and drops the two fragments. The
  primary stays `תִּישַׁע`, so the name does not change.
- **S01780.** The hOCR sets no Roman numeral: the line reads as
  `קֵץ, קִצָּא, קִי׳ ch. same`. The `²` is Sefaria's disambiguator from
  S01779 `קֵץ`, and the name needs it either way. The fragments are
  alternates; their spelling is print work that changes no name.
- [ ] **U00489.** The text is determinable: `ש` + `ׁוּף` joins byte for
  byte to `שׁוּף` (#113), as Q00752's join did. The hOCR shows no
  numeral after it (`ch. same` follows the headword). The mark is the
  question. If you take pile B's U00488 row (`שׁוּף` → `שׁוּף I`), the
  bare name `שׁוּף` is free and U00489 can take it with no mark, as
  print sets it. If not, U00489 needs a disambiguator; U00491 already
  holds `²`. Which?

## Pile A: ruled legitimate (288)

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
| X8 | HW-roman | the missing numeral is stored on another form of an unnumbered sibling's own entry | 41 |
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
- **HW-homograph-gaps, 178 families.** The report has 177 (136
  primary + 41 alternate). The one missing family was not traced.
- **HW-roman.** It quotes no X8 count. 41 families resolve under it:
  Sefaria hung the numeral on the line's last form (`סְבַר, סְבֵיר I`),
  so the family's first spelling looks unnumbered. In 28 of the 31
  volume-2 families the hOCR reads that numeral on the holder's line.
  The cost HW-roman accepted is visible here: those 41 entries' names
  carry no numeral although print numbers them.

<details>
<summary>The 288 rids by shape</summary>

**H6, HW-phrase-hw (3):** [A00436](https://jastrow.app/#rid:A00436), [A01881](https://jastrow.app/#rid:A01881), [C00517](https://jastrow.app/#rid:C00517)

**H6, HW-abbrev-primary (3):** [A02002](https://jastrow.app/#rid:A02002), [K00107](https://jastrow.app/#rid:K00107), [P00137](https://jastrow.app/#rid:P00137)

**X1, HW-prefix endings (2):** [J00321](https://jastrow.app/#rid:J00321), [J00327](https://jastrow.app/#rid:J00327)

**X5, HW-prefix, prefixes (36):** [A00007](https://jastrow.app/#rid:A00007), [A00008](https://jastrow.app/#rid:A00008), [A00012](https://jastrow.app/#rid:A00012), [A00367](https://jastrow.app/#rid:A00367), [A00515](https://jastrow.app/#rid:A00515), [A00661](https://jastrow.app/#rid:A00661), [A00954](https://jastrow.app/#rid:A00954), [A01109](https://jastrow.app/#rid:A01109), [A01396](https://jastrow.app/#rid:A01396), [A01410](https://jastrow.app/#rid:A01410), [A01638](https://jastrow.app/#rid:A01638), [A01765](https://jastrow.app/#rid:A01765), [A02317](https://jastrow.app/#rid:A02317), [A02345](https://jastrow.app/#rid:A02345), [A02864](https://jastrow.app/#rid:A02864), [A03392](https://jastrow.app/#rid:A03392), [B00003](https://jastrow.app/#rid:B00003), [B00004](https://jastrow.app/#rid:B00004), [B00093](https://jastrow.app/#rid:B00093), [D00002](https://jastrow.app/#rid:D00002), [D00445](https://jastrow.app/#rid:D00445), [D00502](https://jastrow.app/#rid:D00502), [D00937](https://jastrow.app/#rid:D00937), [E00002](https://jastrow.app/#rid:E00002), [E00003](https://jastrow.app/#rid:E00003), [E00095](https://jastrow.app/#rid:E00095), [E00373](https://jastrow.app/#rid:E00373), [E00413](https://jastrow.app/#rid:E00413), [E00530](https://jastrow.app/#rid:E00530), [F00025](https://jastrow.app/#rid:F00025), [K00002](https://jastrow.app/#rid:K00002), [L00002](https://jastrow.app/#rid:L00002), [M00002](https://jastrow.app/#rid:M00002), [M00230](https://jastrow.app/#rid:M00230), [S00002](https://jastrow.app/#rid:S00002), [U00002](https://jastrow.app/#rid:U00002)

**X5, HW-prefix, bound forms (76):** [A02029](https://jastrow.app/#rid:A02029), [A03212](https://jastrow.app/#rid:A03212), [B00551](https://jastrow.app/#rid:B00551), [C00086](https://jastrow.app/#rid:C00086), [C00547](https://jastrow.app/#rid:C00547), [C01133](https://jastrow.app/#rid:C01133), [D00490](https://jastrow.app/#rid:D00490), [D00585](https://jastrow.app/#rid:D00585), [D00588](https://jastrow.app/#rid:D00588), [D00595](https://jastrow.app/#rid:D00595), [D00596](https://jastrow.app/#rid:D00596), [D00764](https://jastrow.app/#rid:D00764), [D00769](https://jastrow.app/#rid:D00769), [G00517](https://jastrow.app/#rid:G00517), [H00076](https://jastrow.app/#rid:H00076), [H01188](https://jastrow.app/#rid:H01188), [H01528](https://jastrow.app/#rid:H01528), [J00328](https://jastrow.app/#rid:J00328), [J00692](https://jastrow.app/#rid:J00692), [K00049](https://jastrow.app/#rid:K00049), [K00261](https://jastrow.app/#rid:K00261), [K00824](https://jastrow.app/#rid:K00824), [K01012](https://jastrow.app/#rid:K01012), [K01169](https://jastrow.app/#rid:K01169), [K01180](https://jastrow.app/#rid:K01180), [K01307](https://jastrow.app/#rid:K01307), [K01361](https://jastrow.app/#rid:K01361), [L00522](https://jastrow.app/#rid:L00522), [L00549](https://jastrow.app/#rid:L00549), [L00625](https://jastrow.app/#rid:L00625), [M00159](https://jastrow.app/#rid:M00159), [M00289](https://jastrow.app/#rid:M00289), [M00593](https://jastrow.app/#rid:M00593), [M01084](https://jastrow.app/#rid:M01084), [M01247](https://jastrow.app/#rid:M01247), [M01409](https://jastrow.app/#rid:M01409), [M01658](https://jastrow.app/#rid:M01658), [M02474](https://jastrow.app/#rid:M02474), [M02794](https://jastrow.app/#rid:M02794), [N00629](https://jastrow.app/#rid:N00629), [N00964](https://jastrow.app/#rid:N00964), [O00582](https://jastrow.app/#rid:O00582), [O01363](https://jastrow.app/#rid:O01363), [O01375](https://jastrow.app/#rid:O01375), [P00502](https://jastrow.app/#rid:P00502), [P00707](https://jastrow.app/#rid:P00707), [P01118](https://jastrow.app/#rid:P01118), [P01170](https://jastrow.app/#rid:P01170), [P01335](https://jastrow.app/#rid:P01335), [P01340](https://jastrow.app/#rid:P01340), [P01348](https://jastrow.app/#rid:P01348), [P01359](https://jastrow.app/#rid:P01359), [Q00705](https://jastrow.app/#rid:Q00705), [Q00900](https://jastrow.app/#rid:Q00900), [R00307](https://jastrow.app/#rid:R00307), [R00353](https://jastrow.app/#rid:R00353), [R00370](https://jastrow.app/#rid:R00370), [S00353](https://jastrow.app/#rid:S00353), [S00377](https://jastrow.app/#rid:S00377), [S01016](https://jastrow.app/#rid:S01016), [S01120](https://jastrow.app/#rid:S01120), [S01223](https://jastrow.app/#rid:S01223), [S01435](https://jastrow.app/#rid:S01435), [S01436](https://jastrow.app/#rid:S01436), [S01824](https://jastrow.app/#rid:S01824), [T00496](https://jastrow.app/#rid:T00496), [U00887](https://jastrow.app/#rid:U00887), [U00968](https://jastrow.app/#rid:U00968), [U01026](https://jastrow.app/#rid:U01026), [U01083](https://jastrow.app/#rid:U01083), [U01471](https://jastrow.app/#rid:U01471), [V00445](https://jastrow.app/#rid:V00445), [V00738](https://jastrow.app/#rid:V00738), [V00761](https://jastrow.app/#rid:V00761), [V00819](https://jastrow.app/#rid:V00819), [V00960](https://jastrow.app/#rid:V00960)

**X5, HW-prefix, maqaf compound (1):** [B00761](https://jastrow.app/#rid:B00761)

**X7, HW-acronyms, acronyms (68):** [A00010](https://jastrow.app/#rid:A00010), [A00409](https://jastrow.app/#rid:A00409), [A01042](https://jastrow.app/#rid:A01042), [A01065](https://jastrow.app/#rid:A01065), [A01069](https://jastrow.app/#rid:A01069), [A01764](https://jastrow.app/#rid:A01764), [A01935](https://jastrow.app/#rid:A01935), [A01936](https://jastrow.app/#rid:A01936), [A03391](https://jastrow.app/#rid:A03391), [B00751](https://jastrow.app/#rid:B00751), [B00757](https://jastrow.app/#rid:B00757), [B00974](https://jastrow.app/#rid:B00974), [C00743](https://jastrow.app/#rid:C00743), [C01036](https://jastrow.app/#rid:C01036), [C01224](https://jastrow.app/#rid:C01224), [D00791](https://jastrow.app/#rid:D00791), [D00810](https://jastrow.app/#rid:D00810), [D00863](https://jastrow.app/#rid:D00863), [D00983](https://jastrow.app/#rid:D00983), [E00004](https://jastrow.app/#rid:E00004), [E00141](https://jastrow.app/#rid:E00141), [E00295](https://jastrow.app/#rid:E00295), [E00326](https://jastrow.app/#rid:E00326), [F00004](https://jastrow.app/#rid:F00004), [G00007](https://jastrow.app/#rid:G00007), [G00338](https://jastrow.app/#rid:G00338), [H00897](https://jastrow.app/#rid:H00897), [I00458](https://jastrow.app/#rid:I00458), [J00083](https://jastrow.app/#rid:J00083), [J00087](https://jastrow.app/#rid:J00087), [J00158](https://jastrow.app/#rid:J00158), [J00318](https://jastrow.app/#rid:J00318), [K00977](https://jastrow.app/#rid:K00977), [L00564](https://jastrow.app/#rid:L00564), [L00607](https://jastrow.app/#rid:L00607), [M00914](https://jastrow.app/#rid:M00914), [M01200](https://jastrow.app/#rid:M01200), [M01490](https://jastrow.app/#rid:M01490), [M01644](https://jastrow.app/#rid:M01644), [M01690](https://jastrow.app/#rid:M01690), [M01810](https://jastrow.app/#rid:M01810), [M02383](https://jastrow.app/#rid:M02383), [N00378](https://jastrow.app/#rid:N00378), [N00910](https://jastrow.app/#rid:N00910), [N01391](https://jastrow.app/#rid:N01391), [O01096](https://jastrow.app/#rid:O01096), [P00169](https://jastrow.app/#rid:P00169), [P00548](https://jastrow.app/#rid:P00548), [P00600](https://jastrow.app/#rid:P00600), [P00731](https://jastrow.app/#rid:P00731), [Q00002](https://jastrow.app/#rid:Q00002), [Q00141](https://jastrow.app/#rid:Q00141), [Q00157](https://jastrow.app/#rid:Q00157), [Q00436](https://jastrow.app/#rid:Q00436), [Q00459](https://jastrow.app/#rid:Q00459), [R00099](https://jastrow.app/#rid:R00099), [S00487](https://jastrow.app/#rid:S00487), [T00237](https://jastrow.app/#rid:T00237), [T00717](https://jastrow.app/#rid:T00717), [T00804](https://jastrow.app/#rid:T00804), [T00840](https://jastrow.app/#rid:T00840), [U00967](https://jastrow.app/#rid:U00967), [U01614](https://jastrow.app/#rid:U01614), [U01649](https://jastrow.app/#rid:U01649), [V00024](https://jastrow.app/#rid:V00024), [V00042](https://jastrow.app/#rid:V00042), [V00077](https://jastrow.app/#rid:V00077), [V00983](https://jastrow.app/#rid:V00983)

**X7, HW-acronyms, numeral letters (21):** [A00006](https://jastrow.app/#rid:A00006), [B00002](https://jastrow.app/#rid:B00002), [C00002](https://jastrow.app/#rid:C00002), [D00001](https://jastrow.app/#rid:D00001), [E00001](https://jastrow.app/#rid:E00001), [F00001](https://jastrow.app/#rid:F00001), [H00001](https://jastrow.app/#rid:H00001), [I00001](https://jastrow.app/#rid:I00001), [J00001](https://jastrow.app/#rid:J00001), [K00001](https://jastrow.app/#rid:K00001), [L00001](https://jastrow.app/#rid:L00001), [M00001](https://jastrow.app/#rid:M00001), [N00002](https://jastrow.app/#rid:N00002), [O00001](https://jastrow.app/#rid:O00001), [P00001](https://jastrow.app/#rid:P00001), [Q00001](https://jastrow.app/#rid:Q00001), [R00001](https://jastrow.app/#rid:R00001), [S00001](https://jastrow.app/#rid:S00001), [T00001](https://jastrow.app/#rid:T00001), [U00001](https://jastrow.app/#rid:U00001), [V00001](https://jastrow.app/#rid:V00001)

**X7, HW-truncated (34):** [A02161](https://jastrow.app/#rid:A02161), [A02411](https://jastrow.app/#rid:A02411), [B00398](https://jastrow.app/#rid:B00398), [B00983](https://jastrow.app/#rid:B00983), [C00618](https://jastrow.app/#rid:C00618), [C00737](https://jastrow.app/#rid:C00737), [D00826](https://jastrow.app/#rid:D00826), [D00957](https://jastrow.app/#rid:D00957), [D00963](https://jastrow.app/#rid:D00963), [E00197](https://jastrow.app/#rid:E00197), [E00433](https://jastrow.app/#rid:E00433), [E00842](https://jastrow.app/#rid:E00842), [E00856](https://jastrow.app/#rid:E00856), [G00401](https://jastrow.app/#rid:G00401), [K00302](https://jastrow.app/#rid:K00302), [N00665](https://jastrow.app/#rid:N00665), [O00671](https://jastrow.app/#rid:O00671), [O00672](https://jastrow.app/#rid:O00672), [Q00385](https://jastrow.app/#rid:Q00385), [Q01625](https://jastrow.app/#rid:Q01625), [Q01633](https://jastrow.app/#rid:Q01633), [Q01858](https://jastrow.app/#rid:Q01858), [S00240](https://jastrow.app/#rid:S00240), [S00269](https://jastrow.app/#rid:S00269), [S00462](https://jastrow.app/#rid:S00462), [S00463](https://jastrow.app/#rid:S00463), [S00958](https://jastrow.app/#rid:S00958), [S01151](https://jastrow.app/#rid:S01151), [U01593](https://jastrow.app/#rid:U01593), [U01626](https://jastrow.app/#rid:U01626), [V00107](https://jastrow.app/#rid:V00107), [V00154](https://jastrow.app/#rid:V00154), [V00228](https://jastrow.app/#rid:V00228), [V00841](https://jastrow.app/#rid:V00841)

**X8, HW-roman (41), with the entry that holds the numeral:** [A01698](https://jastrow.app/#rid:A01698) (on A01697), [A01735](https://jastrow.app/#rid:A01735) (on A01734), [A02363](https://jastrow.app/#rid:A02363) (on A02362), [A02413](https://jastrow.app/#rid:A02413) (on A02412), [A02824](https://jastrow.app/#rid:A02824) (on A02823), [B00050](https://jastrow.app/#rid:B00050) (on B00049), [B00560](https://jastrow.app/#rid:B00560) (on B00561), [E00697](https://jastrow.app/#rid:E00697) (on E00696), [J00752](https://jastrow.app/#rid:J00752) (on J00751), [K00345](https://jastrow.app/#rid:K00345) (on K00344), [L00290](https://jastrow.app/#rid:L00290) (on L00289), [L00694](https://jastrow.app/#rid:L00694) (on L00693), [M01319](https://jastrow.app/#rid:M01319) (on M01318), [M02008](https://jastrow.app/#rid:M02008) (on M02007), [M02547](https://jastrow.app/#rid:M02547) (on M02546), [N00738](https://jastrow.app/#rid:N00738) (on N00737), [N00914](https://jastrow.app/#rid:N00914) (on N00913), [O00086](https://jastrow.app/#rid:O00086) (on O00085), [O00122](https://jastrow.app/#rid:O00122) (on O00120, O00121), [O00156](https://jastrow.app/#rid:O00156) (on O00155), [O00352](https://jastrow.app/#rid:O00352) (on O00351), [O00499](https://jastrow.app/#rid:O00499) (on O00498), [O00563](https://jastrow.app/#rid:O00563) (on O00564), [O00580](https://jastrow.app/#rid:O00580) (on O00579), [P00230](https://jastrow.app/#rid:P00230) (on P00229), [P01418](https://jastrow.app/#rid:P01418) (on P01417), [Q00629](https://jastrow.app/#rid:Q00629) (on Q00628), [Q01320](https://jastrow.app/#rid:Q01320) (on Q01319), [Q02092](https://jastrow.app/#rid:Q02092) (on Q02090), [Q02095](https://jastrow.app/#rid:Q02095) (on Q02094), [R00293](https://jastrow.app/#rid:R00293) (on R00292), [R00608](https://jastrow.app/#rid:R00608) (on R00607), [R00615](https://jastrow.app/#rid:R00615) (on R00614), [S01065](https://jastrow.app/#rid:S01065) (on S01064), [T00337](https://jastrow.app/#rid:T00337) (on T00336), [T00895](https://jastrow.app/#rid:T00895) (on T00892, T00893), [U00881](https://jastrow.app/#rid:U00881) (on U00880), [U00883](https://jastrow.app/#rid:U00883) (on U00882), [U01047](https://jastrow.app/#rid:U01047) (on U01046), [V00543](https://jastrow.app/#rid:V00543) (on V00541, V00542), [V01023](https://jastrow.app/#rid:V01023) (on V01022)

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

| rid | family | why the name does not change | scan |
|---|---|---|---|
| [I00618](https://jastrow.app/#rid:I00618) | `טְעַן` | the missing I, II is on I00614, I00616, spelled with other vowels; numbering runs I..III once across the consonant family. The unnumbered I00615, I00617 are the Aramaic `ch. same` lines, which print leaves unnumbered: I00615 `73, מעין ch. same, to plead. Keth. 105"`; I00617 `79, מעון ch, same, 1) to be laden;` | [544a · leaf 567](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$568/full/1400,/0/default.jpg) |
| [M02850](https://jastrow.app/#rid:M02850) | `מְשַׁח` | the missing I, II is on M02846, M02848, spelled with other vowels; numbering runs I..IV once across the consonant family. The unnumbered M02847, M02849 are the Aramaic `ch. same` lines, which print leaves unnumbered: M02847 `riw^2 ch. same. Targ. 0. Gen. XXXI, 13.`; M02849 `nCQ ch. same. Targ. Y. Gen. X, 25.` | [851a · leaf 174](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$175/full/1400,/0/default.jpg) |
| [S00061](https://jastrow.app/#rid:S00061) | `קְבַל` | the missing I, II is on S00057, S00059, spelled with other vowels; numbering runs I..IV once across the consonant family. The unnumbered S00058, S00060 are the Aramaic `ch. same` lines, which print leaves unnumbered: S00058 `3Dp ch. same, 1) (with TDK) to visit.`; S00060 `J Jp ch. same, to cry out, complain,` | [1309a · leaf 632](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$633/full/1400,/0/default.jpg) |
| [U00710](https://jastrow.app/#rid:U00710) | `שְׁחַר` | the missing I, II, III is on U00704, U00706, U00708, spelled with other vowels; numbering runs I..IV once across the consonant family. The unnumbered U00705, U00707, U00709 are the Aramaic `ch. same` lines, which print leaves unnumbered: U00705 `""iniD ch. same, to search, inquire. Targ. Is.`; U00707 `Hof. "inavi fo become black, v. supra.`; U00709 `™irn£? ch. same. Ex. R. s. 47 "ppTl` | [1551a · leaf 874](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$875/full/1400,/0/default.jpg) |

## How this was produced

Read-only scripts over the committed tree at `f1e2982f5`, importing the
repo's own `nameOf`, `normalizeHeadword`, `ocrSimilarity` and
`intToRoman`. Hebrew was compared in NFC, or as consonants with every
mark stripped. Nothing in `data/` was written.

**Rows.** `docs/reports/headword-issues.csv`, role `headword`: 382.
For X8, each family was rebuilt the way `homographGapRows` builds it
(exact NFC spelling, alternates included). Then it was widened to
every entry within six rids whose consonants match.

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
   missing numerals, once each. D only for the Hebrew/Aramaic verb
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

