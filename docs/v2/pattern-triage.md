# Pattern Triage Against Schema v2 (sweep tiering, Phase 1)

Each systemic pattern in `data/patches/patterns.jsonl`, judged on
whether the defect survives the v2 transform. Patterns that do not
survive need no rule — the transform discards the representation that
carries them. Judged against the
[entry body model](../specs/2026-07-11-entry-body-model-design.md)
(decisions B2, B4, B7, B10), its machine-readable form
`admin/pipeline/schema/entry.schema.json` (B11), and the migration
code that runs today (`admin/pipeline/body/`). Where a spec sentence
and the code disagree, the code is recorded as the finding.

Every count below was re-measured against
`data/source/jastrow-dictionary.jsonl` (32,512 entries) for this
triage; the `corpusCount` column is the catalogued figure, unchanged.

## Headline

| Pattern | Corpus | Survives v2? | Reason |
| --- | --- | --- | --- |
| `dataref-not-in-refs` | 20,298 | **no** | `refs[]` is dropped (B7); the reference index is derived from the inline `<cite ref>` tags at compile |
| `href-raw-space` | 9,805 | **no** | The space is an href artifact; no URLs are stored (D7). All 9,804 re-measured anchors carry a clean `data-ref` |
| `jt-href-slash` | 7,679 | **no** | Same — href only. All 7,679 slash-less anchors carry a well-formed canonical `data-ref` |
| `bare-rtl-hebrew` | ~4,900 | yes | `gloss`/`units` are tagged prose carried into v2 verbatim; the missing `dir="rtl"` travels with them |
| `dataref-skeleton-absent` | 2,572 | yes | A ref value naming no entry is wrong in the rid representation too; B10 requires rids to resolve |
| `nonsense-dup-anchor` | ~1,220 | yes | `language_reference` is rejoined into the gloss (B2), so its duplicate anchors land in v2 gloss markup |
| `unlinked-v-span` | 796 | yes | A cross-reference the linker never anchored produces no `<cite ref>`, so the derived index misses it |
| `plural-form-empty-slot` | 703 | **no** | `plural_form` is not a v2 field (schema `additionalProperties: false`) and no migration module reads it |
| `gender-in-definition` | 575 | **no** | v2 has no morphology field for the marker to be "left out of"; B2 puts it in the gloss deliberately |
| `ib-yoma-2a` | 312 | yes | The wrong value is the `data-ref` itself, which becomes the stored `<cite ref>` value |
| `paren-tag-no-space` | 126 | yes | A spacing defect inside gloss/unit prose, carried byte-for-byte |

Six survive (rules needed in Phase 2), five are discarded.

## The two CHECK rows

### `dataref-not-in-refs` (20,298) — discarded

The brief left this open on whether v2 rebuilds citation refs from the
inline `<cite ref>` tags or migrates the `refs[]` array. It rebuilds.

- Body model §2 "Dropped from truth" lists `refs` → **"Dropped —
  derived at compile (§5)"** (B7).
- §5 states the rule: "Truth therefore stores no reference list.
  `compile` derives the complete per-entry index from the `<cite>`
  tags."
- `admin/pipeline/schema/entry.schema.json` is decisive: the entry
  object sets `additionalProperties: false` and lists no `refs`
  property. A v2 entry cannot carry the array at all.
- `BodyEntry` in `admin/pipeline/body/types.ts` likewise has no `refs`
  field — `refs` appears only on `SourceEntry`, the upstream shape.

This pattern is not merely dissolved by the drop; it is the *reason*
for the drop. §5's measurement — "31% of inline citations are missing
from it" — is this pattern counted from the other side. Re-measured
here: 20,232 entries have at least one in-body `data-ref` absent from
their own `refs[]`, matching the catalogued 20,298 within the noise of
gershayim-escaped attributes.

