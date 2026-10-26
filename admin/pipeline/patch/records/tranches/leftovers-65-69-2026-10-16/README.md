# Group 11 leftovers L65–L69 (2026-10-16)

The rows PR #182 left in review ledger plan group 11
([`docs/archive/review-ledger.md`](../../../../../../docs/archive/review-ledger.md)):
L65 to L69, PR #185, under ruling `10-13 correction policy`
([`docs/decisions.md`](../../../../../../docs/decisions.md) §9). Every
edit is classified by the ruling's four cases; evidence is Jastrow's
printed text (the hOCR under `data/print/hocr/`, the page index under
`data/page-index/`, IIIF links to the leaf), never a Sefaria link
target. Volume 1's hOCR is Tesseract and drops every space; volume 2's
is ABBYY and keeps them.

**Two reviewed patches, P000826 and P000827, on two entries; one rule
change in the rejoin; one change to `annotate`.** The patches are
appended to [`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl),
and the two rids' `repaired` records in
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl) gain
them (J00403 beside P000820, S01040 beside P000272). `prompt_version`
is `leftovers-65-69-2026-10-16` and `snapshot` is `sha256:75bbc5ee…`.
This directory holds only this README.

| Row | rid | What print reads | Case | Change |
|---|---|---|---|---|
| L65 | M02423 | `v. מזה II` (hOCR `v. n<a II.`, 831a): vav or zayin cannot be read | 1 if zayin | none: a scan read, [`docs/archive/headword-worklist.md`](../../../../../../docs/archive/headword-worklist.md) § Scan reads for L65–L66 |
| L66 | M00712, Q01198 | `b. h. T^a)` (752b), `(b.h.; ftyz)` (1189a): a word the hOCR sees and cannot read | 1 | none: a scan read, same section |
| L67 | J00403 | `Men. 64b, v. זיבה).`, a `)` that closes nothing (579b) | 3 | P000826 `annotate`, `kept`, on child `d` |
| L68 | S01040 | `cmp. תובל קין Gen. IV, 22) artist` (1363b) | 1 | P000827 `replace`, the cite re-aimed at Genesis 4:22 |
| L69 | 4,884 entries | `m. (b. h.; v. X 2)`, `ch. same to tie` | 1, the import's own | no patch: the rejoin sets print's space between fields |

## L65, L66: three scan reads

The hOCR saw each word and cannot settle it, and a word is never
guessed, so each is a block in
[`docs/archive/headword-worklist.md`](../../../../../../docs/archive/headword-worklist.md)
§ Scan reads for L65–L66 (2026-10-16), with the stored text, the hOCR
line, the scan and the tick options. They go there rather than to
`sense-worklist.md` because each is a headword's spelling in the text
around it (a cite's display of M00725 `מַזֶּה II`; the Biblical Hebrew
root an etymology paren names), not a sense's shape. No patch: a later
data PR turns each tick into a case 1 `replace`.

## L67: an `annotate` on a lettered child

J00403 `יָם` ends `Men. 64b, v. זיבה).` with a `)` print sets that
closes nothing (hOCR vol. 1 579b `dangeronsea;Men.64°,v.737).`). It
has two plausible intents (a lost `(` or a stray `)`), so PR #182 kept
it as printed (case 3), which owes a `kept` annotation, and could not
write one: the `)` is in lettered child `d`, which the build makes
when P000820's run `a b c d` splits the gloss head, after every patch.

The change (tests first, `patch/annotation.test.ts`,
`patch/schema.test.ts`, `body/trace.test.ts`, `import/gates.test.ts`):

1. **`payload.child`** (`patch/schema.ts`). An `annotate` on `gloss` or
   `units` may name a lettered child by its built label, one letter.
   The target stays the host sense, whose text `expected_before`
   pins. Refused: a child on `label` or a form field, a child that is
   not one letter `a`–`z`, a child on a `language_reference:` target.
   The apply leaves the draft on the host's source sense with `child`
   set (`SenseAnnotationDraft`, `types.ts`).
2. **The build moves it** (`body/lettered-children.ts`, `body/trace.ts`).
   `buildTextSense` keeps a draft without `child` on the host and hands
   the others to `letteredChildren`, which puts each on the child
   built with that label, `child` dropped. A label no child carries,
   or a text that splits into no children, throws: the note is never
   lost. `finishEntry` already resolved a child's drafts, and gate 10
   already walked the children.
3. **Two text-keeping patches may share a target** (`validateCorpus`).
   The preflight allowed one patch per `(rid, target)`, because the
   first apply invalidates the second's anchor; P000826 targets the
   sense P000820 does, with the same text. An `annotate` and a
   `relabel` leave the text untouched, so a target may carry several
   when every one is of those two ops (`TEXT_KEEPING_OPS`). Any other
   op beside them is still refused.

P000826: `annotate`, `payload: {child: 'd', field: 'units'}`,
`annotation: {kind: 'kept', printed: ').'}`, evidence `print sets a )
that closes nothing after v. זיבה (579b); kept as printed, ruling 10-13
case 3`. `).` is the plain text around the `)`: it occurs once in `d`'s
units, and a `kept` note's `printed` must equal its `stored`. It lands
as `senses[0].senses[3].annotations[0]`, field `units[1]`.

## L68: S01040's verse

Print reads `m. (v. קוּן; cmp. תובל קין Gen. IV, 22) artist, esp.
metal-worker, silversmith` (hOCR vol. 2 1363b: `Gen.  IV,  22)
artist,  esp.  metal-worker,  silversmith.`): Tubal-cain is Gen. 4:22.
Sefaria cut the verse's second `2` and the `)` off as a sense `2)`
(P000272, a reviewed `join`, folds it back) and linked the cite to
Genesis 4:2, so the text read `<cite ref="Genesis 4:2">Gen. IV,
2</cite>2)`.

An external ref is stored as Sefaria writes it: the anchor's
`data-ref` becomes the `<cite ref>` (`createResolver`,
`import/cite.ts`), with no check against an index of Sefaria refs,
and `refs[]` does not list it. So a `replace` can re-aim it the way
#178 re-aimed internal ones: P000827 (case 1, no annotation) rewrites
`<a … href="/Genesis.4.2" data-ref="Genesis 4:2">Gen. IV, 2</a>2)` as
`<a … href="/Genesis.4.22" data-ref="Genesis 4:22">Gen. IV, 22</a>)`,
anchor and text together, after P000272's join. The visible text is
unchanged; the entry now reads `<cite ref="Genesis 4:22">Gen. IV,
22</cite>)`. Scan [1363b · leaf 686](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$687/full/1400,/0/default.jpg).

The Sefaria appendix lists P000827 in its review list, not as a row:
`not traceable to source`. Its find spans the seam P000272's join
closes (`2</a>` is the end of Sefaria's sense 0, `2)` its sense 1's
number), so no raw field holds it once. The row is real Sefaria error
with print evidence; the appendix cannot place a change across a
join.

## L69: the rejoin's spaces

`rejoinGlossHead` (`body/rejoin.ts`) joined `content.morphology`,
`language_code`, `language_reference` and sense 0's text with nothing
between them, and Sefaria's extraction had trimmed print's space off
both edges of many seams. The ledger counted one shape, 1,948 glosses
opening `X.(` (`m.(b. h.;`); the same loss sits at every seam: `(b.
h.;v. X`, `אבב)<i>swelling`, ` ch. same<i>to tie</i>`, ` ch. =
h.מָטָר`, `pr. n. m.<i>Abdan</i>`. Volume 2's hOCR reads the space at
each (`m. (b. h.; SM) plantation`, `m. mayish`, `ch., Ithpalp.`, `f.
(b. h.; v. *,Ep 2) [storage,] freight-ship`).

The rule (`seam`): one space between the gloss head so far and the
next field, unless either side's visible text (the entry tokenizer's
text tokens) is empty, the text before ends in whitespace, a dash, a
hyphen, `(` or `[`, the text after starts with whitespace, `, . : ; !
?`, `)`, `]`, a dash, a hyphen, a closing quote or a geresh, or a
digit meets a digit. The offsets record each field's span, so the
round trip still slices the four fields back exactly; the space sits
between two spans.

**Measured.** Before the fix, a census over the composed entries
(after every patch) found 6,161 seams the rule spaces, in 4,884
entries, 1,948 of them `.` + `(` (the ledger's count, reproduced). The
full drift check (`rm -rf data/entries/[A-Z] && bun data:import && bun
qa:format`) with the rule alone changed exactly 4,884 entry files,
and a script against `v2` found each differs only in `senses[0].gloss`
(every other field byte-identical) and only by inserted spaces: the
old gloss is the new one with 6,161 spaces taken out (3,621 entries
gain one, 1,249 two, 14 three). The five L61 joins that open the list
now read `v. X 2)`: J00301, O01360, P01088, P01094, P01436. Every gate
is green and `textConservation` still reads 278,547; the review,
headword and Sefaria reports do not change (the appendix reads the
raw record, not the body).

## Verification

- The re-import with all three changes changes the 4,884 files of
  L69, plus J00403 (its child `d` gains P000826's `kept` annotation)
  and S01040 (L68's cite; L69 left it alone, its fields already
  spaced): 4,886 files. Every gate is green.
- Blessing: `Annotations: 100 written (97 print-error, 2 kept, 1
  illegible)`, 99 before; `Patch corpus: 668 reviewed, 40 accepted,
  713 applied`.
- `bun data:validate`: 0 problems. `bun qa` passes. `bun run
  transform:invariants` passes (`body/` changed).
- `bun data:sefaria`: 299 appendix rows, unchanged; the review list
  gains P000826 (`annotate`, our structure) and P000827 (not traceable
  across P000272's join).
