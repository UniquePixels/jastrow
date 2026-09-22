# Pipeline module boundary — design

**Status: agreed with the maintainer 2026-09-22, not yet executed.**

This spec archives itself. Its last step moves it to
`docs/archive/specs/` alongside the nineteen dated specs it retires —
a dated spec is a snapshot of intent, and the repo is not to keep any
live.

## 1. Why

The repo carries nineteen dated design specs, a 360-line ruling ledger
whose own sections are titled *"Reversed but still cited as live"* and
*"Decided but not reflected in code"*, and eleven mixed-purpose
documents under `docs/v2/`. Taken together they no longer describe one
thing, and several describe a thing that changed.

The maintainer's framing, 2026-09-22:

> Think in terms of traditional modular programing. The import
> pipeline is a module, it works independently of anything else. It
> knows nothing about admin tools, apps, etc. All it knows is take
> some data, and turn it into some different data, in a specified
> schema. (The schema is not owned by the import module, the schema is
> a project wide artifact.)

and the test to design against:

> someone could clone the repo and use just the import for their
> project

The repo stays the project's home — the app and the admin tool arrive
here later, as siblings. What changes is that the pipeline stops being
entangled with them in documentation and in its own file paths.

## 2. The boundary

The module is `admin/pipeline/`. It reads data, writes data in a
schema it does not own, and writes reports about what it did.

| | |
|---|---|
| **Owns** | every file under `admin/pipeline/`, including the patch records (M9) |
| **Consumes** | `data/source/`, `data/print/`, `data/page-index/`, `data/schema/entry.schema.json` |
| **Produces** | `data/entries/`, `data/quarantine/`, `docs/reports/` |
| **Knows nothing of** | the app, the admin tool, Cloudflare, routing, rendering |

Everything in the middle two rows is declared once, in
`admin/pipeline/paths.ts`. That file is the boundary: it is what a
cloner edits and the only place the module names the world outside
itself.

### What was already true

Verified 2026-09-22 before designing: **no file under
`admin/pipeline/` imports anything outside it.** Every `from` resolves
within the module. The module is code-clean; this spec does not change
that, it records it and adds the checks that keep it true.

### What was not

| # | Leak | Evidence |
|---|---|---|
| 1 | The module writes into the project doc tree | `migrate/report.ts:19` → `docs/v2/migration-blessing.md`; likewise `review-report.md`, `headword-issues.{md,csv}`; `report/headword-issues.ts:31` *reads* `docs/v2/headword-design.md` |
| 2 | The shared schema sits inside the module | `admin/pipeline/schema/entry.schema.json`, whose `$id` is already `https://jastrow.app/schema/entry.schema.json` |
| 3 | The boundary is 21 string literals across 14 files | `'data/entries'` is spelled independently in `migrate.ts:82`, `migrate/validate.ts:18`, `report/headword-issues.ts:27` |

## 3. Decisions

Taken with the maintainer, 2026-09-22, in the session that produced
this spec.

| # | Ruling | Rejected alternative |
|---|---|---|
| M1 | The repo stays the project monorepo. The pipeline is the only module written; app and admin tool join it later | splitting the pipeline into its own repo |
| M2 | `admin/pipeline/` keeps its path. `admin/` is right long-term because the admin tool lands there | renaming to `pipeline/` — ~200 files of churn, and Sonar reads every moved file as new code |
| M3 | `entry.schema.json` moves to `data/schema/`, where the data it describes lives. Its test moves to `admin/pipeline/schema.test.ts` — tests are code | a top-level `schema/`; the maintainer wanted the root tidy and the location semantically right |
| M4 | The licence rule is one sentence: **everything under `data/` is public domain, everything else is MIT.** The CC-BY-NC claim does not survive checking (§5.1) | the old line claiming all of `data/` is CC-BY-NC; and a carve-out exempting `data/schema/` |
| M5 | Generated reports are written to `docs/reports/`, via a declared path | `data/reports/` — they are human-read markdown, not data |
| M6 | `upstream-issues.md` and `sefaria-report.md` stay in `docs/` | moving them into the module; a cloner would not want Jastrow-specific findings |
| M7 | Nineteen dated specs are archived. One `admin/pipeline/DESIGN.md` states what is true today | keeping the pipeline specs and marking each live or retired — the contradictions between dated specs would survive |
| M8 | `docs/decisions.md` keeps only rulings still binding on the pipeline; the rest move to the archived copy | auditing all 157 rulings against the code first — rejected as too slow for the value |
| M9 | The patch records move to `admin/pipeline/patch/records/`. They exist only to turn raw source into entries — import definition, the same category as the 81 transform rules, not data | keeping them in `data/`; or treating them as a project-wide artifact the admin tool would edit, which the maintainer ruled it will not |
| M10 | `entry.schema.json` is dedicated to the public domain, so `data/` needs no exception. The maintainer's reasoning: the entries *are* the schema made concrete, so they share its status | keeping it MIT and carving it out of the `data/` rule |
| M11 | `data/source/` is public domain (§5.1). Every `data/` subdirectory carries a README saying where its contents came from — attribution is owed even where no licence compels it | asserting a licence the repo cannot source |
| M12 | `edit-replay.jsonl` is archived | keeping it as a seed for the admin tool |

