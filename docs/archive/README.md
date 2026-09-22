# Archive

Retired research documents and one-time investigation artifacts,
moved here by the 2026-09 pipeline consolidation, step 6
(2026-09-16). Nothing here is part of the live pipeline
(`admin/pipeline/README.md`) or gated by CI — kept for institutional
record only.

The code counterpart lives at `refs/tags/archive/v2-research-2026-09`:
~36 source files and 27 tests (the `admin/pipeline/research/` tree,
`page-index/build.ts`, `body/census.ts`, `body/review.ts`,
`body/migrate-dry.ts`, `body/fixtures/extract.ts`, and related tests)
were archived to that branch and tag rather than deleted.

## Retired patch records (2026-09-22)

[`patches-retired-2026-09-22/`](patches-retired-2026-09-22/) is a later
arrival, and the only one here that is not from step 6.
`data/patches/` now holds only the records the import run applies, plus
the `needs_*` escalations it defers (Brian's ruling, 2026-09-22). The 72
patch records it no longer applies — 61 `superseded`, 11 consolidated
away — and the sweep-era research residue moved there, byte-exact, under
the directory layout they had. That directory's README lists every
moved record with its rid, source directory and reason.

## Renamed on the way in

`docs/specs/*` history is deliberately left unrewritten, so it still
names these old paths:

| Old path | New path |
|---|---|
| `data/patches/discovery-round-2/` | `docs/archive/patches-discovery-round-2/` |
| `data/patches/discovery-round-3/` | `docs/archive/patches-discovery-round-3/` |
| `data/patches/checkpoints/` | `docs/archive/patches-checkpoints/` |
| `data/patches/catalogue-audit/` | `docs/archive/catalogue-audit/` |
| `data/source/divergence-report.json` | `docs/archive/divergence-report.json` |

`data/patches/patterns.jsonl` cites 38 `data/patches/catalogue-audit/*.md`
paths in its `reason` fields; those now resolve under
`docs/archive/catalogue-audit/`. Left unrewritten under this step's
zero-behaviour-change constraint.
