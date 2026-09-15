# The Data Pipeline

The auditable, reproducible path from the Sefaria source to the data
the app serves ([overhaul design spec](../../docs/specs/2026-07-03-v2-overhaul-design.md)).
Read top to bottom, this is how the dictionary is built from scratch:
fetch the source, run it through migration into the truth layer,
compile truth into serving artifacts on every deploy. `migrate.ts` is
permanent and re-runnable — a run regenerates
a candidate tree and a report; it never silently overwrites edited
truth (R1 of the
[pipeline consolidation design](../../docs/specs/2026-09-13-pipeline-consolidation-design.md),
which supersedes the one-shot framing of D14 in the
[data architecture spec](../../docs/specs/2026-07-08-v2-data-architecture-design.md)
§6).

| Stage | Tool | Status | Runs |
|---|---|---|---|
| Source acquisition | `fetch.ts` | working | on demand, re-runnable |
| Print locator index | `page-index/build.ts` | built 2026-08-17, data committed | on demand (needs the IA hOCR); admin tool corrects entries afterward |
| Migration (source → truth) | `migrate.ts` | working, last run 2026-09-09 | on demand, re-runnable |
| Compile (truth → serving) | `compile.ts` | designed, not built | every deploy |

Migration and compile are specified in the
[data architecture spec](../../docs/specs/2026-07-08-v2-data-architecture-design.md)
(§6) and the [pipeline consolidation design](../../docs/specs/2026-09-13-pipeline-consolidation-design.md)
(§3). One-time examinations of the v1 data — important record, but
**not** steps in this path — live in
[provenance/](provenance/README.md).

### Inputs

| Directory | Contents | Committed | Who writes it |
|---|---|---|---|
| `data/source/` | Sefaria snapshot | yes | `fetch.ts` |
| `data/page-index/` | print locators (page/column) | yes | `page-index/build.ts`; admin tool corrects |
| `data/patches/` | per-entry judgments | yes | admin tool appends |
| `data/quarantine/` | unresolved citation targets | yes | reviewed by hand |

The normal run is `fetch` then `migrate`: pull the current export,
process it, read the report.

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

## Stage 2 — Migration (`migrate.ts`)

```bash
bun pipeline:migrate           # dry run: report + docs/v2/migration-blessing.md
bun pipeline:migrate --write   # after blessing: writes data/entries/
```

Transforms the source snapshot into the per-entry truth layer
(`data/entries/`), per the
[data architecture spec](../../docs/specs/2026-07-08-v2-data-architecture-design.md)
§6: headword decomposition, link typing, markup translation into the
closed tag vocabulary, refs resolution, slug assignment, and the
print-locator (`page`/`column`) enrichment — read from the hOCR page
index (`data/page-index/entries.jsonl`, all 32,512 entries). Its code
is one of three buckets — rules (detect + fix, general), patches
(one entry's judged fix, applied when its precondition holds), or
review detectors (detect only, emit a row) — per the
[pipeline consolidation design](../../docs/specs/2026-09-13-pipeline-consolidation-design.md)
§4. Gated by the nine blessing gates of the
[migrate spec](../../docs/specs/2026-09-06-migrate-design.md) §4.1 —
round-trips, text conservation, schema, chain agreement, internal
targets, slugs, pages, composition; a red gate refuses to write.
`migrate.ts` is re-runnable: it never chokes on the data it is
given, and it never silently overwrites hand edits in truth. A
composition failure is a `composition-failed` fault row and a red
gate 9; the entry is dropped, not emitted from source bytes — R3's
target of resilient, always-emitted output is not yet built. Every
run ends in a report a person reads before the output ships —
`data/source/migration-report.json`, rendered as
[docs/v2/migration-blessing.md](../../docs/v2/migration-blessing.md).
The report holds the nine gate tallies, one row per review item,
patch re-judgment or pipeline fault (`{ rid, bucket, kind, severity,
detail }`), a composed count per rule, and an outcome per patch
(`applied`, `superseded`, `upstream-fixed`, `upstream-changed`). A
stale snapshot pin is a count, not a refusal; `bun pipeline:migrate
--strict` refuses on a stale pin or a drifted patch. Last run
2026-09-09 with all nine gates green.

## Stage 3 — Compile (`compile.ts`, not yet built)

Truth → serving artifacts on every deploy: validate (schema, tag
vocabulary, slugs, refs) → transform (abbreviation detection, display
regeneration, link expansion) → emit (entry shards, browse index,
route map, page index, search artifacts, version manifest) → gate
(golden render diffs, coverage reports). Specified in the data
architecture spec §3.
