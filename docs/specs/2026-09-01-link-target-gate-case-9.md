# Case 9 — a target repaired at the point level

**Status:** DRAFT 2026-09-01, ruled by Brian the same day (build it, ship
all four batch-10 rows). Extends [the batch-4 gate
cases](2026-08-27-link-target-gate-cases.md) and [case
8](2026-08-31-link-target-gate-case-8.md). `link-target.ts`'s eight
existing cases are unchanged; nothing here loosens one.

## 1. Why this exists

Batch 10 disposes the four Hebrew-orthography rows still in `PENDING`.
Two of them repair Hebrew **points** — combining marks in
U+0591–U+05C7 — and Hebrew points occur inside link targets:

| Row | Repair | Occurrences in a `data-ref` |
|---|---|---:|
| `holam-migrated-off-mater-vav` | moves a holam one letter right, onto its mater vav | **442** |
| `shin-sin-dot-drop` | adds the shin or sin dot a pointed token lost | **26** |

The gate refuses all of them, measured over the whole corpus with a
prototype map and the real gates:

```text
{ touched: 457, linkFail: 205, textFail: 0 }
target "Jastrow, אַנּוֹנָא 1" is not in A00267's input
```

The refusal is correct under the present cases and is a **gap**, not a
verdict. Every existing case sources the written target from strings the
entry already holds; a repaired target is by construction a string the
entry does not hold, because the entry holds only the damaged spelling.

**The repair cannot be scoped away.** The corruption is
self-consistent: of the 218 anchors whose `data-ref` carries a holam
defect, **218 point at a headword carrying the same defect** — measured
`refResolvesNeither` **0**. Repairing the headword without the
`data-ref` breaks all 218; repairing the `data-ref` without the headword
breaks all 218 the other way. Only repairing both keeps them resolving,
and that is what a uniform field map does.

**And the text gate cannot substitute for this one.** A holam move
preserves the codepoint multiset exactly, so `checkNoNewText` returns
clean over all 457 touched entries no matter where the mark lands —
`textFail` **0** above. That is a [[feedback_vacuous_gates]] shape: the
rule is invisible to the gate a reader would expect to catch it.

## 2. The shape

A rule repaired a target's Hebrew **pointing** and changed nothing else
about it — not the work, not the locus, not the homograph index, not one
consonant.

**Declared as**
`TransformResult.pointed: { adds?: string; from: string; target: string }[]`.

- `from` — a target in this entry's INPUT that the repair started from.
- `target` — the target written.
- `adds` — the points the repair INTRODUCED, verbatim and in order.
  Absent means the repair introduced none, which is the whole of the
  holam arm.

Matched to an anchor by `target === value`, not by anchor identity.
Every other case reads evidence off a particular anchor — case 8's
witness display, case 7's sibling — so it must say which anchor. This
case reads nothing but the two strings, so anchor identity would add a
requirement without adding a check.

## 3. The clauses

All fail-closed. A claim satisfying fewer than all of them licenses
nothing.

1. **The declarer is licensed.** The declaring rule id must be on
   `POINT_DECLARERS`, like case 7's and case 8's allowlists. A call
   naming no rule is refused with the rest.
2. **`from` is in the input.** The entry must actually have held the
   target the repair started from.
3. **The skeleton is untouched.** `target` and `from`, with every
   character in U+0591–U+05C7 removed, must be **byte-identical**.
   Not `skeletonOf` — that helper also strips the trailing roman
   numeral, the homograph mark and the geresh, so `Jastrow, X I` and
   `Jastrow, X II` share a skeleton. Only points are stripped here, and
   everything else is pinned by length, order and codepoint.
4. **The move is the gate's own, not the rule's.** `holamNormal(target)`
   must equal `holamNormal(from)`, where `holamNormal` folds
   `<consonant, holam, marks> + bare vav` onto
   `<consonant, marks> + <vav, holam>`. The gate owns the function; a
   rule cannot parameterize it, exactly as case 5 owns the
   gershayim↔ASCII-quote mapping.
5. **Additions are declared, are dots, and stand on pointed letters.**
   After clause 4's normalization, `target`'s point multiset must equal
   `from`'s plus exactly the multiset of `adds`; every character of
   `adds` must be U+05C1 or U+05C2; and every dot the claim
   INTRODUCED must stand on a letter that also carries a vowel or a
   dagesh.

   **The last test is scoped to the INTRODUCED dots, not to every dot
   in `target`.** Stated over the whole target it refuses
   `Jastrow, אִישׁוֹן 1`, where the shin dot sits on a letter whose only
   vowel is the holam of the FOLLOWING mater vav — ordinary Hebrew, and
   a mark the holam repair did not write. Clause 3 has already settled
   that `from` and `target` spell the same letters, so the two walks
   align index for index and a gained dot is one this claim is
   answerable for. Found by running the phase over the corpus, not by
   reading.

## 4. Blast radius, measured

Over the **72,387** distinct `data-ref` values the corpus holds.

### 4.1 Why clause 3 alone would not do

