# Sweep Tiering — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the exhaustive corpus sweep with stratified discovery
rounds that run until the systemic-pattern catalogue stops growing.

**Architecture:** A seeded sampler cuts one chunk per rid letter per
round (22 chunks / 660 entries), Opus sweeps them under sweep-v4, and
every new systemic pattern is recorded in a catalogue with its
corpus-wide count. Saturation — two consecutive rounds adding no new
pattern — replaces the retired catchable-miss gate. Chunk-input
construction moves out of `tranche.ts` into a shared module so `prep`
and the sampler build identical inputs.

**Tech Stack:** Bun, TypeScript, Biome, `bun test`. Existing modules:
`admin/pipeline/research/{chunks,tranche,anomalies,link-anomalies,verify}.ts`.

**Global Constraints:**
- `bun test admin/pipeline/` must stay green (352 tests at plan time).
- `biome check .` must not gain errors (3 pre-existing at plan time,
  all in files this plan does not touch except `tranche.ts`, which is
  already over the file-length limit and should come down, not up).
- Sweep agents never write inside the repository. Their only writes are
  their two output files in the workdir.
- Chunk size stays 30 (`CHUNK_SIZE`); the sampler changes *which*
  chunks run, never their composition.
- Patch ids stay corpus-unique; ingest renumbering is unchanged.

**User decisions (already made):**
- "A combo of 1 and 2" — blocking means breaks the render **or** would
  be baked in by the transform.
- Tiered approach: structural/blocking work first, extensive quality
  scan post-launch, "improving entries week by week".
- "I want good data" — cost accepted, but months of wall-clock is not.
- The LLM sweep exists "to see if there where anymore unknowns we could
  be writing deterministic tranformations in the pipeline for".
- Page/column research cancelled — migration rule 6 already supplies it.

---

## Scope

This plan covers spec Phase 1 (Discover) plus the two Phase 2 items
already concrete today: the `HOMOGRAPH` detector defect, and triage of
the existing pattern catalogue against schema v2.

Spec Phase 2's remaining rules and Phase 3 are **not** planned here.
Their content is determined by what discovery finds; writing them now
would be placeholders. Re-enter writing-plans after Task 8 declares
saturation.

## File Structure

| File | Responsibility |
|------|----------------|
| `admin/pipeline/research/corpus-inputs.ts` | **New.** Load the pre-patch corpus; build and write one chunk-input JSON. Shared by `prep` and the sampler. |
| `admin/pipeline/research/corpus-inputs.test.ts` | **New.** Covers input shape and hint attachment. |
| `admin/pipeline/research/sample.ts` | **New.** Seeded stratified round selection + CLI. |
| `admin/pipeline/research/sample.test.ts` | **New.** Determinism, one-chunk-per-letter, skips completed. |
| `admin/pipeline/research/patterns.ts` | **New.** Pattern catalogue read/write/report. |
| `admin/pipeline/research/patterns.test.ts` | **New.** Round-trip, duplicate rejection, saturation predicate. |
| `data/patches/patterns.jsonl` | **New.** The catalogue itself, committed. |
| `admin/pipeline/research/link-anomalies.ts` | Modify — `HOMOGRAPH` superscript fix. |
| `admin/pipeline/research/tranche.ts` | Modify — delegate input construction to `corpus-inputs.ts`. |
| `data/patches/RUNBOOK.md` | Modify — gate text for T1/T2, discovery-round procedure. |

---

### Task 1: Accept and commit batch 02 round 2

**Goal:** Land the uncommitted round-2 sweep under spec decision T7 and
retire the miss-rate gate in the runbook.

**Files:**
- Modify: `data/patches/tranches/tranche-01/manifest.jsonl`
- Create: `data/patches/tranches/tranche-01/report-batch-02.md`
- Modify: `data/patches/RUNBOOK.md`
- Already staged by ingest: `patches.jsonl`, `checkpoints/tranche-01.json`

**Acceptance Criteria:**
- [ ] Eight rids carry folded escalations: A01264, A01679, A01315, A00989, A01276 (catchable misses), A01123, A01019 (discoveries), A01546 (out-of-sample discovery)
- [ ] `report-batch-02.md` records both rounds, both threshold results, and the T1 supersession
- [ ] `RUNBOOK.md` gate text matches spec T1/T2 — saturation gate in, miss-rate gate out
- [ ] Manifest still has exactly 750 rows for A00960–A01709

**Verify:** `bun test admin/pipeline/ && python3 -c "import json;rows=[json.loads(l) for l in open('data/patches/tranches/tranche-01/manifest.jsonl') if l.strip()];b=[r for r in rows if 'A00960'<=r['rid']<='A01709'];print(len(b),'rows'); assert len(b)==750"` → `750 rows`

**Steps:**

- [ ] **Step 1: Fold the eight verifier finds into the manifest**

```python
# scripts run from repo root; writes manifest.jsonl in place
import json

FOLD = {
  "A01264": ("needs_human_judgment", "Verifier find (batch-02 r2, clean-01): class 11 wrong-link-target — display 'Tosef. R. Hash. I</a>II (II), 3' targets data-ref 'Rosh Hashanah 3a:2', a Bavli daf, and the anchor closes inside the Roman numeral."),
  "A01679": ("needs_human_judgment", "Verifier find (batch-02 r2, clean-02): class 5 unclassified-binyan — 'Denom. <i>Nithpa</i>. נִתְאַכְזָר' sits loose in definition text with no grammar/stem section."),
  "A01315": ("needs_human_judgment", "Verifier find (batch-02 r2, clean-02): class 11 wrong-link-target — geresh display עיי׳ links to עַיְנוּתָא instead of this entry's Ms. variant עַיֶּילֶת; אֵילַת/אילת target אַיֶּלֶת I across a niqqud twin."),
  "A00989": ("needs_print_check", "Verifier find (batch-02 r2, clean-06): class 8 — definition opens ' Targ. fr.—Pl.', a citation formula cut short; 'Targ. fr.' occurs 1x corpus-wide against 9,820 'a. fr.'."),
  "A01276": ("needs_print_check", "Verifier find (batch-02 r2, clean-07): class 8 lost-parenthetical at two sites — '(late b. h. = אִן III, 6)' leaves a bare digit with no antecedent Ezekiel citation, and a stranded lone ש opens the Y. Shebu. quote."),
  "A01123": ("needs_human_judgment", "Verifier discovery (batch-02 r2, clean-06, uncatchable): etymology anchor display אבל targets אָבֵל I (place name) rather than the mourning etymon; detectable only by reading the target entry."),
  "A01019": ("needs_print_check", "Verifier discovery (batch-02 r2, clean-10, uncatchable): class 8 comma-for-period at a gloss-to-citation boundary; corpus writes a period there 22,065x against 145 commas."),
  "A01546": ("needs_human_judgment", "Out-of-sample discovery (batch-02 r2, clean-03): display אוֹ׳ targets הוֹבְרָיָא — probable class 11 wrong-link-target."),
}

path = "data/patches/tranches/tranche-01/manifest.jsonl"
rows = [json.loads(l) for l in open(path) if l.strip()]
seen = set()
for r in rows:
    if r["rid"] in FOLD:
        disposition, note = FOLD[r["rid"]]
        r["disposition"] = disposition
        r["escalation"] = ((r.get("escalation") or "") + " " + note).strip()
        seen.add(r["rid"])
missing = set(FOLD) - seen
assert not missing, f"rids absent from manifest: {sorted(missing)}"
with open(path, "w") as f:
    for r in rows:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")
print(f"folded {len(seen)} escalations")
```

- [ ] **Step 2: Verify the fold and the row count**

Run:
```bash
python3 -c "
import json
rows=[json.loads(l) for l in open('data/patches/tranches/tranche-01/manifest.jsonl') if l.strip()]
b=[r for r in rows if 'A00960'<=r['rid']<='A01709']
folded=[r for r in b if r['rid'] in {'A01264','A01679','A01315','A00989','A01276','A01123','A01019','A01546'}]
print(len(b),'rows;',len(folded),'folded;',sum(1 for r in folded if r['disposition'].startswith('needs_')),'now escalated')
"
```
Expected: `750 rows; 8 folded; 8 now escalated`

