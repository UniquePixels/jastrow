# Retired patch records (2026-09-22)

`data/patches/` holds only what the import run applies (Brian's ruling,
2026-09-22). Everything here left that directory because the run does
not apply it. Nothing is deleted: every line below is the original
line's bytes, moved, and git history holds the files as they stood.

Layout mirrors the source: `pilot/` and `tranches/<dir>/` are the
directories these records came from.

## What left, and why

| Class | Records | Where they were |
|---|---|---|
| `superseded` — a transform rule now fixes the defect before the patch would apply, so the run absorbed it and applied nothing | 61 patches | `pilot/` (3), `tranches/tranche-01/` (58) |
| `consolidated away` — Ruling C kept a later sweep's record for the same rid, or Ruling F's carry-over overlap dropped it | 11 patches | `tranches/tranche-01/` (1), `calibration-2026-09-04` (4), `batch-01-2026-09-04` (5), `batch-02-2026-09-04` (1) |
| research residue — sweep-era evidence the loader never reads | `verdicts-*.jsonl`, `rejects.jsonl`, `report*.md` | every tranche directory |

The 61 `superseded` patches are what the run had been reporting as
`carry-over absorbed`; that count is now 0 because the corpus no longer
carries them. The 11 `consolidated away` patches are what
[#134](https://github.com/UniquePixels/jastrow/pull/134) surfaced as
`patch-consolidated-away` review rows; that count is now 0 for the same
reason. Neither change moves a byte of `data/entries/` — see the
controls in the PR that added this directory.

## The whole `pilot/` directory

`pilot/` held no record the run applies: all three of its patches were
`superseded`, so the directory moved entire. Its `manifest.jsonl` came
with it — 210 records (197 `clean`, 3 `repaired`, 6 `needs_print_check`,
4 `needs_human_judgment`). The pilot was swept at the `pre-patch` corpus
stage, so those records were never in the accepted corpus; they were
read only for a count. The 10 escalations among them are readable here.

## Escalations that stayed behind

An escalation is not a patch. Where a `needs_*` record carried one of
the retired patches alongside its escalation, **the record stayed in
`data/patches/`** and lost only its reference to the patch — the
escalation text, the rid and the disposition are untouched. Fifteen
records were treated this way:

| Directory | Record | Disposition | Reference dropped |
|---|---|---|---|
| `tranches/tranche-01` | A00840 | `needs_print_check` | P000033 |
| `tranches/tranche-01` | A00863 | `needs_human_judgment` | P000034 |
| `tranches/tranche-01` | A00877 | `needs_print_check` | P000035 |
| `tranches/tranche-01` | A01067 | `needs_human_judgment` | P000044 |
| `tranches/tranche-01` | A01140 | `needs_human_judgment` | P000045 |
| `tranches/tranche-01` | A01350 | `needs_human_judgment` | P000052 |
| `tranches/tranche-01` | A01406 | `needs_print_check` | P000055, P000056 |
| `tranches/tranche-01` | A01407 | `needs_human_judgment` | P000057 |
| `tranches/tranche-01` | A01468 | `needs_human_judgment` | P000061 |
| `tranches/calibration-2026-09-04` | A00337 | `needs_human_judgment` | P000070 |
| `tranches/calibration-2026-09-04` | A00339 | `needs_human_judgment` | P000068, P000069 |
| `tranches/calibration-2026-09-04` | A00878 | `needs_human_judgment` | P000071 |
| `tranches/batch-01-2026-09-04` | A00074 | `needs_print_check` | P000072 |
| `tranches/batch-01-2026-09-04` | A00339 | `needs_human_judgment` | P000074, P000075 |
| `tranches/batch-02-2026-09-04` | A00878 | `needs_human_judgment` | P000080 |

A `repaired` record could not be treated the same way: its disposition
requires at least one patch, so it cannot hold an empty `patches`, and
calling it `clean` would assert something the sweep never found. The 47
such records left with their patches — 45 from `tranche-01`, 2 from
`batch-01-2026-09-04`. The retired patch's own text is in this
directory, under the same rid, for anyone re-judging the escalation.

**A `repaired` record is also a coverage record**, and that is what this
costs. It says the sweep read the entry, not only that it patched it.
With those 47 gone from `data/patches/`, and the pilot's 210 gone with
their directory, a coverage walk over
`data/patches/tranches/*/manifest.jsonl` will read 255 entries as never
swept. They were swept; the records are here. The pre-patch sweep's
coverage is the live manifests plus these — 1,455 + 45 + 210 = 1,710,
the figure [`docs/v2/research-backlog.md`](../../v2/research-backlog.md)
list 2 states, where this caveat is repeated for the reader who starts
there.

## Every retired record

`reason` is the class above. `kept` names the record that won where one
did; a `superseded` row has no counterpart, because a rule replaced it
rather than another record.

| Patch | Rid | Source directory | Reason |
|---|---|---|---|
| `P000001` | A00014 | `pilot` | superseded: a rule now fixes it first |
| `P000002` | A00085 | `pilot` | superseded: a rule now fixes it first |
| `P000003` | A00130 | `pilot` | superseded: a rule now fixes it first |
| `P000004` | A00211 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000005` | A00260 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000006` | A00282 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000007` | A00302 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000008` | A00339 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000009` | A00339 | `tranches/tranche-01` | consolidated away: P000079 (A00339, batch-02-2026-09-04) is the later record |
| `P000010` | A00356 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000011` | A00349 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000012` | A00367 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000013` | A00417 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000014` | A00436 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000015` | A00442 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000016` | A00463 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000017` | A00465 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000019` | A00519 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000020` | A00524 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000021` | A00577 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000022` | A00611 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000023` | A00628 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000024` | A00628 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000026` | A00652 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000028` | A00722 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000029` | A00722 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000030` | A00761 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000032` | A00821 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000033` | A00840 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000034` | A00863 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000035` | A00877 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000036` | A00892 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000037` | A00901 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000038` | A00968 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000039` | A00980 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000040` | A01012 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000041` | A01025 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000042` | A01028 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000043` | A01042 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000044` | A01067 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000045` | A01140 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000046` | A01153 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000047` | A01155 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000048` | A01220 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000049` | A01244 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000051` | A01346 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000052` | A01350 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000053` | A01358 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000054` | A01400 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000055` | A01406 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000056` | A01406 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000057` | A01407 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000058` | A01415 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000059` | A01416 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000060` | A01458 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000061` | A01468 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000062` | A01509 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000063` | A01509 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000064` | A01543 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000065` | A01544 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000066` | A01571 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000067` | A01614 | `tranches/tranche-01` | superseded: a rule now fixes it first |
| `P000068` | A00339 | `tranches/calibration-2026-09-04` | consolidated away: P000078/P000079 (A00339, batch-02-2026-09-04) is the later record |
| `P000069` | A00339 | `tranches/calibration-2026-09-04` | consolidated away: P000078/P000079 (A00339, batch-02-2026-09-04) is the later record |
| `P000070` | A00337 | `tranches/calibration-2026-09-04` | consolidated away: P000077 (A00337, batch-02-2026-09-04) is the later record |
| `P000071` | A00878 | `tranches/calibration-2026-09-04` | consolidated away: batch-03-2026-09-04's record (A00878, re-escalated, no patch) is the later record |
| `P000072` | A00074 | `tranches/batch-01-2026-09-04` | consolidated away: batch-02-2026-09-04's record (A00074, re-escalated, no patch) is the later record |
| `P000073` | A00337 | `tranches/batch-01-2026-09-04` | consolidated away: P000077 (A00337, batch-02-2026-09-04) is the later record |
| `P000074` | A00339 | `tranches/batch-01-2026-09-04` | consolidated away: P000078/P000079 (A00339, batch-02-2026-09-04) is the later record |
| `P000075` | A00339 | `tranches/batch-01-2026-09-04` | consolidated away: P000078/P000079 (A00339, batch-02-2026-09-04) is the later record |
| `P000076` | A00878 | `tranches/batch-01-2026-09-04` | consolidated away: batch-03-2026-09-04's record (A00878, re-escalated, no patch) is the later record |
| `P000080` | A00878 | `tranches/batch-02-2026-09-04` | consolidated away: batch-03-2026-09-04's record (A00878, re-escalated, no patch) is the later record |
