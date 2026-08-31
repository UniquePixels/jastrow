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

**Declared as** `TransformResult.restored: { field: string; offset: number; removed: string; written: string }[]`.

> **CORRECTED 2026-08-27 (fix/link-target-gate-cases).** This line read
> `{ removed: string; written: string }[]`, which is the shape before the
> witness binding and is no longer what `types.ts` declares. `field` and
> `offset` are the witness: without them clause 2 accepted a byte-exact
> match in *some* field, so a run appearing in a different field could
> license a repair made elsewhere. A cross-field fixture now pins the
> refusal.

**The test, and every clause is load-bearing:**

1. `written` is the raw opening tag the rule emitted.
2. Inserting `removed` into `written` yields a byte-exact SUBSTRING of
   some field in this entry's own input.
3. **Exactly one insertion offset satisfies (2).** Ambiguity is a
   refusal, not a choice.
4. **The recovered run sits where the claim says it does** — added
   2026-08-27 (`fix/link-target-gate-cases`), and the declaration
   gained `field` and `offset` to say so. Clause 2 as written above
   accepts a match in *some* field, so a run recovered from the
   headword licensed a repair made in a definition, and clause 3's
   offset was an offset into nothing in particular. The claim now
   cites the input field the repair happened in, verbatim, and the
   offset in it where the run begins; the gate requires the bytes to
   be exactly there, and requires the cited field to be the input
   counterpart of the field the repaired anchor came out of. Clauses 2
   and 3 are kept as they stand — every claim clause 4 admits they
   admit too, and clause 3 is the only statement that the gate
   declines to choose between two readings of one deletion.

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

```text
written : <a dir="rtl" class="refLink" href="/Jastrow,_כָּלוּל.1" data-ref="Jastrow, כָּלוּל 1">
input   : <a dir="rtl" class="refLink" href="/Jastrow,_כָּלוּל.1</a>" data-ref="Jastrow, כָּלוּל 1">
```

`J00597` needs no case: its intact twin puts both spellings in the
parsed target set, so case 1/2 already licenses it.

## 3. Case 7 — a locus corroborated by a sibling's display

**Shape.** A rule assembles a target from a head it already holds and a
tail taken from a SIBLING anchor, where the sibling's own display text
independently witnesses the tail.

**Declared as** `TransformResult.corroborated: { field: string; from: string; head: string; open: number; tail: string; target: string }[]`.

> **CORRECTED 2026-08-27 (fix/link-target-gate-cases).** This line read
> `{ from, head, tail, target }[]`, the shape before the witness binding.
> `field` and `open` cite the ONE anchor whose display does the
> witnessing — `open` being its opening-tag token index, unique within a
> field. Without them clause 4 accepted *any* anchor carrying `from`, so
> §3.1.1's claim that a minted target names the display it came from was
> false of the built gate. Reverting clause 4 to the old reading was
> measured to license a fixture the bound version refuses.

**The test:**

1. `head + tail === target`, with no gap and no character from elsewhere.
2. `head` is a target the input holds.
3. `tail` is a literal SUFFIX of `from`, a second target the input holds.
4. **The digits of `tail` occur in the display of an anchor carrying
   `from`.** This is the corroboration, and it is what case 4 lacks.

**And, since 2026-08-27, a clause about the DECLARER rather than the
declaration:** the rule that declared the claim must be on the gate's
`CORROBORATION_DECLARERS` allowlist, which holds
`tosefta-variant-chapter-halakha-loss` alone. It is checked first and
reported instead of the four, because a claim from an unlisted rule is
not a claim to be fixed. §3.1.1 states why the case has this and no
other case does.

**CORRECTED 2026-08-27 (`fix/link-target-gate-cases`)**, in clause 4 and
in the declaration above it. Clause 4 as written says *an* anchor, and
the declaration named no anchor at all, which made §3.1.1's attribution
claim untrue of the built gate. `corroborated` now carries
`{ field: string; from: string; head: string; open: number; tail: string; target: string }`:
`field` is the input field the rule read, verbatim, and `open` is the
opening-tag token index within it of the anchor whose display the rule
read. Clause 4 becomes: **the cited anchor carries `from`, and the digits
of `tail` occur in THAT anchor's display.** §3.1.1 states what this does
and does not buy.

