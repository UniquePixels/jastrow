# Transform Batch 3b Implementation Plan — italic & punctuation seams

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the 16-row italic-and-punctuation-seam family as deterministic transforms, correcting each row's count to what a stated predicate returns and routing to `judgment` the rows whose own audits say no repair exists.

**Architecture:** One shared field writer (`fields.ts`) extracted from `rules/gershayim.ts` so all of 3b's rules edit the exact field set `fieldsOf` reads. One snapshot-derived, frozen abbreviation vocabulary (`abbrev-vocab.ts`) lets the two largest rows share a single `isLabel()` predicate with opposite polarity while `Rule.apply` stays entry-local. Rules land in four modules by repair mechanism — seam move, space insertion, deletion, and the label pair — because the mechanism, not the adjacency, is what determines which gate can see the change.

**Tech Stack:** Bun, TypeScript, Biome. Existing transform module (`admin/pipeline/transform/`), `patterns.jsonl` catalogue, pinned snapshot `data/source/jastrow-dictionary.jsonl` (sha256 `4c64ff03…`).

**Global Constraints:**
- Branch `impl/phase-2-batch-3b`, off `v2` @ `bd82723`. Never commit to `main` or `v2`.
- Every commit signed off (`git commit -s`), subject ≤ 50 chars, format `<emoji> <type>(<scope>): <description>`.
- `biome check .` before every commit. Branch baseline is **116 infos, 0 errors** — a new error or warning is a regression.
- `Rule.apply` MUST treat `entry` as immutable and return a new object, or the same reference unchanged. `count.ts` freezes the corpus, so an in-place write is a `TypeError`.
- **No rule may set `allows: [' ']`.** R2 (2026-08-25, Brian): an inserted space is declared per-instance as `copied: [' ']`. `allows` is a SET (`no-new-text.ts:181`) and would uncap the budget.
- Registry order is load-bearing. Entangled rows must be gap-free adjacent; `registry.order.corpus.test.ts` asserts it against the live graph.
- Edit `patterns.jsonl` **surgically** — `renderPatterns()` reformats all 149 rows.
- Every count written into a `reason` states its unit (occurrences or entries) — spec §2.1.
- Any predicate that says "first" or "last" sense walks `sense.senses` recursively — spec §2.2.

**User decisions (already made):**
- 2026-08-25 (Brian): 3b scope is **16 rows / 3,122 instances**; the four paren/anchor seam rows stay in 3b rather than moving to batch 4.
- 2026-08-25 (Brian, R2): an inserted space is licensed with **`copied: [' ']`**, not `allows` and not a new `inserts` field.
- R1, R3, R4 proceed on the spec's §12 recommendations: freeze a snapshot-derived vocabulary with a test-tier re-derivation check; write `italic-swallows-close-paren` and `orphan-gloss-seam-period`, route `gloss-head-seam-period-doubling` and `entry-final-comma` on their recorded audits.
- 2026-08-21 (Brian, round 4): house style sends **all labels** to period-inside, overriding `Part. pass.`'s own 10-letter unanimous outside convention for 266 occurrences.

---

## File structure

| File | Responsibility | Task |
|---|---|---|
| `admin/pipeline/transform/fields.ts` | `mapFields(entry, fn)` — the one WRITER matching `fieldsOf`'s reader | 0 |
| `admin/pipeline/transform/fields.test.ts` | field-coverage parity with `fieldsOf`, immutability | 0 |
| `admin/pipeline/transform/abbrev-vocab.ts` | frozen abbreviation vocabulary + `isLabel()` | 1 |
| `admin/pipeline/transform/abbrev-vocab.corpus.test.ts` | re-derivation from the pinned snapshot | 1 |
| `admin/pipeline/transform/rules/italic-period.ts` | the entangled label pair, two rules, one predicate | 2 |
| `admin/pipeline/transform/rules/seam-space.ts` | Class B — six space-insertion rules | 3, 6 |
| `admin/pipeline/transform/rules/punct-seams.ts` | Class A — em-dash and lone-punctuation | 4 |
| `admin/pipeline/transform/rules/edge-trim.ts` | Class C — the deletions that survive audit | 5 |
| `admin/pipeline/transform/registry.ts` | register 12–13 new rules, shrink `PENDING` | 7 |
| `data/patches/patterns.jsonl` | count and route write-backs | 2, 6, 7 |
| `data/patches/catalogue-audit/*.md` | audits for the rows that move | 6 |
| `docs/v2/transform-batch-3b.md` | the batch report | 7 |

Each rules module holds rules that fail the same way, so a reviewer reading one file is holding one gate story in their head. `seam-space.ts` is the only module two tasks write to, and Task 6 appends to it rather than editing Task 3's rules.

---

### Task 0: The shared field writer

**Goal:** Extract `rules/gershayim.ts`'s private `mapEntry` into a shared `mapFields(entry, fn)` so 3b's twelve rules write the exact field set `fieldsOf` reads, and prove the reader and writer agree.

**Files:**
- Create: `admin/pipeline/transform/fields.ts`
- Create: `admin/pipeline/transform/fields.test.ts`
- Modify: `admin/pipeline/transform/rules/gershayim.ts:110-205` — delete `mapGrammar`, `mapSense`, `mapContent`, `mapQuote`, `mapEntry`; call `mapFields`
- Modify: `admin/pipeline/transform/no-new-text.ts:206` — export `stripTags`

**Acceptance Criteria:**
- [ ] `mapFields(entry, fn)` returns a NEW entry with `fn` applied to every field `fieldsOf` reads, or `undefined` when `fn` changed nothing
- [ ] The input entry is not mutated — asserted on a deeply frozen entry
- [ ] `fields.test.ts` proves reader/writer parity: for an `fn` that appends a sentinel to every field, `fieldsOf(mapFields(e, fn))` differs from `fieldsOf(e)` at EVERY index, none skipped
- [ ] `stripTags` is exported from `no-new-text.ts`
- [ ] `gershayim.ts` uses `mapFields` and its own tests pass unchanged
- [ ] `bun transform:count` reports the SAME two gershayim rows as before this task — this is a refactor with no behaviour change

**Verify:** `bun test admin/pipeline/transform/ && bun transform:count` → 737 pass / 0 fail; both gershayim rows MATCH

**Steps:**

- [ ] **Step 1: Write the failing parity test**

Create `admin/pipeline/transform/fields.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { mapFields } from './fields.ts';
import { fieldsOf } from './no-new-text.ts';
import type { SourceEntry } from '../body/types.ts';

/** An entry populated in EVERY slot `fieldsOf` walks, including a
 * nested sense — the trap recorded in the batch-3a report. */
function fullEntry(): SourceEntry {
	return {
		alt_headwords: ['alt-one', 'alt-two'],
		content: {
			morphology: 'morph',
			senses: [
				{
					definition: 'outer def',
					grammar: {
						binyan_form: ['bf-one', 'bf-two'],
						language_code: 'g-lang',
						verbal_stem: 'stem',
					},
					number: '1)',
					senses: [{ definition: 'nested def', number: 'a)' }],
				},
			],
		},
		headword: 'head',
		language_code: 'lang',
		language_reference: 'langref',
		plural_form: ['pl-one'],
		quotes: [['q-a', 'q-b', null]],
		rid: 'A00000',
	} as SourceEntry;
}

describe('mapFields', () => {
	test('touches every field fieldsOf reads', () => {
		const entry = fullEntry();
		const mapped = mapFields(entry, (text) => `${text}!`);
		expect(mapped).toBeDefined();
		const before = fieldsOf(entry);
		const after = fieldsOf(mapped as SourceEntry);
		expect(after).toHaveLength(before.length);
		const untouched = before
			.map((text, at) => ({ at, after: after[at], before: text }))
			.filter((pair) => pair.before !== '' && pair.after === pair.before);
		expect(untouched).toEqual([]);
	});

	test('returns undefined when the mapper changes nothing', () => {
		expect(mapFields(fullEntry(), (text) => text)).toBeUndefined();
	});

	test('does not mutate a frozen input', () => {
		const entry = structuredClone(fullEntry());
		deepFreeze(entry);
		expect(() => mapFields(entry, (text) => `${text}!`)).not.toThrow();
	});
});

function deepFreeze(value: unknown): void {
	if (typeof value !== 'object' || value === null) {
		return;
	}
	Object.freeze(value);
	for (const child of Object.values(value)) {
		deepFreeze(child);
	}
}
```

- [ ] **Step 2: Run it and watch it fail**

Run: `bun test admin/pipeline/transform/fields.test.ts`
Expected: FAIL — `Cannot find module './fields.ts'`

- [ ] **Step 3: Write `fields.ts`**

Create `admin/pipeline/transform/fields.ts`. This is `gershayim.ts:110-205` with the `Repair`/`Moved` pair replaced by a plain `(text: string) => string`:

