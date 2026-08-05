# Entry Body Model (§6.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the censuses, fixture corpus, vetted parse rules, formal JSON Schema, and full-corpus dry-run that prove the entry body model (docs/specs/2026-07-11-entry-body-model-design.md) is implementable — the prerequisites for `migrate.ts`.

**Architecture:** Pure-function rule modules under `admin/pipeline/body/`, each unit-tested against a committed fixture corpus before any full-corpus run. A read-only dry-run composes all rules over all 32,512 entries and emits gate evidence (byte round-trips, quarantine lists). Nothing writes truth files — that is `migrate.ts`, later.

**Tech Stack:** Bun + TypeScript (tabs, biome), `bun:test`, JSONL source at `data/source/jastrow-dictionary.jsonl`. Machine reports are regenerable and gitignored (parent spec D2); human summaries go to `docs/v2/`.

**User decisions (already made):**
- B1: design the ideal form first; Sefaria fields are inputs to mapping, not the model.
- B2/B3: prose collapses into gloss (morphology + language fields rejoin); typed `grammar` index (`gender` now, `pos` later) annotates without touching text.
- B4: citation units are arrays, segmented once at migration by the conservative terminator rule; failure mode must be under-split only.
- B5: lettered a)/b)/c) items parse into child senses, before unit segmentation.
- B6: labels normalize with byte-exact print regeneration; failures quarantine.
- B7: `refs` dropped from truth — compile derives the index; 29 orphans dispositioned (21 wrap + 5 ibid + 3 eyes-on).
- B8: `quotes` dropped entirely.
- B9: vetting mandate — every rule fixtured against enumerated edge classes; unprovable cases go to eyes-on, never silently into truth.
- B10: one `<cite ref>` tag for internal rids and canonical refs; dual-destination routing (internal primary + Sefaria arrow) derives from the value.
- B11: a formal JSON Schema is the documented generic spec; examples illustrate only.
- Standing gate: the maintainer personally reviews the eyes-on sets before anything is blessed into truth.

---

## File structure

```
admin/pipeline/body/
	README.md            — module map + how to run
	types.ts             — SourceEntry / SourceSense / BodyEntry / BodySense types
	source.ts            — streaming JSONL reader (shared by every tool here)
	cite.ts              — citation-anchor detector/classifier (both href forms)
	rejoin.ts            — gloss-head rejoin (morphology ⧺ language ⧺ sense-1)
	grammar.ts           — gender-marker parser → grammar index
	labels.ts            — label normalize + byte-exact print regeneration
	lettered.ts          — a)/b)/c) child-sense splitter
	units.ts             — terminator-rule unit segmentation
	census.ts            — corpus censuses → report JSON + doc summary numbers
	dry-run.ts           — read-only full-corpus composition + gate evidence
	review.ts            — maintainer eyes-on review-package generator
	fixtures/
		README.md          — what each class file contains and why
		*.jsonl            — committed entry snapshots per edge class
	*.test.ts            — colocated bun tests per module
admin/pipeline/schema/
	entry.schema.json    — B11 formal schema (draft 2020-12)
	entry.schema.test.ts — fixtures validate; invalid shapes rejected
```

New npm scripts: `body:census`, `body:dry-run`, `body:review`.

Machine outputs (gitignored, D2): `data/source/body-census-report.json`,
`data/source/body-dryrun-report.json`. Human docs: `docs/v2/body-census.md`,
`docs/v2/body-dryrun.md`, `docs/v2/body-review/`.

---

### Task 1: Source reader + body types

**Goal:** One shared, tested way to stream source entries and the type vocabulary every later module uses.

**Files:**
- Create: `admin/pipeline/body/types.ts`
- Create: `admin/pipeline/body/source.ts`
- Create: `admin/pipeline/body/source.test.ts`
- Create: `admin/pipeline/body/README.md`

**Acceptance Criteria:**
- [ ] `readSourceEntries()` streams all 32,512 entries without loading the file into memory
- [ ] `SourceEntry`/`SourceSense` model every upstream field this plan touches (`morphology`, `plural_form`, `language_code`, `language_reference`, recursive senses with `number`/`grammar`)
- [ ] `bun test admin/pipeline/body` passes

**Verify:** `bun test admin/pipeline/body/source.test.ts` → all pass; `bun -e "…count…"` prints 32512

**Steps:**

- [ ] **Step 1: Write the failing test**

```ts
// admin/pipeline/body/source.test.ts
import { describe, expect, it } from 'bun:test';
import { parseSourceEntry } from './source.ts';

describe('parseSourceEntry', () => {
	it('parses the fields the body model consumes', () => {
		const line = JSON.stringify({
			_id: { $oid: 'x' },
			rid: 'A00014',
			headword: 'אָב II',
			parent_lexicon: 'Jastrow Dictionary',
			language_code: '(b. h.;',
			language_reference: ' אבה)',
			content: {
				morphology: 'm.',
				senses: [
					{ definition: 'd0' },
					{ number: '1)', definition: 'd1' },
					{ grammar: { verbal_stem: 'Nif.', binyan_form: ['נֶאֱבַד'] }, senses: [{ definition: 'dn' }] },
				],
			},
		});
		const e = parseSourceEntry(line);
		expect(e.rid).toBe('A00014');
		expect(e.content.morphology).toBe('m.');
		expect(e.content.senses).toHaveLength(3);
		expect(e.content.senses[2]?.grammar?.verbal_stem).toBe('Nif.');
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test admin/pipeline/body/source.test.ts`
Expected: FAIL — `Cannot find module './source.ts'`

- [ ] **Step 3: Write types + reader**

```ts
// admin/pipeline/body/types.ts
/** Upstream shapes (Sefaria dump), restricted to what the body model reads. */
export interface SourceGrammar {
	verbal_stem?: string;
	binyan_form?: string[];
	language_code?: string;
}

export interface SourceSense {
	number?: string;
	definition?: string;
	grammar?: SourceGrammar;
	senses?: SourceSense[];
}

export interface SourceEntry {
	rid: string;
	headword: string;
	language_code?: string;
	language_reference?: string;
	alt_headwords?: string[];
	plural_form?: string[];
	quotes?: [string | null, string, string | null][];
	refs?: string[];
	content: { morphology?: string; senses: SourceSense[] };
}

/** Target shapes (design doc §2). */
export interface BodySense {
	label?: string;
	gloss: string;
	units: string[];
	senses?: BodySense[];
}

export interface BodyStem {
	stem: string;
	forms: string[];
	senses: BodySense[];
}

export interface BodyEntry {
	id: string;
	grammar?: { gender?: 'm' | 'f' | 'c'; number?: 'pl' | 'du' };
	senses: BodySense[];
	stems?: BodyStem[];
}
```

