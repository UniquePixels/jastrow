# Phase 2 worklist — the catalogue, routed

**Status: triaged 2026-08-21.** All 132 candidate rows routed. This is
the Phase 2 entry point: start here, not in `patterns.jsonl`.

## Start here

| | |
|---|---|
| Catalogue | `data/patches/patterns.jsonl` — 149 rows, 132 candidate |
| Queue helpers | `admin/pipeline/research/patterns.ts` — `transformQueue()`, `blockingWork()`, `checkEntanglement()` |
| Phase spec | `docs/specs/2026-08-17-sweep-tiering-design.md` §4 |
| Round 4 reconcile | `docs/v2/discovery-round-4.md` |
| Snapshot | `data/source/jastrow-dictionary.jsonl`, sha256 `4c64ff03…`, pinned in `data/patches/snapshot.lock` |

```bash
bun -e 'import {parsePatterns,transformQueue} from "./admin/pipeline/research/patterns.ts"; const r=parsePatterns(await Bun.file("data/patches/patterns.jsonl").text()); console.table(transformQueue(r).slice(0,20))'
```

## The two axes, and what they do NOT mean

> **T6** Blocking = breaks the render **or** would be baked in by the
> transform. Everything else defers to post-launch.

> **T5** A pattern with a corpus-wide count and no per-entry judgment
> becomes a **deterministic transform**, never an LLM task.

**`blocking` gates the cutover; it does not gate the work.** A
non-blocking row whose predicate is already known is cheaper to fix now
than to carry into the post-launch sweep — the transform costs the same
either way, and shipping it early means shipping fewer defects. Read
`blocking: false` as *"launch need not wait for this"*, never as *"do
not touch this"*. `transformQueue()` deliberately does not filter on it.

A third route was needed. Round 4 found rows whose count is an *output
of the rule* rather than a corpus fact — `interior-consonant-mislink`
returns 464 / 495 / 516 / 642 / 708 depending on the comparison rule.
Those are **`blocked`**: neither transformable nor judgeable until
someone pins the predicate.

## Shape of the work

| Route | Rows | Instances | What it needs |
|---|---:|---:|---|
| **transform** | **81** | **24,655** | deterministic code + tests |
| judgment | 46 | 13,096 | per-entry reading (Opus pass or maintainer) |
| blocked | 5 | 4,947 | pin the predicate first |

**58% of the backlog is deterministic code.** That is the most useful
number here — most of the catalogue does not need judgment at all.

Cutover gate, cross-cut:

| | Rows | Instances |
|---|---:|---:|
| Blocks the v2 cutover | 60 | 18,121 |
| Launch need not wait | 72 | 24,577 |

## The transform queue — all 81 rows, largest first

`⚠ unaudited` marks a row with no `reason` recorded: its count has never
been derived. That is not a reason to skip it — for a transform row,
**writing the transform is the audit**, because a deterministic rule
either reproduces the count or does not.

