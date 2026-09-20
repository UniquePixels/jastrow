# Consolidation Step 9 — Review Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every import run writes a committed review report that tags each review row `blocks`, `defer` or `note` for v2 publication, and the research leftovers move to one hand-written backlog doc.

**Architecture:** A new `migrate/publication.ts` holds the fixed kind → publication table and stamps every `review`/`patch` row once, after the run and before anything is written; an unclassified kind throws. A new `migrate/review-report.ts` renders `docs/v2/review-report.md` from the stamped rows. `docs/v2/research-backlog.md` replaces the hand-written `docs/v2/review-queue.md`.

**Tech Stack:** Bun (runtime + `bun:test`), TypeScript, Biome.

**Spec:** `docs/specs/2026-09-13-pipeline-consolidation-design.md` §3.1.1 (the review report and the publication gate), §9 (documents), §11 step 9.

## Global Constraints

- The kind → publication table is exactly spec §3.1.1's table. No kind added, none reclassified.
- Pipeline faults (`bucket: 'pipeline'`) carry no `publication` field.
- A `review` or `patch` row whose kind is not in the table throws — a new kind cannot ship unclassified.
- Report row fields stay sorted alphabetically in object literals (existing style: `bucket, detail, kind, publication, rid, severity`).
- `migration-blessing.md` must come out byte-identical: nothing in this plan changes what the run computes.
- Do NOT edit `admin/pipeline/migrate/headword.ts`: a separate headword effort owns it (maintainer ruling 2026-09-18, headwords perfect or halt).
- Control numbers for the final dry run: `headword-unparsed` 309, `blocks` 311 (309 headword + 2 slug-unsafe), `defer` 2,204 (298 + 1,893 + 10 + 3), `note` 0.
- Test tables are one-line tuples, not object literals (Sonar duplication gate).
- `biome check --write` deletes a load-bearing `return;` unless a `biome-ignore` is the LAST comment before it.
- Commits: `git commit -s`, message `<emoji> <type>(<scope>): <description>` ≤ 50 chars, ending with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`. Run `biome check .` and `bun qa:test` before every commit.

**User decisions (already made):**
- "when import runs, it generates a review report, that report should indicate if any listed items require attention before publishing, vs ones that can be resolved later" (maintainer, 2026-09-18)
- The blocks/defer/note assignment per kind in spec §3.1.1 — approved "I agree!" (2026-09-18)
- "the research items are like the rest of the research, we will get it into issues and then it archived" — backlog is hand-written, not pipeline
- The 32 open blocking research classes are triaged in step 11, NOT in this plan
- "yes, go with your recommendation" (2026-09-18): headword code is left to the headword session; `headword-unparsed` stays `blocks` until that work makes it a halt

---

## File Structure

| File | Responsibility |
|---|---|
| `admin/pipeline/migrate/publication.ts` (create) | `Publication` values, the kind table, `publicationOf`, `classifyRows` |
| `admin/pipeline/migrate/report.ts` (modify) | `ReportRow.publication?` |
| `admin/pipeline/migrate/review-report.ts` (create) | `REVIEW_REPORT_PATH`, `renderReviewReport` |
| `admin/pipeline/migrate.ts` (modify) | call `classifyRows` before `writeReport`; write the review report |
| `docs/v2/review-report.md` (generated) | committed output |
| `docs/v2/research-backlog.md` (create), `docs/v2/review-queue.md` (delete) | research leftovers |

---

### Task 1: Classify review rows for publication

**Goal:** Every `review`/`patch` row carries `publication` from spec §3.1.1's table, stamped before the report is written.

**Files:**
- Create: `admin/pipeline/migrate/publication.ts`
- Create: `admin/pipeline/migrate/publication.test.ts`
- Modify: `admin/pipeline/migrate/report.ts:23-36` (type + field), exports
- Modify: `admin/pipeline/migrate.ts` (call before `writeReport`, near line 684)

**Acceptance Criteria:**
- [ ] Each of the 13 kinds in spec §3.1.1 maps to its listed value
- [ ] A `pipeline` row gets no `publication` key
- [ ] A `review` row with an unlisted kind throws, naming the kind
- [ ] `migrate.ts` calls `classifyRows(report)` before `writeReport(report)`
- [ ] `bun qa:test` and `bun qa:tsc` pass

**Verify:** `bun test admin/pipeline/migrate/publication.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Add the field type in `report.ts`**

After `type Severity = 'fault' | 'review';` add:

```ts
/** Whether a review row must be resolved before v2 is published
 * (consolidation spec §3.1.1). Faults carry none: they refuse the write. */
type Publication = 'blocks' | 'defer' | 'note';
```

In `interface ReportRow`, add between `kind` and `rid`:

```ts
	/** Stamped by `classifyRows` on `review` and `patch` rows only. */
	publication?: Publication;
```

Add `Publication` to the `export type { … }` list (alphabetical, after `PatchOutcomeRow`).

- [ ] **Step 2: Write the failing test** — `publication.test.ts`

```ts
import { describe, expect, it } from 'bun:test';
import { classifyRows, publicationOf } from './publication.ts';
import { createReport, lineRow } from './report.ts';

// Spec §3.1.1, one tuple per kind.
const TABLE: ReadonlyArray<readonly [string, string]> = [
	['headword-unparsed', 'blocks'],
	['slug-unsafe', 'blocks'],
	['upstream-fixed', 'blocks'],
	['upstream-changed', 'blocks'],
	['page-confidence-low', 'defer'],
	['page-confidence-medium', 'defer'],
	['markup-carry', 'defer'],
	['review-deferred', 'defer'],
	['slug-changed', 'note'],
	['slug-new', 'note'],
	['slug-alias-new', 'note'],
	['slug-bare-held', 'note'],
	['slug-frozen-stem-drift', 'note'],
];

describe('publicationOf', () => {
	for (const [kind, expected] of TABLE) {
		it(`${kind} → ${expected}`, () => {
			expect(publicationOf({ bucket: 'review', kind })).toBe(expected);
		});
	}
	it('leaves a pipeline fault unclassified', () => {
		expect(
			publicationOf({ bucket: 'pipeline', kind: 'composition-failed' }),
		).toBeUndefined();
	});
	it('throws on a review kind the table does not name', () => {
		expect(() => publicationOf({ bucket: 'review', kind: 'new-kind' })).toThrow(
			'new-kind',
		);
	});
	it('does not read inherited object keys as kinds', () => {
		expect(() =>
			publicationOf({ bucket: 'review', kind: 'constructor' }),
		).toThrow('constructor');
	});
});

describe('classifyRows', () => {
	it('stamps review rows and leaves faults bare', () => {
		const report = createReport();
		report.rows = [
			lineRow('A00001: x', 'slug-unsafe'),
			lineRow('A00002: y', 'finish-failed', 'pipeline', 'fault'),
		];
		classifyRows(report);
		expect(report.rows[0]?.publication).toBe('blocks');
		expect('publication' in (report.rows[1] ?? {})).toBe(false);
	});
});
```

- [ ] **Step 3: Run to see it fail**

Run: `bun test admin/pipeline/migrate/publication.test.ts`
Expected: FAIL — cannot resolve `./publication.ts`

- [ ] **Step 4: Implement** — `publication.ts`

```ts
/** Which review rows block v2 publication (consolidation spec §3.1.1).
 * The value is fixed per kind; a review or patch kind this table does
 * not name throws, so a new kind cannot ship unclassified. */
import type { Publication, Report, ReportRow } from './report.ts';

const PUBLICATION: ReadonlyMap<string, Publication> = new Map([
	['headword-unparsed', 'blocks'],
	['markup-carry', 'defer'],
	['page-confidence-low', 'defer'],
	['page-confidence-medium', 'defer'],
	['review-deferred', 'defer'],
	['slug-alias-new', 'note'],
	['slug-bare-held', 'note'],
	['slug-changed', 'note'],
	['slug-frozen-stem-drift', 'note'],
	['slug-new', 'note'],
	['slug-unsafe', 'blocks'],
	['upstream-changed', 'blocks'],
	['upstream-fixed', 'blocks'],
]);

/** The row's publication class; `undefined` for a pipeline fault. */
function publicationOf(
	row: Pick<ReportRow, 'bucket' | 'kind'>,
): Publication | undefined {
	if (row.bucket === 'pipeline') {
		return undefined;
	}
	const publication = PUBLICATION.get(row.kind);
	if (publication === undefined) {
		throw new Error(
			`review kind "${row.kind}" has no publication class (spec §3.1.1)`,
		);
	}
	return publication;
}

/** Stamp every review and patch row in place. Run once, after the last
 * row is pushed and before the report is written or rendered. */
function classifyRows(report: Report): void {
	for (const row of report.rows) {
		const publication = publicationOf(row);
		if (publication !== undefined) {
			row.publication = publication;
		}
	}
}

export { classifyRows, publicationOf };
```