```ts
// admin/pipeline/body/source.ts
/** Streaming reader for data/source/jastrow-dictionary.jsonl. */
import type { SourceEntry } from './types.ts';

export const SOURCE_PATH = 'data/source/jastrow-dictionary.jsonl';

export function parseSourceEntry(line: string): SourceEntry {
	return JSON.parse(line) as SourceEntry;
}

export async function* readSourceEntries(
	path: string = SOURCE_PATH,
): AsyncGenerator<SourceEntry> {
	const stream = Bun.file(path).stream();
	const decoder = new TextDecoder();
	let tail = '';
	for await (const chunk of stream) {
		tail += decoder.decode(chunk, { stream: true });
		const lines = tail.split('\n');
		tail = lines.pop() ?? '';
		for (const line of lines) {
			if (line.trim() !== '') {
				yield parseSourceEntry(line);
			}
		}
	}
	if (tail.trim() !== '') {
		yield parseSourceEntry(tail);
	}
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test admin/pipeline/body/source.test.ts`
Expected: PASS

- [ ] **Step 5: Smoke-count the corpus**

Run: `bun -e "import {readSourceEntries} from './admin/pipeline/body/source.ts'; let n=0; for await (const _ of readSourceEntries()) n++; console.log(n)"`
Expected: `32512`

- [ ] **Step 6: Write README stub (module map from the File structure section) and commit**

```bash
bun qa && git add admin/pipeline/body && git commit -s -m "🦄 new(pipeline): body model source reader + types"
```

---

### Task 2: Citation detector (`cite.ts`)

**Goal:** Find and classify every citation anchor in a definition string — the primitive under units, censuses, and the derived reference index.

**Files:**
- Create: `admin/pipeline/body/cite.ts`
- Create: `admin/pipeline/body/cite.test.ts`

**Acceptance Criteria:**
- [ ] Detects anchors with `href="/X"` AND the slash-less `href="X"` damage class
- [ ] Classifies internal (`/Jastrow,_…`) vs external, exposes `dataRef`, byte offsets, full tag span
- [ ] Normalizes nothing (detection only) — round-trip safety is positional

**Verify:** `bun test admin/pipeline/body/cite.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Write the failing test**

```ts
// admin/pipeline/body/cite.test.ts
import { describe, expect, it } from 'bun:test';
import { findCitations } from './cite.ts';

const EXT = '<a class="refLink" href="/Shemot_Rabbah.46.5" data-ref="Shemot Rabbah 46:5">Ex. R. s. 46</a>';
const EXT_NOSLASH = '<a class="refLink" href="Jerusalem_Talmud_Nedarim.5.6.3" data-ref="Jerusalem Talmud Nedarim 5:6:3">Y. Ned. V, 39ᵇ</a>';
const INT = '<a dir="rtl" class="refLink" href="/Jastrow,_אֵם.1" data-ref="Jastrow, אֵם 1">אֵם</a>';

describe('findCitations', () => {
	it('finds external anchors in both href forms', () => {
		const hits = findCitations(`x. ${EXT} y ${EXT_NOSLASH} z`);
		expect(hits).toHaveLength(2);
		expect(hits[0]?.kind).toBe('external');
		expect(hits[0]?.dataRef).toBe('Shemot Rabbah 46:5');
		expect(hits[1]?.kind).toBe('external');
	});

	it('classifies Jastrow targets as internal', () => {
		const hits = findCitations(`v. ${INT}.`);
		expect(hits[0]?.kind).toBe('internal');
		expect(hits[0]?.dataRef).toBe('Jastrow, אֵם 1');
	});

	it('reports exact spans so slicing reconstructs the input', () => {
		const s = `a ${EXT} b`;
		const [hit] = findCitations(s);
		expect(s.slice(hit?.start, hit?.end)).toContain('</a>');
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test admin/pipeline/body/cite.test.ts`
Expected: FAIL — module missing

- [ ] **Step 3: Implement the detector**

```ts
// admin/pipeline/body/cite.ts
/**
 * Citation-anchor detection. Detection only — no rewriting here, so every
 * consumer stays positionally round-trip safe. Matches both href forms
 * ("/X" and the slash-less damage class, design doc §4).
 */
export interface CitationHit {
	kind: 'internal' | 'external';
	dataRef: string;
	href: string;
	start: number;
	end: number;
}

const ANCHOR = /<a\b[^>]*class="refLink"[^>]*>[\s\S]*?<\/a>/gu;
const HREF = /href="\/?([^"]+)"/u;
const DATA_REF = /data-ref="([^"]+)"/u;

export function findCitations(text: string): CitationHit[] {
	const hits: CitationHit[] = [];
	for (const m of text.matchAll(ANCHOR)) {
		const tag = m[0];
		const href = HREF.exec(tag)?.[1] ?? '';
		const dataRef = DATA_REF.exec(tag)?.[1] ?? '';
		hits.push({
			kind: href.startsWith('Jastrow,') ? 'internal' : 'external',
			dataRef,
			href,
			start: m.index,
			end: m.index + tag.length,
		});
	}
	return hits;
}
```

- [ ] **Step 4: Run tests, then commit**

Run: `bun test admin/pipeline/body/cite.test.ts` → PASS

```bash
bun qa && git add admin/pipeline/body/cite.ts admin/pipeline/body/cite.test.ts && git commit -s -m "🦄 new(pipeline): citation anchor detector"
```

---

### Task 3: Body census (`census.ts`)

**Goal:** Measure every value space and edge class the rules depend on, so fixtures and rule vocabularies are evidence, not guesses.

**Files:**
- Create: `admin/pipeline/body/census.ts`
- Create: `admin/pipeline/body/census.test.ts`
- Modify: `package.json` (add `"body:census": "bun admin/pipeline/body/census.ts"`)
- Modify: `.gitignore` (add `data/source/body-census-report.json`, `data/source/body-dryrun-report.json`)
- Create: `docs/v2/body-census.md` (numbers filled from the run)

**Acceptance Criteria:**
- [ ] Report JSON contains: gender-marker value counts (all `content.morphology` values), label-sequence anomalies (expected ≈72 entries), lettered-item candidates (expected ≈190), unit-boundary terminator distribution, slash-less href count, ibid linked/unlinked counts (expected 8,403 / 7,018), preamble-opener classes (first non-tag character of sense-1: space/comma/paren = non-gloss opener; letter = gloss). The 8 quotes stragglers were already measured in the design session and are embedded as literals in Task 4 — the census does not recompute them
- [ ] Classifier helpers are pure and unit-tested
- [ ] `docs/v2/body-census.md` summarizes with the audit-doc voice (see `docs/v2/baseline-audit.md`)

**Verify:** `bun body:census && bun -e "const r=await Bun.file('data/source/body-census-report.json').json(); console.log(r.totals.entries)"` → `32512`

**Steps:**

- [ ] **Step 1: Write failing tests for the classifiers**

```ts
// admin/pipeline/body/census.test.ts
import { describe, expect, it } from 'bun:test';
import { classifyBoundary, labelSequence, letteredRun } from './census.ts';

