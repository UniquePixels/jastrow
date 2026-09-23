> **Archived 2026-09-22 — the full ledger, verbatim.**
>
> This is `docs/decisions.md` exactly as it stood at commit `9ec15d66a`,
> all 208 table rows, before the pruning of 2026-09-22. Nothing below
> has been edited: no row was reworded, reordered, renumbered or
> re-stated, and no status was changed. The banner is the only addition.
>
> The live ledger at [`../decisions.md`](../decisions.md) now keeps only
> the rulings that still bind the pipeline — a ruling whose load-bearing
> noun still greps to a file under `admin/pipeline/`, a path under
> `data/`, or one of the six live documents. **A row removed from the
> live file was removed as _not binding_, not as _wrong_.** Nothing was
> reversed in that change; rows were only moved. This copy is where a
> reader comes to see what a ruling said, and to diff the two files and
> see exactly what left.
>
> Links below are written relative to `docs/`, so from here they resolve
> one directory up (`archive/…` → `../archive/…`, `specs/…` →
> `../specs/…`). They are left untouched, because rewriting them would
> break the verbatim guarantee.

# Decisions — every ruling, and what it cost

One index of every design ruling taken on this project. It exists
because the rulings were recorded in eleven different id schemes across
specs, rule modules, plan documents and code docstrings, and could not
be read as one list ([#104](https://github.com/UniquePixels/jastrow/issues/104)).

**A new ruling is a row here first.** Then it goes in its spec. The
index points at the specs; the specs do not point back at every row.

## How to read a row

| Column | Means |
|---|---|
| **id** | the ruling's label in its own scheme. Schemes do not share a namespace — see [§B](#b-the-same-ruling-in-two-places-with-two-wordings) for the one id that collides |
| **date** | when the ruling was taken, not when it was written down |
| **decision** | one line. The home has the argument |
| **drops** | what data or signal the ruling gives up. `nothing identified` means a reading of the source found no cost. `unstated` means the source never said and it could not be told from the ruling alone |
| **home** | where the ruling is recorded. Every path below was checked to exist |
| **status** | `live` · `amended → X` · `superseded → X` · `not in code` (decided, nothing implements it) · `contradicted by code` · `historical` (spent; kept for the record) |

Verified against the tree at `origin/v2` on 2026-09-21.

---

## 1. V — v2 overhaul (2026-07-03)

Home: [`specs/2026-07-03-v2-overhaul-design.md`](specs/2026-07-03-v2-overhaul-design.md)

| id | date | decision | drops | home | status |
|---|---|---|---|---|---|
| V1 | 2026-07-03 | Rebuild the data from the true Sefaria source with a scripted, re-runnable pipeline. Supersedes v1's D3 ("the pipeline is a one-time relic, never re-run") | v1's 22,164 mined edits stop being a live layer — they survive as a replay and cross-check set only. v1's pipeline behaviour is not reproduced, by design | §3 | live |
| V2 | 2026-07-03 | `v2` is a long-lived integration branch off `main`; feature branches PR into it with `main`-level rigor | nothing identified | §3 | live |
| V3 | 2026-07-03 | Subtractive start — the first PRs delete the v1 app files but keep the rails. No orphan branch | on-branch access to v1 data and validators. Phase 1 tools read them through `git show origin/main:…` | §3 | historical (done) |
| V4 | 2026-07-03 | New code is written at its final paths from day one; no `v2/` subdirectory | nothing identified | §3 | amended → 2026-07-04 (`app/`, `admin/`, `data/`; `data/` holds no code) |
| V5 | 2026-07-03 | `data/` stays on `v2` until edit-mining and the divergence audit finish | — | §3 | superseded → CP-0 ratification 2026-07-04 (`data/`, `scripts/` and `ci-data.yml` removed outright) |
| V6 | 2026-07-03 | Schema v2 gets its own spec and its own review gate (CP-2a), not a buried implementation PR | nothing identified | §3 | live — but CP-2a was never recorded in the §7 changelog |
| V7 | 2026-07-03 | Every PR is reviewed, and no phase begins until the maintainer explicitly passes the previous checkpoint | throughput | §3, §5 | contradicted by code: only CP-0 and CP-1 appear in the §7 changelog; CP-2a onward were never minuted |
| V8 | 2026-07-04 | Data-edit freeze on `main` once Phase 1 starts; urgent corrections must be logged for a second mining pass at cutover | free correction of the deployed v1 data. Nothing records whether any urgent correction was in fact logged | §3, §7 | live |
| V9 | 2026-07-03 | `main` is merged into `v2` weekly to prevent drift | nothing identified | §3 | contradicted by code: no merge from `main` into `v2` since `v2` began (last one `78cea76d`, 2026-03-31) |
| CP-0 | 2026-07-04 | Rails verified live; V2/V3/V4 reconfirmed; V5 superseded. Accepted gap: no data-validation or size-guard CI on `v2` | the accepted gap is the cost, and it is still open — see D10 | §7 | historical |
| CP-1 | 2026-07-10 | The fresh-source restart is confirmed. Both v1 correction sets roll into live data **after** the pipeline is complete | nothing at the time | §7 | amended → 2026-09-06 (the 289 print-locator fixes became a cross-check against the hOCR index, not a carryover to apply) |

## 2. D — data architecture (2026-07-08)

Home: [`specs/2026-07-08-v2-data-architecture-design.md`](specs/2026-07-08-v2-data-architecture-design.md)

| id | date | decision | drops | home | status |
|---|---|---|---|---|---|
| D1 | 2026-07-08 | Three layers: source (committed), entry data (committed, edited), compiled (never committed) | the compiled layer is never reviewable in a PR diff; comparing two deploys means rebuilding both | §1 | live |
| D2 | 2026-07-08 | No intermediate artifacts in git — anything derivable is regenerated on demand | the run-to-run diff of any report. A report that is not committed cannot be differenced | §1 | contradicted by code: `data/page-index/build-report.json` is committed |
| D3 | 2026-07-08 | Transform once — entry data is a purpose-built schema, not kept Sefaria-shaped | field-by-field mechanical comparison with the export. A future upstream re-import is a code change, not a merge | §1 | live |
| D4 | 2026-07-08 | One JSON file per entry under `data/entries/<letter>/<rid>.json` | streaming or grepping the corpus as one file; ~32.5k files is the price of a readable diff | §2.1 | live |
| D5 | 2026-07-08 | The entry schema as given (id, headword, altHeadwords, page, grammar, senses) | nothing at this level; the field-level drops are B7 and B8 | §2.2 | amended → B-series (2026-08-05 fold-in) |
| D6 | 2026-07-08 | Definitions are semantic tagged strings over a closed, pipeline-validated vocabulary. Markdown and a JSON AST both rejected | every distinction the six tags cannot carry. `<i>` stays typographic, so gloss-italic, emphasis-italic and Latin-term-italic are one thing until an editor separates them | §2.3 | live |
| D7 | 2026-07-08 | External references are stored as canonical Sefaria ref strings; URLs are derived at compile | which of Sefaria's two spellings the source actually used at that site | §2.3 | live |
| D8 | 2026-07-08 | No deeper-than-entry addressing. All 90,688 internal targets address an entry | the source's sense suffix, discarded as URL boilerplate (it is uniformly `1`). A link cannot point at a sense | §2.3 | live |
| D9 | 2026-07-08 | Pointer entries (`data/pointers/<id>.json`) are curated finding aids. Alt headwords get **no** pointer record — their browse rows derive at compile | an alt's browse position has no stored truth; a wrongly placed alt row needs a hand-set anchor override | §2.4 | not in code: no `data/pointers/`, and `compile.ts` is unwritten |
| D10 | 2026-07-08 | A committed JSON Schema enforced by `bun validate` in CI on every PR; additive-first evolution; no bulk pass runs unblessed | nothing by design | §2.5 | contradicted by code: no `validate` script in `package.json`. Entry-data validation runs inside the unit test tier (`bun qa:test`), not as a CI schema gate — the gap CP-0 accepted |
| D11 | 2026-07-08 | Every decision — link, abbreviation, order — is made once at compile and tested in CI. The client never decides | a wrong abbreviation or link needs a rebuild and a deploy, not a data edit | §3 | not in code: `compile.ts` is unwritten |
| D12 | 2026-07-08 | rid is the permanent internal address; slug is the human address, stored in entry data and frozen at import. A bare ambiguous word lands on a disambiguation page | — | §4 | superseded → U2/U6 (2026-09-21); pointer in place at §4 and at the §5 stage list |
| D13 | 2026-07-08 | rid is the order spine. Alt rows are placed by a collation rule at compile; ordering is a compile step, never a client sort | alt rows have no print truth for their position — "where a scanning reader looks" is the whole warrant | §5 | not in code (compile half); the rid spine is live |
| D14 | 2026-07-08 | `migrate.ts` writes the truth tree once, gets blessed, then retires; `compile.ts` runs forever | — | §6 | superseded → R1 (2026-09-13); struck in the spec 2026-09-14, but the guard still runs — see [§C](#c-reversed-but-still-cited-as-live) |
| D15 | 2026-07-08 | Abbreviations are not tagged in entry data; detection runs at compile against the abbreviation list, with override tags where the detector is provably wrong | per-instance editorial control, except through an override tag. A detector miss is invisible in the data — only the coverage report sees it | §8 | not in code: `compile.ts` is unwritten |

## 3. B — entry body model (2026-07-11)

Home: [`specs/2026-07-11-entry-body-model-design.md`](specs/2026-07-11-entry-body-model-design.md)

| id | date | decision | drops | home | status |
|---|---|---|---|---|---|
| B1 | 2026-07-11 | Design the ideal form first, then map the source onto it. Sefaria's fields are inputs, never the shape | nothing identified (a method) | §1 | live |
| B2/B3 | 2026-07-11 | Structure only what is addressed or indexed. Everything else stays tagged prose; upstream's separate fields rejoin the gloss, typed access comes from index fields | typed access to everything left in prose: the gender marker, the etymology parenthesis, construct and plural-form phrases, bracketed archaic senses. They are text-searchable only | §1, §2 | live |
| B4 | 2026-07-11 | Citation units are segmented once at import by a conservative terminator rule; a wrong boundary is a per-entry hand fix | the option of re-segmenting globally. A rule change later means re-deciding 32.5k entries, so in practice boundaries are frozen at import | §4 | live |
| B5 | 2026-07-11 | Lettered `a)…b)…` runs split into child senses, before unit segmentation. Extended 2026-08-05 to three italic marker shapes | where the rule declines, the run stays unsplit inside the parent gloss — a stated fallback, not a flagged one | §3, changelog | live |
| B6 | 2026-07-11 | `label` is normalized; print punctuation must regenerate byte-exact, else the entry is quarantined | the entry, until a person handles it. Quarantine is the cost and it is deliberate | §2.2 | live |
| B7 | 2026-07-11 | `refs` is dropped from entry data; the reference index derives from `<cite>` tags at compile | Sefaria's 12.1% same-book expansions, and the 29 items with no inline basis — 21 gershayim and 5 ibid were repaired by hand, 3 (D00541, Q00890, M01355) remain unexplained | §5 | live (derivation half is `not in code` — `compile.ts` unwritten) |
| B8 | 2026-07-11 | `quotes` is dropped entirely — a vestigial importer artifact nothing consumes | 324 extracted phrases as structured data. 8 of them do not provably locate in their own entry body, so those 8 have no successor at all | §6 | live |
| B9 | 2026-07-11 | Every parse rule is censused and fixtured against enumerated edge classes before it runs; anything unprovable goes to eyes-on review | throughput. Nothing else identified | §7 | live |
| B10 | 2026-07-11 | `<ref rid>` and `<cite ref>` merge into one `<cite ref="…">` tag | the tag-level distinction between an internal cross-reference and an external citation. Validation has to dispatch on the rid pattern instead | §2, §8 | live |
| B11 | 2026-07-11 | The entry format ships as a machine-readable JSON Schema, which **is** the spec; the documents only illustrate | nothing identified | §8 | live (`admin/pipeline/schema/entry.schema.json`) |
| B12 | 2026-07-13 | `—<marker> <form> 1)…` form sections are separate lemma-level sense sets, split into a sibling sense. Extended 2026-07-14 from `Pl.` to `Part. pass.`, `Fem.`, `Denom.` | the convention is recorded only where its own numbering proves it — 13 entries. Plain marker prose without a restarted run stays inline, so an unnumbered form section is indistinguishable from a sense tail | §2.2, changelog | live |

## 4. S — sense structure repair (2026-08-06)

Home: [`archive/specs/2026-08-06-sense-structure-repair-design.md`](archive/specs/2026-08-06-sense-structure-repair-design.md) (archived 2026-09-21)

| id | date | decision | drops | home | status |
|---|---|---|---|---|---|
| S1 | 2026-08-06 | A rid-keyed swallowed-sense splitter, running after the text passes, with a byte round-trip **and** a 1..n structural assertion | corpus-wide coverage: the splitter is rid-scoped to reviewed entries, so an unreviewed swallowed marker stays swallowed | §3.1 | superseded → consolidation step 8 (S1/S2 became reviewed patches; the `repairs.ts` tables were deleted) |
| S2 | 2026-08-06 | The same rule where the host sense list is a stem's children | same as S1 | §3.2 | superseded → consolidation step 8 |
| S3 | 2026-08-06 | The ~78 implied-`1)` candidates become a generated eyes-on review doc; the census is committed as a literal rid list in code | a general implied-`1)` detector beyond the census was declared future work and never built | §3.3 | historical |
| S4 | 2026-08-06 | The three `DEFERRED` rows (D00470, K00081, R00519) each get a maintainer decision; `DEFERRED` must be empty when the work closes | — | §3.4 | not in code: 3 rids are still `needs_human_judgment` in `data/patches/reviewed/manifest.jsonl` |
| S5 | 2026-08-06 | The completeness gate is a set of exact rid-list equalities, not coverage checks, against a committed pre-change manifest | — | §3.5 | superseded → consolidation step 5 (the corpus tier S5 ran in was retired) |
| S6 | 2026-08-06 | `CONFIRMED_NO_CHANGE` is retired. Buckets are `SPLIT`, `SIGNED_EXCEPTION`, `REJECTED` + the edit maps. "No change" without a reason is no longer representable | nothing identified — it recovers a signal rather than dropping one | §3.6 | live (the name survives as history in the consolidation spec §4.1 and the reviewed README, both now flagged) |
| S7 | 2026-08-06 | Three follow-ups become GitHub issues rather than prose: ibid linking (#37), a `notes` mechanism (#38), CP-1 carryovers (#39) | nothing identified | §3.7 | live (#39's page-locator half superseded 2026-09-06) |

## 5. RP — research process (2026-08-10)

Home: [`archive/specs/2026-08-10-research-process-design.md`](archive/specs/2026-08-10-research-process-design.md) (archived 2026-09-21; §4.3 and §4.4 are still the live design)

| id | date | decision | drops | home | status |
|---|---|---|---|---|---|
| RP1 | 2026-08-10 | Execution in tranches gated on plan usage; the Batch API is the fallback | wall-clock: the sweep runs at the cadence the usage window allows | §3 | historical (the sweep ran and stopped) |
| RP2 | 2026-08-10 | Sonnet for sweep agents, Opus as the escalation tier | recall at the sweep tier, traded for cost | §3 | superseded → T4 (2026-08-17: the discovery tier is Opus) |
| RP3 | 2026-08-10 | ~20–40 entries per agent chunk, to avoid long-context degradation | cross-entry patterns within a chunk boundary — the synthesis pass exists to recover them | §3 | historical |
| RP4 | 2026-08-10 | Agents may rearrange, re-tag, split or delete existing text — **never generate new words**. Anything else is automatically `needs_print_check` | every repair that needs a byte the entry does not hold. That is what produced the 704 residue escalations | §3 | live (mechanised in `patch/no-new-text.ts`; wording collides — see [§B](#b-the-same-ruling-in-two-places-with-two-wordings)) |
| RP5 | 2026-08-10 | Semantic patches keyed by rid + a stable target with `expected_before`, not line diffs | any repair the op vocabulary cannot express. Five headword rows are stuck on exactly this — moving text into a gloss has no op ([#113](https://github.com/UniquePixels/jastrow/issues/113)) | §3, §4.3 | live |
| RP6 | 2026-08-10 | Agents never fetch or OCR the print in pass 1 — they log and escalate | the print as evidence at the point of decision, so everything print-dependent escalates instead of resolving | §3 | live |
| RP7 | 2026-08-10 | Every patch records the source snapshot hash; git history is the version store, since Sefaria exposes no historical snapshots | nothing identified | §3 | live |
| RP8 | 2026-08-13 | The paused doc-08 implied-`1)` rows fold into the sweep; the 53 decided rows and the deferred-row resolutions carry into prompt v1 | nothing identified | §8, [`archive/body-review/08-implied-one-candidates.md`](archive/body-review/08-implied-one-candidates.md) | historical |

## 6. T — sweep tiering (2026-08-17)

Home: [`archive/specs/2026-08-17-sweep-tiering-design.md`](archive/specs/2026-08-17-sweep-tiering-design.md) (archived 2026-09-21; T5 and T6 are still live)

| id | date | decision | drops | home | status |
|---|---|---|---|---|---|
| T1 | 2026-08-17 | The per-batch catchable-miss-rate gate is retired. Batches are gated on pattern saturation | **the only measurement of sweep recall.** Saturation says the catalogue stopped growing; it does not say what was missed | §3 | live |
| T2 | 2026-08-17 | The substantive patch-error gate (≤5%) stays | nothing identified | §3 | live |
| T3 | 2026-08-17 | Discovery sampling is stratified across all 22 rid letters | nothing identified — it recovers coverage (everything swept to date sat inside letter A) | §3 | historical (discovery stopped; 128 chunks were never dispatched) |
| T4 | 2026-08-17 | The discovery tier is Opus | cost | §3 | historical |
| T5 | 2026-08-17 | A pattern with a corpus-wide count and no per-entry judgment becomes a deterministic transform, never an LLM task | per-entry nuance inside such a pattern: the transform applies one rule to every occurrence | §3 | live — cited as the definition of `PatternRoute` in [`../admin/pipeline/patch/patterns.ts`](../admin/pipeline/patch/patterns.ts) |
| T6 | 2026-08-17 | Blocking = breaks the render **or** would be baked in by the transform. Everything else defers to post-launch | every defect that is real, visible and neither of those two things. It ships | §3 | live — cited as the definition of `blocking` in `patterns.ts`; reaffirmed 2026-09-20 ("T6 is the test, and only T6") |
| T7 | 2026-08-17 | Batch 02 round 2 is accepted and committed under T1, with its breach recorded | nothing identified | §3 | historical |

## 7. Dated transform-era and process rulings (2026-08-11 → 2026-09-20)

The `RULING (Brian, <date>)` scheme, plus dated decisions in plan
documents. Ordered by date.

| id | date | decision | drops | home | status |
|---|---|---|---|---|---|
| 08-11 OCR correction | 2026-08-11 | Correcting an obvious OCR error is *correction*, not adding text. The closed-grammar marker allowance on `replace` is that ruling in code | the gate can no longer tell an OCR fix from a composition, within the closed grammar `N)` / `—N)`. Held there deliberately so it cannot widen | [`../admin/pipeline/patch/no-new-text.ts`](../admin/pipeline/patch/no-new-text.ts) lines 21–26 | live |
| 08-15 cadence | 2026-08-15 | Per-batch escalation review is waived; all `needs_*` rows accumulate into one consolidated report at the end of the sweep | the per-batch signal that the escalation queue is drifting. Batch-01 sampling was the only calibration | [`../data/patches/reviewed/README.md`](../data/patches/reviewed/README.md) | live (lifted from the archived RUNBOOK) |
| 08-15 triage | 2026-08-15 | Every escalation defaults to `post-go-live`; `blocking` is a per-item override applied during the consolidated review | the default ships every escalation. Nothing blocks until someone overrides it item by item | `reviewed/README.md` | live |
| 08-15 wrong-reference | 2026-08-15 | OCR-level reference errors are fixed and relinked; print-level bad references are delinked with an apparatus note; pure linker overreach is delinked **silently** | the silently-delinked class leaves no record that Sefaria ever had a link there | `reviewed/README.md` | live |
| 08-21 house style | 2026-08-21 | All labels take the period inside the italic. The repair direction is kept; its warrant becomes house style, not corpus frequency | the print's own variation between the two forms. Both rendered byte-identically, so nothing is recoverable from the data afterwards. Re-scoped 608 → 945 entries | [`archive/discovery-round-4.md`](archive/discovery-round-4.md) | live |
| 08-22 inference | 2026-08-22 | Inference is not transformation: `abbrev-in-alt-headwords` (2,035 entries) reclassifies to `judgment` after its transform was written and matched | 2,035 entries' abbreviated alternates stay unexpanded and are not search keys. The "65.5% resolvable" figure measured consonant uniqueness, not correct pointing | [`specs/2026-08-22-transform-module-design.md`](specs/2026-08-22-transform-module-design.md) §5.2 | live |
| 08-22 `copied` | 2026-08-22 | A rule that duplicates text from elsewhere in the same entry declares what it copied; the gate verifies against the input | **any defect whose surplus is a sub-multiset of the declared copy is invisible by construction.** Measured: a doubled combining mark malformed 1,148 entries and the gate flagged zero | transform-module §5.1 | live |
| 08-23 ib-yoma-2a | 2026-08-23 | Settled, no change wanted | nothing identified | [`archive/catalogue-audit/ib-yoma-2a.md`](archive/catalogue-audit/ib-yoma-2a.md) | historical |
| 08-23 case 4 | 2026-08-23 | **Recombination** is a legitimate link-target case: a prefix of one input target joined to a suffix of another, both declared through `TransformResult.recombined`, with no character from anywhere else and no gap between the halves | case 3's evidence test (the remainder must appear in the anchor's *display*) is bypassed. That test can never pass for a Sefaria locus — Jastrow writes `Deut. VI, 22` where Sefaria writes `6:22` — so case 4 accepts an address no display corroborates | [`../admin/pipeline/transform/link-target.ts`](../admin/pipeline/transform/link-target.ts) line 32; `registry.ts` line 600; `rules/anaphora.ts` lines 266, 805 | live |
| 08-23 loud on drift | 2026-08-23 | An enumerated exception may live inside a transform rule, **but it must be loud on drift** — the same standing `repairs.ts`'s rid-keyed literal edits were approved on. The load-bearing half is the drift behaviour, not the list | the loudness was carried by a corpus-walking check that consolidation step 5 retired. The exceptions are still enumerated; nothing now fails when a key stops being observed | [`../admin/pipeline/transform/rules/unlink.ts`](../admin/pipeline/transform/rules/unlink.ts) lines 297, 432; `rules/geresh.ts` line 135; `rules/anaphora.ts` lines 375, 418 | live as a standing rule; **its enforcement is gone** — `docs/v2/retired-corpus-checks.md` |
| 08-23 geresh unlink | 2026-08-23 | *"Unlink, but record the others as exceptions, ultimately these exceptions need to be reviewed later."* The anchor is dropped and the stub text kept — 702 occurrences across 640 entries — instead of the 109 a retarget rule could reach | 702 links go away. Jastrow wrote the abbreviation; Sefaria's linker added the wrong target, and a self-link promises an article that does not exist. The untouched populations are registered in `archive/catalogue-audit/geresh-abbrev-arms.md` for a review that has not happened | [`../admin/pipeline/transform/rules/geresh.ts`](../admin/pipeline/transform/rules/geresh.ts) line 36; `registry.ts` line 238 | live; the exception register is unreviewed |
| 08-23 describe the defect | 2026-08-23 | A predicate **describes the defect, not the catalogued number.** A predicate carved to stop one short of a real member, for no reason but matching a count, is not a measurement | nothing — it recovers a member (K01198's comma-lead). The catalogue's `corpusCount` of 41 is corrected to 42 by the rule | `rules/unlink.ts` line 49; `rules/unlink.test.ts` line 111 | live |
| 08-24 gershayim | 2026-08-24 | The transform owns the gershayim defect; cite-escape class 1 is retired | the `&quot;` spelling leaves the corpus, so which addresses were once escaped survives only in the 21 respelled obligations | [`specs/2026-08-24-gershayim-transform-design.md`](specs/2026-08-24-gershayim-transform-design.md) §5 | live |
| 08-25 em-dash class | 2026-08-25 | `emDashSectionBreak` is Class C, not Class A — repair it as a deletion. The defect is the space, not the tag split | the space itself, 230 occurrences across 226 entries. The tag-seam reading of the row is abandoned | [`../admin/pipeline/transform/rules/punct-seams.ts`](../admin/pipeline/transform/rules/punct-seams.ts) header | live |
| 08-26 batch-4 phase | 2026-08-26 | All six of batch 4's rules stay in `text-repairs`, including the two that delete an anchor layer | the per-call deletion gate that `structural-repairs` applies. In `text-repairs` a deletion is judged only against a pinned corpus total | [`../admin/pipeline/transform/registry.ts`](../admin/pipeline/transform/registry.ts) ~line 300 | live |
| 08-26 link-target gate | 2026-08-26 | The `link-target.ts` gate is strengthened rather than weakened; every refusal is a **gap** with its own case spec | throughput: each refusal costs a spec | [`specs/2026-08-27-link-target-gate-cases.md`](specs/2026-08-27-link-target-gate-cases.md) | live |
| 08-26 rtl PR split | 2026-08-26 | The duplicate-rtl-wrapper fix ships as its own PR before batch 4 | nothing identified | [`specs/2026-08-26-anchor-paren-integrity-design.md`](specs/2026-08-26-anchor-paren-integrity-design.md) | historical |
| 08-27 paren strip | 2026-08-27 | On `parenthesized-alt-headword`: **strip the delimiters, add no new form-object mark** | **which forms print bracketed.** The parens group a run of variant readings; after the strip nothing records that the run was a group. This is issue #104's worked example — the spec noted the grouping "is not preserved" without saying what that means | [`../admin/pipeline/transform/rules/headword.ts`](../admin/pipeline/transform/rules/headword.ts) line 135; [`specs/2026-08-27-headword-field-integrity-design.md`](specs/2026-08-27-headword-field-integrity-design.md) §3.2, §7.1 | **reversed in intent → HW-paren (2026-09-20)**; the rule was unregistered 2026-09-21 with the §2 adoption |
| 08-28 stranded stem | 2026-08-28 | The stranded shared stem head is **withdrawn to `judgment`**, not discarded: the data is complete, what is left is a Phase 4 rendering decision | a reader meeting a bare `Pa. בַּהַית` cannot tell it shares the next gloss. `entry.schema.json` has no way to say two stems share one | [`specs/2026-08-28-structural-repairs-design.md`](specs/2026-08-28-structural-repairs-design.md) §5 | live |
| 08-28 batch-6a split | 2026-08-28 | The batch-6a row is split: a field half with no new inference ships, the rest does not | unstated | [`archive/transform-batch-6a.md`](archive/transform-batch-6a.md) | historical |
| 08-28 batch-6b | 2026-08-28 | The batch-6b row is **withdrawn to `judgment`** | unstated | [`archive/transform-batch-6b.md`](archive/transform-batch-6b.md) | historical |
| 08-29 dup phase | 2026-08-29 | Batch 7's two duplication rules run in `structural-repairs`, not `text-repairs` | nothing — it buys the per-call loss gate. The size argument first given for it was withdrawn as a raw-vs-stripped comparison | `registry.ts` ~line 1210 | live |
| 08-30 see-particle | 2026-08-30 | Restore the lost see-particle in 4 whole-entry redirect stubs; `allows: ['v', '.', ' ']` | three synthesized codepoints per entry get past `checkNoNewText`. Warranted by a null model — 7,270 populated slots against 4 empty | [`../admin/pipeline/transform/rules/see-particle.ts`](../admin/pipeline/transform/rules/see-particle.ts) line 163 | live |
| 08-31 v-sub re-scope | 2026-08-31 | `v-sub-redirect-stub` is re-scoped to 50 rows and a retarget rule ships | the rows outside the re-scoped 50 keep their defect | [`archive/catalogue-audit/v-sub-redirect-stub.md`](archive/catalogue-audit/v-sub-redirect-stub.md) | live |
| 08-31 containment | 2026-08-31 | Both of batch 9's rules ship, including the containment fallback | unstated | [`archive/catalogue-audit/containment-fallback.md`](archive/catalogue-audit/containment-fallback.md) | live |
| 09-01 case 9 | 2026-09-01 | Write link-target gate case 9 and ship all four | nothing identified | [`specs/2026-09-01-link-target-gate-case-9.md`](specs/2026-09-01-link-target-gate-case-9.md) | live |
| 09-06 page source | 2026-09-06 | The hOCR page index is the source of page and column. The v1 locators and the 107 hand edits are a cross-check only | the standing review gate on the 289 print-locator fixes retires with them. They are no longer applied, only compared | [`specs/2026-09-06-migrate-design.md`](specs/2026-09-06-migrate-design.md) §1 | live (supersedes D-architecture §6 rule 6 and part of S7 #39) |
| 09-06 render diff | 2026-09-06 | The golden render-diff gate is replaced by the §4 text-level gates, because the v1 renderer no longer exists on `v2` | **the only end-to-end check that what v2 renders matches what readers see today.** Text-level gates compare text, not output | migrate-design §1 | live |
| 09-06 case 10 | 2026-09-06 | Link-target gate case 10 splits into three classes, each ruled separately; a second remedy the same day | unstated | [`specs/2026-09-06-link-target-gate-case-10.md`](specs/2026-09-06-link-target-gate-case-10.md) | live |
| 09-06 escalations | 2026-09-06 | The 704 `needs_*` residue escalations are per-entry admin-tool work, post-go-live | 704 known defects ship. The preflight `defer` mode is this ruling in code | migrate-design §8; [`../admin/pipeline/patch/apply.ts`](../admin/pipeline/patch/apply.ts) (`PreflightOptions`, Ruling D) | live |
| 09-14 pin mismatch | 2026-09-14 | A stale snapshot pin is one count in the report header, not a refusal; each patch is judged by its own `expected_before`. `--strict` restores refusal | a stale pin no longer stops a run, so a patch authored against older bytes can apply if its precondition still holds | [`archive/plans/2026-09-14-consolidation-step4.md`](archive/plans/2026-09-14-consolidation-step4.md) | live |
| 09-14 required checks | 2026-09-14 | Required status checks on `v2` are deferred until near release; no repository setting changes | failing checks already force an override, so the deferral keeps that friction | step-4 plan; consolidation §5.2 | live |
| 09-15 CI withdrawal | 2026-09-15 | The Rebuild job, the Corpus Audit job, the Invariants CI job and `expected-counts.json` are withdrawn. Commutation and registry order run locally before rule-code PRs | **CI can no longer see a rule registration or a registry reorder.** `bun qa` is blind to it; `bun run transform:invariants` must be run by hand | [`archive/plans/2026-09-15-consolidation-step5.md`](archive/plans/2026-09-15-consolidation-step5.md) | live |
| 09-16 step-6 archiving | 2026-09-16 | Research code is deleted in the same commit that archives it; `patch/apply-cli.ts` stays runnable on its own | the deleted research tools are reachable only through `refs/tags/archive/v2-research-2026-09` | [`archive/plans/2026-09-16-consolidation-step6.md`](archive/plans/2026-09-16-consolidation-step6.md) | superseded → 2026-09-22 (`patch/apply-cli.ts` and `patch:replay` deleted; `bun data:import`'s own preflight is the only consumer of `patch/apply.ts` now) |
| 09-18 who may add bytes | 2026-09-18 | "An agent patch can not add/remove, a human patch can." Reviewed patches are stamped `author: 'human'` and exempt from the no-new-text floor | the floor stops protecting the reviewed corpus. The **remove** half is explicitly undecided: 7 `delete` patches are in the accepted corpus today | [`specs/2026-09-13-pipeline-consolidation-design.md`](specs/2026-09-13-pipeline-consolidation-design.md) §4.2 | live, with the remove half left open by the spec itself |
| 09-20 the bar | 2026-09-20 | The pipeline is done when its data is right by the reader-sees test and its gates would catch a regression | nothing identified | [`specs/2026-09-21-post-consolidation-review.md`](specs/2026-09-21-post-consolidation-review.md) §1 | live |

## 8. Lettered rulings A–F (patch corpus)

**Definition source: code docstring.** Rulings C–F have no spec. Their
only statement anywhere in the repository is the docstrings in
[`../admin/pipeline/patch/apply.ts`](../admin/pipeline/patch/apply.ts),
and each cites a "task-3 addendum" that **is not in the repository or
in `refs/tags/archive/v2-research-2026-09`.** The definitions below are
written out in full from those docstrings so the index does not depend
on them.

| id | date | decision | drops | home | status |
|---|---|---|---|---|---|
| A, B | — | — | — | — | **no trace found in the tree or in `refs/tags/archive/v2-research-2026-09`.** The scheme begins at C in every surviving citation |
| C | 2026-09-09 (first appearance `106960c0`, #73) | **One manifest record per rid, latest wins.** Where several tranches carry a record for the same rid, the accepted corpus keeps the latest and counts the earlier ones as `superseded.records` / `superseded.patches`. Reviewed (human) patches sit **outside** this rule: 11 reviewed rids also have agent records, and both apply | an earlier tranche's judgment on a rid disappears from the applied set without adjudication — supersession is by ingest position, not by review | `apply.ts` (`consolidate`, `loadAcceptedCorpus`, `REVIEWED_DIR` docstring) | live |
| D | 2026-09-09 | **Preflight policy: `needs_*` rows block by default, `defer` overrides.** Under `block` an unresolved escalation is a problem — the research-track contract. Under `defer` it is not, because the maintainer deferred every escalation to post-go-live on 2026-09-06, and migration proceeds without them | under `defer` the run's report is the only place an unresolved escalation appears; nothing stops the write | `apply.ts` (`PreflightOptions.escalations`) | live — the research track's own caller, `bun patch:replay`, was deleted 2026-09-22; `bun data:import`'s preflight (always `defer`) is the only consumer of this option now |
| E | 2026-09-09 | **Tranches carry the corpus stage they were swept at, and migration accepts `healed` only.** `pre-patch` = swept against `applyRepairs` output before any transform rule existed, so its anchors are authored against text later batches rewrote. `healed` = swept against both `text-repairs` and `structural-repairs`. `loadCorpus` / `loadManifest` stay raw for the research tools; the ingest order is explicit because directory names do not sort chronologically, and an unlisted tranche directory is an error, not a guess | every pre-patch tranche's work is excluded wholesale from the applied corpus — recovered only through Ruling F | `apply.ts` (`CorpusStage`, `TRANCHES`, `PILOT_STAGE`, `orderedDirs`, `corpusFiles`) | live |
| F | 2026-09-09 | **A pre-patch patch carries over unless an accepted patch already covers it.** A pre-patch patch whose `${rid} ${target}` no accepted patch targets is carried over and applied after the rid's accepted patches, in patch-id order; where both target the same pair, **the healed one wins** and the pre-patch one counts as `superseded.prePatch.overlapping`. Each carry-over is pre-checked by resolving its target and comparing the exact count: a zero-match means a transform rule already absorbed the defect, so the patch is recorded `absorbed` and never applied; a match at the expected count means it is `carried`. `reconcilePatches` runs only against the accepted set, since carry-overs have no accepted manifest row | overlap is judged by `(rid, target)` identity alone — a pre-patch patch that repairs a *different* defect at the same target is dropped without anyone reading either one | `apply.ts` (`PreflightOptions.reconcileOnly`, `corpusPreflight`, `AcceptedCorpus.carryOver`, `applyCarryOver`) | live |

## 9. R — pipeline consolidation (2026-09-12 / 09-18 / 09-21)

Home: [`specs/2026-09-13-pipeline-consolidation-design.md`](specs/2026-09-13-pipeline-consolidation-design.md) §2

| id | date | decision | drops | home | status |
|---|---|---|---|---|---|
| R1 | 2026-09-12 | `migrate.ts` is permanent and re-runnable. D14's "retires into repo history" is withdrawn. A run regenerates a candidate tree and reports; it never silently overwrites edited truth | nothing identified — it recovers reproducibility | §2 | live in prose; the one-shot guard it withdrew still runs — see [§C](#c-reversed-but-still-cited-as-live) |
| R2 | 2026-09-12 | Entry data is the edited layer. Hand edits are **not** re-recorded as pipeline inputs (that mandate withdrawn 2026-09-14). The one exception is page/column: an admin-tool change must also update `data/page-index/entries.jsonl` | a text correction made by hand survives a rebuild only through the §3.2 merge, not through the source. Text fixes are hoped to land upstream at Sefaria | §2 | live; reaffirmed and extended 2026-09-21 (admin edits are file edits, never patches) |
| R3 | 2026-09-12 | Resilient, not unattended: a failing entry is emitted **from source bytes** with a review row, never dropped. Every run still ends in a report a person reads | a source-byte fallback emits an entry that did not pass the finishing stages, so the tree can hold un-composed entries. Not yet a live risk | §2 | not in code: no source-byte fallback in `migrate.ts` |
| R4 | 2026-09-12 | Three buckets: a *rule* (detect + fix, general), a *patch* (one entry's judged fix), a *review detector* (detect only). Everything else is research and is archived | anything that does not fit one of the three is archived rather than kept — the research code of §4.1–§4.2 and §4.5 went this way | §2, §4 | live |
| R5 | 2026-09-12 | One formatter. Biome formats `data/entries/`; the pipeline formats last, the admin tool formats what it writes, CI checks | nothing identified | §2, §6 | live |
| R6 | 2026-09-12 | The pipeline runs on the current Sefaria export; `fetch` is step 1. The snapshot is committed with the entry data it produced. A Sefaria schema change is a code change and out of scope | a schema change upstream halts the pipeline until someone writes code | §2 | live |
| R7 | 2026-09-12 | Review items become issues in the tracker the admin tool integrates with. Until then, **two** documents stand in: `docs/v2/review-report.md` (generated) and `docs/v2/research-backlog.md` (hand-written) | two registers, neither of them the tracker; a row in the backlog has no state machine | §2, §3.1.1, §9 | amended → 2026-09-18 (one document became two) and → 2026-09-21 (three umbrella issues stand in for the backlog until the admin tool's import exists) |
| R8 | 2026-09-15 | Data terms: source / entry / compiled / reference / correction data. `migrate` becomes import; data commands take a `data:` prefix | the old names survive in code identifiers (`TruthSense`, `loadTruthFiles`, `migrate.ts`) — renaming them is deliberately a separate change | §1.1, [`glossary.md`](glossary.md) | live (identifier half deferred to consolidation §11 step 10) |
| R9 | 2026-09-15 | `migrate` is not CI work. It runs when a person chooses to; per-PR CI never runs it and never reads the source data | **CI cannot see a data regression.** Only a person running import locally can | §2 | live |
| R10 | 2026-09-17 | A published slug never changes: once published it keeps naming the same entry and is never handed to another. Amended 2026-09-18 — **binds at v2 publication, not before**; `SLUGS_FROZEN` is the switch | as first worded it froze slugs mid-development, before anything was published. The amendment is what unfroze them | §2, §7.1 | superseded → U6 (2026-09-21) |
| R11 | 2026-09-17 | The write is atomic: import composes, gates and reports in full, then replaces the tree in one move on a clean run. The "refuse unless the tree is empty" guard goes with it — it is a D14 relic, not a safety property, and is not replaced by a prompt | nothing identified | §2 | not in code: the atomic write is unbuilt (`migrate.ts` line 334 says so) and `outputTreeIsEmpty` still refuses |
| 09-21 admin edits | 2026-09-21 | **Admin edits are not patches.** The admin tool edits the entry file and nothing else; the update run (§3.2) keeps hand edits across a re-import, and R2's withdrawal of re-recording stands. Patches stay the pipeline's channel for source-data defects. Should patches from hand edits ever be wanted, they are generated by diffing entry data against source data — a process to be designed then | stated in the ruling: no new patch ops, so the three [#113](https://github.com/UniquePixels/jastrow/issues/113) rows that need a gloss edit (A01175, A01345, V00518) wait for the update run, which is itself unbuilt (§10 row 1) | [`specs/2026-09-13-pipeline-consolidation-design.md`](specs/2026-09-13-pipeline-consolidation-design.md) changelog 2026-09-21; review §10 Q6 | live (design); recorded as a changelog row, not given an R number |
| 09-21 backlog tracker | 2026-09-21 | **Option C:** three umbrella issues stand in for `research-backlog.md` until the admin tool's import exists — sense structure, the 16 deferred judgment classes, the 588 sweep escalations. Each links a backlog section and carries **no rid table**. The filing rule is recorded in `CONTRIBUTING.md` § Issues and `.claude/CLAUDE.md`: an issue is one defect class or one decision, never a rid list, and an AI session files or closes none without the maintainer's go in that session | class-level granularity: ~20 individual class issues collapse into 3, so a single class has no issue of its own to carry state. The 298 low-confidence page placements get no issue at all, under the "fix as found, never schedule" ruling | review §10 Q11; drafts in [`archive/review-2026-09-21/issues-to-file.md`](archive/review-2026-09-21/issues-to-file.md) | live; amends R7 |
| 09-22 patch archive | 2026-09-22 | **`data/patches/` holds only what the import run applies**, plus the `needs_*` escalations it defers. The 72 patch records it does not apply — 61 `superseded` carry-overs a transform rule now reaches first, and the 11 Rulings C/F consolidated away — moved to `docs/archive/patches-retired-2026-09-22/`, with the sweep-era research residue (`verdicts-*.jsonl`, `rejects.jsonl`, `report*.md`) the loader never read. An escalation is not a patch: a `needs_*` record that carried a retired patch stayed and lost only the reference | **nothing from the data.** The records are byte-exact in `docs/archive` and in git history; proved by rebuilding `data/entries/` from an empty tree with the records gone and getting a byte-identical tree. What a reader loses is proximity: a retired record no longer sits beside the live ones, and `pilot/`'s 210 manifest records (10 of them escalations) moved with the directory | [`archive/patches-retired-2026-09-22/README.md`](archive/patches-retired-2026-09-22/README.md); consolidation spec changelog 2026-09-22 | live |

## 10. HW — headword design (2026-09-20 / 09-21)

Home: [`v2/headword-design.md`](v2/headword-design.md) §3–§4. These are the
newest substantive rulings and the first set taken with the cost
written down.

| id | date | decision | drops | home | status |
|---|---|---|---|---|---|
| HW-halt | 2026-09-20 | **Text defects halt, display uncertainty does not.** A form's `text` is a lookup key, a slug and a link target; if it is wrong the pipeline halts. `display` may be left unset and the row flagged — that does not block go-live | an entry with no `display` prints without the layout print gave it. A flagged row is a ticket, not a guess — no default template is invented | §3 | live 2026-09-21, with the halt ARMED AND HELD — measured at 2 entries before shipping, so it reports rather than refuses |
| HW-rules | 2026-09-20 | Six halt rules on the form/display pair: every index appears once; no Hebrew in `display`; markers agree with the forms; no comma, paren, `?`, `=`, `…` or Latin letter in `text`; a `partial` form is never a lookup key; every comparison normalizes to NFC first | a `partial` form drops out of search entirely, though a slug is still derived from `headwords[0]` with notation stripped | §3.1 | live 2026-09-21 in `migrate/headword-rules.ts`, EXCEPT rule 4, which is armed and HELD: A01175 and A01345 still carry a `=`, so the defect is a `headword-unparsed` `blocks` row and one switch promotes it to an error |
| HW-commas | 2026-09-20 | Commas are never stored in a headword; the leading `,` that opens 10,743 glosses also goes. The app supplies separators | the three headwords carrying one (A02356, B00407, D00844) are defects, patched — nothing else identified | §4 | live (patched 2026-09-20) |
| HW-paren | 2026-09-20 | **The 2026-08-27 paren ruling is reversed in intent.** Grouping is kept as structure in `display` and never inside `text`. A group may span the headword and its alternates | nothing — it *recovers* what 08-27 dropped. Its own cost: `display` must carry structure the source cannot always settle (see HW-paren-open) | §4 | **live 2026-09-21**: `parenAltHeadword` is unregistered and the grouping is emitted in `display` |
| HW-roman | 2026-09-20 | Roman numerals are never moved. Each stays on the form it is attached to and prints where the source prints it — 10 inside the parens, 5 after | any correction of a numeral the source attached wrongly. A02823 proves Sefaria does that | §4 | live 2026-09-21 |
| HW-gender | 2026-09-20 | At most one of `grammar.gender` **or** a `gender` on *every* headword. Never both, and no inheritance | per-form gender where only some forms carry a label. Sefaria keeps only the last label on the headword line anyway — 22 known collapses, plus U01000 | §4, §5 | live 2026-09-21 as the schema and `validate.ts` rule; the parser never MINTS a `gender`, because Sefaria keeps only the last label on the line (§5) |
| HW-A01480 | 2026-09-20 | `אִיסְפְּלָנִית(א)` is an alternate ending of one word, not a separate form. The only headword in the corpus with the notation | nothing identified (n=1) | §4 | live as a reading |
| HW-H1-xref | 2026-09-20 | A numeral **list** on a cross-reference (6 rows) is `display` only, with **no** `homograph` — the numerals point at other entries that carry their own | nothing: the numbered forms exist elsewhere (A00877/A00878 etc.) and keep their own numbering. The one URL collision it creates → HW-xref-collision | §4 | live 2026-09-21 |
| HW-H2-open | 2026-09-20 | Where a paren group never closes (6 rows), the forms are written but `display` is left **unset** and flagged `paren-group-close-unknown` | the layout for those 6 entries, until the print settles it. Two readings are possible and neither is assumed | §4 | live 2026-09-21 |
| HW-A01394 | 2026-09-20 | `אֵינָשׁ) אִינְשָׁא` gets the same treatment — flagged, not guessed | the re-split only the print can settle | §4 | live 2026-09-21 |
| HW-query | 2026-09-20 | The query mark `?` (2 rows) is `display` only, never in `text` | Jastrow's "doubtful reading" signal stops being machine-readable. If "uncertain" ever becomes filterable, A00077 and B00825 are the rows to revisit | §4 | live 2026-09-21 |
| HW-equals | 2026-09-20 | `=` in a headword (2 rows) is a source defect: `= Y` moves into the gloss, matching the print | nothing — the targets resolve (A00477 alt, E00628). `slugStem` needs no `=` case | §4 | decided; blocked in [#113](https://github.com/UniquePixels/jastrow/issues/113) — no op moves text into a gloss |
| HW-ellipsis | 2026-09-20 | Ellipsis endings (8 rows) are stored as a `partial` form with the `…` in `display`, **not expanded** | those 8 stop being search keys. Expansion would mean choosing a base and assuming its vowels — the inference ruled out on 2026-08-22. For N01089 and M00997 even the base is unclear | §4; [#106](https://github.com/UniquePixels/jastrow/issues/106) | live 2026-09-21 |
| HW-two-spellings | 2026-09-20 | Two spellings fused into one item (5 rows) is a defect: split at the space into two forms. Relocation only, inside the 2026-08-22 boundary | nothing — every letter and vowel is already in the source. 3 of the 5 are primary headwords, so their slugs correct too | §4 | live (patched 2026-09-20) |
| HW-redup | 2026-09-20 | Reduplication (3 rows: `דא דא`, `הֵא הֵא`, `חַר חַר`) is a legitimate multi-word form. Kept | nothing identified | §4 | live — implemented 2026-09-21 as the `headword-multiword` `note` kind (#119) |
| HW-abbrev-alt | 2026-09-20 | Abbreviated phrase alternates (7 rows) are kept as printed and marked `partial` | those alternates stop being search keys until the print work happens | §4; [#107](https://github.com/UniquePixels/jastrow/issues/107) | live 2026-09-21 |
| HW-abbrev-primary | 2026-09-20 | Abbreviations in a **primary** headword (3 rows) are kept as printed, carried in `display`, form marked `partial`. What the lines mean needs real Jastrow knowledge — two sessions failed | those 3 entries have no unabbreviated lookup key. The slug still derives with notation stripped, so the URL is stable | §4; [#108](https://github.com/UniquePixels/jastrow/issues/108) | live 2026-09-21 |
| HW-no-expand | 2026-09-20 | The shipped rule `phrase-alt-headword-stub` **stops expanding** (~236 alternates). An abbreviated alternate keeps the printed form and is `partial` | stated in the source: *"those alternates stop being search keys."* Nothing halts — `buildHeadwordMap` keys on `headword` alone, so no link resolves through an alternate. The rule's own "no inference" claim is undercut by 2 rows where it doubled a letter | §4; [#109](https://github.com/UniquePixels/jastrow/issues/109) | **live 2026-09-21**: `phraseAltHeadwordStub` is unregistered; an abbreviated alternate keeps its printed form and is `partial` |
| HW-spaced | 2026-09-20 | Spaced variants (8 rows) are legitimate — the same word written as two words. Kept as multi-word forms | nothing identified | §4 | live — implemented 2026-09-21 as the `headword-multiword` `note` kind (#119) |
| HW-phrase-hw | 2026-09-20 | Phrase headwords (3 rows) are legitimate phrase lemmas. Kept | nothing identified | §4 | live — implemented 2026-09-21 as the `headword-multiword` `note` kind (#119) |
| HW-phrase-alt | 2026-09-20 | Phrase alternates (238 rows) split three ways: 227 revert to the printed abbreviation under HW-no-expand, 9 are genuine multi-word phrases, 2 differ only by the gershayim repair | the 227 raise [#107](https://github.com/UniquePixels/jastrow/issues/107)'s real scope to ~234 | §4 | the 9 genuine phrases are live in the `headword-multiword` `note` kind (#119); the 227 are tied to HW-no-expand |
| HW-split-hw | 2026-09-20 | Split headwords (5 rows) are adjudicated against the print and **patched, not joined blindly** — V00518 and S01780 come out unpointed by concatenation, so the patch text is the print's | U00489 is the instructive loss: rejoining its torn headword produced a string U00488 already holds and the uniqueness gate refused it, so the entry carries a numeral the tear lost | §4, §4.1; [#105](https://github.com/UniquePixels/jastrow/issues/105) | partly live (2 of 5 patched; 3 blocked in #113) |
| HW-ocr-dalet | 2026-09-20 | F00009's final-kaf-mid-word is an OCR error; the letter is a **dalet**. A mis-recognised glyph is a correction, not invented text | nothing — it is a correction, and its slug corrects with it | §4 | live (patched) |
| HW-endings | 2026-09-20 | The two ending entries (J00321, J00327) are entries for a shared **ending**, decided with the prefix entries, not as defects | nothing identified; the two need no searchability | §4 | live as a reading |
| HW-nfc-write | 2026-09-20 | Mark order is normalized to **NFC on write** in the pipeline, never in the source snapshot — 164 strings in `data/entries/`, 201 in the snapshot | nothing: the rewrite is provably lossless (`NFD(before) == NFD(after)` for all 164) and Hebrew only ever reorders. Reported to Sefaria as a source error | §4; [#110](https://github.com/UniquePixels/jastrow/issues/110) | live 2026-09-22: `normalizeForWrite` normalizes every string of an entry file on write (164 strings, 150 files), under an `NFD(before) == NFD(after)` assertion; §3.1 rule 6 is amended to name the write step as its one exception |
| HW-Q00752 | 2026-09-20 | Q00752's split headword joins byte-exactly to `פִּיסְחָא`; the gloss already carries `v. פִּסְחָא` | nothing — no print spelling needed | §4 | live (patched) |
| HW-prefix | 2026-09-20 | Prefix and ending entries (144 rows) are legitimate. `slugStem` strips the maqaf, so a prefix shares its letter's slug family — accepted. Search strips it the same way | a prefix and its letter share a slug family, so the URL does not distinguish them. The maqaf and leading vowel stay in `text`, which is what print sets | §4 | live (accepted as built) |
| HW-abbrev-x6 | 2026-09-20 | Abbreviated alternates at scale (2,240 rows / 2,038 entries): kept as printed, `partial`, never a lookup key | these 2,240 are 20.2% of all 11,080 alternates; with H6's ~234 the abbreviated population is ~2,474, or 22.3%. And **in 1,393 entries every alternate is abbreviated**, so those entries have no alternate search key until the print work is done. (The source at `headword-design.md` §4 attaches the 20.2% to the larger count; the two figures are separated here) | §4; [#107](https://github.com/UniquePixels/jastrow/issues/107) | live 2026-09-21 |
| HW-acronyms | 2026-09-20 | Acronyms and numeral letters (99 rows) are fully searchable; the notation stays in `text` **and** in the slug, because it is part of the word | nothing identified | §4 | live |
| HW-truncated | 2026-09-20 | Truncated headwords (34 rows) stay **lookup keys as printed**, NOT `partial` — only 6 have an unabbreviated alternate, so marking them partial would leave 28 entries unfindable | nothing — this row exists to avoid a loss the `partial` treatment would cause | §4 | live |
| HW-homograph-gaps | 2026-09-20 | Homograph numbering gaps (178 families) are not patchable from the data; flagged for the print | 178 families keep an inconsistent numbering the reader sees. The detector that found them was itself wrong (202 reported, 178 real) and is fixed | §4; [#111](https://github.com/UniquePixels/jastrow/issues/111) | live as a flag |
| HW-slug-notation | 2026-09-20 | Notation in a slug (22 rows) is no decision of its own — every row is a form whose `text` carries notation H1–H4 already remove | nothing identified | §4 | live |
| **HW-slug-number** | 2026-09-20 | The slug number vs the printed numeral is **not a defect — by design**. The slug number orders entries sharing a stem; Jastrow's numeral counts homographs of one word | the URL stops corresponding to the printed numeral in 1,184 rows (1,040 mixed families, 144 offset). `אָב` I becomes `אב-2` because a prefix entry took `אב-1`. The URL is an opaque identifier and the page still shows `אָב II` | §4 | superseded → U2 (2026-09-21: the name is the headword, with no numbering of our own) |
| HW-h1-sep | 2026-09-20 | A doubled space or a stray comma before a single numeral (4 rows) is a defect: correct to `<word> <numeral>`, then it parses | nothing identified | §4 | live (patched) |
| **HW-schema** | 2026-09-21 | **Entry data adopts headword-design §2 now**, before `compile.ts` is written: `headwords[]` (index 0 primary) replaces `headword`/`altHeadwords`; `display` is an optional template (unset = flagged, never defaulted — 7 rows today); `partial` and per-form `gender` become form fields; the §3.1 rules are enforced in `validate.ts`; every file carries `"schemaVersion": 2`. `sefariaHeadword` (U3) lands in the same rewrite | stated in the ruling: **~2,474 abbreviated alternates (20.2% of 11,080) stop being search keys**, and 1,393 entries have no alternate key until the print work in [#107](https://github.com/UniquePixels/jastrow/issues/107); the 227 alternates `phrase-alt-headword-stub` expanded revert to their printed form. Costs, distinct from drops: a new headword-line parser, gate 2 `headwordRoundTrip` redefined as text conservation plus a notation multiset, two rules unregistered (moving the `transform:invariants` baselines), a re-bless, ~11 test files | [`v2/headword-design.md`](v2/headword-design.md) §2 RULING block; review §10 Q1 (Q10 resolves with it) | **live in code 2026-09-21; live in the DATA 2026-09-22** — the batched rewrite of all 32,512 files |
| HW-paren-open | 2026-09-20 | **Open, not ruled:** parenthesis placement is not trustworthy in the source (~580 entries would need checking); A02823/M02007's trailing numeral is unresolved; the true size of the lost per-form gender class needs the print | recorded as unresolved rather than guessed. Not a go-live blocker | §5 | open; A02823's placement alone → HW-A02823 (2026-09-22) |
| HW-xref-collision | 2026-09-22 | G00675 (`זָרָה I, II`, a numeral list under HW-H1-xref) strips to the same URL name as G00674 (`זָרָה`) — the only collision in 32,512. G00675 takes `disambiguator: 2` (name `זָרָה²`) by reviewed patch: Sefaria's own tool, carried by 766 source headwords | the name carries a mark the 1903 print does not set — page 412a prints the two lines back to back, the second marked only by its `I, II`. Rejected: reading the list as a homograph (contradicts HW-H1-xref), merging the stubs (loses a printed line), holding the collision for [#113](https://github.com/UniquePixels/jastrow/issues/113) | [`v2/headword-design.md`](v2/headword-design.md) §4 "Numeral lists on cross-references" | decided; patched 2026-09-22 |
| HW-A02823 | 2026-09-22 | The parser stays **source-faithful** on parenthesis placement and emits a comma between ungrouped forms. A02823's print reading `({0}) {1} I` (confirmed against the scan) is filed as a reviewed patch with the #113 batch, not as a code exception | the comma: Sefaria's split dropped print's separators, so M02007 (comma) and A02823 (none) are indistinguishable to any parser — one of the two shows a separator print lacks until the print check. The ~580 other placements stay as the source shows them (HW-paren-open) | §2 table, §4 "Parentheses", §5 | decided; patched 2026-09-22 |

## 11. U — URL names (2026-09-21)

Home: [`specs/2026-09-21-url-names-design.md`](specs/2026-09-21-url-names-design.md) §2

| id | date | decision | drops | home | status |
|---|---|---|---|---|---|
| U1 | 2026-09-21 | Three routes: bare letters, our name, a Sefaria URL | nothing identified | §2, §3 | live (design) |
| U2 | 2026-09-21 | An entry's name is our current headword, shaped the way Sefaria shapes its own. **No numbering of our own** | the slug's disambiguating number goes. Two entries whose current headwords are identical cannot both hold the exact name — U4 sends the bare form to the first | §2, §4 | live (design); supersedes D12 and HW-slug-number |
| U3 | 2026-09-21 | `sefariaHeadword` is stored on **every** entry, verbatim from the source. Only import writes it | a byte on every one of 32.5k files, to keep the Sefaria route working after our headword is corrected | §2, §5.1 | live (design) |
| U4 | 2026-09-21 | If an entry's exact name is bare letters, that entry owns the bare URL. The "first entry" rule applies only where no exact name exists | the disambiguation page D12 designed. A reader typing an ambiguous word lands somewhere rather than choosing | §2, §3.1 | live (design) |
| U5 | 2026-09-21 | The reconstructed-form `*` is part of the name, as it is in Sefaria's | nothing identified | §2 | live (design) |
| U6 | 2026-09-21 | **Names may change; a published name never points at a different entry.** A corrected headword gets a new name and the old one redirects | a name is no longer a permanent address — only its *target* is permanent. Every rename costs a redirect that must be kept forever | §2 | live (design); replaces R10 |
| U7 | 2026-09-21 | Everything lives in the entry file. No separate names file — a hand or AI edit to one entry must not have to touch a second file | the reserved-name index R10 relied on. A deleted entry's name falls free rather than staying reserved | §2, §5.1, §7 | live (design); constrains the admin-edit decision (review §10 Q6) |
| U8 | 2026-09-21 | A sense or binyan suffix on a route is an app enhancement, not part of this design. If the data does not support it, it is not built | deep-linking into a sense, which D8 had already declined at the data layer | §2 | live (design) |

---

## A. Where the schemes came from

Eleven id schemes, no shared namespace. Read an id together with its
era. (The 2026-09-21 review counted nine: `U` landed after its passes
ran, and the headword rulings it called "informal" are numbered `HW-*`
here.)

| Scheme | Era | Rows |
|---|---|---|
| V*n* / CP-*n* | v2 overhaul, 2026-07-03 | 11 |
| D*n* | data architecture, 2026-07-08 | 15 |
| B*n* | entry body model, 2026-07-11 | 11 (B2/B3 were taken together) |
| S*n* | sense structure repair, 2026-08-06 | 7 |
| RP*n* | research process, 2026-08-10 | 8 |
| T*n* | sweep tiering, 2026-08-17 | 7 |
| dated `RULING (Brian, …)` | transform era, 2026-08-11 → 2026-09-20 | 36 |
| Ruling A–F | patch corpus, 2026-09-09 | 5 — but only C–F are rulings; the first row records that A and B do not exist |
| R*n* | pipeline consolidation, 2026-09-12 → 09-21 | 13 (the two 09-21 rulings are recorded as changelog rows, not given R numbers) |
| HW-* | headword design, 2026-09-20 / 09-21 | 36 |
| U*n* | URL names, 2026-09-21 | 8 |
| | **total rows** | **157** |

The count is of **rows**, not of rulings. Two rows are not one ruling
each: the `B2/B3` row holds two ids taken together, and the `A, B` row
holds none — it records that those two ids have no trace anywhere. So
157 rows carry 157 rulings; the two adjustments happen to cancel.

## B. The same ruling in two places with two wordings

Six rulings are recorded more than once and say different things. Post-consolidation review [§8](specs/2026-09-21-post-consolidation-review.md) and the architecture report [§5](archive/review-2026-09-21/report-architecture.md) list the first five; the sixth is an id collision found while building this index.

1. **The slug freeze — three scopes.** D12 says the slug is *frozen at import*; R10 says a *published* slug never changes and binds at v2 publication; U6 says a published *name* may change but never points at a different entry. Three different promises, all still written down. D12 and R10 carry supersession pointers; the narrowing from "frozen" to "never re-pointed" is nowhere stated in one place except this row. **Resolved in code 2026-09-21** — the slug, `SLUGS_FROZEN` and `data/slug-index/` are gone (URL names §9 steps 1–3); only the wording is left to reconcile.
2. **No-new-text — four layers, four wordings.** RP4 ("rearrange, re-tag, split or delete — never generate new words"); the transform module's three-layer gate ([§5](specs/2026-08-22-transform-module-design.md)); the validator's own docstring in `patch/no-new-text.ts`; and the 2026-09-18 "an agent patch can not add/remove, a human patch can." The fourth forbids what the first permits. The consolidation spec §4.2 flags this itself: 7 `delete` patches sit in the accepted corpus, and the remove half is left to the maintainer.
3. **The escalation default — three statements.** The 2026-08-15 triage ruling (everything defaults to `post-go-live`, `blocking` is a per-item override); T6 (blocking = breaks the render or gets baked in); and the 2026-09-20 step-11 recount ("T6 is the test, and only T6"). The first is a default, the second a predicate, the third an exclusion. They agree in outcome and not in shape.
4. **`migrate.ts`'s lifetime.** D14 says it retires (struck 2026-09-14); R1 says it is permanent and re-runnable; `migrate.ts` lines 673–685 still say "the migration is a one-shot" and refuse unless the tree is empty.
5. **The parentheses.** The 2026-08-27 ruling strips them; HW-paren keeps them as structure. Both are written as current; the code does the first.
6. **`D3` names two different rulings.** V1 supersedes a v1-era "D3 — the pipeline is a one-time relic, never re-run." The data-architecture spec's own D3 is "transform once." Same id, two rulings, five days apart, disambiguated nowhere.

## C. Reversed but still cited as live

PR [#118](https://github.com/UniquePixels/jastrow/pull/118) (`ae5ed264`)
added supersession pointers at six satellite sites: the paren strip in
[`rules/headword.ts`](../admin/pipeline/transform/rules/headword.ts) and
in headword-field §3.2/§7.1; D12's slug row in the data-architecture §5
stage list; `CONFIRMED_NO_CHANGE` in consolidation §4.1 and in the
reviewed README; migrate §6's deleted corpus rows and its header. The
three wholly superseded specs took archive banners, which cover the
golden render diff (sweep-tiering §2/§3.2), research-process §8 and
sense-structure §8.

**Two sites still carry a reversed ruling with no pointer.** The first
two of the original four went on 2026-09-21: HW-schema unregistered
both rules with the §2 adoption, so the notes that reasoned from them
were deleted rather than annotated. What the rules found — the
seven-bucket paren taxonomy, the stub rule's refusals — stays in
[`../docs/archive/transform-batch-5.md`](archive/transform-batch-5.md),
and `registry.ts`'s `RETIRED` list names the ruling for each.

| Site | Cites | Reversed by |
|---|---|---|
| [`../admin/pipeline/migrate.ts`](../admin/pipeline/migrate.ts) lines 580, 673–685 | `outputTreeIsEmpty` and the `main` docstring: "the migration is a one-shot" | R1 (2026-09-12) and R11 (2026-09-17) |
| [`../docs/archive/slug-index-README.md`](archive/slug-index-README.md) line 64 | "**A published slug never changes** (ruling R10)" | U6 (2026-09-21) — the file is now archived behind a banner, so it is history rather than a live site |

## D. Decided but not reflected in code

Four rows carry `contradicted by code` — V7, V9, D2 and D10. The two
headword contradictions cleared on 2026-09-21: HW-no-expand and the
08-27 paren strip were the two rules HW-schema unregistered. Two more
rows left on 2026-09-22, when the batched rewrite landed: HW-schema is
now in the DATA as well as the code, and HW-nfc-write is built as
`normalizeForWrite`. The rest below are decided and simply unbuilt.

| Ruling | What is missing |
|---|---|
| 08-23 loud on drift | The rule stands; the corpus check that enforced it was retired in consolidation step 5 |
| D9 | No `data/pointers/`, and the derived alt rows need `compile.ts` |
| D10 | No `bun validate` script; entry-data validation runs in the unit test tier, not as a CI schema gate |
| D11, D13 (compile half), D15 | `compile.ts` is unwritten — the serving layer, the browse ordering and abbreviation detection all wait on it |
| R3 | No source-byte fallback in `migrate.ts`; a failing entry has no emit path |
| R11 | The atomic write is unbuilt (`migrate.ts` line 334 says so), and the guard it withdrew still refuses |
| S4 | Three rids are still `needs_human_judgment` in `data/patches/reviewed/manifest.jsonl` |
| HW-halt | The halt is in `migrate/headword-rules.ts` and is ARMED AND HELD: measured at 2 entries (A01175, A01345) before shipping, so rule 4 reports a `headword-unparsed` `blocks` row and `HALT_ON_TEXT_DEFECT` promotes it to an error once #113 lands the op that moves `= Y` into the gloss |
| V7 | Only CP-0 and CP-1 were ever minuted |
| V9 | No `main` → `v2` merge since `v2` began |
| D2 | `data/page-index/build-report.json` is committed |
| 09-21 admin edits | Depends on the update run (§3.2), which is unbuilt — so the three #113 gloss edits still have nowhere to land |
| U1–U8 | Steps 1–3 of that spec §9 are built: import writes `sefariaHeadword`, the name is derived, the `names` gate replaced `slugs`, and the slug index is retired. Steps 4–6 — the admin tool's rename flow, compile's route map, and the published-names ledger with its three gates — are not. `formerNames` is in the schema and unwritten |
