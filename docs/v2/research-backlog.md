# Research backlog

What the research left open, still to be decided: sweep escalations,
the implied-`1)` census, and pattern classes with no rule. The file is
hand-written; imported into the tracker once one is chosen, then
archived with the rest of the research (maintainer, 2026-09-18). Every
review row the pipeline itself emits — headwords that don't parse,
low-confidence page placements, carried markup, deferred repairs — is
generated on each `bun pipeline:migrate` run into
[review-report.md](review-report.md), not here.

Measured 2026-09-18 on `v2` at `08b607af`, over the committed source
snapshot (2026-07-04, 32,512 entries). Each list names its source so a
count can be taken again instead of trusted.

## Coverage, before any count is read

This file covers only what someone actually walked, not the whole
corpus.

| Kind | Covers | Lists |
|---|---|---|
| Agent sweeps and hand review | only the entries someone walked | 1–4 |

The residue sweep walked **723 of 32,512 entries (2.2%)**, all with
rids in A–C, and the earlier chunk sweep walked 1,710, all in
A00000–A01709. No agent has looked at an entry whose rid starts with D
or later. A small count in lists 1–3 is a measure of how far the
walk got, not of how much is wrong.

| Rid letter | Entries | Residue-swept | Share |
|---|---|---|---|
| A | 3,457 | 501 | 14.5% |
| B | 1,399 | 155 | 11.1% |
| C | 1,433 | 67 | 4.7% |
| D–V | 26,223 | 0 | 0% |

## The lists

| # | List | Open | Source |
|---|---|---|---|
| 1 | Residue-sweep escalations | 487 entries (371 judgment, 116 print check) | 7 manifests under `data/patches/tranches/` |
| 2 | Earlier chunk-sweep escalations never re-swept | 101 entries (64 judgment, 37 print check) | `data/patches/pilot/`, `data/patches/tranches/tranche-01/` |
| 3 | Implied sense-`1)` candidates never decided | 21 entries | [body-review 08](../archive/body-review/08-implied-one-candidates.md) |
| 4 | Pattern classes with no rule | 72 `judgment` + 5 `blocked` | `data/patches/patterns.jsonl` |

### 1. Residue-sweep escalations (487 entries)

The latest sweep of each rid across the seven residue manifests
(calibration, batch-01 to batch-05, residue-01): 723 entries swept,
487 escalated, 233 clean, 3 repaired. Classes 11
(`wrong-link-target`, 406 entries) and 8 (`lost-parenthetical`, 116)
account for 478 of the 487. The class analysis is
[phase-2-class-report.md](../archive/phase-2-class-report.md). The
RUNBOOK's default applies: every escalation is post-go-live work in
the admin tool.

Four of these entries (`A00913`, `A03277`, `C00062`, `C00244`) also
carry a step-8 reviewed patch. The patch and the escalation name
different findings, so neither closes the other.

### 2. Earlier chunk-sweep escalations never re-swept (101 entries)

The pilot and `tranche-01` swept 1,710 entries on **pre-patch** text,
before the transform rules ran, and escalated 205. The residue sweep
later re-swept 104 of those. The other 101 lie inside the rid range
the residue sweep walked (A00000–A01739, contiguous), so they were
skipped because they were not in the residue: no detector flags them
after the rules run. The phase-2 class report excludes this sweep by
design (its §10).

A silent detector does not mean the escalation is resolved; it means
no detector covers what the agent saw. `[sev:med conf:med]` Some of
the 101 will read clean on the text as it stands now, and nobody has
measured how many.

### 3. Implied sense-`1)` candidates never decided (21 entries)

Body-review 08 is the census of an unnumbered sense whose text carries
a `—2)` run with no `1)` before it. Its table holds 79 rows: 41
confirmed, 17 decided otherwise (mostly an OCR `l)` for `1)`), and 21
blank. The maintainer routed the blank rows to the sweep on
2026-08-13; all 21 have rids J–V, so the sweep never reached them.

