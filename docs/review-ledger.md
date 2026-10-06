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
  name is computed from it. Under U6 a published name may change, but
  the old one must redirect forever, and the `formerNames` ledger that
  would carry the redirect is unbuilt (L23). So these are cheapest
  fixed before go-live, and each one left costs a permanent redirect.
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
- [x] Export `RID`, one field walker, the Hebrew key helpers and
      `ABBREVIATIONS` from `admin/entry/` [L04]
      (can also wait until compile first needs each one)
      (exports done in #147; `hebrew.ts` moved in #149; `abbrev-vocab.ts`
      stays, it imports pipeline code)

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

- [x] Where `compile.ts` lives, and the biome rule that keeps consumers
      out of `admin/pipeline/` [L02]
- [x] Keep or drop, each a yes/no: sense-label `*`/`—` marks;
      gloss-head offsets; a named gloss-head field instead of
      `senses[0]` [L05]

Group 4 is complete. The Sefaria question (L21) is group 10's.

### 5. Data before go-live — maintainer, manual, against the 1903 print

The 382 primary-headword rows (L09) are triaged in
`docs/headword-worklist.md`. 286 are ruled legitimate (pile A) and 4
change no name (pile D); neither needs anything. Two piles do:

- [ ] Pile C: 81 rows that need a print read, each with its hOCR line
      and scan leaf. U00489 (#113) is with them [L09]
- [ ] Pile B: 11 numerals Sefaria dropped that the hOCR shows; confirm
      each on the scan, then patch [L09]
      (piles B and C answered 2026-10-06: 96 answer blocks; 30 rows
      went to the reviewed-kept list, L44)
- [ ] Turn the 96 answers into reviewed patches: the fixes (OCR
      glyphs and marks, printed numerals Sefaria dropped or put in the
      gloss, U00489's join) and an implied I for each X10 row print
      leaves unnumbered [L09] [L43]
- [ ] Ask again the answers neither kept nor patched [L46]

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
- [ ] `hebrew.ts` confusion groups `גנ` and `ףפ` never fire [L35]
- [ ] Three starred senses unsplit inside a definition [L36]
- [ ] HW-truncated back into `decisions.md`; HW-prefix's wording to
      cover bound forms [L37]
- [ ] X8 blind spot left: numerals Sefaria dropped where no sibling
      is numbered (the pointing split is fixed, L41) [L38]
- [x] X8 split one numbered sequence pointed two ways [L41]
- [ ] U00489's primary `ש` is flagged only on its alternate [L39]
- [x] Definitions: cite U6 and L23 for the pre-publication rule, not
      R10 [L40]
- [x] Hide Sefaria's superscripts from `display` [L42]
- [x] The implied I: the field, the rules, X10 [L43]
- [x] The reviewed-kept list, seeded from the answers [L44]
- [ ] Correct the worklist's two scan columns the page index already
      had right (S01339, P00477) when the worklist is next regenerated
      [L45]
- [ ] The maintainer's "add to issue" notes: 17 X8 rows and 5 X9
      rows for a textual-research issue (#153 holds the X9 five); no
      issue was edited [L47]

## Ledger

Review of 2026-10-02 at `c3074e5d9` (four read-only agents: code,
architecture, data, docs; every row confirmed by the controller).

| Id | Finding | Where | Class | Status |
|---|---|---|---|---|
| L01 | `Sense.units` required in TS, optional in schema; schema allows `grammar.pos` (not in type) and `reconstructed:false` (type says `true`); `validate.ts:66` casts the guard | `admin/entry/types.ts:56-61`, `data/schema/entry.schema.json` | contract | closed #147 |
| L02 | Nothing stops `app/` or a future compile module importing `admin/pipeline/`; biome guards one direction; compile's home unsettled (README: Stage 3; CLAUDE.md: separate) | `biome.json` | ruling | ruled (decisions.md row `10-04 compile home`); closed #149 |
| L03 | Update run and atomic write unbuilt; `--write` refuses a populated tree; R11 "live, not in code" | `admin/pipeline/import.ts:461` | post-release | ruled low priority (maintainer, 2026-10-02) |
| L04 | Helpers compile will need live only in the pipeline: `page-index/hebrew.ts` keys, `transform/abbrev-vocab.ts`, three field walkers, unexported `RID` | listed | contract | closed #147 (exports), #149 (`hebrew.ts`); `abbrev-vocab.ts` cannot move (`10-04 compile home`) |
| L05 | One-way doors: `senses[0]` is the gloss head with no field (467 whitespace-only); sense-label `*`/`—` dropped on write (`*2)` → `"2"`, A01249; 107 `*N)`, ~5,440 `—N)` in source); gloss-head offsets computed in `body/rejoin.ts`, never stored | `admin/pipeline/body/trace.ts:85-98` | ruling | ruled (decisions.md rows `10-04 sense star`, `10-04 lead text`); closed #150. The star is kept as `reconstructed`, the dash dropped. Parts b and c (offsets, a named head field) were measured and the review overstated them: `senses[0]` is the only sense in 29,209 entries, sense `1)` itself in 1,030, and an unlabelled lead in only 2,311 (467 whitespace-only); every label in an entry file is explicit, so dropping an empty lead consumes nothing there, the trap is in the import's source walk; stored offsets would go stale on any hand edit, and the source snapshot keeps the pieces by rid |
| L06 | "Flagged by the processor" column can never fire: regex takes the whole headword line as `form`, compared to one form's text; 1,601 rids on both lists, 0 flagged; no test | `admin/pipeline/report/headword-issues.ts:47,327-343` | bug | closed #146 |
| L07 | #142 removed the detector-floor control; `DETECTED_CLASSES` is static, so a dead predicate erases its class from rows and catalogue alike, gates green | `admin/pipeline/import/review-report.ts:60-67` | bug | closed #146 |
| L08 | Two entries with no body text and no row: P01112, U00622 (`senses:[{gloss:"",units:[]}]`; source empty too) | `data/entries/P/P01112.json`, `U/U00622.json` | bug (detector) | closed #146 |
| L09 | Primary-headword rows in headword-issues are pre-publication because `headwords[0]` is the URL name. The 382 (H6 6, X1 2, X5 115, X7 123, X8 104, X9 32; X8 was 136 until the L41 sequence rule) are triaged in `docs/headword-worklist.md`, measured, not assumed all defects: A 286 ruled legitimate or confirmed by the print hOCR, D 4 that change no name, B 11 numerals Sefaria dropped that the hOCR shows, C 81 that need a print read (A 288 and C 79 before L41). #113's three open rids are not among the 382, which were said to hold them: V00518 and S01780 are flagged on alternates only and change no name (D); U00489's primary `ש` is flagged only on its alternate (L39) and sits with C. #122 calls X8 "no slug impact", stale since U2: the numeral is part of the name | `docs/headword-worklist.md` | data | open (worklist PR #151). **2026-10-06:** the maintainer answered piles B and C (96 answer blocks). After rulings 10-06 (L42–L44) the report reads X8 83 (52 primary), X10 50 (45 primary), X9 15 (10 primary), and 30 rows reviewed-kept (22 X9, 7 X8, 1 X5); before, X8 140 and X9 37. The fixes the answers name, and an implied I for each X10 family print leaves unnumbered, are the next PR's reviewed patches; L46 lists the answers that need a person again |
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
| L35 | `hebrew.ts` maps each letter to its FIRST confusion group only, and נ and פ sit in earlier groups, so the `גנ` and `ףפ` groups never pair and `ocrSimilarity` charges 1, not 0.5, for those slips. Latent: nothing live calls it since the page-index build was archived. Found by local CodeRabbit on #149 (a byte-identical move) | `admin/entry/hebrew.ts:140-171` | bug (latent) | open |
| L36 | Three source definitions hold a whole starred sense marker, `—*2)`, inside their prose: upstream never split the sense, so the starred meaning is no sense of its own and carries no label and no `reconstructed` flag. Not among the 107 `*N)` `sense.number` values. Found by the L05 agent | `data/entries/A/A02547.json`, `L/L00099.json`, `M/M00491.json` | data | open |
| L37 | Two headword rulings no longer say what they rule. HW-truncated (34 truncated primaries stay lookup keys as printed) was moved to the archive by the 2026-09-22 prune, though it governs 34 live primaries. HW-prefix's prose names prefix and ending entries, but its count, 115 headwords, is all of X5: 76 are bound forms (`חֲבֵיר־, v. חָבֵר`) and one is a maqaf compound (B00761). Found by the group 5 triage | `docs/decisions.md` (HW-prefix), `docs/archive/decisions-2026-09-22.md` (HW-truncated) | doc | open |
| L38 | X8 keys a family on its exact spelling, which has two blind spots. Two spellings one mark or one vowel apart split a family and show a gap that may be a pointing slip instead (29 of the worklist's 77 X8 C rows). **Fixed by L41**: X8 now numbers by consonant sequence (`decisions.md` 10-05), and the 37 families it cleared are X9 pointing rows. The rest stays open: An entry whose printed numeral Sefaria dropped is invisible when no same-spelling sibling is numbered. A volume-2 hOCR sweep of 15,993 entries with no stored numeral found 9,874 lines and read a numeral on 153; most are a letter misread as `I`, but some look real: T00128 `רָבַע` I, T00549 `רָטַב` I, U01884 `שִׁקְפָא` II. Each would be a name defect outside the 382. A dropped numeral inside a sequence can also make the rest look whole: U01774 `שְׁפַל` II pairs with U01771 `שָׁפֵל` I, while the hOCR reads U01772 `שְׁפַל` as I. Found by the group 5 triage | `admin/pipeline/report/headword-issues.ts` (`homographGapRows`) | detector | open (the pointing split: L41, PR #152). **2026-10-06:** the implied-I shape is now explicit. Under ruling 10-06 implied I, a gap whose only missing numeral is I, with an unnumbered form of the same consonants just before the II (earlier entry, within the 10-05 window, on a line that carries no numeral on another form), is X10, not X8, and its note names the form that takes `homograph: 1, implied: true`: 50 rows (45 primary). The dropped-numeral blind spot (T00128, T00549, U01884) is unchanged |
| L39 | U00489's primary is the single letter `ש`, a name defect (#113: it rejoins as `שׁוּף`), but the headword report flags only its alternate `ׁוּף` (X1, role `alt`), so the role = headword filter behind L09 misses it. Nothing flags a one-letter primary that is not a letter entry. The worklist carries it. Found by the group 5 triage | `admin/pipeline/report/headword-issues.ts` | detector | open |
| L40 | Definitions cite R10 ("a published name never changes"). `decisions.md` §11 says U6 replaced R10: a name may change, and the old one redirects through the unbuilt `formerNames` ledger (L23). The pre-publication rule still holds in practice; the citation is stale. Found by the group 5 triage | `docs/review-ledger.md` § Definitions | doc | PR #151 |
| L41 | X8 split one numbered sequence wherever its members are pointed apart: `אֱגוֹרָא` I (A00278, Aramaic) and `אֲגוֹרָא` II (A00279, a Greek loan) read as II missing its I. Jastrow numbers homographs as they stand in unpointed texts. Consonants alone, the detector's first version, merged different words (the three `קרחא` IIs), so neither key is right. Fixed by numbering a sequence: same consonants, each numbered form within five entries of the last, numerals 1..n with no repeat a superscript does not tell apart (`decisions.md` 10-05). X8 177 → 140 families; 37 X9 rows (32 primary; 18 a missing mark, 19 a different vowel). Controls: A00279 and A01698 clear; B00561 and A00312 stay gaps; S01975 stays. Found by the maintainer, 2026-10-05 | `admin/pipeline/report/headword-issues.ts` (`numberedSequences`, `homographGapRows`, `pointingRows`) | detector | PR #152 |
| L42 | Sefaria's superscript disambiguator was written into `display` as a glyph (S01780 `{0} ², {1}, {2}, {3}`), so the app would print a mark print never sets. Measured: 807 entries carry one in `display` and 808 have a form with `disambiguator`; the 808th, P00224, has no `display` (paren-group-close-unknown). The brief's 813 counted every `display` with a non-ASCII, non-Hebrew character: the 807 plus 6 whose only such character is `…` (K00798, M00297, M00997, N01089, O00394, S00469) | `admin/entry/headwords.ts`, `headword-rules.ts`, `import/gates.ts` | ruling | ruled (decisions.md `10-06 hidden superscript`); PR #154. Re-import changes 807 files in `display` alone: 806 lose a space and the glyph, G00675 the glyph alone |
| L43 | Print leaves the first homograph of some sequences unnumbered and numbers the next II, so U2's "no numbering of our own" left those families running II..n and their names in two shapes. The maintainer's print reads found 22 such families | `admin/entry/types.ts`, schema, `headword-rules.ts`, `report/headword-issues.ts` | ruling | ruled (decisions.md `10-06 implied I`, amends U2); PR #154 adds `implied` and X10; the patches are the next PR (plan group 5) |
| L44 | A print-confirmed false detection came back as the same question on every run, since the report had no memory of a read | `admin/pipeline/report/records/reviewed-kept.jsonl`, `report/reviewed-kept.ts` | ruling | ruled (decisions.md `10-06 reviewed kept`); PR #154, seeded with 30 records |
| L45 | Two answers name a page: S01339 "correct page is 1376b" and P00477 ("447 is actually on page 1064b"; the question was about P00476/P00477, and P00447 is on 1063a). Both agree with the committed page index (S01339 1376b, P00477 1064b). The worklist's scan column was what was wrong: it gave the page of the hOCR line it matched (1375b, 1065a), the neighbouring column | `docs/headword-worklist.md`, `data/page-index/entries.jsonl` | doc | open: no page-index change; correct the worklist when it is next regenerated |
| L46 | Answers neither kept nor a patch, which need a person again. (1) Implied-I reads the rule cannot place: A03217 (`אָרַע` II; A03216 `אֲרַע` I stands between it and A03215, and the maintainer's note reads A03216 I, A03217 II as one sequence), B01159 (`בָּרָא` II, B01158, stands just before it; the unnumbered forms are alternates of B01154 and B01237), G00527 (missing II, not I), H01101 (H00780/alt is 321 entries back), H01222 (missing I and II). (2) X10 names a different form from the one read: I00081 (names I00080 `טֶבַע`; the read was I00077, I00079), U02013 (names U02012 `שְׂרָף`; the read was U02004, U02006), H00321 (names H00320; print numbers none of H00319, H00320, H00322). (3) "The gap is Jastrow's own" for a family X10 now reads as an implied I: C00773 (C00772 `גֵּיס`), E00114 (E00113 `הֶדְיָא`), T00376 (T00375 `רוּם`), U01397 (U01396 `שִׁלְשֵׁל`). (4) N00260: "print spells them differently, so the gap is real", which no option maps to. (5) U00489's mark question ("not sure what you are asking"), J00321 and J00327's notes (an underline standing for any letter), S01780's alternates (`קִצָּא`, `קִי׳`). Two notes ask why a row was flagged: A03217 (above) and E00008, kept, whose consonant run `הא` holds I and II twice (E00005, E00006 and its alternate, E00007), so it is no clean sequence | `docs/headword-worklist.md` | data | open |
| L47 | The maintainer's notes ask for rows to go to a textual-research issue: the five X9 "no mark in print" rows #153 already holds, and "add to issue" on 17 X8 rows, most of them a missing I print does not set (A00312's note asks for a separate issue for those). Ruling 10-06 implied I answers the second group by storing an I; whether they still belong in an issue is the maintainer's call. No issue was created, edited or commented on | #153 | process | open |

Shapes compile must handle, not defects: 10,744 gloss heads begin with
`,`; 33 entries have no `display`; 467 have an empty gloss head
(289 stems-only verbs, 175 units-only).
