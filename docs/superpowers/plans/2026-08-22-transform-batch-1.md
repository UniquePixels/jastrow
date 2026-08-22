# Transform Batch 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `admin/pipeline/transform/` and land the RTL-wrapper
family (3 catalogue rows, 4,849 entries) plus the resolvable subset of
`abbrev-in-alt-headwords`, with the residue reclassified on the record.

**Architecture:** A shared HTML token stream (`html.ts`) that every one
of the eventual 81 rules reads; a registry that proves coverage against
`data/patches/patterns.jsonl`; rules that carry a predicate and no
expected count; a `transform:count` harness that audits each rule alone
against the pinned snapshot and skips when the pin is stale.

**Tech Stack:** Bun, TypeScript, `bun test`, Biome. **Zero runtime
dependencies** — the tokenizer is hand-written, not a library.

**Global Constraints:**
- A `Rule` never carries an expected count. Counts live in
  `patterns.jsonl`; only `transform:count` reads them.
- `serialize(tokenize(s)) === s` for every definition in the corpus.
  Every rule edits tokens and re-serializes; nothing does regex surgery
  on raw markup.
- Text bytes (tags stripped) must be a sub-multiset of the input unless
  the rule declares `allows`. The RTL rules declare nothing — they move
  wrappers, never text.
- Hebrew character classes are built with explicit `\u` ranges and
  guarded by a test asserting they do **not** match `—`, `ᵃ`, `'`, `(`.
  A pasted literal class decomposed `יִ` and silently produced the range
  `U+05B4–U+FB4F` during the audit; that bug is the reason this
  constraint exists.
- `bun qa` (format, lint, test, tsc) passes before every commit.

**User decisions (already made):**
- "Test + corpus count match" — rules ship with unit tests and a
  corpus-count audit; no materialized per-edit diff in git.
- Counts are verification, not pipeline: "this is to verify our pipeline
  is working, but not part of the pipeline… in the future we cannot know
  how those counts may change."
- Two-layer no-new-text (markup free, text strict-with-allowance),
  reclassification writes back to `patterns.jsonl`, 7 batches / 7 PRs.

---

## Batch 1 was re-scoped before planning — read this first

The spec's batch 1 was "`bare-rtl-hebrew` + `abbrev-in-alt-headwords`,
the two biggest blockers". Reading both audit reports changed it.

**`bare-rtl-hebrew` cannot be written alone.** Its audit report ends:

> `redundant-outer-rtl-span` (529) and `latin-token-inside-rtl-span`
> (130) are the exact inverse failures — over- and mis-application of
> the same wrapper. **Any Phase 2 transform should be written against
> all three at once, or it will trade one for another.**

Those two rows carry `entangledWith: undefined` in the catalogue. The
entanglement is recorded in prose and absent from the field the registry
gate reads. Task 4 fixes the data.

**`abbrev-in-alt-headwords` is not fully deterministic**, by its own
audited description: the elided tail "must be recovered by aligning the
stub to the headword, **which the simplest anchor rule resolves for only
65.5%**". Of 2,241 occurrences: 1,468 resolve uniquely, 527 have a final
consonant absent from the headword (ס/צ interchange), 220 are ambiguous,
26 leave no tail. Task 6 transforms what resolves and reclassifies the
residue to `judgment` with the measurement recorded — the spec §6
mechanism, exercised on its first real case.

Batch 1 therefore covers **4 catalogue rows**, not 2.

| Row | Entries | Task |
|---|---:|---|
| `bare-rtl-hebrew` | 4,190 | 5 |
| `redundant-outer-rtl-span` | 529 | 5 |
| `latin-token-inside-rtl-span` | 130 | 5 |
| `abbrev-in-alt-headwords` | 2,035 | 6 |

---

## File Structure

| File | Responsibility |
|---|---|
| `admin/pipeline/transform/types.ts` | `Rule`, `TransformRecord`, `TransformPhase` |
| `admin/pipeline/transform/html.ts` | tokenizer + serializer + Hebrew class. Shared by all 81 rules |
| `admin/pipeline/transform/no-new-text.ts` | transform-tier byte gate |
| `admin/pipeline/transform/registry.ts` | ordered rule list; coverage + entanglement gates |
| `admin/pipeline/transform/run.ts` | `applyTransforms(entry, phase)` |
| `admin/pipeline/transform/count.ts` | `bun transform:count` |
| `admin/pipeline/transform/rules/rtl.ts` | the three RTL-wrapper rows |
| `admin/pipeline/transform/rules/headwords.ts` | `abbrev-in-alt-headwords` |

Tests are colocated (`html.test.ts` beside `html.ts`), following the
`body/` convention.

---

### Task 0: Rule types and the empty registry

**Goal:** The `Rule` contract and a coverage gate that is meaningful on
day one, when zero rules exist.

**Files:**
- Create: `admin/pipeline/transform/types.ts`
- Create: `admin/pipeline/transform/registry.ts`
- Test: `admin/pipeline/transform/registry.test.ts`

**Acceptance Criteria:**
- [ ] `Rule` has no field holding an expected count
- [ ] Coverage gate lists all 81 `route: transform` rows as registered or pending
- [ ] A rule id absent from `patterns.jsonl` fails the gate
- [ ] Entangled rows must be adjacent in registry order

**Verify:** `bun test admin/pipeline/transform/registry.test.ts` → 4 pass

**Steps:**

- [ ] **Step 1: Write `types.ts`**

```ts
/**
 * The Phase 2 transform contract (spec
 * docs/specs/2026-08-22-transform-module-design.md §3.1).
 *
 * A rule carries a PREDICATE and never an expected count. Counts live
 * in the catalogue and are read only by the audit harness — a source
 * re-fetch must re-baseline an audit, never break the pipeline.
 */
import type { SourceEntry } from '../body/types.ts';

/** The two committed manifest phases a rule may run in
 * (`admin/pipeline/patch/apply.ts:55`). */
type TransformPhase = 'structural-repairs' | 'text-repairs';

/** One instance a rule changed, for the migration report. */
interface TransformRecord {
	detail: string;
	ruleId: string;
	rid: string;
}

interface Rule {
	/** Text codepoints this rule may introduce beyond the input's own
	 * bytes. Absent or empty means a strict sub-multiset. Every
	 * non-empty value is a maintainer ruling — cite it in a comment. */
	allows?: readonly string[];
	apply(entry: SourceEntry): { entry: SourceEntry; records: TransformRecord[] };
	/** Must match an `id` in data/patches/patterns.jsonl. */
	id: string;
	phase: TransformPhase;
}

export type { Rule, TransformPhase, TransformRecord };
```

- [ ] **Step 2: Write the failing registry test**

```ts
import { describe, expect, test } from 'bun:test';
import { parsePatterns } from '../research/patterns.ts';
import { coverage, PENDING, RULES } from './registry.ts';

const catalogue = parsePatterns(
	await Bun.file('data/patches/patterns.jsonl').text(),
);

describe('registry coverage', () => {
	test('every rule id exists in the catalogue', () => {
		const ids = new Set(catalogue.map((row) => row.id));
		for (const rule of RULES) {
			expect(ids).toContain(rule.id);
		}
	});

	test('every transform row is registered or explicitly pending', () => {
		const report = coverage(catalogue);
		expect(report.unaccounted).toEqual([]);
		expect(report.registered + report.pending).toBe(report.total);
	});

	test('the catalogue still holds 81 transform rows', () => {
		expect(coverage(catalogue).total).toBe(81);
	});

	test('pending ids all exist in the catalogue', () => {
		const ids = new Set(catalogue.map((row) => row.id));
		for (const id of PENDING) {
			expect(ids).toContain(id);
		}
	});
});
```

- [ ] **Step 3: Run it, expect failure**