- [ ] **Step 3: Write the batch report**

Copy the generated round-2 report and append provenance. The report
body is produced by `renderPilotReport`; the provenance section below
is written by hand into
`data/patches/tranches/tranche-01/report-batch-02.md`:

```markdown
## Provenance and maintainer decisions

- **Go:** batch 02 go recorded 2026-08-17 10:13 CDT (25 chunks,
  00033–00057, rids A00960–A01709).
- **Round 1 (sweep-v3):** error 0.0% (0/15 sampled patches — the first
  batch with no faulted patch), miss 7.6% (5/66). Four of the five
  catchable misses were one class-11 root cause found by one
  entry-local test. Maintainer chose fix-detection-and-re-sweep; round
  1 was not committed.
- **Remediation (commit 8114d2c):** `link-anomalies.ts` (4 rules,
  1,910 entries / 5.9% corpus-wide), a Roman-numeral comma rule in
  `anomalies.ts` (18 instances against 46,161), and sweep-v4 — the
  display-vs-`data-ref` check made mandatory, the niqqud carve-out
  narrowed, the slash-less Jerusalem Talmud href recorded as systemic.
  All five round-1 misses arrive as hints under v4.
- **Round 2 (sweep-v4, this report):** every round-1 miss caught;
  escalation queue 69 → 120, almost entirely class-11 link defects.
  Error 0.0% (0/13, one label-only slip P000063). Miss 8.2% (5/61) —
  breached again, but on five *different* entries across classes 11,
  5 and 8 with no shared mechanical root cause.
- **Tier experiment (2026-08-17):** Opus sweeping chunks 00033, 00043,
  00044 under the same prompt and chunk size found 25 escalations
  against Sonnet's 17 and caught 3 of the 4 known misses — model tier
  is real, but A00989 slipped past both tiers and Opus surfaced four
  findings neither tier had. Upgrading the model does not close the
  gate.
- **Acceptance (2026-08-17, maintainer):** accepted under
  [sweep tiering spec](../../../docs/specs/2026-08-17-sweep-tiering-design.md)
  decision T1 — the catchable-miss-rate gate is retired in favour of a
  pattern-saturation gate. The eight verifier finds are folded in as
  escalations above.
```

- [ ] **Step 4: Update the runbook gate text**

In `data/patches/RUNBOOK.md`, replace the thresholds paragraph at the
top with:

```markdown
Per-batch procedure for the gated corpus sweep (spec §4.5; plan
Task 8). Every batch is maintainer-gated: **no step 2 without a
recorded go**. Gates (sweep tiering spec, 2026-08-17):

- **Patch error gate (kept):** halt on a sampled **substantive error
  rate > 5%**. A patch failure is *substantive* unless the verifier
  marks it `labelOnly` (repair correct, metadata slip).
- **Catchable-miss gate (retired 2026-08-17, spec T1):** four
  measurements across two prompt versions sat at 7.4–8.2% against a 2%
  limit, including one round where every prior miss was caught. Each
  verification pass re-derives what should have been found, so the
  metric tracked the second-pass advantage rather than sweep quality.
  Misses are still recorded and folded in as escalations; they no
  longer halt a batch.
- **Saturation gate (new):** discovery rounds stop when two
  consecutive rounds add no new systemic pattern class
  (`data/patches/patterns.jsonl`).
```

- [ ] **Step 5: Commit**

```bash
git add data/patches/
git commit -s -m "$(cat <<'EOF'
🌈 improve(research): accept batch 02, retire miss gate

Batch 02 round 2 under sweep-v4: 30 patches accepted, 0 rejected at
ingest, escalation queue 69 -> 120. Substantive error rate 0.0% over
13 sampled patches; one label-only slip.

The catchable-miss gate breached again at 8.2%, on five different
entries in three classes with no shared root cause, one round after
a remediation that caught every prior miss. Retired per the sweep
tiering spec: the metric tracked the verification tier's second-pass
advantage, not sweep quality.

Eight verifier finds folded in as escalations.
EOF
)"
```

---

### Task 2: Fix the HOMOGRAPH superscript false positive

**Goal:** Stop `exact-headword-diverge` firing when a display uses a
Roman homograph (`X II`) and its target uses a superscript (`X ²`).

**Files:**
- Modify: `admin/pipeline/research/link-anomalies.ts` (`HOMOGRAPH`)
- Modify: `admin/pipeline/research/anomalies.test.ts`

**Acceptance Criteria:**
- [ ] `baseHeadword` strips superscript digits as well as Roman numerals and ASCII digits
- [ ] A01346's shape (display `אֵימוּרִים II`, target `אֵימוּרִים ²`) produces no `exact-headword-diverge` hint
- [ ] Existing link-rule tests still pass

**Verify:** `bun test admin/pipeline/research/anomalies.test.ts` → `33 pass, 0 fail`

**Steps:**

- [ ] **Step 1: Write the failing test**

Append to the `entryAnomalyHints — headword-identity link rules`
describe block in `admin/pipeline/research/anomalies.test.ts`:

```typescript
	it('treats a Roman homograph and a superscript as one headword', () => {
		const def = `v. ${anchor('אֵימוּרִים ²', 'אֵימוּרִים II')}`;
		const hints = entryAnomalyHints(
			entry('A01346', def, 'אִימְרָא'),
			new Map(),
			headwordIndex('אִימְרָא', 'אֵימוּרִים ²'),
		);
		expect(hints.some((h) => h.kind === 'exact-headword-diverge')).toBe(false);
	});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test admin/pipeline/research/anomalies.test.ts -t "Roman homograph"`
Expected: FAIL — the hint fires, `expected false, got true`.

- [ ] **Step 3: Extend HOMOGRAPH**

In `admin/pipeline/research/link-anomalies.ts`, replace:

```typescript
/** A homograph suffix on a headword or link target (` I`, ` II`, ` 2`). */
const HOMOGRAPH = /\s+(?:[IVX]+|\d+)$/u;
```

with:

```typescript
/** A homograph suffix on a headword or link target. The corpus writes
 * these three ways for the same thing — Roman (` I`), ASCII digit
 * (` 2`) and superscript (` ²`) — so all three strip identically
 * (batch-02 A01346 fired a false `exact-headword-diverge` when a
 * display's Roman numeral met its target's superscript). */
const HOMOGRAPH = /\s+(?:[IVX]+|[0-9]+|[²³¹⁰-⁹]+)$/u;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test admin/pipeline/research/anomalies.test.ts`
Expected: PASS, `33 pass, 0 fail`.

- [ ] **Step 5: Confirm the corpus effect**

Run:
```bash
bun -e '
import { buildHeadwordIndex, baseHeadword } from "./admin/pipeline/research/link-anomalies.ts";
for (const s of ["אֵימוּרִים II", "אֵימוּרִים ²", "זָמַר I", "מוּר 2"]) {
  console.log(JSON.stringify(s), "->", JSON.stringify(baseHeadword(s)));
}'
```
Expected: every value prints with its suffix removed.

- [ ] **Step 6: Commit**

```bash
bun test admin/pipeline/ && biome check admin/pipeline/research/link-anomalies.ts admin/pipeline/research/anomalies.test.ts
git add admin/pipeline/research/link-anomalies.ts admin/pipeline/research/anomalies.test.ts
git commit -s -m "🦠 fix(research): strip superscript homographs"
```

---

### Task 3: Extract chunk-input construction into a shared module

**Goal:** `prep` and the new sampler build byte-identical chunk inputs
from one code path, and `tranche.ts` comes down under the file-length
limit it currently breaches.

**Files:**
- Create: `admin/pipeline/research/corpus-inputs.ts`
- Create: `admin/pipeline/research/corpus-inputs.test.ts`
- Modify: `admin/pipeline/research/tranche.ts` (delete the moved code, import instead)

