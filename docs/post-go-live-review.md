# Post-go-live review: deferred maintainer items

Items deferred past go-live by the maintainer's ruling of 2026-10-18,
under his blocker definition
([`review-ledger.md`](review-ledger.md) § Definitions): an item is
pre-publication only if its fix changes a `headwords[0]`, the field the
URL name is computed from (U6; redirects are unbuilt, L23), and these
were ruled not to be. They moved here from
[`maintainer-checklist.md`](maintainer-checklist.md) on 2026-10-18, cut
byte for byte, not copied, so they can be worked later the same way:
tick ONE box per bullet, a `note:` only where the box asks for one, and
a block's `Recommendation:` names the box it would tick. Each section is
the row list one GitHub issue links to (one issue per class; the drafts
are in § Issue drafts, not yet opened). A ticked item leaves this file
when a PR applies it, and its history goes to the worklists, as in the
checklist.

**Found while splitting, resolved by the ruling.** "None of these
changes a URL name" did not hold for every numeral question first
moved here. A name is `headwords[0]` plus that form's homograph numeral
(`admin/entry/names.ts`), and 18 of the 40 blocks had an option that
sets a numeral on a form that has none today. Where the recommended
answer puts it on `headwords[0]`, the name changes for certain:
`נוֹחַ I` (N00342, one form), `תּוֹר III` (V00275, "form 0") and
`שֵׁירוּתָא III` (U01070, U01071, "first form"). Where the target has
one form, the name changes if that option is ticked: `שׁוּעַ I`
(U00475), `חֵיפָא III` (H00841). In the other 13 (`סְגֵי I`,
`עֵרָבוֹן II`, `שַׁב I`, `שְׁבַט II`, `שְׁוַוח II`, `שַׁוְיָא II`,
`שׁוּתָא III`, `שִׁית IV`, `שָׁמִין II`, `שָׁמֵן II`, `שֵׁשׁ III`,
`תַּלְמָא II`, `תְּפֵי I`) the target has several forms, and the name
changes only if print sets the numeral after the first (563 of the
1,043 numbered entries with more than one form carry it there today).
Under the blocker definition those answers are pre-publication, so
the maintainer ruled on 2026-10-18 that the 18 go back to
[`maintainer-checklist.md` § Cross-reference numerals: may rename an entry (18)](maintainer-checklist.md#cross-reference-numerals-may-rename-an-entry-18).
None of the 22 numeral questions left here sets a numeral on a
`headwords[0]` (`נָוֶה III` sets its III on N00317's alternate
`נָוֶוה`, as print does), and the scan reads change no headword, so
nothing here renames an entry.

| section | items | source PR | ledger row |
|---|---|---|---|
| [Cross-reference numerals (2026-10-14)](#cross-reference-numerals-2026-10-14) | 22 questions, 34 cites | #173 | L64 |
| [Scan reads for L65–L66 (2026-10-16)](#scan-reads-for-l65l66-2026-10-16) | 3 blocks | #185 | L65, L66 |
| [Issue drafts (for the maintainer to open)](#issue-drafts-for-the-maintainer-to-open) | 2 drafts | | L64, L65, L66 |

One rid is asked twice: M02423's cite `v. מַוֶּה II`. Its numerals
block (`מַוֶּה II`) was written before PR #182, whose P000817 re-aimed
the cite at M00725 (review ledger L51); what is left of it is the cite's
letter, vav or zayin, which the § Scan reads block for L65 asks
directly. One scan read answers both.

## Cross-reference numerals (2026-10-14)

**Deferred 2026-10-18.** 22 of the section's 48 questions, 34 of
its 74 cites. The 8 answered on 2026-10-18 are in
[`maintainer-checklist.md` § Cross-reference numerals: answered 2026-10-18 (8)](maintainer-checklist.md#cross-reference-numerals-answered-2026-10-18-8),
and the 18 that may rename an entry in
[§ Cross-reference numerals: may rename an entry (18)](maintainer-checklist.md#cross-reference-numerals-may-rename-an-entry-18).
The text from **Status** to the table is the section's intro as written
on 2026-10-14, so its counts (48 questions, 74 cites) are the whole
list's; the table and the blocks are the 22.

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
| M00454, S00922 | `חַיְיתָא IV` | a carrier, not settled | H00750 is the IV? | yes: retarget | high |
| H01057, H01105 | `חֵלֶף I` | a carrier, not settled | H01100 is חֵלֶף I? | yes: retarget | high |
| H01224 | `חֲמַר II` | a carrier, not settled | which entry is חֲמַר II? | H01221, retarget only | medium |
| J00114 | `יְתֵב I` | a carrier, not settled | J00712 is יְתֵב I? | yes: retarget | high |
| M02423 | `מַוֶּה II` | a carrier, not settled | print reads מַזֶּה II? | retarget to M00725 | medium |
| O00278 | `מְשַׁח I` | a carrier, not settled | which entry is מְשַׁח I? | M02847, retarget only | medium |
| H01095, N00626, U00934 | `נָוֶה III` | target numbered otherwise | N00317 is נָוֶה III? | yes: line + retarget | high |
| P00136, P00477, P00506 | `עֲדֵי I` | a carrier, not settled | which entry is עֲדֵי I? | P00129, retarget only | medium |
| P00859, P00866, Q01968 | `עָמַד II` | target numbered otherwise | P00856 is עָמַד II? | yes: retarget | high |
| P00973 | `עֲנֵי I` | a carrier, not settled | which entry is עֲנֵי I? | P00971, retarget only | high |
| P01347 | `עָרֵב II` | a carrier, not settled | P01247 is עָרֵב II? | yes: retarget | high |
| Q02018 | `פַּרְפֵּר I` | a carrier, not settled | which entry is פַּרְפֵּר I? | Q01962, retarget only | medium |
| S01308 | `צִבְעָא I` | a carrier, not settled | R00058 or R00061? | R00058 | medium |
| R00162, R00759 | `צְדֵי I` | a carrier, not settled | which entry is צְדֵי I? | R00101, retarget only | medium |
| R00715 | `צְפר I` | a carrier, not settled | R00712 is צְפַר I? | yes: retarget | high |
| S01462 | `קיּץ I` | a carrier, not settled | S00528 is קוּץ I? | yes: retarget | high |
| S00305 | `קִיטְרָא I` | one bare member | a numeral after קִיטְרָא? | kept as printed | low |
| M02733, M02738 | `רָעָה I` | no carrier | T00889 or T00882? | T00889, retarget only | medium |
| P01145, U00043, U00490 | `שׁוּף I` | target numbered otherwise | U00488 is שׁוּף I? | yes: retarget | high |
| U01014 | `שָׁיפּוּי I` | a carrier, not settled | U01012 is שִׁיפּוּי I? | yes: retarget | high |
| U01243 | `שׁלַח II` | a carrier, not settled | U01268 is שֶׁלַח II? | yes: retarget | high |
| U00045 | `שְׁפֵי I` | a carrier, not settled | which entry is שְׁפֵי I? | U01735, retarget only | medium |

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

## Scan reads for L65–L66 (2026-10-16)

**Deferred 2026-10-18.** Moved here from
[`maintainer-checklist.md`](maintainer-checklist.md) with the rest of
this file; none of the three changes a headword. The text below is the
section's as written on 2026-10-16.

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


## Issue drafts (for the maintainer to open)

Two drafts, one per class, under the repo's issue rule: an issue is one
defect class or one decision, never a rid list, and links the section
that holds its rows. Nothing has been opened; paste each title and body
into a new issue when you choose, then say so and the issue numbers go
into the sections above and the ledger rows.

### Draft A: cross-reference numerals

```markdown
Title: Cross-reference numerals: 22 questions whose numeral the linked entry lacks

A cite's text names a homograph numeral (`v. סְגֵי I`) that the entry Sefaria links it to does not carry.
The correction audit (`docs/correction-audit.md` §5) found 296. Where the family holds exactly one entry
with that numeral and the cite's spelling, the link is Sefaria's error and was retargeted (222, PRs #178, #179).
The other 74 (48 questions) need a scan read of the family. 26 stay before go-live (8 answered, 18 that can
rename an entry); this issue is the remaining 22 questions, 34 cites, one block per family and numeral named.

Rows: [post-go-live-review.md § Cross-reference numerals](https://github.com/UniquePixels/jastrow/blob/v2/docs/post-go-live-review.md#cross-reference-numerals-2026-10-14)

Deferred past go-live by the maintainer's ruling of 2026-10-18 under the blocker definition (review ledger L64).
A worked row becomes a case 1 retarget (a reviewed `replace`, no annotation), or a reading kept or corrected
under ruling `10-13 correction policy` (a `kept` annotation, or a case 2 numeral, annotated).
None of the 22 sets a numeral on a `headwords[0]`, so none renames an entry; the 18 that could stay before go-live.
```

### Draft B: body-text scan reads

```markdown
Title: Body-text scan reads: a cite spelling and two dropped Hebrew words

Three words in body text the hOCR saw but cannot read well enough to write; a word is never guessed.
- M02423: its cite `v. מַוֶּה II` now links M00725 `מַזֶּה II` (P000817), but the text reads vav where print
  may set zayin (hOCR `v. n<a II.`). Review ledger L65.
- M00712 and Q01198: the `)` Sefaria dropped is restored (P000818, P000819), but the Hebrew word before it
  is still missing (hOCR best readings `מזג`, `פנה`). Review ledger L66.

Rows: [post-go-live-review.md § Scan reads for L65–L66](https://github.com/UniquePixels/jastrow/blob/v2/docs/post-go-live-review.md#scan-reads-for-l65l66-2026-10-16)

Deferred past go-live by the maintainer's ruling of 2026-10-18: none changes a headword, so none renames an entry.
Each needs a scan read. A word read becomes a case 1 `replace` (ruling `10-13 correction policy`, no annotation);
a "kept", "no word" or "can't tell" is recorded on the ledger row.
```
