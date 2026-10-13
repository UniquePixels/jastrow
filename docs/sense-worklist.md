# Sense worklist: the nine Group D classes

## Status (2026-10-10)

This is review ledger group 6 (L22) and the examination issue #123
asks for: nine sense-structure classes, each to close with either a
ported review detector or a `discarded` catalogue row with a control,
before sense-level addressing (D8 lifted) or hand editing in the admin
tool, whichever comes first. Today nothing addresses a sense and there
are no hand edits, so a renumbering is still free.

Nothing here changes data. Every count below was measured on the
committed entries (`data/entries/`, `v2` at `271ede286`), after the
transforms and the reviewed patches have run, and where the catalogue
counted the Sefaria source snapshot that number is given beside it.
Print evidence is the hOCR of the 1903 scans (`data/print/hocr/`),
quoted verbatim apart from removed bidi marks (U+200E, U+200F), with
the scan leaf from the page index.

Tick ONE box per question and add a note where a box asks for one.
Skip anything you like.

**Ticked 2026-10-10.** Classes 1, 2 and 4 are discarded with their
controls and class 9 has a review detector (PR #159). Class 3 has an
answer under its note and a fresh question. Classes 5–8 and the
implied-`1)` rows are reviewed patch sets: PR #160, 142 patches on 75
entries, with ledger L52's body-review 08 rows folded in. Three
entries the rules do not decide are round 2, near the end.

**Ticked 2026-10-11.** Class 3 is a review detector:
`self-numbered-intext-marker` reports the 22 rows below (PR #163),
which wait for the review on the scan its note asks for. The three
round-2 entries are answered and applied as reviewed patches
(P000510–P000517, PR #164), each restoring the text the maintainer
read from print.

**Open 2026-10-11.** Class 3's scan review: one block and one
question for each of the detector's 22 rows, in § `Class 3 scan review
(2026-10-11)` near the end, the maintainer's to tick.

**Ticked 2026-10-12.** The maintainer ticked the class 3 scan review.
The 18 split rows are applied as reviewed patches (P000518–P000537,
PR #166): 17 keep print's number as ticked, and P00059's note
`1,2,3,4,4,6` is read as its Pi. label list, two splits. The detector
now reports the four nest rows (A00982, C00263, C00869, U01512); they
need a nesting op and wait for PR 2.

**Applied 2026-10-12 (b).** Class 3 is fully applied. PR #167
carries out the four nest ticks as reviewed patches (P000538–P000543)
under ruling `10-12 nested sublists`: A00982's dual by a `join` and
`Du.` in the form-section markers, C00869's participle by a `split`
and a `join`, and C00263's Miggo and U01512's participle by a new
`nest` op. The detector then finds no row, so it is retired from the
import path (unregistered, its catalogue row resolved), as a class at
zero must be; its module stays for a re-fetch.

How I chose each recommendation, so the rows read the same way:

- **Discard** where the reader sees what print sets and the structure
  is print's too. A discard row needs a control: a named entry that
  shows the class is harmless or already handled.
- **Detector** where the text is print's but the sense boundaries are
  not (a sense of print's is buried inside another, or not nested
  under the form it belongs to). Nothing is wrong on the page, but a
  sense address would be, so the rows wait for whoever lifts D8.
- **Reviewed patch set** where the reader sees a defect (a duplicate,
  a missing number, a number cut out of a citation) and an existing
  patch op repairs it, with a precedent already applied. A patch set
  closes #123's box the way Group C's two classes closed: once the
  patches apply, the class is `discarded` with a patched rid as its
  control.

Excerpts are tag-stripped entry text in NFC. In them `‖` separates two
senses, `↳` marks a child sense, and `…` marks a cut.

## Summary

| # | Class | What the reader sees | Catalogued | Today | What handles it | Recommendation |
|---|---|---|---|---|---|---|
| 1 | `etymology-head-pseudo-sense` | print's own layout: an unnumbered etymology, then `1)` | 1,553 (source; this run finds 1,552) | 1,929 entries (1,454 strict) | ruling `10-04 lead text` | discard, control A00020 |
| 2 | `preamble-stranded-lead-sense` | print's own layout: a short label or preamble, then `1)` | 676 (source) | 742 | ruling `10-04 lead text` | discard, control A00123 |
| 3 | `self-numbered-intext-marker` | print's text; print's own next sense sits inside a sense of the same number | 35 senses | 26 | nothing | detector |
| 4 | `inline-inflection-sublist` | nothing wrong: print's form section, nested | 12 | 2 left (13 split) | `body/form-sections.ts` (B12) | discard, control C00062 |
| 5 | `continuation-marker-fully-absent` | an unnumbered paragraph inside a numbered list; 3 also open on a stray `)` | 9 | 5 | 3 fixed by reviewed `retag` (P000184–P000187, P000189) | patch set |
| 6 | `first-sense-debris-stranding-language-label` | the opening of sense 1 printed twice, with a second `1)` | 5 | 14 | 2 of the shape fixed by `delete` (P000018, P000084) | patch set |
| 7 | `verse-paren-false-sense-split` | a sense number cut out of a citation (`Is. XL,` then `1) ; a. fr.`) | 13 (source) | 13, plus P00790 (our own split) | 36 reviewed `join` patches fixed the others | patch set |
| 8 | `chopped-marker-with-residue` | sense N's number at the end of the sense before it, then an unnumbered sense | 10 (source) | 10 | nothing | patch set |
| 9 | `inflection-sublist-numbering-flattened` | print's text; `1)`, `2)` of a `Fem.`/`Pl.` form sit as senses of the headword | 3 | 8 | nothing | detector |
| — | `continuation-marker-em-dash-loss` (the tenth sibling, not in #123) | nothing: no label stores a dash | 22 | 0 in entry data | ruling `10-04 sense star` | no box; ledger L54 |
| — | the implied-`1)` rows (body-review 08) | sense 1 unnumbered, `—2)` inside its text | 21 | **22** undecided | nothing yet | 17 implied, 5 not (below) |

Classes 1 and 2 are the same population read two ways (515 entries
are in both), and both dissolved under ruling `10-04 lead text`. Class
4 dissolved under the form-section split. Six of class 3's rows are
really classes 4 and 7, and are counted in both.

---

## 1. `etymology-head-pseudo-sense`

**Predicate, as catalogued.** An unnumbered lead sense whose whole
definition is the etymology parenthetical, followed by a correct `1)`.

**What the reader sees.** The headword, its grammar and etymology
unnumbered, then `1)`. That is how Jastrow sets an entry, and the
catalogue row says so itself: two sweeps "judged the unnumbered lead a
normal print convention", and "if that ruling holds this row becomes
discarded".

**Measured.** On the source, an unnumbered first sense followed by
`1)`: 2,295 entries, 1,552 of them opening on `(`. The catalogue says
1,553 of the same 2,295; the one-entry difference is not explained, so
the count is near, not reproduced. In the entries the lead is the gloss head, which
also carries the morphology and language code, so the shape reads
"grammar prefix, then a parenthetical": 2,302 entries have an
unlabelled lead before a sense labelled `1`; in 1,929 the lead opens on
`(` once a grammar prefix (`m.`, `f. pl.`, `pr. n.` …) is skipped; in
1,454 the lead is nothing but that prefix and one balanced
parenthetical (the stricter reading of "whole definition").

| rid | headword | lead ‖ sense 1 |
|---|---|---|
| [A00020](https://jastrow.app/#rid:A00020) | `אִבָּא` | `m. (אבב) ‖ 1) thicket, woods, grove. M. Kat. 12ᵇ א׳ בשלניא …` |
| [A00042](https://jastrow.app/#rid:A00042) | `אַבְדָּלָה` | `f. ch., (= הַבְדָּלָה; בדל) ‖ 1) the act of distinguishing; separation. Y. Ber…` |
| [A00152](https://jastrow.app/#rid:A00152) | `אֲבָל` | `(b. h.) ‖ 1) indeed, yes. Tosef. Erub. V (IV), 1 אמרו לו א…` |
| [A00190](https://jastrow.app/#rid:A00190) | `אֲבַק` | `(√אב, עב, cmp. אבך, חבק) ‖ 1) to entangle, twist, twine. Men. 42ᵃ אביק להו …` |
| [A00211](https://jastrow.app/#rid:A00211) | `אַבְרַוְורֵי` | `m. pl. (denom. of אבר, cmp. חברורי) ‖ 1) (cmp. אָבַר Pi.) wings or corners of city wal…` |

**Control.** A00020: the hOCR reads `NIN .גג (228) 1) thicket, woods,
grove. M. Kat. 12”` ([2a · leaf 25](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$26/full/1400,/0/default.jpg)):
print sets the parenthetical, then `1)`, exactly as stored.

**What already handles it.** Ruling `10-04 lead text`: the lead stays
as it is, `senses[0]` is the gloss head, and every label is an explicit
string, so the unlabelled lead consumes no number and deleting it
later would renumber nothing.

**Recommendation: discard with the control.** Nothing on the page is
wrong. The fix the class once imagined (drop the lead, or fold it into
sense 1) would rewrite 1,454–1,929 entries to look less like print.
Cost: one catalogue row. If nothing is done: the class stays a
`candidate` with no detector, and #123's box stays open.

**Question.** Discard `etymology-head-pseudo-sense` as print's own
layout, with A00020 as the control?

- **etymology-head-pseudo-sense**
  - [ ] port a review detector (reports rows, no repair)
  - [x] discard with the control named above
  - [ ] write a reviewed patch set (say the rule in the note)
  - [ ] can't decide yet (say what is missing in the note)
  - note: 


## 2. `preamble-stranded-lead-sense`

**Predicate, as catalogued.** A preamble (an etymology or language
label, sometimes a binyan head) left as a first sense with no gloss and
no citation, while the real senses follow as `1)`/`—2)`. The
catalogue's rule: an unnumbered lead before `1)`, citation-free, under
60 characters.

**What the reader sees.** The same thing as class 1: a short
unnumbered lead, then `1)`. Print sets it so.

**Measured.** That rule on the source gives 759 (catalogued 676: not
reproduced, which the catalogue already warned the count was a
judgement call); on the entries, 742 (lead before `1`, no `<cite>`,
under 60 characters of text). 515 of them are also in class 1. Seven
leads hold a binyan label and form (`Pi. נִתֵּחַ`), all of them verbs
print gives in one binyan only.

| rid | headword | lead ‖ sense 1 |
|---|---|---|
| [A00007](https://jastrow.app/#rid:A00007) | `אִ־` | `&c. a prefix, ‖ 1) for the formation of nouns in Kal, Peel, Afel…` |
| [A00083](https://jastrow.app/#rid:A00083) | `אַבְזָקַת` | `f. (בזק) breaking, crumbling, corrosion, whence ‖ 1) a foot-disease in animals believed to arise f…` |
| [A00123](https://jastrow.app/#rid:A00123) | `אַבַּיִּי` | `pr. n. m.Abbayi, ‖ 1) a renowned Babyl. Amora (original name נַחְמֵ…` |
| [A00244](https://jastrow.app/#rid:A00244) | `אֵגֶד` | `m. (אגד I) ‖ 1) tie, knot. Succ. 10ᵇ, a. fr. צריך א׳ must be …` |
| [N01364](https://jastrow.app/#rid:N01364) | `נָתַח` | `(b. h.), Pi. נִתֵּחַ ‖ 1) to sever, dissect. Zeb. 85ᵃ יפשיט וִינַתֵּחַ …` |

**Control.** A00123: the hOCR reads `ON pr. n. .ג Abbayi, 1) a
renowned Babyl. Amora` ([6a · leaf 29](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$30/full/1400,/0/default.jpg)).
For the binyan-head case, N01364: `nn^ (b.h.), Pi. PP3 1) to sever,
dissect.` ([943b · leaf 266](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$267/full/1400,/0/default.jpg)).

**What already handles it.** Ruling `10-04 lead text`, as for class 1.
A binyan head that really is stranded in prose is the
`stranded-stem-head` rule's job, which lifts it into `stems[]`; the
seven left are print's one-binyan verbs.

**Recommendation: discard with the control.** Same reasons as class 1.
The catalogue's own note that this class is "structurally the opposite
of implied-one" still matters for a reader of the archive, not for the
data.

**Question.** Discard `preamble-stranded-lead-sense` as print's own
layout, with A00123 as the control?

- **preamble-stranded-lead-sense**
  - [ ] port a review detector (reports rows, no repair)
  - [x] discard with the control named above
  - [ ] write a reviewed patch set (say the rule in the note)
  - [ ] can't decide yet (say what is missing in the note)
  - note: 


## 3. `self-numbered-intext-marker`

**Predicate, as catalogued.** A sense whose own text contains an
in-text `—N)` equal to its own number, so that splitting it would give
`1, 2, 2, 3`.

**What the reader sees.** The text print sets, but one of print's
senses sits inside another: sense `2)` runs on into `—2) to sign …`.
Read as a line it matches the page; shown as separate senses, print's
next sense has no block of its own.

**Measured.** 26 entries, one site each (labelled sense whose tag-free
text holds `—N)` with N its own label). The stand-in predicate gave 26
too; the catalogue's 35 counted senses in chunk-00373 and is not
comparable. The 26 split three ways:

- **20 others.** In six the hOCR shows both markers with the same
  number, so print itself repeats the numeral and the entry is
  faithful: H01899 and B01299 (quoted below), C00869, Q01502, S00151
  and U01512 (`— 2) to give to understand` … `— 2) inferred, proved`).
  The other 14 need the page.
- **4 that are class 7**: a citation's own `N)` minted the sense, and
  the in-text marker is the real one (A01002, A01620, C01063, O01635).
- **2 that are class 4's residue**: a sublist restarting at `1)` that
  the form-section split does not know (A00982 `—Du.`, C00263 `—Hence
  מִיגּוֹ`).

| rid | headword | the sense, and its in-text marker |
|---|---|---|
| [B01299](https://jastrow.app/#rid:B01299) | `בְּרַם` | `3) only, but. Targ. Gen. VII, 23.… fact they said this. B. Mets. 114ᵃ.—3) interj. truly!, surely! …` |
| [H01899](https://jastrow.app/#rid:H01899) | `חָתַם` | `2) to seal. Y. Ab. Zar. III, 42ᶜ…  seal; Tosef. ib. V (VI), 2; a. fr.—2) to sign, subscribe (as w…` |
| [M02130](https://jastrow.app/#rid:M02130) | `מַעֲלָה` | `3) degree, gradation, superiority… iblical origin (v. Kel. I, 8, sq.).—3) height, on high. Mekh. M…` |
| [U01512](https://jastrow.app/#rid:U01512) | `שְׁמַע I` | `2) to give to understand; to teac…  may mean, ‘to strengthen’); a. fr.—2) inferred, proved; eviden…` |
| [A00982](https://jastrow.app/#rid:A00982) | `אֹזֶן` | `2) handle. Cant. R. beg. ולא הי׳…  on your guard in speaking); a. fr.—2) handles. Kel. IV, 3, v. …` |

All 26: A00982, A01002, A01620, B01153, B01299, C00263, C00399,
C00869, C00871, C00872, C01063, G00456, H00940, H01899, I00712,
K00086, K01280, M00596, M02130, N01139, O01635, P00059, Q01502,
S00151, U01512, V00909.

**Control.** H01899: the hOCR reads `it might not go forth &.—2) fo
seal, Y. Ab. Zar. III, 42°` and, two lines on, `V (VI), 2; a. fr.—2)
to sign, subscribe (as witnem, judge`
([513b · leaf 536](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$537/full/1400,/0/default.jpg)).
B01299: `… B. Mets, 114°.—3) interj.truly!, surely !` after `—3) only,`
([196a · leaf 219](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$220/full/1400,/0/default.jpg)).

**What already handles it.** Nothing. Under the lead-text ruling
labels are explicit strings, so splitting one of these later renumbers
no other sense; what it does is give two senses the same label, which
is what print does.

**Recommendation: port a review detector.** The predicate is
mechanical and reproduces exactly (26 against 26). Every row needs a
person to read the page and choose: split and keep print's doubled
number, split and number on, or leave it whole. A discard would also
hide the six rows that are not print's (classes 4 and 7 repair or
record them; the detector then shows 20).
Cost: one detector file under `import/detectors/` on the `empty-body`
pattern, one row per entry. If nothing is done: the page reads as
print; a sense address could never point at print's second `2)`.

**Question.** Port a detector that reports a sense holding its own
number in its text?

- **self-numbered-intext-marker**
  - [x] port a review detector (reports rows, no repair)
  - [ ] discard with the control named above
  - [ ] write a reviewed patch set (say the rule in the note)
  - [ ] can't decide yet (say what is missing in the note)
  - note: I believe these to be textual or print errors. Can we create a deterministic fix? (Note that in at least one case, the issue creates a downstream sense numbering issue as well).  Please remember as this is a modification to text it needs to be anotated. If a determenistic fix is not possible then we sould create a detector, and run a review to make patches.

**Historical answer (2026-10-10, for the question in the note;
nothing was ticked or implemented at that time).** No deterministic *text* fix exists, because
in every row the hOCR can read, the doubled numeral is print's own;
a deterministic *split* does exist, but the number the new sense takes
is a choice the data cannot make.

Measured on the committed entries (`8914fce25`), the same 26:

- **Boundary and parens decide nothing.** All 26 in-text markers sit
  at a sentence boundary (`.—N)`), outside every anchor, at paren and
  bracket depth 0. A rule that tests those places splits all 26.
- **"The next in sequence": 0 of 26.** Every in-text marker repeats
  its host's own number (that is the class), and every sequence is
  gapless: no later sibling skips the number a renumbered marker would
  take, so nothing in the entry says the repeat is a slip. The
  exceptions are class 7's four (A01002, A01620, C01063, O01635):
  there the *host's* label is the citation's number, and once the
  minted sense is joined back the in-text `—N)` is exactly the next
  number. The class 7 patch set splits them there (PR B), so they
  leave this class.
- **Print repeats the numeral.** The hOCR shows the same numeral
  twice in 9 rows: the six above, plus M02130 (`— 3) degree,
  gradation` … `— 3) height`, 817a · leaf 140), V00909 (`— 4) (with
  …) to be vehement` … `— 4) to get hot, ferment`, 1693b · leaf
  1017) and B01153 (`(4--` and `)4`, Tesseract's mirrored `—4)`, on
  188b · leaf 211). In the other rows the in-text marker is in print
  (C00399, I00712, K00086, K01280, M00596, N01139 among them) and the
  host's own marker is in a vol. 1 line Tesseract garbled. No row
  shows print with N+1 where the entry has N.
- **What a split rule would get wrong: 2, or 6.** A00982 and C00263
  (class 4's residue): the marker is the second item of a sublist
  that restarts at a paren-clear `1)` inside the same sense (`—Du.
  אָזְנַיִם 1) ears … —2) handles`), so the split would lift a
  sublist item to the top level. A guard (no restarted `1)` before
  the marker) refuses both. Run before class 7's joins, it would also
  split the four class 7 hosts at the wrong number (`1, 2, 2`).
- **The downstream numbering.** Splitting and numbering on (N+1)
  renumbers every later sense in 7 entries (C00399, C00869, H00940,
  H01899, I00712, Q01502, S00151), with no print witness for any of
  the new numbers; in H01899 print reads `—2) to seal` … `—2) to
  sign` … `—3) to close a benediction` (513b · leaf 536), so the
  renumber would make print's `3)` a `4)`. Keeping print's number
  gives two senses labelled N in each of the other 20 entries, which
  the schema allows (labels are explicit strings, ruling 10-04 lead
  text).

**Annotation.** An entry has no notes field. A deviation from print
is recorded where the implied `1)`s and D00341's bracket move are:
in the reviewed patch's `rationale` (`admin/pipeline/patch/records/reviewed/README.md`,
"register #16"). A per-entry patch can carry it; a transform rule
cannot say why one entry differs from print.

**Recommendation: the note's fallback, a detector and a reviewed
review.** Port the detector (22 rows once class 7's four are split:
20, plus A00982 and C00263), read each on the scan, and write the
patches from that read: `split` keeping print's number, or `split`
and `retag` to N+1 (and the later senses) with the deviation in the
rationale. A rule is possible only for "split and keep print's
doubled number" (with the restarted-`1)` guard, after class 7); it
does nothing for the reading in your note that these are errors.

- **self-numbered-intext-marker, round 2**
  - [ ] port the detector, then a review on the scan writes the patches
  - [ ] a rule: split at the repeated marker and keep print's doubled number
  - [ ] split by reviewed patch now and number on (N+1), deviation in each rationale
  - [ ] can't decide yet
  - note: 

Scan review for the 22 rows: see § `Class 3 scan review (2026-10-11)`
below.

Applied in PR #163 (2026-10-11), from the first question's tick
("port a review detector") and its note: the detector reports the 22
rows; the review on the scan, row by row, is still to do, and this
round-2 question stays open for it.


## 4. `inline-inflection-sublist`

**Predicate, as catalogued.** A numbered sense whose text carries an
inline sub-enumeration restarting at `1)` under an inflection label
(`Pl.` 5, `Part. pass.` 4, `Du.`, `Denom.`, `Fem.` 1 each).

**What the reader sees.** Since the form-section split (B12,
`body/form-sections.ts`), print's form section: the label and form as
an unlabelled sibling, its restarted senses nested under it.

**Measured.** 13 form-section siblings in 13 entries (`Part. pass.` 6,
`Pl.` 5, `Fem.` 1, `Denom.` 1), against the catalogue's 12. What is
left inline: 2 entries whose labelled sense holds a paren-clear `1)`
followed by `—2)`. A00982's label is `Du.`, which `MARKERS` does not
list; C00263's is `Hence מִיגּוֹ, מִגּוֹ Miggo,`, a derived noun, not an
inflection. Both are also rows of class 3.

| rid | headword | excerpt |
|---|---|---|
| [C00062](https://jastrow.app/#rid:C00062) | `גְּבוּרָה` | `3) high age, v. infra. ‖ —Pl. גְּבוּרוֹת ↳ 1) manifestations of Divine power, wonders.… ↳ 2) G’buroth, the second section of the T’fillah… ↳ 3) (allusion to Ps. XC, 10) the age of eighty.…` |
| [A00982](https://jastrow.app/#rid:A00982) | `אֹזֶן` | `2) handle. … a. fr.—Du. אָזְנַיִם 1) ears. … a. fr.—2) handles. Kel. IV, 3, v. …` |
| [C00263](https://jastrow.app/#rid:C00263) | `גֵּו` | `2) … fr.—Hence מִיגּוֹ, מִגּוֹ Miggo, 1) (= h. מִתּוֹךְ, Shebu. 45ᵇ, and מֵאַחַר, v. אַחַר) a legal rule …` |

The 13 split: A01047, A02260, A03348, B01292, C00062, C00869, C00964,
C01139, D00194, E00789, G00644, H01022, I00311.

**Control.** C00062, the case the form-section split was written
from: its `—Pl. גְּבוּרוֹת` block is a sibling with children `1`–`3`.

**What already handles it.** `splitFormSection` (decision B12), run
after the lettered split, under-splitting by design.

**Recommendation: discard with the control.** The class dissolved:
the shape it describes is now split into the structure print shows.
A00982 and C00263 stay visible as rows of class 3's detector, if you
take it. Adding `Du.` to `MARKERS` would carve A00982's block too, but
it is one entry, a transform change, and a `transform:invariants` run.

**Question.** Discard `inline-inflection-sublist` as handled by the
form-section split, with C00062 as the control?

- **inline-inflection-sublist**
  - [ ] port a review detector (reports rows, no repair)
  - [x] discard with the control named above
  - [ ] write a reviewed patch set (say the rule in the note)
  - [ ] can't decide yet (say what is missing in the note)
  - note: 


## 5. `continuation-marker-fully-absent`

**Predicate, as catalogued.** A non-first unnumbered sense in a
numbered list, where the previous sibling carries no marker residue at
all.

**What the reader sees.** A numbered list with one paragraph that has
no number (`1) to drip, v. Hif.` then `to move, shake, tremble`). In
three the paragraph also opens on a stray `)`, because the `—2) (cmp.`
that opened it was lost with the marker.

**Measured.** On the source: 37 non-first unnumbered senses (the
catalogue's null model says 37 too), 9 with no residue on the previous
sibling (G00217, G00652, J00199, K00081, L00565, O01387, R00565,
S02111, U01512), reproducing the catalogue's 9; S02111's `—2) (of
wine)` is residue by class 8's reading, so 8 without it. On the
entries: 5 (G00217, G00652, J00199, R00565, U01512). K00081, L00565 and
O01387 were numbered by reviewed `retag` patches.

| rid | headword | previous sense ‖ the unnumbered one |
|---|---|---|
| [G00217](https://jastrow.app/#rid:G00217) | `זוּעַ` | `to drip, v. Hif. ‖ (no label) to move, shake, tremble. Pesik. R. s. 26 איבר…` |
| [G00652](https://jastrow.app/#rid:G00652) | `זָקַק` | `to distil, smelt, v. Pi. ‖ (no label) צָרַף) to rivet, forge; to chain, to join; to…` |
| [J00199](https://jastrow.app/#rid:J00199) | `יָוָן` | `of the Grecian tribes, in gen. Greek, Greece; ‖ (no label) מלכות) Greek (Syrian) Government. Targ. Gen. …` |
| [R00565](https://jastrow.app/#rid:R00565) | `צָמַח` | `same, v. Pi. ‖ (no label) to cause to grow, produce. Sifré Deut. 307, v…` |
| [U01512](https://jastrow.app/#rid:U01512) | `שְׁמַע I` | `to make music; to sing, v. Af. ‖ (no label) שַׁמְּעָא) to minister to, be an attendant of…` |

**Control.** K00081, which the catalogue names ("reinsert `—5)`"): it
now carries `5` (P000189), and the predicate no longer finds it.
Positive: G00652, also named, is found; the hOCR reads `to distil,
smelt, v. Pi.—2) (cmp. 57%) to rivet, forge;`
([410a · leaf 433](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$434/full/1400,/0/default.jpg)).
G00217 reads `(b. h.) 1) to drip, v. Hif.—2) to move, shake,`
([388b · leaf 411](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$412/full/1400,/0/default.jpg)),
and U01512 `Pa. … 1) to make music; to sing, v. Af.—2) (v. …) / to
minister to`
([1599a · leaf 922](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$923/full/1400,/0/default.jpg)).

**What already handles it.** The `missing-number` retag patches
(P000184–P000187, P000189) for three of the nine; nothing for the five.

**Recommendation: write a reviewed patch set.** Rule: `retag` the
unnumbered sense with print's `—N)`; where it opens on a stray `)`,
also restore the lost opener from print (`(cmp. `, `(v. `), which a
reviewed patch may add. Precedent: P000184–P000187, P000189. Cost: five print
reads, three already in the hOCR (G00217, G00652, U01512); J00199 and
R00565 need the scan. If nothing is done: the reader keeps seeing a
paragraph with no number, and three with a stray `)`.

**Question.** Number the five from print by reviewed patch?

- **continuation-marker-fully-absent**
  - [ ] port a review detector (reports rows, no repair)
  - [ ] discard with the control named above
  - [x] write a reviewed patch set (say the rule in the note)
  - [ ] can't decide yet (say what is missing in the note)
  - note: as recomended


## 6. `first-sense-debris-stranding-language-label`

**Predicate, as catalogued.** `senses[0]` unnumbered, opening with an
in-text `1)`, duplicating sense 1, and carrying a language or gender
label "with no field to live in". The catalogue held it back because
"deleting the duplicate destroys the only copy of the language label".

**What the reader sees.** Sense 1's opening twice, with two `1)`s:
`f. 1) same. f.` then `1) same. Targ. Y. Num. …`.

**Measured.** My reconstruction: an unlabelled lead holding a
paren-clear `1)` whose following text repeats the opening of the
sibling labelled `1`. 14 entries (the catalogue's 5 come from
chunk-00802; the stand-in gave 21). Two shapes:

- **8 re-emit the label after the duplicate** (the catalogue's shape):
  A02547, D00543, J00606, N00287, N00931, O00151, P00191, Q01287.
- **6 repeat a phrase only**: N00992, O00068, P00426, R00093, S00552,
  U00703. A01873 had this shape and was fixed by P000084.

| rid | headword | lead ‖ sense 1 |
|---|---|---|
| [N00931](https://jastrow.app/#rid:N00931) | `נְסִיבָא II` | `f. 1) same. f. ‖ 1) same. Targ. Y. Num. XXXI, 37; 39; a. fr.…` |
| [D00543](https://jastrow.app/#rid:D00543) | `דַּיּוֹר` | `(not דִּי׳) ch. 1) same.) ch. ‖ 1) same. Targ. Y. II, Gen. XLIV, 18. Targ. …` |
| [A02547](https://jastrow.app/#rid:A02547) | `אִסְקְרִיטָוָן` | `f. pl. ch. 1) = next w. Targ. O. f. pl. ch. ‖ 1) = next w. Targ. O. Ex. XVI, 31.—*2) read…` |
| [N00992](https://jastrow.app/#rid:N00992) | `נַעֲמָה` | `(b. h.) pr. n. f. Naamah, 1) sister of Tubal-Cain. ‖ 1) sister of Tubal-Cain. Gen. R. s. 23 (ref…` |
| [S00552](https://jastrow.app/#rid:S00552) | `קוּקְיָאנֵי` | `m. pl. name of parasite worms, 1) in man. ‖ 1) in man. Ber. 36ᵃ קשה לק׳ (some ed. לקוּק…` |

**The catalogue's objection no longer holds.** In v2 the gloss head
carries the morphology and language code in front of the debris, and
in all eight label-bearing rows the label also stands before the
`1)` (`f. 1) same. f.`, `ch. 1) same.) ch.`). Deleting the run from
`1)` through the re-emitted label keeps one copy.

**Control.** A01873 (`Eliezer, 1) servant of Abraham.`), fixed by
P000084's `delete`, is no longer found. Print for N00992 reads
`(b. h.) pr. n. f. Naamah, 1) sister of Tubal-Cain.` once
([920b · leaf 243](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$244/full/1400,/0/default.jpg)).

**What already handles it.** P000084 (A01873) and P000018 (A00515),
`chopped-duplicated-tail` deletes, for two earlier members. The
`duplicated-definition-opening-run` transform does not reach it: the
copies are not at offset 0 and a `1)` sits between them.

**Recommendation: write a reviewed patch set.** Rule: in the lead,
`delete` (scope `segment`) the duplicated run from the in-text `1)` to
its end, keeping the text before the `1)`. No byte is added, and the
duplicate is verbatim. Cost: 14 patches; a glance at print per entry.
If nothing is done: 14 entries print their first sense twice.

**Question.** Delete the duplicated `1) …` run from the 14 leads by
reviewed patch?

- **first-sense-debris-stranding-language-label**
  - [ ] port a review detector (reports rows, no repair)
  - [ ] discard with the control named above
  - [x] write a reviewed patch set (say the rule in the note)
  - [ ] can't decide yet (say what is missing in the note)
  - note: as recomended


## 7. `verse-paren-false-sense-split`

**Predicate, as catalogued.** A citation cut mid-parenthetical has
its own closing `N)` parsed as a sense marker, minting a sense: the
previous sense has an unclosed `(` and ends on a Roman numeral and a
comma.

**What the reader sees.** A citation broken off (`(as naḥămu nahămu,
Is. XL,`) and a new "sense" made of the verse number (`1) ; a. fr.—V.
נְבִיאוּת`). Where the entry has a real next sense, its marker is left
in the text, so numbers repeat (class 3).

**Measured.** I widened the predicate to the other references that
end in a number: a labelled sense whose previous sibling has more `(`
than `)` and ends on a Roman numeral and comma, `note`, a binyan or
`Kal`, or a number. 16 entries:

- **13 upstream false splits**: A01002, A01136, A01429, A01620,
  B01172, C01063, G00433, H00806, N00045, O01635, P01397, R00407,
  V00144. The verse, note, page or sense number the label came from is
  in the hOCR for eight (A01002 `Gen. XLI, 2)`, A01136 `note 1)`,
  A01620 `Pi. 2)`, B01172 `I Kings V, 3)`, N00045 `Is. XL, 1)`, O01635
  `note 2)`, R00407 `P. Sm. 3431)`, V00144 `Af. 1)`).
- **1 our own**: P00790, where the lettered split cut `b) (v. Kal, c)`
  at the cross-reference's own `c)` (ledger L53).
- **2 false hits**, where print sets a real `1)` and text was lost
  before it: A00675 (`p. 18; 261) 1) Ulam`), T00998 (`Ez. XL, 17; …)
  1) block pavement`). The predicate needs a reading.

| rid | headword | previous sense ‖ the minted one |
|---|---|---|
| [N00045](https://jastrow.app/#rid:N00045) | `נְבוּאָה` | `ולות repeated words &c. (as naḥămu nahămu, Is. XL, ‖ 1) ; a. fr.—V. נְבִיאוּת…` |
| [A01002](https://jastrow.app/#rid:A01002) | `אַחֲוָה` | `and sisters. Gen. R. s. 89 (play on aḥu, Gen. XLI, ‖ 2) in days of plenty there is אהבה וא׳ love…` |
| [A01136](https://jastrow.app/#rid:A01136) | `אִיבְרָיָה` | `l &c. (v. Rabb. D. S. to איבריאתא, Erub. 82ᵇ, note ‖ 1) ; cmp. Pesik. B’shall. p. 90ᵇ sq., a. Be…` |
| [A01620](https://jastrow.app/#rid:A01620) | `אִישּׁוּר` | `m. (v. אָשַׁר, Pi. ‖ 2) praise, adoration. Cant. R. to VIII, 11 …` |
| [R00407](https://jastrow.app/#rid:R00407) | `צִיפּוּחָא` | `m. (צפח to rush, storm, v. P. Sm. 343 ‖ 1) , צִיפּוּחַ נְפשׁ rashness of soul, reck…` |

**Control.** The catalogue names A01002, A01429, A03104 and C00244.
A03104 and C00244 were joined back by reviewed patches (P000201,
P000211) and are not found; A01002 and A01429 are. Print for N00045:
`hdmu, Is. XL, 1); a. fr.— V. r-X"2.`
([867b · leaf 190](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$191/full/1400,/0/default.jpg)).