**Acceptance Criteria:**
- [ ] `loadPrePatchCorpus`, `senseIndex` and chunk-input writing live in `corpus-inputs.ts`
- [ ] `bun admin/pipeline/research/tranche.ts prep <dir> 1` still writes an input identical to the current output for the same chunk
- [ ] `tranche.ts` no longer trips `lint/style/noExcessiveLinesPerFile`
- [ ] All existing tests pass

**Verify:** `bun test admin/pipeline/ && biome check admin/pipeline/research/tranche.ts` → tests green; no `noExcessiveLinesPerFile` for `tranche.ts`

**Steps:**

- [ ] **Step 1: Write the failing test**

Create `admin/pipeline/research/corpus-inputs.test.ts`:

```typescript
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { buildChunkInput, senseIndex } from './corpus-inputs.ts';

function entry(rid: string, definition: string): SourceEntry {
	return {
		content: { senses: [{ definition, number: '1)' }] },
		headword: 'ראש',
		rid,
	} as SourceEntry;
}

describe('buildChunkInput', () => {
	it('carries chunk id, tranche, pin, prompt version and entries', () => {
		const input = buildChunkInput({
			chunk: { id: 'chunk-00001', rids: ['X00001'] },
			entries: new Map([['X00001', entry('X00001', 'a definition')]]),
			hints: {},
			pin: 'sha256:abc',
			promptVersion: 'v4',
			tranche: 'tranche-01',
		});
		expect(input.chunkId).toBe('chunk-00001');
		expect(input.tranche).toBe('tranche-01');
		expect(input.pin).toBe('sha256:abc');
		expect(input.promptVersion).toBe('v4');
		expect(input.entries).toHaveLength(1);
	});

	it('attaches a precomputed sense index per rid', () => {
		const input = buildChunkInput({
			chunk: { id: 'chunk-00001', rids: ['X00001'] },
			entries: new Map([['X00001', entry('X00001', 'a definition')]]),
			hints: {},
			pin: 'sha256:abc',
			promptVersion: 'v4',
			tranche: 'tranche-01',
		});
		expect(input.sense_index['X00001']?.[0]?.number).toBe('1)');
	});

	it('omits hint entries for rids with no findings', () => {
		const input = buildChunkInput({
			chunk: { id: 'chunk-00001', rids: ['X00001'] },
			entries: new Map([['X00001', entry('X00001', 'a definition')]]),
			hints: {},
			pin: 'sha256:abc',
			promptVersion: 'v4',
			tranche: 'tranche-01',
		});
		expect(input.anomaly_hints).toEqual({});
	});
});

describe('senseIndex', () => {
	it('walks nested senses with dotted paths', () => {
		const e = {
			content: {
				senses: [
					{ definition: 'outer', number: '1)', senses: [{ definition: 'inner', number: 'a)' }] },
				],
			},
			headword: 'ראש',
			rid: 'X00001',
		} as SourceEntry;
		expect(senseIndex(e).map((r) => r.path)).toEqual(['0', '0.0']);
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test admin/pipeline/research/corpus-inputs.test.ts`
Expected: FAIL — `Cannot find module './corpus-inputs.ts'`.

- [ ] **Step 3: Create the module**

Create `admin/pipeline/research/corpus-inputs.ts`:

```typescript
/**
 * Chunk-input construction, shared by the batch `prep` path and the
 * stratified discovery sampler (sweep tiering spec Phase 1). Both must
 * emit byte-identical inputs for the same chunk — the sweep prompt's
 * Input section is a contract, and a divergence between the two paths
 * would silently change what agents see.
 */
import { applyRepairs } from '../body/repairs.ts';
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry, SourceSense } from '../body/types.ts';
import { contentAnchor } from '../patch/schema.ts';
import type { AnomalyHint } from './anomalies.ts';
import type { Chunk } from './chunks.ts';

const SOURCE = 'data/source/jastrow-dictionary.jsonl';

/** One row of the precomputed per-entry sense index the sweep
 * prompt's Input section promises. */
interface SenseIndexRow {
	anchor: string;
	number: string;
	path: string;
}

/** The JSON one sweep agent receives. */
interface ChunkInput {
	anomaly_hints: Record<string, AnomalyHint[]>;
	chunkId: string;
	entries: SourceEntry[];
	pin: string;
	promptVersion: string;
	sense_index: Record<string, SenseIndexRow[]>;
	tranche: string;
}

/** Document-order sense index with dotted paths ("0", "0.1", …). */
function senseIndex(entry: SourceEntry): SenseIndexRow[] {
	const rows: SenseIndexRow[] = [];
	const walk = (senses: readonly SourceSense[], prefix: string): void => {
		for (const [i, sense] of senses.entries()) {
			const path = prefix === '' ? String(i) : `${prefix}.${i}`;
			rows.push({
				anchor: contentAnchor(sense.definition ?? ''),
				number: sense.number ?? '',
				path,
			});
			if (sense.senses !== undefined) {
				walk(sense.senses, path);
			}
		}
	};
	walk(entry.content.senses, '');
	return rows;
}

/** The full corpus in pre-patch state, keyed by rid. */
async function loadPrePatchCorpus(): Promise<Map<string, SourceEntry>> {
	const entries = new Map<string, SourceEntry>();
	for await (const entry of readSourceEntries(SOURCE)) {
		entries.set(entry.rid, applyRepairs(entry).entry);
	}
	return entries;
}

/** Assemble one chunk's input JSON. */
function buildChunkInput(args: {
	chunk: Chunk;
	entries: Map<string, SourceEntry>;
	hints: Record<string, AnomalyHint[]>;
	pin: string;
	promptVersion: string;
	tranche: string;
}): ChunkInput {
	return {
		anomaly_hints: args.hints,
		chunkId: args.chunk.id,
		entries: args.chunk.rids.map(
			(rid) => args.entries.get(rid) as SourceEntry,
		),
		pin: args.pin,
		promptVersion: args.promptVersion,
		sense_index: Object.fromEntries(
			args.chunk.rids.map((rid) => [
				rid,
				senseIndex(args.entries.get(rid) as SourceEntry),
			]),
		),
		tranche: args.tranche,
	};
}

/** Write one chunk input to `<workdir>/inputs/<chunkId>.json`. */
async function writeChunkInput(
	workdir: string,
	input: ChunkInput,
): Promise<void> {
	await Bun.write(
		`${workdir}/inputs/${input.chunkId}.json`,
		JSON.stringify(input, null, '\t'),
	);
}

export type { ChunkInput, SenseIndexRow };
export { buildChunkInput, loadPrePatchCorpus, senseIndex, writeChunkInput };
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test admin/pipeline/research/corpus-inputs.test.ts`
Expected: PASS, `4 pass, 0 fail`.

- [ ] **Step 5: Rewrite `prep` to use the module**

In `admin/pipeline/research/tranche.ts`, delete the local
`senseIndex`, `loadPrePatchCorpus` and the inline `Bun.write` of the
input object, then replace the body of `prep` with:

```typescript
async function prep(workdir: string, count: number): Promise<void> {
	const pin = (await Bun.file(SNAPSHOT_LOCK).text()).split('\n')[0]?.trim();
	const entries = await loadPrePatchCorpus();
	const abbrevTable = buildAbbrevTable(entries.values());
	const headwordIndex = buildHeadwordIndex(entries.values());
	const { pending, tranche } = await nextWork([...entries.keys()]);
	const batch = pending.slice(0, count);
	for (const chunk of batch) {
		const hints: Record<string, AnomalyHint[]> = {};
		for (const rid of chunk.rids) {
			const entryHints = entryAnomalyHints(
				entries.get(rid) as SourceEntry,
				abbrevTable,
				headwordIndex,
			);
			if (entryHints.length > 0) {
				hints[rid] = entryHints;
			}
		}
		await writeChunkInput(
			workdir,
			buildChunkInput({
				chunk,
				entries,
				hints,
				pin: pin as string,
				promptVersion: PROMPT_VERSION,
				tranche: tranche.id,
			}),
		);
		console.log(
			`${chunk.id} (${tranche.id}): ${chunk.rids[0]}..${chunk.rids.at(-1)}`,
		);
	}
	console.log(
		`prepared ${batch.length} chunk(s); ${pending.length - batch.length} more pending in ${tranche.id}`,
	);
}
```

