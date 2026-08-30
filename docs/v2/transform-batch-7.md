# Phase 2 batch 7 — the sense and definition structure family

**Status: discovery complete 2026-08-29; no rule written yet.** Scope
ruled by Brian on the batch-7 opening question: the eight blocking rows
that describe sense and definition structure, 599 catalogued instances.
It is the second batch to run against the `structural-repairs` phase
batch 6b wired, and it holds the **only entanglement edge left in
`PENDING`**.

Every figure below is measured on
`applyTransforms(applyRepairs(source).entry, 'text-repairs').entry` —
the entry a structural rule actually receives — over all 32,512 entries
of the pinned snapshot (`data/source/jastrow-dictionary.jsonl`,
sha256 `4c64ff03…`). The raw-source figure is stated alongside wherever
the two differ. This is [[feedback_measure_post_repairs]] applied
before a line of rule code exists rather than after, and for the second
time in three batches it changed an answer.

## 1. The measurement

| Row | Catalogued | Measured post-repairs | |
|---|---:|---:|---|
| `trailing-em-dash-tail` | 130 ent / 132 senses | **130 / 132** | exact |
| `sense-number-outside-closed-grammar` | 111 ent / 113 tokens | **0** | dissolves — §2 |
| `duplicated-definition-opening-run` | 85 | 60 / 82 / 95 | no predicate — §3 |
| `empty-lead-sense` | 84 | **73 `{}` + 11 ws = 84** | exact |
| `continuation-marker-em-dash-loss` | 71 | 38 | unsettled — §4 |
| `adjacent-verbatim-repetition` | 59 | **59 / 59** | exact — §5 |
| `bracketed-gloss-lead-sense` | 49 | **49** | exact — §5 |
| `section-break-terminator-loss` | 10 | 11 | §6 |

Five of eight reproduce their catalogued count on first measurement.
Two of those five (`adjacent-verbatim-repetition`,
`bracketed-gloss-lead-sense`) reproduced only once a boundary condition
the catalogue states in prose was made executable — see §5, which is the
transferable part of this section.

`trailing-em-dash-tail` reproduces including its whole decomposition:
101 of 132 tails precede a `*N)` sibling, and the residual splits
**16 entry-final / 7 next-unnumbered / 8 next-bare**, digit for digit
what round 4 recorded. The recursive walk matters exactly as round 4
warned — a non-recursive one returns 109/108.

## 2. `sense-number-outside-closed-grammar` HAS NO POPULATION LEFT

The row is catalogued at 111 entries / 113 tokens: `*2)`×74, `*3)`×19,
`*4)`×9, `-2)`×5, `*1)`×3, `*5)`×1, `*6)`×1, `[1)`×1. **Not one of
those 113 is outside the closed grammar today, and the row's name has
been false since before Phase 2 opened.** Two independent reasons, and
they partition the row:

**107 of 113 were never outside the grammar.** `body/labels.ts`'s
`LABEL` is `/^(?<dash>—)?(?<star>\*)?(?<label>\d+|[a-z])\)$/u` — the
star is a *parsed field*, not a quarantine trigger, and its docstring
says so in the same breath as it names the two shapes that do
quarantine. All 107 `*N)` markers parse, round-trip byte-exactly
through `printLabel`, and are counted by this batch at 107 with all 107
at sibling position > 0.

**The other 6 are repaired by `applyRepairs` before any transform
runs.** `repairs.ts`'s "04 — sense-label quarantine repairs" turns the
five `-2)` ASCII hyphens into `—2)` and moves D00341's `[1)` bracket
into the sense text. Measured over the corpus, tokens that quarantine
to `{unknown}`: **6 raw → 0 post-`applyRepairs`**.

This is batch 6a's `binyan-form-*` shape for the third time, with one
difference worth stating: the row does not dissolve into *nothing*. Of
its 113 tokens, **101 are repaired by its entangled partner's rule** —
they are precisely the `*N)` markers whose em-dash is stranded on the
previous sibling, which is `trailing-em-dash-tail`'s repair — **6 by
`applyRepairs`**, and **6 remain**: `A00510`, `A02000`, `B00005`,
`M00591`, `N01131`, `P01184`, each a `*N)` with no stranded dash before
it (`A02000`'s predecessor ends `—[`, which is `stranded-open-bracket`'s
shape, not this one). Per batch 6b's principle — a partial rule must not
take its row's remainder off the queue — those 6 need a home before the
row leaves `PENDING`.

