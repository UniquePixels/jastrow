# Case 10 — an anchor minted around an anaphor, targeted by copy

**Status:** RULED IN by Brian 2026-09-06 and **BUILT the same day**
with `MINT_DECLARERS` empty, so live exposure is zero until a rule is
ruled in separately. Extends [the batch-4 gate
cases](2026-08-27-link-target-gate-cases.md), [case
8](2026-08-31-link-target-gate-case-8.md) and [case
9](2026-09-01-link-target-gate-case-9.md). `link-target.ts`'s nine
existing cases are unchanged; nothing here loosens one.

## 1. Why this exists

[Sizing the unlinked `Ib.` predicate](../v2/phase-2-unlinked-ib.md)
found 2,819 bare anaphors standing as plain text, 2,118 of them
resolvable by the walk `ibAnaphora` already ships, and the walk
validated at 99.9% place-accuracy against an 1,859-case control.

The gate refuses all of them, and **not for want of evidence about the
target.** `checkValue` returns clean the moment
`input.targets.has(value)` (`link-target.ts:2047`), and a minted
anchor's target is copied byte-for-byte from an anchor the same entry
already holds. Case 1 covers it. Two of the three transform gates are
already satisfied:

| Gate | Verdict on a minted anaphor anchor |
| --- | --- |
| `no-new-text` | **passes.** `textOf` strips tags; the display text is unchanged, the multiset does not move, no `allows` is needed |
| `markup` | **passes.** A matched `<a>…</a>` adds one open that is popped and one close that pops; neither "never popped" nor "popped nothing" increases |
| `link-target` | **fails**, at the count invariant alone: `anchor count grew N → M` (`link-target.ts:2207`) |

So the refusal comes entirely from one counting invariant, and that
invariant is a **scope ruling written into code**, not a safety
theorem. Its own docstring says so: *"anchors never grow (batch 2
creates no links; §1's ruling is enforced in code, not left to rule
authors)"*.

### 1.1 What the batch-2 ruling actually decided

[Link transform design](2026-08-22-link-transform-design.md) §1 gave
three reasons for *batch 2 is retarget only*. Two of them do not reach
this case:

| Batch-2 reason | Reaches a minted anaphor anchor? |
| --- | --- |
| "A rule creating those links writes target addresses nothing in the repository can check" | **No.** The address is an anchor of the same entry, present in the input, checked by `checkValue` like every other target |
| "Composing an address the source never held is inference, not movement" | **No.** Nothing is composed. The `data-ref` and `href` are copied whole; this is the same copy `ibAnaphora` performs today, on a different span |
| "Show only what Jastrow linked" (body model, decision log 2026-08-05) | **Reaches it, and a precedent already answers most of it.** §7 |

That third one is the one to read carefully, and reading it turns out
to settle more than expected — see §7.

## 2. The shape

A rule wrapped a bare anaphoric token — text the input carried outside
any anchor — in a new anchor whose `data-ref` and `href` are copied
verbatim from **one named anchor of the same entry's input**.

**Declared as**
`TransformResult.minted: { display: string; field: string; from: number; target: string }[]`.

- `target` — the `data-ref` written on the new anchor.
- `display` — the display the new anchor wraps, verbatim.
- `field` — one of this entry's own INPUT fields, verbatim.
- `from` — the token index, in that field's own input tokenization, of
  the opening tag of the anchor the target was copied from.

`field` + `from` name exactly one input anchor, the same identification
case 7's witness uses and for the same reason: before 2026-08-27 case 7
named only a string, and any anchor carrying it could supply the
evidence the rule never read.

One claim licenses one new anchor. Claims are matched to output anchors
by `target === anchor.dataRef` **and** `display === anchor.display`;
the count clause (§3.6) is what caps the licence.

## 3. The clauses

All fail-closed. A claim satisfying fewer than all of them licenses
nothing.

1. **The declaring rule is on the allowlist.** `MINT_DECLARERS`,
   empty until a rule is ruled in. Case 7's inheritance, and not
   optional: a case that lifts a counting invariant must not be
   reachable by a rule nobody reviewed for it.