Update the imports at the top of `tranche.ts`: remove `contentAnchor`
from the `../patch/schema.ts` import if now unused, and add

```typescript
import {
	buildChunkInput,
	loadPrePatchCorpus,
	senseIndex,
	writeChunkInput,
} from './corpus-inputs.ts';
```

keeping `senseIndex` in `tranche.ts`'s own export list so existing
importers are unaffected.

- [ ] **Step 6: Prove the output is unchanged**

Run:
Compare against an input the *current* code already produced. Any
chunk input written by the batch-02 round-2 prep is a known-good
reference; regenerate the same chunk and diff.

```bash
REF=<scratchpad>/batch-02r/inputs/chunk-00033.json   # written by pre-refactor prep
mkdir -p /tmp/prep-check
bun -e '
import { buildChunkInput, loadPrePatchCorpus, writeChunkInput } from "./admin/pipeline/research/corpus-inputs.ts";
import { buildAbbrevTable, entryAnomalyHints } from "./admin/pipeline/research/anomalies.ts";
import { buildHeadwordIndex } from "./admin/pipeline/research/link-anomalies.ts";
import { chunkCorpus } from "./admin/pipeline/research/chunks.ts";
const entries = await loadPrePatchCorpus();
const table = buildAbbrevTable(entries.values());
const index = buildHeadwordIndex(entries.values());
const chunk = chunkCorpus([...entries.keys()]).find((c) => c.id === "chunk-00033");
const hints = {};
for (const rid of chunk.rids) {
  const h = entryAnomalyHints(entries.get(rid), table, index);
  if (h.length > 0) hints[rid] = h;
}
const pin = (await Bun.file("data/patches/snapshot.lock").text()).split("\n")[0].trim();
await writeChunkInput("/tmp/prep-check", buildChunkInput({
  chunk, entries, hints, pin, promptVersion: "v4", tranche: "tranche-01",
}));'
diff "$REF" /tmp/prep-check/inputs/chunk-00033.json && echo IDENTICAL
```
Expected: `IDENTICAL`. If the reference workdir is gone, regenerate it
with `git stash` around a `prep` run instead — but only after Task 1
has committed the working tree, or the stash will swallow it.

- [ ] **Step 7: Commit**

```bash
bun test admin/pipeline/ && biome check admin/pipeline/research/
git add admin/pipeline/research/
git commit -s -m "🌈 improve(research): share chunk-input construction"
```

---

### Task 4: Stratified round sampler

**Goal:** Select one unswept chunk per rid letter per round,
deterministically, and write its input.

**Files:**
- Create: `admin/pipeline/research/sample.ts`
- Create: `admin/pipeline/research/sample.test.ts`

**Acceptance Criteria:**
- [ ] `stratifiedRound` returns at most one chunk per rid letter
- [ ] Same (round, corpus, completed set) always returns the same chunks
- [ ] Chunks already in the checkpoint's `completed` list are never selected
- [ ] Different rounds select different chunks for the same letter
- [ ] CLI writes inputs for a round: `bun admin/pipeline/research/sample.ts <workdir> <round>`

**Verify:** `bun test admin/pipeline/research/sample.test.ts` → `5 pass, 0 fail`

**Steps:**

- [ ] **Step 1: Write the failing test**

Create `admin/pipeline/research/sample.test.ts`:

```typescript
import { describe, expect, it } from 'bun:test';
import type { Chunk } from './chunks.ts';
import { stratifiedRound } from './sample.ts';

/** Three letters, four chunks each. */
function corpus(): Chunk[] {
	const chunks: Chunk[] = [];
	for (const letter of ['A', 'B', 'C']) {
		for (let i = 0; i < 4; i++) {
			chunks.push({
				id: `chunk-${letter}${i}`,
				rids: [`${letter}0000${i}`],
			});
		}
	}
	return chunks;
}

describe('stratifiedRound', () => {
	it('returns one chunk per rid letter', () => {
		const picked = stratifiedRound(corpus(), new Set(), 1);
		expect(picked).toHaveLength(3);
		expect(new Set(picked.map((c) => c.rids[0]?.[0])).size).toBe(3);
	});

	it('is deterministic for the same inputs', () => {
		const a = stratifiedRound(corpus(), new Set(), 1).map((c) => c.id);
		const b = stratifiedRound(corpus(), new Set(), 1).map((c) => c.id);
		expect(a).toEqual(b);
	});

	it('never selects a completed chunk', () => {
		const completed = new Set(['chunk-A0', 'chunk-A1', 'chunk-A2']);
		const picked = stratifiedRound(corpus(), completed, 1);
		const a = picked.find((c) => c.rids[0]?.[0] === 'A');
		expect(a?.id).toBe('chunk-A3');
	});

	it('picks different chunks across rounds', () => {
		const one = stratifiedRound(corpus(), new Set(), 1).map((c) => c.id);
		const two = stratifiedRound(corpus(), new Set(), 2).map((c) => c.id);
		expect(one).not.toEqual(two);
	});

	it('skips a letter whose chunks are all complete', () => {
		const completed = new Set(['chunk-B0', 'chunk-B1', 'chunk-B2', 'chunk-B3']);
		const picked = stratifiedRound(corpus(), completed, 1);
		expect(picked.some((c) => c.rids[0]?.[0] === 'B')).toBe(false);
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test admin/pipeline/research/sample.test.ts`
Expected: FAIL — `Cannot find module './sample.ts'`.

- [ ] **Step 3: Create the sampler**

Create `admin/pipeline/research/sample.ts`:

```typescript
#!/usr/bin/env bun
/**
 * Stratified discovery sampler (sweep tiering spec Phase 1.2).
 *
 * Everything swept before 2026-08-17 sits inside rid letter A — 5.3%
 * of the corpus, 49% of one letter — so pattern discovery to date is
 * biased to a single alphabetic region. A round is one chunk per rid
 * letter: 22 chunks, 660 entries, spread across the whole dictionary.
 *
 *   bun admin/pipeline/research/sample.ts <workdir> <round>
 *
 * Selection is a pure function of (chunks, completed, round), so a
 * round is reproducible and re-runnable.
 */
import process from 'node:process';
import type { SourceEntry } from '../body/types.ts';
import {
	type AnomalyHint,
	buildAbbrevTable,
	entryAnomalyHints,
} from './anomalies.ts';
import { chunkCorpus, loadCheckpoint } from './chunks.ts';
import type { Chunk } from './chunks.ts';
import {
	buildChunkInput,
	loadPrePatchCorpus,
	writeChunkInput,
} from './corpus-inputs.ts';
import { buildHeadwordIndex } from './link-anomalies.ts';

const SNAPSHOT_LOCK = 'data/patches/snapshot.lock';
const PROMPT_VERSION = 'v4';
/** Fixed so a round is reproducible; changing it reshuffles history. */
const SEED = 20_260_817;
/** Mersenne prime modulus — keeps the hash inside a safe integer and
 * avoids bitwise operators (biome `noBitwiseOperators`). */
const MODULUS = 2_147_483_647;

/** Deterministic non-negative hash of a key. */
function hash(key: string): number {
	let h = SEED % MODULUS;
	for (const ch of key) {
		h = (h * 31 + ch.codePointAt(0)!) % MODULUS;
	}
	return h;
}

/** One unswept chunk per rid letter for `round`. Letters whose chunks
 * are all complete are skipped. */
function stratifiedRound(
	chunks: readonly Chunk[],
	completed: ReadonlySet<string>,
	round: number,
): Chunk[] {
	const byLetter = new Map<string, Chunk[]>();
	for (const chunk of chunks) {
		if (completed.has(chunk.id)) {
			continue;
		}
		const letter = chunk.rids[0]?.[0];
		if (letter === undefined) {
			continue;
		}
		const group = byLetter.get(letter) ?? [];
		group.push(chunk);
		byLetter.set(letter, group);
	}
	const picked: Chunk[] = [];
	for (const [letter, group] of [...byLetter].sort(([a], [b]) =>
		a.localeCompare(b),
	)) {
		picked.push(group[hash(`${letter}:${round}`) % group.length] as Chunk);
	}
	return picked;
}

async function sample(workdir: string, round: number): Promise<void> {
	const pin = (await Bun.file(SNAPSHOT_LOCK).text()).split('\n')[0]?.trim();
	const entries = await loadPrePatchCorpus();
	const abbrevTable = buildAbbrevTable(entries.values());
	const headwordIndex = buildHeadwordIndex(entries.values());
	const chunks = chunkCorpus([...entries.keys()]);
	const checkpoint = await loadCheckpoint('tranche-01');
	const completed = new Set(checkpoint?.completed ?? []);
	const picked = stratifiedRound(chunks, completed, round);
	for (const chunk of picked) {
		const hints: Record<string, AnomalyHint[]> = {};
		for (const rid of chunk.rids) {
			const entryHints = entryAnomalyHints(
				entries.get(rid) as SourceEntry,
				abbrevTable,
				headwordIndex,
			);
			if (entryHints.length > 0) {
				hints[rid] = entryHints;
			}
		}
		await writeChunkInput(
			workdir,
			buildChunkInput({
				chunk,
				entries,
				hints,
				pin: pin as string,
				promptVersion: PROMPT_VERSION,
				tranche: 'discovery',
			}),
		);
		console.log(
			`${chunk.id}: ${chunk.rids[0]}..${chunk.rids.at(-1)}`,
		);
	}
	console.log(`round ${round}: ${picked.length} chunk(s) prepared`);
}

if (import.meta.main) {
	const [workdir, roundArg] = process.argv.slice(2);
	if (workdir === undefined || roundArg === undefined) {
		console.error('usage: sample.ts <workdir> <round>');
		process.exit(1);
	}
	await sample(workdir, Number(roundArg));
}

export { stratifiedRound };
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test admin/pipeline/research/sample.test.ts`
Expected: PASS, `5 pass, 0 fail`.

