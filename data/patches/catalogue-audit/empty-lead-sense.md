# `empty-lead-sense` — withdrawn to `judgment`

**Ruling: Brian, 2026-08-29 (batch 7).** Route `transform` → `judgment`.
The row keeps its count (84) and its `blocking` flag is dropped with the
route, because sitting on the transform queue as blocking asserted that
a rule was owed before cutover, and none is.

Gate context: `docs/v2/transform-batch-7.md` §9.
Sibling ruling: `empty-stem-section.md` (batch 6b) — same question,
one degree stronger here.

## The row reproduces exactly, and that is not the issue

Measured on `applyTransforms(applyRepairs(source).entry,
'text-repairs')` over all 32,512 entries:

| shape | count |
|---|---:|
| `content.senses[0]` is `{}` — no keys at all | **73** |
| `content.senses[0]` is `{definition: " "}` — whitespace only | **11** |
| **total** | **84** |

Digit for digit what the catalogue records, including the round-3
re-measurement from 73 to 84.

## THE PRESUMED REPAIR DESTROYS A SENSE IN 72 OF 73

The row's presumed repair is "drop the empty lead sense". It cannot be
done, and the reason is two lines of the body model that point the same
way:

- `rejoin.ts:44` — `rejoinGlossHead` reads
  `e.content.senses[0]?.definition ?? ''`;
- `dry-run.ts:257` — `buildTrace` **skips index 0 entirely**
  (`if (index === 0) continue`), because sense 0's content is already
  captured once, in the intro sense built from the rejoined gloss head.

So an empty lead contributes an empty string to the gloss head and is
then skipped. It costs the reader nothing. **Drop it and `senses[1]`
becomes index 0 — folded into the gloss head by the first line, and
skipped by the second.** The sense does not move; it is consumed.

Measured by building the body both ways for all 73:

| | |
|---|---:|
| built body IDENTICAL after dropping the lead | **1** |
| built body CHANGED | **72** |

`A00644`, in full:

```text
BEFORE  senses[0].gloss = " ch. "                    labels [—, 1, 2, 3]   4 senses
AFTER   senses[0].gloss = " ch.  <a …>same</a>. "    labels [1, 2, 3]      3 senses
```

The entry loses a sense and gains its text inside an unlabelled intro
gloss. The one identical case is the single member with no next sibling,
where there is nothing to promote.

**Neither text gate can see this.** No codepoint is invented and none is
lost — text moves between fields, which is the same blind spot batch 4
found when `applyRepairs` composed with `truncatedCitationDigit`, and
the reason `checkNoNewText` and `no-lost-text` are both silent here.

## The 11 whitespace cases fail for a different reason

The catalogue already records it: `rejoinGlossHead` concatenates
morphology + `language_code` + `language_reference` +
`senses[0].definition`, and in those 11 the space IS the print separator
between the morphology label and the `1)` marker. Dropping the lead
destroys a byte. The two arms are mechanically distinct — all 73 `{}`
cases are entries whose `language_code` (`" ch. "`) was extracted, all
11 whitespace cases are entries whose `content.morphology` was extracted
— but they fail the same repair for two independent reasons, which is
why the row moves whole rather than splitting.

## What is actually true of the row

Nothing is missing. The empty lead is an artefact of upstream field
extraction, it renders as nothing, and the body model already handles
it correctly. What is left is at most a **cleanliness question about
the stored shape** — whether truth data should carry an empty object at
`senses[0]` — and that is a schema/serving decision for the migrate
design, not a transform. Per
[[feedback_rendered_harm_rule]]: the reader sees nothing wrong today,
and would see a lost sense after the repair.

This is the **fifth** way a row has left the transform route — after
the eight judgment withdrawals, the three discards, `empty-stem-section`'s
data-vs-display withdrawal, and batch 7's own re-scoping of
`sense-number-outside-closed-grammar`. It shares 6b's shape but is
stronger: `empty-stem-section` withdrew because the repair was
unnecessary; this one withdraws because the repair is **harmful**.
