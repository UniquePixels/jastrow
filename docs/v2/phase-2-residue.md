# Phase 2.2 — the detector residue after the rules

**Status: measured 2026-09-02, on `v2` at `eb934a6` plus the
`roman-numeral-display` carve-out (PR #65).** This closes sweep tiering
[Phase 2.2](../specs/2026-08-17-sweep-tiering-design.md) — *"re-run the
structural detector after the rules land; measure the residue"* — and
sizes the population Phase 2.3 has to sweep.

Every number on this page is printed by a committed script. Reproduce
the whole page with:

```bash
bun research:residue
```

## The predicate

An entry is **in the residue** when
`entryAnomalyHints(entry, abbrevTable, headwordIndex, hebrewTable)`
returns at least one hint. That is the same call `tranche.ts`'s `prep`
makes to build chunk inputs, so this is the population a 2.3 sweep
would actually be handed, not a proxy for it.

| Stage | What it is |
|---|---|
| PRE | Source + `applyRepairs`, i.e. `loadPrePatchCorpus()` |
| POST | PRE + `text-repairs` + `structural-repairs` — all 54 rules, in `migrate-dry.ts`'s phase order |

The detector judges each entry against corpus-wide frequency tables
built **from the corpus**, so a transform moves both sides of the
comparison at once. Both readings are reported below; the POST-tables
row is the honest one (it is what a sweep after the rules would see)
and the PRE-tables row isolates the entry-side change from table drift.

## Result

| Measurement | Entries | % of 32,512 | Hints |
|---|---:|---:|---:|
| PRE (repairs only) | 4,339 | 13.3% | 5,435 |
| POST (+rules, PRE tables) | 4,064 | 12.5% | 5,073 |
| **POST (+rules, POST tables)** | **4,082** | **12.6%** | **5,095** |

**−257 entries, −5.9%.** The 18-entry gap between the two POST rows is
table drift, and reporting both is what keeps a future drift from
hiding inside a single number.

### Positive control

The PRE figure reproduces the detector's own recorded baseline exactly.
From `admin/pipeline/research/link-anomalies.ts`:

> Union of all hint kinds: 4,311 entries, 13.3% of the corpus (4,339,
> 13.35%, with the Hebrew-side `hebrew-rare-confusable` rule in
> hebrew-anomalies.ts folded in).

A residue measurement whose PRE side did not reproduce would be
measuring its own predicate, not the corpus. See
`docs/v2/discovery-round-1.md` §4 for the calibration that figure came
from.

## By kind

Kinds overlap on an entry, so these do not sum to the totals above.

| Kind | PRE | POST | Δ |
|---|---:|---:|---:|
| `abbrev-mislink` | 736 | 565 | −171 |
| `bare-abbrev` | 395 | 345 | −50 |
| `inflection-escape-link` | 691 | 645 | −46 |
| `rare-dotted-variant` | 575 | 535 | −40 |
| `one-consonant-diverge` | 817 | 801 | −16 |
| `niqqud-twin-target` | 1,321 | 1,327 | +6 |
| `exact-headword-diverge` | 338 | 343 | +5 |
| `circular-v-ref` | 59 | 59 | 0 |
| `comma-for-period` | 101 | 101 | 0 |
| `hebrew-rare-confusable` | 39 | 39 | 0 |
| `roman-numeral-display` | 31 | 31 | 0 |
| `truncated-formula` | 22 | 22 | 0 |

Five kinds fall and account for the whole improvement. The two small
rises (`niqqud-twin-target` +6, `exact-headword-diverge` +5) are table
drift: a repaired headword changes what the index considers a twin.

## The finding: a detector that could not see its own repair

The first run of this measurement reported the residue going **up** —
4,339 → 4,451. One kind carried the entire rise:
`roman-numeral-display` **31 → 515**.

All 484 gained entries had a transform fire, and the shape is the
output of the catalogued `anchor-swallows-close-paren` repair (493):

```html
(<a class="refLink" data-ref="Tosefta Eiruvin 4:1">IV</a>), 1
```

That is a **parallel-chapter citation**, correctly linked — the numeral
names a variant edition's chapter and the halakha sits outside the
parens. The detector predates the rule and flagged it with the detail
*"which names no citation"*, which the `data-ref` plainly does. Left
alone it would have spent 484 entries of a 2.3 sweep's budget on
non-defects.

Fixed in PR #65: `romanHints` skips an anchor that **is its own
parenthesis**. Measured over the corpus the carve-out drops exactly
those 484 and keeps all 31 the rule already had, so PRE is unchanged —
which is the evidence that it only sees the repair's output.

A semantic predicate was tried first and does not work. Numeral-equals
-chapter fails on `Targ. Y. I Gen. XLIX, 27 (II …)`, where "II" is a
Targum **recension** marker linked to `Genesis 2`: the numeral matches
the chapter on a genuine mislink too.

**The general lesson for 2.3: a detector calibrated on the raw corpus
is not calibrated on the healed one.** Any hint kind whose count rises
after the rules is a candidate for the same defect.

## Two discrepancies this run surfaced

Neither blocks 2.3; both are recorded so the next reader does not
re-derive them.

### 1. The spec's stated baseline does not reproduce

[`2026-08-17-sweep-tiering-design.md`](../specs/2026-08-17-sweep-tiering-design.md)
gives 2.2's done-when as *"Residue count reported (pre-rule baseline:
3,630 entries, 11.2%)"*. That figure appears **once**, in that line,
with no script behind it anywhere in git history. Measured PRE is
**4,339 / 13.3%**, matching the detector module's own docstring.

The detectors have not changed since `d37449b` (2026-08-21), which
committed the spec and the detector modules together, so the gap is not
detector drift. Treat 4,339 as the baseline and the spec line as
superseded.

### 2. Two detector calibrations are stale

`anomalies.ts`'s module docstring records a 2026-08-13 calibration.
Three of its five counts reproduce exactly against this run; two do
not.

| Rule | Docstring | Measured (PRE) |
|---|---:|---:|
| `comma-for-period` | 101 | 101 ✓ |
| `bare-abbrev` | 395 | 395 ✓ |
| `circular-v-ref` | 59 | 59 ✓ |
| `rare-dotted-variant` | 247 | **575** |
| `truncated-formula` | 5 | **22** |

Three exact hits is a strong control on the predicate, so the two
outliers are the docstring's problem, not the measurement's — most
likely calibrated before `applyRepairs` or against a threshold that
later moved. Worth resolving before those two counts are cited again.

## What this hands 2.3

**4,082 entries carrying 5,095 hints.** The spec's cost-creep
mitigation — *"the residue is bounded and measured at 2.2 before any
agent runs"* — is now satisfied with a real number.

Two things to settle before the sweep runs:

1. **Re-check any kind that rose.** The `roman-numeral-display` defect
   was found because the total moved the wrong way; the same check
   applies to `niqqud-twin-target` and `exact-headword-diverge`, whose
   small rises are attributed to table drift here but not proven so.
2. **Resolve the two stale calibrations above**, since
   `rare-dotted-variant` at 535 entries is the fourth-largest kind in
   the residue and its docstring count is less than half that.
