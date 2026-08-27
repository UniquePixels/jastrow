# Transform Batch 4 Implementation Plan — anchor & paren integrity

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> ## STATUS: EXECUTED AND CLOSED — 2026-08-26, branch `impl/phase-2-batch-4`
>
> **This plan is HISTORICAL. Every task below is completed; do not re-run one.**
> The batch report is the record of what actually shipped:
> [`docs/v2/transform-batch-4.md`](../../v2/transform-batch-4.md).
>
> **DELIVERED SCOPE: six rules over nine rows** — not the seven rules over ten
> rows this plan was written for. Two rules were deferred mid-batch behind ONE
> SHARED `link-target.ts` gate ruling (Brian, 2026-08-26), which becomes its own
> follow-up PR:
>
> - **`toseftaPrimaryHalakha` (Task 3) WAS NEVER WRITTEN, AND NOTHING IN THIS
>   PLAN LICENSES WRITING IT.** Carrying the print halakha to the primary
>   `data-ref` is REFUSED by `link-target.ts`: case 4's 2026-08-24 tightening
>   requires the tail's discarded prefix to be a prefix of the head, and
>   `Tosefta Shabbat 17` is not a prefix of `Tosefta Shabbat 16`; case 3 fails
>   too, its remainder `:6` having to occur in the primary's display, which
>   reads `Tosef. Sabb. XVI`. `run.ts` throws on a gate problem, so registering
>   such a rule would halt the migration rather than repair anything. Task 3's
>   goal line, checklist, code sketches and test skeletons below all still name
>   `toseftaPrimaryHalakha`; **read every one of them as describing a REFUSED
>   edit.** `tosefta-variant-chapter-halakha-loss` stays in `PENDING`.
> - **`unterminatedHref` (Task 5) IS WRITTEN AND TESTED BUT DELIBERATELY
>   UNREGISTERED.** `admin/pipeline/transform/rules/malformed-href.ts` ships on
>   this branch with its tests green; `checkLinkTargets` refuses `D00478`
>   because the gate reads PARSED targets and the damaged tag parses to an empty
>   `href`/`data-ref`. `unterminated-href-swallows-closing-tag` stays in
>   `PENDING`.
>
> Consequently: **Task 7 registered SIX rules, not seven**, and `PENDING` shrank
> by eight row ids, not ten. The registry holds **33 rules**; `coverage()` reads
> 34 registered / 38 pending / 72 total. Every counted claim below that says
> "seven" or "ten" predates the deferrals — the source of truth for what was
> deferred and why is the module docstrings of
> `admin/pipeline/transform/rules/paren-boundary.ts` and
> `admin/pipeline/transform/rules/malformed-href.ts`.

**Goal (AS PLANNED; see STATUS above for what shipped):** Ship the ten-row anchor-and-paren-integrity family as seven deterministic transforms, close the undeclared containment the spec found, and add the commutation gate that makes population collision checkable for every rule in the registry rather than for this batch alone. **Delivered: six of the seven transforms over nine of the ten rows; the containment closed; the gate inherited from PR #50.**

**Architecture:** Every rule here is a **markup boundary move or a duplicate-layer removal** — none writes text — so all seven (six as shipped) run with an empty `allows` and `checkMarkup`'s well-formedness delta is the gate that matters. Rules land in four modules by repair mechanism (nested-layer removal, paren boundary, stranded tail, malformed href) because the mechanism determines which gate can see the change. One new test-tier gate, `commutation.ts`, asserts that any two registered rules whose two composition orders disagree are declared `entangledWith` — the check 3b's report said did not exist.

**Tech Stack:** Bun, TypeScript, Biome. Existing transform module (`admin/pipeline/transform/`), `patterns.jsonl` catalogue, pinned snapshot `data/source/jastrow-dictionary.jsonl` (sha256 `4c64ff03…`).

