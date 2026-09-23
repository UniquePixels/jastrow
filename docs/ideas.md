# Ideas

Things to remember, not things decided. Nothing here is a commitment,
a specification or a ruling — rulings live in
[`decisions.md`](decisions.md), and the pipeline's design lives in
[`../admin/pipeline/DESIGN.md`](../admin/pipeline/DESIGN.md).

Add a row when something is worth not forgetting. Promote a row to an
issue when it becomes work. Delete a row when it stops mattering.

## Ideas

| Added | Idea | Notes |
|---|---|---|
| 2026-07-04 | Notification system | Notify users of updates, new features, etc. Likely ties into the service-worker update flow once the app exists. |
| 2026-07-04 | About system | Basic info about the app and its features. |
| 2026-07-08 | Search overhaul | v1's search is "not cutting it." Explore client-side vs. enhanced online search; the schema already stores clean typed forms (headwords, alts, pointers, typed cites), so nothing is foreclosed. |
| 2026-07-04 | Admin tool runs the pipeline | Admin tool as the interface for pipeline runs too (CLI stays fine). `fetch.ts` still has no `import.meta.main` guard or exported `runFetch(options, onProgress)` — checked 2026-09-22, still absent. |
| 2026-08-05 | Notes mechanism for intentional print deviations | A notes field anchored to a text location, shown with an icon and popover, only for deliberate deviations from the printed text (e.g. the 39 implied-1 inserts) — never for import-error repairs. Needs its own schema + admin-tool + renderer design. |
| 2026-08-05 | Refresh `sefaria-report.md` before filing | Fold in register #16–17, review-doc decisions and regenerated census counts before sending it to Sefaria. |
| 2026-08-05 | Sefaria search link per headword | Link each headword to Sefaria's search, e.g. `sefaria.org/search?q=<headword>&tab=text&...`; decide later whether to keep the Talmud path filter or search all texts. Pure client-side URL construction. |
| 2026-08-06 | Abbreviation display toggle | User setting: show abbreviations as printed or expanded. Depends on abbreviations being identifiable in the markup. |
| 2026-07-13 | Mis-targeted internal links — dedicated brainstorm | A01350's link to the wrong target was found by eye; systematic detection needs text↔target semantic comparison (naive string match drowns in false positives). Big enough to deserve its own session. |
| 2026-08-07 | Joint/def-less binyan sections — model + UX | D00807 shape: one stem's definition is shared by the next binyan's header line. Needs a census of how many entries have this shape, then a schema home and a display treatment. |
| 2026-08-07 | Polytonic Greek/Latin font coverage | Jastrow cites Greek/Latin etyma with breathing marks and accents (e.g. I00466, C00860). Census the population when designing the font stack; add to the golden-file regression set. |
| 2026-08-07 | Bidi/RTL rendering correctness | The current app renders Hebrew out of order in places (e.g. H01701); the data bytes are correct, it's a renderer issue. Add explicit bidi test cases to the golden-file regression set for the future renderer. |
| 2026-08-24 | Candidate rows can go invisible to `coverage()` | `transform/registry.ts`'s `PENDING` list is now empty (checked 2026-09-22) — the risk this row warned about has arrived. Six measured candidates from the archived `docs/archive/phase-2-triage.md` (55 `ib.` siblings, `homograph-numeral-iv-default` 40/37, geresh arms 1/2/5) are not registered rules and not in `patterns.jsonl`, so `coverage()` reads that work as closed while they sit only in an archived document. Needs either untriaged catalogue rows or a gate that fails on this state. |

## Open questions

Decisions not yet taken. Carried out of the dated specs now in
[`docs/archive/specs/`](archive/specs/), the headword design document's
own §5–§6, and the decisions ledger's former "decided but not reflected
in code" section — this file is their only live home now that all three
sources are archived or pruned. A handful of the extracted questions
are not listed below because `docs/decisions.md` or
`admin/pipeline/DESIGN.md` had since answered them; those two are
where a reader can check.