- [ ] **Step 5: Dry-run a real round**

Run:
```bash
mkdir -p /tmp/round-1 && bun admin/pipeline/research/sample.ts /tmp/round-1 1 | tail -3
ls /tmp/round-1/inputs | wc -l
python3 -c "
import json,glob
letters={json.load(open(f))['entries'][0]['rid'][0] for f in glob.glob('/tmp/round-1/inputs/*.json')}
print(sorted(letters))"
```
Expected: 22 input files; the letter list covers A–V with no duplicates.

- [ ] **Step 6: Commit**

```bash
bun test admin/pipeline/ && biome check admin/pipeline/research/
git add admin/pipeline/research/sample.ts admin/pipeline/research/sample.test.ts
git commit -s -m "🦄 new(research): stratified discovery sampler"
```

---

### Task 5: Pattern catalogue store

**Goal:** Record every systemic pattern class with its corpus count, and
compute the saturation predicate mechanically.

**Files:**
- Create: `admin/pipeline/research/patterns.ts`
- Create: `admin/pipeline/research/patterns.test.ts`
- Create: `data/patches/patterns.jsonl`

**Acceptance Criteria:**
- [ ] A pattern row carries `id`, `round`, `description`, `corpusCount`, `status`
- [ ] `status` is one of `candidate`, `scripted`, `discarded`
- [ ] Adding a duplicate `id` throws rather than silently appending
- [ ] `isSaturated(rows, round)` is true when the last two rounds added no rows
- [ ] The seeded catalogue contains the eleven patterns known at plan time

**Verify:** `bun test admin/pipeline/research/patterns.test.ts` → `6 pass, 0 fail`

**Steps:**

- [ ] **Step 1: Write the failing test**

Create `admin/pipeline/research/patterns.test.ts`:

```typescript
import { describe, expect, it } from 'bun:test';
import { addPattern, isSaturated, type Pattern, parsePatterns } from './patterns.ts';

function rows(): Pattern[] {
	return [
		{ corpusCount: 7679, description: 'JT href missing leading slash', id: 'jt-href-slash', round: 0, status: 'candidate' },
		{ corpusCount: 312, description: 'Ib. anchors resolving to Yoma 2a', id: 'ib-yoma-2a', round: 1, status: 'candidate' },
	];
}

describe('parsePatterns', () => {
	it('round-trips JSONL', () => {
		const text = rows().map((r) => JSON.stringify(r)).join('\n');
		expect(parsePatterns(text)).toEqual(rows());
	});

	it('ignores blank lines', () => {
		const text = `${JSON.stringify(rows()[0])}\n\n`;
		expect(parsePatterns(text)).toHaveLength(1);
	});
});

describe('addPattern', () => {
	it('appends a new pattern', () => {
		const next = addPattern(rows(), {
			corpusCount: 796,
			description: 'unlinked v. span cross-references',
			id: 'unlinked-v-span',
			round: 2,
			status: 'candidate',
		});
		expect(next).toHaveLength(3);
	});

	it('rejects a duplicate id', () => {
		expect(() =>
			addPattern(rows(), {
				corpusCount: 1,
				description: 'dupe',
				id: 'jt-href-slash',
				round: 2,
				status: 'candidate',
			}),
		).toThrow('jt-href-slash');
	});
});

describe('isSaturated', () => {
	it('is false while a recent round added a pattern', () => {
		expect(isSaturated(rows(), 2)).toBe(false);
	});

	it('is true when the last two rounds added nothing', () => {
		expect(isSaturated(rows(), 3)).toBe(true);
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test admin/pipeline/research/patterns.test.ts`
Expected: FAIL — `Cannot find module './patterns.ts'`.

- [ ] **Step 3: Create the module**

Create `admin/pipeline/research/patterns.ts`:

```typescript
/**
 * Systemic-pattern catalogue (sweep tiering spec Phase 1).
 *
 * The sweep's product is pattern classes, not patches: one rule
 * derived from a pattern fixes every instance, so sweeping for more
 * instances of a known pattern is wasted spend. This module is the
 * catalogue and the saturation predicate that replaces the retired
 * catchable-miss gate.
 */

/** How a catalogued pattern will be handled. */
type PatternStatus = 'candidate' | 'discarded' | 'scripted';

/** One systemic pattern class. */
interface Pattern {
	/** Entries matching corpus-wide, at the time it was catalogued. */
	corpusCount: number;
	description: string;
	/** Stable kebab-case key. */
	id: string;
	/** Discovery round that first recorded it; 0 for pre-existing. */
	round: number;
	status: PatternStatus;
}

/** Rounds with no new pattern needed to declare saturation. */
const SATURATION_ROUNDS = 2;

function parsePatterns(text: string): Pattern[] {
	return text
		.split('\n')
		.filter((line) => line.trim() !== '')
		.map((line) => JSON.parse(line) as Pattern);
}

function renderPatterns(rows: readonly Pattern[]): string {
	return `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`;
}

/** Append a pattern, rejecting a duplicate id loudly. */
function addPattern(rows: readonly Pattern[], next: Pattern): Pattern[] {
	if (rows.some((r) => r.id === next.id)) {
		throw new Error(`duplicate pattern id: ${next.id}`);
	}
	return [...rows, next];
}

/** True when the last SATURATION_ROUNDS rounds added no pattern. */
function isSaturated(rows: readonly Pattern[], round: number): boolean {
	const cutoff = round - SATURATION_ROUNDS;
	return !rows.some((r) => r.round > cutoff);
}

export type { Pattern, PatternStatus };
export {
	addPattern,
	isSaturated,
	parsePatterns,
	renderPatterns,
	SATURATION_ROUNDS,
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test admin/pipeline/research/patterns.test.ts`
Expected: PASS, `6 pass, 0 fail`.

- [ ] **Step 5: Seed the catalogue with the eleven known patterns**

Create `data/patches/patterns.jsonl` — round 0 is everything known
before the first discovery round:

```jsonl
{"corpusCount":20298,"description":"data-ref value absent from the entry's refs[] array","id":"dataref-not-in-refs","round":0,"status":"candidate"}
{"corpusCount":9805,"description":"raw space before the href disambiguator (/Jastrow,_מוּר I.1)","id":"href-raw-space","round":0,"status":"candidate"}
{"corpusCount":7679,"description":"Jerusalem Talmud href missing its leading slash","id":"jt-href-slash","round":0,"status":"candidate"}
{"corpusCount":4900,"description":"bare RTL Hebrew in definition text with no dir=rtl wrapper","id":"bare-rtl-hebrew","round":0,"status":"candidate"}
{"corpusCount":2572,"description":"Jastrow data-ref whose headword skeleton is absent from the corpus","id":"dataref-skeleton-absent","round":0,"status":"candidate"}
{"corpusCount":1220,"description":"duplicate anchor wrap in non-sense fields (language_reference etc.)","id":"nonsense-dup-anchor","round":0,"status":"candidate"}
{"corpusCount":796,"description":"unlinked v. <span dir=rtl> cross-references the linker never anchored","id":"unlinked-v-span","round":0,"status":"candidate"}
{"corpusCount":703,"description":"empty string slot in plural_form array","id":"plural-form-empty-slot","round":0,"status":"candidate"}
{"corpusCount":575,"description":"gender label (f., m.) left in the definition instead of a morphology field","id":"gender-in-definition","round":0,"status":"candidate"}
{"corpusCount":312,"description":"Ib. anchors resolving to Yoma 2a regardless of context","id":"ib-yoma-2a","round":0,"status":"candidate"}
{"corpusCount":126,"description":"missing space in )<i> and )</a><i> after a tag-adjacent paren","id":"paren-tag-no-space","round":0,"status":"candidate"}
```

- [ ] **Step 6: Verify the catalogue parses and is not yet saturated**

Run:
```bash
bun -e '
import { parsePatterns, isSaturated } from "./admin/pipeline/research/patterns.ts";
const rows = parsePatterns(await Bun.file("data/patches/patterns.jsonl").text());
console.log(rows.length, "patterns;", rows.reduce((n, r) => n + r.corpusCount, 0), "entry-instances");
console.log("saturated at round 1?", isSaturated(rows, 1));'
```
Expected: `11 patterns; 48986 entry-instances` and `saturated at round 1? false`.

- [ ] **Step 7: Commit**

```bash
bun test admin/pipeline/ && biome check admin/pipeline/research/
git add admin/pipeline/research/patterns.ts admin/pipeline/research/patterns.test.ts data/patches/patterns.jsonl
git commit -s -m "🦄 new(research): systemic pattern catalogue"
```

---

### Task 6: Triage the catalogue against schema v2

**Goal:** Establish which catalogued patterns still exist after the v2
transform, so Phase 2 writes rules only for patterns that survive.

**Files:**
- Modify: `data/patches/patterns.jsonl` (set `status`)
- Create: `docs/v2/pattern-triage.md`

**Acceptance Criteria:**
- [ ] Every pattern's `status` is `candidate` or `discarded`, none left unexamined
- [ ] Each `discarded` row has a written reason citing the v2 model
- [ ] `docs/v2/pattern-triage.md` records the reasoning per pattern

**Verify:** `bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts"; const r=parsePatterns(await Bun.file("data/patches/patterns.jsonl").text()); console.log(r.filter(x=>x.status==="candidate").length,"survive,",r.filter(x=>x.status==="discarded").length,"discarded")'` → counts sum to 11

**Steps:**

- [ ] **Step 1: Read the v2 storage decision**

Read `docs/specs/2026-07-11-entry-body-model-design.md` §"Cross-reference"
and the field table. The load-bearing sentence for this triage is that
citations store a `ref` value only — "Both URLs derive from the stored
value (rid or canonical ref) at compile per D7 — no URLs are stored".

- [ ] **Step 2: Verify each determination against the v2 field table**

These are the determinations to check, not to invent. Confirm or
overturn each against
`docs/specs/2026-07-11-entry-body-model-design.md`, then record the
outcome. Two rows are marked CHECK because the spec text does not
settle them — those need a decision, not a confirmation.

| Pattern | Corpus | Determination | Reason to verify |
|---|---|---|---|
| `jt-href-slash` | 7,679 | discarded | v2 stores the ref value only; "no URLs are stored" (D7), so the href text never reaches v2. Confirm the *ref value* itself is well-formed for these entries. |
| `href-raw-space` | 9,805 | discarded | Same D7 reasoning — the disambiguator space is an href artifact. |
| `gender-in-definition` | 575 | discarded | Not a defect in v2: `gloss` **deliberately** contains the gender marker (B2, "deliberately unextracted"), and `grammar.gender` is a separate typed index seeded from the 13,162 visible markers. |
| `bare-rtl-hebrew` | ~4,900 | survives | `gloss` is tagged prose carried into v2; missing `dir="rtl"` travels with it. |
| `paren-tag-no-space` | 126 | survives | Same — a spacing defect inside gloss/unit prose. |
| `nonsense-dup-anchor` | ~1,220 | survives | `language_reference` is rejoined into the gloss (B2, "the etymology parenthesis (rejoined)"), so its duplicate anchors land in v2 gloss markup. |
| `dataref-skeleton-absent` | 2,572 | survives | A ref value pointing at a headword that does not exist is wrong in any representation. |
| `ib-yoma-2a` | 312 | survives | Wrong ref value, same reasoning. |
| `unlinked-v-span` | 796 | survives | A cross-reference the linker never anchored has no `ref` to carry into v2. |
| `dataref-not-in-refs` | 20,298 | **CHECK** | Depends whether v2 rebuilds citation refs from the inline `<cite ref>` tags or migrates `refs[]`. If rebuilt, the pattern is moot. |
| `plural-form-empty-slot` | 703 | **CHECK** | B2 keeps "construct/plural-form phrases" in the gloss deliberately; determine whether the `plural_form` array survives as a field at all. |

Record the two CHECK outcomes explicitly — an unresolved CHECK is a
gap, not a deferral.

- [ ] **Step 3: Record the reasoning**

Create `docs/v2/pattern-triage.md` with one section per pattern:

```markdown
# Pattern triage against schema v2

Each systemic pattern in `data/patches/patterns.jsonl`, judged on
whether the defect survives the v2 transform. Patterns that do not
survive need no rule — the transform discards the representation that
carries them.

| Pattern | Corpus | Survives v2? | Reason |
| --- | --- | --- | --- |
| … | … | … | … |
```

- [ ] **Step 4: Update statuses**

```bash
python3 - <<'PY'
import json
path = "data/patches/patterns.jsonl"
rows = [json.loads(l) for l in open(path) if l.strip()]
# Fill from the triage decisions recorded in docs/v2/pattern-triage.md.
DISCARD = {}  # id -> reason, populated by Step 2
for r in rows:
    if r["id"] in DISCARD:
        r["status"] = "discarded"
        r["reason"] = DISCARD[r["id"]]
with open(path, "w") as f:
    for r in rows:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")
print(sum(1 for r in rows if r["status"] == "discarded"), "discarded")
PY
```

- [ ] **Step 5: Commit**

```bash
git add data/patches/patterns.jsonl docs/v2/pattern-triage.md
git commit -s -m "📖 doc(research): triage patterns against schema v2"
```

---

### Task 7: Discovery round 1

**Goal:** Sweep 22 stratified chunks with Opus and record every new
pattern class.

**Files:**
- Modify: `data/patches/patterns.jsonl`
- Create: `docs/v2/discovery-round-1.md`

**Acceptance Criteria:**
- [ ] 22 chunk inputs prepared by the sampler for round 1
- [ ] Each chunk swept by one Opus agent under `sweep-v4.md`
- [ ] Every chunk produces a manifest with exactly 30 rows
- [ ] New pattern classes appended to the catalogue with corpus counts
- [ ] Round report written with the new-pattern count

**Verify:** `for f in <workdir>/out/*.manifest.jsonl; do test $(grep -c . $f) -eq 30 || echo "BAD $f"; done` → no output

**Steps:**

- [ ] **Step 1: Prepare the round**

