# Primary headword order worklist

A one-off review list. Generated 2026-11-09 from `data/entries/` at the v2
commit `251a6e264`.

**Review paused 2026-11-13** after the first 15 entries (the first 15 under
א): 14 were print as set, 3 of them marked ambiguous, and one was a real
error, A00055, patched as P000955. Jastrow or the printer sets a good number
of headwords out of strict order, so the list is mostly print, not error.
The rest is left for later, tracked in issue #240.

**186 of 32,512** primary headwords are out of alphabetical order against rid order.

## How to use it

For each entry, open the scan and compare the headword with print. Scan
links open the UB Frankfurt (Freimann) copy, which is sharper than the
Internet Archive one; a page Frankfurt lacks links to Internet Archive.

- If the headword is right, tick **No change**.
- If it is wrong, write the right form after **Correction:**.
- If the entry is right and a **neighbour** is wrong, tick **No change** and
  note the neighbour's rid and right form after **Correction:**. A flag only
  says two words disagree, not which one is wrong.

Claude makes the patches from this file once it is reviewed.

## How the list was made

- Each entry's `headwords[0]` is reduced to its Hebrew letters, final
  letters read as regular letters.
- A leading `וו` reads as one `ו`, as Jastrow sorts it. That exempts the
  double-vav entries.
- The flagged entries are the fewest that, once removed, leave every other
  entry in order (longest non-decreasing subsequence), so one misplaced word
  does not flag everything after it.

**What it cannot see:** a wrong letter that still sorts into the right place.
A clean list does not prove the headwords are correct.

## א (A)

### A00037 `אבדימי`

- Between: `אבדומא` (A00036) and `אֲבַדּוֹן` (A00038)
- Scan: [p. 3a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265146)
- [x] No change - Ambiguous, cant confirm 100
- Correction:

### A00055 `אִיבּוּב`

- Between: `אִבּוּ` (A00054) and `אַבּוּב` (A00056)
- Scan: [p. 3b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265146)
- [ ] No change
- Correction: Swap with alt headword, wrong order
- Patched: P000955 (headwords `[אַבּוּב ², אִיבּוּב]`; Sefaria appendix row)

### A00210 `אַבְרוּיֵי`

- Between: `אברגני` (A00209) and `אַבְרַוְורֵי` (A00211)
- Scan: [p. 9a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265152)
- [x] No change - Ambiguous, cant confirm 100
- Correction:

### A00319 `אגניטוס`

- Between: `אַגָּנָא` (A00318) and `אגנטין` (A00320)
- Scan: [p. 13a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265156)
- [x] No change - Ambiguous, cant confirm 100
- Correction:

### A00597 `אַוותֶּנְטְיָא`

- Between: `אוותנטי` (A00596) and `אַוְותֶּנְטִי` (A00598)
- Scan: [p. 23b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265166)
- [x] No change
- Correction:

### A00895 `אוּרִית`

- Between: `אוֹרַיְיתָא` (A00894) and `אוֹרַיְתָא` (A00896)
- Scan: [p. 34b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265177)
- Note: a neighbour is flagged too
- [x] No change
- Correction:

### A00896 `אוֹרַיְתָא`

- Between: `אוּרִית` (A00895) and `אוריכות` (A00897)
- Scan: [p. 34b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265177)
- Note: a neighbour is flagged too
- [x] No change
- Correction:

### A01295 `אִילְיֵין`

- Between: `אִילֵּימָא` (A01294) and `אילין` (A01296)
- Scan: [p. 49b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265192)
- [x] No change
- Correction:

### A01346 `איממריי`

- Between: `אִימְנוֹן` (A01345) and `אִימְצִי` (A01347)
- Scan: [p. 51a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265194)
- [x] No change
- Correction:

### A01724 `אַכְסְיוֹמָא`

- Between: `אָכְסִיגָרוֹן` (A01723) and `אכסיוט` (A01725)
- Scan: [p. 64b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265207)
- [x] No change
- Correction:

### A01729 `אַכְסִילְגּוֹס`

- Between: `אכסיריה` (A01728) and `אַכְסִלְגְּיָא` (A01730)
- Scan: [p. 64b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265207)
- [x] No change
- Correction:

### A01881 `בֵּי אֱלִישָׁפָט`

- Between: `אֶלִישָׁע` (A01880) and `אַלְיָת` (A01882)
- Scan: [p. 70a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265213)
- Note: first letter is not this section's letter
- [x] No change
- Correction:

### A01949 `אֱלָקָא`

- Between: `אִלְקָטִית` (A01948) and `אלקים` (A01950)
- Scan: [p. 73b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265216)
- [x] No change
- Correction:

### A02002 `כְּפַר א׳ אָמוּס`

- Between: `אֱמוּנָה` (A02001) and `אֲמוֹרָא` (A02003)
- Scan: [p. 76a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265219)
- Note: first letter is not this section's letter
- [x] No change
- Correction:

### A02028 `אַמִּיתָא`

- Between: `אֲמִירָה` (A02027) and `אֲמִיתּ־` (A02029)
- Scan: [p. 77a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265220)
- [x] No change
- Correction:

