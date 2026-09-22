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
| **Owns** | every file under `admin/pipeline/` |
| **Consumes** | `data/source/`, `data/print/`, `data/patches/`, `data/page-index/`, `data/schema/entry.schema.json` |
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
| M3 | The schema moves to `data/schema/`, with its test | a top-level `schema/`; the maintainer chose proximity to the entries it describes |
| M4 | The README's licence paragraph is rewritten as a per-tree provenance table. `data/` holds work from at least four origins, and the CC-BY-NC claim does not survive checking (§5.1) | one line claiming all of `data/` is CC-BY-NC |
| M5 | Generated reports are written to `docs/reports/`, via a declared path | `data/reports/` — they are human-read markdown, not data |
| M6 | `upstream-issues.md` and `sefaria-report.md` stay in `docs/` | moving them into the module; a cloner would not want Jastrow-specific findings |
| M7 | Nineteen dated specs are archived. One `admin/pipeline/DESIGN.md` states what is true today | keeping the pipeline specs and marking each live or retired — the contradictions between dated specs would survive |
| M8 | `docs/decisions.md` keeps only rulings still binding on the pipeline; the rest move to the archived copy | auditing all 157 rulings against the code first — rejected as too slow for the value |

## 4. What moves

### 4.1 Code and schema

| From | To | Note |
|---|---|---|
| `admin/pipeline/schema/` | `data/schema/` | `entry.schema.json` + `entry.schema.test.ts`; four import sites update |
| — | `admin/pipeline/paths.ts` | new; absorbs the 21 literals |

`test-tiers.test.ts` scans from the repo root (`cwd: '.'`, line 88), so
the schema test stays inside the unit tier wherever it lands. No tier
change.

### 4.2 Documents — the live set

Six files, and the archive.

| File | Content |
|---|---|
| `README.md` | what the repo is; the pipeline is the only module written; the provenance table (M4) |
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
code reads it. **Open — needs the maintainer's call** (§8).

Kept: `body-census-report.json` (read by `body/grammar.test.ts:58`),
`manifest.json` (21 sites), `lexicons.json`, `migration-report.json`.

## 5. The provenance table

`data/` holds work from at least four origins. The README's current
two sentences say all of `data/` is CC-BY-NC, which is wrong for the
scans, wrong for the schema, and **unsupported for the Sefaria text**.

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

### 5.2 The table

| Tree | Origin | Rights |
|---|---|---|
| `data/source/` | Sefaria MongoDB export of `lexicon_entry`, snapshot 2026-07-04 | **open** (§8) — Sefaria declares the 1903 text public domain; the lexicon collection declares nothing |
| `data/entries/`, `data/quarantine/` | derived from `data/source/` by this pipeline | follows `data/source/` |
| `data/print/hocr/` | Internet Archive / University of Toronto scans of Jastrow 1903; "the work is public domain, and neither item carries a licence or rights field" (`data/print/hocr/README.md`) | public domain |
| `data/page-index/` | built by this project from the hOCR | project's own work over a public-domain source |
| `data/schema/` | hand-authored by this project | MIT, with the rest of the code |
| `data/patches/` | corrections authored by this project, carrying Sefaria text | follows `data/source/` for the text; the correction records are this project's |

Until §8.1 is settled the README states what is **known** — Jastrow
1903 is public domain, the scans are public domain, the code and
schema are MIT — and attributes the digitization to Sefaria without
asserting a license on their behalf.

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
- It does not touch `data/entries/`, `data/patches/` or any other
  entry content.
- It does not re-open any ruling. M8 removes rulings from the live
  ledger; it does not reverse them.
- It does not audit the 157 rulings for truth against the code. That
  was offered and declined as too slow; a ruling archived under M8 is
  archived as *not binding on the pipeline*, not as *wrong*.
- It does not write the app, the admin tool, or `compile.ts`.

## 8. Open

Two, both for the maintainer, neither blocking the rest:

1. **What licence, if any, applies to `data/source/`.** §5.1 shows the
   repo's CC-BY-NC claim is unsourced and contradicted by Sefaria's
   own declaration for the 1903 text. The options are: state public
   domain and attribute Sefaria as the digitizer; ask Sefaria
   directly what they claim for the `lexicon_entry` collection; or
   take advice. Claude should not settle this, and the interim
   wording in §5.2 holds meanwhile.
2. **`edit-replay.jsonl`.** Admin-tool provenance with no reader.
   Archive it, or keep it as the admin tool's seed?

## 9. Verification

| # | Check | How |
|---|---|---|
| 1 | Behaviour unchanged | `bun qa` green; `bun data:import` produces byte-identical `data/entries/` |
| 2 | No upward imports | a test asserting every `from` under `admin/pipeline/` resolves inside it |
| 3 | The boundary is declared | no path literal for `data/`, `docs/` or `app/` outside `paths.ts` — asserted, like `test-tiers.test.ts` asserts the tier split |
| 4 | No live doc names a retired one | every link in the six live documents resolves |
| 5 | Reports regenerate in their new home | `bun data:import` writes `docs/reports/`, and `docs/v2/` is gone |

Checks 2 and 3 are new tests in the unit tier. They are what keeps
this from decaying: the module's independence becomes a thing `bun qa`
fails on, not a thing a document claims.
