# The Data Pipeline

The auditable, reproducible path from the Sefaria source to the data
the app serves ([overhaul design spec](../../docs/specs/2026-07-03-v2-overhaul-design.md)).
Read top to bottom, this is how the dictionary is built from scratch:
fetch the source, run it through import into entry data, compile
entry data into compiled data on every deploy. `migrate.ts` is
permanent and re-runnable — a run regenerates
a candidate tree and a report; it never silently overwrites edited
entry data (R1 of the
[pipeline consolidation design](../../docs/specs/2026-09-13-pipeline-consolidation-design.md),
which supersedes the one-shot framing of D14 in the
[data architecture spec](../../docs/specs/2026-07-08-v2-data-architecture-design.md)
§6).

| Stage | Tool | Status | Runs |
|---|---|---|---|
| Source acquisition | `fetch.ts` | working | on demand, re-runnable |
| Print locator index | `page-index/build.ts` | built 2026-08-17, data committed; tool archived at `refs/tags/archive/v2-research-2026-09` | none — one-time build; admin tool corrects entries afterward |
| Import (source data → entry data) | `migrate.ts` | working; complete as of 2026-09-22, last run the same day | on demand, re-runnable |
| Compile (entry data → compiled data) | `compile.ts` | designed, **not built — next** | every deploy |

Import and compile are specified in the
[data architecture spec](../../docs/specs/2026-07-08-v2-data-architecture-design.md)
(§6) and the [pipeline consolidation design](../../docs/specs/2026-09-13-pipeline-consolidation-design.md)
(§3). Every ruling behind either of them, with what it drops, is
indexed in [`docs/decisions.md`](../../docs/decisions.md).
One-time examinations of the v1 data — important record, but
**not** steps in this path — were archived with the rest of the
research code at `refs/tags/archive/v2-research-2026-09` (consolidation
spec §8).

The flow is drawn in
[`docs/pipeline-flow.drawio.svg`](../../docs/pipeline-flow.drawio.svg)
(renders on GitHub; opens in draw.io for editing). The maintainer's
original sketch it was derived from was archived 2026-09-21 as
`docs/archive/migrate-flow-sketch.drawio`.

### Inputs

| Directory | Contents | Committed | Who writes it |
|---|---|---|---|
| `data/source/` | Sefaria snapshot | yes | `fetch.ts` |
| `data/page-index/` | print locators (page/column) — reference data | yes | `page-index/build.ts` (archived at `refs/tags/archive/v2-research-2026-09`); admin tool corrects |
| `data/patches/` | per-entry judgments | yes | admin tool appends |
| `data/quarantine/` | unresolved citation targets | yes | reviewed by hand |

### Running it

