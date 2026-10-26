# Headword round 2 under ruling 10-13 (2026-10-15)

Data PR (iv) of [`docs/archive/correction-audit.md`](../../../../../../docs/archive/correction-audit.md)
§7, PR #177. It applies the maintainer's ticks on the 16 blocks of
[`docs/archive/headword-worklist.md`](../../../../../../docs/archive/headword-worklist.md)
§ Round 2 (ticked 2026-10-13, committed in PR #174), review ledger
L46.

## The ruling

Ruling `10-13 correction policy` ([`docs/decisions.md`](../../../../../../docs/decisions.md)
§9, [`admin/entry/ANNOTATIONS.md`](../../../../../entry/ANNOTATIONS.md))
sorts every edit into four cases. A transcription error where print is
right (case 1) is corrected with no annotation. A print error whose
intended value is determined (case 2) is corrected and annotated. For
an I print does not set, that means Jastrow's own text names `X I`;
a bare candidate's place before the II proves nothing (10-06 implied I,
as amended). A print oddity with more than one plausible intent (case
3) is kept. An illegible print (case 4) stores the best reading,
annotated `illegible`. A tick of "nothing to fix" goes to the
reviewed-kept list (`10-06 reviewed kept`).

## Where the patches are

13 patches, P000582–P000594, appended to
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl), with
one `repaired` record per rid in
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl). None
of the 11 rids had a patch before. `prompt_version` is
`headword-round-2-2026-10-15`; every `snapshot` is `sha256:75bbc5ee…`.
This directory holds only this README. 12 records join
[`admin/pipeline/report/records/reviewed-kept.jsonl`](../../../../report/records/reviewed-kept.jsonl)
(source `maintainer round 2 read 2026-10-13; PR #177`).

- **Case 2, two `reform.homographs`** (P000583 I00077, P000584 H00319):
  `{form: 0, homograph: 1}`, display `{0} I`, and

  ```json
  "annotation": {"kind": "print-error", "printed": "", "evidence": "Jastrow's text names `טְבַע I`: I00121 `טוֹבְעָנָא m. (טְבַע I) flood`; O00179 `Sabb. 108ᵇ, v. טְבַע I` (the Lake of Sodom). Print sets no numeral beside it (…; scan 518b · leaf 541)", "date": "2026-10-15"}
  ```

  The import writes it on the form as `{field: 'homograph', stored:
  'I', source: <the patch>}`. These are the round's two implied-I
  recommendations that Jastrow's text proves (L46, 2026-10-14).
