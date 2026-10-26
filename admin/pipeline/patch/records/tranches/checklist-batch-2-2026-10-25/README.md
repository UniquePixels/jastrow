# Checklist batch 2: the Sefaria scan reads (2026-10-25)

PR #193, review ledger L71 and L75–L79, under ruling `10-13 correction
policy` ([`docs/decisions.md`](../../../../../../docs/decisions.md)),
case 1 throughout: a transcription error where print is right is
corrected with no annotation, and the patch rationale is the only
trace. It applies the maintainer's ticks in
[`docs/archive/maintainer-checklist.md`](../../../../../../docs/archive/maintainer-checklist.md)
§ Scan reads for the Sefaria appendix (2026-10-22), recorded on
`docs/checklist-batch-2` (`5c6c13369`): 30 blocks, 66 patches, the ones
PR #192's tranche README
[`l71-evidence-2026-10-22`](../l71-evidence-2026-10-22/README.md) left
held. The applied blocks are now in
[`docs/archive/headword-worklist.md`](../../../../../../docs/archive/headword-worklist.md)
§ Applied from the maintainer checklist (2026-10-25).

Every patch the maintainer confirmed carries, appended to its
rationale, one paragraph in the phrase the appendix's evidence filter
reads (`admin/pipeline/report/sefaria-evidence.ts`, `READ_DATE`):

```text
Amendment 2026-10-25 (review ledger L71): maintainer print read of the
scan, 2026-10-25 (docs/maintainer-checklist.md § Scan reads for the
Sefaria appendix, block <block>; applied in docs/headword-worklist.md
§ Applied from the maintainer checklist (2026-10-25)): print reads
<what>. Scan <page> · leaf <n> (<IIIF link>).
```

The filter reads it as `maintainer print read 2026-10-25` (plus `hOCR`
where the paragraph quotes a line) and `scan leaf <n>`; the link is the
citing entry's own leaf, so the scan check passes.

## What changed

All in [`../../reviewed/`](../../reviewed/).

| | patches | ids |
|---|---|---|
| amended in place: the rationale only | 47 | the 38 retargets (B), P000195, P000197, P000203, P000206, P000217, P000223, P000264, P000290, P000306 (C) |
| amended in place: payload and rationale | 5 | P000194, P000268, P000308 (A); P000309, P000310 (F) |
| withdrawn, bytes moved to [`docs/archive/patches-retired-2026-10-25/`](../../../../../../docs/archive/patches-retired-2026-10-25/README.md) | 8 | P000221, P000760 (A); P000291–P000293 (D); P000294–P000296 (the gloss comma, C) |
| new | 1 | P000931 (U01063, A) |
| held, unchanged | 6 | P000232 (M01355, C); P000297–P000301 (E) |

An amended patch keeps its id, target, `expected_before`, snapshot and
`prompt_version`. P000931's `prompt_version` is
`checklist-batch-2-2026-10-25`; its snapshot is `sha256:75bbc5ee…`.
Manifest: H00871 now names P000220 alone, U01063 names P000931, D00844
names P000620 alone, and the records of B00443, C00329, M00447, A02356
and B00407, which named only a withdrawn patch, are removed. One
reviewed-kept record left
`admin/pipeline/report/records/reviewed-kept.jsonl`: A02824's X8 row
(`the I on A02823's form אַפְרִיקָא`), which A02823's reform makes
stale (below).

## A. Read against the patch (L75–L79)