**What already handles it.** 36 `join` patches (`reviewed-join`,
review doc 01's CHOPPED list), which this op was written for: it folds
a sense Sefaria minted at a cross-reference's own `N)` back into the
sense before it.

**Recommendation: write a reviewed patch set.** Rule: `join` each of
the 13 minted senses back into its predecessor; where the real marker
then sits in the text (A01002, A01620, C01063, O01635), `split` it out
as its own sense. Precedent: the 36 joins. Cost: 13 joins and 4
splits, one print read each, eight already in the hOCR. P00790 is not
a patch: it is the lettered splitter's bug (L53). If nothing is done:
13 entries keep a sense made of a verse number and a broken citation.

**Question.** Join the 13 minted senses back (and split out the four
real markers) by reviewed patch?

- **verse-paren-false-sense-split**
  - [ ] port a review detector (reports rows, no repair)
  - [ ] discard with the control named above
  - [x] write a reviewed patch set (say the rule in the note)
  - [ ] can't decide yet (say what is missing in the note)
  - note: as recomended


## 8. `chopped-marker-with-residue`

**Predicate, as catalogued.** A numbered sense ending in a chopped
`—N)` marker with residue after it (at most 15 characters), its sense
text stranded in the next, unnumbered sibling.

**What the reader sees.** `1) same. Targ. Jer. XXIII, 30.—2) same.`
then an unnumbered `to go round about. …`: sense 2's number at the end
of sense 1, a stray word after it, and sense 2 itself unnumbered.

**Measured.** 10 on the source and 10 in the entries, the same ten
the catalogue counts: C01079, D00634, D00919, D01114, K00808, M02308,
O00975, S00811, S02111, V00892. The residue is `same.` in six, `as
preced.` in two, `v.` (D00919) and `(of wine)` (S02111). The catalogue
reads 7 as a duplicated token and 3 as the real opening of sense N;
which is which is per entry. A sibling shape: B00753, where `—11)`
lost its second digit (`…Y. Sabb. VII, 10ᵃ.—1` then an unnumbered
`receptacle, cover &c.`).

| rid | headword | previous sense ‖ the unnumbered one |
|---|---|---|
| [C01079](https://jastrow.app/#rid:C01079) | `גְּנַב` | `same. Targ. Jer. XXIII, 30.—2) same. ‖ (no label) to go round about. Keth. 19ᵃ גַנּוֹבָא ג…` |
| [D00634](https://jastrow.app/#rid:D00634) | `דִּין` | `me. Targ. Ps. XXXVII, 33; a. e.—2) same. ‖ (no label) to argue, dispute, have a law-suit with.…` |
| [D00919](https://jastrow.app/#rid:D00919) | `דְּנָא` | `v. preced.—2) v. ‖ (no label) v. preced.—2) v. דְּנָה. [Targ. Prov. VI…` |
| [S02111](https://jastrow.app/#rid:S02111) | `קָרַס` | `same, v. supra.—2) (of wine) ‖ (no label) to become sourish. Ber. 40ᵇ היין שה׳ Ms.…` |
| [V00892](https://jastrow.app/#rid:V00892) | `תְּקַל II` | `d. Lag. a. oth. under LVII, 3).—2) same. ‖ (no label) to clear, v. infra.…` |

**Control.** All ten the catalogue counts are found. D00634's print
has no `same.` after the marker: `1) same. Targ. Ps, XXXVI, 33; /
—2) to argue, dispute`
([301a · leaf 324](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$325/full/1400,/0/default.jpg));
nor does V00892's (`under LVII, 3).— 2) to clear, v. infra.`,
[1691a · leaf 1014](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1015/full/1400,/0/default.jpg)).
D00919's repair was already read on the print by you (body-review 08,
2026-08-07): drop the dangling `—2) v.` fragment, drop the duplicated
`v. preced.`, number the sense `—2)`.

**What already handles it.** Nothing. `stemHeadMarkerChop` moves a
chopped marker only when nothing follows it (18 entries), and refuses
these by design (DESIGN §6, "What the repairs decline to guess").

**Recommendation: write a reviewed patch set.** Rule: per entry, from
print: where the residue is a duplicate, `delete` it and the marker
from sense 1 and `retag` the next sense with the marker; where it is
sense N's real opening, `move` it with the marker onto the next sense.
Cost: 10 entries, 2–3 patches each, a print read each (three in the
hOCR or already read). B00753 can ride in the same set. If nothing is
done: 10 entries show a sense's number in the wrong place and a stray
word.

**Question.** Repair the ten by reviewed patch, each read on the
print?

- **chopped-marker-with-residue**
  - [ ] port a review detector (reports rows, no repair)
  - [ ] discard with the control named above
  - [x] write a reviewed patch set (say the rule in the note)
  - [ ] can't decide yet (say what is missing in the note)
  - note: as recomended


## 9. `inflection-sublist-numbering-flattened`

**Predicate, as catalogued.** The lead sense ends with an inflection
label and its form (`—Fem. חֲבִיבְתָּא`), and the `1)`/`—2)` senses
that follow enumerate that form, yet sit as top-level siblings, so
sense `1)` reads as a sense of the headword. The mirror of class 4.

**What the reader sees.** Print's text in print's order. What is
wrong is only the nesting: C00062's `—Pl.` block owns its senses, these
do not.

**Measured.** An unlabelled sense ending in `—Pl.`, `—Fem.`, `—Du.`,
`—Part.`, `—Denom.` (and the like) plus a Hebrew form, whose next
sibling is labelled `1`: 8 entries. All three the catalogue names
(A00994, A01798, H00052) are found, and five more: B00740, D00131,
E00230, H00553, M02479. D00131's `Pl. דִּדָּה` may be an OCR `Pl.` for
`Pi.` (a stem head, not this class); read it before deciding.

| rid | headword | end of the lead ‖ sense 1 |
|---|---|---|
| [H00052](https://jastrow.app/#rid:H00052) | `חָבִיב` | `… B. Kam. X, beg., 7ᵇ; a. fr.—Fem. חֲבִיבְתָּא ‖ 1) aunt, father’s brother’s wife. Targ…` |
| [A00994](https://jastrow.app/#rid:A00994) | `אֶחָד` | `…or once, for a change, v. חֲדַת.—Pl. אֲחָדִים ‖ 1) singular, unique. Yalk. Gen. 62 (re…` |
| [A01798](https://jastrow.app/#rid:A01798) | `אֱלוֹהַּ` | `…. 106ᵃ; cmp. אלעיקי, איפופי &c.—Pl. אֱלוֹהוֹת ‖ 1) deities, powers. Y. Ber. IX, beg. 1…` |
| [M02479](https://jastrow.app/#rid:M02479) | `מַר IV` | `… v. respect. pr. nouns.—Fem. מָרְתָא, מָרְתָה ‖ 1) mistress, constr. מָרַת. Targ. I Ki…` |
| [E00230](https://jastrow.app/#rid:E00230) | `הוי` | `…nt’s statement; a. v. fr.—Part. הוֶֹה, הוֶוֹה ‖ 1) frequent, usual. Sabb. VI, 6 דברו ח…` |

**Control.** The three named rids are found. M02479's print reads
`— Fern. / … l) mistress, constr.` (ABBYY's `l)` for `1)`;
[834a · leaf 157](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$158/full/1400,/0/default.jpg)):
the form, then its numbered senses, as stored.

**What already handles it.** Nothing. The form-section split carves a
block out of one sense's text; here upstream already split the
numbered senses into siblings, so there is no text to carve, and no
patch op nests one sense under another.

**Recommendation: port a review detector.** The page is right, the
structure is not, and the structure is what a sense address would
name: once `1)` is addressable as a sense of `חָבִיב`, nesting it under
`—Fem.` later moves it. The detector reproduces the named three and is
cheap; fixing the eight needs either a nesting patch op or a rule
extending B12 to siblings, both bigger than eight entries justify
today. If nothing is done: nothing changes on the page.

**Question.** Port a detector for a form label that ends the lead
with its numbered senses left at top level?

- **inflection-sublist-numbering-flattened**
  - [x] port a review detector (reports rows, no repair)
  - [ ] discard with the control named above
  - [ ] write a reviewed patch set (say the rule in the note)
  - [ ] can't decide yet (say what is missing in the note)
  - note: 


## The tenth sibling: `continuation-marker-em-dash-loss`

Not in #123, and not a box: it is a `transform` row, `blocking: true`,
and its high-confidence core shipped as the `continuationMarkerDash`
rule (14 entries). It is the bare-`N)` half of class 5's family: a
continuation marker present without its dash, where class 5's is
absent altogether. Its 22 unshipped markers (no sibling witnesses a
dash) no longer exist in entry data: ruling `10-04 sense star` stores
a label as `"2"` with no dash, and the app draws the dash by rule. The
row's `blocking: true` and `candidate` are stale against that ruling;
review ledger L54 records it for the catalogue.

---

## The implied-`1)` rows (body-review 08)

Body-review 08's table holds **22** rows with no decision, not the 21
the research backlog lists: it left out Q01352. None of the 22 has a
patch, none carries a `1` label, and in each the `—2)` still sits
inside the first sense of its list. Five of them sit in a stem section
now (the census predates the stem lift), where a retag targets that
section's first sense. The source has no second sense in any of them:
the `—2)` is in the text of an unnumbered sense, followed by a stem
block or nothing.

| rid | headword | the entry now | source: the host's `number` | hOCR, verbatim | scan |
|---|---|---|---|---|---|
| [J00627](https://jastrow.app/#rid:J00627) | `ירי` | top level, no label; `—2)` inside its text | none; `—2)` in its text; next: stem `Hif.` | `™, vr (b. h.; cmp. "8 1( to permeate, penetrate ;` | [596a · leaf 619](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$620/full/1400,/0/default.jpg) |
| [J00657](https://jastrow.app/#rid:J00657) | `יֶרֶק` | top level, no label; `—2)` inside its text | none; `—2)` in its text | `Pm. (©. b.; preced. wds.) green, herb. Peah 4,` | [597b · leaf 620](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$621/full/1400,/0/default.jpg) |
| [K00030](https://jastrow.app/#rid:K00030) | `כָּבֵד I` | stem `Nithpa.`, no label; `—2)` inside its text | none; `—2)` in its text | `== 1100. “earn, Nithpa, "G29 to be honored \| to pride,` | [606b · leaf 629](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$630/full/1400,/0/default.jpg) |
| [K00121](https://jastrow.app/#rid:K00121) | `כְּדִי I` | top level, no label; `—2)` inside its text | none; `—2)` in its text | `ment , (M1, “TD) ד הד--) +- 219) then; now (that).` | [613a · leaf 636](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$637/full/1400,/0/default.jpg) |
| [K00156](https://jastrow.app/#rid:K00156) | `כהי` | stem `Pi.`, no label; `—2)` inside its text | none; `—2)` in its text | `Pi. reve, rte to grow duller, to be shaded, titra Thast.,` | [614b · leaf 637](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$638/full/1400,/0/default.jpg) |
| [K00859](https://jastrow.app/#rid:K00859) | `כָּנַן` | stem `Pi.`, no label; `—2)` inside its text | none; `—2)` in its text | `= Pi. 3 to form circles, to wind arownd. Par. Vil, 7` | [649a · leaf 672](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$673/full/1400,/0/default.jpg) |
| [N00235](https://jastrow.app/#rid:N00235) | `נִדְנוּד` | top level, no label; `—2)` inside its text | none; `—2)` in its text | `"IID", " m. (preced.) moving about, exile. Gen. R.` | [879b · leaf 202](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$203/full/1400,/0/default.jpg) |
| [N00577](https://jastrow.app/#rid:N00577) | `נָטַף` | top level, no label; `—2)` inside its text | none; `—2)` in its text; next: stem `Pi.` | `*]t2D (b. h. ; cmp. Eg§9) to drip, overflow. Ker. 6a CpttJ` | [901a · leaf 224](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$225/full/1400,/0/default.jpg) |
| [N01162](https://jastrow.app/#rid:N01162) | `נָקַד I` | top level, no label; `—2)` inside its text | none; `—2)` in its text; next: stem `Nif.` | `i)>- I (cmp. "i"pT) to sting, point, puncture, break` | [931a · leaf 254](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$255/full/1400,/0/default.jpg) |
| [P01055](https://jastrow.app/#rid:P01055) | `עֵסֶק II` | top level, no label; `—2)` inside its text | none; `—2)` in its text | `pw*? II m. (pc?) business, worldly occupation; affair,` | [1099a · leaf 422](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$423/full/1400,/0/default.jpg) |
| [Q01352](https://jastrow.app/#rid:Q01352) | `פֶּסֶק` | top level, no label; `—2)` inside its text | none; `—2)` in its text | `p&D m. (preced.) detached piece, remainder. — Pi.` | [1200b · leaf 523](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$524/full/1400,/0/default.jpg) |
| [R00075](https://jastrow.app/#rid:R00075) | `צַבְתָּא` | top level, no label; `—2)` inside its text after an OCR `l)` | none; `—2)` in its text | `btTGJI, NTQ"'^, '211 1 c.ch. l)same. Gitt.56b-,3"'bpttJ` | [1260a · leaf 583](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$584/full/1400,/0/default.jpg) |
| [R00291](https://jastrow.app/#rid:R00291) | `צִיב` | top level, no label; `—2)` inside its text after an OCR `l)` | none; `—2)` in its text | `lni2 m. (= 3^3S ; 33S, cmp. n3S) 1 ) swelling.— PI. b^S,` | [1274a · leaf 597](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$598/full/1400,/0/default.jpg) |
| [R00586](https://jastrow.app/#rid:R00586) | `צַמְצֵם` | stem `Ithpalp.`, no label; `—2)` inside its text | none; `—2)` in its text | `Ithpalp. 1) bsbstx to veil one's self. Targ. Y. II Gen.` | [1289a · leaf 612](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$613/full/1400,/0/default.jpg) |
| [S00826](https://jastrow.app/#rid:S00826) | `קְטַר` | top level, no label; `—2)` inside its text | none; `—2)` in its text; next: stem `Pa.` | `H"4p> "*I"",T.P ch- same> to ***• Targ- Jud- xVi *• Targ-` | [1353a · leaf 676](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$677/full/1400,/0/default.jpg) |
| [S01731](https://jastrow.app/#rid:S01731) | `קְפֵי` | top level, no label; `—2)` inside its text | none; `—2)` in its text; next: stem `Af.` | `"'Sp, fc^p ch. same, to float, be on top. Targ. II Kings` | [1400b · leaf 723](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$724/full/1400,/0/default.jpg) |
| [T00243](https://jastrow.app/#rid:T00243) | `רדי` | top level, no label; `—2)` inside its text | none; `—2)` in its text; next: stem `Nif.` | `'"T"), mn II (b. h., cmp. 11*0 to take down; to detach,` | [1452a · leaf 775](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$776/full/1400,/0/default.jpg) |
| [T00375](https://jastrow.app/#rid:T00375) | `רוּם` | top level, no label; `—2)` inside its text | none; `—2)` in its text; next: stem `Af.` | `WT\t D"H ch. same, to be high. Targ.Ps. LXXXIX, 14.` | [1460a · leaf 783](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$784/full/1400,/0/default.jpg) |
| [T00538](https://jastrow.app/#rid:T00538) | `רָחַק` | stem `Hif.`, no label; `—2)` inside its text | none; `—2)` in its text | `Hif. p-rnri same. Sifre Num. 94 b^rna, v. SJI?. B.` | [1469a · leaf 792](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$793/full/1400,/0/default.jpg) |
| [U00884](https://jastrow.app/#rid:U00884) | `שִׁיטָּה` | top level, no label; `—2)` inside its text after an OCR `l)` | none; `—2)` in its text | `nt2*tp, iT^ZJ III f. (awe, cmp.aanr) l) row, line.` | [1560a · leaf 883](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$884/full/1400,/0/default.jpg) |
| [U00960](https://jastrow.app/#rid:U00960) | `שִׁימּוּר` | top level, no label; `—2)` inside its text | none; `—2)` in its text | `"IIBTtJ, '3S« m. (-3-3) guarding, care. B. Kam. 15a` | [1563b · leaf 886](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$887/full/1400,/0/default.jpg) |
| [V00652](https://jastrow.app/#rid:V00652) | `תְּמַהּ` | top level, no label; `—2)` inside its text after an OCR `l)` | none; `—2)` in its text; next: stem `Af.` | `FT^r, T7DT. ch. same, 1) to wonder &c. Targ. Gen.` | [1675b · leaf 998](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$999/full/1400,/0/default.jpg) |

**What the hOCR says.**

- **17 look implied**: the line where the first sense begins has no
  `1)` before the gloss (J00627's `1(` is the mirrored `I)` of `אֲרִי
  I)`, which the entry carries; K00121's `219)` is most likely the
  garbled close of `v. כְּדוּ)`, so read its scan if in doubt). J00627, J00657, K00030, K00121,
  K00156, K00859, N00235, N00577, N01162, P01055, Q01352, S00826,
  S01731, T00243, T00375, T00538, U00960.
- **4 are an OCR `l)` for `1)`**, the body-review 08 rejection "Not
  implied, OCR error" given to E00148, E00298 and I00822: the entry
  stores `l)` before the first gloss, and the hOCR reads `1)` (R00291,
  V00652) or the same `l)` (R00075, U00884). Their repair is
  `replace` `l)` → `1)`, then `split`, as P000171–P000183 did.
- **1 is a `1)` Sefaria dropped**: R00586's `Ithpalp.` section reads
  `Ithpalp. 1) … to veil one's self` in print. Same repair as an
  implied one (`retag` `1)`, then `split`), recorded as
  `missing-number` like L00565.

Whichever you tick, the 17 and R00586 take the same two patches; the
choice is what the record says.

My recommendation is the second box, with the 17 in the note; the
other five then go the OCR and dropped-number ways above.

**Question.** Which of the 22 are implied `1)`?

- **implied-`1)` rows**
  - [ ] confirm all 22 as implied `1)`
  - [ ] confirm only those I tick below (list rids in the note)
  - [ ] none
  - [ ] can't decide yet
  - note: As per your recomendation — the 17 the worklist listed as
    implied: J00627, J00657, K00030, K00121, K00156, K00859, N00235,
    N00577, N01162, P01055, Q01352, S00826, S01731, T00243, T00375,
    T00538, U00960; applied in PR #160

---

## Round 2: needs another look (2026-10-10)

Three entries from the patch sets where the ticked rule does not
decide the edit. Each block is one question, with what the entry
holds now and where the scan is. Tick ONE box, add a note only where a
box asks for one, and skip anything you like. Everything else the
rulings decided is applied (`admin/pipeline/patch/records/tranches/group-d-2026-10-10/README.md`).

### J00199 (`יָוָן`), class 5: the lost opener

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `1` | `pr. n. m. Javan, son of Japheth, progenitor of the Grecian tribes, in gen. Greek, Greece;` | `7, Pile )₪- bh.) 1) pr. .מז .מ Javan, son of Japheth,` / `ו af thes וו tribes, Yn gen. Cred Graces;` | [569b · leaf 592](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$593/full/1400,/0/default.jpg) |
| (no label) | `מלכות) Greek (Syrian) Government. Targ. Gen. X, 2; a. e.—…` | the next line is `Gen. X, 2; a. e.—Targ. ¥. Gen. XV, 12.—…` | same |

The paragraph is print's sense 2, and it opens on a stray `)`: the
marker and the opening of its parenthetical were lost together, as in
G00652 and U01512, whose patches restore `(cmp. ` and `(v. `. Here
Tesseract garbled the right-hand half of the line, so the hOCR does not
show what print sets before `מלכות`.

**Question.** What does print set between `Greece;` and `מלכות)`?

- **J00199**
  - [x] `—2)` and a lost opener: number it and restore the opener (write print's text from `Greece;` to `מלכות)` in the note)
  - [ ] `—2)` only: print has no opener there (say what the `)` closes in the note)
  - [ ] can't tell from the scan
  - note: Greece; — 2) fem. (sub, מלכות) Greek (Syrian) Government.

Applied in PR #164: P000510 restores `fem. (sub. ` (the scan reads
`sub.`, confirmed 2026-10-11; his note's comma was a typo) before
`מלכות)`, P000511 numbers the sense `—2)`.


### D01114 (`דְּרַס`), class 8: the residue and a lost `2)`

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `2`, its end | `… Nidd. 32ᵇ הא קא דָּרֵיס לכולהו Ar. (ed. הא דרס להו).—3) as preced. ` | `pressed.—2) to press, use as a rest (v. on). Nidd. 32°` / `as preced. 2), (8--. (הא דרס להו Ar. (ed. חא NP דָּרִיס לכולהו` | [324b · leaf 347](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$348/full/1400,/0/default.jpg) |
| (no label) | `Ḥull. 9ᵃ זמנין דשהי ודָרֵיס וכ׳ he may sometimes pause or press unawares.—4) as preced. 3). …` | `press unawares.—4) as pistons 3). Part. act. …` | same |

The residue `as preced.` is sense 3's real opening (print: `—3) as
preced. 2)`, "as the preceding word, sense 2"), so the rule moves it
with the marker onto the unnumbered sense. But Sefaria cut the sense
at that `2)`, and the `2)` is in no source byte. Moving only what is
there would give `3) as preced. Ḥull. 9ᵃ …`, which drops the
cross-reference's sense number. The `(8--.` in the hOCR is Tesseract's
mirrored `—3)`, and the punctuation after `2)` is unclear (`2),` or
`2).`).

**Question.** How should D01114's sense 3 read?

- **D01114**
  - [x] `3) as preced. 2). Ḥull. 9ᵃ …`: move it and restore `2). ` from print
  - [ ] `3) as preced. 2), Ḥull. 9ᵃ …`: move it and restore `2), ` from print
  - [ ] something else (write print's text in the note)
  - [ ] can't tell from the scan
  - note:

Applied in PR #164: P000512 lifts `—3) as preced. ` off sense 2,
P000513 puts `as preced. ` back with print's `2). `, P000514 numbers
the sense `—3)`.


### B00753 (`בַּיִת`), class 8's sibling: `—1`, and lost words

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `10`, its end | `shed for plants, covering. Shebi. II, 4 (pl.). Y. ib. 33ᵈ.—Y. Sabb. VII, 10ᵃ.—1` | `—10) shed for plants, covering. Shebi.II, 4(pl.). Y.ib.334,` / `—Y. Sabb. VII, 10".--11( in compounds, denoting recept-` | [168a · leaf 191](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$192/full/1400,/0/default.jpg) |
| (no label) | `receptacle, cover &c., e.g. ב׳ הדיו inkstand. …` | `acle, cover &c., e.g. "I ב' inkstand. Tosef. Kel. B. Mets.` | same |

The worklist read this as `—11)` losing its second digit. The hOCR
shows more: print reads `—11) in compounds, denoting receptacle,
cover &c.`, so `1) in compounds, denoting ` is in no source byte. A
`retag` alone would number the sense `11` and leave it opening
`receptacle`, without the words that say these are compounds.

**Question.** How should B00753's sense 11 be repaired?

- **B00753**
  - [x] drop `—1` from sense 10, number the next sense `—11)`, and restore `in compounds, denoting ` from print
  - [ ] drop `—1` and number it `—11)` only (the lost words stay a known gap)
  - [ ] can't tell from the scan
  - note: 

Applied in PR #164: P000515 drops `—1` from sense 10, P000516
restores `in compounds, denoting `, P000517 numbers the sense `—11)`.

---

## Class 3 scan review (2026-10-11)

These are the 22 rows `self-numbered-intext-marker` reports (PR #163),
one block and one question per entry, laid out as round 2's: what the
entry stores, the hOCR lines of both markers, and the scan. Tick ONE
box per entry, add a note only where a box asks for one, and skip
anything you like. A later PR turns the ticks into reviewed patches,
and any change to print's text is annotated in each patch's rationale.

How to read the blocks:

- The label lists are the host's own list, written as the tranche
  README writes them: `·` an unlabelled sense, `(…)` the children of
  the sense before it. Each option says the list it would give.
- The hOCR is verbatim apart from removed bidi marks. Volume 1 is
  Tesseract, which mirrors a marker in a Hebrew run (`(4--.` for
  `.—4)`) and reads `3` as `8` at times; volume 2 is ABBYY, which
  reads the numerals well.
- Where the hOCR shows the numeral twice, I recommend keeping print's
  number: no row's hOCR shows N+1 where the entry has N, and numbering
  on is a deviation with no print witness (§3's answer).
- Four rows are not a doubled numeral: the second number belongs to a
  list that restarts inside the sense (A00982's dual, C00263's derived
  noun, C00869's and U01512's participle). §3's answer counted C00869
  and U01512 as print's own doubled numeral; read with the lines
  before them, they are not. Their options say what they are. No patch
  op today nests a sense under another, so a "nest" tick needs a new
  op (or, for A00982, `Du.` in the form-section `MARKERS`), its own PR.

| rid | host's list | what the hOCR shows | recommendation |
|---|---|---|---|
| A00982 | `· 1 2 3` | a dual's list `1) … —2) … —3)` | nest the dual, 3 items (medium) |
| B01153 | `1 2 3 4` | `4)` twice, both mirrored | keep (medium) |
| B01299 | `· 1 2 3` | `3)` twice | keep (high) |
| C00263 | `1 2` | Miggo's list `1) … —2)` | nest Miggo (medium) |
| C00399 | `1 2 3` | `2)` twice, then `3)` | keep (medium) |
| C00869 | `1 · (1) 2 3 4` | the participle's `1) … 2)`, then the verb's `2) 3) 4)` | nest and split (high) |
| C00871 | `· 1 2 3` | host `3)` mirrored; in-text marker garbled | keep (medium) |
| C00872 | `1 2 3 4` | `4)` twice | keep (high) |
| G00456 | Kal `1 2 3 4` | in-text `4)`; the host's line is missing | keep (medium) |
| H00940 | Kal `· 1 2 3` | host `2)`; in-text line garbled | keep (low) |
| H01899 | Kal `1 2 3` | `2)` twice, then `3)` | keep (high) |
| I00712 | Kal `· 1 2 3 4 (a b)` | `3)` twice (one misread), then `4)` | keep (medium) |
| K00086 | `1 2 3 4 5 6` | `6)` twice | keep (high) |
| K01280 | Kal `1 2 3` | `3)` twice | keep (high) |
| M00596 | `· 1 2 3 4` | `4)` twice | keep (high) |
| M02130 | `· 1 2 3 (a b c d)` | `3)` twice | keep (high) |
| N01139 | Hif. `1 2` | `2)` twice | keep (high) |
| P00059 | Pi. `1 2 3 4` | `4)` twice, then `S)` where the entry has `6)` | keep (low) |
| Q01502 | Hif. `1 2 3` | `2)` twice, then `3)` | keep (high) |
| S00151 | Af. `1 2 3 4` | `3)` twice, then `4)` | keep (high) |
| U01512 | Af. `1 2` | the participle's `a) … —2)` | nest the participle (medium) |
| V00909 | Kal `1 2 3 4` | `4)` twice | keep (high) |

### A00982 (`אֹזֶן`), class 4's residue

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `2` | `handle. Cant. R. beg. ולא הי׳ לה א׳ וכ׳ but had no handle and could not be carried; a. fr.—Du. אָזְנַיִם 1) ears. …` | `ear, opp. Divine perception. Y. Sabb. I, ₪ top; a. fr.—` / `2) 1 Cant. R. beg. לה א' וכ' 7H ולא but had no` / `handle and could not’ be carried; a. fr——Du. D7238` / `1) ears. Ley. R. s. 32, beg. א' לדרך the road has ears` | [38a · leaf 61](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$62/full/1400,/0/default.jpg) |
| `2`, in its text | `… the road has ears (be on your guard in speaking); a. fr.—2) handles. …` | `(be on your guard in speaking); a. fr—2) handles. Kel.` | same |
| `3` | `אָזְנַיִם or בנות א׳ swollen glands of the throat (Rashi). …` | `TV, 3, y. גרסטרא ; a. fr.—3) DIN or א" M122 swollen glands` | same |

Not a doubled numeral. Sense 2 holds the noun's dual, `—Du. אָזְנַיִם`,
with its own list restarting at `1) ears`; the in-text `—2) handles` is
that list's second item, and print runs straight on to `—3) … swollen
glands`, which Sefaria cut out as the noun's sense 3. It came into this
class as class 4's residue (§4, PR #159): the form-section split does
not carve it because `MARKERS` has no `Du.`. A split at `—2)` would
lift the dual's second item to the noun's level, so the standard
options do not fit.

**Question.** How should A00982's dual be structured?

- **A00982**
  - [x] nest the dual with three items: `—Du. אָזְנַיִם` becomes an unlabelled sibling after sense 2, with `1) ears`, `2) handles` and today's sense 3 as its children: `· 1 2 · (1 2 3)`
  - [ ] nest the dual with two items: as above, but `3) … swollen glands` stays the noun's sense 3: `· 1 2 · (1 2) 3`
  - [ ] leave whole: the dual stays inline in sense 2 (`· 1 2 3`, as today)
  - [ ] can't tell from the scan
  - note: 

Recommendation: nest with three items (medium): the hOCR runs `—Du. …
1) ears … —2) handles … —3) … swollen glands` as one paragraph, and a
form's list comes after the word's own senses (as C00062's `—Pl.`
does), so a third sense of the noun after the dual would be out of
order.

Applied in PR #167: P000538 joins Sefaria's sense `—3)` back into
sense 2, and the form-section split, whose markers gain `Du.` (ruling
`10-12 nested sublists`), carves the dual out with its three items
(labels `· 1 2 3` → `· 1 2 · (1 2 3)`; mechanism: `join` + `Du.`
marker).

### B01153 (`בַּר`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `4` | `(= h. חוּץ) outside, outdoors, street. Targ. Gen. XXXIV, 31 נפקת ב׳ a prostitute …` | `outside, outdoors, street. Targ. Gen. (דזץ (=h. (4--.[אברא` | [188b · leaf 211](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$212/full/1400,/0/default.jpg) |
| `4`, in its text | `… B. Bath. 93ᵇ Ar. (ed. בתרא); cmp. בָּרָאָה.—4) (prep. a. adv.) outside; בר מן outside of, except …` | `--.בְּרְאָח emp. ;(בתרא B. Bath. 98" Ar. (ed. ; (דברייתא` / `outside of, except, with- בר ביך (prep. a. adv.) outside; )4` | same |

Sense 4 is the last of `1 2 3 4`. Tesseract mirrors both markers in
these Hebrew-heavy lines: `(4--.` at the end of the line holding
`outside, outdoors`, and `)4` at the end of the line holding `(prep. a.
adv.) outside`, so both read `4`. Print sets the numeral twice.

**Question.** How should B01153's in-text `—4) (prep. a. adv.)` be read?

- **B01153**
  - [x] split here and keep print's number (a second `4`), as printed: `1 2 3 4 4`
  - [ ] split here and number on: this sense becomes `5`; no later sense moves: `1 2 3 4 5`
  - [ ] leave whole: the `4)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (medium): both markers read `4`,
though both are mirrored.

Applied in PR #166: P000518 splits `—4) (prep. a. adv.)` out of sense 4
under print's number (labels `1 2 *3 4` → `1 2 *3 4 4`).

### B01299 (`בְּרַם`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `3` | `only, but. Targ. Gen. VII, 23. Targ. Lam. III, 3 (h. text אַךְ). …` | `Dan. IV, 12; V, 17.—Targ. Ps. LVIII, 3; 8. fr.—3) only,` / `but. Targ. Gen. VII, 28. Targ. Lam. 111, 3 (h. text 3x).` | [196a · leaf 219](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$220/full/1400,/0/default.jpg) |
| `3`, in its text | `… but in fact they said this. B. Mets. 114ᵃ.—3) interj. truly!, surely! …` | `fact they said this. B. Mets, 114°.—3) interj.truly!, surely !` | same |

§3's control. Sense 3 is the last of `· 1 2 3`. The hOCR reads `—3)
only,` and `—3) interj.truly!`: print sets `3)` twice.

**Question.** How should B01299's in-text `—3) interj.` be read?

- **B01299**
  - [x] split here and keep print's number (a second `3`), as printed: `· 1 2 3 3`
  - [ ] split here and number on: this sense becomes `4`; no later sense moves: `· 1 2 3 4`
  - [ ] leave whole: the `3)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (high): both markers are clear in
