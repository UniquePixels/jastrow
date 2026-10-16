# The group 11 data leftovers (2026-10-16)

The data rows of review ledger plan groups 5 and 11
([`docs/review-ledger.md`](../../../../../../docs/review-ledger.md)):
L36, L51, L57 and L61, PR #182, under ruling `10-13 correction policy`
([`docs/decisions.md`](../../../../../../docs/decisions.md) §9). Every
edit is classified by the ruling's four cases; evidence is Jastrow's
printed text (the hOCR under `data/print/hocr/`, the page index under
`data/page-index/`, IIIF links to the leaf), never a Sefaria link
target. Volume 1's hOCR is Tesseract and drops every space; volume 2's
is ABBYY and keeps them.

**Eight reviewed patches, P000813–P000820, on seven entries**, and one
rule change in the `join` op. The patches are appended to
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl), with a
`repaired` record per rid in
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl)
(A02547's record gains P000813 beside P000374). `prompt_version` is
`leftovers-2026-10-16` and `snapshot` is `sha256:75bbc5ee…`. This
directory holds only this README.

| Row | rid | What print reads | Case | Patch |
|---|---|---|---|---|
| L36 | A02547 | `… Targ. O. Ex. XVI, 31.—*2) read מִקְסוֹטֵירִין (… Zach. IV, 12) tubes, lamp-mozzles` (the hOCR line is garbled, `…12)`) | 1: upstream never split print's starred marker | P000813 `split` `—*2)` |
| L36 | L00099 | `ch. 1) same. Targ. Y. Gen. XXX, 37, v. next w.— *2) = לבנא, brick` (690b) | 1 | P000814 `split` `—*2)` |
| L36 | M00491 | `m. (ילד) birth-time. …` with no `1)`, then `— *2) travail` (742b) | 2 for the `1)`; 1 for the split | P000815 `retag` `1)`, annotated; P000816 `split` `—*2)` |
| L51 | M02423 | `… as wood-ashes. Ber. 28a, a. e., v. מזה II.` (831a) | 1: Sefaria's target | P000817 `replace`, the link re-aimed at M00725 |
| L57 | M00712 | `(denom. of מֶזֶג; b. h. מזג) to mix …`; the Part. pass. run `a) … —b)` (752b–753a) | 1: Sefaria dropped the word and the `)` | P000818 `replace` ` b. h. ` → ` b. h.) ` |
| L57 | Q01198 | `c. pl. (b. h.; פנה) front, face …`; `לפ׳ a) … —b)` (1189a–b) | 1: as M00712 | P000819 `replace` `(b. h.; ` → `(b. h.;) ` |
| L57 | J00403 | `—Esp. a) … —b) … —c) … —d) …`, then `Men. 64b, v. זיבה).` with a `)` that closes nothing (579b) | the `)` kept as printed; the run changes no label | P000820 `relabel` `a b c d` → `a b c d`, no annotation |
| L61 | 31 joins | `(v. אנך 2) affliction`, `Pi. 2) engraver`; and `P. Sm. 4012)` | 1 | no patch: the `join` op's rule |

## L36: three starred senses inside a definition

Each definition holds `—*2)`, the dash, star and numeral print sets
before a later starred sense (ruling `10-04 sense star`). Read on the
hOCR, each is print's own sense marker, not prose: in L00099 and
M00491 it opens print's line after a `—` and is followed by its own
gloss (`= לבנא, brick`; `travail`); in A02547 the hOCR line is
garbled, but it ends `12)` where the text has `(… Zach. IV, 12)`, and
`—*2) read …` (an emended reading with its own gloss) has the shape of
the 107 starred senses upstream did split. Sefaria failed to segment
them, so each is a `split` (case 1, never annotated) that cuts `—*2)`
out of the text as the new sibling's number; the build reads label
`2` with `reconstructed: true`.

`split` took only the closed grammar (`N)`, `—N)`), so its marker now
also admits print's star (`SPLIT_MARKER`, `patch/schema.ts`; `—*2)`
but not `—*a)`). A split synthesizes nothing: the token is found once
in the text and moves into the number field, and the no-new-text
allowance is that token, as before.

