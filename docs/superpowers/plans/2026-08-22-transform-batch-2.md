# Transform Batch 2 Implementation Plan — link transforms

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the twelve entry-local link rows (1,794 instances) behind
a new third gate that makes `href`/`data-ref` a checked surface for the
first time.

**Architecture:** An anchor view (`links.ts`) over the existing token
stream, a link-target gate (`link-target.ts`) wired into `run.ts`
beside the text and markup gates, and rules that either **unlink** a
wrong anchor or **retarget** it to an address this entry's own input
already holds.

**Tech Stack:** Bun, TypeScript, `bun test`, Biome. Zero runtime
dependencies.

**Global Constraints:**
- Read [the batch-2 spec](../../specs/2026-08-22-link-transform-design.md)
  before Task 0 and [the module spec](../../specs/2026-08-22-transform-module-design.md)
  §3–§6 before writing any rule. This plan does not restate their
  contracts; it implements them.
- A `Rule` never carries an expected count. Counts live in
  `patterns.jsonl` and only `transform:count` reads them.
- `serialize(tokenize(s)) === s` holds for every definition. Rules edit
  tokens and re-serialize; nothing does regex surgery on raw markup.
- **No rule creates an anchor.** Batch 2's anchor count never grows.
- **No rule writes a target this entry's input does not already hold**,
  under gate cases 1–3 (spec §3.2). A rule that cannot satisfy a case
  declines to fire; the residue is measured and written back to the
  catalogue.
- `links.ts` is the ONLY parser of anchor attributes. It reads
  `attributeInterior` and `opensScope` from `html.ts` rather than
  re-deriving where a damaged attribute ends.
- Fixtures are real entries cited by rid. A hand-written string that
  flatters the rule is not a fixture.
- `bun qa` (format, lint, test, tsc) passes before every commit.

**User decisions (already made):**
- "approach 1, go ahead" — batch 2 is entry-local retargeting. The
  never-linked family (6 rows / 4,192) and the two corpus-lookup rows
  (183) are deferred to their own spec.
- "keep case 3" — the compose case stays, constrained to work-copied-
  whole plus locus ⊆ display text.
- Unlink is the ruling for a wrong link with no correct target: drop
  the anchor, keep the display text.

---

## File structure

| File | Status | Responsibility |
|---|---|---|
| `admin/pipeline/transform/links.ts` | create | Anchor view + the two editors. No rule logic. |
| `admin/pipeline/transform/links.test.ts` | create | Round-trip, malformed decline, editor behaviour |
| `admin/pipeline/transform/link-target.ts` | create | The gate: cases 1–3 and the two counting invariants |
| `admin/pipeline/transform/link-target.test.ts` | create | Proves a fabricated target fails |
| `admin/pipeline/transform/types.ts` | modify | `TransformResult` gains `composed` and `unlinks` |
| `admin/pipeline/transform/run.ts` | modify | Third gate in the per-rule check |
| `admin/pipeline/transform/rules/unlink.ts` | create | Tasks 2–4: the four unlink rows |
| `admin/pipeline/transform/rules/geresh.ts` | create | Task 5: the two entangled geresh rows |
| `admin/pipeline/transform/rules/anaphora.ts` | create | Tasks 7–8: the three `ib.`-family rows |
| `admin/pipeline/transform/rules/misc-links.ts` | create | Tasks 6, 9, 10: plural, homograph, shuruk |
| `admin/pipeline/transform/registry.ts` | modify | Register each rule; remove it from `PENDING` |
| `data/patches/patterns.jsonl` | modify | Surgical write-backs only (Task 11) |

Rules are split by machine, not by row count: unlink rules write no
target at all, the geresh pair rewrite the same anchors, and the `ib.`
family all read the anchor sequence. A file per machine keeps each one
small enough to hold in context while writing its tests.

---

## Task 0: The anchor view

**Goal:** One parser for anchor attributes, with two editors, that
declines to touch damaged tags.

**Files:**
- Create: `admin/pipeline/transform/links.ts`
- Test: `admin/pipeline/transform/links.test.ts`

**Acceptance Criteria:**
- [ ] `anchors(tokenize(s))` returns one `Anchor` per `<a>` with its
      `href`, `dataRef`, `display` and token span
- [ ] An anchor whose opening tag fails `opensScope` is returned with
      `malformed: true` and both editors refuse it
- [ ] `serialize(retarget(...))` and `serialize(unlink(...))` both
      round-trip every untouched byte of the input
- [ ] `unlink` removes exactly the two tag tokens and keeps every text
      token between them
- [ ] No regex parses an attribute outside this file

**Verify:** `bun test admin/pipeline/transform/links.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Write the failing tests**

Fixture A00135 is real: an apparatus citation ("v. Graetz, Gesch. d.")
whose page numbers are anchored as `Judges 2:2`.

```ts
// admin/pipeline/transform/links.test.ts
import { expect, test } from 'bun:test';
import { serialize, tokenize } from './html.ts';
import { anchors, retarget, unlink } from './links.ts';

/** A00135, verbatim from the pinned snapshot. */
const GRAETZ =
  'a district of Peræa (v. Graetz, Gesch. d. ' +
  '<a class="refLink" href="/Judges.2.2" data-ref="Judges 2:2">Jud. II, 2</a>).';

test('reads href, data-ref and display', () => {
  const [anchor] = anchors(tokenize(GRAETZ));
  expect(anchor.href).toBe('/Judges.2.2');
  expect(anchor.dataRef).toBe('Judges 2:2');
  expect(anchor.display).toBe('Jud. II, 2');
  expect(anchor.malformed).toBe(false);
});

test('unlink keeps the display text and drops both tags', () => {
  const tokens = tokenize(GRAETZ);
  const [anchor] = anchors(tokens);
  expect(serialize(unlink(tokens, anchor))).toBe(
    'a district of Peræa (v. Graetz, Gesch. d. Jud. II, 2).',
  );
});

test('retarget rewrites both attributes and nothing else', () => {
  const tokens = tokenize(GRAETZ);
  const [anchor] = anchors(tokens);
  const out = serialize(
    retarget(tokens, anchor, { dataRef: 'Judges 2:3', href: '/Judges.2.3' }),
  );
  expect(out).toContain('href="/Judges.2.3"');
  expect(out).toContain('data-ref="Judges 2:3"');
  expect(out).toContain('class="refLink"');
  expect(out.replace(/2\.3|2:3/gu, '')).toBe(GRAETZ.replace(/2\.2|2:2/gu, ''));
});

/** D00478's shape: an unterminated href swallows the closing tag, so
 * everything after it inside the tag is attribute tail, not document
 * text. `unterminated-href-swallows-closing-tag` (batch 4) repairs it;
 * batch 2 must not touch it. */
const DAMAGED =
  '<a dir="rtl" href="/Jastrow,_כָּלוּל.1</a>" data-ref="Jastrow, כָּלוּל 1">כָּלוּל</a>.';

test('a malformed opening tag is reported and refused', () => {
  const tokens = tokenize(DAMAGED);
  const [anchor] = anchors(tokens);
  expect(anchor.malformed).toBe(true);
  expect(() => unlink(tokens, anchor)).toThrow('malformed');
  expect(() =>
    retarget(tokens, anchor, { dataRef: 'x', href: '/x' }),
  ).toThrow('malformed');
});
```

- [ ] **Step 2: Run the tests and watch them fail**

Run: `bun test admin/pipeline/transform/links.test.ts`
Expected: FAIL — `Cannot find module './links.ts'`

- [ ] **Step 3: Implement `links.ts`**

```ts
/**
 * The anchor view over `html.ts`'s token stream (batch-2 spec §3).
 *
 * Every rule that reads or writes a link goes through here, so
 * attribute parsing exists once. Two parsers would drift, and the
 * corpus contains tags that defeat a naive one — an `href` missing its
 * closing quote absorbs the following `</a>` into the attribute value
 * (`unterminated-href-swallows-closing-tag`, 2 instances, batch 4).
 * `opensScope` from `html.ts` is the single authority on that shape;
 * this module reports it as `malformed` and both editors refuse.
 */
import { opensScope, type Token } from './html.ts';

const ATTR = (name: string) =>
  new RegExp(String.raw`\b${name}\s*=\s*(?<q>["'])(?<value>[^"']*)\k<q>`, 'u');
const HREF = ATTR('href');
const DATA_REF = ATTR('data-ref');

