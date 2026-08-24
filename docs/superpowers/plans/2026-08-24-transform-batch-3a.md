# Transform Batch 3a Implementation Plan — gershayim

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ASCII `"` standing in for a gershayim with `״`
across every surviving field and inside link attributes — 2,302
occurrences in 1,392 entries — in one pass, so that the 90 broken link
targets and the headwords they point at move together.

**Architecture:** One predicate (an ASCII `"` with a Hebrew letter on
both sides) and one substitution, in a shared module. Two `Rule`
objects over it, partitioned by locus — document text and tag interior
— because `Rule.id` names one catalogue row and each row keeps its own
count. A fifth case in the link-target gate licenses a corrected
`data-ref`/`href` by byte-identity of the whole opening tag under the
inverse substitution.

**Tech Stack:** Bun, TypeScript, `bun test`, Biome. Zero runtime
dependencies.

**Global Constraints:**
- Read [the batch-3a spec](../../specs/2026-08-24-gershayim-transform-design.md)
  before Task 0, and [the module spec](../../specs/2026-08-22-transform-module-design.md)
  §3–§6 plus [the batch-2 link spec](../../specs/2026-08-22-link-transform-design.md)
  §3.2 before Task 1. This plan implements their contracts; it does
  not restate them.
- **The substitution is `"` → `״` in place. Nothing moves.** No
  character is inserted, deleted, or repositioned. Output length in
  codepoints equals input length, in every field, on every entry.
- A `Rule` never carries an expected count. Counts live in
  `patterns.jsonl` and only `transform:count` reads them.
- `Rule.apply` treats `entry` as immutable and returns a NEW object.
  `count.ts` deep-freezes the corpus; an in-place mutator throws.
- Hebrew is `html.ts`'s exported `HEBREW` class, never a pasted
  literal range. Measured equal to `[U+0590-U+05FF]` on this corpus at
  2,302, so this is a correctness convention, not a count change.
- `refs[]` is OUT of scope (body model spec §5, B7 — dropped at
  compile). No task touches it.
- Fixtures are real entries cited by rid. A hand-written string that
  flatters the rule is not a fixture.
- `bun qa` (format, lint, test, tsc) passes before every commit.
- Commits are signed (`git commit -s`). Never `--no-gpg-sign`.

**User decisions (already made):**
- "Widen to all fields" — the batch takes the whole defect across
  every surviving field plus link attributes, not body text alone.
- "Split 3a / 3b" — the gershayim family ships first and alone; the
  italic and punctuation seam rows keep the batch number and get their
  own spec.
- "Decline; glyph only" — the 49 displaced and 34 undetermined
  occurrences are glyph-corrected in place and never repositioned.
  Moving a mark to match a corpus-dominant twin is inference, which
  the no-vowel-inference ruling forbids.

---

## File structure

| File | Status | Responsibility |
|---|---|---|
| `admin/pipeline/transform/gershayim.ts` | create | The predicate, the substitution, the locus partition. No rule logic, no catalogue knowledge. |
| `admin/pipeline/transform/gershayim.test.ts` | create | Predicate and substitution unit tests |
| `admin/pipeline/transform/links.ts` | modify | `Anchor` gains `tag` — the raw opening-tag value |
| `admin/pipeline/transform/types.ts` | modify | `TransformResult` gains `glyphCorrected` |
| `admin/pipeline/transform/link-target.ts` | modify | Case 5 |
| `admin/pipeline/transform/link-target.test.ts` | modify | Case 5 accepts the correction, rejects everything near it |
| `admin/pipeline/transform/rules/gershayim.ts` | create | The two `Rule` objects |
| `admin/pipeline/transform/rules/gershayim.test.ts` | create | Rule unit tests on real entries |
| `admin/pipeline/transform/rules/gershayim.corpus.test.ts` | create | Corpus tier: locus partition, order freedom, link integrity |
| `admin/pipeline/transform/registry.ts` | modify | Register both, adjacent; drop both from `PENDING` |
| `data/patches/patterns.jsonl` | modify | §6 write-backs on both rows |
| `data/patches/catalogue-audit/ascii-quote-as-gershayim-in-body.md` | modify | Reconciliation, locus partition, residue register |
| `docs/v2/transform-batch-3a.md` | create | The batch report |

Two test files for the rules, split the way `links.test.ts` /
`links.corpus.test.ts` were split on 2026-08-24: the corpus tier loads
41 MB and runs slowly, and keeping it separate holds both files under
`noExcessiveLinesPerFile`.

---

### Task 0: Reconcile the count and pin the population

**Goal:** Settle the 6-occurrence gap between this plan's 2,302 and
the audit's 2,317 before any rule is written, and record the locus
partition and the decline register in the audit file.

**Files:**
- Modify: `data/patches/catalogue-audit/ascii-quote-as-gershayim-in-body.md`

**Acceptance Criteria:**
- [ ] The audit file gains a section that decomposes the 2,317 → 2,302 difference to the occurrence, naming which side of the locus partition each of the six sits on
- [ ] The locus partition is recorded with its command: 2,122 occ / 1,386 entries text, 180 occ / 85 entries tag, 1,392 union
- [ ] The 49 displaced and 34 undetermined occurrences are listed by rid, so a later judgment pass can find them without re-deriving the set
- [ ] Every figure in the new sections is produced by a command printed beside it; no figure is typed in from this plan
- [ ] If the reconciliation shows the audit right and this plan wrong, the plan's numbers are corrected and the finding is recorded — the measurement decides, not the plan

**Verify:** every command in the new sections re-run, output matches the file

**Steps:**

- [ ] **Step 1: Reproduce both readings side by side**

The audit reports 2,317 corpus-wide with 172 in `href`/`data-ref`.
This plan measures 2,302 in scope with 180 in the tag locus. Run the
locus partition and hold both decompositions next to each other:

```bash
bun -e 'const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34), P=new RegExp("["+HEBREW+"]"+Q+"["+HEBREW+"]","gu"), TAG=/<[^<>]*>/gu;
const textE=new Set(), tagE=new Set(); let textO=0, tagO=0;
const fields=(e)=>{const o=[],p=(s)=>{typeof s==="string"&&o.push(s)};
  p(e.headword); for(const a of e.alt_headwords??[])p(a); for(const x of e.plural_form??[])p(x);
  const w=(s)=>{if(!s)return; p(s.definition); p(s.number); for(const n of s.senses??[])w(n)};
  for(const s of e.content?.senses??[])w(s); p(e.content?.morphology);
  for(const q of e.quotes??[])for(const x of q??[])p(x); return o};
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){
  const e=JSON.parse(l);
  for(const f of fields(e)){ const mask=new Array(f.length).fill(false);
    for(const m of f.matchAll(TAG))for(let i=m.index;i<m.index+m[0].length;i++)mask[i]=true;
    for(const m of f.matchAll(P)){ if(mask[m.index+1]){tagO++;tagE.add(e.rid)} else {textO++;textE.add(e.rid)} } } }
console.log("text",textO,"occ /",textE.size,"entries");
console.log("tag ",tagO,"occ /",tagE.size,"entries");
console.log("union",new Set([...textE,...tagE]).size,"| total",textO+tagO);'
```

Expected: `text 2122 / 1386`, `tag 180 / 85`, `union 1392`, `total 2302`.

- [ ] **Step 2: Test the standing hypothesis, and record the result either way**

The spec names one lead and one falsified guess. The falsified guess:
the Hebrew class. Confirm it stays falsified —

```bash
bun -e 'const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34);
const wide=new RegExp("[֐-׿]"+Q+"[֐-׿]","gu"), canon=new RegExp("["+HEBREW+"]"+Q+"["+HEBREW+"]","gu");
let w=0,c=0;
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){
  const e=JSON.parse(l), s=JSON.stringify(e.content)+JSON.stringify(e.headword)+JSON.stringify(e.alt_headwords??[])+JSON.stringify(e.plural_form??[])+JSON.stringify(e.quotes??[]);
  w+=[...s.matchAll(wide)].length; c+=[...s.matchAll(canon)].length; }
console.log("wide",w,"canonical",c,"delta",w-c);'
```

Expected: delta 0.

The live lead: the audit's 172 against the tag locus's 180. Read the
audit's own probe (section "Probe and raw figure",
`data/patches/catalogue-audit/ascii-quote-as-gershayim-in-body.md:8`)
and determine what it excluded. Two attributes on 90 tags is 180; a
probe that counted tags rather than attributes, or that skipped
`href`, lands near 172. Establish which, by re-running the audit's
probe as written.

- [ ] **Step 3: Enumerate the decline register**

The 49 displaced (a dominant penultimate-slot twin exists) and 34
undetermined are named in the audit's "Two riders" section
(`:123`). Produce the rid list so the post-launch pass can find them:

```bash
bun -e 'const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34), TOK=new RegExp("["+HEBREW+"]+"+Q+"["+HEBREW+"]+","gu");
const freq=new Map(), where=new Map();
const fields=(e)=>{const o=[],p=(s)=>{typeof s==="string"&&o.push(s)};
  p(e.headword); for(const a of e.alt_headwords??[])p(a); for(const x of e.plural_form??[])p(x);
  const w=(s)=>{if(!s)return; p(s.definition); p(s.number); for(const n of s.senses??[])w(n)};
  for(const s of e.content?.senses??[])w(s); p(e.content?.morphology);
  for(const q of e.quotes??[])for(const x of q??[])p(x); return o};
const es=(await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean).map(l=>JSON.parse(l));
for(const e of es) for(const f of fields(e)) for(const m of f.matchAll(TOK)){
  freq.set(m[0],(freq.get(m[0])??0)+1); (where.get(m[0])??where.set(m[0],new Set()).get(m[0])).add(e.rid); }
const bare=(t)=>t.split(Q).join("");
const byBare=new Map();
for(const t of freq.keys()){ const b=bare(t); (byBare.get(b)??byBare.set(b,[]).get(b)).push(t); }
for(const [b,ts] of byBare){ if(ts.length<2) continue;
  const sorted=ts.sort((x,y)=>freq.get(y)-freq.get(x));
  for(const t of sorted.slice(1)) console.log(freq.get(t), JSON.stringify(t), "vs dominant", JSON.stringify(sorted[0]), freq.get(sorted[0]), "|", [...where.get(t)].join(" ")); }' | sort -rn
```

Write the output into the audit file as a table. The number of rows is
whatever the corpus says — if it is not 49, that is a finding to
record, not a number to force.

- [ ] **Step 4: Write the sections and commit**

Add to `data/patches/catalogue-audit/ascii-quote-as-gershayim-in-body.md`:
a "Reconciliation, 2026-08-24" section with Steps 1–2's decomposition,
a "Locus partition" section with Step 1's table and command, and a
"Decline register" section with Step 3's table and the ruling that
these are glyph-corrected in place and never moved.

```bash
git add data/patches/catalogue-audit/ascii-quote-as-gershayim-in-body.md
git commit -s -m "📖 doc(audit): reconcile gershayim count and pin loci"
```

---

### Task 1: `Anchor.tag`, `glyphCorrected`, and link-target case 5

**Goal:** The link-target gate can license a `data-ref`/`href` whose
only change is `"` → `״`, and can license nothing else.

**Files:**
- Modify: `admin/pipeline/transform/links.ts`
- Modify: `admin/pipeline/transform/types.ts`
- Modify: `admin/pipeline/transform/link-target.ts`
- Modify: `admin/pipeline/transform/link-target.test.ts`

**Acceptance Criteria:**
- [ ] `Anchor` carries `tag`, the raw opening-tag token value, and every existing `links.test.ts` and `links.corpus.test.ts` assertion still passes
- [ ] `TransformResult.glyphCorrected` is `readonly { from: string; target: string }[]`, documented on the same terms as `composed` and `recombined`
- [ ] An anchor whose tag changed is licensed **only** when a declared claim satisfies `target.replaceAll('״', '"') === from` AND `from` is the tag value of some anchor in the entry's input
- [ ] An undeclared tag change still fails, with the existing "not in RID's input" message
- [ ] A declared claim whose `from` is absent from the input fails
- [ ] A declared claim that also moves, adds, or drops any non-quote character fails
- [ ] A claim licenses the tag it names and no other anchor