M00491's first sense carries no label in print (`m. (ילד)
birth-time`), so once the starred sense is its own, the entry reads
an unlabelled first sense and a `2`: the implied `1)` shape the ruling
names as determined. P000815 numbers it `1)` before the split, as
D00072's P000554 and P000555 do, annotated `print-error`, `printed:
''`, evidence `a —*2) follows the unlabelled first sense (hOCR 742b)`.
A02547 and L00099 already had their `1)`.

Scans: [97b · leaf 120](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$121/full/1400,/0/default.jpg),
[690b · leaf 13](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$14/full/1400,/0/default.jpg),
[742b · leaf 65](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$66/full/1400,/0/default.jpg).

## L51: M02423's `v. מַוֶּה II`

Print reads `v. מזה II` (hOCR `v. n<a II`): the cite names the II. The
link pointed at M00724 (`מַזֶּה I`, "what is this?"); M00725 `מַזֶּה II`,
the priest who sprinkles, is the II, and its own text cites the same
`Ber. 28a` for "thy ashes mere ashes from the stove", the wood-ashes
M02423 defines. The text is Jastrow's and the target Sefaria's: case
1, no annotation. P000817 re-aims the anchor by M00725's link key
(`/Jastrow,_מַזֶּה II.1`, the href M02173 already uses), the visible
text unchanged.

Not changed: the display's vav (`מַוֶּה`), likely the vav-for-zayin OCR
glyph P000359 fixed on M00724's headword. The hOCR (`n<a`) cannot tell
vav from zayin, and a scan read was out of reach here, so it waits on
one. Scan [831a · leaf 154](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$155/full/1400,/0/default.jpg).

## L57: three real lettered runs left whole

`relabel` with `to` equal to `run` cannot reach M00712 or Q01198: the
paren their source opens and never closes puts every later marker
inside it, so a declared run finds no counted markers. The text is
the fault, so the repair is to the text.

- **M00712, Q01198** (case 1). Print closes each paren after a Hebrew
  word Sefaria dropped: `b. h. מזג)` (hOCR `b. h. T^a)`), `(b. h.;
  פנה)` (hOCR `(b.h.; ftyz)`). P000818 and P000819 put print's `)`
  back, and the plain lettered rule splits each run as print divides
  it (`a) mixed … —b) combined`; `a) for appearance sake … —b) in
  front`). The dropped words are not restored: the hOCR cannot read
  them, and a word is never guessed. They wait on a scan read
  ([752b · leaf 75](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$76/full/1400,/0/default.jpg),
  [1189a · leaf 512](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$513/full/1400,/0/default.jpg)).
- **J00403.** Print sets the run `a) b) c) d)` and ends the entry
  `Men. 64b, v. זיבה).` with a `)` that closes nothing (hOCR
  `…Men.64°,v.737).`). That `)` is print's own, with more than one
  plausible intent (a lost `(` or a stray `)`), so it is kept as
  printed. It makes the paren state unclear, and the plain rule then
  splits nothing (B9). P000820 is a `relabel` with `run` and `to` both
  `a b c d`: it changes no label and owes no annotation, and makes the
  build split at exactly print's four markers. As in every lettered
  split, the text after the last marker stays with `d`, here `—Fem.
  form: יַמָּה …`
  ([579b · leaf 602](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$603/full/1400,/0/default.jpg)).
  The kept `)` carries no `kept` annotation: it sits in child `d`'s
  text, and an `annotate` lands only on its host's fields.

Two code changes make P000820 possible (tests first):

1. **A relabel may change no label** (`patch/schema.ts`). The
   validator refused `run` identical to `to`; it now accepts it,
   refuses an annotation on it ("a relabel that changes no label
   carries no annotation"), and still requires one whenever a label
   changes. The draft on the sense (`RelabelDraft`, `types.ts`) holds
   the patch id as `source` and the annotation `note` only when there
   is one. `corpusPreflight` refuses a relabel on an agent patch,
   annotated or not (`authorshipProblems`, `patch/apply.ts`).
2. **A declared run where the paren state is unclear**
   (`body/lettered.ts`, `declaredMarks`). The plain rule counts no
   markers in such a text; a declared run is now held to every
   candidate outside anchors instead, each exactly once, so a paren's
   own letter (`(see b)`) still refuses a run that leaves it out. The
   plain rule and a run in a text whose parens are clear are
   unchanged.

## L61: the space before a joined marker's numeral

Sefaria minted a sense out of a cross-reference's `(v. X 2)` and lost
print's space before the numeral as well as after it. #160 (L58) put
the space back after the `)`. The space before is now the `join`'s
too (`spaceBefore`, `patch/schema.ts`): one space before the token
unless the visible text before it (tags skipped) ends in whitespace,
a dash, `(`, `[` or a digit, or the token itself is dashed (`—3)`).

The digit clause is what the five `4012)`-shaped rows read on the
hOCR. Each is a page or column number closing a paren, not a sense
marker, and the join's rejoined text is already right:

| rid | print (hOCR, vol. 2) | reads |
|---|---|---|
| U01674 | `(b. h.; cmp. Syr. …, P. Sm. 4012) to be smooth` | P. Sm. col. 4012, then `)` |
| O00821 | `(v. סקר II, a. P. Sm. p. 2722) rock-lichen` | p. 2722, then `)` |
| N00740 | `(Assyr. Nipur, …, v. Schr. KAT.2, p. 572) Nifar` | p. 572, then `)` |
| U00261 | `(b. h.; …; v. Del. Assyr. Handw. s. v. sid(d)u, p. 642) tract of land` | p. 642, then `)` |
| R00407 | `(נשף to rush, storm, v. P. Sm. 3431), …` | P. Sm. col. 3431, then `)` |

S01040 has the same shape: print reads `Gen. IV, 22) artist`, the
verse 22 closing the paren, and the text's `Gen. IV, 2</a>2)` reads
the same once the link is skipped. (Its link names verse 2, Gen.
4:2, where print's verse is 22: a Sefaria link error outside this
row.)

**Measured on all 31.** Instrumenting the op over a dry import
listed 51 joins: 46 into a preceding sibling and 5 that open the list.
Of the 46, 26 had no space before the numeral (the ledger's 31 less
the five that open the list); the rule spaces 20 and leaves the 6
digit cases tight. The 20 other joins already had their space or a
dashed token. The re-import with the rule alone (no patch) changed
exactly 20 entry files, each by one inserted space before the
numeral: A00913, A01662, A03277, B00534, B00656, B00991, H00709,
I00149, I00753, K01188, L00346, N01381, O01397, P00539, P00805,
Q02145, R00096, U00398, V00144, V00166. Volume 2's ten read the space
on the hOCR (`(v. ספל 2) frame`, `(v. צדק 2) Sadducee`, `(פתח Pi. 2)
engraver`, `(… Af. 1) vomit`); volume 1's hOCR has no spaces to read,
and its ten are the same `(v. X 2)` shape.

**Not reached: the five joins that open the list** (J00301, O01360,
P01088, P01094, P01436). Their text before the marker is in
`language_reference`, not in a sense, and the gloss head the import
folds from it reads `m.(b. h.;v. עֲצֵי2)`: the space before the numeral
went with the spaces between the fields, a loss of the rejoin
(`body/rejoin.ts`), not of the join. 1,948 entries' glosses open
`X.(` with no space; that is its own class.

## Verification

- The re-import (`rm -rf data/entries/[A-Z] && bun data:import && bun
  qa:format`) changes exactly 27 entry files: the 20 L61 entries and
  the seven patched rids (A02547, L00099, M00491, M02423, M00712,
  Q01198, J00403). Every gate is green; `textConservation` reads
  278,547 (278,514 before: the new senses' and children's fields).
- Script check of each against `v2`, fields other than `senses`
  byte-identical in all 27:
  - the 20: one space inserted before the numeral, nothing else;
  - A02547, L00099: the text loses `—*2)` and a sense labelled `2`,
    `reconstructed`, follows `1`; M00491 the same, its first sense
    now `1` with one annotation (`printed: ''`, `stored: '1'`,
    P000815);
  - M02423: one cite's `ref` moves M00724 → M00725, its text
    unchanged;
  - M00712, Q01198: one `)` inserted, and children `a`, `b` whose
    markers left the text;
  - J00403: children `a b c d`, their markers out of the text, no
    annotation.
- Blessing: `Annotations: 99 written (97 print-error, 1 kept, 1
  illegible)`, 98 before; `Patch corpus: 661 reviewed, 40 accepted,
  706 applied`.
- `bun data:validate`: 0 problems. `bun qa` passes. `bun run
  transform:invariants` passes (`body/` changed).