```bash
W=<scratchpad>/discovery-r1
mkdir -p "$W/out"
bun admin/pipeline/research/sample.ts "$W" 1
ls "$W/inputs" | wc -l   # expect 22
```

- [ ] **Step 2: Dispatch one Opus sweep agent per chunk, in waves of ~7**

Each agent's brief, with `<CHUNK>` substituted:

```text
You are a sweep agent for the Jastrow dictionary research pipeline,
discovery round 1, <CHUNK>.

1. Read admin/pipeline/research/prompts/sweep-v4.md IN FULL. It is your
   operating contract. The anchor display-vs-data-ref comparison is
   MANDATORY for every anchor you read.
2. Read your input JSON: <W>/inputs/<CHUNK>.json
3. Write exactly two output files:
   - <W>/out/<CHUNK>.patches.jsonl
   - <W>/out/<CHUNK>.manifest.jsonl

Hard rules:
- NEVER modify, create, or delete any file inside the repository. Your
  only writes are the two output files above. You MAY read
  data/source/jastrow-dictionary.jsonl if a judgment needs it.
- Judge this chunk on its own evidence only. Do not read, list, or glob
  any other chunk's input or output. An empty patches file IS normal.
- Record prompt_version "v4" verbatim in every patch.
- Every rid in the input must have exactly one manifest row.
- Judge every anomaly hint explicitly.

DISCOVERY GOAL — report separately from the manifest: any defect shape
that recurs mechanically across entries and looks corpus-wide rather
than per-entry. For each, give a name, a one-line description, and a
corpus-wide count obtained by grepping
data/source/jastrow-dictionary.jsonl. These become deterministic
pipeline rules; per-entry escalations do not.

Return: chunk id, entries processed, patches written, disposition
counts, then a list of candidate systemic patterns with counts.
```

- [ ] **Step 3: Verify every chunk returned complete output**

```bash
W=<scratchpad>/discovery-r1
echo "inputs: $(ls $W/inputs | wc -l) manifests: $(ls $W/out/*.manifest.jsonl | wc -l)"
for f in "$W"/out/*.manifest.jsonl; do n=$(grep -c . "$f"); [ "$n" != "30" ] && echo "BAD $(basename $f): $n"; done
echo "(no BAD lines = all 30 rows)"
```

- [ ] **Step 4: Append new patterns to the catalogue**

For each candidate the agents reported that is not already in
`patterns.jsonl`, verify its corpus count independently, then append:

```bash
python3 - <<'PY'
import json, subprocess
path = "data/patches/patterns.jsonl"
rows = [json.loads(l) for l in open(path) if l.strip()]
known = {r["id"] for r in rows}
# NEW: one dict per verified candidate from this round.
NEW = []  # e.g. {"id":"…","description":"…","corpusCount":0,"round":1,"status":"candidate"}
for n in NEW:
    assert n["id"] not in known, f"duplicate: {n['id']}"
    rows.append(n)
with open(path, "w") as f:
    for r in rows:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")
print(f"round 1 added {len(NEW)} pattern(s); catalogue now {len(rows)}")
PY
```

- [ ] **Step 5: Write the round report**