the hOCR.

Applied in PR #166: P000519 splits `—3) interj.` out of sense 3 under
print's number (labels `· 1 2 3` → `· 1 2 3 3`).

### C00263 (`גֵּו ²`), class 4's residue

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `2` | `(with or without ב) among, amid; in, into. Targ. Ex. XIV, 22; a. fr.—Y. …` | `that every day; a. fr—Pl. x43. Targ. Prov. XX, 27 (ed.` / `Lag. 753).—2) (with or without (ב among, amid; in,` | [216a · leaf 239](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$240/full/1400,/0/default.jpg) |
| `2`, in its text | `… a. fr.—Hence מִיגּוֹ, מִגּוֹ Miggo, 1) (= h. מִתּוֹךְ, Shebu. 45ᵇ, and מֵאַחַר, v. אַחַר) a legal rule …` | `matters, he is also suspected of swearing falsely; a. fr.—` / `Hence 48%, 4572 Miggo, 1)(=h. ,מתוך Shebu. 45", and “mwa,` | same |
| `2`, in its text | `… the one miggo and the other?; a. fr.—2) (cmp. אַגַּב) an action declared valid …` | `what is the difference between the one miggo and the` / `other ?; a. fr.—2) (emp. 58) an action declared valid because` | same |

Not a doubled numeral. Sense 2 ends on a derived noun, `—Hence מִיגּוֹ,
מִגּוֹ Miggo,`, with its own list `1) … —2)`, and the in-text `—2)` is
Miggo's second sense. It came into this class as class 4's residue (§4,
PR #159): the form-section split does not carve a derived noun, which
is not an inflection. A split at `—2)` would make Miggo's second sense
the noun's, so the standard options do not fit. G00456's `v. מִיגּוֹ,
s. v. גּוֹ` points into this block.

**Question.** How should C00263's Miggo list be structured?

- **C00263**
  - [x] nest Miggo: `—Hence מִיגּוֹ, מִגּוֹ Miggo,` becomes an unlabelled sibling after sense 2, with its `1)` and `2)` as its children: `1 2 · (1 2)`
  - [ ] leave whole: Miggo's list stays inline in sense 2, as print runs it (`1 2`, as today)
  - [ ] can't tell from the scan
  - note: 

Recommendation: nest Miggo (medium): the hOCR shows `Hence … Miggo,
1)(=h.` and `other ?; a. fr.—2) (emp. 58)` as Miggo's own list, and
only a block of its own lets a sense address reach them; leaving it
whole is the choice if no new op is wanted.

Applied in PR #167: P000539 nests Miggo's list under `—Hence
מִיגּוֹ, מִגּוֹ Miggo,` (labels `1 2` → `1 2 · (1 2)`; mechanism: the new
`nest` op, ruling `10-12 nested sublists`).

### C00399 (`גּוֹלְמָא`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `1`, `2` | `ch. sameunfinished vessel.` ‖ `Pl. גּוּלְמַיָּא, גּוּלְמֵי. …` | `nai ch. same; 1) unfinished vessel.—2) Pl. nrabhs,` | [222a · leaf 245](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$246/full/1400,/0/default.jpg) |
| `2`, in its text | `… it treats of unfinished (needles).—2) (cmp. גְּוִיל) stone. …` | `preced.).—Sabb, 52” “gba; 123° בגולמי it treats of un-` / `finished (needles).—2) (cmp. ban) stone. 1. bis. Targ.` | same |
| `3` | `hill, v. גְּלִימָא II.` | `Valk. Is, 284; Ar. ₪. v. (8--.גולמהרג hill, +. פְלִימָא IL.` | same |

The hOCR reads `1) unfinished vessel.—2) Pl.` and, three lines on,
`—2) (cmp. ban) stone`, then `(8--.` (Tesseract's mirrored `—3)`)
before `hill`: print's sequence is `1 2 2 3`. Print's first `2)` heads
only the plural's citations, whose gloss (unfinished needles) is sense
1's meaning, so that first `2)` may be print's slip; the hOCR cannot
say, but it does show print setting it.

**Question.** How should C00399's in-text `—2) (cmp. גְּוִיל) stone` be
read?

- **C00399**
  - [x] split here and keep print's number (a second `2`), as printed: `1 2 2 3`
  - [ ] split here and number on: this sense becomes `3` and `hill` becomes `4`: `1 2 3 4`
  - [ ] the first `2)` is print's slip: join the plural back into sense 1, and split here as `2`: `1 2 3` (a deviation from print)
  - [ ] leave whole: the `2)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (medium): the hOCR shows `2)`
