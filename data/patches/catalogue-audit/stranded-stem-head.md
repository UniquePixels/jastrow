# `stranded-stem-head` — catalogue audit

**Batch 6c, 2026-08-29.** Ruled by Brian the same day. Design:
[`docs/specs/2026-08-29-stranded-stem-head-design.md`](../../../docs/specs/2026-08-29-stranded-stem-head-design.md).
Report: [`docs/v2/transform-batch-6c.md`](../../../docs/v2/transform-batch-6c.md).

This audit exists because the row was catalogued at **544 entries with
no predicate recorded anywhere**, so nothing could reproduce it, confirm
it, or say what it excluded. Everything below is measured on the pinned
snapshot (32,512 entries) and asserted in
`admin/pipeline/transform/rules/stem-section-corpus.test.ts`.

## 1. The predicate

```text
^[\s,;.=]*<i>\s*LABEL(\s*[/,]\s*LABEL)*\s*</i>
```

over `definition` at every sense depth, `LABEL` one of 45 binyan names
derived from the corpus's own `verbal_stem` field: the 70 distinct
values it holds, minus batch 6b's 19-value non-binyan enumeration, minus
the six multi-label headings.

## 2. Four figures, and each answers a different question

| Figure | What it measures | Value |
|---|---|---:|
| `corpusCount` | the rule alone on RAW source — what `transform:count` reads | **296** |
| predicate, raw | the defect before the pipeline runs | 360 occ / 359 ent |
| predicate, composed | the defect where a structural rule stands | **561 occ / 555 ent** |
| rule, composed | what ships | **436** |

`corpusCount` is 296 because that is the only figure the audit harness
can compare against: `count.ts` runs every rule ALONE against the pinned
snapshot, by design, and this rule's population is nearly twice as large
downstream. A `corpusCount` of 555 would have shown as a permanent
DELTA of −259 on every future run, which trains readers to ignore the
harness. The other three are pinned in the corpus test instead.

**340 of the 555 entries hold no `verbal_stem` anywhere at all** — the
row's original `reason` claimed 351, and 6a measured 350 on raw. This is
the figure that says the row is a data concern and not only a display
one: for those entries `stems[]` is absent from the built body entirely.

## 3. Why the composed figure is the real one

| Rule | Population before | after | Δ |
|---|---:|---:|---:|
| `applyRepairs` (whole pass) | 360 | 360 | 0 |
| `label-period-outside-italic` | 360 | 562 | **+202** |
| `italic-swallowed-terminal-period` | 562 | 561 | −1 |

`label-period-outside-italic` moves a section head's period inside its
own italic. On raw source 202 of these heads spell it outside the tag,
so a predicate about the italic's CONTENTS cannot see them. The
catalogued 544 sits between the two figures and matches neither.

## 4. The partition (exhaustive, mutually exclusive, sums to 561)

| Slice | n | Disposition |
|---|---:|---|
| top-level sense 0, single label, space then something | 436 | **the rule** |
| child sense (depth 1) | 100 | → `stem-head-in-child-sense` (judgment) |
| `Label of X` gloss | 14 | not the defect |
| etymology-paren remnant | 7 | refused on shape, stays on this row |
| `= Label` cross-reference | 2 | not the defect |
| double head / paren-prefixed head | 2 | real, shape not taken |

### The 16 that are not the defect

- **`Label of X`** (14) — `<i>Pi.</i> of <a>בָּסַם</a>, q. v.` The
  headword *is* the Pi. of another article. There is no section here for
  a block to hold; the label is a gloss.
- **`= Label`** (2) — `A00031`, `B01369`. A cross-reference to a stem
  the entry carries elsewhere. `B01369` has a real `Pa.` block at index
  2, so repairing it would mint a duplicate.

These 16 are part of why 544 was too high. They are recorded here rather
than promoted to rows: a row asserts a defect, and there is none.

## 5. The split row

`stem-head-in-child-sense` (100, `route: judgment`, `blocking: true`).

Same predicate, same defect, same print phenomenon. It is `judgment`
because the repair its top-level counterpart uses **cannot exist here**:

- `buildTrace` (`dry-run.ts:252`) tests `.grammar` on `content.senses`
  only. A grammar object on a child sense is read by nothing.
- **0 of 32,512 entries carry a grammar object below top level.**
  Writing one would mint a shape the model has never held.
- `BodyEntry` keeps `stems` in a top-level array beside `senses`; there
  is no per-sense stem.

The two repairs actually available — hoist the sense to top level, or
grow the model — are both rulings.

**Not `entangledWith` its parent.** The populations partition one
predicate with zero overlap, so neither owns the other's records. Batch
6b's own two splits declare no edge either.

## 6. The falsifier, and it came back empty

A rule that mints a stem section must not mint one the entry already
has; no gate in `run.ts` can see a duplicate, because the label is text
the entry already held.

**0 of 436** carry another top-level block with the same `verbal_stem`.
112 carry a block with a different name; 317 carry none at all.

## 7. Text accounting, measured through the builder

Over all 436, comparing the RENDERED body before and after (`buildTrace`,
tags stripped) — not the source fields, because `buildStem` drops
`sense.definition` and the source fields cannot show the loss:

- **0 codepoints invented.**
- **1,065 codepoints lost**, every one a space (755), comma (283) or
  semicolon (27) — the seam prefix and the label's following space, both
  declared through `removes`.

## 8. The `"[."` bracket collision, closed

Raised by batch 6a, deferred by 6b. **Disjoint.**
`stranded-open-bracket` reproduces at 87 occ / 85 ent and shares **zero
entries** with the eight delimiter-label blocks
(`H00256`, `H01218`, `H01769`, `P00326`, `S00150`, `T00766` at `"[."`;
`U00230` at `"(."`; `P01197` at `"[[."`).

6a's balance claim reproduces exactly: all six `"[."` blocks are
bracket-unbalanced at −1 in their own text, `U00230` is paren-unbalanced
at −1 with its text beginning `") "`, and `P01197` is balance 0 and is
not that repair. Either rule may now be written without claiming the
other's members; neither is written here.

## 9. What this audit does not settle

- **The anchor-borne forms are left in prose**, so `BodyStem.forms` is
  `[]` for all 436. 230 of the 436 open with an `<a dir="rtl">` anchor
  form, 199 with an rtl span, 7 with a parenthetical. Not a loss — the
  reader sees them either way — but not a capture. `binyan_form` items
  are plain strings, so lifting one discards a link target. (The 267
  quoted elsewhere is the anchor count over the whole 561-member
  population, not over the 436.)
- **That a top-level sense 0 opening with a stem label is always a
  section head.** Confirmed by a sibling block in 112 entries and by the
  vocabulary being the parser's own; not proved for the 317 with no
  sibling block.
