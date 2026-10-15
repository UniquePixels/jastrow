# Class 3 nest patches of 2026-10-12

The maintainer ticked the class 3 scan review
([`docs/sense-worklist.md`](../../../../../../docs/sense-worklist.md),
§ `Class 3 scan review (2026-10-11)`) on 2026-10-12. Eighteen ticks
were splits, applied in PR #166 ([`../class3-2026-10-12/`](../class3-2026-10-12/README.md)).
This directory records the other four, the "nest" ticks: A00982,
C00263, C00869 and U01512. With them class 3 is fully applied.

## The ruling

Decisions row
[`10-12 nested sublists`](../../../../../../docs/decisions.md): a list
that restarts its numbering inside a sense (a dual, a derived noun
introduced by "Hence", a participle's own meanings) is stored as an
unlabelled sibling sense holding the items as its children, print's
labels kept. The four ticks are the decision. Nothing is renumbered:
U01512's participle keeps print's `a)` then `2)`, as his note reads.
Under ruling 10-13 that is case 3, and since PR #176 the `2` carries a
`kept` annotation (P000581, an `annotate` on the child this `nest`
makes; [`../class3-renumber-2026-10-15/`](../class3-renumber-2026-10-15/README.md)).

## How each row is done

Patches apply to Sefaria's segments before the body is built, and
nested senses come from the body's text splits, so the first question
for each row was whether an existing op could hand a split the text it
needs. They were tested in this order, on the real text.

1. **A `join` where a form-section marker the splitter knows heads the
   list.** C00869's `Part. pass.` block holds only `1) rolled` because
   Sefaria cut `—2) rounded` into a segment of its own. A join alone
   is not enough: the joined text runs `1) rolled … —2) rounded … —2)
   (with על) to roll upon …`, the ascending run stops at the second
   `2)`, and the last item of a form section runs to the end of its
   text, so the verb's sense 2 would sit inside the participle's
   `rounded`. A `split` of the verb's `—2)` out of that segment first,
   then the `join`, gives children `1 2` and a top-level sense 2.
   U01512's list opens on `a)`, and the splitter's runs are numbers
   from `1)`, so the marker does not reach it.
2. **`Du.` in the splitter's `MARKERS`.** A full re-import with `Du.`
   added and no patch changed exactly one entry file, A00982 (every
   gate green; the review report lost A00982's class 3 row and gained
   one `markup-carry` row, the same `<i>` C00869's `Part. pass.`
   already carries). `Du.` is in `body/form-sections.ts`, not a
   transform rule; `bun run transform:invariants` was run anyway (see
   below). With `Du.` added, a `join` folds Sefaria's sense `—3)`
   (`swollen glands`) back into sense 2 so the dual's run is `1 2 3`.
3. **A new `nest` op** for what neither reaches: C00263's `Hence` is
   prose, not a form marker, and U01512's list opens on a letter.
   `nest` (`patch/schema.ts`, `NestPayload` and `applyNest`) cuts the
   target at `lead`: the target keeps the text before it, and a new
   unlabelled sibling takes `lead` as its definition and one child per
   marker, each with its marker as `number` and the text up to the
   next. It is byte-conserving, so it needs no no-new-text allowance,
   and it nests only a list that closes the sense. The body builds
   such a source sense's children (`buildTextChild`, `body/trace.ts`);
   the snapshot has no sense without `grammar` that has children, so
   nothing else meets that code. U01512's `<i>a</i>)` is first
   untagged by a `replace` to `a)`, a label token, as every lettered
   label stores the letter alone.

| rid | mechanism |
|---|---|
| A00982 | `join` + `Du.` in the form-section `MARKERS` (hypothesis 2) |
| C00263 | `nest` (hypothesis 3) |
| C00869 | `split` + `join` (hypothesis 1, with a split first) |
| U01512 | `replace` (untag `a`) + `nest` (hypothesis 3) |

## Where the patches are

**6 patches on 4 entries, P000538–P000543, are in
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl)**, with
one `repaired` record per rid in
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl).
U01512 already had a record, for P000372 and P000373 (Group D's
`retag` and `replace` on its Pa. stem); P000542 and P000543 are added
to it, so the rid keeps one record. As for the earlier sets, this
directory holds only this README: `reviewed/` is the only place the
loader reads a person's patches.

