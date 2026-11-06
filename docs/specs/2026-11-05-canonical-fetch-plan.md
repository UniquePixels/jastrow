# Canonical fetch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `bun data:fetch` writes Sefaria's data in a form fixed by the data alone, no reader depends on line order, and a duplicate `rid` is refused.

**Architecture:** A pure `canonicalJson` writer (keys sorted recursively, arrays kept) used by `fetch.ts`, which also sorts entries by `rid`. The Sefaria appendix's `familyRun` measures distance in `rid` order. Both source readers share one duplicate-`rid` guard.

**Tech Stack:** Bun 1.4.3, TypeScript, `bson` 7 (`EJSON`), Biome 2.5.15.

**Spec:** [`2026-11-05-canonical-fetch-design.md`](2026-11-05-canonical-fetch-design.md); ruling `11-05 canonical fetch` in [`../decisions.md`](../decisions.md).

## Global Constraints

- Branch `chore/canonical-fetch`, off `v2`. PR into `v2`. Never commit to `v2` or `main`.
- Every commit: `bun qa` exits 0 first (gate on the exit code, not the output), `git commit -s`, subject `<emoji> <type>(scope): <description>` ≤ 50 chars, trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- String order is `byCodeUnit` from `admin/entry/order.ts`, never `localeCompare`.
- Arrays are never reordered (sense order and ref order are data).
- **The source's data never changes in this work.** Only its line order and key order do.
- A unit test (`*.test.ts`) never reads `data/sources/sefaria/`.
- Before `git add <files> && git commit`, check `git diff --cached --name-only` holds only this task's files.

**User decisions (already made):**
- "a fetch is a fetch. The fetch should be independent/decoupled from anything else."
- Design approved, including the one-time rewrite of every source line ("Approve design").
- Spec approved ("Approve spec").
- Any appendix or review-file delta from the `familyRun` change is the maintainer's call, asked as its own ADD / MOVE / REMOVE question with no default.

## Review Focus

1. **Objects inside arrays.** A sense array holds objects; their keys must be sorted while the array order stays. Test in Task 3.
2. **Hebrew and other non-ASCII text.** The rewrite must not start escaping it (`א`). Test in Task 3.
3. **Duplicate `rid` after a blank line.** The reported line numbers must be file lines, counting blanks. Test in Task 1.
4. **A family member whose `rid` is not in the source.** `familyRun`'s `?? -1` fallback must behave as before. Covered in Task 2 by keeping `resolveKey`'s existing tests green.
5. **The cached dump being newer than the committed source.** It must never silently change data. Gate in Task 4.

---

### Task 1: Readers refuse a duplicate `rid`

**Goal:** `readSourceEntries` and `readRaw` throw on a repeated `rid`, naming it and both line numbers.

**Files:**
- Modify: `admin/pipeline/body/source.ts` (add `ridGuard`, use it in `readSourceEntries`, export it)
- Modify: `admin/pipeline/sefaria.ts:32-41` (`readRaw` uses `ridGuard`)
- Test: `admin/pipeline/body/source.test.ts`

**Acceptance Criteria:**
- [ ] A fixture with `A00001` on lines 1 and 4 (a blank line 2) makes `readSourceEntries(path)` reject with `duplicate rid A00001: lines 1 and 4`.
- [ ] `ridGuard` alone throws the same message for the same calls.
- [ ] `readRaw` calls the guard (read the diff).
- [ ] `bun qa` exits 0.

**Verify:** `bun test admin/pipeline/body/source.test.ts` → all pass, including the two new cases.

**Steps:**

- [ ] **Step 1: Write the failing tests** (append inside `describe('readSourceEntries'…)`, or a new `describe` at the end of `source.test.ts`; add `ridGuard` to the import list).

