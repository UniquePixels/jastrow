# `bracketed-gloss-lead-sense` — withdrawn to `judgment`

**Ruling: Brian, 2026-08-29 (batch 7).** Route `transform` →
`judgment`, `blocking` dropped with the route. The count (49) is
correct and is kept.

Batch report: `docs/v2/transform-batch-7.md` §10.
Sibling rulings: `empty-lead-sense.md` (same batch, same cause),
`empty-stem-section.md` (batch 6b, the original data-vs-display
question).

## The count reproduces, once the row's own boundary is executable

The row reads: "unnumbered first sense whose entire definition is a
bracketed etymological gloss **ahead of a correct `1)`**". Measured on
`applyTransforms(applyRepairs(source).entry, 'text-repairs')` over all
32,512 entries:

| | count |
|---|---:|
| unnumbered bracketed lead senses | 63 |
| …whose next sibling carries `1)` or `—1)` | **49** |
| …with no following sibling at all | 14 |

**49** is the catalogued figure exactly. The 14 excluded are entries
that are *nothing but* the bracketed gloss (`J00023` is
`[<i>to exist, be strong</i>.]` entire) — a different shape the row does
not describe.

## THE ROW DESCRIBES THE SOURCE SHAPE, NOT THE RENDERED ONE

`content.senses[0]` is not a sense in the body model. Two lines:

- `rejoin.ts:44` — `rejoinGlossHead` folds
  `content.senses[0]?.definition` into the entry's gloss head;
- `dry-run.ts:257` — `buildTrace` skips index 0 in the sense loop,
  because its content was already captured in the intro sense.

So an unnumbered bracketed lead is not a stray sense that escaped
numbering. It is the entry's lead, and it renders as one:

```text
B01152  בַּר I
  senses[0].definition   " [<i>empty, open</i>] "
  morphology             "m."
  language_code          "(b. h.;"
  gloss head             "m.(b. h.; ברר) [<i>empty, open</i>] "
  built sense labels     [—, 1, 2]
```

Morphology, etymology parenthesis, bracketed primary gloss, then the
numbered senses — which is how Jastrow prints it. The composition holds
across the population: **42 of the 49 carry a `language_code` and 15 a
`morphology`**, so in the large majority the bracket is one fragment of
a multi-part lead rather than a lead on its own; only **7** have a gloss
head that is the bracket alone.

## Why `judgment` and not `discard`

Nothing measured here is a defect, and this batch could not state what
a repair would change — which is the case for taking it off the
transform queue. It is not the case for asserting no defect exists:
that would need the 49 checked against the printed dictionary, and the
one shape that could still be wrong is the 7 bracket-alone leads, where
there is no morphology or language code to anchor the bracket to. Per
[[feedback_rendered_harm_rule]], the reader sees the bracketed gloss in
the lead; whether print ever sets it apart from the lead is a question
for eyes, not for a transform.

`judgment` says exactly that: no rule is owed, a reading may still be.
`blocking` drops because sitting on the transform queue as blocking
asserted a rule was owed before cutover.