**Global Constraints:**
- Branch `impl/phase-2-batch-4`, off `v2` @ `45d50a4` (rebased 2026-08-26 after the precondition merged as PR #50). Never commit to `main` or `v2`.
- Every commit signed off (`git commit -s`), subject ≤ 50 chars, format `<emoji> <type>(<scope>): <description>`.
- `bunx biome check .` before every commit. Branch baseline is **117 infos, 0 errors** — a new error is a regression. (116 before #50; `registry.order.test.ts` now trips `noExcessiveLinesPerFile` at 332 counted lines against a 300 soft max. `bun qa:lint` runs `--error-on-warnings` and still exits 0.)
- Baseline test count on `45d50a4` is **876 pass / 0 fail**. Every task ends with a strictly larger pass count and 0 fail.
- `Rule.apply` MUST treat `entry` as immutable and return a new object, or the same reference unchanged. `count.ts` recursively freezes the corpus, so an in-place write is a `TypeError`.
- **No rule in this batch may set `allows`.** Seven boundary moves; every output byte is an input byte. A non-empty `allows` here is a design error, not a ruling.
- Every rule that writes a `data-ref` or `href` must satisfy a `link-target.ts` case and DECLARE it. Only Task 3's tosefta rule writes a target; it uses **case 4 (`recombined`)**. **CORRECTED 2026-08-26: case 4 REFUSED it** (see STATUS) — `toseftaPrimaryHalakha` was never written, and **NO SHIPPED RULE IN THIS BATCH WRITES A TARGET AT ALL.**
- Registry order is load-bearing. Entangled rows must be gap-free adjacent; the existing order test asserts it against the live graph.
- Edit `patterns.jsonl` **surgically**, one line at a time — `renderPatterns()` reformats all 149 rows.
- Every count written into a `reason` states its unit (occurrences or entries) — batch 3b spec §2.1.
- Any predicate that says "first" or "last" sense walks `sense.senses` recursively — batch 3b spec §2.2.
- **Classify rows by what the READER sees, not by what the markup does** — batch 3b's headline finding.
- **A green commutation gate is NOT evidence that a rule's registry placement is free.** The gate closes two-rule exposure only; if rule C produces the state on which A and B disagree it is silent. Task 7 places seven rules into a 34-deep pipeline — the instrument for that is composing the whole registry both ways, not the pair gate.
- **Whenever a registry position changes, grep the moved rule's id across `patterns.jsonl` and the transform module's comments.** #50's reorder falsified four claims; three survived two fix rounds and a full external review, and one was in a catalogue row nothing in the diff pointed at. Retract in place with the quote-the-old-claim idiom — never append a paragraph that leaves the old sentence standing.
- **`sonar list issues -p UniquePixels_jastrow --pull-request <N> --statuses OPEN,CONFIRMED` is part of the pre-PR battery.** The binary is `sonar`, it needs the sandbox override, its bare `total` counts CLOSED issues, and a green "SonarCloud Code Analysis" check is not zero issues — #50 passed the gate with an open MAJOR.

**User decisions (already made):**
- 2026-08-25 (Brian): batch 4 is anchors and parens *swallowing content*, which is structural; the seam-spacing rows that merely lose a space next to the same tags shipped in 3b.
- 2026-08-26 (Brian): batch 4 scope is **the core 10 rows / 2,513 catalogued instances**; the duplication-debris pair (`duplicated-definition-opening-run`, `adjacent-verbatim-repetition`) and `parenthesized-alt-headword` were offered and declined.

**Deferred to execution (spec §7), each with the recommendation this plan implements:**
- §7.1 pin `tosefta-variant`'s +3 — **Task 1**, investigation not a decision.
- §7.2 the `entangledWith` write-back — **Task 1**, implemented; the measurement is unambiguous.
- §7.3 rule on `post-anchor-numeral-duplication` (11) — **Task 6** publishes the audit and asks Brian. Recommendation: withdraw to `judgment`.
- §7.4 rule on splitting `superscript-subsection-stranded` — **Task 6** publishes the audit and asks Brian. Recommendation: transform the boundary, file the 38 as their own row.
- §7.5 two catalogue rows, one rule — **Task 3**, resolved as two registered rule ids over one shared predicate, the split-by-locus mechanism 3a used.
- §7.6 confirm the commutation gate ships — **Task 0**, implemented.

---

## File structure

| File | Responsibility | Task |
|---|---|---|
| ~~`admin/pipeline/transform/commutation.ts`~~ | the commutation gate — **shipped in PR #50**, inherited not written | — |
| ~~`admin/pipeline/transform/commutation.test.ts`~~ | ditto | — |
| `data/patches/patterns.jsonl` | count, `reason`, `entangledWith` and `route` write-backs | 1, 6 |
| `admin/pipeline/transform/rules/nested-anchor.ts` | the two nested-layer removals (755, 465 incl. the JT 10) | 2 |
| `admin/pipeline/transform/rules/paren-boundary.ts` | the tosefta re-split pair + `open-paren-in-anchor-display` | 3 |
| `admin/pipeline/transform/rules/stranded-tail.ts` | superscript (160) and truncated digit (14) | 4 |
| `admin/pipeline/transform/rules/malformed-href.ts` | the two-instance unterminated-`href` repair | 5 |
| `data/patches/catalogue-audit/post-anchor-numeral-duplication.md` | the §4.1 audit | 6 |
| `data/patches/catalogue-audit/superscript-subsection-stranded.md` | the §4.2 split audit | 6 |
| `admin/pipeline/transform/registry.ts` | register 7 rules, shrink `PENDING` by 10 — **as shipped: 6 rules, `PENDING` by 8** (STATUS) | 7 |
| `docs/v2/transform-batch-4.md` | the batch report | 7 |

Each rules module holds rules that fail the same way, so a reviewer reading one file holds one gate story at a time. The commutation gate is already in `v2`, so every task below inherits its check from the first commit.

---

### Task 0: The commutation gate — SHIPPED IN PR #50, DO NOT IMPLEMENT

**Status: done, outside this batch.** Merged into `v2` as `45d50a4` on
2026-08-26. This section is kept as the record of what changed and why,
because the task as originally written contained a defect that later tasks
must not reintroduce. **Skip to Task 1.**

**What happened.** Task 0 was implemented first, and its corpus-tier test
failed on its first run over the 27 shipped rules: **eight non-commuting
pairs, one declared, seven not.** Four of the seven were a single live defect
— `bare-rtl-hebrew` was registered at position 2, *before* the unlink rules
that expose the Hebrew it is supposed to wrap, so **765 entries were losing
rtl wrappers**. Brian ruled (2026-08-26) that this ships as its own PR before
batch 4, the same shape as the apostrophe-parser precondition that became
PR #47. The gate went with it, because batch 4 cannot land a gate that fails
and the precondition needs the gate green as its proof.

**The defect in this plan's original Task 0, stated so it is not repeated.**
The code written here restricted each pair to the **intersection** of the two
rules' firing-rid sets, and justified it as exact: *"a pair cannot disagree on
an entry where at least one of them changes nothing."* **That is false.** The
premise is evaluated on the RAW entry, so if `b` does not fire on `e` but
fires on `a(e)`, the two orders differ on an entry the skip already discarded
— which is the very exposure mechanism the precondition repairs. Measured, it
discarded ~70% of the differing entries per pair and caught the 50-entry
`plural-to-feminine` pair on the strength of 7 entries, by luck. Worse, a unit
test in this plan pinned the unsound behaviour as *desired*.

The shipped gate uses the **union**, whose premise does hold: if neither rule
changes `e`, both orders are `e`. 27 rules / 351 pairs / ~35s against a
180,000 ms timeout, same 8 pairs, same sample rids.

**What batch 4 inherits.** `admin/pipeline/transform/commutation.ts` exports
`changingRids`, `nonCommutingPairs` and `PairStats`. `PairStats.inertRules`
names rules that changed no entry — an inert rule satisfies the declaration
invariant vacuously, so a pair count alone would miss it. The companion pin in
`registry.order.test.ts` is rule 4, *every unlink rule precedes the rtl wrap
trio*; both `UNLINK` and `WRAP` are earned over the corpus rather than id
literals, and `WRAP`'s coverage signature is position-sensitive.

**Three things the gate cannot see** — Task 7 must not read a green gate as
coverage:

1. **Three-rule exposure.** If rule C produces the state on which A and B
   disagree, the gate is silent.
2. A rule that moved a wrapper **and** edited text in one pass evades `WRAP`'s
   second half. No shipped rule does both.
3. `PENDING` rows have no predicate, so a rule claiming a population that has
   no rule yet stays untestable by construction — 3b's finding, undiminished.

**Consequence for the batch's own numbers.** The registry is now 27 rules deep
and the baseline is 876 pass / 0 fail, 117 biome infos. Task 7 registers seven
rules on top of that, not on top of `a37a9c7`.

---

### Task 1: Pin the counts, write back the catalogue

**Goal:** Explain `tosefta-variant`'s +3, correct the two counts that do not reproduce, give `open-paren-in-anchor-display` its first `reason`, and record the undeclared `jt-double-wrapped-citation` ↔ `nested-anchor-swallows-punctuation` entanglement so the gate from Task 0 can enforce it.

**Files:**
- Modify: `data/patches/patterns.jsonl:22` (`anchor-swallows-close-paren`), `:23` (`nested-anchor-swallows-punctuation`), `:44` (`open-paren-in-anchor-display`), `:98` (`tosefta-variant-chapter-halakha-loss`), `:149` (`jt-double-wrapped-citation`)

**Acceptance Criteria:**
- [ ] The +3 between round 3's 411/388 and this spec's 414/391 is EXPLAINED — the differing entries named, and the difference attributed to a stated change in the predicate, not left as drift.
- [ ] `anchor-swallows-close-paren`: `corpusCount` 494 → 493, and the sentence claiming "the catalogued 494 entries reproduces" corrected.
- [ ] `tosefta-variant-chapter-halakha-loss`: `corpusCount` 388 → whatever the pinned predicate returns, with its unit stated.
- [ ] `open-paren-in-anchor-display` gains a first `reason` carrying: the predicate, 225 occ / 214 ent, and that it is the opposite polarity of `anchor-swallows-close-paren`.
- [x] `nested-anchor-swallows-punctuation` and `jt-double-wrapped-citation` each carry the other in `entangledWith`. (This criterion also asked for the nested row's "truncated" `reason` to be completed — it was never truncated; see spec §3.2's correction.)
- [ ] Route totals recomputed and reported; five lines changed, no others.

**Verify:**
```bash
git diff --stat data/patches/patterns.jsonl   # 5 insertions(+), 5 deletions(-)
bun test admin/pipeline/transform/registry.test.ts
```

**Steps:**

- [ ] **Step 1: Explain the +3**

Round 3 recorded 411 occ / 388 ent; the spec measured 414 occ / 391 ent with the primary selected as *the anchor immediately preceding a `ROMAN), N` variant* and "halakha present" tested as *the `data-ref` contains `:`*. Run both selections side by side and diff the rid sets.

```bash
bun -e '
import {readSourceEntries} from "./admin/pipeline/body/source.ts";
import {fieldsOf} from "./admin/pipeline/transform/no-new-text.ts";
import {anchors} from "./admin/pipeline/transform/links.ts";
import {tokenize} from "./admin/pipeline/transform/html.ts";
const VARIANT=/^[IVXLC]+\),\s*\d+$/;
const byPrev=new Set(), byRegex=new Set();
for await (const e of readSourceEntries()) for (const html of fieldsOf(e)) {
  if (html==="" || !html.includes("<a")) continue;
  const as=anchors(tokenize(html));
  for (const [i,a] of as.entries()) {
    if (!VARIANT.test(a.display.trim())) continue;
    const p=as[i-1]; if (p!==undefined && !p.dataRef.includes(":")) byPrev.add(e.rid);
  }
  for (const m of html.matchAll(/<a\b([^>]*)>[^<]*<\/a>\s*\(<a\b[^>]*>[IVXLC]+\),\s*\d+<\/a>/g))
    if (!/data-ref="[^"]*:/.test(m[1]??"")) byRegex.add(e.rid);
}
const only=(a,b)=>[...a].filter(x=>!b.has(x));
console.log("anchor-view:",byPrev.size,"regex-adjacent:",byRegex.size);
console.log("in anchor-view only:",only(byPrev,byRegex).join(","));
console.log("in regex only:",only(byRegex,byPrev).join(","));'
```

Expected: the two selections differ on a small named set. The anchor view pairs a variant with the previous anchor *in document order even across intervening markup*; the regex requires them textually adjacent. **Whichever set the rule will actually edit is the count that goes in the catalogue** — write the chosen selection into the `reason` in words, so the next reader can re-run it. Inspect each differing rid with the snippet below before choosing.

```bash
bun -e '
import {readSourceEntries} from "./admin/pipeline/body/source.ts";
const want=new Set(process.argv.slice(1));
for await (const e of readSourceEntries()) if (want.has(e.rid)) console.log(e.rid, JSON.stringify(e.content.senses).slice(0,600));' RID1 RID2 RID3
```

- [ ] **Step 2: Edit the five catalogue lines surgically**

One line at a time. Never round-trip through `renderPatterns()` — it reformats all 149 rows and drops any field it does not round-trip.

```bash
# Confirm each target line before editing it.
sed -n '22p;23p;44p;98p;149p' data/patches/patterns.jsonl | cut -c1-140
```

Apply the five edits with `python3` line-indexed JSON edits, which keeps every other line byte-identical:

```bash
python3 - <<'PY'
import json, pathlib
p = pathlib.Path('data/patches/patterns.jsonl')
lines = p.read_text().splitlines(keepends=True)

def edit(lineno, fn):           # lineno is 1-based, as reported above
    row = json.loads(lines[lineno - 1])
    fn(row)
    lines[lineno - 1] = json.dumps(row, ensure_ascii=False, sort_keys=True,
                                   separators=(', ', ': ')) + '\n'

def close_paren(r):
    r['corpusCount'] = 493
    r['reason'] = r['reason'].replace(
        'the catalogued 494 entries reproduces',
        'the catalogued 494 does NOT reproduce — corrected to 493 in batch 4')

def nested(r):
    r.setdefault('entangledWith', [])
    if 'jt-double-wrapped-citation' not in r['entangledWith']:
        r['entangledWith'] = sorted([*r['entangledWith'], 'jt-double-wrapped-citation'])
    r['reason'] += (
        ' BATCH-4: the 10 that trap nothing ARE jt-double-wrapped-citation'
        ' (20 pairs / 10 entries: A00722, C01048, K01007, M01214, J00603,'
        ' K00021, N00255, P01456, S00534, U00888), a STRICT SUBSET of this'
        ' row that no entangledWith edge recorded. Trapped-text census over'
        ' the 475 same-data-ref nested pairs in definition: "." 387, ")" 68,'
        ' nothing 20. Edge added both ways; one rule owns all 465 entries.')

def jt(r):
    r['entangledWith'] = ['nested-anchor-swallows-punctuation']
    r['reason'] += (
        ' BATCH-4: strict subset of nested-anchor-swallows-punctuation (465'
        ' entries) — the 20 pairs are exactly its empty-trapped-text arm.'
        ' Repaired by that row’s rule; this row registers no rule of its'
        ' own. The href slash half stays with the discarded jt-href-slash.')

def open_paren(r):
    r['reason'] = (
        'BATCH-4, FIRST REASON — this row carried none, the shape that hid'
        ' anchor-swallows-close-paren’s entanglement for two rounds.'
        ' Predicate "<a …>(TEXT</a>)" over fieldsOf on the pinned snapshot:'
        ' 225 occurrences / 214 ENTRIES, reproducing the catalogued 214 on'
        ' the entry axis first time asked. Samples A00014, A00577, A01042.'
        ' OPPOSITE POLARITY of anchor-swallows-close-paren, where the paren'
        ' opens outside and closes inside; the batch-4 byte-span comparison'
        ' confirms the two never claim the same bytes.')

# tosefta: substitute the figure Step 1 settled on.
def tosefta(r):
    r['corpusCount'] = 391          # <- replace with Step 1's chosen selection
    r['reason'] += (
        ' BATCH-4 RE-MEASURED: 414 occurrences / 391 ENTRIES on the pinned'
        ' snapshot, against round 3’s 411/388. Selection: the anchor'
        ' immediately preceding a "ROMAN), N" variant IN DOCUMENT ORDER,'
        ' halakha-present tested as a ":" in the data-ref. 525 of 525'
        ' variants have a primary (0 orphans); primaries 521 Tosefta,'
        ' 4 Mishnah.')

edit(22, close_paren)
edit(23, nested)
edit(44, open_paren)
edit(98, tosefta)
edit(149, jt)
p.write_text(''.join(lines))
PY
git diff --stat data/patches/patterns.jsonl
```

- [ ] **Step 3: Confirm exactly five lines moved and the file still parses**

Run:
```bash
git diff --numstat data/patches/patterns.jsonl
bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
const r=await parsePatterns(await Bun.file("data/patches/patterns.jsonl").text());
console.log("rows:",r.length);
for (const id of ["anchor-swallows-close-paren","tosefta-variant-chapter-halakha-loss","nested-anchor-swallows-punctuation","jt-double-wrapped-citation","open-paren-in-anchor-display"]) {
  const x=r.find(y=>y.id===id); console.log(id, x.corpusCount, JSON.stringify(x.entangledWith??[]));
}'
```
Expected: `5   5   data/patches/patterns.jsonl`, `rows: 149`, and the two JT/nested rows each naming the other.

- [ ] **Step 4: Recompute and report the route totals**

```bash
bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
const rows=(await parsePatterns(await Bun.file("data/patches/patterns.jsonl").text())).filter(r=>r.status==="candidate"&&r.route!==undefined);
const sum=(rs)=>rs.reduce((a,b)=>a+b.corpusCount,0);
for (const route of ["transform","judgment","blocked"]) { const rs=rows.filter(r=>r.route===route); console.log(route, rs.length, sum(rs)); }'
```
Expected: `transform 73 <2 lower than before>` — row counts unchanged, instance total down by the two corrections.

- [ ] **Step 5: Commit**

```bash
bunx biome check .
git add data/patches/patterns.jsonl
git commit -s -m "🌈 improve(catalogue): pin batch 4 counts and edges"
```

---

### Task 2: The nested-layer removals

**Goal:** Ship the two duplicate-anchor-layer rules — `nonsense-dup-anchor` (755 occ, `language_reference`) and `nested-anchor-swallows-punctuation` (465 ent, `definition`, absorbing the JT 10) — each dropping the OUTER layer and keeping every text byte.

**Files:**
- Create: `admin/pipeline/transform/rules/nested-anchor.ts`
- Create: `admin/pipeline/transform/rules/nested-anchor.test.ts`
- Read for reference: `admin/pipeline/transform/links.ts:202` (`anchors`), `admin/pipeline/transform/fields.ts:129` (`mapFields`), `admin/pipeline/transform/rules/unlink.ts` (the re-derive-after-each-edit loop)

**Acceptance Criteria:**
- [ ] `dupAnchorLanguageRef` fires only on `language_reference`, only on a nested pair sharing an `href`, and reproduces **755 occurrences / 755 entries**.
- [ ] `nestedAnchorDuplicate` fires only on `definition`, only on a nested pair sharing a `data-ref`, and reproduces **475 occurrences / 465 entries** — including all 20 JT pairs across the 10 rids the catalogue now names.
- [ ] The trapped text survives every edit. Assert the trapped-mark census on the output: `)` 702 / `.` 52 / `,` 1 for the language-reference rule, `.` 387 / `)` 68 / nothing 20 for the definition rule.
- [ ] Neither rule sets `allows`; both pass `checkNoNewText` with a strict sub-multiset.
- [ ] Both refuse any anchor that fails `assertUsable` (malformed, interior, or unclosed) rather than editing it.
- [ ] Removal loops **re-derive anchors after each edit** — anchors nest, and stale indices are the batch-2 bug this codebase already paid for once.

**Verify:** `bun test admin/pipeline/transform/rules/nested-anchor.test.ts` → PASS; `bun transform:count` → both rows MATCH.

**Steps:**

- [ ] **Step 1: Write the failing fixture tests**

```ts
// admin/pipeline/transform/rules/nested-anchor.test.ts
import { describe, expect, test } from 'bun:test';
import { dupAnchorLanguageRef, nestedAnchorDuplicate } from './nested-anchor.ts';
import type { SourceEntry } from '../../body/types.ts';

const A = '<a dir="rtl" class="refLink" href="/Jastrow,_x.1" data-ref="Jastrow, x 1">';

const withLangRef = (html: string): SourceEntry => ({
	content: { senses: [] }, headword: 'h', language_reference: html, rid: 'L1',
});
const withDef = (html: string): SourceEntry => ({
	content: { senses: [{ definition: html }] }, headword: 'h', rid: 'D1',
});

describe('dupAnchorLanguageRef', () => {
	test('drops the outer layer and keeps the trapped mark', () => {
		const out = dupAnchorLanguageRef.apply(withLangRef(`${A}${A}word</a>)</a>`));
		expect(out.entry.language_reference).toBe(`${A}word</a>)`);
		expect(out.records).toHaveLength(1);
	});

	test('leaves a nested pair with different hrefs alone', () => {
		const other = A.replace('_x.1', '_y.1');
		const input = withLangRef(`${A}${other}word</a>)</a>`);
		const out = dupAnchorLanguageRef.apply(input);
		expect(out.entry).toBe(input);
		expect(out.records).toEqual([]);
	});

	test('does not touch a definition', () => {
		const input = withDef(`${A}${A}word</a>.</a>`);
		expect(dupAnchorLanguageRef.apply(input).entry).toBe(input);
	});
});

describe('nestedAnchorDuplicate', () => {
	test('drops the outer layer, keeping the trapped period', () => {
		const out = nestedAnchorDuplicate.apply(withDef(`${A}${A}word</a>.</a>`));
		expect(out.entry.content.senses[0]?.definition).toBe(`${A}word</a>.`);
	});

	test('handles the JT shape, which traps nothing', () => {
		const jt = '<a class="refLink" href="Jerusalem_Talmud_Peah.1" data-ref="Jerusalem Talmud Peah 1">';
		const out = nestedAnchorDuplicate.apply(withDef(`lead ${jt}${jt}Y. Peah I</a></a> tail`));
		expect(out.entry.content.senses[0]?.definition).toBe(`lead ${jt}Y. Peah I</a> tail`);
		expect(out.records).toHaveLength(1);
	});

	test('re-derives after each edit, so two pairs in one field both go', () => {
		const out = nestedAnchorDuplicate.apply(withDef(`${A}${A}a</a>.</a> and ${A}${A}b</a>.</a>`));
		expect(out.entry.content.senses[0]?.definition).toBe(`${A}a</a>. and ${A}b</a>.`);
		expect(out.records).toHaveLength(2);
	});

	test('refuses an unclosed outer anchor', () => {
		const input = withDef(`${A}${A}word</a>.`);
		expect(nestedAnchorDuplicate.apply(input).entry).toBe(input);
	});
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun test admin/pipeline/transform/rules/nested-anchor.test.ts`
Expected: FAIL — `Cannot find module './nested-anchor.ts'`

