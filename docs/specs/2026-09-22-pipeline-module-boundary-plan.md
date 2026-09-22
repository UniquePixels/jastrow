# Pipeline Module Boundary — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers-extended-cc:subagent-driven-development (recommended) or
> superpowers-extended-cc:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `admin/pipeline/` a self-contained import module with a
declared boundary, and reduce the repo's live documentation to the six
files that describe only that module and its data.

**Architecture:** One new file, `admin/pipeline/paths.ts`, becomes the
only place the module names anything outside itself. Two new unit tests
make the boundary a thing `bun qa` fails on rather than a thing a
document claims. The schema and the patch records swap sides —
schema out of the module into `data/`, patch records out of `data/`
into the module — which makes the licence rule one sentence with no
exception. Nineteen dated specs collapse into one present-tense
`DESIGN.md` and move to the archive.

**Tech Stack:** Bun 1.3.14, TypeScript, Biome 2.5.2, Ajv 8.

**Spec:** [`docs/specs/2026-09-22-pipeline-module-boundary-design.md`](2026-09-22-pipeline-module-boundary-design.md)

**Plan location note:** the writing-plans default is
`docs/superpowers/plans/`. That directory is deleted by Task 10 of this
very plan (spec §4.4), so the plan sits beside its spec instead and
archives with it in Task 10.

## Global Constraints

- **`bun qa` is green at the end of every task.** That is
  `biome format --write`, `biome check --error-on-warnings`, the unit
  test tier, and `tsc --noEmit`. Use the scripts, never the bare tool —
  CI's Lint job runs `bun qa:ci`, which disagrees with plain
  `biome check .`.
- **No entry content changes.** Tasks 1–4 must leave `data/entries/`
  byte-identical. The check is stated per task.
- **Every commit is signed off** (`git commit -s`) and follows
  `<emoji> <type>(<scope>): <description>`, 50 characters max,
  imperative, lowercase. Types: 🦄 `new` / 🌈 `improve` / 🦠 `fix` /
  🧺 `chore` / 🚀 `release` / 📖 `doc` / 🚦 `ci`.
- **Commits end with** `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- **Moving code moves bytes.** Use `git mv` and `sed`; never retype a
  file. A retype silently decodes `\u` escapes that a test-call checker
  cannot see.
- **After any `migrate --write` run, run `bun qa:format`** or 2,785
  truth files read as spurious diffs.
- **Branch:** `chore/pipeline-module-boundary`, already created off
  `9ec15d66a`. Never commit to `main` or `v2` directly.
- **Registering, reclassifying or reordering a transform rule is out of
  scope.** No task here touches `transform/registry.ts` ordering, so
  `bun run transform:invariants` is not required.

**User decisions (already made):** the twelve rulings M1–M12 in spec
§3. In particular: `admin/pipeline/` keeps its path (M2); the schema
lives in `data/schema/` and is public domain (M3, M10); the patch
records are import definition and move into the module (M9); the
licence rule is "everything under `data/` is public domain, everything
else is MIT" (M4); `data/source/` is public domain (M11);
`edit-replay.jsonl` is archived (M12).

---

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `admin/pipeline/paths.ts` | **new.** The only place the module names the world outside itself | 1 |
| `admin/pipeline/boundary.test.ts` | **new.** Asserts no import and no path literal leaves the module | 1 |
| `data/schema/entry.schema.json` | moved. The contract, public domain | 2 |
| `admin/pipeline/schema.test.ts` | moved. The contract's test, MIT | 2 |
| `admin/pipeline/patch/records/` | moved. 29 patch files | 3 |
| `docs/reports/` | **new.** Where generated markdown lands | 4 |
| `data/*/README.md` | **new ×4, amended ×1.** Provenance per directory | 5 |
| `admin/pipeline/data-layout.test.ts` | **new.** Asserts the licence rule mechanically | 5 |
| `admin/pipeline/DESIGN.md` | **new.** Present-tense design, replacing 19 dated specs | 6 |
| `admin/pipeline/README.md` | rewritten for the new paths | 7 |
| `docs/decisions.md` | pruned to rulings still binding | 8 |
| `docs/ideas.md` | **new.** The reminder list | 9 |
| `README.md` | rewritten: what the repo is, the licence rule | 10 |

---

### Task 1: The declared boundary

**Goal:** `admin/pipeline/paths.ts` holds every path the module names
outside itself, and two tests fail if that stops being true.

**Files:**
- Create: `admin/pipeline/paths.ts`
- Create: `admin/pipeline/boundary.test.ts`
- Modify: the 14 non-test files listed in Step 3
- Modify: `admin/pipeline/test-tiers.test.ts:70-76` (CORPUS_SIGNALS — see the trap below)

**Acceptance Criteria:**
- [ ] `paths.ts` exports every one of the 21 path literals found in non-test module code
- [ ] `SOURCE_PATH` and `SNAPSHOT_FILES` keep **those exact identifier names**
- [ ] `test-tiers.test.ts` still detects a corpus-reaching unit-tier file — proved with a positive control, not assumed
- [ ] `boundary.test.ts` fails if an import leaves the module, and fails if a `data/`, `docs/` or `app/` literal appears outside `paths.ts` in non-test code
- [ ] `data/entries/` byte-identical after a full import

**Verify:** `bun qa` → green; then
`bun data:import && git status --short data/entries` → no output.

**Steps:**

- [ ] **Step 1: Read the trap before writing anything**

`test-tiers.test.ts:70-76` detects corpus-reaching tests by matching
**identifier names** in file text:

```ts
const CORPUS_SIGNALS: ReadonlyArray<readonly [string, RegExp]> = [
	['imports corpus-fixture', /from\s+'[^']*corpus-fixture\.ts'/u],
	['calls readSourceEntries()', /\breadSourceEntries\(\s*\)/u],
	['names SOURCE_PATH', /\bSOURCE_PATH\b/u],
	['calls computeSnapshot()', /\bcomputeSnapshot\(\s*\)/u],
	['names SNAPSHOT_FILES', /\bSNAPSHOT_FILES\b/u],
];
```

If `SOURCE_PATH` becomes `PATHS.source.dictionary`, those two regexes
stop matching and the tier checker silently stops detecting the thing
it exists to detect. The fourth signal was added on 2026-09-21 only
after exactly this kind of blind spot let `patch/snapshot.test.ts` hash
a 41 MB file from the unit tier for four calls.

**Therefore: `paths.ts` exports flat named constants, and
`SOURCE_PATH` and `SNAPSHOT_FILES` keep their names.** No `PATHS`
object namespace.

- [ ] **Step 2: Write `admin/pipeline/paths.ts`**

```ts
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

/** Patch records — import definition, not data (spec M9). */
export const PATCH_DIR = 'admin/pipeline/patch/records';
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

