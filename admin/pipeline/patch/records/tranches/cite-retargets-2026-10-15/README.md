# Cross-reference retargets under ruling 10-13 (2026-10-15)

Data PR (v-a) of [`docs/archive/correction-audit.md`](../../../../../../docs/archive/correction-audit.md)
§7: the determined cross-reference retargets of §5.1, PR #178. Review
ledger L64; plan group 6b, "Cross-reference numerals".

## The ruling

Ruling `10-13 correction policy` ([`docs/decisions.md`](../../../../../../docs/decisions.md)
§9, [`admin/entry/ANNOTATIONS.md`](../../../../../entry/ANNOTATIONS.md))
case 1: a transcription error where print is right is corrected with
no annotation. Here the cite's visible text is Jastrow's (`v. בַּר I`)
and names a homograph numeral; Sefaria's linker aimed the link at a
member of the word's family that lacks that numeral, while exactly one
member carries it. The target is Sefaria's error, so the anchor is
re-aimed. A `replace` here carries no annotation (ANNOTATIONS.md §3):
the text is Jastrow's, only Sefaria's target changes.

## The set, recomputed at `b70aab115`

The audit's predicate (§5 and §8), run again on the committed tree
rather than copied from §5.1's table: every internal `<cite>` in any
gloss or unit whose visible text is one word and one Roman numeral
(optionally `)` inside the cite) and whose target carries that numeral
on no form. The family is every form, alternates included, whose
consonants (10-05) equal the cite word's, cut into runs wherever two
members are more than five entries apart; the cite's family is the run
holding its target. A carrier is a family entry other than the target
that carries the numeral, on a form of the cite's word first, else
anywhere on its line. The cite is **determined** when exactly one
carrier has a form spelled as the cite.

Run on the tree at the audit's sha (`98804214d`), the script
reproduces the audit: 296 cites, 222 determined, row for row the
table of §5.1. At `b70aab115` it reads 287 cites and 215 determined:

- **out, 10**: §1.2's ten, retargeted in PR #174 (A00882, M01329,
  H01410, D00595, Q00942, V00833, S00961, S01262, S01321, S01360;
  §5.1 rows 3, 57, 44, 34, 121, 219, 147, 150, 152, 153). PR #174's
  nine withdrawn implied Is moved no row in or out.
- **in, 3, none written here**: H00731 `v. חוּל I ch.` now names a
  carrier, H00319, because PR #177 numbered it I. But #177 aimed this
  cite at H00320, the `ch.` line after `חוּל I`, by the maintainer's
  round 2 tick (that PR's README, block H00321), so it stays. H01057
  and H01105 `v. חֵלֶף I` became determined when PR #177 respelled
  H01100 `חֵלֶף I`; they are the open worklist question `חֵלֶף I`
  ([`headword-worklist.md` § Cross-reference numerals](../../../../../../docs/archive/headword-worklist.md#cross-reference-numerals-2026-10-14)),
  so they wait on its tick. PR #177's other four retargets (O00179,
  U01387, U01388, U01399) were never in the population (their old
  targets carry the numeral), and the Is it set on I00077, U01396 and
  V00522 move no row.

The population moves the same way: 296 − 10 + 1 (H00731) = 287.

Of the 212 §5.1 rows left, 16 are not written here:

- **10 sit in `language_reference`** (the `ch. = h. X I` and `(b. h.;
  X I)` head), which no patch op edits. They wait on review ledger
  L50; table below.
- **6 are `X I ch.`**, which this PR holds for a read: the text after
  the cite is ` ch.`, and Jastrow's `X I ch.` names the `ch.` line
  that follows `X I`, as H00731's tick read it, not the Hebrew `X I`
  the audit's predicate finds. The five `בַּר I ch.` cites read like
  B01153 `בַּר, בָּר, בָּרָא` (`ch. same (= h. שָׂדֶה, יַעַר) forest,
  prairie`), and A00864's `אוּרְיָא II ch.` like A00879 `אוּרְיָא,
  אוּרְוָוא` (`ch. (= b. h. אֻרְוָה) crib; stable`). Neither line
  carries a numeral, so the predicate cannot see them; retargeting to
  the Hebrew entry would trade one wrong link for another. Table
  below. B01237's other cite, `(v. בַּר I, בָּרָא)`, is not followed
  by `ch.` and is written (P000610).

**196 patches, P000595–P000790**, one per row, on 184 entries.

## Where the patches are

The 196 are appended to [`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl),
with one `repaired` record per rid in
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl).
`defect_class` is `cross-reference-target`, `prompt_version` is
`cite-retargets-2026-10-15`, and every `snapshot` is
`sha256:75bbc5ee…`. This directory holds only this README:
`reviewed/` is the only place the loader reads a person's patches.