```ts
/**
 * The one WRITER over the field set `no-new-text.ts`'s `fieldsOf`
 * reads.
 *
 * `fieldsOf` is the single field enumeration for READING (spec
 * §5). Until batch 3b every rule that needed to WRITE carried its
 * own walk, and `rules/gershayim.ts` was the only one that had a
 * complete one. A second, drifting copy of that walk is the exact
 * shape of the "gate cannot see it" failure batch 3a closed: a rule
 * writing a field `fieldsOf` does not read is invisible to
 * `checkNoNewText`.
 *
 * `fields.test.ts` asserts the parity rather than asserting it here
 * in a comment.
 */
import type { SourceEntry, SourceGrammar, SourceSense } from '../body/types.ts';

/** Set by `one()` the first time the mapper returns something new, so
 * `mapFields` can hand back `undefined` for an unchanged entry. */
interface Moved {
	any: boolean;
}

type Mapper = (text: string) => string;

function one(text: string, map: Mapper, moved: Moved): string {
	const out = map(text);
	if (out !== text) {
		moved.any = true;
	}
	return out;
}

function mapGrammar(
	grammar: SourceGrammar,
	map: Mapper,
	moved: Moved,
): SourceGrammar {
	const out: SourceGrammar = { ...grammar };
	if (grammar.binyan_form !== undefined) {
		out.binyan_form = grammar.binyan_form.map((v) => one(v, map, moved));
	}
	if (grammar.language_code !== undefined) {
		out.language_code = one(grammar.language_code, map, moved);
	}
	if (grammar.verbal_stem !== undefined) {
		out.verbal_stem = one(grammar.verbal_stem, map, moved);
	}
	return out;
}

function mapSense(sense: SourceSense, map: Mapper, moved: Moved): SourceSense {
	const out: SourceSense = { ...sense };
	if (sense.definition !== undefined) {
		out.definition = one(sense.definition, map, moved);
	}
	if (sense.grammar !== undefined) {
		out.grammar = mapGrammar(sense.grammar, map, moved);
	}
	if (sense.number !== undefined) {
		out.number = one(sense.number, map, moved);
	}
	if (sense.senses !== undefined) {
		out.senses = sense.senses.map((child) => mapSense(child, map, moved));
	}
	return out;
}

function mapContent(
	content: SourceEntry['content'],
	map: Mapper,
	moved: Moved,
): SourceEntry['content'] {
	const out: SourceEntry['content'] = {
		...content,
		senses: content.senses.map((sense) => mapSense(sense, map, moved)),
	};
	if (content.morphology !== undefined) {
		out.morphology = one(content.morphology, map, moved);
	}
	return out;
}

function mapQuote(
	triple: readonly (string | null)[],
	map: Mapper,
	moved: Moved,
): [string | null, string, string | null] {
	return triple.map((part) => (part === null ? null : one(part, map, moved))) as [
		string | null,
		string,
		string | null,
	];
}

/**
 * A new entry with `map` applied to every field, or `undefined` when
 * `map` returned every field unchanged — which is what lets a
 * `Rule.apply` hand back the caller's own object, as its contract
 * requires.
 */
function mapFields(entry: SourceEntry, map: Mapper): SourceEntry | undefined {
	const moved: Moved = { any: false };
	const out: SourceEntry = {
		...entry,
		content: mapContent(entry.content, map, moved),
		headword: one(entry.headword, map, moved),
	};
	if (entry.alt_headwords !== undefined) {
		out.alt_headwords = entry.alt_headwords.map((v) => one(v, map, moved));
	}
	if (entry.plural_form !== undefined) {
		out.plural_form = entry.plural_form.map((v) => one(v, map, moved));
	}
	if (entry.language_code !== undefined) {
		out.language_code = one(entry.language_code, map, moved);
	}
	if (entry.language_reference !== undefined) {
		out.language_reference = one(entry.language_reference, map, moved);
	}
	if (entry.quotes !== undefined) {
		out.quotes = entry.quotes.map((t) => mapQuote(t, map, moved));
	}
	return moved.any ? out : undefined;
}

export type { Mapper };
export { mapFields };
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test admin/pipeline/transform/fields.test.ts`
Expected: PASS, 3 tests

- [ ] **Step 5: Export `stripTags`**

In `admin/pipeline/transform/no-new-text.ts`, change the final line:

```ts
export { checkNoNewText, fieldsOf, stripTags, textOf };
```

- [ ] **Step 6: Point `gershayim.ts` at `mapFields`**

Delete `mapGrammar`, `mapSense`, `mapContent`, `mapQuote` and `mapEntry` from `rules/gershayim.ts`. `gershayim.ts`'s `repairOne(text, repair, moved)` becomes a closure over `repair`:

```ts
import { mapFields } from '../fields.ts';

// …inside build(), replacing `const healed = mapEntry(entry, repair);`
const healed = mapFields(entry, (text) => repair(text));
```

Keep `Repair`, `repairText`, `repairTags`, `tokenAt`, `repairedTokens` and `claimsFor` exactly as they are — only the walk moves.

- [ ] **Step 7: Prove the refactor changed no behaviour**

Run: `bun test admin/pipeline/transform/ && bun transform:count`
Expected: 737 pass / 0 fail (up by 3 from the new file: 740). Both gershayim rows MATCH at 1,386 and 85.

If `transform:count` moves by even one entry, STOP — the extraction changed the field set and the parity test did not catch it. Do not proceed to Task 1.

- [ ] **Step 8: Commit**

```bash
biome check .
git add admin/pipeline/transform/fields.ts admin/pipeline/transform/fields.test.ts admin/pipeline/transform/no-new-text.ts admin/pipeline/transform/rules/gershayim.ts
git commit -s -m "🌈 improve(transform): one shared field writer"
```

---

### Task 1: The frozen abbreviation vocabulary

**Goal:** Give `isLabel()` a corpus-wide fact without giving `Rule.apply` a corpus — derive the abbreviation vocabulary from the pinned snapshot, freeze it into the module, and make the derivation falsifiable with a test.

**Files:**
- Create: `admin/pipeline/transform/abbrev-vocab.ts`
- Create: `admin/pipeline/transform/abbrev-vocab.corpus.test.ts`

**Acceptance Criteria:**
- [ ] `ABBREVIATIONS` is a frozen `ReadonlySet<string>` of italic-run bodies proven to be abbreviations by the audit's own test — the token occurs MID-RUN inside an `<i>` elsewhere in the corpus
- [ ] `deriveAbbreviations(entries)` re-derives that set from a corpus
- [ ] `isLabel(body)` returns true iff the trimmed body is in `ABBREVIATIONS`
- [ ] The test asserts `deriveAbbreviations(pinned snapshot)` equals `ABBREVIATIONS` EXACTLY — same size, same members
- [ ] The frozen set contains all 20 labels the round-4 audit names, asserted individually
- [ ] The test SKIPS rather than fails when the snapshot hash has moved, matching `count.ts`'s re-baseline policy

**Verify:** `bun test admin/pipeline/transform/abbrev-vocab.corpus.test.ts` → PASS; derived set size printed and equal to the frozen size

**Steps:**

- [ ] **Step 1: Derive the vocabulary once and read it**

Run this and keep the output — it becomes the frozen constant:

```bash
bun -e '
import {readSourceEntries} from "./admin/pipeline/body/source.ts";
import {fieldsOf} from "./admin/pipeline/transform/no-new-text.ts";
// A token is an abbreviation if it appears MID-RUN inside an <i>
// followed by a period — i.e. the corpus itself treats it as an
// abbreviation somewhere, not as a sentence end.
const midRun = new Set();
const RUN = /<i>([^<>]*)<\/i>/g;
for await (const e of readSourceEntries()) {
  for (const f of fieldsOf(e)) {
    for (const m of f.matchAll(RUN)) {
      const body = m[1];
      for (const tok of body.matchAll(/([^\s.]+)\.\s/g)) midRun.add(tok[1]);
    }
  }
}
console.log(midRun.size);
console.log(JSON.stringify([...midRun].sort()));'
```

- [ ] **Step 2: Write the failing test**

Create `admin/pipeline/transform/abbrev-vocab.corpus.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { readSourceEntries } from '../body/source.ts';
import { ABBREVIATIONS, deriveAbbreviations, isLabel } from './abbrev-vocab.ts';

/** The 20 labels `label-period-outside-italic`'s round-4 audit names —
 * 7 cross-letter-unanimous conventions plus the 13 it proved to be
 * processing-batch noise. All 20 take the period INSIDE by the house
 * style ruling of 2026-08-21. */
const AUDIT_LABELS = [
	'Hif', 'Ithpa', 'Ithpe', 'Pl', 'Pi', 'Nif', 'Part. pass',
	'Pa', 'Af', 'Fem', 'pl', 'Nithpa', 'Pe', 'Hithpa', 'Du', 'Part',
	'sing', 'm', 'ḳ', 'Saf',
];

describe('abbreviation vocabulary', () => {
	test('every label the round-4 audit names is in the frozen set', () => {
		const missing = AUDIT_LABELS.filter((label) => !isLabel(label));
		expect(missing).toEqual([]);
	});

	test('re-derives from the pinned snapshot unchanged', async () => {
		const entries = [];
		for await (const entry of readSourceEntries()) {
			entries.push(entry);
		}
		const derived = deriveAbbreviations(entries);
		expect(derived.size).toBe(ABBREVIATIONS.size);
		expect([...derived].sort()).toEqual([...ABBREVIATIONS].sort());
	});

	test('isLabel trims before looking up', () => {
		expect(isLabel(' Part. pass ')).toBe(true);
	});

	test('an ordinary gloss word is not a label', () => {
		expect(isLabel('destruction')).toBe(false);
		expect(isLabel('locusts')).toBe(false);
	});
});
```

- [ ] **Step 3: Run and watch it fail**

Run: `bun test admin/pipeline/transform/abbrev-vocab.corpus.test.ts`
Expected: FAIL — `Cannot find module './abbrev-vocab.ts'`

- [ ] **Step 4: Write `abbrev-vocab.ts`**

Paste Step 1's output as `FROZEN`. The module:

```ts
/**
 * The abbreviation vocabulary, DERIVED from the pinned snapshot and
 * frozen here (batch-3b spec §4.2, ruling R1).
 *
 * `label-period-outside-italic` and `italic-swallowed-terminal-period`
 * are one predicate with two polarities: an italic run whose body is a
 * LABEL takes its terminal period inside, an ordinary word-final gloss
 * takes it outside. The discriminator the round-4 audit established is
 * corpus-wide — "the token occurs mid-run inside an <i> elsewhere in
 * the corpus" — and `Rule.apply` sees one entry.
 *
 * Rather than widen the rule interface (rejected in batch 2 as bigger
 * than the rows are worth), the fact is computed once and pinned. The
 * pinning is falsifiable: `abbrev-vocab.corpus.test.ts` re-derives from the
 * snapshot and requires an exact match, so the list cannot silently
 * drift away from the corpus it claims to describe.
 *
 * ON A SOURCE RE-FETCH this test fails. That is deliberate and it is
 * the polarity ruled at R3, but note the tension it accepts: the
 * module spec says a re-fetch must re-baseline an AUDIT and never
 * break the pipeline, and this breaks the SUITE. Re-run the derivation
 * in the test's own docstring and commit the new list — a two-minute
 * re-baseline, not a debugging session.
 */
const FROZEN: readonly string[] = [
	/* paste Step 1 output here, sorted */
];

const ABBREVIATIONS: ReadonlySet<string> = Object.freeze(new Set(FROZEN));

/** One italic run's body, as the corpus writes it. */
const RUN = /<i>([^<>]*)<\/i>/g;
/** A token inside a run that is followed by a period and more text —
 * the audit's proof that the corpus treats it as an abbreviation. */
const MID_RUN = /([^\s.]+)\.\s/g;

/** Re-derive the vocabulary from a corpus. Exported so the test can
 * falsify `FROZEN` rather than trust it. */
function deriveAbbreviations(
	entries: readonly SourceEntry[],
): ReadonlySet<string> {
	const found = new Set<string>();
	for (const entry of entries) {
		for (const field of fieldsOf(entry)) {
			for (const run of field.matchAll(RUN)) {
				for (const token of (run[1] ?? '').matchAll(MID_RUN)) {
					found.add(token[1] ?? '');
				}
			}
		}
	}
	found.delete('');
	return found;
}

/** True when this italic run's body is a grammatical or abbreviation
 * label, and therefore takes its terminal period INSIDE the italic. */
function isLabel(body: string): boolean {
	return ABBREVIATIONS.has(body.trim());
}

export { ABBREVIATIONS, deriveAbbreviations, isLabel };
```

Import `fieldsOf` from `./no-new-text.ts` and `SourceEntry` from
`../body/types.ts` at the top of the module.

- [ ] **Step 5: Run the test to verify it passes**

Run: `bun test admin/pipeline/transform/abbrev-vocab.corpus.test.ts`
Expected: PASS, 4 tests

If the first test fails with labels missing, the derivation is too narrow — a label like `Saf` may only ever appear run-final. Widen `MID_RUN` to also accept a token followed by `.` and a closing tag, re-derive, and record the widening in the module docstring.

- [ ] **Step 6: Commit**

```bash
biome check .
git add admin/pipeline/transform/abbrev-vocab.ts admin/pipeline/transform/abbrev-vocab.corpus.test.ts
git commit -s -m "🦄 new(transform): frozen abbreviation vocabulary"
```

---

### Task 2: The entangled label pair

**Goal:** Ship `label-period-outside-italic` and `italic-swallowed-terminal-period` as two rules over one `isLabel()` predicate, and write back the count correction the measurement forces.

**Files:**
- Create: `admin/pipeline/transform/rules/italic-period.ts`
- Create: `admin/pipeline/transform/rules/italic-period.corpus.test.ts`
- Modify: `data/patches/patterns.jsonl` — `label-period-outside-italic` count and `reason`

**Acceptance Criteria:**
- [ ] `labelPeriodInside` moves `<i>Af</i>.` → `<i>Af.</i>` when `isLabel(body)`
- [ ] `italicGlossPeriodOutside` moves `<i>destruction.</i>` → `<i>destruction</i>.` when `!isLabel(body)`
- [ ] Neither rule sets `allows`; both are text-multiset no-ops
- [ ] A Class-A invariant test: for every entry either rule touches, `stripTags` of every field is byte-identical before and after
- [ ] `bun transform:count` reports both rows; `label-period-outside-italic` reports its MEASURED figure, not 945
- [ ] The `label-period-outside-italic` row's `reason` gains the runnable predicate and states its unit
- [ ] The 266 `Part. pass.` occurrences ARE moved — the accepted cost of the 2026-08-21 ruling, asserted by a test naming it

**Verify:** `bun test admin/pipeline/transform/rules/italic-period.corpus.test.ts && bun transform:count` → PASS; both rows present

**Steps:**

- [ ] **Step 1: Write the failing tests**

Create `admin/pipeline/transform/rules/italic-period.corpus.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { italicGlossPeriodOutside, labelPeriodInside } from './italic-period.ts';

function entryWith(definition: string): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword: 'x',
		rid: 'A00001',
	} as SourceEntry;
}

function defOf(entry: SourceEntry): string {
	return entry.content.senses[0]?.definition ?? '';
}

describe('labelPeriodInside', () => {
	test('moves the period inside for a label', () => {
		const out = labelPeriodInside.apply(entryWith('see <i>Af</i>. and'));
		expect(defOf(out.entry)).toBe('see <i>Af.</i> and');
		expect(out.records).toHaveLength(1);
	});

	test('moves Part. pass. too — the accepted cost of the ruling', () => {
		const out = labelPeriodInside.apply(entryWith('<i>Part. pass</i>. of'));
		expect(defOf(out.entry)).toBe('<i>Part. pass.</i> of');
	});

	test('leaves an ordinary gloss alone', () => {
		const entry = entryWith('the <i>destruction</i>. of');
		expect(labelPeriodInside.apply(entry).entry).toBe(entry);
	});

	test('declares no allowance — it moves a byte, it does not add one', () => {
		expect(labelPeriodInside.allows).toBeUndefined();
	});
});

describe('italicGlossPeriodOutside', () => {
	test('moves the period outside for a gloss', () => {
		const out = italicGlossPeriodOutside.apply(
			entryWith('the <i>destruction.</i> of'),
		);
		expect(defOf(out.entry)).toBe('the <i>destruction</i>. of');
	});

	test('leaves a label alone — that is the other rule’s row', () => {
		const entry = entryWith('see <i>Af.</i> and');
		expect(italicGlossPeriodOutside.apply(entry).entry).toBe(entry);
	});

	test('leaves a single-word run that is an abbreviation alone', () => {
		const entry = entryWith('cf. <i>Pl.</i> there');
		expect(italicGlossPeriodOutside.apply(entry).entry).toBe(entry);
	});
});

describe('the pair is byte-identical in text', () => {
	test('both rules leave stripTags unchanged', () => {
		for (const [rule, def] of [
			[labelPeriodInside, 'see <i>Af</i>. and'],
			[italicGlossPeriodOutside, 'the <i>destruction.</i> of'],
		] as const) {
			const entry = entryWith(def);
			const out = rule.apply(entry);
			expect(stripTagsOf(out.entry)).toBe(stripTagsOf(entry));
		}
	});
});

function stripTagsOf(entry: SourceEntry): string {
	return defOf(entry).replaceAll(/<[^>]*>/g, '');
}
```

- [ ] **Step 2: Run and watch it fail**

Run: `bun test admin/pipeline/transform/rules/italic-period.corpus.test.ts`
Expected: FAIL — `Cannot find module './italic-period.ts'`

- [ ] **Step 3: Write `italic-period.ts`**

```ts
/**
 * The entangled label pair (batch-3b spec §4) — two rules, one
 * predicate, opposite polarities.
 *
 * House style, ruled by Brian on 2026-08-21 after the round-4
 * reconciliation: a grammatical or abbreviation LABEL takes its
 * terminal period INSIDE the italic, an ordinary word-final gloss
 * takes it OUTSIDE. The two are exhaustive over `<i>…</i>.` and
 * `<i>….</i>` and disjoint by `isLabel()`, which is why the catalogue
 * records them as entangled and why they are written together.
 *
 * ACCEPTED COST, STATED: `Part. pass.` is a genuine 10-letter
 * unanimous period-OUTSIDE convention and this ruling overrides it —
 * 266 occurrences normalised against their own attested usage. A
 * deliberate consistency-over-fidelity trade, safe only because both
 * forms strip to byte-identical text.
 */
import type { SourceEntry } from '../../body/types.ts';
import { isLabel } from '../abbrev-vocab.ts';
import { mapFields } from '../fields.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/** `<i>BODY</i>.` — period outside. */
const OUTSIDE = /<i>([^<>]*)<\/i>\./g;
/** `<i>BODY.</i>` — period inside. */
const INSIDE = /<i>([^<>]*)\.<\/i>/g;

function moveInside(text: string): string {
	return text.replaceAll(OUTSIDE, (whole, body: string) =>
		isLabel(body) ? `<i>${body}.</i>` : whole,
	);
}

function moveOutside(text: string): string {
	return text.replaceAll(INSIDE, (whole, body: string) =>
		isLabel(body) ? whole : `<i>${body}</i>.`,
	);
}

function build(id: string, move: (text: string) => string): Rule {
	return {
		apply(entry: SourceEntry): TransformResult {
			const healed = mapFields(entry, move);
			if (healed === undefined) {
				return { entry, records: [] };
			}
			const record: TransformRecord = {
				detail: 'terminal period moved across the italic boundary',
				rid: entry.rid,
				ruleId: id,
			};
			return { entry: healed, records: [record] };
		},
		id,
		phase: 'text-repairs',
	};
}

/** The label side: `<i>Af</i>.` → `<i>Af.</i>`. */
const labelPeriodInside: Rule = build('label-period-outside-italic', moveInside);

/** The gloss side: `<i>destruction.</i>` → `<i>destruction</i>.`. */
const italicGlossPeriodOutside: Rule = build(
	'italic-swallowed-terminal-period',
	moveOutside,
);

export { italicGlossPeriodOutside, labelPeriodInside };
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun test admin/pipeline/transform/rules/italic-period.corpus.test.ts`
Expected: PASS, 8 tests

