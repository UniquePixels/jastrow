# Phase 2 triage — what actually blocks shipping v2

**Status: DONE (2026-08-21).** All 132 candidate rows sorted on the two
axes the sweep-tiering spec already defines. No rows added, changed or
discarded; this is a routing pass.

## The two axes

> **T6** Blocking = breaks the render **or** would be baked in by the
> transform. Everything else defers to post-launch.

> **T5** A pattern with a corpus-wide count and no per-entry judgment
> becomes a **deterministic transform**, never an LLM task.

A third route was needed. Round 4 found rows whose count is an *output
of the rule* rather than a corpus fact — `interior-consonant-mislink`
returns 464 / 495 / 516 / 642 / 708 depending on the comparison rule.
Those are **`blocked`**: not transformable and not judgeable until
someone pins the predicate.

Encoded on the row as `blocking` and `route`, with `blockingWork(rows)`
returning the cutover-critical list. Both are optional fields, so an
untriaged row is simply absent from the result rather than silently
counted as safe.

## The headline

| | Rows | Instances | Share |
|---|---:|---:|---:|
| **Blocks the v2 cutover** | **60** | **18,121** | **42%** |
| Defers to post-launch | 72 | 24,577 | 58% |

**58% of the backlog does not hold up shipping.** The deferred side is
almost entirely link targets, typography and niqqud — things that render
correctly and are fixable against live data, which is exactly what the
spec already routes to the post-launch quality sweep over classes 8, 9,
11 and 12.

| | transform | judgment | blocked |
|---|---|---|---|
| **Blocking** | 36 rows / 12,239 | 23 rows / 5,793 | 1 row / 89 |
| Post-launch | 45 rows / 12,416 | 23 rows / 7,303 | 4 rows / 4,858 |

Two facts worth reading off that grid:

- **Only one blocking row is blocked on an unpinned rule** (89
  instances). All four large predicate-pinning problems —
  `dataref-skeleton-absent` 2,572, `plural-inflection-anchor-escapes-entry`
  1,417, `interior-consonant-mislink` 495,
  `same-anchor-positional-mislink` 374 — are **link-target rows and
  therefore post-launch.** The hardest measurement problems in the
  catalogue are not on the critical path.
- **The blocking work is top-heavy.** Two rows are 51% of the blocking
  transform instances; five rows are 85% of the blocking judgment
  instances. 26 of the 60 blocking rows have fewer than 50 instances
  each.

## Critical path — blocking, transform (36 rows / 12,239)

This is the Phase 2 coding queue, largest first. `⚠` marks a row with no
`reason` recorded — its count has never been audited.

| Row | Instances |
|---|---:|
| `bare-rtl-hebrew` | 4,190 |
| `abbrev-in-alt-headwords` | 2,035 |
| `nonsense-dup-anchor` | 755 |
| `parenthesized-alt-headword` | 580 ⚠ |
| `stranded-stem-head` | 544 |
| `nested-anchor-swallows-punctuation` | 465 |
| `binyan-form-leading-space` | 457 |
| `binyan-form-empty-slot` | 446 |
| `ascii-gershayim-outside-body-text` | 409 |
| `plural-label-rendering-defeats-capture` | 358 |
| `empty-stem-section` | 342 ⚠ |
| `phrase-alt-headword-stub` | 236 |
| `open-paren-in-anchor-display` | 214 ⚠ |
| `superscript-subsection-stranded-outside-anchor` | 160 |
| `latin-token-inside-rtl-span` | 130 ⚠ |
| `trailing-em-dash-tail` | 130 |
| `sense-number-outside-closed-grammar` | 111 |
| `gershayim-breaks-ref-attribute` | 85 ⚠ |
| `duplicated-definition-opening-run` | 85 |
| `empty-lead-sense` | 84 |
| `continuation-marker-em-dash-loss` | 71 |
| `asterisk-stem-label` | 69 |
| `adjacent-verbatim-repetition` | 59 |
| `bracketed-gloss-lead-sense` | 49 |
| `abbrev-headword-stub` | 34 |
| `reversed-hebrew-phrase` | 27 |
| `homograph-roman-stranded-in-definition` | 23 |
| `gender-pair-headword-line-collapse` | 22 |
| `stem-head-marker-chop` | 18 |
| `citation-number-truncated-outside-anchor` | 14 |
| `section-break-terminator-loss` | 10 |
| `jt-double-wrapped-citation` | 10 |
| `abbrev-fused-headword` | 7 |
| `b-h-split-across-field-boundary` | 4 ⚠ |
| `see-particle-lost` | 4 |
| `unterminated-href-swallows-closing-tag` | 2 |

