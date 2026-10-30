# Review checklist — 2026-10-25

The third review cycle's findings, as a checklist. One session per
group, in the order given: group 0 first, then 1–3 in order, then 4–7
in any order. Tick a box when the PR that closes it is merged. Add a
row rather than delete one.

Reviewed at `e29a0e933` (#196) with the uncommitted archive move in
the working tree. Gates at that state: `qa:lint` 0 errors,
`qa:tsc` clean, `qa:test` 2,115 pass, `data:validate` 32,512 files
0 problems.

## Decisions (Brian, before the sessions that depend on them)

- [x] **D1 — `docs/decisions.md` is the live rulings ledger, not a relic.**
      Its own header says "A new ruling is a row here first" and
      "This file holds only what still binds the pipeline". 116
      tracked references name it (52 patch rationales, 8 Biome
      boundary messages, `.claude/CLAUDE.md`). Restore it to `docs/`,
      or decide that rulings now live somewhere else and say where.
      → gates group 0.
- [ ] **D2 — Will the update run (R11, three-way merge) ever be built?**
      It is UNBUILT (`DESIGN.md` §11 items 46–47); `--write` refuses a
      populated tree (`import.ts:494`). After the first post-publish
      hand edit the import can only run by deleting `data/entries/`.
      Yes → import stays live. No → import is archived to a tag at
      publish. → gates group 5.
- [ ] **D3 — After publish, do Sefaria-error corrections go only through
      the admin tool?** If so the Sefaria appendix's only input
      (patch records) freezes, unless the "diff entries against
      source" generator (09-21 ruling) is designed. → gates group 5.
- [x] **D4 — Patch evidence policy.** Accept a mandatory `evidence`
      object on every reviewed patch, with the import refusing
      `sefaria-only` evidence on any op that changes text? And what
      happens to the 253 live patches that name no print evidence
      (166 cite-retargets, 66 doc-08-seed, 21 others): re-read, hold,
      or accept as text-only by class? → gates groups 1–3.
      Decided 2026-10-26 (Brian): yes, mandatory, and the import
      refuses `sefaria-only` on a text-changing op; the patches with
      no print evidence keep applying as `sefaria-only` with `pending:
      true` and are re-read in group 3's batches. Ruling
      `10-26 patch evidence` in [`decisions.md`](decisions.md).
- [ ] **D5 — Print images.** Keep `dictionaryoftarg0{1,2}jastuoft`
      pinned as the *evidence* source (453 IIIF links and 505 leaf
      cites in patch records depend on its leaf numbering) and add the
      `Jastrow` item only for *display* at page + 15, as v1 does?
      → gates group 6.
- [ ] **D6 — Hebrew OCR.** Reaffirm the 2026-09-04 ruling (no own-OCR
      error detection), or reopen it with the Latin-only diff pilot
      first? → gates group 6.

## Group 0 — Land the archive move cleanly

One session, small PR. Blocks nothing else but every other group's
docs will cite the wrong paths until it lands.

Landed 2026-10-26 on `chore/archive-last-cycle-docs`. Of the 12 moved
files, 6 stayed archived (correction-audit, headword-worklist,
maintainer-checklist, post-go-live-review, review-ledger,
sense-worklist); `decisions.md`, the submission log and the three
generated reports went back. The "65 dead links" below counted
`decisions.md` as moved; the real toll was 42 retargeted, 32 rebased
inside the moved files, 3 in other archived docs, plus 15 that were
already dead. `bun docs:links` now runs in `bun qa` and CI.


- [x] Resolve D1; if restoring, `git mv docs/archive/decisions.md docs/`.
- [x] Decide the same for `review-ledger.md` (this checklist is its
      successor; archiving it is fine, but `.claude/CLAUDE.md:17` must
      then point here).
- [x] `admin/pipeline/paths.ts:133` — `SEFARIA_SUBMISSIONS_PATH` still
      reads `docs/sefaria-submissions.jsonl`; `sefaria.ts:98–104`
      treats a missing log as empty with no message. Move the path or
      the file back, and make a missing log an error.
- [x] `admin/pipeline/paths.ts:112–120` — the import still writes
      `import-blessing`, `review-report`, `headword-issues.{md,csv}`
      into `docs/reports/`; the archived copies will drift. Either
      stop generating them (group 5) or leave them live, not both.
- [x] `report/sefaria-evidence.ts:78` regex matches `docs/<x>-worklist.md`,
      `maintainer-checklist.md`, `post-go-live-review.md` inside
      rationales. 389 rationale lines and 14 appendix rows cite those
      paths. Decide: leave rationales as historical strings (and say
      so in the appendix README), or extend the regex to `docs/archive/`.
- [x] Fix the 65 dead markdown links in live docs: `admin/pipeline/README.md`
      (7), `DESIGN.md` (4), `docs/glossary.md` (3), one each in
      `README.md`, `CONTRIBUTING.md`, `admin/entry/README.md`,
      `ANNOTATIONS.md`, `ideas.md`, `sefaria-report.md`, and 44 across
      22 tranche READMEs.
- [x] Rebase the relative links inside the moved files (decisions 78,
      headword-worklist 15, correction-audit 10, maintainer-checklist 1,
      sense-worklist 1), per `docs/archive/README.md:53`'s own rule.
- [x] Turn the shell snippet in `docs/archive/README.md:62–72` into a
      script (`bun docs:links`) and a CI step, so a move cannot break
      links silently again. 21 links were already dead before this move.
- [x] Update `.claude/CLAUDE.md`: lines 15 (PR range ends at #147),
      17, 18 (`compile.ts` → `admin/compile/`), 22, 24.
- [x] Commit on a branch off `v2`, not on `v2`.

## Group 1 — Patch evidence: schema and gates

The structural answer to the bad patches. 22 of the 47 reviewed
patches removed in #152–#196 were substantively wrong; 14 of those 22
were decided on Sefaria's text with no print read (classes A and B
below). Depends on D4.

Root causes of the 22 (patches agent, diffed `reviewed/patches.jsonl`
commit by commit):

| Class | Cause | Count | Examples |
|---|---|---|---|
| A | Decided on Sefaria's text in the August review docs; boilerplate "print has" rationale | 5 | P000194, P000268, P000221, P000232, P000197 |
| B | A ruling generalised from Sefaria's string shape, applied without print reads | 9 | P000291–298, P000300 |
| C | Stale dependency between patches | 2 | P000760, P000027 |
| D | An agent's stated fact or evidence locator was wrong | 4 | P000309/310, P000388/389 |
| E | One human misread the print, no second reader | 1 | P000308 |
| F | A partial repair accepted as complete | 1 | P000881 |

Landed 2026-10-26 on `feat/patch-evidence` (stacked on
`chore/archive-last-cycle-docs`), ruling `10-26 patch evidence`. The
backfill marked 247 records pending, not 253; the tranche README
[`evidence-backfill-2026-10-26`](../admin/pipeline/patch/records/tranches/evidence-backfill-2026-10-26/README.md)
gives the difference by predicate. The re-import changed no entry
file; gate 11, `evidenceLocator`, read 399/399.

- [x] `patch/schema.ts`: add a mandatory `evidence` object
      `{kind: maintainer-read | hOCR | jastrow-text | sefaria-only,
      leaf?, quote?, reader?, date}`. Remove `confidence` (770 of 770
      are `high`; it carries no information).
- [x] `patch/apply.ts`: refuse `sefaria-only` evidence on any op that
      changes text. Would have blocked classes A and B (14 of 22).
- [x] Backfill: fill `evidence` mechanically for the ~517 records the
      existing `sefaria-evidence.ts` regexes can classify; the 253 with
      no print evidence get `sefaria-only` pending group 3.
- [x] Move the appendix's leaf-belongs-to-rid check and a verbatim
      hOCR-quote check from `report/sefaria-evidence.ts` into import
      gates, so they run at authoring, not only at appendix time
      (would have caught P000388/389).
- [ ] Add a `provisional` status the import refuses to apply; set it
      whenever the evidence filter holds a patch or a ledger row is
      open (P000221 and P000232 stayed applied while in doubt).
      Half done: `status: 'provisional'` exists and the import holds
      it back (a `patch-provisional` row, `blocks`). Nothing sets it:
      none is provisional today, and setting it when a dispute opens
      is a process rule still to write (group 2's `DESIGN.md` rules).
- [x] Document the hOCR's limit where evidence is defined: vol. 2's
      hOCR (ABBYY 8) contains **zero Hebrew characters**; vol. 1's
      (Tesseract heb+eng) is garbled on Hebrew. An hOCR quote is
      evidence for Latin text, numerals and punctuation only, never
      for a Hebrew reading. (Verified: 0 vs 36,166 Hebrew letters in
      a 20 MB sample of each.)

## Group 2 — Patch process: loss, absorption, cite numerals

Smaller gates, each closing one class. Can follow group 1 in the
same session or its own.

Landed 2026-10-26 on `feat/patch-process-gates` (off `v2` after #198).
Two new gates, both green: 12, `declaredLoss` (770/770), and 13,
`citeNumeral` (8,938/8,938). The loss computation finds 115 reviewed
patches that remove characters, not 19: the 19 are its `replace`s,
and the tranche README
[`removes-backfill-2026-10-26`](../admin/pipeline/patch/records/tranches/removes-backfill-2026-10-26/README.md)
gives the other 96 by op. Of the 45 cites that fail on stored numerals
(the 40 of 3,554 below over sense glosses and units, plus 5 in
`stems`), 8 pass as `ch.` lines under ruling 10-15, 4 are kept cites
(10-13 case 3), and 33 are the #188 mismatches, allowlisted `pending`
for a group 3 batch
([`cite-numeral-kept`](../admin/pipeline/patch/records/cite-numeral-kept/README.md)).
No carry-over patch is absorbed today, so the new `patch-absorbed`
row has no members. The re-import changed no entry file.

- [x] A **loss report**, mirror of `no-new-text`, with no exemption
      for reviewed patches (`apply.ts:374, 787` exempt `author ===
      'human'`). Lists the codepoints each patch removes, `refs` and
      `display` included; the record must declare them and the
      checklist block must show them. 19 live `replace` patches remove
      visible characters today (mostly OCR `l)`→`1)`).
- [x] **Absorption is loud**: a carry-over patch whose target is found
      0 times is recorded `superseded` with no report row
      (`import/patches.ts`). Record it absorbed only when a transform
      rule claims the target; otherwise write a review row (P000027).
- [x] **Cite-numeral agreement gate**: every numeraled cite must hit a
      target carrying that homograph, or have a reviewed-kept record.
      40 of 3,554 cites fail today; some are legitimate (`ch.` lines
      under 10-15, implied I) and need an allowlist.
- [x] `import/gates.ts` gate 2 (`headwordLine`) checks a patch against
      Sefaria's line, so a patch matching Sefaria passes. Note the
      blind spot in the gate's docstring; the fix is group 1's
      evidence requirement.
- [x] Checklist rules for the maintainer blocks: show the hOCR line
      and scan crop, never the proposal, as the default; refuse a block
      with both boxes ticked; when hOCR and a scan read disagree,
      require a second read.
- [x] Process rule in `DESIGN.md`: no blanket section approvals, no
      cut-down context, and a seeder never turns a rule's output into a
      `reviewed` patch (P000221 came from the step-8 seeder).

## Group 3 — Re-read the live patches that share a failure signature

Maintainer work in batches, each batch its own PR, using the group 2
checklist format. Depends on D4.

Since 2026-10-26 (ruling `10-26 patch evidence`, group 1) every
reviewed record carries `evidence`, and the 247 the backfill could not
tie to print are `sefaria-only` with `pending: true`: they still apply,
and the blessing counts them. A batch below is **one future PR** that
reads its members against the print, sets each one's `evidence` to a
real kind (`maintainer-read` for a scan read; `hOCR` only for a
Latin-only claim, quoted verbatim; `jastrow-text` where Jastrow's own
text decides) and removes `pending`, or withdraws the patch. The import
then refuses any of them left on `sefaria-only`. Nobody has re-read
anything yet. Why 247 and not the 253 below, by predicate:
[`evidence-backfill-2026-10-26`](../admin/pipeline/patch/records/tranches/evidence-backfill-2026-10-26/README.md).

**Block template.** Each batch README's maintainer blocks follow
[`DESIGN.md` §5 "Patch process"](../admin/pipeline/DESIGN.md#patch-process):
one block per patch and one tick per block (no section approvals), the
whole entry in view, the hOCR line and the scan crop link at the page
index's leaf shown first and the proposal never by default, a block
with both boxes ticked sent back, a second read wherever the hOCR and
the scan read disagree, and the characters a patch removes shown from
its `removes`.

Every predicate runs over `admin/pipeline/patch/records/reviewed/patches.jsonl`
with these definitions (`fam` is the first letter of the cite word's
consonants, the family the cite names, ruling 10-05):

```bash
P=admin/pipeline/patch/records/reviewed/patches.jsonl
D='def fam: .rationale | capture("cite.s text reads [\"`](?<w>[^\"`]+)[\"`]").w | explode | map(select(. >= 1488 and . <= 1514)) | implode | .[0:1];
def retarget: .evidence.pending and .prompt_version == "cite-retargets-2026-10-15";
def classA: .prompt_version == "human-review-2026-08-05";
def hocrOnly: classA and (.rationale | test("hOCR")) and .evidence.kind != "maintainer-read";
def other: .evidence.pending and (.prompt_version | test("^(language-reference|headword-round-2|headword-edges)|^(doc-08-runs|v7|v10)$"));
def unverified: .evidence.pending and (.rationale | test("hOCR")) and (classA | not);
def rest: .evidence.pending and ((retarget or classA or .prompt_version == "doc-08-seed" or other or unverified) | not);'
jq -r "$D select(<predicate>) | .id" $P
```

| Order | Batch | Predicate | Records (pending) | Entries | Reading aid |
|---|---|---|---|---|---|
| 1 | C1 cite retargets א–ז | `retarget and fam >= "א" and fam <= "ז"` | 31 (31), 14 families | 30 | the citing line's hOCR for the cite's Roman numeral (Latin, so the hOCR can witness it); the scan crop at the page index's leaf where the line is garbled or the word is in doubt |
| 2 | C2 cite retargets ח–נ | `retarget and fam >= "ח" and fam <= "נ"` | 39 (39), 23 families | 37 | as C1 |
| 3 | C3 cite retargets ס–ע | `retarget and fam >= "ס" and fam <= "ע"` | 40 (40), 12 families | 35 | as C1 |
| 4 | C4 cite retargets פ–ר | `retarget and fam >= "פ" and fam <= "ר"` | 29 (29), 20 families | 27 | as C1 |
| 5 | C5 cite retargets ש–ת | `retarget and fam >= "ש" and fam <= "ת"` | 27 (27), 15 families | 26 | as C1 |
| 6 | H1 class A, hOCR only, A–O | `hocrOnly and .rid < "P"` | 26 (0) | 26 | the scan crop at the page index's leaf: these were decided on Sefaria's text and their `hOCR` evidence vouches for Latin only, so a Hebrew claim becomes `maintainer-read` |
| 7 | H2 class A, hOCR only, P–V | `hocrOnly and .rid >= "P"` | 25 (1) | 25 | as H1 |
| 8 | H3 class A, the rest | `classA and (hocrOnly \| not)` | 14 (2) | 13 | the scan crop; 9 are already `maintainer-read` (2026-10-25) and need only a look, 3 are `jastrow-text` implied `1)`s, 2 (D00341) are pending |
| 9 | D1 doc-08 seed | `.prompt_version == "doc-08-seed"` | 66 (33) | 33 | the scan crop of the first sense: print sets no `1)` before the `—2)`; each entry is a split (pending) and its retag (`jastrow-text`), read once |
| 10 | O1 the other no-evidence patches | `other` | 15 (15) | 14 | the scan crop; the hOCR line for a numeral or a cite |
| 11 | O2 hOCR named but not checkable | `unverified` | 26 (26) | 20 | the hOCR line the rationale names, re-quoted verbatim, for a Latin-only claim; else the scan crop |
| 12 | O3 the remainder | `rest` | 4 (4) | 4 | per row: P000555 (a split, scan link only), P000580 (a cite renumber the maintainer confirmed), P000581 (an `annotate`), P000927 (a disambiguator ruling) |

The cite retargets go first, split by the family's first letter so a
family is read once, in one batch, and no batch holds more than 40.
Of the 284 retargets, 171 rest only on the family-number inference and
63 sit in a family a homograph reform touched (patches agent's
`stale.py`); a batch reads those first within itself. The class A
survivors follow, the 51 hOCR-only (H1, H2) before the rest. The
signatures this table replaces: no print evidence at all, 253; class A
survivors, 65 (51 hOCR-only, 9 maintainer read, 5 conventions).

- [ ] Batch the 166 cite-retargets by family; each is a `replace` of a cite, so it
      needs `maintainer-read`, `hOCR` (Latin text only) or
      `jastrow-text` evidence (the target entry's own numeral), or is
      withdrawn; a batch never leaves a member `sefaria-only` without
      `pending`. Batches C1–C5.
  - C1 done 2026-10-27 (PR #200): 29 confirmed, 2 re-aimed at B01153
    (B01237, N00106), 2 reform patches giving A02412 and B00049
    homograph I by Jastrow's cross-references (10-13 case 2); 31
    records no longer `pending` (247 → 216).
  - C2 done 2026-10-30 (PR #202): 39 confirmed, 0 withdrawn; 39
    records no longer `pending` (216 → 177); ruling 10-30 one numeral
    per line, C1's P000940/P000941 retired.
- [ ] Re-read the 65 class-A survivors against a scan crop (the 51
      hOCR-only ones first). Batches H1–H3.
- [ ] Re-read the 66 doc-08-seed patches. Batch D1.
- [ ] Triage the 21 remaining no-evidence patches (language-reference
      5, human-review 5, headword-round-2 3, doc-08-runs 3, v7 2,
      v10 2, headword-edges 1). Batch O1; human-review's 5 are in H3,
      and 6 of the 21 are `jastrow-text` now.
- [ ] Re-read the 26 records whose hOCR claim did not check (batch O2)
      and the 4 left (batch O3).
- [ ] **D01114** (data PR, 10-13 case 1): after P000512–P000514 the
      entry still holds an in-text `—4) as preced. 3)` inside sense 3;
      print sets `—4)` as its own sense. Needs a `split` companion
      patch with evidence. Found by the local CodeRabbit pass on
      2026-10-26; not a group 2 change.
- [x] **B01237** (data PR, 10-13 case 1): sense *4 lost `a. בָּרָאָה; cmp. זָהַם`
      between `ch.,` and `Pi. 2)` in Sefaria's text, so `Pi. 2)` read as
      `בַּר I ch.`'s; in print it is זָהַם's (G00102). P000939 restores the
      words, linked to B01160 and G00102 (`maintainer-read` 192b · leaf 215;
      hOCR line `…ch,, a. MNI2; cmp. Ot Pi. 2) to` for the Latin). Found
      by the maintainer's scan read during the C1 re-reads, 2026-10-27;
      PR #201.
- [ ] Resolve the doc-01 contradiction: its header says the
      numbering-gap rows were "hand-verified against print", the L71
      provenance says none of the 67 named a print read.

## Group 4 — Structure of `admin/`

Answer to "is it good and elegant": the boundary is real (nothing in
`admin/entry/` imports from the pipeline; Biome enforces it) and the
"lib" question is small: about 750 LOC would qualify, a third of it
dead. Do the cheap fixes; defer a `lib/` until compile or the editor
brings a second real consumer.

Import graph, `admin/entry/` ← pipeline source files:

| entry file | LOC | pipeline importers | role |
|---|---|---|---|
| `html.ts` | 530 | 27 | general utility (tokenizer, no imports) |
| `types.ts` | 173 | 20 | shared domain model |
| `headwords.ts` | 683 | 6 | shared domain |
| `page.ts` | 61 | 4 | shared domain |
| `annotations.ts` | 193 | 3 | contract |
| `validate.ts` | 564 | 2 | contract (gate 10) |
| `names.ts` | 153 | 2 | shared domain |
| `paths.ts` | 23 | 1 (re-export) | configuration |
| `headword-rules.ts` | 305 | 0 | contract, reached via validate |
| `hebrew.ts` | 213 | **0** | **dead** |

- [ ] Delete `admin/entry/hebrew.ts` (+ test) or name its consumer.
      `data/page-index/README.md:17–18` says "the import still needs
      them" — false; the only user was the archived page-index build.
- [ ] Deduplicate: `isIsoDate` (`entry/annotations.ts`,
      `report/sefaria-report.ts`), `byCodeUnit` (`entry/validate.ts`,
      `transform/rules/point-claims.ts`), `usable` (5 rules),
      `leadOf` (`misc-links.ts`, `unlink.ts`), `insideAnchor`
      (`body/form-sections.ts`, `body/lettered.ts`).
- [ ] Rename `admin/pipeline/lib.ts` (tar/BSON/stream/sha256 I/O for
      fetch and snapshot only) to what it is, e.g. `archive-io.ts`.
- [ ] Move `import/biome.ts` and `formatEntries` to the entry contract:
      Biome is the single formatter for `data/entries/` and the editor
      must format on save too; that is entry-writer behaviour.
- [ ] Fix `import/markup.ts:3` ("over `transform/html.ts` tokens" →
      `admin/entry/html.ts`).
- [ ] Same-name hazards: `stripTags` (regex loop in `body/sense-walk.ts`
      vs tokenizer in `transform/no-new-text.ts`), three different
      `walkSenses`, `legacyTagEnd` returning −1 vs `null`. Rename or
      unify each pair.
- [ ] Name the editing tool `admin/editor/` and add its Biome override
      (itself, `admin/entry/`, and `lib/` if one exists) **before**
      writing any of it. A new `admin/<x>/` has no boundary rule today.
- [ ] Guard the tier split: a unit test calling `readSourceEntries()`
      with no argument would read all 32,512 source entries and only a
      slow CI job would notice. Make the default path refuse under
      `bun test` unless the file is `*.corpus.test.ts`.
- [ ] Add a README to `import/`, `patch/`, `report/`, `transform/`,
      `transform/rules/` (33 files) and `import/detectors/`, or state in
      `DESIGN.md` that it is their README.
- [ ] 17 source files over 500 LOC, two over 2,000
      (`transform/link-target.ts` 2535, `patch/schema.ts` 2335); 39
      files carry `biome-ignore-all noExcessiveLinesPerFile`. Decide
      whether to split the two largest or accept the suppressions.
- [ ] Remove the empty untracked `admin/pipeline/migrate/` and the
      stray `.claude/.cc-writes` dirs (harness artifacts, local only).

## Group 5 — Script lifecycle

Answer to "relics or not": before publish, nothing is a relic. All 26
commits since 10-02 that changed `data/entries/` also changed
`admin/` code or records; the import is the current editing loop.
After publish the answer depends on D2 and D3. 85% of the unit tests
(1,801 of 2,115) cover import-only code.

| Entry point | Class | Disposition |
|---|---|---|
| `qa*`, `data:validate`, ci-lint, CodeQL, Scorecard | every PR, forever | keep |
| `data:sefaria` | future event (Sefaria sync) | keep; fix path (group 0) |
| `data:fetch` | future event | `rebuild:*` script group |
| `data:import`, `data:import:dry` | live until publish | then tag or `rebuild:*` per D2 |
| `transform:count`, `transform:invariants` | rule-change guard | `rebuild:*` now |
| `patch/snapshot.ts` | has no script | add `rebuild:pin` |
| report generators (blessing, review-report, headword-issues, reviewed-kept) | import-only | go with the import |
| `patch/records/`, `transform/rules/` | the import's definition | go with the import |

- [ ] Resolve D2 and D3 and record them as rulings.
- [ ] Add a `rebuild:*` script group (`rebuild:fetch`, `rebuild:pin`,
      `rebuild:count`, `rebuild:invariants`) so a reader can tell the
      everyday scripts from the from-scratch ones.
- [ ] Give `patch/snapshot.ts` a package.json script.
- [ ] Write down the reproducibility claim with a date: the last
      0-drift measurement (10-02) lives only in session memory.
      `admin/pipeline/README.md` now dates the last `--write` (#196,
      2026-10-25) but still cites no drift measurement.
- [ ] If D2 is "no": at publish, tag `archive/v2-import-<date>` and
      remove the import, transform rules, patch records and their
      tests from the live tree, keeping what `data:sefaria` imports
      (`patch/apply`, `patch/snapshot`, `patch/schema`, `import/cite`).
- [ ] If D2 is "yes": schedule R11 and write the merge path into
      `DESIGN.md` before publish.
- [ ] Decide whether `docs/reports/{import-blessing,review-report,
      headword-issues}` remain generated outputs (then un-archive them)
      or stop being written (then remove the write paths).
- [ ] **One Sefaria deliverable.** Six Sefaria/upstream report files
      sit in two places (added 2026-10-26, Brian's ask). Hand-written and
      overlapping: `docs/sefaria-report.md` (779 lines, nothing in the
      pipeline feeds it) and `docs/upstream-issues.md` (45 lines, last
      touched 2026-09-23). Generated by `bun data:sefaria`:
      `docs/reports/sefaria-appendix.{md,csv}` and
      `docs/reports/sefaria-review.csv`. The log:
      `docs/sefaria-submissions.jsonl` (empty). Decide the one thing
      that goes to Sefaria (likely the generated rows plus one short
      hand-written cover note), fold `upstream-issues.md` into
      `sefaria-report.md` or retire it, leave the generated three where
      the script writes them, and close the `docs/ideas.md` row "Refresh
      `sefaria-report.md` before filing". Depends on D3.

## Group 6 — Print sources and OCR

Facts (ocr agent, each from `archive.org/metadata/<id>`):

| Item | Vol. | Scan | Leaves | OCR | Notes |
|---|---|---|---|---|---|
| `dictionaryoftarg01jastuoft` | 1 | Robarts/UofT 2009, Canon 1Ds 400 ppi, 2774×3710 | 718 | Tesseract 5.0 `heb+eng` | in use; largest pixel size of any open item |
| `dictionaryoftarg02jastuoft` | 2 | same | 1,070 | ABBYY FineReader 8, no Hebrew | in use; **0 Hebrew chars** |
| `Jastrow` | 1+2 | HebrewBooks.org PDF, 2012 pdfsam merge, uploaded 2024 by a member of the public; 2100×2850 | 1,752 | Tesseract 5.3 `lat+eng+heb` | v1's display images; **no ABBYY file**; page = leaf − 15, no volume break |
| `dictionaryoftarg0001jast` + `dictionaryoftarg0002unse` | 1, 2 | Claremont School of Theology / IA Cebu 2021, 350 ppi | 718 / 1,068 | Tesseract 5.0 | the only other open, both-volume, library scan |
| `adictionarytarg00jastgoog` | 2 | Google/Harvard 2007, 1135×1544 | 1,065 | Tesseract | low resolution |

The printed page number is the same in every 1903 copy, so
`data/page-index/entries.jsonl` (32,512 rows, all with page and
column) survives any switch. Only `leaf`/`volume` are scan-specific.
No live code parses hOCR; the page-index build that did is archived.

- [ ] Correct the premise in the brief: the `Jastrow` item has no
      ABBYY output (Tesseract 5.3 only) and names no source library;
      its origin is the HebrewBooks.org stamp in the OCR text. The
      "third" URL was the same item as the second.
- [ ] Resolve D5. If "evidence stays pinned, `Jastrow` for display":
      add the display mapping (page + 15) when the app is written and
      nothing else changes.
- [ ] Compare the Claremont 2021 pair with `jastuoft` by eye on 5–10
      known-blurry leaves before ruling any switch out; the agent
      could not view images. A switch costs: `columns.jsonl` leaf
      remap (~1 h), the IIIF regex in `sefaria-report.ts`, an
      amendment tranche for 453 IIIF links and 505 leaf cites, and a
      re-run of the L71 quote check.
- [ ] Resolve D6. Recommendation: do not re-OCR. Use (i) locating
      entries is solved by Latin anchoring (96.1% exact on the checked
      range); use (ii) adjudicating a few characters is a human crop
      read, and a VLM read is a hint, never evidence under the "no
      slop" bar; use (iii) a full Hebrew transcription to diff against
      Sefaria is the only use needing pointed-Hebrew OCR, and no
      engine on offer does pointing well. All 482 appendix rows came
      from structural analysis, none from an OCR diff.
- [ ] If D6 reopens use (iii): first a Latin-only diff with the
      existing hOCR (vol. 2's ABBYY keeps English, cites and sense
      numbers), then a 20-column VLM pilot checked by eye, then
      measure the real Sefaria Hebrew error rate before spending more.
      Order of magnitude for ~3,400 column crops on the Batch API:
      Sonnet 5.5 ~$100, Opus 5.5 ~$200.
- [ ] `data/page-index/README.md`: "Reprints do **not** share this
      pagination" is too strong; every 1903 copy and `Jastrow` share
      it, only leaf numbering differs. Reprints are lending-only and
      unverified.
- [ ] Record in `data/print/hocr/README.md` what the hOCR can witness
      (group 1's last item) so no future rationale cites it for a
      Hebrew reading.

## Group 7 — Docs drift and small hygiene

- [ ] `CONTRIBUTING.md:71` omits `🚀 release` from the commit types
      (`.claude/CLAUDE.md:81` and `.coderabbit.yaml` have it).
- [x] `admin/pipeline/README.md:182–185`: blessing "last regenerated
      2026-10-03 by #146"; it changed in 28 commits since, latest #196.
      Done in group 0 (#197).
- [ ] `docs/archive/README.md:47, :53`: both claims (live ledger
      elsewhere; all archive links work) are false after the move.
- [ ] `docs/ideas.md` row "Candidate rows can go invisible to
      `coverage()`": six measured candidates sit only in an archived
      document; needs untriaged catalogue rows or a gate.
- [ ] CI: no workflow sets `timeout-minutes` (360-min default);
      harden-runner is v2.17.0 in ci-lint and v2.15.0 in the other
      two. Align.
- [ ] 91 Biome infos (`useExpect` 28, `useDestructuring` 16,
      `useNamedCaptureGroup` 16, …): decide per rule whether to
      promote to warn or turn off.

## Positive findings (no action)

- Nothing in `admin/entry/` imports from `admin/pipeline/`; Biome
  enforces the 10-04 boundaries.
- 0 TODO/FIXME in live code; all 147 `biome-ignore`s carry a reason;
  no `.skip`/`.only`; no tracked `.DS_Store`; no secrets; all 5
  devDependencies used.
- `data/source/` is tracked (43 MB), so an import runs offline.
- CI runs `data:validate` on every PR and no job reads `data/source/`.
- Provenance in `data/print/hocr/README.md` and `README.md:59` is
  correct (Robarts, OCUL, 2009, byte counts, OCR engines, 2021 re-OCR
  dates).
