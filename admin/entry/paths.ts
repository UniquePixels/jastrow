/**
 * The entry contract's boundary, declared once.
 *
 * `admin/entry/` is the contract every file under `data/entries/`
 * meets, however it got there: the import's write, the admin tool's
 * save, or a hand edit. The pipeline's `paths.ts` re-exports
 * `ENTRIES_DIR` rather than spelling it a second time, so the import
 * and the contract cannot disagree about where the entries live.
 */

/** The generated JSON schema (ruling `11-05 schema source`):
 * `schema-build.ts` writes it from `schema.ts` for editors and readers
 * that are not TypeScript. The contract itself validates against
 * `EntrySchema`, not this file. */
export const SCHEMA_PATH = 'data/schema/entry.schema.json';

/** Where entry files live: one `<first letter>/<id>.json` per entry. */
export const ENTRIES_DIR = 'data/entries';
