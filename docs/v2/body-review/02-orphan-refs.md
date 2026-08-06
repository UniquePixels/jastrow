# 02 — Orphan refs items (29 items)

**Set:** the `refs`-field items with no inline citation basis (design
doc §5, decision B7 — refs dropped from truth, index derived at
compile). Pre-annotated with the §5 dispositions; the Decision column
records maintainer confirmation (or override) of each.

## Class 1 — unlinked gershayim cross-refs (21 items)

§5 disposition: internal cross-references to gershayim-abbreviation
headwords whose target text sits unlinked in the body — **fixed by
wrapping the text in `<cite ref>`** (hand pass, listed in the
migration report). The source anchors exist, but the gershayim `"`
inside `href`/`data-ref` breaks the attribute, so the link never
resolves. *Context* shows the in-body target text in bold.

| Rid | Headword | Orphan refs item | Context | Decision |
| --- | --- | --- | --- | --- |
| A01069 | אט"בח | Jastrow, א"ט 1 | v. **א"ט**  | ALL Approved |
| A01940 | אַלֶּפְבֵּיתָא | Jastrow, אלפ"א 1 | m., pl. אַלֶּפְבֵּיתִין same. Koh. R. to I, 13; v. **אלפ"א**  |  |
| B00752 | בִּית | Jastrow, בי"ת 1 | …he wanted to stay over night; a. e.—Part. בָּאֵית. Targ. Is. LVIII, 5. **same** . Erub. 73ᵃ (opp. to taking meals). to k… |  |
| B00757 | בי"תא | Jastrow, בי"ת 1 | , v. **בי"ת**  |  |
| D00791 | דכ"ץ | Jastrow, אח"ס 1 | , v. **אח"ס** . Sabb. 104ᵃ ד̇כים הם כ̇נים הם צ̇דיקים ה… |  |
| C00473 | גּוּר I | Jastrow, ג"ר 1 | …גּוּר וכ׳ בשני to dwell (simultaneously) in two worlds? Sabb. 104ᵃ, v. **ג"ר** . Sifré Deut. 301 (ref. to Deut. XXVI, 5… |  |
| C01224 | ג"ר | Jastrow, א"ת 1 | , a transmutation of letters, v. **א"ת** . Sabb. 104ᵃ גוֹפו טימא אר̇חם עליו thoug… |  |
| C01225 | גֵּר | Jastrow, ג"ר 1 | m. (b. h.; גּוּר) a dweller. Sabb. 104ᵃ, v. **preced.** a stranger. Tanḥ. Vayigg. 4 גרא שנעשה ג׳… |  |
| E00326 | ה"י | Jastrow, ה"א 1 | , v. **ה"א**  |  |
| C01036 | גמ"ל | Jastrow, גימ"ל 1 | , v. **גימ"ל**  |  |
| E00686 | הִנָּם | Jastrow, ה"א 1 | m. (homiletically = חִנָּם; v. **ה"א** ) gratuitous, purposeless act, vanity. E… |  |
| M01200 | מ"ים | Jastrow, מ"ם 1 | , pl. מֵימִין, v. **מ"ם** . |  |
| M01490 | מל"ה | Jastrow, דל"ה 1 | , Y. Naz. II, 51ᵈ bot., v. **דל"ה**  |  |
| M01690 | ממתו"ס | Jastrow, אאלר"ן 1 | …s of three letters each (Dan. V, 25). Snh. 22ᵃ; Cant. R. to III, 4; v. **אאלר"ן**  |  |
| J00083 | יגי"ל | Jastrow, יג"ל 1 | , v. **יג"ל**  |  |
| N00910 | ננקפ"י | Jastrow, אאלר"ן 1 | …ous word made up of every second letter in מנ̇א מנ̇א תק̇ל ופ̇רסי̇ן, v. **אאלר"ן**  |  |
| P00169 | עד"ש | Jastrow, דצ"ך 1 | , v. **דצ"ך**  |  |
| P00600 | עי"ן | Jastrow, עיי"ן 1 | , v. **עיי"ן**  |  |
| Q00002 | פ"א | Jastrow, פ"ה 1 | the letter Pe, v. **פ"ה** . |  |
| U02063 | שֵׁשַׁךְ | Jastrow, א"ת 1 | …shach, surname of Babylonia (supposed permutation of בבל by Atbash, v. **א"ת** ). Num. R. s. 1821, v. א"ת. Meg. 6ᵃ, v. … |  |
| V00042 | תבט"ש | Jastrow, תבש"ט 1 | , v. **תבש"ט**  |  |