- [ ] **Step 3: Implement `nested-anchor.ts`**

Both rules are one shared walk parameterised by locus and by which attribute must match — the split-by-locus shape `rules/gershayim.ts` established for the gershayim pair.

```ts
/**
 * The nested-anchor duplicate-layer pair (batch-4 spec §5 rules 1, 2).
 *
 * One defect, two rows, split by LOCUS — `nonsense-dup-anchor` owns
 * `language_reference`, `nested-anchor-swallows-punctuation` owns
 * `definition` — which is the shape `rules/gershayim.ts` uses and the
 * shape the catalogue records: the two rows were catalogued over the
 * same records until the Task 10 audit re-scoped the first to its 755
 * language-reference members.
 *
 * `jt-double-wrapped-citation` (10 entries / 20 pairs) has NO rule of
 * its own. It is a strict subset of the definition row — the arm that
 * traps nothing between the two layers — established by the batch-4
 * span comparison and now declared with a mutual `entangledWith` edge.
 * Its `href`-missing-a-leading-slash half belongs to the discarded
 * `jt-href-slash` row and is NOT repaired here.
 *
 * ## The outer layer is the one that goes
 *
 * The inner anchor is the citation; the outer adds nothing but a
 * second layer around it and, in most cases, one trailing punctuation
 * mark. Dropping the outer keeps the mark as document text where a
 * reader already sees it, and the inner anchor's target is untouched,
 * so no `link-target.ts` case is engaged: every target in the output
 * is a target the input held, unmoved.
 *
 * ## Re-derive after every edit
 *
 * Anchors NEST in this corpus — 477 pairs in `definition`, 757 in
 * `language_reference` — so a token index taken before an edit is
 * stale after it. `unlinkMatching` was written against the opposite
 * (false) claim and carried a real bug for it. The loop below
 * re-tokenizes on each pass and stops when a pass finds nothing.
 */
```

