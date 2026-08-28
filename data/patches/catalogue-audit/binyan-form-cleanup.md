# Audit — `binyan-form-leading-space` (457) and `binyan-form-empty-slot` (446)

**RULED 2026-08-28 (Brian): BOTH DISCARDED,** `status: discarded`,
`route` removed, and both ids taken out of `PENDING` in
`admin/pipeline/transform/registry.ts` so they appear in neither
`RULES` nor `PENDING`. Transform route **71 → 69 rows**, 21,983 →
**21,080** instances; `coverage().total` **71 → 69**, 0 unaccounted,
0 duplicated.

**Neither row was withdrawn for want of a mechanism.** They are
discarded because a mechanism already owns them, and has since long
before Phase 2 — the second and third rows to leave `transform` the way
`ascii-gershayim-outside-body-text` did rather than the way the eight
`judgment` withdrawals did.

## The finding

`admin/pipeline/body/repairs.ts:445` —

```ts
/** Drop empty strings and trim stray spaces in binyan_form arrays
 * (06 decision; upstream-issues #9/#17). Corpus-wide, not rid-keyed. */
function cleanBinyanForms(entry: SourceEntry, records: RepairRecord[]): void {
	…
	const cleaned = forms.map((f) => f.trim()).filter((f) => f !== '');
```

That is both rows, exactly: `.trim()` is the leading-space row (and the
trailing edge besides), `.filter((f) => f !== '')` is the empty-slot
row. It is corpus-wide rather than rid-keyed, it runs inside
`applyRepairs`, and `applyRepairs` runs **before** the transform
registry inside the `text-repairs` phase. Every rule in `RULES`
therefore sees an already-clean `binyan_form`.

## Measurement

One walk over all 32,512 source entries, counting each shape in the raw
entry and again in `applyRepairs(entry).entry`:

| Shape | Raw | After `applyRepairs` |
|---|---:|---:|
| leading-space items after index 0 | **523** (457 entries) | **0** |
| leading-space items at index 0 | 0 | 0 |
| trailing-whitespace items | 0 | 0 |
| empty-string slots | **486** (446 entries) | **0** |
| `binyan-cleanup` records emitted | — | 938 across 751 entries |

Both catalogued counts reproduce exactly on first measurement. The two
zeroes are the discard; the two raw figures are what a rule would have
claimed.

Reproduce with `bun test admin/pipeline/body/binyan-cleanup.corpus.test.ts`.

## Why this is a discard and not a transfer of ownership

Batch 3a met the same collision and ruled the other way: the transform
took the gershayim defect and `repairs.ts`'s `cite-escape` class 1 was
retired. The difference is what the incumbent pass was doing.

| | 3a — `cite-escape` class 1 | here — `cleanBinyanForms` |
|---|---|---|
| Was the repair correct? | **No.** It escaped `"` to `&quot;`, preserving the ASCII quote as an entity where print sets `״` | **Yes.** Trim and drop are the whole of what both rows ask for |
| Did it compose? | **No.** Rules read +90/−0, the pipeline read +68/−22 | **Yes.** Nothing downstream reads the edge; the array reaches `BodyStem.forms` as discrete items |
| Coverage | 21 of 1,392 entries, rid-keyed | 32,512 entries, corpus-wide, 100% of both populations |

Rewriting a complete, correct, corpus-wide pass as two transform rules
would replace working code with equivalent code and open a regression
window for nothing. The rows are the thing that is wrong, not the pass.

## The round-4 finding stands

`binyan-form-leading-space` carried an audit flag asking whether the
space was a *separator* — the question that collapsed
`trailing-whitespace-definition` from 2,340 to 10. Round 4 answered it:
nothing consumes the space. `admin/pipeline/body/rejoin.ts` never
references `binyan_form` (0 occurrences), and
`admin/pipeline/body/dry-run.ts:196` passes the array straight through
as `forms: grammar?.binyan_form ?? []`, where no separator is possible.

That finding is why the existing trim is **correct**. This audit
withdraws the row, not the finding — the defect is real, it is repaired,
and the repair is in the right place.

## What keeps the discard honest

A discard whose ground is "another module repairs it" is only as durable
as that module. Deleting or narrowing `cleanBinyanForms` would restore
523 leading spaces and 486 empty slots with **no ACTIVE catalogue row
left to describe them** — both rows survive in `patterns.jsonl` as
`status: discarded` records of what was repaired and why, which is a
different thing from a row anything routes work from — and no other
test in the suite counts either shape.

`admin/pipeline/body/binyan-cleanup.corpus.test.ts` closes that: it
asserts the raw figures, the two zeroes, the index-0 evidence, the empty
trailing population, and the pass's own record count, corpus-wide. A
regression fails on the exact number that moved.

## What this batch takes from it

The three shipped batches that met a two-owner collision each found it
*after* writing the rule — 3a found the gershayim one at the last task
of the batch, by accident. This one was found before the rule existed,
by measuring the row's population **after `applyRepairs`** rather than
on raw source. `transform:count` and every census that predates this
audit measure raw source, which is precisely the blind spot 3a recorded
and `docs/v2/transform-batch-3a.md` §9.2 proposed a sweep for; the gate
this audit adds is the first that counts both sides in one walk.

**The generalisable step is one line of probe:** before writing a rule,
count its population in `applyRepairs(entry).entry`, not in `entry`. Two
of six rows in this batch died there.
