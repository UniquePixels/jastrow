# Case 8 — a target vouched by another entry's headword

**Status:** DRAFT 2026-08-31, ruled by Brian the same day (build it).
Extends [the batch-4 gate cases](2026-08-27-link-target-gate-cases.md)
and the [transform module design](2026-08-22-transform-module-design.md)
§5. `link-target.ts`'s seven existing cases are unchanged; nothing here
loosens one.

## 1. Why this exists

Batch 9 ruled one rule to ship — `vSubRedirectTwin`, 50 repairs of
`v-sub-redirect-stub-mislink` — and the gate refuses every one of them.

The refusal is correct under the present cases and is a **gap**, not a
verdict. All seven existing cases source the written target from the
entry's own input. Case 7 mints, so minting is not the line; what it
mints is assembled from two input targets and an input display. This
repair cannot be phrased that way:

```text
entry N00217 נִדּוּי   whole content:  ", v. sub נִידּ׳."
              currently points at:     Jastrow, נִדְבַּךְ I 1
              must point at:           Jastrow, נִידּוּי 1      (N00624)
```

`נִידּוּי` is not in N00217's input. The entry holds only the
abbreviation `נִידּ׳`, of which the target is a completion. **The
evidence for the repair is in another entry** — the one whose headword
is `נִידּוּי` — and no case can reach outside the entry.

**Case 8 is the first case to admit evidence from outside the entry.**
That is the whole of its novelty and the reason it is specced rather
than written.

## 2. The shape

A rule retargeted an anchor whose display is a geresh abbreviation, to
a target naming **a headword that already exists in this dictionary**,
which is a spelling twin of the host entry's own headword.

**Declared as**
`TransformResult.vouched: { display: string; headword: string; rid: string; target: string }[]`.

- `target` — the `data-ref` written.
- `headword` — the headword the rule says `target` names.
- `rid` — the entry that headword belongs to.
- `display` — the anchor display the abbreviation came from.

## 3. The clauses

All fail-closed. A claim satisfying fewer than all of them licenses
nothing.

1. **The target names the headword.** `target` must be exactly
   `Jastrow, <headword>` optionally followed by ` <n>`, `n` a positive
   integer. Nothing else is admitted — no second work, no locus of any
   other shape.
2. **The display abbreviates the headword.** `display` must end in a
   geresh (`׳`, `'` or `’`), and its skeleton must be a **prefix** of
   `headword`'s skeleton. Skeleton = combining points, homograph
   superscripts, a leading `*`, a trailing roman numeral and the
   geresh removed, and final letters folded to their medial forms.
3. **The headword is a spelling twin of the host.** `headword` and
   this entry's own headword must be **equal** once the matres
   lectionis `י` and `ו` are dropped from both skeletons. This is the
   clause that does the work — see §4.
4. **`display` is an anchor display this entry's input actually
   held**, matched like every other case by the claim's `target`
   against the anchor that carries it.
5. **The declaring rule is on the allowlist.** `VOUCH_DECLARERS`,
   today `v-sub-redirect-stub-mislink` alone.

Clause 5 is not optional and is the direct inheritance of case 7's
2026-08-27 ruling, taken after CodeRabbit's *"attribution does not
replace correctness"*. A `vouched` claim from any other rule is refused
until someone adds that id deliberately, which is the review moment
that would otherwise be missing.

## 4. Blast radius, measured

The question every case must answer: **how many targets other than the
intended one do the clauses license?**

Clause 3 is what makes the answer zero. Measured over the corpus, for a
sample of the 50 repairs — candidate headwords satisfying clauses 2 and
3 together, against clause 2 alone:

| Repair | Clauses 2∧3 | Clause 2 alone |
|---|---:|---:|
| `נִדּוּי` + `ניד` | **1** | 5 |
| `קִבּוּץ` + `קיב` | **1** | 18 |
| `צִנוֹק` + `צינ` | **1** | 17 |
| `שִׁפּוּל` + `שיפ` | **1** | 29 |
| `פֵּרוּק` + `פיר` | **1** | 54 |

