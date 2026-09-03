# Phase 2.2 — the detector residue after the rules

**Status: measured 2026-09-02, on `v2` at `e190d8a`; re-measured the
same day after 2.3's first pass moved the detector again — see
[`phase-2-created-hints.md`](phase-2-created-hints.md), and §"The
detector moved three times" below for the audit chain.** This closes
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

The detector itself moved twice. §"The finding" below carves
`v. sub` redirect stubs out of `abbrev-mislink`; 2.3's first pass then
replaced the Latin tokenizer, which had been reading a rendered space
at every tag boundary and no break at all across an em dash. Every
number on this page is measured against the detector **after both**,
and the earlier reading is given wherever it is the one another
document cites.

The detector judges each entry against corpus-wide frequency tables
built **from the corpus**, so a transform moves both sides of the
comparison at once. Both readings are reported below; the POST-tables
row is the honest one (it is what a sweep after the rules would see)
and the PRE-tables row isolates the entry-side change from table drift.

## Result

| Measurement | Entries | % of 32,512 | Hints |
|---|---:|---:|---:|
| PRE (repairs only) | 4,217 | 13.0% | 5,351 |
| POST (+rules, PRE tables) | 4,046 | 12.4% | 5,117 |
| **POST (+rules, POST tables)** | **4,049** | **12.5%** | **5,121** |

**−168 entries, −4.0%.** The 3-entry gap between the two POST rows is
table drift, and reporting both is what keeps a future drift from
hiding inside a single number.

### The detector moved three times

Each move is a deliberate predicate change, and the chain is recorded
so the next reader can tell one from drift.

| Predicate | PRE | POST |
|---|---:|---:|
| as calibrated | 4,339 | 4,082 |
| − `v. sub` carve-out | 4,187 | 3,946 |
| + `latinTokens` | **4,217** | **4,049** |

The `v. sub` carve-out is worth 136 entries off the population 2.3 is
handed; `latinTokens` gives 103 back, retiring 130 hints that were
never defects and exposing a class of abbreviation the tokenizer had
never been able to see. Its full accounting is in
[`phase-2-created-hints.md`](phase-2-created-hints.md).

### Positive control

Run against the detector as it stood before this page's carve-out, the
PRE figure reproduces the detector's own recorded baseline exactly.
From `admin/pipeline/research/link-anomalies.ts`:

> Union of all hint kinds: 4,311 entries, 13.3% of the corpus (4,339,
> 13.35%, with the Hebrew-side `hebrew-rare-confusable` rule in
> hebrew-anomalies.ts folded in).

**4,339, exactly.** A residue measurement whose PRE side did not
reproduce would be measuring its own predicate, not the corpus. See
`docs/v2/discovery-round-1.md` §4 for the calibration that figure came
from.

The two carve-outs then move PRE to 4,187 and 4,217 by design — they
change the predicate, which is the one thing that legitimately moves a
control. Every figure in the chain is recorded in the detector
modules' docstrings so the next reader can tell a predicate change
from drift.

## By kind

Kinds overlap on an entry, so these do not sum to the totals above.

Three columns, not two. A kind's net delta is the sum of two moves
that can point opposite ways: the **entry** move, where a transform
changed the text the detector reads, and the **tables** move, where a
transform changed what the corpus counts as normal. A two-column table
reports their sum and shows neither half.

| Kind | PRE | POST, PRE tables | POST | net | entry | tables |
|---|---:|---:|---:|---:|---:|---:|
| `abbrev-mislink` | 584 | 429 | 429 | −155 | −155 | 0 |
| `inflection-escape-link` | 691 | 645 | 645 | −46 | −46 | 0 |
| `one-consonant-diverge` | 817 | 801 | 801 | −16 | −16 | 0 |
| `bare-abbrev` | 319 | 317 | 317 | −2 | −2 | 0 |
| `circular-v-ref` | 59 | 59 | 59 | 0 | 0 | 0 |
| `comma-for-period` | 108 | 108 | 108 | 0 | 0 | 0 |
| `hebrew-rare-confusable` | 39 | 39 | 39 | 0 | 0 | 0 |
| `rare-dotted-variant` | 705 | 705 | 705 | 0 | 0 | 0 |
| `roman-numeral-display` | 31 | 31 | 31 | 0 | 0 | 0 |
| `truncated-formula` | 22 | 22 | 22 | 0 | 0 | 0 |
| `exact-headword-diverge` | 338 | 343 | 343 | +5 | **+5** | **0** |
| `niqqud-twin-target` | 1,321 | 1,323 | 1,327 | +6 | +2 | +4 |