### A02121 `אַנְדְּרוֹגִינוֹס`

- Between: `אַנְדְּרַאי` (A02120) and `אנדרואנטיא` (A02122)
- Scan: [p. 81b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265224)
- [ ] No change
- Correction:

### A02147 `אָנִיסָא`

- Between: `אנונים` (A02146) and `אנוקי` (A02148)
- Scan: [p. 82b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265225)
- [ ] No change
- Correction:

### A02383 `אסטמכרא`

- Between: `אִסְטְמָא` (A02382) and `אסטמיתיה` (A02384)
- Scan: [p. 91a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265234)
- [ ] No change
- Correction:

### A02400 `אסטרוגי`

- Between: `אִסְטְרוֹבִיל` (A02399) and `אסטרוגול` (A02401)
- Scan: [p. 91a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265234)
- [ ] No change
- Correction:

### A02607 `אפודרים`

- Between: `אפו` (A02606) and `אָפּוֹבַּלְסְמוֹן` (A02608)
- Scan: [p. 100a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265243)
- [ ] No change
- Correction:

### A02611 `אפודרים`

- Between: `אֲפוּזְיָינֵי` (A02610) and `אַפּוּחָא` (A02612)
- Scan: [p. 100a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265243)
- [ ] No change
- Correction:

### A02657 `אפוטריקא`

- Between: `אפטוניות` (A02656) and `אַפְטוֹרִיקִי` (A02658)
- Scan: [p. 102a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265245)
- [ ] No change
- Correction:

### A02673 `אפיטריסות`

- Between: `אִפְיוֹטוֹת` (A02672) and `אֶפִּיטְרוֹפָּא` (A02674)
- Scan: [p. 102b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265245)
- [ ] No change
- Correction:

### A02726 `אפיסקיתי`

- Between: `אפירסמן` (A02725) and `אָפַךְ` (A02727)
- Scan: [p. 105a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265248)
- [ ] No change
- Correction:

### A02729 `אפכיי`

- Between: `אֲפַךְ` (A02728) and `אַפְכִיּוֹת` (A02730)
- Scan: [p. 105a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265248)
- [ ] No change
- Correction:

### A02834 `אַפַּרְקִיד`

- Between: `אַפַּרְסְקִין` (A02833) and `אַפְרִקְיָא` (A02835)
- Scan: [p. 109a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265252)
- [ ] No change
- Correction:

### A02929 `אקניתא`

- Between: `אַקְנָיָיתָא` (A02928) and `אקניקתא` (A02930)
- Scan: [p. 113a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265256)
- [ ] No change
- Correction:

### A03018 `ארְוָא`

- Between: `אֲרוֹגְנַוְטֵיס` (A03017) and `אָרוֹד` (A03019)
- Scan: [p. 116a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265259)
- [ ] No change
- Correction:

### A03175 `אֲרַמְיוּתָא`

- Between: `אֲרַמִּי` (A03174) and `אַרְמַי` (A03176)
- Scan: [p. 123a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265266)
- [ ] No change
- Correction:

### A03377 `אִשְׁתַּיָּמָא`

- Between: `אִשְׁתַּטִּית` (A03376) and `אשתי` (A03378)
- Scan: [p. 131a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265274)
- [ ] No change
- Correction:

## ב (B)

### B00140 `בְּדַיְנֵיי`

- Between: `בְּדִיחוּתָא` (B00139) and `בְּדִיל` (B00141)
- Scan: [p. 140a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265283)
- [ ] No change
- Correction:

### B00213 `בּוּדְחָא`

- Between: `בּוֹדִידָה` (B00212) and `בּוֹהוּ` (B00214)
- Scan: [p. 144a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265287)
- [ ] No change
- Correction:

### B00437 `בִּזָּא`

- Between: `בְּזֵי` (B00436) and `בִּזָּה` (B00438)
- Scan: [p. 153a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265296)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

### B00438 `בִּזָּה`

- Between: `בִּזָּא` (B00437) and `בִּזְיָא` (B00439)
- Scan: [p. 153a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265296)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

### B00705 `בירן`

- Between: `בִּירָה` (B00704) and `בִּירוָון` (B00706)
- Scan: [p. 165b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265308)
- [ ] No change
- Correction:

### B00761 `בית־יוני`

- Between: `ביתור` (B00760) and `בִּיתוּתָא` (B00762)
- Scan: [p. 168b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265311)
- [ ] No change
- Correction:

### B00943 `בֵּנוֹנִי`

- Between: `בני` (B00942) and `בְּנֵי` (B00944)
- Scan: [p. 176b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265319)
- [ ] No change
- Correction:

### B01041 `בָּעְיָיא`

- Between: `בָּעְיָא` (B01040) and `בֵּעַיָּיא` (B01042)
- Scan: [p. 181b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265324)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

### B01042 `בֵּעַיָּיא`

- Between: `בָּעְיָיא` (B01041) and `בְּעֵיט` (B01043)
- Scan: [p. 181b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265324)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

### B01192 `בִּרְוָון`

