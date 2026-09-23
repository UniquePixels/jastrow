# Source — the Sefaria export

The Jastrow lexicon as exported from Sefaria's MongoDB
(`lexicon_entry`, `parent_lexicon: "Jastrow Dictionary"`), snapshot
2026-07-04, 32,512 entries. Fetched by `bun data:fetch`
(`admin/pipeline/fetch.ts`) from Sefaria's public dump.

## Rights and attribution

Marcus Jastrow's *Dictionary of the Targumim…* (London: Luzac, 1903)
is out of copyright. Sefaria declares the same 1903 edition public
domain: `GET /api/texts/versions/Jastrow` returns
`"license": "Public Domain"` with `"digitizedBySefaria": true`.

The `lexicon_entry` collection this project reads carries no licence
field of its own — see `lexicons.json`, which has `attribution`,
`source` and `version_title` and no rights key. Same 1903
digitization, a different collection.

**Credit is owed to Sefaria for the digitization**, whether or not a
licence compels it.

## What is Sefaria's, and what is this pipeline's

| File | Whose |
|---|---|
| `jastrow-dictionary.jsonl` | Sefaria's export, unmodified |
| `lexicons.json` | Sefaria's lexicon metadata, unmodified |
| `manifest.json` | this pipeline's record of the fetch |
| `migration-report.json` | this pipeline's account of the last import |
| `body-census-report.json` | this pipeline's census of the grammar vocabulary |

The two Sefaria files are the snapshot every patch record pins itself
to (`admin/pipeline/patch/records/snapshot.lock`). Nothing else here is
hashed, because nothing else is source.