**Conflict recorded.** The parent data-architecture spec
(`2026-07-08`, §2.2) says of `refs`: "Curated by Sefaria users;
accurate; kept", and D7 makes "refs list is incomplete" a per-entry
lint (register #1). The body model supersedes that row explicitly
(§8: "`refs` row is superseded by §5 here"), and the shipped JSON
Schema follows the body model. The later decision governs; register
#1 becomes the "derived-index completeness lint" per §8.

The only part of the `refs` field that touched migration is
`repairs.ts`'s `refs-removal` pass (three baseless items, review 02).
That pass edits the *source* copy before the field is dropped, so it
does not make `refs` a v2 artefact.

### `plural-form-empty-slot` (703) — discarded

The question was whether `plural_form` survives as a field at all. It
does not, on three independent grounds:

1. **Schema.** `entry.schema.json` sets `additionalProperties: false`
   and defines no `plural_form`; `BodyEntry` has no such property.
   §2 lists `content.morphology`, `plural_form` under "Dropped from
   truth".
2. **Code.** `plural_form` is declared on `SourceEntry`
   (`types.ts:31`) and read by nothing in `admin/pipeline/body/`. In
   particular `rejoin.ts` concatenates exactly four fragments —
   `content.morphology`, `language_code`, `language_reference`,
   sense-1 `definition` — and `plural_form` is not among them.
3. **Redundancy.** The printed plural phrase is already body text:
   10,343 of the 10,455 non-empty `plural_form` values (98.9%) locate
   verbatim inside their own entry's definition or etymology text.
   The 112 that do not are vocalization variants (e.g. A00084
   `אֲבִזְרֵי`/`אֲבִיזְרֵי`), not lost content.

Even if the field were rejoined as the design table's "Rejoined
likewise" wording implies, an empty string contributes zero bytes and
no separator — the empty slot would still be invisible. Re-measured:
703 entries carry an empty slot, exactly as catalogued.

**Doc-vs-code note.** §2's "Dropped from truth" table says
`content.morphology`, `plural_form` are "Rejoined likewise", but the
implemented rejoin covers `content.morphology` only. This is a
divergence between the design table and `rejoin.ts`, not a defect of
this triage: both readings discard the pattern. It is worth resolving
in the design doc before `migrate.ts` is written, in case the intent
was to append the plural phrases (which would duplicate text that is
already there in 98.9% of cases).

## Discarded — the href classes

Both rest on the same load-bearing sentence (body model §2, routing
requirement, per D7): "Both URLs derive from the stored value (rid or
canonical ref) at compile — **no URLs are stored**". The v2 tag is
`<cite ref="…">` whose value is a rid or a canonical Sefaria ref
(B10). The `href` attribute — the only place these two defects live —
has no v2 counterpart.

The brief asked for confirmation that the *ref value* is well-formed
for these entries. It is, in both classes:

| Class | Anchors | Carrying a `data-ref` | Sample value |
| --- | --- | --- | --- |
| `jt-href-slash` | 7,679 | 7,679 (100%) | `href="Jerusalem_Talmud_Nedarim.5.6.3"` → `data-ref="Jerusalem Talmud Nedarim 5:6:3"` |
| `href-raw-space` | 9,804 | 9,804 (100%) | `href="/Jastrow,_מוּר IV.1"` → `data-ref="Jastrow, מוּר IV 1"` |

`cite.ts` already treats both forms as first-class: `HREF` makes the
leading slash optional and records `hadLeadingSlash` for the census
rather than failing, per §4's hazard list ("the citation detector must
match both forms"). The slash-less count reproduces the catalogued
7,679 exactly; the spaced-href count reproduces 9,805 as 9,804 anchor
occurrences across all text-bearing fields (7,271 entries).

For `href-raw-space` the target is internal, so migration resolves it
to a rid rather than storing the string. That resolution reads the
`data-ref`, where the disambiguator is ordinary text — the raw space
never enters it. Where such a resolution *fails*, the failure is
counted by `dataref-skeleton-absent`, which survives.

## Discarded — `gender-in-definition` (575)

The catalogued defect is "gender label (f., m.) left in the definition
instead of a morphology field". v2 has no morphology field: B2 rejoins
`content.morphology` into the gloss head deliberately, so an entry
whose marker already sits at the head of its definition is *already*
in the v2 shape. The two upstream arrangements collapse to the same
gloss string.

Re-measured: 710 entries open sense-1 with a gender/proper-noun marker
and carry no `content.morphology`; 709 of them have an empty
`language_reference`, so the rejoin (morphology ⧺ language_code ⧺
language_reference ⧺ sense-1) cannot reorder marker against etymology
paren. Only 4 entries carry a marker in both places.

