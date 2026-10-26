# Evidence backfill (2026-10-26)

Ruling `10-26 patch evidence` ([`docs/decisions.md`](../../../../../../docs/decisions.md)
§9; review checklist D4 and group 1,
[`docs/review-checklist-2026-10-25.md`](../../../../../../docs/review-checklist-2026-10-25.md)).
Every reviewed patch now carries `evidence`, and the import refuses a
text-changing patch whose evidence is Sefaria's text alone unless it is
`pending` a re-read. This tranche is the record of how the field was
filled on the 770 records of
[`../../reviewed/patches.jsonl`](../../reviewed/patches.jsonl).

**No new patch and no entry change.** Each record gained `evidence`
and lost `confidence` (`high` on all 770); every other field is
byte-identical (`jq -c 'del(.confidence)'` on the old file equals
`jq -c 'del(.evidence)'` on the new one). Key order stays alphabetical,
one compact JSON object per line. This directory holds only this
README.

## How it was filled

Mechanically, by [`../../../backfill-evidence.ts`](../../../backfill-evidence.ts),
kept as the record and refusing to run again once any record carries
`evidence`. It reads each rationale with the regexes the Sefaria
appendix already reads it by (`report/sefaria-evidence.ts`), first
match wins:

1. **`maintainer-read`** (231): a maintainer print read or check with
   its date (`PRINT_READ`, `READ_DATE`); `reader: "Brian"`. The first
   linked IIIF leaf that shows the entry rides along as the locator
   (176 of the 231). 9 are companions whose rationale opens
   `Companion to PNNNNNN (same print read` and take their partner's
   read (P000327 ← P000326, P000329 ← P000328, P000331 ← P000330,
   P000333 ← P000332, P000335 ← P000334, P000337 ← P000336,
   P000339 ← P000338, P000341 ← P000340, P000810 ← P000809).
2. **`hOCR`** (223): the rationale names the hOCR, and the claim
   checks. The quote is the first backticked or double-quoted string
   after the first `hOCR …:` that introduces one (else after the first
   `hOCR`), at least 12 characters long; the leaf the first `leaf N`
   after that `hOCR`, else the first linked one; the volume that leaf's
   IIIF link, else a `vol. N` beside it, else the volume the page index
   gives the rid. **Checked**: the leaf shows the entry
   (`leafOutsideEntry`) and the quote is on the leaf's hOCR text,
   verbatim but for whitespace and the invisible bidi marks Tesseract
   sets (`quoteOnLeaf`). These are the same two checks gate 11 runs.
3. **`jastrow-text`** (69): a `retag` whose number Jastrow's own run
   determines (10-13 case 2): the next sense's marker for an implied
   `1)` (`—2)`, `—*2)`, from the rationale or the annotation's
   evidence; 45), or the printed run a renumber reads (`1 2 *3 4 4`;
   the 24 `class3-renumber` retags).
4. **`sefaria-only`, `pending: true`** (247): everything else.

An hOCR quote is evidence for Latin text, numerals, punctuation and
position only (vol. 2's hOCR has no Hebrew character; vol. 1's garbles
Hebrew), so `hOCR` here never vouches for a Hebrew reading: a batch
that re-reads one replaces it with a `maintainer-read`.

## Kind × prompt_version

```bash
jq -r '[.prompt_version, .evidence.kind] | @tsv' admin/pipeline/patch/records/reviewed/patches.jsonl | sort | uniq -c
```