**Verify:** `bun test admin/pipeline/transform/link-target.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Write the failing tests**

Add to `admin/pipeline/transform/link-target.test.ts`. `A00009` is a
real member — its tag is
`<a dir="rtl" class="refLink" href="/Jastrow,_אל"ף.1" data-ref="Jastrow, אל"ף 1">`.

```ts
const GERSHAYIM = '״';
const damaged =
	'<a dir="rtl" class="refLink" href="/Jastrow,_אל"ף.1" data-ref="Jastrow, אל"ף 1">אלף</a>';
const repaired = damaged.replaceAll('"ף', GERSHAYIM + 'ף');

test('case 5 licenses a tag whose only change is the gershayim glyph', () => {
	const before = entryWith(damaged);
	const after = entryWith(repaired);
	const problems = checkLinkTargets(before, after, {
		glyphCorrected: [{ from: openTagOf(damaged), target: openTagOf(repaired) }],
	});
	expect(problems).toEqual([]);
});

test('an undeclared glyph correction is still a fabrication', () => {
	const problems = checkLinkTargets(entryWith(damaged), entryWith(repaired), {});
	expect(problems.length).toBeGreaterThan(0);
});

test('case 5 refuses a claim whose from is not in the input', () => {
	const problems = checkLinkTargets(entryWith(damaged), entryWith(repaired), {
		glyphCorrected: [
			{ from: openTagOf(damaged).replace('אל', 'בל'), target: openTagOf(repaired) },
		],
	});
	expect(problems.length).toBeGreaterThan(0);
});

test('case 5 refuses a claim that changes a non-quote character', () => {
	const moved = repaired.replace('.1"', '.2"');
	const problems = checkLinkTargets(entryWith(damaged), entryWith(moved), {
		glyphCorrected: [{ from: openTagOf(damaged), target: openTagOf(moved) }],
	});
	expect(problems.length).toBeGreaterThan(0);
});

test('a claim does not license a different anchor', () => {
	const other =
		'<a dir="rtl" class="refLink" href="/Jastrow,_עכ"ום.1" data-ref="Jastrow, עכ"ום 1">עכום</a>';
	const otherRepaired = other.replaceAll('"ו', GERSHAYIM + 'ו');
	const problems = checkLinkTargets(
		entryWith(damaged + other),
		entryWith(repaired + otherRepaired),
		{ glyphCorrected: [{ from: openTagOf(damaged), target: openTagOf(repaired) }] },
	);
	expect(problems.length).toBeGreaterThan(0);
});
```

`entryWith` and `openTagOf` are local helpers — `entryWith` puts the
markup in `senses[0].definition` of a minimal `SourceEntry`,
`openTagOf` returns `tokenize(html)[0].value`. Follow whatever fixture
helper `link-target.test.ts` already uses for `entryWith`; add
`openTagOf` beside it.

- [ ] **Step 2: Run the tests and watch them fail**

```bash
bun test admin/pipeline/transform/link-target.test.ts
```

Expected: the five new tests fail — `glyphCorrected` is not a
property of the result type, so they fail to compile.

- [ ] **Step 3: Add `tag` to `Anchor`**

In `admin/pipeline/transform/links.ts`, extend the interface and
`buildAnchor`, which already holds the token:

```ts
interface Anchor {
	close: number;
	dataRef: string;
	display: string;
	href: string;
	interior: boolean;
	malformed: boolean;
	open: number;
	/** The opening tag's RAW token value, `<a …>` inclusive.
	 *
	 * `dataRef` and `href` are what `attrValue` could read, which is
	 * not always what the tag says: a gershayim written as an ASCII
	 * quote terminates its own attribute, so `data-ref="Jastrow, אל״ף 1"`
	 * reads back as `Jastrow, אל` with `malformed: false` — nothing
	 * about the tag is visibly wrong. 90 anchors are in that state.
	 * A gate that must compare what a rule wrote against what the
	 * input held cannot use a value the parser silently truncated, so
	 * `link-target.ts` case 5 compares these bytes instead. */
	tag: string;
}
```

```ts
	return {
		close,
		dataRef: attrValue(tag.value, DATA_REF),
		display: displayOf(tokens, open, close),
		href: attrValue(tag.value, HREF),
		interior: interior.has(open) || (close !== -1 && interior.has(close)),
		malformed: !opensScope(tag.value),
		open,
		tag: tag.value,
	};
```

- [ ] **Step 4: Add `glyphCorrected` to `TransformResult`**

In `admin/pipeline/transform/types.ts`, beside `composed` and
`recombined`:

```ts
	/** Opening tags this call repaired by GLYPH SUBSTITUTION alone
	 * (batch-3a spec §4.3). `from` is an opening tag in this entry's
	 * INPUT; `target` is the tag written. `link-target.ts` accepts the
	 * pair only if mapping every `״` in `target` back to `"` yields
	 * `from` exactly — same length, same characters, same order — and
	 * only if `from` is the tag of an anchor the input actually held.
	 *
	 * Stated on RAW TAG BYTES rather than on parsed targets, and the
	 * reason is the defect itself: an ASCII quote inside a
	 * `"`-delimited attribute terminates it, so all 90 damaged anchors
	 * parse `malformed: false` with a truncated `data-ref`. A case
	 * phrased against the input target set would compare the repair to
	 * `Jastrow, אל` and reject it for the truncation it is fixing.
	 *
	 * A claim is matched to an anchor by `target === anchor.tag`, and
	 * every anchor it matches must satisfy it. A claim naming a tag no
	 * anchor carries licenses nothing. */
	glyphCorrected?: readonly { from: string; target: string }[];
```

- [ ] **Step 5: Implement case 5 in the gate**

In `admin/pipeline/transform/link-target.ts`, add the fault function
and widen `Input`, `checkValue` and `checkLinkTargets`:

```ts
const GERSHAYIM = '״';

/** Case 5: the anchor's whole opening tag, with every gershayim mapped
 * back to an ASCII quote, is byte-identical to a tag the input held —
 * and the rule declared that pair. Undefined means licensed. */
