# Phase 2.2 — the detector residue after the rules

**Status: measured 2026-09-02, on `v2` at `e190d8a`.** This closes
sweep tiering [Phase 2.2](../specs/2026-08-17-sweep-tiering-design.md)
— *"re-run the structural detector after the rules land; measure the
residue"* — and sizes the population Phase 2.3 has to sweep. The two
follow-ups it originally handed 2.3 have since been worked and the
page rewritten around what they found; §"What the rules created"
below is that work, and it is the part to read before the sweep runs.

Every number on this page is printed by a committed script. Reproduce
the whole page with:

```bash
bun research:residue
```

The one exception is flagged where it appears: the two forensic
figures that retire `rare-dotted-variant`'s old calibration in
§"Two discrepancies" came from one-time probes, and the shape of each
probe is written out beside its number rather than left to a script
nothing else runs.

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

Three columns, not two. A kind's net delta is the sum of two moves
that can point opposite ways: the **entry** move, where a transform
changed the text the detector reads, and the **tables** move, where a
transform changed what the corpus counts as normal. A two-column table
reports their sum and shows neither half.

| Kind | PRE | POST, PRE tables | POST | net | entry | tables |
|---|---:|---:|---:|---:|---:|---:|
| `abbrev-mislink` | 736 | 565 | 565 | −171 | −171 | 0 |
| `bare-abbrev` | 395 | 326 | 345 | −50 | **−69** | **+19** |
| `inflection-escape-link` | 691 | 645 | 645 | −46 | −46 | 0 |
| `rare-dotted-variant` | 575 | 539 | 535 | −40 | −36 | −4 |
| `one-consonant-diverge` | 817 | 801 | 801 | −16 | −16 | 0 |
| `niqqud-twin-target` | 1,321 | 1,323 | 1,327 | +6 | +2 | +4 |
| `exact-headword-diverge` | 338 | 343 | 343 | +5 | **+5** | **0** |
| `circular-v-ref` | 59 | 59 | 59 | 0 | 0 | 0 |
| `comma-for-period` | 101 | 101 | 101 | 0 | 0 | 0 |
| `hebrew-rare-confusable` | 39 | 39 | 39 | 0 | 0 | 0 |
| `roman-numeral-display` | 31 | 31 | 31 | 0 | 0 | 0 |
| `truncated-formula` | 22 | 22 | 22 | 0 | 0 | 0 |

An earlier version of this page read the two small rises as table
drift — *"a repaired headword changes what the index considers a
twin"*. The split says otherwise. `exact-headword-diverge` moves +5 on
the entry side and **0** on the tables, so no part of it is drift;
`niqqud-twin-target`'s +6 is +2 entry and +4 tables. And `bare-abbrev`,
which the two-column table showed falling a clean 50, is −69 on the
entry side with **+19 handed back by the tables** — a rise the net
delta hid entirely inside a fall.

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

## What the rules created

The section above found its defect because a total moved the wrong
way. That is a weak instrument: a kind can gain entries and lose more,
and the net reports the difference. The measurement now differences
**hint identities** — kind *and* detail string, per `rid` — so a hint
the rules created is counted whether or not it changed which kinds an
entry carries.

**96 hints on 94 entries.** The kind-level view sees 49 of those
entries; the other 45 kept every kind they had and changed only which
complaint the detector makes.

| Kind | Hints created | On entries new to the kind |
|---|---:|---:|
| `abbrev-mislink` | 39 | 4 |
| `bare-abbrev` | 23 | 23 |
| `rare-dotted-variant` | 12 | 11 |
| `one-consonant-diverge` | 6 | 0 |
| `exact-headword-diverge` | 5 | 5 |
| `inflection-escape-link` | 5 | 1 |
| `niqqud-twin-target` | 5 | 5 |
| `roman-numeral-display` | 1 | 0 |

`one-consonant-diverge` is the shape the net delta cannot see at all:
6 hints created, 0 entries new to the kind, and a net of −16.

### Enrichment names the rule without opening an entry

Each gained entry carries the ids of the rules that fired on it, so
the gained set can be compared against the corpus. The column that
matters is a rule's share of the 94 over its share of the 32,512 —
volume alone puts a common rule at the top of a raw count.

| Rule | On gained | Corpus-wide | Enrichment |
|---|---:|---:|---:|
| `v-sub-redirect-stub-mislink` | 29 | 50 | **200.6x** |
| `citation-number-truncated-outside-anchor` | 1 | 12 | 28.8x |
| `impossible-dagesh` | 1 | 12 | 28.8x |
| `open-paren-in-anchor-display` | 9 | 214 | 14.5x |
| `holam-migrated-off-mater-vav` | 17 | 440 | 13.4x |
| `shin-sin-dot-drop` | 1 | 35 | 9.9x |
| `emphasis-run-edge-space` | 8 | 304 | 9.1x |

`italic-swallowed-terminal-period` leads the raw count at 26 of 94 and
sits at 6.8x, which is what a broad rule looks like. `bare-rtl-hebrew`
fires on 15 of the 94 at **1.1x** — that is the null.

