# Research backlog

What the research left open, still to be decided: sweep escalations,
the implied-`1)` census, and pattern classes with no rule. The file is
hand-written; imported into the tracker once one is chosen, then
archived with the rest of the research (maintainer, 2026-09-18). Every
review row the pipeline itself emits — headwords that don't parse,
low-confidence page placements, carried markup, deferred repairs — is
generated on each `bun data:import` run into
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

`data/patches/patterns.jsonl` flagged 32 candidate classes
`blocking: true` on a route other than `transform` — 31 `judgment`,
`open-paren-in-rtl-span` `blocked` — under sweep-tiering T6 ("blocking
= breaks the render **or** would be baked in by the transform"; spec
§11 step 11). The 2026-08-15 triage ruling that no sweep *escalation*
blocks shipping never reconciled with these class flags. The 23
blocking classes on the `transform` route each have a registered rule
and are not listed here.

**Recounted 2026-09-20** on the 32,512 committed entry files at
`8503234e`. Each predicate below is one stated sentence over
`senses[]`, nested `senses[].senses[]` and `stems[].senses[]`, with
`<[^>]+>` stripped; the script is throwaway (R4: a triage script is
neither rule, patch nor review detector) and the predicates travel here
so a count can be taken again instead of trusted. The predicates were
written from each class's own description, and they do not all
reproduce it.

### What the recount can and cannot say

| Outcome | Classes | What a count from it is worth |
|---|---|---|
| **reproduced** — predicate follows the description, \|Δ\| ≤ 25% | 9 | evidence |
| **resolved** — 0 with a positive control proving the predicate fires | 2 | evidence of closure |
| **not reproduced** — the predicate needed a clause the description lacks, or vice versa | 15 | *not* evidence; the number measures the predicate |
| **no predicate** — the class is defined by a model this script does not hold | 6 | nothing; needs its detector ported (§10) |

Two zeros were checked before being believed, because a predicate that
cannot fire reports a clean nothing:

| Control | Result |
|---|---|
| Can the child-sense walk see anything? | 510 child senses in 204 entries; 21 glosses anywhere open with a binyan name, all of them top-level |
| Do the six rids `sense-number-outside-closed-grammar` names still exist? | all six present; only 3 entries in the corpus carry a `*N)` marker and none is one of the six; 0 senses carry a `*…` label |

Two classes' stated `reason` is stale against the v2 entry schema, and
neither was caught until the recount:

- `common-gender-inexpressible` reads "content.morphology has a closed
  9-value vocabulary that never contains it". `grammar.gender`'s enum is
  `["m","f","c"]` — it *does* contain it. 12,557 entries carry a gender
  and 0 carry `c`, so the class is a **backfill**, not an
  impossibility.
- `stem-head-in-child-sense` and `stem-label-not-a-binyan-name` name
  `grammar.binyan_form` / `grammar.verbal_stem`. The v2 schema has no
  such fields: `grammar` holds `gender`, `number`, `pos`, and stems live
  in `stems[]` as `stem` / `forms` / `senses`. Both were catalogued
  against the source shape.

### Group A — reproduced, and structural or render-visible

Draft: **keep blocking.** Each turns on a T6 limb that the recount
confirms is still present in the committed tree.

| Class | Cat. | Now | Predicate | T6 limb |
|---|---|---|---|---|
| `empty-stem-section` | 342 | **342** | a `stems[]` element whose `senses` carry no text at all | both: an empty binyan heading renders blank, and the element is written into 342 committed files (e.g. `A00338`, `{"stem":"Ithpa.","senses":[]}`) |
| `stranded-open-bracket` | 85 | **85** | a sense's text ends with a bare `[` | baked in: the print bracket's scope — which senses it wraps — is not recoverable from the tree (`A00764` ends `.—[`) |
| `superscript-subsection-contradicts-link-sub-section` | 33 | **33** | `<sup>N</sup>` last inside a `<cite>` whose ref ends `:M`, N ≠ M | render: the link lands on the wrong sub-section (`T00292`: `Num. R. s. 14⁷` against `Bamidbar Rabbah 14:12`) |
| `homograph-roman-stranded-in-definition` | 23 | **22** | `senses[0].gloss` opens with a Roman numeral and `headword.homograph` is absent | baked in: the homograph number is part of the headword namespace, so it is part of the slug |
| `open-paren-in-rtl-span` | 89 | **88** | a `<he>` span whose content's `(` and `)` counts differ | render: bidi puts the paren on the wrong side. Already `route: blocked` |

