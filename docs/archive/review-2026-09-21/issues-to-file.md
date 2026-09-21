# Issues to file — Q11 ruling (option C), 2026-09-21

Ruled by the maintainer in the post-consolidation review, §10 Q11. Three
umbrella issues stand in for `docs/v2/research-backlog.md` until the
admin tool's import exists. Each links a backlog section and carries no
rid table. Nothing here was filed by the session that drafted it; the
controller session executes.

Order: file after the triage's consolidated headword issue B and the
retitled #113 ([report-issues.md](report-issues.md) cluster 1), so the
sense-structure issue can cite #113 for the headword side. All three are
`data`-labelled. Counts are the backlog's, measured 2026-09-18/20; the
bodies say so and point at the doc rather than restating predicates.

| # | Title | Label | Backlog section |
|---|---|---|---|
| 1 | Sense structure: nine deferred classes, examine before D8 is lifted or hand editing opens | `data` | Group D, list 3 |
| 2 | Deferred judgment classes: port a detector or discard, one class per PR | `data` | Groups B, E |
| 3 | Sweep escalations: 588 entries for the admin tool, post-go-live | `data` | lists 1, 2 |

Net effect with the triage's closes and merges: 18 open → 9.

## Issue 1

Title: `Sense structure: nine deferred classes, examine before D8 is lifted or hand editing opens`

```
Nine pattern classes change how many senses an entry has and how they
are numbered. Step 11 of the consolidation (2026-09-20) set them
`blocking: false` with a precondition instead of deferring them outright:

> The nine Group D classes must be examined before sense-level
> addressing is introduced (D8 lifted) or the admin tool opens hand
> editing, whichever comes first.

Today nothing addresses a sense — 0 of 71,376 internal refs carry a
sense pointer, the slug index has no sense component, compile.ts is not
written, and there are no hand edits — so a renumbering is free. After
either event it collides with public links and hand edits.

Where the work is:
- Classes, evidence and why the recount is not evidence:
  docs/v2/research-backlog.md § "Group D — the sense-structure family"
- The precondition, pinned on compile.ts and the admin-tool spec:
  docs/specs/2026-09-13-pipeline-consolidation-design.md §10
- In-text sense-marker shapes A/B/C (from #18 and #42, closed into the
  backlog): the Group D row added by the 2026-09-20 triage
- The 21 implied-`1)` candidates never decided (rids J–V):
  docs/v2/research-backlog.md § 3

Checklist — one box per class; a box closes when the class has a ported
review detector emitting report rows, or a `discarded` row in
data/patches/patterns.jsonl with a control:

- [ ] etymology-head-pseudo-sense
- [ ] preamble-stranded-lead-sense
- [ ] self-numbered-intext-marker
- [ ] inline-inflection-sublist
- [ ] continuation-marker-fully-absent
- [ ] first-sense-debris-stranding-language-label
- [ ] verse-paren-false-sense-split
- [ ] chopped-marker-with-residue
- [ ] inflection-sublist-numbering-flattened
- [ ] the 21 implied-`1)` rows decided (confirmed or otherwise) in
      body-review 08's table

Why not fix now: `senses[0]` is the gloss head, so dropping an empty lead
consumes sense 1, and a text-conservation gate cannot see it. A hurried
sweep before launch is riskier than a deliberate one after.

Do not copy rid tables here. Counts in the backlog are the catalogued
ones until a detector is ported; the doc says which are evidence.
```

## Issue 2

Title: `Deferred judgment classes: port a detector or discard, one class per PR`

