# The lettered relabel (2026-10-16)

P00790 after L59, the last item of
[`docs/correction-audit.md`](../../../../../../docs/correction-audit.md)
§7, PR #n: a new reviewed op, `relabel`, and its first record. Review
ledger L59 (closed here), L55 and L60 (closed here), L64; ruling
`10-13 correction policy`, case 2, which superseded `10-10 print
lettering gap`
([`docs/decisions.md`](../../../../../../docs/decisions.md) §9).

**One reviewed patch, P000812, on one entry.** It is appended to
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl), with a
`repaired` record for P00790 in
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl).
`prompt_version` is `lettered-relabel-2026-10-16` and `snapshot` is
`sha256:75bbc5ee…`. This directory holds only this README.

## The fact pattern

P00790 `עָלָה`, Hif., sense 2: print sets its idiomatic uses as a
lettered run `a) b) c) d) f) g) h)`. There is no `e)`: the typesetter
skipped it, most likely because the cross-reference `(v. Kal, e)`
inside `d)` read as set (hOCR vol. 2 p. 1081a;
[1081a · leaf 404](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$405/full/1400,/0/default.jpg)).

Since #158 (L53) and #161 (L56) the lettered splitter (`body/lettered.ts`)
counts only markers outside parens and ends a run at the first marker
that is not the next letter, so the entry had children `a b c d`, and
`—f)`, `—g)` and `—h)` sat inside `d`'s units. Under 10-13 the gap is a
print error whose intended value the closed lettering system
determines: `a b c d e f g`, with print's `f g h` stored in an
annotation on each changed label.

## Why a new op, and why a patch payload (L59 option (b))

L59 named two mechanisms: (a) a reviewed, rid-keyed gap that the
lettered split honours, or (b) a patch payload that states the run.
The rid-keyed repair passes were retired into reviewed patches in
consolidation step 8 (glossary "repair pass"), so (b): the repair is a
patch record, applied, drift-checked and gated like every other.

No existing op could write it. Lettered children are not source
senses: `body/lettered.ts` makes them from one sense's text at trace
time, after every patch. A `split`-like op that inserts the gap letter
would cut a source sibling, not a child, and would have to add a
marker the text does not hold (patch markers are digits only,
`CLOSED_MARKER`). So `relabel` edits no text at all: it declares where
the build splits and what the children are called.

## The op

`relabel` on a `sense[…]` target. Payload `{run, to}`:

- `run`: print's letters in the order the text holds them, gap
  included. The apply refuses a `run` that is not exactly the sense's
  counted markers (outside parens and anchors, `body/lettered.ts`'s
  rule) in order, so each marker is found once and none is left over.
- `to`: the labels the children take, `a`, `b`, `c`… from `a`, as
  long as `run`, and different from it.

The validator also refuses a run of fewer than two letters, a repeated
letter, a missing annotation, an annotation that is not `print-error`,
and one whose `printed` is not `''` (the import reads each changed
child's printed letter from `run`; one string cannot state three). The
apply refuses a stem header, a target with child senses (another
patch's), and one that already carries a run. `corpusPreflight`
refuses it on an agent patch, as it does any annotated patch.

The apply leaves `{run, to, note}` on the source sense
(`SourceSense.relabel`) and the text untouched, so the no-new-text pool
is byte-identical: a label is not text. The target still resolves after
apply, so the post-apply assertion asks instead that exactly one sense
carries the run. Drift calls a moved target `upstream-changed`: no
source sense can hold the labels it gives.

The build (`body/lettered-children.ts`) splits at exactly `run`,
labels each child from `to`, and gives each child whose label departs
from print's letter a `label` draft with that letter as `printed`;
`finishEntry` writes it with `stored` the built label. A run the text no
longer holds there is thrown, never under-split. The round-trip
verifier (`body/round-trip.ts`) re-splits by the same run and checks
the `to` labels, so `bodyRoundTrips` stays a byte-exact check.

**Gate 10's rule changes.** It said every annotated patch wrote
exactly one annotation. It now says each wrote exactly as many as it
owes: one, or for a `relabel` one per label `to` changes
(`annotationsOwed`, `patch/schema.ts`). The apply lists a patch once
per annotation owed, and the gate counts the list (`gates.test.ts`
pins both the three-annotation pass and a short count's failure).

## P000812

```json
"payload": {"run": ["a", "b", "c", "d", "f", "g", "h"], "to": ["a", "b", "c", "d", "e", "f", "g"]},
"annotation": {"date": "2026-10-13", "evidence": "print skips e) (1081a); the run determines it; ruling 10-13", "kind": "print-error", "printed": ""}
```

Target `sense[—2)]:57da7ebe`, the Hif. sense 2 definition after the
transform phases.

| child | before | after | annotation |
|---|---|---|---|
| `a`–`d` | `a b c d`; `d`'s units hold `—f) …`, `—g) …`, `—h) …` | `a b c d`, `d` ending at print's `—` before `f)` | none |
| print's `f)` | in `d`'s text | child `e` | `printed: 'f'`, `stored: 'e'` |
| print's `g)` | in `d`'s text | child `f` | `printed: 'g'`, `stored: 'f'` |
| print's `h)` | in `d`'s text | child `g` | `printed: 'h'`, `stored: 'g'` |

P00791's `(v. preced. Hif. c) to balance …` names P00790's `c`, which
keeps its letter (audit §3); P00791's file is unchanged and its cite
still resolves to P00790.

## Verification

- The re-import (`rm -rf data/entries/[A-Z] && bun data:import && bun
  qa:format`) changes exactly one entry file, P00790. Every gate is
  green; `textConservation` reads 278,514 (278,505 before: the three
  new children's fields).
- Script check of P00790 against `v2`: Hif. sense 2 has children `a b c
  d e f g`; three annotations, on `e`, `f`, `g`, `printed` `f`, `g`,
  `h`, source P000812; the host's gloss and units and children `a`–`c`
  are byte-identical, and everything outside the sense is unchanged;
  the tag-free text equals `v2`'s with `f)`, `g)` and `h)` removed
  after their `—`, the markers that became labels.
- Blessing: `Annotations: 98 written (96 print-error, 1 kept, 1
  illegible)`, 95 before; `Patch corpus: 653 reviewed, … 698 applied`.
- `bun data:validate`: 0 problems. `bun run transform:invariants`
  passes (`body/` changed).
- Negative control: with P000812 removed, the re-import gives `v2`'s
  tree byte for byte, so the mechanism touches no other entry.