## 4. What moves

### 4.1 Code and schema

| From | To | Note |
|---|---|---|
| `admin/pipeline/schema/entry.schema.json` | `data/schema/` | public domain (M10) |
| `admin/pipeline/schema/entry.schema.test.ts` | `admin/pipeline/schema.test.ts` | code stays MIT; `admin/pipeline/schema/` is then empty and removed |
| `data/patches/` | `admin/pipeline/patch/records/` | `patterns.jsonl`, `snapshot.lock`, `reviewed/`, `tranches/` — 29 files (M9) |
| — | `admin/pipeline/paths.ts` | new; absorbs the 21 literals |

**The schema is read at runtime, not imported.** Both load sites are
compile-time imports today — `migrate.ts:78` and
`migrate/validate.ts:11`, each `import entrySchema from
'./schema/entry.schema.json' with { type: 'json' }`. With the schema
in `data/` those become imports reaching out of the module, which §9
check 2 must fail. They become a read through `paths.ts`, which is
also the honest expression of "the module does not own the schema": a
cloner points `paths.ts` at their own and nothing else changes.

The cost, stated: TypeScript stops checking the schema literal at
build time. Ajv compiles it at run, and `schema.test.ts` covers it.

`test-tiers.test.ts` scans from the repo root (`cwd: '.'`, line 88), so
the schema test stays inside the unit tier wherever it lands. No tier
change.

### 4.2 Documents — the live set

Six files, and the archive.

| File | Content |
|---|---|
| `README.md` | what the repo is; the pipeline is the only module written; the licence rule and attributions (M4, M11) |
| `admin/pipeline/README.md` | how to run it: inputs, outputs, commands, gates |
| `admin/pipeline/DESIGN.md` | what is true of the design **today** (M7) |
| `docs/decisions.md` | rulings still binding (M8) |
| `docs/glossary.md` | kept, re-scoped to pipeline terms |
| `docs/ideas.md` | **new** — the reminder list, not specs |

### 4.3 `docs/v2/` — eleven files

| Files | Goes | Why |
|---|---|---|
| `migration-blessing.md`, `review-report.md`, `headword-issues.md`, `headword-issues.csv` | `docs/reports/` | generated; regenerate on the next import |
| `headword-design.md` | split | §2–§4 are implemented → fold into `DESIGN.md`; §5–§6 are open questions → `docs/ideas.md`; the file → archive |
| `upstream-issues.md`, `sefaria-report.md` | `docs/` | M6 |
| `research-backlog.md` | split | open items → `docs/ideas.md`; the file → archive |
| `retired-corpus-checks.md`, `url-routes.md` | `docs/archive/` | historical records; `url-routes.md` already marks itself superseded |

`docs/v2/` is then empty and removed.

### 4.4 `docs/specs/` — nineteen files

All nineteen move to `docs/archive/specs/`, which exists. Before they
move, `admin/pipeline/DESIGN.md` must state, in present tense, every
design fact still true — the specs stop being the reference the moment
they move, so anything only they record is lost work.

