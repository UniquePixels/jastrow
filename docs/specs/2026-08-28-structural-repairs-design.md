# Structural repairs — phase wiring, the loss gate, and batch 6b's two rules

**Status: design, 2026-08-28.** Phase 2 batch 6b. Scope ruled by Brian
the same day: wire the dormant `structural-repairs` phase and add the
text-loss gate, prove both with the two small rules, publish the
`empty-stem-section` audit — and leave `stranded-stem-head` (582 occ /
575 ent) to its own PR, where the whole risk is concentrated.

Batch 6a's report is the immediate ancestor:
[`transform-batch-6a.md`](../v2/transform-batch-6a.md). The transform
contract itself is
[`2026-08-22-transform-module-design.md`](2026-08-22-transform-module-design.md).

## 1. Why the phase has stayed empty, and what wiring it means

`admin/pipeline/patch/apply.ts:56-57` has carried
`structural-repairs` in the committed phase manifest since Phase 1,
and `migrate-dry.ts:294` runs it as `() => undefined`. A rule
registered for that phase would therefore never execute — silently —
so `assertNoStructuralRules` throws the moment `RULES` grows one,
naming this batch.

Wiring it is three things:

1. `processEntry` runs `applyTransforms(entry, 'structural-repairs')`
   in the phase slot, with the same `TransformFailure` containment the
   `text-repairs` half already has, and pushes the records onto the
   report.
2. `assertNoStructuralRules` inverts into
   `assertStructuralPhaseWired`: the guard that caught a rule with no
   phase to run in now catches a phase with no rule — a state that
   would pass every other test in the suite while quietly reverting
   the wiring.
3. The gates that run per rule in `run.ts` gain a fourth
   (§2), because the three existing ones cannot see what a structural
   rule is most likely to get wrong.

**Ordering is already decided and is not ours to revisit.**
`structural-repairs` runs AFTER `text-repairs` — every rule in `RULES`
today has already run when the first structural rule sees the entry.
Both populations below were therefore measured on
`applyTransforms(applyRepairs(source).entry, 'text-repairs').entry`,
not on raw source (batch 6a's lesson: measure where the rule will
actually stand).

## 2. The loss gate

### 2.1 What the three existing gates cannot see

`checkNoNewText` is a **sub-multiset** test: it reports codepoints the
output holds *beyond* the input's. Deletion is therefore invisible to
it by construction — a rule that empties a definition passes. So does
`checkMarkup`, whose delta is about well-formedness, and
`checkLinkTargets`, which reads only anchor targets.

That hole is tolerable for a rule that rewrites a glyph inside one
field. It is not tolerable for a rule that moves text *between* fields
or *between senses*, because there the difference between "moved" and
"dropped" is the entire correctness question — and
`stem-head-marker-chop`'s own record says 3 of its 28 members hold
real text a delete-the-marker rule would destroy.

### 2.2 The gate

`checkNoLostText(before, after, removes)` mirrors
`checkNoNewText` exactly: codepoints the INPUT holds beyond the
output's, minus a declared allowance, over the same `fieldsOf` walk and
the same `stripTags`. Empty means the rule dropped nothing.

`TransformResult.removes` is the mirror of `allows`: a per-call
declaration of text this call deleted on purpose, verified to occur in
the INPUT and credited as a multiset, so declaring one deletion
permits exactly one.

### 2.3 It is enforced for `structural-repairs` only, and the reason is measured

**10 of the 39 rules shipped before this batch delete text**, composed
in registry order over all 32,512 entries:

| Rule | Entries | Codepoints |
|---|---:|---:|
| `ascii-quote-as-gershayim-in-body` | 1,386 | 2,125 |
| `parenthesized-alt-headword` | 579 | 1,152 |
| `em-dash-section-break-in-own-italic` | 270 | 508 |
| `phrase-alt-headword-stub` | 228 | 236 |
| `emphasis-run-edge-space` | 214 | 229 |
| `gender-pair-headword-line-collapse` | 22 | 196 |
| `shuruk-as-yod-display-corruption` | 12 | 12 |
| `trailing-whitespace-definition` | 10 | 10 |
| `abbrev-fused-headword` | 4 | 4 |
| `unterminated-href-swallows-closing-tag` | 1 | 32 |

An eleventh joined them in this batch: `asterisk-stem-label` (§4), 3
entries / 6 codepoints, which declares `removes` although nothing in
its phase reads the declaration. Total 4,510.

Most are substitutions the multiset reads as a deletion plus an
addition — `"` → `״` is 2,125 of the 4,510 — and the rest are
deliberate: parentheses the row exists to strip, redundant spaces,
the damaged tag's own bytes.

Turning the gate on globally would therefore mean retrofitting a
`removes` declaration onto ten shipped rules in the same PR that
introduces the gate. Instead:

- **`structural-repairs` rules are gated.** Zero undeclared deletion.
- **`text-repairs` rules keep their three gates**, and every deletion
  above is PINNED by a corpus test at its exact counts
  (`body/deletion-baseline.corpus.test.ts`), so a twelfth rule that
  starts deleting — or an existing one that deletes more — fails a
  test rather than passing unremarked. The mechanism proved itself
  immediately: the table was written at ten, and this batch's own
  stray-period rule failed it into eleven.

That is the "record rather than imply coverage" doctrine
`link-target.ts` established: a gate with a stated boundary beats a
gate whose silence is mistaken for coverage.

## 3. Rule 1 — `stem-head-marker-chop` (18 of 28)

### 3.1 The defect

A numbered sense `1)` ends with a bare `—2)` marker and nothing after
it; the text that marker introduces sits in the next sibling, which
carries no `number` at all. Measured after the full `text-repairs`
run: **18 members, every one of them ending in the exact byte run
`—2) `**, 17 nested inside a stem block and 1 at top level, and in no
case does the sibling carry a `grammar` block.

