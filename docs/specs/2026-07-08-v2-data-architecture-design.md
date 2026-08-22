# V2 Data Architecture — Schema, Storage, Serving

**Status:** Draft for maintainer review
**Date:** 2026-07-08
**Authors:** Brian L. (maintainer) + Claude (brainstorm partner)
**Relationship:** This is the Phase 2 schema/storage spec anticipated by
[the v2 overhaul design](2026-07-03-v2-overhaul-design.md) (task 2.1,
CP-2a). It also records decisions that supersede parts of the Phase 0–1
plan (see §10). Getting the data clean and organized is the reason v2
exists; this spec is the program's centerpiece.

All counts in this document were measured against the fresh source
snapshot (`data/source/jastrow-dictionary.jsonl`, 2026-07-04 dump,
32,512 entries) during the 2026-07-07/08 design session.

## 1. Three-layer model (D1)

| Layer | Location | Format | Committed? |
|---|---|---|---|
| Source | `data/source/` | Sefaria dump, verbatim JSONL | Yes — permanent provenance anchor |
| Truth | `data/entries/`, `data/pointers/` | Per-entry JSON, v2 schema | Yes — the canonical, human-edited data |
| Serving | build output | Compiled artifacts | **Never** — built at deploy |

**D2 — No intermediate artifacts in git.** Anything derivable from
committed inputs (divergence reports, edit-replay sets, compiled
output) is regenerated on demand by the pipeline tools and is not
committed. The tools themselves are committed and tested.

**D3 — Transform once.** Truth is a purpose-built schema, produced by a
one-time migration from source (§6), not kept Sefaria-shaped.
Rationale: upstream is effectively static (2019→2026 drift: 3
headwords), contributors should edit what actually renders, and
compile rules that must forever tolerate both pristine and hand-edited
content are an ongoing tax. The source snapshot plus the migration
code remain the permanent provenance record.

## 2. Truth layer

### 2.1 Layout (D4)

- `data/entries/<letter>/<rid>.json` — one file per entry (~32.5k
  files, ~26 letter directories). Per-entry files are the git-native
  database: PR diffs show exactly the entry touched, merge conflicts
  nearly vanish, GitHub renders each entry readably.
- `data/pointers/<id>.json` — custom pointer entries (§2.4), own id
  namespace, never colliding with rids.

### 2.2 Entry schema (D5)

```json
{
	"id": "A00015",
	"slug": "אב-2",
	"headword": { "text": "אָב", "homograph": 2, "disambiguator": 2 },
	"altHeadwords": [
		{ "text": "אבא" },
		{ "text": "אבד", "reconstructed": true }
	],
	"page": { "number": 2, "column": "a" },
	"grammar": { "gender": "m" },
	"senses": [
		{ "gloss": "m. (b. h.) <i>father</i>. …tagged intro flow…", "units": ["…"] },
		{ "label": "2", "gloss": "…", "units": ["…", "…"] }
	],
	"stems": [
		{
			"stem": "Nif.",
			"forms": ["נֶאֱבַד"],
			"senses": [ { "gloss": "…", "units": [] } ]
		}
	]
}
```

Field notes (optional fields are omitted when empty — most files stay
minimal):