Point-stripped equality is a weak equivalence, and the corpus says so:
**2,063** bare forms carry more than one pointed spelling, **2,722**
extra spellings between them. They are not variants of one word:

```text
Jastrow, עַל 1        |  Jastrow, עֹל 1          on / yoke
Jastrow, אֵם 1        |  Jastrow, אִם 1          mother / if
Jastrow, תְּפִלָּה 1  |  Jastrow, תִּפְלָה 1     prayer / folly
Jastrow, אֲדָם 1      |  Jastrow, אָדָם 1        |  Jastrow, אָדַם 1
```

A case that stopped at clause 3 would license retargeting any of those
to any other. This is the failure that withdrew
`containment-fallback-mislink` — a clause that vouches the WORD and not
the ENTRY.

### 4.2 What clause 4 leaves

Requiring the point multiset as well cuts 2,063 to **9**, and 8 of the 9
are still distinct lemmas (`מַפְתֵּחַ`/`מְפַתֵּחַ`,
`מַדְבְּרָא`/`מְדַבְּרָא`, `קֵדָר`/`קָדֵר`, …). Multiset equality is
therefore also not the clause.

Requiring the gate's own normalization instead cuts it to **1**:

```text
Jastrow, רִמּוֹן 1   |   Jastrow, רִמֹּון 1      =>  Jastrow, רִמּוֹן 1
```

and that one pair is the defect's own two spellings of a single word —
which is what the case exists to license, not a residue. **The move arm
reaches no wrong target in this corpus.**

### 4.3 What clause 5 leaves

A dot added to a target's point sequence reaches **2** other targets:
`Jastrow, ש 1` → `Jastrow, שׁ 1` and `Jastrow, שטי 1` →
`Jastrow, שׂטי 1`. Both are refused by the pointed-letter requirement —
in each the dot would stand on a letter carrying nothing else.
**Residue ZERO.**

### 4.4 What the case deliberately does NOT cover

- **Any point change that alters the skeleton.** Clause 3 refuses it.
- **Removing a point.** `adds` only ever grows the multiset; a claim
  whose `target` has fewer points than `from` fails clause 5.
- **Any dot but shin and sin.** A rule restoring a vowel cannot declare
  through this case, which is the shape
  [[project_no_vowel_inference]] rules out anyway.
- **A second normalization.** Clause 4 names one fold. A future
  point-level row needing another gets its own clause and its own
  measurement; it does not get to reuse this one by analogy.

## 5. Where the corpus check lives — NOT in the gate

`link-target.ts` is entry-local by construction. It verifies that a
written target stands in the declared RELATION to a target the entry
held; it has no corpus to ask whether the repaired address exists, and
it never acquires one.

Existence and correctness are checked in the corpus tier:

| Question | Where it is answered |
|---|---|
| Is the edit point-level and skeleton-preserving? | this gate |
| Does every repaired `data-ref` still resolve? | `holam-mater.corpus.test.ts` |
| Does the repair merge two entries? | `holam-mater.corpus.test.ts` |
| Is every restored dot attested verbatim? | `shin-sin.corpus.test.ts` |

Neither half is sufficient alone, and a reader who takes the gate's
silence about existence for a guarantee has the wrong model — the same
split case 8 states, for the same reason.

## 6. The one exception the corpus forces

Repairing every holam defect makes **exactly one** pair of entries share
a headword:

```text
T00795  רִמּוֹן   (b. h.)   ר ִ מ ּ ו ֹ ן     already correct
T00796  רִמֹּון   ( ch. )   ר ִ מ ֹ ּ ו ן     damaged
```

T00796 is T00795's Aramaic counterpart and its `language_reference`
points at `Jastrow, רִמּוֹן 1` under the display `same`. Repairing
T00796's **headword** would leave two entries spelled alike and
`Jastrow, רִמּוֹן 1` ambiguous — [[feedback_headword_is_a_namespace]].

The rule therefore refuses T00796's headword field and repairs its other
fields normally. A rule cannot see the corpus, so the exception is a
frozen single-entry table re-derived from the live snapshot by
`holam-mater.corpus.test.ts`, the way `vSubRedirectTwin` carries its
50-row table.

## 7. Verification

- `link-target.test.ts` — one unit test per clause, each shown failing
  before the clause existed.
- `holam-mater.corpus.test.ts` — headword uniqueness preserved, every
  repaired `data-ref` resolving, the exception table re-derived.
- `shin-sin.corpus.test.ts` — every repair's twin attested, ambiguity
  zero.
- `registry.order.corpus.test.ts` — the two rules' class.

## 8. Decision log

| Date | Decision |
|---|---|
| 2026-09-01 | Brian scoped batch 10 as all four `PENDING` orthography rows. |
| 2026-09-01 | Brian ruled: write case 9, ship all four. |
| 2026-09-01 | Clause 3 stated on points alone rather than on `skeletonOf`, which strips the homograph index. |
| 2026-09-01 | Clause 4 given to the gate rather than declared, after multiset equality measured 9 collisions of which 8 were wrong lemmas. |
| 2026-09-01 | T00796's headword excluded; the collision is real and the namespace is load-bearing. |