describe('classifyBoundary', () => {
	it('buckets the text before a citation', () => {
		expect(classifyBoundary('…father. ')).toBe('period');
		expect(classifyBoundary('…a. fr.—')).toBe('dash');
		expect(classifyBoundary('…39ᵇ; ')).toBe('semicolon');
		expect(classifyBoundary('(play on ')).toBe('embedded');
		expect(classifyBoundary('')).toBe('sense-start');
	});
});

describe('labelSequence', () => {
	it('extracts numeric sequence from sense numbers', () => {
		expect(labelSequence(['1)', '—2)', '—3)'])).toEqual([1, 2, 3]);
	});
	it('flags broken sequences', () => {
		expect(labelSequence(['—2)'])).toEqual([2]);
	});
});

describe('letteredRun', () => {
	it('detects an a)…b) run in plain text', () => {
		expect(letteredRun('x a) one b) two')).toBe(true);
		expect(letteredRun('(a) parenthesized only')).toBe(false);
	});
});
```

- [ ] **Step 2: Run tests to verify failure, then implement**

Run: `bun test admin/pipeline/body/census.test.ts` → FAIL

```ts
// admin/pipeline/body/census.ts
/**
 * Body-model censuses (design doc §7). Read-only; writes the machine
 * report to data/source/body-census-report.json (gitignored, D2).
 * Run: bun body:census
 */
import { findCitations } from './cite.ts';
import { readSourceEntries } from './source.ts';
import type { SourceSense } from './types.ts';

export type Boundary = 'sense-start' | 'period' | 'dash' | 'semicolon' | 'comma' | 'embedded';

export function classifyBoundary(before: string): Boundary {
	const t = before.replace(/<[^>]+>/gu, '').trimEnd();
	if (t === '') {
		return 'sense-start';
	}
	if (t.endsWith('—')) {
		return 'dash';
	}
	if (t.endsWith('.')) {
		return 'period';
	}
	if (t.endsWith(';')) {
		return 'semicolon';
	}
	if (t.endsWith(',')) {
		return 'comma';
	}
	return 'embedded';
}

export function labelSequence(numbers: string[]): number[] {
	return numbers
		.map((n) => /(\d+)/u.exec(n)?.[1])
		.filter((n): n is string => n !== undefined)
		.map(Number);
}

const LETTERED = /(?<![(\w])a\)\s[\s\S]*?(?<![(\w])b\)\s/u;

export function letteredRun(text: string): boolean {
	return LETTERED.test(text);
}

export function* walkSenses(senses: SourceSense[]): Generator<SourceSense> {
	for (const s of senses) {
		yield s;
		if (s.senses) {
			yield* walkSenses(s.senses);
		}
	}
}

const IBID = /(?<![\p{L}])ib(?:id)?\.\s?/giu;

if (import.meta.main) {
	const markers = new Map<string, number>();
	const boundaries = new Map<Boundary, number>();
	const brokenSequences: { rid: string; seq: number[] }[] = [];
	const lettered: string[] = [];
	let slashless = 0;
	let ibidLinked = 0;
	let ibidUnlinked = 0;
	let entries = 0;
	for await (const e of readSourceEntries()) {
		entries++;
		const m = e.content.morphology;
		if (m !== undefined) {
			markers.set(m, (markers.get(m) ?? 0) + 1);
		}
		const numbers: string[] = [];
		for (const s of walkSenses(e.content.senses)) {
			if (s.number !== undefined) {
				numbers.push(s.number);
			}
			const d = s.definition ?? '';
			if (letteredRun(d.replace(/<[^>]+>/gu, ''))) {
				lettered.push(e.rid);
			}
			const cites = findCitations(d);
			for (const c of cites) {
				if (c.kind === 'external') {
					boundaries.set(
						classifyBoundary(d.slice(0, c.start)),
						(boundaries.get(classifyBoundary(d.slice(0, c.start))) ?? 0) + 1,
					);
				}
				if (!/href="\//u.test(d.slice(c.start, c.end))) {
					slashless++;
				}
			}
			for (const im of d.matchAll(IBID)) {
				const openA = d.lastIndexOf('<a ', im.index);
				const closeA = d.lastIndexOf('</a>', im.index);
				if (openA > closeA) {
					ibidLinked++;
				} else {
					ibidUnlinked++;
				}
			}
		}
		const seq = labelSequence(numbers);
		const clean = seq.every((n, i) => n === i + 1);
		if (seq.length > 0 && !clean) {
			brokenSequences.push({ rid: e.rid, seq });
		}
	}
	// preamble-opener classes: inside the entry loop add —
	//   const head = (e.content.senses[0]?.definition ?? '').replace(/<[^>]+>/gu, '');
	//   const opener = head === '' ? 'empty' : /^[\s,(]/u.test(head) ? 'non-gloss' : 'gloss';
	//   openers.set(opener, (openers.get(opener) ?? 0) + 1);
	const report = {
		totals: { entries },
		markers: Object.fromEntries([...markers.entries()].sort((a, b) => b[1] - a[1])),
		boundaries: Object.fromEntries(boundaries),
		brokenSequences,
		lettered: [...new Set(lettered)],
		slashlessHrefs: slashless,
		ibid: { linked: ibidLinked, unlinked: ibidUnlinked },
	};
	await Bun.write('data/source/body-census-report.json', JSON.stringify(report, null, '\t'));
	console.log('entries', entries, '| broken sequences', brokenSequences.length, '| lettered', report.lettered.length);
}
```

- [ ] **Step 3: Tests pass, run the census**

Run: `bun test admin/pipeline/body/census.test.ts` → PASS
Run: `bun body:census`
Expected: `entries 32512 | broken sequences ~72 | lettered ~190` (record exact numbers)

- [ ] **Step 4: Write `docs/v2/body-census.md`** — headline table (markers value space, boundary distribution, broken sequences, lettered, slash-less hrefs, ibid counts) in the voice of `docs/v2/baseline-audit.md`, citing exact measured numbers from the report.

- [ ] **Step 5: Commit**

```bash
bun qa && git add -A && git commit -s -m "🦄 new(pipeline): body model census (6.0)"
```

---

### Task 4: Fixture corpus

**Goal:** Committed, hermetic entry snapshots per edge class so every rule test runs against real data without reading the 90 MB source.

**Files:**
- Create: `admin/pipeline/body/fixtures/extract.ts` (regeneration tool)
- Create: `admin/pipeline/body/fixtures/README.md`
- Create: `admin/pipeline/body/fixtures/*.jsonl` (one file per class, committed)

**Acceptance Criteria:**
- [ ] Classes covered, sourced from the census report: `baseline.jsonl` (A00043-type simple), `origin-splits.jsonl` (A00014, K00664 + sampled), `broken-sequences.jsonl` (all ~72), `lettered.jsonl` (A01999, A01873 + ≥10 sampled), `stems.jsonl` (A00030 + sampled), `units-hard.jsonl` (embedded citations, slash-less hrefs, parenthesized cites), `orphans.jsonl` (the 29), `quotes-stragglers.jsonl` (the 8)
- [ ] `extract.ts` regenerates every file deterministically from rid lists (rid lists are IN the tool, reviewed)
- [ ] Each fixture file round-trips: `JSON.parse` per line, `rid` present

**Verify:** `bun admin/pipeline/body/fixtures/extract.ts --check` → `all fixture files match extraction`

**Steps:**

- [ ] **Step 1: Implement the extractor**

```ts
// admin/pipeline/body/fixtures/extract.ts
/**
 * Regenerates the committed fixture corpus from data/source. Rid lists are
 * code (reviewed); --check verifies committed files match extraction.
 */