**`bare-rtl-hebrew` (4,190) and `abbrev-in-alt-headwords` (2,035) are
half this queue.** They are also the two most independent: the first is
a render-direction fix over definition text, the second rebuilds lookup
keys. Neither is entangled with anything else in the catalogue.

## Blocking, judgment (23 rows / 5,793)

Needs per-entry reading — an Opus pass or maintainer eyes, not a script.

| Row | Instances |
|---|---:|
| `unmatched-closing-paren` | 1,604 |
| `etymology-head-pseudo-sense` | 1,553 |
| `preamble-stranded-lead-sense` | 676 |
| `citation-tail-truncation` | 657 |
| `unmatched-opening-paren` | 452 |
| `common-gender-inexpressible` | 228 |
| `unnumbered-terminal-homograph` | 129 |
| `doubled-space-as-text-loss-locator` | 108 |
| `stranded-open-bracket` | 85 |
| `bracket-paren-mismatch` | 67 |
| `gloss-space-loss` | 45 |
| `self-numbered-intext-marker` | 35 |
| `lost-h-equivalent` | 32 ⚠ |
| `truncated-read-stub` | 26 |
| `unclosed-editorial-bracket` | 18 |
| `dangling-denom-tail` | 17 |
| `lost-hebrew-after-h-marker` | 13 ⚠ |
| `verse-paren-false-sense-split` | 13 |
| `inline-inflection-sublist` | 12 |
| `continuation-marker-fully-absent` | 9 |
| `contentless-entry` | 6 |
| `first-sense-debris-stranding-language-label` | 5 |
| `inflection-sublist-numbering-flattened` | 3 |

**Five rows are 85% of this queue, and four of the five are one family:**
paren/bracket integrity and lead-sense structure —
`unmatched-closing-paren` 1,604, `etymology-head-pseudo-sense` 1,553,
`preamble-stranded-lead-sense` 676, `citation-tail-truncation` 657,
`unmatched-opening-paren` 452. Scoping those five as a single judgment
pass is likely cheaper than five separate ones, and round 3's evidence
says they interact.

## Blocking, blocked (1 row / 89)

| Row | Instances |
|---|---:|
| `open-paren-in-rtl-span` | 89 |

`open-paren-in-rtl-span` needs its predicate pinned before it can be
routed. It is the only such row on the critical path.

## What this settles about the bare-reason rows

The 17 rows with no `reason` (4,442 instances) were an open question
after round 4. The triage narrows it usefully:

| | Rows | Instances |
|---|---:|---:|
| Bare-reason, **blocking** | **8** | **1,400** |
| Bare-reason, post-launch | 9 | 3,042 |

Only 1,400 instances of unaudited risk sit on the cutover path, and five
of those eight rows are `transform` — where writing the transform *is*
the audit, because a deterministic rule either reproduces the count or
does not. **The bare-reason question mostly answers itself by doing
Phase 2 in this order.**

## Caveats on this triage

- **The routing is my reading of each row's description and reason, not
  a measurement.** Rows marked `transform` are a claim that a
  deterministic predicate exists, and that claim is only tested when
  someone writes the transform. Expect some to reclassify to `judgment`
  on contact.
- **`blocking` leans inclusive.** Where "would be baked in by the
  transform" was arguable — lost-text rows especially — the row was
  marked blocking. Being wrong that way costs pre-launch effort; being
  wrong the other way ships a baked-in defect.
- **The 8 bare-reason blocking rows carry the least confidence**, since
  there is no recorded derivation behind their counts at all.

## Next actions

1. **Start the blocking transform queue at the top.** `bare-rtl-hebrew`
   (4,190) and `abbrev-in-alt-headwords` (2,035) are half of it, are
   unentangled, and are the natural first two.
2. **Scope the five paren/lead-sense judgment rows as one pass**, not
   five — 4,942 of the 5,793 blocking judgment instances.
3. **Pin `open-paren-in-rtl-span`'s predicate** — the only blocked row on
   the critical path.
4. **Leave the four large predicate-pinning rows alone until after
   launch.** They are link targets, they are post-launch by T6, and they
   are the catalogue's hardest measurement problems.
5. The 30 round-3 patches still need ingesting through the normal apply
   path, unchanged by this pass.