- Between: `בָּרָה` (B01191) and `ברובה` (B01193)
- Scan: [p. 190b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265333)
- [ ] No change
- Correction:

### B01199 `בִּרְיָן`

- Between: `ברולקי` (B01198) and `בְּרוּנָא` (B01200)
- Scan: [p. 190b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265333)
- [ ] No change
- Correction:

## ג (C)

### C00289 `גּוֹבַנֵּי`

- Between: `גּוּבְנָא` (C00288) and `גּוּבְנָאֵי` (C00290)
- Scan: [p. 217b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265360)
- [ ] No change
- Correction:

### C00517 `גזא דפטי`

- Between: `גִּזָּא` (C00516) and `גָּזָא` (C00518)
- Scan: [p. 228b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265371)
- [ ] No change
- Correction:

### C00657 `גֵּין`

- Between: `גיובריא` (C00656) and `גֵּיוָה` (C00658)
- Scan: [p. 236a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265379)
- [ ] No change
- Correction:

### C00980 `גְּלָפִיתָא`

- Between: `גְּלַף` (C00979) and `גַּלְפָּטְרָה` (C00981)
- Scan: [p. 250b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265393)
- [ ] No change
- Correction:

### C01024 `גָּמְיָיא`

- Between: `גְּמִיד` (C01023) and `גְּמִיָּה` (C01025)
- Scan: [p. 252b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265395)
- [ ] No change
- Correction:

### C01057 `גַּמְסָסִית`

- Between: `גְּמָמִיּוֹת` (C01056) and `גמניא` (C01058)
- Scan: [p. 254b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265397)
- [ ] No change
- Correction:

### C01155 `גְּנִסַּת`

- Between: `גְּנָנָא` (C01154) and `גנסרי` (C01156)
- Scan: [p. 260a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265403)
- [ ] No change
- Correction:

### C01207 `גִּפְסִים`

- Between: `גָּפַס` (C01206) and `גִּפְסוֹס` (C01208)
- Scan: [p. 262b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265405)
- [ ] No change
- Correction:

## ד (D)

### D00138 `דדרא`

- Between: `דדנין` (D00137) and `דַּדְקֶרֶת` (D00139)
- Scan: [p. 281a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265424)
- [ ] No change
- Correction:

### D00159 `דַּהַנְיְתָא`

- Between: `דַּהֲנַאן` (D00158) and `דַּהֲנוּנִיתָא` (D00160)
- Scan: [p. 281b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265424)
- [ ] No change
- Correction:

### D00165 `דְּיָא`

- Between: `דּוּ` (D00164) and `דּוֹאֵג` (D00166)
- Scan: [p. 282a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265425)
- [ ] No change
- Correction:

### D00217 `דַּיְוקָא`

- Between: `דְּוָון` (D00216) and `דַּוַּור` (D00218)
- Scan: [p. 284a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265427)
- [ ] No change
- Correction:

### D00271 `דּוּלְפְקִי`

- Between: `דּוֹלְפָנָא` (D00270) and `דולפקוס` (D00272)
- Scan: [p. 286a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265429)
- [ ] No change
- Correction:

### D00280 `דומסייא`

- Between: `דּוֹמוֹס` (D00279) and `דּוּמִי` (D00281)
- Scan: [p. 286a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265429)
- [ ] No change
- Correction:

### D00331 `דוקלינוס`

- Between: `דּוֹקְיָיא` (D00330) and `דּוּקִים` (D00332)
- Scan: [p. 288a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265431)
- [ ] No change
- Correction:

### D00360 `דּוּרְדָּיָא`

- Between: `דּוּרְדֵּס` (D00359) and `דּוּרָה` (D00361)
- Scan: [p. 289b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265432)
- [ ] No change
- Correction:

### D00563 `דייספק`

- Between: `דַּיְּיסָא` (D00562) and `דייסיקיא` (D00564)
- Scan: [p. 298b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265441)
- [ ] No change
- Correction:

### D00625 `דִּימוֹסִיּוֹת`

- Between: `דִּימוֹסִית` (D00624) and `דִּימוֹסְנָאֵי` (D00626)
- Scan: [p. 300b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265443)
- [ ] No change
- Correction:

## ה (E)

### E00156 `הִדְרוֹקָן`

- Between: `הדרונא` (E00155) and `הדרוס` (E00157)
- Scan: [p. 335a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265478)
- [ ] No change
- Correction:

### E00184 `הוֹבָרָא`

- Between: `הוֹבַאי` (E00183) and `הוֹבְדָנָא` (E00185)
- Scan: [p. 336b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265479)
- [ ] No change
- Correction:

### E00423 `הֵימִיסוּ`

- Between: `הֵימִין` (E00422) and `הִימְיָנָא` (E00424)
- Scan: [p. 347a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265490)
- [ ] No change
- Correction:

### E00503 `הכחכא`

- Between: `הִכְדֵין` (E00502) and `הֶכְחֵישׁ` (E00504)
- Scan: [p. 350a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265493)
- [ ] No change
- Correction:

### E00559 `הָלֵין`

- Between: `הֵלֵךְ` (E00558) and `הִלֵּין` (E00560)
- Scan: [p. 352b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265495)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