import { readSourceEntries } from '../source.ts';

const CLASSES: Record<string, string[]> = {
	baseline: ['A00043', 'A00105', 'A00114'],
	'origin-splits': ['A00014', 'K00664', 'A01350', 'D01096'],
	lettered: ['A01999', 'A01873', 'C00031', 'E00378', 'C00009'],
	stems: ['A00030', 'A00031', 'A00417'],
	'units-hard': ['A00014', 'C00031', 'B01162', 'D00077'],
	// 27 rids = the 29 orphan ref items (P00331 carries 3) — design doc §5
	orphans: ['A01069', 'A01940', 'B00752', 'B00757', 'D00791', 'C00473', 'C01224', 'C01225', 'D00541', 'E00326', 'C01036', 'E00686', 'M01200', 'M01355', 'M01490', 'M01690', 'J00083', 'N00910', 'P00169', 'P00331', 'P00600', 'Q00890', 'P01404', 'Q00002', 'S01230', 'U02063', 'V00042'],
	// broken-sequences rid list: paste from body-census-report.json
	// after Task 3 (~72 rids) — literal array here, reviewed in the PR.
	'broken-sequences': [],
	// measured in the design session (phrases that do not locate in
	// their own body even after abbreviation collapse)
	'quotes-stragglers': ['A00173', 'A02049', 'A03198', 'C00860', 'I00437', 'K00250', 'S00252', 'S01101'],
};

const check = process.argv.includes('--check');
const wanted = new Map<string, string[]>();
for (const [cls, rids] of Object.entries(CLASSES)) {
	for (const rid of rids) {
		wanted.set(rid, [...(wanted.get(rid) ?? []), cls]);
	}
}
const lines = new Map<string, string>();
for await (const e of readSourceEntries()) {
	if (wanted.has(e.rid)) {
		lines.set(e.rid, JSON.stringify(e));
	}
}
for (const [cls, rids] of Object.entries(CLASSES)) {
	const body = `${rids.map((r) => lines.get(r) ?? '').filter((l) => l !== '').join('\n')}\n`;
	const path = `admin/pipeline/body/fixtures/${cls}.jsonl`;
	if (check) {
		const current = await Bun.file(path).text().catch(() => '');
		if (current !== body) {
			console.error(`MISMATCH: ${path}`);
			process.exit(1);
		}
	} else {
		await Bun.write(path, body);
	}
}
console.log(check ? 'all fixture files match extraction' : 'fixtures written');
```

- [ ] **Step 2: Fill the two census-derived rid lists** from `data/source/body-census-report.json` (`brokenSequences[].rid`; quotes stragglers from the census quotes section), run the extractor:

Run: `bun admin/pipeline/body/fixtures/extract.ts` then `bun admin/pipeline/body/fixtures/extract.ts --check`
Expected: `fixtures written`, then `all fixture files match extraction`

- [ ] **Step 3: Write fixtures/README.md** — one row per class: file, count, what the class exercises, which design-doc section mandates it (§7 table).

- [ ] **Step 4: Commit**

```bash
bun qa && git add admin/pipeline/body/fixtures && git commit -s -m "🦄 new(pipeline): body model fixture corpus"
```

---

### Task 5: Gloss-head rejoin (`rejoin.ts`)

**Goal:** Rebuild the printed gloss head — `morphology ⧺ language_code ⧺ language_reference ⧺ sense-1 text` — with a byte round-trip by construction.

**Files:**
- Create: `admin/pipeline/body/rejoin.ts`
- Create: `admin/pipeline/body/rejoin.test.ts`

**Acceptance Criteria:**
- [ ] `rejoinGlossHead(e)` returns the joined string plus the exact offsets of each contributed part
- [ ] `splitGlossHead(joined, offsets)` reproduces the four inputs byte-for-byte (the round-trip)
- [ ] Order matches Sefaria's own renderer: morphology, language_code, language_reference, then sense-1 definition; no separator characters invented
- [ ] Works on the fixture classes: A00014 (paren split across fields) and K00664 (mid-phrase straddle) both heal seamlessly

**Verify:** `bun test admin/pipeline/body/rejoin.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Write the failing tests**

```ts
// admin/pipeline/body/rejoin.test.ts
import { describe, expect, it } from 'bun:test';
import { rejoinGlossHead, splitGlossHead } from './rejoin.ts';
import type { SourceEntry } from './types.ts';

function entry(partial: Partial<SourceEntry>): SourceEntry {
	return {
		rid: 'X00000',
		headword: 'x',
		content: { senses: [{ definition: '' }] },
		...partial,
	} as SourceEntry;
}

describe('rejoinGlossHead', () => {
	it('joins marker, both language fields, and sense-1 text in print order', () => {
		const e = entry({
			language_code: '(b. h.;',
			language_reference: ' אבה)',
			content: { morphology: 'm.', senses: [{ definition: ' , const. x' }] },
		});
		const { joined } = rejoinGlossHead(e);
		expect(joined).toBe('m.(b. h.; אבה) , const. x');
	});

	it('heals the K00664 mid-phrase straddle by pure concatenation', () => {
		const e = entry({
			language_reference: ' c. (b. h.; = כרכר',
			content: { senses: [{ definition: ', v. x) [circle,] more' }] },
		});
		const { joined } = rejoinGlossHead(e);
		expect(joined).toContain('= כרכר, v. x)');
	});

	it('round-trips: split reproduces every input byte-for-byte', () => {
		const e = entry({
			language_code: '(b. h.;',
			language_reference: ' אבה)',
			content: { morphology: 'm.', senses: [{ definition: ' rest' }] },
		});
		const { joined, offsets } = rejoinGlossHead(e);
		const parts = splitGlossHead(joined, offsets);
		expect(parts.morphology).toBe('m.');
		expect(parts.languageCode).toBe('(b. h.;');
		expect(parts.languageReference).toBe(' אבה)');
		expect(parts.senseHead).toBe(' rest');
	});
});
```

- [ ] **Step 2: Run to verify failure, then implement**