Also removed: `docs/superpowers/` (holds one `.DS_Store`),
`docs/.$Migrate Flow.drawio.bkp` (an editor backup).

### 4.5 `docs/ideas.md`

Seeded from the maintainer's parking list, held until now only in
Claude's memory: sixteen rows dated 2026-07-04 to 2026-08-24. Plus the
open questions extracted in §4.3. Ideas and reminders only — the file
carries no rulings and no specifications, and nothing in it is a
commitment.

### 4.6 `data/source/` orphans

Three artifacts no pipeline file references:
`baseline-audit-report.json`, `body-dryrun-report.json`,
`body-migration-report.json`. They are outputs of investigations
already archived, sitting in the input tree. Move to
`docs/archive/`.

`edit-replay.jsonl` is named only in a comment
(`patch/snapshot.ts:28`) describing it as admin-tool provenance; no
code reads it. Archived (M12).

Kept: `body-census-report.json` (read by `body/grammar.test.ts:58`),
`manifest.json` (21 sites), `lexicons.json`, `migration-report.json`.

### 4.7 Provenance READMEs

Every subdirectory of `data/` carries a README naming where its
contents came from (M11). Two exist and are already good models —
`data/page-index/README.md` and `data/print/hocr/README.md`, the
latter naming the scanning institution, the sponsor, both IA
identifiers, leaf counts, OCR engines and MD5s.

| Directory | README | Must record |
|---|---|---|
| `data/source/` | **new** | Sefaria, `lexicon_entry` where `parent_lexicon` is "Jastrow Dictionary", snapshot 2026-07-04, and which files are Sefaria's versus this pipeline's own reports |
| `data/entries/` | **new** | derived from `data/source/` by `bun data:import`; regenerable, not hand-authored |
| `data/quarantine/` | **new** | what the pipeline set aside and why |
| `data/schema/` | **new** | hand-authored here; public domain (M10) |
| `data/page-index/` | exists | add the *method* — see below |
| `data/print/hocr/` | exists | no change |

**The page-index method is currently recorded nowhere live.** The
build chain — `build.ts`, `align.ts`, `bands.ts`, `columns.ts`,
`spine.ts`, `layout.ts`, `monotonic.ts`, `emit.ts`, `hocr.ts`,
`verify.ts` and tests, twenty files — exists only at
`refs/tags/archive/v2-research-2026-09` (verified on the remote,
`a2e75bbd7`). It is deterministic: both volumes read as one
continuous book, every headword placed at a token offset by weighted
anchor alignment (nearer anchors weigh more, `1/(1+distance)`), page
layout pinned at `1e6`, then isotonic regression to force
monotonicity. No model call anywhere in the chain — all twenty files
grepped for `anthropic|openai|claude|llm|prompt|fetch(`, zero hits.

That paragraph belongs in `data/page-index/README.md`, because the
question "was this AI or a script?" was asked in this session and the
live tree could not answer it.

## 5. Licence and provenance

`data/` holds work from four origins. The README's current two
sentences say all of it is CC-BY-NC, which is wrong for the Internet
Archive scans and **unsourced for the Sefaria text**.

### 5.1 The CC-BY-NC claim does not survive checking

Three findings, 2026-09-22:

1. **Nothing in this repo sources it.** `README.md:31` is the only
   place the repo says CC-BY-NC. No ruling in `decisions.md`, no
   spec, no note records where it came from.
2. **The Sefaria export carries no license field.** The lexicon record
   in `data/source/lexicons.json` has `attribution`, `source`,
   `version_title` — and no rights or license key.
3. **Sefaria declares the text public domain.** For the same 1903
   edition, `GET /api/texts/versions/Jastrow` returns
   `"license": "Public Domain"`, `"digitizedBySefaria": true`,
   `"versionTitle": "London, Luzac, 1903"`.

Caveat on (3): that endpoint describes the `Jastrow` *text* index.
This project's source is the `lexicon_entry` collection
(`parent_lexicon: "Jastrow Dictionary"`). Same 1903 digitization, two
collections; the API does not prove the lexicon carries the same
declaration, and the lexicon's own metadata declares nothing.