/** Generated markdown a person reads. */
export const REPORTS_DIR = 'docs/reports';
export const BLESSING_PATH = `${REPORTS_DIR}/migration-blessing.md`;
export const REVIEW_REPORT_PATH = `${REPORTS_DIR}/review-report.md`;
export const HEADWORD_ISSUES_DOC = `${REPORTS_DIR}/headword-issues.md`;
export const HEADWORD_ISSUES_CSV = `${REPORTS_DIR}/headword-issues.csv`;

/** Where the pipeline's own design is written down, cited by the
 * headword report so a reader can reach the rules behind a row. */
export const DESIGN_PATH = 'admin/pipeline/DESIGN.md';
```

Note `PATCH_DIR`, `REPORTS_DIR` and `DESIGN_PATH` point at their
**post-move** locations. Tasks 3, 4 and 6 do the moves. Until then
those three constants are declared and unused, which Biome permits for
exports.

- [ ] **Step 3: Replace the 21 literals, file by file**

Each is a `const` declaration today. Replace the literal with an import
from `paths.ts` and delete the local `const`, keeping the docstring
where it explains something `paths.ts` does not.

| File | Line | Literal | Replace with |
|---|---|---|---|
| `body/source.ts` | 13 | `data/source/jastrow-dictionary.jsonl` | `SOURCE_PATH` (re-export, keep the local name) |
| `fetch.ts` | 23 | `data/source` | `SOURCE_DIR` |
| `migrate.ts` | 82 | `data/entries` | `ENTRIES_DIR` |
| `migrate/cite.ts` | 20 | `data/quarantine/internal-targets.json` | `QUARANTINE_PATH` |
| `migrate/page.ts` | 5 | `data/page-index/entries.jsonl` | `PAGE_INDEX_PATH` |
| `migrate/report.ts` | 13 | `data/source/migration-report.json` | `MIGRATION_REPORT_PATH` |
| `migrate/report.ts` | 19 | `docs/v2/migration-blessing.md` | `BLESSING_PATH` (Task 4 moves the file) |
| `migrate/review-report.ts` | 14 | `docs/v2/review-report.md` | `REVIEW_REPORT_PATH` |
| `migrate/review-report.ts` | 19 | `data/patches/patterns.jsonl` | `PATTERNS_PATH` (Task 3 moves the file) |
| `migrate/validate.ts` | 18 | `data/entries` | `ENTRIES_DIR` |
| `patch/apply.ts` | 57 | `data/patches/tranches` | `TRANCHES_DIR` |
| `patch/apply.ts` | 62 | `data/patches/reviewed` | `REVIEWED_DIR` |
| `patch/snapshot.ts` | 33-34 | the two snapshot files | `SNAPSHOT_FILES` (re-export, keep the local name) |
| `patch/snapshot.ts` | 42 | `data/patches/snapshot.lock` | `LOCK_PATH` |
| `report/headword-issues.ts` | 27-31 | five literals | `ENTRIES_DIR`, `MIGRATION_REPORT_PATH`, `HEADWORD_ISSUES_DOC`, `HEADWORD_ISSUES_CSV`, `DESIGN_PATH` |
| `transform/count.ts` | 47 | `data/patches/patterns.jsonl` | `PATTERNS_PATH` |
| `body/grammar.ts` | 18 | (docstring only) | leave; `grammar.test.ts:58` keeps its literal, tests are exempt |

For `body/source.ts` and `patch/snapshot.ts`, keep the local
identifiers so `test-tiers.test.ts` keeps matching:

```ts
import { SOURCE_PATH } from '../paths.ts';
```

The name `SOURCE_PATH` is then still present in the file text, and
still present in any test that names it.

- [ ] **Step 4: Prove the tier checker still fires (positive control)**

A signal that cannot fire reports a clean nothing. Before trusting the
green run, confirm the detector still works:

```bash
cat > /tmp/probe.test.ts <<'EOF'
import { SOURCE_PATH } from '../paths.ts';
it('probe', () => { expect(SOURCE_PATH).toBeTruthy(); });
EOF
cp /tmp/probe.test.ts admin/pipeline/migrate/probe.test.ts
bun qa:test 2>&1 | grep -i 'probe\|tier'
```

Expected: `test-tiers.test.ts` FAILS, naming `migrate/probe.test.ts`
as a unit-tier file carrying the signal `names SOURCE_PATH`.

Then remove it:

```bash
rm admin/pipeline/migrate/probe.test.ts
```

If the probe does **not** fail the tier check, `paths.ts` has broken
the detection — stop and fix the names before continuing.

- [ ] **Step 5: Write `admin/pipeline/boundary.test.ts`**

```ts
/**
 * The module boundary, asserted rather than trusted.
 *
 * `admin/pipeline/` is an import module. Two things make that true
 * rather than aspirational, and both are checked here.
 *
 * FIRST: nothing it imports resolves outside it. A module that reaches
 * up into the project for code is not one you can lift out.
 *
 * SECOND: no path literal for `data/`, `docs/` or `app/` appears in
 * non-test module code outside `paths.ts`. This is the check that
 * keeps `paths.ts` honest: a second spelling of `data/entries` is how
 * the boundary quietly stops being one place.
 *
 * Test files are exempt from the second check. A test may name a path
 * as a FIXTURE — `patch/snapshot.test.ts` names
 * `data/source/new-file.json`, which has never existed — and forcing
 * those through `paths.ts` would make the constant list a record of
 * fictions.
 */
import { describe, expect, it } from 'bun:test';

const MODULE_DIR = 'admin/pipeline';
const PATHS_FILE = `${MODULE_DIR}/paths.ts`;

/** A relative import climbing above the module root. */
const ESCAPES = /from\s+'((?:\.\.\/)+)([^']*)'/gu;

/** A repo-root path literal: `data/…`, `docs/…` or `app/…`. */
const ROOT_PATH = /'(?:data|docs|app)\/[A-Za-z0-9._/-]*'/u;

async function moduleFiles(suffix: string): Promise<string[]> {
	const out: string[] = [];
	for await (const p of new Bun.Glob('**/*.ts').scan({
		cwd: MODULE_DIR,
		onlyFiles: true,
	})) {
		if (p.endsWith(suffix)) {
			out.push(`${MODULE_DIR}/${p}`);
		}
	}
	return out.sort();
}

describe('the module imports nothing above itself', () => {
	it('every relative import stays inside admin/pipeline/', async () => {
		const offenders: string[] = [];
		for (const file of await moduleFiles('.ts')) {
			// Depth of this file below the module root.
			const depth = file.slice(MODULE_DIR.length + 1).split('/').length - 1;
			const text = await Bun.file(file).text();
			for (const m of text.matchAll(ESCAPES)) {
				if ((m[1]?.length ?? 0) / 3 > depth) {
					offenders.push(`${file}: ${m[0]}`);
				}
			}
		}
		expect(offenders).toEqual([]);
	});
});