## Class 2 — resolved-but-unlinked ibid citations (5 items)

§5 disposition: **fixed the same way** (wrap in `<cite ref>`), with
the resolution taken from the old refs value. *Context* shows the
unlinked in-body ibid text in bold; the *Orphan refs item* column is
the resolution the old refs field recorded for it.

| Rid | Headword | Orphan refs item | Context | Decision |
| --- | --- | --- | --- | --- |
| P00331 | עוּקָה | Eruvin 88b:1 | …כ׳ a pit (in the court for receiving waste water) containing two S’ah. **Ib. 88ᵇ** ע׳ מחזיק וכ׳ (masc.). Tosef. ib. IX (VI), 18. Mikv. VI, 1 עוּקַת המערה… | ALL Approved |
| P00331 | עוּקָה | Eruvin 88b:17 | …כ׳ a pit (in the court for receiving waste water) containing two S’ah. **Ib. 88ᵇ** ע׳ מחזיק וכ׳ (masc.). Tosef. ib. IX (VI), 18. Mikv. VI, 1 עוּקַת המערה… |  |
| P00331 | עוּקָה | Eruvin 88b:22 | …כ׳ a pit (in the court for receiving waste water) containing two S’ah. **Ib. 88ᵇ** ע׳ מחזיק וכ׳ (masc.). Tosef. ib. IX (VI), 18. Mikv. VI, 1 עוּקַת המערה… |  |
| P01404 | עֶרֶס | Targum Jerusalem, Exodus 21:18 | ch. same. Targ. O. Deut. III, 11. Targ. O. Ex. VII, 28. Targ. Y. II **ib. XXI, 18** ; a. fr.—תשמיש (ד)ע׳ sexual connection. Targ. Y. II ib. XIX, 15 (Y. I … |  |
| S01230 | קַל II | Yoma 85b:14 | …ק׳ for minor transgressions (to which the lowest penalty is attached); **ib. 85ᵇ** אלו הן ק׳ וכ׳ these are the minor transgressions: omission of a positi… |  |

## Class 3 — unexplained, eyes-on (3 items)

§5 disposition: **maintainer eyes-on at migration review** — no
in-body basis was found for these at audit. *Context* shows the entry
opening for orientation.

| Rid | Headword | Orphan refs item | Context | Decision |
| --- | --- | --- | --- | --- |
| D00541 | דְּיוֹר | Yoma 2a | m. (דור) dwelling, esp. temporary residence, lodging. Y. Erub. V, 23ᵃ top לשם דייר as a lodging place; a. e.—Pl. דְּיוֹרִים, דְּיוֹרִין. Ib.… | ALL Remove |
| M01355 | מִכְוַור | Rosh Hashanah 23b | pr. n. Mikhvar, Makhvar, a district of Peraea. [The situation of Machaerus forbids its identification with our w.] Targ. Y. I Num. XXXII, 1,… |  |
| Q00890 | פִּיתּוּחַ | Yoma 2a:3 | m. (b. h.; פָּתַח Pi.) incision, engraving, engraved design. Y. Nidd. III, 50ᵈ פ׳ ידים ורגלים וכ׳ it (the embryo) has no incisions indicatin… |  |

I believe these were added as links through the Sefaria interface by a user.  There is probably some idea linkage, but for us, we are only concerned with showing what Jastrow linked.