interface Anchor {
  /** Index of the `</a>` in the token array; -1 when unclosed. */
  close: number;
  dataRef: string;
  /** Display text with tags stripped. */
  display: string;
  href: string;
  /** The opening tag is damaged; neither editor will touch it. */
  malformed: boolean;
  /** Index of the `<a …>` in the token array. */
  open: number;
}

interface Target {
  dataRef: string;
  href: string;
}

function anchors(tokens: readonly Token[]): Anchor[] { /* … */ }
function retarget(
  tokens: readonly Token[],
  anchor: Anchor,
  target: Target,
): Token[] { /* … */ }
function unlink(tokens: readonly Token[], anchor: Anchor): Token[] { /* … */ }

export type { Anchor, Target };
export { anchors, retarget, unlink };
```

Implementation notes the tests pin down:

- `anchors` walks the token array once, pushing an open `<a>` onto a
  stack and popping on `</a>`; an unclosed anchor is returned with
  `close: -1` and both editors refuse it, same as `malformed`.
- `display` concatenates only `kind: 'text'` tokens between `open` and
  `close`, so a nested `<span dir="rtl">` contributes its text and not
  its tags.
- `retarget` rebuilds the opening tag by replacing only the matched
  attribute value spans — never by reassembling the tag from parsed
  parts, which would drop `class`, `dir` and attribute order.
- Both editors return a NEW token array. Nothing mutates the input;
  `count.ts` freezes the corpus and an in-place edit throws.

- [ ] **Step 4: Run the tests until they pass**

Run: `bun test admin/pipeline/transform/links.test.ts`
Expected: 4 pass

- [ ] **Step 5: Prove the round-trip on the whole corpus**

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { serialize, tokenize } from "./admin/pipeline/transform/html.ts";
import { anchors } from "./admin/pipeline/transform/links.ts";
let n = 0, malformed = 0, unclosed = 0;
for await (const e of readSourceEntries()) {
  for (const s of e.content.senses) {
    if (s.definition === undefined) continue;
    const t = tokenize(s.definition);
    if (serialize(t) !== s.definition) throw new Error(`round-trip ${e.rid}`);
    for (const a of anchors(t)) {
      n++;
      if (a.malformed) malformed++;
      if (a.close === -1) unclosed++;
    }
  }
}
console.log({ anchors: n, malformed, unclosed });
'
```

Expected: a non-zero anchor count, and `malformed`/`unclosed` small
(the catalogue knows of 2 unterminated-href instances). Record the
three numbers in the commit message — a later batch will change them
and the delta is the evidence.

- [ ] **Step 6: Commit**

```bash
bun qa
git add admin/pipeline/transform/links.ts admin/pipeline/transform/links.test.ts
git commit -s -m "🦄 new(transform): the anchor view"
```

---

## Task 1: The link-target gate

**Goal:** `href` and `data-ref` stop being an ungated surface.

**Files:**
- Create: `admin/pipeline/transform/link-target.ts`
- Test: `admin/pipeline/transform/link-target.test.ts`
- Modify: `admin/pipeline/transform/types.ts` (add `composed`, `unlinks`)
- Modify: `admin/pipeline/transform/run.ts:36-42` (third gate)

**Acceptance Criteria:**
- [ ] A rule writing a target absent from the entry's input fails,
      naming the rule and the target
- [ ] A rule that adds an anchor fails
- [ ] A rule that removes an anchor without declaring `unlinks` fails,
      and one that declares the wrong count fails
- [ ] A compose whose remainder introduces a character absent from the
      anchor's display fails
- [ ] An undeclared compose fails even when the target looks plausible
- [ ] The three landed RTL rules still pass every gate unchanged

**Verify:** `bun test admin/pipeline/transform/` → all pass, including
the existing `rtl.test.ts`

**Steps:**

- [ ] **Step 1: Extend the result contract**

```ts
// admin/pipeline/transform/types.ts — added to TransformResult
interface TransformResult {
  /** Targets this call ASSEMBLED rather than copied whole (spec §3.2
   * case 3). `from` is the target in this entry's INPUT that supplied
   * the work; the gate takes the longest common prefix of `from` and
   * `target` as the copied work and requires every remaining
   * character of `target` to occur in that anchor's own display text.
   * An undeclared compose is a violation, not an allowance. */
  composed?: readonly { from: string; target: string }[];
  copied?: readonly string[];
  entry: SourceEntry;
  records: TransformRecord[];
  /** How many anchors this call REMOVED. The markup-delta gate reads a
   * dropped tag pair as an improvement, so this count is the only
   * thing standing between an accidental unlink and a clean run. */
  unlinks?: number;
}
```

- [ ] **Step 2: Write the failing gate tests**

```ts
// admin/pipeline/transform/link-target.test.ts
import { expect, test } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { checkLinkTargets } from './link-target.ts';
import type { Rule, TransformResult } from './types.ts';

const rule = { id: 'test-rule', phase: 'text-repairs' } as Rule;

/** One sense, one definition — the smallest entry the gate accepts. */
const entry = (definition: string): SourceEntry =>
  ({ content: { senses: [{ definition }] }, rid: 'T00001' }) as SourceEntry;

const A = (ref: string, display: string) =>
  `<a class="refLink" href="/${ref.replaceAll(' ', '_')}" data-ref="${ref}">${display}</a>`;

const result = (
  entryAfter: SourceEntry,
  extra: Partial<TransformResult> = {},
): TransformResult => ({ entry: entryAfter, records: [], ...extra });

const before = entry(`${A('Yoma 2a', 'Ib.')} and ${A('Shabbat 30b', 'Sabb. 30ᵇ')}`);

test('a fabricated target fails', () => {
  const after = entry(`${A('Nedarim 25a', 'Ib.')} and ${A('Shabbat 30b', 'Sabb. 30ᵇ')}`);
  expect(checkLinkTargets(before, after, rule, result(after))).toEqual([
    'test-rule: target "Nedarim 25a" is not in T00001\'s input',
  ]);
});

test('a target copied from a sibling anchor passes', () => {
  const after = entry(`${A('Shabbat 30b', 'Ib.')} and ${A('Shabbat 30b', 'Sabb. 30ᵇ')}`);
  expect(checkLinkTargets(before, after, rule, result(after))).toEqual([]);
});

test('adding an anchor fails', () => {
  const after = entry(`${A('Yoma 2a', 'Ib.')} and ${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Yoma 2a', 'x')}`);
  expect(checkLinkTargets(before, after, rule, result(after))).toEqual([
    'test-rule: anchor count grew 2 → 3 in T00001',
  ]);
});

test('an undeclared unlink fails and a declared one passes', () => {
  const after = entry(`Ib. and ${A('Shabbat 30b', 'Sabb. 30ᵇ')}`);
  expect(checkLinkTargets(before, after, rule, result(after))).toEqual([
    'test-rule: removed 1 anchor in T00001, declared 0',
  ]);
  expect(checkLinkTargets(before, after, rule, result(after, { unlinks: 1 }))).toEqual([]);
});

test('compose passes when the locus comes from the display', () => {
  const src = entry(`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Yoma 2a', 'Ib. 31a')}`);
  const after = entry(`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Shabbat 31a', 'Ib. 31a')}`);
  const claim = { from: 'Shabbat 30b', target: 'Shabbat 31a' };
  expect(
    checkLinkTargets(src, after, rule, result(after, { composed: [claim] })),
  ).toEqual([]);
});

test('compose fails when the locus is not in the display', () => {
  const src = entry(`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Yoma 2a', 'Ib.')}`);
  const after = entry(`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Shabbat 31a', 'Ib.')}`);
  const claim = { from: 'Shabbat 30b', target: 'Shabbat 31a' };
  expect(
    checkLinkTargets(src, after, rule, result(after, { composed: [claim] })),
  ).toEqual([
    'test-rule: composed "Shabbat 31a" adds "1a" absent from display "Ib."',
  ]);
});

