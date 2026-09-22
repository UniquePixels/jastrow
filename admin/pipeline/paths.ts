/**
 * The module's boundary, declared once.
 *
 * `admin/pipeline/` is an import module: it reads data, writes data in
 * a schema it does not own, and writes reports about what it did. This
 * file is the only place it names anything outside itself, so it is
 * the only file a different project has to edit to run the same
 * pipeline over its own data.
 *
 * `boundary.test.ts` fails if a path literal for `data/`, `docs/` or
 * `app/` appears anywhere else in non-test module code.
 *
 * Two names here are load-bearing beyond their value.  `SOURCE_PATH`
 * and `SNAPSHOT_FILES` are matched by IDENTIFIER in
 * `test-tiers.test.ts`'s `CORPUS_SIGNALS`, which is how the tier split
 * spots a test that reaches the 41 MB snapshot from the fast tier.
 * Renaming either one disables that detection without failing
 * anything — so they do not get renamed.
 */

// ---------------------------------------------------------------- read

/** The Sefaria export, as fetched. */
export const SOURCE_DIR = 'data/source';

/** The 32,512-entry source JSONL. */
export const SOURCE_PATH = `${SOURCE_DIR}/jastrow-dictionary.jsonl`;

/** The lexicon metadata that travels with it. */
export const LEXICONS_PATH = `${SOURCE_DIR}/lexicons.json`;

/** The two files a patch record pins itself to. */
export const SNAPSHOT_FILES = [SOURCE_PATH, LEXICONS_PATH] as const;

/** The closed grammar vocabulary census `body/grammar.ts` cites. */
export const BODY_CENSUS_PATH = `${SOURCE_DIR}/body-census-report.json`;

/** Page and column for every headword, built from the print hOCR. */
export const PAGE_INDEX_PATH = 'data/page-index/entries.jsonl';

/** The entry contract. Read at run time, not imported: the module does
 * not own the schema, it is handed one (spec §4.1). */
export const SCHEMA_PATH = 'data/schema/entry.schema.json';

// --------------------------------------------------- read and written

/** Patch records — import definition, not data (spec M9).
 *
 * Points at the CURRENT location. Task 3 of this plan moves the
 * directory to `admin/pipeline/patch/records/` and flips this
 * constant to match — declaring the post-move path here now would
 * make this task's own import apply zero patches. */
export const PATCH_DIR = 'data/patches';
export const TRANCHES_DIR = `${PATCH_DIR}/tranches`;
export const REVIEWED_DIR = `${PATCH_DIR}/reviewed`;
export const PATTERNS_PATH = `${PATCH_DIR}/patterns.jsonl`;
export const LOCK_PATH = `${PATCH_DIR}/snapshot.lock`;

// ------------------------------------------------------------- written

/** Where the import writes truth. */
export const ENTRIES_DIR = 'data/entries';

/** Link targets the run could not resolve. */
export const QUARANTINE_PATH = 'data/quarantine/internal-targets.json';

/** The machine-readable account of one run. */
export const MIGRATION_REPORT_PATH = `${SOURCE_DIR}/migration-report.json`;

/** Generated markdown a person reads.
 *
 * Points at the CURRENT location. Task 4 of this plan moves the
 * directory to `docs/reports/` and flips this constant to match. */
export const REPORTS_DIR = 'docs/v2';
export const BLESSING_PATH = `${REPORTS_DIR}/migration-blessing.md`;
export const REVIEW_REPORT_PATH = `${REPORTS_DIR}/review-report.md`;
export const HEADWORD_ISSUES_DOC = `${REPORTS_DIR}/headword-issues.md`;
export const HEADWORD_ISSUES_CSV = `${REPORTS_DIR}/headword-issues.csv`;

/** Where the pipeline's own design is written down, cited by the
 * headword report so a reader can reach the rules behind a row.
 *
 * Points at the CURRENT location. Task 6 of this plan moves the file
 * to `admin/pipeline/DESIGN.md` and flips this constant to match. */
export const DESIGN_PATH = `${REPORTS_DIR}/headword-design.md`;