2. **The display is an anaphor.** `display`, **trimmed**, must be
   exactly `Ib.` or `ib.` — the same closed set `anaphora.ts`'s
   `ANAPHOR` matches on the anchored side. Nothing else. `Ibid.` and
   `ibid.` are DELIBERATELY EXCLUDED: 17 occurrences corpus-wide, none
   sized, and a licence nobody has measured is a licence not to grant.

3. **The display was bare text.** `display` must occur in `field`,
   verbatim, **outside every anchor of that field's input** — the same
   masked reading `gapBetween` performs. This is what makes it a MINT
   rather than a re-wrap: a rule cannot claim this case for text it
   lifted out of an existing anchor.

4. **The target is copied whole from the named anchor.** The anchor at
   token index `from` of `field`'s input tokenization must exist, be
   usable (not `malformed`, not `interior`, closed), and its `dataRef`
   must equal `target` **byte for byte**. The `href` spelling is
   tested the same way against the minted anchor's own `href`. No
   prefix, no composition, no truncation — cases 3, 4 and 7 exist for
   assembled targets and this case admits none of that.

5. **The source anchor precedes the mint.** That anchor's `close`
   token index must be less than the token index at which `display`
   was found. Directional and structural.

   **THE GATE DELIBERATELY DOES NOT REQUIRE IT TO BE THE NEAREST.**
   "The nearest preceding anchor that is a citation, is not a
   `Jastrow, …` cross-reference, and has no unanchored citation
   between it and the anaphor" is the RULE's judgement — three
   semantic clauses `anaphora.ts` owns and re-derives from text. A
   gate that adopted them would rubber-stamp any later widening of
   them, which is precisely the failure case 7 records for
   `VARIANT_DISPLAY`: *a gate whose predicate is the rule's can no
   longer catch a rule that widened its own.* §4 measures what
   declining to adopt them costs.

6. **The count reconciles, in both directions.** The invariant becomes

   ```text
   source.length − output.length  ===  (unlinks ?? 0) − minted.length
   ```

   replacing the unconditional `removed < 0` refusal. For every rule
   in the registry today `minted` is absent, so the equation reduces
   to `removed === unlinks` and a shrinking count still fails as a
   count mismatch — **behaviour for all existing rules is byte
   identical**, which is the condition for shipping this without
   re-auditing forty rules.

7. **No undeclared anaphor anchor appears.** The number of output
   anchors whose trimmed display is in clause 2's set, minus the same
   count over the input, must equal `minted.length`.

   Clause 6 alone does not give this. A rule that unlinks one anchor
   and mints one nets to zero and would pass the equation declaring
   nothing at all — which is the *delete-one, create-one* entry on
   this gate's own blind-spot list. Clause 7 closes it whenever the
   minted anchor is an anaphor and the deleted one is not, which is
   every shape this case is for. §5.2 records what it still does not
   close.

## 4. Blast radius, measured

The question every case must answer: **how many targets other than the
intended one do the clauses license?** Measured at the 2,819 mint sites
of the sized population, after `applyRepairs`.

| Clause set | Spans a rule may wrap | Targets it may write | Licensed pairs |
| --- | --- | --- | --- |
| target ∈ input targets, only | every bare word: **mean 145, median 101, max 1,472** per entry | every target the entry holds: **mean 29.7, median 22, max 166** | **≈ 4,300 per entry** |
| \+ clause 2 (anaphor display) | 1 | mean 29.7 | ≈ 30 |
| \+ clause 5 (preceding, same field) | 1 | **mean 9.1, median 6, max 78** | **≈ 9** |

**The clauses take the licence from about 4,300 to about 9, and not to
1.** That is stated plainly because the temptation is to close the last
factor of nine with clause 5's "nearest" variant, and §3.5 explains why
the gate must not.

What covers the residual nine is what covered case 7's: **attribution,
not safety**. A wrong mint must name the input anchor it copied from,
cited by field and token index, so it is a wrong claim with a rule's
name on it rather than an anonymous fabrication. The correctness of
choosing among those nine belongs to the rule and to
`anaphora.corpus.test.ts`, exactly as case 8 puts headword existence in
`v-sub-twin.corpus.test.ts` rather than in the gate. Neither half is
sufficient alone — see [[feedback_vacuous_gates]].