Tool versions are pinned in `.mise.toml` (Bun 1.3.14, Biome 2.5.2);
with [mise](https://mise.jdx.dev) installed, `mise install` then
`bun install` is the whole setup.

The normal run is `data:fetch` then `data:import`: pull the current
export, process it, read the report.

`data:import` is **dry by default** and writes no entry data. Every
run produces three documents, dry or not:

| Document | What it is |
|---|---|
| `data/source/migration-report.json` | the machine-readable report (gitignored) |
| [`docs/v2/migration-blessing.md`](../../docs/v2/migration-blessing.md) | the evidence a person reads before accepting a run |
| [`docs/v2/review-report.md`](../../docs/v2/review-report.md) | one row per item a person must judge |

Two flags change what a run will refuse:

- `--write` writes `data/entries/`, and refuses unless that directory
  is **empty**. The guard stands in for the update run (consolidation
  spec §3.2): until its three-way merge exists, a second write over a
  populated tree would overwrite hand edits blindly. R11 calls the
  guard a relic of the withdrawn D14 rather than a safety property,
  and retires it with that merge.
- `--strict` promotes a stale snapshot pin and a drifted patch
  precondition from report rows to refusals (§4.2).

## Stage 1 — Source acquisition (`fetch.ts`)

```bash
bun admin/pipeline/fetch.ts           # download dump + decode + emit
bun admin/pipeline/fetch.ts --cached  # re-decode from .cache/sefaria (no download)
```

### Channel decision (spec task 1.1)

The canonical channel is **Sefaria's public MongoDB dump**:

`https://storage.googleapis.com/sefaria-mongo-backup/dump_small.tar.gz`

| Channel | Verdict |
|---------|---------|
| MongoDB dump (`lexicon_entry` collection) | **Chosen.** The database Sefaria actually serves, refreshed roughly daily, publicly documented in their [local-install docs](https://developers.sefaria.org/docs/local-installation-instructions) |
| [Sefaria-Export](https://github.com/Sefaria/Sefaria-Export) | Rejected: texts and links only, no lexicon collections |
| [Sefaria-Data](https://github.com/Sefaria/Sefaria-Data) | Rejected: import sources for texts; no Jastrow lexicon source |
| [Words API](https://developers.sefaria.org/reference/get-words) | Rejected: per-word lookup only; a full crawl would need ~30k requests and still reflect the same database the dump snapshots |

The dump is ~2.4 GB compressed (~10+ GB unpacked), so `fetch.ts`
streams it: gunzip + tar parsing happen in memory and only the three
lexicon collections are written to disk (`.cache/sefaria/`, gitignored).
The download is cancelled as soon as all targets are captured.
Streaming primitives live in `lib.ts` (unit-tested).

### One Jastrow lexicon (not two)

Sefaria's code maps a second parent lexicon, `Jastrow Unabbreviated`
(see `LexiconEntrySubClassMapping` in Sefaria-Project
`sefaria/model/lexicon.py`), but the deployed database does not carry
it: the 2026-07-04 dump has no `lexicon` record and zero
`lexicon_entry` docs under that name. Only `Jastrow Dictionary`
(32,512 entries) exists and is emitted.

### Outputs (`data/source/`, committed)

| File | Contents |
|------|----------|
| `jastrow-dictionary.jsonl` | `lexicon_entry` docs with `parent_lexicon: "Jastrow Dictionary"`, verbatim, dump order, relaxed extended JSON |
| `lexicons.json` | The Jastrow lexicon registry record |
| `manifest.json` | Provenance: dump URL, ETag, Last-Modified, fetch time, sha256 + entry count per output |

Documents are emitted **unmodified** — no transformation happens in
this stage, so `data/source/` is a faithful snapshot of the source.
`word_form.bson` is cached for later use (search word forms) but not
yet emitted.

## Stage 2 — Import (`migrate.ts`)

```bash
bun data:import           # dry run: report + docs/v2/migration-blessing.md
bun data:import --write   # after blessing: writes data/entries/
```

Transforms the source snapshot into entry data, one JSON file per
entry (`data/entries/`), per the
[data architecture spec](../../docs/specs/2026-07-08-v2-data-architecture-design.md)
§6: the headword LINE read into `headwords[]` and an optional
`display` template ([headword design](../../docs/v2/headword-design.md)
§2 — the forms hold clean Hebrew, print's grouping and marks hold the
layout), link typing, markup translation into the
closed tag vocabulary, refs resolution, `sefariaHeadword` (Sefaria's
own headword, verbatim, the field the URL routes key on), and the
print-locator (`page`/`column`) enrichment — read from the hOCR page
index (`data/page-index/entries.jsonl`, all 32,512 entries). Its code
is one of three buckets — rules (detect + fix, general), patches
(one entry's judged fix, applied when its precondition holds), or
review detectors (detect only, emit a row, repair nothing) — per the
[pipeline consolidation design](../../docs/specs/2026-09-13-pipeline-consolidation-design.md)
§4. The catalogued classes' detectors live in `migrate/detectors/`,
registered in `detectors/classes.ts` and run on the FINISHED entry: a
predicate written against the snapshot would measure zero once the
transforms have run. Gated by the nine blessing gates of the
[migrate spec](../../docs/specs/2026-09-06-migrate-design.md) §4.1 —
round-trips, text conservation, schema, chain agreement, internal
targets, names, pages, composition; a red gate refuses to write.
`migrate.ts` is re-runnable: it never chokes on the data it is
given, and it never silently overwrites hand edits in entry data. A
composition failure is a `composition-failed` fault row and a red
gate 9; the entry is dropped, not emitted from source bytes — R3's
target of resilient, always-emitted output is not yet built. Every
run ends in a report a person reads before the output ships — the
import report `data/source/migration-report.json`, rendered as the
blessing doc
[docs/v2/migration-blessing.md](../../docs/v2/migration-blessing.md).
The report holds the nine gate tallies, one row per review item,
patch re-judgment or pipeline fault (`{ rid, bucket, kind, severity,
detail }`), a composed count per rule, and an outcome per patch
(`applied`, `superseded`, `upstream-fixed`, `upstream-changed`) —
except a patch that fails its apply gate or targets a missing entry,
which gets a fault row instead of an outcome, and a carry-over patch
whose target resolves 0 times, which is `superseded` by construction
rather than drift-classified. A stale snapshot pin is a count, not a
refusal; `bun data:import --strict` refuses on a stale pin or a
drifted patch.

**Hebrew and NFC.** Every comparison — a name's uniqueness, a headword
lookup, the duplicate-form check — normalizes to NFC first, because
combining-mark order varies in the source and a byte-exact match on
Hebrew is a bug.

The write step is also the one place stored text is rewritten:
`normalizeForWrite` puts every string of an entry file into NFC
([#110](https://github.com/UniquePixels/jastrow/issues/110)), under an
assertion that `NFD(before) == NFD(after)`, so a normalization that
would not be lossless refuses the write instead. It runs after the
gates have read the in-memory entries, and `data/source/` is never
touched — the snapshot still holds the 201 non-NFC strings
[sefaria-report §17](../../docs/v2/sefaria-report.md) reports upstream,
because that file records what Sefaria serves, not what we store.

**Last run 2026-09-22 with all nine gates green**, `--write`: the
batched rewrite of all 32,512 files to schema v2 (HW-schema). It is
the run that carried every code change since 2026-09-09 into
`data/entries/` — `headwords[]` and `display` for
`headword`/`altHeadwords`, `sefariaHeadword` for `slug`,
`"schemaVersion": 2`, the `pr. n. pl.` grammar fix
([#117](https://github.com/UniquePixels/jastrow/issues/117), 432
entries) and NFC on write (164 strings in 150 files). A second dry run
over the written tree reproduces the same nine tallies and the same
generated docs, byte for byte.

## Stage 3 — Compile (`compile.ts`, not yet built)

Truth → serving artifacts on every deploy: validate (schema, tag
vocabulary, names, refs) → transform (abbreviation detection, display
regeneration, link expansion) → emit (entry shards, browse index,
route map, page index, search artifacts, version manifest) → gate
(golden render diffs, coverage reports). Specified in the data
architecture spec §3.
