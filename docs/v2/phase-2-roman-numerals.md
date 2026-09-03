# Phase 2.3, item 2 — adjudicating the 31 `roman-numeral-display` entries

**Status: worked 2026-09-03 on `v2` at `8606233`.** This takes the
second of the three items
[`phase-2-residue.md`](phase-2-residue.md) hands 2.3, which framed it
as a judgment call with no rule behind it —

> Nothing deterministic tells those apart. 31 entries of judgment is
> the right disposition for them, and 2.3 is where it happens.

The judgment is done here, and it lands differently than that
sentence expects. **24 of the 31 are real mislinks and 7 are
spurious** — and 21 of the 24 are not 21 separate judgments but one
family, separated from every correct link in the set by a predicate
of two clauses. The residue page's claim is corrected below rather
than confirmed: it was true of the discriminator PR #65 had tried
(numeral equals target chapter, 100% saturated and therefore useless)
and false of the class.

## The population

31 entries, **32 hints** — M02913 carries two, `X` and `XXV` in the
same clause. Both readings come from the same run as the residue
page's, `bun research:residue` on merged `v2`.

| Verdict | Entries | Hints |
|---|---:|---:|
| Real mislink | 24 | 24 |
| Spurious — the link is correct | 7 | 8 |
| **Total** | **31** | **32** |

## The four families

### A. A Targum recension marker read as a chapter — 20 entries

The dominant shape, and the one the residue page named from a single
example. Jastrow cites the two Palestinian Targum recensions as
`Targ. Y. I` (Pseudo-Jonathan) and `Targ. Y. II` (the Fragment
Targum), and quotes a variant reading from the other recension in
parentheses after the primary citation:

```html
<a data-ref="Targum Jonathan on Genesis 28:10">Targ. Y. I Gen. XXVIII, 10</a>
(<a data-ref="Targum Jonathan on Genesis 2">II</a> <span dir="rtl">גלל</span>)
```

The `II` is a recension name. The extractor read it as chapter 2 and
linked it to Genesis 2 of the *same* corpus — wrong book location and
wrong recension at once. The reader sees a chapter link where the
page says "the Fragment Targum reads גלל".

A03097, B01137, C00016, C00641, C00746, C00792, C00870, D00461,
D00471, E00341, H00091, H00509, L00086, M01154, M02495, O01073,
P00569, U01065, V00652 — **plus A01133, which is this shape but not
this repair.** Its `I` prefixes the citation that *follows* it and
has no target of its own, so a rule retargeting the family across
recensions would give it a link where the right output is none. It
is carried in the family count of 20 because the misreading is
identical; it is excluded from the 19 rule candidates in
§"Disposition" because the repair is not.

The predicate below selects **21** anchors: this family's 20 plus
B00404, whose truncated `Ib.` also opens with a bare `I` over a
Targum target. Both A01133 and B00404 want their link removed rather
than retargeted, so **any rule built from that predicate must exclude
the two of them explicitly** to land on the 19 candidates.

### B. The numeral is not a numeral — 3 entries

Three separate extraction failures that happen to leave `[IVXLC]+`
inside an anchor. Each was confirmed against the raw JSONL, not the
rendered text:

| Entry | Anchored | What it is | Bogus target |
|---|---|---|---|
| A01250 | `V` | `V.` = *vide*; a Jastrow headword link follows it | Onkelos Deuteronomy 5 |
| A01904 | `LXX` | the **Septuagint** — Greek `ἄρα` follows | Psalms 70 |
| I00606 | `I` | the English pronoun, in `I bring only words` | Bereishit Rabbah 1 |

A01250's period sits *outside* the anchor and is followed by
`<a …>אֵיכָא</a>`, which is what makes it *vide* and not a chapter.
A01904's Greek word is adjacent. I00606's is mid-sentence English
prose. None is a judgment call.

### C. `Ib.` truncated to `I` — 1 entry

B00404 alone: the source reads `…XXXII, 14. <a …>I</a>b. I a. II,
XXXIII, 22.` The anchor swallowed the `I` of `Ib.` (*ibidem*) and
left `b.` orphaned outside it. A mislink, but **not family A's
mislink** — see the repair caveat below.

### D. Correct links the detector cannot recognise — 7 entries, 8 hints

Two sub-shapes, both genuinely correct:

**Parallel-edition chapter (3).** The Tosefta's Zuckermandel and
Vienna chapter numbers differ, and Jastrow prints the second in
parens. A00717 `Tosef. Ab. Zar. III, 16 (IV, beg.)`, A01947
`Tosef. Erub. VIII, 11 (V, end)`, I00311 `V (VI), 1; VIII (IX), 2`.
This is the shape `anchor-swallows-close-paren`'s carve-out already
recognises; these three survive it because content intervenes before
the close paren (`, beg.`, `, end`, `), 1;`) rather than the paren
following the anchor directly.

**Continuation citation with the work name elided (4, 5 hints).**
B00906 `Midr. Till. to Ps. XVIII; CIV end`, C01403 `Pirké d'R. El.
ch. XIX; XX`, G00549 `Ps. CXLVIII a. CL`, M02913 `Prov. I to IX;
X to XXIV; XXV to XXXI`. In each the second numeral inherits the
first citation's work, and the link resolves it correctly.

