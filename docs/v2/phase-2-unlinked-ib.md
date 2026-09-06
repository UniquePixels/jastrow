# Phase 2 — sizing the unlinked `Ib.` predicate

`report-batch-06.md` called unlinked `Ib.` "the strongest v11
candidate" at 3,256 unlinked against 5,795 anchored, and the
consolidated class report carried it as the largest free win in §7.
This sizes it properly.

**Result in one line:** the population is real and the antecedent walk
resolves 75.1% of it at 99.9% place-accuracy against a 1,859-case
control.

**SHIPPED 2026-09-06** as `unlinked-bare-anaphor` — 2,119 anchors
across 1,750 entries. §5's blocker was real and was lifted rather than
worked around: `link-target.ts` gained
[gate case 10](../specs/2026-09-06-link-target-gate-case-10.md), and
the registry gained an `ORDERED` declaration for the four
non-commuting pairs the rule turned out to have. Everything below is
the sizing as it stood before either existed; it is left unedited
because the measurements are what the rule was built on.

---

## 1. Batch 06's figures do not reproduce, and the control says why

| | Report | This measurement |
| --- | --- | --- |
| control, `the` | 65,969 | see below |
| unlinked `Ib.` | 3,256 | 2,819 (different predicate) |
| anchored `Ib.` | 5,795 | 2,244 (different predicate) |

`\bthe\b` measured five ways — every field `fieldsOf` walks, raw and
through `stripTags`; definitions only, raw and stripped; document text
outside anchor displays — gives **50,353 / 50,353 / 42,507 / 42,507 /
50,341**. None reaches 65,969. An independent basis agrees with the
widest of them: `\bthe\b` over the raw JSONL lines is also **50,353**.

The report's figure is reproduced by a different predicate:
**an unbounded substring count of `the`**, through `stripTags`, over
`fieldsOf` — **66,037**, within 68 of the published 65,969.

`[sev:med conf:high]` So the control was a substring count while the
`Ib.` halves were evidently taken on something narrower — my
substring `Ib.` through `stripTags` is 9,373, not 5,795. **Two
different methods for the two halves of one claim**, which is what
[[feedback_cap_artifact_agreement]] is about: a figure quoted with a
control measured a different way is not corroborated by it. Nothing
below uses the report's numbers.

---

## 2. The predicate, stated

A **bare anaphor**: the token `Ib.` or `ib.`

1. standing as its own word (`(?<![\p{L}\p{N}])(?:Ib|ib)\.(?![\p{L}\p{N}])`),
2. in a text token that is **not inside an anchor's display run**,
3. with **no locus of its own** immediately following.

Clause 3 is the same carve-out `anaphora.ts`'s `ANAPHOR` makes on the
anchored side: `Ib. 35ᵃ` and `Ib. V, 1` carry their own address and
resolve correctly, so they are not this defect. Measured after
`applyRepairs`, over all 32,512 entries.

| | Occurrences | Entries |
| --- | --- | --- |
| **unlinked bare anaphors** | **2,819** | **2,179** |
| anchored bare anaphors, for comparison | 2,244 | 1,767 |
| unlinked `Ibid.` (separate, not counted above) | 17 | — |

Control: `\bthe\b` = 50,353, reproduced on two independent bases.

---

## 3. The funnel, clause by clause

Applying the three antecedent restrictions `ibAnaphora` already
carries — nearest preceding anchor, a citation and not a `Jastrow, …`
cross-reference, with no unanchored citation intervening
(`INTERVENING_CITATION` over `gapBetween`):

| Outcome | Sites | Share |
| --- | --- | --- |
| no preceding anchor at all | 215 | 7.6% |
| only lexical (`Jastrow, …`) antecedents | 81 | 2.9% |
| an unanchored citation intervenes | 405 | 14.4% |
| **resolvable** | **2,118** | **75.1%** |

The 24.9% decline rate has the same single root cause `ibAnaphora`'s
own 33% does: the citation the `Ib.` refers to is in Jastrow's text
but was never anchored. Recovering it means parsing
`Y. Ter. VIII, 46ᵇ bot.` into a Sefaria address — the never-linked
family, out of scope.

---

## 4. The control: scoring the walk where the answer is known

A funnel that yields 2,118 is a count, not a validation. The same walk
was run against the **anchored** bare anaphors, where the linker's own
resolution is a known answer.

Excluded before scoring: **364** anchored anaphors whose target is
`Yoma 2a*` — the `ib-yoma-2a` sink, where the linker is known wrong,
so agreeing with it would prove nothing — and **142** the walk
declined (121 of those sink members).