- [ ] **Step 5: Measure both rows against the corpus**

```bash
bun -e '
import {readSourceEntries} from "./admin/pipeline/body/source.ts";
import {italicGlossPeriodOutside,labelPeriodInside} from "./admin/pipeline/transform/rules/italic-period.ts";
for (const rule of [labelPeriodInside, italicGlossPeriodOutside]) {
  let ent = 0;
  for await (const e of readSourceEntries()) if (rule.apply(e).records.length > 0) ent += 1;
  console.log(rule.id, ent, "entries");
}'
```

Expected: `label-period-outside-italic` ≈ **856 entries** (the spec §4.3 measurement), `italic-swallowed-terminal-period` ≈ 1,206 minus whatever `isLabel` now excludes. Record both actual figures — they go into the write-back and the batch report.

- [ ] **Step 6: Run the Class A invariant over the whole corpus**

This is spec §6 measure (1), and it is the only thing watching a
Class A rule — `checkNoNewText` is structurally blind to a byte
crossing a tag boundary, and `checkMarkup` is a delta gate that
permits pre-existing damage through.

`stripTags` equality is STRONGER than the sub-multiset gate: it is
order-sensitive, so a period moved to the wrong side of the wrong tag
fails it even though the codepoint counts still balance.

```bash
bun -e '
import {readSourceEntries} from "./admin/pipeline/body/source.ts";
import {fieldsOf, stripTags} from "./admin/pipeline/transform/no-new-text.ts";
import {italicGlossPeriodOutside, labelPeriodInside} from "./admin/pipeline/transform/rules/italic-period.ts";
for (const rule of [labelPeriodInside, italicGlossPeriodOutside]) {
  let touched = 0, broken = 0;
  for await (const e of readSourceEntries()) {
    const out = rule.apply(e);
    if (out.records.length === 0) continue;
    touched += 1;
    const before = fieldsOf(e).map(stripTags);
    const after = fieldsOf(out.entry).map(stripTags);
    if (before.length !== after.length || before.some((t, i) => t !== after[i])) {
      broken += 1;
      if (broken === 1) console.log("FIRST BREAK:", e.rid);
    }
  }
  console.log(rule.id, "touched", touched, "text-changed", broken);
}'
```

Expected: `text-changed 0` for BOTH rules. A non-zero result means the
rule is moving text, not markup — stop and fix before the write-back,
because the count you would write back would be measuring the wrong
thing.

Add this as a permanent corpus-tier test in
`italic-period.corpus.test.ts` rather than leaving it as a one-off command.

- [ ] **Step 7: Write back the corrected count**

Edit `data/patches/patterns.jsonl` surgically — the `label-period-outside-italic` row only. Set `corpusCount` to Step 5's entry figure and APPEND to `reason`:

```text
 *** BATCH 3b MEASUREMENT (2026-08-25) — COUNT CORRECTED, DIRECTION UNCHANGED. *** The catalogued 945 entries / 1,106 occurrences cannot be reproduced and the predicate that produced them is not recorded anywhere. The shipped rule's predicate — an <i>…</i> run whose trimmed body is in the snapshot-derived abbreviation vocabulary (admin/pipeline/transform/abbrev-vocab.ts), followed immediately by a period — returns <N> ENTRIES / <M> OCCURRENCES on the pinned snapshot, against <K> already period-inside. The ten labels the round-4 ruling widened to reproduce EXACTLY (Part. pass. 266, Pa. 171, Af. 123, Fem. 118, Pi. 59, Nithpa. 43, m. 32, sing. 32, Pe. 31, ḳ. 31); the gap is entirely in the other ten. UNIT: entries.
```

- [ ] **Step 8: Commit**

```bash
biome check .
bun test admin/pipeline/transform/
git add admin/pipeline/transform/rules/italic-period.ts admin/pipeline/transform/rules/italic-period.corpus.test.ts data/patches/patterns.jsonl
git commit -s -m "🦄 new(transform): the italic period label pair"
```

---

### Task 3: Class B — the five seam-space rules

**Goal:** Repair the five missing-space-at-a-tag-seam rows, each declaring its inserted space per instance with `copied: [' ']` so the gate stays a budget rather than a blanket.

**Files:**
- Create: `admin/pipeline/transform/rules/seam-space.ts`
- Create: `admin/pipeline/transform/rules/seam-space.test.ts`

**Acceptance Criteria:**
- [ ] Five rules: `anchorItalicSpace` (`</a><i>`), `parenTagSpace` (`)<i>` and `)</a><i>`), `italicParenSpace` (`</i>(`), `translitItalicSpace` (Latin word char then `<i>`), `gereshAbbrevSpace` (`׳` then a Hebrew letter)
- [ ] **No rule sets `allows`.** Each returns `copied` with one `' '` per space it inserted
- [ ] A test proves the budget is exact: a rule inserting two spaces returns `copied` of length 2
- [ ] A test proves the gate REJECTS an under-declared insertion — run `checkNoNewText` directly with a short `copied` and expect a problem
- [ ] `bun transform:count` reports all five rows
- [ ] `parenTagSpace` reports occurrences ≈ 126 (73 `)<i>` + 53 `)</a><i>`); its catalogued 126 is an OCCURRENCE count and the row's `reason` says so

**Verify:** `bun test admin/pipeline/transform/rules/seam-space.test.ts && bun transform:count` → PASS; five new rows

**Steps:**

- [ ] **Step 1: Write the failing tests**

Create `admin/pipeline/transform/rules/seam-space.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { checkNoNewText } from '../no-new-text.ts';
import {
	anchorItalicSpace,
	gereshAbbrevSpace,
	italicParenSpace,
	parenTagSpace,
	translitItalicSpace,
} from './seam-space.ts';

function entryWith(definition: string): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword: 'x',
		rid: 'A00001',
	} as SourceEntry;
}

const defOf = (e: SourceEntry): string => e.content.senses[0]?.definition ?? '';

describe('seam-space rules', () => {
	test('anchorItalicSpace opens the </a><i> seam', () => {
		const out = anchorItalicSpace.apply(entryWith('<a href="/x">preced.</a><i>Pi.</i>'));
		expect(defOf(out.entry)).toBe('<a href="/x">preced.</a> <i>Pi.</i>');
	});

	test('parenTagSpace opens both )<i> and )</a><i>', () => {
		expect(defOf(parenTagSpace.apply(entryWith('(a)<i>b</i>')).entry)).toBe(
			'(a) <i>b</i>',
		);
		expect(
			defOf(parenTagSpace.apply(entryWith('<a href="/x">(a)</a><i>b</i>')).entry),
		).toBe('<a href="/x">(a)</a> <i>b</i>');
	});

	test('italicParenSpace opens the </i>( seam', () => {
		expect(defOf(italicParenSpace.apply(entryWith('<i>a</i>(b)')).entry)).toBe(
			'<i>a</i> (b)',
		);
	});

	test('translitItalicSpace opens Arab.<i>', () => {
		expect(
			defOf(translitItalicSpace.apply(entryWith('Arab.<i>ġaḥama</i>')).entry),
		).toBe('Arab. <i>ġaḥama</i>');
	});

	test('gereshAbbrevSpace opens נ׳היא', () => {
		expect(defOf(gereshAbbrevSpace.apply(entryWith('נ׳היא')).entry)).toBe(
			'נ׳ היא',
		);
	});
});

describe('the space budget is exact, not blanket', () => {
	test('no rule sets allows', () => {
		for (const rule of [
			anchorItalicSpace,
			gereshAbbrevSpace,
			italicParenSpace,
			parenTagSpace,
			translitItalicSpace,
		]) {
			expect(rule.allows).toBeUndefined();
		}
	});

	test('two insertions declare two copies', () => {
		const out = anchorItalicSpace.apply(
			entryWith('<a href="/x">a</a><i>b</i> and <a href="/y">c</a><i>d</i>'),
		);
		expect(out.copied).toEqual([' ', ' ']);
	});

	test('the gate rejects an under-declared insertion', () => {
		const before = entryWith('<a href="/x">a</a><i>b</i> <a href="/y">c</a><i>d</i>');
		const after = anchorItalicSpace.apply(before);
		const problems = checkNoNewText(before, after.entry, anchorItalicSpace, [' ']);
		expect(problems.length).toBeGreaterThan(0);
	});
});
```

- [ ] **Step 2: Run and watch it fail**

Run: `bun test admin/pipeline/transform/rules/seam-space.test.ts`
Expected: FAIL — `Cannot find module './seam-space.ts'`

- [ ] **Step 3: Write `seam-space.ts`**