function glyphFaults(anchor: Anchor, input: Input): string[] | undefined {
	const claims = input.glyphs.filter((claim) => claim.target === anchor.tag);
	if (claims.length === 0) {
		return [];
	}
	const faults: string[] = [];
	for (const claim of claims) {
		if (claim.target.replaceAll(GERSHAYIM, '"') !== claim.from) {
			faults.push(
				`glyph claim on ${JSON.stringify(claim.target)} in ${input.rid} changes more than the quote`,
			);
		} else if (!input.tags.has(claim.from)) {
			faults.push(
				`glyph claim source ${JSON.stringify(claim.from)} is not a tag in ${input.rid}'s input`,
			);
		}
	}
	return faults.length === 0 ? undefined : faults;
}
```

`link-target.ts` declares its own `GERSHAYIM` rather than importing
the one `gershayim.ts` exports in Task 2. Deliberate: the gate must not
depend on any rule module, or a rule could widen the gate that checks
it. Two one-character constants is the cheaper problem.

`Input` gains `glyphs: readonly GlyphCorrect[]` and
`tags: ReadonlySet<string>`; build both in `checkLinkTargets`:

```ts
	const input: Input = {
		claims: result.composed ?? [],
		glyphs: result.glyphCorrected ?? [],
		rejoins: result.recombined ?? [],
		rid,
		source,
		tags: new Set(source.map((anchor) => anchor.tag)),
		targets: targetsOf(source),
	};
```

and `checkValue` consults case 5 before reporting, since a licensed
tag settles both of its attributes at once:

```ts
function checkValue(
	value: string,
	anchor: Anchor,
	input: Input,
): string | undefined {
	if (input.targets.has(value)) {
		return;
	}
	const glyphs = glyphFaults(anchor, input);
	if (glyphs === undefined) {
		return;
	}
	const composed = composeFaults(value, anchor, input);
	if (composed === undefined) {
		return;
	}
	const rejoined = rejoinFaults(value, anchor, input);
	if (rejoined === undefined) {
		return;
	}
	return (
		[...glyphs, ...composed, ...rejoined][0] ??
		`target ${JSON.stringify(value)} is not in ${input.rid}'s input`
	);
}
```

Update `checkLinkTargets`'s `Pick<TransformResult, …>` to include
`'glyphCorrected'`.

- [ ] **Step 6: Extend the header contract and the blind-spot list**

`link-target.ts`'s module docstring enumerates the cases and carries a
blind-spot list. Add case 5 to the enumeration in the same voice, and
add its blind spot to the list: **case 5 licenses a tag, not an
address — a rule that corrected the glyph AND happened to be pointing
at the wrong entry to begin with is licensed by this case, because the
case asks only whether the bytes moved.** That is correct for a glyph
rule and would not be for anything else.

- [ ] **Step 7: Run the tests**

```bash
bun test admin/pipeline/transform/link-target.test.ts admin/pipeline/transform/links.test.ts admin/pipeline/transform/links.corpus.test.ts
```

Expected: all pass, including every pre-existing assertion.

- [ ] **Step 8: Commit**

```bash
bun qa
git add admin/pipeline/transform/links.ts admin/pipeline/transform/types.ts admin/pipeline/transform/link-target.ts admin/pipeline/transform/link-target.test.ts
git commit -s -m "🦄 new(transform): link-target case 5, glyph correction"
```

---

### Task 2: The predicate, the substitution, and the two rules

**Goal:** Two registered-shaped `Rule` objects that repair every
Hebrew-flanked ASCII quote in their own locus and nothing else.

**Files:**
- Create: `admin/pipeline/transform/gershayim.ts`
- Create: `admin/pipeline/transform/gershayim.test.ts`
- Create: `admin/pipeline/transform/rules/gershayim.ts`
- Create: `admin/pipeline/transform/rules/gershayim.test.ts`

**Acceptance Criteria:**
- [ ] `repairText` and `repairTags` each return the input string unchanged when nothing matches, and are pure
- [ ] Both are idempotent: applying twice equals applying once
- [ ] Output codepoint length always equals input codepoint length
- [ ] `"` not flanked by Hebrew on both sides is never touched — attribute delimiters, Latin quotation, quote-then-space
- [ ] `gershayimInBody` edits document text only; `gershayimRefAttribute` edits tag interiors only; neither sees the other's occurrences
- [ ] `gershayimRefAttribute` declares one `glyphCorrected` claim per repaired opening tag and passes the gate
- [ ] Both declare `allows: ['״']` with the ruling cited in a comment
- [ ] Records carry the rid, the rule id, and a detail naming the repaired token
- [ ] An entry with no match returns the SAME object reference

**Verify:** `bun test admin/pipeline/transform/gershayim.test.ts admin/pipeline/transform/rules/gershayim.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Write the failing predicate tests**

`admin/pipeline/transform/gershayim.test.ts`:

```ts
import { expect, test } from 'bun:test';
import { repairTags, repairText } from './gershayim.ts';

const GERSHAYIM = '״';

test('repairs a quote flanked by Hebrew on both sides', () => {
	expect(repairText('הקב"ה')).toBe('הקב' + GERSHAYIM + 'ה');
});

test('leaves attribute delimiters alone', () => {
	expect(repairText('<a href="/x" data-ref="y">אב</a>')).toBe(
		'<a href="/x" data-ref="y">אב</a>',
	);
});

test('leaves Latin-flanked and one-sided quotes alone', () => {
	expect(repairText('say "hello"')).toBe('say "hello"');
	expect(repairText('א" ב')).toBe('א" ב');
	expect(repairText('a"ב')).toBe('a"ב');
});

test('is idempotent', () => {
	const once = repairText('הקב"ה');
	expect(repairText(once)).toBe(once);
});

test('never changes codepoint length', () => {
	const input = 'אל"ף and הקב"ה';
	expect([...repairText(input)].length).toBe([...input].length);
});

test('repairText leaves tag interiors alone and repairTags takes them', () => {
	const html = '<a data-ref="Jastrow, אל"ף 1">אל"ף</a>';
	expect(repairText(html)).toBe('<a data-ref="Jastrow, אל"ף 1">אל' + GERSHAYIM + 'ף</a>');
	expect(repairTags(html)).toBe(
		'<a data-ref="Jastrow, אל' + GERSHAYIM + 'ף 1">אל"ף</a>',
	);
});
```

- [ ] **Step 2: Run and watch them fail**

```bash
bun test admin/pipeline/transform/gershayim.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write the module**