- [ ] **Step 5: Wire into `migrate.ts`**

Add `import { classifyRows } from './migrate/publication.ts';` with the other `./migrate/*` imports (keep biome's import order). Immediately before `await writeReport(report);` (≈ line 684) add:

```ts
	classifyRows(report);
```

- [ ] **Step 6: Run tests and types**

Run: `bun test admin/pipeline/migrate/publication.test.ts && bun qa:test && bun qa:tsc`
Expected: PASS. If an existing `report.test.ts` `toEqual` on a row now fails, it is because it compares a stamped row — it should not be, since only `classifyRows` stamps; investigate rather than editing the expectation.

- [ ] **Step 7: Commit**

```bash
biome check . && git add admin/pipeline/migrate/publication.ts admin/pipeline/migrate/publication.test.ts admin/pipeline/migrate/report.ts admin/pipeline/migrate.ts
git commit -s -m "🦄 new(pipeline): tag review rows for publication" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Render the review report

**Goal:** `renderReviewReport(report)` produces `docs/v2/review-report.md`, and `migrate.ts` writes it next to the blessing doc on every run.

**Files:**
- Create: `admin/pipeline/migrate/review-report.ts`
- Create: `admin/pipeline/migrate/review-report.test.ts`
- Modify: `admin/pipeline/migrate.ts` (write after the blessing, ≈ line 685; update the final `console.log` at ≈ line 659)

**Acceptance Criteria:**
- [ ] Output has a summary table with the three counts, then sections `## Before publication (n)`, `## Deferred (n)`, `## Notes (n)` in that order
- [ ] Within a section, one `### <kind> (n)` subsection per kind, kinds sorted alphabetically, rows as `- rid: detail` in run order
- [ ] An empty section renders `_none_`
- [ ] Faults and unstamped rows never appear
- [ ] `migrate.ts` writes `REVIEW_REPORT_PATH` with a trailing newline, and its completion log names the file

**Verify:** `bun test admin/pipeline/migrate/review-report.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Write the failing test** — `review-report.test.ts`

```ts
import { describe, expect, it } from 'bun:test';
import { classifyRows } from './publication.ts';
import { createReport, lineRow } from './report.ts';
import { renderReviewReport } from './review-report.ts';

function sample() {
	const report = createReport();
	report.entries = 3;
	report.rows = [
		lineRow('A00003: p1a (medium)', 'page-confidence-medium'),
		lineRow('A00001: ?אִיבּוּס — grammar did not parse', 'headword-unparsed'),
		lineRow('A00002: senses[0].gloss: carried i', 'markup-carry'),
		lineRow('A00004: boom', 'finish-failed', 'pipeline', 'fault'),
	];
	classifyRows(report);
	return report;
}

describe('renderReviewReport', () => {
	it('renders the exact document', () => {
		expect(renderReviewReport(sample())).toBe(
			[
				'# Review report',
				'',
				'Generated by `bun pipeline:migrate` over 3 entries: every review and patch row of the run, by whether it must be resolved before v2 is published (consolidation spec §3.1.1). Deferred rows become tracker issues; notes do not.',
				'',
				'| Publication | Rows |',
				'|---|---|',
				'| blocks | 1 |',
				'| defer | 2 |',
				'| note | 0 |',
				'',
				'## Before publication (1)',
				'',
				'### headword-unparsed (1)',
				'',
				'- A00001: ?אִיבּוּס — grammar did not parse',
				'',
				'## Deferred (2)',
				'',
				'### markup-carry (1)',
				'',
				'- A00002: senses[0].gloss: carried i',
				'',
				'### page-confidence-medium (1)',
				'',
				'- A00003: p1a (medium)',
				'',
				'## Notes (0)',
				'',
				'_none_',
			].join('\n'),
		);
	});
	it('never renders a fault', () => {
		expect(renderReviewReport(sample())).not.toContain('A00004');
	});
});
```

- [ ] **Step 2: Run to see it fail**

Run: `bun test admin/pipeline/migrate/review-report.test.ts`
Expected: FAIL — cannot resolve `./review-report.ts`

- [ ] **Step 3: Implement** — `review-report.ts`

```ts
/** The review report (consolidation spec §3.1.1): every review and
 * patch row of a run, split by whether it blocks v2 publication. The
 * admin tool's tracker integration reads the deferred rows. */
import type { Publication, Report, ReportRow } from './report.ts';

const REVIEW_REPORT_PATH = 'docs/v2/review-report.md';

const SECTIONS: ReadonlyArray<readonly [Publication, string]> = [
	['blocks', 'Before publication'],
	['defer', 'Deferred'],
	['note', 'Notes'],
];

/** One section: a `###` block per kind, kinds alphabetical, rows in
 * run order; `_none_` when the section is empty. */
function section(title: string, rows: readonly ReportRow[]): string[] {
	const head = [`## ${title} (${rows.length})`, ''];
	if (rows.length === 0) {
		return [...head, '_none_'];
	}
	const kinds = [...new Set(rows.map((r) => r.kind))].toSorted();
	return [
		...head,
		...kinds.flatMap((kind, i) => {
			const lines = rows
				.filter((r) => r.kind === kind)
				.map((r) => `- ${r.rid}: ${r.detail}`);
			const block = [`### ${kind} (${lines.length})`, '', ...lines];
			return i === kinds.length - 1 ? block : [...block, ''];
		}),
	];
}

function renderReviewReport(report: Report): string {
	const by = (p: Publication) =>
		report.rows.filter((r) => r.publication === p);
	return [
		'# Review report',
		'',
		`Generated by \`bun pipeline:migrate\` over ${report.entries} entries: every review and patch row of the run, by whether it must be resolved before v2 is published (consolidation spec §3.1.1). Deferred rows become tracker issues; notes do not.`,
		'',
		'| Publication | Rows |',
		'|---|---|',
		...SECTIONS.map(([p]) => `| ${p} | ${by(p).length} |`),
		...SECTIONS.flatMap(([p, title]) => ['', ...section(title, by(p))]),
	].join('\n');
}

export { REVIEW_REPORT_PATH, renderReviewReport };
```

- [ ] **Step 4: Wire into `migrate.ts`**

Import `{ REVIEW_REPORT_PATH, renderReviewReport }` from `./migrate/review-report.ts`. After the blessing write:

```ts
	await Bun.write(REVIEW_REPORT_PATH, `${renderReviewReport(report)}\n`);
```

Change the completion log at ≈ line 659 to:

```ts
	console.log(
		`report written to ${REPORT_PATH}; evidence to ${BLESSING_PATH}; review to ${REVIEW_REPORT_PATH}`,
	);
```

(Read the surrounding code first — if that `console.log` is inside a function without `REVIEW_REPORT_PATH` in scope, import it there too.)

- [ ] **Step 5: Run tests and types**

Run: `bun test admin/pipeline/migrate/review-report.test.ts && bun qa:test && bun qa:tsc`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
biome check . && git add admin/pipeline/migrate/review-report.ts admin/pipeline/migrate/review-report.test.ts admin/pipeline/migrate.ts
git commit -s -m "🦄 new(pipeline): write the review report" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Dry run control and generated docs

**Goal:** A dry run writes the new review report with the control numbers, and leaves everything else byte-identical.

**Files:**
- Create (generated): `docs/v2/review-report.md`

**Acceptance Criteria:**
- [ ] All nine gates green, counts identical to the committed blessing doc
- [ ] `git diff --quiet docs/v2/migration-blessing.md` exits 0 (byte-identical)
- [ ] `docs/v2/review-report.md` summary reads blocks 311, defer 2204, note 0
- [ ] `### headword-unparsed (309)` and `### slug-unsafe (2)` under "Before publication"
- [ ] `git status --short data/entries data/slug-index` is empty

**Verify:** `bun pipeline:migrate && git diff --quiet docs/v2/migration-blessing.md` → exit 0

**Steps:**

- [ ] **Step 1: Dry run** (≈ 2 min)

Run: `bun pipeline:migrate 2>&1 | tail -6`
Expected: last lines include `headword-unparsed=309`, `slug-unsafe=2`, and `review to docs/v2/review-report.md`

- [ ] **Step 2: Check the controls**

```bash
git diff --quiet docs/v2/migration-blessing.md; echo blessing-exit=$?
sed -n 1,12p docs/v2/review-report.md
grep -c '^- ' docs/v2/review-report.md
grep -n '^### ' docs/v2/review-report.md
git status --short data/entries data/slug-index
```

Expected: `blessing-exit=0`; summary blocks 311 / defer 2204 / note 0; 2515 row lines; kind headings `headword-unparsed (309)`, `slug-unsafe (2)`, `markup-carry (10)`, `page-confidence-low (298)`, `page-confidence-medium (1893)`, `review-deferred (3)`; last command empty. If any expectation misses, STOP and report the difference — do not adjust the numbers.

- [ ] **Step 3: Commit**

```bash
bun qa:format && biome check . && git add docs/v2/review-report.md
git commit -s -m "🧺 chore(pipeline): regenerate reports for step 9" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

(If `bun qa:format` reformats `review-report.md`, the renderer's output is not biome-stable: fix the renderer instead and re-run, so the committed file is what the pipeline writes.)

---

### Task 4: Research backlog replaces the review queue

**Goal:** `docs/v2/research-backlog.md` holds the research leftovers with the 32 cutover-blocking classes in their own section; `review-queue.md` is deleted and every link to it repointed; spec step 9 records the outcome.

**Files:**
- Create: `docs/v2/research-backlog.md`
- Delete: `docs/v2/review-queue.md`
- Modify: `docs/v2/upstream-issues.md` (row #16 link)
- Modify: `docs/specs/2026-09-13-pipeline-consolidation-design.md` (§11 step 9, changelog)

**Acceptance Criteria:**
- [ ] Backlog carries, from `review-queue.md`: the coverage table, lists 5 (487), 6 (101), 7 (21 rids), 8 (72 + 5), each with its source and recount note
- [ ] A section "Blocks the v2 cutover (step 11)" lists all 32 open `blocking: true` non-transform classes with route and catalogued count, generated from `data/patches/patterns.jsonl` (not retyped)
- [ ] A header states: hand-written; imported into the tracker once chosen, then archived with the research (maintainer 2026-09-18)
- [ ] `grep -rn "review-queue" docs --include=*.md` finds only the spec's history mentions
- [ ] Spec §11 step 9 "To do" becomes the measured outcome from Task 3

**Verify:** `grep -c '^| `' docs/v2/research-backlog.md` ≥ 37 (32 blocking rows + 5 blocked-route rows); `test ! -e docs/v2/review-queue.md`

**Steps:**

- [ ] **Step 1: Generate the blocking table** (copy output, don't retype)

```bash
python3 - <<'E'
import json
rows=[json.loads(l) for l in open('data/patches/patterns.jsonl')]
b=[r for r in rows if r.get('blocking') and r['status']=='candidate' and r['route']!='transform']
b.sort(key=lambda r:-r['corpusCount'])
print(len(b), sum(r['corpusCount'] for r in b))
for r in b: print(f"| `{r['id']}` | {r['route']} | {r['corpusCount']:,} |")
E
```

Expected first line: `32 6489`.

- [ ] **Step 2: Write `research-backlog.md`**

`git mv docs/v2/review-queue.md docs/v2/research-backlog.md`, then edit:
- Title `# Research backlog`; intro: what research left open, hand-written, imported into the tracker once one is chosen and then archived with the rest of the research (maintainer, 2026-09-18); pipeline review items are in the generated [review-report.md](review-report.md), not here.
- Delete the old lists 1–4 and 9 (pipeline output now) and renumber 5–8 as 1–4; keep their text, counts and sources.
- Keep the coverage section, dropping the "Detector rows" line of its first table.
- Add `## Blocks the v2 cutover (step 11)`: one paragraph citing sweep-tiering T6 and the 2026-08-15 triage (spec §11 step 11), then the table from Step 1 with header `| Class | Route | Catalogued |`.

- [ ] **Step 3: Repoint links**

In `docs/v2/upstream-issues.md` row #16, replace `[review-queue §7](review-queue.md#7-implied-sense-1-candidates-never-decided-21-entries)` with a link to the backlog's implied-`1)` heading (compute its GitHub anchor from the final heading text). Then:

```bash
grep -rn "review-queue" docs --include=*.md | grep -v docs/archive
```

Expected: only lines in the consolidation spec that describe the withdrawn file.

- [ ] **Step 4: Update the spec**

In §11 step 9, replace the `**To do:**` sentence and the "The control is a dry run…" sentence with the Task 3 outcome as measured (gates, blessing byte-identical, `blocks` 311, `defer` 2,204, `note` 0) and name `research-backlog.md` as shipped. Add a changelog row dated 2026-09-18 for the implementation.

- [ ] **Step 5: Commit**

```bash
biome check . && git add -A docs/v2 docs/specs/2026-09-13-pipeline-consolidation-design.md
git commit -s -m "📖 doc(v2): move research leftovers to a backlog" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```
