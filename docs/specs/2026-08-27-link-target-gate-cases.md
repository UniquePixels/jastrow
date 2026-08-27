# Two new link-target cases — batch 4's deferred repairs

**Status:** DRAFT 2026-08-27, ruled by Brian the same day (build both).
Extends [the batch-4 design](2026-08-26-anchor-paren-integrity-design.md)
§4 and the [transform module design](2026-08-22-transform-module-design.md)
§5. `link-target.ts`'s five existing cases are unchanged; nothing here
loosens one.

## 1. Why this exists

Batch 4 wrote two correct repairs the gate refuses, and deferred both
rather than weaken it (Brian, 2026-08-26). Each refusal is a **gap**,
not a verdict: in both, the evidence for the repair is present in the
entry's own input and the gate cannot reach it.

| Row | Entries | Refused because |
|---|---:|---|
| `unterminated-href-swallows-closing-tag` | **2** | the gate reads PARSED targets; the damaged tag parses to empty `href`/`data-ref`, so the bytes proving the repair are invisible |
| `tosefta-variant-chapter-halakha-loss` | **391** | case 4's 2026-08-24 tightening needs the tail's discarded prefix to be a prefix of the head; `Tosefta Shabbat 17` is not a prefix of `Tosefta Shabbat 16` |

They are different problems and get different cases. **Case 6 recovers;
case 7 mints.** Only case 7 is a policy change.

## 2. Case 6 — restored from the tag's own damaged bytes

**Shape.** A rule repaired an opening tag by DELETING a run that never
belonged inside it. It declares the pair; the gate re-inserts the run
and requires the result to be byte-identical to a run the input held.

**Declared as** `TransformResult.restored: { removed: string; written: string }[]`.

**The test, and every clause is load-bearing:**

1. `written` is the raw opening tag the rule emitted.
2. Inserting `removed` into `written` yields a byte-exact SUBSTRING of
   some field in this entry's own input.
3. **Exactly one insertion offset satisfies (2).** Ambiguity is a
   refusal, not a choice.

**Why it is safe, argued by construction rather than by population.**
Every character of `written` except the deleted run is pinned by input
bytes, in order, at a unique offset. The case cannot move a link to
another entry, cannot alter a locus, and cannot recover an address the
input did not spell out — it can only delete a declared run from bytes
the input already contains.

**Why it must read raw FIELD bytes, not parsed tags.** This is case 5's
lesson one level further out. Case 5 compares against parsed anchors'
`.tag`, which works for gershayim because those tags parse
`malformed: false`. A tag whose `href` swallowed a `</a>` does not parse
as a tag at all, so it appears in no anchor's `.tag`. Measured on
`D00478`: re-inserting `</a>` recovers an input substring at **exactly
one offset (54)** and nowhere else.

```
written : <a dir="rtl" class="refLink" href="/Jastrow,_כָּלוּל.1" data-ref="Jastrow, כָּלוּל 1">
input   : <a dir="rtl" class="refLink" href="/Jastrow,_כָּלוּל.1</a>" data-ref="Jastrow, כָּלוּל 1">
```

`J00597` needs no case: its intact twin puts both spellings in the
parsed target set, so case 1/2 already licenses it.

## 3. Case 7 — a locus corroborated by a sibling's display

**Shape.** A rule assembles a target from a head it already holds and a
tail taken from a SIBLING anchor, where the sibling's own display text
independently witnesses the tail.

**Declared as** `TransformResult.corroborated: { from: string; head: string; tail: string; target: string }[]`.

**The test:**

1. `head + tail === target`, with no gap and no character from elsewhere.
2. `head` is a target the input holds.
3. `tail` is a literal SUFFIX of `from`, a second target the input holds.
4. **The digits of `tail` occur in the display of an anchor carrying
   `from`.** This is the corroboration, and it is what case 4 lacks.

**This case MINTS.** `Tosefta Shabbat 16:6` occurs nowhere in the input.
Cases 1–3 and 5 cannot mint; case 4 can, which is why it was tightened.
Case 7 buys the ability back on a narrower warrant: two independent
witnesses in the entry's own input for the same digits.

### 3.1 The blast radius is measured, not argued

| Population | Licensed by case 7 |
|---|---:|
| Tosefta variant pairs (the intended target) | **414 of 414** |
| All other adjacent same-work chapter-only pairs in the corpus | **0 of 69** |

The 69 are the shape case 4's own blind-spot note warns about —
*"`Onkelos Deuteronomy 13:2` and `Onkelos Deuteronomy 1:13` together
license `Onkelos Deuteronomy 13:13`, a verse nothing cites"*. **Case 7
licenses none of them**, because the corroboration clause has no witness
there. That is the whole argument for clause 4, and it is a measurement.

### 3.2 What case 7 still cannot see

- **Which sibling.** The gate does not ask whether `from` is the anchor
  the rule REASONED about, only that some anchor carrying `from`
  witnesses the tail. A rule picking the wrong sibling produces a
  well-corroborated wrong address — the same limit case 4 carries for
  `head`, recorded rather than closed.
- **Digits, not structure.** Clause 4 compares digit runs, so a display
  witnessing `6` licenses `:6` whether print meant halakha 6 or
  something else numbered 6. The tosefta shape pins that by its own
  predicate; the gate does not.
- Both are why case 7 is a licence for a rule that already argued its
  population, never a substitute for that argument.

## 4. What ships with the cases

Two rules stop being deferred:

| Rule | Declares | Row resolved |
|---|---|---|
| `unterminatedHref` | case 6 | `unterminated-href-swallows-closing-tag` (2) |
| `toseftaPrimaryHalakha` | case 7 | `tosefta-variant-chapter-halakha-loss` (391) |

**`toseftaPrimaryHalakha` MUST register STRICTLY BEFORE
`toseftaCloseParen`.** `toseftaCloseParen` destroys `toseftaSplits`'s own
predicate, so the reverse order repairs 0 while `transform:count` still
reports 414 — green everywhere, nothing done. `rules/paren-boundary.ts`
states this; the order test must pin it.

**Two deliberate tripwires will fail, and that is them working.**
`paren-boundary.test.ts` pins the case-4 refusal message green ON THE
REFUSAL, and `malformed-href.test.ts` pins the gate's verdict on both
entries, each so that widening the gate breaks a test and sends whoever
widened it back to the docstring. Both must be **flipped to pin the new
licence**, never deleted, and each rule's docstring section recording
the refusal must be retracted in place rather than removed.

## 5. Verification

| Gate | Bar |
|---|---|
| Unit, per case | each clause refuses when violated — including case 6's uniqueness clause and case 7's corroboration clause |
| `transform:count` | `unterminated-href…` 2, `tosefta-variant…` **391 entries**; the six batch-4 rows unmoved |
| Registry | `toseftaPrimaryHalakha` strictly before `toseftaCloseParen`, pinned |
| `unaccountedEdges` | the `anchor-swallows-close-paren ~ tosefta-variant` deferral RESOLVES; its pinned output shrinks and the pin must be updated, not relaxed |
| Commutation | 35 rules; every non-commuting pair still declared |
| `body:migrate-dry` | 32,512/32,512, 0 schema failures, 0 quarantines |
| `pipeline-links.test.ts` | link accounting reported as a delta; **391 primaries gain a halakha, 0 addresses lost** |

## 6. Decision log

| Date | Who | Decision |
|---|---|---|
| 2026-08-26 | Brian | both repairs deferred; gate work becomes its own PR |
| 2026-08-27 | Brian | build both cases; case 7's minting accepted on the measured 414/414 and 0/69 |