twice and print's `3)` after them.

Applied in PR #166: P000520 splits `—2) (cmp. גְּוִיל) stone` out of sense
2 under print's number (labels `1 2 3` → `1 2 2 3`).

### C00869 (`גִּלְגֵּל`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `·` and its `1` | `Part. pass. מְגוּלְגָּל, f. מְגוּלְגֶּלֶת; …` ↳ `rolled. Pes. 7ᵃ עיסה מג׳ a formed dough. Y. Sot. I, 16ᶜ bot. ביצים מג׳ roasted eggs; a. fr.` | `has formed the dough (of wheat) by rolling; a. fr.— Part.` / `.מגלְפלות ; מִגזִלְפָלֶרן מִגלְפָל"ם pl. ; מגוּלגלָת .1 ,2500 pass.` / `not a formed dough. 0 Sot. 1 16° מג' 7° rolled. Pes. )1` | [244a · leaf 267](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$268/full/1400,/0/default.jpg) |
| `2` | `rounded. B. Bath. 16ᵇ מה עדשה זו מְגוּלְגֶּלֶת …` | `roasted eggs; a. fr.—2) rounded. B. Bath. ‘16> ביצרם מג' bot.` | same |
| `2`, in its text | `… [Men. 86ᵃ, v. גִּרְגֵּר.].—2) (with על) to roll upon, …` | `[Men. 86% v. "H5.].—2) (with >») to roll upon, (פִלְפָל v.` | same |
| `3` | `to bring about, cause. …` | `‘1 עלרו you make him bear the expenses for &o.—8) 6` / `bring about, cause. Sabb. 32*; Tosef. Yoma V (IV), 12` | [244b · leaf 267](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$268/full/1400,/0/default.jpg) |

