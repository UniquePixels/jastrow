# 01 — Broken sense-number sequences (72 entries)

**Set:** every entry whose top-level sense-number sequence is not
`1, 2, …, n` (census report `.brokenSequences`; design doc §7 —
"upstream damage (spurious/missing `N)`) — eyes-on"), classified by
what the break looks like (correction pass, verified finding: the 72
aren't one class — see the class sections below).

**How to read a row:** *Observed sequence* is the leading integer of
each top-level `sense.number` token in encounter order. *Labels in
context* shows, for each labeled sense, the tag-stripped tail of the
text immediately preceding it — where a swallowed or spurious number
usually hides — followed by the label token itself in bold.

**Decision to record per row:** what migration should do with the
entry's numbering (accept as printed / hand-fix / other).

**Section decisions (maintainer review 2026-08-05, recorded in the
design-doc changelog):** crossref-chop and citation-chop rejoins
approved for all 36 rows (blank cells inherit the section's "ALL
approved"); numbering-gap rows hand-verified against print — per-row
notes below drove the `repairs.ts` dispositions (marker reinserts,
implied-`1)` inserts, deferrals D00470/K00081/R00519). The
no-byte-change rows are superseded 2026-08-06: the swallowed-marker
class must be structurally split (sense-structure-repair design spec,
follow-up branch).

## Crossref-chop — phantom sense from a chopped cross-reference (35 entries)

the upstream sense segmentation chopped a parenthesized cross-reference —
e.g. `(v. אוֹר 2)` — at its own `N)`, splitting one printed flow
into a fake sense boundary. Proposed disposition: heal at
migration by rejoining into the preceding text.

| Rid | Headword | Observed sequence | Labels in context | Decision |
| --- | --- | --- | --- | --- |
| A00913 | אוּרְתָּא | 2 | (v. אוֹר **2)** | ALL approved |
| A01662 | אַךְ II | 2 | (v. אָנַךְ **2)** |  |
| A03104 | אֲרֵיכוּתָא | 2 | (v. אֲרִיךְ II, **2)** |  |
| A03277 | אָשׁוּת | 2 | ed. f. (b. h. אֵשֶׁת Ps. LVIII, 9; אוש or אשש, v. אשש **2)** |  |
| B00534 | בְּטַשׁ | 2 | (v. בְּטַט **2)** |  |
| B00656 | בִּינְתָא II | 2 | (בִּינִיתָא Ar. s. v. בין **2)** |  |
| B00991 | בְּסִימָא | 2 | (v. preced. **2)** |  |
| H00709 | חִיטּוּיָא | 2 | (v. preced. **2)** |  |
| I00137 | טַוְורוֹס | 2 | (Ταῦρος) Taurus Amanus (v. אֲמָנָה II, **2)** |  |
| I00149 | טוֹטָפֶת | 2 | in pl.; = טפטפ׳, v. טִיפְטֵף **2)** |  |
| I00753 | טִרְטֵט | 2 | (טרט = רטרט, cmp. גִּעֲגֵעַ; v. טָרוּט **2)** |  |
| H00871 | חִירָה | 2 | …vernous rocks resembling human figures. Mekh. B’shall. s. 1 (ref. to Pi-Haḥiroth, Ex. XIV, **2)** |  |
| J00301 | יָחַס | 2 | (entry start) **2)** |  |
| K01188 | כְּרָךְ | 2 | c. (v. כְּרַךְ **2)** |  |
| L00346 | לְחָיָיתָא | 2 | (v. לִחְיָא **2)** |  |
| N00327 | נְוַול ³ | 2 | (v. ֵבֶל ch. **2)** |  |
| N00740 | נִיפָר | 2 | (Assyr. Nipur, modern Niffer, v. Schr. KAT.2, p. 57 **2)** |  |
| O00821 | סִיקְרָא II | 2 | (v. סָקַר II, a. P. Sm. p. 272 **2)** |  |
| O01360 | סְפִינָה | 2 | (entry start) **2)** |  |
| O01397 | סַפְסָל | 2 | (v. סֵפֶל **2)** |  |
| N01381 | *נְתַךְ II | 2 | (v. P. Sm. 2480; cmp. נָתַח Pi. **2)** |  |
| P00286 | עוֹמְקָן | 2 | (v. עוּמְקָא I, **2)** |  |
| P00539 | עִיטְרָא | 2 | (v. עִיטּוּר **2)** |  |
| R00096 | צְדוּקִי | 2 | (v. צָדוֹק **2)** |  |
| P00805 | עֲלִילוּת | 2 | (preced., v. עֲלִיל **2)** |  |
| P00859 | עָמָד I | 2 | (v. עָמַד II, **2)** |  |
| P01088 | עֵץ | 2 | (entry start) **2)** |  |
| P01094 | עֶצֶב | 2 | (entry start) **2)** |  |
| P01436 | עֲרָפֶל | 2 | (entry start) **2)** |  |
| Q02145 | פַּתָּח | 2 | (פָּתַח Pi. **2)** |  |
| S01040 | קֵינַי | 2 | (v. קוּן; cmp. תובל קין Gen. IV, 2 **2)** |  |
| U00261 | שָׂדֶה | 2 | c. (b. h.; cmp. שָׂדַד; v. Del. Assyr. Handw. s. v. šid(d) u, p. 64 **2)** |  |
| U00398 | *שְׁוִיָּה | 2 | (v. שָׁוָהPi. **2)** |  |
| V00166 | תּוֹהוּ ² | 2 | (v. תָּהָה **2)** |  |
| U01674 | שָׁעַן | 2 | שאן, P. Sm. 401 **2)** |  |