`admin/pipeline/transform/gershayim.ts`:

```ts
/**
 * The gershayim predicate and substitution (batch-3a spec §4.1).
 *
 * Jastrow's print sets Hebrew abbreviations with `״` (U+05F4). The
 * corpus writes an ASCII `"`. The predicate is that quote with a
 * Hebrew letter on BOTH sides, which is what makes it selective
 * enough to be safe: the walked fields hold 1,310,492 ASCII quotes
 * and 2,302 of them are this defect. Almost every other one is an
 * attribute delimiter, and a rule that reached for `"` without this
 * test would rewrite the corpus's markup wholesale — invisibly, since
 * the text gate strips tags before comparing and the markup gate
 * compares a well-formedness delta.
 *
 * The substitution is in place and nothing else happens: no character
 * is inserted, deleted or moved, so output length always equals input
 * length. That is the whole safety argument for `allows`, and it is
 * asserted per rule rather than assumed.
 *
 * Two functions rather than one because the two catalogue rows split
 * by LOCUS, not by predicate: `repairText` takes occurrences in
 * document text, `repairTags` takes occurrences inside a `<…>` tag.
 * Their populations are disjoint and neither can create or destroy
 * the other's, because the substitution never introduces or removes a
 * `<` or a `>` — so registry order between them is free, and
 * `rules/gershayim.corpus.test.ts` proves it rather than asserting it.
 */
import { HEBREW } from './html.ts';

const GERSHAYIM = '״';
/** A `"` with a Hebrew letter either side. Lookahead rather than a
 * consuming group so adjacent occurrences in one token both match. */
const FLANKED = new RegExp(`(?<=[${HEBREW}])"(?=[${HEBREW}])`, 'gu');
const TAG = /<[^<>]*>/gu;

/** Replace every flanked quote in `value`. */
function repairAll(value: string): string {
	return value.replace(FLANKED, GERSHAYIM);
}

/** Repair document text, leaving every `<…>` tag byte-identical. */
function repairText(value: string): string {
	let out = '';
	let at = 0;
	TAG.lastIndex = 0;
	let match = TAG.exec(value);
	while (match !== null) {
		out += repairAll(value.slice(at, match.index)) + match[0];
		at = match.index + match[0].length;
		match = TAG.exec(value);
	}
	return out + repairAll(value.slice(at));
}

/** Repair `<…>` tag interiors, leaving every text run byte-identical. */
function repairTags(value: string): string {
	return value.replace(TAG, (tag) => repairAll(tag));
}

export { GERSHAYIM, repairTags, repairText };
```

- [ ] **Step 4: Run the predicate tests**

```bash
bun test admin/pipeline/transform/gershayim.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write the failing rule tests**

`admin/pipeline/transform/rules/gershayim.test.ts`. Use real entries:
`A00009` (`אל״ף`, tag locus), `A00692` (`עכ״ום`, tag locus and on the
decline register), and any entry from Task 0's text-locus list.

```ts
import { expect, test } from 'bun:test';
import { GERSHAYIM } from '../gershayim.ts';
import { gershayimInBody, gershayimRefAttribute } from './gershayim.ts';

test('gershayimInBody repairs body text and declares no link work', () => {
	const before = entry('A00009');
	const result = gershayimInBody.apply(before);
	expect(result.records.length).toBeGreaterThan(0);
	expect(result.glyphCorrected ?? []).toEqual([]);
	expect(JSON.stringify(result.entry)).toContain(GERSHAYIM);
});

test('gershayimInBody leaves every tag byte-identical', () => {
	const before = entry('A00009');
	const after = gershayimInBody.apply(before).entry;
	expect(tagsOf(after)).toEqual(tagsOf(before));
});

test('gershayimRefAttribute repairs the tag and declares the pair', () => {
	const before = entry('A00009');
	const result = gershayimRefAttribute.apply(before);
	expect(result.glyphCorrected?.length).toBe(1);
	const [claim] = result.glyphCorrected ?? [];
	expect(claim?.target.replaceAll(GERSHAYIM, '"')).toBe(claim?.from);
});

test('the repaired data-ref now parses in full', () => {
	const after = gershayimRefAttribute.apply(entry('A00009')).entry;
	expect(dataRefsOf(after)).toContain(`Jastrow, אל${GERSHAYIM}ף 1`);
});

test('a displaced token is glyph-corrected in place and never moved', () => {
	// A00692 עכ"ום is on the decline register: the mark stays where it is.
	const after = gershayimRefAttribute.apply(entry('A00692')).entry;
	expect(dataRefsOf(after)).toContain(`Jastrow, עכ${GERSHAYIM}ום 1`);
});

test('an entry with no match comes back by reference', () => {
	const before = entry('A00000');
	expect(gershayimInBody.apply(before).entry).toBe(before);
	expect(gershayimRefAttribute.apply(before).entry).toBe(before);
});
```

`entry(rid)` reads the pinned snapshot; follow whatever loader
`rules/rtl.test.ts` uses. `tagsOf` and `dataRefsOf` tokenize every
field and collect tag values / parsed `data-ref`s.

- [ ] **Step 6: Run and watch them fail**

```bash
bun test admin/pipeline/transform/rules/gershayim.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 7: Write the rules**

`admin/pipeline/transform/rules/gershayim.ts`. Map every field
`fieldsOf` walks (minus `refs[]`, which it does not walk either), and
build records as you go:

```ts
/**
 * The gershayim pair (batch-3a spec §3, §4). One predicate, two rows,
 * split by locus — `ascii-quote-as-gershayim-in-body` owns document
 * text, `gershayim-breaks-ref-attribute` owns tag interiors.
 *
 * They are one defect. Every one of the 90 damaged tags points at a
 * headword carrying the same ASCII quote — 90 of 90, 0 unresolved —
 * so repairing either side alone breaks all 90 cross-links, and the
 * two rows ship adjacent in the registry for that reason rather than
 * because the catalogue marks them entangled.
 *
 * `allows: ['״']` is a maintainer ruling, under the OCR ruling of
 * 2026-08-11 that `no-new-text.ts` already cites: a mis-recognized
 * glyph never was the source's content, so correcting it is
 * correction, not composition. The allowance is unusually safe to
 * grant here — U+05F4 does not occur once in the input corpus, so any
 * occurrence in the output is this rule's own work and the corpus
 * test can assert its exact count.
 *
 * Neither rule moves a mark. 49 occurrences sit in a minority slot
 * with a dominant twin elsewhere in the corpus and 34 more are
 * undetermined; all 83 are glyph-corrected in place and recorded in
 * the audit's decline register, because sourcing a repair from a
 * different token is the inference the no-vowel-inference ruling
 * forbids.
 */