Not a doubled numeral, though §3's answer counted it as one. Print's
`Part. pass.` paragraph has its own list: `)1` (Tesseract's mirrored
`1)`) before `rolled`, then `—2) rounded`. The form-section split
nested the `1)`, but Sefaria had already cut `2) rounded` out as a
sense of the verb. The in-text `—2) (with על) to roll upon` is the
verb's own sense 2, and print goes on `—8)` (its `—3)`) `bring about`
and `—4) … to overcome`.

**Question.** How should C00869's two `2)`s be placed?

- **C00869**
  - [x] nest and split: `2) rounded` becomes the `Part. pass.` block's second child, and the verb's `—2) (with על)` is split out as sense 2: `1 · (1 2) 2 3 4`, as print reads
  - [ ] split here and keep print's number, leaving `rounded` where it is: `1 · (1) 2 2 3 4`
  - [ ] split here and number on: this sense becomes `3` and the later senses shift: `1 · (1) 2 3 4 5`
  - [ ] leave whole (as today)
  - [ ] can't tell from the scan
  - note: 

Recommendation: nest and split (high): the hOCR shows the
participle's `1)` and `2) rounded`, then the verb's `2)`, `3)` and
`4)`, so the two `2)`s belong to two lists; the split is an existing
op, the nesting is not.

