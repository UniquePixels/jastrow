# Glossary

The words this project uses for its data, commands, pipeline and
checks. When a document, a PR or a code comment needs one of these
ideas, it uses the word here.

For the *rulings* behind these words — every design decision, its
date, and what it drops — see [`decisions.md`](decisions.md).

- **Status:** started 2026-09-15 from the consolidation spec's rulings
  R8 and R9
  ([2026-09-13-pipeline-consolidation-design.md](archive/specs/2026-09-13-pipeline-consolidation-design.md)).
  Swept through the living documents and `package.json` in step 10
  (2026-09-19), and re-scoped to the import module on 2026-09-22 when
  `admin/pipeline/` became self-contained.
- **What still says the old words.** Code identifiers do: the entry
  point `admin/pipeline/migrate.ts`, the directory
  `admin/pipeline/migrate/`, the types `TruthEntry`, `TruthFile`,
  `TruthSense`, the helpers `validateTruth` and `loadTruthFiles`, and
  the generated `docs/reports/migration-blessing.md`. Renaming them is
  a change of its own, deliberately not folded into the terms sweep.
  `docs/archive/` — which took in the plans on 2026-09-21 and the
  dated design specs, the research documents and the retired patch
  records on 2026-09-22 — holds records of work as it happened, and
  they keep whatever they said at the time. The
  [retired terms](#retired-terms) table maps old to new throughout.

## Data

| Term | Meaning | Where |
|---|---|---|
| **source data** | Sefaria's export of the dictionary: entries, lexicons and manifest, as `data:fetch` downloads it | `data/source/` |
| **snapshot** | the one version of the source data committed in the repo, the version the committed entry data was imported from | `data/source/` |
| **entry data** | one JSON file per dictionary entry. `data:import` makes it; people and the admin tool then edit it | `data/entries/<letter>/<rid>.json` |
| **compiled data** | entry data built into the files the web app loads | not built yet |
| **reference data** | our own lookup inputs that import reads alongside the source data: the print page and column index. May grow | `data/page-index/` |
| **correction data** | our own per-entry fixes that import applies: patches and quarantine. The patch records moved inside the module on 2026-09-22; quarantine is still entry-adjacent data | `admin/pipeline/patch/records/`, `data/quarantine/` |
| **report** | evidence a run produces, not data: the import report, the blessing doc, build reports | see [The import run](#the-import-run) |

## Commands

| Name | What it does |
|---|---|
| **fetch** (`data:fetch`) | downloads the current Sefaria export into `data/source/` |
| **import** (`data:import`) | turns source data, reference data and correction data into entry data, checks it, and writes a report |
| **compile** (`data:compile`) | turns entry data into compiled data. Not built |

The `data:` prefix groups the commands that move data from one form to
the next, and only those. Step 10 gave it to `fetch` and `import` and
reserved it for `compile`; no other script took it. Every other script
keeps a prefix naming the module it runs — `headword:issues`,
`transform:count`, `transform:invariants` — or checks the repo (`qa`,
`qa:*`). `body:dry-run` and `pageindex:verify` left with the one-shot
tools they ran (2026-09-22); `patch:replay` left with `patch/apply-cli.ts`
the same day (Brian's ruling — see the retired terms below).

## The import run

| Term | Meaning |
|---|---|
| **dry run** | the default import: checks and reports, and writes no entry data. It does rewrite the import report and the blessing doc |
| **write run** | an import with `--write`: writes entry data, then formats it with Biome. Refuses unless `data/entries/` is empty, and refuses if any gate is red |
| **`--strict`** | makes a run refuse on a stale pin or a patch whose precondition no longer holds, instead of reporting them. Right for the committed snapshot, wrong for a new export |
| **gate** | one of nine pass/total tallies import checks on every run: `bodyRoundTrips`, `headwordRoundTrip`, `textConservation`, `schema`, `chain`, `internalTargets`, `names`, `pages`, `composition` |
| **import report** | the structured result of a run: gate tallies, rule counts, patch outcomes, report rows. Not committed (`data/source/migration-report.json`) |
| **blessing doc** | the import report rendered for a person to read before accepting a run. Committed with the entry data it describes (`docs/reports/migration-blessing.md`) |
| **report row** | one finding in the report, shaped `{ rid, bucket, kind, severity, detail }`. `bucket` is `review` (a data judgment), `patch` (a patch to re-judge) or `pipeline` (a code fault) |
| **rule count** | how often one rule fired in a run, and on how many entries. *Composed*: each rule sees the text the rules before it left, so it can differ from the rule run alone |
| **fresh run** | an import where no hand edits exist in entry data yet, e.g. a new fork |
| **update run** | an import of a new export into entry data that people have edited. Not built yet; designed as a three-way merge of *base*, *ours* and *theirs* |
| **base / ours / theirs** | in an update run: entry data as import last wrote it / entry data now / import of the new export |
| **`writtenTree`** | the git tree id of `data/entries/` right after a write run, recorded so *base* can be recovered later. Planned, not built |
| **maintenance dry run** | a dry run against a freshly fetched export, compared with a baseline, to see what a new export would change. Both the trigger and the baseline are undecided until designed (spec §3.3) |

## Pipeline code

Everything import runs is one of three **buckets**:

| Bucket | Meaning | Where |
|---|---|---|
| **rule** | general code that detects a defect and fixes it wherever it occurs | `admin/pipeline/transform/rules/` |
| **patch** | one entry's judged fix, applied only when its precondition holds | `admin/pipeline/patch/records/` |
| **review detector** | code that detects something a person must judge and emits a report row; fixes nothing | `admin/pipeline/migrate/detectors/`, registered in `detectors/classes.ts` |

| Term | Meaning |
|---|---|
| **registry** | the ordered list of rules; the order they run in (`transform/registry.ts`) |
| **repair pass** | a fix in `body/repairs.ts` that runs before the rules. One remains, `binyan-cleanup`, counted in the report as `repairs:binyan-cleanup`. The other six (`rejoin-chopped`, `implied-one`, `marker-reinsert`, `label-repair`, `cite-wrap`, `refs-removal`) were rid-keyed and became reviewed patches in consolidation step 8 |
| **pattern** | a catalogued kind of defect in `admin/pipeline/patch/records/patterns.jsonl`, routed to `transform` (a rule handles it), `judgment` (per-entry patches) or `blocked` (no route yet) |
| **judgment class** | a pattern routed to `judgment`: no rule can decide it, so each entry needs a person's call |
| **commutation** | whether two rules give the same result in either order. A pair that doesn't must be declared, one of two ways below |
| **`entangledWith`** | a population collision: two patterns own the same records, so their rules must sit next to each other in the registry with nothing between. Declared in `patterns.jsonl` |
| **`ORDERED`** | a sequence dependency: one rule reads what another writes, so it must run after it. Declares a direction, not adjacency. Declared in `transform/registry.ts` |

## Patches

| Term | Meaning |
|---|---|
| **precondition** | what must be true before a patch applies: its target text (`expected_before`) occurs exactly `expected_occurrences` times |
| **tranche** | one batch of patches produced and reviewed together (`admin/pipeline/patch/records/tranches/<id>/`) |
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
| **name** | the entry's URL address: its current headword, shaped the way Sefaria shapes its own — notation (`( ) ? ,`) dropped, the reconstructed `*` kept, the Roman numeral and superscript appended ([URL names spec](archive/specs/2026-09-21-url-names-design.md) §4, U2). Never stored; computed from `headwords[0]`, so it cannot drift from it |
| **sefariaHeadword** | Sefaria's own `headword` for the entry, byte for byte, on every entry file. Import is the only writer (U3). It is what a `sefaria.org` URL is looked up by after our headword is corrected |
| **former name** | a name the entry has published under and no longer holds; it redirects to the current one (U6). `formerNames` is in the schema and absent from every entry until publication |
| **headwords** | every form print sets on the entry's headword line, in its order, each a form object. `headwords[0]` is the PRIMARY: the name, the search key and every link derive from it. It replaced the `headword`/`altHeadwords` pair on 2026-09-21 ([`DESIGN.md`](../admin/pipeline/DESIGN.md) §2) |
| **form object** | one headword form, holding only MEANING: `text` (clean Hebrew), plus optional `homograph`, `disambiguator`, `reconstructed`, `gender` and `partial`. Everything print sets AROUND the forms lives in `display` |
| **display** | how print laid the headword line out: a template whose `{n}` inserts `headwords[n].text` and whose every other character is literal notation, never Hebrew. **Optional and never defaulted** — where the source cannot settle the layout the key is absent and the row is flagged ([`DESIGN.md`](../admin/pipeline/DESIGN.md) §2) |
| **partial** | a form shown exactly as printed that is never a lookup key: an ending after an ellipsis (`… טָה`), or a phrase holding an abbreviated word (`נְהַר פּ׳`). It applies only to a form with a sibling written out in full — an abbreviation that is an entry's ONLY name stays a key |
| **homograph** | Jastrow's printed Roman numeral separating same-spelled headwords. TWO OR MORE numerals beside one form are not its number: they are a reference to other entries, and the form carries none |
| **disambiguator** | a superscript number Sefaria added to tell same-spelled headwords apart |
| **schemaVersion** | the entry-file format version, on every file. `2` is the [`DESIGN.md`](../admin/pipeline/DESIGN.md) §2 shape |
| **sense** | one meaning within an entry's definition |
| **page / column** | where the entry sits in the 1903 print edition, from the reference data |

## Tests and CI

| Term | Meaning |
|---|---|
| **unit tier** | every `*.test.ts`: fast (~2 s), run by `bun qa` and CI's **Test** job |
| **hand-written example test** | a test that feeds a rule a small fixed input and checks its output. Never reads the source data |
| **entry data validation** | the safeguard over every entry file: schema, file path, allowed tags, balanced markup, no markup in plain-text fields, unique current names and unique `sefariaHeadword` ([URL names spec](archive/specs/2026-09-21-url-names-design.md) §5.2), internal link targets, page matches the page index both ways. Runs in the unit tier |
| **invariant check** | a test of rule *code* that needs the whole snapshot: commutation, and registry order's classes earned over the data. Run locally with `bun run transform:invariants` before rule-code PRs; not CI. Registry order's static assertions run in `bun qa` |
| **corpus tier** | retired by the consolidation spec's step 5. The only files still named `*.corpus.test.ts` are the two invariant checks, `transform/commutation.corpus.test.ts` and `transform/registry.order.corpus.test.ts` |

## Retired terms

| Old | New |
|---|---|
| slug (the entry's URL address, points stripped and numbered on collision), slug index, slug stem, bare-stem alias | **name** (computed from the headword) and **sefariaHeadword** — retired 2026-09-21 by the [URL names spec](archive/specs/2026-09-21-url-names-design.md) §7; `data/slug-index/` is gone and its README is archived at `docs/archive/slug-index-README.md` |
| `headword` / `altHeadwords` (the entry-file pair) | **`headwords[]`** with index 0 primary, plus an optional **`display`** — retired 2026-09-21 by [`DESIGN.md`](../admin/pipeline/DESIGN.md) §2 (the design it was ruled from is archived at [`archive/headword-design.md`](archive/headword-design.md)) |
| `headword-multiword` (review kind) | nothing: the line parser keeps a multi-word form as one form and says nothing about it ([`archive/headword-design.md`](archive/headword-design.md) §4) |
| truth, truth tree | entry data |
| migrate, migration (the command and the run) | import |
| `pipeline:fetch` / `pipeline:migrate` / `pipeline:compile` | `data:fetch` / `data:import` / `data:compile` |
| `research:apply`, then `pipeline:patches`, then `patch:replay` | nothing: deleted 2026-09-22 (Brian's ruling) — redundant with import's own patch preflight, and could not complete on the corpus, blocking on the ~600 `needs_*` escalations import deliberately defers |
| `body:dry-run`, `body/dry-run.ts` | **`body/trace.ts`** (the composition `migrate.ts` imports) and **`body/round-trip.ts`** (the verifier the gate calls) — the full-corpus CLI and `dry-run-report.ts` were archived at `refs/tags/archive/v2-research-2026-09` on 2026-09-22 |
| `pageindex:verify`, `page-index/verify.ts` | nothing: archived to the same tag on 2026-09-22; it compared a build against v1 `--prior` data the v2 tree no longer holds |
| `body/types.ts`, `body/compose.ts` | **`admin/pipeline/types.ts`** and **`admin/pipeline/compose.ts`** — the shared model and the orchestrator are not body-specific (2026-09-22, review Q9) |
| migration report | import report |
| truth file, truth tree entry | entry file |
| migration blessing | blessing doc (the file keeps the name `docs/reports/migration-blessing.md`, and its heading still reads "Migration blessing", until the code sweep: both are emitted by `migrate/report.ts`) |
| serving artifacts | compiled data |
| corpus (meaning the committed export) | snapshot |
| Rebuild CI job, Corpus Audit CI job | withdrawn 2026-09-15 (consolidation spec R9); removed from CI in its step 5 |
| research code (a fourth bucket beside rule, patch and review detector) | nothing: the one-time investigation tools were archived at `refs/tags/archive/v2-research-2026-09`, and every file import runs is now one of the three buckets |
| `docs/v2/`, `docs/specs/` | nothing: the live document set is [`README.md`](../README.md), [`admin/pipeline/README.md`](../admin/pipeline/README.md), [`admin/pipeline/DESIGN.md`](../admin/pipeline/DESIGN.md), [`decisions.md`](decisions.md), this glossary and [`ideas.md`](ideas.md). The dated specs and the research documents are in [`archive/`](archive/) (2026-09-22) |