```

Then one mapper shared by both rules, parameterised by the repair
function, and two `Rule` objects over it:

```ts
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { anchors } from '../links.ts';
import { tokenize } from '../html.ts';
import { GERSHAYIM, repairTags, repairText } from '../gershayim.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

type Repair = (value: string) => string;

/** Map one optional string, reporting whether it moved. */
function mapText(
	value: string | undefined,
	repair: Repair,
	moved: { any: boolean },
): string | undefined {
	if (value === undefined) {
		return undefined;
	}
	const out = repair(value);
	if (out !== value) {
		moved.any = true;
	}
	return out;
}

function mapSense(
	sense: SourceSense,
	repair: Repair,
	moved: { any: boolean },
): SourceSense {
	return {
		...sense,
		definition: mapText(sense.definition, repair, moved),
		number: mapText(sense.number, repair, moved),
		senses: sense.senses?.map((child) => mapSense(child, repair, moved)),
	};
}

/** Every field `no-new-text.ts`'s `fieldsOf` walks. `refs[]` is absent
 * from both by the same ruling (body model spec §5, B7). */
function mapEntry(entry: SourceEntry, repair: Repair): SourceEntry | undefined {
	const moved = { any: false };
	const out: SourceEntry = {
		...entry,
		alt_headwords: entry.alt_headwords?.map(
			(value) => mapText(value, repair, moved) ?? value,
		),
		content: {
			...entry.content,
			morphology: mapText(entry.content.morphology, repair, moved),
			senses: entry.content.senses.map((sense) =>
				mapSense(sense, repair, moved),
			),
		},
		headword: mapText(entry.headword, repair, moved) ?? entry.headword,
		language_code: mapText(entry.language_code, repair, moved),
		language_reference: mapText(entry.language_reference, repair, moved),
		plural_form: entry.plural_form?.map(
			(value) => mapText(value, repair, moved) ?? value,
		),
		quotes: entry.quotes?.map(
			(triple) =>
				triple.map((part) =>
					part === null ? null : (mapText(part, repair, moved) ?? part),
				) as [string | null, string, string | null],
		),
	};
	return moved.any ? out : undefined;
}

/** Every opening-tag value in every field the mapper touches, in
 * `fieldsOf` order then document order — the same walk on both sides,
 * so index i on one side is index i on the other. Sound here ONLY
 * because this rule never adds or removes a tag. */
function openTags(entry: SourceEntry): string[] {
	return fieldsOf(entry).flatMap((field) => {
		const tokens = tokenize(field);
		return anchors(tokens).map((anchor) => anchor.tag);
	});
}

function build(
	id: string,
	repair: Repair,
	declare: boolean,
): Rule {
	return {
		// The OCR ruling of 2026-08-11: a mis-recognized glyph never was
		// the source's content, so correcting it is correction, not
		// composition. U+05F4 occurs 0 times in the input corpus.
		allows: [GERSHAYIM],
		apply(entry: SourceEntry): TransformResult {
			const healed = mapEntry(entry, repair);
			if (healed === undefined) {
				return { entry, records: [] };
			}
			const records: TransformRecord[] = [
				{
					detail: `${countGershayim(healed) - countGershayim(entry)} gershayim restored`,
					rid: entry.rid,
					ruleId: id,
				},
			];
			if (!declare) {
				return { entry: healed, records };
			}
			const from = openTags(entry);
			const target = openTags(healed);
			const glyphCorrected = target
				.map((tag, at) => ({ from: from[at] ?? '', target: tag }))
				.filter((claim) => claim.from !== claim.target);
			return { entry: healed, glyphCorrected, records };
		},
		id,
		phase: 'text-repairs',
	};
}

const gershayimInBody: Rule = build(
	'ascii-quote-as-gershayim-in-body',
	repairText,
	false,
);
const gershayimRefAttribute: Rule = build(
	'gershayim-breaks-ref-attribute',
	repairTags,
	true,
);

export { gershayimInBody, gershayimRefAttribute };
```

`countGershayim` counts `GERSHAYIM` across `fieldsOf(entry)`; put it
beside `openTags`. `fieldsOf` is already exported from
`no-new-text.ts:206` and already imported by `link-target.ts:202` —
use it rather than re-deriving the field list, which is what that
file's docstring warns against ("A field outside this set is a field
the gate cannot see").

Two details the mapper gets right that a simpler one would not.
`mapText` returns `undefined` for an absent field rather than `''`, so
an entry without `language_reference` does not gain an empty one and
trip `body:migrate-dry`'s schema check. And `moved` is threaded
through rather than compared at the end, so the rule returns the SAME
reference when nothing changed — required by `Rule.apply`'s contract
and by `count.ts`'s frozen corpus.

- [ ] **Step 8: Run the rule tests**

```bash
bun test admin/pipeline/transform/rules/gershayim.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
bun qa
git add admin/pipeline/transform/gershayim.ts admin/pipeline/transform/gershayim.test.ts admin/pipeline/transform/rules/gershayim.ts admin/pipeline/transform/rules/gershayim.test.ts
git commit -s -m "🦄 new(transform): the gershayim pair"
```

---

### Task 3: Register both rules and prove the order is free

**Goal:** Both catalogue rows leave `PENDING` for `RULES`, adjacent,
with the order-freedom claim measured rather than asserted.

**Files:**
- Modify: `admin/pipeline/transform/registry.ts`
- Create: `admin/pipeline/transform/rules/gershayim.corpus.test.ts`
- Modify: `data/patches/patterns.jsonl`

**Acceptance Criteria:**
- [ ] `coverage()` reports 15 rules registered, 63 pending, 0 unaccounted, 0 duplicated
- [ ] Both ids are removed from `PENDING` and neither is claimed twice
- [ ] The two rules are adjacent in `RULES`
- [ ] Each row's `entangledWith` names the other, written back to `patterns.jsonl` with a `reason` recording the 90/90 measurement
- [ ] `checkAdjacency()` passes on the new cluster
- [ ] A corpus test proves both orders of the pair produce byte-identical corpora, and that the pair is order-free against the three rtl rules
- [ ] The registry comment states the measurement, not a preference

**Verify:** `bun test admin/pipeline/transform/registry.test.ts admin/pipeline/transform/registry.order.test.ts admin/pipeline/transform/rules/gershayim.corpus.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Write the order-freedom test first**

