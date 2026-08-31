# `sense-number-outside-closed-grammar` — re-scoped 111 → 6

**Ruling: Brian, 2026-08-29 (batch 7).** The row stays on the transform
queue and stays in `PENDING`, at **6 entries** rather than 111. It is
not discarded, and the reason it is not is the whole point of the
re-scope: a discard would leave 6 measured defects surfaced by nothing
executable.

Gate: `admin/pipeline/transform/rules/sense-marker-corpus.test.ts` §4.
Batch report: `docs/v2/transform-batch-7.md` §2.

## The row's name has been false since before Phase 2 opened

Catalogued: 111 entries / 113 tokens — `*2)`×74, `*3)`×19, `*4)`×9,
`-2)`×5, `*1)`×3, `*5)`×1, `*6)`×1, `[1)`×1. **Not one of the 113 is
outside the closed grammar today.** Measured on
`applyTransforms(applyRepairs(source).entry, 'text-repairs')` over all
32,512 entries of the pinned snapshot.

### 107 were never outside it

`admin/pipeline/body/labels.ts`:

```ts
const LABEL = /^(?<dash>—)?(?<star>\*)?(?<label>\d+|[a-z])\)$/u;
```

The star is a **parsed field**, not a quarantine trigger. All 107 `*N)`
markers parse, and `printLabel` regenerates each byte-exactly. The
module's own docstring names the two shapes that *do* quarantine — and
neither is a starred marker:

> Two shapes fall outside that grammar and are unparseable by design:
> `"[1)"` (one occurrence, rid D00341 …) and `"-2)"` (five occurrences
> …).

The token census reproduces to the digit: `{'*1)': 3, '*2)': 74,
'*3)': 19, '*4)': 9, '*5)': 1, '*6)': 1}` = 107.

### 6 are repaired before any transform runs

`repairs.ts`'s "04 — sense-label quarantine repairs" turns the five
`-2)` ASCII hyphens into `—2)` and moves D00341's `[1)` bracket into the
sense text. Tokens quarantining to `{unknown}`:

| | raw source | after `applyRepairs` |
|---|---:|---:|
| `-2)` | 5 | 0 |
| `[1)` | 1 | 0 |
| **total** | **6** | **0** |

This is batch 6a's `binyan-form-*` shape for the third time, and the
step that found it is the same one line — count the population in
`applyRepairs(entry).entry`, not in `entry`. What is new here is only
*when*: batch 6a measured after writing a rule; this batch measured
before, and no rule was ever written.

### 101 are repaired by the partner row's rule

`strandedDashStarMarker` (batch 7) rejoins the stranded em dash onto the
starred marker, repairing exactly the 101 `*N)` markers that carry one.
Both catalogue rows said this was one event and had to be transformed in
one step; it is, and the rule is registered under
`trailing-em-dash-tail`.

## What is left, and why it is 6

| | tokens | left after |
|---|---:|---:|
| catalogued | 113 | |
| repaired by `applyRepairs` (04) | 6 | 107 |
| repaired by `strandedDashStarMarker` | 101 | 6 |

The 6 are `A00510`, `A02000`, `B00005`, `M00591`, `N01131`, `P01184` —
each a `*N)` at sibling position > 0 with **no** stranded em dash on the
previous sibling. They reconcile the catalogued token census exactly:

| token | catalogued | with a dash | residual |
|---|---:|---:|---:|
| `*2)` | 74 | 72 | 2 |
| `*3)` | 19 | 18 | 1 |
| `*1)` | 3 | 0 | 3 |
| `*4)`/`*5)`/`*6)` | 11 | 11 | 0 |

`A02000`'s predecessor ends `—[`, which is `stranded-open-bracket`'s
shape rather than this one — so even the 6 may not all belong here, and
the row is the right place for that question to stay visible.

## The entanglement edge was deleted, and the deletion needed its own pin

The two rows declared each other in `entangledWith`. After the rule
ships the edge is **measurably dead**: each row's remainder is defined
by the absence of what the other needs — 31 stranded dashes with no
starred successor, 6 starred markers with no stranded dash — and
measured after the whole `structural-repairs` phase the two remainders
share **0 entries**.