```ts
describe('ridGuard', () => {
	it('throws on a repeated rid, naming both lines', () => {
		const seen = ridGuard('source.jsonl');
		seen('A00001', 1);
		seen('A00002', 3);
		expect(() => seen('A00001', 4)).toThrow(
			'duplicate rid A00001: lines 1 and 4 of source.jsonl',
		);
	});

	it('makes readSourceEntries refuse a duplicate, counting blank lines', async () => {
		const one = JSON.stringify({
			rid: 'A00001',
			headword: 'אָב',
			content: { senses: [] },
		});
		const two = JSON.stringify({
			rid: 'A00002',
			headword: 'אֵם',
			content: { senses: [] },
		});
		const path = `${TEST_DIR}/source-duplicate.jsonl`;
		await Bun.write(path, [one, '', two, one].join('\n'));
		const read = async (): Promise<void> => {
			for await (const _ of readSourceEntries(path)) {
				// drain
			}
		};
		await expect(read()).rejects.toThrow(
			`duplicate rid A00001: lines 1 and 4 of ${path}`,
		);
	});
});
```

- [ ] **Step 2: Run to see it fail**

Run: `bun test admin/pipeline/body/source.test.ts`
Expected: FAIL — `ridGuard` is not exported.

- [ ] **Step 3: Implement** in `source.ts`, above `readSourceEntries`:

```ts
/** A checker that a source's rids are unique: call it with each
 * entry's rid and its 1-based file line; it throws on a repeat. Shared
 * by every reader of the source (ruling 11-05 canonical fetch), so a
 * duplicate is refused rather than resolved first-wins or last-wins. */
function ridGuard(path: string): (rid: string, line: number) => void {
	const lines = new Map<string, number>();
	return (rid, line) => {
		const first = lines.get(rid);
		if (first !== undefined) {
			throw new Error(
				`duplicate rid ${rid}: lines ${first} and ${line} of ${path}`,
			);
		}
		lines.set(rid, line);
	};
}
```

Then `readSourceEntries`'s loop becomes:

```ts
	const file = path ?? SOURCE_PATH;
	const seen = ridGuard(file);
	let number = 0;
	for await (const line of linesOf(Bun.file(file).stream())) {
		number += 1;
		if (line.trim() !== '') {
			const entry = parseSourceEntry(line);
			seen(entry.rid, number);
			yield entry;
		}
	}
```

Add `ridGuard` to the export list. In `sefaria.ts`, import `ridGuard` from `./body/source.ts` and make `readRaw`:

```ts
async function readRaw(): Promise<Map<string, RawRecord>> {
	const records = new Map<string, RawRecord>();
	const seen = ridGuard(SOURCE_PATH);
	for (const [index, line] of (await Bun.file(SOURCE_PATH).text())
		.split('\n')
		.entries()) {
		if (line.trim() !== '') {
			const record = JSON.parse(line) as RawRecord;
			seen(record.rid, index + 1);
			records.set(record.rid, record);
		}
	}
	return records;
}
```

- [ ] **Step 4: Run to see it pass**

Run: `bun test admin/pipeline/body/source.test.ts` → PASS. Then `bun data:sefaria` must still exit 0 (the live source has no duplicates); `git diff --stat docs/` must be empty.

- [ ] **Step 5: Commit**