Applied in PR #167: P000540 splits the verb's `—2) (with על)` out
as sense 2, and P000541 joins `—2) rounded` back after the
participle's `1) rolled`, where the form-section split finds it
(labels `1 · (1) 2 3 4` → `1 · (1 2) 2 3 4`; mechanism: `split` +
`join`, no new op).

### C00871 (`גַּלְגַּל`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `3` | `the eye-ball. Gen. R. s. 42; Lev. R. s. 11; Ruth R. …` | `the eye-ball. Gen. ₪. 48; Lev. ₪. = 11; Roth (3-.וכ'` | [245a · leaf 268](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$269/full/1400,/0/default.jpg) |
| `3`, in its text | `… changes of fortune take place constantly; Ex. R. s. 31, a. e.—3) (= גַּרְגַּר) globule, grain. …` | `changes of fortune take place constantly; Ex. 34. =. 51,` / `. .-9( (= 9979) globule, grain, Babb. 64"; 65*, +. -.גֶרְנֶר` | same |

Sense 3 is the last of `· 1 2 3`. The hOCR has the host's marker
mirrored at the end of its line (`(3-.`) and garbles the in-text one
to `. .-9(` before `(= 9979) globule, grain`: a marker is there, but
the hOCR cannot say it is `3)`.

**Question.** How should C00871's in-text `—3) (= גַּרְגַּר) globule`
be read?

- **C00871**
  - [x] split here and keep print's number (a second `3`), as printed: `· 1 2 3 3`
  - [ ] split here and number on: this sense becomes `4`; no later sense moves: `· 1 2 3 4`
  - [ ] leave whole: the `3)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (medium): the host's `3)` reads,
and the in-text marker is a garbled numeral the scan should confirm.

Applied in PR #166: P000521 splits `—3) (= גַּרְגַּר) globule` out of
sense 3 under print's number (labels `· 1 2 3` → `· 1 2 3 3`).

### C00872 (`גַּלְגַּל ²`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `4` | `stubble. Targ. Is. XVII, 13. …` | `satisfied. B. Bath. 73°.—4) stubble. Targ. Is. XVI, 13.—` | [245a · leaf 268](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$269/full/1400,/0/default.jpg) |
| `4`, in its text | `… Koh. R. to XII, 6; Lev. R. s. 18; a. e.—4) (v. next w.) a sort of girdle. …` | `. @-—Koh. R. to X11,6; Lev. RB. s. 18; a. 6.--4( (v. next` | same |

Sense 4 is the last of `1 2 3 4`. The hOCR reads `—4) stubble` and,
three lines on, `--4(` (Tesseract's mirrored `—4)`) before `(v. next`:
print sets `4)` twice.

**Question.** How should C00872's in-text `—4) (v. next w.)` be read?

- **C00872**
  - [x] split here and keep print's number (a second `4`), as printed: `1 2 3 4 4`
  - [ ] split here and number on: this sense becomes `5`; no later sense moves: `1 2 3 4 5`
  - [ ] leave whole: the `4)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (high): both markers read `4`.

Applied in PR #166: P000522 splits `—4) (v. next w.)` out of sense 4 under
print's number (labels `1 2 3 4` → `1 2 3 4 4`).

### G00456 (`זְכֵי`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `4` | `to become worthy of divine grace, to be privileged to enjoy, to live to see. Targ. Job XX, 17; …` | not found; the next line is `Targ. Job XX, 17; a. e—Ber. 17* PIS} “NSS נשרם where-` | [399a · leaf 422](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$423/full/1400,/0/default.jpg) |
| `4`, in its text | `… the Lord permitting I will go &c.; a. fr.—4) to take possession, acquire a title. …` | `Hall, 50°; Bets, 27%, a. 6. וכ' PON) TIN the Lord per \|` / `I will go &c.; a, fr.—4) to take possession, acquire —` | same |

Sense 4 is the last of the Kal list `1 2 3 4`. Tesseract interleaves
the two columns on this leaf and drops the line that opens sense 4;
the in-text `—4) to take possession` is clear. The hOCR shows print's
in-text `4)`, but not the host's.

**Question.** How should G00456's in-text `—4) to take possession` be
read?

