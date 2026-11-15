# Annotation Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move an entry's annotations into one entry-level list that the text points to with `<annotate id>` tags and a sense `annotation` pointer, as ruling `11-15 annotation section` decides, and regenerate the entry data by import.

**Architecture:** A shared helper in `admin/lib/annotate.ts` owns the tag: how to write it, find its ids, and read past it. The entry contract (`admin/entry/`) checks the schema and the references, and nothing else. The patch record's `annotation` gains an optional `note`. The import places the tags, numbers the ids and checks what it writes. The 109 annotated entry files are rewritten by a fresh `data:import --write`, not by a script.

**Tech Stack:** Bun 1.4.3, TypeScript, TypeBox (`admin/entry/schema.ts`), Biome 2.5.15.

**Spec:** `docs/decisions.md` row `11-15 annotation section`. Background: `admin/entry/ANNOTATIONS.md` (rewritten in Task 6).

## Global Constraints

- Tag, byte for byte: `<annotate id="aN">…</annotate>`, where `N` matches `[1-9]\d*`. No other attributes, and never self-closing.
- Ids are local to an entry, `a1`…`aN`, contiguous, in this order: headword forms by index (a form's `text` before its `homograph`), then `senses` in document order (depth first, a sense before its children), then each stem's senses the same way. Within one object, draft order.
- An annotation item's keys, in this order: `id`, `kind`, `printed`, `note` (optional), `date`, `source` (optional). `field`, `stored` and `evidence` are gone from the entry.
- The entry's `annotations` key comes after `stems` (it is the last key). It is never `[]`: the key is absent when there are none.
- A sense's pointer is `annotation: "aN"`, placed where `annotations` sat today (after `label`). Forms carry no annotation key.
- `display` placement:
  - a form's `text`: `<annotate id="aN">{n}</annotate>`
  - a form's `homograph`: the numeral token after `{n}`, so `{0} <annotate id="aN">I</annotate>` (the space stays outside the tag)
- gloss and `units[n]`: the tag wraps the one occurrence of the translated `find` (the import already requires exactly one).
- `headwords[n].text` and `label` never carry a tag.
- Contract checks (ruling clause 3), and no others:
  - every id is referenced exactly once;
  - every reference names an annotation the entry holds;
  - every tag is well formed and closes;
  - `display` may carry `<annotate>` and no other markup.
- `note` is optional in the entry and in the patch `annotation` for now. A non-empty string when present.
- Every commit passes `bun qa` (gate the commit on its exit code). Commits are `git commit -s` in the repo's emoji format, 50-character subject.
- Registering, reclassifying or reordering a transform rule is out of scope. If a task finds it needs to, stop and ask.

**User decisions (already made):**
- "All in one PR" (2026-11-15): contract, patches, import and regenerated data together, so `v2` stays green.
- "annotations communicate to the user that a deviation from print was made and why. The patches contain the technical details of it."
- "I want to avoid a bunch of checking/comparing in the validate portion here."
- Validation runs forward only; there is no reverse provenance check on the committed tree, because admin-tool edits will run ahead of their patches.
- `illegible` stays an annotation.
- The six `kept` annotations stay as they are in this PR; reviewing them is a later question.
- `source` is optional in the entry (a hand edit has none until backport); the import always writes it.

## Review Focus

1. One form annotated on both `text` and `homograph`. Both tags sit in `display` side by side, with ids in text-then-homograph order. Owner: Task 4.
2. A `relabel` that writes one `label` annotation per changed child (P00790's P000812 writes three). Each child gets its own id and pointer, and the ids follow document order. Owner: Task 4.
3. A gloss annotation whose text sits inside a `<cite>`/`<he>` (C00147). The tag nests inside the cite, the contract's markup check accepts the nesting, and gate 3's tag-stripped text is unchanged. Owners: Tasks 1, 2 and 4.
4. A form annotation on an entry with no `display`. The import reports a problem naming the rid and patch; it never throws or drops the annotation silently. Owner: Task 4.
5. A `display` holding an `<annotate>` tag. Gate 2's notation count, the `display` rules (`headword-rules.ts`) and `loss.ts` read it exactly as they read the same display without the tag; the letters `annotate`/`id` are never counted as Latin notation. Owners: Tasks 2 and 4.

---

### Task 1: The annotate tag helper

**Goal:** One module that writes the tag, finds the ids it carries, and reads past it, shared by the contract, the `display` rules and the import.

**Files:**
- Create: `admin/lib/annotate.ts`
- Create: `admin/lib/__tests__/annotate.test.ts`
- Modify: `admin/lib/README.md` (one table row)

**Acceptance Criteria:**
- [ ] `annotateTag('a1', '{0}')` returns `<annotate id="a1">{0}</annotate>`.
- [ ] `annotateIds(s)` returns the ids of the opening tags in `s`, in order, and reads tags through `tokenize` (`admin/lib/html.ts`), not a second scanner.
- [ ] `withoutAnnotateTags(s)` removes every opening and closing annotate tag and nothing else.
- [ ] `ANNOTATE_OPEN` matches exactly `<annotate id="aN">`, with `N` as in Global Constraints.

**Verify:** `bun test admin/lib/__tests__/annotate.test.ts` → all pass; then `bun qa` → exit 0.

**Steps:**

- [ ] **Step 1: Write the failing tests** in `admin/lib/__tests__/annotate.test.ts`. Use one-line tuple tables (the Sonar duplication rule):
  - `annotateTag`: `('a1','{0}')` → `<annotate id="a1">{0}</annotate>`.
  - `annotateIds`:
    - `'{0} <annotate id="a2">I</annotate>, <annotate id="a3">{1}</annotate>'` → `['a2','a3']`
    - `'<cite ref="C00294"><annotate id="a1"><he>גּוּבְתָּא</he></annotate> I</cite>'` → `['a1']`
    - `'no tags'` → `[]`
  - `withoutAnnotateTags`: the first `annotateIds` input → `'{0} I, {1}'`; a string with `<cite>` and `<annotate>` keeps the `<cite>` bytes untouched.
  - `ANNOTATE_OPEN`: accepts `<annotate id="a12">`; refuses `<annotate id="a0">`, `<annotate id="b1">`, `<annotate id='a1'>`, and `<annotate id="a1" x="y">`.
- [ ] **Step 2: Run them, and expect failures** because the module is missing.
- [ ] **Step 3: Implement** in `admin/lib/annotate.ts`:
  - `const ANNOTATE_OPEN: RegExp`
  - `function annotateTag(id: string, inner: string): string`
  - `function annotateIds(text: string): string[]`
  - `function withoutAnnotateTags(text: string): string`
  - Exported. Imports only `./html.ts`. Module docstring cites ruling `11-15 annotation section`.
- [ ] **Step 4: Run the tests and `bun qa`;** both pass.
- [ ] **Step 5: Commit:** `🦄 new(lib): add the annotate tag helper`.

**Interfaces:** `ANNOTATE_OPEN`, `annotateTag`, `annotateIds`, `withoutAnnotateTags`, used by Tasks 2 and 4.

---

### Task 2: Entry contract: one list, references checked

**Goal:** The schema and validator hold the new shape. `annotations.ts` checks the references and nothing else.

**Files:**
- Modify: `admin/entry/schema.ts`
  - `AnnotationSchema`: keys `id` (pattern `^a[1-9]\d*$`), `kind`, `printed`, `note` (optional, `minLength: 1`), `date`, `source` (optional, pattern `^P\d{6}$`). Drop `field`, `stored`, `evidence`.
  - Remove `annotations` from the form and sense schemas.
  - The sense gains optional `annotation` (the id pattern).
  - The entry gains optional `annotations` (`minItems: 1`), last.
  - Rewrite the descriptions to the ruling.
- Regenerate: `data/schema/entry.schema.json` (`bun schema:build`)
- Rewrite: `admin/entry/annotations.ts`
- Modify: `admin/entry/validate.ts`:
  - `display` leaves `plainFields`; it may carry `<annotate>` and nothing else.
  - `VOCABULARY` gains `annotate`, whose opening tag must match `ANNOTATE_OPEN`.
  - Update the `entryFields` docstring.
- Modify: `admin/entry/headword-rules.ts`: every read of `display` goes through `withoutAnnotateTags`. That covers `readTemplate`'s caller and the superscript check at line 190.
- Tests: `admin/entry/__tests__/annotations.test.ts` (rewrite), `validate.test.ts`, `headword-rules.test.ts`, `schema-build.test.ts`

**Acceptance Criteria:**
- [ ] `checkAnnotations(entry, problems)` reports `<id>: <problem>` for each of:
  - an id referenced 0 times: `annotations[i]: a2 is referenced 0 times; it must be referenced once`
  - an id referenced 2 or more times
  - a reference (tag or `annotation` pointer) naming an id the list lacks: `<path>: points to a5, which annotations does not hold`
  - two items with one id
- [ ] References are read from `display`, every `gloss` and `units[n]` (via `annotateIds`), and every sense's `annotation`, stems included.
- [ ] A `display` carrying any tag other than `<annotate>` fails; a `display` carrying `<annotate>` passes the markup check.
- [ ] A gloss with `<cite ref="C00294"><annotate id="a1"><he>…</he></annotate> I</cite>` passes the markup check.
- [ ] `headword-rules` gives the same verdict for `{0} <annotate id="a1">I</annotate>` as for `{0} I`.
- [ ] `annotations.ts` imports nothing from `roman.ts` or `iso-date.ts`. `isIsoDate` stays out of it; the schema's date pattern stays.
- [ ] `entryAnnotations`, `oneAnnotation` and `heldBy` are gone.

**Verify:** `bun test admin/entry` → all pass, and `bun schema:check` → clean. The pipeline's tests fail until Task 4; do not commit yet.

**Steps:**

- [ ] **Step 1: Rewrite `annotations.test.ts`** as a table of one planted defect per row, run through `validateEntry`:
  - the four reference problems above;
  - a valid entry with a display tag, a gloss tag, a unit tag inside a `<cite>`, and a label pointer in a stem's nested sense, which must yield `[]`.
  
  In `validate.test.ts`, add a `display` with `<i>` that fails and one with `<annotate>` that passes. In `headword-rules.test.ts`, add the tagged-display parity row.
- [ ] **Step 2: Run them, and expect failures.**
- [ ] **Step 3: Implement** the schema and run `bun schema:build`. Then write `checkAnnotations(entry: Entry, problems: string[]): void` in `annotations.ts`, then the `validate.ts` and `headword-rules.ts` edits.
- [ ] **Step 4: Run `bun test admin/entry` and `bun schema:check`;** both pass.

**Interfaces:** `Annotation` (new shape) and the `Entry.annotations` and `Sense.annotation` types, used by Task 4. `checkAnnotations(entry, problems)` keeps its signature.

---

### Task 3: Patch `annotation` gains `note`

**Goal:** A reviewed patch's `annotation` may carry the reader's `note`, and the draft types carry it to the import. `evidence` stays in the patch and stops riding the draft.

**Files:**
- Modify: `admin/pipeline/patch/schema.ts` (`ANNOTATION_KEYS` gains `note`; `annotationShapeReasons` requires a non-empty string when present; `PatchAnnotation` type)
- Modify: `admin/pipeline/types.ts` (`AnnotationNote`: drop `evidence`, add `note?: string`; update the docstrings to the ruling)
- Modify: `admin/pipeline/patch/apply.ts` and `admin/pipeline/body/lettered-children.ts`, only where they build an `AnnotationNote`
- Tests: `admin/pipeline/patch/annotation.test.ts`, `schema.test.ts`

**Acceptance Criteria:**
- [ ] A patch `annotation` with `note: "…"` validates; one with `note: ""` fails with `annotation.note must be a non-empty string when present`; one without `note` validates.
- [ ] `evidence` remains required on the patch.
- [ ] No draft type carries `evidence`.

**Verify:** `bun test admin/pipeline/patch` → all pass.

**Steps:**

- [ ] **Step 1: Add the three `note` rows** to `annotation.test.ts`. Run them; the `note` rows fail.
- [ ] **Step 2: Implement.** Then run `bun test admin/pipeline/patch`; it passes.

**Interfaces:** `AnnotationNote = {date, kind, note?, printed, source}`, used by Task 4.

---

### Task 4: The import writes the section

**Goal:** `finishEntry` writes one `annotations` list, places each tag or pointer, numbers the ids, and checks what it writes. The gates read the new shape.

**Files:**
- Modify: `admin/pipeline/import/annotations.ts`:
  - `resolveSenseDraft` returns the placement (field and translated `find`, or label);
  - a new `placeAnnotations` does the numbering, wrapping and pointer;
  - the `kept`/differs check moves here.
- Modify: `admin/pipeline/import/finish.ts` (collect the form and sense drafts, then call `placeAnnotations` once the fields are translated)
- Modify: `admin/pipeline/import/gates.ts`:
  - gate 2 (`checkHeadwordLine`, `writtenNotation`, the `entry.display === composed.display` comparison) reads `withoutAnnotateTags(entry.display)`;
  - gate 10's `annotationProvenance` walks `entry.annotations ?? []`, and a missing `source` is a problem.
- Modify: `admin/pipeline/patch/loss.ts:56-58` (strip the tags before `DISPLAY_SLOT`)
- Modify: `admin/pipeline/import/report.ts` (`countAnnotations` walks `entry.annotations`)
- Tests: `admin/pipeline/import/finish.test.ts`, `gates.test.ts`, `report.test.ts`, `admin/pipeline/body/trace.test.ts`

**Acceptance Criteria:**
- [ ] An entry built with a homograph draft on form 0 and a display of `{0}, {1}` gets `display` `{0} <annotate id="a1">I</annotate>, {1}`, `annotations` `[{id:'a1', kind, printed:'', date, source}]`, and form 0 carries no annotation key.
- [ ] A `text` draft wraps `{n}`. When one form has both a text and a homograph draft, the ids come in text-then-homograph order.
- [ ] A label draft sets `annotation: "aN"` on the sense; a gloss or units draft wraps the single occurrence of its translated `find`.
- [ ] A `relabel` writing three label annotations gives three ids in document order.
- [ ] A form draft on an entry with no `display` adds the problem `<rid>: headwords[n]: the annotation from <Pxxxxxx>: the entry has no display to carry its tag`.
- [ ] `kind: 'kept'` whose wrapped text ≠ `printed`, or a non-`kept` whose wrapped text = `printed`, adds a problem. Label and homograph compare the built label or numeral.
- [ ] Gate 3's tag-stripped text is unchanged by the tags.
- [ ] Gate 2 passes A00889's tagged display.
- [ ] Gate 10 still reports an annotation whose `source` is not an applied annotating patch, and a patch that wrote fewer annotations than it owes.
- [ ] `bun qa` exits 0.

**Verify:** `bun qa` → exit 0 (2,200+ pass, 0 fail).

**Steps:**

- [ ] **Step 1: Write the failing tests:**
  - in `finish.test.ts`, one test per criterion above, plus Review Focus 1, 2 and 4;
  - in `gates.test.ts`, gate 2 with a tagged display, and gate 10's both-ways rows rewritten to the entry-level list;
  - in `report.test.ts`, kind counts read from `annotations`.
- [ ] **Step 2: Run them, and expect failures.**
- [ ] **Step 3: Implement** `placeAnnotations(entry: Entry, forms: readonly FormAnnotationDraft[], senses: readonly {sense: Sense; drafts: readonly SenseAnnotationDraft[]; path: string}[], resolve: RefResolver): string[]` in `import/annotations.ts`. It returns the problems and writes `entry.annotations`, `entry.display`, each `gloss`/`units[n]`, and each `sense.annotation` in the Global Constraints order.
  
  For the homograph numeral, find `{n}`, optional spaces, then the Roman numeral token in `display` (one regex, hoisted). If there's no such token, it's a problem, not a throw. Wire it in `finish.ts`, replacing `applyFormAnnotations` and `resolvePending`'s writes. Then edit the gates, `loss.ts` and `report.ts`.
- [ ] **Step 4: Run `bun qa`;** it exits 0.
- [ ] **Step 5: Commit Tasks 2 to 4 together:** `🌈 improve(entry): one annotation section`. The body names ruling `11-15 annotation section`. Check `git diff --cached --stat` first; it must hold only the files of Tasks 2 to 4.

---

### Task 5: Regenerate the entry data

**Goal:** The committed tree holds the new shape, written by the import alone.

**Files:**
- Regenerate: `data/entries/**` (expect 109 files changed), plus any report the import writes

**Acceptance Criteria:**
- [ ] `bun data:validate` → 0 problems.
- [ ] The import's blessing line reads `Annotations: 118 written (103 print-error, 6 kept, 9 illegible).`
- [ ] `git diff --stat -- data/entries` lists exactly the entry files that held `"annotations"` before. Compare against `git grep -l '"annotations"' HEAD -- data/entries`.
- [ ] Spot reads match Global Constraints:
  - A00889: display `{0} <annotate id="a1">I</annotate>, {1}`
  - A00718: display `<annotate id="a1">{0}</annotate> I, {1}, {2}`
  - J00403: a `units[1]` tag around `).`
  - A00339: `senses[0].annotation: "a1"`
  - P00790: three label pointers

**Verify:** `bun data:validate` → `0 problems`.

**Steps:**

- [ ] **Step 1:** Follow the drift procedure: clear `data/entries/[A-Z]`, run `bun data:import --write` (about 2m45s), then `bun qa:format`.
- [ ] **Step 2:** Run `bun data:validate` and the diff and spot checks above.
- [ ] **Step 3: Commit:** `🧺 chore(data): write the annotation section`. Run `bun qa` first; it must exit 0.

---

### Task 6: Documents follow the code

**Goal:** Every live document describes the shape that is in the code.

**Files:**
- Rewrite: `admin/entry/ANNOTATIONS.md` §2 (shape and checks) and §3 (how the import fills it: placement, ids, `note`, gate 10). Keep §4 as the historical audit and add a dated note.
- Modify: `admin/entry/README.md` (the `annotations.ts` row)
- Modify: `docs/decisions.md` row `11-15 annotation section`, status → `live:` naming `admin/lib/annotate.ts`, `checkAnnotations`, `placeAnnotations`, and gate 10
- Modify: `docs/glossary.md`, if it defines annotation

**Acceptance Criteria:**
- [ ] `git grep -n "stored\b" admin/entry/ANNOTATIONS.md` finds only historical (§4) mentions.
- [ ] `bun docs:links` → 0 dead.
- [ ] `bun qa` exits 0.

**Verify:** `bun qa` → exit 0.

**Steps:**

- [ ] **Step 1:** Edit the documents.
- [ ] **Step 2:** Run `bun qa`.
- [ ] **Step 3: Commit:** `📖 doc(entry): annotation section docs`.