```bash
bun qa && git add admin/pipeline/body/source.ts admin/pipeline/body/source.test.ts admin/pipeline/sefaria.ts && git diff --cached --name-only && git commit -s -m "🦠 fix(source): refuse a duplicate rid" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

```json:metadata
{"files": ["admin/pipeline/body/source.ts", "admin/pipeline/body/source.test.ts", "admin/pipeline/sefaria.ts"], "verifyCommand": "bun test admin/pipeline/body/source.test.ts", "acceptanceCriteria": ["readSourceEntries rejects 'duplicate rid A00001: lines 1 and 4 of <path>'", "ridGuard throws the same message", "readRaw uses ridGuard", "bun qa exits 0"], "modelTier": "standard"}
```

---

### Task 2: `familyRun` reads `rid` order

**Goal:** `indexSource` records each entry's position in `rid` order, so family distance means distance in the dictionary, not in the file.

**Files:**
- Modify: `admin/pipeline/report/sefaria-evidence.ts:284-297` (`indexSource`), and the `FAMILY_GAP` doc comment at `:236-239`
- Test: `admin/pipeline/report/sefaria-report.test.ts:532-544` (rewrite "cuts the family…") plus one new case

**Acceptance Criteria:**
- [ ] With records given in the order `[citing, one, two, far]`, where `far` (`B00052`, headword `בָּב I`) is within 5 of `two` in `rid` order, the retarget goes to review with `family members carrying I: B00049, B00052`, whatever the input order.
- [ ] With `far` = `B00099` and six gap records `B00051`…`B00056` given in any order, the row passes with `only B00049 carries I`.
- [ ] `bun data:sefaria` is run, and `git diff --stat docs/reports/` is reported to the maintainer.
- [ ] **If the diff is non-empty, work stops.** Each moved row is listed as ADD / MOVE / REMOVE with its rid and patch id, and the maintainer answers before the regenerated reports are committed.
- [ ] `bun qa` exits 0.

**Verify:** `bun test admin/pipeline/report/sefaria-report.test.ts` → all pass; `bun data:sefaria && git diff --stat docs/reports/` → output shown to the maintainer.

**Steps:**

- [ ] **Step 1: Rewrite and add tests.** Replace the `it('cuts the family where its members stand more than five apart', …)` body with:

```ts
	it('cuts the family where its members stand more than five apart in rid order', () => {
		const far = record('B00099', { headword: 'בָּב I' });
		const gap = ['B00051', 'B00052', 'B00053', 'B00054', 'B00055', 'B00056'].map(
			(rid) => record(rid),
		);
		const one = record('B00049', { alt_headwords: ['בָּבָא I'], headword: 'בָּב' });
		const two = record('B00050', { headword: 'בָּב II' });
		const out = buildSefariaAppendix(
			inputs([far, citing, two, ...gap.reverse(), one], [retarget]),
		);
		expect(out.rows[0]?.evidence).toBe(
			'text: the cite reads "בָּב I"; only B00049 carries I',
		);
	});

	it('keeps a near member in the family however far apart the file puts it', () => {
		const near = record('B00052', { headword: 'בָּב I' });
		const filler = ['C00001', 'C00002', 'C00003', 'C00004', 'C00005', 'C00006'].map(
			(rid) => record(rid),
		);
		const one = record('B00049', { alt_headwords: ['בָּבָא I'], headword: 'בָּב' });
		const two = record('B00050', { headword: 'בָּב II' });
		const out = buildSefariaAppendix(
			inputs([citing, one, two, ...filler, near], [retarget]),
		);
		expect(out.review[0]?.detail).toBe(
			'family members carrying I: B00049, B00052',
		);
	});
```

(If `review[0]?.detail` is not where that failure text lands, read `retargetProof`'s caller at `sefaria-evidence.ts:498-510` and assert on the field it fills; the text is the one built at `:436`.)

- [ ] **Step 2: Run to see the new case fail**

Run: `bun test admin/pipeline/report/sefaria-report.test.ts`
Expected: the "however far apart the file puts it" case FAILS (file position puts `B00052` 7 lines from `B00050`).

- [ ] **Step 3: Implement.** In `indexSource`, replace the position line with a `rid`-ordered index. Add `import { byCodeUnit } from '../../entry/order.ts';`.

```ts
	const position = new Map<string, number>();
	for (const [index, rid] of [...records.keys()].sort(byCodeUnit).entries()) {
		position.set(rid, index);
	}
	for (const record of records.values()) {
		push(byKey, linkKey(record.headword), record.rid);
		for (const key of new Set(formsOf(record).map(skeleton))) {
			push(bySkeleton, key, record.rid);
		}
	}
