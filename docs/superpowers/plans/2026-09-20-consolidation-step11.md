# Consolidation Step 11 — Blocking-Class Triage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers-extended-cc:subagent-driven-development (recommended) or
> superpowers-extended-cc:executing-plans to implement this plan
> task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recount the 32 non-`transform` pattern classes still flagged
`blocking: true`, rule each one keep-blocking / defer / close, and record
the ruling in `patterns.jsonl`, the research backlog and the spec.

**Architecture:** The recount is evidence, not pipeline code — it runs
from a throwaway script whose predicates are written into the triage
document so any count can be taken again instead of trusted (R4: a
triage script is neither rule, patch nor review detector, so it is not
added to `admin/pipeline/`). The verdicts are drafted against
sweep-tiering T6 and ruled by the maintainer. Applying a ruling is a
data edit to `data/patches/patterns.jsonl` plus prose.

**Tech Stack:** Python 3 for the one-off recount (entry data is JSON on
disk); Bun/Biome/`tsc` for the quality gate; draw.io SVG for the flow
diagram carry-in.

**Spec:** [`docs/specs/2026-09-13-pipeline-consolidation-design.md`](../../specs/2026-09-13-pipeline-consolidation-design.md)
§11 step 11, against T6 of
[`docs/specs/2026-08-17-sweep-tiering-design.md`](../../specs/2026-08-17-sweep-tiering-design.md).

## Global Constraints

- **T6 is the test, and only T6:** "Blocking = breaks the render **or**
  would be baked in by the transform. Everything else defers to
  post-launch." A count is corroboration, never the criterion.
- **A recount is evidence only when the predicate is stated** and
  reproduces the class as described. Where a predicate needs a clause
  the class description does not carry, the count is *not* evidence and
  the class is marked `not reproduced` — not silently recounted.
  Threshold used: reproduced = |recount − catalogued| ÷ catalogued ≤ 0.25
  **and** the predicate adds no clause the description lacks.
- **Every zero carries a positive control.** A predicate that cannot
  fire reports a clean nothing (see the two controls in Task 1).
- **`blocking: false` is not the same as closed.** A class resolved by
  the body model or by a shipped rule gets `status: resolved` with the
  evidence; a class that is real but post-launch work gets
  `blocking: false` and stays `candidate`.
- **The 23 blocking `transform`-route classes are out of scope** (spec
  §11 step 11: each has a registered rule).
- **No detector ports in this step.** Porting judgment-class detectors
  is a §10 ad-hoc track, one class per PR. A class that cannot be
  recounted without its detector is ruled on T6 kind and says so.
- Commit format: `<emoji> <type>([scope]): <description>`, 50 char max,
  signed off (`git commit -s`). Branch `claude/consolidation-step11`.

**User decisions (already made):**
- "no sweep *escalation* blocks shipping" (maintainer, 2026-08-15) — the
  ruling step 11 exists to reconcile against these *class* flags.
- R10 binds at v2 publication, not during development (maintainer,
  2026-09-18) — the same shape of question as this step's: a constraint
  scoped to a future event must not bind before it.
- Step 10: code identifiers are not renamed (maintainer, 2026-09-19), so
  `migrate.ts`/`TruthEntry` spellings in this plan's paths are correct.

---

## File Structure

| File | Responsibility |
|---|---|
| `docs/v2/research-backlog.md` | the triage table replaces the bare class list in "Blocks the v2 cutover"; this is the classes' home and it is archived with the rest of the research |
| `data/patches/patterns.jsonl` | the ruling itself: `blocking` and `status` per class, with the recount and its predicate in `reason` |
| `docs/specs/2026-09-13-pipeline-consolidation-design.md` | §11 step 11 spelled out with outcomes; §12 changelog row; step 10's `#TBD` → `#100` |
| `docs/pipeline-flow.drawio.svg` | carry-in: drop the withdrawn CI "Rebuild" box, add the review-report / publication routing step 9 added |
| this plan | the recount predicates and their controls, as step 5's plan recorded its classifier |

---

### Task 1: Recount harness and its controls

**Goal:** A stated predicate per class, run over the 32,512 committed
entry files, with a positive control for every class that comes back
zero.

**Files:**
- Create: `$TMPDIR/step11/load.py`, `$TMPDIR/step11/recount.py`
  (throwaway; the predicates are transcribed into the triage document)
- Read: `data/entries/*/*.json`, `data/patches/patterns.jsonl`

**Acceptance Criteria:**
- [ ] 32,512 entries loaded; `senses[]`, nested `senses[].senses[]` and
      `stems[].senses[]` all walked (the body model puts sense text in
      all three).
- [ ] Every predicate is one stated sentence; a class with no honest
      predicate reports `None`, never 0.