**Rids with earlier patches.** Two of the 184 already had a reviewed
record: D00844 (P000296, a `reform` of its headword line) and S00151
(P000536, P000577, P000578, its class 3 split and renumber). Their
new patches (P000619, P000718) are added to those records, so each
rid keeps one record, as PR #176 did for U01512 (P000542, P000543
added to Group D's record). Reviewed records are one file, so the
one-tranche-per-rid rule of `consolidate` (agent tranches) does not
bind them; no citing rid has an accepted or carry-over agent patch.
Five citing rids have agent manifest rows with no patches: A00863,
A00887, A03020 and B00211 carry class 11 `needs_human_judgment`
escalations from the 2026-09 sweep, which named these same wrong
targets (`אוּרְיָא II` → A00880; B00211's `בַּד V` → B00097) and
could not write an href; A00887 and A00895 are `clean` in
`tranche-01`. Those rows are unchanged. B00211's other finding, its
`בּוּרְיָא` link, is not a numeral cite and stays open.

## The patch

Each is a `replace` on the sense holding the cite, as P000544–P000553
(PR #174) and P000590–P000594 (PR #177) did. `find` is the source
anchor Sefaria aimed elsewhere; `replace` is the same anchor with
`href` and `data-ref` naming the new target's link key (ruling `10-09
link key`: the rid's headword line as the transform phases leave it,
before any patch, whitespace collapsed), read from the import's own
map. The anchor's text is unchanged byte for byte. For P000595:

```json
{"find": "<a class=\"refLink\" href=\"/Jastrow,_אוֹרְיָא ².1\" data-ref=\"Jastrow, אוֹרְיָא ² 1\"><span dir=\"rtl\">אוּרְיָא</span> II</a>", "replace": "<a class=\"refLink\" href=\"/Jastrow,_אוּרְיָא ².1\" data-ref=\"Jastrow, אוּרְיָא ² 1\"><span dir=\"rtl\">אוּרְיָא</span> II</a>"}
```

`rationale` reads `Case 1 under 10-13 (docs/correction-audit.md §5.1
row N): the cite's text reads "X N", Sefaria links <old rid> "<old
line>", the only family member numbered N is <new rid> "<new line>"`,
then the link key. Where several carriers exist and one alone is
spelled as the cite (9 rows), it says so ("… numbered N that is
spelled as the cite"); where a second member carries N only on
another word of its line (3 rows, `נִיר I`), "… numbered N on a form
of the cite's word".

**The six `find ×2` pairs** (D00003, O00829, O01610, Q00839, R00130,
V00728: one definition holds the same anchor twice). Each row has its
own patch, chained: the first widens `find` with the text that follows
the anchor until it occurs once (`. `, `) ` or `.—Part. `), and the
second, on the definition the first leaves, finds the bare anchor,
which then occurs once. The second's `expected_before` and target hash
are the first's result, so the corpus preflight sees two targets, as
for S01780's chained reforms in PR #177. No `replace` spans both.

**The 30 `†` targets** (66 rows), whose link key no existing link
resolved to at the audit's sha: each key was read from the import's
headword map and checked to resolve to the new rid before the patch
was written. Gate 6 (internalTargets) accepts all of them: 32512/32512,
`unresolved=0`. None had to be stopped. Two keys keep Sefaria's stray
comma, `בִּזְיוּנָא , II` (B00443, 2 rows) and `גַּוָּוזָא , II` (4
rows): P000291 and P000292 reform those headword lines, but a reform
moves only our headword, and the map keys on the line before any patch
(`10-09 link key`), so the comma-less spelling resolves to nothing.

## What the re-import shows

`rm -rf data/entries/[A-Z] && bun data:import && bun qa:format`
changed exactly 184 entry files, the citing rids. Checked by script
against the tree before, every changed entry differs only in 196 cite
`ref`s (the entry stores no href or data-ref), each the patch's old
rid → new rid, the cite's text unchanged; the new target carries the
numeral the cite names, the old one did not, and the new target has a
form whose consonants match the cite's word. The numeral sits on that
form in 55 rows and on another form of its line in 141 (an
abbreviation `X, X׳ I` or a second spelling; the audit's `match`).

The audit's predicate: 287 cites → 91, and 215 determined → 19 (the
10 `language_reference`, 6 `ch.`, H00731, H01057 and H01105): down by
exactly the 196. Every gate is green, gate 6 included. The blessing
reads `Patch corpus: 631 reviewed, 40 accepted, 676 applied` (435 and
480 before) and `Annotations: 95 written (93 print-error, 1 kept, 1
illegible)`, unchanged: these carry none. `bun data:validate` reports
0 problems. No `body/` or `transform/` file and no baseline moved, so
`transform:invariants` did not need to run.

## Waiting on L50: the 10 in `language_reference`

Applied in PR #179 (P000797–P000806), through the new
`language_reference:` patch target:
[`../language-reference-2026-10-15/`](../language-reference-2026-10-15/README.md).

| # | citing rid | the cite in context | Sefaria links | the audit's retarget | scan |
|---|---|---|---|---|---|
| 12 | B00335 | …m. ch. = h.**בּוֹר I** Targ. Prov. XII, 1; XXX, 2 (h… | B00333 `בּוֹר II` | **B00332** `בּוֹר I` † | [149a · leaf 172](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$173/full/1400,/0/default.jpg) |
| 19 | B01155 | …m.(b. h.; ברר; v. **בַּר I**)clear, bright, clean, pure. … | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| 51 | K00999 | … ch. = h.**כּוֹפֶר I** , cyprus flower.—Pl. כְּפוֹרִ… | K00345 `כּוֹפֶר II` | **K00344** `כּוֹפֶר, כֹּפֶר I` | [658a · leaf 681](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$682/full/1400,/0/default.jpg) |
| 58 | M01517 | …m.(b. h.; **לוּן I)**lodging. … | L00290 `לוּן II` | **L00289** `לוּן, לִין I` | [788a · leaf 111](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$112/full/1400,/0/default.jpg) |
| 64 | M02939 | …m.(b. h.; **שָׁנָה I)**lieutenant, viceroy. … | U01571 `שָׁנָה II` | **U01570** `שָׁנָה I` | [857a · leaf 180](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$181/full/1400,/0/default.jpg) |
| 85 | O00581 | … ch. = h.**סִידּוּר I** , arrangement, order, row. … | O00580 `סִידּוּר II` | **O00579** `סִידּוּר, סִדּ׳ I` | [976b · leaf 299](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$300/full/1400,/0/default.jpg) |
| 143 | S00286 | …(b. h.; cmp. **קוּץ I**) [to shrink,] to feel aversio… | S00533 `קוּץ IV` | **S00528** `קוּץ I` † | [1326a · leaf 649](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$650/full/1400,/0/default.jpg) |
| 146 | S00534 | …m.(b. h.; קָוַץ or **קוּץ I**)thorn. … | S00533 `קוּץ IV` | **S00528** `קוּץ I` † | [1339b · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| 179 | U00535 | …(b. h.; cmp. **שְׁיָירָא II**) מִדְבַּר ש׳ desert of Shur (… | U00912 `שְׁיָירָה, שְׁיָירָא III` | **U00911** `שְׁיָירָא II, שְׁיָירָה I` | [1541b · leaf 864](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$865/full/1400,/0/default.jpg) |
| 182 | U00704 | …(b. h.; cmp. **חָרַר I**)to break through, dig; to sea… | H01770 `חָרַר IV` | **H01764** `חָרַר I` † | [1551b · leaf 874](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$875/full/1400,/0/default.jpg) |

## Held for a read: the 6 `X I ch.` cites

Applied in PR #179 (P000791–P000796) to the `ch.` line, under ruling
`10-15 ch. cross-reference`:
[`../language-reference-2026-10-15/`](../language-reference-2026-10-15/README.md).

| # | citing rid | the cite in context | Sefaria links | the audit's retarget | scan |
|---|---|---|---|---|---|
| 2 | A00864 | …, v. **אוּרְיָא II** ch., a. אֵדֶר I.… | A00880 `אוֹרְיָא, אוּרְיָא III` | **A00878** `אוּרְיָא, אוּרְיָה II, אוּרְיָיא` | [33b · leaf 56](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$57/full/1400,/0/default.jpg) |
| 20 | B01157 | …outside, forest &c., v. **בַּר I** ch.… | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| 21 | B01160 | …m. (v. **בַּר I** ch.)… | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| 22 | B01215 | …f. (v. **בַּר I** ch.) outside, rejected; cmp. … | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | [191b · leaf 214](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$215/full/1400,/0/default.jpg) |
| 23 | B01237 | … (v. **בַּר I** ch., Pi. 2) to expel, exile. … | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | [192a · leaf 215](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$216/full/1400,/0/default.jpg) |
| 206 | U02087 | …B. Bath. 90ᵇ ש׳ מלבר, v. **בַּר I** ch. … | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | [1637a · leaf 960](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$961/full/1400,/0/default.jpg) |

## The 196

`where` is §5.1's; `find` widened and `after` mark the chained pairs.

| # | patch | citing rid | the cite in context | Sefaria links | retarget to | match | where | scan |
|---|---|---|---|---|---|---|---|---|
| 1 | P000595 | A00863 | …, v. **אוּרְיָא II** a. אֻרְוָה.… | A00880 `אוֹרְיָא, אוּרְיָא III` | **A00878** `אוּרְיָא, אוּרְיָה II, אוּרְיָיא` | line | sense | [33b · leaf 56](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$57/full/1400,/0/default.jpg) |
| 4 | P000596 | A00887 | …, v. **אוּרְיָא II** h. a. ch.… | A00880 `אוֹרְיָא, אוּרְיָא III` | **A00878** `אוּרְיָא, אוּרְיָה II, אוּרְיָיא` | line | sense | [34a · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| 5 | P000597 | A00895 | …, v. **אוּרְיָא I**… | A00878 `אוּרְיָא, אוּרְיָה II, אוּרְיָיא` | **A00877** `אוּרְיָא, אוּרְיָה I, אוּרִית` | line | sense | [34b · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| 6 | P000598 | A02560 | …f. = **אִסְטְרַטְיָא I**, camp, station. … | A02413 `אִסְטְרַטְיָא II, אִסְרַטְיָא, אִיסְ׳` | **A02412** `אִסְטְרַטְיָא, אִיסְ׳ I` | line | sense | [98b · leaf 121](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$122/full/1400,/0/default.jpg) |
| 7 | P000599 | A03020 | …f.(b. h.; v. **אוּרְיָא II**) manger, crib.—Pl. אֻרְווֹת. … | A00880 `אוֹרְיָא, אוּרְיָא III` | **A00878** `אוּרְיָא, אוּרְיָה II, אוּרְיָיא` | line | sense | [116a · leaf 139](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$140/full/1400,/0/default.jpg) |
| 8 | P000600 | B00051 | …, v. **בָּב I** a. בָּבִיתָא.… | B00050 `בָּב II, בַּב נַהֲרָא` | **B00049** `בָּב, בָּאב, בָּבָא I` | line | sense | [136b · leaf 159](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$160/full/1400,/0/default.jpg) |
| 9 | P000601 | B00058 | …he innermost or the gates of His thought, v. **בָּב I**]. … | B00050 `בָּב II, בַּב נַהֲרָא` | **B00049** `בָּב, בָּאב, בָּבָא I` | line | sense | [136b · leaf 159](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$160/full/1400,/0/default.jpg) |
| 10 | P000602 | B00211 | … c. (denom. of **בַּד V**) a mat of reeds. [The best ve… | B00097 `בַּד IV` | **B00098** `בַּד V` † | form | sense | [144a · leaf 167](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$168/full/1400,/0/default.jpg) |
| 11 | P000603 | B00224 | …Targ. Ps. CXIX, 22.—V. **בִּיזָּא II**.… | B00560 `בִּיזָּא I, בִּזָּא, בִּיזְתָא` | **B00561** `בִּיזָּא, בִּזָּא II, בִּיזְתָא, בִּזְּתָא` | line | sense | [144b · leaf 167](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$168/full/1400,/0/default.jpg) |
| 13 | P000604 | B00367 | …. (v. ברך) something hollow, absurdity; cmp. **בּוֹר I**. … | B00333 `בּוֹר II` | **B00332** `בּוֹר I` † | form | sense | [150b · leaf 173](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$174/full/1400,/0/default.jpg) |
| 14 | P000605 | B00450 | …, v. **בִּזְיוּנָא II**… | B00442 `בִּזְיוּנָא I, בִּיזְיוּנָא, בֵּי זְיוּנָא, בֵּי זְיָינָא` | **B00443** `בִּזְיוּנָא II` † | form | sense | [153b · leaf 176](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$177/full/1400,/0/default.jpg) |
| 15 | P000606 | B00453 | …, v. **בִּזְיוּנָא II**… | B00442 `בִּזְיוּנָא I, בִּיזְיוּנָא, בֵּי זְיוּנָא, בֵּי זְיָינָא` | **B00443** `בִּזְיוּנָא II` † | form | sense | [153b · leaf 176](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$177/full/1400,/0/default.jpg) |
| 16 | P000607 | B00564 | …13 (ref. to אעידך ib.; cmp. בִּיזְּתָא s. v. **בִּיזָּא II**) כמה ב׳ וכ׳ how often did I g… | B00560 `בִּיזָּא I, בִּזָּא, בִּיזְתָא` | **B00561** `בִּיזָּא, בִּזָּא II, בִּיזְתָא, בִּזְּתָא` | line | sense | [160a · leaf 183](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$184/full/1400,/0/default.jpg) |
| 17 | P000608 | B00981 | …trample upon; hence (with ב־) to despise; v. **בְּזֵי I**; cmp. בְּטַשׁ.… | B00436 `בְּזֵי, בְּזָא II` | **B00435** `בְּזֵי, בְּזָא I` | line | sense | [178a · leaf 201](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$202/full/1400,/0/default.jpg) |
| 18 | P000609 | B01142 | … בַּקָּרִין (v. בָּקַר, cmp. b. h. בַּעַר a. **בּוֹר I**) [empty,] light-minded, thoug… | B00333 `בּוֹר II` | **B00332** `בּוֹר I` † | form | sense | [187b · leaf 210](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$211/full/1400,/0/default.jpg) |
| 24 | P000610 | B01237 | … (v. **בַּר I**, בָּרָא) to grow wild. … | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | form | sense | [192a · leaf 215](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$216/full/1400,/0/default.jpg) |
| 25 | P000611 | C00041 | …Ib. 8ᵃ, v. **חִיזְרָא I**.—Pl. גְּבָבֵי. … | H00702 `חִיזְרָא, חִזְ׳ II` | **H00701** `חִיזְרָא, חִזְ׳ I` | line | sense | [204a · leaf 227](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$228/full/1400,/0/default.jpg) |
| 26 | P000612 | C00269 | …גַּיֵּיב, v. **גִּיב I**. [Targ. Prov. IX, 3 Ms., v. ג… | C00610 `גִּיב II` | **C00609** `גִּיב I, גּוּב` | form | sense | [216b · leaf 239](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$240/full/1400,/0/default.jpg) |
| 27 | P000613 | C00343 | …castrate, v. **גַּוָּוזָא II**.… | C00328 `גַּוָּוזָא I` | **C00329** `גַּוָּוזָא II` † | form | sense | [220a · leaf 243](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$244/full/1400,/0/default.jpg) |
| 28 | P000614 | C00351 | …pr. n. pl. (a fictitious denom. of **גַּוָּוזָא II**) Gavzania (Eunuchia), a ficti… | C00328 `גַּוָּוזָא I` | **C00329** `גַּוָּוזָא II` † | form | sense | [220b · leaf 243](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$244/full/1400,/0/default.jpg) |
| 29 | P000615 | C01130 | … גוזז, a. מגנחין for מְגַוְּוזִין, denom. of **גַּוָּוזָא II**. Cmp. form of letters, Sabb. … | C00328 `גַּוָּוזָא I` | **C00329** `גַּוָּוזָא II` † | form | sense | [259a · leaf 282](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$283/full/1400,/0/default.jpg) |
| 30 | P000616 | D00003 | …את) this; with prefix ה, (הֲדָא) הָדָא, cmp. **אָדָא I**. … | A00372 `אָדָא IV` | **A00369** `אָדָא I, הָדָא` † | form | sense, find ×2; `find` widened | [275a · leaf 298](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$299/full/1400,/0/default.jpg) |
| 31 | P000617 | D00003 | …top הדא אמרה היא הדא וכ׳ this proves &c., v. **אָדָא I**.—הדא היא דכתיב (abbr. הה״ד) i… | A00372 `אָדָא IV` | **A00369** `אָדָא I, הָדָא` † | form | sense, find ×2; after P000616 | [275a · leaf 298](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$299/full/1400,/0/default.jpg) |
| 32 | P000618 | D00353 | … M. דודאי; Rashi: the lord of my village, v. **דּוּרָא I**).… | D00351 `דּוּרָא IV` | **D00347** `דּוּרָא I` † | form | sense | [289b · leaf 312](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$313/full/1400,/0/default.jpg) |
| 33 | P000619 | D00361 | …, v. **דּוּרָא I**, II.… | D00351 `דּוּרָא IV` | **D00347** `דּוּרָא I` † | form | sense | [289b · leaf 312](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$313/full/1400,/0/default.jpg) |
| 35 | P000620 | D00844 | … v. **דִּילְמָא I**, II.… | D00608 `דִּילְמָא, דִּלְמָא II` | **D00607** `דִּילְמָא, דִּלְמָא I` | line | sense | [310b · leaf 333](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$334/full/1400,/0/default.jpg) |
| 36 | P000621 | D01149 | … a gift, i.e. is this an adequate reward? V. **דִּיסְתָּנָא I**.… | D00668 `דִּיסְתָּנָא, דִּסְ׳ II` | **D00667** `דִּיסְתָּנָא, דִּסְ׳ I` | line | sense | [326b · leaf 349](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$350/full/1400,/0/default.jpg) |
| 37 | P000622 | G00734 | …Keth. 103ᵇ זְרוֹק וכ׳, v. **מָרָה I**. … | M02564 `מָרָה IV` | **M02561** `מָרָה I` † | form | sense | [415a · leaf 438](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$439/full/1400,/0/default.jpg) |
| 38 | P000623 | H00210 | …m. (derisive denominative of **חִדְקָא I**) descendant of a thorny race.… | H00209 `חִדְקָא, חִי׳ II` | **H00208** `חִדְקָא, חִידְ׳ I` | line | sense | [427a · leaf 450](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$451/full/1400,/0/default.jpg) |
| 39 | P000624 | H00519 | …l. 47ᵇ בח׳ resembling wood in appearance, v. **גִּשְׁתָּא I**. … | C01428 `גִּשְׁתָּא, גִּישְׁ׳ II` | **C01427** `גִּשְׁתָּא, גִּישְׁ׳ I` | line | sense | [442b · leaf 465](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$466/full/1400,/0/default.jpg) |
| 40 | P000625 | H00878 | …B. Mets. 103ᵇ Ar. Var., v. **חִיזְרָא I**.… | H00702 `חִיזְרָא, חִזְ׳ II` | **H00701** `חִיזְרָא, חִזְ׳ I` | line | sense | [460a · leaf 483](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$484/full/1400,/0/default.jpg) |
| 41 | P000626 | H01243 | …Gitt. 67ᵇ bot. (Ar. חמותא), v. **דִּיסְתָּנָא I**. … | D00668 `דִּיסְתָּנָא, דִּסְ׳ II` | **D00667** `דִּיסְתָּנָא, דִּסְ׳ I` | line | sense | [481a · leaf 504](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$505/full/1400,/0/default.jpg) |
| 42 | P000627 | H01325 | …Gitt. 67ᵇ דחַנְקָא, v. **דִּיסְתָּנָא I**.… | D00668 `דִּיסְתָּנָא, דִּסְ׳ II` | **D00667** `דִּיסְתָּנָא, דִּסְ׳ I` | line | sense | [485a · leaf 508](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$509/full/1400,/0/default.jpg) |
| 43 | P000628 | H01341 | …m. (denom. of **חִסְדָּא I**) kind, pleasing.—Pl. חִסְדָּא… | H01340 `חִסְדָּא, חִי׳ III` | **H01338** `חֶסֶד, חִסְדָּא, חִיסְ׳ I` | line | sense | [486b · leaf 509](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$510/full/1400,/0/default.jpg) |
| 45 | P000629 | H01653 | …m. (reduplic. of חור, v. **חָרַר I**) [point of a lance, v. Maim. … | H01770 `חָרַר IV` | **H01764** `חָרַר I` † | form | sense | [501a · leaf 524](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$525/full/1400,/0/default.jpg) |
| 46 | P000630 | J00739 | …m.cord, v. **יִתְרָא I**.… | J00752 `יִתְרָא II` | **J00751** `יִתְרָא, יִי׳ I` † | line | sense | [604a · leaf 627](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$628/full/1400,/0/default.jpg) |
| 47 | P000631 | J00746 | …ר, עתר) [to be strong; denom. יֶתֶר cord, v. **יִתְרָא I**,] to be rich, plentiful.… | J00752 `יִתְרָא II` | **J00751** `יִתְרָא, יִי׳ I` † | line | sense | [604b · leaf 627](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$628/full/1400,/0/default.jpg) |
| 48 | P000632 | K00162 | …, v. **כָּהֵן I**… | K00166 `כָּהֵן` | **K00165** `כָּהֵן, כָּהֵין, כַּהֲנָא I` | line | sense | [615a · leaf 638](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$639/full/1400,/0/default.jpg) |
| 49 | P000633 | K00171 | …, v. **כָּהֵן I**… | K00166 `כָּהֵן` | **K00165** `כָּהֵן, כָּהֵין, כַּהֲנָא I` | line | sense | [615b · leaf 638](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$639/full/1400,/0/default.jpg) |
| 50 | P000634 | K00759 | … a. e.—[Kidd. 81ᵇ מכלליה, read: מכלי להו, v. **כְּלֵי I**.]… | K00717 `כְּלֵי, כְּלָא II` | **K00716** `כְּלֵי, כְּלָא I` | line | sense | [644a · leaf 667](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$668/full/1400,/0/default.jpg) |
| 52 | P000635 | L00204 | …M. Kat. 26ᵃ, v. **יִתְרָא I**. … | J00752 `יִתְרָא II` | **J00751** `יִתְרָא, יִי׳ I` † | line | sense | [695a · leaf 18](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$19/full/1400,/0/default.jpg) |
| 53 | P000636 | L00351 | …f. (לחן, cmp. לוח, to join; cmp. זוּג, **לְוִיָּה II**) … | L00254 `לִוִיָּה, לְוִיָּיה I` | **L00255** `לְוִיָּה, לְיִיָּיה II, לִוְיָה` † | line | sense | [703a · leaf 26](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$27/full/1400,/0/default.jpg) |
| 54 | P000637 | M00351 | … f. = **מְהוּלְתָּא II**. … | M00353 `מְהוּלְתָּא I` | **M00354** `מְהוּלְתָּא, מָ׳ II` | line | sense | [737a · leaf 60](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$61/full/1400,/0/default.jpg) |
| 55 | P000638 | M00372 | …, v. **מְהוּלְתָּא II**… | M00353 `מְהוּלְתָּא I` | **M00354** `מְהוּלְתָּא, מָ׳ II` | line | sense | [737b · leaf 60](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$61/full/1400,/0/default.jpg) |
| 56 | P000639 | M01112 | …m. (מְחַח, v. **מְחִי I**) stirred flour in a dish, pas… | M00859 `מְחִי, מְחָא II` | **M00858** `מְחִי, מְחָא I, מְחַח` | line | sense | [772a · leaf 95](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$96/full/1400,/0/default.jpg) |
| 59 | P000640 | M02321 | …ed. 31ᵇ top R. N. (ed. מיצעא).—בבא מציעא. v. **בָּב I**.—[מְצִיעַיָּא, Targ. Prov. XX… | B00050 `בָּב II, בַּב נַהֲרָא` | **B00049** `בָּב, בָּאב, בָּבָא I` | line | sense | [826b · leaf 149](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$150/full/1400,/0/default.jpg) |
| 60 | P000641 | M02374 | …, v. **קִבְלָא II**… | S00066 `קִבְלָא, קִי׳ III` | **S00065** `קִבְלָא, קִי׳ II, קוּבְלָא` | line | sense | [829a · leaf 152](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$153/full/1400,/0/default.jpg) |
| 61 | P000642 | M02410 | …ar ch. VII, Par. 6 (Yalk. Lev. 667 הלקח), v. **סִימְטָא I**.—מ׳ וממכר, v. מִמְכָּר.… | O00700 `סִימְטָא, סִמְ׳ II` | **O00699** `סִימְטָא, סִמְ׳ I` | line | sense | [830b · leaf 153](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$154/full/1400,/0/default.jpg) |
| 62 | P000643 | M02691 | …. XXIII, 25 מחת מ׳ affection of the gall, v. **מָרָה I**; a. e.—… | M02564 `מָרָה IV` | **M02561** `מָרָה I` † | form | sense | [843b · leaf 166](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$167/full/1400,/0/default.jpg) |
| 63 | P000644 | M02803 | …, v. **מֵישְׁרָא I**… | M01319 `מֵישְׁרָא II, מֵישְׁרֵי` | **M01318** `מֵישָׁרָא, מֵישְׁרָא, מֵשְׁ׳ I` | line | sense | [848b · leaf 171](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$172/full/1400,/0/default.jpg) |
| 65 | P000645 | M03062 | …Meg. 6ᵃ, v. **כִּנָּרָא I**.… | K00877 `כִּנְּרָא, כִּנָּרָא II` | **K00876** `כִּנָּרָא, כִּי׳ I` | line | sense | [862a · leaf 185](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$186/full/1400,/0/default.jpg) |
| 66 | P000646 | M03078 | …, v. **מְחִי I**… | M00859 `מְחִי, מְחָא II` | **M00858** `מְחִי, מְחָא I, מְחַח` | line | sense | [863a · leaf 186](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$187/full/1400,/0/default.jpg) |
| 67 | P000647 | N00034 | …, v. **נִיר I**… | N00787 `נִיר IV` | **N00782** `נִיר I, נוּר` † | form | sense | [867a · leaf 190](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$191/full/1400,/0/default.jpg) |
| 68 | P000648 | N00106 | …m. (cmp. **בַּר I**; corresp. to h. סִיב) coverin… | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | form | sense | [870b · leaf 193](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$194/full/1400,/0/default.jpg) |
| 69 | P000649 | N00301 | …, v. **נִגְדָּא I**, II, a. נוּגְרָא.… | N00122 `נִגְדָּא, נִי׳ II` | **N00121** `נִגְדָּא, נִי׳ I` | line | sense | [883b · leaf 206](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$207/full/1400,/0/default.jpg) |
| 70 | P000650 | N00379 | …rg. Deut. IV, 18; a. fr.—Y. Naz. IX, 57ᵈ, v. **צְלֵי I**.—Y. Ned. IV, beg. 39ᶜ, v. חל;… | R00507 `צְלֵי, צְלָא II` | **R00506** `צְלֵי, צְלָא I` | line | sense | [888a · leaf 211](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$212/full/1400,/0/default.jpg) |
| 71 | P000651 | N00416 | … as a verb, v. **נִיר I**… | N00787 `נִיר IV` | **N00782** `נִיר I, נוּר` † | form | sense | [890a · leaf 213](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$214/full/1400,/0/default.jpg) |
| 72 | P000652 | N00704 | …. Y. ib. XV, 13 (not נְסוּכְיָיא); a. fr.—V. **נִסְכָּא I**.… | N00950 `נִסְכָּא, נִי׳ II` | **N00949** `נִסְכָּא, נִי׳ I` | line | sense | [906a · leaf 229](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$230/full/1400,/0/default.jpg) |
| 73 | P000653 | N00869 | …Yoma 64ᵃ נהי נ׳, v. **נְהֵי II**.—הכי נ׳ (abbrev. ה״נ) it is r… | N00259 `נְהֵי I` | **N00261** `נְהֵי, נְהִי II` | form | sense | [913a · leaf 236](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$237/full/1400,/0/default.jpg) |
| 74 | P000654 | N00935 | …Ber. 56ᵇ, v. **נִסָּא I**.… | N00914 `נִסָּא II, נִסָּה, נִי׳` | **N00913** `נֵס, נִסָּא, נִי׳ I` | line | sense | [916b · leaf 239](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$240/full/1400,/0/default.jpg) |
| 75 | P000655 | N00935 | …Lam. R. to I, 1, v. **נִסָּא I**; a. e.… | N00914 `נִסָּא II, נִסָּה, נִי׳` | **N00913** `נֵס, נִסָּא, נִי׳ I` | line | sense | [916b · leaf 239](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$240/full/1400,/0/default.jpg) |
| 76 | P000656 | N01042 | …Orion.—Pl. נְפִילִין, v. **נִיפְלָא I**.… | N00738 `נִיפְלָא II` | **N00737** `נִיפְלָא, נִפְ׳ I` † | line | sense | [924a · leaf 247](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$248/full/1400,/0/default.jpg) |
| 77 | P000657 | N01346 | …kwards (when you attempt to pull it out), v. **חִיזְרָא I**.… | H00702 `חִיזְרָא, חִזְ׳ II` | **H00701** `חִיזְרָא, חִזְ׳ I` | line | sense | [942b · leaf 265](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$266/full/1400,/0/default.jpg) |
| 78 | P000658 | O00088 | …IX, 32 Ms. a. some ed., (ed. Berl. סָבַר, v. **סְבַר I**).—Pl. סַבָּרִין. … | O00090 `סְבַר IV, סִבְרָא, סִי׳, סוֹבָרָא` | **O00085** `סְבַר, סְבֵיר I` | line | sense | [952b · leaf 275](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$276/full/1400,/0/default.jpg) |
| 79 | P000659 | O00090 | …b. Zar. I, 40ᵃ סִיבְרָה (ed. Krot. סוּ׳), v. **סְבַר I**, Ithpa… | O00090 `סְבַר IV, סִבְרָא, סִי׳, סוֹבָרָא` | **O00085** `סְבַר, סְבֵיר I` | line | sense | [952b · leaf 275](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$276/full/1400,/0/default.jpg) |
| 80 | P000660 | O00125 | …, v. **סְגֵי II**, III.… | O00122 `סְגֵי III, סַגְיָא I` | **O00121** `סְגֵי, סְגָא II` | line | sense | [954b · leaf 277](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$278/full/1400,/0/default.jpg) |
| 81 | P000661 | O00157 | …, סִגְנַאי, v. **סִיגְנָא II**… | O00563 `סִיגְנָא I` | **O00564** `סִיגְנָא, סִגְ׳ II, כְּפַר ס׳` | line | sense | [955b · leaf 278](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$279/full/1400,/0/default.jpg) |
| 82 | P000662 | O00160 | …, v. **סִיגְנָא II**… | O00563 `סִיגְנָא I` | **O00564** `סִיגְנָא, סִגְ׳ II, כְּפַר ס׳` | line | sense | [955b · leaf 278](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$279/full/1400,/0/default.jpg) |
| 83 | P000663 | O00569 | …, v. **סִיגְנָא II**… | O00563 `סִיגְנָא I` | **O00564** `סִיגְנָא, סִגְ׳ II, כְּפַר ס׳` | line | sense | [976a · leaf 299](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$300/full/1400,/0/default.jpg) |
| 84 | P000664 | O00579 | … 32 סִידּוּרוֹ של עולם the natural order, v. **סִילּוֹן II**. … | O00658 `סִילּוֹן I` | **O00659** `סִילּוֹן, סִלּ׳ II` | line | sense | [976a · leaf 299](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$300/full/1400,/0/default.jpg) |
| 86 | P000665 | O00658 | … direction opposite to that of its knots, v. **חִיזְרָא I**); Lev. R. s. 4 כסִילָּן.—[Mid… | H00702 `חִיזְרָא, חִזְ׳ II` | **H00701** `חִיזְרָא, חִזְ׳ I` | line | sense | [979b · leaf 302](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$303/full/1400,/0/default.jpg) |
| 87 | P000666 | O00661 | …, v. **סִילּוֹן II**.—… | O00658 `סִילּוֹן I` | **O00659** `סִילּוֹן, סִלּ׳ II` | line | sense | [980a · leaf 303](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$304/full/1400,/0/default.jpg) |
| 88 | P000667 | O00702 | …, v. **סִימְטָא I**… | O00700 `סִימְטָא, סִמְ׳ II` | **O00699** `סִימְטָא, סִמְ׳ I` | line | sense | [981a · leaf 304](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$305/full/1400,/0/default.jpg) |
| 89 | P000668 | O00743 | …s of earth from under seven door-sockets; v. **סִיכְרָא I**.… | O00654 `סִיכְרָא, סִכְ׳ II` | **O00653** `סִיכְרָא, סִכְ׳ I` | line | sense | [983b · leaf 306](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$307/full/1400,/0/default.jpg) |
| 90 | P000669 | O00827 | …d) consumed there (in Moab).—[סִיר thorn, v. **סִירָה I**.]… | O00833 `סִירָה, סִירָא II` | **O00832** `סִירָה, סִירָא I` | line | sense | [986b · leaf 309](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$310/full/1400,/0/default.jpg) |
| 91 | P000670 | O00829 | …m. (v. **סִירָה I**) thorn. Midr. Sam. ch. II, v.… | O00833 `סִירָה, סִירָא II` | **O00832** `סִירָה, סִירָא I` | line | sense, find ×2; `find` widened | [987a · leaf 310](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$311/full/1400,/0/default.jpg) |
| 92 | P000671 | O00829 | …Targ. Is. XXXIV, 13.—[Hebr. סִירָא, v. **סִירָה I**, II).… | O00833 `סִירָה, סִירָא II` | **O00832** `סִירָה, סִירָא I` | line | sense, find ×2; after P000670 | [987a · leaf 310](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$311/full/1400,/0/default.jpg) |
| 93 | P000672 | O00861 | …f. = h. **סִירָה I**, thorn. … | O00833 `סִירָה, סִירָא II` | **O00832** `סִירָה, סִירָא I` | line | sense | [988a · leaf 311](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$312/full/1400,/0/default.jpg) |
| 94 | P000673 | O00929 | …idd. III, 11 בקעת סכני the Valley of S.—Cmp. **סִיגְנָא II**.… | O00563 `סִיגְנָא I` | **O00564** `סִיגְנָא, סִגְ׳ II, כְּפַר ס׳` | line | sense | [992a · leaf 315](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$316/full/1400,/0/default.jpg) |
| 95 | P000674 | O01004 | …make a path, pave.—Denom. מְסִלָּה, סוּלָּם, **סִילּוֹן II**.… | O00658 `סִילּוֹן I` | **O00659** `סִילּוֹן, סִלּ׳ II` | line | sense | [995a · leaf 318](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$319/full/1400,/0/default.jpg) |
| 96 | P000675 | O01224 | …י, v. supra) one whose reputation is bad, v. **בְּזֵי I**. … | B00436 `בְּזֵי, בְּזָא II` | **B00435** `בְּזֵי, בְּזָא I` | line | sense | [1006b · leaf 329](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$330/full/1400,/0/default.jpg) |
| 97 | P000676 | O01402 | …a flame (a superstitious practice); a. e.—V. **סִיפּוּק I**.… | O00789 `סִיפּוּק, סִפּ׳ II` | **O00788** `סִיפּוּק, סִפּ׳ I` | line | sense | [1015b · leaf 338](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$339/full/1400,/0/default.jpg) |
| 98 | P000677 | O01402 | …hich one engrafted on an old tree; a. fr.—V. **סִיפּוּק I**.… | O00789 `סִיפּוּק, סִפּ׳ II` | **O00788** `סִיפּוּק, סִפּ׳ I` | line | sense | [1015b · leaf 338](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$339/full/1400,/0/default.jpg) |
| 99 | P000678 | O01590 | …f. (= **אִסְטְרַטְיָא I**) camp, station. … | A02413 `אִסְטְרַטְיָא II, אִסְרַטְיָא, אִיסְ׳` | **A02412** `אִסְטְרַטְיָא, אִיסְ׳ I` | line | sense | [1025b · leaf 348](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$349/full/1400,/0/default.jpg) |
| 100 | P000679 | O01610 | … (ref. to סָרוּ, Ex. XXXII, 8, cmp. סָרָה a. **סִירָה I**) נעשו ס׳ נעשו כובים (not כזבי… | O00833 `סִירָה, סִירָא II` | **O00832** `סִירָה, סִירָא I` | line | sense, find ×2; `find` widened | [1026b · leaf 349](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$350/full/1400,/0/default.jpg) |
| 101 | P000680 | O01610 | … (ref. to סָרוּ, Ex. XXXII, 8, cmp. סָרָה a. **סִירָה I**) נעשו ס׳ נעשו כובים (not כזבי… | O00833 `סִירָה, סִירָא II` | **O00832** `סִירָה, סִירָא I` | line | sense, find ×2; after P000679 | [1026b · leaf 349](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$350/full/1400,/0/default.jpg) |
| 102 | P000681 | P00089 | … שעִגְּלוּ וכ׳ (v. R. S. to Ohol. l. c.), v. **פִּיקָא I**.… | Q00797 `פִּיקָא, פִּיקָה II` | **Q00796** `פִּיקָא, פִּיקָה I` | line | sense | [1041a · leaf 364](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$365/full/1400,/0/default.jpg) |
| 103 | P000682 | P00118 | … f. = **אָדָא I**. … | A00372 `אָדָא IV` | **A00369** `אָדָא I, הָדָא` † | form | sense | [1043a · leaf 366](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$367/full/1400,/0/default.jpg) |
| 104 | P000683 | P00150 | …Lam. R. to II, 13 (ref. to אעידך, ib.), v. **בִּיזָּא II**.… | B00560 `בִּיזָּא I, בִּזָּא, בִּיזְתָא` | **B00561** `בִּיזָּא, בִּזָּא II, בִּיזְתָא, בִּזְּתָא` | line | sense | [1044b · leaf 367](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$368/full/1400,/0/default.jpg) |
| 105 | P000684 | P00291 | …t. on המחשב עתים explain עונן as denomin. of **עוֹנָה I**]; Tosef. Sabb. VII (VIII), 14… | P00297 `עוֹנָה IV` | **P00294** `עוֹנָה I` † | form | sense | [1053b · leaf 376](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$377/full/1400,/0/default.jpg) |
| 106 | P000685 | P00573 | … a man, I vow his value (instead of ערכו, v. **סִידּוּר I**). … | O00580 `סִידּוּר II` | **O00579** `סִידּוּר, סִדּ׳ I` | line | sense | [1070a · leaf 393](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$394/full/1400,/0/default.jpg) |
| 107 | P000686 | P00591 | …, v. **עִימְעוּם I**… | P00596 `עִימְעוּם, עִמְ׳ II` | **P00595** `עִימְעוּם, עִמְעוּם I` | line | sense | [1070b · leaf 393](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$394/full/1400,/0/default.jpg) |
| 108 | P000687 | P00613 | … ch. = **עִינּוּי I**. … | P00612 `עִינּוּי, עִנּ׳ II` | **P00611** `עִינּוּי, עִנּ׳ I` | line | sense | [1072b · leaf 395](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$396/full/1400,/0/default.jpg) |
| 109 | P000688 | P00624 | …, v. **עִינּוּיָא I**.—[Lam. R. to IV, 18 עיניתיה s… | P00614 `עִינּוּיָא, עִנּ׳ II` | **P00613** `עִינּוּיָא, עִנּ׳ I` † | line | sense | [1072b · leaf 395](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$396/full/1400,/0/default.jpg) |
| 110 | P000689 | P00871 | …, v. **עִימְעוּם I**… | P00596 `עִימְעוּם, עִמְ׳ II` | **P00595** `עִימְעוּם, עִמְעוּם I` | line | sense | [1087b · leaf 410](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$411/full/1400,/0/default.jpg) |
| 111 | P000690 | P00970 | …eaks, and all repeat in chorus after her, v. **עִינּוּי I**. … | P00612 `עִינּוּי, עִנּ׳ II` | **P00611** `עִינּוּי, עִנּ׳ I` | line | sense | [1093a · leaf 416](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$417/full/1400,/0/default.jpg) |
| 112 | P000691 | P00970 | …M. Kat. III, 9, מְעַנּוֹת, v. **עִינּוּי I**.… | P00612 `עִינּוּי, עִנּ׳ II` | **P00611** `עִינּוּי, עִנּ׳ I` | line | sense | [1093a · leaf 416](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$417/full/1400,/0/default.jpg) |
| 113 | P000692 | P01021 | …f. = h. **עוֹנָה I**, … | P00297 `עוֹנָה IV` | **P00294** `עוֹנָה I` † | form | sense | [1097a · leaf 420](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$421/full/1400,/0/default.jpg) |
| 114 | P000693 | P01522 | …. h.; contr. of עדת , v. עוּד; or of ענת, v. **עוֹנָה I**) [duration, turn,] … | P00297 `עוֹנָה IV` | **P00294** `עוֹנָה I` † | form | sense | [1128a · leaf 451](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$452/full/1400,/0/default.jpg) |
| 115 | P000694 | P01522 | …Tosef. Ber. I, 1; a. e., v. **עוֹנָה I**.… | P00297 `עוֹנָה IV` | **P00294** `עוֹנָה I` † | form | sense | [1128a · leaf 451](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$452/full/1400,/0/default.jpg) |
| 116 | P000695 | Q00440 | …. פַּחִים (only in connection with צנים), v. **צִנָּה III**.—[For פחי נפש, v. פְּחִי.]… | R00608 `צִנָּה II, צִינָּה II` | **R00609** `צִנָּה, צִינָּה III` † | line | sense | [1151a · leaf 474](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$475/full/1400,/0/default.jpg) |
| 117 | P000696 | Q00500 | …, v. **פִּיטְמָא I**… | Q00629 `פִּיטְמָא II, פִּיטְמָה, פִּטְ׳` | **Q00628** `פִּיטְמָא, פִּטְ׳ I` | line | sense | [1154b · leaf 477](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$478/full/1400,/0/default.jpg) |
| 118 | P000697 | Q00538 | …Sabb. XX, 4; Y. ib. 17ᶜ bot., v. **רְעִי I**.… | T00893 `רְעִי, רְיעִי II` | **T00892** `רְעִי, רֵיעִי I` † | line | sense | [1156b · leaf 479](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$480/full/1400,/0/default.jpg) |
| 119 | P000698 | Q00839 | …f. = **פֵּירוּכָא I**. … | Q00838 `פֵּירוּכָא, פֵּר׳ II` | **Q00837** `פֵּירוּכָא, פֵּר׳ I` | line | sense, find ×2; `find` widened | [1170b · leaf 493](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$494/full/1400,/0/default.jpg) |
| 120 | P000699 | Q00839 | …Targ. Y. Lev. II, 16, v. **פֵּירוּכָא I**.… | Q00838 `פֵּירוּכָא, פֵּר׳ II` | **Q00837** `פֵּירוּכָא, פֵּר׳ I` | line | sense, find ×2; after P000698 | [1170b · leaf 493](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$494/full/1400,/0/default.jpg) |
| 122 | P000700 | Q01284 | …, v. **פִּסְיוֹנָא II**… | Q01279 `פִּסְיוֹן, פִּסְיוֹנָא I` | **Q01280** `פִּסְיוֹנָא, פִּיסְ׳ II` | line | sense | [1195a · leaf 518](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$519/full/1400,/0/default.jpg) |
| 123 | P000701 | Q01373 | …) 3 (Var. פָּאוֹטוֹת); Y. ib. V, 47ᶜ top, v. **שִׁיטָּה III**; Y. Erub. VII, 24ᶜ bot. פַּיּ… | U00883 `שִׁיטָּה II` | **U00884** `שִׁיטָּה, שִׁטָּה III` † | line | sense | [1201b · leaf 524](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$525/full/1400,/0/default.jpg) |
| 124 | P000702 | Q01449 | …דָהּ and does not visit her (in due time, v. **עוֹנָה I**). … | P00297 `עוֹנָה IV` | **P00294** `עוֹנָה I` † | form | sense | [1206b · leaf 529](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$530/full/1400,/0/default.jpg) |
| 125 | P000703 | Q01983 | …Tosef. Neg. IV, 12 neck, v. **פִּיקָא I**.—Pl. as ab. Y. Taan. II, 66ᵃ … | Q00797 `פִּיקָא, פִּיקָה II` | **Q00796** `פִּיקָא, פִּיקָה I` | line | sense | [1240a · leaf 563](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$564/full/1400,/0/default.jpg) |
| 126 | P000704 | Q02021 | …hey did not interpret (the verse) to you; v. **שָׁנָה I**. … | U01571 `שָׁנָה II` | **U01570** `שָׁנָה I` | form | sense | [1241b · leaf 564](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$565/full/1400,/0/default.jpg) |
| 127 | P000705 | R00130 | …Midd. II, 3, a. e., v. **נְחוּשְׁתָּן I**.—Part. pass. מוּצְהָב; f. מוּ… | N00482 `נְחוּשְׁתָּן, נְחֻשְׁ׳ II` | **N00481** `נְחוּשְׁתָּן, נְחֻשְׁ׳ I` | line | sense, find ×2; `find` widened | [1264a · leaf 587](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$588/full/1400,/0/default.jpg) |
| 128 | P000706 | R00130 | …Yoma 38ᵃ (some ed. מְצוּהֶבֶת Pu.), v. **נְחוּשְׁתָּן I**. [Ib. והיתה מאירה, Ms. M. 2 מ… | N00482 `נְחוּשְׁתָּן, נְחֻשְׁ׳ II` | **N00481** `נְחוּשְׁתָּן, נְחֻשְׁ׳ I` | line | sense, find ×2; after P000705 | [1264a · leaf 587](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$588/full/1400,/0/default.jpg) |
| 129 | P000707 | R00241 | … (cmp. זוּר) to press, v. **צִיר I**.]… | R00452 `צִיר IV` | **R00448** `צִיר I` † | form | sense | [1270b · leaf 593](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$594/full/1400,/0/default.jpg) |
| 130 | P000708 | R00399 | …f. = h. **צִנָּה III**, cold. … | R00608 `צִנָּה II, צִינָּה II` | **R00609** `צִנָּה, צִינָּה III` † | line | sense | [1278a · leaf 601](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$602/full/1400,/0/default.jpg) |
| 131 | P000709 | R00416 | …, v. **צִיפּוֹרֵי I**, II.… | R00414 `צִיפּוֹרֵי, צִיפּוֹרִים, צִיפּוֹרִין, צִפּ׳ II` | **R00413** `צִיפּוֹרֵי, צִיפּוֹרִין, צִפּ׳ I` | line | sense | [1279a · leaf 602](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$603/full/1400,/0/default.jpg) |
| 132 | P000710 | R00460 | …m. (denom. of **צִיר I**) one whose eyes discharge a b… | R00452 `צִיר IV` | **R00448** `צִיר I` † | form | sense | [1281a · leaf 604](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$605/full/1400,/0/default.jpg) |
| 133 | P000711 | R00488 | …is is no prayer (need not be prayed for), v. **צִינְּתָא I**. … | R00400 `צִינְּתָא, צִנְּ׳ II` | **R00399** `צִינְּתָא, צִנְּ׳ I` | line | sense | [1282b · leaf 605](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$606/full/1400,/0/default.jpg) |
| 134 | P000712 | R00615 | …splash from a spout (cmp. **סִילּוֹן II**), trnsf. צ׳ (של רוק) ejection… | O00658 `סִילּוֹן I` | **O00659** `סִילּוֹן, סִלּ׳ II` | line | sense | [1291a · leaf 614](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$615/full/1400,/0/default.jpg) |
| 135 | P000713 | R00681 | … c. (b. h.; v. **צְפַר I**) … | R00715 `צְפַר IV, צַפְרָא` | **R00712** `צְפַר I` † | form | sense | [1295b · leaf 618](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$619/full/1400,/0/default.jpg) |
| 136 | P000714 | R00687 | …s) like getting a nail out of the gullet, v. **צִיפּוֹרֵי I**; a. fr.—… | R00414 `צִיפּוֹרֵי, צִיפּוֹרִים, צִיפּוֹרִין, צִפּ׳ II` | **R00413** `צִיפּוֹרֵי, צִיפּוֹרִין, צִפּ׳ I` | line | sense | [1296a · leaf 619](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$620/full/1400,/0/default.jpg) |
| 137 | P000715 | R00687 | … v. שְׁחֵלֶת.—[Ex. R. s. 3, a. e. ציפורן, v. **צִיפּוֹרִין II**.]… | R00413 `צִיפּוֹרֵי, צִיפּוֹרִין, צִפּ׳ I` | **R00414** `צִיפּוֹרֵי, צִיפּוֹרִים, צִיפּוֹרִין, צִפּ׳ II` | line | sense | [1296a · leaf 619](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$620/full/1400,/0/default.jpg) |
| 138 | P000716 | R00805 | …se it does not go by the name of חָגָב)?; v. **נֵצֶר I**.… | N01147 `נֵצֶר IV` | **N01144** `נֵצֶר I` † | form | sense | [1305a · leaf 628](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$629/full/1400,/0/default.jpg) |
| 139 | P000717 | S00070 | …c book?; Tanḥ. Ḥuck. 6; a. fr.—[Ber. 62ᵃ, v. **קִבְלָא II**.]—[In later Hebrew ק׳ Kabbala… | S00066 `קִבְלָא, קִי׳ III` | **S00065** `קִבְלָא, קִי׳ II, קוּבְלָא` | line | sense | [1310a · leaf 633](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$634/full/1400,/0/default.jpg) |
| 140 | P000718 | S00097 | …ing of the womb do not apply, unless &c., v. **פִּיקָא I**; Tosef. ib. VIII, 8; a. fr.… | Q00797 `פִּיקָא, פִּיקָה II` | **Q00796** `פִּיקָא, פִּיקָה I` | line | sense | [1312b · leaf 635](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$636/full/1400,/0/default.jpg) |
| 141 | P000719 | S00151 | …Ber. 8ᵃ מְקַדְּמֵי וכ׳; קַדִּימוּ וחשיכו, v. **חֲשַׁךְ I**. … | H01849 `חֲשַׁךְ, חֲשׁוֹךְ II` | **H01848** `חֲשַׁךְ, חֲשׁוֹךְ I` | line | sense | [1316b · leaf 639](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$640/full/1400,/0/default.jpg) |
| 142 | P000720 | S00231 | …, v. **קִבְלָא II**… | S00066 `קִבְלָא, קִי׳ III` | **S00065** `קִבְלָא, קִי׳ II, קוּבְלָא` | line | sense | [1323b · leaf 646](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$647/full/1400,/0/default.jpg) |
| 144 | P000721 | S00412 | …ng women) must not sing dirges, v. קִינָה a. **עִינּוּי I**; a. fr.… | P00612 `עִינּוּי, עִנּ׳ II` | **P00611** `עִינּוּי, עִנּ׳ I` | line | sense | [1334a · leaf 657](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$658/full/1400,/0/default.jpg) |
| 145 | P000722 | S00491 | …Ber. 55ᵇ; B. Mets. 38ᵇ, v. **פִּילָא I**. … | Q00666 `פִּילָא IV` | **Q00663** `פִּיל, פִּילָא I` † | form | sense | [1337b · leaf 660](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$661/full/1400,/0/default.jpg) |
| 148 | P000723 | S00964 | …ן) a field irrigated by swipe and bucket; v. **סִילּוֹן II**.… | O00658 `סִילּוֹן I` | **O00659** `סִילּוֹן, סִלּ׳ II` | line | sense | [1360a · leaf 683](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$684/full/1400,/0/default.jpg) |
| 149 | P000724 | S01024 | …ion is called ḳinah, when one speaks &c., v. **עִינּוּי I**. … | P00612 `עִינּוּי, עִנּ׳ II` | **P00611** `עִינּוּי, עִנּ׳ I` | line | sense | [1362b · leaf 685](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$686/full/1400,/0/default.jpg) |
| 151 | P000725 | S01278 | …, v. **קְלַסְטֵיר I**… | S01385 `קְלַסְטֵיר, קְלַסְטָר II, קְלַסְתָּר` | **S01384** `קְלַסְטֵיר, קְלַסְטָר I` | line | sense | [1373a · leaf 696](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$697/full/1400,/0/default.jpg) |
| 154 | P000726 | S01376 | … II, 4; Yoma 38ᵃ קלוניתא (Ms. M. קלניתא), v. **נְחוּשְׁתָּן I**.… | N00482 `נְחוּשְׁתָּן, נְחֻשְׁ׳ II` | **N00481** `נְחוּשְׁתָּן, נְחֻשְׁ׳ I` | line | sense | [1379a · leaf 702](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$703/full/1400,/0/default.jpg) |
| 155 | P000727 | S01439 | …Ib. 48ᵇ; a. fr.—בבא ק׳, v. **בָּב I**.—Pl. קַמָּאֵי. … | B00050 `בָּב II, בַּב נַהֲרָא` | **B00049** `בָּב, בָּאב, בָּבָא I` | line | sense | [1383b · leaf 706](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$707/full/1400,/0/default.jpg) |
| 156 | P000728 | S01462 | …m. (preced.; cmp. **קוּץ I**) [shrinking,] feeling aversio… | S00533 `קוּץ IV` | **S00528** `קוּץ I` † | form | sense | [1385a · leaf 708](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$709/full/1400,/0/default.jpg) |
| 157 | P000729 | S01486 | …, v. **קוּמְצָא I**, II.… | S00403 `קוּמְצָא, קָמְצָא II` | **S00402** `קוּמְצָא, קוֹ׳, קָמְצָא I` | line | sense | [1386b · leaf 709](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$710/full/1400,/0/default.jpg) |
| 158 | P000730 | S01508 | …קַנֵּי, v. **קְנֵי I**.… | S01569 `קְנֵי, קְנָא II` | **S01567** `קְנֵי, קְנָא I` | line | sense | [1387b · leaf 710](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$711/full/1400,/0/default.jpg) |
| 159 | P000731 | S01795 | …m. (קְצַץ; cmp. **גַּוָּוזָא II**) castrate, eunuch.—Pl. קְצוּצ… | C00328 `גַּוָּוזָא I` | **C00329** `גַּוָּוזָא II` † | form | sense | [1404b · leaf 727](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$728/full/1400,/0/default.jpg) |
| 160 | P000732 | S01841 | …Y. Kil. I, 27ᵃ קְצָצוֹי, v. **חֲרוּבָא I**.… | H01614 `חֲרוּבָא, חֲרוּבָה II, כפר ח׳` | **H01613** `חֲרוּבָא, חֲרוּבָה I` † | line | sense | [1408a · leaf 731](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$732/full/1400,/0/default.jpg) |
| 161 | P000733 | S01930 | …, v. **קִרְוָא I**, II.… | S01924 `קִרְוָא, קִרְוָוא, קִי׳ II, קִרְוָה, קֵרְוָוה` | **S01923** `קִרְוָא, קִרְוָוא, קִי׳ I` | line | sense | [1413a · leaf 736](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$737/full/1400,/0/default.jpg) |
| 162 | P000734 | S02080 | … (cmp. **קוֹרָה I**) satisfaction, pleasure. … | S00587 `קוֹרָה IV` | **S00584** `קוֹרָה I` † | form | sense | [1421a · leaf 744](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$745/full/1400,/0/default.jpg) |
| 163 | P000735 | S02103 | …B. Mets. 79ᵃ; B. Kam. 3ᵃ, v. **כְּלֵי I**. … | K00717 `כְּלֵי, כְּלָא II` | **K00716** `כְּלֵי, כְּלָא I` | line | sense | [1422b · leaf 745](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$746/full/1400,/0/default.jpg) |
| 164 | P000736 | T00013 | …p. a. Pes., v. Rabb. D. S. a. l. note 90, v. **רְעִי I**.]—בית ר׳ digestive organ, cro… | T00893 `רְעִי, רְיעִי II` | **T00892** `רְעִי, רֵיעִי I` † | line | sense | [1436a · leaf 759](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$760/full/1400,/0/default.jpg) |
| 165 | P000737 | T00218 | …Tosef. Ber. I, 1, v. **עוֹנָה I**; a. e.… | P00297 `עוֹנָה IV` | **P00294** `עוֹנָה I` † | form | sense | [1450a · leaf 773](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$774/full/1400,/0/default.jpg) |
| 166 | P000738 | T00245 | …Gen. I, 28; cmp. **נִיר I**], to plough. … | N00787 `נִיר IV` | **N00782** `נִיר I, נוּר` † | form | sense | [1452a · leaf 775](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$776/full/1400,/0/default.jpg) |
| 167 | P000739 | T00329 | … I Deut. XXXII, 24 רווחין, read: רוּחִין, v. **רְוַוח I**.]… | T00329 `רְוַוח, רְוַח II, רַוְוחָא, רַוְחָא` | **T00327** `רְוַוח, רְוַח I` | line | sense | [1457a · leaf 780](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$781/full/1400,/0/default.jpg) |
| 168 | P000740 | T00346 | …Targ. Y. I ib. רווחין (corr. acc.), v. **רְוַוח I**; a. fr.—Y. Shek. V, end, 49ᵇ … | T00329 `רְוַוח, רְוַח II, רַוְוחָא, רַוְחָא` | **T00327** `רְוַוח, רְוַח I` | line | sense | [1458b · leaf 781](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$782/full/1400,/0/default.jpg) |
| 169 | P000741 | T00665 | …, v. **דִּיסְתָּנָא I**… | D00668 `דִּיסְתָּנָא, דִּסְ׳ II` | **D00667** `דִּיסְתָּנָא, דִּסְ׳ I` | line | sense | [1475b · leaf 798](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$799/full/1400,/0/default.jpg) |
| 170 | P000742 | T00717 | …es so as to look like Daleths.—[ריש לקיש, v. **לָקִישׁ I**.]… | L00694 `לָקִישׁ II, לַקִּישׁ, לְקִישָׁא` | **L00693** `לָקִישׁ, לְקִישָׁא I` † | line | sense | [1477b · leaf 800](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$801/full/1400,/0/default.jpg) |
| 171 | P000743 | T00814 | …oes his trickery consist? Ib. לסגויי בר׳, v. **סְגֵי II**; a. e.… | O00122 `סְגֵי III, סַגְיָא I` | **O00121** `סְגֵי, סְגָא II` | line | sense | [1483a · leaf 806](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$807/full/1400,/0/default.jpg) |
| 172 | P000744 | T00895 | …m. (v. **רְעִי I**) pasture. Targ. II Esth. IV, … | T00893 `רְעִי, רְיעִי II` | **T00892** `רְעִי, רֵיעִי I` † | line | sense | [1487a · leaf 810](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$811/full/1400,/0/default.jpg) |
| 173 | P000745 | T01055 | …Ḥull. 63ᵃ Ar., v. **שְׁרַק I**.… | U02022 `שְׁרַק II` | **U02021** `שְׁרַק I, שְׁרֵיק` | form | sense | [1498a · leaf 821](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$822/full/1400,/0/default.jpg) |
| 174 | P000746 | U00132 | …m. (שְׁבַק; v. **שִׁבְקָא I**) abandoned; spontaneous growt… | U00171 `שִׁבְקָא, שִׁי׳ II` | **U00170** `שִׁבְקָא, שִׁי׳ I` | line | sense | [1514b · leaf 837](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$838/full/1400,/0/default.jpg) |
| 175 | P000747 | U00141 | … (שבל to drag along, cmp. b. h. שֹׁבֶל; cmp. **שִׁלְשׁוּל III**) snail without the shell. … | U01392 `שִׁלְשׁוּל, שִׁי׳ II` | **U01393** `שִׁלְשׁוּל, שׁי׳ III` † | line | sense | [1515a · leaf 838](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$839/full/1400,/0/default.jpg) |
| 176 | P000748 | U00254 | …, v. **שִׁידָּא I**… | U00821 `שִׁידָּא II` | **U00820** `שִׁידָּא I, שִׁדָּא` | form | sense | [1524a · leaf 847](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$848/full/1400,/0/default.jpg) |
| 177 | P000749 | U00383 | …, Y. Kidd. II, 62ᵈ ש׳ של שיער, v. **שִׁיטָּה III**… | U00883 `שִׁיטָּה II` | **U00884** `שִׁיטָּה, שִׁטָּה III` † | line | sense | [1532a · leaf 855](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$856/full/1400,/0/default.jpg) |
| 178 | P000750 | U00526 | …, v. **שׁוּקָא I**… | U00525 `שׁוּקָא II` | **U00524** `שׁוּקָא I, שׁוּקָה` | form | sense | [1541a · leaf 864](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$865/full/1400,/0/default.jpg) |
| 180 | P000751 | U00543 | …m. (Shaf. of **רְבֵי I**) a species of cedar. … | T00084 `רְבֵי, רְבָא III` | **T00082** `רְבֵי, רְבָא I` | line | sense | [1542a · leaf 865](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$866/full/1400,/0/default.jpg) |
| 181 | P000752 | U00629 | …, v. **שָׁחוֹר I**… | U00628 `שָׁחוֹר II` | **U00627** `שָׁחוֹר I, שְׁחוֹרָה` † | form | sense | [1546b · leaf 869](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$870/full/1400,/0/default.jpg) |
| 183 | P000753 | U00706 | … h.; cmp. חָרַר III)to be charred, black.—V. **שָׁחוֹר I**.… | U00628 `שָׁחוֹר II` | **U00627** `שָׁחוֹר I, שְׁחוֹרָה` † | form | sense | [1551b · leaf 874](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$875/full/1400,/0/default.jpg) |
| 184 | P000754 | U00736 | …Sabb. 152ᵃ, v. **זִימָּה I**; a. e.—Pl. שְׁטוּפִין. … | G00362 `זִימָּה, זִמָּה II` | **G00361** `זִימָּה, זִמָּה I` | line | sense | [1552b · leaf 875](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$876/full/1400,/0/default.jpg) |
| 185 | P000755 | U00864 | …Gitt. 19ᵃ; Sabb. 104ᵇ, v. **שָׁחוֹר I**. … | U00628 `שָׁחוֹר II` | **U00627** `שָׁחוֹר I, שְׁחוֹרָה` † | form | sense | [1559b · leaf 882](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$883/full/1400,/0/default.jpg) |
| 186 | P000756 | U00888 | … h. form) = h. **שִׁיטָּה III**, … | U00883 `שִׁיטָּה II` | **U00884** `שִׁיטָּה, שִׁטָּה III` † | line | sense | [1560b · leaf 883](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$884/full/1400,/0/default.jpg) |
| 187 | P000757 | U00888 | …ed two modes of developing the same idea, v. **שִׁיטָּה III**. … | U00883 `שִׁיטָּה II` | **U00884** `שִׁיטָּה, שִׁטָּה III` † | line | sense | [1560b · leaf 883](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$884/full/1400,/0/default.jpg) |
| 188 | P000758 | U00973 | …yikra, Ḥob., ch. XIX, Par. 11; Meïl. 18ᵃ, v. **שִׁיקּוּר I**.—Pl. שִׁינּוּיִים, שִׁינּוּיִ… | U01047 `שִׁיקּוּר II` | **U01046** `שִׁיקּוּר, שִׁקּ׳ I` | line | sense | [1564a · leaf 887](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$888/full/1400,/0/default.jpg) |
| 189 | P000759 | U01060 | …Ber. 56ᵃ, v. **תִּכְלָא II**. … | V00543 `תִּכְלָא III` | **V00542** `תִּכְלָא, תִּי׳ II` | line | sense | [1568b · leaf 891](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$892/full/1400,/0/default.jpg) |
| 190 | P000760 | U01063 | …, v. **שֵׁירוּתָא II**, III.… | U01070 `שֵׁירוּתָא, שֵׁר׳, שֵׁירוּ, שֵׁרוּ I` | **U01071** `שֵׁירוּתָא, שֵׁר׳, שֵׁירוּ, שֵׁרוּ II` † | line | sense | [1569a · leaf 892](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$893/full/1400,/0/default.jpg) |
| 191 | P000761 | U01241 | …, v. **שְׁלֵיוָא I**, II.… | U01306 `שְׁלֵיוָא, שְׁלֵוָוא, שְׁלֵיוְתָא` | **U01305** `שְׁלֵיו, שְׁלֵיוָא, שְׁלֵוָוא I` | line | sense | [1579a · leaf 902](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$903/full/1400,/0/default.jpg) |
| 192 | P000762 | U01271 | …m. = h. **שֶׁלַח I**. … | U01270 `שֶׁלַח IV` | **U01267** `שֶׁלַח I` † | form | sense | [1580b · leaf 903](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$904/full/1400,/0/default.jpg) |
| 193 | P000763 | U01298 | … adv. (שְׁלֵי II, v. **שִׁלְיָא I**) without concern, unawares. … | U01296 `שִׁלְיָא, שִׁי׳ II` | **U01295** `שִׁלְיָא, שִׁלְיָיא, שִׁי׳ I` | line | sense | [1582b · leaf 905](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$906/full/1400,/0/default.jpg) |
| 194 | P000764 | U01400 | … (v.**שִׁלְשׁוּל III**) to relax, loosen the bowels.… | U01392 `שִׁלְשׁוּל, שִׁי׳ II` | **U01393** `שִׁלְשׁוּל, שׁי׳ III` † | line | sense | [1590a · leaf 913](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$914/full/1400,/0/default.jpg) |
| 195 | P000765 | U01409 | … (= שַׁלָּמָּה, v. **דִּילְמָא I**) [for why,] … | D00608 `דִּילְמָא, דִּלְמָא II` | **D00607** `דִּילְמָא, דִּלְמָא I` | line | sense | [1591a · leaf 914](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$915/full/1400,/0/default.jpg) |
| 196 | P000766 | U01517 | …Y. Yeb. VIII, 9ᵈ bot.; a. v. fr., v. **לָקִישׁ I**; a. other Amoraim; v. Fr. M’b… | L00694 `לָקִישׁ II, לַקִּישׁ, לְקִישָׁא` | **L00693** `לָקִישׁ, לְקִישָׁא I` † | line | sense | [1600a · leaf 923](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$924/full/1400,/0/default.jpg) |
| 197 | P000767 | U01539 | …משמש וכ׳ ki serves for four meanings &c., v. **דִּילְמָא I**; a. fr.—Euphem. ש׳ מטתו, or o… | D00608 `דִּילְמָא, דִּלְמָא II` | **D00607** `דִּילְמָא, דִּלְמָא I` | line | sense | [1601b · leaf 924](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$925/full/1400,/0/default.jpg) |
| 198 | P000768 | U01557 | …Targ. I Kings X, 22 (v. **פִּילָא I**). … | Q00666 `פִּילָא IV` | **Q00663** `פִּיל, פִּילָא I` † | form | sense | [1603b · leaf 926](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$927/full/1400,/0/default.jpg) |
| 199 | P000769 | U01568 | …m.(b. h.; v. **שָׁנָה I**) repetition, double. Pesik. B… | U01571 `שָׁנָה II` | **U01570** `שָׁנָה I` | form | sense | [1604b · leaf 927](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$928/full/1400,/0/default.jpg) |
| 200 | P000770 | U01635 | …Tosef. Ber. I, 1, a. e., v. **עוֹנָה I**. … | P00297 `עוֹנָה IV` | **P00294** `עוֹנָה I` † | form | sense | [1609b · leaf 932](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$933/full/1400,/0/default.jpg) |
| 201 | P000771 | U01706 | …ps? Ib. שְׁפָאֶיהָ (Ms. M. שִׁיפּוּיֶיהָ, v. **שִׁיפּוּי I**).—Trnsf. שְׁפָאֵי עידית (cmp.… | U01013 `שִׁיפּוּי, שִׁפּ׳ II` | **U01012** `שִׁיפּוּי, שִׁפּ׳ I` | line | sense | [1613b · leaf 936](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$937/full/1400,/0/default.jpg) |
| 202 | P000772 | U01714 | …Bets. 28ᵇ; a. fr.—[Tosef. Meïl. I, 25, v. **שִׁיפּוּי I**.]—Pl. שְׁפוּדִין. Y. Naz. l. … | U01013 `שִׁיפּוּי, שִׁפּ׳ II` | **U01012** `שִׁיפּוּי, שִׁפּ׳ I` | line | sense | [1614a · leaf 937](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$938/full/1400,/0/default.jpg) |
| 203 | P000773 | U01871 | …better: שְׁקוֹלִי וכ׳ take thy goodness), v. **חִיזְרָא I**; a. e.… | H00702 `חִיזְרָא, חִזְ׳ II` | **H00701** `חִיזְרָא, חִזְ׳ I` | line | sense | [1623b · leaf 946](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$947/full/1400,/0/default.jpg) |
| 204 | P000774 | U01961 | …Yeb. 100ᵃ שָׁרֵינָא וכ׳, v. **תִּגְרָא I**; a. e.… | V00093 `תִּגְרָא, תִּי׳ II` | **V00092** `תִּגְרָא, תִּי׳ I` | line | sense | [1630a · leaf 953](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$954/full/1400,/0/default.jpg) |
| 205 | P000775 | U02027 | … III, cmp. יְרַקְרֵיקָא; popular etymol. fr. **שְׁרַק I**, q. v.) name of an unclean bi… | U02022 `שְׁרַק II` | **U02021** `שְׁרַק I, שְׁרֵיק` | form | sense | [1634a · leaf 957](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$958/full/1400,/0/default.jpg) |
| 207 | P000776 | U02092 | …עשרה … אִישְׁתֵּית thou drankest ten &c., v. **קִיסְטָא I**. … | S01065 `קִיסְטָא II, קִיסְטָה` | **S01064** `קִיסְטְ, קִיסְטָא, קִסְ׳ I` | line | sense | [1637b · leaf 960](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$961/full/1400,/0/default.jpg) |
| 208 | P000777 | V00072 | …the Mishnah); he that taught the one &c., v. **שָׁנָה I**; [R. Ḥănanel: excommunication… | U01571 `שָׁנָה II` | **U01570** `שָׁנָה I` | form | sense | [1645b · leaf 968](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$969/full/1400,/0/default.jpg) |
| 209 | P000778 | V00089 | …Pes. 50ᵇ, a. e. ת׳ סימטא, v. **סִימְטָא I**. … | O00700 `סִימְטָא, סִמְ׳ II` | **O00699** `סִימְטָא, סִמְ׳ I` | line | sense | [1646b · leaf 969](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$970/full/1400,/0/default.jpg) |
| 210 | P000779 | V00100 | …m. (v. **תִּגְרָא I**) quarrelsome man. … | V00093 `תִּגְרָא, תִּי׳ II` | **V00092** `תִּגְרָא, תִּי׳ I` | line | sense | [1647b · leaf 970](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$971/full/1400,/0/default.jpg) |
| 211 | P000780 | V00101 | … f. = **תִּגְרָא I**. … | V00093 `תִּגְרָא, תִּי׳ II` | **V00092** `תִּגְרָא, תִּי׳ I` | line | sense | [1647b · leaf 970](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$971/full/1400,/0/default.jpg) |
| 212 | P000781 | V00155 | …, v. **תִּגְרָא I**… | V00093 `תִּגְרָא, תִּי׳ II` | **V00092** `תִּגְרָא, תִּי׳ I` | line | sense | [1650b · leaf 973](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$974/full/1400,/0/default.jpg) |
| 213 | P000782 | V00196 | …Yoma 72ᵇ, v. **בַּר I**; a. fr.—Pl. תּוֹכוֹת. … | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` † | form | sense | [1652a · leaf 975](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$976/full/1400,/0/default.jpg) |
| 214 | P000783 | V00547 | …city of Luz where they dye the t’kheleth (v. **לוּז I**). … | L00229 `לוּז IV` | **L00225** `לוּז I` | form | sense | [1668b · leaf 991](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$992/full/1400,/0/default.jpg) |
| 215 | P000784 | V00601 | …Cant. R. to V, 11, v. **שָׁחוֹר I**.… | U00628 `שָׁחוֹר II` | **U00627** `שָׁחוֹר I, שְׁחוֹרָה` † | form | sense | [1672b · leaf 995](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$996/full/1400,/0/default.jpg) |
| 216 | P000785 | V00728 | …m. (infin. Pa. of **תְּנֵי I**) teaching or studying (Mishna… | V00744 `תְּנֵי II` | **V00743** `תְּנֵי I, תְּנָא` | form | sense, find ×2; `find` widened | [1680b · leaf 1003](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1004/full/1400,/0/default.jpg) |
| 217 | P000786 | V00728 | …(v. Rabb. D. S. a. l. note 30).—[Ib. 49ᵃ, v. **תְּנֵי I**].… | V00744 `תְּנֵי II` | **V00743** `תְּנֵי I, תְּנָא` | form | sense, find ×2; after P000785 | [1680b · leaf 1003](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1004/full/1400,/0/default.jpg) |
| 218 | P000787 | V00757 | …m. (Ithpe. noun of סְבַר, v. **סְבַר I** Ithpoel; cmp. Syr. סיברתא P. … | O00090 `סְבַר IV, סִבְרָא, סִי׳, סוֹבָרָא` | **O00085** `סְבַר, סְבֵיר I` | line | sense | [1682b · leaf 1005](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1006/full/1400,/0/default.jpg) |
| 220 | P000788 | V00921 | …, v. **תְּרֵי I**, II.… | V00980 `תְּרֵי, תְּרָא II` | **V00979** `תְּרֵי, תְּרָא I` | line | sense | [1694b · leaf 1017](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1018/full/1400,/0/default.jpg) |
| 221 | P000789 | V01081 | …Ned. III, 8 quot. s. v. **שָׁחוֹר I**) … | U00628 `שָׁחוֹר II` | **U00627** `שָׁחוֹר I, שְׁחוֹרָה` † | form | sense | [1703b · leaf 1026](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1027/full/1400,/0/default.jpg) |
| 222 | P000790 | V01117 | …Lev. R. s. 35, v. **חֲרוּבָא I**; ib. s. 13; Yalk. Is. 256; a.… | H01614 `חֲרוּבָא, חֲרוּבָה II, כפר ח׳` | **H01613** `חֲרוּבָא, חֲרוּבָה I` † | line | sense | [1705b · leaf 1028](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1029/full/1400,/0/default.jpg) |
