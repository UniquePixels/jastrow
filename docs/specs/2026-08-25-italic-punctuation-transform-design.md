# Italic & punctuation seams — Phase 2 batch 3b design

**Status:** DRAFT 2026-08-25, awaiting approval. Extends
[the transform module design](2026-08-22-transform-module-design.md);
that spec's §3 contract, §5 gates and §6 write-back mechanism hold here
unchanged unless this document says otherwise. The batch split that
created this document is ruled in
[the gershayim design](2026-08-24-gershayim-transform-design.md) §1.

## 1. What this batch is

Batch 3 was split on 2026-08-24: **3a** repaired a wrong character
(gershayim) and shipped as `bd82723`; **3b** — this batch — repairs
*markup boundaries around correct characters*.

**Scope, ruled 2026-08-25 (Brian): 16 rows / 3,122 catalogued
instances.** The set is **entanglement-closed**: no `entangledWith`
edge leaves it and none enters it, so it can ship as one pull request
without leaving `unaccountedEdges()` with a dangling endpoint.

```bash
bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
const rows=await parsePatterns(await Bun.file("data/patches/patterns.jsonl").text());
const by=new Map(rows.map(r=>[r.id,r]));
const set=new Set(["italic-swallowed-terminal-period","label-period-outside-italic","emphasis-run-edge-space","em-dash-section-break-in-own-italic","paren-tag-no-space","anchor-italic-no-space","italic-close-paren-nospace","citation-quote-seam-period","italic-lone-punctuation","geresh-abbrev-space-loss","orphan-gloss-seam-period","translit-italic-space-loss","gloss-head-seam-period-doubling","trailing-whitespace-definition","entry-final-comma","italic-swallows-close-paren"]);
let n=0; for(const id of set) n+=by.get(id).corpusCount;
const out=[...set].flatMap(id=>(by.get(id).entangledWith??[]).filter(e=>!set.has(e)));
const inn=rows.filter(r=>!set.has(r.id)&&(r.entangledWith??[]).some(e=>set.has(e))).map(r=>r.id);
console.log({rows:set.size,instances:n,edgesOut:out,edgesIn:inn});'
```

The four seam-spacing rows that sit next to anchors and parens
(`paren-tag-no-space`, `anchor-italic-no-space`,
`italic-close-paren-nospace`, `italic-swallows-close-paren`, 342
instances) are **in 3b, not batch 4**. They share one predicate shape
with `translit-italic-space-loss` — *a space missing at a tag seam*.
Batch 4 is anchors and parens **swallowing content**, which is
structural. Splitting by adjacency rather than by predicate would make
the same rule get written twice.

## 2. Measured scope

Every figure below was re-derived on the pinned snapshot
(`data/source/jastrow-dictionary.jsonl`, sha256 `4c64ff03…`) using the
predicate each row's own `reason` records, walking `fieldsOf`. **`occ`
is occurrences, `ent` is distinct entries.** Nothing here is copied
from the catalogue.