**This case MINTS.** `Tosefta Shabbat 16:6` occurs nowhere in the input.
Cases 1–3 and 5 cannot mint; case 4 can, which is why it was tightened.
Case 7 buys the ability back on a narrower warrant: two independent
witnesses in the entry's own input for the same digits.

### 3.1 The blast radius, corrected

> **CORRECTED 2026-08-27, before any code was written.** This section
> read *"All other adjacent same-work chapter-only pairs in the corpus:
> **0 of 69**"*, and concluded that case 7 licenses none of the shape
> case 4's blind-spot note warns about. **That was wrong, and it was my
> measurement error, not a change in the design.** The comparison
> population was built with a stem function that stripped a different
> amount from `Work C` than from `Work C:V`, so it was nearly empty and
> measured zero trivially. The implementer refused to build on it and
> re-measured. Recorded here rather than silently replaced, because the
> ruling of 2026-08-27 was taken on the wrong number.

| Population | Licensed by case 7 |
|---|---:|
| Tosefta variant pairs (the intended target) | **414 of 414** — reproduces exactly, on both the `data-ref` and `href` sides |
| Structurally analogous same-work pairs, tosefta excluded | 96 found, **68 actually mint, 29 of those 68 licensed** |

**The counter-example, verified end to end.** `S00188` holds two
adjacent anchors — `data-ref="Exodus 24"` (display `B'shall. 24`) and
`data-ref="Exodus 15:25"` (display `Ex. XV, 25`). The claim
`{from: "Exodus 15:25", head: "Exodus 24", tail: ":25", target: "Exodus 24:25"}`
clears all four clauses, and the `href` side clears identically.
**Exodus 24 has 18 verses; `Exodus 24:25` is not a verse.** Twenty-eight
more share the shape.

**Why clause 4 cannot separate the families.** Jastrow routinely renders
a Sefaria `Work C:V` anchor as `Abbr. <roman chapter>, <arabic verse>`,
and that arabic verse *is* the tail's digit run. So the corroborating
witness is present **by default** across the whole same-work family, not
only in the tosefta shape. `XVII), 6` and `Ex. XV, 25` are
indistinguishable to a digits-only test. What actually separates them is
semantic — in `Tosef. Sabb. XVI (XVII), 6` the halakha is shared by both
recensions, so it belongs to the primary — and §3.2 already concedes the
gate cannot see that.

No structure-free strengthening of clause 4 reaches zero: standalone-token
digits, "no other digit run in the display", and "head display carrying no
arabic digits" were each tried and each still licenses `Exodus 24:25`. The
only predicate that separates the families is `VARIANT_DISPLAY`, which is
the rule's own — and a gate whose predicate is the rule's can no longer
catch a rule that widened its own.

### 3.1.1 Why it ships anyway — ruled 2026-08-27 (Brian)

> **CORRECTED 2026-08-27 (`fix/link-target-gate-cases`): this read
> *"**Live exposure today is zero.** A gate case is a LICENCE, not an
> instruction: nothing is minted unless a rule declares it. Only
> `toseftaPrimaryHalakha` declares case 7, and its own predicate never
> fires on any of the 68. The cost is latent, and it is the same kind
> of cost case 4's blind-spot list already documents and accepts."***
> Every sentence of that is still true of 27 August 2026 and none of it
> is a property of the GATE. A local CodeRabbit review, rated Major,
> put it exactly: *"Live exposure today is zero" only describes August
> 27, 2026. It does not protect future rule declarations or changes to
> `toseftaPrimaryHalakha`. Restrict Case 7 to the measured rule and
> population, or add a semantic invariant that rejects `S00188`.
> **Attribution does not replace correctness.*** That is correct. A
> registry fact was doing a gate's work: any rule added below could
> declare case 7 and reach all 29, and nothing would have said so.
> Recorded rather than silently replaced, because the argument that was
> ruled on is not the argument that ships.