Create `docs/v2/discovery-round-1.md` recording: chunks swept, entries,
disposition totals, new patterns with counts, and whether any letter
behaved unlike letter A (the spec's stated risk).

- [ ] **Step 6: Commit**

```bash
git add data/patches/patterns.jsonl docs/v2/discovery-round-1.md
git commit -s -m "🌈 improve(research): discovery round 1"
```

---

### Task 9: Calibrate the detector before round 2

**Goal:** Land the six detector corrections round 1 identified, so round 2
measures sweep coverage rather than detector blindness.

**Files:**
- Modify: `admin/pipeline/research/link-anomalies.ts`
- Modify: `admin/pipeline/research/anomalies.ts`
- Modify: `admin/pipeline/research/anomalies.test.ts`
- Create: `admin/pipeline/research/hebrew-anomalies.ts`
- Create: `admin/pipeline/research/hebrew-anomalies.test.ts`
- Modify: `admin/pipeline/research/prompts/sweep-v4.md` (fix the stale `v3` in the output-contract table and checklist item 7)

**Acceptance Criteria:**
- [ ] Editorial `*` prefix stripped before headword comparison; the ~1,485 anchors whose display is the de-asterisked target no longer fire `exact-headword-diverge`
- [ ] Redirect-stub retargets suppressed: display X whose entry is a bare `, v. Y` stub linking to Y no longer fires (28 corpus-wide)
- [ ] Geresh rule extended to prefixed forms (particle + one-letter abbrev of the host headword, 183 instances, ~99% wrong) and to abbreviations of the entry's own inflected forms (137 at ≥3 letters)
- [ ] Niqqud carve-out narrowed so an anchor whose display is an inflection label of the host entry is flagged even when the skeleton is unique
- [ ] Unvocalized displays reachable: a display that is not itself a headword but differs from its target by one non-final consonant is detectable (696 of 751 currently unreachable)
- [ ] New Hebrew-side frequency rule: a Hebrew token occurring ≤2× that is one confusable-pair substitution from a token occurring ≥100× produces a hint
- [ ] `sweep-v4.md` no longer says `v3` anywhere in its contract table or checklist
- [ ] Every new rule reports its corpus-wide hit count, and the union of all hint kinds stays under 25% of entries

**Verify:** `bun test admin/pipeline/` → all green, including new tests; plus a corpus calibration run printing per-rule hit counts

---

### Task 8: Discovery round 2 and saturation decision

**Goal:** Run the second stratified round and decide, mechanically,
whether discovery is saturated.

> **COMPLETE (2026-08-18).** Sweep and consolidation both landed. The
> catalogue is at **118 rows** (80 + 38 round-2 rows) and
> `isSaturated(rows, 2)` returns **`false`** against the folded file.
> Handoff and merge record: `docs/v2/discovery-round-2.md`; raw
> per-chunk evidence: `docs/v2/discovery-round-2-candidates.md`;
> sweep outputs: `data/patches/discovery-round-2/`.
>
> Both resume hazards were handled at the fold:
> 1. **`same-anchor-positional-mislink` re-measured 3,183 -> 374.**
>    2,882 of its members were the legitimate `X ch. same` cognate
>    convention; a transform written to the old definition would have
>    rewritten them. The row now carries the split in its `reason`.
> 2. **The saturation check was run only after folding.** Recorded
>    results: `isSaturated(rows, 2)` = `false`, `(rows, 3)` = `false`,
>    `(rows, 4)` = `true` — so round 4 is the earliest possible
>    declaration, and only if rounds 3 and 4 both add nothing.
>
> **One item is still open and is Brian's call:** whether round 3 is
> another 22-chunk sweep or an audit of the existing rows. See
> `docs/v2/discovery-round-2.md` "Next actions" #5.

**Files:**
- Modify: `data/patches/patterns.jsonl`
- Create: `docs/v2/discovery-round-2.md`

**Acceptance Criteria:**
- [x] Round 2 selects different chunks from round 1 — zero overlap
- [x] All 22 chunks swept and validated at 30 manifest rows — 660 rows,
      all JSON-valid, 20 patches
- [x] New patterns appended with `round: 2` — 38 rows (34 candidate,
      4 discarded) folded from 66 raw candidates; catalogue 80 -> 118
- [x] `isSaturated(rows, 2)` computed and recorded in the report —
      `false`, run against the folded catalogue
- [x] If not saturated, the report states that round 3 is required —
      stated; the report additionally recommends round 3 be an **audit
      of the existing rows** rather than another 22-chunk sweep, which
      remains Brian's call, not a silent one

**Verify:** `bun -e 'import {parsePatterns,isSaturated} from "./admin/pipeline/research/patterns.ts"; const r=parsePatterns(await Bun.file("data/patches/patterns.jsonl").text()); console.log("saturated:", isSaturated(r,2))'` → prints a boolean matching the report

**Steps:**

- [ ] **Step 1: Prepare and confirm round 2 differs from round 1**

```bash
W=<scratchpad>/discovery-r2
mkdir -p "$W/out"
bun admin/pipeline/research/sample.ts "$W" 2
diff <(ls <scratchpad>/discovery-r1/inputs) <(ls "$W/inputs") | head
```
Expected: the listings differ.

- [ ] **Step 2: Dispatch 22 Opus sweep agents**

Same brief as Task 7 Step 2, with "discovery round 2" and the round-2
workdir.

- [ ] **Step 3: Validate outputs**

```bash
W=<scratchpad>/discovery-r2
for f in "$W"/out/*.manifest.jsonl; do n=$(grep -c . "$f"); [ "$n" != "30" ] && echo "BAD $(basename $f): $n"; done
echo "(no BAD lines = all 30 rows)"
```

- [ ] **Step 4: Append round-2 patterns**

Same script as Task 7 Step 4 with `"round": 2`.

- [ ] **Step 5: Compute saturation**

```bash
bun -e '
import { parsePatterns, isSaturated, SATURATION_ROUNDS } from "./admin/pipeline/research/patterns.ts";
const rows = parsePatterns(await Bun.file("data/patches/patterns.jsonl").text());
const recent = rows.filter((r) => r.round > 2 - SATURATION_ROUNDS);
console.log(`patterns: ${rows.length}; added in the last ${SATURATION_ROUNDS} round(s): ${recent.length}`);
console.log(`SATURATED: ${isSaturated(rows, 2)}`);'
```

- [ ] **Step 6: Write the report and state the next step**

Create `docs/v2/discovery-round-2.md`. If saturated, record that Phase 1
is complete and Phase 2 planning may begin. If not, record which
patterns round 2 added and that round 3 is required.

- [ ] **Step 7: Commit**

```bash
git add data/patches/patterns.jsonl docs/v2/discovery-round-2.md
git commit -s -m "🌈 improve(research): discovery round 2"
```

---

### Task 10: Audit the catalogue's unverified counts

**Goal:** Re-measure the catalogue rows whose counts have never been
independently checked, before Phase 2 writes a transform against one of
them. This is an **unnumbered pass, not round 3** — see "Why it does not
consume a round" below.

> **Why this task exists.** Round 2's most consequential result was not a
> discovery but a correction: `same-anchor-positional-mislink` was
> catalogued at 3,183 and measured at 374, roughly 85% false positives,
> because 2,882 of its members were the legitimate `X ch. same` cognate
> convention. A deterministic transform written to the old definition
> would have rewritten 2,882 correct links.
>
> That row was **catalogue-indistinguishable** from ten rows still in the
> file: same round, same size class, no `reason` field, never
> re-measured. Those ten hold 25,768 instances — 53% of all candidate
> volume (48,993 across 102 candidate rows). The risk is asymmetric: a
> missing row leaves the corpus unimproved, a wrong row count corrupts it.

**Why it does not consume a round.** `isSaturated` counts rounds, not
looking. An audit adds no `round: 3` rows, so if it were numbered round 3
then `isSaturated(rows, 4)` would return `true` off a *single* empty
sweep instead of two — the same false-declaration shape as the round-2
trap. Rows written by this task keep the round of the row they correct.
The next real sweep is still round 3.

**Files:**
- Modify: `data/patches/patterns.jsonl`
- Create: `docs/v2/catalogue-audit.md`

**Tier A — 10 rows, no `reason`, never re-measured, >=1,000 each
(25,768 instances):**
`bare-rtl-hebrew` (4,900), `midrash-subsection-link-drift` (3,941),
`homograph-numbering-schism` (3,421), `homograph-collapse-link` (2,957),
`trailing-whitespace-definition` (2,340),
`plural-inflection-anchor-escapes-entry` (2,281),
`abbrev-in-alt-headwords` (2,265), `ascii-quote-as-gershayim-in-body`
(1,234), `nonsense-dup-anchor` (1,220),
`italic-swallowed-terminal-period` (1,209).

**Tier B — 23 rows whose own `reason` already flags the count as a
judgement call, a floor, or unmeasured (7,379 instances):** led by
`unmatched-closing-paren` (1,604), `etymology-head-pseudo-sense` (1,553),
`preamble-stranded-lead-sense` (676), `citation-tail-truncation` (657),
`neighbor-rid-mislink` (655). Regenerate the full list from the file
rather than copying it — the reasons are the source of truth.

**Acceptance Criteria:**
- [ ] Every Tier A row carries a `reason` recording an independent
      re-measurement: the probe used, the figure it returned, and whether
      the population splits by function the way `same` did
- [ ] Any row whose measured count differs materially from its catalogued
      count is corrected in place, with the old figure named in `reason`
- [ ] Tier B rows are re-measured or explicitly deferred with a stated
      cost of deferral — no silent pass
- [ ] No row gains `round: 3`; row rounds are unchanged
- [ ] `docs/v2/catalogue-audit.md` records per-row verdict, and totals:
      rows audited, rows corrected, instances added, instances removed
- [ ] `bun test admin/pipeline/` green

**Verify:** `bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts"; const r=parsePatterns(await Bun.file("data/patches/patterns.jsonl").text()); const bare=r.filter(x=>x.status==="candidate"&&!x.reason&&x.corpusCount>=1000); console.log("unaudited tier A:", bare.length, "| max round:", Math.max(...r.map(x=>x.round)))'` -> `unaudited tier A: 0 | max round: 2`

```json:metadata
{"files": ["data/patches/patterns.jsonl", "docs/v2/catalogue-audit.md"], "verifyCommand": "bun test admin/pipeline/", "acceptanceCriteria": ["every tier A row carries a re-measurement reason", "materially wrong counts corrected in place", "tier B re-measured or explicitly deferred", "no row gains round 3", "audit report records per-row verdict and totals"], "modelTier": "frontier"}
```

**Steps:**

- [ ] **Step 1: Regenerate the two tiers from the file**

```bash
bun -e '
import { parsePatterns } from "./admin/pipeline/research/patterns.ts";
const rows = parsePatterns(await Bun.file("data/patches/patterns.jsonl").text());
const cand = rows.filter((r) => r.status === "candidate");
const flagged = /JUDGEMENT CALL|judgement call|not independently re-measured|FLOOR|not measured|unmeasured/i;
const a = cand.filter((r) => !r.reason && r.corpusCount >= 1000);
const b = cand.filter((r) => flagged.test(r.reason ?? ""));
console.log("A", a.length, a.reduce((s, r) => s + r.corpusCount, 0));
console.log("B", b.length, b.reduce((s, r) => s + r.corpusCount, 0));'
```

- [ ] **Step 2: Dispatch one auditor agent per Tier A row**

Each agent gets ONE row and the corpus. Its brief is adversarial, not
confirmatory: *state the probe you would write from this row's
description alone, run it, and report where the population does not mean
what the description says.* Require the `same`-anchor question
explicitly — **does this population have more than one job?** — since
that is the failure mode that produced the 85% error. An agent that
confirms the count must say what would have falsified it.

- [ ] **Step 3: Fold the verdicts**

Correct counts in place; record the superseded figure in `reason`. Where
a row splits by function, either re-scope the row to the defensible
subset (as `same-anchor-positional-mislink` was) or split it, keeping the
original round on both halves.

- [ ] **Step 4: Tier B — re-measure or defer on the record**

- [ ] **Step 5: Write `docs/v2/catalogue-audit.md` and commit**

```bash
git add data/patches/patterns.jsonl docs/v2/catalogue-audit.md
git commit -s -m "🌈 improve(research): audit unverified catalogue counts"
```

---

## After this plan

Re-enter writing-plans for spec Phase 2 (remaining transforms, residue
sweep) and Phase 3 (migrate, render diff, quarantine review) once
Task 8 records saturation and Task 10 has audited the counts those
transforms will read. Those tasks cannot be written before the
catalogue is closed — their content is exactly what discovery produces.

The unverified risk from the spec — whether a sweep patch can collide
with a hand-curated `repairs.ts` edit on the same entry — must be
checked before Phase 3 applies anything. It is not on this plan's
critical path because Phase 1 writes no patches to the corpus.