`admin/pipeline/transform/rules/gershayim.corpus.test.ts`:

```ts
test('the pair is order-free against itself', () => {
	let differing = 0;
	for (const source of corpus()) {
		const ab = gershayimRefAttribute.apply(gershayimInBody.apply(source).entry).entry;
		const ba = gershayimInBody.apply(gershayimRefAttribute.apply(source).entry).entry;
		if (JSON.stringify(ab) !== JSON.stringify(ba)) {
			differing += 1;
		}
	}
	expect(differing).toBe(0);
});

test('the pair is order-free against the rtl trio', () => {
	let differing = 0;
	for (const source of corpus()) {
		const rtlFirst = both(applyRtl(source));
		const gershayimFirst = applyRtl(both(source));
		if (JSON.stringify(rtlFirst) !== JSON.stringify(gershayimFirst)) {
			differing += 1;
		}
	}
	expect(differing).toBe(0);
});
```

`corpus()` streams the pinned snapshot; `both` applies the pair in
registry order; `applyRtl` applies `redundantOuterRtl`, `bareRtlHebrew`,
`latinTokenInsideRtl` in registry order. Follow the loader
`links.corpus.test.ts` uses.

- [ ] **Step 2: Run it and watch it fail**

```bash
bun test admin/pipeline/transform/rules/gershayim.corpus.test.ts
```

Expected: FAIL — the rules are not exported from a registered module
path yet, or the test helpers do not exist.

- [ ] **Step 3: Register the pair**

In `admin/pipeline/transform/registry.ts`, import both and place them
after the batch-2 families, with a comment in the file's established
voice:

```ts
	// The gershayim pair (batch 3a). ONE defect, two catalogue rows,
	// split by locus: `gershayimInBody` takes the 2,122 occurrences in
	// document text, `gershayimRefAttribute` the 180 inside tag
	// interiors. Adjacent by requirement — every one of the 90 damaged
	// tags points at a headword carrying the same ASCII quote (90 of
	// 90, 0 unresolved), so repairing either side alone breaks all 90
	// cross-links by string identity.
	//
	// Order between them is MEASURED and free, like the geresh pair's:
	// the substitution never introduces or removes a `<` or a `>`, so
	// neither can move an occurrence into or out of the other's locus,
	// and over the whole corpus both orders produce 0 entries
	// differing by a byte. The pair is also order-free against the rtl
	// trio, which matters because the audit warned that wrapping bare
	// Hebrew would migrate 117 occurrences into scope — it does not,
	// because the predicate reads codepoints and not markup context.
	gershayimInBody,
	gershayimRefAttribute,
```

Remove both ids from `PENDING`.

- [ ] **Step 4: Write back the entanglement**

Both rows gain `entangledWith` naming the other, and a `reason`
recording the 90/90 measurement. Edit `data/patches/patterns.jsonl`
**surgically** — `renderPatterns()` reformats all 149 rows, so do not
round-trip the file through it.

- [ ] **Step 5: Run the gates**

```bash
bun test admin/pipeline/transform/registry.test.ts admin/pipeline/transform/registry.order.test.ts admin/pipeline/transform/rules/gershayim.corpus.test.ts
```

Expected: PASS, with `coverage()` at 15 registered / 63 pending.

- [ ] **Step 6: Commit**

```bash
bun qa
git add admin/pipeline/transform/registry.ts admin/pipeline/transform/rules/gershayim.corpus.test.ts data/patches/patterns.jsonl
git commit -s -m "🦄 new(transform): register the gershayim pair"
```

---

### Task 4: The link-integrity census

**Goal:** Prove the batch's headline claim on the whole corpus — that
exactly 90 link targets start resolving and none stop.

**Files:**
- Modify: `admin/pipeline/transform/rules/gershayim.corpus.test.ts`

**Acceptance Criteria:**
- [ ] A test resolves every `data-ref` in the corpus against the set of entry headwords, before and after the pair runs
- [ ] Every target that resolved before still resolves after — 0 regressions
- [ ] The count of resolving targets rises by exactly 90
- [ ] The 90 that newly resolve are the 90 damaged tags, matched by rid, not merely 90 of something
- [ ] The corpus holds 0 occurrences of `״` before the pass and exactly 2,302 after
- [ ] The 90 damaged tags are checked against every already-registered rule's population, and the finding is recorded either way