**What holds the residue at zero now: an allowlist of declaring rule
ids.** Two implementers searched for a structure-free clause that
rejects `S00188` and neither found one — §3.1 lists the three that were
tried — so the gate cannot separate the families on evidence. Ruled
2026-08-27 (Brian): bind case 7 to the rule ids measured against the
population instead. `CORROBORATION_DECLARERS` in `link-target.ts` holds
one id today, `tosefta-variant-chapter-halakha-loss`; a `corroborated`
claim from any other rule is REFUSED before a single clause of it is
read, however perfect the claim. Adding an id is a deliberate edit to a
documented constant, which is exactly the review moment that was
missing: the reviewer's instruction, stated beside it, is to measure the
new rule's OWN predicate against the same 68-pair population first.

The residue is therefore zero, and stays zero without depending on what
the registry happens to hold. The cost is stated where it is paid: **case
7 is the only case in the gate that knows a rule's name**, and every
other case is stated purely on evidence the entry holds. What would let
the allowlist go is a clause that discriminates on STRUCTURE rather than
on digit runs, measured at 0 of the 68.

**What the allowlist does NOT do.** It bounds who may reach the licence,
not what the clauses license. Inside the list the measurement stands
unchanged: `toseftaPrimaryHalakha` is held off the 29 by its own
`VARIANT_DISPLAY` predicate and by nothing in this gate, so widening that
predicate onto the same-work family would still be agreed with. That is
why the `Exodus 24:25` fixture still asserts an ACCEPT, now declared by
the allowlisted rule.

The honest statement of what case 7's four clauses buy is therefore
narrower than §3 first claimed: they do not make minting safe in general.
They make minting **attributable**. Bounding the case to a measured
declarer is what makes it safe, and the two are different mechanisms.

> **CORRECTED 2026-08-27 (fix/link-target-gate-cases): this read
> *"every minted target must name the two input targets and the
> witnessing display it came from, so a wrong mint is a wrong claim
> with a rule's name on it rather than an anonymous fabrication."***
> That was false as built, and it is the sentence the ruling above was
> taken on. `TransformResult.corroborated` carried
> `{from, head, tail, target}` — four strings and no anchor — so a
> claim named a target STRING, never a display; and clause 4 accepted
> the tail's digits from ANY input anchor carrying `from`. In an entry
> citing one address twice, the digits could come from a sibling the
> rule never read, and the declaration recorded nothing that would say
> so afterwards. Recorded rather than silently replaced, because the
> gap is the reason the declaration changed.

**What the declaration pins now.** `corroborated` carries
`{field, from, head, open, tail, target}`, and a minted target must name:

- `head` and `from`, both targets the entry's own input holds, with
  `head + tail === target` exactly and `tail` a literal suffix of `from`;
- **one input anchor**, cited by the bytes of the field it was read from
  and its opening-tag token index within that field. Token indices are
  unique per anchor, so the pair resolves to exactly one anchor, and the
  field must be one this entry's input actually holds;
- that anchor must **carry `from`**, and it is **that anchor's display**
  — not any other anchor's — whose digits must witness the tail. On the
  `href` side `from`'s spelling is read off the cited anchor too.

**What it still does not pin, said plainly.** The gate cannot ask whether
the cited anchor is the sibling the rule *should* have read: a rule that
consistently cites the wrong neighbour produces a well-corroborated wrong
address, and §3.2's first bullet stands unchanged. `head` is still
uncited — its `href` spellings are gathered from every anchor carrying it
— so the same limit applies to the head half of every claim. Clause 4
still compares digit runs rather than structure, so `Exodus 24:25` is
licensed exactly as §3.1 measures. What changed is not the reach of the
case but the accountability of a claim: the witness is now a NAMED anchor
rather than an unnamed one, so a wrong mint is a wrong claim with a
rule's name and a specific anchor on it.