Each patch's `rationale` quotes the tick, names the ruling and the
mechanism, and carries the hOCR lines verbatim from the worklist block
and the scan leaf. `defect_class` is `self-numbered-intext-marker`,
`prompt_version` is `class3-nest-2026-10-12`, and every
`expected_before` is the target segment as the import meets it, after
both transform phases (and for U01512, after P000372–P000373), pinned
to snapshot `sha256:75bbc5ee…`. Each rid's patches chain in file order.

## The patches

The label lists are the affected list, written as the worklist writes
them: `·` an unlabelled sense, `(…)` the children of the sense before
it.

| patches | rid | section | mechanism | labels before → after | scan |
|---|---|---|---|---|---|
| P000538 | A00982 | senses | `join` `—3)` into sense 2; `Du.` marker | `· 1 2 3` → `· 1 2 · (1 2 3)` | [38a · leaf 61](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$62/full/1400,/0/default.jpg) |
| P000539 | C00263 | senses | `nest` at `—Hence מִיגּוֹ, מִגּוֹ Miggo,`, markers `1)` `—2)` | `1 2` → `1 2 · (1 2)` | [216a · leaf 239](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$240/full/1400,/0/default.jpg) |
| P000540–P000541 | C00869 | senses | `split` the verb's `—2) (with על)`; `join` `—2) rounded` into sense 1 | `1 · (1) 2 3 4` → `1 · (1 2) 2 3 4` | [244a · leaf 267](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$268/full/1400,/0/default.jpg) |
| P000542–P000543 | U01512 | Af. | `replace` `<i>a</i>)` → `a)`; `nest` at `—Part. pass. מַשְׁמֵע`, markers `a)` `—2)` | `1 2` → `1 2 · (a 2)` | [1599b · leaf 922](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$923/full/1400,/0/default.jpg) |

## What the re-import shows

The re-import (`rm -rf data/entries/[A-Z] && bun data:import && bun
qa:format`) changed exactly these 4 entry files, every gate is green,
and `bun data:validate` passes. For each entry:

- the affected list reads exactly as the ticked option states (the
  table's right-hand list), and nothing outside it changed (U01512's
  other three stems are identical);
- the concatenated tag-free text of the whole entry, stems included,
  differs from the text before only by marker bytes moving between
  the text and a label:

  | rid | out of the text (now labels) | into the text |
  |---|---|---|
  | A00982 | `1)` and `2)` of the dual | `—` before its `3)`, which the join folds back from Sefaria's `—3)` token; the dash stays in item 2's text, as in every form section |
  | C00263 | `1)`, `—2)` | nothing |
  | C00869 | `—2)` (the split) | `—` and one space at `a. fr.—2) rounded`, the join folding Sefaria's `—2)` token back with the space print sets after it (ledger L58) |
  | U01512 | `a)`, `—2)` | nothing (the `replace` removed tags only) |

  No other byte is lost or added, and each lead moved whole from its
  host's text into the new sense's gloss.

`bun run transform:invariants` (the corpus tier; `body/` changed, and
`Du.` is a splitter marker) passes, 11 of 11 tests, in 259 s.

The review report's `self-numbered-intext-marker` section, which
listed these 4 rows, is gone. A00982 gains a `markup-carry` row
(`senses[2].gloss`, an `<i>` closed at the host's end), the same row
C00869's `Part. pass.` split already has.

## The detector, retired

With these patches the detector finds 0 rows on the committed entries,
and a registered class that produces no row faults the run
(`checkSilentClasses`, `import/detectors/classes.ts`), which asks for a
class at zero to be retired deliberately: its detector unregistered
and its catalogue row resolved. So `self-numbered-intext-marker` is
unregistered from `CLASS_RULES`, and its row in
[`../../patterns.jsonl`](../../patterns.jsonl) is `discarded`, with
its control moved to the detector's unit-test fixture: H01899's sense 2
as the entry held it before P000525 is found, so the predicate fires
and the zero is real; C00869, nested and split here, is not found. The
module and its test stay in `import/detectors/`, and its action text
names nesting as a third outcome, so a re-fetch that brings rows back
re-registers it as it is.
