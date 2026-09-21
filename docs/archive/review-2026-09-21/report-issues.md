# Open-issue triage — UniquePixels/jastrow, 2026-09-20

Branch `review/2026-09-20-comprehensive`, HEAD `12a40a30`. Read-only: nothing was edited, closed, commented or labelled. Raw issue JSON is beside this file (`issues-open.json`, `issue-<n>.md`). No issue has ever been closed in this repo (`gh issue list --state closed` returns `[]`), so there is no house style for closing yet; the drafts below set one.

## Executive summary

1. **18 open issues.** 17 by `UniquePixels`, 1 by Renovate. Only **#97** was filed by a person through the data-correction form; **#37/#38/#39/#42** carry the Claude Code footer; **#102–#113** (11 issues) have no footer but were filed by two AI sessions in two bursts — 03:17 on 09-20 (four issues in 32 seconds) and 23:40–02:19 on 09-20/21 (seven issues). That is the "issue-happy" session.
2. **Recommended actions:** keep 5 (#15, #38, #97, #104, #113) · close 4 (#18, #37, #42, #105) · merge 7 into one consolidated print issue (#102, #103, #106, #107, #108, #109, #111) · do-now 2 (#110, #39 part 1).
3. **Do-now set (before `compile.ts`): #110** (NFC on write, S; the owner already classified it as pipeline work, and the 164/150 count reproduces exactly) and **#39 part 1** (three `reform` patches for the ד-headwords P00855/P00856/P00860, S; ratified in July, still `עָמַך` in `data/entries`, and *no gate or report row sees them* — they would freeze into wrong slugs `עמך-1/2/3` at publication under R10). Strictly by the stated bar neither breaks consumability; #39-1 is promoted because it fails the "correctable post-go-live" clause (a published slug never changes) and nothing else will ever surface it.
4. **Do-now, not an issue:** `data/entries` was last written 2026-09-18 (#96) but the 15 headword `reform` patches landed 2026-09-20 (#114). F00009, U01000, Q00752 etc. still show their pre-patch forms in the tree. A `bun data:import --write` run (and commit) is pending before anything consumes the tree.
5. **Every #102–#113 claim verified against the repo today** (counts, rids, files, rules) — all still valid except #105, which is 2/5 patched and 3/5 folded into #113. The AI issues are accurate; the problem is only that they are ten issues for one piece of work ("read the headword line in the 1903 print") whose per-rid tables already live in the generated `docs/v2/headword-issues.md` and whose rulings live in `docs/v2/headword-design.md` §4.
6. **Pre-publication vs post-go-live split inside the headword cluster:** rows that change a *primary* headword change the slug and must land before publication — A01175/A01345 (#113, already `blocks` rows), K00107/P00137/A02002 (#108, `blocks` rows), **U00489 and A02823 (NOT in the review report at all)** and P00855–860 (#39). Everything touching alternates only (gender labels, ellipsis endings, ~2,474 abbreviated alternates, homograph numerals, most parentheses) is post-go-live.
7. **A gap the issues expose:** `headword-design.md` §2's form-object structure (`partial`, `display`, per-form `gender`) and the "stop expanding" ruling for `phrase-alt-headword-stub` are cited by five issues as the interim handling, but none of it is in code — `entry.schema.json`'s `formObject` has only `text/homograph/disambiguator/reconstructed`, and `data/entries` still carries the rule's doubled-letter expansions (#109). That pipeline work has no issue and no §10 row.
8. **§10 tracker plan vs hand-filed issues:** the plan imports *review-report rows* keyed `(rid, kind)` in batches. The AI issues are class-level, not per-rid, so they do not collide with that import — but their rid tables will go stale on the next `headword:issues` run. The consolidated issue should point at doc sections, not copy rid tables. Human per-rid corrections (#97) are the intended intake; the data-correction template already asks for the id.
9. **Sense-structure issues (#18, #42)** are the shapes step 11 deferred as Group D with a precondition (before sense-level addressing or admin-tool hand editing). Both should close into a doc row in `research-backlog.md` Group D carrying today's counts (shape A 25 / B 99 / C 4 entries).
10. **#37 (ibid)** is already `patterns.jsonl` row `unlinked-bare-anaphor` (2,179 entries, judgment) — close as duplicate. **#39 part 2** (289 page fixes) is superseded by the hOCR page index (migrate-design 2026-09-06). **#15** is fine as-is but its config targets v1 files.

## Method

- `gh issue list --state open/closed --json …` → scratchpad.
- Every rid named in an issue was read from `data/entries/<L>/<rid>.json` today; every rule/file cited was grepped; counts were re-derived with small Bun scripts over `data/entries` and `data/source/jastrow-dictionary.jsonl` (scripts in `$TMPDIR`, results quoted per row).
- Cross-checked against `docs/v2/headword-design.md`, `headword-issues.md`, `research-backlog.md`, `review-report.md`, `sefaria-report.md`, `upstream-issues.md`, `data/patches/patterns.jsonl`, `data/patches/reviewed/patches.jsonl`, and the consolidation spec §3.1.1/§10/§11.

## Triage table

Effort: S < a day · M days · L print-bound / weeks. "AI" = filed by an AI session under the owner's account.

| # | Title (short) | Filed by | Still valid? — evidence | Tracked elsewhere | Action | Reason | Effort |
|---|---|---|---|---|---|---|---|
| 15 | Dependency Dashboard | Renovate | **Partly.** Renovate reads `main`, which still has the v1 app: `origin/main:package.json` lists fontsource ×3, chart.js, playwright; `index.html` at root. On this branch none exist (`package.json` has 6 devDeps; the app is `app/index.html`). `renovate.json` is byte-identical on both branches and its regex manager targets `^index\.html$`. | — | **keep** | Renovate reopens it if closed; harmless until v2 merges. Add a merge-checklist doc row: point `managerFilePatterns` at `app/index.html` or drop the `cdn scripts` group. | S |
| 18 | Flattened sense-breaks `—N)` in 236 entries | human (2026-07, v1 era) | **Partly.** Today: 290 inline `—N)` matches in 253 entries (script over all string fields). Of the 11 "to review": K00760 `—25)` and U00138 `—15)` traps still present; C00062 and L00565 repaired (no match); Q01974 now has two. Proposed path ("write via the local admin tool", "never re-run the retired pipeline") is v1-era and dead. | `research-backlog.md` Group D (`self-numbered-intext-marker` 35, `inline-inflection-sublist`, `preamble-stranded-lead-sense`…); `patterns.jsonl` same ids; `sefaria-report.md` §16; backlog §3 (21 implied-1 undecided) | **close → doc row** | Same defect family step 11 deferred with a precondition (nothing addresses a sense; D8). One row in Group D with today's shape counts replaces this and #42. | S (doc) |
| 37 | Ibid linking pass | AI | **Stale count, live defect.** Issue says 7,018 unlinked. `patterns.jsonl` `unlinked-bare-anaphor`: 2,179 entries / 2,820 occurrences, round 4, `blocking:false`, method-controlled ("DOES NOT REPRODUCE … 3,256"). My loose regex today: 4,652 bare `Ib.` outside `<cite>` in 3,166 entries. The mis-anchored half shipped as rule `ib-yoma-2a` (`transform/rules/anaphora.ts`). | `patterns.jsonl` (`unlinked-bare-anaphor`), `research-backlog.md` §4 (72 judgment classes), sense-structure spec §3.7 | **close-duplicate** | The pattern row is the authoritative sizing and is on the §10 "port detectors one per PR" path; the issue's number is wrong by 2.5×. | — |
| 38 | Notes mechanism for print deviations | AI | **Yes.** 20 reviewed patches carry "deviation" in `rationale`; body-model spec changelog 2026-08-05 names "a `notes` mechanism … to spec separately"; nothing in `admin/pipeline` or the schema implements it (`grep deviation` hits only a comment in `body/repairs.ts`). | Only here + body-model changelog | **keep, defer** | The one issue with no doc home. Post-go-live app/compile design, but `compile.ts`'s spec should reserve where a note anchors — add a §10 row pointing here. | M |
| 39 | CP-1 carryovers: ד-headwords + 289 page fixes | AI | **Part 1 yes:** P00855/P00856 `עָמַך` I/II, P00860 `עֶמֶך`, slugs `עמך-1/2/3`; no patch (0 hits in `data/patches`), not in `research-backlog`, `patterns.jsonl`, or the review report; 0 `<cite ref="P0085x">` links so a rewrite breaks nothing. **Part 2 obsolete:** migrate-design line 25 "Rule 6 (page/column) is superseded"; `migrate/page.ts` reads the hOCR index; sense-structure spec §3.7 already says the 289 are "a cross-check … rather than a carryover". | `upstream-issues.md` #1, `sefaria-report.md` §1 | **do-now (part 1), then close** | Three `reform` patches, print already verified (divergence audit, CP-1). Invisible to every gate; a wrong primary headword becomes a frozen wrong slug at publication (R10). | S |
| 42 | Swallowed-sense census cycle 2 (shapes B, C) | AI | **Yes, counts moved.** Label-aware script today: shape B (clean 1..n, last sense carries `—(n+1))`) = **99** entries (was 146; e.g. R00781, R00256); shape C (whole run in text) = **4** (A02061, D00072, B00516, B00479; U00483 moved to shape A); shape A = 25. | `research-backlog.md` Group D + `patterns.jsonl` (`self-numbered-intext-marker`, `continuation-marker-fully-absent`) | **close → doc row** (with #18) | Group D precondition applies; the S3 census machinery it wants to reuse was archived (#93). Record the three shape definitions + today's counts in Group D so the detector can be rebuilt. | S (doc) |
| 97 | U00311 ורע → ודע | **human** (data-correction form) | **Yes.** `grep -rl 'ורע מה' data/entries` → exactly `data/entries/U/U00311.json`; also in `data/source` (Sefaria OCR); no patch names U00311. Avot 2:14 reads ודע; Jastrow's gloss "know" agrees. | Nowhere else (not in `sefaria-report`) | **keep until patched** | Fits the intake model exactly. Fix is one reviewed `replace` patch (author `human`, allowed to change bytes; OCR glyph = correction per ruling) + a Sefaria-report row for ר/ד substitutions. Post-go-live by the bar, but S. | S |
| 102 | Headword parentheses vs print/hOCR | AI | **Yes.** Source: 590 entries / 664 forms carry `(`/`)` in `headword`/`alt_headwords` (issue: ~580; rule docstring: 654/580). Entries tree today: only 12 forms, because `parenthesized-alt-headword` strips them — the grouping is already lost downstream. A02823 today: headword `אַפְרִיקִי`, alt `אַפְרִיקָא`, slug `אפריקי-1` (print: headword is `אַפְרִיקָא I`). | `headword-design.md` §4 (parens ruling reversed), §5, §6; `headword-issues.md` H2 (11 rows); `patterns.jsonl` `parenthesized-alt-headword` | **merge → consolidated print issue** | Print work over 590 source entries; A02823-type rows move a slug and are pre-publication, the rest post-go-live. | L |
| 103 | Lost per-form gender labels | AI | **Yes.** `gender-pair-headword-line-collapse` in `headword.ts` (22); `patterns.jsonl` reason: "THE MORPHOLOGY HALF IS DELIBERATELY NOT REPAIRED … CARRIED AS AN OPEN JUDGMENT ITEM". U01000 and A00648 both `grammar.gender: "f"` today; no per-form `gender` in `entry.schema.json`'s `formObject`. | `headword-design.md` §4 Gender, §5; `patterns.jsonl` | **merge → consolidated** | Needs the print to count and the §2 schema to hold the answer. Post-go-live. | L |
| 104 | Audit past rulings for what each drops | AI | **Yes.** Formats verified: `Ruling [C-F]` 27× in `patch/apply.ts`, 54× overall; `RULING (Brian` 4×; `(Brian, 2026-…)` 9× in docs/v2+specs; `overruled` 1×. No list exists (`docs/archive/registry-history.md` is registry commentary, not rulings). | `headword-design.md` §7 "Next" | **keep, defer** | Real M-sized doc research with a named worked example; §7 names it but an issue is the right home for un-started work. Relabel `documentation`. | M |
| 105 | U01000 and friends: split headwords | AI | **Partly done.** U01000 and Q00752 have `reform` patches in `data/patches/reviewed/patches.jsonl` (2 hits each; not yet in the tree — see summary 4). U00489 / V00518 / S01780 still torn (`ש`+`ׁוּף`, `ת`+`ּשַׁע`, `קִצ`+`ּא`) and are the print-dependent rows of #113. Brian's adjudication comment lives here. | `headword-design.md` §4 "Split headwords", §4.1 table; #113 | **close-done → #113** | Fully superseded: 2 patched, 3 carried in #113, ruling copied into headword-design §4. Closing comment must preserve the adjudication link. | — |
| 106 | 8 ellipsis-ending alternates | AI | **Yes.** `headword-issues.md` H5 = 8 rows across 7 rids, exactly the issue's table; no `partial` field exists to mark them. | `headword-design.md` §4 "Ellipsis endings"; H5 | **merge → consolidated** | Print work, alternates only, post-go-live. | S (print) |
| 107 | Expand ~234 abbreviated alternates (+X6 2,240, +X7 34) | AI | **Yes.** `headword-issues.md` header: X6 2,240 / X7 134 (99 legitimate + 34 truncated) / H6 276; `phrase-alt-headword-stub` still registered and still expanding (see #109); `abbrev-in-alt-headwords` 2,035 routed to judgment in `patterns.jsonl`. | `headword-design.md` §4 (three rows); `patterns.jsonl` ×3 | **merge → consolidated (as its main body)** | The largest print job in the repo (~2,474 alternates + 34 headwords). Post-go-live; entries lose alternate search keys until done — 1,393 entries have *only* abbreviated alternates. | L |
| 108 | Three abbreviated primary headwords | AI | **Yes.** K00107 `כִּדְ׳ כַּדְבוּבָא`, P00137 `עָ׳ עַדְיָא`, A02002 `כְּפַר א׳ אָמוּס` in the tree; `LINKED_HEADWORDS` in `headword.ts` line 371 holds the first two; all three are `headword-unparsed` rows in the review report's **Before publication** section. | `review-report.md` blocks; `headword-design.md` §4 | **merge → consolidated (pre-publication subset)** | Primary headwords → slugs → must be decided before publication; needs Jastrow knowledge, not more inference. | S (print) |
| 109 | `phrase-alt-headword-stub` doubles a letter | AI | **Yes.** Tree today: J00463 alt `יַיַסֵּי חֳלִי`, F00058 alt `ווֵול שָׁפָט`; source alts `יַי׳ חֳלִי` / `וו׳ שָׁפָט`. The "expansion stops" ruling (design §4) is not in code. | `headword-design.md` §4 "No expansion" | **merge → consolidated**; pipeline half → §10 row | Two rows; disappears when the rule is switched off; the residual "does the print double it" is #107's print work. | S |
| 110 | NFC on write | AI | **Yes, exact.** Script: `data/entries` 164 strings / 150 files (66 gloss + 58 units + 2 nested = 126 senses; 16+7+9 = 32 stems; 6 alt) — matches the issue to the field. `data/source` 201 / 175. `NFD(before)==NFD(after)` for all 164 (lossy = 0). No `normalizeForWrite` exists; NFC is applied only in `slug.ts`, `slug-index.ts`, `cite.ts`, `headword-issues.ts`. Issue cites `sefaria-report.md` §16 — the NFC section is **§17**, and `upstream-issues.md` has no NFC row. | `headword-design.md` §4 "Mark order"; `sefaria-report.md` §17 | **do-now** | Owner's own comment: "pipeline work, not backlog". Write-step change + gate, S, no external evidence needed; cheapest before `compile.ts` builds indexes on the text. | S |
| 111 | 178 homograph numbering gaps | AI | **Yes.** `headword-issues.md` X8 = 178 (137 main / 41 alt); detector fix committed in #114 (`headword-issues.ts` last change `12a40a30`); split 82/52/44 as stated. Slugs do not move (S2: slug number ≠ printed numeral, by design). | `headword-issues.md` X8; `headword-design.md` §4; `patterns.jsonl` `unnumbered-terminal-homograph` (129, Group E) | **merge → consolidated** | Print work, post-go-live (no slug impact). | L |
| 113 | Five headword fixes needing a gloss op or the print | AI | **Yes, all five.** A01175/A01345 still `X = Y` headwords, slugs `אידרעא-=-אדרעא` / `אימנון-=-המנון`, and both are the review report's 2 `slug-unsafe` **blocks** rows (plus `headword-unparsed`); each has exactly one sense with empty gloss and 0 units, so no `replace` can target it. V00518, S01780, U00489 torn as described; U00488 holds `שׁוּף`. U00489 (`ש`, slug `ש-3`) is **not** in the review report. | `headword-design.md` §4.1; `review-report.md` | **keep — retitle as the pre-publication headword issue** | Needs a small pipeline op (set an empty gloss) + two print reads. Absorb #108's three and #39's three so one issue holds every slug-bearing row. | S–M |

## Clusters

### Cluster 1 — the headword line needs the 1903 print (#102, #103, #106, #107, #108, #109, #111; print halves of #105/#113)

One underlying problem: Sefaria's extractor mishandled the printed headword line (tore words, dropped labels and numerals, misplaced parentheses, kept abbreviations), the pipeline cannot tell a mishandled line from a correct one, and only the print can. The rulings are all in `headword-design.md` §4; the rows are all in the generated `headword-issues.md`. The issues duplicate both and will go stale on the next `bun run headword:issues`.

**Split by consequence, not by shape:**

- **(A) Pre-publication — the row changes a primary headword, hence the slug (R10).** Keep **#113**, retitled, and fold in: #108's K00107/P00137/A02002 (blocks rows), #39's P00855/P00856/P00860 (no row anywhere), U00489 (no row anywhere), A02823 from #102 (no row anywhere). Note for the owner: three of those rids are invisible to the publication gate — either add them to the review report by hand-held rule or accept the issue as the gate.
- **(B) Post-go-live — alternates, labels, numerals.** One new issue replaces #102, #103, #106, #107, #109, #111 (and #108's/#105's residue goes to A).

**Consolidated issue B — draft**

Title: `Headword lines to read against the 1903 print (alternates, labels, numerals, parentheses)`

Body outline:

```
Sefaria's extraction of the printed headword line lost information the
data cannot recover: which forms were bracketed together, per-form
gender labels, homograph numerals, and every abbreviated alternate.
Rulings: docs/v2/headword-design.md §4. Rows: docs/v2/headword-issues.md
(regenerate with `bun run headword:issues`; do not copy rid tables here).

| Shape | Rows today | Doc section | Slug impact | Notes |
|---|---|---|---|---|
| Abbreviated alternates (single word) | 2,240 alts / 2,038 entries | X6 | none | kept as printed, `partial` once §2 lands; 1,393 entries have no other alternate |
| Abbreviated phrase alternates | ~234 (227 rule-expanded + 7 declined) | H6 | none | rule `phrase-alt-headword-stub` to be switched off (pipeline, see below); 2 doubled letters (J00463, F00058) |
| Truncated primary headwords | 34 | X7 | none (kept as lookup keys) | only 6 have a full alternate |
| Ellipsis endings | 8 alts / 7 entries | H5 | none | Jastrow's own notation; base form unclear for N01089, M00997 |
| Homograph numbering gaps | 178 families (82 / 52 / 44) | X8 | none (S2) | which entry Jastrow numbered I |
| Parentheses placement | 590 source entries / 664 forms | H2 + source | usually none; A02823-type rows → issue A | compare group placement against hOCR |
| Lost per-form gender | 22 known + U01000; true size unknown | design §5 | none | needs per-form `gender` in the schema (§2) |

Blocked by (pipeline, tracked in consolidation spec §10):
- headword-design §2 form objects: `partial`, `display`, per-form `gender`
- `phrase-alt-headword-stub` switched off (registry change → `bun run transform:invariants`)

Each shape is one print pass; record decisions as `reform` patches in
data/patches/reviewed/ (or the admin tool once it exists). Not a go-live
blocker: nothing here moves a slug.

Supersedes #102 #103 #106 #107 #109 #111.
```

**#113 retitled (issue A) — draft**

Title: `Headword fixes that must land before publication (slug-bearing rows)`

Add to its body: a table with P00855/P00856/P00860 (`עָמַך`→`עָמַד`, print p. 1086, ratified CP-1 — three `reform` patches, no print read needed), K00107/P00137/A02002 (from #108; remove `LINKED_HEADWORDS` and re-point the anchors in the same change), U00489 (numeral lost with the tear; print decides), A02823 (headword/alternate swapped vs print), plus the existing five. State which rows are already `blocks` rows in `review-report.md` (A01175, A01345, K00107, P00137, A02002) and which are not (U00489, A02823, P00855–860). Note the needed op: a way to set an empty `senses[0].gloss` (A01175/A01345), which `reform` cannot express today.

### Cluster 2 — sense structure (#18, #42; #38 adjacent)

#18 (shape A, v1-era) and #42 (shapes B, C) are the in-text sense-marker family that step 11 deferred as **Group D** with the precondition "before sense-level addressing (D8 lifted) or admin-tool hand editing". Both issues predate that ruling and neither mentions it. Close both into one doc row.

**Doc row draft (append to `research-backlog.md` Group D):**

```
| In-text sense markers, by shape (from #18, #42; recounted 2026-09-20 on
data/entries, label-aware) | A: unnumbered sense, `—2)` in text, no `1)`
before it — 25 entries (U00483, R00291…); B: clean 1..n, last numbered
sense's text carries `—(n+1))` — 99 entries (R00781, R00256…); C: whole
run in text, no structural numbering — 4 entries (A02061, B00516, B00479,
D00072); raw `—N)` matches in any string: 290 in 253 entries, of which
K00760 `15—25)` and U00138 `11—15)` are citation ranges, not senses |
same precondition as the nine; rebuild the detector from these
definitions, not from the archived S3 census |
```

#38 is not sense structure but sits beside it: keep, defer, add a §10 row "Notes for recorded deviations (20 reviewed patches carry one) — owner: compile.ts spec / app".

### Cluster 3 — post-migration passes (#37, #38, #39)

Filed together on 2026-08-06 from the sense-structure spec's S7 register. They have diverged: #37 is now a `patterns.jsonl` row (close), #38 is a genuine unhomed spec item (keep), #39 is half do-now, half superseded (act, then close).

## The do-now judgment, against the bar

Bar: data files consumable by compile/admin · remaining defects correctable post-go-live in the admin tool · reproducible emit of data + blocks/defer split + Sefaria list.

| Candidate | Breaks consumability? | Correctable post-go-live? | Verdict |
|---|---|---|---|
| #110 NFC on write | No — lookups already normalize (`cite.ts`, `slug-index.ts`) | Yes, but every consumer would have to normalize forever | **do-now** on the owner's own classification and because it is a write-step property compile's indexes will assume; S |
| #39-1 ד-headwords | No | **No** — the text yes, the slug no (R10), and no gate sees it | **do-now**; S; three `reform` patches |
| #113 (+#108) blocks rows | No | No (slug) — but the review report already gates them | pre-publication, not do-now; the gate holds |
| U00489, A02823 | No | No (slug), and **no row** in the review report | pre-publication; add to #113 so the gate has a proxy |
| #18/#42 Group D | No | Yes until D8 is lifted / hand edits begin | defer, with precondition (already recorded) |
| headword-design §2 schema fields | No — additive optional fields | Yes | not do-now; but decide *whether it lands before `compile.ts`* since compile reads the entry schema — a §10 row |
| stale `data/entries` vs #114's patches | **Yes** — compile would read a tree missing 15 headword patches | n/a | run `bun data:import --write`, commit; not an issue |
| #97 | No | Yes | S patch whenever convenient |

## Draft commands (NOT run — for the owner's review)

Order matters: create the consolidated issue first so the close comments can cite its number (`$B` below). Every close is reversible (`gh issue reopen`).

### Create the consolidated print issue (cluster 1, B)

```bash
# body from the "Consolidated issue B — draft" outline above, saved as issue-B.md
gh issue create --title "Headword lines to read against the 1903 print (alternates, labels, numerals, parentheses)" \
  --label data --body-file issue-B.md
# note the number it prints; export B=<number>
```

### #15 — keep

```bash
# no issue action. Add to the v2 merge checklist (docs row, not an issue):
#   renovate.json customManagers[0].managerFilePatterns: "/^index\\.html$/" -> "/^app/index\\.html$/",
#   or delete the "cdn scripts" custom manager if app/ carries no CDN pins.
```

### #18 — close, doc row

```bash
gh issue close 18 --reason "not planned" --comment "Closing into the research backlog rather than fixing here.

The v2 pipeline consolidation (spec 2026-09-13, step 11 on 2026-09-20) ruled the in-text sense-marker family as Group D of docs/v2/research-backlog.md: deferred with a precondition (before sense-level addressing is introduced or the admin tool opens hand editing), because nothing addresses a sense today and a hurried renumbering is the dangerous half. The shape this issue describes is recorded there with today's counts (shape A 25 entries; raw \`—N)\` matches 290 in 253 entries; K00760 and U00138 confirmed as citation ranges). The July proposal to write through the v1 admin tool is obsolete: that app and pipeline are gone from v2. Companion: #42."
```

### #37 — close, duplicate of a pattern row

```bash
gh issue close 37 --reason "not planned" --comment "Duplicate of a tracked class. The unlinked-ibid population is \`unlinked-bare-anaphor\` in data/patches/patterns.jsonl (2,179 entries / 2,820 occurrences, method-controlled; this issue's 7,018 does not reproduce), routed to judgment and on the consolidation spec §10 path 'port judgment-class detectors one class per PR'. The mis-anchored half (312 \`Ib.\` → Yoma 2a) shipped as rule \`ib-yoma-2a\` (admin/pipeline/transform/rules/anaphora.ts). Reopen if the §10 port wants a design issue."
```

### #38 — keep, relabel, add a §10 row

```bash
gh issue edit 38 --add-label enhancement
gh issue comment 38 --body "Triage 2026-09-20: kept. Post-go-live, but the compile.ts spec (data-architecture §3) should reserve where a note anchors before the first compiled output ships. Today 20 reviewed patches carry a 'deviation' rationale and nothing in the schema or pipeline represents it. Added as a row to consolidation spec §10 pointing here."
# + docs edit: consolidation spec §10 row "Notes for recorded deviations (#38) | compile.ts spec / app"
```

### #39 — do part 1 now, then close

```bash
# 1) write three reviewed reform patches (P00855 עָמַך I→עָמַד I, P00856 עָמַך II→עָמַד II, P00860 עֶמֶך→עֶמֶד),
#    run bun data:import --write, commit, then:
gh issue close 39 --reason "completed" --comment "Part 1 done: the three ד-headwords are reviewed \`reform\` patches (P00855, P00856, P00860; print p. 1086, ratified at CP-1) — <patch ids>. Their slugs move from עמך-1/2/3 to עמד-1/2/3 while slugs are still unfrozen (R10 binds at publication). Part 2 was superseded on 2026-09-06: rule 6 reads the hOCR page index (admin/pipeline/migrate/page.ts), so the 289 page/column fixes are a cross-check against that index, not a carryover (sense-structure spec §3.7, migrate-design spec)."
```

### #42 — close, doc row (with #18)

```bash
gh issue close 42 --reason "not planned" --comment "Closing into docs/v2/research-backlog.md Group D with #18. Recounted 2026-09-20 on data/entries: shape B (clean 1..n, last sense carries \`—(n+1))\`) 99 entries, was 146; shape C (whole run in text) 4 entries — A02061, B00516, B00479, D00072 (U00483 moved to shape A). The S3 census/review machinery this issue proposed to reuse was archived at refs/tags/archive/v2-research-2026-09 (#93); the shape definitions are recorded in the backlog row so a detector can be rebuilt when Group D's precondition falls."
```

### #97 — keep; comment with the plan

```bash
gh issue comment 97 --body "Triage 2026-09-20: verified — \`ורע מה\` occurs in exactly one entry file (data/entries/U/U00311.json) and in the Sefaria source. Fix path: one reviewed \`replace\` patch in data/patches/reviewed/ (author human; OCR glyph substitution is a correction under the 2026-08 ruling), plus a row in docs/v2/sefaria-report.md for ר/ד substitutions. Closes with the patch id."
```

### #102, #103, #106, #107, #109, #111 — merge into $B

```bash
for n in 102 103 106 107 109 111; do
  gh issue close $n --reason "not planned" --comment "Merged into #$B. One print pass covers every shape on the headword line; the rulings are docs/v2/headword-design.md §4 and the live rows are the generated docs/v2/headword-issues.md, so per-issue rid tables would go stale on the next \`bun run headword:issues\`. Nothing here moves a slug, so it is post-go-live. This issue's text and comments remain the record for its shape."
done
# #109 additionally: the pipeline half (switch phrase-alt-headword-stub off) goes to consolidation spec §10, not an issue.
```

### #105 — close as done/superseded by #113

```bash
gh issue close 105 --reason "completed" --comment "Superseded. U01000 and Q00752 are reviewed \`reform\` patches (#114; they reach data/entries on the next \`bun data:import --write\`). U00489, V00518 and S01780 need the print's spelling and are carried in #113. Brian's 2026-09-20 adjudication (comment above) is copied into docs/v2/headword-design.md §4 'Split headwords'."
```

### #108 — merge into #113 (pre-publication subset)

```bash
gh issue close 108 --reason "not planned" --comment "Merged into #113, the pre-publication headword issue: all three are primary headwords, so their slugs are at stake, and all three are already \`headword-unparsed\` rows in docs/v2/review-report.md's Before-publication section. The LINKED_HEADWORDS note (K00107, P00137; re-point the anchors and delete the exception in the same change) is carried over."
```

### #110 — do now

```bash
gh issue comment 110 --body "Triage 2026-09-20: do now, before compile.ts. Reproduced exactly on the tree: 164 strings / 150 files (126 sense, 32 stem, 6 alternate), NFD-equal before/after for all 164; source 201 / 175. Two doc corrections to carry with the PR: the NFC section of docs/v2/sefaria-report.md is §17 (not §16), and docs/v2/upstream-issues.md has no NFC row yet."
# close on merge with: gh issue close 110 --reason completed --comment "Shipped in #<pr>: normalizeForWrite in the migrate write step, NFD-equality assertion, idempotence test; text-conservation gate unchanged."
```

### #113 — retitle, absorb, relabel

```bash
gh issue edit 113 --title "Headword fixes that must land before publication (slug-bearing rows)"
gh issue comment 113 --body "Triage 2026-09-20: this is now the one pre-publication headword issue. Absorbs #108 (K00107, P00137, A02002 — blocks rows), #39 part 1 (P00855/P00856/P00860 — patches, no print read needed) and two rows that no report sees: U00489 (\`ש\`, slug ש-3) and A02823 (headword/alternate swapped vs print, slug אפריקי-1). Status of each in docs/v2/review-report.md's blocks section: A01175, A01345, K00107, P00137, A02002 present; U00489, A02823, P00855–860 absent — this issue stands in for the gate on those. Needed op: set an empty senses[0].gloss (A01175/A01345 each have one sense, empty gloss, 0 units), which \`reform\` cannot express."
```

### #104 — keep, relabel

```bash
gh issue edit 104 --add-label documentation
gh issue comment 104 --body "Triage 2026-09-20: kept, deferred. Formats confirmed in the tree: \`Ruling C–F\` 27× in admin/pipeline/patch/apply.ts (54× overall), \`RULING (Brian …)\` 4×, dated \`(Brian, 2026-…)\` decisions 9× in docs/v2 + docs/specs, 'overruled' 1×. headword-design.md §7 names this as the next audit; this issue is its work item."
```

## Doc rows to add (instead of issues)

1. Consolidation spec §10: **headword-design §2 form objects** (`partial`, `display`, per-form `gender`) + the halt rule + switching `phrase-alt-headword-stub` off; owner `migrate/headword.ts`; decide whether it lands before `compile.ts` (compile reads the entry schema).
2. Consolidation spec §10: **notes for recorded deviations** → #38.
3. `research-backlog.md` Group D: the in-text sense-marker shapes row (from #18/#42, text above).
4. v2 merge checklist: `renovate.json` custom manager path (#15).
5. `upstream-issues.md`: an NFC row (sefaria-report §17) and a ר/ד OCR-glyph row (#97).
6. Review-report gate: the three slug-bearing rows no detector emits (U00489, A02823, P00855–860) — either a hand-held blocks list or a detector for single-letter / X1 primary headwords.

## Verification log (checks run)

- `ורע מה`: `grep -rl` over `data/entries` → 1 file (U00311); `data/patches` → only `patterns.jsonl`, unrelated row.
- NFC: Bun script over all 32,512 entry files (every string field) → 164 / 150, per-field split matches #110; NFD-equality holds for all; source JSONL → 201 / 175.
- #109: `jq` on J00463, F00058 → doubled-letter alternates present; source lines show `יַי׳ חֳלִי`, `וו׳ שָׁפָט`.
- #18/#42: label-aware script (senses use `label`, not `number`) → A 25 / B 99 / C 4; raw `—\d+\)` 290 / 253; the 11 named rids checked individually.
- #102: source scan → 590 entries / 664 forms; entries scan → 12 forms (rule strips).
- #37: bare `Ib.` outside `<cite>` → 4,652 / 3,166 (loose); pattern row says 2,820 / 2,179 (word-bounded).
- #39: `jq` on P00855/856/860 → `עָמַך`, slugs `עמך-1/2/3`; `grep` for `ref="P0085x"` → 0; `grep P00855` in patches/backlog/spec → none.
- #105/#113: `jq` on all named rids; `grep -l "<rid>"` over `data/patches/reviewed/*` → 15 patched rids present, A01175/A01345/V00518/S01780/U00489 absent; `sed` of review-report lines 11–320 for each rid.
- #108: `headword.ts` line 371 `LINKED_HEADWORDS`; review-report blocks section contains K00107, P00137, A02002.
- #104: `grep -c` per format as listed.
- #15: `git show origin/main:package.json`, `git ls-tree origin/main`, `git diff origin/main -- renovate.json` (empty), `ls index.html` (absent), `ls app` (index.html).
- Provenance: `jq` test for the Claude Code footer and the data-correction template heading over `issues-open.json`; creation timestamps sorted.
- Tree staleness: `git log -- data/entries` (last 2026-09-18 #96) vs `git log -- data/patches/reviewed/patches.jsonl` (2026-09-20 #114).