**Verify:** `bun test admin/pipeline/transform/rules/gershayim.corpus.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Write the census test**

```ts
test('exactly 90 link targets start resolving and none stop', () => {
	const entries = [...corpus()];
	const headwords = new Set(entries.map((e) => e.headword));
	const resolves = (target: string) =>
		headwords.has(targetHeadword(target) ?? ' ');
	const before = new Set<string>();
	const after = new Set<string>();
	for (const source of entries) {
		for (const target of dataRefsOf(source)) {
			if (resolves(target)) before.add(`${source.rid}|${target}`);
		}
		const healed = gershayimRefAttribute.apply(gershayimInBody.apply(source).entry).entry;
		for (const target of dataRefsOf(healed)) {
			if (resolves(target)) after.add(`${source.rid}|${target}`);
		}
	}
	// Headwords move too, so resolve `after` against the HEALED headword set.
	expect([...before].filter((k) => !after.has(k))).toEqual([]);
	expect(after.size - before.size).toBe(90);
});
```

Note the comment: the healed headword set is the correct denominator
on the `after` side, because both sides of every link move in the same
pass. Building `after` against the *input* headwords would report 0
newly-resolving targets and look like a failure of the rule rather
than of the test.

- [ ] **Step 2: Assert the gershayim census**

```ts
test('the corpus gains exactly 2,302 gershayim and had none', () => {
	let before = 0;
	let after = 0;
	for (const source of corpus()) {
		before += count(source, GERSHAYIM);
		after += count(gershayimRefAttribute.apply(gershayimInBody.apply(source).entry).entry, GERSHAYIM);
	}
	expect(before).toBe(0);
	expect(after).toBe(2302);
});
```

`count` serializes every field `fieldsOf` walks and counts the
codepoint. If `after` is not 2,302, do not adjust the expectation —
find out why, and record the finding.

- [ ] **Step 3: Check the truncated targets against the shipped rules**

The 90 damaged anchors parsed `malformed: false` with truncated
`data-ref`s for the whole of batches 1 and 2. Ask whether any
registered rule read one of those truncated values and acted on it:

```bash
bun -e 'const {RULES}=await import("./admin/pipeline/transform/registry.ts");
const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34), P=new RegExp("[<][^<>]*["+HEBREW+"]"+Q+"["+HEBREW+"][^<>]*[>]","u");
const damaged=[];
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){
  const e=JSON.parse(l); if(P.test(JSON.stringify(e.content))) damaged.push(e); }
console.log("damaged entries:",damaged.length);
for(const rule of RULES){ let fired=0; const rids=[];
  for(const e of damaged){ const r=rule.apply(e); if(r.records.length>0){fired++; rids.push(e.rid);} }
  if(fired>0) console.log(rule.id, fired, rids.slice(0,10).join(" ")); }
console.log("(no lines above means no shipped rule fires on any of the 90)");'
```

Run this **before** Task 3 registers the new pair, or exclude the two
new ids — otherwise they fire on all 85 by design and bury the signal.

Write the finding into the batch report in Task 5 either way. "No
shipped rule fired on any of the 90" is a result worth recording; so
is the opposite.

- [ ] **Step 4: Run and commit**

```bash
bun test admin/pipeline/transform/rules/gershayim.corpus.test.ts
bun qa
git add admin/pipeline/transform/rules/gershayim.corpus.test.ts
git commit -s -m "🦄 new(transform): link-integrity census for gershayim"
```

---

### Task 5: Corpus run, write-backs, and the batch report

**Goal:** Close the batch — counts reconciled against the catalogue,
both rows' `reason` written, the full pipeline green, and the report
written.

**Files:**
- Modify: `data/patches/patterns.jsonl`
- Modify: `data/patches/catalogue-audit/ascii-quote-as-gershayim-in-body.md`
- Create: `docs/v2/transform-batch-3a.md`
- Modify: `docs/v2/phase-2-triage.md`

**Acceptance Criteria:**
- [ ] `bun transform:count` runs clean or reports only the expected delta on `ascii-quote-as-gershayim-in-body`
- [ ] That row's `corpusCount` is corrected 1,290 → the measured entry count, with the reason recording that the widening from body text to all fields is what moved it
- [ ] `gershayim-breaks-ref-attribute`'s count is confirmed at 85 or corrected with evidence
- [ ] `bun body:migrate-dry` reports 32,512/32,512, 0 schema failures, 0 quarantines
- [ ] `docs/v2/transform-batch-3a.md` records what shipped, the 90/90 result, the link-integrity number, the decline register, and Task 4 Step 3's finding
- [ ] `docs/v2/phase-2-triage.md`'s route table is recomputed from the catalogue, never typed
- [ ] Every claim in the report is reproducible by a command printed beside it

**Verify:** `bun transform:count && bun body:migrate-dry && bun qa`

**Steps:**

- [ ] **Step 1: Run the audit harness**

```bash
bun transform:count
```

`hit` counts ENTRIES. Expect `gershayim-breaks-ref-attribute` at 85
(exact) and `ascii-quote-as-gershayim-in-body` at 1,386 against a
catalogued 1,290 — the designed unit-mismatch finding of module spec
§4.2, caused by this batch widening the row from body text to every
surviving field.

- [ ] **Step 2: Write back both rows**

Surgical edits to `data/patches/patterns.jsonl`:

- `ascii-quote-as-gershayim-in-body`: `corpusCount` 1,290 → 1,386;
  `reason` gains the widening, the `refs[]` exclusion under B7, the
  locus partition, the reconciliation from Task 0, and the decline
  register.
- `gershayim-breaks-ref-attribute`: `reason` gains the 90/90
  cross-link measurement, the finding that all 90 parse
  `malformed: false` with truncated targets, and the note that it is
  the attribute face of its sibling rather than an independent row.

- [ ] **Step 3: Run the full pipeline**

```bash
bun body:migrate-dry
```

Expected: 32,512/32,512, 0 schema failures, 0 quarantines.

- [ ] **Step 4: Write the batch report**

`docs/v2/transform-batch-3a.md`, following
[transform-batch-2.md](../../v2/transform-batch-2.md)'s shape: what
shipped, what it repaired, what it declined and why, what the audit
harness said, and what a re-run will find. State the decline register
as residue, not as coverage.

- [ ] **Step 5: Recompute the triage table**

`docs/v2/phase-2-triage.md`'s route totals are derived, never typed.
Re-run the command the file itself prints and update the table from
its output.

- [ ] **Step 6: Commit**

```bash
bun qa
git add data/patches/patterns.jsonl data/patches/catalogue-audit/ascii-quote-as-gershayim-in-body.md docs/v2/transform-batch-3a.md docs/v2/phase-2-triage.md
git commit -s -m "📖 doc(transform): close batch 3a"
```

---

## Before the pull request

Run the full local review battery over the whole diff — cloud
CodeRabbit is skipped on this repo, so local is the only review. Then
open the PR into `v2`.

Workers Builds fails on every PR into `v2` (`wrangler.jsonc:9` points
at `./app`, which arrives in Phase 4). Not a regression; #44–#47 all
merged with it red.