Run: `bun test admin/pipeline/transform/registry.test.ts`
Expected: FAIL — `Cannot find module './registry.ts'`

- [ ] **Step 4: Write `registry.ts`**

`PENDING` starts as all 81 ids and shrinks as batches land. That is what
makes the gate meaningful before any rule exists: `unaccounted` is
always empty by construction, and a new catalogue row that nobody
registered or listed shows up immediately.

```ts
/**
 * The ordered rule list and the coverage gate (spec §6).
 *
 * `patterns.jsonl` is the single source of truth. A `route: transform`
 * row must be either registered here or named in PENDING; a row that is
 * neither is a silent skip, and the gate fails on it.
 */
import type { Pattern } from '../research/patterns.ts';
import type { Rule } from './types.ts';

/** Rules in execution order. Entangled rows MUST be adjacent — they own
 * the same records and will rewrite each other's work otherwise. */
const RULES: readonly Rule[] = [];

/** Catalogued transform rows with no rule yet. Shrinks batch by batch;
 * empty at the end of Phase 2. */
const PENDING: readonly string[] = [
	'bare-rtl-hebrew',
	'abbrev-in-alt-headwords',
	'ascii-quote-as-gershayim-in-body',
	// …the remaining 78 ids, generated in Step 5
];

interface Coverage {
	pending: number;
	registered: number;
	total: number;
	/** Transform rows that are neither registered nor pending. */
	unaccounted: string[];
}

function coverage(catalogue: readonly Pattern[]): Coverage {
	const rows = catalogue.filter(
		(row) => row.route === 'transform' && row.status === 'candidate',
	);
	const known = new Set([...RULES.map((rule) => rule.id), ...PENDING]);
	const registered = new Set(RULES.map((rule) => rule.id));
	return {
		pending: rows.filter((row) => !registered.has(row.id)).length,
		registered: rows.filter((row) => registered.has(row.id)).length,
		total: rows.length,
		unaccounted: rows.filter((row) => !known.has(row.id)).map((row) => row.id),
	};
}

/** Entangled rows own the same records; a gap between them in
 * execution order means one rewrites the other's output. */
function checkAdjacency(catalogue: readonly Pattern[]): string[] {
	const index = new Map(RULES.map((rule, at) => [rule.id, at]));
	const problems: string[] = [];
	for (const row of catalogue) {
		const at = index.get(row.id);
		if (at === undefined) {
			continue;
		}
		for (const partner of row.entangledWith ?? []) {
			const other = index.get(partner);
			if (other !== undefined && Math.abs(other - at) > 1) {
				problems.push(`${row.id} and ${partner} are ${Math.abs(other - at)} apart`);
			}
		}
	}
	return problems;
}

export type { Coverage };
export { checkAdjacency, coverage, PENDING, RULES };
```

- [ ] **Step 5: Generate the real PENDING list**

```bash
bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
const r = parsePatterns(await Bun.file("data/patches/patterns.jsonl").text());
const ids = r.filter(p => p.route === "transform" && p.status === "candidate").map(p => p.id);
console.log(ids.map(i => `\t${JSON.stringify(i)},`).join("\n"));
console.error(`${ids.length} ids`);'
```

Paste the output into `PENDING`. Expect `81 ids` on stderr.

- [ ] **Step 6: Run tests, expect pass**

Run: `bun test admin/pipeline/transform/registry.test.ts`
Expected: 4 pass

- [ ] **Step 7: Commit**

```bash
bun qa && git add admin/pipeline/transform/ && git commit -s -m "🦄 new(transform): rule contract and coverage gate"
```

---

### Task 1: The HTML token stream

**Goal:** A dependency-free tokenizer that every rule reads, tracking
`dir="rtl"` ancestry, round-tripping the corpus byte-for-byte.

**Files:**
- Create: `admin/pipeline/transform/html.ts`
- Test: `admin/pipeline/transform/html.test.ts`

**Acceptance Criteria:**
- [ ] `serialize(tokenize(s)) === s` for all 44,668 corpus definitions
- [ ] Text tokens report whether an ancestor carries `dir="rtl"`
- [ ] The Hebrew class matches Hebrew and rejects `—`, `ᵃ`, `'`, `(`
- [ ] `hebrewRuns()` finds Hebrew runs *inside* a mixed text node

**Verify:** `bun test admin/pipeline/transform/html.test.ts` → 6 pass

**Steps:**

- [ ] **Step 1: Write the failing test**

The round-trip test walks the real corpus. It is the load-bearing one:
every rule mutates tokens and re-serializes, so a lossy tokenizer
corrupts 32,512 entries silently.

```ts
import { describe, expect, test } from 'bun:test';
import { HEBREW, hebrewRuns, serialize, tokenize } from './html.ts';

describe('tokenize', () => {
	test('round-trips a nested definition byte-for-byte', () => {
		const html = 'quote <a href="/x">Ber. 2ᵃ</a> <span dir="rtl">שָׁלוֹם</span>.';
		expect(serialize(tokenize(html))).toBe(html);
	});

	test('marks text inside dir=rtl and outside it', () => {
		const tokens = tokenize('a <span dir="rtl">שָׁלוֹם</span> b');
		const texts = tokens.filter((t) => t.kind === 'text');
		expect(texts.map((t) => t.rtl)).toEqual([false, true, false]);
	});

	test('rtl is inherited through nesting', () => {
		const tokens = tokenize('<span dir="rtl">א<i>g</i>ב</span>');
		expect(tokens.filter((t) => t.kind === 'text').every((t) => t.rtl)).toBe(true);
	});
});

describe('HEBREW', () => {
	// The audit's near-miss: a pasted literal class decomposed יִ into
	// yod + hiriq and produced U+05B4–U+FB4F, swallowing em-dashes and
	// superscripts. This test is that bug, frozen.
	test('rejects the lookalikes the decomposed class swallowed', () => {
		for (const ch of ['—', 'ᵃ', "'", '(', '"', 'a', '1']) {
			expect(new RegExp(`[${HEBREW}]`, 'u').test(ch)).toBe(false);
		}
	});

	test('accepts letters, points and geresh', () => {
		for (const ch of ['א', 'ת', 'ִ', '׳', '״']) {
			expect(new RegExp(`[${HEBREW}]`, 'u').test(ch)).toBe(true);
		}
	});
});

describe('hebrewRuns', () => {
	test('delimits the run inside a mixed node', () => {
		expect(hebrewRuns('cmp. שָׁלוֹם a. fr.')).toEqual([
			{ end: 12, start: 5 },
		]);
	});
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `bun test admin/pipeline/transform/html.test.ts`
Expected: FAIL — `Cannot find module './html.ts'`

- [ ] **Step 3: Write `html.ts`**

```ts
/**
 * Minimal HTML token stream for the Phase 2 transforms (spec §3).
 *
 * Definitions are flat, hand-authored markup — spans, anchors, italics,
 * superscripts. A tokenizer is the right tool rather than a regex
 * because rules need `dir="rtl"` ANCESTRY, and rather than a library
 * because this repository carries zero runtime dependencies.
 *
 * The contract every rule relies on: `serialize(tokenize(s)) === s`.
 */