```ts
/**
 * Class B (batch-3b spec §3, §5) — six rows whose repair INSERTS a
 * space at a tag seam.
 *
 * ## Why `copied: [' ']` and never `allows: [' ']`
 *
 * Ruling R2, Brian, 2026-08-25. `Rule.allows` is a SET, not a budget:
 * `no-new-text.ts:181` builds `new Set(rule.allows.flatMap(…))` and a
 * codepoint in it is exempted from the count comparison entirely. So
 * `allows: [' ']` would license these rules to insert ANY number of
 * spaces into ANY entry, forever — a rule that repairs 111 seams and a
 * rule that pads every field to 80 columns would pass the same gate.
 *
 * `TransformResult.copied` is credited as a MULTISET and verified to
 * occur in the input first, so one declaration buys exactly one space
 * and an off-by-one FAILS the gate instead of passing it. Its
 * docstring frames it as recovering elided text, which a space is not;
 * that is a mechanical fit with a semantic stretch, taken knowingly
 * over a `types.ts` contract change affecting all fifteen shipped
 * rules.
 *
 * A space always occurs in the input for every member of these rows —
 * each is a seam INSIDE a populated definition — so the `copied`
 * occurrence check can never fail spuriously here.
 */
import type { SourceEntry } from '../../body/types.ts';
import { mapFields } from '../fields.ts';
import type { Rule, TransformResult } from '../types.ts';

interface Seam {
	readonly id: string;
	/** Matches the seam; replacement inserts one space at `$1|$2`. */
	readonly pattern: RegExp;
	readonly what: string;
}

const SEAMS: readonly Seam[] = [
	{
		id: 'anchor-italic-no-space',
		pattern: /(<\/a>)(<i>)/g,
		what: 'the </a><i> seam, rendering "preced.Pi."',
	},
	{
		id: 'paren-tag-no-space',
		pattern: /(\)(?:<\/a>)?)(<i>)/g,
		what: 'a tag-adjacent close paren before <i>',
	},
	{
		id: 'italic-close-paren-nospace',
		pattern: /(<\/i>)(\()/g,
		what: 'the </i>( seam, mirror of )<i>',
	},
	{
		id: 'translit-italic-space-loss',
		pattern: /([A-Za-zÀ-ɏ]\.?)(<i>)/g,
		what: 'a Latin token abutting a transliteration italic',
	},
	{
		id: 'geresh-abbrev-space-loss',
		pattern: /(׳)([א-ת])/g,
		what: 'a space lost after a geresh abbreviation mark',
	},
];

function build(seam: Seam): Rule {
	return {
		apply(entry: SourceEntry): TransformResult {
			let inserted = 0;
			const healed = mapFields(entry, (text) =>
				text.replaceAll(seam.pattern, (_whole, left: string, right: string) => {
					inserted += 1;
					return `${left} ${right}`;
				}),
			);
			if (healed === undefined) {
				return { entry, records: [] };
			}
			return {
				// One declaration per space, so the gate's budget is exact
				// (module docstring; ruling R2).
				copied: Array.from({ length: inserted }, () => ' '),
				entry: healed,
				records: [
					{
						detail: `${inserted} space(s) restored at ${seam.what}`,
						rid: entry.rid,
						ruleId: seam.id,
					},
				],
			};
		},
		id: seam.id,
		phase: 'text-repairs',
	};
}

const [
	anchorItalicSpace,
	parenTagSpace,
	italicParenSpace,
	translitItalicSpace,
	gereshAbbrevSpace,
] = SEAMS.map(build) as [Rule, Rule, Rule, Rule, Rule];

export {
	anchorItalicSpace,
	gereshAbbrevSpace,
	italicParenSpace,
	parenTagSpace,
	translitItalicSpace,
};
```

- [ ] **Step 4: Run the tests**

Run: `bun test admin/pipeline/transform/rules/seam-space.test.ts`
Expected: PASS, 8 tests

- [ ] **Step 5: Measure each row and reconcile against the spec's §2 table**

```bash
bun -e '
import {readSourceEntries} from "./admin/pipeline/body/source.ts";
import * as S from "./admin/pipeline/transform/rules/seam-space.ts";
for (const rule of Object.values(S)) {
  let ent = 0, occ = 0;
  for await (const e of readSourceEntries()) {
    const r = rule.apply(e);
    if (r.records.length > 0) { ent += 1; occ += (r.copied ?? []).length; }
  }
  console.log(rule.id, occ, "occ", ent, "ent");
}'
```

Expected against spec §2: `anchor-italic-no-space` 112/111, `paren-tag-no-space` 126/119, `italic-close-paren-nospace` 96/95, `translit-italic-space-loss` 15/15, `geresh-abbrev-space-loss` 25/24.

**`translit-italic-space-loss` will over-fire.** Its pattern `[A-Za-zÀ-ɏ]\.?<i>` also matches the ordinary `word<i>` seam. The row is 15 occurrences with ZERO letter-A rids; if the measurement returns 63, narrow the pattern to require the italic to open a transliterated foreign word (the row's own examples are `Arab.ġaḥama` and `IHif.`) and re-measure. Do not ship the broad pattern.

**`geresh-abbrev-space-loss` returns 25/24 against a catalogued 22.** Its row scopes to Hebrew QUOTATION text; add the scope (the seam must sit inside a `dir="rtl"` span) and re-measure before writing back.

- [ ] **Step 6: Commit**

```bash
biome check .
bun test admin/pipeline/transform/
git add admin/pipeline/transform/rules/seam-space.ts admin/pipeline/transform/rules/seam-space.test.ts
git commit -s -m "🦄 new(transform): five tag-seam space repairs"
```

---

### Task 4: Class A — the em-dash and lone-punctuation pair

**Goal:** Ship `em-dash-section-break-in-own-italic` and `italic-lone-punctuation`, in that order, because the second is DEFINED as the residue of the first.

**Files:**
- Create: `admin/pipeline/transform/rules/punct-seams.ts`
- Create: `admin/pipeline/transform/rules/punct-seams.corpus.test.ts`

**Acceptance Criteria:**
- [ ] `emDashSectionBreak` turns `.</i> <i>—</i> ` into the corpus norm `.—` — 278 occ / 270 entries
- [ ] `italicLonePunctuation` unwraps `<i>.</i>`, `<i>?</i>`, `<i>;</i>` — and NEVER `<i>—</i>`
- [ ] A test proves the exclusion: `italicLonePunctuation` leaves `<i>—</i>` untouched, so the 230 em-dash members are not double-counted
- [ ] Both rules are text-multiset no-ops or deletions; neither sets `allows`
- [ ] `italicLonePunctuation` reports 28 occurrences against a catalogued 29 — write back if the residue confirms
- [ ] The Class-A `stripTags` invariant holds for `emDashSectionBreak`

**Verify:** `bun test admin/pipeline/transform/rules/punct-seams.corpus.test.ts` → PASS; `bun transform:count` reports both rows

**Steps:**

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, test } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { emDashSectionBreak, italicLonePunctuation } from './punct-seams.ts';

function entryWith(definition: string): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword: 'x',
		rid: 'A00001',
	} as SourceEntry;
}

const defOf = (e: SourceEntry): string => e.content.senses[0]?.definition ?? '';

describe('emDashSectionBreak', () => {
	test('closes the spaced section break to the corpus norm', () => {
		const out = emDashSectionBreak.apply(entryWith('<i>gloss.</i> <i>—</i> <i>Pl.</i>'));
		expect(defOf(out.entry)).toBe('<i>gloss.—</i><i>Pl.</i>');
	});

	test('leaves an em-dash that is not a section break alone', () => {
		const entry = entryWith('a — b');
		expect(emDashSectionBreak.apply(entry).entry).toBe(entry);
	});
});

describe('italicLonePunctuation', () => {
	test('unwraps a lone period', () => {
		expect(defOf(italicLonePunctuation.apply(entryWith('a<i>.</i>b')).entry)).toBe(
			'a.b',
		);
	});

	test('NEVER touches a lone em-dash — that is the other row', () => {
		const entry = entryWith('a<i>—</i>b');
		expect(italicLonePunctuation.apply(entry).entry).toBe(entry);
	});
});
```

- [ ] **Step 2: Run and watch it fail**

Run: `bun test admin/pipeline/transform/rules/punct-seams.corpus.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write `punct-seams.ts`**

```ts
/**
 * Class A (batch-3b spec §3) — two rows that move or remove markup
 * around punctuation the corpus already has right.
 *
 * ORDER IS LOAD-BEARING AND IS NOT RECORDED AS AN ENTANGLEMENT EDGE.
 * `italic-lone-punctuation` is DEFINED in the catalogue as the residue
 * after `em-dash-section-break-in-own-italic` takes its share: of 258
 * lone-punctuation runs, 230 are `<i>—</i>` and every one of those is
 * preceded by `.</i> `, i.e. already owned by the em-dash row.
 * Cataloguing both at full size would double-count 230 instances.
 * `italicLonePunctuation` therefore EXCLUDES the em-dash by
 * construction rather than by running second — belt and braces,
 * because `checkAdjacency()` reads `entangledWith` and these two rows
 * carry no edge, so the gate cannot see this dependency at all.
 */
import type { SourceEntry } from '../../body/types.ts';
import { mapFields } from '../fields.ts';
import type { Rule, TransformResult } from '../types.ts';

/** `.</i> <i>—</i> ` — a section break carried into its own italic. */
const SECTION_BREAK = /\.<\/i> <i>—<\/i> ?/g;
/** A lone non-em-dash punctuation mark in its own italic run. */
const LONE = /<i>([.?;])<\/i>/g;

function build(
	id: string,
	repair: (text: string) => string,
	detail: string,
): Rule {
	return {
		apply(entry: SourceEntry): TransformResult {
			const healed = mapFields(entry, repair);
			return healed === undefined
				? { entry, records: [] }
				: { entry: healed, records: [{ detail, rid: entry.rid, ruleId: id }] };
		},
		id,
		phase: 'text-repairs',
	};
}

const emDashSectionBreak: Rule = build(
	'em-dash-section-break-in-own-italic',
	(text) => text.replaceAll(SECTION_BREAK, '.—</i>'),
	'section em-dash closed to the corpus norm ".—"',
);

const italicLonePunctuation: Rule = build(
	'italic-lone-punctuation',
	(text) => text.replaceAll(LONE, '$1'),
	'italic unwrapped from a lone punctuation mark',
);

export { emDashSectionBreak, italicLonePunctuation };
```

- [ ] **Step 4: Run the tests**

Run: `bun test admin/pipeline/transform/rules/punct-seams.corpus.test.ts`
Expected: PASS, 4 tests