```

Amend the `FAMILY_GAP` comment: "How far apart (in entries, in `rid` order, which is print order) two members… (ruling 11-05 canonical fetch)."

- [ ] **Step 4: Run to see it pass**

Run: `bun test admin/pipeline/report/sefaria-report.test.ts` → PASS.

- [ ] **Step 5: Measure on the corpus**

Run: `bun data:sefaria && git diff --stat docs/reports/ && git diff docs/reports/sefaria-appendix.csv docs/reports/sefaria-review.csv`

- Empty diff: go to Step 6.
- **Non-empty diff: STOP.** Do not commit the reports. List every moved row as ADD (newly in the appendix), REMOVE (left it) or MOVE (reason changed), with rid, patch id and old and new reason. Ask the maintainer, one question, no default. Commit the code (Step 6) without the reports, and commit the reports only after the answer.

- [ ] **Step 6: Commit**

```bash
bun qa && git add admin/pipeline/report/sefaria-evidence.ts admin/pipeline/report/sefaria-report.test.ts && git diff --cached --name-only && git commit -s -m "🦠 fix(sefaria): family distance in rid order" -m "The dump's line order interleaves letters, so a family's
five-entry window could span C, D and E. rid order is print order." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

```json:metadata
{"files": ["admin/pipeline/report/sefaria-evidence.ts", "admin/pipeline/report/sefaria-report.test.ts"], "verifyCommand": "bun test admin/pipeline/report/sefaria-report.test.ts && bun data:sefaria && git diff --stat docs/reports/", "acceptanceCriteria": ["near-in-rid member joins the family whatever the input order", "far-in-rid member is cut whatever the input order", "corpus appendix diff shown to the maintainer; any non-empty diff stops work for an ADD/MOVE/REMOVE answer", "bun qa exits 0"], "modelTier": "standard", "userGate": true, "tags": ["user-gate"]}
```

---

### Task 3: Canonical writer in the fetch

**Goal:** `fetch.ts` writes entries sorted by `rid` and every document with its keys sorted recursively, through a pure, tested `canonicalJson`.

**Files:**
- Create: `admin/pipeline/canonical-json.ts`
- Create: `admin/pipeline/canonical-json.test.ts`
- Modify: `admin/pipeline/fetch.ts:112-178` (`emitRegistry`, `emitEntries`; the header comment)
- Modify: `data/sources/sefaria/README.md` (the "unmodified" row and a canonical-form sentence)
- Modify: `admin/pipeline/README.md` (the fetch's output contract, if it says "dump order")

**Acceptance Criteria:**
- [ ] `canonicalJson({b: 1, a: {d: [ {z: 1, y: 2} ], c: 'א'}})` returns `{"a":{"c":"א","d":[{"y":2,"z":1}]},"b":1}`: no `\u` escapes, array kept, inner keys sorted.
- [ ] Two lists of the same EJSON documents in different orders, sorted by `sortByRid` and written, give byte-identical output.
- [ ] `fetch.ts` no longer streams entries in dump order: it collects them, sorts them by `rid` with `byCodeUnit`, and writes `canonicalJson(EJSON.serialize(doc, { relaxed: true }))` per line.
- [ ] `lexicons.json` is records sorted by `name`, written as `canonicalJson` tab-indented with a trailing newline.
- [ ] `grep -rn "dump order" admin/pipeline/fetch.ts admin/pipeline/README.md data/sources/sefaria/README.md` returns nothing.
- [ ] `bun qa` exits 0.

**Verify:** `bun test admin/pipeline/canonical-json.test.ts` → pass; `bun qa` → exit 0.

**Steps:**

- [ ] **Step 1: Write the failing tests** in `admin/pipeline/canonical-json.test.ts`:

```ts
import { describe, expect, it } from 'bun:test';
import { canonicalJson, sortByRid } from './canonical-json.ts';

describe('canonicalJson', () => {
	it('sorts keys at every depth, keeps arrays, and does not escape Hebrew', () => {
		expect(
			canonicalJson({ b: 1, a: { d: [{ z: 1, y: 2 }], c: 'א' } }),
		).toBe('{"a":{"c":"א","d":[{"y":2,"z":1}]},"b":1}');
	});

	it('keeps array order exactly', () => {
		expect(canonicalJson({ senses: [{ n: 2 }, { n: 1 }] })).toBe(
			'{"senses":[{"n":2},{"n":1}]}',
		);
	});

	it('indents with tabs when asked, for the registry', () => {
		expect(canonicalJson([{ name: 'x', a: 1 }], '\t')).toBe(
			'[\n\t{\n\t\t"a": 1,\n\t\t"name": "x"\n\t}\n]',
		);
	});
});

describe('sortByRid', () => {
	it('gives the same bytes whatever order the dump held', () => {
		const docs = [
			{ rid: 'D01030', headword: 'ד', content: { senses: [] } },
			{ rid: 'C00144', headword: 'ג', content: { senses: [] } },
			{ rid: 'A00000', headword: 'א', content: { senses: [] } },
		];
		const write = (list: typeof docs): string =>
			sortByRid(list)
				.map((d) => canonicalJson(d))
				.join('\n');
		expect(write(docs)).toBe(write([...docs].reverse()));
		expect(sortByRid(docs).map((d) => d.rid)).toEqual([
			'A00000',
			'C00144',
			'D01030',
		]);
	});
});
```

- [ ] **Step 2: Run to see it fail**

Run: `bun test admin/pipeline/canonical-json.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** `admin/pipeline/canonical-json.ts`:

```ts
/**
 * The canonical form the fetch writes (ruling 11-05 canonical fetch):
 * object keys sorted by code unit at every depth, arrays in their own
 * order, entries sorted by rid. The bytes depend on the data alone, so
 * fetching an unchanged export gives identical files and `git diff`
 * names only the entries that changed.
 */
import { byCodeUnit } from '../entry/order.ts';

/** `value` with every object's keys in code-unit order, recursively.
 * Arrays keep their order: sense and ref order are data. */
function sortKeys(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(sortKeys);
	}
	if (value !== null && typeof value === 'object') {
		const object = value as Record<string, unknown>;
		return Object.fromEntries(
			Object.keys(object)
				.sort(byCodeUnit)
				.map((key) => [key, sortKeys(object[key])]),
		);
	}
	return value;
}

