# Migration — `migrate.ts`, Source to Truth

- **Status:** approved in design 2026-09-06 (maintainer, sections 1–4);
  awaiting written-spec review
- **Parent:** [data architecture §6](2026-07-08-v2-data-architecture-design.md)
  (D14, migration rules 1–7, blessing gates)
- **Consumes:** the entry body model
  ([§6.0](2026-07-11-entry-body-model-design.md)), the repair passes
  (`admin/pipeline/body/repairs.ts`), the transform registry
  ([transform module](2026-08-22-transform-module-design.md)), the
  accepted patch corpus (`data/patches/`), and the hOCR page index
  (branch `worktree-headword-page-index`, §2.5)
- **Produces:** `data/entries/<L>/<rid>.json`, the truth layer

## 1. Context & Problem

Everything built so far is read-only. `fetch.ts` writes `data/source/`;
`repairs.ts`, the transform rules and the patch engine transform in
memory; `body/migrate-dry.ts` composes, gates and reports, but writes
only a gitignored report. The data architecture spec's third stage —
the one that writes — has no code. `migrate.ts` is that code.

The spec's §6 was written in July. Two of its inputs have moved since:

- **Rule 6 (page/column) is superseded.** It named the v1 deployed data
  plus 107 mined hand edits as the source. On 2026-08-17 a side project
  built a page/column index for all 32,512 entries by aligning the
  Internet Archive hOCR of the 1903 print against the rid spine. It
  covers every entry with a column (v1 had one for pages 1–235 only)
  and diagnosed v1's `p` as one page low across volume 2. Maintainer
  ruling 2026-09-06: the page index is the source; the v1 locators and
  the 107 hand edits are a cross-check only, and the standing review
  gate on those edits retires with them.
- **The golden render-diff gate is replaced.** §6 asked for a
  render-diff of all 32,512 entries against v1 output. The v1 renderer
  no longer exists on `v2`. Maintainer ruling 2026-09-06: text-level
  gates (§4) stand in for it.

One stale supposition surfaced during design: `patch/apply.ts` reads
`data/patches/patches.jsonl`, a file nothing writes, so every dry run to
date has applied zero patches while 88 accepted rows sit in
`data/patches/pilot/patches.jsonl` and
`data/patches/tranches/*/patches.jsonl`. §5 fixes the loader.

## 2. The finishing stages

`migrate.ts` runs the committed phase manifest (`text-repairs` →
`structural-repairs` → `patch-apply` → `consumer-output`) exactly as
`migrate-dry.ts` does today, through a shared composer (§5), and then
applies five finishing stages to the composed body. The stages run on
the **transformed** entry: the Phase 2 headword rules have already
unwrapped parenthesized alts and expanded geresh stubs by the time
stage 1 sees a string.

### 2.1 Headword decomposition

One grammar over `headword` and every `alt_headwords` item:

```
^(\*)?(text)( [IVXLC]+)?( [⁰-⁹]+)?$
```

| Shape | Count (raw corpus, headwords + alts) | Form object |
|---|---:|---|
| plain | 38,164 | `{ text }` |
| trailing Roman | 3,282 | `+ homograph` |
| trailing superscript | 801 | `+ disambiguator` |
| Roman + superscript | 6 | both |
| leading `*` | 1,239 | `+ reconstructed: true` |
| `*` + Roman | 118 | both |

Regeneration `*?text( roman)?( sup)?` must byte-match the source
string for every form (gate 2). A string the grammar cannot parse
cleanly — multi-word phrases, `אוּרְיָה I, II`, `X = Y` equivalences;
25 headwords and ~270 alts before transforms — keeps the whole string
as `text`, so its round-trip holds by construction, and lands on the
unparsed-headword review list (§4.2) rather than blocking the run.

### 2.2 Markup translation

A six-row table over `transform/html.ts` tokens. The corpus inventory
(raw) is `a` 164,808 · `span[dir]` 100,362 · `i` 47,028 · `sup` 311 ·
`b` 20 · `sub` 10; `a[dir="rtl"]` occurs 59,264 times.

| Source | Truth |
|---|---|
| `<span dir="rtl">` | `<he>` |
| `<a class="refLink" href data-ref>` | `<cite ref="…">` (§2.3 decides `ref`) |
| `<a … dir="rtl">` | `<cite ref><he>…</he></cite>`, unless the content is already exactly one `<he>` run |
| `<i>` `<sup>` `<sub>` `<b>` | unchanged |
| any other tag or attribute | run fails, names the entry and the tag |

### 2.3 Citation targets