## The predicate the residue page said did not exist

Family A is not 20 judgments. Run over the healed corpus, this funnel
isolates it:

| Clause | Anchors surviving |
|---|---:|
| anchor display is a bare Roman numeral | 549 |
| …and the display is `I` or `II` | 58 |
| …and the target is a Targum corpus | **21** |
| …and the target's chapter equals the numeral | 21 |
| …and the nearest preceding citation shares the book | 21 |

**Two of those five clauses are vacuous and are recorded as vacuous.**
Chapter-equals-numeral and same-book each cost a line and separate
nothing, which is the residue page's own finding about PR #65's
discriminator arriving a second time — this time inside a predicate
that looked like it was doing five things. The work is done by two
clauses: bare `I`/`II`, and a Targum target.

That is not a coincidence of small numbers. `Targ. Y. I` / `Targ. Y.
II` is recension notation, and recension notation only occurs in
Targum citations, so the corpus clause is the linguistic fact and not
a filter fitted to 21 rows.

The predicate's precision on this set is 21/21 and it takes **none**
of the 7 correct links — every one of those is either a non-`I`/`II`
numeral (`IV`, `V`, `VIII`, `XX`, `CIV`, `CL`, `X`, `XXV`) or a
non-Targum target. Its recall is 21 of 24: it misses A01250, A01904
and I00606, which are three unrelated defects and not a family.

## Why this is a proposal and not a rule

The predicate finds the family. **It does not compute the repair**,
and three sub-shapes want three different repairs:

1. **Retarget across recensions** (the majority). `I` resolves to
   `Targum Jonathan on <Book> <ch>:<v>` and `II` to `Targum
   Jerusalem, <Book> <ch>:<v>`, taking chapter and verse from the
   primary citation. C00870's `II` → `Targum Jerusalem, Genesis
   28:10`; C00016's `I` → `Targum Jonathan on Genesis 34:31`.
   Both corpus names are already in use — 3,982 entries carry
   the `Targum Jonathan on` prefix (with its trailing space), 518
   carry `Targum Jerusalem,`.
2. **Retarget to the same corpus.** P00569's `Targ. Y. Gen. I, 6
   (I ed. Vien. …)` names recension I where the primary carried no
   marker, so the repair equals the preceding target, not its
   opposite.
3. **Remove the link entirely.** A01133's `I` prefixes the citation
   that *follows* it (`I ib. XLIX, 24`), which is separately and
   correctly linked. There is no target for the `I` to take; the
   right output is a bare marker. B00404's `I` is likewise half a
   word — `Ib.` — and wants `Targum Jerusalem, Deuteronomy 33:22` on
   the whole `Ib. … XXXIII, 22`, not a target on the `I`.

A single detector predicate covering three repair shapes is the
determinable-is-not-verifiable trap in its usual form: a rule can
compute (1) and (2) from the preceding anchor,
but a gate whose clause admits (3) as an alternative cannot tell a
correct removal from a failure to retarget. Splitting sub-shape (3)
off is possible — A01133 and B00404 are both identifiable by what
follows the anchor (`b.` with no space; a citation anchor adjacent) —
but that is a second predicate with two members, and two is not a
population to calibrate against.

## Disposition

| | Count | Disposition |
|---|---:|---|
| Family A, sub-shapes 1–2 | 19 | **Rule candidate.** Predicate above; repair from the preceding citation. Maintainer call. |
| Family A, sub-shape 3 (A01133) | 1 | Hand patch. Remove the link. |
| Family C (B00404) | 1 | Hand patch. `Ib.` truncation, unrelated to recensions. |
| Family B | 3 | Hand patch. Three unrelated one-offs. |
| Family D | 7 | **Detector carve-out or accepted false positive.** No data defect. |

The 7 in family D are the honest cost of the current detector and the
only part of this set that a carve-out could retire without touching
data. A carve-out for them is narrower than it looks — the
parallel-edition three are already the `anchor-swallows-close-paren`
shape with content inside the paren, and the continuation four need
"the numeral inherits the preceding anchor's work", which is the
predicate family D and family A's sub-shape 1 would *share*. That
shared predicate is the reason this page recommends adjudicating
family D as accepted false positives rather than carving them out:
a carve-out written to spare the 7 would very likely spare family A
as well, and family A is 20 real defects.

## What this corrects

[`phase-2-residue.md`](phase-2-residue.md) §"`roman-numeral-display`
after the carve-out" says the 31 are "31 entries of judgment" with
nothing deterministic separating them. Two thirds of them are one
family with a two-clause predicate. The sentence should be read as
what it was — a correct rejection of PR #65's discriminator, and an
inference from that rejection to the whole class that this pass does
not support.

The sweep prompt is already correct on the narrower point: `sweep-v5.md`
retired v4's "all inspected ones spurious", and this page's 24/7 split
is the evidence that retirement was right. **An all-spurious prior
would have been wrong on 24 of the 31** — it claims 31 spurious where
7 are, overstating by 24.
