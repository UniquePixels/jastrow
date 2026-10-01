/**
 * The entry contract's boundary, declared once.
 *
 * `admin/entry/` is the contract every file under `data/entries/`
 * meets, however it got there: the import's write, the admin tool's
 * save, or a hand edit. These three paths are everything it reads.
 * The pipeline's `paths.ts` re-exports them rather than spelling them
 * a second time, so the import and the contract cannot disagree about
 * where the entries, the schema or the page index live.
 *
 * The pipeline's `boundary.test.ts` fails if a path literal for
 * `data/`, `docs/` or `app/` appears anywhere else in non-test
 * contract code.
 */

/** The entry schema. Read at run time, not imported: a JSON Schema is
 * the language-neutral half of the contract, which a consumer that is
 * not TypeScript can read too. */
export const SCHEMA_PATH = 'data/schema/entry.schema.json';

/** Where entry files live: one `<first letter>/<id>.json` per entry. */
export const ENTRIES_DIR = 'data/entries';

/** Page and column for every headword, built from the print hOCR: one
 * JSON row per rid, carrying its page, column and confidence. An
 * entry's `page` must agree with its row, both ways. */
export const PAGE_INDEX_PATH = 'data/page-index/entries.jsonl';
