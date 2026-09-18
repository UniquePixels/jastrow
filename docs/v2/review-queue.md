# Review queue

Every open review list in one place. This is the interim stand-in for
tracker issues (spec [R7](../specs/2026-09-13-pipeline-consolidation-design.md#2-rulings-maintainer-2026-09-1215)):
when the admin tool can open issues, each list below becomes issues and
this file retires.

Measured 2026-09-18 on `v2` at `08b607af`, over the committed source
snapshot (2026-07-04, 32,512 entries). The file is hand-written; each
list names its source so a count can be taken again instead of trusted.

## Coverage, before any count is read

Two kinds of list sit here, and they cover the corpus very differently.

| Kind | Covers | Lists |
|---|---|---|
| Detector rows, emitted by every `bun pipeline:migrate` run | all 32,512 entries | 1–4 |
| Agent sweeps and hand review | only the entries someone walked | 5–9 |

The residue sweep walked **723 of 32,512 entries (2.2%)**, all with
rids in A–C, and the earlier chunk sweep walked 1,710, all in
A00000–A01709. No agent has looked at an entry whose rid starts with D
or later. A small count in lists 5–7 is a measure of how far the
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
| 1 | Headwords that do not parse | 33 | migrate row `headword-unparsed` |
| 2 | Page placements below high confidence | 2,191 (298 low, 1,893 medium) | migrate rows `page-confidence-*` |
| 3 | Markup carried across a unit boundary | 10 rows on 5 entries | migrate row `markup-carry` |
| 4 | Deferred reviewed repairs, and notation left in a slug | 3 + 2 | migrate rows `review-deferred`, `slug-unsafe` |
| 5 | Residue-sweep escalations | 487 entries (371 judgment, 116 print check) | 7 manifests under `data/patches/tranches/` |
| 6 | Earlier chunk-sweep escalations never re-swept | 101 entries (64 judgment, 37 print check) | `data/patches/pilot/`, `data/patches/tranches/tranche-01/` |
| 7 | Implied sense-`1)` candidates never decided | 21 entries | [body-review 08](../archive/body-review/08-implied-one-candidates.md) |
| 8 | Pattern classes with no rule | 72 `judgment` + 5 `blocked` | `data/patches/patterns.jsonl` |
| 9 | Patches needing re-judgment | 0 | migrate rows `upstream-fixed`, `upstream-changed` |

### 1. Headwords that do not parse (33)

`docs/v2/migration-blessing.md`, section "Headword review", rows
reading "grammar did not parse". 22 are main headwords that still
carry Sefaria's notation, 8 are alternate forms elided with `…`
(Jastrow's own convention, and not reconstructable: no transform
infers vowels from another field), and 3 are alternate forms with a
stray `(`, `)` or `?`. Headword cleanup is a separate task the
maintainer is running.

The same section also lists **276 rows that are not failures.** They
read "text carries characters outside the lexical set", and every one
of them is a multi-word headword such as `בַּר אַבְיוּ`: all 276 contain a
space, and the only other characters present are geresh (11),
gershayim (13) and one `*`. They parse. The row kind mislabels them,
so the blessing doc's 309 overstates this list by 276.

### 2. Page placements below high confidence (2,191)

Blessing doc, "Page placements needing review". The page index is
ours to correct (spec R2), so these are our data, not Sefaria's.
Start with the 298 `low` rows.

### 3. Markup carried across a unit boundary (10 rows, 5 entries)

Blessing doc, "Markup carried across unit boundaries": `C00869`,
`H01022`, `J00597` (7 rows), `J00603`, `S02102`. `J00597` and `J00603`
are two of the three malformed-anchor entries reported upstream
([sefaria-report §5](sefaria-report.md#5-malformed-anchors--href-swallows-following-markup-3-entries)).

### 4. Deferred reviewed repairs (3) and notation in a slug (2)

Neither kind is rendered in the blessing doc; both appear only in
`data/source/migration-report.json`, which is not committed. Until the
renderer shows them, this file is the only committed place they are
listed.

| Rid | Kind | What is open |
|---|---|---|
| D00470 | `review-deferred` | the implied `1)` belongs inside a `Pl.` section; the structure is unresolved |
| K00081 | `review-deferred` | print's sense 5 label is missing and the note is unresolved |
| R00519 | `review-deferred` | sense 4's `[` sits at the end of sense 3 (print `—[4)…`); the bracket move is undecided |
| A01175 | `slug-unsafe` | slug `אידרעא-=-אדרעא` keeps `=`, a cross-reference kept on purpose for the headword work |
| A01345 | `slug-unsafe` | slug `אימנון-=-המנון`, same |

`D00341`, the fourth deferral named when this list was planned, was
repaired in step 8 (`P000215`, `P000216`).

### 5. Residue-sweep escalations (487 entries)

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

### 6. Earlier chunk-sweep escalations never re-swept (101 entries)

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

### 7. Implied sense-`1)` candidates never decided (21 entries)

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

### 8. Pattern classes with no rule (72 + 5)

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

### 9. Patches needing re-judgment (0)

Blessing doc, "Patches needing re-judgment". Empty while the source
snapshot is unchanged: the two outcomes only fire on a new export
(spec §3.3).
