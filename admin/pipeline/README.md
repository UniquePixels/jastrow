# The Data Pipeline

The auditable, reproducible path from the Sefaria source to the data
the app will serve. Read top to bottom, this is how the dictionary is
built from scratch: fetch the source, run it through import into
entry data, then — **UNBUILT**, `compile.ts` does not exist yet — compile
entry data into compiled data on every deploy.
`migrate.ts` is permanent and re-runnable — a run regenerates a
candidate tree and a report; it never silently overwrites edited
entry data. The design behind every stage, including why it works
this way, is [`DESIGN.md`](DESIGN.md).

| Stage | Tool | Status | Runs |
|---|---|---|---|
| Source acquisition | `fetch.ts` | working | on demand, re-runnable |
| Print locator index | `page-index/build.ts` | built 2026-08-17, data committed; tool archived at `refs/tags/archive/v2-research-2026-09` | none — one-time build; admin tool corrects entries afterward |
| Import (source data → entry data) | `migrate.ts` | working; complete as of 2026-09-22, last run the same day | on demand, re-runnable |
| Compile (entry data → compiled data) | `compile.ts` | designed, **not built — next** | every deploy |

Every ruling behind the module, with what it drops, is indexed in
[`docs/decisions.md`](../../docs/decisions.md). One-time examinations
of the v1 data — important record, but **not** steps in this path —
were archived with the rest of the research code at
`refs/tags/archive/v2-research-2026-09`.

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
| [`docs/reports/migration-blessing.md`](../../docs/reports/migration-blessing.md) | the evidence a person reads before accepting a run |
| [`docs/reports/review-report.md`](../../docs/reports/review-report.md) | one row per item a person must judge |

Two flags change what a run will refuse:

- `--write` writes `data/entries/`, and refuses unless that directory
  is **empty** — a stand-in for the update run this module does not
  yet have. See [`DESIGN.md`](DESIGN.md) §11.
- `--strict` promotes a stale snapshot pin and a drifted patch
  precondition from report rows to refusals. See
  [`DESIGN.md`](DESIGN.md) §3, "The snapshot pin".

### Running it on different data

This module names nothing outside itself except through
[`paths.ts`](paths.ts). To run the same pipeline over another
lexicon: point those constants at your files, supply an entry schema
at `SCHEMA_PATH`, and run the two commands above. Nothing in `docs/`
is needed to run it.

What will not transfer: the transform rules and the patch records
under `patch/records/` are corrections to *this* dictionary as Sefaria
holds it. They are the module's import definition, not its engine.

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
bun data:import           # dry run: report + docs/reports/migration-blessing.md
bun data:import --write   # after blessing: writes data/entries/
```

Transforms the source snapshot into entry data, one JSON file per
entry (`data/entries/`): the headword LINE read into `headwords[]`
and an optional `display` template ([`DESIGN.md`](DESIGN.md) §2 — the
forms hold clean Hebrew, print's grouping and marks hold the layout),
link typing, markup translation into the closed tag vocabulary, refs
resolution, `sefariaHeadword` (Sefaria's own headword, verbatim, the
field the URL routes key on), and the print-locator (`page`/`column`)
enrichment. Its code is one of three buckets — rules (detect + fix,
general), patches (one entry's judged fix), or review detectors
(detect only) — per [`DESIGN.md`](DESIGN.md) §6. Gated by the nine
blessing gates of [`DESIGN.md`](DESIGN.md) §9; a red gate refuses to
write. `migrate.ts` is re-runnable: it never chokes on the data it is
given, and it never silently overwrites hand edits in entry data.

Every run ends in a report a person reads before the output ships —
the import report `data/source/migration-report.json`, rendered as
the blessing doc
[`docs/reports/migration-blessing.md`](../../docs/reports/migration-blessing.md).
The report holds the nine gate tallies, one row per review item, patch
re-judgment or pipeline fault, and a composed count per rule, plus an
outcome per patch — see [`DESIGN.md`](DESIGN.md) §5 for the four
outcome values and what each means. `bun data:import --strict`
refuses on a stale snapshot pin or a drifted patch. See
[`DESIGN.md`](DESIGN.md) §10 for what a review row means.

**Hebrew and NFC.** Every comparison — a name's uniqueness, a headword
lookup, the duplicate-form check — normalizes to NFC first, because
combining-mark order varies in the source and a byte-exact match on
Hebrew is a bug. The write step is also the one place stored text is
rewritten, under an assertion that a lossy normalization refuses the
write rather than silently corrupts it; `data/source/` is never
touched. See [`DESIGN.md`](DESIGN.md) §11, "What is never stored, and
where text is rewritten".

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

`compile.ts` does not exist yet. It will consume entry data and, on
every deploy, validate, transform and emit the serving artifacts —
entry shards, browse index, route map, page index, search artifacts,
version manifest. See [`DESIGN.md`](DESIGN.md) for what of it is
designed and what remains open.