### 4.1 What the rule would actually write

Independently measured, so the case is ruled on its real exposure and
not on its theoretical one. The walk `ibAnaphora` already ships,
applied at the 2,819 sites:

| | |
| --- | --- |
| resolvable (a usable antecedent, no intervening unanchored citation) | **2,118** |
| declines | 701 |
| scored against the linker on 1,859 known-answer anchored anaphors | **1,857 same place, 2 different** |

The two are `A01334` (`Mishnah Sukkah 1:1` against `Sukkah 55b:14`, a
genuine miss) and `V00899` (`Pesikta Rabbati 27-28` against `27:1`, a
range against a segment).

Exact-string agreement is only **52.2%**, and the gap is not error:
Sefaria addresses a segment where Jastrow cites the daf, so the walk
names `Sanhedrin 78b:12` where the linker named `78b:11`. **A rule
under this case gets the right page and inherits the antecedent's
line.** That is the correct reading of a bare `Ib.` and is what
`ibAnaphora` already ships — recorded here so it is a known property
rather than a later surprise.

## 5. What this case does NOT cover

### 5.1 Deliberate exclusions

- **Minting an ADDRESS.** Every character of `target` is copied from
  one named input anchor. The never-linked family — `Y. <tractate>`
  (893 across 768 entries), Tanhuma, Sifra, Pesikta d'Rav Kahana —
  mints a work name the corpus attests zero times and is untouched by
  this case. It needs the batch-2 §1 deferral answered on its own
  terms, plus a Sefaria index in `data/`.
- **`Ibid.`** — 17 occurrences, unsized (§3.2).
- **Any display but a bare anaphor.** An anaphor carrying its own
  locus (`Ib. 35ᵃ`, `Ib. V, 1`) resolves correctly already and is not
  a defect.

### 5.2 The blind spot clause 7 leaves open

A rule that **unlinks one anaphor anchor and mints another** nets to
zero on both the total count and the anaphor count, and passes
declaring nothing. Closing that needs anchor IDENTITY reconciliation —
matching output anchors to input anchors across a rewrite — which no
case here does today and which retargeting rules would make expensive.

Recorded rather than fixed, and it is strictly narrower than what the
blind-spot list already carries: today *any* delete-one/create-one
pair passes silently; after clause 7 only the anaphor-for-anaphor pair
does.

## 6. What shipped with the case

All five, 2026-09-06:

1. `TransformResult.minted` in `types.ts`, documented to the standard
   of `corroborated` and `vouched` — the clauses, what the case cannot
   see, and where the correctness half lives.
2. `MINT_DECLARERS` in `link-target.ts`, **empty**, with a docstring
   naming the three things a reviewer must measure before adding an
   id.
3. Clause 6's equation replacing the two count branches, and clause
   7's anaphor reconciliation. `mintCountFault` **preserves both
   pre-case-10 wordings verbatim** for a mint-free rule; the first cut
   did not, and four existing fixtures caught it. That is what makes
   "behaviour for all existing rules is unchanged" a claim about the
   messages as well as about pass/fail.
4. Fourteen gate fixtures — one per clause, each asserting the
   specific message with that clause alone broken, plus a positive
   control that a well-formed claim clears clauses 2-7 and another
   that the three pre-case-10 count messages are byte identical.
5. **No rule.** The case is a licence, not an instruction.

One thing the build added that this spec did not anticipate:
`checkMintClauses` is **exported**, because an empty
`MINT_DECLARERS` makes clause 1 the only case-10 behaviour reachable
through `checkLinkTargets` and no fixture could otherwise reach
clauses 2-7. The alternative was seeding the allowlist with a test id,
which widens the licence for a test's benefit. Clause 1 is still
tested through the public entry point.

## 7. The body-model question, and the precedent that mostly answers it

The invariant this case lifts encodes a body-model principle rather
than a safety property:

> **show only what Jastrow linked** — entry-body-model design, decision
> log 2026-08-05.

Read in isolation that looks like a refusal. Read at its source it is
not. `docs/v2/body-review/02-orphan-refs.md` splits the orphan refs
into three classes and the maintainer ruled each separately:

| Class | What it is | Ruling, 2026-08-05 |
| --- | --- | --- |
| 2 — "resolved-but-unlinked ibid citations" (5 items) | Jastrow printed the citation; nothing anchored it | **"ALL Approved"** — *wrap in `<cite ref>`* |
| 3 — "unexplained, eyes-on" (3 items) | a ref with no in-body basis at all | **"ALL Remove"** — *"I believe these were added as links through the Sefaria interface by a user … we are only concerned with showing what Jastrow linked"* |

`[sev:med conf:high]` **The principle governs baseless refs, not
unanchored citations.** It was written in the Class 3 row, about refs
with no textual basis, and in the same review the maintainer approved
wrapping unlinked ibids — `Ib. 88ᵇ` (P00331), `ib. XXI, 18` (P01404),
`ib. 85ᵇ` (S01230). Wrapping an `Ib.` Jastrow wrote is therefore
already settled as *showing what he linked*, not adding to it.

### What the precedent does not settle

The Class 2 items differ from this case's population in two ways, and
only one of them matters:

- **They carry their own locus** (`Ib. 88ᵇ`), where this case's
  population is bare by clause 2. Immaterial to the principle: the
  question the ruling answered was whether the wrap is legitimate at
  all, and `Ib.` is Jastrow's citation either way.
- **Their resolution came from the old `refs` value.** That source no
  longer exists — `refs[]` is dropped from v2 truth (body model §5,
  B7) — which is *why* the antecedent copy is the available method
  now, not a weakening of the precedent. And the antecedent copy is
  strictly more conservative than reading `refs`: it is entry-local
  movement of bytes the entry displays, which is the shape batch 2's
  §1 ruling permits, where `refs` was an external field the migration
  distrusted enough to drop.

### The residual question, stated as narrowly as it can be

> The 2026-08-05 review approved wrapping five unlinked ibids whose
> address came from `refs`. This case wraps 2,118 whose address is
> copied from an anchor two sentences earlier in the same entry, at
> daf granularity with the antecedent's segment inherited (§4.1).
> Does the Class 2 approval extend to that population and that
> resolution method?

**RULED 2026-09-06 (Brian): yes — build case 10.** The five precedent
items took their address from `refs[]`, which v2 drops; the antecedent
copy is strictly more conservative, being entry-local movement of
bytes the entry already displays. The gate case is built; the rule is
a separate decision and `MINT_DECLARERS` stays empty until it is
made.

## 8. Verification

Every figure here was measured over `repairedEntries()` — all 32,512
entries after `applyRepairs` — using the production `tokenize`,
`anchors`, `fieldsOf`, `gapBetween`, `INTERVENING_CITATION` and
`isCitation`, never a reimplementation. The population and the control
carry their own provenance in
[phase-2-unlinked-ib.md](../v2/phase-2-unlinked-ib.md) §6, including
why `report-batch-06.md`'s 3,256 / 5,795 is not used.

## 9. Decision log

- **2026-09-06** — drafted after the unlinked-`Ib.` sizing found the
  blocker was the count invariant and not the target evidence.
- **2026-09-06** — clause 5 settled as *precedes*, not *nearest*, on
  case 7's `VARIANT_DISPLAY` precedent. Cost measured at §4: a factor
  of nine, carried by attribution.
- **2026-09-06** — clause 7 added after working the equation through
  the delete-one/create-one blind spot and finding clause 6 alone did
  not reach it.
- **2026-09-06** — §7 drafted as an open body-model question, then
  REWRITTEN on finding `body-review/02-orphan-refs.md`: the maintainer
  approved wrapping unlinked ibids in the same 2026-08-05 review that
  produced the "show only what Jastrow linked" line, which was written
  about baseless refs in a different class. The question left is
  narrower than the first draft claimed.
- **2026-09-06** — §7 RULED by Brian: yes. Built the same day.
- **2026-09-06** — `checkMintClauses` exported during the build, for
  the reason §6 records. Not in the drafted design.
- **PENDING** — whether to write the rule that declares this case.
  `MINT_DECLARERS` is empty until that is decided, so nothing is
  licensed in the meantime.