// Hoisted per lint/performance/useTopLevelRegex.
const TAG = /<\/?[a-zA-Z][^>]*>/gu;
const TAG_NAME = /^<\/?([a-zA-Z][a-zA-Z0-9]*)/u;
const DIR_RTL = /\bdir\s*=\s*(?<q>["']?)rtl\k<q>/u;

/**
 * Hebrew, built from explicit ranges — NEVER a pasted literal class.
 * A literal `יִ` decomposes to yod + hiriq, and a pasted range built
 * from one silently becomes U+05B4–U+FB4F, which swallows em-dashes,
 * superscript letters and curly quotes (catalogue audit,
 * data/patches/catalogue-audit/bare-rtl-hebrew.md).
 *
 * U+0591–U+05C7 points and accents · U+05D0–U+05EA letters (final
 * forms included) · U+05F3–U+05F4 geresh and gershayim ·
 * U+FB1D–U+FB4F presentation forms.
 */
const HEBREW = '\\u0591-\\u05C7\\u05D0-\\u05EA\\u05F3-\\u05F4\\uFB1D-\\uFB4F';
const HEBREW_RUN = new RegExp(`[${HEBREW}]+(?:[ \\u00A0][${HEBREW}]+)*`, 'gu');

interface TextToken {
	kind: 'text';
	/** An ancestor element carries dir="rtl". */
	rtl: boolean;
	value: string;
}

interface TagToken {
	close: boolean;
	kind: 'tag';
	name: string;
	/** An ancestor element carries dir="rtl" (the tag's own dir does
	 * not count — an opening rtl span is itself `false`). */
	rtl: boolean;
	value: string;
}

type Token = TagToken | TextToken;

/** Split markup into text and tag tokens, resolving `dir="rtl"`
 * ancestry with a tag stack. Unbalanced markup does not throw: a stray
 * close pops nothing, which keeps a damaged entry tokenizable — the
 * damage is what the rules are here to find. */
function tokenize(html: string): Token[] {
	const tokens: Token[] = [];
	const stack: boolean[] = [];
	let at = 0;
	TAG.lastIndex = 0;
	let match = TAG.exec(html);
	const depth = (): boolean => stack.some(Boolean);
	while (match !== null) {
		if (match.index > at) {
			tokens.push({ kind: 'text', rtl: depth(), value: html.slice(at, match.index) });
		}
		const value = match[0];
		const close = value.startsWith('</');
		const name = (TAG_NAME.exec(value)?.[1] ?? '').toLowerCase();
		tokens.push({ close, kind: 'tag', name, rtl: depth(), value });
		if (close) {
			stack.pop();
		} else if (!value.endsWith('/>')) {
			stack.push(DIR_RTL.test(value));
		}
		at = match.index + value.length;
		match = TAG.exec(html);
	}
	if (at < html.length) {
		tokens.push({ kind: 'text', rtl: depth(), value: html.slice(at) });
	}
	return tokens;
}

/** Inverse of `tokenize`. Byte-exact on unmodified streams. */
function serialize(tokens: readonly Token[]): string {
	return tokens.map((token) => token.value).join('');
}

/** Maximal Hebrew runs within one text value, as [start, end) offsets.
 * Interior single spaces between Hebrew tokens stay inside the run;
 * 4,691 of 5,679 bare nodes mix Hebrew and Latin, so a rule must wrap
 * the RUN, never the node. */
function hebrewRuns(value: string): { end: number; start: number }[] {
	const runs: { end: number; start: number }[] = [];
	HEBREW_RUN.lastIndex = 0;
	let match = HEBREW_RUN.exec(value);
	while (match !== null) {
		runs.push({ end: match.index + match[0].length, start: match.index });
		match = HEBREW_RUN.exec(value);
	}
	return runs;
}

export type { TagToken, TextToken, Token };
export { HEBREW, hebrewRuns, serialize, tokenize };
```

- [ ] **Step 4: Run unit tests, expect pass**

Run: `bun test admin/pipeline/transform/html.test.ts`
Expected: 6 pass

- [ ] **Step 5: Prove the round-trip on the whole corpus**

This is a script, not a unit test — it reads 32,512 entries and takes a
few seconds. Run it once here and again in Task 7.

```bash
bun -e 'import {readSourceEntries} from "./admin/pipeline/body/source.ts";
import {serialize, tokenize} from "./admin/pipeline/transform/html.ts";
let n = 0, bad = 0;
const walk = (senses) => { for (const s of senses) {
  if (s.definition) { n++; if (serialize(tokenize(s.definition)) !== s.definition) { bad++; console.log("LOSSY", s.definition.slice(0, 120)); } }
  if (s.senses) walk(s.senses); } };
for (const e of await readSourceEntries()) walk(e.content.senses);
console.log(`definitions=${n} lossy=${bad}`);'
```

Expected: `lossy=0`. **A non-zero count blocks the batch** — fix the
tokenizer before writing any rule. Record the definition count; Task 7
re-runs this and it must not move.

- [ ] **Step 6: Commit**

```bash
bun qa && git add admin/pipeline/transform/html.ts admin/pipeline/transform/html.test.ts && git commit -s -m "🦄 new(transform): html token stream with rtl ancestry"
```

---

### Task 2: The transform-tier no-new-text gate

**Goal:** Mechanically prevent a rule from inventing text, while
leaving it free to rewrite markup.

**Files:**
- Create: `admin/pipeline/transform/no-new-text.ts`
- Test: `admin/pipeline/transform/no-new-text.test.ts`

**Acceptance Criteria:**
- [ ] Adding `<span dir="rtl">` around existing text passes
- [ ] Adding the word "foo" fails
- [ ] Adding a space fails without `allows`, passes with `allows: [' ']`
- [ ] Deleting text passes (a sub-multiset is still a sub-multiset)

**Verify:** `bun test admin/pipeline/transform/no-new-text.test.ts` → 5 pass

**Steps:**

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from 'bun:test';
import { checkNoNewText } from './no-new-text.ts';

const entry = (definition: string) => ({
	content: { senses: [{ definition }] },
	headword: 'x',
	rid: 'A00001',
});

describe('checkNoNewText', () => {
	test('wrapping existing text in markup is allowed', () => {
		expect(
			checkNoNewText(entry('a שלום b'), entry('a <span dir="rtl">שלום</span> b'), {}),
		).toEqual([]);
	});

	test('unwrapping markup is allowed', () => {
		expect(
			checkNoNewText(entry('a <span dir="rtl">שלום</span> b'), entry('a שלום b'), {}),
		).toEqual([]);
	});

	test('introducing a word is rejected', () => {
		expect(checkNoNewText(entry('a b'), entry('a foo b'), {})).toHaveLength(1);
	});

	test('deleting text is allowed', () => {
		expect(checkNoNewText(entry('a b c'), entry('a c'), {})).toEqual([]);
	});

	test('a space needs a declared allowance', () => {
		expect(checkNoNewText(entry('a)<i>b'), entry('a) <i>b'), {})).toHaveLength(1);
		expect(
			checkNoNewText(entry('a)<i>b'), entry('a) <i>b'), { allows: [' '] }),
		).toEqual([]);
	});
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `bun test admin/pipeline/transform/no-new-text.test.ts`
Expected: FAIL — `Cannot find module './no-new-text.ts'`

- [ ] **Step 3: Write `no-new-text.ts`**

The patch-tier validator (`admin/pipeline/patch/no-new-text.ts`) cannot
be reused: its `flattenContent` joins definitions *including markup*
(`admin/pipeline/patch/schema.ts:579`), so re-tagging reads as inventing
text. This one strips tags first.

```ts
/**
 * Transform-tier no-new-text gate (spec §5).
 *
 * Two layers. Markup is free to change — that is what most of the 81
 * rules do. TEXT, with tags stripped, must be a sub-multiset of the
 * input's text, unless the rule declares an `allows` list.
 *
 * Every non-empty `allows` is a maintainer ruling in code. The ruling
 * of 2026-08-11 stands behind the OCR class: correcting a
 * mis-recognized glyph is correction, not composition, because the
 * glyph never was the source's content.
 */
import type { SourceEntry, SourceSense } from '../body/types.ts';
import { serialize, tokenize } from './html.ts';

/** Every definition and sense number in the entry, tags stripped. */
function textOf(entry: SourceEntry): string {
	const parts: string[] = [entry.content.morphology ?? ''];
	const walk = (senses: readonly SourceSense[]): void => {
		for (const sense of senses) {
			parts.push(sense.number ?? '');
			if (sense.definition !== undefined) {
				parts.push(
					serialize(tokenize(sense.definition).filter((t) => t.kind === 'text')),
				);
			}
			walk(sense.senses ?? []);
		}
	};
	walk(entry.content.senses);
	return parts.join('');
}

/** Codepoint → count. */
function multiset(text: string): Map<string, number> {
	const counts = new Map<string, number>();
	for (const ch of text) {
		counts.set(ch, (counts.get(ch) ?? 0) + 1);
	}
	return counts;
}

/** Codepoints the output holds beyond the input's, minus the rule's
 * declared allowance. Empty means the rule invented nothing. */
function checkNoNewText(
	before: SourceEntry,
	after: SourceEntry,
	rule: { allows?: readonly string[] },
): string[] {
	const permitted = new Set((rule.allows ?? []).flatMap((s) => [...s]));
	const input = multiset(textOf(before));
	const problems: string[] = [];
	for (const [ch, count] of multiset(textOf(after))) {
		if (count > (input.get(ch) ?? 0) && !permitted.has(ch)) {
			problems.push(
				`${after.rid}: introduced ${JSON.stringify(ch)} (U+${ch.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')})`,
			);
		}
	}
	return problems;
}

export { checkNoNewText, textOf };
```

- [ ] **Step 4: Run tests, expect pass**

Run: `bun test admin/pipeline/transform/no-new-text.test.ts`
Expected: 5 pass

- [ ] **Step 5: Commit**

```bash
bun qa && git add admin/pipeline/transform/no-new-text.ts admin/pipeline/transform/no-new-text.test.ts && git commit -s -m "🦄 new(transform): transform-tier no-new-text gate"
```

---

### Task 3: `applyTransforms` and the count harness

**Goal:** The runner rules plug into, and the audit that measures each
rule alone against the pinned snapshot — skipping when the pin is stale.

**Files:**
- Create: `admin/pipeline/transform/run.ts`
- Create: `admin/pipeline/transform/count.ts`
- Modify: `package.json` — add `"transform:count"`
- Test: `admin/pipeline/transform/run.test.ts`

**Acceptance Criteria:**
- [ ] `applyTransforms` runs only the rules matching the requested phase
- [ ] Every rule's output passes `checkNoNewText` or the run throws
- [ ] `transform:count` compares each rule alone against `corpusCount`
- [ ] A snapshot hash differing from `snapshot.lock` skips, exit 0

**Verify:** `bun test admin/pipeline/transform/run.test.ts` → 3 pass

**Steps:**

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from 'bun:test';
import type { Rule } from './types.ts';
import { applyTransforms } from './run.ts';

const entry = () => ({
	content: { senses: [{ definition: 'a b' }] },
	headword: 'x',
	rid: 'A00001',
});

const upper: Rule = {
	apply: (e) => ({
		entry: { ...e, content: { senses: [{ definition: 'a  b' }] } },
		records: [{ detail: 'spaced', rid: e.rid, ruleId: 'spacer' }],
	}),
	id: 'spacer',
	phase: 'text-repairs',
};

describe('applyTransforms', () => {
	test('skips rules from another phase', () => {
		const out = applyTransforms(entry(), 'structural-repairs', [upper]);
		expect(out.records).toEqual([]);
	});

	test('collects records from matching rules', () => {
		const allowed: Rule = { ...upper, allows: [' '] };
		const out = applyTransforms(entry(), 'text-repairs', [allowed]);
		expect(out.records).toHaveLength(1);
	});

	test('throws when a rule invents text without an allowance', () => {
		expect(() => applyTransforms(entry(), 'text-repairs', [upper])).toThrow(
			/introduced/,
		);
	});
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `bun test admin/pipeline/transform/run.test.ts`
Expected: FAIL — `Cannot find module './run.ts'`

- [ ] **Step 3: Write `run.ts`**

```ts
/**
 * The transform runner (spec §3). Applies every rule for one phase to
 * one entry, gating each rule's output on no-new-text as it goes so a
 * violation names the rule that caused it rather than surfacing as a
 * mystery diff at the end of the walk.
 */
import type { SourceEntry } from '../body/types.ts';
import { checkNoNewText } from './no-new-text.ts';
import { RULES } from './registry.ts';
import type { Rule, TransformPhase, TransformRecord } from './types.ts';

function applyTransforms(
	source: SourceEntry,
	phase: TransformPhase,
	rules: readonly Rule[] = RULES,
): { entry: SourceEntry; records: TransformRecord[] } {
	let entry = source;
	const records: TransformRecord[] = [];
	for (const rule of rules) {
		if (rule.phase !== phase) {
			continue;
		}
		const before = entry;
		const result = rule.apply(before);
		const problems = checkNoNewText(before, result.entry, rule);
		if (problems.length > 0) {
			throw new Error(`${rule.id}: ${problems.join('; ')}`);
		}
		entry = result.entry;
		records.push(...result.records);
	}
	return { entry, records };
}

export { applyTransforms };
```

- [ ] **Step 4: Run tests, expect pass**

Run: `bun test admin/pipeline/transform/run.test.ts`
Expected: 3 pass

- [ ] **Step 5: Write `count.ts`**

```ts
/**
 * The corpus-count audit (spec §4). TEST-TIER — `migrate.ts` never
 * calls this and never reads a catalogue count.
 *
 * Each rule runs ALONE against the pinned snapshot. Composed counts
 * would be meaningless: rule 40's count drifts because rules 1–39
 * already edited the text.
 *
 * When the snapshot moves, this SKIPS rather than reporting 81 false
 * mismatches. Re-pinning is a deliberate re-baseline, not a break.
 * Run: bun transform:count
 */
import { readLock, computeSnapshot } from '../patch/snapshot.ts';
import { readSourceEntries } from '../body/source.ts';
import { parsePatterns } from '../research/patterns.ts';
import { RULES } from './registry.ts';

async function main(): Promise<void> {
	const pinned = (await Bun.file('data/patches/snapshot.lock').text())
		.split('\n')[0]
		?.trim();
	const actual = `sha256:${(await computeSnapshot()).combined}`;
	if (pinned !== actual) {
		console.log(
			`pinned snapshot stale — lock ${pinned}, source ${actual}.\n` +
				'Counts are measured against the pinned corpus; skipping.\n' +
				'Re-baseline deliberately, then re-run.',
		);
		return;
	}
	const catalogue = new Map(
		parsePatterns(await Bun.file('data/patches/patterns.jsonl').text()).map(
			(row) => [row.id, row],
		),
	);
	const entries = await readSourceEntries();
	let mismatches = 0;
	for (const rule of RULES) {
		let hit = 0;
		for (const entry of entries) {
			if (rule.apply(entry).records.length > 0) {
				hit++;
			}
		}
		const expected = catalogue.get(rule.id)?.corpusCount ?? -1;
		const delta = hit - expected;
		const verdict = delta === 0 ? 'MATCH' : `DELTA ${delta > 0 ? '+' : ''}${delta}`;
		if (delta !== 0) {
			mismatches++;
		}
		console.log(`${rule.id.padEnd(38)} measured=${String(hit).padStart(5)} catalogued=${String(expected).padStart(5)}  ${verdict}`);
	}
	console.log(`\n${RULES.length} rule(s), ${mismatches} mismatch(es).`);
	if (mismatches > 0) {
		console.log(
			'A mismatch is a FINDING, not a failure to suppress: correct the\n' +
				"row's corpusCount and reason in patterns.jsonl, or reclassify it.",
		);
	}
}

await main();
```

Note: `readLock` is imported above only if `snapshot.ts` exports it —
check with `grep -n "export" admin/pipeline/patch/snapshot.ts`. If it
does, replace the manual first-line parse with it; if not, drop the
import. The manual parse is correct either way, since `buildLock` writes
the combined hash on line 1 (`admin/pipeline/patch/snapshot.ts:84`).

- [ ] **Step 6: Add the script and run it**

```bash
python3 - <<'PY'
import json, pathlib
p = pathlib.Path('package.json'); d = json.loads(p.read_text())
d['scripts']['transform:count'] = 'bun admin/pipeline/transform/count.ts'
d['scripts'] = dict(sorted(d['scripts'].items()))
p.write_text(json.dumps(d, indent='\t') + '\n')
PY
bun transform:count
```

Expected: `0 rule(s), 0 mismatch(es).` — the registry is still empty.

- [ ] **Step 7: Commit**

```bash
bun qa && git add admin/pipeline/transform/ package.json && git commit -s -m "🦄 new(transform): runner and corpus-count audit"
```

---

### Task 4: Record the RTL entanglement in the catalogue

**Goal:** Move the three-way RTL entanglement out of audit prose and
into the `entangledWith` field the registry gate actually reads.

**Files:**
- Modify: `data/patches/patterns.jsonl` (3 rows)

**Acceptance Criteria:**
- [ ] All three rows list the other two in `entangledWith`
- [ ] `checkEntanglement()` reports the graph symmetric
- [ ] No other field on any row changes

**Verify:** `bun test admin/pipeline/research/patterns.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Confirm the field is currently empty**

```bash
bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
const ids = ["bare-rtl-hebrew","redundant-outer-rtl-span","latin-token-inside-rtl-span"];
for (const p of parsePatterns(await Bun.file("data/patches/patterns.jsonl").text()))
  if (ids.includes(p.id)) console.log(p.id, JSON.stringify(p.entangledWith ?? null));'
```

Expected: three `null` lines. The audit report states the entanglement
in prose (`data/patches/catalogue-audit/bare-rtl-hebrew.md`, "Overlap"):
"Any Phase 2 transform should be written against all three at once, or
it will trade one for another."

- [ ] **Step 2: Write the edge, preserving row order and formatting**

`renderPatterns()` is the writer — use it, do not hand-edit the JSONL,
so key ordering stays canonical.

```bash
bun -e 'import {parsePatterns, renderPatterns} from "./admin/pipeline/research/patterns.ts";
const trio = ["bare-rtl-hebrew","redundant-outer-rtl-span","latin-token-inside-rtl-span"];
const rows = parsePatterns(await Bun.file("data/patches/patterns.jsonl").text())
  .map(p => trio.includes(p.id) ? {...p, entangledWith: trio.filter(t => t !== p.id)} : p);
await Bun.write("data/patches/patterns.jsonl", renderPatterns(rows));'
git diff --stat data/patches/patterns.jsonl
```

Expected: 3 lines changed.

- [ ] **Step 3: Verify symmetry and that nothing else moved**

```bash
bun -e 'import {parsePatterns, checkEntanglement} from "./admin/pipeline/research/patterns.ts";
const rows = parsePatterns(await Bun.file("data/patches/patterns.jsonl").text());
console.log("asymmetric:", checkEntanglement(rows));'
bun test admin/pipeline/research/patterns.test.ts
```

Expected: `asymmetric: []`, tests pass.

- [ ] **Step 4: Commit**

```bash
git add data/patches/patterns.jsonl && git commit -s -m "🌈 improve(patterns): record the rtl wrapper entanglement"
```

---

### Task 5: The RTL wrapper family — three rows, one edit

**Goal:** One rule module owning every `dir="rtl"` decision, so the
three inverse failures cannot be traded for one another.

**Files:**
- Create: `admin/pipeline/transform/rules/rtl.ts`
- Test: `admin/pipeline/transform/rules/rtl.test.ts`
- Modify: `admin/pipeline/transform/registry.ts` — register 3, unpend 3

**Acceptance Criteria:**
- [ ] `bare-rtl-hebrew` wraps runs *inside* mixed text nodes, never the node
- [ ] The sub-lemma header `—<Hebrew> <i>gloss</i>` is left bare
- [ ] `redundant-outer-rtl-span` unwraps an outer span holding inner rtl
- [ ] `latin-token-inside-rtl-span` moves a trailing Roman numeral out
- [ ] `bun transform:count` reports all three, deltas recorded

**Verify:** `bun test admin/pipeline/transform/rules/rtl.test.ts` → 8 pass

**Steps:**

- [ ] **Step 1: Write the failing tests**

Fixtures are real entries named in the audit's sample read.

```ts
import { describe, expect, test } from 'bun:test';
import { bareRtlHebrew, latinTokenInsideRtl, redundantOuterRtl } from './rtl.ts';

const entry = (definition: string) => ({
	content: { senses: [{ definition }] },
	headword: 'x',
	rid: 'A00001',
});
const out = (rule: typeof bareRtlHebrew, definition: string) =>
	rule.apply(entry(definition)).entry.content.senses[0]?.definition;

describe('bareRtlHebrew', () => {
	test('wraps a quotation after a citation anchor', () => {
		expect(out(bareRtlHebrew, '<a href="/x">Ber. 2ᵃ</a> שָׁלוֹם')).toBe(
			'<a href="/x">Ber. 2ᵃ</a> <span dir="rtl">שָׁלוֹם</span>',
		);
	});

	test('wraps the run, not the node, when Hebrew and Latin share one node', () => {
		// 4,691 of 5,679 bare nodes are mixed; wrapping the node whole
		// would drag "cmp." and "a. fr." into an RTL context.
		expect(out(bareRtlHebrew, '<a href="/x">Ib.</a> cmp. שָׁלוֹם a. fr.')).toBe(
			'<a href="/x">Ib.</a> cmp. <span dir="rtl">שָׁלוֹם</span> a. fr.',
		);
	});

	test('wraps an etymology parenthetical', () => {
		expect(out(bareRtlHebrew, '(cmp. דֵּיצָא)')).toBe(
			'(cmp. <span dir="rtl">דֵּיצָא</span>)',
		);
	});

	test('leaves the sub-lemma header bare — 473 bare against 0 wrapped', () => {
		const header = '—נ׳ ימא <i>sea-farers</i>';
		expect(out(bareRtlHebrew, header)).toBe(header);
	});

	test('leaves already-wrapped Hebrew alone', () => {
		const wrapped = '<span dir="rtl">שָׁלוֹם</span>';
		expect(out(bareRtlHebrew, wrapped)).toBe(wrapped);
	});
});

describe('redundantOuterRtl', () => {
	test('unwraps an outer span whose content already carries rtl', () => {
		expect(
			out(redundantOuterRtl, '<span dir="rtl">a <span dir="rtl">שלום</span></span>'),
		).toBe('a <span dir="rtl">שלום</span>');
	});

	test('leaves a lone rtl span alone', () => {
		const lone = '<span dir="rtl">שלום</span>';
		expect(out(redundantOuterRtl, lone)).toBe(lone);
	});
});

describe('latinTokenInsideRtl', () => {
	test('moves a trailing Roman numeral outside the span', () => {
		expect(out(latinTokenInsideRtl, '<span dir="rtl">שלום II</span>')).toBe(
			'<span dir="rtl">שלום</span> II',
		);
	});
});
```

- [ ] **Step 2: Run them, expect failure**

Run: `bun test admin/pipeline/transform/rules/rtl.test.ts`
Expected: FAIL — `Cannot find module './rtl.ts'`

- [ ] **Step 3: Write `rules/rtl.ts`**

```ts
/**
 * The dir="rtl" wrapper family — three catalogue rows written as one
 * module because they are the same decision seen from three sides:
 * a run that should be wrapped and is not (bare-rtl-hebrew, 4,190), a
 * wrapper that should not be there (redundant-outer-rtl-span, 529), and
 * a wrapper that reaches too far (latin-token-inside-rtl-span, 130).
 *
 * The audit is explicit: "Any Phase 2 transform should be written
 * against all three at once, or it will trade one for another"
 * (data/patches/catalogue-audit/bare-rtl-hebrew.md).
 *
 * None of the three declares an `allows`. They move wrappers; the text
 * bytes are untouched.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { HEBREW, hebrewRuns, serialize, tokenize } from '../html.ts';
import type { TagToken, Token } from '../html.ts';
import type { Rule, TransformRecord } from '../types.ts';

// Hoisted per lint/performance/useTopLevelRegex.
const ROMAN_TAIL = new RegExp(`(?<=[${HEBREW}])\\s+(?<roman>[IVX]+)\\s*$`, 'u');
const EM_DASH_HEAD = /^\s*—/u;

/** Rewrite every definition in the entry, collecting a record per
 * changed definition. The shared shape of all three rules. */
function overDefinitions(
	entry: SourceEntry,
	ruleId: string,
	rewrite: (definition: string) => string,
): { entry: SourceEntry; records: TransformRecord[] } {
	const records: TransformRecord[] = [];
	const walk = (senses: readonly SourceSense[]): SourceSense[] =>
		senses.map((sense) => {
			const next =
				sense.definition === undefined ? undefined : rewrite(sense.definition);
			if (next !== undefined && next !== sense.definition) {
				records.push({ detail: next, rid: entry.rid, ruleId });
			}
			return {
				...sense,
				...(next === undefined ? {} : { definition: next }),
				...(sense.senses === undefined ? {} : { senses: walk(sense.senses) }),
			};
		});
	const senses = walk(entry.content.senses);
	return {
		entry: records.length === 0 ? entry : { ...entry, content: { ...entry.content, senses } },
		records,
	};
}

/**
 * The sub-lemma header `—<Hebrew phrase> <i>gloss</i>`: Jastrow's way
 * of introducing a sub-entry. The corpus writes it bare 473 times
 * against 0 wrapped, and none of the 606 distinct header strings
 * appears wrapped anywhere else. It is a construct with its own rule,
 * not an omission — wrapping it would invent markup the source uses
 * nowhere in that position.
 */
function isSubLemmaHeader(tokens: readonly Token[], at: number): boolean {
	const token = tokens[at];
	if (token?.kind !== 'text') {
		return false;
	}
	const first = at === 0 || tokens[at - 1]?.kind !== 'text';
	if (!(first && EM_DASH_HEAD.test(token.value))) {
		return false;
	}
	const next = tokens[at + 1];
	return next?.kind === 'tag' && next.name === 'i' && !next.close;
}

/** Wrap bare Hebrew runs in the slots where the corpus demonstrably
 * wraps (9.0%–20.3% bare), leaving the sub-lemma construct alone. */
const bareRtlHebrew: Rule = {
	apply: (entry) =>
		overDefinitions(entry, 'bare-rtl-hebrew', (definition) => {
			const tokens = tokenize(definition);
			return serialize(
				tokens.map((token, at) => {
					if (token.kind !== 'text' || token.rtl || isSubLemmaHeader(tokens, at)) {
						return token;
					}
					const runs = hebrewRuns(token.value);
					if (runs.length === 0) {
						return token;
					}
					let value = '';
					let cursor = 0;
					for (const run of runs) {
						value += token.value.slice(cursor, run.start);
						value += `<span dir="rtl">${token.value.slice(run.start, run.end)}</span>`;
						cursor = run.end;
					}
					return { ...token, value: value + token.value.slice(cursor) };
				}),
			);
		}),
	id: 'bare-rtl-hebrew',
	phase: 'text-repairs',
};

/** Drop an outer `<span dir=rtl>` whose content already carries an
 * inner rtl element — the wrapper is doing nothing the inner one is
 * not already doing, and it defeats run-level bidi isolation. */
const redundantOuterRtl: Rule = {
	apply: (entry) =>
		overDefinitions(entry, 'redundant-outer-rtl-span', (definition) => {
			const tokens = tokenize(definition);
			const drop = new Set<number>();
			const stack: number[] = [];
			for (const [at, token] of tokens.entries()) {
				if (token.kind !== 'tag') {
					continue;
				}
				if (token.close) {
					const open = stack.pop();
					if (open !== undefined && drop.has(open)) {
						drop.add(at);
					}
					continue;
				}
				if (token.value.endsWith('/>')) {
					continue;
				}
				// An rtl open tag already inside rtl context is redundant by
				// definition; an outer one is redundant when it contains one.
				if (!token.rtl && /\bdir\s*=\s*(["']?)rtl\1/u.test(token.value)) {
					const closesAt = tokens.findIndex(
						(t, i) => i > at && t.kind === 'tag' && t.close && t.name === token.name,
					);
					const inner = tokens
						.slice(at + 1, closesAt === -1 ? undefined : closesAt)
						.some((t) => t.kind === 'tag' && !t.close && /\bdir\s*=\s*(["']?)rtl\1/u.test(t.value));
					if (inner) {
						drop.add(at);
					}
				}
				stack.push(at);
			}
			return serialize(tokens.filter((_, at) => !drop.has(at)));
		}),
	id: 'redundant-outer-rtl-span',
	phase: 'text-repairs',
};

/** Move a trailing Latin token — always a Roman homograph numeral —
 * out of the rtl span that swallowed it. Inside the span, bidi orders
 * "II" against the Hebrew and the numeral lands on the wrong side. */
const latinTokenInsideRtl: Rule = {
	apply: (entry) =>
		overDefinitions(entry, 'latin-token-inside-rtl-span', (definition) => {
			const tokens = tokenize(definition);
			const out: string[] = [];
			for (const [at, token] of tokens.entries()) {
				const closer = tokens[at + 1];
				const swallowed =
					token.kind === 'text' &&
					token.rtl &&
					closer?.kind === 'tag' &&
					closer.close;
				const match = swallowed ? ROMAN_TAIL.exec(token.value) : null;
				if (match === null) {
					out.push(token.value);
					continue;
				}
				// Emit the text without its tail, then the closing tag, then
				// the numeral — the token order that puts it outside the span.
				out.push(token.value.slice(0, match.index));
				out.push(closer?.value ?? '');
				out.push(` ${match.groups?.roman ?? ''}`);
				tokens.splice(at + 1, 1, { ...(closer as TagToken), value: '' });
			}
			return out.join('');
		}),
	id: 'latin-token-inside-rtl-span',
	phase: 'text-repairs',
};

export { bareRtlHebrew, latinTokenInsideRtl, redundantOuterRtl };
```

- [ ] **Step 4: Run tests until green**

Run: `bun test admin/pipeline/transform/rules/rtl.test.ts`
Expected: 8 pass

- [ ] **Step 5: Register all three, adjacent, and unpend them**

In `registry.ts`, import the three rules and set:

```ts
const RULES: readonly Rule[] = [
	// Adjacent by requirement — the three are entangled (Task 4).
	bareRtlHebrew,
	redundantOuterRtl,
	latinTokenInsideRtl,
];
```

Remove those three ids from `PENDING`.

- [ ] **Step 6: Audit the counts**

```bash
bun test admin/pipeline/transform/registry.test.ts
bun transform:count
```

Expected: registry tests pass (`registered + pending === 81`, adjacency
clean). `transform:count` prints three rows. **Deltas are expected on
the two unaudited rows** — they have no recorded derivation behind their
counts. Record whatever it prints; Step 7 decides what to do.

- [ ] **Step 7: Resolve each delta on the record**

For each of the three rows:

| Delta | Action |
|---|---|
| 0 | nothing — the predicate reproduces the catalogue |
| non-zero, predicate wrong | fix the rule, re-run |
| non-zero, predicate right | update `corpusCount` **and** write a `reason` recording the derivation, via `renderPatterns()` as in Task 4 Step 2 |
| predicate needs per-entry judgment | set `route: 'judgment'` with a `reason`, drop the rule, leave the id out of both `RULES` and `PENDING` |

`bare-rtl-hebrew` is audited and should land at or very near 4,190; a
large delta there means the slot classification is wrong, not the count.

- [ ] **Step 8: Commit**

```bash
bun qa && git add admin/pipeline/transform/ data/patches/patterns.jsonl && git commit -s -m "🦄 new(transform): the rtl wrapper family"
```

---

### Task 6: `abbrev-in-alt-headwords` — transform what resolves, reclassify the rest

**Goal:** Expand the geresh-truncated alt-headword stubs whose tail the
anchor rule resolves uniquely, and move the unresolvable residue to
`judgment` with the measurement recorded.

**Files:**
- Create: `admin/pipeline/transform/rules/headwords.ts`
- Test: `admin/pipeline/transform/rules/headwords.test.ts`
- Modify: `admin/pipeline/transform/registry.ts`
- Modify: `data/patches/patterns.jsonl`

**Acceptance Criteria:**
- [ ] A uniquely-resolvable stub expands (`רִי׳` → `רִיבְדָּא`)
- [ ] An ambiguous stub is left untouched, not guessed
- [ ] A parenthesized stub is unwrapped before expansion (88 members)
- [ ] Gershayim U+05F4 acronyms are never touched (16 genuine lexemes)
- [ ] The residue is measured and its disposition committed

**Verify:** `bun test admin/pipeline/transform/rules/headwords.test.ts` → 6 pass

**Steps:**

- [ ] **Step 1: Re-measure resolvability before writing the rule**

The audit says the simplest anchor rule — locate the stub's final
consonant in the headword — is unique for only 1,468 of 2,241 stubs
(65.5%). Reproduce that before committing to it.

```bash
bun -e 'import {readSourceEntries} from "./admin/pipeline/body/source.ts";
const GER = "׳";
let total = 0, unique = 0, absent = 0, ambiguous = 0, noTail = 0;
for (const e of await readSourceEntries()) for (const alt of e.alt_headwords ?? []) {
  if (!alt.includes(GER)) continue;
  total++;
  const stub = alt.replace(/[()׳]/gu, "");
  const last = [...stub].filter(c => /[א-ת]/u.test(c)).at(-1);
  if (last === undefined) { noTail++; continue; }
  const hits = [...e.headword].reduce((a, c, i) => c === last ? [...a, i] : a, []);
  if (hits.length === 0) absent++;
  else if (hits.length > 1) ambiguous++;
  else unique++;
}
console.log({total, unique, absent, ambiguous, noTail, rate: (unique/total*100).toFixed(1)});'
```

Expected, from the audit: `total≈2485` (geresh occurrences before the
phrase-lemma carve-out), `unique≈1468`, `absent≈527`, `ambiguous≈220`,
`noTail≈26`, rate ≈ 65.5%. **If the rate differs by more than a few
points, stop and reconcile with
`data/patches/catalogue-audit/abbrev-in-alt-headwords.md` before
writing the rule** — the measurement, not the rule, is what is wrong.

- [ ] **Step 2: Write the failing tests**

```ts
import { describe, expect, test } from 'bun:test';
import { abbrevInAltHeadwords } from './headwords.ts';

const entry = (headword: string, alts: string[]) => ({
	alt_headwords: alts,
	content: { senses: [] },
	headword,
	rid: 'R00001',
});
const alts = (headword: string, list: string[]) =>
	abbrevInAltHeadwords.apply(entry(headword, list)).entry.alt_headwords;

describe('abbrevInAltHeadwords', () => {
	test('expands a uniquely-anchored stub', () => {
		expect(alts('רִיבְדָּא', ['רִי׳'])).toEqual(['רִיבְדָּא']);
	});

	test('unwraps a parenthesized stub before expanding', () => {
		expect(alts('אֲגִיחָא', ['(אֲגִיח׳)'])).toEqual(['אֲגִיחָא']);
	});

	test('leaves an ambiguous stub untouched rather than guessing', () => {
		// Final consonant appears twice in the headword — no unique anchor.
		expect(alts('בָּבָא', ['בָּ׳'])).toEqual(['בָּ׳']);
	});

	test('leaves a stub whose final consonant is absent (ס/צ interchange)', () => {
		expect(alts('קִיצְרָא', ['קִיס׳'])).toEqual(['קִיס׳']);
	});

	test('never touches a gershayim acronym', () => {
		// U+05F4, not U+05F3 — 16 genuine acronym lexemes, correct data.
		expect(alts('רַבָּן', ['רשב״ג'])).toEqual(['רשב״ג']);
	});

	test('preserves a Roman homograph numeral on the headword', () => {
		expect(alts('קִירְיָה II', ['קִירְ׳'])).toEqual(['קִירְיָה II']);
	});
});
```

- [ ] **Step 3: Run them, expect failure**

Run: `bun test admin/pipeline/transform/rules/headwords.test.ts`
Expected: FAIL — `Cannot find module './headwords.ts'`

- [ ] **Step 4: Write `rules/headwords.ts`**

```ts
/**
 * `abbrev-in-alt-headwords` (2,035 entries) — an alt_headwords item
 * holding a geresh-truncated spelling of the headword, unusable as a
 * lookup key.
 *
 * PARTIAL BY CONSTRUCTION. The audit is explicit: expansion "is not
 * deterministic here" — the anchor rule resolves 1,468 of 2,241 stubs
 * (65.5%). 527 have a final consonant absent from the headword (the
 * ס/צ interchange), 220 are ambiguous, 26 leave no tail. This rule
 * expands the unique cases and leaves the rest exactly as found; the
 * residue is reclassified to `judgment` in the catalogue.
 *
 * Guard: scope is geresh U+05F3 ONLY. A loose apostrophe class admits
 * 16 genuine acronym lexemes on gershayim U+05F4, which are correct
 * data a transform would corrupt.
 *
 * The `allows` list is empty: the recovered tail comes from the
 * headword, which is already in the entry, so no text is invented.
 */
import type { SourceEntry } from '../../body/types.ts';
import type { Rule, TransformRecord } from '../types.ts';

// Hoisted per lint/performance/useTopLevelRegex.
const GERESH = /׳/u;
const CONSONANT = /[א-ת]/u;
const WRAPPER = /[()׳]/gu;

/** The stub's final consonant, located in the headword. A unique hit
 * is the anchor: everything after it in the headword is the tail the
 * abbreviation elided. */
function expand(stub: string, headword: string): string | undefined {
	const bare = stub.replace(WRAPPER, '');
	const last = [...bare].filter((ch) => CONSONANT.test(ch)).at(-1);
	if (last === undefined) {
		return undefined;
	}
	const hits = [...headword].flatMap((ch, at) => (ch === last ? [at] : []));
	if (hits.length !== 1) {
		return undefined;
	}
	const anchor = hits[0] as number;
	return bare + headword.slice(anchor + 1);
}

const abbrevInAltHeadwords: Rule = {
	apply: (entry: SourceEntry) => {
		const records: TransformRecord[] = [];
		const next = (entry.alt_headwords ?? []).map((alt) => {
			if (!GERESH.test(alt)) {
				return alt;
			}
			const expanded = expand(alt, entry.headword);
			if (expanded === undefined || expanded === alt) {
				return alt;
			}
			records.push({
				detail: `${alt} → ${expanded}`,
				rid: entry.rid,
				ruleId: 'abbrev-in-alt-headwords',
			});
			return expanded;
		});
		return {
			entry: records.length === 0 ? entry : { ...entry, alt_headwords: next },
			records,
		};
	},
	id: 'abbrev-in-alt-headwords',
	phase: 'text-repairs',
};

export { abbrevInAltHeadwords, expand };
```

- [ ] **Step 5: Run tests until green**

Run: `bun test admin/pipeline/transform/rules/headwords.test.ts`
Expected: 6 pass

If the "preserves a Roman homograph numeral" test fails, the tail slice
is the cause: `headword.slice(anchor + 1)` carries ` II` through, which
is correct — 175 members carry a Roman numeral an expansion must
preserve. Fix the test's expectation, not the rule, if they disagree.

- [ ] **Step 6: Register and audit**

Add `abbrevInAltHeadwords` to `RULES` and drop its id from `PENDING`.
It is not entangled, so position does not matter; put it after the RTL
trio.

```bash
bun test admin/pipeline/transform/registry.test.ts
bun transform:count
```

Expected: a **negative delta** on `abbrev-in-alt-headwords` — the rule
fires on roughly 65% of the row's 2,035 entries. That is the designed
outcome, not a defect.

- [ ] **Step 7: Split the row on the record**

The catalogue must stop claiming a single deterministic transform covers
2,035 entries. Using `renderPatterns()` as in Task 4 Step 2:

1. Set `abbrev-in-alt-headwords.corpusCount` to the measured resolvable
   entry count.
2. Rewrite its `reason` to record the split: the measurement from Step
   1, the date, and that the residue moved.
3. Add a new row for the residue:

```json
{"blocking":true,"corpusCount":0,"description":"alt_headwords geresh stub whose elided tail the headword-anchor rule cannot recover uniquely: final consonant absent from the headword (the ס/צ interchange), ambiguous, or leaving no tail","id":"abbrev-stub-unresolvable-tail","reason":"SPLIT from abbrev-in-alt-headwords 2026-08-22 when its transform landed. Expansion is not deterministic for this subset — see data/patches/catalogue-audit/abbrev-in-alt-headwords.md. Counts from admin/pipeline/transform/rules/headwords.ts Step 1 probe.","round":1,"route":"judgment","status":"candidate"}
```

Fill `corpusCount` from the Step 1 measurement (`absent + ambiguous +
noTail`, as entries).

Add `abbrev-stub-unresolvable-tail` to neither `RULES` nor `PENDING`.
The coverage gate counts `route: transform` rows only, and the new row
is `route: judgment`, so the total stays at 81 and the gate's
`total === 81` assertion needs no edit. Re-run
`bun test admin/pipeline/transform/registry.test.ts` to confirm. If the
total moved, the new row was written with the wrong `route`.

- [ ] **Step 8: Commit**

```bash
bun qa && git add admin/pipeline/transform/ data/patches/patterns.jsonl && git commit -s -m "🦄 new(transform): expand resolvable alt-headword stubs"
```

---

### Task 7: Wire into the migration dry run

**Goal:** Prove the four rules compose with `repairs.ts` and the gates
still hold at 32,512/32,512.

**Files:**
- Modify: `admin/pipeline/body/migrate-dry.ts:197-218`
- Modify: `docs/v2/body-migration.md`

**Acceptance Criteria:**
- [ ] Transforms run after `applyRepairs`, inside `text-repairs`
- [ ] All four round-trip gates stay at 32,512/32,512
- [ ] 0 schema failures, 0 label quarantines — unchanged from baseline
- [ ] The tokenizer round-trip count is unchanged from Task 1 Step 5

**Verify:** `bun body:migrate-dry` → gates 32,512/32,512, 0 failures

**Steps:**

- [ ] **Step 1: Capture the baseline before touching anything**

```bash
bun body:migrate-dry 2>&1 | tee /tmp/migrate-before.txt | tail -20
```

Record the gate tallies, schema-failure count and quarantine count. The
bar is "unchanged", so the before-numbers are the acceptance criteria.

- [ ] **Step 2: Call `applyTransforms` inside the text-repairs phase**

In `processEntry`, the existing call is:

```ts
repaired = phases.run('text-repairs', () => applyRepairs(source));
```

Replace with — note transforms run **second**, on the healed entry, so
`repairs.ts` still sees pristine source and its exactly-once find-text
assertions hold:

```ts
repaired = phases.run('text-repairs', () => {
	const healed = applyRepairs(source);
	const transformed = applyTransforms(healed.entry, 'text-repairs');
	report.transformRecords.push(...transformed.records);
	return { entry: transformed.entry, records: healed.records };
});
```

Spec §8's containment needs no new code: the existing `try`/`catch`
already wraps the whole `phases.run('text-repairs', …)` call
(`admin/pipeline/body/migrate-dry.ts:196-205`), so a rule that throws
lands in `report.repairFailures` with its rid, the walk continues, and
`main()` rethrows after the walk. One run therefore lists every failing
entry instead of aborting at the first. Do not add a second `try` inside
the closure — it would swallow the rid context.

Add to the `Report` interface and its initializer:

```ts
transformRecords: TransformRecord[];
```

and import:

```ts
import { applyTransforms } from '../transform/run.ts';
import type { TransformRecord } from '../transform/types.ts';
```

- [ ] **Step 3: Report the transform tallies**

In `printSummary`, after the existing per-pass lines:

```ts
const byRule = new Map<string, number>();
for (const record of report.transformRecords) {
	byRule.set(record.ruleId, (byRule.get(record.ruleId) ?? 0) + 1);
}
lines.push(
	...[...byRule].map(([id, n]) => `transform ${id}: ${n} instance(s)`),
);
```

- [ ] **Step 4: Run and compare**

```bash
bun body:migrate-dry 2>&1 | tee /tmp/migrate-after.txt | tail -25
diff <(grep -E "^(entries|rejoin|units|lettered|formSection|schema)" /tmp/migrate-before.txt) \
     <(grep -E "^(entries|rejoin|units|lettered|formSection|schema)" /tmp/migrate-after.txt)
```

Expected: empty diff on the gate lines, plus new `transform …` lines.
**Any gate regression blocks the batch.** A drop in a round-trip gate
means a rule broke markup the body model depends on — bisect by
removing rules from `RULES` one at a time.

- [ ] **Step 5: Re-prove the tokenizer round-trip**

Re-run the Task 1 Step 5 script. The definition count must match what
Task 1 recorded; `lossy=0` still.

- [ ] **Step 6: Update the migration report doc**

Add a section to `docs/v2/body-migration.md` recording: the four rules,
their measured instance counts from Step 4, and the gate tallies
before/after. Transcribe the numbers — do not summarize them.

- [ ] **Step 7: Commit**

```bash
bun qa && git add admin/pipeline/body/migrate-dry.ts docs/v2/body-migration.md && git commit -s -m "🌈 improve(pipeline): run transforms in the migration dry run"
```

---

## Batch exit

Batch 1 is done when:

- [ ] `bun qa` clean
- [ ] `bun transform:count` — 4 rules, every delta zero or dispositioned
- [ ] `bun body:migrate-dry` — gates 32,512/32,512, 0 schema failures
- [ ] `PENDING` is 77 ids, `RULES` is 4
- [ ] `patterns.jsonl` records the RTL entanglement and the abbrev split
- [ ] PR opened against `v2`

Per [feedback_pre_pr_review](memory) run the full local review battery
before opening the PR — cloud CodeRabbit is skipped on this repo, so
local review is the only one.