| prompt_version | hOCR | jastrow-text | maintainer-read | sefaria-only | total |
|---|---:|---:|---:|---:|---:|
| checklist-batch-1-2026-10-22 | 0 | 0 | 101 | 1 | 102 |
| checklist-batch-2-2026-10-25 | 0 | 0 | 1 | 0 | 1 |
| cite-retargets-2026-10-15 | 9 | 0 | 20 | 166 | 195 |
| class3-2026-10-12 | 18 | 0 | 0 | 2 | 20 |
| class3-nest-2026-10-12 | 6 | 0 | 0 | 0 | 6 |
| class3-renumber-2026-10-15 | 0 | 24 | 0 | 2 | 26 |
| d00503-2026-10-16 | 0 | 0 | 5 | 0 | 5 |
| display-or-2026-10-25 | 0 | 0 | 3 | 0 | 3 |
| doc-08-runs | 0 | 1 | 0 | 2 | 3 |
| doc-08-seed | 0 | 33 | 0 | 33 | 66 |
| group-d-2026-10-10 | 127 | 5 | 0 | 18 | 150 |
| headword-edges-2026-09-22 | 0 | 0 | 1 | 1 | 2 |
| headword-edges-2026-09-28 | 0 | 0 | 2 | 0 | 2 |
| headword-print-read-2026-10-06 | 0 | 0 | 48 | 0 | 48 |
| headword-round-2-2026-10-15 | 0 | 0 | 8 | 5 | 13 |
| headword-walkthrough-2026-09-20 | 0 | 0 | 10 | 0 | 10 |
| human-review-2026-08-05 | 50 | 3 | 9 | 3 | 65 |
| implied-i-2026-10-14 | 4 | 0 | 6 | 0 | 10 |
| l74-l80-2026-10-25 | 0 | 0 | 3 | 0 | 3 |
| l81-2026-10-25 | 0 | 0 | 1 | 0 | 1 |
| language-reference-2026-10-15 | 3 | 0 | 13 | 5 | 21 |
| leftovers-2026-10-16 | 4 | 0 | 0 | 4 | 8 |
| leftovers-65-69-2026-10-16 | 1 | 0 | 0 | 1 | 2 |
| lettered-relabel-2026-10-16 | 0 | 0 | 0 | 1 | 1 |
| post-issues-2026-10-22 | 1 | 0 | 0 | 0 | 1 |
| rp8-marks-2026-10-14 | 0 | 1 | 0 | 1 | 2 |
| v10 | 0 | 1 | 0 | 1 | 2 |
| v7 | 0 | 1 | 0 | 1 | 2 |
| **total** | 223 | 69 | 231 | 247 | 770 |

## 247 pending, not 253: the difference by predicate

The checklist's 253 is the records whose rationale names no print
evidence at all:

```bash
jq -r 'select((.rationale|test("(?i)hOCR|print read|print check|scan read|scan crop|leaf [0-9]"))|not)|.id' admin/pipeline/patch/records/reviewed/patches.jsonl | wc -l   # 253
jq -r 'select(.evidence.pending)|.id' admin/pipeline/patch/records/reviewed/patches.jsonl | wc -l   # 247
```

- **−39**, of the 253, are `retag`s now `jastrow-text`: the implied
  `1)` set by the `—2)` after it (doc-08-seed 33, doc-08-runs 1, v7 1,
  v10 1, human-review 3: P000209, P000212, P000285).

  ```bash
  jq -r 'select((.rationale|test("(?i)hOCR|print read|print check|scan read|scan crop|leaf [0-9]"))|not) | select(.evidence.pending|not) | .prompt_version' admin/pipeline/patch/records/reviewed/patches.jsonl | sort | uniq -c
  ```

- **+27** name the hOCR but the claim does not check, so it cannot
  vouch for anything: 17 name no usable quote (14 say the line is "not
  found in the hOCR"; P000812 and P000816 name the hOCR page without
  quoting it; P000278's quote holds a `", ` of its own and is read as 7
  characters), 9 quote a line that is not verbatim on the
  leaf (typed with spaces dropped, or `…`-elided: P000431, P000435,
  P000447, P000523, P000527, P000813, P000819, P000820, P000826), and
  P000465's leaf 311 is p. 288 while the page index ends D00325 on
  p. 287.
- **+6** name print words but no dated read and no hOCR: P000555 and
  P000587 (a scan link only), P000580 (the maintainer "confirmed the
  update"), P000581 (an `annotate`; a scan link), P000927 (a
  maintainer ruling, not a read), and P000588, whose `Maintainer print
  read of the 1903 scan (docs/headword-worklist.md § Round 2, ticked
  2026-10-13` the `READ_DATE` regex misses at the `.md`. Each is for its
  batch to settle.

  ```bash
  jq -r 'select(.evidence.pending and (.rationale|test("(?i)hOCR|print read|print check|scan read|scan crop|leaf [0-9]"))) | .id' admin/pipeline/patch/records/reviewed/patches.jsonl | wc -l   # 33
  ```