### 3.2 What case 7 still cannot see

- **Which sibling.** The gate resolves the ONE anchor the claim cites
  (`field` + `open`), requires THAT anchor to carry `from`, and reads
  the tail's digits off THAT anchor's display and no other. What it
  still cannot ask is whether the cited anchor is the sibling the rule
  *should* have read: a rule that consistently cites the wrong neighbour
  produces a well-corroborated wrong address — the same limit case 4
  carries for `head`, which stays uncited, recorded rather than closed.

  > **CORRECTED 2026-08-27 (fix/link-target-gate-cases): this read
  > *"The gate does not ask whether `from` is the anchor the rule
  > REASONED about, only that some anchor carrying `from` witnesses the
  > tail."*** True of the shape this spec first declared; false of the
  > gate that shipped. `witnessOf` resolves the single anchor named by
  > `field` and `open`, `claimFault` refuses a claim whose cited anchor
  > does not carry `from`, and only that anchor's display reaches
  > `pairFault`. The limit that survives is narrower and is stated
  > above; §3.1.1's closing paragraph states it too.
- **Digits, not structure.** Clause 4 compares digit runs, so a display
  witnessing `6` licenses `:6` whether print meant halakha 6 or
  something else numbered 6. The tosefta shape pins that by its own
  predicate; the gate does not.
- Both are why case 7 is a licence for a rule that already argued its
  population, never a substitute for that argument — and since
  2026-08-27 that is enforced rather than advised: the declarer
  allowlist admits only rules whose population has been argued and
  measured (§3.1.1).

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
| Case 7's allowlist | an otherwise-perfect claim (four clauses satisfied, witness correctly cited) from a rule not on `CORROBORATION_DECLARERS` is REFUSED, and refused on the licence rather than on a clause; mutation-tested — deleting the check makes that fixture pass |
| `transform:count` | `unterminated-href…` 2, `tosefta-variant…` **391 entries**; the six batch-4 rows unmoved |
| Registry | `toseftaPrimaryHalakha` strictly before `toseftaCloseParen`, pinned |
| `unaccountedEdges` | the `anchor-swallows-close-paren ~ tosefta-variant` deferral RESOLVES; its pinned output shrinks and the pin must be updated, not relaxed |
| Commutation | 35 rules; every non-commuting pair still declared |
| `body:migrate-dry` | 32,512/32,512, 0 schema failures, 0 quarantines |
| `pipeline-links.corpus.test.ts` | link accounting reported as a delta; **391 primaries gain a halakha, 0 addresses lost** |

## 6. Decision log

| Date | Who | Decision |
|---|---|---|
| 2026-08-26 | Brian | both repairs deferred; gate work becomes its own PR |
| 2026-08-27 | Brian | build both cases; case 7's minting accepted on a measured 414/414 and a **wrong** 0/69 |
| 2026-08-27 | Brian | re-ruled after §3.1's correction to 29/68: ship anyway — live exposure is zero, and the case makes minting attributable rather than safe |
| 2026-08-27 | CodeRabbit (local), Major | *"Live exposure today is zero" only describes August 27, 2026. It does not protect future rule declarations or changes to `toseftaPrimaryHalakha`. Restrict Case 7 to the measured rule and population, or add a semantic invariant that rejects `S00188`. **Attribution does not replace correctness.*** Accepted: the row above rests on a registry fact, not on a property of the gate |
| 2026-08-27 | Brian | bind case 7 to an ALLOWLIST OF DECLARING RULE IDS — today `tosefta-variant-chapter-halakha-loss` alone. A `corroborated` claim from any other rule is refused until someone adds that id deliberately, which is the review moment that was missing. Residue zero, and it stays zero. Accepted cost, stated in the code: case 7 is the only case that knows a rule's name; a structure-discriminating clause measured at 0 of 68 would remove it |
