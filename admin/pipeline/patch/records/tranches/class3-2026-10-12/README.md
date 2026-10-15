# Class 3 split patches of 2026-10-12

The maintainer ticked the class 3 scan review
([`docs/sense-worklist.md`](../../../../../../docs/sense-worklist.md),
§ `Class 3 scan review (2026-10-11)`) on 2026-10-12, one box per
entry for the 22 rows the review detector `self-numbered-intext-marker`
reports (PR #163). For 17 entries he ticked "split here and keep
print's number (a second `N`), as printed"; for P00059 he ticked no
box and wrote the label list he read from the scan in the note. This
directory records the patches those 18 answers decided. The other
four ticks are "nest" answers, which no patch op can carry out yet
([below](#what-the-ticks-decided-that-is-not-here)).

**Renumbered under ruling 10-13 (PR #NNN, 2026-10-15).** The "keep
print's number" ticks are superseded: each doubled number is now
renumbered and annotated, the splits here standing
([`../class3-renumber-2026-10-15/`](../class3-renumber-2026-10-15/README.md)).
The right-hand label lists below are historical: they are the lists
these patches made, not the lists the entries hold now.

## The ruling

A self-numbered sense is one whose own text holds an in-text `—N)`,
where `N` is its own number: print sets the numeral twice, and Sefaria
cut a sense at the first and left the second in its text. The tick keeps print's number. The split
lifts the second `—N)` out of the host as a new sibling labelled `N`,
so the list reads, for B01153, `1 2 *3 4 4` as print sets it. No other
sense is renumbered. The duplicate label is print's own, not a
deviation, and the precedent is decisions.md row `10-10 print
lettering gap`: a lettered or numbered run keeps print's own labels,
even where print skips one. Neither the entry contract
(`admin/entry/`, `bun data:validate`) nor any import gate requires
labels in a list to be unique; both pass with the duplicates.

### P00059's reading

P00059's block asked how the in-text `—4) (v. עִיבּוּר) to extend`
should be read, and said the stored `—6) to complement` later in the
same sense (ABBYY reads it `S)`) is a further split. The maintainer
ticked no box. His note, `1,2,3,4,4,6`, is the Pi. label list, and it
is read as two splits from the one reading:

- split the in-text `—4)` out of Pi. 4 and keep print's number (a
  second `4`);
- split the later `—6) to complement` out as sense `6`, print's own
  numeral. Print skipped `5`, and the gap is kept as printed (ruling
  `10-10 print lettering gap`).

Pi. `1 2 3 4` becomes `1 2 3 4 4 6`. Sefaria's linker had taken
`a. e.—6` into the `Tosef. Ber. VI (V), 1` anchor
(`…; a. e.—6</a>) <i>to complement`), so the marker was not contiguous
text and a `split` could not find it. P000533 moves `—6` out past the
`</a>` first: the same bytes, reordered, and the link's target
(`Tosefta Berakhot 6`) unchanged. The citation's visible text loses the
`—6` that was never part of it.

## Where the patches are

**20 patches on 18 entries, P000518–P000537, are in
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl)**: one
`split` for each of 17 entries, and P00059's `split`, `replace` and
`split`. Each rid has one `repaired` record in
[`../../reviewed/manifest.jsonl`](../../reviewed/manifest.jsonl), as
for the Group D sets: `reviewed/` is the only place the loader reads a
person's patches, and a `patches.jsonl` here would be read as an agent
sweep tranche, so this directory holds only this README.

None of the 18 rids had a reviewed patch, an accepted patch or a
carry-over patch before this set, so nothing chains onto an earlier
patch and nothing is superseded.

Each patch's `rationale` quotes the maintainer's tick (for P00059, his
note and the reading above), states the rule with its precedent, and
carries the hOCR line(s) of the in-text marker, verbatim from the
worklist block, and the scan leaf. `defect_class` is
`self-numbered-intext-marker`, `prompt_version` is
`class3-2026-10-12`, and every `expected_before` is the host sense as
the import meets it, after both transform phases, pinned to snapshot
`sha256:75bbc5ee…`. P00059's three chain in file order: each one's
target is the sense as the patch before it left it.

## The patches

The label lists are the affected list, written as the worklist writes
them: `·` an unlabelled sense, `(…)` the children of the sense before
it, `*` print's star. `senses` is the entry's own list; a verb's Kal
list is its top level.

| patches | rid | section | split at | labels before → after | scan |
|---|---|---|---|---|---|
| P000518 | B01153 | senses | `—4) (prep. a. adv.)` | `1 2 *3 4` → `1 2 *3 4 4` | [188b · leaf 211](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$212/full/1400,/0/default.jpg) |
| P000519 | B01299 | senses | `—3) interj.` | `· 1 2 3` → `· 1 2 3 3` | [196a · leaf 219](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$220/full/1400,/0/default.jpg) |
| P000520 | C00399 | senses | `—2) (cmp. גְּוִיל) stone` | `1 2 3` → `1 2 2 3` | [222a · leaf 245](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$246/full/1400,/0/default.jpg) |
| P000521 | C00871 | senses | `—3) (= גַּרְגַּר) globule` | `· 1 2 3` → `· 1 2 3 3` | [245a · leaf 268](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$269/full/1400,/0/default.jpg) |
| P000522 | C00872 | senses | `—4) (v. next w.)` | `1 2 3 4` → `1 2 3 4 4` | [245a · leaf 268](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$269/full/1400,/0/default.jpg) |
| P000523 | G00456 | Kal | `—4) to take possession` | `1 2 3 4` → `1 2 3 4 4` | [399a · leaf 422](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$423/full/1400,/0/default.jpg) |
| P000524 | H00940 | Kal | `—2) (euphem. = b. h. יָדַע)` | `· 1 2 3` → `· 1 2 2 3` | [462b · leaf 485](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$486/full/1400,/0/default.jpg); [463a · leaf 486](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$487/full/1400,/0/default.jpg) |
| P000525 | H01899 | Kal | `—2) to sign` | `1 2 3` → `1 2 2 3` | [513b · leaf 536](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$537/full/1400,/0/default.jpg) |
| P000526 | I00712 | Kal | `—3) to weary` | `· 1 2 3 4 (a b)` → `· 1 2 3 3 4 (a b)` | [550a · leaf 573](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$574/full/1400,/0/default.jpg) |
| P000527 | K00086 | senses | `—6) (archit.) recess` | `1 2 3 4 5 6` → `1 2 3 4 5 6 6` | [611b · leaf 634](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$635/full/1400,/0/default.jpg) |
| P000528 | K01280 | Kal | `—3) to decide` | `1 2 3` → `1 2 3 3` | [674a · leaf 697](https://iiif.archive.org/iiif/dictionaryoftarg01jastuoft$698/full/1400,/0/default.jpg) |
| P000529 | M00596 | senses | `—4) (Sabbath law)` | `· 1 2 3 4` → `· 1 2 3 4 4` | [747b · leaf 70](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$71/full/1400,/0/default.jpg); [748a · leaf 71](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$72/full/1400,/0/default.jpg) |
| P000530 | M02130 | senses | `—3) height, on high` | `· 1 2 3 (a b c d)` → `· 1 2 3 3 (a b c d)` | [817a · leaf 140](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$141/full/1400,/0/default.jpg) |
| P000531 | N01139 | Hif. | `—2) to cause to sprout` | `1 2` → `1 2 2` | [929b · leaf 252](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$253/full/1400,/0/default.jpg) |
| P000532–P000534 | P00059 | Pi. | `—4) (v. עִיבּוּר) to extend`; `—6) to complement` | `1 2 3 4` → `1 2 3 4 4 6` | [1039a · leaf 362](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$363/full/1400,/0/default.jpg) |
| P000535 | Q01502 | Hif. | `—2) [to cause breaking loose,]` | `1 2 3` → `1 2 2 3` | [1210b · leaf 533](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$534/full/1400,/0/default.jpg) |
| P000536 | S00151 | Af. | `—3) to be earlier than` | `1 2 3 4` → `1 2 3 3 4` | [1316b · leaf 639](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$640/full/1400,/0/default.jpg) |
| P000537 | V00909 | Kal | `—4) to get hot, ferment` | `1 2 3 4` → `1 2 3 4 4` | [1694a · leaf 1017](https://iiif.archive.org/iiif/dictionaryoftarg02jastuoft$1018/full/1400,/0/default.jpg) |

M02130's lettered `a)`–`d)` hang off `—לְמַעֲלָה`, which print sets
after the second `3)`. Lettered children are built at trace time from
the text, after the patches, so they now sit under the second `3`, as
the tick says. I00712's `(a b)` stay under Kal 4.

## What the re-import shows

The re-import (`rm -rf data/entries/[A-Z] && bun data:import && bun
qa:format`) changed exactly these 18 entry files, and every gate is
green. For each entry:

- the affected list reads exactly as the ticked option states (the
  table's right-hand list);
- the concatenated tag-free text of every sense, in document order,
  equals the text before less the removed marker bytes (`—N)`; `—4)`
  and `—6)` for P00059), byte for byte;
- nothing else changed: the entry outside the affected list is
  identical, and so is every sense in the list other than the host and
  the new sense(s). In P00059 the one markup change is the `—6` moved
  out of the `<cite>`.

`self-numbered-intext-marker` now reports 4 rows (it reported 22):
A00982, C00263, C00869, U01512.

## What the ticks decided that is not here

The four "nest" ticks: A00982 (the dual, three items), C00263
(Miggo), C00869 (nest `2) rounded` under the `Part. pass.` block and
split the verb's `—2) (with על)`) and U01512 (the participle; his
note: print sets `2)`). Each makes a sense the child of another, which
no patch op does today (`split` makes a sibling), so they need a
nesting op and are the next PR. C00869's split half waits with its
nest: both are one tick.