## 3. `duplicated-definition-opening-run` has no recorded predicate

Same situation as `stranded-stem-head` at 6c: a count with no statement
of how it was reached. The catalogued 85 is documented as "the middle
and best-argued figure" of three letter-scoped filters (M 91, Q 85,
P 79). Measured here as "definition opens with a run of ≥ *k* characters
repeated immediately at offset 0":

| minlen | occurrences | entries | catalogue's null model |
|---:|---:|---:|---:|
| 2 | 99 | 95 | 92 |
| 4 | 84 | 82 | 81 |
| 8 | 60 | 60 | 58 |

The null model reproduces within 2–7 at every threshold, so the
detector agrees with the catalogue's; what is missing is a ruling on
*k*. The batch must state one and correct the count.

## 4. `continuation-marker-em-dash-loss` is unsettled, and its own row says so

Measured decomposition of continuation markers (`N)` with N > 1, not
first in a sibling list), tags stripped before testing the predecessor:

```
total 5,728 · with em-dash 5,445 · without 283
   ├─ em-dash stranded on previous sibling   109   (trailing-em-dash-tail)
   ├─ "[" stranded on previous sibling         80   (stranded-open-bracket)
   ├─ previous ends ";" or "," — print run     56   (convention, not a defect)
   └─ CLEAN, no residue at all                 38   ← the row
```

The row is catalogued at 71. Its own audit flag already records the
figure as **unsettled between 19 and 44**, from two reconstructions that
disagreed (round 2: 45/26/19; the `stranded-open-bracket` audit: 73/29/44).
**38 lands inside that band**, which neither settles the row nor
contradicts it. The 56-member `;`/`,` arm is the catalogue's own
"real finding that kills the naive version of this candidate", and it
reproduces.

## 5. Two rows reproduced only after a prose boundary was made executable

Both of these were "wrong" on first measurement and correct on second,
and the correction was the same move each time: the catalogue states a
boundary in a sentence, and the detector has to encode it.

**`adjacent-verbatim-repetition` — 71, then 59.** The row reads "a run
of ≥ 8 characters ending in a period, repeated immediately and verbatim
inside one definition", and then, separately, "Distinct from
`duplicated-definition-opening-run`, which is anchored at offset 0." A
detector that reads only the first sentence returns **71** and the row
is catalogued at **59**. Excluding the match that *is* the opening run
returns **59 occurrences / 59 entries** and an overlap with
`duplicated-definition-opening-run` of **0 entries**. The two rows
partition their union of 119 exactly, and the disjointness is now a
measured fact rather than a claim.

**`bracketed-gloss-lead-sense` — 63, then 49.** The row reads
"unnumbered first sense whose entire definition is a bracketed
etymological gloss **ahead of a correct `1)`**". Unnumbered bracketed
lead senses number **63**; those whose next sibling carries `1)` or
`—1)` number **49**, the catalogued figure. The other **14 have no
following sibling at all** — the bracketed gloss is the whole entry
(`J00023` is `[<i>to exist, be strong</i>.]` entire) — and they are a
different shape that this row does not describe and no rule here should
touch.

## 6. `section-break-terminator-loss` measures 11, and its controls are exact

Predecessor census for `—<label>` where label ∈ {Pl., Part., Fem.,
Denom.}, tag-tolerant on both sides of the dash:

```
"." 7,250   "]" 241   "?" 54   ")" 17   "!" 4   ";" 3   "’" 3
"ᵃ" 2   "…" 2   " " 2   "e" 2   "s" 1   "l" 1   "d" 1
```

Every one of the catalogue's four falsifier controls reproduces to the
digit — `]` 241 against 242, `?` 54, `)` 17, `!` 4 — and its two
false-positive families are visible in the census exactly as described:
**3 quotation-closers** (the `’`) and **2 ellipses** (the `…`), which is
why the row was cut from a 15-candidate first pass to 10.

Letter- or digit-terminated predecessors number **11**, one above the
catalogued 10: `A00519`, `C00193`, `C00952`, `G00323`, `H00068`,
`M00479`, `Q01518`, `R00440`, `S01514`, `T00980`, `V00427`. `H00068`
is the row's own published example. All 11 need eyes-on before a rule
inserts a byte.

## 7. What this batch has not done yet

- No rule is written. No registry entry, no test, no gate.
- The 6 residual `*N)` markers of §2 have no home.
- *k* for §3 is not ruled.
- The 11 of §6 are not read.