- [ ] Each zero has a control proving the predicate can fire.
- [ ] Counts recorded per class alongside the catalogued figure.

**Verify:** `python3 $TMPDIR/step11/recount.py` → a row per class; the
two zeros (`stem-head-in-child-sense`,
`sense-number-outside-closed-grammar`) each accompanied by its control
output.

**Steps:**

- [ ] **Step 1: Loader over the committed entry tree**

```python
import json, os, re, glob
ROOT='data/entries'
TAG=re.compile(r'<[^>]+>')
def strip(s): return TAG.sub('', s or '')
def walk(senses):
    for s in senses or []:
        yield s
        yield from walk(s.get('senses'))
def all_senses(e):
    yield from walk(e.get('senses'))
    for st in e.get('stems') or []:
        yield from walk(st.get('senses'))
def sense_text(s):
    return (s.get('gloss') or '') + ''.join(s.get('units') or [])
def entry_text(e):
    return ''.join(sense_text(s) for s in all_senses(e))
def load():
    for p in sorted(glob.glob(os.path.join(ROOT,'*','*.json'))):
        with open(p) as f: yield json.load(f)
```

- [ ] **Step 2: Run the controls before believing any zero**

```python
# CONTROL A -- stem-head-in-child-sense returns 0. Can the walk see
# child senses at all, and does the binyan vocabulary ever match?
print('child senses walked =', nchild, 'in', nentries_with_child, 'entries')
print('glosses (any depth) opening with a binyan name =', top)
# CONTROL B -- sense-number-outside-closed-grammar returns 0.
print('named rids present =', sorted(e['id'] for e in es if e['id'] in named))
print('entries carrying a starred *N) marker anywhere =', len(star))
```

Expected (measured 2026-09-20): control A → 510 child senses in 204
entries, 21 binyan-opening glosses, all at top level; control B → all
six named rids present, only 3 entries anywhere carry `*N)` and none of
them is one of the six, 0 senses labelled `*…`.

- [ ] **Step 3: Record the run in the triage document, not in the repo as code**

The script is deliberately not committed. Its predicates travel as prose
in `docs/v2/research-backlog.md` so the count is re-derivable.

---

### Task 2: Classify each recount as evidence or not

**Goal:** Sort the 32 into `reproduced`, `not reproduced`, `no
predicate`, `resolved (with control)` — so a verdict never rests on a
count that measured something other than the class.

**Files:**
- Modify: `docs/v2/research-backlog.md` ("Blocks the v2 cutover" section)

**Acceptance Criteria:**
- [ ] Every one of the 32 carries exactly one classification.
- [ ] Every `reproduced` row shows catalogued, recount and the predicate.
- [ ] Every `not reproduced` row says which clause the predicate added or
      dropped, so the next person knows what to fix.
- [ ] Two classes whose stated `reason` is stale against the v2 entry
      schema are named as such (see Step 2 below).

**Verify:** `grep -c '^| ' docs/v2/research-backlog.md` rises by 32 rows;
every row's classification is one of the four words.

**Steps:**

- [ ] **Step 1: Apply the threshold from Global Constraints**

Reproduced (predicate follows the description, Δ ≤ 25%):
`empty-stem-section` 342→342, `stranded-open-bracket` 85→85,
`superscript-subsection-contradicts-link-sub-section` 33→33,
`truncated-read-stub` 26→26, `open-paren-in-rtl-span` 89→88,
`common-gender-inexpressible` 228→229, `homograph-roman-stranded-in-definition`
23→22, `lost-h-equivalent` 32→36, `unmatched-opening-paren` 452→409,
`self-numbered-intext-marker` 35→26, `dangling-denom-tail` 17→10,
`lost-hebrew-after-h-marker` 13→9.

- [ ] **Step 2: Name the two stale reasons**

`common-gender-inexpressible`'s reason reads "content.morphology has a
closed 9-value vocabulary that never contains it". The v2 entry schema's
`grammar.gender` enum is `["m","f","c"]` — it *does* contain it. The
field is expressible and simply unused: 12,557 entries carry a gender,
0 carry `c`. The class is a backfill, not an impossibility.

`stem-head-in-child-sense` and `stem-label-not-a-binyan-name` describe
`grammar.binyan_form` / `grammar.verbal_stem`. The v2 schema has no such
fields: `grammar` holds only `gender`, `number`, `pos`, and stems live in
`stems[]` with `stem` / `forms` / `senses`. Both were catalogued against
the source shape.

- [ ] **Step 3: Commit**

```bash
git add docs/v2/research-backlog.md
git commit -s -m "📖 doc(v2): recount the blocking classes"
```

---