| Field | Source | Notes |
|---|---|---|
| `id` | upstream `rid` | Permanent identity; also the print-order spine (§5) |
| `slug` | assigned at migration | URL address; stored, frozen, CI-validated unique (§4) |
| `headword` | decomposed | **Form object** — `text` (clean: no `*`, no numerals; 27,613 already clean) + optional `homograph` (Roman numeral, 2,871 — Jastrow's printed index, real content), `disambiguator` (superscript, 807 — Sefaria-added technical suffix; display deferred, register #6), `reconstructed` (`*`, 1,339 — evidence flag) |
| `altHeadwords[]` | upstream, decomposed identically (19,351 entries) | Array of the **same form-object shape** — one schema, one code path for every headword form (alts carry marks too: 529 Roman, 18 starred) |
| `page` | v1 local enrichment + the 107 hand edits | Grouped object: printed location. Not upstream data |
| `grammar` | seeded at migration from the 13,162 visible gender markers | **Typed index (body model B3)**: `gender` (`m`/`f`/`c`); `pos` starts null — filled by post-migration enrichment (register #14). A lint checks index ↔ text agreement; the markers themselves stay in the gloss text (B2: prose is truth) |
| `senses` | upstream, reassembled per the entry body model | Tree of `{label?, gloss, units[], senses[]}` (body model B2/B4–B6). The first sense is the entry's **intro flow** exactly as printed — the rejoined gloss head (morphology + etymology parenthesis + opening text; heals the K00664-class mid-phrase splits by construction). `label` is normalized (`"—2)"` → `"2"`); print punctuation regenerates by rule, byte-exact, else the entry is quarantined. `units[]` are citation-evidence blocks segmented by the conservative terminator rule. Lettered `a)…b)` runs and form sections (`Pl.`/`Part. pass.`/`Fem.`/`Denom.`, B12) split into child/sibling senses |
| `stems` | upstream grammar nodes (4,043), restructured | Binyan sections: `stem` from the closed stem set, `forms` (binyan forms, cleaned at migration), own sense tree — v1 flattened these |

**Resolved (2026-08-05):** the formerly provisional `origin`, `senses`,
and `quotes` rows are settled by the
[entry body model design](2026-07-11-entry-body-model-design.md)
(§6.0's prerequisite, now design-complete with its §6.0 review done):
`origin` is not stored — the etymology parenthesis rejoins the intro
sense's gloss (B2, byte-gated); `quotes` is dropped entirely (B8 — a
vestigial importer artifact, unconsumed even by Sefaria's renderer;
the phrases remain as ordinary body text); `refs` is dropped from
truth and the complete per-entry reference index is **derived at
compile** from `<cite>` tags (B7 — measured: the curated field is
missing 31% of inline citations; derivation beats curation). The
stable parts of the schema — identity, form objects, slug, page,
pointers — were not affected.

Dropped: `_id` (volatile), `parent_lexicon` (constant),
`prev_hw`/`next_hw` (validated then derived — §5), upstream headword
mark-strings (decomposed into fields; regenerable byte-exact).

Round-trip invariant: regenerating the marked display form from the
form object (`text`, `homograph`, `disambiguator`, `reconstructed`)
must byte-match the source headword for all 32,512 entries. Same for
alts.

### 2.3 Inline vocabulary (D6)

Definitions are **semantic tagged strings**: a closed vocabulary,
pipeline-validated — anything outside it fails `validate`. The entire
source corpus uses only 6 tags / 1 class / 4 attributes, so the
vocabulary is small by evidence, not by hope. Markdown was rejected
(1,339 headwords contain literal `*`; inline semantics — rtl, typed
refs — are exactly where Markdown is weakest). A JSON AST was rejected
(hostile to PR review and hand edits).

| Tag | From | Count | Meaning |
|---|---|---|---|
| `<he>…</he>` | `span dir="rtl"` | 84k | Hebrew/Aramaic run; renderer adds direction + font |
| `<i>…</i>` | `<i>` | 40k | Italic (glosses/emphasis); kept typographic, semantic refinement is later editor work |
| `<cite ref="…">…</cite>` | refLink (both `/Jastrow,_…` and other texts) | 164,807 | **One unified citation tag (body model B10)** — internal cross-references (`ref="A01975"`, 68,096) and citations into external texts (`ref="Shabbat 104a"`, 96,711) share it; router/validator dispatch on the unambiguous rid pattern. External refs keyed by canonical Sefaria ref string (never full URLs — D7). `k` optional on internal refs: `see`, `compare`, `read`, `equals`, `plural`, `denom-of`, `from`, `ed`, `ref-to`, `sub-voce`; absent = plain mention. `k` extraction at migration is mechanical, cheap, and fully deferrable (markers stay in the text) — register #2 owns coverage either way |
| `<sup> <sub>` | same | 281 | Real content — fractions (¹/₂₄ of a denar) and scholarly edition marks (ed. Lag. p. XII⁴, Ges. H. Dict.¹⁰). Kept |
| `<b>` | same | 20 | Punctuation-bolding residue (`<b>,</b>` after bold refs). All 20 enumerated and resolved in migration prep (§6.0); expected to dissolve |
| abbr override tags | new | rare | Compiler instructions only: force or suppress an abbreviation tooltip where the detector is provably wrong (§8) |

**D7 — Canonical refs, never URLs.** External references are stored as
canonical Sefaria ref strings (migration normalizes Sefaria's two
spellings). URLs are derived at compile. With `refs` dropped from
truth (B7 — §2.2), the `<cite>` tags are the single source: the
per-entry reference index is derived from them at compile, and
register #1's lint checks that derivation's completeness rather than
reconciling a curated list.

**D8 — No deeper-than-entry addressing (for now).** All 90,688
internal targets in the source — the 68,096 inline refLinks counted
above plus the 22,592 curated `refs`-field items (§9 evidence; the
latter dropped from truth per B7, leaving the inline population as
the data layer's) — are *addressed* at entry level (sense suffix is
uniformly "1" — Sefaria URL boilerplate); whether a target string
matches an existing headword is a separate question — 88 do not
(§6 gate, register #3, measured across the full 90,688). `<cite>` carries no sense attribute; the
vocabulary is additive, so one can be introduced the day an editor
needs it.

### 2.4 Pointer entries (D9)

Custom finding aids: a curated record whose only job is appearing in
browse/search and sending the reader to a real entry.

```json
{ "id": "P0001", "headword": { "text": "…" }, "slug": "…",
  "target": "A00051", "after": "A00051", "note": "why this helps" }
```

Alt headwords do **not** get pointer records — browse rows for alts
are derived at compile from `altHeadwords` (one source of truth; the
owning entry).

### 2.5 Schema evolution (D10)

- A JSON Schema + the tag vocabulary are committed and enforced by
  `bun validate` in CI on every PR — no entry drifts silently. The
  schema is written (body model B11:
  `admin/pipeline/schema/entry.schema.json`, ajv-validated in the
  pipeline; it lands with the `spec/entry-body-model` branch) and
  serves as the documented generic spec of the entry format —
  examples in these documents illustrate it, they do not define it.
  On `main`, `bun validate:data` still guards the deployed v1 data with
  the legacy validator. On `v2` that gate does not exist: the CP-0
  ratification of V5 removed `scripts/` and `ci-data.yml` along with the
  v1 app, a gap the overhaul spec records as accepted. Until `migrate.ts`
  lands its output and the v2 schema takes over as the CI gate, `v2` data
  is guarded by the pipeline's own ajv validation and `bun qa`, not by CI
  schema enforcement.
- Additive-first: new optional fields never break; breaking changes
  require a versioned, reviewed migration script.
- Bulk changes to truth (cleanup passes) are first-class pipeline
  operations: scripted, tested, reviewed as PRs. **No pass touches the
  full word list until the maintainer has blessed the pass** — and
  never before migration itself is blessed.

## 3. Serving layer (compiled, D11)

All **decisions** — what is a link, what is an abbreviation, what
order entries take — are made once at compile (the Cloudflare Pages
build step) and tested in CI. The client never decides; whether some
purely *mechanical expansion* (e.g., compact abbr marker → tooltip
markup) runs client-side is a Phase 4 measurement question (payload
size vs render cost) inside the deferred serving-shape contract.

| Artifact | Contents |
|---|---|
| Entry shards | Per entry: rid, slug, display headword (marks regenerated), page/column, definition body — shape **deferred** (see below) |
| Browse index | Interleaved, **pre-ordered** list: real entries + derived alt pointers + custom pointers |
| Route map | slug ↔ rid, for canonicalization and permalinks |
| Page index | page/column → ordered rids (`/p/2a` routes) |
| `abbreviations.json` | Tooltip text stored once; markup carries only keys |
| Reference index | Per-entry reference list **derived from `<cite>` tags** (B7 — truth stores none), categorized by corpus (Talmud/Midrash/Bible/…) for the color-coded reference box and search — regenerates what v1 shipped as the derived `rf` rollup |
| Search artifacts | **Deferred contract** — format owned by the search overhaul; pipeline guarantees clean typed inputs |
| Version manifest | Build id (git sha) + artifact hashes for service-worker diffing |

Sharding: letter-group files sized for lazy loading; boundaries are a
tuning knob, not a schema commitment. Full-dictionary offline precache
remains a hard requirement.

Browse-row collision rule: **4,195 of 11,098 alt forms share a clean
spelling with a real entry** (Jastrow printed many cross-reference
stubs as entries of his own). Alt-derived rows whose form collides
with a real entry fold into that spelling's disambiguation surface
instead of duplicating rows; exact rules are fixed with a fixture set
during compile design (register #10).

**Deferred contracts (Phase 4 owns them):** the entry-body shape
(single precompiled HTML fragment vs structured JSON vs hybrid) and
the search-artifact format. Both are compile *outputs*; truth schema
is unaffected whichever way they land.

Compile stages: **validate** (schema, vocabulary, slug uniqueness,
ref resolution) → **transform** (abbr detection + overrides, display
regeneration, link expansion, reference-index derivation + corpus
categorization) → **emit** (shards, indexes, manifest) → **gate**
(golden render diffs, abbr coverage report vs previous build,
derived-index completeness lint — every non-quarantined `<cite>` tag
accounted for in the emitted index, run after derivation since the
index is transform's output; CI fails on any broken ref not listed in
the reviewed quarantine list (§6 blessing gates) or any vocabulary
violation).

## 4. Addressing and routing (D12)

- rid = permanent internal address. The data layer (internal
  `<cite ref>`) speaks only rids. `/A00015` permalinks work forever
  (redirect).
- slug = human address, **stored in truth and frozen** (URLs are
  promises; a compile-derived slug could renumber on insertion and
  break shared links). Assigned once by migration: niqqud-stripped
  headword, deterministic suffix on collision. Byte order is
  **word-then-modifier** (headword characters, hyphen, suffix) —
  matching Jastrow's own layout and English readers' intuition; bidi
  rendering may show the number visually to the left in some
  contexts, but typed/copied order is always word first.
- Measured ambiguity: 25,293 distinct stripped forms; 4,406 collide,
  covering 11,625 entries (worst case 13). A bare ambiguous word
  (`/אב`) lands on a **disambiguation page** (homograph numeral,
  page/column, first-gloss preview) — deliberately good for the
  study/Shiur case of hearing a word and typing just the word.
- Address bar always canonicalizes to the pretty URL; the Share action
  emits it as raw Unicode text (renders as Hebrew in chat apps); rid
  URLs remain the durable citation form.
- `/p/2a` = printed page 2, column a, entries in print order.

## 5. Ordering (D13)

Jastrow's order is print truth, not computable from headwords. The
real-entry corpus is closed (the 1903 print is finished), so:

- Real entries: **rid is the order spine**, as in v1.
- Alt-derived pointer rows: placed by the collation rule at compile
  (their position has no print truth; "where a scanning reader looks"
  is their whole job). Escape hatch: a wrongly placed alt row can be
  promoted to a stored anchor override.
- Custom pointers: stored anchor (`"after": "<rid>"`), confirmed by
  the author at creation; tooling suggests a spot via collation.
- **Ordering is a compile step.** The browse index is emitted in final
  order; the client never sorts. The collation rule (register #7) runs
  only on the build machine and its output is reviewable.
- Migration gate: walking the source `prev_hw`/`next_hw` chain must
  equal rid sort order for all 32,512 entries. Agreement confirms the
  chain is derivable (and it stays out of truth); disagreement
  surfaces a rid quirk or upstream error now rather than later.

## 6. Migration (one-time, D14)

`admin/pipeline/` gains two stages alongside the existing evidence
tools (`fetch.ts`, `audit.ts`, `mine.ts` are kept as provenance):

- `migrate.ts` — source snapshot → truth files. Runs once, gets
  blessed, then retires into repo history.
- `compile.ts` — truth → serving artifacts, on every deploy, forever.

### 6.0 Migration prerequisites (design-complete before `migrate.ts` is written)

> **Status (2026-08-05): complete.** The entry body model is designed,
> censused, fixtured, and gated (byte round-trips 32,512/32,512 across
> rejoin/units/lettered/form-section rules), its maintainer review is
> done, and the approved repair passes are implemented — see the
> [entry body model design](2026-07-11-entry-body-model-design.md)
> (§8 of which produced this document's 2026-08-05 amendments) and its
> `docs/v2/body-*` evidence set. The prose below is kept as written
> for the record.

- **Entry body model (the big one).** `origin`, the sense-1 preamble
  (entry-level morphology/glosses masquerading as a definition —
  A00014's " , const. …"), `senses` internals, and `quotes` are not
  four independent fields: they are four fragments of **one printed
  entry body** that Sefaria segmented crudely in different ways
  (parens left in "semantic" fields, mid-phrase splits, entry-level
  text poured into sense 1). The prerequisite is to design the
  coherent structure the printed body actually has (etymology →
  morphology/construct forms → glosses → numbered senses → grammar
  sections → compound phrases), by censusing every shape against real
  entries and building the edge-case fixture corpus. Sefaria's fields
  are **inputs to reassembly, not the model**; every reassembly is
  gated by a concatenation round-trip (reassembled text must
  reproduce the source text flow).
- **Enumerate and resolve within that work:** all 20 `<b>`
  occurrences; all 301 `quotes` entries (maintainer eyes-on); the
  5,842 `origin` splits.
- **Scope rule — what belongs in migration vs after:** anything that
  changes the **representation** of existing data (sense internals,
  origin shape, markup translation) must land in the one-time
  migration — iterate on these until §6.0 is done. Anything
  **additive** (gender, word type, richer language semantics,
  link-kind coverage) is a post-migration enrichment pass under D10
  and must not delay migration. Iterate on representation; migrate
  once; enrich forever after.

Migration rules (each unit-tested; all derived from measured
evidence):

1. Headword decomposition (entry + alts) with the byte-exact
   round-trip gate (§2.2).
2. Link typing: refLinks become the unified `<cite ref>` (B10) —
   internal targets resolved full-marked-string → rid, external
   targets normalized to canonical refs; `k` from markers + chain
   inheritance, untyped where unprovable.
3. Markup translation into the closed vocabulary (§2.3) — applied to
   every reassembled body text (the rejoined gloss head carries
   refLinks too).
4. ~~`refs` resolution into `{internal, external}`~~ — superseded:
   `refs` is dropped from truth (B7); the reference index derives at
   compile (§3).
5. Slug assignment, once, then frozen (D12).
6. `page`/`column` carried from the v1 enrichment, with the 107
   hand edits from main's history applied — the one true replay.
7. Structural: drop `_id`/`parent_lexicon`, keep recursive grammar
   senses, omit empties.

**Blessing gates (all must pass before truth is real):**

- Golden render-diff of all 32,512 entries against v1 output; every
  difference must be explained by a listed rule.
- Headword round-trip 32,512/32,512; alt round-trip likewise.
- prev/next chain ↔ rid order agreement (§5).
- The 88 broken internal targets resolved or explicitly quarantined.
  **Quarantine contract:** the citation tag stays in the text
  byte-preserving (never removed), with its unresolved target recorded
  in a committed, reviewed quarantine list (register #3). Validate
  accepts a broken internal target only when listed; compile renders a
  listed citation as plain text (no link) and excludes it from the
  derived reference index; CI still fails on any broken ref *not* on
  the list. Same loud-list pattern as every other quarantine in the
  pipeline.
- Maintainer review of a sampled diff.

Until blessing: **no full-corpus pass runs, period.**

## 7. Cleanup register

Each item is its own reviewed pass after migration; none blocks
migration; none bundles with another.

| # | Item | Size |
|---|---|---|
| 1 | Derived-index completeness lint (the reference index derives from `<cite>` tags at compile — B7; lint ships in the compile gate stage, after derivation) | unknown until first report |
| 2 | Link-kind typing beyond the mechanical floor (~25% naive coverage; chain inheritance raises it) | ~75% of internal links untyped |
| 3 | Broken internal targets — fix or quarantine (contract in §6 blessing gates); report upstream | 88 |
| 4 | Empty sense objects | 73 |
| 5 | Headword divergences vs legacy extraction — report upstream to Sefaria | 3 |
| 6 | Superscript-disambiguator display decision | 807 (Phase 4 UX call) |
| 7 | Hebrew collation rule for pointer placement (compile-only) | rule, not data |
| 8 | prev/next chain verification | resolved by migration gate |
| 9 | Abbr detector false-positive review after first coverage report | unknown |
| 10 | Alt browse rows colliding with real entries — fold-into-disambiguation rules + fixture set | 4,195 forms |
| 11 | Additive enrichments: richer language semantics; a forms index (construct/plural phrasing catalogued by the preamble survey) is future additive work | future passes (§6.0 scope rule) |
| 12 | ~~`quotes` semantics~~ — **closed**: `quotes` dropped entirely (body model B8; the 8 stragglers reviewed 2026-08-05) | — |
| 13 | Ibid linking pass — resolve the unlinked ibid citations by chaining from the previous citation in the entry; additive tag wrapping, post-migration | 15,421 ibids, 7,018 unlinked |
| 14 | POS enrichment — fill `grammar.pos`, seeded for review from v1's derived `g.ps` (7,611 entries) | post-migration |

## 8. Abbreviations (D15)

Truth stays lean: abbreviations are **not** tagged in truth.
Detection runs at compile against the abbreviation list, so shipped
artifacts carry explicit tags and the client does zero detection.
Correctness is a CI property, not a runtime hope: golden-corpus
tests, a per-compile coverage report diffed against the previous
build, and unit tests on boundary cases (the v1 asterisk bug class).
Truth-level override tags (§2.3) force or suppress specific tooltips
where the detector is provably wrong — instructions to the compiler,
visible and reviewed.

Why detection instead of inlining ~100k tags into truth: PR diffs
stay readable; adding one abbreviation to the list propagates
everywhere at the next compile instead of requiring a 32k-file bulk
edit; one tested code path instead of 32k hand-maintained instances.
Inlining's only advantage is explicitness, which the coverage report
supplies anyway. Whether the *expansion* ships precomputed or runs
client-side is part of the serving-shape measurement (§3).

## 9. Evidence appendix

Measured 2026-07-07/08 against the 2026-07-04 snapshot:

- Markup vocabulary of all 43,428 definitions: `a` 146k (all
  `class="refLink"`), `span` 84k (all `dir="rtl"`), `i` 40k, `sup`
  271, `b` 20, `sub` 10. No other tags, classes, or attributes.
- Links split: 96,711 external citations vs 68,096 internal
  cross-references (mechanically separable by href).
- Naive link-kind markers cover ~25% of internal links ("v." 17.9%,
  "cmp." 1.8%, …); chains ("v. X, Y, Z") imply more via inheritance.
- Headword marks: 27,613 clean; 2,753 Roman; 1,221 star; 807
  superscript; 118 star+Roman. One entry (`אָב II ²`) carries both
  numeral kinds — they are independent facts.
- Superscripts are functional link keys upstream: 1,507 internal
  targets use them. 99.9% of the 90,688 internal targets resolve to an
  existing headword exactly; 88 are broken.
- refs field: 98,124 refs (75,532 external, 22,592 internal); internal
  sense number is uniformly 1.
- Sense shapes: 31,400 `{definition}`; 7,565 `{definition, number}`;
  4,043 `{grammar, senses}` (recursive); 347 `{grammar}`; 73 empty.
- Slug ambiguity: 25,293 distinct stripped forms; 4,406 collide
  (11,625 entries; worst 13).
- Edit mining (main history): 22,164 modifies in 4 commits — 22,057
  scripted (refLink passes, tooltips), 107 hand-made page-number
  fixes ("Data update: a few page numbers", caf242a). The replay
  problem reduces to rule 6 of §6.
- `language_code`/`language_reference`: present on 5,842 entries
  (4,494 both / 1,343 code-only / 5 reference-only); they are crude
  segments of the printed etymology parenthesis (mid-phrase splits:
  K00664, R00224). Deployed data carries the text (concatenated as
  `li` — baseline audit) but **the v1 renderer never displayed it**,
  and deployed definitions begin with orphaned punctuation (A00014).

## 10. Consequences for in-flight work

- Phase 1 task 1.3 (edit mining): the tools (`mine.ts`,
  `parse-jsonl-diff.ts` + tests) land; `data/source/edit-replay.jsonl`
  is **not committed** (D2) — the 107 real edits are consumed by
  migration rule 6, regenerated on demand.
- The Phase 0–1 plan's remaining intent (CP-1) is satisfied by this
  spec's evidence plus a checkpoint record; Phase 2 planning happens
  against this document.
- `docs/v2/divergence-audit.md` stays as the Phase 1 evidence doc;
  future intermediates follow D2.

## 11. Changelog

| Date | Change |
|---|---|
| 2026-07-08 | Initial draft from design session (maintainer + Claude) |
| 2026-07-08 | Review round 1 (maintainer): headword becomes a nested form object shared with alts; `language_*` renamed `origin` (it is the printed etymology parenthesis, passes markup translation); slug byte order pinned word-then-modifier; refs-as-rids rationale recorded; `<b>`/`quotes` enumeration added; D11 softened — client may mechanically expand, never decide; §6.0 prerequisites + migration-vs-enrichment scope rule; register #10–12 added |
| 2026-07-08 | Review round 2: `origin` fields proven to be crudely segmented print text that **v1 dropped entirely** — v2 restores it; re-segmentation attempt + round-trip gate in §6.0, rejoin fallback; quotes examination may fold into sense census |
| 2026-07-08 | Review round 3: §6.0 reframed around the **entry body model** — origin, sense-1 preamble, senses internals, and quotes are fragments of one printed body, reassembled together (Sefaria fields are inputs, not the model); §2.2 rows for those fields marked provisional |
| 2026-08-05 | **Entry body model consequences folded in** ([design doc](2026-07-11-entry-body-model-design.md) §8, its §6.0 review complete): §2.2 provisional rows resolved — `origin` rejoins the intro gloss (B2), `quotes` dropped (B8), `refs` dropped with the reference index derived at compile (B7); `senses` becomes the `{label?, gloss, units[], senses[]}` tree with `stems` binyan sections and the `grammar` typed index (B3); example JSON updated to the committed schema shape. §2.3: `<ref rid>`/`<cite ref>` merged into one `<cite ref>` (B10, counts summed 164,807); D7/D8 + migration rules 2–4 reworded to match. §2.5 records the B11 schema deliverable (`admin/pipeline/schema/entry.schema.json`). §3: compile gains the derived reference index + corpus categorization (D11). Register: #1 → derived-index completeness lint; #12 closed; #13 ibid linking, #14 POS enrichment added; #11 notes the future forms index |
