# Glossary

The words this project uses for its data, commands, pipeline and
checks. When a document, a PR or a code comment needs one of these
ideas, it uses the word here.

- **Status:** started 2026-09-15 from the consolidation spec's rulings
  R8 and R9
  ([2026-09-13-pipeline-consolidation-design.md](specs/2026-09-13-pipeline-consolidation-design.md)).
- **Renames in progress:** older documents, code and scripts still say
  "truth" and "migrate". Step 10 of the spec's sequence sweeps them;
  until then the [retired terms](#retired-terms) table maps old to new.

## Data

| Term | Meaning | Where |
|---|---|---|
| **source data** | Sefaria's export of the dictionary: entries, lexicons and manifest, as `data:fetch` downloads it | `data/source/` |
| **snapshot** | the one version of the source data committed in the repo, the version the committed entry data was imported from | `data/source/` |
| **entry data** | one JSON file per dictionary entry. `data:import` makes it; people and the admin tool then edit it | `data/entries/<letter>/<rid>.json` |
| **compiled data** | entry data built into the files the web app loads | not built yet |
| **reference data** | our own lookup inputs that import reads alongside the source data. Today: the print page and column index. May grow | `data/page-index/` |
| **correction data** | our own per-entry fixes that import applies: patches and quarantine | `data/patches/`, `data/quarantine/` |
| **report** | evidence a run produces, not data: the import report, the blessing doc, build reports | see [The import run](#the-import-run) |

## Commands

| Name | What it does | Script today |
|---|---|---|
| **fetch** (`data:fetch`) | downloads the current Sefaria export into `data/source/` | `pipeline:fetch` |
| **import** (`data:import`) | turns source data, reference data and correction data into entry data, checks it, and writes a report | `pipeline:migrate` |
| **compile** (`data:compile`) | turns entry data into compiled data | not built |

The `data:` prefix groups the commands that move data from one form to
the next. Which other scripts join it (e.g. `pageindex:verify`) is
decided in the step-10 sweep.

## The import run

| Term | Meaning |
|---|---|
| **dry run** | the default import: checks and reports, and writes no entry data. It does rewrite the import report and the blessing doc |
| **write run** | an import with `--write`: writes entry data, then formats it with Biome. Refuses unless `data/entries/` is empty, and refuses if any gate is red |
| **`--strict`** | makes a run refuse on a stale pin or a patch whose precondition no longer holds, instead of reporting them. Right for the committed snapshot, wrong for a new export |
| **gate** | one of nine pass/total tallies import checks on every run: `bodyRoundTrips`, `headwordRoundTrip`, `textConservation`, `schema`, `chain`, `internalTargets`, `slugs`, `pages`, `composition` |
| **import report** | the structured result of a run: gate tallies, rule counts, patch outcomes, report rows. Not committed (`data/source/migration-report.json`) |
| **blessing doc** | the import report rendered for a person to read before accepting a run. Committed with the entry data it describes (`docs/v2/migration-blessing.md`) |
| **report row** | one finding in the report, shaped `{ rid, bucket, kind, severity, detail }`. `bucket` is `review` (a data judgment), `patch` (a patch to re-judge) or `pipeline` (a code fault) |
| **rule count** | how often one rule fired in a run, and on how many entries. *Composed*: each rule sees the text the rules before it left, so it can differ from the rule run alone |
| **fresh run** | an import where no hand edits exist in entry data yet, e.g. a new fork |
| **update run** | an import of a new export into entry data that people have edited. Not built yet; designed as a three-way merge of *base*, *ours* and *theirs* |
| **base / ours / theirs** | in an update run: entry data as import last wrote it / entry data now / import of the new export |
| **`writtenTree`** | the git tree id of `data/entries/` right after a write run, recorded so *base* can be recovered later. Planned, not built |
| **maintenance dry run** | a dry run against a freshly fetched export, compared with the last committed run, to see what a new export would change. Still open: how it is triggered, and what it compares against, since the import report is not committed and the blessing doc is |

## Pipeline code

Everything import runs is one of three **buckets**:

| Bucket | Meaning | Where |
|---|---|---|
| **rule** | general code that detects a defect and fixes it wherever it occurs | `admin/pipeline/transform/rules/` |
| **patch** | one entry's judged fix, applied only when its precondition holds | `data/patches/` |
| **review detector** | code that detects something a person must judge and emits a report row; fixes nothing | `admin/pipeline/migrate/` today |

| Term | Meaning |
|---|---|
| **registry** | the ordered list of rules; the order they run in (`transform/registry.ts`) |
| **repair pass** | a fix in `body/repairs.ts` that runs alongside the rules: `rejoin-chopped`, `implied-one`, `marker-reinsert`, `label-repair`, `binyan-cleanup`, `cite-wrap`, `refs-removal`. Counted in the report as `repairs:<name>` |
| **pattern** | a catalogued kind of defect in `data/patches/patterns.jsonl`, routed to `transform` (a rule handles it), `judgment` (per-entry patches) or `blocked` (no route yet) |
| **judgment class** | a pattern routed to `judgment`: no rule can decide it, so each entry needs a person's call |
| **commutation** | whether two rules give the same result in either order. A pair that doesn't must be declared, one of two ways below |
| **`entangledWith`** | a population collision: two patterns own the same records, so their rules must sit next to each other in the registry with nothing between. Declared in `patterns.jsonl` |
| **`ORDERED`** | a sequence dependency: one rule reads what another writes, so it must run after it. Declares a direction, not adjacency. Declared in `transform/registry.ts` |
| **research code** | one-time investigation tools that are none of the three buckets. Archived, not run |

## Patches

| Term | Meaning |
|---|---|
| **precondition** | what must be true before a patch applies: its target text (`expected_before`) occurs exactly `expected_occurrences` times |
| **tranche** | one batch of patches produced and reviewed together (`data/patches/tranches/<id>/`) |
| **stage** | the text a tranche was swept against. `pre-patch`: repaired text before any transform rule existed. `healed`: text after both text and structural repairs, the state patches apply against today |
| **accepted patch** | a `healed`-stage patch, the latest per entry |
| **carry-over patch** | a `pre-patch`-stage patch from `pilot/` or `tranche-01`. Applied after the accepted patches, unless an accepted patch already covers the same entry and target |
| **pin** | the snapshot hash a patch was written against. A **stale pin** names a different snapshot; it is counted in the report header, not refused (except under `--strict`) |
| **quarantine** | internal link targets that could not be resolved, listed for review rather than silently dropped. Empty today (`data/quarantine/internal-targets.json`) |

What a run reports for each patch:

| Outcome | Meaning |
|---|---|
| **applied** | precondition held; the fix landed |
| **superseded** | a carry-over patch whose target no longer occurs, read as a rule or repair having fixed it first. The report header counts these as *absorbed*. **Known gap:** on a new export, a carry-over target Sefaria rewrote also reads this way, so check before archiving (spec §4.2, §10) |
| **upstream-fixed** | Sefaria's text already reads the way the patch would leave it, exactly or by a class-specific equivalent. As built: the target is gone, the patch is single-occurrence, and the senses it would produce are present. Archive the patch |
| **upstream-changed** | the text differs from both the patch's before and after. A person re-judges it |

## Entries

| Term | Meaning |
|---|---|
| **rid** | Sefaria's permanent id for an entry (e.g. `A00077`); the entry's identity and print-order spine |
| **slug** | the entry's URL address, assigned once at import and then frozen; unique |
| **headword** | the word an entry is filed under, stored as a form object: `text`, plus optional `homograph`, `disambiguator`, `reconstructed` |
| **homograph** | Jastrow's printed Roman numeral separating same-spelled headwords |
| **disambiguator** | a superscript number Sefaria added to tell same-spelled headwords apart |
| **sense** | one meaning within an entry's definition |
| **page / column** | where the entry sits in the 1903 print edition, from the reference data |

## Tests and CI

| Term | Meaning |
|---|---|
| **unit tier** | every `*.test.ts`: fast (~2 s), run by `bun qa` and CI's **Test** job |
| **hand-written example test** | a test that feeds a rule a small fixed input and checks its output. Never reads the source data |
| **entry data validation** | the safeguard over every entry file: schema, file path, allowed tags, balanced markup, no markup in plain-text fields, unique slugs, internal link targets, page matches the page index both ways. Runs in the unit tier |
| **invariant check** | a test of rule *code* that needs the whole snapshot: commutation and registry order. After spec step 5, run locally before rule-code PRs; until then still in CI's Corpus Audit job |
| **corpus tier** | every `*.corpus.test.ts`. Being retired except the two invariant checks (spec step 5) |

## Retired terms

| Old | New |
|---|---|
| truth, truth tree | entry data |
| migrate, migration (the command and the run) | import |
| `pipeline:fetch` / `pipeline:migrate` / `pipeline:compile` | `data:fetch` / `data:import` / `data:compile` |
| migration report | import report |
| serving artifacts | compiled data |
| corpus (meaning the committed export) | snapshot |
| Rebuild CI job, Corpus Audit CI job | withdrawn 2026-09-15 (spec R9); still in CI until spec step 5 removes them |
