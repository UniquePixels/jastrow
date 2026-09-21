# Reviewed patches

Patches a person wrote from a print check (consolidation spec §4.2).
`patches.jsonl` holds the patches; `manifest.jsonl` holds one record
per rid: `repaired` with its patch ids, or `needs_human_judgment` with
the unresolved finding as `escalation`.

- The loader (`loadReviewedCorpus` in `admin/pipeline/patch/apply.ts`)
  stamps every patch here `author: 'human'`. That exempts it from the
  no-new-text floor, so a reviewed patch may add bytes (a reinserted
  marker, a wrapping anchor).
- They apply first in `patch-apply`, after both transform phases and
  before any agent patch. They are outside Ruling C: that ruling's
  one-record-per-rid rule is for agent tranches, and some rids here
  also have agent records.

## Rulings still in force

Lifted verbatim from `data/patches/RUNBOOK.md` when that procedure was
archived on 2026-09-21 as
[`docs/archive/runbook-2026-08.md`](../../../docs/archive/runbook-2026-08.md).
These three rulings outlived the procedure around them.

- **Review cadence (maintainer, 2026-08-15):** per-batch escalation
  review is waived — batch-01 sampling established that queue items
  are genuinely human-review-worthy (9 rulings reviewed, 1 false
  alarm). All `needs_*` rows accumulate into one consolidated report
  at the end of the sweep.
- **Triage (maintainer, 2026-08-15):** every escalation defaults to
  `post-go-live` — these are pre-existing source defects, not
  pipeline regressions, so none block shipping. `blocking` is a
  per-item override applied during the consolidated review. Recorded
  in the resolution text (a structured `triage` field on rows comes
  with the consolidated-report tooling).
- **Wrong-reference handling (maintainer, 2026-08-15, A00363/A00571
  precedents):** transcription-level errors (OCR glyphs) are fixed
  and confidently relinked; print-level bad references are delinked
  with an apparatus note (print reading → problem → Sefaria's choice
  → other candidates → action); pure linker overreach is delinked
  silently.

## Provenance

Seeded on 2026-09-18 by `admin/pipeline/patch/seed-reviewed.ts` from
the rid-keyed tables in `admin/pipeline/body/repairs.ts`, which
transcribed the maintainer's 2026-08-05 decisions in review docs 01–06
(`docs/archive/body-review/`). Each patch's `rationale` names its
review doc and table. For every rid, the seeder proved that applying
its patches to the transformed entry WITHOUT the old repair
reproduces the transformed entry WITH it, exactly. It then reloaded
the written files and proved them again.

The seeder ran once, on 2026-09-18, from commit 53e722b1. It was
deleted in the commit that retired the `repairs.ts` tables, because it
imported them; git history keeps it.

Two patches carry bytes that transform rules produced when they ran
on the repaired text: P000210 (C00062) inserts an rtl span, and
P000221 (H00871) restores two `Exodus 14` links. A change to those
rules can make these two patches report drift.

`repairs.ts`'s header used to keep a register of `deviation: true`
repairs, places where v2 deliberately differs from the printed text
(upstream-issues register #16). That register now lives in the
reviewed patches' `rationale`: the implied `1)` labels (B01321,
C01169, U01787, D00072) and D00341's bracket move.

The three `needs_human_judgment` rows (D00470, K00081, R00519) are the
review's deferred rows. They carry no patch.

## Confirmed no change

These 19 rids were reviewed and need no patch. The swallowed sense
boundary leaves the marker in the text, so the text already matches
print. The issue is upstream only.

A01350, A01989, C00328, C00581, E00024, H00301, H01701, J00501,
J00515, M00252, N01155, O00321, P00882, P01426, Q00547, Q00997,
R00536, S02265, U00764