describe('the boundary is declared in one place', () => {
	it('no non-test file outside paths.ts names a repo-root path', async () => {
		const offenders: string[] = [];
		for (const file of await moduleFiles('.ts')) {
			if (file === PATHS_FILE || file.includes('.test.ts')) {
				continue;
			}
			const text = await Bun.file(file).text();
			for (const line of text.split('\n')) {
				// Docstrings may name a path to explain one; code may not.
				if (!line.trimStart().startsWith('*') && ROOT_PATH.test(line)) {
					offenders.push(`${file}: ${line.trim()}`);
				}
			}
		}
		expect(offenders).toEqual([]);
	});

	it('paths.ts itself still declares some', async () => {
		// A positive control. Without it, a glob that silently stopped
		// matching would report a clean nothing.
		const text = await Bun.file(PATHS_FILE).text();
		expect(ROOT_PATH.test(text)).toBe(true);
	});
});
```

- [ ] **Step 6: Run the tests, watch the second one fail, then fix**

```bash
bun qa:test 2>&1 | tail -30
```

Expected on first run before Step 3 is complete: the second test lists
every file still holding a literal. Work the list to empty.

- [ ] **Step 7: Full gate and byte-identity check**

```bash
bun qa
bun data:import
bun qa:format
git status --short data/entries
```

Expected: `bun qa` green; `git status --short data/entries` prints
nothing. Any diff under `data/entries/` means a path now resolves
somewhere else — stop and find it.

- [ ] **Step 8: Commit**

```bash
git add admin/pipeline/paths.ts admin/pipeline/boundary.test.ts admin/pipeline
git commit -s -m "🦄 new(pipeline): declare the module boundary

Twenty-one path literals across fourteen files become one
declaration. paths.ts is what a different project edits to run
this pipeline over its own data, and boundary.test.ts fails if a
second spelling appears or an import climbs above the module.

SOURCE_PATH and SNAPSHOT_FILES keep their names on purpose:
test-tiers.test.ts matches them by identifier, so a rename would
disable corpus detection without failing anything.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: The schema moves to `data/`

**Goal:** `entry.schema.json` lives in `data/schema/` and is read at run
time through `paths.ts`; its test lives with the code.

**Files:**
- Move: `admin/pipeline/schema/entry.schema.json` → `data/schema/entry.schema.json`
- Move: `admin/pipeline/schema/entry.schema.test.ts` → `admin/pipeline/schema.test.ts`
- Modify: `admin/pipeline/migrate.ts:78`, `admin/pipeline/migrate/validate.ts:11`
- Modify: `admin/pipeline/transform/rules/plural-capture.test.ts:36` (names the old path)

**Acceptance Criteria:**
- [ ] `admin/pipeline/schema/` no longer exists
- [ ] Neither load site uses `import … with { type: 'json' }`
- [ ] `boundary.test.ts` still passes — the schema arrives through `paths.ts`
- [ ] `data/entries/` byte-identical after a full import

**Verify:** `bun qa` → green; `bun data:import && git status --short data/entries` → no output.

**Steps:**

- [ ] **Step 1: Move the bytes**

```bash
mkdir -p data/schema
git mv admin/pipeline/schema/entry.schema.json data/schema/entry.schema.json
git mv admin/pipeline/schema/entry.schema.test.ts admin/pipeline/schema.test.ts
rmdir admin/pipeline/schema
```

- [ ] **Step 2: Convert `migrate/validate.ts` to a runtime read**

It currently does, at module scope:

```ts
import entrySchema from '../schema/entry.schema.json' with { type: 'json' };
// …
const validateEntry = new Ajv2020({ allErrors: true, strict: true })
	.compile<TruthEntry>(entrySchema);
```

Replace with a memoised lazy load, so no module-level `await` spreads
async loading to every importer:

```ts
import { SCHEMA_PATH } from '../paths.ts';

/** Ajv, compiled once against the schema `paths.ts` names.
 *
 * A runtime read rather than a compile-time import: the module does
 * not own the entry contract, it is handed one, and a different
 * project points `paths.ts` at theirs. The cost is that TypeScript no
 * longer checks the schema literal at build — `schema.test.ts` and
 * Ajv's own `strict: true` carry that instead. */
let compiled: ValidateFunction<TruthEntry> | undefined;

async function entryValidator(): Promise<ValidateFunction<TruthEntry>> {
	compiled ??= new Ajv2020({ allErrors: true, strict: true }).compile<TruthEntry>(
		await Bun.file(SCHEMA_PATH).json(),
	);
	return compiled;
}
```

Import the type: `import type { ValidateFunction } from 'ajv';`

Then make each call site `await entryValidator()` instead of naming
`validateEntry`. Find them:

```bash
grep -n 'validateEntry' admin/pipeline/migrate/validate.ts
```

Every enclosing function that gains an `await` becomes `async`; follow
the chain up until `tsc` is quiet.

- [ ] **Step 3: Do the same in `migrate.ts:78`**

Same pattern. If `migrate.ts` already runs inside an async entry point
(it does — the import is a long async run), a direct
`await Bun.file(SCHEMA_PATH).json()` inside that function is simpler
than a memo; use whichever `tsc` accepts with fewer signature changes,
and say which in the commit body.

- [ ] **Step 4: Fix the path named in a test**

`transform/rules/plural-capture.test.ts:36` contains the string
`'admin/pipeline/schema/entry.schema.json'` inside a comment or
assertion. Update it to `data/schema/entry.schema.json`:

```bash
grep -rn 'admin/pipeline/schema' admin/pipeline docs/*.md README.md
sed -i '' 's|admin/pipeline/schema/entry.schema.json|data/schema/entry.schema.json|g' \
  admin/pipeline/transform/rules/plural-capture.test.ts
```

Then re-run that grep and fix any remaining hit by hand — `docs/` hits
are handled in Tasks 6–10, but note them.

- [ ] **Step 5: Gate and byte-identity**

```bash
bun qa
bun data:import && bun qa:format && git status --short data/entries
```

Expected: green, and no output from the last command.

- [ ] **Step 6: Commit**