```ts
// admin/pipeline/body/rejoin.ts
/**
 * Gloss-head rejoin (design doc §3, B2): pure concatenation of the
 * upstream fragments in print order (Sefaria's as_strings order).
 * Round-trip is by construction — offsets record each part's span.
 */
import type { SourceEntry } from './types.ts';

export interface RejoinOffsets {
	morphology: [number, number];
	languageCode: [number, number];
	languageReference: [number, number];
	senseHead: [number, number];
}

export function rejoinGlossHead(e: SourceEntry): {
	joined: string;
	offsets: RejoinOffsets;
} {
	const parts = [
		e.content.morphology ?? '',
		e.language_code ?? '',
		e.language_reference ?? '',
		e.content.senses[0]?.definition ?? '',
	];
	const offsets = {} as RejoinOffsets;
	const keys: (keyof RejoinOffsets)[] = ['morphology', 'languageCode', 'languageReference', 'senseHead'];
	let pos = 0;
	let joined = '';
	for (const [i, part] of parts.entries()) {
		const key = keys[i];
		if (key !== undefined) {
			offsets[key] = [pos, pos + part.length];
		}
		joined += part;
		pos += part.length;
	}
	return { joined, offsets };
}

export function splitGlossHead(
	joined: string,
	offsets: RejoinOffsets,
): { morphology: string; languageCode: string; languageReference: string; senseHead: string } {
	return {
		morphology: joined.slice(...offsets.morphology),
		languageCode: joined.slice(...offsets.languageCode),
		languageReference: joined.slice(...offsets.languageReference),
		senseHead: joined.slice(...offsets.senseHead),
	};
}
```

- [ ] **Step 3: Tests pass; add a fixture-driven test** iterating `fixtures/origin-splits.jsonl`, asserting `splitGlossHead(rejoinGlossHead(e))` reproduces the source fields for every fixture entry.

- [ ] **Step 4: Commit**

```bash
bun qa && git add admin/pipeline/body/rejoin.ts admin/pipeline/body/rejoin.test.ts && git commit -s -m "🦄 new(pipeline): gloss head rejoin rule"
```

---

### Task 6: Gender markers (`grammar.ts`)

**Goal:** Parse the closed `content.morphology` marker vocabulary into the typed `grammar` index; anything outside the vocabulary is omitted and reported, never guessed.

**Files:**
- Create: `admin/pipeline/body/grammar.ts`
- Create: `admin/pipeline/body/grammar.test.ts`

**Acceptance Criteria:**
- [ ] Vocabulary map is a literal object seeded from the census markers table (every value with its count, decided case by case — `m.` → `{gender:'m'}`, `f.` → `{gender:'f'}`, `c.` → `{gender:'c'}`, plurals like `m. pl.` → `{gender:'m', number:'pl'}`, non-gender markers → `null` = no index entry)
- [ ] `parseMarker(marker)` returns the grammar object or `null`; unknown values return `{unknown: marker}` for the report
- [ ] Never throws; never modifies text

**Verify:** `bun test admin/pipeline/body/grammar.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Failing test**

```ts
// admin/pipeline/body/grammar.test.ts
import { describe, expect, it } from 'bun:test';
import { parseMarker } from './grammar.ts';

describe('parseMarker', () => {
	it('maps the core vocabulary', () => {
		expect(parseMarker('m.')).toEqual({ gender: 'm' });
		expect(parseMarker('f.')).toEqual({ gender: 'f' });
		expect(parseMarker('c.')).toEqual({ gender: 'c' });
		expect(parseMarker('m. pl.')).toEqual({ gender: 'm', number: 'pl' });
	});

	it('flags unknown values instead of guessing', () => {
		expect(parseMarker('pr. n. m.?!')).toEqual({ unknown: 'pr. n. m.?!' });
	});
});
```

- [ ] **Step 2: Implement with the census-seeded literal map**

```ts
// admin/pipeline/body/grammar.ts
/**
 * grammar index seeding (design doc §2, B3). VOCAB is seeded from the
 * body census markers table — extend it there, never by loosening the
 * parser. Unknown markers are reported, not guessed (B9).
 */
export interface GrammarIndex {
	gender?: 'm' | 'f' | 'c';
	number?: 'pl' | 'du';
}

const VOCAB: Record<string, GrammarIndex | null> = {
	'm.': { gender: 'm' },
	'f.': { gender: 'f' },
	'c.': { gender: 'c' },
	'm. pl.': { gender: 'm', number: 'pl' },
	'f. pl.': { gender: 'f', number: 'pl' },
	// …extend from data/source/body-census-report.json markers table
	// during implementation; every census value gets an explicit row
	// (object, or null for "carries no grammar").
};

export function parseMarker(
	marker: string,
): GrammarIndex | { unknown: string } | null {
	const hit = VOCAB[marker.trim()];
	if (hit !== undefined) {
		return hit;
	}
	return { unknown: marker };
}
```

- [ ] **Step 3: Fill VOCAB from the census report** — every distinct marker value observed gets an explicit row (this is the "close the vocabulary" census purpose). Add a test iterating the census markers table asserting no `unknown` for the top-N values covering ≥99% of occurrences.

- [ ] **Step 4: Commit**

```bash
bun qa && git add admin/pipeline/body/grammar.ts admin/pipeline/body/grammar.test.ts && git commit -s -m "🦄 new(pipeline): gender marker grammar index"
```

---

### Task 7: Labels (`labels.ts`)

**Goal:** Normalize sense labels (`"—2)"` → `"2"`, `"a)"` → `"a"`, `"*4)"` → star-flagged `4`) and regenerate the print form byte-exactly; anything non-regenerable quarantines.

**Files:**
- Create: `admin/pipeline/body/labels.ts`
- Create: `admin/pipeline/body/labels.test.ts`

**Acceptance Criteria:**
- [ ] `parseLabel(raw, position)` → `{ label, star, dash }` or `null` (unparseable)
- [ ] `printLabel(parsed)` regenerates the exact source string for every parseable label
- [ ] Fixture test: every `number` value in the whole corpus (checked in Task 10's dry-run) either round-trips or lands in the quarantine list — starting assertion here covers all values in `fixtures/*.jsonl`
- [ ] The ~72 broken-sequence entries parse individually (per-label) — sequence sanity is reported, not "fixed"

**Verify:** `bun test admin/pipeline/body/labels.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Failing tests**

```ts
// admin/pipeline/body/labels.test.ts
import { describe, expect, it } from 'bun:test';
import { parseLabel, printLabel } from './labels.ts';

describe('label round-trip', () => {
	const cases = ['1)', '—2)', '—3)', '*4)', 'a)', '—b)'];
	for (const raw of cases) {
		it(`round-trips ${JSON.stringify(raw)}`, () => {
			const parsed = parseLabel(raw);
			expect(parsed).not.toBeNull();
			if (parsed !== null) {
				expect(printLabel(parsed)).toBe(raw);
			}
		});
	}

	it('returns null on garbage instead of guessing', () => {
		expect(parseLabel('II.')).toBeNull();
	});
});
```

- [ ] **Step 2: Implement**

```ts
// admin/pipeline/body/labels.ts
/**
 * Sense-label normalization + byte-exact print regeneration (B6).
 * parse → {label, star, dash}; print() must reproduce the source
 * string exactly or the entry quarantines (design doc §3).
 */