### E00560 `הִלֵּין`

- Between: `הָלֵין` (E00559) and `הָלַךְ` (E00561)
- Scan: [p. 352b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265495)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

### E00628 `הִמְנוֹן`

- Between: `הָמָן` (E00627) and `המנוכא` (E00629)
- Scan: [p. 356a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265499)
- [ ] No change
- Correction:

### E00661 `הנדוקא`

- Between: `הנדיוסין` (E00660) and `הִנְדִּיקִי` (E00662)
- Scan: [p. 357a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265500)
- [ ] No change
- Correction:

## ו (F)

### F00023 `וָו`

- Between: `וָהּ` (F00022) and `וָו` (F00024)
- Scan: [p. 372b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265515)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

### F00024 `וָו`

- Between: `וָו` (F00023) and `ווּ־` (F00025)
- Scan: [p. 372b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265515)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

### F00025 `ווּ־`

- Between: `וָו` (F00024) and `וזרד` (F00026)
- Scan: [p. 372b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265515)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

### F00030 `ווּס`

- Between: `וטוּב` (F00029) and `וַי` (F00031)
- Scan: [p. 373a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265516)
- [ ] No change
- Correction:

## ח (H)

### H00026 `חֲבוֹלָה`

- Between: `חִבּוּל` (H00025) and `חֲבוּלָא` (H00027)
- Scan: [p. 416b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265559)
- [ ] No change
- Correction:

### H00136 `חֵגֶה`

- Between: `חַגָּא` (H00135) and `חָגָב` (H00137)
- Scan: [p. 423b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265566)
- [ ] No change
- Correction:

### H00680 `חיוטא`

- Between: `חֵיוָוא` (H00679) and `חִיוַּור` (H00681)
- Scan: [p. 452a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265595)
- [ ] No change
- Correction:

### H01351 `חסוסה`

- Between: `חסוח` (H01350) and `חֲסוֹךְ` (H01352)
- Scan: [p. 486b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265629)
- [ ] No change
- Correction:

### H01364 `חסחף`

- Between: `חַסְחוּס` (H01363) and `חַסְחָסוּת` (H01365)
- Scan: [p. 487a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265630)
- [ ] No change
- Correction:

### H01481 `חָפְשִׁי`

- Between: `חָפַשׁ` (H01480) and `חַפְשׁוּשִׁיתָא` (H01482)
- Scan: [p. 493a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265636)
- [ ] No change
- Correction:

### H01680 `חֲרִינָה`

- Between: `חֲרִיכָא` (H01679) and `חֶרְיָנָא` (H01681)
- Scan: [p. 502a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265645)
- [ ] No change
- Correction:

## ט (I)

### I00158 `טְוִיָּיה`

- Between: `טָוַיָּא` (I00157) and `טַוְיָה` (I00159)
- Scan: [p. 523b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265666)
- [ ] No change
- Correction:

### I00179 `טוּמַיָּיא`

- Between: `טוּמְטוּם` (I00178) and `טומיות` (I00180)
- Scan: [p. 524b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265667)
- [ ] No change
- Correction:

### I00456 `טִושָׁא`

- Between: `טירקסון` (I00455) and `טִישְׁטוּשָׁא` (I00457)
- Scan: [p. 535a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265678)
- [ ] No change
- Correction:

### I00718 `טרוגינוס`

- Between: `טַרְדִּין` (I00717) and `טְרוֹגִימָא` (I00719)
- Scan: [p. 550b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265693)
- [ ] No change
- Correction:

### I00777 `טריין`

- Between: `טָרִיד` (I00776) and `טריין` (I00778)
- Scan: [p. 553a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265696)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

### I00778 `טריין`

- Between: `טריין` (I00777) and `טריונין` (I00779)
- Scan: [p. 553a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265696)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

## י (J)

### J00039 `יִבּוּם`

- Between: `יְבוּל` (J00038) and `יַבּוֹלֶת` (J00040)
- Scan: [p. 560b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265703)
- [ ] No change
- Correction:

### J00325 `יֵיבָא`

- Between: `יָיָא` (J00324) and `יֵיאבָךְ` (J00326)
- Scan: [p. 576a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265719)
- [ ] No change
- Correction:

## כ (K)

### K00107 `כִּדְ׳ כַּדְבוּבָא`

- Between: `כַּדְבֵּב` (K00106) and `כַּדָּבוּתָא` (K00108)
- Scan: [p. 612b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265755)
- [ ] No change
- Correction:

### K00256 `כּוֹכְלִיאָר`

- Between: `כוכיתא` (K00255) and `כּוֹכְלִיאָס` (K00257)
- Scan: [p. 619b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265762)
- [ ] No change
- Correction:

### K00820 `כְּמַרְיָאתָא`

- Between: `כֹּמֶר` (K00819) and `כמרוסא` (K00821)
- Scan: [p. 647b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265790)
- [ ] No change
- Correction:

### K00955 `כַּסְפָּא`

- Between: `כְּסַף` (K00954) and `כַּסָּף` (K00956)
- Scan: [p. 655b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265798)
- [ ] No change
- Correction:

### K01138 `כרזג`

- Between: `כְּרָזָא` (K01137) and `כַּרְזְבָא` (K01139)
- Scan: [p. 665b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265808)
- [ ] No change
- Correction:

## ל (L)

### L00051 `לִבּוּי`

- Between: `לָבוּד` (L00050) and `לְבוּטִים` (L00052)
- Scan: [p. 688a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265837)
- [ ] No change
- Correction:

### L00134 `לָיִין`

- Between: `לָגִין` (L00133) and `לִגִלֵג` (L00135)
- Scan: [p. 692b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265841)
- [ ] No change
- Correction:

### L00348 `לְחֵים`

- Between: `לְחֵיךְ` (L00347) and `לְחִיכָה` (L00349)
- Scan: [p. 703a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265852)
- [ ] No change
- Correction:

### L00504 `לֵיעָנוּת`

- Between: `לֵיעוּ` (L00503) and `לִיעֶזֶר` (L00505)
- Scan: [p. 709a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265858)
- [ ] No change
- Correction:

### L00549 `לכלאב־`

- Between: `לְכַךְ` (L00548) and `לכל` (L00550)
- Scan: [p. 711a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265860)
- [ ] No change
- Correction:

### L00602 `לֵעוּ`

- Between: `לְעוּנִים` (L00601) and `לָעַז` (L00603)
- Scan: [p. 714a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265863)
- [ ] No change
- Correction:

### L00664 `לְקוּחוֹת`

- Between: `לְקָא` (L00663) and `לִקּוּחַ` (L00665)
- Scan: [p. 716b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265865)
- [ ] No change
- Correction:

## מ (M)

### M00021 `מָאחָתָא`

- Between: `מְאָחָא` (M00020) and `מָאחוּי` (M00022)
- Scan: [p. 722a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265871)
- [ ] No change
- Correction:

### M00197 `מנגנימין`

- Between: `מַגָּנִיּוֹת` (M00196) and `מָגֶנֶת` (M00198)
- Scan: [p. 729b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265878)
- [ ] No change
- Correction:

### M00221 `מְגִירְסָא`

- Between: `מַגְרַמְתָּא` (M00220) and `מַגְרֵף` (M00222)
- Scan: [p. 730b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265879)
- [ ] No change
- Correction:

### M00329 `מָדֹר`

- Between: `מַדְרֵגָה` (M00328) and `מַדְרוֹכִיתָא` (M00330)
- Scan: [p. 735b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265884)
- [ ] No change
- Correction:

### M00476 `מוּכְנִי`

- Between: `מוּכָן` (M00475) and `מוּכְנוֹי` (M00477)
- Scan: [p. 741b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265890)
- [ ] No change
- Correction:

### M00488 `מולגיה`

- Between: `מוּלָּאֵי` (M00487) and `מוּלְבָּז` (M00489)
- Scan: [p. 742b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265891)
- [ ] No change
- Correction:

### M00645 `מְוָרִטִינוֹס`

- Between: `מוֹרְיוֹן` (M00644) and `מוֹרַיָּיא` (M00646)
- Scan: [p. 750a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265899)
- [ ] No change
- Correction:

### M01003 `מַמְלוֹנִית`

- Between: `מַטְלוֹן` (M01002) and `מַטְלוּתָא` (M01004)
- Scan: [p. 767b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265916)
- [ ] No change
- Correction:

### M01384 `מכיצטרכי`

- Between: `מְכֵירִין` (M01383) and `מַכִּישָׁה` (M01385)
- Scan: [p. 782b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265931)
- [ ] No change
- Correction:

### M01544 `מלו`

- Between: `מְלֵי` (M01543) and `מְלִי` (M01545)
- Scan: [p. 789b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265938)
- [ ] No change
- Correction:

### M01547 `מְלֵיאָה`

- Between: `מַלְיָא` (M01546) and `מליאדין` (M01548)
- Scan: [p. 789b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265938)
- [ ] No change
- Correction:

### M01625 `מלקטי`

- Between: `מְלַקֵּט` (M01624) and `מַלְקְטָא` (M01626)
- Scan: [p. 793b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265942)
- [ ] No change
- Correction:

### M01841 `מְסִבְּתָא`

- Between: `מְסִבָּה` (M01840) and `מַסְבֵּךְ` (M01842)
- Scan: [p. 803b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265952)
- [ ] No change
- Correction:

### M02003 `מַסְקָנָא`

- Between: `מסקום` (M02002) and `מַסִּקְיָין` (M02004)
- Scan: [p. 810b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265959)
- [ ] No change
- Correction:

### M02116 `מַעְיָינָא`

- Between: `מַעְיָן` (M02115) and `מְעִיסָה` (M02117)
- Scan: [p. 816a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265965)
- [ ] No change
- Correction:

### M02472 `מַקְשָׁיִי`

- Between: `מִקְשְׁיָא` (M02471) and `מַקְשְׁיָא` (M02473)
- Scan: [p. 833b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265982)
- [ ] No change
- Correction:

### M02777 `מְרָרִיתָא`