test('an undeclared compose fails', () => {
  const src = entry(`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Yoma 2a', 'Ib. 31a')}`);
  const after = entry(`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Shabbat 31a', 'Ib. 31a')}`);
  expect(checkLinkTargets(src, after, rule, result(after))).toEqual([
    'test-rule: target "Shabbat 31a" is not in T00001\'s input',
  ]);
});
```

- [ ] **Step 3: Run the tests and watch them fail**

Run: `bun test admin/pipeline/transform/link-target.test.ts`
Expected: FAIL — `Cannot find module './link-target.ts'`

- [ ] **Step 4: Implement the gate**

```ts
/**
 * The link-target gate (batch-2 spec §3.2).
 *
 * The text gate strips tags before comparing — its own header says a
 * rule that adds an `<a href>` "would read as inventing text" — and
 * the markup gate compares a well-formedness DELTA, so an anchor
 * retargeted from a right address to a wrong one is well-formed on
 * both sides and passes clean. Until this gate, nothing looked at
 * `href` or `data-ref` at all: a rule could point 538 anchors at a
 * fabricated address and all three verification layers would report
 * success.
 *
 * The contract is one sentence: a rule may only write a link target it
 * can point at in this entry's own input.
 */
```

The check, per entry, over every anchor-bearing field:

1. Collect `beforeTargets` — every `href` and `data-ref` value in the
   input entry, as a `Set<string>`.
2. `after` anchor count must be `<=` the `before` count; a growth is a
   violation, and the shortfall must equal `result.unlinks ?? 0`.
3. For each anchor in `after`: if its `href` and `dataRef` are both in
   `beforeTargets`, it passes (cases 1 and 2 collapse into one check —
   an unchanged target is trivially in the input).
4. Otherwise it must be claimed by a `composed` entry whose `from` is
   in `beforeTargets`. Take `prefix = longestCommonPrefix(from,
   target)`; the remainder `target.slice(prefix.length)` must be a
   sub-multiset of the anchor's `display` characters. Same check for
   `href` against the `from` anchor's `href`.
5. Anything else is `target "X" is not in <rid>'s input`.

Field coverage matches `no-new-text.ts`'s `textOf` walk — every
text-bearing field including `language_reference` and nested
`sense.senses`. A field the gate cannot see passes vacuously, which is
worse than failing (spec §5), and `h-cognate-self-link`'s largest locus
is `language_reference`.

- [ ] **Step 5: Wire it into the runner**

```ts
// admin/pipeline/transform/run.ts — inside applyTransforms
const problems = [
  ...checkNoNewText(before, result.entry, rule, result.copied),
  ...checkMarkup(before, result.entry),
  ...checkLinkTargets(before, result.entry, rule, result),
];
```

- [ ] **Step 6: Run the whole transform suite**

Run: `bun test admin/pipeline/transform/`
Expected: all pass — the three RTL rules move wrappers and never touch
a target, so the new gate is a no-op for them. A failure here means the
gate mis-parses an anchor, not that the RTL rules changed.

- [ ] **Step 7: Commit**

```bash
bun qa
git add admin/pipeline/transform/link-target.ts admin/pipeline/transform/link-target.test.ts admin/pipeline/transform/types.ts admin/pipeline/transform/run.ts
git commit -s -m "🦄 new(transform): gate link targets"
```

---

## Task 2: Unlink — apparatus citations and rabbi names

**Goal:** Two rows (49 instances) where the anchor points at scripture
that the text never cited.

**Files:**
- Create: `admin/pipeline/transform/rules/unlink.ts`
- Test: `admin/pipeline/transform/rules/unlink.test.ts`
- Modify: `admin/pipeline/transform/registry.ts`

**Acceptance Criteria:**
- [ ] `apparatus-cite-linked-as-scripture` fires on A00135 and unlinks
      the `Judges 2:2` anchor, leaving "Jud. II, 2" as text
- [ ] `rabbi-name-linked-as-bible-book` unlinks only anchors whose
      display sits inside a rabbinic-name context, never a real
      biblical citation of the same book
- [ ] Both rules declare `unlinks` equal to the anchors they removed
- [ ] `bun transform:count` reports each rule within its catalogued
      count, or the delta is explained in the commit message
- [ ] Both rows removed from `PENDING` and registered

**Verify:** `bun test admin/pipeline/transform/rules/unlink.test.ts`
then `bun transform:count`

**Steps:**

- [ ] **Step 1: Find the population**

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { tokenize } from "./admin/pipeline/transform/html.ts";
import { anchors } from "./admin/pipeline/transform/links.ts";
const APPARATUS = /\b(?:Graetz|Aruch Completum|Monatsschr|ed\. Kohut)\b/u;
let hits = 0;
for await (const e of readSourceEntries()) {
  for (const s of e.content.senses) {
    if (s.definition === undefined) continue;
    const t = tokenize(s.definition);
    for (const a of anchors(t)) {
      const lead = s.definition.slice(0, s.definition.indexOf(a.display));
      if (APPARATUS.test(lead.slice(-80)) && /\d/u.test(a.dataRef)) {
        hits++;
        if (hits <= 10) console.log(e.rid, "|", a.dataRef, "|", a.display);
      }
    }
  }
}
console.log("hits", hits);
'
```

Expected: A00135 among them. The catalogued count is 8; a count far
above 8 means the predicate is too loose — tighten the lead window
before writing the rule, and record what you measured.

- [ ] **Step 2: Write the failing tests**

```ts
// admin/pipeline/transform/rules/unlink.test.ts
import { expect, test } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { applyTransforms } from '../run.ts';
import { apparatusCite } from './unlink.ts';

const entry = (definition: string): SourceEntry =>
  ({ content: { senses: [{ definition }] }, rid: 'A00135' }) as SourceEntry;

/** A00135, verbatim. */
const A00135 =
  'a district of Peræa (v. Graetz, Gesch. d. ' +
  '<a class="refLink" href="/Judges.2.2" data-ref="Judges 2:2">Jud. II, 2</a>).';

test('unlinks the apparatus citation, keeping the display', () => {
  const out = applyTransforms(entry(A00135), 'text-repairs', [apparatusCite]);
  expect(out.entry.content.senses[0]?.definition).toBe(
    'a district of Peræa (v. Graetz, Gesch. d. Jud. II, 2).',
  );
  expect(out.records).toHaveLength(1);
});

test('leaves a real biblical citation of the same book alone', () => {
  const real =
    'as in <a class="refLink" href="/Judges.2.2" data-ref="Judges 2:2">Jud. II, 2</a>.';
  const out = applyTransforms(entry(real), 'text-repairs', [apparatusCite]);
  expect(out.entry.content.senses[0]?.definition).toBe(real);
  expect(out.records).toHaveLength(0);
});
```

- [ ] **Step 3: Run and watch them fail**

Run: `bun test admin/pipeline/transform/rules/unlink.test.ts`
Expected: FAIL — `Cannot find module './unlink.ts'`

- [ ] **Step 4: Implement both rules**

```ts
/**
 * The unlink family: rows whose anchor is wrong and whose correct
 * target does not exist. The maintainer ruling of 2026-08-22 is to
 * drop the anchor and keep the display text — a link Jastrow never
 * made, resolving to an article the reader was never promised, is
 * linker debris. The body model's standing principle is the same one:
 * show only what Jastrow linked.
 *
 * Every rule here returns `unlinks` equal to the anchors it removed.
 * The markup-delta gate reads a dropped tag pair as an improvement, so
 * that count is the only check that the rule dropped what it meant to.
 */
