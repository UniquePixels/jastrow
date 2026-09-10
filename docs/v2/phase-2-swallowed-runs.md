# Swallowed sense runs beyond `—2)`

**Question.** Doc 08's census (`IMPLIED_ONE_CENSUS`, 79 rids) detects
exactly one shape: an unnumbered sense whose tag-stripped definition
carries a `—2) ` run with no `1)` before it. A local CodeRabbit review
of `fix/implied-one-confirmed-rows` observed that `I00111`, after its
doc-08 split, still carries a `—3)` inside the new sense 2. Are
swallowed runs at markers other than `—2)` a real, countable class?

**Answer: yes, and it is two classes, not one.**

| Class | Count | Reader-visible today |
| --- | --- | --- |
| A — tail residue a doc-08 split leaves behind | 11 of the 79 census rows | 2 rows ship the defect on this branch |
| B — entries whose run opens at `—3)`/`—4)` | 3 entries (entry-scoped, composed) | not yet repaired |

Class A is the CodeRabbit finding and is the actionable one. Class B is
real but small.

## Predicate

The census predicate generalized to any `—N)` run, N >= 2:

```
MARKER = /(?<![0-9])—(\d+)\)\s/gu
```

For each **unnumbered** sense, tag-strip the definition (the census's
fixed-point `stripTags`), then flag a match at index `i` with number
`N` when `${N - 1})` does not occur in the text before `i`.

At `N = 2` this is byte-identical to the committed detector. The
`(?<![0-9])` guard is new and load-bearing: without it the N >= 3
sweep collects verse and note ranges — `Deut. XXXII, 1—43)`,
`Num. XV, 37—41)`, `Rabb. D. S. notes 2—4)` — 8 of 16 raw hits were
that artefact. The guard removes all 8 and changes nothing at N = 2.

**Sense-scoped vs entry-scoped.** The committed detector looks for
`N-1)` only inside the same sense. That is sound at N = 2, where the
missing `1)` is the whole point. At N >= 3 it is weaker: a sibling
sense earlier in document order may already carry `2)`. Both scopings
are reported below; entry-scoped is the stricter reading.

## Controls

- **Positive control.** The generalized predicate restricted to N = 2,
  over raw source, returns exactly `IMPLIED_ONE_CENSUS`: 79 rids,
  sorted lists identical, no extras, no misses.
- **The predicate can fail.** 67 of the 79 census rows have a clean
  tail, and `D00072` resolves no host at all (it is already repaired
  by `repairs.ts`), so Class A's 11 is a discrimination, not a
  tautology.
- **Populations.** Residue 3,729; sweep population 3,668, matching
  `residue-sweep.ts`.

## Class B — runs opening above `—2)`

Unnumbered senses, guarded marker, per marker number:

| N | raw, sense-scoped | raw, entry-scoped | composed, sense-scoped | composed, entry-scoped | composed entry-scoped, in sweep |
| --- | --- | --- | --- | --- | --- |
| 2 | 79 | 68 | 78 | 67 | 24 |
| 3 | 8 | 3 | 3 | 3 | 2 |
| 4 | 1 | 0 | 1 | 0 | 0 |

Composed = `applyRepairs` then `text-repairs` then
`structural-repairs`, the state `seed-implied-one.ts`'s
`composedEntry` addresses. The N = 2 row loses one entry under
composition (`D00072`, already repaired). The N = 3 row loses five:
the transform rules already fix `H00107`, `J00312`, `L00165` and
`S01730`, and the entry-scope test removes the rest.

Three entries survive both filters — the whole of Class B:

| rid | N | in sweep | opening text |
| --- | --- | --- | --- |
| `K00599` | 3 | yes | `…a. e.—3) also כַּפָּא … shore, border.` |
| `L00565` | 3 | yes | `…a. fr.—3) to learn, study.` |
| `O01387` | 3 | no | `…Ib. VII, 9 (10).—3) to look out for, provide…` |

`O01387` produces no anomaly hint, so no sweep chunk will ever contain
it. `K00599` and `L00565` are queued.

## Class A — the tail a `—2)` split leaves swallowed