- **A00675 `אוּלָם` II, P000194 (L75): rewritten in place.** The records'
  practice for a wrong reviewed patch whose target still stands is to
  amend it in place (P000881 in PR #191); a patch is withdrawn when no
  op of it should apply. The payload was `61` → `6 1`, reading print's
  page `261)` as page `26` and a fused `1)`; it is now `261)` →
  `261) 1)`, the page kept and the lost marker inserted after it, as
  the maintainer reads print and the hOCR reads it (26a · leaf 49:
  `Onom.; Neub. Géogr. p. 18; 261) 1) Ulam (Porta) a place`). The
  marker stays in the text of the first sense: tranche-01's agent
  `split` P000027 (marker `1)`, pinned to the old `26 1)` text) no
  longer finds its target and is absorbed, and no `split` can take its
  place, since the op needs its marker once in the sense and
  `261) 1)` holds `1)` twice (review ledger L81). The appendix row is
  Sefaria's text with the `1)` inserted.
- **Q02162 `פְּתִיחָה`, P000268 (L76): widened in place.** The find
  `<a … data-ref="Ezekiel 37:1">Ez. XXXVII, 1</a>; a. fr.— ` becomes
  `<a … data-ref="Ezekiel 37:12">Ez. XXXVII, 12</a>); a. fr.—2) `: the
  verse `12`, the `)` after it, the cite re-aimed at Ezekiel 37:12
  (`href` and `data-ref` together, as P000827 did for S01040), and the
  `—2)`. Print reads `(Ez. XXXVII, 12); a. fr. — 2)` (1253b · leaf 576).
- **U01063 `שֵׁירוּ`, P000760 (L77): withdrawn, and P000931 new.**
  `v. שֵׁירוּתָא II, III` names U01070 (print's `II`) and U01071
  (`III`): Sefaria's own link of the `II` to U01070 was right, so
  P000760, which re-aimed it at U01071, is withdrawn and the link
  returns to U01070. The `III` was plain text; P000931 links it to
  U01071 by its link key `שֵׁירוּתָא ³`, as the maintainer's tick asks.
- **A02823 `אַפְרִיקִי`, P000308 (L78): rewritten in place.** Print sets
  `(אַפְרִיקָא) אַפְרִיקִי I`: the parenthesized form first, the I on
  `אַפְרִיקִי`. The hOCR puts `(אפריקא)` at the line's start (x 1589–1846
  on leaf 131, before the bold head word at 1876–2100); the line is set
  left to right like the rest of the book. The forms are now
  `(אַפְרִיקָא)`, `אַפְרִיקִי I`, in print's order, with the same template
  `({0}) {1} I`. Names and display: `headwords[0]` is the first form
  print sets (headword design §2), so the entry's name changes from
  `אַפְרִיקִי` to `אַפְרִיקָא` (no collision: gate `names` 65024/65024);
  the I now sits on `אַפְרִיקִי`, the I of the sequence whose II is A02824
  `אַפְרִיקִי II`, so A02824's X8 row no longer fires and its
  reviewed-kept record is removed. The brief read "the primary is
  `אַפְרִיקִי I`"; that would need `{0} I ({1})`, which sets the forms
  in an order print does not, and gate 2 refuses a supplied template
  whose slots run out of form order. HW-roman binds the parser, not a
  reviewed patch from the print (HW-A02823 set the parentheses so).
- **H00871 `חִירָה`, P000221 (L79): withdrawn.** The two `Ib.` follow
  `Mekh. B’shall. s. 1`, so they cite the Mekhilta, not Exodus 14.
  Sefaria leaves the `Mekh.` cite itself unlinked, so there is no
  Mekhilta ref to re-aim them at; withdrawing the patch returns both to
  Sefaria's bare `Ib.`. The two units that began at the Exodus links
  fold back into the gloss: the text is unchanged.

## B. Confirmed retargets (38)

All 38 "yes: print reads X N"; each patch's target stands. `חוּל I`: the
maintainer's note "ch." on H00731 is the cite's own `ch.` (`v. חוּל I
ch.`), so ruling 10-15 names the Aramaic line H00320, as P000591 links.
H00355's cite is `(b. h.; חוּל I)`, the Hebrew H00319, as P000807
links. His note "ch" on H00733 does not match its cite, which reads
`(b. h.; חוּל I)` in Sefaria and in the hOCR (454b · leaf 477, line 43:
`>on, .ג חיל‎ (b. h.; חול‎ I) 1) [surrownding, ] ;`), and `b. h.` names
the Hebrew, so P000808's H00319 stands; the rationale says so.
`סְגֵי II` (O00125): he ticked "no" with the note `סְגֵי II, III`, which
is the stored text, so the `II` is confirmed. A03020's note asks
whether the headword's yod-for-vav is recorded: it is, P000829 (PR
#187), an `illegible` annotation on `אֻרְוָה`.

| patch | rid | print reads | target | appendix | scan |
|---|---|---|---|---|---|
| P000544 | A00882 | `אוֹרְיָין I` | A00889 | appendix row | [34a · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| P000545 | M01329 | `אוֹרְיָין I` | A00889 | appendix row | [780b · leaf 103](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$104/full/1400,/0/default.jpg) |
| P000546 | H01410 | `אֲמָנָה I` | A02041 | appendix row | [489b · leaf 512](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$513/full/1400,/0/default.jpg) |
| P000547 | D00595 | `דִּי I` | D00442 | appendix row | [299b · leaf 322](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$323/full/1400,/0/default.jpg) |
| P000551 | S01262 | `קוּלְיָא I` | S00336 | appendix row | [1372b · leaf 695](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$696/full/1400,/0/default.jpg) |
| P000552 | S01321 | `קוּלְיָא I` | S00336 | appendix row | [1376a · leaf 699](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$700/full/1400,/0/default.jpg) |
| P000590 | O00179 | `טְבַע I` | I00077 | appendix row | [956b · leaf 279](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$280/full/1400,/0/default.jpg) |
| P000591 | H00731 | `חוּל I ch.` | H00320 | appendix row | [454b · leaf 477](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$478/full/1400,/0/default.jpg) |
| P000807 | H00355 | `(b. h.; חוּל I)` | H00319 | appendix row | [434b · leaf 457](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$458/full/1400,/0/default.jpg) |
| P000808 | H00733 | `(b. h.; חוּל I)` | H00319 | appendix row | [454b · leaf 477](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$478/full/1400,/0/default.jpg) |
| P000595 | A00863 | `אוּרְיָא II` | A00878 | appendix row | [33b · leaf 56](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$57/full/1400,/0/default.jpg) |
| P000596 | A00887 | `אוּרְיָא II` | A00878 | appendix row | [34a · leaf 57](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$58/full/1400,/0/default.jpg) |
| P000599 | A03020 | `אוּרְיָא II` | A00878 | appendix row | [116a · leaf 139](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$140/full/1400,/0/default.jpg) |
| P000791 | A00864 | `אוּרְיָא II ch.` | A00879 | appendix row | [33b · leaf 56](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$57/full/1400,/0/default.jpg) |
| P000604 | B00367 | `בּוֹר I` | B00332 | appendix row | [150b · leaf 173](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$174/full/1400,/0/default.jpg) |
| P000609 | B01142 | `בּוֹר I` | B00332 | appendix row | [187a · leaf 210](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$211/full/1400,/0/default.jpg) |
| P000797 | B00335 | `בּוֹר I` | B00332 | appendix row | [149a · leaf 172](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$173/full/1400,/0/default.jpg) |
| P000605 | B00450 | `בִּזְיוּנָא II` | B00443 | appendix row | [153b · leaf 176](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$177/full/1400,/0/default.jpg) |
| P000606 | B00453 | `בִּזְיוּנָא II` | B00443 | appendix row | [153b · leaf 176](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$177/full/1400,/0/default.jpg) |
| P000613 | C00343 | `גַּוָּוזָא II` | C00329 | appendix row | [220a · leaf 243](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$244/full/1400,/0/default.jpg) |
| P000614 | C00351 | `גַּוָּוזָא II` | C00329 | appendix row | [220b · leaf 243](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$244/full/1400,/0/default.jpg) |
| P000615 | C01130 | `גַּוָּוזָא II` | C00329 | appendix row | [259a · leaf 282](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$283/full/1400,/0/default.jpg) |
| P000647 | N00034 | `נִיר I` | N00782 | appendix row | [867a · leaf 190](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$191/full/1400,/0/default.jpg) |
| P000660 | O00125 | `סְגֵי II, III` | O00121 | appendix row | [954b · leaf 277](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$278/full/1400,/0/default.jpg) |
| P000743 | T00814 | `סְגֵי II` | O00121 | appendix row | [1483a · leaf 806](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$807/full/1400,/0/default.jpg) |
| P000695 | Q00440 | `צִנָּה III` | R00609 | appendix row | [1151a · leaf 474](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$475/full/1400,/0/default.jpg) |
| P000708 | R00399 | `צִנָּה III` | R00609 | appendix row | [1278a · leaf 601](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$602/full/1400,/0/default.jpg) |
| P000697 | Q00538 | `רְעִי I` | T00892 | appendix row | [1156b · leaf 479](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$480/full/1400,/0/default.jpg) |
| P000744 | T00895 | `רְעִי I` | T00892 | appendix row | [1487a · leaf 810](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$811/full/1400,/0/default.jpg) |
| P000701 | Q01373 | `שִׁיטָּה III` | U00884 | appendix row | [1201b · leaf 524](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$525/full/1400,/0/default.jpg) |
| P000756 | U00888 | `שִׁיטָּה III` | U00884 | appendix row | [1560b · leaf 883](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$884/full/1400,/0/default.jpg) |
| P000757 | U00888 | `שִׁיטָּה III` | U00884 | appendix row | [1560b · leaf 883](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$884/full/1400,/0/default.jpg) |
| P000792 | B01157 | `בַּר I ch.` | B01153 | appendix row | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| P000793 | B01160 | `בַּר I ch.` | B01153 | appendix row | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| P000794 | B01215 | `בַּר I ch.` | B01153 | held: not traceable to source | [191b · leaf 214](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$215/full/1400,/0/default.jpg) |
| P000795 | B01237 | `בַּר I ch.` | B01153 | appendix row | [192b · leaf 215](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$216/full/1400,/0/default.jpg) |
| P000796 | U02087 | `בַּר I ch.` | B01153 | appendix row | [1637a · leaf 960](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$961/full/1400,/0/default.jpg) |
| P000804 | S00534 | `קוּץ I` | S00528 | appendix row | [1339b · leaf 662](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$663/full/1400,/0/default.jpg) |

P000794 (B01215) is held by the generator, not by evidence: its anchor
and context are not once in Sefaria's raw string.

## C. Other confirmed patches (13)

| patch | rid | read | disposition | appendix |
|---|---|---|---|---|
| P000290 | B00098 | `בַּד V` | stands | row |
| P000306 | B00097 | `IV` (B00097 is `בַּד IV`; its `next w.` names B00098) | stands | row |
| P000294 | A02356 | `X I, II, v. …`, "the comma is part of the headword line (larger and bold)" | **withdrawn** (below) | — |
| P000295 | B00407 | yes | **withdrawn** | — |
| P000296 | D00844 | yes | **withdrawn** | — |
| P000217 | D00541 | no `Yoma 2a` | stands | row |
| P000232 | M01355 | both boxes ticked; "There is a Y. R. Shan. II 58a" | **held** (below) | no print evidence |
| P000264 | Q00890 | no `Yoma 2a:3` | stands | row |
| P000195 | A00913 | `f. (v. XXX 2) evening,` | stands | row |
| P000203 | A03277 | `Ar., XXXXX ed. f. (b.h. XXX Ps. LVIII, 9; XXX or XXX, v. XXX 2) [groping` | stands | row |
| P000206 | B00656 | `XXXXXX Ar. s. v. XXX 2) f.` | stands | row |
| P000223 | I00149 | `f. (b. h. in pl.; XXXXX, v. XXXXX 2) [some-` | stands | held: not traceable to source |
| P000197 | A01194 | `f. (b. h. XXXX-XX XX, XXX XXXX, XX XX) who?` | stands, partial | held: partial (L80) |

- **The gloss comma, withdrawn.** The patches took `X  I, II,` to
  `X I, II`: the doubled space and the trailing comma. The maintainer
  says the comma is print's, set in the bold of the headword line, and
  the patches dropped it: the gloss begins ` v.`, so the entries read
  `אִסְטְוָוא I, II v. …`. The parser now reads the doubled space
  (`{0} I, II,`), so withdrawing the three returns print's comma to
  `display` and needs no patch. The brief listed these as confirmed;
  the note reverses what they do, as section D's ticks reverse the
  stray-comma patches.
- **M01355, held.** The removal's claim is that the entry cites no
  `Rosh Hashanah 23b`. It does: `Y. R. Hash. II, 58ᵃ top הרי מ׳ וגדור;
  (Bab. ib. 23ᵇ; Tosef. ib. II (I), 2 …)`. `Bab. ib. 23ᵇ` is the Bavli
  Rosh Hashanah 23b, the parallel to the Yerushalmi the maintainer
  found; Sefaria's text leaves it unlinked, and its `refs` item may be
  that cite. The maintainer ticked both "no" and "yes", so P000232
  takes no evidence and stays out of the appendix (review ledger L82).
  The Yerushalmi `Y. R. Hash. II, 58ᵃ` is plain text, not a link, so
  there is no target to re-aim; no patch is written for it.
- **A01194, partial.** The `)` closes before `who?`, as the patch has
  it. Print also sets three Hebrew phrases inside the parenthesis after
  `b. h.` (`XXXX-XX XX, XXX XXXX, XX XX`), which Sefaria lost and the
  transcription cannot spell; they are named as not restored, so the
  generator holds the row as partial (review ledger L80).

## D. A stray comma before the numeral: reversed (3)

Print has the comma (B00443 `בִּזְיוּנָא, II`, C00329 `גַּוָּוזָא, II`,
M00447 `מוֹזְלָא, I`), so P000291–P000293, which removed it, are
withdrawn. The source line parses (`{0} , II`, `{0} , I`): each entry
keeps its form, its homograph and its name (`בִּזְיוּנָא II`, …), and its
`display` regains the comma. Sefaria's space before it is kept, as the
source has it; the hOCR sets the comma on the word (`NON FS, I mn.`,
`MINS, LT m.`), so a display without the space is the maintainer's
call (review ledger L84). The retargets that name these lines
(P000605, P000606, P000613–P000615) key on the source line, so they
are unaffected. Ruling HW-h1-sep's stray-comma half is reversed in
`docs/decisions.md`.

## E. Two spellings in one form: held (5)

**Since PR #194** (ruling `10-25 display or`, tranche
[`display-or-2026-10-25`](../display-or-2026-10-25/README.md)): four
of the five are applied, and A01161 (P000300) stays held. The rest of
this section records the state PR #193 left, when all five were held.

The maintainer's gut, which the brief endorsed: store every spelling as
a form (each a lookup key) and set `display` to print's layout, with
`or` as literal text where print has it. The entry contract accepts
that template (`admin/entry/headword-rules.ts`: rule 2 refuses only
Hebrew, rule 3 reads only uppercase Roman numerals and `m.`/`f.`), but
the import's gate 2 refuses it (`admin/pipeline/import/gates.ts`,
`checkHeadwordLine`): on a settleable line a patch-supplied template
must conserve the line's notation multiset, and `or` is a Latin run the
source line does not carry. A probe of the gate with I00158's line:

| display | contract | gate 2 |
|---|---|---|
| `{0} or {1}, {2}` | passes | `does not conserve the line's notation: [] → [or×1]` |
| `{0}, {1}, {2}` (control) | passes | passes |
| `{0} {1}, v. {2}` | passes | `[] → [v×1 .×1]` |

So the block stops, and the five stay held. The smallest change that
would allow it: in `notationOf` (gates.ts), skip the Latin run `or` on
the written side as the comma is skipped on both, a separator print
sets between spellings and the template supplies; plus a
`docs/decisions.md` row first, and DESIGN.md §2 and prohibition 29
amended. Test sketch, in `gates.test.ts`'s `checkHeadwordLine` suite:

```ts
it('accepts a supplied " or " between two spellings', () => {
  const t = patched3(['טְוִיָּיה', 'טְוִיָּה', 'טְוִויָּה'], '{0} or {1}, {2}');
  expect(t.failures).toEqual([]);
});
it('still refuses any other Latin word', () => {
  expect(patched3([...], '{0} and {1}, {2}').failures[0]).toContain('and×1');
});
it('still counts a numeral set beside "or"', () => {
  expect(patched3([...], '{0} or {1} I, {2}').failures[0]).toContain('I×1');
});
```

`, v.` needs nothing: in I00654 it is the gloss's head (`, v. טְפֵלָ׳`),
already stored there.