### Group B — reproduced, and text-level

Draft: **defer.** Visible, but a per-entry text fix in the admin tool
that disturbs no structure and no published identity.

| Class | Cat. | Now | Predicate |
|---|---|---|---|
| `unmatched-opening-paren` | 452 | 409 | entry level: `(` count > `)` count |
| `common-gender-inexpressible` | 228 | 229 | leading `c.` in `senses[0].gloss` with no `grammar.gender` — a backfill, see above |
| `lost-h-equivalent` | 32 | 36 | bare `(h.` followed straight away by punctuation (not `(b. h.`, which is a complete form) |
| `truncated-read-stub` | 26 | 26 | a sense's text ends `read:` — the correction can only come from print |

### Group C — resolved, with a control

Draft: **close** (`blocking: false`, `status: resolved`), not defer.
Neither is outstanding work.

| Class | Cat. | Now | Why it is gone |
|---|---|---|---|
| `stem-head-in-child-sense` | 100 | **0** | the body model lifted stem heads into `stems[]` (2,660 entries carry one); no *child* sense opens with a binyan name. Control above |
| `sense-number-outside-closed-grammar` | 6 | **0** | the transforms consumed the starred `*N)` markers on all six named rids. Control above |

### Group D — the sense-structure family, and why it is the hard one

Draft: **keep blocking, on kind, pending a ported detector.** Every
class here changes *how many senses an entry has and how they are
numbered*. Sense structure is what the compiled data, any per-sense
anchor, and every future hand edit build on, so it is T6's bake-in limb
in its purest form — and none of these can be recounted here. Where a
number appears it is the predicate's, not the class's.

| Class | Cat. | Predicate's count | Why the recount is not evidence |
|---|---|---|---|
| `etymology-head-pseudo-sense` | 1,553 | 261 | "whole definition is the etymology parenthetical" needs the judgment of *whole*; the predicate demands a single balanced paren and nothing else |
| `preamble-stranded-lead-sense` | 676 | 1,761 | "no gloss and no citation" is looser as written (`<i>`-absence) than the class, which also requires the real senses to follow as `1)/—2)` |
| `self-numbered-intext-marker` | 35 | 26 | the in-text marker's own numbering is judged against the sibling run, not matched by regex |
| `inline-inflection-sublist` | 12 | 76 | the predicate finds any in-text `1)`; the class requires it to sit under an inflection label |
| `continuation-marker-fully-absent` | 9 | 29 | "the previous sibling carries no marker residue at all" is the judgment; the predicate only sees a missing label |
| `first-sense-debris-stranding-language-label` | 5 | 21 | requires the duplication of `sense[1]` to be established, which the predicate does not test |
| `verse-paren-false-sense-split` | 13 | — | a mis-split judged against the print page |
| `chopped-marker-with-residue` | 10 | — | "residue after a chopped marker" was judged per entry |
| `inflection-sublist-numbering-flattened` | 3 | — | which siblings belong to the inflected form is judgment |

### Group E — not measurable here, and text-level

Draft: **defer.** The kind is text loss or a diagnostic, so T6 does not
reach it even though the count is unavailable. Each goes to the tracker
with a note that its detector is unported.