**Exactly one candidate, every time, and it is the repair.** The
prefix alone would license up to 54. The residue of case 8 as specified
is **zero**: there is no second target the gate would accept.

This is a materially stronger position than case 7 shipped from. Case 7
licenses 29 of 68 structurally analogous pairs that would mint an
address that does not exist, and shipped on attribution plus an
allowlist. Case 8 licenses one target per anchor and that target names
an entry with a rid.

### 4.1 What case 8 deliberately does NOT cover

`containment-fallback-mislink` was ruled to ship on the same day and
then **withdrawn**, because its shape needs a weaker clause — skeleton
EQUALITY between display and headword, with no abbreviation and no twin
— and that licenses the word but not the entry: `נגד` admits `נָגַד`,
`נְגַד` and `נֶגֶד`, and only 1 of its 18 repairs is uniquely
determined. See `data/patches/catalogue-audit/containment-fallback.md`.

**Case 8 must not be widened to admit it.** Clause 2's requirement that
the display be an abbreviation, and clause 3's twin test, are jointly
what hold the residue at zero; dropping either reopens the homograph
ambiguity the row was withdrawn for. If that row is ever revived, it
needs its own case and its own blast radius, not a relaxation of this
one.

## 5. Where the corpus check lives — NOT in the gate

Clause 1 asserts that `target` names `headword`; **nothing in the gate
asserts that an entry with that headword exists.** That is deliberate.

`link-target.ts` is entry-local by construction and making it
corpus-aware would change every caller. Instead this follows
`rules/stem-section.ts`'s established pattern: the rule holds its
derived table as a frozen literal, and a corpus test re-derives it live
so upstream drift fails a test rather than silently changing the
population.

So the verification is in two parts, and both are required:

| Question | Answered by |
|---|---|
| Is the written target structurally a completion of this anchor's abbreviation, and a twin of this host? | `link-target.ts` case 8, per entry |
| Does an entry with that headword and that rid actually exist? | `v-sub.corpus.test.ts`, over the whole corpus |

**Neither alone is sufficient and the split must be stated in both
places**, or a future reader will take the gate's silence about
existence for a guarantee. Per [[feedback_vacuous_gates]]: ask what the
gate's own composition contributes to the assertion. Here it
contributes structure and not existence.

## 6. What ships with the case

| Item | Detail |
|---|---|
| `vouched` claim | `types.ts`, documented to the standard of cases 6–7 |
| Case 8 | `link-target.ts`, five clauses, `VOUCH_DECLARERS` allowlist |
| `vSubRedirectTwin` | new rule, phase `text-repairs`, 50 repairs |
| Registry | row `v-sub-redirect-stub-mislink` leaves `PENDING` |
| Corpus test | re-derives the 50 from the live snapshot |

## 7. Verification

| Gate | Bar |
|---|---|
| Unit, per clause | each of the five refuses when violated, including a claim whose `headword` is a non-twin and one whose `display` lacks the geresh |
| Allowlist | an otherwise-perfect claim from a rule not on `VOUCH_DECLARERS` is REFUSED, on the licence rather than on a clause; mutation-tested — deleting the check makes that fixture pass |
| Residue | the corpus test asserts that for all 50, clauses 2∧3 admit exactly one headword — the zero-residue claim of §4 is a TEST, not a spec sentence |
| `transform:count` | `v-sub-redirect-stub-mislink` 50; no other row moves |
| Commutation | every non-commuting pair still declared |
| `body:migrate-dry` | 32,512/32,512, 0 schema failures, 0 quarantines |
| `pipeline-links.corpus.test.ts` | 50 anchors change target, 0 addresses lost |

## 8. Decision log

| Date | Who | Decision |
|---|---|---|
| 2026-08-31 | Brian | ship both batch 9 rules as measured |
| 2026-08-31 | Brian | add case 8 rather than route the repairs as data patches or defer to Phase 4 |
| 2026-08-31 | Brian | withdraw `containment-fallback-mislink` after case 8's blast radius showed 1 of 18 uniquely determined; case 8 serves `v-sub` alone |