### Task 3: Draft the T6 verdicts and take the ruling

**Goal:** One drafted verdict per class with its T6 limb named, put to
the maintainer, and the ruling recorded verbatim.

**Files:**
- Modify: `docs/v2/research-backlog.md`

**Acceptance Criteria:**
- [ ] Each draft names which T6 limb it turns on (render, bake-in, or
      neither) in one sentence.
- [ ] The four-outcome vocabulary is put to the maintainer explicitly:
      step 11 as written offers keep-blocking or defer, and the recount
      found two classes that are neither (resolved) and several that
      cannot be measured without a §10 detector port.
- [ ] The ruling is recorded as the maintainer's words, dated, not
      paraphrased into the table.

**Verify:** the ruling appears in `research-backlog.md` under a dated
heading; every one of the 32 rows carries a verdict consistent with it.

**Steps:**

- [ ] **Step 1: Draft, grouped by the limb each turns on**

Render-visible **and** structural (recommend keep): `empty-stem-section`
(342 empty binyan headings), `open-paren-in-rtl-span` (88, bidi),
`stranded-open-bracket` (85, the bracket's sense scope is lost),
`superscript-subsection-contradicts-link-sub-section` (33, the link
lands on the wrong sub-section).

Identity-bearing, so baked into slugs and URLs (recommend keep):
`homograph-roman-stranded-in-definition` (22),
`unnumbered-terminal-homograph` (129, not measured).

Text loss, per-entry, no structural bake-in (recommend defer):
`common-gender-inexpressible` (229), `lost-h-equivalent` (36),
`lost-hebrew-after-h-marker` (9), `dangling-denom-tail` (10),
`truncated-read-stub` (26), `doubled-space-as-text-loss-locator` (a
locator, not a defect).

Resolved with a live control (recommend close):
`stem-head-in-child-sense` 100→0, `sense-number-outside-closed-grammar`
6→0.

Not measurable without the detector (recommend defer, and say why):
the remaining classes, `citation-tail-truncation` foremost — its
catalogued 657 against a predicate reporting ~9,000 means "ends at a
citation" is the normal shape in Jastrow and the class turns on a
truncation judgment this script cannot make.

- [ ] **Step 2: Put the framework question to the maintainer**

Use `AskUserQuestion`. One question, carrying the facts: step 11 offers
two outcomes, the recount produced four, and the two extra ones change
what lands in `patterns.jsonl`.

- [ ] **Step 3: Record the ruling and commit**

```bash
git add docs/v2/research-backlog.md
git commit -s -m "📖 doc(v2): rule the blocking classes"
```

---

### Task 4: Apply the ruling to the catalogue

**Goal:** `patterns.jsonl` carries the ruling, so the count that
generated the backlog section agrees with the document.

**Files:**
- Modify: `data/patches/patterns.jsonl`

**Acceptance Criteria:**
- [ ] Each ruled class's `blocking` matches its verdict.
- [ ] A closed class carries `status: resolved` and its control in
      `reason`, dated 2026-09-20.
- [ ] A deferred class keeps `status: candidate` with `blocking: false`.
- [ ] The file stays one JSON object per line, 155 lines, and every line
      still parses.

**Verify:**

```bash
python3 -c "
import json
rows=[json.loads(l) for l in open('data/patches/patterns.jsonl')]
b=[r for r in rows if r.get('blocking') and r.get('route')!='transform']
print(len(rows),'rows;',len(b),'blocking non-transform')"
```
→ `155 rows; <N> blocking non-transform`, N matching the ruling.

**Steps:**

- [ ] **Step 1: Edit in place, one line per class, preserving key order**

```python
import json
path='data/patches/patterns.jsonl'
lines=[json.loads(l) for l in open(path)]
RULING={}  # id -> {'blocking':bool, 'status':str, 'note':str}
for r in lines:
    if r['id'] in RULING:
        r.update({k:v for k,v in RULING[r['id']].items() if k!='note'})
        r['reason'] = r['reason'] + ' ' + RULING[r['id']]['note']
with open(path,'w') as f:
    for r in lines:
        f.write(json.dumps(r, ensure_ascii=False, sort_keys=True)+'\n')
```

- [ ] **Step 2: Confirm the backlog's generated section still agrees**

Re-derive the class list from the file and diff it against the table in
`research-backlog.md`. A class ruled non-blocking must have left the
list.

- [ ] **Step 3: Commit**

```bash
git add data/patches/patterns.jsonl
git commit -s -m "🌈 improve(patches): rule 32 blocking classes"
```

---

### Task 5: Spec amendment and the `#100` carry-in

**Goal:** §11 step 11 reads as shipped with its measured outcomes, §12
gains a changelog row, and step 10's `#TBD` becomes `#100`.

**Files:**
- Modify: `docs/specs/2026-09-13-pipeline-consolidation-design.md:701`
  (`#TBD` → `#100`), §11 step 11, §12

**Acceptance Criteria:**
- [ ] `grep -c '#TBD'` on the spec → 0.
- [ ] Step 11 names the recount, the controls, the four outcomes and the
      ruling, with the counts that moved.
- [ ] The changelog row is dated 2026-09-20 and says what was ruled.
- [ ] No struck ruling is restated as live anywhere the edit touches.

**Verify:** `grep -n '#TBD' docs/specs/2026-09-13-pipeline-consolidation-design.md`
→ no output.

**Steps:**

- [ ] **Step 1: Backfill the PR number**

```bash
sed -i '' 's/10\. \*Shipped (#TBD)\.\*/10. *Shipped (#100).*/' \
  docs/specs/2026-09-13-pipeline-consolidation-design.md
```

- [ ] **Step 2: Rewrite step 11 with outcomes, in the voice of steps 7–9**

- [ ] **Step 3: Commit**

```bash
git add docs/specs/2026-09-13-pipeline-consolidation-design.md
git commit -s -m "📖 doc(specs): step 11 outcomes and #100"
```

---

### Task 6: Flow-diagram carry-in

**Goal:** The diagram draws the pipeline as it is: no withdrawn CI
Rebuild job, and step 9's publication routing shown.

**Files:**
- Modify: `docs/pipeline-flow.drawio.svg`

**Acceptance Criteria:**
- [ ] The two lines `CI "Rebuild": migrate the committed snapshot,` and
      `format, diff against data/entries/ = 0.` are gone — R9 withdrew
      that job and step 5 removed it.
- [ ] The report box names `docs/v2/review-report.md` and the
      `blocks / defer / note` split (§3.1.1).
- [ ] The SVG still renders on GitHub and still opens in draw.io (the
      `content` attribute's embedded model is edited, not just the
      rendered text).
- [ ] No remaining label says "migrate" except where it names
      `migrate.ts` (§1.1 keeps code identifiers).

**Verify:**

```bash
grep -c 'Rebuild' docs/pipeline-flow.drawio.svg   # → 0
grep -c 'review-report' docs/pipeline-flow.drawio.svg  # → ≥1
```

**Steps:**

- [ ] **Step 1: Read the embedded draw.io model, not just the SVG text**

The file is a draw.io-exported SVG: the editable model lives in the
root element's `content` attribute (URL-encoded). Edit that and the
rendered `<text>` runs together, or draw.io and GitHub will disagree.

- [ ] **Step 2: Replace the Dry-run note's second half**

Old: `CI "Rebuild": migrate the committed snapshot, / format, diff
against data/entries/ = 0.`
New: `Report writes docs/v2/review-report.md; / rows split blocks /
defer / note (§3.1.1).`

- [ ] **Step 3: Commit**

```bash
git add docs/pipeline-flow.drawio.svg
git commit -s -m "📖 doc: redraw the flow without Rebuild"
```

---

### Task 7: Gate, review, PR

**Goal:** The branch ships green with the repo's own pre-PR battery run
first.

**Files:** none new.

**Acceptance Criteria:**
- [ ] `bun qa` green (format, `biome check --error-on-warnings`, unit
      tier, `tsc`).
- [ ] `bun run transform:invariants` **not** required — this step
      registers no rule and reorders no registry entry.
- [ ] Local review battery run over the whole diff before the PR opens
      (cloud CodeRabbit is skipped on this repo).
- [ ] PR body ends with the generated-with line.

**Verify:** `bun qa` → exits 0.

**Steps:**

- [ ] **Step 1: Gate**

```bash
bun qa
```

- [ ] **Step 2: Local review battery over the diff**

```bash
git diff v2...HEAD --stat
```

Then the local review skills on that diff, scoped to the whole change.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin claude/consolidation-step11
```

---

## Self-Review

**Spec coverage.** Step 11 asks three things: recount each class on
current entry data (Task 1–2), draft keep-blocking or defer against T6
(Task 3), maintainer rules (Task 3 Step 2). The two carry-ins the
project memory records — backfill `#100`, redraw the flow diagram — are
Tasks 5 and 6. §10's detector-port track is named as out of scope in the
Global Constraints rather than silently skipped.

**Placeholders.** `RULING={}` in Task 4 Step 1 is filled by Task 3's
ruling and cannot be pre-written without it; every other code block is
complete. Task 3's draft verdict list is the actual draft, not a
description of one.

**Type consistency.** `strip`, `all_senses`, `sense_text`, `entry_text`
are defined once in Task 1 Step 1 and used under those names throughout.
