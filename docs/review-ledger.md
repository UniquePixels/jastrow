# Review ledger

One row per review finding, so nothing found twice is lost once. This is
the third of three tracking docs and does a different job from the
other two:

| Doc | Holds |
|---|---|
| `decisions.md` | rulings (a ruling is a row there first) |
| `ideas.md` | the parking lot |
| `review-ledger.md` | every finding a review raised, and what became of it |

Rules: a review appends rows and never deletes one. A row's status is
`open`, `PR #n`, `closed #n`, `ruled` (a decision row answers it) or
`struck` (the finding was wrong; the reason stays). Before any review
reports a finding, grep this file for it.

## Definitions (maintainer, 2026-10-02)

- **Blocker**: data a future stage cannot use at all — the app cannot
  display it, the admin tool cannot open it, or compile cannot compile
  it. Readiness is one property of the data: ready for compile means
  ready for the app and the admin tool.
- **Pre-publication**: a defect whose fix after go-live changes something
  published. Today that is one field: `headwords[0]`, because the URL
  name is computed from it and a published name never changes (R10).
- **Deferrable defect**: everything else. Fixed in the admin tool, before
  or after go-live, as time allows.
- **Post-release by ruling**: the update run and atomic write (R11). The
  source changes only if Sefaria accepts edits; the tool is wanted for
  the maintainer and other devs, built when the need appears.

## Plan

Work top to bottom. Each group is one PR or one sitting. Ledger ids in
brackets.

### 1. Pipeline bugs — one PR, agent work

- [x] Fix the headword report's "flagged" column; add a test [L06]
- [x] Fault row when a detected class returns 0 rows [L07]
- [x] Detector for an entry with no body text; P01112, U00622 [L08]
- [x] Drop the lossless-NFC guard that cannot fire, or make it real [L10]
- [x] NFC the `next_hw` lookup in gate 5 [L11]
- [x] Make the empty-tree glob match the validator's [L12]
- [x] Remove dead exports [L13]

### 2. Entry contract — one PR, agent work

- [x] Make `Entry` and `entry.schema.json` agree; add a parity test;
      move `schema.test.ts` into `admin/entry/` [L01]