- **Internal** (`href="/Jastrow,_<marked string>.N"`, 68,096 raw): the
  marked string, underscores restored to spaces and the `.N` suffix
  dropped, resolves through the exact headword map to `ref="<rid>"`.
  The map is unambiguous: 32,512 distinct headword strings, zero
  duplicates. On the raw corpus 68,014 resolve and 82 (32 distinct
  targets) do not; transforms repair some, and the plan measures the
  post-transform count.
- **Unresolved internal:** the tag stays byte-preserving with `ref`
  set to the unresolved marked string, and the `(rid, target)` pair
  must appear in `data/quarantine/internal-targets.json` (gate 6).
  Validate accepts a broken target only when listed; compile renders
  a listed citation as plain text (spec §6 quarantine contract).
- **External:** `ref` takes the `data-ref` value verbatim.
  Canonicalizing Sefaria's two ref spellings is measured in the plan
  and applied only if it is a pure string rule; otherwise it is a
  register item.
- **No `k` typing.** Register #2 owns it; the markers stay in the text.

### 2.4 Slug

Niqqud and marks stripped from `headword.text`. A stem unique across
the corpus gets the bare slug. A colliding stem gives every member
`stem-N`, N counted in rid order from 1, and the bare slug is reserved
for the disambiguation page (spec §4). Slugs are written once and
frozen; a later insertion never renumbers.

### 2.5 Page

`page: { number, column }` copied from `data/page-index/entries.jsonl`
by rid, for all 32,512 entries (rid sets match exactly). Placement
confidence is 30,321 high / 1,893 medium / 298 low. All are written
alike — the schema carries no confidence field and truth should not
either — and the 2,191 non-high placements are listed in the evidence
doc for review (§4.2).

### 2.6 Output

`data/entries/<L>/<rid>.json`, `<L>` = the rid's first letter (A–V, 22
directories). Fields in schema order, tab-indented, trailing newline,
optional fields omitted when empty. Every file validates against
`admin/pipeline/schema/entry.schema.json`; no schema change is needed.

## 3. Two passes

1. **Index pass.** Compose every entry in memory; build the headword →
   rid map, the slug table with collision numbering, and the page
   lookup. Nothing is written.
2. **Finish and gate pass.** Per entry, in rid order: stages 2.1–2.5,
   then every gate in §4. In `--write` mode, the file is written only
   after its own gates pass and the run as a whole is refused before
   the first write if any corpus-level gate (5, 7) is red.

## 4. Gates and blessing

### 4.1 Gates

Every gate is a count against a fixed total, never an invariant. All
must hold for `--write` to proceed.

| # | Gate | Passes when | Origin |
|---|---|---|---|
| 1 | Body round-trips (rejoin, units, lettered, form-section) | 32,512 / 32,512 each | `migrate-dry.ts` |
| 2 | Headword and alt regeneration | every form object byte-matches its source string | spec §2.2 |
| 3 | Text conservation | tag-stripped text of the finished entry equals the tag-stripped text of the composed entry, per field | replaces the v1 render-diff |
| 4 | Schema | 32,512 validate, 0 failures | `entry.schema.json` |
| 5 | Chain agreement | walking `prev_hw`/`next_hw` from the source equals rid sort order for all 32,512 | spec §5 |
| 6 | Internal targets | every unresolved `<cite ref>` is on the quarantine list, every listed pair is still unresolved, and every listed row carries a `reviewed` date | spec §6 |
| 7 | Slugs | 32,512 unique; no collided stem has a bare owner | spec §4 |
| 8 | Page coverage | 32,512 entries carry `page`; every column is `a` or `b` | §2.5 |
| 9 | Composition failures | 0 repair failures, 0 transform failures, 0 patch problems | `migrate-dry.ts` |

Gate 3 proves stages 2.1–2.5 invent and drop nothing; gates 1 and 9
already prove source → body. Gate 3 cannot see attribute values; that
is what gate 6 covers.

### 4.2 Report

| Artifact | Path | Committed |
|---|---|---|
| Machine report: every gate tally, every failure line, per-stage counts | `data/source/migration-report.json` | no (D2) |
| Evidence doc: gate table, unparsed-headword list, non-high page placements, slug collision summary, quarantine list, 40 sampled entries rendered source beside truth | `docs/v2/migration-blessing.md` | yes |

### 4.3 Blessing protocol

1. `bun pipeline:migrate` runs dry, writes both artifacts, exits
   non-zero on any red gate.
2. The maintainer reads the evidence doc and the sample. Any wanted
   change becomes a transform rule, a repair, or a quarantine row, and
   the dry run repeats.
3. Blessing is approval of the PR that commits the evidence doc.
4. `bun pipeline:migrate --write` reruns every gate, refuses on any
   red, then writes the 32,512 files in one pass and the report again.