- Between: `מְרָר` (M02776) and `מְרֹרָה` (M02778)
- Scan: [p. 848a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1265997)
- [ ] No change
- Correction:

## נ (N)

### N00084 `נְבִיָּוא`

- Between: `נְבִיּוּתָא` (N00083) and `נְבָיָיא` (N00085)
- Scan: [p. 869a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266018)
- [ ] No change
- Correction:

### N00143 `נַגְוָותָא`

- Between: `נגוסטרי` (N00142) and `נִגְזָל` (N00144)
- Scan: [p. 873b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266022)
- [ ] No change
- Correction:

### N00550 `נְטוֹפָתִי`

- Between: `נְטוֹפָה` (N00549) and `נִטּוֹפְתָּא` (N00551)
- Scan: [p. 898a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266047)
- [ ] No change
- Correction:

### N00797 `נישיותה`

- Between: `נִישּׂוּאִין` (N00796) and `נישובים` (N00798)
- Scan: [p. 909b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266058)
- [ ] No change
- Correction:

### N00893 `נמרידה`

- Between: `נִמְרָה` (N00892) and `נִמְרֵי` (N00894)
- Scan: [p. 914a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266063)
- [ ] No change
- Correction:

### N00900 `נגני`

- Between: `נַנַּאי` (N00899) and `ננהא` (N00901)
- Scan: [p. 914b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266063)
- [ ] No change
- Correction:

### N01238 `נְקֶפְתָּא`

- Between: `נֶקֶף` (N01237) and `נִקְפִּי` (N01239)
- Scan: [p. 935a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266084)
- [ ] No change
- Correction:

### N01302 `נָשַׂח`

- Between: `נְשֵׁי` (N01301) and `נַשְׁיָא` (N01303)
- Scan: [p. 938b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266087)
- [ ] No change
- Correction:

## ס (O)

### O00490 `סטִופָה`

- Between: `סטים` (O00489) and `סְטִיתָא` (O00491)
- Scan: [p. 973a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266122)
- [ ] No change
- Correction:

### O00613 `סַיֵּיב`

- Between: `סִיטְרָא` (O00612) and `סַיָּיארָא` (O00614)
- Scan: [p. 978a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266127)
- [ ] No change
- Correction:

### O00625 `סַיָּיאנָא`

- Between: `סַיְיטָן` (O00624) and `סַיַּין` (O00626)
- Scan: [p. 978b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266127)
- [ ] No change
- Correction:

### O00669 `סִולָּן`

- Between: `סִילכָּא` (O00668) and `סילני` (O00670)
- Scan: [p. 980a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266129)
- [ ] No change
- Correction:

### O00701 `סִימְיוֹן`

- Between: `סִימְטָא` (O00700) and `סִימְטָיוֹת` (O00702)
- Scan: [p. 981a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266130)
- [ ] No change
- Correction:

### O00709 `סִימָנִים`

- Between: `סִימְלוֹן` (O00708) and `סִימָן` (O00710)
- Scan: [p. 981b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266130)
- [ ] No change
- Correction:

### O00837 `סֵירוּחַ`

- Between: `סֵירוּג` (O00836) and `סִירְוַות` (O00838)
- Scan: [p. 987b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266136)
- [ ] No change
- Correction:

### O00954 `סַלְגִּיתָא`

- Between: `סִלְבּוֹנַיָּא` (O00953) and `סלגורין` (O00955)
- Scan: [p. 993b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266142)
- [ ] No change
- Correction:

### O01194 `סנדריוטי`

- Between: `סְנֶה` (O01193) and `סַנְהֶדְרֵי` (O01195)
- Scan: [p. 1005a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266154)
- [ ] No change
- Correction:

### O01372 `סְפִיקְלָטוֹר`

- Between: `סְפִיקְלָא` (O01371) and `ספיקלוא` (O01373)
- Scan: [p. 1014a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266163)
- [ ] No change
- Correction:

### O01502 `סִקְרִיפְטוֹר`

- Between: `סקרדין` (O01501) and `סקרידין` (O01503)
- Scan: [p. 1021a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266170)
- [ ] No change
- Correction:

## ע (P)

### P00137 `עָ׳ עַדְיָא`

- Between: `עָדֵי` (P00136) and `עדיין` (P00138)
- Scan: [p. 1044a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266193)
- [ ] No change
- Correction:

### P00392 `עֲזָאזֵל`

- Between: `עֲזָאֵל` (P00391) and `עָזַב` (P00393)
- Scan: [p. 1060b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266209)
- [ ] No change
- Correction:

### P00407 `עֻזִּיָּה`

- Between: `עֻזְיָא` (P00406) and `עֲזִיבָה` (P00408)
- Scan: [p. 1061b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266210)
- [ ] No change
- Correction:

### P00520 `עִייֵּר`

- Between: `עִיּוּק` (P00519) and `עִייְּרָא` (P00521)
- Scan: [p. 1068a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266217)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

### P00521 `עִייְּרָא`

- Between: `עִייֵּר` (P00520) and `עִיז` (P00522)
- Scan: [p. 1068a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266217)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

### P00801 `עִלְיָתָא`