- **G00456**
  - [x] split here and keep print's number (a second `4`), as printed: Kal `1 2 3 4 4`
  - [ ] split here and number on: this sense becomes `5`; no later sense moves: Kal `1 2 3 4 5`
  - [ ] leave whole: the `4)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (medium): the in-text `4)` is
print's, and nothing in the hOCR numbers the host otherwise.

Applied in PR #166: P000523 splits `—4) to take possession` out of Kal
sense 4 under print's number (labels `1 2 3 4` → `1 2 3 4 4`).

### H00940 (`חֲכַם`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `2` | `to recognize, to know, remember. Targ. Y. II …` | `well-learned ; a. fr.—2) to recognize, to know,` | [462b · leaf 485](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$486/full/1400,/0/default.jpg) |
| `2`, in its text | `… shall select (Y. Snh. VI, 23ᵃ bot. יטול), v. זוֹגָא.—2) (euphem. = b. h. יָדַע) to sleep with. …` | `» BREET? shall select (¥. Bab. V1, 29" bot. ,(יטול +. agit` / `( (ouphom.b. .ה 275) fo sleep with. Targ. 0-ל` | [463a · leaf 486](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$487/full/1400,/0/default.jpg) |
| `3` | `to be clear, evident. …` | `V, 58" bot.; Lam. It. to 1, 1 א (ו חד כותאי) רבד 6.-` / `) to be elear, evident, Sanh. 42", +. IL` | same |

The Kal list is `· 1 2 3`. The hOCR reads the host's `—2) to
recognize`, but garbles the in-text marker's line (`( (ouphom.b.`) and
sense 3's (`) to be elear`): it cannot show what print sets before
`(euphem.` or before `to be clear`.

**Question.** How should H00940's in-text `—2) (euphem. = b. h. יָדַע)`
be read?

- **H00940**
  - [x] split here and keep print's number (a second `2`), as printed: Kal `· 1 2 2 3`
  - [ ] split here and number on: this sense becomes `3` and `to be clear` becomes `4`: Kal `· 1 2 3 4`
  - [ ] leave whole: the `2)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (low): the stored `—2)` is the
only witness for the in-text marker, and numbering on would renumber a
`3)` the hOCR cannot read either.

Applied in PR #166: P000524 splits `—2) (euphem. = b. h. יָדַע)` out of
Kal sense 2 under print's number (labels `· 1 2 3` → `· 1 2 2 3`).

### H01899 (`חָתַם`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `2` | `to seal. Y. Ab. Zar. III, 42ᶜ bot. …` | `it might not go forth &.—2) fo seal, Y. Ab. Zar. III, 42°` | [513b · leaf 536](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$537/full/1400,/0/default.jpg) |
| `2`, in its text | `… Tosef. ib. V (VI), 2; a. fr.—2) to sign, subscribe (as witness, judge &c.) …` | `V (VI), 2; a. fr.—2) to sign, subscribe (as witnem, judge` | same |
| `3` | `to close a benediction (v. חֲתִימָה). …` | `are signed 66 ; a.fr.—s3) fo close a benediction \| +. 7).` | same |

§3's control. The Kal list is `1 2 3`. The hOCR reads `—2) fo seal`,
`—2) to sign` and `—s3) fo close a benediction`: print sets `2)` twice
and goes on to `3)`, so numbering on would make print's `3)` a `4)`.

**Question.** How should H01899's in-text `—2) to sign` be read?

- **H01899**
  - [x] split here and keep print's number (a second `2`), as printed: Kal `1 2 2 3`
  - [ ] split here and number on: this sense becomes `3` and the later senses shift: Kal `1 2 3 4`
  - [ ] leave whole: the `2)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (high): all three markers are
clear in the hOCR.

Applied in PR #166: P000525 splits `—2) to sign` out of Kal sense 2 under
print's number (labels `1 2 3` → `1 2 2 3`).

### I00712 (`טָרַד`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `3` | `to make homeless, banish (cmp. טִלְטֵל). Lam. R. to I, 21 …` | `to make home- (8--.(טרפכר other; (Y. ib. XVI, 154° top` / `ATI חוץ וכ' 21 less, banish (cmp. >u>v). Lam. R. to I,` | [550a · leaf 573](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$574/full/1400,/0/default.jpg) |
| `3`, in its text | `… and drove them into despair, a. fr.—3) to weary, make unsteady. …` | `and drove וט' אותם מן העולם Till. to Ps. XXXI, beg.` / `them into despair, a. fr.—3) to weary, make unsteady.` | same |
| `4` | `to stir up (dregs), trouble. …` | `him unsteady (feel the wine). —4) to stir up (dregs),` | same |

The Kal list is `· 1 2 3 4 (a b)`. The host's marker is `(8--.` before
`to make home-`, Tesseract's mirrored and misread `—3)` (round 2 read
D01114's the same way); the in-text `—3) to weary` is clear, and print
goes on `—4) to stir up`.

**Question.** How should I00712's in-text `—3) to weary` be read?

- **I00712**
  - [x] split here and keep print's number (a second `3`), as printed: Kal `· 1 2 3 3 4 (a b)`
  - [ ] split here and number on: this sense becomes `4` and the later senses shift: Kal `· 1 2 3 4 5 (a b)`
  - [ ] leave whole: the `3)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (medium): the in-text `3)` and
the `4)` after it are clear; the host's `3)` is a misread the scan
should confirm.

Applied in PR #166: P000526 splits `—3) to weary` out of Kal sense 3 under
print's number (labels `· 1 2 3 4 (a b)` → `· 1 2 3 3 4 (a b)`).

### K00086 (`כֵּבַשׁ II`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `6` | `path. Targ. II Sam. XX, 12, sq. …` | `boiling).—6) path, Targ. 11 Gam. XX, 12, 0g. “S od. Lag.` | [611b · leaf 634](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$635/full/1400,/0/default.jpg) |
| `6`, in its text | `… Targ. I Sam. IV, 13 כִּבֶּשׁ constr., v. כְּבִישׁ.—6) (archit.) recess, enceinte. …` | `(ed. Wil. .(ְכָבִי Targ. \| Gam. IV, 13 Sos comer, +, Ss —` / `6) (arehit.) recess, encrinfe, Targ. Ue. XLV,4; 5 XLVI,` | same |

Sense 6 is the last of `1 2 3 4 5 6`. The hOCR reads `—6) path` and,
after `Ss —` at a line end, `6) (arehit.) recess`: print sets `6)`
twice.

**Question.** How should K00086's in-text `—6) (archit.) recess` be
read?

- **K00086**
  - [x] split here and keep print's number (a second `6`), as printed: `1 2 3 4 5 6 6`
  - [ ] split here and number on: this sense becomes `7`; no later sense moves: `1 2 3 4 5 6 7`
  - [ ] leave whole: the `6)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (high): both markers read `6`.

Applied in PR #166: P000527 splits `—6) (archit.) recess` out of sense 6
under print's number (labels `1 2 3 4 5 6` → `1 2 3 4 5 6 6`).

### K01280 (`כָּרַת`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `3` | `to separate, divorce; to make final. …` | `court neither punishes nor decrees excision. —3) to sep-` / `arate, divorce; to make final. Gitt. 21%; Stee. 24 (ref.` | [674a · leaf 697](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$698/full/1400,/0/default.jpg) |
| `3`, in its text | `… (strike out לה); a. fr.—3) to decide, make final. Ber. …` | `Ib. 111, beg. 44° לה כ" , . . ראשונה Sh אלא שלא (strike out` / `md); a. fr.—s3) to decide, make final. Ber. 4%; Snh. 16? (ref,` | same |

Sense 3 is the last of the Kal list `1 2 3`. The hOCR reads `—3) to
sep-` / `arate, divorce` and `—s3) to decide, make final`: print sets
`3)` twice. (The Nif. list after it reads `1 3`: its `—2) to be
covenanted` sits inside Nif. 1, which this detector does not report,
since `2` is not that sense's own number.)

**Question.** How should K01280's in-text `—3) to decide` be read?

- **K01280**
  - [x] split here and keep print's number (a second `3`), as printed: Kal `1 2 3 3`
  - [ ] split here and number on: this sense becomes `4`; no later sense moves: Kal `1 2 3 4`
  - [ ] leave whole: the `3)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (high): both markers read `3`.

Applied in PR #166: P000528 splits `—3) to decide` out of Kal sense 3
under print's number (labels `1 2 3` → `1 2 3 3`).

### M00596 (`מוּקְצֶה`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `4` | `an animal set aside (in a shed) for a sacrifice. …` | `where figs are spread for drying.}. — 4) an animal set` / `aside (in a shed) for a sacrifice. Tern. 28b D^C sac's tJ` | [747b · leaf 70](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$71/full/1400,/0/default.jpg) |
| `4`, in its text | `… as shearing its wool or some work) has been done with it; a. e.—4) (Sabbath law) muktseh, …` | `bidden only until some act (as shearing its wool or some` / `work) has been done with it; a. e. — 4) (Sabbath law)` | [748a · leaf 71](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$72/full/1400,/0/default.jpg) |

Sense 4 is the last of `· 1 2 3 4`. ABBYY reads `— 4) an animal set`
and, at the top of the next page, `— 4) (Sabbath law)`: print sets
`4)` twice.

**Question.** How should M00596's in-text `—4) (Sabbath law)` be read?

- **M00596**
  - [x] split here and keep print's number (a second `4`), as printed: `· 1 2 3 4 4`
  - [ ] split here and number on: this sense becomes `5`; no later sense moves: `· 1 2 3 4 5`
  - [ ] leave whole: the `4)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (high): both markers read `4`.

Applied in PR #166: P000529 splits `—4) (Sabbath law)` out of sense 4
under print's number (labels `· 1 2 3 4` → `· 1 2 3 4 4`).

### M02130 (`מַעֲלָה`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `3` | `degree, gradation, superiority; preference; advantage. …` | `lead to degradation; a. e. — 3) degree, gradation, super-` / `iority; preference; advantage. Yoma 44a; Num. R. s. 7` | [817a · leaf 140](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$141/full/1400,/0/default.jpg) |
| `3`, in its text | `… Yoma 44ᵇ מ׳ דאוריתא the gradations in sanctity are of Biblical origin (v. Kel. I, 8, sq.).—3) height, on high. …` | `a. fr.— PI. as ab. Yoma 44b xn-nixn •« the gradations in` / `sanctity are of Biblical origin (v. Kel. 1, 8, sq.). — 3) height,` | same |
| `3`'s children | `… v. מַטָּה.—לְמַעֲלָה` ↳ `a` `on high, in heaven. …` | `Tanh. B'shall. 23 'a \m 12X (some ed. 'ar::), v. n-j .. —` / `jlbsob a) on high, in heaven. Hag. H, 1 (11) *ab na (Ms.` | same |

Sense 3 is the last of `· 1 2 3 (a b c d)`. ABBYY reads `— 3) degree,
gradation` and `— 3) height,`: print sets `3)` twice. The children
`a)`–`d)` hang off `—לְמַעֲלָה`, which follows the second `3)` (`on
high`), so a split carries them with the new sense.

**Question.** How should M02130's in-text `—3) height, on high` be read?

- **M02130**
  - [x] split here and keep print's number (a second `3`), as printed: `· 1 2 3 3 (a b c d)`
  - [ ] split here and number on: this sense becomes `4`; no later sense moves: `· 1 2 3 4 (a b c d)`
  - [ ] leave whole: the `3)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (high): both markers read `3`.

Applied in PR #166: P000530 splits `—3) height, on high` out of sense 3
under print's number (labels `· 1 2 3 (a b c d)` → `· 1 2 3 3 (a b c
d)`).

### N01139 (`נָצַץ`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| Hif. `2` | `to blossom, sprout. Shebi. IV, 10 …` | `Gen.R. s.50, a.e. (Pes.93b"pn 12), v.psn.— 2) to blossom,` / `sprout. Shebi.IV, 10 si3EnW3; Pes. 53a W9TOS (or ttttplBa)` | [929b · leaf 252](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$253/full/1400,/0/default.jpg) |
| Hif. `2`, in its text | `… Koh. R. to XII, 5, v. צוּץ; a. fr.—2) to cause to sprout. …` | `M. WSjTO) when they are in blossom. Koh. R. to XII, 5,` / `v. piS; a. fr.— 2) to cause to sprout. Gen. R. s.28 V*HW Ar.` | same |

Sense 2 is the last of the Hif. list `1 2`. ABBYY reads `— 2) to
blossom,` and `— 2) to cause to sprout`: print sets `2)` twice.

**Question.** How should N01139's in-text `—2) to cause to sprout` be
read?

- **N01139**
  - [x] split here and keep print's number (a second `2`), as printed: Hif. `1 2 2`
  - [ ] split here and number on: this sense becomes `3`; no later sense moves: Hif. `1 2 3`
  - [ ] leave whole: the `2)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (high): both markers read `2`.

Applied in PR #166: P000531 splits `—2) to cause to sprout` out of Hif.
sense 2 under print's number (labels `1 2` → `1 2 2`).

### P00059 (`עָבַר`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| Pi. `4` | `(v. עוּבָּר) to carry, be with young. …` | `Y. ib. YII, 5°. rx . . . rroso .]— 4) (v. -121?) to carry, be icith` | [1039a · leaf 362](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$363/full/1400,/0/default.jpg) |
| Pi. `4`, in its text | `… Yeb. III, 10; a. fr.—4) (v. עִיבּוּר) to extend the city limits, …` | `of my offspring). Yeb. Ill, 10; a. fr. — 4) (v. 113"1?) to ex-` | same |
| Pi. `4`, in its text | `… Tosef. Ber. VI (V), 1; a. e.—6) to complement, add to, …` | `nnair n-'X2 like a pregnant woman; Tosef. ib. VI (V), 1;` / `a.e. — S)to complement, add to, esp.to intercalate a month,` | same |

Sense 4 is the last of the Pi. list `1 2 3 4`. ABBYY reads `— 4) (v. …)
to carry` and `— 4) (v. …) to ex-`: print sets `4)` twice. The sense
also holds a later marker the detector does not report: the stored
`—6) to complement`, which ABBYY reads `— S)to complement`, an `S` it
often makes of a `5`. If print reads `5)` there, print counts `4 4 5`
and the stored `6` is a text error; if `6)`, print skipped `5` and its
doubled `4)` is the slip. Either way, the split at that later marker
is a further patch.

**Question.** How should P00059's in-text `—4) (v. עִיבּוּר) to extend`
be read?

- **P00059**
  - [ ] split here and keep print's number (a second `4`), as printed: Pi. `1 2 3 4 4`, then print's `5)` (say in the note what print sets at `S)to complement`)
  - [ ] split here and number on: this sense becomes `5`: Pi. `1 2 3 4 5`, then print's `6)`
  - [ ] leave whole: the `4)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 1,2,3,4,4,6

Recommendation: keep print's number (low): ABBYY's `S)` reads more
like `5)` than `6)`, which would make print's own count `4 4 5`; tick
number on instead if the scan shows `6)`.

Applied in PR #166: P000532 splits `—4) (v. עִיבּוּר) to extend` out of
Pi.
sense 4 under print's number; P000533 moves `—6` out of the `Tosef.
Ber.` link it was caught in, and P000534 splits `—6) to complement`
out as print's `6`, the note read as the Pi. label list (labels
`1 2 3 4` → `1 2 3 4 4 6`).

### Q01502 (`פָּקַע`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| Hif. `2` | `to strip, pluck, ravel out. …` | `v. Tosaf. Yom Tob a. 1.).— 2) to strip, pluck, ravel out.` | [1210b · leaf 533](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$534/full/1400,/0/default.jpg) |
| Hif. `2`, in its text | `… and purple; a. fr.—2) [to cause breaking loose,] to release, cancel an obligation. …` | `and purple; a. fr. — 2) [to cause breaking loose,] to release,` / `cancel an obligation. Yeb. 66b sq., a. fr. "pSipBa . . . ttHpn` | same |
| Hif. `3` | `ה׳ השער to break up, unsettle the market, …` | `a. fr. — 3) isisfi 71 to break up, unsettle the market, to` | same |