| Row | Catalogued | Measured | Verdict |
|---|---:|---|---|
| `italic-swallowed-terminal-period` | 1,098 | 1,322 occ / 1,206 ent, pre-exclusion | §4 |
| `label-period-outside-italic` | 945 | **993 occ / 856 ent** | ✗ §4.3 |
| `emphasis-run-edge-space` | 304 | 388 occ / **304 ent** | ✓ exact |
| `em-dash-section-break-in-own-italic` | 270 | 278 occ / **270 ent** | ✓ exact |
| `paren-tag-no-space` | 126 | **126 occ** / 119 ent | ✓ exact |
| `anchor-italic-no-space` | 111 | 112 occ / **111 ent** | ✓ exact |
| `italic-close-paren-nospace` | 95 | 96 occ / **95 ent** | ✓ exact |
| `citation-quote-seam-period` | 43 | 44 occ / **43 ent** (row's own) | ✓ |
| `italic-lone-punctuation` | 29 | 28 occ / 28 ent | ≈ −1 |
| `geresh-abbrev-space-loss` | 22 | 25 occ / 24 ent, unscoped | §7 |
| `orphan-gloss-seam-period` | 19 | 56 `". . "` − 37 sibling = **19** | ✓ |
| `translit-italic-space-loss` | 15 | row's own, not re-derived | §7 |
| `gloss-head-seam-period-doubling` | 15 | 14 ent | ≈ −1 |
| `trailing-whitespace-definition` | 10 | **10** ent | ✓ exact |
| `entry-final-comma` | 10 | **10** ent | ✓ exact |
| `italic-swallows-close-paren` | 10 | 8 genuine of 10 (row's own) | §7 |

Eight rows reproduce exactly. That is a materially better starting
position than batch 3a's, where the largest row's count was off by 96.

### 2.1 `corpusCount` has no consistent unit, and this batch proves it

`emphasis-run-edge-space` catalogues **304 = entries** (388
occurrences). `paren-tag-no-space` catalogues **126 = occurrences**
(119 entries). Both are `corpusCount`.

This is not a defect introduced here — it is the catalogue's own
history, rows landing from different discovery rounds — but it means
**"the count reproduces" is not a check a reader can perform without
knowing which unit a row used.** Every write-back this batch makes
will state its unit in the `reason`. No schema change is proposed; the
field is load-bearing for `coverage()` sums and re-typing it is a
Phase-3 decision.

### 2.2 Senses nest, and one row's count depends on remembering that

`trailing-whitespace-definition` scopes to *"the final sense of an
entry"*. Walking only `content.senses` gives **8**. Walking
`sense.senses` recursively gives **10**, the catalogued figure. The
same trap is recorded in the batch-3a report (4,043 nested senses).
Every 3b predicate that says "final" or "first" walks recursively.

## 3. Three mechanical classes, and only one is free

The 3a spec's §1 says *"every member of 3b is a byte-identical
typographic normalisation"*. **That is true of 6 rows of 16.** The
claim was made from two rows' audit notes and does not survive contact
with the other fourteen.

| Class | Rows | Instances | What the text multiset does |
|---|---|---:|---|
| **A. Seam move** | 4 | 2,342 | unchanged — a byte crosses a tag boundary |
| **B. Space insertion** | 6 | 379 | **gains** one U+0020 per instance |
| **C. Deletion** | 6 | 401 | loses a codepoint (sub-multiset, always safe) |

**Class A** — `italic-swallowed-terminal-period` (1,098),
`label-period-outside-italic` (945), `em-dash-section-break-in-own-italic`
(270), `italic-lone-punctuation` (29). `stripTags` maps `<i>Af</i>.` and
`<i>Af.</i>` to the same `Af.`, so `checkNoNewText` sees nothing at
all. **The whole safety burden falls on `checkMarkup`'s delta and on
the rule's own tests.**

**Class B** — `paren-tag-no-space` (126), `anchor-italic-no-space`
(111), `italic-close-paren-nospace` (95), `geresh-abbrev-space-loss`
(22), `translit-italic-space-loss` (15), `italic-swallows-close-paren`
(10). These add text. §5 is about them.

`italic-swallows-close-paren` is in this class rather than in A on its
own audit's wording: the repair is `</i> <i>`, which splits the run
rather than moving a byte across its edge, and that inserted space is
exactly what its audit means by *"not byte-conservingly repairable"*.

**Class C** — `emphasis-run-edge-space` (304),
`citation-quote-seam-period` (43), `orphan-gloss-seam-period` (19),
`gloss-head-seam-period-doubling` (15), `trailing-whitespace-definition`
(10), `entry-final-comma` (10). Deletion passes the sub-multiset gate
by construction, which means **the gate cannot tell a correct deletion
from deleting the wrong byte**. Three of these six are flagged by their
own audits as not safely deletable (§7).

## 4. The two largest rows are one predicate with two polarities

`italic-swallowed-terminal-period` (1,098) and
`label-period-outside-italic` (945) are the batch's only recorded
entanglement edge, and 2,043 of its 3,122 instances. They are one
question asked twice.

Both rows operate on the same object: an italic run adjacent to a
terminal period. They disagree only about **which side the period
belongs on**, and Brian's round-4 ruling of 2026-08-21 settles it by
**object class, not by polarity**:

| Italic run body | Period goes | Row that owns it |
|---|---|---|
| a grammatical/abbreviation **label** | INSIDE `<i>Af.</i>` | `label-period-outside-italic` |
| an ordinary **word-final gloss** | OUTSIDE `<i>destruction</i>.` | `italic-swallowed-terminal-period` |

The two are exhaustive over the shape and disjoint by construction. So
**they are one module with one `isLabel()` predicate and two rules**,
in the same way batch 3a's two rows were one predicate split by locus.
Writing either alone would leave the other reading the same runs and
moving them back.

### 4.1 The label census reproduces

The audit's per-label widening figures re-derive **exactly** on the
pinned snapshot for all ten labels the ruling names:

| Label | Audit | Measured |
|---|---:|---:|
| `Part. pass.` | 266 | 266 |
| `Pa.` | 171 | 171 |
| `Af.` | 123 | 123 |
| `Fem.` | 118 | 118 |
| `Pi.` | 59 | 59 |
| `Nithpa.` | 43 | 43 |
| `m.` | 32 | 32 |
| `sing.` | 32 | 32 |
| `Pe.` | 31 | 31 |
| `ḳ.` | 31 | 31 |

`Part. pass.` reproduces at 266 only after trimming leading whitespace
from the run body (248 bare + 18 space-led). The 19 further
occurrences whose body is `—Part. pass` are a **different shape** —
`em-dash-section-break-in-own-italic`'s territory — and are correctly
outside this count.

### 4.2 The `isLabel()` predicate is corpus-wide, and rules are entry-local

The audit's real discriminator is not the list. It is:

> a final token proven an abbreviation — *it occurs mid-run inside an
> `<i>` elsewhere in the corpus*

That test reads the whole corpus. `Rule.apply` sees one entry. This is
the same wall that deferred `v-sub-redirect-stub-mislink` and
`containment-fallback-mislink` out of batch 2, where extending the
interface was judged "a bigger decision than either row is worth".

**Proposal, and it needs a ruling (R1, §12):** derive the abbreviation
vocabulary once from the pinned snapshot with a checked-in generator,
**freeze it into the module as a constant**, and assert at the test
tier that re-deriving from the snapshot reproduces the frozen list
**exactly**. This keeps `Rule.apply` entry-local, keeps the derivation
falsifiable rather than asserted, and is loud on drift in the shape the
batch-2 ruling of 2026-08-23 requires of any enumerated list in a rule
(`unobservedConvention` in `rules/unlink.ts`).

Rejected alternatives:

- **Ship the 20-label enumerated list only.** Cheaper, and it would
  cover 993 of the measured occurrences. But it makes
  `italic-swallowed-terminal-period`'s exclusion clause
  (*"excludes runs whose final token is an abbreviation dot"*)
  unimplementable — that clause is about *all* abbreviations, not the
  20 stem labels, and the audit found 18 proper-name initials and 5
  `&c.` terminators among the misfiled 123.
- **Extend `Rule.apply` with a corpus index.** Correct in the long run
  and out of scope for a typographic batch.

### 4.3 `label-period-outside-italic`'s count does not reproduce

Catalogued **945 entries / 1,106 occurrences**. Measured on the
20-label set: **856 entries / 993 occurrences**, against 1,869 already
period-inside (65.3% → 100%). The audit states 1,935 already inside and
63.6%.

The ten widened labels match exactly (§4.1), so the gap of 113
occurrences is entirely in the other ten labels, where the audit
implies ~200 and the predicate finds 87. **The predicate that produced
945 is not recorded anywhere**, so the difference cannot be attributed
without re-running an audit that no longer exists.

This is the batch's first write-back: the count is corrected to what a
stated, runnable predicate returns, and the predicate goes into the
`reason` so the next reader can falsify it. **Direction unchanged, size
corrected** — the same disposition batch 3a used for
`ascii-quote-as-gershayim-in-body` (1,290 → 1,386).

### 4.4 The accepted cost is already ruled, and it is large

`Part. pass.` is a genuine 10-letter unanimous period-**outside**
convention. The house-style ruling overrides it, normalising 266
occurrences against their own attested usage. **This is deliberate**
(Brian, 2026-08-21) and safe only because both forms strip to
byte-identical text. It is restated here because it is the single
largest sub-population in the batch and a reviewer who has not read the
round-4 report will read it as a defect.

## 5. Class B adds text, and `allows` is the wrong instrument

Five rows insert a space. `Rule.allows` exists for exactly this, and
its doc is explicit: *"Every non-empty value is a maintainer ruling —
cite it in a comment."*

**But `allows` is a SET, not a budget.** From `no-new-text.ts:181`:

```ts
const permitted = new Set((rule.allows ?? []).flatMap((s) => [...s]));
```

and a codepoint in `permitted` is exempted from the count comparison
entirely. So `allows: [' ']` on `anchor-italic-no-space` licenses that
rule to insert **any number** of spaces into any entry, forever. A rule
that repairs 111 seams and a rule that pads every field to 80 columns
pass the same gate. That is not a hypothetical failure mode for this
batch — it is precisely the "a rule that does nothing passes every
gate" lesson pointed the other way.

`TransformResult.copied` is the bounded instrument. It is verified to
occur in the input and credited as a **multiset**, so one declaration
buys exactly one space:

```ts
for (const [ch, count] of multiset(copy)) {
  budget.set(ch, (budget.get(ch) ?? 0) + count);
}
```

**Proposal, and it needs a ruling (R2, §12):** Class B rules declare
each inserted space as `copied: [' ']`, one entry per insertion, and
set no `allows`. A rule inserting three spaces declares three. An
off-by-one in the rule then fails the gate instead of passing it.

The honest objection, stated rather than hidden: `copied`'s docstring
frames it as *"text this call duplicated from elsewhere in the SAME
entry — e.g. an abbreviation's elided tail"*. A space is not elided
text being recovered, and using `copied` for it is a **mechanical fit
with a semantic stretch**. The alternative is a new `inserts?:
readonly string[]` field with multiset semantics, which is a contract
change to `types.ts` affecting all 15 shipped rules. R2 is the choice
between those two.

Either way the docstring for whichever field is used gains a sentence
naming this batch, because a reader of `copied: [' ']` with no comment
would reasonably call it a bug.

## 6. Class A moves bytes past tags, and only `checkMarkup` is watching

For a Class A rule `checkNoNewText` is structurally blind: input and
output strip to the same text. The gates that remain are:

| Gate | What it still proves |
|---|---|
| `checkMarkup` | the output is no less well-formed than the input |
| `link-target.ts` | no anchor target changed |
| the rule's own tests | that the byte moved to the right side |

`checkMarkup` is a **delta** gate — it permits pre-existing damage
through. So for Class A the real safety net is the third row of that
table, and the spec says so plainly rather than implying coverage. Two
compensating measures:

1. **A corpus-tier invariant per Class A rule**: for every entry the
   rule touches, `stripTags(before) === stripTags(after)` on **every**
   field of `fieldsOf`. This is stronger than the sub-multiset gate
   (order-sensitive, not just count-sensitive) and it is cheap. A
   Class A rule that moves a period to the wrong side of the *wrong*
   tag fails this immediately.
2. **`transform:count` rows** for each rule, as in every prior batch.

Measure (1) is proposed as a new shared helper in the batch's module
rather than as a gate in `run.ts`, because it is only sound for Class A
— Classes B and C change text by design.

## 7. Four rows say in their own audits that they cannot be transformed

Reading all sixteen `reason` fields turns up four rows whose recorded
audits already rule out a deterministic repair. **They are named here
so the batch predicts its withdrawals instead of discovering them at
the last task**, which is how batch 3a found its collision.

| Row | Instances | What its own audit says |
|---|---:|---|
| `gloss-head-seam-period-doubling` | 15 | *"ESCALATION-ONLY: which of the two bytes is surplus is unknowable from the entry, and one of them lives outside sense scope."* |
| `entry-final-comma` | 10 | *"two jobs, both DEFECT with different repairs… could not be separated without the printed page"* |
| `italic-swallows-close-paren` | 10 | *"Not byte-conservingly repairable… so members escalate rather than patch"*; 2 of 10 are lettered sub-sense markers, i.e. convention |
| `orphan-gloss-seam-period` | 19 | *"The 37-strong sibling family suggests the orphan period MARKS dropped text rather than being stray debris."* |

Predicted disposition: **the first two withdraw to `judgment`** —
neither has a nameable repair, which is the same test
`homograph-numeral-mismatch` failed in batch 2.
`italic-swallows-close-paren` is repairable if R2 licenses the inserted
space (the repair is `</i> <i>`), so it survives as a Class B row minus
its 2 convention members. `orphan-gloss-seam-period` needs one
measurement before it can be routed: whether the 19 clean members
sit beside a text-loss marker the way the 37 siblings do. If they do,
deleting the period destroys evidence and the row goes to `judgment`.

**If the two predicted withdrawals move, 3b ships 14 rows and 3,097
of 3,122 instances and the transform route falls 77 → 75. If all four
move, 12 rows / 3,068 instances and 77 → 73.** That is a
prediction, not a plan: each row gets its audit, and writing the
transform is the audit.

## 8. Registry placement

Order is load-bearing (`registry.order.test.ts` asserts cluster
contiguity against the live entanglement graph). Three constraints:

1. **The label pair is one contiguous cluster** — its recorded edge
   requires it. `label-period-outside-italic` runs **first**: it
   removes labels from the `<i>…</i>.` population, so
   `italic-swallowed-terminal-period` then sees only gloss runs and its
   exclusion clause becomes an assertion rather than a filter.
2. **Class B space insertions run before Class A seam moves.** A
   missing space at `</a><i>` changes what "the run body" is for the
   label predicate; repairing the seam first makes the label predicate
   read the same string a human reads.
3. **`em-dash-section-break-in-own-italic` runs before
   `italic-lone-punctuation`.** The latter is *defined* as the residue
   of the former (258 lone-punctuation runs − 230 em-dash = 28). Run in
   the other order, the residue row would consume 230 instances the
   em-dash row is meant to own — the double-count the catalogue
   deliberately avoided.

Constraint 3 is not recorded as an `entangledWith` edge and should be.
`checkAdjacency()` reads `entangledWith` and nothing else, so today it
cannot see this dependency at all — one more instance of the
"56 of 62 pending rows carry no edge" blind spot recorded in
`phase-2-triage.md` §3.

## 9. Verification

Per the module spec §5, plus:

| Check | Tier |
|---|---|
| every rule's occurrence count vs this document's §2 figure | `transform:count` |
| Class A: `stripTags` equality per field on every touched entry | corpus |
| Class B: exact space budget via §5's declaration | gate, per call |
| label vocabulary re-derives from the snapshot unchanged | test |
| `coverage()` accounts for all 77 rows | `registry.test.ts` |
| `bun body:migrate-dry` record count unchanged | corpus |
| `pipeline-links.test.ts` link totals unchanged | corpus |

The last one matters more than it looks. 3b touches `</a><i>` and
`)</a><i>` seams — **165 of them sit directly against an anchor's
closing tag.** Batch 3a's headline finding was a link regression that
every per-rule measurement missed. `pipeline-links.test.ts` exists
because of it, and this batch is the first to run against it as an
inherited guard rather than a new one.

## 10. Expected write-backs

| Row | Write-back |
|---|---|
| `label-period-outside-italic` | count 945 → measured (§4.3), predicate recorded in `reason` |
| `italic-lone-punctuation` | 29 → 28 if the residue confirms |
| `gloss-head-seam-period-doubling` | 15 → 14, or `route: judgment` |
| `entry-final-comma` | likely `route: judgment` |
| `italic-swallows-close-paren` | 10 → 8 (2 convention members excluded) |
| `orphan-gloss-seam-period` | route decided by the loss-marker measurement |
| every row that ships | unit stated in `reason` per §2.1 |

Edit `patterns.jsonl` **surgically** — `renderPatterns()` reformats all
149 rows.

## 11. Risks

1. **Class A is invisible to the strongest gate.** Mitigated by §6's
   `stripTags` invariant, not eliminated.
2. **`allows` would silently widen the text gate for five rules** if R2
   goes the other way. Stated in §5 so the cost is chosen rather than
   inherited.
3. **The frozen abbreviation vocabulary goes stale on a source
   re-fetch.** The re-derivation test fails loudly, which is the
   intent; but it fails as a *test*, meaning a re-fetch breaks the
   suite rather than the pipeline. That is the correct polarity and the
   module spec's own rule ("a source re-fetch must re-baseline an
   audit, never break the pipeline") argues for the opposite. R3.
4. **`unaccountedEdges()` will fail mid-batch.** The label pair must
   land in one commit; a rule shipping ahead of its still-`PENDING`
   partner trips the invariant. Deliberate, and recorded in the
   batch-3a report — but it will be seen in this batch first.
5. **266 `Part. pass.` occurrences are normalised against their own
   attested usage.** Ruled, not a defect (§4.4).
6. **`geresh-abbrev-space-loss` is 25/24 unscoped against a catalogued
   22.** Its row scopes to Hebrew quotation text; the scoping is not
   yet written. Small, but it is the one row whose count is *above*
   its catalogue figure, and 3a's lesson is that an over-count is where
   two owners hide.

## 12. Rulings needed before implementation

| # | Question | Recommendation |
|---|---|---|
| **R1** | How does `isLabel()` see a corpus-wide fact from an entry-local rule? | Freeze a snapshot-derived vocabulary with a re-derivation test (§4.2) |
| **R2** | How is an inserted space licensed — `allows: [' ']`, `copied: [' ']`, or a new `inserts` field? | `copied` (bounded, no contract change), with a docstring sentence naming this batch (§5) |
| **R3** | Should the vocabulary re-derivation be a test (breaks the suite on re-fetch) or an audit-tier check? | Test tier, accepting the tension with the module spec's re-fetch rule (§11.3) |
| **R4** | Do the four §7 rows get written and withdrawn, or routed on their recorded audits without writing code? | Write `italic-swallows-close-paren` and `orphan-gloss-seam-period`; route the other two on their audits — the reasons already state no repair exists |

## 13. Decision log

| Date | Decision |
|---|---|
| 2026-08-24 | Batch 3 splits: 3a gershayim ships first, 3b keeps the number |
| 2026-08-25 | 3b scope = 16 rows / 3,122, entanglement-closed; the four paren/anchor seam rows stay in 3b (Brian) |