## Citation-chop — phantom sense from a chopped citation (1 entry)

the upstream sense segmentation chopped a citation — e.g. `(play on X, Gen.
XLI, 2)` — at its own `N)`, splitting one printed flow into a
fake sense boundary. Proposed disposition: heal at migration by
rejoining into the preceding text.

| Rid | Headword | Observed sequence | Labels in context | Decision |
| --- | --- | --- | --- | --- |
| C00244 | גָּדַר | 1, 2, 4 | v. גדד I) **1)**<br>… 13 כרם ג׳ בציפורי (Var. גדול; R. S. to Shebi. VI, 4 גריד) a ruined vineyard in Zepphoris. **—2)**<br>…u repair our breaches (relieve us); B. Bath. 91ᵇ.—Lev. R. s. 1 (play on Abigdor I Chr. IV, **4)** | approved |

## Numbering-gap — genuinely missing/odd numbering (35 entries)

Genuinely missing/odd numbering — eyes-on.

| Rid | Headword | Observed sequence | Labels in context | Decision |
| --- | --- | --- | --- | --- |
| A00675 | אוּלָם II | 2 | …eub. Géogr. p. 18; 261) Ulam (Porta) a place in Gilead, and one in Galilee. Y. Snh. X, 28ᵈ **—2)** | ```p. 18; 261) <i>Ulam</i>``` Add space between 6 and 1 |
| A01350 | אִימַּר | 1, 3, 4 | (אמר, √אם, v. אמם; cmp. עמרא, חומרא, צמר) **1)**<br>…e their bandages all at once and tie them up all at once, but he attends to one at a time. **—3)**<br>fringe, border. Targ. Ps. CXXXIII, 2. Targ. Y. Ex. XXVI, 4 (Var. אֶימְרָא). V. next w. **—4)** | ```(Sarah) not even with one.—2) (cmp. חוּמְרָא) ``` |
| A01989 | אַמָּה | 1, 3, 4 | , v. אֵם) **1)**<br>…ן) land for a creek or pond for watering cattle and washing clothes, of one cubit’s width. **—3)**<br>(= אצבע) membrum virile. Sabb. 108ᵇ. Nidd. 13ᵃ sq. B. Kam. 19ᵇ **—4)** | ```v. however, infra. 4).—2) cubit, a``` |
| A03089 | אַרְיוֹךְ | 2 | (Gen. XIV, 1) Aryokh, homiletic surname of Nebuzraddan. Lam. R. to V, 5 (allusion to ארי). **—2)** | ```<i>Aryok</i>, homiletic surname``` Source data is missing 1) which should be inserted ```</i>, 1) homiletic``` (Verified via print endition) |
| B01321 | בַּרְקַאי II | 2 | , v. בּוֹרְקַי II. **—2)** | See note 1 |
| C00062 | גְּבוּרָה | 1, 3 | (entry start) **1)**<br>…׳ Divine Majesty, the Lord. Sabb. 87ᵃ. Ib. 88ᵇ, a. fr. מפי הג׳ from the mouth of the Lord. **—3)** | ```a. fr.— הַגְּ׳ <i>Divine Majesty,``` Source data missing 2) which should be inserted ```a. fr.—2) הַגְּ׳ <i>Divine Majesty,``` (Verified via print edition) |
| C00328 | גַּוָּוזָא I | 1, 3 | (גוז) = h. גֶּזַע, **1)**<br>…nches spreading beyond the circumference of the tree (Rashi: on pegs reaching beyond &c.). **—3)** | ```[Rashi: chest, v. גּוּזָּא].—2) [that which is cut off,] branches; [that which is chopped,] wood``` |
| E00024 | הֲבָאָה | 1, 3 | (בּוֹא) **1)**<br>…inging about, making. Peah I, 1 הבאת שלום וכ׳ making peace between &c.; Yeb. 109ᵃ; a. e.—[ **3)** | ```instalments.—2) bringing about``` |
| C01331 | גְּרִיוָא | 2 | …., v. Rabb. D. S. a. l. note 1). Pes. 32ᵃ. Ned. 51ᵃ כל ג׳ וכ׳ whatever measure I may want. **—2)** | ```the hand-mill (cmp. I גָּרָב 1),] griva, a ```source data missing 1) which should be ```the hand-mill (cmp. I גָּרָב 1),] 1) griva, a ```confirmed in print version |
| D00470 | דִּיבּוּר | 2 | …R. s. 38 ד׳ אחדים mysterious words (accounts), v. אֶחָד. Cant. R. l. c.; a. fr. V. דָּבָר. **—2)** | I believe the existing 2) sense in source data, is actualy a second sense of the plural with an implicit 1) which we will add for this project.  Confirm - confirmed, per proposal, 2026-08-06  |
| C00581 | גְּזֵרָה | 1, 3, 4 | (entry start) **1)**<br>…on. Sabb. 145ᵇ to reflect איזו ג׳ קשה אביא וכ׳ what hard dispensation to send them; a. fr. **—3)**<br>…ch thou (the Lord, in the Torah) &c. Pes. 87ᵇ, v. אֲרָם; a. fr.—M. Kat. III, 3, v. גָּזָר. **—4)** | ```precipice.—2) decree, edict,``` |
| H00301 | חוֹטָם | 1, 3, 4 | (חטם, v. חתם) [seal, mark,] **1)**<br>…39ᵃ ניקבו ח׳ וכ׳ if the partitions of the nostrils are perforated into one another.—Trnsf. **3)**<br>… the two bowls had cavities (outlets) like two slender snouts, v. דָּקַק (v. Rashi a. l.). **—4)** | ``` v. חוּט III.]—2) the oblate part``` |
| H01701 | חֲרִישָׁה II | 1, 3 | (entry start) **1)**<br>…is not possible to cause deafness without afflicting a wound, a drop of blood &c.; ib. 98ᵃ **—3)** | ``` (with ref. to Num. XXX, 5; 8; 12) ; v. שְׁתִיקָה.—2) (חָרַשׁ II Pi.) making ```bidi is messing up this text, verify it. |
| G00655 | זָקַר | 2 | …זוֹקְרוֹ בת וכ׳ Ar. a. Mss. M. 2 a. O. (ed. זורקו, v. Rabb. D. S. a. l. note), v. בַּת II. **—2)** | 1151) to thrust, fling source data is missing should be 1151) 1) to thrust, fling verified in print text |
| J00501 | יִפָּה | 1, 3 | (entry start) **1)**<br>… on the Sabbath. Pesik. S’liḥoth, p. 166ᵃ יַפֵּה כחך improve thy strength (by practicing). **—3)** | Temple?—2) to improve  |
| K00081 | כָּבַשׁ | 1, 2, 4, 6, 7, 8 | (entry start) **1)**<br>…ן על וכ׳ a mountain on each side pressing upon (preventing the run of) the springs; a. fr. **—2)**<br>…בוּשִׁין. Pes. II, 6. Y. Sabb. I, 3ᶜ bot. כְּבוּשֵׁיהֶן preserves made by gentiles; a. fr. **—4)**<br>…, s. 4. Gen. R. s. 8, end האיש כּוֹבֵשׁ וכ׳ the man detains his wife from going out; a. e. **—6)**<br>… forgive, cause forgiveness. Pesik. Eth Korb., p. 61ᵇ; Pesik. R. s. 16, v. כֶּבֶשׁ; a. fr. **—7)**<br>… R. to VII, 7 [read:] הרי הוא כּוֹבְשֵׁנִי וכ׳ behold, he is attacking me in thy presence. **—8)** |  כ׳ פנים (בקרקע) is displayed correct here but not in app - Chald.).—3) to press - to detain (cmp. עצר)this starts a seperate section in the app but does not have the 5 label. - Also note that this entry ruins my theory about Pl being  a seperatley numberd section - Resolved 2026-08-07 (maintainer print verification): print reads "Yalk. Sam. 112.—5) to detain", so the detain sense's lost label is a reinsert (assign —5), no deviation); the in-text —3) splits per S1. Open sub-question: sense 4's tail segment "v. Rabb. D. S. a. l. note 6); Yalk. Gen. 145; Yalk.Sam. 112." appears twice in data — print duplication check pending. |
| M00252 | מִדָּה | 1, 2, 4 | preced.) **1)**<br>…(measurements of the Temple), name of a treatise of the Mishnah, of the order of Kodashim. **—2)**<br>…. Bab. B. Kam. 27ᵇ). Y. Ber. II, 5ᵃ bot. ולמ׳ הד׳ but civil law (questions of possession). **—4)** | Rashi: מעמיד); a. fr.—3) manner, ways, ch |
| N01153 | נָקַאי | 2 | …. to X, 8 קליה דינ׳ ס׳; Yalk. Gen. 133 דנקא׳; Pesik. B’shall., p. 90ᵃ דמינקי (corr. acc.). **—2)** | Bibl. I, p. 61); נ׳ ספרא N. source missing should be Bibl. I, p. 61);  1) נ׳ ספרא N. |
| N01155 | נָקַב | 1, 3 | (entry start) **1)**<br>…?… perhaps it means to perforate? Ib. למימרא דנוקב וכ׳ to indicate that noḳeb means curse. **—3)** | , v. נֶקֶב.]—2) (cmp. אָרַר)  |
| O00120 | סְגֵי | 2 | …סְגִיאוּ; Yalk. Job 920 מדסגן … סְגִיאוּ. Sot. IX, 15 (49ᵇ) יִסְגֵּא, v. חוּצְפָּא; a. fr. **—2)** | , 11) to swell, rise source missing should be , 11) 1) to swell, rise |
| O00321 | סוּלָּם | 1, 3 | (entry start) **1)**<br>…ladder, put on the ass to prevent him from scratching a sore. Sabb. V, 4 (54ᵇ), v. לוֹעָא. **—3)** | kings; a. fr.—2) a yoke |
| Q00547 | פָּטַר | 1, 3, 4 | (b. h.) **1)**<br>…the letter of divorce may not date farther back than (the conception of) her child; a. fr. **—3)**<br>…ref. to Gen. XXXII, 27) הרי יעקב פוטר למלאך behold, Jacob gives leave to the angel; a. fr. **—4)** | ; ib. 47ᵃ.—2) to send off |
| Q00997 | פָּלַט | 1, 2, 4 | (b. h.) [to break through,] **1)**<br>… semen virile. Pes. 118ᵇ פְּלוֹט אותן ליבשה throw their bodies out on the dry land; a. fr. **—2)**<br>…h. 19ᵇ (ref. to פלטיאל, II Sam. III, 15) שפלטו אל מן וכ׳ for God saved him from sin; a. e. **—4)** | V. פָּלֵט.—3) to save. Pir |
| P00882 | עֲמִידָה II | 1, 3, 4 | (עָמַד) **1)**<br>…en times was the Tabernacle (at its consecration) put up, and six times taken apart; a. e. **—3)**<br>… sand into the cement, it will not last; so the nations cannot exist without Israel; a. e. **—4)** | Presence.—2) putting up, |
| P01426 | עָרַף | 1, 3, 4 | (b. h.) **1)**<br>…lar is worthy, he is like dew; if unworthy, drop him like rain; Yalk. Deut. 942 עָרְפֵהוּ. **—3)**<br>…her head from behind with a hatchet.—Part. pass. עָרוּף; f. עֲרוּפָה.—עגלה ע׳, v. עֶגְלָה. **—4)** | Denom. עוֹרֶף.—2) (cmp. קָטַף a. |
| R00519 | צָלַל | 1, 2, 4 | (entry start) **1)**<br>to move, shake, hang over; denom. צֵל. **—2)**<br>…en; Pesik. R. s. 18 שצליל עליהם corr. acc.); Yalk. Jud. 62, Yalk. Lev. 643 (corr. acc.).—[ **4)** | v. infra.—3) (cmp. שָׁקַע) to settle,  - there is also an issue with sense 4, the printed text is \[4) to glisten, be bright; (of sound) to vibrate, ring; v. מְצִילָּה, צִלְצֵל &c.] … the [ is attached to the end of the previous. - confirmed, per proposal, 2026-08-06 |
| R00536 | צֵלָע | 1, 3 | v. צָלַע) **1)**<br>…e of a hill or rock.—Pl. as ab. Shebi. V, 4; Y. ib. 36ᵃ top צִילְעוֹת constr., v. פּוּאָה. **—3)** | es; a. fr.—2) side |
| Q01974 | פִּרְצָה | 1, 4 | (פָּרַץ) **1)**<br>…3) sect.—Pl. as ab. Ab. d’R. N. ch. V ונפרצו מהם שתי פ׳ and two sects proceeded from them. **—4)** | source missing text - (by charity); a. fr.— lawlessness, sould be (by charity); a. fr.—2) lawlessness, - v. פָּרַץ.]—3) sect.—Pl. as  |
| Q02162 | פְּתִיחָה | 1, 3 | (פָּתַח) **1)**<br>…offering reasons for regretting a vow. Y. Ned. VIII, end, 41ᵃ; Y. Naz. VII, 52ᵃ top; a. e. **—3)** | source missing text  (Ez. XXXVII, 1; a. fr.— פְּתִיחַת נדר (v. פָּתַח) offering should be …  (Ez. XXXVII, 1; a. fr.—2) פְּתִיחַת נדר (v. פָּתַח) offering |
| S00490 | קוֹפָא II | 2, 3 | …ever, carrying pole. Targ. Y. Num. IV, 12 (h. text מוֹט). Targ. Y. II ib. XIII, 23 קוֹפָה. **—2)**<br>…old trunk.—Pl. קוֹפָאֵי. B. Bath. 24ᵃ בי ק׳ (Ms. F. קַפָּאֵי) between the trunks of vines. **—3)** | source missing text P. Sm. 3551) lever, carrying pole should be P. Sm. 3551) 1) lever, carrying pole |
| S02265 | קֶשֶׁר | 1, 3 | preced.) **1)**<br>…t. עד קישרי אצבעותיו to the second joints of the fingers, contrad. to פֶּרֶק, q. v.; a. e. **—3)** | end, 23ᵃ קִישְׁרֵי המלחמות.—2) protuberance, joint |
| U00764 | שֶׁטֶף | 1, 2, 3, 5 | (entry start) **1)**<br>…e him, for they know that there is passion in his judgment; Yalk. Ps. 843; Y. Ber. IX, 14ᵇ **—2)**<br>…res only rinsing in order to be restored to Levitical cleanness. Ḥull. 25ᵃ; Zeb. 3ᵇ; a. e. **—3)**<br>…ib. 115 אין לך … מהש׳ וכ׳ there is no smell more offensive than that of washed goat-skins. **—5)** | by washing.—4) ש׳ של עזים goat-skin |
| U01556 | שֵׁן | 1, 3, 4, 5 | c. (b. h.; **1)**<br>…Nidd. 41ᵇ. Ḥull. 16ᵇ שיניו נושרות the glands of his rectum will fall off; Sabb. 82ᵃ; a. e. **—3)**<br>… (the stone which Jacob put up was) as large as the peak of Tiberias; Yalk. ib. 130; a. e. **—4)**<br>…rble?); אין שן אלא לשון חזק וכ׳ shen has the meaning of strong (ref. to Cant. V, 14); a. e **—5)** | missing text - ); a. fr.— any organ of t should be...); a. fr.—2) any organ of t |
| V00704 | תָּמָר I | 1, 3 | (b. h.) pr. n. f. Tamar, **1)**<br>…I) may be read and translated. Ab. V, 16 אהבת אמנון ות׳ Amnon’s love of T. Snh. 21ᵃ; a. e. **—3)** | missing text -  s. 85; a. fr.— Absalom’s sister. should be... s. 85; a. fr.—2) Absalom’s sister. |
| V00765 | תָּסַס | 1, 3 | (onomatop.) [to hiss,] **1)**<br>…an to spurt fire; Gen. R. s. 77 (corr. acc.); Yalk. ib. 132 התחילה האש תוססת (corr. acc.). **—3)** | missing text -  a. fr.— to spurt. Cant. R should be…  a. fr.—2) to spurt. Cant. R |
| J00515 | יָצָא |   |                       | Hifil missing sense 4 ``` v. supra.—4) to produce ``` |
| A01194 | אֵיזֶה |   |                       |      Missing ) after b.h     |
| D00072 | דָּבֵק |   |                          |      Sodomites.—2) to join,  and See Note 1     |

