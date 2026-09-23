# Entries — the imported dictionary

32,512 JSON files, one per entry, written by the first `bun
data:import` (`admin/pipeline/migrate.ts`) from `data/source/`.
Sharded by first letter of the rid: `A/A00013.json`.

**Generated once, then it is the edited layer.** After that first
write, `data/entries/` is what people and the admin tool edit — hand
edits are not re-recorded as pipeline inputs (ruling R2,
`docs/decisions.md`). `--write` refuses outright on a populated tree;
a run never silently overwrites edited truth (ruling R1). A hand edit
is meant to survive a later rebuild through the update run's per-entry
three-way merge (design spec §3.2), not by being turned into a patch
record. `migrate/truth.test.ts` validates whatever is committed,
either way.

The shape is `data/schema/entry.schema.json`.

## Rights

Derived from `data/source/`. See that directory's README: the 1903
dictionary is public domain, and credit for the digitization is owed
to Sefaria.