```bash
git commit -s -am "🌈 improve(schema): read the contract from data/

The schema describes the entries, so it lives with them; and the
module does not own it, so it is read through paths.ts at run
rather than imported at compile. A different project points
paths.ts at its own contract and nothing else changes.

Its test stays with the code as MIT. data/ is then uniformly
public domain with no carve-out.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Patch records move into the module

**Goal:** the 29 patch files live at `admin/pipeline/patch/records/`;
`data/patches/` no longer exists.

**Files:**
- Move: `data/patches/` → `admin/pipeline/patch/records/`
- Modify: test files naming the old path (listed in Step 2)

**Acceptance Criteria:**
- [ ] `data/patches/` no longer exists
- [ ] `bun data:import` reports the same patch corpus counts as before the move — 114 reviewed, 113 accepted, 232 applied, 5 carried
- [ ] `data/entries/` byte-identical after a full import
- [ ] The snapshot lock still verifies — no "pinned to a different snapshot" rows

**Verify:** `bun qa` → green; `bun data:import` → the blessing's patch
line reads `114 reviewed, 113 accepted, 232 applied, 0 carry-over
absorbed, 5 carried, 0 consolidated away`.

**Steps:**

- [ ] **Step 1: Capture the before-state so the counts can be compared**

```bash
grep -n 'Patch corpus:' docs/v2/migration-blessing.md
```

Record the line. It is the acceptance criterion.

- [ ] **Step 2: Move the bytes**

```bash
mkdir -p admin/pipeline/patch/records
git mv data/patches/patterns.jsonl   admin/pipeline/patch/records/
git mv data/patches/snapshot.lock    admin/pipeline/patch/records/
git mv data/patches/reviewed         admin/pipeline/patch/records/
git mv data/patches/tranches         admin/pipeline/patch/records/
rm -f data/patches/.DS_Store
rmdir data/patches
```

- [ ] **Step 3: Update the tests that name the old path**

`paths.ts` already points at the new location (Task 1), so no non-test
code changes. Five test files hold the literal:

```bash
grep -rln 'data/patches' admin/pipeline --include='*.test.ts'
```

Expected: `patch/patterns.test.ts`, `transform/registry.test.ts`,
`transform/registry.order.test.ts`, `transform/rules/sense-marker.test.ts`,
`transform/commutation.corpus.test.ts`.

```bash
grep -rl 'data/patches' admin/pipeline --include='*.test.ts' | \
  xargs sed -i '' 's|data/patches|admin/pipeline/patch/records|g'
```

Prefer importing `PATTERNS_PATH` from `paths.ts` where the test is
reading the real file rather than a fixture — check each of the five by
hand after the sed.

- [ ] **Step 4: Sweep the docstrings**

`patch/apply.ts:52` names `data/patches/pilot/` in a docstring
explaining a directory that moved to the archive in September. Update
the path, keep the explanation:

```bash
grep -rn 'data/patches' admin/pipeline --include='*.ts' | grep -v '\.test\.ts'
```

Every hit is a docstring; `boundary.test.ts` permits those (lines
starting `*`), but leaving a stale path is the thing this whole plan is
against.

- [ ] **Step 5: Gate, counts and byte-identity**

```bash
bun qa
bun data:import && bun qa:format
git status --short data/entries
grep -n 'Patch corpus:' docs/v2/migration-blessing.md
```

Expected: green; no output from `git status`; the patch corpus line
matches Step 1 exactly. A changed count means a records directory is
not being found — the run would report fewer applied patches, not fail.

- [ ] **Step 6: Commit**

```bash
git commit -s -am "🧺 chore(patch): records are import definition

The patch corpus exists only to turn raw source into entries —
the same category as the 81 transform rules, not dictionary data.
It moves into the module and data/ loses its last MIT tree.

Counts unchanged: 114 reviewed, 113 accepted, 232 applied.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Generated reports leave `docs/v2/`

**Goal:** the module writes its four generated documents to
`docs/reports/`, and stops reading `docs/v2/`.

**Files:**
- Move: 4 files from `docs/v2/` → `docs/reports/`
- Modify: `admin/pipeline/report/headword-issues.ts:31` (the `DESIGN_PATH` reference)

**Acceptance Criteria:**
- [ ] `bun data:import` writes `docs/reports/migration-blessing.md` and `docs/reports/review-report.md`
- [ ] `bun run headword:issues` writes `docs/reports/headword-issues.{md,csv}`
- [ ] Nothing under `admin/pipeline/` names `docs/v2`
- [ ] The regenerated documents differ from the moved ones only in internal links

**Verify:** `bun data:import && bun run headword:issues && git status --short docs/` → shows only `docs/reports/` entries.

**Steps:**

- [ ] **Step 1: Move the four generated files**

```bash
mkdir -p docs/reports
git mv docs/v2/migration-blessing.md docs/reports/
git mv docs/v2/review-report.md      docs/reports/
git mv docs/v2/headword-issues.md    docs/reports/
git mv docs/v2/headword-issues.csv   docs/reports/
```

- [ ] **Step 2: Point the design reference at its new home**

`report/headword-issues.ts` writes a link to the headword design doc.
Task 1 already made that `DESIGN_PATH = 'admin/pipeline/DESIGN.md'`,
which Task 6 creates. Until then the link points at a file that does
not exist yet — acceptable within this plan's ordering, and Task 6's
verification includes regenerating the report so the link resolves.

Confirm nothing else reaches into `docs/v2`:

```bash
grep -rn 'docs/v2' admin/pipeline
```

Expected: no output.

- [ ] **Step 3: Regenerate and inspect the diff**

```bash
bun data:import && bun qa:format
bun run headword:issues
git diff --stat docs/reports/
```

Expected: the diff is confined to relative links inside the documents
(they moved one directory sideways, so `../specs/…` references shift).
A content diff in the counts means something else changed — stop.

- [ ] **Step 4: Gate and commit**

```bash
bun qa
git add docs/reports docs/v2 admin/pipeline
git commit -s -m "🌈 improve(reports): generated docs get their own home

The module was writing four documents into docs/v2/, the
project's own doc tree — a module that edits the project's
documentation is not one you can lift out. They go to
docs/reports/, through a path paths.ts declares.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Provenance and the licence rule

**Goal:** every `data/` subdirectory says where its contents came from,
the README states one licence rule, and a test keeps the rule true.

**Files:**
- Create: `data/source/README.md`, `data/entries/README.md`, `data/quarantine/README.md`, `data/schema/README.md`
- Modify: `data/page-index/README.md` (add the build method)
- Create: `admin/pipeline/data-layout.test.ts`

**Acceptance Criteria:**
- [ ] All six `data/` subdirectories have a README
- [ ] No `.ts` file exists anywhere under `data/`
- [ ] `data/page-index/README.md` states the build method and names the archive tag
- [ ] `data-layout.test.ts` fails if either condition breaks

**Verify:** `bun qa` → green; `find data -name '*.ts' | wc -l` → `0`;
`ls data/*/README.md | wc -l` → `6`.

**Steps:**

- [ ] **Step 1: Write `admin/pipeline/data-layout.test.ts` first, and watch it fail**

```ts
/**
 * The licence rule, asserted mechanically.
 *
 * The repo's whole licence statement is one sentence: everything under
 * `data/` is public domain, everything else is MIT. A sentence cannot
 * enforce itself, and the way this one will actually be broken is
 * someone dropping a helper beside the data it helps with. So: no
 * TypeScript under `data/`.
 *
 * The second check is attribution. Jastrow 1903 is out of copyright
 * and the Internet Archive scans carry no rights field, so nothing
 * COMPELS credit to Sefaria, to the University of Toronto's Robarts
 * Library or to the Ontario Council of University Libraries. It is
 * owed anyway, and a README beside each directory is where a reader
 * will actually find it.
 */
