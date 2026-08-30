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