The `X` mapping (his `X` runs to the stored forms, by word count, then
order, then length, then punctuation):

| rid | his line | stored forms | mapping | print's display | today |
|---|---|---|---|---|---|
| I00158 | `XXX or XXX, XXXX m. ...` | `טְוִיָּיה`, `טְוִיָּה`, `טְוִויָּה` | three runs, three forms, in order; his run lengths (3, 3, 4) do not track the letters (5, 4, 5), so order decides | `{0} or {1}, {2}` (needs the rule change) | `{0}, {1}, {2}` |
| I00654 | `XXXXX XXXXX, v. ....` | `טְפֵילָה`, `טְפֵילָא` | two runs of five, two forms of five letters, in order; no comma between them, and `, v.` is the gloss | `{0} {1}` (no rule change) | `{0}, {1}` |
| M02116 | `XXXX, XXXXX m. ....` | `מַעְיָינָא`, `מַעְיָנָא` | two runs, two forms, in order | `{0}, {1}` | `{0}, {1}` (already print's) |
| M02868 | `XXXX, XXXXXX, XXXXXX m. ....` | `מְשֵׁיזֵב`, `מְשֵׁיזְבָא`, `מְשֵׁיזִיב` | three runs, three forms, in order; the two six-letter forms by order | `{0}, {1}, {2}` | `{0}, {1}, {2}` (already print's) |
| A01161 | `XXXXX m., XXXX XXXXX (XXXXX) XXXXX f. ....` | `אֵידֵין`, `אֵידְנָא`, `אַיְידָא`, `אֵידָא`, `(אַיְידִי)` | five runs, five forms, but print's order is not Sefaria's: `X` (5) is `אֵידֵין`, the 4-run is `אֵידָא` (the only four-letter form, fourth in Sefaria), `(W)` is `אַיְידִי`, and the two 5-runs either side of it are `אֵידְנָא` and `אַיְידָא` in an order nothing shows | **ambiguous: held** | `{0}, {1}, {2}, {3}, ({4})` |

A01161 is held even with the rule change: two forms' places are a
guess, and print's `m.` after the first form and `f.` after the last
are per-form genders the corpus's displays do not carry yet. M02116 and
M02868 already show print's layout and I00654 needs only `{0} {1}`, so
three of the five could be confirmed without the rule; the brief held
the block whole, so they wait with it (review ledger L83). His `m.` on
I00158 disagrees with the stored `f.` (`f. (טָוָה) spinning`); the
held row records it.

## F. `X = Y` heads (2)

Print sets both words in the bold of a headword line, but the earlier
reading stands: one headword X, and `= Y` is a reference, not a gloss.
The reforms keep X as the only form and lift `= Y` into the gloss head
as a cross-reference linked to Y's entry: A01175 `אִידְרְעָא = אֶדְרְעָא`
links A00477 `אֶדְרַע, אֶדְרְעָא` (its alternate), by the link key
`אֶדְרַע`; A01345 `אִימְנוֹן = הִמְנוֹן` links E00628 `הִמְנוֹן`. Both
rationales now say "a reference, not a gloss". The generator holds
both as `not mechanical for op` (a reform that lifts text into a new
sense), as before.

## The 67 August patches

The maintainer asked how the patches with
`prompt_version: human-review-2026-08-05` came to exist. They were
seeded on 2026-09-18 from `repairs.ts`'s tables, which transcribed his
2026-08-05 decisions in review docs 01–06 (`docs/archive/body-review/`),
and those decisions were made on Sefaria's text: no rationale named a
print read. After PR #192 and this PR:

| | patches |
|---|---|
| confirmed by the hOCR line (PR #192) | 51 |
| confirmed by his scan read (this PR): P000195, P000197, P000203, P000206, P000217, P000223, P000264 | 7 |
| wrong, rewritten from his read: P000194 (A00675), P000268 (Q02162) | 2 |
| wrong, withdrawn: P000221 (H00871) | 1 |
| held: P000232 (M01355), whose entry cites the place it removes | 1 |
| out of the appendix's scope, his own 2026-08-05 rulings: P000209, P000212, P000285 (the implied `1)`, annotated `print-error`), P000215, P000216 (D00341's bracket, a recorded deviation) | 5 |

So 58 confirmed by print or his read, 3 wrong and corrected (2
rewritten, 1 withdrawn), 1 held as likely wrong, 5 our own
conventions; none is unverified and still sent.

The brief expected "4 + 3 + H00871" withdrawn or rewritten among them.
Of the five patches read against print (L75–L79), three are August
patches (P000194, P000268, P000221); P000760 (`cite-retargets`), P000308
(`headword-edges`) and the stray- and gloss-comma patches
(`headword-walkthrough`) are later. Across this PR: 5 rewritten, 8
withdrawn.

## Witness

`rm -rf data/entries/[A-Z] && bun data:import && bun qa:format`
changed exactly 13 entry files, each in the intended field (checked by
script against `v2`): A00675 (`senses[0].gloss` takes `261) 1)`; the
labelled `1` sense folds into it), A01175 and A01345 (`senses[0].gloss`,
the link), A02356, B00407 and D00844 (`display` `{0} I, II,`), A02823
(`headwords[0]`, `headwords[1]` swap; display unchanged), B00443 and
C00329 (`display` `{0} , II`), M00447 (`{0} , I`), H00871 (the two
`Ib.` unlinked; its two units fold into the gloss), Q02162 (one unit:
the verse and its link) and U01063 (`senses[0].gloss`: the `II` back
on U01070, the `III` linked to U01071). Every gate is green;
`bun data:validate` 0 problems.

Every hOCR line quoted here and in the rationales was checked by
script as a verbatim line of its leaf (6 of 6).

`bun data:sefaria`: **appendix 431 → 478 rows (+47)**: 37 retargets,
P000931, P000194, P000268, P000195, P000203, P000206, P000217, P000264,
P000290 and P000306. **`no print evidence` 66 → 6**: P000232 and the
five of E.