- **Case 1, five headword-line patches with no annotation.** P000582
  respells H01100 `חִלֶף I` → `חֵלֶף I` (OCR pointing, the bytes of
  H01101's `חֵלֶף`). P000585 sets the I print prints after U01396's
  abbreviation `שִׁילְ׳` on that alternate (HW-roman), display `{0},
  {1} I, {2}`. P000586 and P000587 put back V00522's alternate as
  print sets it, `תֻּכָּא, (תַּכָּא I)`: the reform wraps the
  alternate in the parentheses the source writes on such a line
  (H01088 `(חְלָמָה  I)`), sets its I through `homographs` and
  displays `{0}, ({1} I)`; the `delete` takes ` I)` out of the gloss
  head, as P000340–P000341 did for U02097. P000588 rejoins S01780's
  torn alternate `קִצ` + `ּא` → `קִצּא`.
- **Case 4, one reform** (P000589): S01780's rejoined `קִצּא` →
  `קִצָּא`, the bytes of S01120's anchor text `קִצָּא`, with

  ```json
  "annotation": {"kind": "illegible", "printed": "קִצּא", "evidence": "only the vertical stroke of the qamats printed (1404a); S01120 spells the word קִצָּא; the maintainer's read 2026-10-13: \"Honestly this one is a bit of an educated guess …\"", "date": "2026-10-15"}
  ```

  The evidence quotes his note in full. The import writes it on
  `headwords[1]` as `{field: 'text', stored: 'קִצָּא', source:
  'P000589'}`.
- **Case 1, five retargets** (P000590–P000594): `replace` of the
  source anchor, as P000544–P000553 did. `find` is the anchor Sefaria
  aimed elsewhere, and `replace` names the I's link key (ruling `10-09
  link key`). The visible text is unchanged.

**Two chained reforms on one rid** (S01780; the audit's open point in
§7). A reform that changes the number of forms cannot carry an
annotation (ANNOTATIONS.md §3), so the rejoin and the annotated
respelling are two patches. `applyEntryPatches` applies a rid's
reviewed patches one after another in corpus order, each on the entry
the one before left. The second targets the block the first leaves
(`forms:ac82afc1`, not the snapshot's `forms:a97b7ef8`), so the
corpus preflight sees two targets. New tests in
`admin/pipeline/patch/annotation.test.ts` pin this: the pair applies
in order and leaves a `text` draft on form 1, the same pair reversed
fails the respelling, and the preflight passes both. No code changed.

## The 16

| # | rid | tick | disposition | patches or kept record | before → after | scan |
|---|---|---|---|---|---|---|
| 1 | A03217 | A03215 a word of its own outside the run; nothing to fix | kept | X8 on A03217 | as stored | [124b · leaf 147](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$148/full/1400,/0/default.jpg) |
| 2 | B01159 | a cross-reference, not a form; note "not a gap either, just a reference" | kept | X8 on B01159, the reason quotes the note | as stored | [189a · leaf 212](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$213/full/1400,/0/default.jpg) |
| 3 | G00527 | the gap is Jastrow's own | kept | X8 on G00527 | as stored | [403a · leaf 426](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$427/full/1400,/0/default.jpg) |
| 4 | H01101 | H01100 is `חֵלֶף` I, tsere; note "ocr issue" | case 1 | P000582 on H01100 | `חִלֶף I` → `חֵלֶף I`; name changes | [472a · leaf 495](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$496/full/1400,/0/default.jpg) |
| 5 | H01222 | yes, as stored | kept | X8 on H01222 | as stored | [480a · leaf 503](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$504/full/1400,/0/default.jpg) |
| 6 | I00081 | I00077 takes the I; note: the text proves a print error, so display it | case 2, and case 1 for its cite | P000583 on I00077 (annotated); P000590 on O00179 | `טְבַע` → `טְבַע I`, displayed; O00179's cite I00076 → I00077 | [518b · leaf 541](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$542/full/1400,/0/default.jpg) |
| 7 | U02013 | "something else"; note "no numeral, no implied" | kept | X10 on U02013, the reason from the note | as stored | [1633a · leaf 956](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$957/full/1400,/0/default.jpg) |
| 8 | H00321 | H00319 takes the I; note: a text error, not really implied | case 2, and case 1 for its cite | P000584 on H00319 (annotated); P000591 on H00731 | `חוּל` → `חוּל I`, displayed; H00731's cite H00323 → H00320 | [432b · leaf 455](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$456/full/1400,/0/default.jpg) |
| 9 | C00773 | no box; note "too much ambiguity … no implied anything, maybe an issue to dig in on" | kept | X10 on C00773 with the note; added to ledger L47 | as stored | [240a · leaf 263](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$264/full/1400,/0/default.jpg) |
| 10 | E00114 | E00113 is another word | kept | X10 on E00114 | as stored | [333a · leaf 356](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$357/full/1400,/0/default.jpg) |
| 11 | T00376 | neither: no implied I | kept | X10 on T00376 | as stored | [1460a · leaf 783](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$784/full/1400,/0/default.jpg) |
| 12 | U01397 | the I is after the abbreviation `שִׁילְ׳`: store it there | case 1, and case 1 for its cites | P000585 on U01396; P000592–P000594 on U01387, U01388, U01399; X8 kept on U01397 | U01396's `שִׁילְ׳` takes I, display `{0}, {1} I, {2}`; name unchanged; three cites U01398 → U01396 | [1589b · leaf 912](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$913/full/1400,/0/default.jpg) |
| 13 | N00260 | the gap is Jastrow's own | kept | X8 on N00260 | as stored | [881b · leaf 204](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$205/full/1400,/0/default.jpg) |
| 14 | V00523 | `תֻּכָּא, (תַּכָּא I), v. …`: a comma, then the parenthesis | case 1 | P000586, P000587 on V00522 | display `{0}, {1}` → `{0}, ({1} I)`, the alternate `homograph: 1`; gloss ` I), v. …` → `, v. …` | [1667b · leaf 990](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$991/full/1400,/0/default.jpg) |
| 15 | J00321, J00327 | keep as stored; note: a display question | kept | X1 on each; the reasons record the note | as stored | [576a · leaf 599](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$600/full/1400,/0/default.jpg) |
| 16 | S01780 | `קִצָּא`, qamats and dagesh; note: an educated guess, needs an annotation | case 1, then case 4 | P000588, P000589 on S01780 (the second annotated `illegible`) | `קֵץ, קִצ, ּא, קִי׳` → `קֵץ, קִצָּא, קִי׳`; display drops a slot | [1404a · leaf 727](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$728/full/1400,/0/default.jpg) |

**Where a tick and the block's recommendation differ.** A03217's block
recommended an implied I for A03215 and quoted six places where
Jastrow calls that word `אָרַע I` (A03223, M00016, V00895, M02308,
P01342, P01411). The tick reads A03215 as a word of its own, and the
record follows the tick. The six cites are unchanged: three link to
A03216 `אֲרַע I`. The same holds for C00773 (no box, kept by the
note) and U02013 and T00376 (kept, as the recommendations were not).

**The notes.** J00321's note asks whether the underline is a display
question. The data keeps print's letterless patah, and how the app
draws the underline is the app's question (ruling 10-13: matching
print is a display concern; ANNOTATIONS.md §5). The note is quoted
in both kept records. C00773's note ("maybe an issue to dig in on")
puts it on review ledger L47's list of textual-research candidates,
beside the `גִּיס I` contradiction L46 records. No issue was created
or touched.

## The retargets

| patch | citing rid | target | cite text | `ref` before → after |
|---|---|---|---|---|
| P000590 | O00179 | `sense[]:3a00c37c` | `Sabb. 108ᵇ, v. טְבַע I` | I00076 → I00077 |
| P000591 | H00731 | `sense[]:8fe0c03b` | `, v. חוּל I ch.` | H00323 → H00320 |
| P000592 | U01387 | `sense[—4)]:7c47c177` | `to let down, v. שִׁלְשֵׁל I` | U01398 → U01396 |
| P000593 | U01388 | `sense[]:a0ad5f5e` | `to let down, suspend, v. שִׁלְשֵׁל I` | U01398 → U01396 |
| P000594 | U01399 | `sense[]:75daf286` | `= h. שִׁלְשֵׁל I, to let down` | U01398 → U01396 |

U01399 is the cite the U01397 block names. U01387 and U01388 read the
same, `to let down, v. שִׁלְשֵׁל I` with the hiriq. U01398 `שַׁלְשֵׁל`
I (patah) is the `ch. same` of U01397 `to chain`, so all three are
the same determined retarget. U00429's `cmp. שַׁלְשֵׁל I` (patah)
names U01398 itself and stays.

**Not retargeted.** I00121's `(טְבַע I)` is plain text, with no link.
H00355 `(b. h.; חוּל I) dancer` and H00733 `(b. h.; חוּל I) army`
name H00319, but both sit in `language_reference`, which no patch op
edits. They stay linked to H00323 `חוֹל I` and wait on review ledger
L50 with the audit's 10 retargets there. H01057 and H01105 (`v. חֵלֶף
I`, linked to H01101) name H01100 as respelled here. They are the
worklist's cross-reference numerals question `חֵלֶף I` (data PR (v)),
still unticked. The one link that names H01100's old spelling, H01101's
`(preced. wds.)`, resolves by the pre-patch line (`10-09 link key`)
and still lands on H01100.

## What the re-import shows

`rm -rf data/entries/[A-Z] && bun data:import && bun qa:format`
changed exactly 11 entry files: H00319, H01100, I00077, S01780,
U01396, V00522 and the five citing entries H00731, O00179, U01387,
U01388, U01399. Every gate is green, gate 10 (contract) included. The
blessing reads `Patch corpus: 435 reviewed, 40 accepted, 480 applied`
(422 and 467 before) and `Annotations: 95 written (93 print-error, 1
kept, 1 illegible)`: this PR's 3 on top of the 92. Checked by script
against the tree before:

- with `headwords` and `display` masked (and V00522's gloss), each of
  the 6 headword entries is byte-identical to the tree before. The 5
  retargets differ by the one `ref` only;
- I00077 and H00319 carry one annotation each, `{field: 'homograph',
  kind: 'print-error', printed: '', stored: 'I'}`, and display `{0}
  I`. S01780 carries one, `{field: 'text', kind: 'illegible',
  printed: 'קִצּא', stored: 'קִצָּא'}`, on `headwords[1]`. No other
  changed entry carries one;
- `nameOf`: H00319 `חוּל` → `חוּל I`, I00077 `טְבַע` → `טְבַע I`,
  H01100 `חִלֶף I` → `חֵלֶף I`. The other 8 are unchanged (U01396
  `שִׁלְשֵׁל`, V00522 `תֻּכָּא`, S01780 `קֵץ²`; the names come from
  `headwords[0]`).

The headword report: X10 17 (12 primary) → 9 (4), X8 76 (45) → 70
(39), X1 5 (2) → 2 (0), X3 1 → 0, reviewed-kept 43 → 55, 0 stale
records. U01397's row moves from X10 to X8 once U01396's I sits on
the abbreviation, a form spelled apart, and is kept as U02098's is.
`bun data:validate` reports 0 problems. No `body/` or `transform/`
file and no baseline moved, so `transform:invariants` did not need to
run.
