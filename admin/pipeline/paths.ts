// biome-ignore-all lint/style/useExportsLast: constants are grouped by section (read / read and written / written), each exported where it is documented.
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
 * The path the entry contract reads — the entries — is declared by
 * `admin/entry/paths.ts` and re-exported here, not re-spelled: `admin/entry/` is the one module
 * this one depends on, and a second literal is how two modules start
 * reading different trees.
 */

// biome-ignore lint/performance/noBarrelFile: the one path the entry contract owns, re-exported so the pipeline names it once; this file declares its own paths and is not a barrel.
export { ENTRIES_DIR } from '../entry/paths.ts';

// ---------------------------------------------------------------- read

/** The Sefaria export, as fetched. */
export const SOURCE_DIR = 'data/sources/sefaria';

/** The 32,512-entry source JSONL. */
export const SOURCE_PATH = `${SOURCE_DIR}/jastrow-dictionary.jsonl`;

/** The lexicon metadata that travels with it. */
export const LEXICONS_PATH = `${SOURCE_DIR}/lexicons.json`;

/** Provenance about the fetch — dump URL, ETag, Last-Modified, fetch
 * time, sha256 and entry count per output. */
export const MANIFEST_PATH = `${SOURCE_DIR}/manifest.json`;

// --------------------------------------------------- read and written

/** Patch records — import definition, not data (spec M9). */
const PATCH_DIR = 'admin/pipeline/patch/records';

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

/** The cite-numeral allowlist (`import/cite-numeral.ts`, gate 13):
 * cites whose homograph numeral the target does not carry, kept as
 * printed or pending a print read; README beside it. */
export const CITE_NUMERAL_KEPT_PATH = `${PATCH_DIR}/cite-numeral-kept/kept.jsonl`;

/** Report definition, not data: inputs a generated report reads
 * besides the run itself. */
const REPORT_RECORDS_DIR = 'admin/pipeline/report/records';

/** The reviewed-kept list (`report/reviewed-kept.ts`, decisions 10-06
 * reviewed kept): headword-issues rows a person read against the print
 * and found right as stored. */
export const REVIEWED_KEPT_PATH = `${REPORT_RECORDS_DIR}/reviewed-kept.jsonl`;

// ------------------------------------------------------------- written

/** The machine-readable account of one run. Under `data/sources/sefaria/`
 * because it describes one import of that snapshot, not the
 * dictionary: it is regenerated wholesale every run and nothing
 * downstream may treat it as entry data. */
export const IMPORT_REPORT_PATH = `${SOURCE_DIR}/import-report.json`;

/** Generated markdown a person reads. The module writes it to a path
 * it declares here, in a directory of its own, rather than into
 * whatever doc tree the project happens to keep — a module that
 * scatters its output through the project's documents is not one you
 * can lift out. */
const REPORTS_DIR = 'docs/reports';

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

/** The Sefaria appendix (`report/sefaria-report.ts`, decisions 10-16
 * upstream report): the rows we send upstream, a summary, and every
 * reviewed patch a filter kept out, with its reason. Written by
 * `bun data:sefaria`, not by the import. */
export const SEFARIA_APPENDIX_CSV = `${REPORTS_DIR}/sefaria-appendix.csv`;
export const SEFARIA_APPENDIX_DOC = `${REPORTS_DIR}/sefaria-appendix.md`;
export const SEFARIA_REVIEW_CSV = `${REPORTS_DIR}/sefaria-review.csv`;

/** The submission log the appendix reads: one line per batch the
 * maintainer sent to Sefaria. Hand-maintained, so it is a document
 * beside the prose report, not a generated one. */
export const SEFARIA_SUBMISSIONS_PATH = 'docs/sefaria-submissions.jsonl';

/** The page index (ruling `11-05 page index`): one row per printed
 * block, its page, column and the first and last rid that begin in it.
 * An import input; after the import an entry file's `page` is the
 * record. */
export const PAGE_INDEX_PATH = 'data/sources/page-index/columns.jsonl';

/** Where the pipeline's own design is written down, cited by the
 * headword report so a reader can reach the rules behind a row.
 *
 * Deliberately its own literal, not derived from `REPORTS_DIR`: the
 * design is not a generated report and does not move with that
 * group. */
export const DESIGN_PATH = 'admin/pipeline/DESIGN.md';