- Between: `עֲלִיָּיה` (P00800) and `עַלֵּיל` (P00802)
- Scan: [p. 1083a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266232)
- [ ] No change
- Correction:

### P00826 `עֻלֵּמָא`

- Between: `עַלְמוּת` (P00825) and `עַלְמִין` (P00827)
- Scan: [p. 1085a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266234)
- [ ] No change
- Correction:

### P00871 `עמּוּם`

- Between: `עַמּוֹנִי` (P00870) and `עָמוּס` (P00872)
- Scan: [p. 1087b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266236)
- [ ] No change
- Correction:

### P01202 `עַקְמִימוּתָא`

- Between: `עִקָּמוֹן` (P01201) and `עִקְמוּתָא` (P01203)
- Scan: [p. 1107b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266256)
- [ ] No change
- Correction:

### P01472 `עשות`

- Between: `עִשּׂוּר` (P01471) and `עשּׂוֹרְיָאתָא` (P01473)
- Scan: [p. 1124b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266273)
- [ ] No change
- Correction:

## פ (Q)

### Q00393 `פּוּרְקֵם`

- Between: `פּוּרְקָנוּת` (Q00392) and `פּוּרְקְתָא` (Q00394)
- Scan: [p. 1148b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266297)
- [ ] No change
- Correction:

### Q00429 `פָּזַל`

- Between: `פָּזִיחַ` (Q00428) and `פְּזֵים` (Q00430)
- Scan: [p. 1150a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266299)
- [ ] No change
- Correction:

### Q00510 `פַּטִּיט`

- Between: `פְּטֵי` (Q00509) and `פטיות` (Q00511)
- Scan: [p. 1155a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266304)
- [ ] No change
- Correction:

### Q01718 `פרוסטוקוסרין`

- Between: `פרוסטיא` (Q01717) and `פרוספיא` (Q01719)
- Scan: [p. 1221b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266370)
- [ ] No change
- Correction:

## צ (R)

### R00169 `צַיָּואָה`

- Between: `צְוָואָה` (R00168) and `צָוַוח` (R00170)
- Scan: [p. 1266a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266415)
- [ ] No change
- Correction:

### R00176 `צַיַּור`

- Between: `צִוּוּי` (R00175) and `צַוְּורוֹנְיָתָא` (R00177)
- Scan: [p. 1267a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266416)
- [ ] No change
- Correction:

### R00179 `צַוַּוארְנְיָיתָא`

- Between: `צַוְּורָנָא` (R00178) and `צוויינות` (R00180)
- Scan: [p. 1267a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266416)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

### R00180 `צוויינות`

- Between: `צַוַּוארְנְיָיתָא` (R00179) and `צָוַות` (R00181)
- Scan: [p. 1267a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266416)
- Note: a neighbour is flagged too
- [ ] No change
- Correction:

### R00521 `צַלְיָן`

- Between: `צְלַל` (R00520) and `צְלָלָא` (R00522)
- Scan: [p. 1284b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266433)
- [ ] No change
- Correction:

### R00735 `צָרַר`

- Between: `צָרֶבֶת` (R00734) and `צַרְדָּא` (R00736)
- Scan: [p. 1299b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266448)
- [ ] No change
- Correction:

## ק (S)

### S00014 `קאניסין`

- Between: `קָאֵם` (S00013) and `קָאמָא` (S00015)
- Scan: [p. 1306b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266455)
- [ ] No change
- Correction:

### S00299 `קוֹט`

- Between: `קוּטְמִית` (S00298) and `קוּטְנָא` (S00300)
- Scan: [p. 1326b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266475)
- [ ] No change
- Correction:

### S00471 `קוסטר`

- Between: `קוּסְטַנְטִינוֹס` (S00470) and `קוסטנרות` (S00472)
- Scan: [p. 1336b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266485)
- [ ] No change
- Correction:

### S00577 `קוֹרְדּ`

- Between: `קוֹרְדְּיָנָא` (S00576) and `קוּרְדִּיקִין` (S00578)
- Scan: [p. 1341b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266490)
- [ ] No change
- Correction:

### S00642 `קוּרְקוּנְיָא`

- Between: `קוּרְקְבָנָא` (S00641) and `קורקון` (S00643)
- Scan: [p. 1344a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266493)
- [ ] No change
- Correction:

### S00887 `קִייֵּץ`

- Between: `קִיּוּמְתָּא` (S00886) and `קִיזַּאי` (S00888)
- Scan: [p. 1357a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266506)
- [ ] No change
- Correction:

### S00994 `קִילְקֶילְתָּא`

- Between: `קִילְקִלִּין` (S00993) and `קִילָּרִין` (S00995)
- Scan: [p. 1361b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266510)
- [ ] No change
- Correction:

### S01204 `קירקוסיי`

- Between: `קִירְקָנֵי` (S01203) and `קִישׁ` (S01205)
- Scan: [p. 1370a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266519)
- [ ] No change
- Correction:

### S01248 `קְלִיבִּינִטִירִין`

- Between: `קלבוס` (S01247) and `קלבסים` (S01249)
- Scan: [p. 1372a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266521)
- [ ] No change
- Correction:

### S01413 `קלקיס`

- Between: `קלקיא` (S01412) and `קִלְקֶילְתָּא` (S01414)
- Scan: [p. 1381b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266530)
- [ ] No change
- Correction:

### S01578 `קְנִיגִין`

- Between: `קְנִיגִיזְיָא` (S01577) and `קְנִיגְיָיא` (S01579)
- Scan: [p. 1392b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266541)
- [ ] No change
- Correction:

### S01594 `כנקתירין`

- Between: `קַנְּכֵּרִי` (S01593) and `קְנַם` (S01595)
- Scan: [p. 1393a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266542)
- Note: first letter is not this section's letter
- [ ] No change
- Correction:

### S01692 `קַעְקָא`

- Between: `קַעְקַע` (S01691) and `קְעָרָה` (S01693)
- Scan: [p. 1397b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266546)
- [ ] No change
- Correction:

### S01913 `קדריונטס`

- Between: `קרדי` (S01912) and `קַרְדִּימָא` (S01914)
- Scan: [p. 1412b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266561)
- [ ] No change
- Correction:

## ר (T)

### T00402 `רֶיְמָתִיקוֹס`

- Between: `רוּמְשָׁא` (T00401) and `רוּנְגָּר` (T00403)
- Scan: [p. 1462a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266611)
- [ ] No change
- Correction:

### T00613 `רֵייַח`

- Between: `רֵיו` (T00612) and `ריותא` (T00614)
- Scan: [p. 1473b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266622)
- [ ] No change
- Correction:

### T00738 `רותיכוס`

- Between: `רִיתְחָא` (T00737) and `ריתכאות` (T00739)
- Scan: [p. 1478b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266627)
- [ ] No change
- Correction:

## ש (U)

### U00310 `שַׁיַּאר`

- Between: `שואה` (U00309) and `שׁוּב` (U00311)
- Scan: [p. 1528a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266677)
- [ ] No change
- Correction:

### U00342 `שַׁיַּואר`

- Between: `שְׁוָה` (U00341) and `שְׁוַוח` (U00343)
- Scan: [p. 1529b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266678)
- [ ] No change
- Correction:

### U00430 `שׁוּלְשֶׁילְתָּא`

- Between: `שׁוֹלְלָא` (U00429) and `שׁוּלָמִי` (U00431)
- Scan: [p. 1534b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266683)
- [ ] No change
- Correction:

### U00892 `שַׁיָּיטָא`

- Between: `שַׁיָּיא` (U00891) and `שְׁיָיאפָא` (U00893)
- Scan: [p. 1561a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266710)
- [ ] No change
- Correction:

### U01127 `שִׂכְיָיָא`

- Between: `שֶׂכְוִי` (U01126) and `שכוין` (U01128)
- Scan: [p. 1571b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266720)
- [ ] No change
- Correction:

### U01208 `שלבת`

- Between: `שלברית` (U01207) and `שַׁלְבִּשׁ` (U01209)
- Scan: [p. 1577b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266726)
- [ ] No change
- Correction:

### U01233 `שְׁלֵיָא`

- Between: `שָׁלוּ` (U01232) and `שְׁלוּב` (U01234)
- Scan: [p. 1578b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266727)
- [ ] No change
- Correction:

### U01410 `שַׁמַּאי`

- Between: `שֶׁמָּא` (U01409) and `שִׁמָּאָה` (U01411)
- Scan: [p. 1591a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266740)
- [ ] No change
- Correction:

### U01706 `שְׁפָאִים`

- Between: `שִׁפָּא` (U01705) and `שַׁפַּאי` (U01707)
- Scan: [p. 1613b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266762)
- [ ] No change
- Correction:

### U01975 `שִׁרְיָין`

- Between: `שְׁרִיָּיה` (U01974) and `שִׁרַיִים` (U01976)
- Scan: [p. 1631a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266780)
- [ ] No change
- Correction:

## ת (V)

### V00139 `תּוֹאֲנָה`

- Between: `תְּוָא` (V00138) and `תָּוָאךְ` (V00140)
- Scan: [p. 1649b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266798)
- [ ] No change
- Correction:

### V00445 `תִּולּ־`

- Between: `תִּיכְלָא` (V00444) and `תִּילָאנָא` (V00446)
- Scan: [p. 1664b](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266813)
- [ ] No change
- Correction:

### V00485 `תֵּיקֵי`

- Between: `תֵּיקוּ` (V00484) and `תיקול` (V00486)
- Scan: [p. 1666a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266815)
- [ ] No change
- Correction:

### V00750 `תַּנִּינָא`

- Between: `תַּנִּין` (V00749) and `תִּנְיָן` (V00751)
- Scan: [p. 1682a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266831)
- [ ] No change
- Correction:

### V00912 `תִּקְרָה`

- Between: `תַּקְפָא` (V00911) and `תִּקְרֻבְתָּא` (V00913)
- Scan: [p. 1694a](https://sammlungen.ub.uni-frankfurt.de/freimann/content/pageview/1266843)
- [ ] No change
- Correction:
