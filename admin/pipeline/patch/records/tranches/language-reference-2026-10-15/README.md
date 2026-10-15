# `language_reference` and the `ch.` cites (2026-10-15)

Data PR (v-b) of [`docs/correction-audit.md`](../../../../../../docs/correction-audit.md)
§7, PR #n: the 16 determined cross-reference retargets PR #178 could
not write, H00355 and H00733 from PR #177, and U00488 and U00489.
Review ledger L50 (closed here), L49, L64; plan group 5 ("U00488's
numeral … and U00489's join") and 6b ("Cross-reference numerals").

**21 reviewed patches, P000791–P000811, on 20 entries.** They are
appended to [`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl),
with one `repaired` record per rid in
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl).
`prompt_version` is `language-reference-2026-10-15`, every `snapshot`
is `sha256:75bbc5ee…`, and none carries an annotation: every one is
case 1 of ruling `10-13 correction policy`. This directory holds only
this README.

## Part A: the six `X N ch.` cites, under ruling 10-15

**The ruling** (`10-15 ch. cross-reference`,
[`docs/decisions.md`](../../../../../../docs/decisions.md) §9;
maintainer, 2026-10-15): a cross-reference that reads `X N ch.` names
the unnumbered Aramaic (`ch.`) line print sets right after `X N`, not
the Hebrew `X N` itself. It is the reading of the maintainer's round 2
tick for H00731 `v. חוּל I ch.`, which PR #177 aimed at H00320, the
`ch.` line after H00319 `חוּל I`.

Each target was read before its patch was written: the entry that
follows the numbered Hebrew entry, by rid, with a gloss that opens
`ch.`, and a link key the import's map resolves.

| numbered entry | the `ch.` line after it | its gloss opens | link key |
|---|---|---|---|
| B01152 `בַּר I` | B01153 `בַּר, בָּר, בָּרָא` | ` ch. same (= h. שָׂדֶה, יַעַר) forest, prairie &c.` | `בַּר` (22 source links already use it, among them B01160's own `בַּר I ch.` in sense 1, which Sefaria linked there) |
| A00878 `אוּרְיָא, אוּרְיָה II, אוּרְיָיא` | A00879 `אוּרְיָא, אוּרְוָוא` | ` ch. (= b. h. אֻרְוָה) crib; stable.` | `אוּרְיָא ³` (no existing link; gate 6 resolves it) |

| patch | citing rid | the cite in context | Sefaria linked | now | scan |
|---|---|---|---|---|---|
| P000791 | A00864 | …, v. **אוּרְיָא II** ch., a. אֵדֶר I.… | A00880 `אוֹרְיָא, אוּרְיָא III` | **A00879** | [33b · leaf 56](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$57/full/1400,/0/default.jpg) |
| P000792 | B01157 | …outside, forest &c., v. **בַּר I** ch.… | B01156 `בַּר IV, בָּר` | **B01153** | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| P000793 | B01160 | …m. (v. **בַּר I** ch.)… | B01156 | **B01153** | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| P000794 | B01215 | …f. (v. **בַּר I** ch.) outside, rejected; cmp. … | B01156 | **B01153** | [191b · leaf 214](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$215/full/1400,/0/default.jpg) |
| P000795 | B01237 | … (v. **בַּר I** ch., Pi. 2) to expel, exile. … | B01156 | **B01153** | [192a · leaf 215](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$216/full/1400,/0/default.jpg) |
| P000796 | U02087 | …B. Bath. 90ᵇ ש׳ מלבר, v. **בַּר I** ch. … | B01156 | **B01153** | [1637a · leaf 960](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$961/full/1400,/0/default.jpg) |

Each is a `replace` on the sense holding the cite, as P000595–P000790
were: `find` is the source anchor, `replace` the same anchor with
`href` and `data-ref` naming the new target's link key (ruling `10-09
link key`), the visible text unchanged byte for byte. B01237's other
cite, `(v. בַּר I, בָּרָא)` in its `—3)`, is not followed by `ch.`
and went to B01152 in PR #178 (P000610); P000795 is added to its
record. Three citers keep agent manifest rows with no patches,
unchanged: A00864 and B01237 their class 11 escalations from the
2026-09 sweep, which named these wrong targets and wrote no href, and
B01160 a `needs_print_check` led by a class 8 finding.

## Part B: a patch target for `language_reference` (L50)

**Where the field lives.** `language_reference` is a Sefaria field
beside the senses (`SourceEntry.language_reference`,
`admin/pipeline/types.ts`): the etymology paren, `(b. h.; X I)` or
`ch. = h. X I`. The import keeps no field of that name. `rejoinGlossHead`
(`body/rejoin.ts`) concatenates `content.morphology`, `language_code`,
`language_reference` and source sense 0's definition into the gloss
head, which `buildTrace` makes `senses[0]`'s `gloss`
([`DESIGN.md`](../../../../DESIGN.md) §2, "Senses, stems, the gloss
head"). No patch op could edit it: every target was a sense, the
headword block or a `refs[]` item.

**The target.** `language_reference:<anchor>`, for `replace` and
`annotate` only (`patch/schema.ts`). `expected_before` is the field's
whole text after the transform phases and the rid's earlier patches,
and the anchor is its hash; like the headword block, the field
resolves once or not at all, so `expected_occurrences` and
`occurrence_index` must be 1. Any other op on it is refused by name.
The field joins the no-new-text pool (`flattenContent`), for the
reason the headword block is in it: an op edits it. Drift
(`patch/drift.ts`) calls a moved field `upstream-fixed` only when it
reads exactly as the patch would leave it; a field that is gone is a
change. Tests: `schema.test.ts`, `apply.test.ts`, `drift.test.ts`,
`annotation.test.ts`.

**Where an annotation lands: `senses[0]`'s `gloss`.** The text is in
the gloss head, not on any form, so an annotation on it names the
gloss of the sense that head is built on: the apply leaves the draft
on source sense 0, which `buildTrace` carries to `senses[0]`, and
`finishEntry` finds the replacement there as it does for any `replace`.
An entry whose first source sense is a stem, or that has none, has no
sense to carry the draft, and the apply refuses rather than leave
gate 10 an annotation it cannot find. `annotate` on the target takes
field `gloss` only. None of the patches here carries one.

**The 12 retargets** (P000797–P000808), each a `replace` on the
field, case 1. The 10 are §5.1's determined rows; H00355 and H00733
name H00319, which PR #177 numbered I from Jastrow's text, these two
cites among the evidence (P000584). Every new target carries the
numeral the cite names.

| # | patch | citing rid | the cite in `language_reference` | Sefaria linked | now | scan |
|---|---|---|---|---|---|---|
| 12 | P000797 | B00335 | `ch. = h.` **בּוֹר I** | B00333 `בּוֹר II` | **B00332** `בּוֹר I` | [149a · leaf 172](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$173/full/1400,/0/default.jpg) |
| 19 | P000798 | B01155 | `(b. h.; ברר; v.` **בַּר I**`)` | B01156 `בַּר IV, בָּר` | **B01152** `בַּר I` | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| 51 | P000799 | K00999 | `ch. = h.` **כּוֹפֶר I** | K00345 `כּוֹפֶר II` | **K00344** `כּוֹפֶר, כֹּפֶר I` | [658a · leaf 681](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$682/full/1400,/0/default.jpg) |
| 58 | P000800 | M01517 | `(b. h.;` **לוּן I)** | L00290 `לוּן II` | **L00289** `לוּן, לִין I` | [788a · leaf 111](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$112/full/1400,/0/default.jpg) |
| 64 | P000801 | M02939 | `(b. h.;` **שָׁנָה I)** | U01571 `שָׁנָה II` | **U01570** `שָׁנָה I` | [857a · leaf 180](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$181/full/1400,/0/default.jpg) |
| 85 | P000802 | O00581 | `ch. = h.` **סִידּוּר I** | O00580 `סִידּוּר II` | **O00579** `סִידּוּר, סִדּ׳ I` | [976b · leaf 299](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$300/full/1400,/0/default.jpg) |
| 143 | P000803 | S00286 | `(b. h.; cmp.` **קוּץ I**`)` | S00533 `קוּץ IV` | **S00528** `קוּץ I` | [1326a · leaf 649](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$650/full/1400,/0/default.jpg) |
| 146 | P000804 | S00534 | `(b. h.; קָוַץ or` **קוּץ I**`)` | S00533 `קוּץ IV` | **S00528** `קוּץ I` | [1339b · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |
| 179 | P000805 | U00535 | `(b. h.; cmp.` **שְׁיָירָא II**`)` | U00912 `שְׁיָירָה, שְׁיָירָא III` | **U00911** `שְׁיָירָא II, שְׁיָירָה I` | [1541b · leaf 864](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$865/full/1400,/0/default.jpg) |
| 182 | P000806 | U00704 | `(b. h.; cmp.` **חָרַר I**`)` | H01770 `חָרַר IV` | **H01764** `חָרַר I` | [1551b · leaf 874](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$875/full/1400,/0/default.jpg) |
| — | P000807 | H00355 | `(b. h.;` **חוּל I)** `dancer` | H00323 `חוֹל I` | **H00319** `חוּל I` | [434b · leaf 457](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$458/full/1400,/0/default.jpg) |
| — | P000808 | H00733 | `(b. h.;` **חוּל I)** `army` | H00323 `חוֹל I` | **H00319** `חוּל I` | [454b · leaf 477](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$478/full/1400,/0/default.jpg) |

`#` is `docs/correction-audit.md` §5.1's row. B01155 keeps its class 11
agent escalation row, unchanged.

**U00488 `שׁוּף`** (pile B, ticked 2026-10-06: "confirmed: print shows
that numeral beside it"; hOCR `^1123 I(b.h.;= C]ti3) to blow.`; scan
[1538b · leaf 861](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$862/full/1400,/0/default.jpg)).
Sefaria cut print's I into the field, ` I (b. h.; = נָשַׁף)`, so
setting the numeral alone would have shown it twice. P000809 is a
`reform` with `homographs` (`homograph: 1` on the form, display `{0}
I`), and P000810 a `replace` on the field that removes the ` I` and
nothing else, as P000326 and P000327 did for U01006 in the gloss. Case
1, no annotation: print sets the I and Sefaria moved it.

**U00489 `ש`, `ׁוּף`** (ticked 2026-10-06: "print's headword is `שׁוּף`
with no numeral or superscript"; review ledger L49, L50). P000811 is a
`reform` that rejoins the torn line byte for byte, `ש` + `ׁוּף` →
`שׁוּף`, as Q00752's did (P000304). It needs nothing new: since ruling
`10-09 link key` the link map keys on the line before patches, so
U00489 still answers to `ש` and the 13 links naming it keep their rid,
and the bare name `שׁוּף` is free once U00488 is `שׁוּף I`. Case 1.

## What the re-import shows

`rm -rf data/entries/[A-Z] && bun data:import && bun qa:format`
changed exactly 20 entry files: the 6 Part A citers (A00864, B01157,
B01160, B01215, B01237, U02087), the 12 Part B citers (B00335,
B01155, H00355, H00733, K00999, M01517, M02939, O00581, S00286,
S00534, U00535, U00704), U00488 and U00489. Checked by script against
the tree before:

- each of the 18 citers differs only in one cite `ref`, the patch's old
  rid → new rid, the cite's text unchanged. The 12 new targets carry
  the numeral the cite names; the 6 are the `ch.` lines, which carry
  none;
- U00488's `senses[0].gloss` lost exactly ` I` at its head (` I (b. h.;
  = …)` → ` (b. h.; = …)`), and its form gained `homograph: 1` with
  display `{0} I`; nothing else moved. `nameOf`: `שׁוּף` → `שׁוּף I`;
- U00489's headwords went from `ש`, `ׁוּף` (display `{0}, {1}`) to one
  form `שׁוּף` (display `{0}`), byte-equal to U00488's text; nothing
  else moved. `nameOf`: `ש` → `שׁוּף`. U00490 stays `שׁוּף II`;
- the 13 `<cite ref="U00489">` in the tree are the same 13.

Every gate is green, the names gate (65024/65024) and gate 6
(internalTargets, 32512/32512, `unresolved=0`) among them. The
blessing reads `Patch corpus: 652 reviewed, 40 accepted, 697 applied`
(631 and 676 before) and `Annotations: 95 written (93 print-error, 1
kept, 1 illegible)`, unchanged. The headword report loses U00489's X1
row and U00490's X10 row (its family now has an I), and the review
report loses U00488's `homograph-roman-stranded-in-definition` row.
`bun data:validate` reports 0 problems. No `body/` or `transform/`
file moved, so `transform:invariants` did not need to run.

**The audit's predicate** (§5: a cite naming a numeral its target
lacks), on the tree before and after: 91 cites → 81, and 19
determined → 12. The 10 `language_reference` rows leave it. H00355
and H00733 were never in it (their old target, H00323 `חוֹל I`,
carries the numeral, on the wrong word). The 6 `ch.` rows stay, as
H00731 does: a `ch.` line carries no numeral, which ruling 10-15 names
as its cost. Of the 12 determined left, 7 are those `ch.` cites; H01057
and H01105 are the worklist question `חֵלֶף I`; and P01145, U00043
and U00490 `שׁוּף I` became determined here, since U00488 now carries
the I. They are the worklist question `שׁוּף I`, whose recommendation
is yes, and wait on its tick.
