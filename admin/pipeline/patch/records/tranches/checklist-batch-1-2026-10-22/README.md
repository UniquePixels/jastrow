# The maintainer checklist, batch 1 (2026-10-22)

PR #187. It applies the maintainer's ticks in
[`docs/archive/maintainer-checklist.md`](../../../../../../docs/archive/maintainer-checklist.md)
(recorded 2026-10-18, commit `963e28b2b`, and 2026-10-22, commit
`5a94da667`): § Cross-reference spellings (review ledger L72), § X11
(L39), § Cross-reference numerals: may rename an entry (18) and
§ Cross-reference numerals: answered 2026-10-18 (8) (L64). Each
applied block moved out of the checklist into
[`docs/archive/headword-worklist.md`](../../../../../../docs/archive/headword-worklist.md)
§ Applied from the maintainer checklist (2026-10-22), with a line
saying what was written.

## The ruling

Ruling `10-13 correction policy` ([`docs/decisions.md`](../../../../../../docs/decisions.md)
§9, [`admin/entry/ANNOTATIONS.md`](../../../../../entry/ANNOTATIONS.md)):
a transcription error where print is right (case 1) is corrected with
no annotation, its evidence in the patch rationale; a print error whose
intended value is determined (case 2) is corrected and annotated
`print-error`; a print oddity with more than one plausible intent
(case 3) is kept and annotated `kept`; an illegible print (case 4)
stores our best reading, annotated `illegible`. Evidence is print and
Jastrow's text: the hOCR, the maintainer's scan read, the cites' own
words, the alphabet. Where Sefaria's linker pointed a link is never
evidence, and re-aiming a wrong link is case 1.

## Where the patches are

**102 reviewed patches, P000828–P000929, on 95 entries**, appended to
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl), with
the rid's patch ids in
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl): a
new `repaired` record for 92 rids, the ids appended to the existing
record for A03020, C01130 and P00856. `prompt_version` is
`checklist-batch-1-2026-10-22`; every `snapshot` is `sha256:75bbc5ee…`.
This directory holds only this README.

| | patches | case 1 | case 2 | case 3 | case 4 |
|---|---|---|---|---|---|
| A. Cross-reference spellings (17 blocks) | 35 | 26 | 0 | 0 | 8 |
| B. X11 (2 blocks) | 2 | 2 | 0 | 0 | 0 |
| C. Numerals that may rename (18 of 18) | 53 | 48 | 4 | 1 | 0 |
| D. Numerals answered 2026-10-18 (8) | 12 | 8 | 1 | 3 | 0 |
| total | 102 | 84 | 5 | 4 | 8 |

A's 35th patch, P000927, is C00300's `disambiguator` (below), which
no case covers: it changes no printed value.

Each rationale opens with the print read, its date and the checklist
commit it was ticked at (`docs/maintainer-checklist.md at 5a94da667`
or `at 963e28b2b`), quotes the tick and the note verbatim, and names
the scan leaf; a cross-reference retarget names its own cite's page
and leaf first. A case 1 rationale never names case 2, 3 or 4, so the
Sefaria appendix's scope filter reads it as Sefaria's error even where
its companion is annotated.

**Mechanics.** Every `expected_before` was computed, not typed: each
entry was composed as the patches see it (both transform phases, then
its existing reviewed patches), and each new patch was applied in turn
so the next one on the rid pins the text it leaves. Every respelling
is one code point swapped in the stored form and checked against the
checklist's (or a cite's) own bytes. A retarget changes only the
anchor's `href` and `data-ref`, to the target's link key (ruling
`10-09 link key`, the line before patches), so links that name a
respelled entry by its old spelling still resolve.

## The blocks

### A. Cross-reference spellings: 17 blocks, 19 entries