### The finding: 29 hints are the detector reading a correct repair

`v-sub-redirect-stub-mislink` fires on 50 corpus entries. **29 of them
gained a hint.** No other rule comes near that rate, and the shape is
identical across all 29:

> `'חִיסּ׳'` abbreviates this entry's own headword or an inflected form
> (`חִסּוּלָא`) but its link targets `חִיסּוּלָא`

The link going somewhere other than the host headword is not a defect
here. It is the repair. From `v-sub-twin.ts`:

> The correct target is the host's own SPELLING TWIN — the plene or
> defective spelling of the same word

The host `חִסּוּלָא` is defective, the stub abbreviates the plene form
`חִיסּ׳`, and the rule sends it to the plene twin `חִיסּוּלָא` at H00831
— display and target agree, and only the host is spelled differently.
`abbrev-mislink` predates the rule, matches the abbreviation against
the host's consonants, and reads a deliberate redirect as a mislink.

This is the `roman-numeral-display` defect again, at 29 hints instead
of 484, and it is the second instance of a general rule: **a detector
calibrated on the raw corpus is not calibrated on the healed one.**
The instrument that found it — enrichment over the created-hint set —
did not need a rise, a threshold, or an entry read by eye.

### `roman-numeral-display` after the carve-out

The 31 surviving entries are not more of the same. Every one of the 32
POST hints has a numeral equal to its target's leading chapter — the
predicate PR #65 rejected is now **100% saturated** on the survivors,
so it separates nothing. What is left is a genuine judgment split:

- `Targ. Y. II Gen.` linked to `Genesis 2` — the numeral is a
  **recension** marker read as a chapter, a real mislink.
- I00311's `Tosef. Ab. Zar. V (VI), 1; VIII (IX), 2`, where `VIII`
  links to `Tosefta Avodah Zarah 8:2` — a continuation citation whose
  tractate name is elided, correctly linked.

Nothing deterministic tells those apart. 31 entries of judgment is the
right disposition for them, and 2.3 is where it happens.

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

### 2. Two detector calibrations were stale — resolved

`anomalies.ts`'s module docstring records a 2026-08-13 calibration.
Three of its five counts reproduce exactly against this run; two did
not, and both are now corrected in the docstring itself.

| Rule | Docstring was | Measured (PRE) |
|---|---:|---:|
| `comma-for-period` | 101 | 101 ✓ |
| `bare-abbrev` | 395 | 395 ✓ |
| `circular-v-ref` | 59 | 59 ✓ |
| `rare-dotted-variant` | 247 | **575** |
| `truncated-formula` | 5 | **22** |

Three exact hits is the control that makes the two outliers the
docstring's problem rather than the measurement's.

`truncated-formula` is explained: 5 is the count for the `D. S. a.`
pattern alone, and the calibration predates the second entry in
`TRUNCATED_FORMULAS`, whose own detail line cites a corpus figure the
module summary never absorbed. Measured split is 5 + 17.

`rare-dotted-variant` is **not** explained and does not reproduce.
Three one-time probes, none of which is `research:residue`:

- Not `applyRepairs` drift. Running `entryAnomalyHints` over the raw
  source and over the post-repair corpus gives **575 both times**.
- Not a shallower sense walk. Counting only top-level
  `content.senses[].definition`, without the recursion into nested
  senses, gives **520** — the wrong direction and the wrong size.
- Not a moved threshold. Re-running the rule over the grid `maxRare`
  1–5 x `minSibling` 100/200/500/1000 gives entry counts from 87 to
  575, and **no cell is 247**; the nearest are 226 and 259.

Treat it the way this page treats the spec's 3,630 baseline:
superseded, with the method that retired it recorded rather than the
number.

## What this hands 2.3

**4,082 entries carrying 5,095 hints.** The spec's cost-creep
mitigation — *"the residue is bounded and measured at 2.2 before any
agent runs"* — is satisfied with a real number.

Both follow-ups this page originally listed are worked. The stale
calibrations are corrected in `anomalies.ts`. The re-check ran, and it
ran wider than "any kind that rose": the unit is a created hint, not a
net delta, and the population is 96 hints on 94 entries rather than
the two kinds the net pointed at.

What it leaves for 2.3, in order:

1. **29 hints are known false positives** — `abbrev-mislink` reading
   `v-sub-redirect-stub-mislink`'s deliberate retarget. Carving them
   out of the detector before the sweep is the same move PR #65 made
   for the 484, at 1/16th the size. Until it lands, the sweep will be
   handed them.
2. **65 created hints are unadjudicated.** They are not a random
   sample of the residue: every one sits on an entry a transform
   touched, which is where a rule's own mistakes live.
3. **31 `roman-numeral-display` entries need judgment, not a
   predicate.** Sized and argued above; nothing deterministic splits
   them.

The rest — 4,082 entries less whatever items 1–3 retire — is the
sweep population the spec's 2.3 line describes.
