# `removes` backfill (2026-10-26)

The loss report, review checklist group 2
([`docs/review-checklist-2026-10-25.md`](../../../../../../docs/review-checklist-2026-10-25.md)):
a reviewed patch declares the visible characters it removes from its
entry in `removes`, and gate 12, `declaredLoss`, holds the declaration
to what the apply removed ([`DESIGN.md`](../../../../DESIGN.md) §5 "The
loss report", §9). This tranche is the record of how the field was
filled on the records of
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl) that
remove anything.

**No new patch and no entry change.** 115 of the 770 records gained
`removes`; the other 655 lines are byte-identical, and on the 115 every
other field is unchanged (`jq -c 'del(.removes)'` on the new file
equals `jq -c .` on the old one). Key order stays alphabetical, one
compact JSON object per line. This directory holds only this README.

## How it was filled

Mechanically, by [`../../../backfill-removes.ts`](../../../backfill-removes.ts),
kept as the record and refusing to run again once any record carries
`removes`. It composes every entry a reviewed patch names as the import
does (`composeEntry`: the transform phases, then the reviewed patches,
which apply first, so the accepted and carry-over patches that follow
cannot change what a reviewed one removed), and for each patch that
applies takes `removedCodepoints` (`patch/loss.ts`):

- **the pool** is the transform tier's `fieldsOf` (headword and
  alternates, morphology, `language_reference`, `display`, every
  sense's number, definition and grammar) plus every `refs` item;
  `display`'s `{n}` slots are cut;
- **visible** means tags stripped, whitespace and `\p{Cf}` (bidi marks,
  joiners) dropped;
- **removed** is the pool before minus the pool after, as a multiset,
  over what is left once the common prefix and suffix are trimmed, so a
  removed run is written as the run it was, in its order.

All 770 reviewed patches applied; none was left without a value.

## What was found

```bash
jq -r 'select(.removes) | [.op, (.removes|length)] | @tsv' admin/pipeline/patch/records/reviewed/patches.jsonl | awk '{n[$1]++; c[$1]+=$2} END {for (k in n) print k, n[k], c[k]}' | sort
```

| op | patches | codepoints removed |
|---|---:|---:|
| delete | 33 | 372 |
| reform | 31 | 32 |
| replace | 19 | 20 |
| retag | 30 | 30 |
| unref | 2 | 14 |
| **total** | **115** | **468** |

- **delete** (33): the group-d phantom senses Sefaria minted from a
  duplicated tail (`—2) same.`, `1) the high priest under David and
  Solomon.`: 26 patches, 361 codepoints), six headword numerals print
  does not set (P000329 `III`, P000337 `II`, P000333, P000335,
  P000339, P000341 `I`: 9), and V00522's `I)` (P000587: 2).
- **reform** (31): a respelled headword drops one letter or point
  (a final kaf `ך`, a yod, a vav, a hireq or tsere), and D00616's two
  maqafs (P000356, `־־`).
- **replace** (19): the OCR `l)` → `1)` class (10 `l`, and P000494's
  `l)`), a numeral print does not set (6 `I`), S01849's `Pi. 4)` →
  `Pi. 5)` (P000580, `4`), and S00216's yod (P000847).
- **retag** (30): a renumber's old digit (24 class3-renumber retags, one
  each) and the `-` or `[` Sefaria set where a marker belonged (6
  human-review retags).
- **unref** (2): D00541's and Q00890's `Yoma 2a` items (P000217
  `Yoma2a`, P000264 `Yoma2a:3`).

### 115, not the checklist's 19, by predicate

The checklist counted the `replace` patches whose payload removes a
visible character:

```bash
jq -r 'select(.removes and .op == "replace") | .id' admin/pipeline/patch/records/reviewed/patches.jsonl | wc -l   # 19
```

The same 19 are here. The other 96 are the ops that predicate did not
look at: a `delete` removes its segment or sense, a `reform` its forms'
dropped letters, a `retag` the number it replaces, an `unref` its
`refs` item (the pool's `refs`, which no no-new-text pool holds).

## Agent patches

The 40 accepted and 4 carry-over agent patches are counted and not
gated: the no-new-text floor holds what they add, and nothing authored
their records to declare a loss. The blessing's "Patch loss" line
gives both sides; on 2026-10-26, 11 agent patches removed 565
codepoints.

## The witness

A dry import with the backfilled records (`bun data:import:dry`), the
run's own lines:

```text
gate declaredLoss=770/770 failures=0
loss reviewed=115/468 agent=11/565
```

and the blessing's line:

```text
Patch loss: 115 reviewed patch(es) remove visible characters, 468 codepoint(s) in all, each declared in `removes`; 11 agent patch(es) remove 565.
```