Background, not legal advice: Jastrow 1903 is out of copyright on its
age. Under US law a faithful digitization of a public-domain work
generally creates no new copyright (*Feist*, 1991; *Bridgeman*, 1999).
What might carry thin protection is Sefaria's added structural layer —
entry splitting, the citation links — which is a question about the
markup, not about the dictionary text.

### 5.2 The rule

> **Everything under `data/` is public domain. Everything else is
> MIT.**

That is the whole licence statement, and it holds without exception
once the patch records leave `data/` (M9) and the schema test leaves
with them (M3). `data/` then contains only the 1903 dictionary, the
scans of it, work derived from those by this project, and the schema
that describes the result.

| Tree | Origin | Attribution owed |
|---|---|---|
| `data/source/` | Sefaria MongoDB export of `lexicon_entry`, `parent_lexicon: "Jastrow Dictionary"`, snapshot 2026-07-04 | Sefaria, for the digitization |
| `data/entries/`, `data/quarantine/` | derived from `data/source/` by this pipeline | Sefaria, upstream |
| `data/print/hocr/` | Internet Archive / University of Toronto scans of Jastrow 1903 | UofT Robarts Library; Ontario Council of University Libraries; Internet Archive |
| `data/page-index/` | built by this project from the hOCR | as above, upstream |
| `data/schema/` | hand-authored by this project | — |

Attribution is owed whether or not a licence compels it (M11), and
§4.7 puts it in a README beside each directory rather than in one
distant paragraph.

## 6. Memories

Claude's memory store holds 86 files for this project, many of them
pipeline archaeology whose lesson is spent. They are the same baggage
problem in a second form: they arrive in every session's context.

Claude audits all 86 against the boundary above and presents a
keep/cut list. **Nothing is deleted before the maintainer signs off** —
the store is not versioned and a deletion cannot be recovered.

## 7. What this does not do

- It does not change any pipeline behaviour. Every gate that passes
  today passes after, on identical bytes.
- It does not touch the content of `data/entries/` or of the patch
  records. The records change address (M9); not one byte of what they
  say changes.
- It does not re-open any ruling. M8 removes rulings from the live
  ledger; it does not reverse them.
- It does not audit the 157 rulings for truth against the code. That
  was offered and declined as too slow; a ruling archived under M8 is
  archived as *not binding on the pipeline*, not as *wrong*.
- It does not write the app, the admin tool, or `compile.ts`.

## 8. Open

None. Both questions this spec opened were settled in the same
session: `data/source/` is public domain (M11), and
`edit-replay.jsonl` is archived (M12).

One thing to revisit rather than decide: Sefaria's `lexicon_entry`
collection declares no licence of its own, and the "Public Domain"
declaration checked in §5.1 is for the `Jastrow` *text* index. Same
1903 digitization, two collections. Worth a note to Sefaria asking
them to declare on the lexicon too — as a courtesy to the next
person, not because this project's position depends on it.

## 9. Verification

| # | Check | How |
|---|---|---|
| 1 | Behaviour unchanged | `bun qa` green; `bun data:import` produces byte-identical `data/entries/` |
| 2 | No upward imports | a test asserting every `from` under `admin/pipeline/` resolves inside it |
| 3 | The boundary is declared | no path literal for `data/`, `docs/` or `app/` outside `paths.ts` — asserted, like `test-tiers.test.ts` asserts the tier split |
| 4 | No live doc names a retired one | every link in the six live documents resolves |
| 5 | Reports regenerate in their new home | `bun data:import` writes `docs/reports/`, and `docs/v2/` is gone |
| 6 | The licence rule holds | every subdirectory of `data/` has a README, and nothing under `data/` is `.ts` |

Checks 2, 3 and 6 are new tests in the unit tier. They are what keeps
this from decaying: the module's independence and the licence line
become things `bun qa` fails on, not things a document claims.

Check 6 is the cheap mechanical form of M4. `data/` holding no
TypeScript is not the whole of "everything there is public domain",
but it catches the way the rule would actually be broken — someone
dropping a helper beside the data it helps with.