export interface ParsedLabel {
	label: string;
	star: boolean;
	dash: boolean;
}

const LABEL = /^(?<dash>—?)(?<star>\*?)(?<label>\d+|[a-z])\)$/u;

export function parseLabel(raw: string): ParsedLabel | null {
	const m = LABEL.exec(raw);
	if (m?.groups === undefined) {
		return null;
	}
	return {
		label: m.groups['label'] ?? '',
		star: m.groups['star'] === '*',
		dash: m.groups['dash'] === '—',
	};
}

export function printLabel(p: ParsedLabel): string {
	return `${p.dash ? '—' : ''}${p.star ? '*' : ''}${p.label})`;
}
```

- [ ] **Step 3: Fixture sweep** — add a test reading every fixture entry, asserting each `number` either round-trips or is on an explicit expected-quarantine list in the test (`['…']` literal, from census). Check the actual star form in the source (`*4)` vs `4)*` — the census markers table will show the real shapes; adjust `LABEL` accordingly, keeping the round-trip test authoritative.

- [ ] **Step 4: Commit**

```bash
bun qa && git add admin/pipeline/body/labels.ts admin/pipeline/body/labels.test.ts && git commit -s -m "🦄 new(pipeline): sense label normalize + regen"
```

---

### Task 8: Lettered-item split (`lettered.ts`)

**Goal:** Split provable `a)…b)…c)` runs into child senses; anything unprovable stays untouched in the parent gloss (under-split only).

**Files:**
- Create: `admin/pipeline/body/lettered.ts`
- Create: `admin/pipeline/body/lettered.test.ts`

**Acceptance Criteria:**
- [ ] Splits only when a complete ascending run exists (`a)` then `b)` [then `c)`…], each preceded by start/space/dash, none inside parentheses or `<a>` tags)
- [ ] `joinLettered(parts)` reproduces the input byte-for-byte (round-trip)
- [ ] A01999 (standalone run) and A01873 (run inside a numbered sense) fixtures split correctly; `(a) parenthesized` text does NOT split

**Verify:** `bun test admin/pipeline/body/lettered.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Failing tests**

```ts
// admin/pipeline/body/lettered.test.ts
import { describe, expect, it } from 'bun:test';
import { joinLettered, splitLettered } from './lettered.ts';

describe('splitLettered', () => {
	it('splits an ascending run into head + items', () => {
		const text = 'Several Tanaim: a) E. ben Hyrcanus. b) E. ben Jose.';
		const parts = splitLettered(text);
		expect(parts).not.toBeNull();
		expect(parts?.head).toBe('Several Tanaim: ');
		expect(parts?.items.map((i) => i.letter)).toEqual(['a', 'b']);
		expect(parts?.items[0]?.text).toBe(' E. ben Hyrcanus. ');
	});

	it('round-trips byte-for-byte', () => {
		const text = 'x a) one b) two c) three';
		const parts = splitLettered(text);
		expect(parts).not.toBeNull();
		if (parts !== null) {
			expect(joinLettered(parts)).toBe(text);
		}
	});

	it('refuses non-runs (no b after a, or parenthesized)', () => {
		expect(splitLettered('only a) alone here')).toBeNull();
		expect(splitLettered('see (a) and (b) markers')).toBeNull();
	});
});
```

- [ ] **Step 2: Implement**

```ts
// admin/pipeline/body/lettered.ts
/**
 * Lettered-item splitter (B5). Splits ONLY complete ascending runs whose
 * markers sit outside parens/anchors; everything else returns null and
 * the text stays whole (under-split failure mode, B9). Runs before unit
 * segmentation (design doc §3).
 */
export interface LetteredParts {
	head: string;
	items: { letter: string; text: string }[];
}

const MARKER = /(?<![(\p{L}])([a-z])\)/gu;

function insideAnchor(text: string, index: number): boolean {
	return text.lastIndexOf('<a ', index) > text.lastIndexOf('</a>', index);
}

export function splitLettered(text: string): LetteredParts | null {
	const marks: { letter: string; index: number }[] = [];
	for (const m of text.matchAll(MARKER)) {
		const letter = m[1];
		if (letter !== undefined && !insideAnchor(text, m.index)) {
			marks.push({ letter, index: m.index });
		}
	}
	const ascending: { letter: string; index: number }[] = [];
	for (const mark of marks) {
		const expected = String.fromCharCode(97 + ascending.length);
		if (mark.letter === expected) {
			ascending.push(mark);
		}
	}
	if (ascending.length < 2 || ascending[0] === undefined) {
		return null;
	}
	const head = text.slice(0, ascending[0].index);
	const items = ascending.map((mark, i) => {
		const next = ascending[i + 1];
		const bodyStart = mark.index + `${mark.letter})`.length;
		return {
			letter: mark.letter,
			text: text.slice(bodyStart, next?.index ?? text.length),
		};
	});
	return { head, items };
}

export function joinLettered(parts: LetteredParts): string {
	return parts.head + parts.items.map((i) => `${i.letter})${i.text}`).join('');
}
```

- [ ] **Step 3: Fixture sweep** — iterate `fixtures/lettered.jsonl`: for each entry, every definition either returns null or round-trips via `joinLettered`. Add the real A01999/A01873 assertions.

- [ ] **Step 4: Commit**

```bash
bun qa && git add admin/pipeline/body/lettered.ts admin/pipeline/body/lettered.test.ts && git commit -s -m "🦄 new(pipeline): lettered item splitter"
```

---

### Task 9: Unit segmentation (`units.ts`)

**Goal:** The conservative terminator rule (B4): break before an external citation only after `.`/`—`/sense-start; joining the units reproduces the input byte-for-byte.

**Files:**
- Create: `admin/pipeline/body/units.ts`
- Create: `admin/pipeline/body/units.test.ts`