Plain "OCR error" notes are case 1 `reform`s with no annotation. Where
the note says the printed glyph is defective ("scan error missing the
descender", "neither a complete yod or vav", "print/scan issue"), the
reading is ours, not print's: case 4, a `reform` annotated
`{kind: 'illegible', printed: <the stored spelling>, evidence: <the
note verbatim, the cites, the alphabet, the page>}`, as S01780's
P000589 (PR #177). The cites the block says move are re-aimed by case 1
`replace`s.

| block | tick | case | patches | before → after | scan |
|---|---|---|---|---|---|
| A00021 | yes, bet | 1 | P000828 | `אַכְאָבִית` → `אַבְאָבִית` | 2b · leaf 25 |
| A03020 | yes, vav | 4 | P000829 | `אֻרְיָה` → `אֻרְוָה` (illegible) | 116a · leaf 139 |
| K00228 | yes, bet | 1 | P000830 | `כּוֹזְכָא` → `כּוֹזְבָא` | 618a · leaf 641 |
| K00780 | yes, dalet | 4 | P000831 | `כַּלְקִירָא` → `כַּלְקִידָא` (illegible) | 645b · leaf 668 |
| U01011 | yes, yod | 1 | P000832 | `שִׁופּוּט` → `שִׁיפּוּט` | 1566a · leaf 889 |
| H00980 | yes, dalet; four cites move | 1 | P000833; P000834–P000837 | `חָלַך` → `חָלַד`; E00561, H00330, H00990, U01212: H00981 → H00980 | 464b · leaf 487 |
| P00609 | yes, vav; cites stay | 4 | P000838 | `עֵינָיָון` → `עֵינָוָון` (illegible) | 1072a · leaf 395 |
| R00152 | yes, vav | 4 | P000839 | `צַיַּאר` → `צַוַּאר` (illegible) | 1265b · leaf 588 |
| R00171 | yes, vav; three cites move | 4 | P000840; P000841–P000843 | `צְיַוח` → `צְוַוח` (illegible); M00338, S01995, U00220: R00170 → R00171 | 1266b · leaf 589 |
| S00216 | yes, vav, and the plural; two cites move | 4 | P000844; P000845–P000846; P000847 | `קַיָּא` → `קַוָּא` (illegible); S00308, S00878: S00217 → S00216; the plural in its text `קַיִּין` → `קַוִּין` (illegible) | 1323a · leaf 646 |
| U00721 | yes, ḥet; U00000's cite moves | 1 | P000848; P000849 | `שַׁהְרֵר` → `שַׁחְרֵר`; U00000's `שַׁחְרֵר`: U00720 → U00721 | 1552a · leaf 875 |
| U01223 | yes, he; the cites move | 1 | P000850; P000851–P000853 | `שִׁלְחֵי` → `שִׁלְהֵי`; U00936 and U01215's two: U01224 → U01223 | 1578a · leaf 901 |
| P00855, P00856 | yes, dalet | 1 | P000854, P000855 | `עָמַך I` → `עָמַד I`, `עָמַך II` → `עָמַד II` | 1086a · leaf 409 |
| P00860 | yes, dalet (both forms) | 1 | P000856, P000857 | `עֶמֶך, עָמָך II` → `עֶמֶד, עָמָד II` | 1086b · leaf 409 |
| A00718 | yes, vav | 4 | P000858 | `אַיְנָא I` → `אַוְנָא I` (illegible) | 28a · leaf 51 |
| A01632 | yes, yod | 1 | P000859 | `אֶושָּׁתָא` → `אֶישָּׁתָא` | 61a · leaf 84 |
| C00299 | yes, dalet; C00300 is a stub (ruling 2026-10-22) | 1; none | P000928; P000927 | `גּוּך` → `גּוּד`; C00300 `גּוּד` takes `disambiguator: 2` | 218a · leaf 241 |
| C01130 | yes, ḥet | 1 | P000860 (C00538's cite: P000925, § D) | `*גְּנַה II` → `*גְּנַח II` | 259a · leaf 282 |

- **S00216's plural** sits in its text, `—Pl. קַיִּין`, an anchor
  Sefaria linked to S00939 `קַיָּין` (one having large testicles). The
  note says the plural is the same issue, so P000847 changes only the
  visible letter, annotated `illegible` like the headword; the anchor's
  target is no question of the block and is left as Sefaria set it.
- **U01215 holds two cites** of `שִׁלְהֵי`, one per sense (`to hang
  down; denom. שִׁלְהֵי` and `(denom. of שִׁלְהֵי) to end`); both name
  the noun `tail, end`, so both move (P000852, P000853). The block
  counted the two citing entries.
- **P00860** takes two patches, one per form, so each respelling is
  its own appendix row (a reform that changes two forms is not
  mechanical for the appendix).
- **U00721's note** first read "the correct letter is reish"; the
  maintainer corrected it on 2026-10-22 (`664b370d0`, merged here) to
  "OCR Error", so P000848 is case 1 with no annotation.
- **Not moved:** P00609's cites stay on P00610, as ticked. R00176's
  `v. צַוַּאר` spells R00152's pointing and is linked to R00151; no
  tick moves it, so it is left for a later read.
- **C00299 and C00300.** C00299's respelling `גּוּד` is C00300's
  name (`גּוּד, גּוֹד`, `forms of גדד a. נגד`). The maintainer ruled
  on 2026-10-22 that C00300 is an unnumbered cross-reference stub, so
  print sets no numeral to tell the two apart, and none is invented:
  P000927 rewrites C00300's first form as `גּוּד ²`, which the parser
  reads as `disambiguator: 2`, stored and named, never displayed
  (ruling `10-06 hidden superscript`; HW-xref-collision, as G00675's
  P000307). Its `display` stays `{0}, {1}`, and its five cites still
  resolve by the pre-patch link key `גּוּד`. P000928 then respells
  C00299 (case 1). Names: C00299 `גּוּך` → `גּוּד`, C00300 `גּוּד` →
  `גּוּד²`. The first push of this PR held the block until the ruling.

### B. X11: 2 blocks

| block | tick | case | patch | before → after | scan |
|---|---|---|---|---|---|
| H01792 | yes, rejoin | 1 | P000861 | `חָ`, `רַ`, `ת` → `חָרַת` | 507b · leaf 530 |
| V00524 | yes, rejoin | 1 | P000862 | `תִּ`, `כְבּוֹסֶת` → `תִּכְבּוֹסֶת` | 1667b · leaf 990 |

Each is a `reform` whose pieces concatenate byte for byte to the one
word print sets, as U00489's P000811 (PR #179). The X11 rows clear.

### C. Numerals that may rename an entry: all 18

A numeral print sets and Sefaria dropped is a case 1 `reform` with
`homographs` and a `display` that shows it, the evidence the block's
hOCR line where it reads one, else the maintainer's scan read. A
numeral Jastrow's text names where print sets none is case 2, annotated
`{kind: 'print-error', printed: '', evidence: <the cite>}`, as PR
#174's implied Is. A numeral goes on the form print sets it beside: the
first form, unless the hOCR or the note says otherwise. P00639
`חֵיפָא III` was answered by the maintainer's note of 2026-10-22, after
the PR's first push, and is P000929, the last patch of the batch.

| block | tick | case | patches | before → after | scan |
|---|---|---|---|---|---|
| `חֵיפָא III` | note: H00845 `חֵיפָה III`, retarget | 1 | P000929 | P00639: H00840 → H00845 (pr. n. m. Ḥefa, = עֵיפָא); text and numeral unchanged | 1073b · leaf 396 |
| `נוֹחַ I` | N00342 takes I | 2; 1 | P000863; P000864 | N00342 `{0}` → `{0} I`; N00660: N00343 → N00342 | 886b · leaf 209 |
| `סְגֵי I` | the five → O00120; O00123 takes `סַגִּי I` | 1; 2; 1 | P000865–P000869; P000870; P000871 | O00123, O00154, O00159, O00550, O00554: O00121 → O00120; O00123 `{0}, {1}, {2}` → `{0} I, {1}, {2}`; O00249: O00124 → O00123 | 953b · leaf 276; 954a · leaf 277 |
| `עֵרָבוֹן II` | P01273 takes II | 2 | P000872 | P01273 `{0}, {1}` → `{0} II, {1}` (the link was already there) | 1112b · leaf 435 |
| `שַׁב I` | print sets I on U00059, II on U00060 | 1 | P000873, P000874; P000875–P000877 | U00059 `{0} I, …`, U00060 `{0} II, …`; U00126, U00779, U00807: U00060 → U00059 | 1509b · leaf 832 |
| `שְׁבַט II` | print sets II on U00105 | 1 | P000878; P000879, P000880 | U00105 `{0} II, …`; U00107, U00801: U00103 → U00105 | 1513a · leaf 836 |
| `שְׁוַוח II` | print sets II on U00344, III on U00345 | 1 | P000881, P000882; P000883, P000884 | U00344 `homograph: 2` (no display in PR #187; `{0} II, {1}, ({2})` since PR #191: see below); U00345 `{0} III, {1}`; U00362, U00518: U00343 → U00344 | 1529b · leaf 852; 1530a · leaf 853 |
| `שַׁוְיָא II` | print sets II on the main headword | 1 | P000885; P000886 | U00396 `{0} II, …`; U00835: U00395 → U00396 | 1533a · leaf 856 |
| `שׁוּעַ I` | U00475; no numeral | 1; 3 | P000887; P000888 | U01637: U00476 → U00475; its `שׁוּעַ I` kept, annotated | 1610a · leaf 933 |
| `שׁוּתָא III` | U00583, `III` → `II` annotated; print sets I on U00582, II on U00583 | 1; 1; 2 | P000889, P000890; P000891; P000892 | U00582 `{0} I, {1}`, U00583 `{0} II, {1}`; N01120: U00581 → U00583, then its `III` → `II` | 1544a · leaf 867; 928b · leaf 251 |
| `שֵׁירוּתָא III` | U01071; II and III on `שֵׁר׳` | 1 | P000893, P000894; P000895, P000896 | U01070 `{0}, {1} II, {2}, {3} I`, U01071 `{0}, {1} III, {2}, {3} II`; U01064, U01066: U01070 → U01071 | 1569a · leaf 892 |
| `שִׁית IV` | print sets IV on U01103 | 1 | P000897; P000898, P000899 | U01103 `{0} IV, …`; U01112, U02071: U01100 → U01103 | 1570a · leaf 893 |
| `שָׁמִין II` | U01470 takes II (print) | 1 | P000900; P000901 | U01470 `{0} II, {1}`; U01502: U01469 → U01470 | 1595b · leaf 918 |
| `שָׁמֵן II` | print sets II on U01498 | 1 | P000902; P000903 | U01498 `{0} II, …`; U01503: U01496 → U01498 | 1597b · leaf 920 |
| `שֵׁשׁ III` | print sets III on U02056 | 1 | P000904; P000905 | U02056 `{0} III, {1}`; U02059: U02055 → U02056 | 1636a · leaf 959 |
| `תּוֹר III` | V00275 form 0 takes III (print) | 1 | P000906; P000907, P000908 | V00275 `{0} III, {1} I`; V00277, V00282: V00274 → V00275 | 1656a · leaf 979 |
| `תַּלְמָא II` | V00600 takes II (print) | 1 | P000909; P000910 | V00600 `{0} II, {1}`; V00570: V00599 → V00600 | 1672a · leaf 995 |
| `תְּפֵי I` | print sets I on V00815, II on V00816 | 1 | P000911, P000912; P000913, P000914 | V00815 `{0} I, {1}`, V00816 `{0} II, {1}`; T00434, V00848: V00816 → V00815 | 1685b · leaf 1008 |

- **U00344** has no `display`: its last alternate carries a stray `)`
  (`שׁוּחַ)`), so the source settles no layout (gate 2's unsettleable
  line, `paren-group-close-unknown`). P000881 sets the numeral and no
  display: the II is stored and in the name, and shows once the layout
  is settled. Amended 2026-10-22 (PR #191,
  [`../post-issues-2026-10-22/`](../post-issues-2026-10-22/README.md)):
  the `)` is print's, `(שׁוּחַ)`, and P000881 now restores the `(` and
  supplies `display` `{0} II, {1}, ({2})`, so the II shows.
- **U01637's kept note** and N01120's numeral are their own patches on
  the sense the retarget leaves (`expected_before` pins it), so each
  retarget stays a case 1 appendix row.
- **The kept cites quote the cite's word.** An `annotate`'s `printed`
  must be plain text found once in its field (`kind: 'kept'` needs
  `printed === stored`, and markup changes in translation), and the
  numeral `I` is not unique in U01637's or K00444's units (`Sabb. II`,
  `Ib. 112ᵃ`). So all four kept notes of this PR (P000888, P000919,
  P000923, P000924) quote the cite's Hebrew word, once in the field,
  and the evidence names the numeral.

### D. Numerals answered 2026-10-18: 8

| block | tick | case | patches | before → after | scan |
|---|---|---|---|---|---|
| `אָוָה III` | Gesenius's: remove the link | 1 | P000915 | A00627's anchor → the plain span `אָוָה III` | 24a · leaf 47 |
| `אִלְמָלֵא I` | the digit 1, a sense; OCR | 1 | P000916 | A01864's `אִלְמָלֵא I` → `אִלְמָלֵא 1`, still on A01918 | 69b · leaf 92 |
| `אִסְטְלִי I` | A02378 takes I | 2; 1 | P000917; P000918 | A02378 `{0} I, {1}, {2}`; A02360: A02379 → A02378 | 90b · leaf 113 |
| `גּוּבְתָּא I` | kept | 3 | P000919 | C00147's cite kept, annotated | 209b · leaf 232 |
| `גִּזְרָא I` | move the gloss-head I onto the form | 1 | P000920, P000921; P000922 | C00577 `{0}, {1} I`, gloss head `<b>, </b>I ch.` → `<b>, </b>ch.`; H00303: C00578 → C00577 | 232a · leaf 255 |
| `גִּיס I` | kept on both | 3 | P000923, P000924 | C00841's and K00444's cites kept, annotated | 243a · leaf 266; 628a · leaf 651 |
| `גְּנַח II` | C01130 | 1 | P000925 | C00538: C01129 → C01130 | 229a · leaf 252 |
| `חֲטִי I` | H00614, no numeral | 1 | P000926 | M00854: H00616 → H00614 | 759a · leaf 82 |

- **A00627** is a `replace`, not an `unref`: `unref` removes a
  `refs[]` item, and this link is an anchor inside the definition. The
  replace takes the anchor off its `<span dir="rtl">אָוָה</span> III`,
  which reads the same (ruling `08-15 wrong-reference`: linker
  overreach is delinked silently).
- **A01864**: A01864's sense 2 reads `cmp. אִלְמָלֵא 2` for A01918's
  sense 2, so sense 1's `I` is the digit `1`; the replace changes the
  one code point, and the link stays on A01918 (a cite names an entry,
  not a sense).
- **C00577**'s I goes on the form it follows in print, `גִּיזְרָא`
  (form 1), where C00578 carries its II, so the name is unchanged.

## What changed

The re-import (`rm -rf data/entries/[A-Z] && bun data:import && bun
qa:format`) changes exactly the 95 patched entries, each by the field
its patches name: a respelling moves one form's `text` (and the name);
a rejoin the line's forms and `display`; a numeral one form's
`homograph` and the `display`; a retarget one `ref` (47 cites: 46
differ by `ref` only, and N01120's unit also takes its `II`); an annotation is added only where case 2, 3 or 4 applies
(17). Everything else is byte-identical (checked by a script over the
diffs).

**42 names change**, and the names gate is green (65,024/65,024: no
collision):

| rid | before | after |
|---|---|---|
| A00021 | `אַכְאָבִית` | `אַבְאָבִית` |
| A00718 | `אַיְנָא I` | `אַוְנָא I` |
| A01632 | `אֶושָּׁתָא` | `אֶישָּׁתָא` |
| A02378 | `אִסְטַלִּי` | `אִסְטַלִּי I` |
| A03020 | `אֻרְיָה` | `אֻרְוָה` |
| C00299 | `גּוּך` | `גּוּד` |
| C00300 | `גּוּד` | `גּוּד²` |
| C01130 | `*גְּנַה II` | `*גְּנַח II` |
| H00980 | `חָלַך` | `חָלַד` |
| H01792 | `חָ` | `חָרַת` |
| K00228 | `כּוֹזְכָא` | `כּוֹזְבָא` |
| K00780 | `כַּלְקִירָא` | `כַּלְקִידָא` |
| N00342 | `נוֹחַ` | `נוֹחַ I` |
| O00123 | `סַגִּי` | `סַגִּי I` |
| P00609 | `עֵינָיָון` | `עֵינָוָון` |
| P00855 | `עָמַך I` | `עָמַד I` |
| P00856 | `עָמַך II` | `עָמַד II` |
| P00860 | `עֶמֶך` | `עֶמֶד` |
| P01273 | `עֵרָבוֹן²` | `עֵרָבוֹן II²` |
| R00152 | `צַיַּאר` | `צַוַּאר` |
| R00171 | `צְיַוח` | `צְוַוח` |
| S00216 | `קַיָּא` | `קַוָּא` |
| U00059 | `שַׁב` | `שַׁב I` |
| U00060 | `שַׁב²` | `שַׁב II²` |
| U00105 | `שְׁבַט` | `שְׁבַט II` |
| U00344 | `שְׁוַוח` | `שְׁוַוח II` |
| U00345 | `שְׁוַוח²` | `שְׁוַוח III²` |
| U00396 | `שַׁוְיָא` | `שַׁוְיָא II` |
| U00582 | `שׁוּתָּא` | `שׁוּתָּא I` |
| U00583 | `שׁוּתָּא²` | `שׁוּתָּא II²` |
| U00721 | `שַׁהְרֵר` | `שַׁחְרֵר` |
| U01011 | `שִׁופּוּט` | `שִׁיפּוּט` |
| U01103 | `שִׁית` | `שִׁית IV` |
| U01223 | `שִׁלְחֵי` | `שִׁלְהֵי` |
| U01470 | `שָׁמִין` | `שָׁמִין II` |
| U01498 | `שָׁמֵן` | `שָׁמֵן II` |
| U02056 | `שֵׁשׁ` | `שֵׁשׁ III` |
| V00275 | `תּוֹר` | `תּוֹר III` |
| V00524 | `תִּ` | `תִּכְבּוֹסֶת` |
| V00600 | `תַּלְמָא` | `תַּלְמָא II` |
| V00815 | `תְּפֵי` | `תְּפֵי I` |
| V00816 | `תְּפֵי²` | `תְּפֵי II²` |

**Gates.** All green: names 65,024/65,024, internal targets (gate 6)
32,512/32,512 with 0 unresolved, composition and contract (gate 10's
both-ways annotation check) green; `bun data:validate` 0 problems.
The blessing reads 770 reviewed, 815 applied (was 668, 713) and 117
annotations written (102 print-error, 6 kept, 9 illegible; was 100:
97, 2, 1). No `body/` or `transform/` code changed, so
`transform:invariants` was not run.

**The headword report.** X11 2 → 0; X10 8 → 5 (C00578, N00343, O00124
clear); X8 70 → 71: P00860's gap clears, and two appear where a
family's numerals now sit on different forms, O00124 (`סַגִּי,
סַגִּיא II`, II on its alternate; O00123's I is on its headword) and
P01273 (`עֵרָבוֹן II`; P01272's I is on its alternate `עֵי׳`). Where
print sets O00124's II and P01272's I is a scan read for later. X9
5 → 6: A00719 `אֲוָנָא II` is now pointed apart from A00718 `אַוְנָא
I` in one numbered sequence (print's own pointing, the X9 shape; the
maintainer's 2026-10-06 note on A00719 already reads "718 is the I").
The reviewed-kept records for A00719's and C01130's X8 gaps went stale,
since the respellings close both gaps, as the notes on them said
("718 is teh I", "1129 Already has I"); they are removed (55 → 53
records, 0 stale).

## Upstream

`bun data:sefaria` moves the appendix from 299 rows to 381 (+82) and
the review list from 369 to 389 (+20). The 82 are this PR's case 1
patches with print evidence: 47 `cross-reference-target`, 19
`headword-numeral-dropped`, 13 `headword-ocr-glyph`, 1 each
`cross-reference-ocr-glyph`, `cross-reference-overreach` and
`headword-numeral-in-gloss`. The other 20 are the 17 annotated or
`annotate` patches (our corrections, out of scope), the two X11
rejoins (a reform that changes the headword and the number of forms is
not mechanical for the appendix, as U00489's was) and C00300's
disambiguator (`headword-name-collision`, our URL tool, not Sefaria's
error). The evidence filter
also now reads a print read recorded in `docs/maintainer-checklist.md`
or `docs/post-go-live-review.md` (`admin/pipeline/report/sefaria-evidence.ts`),
as one recorded in a worklist.
