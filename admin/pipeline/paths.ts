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

/** The two files a patch record pins itself to — exactly what
 * `data:fetch` emits from the Sefaria dump, in fixed (alphabetical)
 * order. `manifest.json` is provenance about the fetch,
 * `edit-replay.jsonl` is admin-tool history, and `*-report.json`
 * files are pipeline output — none of them are snapshot content, so
 * none of them are hashed. */
export const SNAPSHOT_FILES = [SOURCE_PATH, LEXICONS_PATH] as const;

/** The closed grammar vocabulary census `body/grammar.ts` cites. */
export const BODY_CENSUS_PATH = `${SOURCE_DIR}/body-census-report.json`;

/** Page and column for every headword, built from the print hOCR: one
 * JSON row per rid, carrying its page, column and confidence. */
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

/** The committed patch corpus (spec §4.4): every ingested tranche's
 * files. Absent files mean an empty corpus.
 *
 * `data/patches/pilot/` was a third source until 2026-09-22. All
 * three of its patches were `superseded` — a transform rule reached
 * the defect first, so the run absorbed them and applied none —
 * leaving it with no record the run applies, and it moved whole to
 * `docs/archive/patches-retired-2026-09-22/pilot/`. */
export const TRANCHES_DIR = `${PATCH_DIR}/tranches`;

/** Human-authored patches (consolidation spec §4.2). Kept out of
 * `TRANCHES` on purpose: consolidation keeps one manifest record per
 * rid, and 11 reviewed rids also have agent records. */
export const REVIEWED_DIR = `${PATCH_DIR}/reviewed`;

/** The catalogue of patch/defect classes — a class the run detects
 * and a class it merely knows about (consolidation spec §3.1.1's
 * "catalogued, not yet detected"), so a review report can list both. */
export const PATTERNS_PATH = `${PATCH_DIR}/patterns.jsonl`;

/** Where the committed snapshot pin lives. One fixed path, not an
 * option: the value every patch record pins itself to has to be the
 * same one for everybody, so `--write` writes here and verification
 * reads here. */
export const LOCK_PATH = `${PATCH_DIR}/snapshot.lock`;

// ------------------------------------------------------------- written

/** Where the import writes truth. */
export const ENTRIES_DIR = 'data/entries';

/** Link targets the run could not resolve. */
export const QUARANTINE_PATH = 'data/quarantine/internal-targets.json';

/** The machine-readable account of one run. Under `data/source/`
 * because it describes one import of that snapshot, not the
 * dictionary: it is regenerated wholesale every run and nothing
 * downstream may treat it as entry data. */
export const MIGRATION_REPORT_PATH = `${SOURCE_DIR}/migration-report.json`;

/** Generated markdown a person reads.
 *
 * Points at the CURRENT location. Task 4 of this plan moves the
 * directory to `docs/reports/` and flips this constant to match. */
export const REPORTS_DIR = 'docs/v2';

/** The evidence document the maintainer reads and blesses (migrate
 * spec §4.2). `MIGRATION_REPORT_PATH` is the machine's account of a
 * run; this is the human-facing one, and the two are generated
 * together so a blessing can never be given against numbers that have
 * moved. */
export const BLESSING_PATH = `${REPORTS_DIR}/migration-blessing.md`;

/** Every review and patch row of a run, split by whether it blocks v2
 * publication (consolidation spec §3.1.1). The document is committed,
 * so the `blocks` count moves as a reviewable diff rather than only
 * as console output of a run nobody kept. */
export const REVIEW_REPORT_PATH = `${REPORTS_DIR}/review-report.md`;
export const HEADWORD_ISSUES_DOC = `${REPORTS_DIR}/headword-issues.md`;
export const HEADWORD_ISSUES_CSV = `${REPORTS_DIR}/headword-issues.csv`;

/** Where the pipeline's own design is written down, cited by the
 * headword report so a reader can reach the rules behind a row.
 *
 * Points at the CURRENT location. Task 6 of this plan moves the file
 * to `admin/pipeline/DESIGN.md` and flips this constant to match. */
export const DESIGN_PATH = `${REPORTS_DIR}/headword-design.md`;
