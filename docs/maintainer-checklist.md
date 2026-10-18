# Maintainer checklist: what waits on you

What is left for you before go-live. By your ruling of 2026-10-18,
under your blocker definition
([`review-ledger.md`](review-ledger.md) § Definitions), this file keeps
the pre-publication items, the answers that change a `headwords[0]`:
the URL name is computed from it, and a name changed after go-live
costs a redirect forever (U6; redirects are unbuilt, L23). That is
§ Cross-reference spellings and § X11, 19 blocks. The 8
cross-reference numeral questions you answered on 2026-10-18 stay too,
since the work is done; the other 40 and the 3 scan reads for L65–L66
moved, byte for byte, to [`post-go-live-review.md`](post-go-live-review.md),
to be worked after go-live as GitHub issues. Each block asks one
question: tick ONE box per bullet, and write a `note:` only where the
box you tick asks for one. A block's `Recommendation:` is a default
you can accept by ticking the box it names. When you are done, say
"checklist done", and a PR applies the ticks: an answer that changes
the data becomes a reviewed patch, and a "kept", "no word" or "can't
tell" is recorded instead (a reviewed-kept record or the review ledger
row), as each section's status says. The last section is not ticks: it
is rows for you to paste into #153 (five of them are already there and
are listed for reference). A ticked item leaves this file when a PR
applies it, and the paste rows once you say they are posted; its
history (the answer, what was written, the patch ids) lives in the
worklists ([`headword-worklist.md`](headword-worklist.md),
[`sense-worklist.md`](sense-worklist.md)) and the tranche READMEs under
[`admin/pipeline/patch/records/tranches/`](../admin/pipeline/patch/records/tranches/).
Started 2026-10-16 (PR #186) by moving the open sections out of
`headword-worklist.md`; `sense-worklist.md` has no unticked question.

| section | items | source PR | ledger row |
|---|---|---|---|
| [Cross-reference spellings (2026-10-16)](#cross-reference-spellings-2026-10-16) | 17 blocks, 19 entries | #184 | L72 |
| [X11: one-letter primaries (2026-10-15)](#x11-one-letter-primaries-2026-10-15) | 2 blocks | #181 | L39 |
| [Cross-reference numerals: answered 2026-10-18 (8)](#cross-reference-numerals-answered-2026-10-18-8) | 8 questions, 9 cites, all ticked | #173 | L64 |
| [Textual-research candidates (for #153)](#textual-research-candidates-for-153) | 18 rows to paste (23 listed; 5 already in #153) | #181 | L47 |

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

## Cross-reference numerals: answered 2026-10-18 (8)

**Status:** you ticked these 8 questions (9 cites) on 2026-10-18
(commit `963e28b2b`); a data PR applies them. The other 40 questions
of the 2026-10-14 list (65 cites) moved to
[`post-go-live-review.md` § Cross-reference numerals (2026-10-14)](post-go-live-review.md#cross-reference-numerals-2026-10-14)
by your ruling of 2026-10-18, with the section's intro and how to read
the blocks.

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
  - [x] yes: Gesenius's `אָוָה III`; remove the link, keep the text (case 1, silent: 08-15's linker overreach)
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
  - [x] something else (say what in the note)
  - [ ] can't tell from the scan
  - note: It is the number 1 referencing a sense. OCR error

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
  - [x] yes, and print sets no numeral: A02378 takes I from this cite (case 2: annotated `printed: ''`); retarget the cite
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
  - [x] kept as printed: no numeral on either (case 3: `kept` on the cite)
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
  - [x] yes: move it onto the form (`reform.homographs` + `replace` removing ` I` from the gloss head, case 1) and retarget H00303's cite to C00577
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
  - [x] yes: the link stays; print's `I` is kept (case 3: a `kept` annotation on each cite)
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
  - [x] yes: retarget to C01130 (case 1); C01130's `ה` goes to the headword list as an OCR question
  - [ ] no (say which in the note)
  - [ ] can't tell from the scan
  - note: 1130 correct letter is chet, OCR error

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
  - [x] H00614 `חֲטִי` (`ch. same` of `חָטָה I`): retarget; no numeral set on it
  - [ ] H00614, and it takes I (case 2, annotated)
  - [ ] H00613 `חָטָה I`: retarget there
  - [ ] can't tell from the scan
  - note: 

Recommendation: H00614, retarget only (medium): its spelling and meaning (tender) match; the family's Hebrew numbering I, II is complete, so no gap needs the text to fill it.

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