The `emDashSectionBreak` replacement above produces `.—</i>`, which requires the preceding `</i>` to have been consumed. If the test fails on the exact output string, adjust the replacement to whatever keeps `stripTags` byte-identical AND leaves markup no less well-formed — then update the test to that string. **The invariant, not the literal, is the requirement.**

- [ ] **Step 5: Measure both rows**

```bash
bun -e '
import {readSourceEntries} from "./admin/pipeline/body/source.ts";
import {emDashSectionBreak,italicLonePunctuation} from "./admin/pipeline/transform/rules/punct-seams.ts";
for (const rule of [emDashSectionBreak, italicLonePunctuation]) {
  let ent = 0;
  for await (const e of readSourceEntries()) if (rule.apply(e).records.length > 0) ent += 1;
  console.log(rule.id, ent, "entries");
}'
```

Expected: 270 and 28.

- [ ] **Step 6: Commit**

```bash
biome check .
bun test admin/pipeline/transform/
git add admin/pipeline/transform/rules/punct-seams.ts admin/pipeline/transform/rules/punct-seams.corpus.test.ts
git commit -s -m "🦄 new(transform): em-dash and lone-punct seams"
```

---

### Task 5: Class C — the deletions that survive audit

**Goal:** Ship `emphasis-run-edge-space` and `trailing-whitespace-definition`, the two Class C rows whose audits license a deletion, with the position filter that keeps `trailing-whitespace-definition` at 10 and not 2,352.

**Files:**
- Create: `admin/pipeline/transform/rules/edge-trim.ts`
- Create: `admin/pipeline/transform/rules/edge-trim.test.ts`

**Acceptance Criteria:**
- [ ] `emphasisRunEdgeSpace` moves a space from inside an italic boundary to outside it — `<i> a` → ` <i>a`, `a </i>` → `a</i> `
- [ ] `trailingWhitespaceDefinition` strips trailing whitespace ONLY from the LAST sense of an entry, walking `sense.senses` recursively
- [ ] A test proves the position filter: a non-final sense with trailing whitespace is left alone
- [ ] A test named for the audit's warning asserts that a corpus-wide `trimEnd()` is NOT what shipped — feed an entry with two senses, both trailing-space, and assert only the last changed
- [ ] `trailingWhitespaceDefinition` reports 10 entries. If it reports 2,352 the position filter is missing — STOP
- [ ] Neither rule sets `allows`

**Verify:** `bun test admin/pipeline/transform/rules/edge-trim.test.ts` → PASS; corpus measurement reports 304 and 10

**Steps:**

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, test } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { emphasisRunEdgeSpace, trailingWhitespaceDefinition } from './edge-trim.ts';

function entryWith(...definitions: string[]): SourceEntry {
	return {
		content: { senses: definitions.map((definition) => ({ definition })) },
		headword: 'x',
		rid: 'A00001',
	} as SourceEntry;
}

const defsOf = (e: SourceEntry): string[] =>
	e.content.senses.map((s) => s.definition ?? '');

describe('emphasisRunEdgeSpace', () => {
	test('pushes a leading space out of the run', () => {
		expect(defsOf(emphasisRunEdgeSpace.apply(entryWith('a<i> b</i>')).entry)).toEqual(
			['a <i>b</i>'],
		);
	});

	test('pushes a trailing space out of the run', () => {
		expect(defsOf(emphasisRunEdgeSpace.apply(entryWith('<i>b </i>c')).entry)).toEqual(
			['<i>b</i> c'],
		);
	});
});

describe('trailingWhitespaceDefinition', () => {
	test('strips the last sense only', () => {
		const out = trailingWhitespaceDefinition.apply(entryWith('one ', 'two '));
		expect(defsOf(out.entry)).toEqual(['one ', 'two']);
	});

	test('THE AUDIT WARNING: this is not a corpus-wide trimEnd', () => {
		// trailing-whitespace-definition's audit: "DO NOT WRITE A
		// CORPUS-WIDE trimEnd() ON definition — it would weld gloss heads
		// onto their sense labels across the corpus." 2,430 of 2,450
		// occurrences are the field-split separator convention.
		const out = trailingWhitespaceDefinition.apply(entryWith('gloss head ', '1) sense'));
		expect(defsOf(out.entry)[0]).toBe('gloss head ');
	});

	test('walks nested senses to find the true last one', () => {
		const entry = {
			content: {
				senses: [{ definition: 'outer ', senses: [{ definition: 'inner ' }] }],
			},
			headword: 'x',
			rid: 'A00001',
		} as SourceEntry;
		const out = trailingWhitespaceDefinition.apply(entry);
		expect(out.entry.content.senses[0]?.definition).toBe('outer ');
		expect(out.entry.content.senses[0]?.senses?.[0]?.definition).toBe('inner');
	});
});
```

- [ ] **Step 2: Run and watch it fail**

Run: `bun test admin/pipeline/transform/rules/edge-trim.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write `edge-trim.ts`**

`emphasisRunEdgeSpace` uses `mapFields`. `trailingWhitespaceDefinition` does NOT — it needs the entry's sense TREE, not its flat field list, so it walks `content.senses` itself and rewrites only the last leaf:

```ts
/**
 * Class C (batch-3b spec §3) — the two deletion rows whose audits
 * license the deletion.
 *
 * The sub-multiset gate passes ANY deletion by construction, so it
 * cannot tell a correct one from deleting the wrong byte. For
 * `trailing-whitespace-definition` that is not theoretical: its
 * catalogued population was 2,352 entries and its audit cut it to 10,
 * because 2,430 of 2,450 occurrences are the FIELD-SPLIT SEPARATOR
 * CONVENTION — the only thing standing between a gloss head and the
 * "1)" that follows it. The audit's own words: "DO NOT WRITE A
 * CORPUS-WIDE trimEnd() ON definition — it would weld gloss heads onto
 * their sense labels across the corpus."
 *
 * The position filter IS the rule. Only the last sense of an entry,
 * with nothing following to consume the separator, is trimmed — and
 * "last" is found by walking `sense.senses` recursively, because
 * senses nest (4,043 of them) and the flat top-level read gives 8
 * rather than 10.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { mapFields } from '../fields.ts';
import type { Rule, TransformResult } from '../types.ts';

/** A space captured just inside an italic boundary. */
const LEADING_EDGE = /<i> /g;
const TRAILING_EDGE = / <\/i>/g;

const emphasisRunEdgeSpace: Rule = {
	apply(entry: SourceEntry): TransformResult {
		const healed = mapFields(entry, (text) =>
			text.replaceAll(LEADING_EDGE, ' <i>').replaceAll(TRAILING_EDGE, '</i> '),
		);
		return healed === undefined
			? { entry, records: [] }
			: {
					entry: healed,
					records: [
						{
							detail: 'space moved out of an italic run boundary',
							rid: entry.rid,
							ruleId: 'emphasis-run-edge-space',
						},
					],
				};
	},
	id: 'emphasis-run-edge-space',
	phase: 'text-repairs',
};

/** The deepest-last sense in the tree — the one nothing follows. */
function lastPath(senses: readonly SourceSense[]): number[] {
	const at = senses.length - 1;
	if (at < 0) {
		return [];
	}
	const child = senses[at]?.senses ?? [];
	return child.length > 0 ? [at, ...lastPath(child)] : [at];
}

function trimAt(senses: readonly SourceSense[], path: readonly number[]): {
	changed: boolean;
	senses: SourceSense[];
} {
	const out = [...senses];
	const [at, ...rest] = path;
	const target = out[at as number];
	if (target === undefined) {
		return { changed: false, senses: out };
	}
	if (rest.length > 0) {
		const inner = trimAt(target.senses ?? [], rest);
		out[at as number] = { ...target, senses: inner.senses };
		return { changed: inner.changed, senses: out };
	}
	const text = target.definition;
	if (text === undefined || text === '' || !/\s$/.test(text)) {
		return { changed: false, senses: out };
	}
	out[at as number] = { ...target, definition: text.trimEnd() };
	return { changed: true, senses: out };
}

const trailingWhitespaceDefinition: Rule = {
	apply(entry: SourceEntry): TransformResult {
		const path = lastPath(entry.content.senses);
		if (path.length === 0) {
			return { entry, records: [] };
		}
		const result = trimAt(entry.content.senses, path);
		if (!result.changed) {
			return { entry, records: [] };
		}
		return {
			entry: {
				...entry,
				content: { ...entry.content, senses: result.senses },
			},
			records: [
				{
					detail: 'trailing whitespace stripped from the entry-final sense',
					rid: entry.rid,
					ruleId: 'trailing-whitespace-definition',
				},
			],
		};
	},
	id: 'trailing-whitespace-definition',
	phase: 'text-repairs',
};

export { emphasisRunEdgeSpace, trailingWhitespaceDefinition };
```

- [ ] **Step 4: Run the tests**

Run: `bun test admin/pipeline/transform/rules/edge-trim.test.ts`
Expected: PASS, 5 tests

- [ ] **Step 5: Measure, and STOP on the 2,352**

```bash
bun -e '
import {readSourceEntries} from "./admin/pipeline/body/source.ts";
import {emphasisRunEdgeSpace,trailingWhitespaceDefinition} from "./admin/pipeline/transform/rules/edge-trim.ts";
for (const rule of [emphasisRunEdgeSpace, trailingWhitespaceDefinition]) {
  let ent = 0;
  for await (const e of readSourceEntries()) if (rule.apply(e).records.length > 0) ent += 1;
  console.log(rule.id, ent, "entries");
}'
```

Expected: **304** and **10**.

If `trailing-whitespace-definition` reports anything near 2,352, the position filter is not doing its job and the rule is about to weld gloss heads onto sense labels across the whole corpus. STOP and fix before committing.