/** JSON text of an already EJSON-serialized `value` with sorted keys;
 * `indent` as `JSON.stringify` takes it. */
function canonicalJson(value: unknown, indent?: string): string {
	return JSON.stringify(sortKeys(value), undefined, indent);
}

/** A copy of `docs` sorted by rid in code-unit order. */
function sortByRid<T extends { rid: string }>(docs: readonly T[]): T[] {
	return [...docs].sort((a, b) => byCodeUnit(a.rid, b.rid));
}

export { canonicalJson, sortByRid, sortKeys };
```

- [ ] **Step 4: Run to see it pass**

Run: `bun test admin/pipeline/canonical-json.test.ts` → PASS.

- [ ] **Step 5: Use it in `fetch.ts`.** Import `{ canonicalJson, sortByRid }` from `./canonical-json.ts`, and `byCodeUnit` from `../entry/order.ts`.

In `emitRegistry`, replace the write with:

```ts
	const sorted = [...registry].sort((a, b) =>
		byCodeUnit(a['name'] as string, b['name'] as string),
	);
	await Bun.write(
		registryPath,
		`${canonicalJson(EJSON.serialize(sorted, { relaxed: true }), '\t')}\n`,
	);
```

In `emitEntries`, collect instead of streaming: replace the `writers` map with `const collected = new Map([...JASTROW_LEXICONS.keys()].map((l) => [l, [] as Document[]]));`. In the loop, `collected.get(parentLexicon)?.push(doc)` (skip when undefined, as now). After the loop, for each `[lexicon, docs]`: keep the empty-lexicon throw, then

```ts
		const lines = sortByRid(docs as (Document & { rid: string })[]).map(
			(doc) => `${canonicalJson(EJSON.serialize(doc, { relaxed: true }))}\n`,
		);
		await Bun.write(JASTROW_LEXICONS.get(lexicon) as string, lines.join(''));
		counts.set(lexicon, docs.length);