import { describe, expect, it } from 'bun:test';

const DATA_DIR = 'data';

async function subdirectories(): Promise<string[]> {
	const seen = new Set<string>();
	for await (const p of new Bun.Glob('*/**').scan({
		cwd: DATA_DIR,
		onlyFiles: true,
	})) {
		const top = p.split('/')[0];
		if (top !== undefined) {
			seen.add(top);
		}
	}
	return [...seen].sort();
}

describe('data/ carries no code', () => {
	it('has no TypeScript anywhere beneath it', async () => {
		const found: string[] = [];
		for await (const p of new Bun.Glob('**/*.ts').scan({
			cwd: DATA_DIR,
			onlyFiles: true,
		})) {
			found.push(`${DATA_DIR}/${p}`);
		}
		expect(found).toEqual([]);
	});
});

describe('data/ carries its attribution', () => {
	it('every subdirectory has a README', async () => {
		const dirs = await subdirectories();
		// A positive control: a glob that stopped matching would make
		// the assertion below vacuously true.
		expect(dirs.length).toBeGreaterThanOrEqual(6);
		const missing: string[] = [];
		for (const d of dirs) {
			if (!(await Bun.file(`${DATA_DIR}/${d}/README.md`).exists())) {
				missing.push(d);
			}
		}
		expect(missing).toEqual([]);
	});
});
```

```bash
bun qa:test 2>&1 | grep -A5 'data/ carries'
```

Expected: FAIL, listing `entries`, `quarantine`, `schema`, `source` as
missing READMEs.

- [ ] **Step 2: Write `data/source/README.md`**

```markdown
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
```

- [ ] **Step 3: Write the other three READMEs**

`data/entries/README.md`:

```markdown
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
```

`data/quarantine/README.md`:

```markdown
# Quarantine

What the import could not resolve and would not guess at.

`internal-targets.json` holds cross-reference targets that name an
entry the corpus does not contain. The pipeline records them rather
than dropping them or inventing a destination, so the count is
visible in the review report and a later run can resolve them.

Written by `admin/pipeline/migrate/cite.ts`. Regenerated every import.

## Rights

Derived from `data/source/` — public domain, see that README.
```

`data/schema/README.md`:

```markdown
# Schema — the entry contract

`entry.schema.json` is what every file under `data/entries/` must
satisfy. It is the specification: the documents describe it, this
defines it.

Hand-authored by this project. Read at run time by the pipeline
through `admin/pipeline/paths.ts`, and validated by
`admin/pipeline/schema.test.ts`.

It lives here, beside the data it describes, rather than with the code
that happens to produce that data today — the admin tool and the app
read the same contract.

## Rights

**Public domain**, with everything else under `data/`. The entries are
this schema made concrete, so they share its status; and a schema
describing a public-domain dictionary should be free for anyone
rebuilding it.
```

- [ ] **Step 4: Add the build method to `data/page-index/README.md`**

Insert after the opening paragraph:

```markdown
## How it was built

A deterministic script chain — no model was involved at any stage.

Both volumes' hOCR are read as one continuous book, so the alignment
against the source spine is globally monotonic. Every headword is
placed at a token offset by weighted anchor alignment, nearer anchors
weighing more (`1/(1+distance)`); positions the page layout fixes
outright are pinned at `1e6`; the result is forced monotonic by
isotonic regression. The deliverable is the inverse of that map: for
each printed column, the first headword that begins in it.

The twenty files that do this — `build.ts`, `align.ts`, `bands.ts`,
`columns.ts`, `spine.ts`, `layout.ts`, `monotonic.ts`, `emit.ts`,
`hocr.ts`, `verify.ts` and their tests — were a one-time build and
live at `refs/tags/archive/v2-research-2026-09` (on the remote, not
only locally). Only `hebrew.ts` remains in the live tree, because the
import still needs it.
```

- [ ] **Step 5: Rewrite the README licence section**

Replace `README.md:26-32` with:

```markdown
## Licence

**Everything under `data/` is public domain. Everything else is MIT**
(see [LICENSE](LICENSE)).

Jastrow's *Dictionary of the Targumim…* (1903) is out of copyright.
Nothing below compels attribution; it is owed regardless, and each
directory under `data/` carries a README naming its source.

