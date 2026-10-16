# Reviewed patches

As of 2026-09-22 `admin/pipeline/patch/records/` holds only the patch
records the import run applies, plus the `needs_*` escalations it
defers. The 72 it no longer applies — 61 `superseded` carry-overs and
11 consolidated away — and the sweep-era research residue are at
[`docs/archive/patches-retired-2026-09-22/`](../../../../../docs/archive/patches-retired-2026-09-22/).
None of the 114 reviewed patches here moved.

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

On 2026-10-11 (PR #160, ledger L58) 28 more left: the companion
`replace` patches (`)<` → `) <`) that put back the space a `join`
lost after its marker. The `join` op now restores that space itself,
so the 28 entries came out byte-identical without them. Their bytes
are at
[`docs/archive/patches-retired-2026-10-11/`](../../../../../docs/archive/patches-retired-2026-10-11/).

## The `annotation` field

Since PR #172 a reviewed patch may carry an `annotation` (ruling
`10-13 correction policy`, [`admin/entry/ANNOTATIONS.md`](../../../../entry/ANNOTATIONS.md)
§3): print's reading where the patch departs from it, or the record
that print was read and kept.

```json
"annotation": {"kind": "print-error", "printed": "", "evidence": "a 2) follows the unlabelled first sense", "date": "2026-10-13"}
```

- `kind`: `print-error` (case 2, the intended value is determined),
  `illegible` (case 4, our best reading) or `kept` (case 3, only on
  `annotate`).
- `printed`: print's reading of the field, `''` where print sets
  nothing; a numeral as print writes it (`I`), a label without `)`.
- `evidence`: the proof (case 2), the readings (case 3) or why
  (case 4). Jastrow's printed text only, never a link target.
- `date`: `YYYY-MM-DD` of the print read or the ruling.

The import adds `field`, `stored` and `source` (this patch's id) and
writes the annotation on the form or sense it describes. Allowed on
`retag` (the label), `replace` (the gloss or unit the replacement
lands in; it must be balanced markup found exactly once there),
`reform` (the one homograph its `homographs` sets, or the one form
whose text it respells), `annotate` and `relabel`. Refused on `split`, `join`,
`nest`, `move`, `delete` and `unref`, and on any patch outside this
directory.

`annotate` changes nothing. Its `payload.field` is `label`, `gloss` or
`units` on a `sense[…]` target, or `text` or `homograph` with
`payload.form` (the parsed form's index) on a `forms:` target, and its
`expected_before` pins the target, so the note fails loudly when
upstream rewrites what it describes. It carries only a `kept`
annotation; a correction is annotated on the op that makes it. Like
any patch, it may not share its target with another patch on the same
rid.

`relabel` (review ledger L59, PR #n) changes no text either. Its
payload `{run, to}` declares the lettered run print set in the target
sense's text, gap included (`run`, print's letters in the text's
order), and the labels its children take (`to`, `a`, `b`, `c`… from
`a`, as long as `run`). The apply refuses a `run` that is not every
counted marker of the text in order; the build splits there and
labels the children from `to`. It always carries a `print-error`
annotation with `printed: ''`, and the import writes one annotation
per child whose label changed, with print's letter as `printed`.
P000812 (P00790's Hif. `a) b) c) d) f) g) h)` → `a b c d e f g`) is
the first; [`../tranches/lettered-relabel-2026-10-16/`](../tranches/lettered-relabel-2026-10-16/README.md).

Since PR #174 five carry one: the implied-I reforms P000343, P000344,
P000348, P000353 and P000355, each a `print-error` on the I that
Jastrow's text names (data PR (i) of `docs/correction-audit.md` §7;
[`../tranches/implied-i-2026-10-14/`](../tranches/implied-i-2026-10-14/README.md)).
Since PR #175 61 more do: the retags that set RP8's implied `1)` labels,
each a `print-error` on the label (data PR (ii);
[`../tranches/rp8-marks-2026-10-14/`](../tranches/rp8-marks-2026-10-14/README.md)).
24 were here already. 36 were agent patches, in
`seed-doc-08-implied-one` (33), `batch-02-2026-09-04`, `residue-01`
and `seed-doc-08-sense-runs`, and moved here with their 37
`implied-one` companion splits, keeping their ids, because an agent
patch may not carry an annotation. D00072's is P000554, new. Since
PR #176 26 more do (data PR (iii);
[`../tranches/class3-renumber-2026-10-15/`](../tranches/class3-renumber-2026-10-15/README.md)):
24 new `retag`s (P000556–P000579) renumber the class 3 doubled sense
numbers on 18 entries, each a `print-error` on the label; S01849's
`replace` (P000580) moves its cross-reference `עָבַר Pi. 4)` to
`Pi. 5)`; and U01512's `annotate` (P000581), the first, records the
participle's `a) … 2)` as `kept`. Since PR #n P000812, the first
`relabel`, writes three on P00790's Hif. sense 2 (`f g h` → `e f g`).
The other data PRs follow (review ledger plan group 6b).

On 2026-10-14 (PR #174) 9 more left: the implied-I reforms whose I no
text of Jastrow's names (ruling 10-13 correction policy). In PR #175
P000214 followed: D00072's `replace` that wrote its implied `1)` into
the gloss, replaced by a `retag` (P000554) and a `split` (P000555).
Their bytes are at
[`docs/archive/patches-retired-2026-10-14/`](../../../../../docs/archive/patches-retired-2026-10-14/README.md).

## Rulings still in force

Lifted verbatim from `data/patches/RUNBOOK.md` when that procedure was
archived on 2026-09-21 as
[`docs/archive/runbook-2026-08.md`](../../../../../docs/archive/runbook-2026-08.md).
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
C01169, U01787, D00072) and D00341's bracket move. Since PR #175 the
implied `1)` labels also carry a `print-error` annotation each, and
D00072's is a label (P000554), no longer text.

The three `needs_human_judgment` rows (D00470, K00081, R00519) are the
review's deferred rows. They carry no patch.

## Confirmed no change

The name was retired by S6 of the sense-structure spec; it is kept
here as history.

These 19 rids were reviewed and need no patch. The swallowed sense
boundary leaves the marker in the text, so the text already matches
print. The issue is upstream only.

A01350, A01989, C00328, C00581, E00024, H00301, H01701, J00501,
J00515, M00252, N01155, O00321, P00882, P01426, Q00547, Q00997,
R00536, S02265, U00764