An earlier version of this page read the two small rises as table
drift — *"a repaired headword changes what the index considers a
twin"*. The split says otherwise. `exact-headword-diverge` moves +5 on
the entry side and **0** on the tables, so no part of it is drift, and
`niqqud-twin-target`'s +6 is +2 entry and +4 tables.

The two Latin kinds are the ones this table no longer has anything to
say about, and that is the finding rather than the absence of one.
Against the old tokenizer `bare-abbrev` read 395 → 326 → 345: a net of
−50 that was −69 on the entry side with **+19 handed back by the
tables**, a rise the net delta hid entirely inside a fall. It now
reads −2 / 0, and `rare-dotted-variant` 0 / 0. Both of those columns
were measuring a period that a tag boundary had moved out of reach of
the tokenizer, not a transform's effect on the corpus.

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

This is an **entry-side** count, holding the tables fixed, and it has
to be: a frequency hint's detail quotes the counts the tables hold
(*"bare 'v' where the corpus writes 'v.' 36429x vs bare 6x"*), so any
table shift renames every such hint. Differencing identities across
the two POST readings reports 400 creations for a net of +22 — an
artifact of the detail string, not a finding. The table-side move is
real and is reported where it is measurable, in the `tables` column
of the by-kind table above.

**96 hints on 94 entries** as first measured; **67 on 65** after the
`v. sub` carve-out below; **32 on 30** after 2.3's first pass retired
the two Latin columns as tokenizer artifacts. The kind-level view saw
49 of the original 94; the other 45 kept every kind they had and
changed only which complaint the detector makes.

| Kind | Hints created | On entries new to the kind |
|---|---:|---:|
| `abbrev-mislink` | 39 → **10** | 4 → **1** |
| `bare-abbrev` | 23 → **0** | 23 → **0** |
| `rare-dotted-variant` | 12 → **0** | 11 → **0** |
| `one-consonant-diverge` | 6 | 0 |
| `exact-headword-diverge` | 5 | 5 |
| `inflection-escape-link` | 5 | 1 |
| `niqqud-twin-target` | 5 | 5 |
| `roman-numeral-display` | 1 | 0 |

`one-consonant-diverge` is the shape the net delta cannot see at all:
6 hints created, 0 entries new to the kind, and a net of −16.

The 35 that left were not adjudicated away one at a time. All 23
`bare-abbrev` and all 12 `rare-dotted-variant` were one defect —
`stripTags` rendering an inline tag boundary as a space, so a repair
that moved a period out of an italic run orphaned it from its word.
Worked in [`phase-2-created-hints.md`](phase-2-created-hints.md).

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

After the carve-out `v-sub-redirect-stub-mislink` leaves the table
entirely: not one of its 50 entries gains a hint. The rest of the
ranking is unchanged in order, with `open-paren-in-anchor-display` at
21.0x and `holam-migrated-off-mater-vav` at 19.3x now leading it.

The tokenizer fix then halves the gained set again, to 30, and the
ranking moves with it: `open-paren-in-anchor-display` 40.5x on 8 and
`holam-migrated-off-mater-vav` 39.4x on 16. The instrument's own
diagnostic is `italic-swallowed-terminal-period`, which led the raw
count at 26 of 94 and 6.8x and now sits at 3 of 30 and 2.4x — the
distance between those two readings is exactly the 23 hints that were
never its doing. The current table is in
[`phase-2-created-hints.md`](phase-2-created-hints.md).

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

### The carve-out

`headwordHints` now skips a geresh display whose anchor is preceded by
`v. sub` or `v. sub.`, walking back over whitespace by character
comparison so a late anchor costs what an early one does. The phrase
is adjacent to the anchor by construction, and a wider search would
start matching a `v. sub` from a neighbouring clause.

Both spellings are load-bearing: 45 of the 50 entries the transform
repairs write `v. sub`, and **5 write `v. sub.`** — a predicate
matching only the first carves out forty-five of them.