| Row | Instances | Blocks cutover | Audit |
|---|---:|---|---|
| `bare-rtl-hebrew` | 4,190 | **yes** | — |
| `abbrev-in-alt-headwords` | 2,035 | **yes** | — |
| `ascii-quote-as-gershayim-in-body` | 1,290 | no | — |
| `tanhuma-never-linked` | 1,137 | no | — |
| `italic-swallowed-terminal-period` | 1,098 | no | — |
| `label-period-outside-italic` | 945 | no | — |
| `mekhilta-sifra-never-linked` | 923 | no | — |
| `unlinked-v-span` | 796 | no | ⚠ unaudited |
| `nonsense-dup-anchor` | 755 | **yes** | — |
| `pesikta-drk-never-linked` | 695 | no | — |
| `parenthesized-alt-headword` | 580 | **yes** | ⚠ unaudited |
| `stranded-stem-head` | 544 | **yes** | — |
| `homograph-numeral-mismatch` | 538 | no | ⚠ unaudited |
| `redundant-outer-rtl-span` | 529 | no | ⚠ unaudited |
| `anchor-swallows-close-paren` | 494 | no | — |
| `geresh-letter-numeral-mislink` | 475 | no | — |
| `nested-anchor-swallows-punctuation` | 465 | **yes** | — |
| `binyan-form-leading-space` | 457 | **yes** | — |
| `binyan-form-empty-slot` | 446 | **yes** | — |
| `ascii-gershayim-outside-body-text` | 409 | **yes** | — |
| `tosefta-variant-chapter-halakha-loss` | 388 | no | — |
| `targum-sheni-never-linked` | 362 | no | ⚠ unaudited |
| `plural-label-rendering-defeats-capture` | 358 | **yes** | — |
| `empty-stem-section` | 342 | **yes** | ⚠ unaudited |
| `ib-yoma-2a` | 312 | no | ⚠ unaudited |
| `holam-migrated-off-mater-vav` | 308 | no | — |
| `emphasis-run-edge-space` | 304 | no | — |
| `midrash-petichta-unanchored` | 279 | no | — |
| `em-dash-section-break-in-own-italic` | 270 | no | — |
| `phrase-alt-headword-stub` | 236 | **yes** | — |
| `open-paren-in-anchor-display` | 214 | **yes** | ⚠ unaudited |
| `prefixed-geresh-abbrev-mislink` | 173 | no | ⚠ unaudited |
| `v-sub-redirect-stub-mislink` | 161 | no | — |
| `superscript-subsection-stranded-outside-anchor` | 160 | **yes** | — |
| `latin-token-inside-rtl-span` | 130 | **yes** | ⚠ unaudited |
| `trailing-em-dash-tail` | 130 | **yes** | — |
| `paren-tag-no-space` | 126 | no | ⚠ unaudited |
| `anchor-italic-no-space` | 111 | no | ⚠ unaudited |
| `sense-number-outside-closed-grammar` | 111 | **yes** | — |
| `italic-close-paren-nospace` | 95 | no | ⚠ unaudited |
| `h-cognate-self-link` | 85 | no | — |
| `gershayim-breaks-ref-attribute` | 85 | **yes** | ⚠ unaudited |
| `duplicated-definition-opening-run` | 85 | **yes** | — |
| `empty-lead-sense` | 84 | **yes** | — |
| `ellipsis-fragment-anchored` | 80 | no | — |
| `shin-sin-dot-drop` | 77 | no | — |
| `continuation-marker-em-dash-loss` | 71 | **yes** | — |
| `asterisk-stem-label` | 69 | **yes** | — |
| `adjacent-verbatim-repetition` | 59 | **yes** | — |
| `plural-to-feminine-final-letter-mislink` | 57 | no | — |
| `bracketed-gloss-lead-sense` | 49 | **yes** | — |
| `citation-quote-seam-period` | 43 | no | — |
| `rabbi-name-linked-as-bible-book` | 41 | no | — |
| `abbrev-headword-stub` | 34 | **yes** | — |
| `italic-lone-punctuation` | 29 | no | — |
| `reversed-hebrew-phrase` | 27 | **yes** | — |
| `homograph-roman-stranded-in-definition` | 23 | **yes** | — |
| `gender-pair-headword-line-collapse` | 22 | **yes** | — |
| `geresh-abbrev-space-loss` | 22 | no | — |
| `containment-fallback-mislink` | 22 | no | — |
| `orphan-gloss-seam-period` | 19 | no | — |
| `stem-head-marker-chop` | 18 | **yes** | — |
| `impossible-dagesh` | 17 | no | — |
| `translit-italic-space-loss` | 15 | no | — |
| `gloss-head-seam-period-doubling` | 15 | no | — |
| `citation-number-truncated-outside-anchor` | 14 | **yes** | — |
| `shuruk-as-yod-display-corruption` | 12 | no | — |
| `vkh-geresh-loss` | 11 | no | — |
| `post-anchor-numeral-duplication` | 11 | no | — |
| `trailing-whitespace-definition` | 10 | no | — |
| `section-break-terminator-loss` | 10 | **yes** | — |
| `entry-final-comma` | 10 | no | — |
| `italic-swallows-close-paren` | 10 | no | — |
| `jt-double-wrapped-citation` | 10 | **yes** | — |
| `ib-targum-work-loss` | 8 | no | — |
| `apparatus-cite-linked-as-scripture` | 8 | no | — |
| `abbrev-fused-headword` | 7 | **yes** | — |
| `sifre-ib-resolves-to-yalkut` | 5 | no | — |
| `b-h-split-across-field-boundary` | 4 | **yes** | ⚠ unaudited |
| `see-particle-lost` | 4 | **yes** | — |
| `unterminated-href-swallows-closing-tag` | 2 | **yes** | — |

### Sequencing advice

1. **`bare-rtl-hebrew` (4,190) and `abbrev-in-alt-headwords` (2,035)**
   are 25% of the whole transform queue, both blocking, and neither is
   entangled with anything. Natural first two.
2. **Then take the non-blocking audited rows on size.** There are
   36 of them (9,374 instances) and they are the cheapest
   real wins in the catalogue — predicate known, no cutover pressure, no
   judgment required.
3. **Respect `entangledWith`.** Four pairs must be fixed in one edit or
   they rewrite the same records twice. `checkEntanglement()` keeps the
   graph honest; the pairs are derived in the round-4 report.
4. **15 transform rows are unaudited.** Expect some to reclassify to
   `judgment` on contact — the routing is a reading of each row, not a
   measurement.

## Judgment queue — 46 rows / 13,096 instances

23 of these block the cutover (5,793 instances). Five rows are 85% of
that blocking subset, and four of the five are **one family** —
paren/bracket integrity and lead-sense structure. Scope them as a single
pass, not five:

| Row | Instances |
|---|---:|
| `unmatched-closing-paren` | 1,604 |
| `etymology-head-pseudo-sense` | 1,553 |
| `preamble-stranded-lead-sense` | 676 |
| `citation-tail-truncation` | 657 |
| `unmatched-opening-paren` | 452 |