253 − 39 + 27 + 6 = 247.

## The pending records

By prompt_version and op:

```bash
jq -r 'select(.evidence.pending) | .prompt_version + " " + .op' admin/pipeline/patch/records/reviewed/patches.jsonl | sort | uniq -c
```

cite-retargets-2026-10-15 replace 166; doc-08-seed split 33; group-d
split 9, delete 5, join 2, replace 2; language-reference replace 5;
headword-round-2 replace 3, delete 1, reform 1; human-review join 1,
replace 1, retag 1; class3 split 2; doc-08-runs split 2; leftovers
split 2, relabel 1, replace 1; class3-renumber annotate 1, replace 1;
checklist-batch-1 reform 1; headword-edges reform 1; leftovers-65-69
annotate 1; lettered-relabel relabel 1; rp8-marks split 1; v7 split 1;
v10 split 1.

The ids, in file order:

P000215 P000216 P000278 P000307 P000374 P000375 P000376 P000378
P000381 P000397 P000398 P000431 P000435 P000447 P000465 P000473
P000491 P000492 P000493 P000503 P000504 P000505 P000523 P000527
P000078 P000089 P000092 P000094 P000096 P000098 P000100 P000102
P000104 P000106 P000108 P000110 P000112 P000114 P000117 P000119
P000121 P000123 P000126 P000128 P000130 P000132 P000134 P000136
P000138 P000140 P000143 P000145 P000147 P000150 P000152 P000154
P000156 P000162 P000165 P000191 P000192 P000555 P000580 P000581
P000587 P000588 P000592 P000593 P000594 P000597 P000598 P000600
P000601 P000602 P000603 P000607 P000608 P000610 P000611 P000612
P000616 P000617 P000618 P000619 P000620 P000621 P000622 P000623
P000624 P000625 P000626 P000627 P000628 P000629 P000630 P000631
P000632 P000633 P000634 P000635 P000636 P000637 P000638 P000639
P000640 P000641 P000642 P000643 P000644 P000645 P000646 P000648
P000649 P000650 P000652 P000654 P000655 P000656 P000657 P000658
P000659 P000661 P000662 P000663 P000664 P000665 P000666 P000667
P000668 P000669 P000670 P000671 P000672 P000673 P000674 P000675
P000676 P000677 P000678 P000679 P000680 P000681 P000682 P000683
P000684 P000685 P000686 P000687 P000688 P000689 P000690 P000691
P000692 P000693 P000694 P000696 P000698 P000699 P000700 P000702
P000703 P000704 P000705 P000706 P000707 P000709 P000710 P000711
P000712 P000713 P000714 P000715 P000716 P000717 P000718 P000719
P000720 P000721 P000722 P000723 P000724 P000725 P000726 P000727
P000729 P000730 P000732 P000733 P000734 P000735 P000737 P000739
P000740 P000741 P000742 P000745 P000746 P000748 P000750 P000751
P000752 P000753 P000754 P000755 P000758 P000759 P000761 P000762
P000763 P000765 P000766 P000767 P000768 P000769 P000770 P000771
P000772 P000773 P000774 P000775 P000776 P000777 P000778 P000779
P000780 P000781 P000782 P000783 P000784 P000785 P000786 P000787
P000788 P000789 P000790 P000798 P000799 P000802 P000805 P000806
P000812 P000813 P000816 P000819 P000820 P000826 P000927

They are batched for re-reading in the checklist's group 3.

## The witness

The re-import, on 2026-10-26 with the backfilled records and the new
preflight and gate:

```bash
rm -rf data/entries/[A-Z] && bun data:import && bun qa:format
git status --short data/entries | wc -l   # 0
git diff --stat -- data/entries           # empty
```

Every gate green, gate 11 among them, and every pending patch
applied (the run's own lines):

```text
gate composition=65031/65031 failures=0
gate contract=32513/32513 failures=0
gate evidenceLocator=399/399 failures=0
evidence pending=247 provisional=0
wrote 32512 entry files under data/entries
```

399 located patches are the 223 `hOCR` and the 176 located
`maintainer-read`. The regenerated blessing differed from the committed
one only by the gate 11 row and the "Patch evidence" line, so it was
not kept.