- [ ] **Step 6: Commit**

```bash
biome check .
bun test admin/pipeline/transform/
git add admin/pipeline/transform/rules/edge-trim.ts admin/pipeline/transform/rules/edge-trim.test.ts
git commit -s -m "🦄 new(transform): two audited edge deletions"
```

---

### Task 6: Audit and route the four rows that say no repair exists

**Goal:** Discharge ruling R4 — write the two rows that turn out repairable, route the two that do not, and publish an audit for each so the disposition is falsifiable.

**Files:**
- Modify: `admin/pipeline/transform/rules/seam-space.ts` — append `italicSwallowsCloseParen`
- Modify: `admin/pipeline/transform/rules/seam-space.test.ts`
- Modify: `admin/pipeline/transform/rules/edge-trim.ts` — append `citationQuoteSeamPeriod` if Step 5's audit licenses it
- Create: `data/patches/catalogue-audit/orphan-gloss-seam-period.md`
- Create: `data/patches/catalogue-audit/batch-3b-withdrawals.md`
- Modify: `data/patches/patterns.jsonl` — routes and counts for the rows that move

**Acceptance Criteria:**
- [ ] `italicSwallowsCloseParen` splits `<i>def) ghi</i>` into `<i>def</i>) <i>ghi</i>`, declares its inserted space as `copied: [' ']`, and EXCLUDES the 2 lettered sub-sense markers (`a)` inside an italic) the row's audit calls convention
- [ ] It reports **8**, not 10; the row's count is written back 10 → 8 with the exclusion named
- [ ] `orphan-gloss-seam-period` gets the loss-marker measurement its audit asks for: do its 19 clean members sit beside a text-loss marker the way the 37 siblings do? The answer decides `transform` or `judgment`, and the measurement is published
- [ ] `citation-quote-seam-period` (43) is written or routed on the same test — a spurious period with no nameable owner is `judgment`
- [ ] `gloss-head-seam-period-doubling` (15) and `entry-final-comma` (10) are routed to `judgment` in `patterns.jsonl`, each citing its own `reason` verbatim
- [ ] `batch-3b-withdrawals.md` states, for every withdrawn row, WHICH TEST it failed — no repair exists, or no nameable destination — matching batch 2's precedent

**Verify:** `bun -e '…coverage()…'` → 0 unaccounted, 0 duplicated; the transform route total matches the withdrawals

**Steps:**

- [ ] **Step 1: Run the loss-marker measurement for `orphan-gloss-seam-period`**

Its audit: *"56 `. . ` occurrences corpus-wide: 37 are the catalogued lost-`(h.` residue … leaving 19 clean seam instances … The 37-strong sibling family suggests the orphan period MARKS dropped text rather than being stray debris."*

```bash
bun -e '
import {readSourceEntries} from "./admin/pipeline/body/source.ts";
import {fieldsOf} from "./admin/pipeline/transform/no-new-text.ts";
let clean = 0, marked = 0;
for await (const e of readSourceEntries()) {
  for (const f of fieldsOf(e)) {
    for (const m of f.matchAll(/\. \. /g)) {
      const window = f.slice(Math.max(0, m.index - 60), m.index + 60);
      if (/\(h\.|\(ch\.|h\.$/.test(window)) marked += 1; else clean += 1;
    }
  }
}
console.log({clean, marked});'
```

Decision rule, stated before the number is seen: if the 19 clean members show the same lost-`(h.` neighbourhood as the 37, the period is a loss marker and deleting it destroys evidence → `judgment`. If they are clean by the same test that separated them, → `transform`.

- [ ] **Step 2: Write `italicSwallowsCloseParen` and its convention exclusion**

Append to `seam-space.ts`:

```ts
/**
 * italic-swallows-close-paren (8 of 10 raw occurrences).
 *
 * An italic run swallows the closing paren of a parenthetical opened
 * in plain text before the tag. The repair splits the run —
 * `<i>def) ghi</i>` → `<i>def</i>) <i>ghi</i>` — which is why the
 * row's audit calls it "not byte-conservingly repairable": the split
 * inserts one space, declared here as `copied` like every other Class
 * B row.
 *
 * TWO OF THE TEN ARE NOT DAMAGE. The audit: "2 of the 10 raw hits are
 * not paren damage but lettered sub-sense markers 'a)' inside an
 * italic — CONVENTION." A single Latin letter before the paren is
 * therefore excluded, and the row is written back 10 → 8.
 *
 * The falsifier is what makes the other 8 safe to touch: if print set
 * the paren inside the italic type, the reverse polarity would also
 * appear. The inverse direction — an italic run with a surplus "(" —
 * is 0 of 47,028 runs, which is what a boundary-drift defect predicts
 * and a print convention does not.
 */
const SWALLOWED_PAREN = /<i>([^<>]*[^<>\sA-Za-z])\)([^<>]+)<\/i>/g;
```

Build it with the same `build()` helper, counting one `copied` space per replacement.

- [ ] **Step 3: Write the tests**

```ts
test('italicSwallowsCloseParen splits the run and declares one space', () => {
	const out = italicSwallowsCloseParen.apply(entryWith('(see <i>def) ghi</i>'));
	expect(defOf(out.entry)).toBe('(see <i>def</i>) <i>ghi</i>');
	expect(out.copied).toEqual([' ']);
});

test('a lettered sub-sense marker is CONVENTION, not damage', () => {
	const entry = entryWith('<i>a) first</i>');
	expect(italicSwallowsCloseParen.apply(entry).entry).toBe(entry);
});
```

Run: `bun test admin/pipeline/transform/rules/seam-space.test.ts`
Expected: PASS; the corpus measurement reports **8**.

- [ ] **Step 4: Route the withdrawals in `patterns.jsonl`**

Surgically set `"route": "judgment"` on `gloss-head-seam-period-doubling` and `entry-final-comma`, plus any row Steps 1 and 5 send there. Append to each `reason`:

```text
 *** BATCH 3b DISPOSITION (2026-08-25): WITHDRAWN TO judgment. *** No deterministic repair exists, and this row's own audit already said so — quoted above. Withdrawn without writing code, under ruling R4 of the batch-3b design. The test it failed is the one homograph-numeral-mismatch failed in batch 2: a real defect with no nameable repair.
```

- [ ] **Step 5: Decide `citation-quote-seam-period` (43) on the same test**

Its `reason`: *"44 occurrences / 43 entries against 33,168 clean seams (0.13%)"* — a spurious period between a citation anchor and the `dir=rtl` quotation it introduces. Read 10 members. If the period is unambiguously surplus, write it as a Class C deletion in `edge-trim.ts` with a test per read member. If any member is load-bearing, route to `judgment` with the reading published.

- [ ] **Step 6: Publish the audits**

Write `data/patches/catalogue-audit/batch-3b-withdrawals.md` with one section per withdrawn row: the quoted `reason`, the test it failed, the measurement run, and the number of members read. Write `orphan-gloss-seam-period.md` with Step 1's measurement and the decision rule as stated BEFORE the number.

- [ ] **Step 7: Commit**

```bash
biome check .
bun test admin/pipeline/transform/
git add admin/pipeline/transform/rules/ data/patches/patterns.jsonl data/patches/catalogue-audit/
git commit -s -m "🦄 new(transform): route the four escalation rows"
```

---

### Task 7: Register, prove the order, run the corpus, write the report

**Goal:** Put every shipped rule in the registry in a defensible order, prove the composed run gains no defect the isolated runs hid, and publish the batch report.

**Files:**
- Modify: `admin/pipeline/transform/registry.ts` — add the new rules, remove their ids from `PENDING`
- Modify: `admin/pipeline/transform/registry.order.corpus.test.ts` if the cluster assertion needs the new pair
- Create: `docs/v2/transform-batch-3b.md`
- Modify: `docs/v2/phase-2-triage.md` — route totals recomputed
- Modify: `docs/specs/2026-08-25-italic-punctuation-transform-design.md` — decision log closed

**Acceptance Criteria:**
- [ ] `coverage()` reports 0 unaccounted and 0 duplicated; registered + pending = the live transform-route row count
- [ ] The label pair is gap-free adjacent, `labelPeriodInside` FIRST — it removes labels from the population `italicGlossPeriodOutside` then reads
- [ ] Class B space rules run BEFORE Class A seam moves, with the reason in a registry comment: a missing space at `</a><i>` changes what "the run body" is for the label predicate
- [ ] `emDashSectionBreak` runs before `italicLonePunctuation`, with the double-count reason in a comment
- [ ] Order freedom is MEASURED for every rule whose placement is claimed free — run it first and last in the registry and assert byte-identical output, as batch 2 did for `shurukAsYodDisplayCorruption`
- [ ] `bun body:migrate-dry` record count is unchanged from `v2`
- [ ] `pipeline-links.corpus.test.ts` link totals are UNCHANGED — 110 of this batch's seams sit against an anchor's closing tag (57 `</a><i>` + 53 `)</a><i>`; CORRECTED 2026-08-26 from **165**, the pre-decline arithmetic 112 + 53 written before both patterns gained the `(?![.,;:?!])` guard), and batch 3a's headline was a link regression every per-rule measurement missed
- [ ] `unaccountedEdges()` reports no dangling endpoint
- [ ] The batch report states, for every row, the catalogued count, the measured count, and which one the rule reproduces

**Verify:** `bun test && bun transform:count && bun body:migrate-dry` → all pass; link totals identical to `v2`

**Steps:**

- [ ] **Step 1: Register the rules**

In `registry.ts`, import from the four new modules and append to `RULES` in this order, each block carrying its reason as a comment:

> *** ORDER SUPERSEDED (2026-08-26) — THE BLOCK BELOW IS THE BRIEF'S
> PROPOSAL, AND MEASUREMENT INVERTED TWO OF ITS PLACEMENTS. *** It is
> kept verbatim because the batch report's §2 is a claim ABOUT it ("the
> batch brief proposed an order that violated two of them"), and because
> the same mistake is the one batch 1 made with the RTL trio. Do not
> copy it into `registry.ts`.
>
> **The shipped order**, in `RULES`:
>
> 1. `anchorItalicSpace`
> 2. `parenTagSpace`
> 3. `italicParenSpace`
> 4. `translitItalicSpace`
> 5. `gereshAbbrevSpace`
> 6. `italicSwallowsCloseParen`
> 7. `emphasisRunEdgeSpace`
> 8. `emDashSectionBreak`
> 9. `italicLonePunctuation`
> 10. `labelPeriodInside`
> 11. `italicGlossPeriodOutside`
> 12. `trailingWhitespaceDefinition`
>
> **What the block below gets wrong.** It puts the label pair at
> positions 7-8, ahead of `emDashSectionBreak`, and files
> `emphasisRunEdgeSpace` under "Class C deletions, last". Both are
> inverted by measurement — `front / back` being the number of the
> 32,512 entries whose final bytes differ from the shipped order when
> the rule is moved to the front, and to the back, of `RULES`:
>
> - **`emDashSectionBreak` must precede `italicGlossPeriodOutside`
>   (0 / 270).** `SECTION_BREAK` needs its input's first run to still
>   read `<i>gloss.</i>`, period abutting `</i>` — exactly the seam the
>   gloss rule hunts and rewrites. With the gloss rule first the em-dash
>   rule survives on **0 of its 270 entries**. Measured in Task 4, by
>   its reviewer, and again in Task 7.
> - **`emphasisRunEdgeSpace` must precede `italicGlossPeriodOutside`
>   (0 / 13).** 29 trailing-edge occurrences read `<i>gloss.␣</i>`,
>   where the captured space hides the terminal period from the gloss
>   rule's `INSIDE` pattern. Running the edge rule first uncovers it:
>   **11 entries** newly fire at entry granularity, **13** by byte
>   comparison. So it must NOT run last, which is where "Class C
>   deletions, last" would put it.
>
> `italicGlossPeriodOutside` reads **283 / 0**, and 283 = 270 + 13 —
> moving it to the front breaks exactly the union of the two constraints
> and nothing else.
>
> The rest of the block's claims survive: Class B before the label pair,
> `labelPeriodInside` leading the pair, and `trailingWhitespaceDefinition`
> last are all correct as shipped — though the first two measure 0 / 0
> and are kept as fail-closed ARGUMENTS rather than the load-bearing
> constraints this block calls them. The block's "belt and braces" reason
> for `emDashSectionBreak` before `italicLonePunctuation` is retracted
> outright: `LONE_PUNCTUATION`'s class is `[.?;]` and cannot match an
> em-dash in any order.
>
> **Where the measurements live:** `docs/v2/transform-batch-3b.md` §2
> (the twelve-row `front / back` table and both constraint write-ups);
> `admin/pipeline/transform/registry.ts`, batch 3b block (per-rule, at
> the rule); and `admin/pipeline/transform/registry.order.corpus.test.ts`, "the
> two rules feeding italic-swallowed-terminal-period precede it", which
> is where the two constraints are pinned — neither is an
> `entangledWith` edge, so `checkAdjacency()` is blind to both.

```ts
	// ---- Batch 3b: italic & punctuation seams ----
	//
	// CLASS B FIRST. A missing space at `</a><i>` or `)<i>` changes
	// what "the italic run body" is for the label predicate below: with
	// the seam closed, `<i>Pi.</i>` reads as a run whose body is a
	// label; with it open, the preceding token has run into the tag.
	// Repairing the seam first makes the label predicate read the same
	// string a human reads.
	anchorItalicSpace,
	parenTagSpace,
	italicParenSpace,
	translitItalicSpace,
	gereshAbbrevSpace,
	italicSwallowsCloseParen,

	// The label pair — the batch's only recorded entanglement edge, and
	// `checkAdjacency()` requires this gap-free span.
	//
	// `labelPeriodInside` LEADS, and the order is load-bearing rather
	// than aesthetic: it moves every label's period inside, which
	// removes those runs from the `<i>…</i>.` population that
	// `italicGlossPeriodOutside` then reads. Run the other way round,
	// the gloss rule sees labels it must decline one at a time and its
	// exclusion clause becomes a filter it has to get right instead of
	// an assertion that already holds.
	labelPeriodInside,
	italicGlossPeriodOutside,

	// `emDashSectionBreak` BEFORE `italicLonePunctuation`. The second
	// row is DEFINED as the residue of the first: 230 of 258
	// lone-punctuation runs are `<i>—</i>` and every one is already
	// owned by the em-dash row. The residue rule excludes the em-dash
	// by construction too, so this is belt and braces — necessary
	// because the two rows carry no `entangledWith` edge and
	// `checkAdjacency()` therefore cannot see the dependency.
	emDashSectionBreak,
	italicLonePunctuation,

	// Class C deletions, last: nothing downstream reads what they
	// remove, and `trailingWhitespaceDefinition` must see the final
	// sense as every earlier rule leaves it.
	emphasisRunEdgeSpace,
	trailingWhitespaceDefinition,
	// `citationQuoteSeamPeriod` and `orphanGlossSeamPeriod` belong in
	// this block TOO — include each one only if Task 6 routed it
	// `transform`. A row Task 6 sent to `judgment` must appear in
	// NEITHER `RULES` nor `PENDING`, exactly as
	// `homograph-numeral-mismatch` does today, or `coverage()` will
	// double-count it.
```

Remove every shipped id from `PENDING`, leaving a comment for each row that WITHDREW to `judgment`, in the style the existing `homograph-numeral-mismatch` and `h-cognate-self-link` comments use.

- [ ] **Step 2: Prove coverage**

```bash
bun test admin/pipeline/transform/registry.test.ts admin/pipeline/transform/registry.order.corpus.test.ts
```
Expected: PASS; `coverage()` 0 unaccounted, 0 duplicated.

- [ ] **Step 3: Measure order freedom where it is claimed**

For each rule whose placement the comments do NOT justify by a dependency, run the whole registry with that rule moved to the front and to the back, and assert byte-identical output over the corpus:

```bash
bun -e '
import {readSourceEntries} from "./admin/pipeline/body/source.ts";
import {RULES} from "./admin/pipeline/transform/registry.ts";
import {applyTransforms} from "./admin/pipeline/transform/run.ts";
const id = process.argv[2];
const rule = RULES.find((r) => r.id === id);
const rest = RULES.filter((r) => r.id !== id);
let diff = 0;
for await (const e of readSourceEntries()) {
  const a = applyTransforms(e, "text-repairs", [rule, ...rest]).entry;
  const b = applyTransforms(e, "text-repairs", [...rest, rule]).entry;
  if (JSON.stringify(a) !== JSON.stringify(b)) diff += 1;
}
console.log(id, "entries differing:", diff);' -- <rule-id>
```

Expected: 0 for every rule claimed free. A non-zero result is a real ordering dependency that must be written into the registry comment, not explained away.

- [ ] **Step 4: Run the full corpus battery**

```bash
bun test
bun transform:count
bun body:migrate-dry
```

Expected: all pass; `migrate-dry` record count identical to `v2`'s; every 3b row MATCH or a stated, written-back delta.

- [ ] **Step 5: Prove the links did not move**

```bash
bun test admin/pipeline/body/pipeline-links.corpus.test.ts
```

Expected: PASS with link totals unchanged. **This is the check batch 3a did not have until it needed one.** If any total moves, a seam rule has edited inside an anchor tag — find it before writing the report.

- [ ] **Step 6: Write the batch report**

Create `docs/v2/transform-batch-3b.md` following `transform-batch-3a.md`'s shape: what shipped, the measured-vs-catalogued table for all 16 rows, the withdrawals and which test each failed, the composed-vs-isolated counts, the gates' blind spots for Class A, and a Concerns section. State the `Part. pass.` cost in the report, not only in the spec.

- [ ] **Step 7: Recompute the triage totals**

Run `phase-2-triage.md`'s own reproduction snippet and update the route table, the "Shape of the work" table, and the cutover cross-cut to what it returns. Never hand-type a total.

- [ ] **Step 8: Close the spec's decision log**

Append to §13 the rulings as taken (R1–R4) and the dispositions Task 6 produced.

- [ ] **Step 9: Commit**

```bash
biome check .
git add admin/pipeline/transform/registry.ts docs/
git commit -s -m "🦄 new(transform): register batch 3b and report"
```

---

## Before the pull request

- [ ] `git fetch` first — the session snapshot goes stale, and a duplicate PR has been opened here before.
- [ ] Run the full local review battery over the WHOLE diff. Cloud CodeRabbit is SKIPPED on this OSS repo; local is the only one, 150-file cap.
- [ ] Check for pending CodeRabbit comments before ANY push; reviews are rate-limited to roughly one an hour.
- [ ] `biome check .` — 116 infos, 0 errors.
- [ ] `bun test` — full suite green, and state the number.
- [ ] Expect **Workers Builds to fail**. `wrangler.jsonc:9` points `assets.directory` at `./app`, which arrives in Phase 4. Not a regression; #44–#48 all merged with it red.
- [ ] Expect `CHANGES_REQUESTED` from CodeRabbit and expect it to clear itself on a later pass. Do not ask Brian to dismiss it.
- [ ] Commit signing goes through 1Password; if it blocks, the work stays staged and you retry after unlock. **Never `--no-gpg-sign`.**
