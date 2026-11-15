# Annotations

**Status: accepted** with ruling `10-13 correction policy`
([`docs/decisions.md`](../../docs/decisions.md) §9, review ledger L64),
on merge of PR #171, and **reshaped by ruling `11-15 annotation
section`** (2026-11-15): one entry-level `annotations` list, pointed to
by `<annotate>` tags in the text. §1 is the policy, §2 the shape and its
checks, §3 how the import fills it, §4 the audit that sized the first
data PRs (kept as it was; its shape is the old one), §6 the history of
those PRs. It lives beside the contract it extends because
`docs/specs/` is retired ([`docs/glossary.md`](../../docs/glossary.md)
§ Retired terms) and a dated spec is not a live document.

## 1. Purpose

Ruling 10-13: at the import the data is edited only where the text is
clearly mistaken or missing, and every edit that departs from print
(cases 2–4) carries an annotation. Print's reading is kept in the
annotation, never lost, and the evidence in the patch; how annotations
surface is the app's decision (§5). A transcription fix (case 1) makes
the data match print, so it departs from nothing. It is corrected
silently, and its evidence lives in the patch's `rationale`.

**Evidence is Jastrow's printed text**: a cite's own words, the hOCR,
the scan. Where Sefaria's linker pointed a link is never evidence; a
wrong link target is Sefaria's error, and fixing it is case 1. For an
implied I, case 2 is met only when Jastrow's own text names `X I` (a
cross-reference, a `v. X I`, an etymology `(X I)`). A bare candidate's
place before the II proves nothing. A renumber updates every
cross-reference that names the old number, each with its own
annotation.

| Case | What happens | Annotation |
|---|---|---|
| 1. Transcription error (Sefaria or its OCR); print is right | corrected silently | none: the patch `rationale` is the trace (08-11 OCR correction, HW-ocr-dalet) |
| 2. Print error, intended value determined (a closed system Jastrow defines yields one value, or his own text elsewhere names it) | corrected | `print-error`: print's value and the evidence |
| 3. Print oddity, more than one plausible intent | kept as printed, flagged | `kept`: `printed` is what the text holds, and why it is ambiguous |
| 4. Print illegible | our best reading of the print, flagged | `illegible`: why |

**Case 3 stores one too.** The app may want to say "sic" beside a
reading a reader would otherwise report as our typo, and today the only
record that print was checked is `reviewed-kept.jsonl`, a pipeline
report file that compile and `app/` may not read (ruling `10-04 compile
home`). A `kept` annotation costs one object per kept row and puts that
fact in the data, where every reader can see it.

## 2. The field

Ruling `11-15 annotation section` replaced the shape this document
first described (a list on each form and sense, carrying its own
evidence). §4's audit still speaks in that shape.

**An entry has one optional `annotations` list, never `[]`.** "Correction
data" already means the patch records (glossary § Data), and a `kept`
note corrects nothing, so the field is `annotations`, not
`corrections`. Each item (`admin/entry/schema.ts`, `AnnotationSchema`):

```ts
interface Annotation {
  id: string;       // local to the entry: a1, a2, …
  kind: 'illegible' | 'kept' | 'print-error';
  printed: string;  // print's value, shown to the reader; '' where print sets nothing
  note?: string;    // the sentence the reader sees
  date: string;     // YYYY-MM-DD of the print read or ruling
  source?: string;  // the patch that wrote it, P + 6 digits
}
```

`printed` writes a homograph as print writes it (`I`) and a label as
its token without `)` (`5`). `source` is a reverse lookup and the link
to follow if that patch changes. It is absent on an annotation made in
the admin tool until a backport writes its patch. The evidence stays in
the patch (§3): the entry holds what the reader needs, the patch the
technical record.

**The text points to its annotation.** `<annotate id="aN">…</annotate>`
wraps the span the annotation marks (`admin/lib/annotate.ts` writes it,
finds its ids and reads past it):

- in `display`, around a form's `{n}` or around its homograph numeral
  (` I`);
- inline in a `gloss` or a `units[n]`;
- as a sense's `annotation: "aN"` pointer, where the mark is the
  label. A label is a bare token and cannot hold a tag.

`headwords[n].text` and `label` stay plain. Where print sets nothing,
the tag wraps what was added.

**Ids** run in the order the import places them: the headword forms by
index (a form's `text` before its homograph), then the senses in
document order (depth first, the entry's senses before each stem's),
and within one object, draft order.

**What the contract checks.** `bun data:validate` runs
`validateEntry` (`admin/entry/validate.ts`), which checks two things
about annotations:

- the schema: the id pattern, the `kind` enum, `source` as `P` and six
  digits, `date` as `YYYY-MM-DD`, a `note` non-empty when present, the
  list never empty, no other key. The markup check also holds every
  `<annotate>` tag to its one shape and to closing;
- the references (`checkAnnotations`, `admin/entry/annotations.ts`):
  every id names one annotation, every tag or pointer names an
  annotation the entry holds, and every annotation is referenced
  exactly once. A tag counts in any field that may carry markup
  (`entryFields`, `admin/entry/fields.ts`), stems included.

The contract does **not** compare an annotation with its patch, its
`date` or `kind` with anything, or `printed` with the tagged text. The
maintainer: "I want to avoid a bunch of checking/comparing in the
validate portion here." A hand edit whose `printed` is wrong, or whose
tag wraps the wrong span, passes validation, and is judged by its
editor and later by the backport (a separate process, not yet
designed). Whether `source` is a real patch is also out of its reach:
`admin/entry/` imports nothing from `admin/pipeline/`.

**What the import checks** (§3) is what it writes: that each draft finds
exactly one place, that `kept` holds exactly where `printed` equals what
the tag wraps (`placeAnnotations`), and that each annotation's `source`
is a patch applied to the entry that owes it (gate 10,
`annotationProvenance`). These run at import, never in `bun
data:validate`.

## 3. How the import fills it

From the reviewed patch records, so there is no second source of truth.
A reviewed patch gains an optional `annotation: {kind, printed, note?,
evidence, date}`. `evidence` stays in the patch. `note`, `kind`,
`printed` and `date` reach the entry. The import adds the `id`, places
the tag or pointer the text carries, and sets `source` to the patch id.
The patch validator refuses an `annotation` on the ops that cannot
change a printed value, and the import's preflight refuses one on an
agent patch (a record cannot say who wrote it; the loader stamps
`author`):

| Op | Annotates | Where the mark goes |
|---|---|---|
| `retag` | case 2: an implied `1)`, a renumbered doubled numeral, a misprinted number | the sense's `annotation` pointer, for its label |
| `reform` `homographs` | case 2: an implied I, a misprinted numeral | a tag around the numeral in `display` |
| `reform` `forms` | case 2 (a misspelling Jastrow's own cross-reference spells right); case 4 | a tag around the form's `{n}` in `display` |
| `replace` | case 2: a cross-reference retarget (08-15), a determined misprint | a tag around the replacement in a sense's `gloss` or `units[n]`; on a `language_reference:` target, in `senses[0]`'s `gloss` |
| `annotate` (changes nothing, `expected_before` pins the target) | case 3 | any of the above, by `payload.field` |
| `relabel` (L59; built in PR #180) | case 2: a lettered run print set with a gap (P00790's Hif. `f) g) h)` → `e f g`) | each child's `annotation` pointer that departs from print's letter, one annotation each; none when `to` is `run` (L57) |
| `split`, `join`, `nest`, `move`, `delete`, `unref` | never: they cut, rejoin, reorder or remove what Sefaria mis-segmented or duplicated | — |

`annotate` exists so a `kept` note fails loudly when upstream rewrites
the text it describes, instead of describing text that is gone.

**Placement** (`placeAnnotations`, `admin/pipeline/import/annotations.ts`).
The apply leaves a draft on what it changed (`SourceSense.annotations`,
`SourceEntry.formAnnotations`), the build carries a sense's drafts to
the sense built from it on the label's path (`body/trace.ts`), and
`finishEntry` calls `placeAnnotations` once it has parsed the line and
translated every sense, since a text draft is located in the translated
text. It writes `entry.annotations` (absent when none is placed), the
tags in `display`, each gloss and unit, and each sense's `annotation`.

- Form drafts come first, by form index, a form's `text` before its
  `homograph`. A `text` draft wraps the form's `{n}`, which `display`
  must hold exactly once. A `homograph` draft wraps the numeral
  beside the slot, and `display` must set that numeral.
- Sense drafts follow, in `senses` order (document order, a sense
  before its children, the entry's senses before each stem's), and in
  draft order within a sense. A `label` draft sets the sense's
  `annotation`; a sense that already points to one is a problem. A
  text draft is looked up by its `find`, translated alone: it must be
  balanced markup and occur exactly once across the fields it may land
  in (`gloss`, `units`, or either, for a `replace`). Two text drafts
  may not overlap. The tags are written from the end of each field
  back, so one tag cannot move another's place.
- Each draft's `kind` is then checked against what it marks: `kept`
  exactly where `printed` equals the form's text, the numeral, the
  label or the found text, and never otherwise.
- A draft that cannot be placed, or whose `kind` does not fit, is a
  problem returned to `finishEntry`, never a throw, and a red gate 9.

How each op's draft is made:

- `retag`: the sense's built `label`.
- `reform` with `homographs`: exactly one item, so one form; its
  numeral as print writes it. Without `homographs`: the `text` of the
  one form the reform respelled, found by parsing the line before and
  after; a reform that changes no form's text, two, or the number of
  forms is refused at apply.
- `replace`: the gloss or unit the replacement landed in (`find` is the
  replacement), found after the build and the markup translation. A
  replacement that leaves a half tag, lands in a lettered child or
  occurs twice is a red gate 9. On a `language_reference:` target
  (review ledger L50) the text is the etymology paren the import folds
  into `senses[0]`'s gloss head (`body/rejoin.ts`), so the draft rides
  source sense 0 and lands in its `gloss`. An entry whose first sense
  is a stem, or that has none, has no sense to carry it, and the apply
  refuses. D00072's implied `1)` (§4) was a `replace` that wrote the
  `1)` into the gloss, so it could not be annotated as a label; since
  PR #175 it is a `retag` (P000554, annotated) and a `split` at `—2)`
  (P000555).
- `annotate`: `payload.field` names the field, and `find` is the
  annotation's `printed`. On a `sense[…]` target, `label`, `gloss` or
  `units` (the gloss or the unit that holds `printed`); on a `forms:`
  target, `text` or `homograph` with `payload.form`, the parsed form's
  index; on a `language_reference:` target, `gloss` only, landing as a
  `replace`'s does. Only `kept`; `expected_before` pins the target, and
  a moved target is always `upstream-changed`. **A lettered child**
  (review ledger L67, PR #185): the children exist only once the build
  splits the host's text (`body/lettered.ts`), so a note on a child's
  `gloss` or `units` targets the host and names the child by its built
  label, `payload.child` (one letter; never on `label`, a `forms:`
  target or a `language_reference:` one). The draft rides the host's
  source sense, as a `relabel`'s run does, and
  `body/lettered-children.ts` moves it onto the child with that label;
  a label no child carries, or a text that splits into no children,
  throws at the build rather than losing the note. J00403's P000826
  notes the `)` print sets in child `d`. An `annotate` may share its
  target with a `relabel` (P000820 on the same sense): neither changes
  the text, so neither invalidates the other's anchor
  (`TEXT_KEEPING_OPS`, `patch/schema.ts`).
- `relabel` (PR #180): one patch, several annotations. Its payload
  `{run, to}` is print's letters as the text holds them and the labels
  the children take; the apply leaves both on the source sense
  (`SourceSense.relabel`), the text untouched, and the build splits at
  exactly `run` and labels the children from `to`
  (`body/lettered-children.ts`). Each child whose label departs from
  print's carries a `label` draft whose `printed` is print's letter;
  the patch's own `printed` must be `''`, since one string cannot state
  three letters, and its `kind` must be `print-error`. P00790's P000812
  writes three: `printed` `f`, `g`, `h`, on the children labelled `e`,
  `f`, `g`. A relabel whose `to` is its `run` (review ledger L57,
  J00403's P000820) changes no label: it declares a run print sets
  whole that the plain lettered rule leaves unsplit, so it owes no
  annotation and the validator refuses one. It is still reviewed only:
  `corpusPreflight` refuses a relabel on an agent patch, annotated or
  not.

**Gate 10** (`annotationProvenance`, `admin/pipeline/import/gates.ts`)
holds the entry's annotations to the patches both ways, against the
patches that the run applied to the rid carrying an `annotation`:

- every annotation has a `source`, and it names one of those patches;
- every such patch wrote exactly as many annotations as it owes: one,
  or for a `relabel` one per label its `to` changes
  (`annotationsOwed`, `patch/schema.ts`; the apply lists the patch once
  per annotation owed).

The check reads what the apply recorded, not what is on the entries, so
a patch whose draft the build lost (a `join` that folded the annotated
sense away) shows as one that wrote none. It runs at import, not in
`bun data:validate`, because the admin tool edits entries ahead of
their patches.

`reviewed-kept.jsonl` stays what it is: the report's memory of detector
rows. The label path needs care: a `retag` sets a SOURCE sense's
`number`, and `body/trace.ts` turns it into `label`, so the annotation
must ride that path, as `resolveLabel` carries the star.

## 4. The audit the ruling requires (sized, not changed)

*2026-11-15: the shape this audit describes (`field`, `stored` and
`evidence` in the entry, on the form or sense) was replaced by ruling
`11-15 annotation section` (§2). The audit is a record of what was
sized, and its text is unchanged.*

Measured on the committed tree at `c9f572cfa` (32,512 entries) and the
439 patch records under `admin/pipeline/patch/records/` (288 entries).

| Population | Size | Under 10-13 |
|---|---|---|
| Implied I (10-06), set by `reform.homographs` | 14 entries | **5 proven**, by Jastrow's text naming `X I`: A00889 (A00882, M01329), A02041 (H01410), D00442 (D00595), Q00964 (Q00942, V00833), S00336 (S00961, S01262, S01321, S01360). These keep the I and are displayed and annotated. **9 unproven**, which lose the I and go to the reviewed-kept list: A00311, B00537 (an alternate), B00935, C00176, H00432, H01290, J00112, O00994, Q01398. Each rested on sequence alone. For A00311, worklist round 2 also asks whether print sets an I |
| Their 10 cross-references | 10 links in 10 entries | the cite's text reads `X I` (the hOCR reads `I` where legible: Q00942, V00833, M01329, and the glosses fit the I). Sefaria's linker points each at the II (A00890, A02042, D00443, Q00965, S00337). The target is Sefaria's error: case 1, retarget to the I |
| Single-numeral cross-references whose numeral the target lacks | 291 of 3,829 cites | the cite's text is the evidence, the link target is not. 215 texts name I: 21 of them are linked to 14 targets that carry no numeral, which is candidate implied-I evidence once the text is read against the right entry; 194 are linked to a target numbered otherwise. 76 name II or higher. Each row is a read of the text: does it name a numeral print sets wrong, or did the linker pick the wrong entry? |
| RP8 implied `1)` labels | 61 patches, 61 entries: 57 `retag` `implied-one`, 3 reviewed `retag` (B01321, C01169, U01787), 1 reviewed `replace` (D00072) | case 2, kept. They gain `printed: ''`, `stored: '1'` |
| Class 3 doubled numbers | 18 entries, 20 patches (P000518–P000537): 17 "keep print's number", plus P00059 | case 2: renumber, one annotation per changed label (`1 2 2 3` → `1 2 3 4` writes two). P00059's `4 4 6` → `4 5 6` is confirmed by the maintainer (2026-10-14). S01849's `עָבַר Pi. 4)`, which names print's second 4 (the city limits), becomes `Pi. 5)`, annotated `printed: 4)`, `stored: 5)`, with P00059's doubled `4)` as the evidence. No other linked cross-reference names a sense in these 18 or in P00790 |
| P00790 Hif. run | 1 | case 2: `a b c d f g h` → `a b c d e f g`, `print: f g h`. Needs L59's mechanism; done in PR #180 (P000812, a `relabel`, three annotations) |
| U01512's `a) … 2)` (10-12) | 1 | case 3: `kept` |
| S01780's half-printed qamats | 1 | case 4, pending round 2 |
| `partial` forms | 2,494 on 2,275 entries | print's notation: no annotation |
| `reconstructed` forms / starred senses | 1,357 forms / 107 senses on 105 entries | print's star: no annotation |

**Every past patch, by case** (rationale keyword, then read):

| | replace | retag | split | join | delete | nest | reform | unref | total |
|---|---|---|---|---|---|---|---|---|---|
| 1, silent | 49 | 30 | 59 | 51 | 36 | 2 | 53 | 3 | 283 |
| 1, companion split of an implied-`1)` entry | 0 | 0 | 58 | 0 | 0 | 0 | 0 | 0 | 58 |
| 1 by bytes, number kept: class 3, becomes 2 | 1 | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 20 |
| 2, implied `1)` (annotation owed) | 1 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 61 |
| 2, implied I (5 proven owe an annotation; 9 unproven are withdrawn) | 0 | 0 | 0 | 0 | 0 | 0 | 14 | 0 | 14 |
| 3 / 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| unclassified | 1 | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 3 |

Of the four text ops asked about (`replace`, `retag`, `split`,
`join`: 330 patches), 2 are unclassified. Both are D00341's bracket
move (P000215, P000216), recorded as a deviation (register #16) though
it keeps every printed byte. The third unclassified patch is P000307,
G00675's disambiguator (since deleted, `11-13 url words`), which was
not a text correction. K00081's `—5)` (P000189) read as ambiguous
from its rationale. The hOCR reads `—5) to detain`, so it is case 1. Case 3 makes no patch by definition,
and no case 4 patch exists yet.

## 5. What the app owes

How an annotation surfaces is the app's design and out of scope here:
whether a corrected label shows a mark, whether there is a "show as
printed" view that swaps the tagged text for `printed`, how a `kept` "sic" or
an `illegible` reading reads. The data's promise is only that print's
reading is never lost.

## 6. Follow-up PRs

*These are the PRs of ruling `10-13 correction policy`, in its shape.
Ruling `11-15 annotation section` reshaped the field afterwards (§2).*

1. **Contract:** `Annotation` on `FormObject` and `Sense` (`types.ts`,
   the schema, the parity test), `validateEntry`'s checks, `implied`
   retired, rule 3 (display), the patch `annotation` field and the
   `annotate` op, the trace carrying it, and gate 10's both-ways check.
   **Done in PR #172**, except `implied` retired and rule 3, which
   moved to the implied-I data PR in item 3 and are done in PR #174.
2. **Consistency audit report:** §4's populations row by row,
   including the 291 cross-reference numerals.
3. **Data:** the implied I audit (done in PR #174: 5 displayed and
   annotated; 9 withdrawn to bare and reviewed-kept; the 10 cross-references
   retargeted to the I), the class 3 renumber (with S01849's
   cross-reference; done in PR #176: 24 labels renumbered by annotated
   `retag`s, S01849's `Pi. 4)` → `Pi. 5)` by an annotated `replace`,
   and U01512's `a) … 2)` annotated `kept` by the first `annotate`, on
   the child a `nest` made), P00790 (after L59; done in PR #180: the
   `relabel` P000812, `f) g) h)` labelled `e f g`, three annotations),
   the RP8 marks
   (61; done in PR #175: 24 retags annotated in place, 36 moved to
   `reviewed/` with their splits and annotated, D00072 converted to a
   `retag` + `split`), and round 2 (L46).