```

`apparatusCite` — for each definition: tokenize, walk `anchors`, and
unlink an anchor when the 80 characters preceding it match the
apparatus cue and the anchor's `dataRef` is a scripture address. Skip
`malformed` anchors. Count removals into `unlinks`.

`rabbiName` — same shape, with the cue from the audit: a rabbinic name
context ("R. Josh.", "R. Simeon") where the anchor resolved the name to
a biblical book. Derive the exact cue from Step 1's listing before
writing it; do not guess at the abbreviations.

- [ ] **Step 5: Register both rules**

In `registry.ts`, append to `RULES` after the RTL trio and delete both
ids from `PENDING`. Unlink rules run BEFORE the compose rules of Tasks
7–8, because a compose rule reads the anchor sequence and must never
adopt a work from an anchor a later rule removes.

- [ ] **Step 6: Measure against the catalogue**

Run: `bun transform:count`
Expected: both rules present, each within its row's count. Record any
delta and its explanation in the commit message; a delta is a finding
for Task 11's write-back, not something to silence by loosening the
predicate.

- [ ] **Step 7: Commit**

```bash
bun qa
git add admin/pipeline/transform/rules/unlink.ts admin/pipeline/transform/rules/unlink.test.ts admin/pipeline/transform/registry.ts
git commit -s -m "🦄 new(transform): unlink apparatus and rabbi cites"
```

---

## Task 3: Unlink — anchored ellipsis fragments

**Goal:** 80 instances where print's word-head elision (`…תא`) was
resolved as if the fragment were a lemma.

**Files:**
- Modify: `admin/pipeline/transform/rules/unlink.ts`
- Modify: `admin/pipeline/transform/rules/unlink.test.ts`
- Modify: `admin/pipeline/transform/registry.ts`

**Acceptance Criteria:**
- [ ] The rule fires only when the anchor's display STARTS with `…`
- [ ] The 6 convention members the audit identified — sentence-level
      elisions whose next token is a complete, correctly linked word —
      are excluded by predicate, and the exclusion is tested
- [ ] Measured count is 88 occurrences across 80 entries, or the delta
      is recorded
- [ ] `ellipsis-fragment-anchored` registered and out of `PENDING`

**Verify:** `bun test admin/pipeline/transform/rules/unlink.test.ts`
then `bun transform:count`

**Steps:**

- [ ] **Step 1: List the whole population and read it**

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { tokenize } from "./admin/pipeline/transform/html.ts";
import { anchors } from "./admin/pipeline/transform/links.ts";
let occurrences = 0; const entries = new Set();
for await (const e of readSourceEntries()) {
  for (const s of e.content.senses) {
    if (s.definition === undefined) continue;
    for (const a of anchors(tokenize(s.definition))) {
      if (!a.display.startsWith("…")) continue;
      occurrences++; entries.add(e.rid);
      console.log(e.rid, "|", a.display, "->", a.dataRef);
    }
  }
}
console.error({ occurrences, entries: entries.size });
' > /tmp/ellipsis.txt
```

Expected: 88 occurrences / 80 entries. Read all 88 — the audit found
exactly 6 convention members and this is the cheapest place to confirm
them. If the numbers differ, the delta goes in the commit message and
into Task 11's write-back.

- [ ] **Step 2: Write the failing test**

```ts
test('unlinks an anchored elision fragment', () => {
  const definition =
    '(not <a class="refLink" href="/Jastrow,_יָם.1" data-ref="Jastrow, יָם 1">…ים</a>)';
  const out = applyTransforms(entry(definition), 'text-repairs', [ellipsisFragment]);
  expect(out.entry.content.senses[0]?.definition).toBe('(not …ים)');
  expect(out.records).toHaveLength(1);
});

test('leaves an anchored complete word after an ellipsis alone', () => {
  const definition =
    '… <a class="refLink" href="/Jastrow,_יָם.1" data-ref="Jastrow, יָם 1">יָם</a>';
  const out = applyTransforms(entry(definition), 'text-repairs', [ellipsisFragment]);
  expect(out.records).toHaveLength(0);
});
```

Replace both fixtures with real entries from Step 1's listing before
committing — the shapes above are the audit's examples, and the rid
must be the entry the fixture came from.

- [ ] **Step 3: Run and watch it fail**

Run: `bun test admin/pipeline/transform/rules/unlink.test.ts`
Expected: FAIL — `ellipsisFragment is not exported`

- [ ] **Step 4: Implement, register, measure**

Predicate: display starts with `…` (U+2026), the anchor is not
`malformed`, and the display's remainder is not itself a complete
headword — the convention arm. Declare `unlinks`.

Run: `bun transform:count` → the rule within its 80.

- [ ] **Step 5: Commit**

```bash
bun qa
git add admin/pipeline/transform/rules/unlink.ts admin/pipeline/transform/rules/unlink.test.ts admin/pipeline/transform/registry.ts
git commit -s -m "🦄 new(transform): unlink elision fragments"
```

---

## Task 4: `h-cognate-self-link` — measure before writing

**Goal:** Decide, by measurement, whether this row is a defect or a
convention — and write down which.

**Files:**
- Create: `data/patches/catalogue-audit/h-cognate-self-link.md`
- Modify: `admin/pipeline/transform/rules/unlink.ts` (only if it stays)
- Modify: `admin/pipeline/transform/registry.ts`

**Acceptance Criteria:**
- [ ] The `language_reference` locus is measured, not assumed: how many
      self-links, how many under a "b. h." etymology, and in how many
      the display differs from the headword only by plene/defective
      spelling
- [ ] The audit report states a verdict with its number
- [ ] If defect: a rule that fires on the defect arm alone, with the
      convention arm excluded by predicate and tested
- [ ] If convention: the row is reclassified to `judgment` in
      `patterns.jsonl` with the measured count and the reason, and
      moved out of `PENDING` in the same commit
- [ ] Either way the standing merge flag with
      `homograph-numbering-schism` is recorded, not acted on

**Verify:** `bun test admin/pipeline/transform/` and, when the row
stays, `bun transform:count`

**Steps:**

- [ ] **Step 1: Measure the three populations**

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { tokenize } from "./admin/pipeline/transform/html.ts";
import { anchors } from "./admin/pipeline/transform/links.ts";
let self = 0, bh = 0, spellingOnly = 0;
const strip = (s) => s.normalize("NFD").replace(/[֑-ׇ]/gu, "");
for await (const e of readSourceEntries()) {
  const lr = e.language_reference;
  if (lr === undefined) continue;
  for (const a of anchors(tokenize(lr))) {
    if (!a.dataRef.includes(e.headword)) continue;
    self++;
    if (/\bb\.\s*h\./u.test(lr.slice(0, lr.indexOf(a.display)))) bh++;
    if (strip(a.display) !== strip(e.headword)) continue;
    spellingOnly++;
  }
}
console.log({ bh, self, spellingOnly });
'
```

The audit's numbers to check against: 87 occurrences / 85 entries, 83
under "b. h.", and 69 of 77 differing from the headword only by
plene/defective spelling.

- [ ] **Step 2: Write the audit report**

`data/patches/catalogue-audit/h-cognate-self-link.md`, following the
shape of the existing reports in that directory: the measurement, the
null model, the falsifier, and a verdict sentence. The row's own recorded
caution is the thing to settle — "for a biblical form there is no
separate article for the link to promise" reads as convention, and
"any rule that matches ' h.' as a substring will sweep in ~75
convention cases" is the failure mode to avoid.

- [ ] **Step 3a (defect branch): implement the rule**

Same shape as Task 2's rules: unlink the anchor, keep the display,
declare `unlinks`. The predicate must exclude the plene/defective
convention arm measured in Step 1 — test that exclusion with a real
entry from the listing (A00314 and A00383 are both self-link shapes in
`language_reference`).

- [ ] **Step 3b (convention branch): reclassify**

Edit the row in `data/patches/patterns.jsonl` **surgically** — never
through `renderPatterns()`, which reformats all 149 rows and drops any
field it does not round-trip. Set `route` to `judgment`, keep
`corpusCount` at what Step 1 measured, and put the derivation in
`reason`. Remove the id from `PENDING`; the coverage gate counts
`route: transform` rows only, so a reclassified row must leave both
lists.

- [ ] **Step 4: Verify the coverage gate still balances**

Run: `bun test admin/pipeline/transform/registry.test.ts`
Expected: pass — `registered + pending === total` with no `unaccounted`
and no `duplicated`. On the convention branch the total drops by one.

- [ ] **Step 5: Commit**

```bash
bun qa
git add -A data/patches admin/pipeline/transform
git commit -s -m "🦄 new(transform): rule h-cognate self-links"   # defect branch
git commit -s -m "🧺 chore(catalogue): h-cognate is convention"    # convention branch
```

---

## Task 5: The geresh pair — entangled, written together

**Goal:** `geresh-letter-numeral-mislink` (475) and
`prefixed-geresh-abbrev-mislink` (173), written as one module because
they rewrite the same anchors.

**Files:**
- Create: `admin/pipeline/transform/rules/geresh.ts`
- Test: `admin/pipeline/transform/rules/geresh.test.ts`
- Modify: `admin/pipeline/transform/registry.ts`
- Modify: `data/patches/patterns.jsonl` (the `entangledWith` pair)

**Acceptance Criteria:**
- [ ] The overlap between the two rows is MEASURED — how many anchors
      match both predicates — before either rule is written
- [ ] If the overlap is non-zero, both rows carry each other in
      `entangledWith` and `checkAdjacency()` keeps them adjacent
- [ ] The strict arm only: an anchor is retargeted only when its
      geresh stub abbreviates the CONTAINING entry's headword
- [ ] The three excluded arms are excluded by predicate and each has a
      test: ~152 variant-reading stubs ("Ms. K. ב׳", "ed. ה׳", "Ar. ע׳"),
      ~20 "ר׳" = Rabbi, ~19 anchors inside the numeral articles
      themselves where the link is correct
- [ ] Every retarget passes gate case 2 — the target is the entry's own
      `Jastrow, <headword> N`, copied from an existing anchor in the
      same entry — and a member whose entry holds no such anchor is
      DECLINED, counted, and reported
- [ ] `bun transform:count` reproduces 475 and 173, or the deltas are
      recorded for Task 11

**Verify:** `bun test admin/pipeline/transform/rules/geresh.test.ts`
then `bun transform:count`

**Steps:**

- [ ] **Step 1: Measure the overlap**

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { tokenize } from "./admin/pipeline/transform/html.ts";
import { anchors } from "./admin/pipeline/transform/links.ts";
const GERESH = /^(?<prefix>[א-ת]?)(?<letter>[א-ת])[׳']$/u;
let bare = 0, prefixed = 0, both = 0;
for await (const e of readSourceEntries()) {
  for (const s of e.content.senses) {
    if (s.definition === undefined) continue;
    for (const a of anchors(tokenize(s.definition))) {
      const m = GERESH.exec(a.display.trim());
      if (m === null) continue;
      if (m.groups?.prefix === "") bare++; else prefixed++;
      if (a.dataRef.startsWith("Jastrow,")) both++;
    }
  }
}
console.log({ bare, both, prefixed });
'
```

