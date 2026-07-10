# The Data Pipeline

The auditable, reproducible path from the Sefaria source to the data
the app serves. Read top to bottom, this is how the dictionary is
built from scratch: fetch the source, transform it once into the
truth layer, compile truth into serving artifacts on every deploy
([design spec](../../docs/specs/2026-07-03-v2-overhaul-design.md)).

| Stage | Tool | Status | Runs |
|---|---|---|---|
| Source acquisition | `fetch.ts` | working | on demand, re-runnable |
| Migration (source → truth) | `migrate.ts` | designed, not built | once, then retires |
| Compile (truth → serving) | `compile.ts` | designed, not built | every deploy |

Migration and compile are specified in the
[data architecture spec](../../docs/specs/2026-07-08-v2-data-architecture-design.md)
(§6). One-time examinations of the v1 data — important record, but
**not** steps in this path — live in
[provenance/](provenance/README.md).

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

## Stage 2 — Migration (`migrate.ts`, not yet built)

One-time transform of the source snapshot into the per-entry truth
layer (`data/entries/`), per the
[data architecture spec](../../docs/specs/2026-07-08-v2-data-architecture-design.md)
§6: headword decomposition, link typing, markup translation into the
closed tag vocabulary, refs resolution, slug assignment, and the
print-locator (`page`/`column`) enrichment — prepopulated from the
existing locator data and corrected by the
[preservation obligations](provenance/README.md#preservation-obligations)
the provenance work identified. Gated by blessing checks (golden
render diffs, round-trips, chain agreement); runs once, then retires
into repo history.

## Stage 3 — Compile (`compile.ts`, not yet built)

Truth → serving artifacts on every deploy: validate (schema, tag
vocabulary, slugs, refs) → transform (abbreviation detection, display
regeneration, link expansion) → emit (entry shards, browse index,
route map, page index, search artifacts, version manifest) → gate
(golden render diffs, coverage reports). Specified in the data
architecture spec §3.