The row's `reason` records the trap: dropping the "and nothing after
it" clause finds **28**, and of the 10 extra, 7 are duplicated-token
residue and **3 are stranded real text that a delete-the-marker rule
would destroy**. The rule therefore takes only the empty-residue 18
and refuses the rest; the 10 stay in the row for a later ruling.

### 3.2 The repair, and why it invents nothing

The marker MOVES from the tail of sense `1)`'s definition into the
sibling's `number` field:

```
before  1)  "… v. supra.—2) "        next  number: null   "to grow strong…"
after   1)  "… v. supra."            next  number: "—2)"  "to grow strong…"
```

`—2)` is the corpus's own spelling of a second sense marker — **3,985
`number` fields already hold exactly that string** — so the rule
writes a value the model already carries rather than a new convention.
`fieldsOf` walks `sense.number`, so the move is text-neutral to
`checkNoNewText` and to the new loss gate alike.

**One space is genuinely deleted** — the marker's trailing space — and
it is declared through `removes: [' ']`. Leaving it would grow
`trailing-whitespace-definition`'s (10) population by 18, which is the
population-collision failure batch 3b found the hard way.

### 3.3 Phase

`structural-repairs`. The rule re-attaches a sense's own marker to the
sense it introduces; that is structure, not typography, and it gives
the newly wired phase a real user rather than a fixture.

## 4. Rule 2 — the stray-period stem label (3)

`asterisk-stem-label` (69) splits into five sub-shapes of which only
one is mechanical: a valid binyan label carrying a stray trailing
space-period — `"Pa. ."` ×2 and `"Af. ."` ×1, all three surviving the
full `text-repairs` run. The repair drops the two characters, leaving
`"Pa."` / `"Af."`, and declares `removes: [' .']`.

Phase: `text-repairs` — it rewrites one field's value and moves
nothing.

**The other 66 do not ship**, and §5 of the batch-6a report states
why: 47 turn on the reconstruction siglum, which the v2 schema cannot
express on a stem form (`stems[].forms` are plain strings, and
`stems[].stem` is `required` with `minLength: 1`), 10 are a delimiter
torn off the block's own text — a population that may belong to
`stranded-open-bracket` — and 9 are print section heads that are not
stem sections at all.

**So the row is RE-SCOPED 69 → 3 and the 66 become a new `judgment`
row, `stem-label-not-a-binyan-name`.** Registering a 3-of-69 rule
against the whole row would have been the cheaper edit and the wrong
one: `coverage()` reads a row as registered the moment any rule claims
its id, so 66 live defects would have left the queue in silence. The
precedent is batch 4, where
`superscript-subsection-contradicts-link-sub-section` was split off as
`judgment` from birth.

`stem-head-marker-chop` gets the same treatment for the same reason:
its 10 residue-bearing members become `chopped-marker-with-residue`
(judgment, 10), since the shipped rule's 18 would otherwise retire
them. Two new `judgment` rows, one principle — **a partial rule must
not take its row's unrepaired remainder off the queue.**

## 5. `empty-stem-section` (342) — audit, not a rule

The row was catalogued with no `reason`. This batch derives one.

**The shape is 100% uniform.** All 347 sections are top level, carry a
`verbal_stem` and at least one real form, have no definition and no
child senses, are followed immediately by another stem block — never
by a plain sense, never last in the entry — and **every one of them
ends its `binyan_form` array with an empty slot**. Two empty sections
never sit adjacent.

That empty trailing slot is the mechanism: the print sets a shared
heading, `Pa. בַּהַית, Af. אַבְהֵית to put to shame`, and the parser
split it at the comma. The label before the comma became its own
block with nothing after it; the gloss stayed with the last member of
the group. The empty slot is the residue of the split — and it is
already dropped, corpus-wide, by `repairs.ts`'s `cleanBinyanForms`
(batch 6a).

**Nothing is lost, and the reader is shown what print shows.**
`dry-run.ts:193 buildStem` maps the block to
`{forms, senses: [], stem}`, so the label and the form both reach
`BodyStem`; the schema permits an empty `senses` array. The next
block's own text opens with a normal italic gloss in 275 of 347, a
comma seam in 29, and something else in 43.

**No repair is available that does not invent.** Duplicating the
group's gloss onto each member invents text. Merging the members into
one block needs a joining string (`" a. "` — a spelling the corpus does
carry, in `"Hithpa. a. Nithpa."` ×7 and two others) which is text the
input does not hold at that point, and it would erase the distinction
between a heading print wrote as one and a heading print wrote as
several. Expressing the sharing structurally needs a model that has a
way to say "these stems share a gloss", which `entry.schema.json` does
not have.

**Recommendation: withdraw to `judgment`** with this audit published,
in the shape of batch 5's `abbrev-headword-stub` withdrawal — because the open question is a
model question and a per-entry reading, not a missing predicate. The
alternative is `discarded`, which would claim there is no defect at
all; that is not established, since a reader meeting a bare `Pa.
בַּהַית` cannot tell it shares the next gloss.

## 6. What none of this can see

- **The loss gate is scoped.** A `text-repairs` rule may still delete
  freely; only the pinned table in §2.3 would notice, and only in
  aggregate.
- **`removes` is a claim, not a proof.** The gate verifies the
  declared string occurs in the input and credits it once; it cannot
  tell whether deleting it was right.
- **The chop rule reads one sibling.** Where a chopped `—3)` follows a
  chopped `—2)` in the same run — `P00816` — only the first is
  repaired, and the entry keeps a second unnumbered sibling.
- **Nothing here measures the print.** Every claim about what Jastrow
  set is an inference from the corpus's own regularities.