What does *not* follow is that `grammar.gender` is complete.
`grammar.ts` seeds the index from the 13,162 `content.morphology`
values only, so these ~710 entries get no `gender`. That is index
coverage, not text damage, and §2 already assigns it: gender is
"seeded at migration from the 13,162 visible markers", `pos` "starts
null — filled by post-migration enrichment", and "Lint checks index ↔
text agreement". Recorded as a follow-up below rather than a Phase 2
transform.

## Survives — the six candidates

| Pattern | Where it lands in v2 | Evidence |
| --- | --- | --- |
| `bare-rtl-hebrew` (~4,900) | `gloss`/`units` strings | Gloss is tagged prose (B2) and units are tagged prose blocks (B4); the migration slices, never re-renders, so an undirected Hebrew run is copied through. Re-measured 4,924 sense texts (4,570 entries) with Hebrew outside any span/anchor |
| `dataref-skeleton-absent` (2,572) | `<cite ref>` value | B10: "rid values must resolve to an existing entry". An internal target naming no headword cannot become a valid rid, so these hard-fail validation at migration rather than passing through |
| `nonsense-dup-anchor` (~1,220) | `gloss` markup + derived index | `rejoin.ts` concatenates `language_reference` into the gloss byte-for-byte, duplicate anchors included; each duplicate becomes a duplicate `<cite ref>` and a duplicate row in the compile-derived reference index. Re-measured 3,536 adjacent same-target anchor pairs across 775 entries in non-sense fields |
| `unlinked-v-span` (796) | absence in the derived index | No anchor means no `<cite ref>`, and since the reference index is derived from those tags alone (B7/§5), an unanchored cross-reference is invisible to browse and search. Re-measured 748 occurrences of `v. <span dir="rtl">` in 730 entries. Related to §5's ibid linking pass (7,018 unlinked ibids), which is the same shape of work |
| `ib-yoma-2a` (312) | `<cite ref>` value | The wrong value is in `data-ref`, which is exactly what becomes the stored canonical ref. Re-measured 364 anchors in 318 entries whose display opens `Ib.` and whose `data-ref` starts `Yoma 2a` |
| `paren-tag-no-space` (126) | `gloss`/`units` strings | Prose-internal spacing, carried verbatim. Re-measured 126 occurrences of `)<i>` / `)</a><i>` in 119 entries — the catalogued count exactly |

## Sizing caveat for `dataref-skeleton-absent`

The row survives regardless, but Phase 2 must pin its comparison rule
before writing a transform: the class size swings by two orders of
magnitude with the normalization chosen. Measured three ways over all
`Jastrow,`-targeted anchors:

| Comparison | Anchors | Entries |
| --- | --- | --- |
| Consonantal skeleton family (`link-anomalies.ts` `skeleton()`, matres kept) | 34 | 34 |
| Exact vocalized headword, homograph suffix stripped (`index.exact`) | 81 | 79 |
| Raw target string equals a corpus headword | 7,611 | — |

The middle figure agrees with the independently measured 88 links in
the parent spec's D8 ("88 do not [match an existing headword]") and
with upstream-issues register #11. The catalogued 2,572 falls between
the middle and loose readings and was not reproduced here. Several of
the exact-match failures are the gershayim truncation class
(`data-ref="Jastrow, אל"` from `א"ט`), 21 of which `repairs.ts`
already escapes — so the residue is smaller still.

## Follow-ups this triage raises

1. **Design-table vs `rejoin.ts` on `plural_form`** (§2 says
   "Rejoined likewise"; the code rejoins morphology only). Resolve in
   the design doc before `migrate.ts`.
2. **`grammar.gender` seeding coverage**: ~710 entries carry a visible
   marker with no `content.morphology`. Post-migration enrichment
   alongside `pos`, under §2's index ↔ text lint — not a Phase 2 text
   rule.
3. **Pin the `dataref-skeleton-absent` comparison rule** and re-count
   before writing its transform (see the caveat above).

## Changelog

| Date | Change |
|------|--------|
| 2026-08-17 | Triage written (sweep tiering Phase 1, task 6). Eleven patterns judged: 6 candidates, 5 discarded. Both CHECK rows settled as discarded — `refs[]` and `plural_form` are absent from `entry.schema.json`, which sets `additionalProperties: false` |