- [x] Gender exclusivity in `validateEntry` [L20]
- [ ] Export `RID`, one field walker, the Hebrew key helpers and
      `ABBREVIATIONS` from `admin/entry/` [L04]
      (can also wait until compile first needs each one)
      (exports done in #147; the two moves wait on L02)

### 3. Doc sync — one PR, agent work

- [x] `decisions.md`: rows for #139 and #142; fix HW-halt, HW-equals,
      RP5, 09-21, HW-gender, 218/222–224 [L14] [L15]
- [x] `.claude/CLAUDE.md`: re-date; name `admin/entry/` and
      `bun data:validate`; branch base is `v2` [L16]
- [x] `CONTRIBUTING.md` and PR template [L17]
- [x] `DESIGN.md`, pipeline README, schema README, drawio [L18]
- [x] Comment nits [L19]
- [x] `ideas.md`: drop the stale display-slot clause [L28]

### 4. Rulings — maintainer, rows in `decisions.md`

- [ ] Where `compile.ts` lives, and the biome rule that keeps consumers
      out of `admin/pipeline/` [L02]
- [ ] Keep or drop, each a yes/no: sense-label `*`/`—` marks;
      gloss-head offsets; a named gloss-head field instead of
      `senses[0]` [L05]
- [ ] Upstream: which corrections go back to Sefaria, and how [L21]

### 5. Data before go-live — maintainer, manual, against the 1903 print

- [ ] The 382 headword-issues rows whose role is `headword`
      (H6 6, X1 2, X5 115, X7 123, X8 136). Each is a URL name.
      Not every row is a defect (an X7 abbreviation can be a real
      entry); each needs a look. The worklist is
      `docs/reports/headword-issues.md`, filtered to role = headword.
      Issues #113 (5 rids) and #122 are inside this set. [L09]

### 6. Before the admin tool opens hand editing — maintainer ruling in #123

- [ ] Examine the nine Group D sense-structure classes; renumbering is
      free until anchors or hand edits exist [L22]

### 7. Deferrable defects — admin tool, any time

- 2,813 deferred rows in `docs/reports/review-report.md` (#124, #125)
- 2,588 headword-issues rows whose role is `alt`
- #97 (one OCR glyph in U00311)

### 8. Post-release by ruling

- Update run, atomic write, `writtenTree` base [L03]
- `formerNames` ledger, needed before the first post-publication
  change to a `headwords[0]` [L23]

### 9. Dependencies — agent PRs plus the maintainer's local installs

- [ ] `bson` 6.10.4 → 7.3.3 and `typescript` 6.0.3 → 7.0.2 in one PR.
      TS is a major jump, so review `tsconfig.json` in the same PR:
      every flag still exists, no new default changed meaning, and
      `bun qa:tsc` still passes with the same strictness [L26]
- [ ] Bun 1.3.14 → latest: `@types/bun` in `package.json`, the pin in
      `.mise.toml`, and the maintainer installs it in mise. Also
      re-pin the version named in `.claude/CLAUDE.md` [L26]
- [ ] Biome 2.5.2 → 2.5.15 last and alone: `package.json`,
      `.mise.toml`, the maintainer's mise install, and the version in
      `.claude/CLAUDE.md`. A Biome bump moves rules and formatting
      across the whole tree, so it gets its own diff and its own
      `bun qa:ci` run [L26]

### 10. Sefaria report — maintainer and agent, talk first

- [ ] Talk: what makes a row strong and actionable for Sefaria (exact
      locator, print evidence, proposed text), and which classes are
      worth their time [L21]
- [ ] Review and clean up `docs/sefaria-report.md` (481 lines,
      10 classes, hand-written; nothing in the pipeline feeds it) [L27]
- [ ] Put it in a format that records what has been submitted and
      when, so new findings from later work are distinguishable from
      what Sefaria already has [L27]

### 11. Leftovers — small, fold into any PR that is nearby

- [ ] `import.meta.main` guard in `transform/count.ts` [L33]
- [ ] Flow diagram's dry-run box names the headword-issues report [L34]

## Ledger

Review of 2026-10-02 at `c3074e5d9` (four read-only agents: code,
architecture, data, docs; every row confirmed by the controller).

| Id | Finding | Where | Class | Status |
|---|---|---|---|---|
| L01 | `Sense.units` required in TS, optional in schema; schema allows `grammar.pos` (not in type) and `reconstructed:false` (type says `true`); `validate.ts:66` casts the guard | `admin/entry/types.ts:56-61`, `data/schema/entry.schema.json` | contract | closed #147 |
| L02 | Nothing stops `app/` or a future compile module importing `admin/pipeline/`; biome guards one direction; compile's home unsettled (README: Stage 3; CLAUDE.md: separate) | `biome.json` | ruling | open |
| L03 | Update run and atomic write unbuilt; `--write` refuses a populated tree; R11 "live, not in code" | `admin/pipeline/import.ts:461` | post-release | ruled low priority (maintainer, 2026-10-02) |
| L04 | Helpers compile will need live only in the pipeline: `page-index/hebrew.ts` keys, `transform/abbrev-vocab.ts`, three field walkers, unexported `RID` | listed | contract | closed #147 (exports); moves wait on L02 |
| L05 | One-way doors: `senses[0]` is the gloss head with no field (467 whitespace-only); sense-label `*`/`—` dropped on write (`*2)` → `"2"`, A01249; 107 `*N)`, ~5,440 `—N)` in source); gloss-head offsets computed in `body/rejoin.ts`, never stored | `admin/pipeline/body/trace.ts:85-98` | ruling | open |
| L06 | "Flagged by the processor" column can never fire: regex takes the whole headword line as `form`, compared to one form's text; 1,601 rids on both lists, 0 flagged; no test | `admin/pipeline/report/headword-issues.ts:47,327-343` | bug | closed #146 |
| L07 | #142 removed the detector-floor control; `DETECTED_CLASSES` is static, so a dead predicate erases its class from rows and catalogue alike, gates green | `admin/pipeline/import/review-report.ts:60-67` | bug | closed #146 |
| L08 | Two entries with no body text and no row: P01112, U00622 (`senses:[{gloss:"",units:[]}]`; source empty too) | `data/entries/P/P01112.json`, `U/U00622.json` | bug (detector) | closed #146 |
| L09 | Primary-headword rows in headword-issues are pre-publication because `headwords[0]` is the URL name; 382 rows (H6 6, X1 2, X5 115, X7 123, X8 136); #113's five rids are among them | `docs/reports/headword-issues.md` | data | open |
| L10 | Lossless-NFC guard compares `NFD(NFC(x))` to `NFD(x)`, equal by Unicode guarantee; singletons pass; test reaches it only by monkey-patching | `admin/pipeline/import/normalize.ts:85` | bug | closed #146 |
| L11 | `headwordMap.get(next)` with raw `next_hw`; keys are NFC; latent (0 non-NFC in source), fails loudly | `admin/pipeline/import/gates.ts:399` | bug | closed #146 |
| L12 | Empty-tree check globs `*/*.json`; validator globs `**/*.json` | `admin/pipeline/import.ts:448` | bug | closed #146 |
| L13 | Dead exports: `healAndTransform`, `BODY_CENSUS_PATH`, `buildIndexes`/`finishAll`/`letterDir`/`Indexes`, `homePath`; `HALT_ON_TEXT_DEFECT` false branch | various | hygiene | closed #146 |
| L14 | Ledger behind #139: HW-halt says "ARMED AND HELD, reports rather than refuses" (code: `HALT_ON_TEXT_DEFECT = true`); HW-equals/RP5/09-21 list A01175, A01345 as waiting (fixed, P000309/P000310); `reform.gloss` added against 09-21 with no row; no row for #142's rule | `docs/decisions.md:105,191,205-206,216` | doc | PR #148 |
| L15 | Rows 218/222–224 cite the retired `headword-multiword` kind; HW-gender claims "live as the schema and validate.ts rule" (nothing enforces it; `ideas.md:50` is right) | `docs/decisions.md:210,218-224` | doc | PR #148 |
| L16 | "complete as of 2026-09-22 (#116–#131)" predates #136–#144; `admin/entry/` and `bun data:validate` unmentioned; "Feature branches off `main`" while v2 work targets `v2` | `.claude/CLAUDE.md:12,61` | doc | PR #148 |
| L17 | "validating every entry data file" in `bun qa` (false since #141); CI list omits Validate; "not hand-edited" contradicts R2 and `data/entries/README.md` | `CONTRIBUTING.md:14-18,80-82,130`, `.github/PULL_REQUEST_TEMPLATE.md:20` | doc | PR #148 |
| L18 | DESIGN §11.48 tier test deleted in #142; §2 says `units[]` required and stem children have no nested senses (38 do, P00790); patch-ops table omits `reform.gloss`; outputs omit headword-issues. Pipeline README: nine gates, last run 2026-09-22, "names nothing outside itself except paths.ts" (25 files import `admin/entry/`). `data/schema/README.md` names the old reader. drawio says nine gates | listed | doc | PR #148 |
| L19 | Schema title "truth entry"; "slug" in `import/gates.ts:189`, `entry/headwords.ts:86`, `entry/headword-rules.ts:217`; `patch/apply.ts:92` names deleted `apply-cli.ts`; five "still PENDING" comments where `PENDING = []`; `.gitignore:36` lists `migration-report.json`; `fetch.ts:217` top-level `await main()` | various | nit | PR #148 |
| L20 | Gender exclusivity (form gender vs `grammar.gender`) unchecked; `schema.test.ts:26-33` asserts an entry carrying both as valid | `admin/entry/validate.ts` | contract | closed #147 |
| L21 | Which corrections go upstream to Sefaria, and how | — | ruling | open (maintainer raised 2026-10-02) |
| L22 | Nine Group D sense-structure classes to examine before anchors or hand edits | #123 | data | open |
| L23 | `formerNames` ledger unbuilt; needed before the first post-publication `headwords[0]` change | — | post-release | open |
| L24 | **struck.** The 2026-10-02 verdict called review-report's "blocks: 0" incomplete because headword rows live in another report. Under the ledger's definition the primary-headword rows are pre-publication (L09), not blockers. That says nothing about the report's count: the report uses its own criterion (a defect the admin tool cannot correct after go-live), and the headword-issues report applies no blocks criterion at all. L09 is where those rows are handled | — | struck | struck |
| L25 | **struck.** The same verdict split "ready for compile" from "ready for the admin tool". Readiness is one property; the contract rows (L01, L04, L20) are code tidiness, not data readiness | — | struck | struck |
| L26 | Dependencies behind: `@biomejs/biome` 2.5.2 (latest 2.5.15), `@types/bun` 1.3.14 (1.4.2), `bson` 6.10.4 (7.3.3), `typescript` 6.0.3 (7.0.2). Bun and Biome are also pinned in `.mise.toml` and `.claude/CLAUDE.md` and installed locally through mise; the TS major needs a `tsconfig.json` review; Biome goes alone | `package.json`, `.mise.toml`, `tsconfig.json` | chore | open (maintainer, 2026-10-02) |
| L27 | `docs/sefaria-report.md` needs review and cleanup, strong actionable rows, and a format that records what was submitted and when versus what is new | `docs/sefaria-report.md` | process | open (maintainer, 2026-10-02) |
| L28 | `ideas.md` "Two unenforced entry-schema invariants" still says `display` token indices are not bounds-checked against the headword count; `checkSlots` (rule 1) checks them. Found by the group 2 agent | `docs/ideas.md`, `admin/entry/headword-rules.ts:97` | doc | PR #148 |
| L29 | `names.ts` says rule 4 fails only the committed-tree tests while the import still writes the entry; `headwordShapeProblems` says rule 4 runs "only when the halt is armed". Since #141 gate 10 refuses the write, and #146 removed the switch. Found by the group 3 agent | `admin/entry/names.ts:30-33`, `admin/entry/headword-rules.ts:223` | nit | PR #148 |
| L30 | The Data correction issue form says entry data is "produced by the pipeline, not hand-edited in a PR", the claim L17 corrects in `CONTRIBUTING.md`. Found by the group 3 agent | `.github/ISSUE_TEMPLATE/data-correction.yml:8-11` | doc | PR #148 |
| L31 | `.gitignore` points at a `grammar.test.ts:53-58` census block that #142 removed. (Its `migration-report.json` line, L19, stays: the comment beside it keeps the ignore on purpose, so a leftover local copy is never committed.) Found by the group 3 agent | `.gitignore:24-25` | nit | PR #148 |
| L32 | Root `README.md` says one module has been written on v2 and that the pipeline knows nothing about the rest of the repo; `admin/entry/` is a second module since #141, and its README is not in the documents table. Found by the group 3 agent | `README.md` | doc | PR #148 |
| L33 | `transform/count.ts` calls `await main()` at top level with no `import.meta.main` guard, the shape L19 fixed in `fetch.ts`. Found by the group 3 agent | `admin/pipeline/transform/count.ts:145` | nit | open |
| L34 | The flow diagram's dry-run box says a run writes `import-blessing.md` and `review-report.md`; it also writes the headword-issues report (`.md` and `.csv`). Found by the group 3 agent | `docs/pipeline-flow.drawio.svg` | doc | open |

Shapes compile must handle, not defects: 10,744 gloss heads begin with
`,`; 33 entries have no `display`; 467 have an empty gloss head
(289 stems-only verbs, 175 units-only).