`J00627`, `J00657`, `K00030`, `K00121`, `K00156`, `K00859`, `N00235`,
`N00577`, `N01162`, `P01055`, `R00075`, `R00291`, `R00586`, `S00826`,
`S01731`, `T00243`, `T00375`, `T00538`, `U00884`, `U00960`, `V00652`.

The doc's own prose still says 26 blank rows. The table is what was
counted here.

### 4. Pattern classes with no rule (72 + 5)

`data/patches/patterns.jsonl` holds 133 candidate classes: 56 routed
to `transform` (rules), 72 to `judgment`, 5 `blocked`. The 72
become review detectors one class at a time where archived research
code has a detector (spec §4.1); none is wired yet.

| Blocked class | Entries | Blocks a rule? |
|---|---|---|
| `dataref-skeleton-absent` | 2,572 | no |
| `plural-inflection-anchor-escapes-entry` | 1,417 | no |
| `interior-consonant-mislink` | 495 | no |
| `same-anchor-positional-mislink` | 374 | no |
| `open-paren-in-rtl-span` | 89 | **yes** — its count depends on a rule nobody has pinned |

## Blocks the v2 cutover (step 11)

`data/patches/patterns.jsonl` still flags 32 candidate classes
`blocking: true` on a route other than `transform` — 31 `judgment`,
`open-paren-in-rtl-span` `blocked` — under sweep-tiering T6
("blocking = breaks the render or would be baked in"; spec §11 step
11). The 2026-08-15 triage ruling that no sweep *escalation* blocks
shipping never reconciled with these class flags; each is recounted
and either kept blocking (fixed before publication) or deferred to
the tracker with the rest of this backlog. The 23 blocking classes on
the `transform` route each have a registered rule and are not listed
here.

| Class | Route | Catalogued |
|---|---|---|
| `unmatched-closing-paren` | judgment | 1,604 |
| `etymology-head-pseudo-sense` | judgment | 1,553 |
| `preamble-stranded-lead-sense` | judgment | 676 |
| `citation-tail-truncation` | judgment | 657 |
| `unmatched-opening-paren` | judgment | 452 |
| `empty-stem-section` | judgment | 342 |
| `common-gender-inexpressible` | judgment | 228 |
| `unnumbered-terminal-homograph` | judgment | 129 |
| `doubled-space-as-text-loss-locator` | judgment | 108 |
| `stem-head-in-child-sense` | judgment | 100 |
| `open-paren-in-rtl-span` | blocked | 89 |
| `stranded-open-bracket` | judgment | 85 |
| `bracket-paren-mismatch` | judgment | 67 |
| `stem-label-not-a-binyan-name` | judgment | 66 |
| `gloss-space-loss` | judgment | 45 |
| `self-numbered-intext-marker` | judgment | 35 |
| `superscript-subsection-contradicts-link-sub-section` | judgment | 33 |
| `lost-h-equivalent` | judgment | 32 |
| `reversed-hebrew-phrase` | judgment | 27 |
| `truncated-read-stub` | judgment | 26 |
| `homograph-roman-stranded-in-definition` | judgment | 23 |
| `unclosed-editorial-bracket` | judgment | 18 |
| `dangling-denom-tail` | judgment | 17 |
| `lost-hebrew-after-h-marker` | judgment | 13 |
| `verse-paren-false-sense-split` | judgment | 13 |
| `inline-inflection-sublist` | judgment | 12 |
| `chopped-marker-with-residue` | judgment | 10 |
| `continuation-marker-fully-absent` | judgment | 9 |
| `sense-number-outside-closed-grammar` | judgment | 6 |
| `contentless-entry` | judgment | 6 |
| `first-sense-debris-stranding-language-label` | judgment | 5 |
| `inflection-sublist-numbering-flattened` | judgment | 3 |