```
Sixteen pattern classes in data/patches/patterns.jsonl were ruled
`blocking: false` on 2026-09-20 (step 11, Groups B and E): each is a
text-level defect or a diagnostic, visible but correctable per entry in
the admin tool without moving a URL or a sense number.

The tracker work is the consolidation spec's §10 row "port judgment-class
detectors from archived research code, one class per PR". A ported
detector emits review-report rows for the admin tool; a class with no
recoverable detector is discarded with a control.

Where the work is:
- Classes, predicates and counts:
  docs/v2/research-backlog.md § "Group B" and § "Group E"
- Archived detectors: refs/tags/archive/v2-research-2026-09
- What a count is worth (only 11 of 32 recounts were evidence):
  docs/v2/research-backlog.md § "What the recount can and cannot say"

Checklist — a box closes when the class has a review detector in
admin/pipeline/migrate/ emitting report rows, or a `discarded` row in
patterns.jsonl with a control. Print-bound classes are marked; their
rows go to the admin tool, the detector still ships.

Group B (reproduced, text-level):
- [ ] unmatched-opening-paren
- [ ] common-gender-inexpressible (a backfill of grammar.gender "c";
      may be a rule, not a detector)
- [ ] lost-h-equivalent — print
- [ ] truncated-read-stub — print

Group E (detector unported; the backlog's count is the predicate's):
- [ ] citation-tail-truncation — print
- [ ] unmatched-closing-paren
- [ ] stem-label-not-a-binyan-name
- [ ] doubled-space-as-text-loss-locator (a locator, not a defect;
      review detector at most)
- [ ] unclosed-editorial-bracket — print
- [ ] bracket-paren-mismatch
- [ ] dangling-denom-tail — print
- [ ] lost-hebrew-after-h-marker — print
- [ ] contentless-entry — print
- [ ] unnumbered-terminal-homograph — print; overlaps
      headword-issues.md X8 (see the consolidated headword issue)
- [ ] gloss-space-loss
- [ ] reversed-hebrew-phrase

Not here: the five classes still `blocking: true` (they gate the
cutover and are in the review report's scope), the two `discarded`
(stem-head-in-child-sense, sense-number-outside-closed-grammar), the
nine Group D classes (their own issue), and the 41 judgment classes
never flagged blocking, which stay in patterns.jsonl until someone
picks one up under the same §10 row.

Do not copy rid tables here.
```

## Issue 3

Title: `Sweep escalations: 588 entries for the admin tool, post-go-live`

```
The research sweeps escalated 588 entries that no rule repairs and no
detector flags. The RUNBOOK's default applies and was ratified on
2026-08-15: no sweep escalation blocks shipping; every one is post-go-live
work in the admin tool.

| List | Entries | Of which print check | Source |
|---|---|---|---|
| Residue sweep (calibration, batch-01–05, residue-01) | 487 | 116 | 7 manifests under data/patches/tranches/ |
| Earlier chunk sweep on pre-patch text, never re-swept | 101 | 37 | data/patches/pilot/, data/patches/tranches/tranche-01/ |

Two classes account for 478 of the 487: wrong-link-target (406) and
lost-parenthetical (116); the class analysis is
docs/archive/phase-2-class-report.md.

Where the work is:
- docs/v2/research-backlog.md § 1 and § 2 (coverage: the sweeps walked
  2.2% of the corpus, rids A–C only; a small count measures the walk,
  not the corpus)
- The 101 were escalated on pre-patch text; nobody has measured how
  many still read dirty after the rules ran. That measurement is the
  first task.

Closes when the admin tool's import (consolidation spec §10, "review
rows → tracker issues, idempotent on (rid, kind)") ingests the
manifests, or when the maintainer rules the lists archived. Four rids
(A00913, A03277, C00062, C00244) also carry a step-8 reviewed patch
naming a different finding; neither closes the other.

Do not copy the manifests here; link them.
```

## Not filed, and why

| Candidate | Why no issue |
|---|---|
| Headword print work (Cluster 1) | already the triage's consolidated issue B + retitled #113 |
| 298 low-confidence page placements | maintainer's ruling: fix as found, never schedule work on the page index; the §10 row stays as a note, not a work item |
| 41 judgment classes never flagged blocking | stay in `patterns.jsonl`; issue 2's "not here" paragraph names them |
| The 2,204 `defer` rows of `review-report.md` | generated rows; the admin tool's `(rid, kind)` import owns them |