The edge was deleted from both rows. **Neither entanglement gate can
witness that deletion.** `unaccountedEdges` excludes both-unregistered
edges by design, and `entangledClusters` derives over registered rules,
so this edge was never in a cluster — measured before and after: 5
clusters both times, neither row in any of them. `registry.ts`'s claim
that "only pinning the cluster set notices" a deletion is therefore
false for this class, and is corrected in place. The deletion is pinned
directly instead, in the corpus test §7, and the ordering was chosen to
match: the rule was registered FIRST, so `unaccountedEdges` reported the
surviving half-edge in the open before it was removed.

---

# §2 — Batch 8: the remaining 6 are withdrawn to `judgment`

**RULED 2026-08-30 (Brian): WITHDRAWN TO `judgment`,** `route:
judgment` in `patterns.jsonl`, the id taken out of `PENDING` in
`admin/pipeline/transform/registry.ts`. `blocking` is left as recorded.

Batch 7 re-scoped this row 111 → 6 and kept it on the transform queue
rather than discarding it, on the stated ground that "discarding it
would leave those 6 surfaced by nothing executable". Batch 8 read the 6.

## The 6 reproduce exactly

Measured at the composed stage over all 32,512 entries — a `*N)` in a
`number` at sibling position > 0 whose previous sibling's definition does
not end in an em dash — the population is **6**, the same rids batch 7
named: `A00510`, `A02000`, `B00005`, `M00591`, `N01131`, `P01184`.

## Nothing is broken downstream, and batch 7 established why

`body/labels.ts`'s `LABEL` is
`/^(?<dash>—)?(?<star>\*)?(?<label>\d+|[a-z])\)$/u`. The star is a
PARSED FIELD, not a quarantine trigger, and `printLabel` regenerates
every one of these byte-exactly. None of the 6 quarantines to
`{unknown}`; none reaches a reader as debris.

So a rule here would not be repairing a parse failure. It would be
asserting that an em dash is MISSING, and writing one.

## Measured on each predecessor, the 6 split three ways and no arm survives

| rid | marker | predecessor | what it is |
|---|---|---|---|
| `B00005` | `*1)` | `number: ""` | first numbered sibling of its run |
| `N01131` | `*1)` | `number: ""` | first numbered sibling of its run |
| `P01184` | `*1)` | `number: ""` | first numbered sibling of its run |
| `A02000` | `*2)` | ends `—[` | `stranded-open-bracket`'s shape |
| `A00510` | `*3)` | ends `". "` | dash lost; has a dashed sibling |
| `M00591` | `*2)` | ends `". "` | dash lost; **no** dashed sibling |

**Three are first-in-run.** The corpus convention puts the em dash on
continuation markers, not on the first — `B00005`, `N01131` and
`P01184` all have a following `—2)`, which is the shape a correct run
has. Nothing is missing from them, so there is nothing for a rule to
write.

**One is another row's.** `A02000`'s predecessor ending `—[` was
already assigned to `stranded-open-bracket` in §1 above.

**Two are dash-losses, and only one of them is witnessable.**
`A00510`'s sibling list holds a `—2)`, so a rule could declare its dash
through `copied` and have the gate verify it against that sibling —
`continuationMarkerDash`'s exact mechanism. `M00591`'s list is `1)`,
`*2)`: there is no dashed member, so its dash could only be declared
through `allows`, which licenses the codepoint across the whole diff on
a maintainer's word. That is the declaration `continuationMarkerDash`
deliberately refused, and its reasoning is recorded in
`rules/continuation-marker.ts`: the mixed-list predicate "is exactly
what guarantees the witness is there. Drop that requirement and the
declaration stops being checkable."

A rule for `A00510` alone repairs one entry and leaves five on a
blocking row, which is not worth a registry entry, an order
classification and a commutation pair.

## Why `judgment` and not a discard

A discard says something else owns the row. Nothing else owns these 6 —
`strandedDashStarMarker` refuses them by predicate and
`stranded-open-bracket` claims only `A02000`. `judgment` says no rule
can be stated while the question stays visible, which is the accurate
statement here: the row's remaining question is whether print puts a
dash on `A00510` and `M00591`, and that is answered by reading the 1903
edition, not by the corpus.

## What reopens it

Reading those two entries against print. If print shows a continuation
dash on either, `A00510` is immediately shippable on
`continuationMarkerDash`'s terms and `M00591` becomes a one-entry
`allows` with a documented external witness rather than an assertion.