Structure to implement:

```ts
import { mapFields } from '../fields.ts';
import { anchors } from '../links.ts';
import { serialize, tokenize } from '../html.ts';
import type { Rule, TransformRecord } from '../types.ts';
import type { SourceEntry } from '../../body/types.ts';

type Which = 'dataRef' | 'href';

/** The outermost same-`key` nested pair in `html`, or undefined. */
function firstDuplicatePair(html: string, key: Which) {
	const tokens = tokenize(html);
	const found = anchors(tokens);
	for (const outer of found) {
		if (outer.close === -1 || outer.malformed || outer.interior) continue;
		for (const inner of found) {
			if (inner === outer || inner.close === -1) continue;
			if (inner.open <= outer.open || inner.close >= outer.close) continue;
			if (inner.malformed || inner.interior) continue;
			if (inner[key] !== outer[key] || inner[key] === '') continue;
			return { inner, outer, tokens };
		}
	}
	return undefined;
}

/** `html` with the outer layer's two tags deleted, everything else
 * byte-identical. */
function dropOuterLayer(html: string, key: Which): string | undefined {
	const hit = firstDuplicatePair(html, key);
	if (hit === undefined) return undefined;
	const kept = hit.tokens.filter((_, at) => at !== hit.outer.open && at !== hit.outer.close);
	return serialize(kept);
}

/** Repeat until a pass finds nothing — two pairs can share one field,
 * and every pass re-derives from the CURRENT text. */
function dropAll(html: string, key: Which): { html: string; n: number } {
	let out = html;
	let n = 0;
	for (;;) {
		const next = dropOuterLayer(out, key);
		if (next === undefined) return { html: out, n };
		out = next;
		n++;
	}
}
```

Each rule then walks only its own locus. `dupAnchorLanguageRef` edits `entry.language_reference` directly (it is one field, not a `mapFields` walk); `nestedAnchorDuplicate` walks `content.senses` recursively — **including `sense.senses`**, per the global constraint — and rebuilds the entry immutably. Both emit one `TransformRecord` per pair removed, with `detail` naming the shared target.

- [ ] **Step 4: Run the fixture tests**

Run: `bun test admin/pipeline/transform/rules/nested-anchor.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Add the corpus tier — counts and the trapped-mark census**

```ts
// same file, appended
import { readSourceEntries } from '../../body/source.ts';