```

Drop the now-unused `freshWriter` import if nothing else in `fetch.ts` uses it. Rewrite the `emitEntries` doc comment: "Emit entries as relaxed extended JSON, one file per lexicon, sorted by rid with keys sorted (canonical-json.ts), so the bytes depend on the data alone." Update the file's header comment the same way.

- [ ] **Step 6: Docs.** In `data/sources/sefaria/README.md`, change the table row to `| jastrow-dictionary.jsonl | Sefaria's export, data unmodified, written in canonical form |` (and `lexicons.json` likewise). Add after the table: "Canonical form (ruling `11-05 canonical fetch`): entries sorted by `rid`, every object's keys sorted, arrays as Sefaria has them. A fetch of an unchanged export rewrites identical bytes." Fix any "dump order" wording in `admin/pipeline/README.md`.

- [ ] **Step 7: Commit**

```bash
bun qa && git add admin/pipeline/canonical-json.ts admin/pipeline/canonical-json.test.ts admin/pipeline/fetch.ts data/sources/sefaria/README.md admin/pipeline/README.md && git diff --cached --name-only && git commit -s -m "🌈 improve(fetch): write the source canonically" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

```json:metadata
{"files": ["admin/pipeline/canonical-json.ts", "admin/pipeline/canonical-json.test.ts", "admin/pipeline/fetch.ts", "data/sources/sefaria/README.md", "admin/pipeline/README.md"], "verifyCommand": "bun test admin/pipeline/canonical-json.test.ts && bun qa", "acceptanceCriteria": ["canonicalJson sorts keys at every depth, keeps arrays, no \\u escapes", "shuffled inputs give identical bytes", "fetch.ts sorts entries by rid and writes canonicalJson", "lexicons.json sorted by name, tab-indented", "no 'dump order' wording left", "bun qa exits 0"], "modelTier": "standard"}
```

---

### Task 4: Rewrite the committed source, and prove it is the same data

**Goal:** The committed `jastrow-dictionary.jsonl` and `lexicons.json` are in canonical form, with entry-for-entry identical data to `v2`.

**Files:**
- Modify: `data/sources/sefaria/jastrow-dictionary.jsonl`, `data/sources/sefaria/lexicons.json` (regenerated)
- Modify: `data/sources/sefaria/manifest.json` (only if the cache path is taken)
- Modify: `docs/decisions.md` (row `11-05 canonical fetch`: status `live`, drop "`not in code` until the spec lands")
- Generated docs under `docs/reports/` only if they changed, and only by reordering

**Acceptance Criteria:**
- [ ] The proof script prints `same data: 32512 entries, lexicons equal` comparing `v2`'s files against the new ones.
- [ ] If the cache path's proof fails, the source is rewritten from `v2`'s committed file instead, and the proof then passes. The cache's real changes are reported to the maintainer, not committed.
- [ ] Running the canonical rewrite twice gives no further diff (`git diff --stat` empty after a second run).
- [ ] `bun data:import:dry` exits 0 with every gate at 0 failures; `bun data:validate` exits 0; `bun data:sefaria` exits 0.
- [ ] `git diff --stat docs/reports/` against Task 2's result shows only reordered rows: `sort` of old and new files compares equal for each changed file.
- [ ] `bun qa` exits 0.

**Verify:** the proof script in Step 2 → `same data: 32512 entries, lexicons equal`.

**Steps:**

- [ ] **Step 1: Try the cache.** Run: `bun data:fetch -- --cached` (if that passes no flag through, run `bun admin/pipeline/fetch.ts --cached`).

- [ ] **Step 2: Prove it is the same data.** Write `$TMPDIR/same-data.ts` (scratch, not committed):

```ts
import { deepStrictEqual } from 'node:assert';

const [oldDir, newDir] = Bun.argv.slice(2);
const byRid = (text: string): Map<string, unknown> =>
	new Map(
		text
			.split('\n')
			.filter((l) => l.trim() !== '')
			.map((l) => {
				const v = JSON.parse(l) as { rid: string };
				return [v.rid, v];
			}),
	);
const a = byRid(await Bun.file(`${oldDir}/jastrow-dictionary.jsonl`).text());
const b = byRid(await Bun.file(`${newDir}/jastrow-dictionary.jsonl`).text());
deepStrictEqual([...a.keys()].sort(), [...b.keys()].sort());
for (const [rid, entry] of a) {
	deepStrictEqual(b.get(rid), entry, `entry ${rid} differs`);
}
const byName = (v: { name: string }[]) =>
	[...v].sort((x, y) => (x.name < y.name ? -1 : 1));