The two rows are the same defect with and without a particle prefix, so
`both` is the number that decides whether `entangledWith` is real. The
lesson batch 1 paid for: the RTL trio's entanglement was recorded in
prose and absent from the field the registry gate reads, and
`transform:count` cannot see that class of defect.

- [ ] **Step 2: Write the failing tests**

```ts
// admin/pipeline/transform/rules/geresh.test.ts
import { expect, test } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { applyTransforms } from '../run.ts';
import { gereshLetterNumeral, prefixedGereshAbbrev } from './geresh.ts';

const entry = (definition: string, headword: string): SourceEntry =>
  ({
    content: { senses: [{ definition }] },
    headword,
    rid: 'K00001',
  }) as SourceEntry;

/** The host's own headword is already anchored elsewhere in the entry,
 * which is what makes the retarget a COPY rather than a composition. */
const own =
  '<a class="refLink" href="/Jastrow,_כָּלוּל.1" data-ref="Jastrow, כָּלוּל 1">כָּלוּל</a>';

test('retargets a one-letter geresh stub to the containing entry', () => {
  const definition =
    `${own}; cmp. <a class="refLink" href="/Jastrow,_כ.1" data-ref="Jastrow, כ 1">כ׳</a>`;
  const out = applyTransforms(entry(definition, 'כָּלוּל'), 'text-repairs', [
    gereshLetterNumeral,
  ]);
  expect(out.entry.content.senses[0]?.definition).toContain(
    'data-ref="Jastrow, כָּלוּל 1">כ׳</a>',
  );
  expect(out.records).toHaveLength(1);
});

test('declines when the entry holds no anchor to its own headword', () => {
  const definition =
    'cmp. <a class="refLink" href="/Jastrow,_כ.1" data-ref="Jastrow, כ 1">כ׳</a>';
  const out = applyTransforms(entry(definition, 'כָּלוּל'), 'text-repairs', [
    gereshLetterNumeral,
  ]);
  expect(out.records).toHaveLength(0);
});

test('leaves a variant-reading stub alone', () => {
  const definition =
    `${own}; Ms. K. <a class="refLink" href="/Jastrow,_ב.1" data-ref="Jastrow, ב 1">ב׳</a>`;
  const out = applyTransforms(entry(definition, 'כָּלוּל'), 'text-repairs', [
    gereshLetterNumeral,
  ]);
  expect(out.records).toHaveLength(0);
});

test('leaves ר׳ = Rabbi alone', () => {
  const definition =
    `${own}; <a class="refLink" href="/Jastrow,_ר.1" data-ref="Jastrow, ר 1">ר׳</a> Josh.`;
  const out = applyTransforms(entry(definition, 'כָּלוּל'), 'text-repairs', [
    gereshLetterNumeral,
  ]);
  expect(out.records).toHaveLength(0);
});

test('the prefixed arm retargets through its particle', () => {
  const definition =
    `${own}; <a class="refLink" href="/Jastrow,_בכ.1" data-ref="Jastrow, בכ 1">בכ׳</a>`;
  const out = applyTransforms(entry(definition, 'כָּלוּל'), 'text-repairs', [
    prefixedGereshAbbrev,
  ]);
  expect(out.records).toHaveLength(1);
});
```

Replace every fixture with a real entry from Step 1's listing, keeping
the rid. The shapes above come from the audit; the bytes must come from
the corpus.

- [ ] **Step 3: Run and watch them fail**

Run: `bun test admin/pipeline/transform/rules/geresh.test.ts`
Expected: FAIL — `Cannot find module './geresh.ts'`

- [ ] **Step 4: Implement both rules**

Shared helpers in one module, one exported `Rule` each. The retarget
target is found by scanning the SAME entry's anchors for one whose
`dataRef` begins `Jastrow, <headword>` — copy both its `href` and
`dataRef` verbatim, which is what makes the write pass gate case 2 with
no `composed` declaration. When no such anchor exists the rule declines
and increments a decline counter reported at the end of the run.

The exclusions, each a separate named predicate so a test can name it:

| Arm | Excluded because |
|---|---|
| variant reading | the stub abbreviates a reading named in the prose ("Ms. K.", "ed.", "Ar.", "Var."), not the headword — retargeting would ASSERT the variant is the lemma |
| "ר׳" | it is Rabbi before a name and should not be a lexical link at all — unlink is Task 4's machine, not this one; leave it and record the count |
| inside the numeral articles | the link to a letter's numeral article is correct there — convention |

- [ ] **Step 5: Register adjacent, in measured order**

Both rules go into `RULES` as an adjacent pair. Order between them is
measured, not aesthetic: run the corpus once with each order and
compare the record counts. Batch 1's RTL trio is the precedent — the
wrong order left 62 entries unfixed and no unit test could see it.
Record the measurement in the module docstring.

- [ ] **Step 6: Write `entangledWith` into the catalogue**

If Step 1 measured a real overlap, add each row's id to the other's
`entangledWith` in `data/patches/patterns.jsonl` — surgically, one line
each — and confirm `checkAdjacency()` now enforces what the docstring
claims.

- [ ] **Step 7: Measure and commit**

Run: `bun transform:count` → 475 and 173, or a recorded delta.

```bash
bun qa
git add admin/pipeline/transform/rules/geresh.ts admin/pipeline/transform/rules/geresh.test.ts admin/pipeline/transform/registry.ts data/patches/patterns.jsonl
git commit -s -m "🦄 new(transform): the geresh abbrev pair"
```

---

## Task 6: `plural-to-feminine-final-letter-mislink`

**Goal:** 57 entries whose printed plural is anchored to their feminine
sibling instead of to themselves.

**Files:**
- Create: `admin/pipeline/transform/rules/misc-links.ts`
- Test: `admin/pipeline/transform/rules/misc-links.test.ts`
- Modify: `admin/pipeline/transform/registry.ts`

**Acceptance Criteria:**
- [ ] Fires only inside the host's own `plural_form`, the locus that
      holds 58 of the 68 occurrences
- [ ] Retargets to the host entry, copying the target from an existing
      anchor to the host in the same entry; declines otherwise