5. The write PR carries only `data/entries/`, the quarantine list and
   the report.

Until step 3, no full-corpus pass writes anything (spec §6).

## 5. Module layout

| Path | Job | New / moved / fixed |
|---|---|---|
| `admin/pipeline/migrate.ts` | CLI: two passes, gates, report, `--write` | new |
| `admin/pipeline/migrate/headword.ts` | form-object decomposition and regeneration | new |
| `admin/pipeline/migrate/markup.ts` | tag translation over `transform/html.ts` tokens | new |
| `admin/pipeline/migrate/cite.ts` | href → `ref`, quarantine check | new |
| `admin/pipeline/migrate/slug.ts` | niqqud strip, collision numbering | new |
| `admin/pipeline/migrate/page.ts` | page-index lookup | new |
| `admin/pipeline/migrate/gates.ts` | gates 2–8, one function each returning a tally | new |
| `admin/pipeline/migrate/report.ts` | JSON report and the evidence doc | new |
| `admin/pipeline/body/compose.ts` | per-entry composition extracted from `migrate-dry.ts` | extracted |
| `admin/pipeline/patch/apply.ts` | `loadCorpus` reads `pilot/patches.jsonl` plus `tranches/*/patches.jsonl`, the glob `tranche.ts` already uses | fixed |
| `admin/pipeline/page-index/` | the branch's `scripts/pageindex/` code | moved |
| `data/page-index/` | the branch's index data | merged as-is |
| `data/quarantine/internal-targets.json` | reviewed unresolved internal targets | new |

`migrate-dry.ts` keeps its Phase 2 report and calls `compose.ts`. The
gate lines transcribed in `docs/v2/body-migration.md` must not move;
the corpus tier asserts that.

## 6. Testing

| Tier | What it proves | Files |
|---|---|---|
| Unit | each stage on fixture strings: every mark shape, every tag row, collision numbering, one quarantined target | `migrate/*.test.ts` |
| Unit | the `compose.ts` extraction leaves `migrate-dry` output byte-identical on the existing fixtures | `body/migrate-dry.test.ts` |
| Corpus | every gate's tally at 32,512 over `corpus-fixture.ts` stages, never re-reading the snapshot | `migrate/gates.corpus.test.ts` |
| Corpus | `loadCorpus` loads 88 patches; the dry run applies them with 0 problems | `patch/apply.corpus.test.ts` |
| Corpus | headword regeneration byte-matches on every form | `migrate/headword.corpus.test.ts` |

The page-index tests (5 files) come across with the move and must
pass under the current biome config before that PR merges.

## 7. Sequencing

The branch `research/residue-calibration` holds 44 commits not yet on
`v2`, and migration needs every one of those transforms. It lands
first.

| PR | Off | Content | Merge gate |
|---|---|---|---|
| 0 | current branch | Phase 2 close-out: `research/residue-calibration` → `v2` as it stands | `bun qa`, `audit:corpus`, local review battery |
| 1 | `v2` | page-index branch rebased; code to `admin/pipeline/page-index/`; data as-is; amendment to data-architecture §6 retiring rule 6 | its 5 test files pass under current biome |
| 2 | `v2` | `compose.ts` extraction, `loadCorpus` fix, `migrate-dry` byte-identical | dry-run gate lines unchanged |
| 3 | `v2` | the five stage modules with unit tests, no CLI | `bun qa` |
| 4 | `v2` | `migrate.ts`, gates, report, corpus tests, first dry run, evidence doc | every gate green; maintainer blesses |
| 5 | `v2` | `--write` run: `data/entries/`, quarantine list, final report | gates green on the write run |

- No corpus pass writes before PR 4 is blessed; PRs 1–3 run only tests
  and the existing dry run.
- Every PR gets the full local review battery before push (cloud
  CodeRabbit is skipped on this repository).
- `migrate.ts` retires when `compile.ts` consumes the truth files, at
  the CP-2 layout cleanup — not at PR 5.

## 8. Out of scope

- `compile.ts` (truth → serving).
- Link-kind typing `k` (register #2), ibid linking (register #13), POS
  enrichment (register #14) — additive, post-migration.
- Adjudicating the ~215 page/column disagreements between the index
  and v1's hand columns, and the 2,191 non-high placements. They are
  listed for review; a correction is an ordinary truth edit after
  migration.
- The 704 `needs_*` residue escalations — per-entry work via the admin
  tool, post-go-live (maintainer decision 2026-09-06).

## 9. Changelog

- 2026-09-06 — drafted from the four approved design sections.
  Supersedes data-architecture §6 rule 6 (page source) and the
  render-diff blessing gate.