deepStrictEqual(
	byName(await Bun.file(`${newDir}/lexicons.json`).json()),
	byName(await Bun.file(`${oldDir}/lexicons.json`).json()),
);
console.log(`same data: ${a.size} entries, lexicons equal`);
```

Run:

```bash
mkdir -p $TMPDIR/v2src && git show v2:data/sources/sefaria/jastrow-dictionary.jsonl > $TMPDIR/v2src/jastrow-dictionary.jsonl && git show v2:data/sources/sefaria/lexicons.json > $TMPDIR/v2src/lexicons.json && bun $TMPDIR/same-data.ts $TMPDIR/v2src data/sources/sefaria
```

`deepStrictEqual` ignores key order, so a pass means the data is identical.

- [ ] **Step 3: If the proof fails, the cache is a newer export.** Record the first differing rids for the maintainer, then rewrite from `v2`'s files instead:

```bash
git checkout v2 -- data/sources/sefaria/ && bun -e '
import { canonicalJson, sortByRid } from "./admin/pipeline/canonical-json.ts";
import { byCodeUnit } from "./admin/entry/order.ts";
const dir = "data/sources/sefaria";
const docs = (await Bun.file(`${dir}/jastrow-dictionary.jsonl`).text()).split("\n").filter((l) => l.trim() !== "").map((l) => JSON.parse(l));
await Bun.write(`${dir}/jastrow-dictionary.jsonl`, sortByRid(docs).map((d) => `${canonicalJson(d)}\n`).join(""));
const reg = await Bun.file(`${dir}/lexicons.json`).json();
reg.sort((a, b) => byCodeUnit(a.name, b.name));
await Bun.write(`${dir}/lexicons.json`, `${canonicalJson(reg, "\t")}\n`);
'
```

The committed files are already relaxed EJSON text, so `JSON.parse` reads them as exactly the values `EJSON.serialize` gives the fetch (`{"$oid": …}` and all): the two paths write the same bytes for the same data. This keeps `v2`'s `manifest.json`, since no fetch happened. Re-run Step 2; it must pass.

- [ ] **Step 4: Idempotence.** Run the same rewrite (Step 1 or Step 3, whichever path was taken) again; `git diff --stat data/sources/sefaria/` must show no change from the first run.

- [ ] **Step 5: Downstream.** Run `bun data:import:dry`, `bun data:validate` and `bun data:sefaria`; each exits 0, and the dry import reports 0 failures on every gate. For each changed file under `docs/reports/`:

```bash
diff <(git show HEAD:docs/reports/<file> | sort) <(sort docs/reports/<file>)
```

It must be empty (reordered rows only). A non-empty one means data moved: STOP and report to the maintainer.

- [ ] **Step 6: Ruling status.** In `docs/decisions.md`, row `11-05 canonical fetch`, set the status to `live`.

- [ ] **Step 7: Commit**

```bash
bun qa && git add data/sources/sefaria/ docs/decisions.md docs/reports/ && git diff --cached --name-only && git commit -s -m "🧺 chore(data): source in canonical form" -m "Same data, new order: entries by rid, keys sorted. Checked entry
for entry against v2 (32,512 equal)." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

```json:metadata
{"files": ["data/sources/sefaria/jastrow-dictionary.jsonl", "data/sources/sefaria/lexicons.json", "data/sources/sefaria/manifest.json", "docs/decisions.md", "docs/reports/"], "verifyCommand": "bun $TMPDIR/same-data.ts $TMPDIR/v2src data/sources/sefaria", "acceptanceCriteria": ["proof prints 'same data: 32512 entries, lexicons equal'", "cache with real changes falls back to v2's file and is reported, not committed", "second rewrite gives no diff", "dry import, validate, data:sefaria exit 0, all gates 0 failures", "changed reports differ only by row order", "bun qa exits 0"], "modelTier": "standard", "userGate": true, "tags": ["user-gate"]}
```