Full judgment list, blocking first:

| Row | Instances | Blocks cutover |
|---|---:|---|
| `unmatched-closing-paren` | 1,604 | **yes** |
| `etymology-head-pseudo-sense` | 1,553 | **yes** |
| `preamble-stranded-lead-sense` | 676 | **yes** |
| `citation-tail-truncation` | 657 | **yes** |
| `unmatched-opening-paren` | 452 | **yes** |
| `common-gender-inexpressible` | 228 | **yes** |
| `unnumbered-terminal-homograph` | 129 | **yes** |
| `doubled-space-as-text-loss-locator` | 108 | **yes** |
| `stranded-open-bracket` | 85 | **yes** |
| `bracket-paren-mismatch` | 67 | **yes** |
| `gloss-space-loss` | 45 | **yes** |
| `self-numbered-intext-marker` | 35 | **yes** |
| `lost-h-equivalent` | 32 | **yes** |
| `truncated-read-stub` | 26 | **yes** |
| `unclosed-editorial-bracket` | 18 | **yes** |
| `dangling-denom-tail` | 17 | **yes** |
| `lost-hebrew-after-h-marker` | 13 | **yes** |
| `verse-paren-false-sense-split` | 13 | **yes** |
| `inline-inflection-sublist` | 12 | **yes** |
| `continuation-marker-fully-absent` | 9 | **yes** |
| `contentless-entry` | 6 | **yes** |
| `first-sense-debris-stranding-language-label` | 5 | **yes** |
| `inflection-sublist-numbering-flattened` | 3 | **yes** |
| `homograph-numeral-blind-default` | 1,358 | no |
| `homograph-collapse-link` | 1,253 | no |
| `skeleton-escape-orphan` | 1,065 | no |
| `geresh-abbrev-fixed-sink` | 970 | no |
| `corrigendum-reading-linked` | 771 | no |
| `unlinked-stub-nonexistent-target` | 451 | no |
| `midrash-section-cite-as-bible-chapter` | 255 | no |
| `homograph-numbering-schism` | 186 | no |
| `midrash-subsection-link-drift` | 179 | no |
| `binyan-head-form-mislinked` | 127 | no |
| `neighbor-rid-mislink` | 109 | no |
| `post-anchor-numeral-mismatch` | 91 | no |
| `initial-niqqud-drop` | 76 | no |
| `multiword-abbrev-mislink` | 62 | no |
| `stacked-impossible-niqqud` | 61 | no |
| `guttural-initial-simple-sheva` | 55 | no |
| `midrash-tehillim-wrong-psalm` | 49 | no |
| `inflection-abbrev-mislink` | 46 | no |
| `targum-cite-to-plain-bible` | 43 | no |
| `vocalized-twin-ignored` | 34 | no |
| `latin-prose-ocr-substitution` | 28 | no |
| `spurious-name-period` | 19 | no |
| `alt-headword-collision` | 15 | no |

## Blocked queue — 5 rows / 4,947 instances

| Row | Instances | Blocks cutover |
|---|---:|---|
| `dataref-skeleton-absent` | 2,572 | no |
| `plural-inflection-anchor-escapes-entry` | 1,417 | no |
| `interior-consonant-mislink` | 495 | no |
| `same-anchor-positional-mislink` | 374 | no |
| `open-paren-in-rtl-span` | 89 | **yes** |

Only `open-paren-in-rtl-span` is on the critical path. The other four are
the catalogue's hardest measurement problems and they are **all
link-target rows**, so none of them holds up shipping. Leave them until
after launch unless something else forces the issue.

## Caveats

- **The routing is a reading of each row's description and reason, not a
  measurement.** A `transform` label claims a deterministic predicate
  exists; that claim is only tested when the transform is written.
- **`blocking` leans inclusive.** Where "would be baked in by the
  transform" was arguable — lost-text rows especially — the row was
  marked blocking. Wrong that way costs pre-launch effort; wrong the
  other way ships a baked-in defect.
- **The 8 unaudited blocking rows carry the least confidence**, having no
  recorded derivation behind their counts.

## Still open, not part of Phase 2

1. **The 30 round-3 patches** are validated but not applied; they need
   ingesting through the normal apply path.
2. **`vocalized-twin-ignored` (34)** is unruled. Non-blocking, and it
   shrank on inspection: the raw 88 is 67% artefact, leaving 29 instances
   from **11 lemma pairs** — `בּוֹר`→`בּוּר` alone is 8 and is a confirmed
   mislink. It is 11 dictionary questions, not a review queue.
3. **`italic-swallowed-terminal-period` must lose its 123 misfiled label
   occurrences** before transform, or the house-style ruling moves them
   the wrong way.
4. **Round 5** would clear the saturation gate only if it adds nothing.
   Rounds 3 and 4 both found re-measurement worth more than discovery.