**Acceptance Criteria:**
- [ ] `segmentUnits(text)` → `{ gloss, units }` where `gloss + units.join('') === text` (byte round-trip, tested on every fixture definition)
- [ ] Boundaries only at `period`/`dash`/`sense-start` classes (Task 3's `classifyBoundary`); `semicolon`/`comma`/`embedded` never break
- [ ] A00014 sense 0 produces the 7 known units; slash-less-href citations still detected (via Task 2)

**Verify:** `bun test admin/pipeline/body/units.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Failing tests**

```ts
// admin/pipeline/body/units.test.ts
import { describe, expect, it } from 'bun:test';
import { segmentUnits } from './units.ts';

const CITE = (ref: string, txt: string) =>
	`<a class="refLink" href="/${ref.replaceAll(' ', '_')}" data-ref="${ref}">${txt}</a>`;

describe('segmentUnits', () => {
	it('breaks after a period before a citation', () => {
		const text = `<i>father</i>. ${CITE('Shemot Rabbah 46:5', 'Ex. R. s. 46')} end more text.`;
		const { gloss, units } = segmentUnits(text);
		expect(gloss).toBe('<i>father</i>. ');
		expect(units).toHaveLength(1);
	});

	it('never breaks at semicolon citation lists or embedded citations', () => {
		const text = `x. ${CITE('A', 'A')} quote; ${CITE('B', 'B')}; a. fr. (play on ${CITE('C', 'C')}) y.`;
		const { units } = segmentUnits(text);
		expect(units).toHaveLength(1);
	});

	it('round-trips byte-for-byte', () => {
		const text = `gloss. ${CITE('A', 'A')} one. ${CITE('B', 'B')} two.`;
		const { gloss, units } = segmentUnits(text);
		expect(gloss + units.join('')).toBe(text);
	});
});
```

- [ ] **Step 2: Implement**

```ts
// admin/pipeline/body/units.ts
/**
 * Citation-unit segmentation (B4): conservative terminator rule. A unit
 * boundary exists only where the text before an external citation ends
 * with '.' or '—' (or is the sense start). Failure mode is under-split
 * (design doc §4). gloss + units.join('') === input, always.
 */
import { classifyBoundary } from './census.ts';
import { findCitations } from './cite.ts';

export function segmentUnits(text: string): { gloss: string; units: string[] } {
	const boundaries: number[] = [];
	for (const c of findCitations(text)) {
		if (c.kind !== 'external') {
			continue;
		}
		const cls = classifyBoundary(text.slice(0, c.start));
		if (cls === 'period' || cls === 'dash' || cls === 'sense-start') {
			boundaries.push(c.start);
		}
	}
	if (boundaries.length === 0) {
		return { gloss: text, units: [] };
	}
	const first = boundaries[0] ?? 0;
	const units: string[] = [];
	for (const [i, start] of boundaries.entries()) {
		units.push(text.slice(start, boundaries[i + 1] ?? text.length));
	}
	return { gloss: text.slice(0, first), units };
}
```

- [ ] **Step 3: Fixture sweeps** — (a) every definition in every fixture file round-trips (`gloss + units.join('') === definition`); (b) the A00014 sense-0 fixture yields exactly 7 units (adjust expectation to the real number once the slash-less href fix is active — record it in the test with a comment).

- [ ] **Step 4: Commit**

```bash
bun qa && git add admin/pipeline/body/units.ts admin/pipeline/body/units.test.ts && git commit -s -m "🦄 new(pipeline): citation unit segmentation"
```

---

### Task 10: Formal JSON Schema (B11)

**Goal:** The machine-readable generic spec of the truth entry format, with fixture-backed validation tests.

**Files:**
- Create: `admin/pipeline/schema/entry.schema.json`
- Create: `admin/pipeline/schema/entry.schema.test.ts`

**Acceptance Criteria:**
- [ ] Schema (JSON Schema draft 2020-12) encodes design doc §2 exactly: required `id`/`slug`/`headword`/`senses`; optional `altHeadwords`/`page`/`grammar`/`stems`; sense = `{label?, gloss, units[], senses?[]}`; `additionalProperties: false` everywhere
- [ ] Hand-built valid/invalid documents in the test validate/reject correctly
- [ ] DECIDE (execution time): validator dependency — see below

**Verify:** `bun test admin/pipeline/schema` → all pass

**Steps:**

- [ ] **Step 1: DECIDE — validator library.** Open because the overhaul spec (CP-2a) reserves new-dependency decisions to the maintainer; no recorded decision covers a validation library. Ask via AskUserQuestion:
  - "ajv (dev-dependency) (Recommended)" — the standard JSON Schema validator; dev-only, never ships to the app; used by the pipeline validate stage and tests. Truth files and schema are unaffected either way.
  - "Hand-rolled checks" — no new dependency; validation code we maintain ourselves; schema file remains the documented spec but is not machine-enforced until migrate lands its own checks.

- [ ] **Step 2: Write the schema** — every field from design doc §2's example + field table, `$defs/sense` recursive, `$defs/formObject` for headword/alts (text + optional homograph/disambiguator/reconstructed), `page` `{number: int, column: "a"|"b"}`, `grammar` `{gender: "m"|"f"|"c", number?: "pl"|"du", pos?: string}`, `stems[]` `{stem: string, forms: string[], senses: $defs/sense[]}`.

- [ ] **Step 3: Failing test with valid + invalid documents**

```ts
// admin/pipeline/schema/entry.schema.test.ts
import { describe, expect, it } from 'bun:test';
// import validator per Step 1 decision
import schema from './entry.schema.json';

const VALID = {
	id: 'A00014',
	slug: 'אב-2',
	headword: { text: 'אָב', homograph: 2 },
	senses: [{ gloss: 'm. (b. h.) <i>father</i>.', units: [] }],
};

describe('entry schema', () => {
	it('accepts a minimal valid entry', () => {
		expect(validate(schema, VALID).ok).toBe(true);
	});
	it('rejects unknown fields (closed schema)', () => {
		expect(validate(schema, { ...VALID, refs: [] }).ok).toBe(false);
	});
	it('rejects a sense without gloss', () => {
		expect(validate(schema, { ...VALID, senses: [{ units: [] }] }).ok).toBe(false);
	});
});
```

- [ ] **Step 4: Implement per the Step 1 decision, tests pass, commit**

```bash
bun qa && git add admin/pipeline/schema package.json bun.lock && git commit -s -m "🦄 new(pipeline): formal entry schema (B11)"
```

---

### Task 11: Full-corpus dry-run (`dry-run.ts`)

**Goal:** Compose every rule over all 32,512 entries, read-only, and emit the §6.0 gate evidence: round-trip counts, quarantine lists, output samples that validate against the schema.

**Files:**
- Create: `admin/pipeline/body/dry-run.ts`
- Create: `admin/pipeline/body/dry-run.test.ts` (composition helpers only)
- Modify: `package.json` (add `"body:dry-run": "bun admin/pipeline/body/dry-run.ts"`)
- Create: `docs/v2/body-dryrun.md`

**Acceptance Criteria:**
- [ ] Per entry: rejoin → lettered split → unit segmentation → label parse → grammar parse, building a `BodyEntry`; then **verify round-trip**: strip structure back to the source fields byte-for-byte; count pass/fail per rule
- [ ] Report: totals, per-rule round-trip pass counts (target 32,512/32,512 for rejoin/units/lettered by construction; labels report quarantines), quarantine rid lists (broken sequences, unknown markers, unparseable labels), unit-count distribution
- [ ] A sample of ≥100 built entries validates against `entry.schema.json`
- [ ] `docs/v2/body-dryrun.md` records the headline numbers as the §6.0 blessing evidence
- [ ] **No file under `data/` other than the gitignored report is written**

**Verify:** `bun body:dry-run` → prints `round-trip 32512/32512` per structural rule (or the exact quarantine counts) and writes the report

**Steps:**

- [ ] **Step 1: Implement the composition** — `buildBody(e: SourceEntry): { body: BodyEntry; problems: Problem[] }` in `dry-run.ts` using Tasks 5–9 modules; unit-test it on the baseline + origin-splits fixtures (structure asserted, round-trip asserted).

- [ ] **Step 2: Implement the driver** — stream corpus, accumulate counters exactly as in `census.ts` (same report/doc pattern), write `data/source/body-dryrun-report.json`.

- [ ] **Step 3: Run, record, document**

Run: `bun body:dry-run`
Expected: per-rule round-trip counts; any structural rule below 32,512/32,512 is a bug to fix before this task closes (the arrays are joins of slices — failures mean a rule broke its contract).

- [ ] **Step 4: Write `docs/v2/body-dryrun.md`** with the measured table + quarantine summary, then commit

```bash
bun qa && git add -A && git commit -s -m "🦄 new(pipeline): body model dry run (6.0 gate)"
```

---

### Task 12: Maintainer review package

**Goal:** Generate the eyes-on review docs for every set the maintainer must personally clear before §6.0 is blessed.

**USER-ORDERED GATE — NON-SKIPPABLE.** This task was requested by the user in the current conversation. It MUST NOT be closed by walking around it, by declaring it "verified inline", or by substituting a cheaper check. Close only after every item in `acceptanceCriteria` has been re-validated independently, with output captured.

**Files:**
- Create: `admin/pipeline/body/review.ts`
- Modify: `package.json` (add `"body:review": "bun admin/pipeline/body/review.ts"`)
- Create: `docs/v2/body-review/` (generated markdown, committed)

**Acceptance Criteria:**
- [ ] `docs/v2/body-review/` contains one doc per set, each row showing the entry headword, the problem text in context, and a decision column to fill: broken sequences (~72), orphan refs (29, pre-annotated with the 21/5/3 dispositions), quotes stragglers (8), unknown grammar markers (from dry-run), unparseable labels (from dry-run), 50 random unit segmentations rendered as bulleted units for spot review
- [ ] Maintainer has reviewed each doc and recorded pass/changes; outcomes are committed as edits to the decision columns
- [ ] Design-doc changelog gains a row recording the review outcome (this is the observable close condition)

**Verify:** `git log --oneline -1 -- docs/specs/2026-07-11-entry-body-model-design.md` shows the review-outcome changelog commit; every file in `docs/v2/body-review/` has its decision column filled

**Steps:**

- [ ] **Step 1: Implement `review.ts`** — reads census + dry-run reports and the source, emits the markdown tables listed in the AC (same streaming pattern as `census.ts`).
- [ ] **Step 2: Run `bun body:review`, commit the generated docs**
- [ ] **Step 3: Maintainer reviews each doc, fills decision columns** (hand edits, committed)
- [ ] **Step 4: Add the review-outcome changelog row to the design doc, commit**

```bash
git add docs/v2/body-review docs/specs/2026-07-11-entry-body-model-design.md && git commit -s -m "📖 doc(pipeline): body model maintainer review"
```

---

### Task 13: Parent-spec amendments

**Goal:** Apply the design doc's §8 consequences to the parent data-architecture spec so the keystone document stays current.

**Files:**
- Modify: `docs/specs/2026-07-08-v2-data-architecture-design.md` (on a branch off `main` — the spec lives there; PR to `main`)

**Acceptance Criteria:**
- [ ] §2.2: provisional-rows paragraph replaced with a pointer to the body-model design; `origin`/`senses`/`quotes`/`refs` rows updated to their B-decision fates
- [ ] §2.3: `<ref rid>`/`<cite ref>` rows merged into the unified `<cite ref>` row (B10), counts summed, `k=` note carried over
- [ ] §7 register: #1 reworded to derived-index lint; #12 closed; ibid linking pass + POS enrichment rows added
- [ ] §11 changelog row citing the body-model design doc
- [ ] PR to `main` (docs-only), following the CP-1 PR pattern

**Verify:** PR open with docs-only diff; changelog row present

**Steps:**

- [ ] **Step 1: Branch `doc/body-model-amendments` off fetched `origin/main`** (HTTPS fetch per repo convention)
- [ ] **Step 2: Make the four edit groups above** (exact replacement text drafted from design doc §8)
- [ ] **Step 3: Commit + push + PR**

```bash
git commit -s -m "📖 doc(specs): fold body model into architecture"
```

---

## Task 15: splitLettered italic-marker extension (from §6.0 review, 07)

**Goal:** Teach `splitLettered` (B5) to recognize italic-wrapped
lettered markers (`<i>a</i>)`) — the 07 review decision (2026-08-05)
chose rule extension over accepting the under-split; 75 entries.

**Acceptance Criteria:**
- [ ] New fixtures for the italic-wrapped class
- [ ] Census/structural reconciliation (dry-run Finding 2) reaches zero unexplained
- [ ] Byte round-trip gate still 32,512/32,512

## Task 16: Migration passes from §6.0 review decisions

**Goal:** Implement the migration steps approved 2026-08-05:
crossref/citation-chop rejoins (36); implied-`1)` inserts (39,
recorded deviations, register #16); numbering-gap marker reinserts
per 01's per-row notes; label repairs (`-N)` → em-dash, D00341
bracket move); empty `binyan_form` drop + whitespace trim (06);
cite-wraps for the 21 gershayim + 5 ibid orphans; 3 baseless refs
removed (02 — show only what Jastrow linked).

**Acceptance Criteria:**
- [ ] Each pass listed in the migration report with entry ids
- [ ] Blessing gates pass
- [ ] Print deviations carry the planned notes mechanism, or a TODO pointer to its spec

## Task 17: Protect review-doc decisions from regeneration

**Goal:** `bun body:review` regenerates `docs/v2/body-review/*`
byte-for-byte and would wipe the hand-recorded 2026-08-05 decisions.
Make `review.ts` preserve Decision cells/notes on regen, or
guard/retire the script; keep 00-INDEX's determinism claim accurate.

---

## Task dependencies

| Task | Blocked by |
|---|---|
| 2 | 1 |
| 3 | 1, 2 |
| 4 | 3 |
| 5–9 | 4 (fixtures) — mutually independent after that |
| 9 | also 2, 3 (detector + boundary classifier) |
| 10 | 1 (types); DECIDE step gates its own Step 4 |
| 11 | 5, 6, 7, 8, 9, 10 |
| 12 | 11 |
| 13 | 12 (review outcome may amend wording) |
| 15 | 12 (review decision 07) |
| 16 | 15 (splits must precede migration passes); 12 |
| 17 | 12 — independent of 15/16 |
