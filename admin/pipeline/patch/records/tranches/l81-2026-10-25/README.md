# L81: a split's marker after a digit (2026-10-25)

PR #n, review ledger L81, under ruling `10-13 correction policy`
([`docs/decisions.md`](../../../../../../docs/decisions.md)), case 1:
Sefaria lost A00675's `1)`, print is right, no annotation. The
evidence is the maintainer's scan read of 2026-10-25
([`docs/maintainer-checklist.md`](../../../../../../docs/maintainer-checklist.md)
§ Scan reads for the Sefaria appendix, block A00675; applied in
[`docs/headword-worklist.md`](../../../../../../docs/headword-worklist.md)
§ Applied from the maintainer checklist (2026-10-25)): print reads
`p. 18; 261) 1) Ulam (Porta) a place`, the page `261)` and then the
marker `1)` (26a · leaf 49).

## The rule

PR #193 put print's `1)` back after the page `261)` (P000194), but it
stayed text: the first sense ran `…p. 18; 261) 1) Ulam … 28ᵈ` and the
next was labelled `2`. A reviewed `split` could not cut it out, because
the op needs its marker exactly once in the sense and plain substring
counting finds `1)` twice, once as the tail of `261)`.

A sense marker `N)` is not a marker when a digit immediately precedes
its numeral: it is then the tail of a longer number (a page, a verse, a
column). `markerOffsets` (`admin/pipeline/patch/schema.ts`) finds a
split's marker by that rule, reading the character before each
occurrence in code (no lookbehind), and `applySplit` requires one hit.
A `—N)` or `*N)` opens on its own mark, so the rule never reaches it.
The appendix's `textChange` (`admin/pipeline/report/sefaria-change.ts`)
locates a split's marker in `expected_before` with the same function,
so the row and the import read the same `1)`.

The tests (`patch/schema.test.ts`, `split after a digit (L81)`;
`report/sefaria-report.test.ts`):

| text | marker | result |
|---|---|---|
| `p. 18; 261) 1) <i>Ulam</i>` | `1)` | splits once, at the second |
| `1) a. Ber. 6ᵇ; 1) b.` | `1)` | refused: `occurs 2 times` |
| `p. 18; 26 1) <i>Ulam</i>` | `1)` | splits, as before |
| `Ib. 5—1) to go.` | `—1)` | splits: the dash opens it |
| `p. 18; 261) <i>Ulam</i>`, `Ber. 11) x` | `1)` | refused: `occurs 0 times` |
| appendix: raw `261) 1)` | `1)` | the row reads `261) ‖1)` |
| appendix: raw `261)` (A00675 as Sefaria has it) | `1)` | review, not traceable to source |

The body step needs no change. It splits no numbered marker out of a
text, and its one numbered-marker finder, `NUMBERED` in
`body/lettered.ts` (`(?<![(\p{L}\d])\d+\)`, for the paren count),
already refuses a preceding digit and claims `261)` whole. No file
under `body/` or `transform/` changed, so `transform:invariants` is not
required.

## What changed

| | patch | |
|---|---|---|
| new, in [`../../reviewed/`](../../reviewed/) | P000935 | A00675's `split` at `1)`, after P000194, `defect_class` `missing-number`, `prompt_version` `l81-2026-10-25`; the manifest names P000194 and P000935 |
| retired | P000027 | tranche-01's agent `split` at `1)`, pinned to the old `26 1)` text and absorbed since PR #193 |

P000027 follows the records' practice for an absorbed carry-over
(2026-09-22, [`../tranche-01/README.md`](../tranche-01/README.md)):
`records/` holds only what the import applies, so the patch and the
`repaired` manifest record that held it moved, bytes unchanged, to
[`docs/archive/patches-retired-2026-10-25/tranches/tranche-01/`](../../../../../../docs/archive/patches-retired-2026-10-25/README.md).
The import's header now reads `0 carry-over absorbed` (it read 1).

## A00675 before and after

| | senses |
|---|---|
| before | `·` `pr. n. pl. (v. foreg., … p. 18; 261) 1) <i>Ulam</i> (Porta) a place in Gilead, and one in Galilee. Y. Snh. X, 28ᵈ` · `2` ` in Cilicia; …` |
| after | `·` `pr. n. pl. (v. foreg., … p. 18; 261) ` · `1` ` <i>Ulam</i> (Porta) a place in Gilead, and one in Galilee. Y. Snh. X, 28ᵈ` · `2` ` in Cilicia; …` |

Text conservation: the old gloss is the new first gloss, `1)` and the
new second gloss, byte for byte; only the marker left the text.

## Verification

- `bun data:import` from an empty `data/entries/`: one entry file
  changed, `A00675.json`; every gate green (`textConservation`
  278545/278545).
- `bun data:validate`: 32512 files, 0 problems.
- `bun data:sefaria`: 479 appendix rows, unchanged. A00675's row is
  still P000194's (Sefaria's `261) <i>Ulam</i>` → `261) 1) <i>Ulam</i>`).
  P000935 is in the review list, `not traceable to source`: Sefaria's
  record holds no `1)` to split (P000194 inserts it), so the split is
  ours, not a second row.
