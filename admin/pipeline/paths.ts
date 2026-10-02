/**
 * The module's boundary, declared once.
 *
 * `admin/pipeline/` is an import module: it reads data, writes data in
 * a schema it does not own, and writes reports about what it did. This
 * file is the only place it names anything outside itself, so it is
 * the only file a different project has to edit to run the same
 * pipeline over its own data.
 *
 * Biome's `noRestrictedImports` (`biome.json`) keeps the module's
 * imports inside `admin/pipeline/` and `admin/entry/`.
 *
 * The three paths the entry contract reads — the entries, the schema
 * and the page index — are declared by `admin/entry/paths.ts` and
 * re-exported here, not re-spelled: `admin/entry/` is the one module
 * this one depends on, and a second literal is how two modules start
 * reading different trees.
 */

// biome-ignore lint/performance/noBarrelFile: three constants the entry contract owns, re-exported so the pipeline names each path once; this file declares its own paths and is not a barrel.
export {
	ENTRIES_DIR,
	PAGE_INDEX_PATH,
	SCHEMA_PATH,
} from '../entry/paths.ts';

// ---------------------------------------------------------------- read

/** The Sefaria export, as fetched. */
export const SOURCE_DIR = 'data/source';

/** The 32,512-entry source JSONL. */
export const SOURCE_PATH = `${SOURCE_DIR}/jastrow-dictionary.jsonl`;

/** The lexicon metadata that travels with it. */
export const LEXICONS_PATH = `${SOURCE_DIR}/lexicons.json`;

/** Provenance about the fetch — dump URL, ETag, Last-Modified, fetch
 * time, sha256 and entry count per output. Not snapshot content, so
 * not hashed into the pin (see `SNAPSHOT_FILES`). */
export const MANIFEST_PATH = `${SOURCE_DIR}/manifest.json`;

/** The two files a patch record pins itself to — exactly what
 * `data:fetch` emits from the Sefaria dump, in fixed (alphabetical)
 * order. `manifest.json` is provenance about the fetch,
 * `edit-replay.jsonl` is admin-tool history (archived 2026-09-22 to
 * `docs/archive/source-reports-2026-09-22/`, not deleted), and
 * `*-report.json` files are pipeline output — none of them are
 * snapshot content, so none of them are hashed. */
export const SNAPSHOT_FILES = [SOURCE_PATH, LEXICONS_PATH] as const;

/** The closed grammar vocabulary census `body/grammar.ts` cites. */
export const BODY_CENSUS_PATH = `${SOURCE_DIR}/body-census-report.json`;

// --------------------------------------------------- read and written

/** Patch records — import definition, not data (spec M9). */
export const PATCH_DIR = 'admin/pipeline/patch/records';

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

/** The machine-readable account of one run. Under `data/source/`
 * because it describes one import of that snapshot, not the
 * dictionary: it is regenerated wholesale every run and nothing
 * downstream may treat it as entry data. */
export const IMPORT_REPORT_PATH = `${SOURCE_DIR}/import-report.json`;

/** Generated markdown a person reads. The module writes it to a path
 * it declares here, in a directory of its own, rather than into
 * whatever doc tree the project happens to keep — a module that
 * scatters its output through the project's documents is not one you
 * can lift out. */
export const REPORTS_DIR = 'docs/reports';

/** The evidence document the maintainer reads and blesses (migrate
 * spec §4.2). `IMPORT_REPORT_PATH` is the machine's account of a
 * run; this is the human-facing one, and the two are generated
 * together so a blessing can never be given against numbers that have
 * moved. */
export const BLESSING_PATH = `${REPORTS_DIR}/import-blessing.md`;

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
 * Deliberately its own literal, not derived from `REPORTS_DIR`: the
 * design is not a generated report and does not move with that
 * group. */
export const DESIGN_PATH = 'admin/pipeline/DESIGN.md';