Split semantics (`schema.ts`): the new sibling takes
`number = "—2)"` and `definition` = everything after the marker. The
host keeps the text before it. So a three-sense run splits into a
gloss and one sibling that still holds `—3)` as literal text — and
because that sibling is now **numbered**, the census predicate skips
it. Neither the census nor `seed-implied-one.ts` can see this: the
generator asserts `—2)` occurs exactly once, and asserts nothing about
higher markers.

Composed census rows whose `—2)` tail still carries a guarded run:

| rid | tail markers | seeded 2026-09-09 | in sweep |
| --- | --- | --- | --- |
| `C00805` | 3 | **yes** | no |
| `E00005` | 3 | no | yes |
| `E00148` | 3, 4 | no | yes |
| `E00298` | 3 | no | yes |
| `I00111` | 3 | **yes** | yes |
| `I00661` | 3 | no | yes |
| `I00822` | 3 | no | yes |
| `P00816` | 3 | no | no |
| `P00856` | 3, 4, 5, 6 | no | yes |
| `Q00990` | 3 | no | no |
| `S01355` | 3 | no | yes |

11 rows; 8 inside the sweep population; 2 inside the 28 seeded pairs.

### Two rows ship the defect on this branch

`3920ab644` rewrote the truth layer with the seeds, so `C00805` and
`I00111` carry the split in `data/entries/` today, and the reader sees
the swallowed run as literal text:

- `I00111` sense 2, unit 4 ends
  `…v. לְוָיְיתָא; a. fr.—3) much; many; very.`
- `C00805` sense 2 gloss ends
  `…v. גִּידָּא II.]—3) name of a disease, a sort of fever (?).`

Sense 3 exists in print in both. The split is incomplete, not wrong:
it repaired the implied `1)` and left the rest of the run inside the
sibling it created. The pre-split entry rendered as one run-on sense;
the post-split entry renders as two, the second still run-on. Net
defect count per entry falls by one, it does not reach zero.

### `I00661`'s recorded exclusion does not hold

Doc 08 says `I00661` is deliberately not seeded because it "no longer
presents the census shape after the transform phases run — its in-text
`—2)` is gone by the time patches apply". Re-derived through
`composedEntry` exactly: `isImpliedOneCandidate` returns **true**,
the host definition contains `—2)` exactly once, and `seedPair`
produces a valid split/retag pair. The row also carries the
maintainer's own 2026-08-13 note, "there are uncatogorized 2 and 3
senses as well" — which describes Class A a month before it was
measured. Whatever the real reason for holding `I00661` back, the
written one is falsifiable and false.

## Context, unadjudicated

Across the composed corpus, 302 entries carry at least one guarded
in-text `—N)` marker (359 markers), and 223 of those host senses are
already numbered. That is the outer bound on under-splitting corpus
wide. It is **not** a defect count — no one has read those rows, and
some markers are legitimate — but it says Classes A and B are the near
edge of a larger surface, not the whole of it.

## Proposed disposition

Nothing here should become a patch before a maintainer confirms the
rows, the same gate doc 08's Decision column applied.

1. **Hold the two shipping rows.** `C00805` and `I00111` need a
   three-way split, not a two-way. Either extend their seeded pairs or
   withdraw them until the run is repaired whole. Shipping a
   half-repaired run is worse than shipping the original, because the
   defect now hides behind a correct-looking sense boundary.
2. **Guard the generator.** `seed-implied-one.ts`'s `impliedHost`
   already refuses a host with two `—2)` markers. It should refuse, or
   at minimum record, a host whose tail carries any `—N)` — that is a
   code change with a test, and it would have caught this before the
   truth-layer rewrite.
3. **Confirm Class A's other 9 rows** as a review set. 8 are in the
   sweep and could be left to it, but the sweep will read them
   post-patch and, for the seeded ones, see a repaired-looking entry.
4. **Confirm Class B's 3 rows** individually. `O01387` will never be
   swept and needs a decision either way.
5. **Correct doc 08's `I00661` note** to state the actual reason for
   the hold, or seed the row.
6. **Decide whether to commit the generalized census.** The counts
   above came from a one-off probe. If the class is accepted, the
   predicate belongs beside `IMPLIED_ONE_CENSUS` with its own
   committed list, so it cannot drift. Registering it moves no
   transform baseline, but it is a new corpus-tier assertion.

Register #16 is not amended here: its "in-text" wording and its 79-row
count remain accurate for the shape it describes.