**Note 1:** “So the convention (or at least Jastrow's consistent typographic habit) is: **when sense 1 is only a cross-reference tucked right after the grammatical label, the "1)" is omitted and the next sense opens with "—2)"**. Whether that's deliberate style or sloppy typesetting on Jastrow's part is unknowable `[conf:med]`, but the print you photographed matches the data exactly — Sefaria transcribed it faithfully.”
39 Occurrences - We should add sense 1 our selves, and note in the doc to send to Sefaria, noting the issue and that we are surfaceing for them in case they want to do something themselves.
This surfaces something else we need to add, I want feedback on this, but my first feeling is to create a notes field in the data, that can be used to track intentional modifications from the Jastrow source and why.  These notes could then be indicated with some kind of icon and maybe tooltip or popup dialog.  I would like to tie the notes to the location in the text they go, so maybe a markup tag as well?  These would not be for tracking adjustments made to the source data due to import errors, etc, only deviations from the printed text.



## Unclassified (1 entry)

Doesn't fit the measured phantom-sense or numbering-gap
patterns — eyes-on.

| Rid | Headword | Observed sequence | Labels in context | Decision |
| --- | --- | --- | --- | --- |
| C01169 | גַּסְטְרָא | 2 | …ְטְרָיוֹת. Gen. R. s. 28 אריות ג׳; Yalk. ib. 47 חיילות גי׳, read אהליות וג׳, v. אָהֳלִית.— ***2)** | Confirmed, sense 1 is implied, however I dont think for the same reason as note 1.  The fact that sense 2 is labled *2 says to me there is a specific something special about 2 but I dont know what that * ist trying to indicate. |