describe('corpus tier', () => {
	test('both rows reproduce, and no trapped text is lost', async () => {
		let langOcc = 0, defOcc = 0;
		const langEnt = new Set<string>(), defEnt = new Set<string>();
		const trapped = new Map<string, number>();
		for await (const entry of readSourceEntries()) {
			const a = dupAnchorLanguageRef.apply(entry);
			if (a.records.length > 0) { langOcc += a.records.length; langEnt.add(entry.rid); }
			const b = nestedAnchorDuplicate.apply(entry);
			if (b.records.length > 0) { defOcc += b.records.length; defEnt.add(entry.rid); }
			for (const r of b.records) trapped.set(r.detail, (trapped.get(r.detail) ?? 0) + 1);
		}
		expect(langOcc).toBe(755);
		expect(langEnt.size).toBe(755);
		expect(defOcc).toBe(475);
		expect(defEnt.size).toBe(465);
	}, 120_000);
});
```

Set `TransformRecord.detail` on the definition rule to the trapped text so this census is readable directly from the records; expect `.` 387, `)` 68, `''` 20.

- [ ] **Step 6: Run the corpus tier**

Run: `bun test admin/pipeline/transform/rules/nested-anchor.test.ts`
Expected: PASS. A mismatch here is a **finding**, not a test to relax — record the measured figure and reconcile against the catalogue before proceeding.

- [ ] **Step 7: Commit**

```bash
bunx biome check .
git add admin/pipeline/transform/rules/nested-anchor.ts admin/pipeline/transform/rules/nested-anchor.test.ts
git commit -s -m "🦄 new(transform): drop duplicate anchor layers"
```

---

### Task 3: The paren-boundary rules

**Goal (PARTLY REFUSED — see STATUS; the halakha half was never written):** Re-split the Tosefta two-anchor citation so the `)` falls outside the variant anchor and the print halakha reaches the primary `data-ref` — one edit satisfying two catalogue rows — and move the stray opening paren out of `open-paren-in-anchor-display`'s 214 anchors.

**Files:**
- Create: `admin/pipeline/transform/rules/paren-boundary.ts`
- Create: `admin/pipeline/transform/rules/paren-boundary.test.ts`
- Read for reference: `admin/pipeline/transform/link-target.ts` (case 4, `recombined`), `admin/pipeline/transform/types.ts:24` (`TransformResult.recombined`)

**Acceptance Criteria:**
- [x] `toseftaCloseParen` reproduces **525 occurrences / 493 entries**; it is the ONLY registered rule id here. ~~and `toseftaPrimaryHalakha` the figure Task 1 pinned; both are registered rule ids over ONE shared predicate~~ **— REFUSED BY THE GATE, NEVER WRITTEN (STATUS).** walk, so `coverage()` sees two rows resolved.
- [ ] The primary's new `data-ref` is declared through `TransformResult.recombined` — `head` from the primary's own input target, `tail` from the variant's — and `link-target.ts` accepts it under case 4 with **no** loosening of the gate.
- [ ] `Tosefta Shabbat 16` + variant `Tosefta Shabbat 17:6` → primary `Tosefta Shabbat 16:6`, with no gap between the halves and no character from anywhere else.
- [ ] The primary anchor's `href` is recombined the same way or left unchanged — never left pointing at a locus its `data-ref` no longer names.
- [ ] `openParenInAnchorDisplay` reproduces **225 occurrences / 214 entries** and moves the `(` outside the anchor, changing no target at all.
- [ ] Corpus link accounting after these rules: **0 links lost**, and the count of anchors gaining a halakha reported explicitly.
- [ ] Neither rule sets `allows`.

**Verify:** `bun test admin/pipeline/transform/rules/paren-boundary.test.ts` → PASS; `bun transform:count` → three rows MATCH.

**Steps:**

- [ ] **Step 1: Write the failing fixture tests**

```ts
// admin/pipeline/transform/rules/paren-boundary.test.ts
import { describe, expect, test } from 'bun:test';
import { openParenInAnchorDisplay, toseftaCloseParen, toseftaPrimaryHalakha } from './paren-boundary.ts';
import type { SourceEntry } from '../../body/types.ts';

const PRIMARY = '<a class="refLink" href="/Tosefta_Shabbat.16" data-ref="Tosefta Shabbat 16">';
const VARIANT = '<a class="refLink" href="/Tosefta_Shabbat.17.6" data-ref="Tosefta Shabbat 17:6">';
const SPLIT = `${PRIMARY}Tosef. Sabb. XVI</a> (${VARIANT}XVII), 6</a>`;

const def = (html: string): SourceEntry => ({
	content: { senses: [{ definition: html }] }, headword: 'h', rid: 'A00196',
});

describe('toseftaCloseParen', () => {
	test('moves the ")" outside the variant anchor', () => {
		const out = toseftaCloseParen.apply(def(SPLIT));
		expect(out.entry.content.senses[0]?.definition).toBe(
			`${PRIMARY}Tosef. Sabb. XVI</a> (${VARIANT}XVII</a>), 6`,
		);
		expect(out.records).toHaveLength(1);
	});

	test('leaves a plain Tosefta anchor with no parenthetical alone', () => {
		const plain = def(`${PRIMARY}Tosef. Sabb. XVI, 6</a>`);
		expect(toseftaCloseParen.apply(plain).entry).toBe(plain);
	});
});

describe('toseftaPrimaryHalakha', () => {
	test('carries the halakha to the primary and declares the recombine', () => {
		const out = toseftaPrimaryHalakha.apply(def(SPLIT));
		expect(out.entry.content.senses[0]?.definition).toContain('data-ref="Tosefta Shabbat 16:6"');
		expect(out.recombined).toEqual([
			{ head: 'Tosefta Shabbat 16', tail: ':6', target: 'Tosefta Shabbat 16:6' },
		]);
	});

	test('leaves a primary that already carries a halakha alone', () => {
		const already = PRIMARY.replace('Shabbat 16"', 'Shabbat 16:2"');
		const input = def(`${already}Tosef. Sabb. XVI, 2</a> (${VARIANT}XVII), 6</a>`);
		expect(toseftaPrimaryHalakha.apply(input).records).toEqual([]);
	});
});

describe('openParenInAnchorDisplay', () => {
	test('moves the opening paren outside, touching no target', () => {
		const A = '<a dir="rtl" class="refLink" href="/Jastrow,_ס.1" data-ref="Jastrow, ס 1">';
		const out = openParenInAnchorDisplay.apply(def(`${A}(ס</a>)`));
		expect(out.entry.content.senses[0]?.definition).toBe(`(${A}ס</a>)`);
		expect(out.recombined).toBeUndefined();
	});

	test('leaves an anchor whose paren closes inside alone', () => {
		const A = '<a class="refLink" href="/x.1" data-ref="x 1">';
		const balanced = def(`${A}(both here)</a>`);
		expect(openParenInAnchorDisplay.apply(balanced).entry).toBe(balanced);
	});
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun test admin/pipeline/transform/rules/paren-boundary.test.ts`
Expected: FAIL — `Cannot find module './paren-boundary.ts'`

- [ ] **Step 3: Read case 4's only current user before writing the rule**

`TransformResult.recombined` is `readonly { head: string; tail: string; target: string }[]` (`admin/pipeline/transform/types.ts:136`) — `head` is the prefix taken from one input target, `tail` the suffix from another. `ib-targum-work-loss` is case 4's only user today; read it, because it is the only worked example of how the gate matches a claim to an anchor.

```bash
grep -rn "recombined" admin/pipeline/transform/rules/ admin/pipeline/transform/link-target.ts | head
```

Case 4 requires **no gap between the halves** and **no character from anywhere else**. `Tosefta Shabbat 16` (head, the primary's own input target) + `:6` (tail, the suffix of the variant's `Tosefta Shabbat 17:6`) concatenates to exactly `Tosefta Shabbat 16:6`. Verify that reading against the gate's code rather than against this paragraph.

- [ ] **Step 4: Implement `paren-boundary.ts`**

Key points for the implementer:

- **One walk, two rules.** A private `toseftaSplits(html)` returns every `{ primary, variant }` pair — the variant being an anchor whose stripped display matches `/^[IVXLC]+\),\s*\d+$/` and the primary being the anchor immediately preceding it in document order (the selection Task 1 pinned). `toseftaCloseParen` consumes it to move the `)`; `toseftaPrimaryHalakha` consumes it to rewrite the primary's target. Two exported `Rule`s so two catalogue rows resolve, one predicate so they cannot disagree about the population.
- **They are entangled and must be adjacent** in the registry (Task 7), and Task 0's gate will confirm they do not commute — which is expected and declared.
- **The halakha is `:N` taken off the variant's own `data-ref`**, not parsed from the display. Parsing `, 6` out of display text and minting `:6` would be inference; taking the suffix of an address the input already holds is case 4.
- **Refuse rather than guess.** If the variant's `data-ref` has no `:`, if the primary's already does, or if either anchor fails `assertUsable`, the pair is skipped and no record is emitted.
- The 4 Mishnah primaries among the 521 Tosefta ones are the same shape; do not special-case on work name.

- [ ] **Step 5: Run the fixture tests**

Run: `bun test admin/pipeline/transform/rules/paren-boundary.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 6: Add the corpus tier, including link accounting**

```ts
describe('corpus tier', () => {
	test('all three rows reproduce and no link is lost', async () => {
		let closeOcc = 0, halakhaOcc = 0, parenOcc = 0, gained = 0;
		const closeEnt = new Set<string>(), halakhaEnt = new Set<string>(), parenEnt = new Set<string>();
		for await (const entry of readSourceEntries()) {
			const c = toseftaCloseParen.apply(entry);
			if (c.records.length > 0) { closeOcc += c.records.length; closeEnt.add(entry.rid); }
			const h = toseftaPrimaryHalakha.apply(entry);
			if (h.records.length > 0) { halakhaOcc += h.records.length; halakhaEnt.add(entry.rid); gained += h.records.length; }
			const p = openParenInAnchorDisplay.apply(entry);
			if (p.records.length > 0) { parenOcc += p.records.length; parenEnt.add(entry.rid); }
			// no rule here may change how many anchors an entry has
			for (const r of [c, h, p]) {
				expect(anchors(tokenize(JSON.stringify(r.entry))).length)
					.toBe(anchors(tokenize(JSON.stringify(entry))).length);
			}
		}
		expect(closeOcc).toBe(525);
		expect(closeEnt.size).toBe(493);
		expect(parenOcc).toBe(225);
		expect(parenEnt.size).toBe(214);
		console.log('primaries gaining a halakha:', gained, 'across', halakhaEnt.size, 'entries');
	}, 180_000);
});
```

Replace the `halakhaEnt` expectation with the figure Task 1 pinned. The anchor-count invariant is crude on purpose: these three rules move bytes across tag boundaries and must never add or drop an anchor.

- [ ] **Step 7: Commit**

```bash
bunx biome check .
git add admin/pipeline/transform/rules/paren-boundary.ts admin/pipeline/transform/rules/paren-boundary.test.ts
git commit -s -m "🦄 new(transform): re-split tosefta and paren seams"
```

---

### Task 4: The stranded tails

**Goal:** Pull the two kinds of stranded citation tail back inside their anchor — the sub-section superscript (`</a><sup>N</sup>`, 160 entries) and the truncated trailing digit (`<a>… 2</a>8`, 14 entries) — without touching either anchor's target.

**Files:**
- Create: `admin/pipeline/transform/rules/stranded-tail.ts`
- Create: `admin/pipeline/transform/rules/stranded-tail.test.ts`

**Acceptance Criteria:**
- [ ] `superscriptInsideAnchor` reproduces **182 occurrences / 160 entries** and is confined to letters T, U and V — asserted, not assumed, since the confinement is a corpus claim the row makes.
- [ ] `truncatedCitationDigit` reproduces **14 occurrences / 14 entries** and its rids are exactly the fourteen the corpus scan names.
- [ ] **Neither rule writes a `data-ref` or an `href`.** The superscript row's target disagreement (spec §4.2) and the truncated row's under-resolving target are Task 6's business; these two rules move markup only.
- [ ] Both rules pass `checkMarkup` with a non-positive well-formedness delta — moving a `<sup>` pair inside an `<a>` is the exact shape a naive splice breaks.
- [ ] Neither rule sets `allows`.

**Verify:** `bun test admin/pipeline/transform/rules/stranded-tail.test.ts` → PASS; `bun transform:count` → both rows MATCH.

**Steps:**

- [ ] **Step 1: Write the failing fixture tests**

```ts
// admin/pipeline/transform/rules/stranded-tail.test.ts
import { describe, expect, test } from 'bun:test';
import { superscriptInsideAnchor, truncatedCitationDigit } from './stranded-tail.ts';
import type { SourceEntry } from '../../body/types.ts';

const def = (html: string, rid = 'T00914'): SourceEntry => ({
	content: { senses: [{ definition: html }] }, headword: 'h', rid,
});
const M = '<a class="refLink" href="/Midrash_Rabbah.7" data-ref="Midrash Rabbah 7">';

describe('superscriptInsideAnchor', () => {
	test('moves the superscript inside, target untouched', () => {
		const out = superscriptInsideAnchor.apply(def(`${M}Gen. R. s. 7</a><sup>7</sup>`));
		expect(out.entry.content.senses[0]?.definition).toBe(`${M}Gen. R. s. 7<sup>7</sup></a>`);
		expect(out.entry.content.senses[0]?.definition).toContain('data-ref="Midrash Rabbah 7"');
	});

	test('leaves a superscript already inside alone', () => {
		const inside = def(`${M}Gen. R. s. 7<sup>7</sup></a>`);
		expect(superscriptInsideAnchor.apply(inside).entry).toBe(inside);
	});

	test('leaves a superscript not adjacent to a close tag alone', () => {
		const apart = def(`${M}Gen. R. s. 7</a> and <sup>7</sup>`);
		expect(superscriptInsideAnchor.apply(apart).entry).toBe(apart);
	});
});

describe('truncatedCitationDigit', () => {
	const B = '<a class="refLink" href="/Bava_Kamma.11a" data-ref="Bava Kamma 11a">';

	test('extends the anchor over the stranded digit', () => {
		const out = truncatedCitationDigit.apply(def(`ib. ${B}B. Kam. XI, 2</a>8`, 'H00054'));
		expect(out.entry.content.senses[0]?.definition).toBe(`ib. ${B}B. Kam. XI, 28</a>`);
	});

	test('does not change the data-ref, which still reads the truncation', () => {
		const out = truncatedCitationDigit.apply(def(`ib. ${B}B. Kam. XI, 2</a>8`, 'H00054'));
		expect(out.entry.content.senses[0]?.definition).toContain('data-ref="Bava Kamma 11a"');
	});

	test('leaves a digit separated from the close tag alone', () => {
		const apart = def(`${B}B. Kam. XI, 2</a> 8`, 'H00054');
		expect(truncatedCitationDigit.apply(apart).entry).toBe(apart);
	});
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun test admin/pipeline/transform/rules/stranded-tail.test.ts`
Expected: FAIL — `Cannot find module './stranded-tail.ts'`

- [ ] **Step 3: Implement `stranded-tail.ts`**

Both rules are the same move — take a token run that sits immediately after an anchor's `</a>` and re-insert it before that `</a>` — differing only in what run qualifies:

- `superscriptInsideAnchor`: the three tokens `<sup>`, one text token, `</sup>`, immediately following the close tag with no intervening token.
- `truncatedCitationDigit`: the leading digits of the text token immediately following the close tag, when the anchor's own display ends in a digit. Split the text token; leave any remainder outside.

Both must refuse an anchor failing `assertUsable`, and both operate on the token stream (`tokenize`/`serialize`) rather than on regex over raw HTML, so an attribute containing `</a>` cannot be mistaken for a close tag.

Document in the module header that `truncatedCitationDigit` leaves the `data-ref` reading the truncated number, and why: the correct address is a Sefaria lookup, which is inference, and the display is the half print actually supplies.

- [ ] **Step 4: Run the fixture tests**

Run: `bun test admin/pipeline/transform/rules/stranded-tail.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Add the corpus tier, asserting the letter confinement**

```ts
describe('corpus tier', () => {
	test('both rows reproduce; the superscript row is T/U/V only', async () => {
		let supOcc = 0, digOcc = 0;
		const supEnt = new Set<string>(), digEnt = new Set<string>();
		for await (const entry of readSourceEntries()) {
			const s = superscriptInsideAnchor.apply(entry);
			if (s.records.length > 0) { supOcc += s.records.length; supEnt.add(entry.rid); }
			const d = truncatedCitationDigit.apply(entry);
			if (d.records.length > 0) { digOcc += d.records.length; digEnt.add(entry.rid); }
		}
		expect(supOcc).toBe(182);
		expect(supEnt.size).toBe(160);
		expect([...new Set([...supEnt].map((r) => r[0]))].sort()).toEqual(['T', 'U', 'V']);
		expect(digOcc).toBe(14);
		expect(digEnt.size).toBe(14);
	}, 120_000);
});
```

- [ ] **Step 6: Commit**

```bash
bunx biome check .
git add admin/pipeline/transform/rules/stranded-tail.ts admin/pipeline/transform/rules/stranded-tail.test.ts
git commit -s -m "🦄 new(transform): pull stranded citation tails in"
```

---

### Task 5: The unterminated href

**Goal (WRITTEN AND TESTED, DELIBERATELY UNREGISTERED — see STATUS):** Repair the two anchors whose unclosed `href` quote swallowed the following `</a>` — `D00478` and `J00597` — restoring the cross-reference the parser cannot currently see.

**Files:**
- Create: `admin/pipeline/transform/rules/malformed-href.ts`
- Create: `admin/pipeline/transform/rules/malformed-href.test.ts`
- Read for reference: `admin/pipeline/transform/links.ts` (`attributeInterior`, the `interior` flag and the `J00597` fixture), `admin/pipeline/body/cite.test.ts:11` (the same J00597 fragment)

**Acceptance Criteria:**
- [ ] Fires on exactly two entries corpus-wide: `D00478` and `J00597`.
- [ ] The repaired `href` value ends where the quote should have closed, and the swallowed `</a>` is restored as markup.
- [ ] In `J00597`, where a second anchor's OPENING tag was absorbed too, that tag is restored as well — the entry's anchor count rises by one and every restored anchor parses `malformed: false`, `interior: false`.
- [ ] The repair is licensed by an explicit `link-target.ts` case; if none of the five fits, the rule declares nothing and the gate must still pass because every target in the output is a substring the input held — **prove this, do not assume it**.
- [ ] `no-new-text` passes with no `allows`: the repair deletes nothing and adds no codepoint, it only re-reads existing bytes as markup.
- [ ] `admin/pipeline/body/cite.test.ts`'s J00597 expectations still pass, or are updated with a note saying why the fragment now parses differently.

**Verify:** `bun test admin/pipeline/transform/rules/malformed-href.test.ts admin/pipeline/body/cite.test.ts` → PASS.

**Steps:**

- [ ] **Step 1: Re-read the two damaged regions in the snapshot**

Both live in a sense `definition`. The fragments below are verbatim from the pinned snapshot; re-print them before editing, because a fixture retyped by hand is a fixture that tests nothing.

```bash
bun -e '
import {readSourceEntries} from "./admin/pipeline/body/source.ts";
import {fieldsOf} from "./admin/pipeline/transform/no-new-text.ts";
for await (const e of readSourceEntries()) {
  if (e.rid!=="D00478" && e.rid!=="J00597") continue;
  for (const f of fieldsOf(e)) if (/<a\b[^>]*href="[^"]*<\/a>/.test(f)) console.log(e.rid+"\n"+JSON.stringify(f)+"\n");
}'
```

**D00478** — the damaged region, with the sound anchors either side:

```
<a class="refLink" href="/Mekhilta_d'Rabbi_Yishmael.1" data-ref="Mekhilta d'Rabbi Yishmael 1">Mekh. I. c., v. <a dir="rtl" class="refLink" href="/Jastrow,_כָּלוּל.1</a>" data-ref="Jastrow, כָּלוּל 1">כָּלוּל</a>.
```

The Mekhilta anchor never closes. The `</a>` that should have closed it sits inside the next anchor's `href`, between `.1` and the quote — so the parser reads `href` as `/Jastrow,_כָּלוּל.1</a>` and the Mekhilta anchor swallows everything after it. The repair the bytes support: close the Mekhilta anchor where its `</a>` was taken from, and let the Jastrow `href` end at `.1`.

**J00597** — the same defect plus an absorbed opening tag:

```
(cmp. <a dir="rtl" class="refLink" href="/Jastrow,_דִּלְדֵּל.1</a><a class="refLink" href="/Bava_Metzia.38b" data-ref="Bava Metzia 38b">B. Mets. 38ᵇ</a> …
```

Here the unterminated `href` absorbed a `</a>` **and** the whole of the following `<a class="refLink" href="/Bava_Metzia.38b" …>` opening tag.

**The repair has a witness in the same field.** The correct form of the damaged Jastrow anchor occurs intact later in the very same definition:

```
(cmp. <a dir="rtl" class="refLink" href="/Jastrow,_דִּלְדֵּל.1" data-ref="Jastrow, דִּלְדֵּל 1">דִּלְדִּל</a>).
```

Use it — the target is present in this entry's own input, which is exactly what `link-target.ts` case 1/2 asks for, and it settles the `data-ref` the damaged tag lost.

**Do NOT try to fix J00597's duplicated run.** That definition also repeats `היוֹרֵד לנ׳ שבוים he who takes possession of the property of captives … Tosef. Keth. VIII, 2, sq.; a. fr.` almost verbatim. That is `adjacent-verbatim-repetition` / `duplicated-definition-opening-run`, both **declined from batch 4** by the scope ruling of 2026-08-26. This rule repairs markup, and stops there.

- [ ] **Step 2: Write the failing fixture tests from the real bytes**

```ts
// admin/pipeline/transform/rules/malformed-href.test.ts
import { describe, expect, test } from 'bun:test';
import { unterminatedHref } from './malformed-href.ts';
import { anchors } from '../links.ts';
import { tokenize } from '../html.ts';
import type { SourceEntry } from '../../body/types.ts';

const def = (html: string, rid: string): SourceEntry => ({
	content: { senses: [{ definition: html }] }, headword: 'h', rid,
});
const out = (e: SourceEntry): string =>
	unterminatedHref.apply(e).entry.content.senses[0]?.definition ?? '';
const usable = (html: string) =>
	anchors(tokenize(html)).every((a) => !a.malformed && !a.interior && a.close !== -1);

// Verbatim from D00478 (data/source/jastrow-dictionary.jsonl).
const D_BAD =
	`<a class="refLink" href="/Mekhilta_d'Rabbi_Yishmael.1" data-ref="Mekhilta d'Rabbi Yishmael 1">Mekh. I. c., v. ` +
	`<a dir="rtl" class="refLink" href="/Jastrow,_כָּלוּל.1</a>" data-ref="Jastrow, כָּלוּל 1">כָּלוּל</a>.`;

// Verbatim from J00597.
const J_BAD =
	`(cmp. <a dir="rtl" class="refLink" href="/Jastrow,_דִּלְדֵּל.1</a>` +
	`<a class="refLink" href="/Bava_Metzia.38b" data-ref="Bava Metzia 38b">B. Mets. 38ᵇ</a> tail` +
	` (cmp. <a dir="rtl" class="refLink" href="/Jastrow,_דִּלְדֵּל.1" data-ref="Jastrow, דִּלְדֵּל 1">דִּלְדִּל</a>).`;

describe('unterminatedHref', () => {
	test('D00478: no anchor is left malformed, interior or unclosed', () => {
		expect(usable(D_BAD)).toBe(false);          // the defect, before
		expect(usable(out(def(D_BAD, 'D00478')))).toBe(true);
	});

	test('D00478: no href still carries a close tag', () => {
		expect(anchors(tokenize(out(def(D_BAD, 'D00478')))).some((a) => a.href.includes('</a>')))
			.toBe(false);
	});

	test('D00478: both targets survive unchanged', () => {
		const refs = anchors(tokenize(out(def(D_BAD, 'D00478')))).map((a) => a.dataRef);
		expect(refs).toContain("Mekhilta d'Rabbi Yishmael 1");
		expect(refs).toContain('Jastrow, כָּלוּל 1');
	});

	test('J00597: the absorbed opening tag comes back, so anchor count rises', () => {
		const before = anchors(tokenize(J_BAD)).length;
		const after = anchors(tokenize(out(def(J_BAD, 'J00597')))).length;
		expect(after).toBe(before + 1);
		expect(usable(out(def(J_BAD, 'J00597')))).toBe(true);
	});

	test('J00597: the repaired anchor matches its intact twin in the same field', () => {
		const found = anchors(tokenize(out(def(J_BAD, 'J00597'))))
			.filter((a) => a.href.startsWith('/Jastrow,_'));
		expect(found).toHaveLength(2);
		expect(found[0]?.dataRef).toBe(found[1]?.dataRef);
	});

	test('leaves a sound anchor alone', () => {
		const sound = def('<a class="refLink" href="/x.1" data-ref="x 1">x</a>', 'A00001');
		expect(unterminatedHref.apply(sound).entry).toBe(sound);
	});
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `bun test admin/pipeline/transform/rules/malformed-href.test.ts`
Expected: FAIL — `Cannot find module './malformed-href.ts'`

- [ ] **Step 4: Implement `malformed-href.ts`**

The predicate is narrow by construction: an opening `<a>` tag whose `href` attribute value contains the literal `</a>`. The repair inserts the missing `"` at the point the value should have ended — which is where the real URL ends, immediately before the swallowed `</a>` — and lets the tokenizer re-read the remainder as markup.

Guard rails to state in the module header:

- **Two instances is the whole population.** The rule must be written so that a third instance appearing after a source re-fetch is repaired correctly rather than crashing, but the corpus test pins the population at exactly two so a widened predicate is caught.
- **`interior: true` anchors are unreachable to every other rule**, which is why this row must run BEFORE any rule that edits the anchors it frees. Registry placement in Task 7.

- [ ] **Step 5: Run the tests, then check the downstream fixture**

Run: `bun test admin/pipeline/transform/rules/malformed-href.test.ts admin/pipeline/body/cite.test.ts`
Expected: both PASS. If `cite.test.ts` fails, its J00597 fixture encodes the pre-repair parse; update it with a comment naming this rule as the reason the fragment now reads differently.

- [ ] **Step 6: Add the corpus tier pinning the population at two**

```ts
test('exactly two entries corpus-wide', async () => {
	const fired: string[] = [];
	for await (const entry of readSourceEntries()) {
		if (unterminatedHref.apply(entry).records.length > 0) fired.push(entry.rid);
	}
	expect(fired.sort()).toEqual(['D00478', 'J00597']);
}, 120_000);
```

- [ ] **Step 7: Commit**

```bash
bunx biome check .
git add admin/pipeline/transform/rules/malformed-href.ts admin/pipeline/transform/rules/malformed-href.test.ts admin/pipeline/body/cite.test.ts
git commit -s -m "🦠 fix(transform): repair unterminated href tags"
```

---

### Task 6: Audit the two rows that may not be transformable

**Goal:** Publish the audits spec §4 requires, and put the two rulings to Brian with the evidence in front of him — `post-anchor-numeral-duplication` (11) and the 38-instance target disagreement inside `superscript-subsection-stranded-outside-anchor` (160).

**Files:**
- Create: `data/patches/catalogue-audit/post-anchor-numeral-duplication.md`
- Create: `data/patches/catalogue-audit/superscript-subsection-stranded.md`
- Modify: `data/patches/patterns.jsonl:141` (`post-anchor-numeral-duplication`), `:29` (`superscript-subsection-stranded-outside-anchor`)

**Acceptance Criteria:**
- [ ] The `post-anchor-numeral-duplication` audit reproduces all four of the row's own claims and names the eleven rids: the ten `</a>` cases (`H00085`, `I00619`, `H01073`, `H01370`, `M02691`, `O01416`, `N00957`, `O00123`, `R00702`, `U01778`) and the one `</span>` case (`P01496`).
- [ ] It states the separator census it reproduces (`,` 56 / empty 16 / `.` 11 / `;` 2) and the reason no edit follows: the two candidate deletions render and link differently, and the audit that found the row proposed none.
- [x] The superscript audit measures the 38 contradicting occurrences directly and states whether Task 4's boundary repair is correct on both sides. (This criterion asserted the flag's 105 was a DIFFERENT population from this row's 182. It is not — they nest: 67 agree + 38 contradict + 77 no-sub = 182, all Midrash Rabbah. See spec §4.2's correction.)
- [ ] Both rulings are put to Brian with the recommendation stated and the alternative stated, not just the recommendation.
- [ ] Whichever way each ruling goes, `patterns.jsonl` records it as a committed diff with a `reason`, and `coverage()` follows automatically.

**Verify:**
```bash
bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
import {coverage} from "./admin/pipeline/transform/registry.ts";
console.log(coverage(await parsePatterns(await Bun.file("data/patches/patterns.jsonl").text())));'
```
→ `unaccounted: 0`, `duplicated: 0`.

**Steps:**

- [ ] **Step 1: Measure `post-anchor-numeral-duplication` and write the audit**

The measurement is in the spec and reproduces at 11 occ / 11 ent; re-run it and capture the output into the audit file rather than transcribing it. The audit must answer one question in its first paragraph: *which copy is the intruder?* — and its answer is that nobody has established one.

Record the open problem exactly as the row states it: all 11 duplicates are numeral `I` against a clean distribution of `II` 347 / `I` 279 / `III` 47 / `IV` 6, so the wrapper-copies-the-token hypothesis predicts `II` cases and there are none. `p ≈ 5e-5` under numeral-blind duplication.

- [ ] **Step 2: Measure the superscript row's 38 and write the audit**

The flag's 105 / 67 / 38 split was measured during the `midrash-subsection-link-drift` audit, on Midrash Rabbah anchors. This row's own measured population is 182 occ / 160 ent across T/U/V. **Those are different populations and the audit must say so.** Measure directly: of this row's 182 occurrences, how many have a `<sup>` value agreeing with the `data-ref`'s sub-section, and how many contradict it?

The load-bearing question for Task 4 is narrow: **is moving the `<sup>` inside the anchor correct regardless of which side of the disagreement wins?** Argue it explicitly. If yes, the boundary rule ships and the disagreement becomes a new catalogue row. If no, Task 4's superscript rule must be withdrawn and the whole row held.

- [ ] **Step 3: Put both rulings to Brian**

Use `AskUserQuestion`, one question per row, each carrying the recommendation first and the alternative second, with the counts and the consequence of each option stated in the description. Do not proceed past this step without answers — both change what ships.

- [ ] **Step 4: Write the rulings back to the catalogue surgically**

Same `python3` line-indexed pattern as Task 1 Step 2. For a withdrawal, set `route` to `judgment` and append a `reason` naming the audit file. **A withdrawn row must appear in neither `RULES` nor `PENDING`** — `registry.ts:525` states this and `coverage()` filters on it.

- [ ] **Step 5: Commit**

```bash
bunx biome check .
git add data/patches/catalogue-audit/ data/patches/patterns.jsonl
git commit -s -m "📖 doc(catalogue): audit batch 4's two judgment rows"
```

---

### Task 7: Register, prove the order, run the corpus, write the report

**Goal (DELIVERED AS SIX RULES / `PENDING` BY EIGHT — see STATUS):** Put the seven rules into the registry in an order the entanglement gate accepts, shrink `PENDING` by ten, prove the composed corpus still passes every gate, and write the batch report.

**Files:**
- Modify: `admin/pipeline/transform/registry.ts:46` (`RULES`), `:459` (`PENDING`)
- Create: `docs/v2/transform-batch-4.md`
- Modify: `docs/v2/phase-2-triage.md` (route totals and the batch-4 bullet)

**Acceptance Criteria:**
- [x] ~~All seven rules registered; `PENDING` loses all ten batch-4 row ids~~ — **SIX registered; `PENDING` loses eight**, keeping `tosefta-variant-chapter-halakha-loss` and `unterminated-href-swallows-closing-tag`, both still owed a REGISTERED rule (STATUS). A withdrawn row leaves both lists.
- [ ] `coverage()` reports **0 unaccounted, 0 duplicated**, and the registered count rises 27 → 34 minus any withdrawal.
- [ ] `checkAdjacency()` passes: the two Tosefta rules gap-free adjacent, and the nested/JT pair satisfied by the single rule that owns both rows.
- [ ] `unaccountedEdges()` passes — and if the JT row registers no rule of its own, the deferral is RECORDED, since that function fails the day a rule ships ahead of a still-`PENDING` partner.
- [ ] The commutation gate (inherited from PR #50) passes over all 34 rules, and any new non-commuting pair is DECLARED rather than reordered around. **A green gate is not coverage** — it closes two-rule exposure only, so state in the report which placements were argued from a whole-registry both-ways composition and which rest on the pair gate alone.
- [ ] `bun transform:count` → every batch-4 row MATCH.
- [ ] `bun body:migrate-dry` → 32,512/32,512, 0 schema failures, 0 quarantines.
- [ ] `admin/pipeline/body/pipeline-links.test.ts` passes — the composed `applyRepairs` + registry gate 3a added. **Every rule here edits anchors (six of six as shipped), so this is the run that matters.** Link accounting reported as a delta against the +90 / −0 the branch carries.
- [ ] The report states the batch's real population (2,122 distinct, not 2,513 catalogued) and why.

**Verify:**
```bash
bun test                                     # 862 + new, 0 fail
bun transform:count
bun body:migrate-dry
bunx biome check .                           # 116 infos, 0 errors
```

**Steps:**

- [ ] **Step 1: Register the rules, with the order argued in comments**

Ordering constraints, each of which belongs in a comment beside the rules it governs:

1. **`unterminatedHref` runs FIRST among batch-4 rules.** It frees anchors that every other rule refuses while they carry `interior: true`. A rule placed before it silently under-fires on `D00478` and `J00597`.
2. **`toseftaCloseParen` and `toseftaPrimaryHalakha` gap-free adjacent.** They are declared entangled, they do not commute, and Task 0's gate will say so.
3. **`nestedAnchorDuplicate` before `toseftaCloseParen`?** Measure it. Run the corpus both ways and compare bytes; if the orders agree, say so and pick on readability. If they disagree, the pair needs an `entangledWith` edge and the measurement goes in the comment. **Do not assert an order is free without running it** — the geresh pair's comment is the model.
4. `superscriptInsideAnchor` and `truncatedCitationDigit` touch anchor tails only; expect them to commute with everything. Confirm, don't assume.

- [ ] **Step 1b: If any existing rule's position moved, grep its id**

Registering seven rules may push existing rules to new positions. #50's reorder falsified four claims and three were found only by a deliberate sweep — one in a catalogue row nothing in the diff pointed at.

```bash
for id in <every rule id whose index changed>; do
  echo "== $id"; grep -n "$id" data/patches/patterns.jsonl admin/pipeline/transform/*.ts admin/pipeline/transform/rules/*.ts
done
```

Read every hit. Retract a falsified sentence in place — `CORRECTED <date> (<branch>): this read "..."` — never by appending a paragraph that leaves the old claim standing.

- [ ] **Step 2: Shrink `PENDING`**

Remove the ten batch-4 ids. For any row Task 6 withdrew, leave a comment in `PENDING`'s place naming the audit — the file already uses this convention for `homograph-numeral-mismatch` and `h-cognate-self-link`.

- [ ] **Step 3: Run the registry gates**

```bash
bun test admin/pipeline/transform/registry.test.ts admin/pipeline/transform/commutation.test.ts
```
Expected: PASS. A `checkAdjacency` failure means the order in Step 1 is wrong; an `unaccountedEdges` failure means a deferral is unrecorded.

- [ ] **Step 4: Run the counts and the composed corpus**

```bash
bun transform:count
bun body:migrate-dry
bun test admin/pipeline/body/pipeline-links.test.ts
```

Expected: every batch-4 row MATCH; 32,512/32,512, 0 schema failures, 0 quarantines; link accounting reported. **A drift between `transform:count` (rules alone) and `pipeline-links` (composed with `applyRepairs`) is the 3a finding repeating** — a repair and a transform owning one defect. Investigate before proceeding; do not adjust an expectation to make it green.

- [ ] **Step 5: Run the whole suite and the linter**

```bash
bun test
bunx biome check .
```
Expected: > 862 pass, 0 fail; 116 infos, 0 errors.

- [ ] **Step 6: Write `docs/v2/transform-batch-4.md`**

Model it on `docs/v2/transform-batch-3b.md`. It must carry:

- Scope as ruled and scope as shipped, with every count as MEASURED, not as catalogued.
- **The headline finding: the undeclared containment**, how the byte-span comparison found it before any rule was written, and the commutation gate that now makes the check general.
- The two corrected counts and the row whose own `reason` misreported its measurement.
- Every withdrawal from Task 6, with a link to its audit.
- Link accounting as a delta, measured on the pipeline.
- What the commutation gate still cannot see — the 46 `PENDING` rows — stated plainly rather than implied covered.

- [ ] **Step 7: Update `docs/v2/phase-2-triage.md`**

Recompute the route table with the committed query at the top of that file; never type a total in. Add the batch-4 bullet to the reclassification list.

- [ ] **Step 8: Commit**

```bash
bunx biome check .
git add admin/pipeline/transform/registry.ts docs/v2/transform-batch-4.md docs/v2/phase-2-triage.md
git commit -s -m "🦄 new(transform): register batch 4 anchor rules"
```

---

## Before the pull request

Run the full local review battery. **Cloud CodeRabbit is SKIPPED on this repository — local is the only review that runs**, so a skipped local pass means no review at all. Scope it to the whole diff against `v2`, not to the last commit.

```bash
git fetch --all --prune                       # session snapshots go stale
git diff --stat origin/v2...HEAD
bun test && bun qa:tsc && bun qa:lint
```

Then SonarQube — **it was missed before #50 and a MAJOR sat open behind a green check.** The binary is `sonar`, not `sonar-scanner` or `sonarqube-cli`, and it needs the sandbox override:

```bash
sonar list issues -p UniquePixels_jastrow --pull-request <N> --statuses OPEN,CONFIRMED
```

Without `--statuses` the `total` counts CLOSED issues and reads as a failure that is already fixed.

Then the local CodeRabbit pass, and a SonarQube review over the changed files. Expect **Workers Builds to fail** — `wrangler.jsonc:9` points `assets.directory` at `./app`, which arrives in Phase 4; #44–#49 all merged with it red. CodeRabbit posting `CHANGES_REQUESTED` and later clearing itself is normal here; wait or nudge with a `@coderabbitai review` comment rather than dismissing.

PR into `v2`, never `main`. Squash-merge with a concise rollup message.