| Criterion | Agree | Share of 1,859 |
| --- | --- | --- |
| exact `data-ref` string | 971 | 52.2% |
| **same place, granularity ignored** | **1,857** | **99.9%** |
| different place | 2 | 0.1% |

The two survivors are `A01334` (linker `Mishnah Sukkah 1:1`, walk
`Sukkah 55b:14` — a genuine miss) and `V00899` (linker
`Pesikta Rabbati 27-28`, walk `27:1` — a range against a segment).

### The 52.2% → 99.9% spread is the finding, not noise

Almost every disagreement is one **segment** of the right daf:
`Sanhedrin 78b:11` against `78b:12`, `Berakhot 50a:16` against
`50a:14`. Jastrow cites the daf; Sefaria addresses a segment within
it. This is the same granularity result `report-batch-06.md` reached
from the other direction — "bareness is resolver granularity, not the
anaphoric bug" — and it means:

`[sev:med conf:high]` **A rule copying the antecedent's target whole
gets the right daf and a coin-flip segment.** That is the correct
reading of a bare `Ib.` and is what `ibAnaphora` already ships, but it
should be stated rather than discovered later: the reader lands on the
right page, not necessarily the right line.

An earlier cut of this table read 63.2% and then 99.3%, because the
normalizer was wrong in each direction — prefix-compatibility misses
two sibling segments, and stripping one `:N` breaks the three-level
midrash refs (`Kohelet Rabbah 1:9:1`). The union of the two is what
the 99.9% is measured on.

### Is the target population like the control population?

The control scores the walk where the **linker succeeded**; the
unlinked sites are where it did nothing, and the two need not be alike.
The `ib-yoma-2a` audit names the condition the linker cannot handle — a
Jerusalem Talmud antecedent, which sends all 259 of its members to the
sink.

Among the 2,118 resolvable unlinked sites: **71 have a Jerusalem
Talmud antecedent, 2,047 do not.** At 3.4% the target population is
*not* enriched for the linker's known blind spot, so the control's
population is a reasonable stand-in. This does not prove the walk is
right where the linker failed — nothing here can — but it removes the
one specific reason to think it would not be.

---

## 5. The blocker: minting an anchor is not currently expressible

`ibAnaphora` **retargets** an anchor the entry already has. This rule
would have to **create** one — wrapping bare text in `<a href=…
data-ref=…>`. Three gates, and only one refuses:

| Gate | Verdict |
| --- | --- |
| `no-new-text` | **passes.** `textOf` strips tags, the display text is unchanged, so the text multiset does not move and no `allows` is needed |
| `markup` | **passes.** A matched `<a>…</a>` adds one open that is popped and one close that pops; neither "never popped" nor "popped nothing" increases |
| `link-target` | **FAILS.** `anchor count grew N → M` (`link-target.ts:2207`) |

`[sev:high conf:high]` The count check is a hard refusal with no
declaration behind it: `unlinks` reconciles **removals** only, and a
negative `removed` is reported unconditionally. The target itself is
fine — copied whole from the entry's own input, which is case 2 — so
what is missing is not evidence but a **way to say so**.

Shipping this needs a new link-target gate case: *a minted anchor whose
`data-ref` and `href` are copied verbatim from a named input anchor of
the same entry.* That is a spec change (the case-6/7/8 pattern), not a
rule. Note the gate's own blind-spot list already contemplates the
shape — "delete-one, create-one … nets to zero" — so the case would
also need to close that, or the count invariant stops meaning anything.

---

## 6. Recommendation

1. **Correct §7 of the class report.** Unlinked `Ib.` is not a free
   win; it is blocked on a gate case. Moved with its reason.
2. **Do not re-quote 3,256 / 5,795.** The predicate behind them is not
   recoverable and the control does not corroborate them. 2,819 / 2,244
   with the predicate in §2 is what this file publishes.
3. **If the gate case is written, size the prize honestly:** 2,118
   anchors created, right daf, segment inherited from the antecedent.
   That is a real improvement over 2,819 dead `Ib.`s, and it is not the
   same as "3,256 citations linked".
4. **The same gate case unblocks the v10 systemics row** for unlinked
   `Y. <tractate>` citations (893 across 768 entries), which mints an
   anchor for the same reason — though that one also mints an *address*
   and so needs more than this case.

## Provenance

Measured 2026-09-06 over `repairedEntries()` (all 32,512 entries after
`applyRepairs`), using the production `tokenize`, `anchors`,
`fieldsOf`, `stripTags`, `gapBetween`, `INTERVENING_CITATION` and
`isCitation` rather than any reimplementation. Every count carries a
stated basis; the `the` control was reproduced on two independent
bases before any `Ib.` figure was trusted.
