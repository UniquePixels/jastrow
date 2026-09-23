# Entries — the imported dictionary

32,512 JSON files, one per entry, written by `bun data:import`
(`admin/pipeline/migrate.ts`) from `data/source/`. Sharded by first
letter of the rid: `A/A00013.json`.

**Generated, not hand-authored.** A full import rewrites every file. If
you need to change what is here, change the pipeline or add a patch
record (`admin/pipeline/patch/records/`) — a hand edit is overwritten
by the next run, and `migrate/truth.test.ts` validates whatever is
committed either way.

The shape is `data/schema/entry.schema.json`.

## Rights

Derived from `data/source/`. See that directory's README: the 1903
dictionary is public domain, and credit for the digitization is owed
to Sefaria.