| What | Credit |
|---|---|
| The dictionary text | digitized by [Sefaria](https://www.sefaria.org), who declare the 1903 edition public domain |
| The page scans | scanned 2009 by the University of Toronto's Robarts Library, sponsored by the Ontario Council of University Libraries, hosted by the Internet Archive |
```

- [ ] **Step 6: Gate and commit**

```bash
bun qa
find data -name '*.ts' | wc -l   # expect 0
ls data/*/README.md | wc -l      # expect 6
git add -A data README.md admin/pipeline/data-layout.test.ts
git commit -s -m "📖 doc(data): say where everything came from

The licence rule is now one sentence with no exception, and a
test keeps it true: no TypeScript under data/, a README in every
subdirectory. Nothing compels credit to Sefaria or to Toronto's
Robarts Library — it is owed anyway, and it belongs beside the
files rather than in one distant paragraph.

The page index's method is written down for the first time. It
was a deterministic script chain, and the live tree could not say
so when the question was asked.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: `DESIGN.md` — one present-tense design

**Goal:** a single document states every design fact about the pipeline
that is still true, so the nineteen dated specs can be archived without
losing anything.

**Files:**
- Create: `admin/pipeline/DESIGN.md`
- Read: all 19 files in `docs/specs/`, plus `docs/v2/headword-design.md`

**Acceptance Criteria:**
- [ ] Every design fact still true of the code appears in `DESIGN.md` in present tense
- [ ] No sentence describes intent, a plan, a step number, or a dated decision — those live in `decisions.md` and the archive
- [ ] `bun run headword:issues` produces a report whose `DESIGN.md` link resolves
- [ ] Each of the 19 archived specs has at least one `DESIGN.md` section that covers its live content, recorded in a coverage table in the task's commit message

**Verify:** `bun run headword:issues && grep -c 'DESIGN.md' docs/reports/headword-issues.md` → at least 1; and every link in `DESIGN.md` resolves (Step 4).

**Steps:**

- [ ] **Step 1: Build the coverage table before writing prose**

For each of the 19 specs plus `headword-design.md`, record in a scratch
file: the spec, and what in it is still true of the code. The test for
"still true" is mechanical — grep the spec's load-bearing nouns against
`admin/pipeline/`:

```bash
for f in docs/specs/*.md; do echo "=== $f ==="; grep -c '' "$f"; done
```

Work one spec at a time. A spec whose every claim is superseded gets a
one-line note saying so; that note is the coverage entry.

Do not skip this for the four biggest
(`2026-09-13-pipeline-consolidation-design.md` is 86 KB). Their size is
why the collapse is worth doing.

- [ ] **Step 2: Write `DESIGN.md` against this outline**

```markdown
# The pipeline's design

What is true of `admin/pipeline/` today. Not a plan, not a history —
for how a thing came to be decided, see `docs/decisions.md`; for the
dated specs that argued it, see `docs/archive/specs/`.

## 1. What the module is
   Inputs, outputs, the boundary, paths.ts.
## 2. The entry model
   headwords[], display, senses, stems, the markup vocabulary.
   (from entry-body-model, headword-field-integrity, headword-design §2–§4)
## 3. Source acquisition
   The Sefaria channel, the one-lexicon decision, the snapshot pin.
## 4. Transform rules
   The registry, the 81 rules, commutation, ordering, entangledWith.
## 5. Patches
   Tranches, reviewed, manifests, expected_before, carry-over.
## 6. Repairs and detectors
   The passes, what each detects, what it declines to guess.
## 7. Names and addressing
   sefariaHeadword, name derivation, collisions as gate failures.
## 8. Page placement
   What page-index gives, what confidence means, why it is best-effort.
## 9. Gates
   The nine, what each proves, and what none of them can see.
## 10. Review rows
   Blocking versus deferred, and the bar: what the reader sees.
## 11. What the pipeline will not do
   No vowel inference, no OCR invention, no sense renumbering while
   nothing addresses a sense.
```

Section 11 matters most and is easiest to lose: it is the accumulated
set of things ruled out, and it is spread across the specs being
archived.

- [ ] **Step 3: Carry across `headword-design.md`**

§2–§4 are implemented, so they become `DESIGN.md` §2. §5–§6 are open
questions — they go to `docs/ideas.md` in Task 9, not here. Put a
pointer in `DESIGN.md` §2 saying which questions about the headword
model are open and where they live.

- [ ] **Step 4: Check every link resolves**

```bash
grep -oE '\]\([^)#][^)]*\)' admin/pipeline/DESIGN.md | tr -d '()]' | \
  while read -r l; do [ -e "admin/pipeline/$l" ] || [ -e "$l" ] || echo "DEAD: $l"; done
```

Expected: no `DEAD:` lines.

- [ ] **Step 5: Regenerate the headword report and confirm the link**

```bash
bun run headword:issues
grep -n 'DESIGN.md' docs/reports/headword-issues.md | head -3
```

- [ ] **Step 6: Gate and commit, with the coverage table in the body**

```bash
bun qa
git add admin/pipeline/DESIGN.md docs/reports
git commit -s -F - <<'EOF'
📖 doc(pipeline): state the design in present tense

Nineteen dated specs said what was intended on nineteen dates,
and several of them contradict each other now. This says what is
true, once. The specs archive in the next commit; this is what
has to carry their live content first.

Section 11 is the part that would have been lost: the things the
pipeline will not do — no vowel inference, no OCR invention, no
sense renumbering while nothing addresses a sense — were spread
across five specs and are ruled out nowhere else.

Coverage, spec by spec:
[the table from Step 1]

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
```

---

### Task 7: The pipeline README, refreshed

**Goal:** `admin/pipeline/README.md` tells someone how to run the
module, with the paths this plan moved.

**Files:**
- Modify: `admin/pipeline/README.md` (207 lines)

**Acceptance Criteria:**
- [ ] No stale path: nothing names `data/patches`, `docs/v2` or `admin/pipeline/schema`
- [ ] A "run it on your own data" section names `paths.ts` as the one file to edit
- [ ] Every link resolves

**Verify:** `grep -cE 'data/patches|docs/v2|admin/pipeline/schema' admin/pipeline/README.md` → `0`.

**Steps:**

- [ ] **Step 1: Find the stale paths**

```bash
grep -nE 'data/patches|docs/v2|admin/pipeline/schema' admin/pipeline/README.md
```

- [ ] **Step 2: Fix them, and add the clone section**

After the existing `### Running it` section, add:

```markdown
### Running it on different data

This module names nothing outside itself except through
[`paths.ts`](paths.ts). To run the same pipeline over another
lexicon: point those constants at your files, supply an entry schema
at `SCHEMA_PATH`, and run the two commands above. Nothing in `docs/`
is needed to run it.

What will not transfer: the 81 transform rules and the patch records
under `patch/records/` are corrections to *this* dictionary as Sefaria
holds it. They are the module's import definition, not its engine.
```

- [ ] **Step 3: Split Stage 3 out**

`## Stage 3 — Compile (compile.ts, not yet built)` at line 200 describes
something unwritten. Keep it to three sentences saying it is unwritten
and what it will consume; anything longer is a spec, and specs are what
this plan is removing.

- [ ] **Step 4: Link check, gate, commit**

```bash
grep -oE '\]\([^)#][^)]*\)' admin/pipeline/README.md | tr -d '()]' | \
  while read -r l; do [ -e "admin/pipeline/$l" ] || [ -e "$l" ] || echo "DEAD: $l"; done
bun qa
git commit -s -am "📖 doc(pipeline): refresh the README for the new paths

Adds the section the module boundary exists for: what to edit to
run this over different data, and what will not transfer.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Prune `docs/decisions.md`

**Goal:** the ledger holds only rulings still binding on the pipeline;
the rest move to an archived copy.

**Files:**
- Modify: `docs/decisions.md` (360 lines, 11 ruling families, ~157 rows)
- Create: `docs/archive/decisions-2026-09-22.md`

**Acceptance Criteria:**
- [ ] Every row kept has a live referent: a file under `admin/pipeline/`, a `data/` path, or one of the six live documents
- [ ] The archived copy holds every removed row verbatim, unedited
- [ ] Sections C ("Reversed but still cited as live") and D ("Decided but not reflected in code") are gone — each row in them is either resolved or archived
- [ ] The kept/removed split is recorded in the commit body with counts

**Verify:** for each kept row, its load-bearing noun greps to a live
file (Step 2). `grep -c '^| ' docs/decisions.md` before and after,
both recorded.

**Steps:**

- [ ] **Step 1: Copy the whole file to the archive first**

```bash
cp docs/decisions.md docs/archive/decisions-2026-09-22.md
```

Add a header to the copy saying it is the full ledger as of
`9ec15d66a`, and that the live file keeps only pipeline-binding rows.
**Never edit rows in the archived copy** — its value is being verbatim.

- [ ] **Step 2: Classify every row by grep, not by reading the section**

A struck ruling stays alive in the documents citing it. Grep the
ruling's **nouns**, not its section heading:

```bash
# for a row about, say, `grammar.gender`:
grep -rln 'grammar.gender' admin/pipeline data docs/decisions.md \
  docs/glossary.md admin/pipeline/DESIGN.md
```

- **Hit in live code or a live doc** → keep the row.
- **No hit** → move to the archive copy's "removed" section and delete
  from the live file.
- **Hit only in `docs/archive/`** → remove; the archive is not live.

Record each decision in a scratch table as you go. It becomes the
commit body.

- [ ] **Step 3: Resolve sections C and D row by row**

Section C is rulings reversed but still cited as live. For each: if the
reversal is in the code, the row is history — archive it. If something
live still cites the reversed ruling, **that citation is a defect**;
fix the citation in the same commit and say so.

Section D is decided but not reflected in code. For each: if it is
still wanted, it is an idea — move it to `docs/ideas.md` (Task 9) and
archive the row. If it is not wanted, archive it.

- [ ] **Step 4: Gate and commit**

```bash
bun qa
git add docs/decisions.md docs/archive/decisions-2026-09-22.md
git commit -s -F - <<'EOF'
🧺 chore(decisions): keep only what still binds

The ledger had grown sections titled "Reversed but still cited as
live" and "Decided but not reflected in code" — it knew it was
carrying dead rulings. Every row was classified by grepping its
own nouns against live code and the live documents, because a
struck ruling survives in the documents citing it, not in its own
section.

Kept N of M. The full ledger is archived verbatim at
docs/archive/decisions-2026-09-22.md; nothing is reversed here,
only moved.

[the kept/removed table]

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
```

---

### Task 9: `docs/ideas.md`

**Goal:** one file holds the ideas and reminders, and nothing else.

**Files:**
- Create: `docs/ideas.md`

**Acceptance Criteria:**
- [ ] Contains the 16 parking-lot rows, with their original dates
- [ ] Contains the open questions extracted in Tasks 6 and 8
- [ ] Contains no ruling, no specification, and no commitment — the file says so in its own header
- [ ] Every row is one line plus a note; nothing is a design

**Verify:** `bun qa` → green; the file is under 150 lines.

**Steps:**

- [ ] **Step 1: Write the header**

```markdown
# Ideas

Things to remember, not things decided. Nothing here is a commitment,
a specification or a ruling — rulings live in
[`decisions.md`](decisions.md), and the pipeline's design lives in
[`../admin/pipeline/DESIGN.md`](../admin/pipeline/DESIGN.md).

Add a row when something is worth not forgetting. Promote a row to an
issue when it becomes work. Delete a row when it stops mattering.

| Added | Idea | Notes |
|---|---|---|
```

- [ ] **Step 2: Carry the parking-lot rows across**

Sixteen rows, dated 2026-07-04 to 2026-08-24, held until now only in
Claude's memory (`project_parking_lot`). They include: a notification
system; an about system; a search overhaul; the admin tool running the
pipeline; a notes mechanism for intentional print deviations; a
Sefaria search link per headword; an abbreviation display toggle; a
dedicated brainstorm on mis-targeted internal links; joint/def-less
binyan sections; polytonic Greek font coverage; bidi/RTL rendering
correctness; and candidate rows invisible to `coverage()`.

Drop the `Status` column — a status on an idea is how a list becomes a
tracker. Drop rows already delivered: the storage-format row is settled
and in the schema, and the "final repo layout & docs review" row is
this very piece of work.

- [ ] **Step 3: Add the extracted open questions**

From Task 6: the headword design's §5–§6 questions. From Task 8: every
section-D ruling that is still wanted but not in the code.

- [ ] **Step 4: Commit**

```bash
bun qa
git add docs/ideas.md
git commit -s -m "🦄 new(docs): the ideas list gets a home in the repo

Sixteen rows that lived only in an assistant's memory, plus the
open questions the headword design and the decisions ledger were
carrying. One file, no statuses, no specifications.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 10: The archive sweep

**Goal:** the live tree holds only the six documents, and every link in
them resolves.

**Files:**
- Move: `docs/specs/*.md` (19 + this plan + its spec) → `docs/archive/specs/`
- Move: `docs/v2/` remnants, 3 orphaned `data/source/` reports, `edit-replay.jsonl`
- Delete: `docs/superpowers/`, `docs/.$Migrate Flow.drawio.bkp`
- Modify: `README.md`, `docs/glossary.md`

**Acceptance Criteria:**
- [ ] `docs/v2/` and `docs/superpowers/` no longer exist
- [ ] `docs/specs/` no longer exists
- [ ] Exactly six live documents remain, as listed in spec §4.2
- [ ] Every link in all six resolves
- [ ] `bun data:import` still green on all nine gates

**Verify:** the link check in Step 5 prints nothing; `bun qa` green.

**Steps:**

- [ ] **Step 1: Move `docs/v2/`'s remainder**

```bash
git mv docs/v2/upstream-issues.md docs/
git mv docs/v2/sefaria-report.md  docs/
git mv docs/v2/retired-corpus-checks.md docs/archive/
git mv docs/v2/url-routes.md            docs/archive/
git mv docs/v2/headword-design.md       docs/archive/
git mv docs/v2/research-backlog.md      docs/archive/
rm -f docs/v2/.DS_Store
rm -rf docs/v2/.claude
rmdir docs/v2
```

`headword-design.md` and `research-backlog.md` archive only **after**
Tasks 6 and 9 have taken their live content. Confirm before moving:

```bash
grep -c 'headword' admin/pipeline/DESIGN.md   # expect > 0
grep -c '' docs/ideas.md                       # expect > 20
```

- [ ] **Step 2: Move the orphaned source reports and the replay**

Three artifacts no pipeline file references, plus the admin-tool replay
(M12):

```bash
mkdir -p docs/archive/source-reports-2026-09-22
git mv data/source/baseline-audit-report.json  docs/archive/source-reports-2026-09-22/
git mv data/source/body-dryrun-report.json     docs/archive/source-reports-2026-09-22/
git mv data/source/body-migration-report.json  docs/archive/source-reports-2026-09-22/
git mv data/source/edit-replay.jsonl           docs/archive/source-reports-2026-09-22/
```

Confirm nothing reads them first:

```bash
for f in baseline-audit-report body-dryrun-report body-migration-report edit-replay; do
  printf '%-26s %s\n' "$f" "$(grep -rl "$f" admin/pipeline --include='*.ts' | wc -l)"
done
```

Expected: `0` for all four. `edit-replay` appears in one **docstring**
(`patch/snapshot.ts:28`) — update that docstring to say the file is
archived, do not delete the sentence; it explains why the snapshot
hashes only two files.

Add a README to the new archive directory saying what each file was.

- [ ] **Step 3: Archive the specs, including this plan and its spec**

```bash
mkdir -p docs/archive/specs
git mv docs/specs/*.md docs/archive/specs/
rmdir docs/specs
rm -rf docs/superpowers
rm -f "docs/.\$Migrate Flow.drawio.bkp"
```

This moves `2026-09-22-pipeline-module-boundary-design.md` and
`2026-09-22-pipeline-module-boundary-plan.md` too. That is intended —
the spec says so in its own header. Read what you still need from them
before running this.

- [ ] **Step 4: Rewrite `README.md`**

It currently points at `docs/specs/` and describes `app/` as a
placeholder. Replace the body with: what the repo is; that the import
pipeline is the only module written and the app and admin tool arrive
later; links to `admin/pipeline/README.md`, `admin/pipeline/DESIGN.md`,
`docs/glossary.md`, `docs/decisions.md`, `docs/ideas.md`; the licence
section from Task 5; the contributing note.

Say plainly that `app/index.html` is a deploy stub, not a component.

- [ ] **Step 5: Re-scope `docs/glossary.md` and link-check everything**

Remove glossary terms that name only archived concepts. Keep the
"Retired terms" section — it is how a reader meeting an old word in the
archive finds out it is old.

```bash
for f in README.md docs/glossary.md docs/decisions.md docs/ideas.md \
         admin/pipeline/README.md admin/pipeline/DESIGN.md; do
  grep -oE '\]\([^)#][^)]*\)' "$f" | tr -d '()]' | while read -r l; do
    d=$(dirname "$f"); [ -e "$d/$l" ] || [ -e "$l" ] || echo "DEAD in $f: $l"
  done
done
```

Expected: no output.

- [ ] **Step 6: Full run, gate, commit**

```bash
bun qa
bun data:import && bun qa:format
bun run headword:issues
git status --short data/entries    # expect no output
```

```bash
git add -A
git commit -s -F - <<'EOF'
🧺 chore(docs): six live documents, the rest archived

Nineteen dated specs, eleven mixed documents under docs/v2/ and
four orphaned reports leave the live tree. What remains is what
describes the import pipeline and its data: the two READMEs,
DESIGN.md, the glossary, the rulings that still bind, and the
ideas list.

The spec and plan behind this change archive with them — a dated
spec is a snapshot of intent, and the repo keeps none live.

Nothing is deleted that was not either regenerable or superseded;
everything else moved.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
```

---

### Task 11: The memory audit

**Goal:** Claude's 86 memory files for this project are reduced to what
is true of the module as it now stands — with the maintainer approving
every deletion.

**Files:**
- Read: `/Users/brian/.claude/projects/-Users-brian-Repositories-websites-jastrow/memory/*.md`
- Modify: that directory's `MEMORY.md` index

**Acceptance Criteria:**
- [ ] All 86 files classified: keep / rewrite / cut, each with a one-line reason
- [ ] The list is presented to the maintainer **before** any file is deleted
- [ ] Every `[[link]]` in a kept file still resolves after the cuts
- [ ] `MEMORY.md` has exactly one line per remaining file

**Verify:** count of files equals count of index lines; no `[[name]]`
in any kept file names a deleted one.

**Steps:**

- [ ] **Step 1: Classify, with a stated predicate**

For each file, ask one question: *does this describe the pipeline
module as it now stands, or how to work on it?*

- **Keep**: `user_brian`; working practice still true (for example
  `feedback_move_bytes_never_retype`, `feedback_exact_string_hebrew_lookup`,
  `reference_git_push_https`).
- **Rewrite**: the `project_*` files that describe superseded phases —
  fold into one or two that describe the module and the current state.
- **Cut**: pipeline archaeology whose lesson is spent — findings about
  a specific sweep, a specific count, a specific batch that will not
  recur.

A memory naming a file, function or flag that no longer exists is a cut
regardless of how good its lesson was. Check:

```bash
cd /Users/brian/.claude/projects/-Users-brian-Repositories-websites-jastrow/memory
grep -ohE '`[a-zA-Z0-9_./-]+\.(ts|md|json|jsonl)`' *.md | tr -d '`' | sort -u
```

Then test each against the repo.

- [ ] **Step 2: Present the list and STOP**

Give the maintainer a table: file, verdict, one-line reason. Wait for
approval. **Deleting a memory is irreversible — the store is not under
version control.**

- [ ] **Step 3: Apply, then repair the links**

After approval, delete the approved cuts, rewrite the approved
rewrites, and rebuild `MEMORY.md`. Then:

```bash
grep -ohE '\[\[[a-z0-9_-]+\]\]' *.md | tr -d '[]' | sort -u | \
  while read -r n; do [ -f "$n.md" ] || echo "DANGLING: $n"; done
```

A dangling link is allowed by the memory format — it marks something
worth writing. But a link left dangling *by this cut* should be either
removed or the sentence rewritten, because it now points at a lesson
that was deliberately dropped.

- [ ] **Step 4: Write one new memory recording the boundary**

The one durable fact from this whole plan:

```markdown
---
name: project_pipeline_module_boundary
description: admin/pipeline/ is a standalone import module; paths.ts is its only outward reference, and two tests enforce it
metadata:
  type: project
---

`admin/pipeline/` is an import module: it reads data, writes data in a
schema it does not own, and knows nothing of the app or admin tool.
`admin/pipeline/paths.ts` is the only place it names anything outside
itself; `boundary.test.ts` fails if a second spelling appears or an
import climbs above the module root.

Everything under `data/` is public domain; everything else is MIT.
`data-layout.test.ts` enforces it as "no TypeScript under `data/`, a
README in every subdirectory".

Live documents are six: `README.md`, `admin/pipeline/README.md`,
`admin/pipeline/DESIGN.md`, `docs/decisions.md`, `docs/glossary.md`,
`docs/ideas.md`. Dated specs are archived and none is live — if a
question needs one, the answer belongs in `DESIGN.md` instead.

See [[project_parking_lot]] (now `docs/ideas.md` in the repo).
```

---

## Self-Review

**Spec coverage.** §2 boundary → Task 1. §4.1 code and schema → Tasks
1–3. §4.2 live set → Tasks 6, 7, 8, 9, 10. §4.3 `docs/v2/` → Tasks 4,
10. §4.4 specs → Task 10. §4.5 ideas → Task 9. §4.6 orphans → Task 10.
§4.7 provenance → Task 5. §5 licence → Task 5. §6 memories → Task 11.
§9 checks 1–6 → Tasks 1 (2, 3), 5 (6), 10 (1, 4, 5).

**Known gap, stated rather than hidden.** Task 6 is the one task whose
work cannot be specified mechanically — "every design fact still true"
is a judgment. Its Step 1 forces a spec-by-spec coverage table before
any prose, and that table goes in the commit message so the judgment is
reviewable. If a fact is lost, the archive still holds it and the
coverage table says who was supposed to carry it.

**Type consistency.** `SOURCE_PATH`, `SNAPSHOT_FILES`, `PATTERNS_PATH`,
`ENTRIES_DIR`, `SCHEMA_PATH`, `REPORTS_DIR`, `DESIGN_PATH` are defined
in Task 1 Step 2 and used under those exact names in Tasks 2, 3 and 4.

## Dependencies

| Task | Blocked by |
|---|---|
| 1 | — |
| 2, 3, 4 | 1 |
| 5 | 2, 3 |
| 6 | — (but Task 4 must land before its Step 5 regenerates the report) |
| 7 | 1, 2, 3, 4 |
| 8 | 6 |
| 9 | 6, 8 |
| 10 | 5, 6, 7, 8, 9 |
| 11 | 10 |