- [ ] A display ending `-יּוֹת` (the feminine's own plural) never fires —
      the audit's base rate for a legitimate member is ~1/500
- [ ] The 10 variant-reading members ("Ms.", "read", "Mish. ed.") that
      overlap `corrigendum-reading-linked` are excluded and counted
- [ ] `bun transform:count` reproduces 57, or the delta is recorded

**Verify:** `bun test admin/pipeline/transform/rules/misc-links.test.ts`
then `bun transform:count`

**Steps:**

- [ ] **Step 1: List the population**

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { tokenize } from "./admin/pipeline/transform/html.ts";
import { anchors } from "./admin/pipeline/transform/links.ts";
let n = 0;
for await (const e of readSourceEntries()) {
  const pf = e.plural_form;
  if (pf === undefined) continue;
  for (const a of anchors(tokenize(Array.isArray(pf) ? pf.join(" ") : pf))) {
    if (!/(?:ים|ין)$/u.test(a.display.replace(/[֑-ׇ]/gu, ""))) continue;
    if (!/ית\b/u.test(a.dataRef.replace(/[֑-ׇ]/gu, ""))) continue;
    n++;
    console.log(e.rid, "|", e.headword, "|", a.display, "->", a.dataRef);
  }
}
console.error({ n });
'
```

Expected: ~58. C01080 (גַּנָּב, plural anchored to גַּנָּבִית) is the
audit's worked example and makes the first fixture.

- [ ] **Step 2: Write the failing test**

```ts
test('retargets the host plural away from the feminine sibling', () => {
  const out = applyTransforms(C01080, 'text-repairs', [pluralToFeminine]);
  expect(out.records).toHaveLength(1);
  expect(JSON.stringify(out.entry.plural_form)).toContain('Jastrow, גַּנָּב 1');
});

test('leaves a feminine plural in -יּוֹת alone', () => {
  const out = applyTransforms(FEMININE_OWN_PLURAL, 'text-repairs', [pluralToFeminine]);
  expect(out.records).toHaveLength(0);
});
```

`C01080` and `FEMININE_OWN_PLURAL` are entry constants built from real
snapshot rows at the top of the test file, in the shape Task 2 uses.

- [ ] **Step 3: Run, implement, measure**

Run: `bun test admin/pipeline/transform/rules/misc-links.test.ts` →
FAIL, then implement until PASS, then `bun transform:count`.

- [ ] **Step 4: Commit**

```bash
bun qa
git add admin/pipeline/transform/rules/misc-links.ts admin/pipeline/transform/rules/misc-links.test.ts admin/pipeline/transform/registry.ts
git commit -s -m "🦄 new(transform): plural retarget off feminine"
```

---

## Task 7: `ib-yoma-2a` — the anaphora machine

**Goal:** 312 unaudited entries where every `Ib.` fell to the same
fixed target. This task builds the compose machine the next task
reuses.

**Files:**
- Create: `admin/pipeline/transform/rules/anaphora.ts`
- Test: `admin/pipeline/transform/rules/anaphora.test.ts`
- Create: `data/patches/catalogue-audit/ib-yoma-2a.md`
- Modify: `admin/pipeline/transform/registry.ts`

**Acceptance Criteria:**
- [ ] The row's audit is written first: how many `Ib.` anchors resolve
      to `Yoma 2a`, how many of those entries hold a preceding citation
      anchor, and how many of those the display can supply a locus for
- [ ] The antecedent is the nearest preceding anchor IN THE SAME
      DEFINITION whose target is not itself `Yoma 2a`
- [ ] A retarget that copies the antecedent's target whole passes as
      case 2 with no declaration
- [ ] A retarget that changes the locus declares `composed: [{from,
      target}]` and passes case 3 — work copied whole, remainder ⊆ the
      anchor's own display
- [ ] The rule DECLINES when there is no antecedent, or when the
      display carries a locus the antecedent's work cannot take; the
      decline count is reported and recorded
- [ ] The measured fire count and the decline count together account
      for the row's 312

**Verify:** `bun test admin/pipeline/transform/rules/anaphora.test.ts`
then `bun transform:count`

**Steps:**

- [ ] **Step 1: Audit the row**

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { tokenize } from "./admin/pipeline/transform/html.ts";
import { anchors } from "./admin/pipeline/transform/links.ts";
let total = 0, withAntecedent = 0, locusInDisplay = 0;
for await (const e of readSourceEntries()) {
  for (const s of e.content.senses) {
    if (s.definition === undefined) continue;
    const list = anchors(tokenize(s.definition));
    list.forEach((a, i) => {
      if (a.dataRef !== "Yoma 2a" && !a.dataRef.startsWith("Yoma 2a:")) return;
      total++;
      const prior = list.slice(0, i).reverse().find((p) => !p.dataRef.startsWith("Yoma 2a"));
      if (prior === undefined) return;
      withAntecedent++;
      if (/\d/u.test(a.display)) locusInDisplay++;
    });
  }
}
console.log({ locusInDisplay, total, withAntecedent });
'
```

Write the three numbers, the null model and a falsifier into
`data/patches/catalogue-audit/ib-yoma-2a.md`. The row has never had a
`reason`; this audit becomes it in Task 11.

A00445 is the worked example: its anchors run `Jerusalem Talmud Maaser
Sheni 4:6:11` → `Yoma 2a` (display `Ib.`) → later citations. The
antecedent is one anchor above, in the same definition.

- [ ] **Step 2: Write the failing tests**

```ts
// admin/pipeline/transform/rules/anaphora.test.ts
import { expect, test } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { applyTransforms } from '../run.ts';
import { ibAnaphora } from './anaphora.ts';

const entry = (definition: string): SourceEntry =>
  ({ content: { senses: [{ definition }] }, rid: 'A00445' }) as SourceEntry;

const YMS =
  '<a class="refLink" href="/Jerusalem_Talmud_Maaser_Sheni.4.6.11" ' +
  'data-ref="Jerusalem Talmud Maaser Sheni 4:6:11">Y. Maas. Sh. IV, 55ᶜ</a>';
const IB = (display: string) =>
  `<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">${display}</a>`;

test('a bare Ib. copies the antecedent target whole', () => {
  const out = applyTransforms(entry(`${YMS}; ${IB('Ib.')}`), 'text-repairs', [ibAnaphora]);
  expect(out.entry.content.senses[0]?.definition).toContain(
    'data-ref="Jerusalem Talmud Maaser Sheni 4:6:11">Ib.</a>',
  );
});

test('no antecedent means no change', () => {
  const out = applyTransforms(entry(IB('Ib.')), 'text-repairs', [ibAnaphora]);
  expect(out.records).toHaveLength(0);
});

test('a locus the display does not carry is declined, not composed', () => {
  const out = applyTransforms(entry(`${YMS}; ${IB('Ib.')}`), 'text-repairs', [ibAnaphora]);
  expect(out.copied ?? []).not.toContain('Jerusalem Talmud Maaser Sheni 5:1');
});
```

- [ ] **Step 3: Run and watch them fail**

Run: `bun test admin/pipeline/transform/rules/anaphora.test.ts`
Expected: FAIL — `Cannot find module './anaphora.ts'`

- [ ] **Step 4: Implement**

```ts
/**
 * The `ib.` family (batch-2 spec §4, rows 8–10). An anaphoric citation
 * means "the same place as the last one"; the linker resolved it as a
 * standalone lookup and landed on a fixed target regardless of
 * context.
 *
 * The correct target is entry-local by construction — it is the
 * anchor above. That is what keeps this batch inside the gate: the
 * rule copies a target the entry already holds (case 2), or composes
 * one from that target's work plus a locus the display itself shows
 * (case 3, declared). It never invents an address.
 *
 * Where neither is possible the rule DECLINES. A decline is a
 * measurement, not a failure: the counts feed the row's write-back.
 */
```

The rule walks each definition's anchors in order, keeps the last
non-anaphoric target as the antecedent, and for each anaphoric anchor
either copies (bare display) or composes (display carries a locus).
Compose returns `{ from: antecedent.dataRef, target }` so the gate can
check the remainder against the display.

- [ ] **Step 5: Register, measure, commit**

Register after the unlink rules (an unlink must never remove an anchor
this rule would have used as an antecedent), then:

Run: `bun transform:count` → fires + declines account for 312.

```bash
bun qa
git add admin/pipeline/transform/rules/anaphora.ts admin/pipeline/transform/rules/anaphora.test.ts admin/pipeline/transform/registry.ts data/patches/catalogue-audit/ib-yoma-2a.md
git commit -s -m "🦄 new(transform): resolve ib. to its antecedent"
```

---

## Task 8: The two small anaphora arms

**Goal:** `ib-targum-work-loss` (8) and `sifre-ib-resolves-to-yalkut`
(5) — the same machine, two different wrong sinks.

**Files:**
- Modify: `admin/pipeline/transform/rules/anaphora.ts`
- Modify: `admin/pipeline/transform/rules/anaphora.test.ts`
- Modify: `admin/pipeline/transform/registry.ts`

**Acceptance Criteria:**
- [ ] `ib-targum-work-loss` retargets an `ib.` inside a Targum run to
      the Targum work carried by its antecedent, never to the plain
      Hebrew-Bible book
- [ ] `sifre-ib-resolves-to-yalkut` retargets `Sifré ib. N` to the
      Sifré work its antecedent names, and declines when the entry
      holds no Sifré antecedent
- [ ] Both reuse Task 7's antecedent walk rather than re-implementing
      it
- [ ] All 13 instances are read by hand and each is confirmed or
      declined; the tally is in the commit message

**Verify:** `bun test admin/pipeline/transform/rules/anaphora.test.ts`
then `bun transform:count`

**Steps:**

- [ ] **Step 1: List all 13 and read them**

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { tokenize } from "./admin/pipeline/transform/html.ts";
import { anchors } from "./admin/pipeline/transform/links.ts";
for await (const e of readSourceEntries()) {
  for (const s of e.content.senses) {
    if (s.definition === undefined) continue;
    const list = anchors(tokenize(s.definition));
    list.forEach((a, i) => {
      const targum = /Targ/u.test(s.definition ?? "") && /^(?:ib|Ib)\./u.test(a.display);
      const sifre = /Sifr[eé]/u.test(a.display) || /Yalkut/u.test(a.dataRef);
      if (!targum && !sifre) return;
      console.log(e.rid, "|", a.display, "->", a.dataRef, "| prev:", list[i - 1]?.dataRef);
    });
  }
}
'
```

Thirteen instances is small enough to read every one. Do that before
writing a predicate — the rows are 8 and 5, and a rule that fires on 20
is wrong even if all 13 are among them.

- [ ] **Step 2: Write the failing tests**

Two tests per row, both built from rids in Step 1's listing: one that
retargets, one that declines when the antecedent does not name the
work. Follow the fixture shape in Task 7's test file.

- [ ] **Step 3: Implement, register adjacent to Task 7's rule, measure**

Run: `bun transform:count` → 8 and 5, or a recorded delta.

- [ ] **Step 4: Commit**

```bash
bun qa
git add admin/pipeline/transform/rules/anaphora.ts admin/pipeline/transform/rules/anaphora.test.ts admin/pipeline/transform/registry.ts
git commit -s -m "🦄 new(transform): targum and sifre ib. arms"
```

---

## Task 9: `homograph-numeral-mismatch` — audit, then decide

**Goal:** 538 anchors whose display ends in a Roman homograph numeral
that disagrees with the numeral in their own `data-ref`. Which side is
authoritative has never been measured.

**Files:**
- Create: `data/patches/catalogue-audit/homograph-numeral-mismatch.md`
- Modify: `admin/pipeline/transform/rules/misc-links.ts` (only if the
  repair is a retarget)
- Modify: `admin/pipeline/transform/registry.ts`
- Modify: `data/patches/patterns.jsonl`

**Acceptance Criteria:**
- [ ] The audit answers one question with numbers: when display and
      `data-ref` disagree, which one matches the target entry that
      actually exists?
- [ ] The verdict is one of three, and the report says which and why:
      **retarget** (the display is right — batch 2 writes the rule);
      **display fix** (the `data-ref` is right — the repair is a text
      edit, which belongs to batch 3, and the row is re-filed with the
      measurement); **judgment** (no mechanical discriminator — the row
      is reclassified with its count)
- [ ] On the retarget branch, every write passes gate case 2 or 3 — a
      numeral swap that cannot be sourced from the entry is DECLINED
- [ ] The row's `reason` is written either way

**Verify:** `bun test admin/pipeline/transform/` and, on the retarget
branch, `bun transform:count`

**Steps:**

- [ ] **Step 1: Measure which side agrees with a real target**

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { tokenize } from "./admin/pipeline/transform/html.ts";
import { anchors } from "./admin/pipeline/transform/links.ts";
const ROMAN = /\b(?<n>[IVX]+)\s*$/u;
const headwords = new Map();
const rows = [];
for await (const e of readSourceEntries()) {
  headwords.set(e.headword, (headwords.get(e.headword) ?? 0) + 1);
  for (const s of e.content.senses) {
    if (s.definition === undefined) continue;
    for (const a of anchors(tokenize(s.definition))) {
      const shown = ROMAN.exec(a.display)?.groups?.n;
      const targeted = ROMAN.exec(a.dataRef.replace(/\s+\d+$/u, ""))?.groups?.n;
      if (shown === undefined || targeted === undefined || shown === targeted) continue;
      rows.push({ display: a.display, rid: e.rid, target: a.dataRef });
    }
  }
}
console.log({ mismatches: rows.length });
console.log(rows.slice(0, 20));
'
```

Then, for a hand-read sample of at least 30, check which numeral names
an entry that exists. That is the discriminator; a count alone does not
decide it. Record the sample size and the split.

- [ ] **Step 2: Write the audit report and the verdict**

`data/patches/catalogue-audit/homograph-numeral-mismatch.md`:
measurement, null model, falsifier, verdict. State the sample size next
to every percentage — the recurring defect batch 1 recorded was
exhaustiveness claims that were not exhaustive.

- [ ] **Step 3: Take the branch the verdict names**

Retarget branch: implement in `misc-links.ts`, register, measure with
`bun transform:count`, and test both a firing case and a declined one.

Display-fix or judgment branch: no rule. Edit the row surgically in
`patterns.jsonl` — new `reason`, and `route` changed only on the
judgment branch — and remove the id from `PENDING` when it stops being
a transform row. Note in the commit message that batch 2 lands 11 rows
/ 1,256 instances rather than 12 / 1,794.

- [ ] **Step 4: Verify the coverage gate balances and commit**

Run: `bun test admin/pipeline/transform/registry.test.ts` → pass.

```bash
bun qa
git add -A data/patches admin/pipeline/transform
git commit -s -m "🦄 new(transform): rule homograph numerals"   # retarget branch
git commit -s -m "📖 doc(catalogue): homograph numerals audited"  # other branches
```

---

## Task 10: `shuruk-as-yod-display-corruption`

**Goal:** 12 anchors whose display writes `יּ` (yod + dagesh) where the
word and its correctly-resolved target both have `וּ` (shuruk).

**Files:**
- Modify: `admin/pipeline/transform/rules/misc-links.ts`
- Modify: `admin/pipeline/transform/rules/misc-links.test.ts`
- Modify: `admin/pipeline/transform/registry.ts`

**Acceptance Criteria:**
- [ ] The rule fires only when the anchor's target already resolves
      correctly — the display is corrupt, the link is not
- [ ] The target is untouched, so the link-target gate sees case 1 on
      every anchor
- [ ] The `allows` declaration names the OCR ruling of 2026-08-11 in a
      comment, and lists only the codepoints the swap introduces
- [ ] All 12 are listed and each is confirmed by hand before the rule
      is written
- [ ] `bun transform:count` reproduces 12

**Verify:** `bun test admin/pipeline/transform/rules/misc-links.test.ts`
then `bun transform:count`

**Steps:**

- [ ] **Step 1: List all 12**

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { tokenize } from "./admin/pipeline/transform/html.ts";
import { anchors } from "./admin/pipeline/transform/links.ts";
for await (const e of readSourceEntries()) {
  for (const s of e.content.senses) {
    if (s.definition === undefined) continue;
    for (const a of anchors(tokenize(s.definition))) {
      if (!a.display.includes("יּ")) continue;
      if (!a.dataRef.includes("וּ")) continue;
      console.log(e.rid, "|", a.display, "->", a.dataRef);
    }
  }
}
'
```

- [ ] **Step 2: Write the failing test**

```ts
test('rewrites the corrupt display and leaves the target alone', () => {
  const out = applyTransforms(SHURUK_FIXTURE, 'text-repairs', [shurukAsYod]);
  const definition = out.entry.content.senses[0]?.definition ?? '';
  expect(definition).toContain('וּ');
  expect(definition).not.toContain('יּ');
  expect(definition).toContain(SHURUK_FIXTURE_TARGET);
});
```

`SHURUK_FIXTURE` is a real entry from Step 1; `SHURUK_FIXTURE_TARGET`
is its unchanged `data-ref` attribute string.

- [ ] **Step 3: Implement with the allowance**

```ts
/** The swap introduces a vav where the source had a yod. Correcting a
 * mis-recognized glyph is correction, not composition — the maintainer
 * ruling of 2026-08-11, the same one behind the OCR class in
 * `no-new-text.ts`. `allows` flattens to individual codepoints, so
 * this permits U+05D5 anywhere in this rule's diff and nothing else. */
allows: ['ו'],
```

Note the blast radius in the comment: the gate credits the codepoint
anywhere in the rule's diff, not only in the token that was swapped.

- [ ] **Step 4: Register, measure, commit**

Run: `bun transform:count` → 12.

```bash
bun qa
git add admin/pipeline/transform/rules/misc-links.ts admin/pipeline/transform/rules/misc-links.test.ts admin/pipeline/transform/registry.ts
git commit -s -m "🦄 new(transform): shuruk display corruption"
```

---

## Task 11: Compose, write back, and close the batch

**Goal:** Prove the rules do not undo each other, make every catalogue
row true, and leave the docs matching what shipped.

**Files:**
- Create: `admin/pipeline/transform/registry.order.test.ts`
- Modify: `data/patches/patterns.jsonl`
- Modify: `docs/specs/2026-08-22-transform-module-design.md` (§7 table)
- Modify: `docs/v2/phase-2-triage.md`
- Create: `docs/v2/transform-batch-2.md` (the batch report)

**Acceptance Criteria:**
- [ ] A composed corpus pass runs EVERY registered rule in registry
      order over all 32,512 entries with zero gate failures
- [ ] Per-rule fire counts from the composed pass are compared against
      the isolated counts from `bun transform:count`; every difference
      is explained in the batch report, not averaged away
- [ ] `registry.order.test.ts` asserts unlink rules precede compose
      rules, and that entangled rows are adjacent
- [ ] `bun body:migrate-dry` reports 32,512/32,512 on all four
      round-trip gates, 0 schema failures, 0 quarantines, 0 repair
      failures, 0 transform failures
- [ ] Every row this batch touched has a true `reason` and a
      `corpusCount` the rule reproduces; every reclassified row has its
      `route` changed and is out of `PENDING`
- [ ] The module spec's §7 table records batch 2 as shipped, with the
      deferred rows named
- [ ] `docs/v2/phase-2-triage.md`'s queue tables and totals match the
      catalogue after the write-backs

**Verify:** `bun qa && bun transform:count && bun body:migrate-dry`

**Steps:**

- [ ] **Step 1: Run the composed pass**

```bash
bun -e '
import { readSourceEntries } from "./admin/pipeline/body/source.ts";
import { RULES } from "./admin/pipeline/transform/registry.ts";
import { applyTransforms } from "./admin/pipeline/transform/run.ts";
const fired = new Map();
let entries = 0;
for await (const e of readSourceEntries()) {
  entries++;
  const { records } = applyTransforms(e, "text-repairs", RULES);
  for (const r of records) fired.set(r.ruleId, (fired.get(r.ruleId) ?? 0) + 1);
}
console.log({ entries, fired: Object.fromEntries([...fired].sort()) });
'
```

Expected: no throw. A throw names the rule that tripped a gate, which
is the point — the composed pass is the only layer that can see one
rule undoing another. `transform:count` measures rules in isolation and
cannot see this class of defect; batch 1's RTL trio proved it, where
the wrong order left 62 entries unfixed with every unit test green.

- [ ] **Step 2: Compare composed against isolated counts**

Put the two columns side by side in `docs/v2/transform-batch-2.md`:

| Rule | Isolated (`transform:count`) | Composed | Why they differ |
|---|---:|---:|---|

A difference is expected where an earlier unlink removes an anchor a
later rule would have read. An UNEXPLAINED difference is a defect, not
a rounding detail.

- [ ] **Step 3: Write the order test**

```ts
// admin/pipeline/transform/registry.order.test.ts
import { expect, test } from 'bun:test';
import { RULES } from './registry.ts';

const UNLINK = new Set([
  'apparatus-cite-linked-as-scripture',
  'ellipsis-fragment-anchored',
  'rabbi-name-linked-as-bible-book',
]);
const COMPOSE = new Set([
  'ib-targum-work-loss',
  'ib-yoma-2a',
  'sifre-ib-resolves-to-yalkut',
]);

test('every unlink rule precedes every compose rule', () => {
  const ids = RULES.map((r) => r.id);
  const lastUnlink = Math.max(...ids.map((id, i) => (UNLINK.has(id) ? i : -1)));
  const firstCompose = Math.min(
    ...ids.map((id, i) => (COMPOSE.has(id) ? i : Number.POSITIVE_INFINITY)),
  );
  expect(lastUnlink).toBeLessThan(firstCompose);
});
```

Add `h-cognate-self-link` to `UNLINK` if Task 4 kept it as a rule. The
reason is behavioural: a compose rule adopts a work from a neighbouring
anchor, and it must not adopt one from an anchor a later rule deletes.

- [ ] **Step 4: Write back to the catalogue**

Surgical single-line edits only. Never `renderPatterns()` — it emits
compact JSON while the file uses spaced separators, so a re-render
rewrites all 149 rows and buries the intended change in a whole-file
diff no reviewer can read.

Checklist, one line per row this batch touched:

| Field | When |
|---|---|
| `reason` | every row that had none: `prefixed-geresh-abbrev-mislink`, `ib-yoma-2a`, `homograph-numeral-mismatch` |
| `corpusCount` | whenever the rule's measured count differs from the catalogued one |
| `entangledWith` | the geresh pair, if Task 5 measured a real overlap |
| `route` | any row that withdrew to `judgment` |

- [ ] **Step 5: Update the specs and the triage**

- Module spec §7: amend the batch-2 row to what shipped — rows,
  instances, and the deferral of the never-linked family (6 / 4,192)
  plus `v-sub-redirect-stub-mislink` and `containment-fallback-mislink`
  (183).
- `docs/v2/phase-2-triage.md`: recompute the three route totals, the
  cutover cross-cut, and the transform queue table from the catalogue
  after Step 4 — do not hand-edit the numbers.

```bash
bun -e '
import { parsePatterns, transformQueue } from "./admin/pipeline/research/patterns.ts";
const rows = parsePatterns(await Bun.file("data/patches/patterns.jsonl").text());
const by = (r) => r.route;
const totals = {};
for (const r of rows.filter((r) => r.route !== undefined)) {
  totals[by(r)] ??= { instances: 0, rows: 0 };
  totals[by(r)].rows++;
  totals[by(r)].instances += r.corpusCount;
}
console.log(totals, "queue", transformQueue(rows).length);
'
```

- [ ] **Step 6: Run the full gate battery**

```bash
bun qa
bun transform:count
bun body:migrate-dry
```

Expected: qa clean; `transform:count` 0 mismatches or only documented
unit-mismatch findings; `migrate-dry` 32,512/32,512 on all four
round-trip gates, 0 schema failures, 0 quarantines, 0 repair failures,
0 transform failures.

- [ ] **Step 7: Write the batch report and commit**

`docs/v2/transform-batch-2.md`: what shipped, what withdrew, the
isolated-vs-composed table, the decline counts from Tasks 7–9, and the
gate output verbatim.

```bash
git add -A docs data/patches admin/pipeline/transform
git commit -s -m "📖 doc(v2): close transform batch 2"
```

- [ ] **Step 8: Open the PR**

Run the full local review battery BEFORE pushing — cloud CodeRabbit is
skipped on this repository, so the local pass is the only review.

```bash
git push -u origin impl/phase-2-batch-2
gh pr create --base v2 --title "🦄 new(transform): phase 2 batch 2 — link transforms" --body-file docs/v2/transform-batch-2.md
```

Workers Builds will be red on this PR: `wrangler.jsonc` deploys
`assets: ./app` and `app/` does not arrive until Phase 4. Not a
regression — #44 and #45 both merged with it red.

---

## Notes for the executing session

- **A decline is a result.** Tasks 7–9 all measure a population the
  rule deliberately does not touch. Those numbers belong in the batch
  report and the catalogue, not in a loosened predicate.
- **Withdrawal is a normal outcome.** Tasks 4 and 9 may end with no
  rule. Batch 1 shipped 3 of a planned 4 rows for exactly this reason,
  and the spec's §5.2 exists to record it.
- **Write what a re-run will find.** Batch 1's recurring defect was
  claims in permanent records that the next run would contradict — an
  exhaustiveness claim that was not exhaustive, twice. Every count in a
  docstring, report or commit message must be reproducible by the
  command printed next to it.