| Topic | Question | Notes |
|---|---|---|
| Headwords | Lost per-form gender labels | `content.morphology`'s `'f.'` is wrong about a masculine headword on 21 of 22 `gender-pair-headword-line-collapse` entries, plus U01000. Leave it, clear it, or write an `allows: ['m.']` rule — none taken. Not a go-live blocker. |
| Headwords | Parenthesis placement is unverified against print | ~580 entries carry parentheses whose grouping has not been checked against the hOCR/print. Only what the source shows is recorded meanwhile. |
| Headwords | A02823 / M02007: is the trailing numeral the entry's own? | Unresolved even though A02823's placement was separately patched — the numeral question itself was never ruled. |
| Headwords | Rows needing text moved into the gloss | A01175, A01345 (the `= Y` shape) and V00518 need text relocated into the gloss field; no patch op expresses that shape yet. Waits on the unbuilt "update run" (see `decisions.md` "09-21 admin edits"). |
| Headwords | Split-headword rows needing the print's own spelling | S01780 and U00489 — U00489 can't even be rejoined by concatenation, the result collides with an existing headword. |
| Headwords | "Optional prefix in parentheses" shape | U01971, K01196, Q00053 — the prefix-side twin of A01480, noticed during the headword-design walkthrough but never ruled. Probably wants its own issue rather than a parking-lot row. |
| Schema | `grammar.pos` | Still declared in the schema, still has no producer, still absent from every entry — confirmed live and unbuilt in `admin/pipeline/DESIGN.md` as of 2026-09-22. |
| Schema | Enum tightening | Still pending. `gender` still allows `"c"`, `number` still allows `"du"`; `page.column` and `grammar.pos` remain optional — confirmed against `data/schema/entry.schema.json` 2026-09-22. |
| Schema | Three unenforced entry-schema invariants | No conditional rejects a partial first headword (`headwords[0].partial`); nothing stops entry-level `grammar.gender` coexisting with a per-form `gender`; `display` template token indices are not bounds-checked against the headword count. From a pre-PR review of `data/schema/entry.schema.json`, flagged as pre-existing on a file the review found only because a rename made the tool read it as changed. |
| Schema | Closed enum for `stems[].stem` | Still pending — the field is still free text (`"type": "string"`), confirmed 2026-09-22. |
| Transform rules | How many transform rows are still unaudited | `transform/markup.ts`'s docstring still says "13 of 80 when this was written" as of 2026-09-22; whether that residual is now zero is a catalogue question, not a code one. |
| Transform rules | Should inserted spaces get a dedicated `inserts` field? | `copied` currently carries Class-B inserted spaces too — "a mechanical fit with a semantic stretch." |
| Transform rules | Re-derivation lives in the test tier, but the re-fetch rule says a source re-fetch should re-baseline and never break the pipeline | A standing, acknowledged inconsistency between two rulings; neither resolves it. |
| Transform rules | How two catalogue rows register as one rule | Answered implicitly (the second row gets its own rule id) but the resolution is written down nowhere. |
| Judgment rows | `stem-label-not-a-binyan-name` (66 members, 4 sub-shapes) | Sub-shape (a) is a genuine schema gap — no home for a stem section with no label and a reconstructed form; sub-shape (b) has an unresolved collision check. Deferred, not resolved; candidate for its own issue. |
| Judgment rows | `chopped-marker-with-residue` (10 members) | Needs a per-entry delete-vs-move ruling with no measured predicate separating the two. Deferred until sense-level addressing or admin-tool hand editing arrives. |
| Judgment rows | Child-sense stem-head hoist | Nothing measured the effect on `rejoinGlossHead` or sense order; the population later recounted to zero, so the question was mooted rather than answered. |
| Link-target gate | Case 7's "which sibling" / "head uncited" gaps | The gate can check that a cited anchor carries `from`, but not whether it's the sibling the rule should have read. |
| Link-target gate | Case 10's blind spot | A rule that unlinks one anaphor and mints another nets to zero on the anchor-count invariant; closing it needs anchor identity reconciliation. |
| Link-target gate | The never-linked address family | `Y. <tractate>`, Tanhuma, Sifra, Pesikta d'Rav Kahana — 893+ occurrences case 10 deliberately doesn't cover. Needs the deferral answered plus a Sefaria index under `data/`. |
| Link-target gate | `Ibid.`/`ibid.` (17 occurrences) | Excluded from case 10 as unsized. No sizing done, no new case written. |
| Patches | May an agent patch remove bytes? | The ruling read literally forbids the 4 `delete segment` patches already in the corpus (A01873, A01115, A01406, A00515 — none in `reviewed/`, all in tranche batches); `no-new-text.ts` enforces only the add half today, so removal is permitted in code. |
| Patches | The carry-over zero-match gap | On a new export, an upstream rewrite of a carry-over target reads as 0 resolutions exactly like an already-absorbed one — the two cases can't be told apart. |
| Patches | Rid renumbering safety | If Sefaria renumbers rids in a future export, the (still unbuilt) update run needs a check that refuses a bulk rid → headword shift. |
| Process | The maintenance dry run's trigger | A scheduled run would execute import in automation, conflicting with R9 (CI never runs import). No such scheduled run exists yet. |
| Process | The maintenance dry run's baseline | Which committed artifact a result compares against — the candidate set has grown now that `migration-blessing.md` and `review-report.md` are both committed. |
| Process | Should the publication gate be code, not process? | `admin/pipeline/DESIGN.md` still calls it a process rule that nothing in code checks — confirmed 2026-09-22. |
| Out of pipeline scope | Bare-letter route: alternate headword or only primary? | An app/compile question; no code answers it today. |
| Out of pipeline scope | Does a Sefaria-URL route keep serving an old name after a rename? | Stated default is no; not implemented either way. |
| Out of pipeline scope | G00740/G00741 page placement | Flagged "print check when convenient, not scheduled." Still unresolved. |
| Decided, unbuilt | Pointer entries | Curated finding aids at `data/pointers/<id>.json`; alt headwords get no pointer, their browse position derives at compile. Needs `compile.ts`. |
| Decided, unbuilt | A CI schema gate | A committed JSON Schema enforced by `bun validate` on every PR. Today entry validation runs only in the unit tier, not as a CI gate. |
| Decided, unbuilt | Compile decides everything | Every link, abbreviation and ordering decision made once at compile and tested in CI; the client never decides. Needs `compile.ts`. |
| Decided, unbuilt | Browse ordering at compile | Alt rows placed by a collation rule at compile, never a client sort. |
| Decided, unbuilt | Abbreviation detection at compile | Abbreviations stay untagged in entry data; detection runs at compile against an abbreviation list, with override tags where the detector is provably wrong. |
| Decided, unbuilt | The source-byte fallback | A failing entry is emitted from source bytes with a review row rather than dropped, instead of the import halting. No emit path exists in `migrate.ts` today. |
| Decided, unbuilt | Close the three `DEFERRED` rids | D00470, K00081 and R00519 are still `needs_human_judgment` in `admin/pipeline/patch/records/reviewed/manifest.jsonl`. |
| Decided, unbuilt | URL routes, the rename flow and the published-names ledger | Three routes (bare letters, our name, a Sefaria URL), the admin tool's rename flow, compile's route map, and a published-names ledger with its own gates. `formerNames` is in the schema and nothing writes it. Large scope; candidate for its own issue rather than one row. |