| Class | Cat. | Predicate's count | Note |
|---|---|---|---|
| `citation-tail-truncation` | 657 | 9,861 | ending at a citation is the *normal* shape in Jastrow; the class turns on a truncation judgment, so the predicate is meaningless here |
| `unmatched-closing-paren` | 1,604 | 525 | the class's own `reason` already records that its unit is unstated and that 40% of candidates are explained by sense markers |
| `stem-label-not-a-binyan-name` | 66 | 151 | the predicate flags every `stems[].stem` outside a hand-written binyan list, including legitimate ones |
| `doubled-space-as-text-loss-locator` | 108 | 206 | explicitly a **locator**, not a defect — a review-detector candidate at most |
| `unclosed-editorial-bracket` | 18 | 83 | "closer absent from the entry entirely" and "contentful" are both judgments; the predicate only counts imbalance |
| `bracket-paren-mismatch` | 67 | 89 | the predicate's window is one run without nesting |
| `dangling-denom-tail` | 17 | 10 | needs print to supply the denominative |
| `lost-hebrew-after-h-marker` | 13 | 9 | needs print to supply the Hebrew |
| `contentless-entry` | 6 | 4 | four entries with no definitional content anywhere |
| `unnumbered-terminal-homograph` | 129 | — | needs the family join across headword and altHeadwords |
| `gloss-space-loss` | 45 | — | defined by corpus bigram frequency |
| `reversed-hebrew-phrase` | 27 | — | needs the corpus's phrase-order model |

### The ruling (maintainer, 2026-09-20)

**An issue that does not block publication is recorded and handled
later.** The bar is what the reader sees on the page, not what a fix
might cost us afterwards. The catalogue's own field says the same thing:

> `blocking` … This gates the CUTOVER, not the work. A non-blocking row
> may still be fixed now … and false is only a promise that shipping
> need not wait for it.

| Group | Classes | Ruling |
|---|---|---|
| A | 5 | **stays `blocking: true`** — each is visibly broken on the page |
| B, E | 16 | `blocking: false`, recorded here for the tracker |
| C | 2 | `status: discarded` — resolved by the v2 model or by a shipped rule, with a control |
| D | 9 | `blocking: false` **with a precondition**, below |

32 → **5** non-`transform` classes hold up the cutover:
`empty-stem-section`, `stranded-open-bracket`,
`superscript-subsection-contradicts-link-sub-section`,
`homograph-roman-stranded-in-definition`, `open-paren-in-rtl-span`. The
23 `transform`-route blocking classes are untouched and out of scope.

#### Why Group D defers, and what it must wait for

Sense structure is cheap to correct *only while nothing addresses a
sense*, and today nothing does — by decision, not by luck:

| What could depend on a sense number | State, measured 2026-09-20 |
|---|---|
| internal cross-references | 71,376 refs, every one an entry rid; **0** carry a sense pointer |
| the slug index | rows are `{"rid":…,"slug":…}` — no sense component |
| compiled data and public URLs | `compile.ts` is not written |
| hand edits | the admin tool is not built, so there are none |

> **D8 — No deeper-than-entry addressing (for now).** … `<cite>` carries
> no sense attribute; the vocabulary is additive, so one can be
> introduced the day an editor needs it.
> — [data-architecture §2.3](../specs/2026-07-08-v2-data-architecture-design.md)

So deleting a bogus lead sense today costs nothing: nothing anywhere
names sense 2. The cost appears at one of two future events, and that is
where these nine bind:

**Precondition.** The nine Group D classes must be examined before
sense-level addressing is introduced (D8 lifted) **or** the admin tool
opens hand editing, whichever comes first. After either, a renumbering
collides with public links and with hand edits, and §3.2's three-way
merge reconciles it per entry. The precondition is recorded against
`compile.ts` (data-architecture §3) and the admin-tool spec in the
consolidation spec's §10.

This is the same shape as the slug freeze: R10 binds at v2 publication,
not during development. A constraint scoped to a future event must not
bind before it.

One argument against fixing them early, for the record: the *fix* is the
dangerous half. `senses[0]` is the gloss head, so dropping an empty lead
consumes sense 1, and the loss is invisible to text-level gates because
the entry's total text does not change. A hurried sweep over
`etymology-head-pseudo-sense`'s 1,553 candidates before launch is
riskier than a deliberate one after.

#### What a later reader needs to know about these counts

Of the 32, only 11 carry a count that means anything: 9 reproduced and 2
are controlled zeros. For the other 21 the detector is archived at
`refs/tags/archive/v2-research-2026-09` and unported, so the numbers in
Groups D and E measure the stand-in predicate, not the class. Porting a
detector is §10 work, one class per PR; the number in this file is the
catalogued one until that happens.