| | Before | After |
|---|---:|---:|
| `abbrev-mislink`, PRE | 736 | 584 |
| `abbrev-mislink`, POST | 565 | 429 |
| Residue, POST | 4,082 | 3,946 |
| Hints the rules created | 96 | 67 |

The 29 are gone and no other created hint is. The carve-out reaches
further than them, though, and the extra reach is the honest part to
state. 225 corpus entries carry the shape, and **155 of them were
flagged before the carve-out** — 152 lose the kind outright, and 3
keep it through a second geresh anchor that is not a redirect, which
is the evidence the carve-out is scoped to the anchor and not to the
entry.

Of those 155, **only 50 were ever wrong**, and those 50 are the ones
`v-sub-redirect-stub-mislink` now repairs. The other 105 were correct
redirects the detector had always misread. Its premise —

> A geresh abbreviation of one of this entry's own forms must link to
> this entry, not to some other word sharing the opening letters.

— is simply false for an entry whose whole content is "see under X".
So the carve-out does not trade precision for recall on the healed
corpus: it drops 105 hints that were never findings, and 50 whose
finding the transform has already made.

Two positive controls in `link-anomalies.test.ts` keep this from being
a rule that cannot fail: the same markup with `, cmp.` in front of it
must still fire, and so must a bare `sub` with no `v.` before it. If
either stops firing, the four carve-out assertions stop meaning
anything.

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

The sweep prompt said otherwise. v4's hint table described this kind
as *"31 corpus-wide, all inspected ones spurious"* — true of what had
been inspected, false of the class, and a prior that would have had a
2.3 agent mark I00311 spurious for the same reason the detector did.
Corrected in [`sweep-v5.md`](../../admin/pipeline/research/prompts/sweep-v5.md),
along with the `v. sub` carve-out, which v4 also contradicts.

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

### 2. Two detector calibrations were stale — resolved, and a third
thing was worse

`anomalies.ts`'s module docstring records a 2026-08-13 calibration.
Three of its five counts reproduce exactly against this run; two did
not, and both are corrected in the docstring itself.

The audit stopped at the counts, and that was the gap. The docstring
also names one **entry** per rule as the rule's catch, and 2.3's first
pass found that `bare-abbrev`'s — A00074, `bot` for `bot.` — has never
fired: its `bot—V.` binds two tokens across an em dash and the
tokenizer rejected the whole token. A count that has drifted still
measures something; a named control that does not fire measures
nothing. The tokenizer is fixed and A00074 now fires; the counts below
are the pre-fix readings this audit was run against, and the post-fix
ones are in
[`phase-2-created-hints.md`](phase-2-created-hints.md).

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

**4,049 entries carrying 5,121 hints.** The spec's cost-creep
mitigation — *"the residue is bounded and measured at 2.2 before any
agent runs"* — is satisfied with a real number.

Both follow-ups this page originally listed are worked. The stale
calibrations are corrected in `anomalies.ts`. The re-check ran, and it
ran wider than "any kind that rose": the unit is a created hint, not a
net delta, and the population it found was 96 hints on 94 entries
rather than the two kinds the net pointed at — 67 on 65 once the
carve-out those 96 exposed had landed, and 32 on 30 once 2.3's first
pass had taken the tokenizer defect the remaining Latin columns were
made of.

What it leaves for 2.3, in order:

1. **32 created hints on 30 entries are unadjudicated.** They are not
   a random sample of the residue: every one sits on an entry a
   transform touched, which is where a rule's own mistakes live. The
   enrichment ranking says where to start —
   `open-paren-in-anchor-display` at 40.5x on 8 entries and
   `holam-migrated-off-mater-vav` at 39.4x on 16. This began as 67 on
   65; 2.3's first pass retired 35 of them as one tokenizer defect,
   in [`phase-2-created-hints.md`](phase-2-created-hints.md).
2. **31 `roman-numeral-display` entries need judgment, not a
   predicate.** Sized and argued above; nothing deterministic splits
   them.
3. **The remaining 4,049 − (1) − (2) is the sweep population** the
   spec's 2.3 line describes: *"one targeted Opus pass over the
   judgment residue only"*.

The 29 `v. sub` false positives that stood here are carved out and no
longer reach the sweep, and so are the 35 the tokenizer was
manufacturing.
