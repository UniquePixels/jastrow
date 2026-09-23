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
arrival; so are the plans, the verbatim decisions copy, and everything
the module-boundary sweep brought in (below).
`admin/pipeline/patch/records/` now holds only the records the import
run applies, plus the `needs_*` escalations it defers (Brian's ruling,
2026-09-22). The 72 patch records it no longer applies — 61
`superseded`, 11 consolidated away — and the sweep-era research residue
moved there, byte-exact, under the directory layout they had. That
directory's README lists every moved record with its rid, source
directory and reason.

## The module-boundary sweep (2026-09-22)

When `admin/pipeline/` became a self-contained import module, the live
document set was cut to six and everything else moved here.

| Directory or file | What it holds |
|---|---|
| [`specs/`](specs/) | every dated design spec and implementation plan of the v2 overhaul, including the module-boundary spec and plan that ordered this move. A spec is a snapshot of intent at a date; none of them is live, and `admin/pipeline/DESIGN.md` is the reference in their place |
| [`source-reports-2026-09-22/`](source-reports-2026-09-22/) | four artifacts that sat in `data/source/` without being source data. The files are gitignored; that directory's README is the tracked record of them |
| `headword-design.md`, `research-backlog.md`, `retired-corpus-checks.md`, `url-routes.md` | the research documents that were under `docs/v2/`. `headword-design.md`'s design now lives in `DESIGN.md` §2; code docstrings that cite `retired-corpus-checks.md` point here |

`docs/v2/`, `docs/specs/` and `docs/superpowers/` no longer exist.
`sefaria-report.md` and `upstream-issues.md` stayed live and are in
`docs/`.

## Why the links in `decisions-2026-09-22.md` are dead, and stay dead

**Do not repair relative links in
[`decisions-2026-09-22.md`](decisions-2026-09-22.md).** It is a
byte-verbatim copy of `docs/decisions.md` as it stood before the
2026-09-22 cut. It holds 56 relative links, written to resolve from
`docs/`; 36 of them do not resolve from here, and that is the intended
state. Its whole value is being diffable against the live ledger, and
rewriting one link in it destroys that.

Every OTHER document under `docs/archive/` is expected to have working
relative links, rebased to its new location when it moved here. The
whole-directory exemption this check used to carry was too broad: it
is exactly why 43 links across 14 of those other documents, broken by
the 2026-09-23 module-boundary move, went unnoticed instead of failing
a check. So the exemption now names the one file whose dead links are
deliberate, not the directory:

```sh
# Every tracked markdown file except decisions-2026-09-22.md, which is
# exempt BY DESIGN — see the section above.
git ls-files '*.md' | grep -v '^docs/archive/decisions-2026-09-22\.md$' | while read -r f; do
  grep -oE '\]\([^)#][^)]*\)' "$f" | tr -d '()]' | while read -r l; do
    case "$l" in http*|mailto:*) continue;; esac
    t=${l%%#*}                       # strip the fragment
    [ -n "$t" ] || continue
    d=$(dirname "$f")
    [ -e "$d/$t" ] || echo "DEAD in $f: $l"
  done
done
```

Three things about it are load-bearing, and an earlier hand-written
version of this check got each of them wrong:

- **The scope is derived from the tree, not typed.** A list of
  documents cannot see a file that the change under review has just
  moved — which is how fifteen dead links in `docs/upstream-issues.md`
  survived a check that reported clean on 2026-09-22.
- **The fragment is stripped before the target is tested.** Otherwise a
  link to a deleted file passes as long as it carries an `#anchor`.
- **There is no repo-root fallback.** A trailing `|| [ -e "$l" ]` makes
  a link with the wrong number of `../` resolve anyway, which is a
  second way a move can test clean.

When it reports something under `docs/archive/`, the answer is now to
repair the link — rebase it to the document's current location, the
way finding 5 of the 2026-09-23 module-boundary review did. Only a
report naming `decisions-2026-09-22.md` itself means the exemption was
bypassed; that file's dead links are deliberate and stay dead.

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

`admin/pipeline/patch/records/patterns.jsonl` cites 38
`data/patches/catalogue-audit/*.md` paths in its `reason` fields; those
now resolve under `docs/archive/catalogue-audit/`. Left unrewritten
under this step's zero-behaviour-change constraint.