The Hif. list is `1 2 3`. ABBYY reads `— 2) to strip`, `— 2) [to cause
breaking loose,]` and `— 3) … to break up`: print sets `2)` twice and
goes on to `3)`.

**Question.** How should Q01502's in-text `—2) [to cause breaking
loose,]` be read?

- **Q01502**
  - [x] split here and keep print's number (a second `2`), as printed: Hif. `1 2 2 3`
  - [ ] split here and number on: this sense becomes `3` and the later senses shift: Hif. `1 2 3 4`
  - [ ] leave whole: the `2)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (high): all three markers are
clear.

Applied in PR #166: P000535 splits `—2) [to cause breaking loose,]` out of
Hif. sense 2 under print's number (labels `1 2 3` → `1 2 2 3`).

### S00151 (`קְדַם`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| Af. `3`, and in its text | `to get the start of; to prevent. Targ. Ps. XVII, 13; a. e.—3) to be earlier than, be quick in doing. …` | `Job XLI, 3 ; a. e. — 3) to get the start of; to prevent. Targ.` / `Ps. XVII, 13; a. e.— 3) to be earlier than, be quick in do-` | [1316b · leaf 639](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$640/full/1400,/0/default.jpg) |
| Af. `4` | `to give preference to. Y. Snh. I, 18ᶜ bot. …` | `order that people may be ready to do so to thy children.—` / `4) to give preference to. Y. Snh. 1, 18c bot. ... rfb 'la'npx` | same |

The Af. list is `1 2 3 4`. ABBYY reads `— 3) to get the start of` and,
on the next line, `— 3) to be earlier than`, then `4) to give
preference`: print sets `3)` twice and goes on to `4)`.

**Question.** How should S00151's in-text `—3) to be earlier than` be
read?

- **S00151**
  - [x] split here and keep print's number (a second `3`), as printed: Af. `1 2 3 3 4`
  - [ ] split here and number on: this sense becomes `4` and the later senses shift: Af. `1 2 3 4 5`
  - [ ] leave whole: the `3)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (high): all three markers are
clear.

Applied in PR #166: P000536 splits `—3) to be earlier than` out of Af.
sense 3 under print's number (labels `1 2 3 4` → `1 2 3 3 4`).

### U01512 (`שְׁמַע I`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| Af. `2` | `to give to understand; to teach, prove. …` | `ace). Ib. X30-3 'rol (Ms. Pa.)— 2) to give to understand ;` / `to teach, prore. Ber. 2a '3- -,b T2ZT2 xp . . . xrb^o (the` | [1599b · leaf 922](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$923/full/1400,/0/default.jpg) |
| Af. `2`, in its text | `… a. v. fr.—Part. pass. מַשְׁמֵע a) understood. …` | `of course)? Ber.21asq. '31 ^Jjprx 1K\ v.T^S; a. v.fr.—` / `Part. pass. Spro a) understood. Yeb.l02br:n 'rfl *2t\ '- it` | same |
| Af. `2`, in its text | `… ‘to strengthen’); a. fr.—2) inferred, proved; evidence. …` | `may be understood thus (it may mean, 'to strengthen');` / `a. fr. — 2) inferred, proved; evidence. Sabb. 84b 'o *wo how` | same |

Not a doubled numeral for the verb, though §3's answer counted it as
one. Af. 2 holds `—Part. pass. מַשְׁמֵע a) understood …`, and the
in-text `—2) inferred, proved; evidence` follows that `a)`: it is the
participle's second meaning, not Af.'s. ABBYY reads it `2)`; whether
print sets `2)` or `b)` after an `a)` only the scan shows.

**Question.** How should U01512's participle list be structured?

- **U01512**
  - [x] nest the participle: `Part. pass. מַשְׁמֵע` becomes an unlabelled sibling after Af. 2, with `a) understood` and the `2)` as its children: Af. `1 2 · (a 2)` (say in the note whether print sets `2)` or `b)`)
  - [ ] leave whole: the participle's list stays inline in Af. 2, as print runs it (Af. `1 2`, as today)
  - [ ] split here and keep print's number (a second Af. `2`): Af. `1 2 2`
  - [ ] split here and number on: this sense becomes Af. `3`: Af. `1 2 3`
  - [ ] can't tell from the scan
  - note: 2)

Recommendation: nest the participle (medium): the hOCR puts the `2)`
two lines after the participle's `a)`, so it belongs to that list, and
a split at the verb's level would misplace it in either numbering.

Applied in PR #167: P000542 takes the italic tags off the
participle's `a` (`<i>a</i>)` → `a)`, the text unchanged), and P000543
nests `a)` and `—2)` under `—Part. pass. מַשְׁמֵע`, keeping print's `2)`
as his note reads (labels Af. `1 2` → Af. `1 2 · (a 2)`; mechanism:
`replace` + the new `nest` op, ruling `10-12 nested sublists`).

### V00909 (`תְּקַף`)

| sense | stored, tag-free | hOCR, verbatim | scan |
|---|---|---|---|
| `4` | `(with רוגזא, or sub. רוגזא) to be vehement, hot, excited. …` | `Ned. 91a, v. infra. — 4) (with wan, or sub. WW\) to be` / `vehement, hot, excited. Targ. Gen. XXX, 2. Targ. Ex.` | [1694a · leaf 1017](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1018/full/1400,/0/default.jpg) |
| `4`, in its text | `… [oth. interpret.: she has a strong passion for another man].—4) to get hot, ferment, get sour. …` | `feeling against her husband; [oth. interpret.: she has a` / `strong passion for another man]. — 4) to get hot, ferment,` | same |

Sense 4 is the last of the Kal list `1 2 3 4`. ABBYY reads `— 4) (with
…) to be vehement` and `— 4) to get hot, ferment`: print sets `4)`
twice. Ithpe. 3, `to get sour, v. supra`, points back at the second.

**Question.** How should V00909's in-text `—4) to get hot, ferment` be
read?

- **V00909**
  - [x] split here and keep print's number (a second `4`), as printed: Kal `1 2 3 4 4`
  - [ ] split here and number on: this sense becomes `5`; no later sense moves: Kal `1 2 3 4 5`
  - [ ] leave whole: the `4)` is not a sense marker (say what it is in the note)
  - [ ] can't tell from the scan
  - note: 

Recommendation: keep print's number (high): both markers read `4`.

Applied in PR #166: P000537 splits `—4) to get hot, ferment` out of Kal
sense 4 under print's number (labels `1 2 3 4` → `1 2 3 4 4`).

---

## How this was produced

All scripts were throwaway Python under `$TMPDIR`, reading
`data/entries/**/*.json` (32,512 files), the source snapshot
`data/source/jastrow-dictionary.jsonl` where the catalogue counted it,
and the hOCR chunks. Text is tag-stripped (`<[^>]+>`) and NFC'd; a
sense's text is its `gloss` plus its `units`; every walk visits the
top-level senses, their children and every stem's senses.

| Class | Predicate run on the entries | Count |
|---|---|---|
| 1 | `senses[0]` unlabelled and `senses[1].label == "1"`; the lead, after a run of grammar abbreviations (`[a-zA-Z]{1,6}\.`), opens on `(` (loose) or is exactly one balanced parenthetical plus punctuation (strict) | 2,302 / 1,929 / 1,454 |
| 2 | the same lead, no `<cite>`, under 60 characters | 742 |
| 3 | a labelled sense whose text holds `—N)` (with optional `*`) where N is its own label | 26 |
| 4 | form-section siblings: an unlabelled non-first sense with children; residue: a labelled sense with a paren-clear `1)` followed by `—2)` | 13; 2 |
| 5 | a non-first unlabelled sense with no children, in a list with a labelled sibling, the previous sibling ending in neither `—N)` plus up to 15 characters nor a bare `—N` (B00753, class 8's sibling) | 5 |
| 6 | an unlabelled first sense holding a paren-clear `1)` whose following text shares its opening with the sibling labelled `1` | 14 |
| 7 | a labelled sense whose previous sibling has more `(` than `)` and ends on `[IVXLC]+,`, `note`, a binyan or `Kal`, or a number | 16 entries (17 sites) |
| 8 | a labelled sense ending `—N)` plus up to 15 characters, followed by an unlabelled sibling with text | 10 |
| 9 | an unlabelled sense ending in a form label (`—Pl.`, `—Fem.`, `—Du.`, `—Part.`, `—Denom.`, `—Sing.`) and a Hebrew form, next sibling labelled `1` | 8 |
| implied | the first sense of a list, unlabelled, no earlier label in its list, with `—2)` in its text and no `1)` or `l)` before it | 27 entries: 18 of the 22, plus 9 others (L52) |

Each predicate is my reconstruction from the catalogue's description,
not a ported detector (none exists for any of the nine). What each
might miss: class 3 sees only `—N)` with the dash, so a dashless
in-text repeat is unseen; class 5 trusts the 15-character residue
bound class 8 measured; class 6 needs a shared opening, so debris that
was edited by a transform would be missed; class 7 needs the tail
shapes listed, so a citation ending otherwise is missed, and it
cannot tell a minted sense from lost text without the page (A00675,
T00998); class 9's label list is the form-section markers plus `Du.`
and `Sing.`.

**Controls.** Each class has a named rid the predicate must find, or a
reason it no longer does: a patch fixed it (K00081, A01873, A03104,
C00244) or a split took it (C00062). The source-side runs reproduce
the catalogue where it counted the source: 1,552 against 1,553
(class 1), 37 and 9 (class 5), 10 (class 8). Class 2's 676 does not
reproduce (759).

**The hOCR.** Every line was searched by an English phrase from the
entry and kept only if its leaf is within one of the page index's
leaf for that rid. Tesseract (volume 1) mirrors parentheses in
Hebrew runs, and ABBYY (volume 2) reads `1` as `l` at times; neither is
read as evidence alone where the scan link is there to check.

**What would move a class.** A new snapshot (the counts move with
Sefaria's text). A reviewed patch on any listed rid. A change to
`body/form-sections.ts` (classes 4 and 9), `body/lettered.ts` (class 7's
P00790) or `stemHeadMarkerChop` (class 8). A ruling that splits print's
own repeated numerals (class 3).
