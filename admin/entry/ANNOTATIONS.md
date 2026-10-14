# Annotations — proposed design

**Status: proposed** with ruling `10-13 correction policy`
([`docs/decisions.md`](../../docs/decisions.md) §9, review ledger L64),
accepted on merge of PR #171. **Nothing here is built.** The field, its
checks and the data changes are follow-up PRs (§6). It lives beside
the contract it would extend because `docs/specs/` is retired
([`docs/glossary.md`](../../docs/glossary.md) § Retired terms) and a
dated spec is not a live document.

## 1. Purpose

Ruling 10-13: at the import the data is edited only where the text is
clearly mistaken or missing, and every such edit carries an annotation
naming the evidence. Print's reading is stored in the annotation, never
lost; how annotations surface is the app's decision (§5). An edit that
departs from print is annotated. A transcription fix (case 1) makes
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
| 3. Print oddity, more than one plausible intent | kept as printed, flagged | `kept`: printed = stored, and why it is ambiguous |
| 4. Print illegible | our best reading of the print, flagged | `illegible`: why |

**Case 3 stores one too.** The app may want to say "sic" beside a
reading a reader would otherwise report as our typo, and today the only
record that print was checked is `reviewed-kept.jsonl`, a pipeline
report file that compile and `app/` may not read (ruling `10-04 compile
home`). A `kept` annotation costs one object per kept row and puts that
fact in the data, where every reader can see it.

## 2. The field

**Name: `annotations`, not `corrections`.** "Correction data" already
means the patch records (glossary § Data), and a `kept` note corrects
nothing.

**Placement: on the object it annotates** — `FormObject.annotations?`
and `Sense.annotations?` — not one entry-level list addressed by path.
An entry-level `target` would be a position (`senses[2].label`, the
path `validate.ts` prints), and a hand edit that inserts a sense would
silently re-aim it at the wrong one: the staleness ruling `10-04 lead
text` rejected stored offsets for, and the reason patch targets use
anchors, not indexes (RP5). Inline, the annotation moves with its object
through the import's build (as `label` and `reconstructed` do in
`buildSenseTree`) and through the admin tool's edits, and it is checked
against the object it sits on. The cost: two homes, and a reader that
wants every annotation walks the tree, as `entryFields` already does. A
stem's `stem` and `forms` get no home until something needs one.

```ts
interface Annotation {
  field: 'gloss' | 'homograph' | 'label' | 'text' | `units[${number}]`;
  kind: 'illegible' | 'kept' | 'print-error';
  printed: string;  // print's reading of the field; '' where print sets nothing
  stored: string;   // what the field holds; for gloss/units, the substring
  evidence: string; // case 2: the proof; case 3: the readings; case 4: why
  source: string;   // the patch that wrote it, P + 6 digits
  date: string;     // YYYY-MM-DD of the print read or ruling
}
```

`homograph` values are written as print writes them (`I`), labels as
their token without `)` (`5`). Like `reconstructed` and `partial`, the
key is absent when empty, never `[]`.

**`implied` retires** in the contract PR. An implied I becomes
`homograph: 1` with `{field: 'homograph', kind: 'print-error', printed:
'', stored: 'I', evidence: …}`, and `display` sets the ` I`. One mark,
not two for one fact. Rule 3 loses its implied clause (a single numeral
beside `{n}` ⇔ `homograph`), `reform.homographs` loses `implied`, and
gate 2 counts every numeral as notation. Names do not change: `deriveName`
already appends the numeral. `reconstructed`, `partial` and
`disambiguator` are untouched. The first two are print's notation and
the third is Sefaria's, so none of them is a correction.

**What `validateEntry` checks** (`admin/entry/validate.ts`, beside
`checkGender`; schema and `schema-parity.test.ts` in step):

- shape: the enums, `source` matching `^P\d{6}$`, `date` an ISO date,
  `evidence` non-empty, and every string in NFC (`checkNfc` covers it already);
- the field resolves on its object: `text` and `homograph` only on a
  form, the others only on a sense, and the field present (`units[n]`
  needs `n < units.length`);
- `stored` agrees with the field: equal for `label`, `homograph` and
  `text`; a substring that occurs in it for `gloss` and `units[n]`;
- `kind: 'kept'` ⇔ `printed === stored`;
- at most one annotation per field per object.

**What it cannot check.** Whether `source` is a real patch:
`admin/entry/` imports nothing from `admin/pipeline/`, and the patch
records are pipeline data. The import checks it in gate 10, the only
place that holds both sides: every annotation on a rid names a patch
applied to that rid, and every applied patch that carries an
annotation produced one. What `source` the admin tool writes for a
hand edit (09-21 admin edits: an edit is not a patch) is the admin
tool's design.

## 3. How the import fills it

From the reviewed patch records, so there is no second source of truth.
A reviewed patch gains an optional `annotation: {kind, printed,
evidence, date}`. The import adds `field` (from the op), `stored` (the
value after apply) and `source` (the patch id). The patch validator
refuses an `annotation` on an agent patch and on the ops that cannot
change a printed value:

| Op | Annotates | Field |
|---|---|---|
| `retag` | case 2: an implied `1)`, a renumbered doubled numeral, a misprinted number | sense `label` |
| `reform` `homographs` | case 2: an implied I, a misprinted numeral | form `homograph` |
| `reform` `forms` | case 2 (a misspelling Jastrow's own cross-reference spells right); case 4 | form `text` |
| `replace` | case 2: a cross-reference retarget (08-15), a determined misprint | sense `gloss` / `units[n]` |
| `annotate` (new; changes nothing, `expected_before` pins the field) | case 3 | any |
| a lettered relabel (L59; unbuilt) | case 2 | each child's `label` |
| `split`, `join`, `nest`, `move`, `delete`, `unref` | never: they cut, rejoin, reorder or remove what Sefaria mis-segmented or duplicated | — |

`annotate` exists so a `kept` note fails loudly when upstream rewrites
the text it describes, instead of describing text that is gone.
`reviewed-kept.jsonl` stays what it is: the report's memory of detector
rows. The label path needs care: a `retag` sets a SOURCE sense's
`number`, and `body/trace.ts` turns it into `label`, so the annotation
must ride that path, as `resolveLabel` carries the star.

## 4. The audit the ruling requires (sized, not changed)

Measured on the committed tree at `c9f572cfa` (32,512 entries) and the
439 patch records under `admin/pipeline/patch/records/` (288 entries).

| Population | Size | Under 10-13 |
|---|---|---|
| Implied I (10-06), set by `reform.homographs` | 14 entries | **5 proven**, by Jastrow's text naming `X I`: A00889 (A00882, M01329), A02041 (H01410), D00442 (D00595), Q00964 (Q00942, V00833), S00336 (S00961, S01262, S01321, S01360). These keep the I and are displayed and annotated. **9 unproven**, which lose the I and go to the reviewed-kept list: A00311, B00537 (an alternate), B00935, C00176, H00432, H01290, J00112, O00994, Q01398. Each rested on sequence alone. For A00311, worklist round 2 also asks whether print sets an I |
| Their 10 cross-references | 10 links in 10 entries | the cite's text reads `X I` (the hOCR reads `I` where legible: Q00942, V00833, M01329, and the glosses fit the I). Sefaria's linker points each at the II (A00890, A02042, D00443, Q00965, S00337). The target is Sefaria's error: case 1, retarget to the I |
| Single-numeral cross-references whose numeral the target lacks | 291 of 3,829 cites | the cite's text is the evidence, the link target is not. 215 texts name I: 21 of them are linked to 14 targets that carry no numeral, which is candidate implied-I evidence once the text is read against the right entry; 194 are linked to a target numbered otherwise. 76 name II or higher. Each row is a read of the text: does it name a numeral print sets wrong, or did the linker pick the wrong entry? |
| RP8 implied `1)` labels | 61 patches, 61 entries: 57 `retag` `implied-one`, 3 reviewed `retag` (B01321, C01169, U01787), 1 reviewed `replace` (D00072) | case 2, kept. They gain `printed: ''`, `stored: '1'` |
| Class 3 doubled numbers | 18 entries, 20 patches (P000518–P000537): 17 "keep print's number", plus P00059 | case 2: renumber, one annotation per changed label (`1 2 2 3` → `1 2 3 4` writes two). P00059's `4 4 6` → `4 5 6` is confirmed by the maintainer (2026-10-14). S01849's `עָבַר Pi. 4)`, which names print's second 4 (the city limits), becomes `Pi. 5)`, annotated `printed: 4)`, `stored: 5)`, with P00059's doubled `4)` as the evidence. No other linked cross-reference names a sense in these 18 or in P00790 |
| P00790 Hif. run | 1 | case 2: `a b c d f g h` → `a b c d e f g`, `print: f g h`. Needs L59's mechanism |
| U01512's `a) … 2)` (10-12) | 1 | case 3: `kept` |
| S01780's half-printed qamats | 1 | case 4, pending round 2 |
| `partial` forms | 2,494 on 2,275 entries | print's notation: no annotation |
| `reconstructed` forms / starred senses | 1,357 forms / 107 senses on 105 entries | print's star: no annotation |
| `disambiguator` | 808 | Sefaria's: no annotation |

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
G00675's disambiguator, which is not a text correction. K00081's
`—5)` (P000189) read as ambiguous from its rationale. The hOCR reads
`—5) to detain`, so it is case 1. Case 3 makes no patch by definition,
and no case 4 patch exists yet.

## 5. What the app owes

How an annotation surfaces is the app's design and out of scope here:
whether a corrected label shows a mark, whether there is a "show as
printed" view that swaps `stored` for `printed`, how a `kept` "sic" or
an `illegible` reading reads. The data's promise is only that print's
reading is never lost.

## 6. Follow-up PRs

1. **Contract:** `Annotation` on `FormObject` and `Sense` (`types.ts`,
   the schema, the parity test), `validateEntry`'s checks, `implied`
   retired, rule 3 (display), the patch `annotation` field and the
   `annotate` op, the trace carrying it, and gate 10's both-ways check.
2. **Consistency audit report:** §4's populations row by row,
   including the 291 cross-reference numerals.
3. **Data:** the implied I audit (5 displayed and annotated; 9
   withdrawn to bare and reviewed-kept; the 10 cross-references
   retargeted to the I), the class 3 renumber (with S01849's
   cross-reference), P00790 (after L59), the RP8 marks
   (61), and round 2 (L46).
