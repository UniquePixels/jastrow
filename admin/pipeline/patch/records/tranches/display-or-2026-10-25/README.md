# Display `or`: the two-spelling reforms (2026-10-25)

PR #n, review ledger L83 and L84, under rulings `10-25 display or` and
`10-13 correction policy` ([`docs/decisions.md`](../../../../../../docs/decisions.md)),
case 1 throughout: Sefaria fused spellings print sets apart (L83) or
set a space print does not (L84); print is right, no annotation, and
the patch rationale is the only trace. It applies the five
two-spelling reforms that
[`checklist-batch-2-2026-10-25`](../checklist-batch-2-2026-10-25/README.md)
§ E held, except A01161. The applied block is in
[`docs/headword-worklist.md`](../../../../../../docs/headword-worklist.md)
§ Applied from the maintainer checklist (2026-10-25).

## The ruling and the gate

The maintainer ruled on 2026-10-25: two spellings print joins with `or`
on one headword line are stored as separate forms, each a lookup key,
and `display` shows print's layout, with ` or ` as literal text in the
template. He also confirmed that the first form is always the primary,
parenthesized or not (HW-A02823's status): the URL name is
`headwords[0]` as printed.

The entry contract already accepted the template
(`admin/entry/headword-rules.ts`; a test now says so). Gate 2 did not:
on a settleable line a supplied template must conserve the line's
notation, and `or` was counted as a Latin run the line lacks. The
change is in `notationOf` (`admin/pipeline/import/gates.ts`): the run
` or `, the word with a space either side (`OR_SEPARATOR`), is skipped
as the comma is. The tests (`gates.test.ts`, `checkHeadwordLine`):

| supplied template | gate 2 |
|---|---|
| `{0} or {1}, {2}` (I00158's probe) | passes, five marks |
| `{0} and {1}` | `[] → [and×1]` |
| `{0} or {1} I` | `[] → [I×1]` |
| `{0} or {1} v.` | `[] → [v×1 .×1]` |
| `{0}or {1}`, `{0} {1} or` | `[] → [or×1]`: no spaces, no separator |

A source line that carries `or` is still unsettleable
(`lineIsUnsettleable` is unchanged), so the skip only ever reads a
template a reviewed patch supplied. `gates.ts` is under `import/`, not
`body/` or `transform/`, so `transform:invariants` is not required.

## What changed

All in [`../../reviewed/`](../../reviewed/).

| | patches | ids |
|---|---|---|
| amended in place: payload and rationale | 2 | P000297 (I00158), P000298 (I00654) |
| amended in place: the rationale only | 2 | P000299 (M02116), P000301 (M02868) |
| new | 3 | P000932 (B00443), P000933 (C00329), P000934 (M00447) |
| held, unchanged | 1 | P000300 (A01161) |

The two payloads move from the legacy `headword`/`alt_headwords`
spelling to `forms` plus `display`; the forms are the ones already
stored. P000299 and P000301 change nothing in their entries, but they
are not no-ops: each is what splits the fused spelling into two forms
(without P000299, M02116's one form would be the fused
`מַעְיָינָא מַעְיָנָא`), so
both are kept and take the maintainer's read as evidence. The new
three have `prompt_version` `display-or-2026-10-25`, snapshot
`sha256:75bbc5ee…`, and the targets of the withdrawn P000291–P000293
(the same lines); the manifest names each.

Each amendment carries the evidence paragraph the appendix's filter
reads (`maintainer print read of the scan, 2026-10-25 …`, then the
scan leaf).

## The `X` mappings (L83)

His `X` runs to the stored forms, by word count, then order, then
length.

| rid | his line | forms, in order | display before → after |
|---|---|---|---|
| I00158 | `XXX or XXX, XXXX m. ...` | `טְוִיָּיה`, `טְוִיָּה`, `טְוִויָּה`: three runs, three forms; the run lengths (3, 3, 4) do not track the letters (5, 4, 5), so order decides | `{0}, {1}, {2}` → `{0} or {1}, {2}` |
| I00654 | `XXXXX XXXXX, v. ....` | `טְפֵילָה`, `טְפֵילָא`: two runs of five, two five-letter forms; `, v.` is the gloss's head, already stored there | `{0}, {1}` → `{0} {1}` |
| M02116 | `XXXX, XXXXX m. ....` | `מַעְיָינָא`, `מַעְיָנָא` | `{0}, {1}`, unchanged |
| M02868 | `XXXX, XXXXXX, XXXXXX m. ....` | `מְשֵׁיזֵב`, `מְשֵׁיזְבָא`, `מְשֵׁיזִיב`; the two six-letter runs by order | `{0}, {1}, {2}`, unchanged |
| A01161 | `XXXXX m., XXXX XXXXX (XXXXX) XXXXX f. ....` | five runs, five forms, but two five-letter forms either side of `(אַיְידִי)` in an order nothing shows | **held**: `{0}, {1}, {2}, {3}, ({4})` |

His `m.` on I00158 disagrees with the stored gloss's `f.`
(`f. (טָוָה) spinning`); gender is not these patches' field, and it is
left as stored.

## L84: the space before the comma

PR #193 withdrew P000291–P000293 because print has the comma, and the
source line came back as Sefaria's `X , II`, a space before the comma.
The hOCR sets the comma on the word (B00443 `NON FS, I mn.`, 153b · leaf
176; C00329 `MINS, LT m.`, 219b · leaf 242; M00447's leaf 63 has no
readable head line), and no other `display` in the corpus sets a space
before a comma. Each new reform keeps the line as the source has it,
so the form, its numeral and its name are unchanged, and supplies
`{0}, II` (B00443, C00329) or `{0}, I` (M00447).

## L81 and L80: left open

- **L81, A00675's `261) 1)`.** It needs code. A `split` cannot name the
  second `1)`: the record's `occurrence_index` counts the target
  sense's occurrences (`resolveTarget`), not the marker's, and
  `applySplit` calls `exactlyOnce`, which finds `1)` twice (once inside
  the page `261)`). The change is a `split` that says which occurrence
  of its marker it means, by a payload field or by a marker match that
  refuses a digit before it, with the appendix's `textChange` reading
  the same.
- **L80, A01194.** The three Hebrew phrases inside `(b. h. …)` stay
  unrestored; they need a letter-level Hebrew read.

## Witness

`rm -rf data/entries/[A-Z] && bun data:import && bun qa:format`
changed exactly 5 entry files, each in `display` alone (checked by
script against `v2`):

| rid | display before | after | name |
|---|---|---|---|
| I00158 | `{0}, {1}, {2}` | `{0} or {1}, {2}` | `טְוִיָּיה`, unchanged |
| I00654 | `{0}, {1}` | `{0} {1}` | `טְפֵילָה`, unchanged |
| B00443 | `{0} , II` | `{0}, II` | `בִּזְיוּנָא II`, unchanged |
| C00329 | `{0} , II` | `{0}, II` | `גַּוָּוזָא II`, unchanged |
| M00447 | `{0} , I` | `{0}, I` | `מוֹזְלָא I`, unchanged |

`nameOf` is unchanged for all five; no rename. Every gate is green
(gate 2 `headwordLine` 97,628 of 97,628); `bun data:validate` 0
problems.

`bun data:sefaria`: **appendix 478 → 479 rows (+1)**, P000301
(M02868, `headword-two-forms`). **`no print evidence` 6 → 2**: P000232
(M01355, L82) and P000300 (A01161). The other new evidence does not
reach the appendix: P000297, P000298 and P000299 are held as
`not mechanical for op` (I00158's template sets a layout; I00654's and
M02116's reforms change the headword and the number of forms
together), and P000932–P000934 change no form, so there is no Sefaria
field to state.
