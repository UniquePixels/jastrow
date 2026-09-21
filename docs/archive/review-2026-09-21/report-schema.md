# Data schema review — jastrow @ 12a40a30 (branch review/2026-09-20-comprehensive)

Read-only review of `data/` and its contracts. Every number below names the script or file it came from. Scripts live in the scratchpad (`census-entries.ts` → `census-entries.out.json`, `refint.ts` → `refint.out.json`, `schema-extra.ts` → `schema-extra.out.json`, all run from the repo root with `bun`). Tags: `[sev]` = high / med / low; `[conf]` = high / med / low.

## Executive summary

1. **Schema validity: 0 violations.** ajv 2020-12 (strict) over all 32,512 entry files: 0 failures (`census-entries.out.json ajv.failFiles`; the local `data/source/migration-report.json` gate `schema` 32,512/32,512 agrees). Markup: 6 tags, 1 attribute, 0 outside the spec vocabulary.
2. **Schema ↔ code ↔ data drift: 9 findings**, 1 high — `grammar.number: "pl"` is written for 432 `pr. n. pl.` entries where `pl.` means *place*, not plural (`schema-extra.out.json genderVsMorph`; 8/8 sampled are towns). Also: `grammar.pos` has no producer (0 of 32,512), enums `gender:"c"` and `number:"du"` never occur, `page` and `units` are optional in the schema but present in 100%, nested keys are not in schema order despite migrate spec §2.6.
3. **Hebrew/Unicode: 164 non-NFC strings (known) + 33 other anomalies**: 5 zero-width joiners, 1 nbsp, 1 tab, 22 Latin letters with decomposed diacritics, 0 presentation forms, 0 directional marks, 0 ASCII quotes-as-gershayim in entry text. All lookup keys (slug index, aliases, page-index headwords, entry slugs) are NFC: 0 exceptions. 68 page-index `headword` values still carry ASCII `"` for gershayim.
4. **Referential integrity: 0 hard violations.** rids unique and contiguous (one quirk: נ starts at N00001, no N00000); 71,376 internal `<cite ref>` targets all resolve; slug index 1:1 with entries both ways (32,512/32,512); 4,412 aliases all resolve; page index covers 32,512/32,512 with page/column byte-equal to every entry; quarantine is `[]` and 0 targets are unresolved; 302 patch ids unique, every rid exists, every pin matches `snapshot.lock`.
5. **Sidecars: no JSON schema for any of the five; 2 README claims contradicted by rows** (page-index "1–1704" vs max 1705; "monotonicity guaranteed" vs 15 descending steps — 14 explained by letter-change pages, 1 not) and a volume overlap (vol 1 rows up to p.690, vol 2 starts p.685: 2 rows). `pilot/` and `tranches/` are live inputs (`patch/apply.ts` `TRANCHES`); their `verdicts-*.jsonl`, `report-*.md`, `rejects.jsonl` and a stray `.claude/` dir are research residue. The four `*-report.json` in `data/source/` are **not tracked** (gitignored); git holds only the 3 snapshot files.
6. **Patch model: 8 ops (schema.ts header still says "seven"), all addressed to the SOURCE shape** (`SourceSense.definition`, `refs[]`, `alt_headwords`), none to entry data. No add-sense / set-gloss op (#113). Authorship is inferred from directory (`author` is never in a record). Preconditions are sound but pinned to post-transform text for 8 of 10 tranches, so a rule change silently invalidates them.
7. **Readiness for compile: blocked on 4 decisions** (headword shape §2, `grammar.number` semantics, sense addressing, canonical serializer for the admin tool), not on missing inputs — every input §3 names exists and validates.
8. **Admin round-trip: lossless in content, lossy in form.** No provenance/version field per entry (spec §3.2 says none; but `data/source/migration-written.json`, the base it relies on, does not exist). Nested key order is insertion order from `finish.ts`, so any writer other than migrate reorders keys unless it copies that code.
9. **Size/format: deterministic.** `biome format --check` over 32,512 files: 0 fixes; tab-indented; max file 18,573 bytes, 0 over 1 MB, 28.0 MB total; 22 letter dirs A–V (migrate spec §2.6), while data-architecture §2.1 still says "~26".
10. **Data tree is stale by one PR**: local dry run reports `slug-changed` 7, `patches.reviewed` 112 vs the 96 the tree was written from (PR #114's 16 patches unwritten). Nothing here is a blocker on its own; the `pr. n. pl.` error is the one thing to fix before compile reads `grammar`.

---

## 1. Entry schema vs spec vs code vs data

Sources read in full: `admin/pipeline/schema/entry.schema.json`, `admin/pipeline/migrate/types.ts`, `admin/pipeline/body/types.ts`, `admin/pipeline/migrate/finish.ts` (emit), `admin/pipeline/migrate/validate.ts`, `admin/pipeline/body/grammar.ts`, data-architecture spec §2.2/§2.3, body-model spec §2. Counts: `census-entries.out.json` (keyPaths, enums, tags) and `schema-extra.out.json` (keyOrder, genderVsMorph, badStems).

### 1.1 Validator run

| sev | conf | path | claim | evidence |
|---|---|---|---|---|
| — | high | `data/entries/**` | 32,512/32,512 files validate; 0 errors | `census-entries.ts` (Ajv2020, `strict:true`, `allErrors:true`): `ajv.failFiles: 0`, `ajv.errors: {}`; `data/source/migration-report.json` gate `schema` pass 32512/32512 |
| low | high | `admin/pipeline/migrate/truth.test.ts` | Same validator + slug/page/markup cross-checks run in `bun qa` (unit tier). Good: a hand edit meets it. | `validate.ts` `checkFiles`/`checkSlugs`/`checkMarkup`/`checkPages` |

### 1.2 Field-by-field: schema vs code vs data

| sev | conf | path | claim | evidence |
|---|---|---|---|---|
| **high** | high | `grammar.number` (432 entries) | `"pl"` is wrong for every `pr. n. pl.` entry: Jastrow's `pl.` after `pr. n.` means *place name*. The typed index asserts plural for 432 place names. | `body/grammar.ts:53` maps `'pr. n. pl.': { number: 'pl' }` and its header comment (line 24) reads it as "proper-noun + plural"; `schema-extra.out.json genderVsMorph` `morph=pr. n. pl. | gender=- number=pl: 432`; 8/8 random samples are places (Tamduria, Beshan, Tower of Malḥa, Anathoth, K'far Iccum, Istunia, Shiran, Seleucia); A02211 "a Syrian town". `grammar.test.ts:24` pins the wrong value. |
| med | high | `grammar.pos` | Declared in schema (`type: string`), absent from `TruthEntry`/`BodyEntry` types, produced by nothing, present in 0 entries. Spec says "starts null — filled by post-import enrichment (register #14)". A schema field with no producer and no TS type. | `census keyPaths` has no `$.grammar.pos`; `enums.pos: {}`; `migrate/types.ts` grammar = `{gender?, number?}` |
| med | high | `grammar` (proper-noun info) | `pr. n.` (173), `pr. n. m.` (534), `pr. n. f.` (56), `pr. n. pl.` (432) — the proper-noun fact is dropped from the index (only gender survives). 1,195 entries have POS information in the marker that `pos` was meant to hold. | `genderVsMorph`: `morph=pr. n. | gender=- number=-: 173` etc. |
| med | high | `grammar.gender` enum `c` | Declared, never written: 0 of 12,557. Marker value space has no `c.` (8 distinct `morphology` values in source). | `census enums.gender: {m: 8133, f: 4424}`; `refint.out.json source.morphologyValues` (8 values, no `c.`) |
| low | high | `grammar.number` enum `du` | Declared, never written (0). `grammar.ts` maps `m. du.`/`f. du.` but the source has no such marker. | `census enums.number: {pl: 1254}` |
| med | high | `page` | Schema: optional. Data: 32,512/32,512 present, both `number` and `column`. TS: optional. Migrate gate 8 requires it. Should be `required` (with `column` required) so a hand-written entry cannot omit it. | `census keyPaths $.page: 32512, $.page.column: 32512` |
| med | high | `sense.units` | Schema: optional. TS (`TruthSense.units: string[]`) and data: always present (45,785/45,785; `unitsAbsent: 0`; 18,177 are `[]`). Should be `required` (already is in code). | `census unitsAbsent.count: 0`, `unitsEmptyArr: 18177` |
| low | high | `formObject.reconstructed` | Schema `boolean`; TS `true` only; data: `true` 1,355 times, `false` never. Tighten to `const: true` or leave; document. | `census enums.reconstructed: {true: 1355}` |
| low | high | `formObject.disambiguator` | Never 1: values 2 (765), 3 (35), 4 (4), 5 (1), 6 (1). Consistent with Sefaria numbering the second homograph `²`, but the schema minimum (1) and spec ("superscript") do not say so. | `schema-extra disambiguatorHist` |
| low | high | `sense.label` | 18 distinct values, all `\d+` or `[a-h]`; 0 non-simple. Schema only says `minLength 1` — the closed grammar (`digits | letter`) could be a `pattern`. | `census enums.labelRawDistinct: 18`, `labelRawNonSimple: []` |
| med | high | `stems[].stem` | Schema: free string. Spec: "from the closed stem set". Data: 70 distinct values; 65 stems fail a binyan-label grammar — `"*."` ×43, `"[."` ×6, `"."`, `",."`, `"(."`, `"* ."`, `"[[."`, `"Compounds and combinations: ."`, `"Compounds: ."`, `"Compounds of ."`, `"Chief compounds:."`, `"נִסְתַּר."`, `"Fem."`, `"Pl."`, `"Part. Hof."`, `"Pa., part. pass."`, `"*Nif."`, `"*Pa."`, `"*Ithpe."`, `"Nithpa"` (no period). The starred/bracketed ones are marker residue (the `*`/`[` belongs to the form). | `census enums.stem`; `schema-extra badStems.count: 65` (regex `^[A-Z][a-zë]+\.( a\. [A-Z][a-z]+\.)?$`), rids listed in `schema-extra.out.json` |
| low | high | `stems[].forms` / `stems[].senses` | 436 stems have `forms: []`, 347 have `senses: []` (schema allows both empty; `required` only guarantees presence). A stem with neither is a bare label. | `census stemFormsEmpty.count: 436`, `stemSensesEmpty.count: 347` |
| med | high | `senses[].gloss` empty | Schema allows `""`. 293 senses are `gloss:""` with no units and no children; **251 entries consist of one empty sense and nothing else** (A01175, A01345, A00914, …). Compile has nothing to render for them. 3 senses are `gloss:""` with units (D01114, M00211, M02852 — a sense whose text was fully consumed as a unit). | `census emptyGlossNoUnitsNoChildren.count: 293`, `emptyGlossWithUnits: 3`; `schema-extra emptyEntries.count: 251` |
| low | high | first sense labelled | Body-model spec §2: "The first sense is unlabeled — it is the entry's intro flow." 1,030 entries have a labelled first sense (the implied-`1)` insertion, register #16). The spec text and the data disagree; the schema cannot express the rule either way. | `census firstSenseLabelled.count: 1030`; `senseShapes LGU-: 9204` etc. |
| low | high | label sequences | Non-contiguous or duplicated label runs remain: `1|3` 15, `1|3|4` 7, `1|2|4` 3, `2` 6, `2|3` 1, `1|2|2` 1, `1|2|2|3|4` 1, `1|2|3|5` 1, `1|3|4|5` 1, `1|4` 1 (37 entries). These are the sense-run classes routed to judgment. | `census labelSequencesTop` |
| med | high | `headword.text` (representation) | Homograph numeral still inside `text` on 10 headwords (`אוּרְיָה  I, II`, `בַּד  V`, `מוֹזְלָא , I`, …) — one concept in two representations (`homograph` field vs text). All 10 are the H1 rows patched in PR #114 and not yet written to the tree. | `schema-extra romanInHeadwordText` (10 rids); `refint slugStemVsHeadword.differs: 11` |
| low | high | `headword.text` (notation) | 22 headwords contain a space, 10 parentheses, 10 Latin letters, 9 commas, 2 `*`, 2 `=`, 1 `?`, 1 superscript; alts: 276 spaces, 2 parens, 1 `?`. The `headword-unparsed` review row (300) is the live list. | `census headwordTextIssues`; `docs/v2/review-report.md` |
| low | high | `altHeadwords` | 2 entries carry a duplicated alt (P01533, S00146); 6 have an alt equal to the headword (A02981, A00736, E00199, O00524, Q01624, U00076). Schema has no `uniqueItems`. | `census dupAltHeadword`, `altEqualsHeadword` |
| med | high | key order (nested) | Migrate spec §2.6: "Fields in schema order". Top level is; nested objects are **insertion order from `finish.ts`**: sense `gloss,units,label[,senses]` (10,786 objects, schema says `label,gloss,units,senses`), stem `forms,senses,stem` (4,826; schema `stem,forms,senses`), form `text,reconstructed,homograph` (118; schema `text,homograph,disambiguator,reconstructed`). Deterministic, but neither schema-ordered nor sorted. | `schema-extra keyOrder` (entries marked "NOT schema order"); `finish.ts:101-106` sets `label`/`senses` after `units`; `sortedKeys: {sorted: 90855, unsorted: 81361}` |
| low | high | `additionalProperties` | `false` at every object level (entry, form, page, grammar, sense, stem) — no gap. Unknown keys fail. | schema text |
| low | high | `id` ↔ path | 0 mismatches between file dir/name and `id`; 0 duplicate ids. | `census idMismatch: [], dirMismatch: [], dupIds: []` |

### 1.3 Inline markup vocabulary

Spec §2.3 vocabulary: `he`, `i`, `cite[ref][k]`, `sup`, `sub`, `b`, plus "abbr override tags (rare)". `validate.ts` `VOCABULARY` = `{b, cite, he, i, sub, sup}`; a cite may carry exactly one attribute `ref`.

| tag | opens | by field | note |
|---|---|---|---|
| `cite` | 170,134 | unit 127,351 / gloss 42,783 | attribute `ref` on 170,134 (100%); `k` on 0; no other attribute (`census tagAttrs`, `schema-extra citeRefExtraAttr: 0`) |
| `he` | 166,994 | unit 119,395 / gloss 47,599 | |
| `i` | 46,119 | gloss 36,251 / unit 9,868 | |
| `sup` | 311 | unit 216 / gloss 95 | |
| `b` | 20 | gloss 20 | spec: "expected to dissolve" — still present in 20 files (A00778, A00051, A01119, A03105, A00777, J00174, J00615, C00577, E00231, K00026, K00440, K00488, K00446, K00978, K00020, K00468, K00521, K00510, K00592, K00584) |
| `sub` | 10 | gloss 5 / unit 5 | |

Tags outside the vocabulary: **0**; stray `<`/`>`: 0; self-closing: 0; entities: `&c;` ×3 (U00175, A01281, M00307 — an OCR'd "&c." with `;`, not an HTML entity; harmless but will render as-is).

| sev | conf | claim | evidence |
|---|---|---|---|
| med | high | `cite@ref` values split 98,758 external-looking / 71,376 rid; 0 empty, 0 Hebrew, 0 unclassifiable. External refs have no corpus/category field — compile must classify by string. | `census citeRefClass` |
| med | high | **2,739 cites point at their own entry** (2,226 files), e.g. A00077 `[Y. Ter. I, 40ᵇ <cite ref="A00077">אבוס</cite> read …]`. Legitimate text, but compile must decide whether a self-link renders as a link. Not mentioned in any spec. | `census selfRefs` |
| low | high | Nested `<cite>` inside `<cite>` in 3 files (J00597, J00603, O00832) — balanced, so `validate.ts` accepts; the migrate report flags them `markup-carry`. | `census nestedCite`; local report rows |
| med | high | Hebrew text outside `<he>` in 543 files (unit 393, gloss 230 fields), e.g. J00597 gloss `—י׳ לנכסי <i>to take possession…`. The spec makes `<he>` the direction/font signal; the renderer will get these wrong unless it also detects script. | `census hebrewOutsideHe` |
| low | high | Whitespace: gloss trailing space 29,473, leading space 10,079; unit trailing space 37,396; double space 164 gloss / 44 unit / 7 headword. Byte-faithful to source, but every renderer trims. | `census glossTrailingSpace` etc. |

## 2. Hebrew / Unicode

`schema-extra.ts` (regexes per class over every text field) plus `census-entries.ts`. Per field:

| class | headword.text | altHeadword.text | gloss | unit | stem.form | stem.stem | slug | notes |
|---|---|---|---|---|---|---|---|---|
| non-NFC | 0 | 6 | 73 | 76 | 9 | 0 | 0 | = 164 strings (matches #110) |
| presentation forms U+FB1D–FB4F | 0 | 0 | 0 | 0 | 0 | 0 | 0 | |
| directional U+200E/F, 202A–E, 2066–69 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | |
| nbsp U+00A0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | J00217 |
| zero-width U+200B–D/2060/FEFF/034F | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 4 files: U01553, N00571, T00381, S01746 — U+200C between `</he>` and `<he>` |
| combining mark after Latin | 0 | 0 | 12 | 10 | 0 | 0 | 0 | decomposed `Ḥ`, `ḳ`, `ạ`, `ẹ`, `ṇ` — these are the non-Hebrew members of the 164 |
| ASCII `"` as gershayim | 0 | 0 | 0 | 0 | 0 | 0 | 0 | the gershayim rule normalised all of them in entries |
| tab | 0 | 0 | 0 | 1 | 0 | 0 | 0 | |
| Hebrew point after non-Hebrew | 2 | 3 | 11 | 3 | 0 | 0 | 0 | torn forms (X1/X3 class, e.g. U00489 `ׁוּף`) |

| sev | conf | path | claim | evidence |
|---|---|---|---|---|
| med | high | `data/page-index/entries.jsonl` `headword` | 68 rows carry ASCII `"` for gershayim (`אאלר"ן`) where the entry has `״`; 62 rows have real geresh/gershayim. The column is the raw Sefaria string, so it will always differ from the normalised entry (180 rows differ in total). Fine as evidence; wrong as a lookup key. | `schema-extra pageIndex.headword.asciiQuoteAsGershayim: 68`; `refint pageIndex.headwordVsEntryRegen.differs: 180` |
| — | high | lookup keys NFC | slug-index 0 non-NFC (32,512), aliases 0 (4,412), entry `slug` 0, page-index `headword` 0 (32,512), columns `headword` 0 (3,370). `slug-index.ts rejectNonNfc` enforces it on load. | `refint slugIndex.slugNonNfc`, `aliases.nonNfc`, `pageIndex.headwordNonNfc`, `columns.headwordNonNfc`; `schema-extra slugIndex` |
| low | high | slug charset | Hebrew letters 152,577, hyphen 11,654, digits 11,649, gershayim 69, geresh 58, `=` 2. The 2 `=` are the known unsafe slugs (A01175, A01345). | `refint slugIndex.charset`, `unsafe: 2` |

## 3. Referential integrity (summary of `refint.out.json`)

| check | result | evidence |
|---|---|---|
| rid uniqueness | 32,512 distinct; 0 duplicates across files | `refint entries: 32512`; `census dupIds: []` |
| rid contiguity | 22 letter runs with no interior gaps; **נ starts at N00001** (no `N00000`); `letters.json` records `N00001` as the letter's first rid | `refint ridGaps: ["N starts at 1"]`, `pageIndex.letters.ridNotZero: ["N00001"]` |
| source ↔ entries | 32,512 source rids = 32,512 entry ids, 0 either way | `refint source.notInEntries: 0, entriesNotInSrc: 0` |
| internal cite targets | 71,376 rid-shaped refs; 0 unresolved | `census unresolvedInternal.count: 0` |
| slug-index ↔ entries | 32,512 rows, all `status:"live"`, rid-sorted; 0 dup rid, 0 dup slug, 0 entry without row, 0 row without entry, 0 slug mismatch | `refint slugIndex.*` |
| slug families | 4,412 numbered families / 11,640 members; 0 bare slug held by a numbered family | `refint slugIndex.numberedFamilies`, `bareHeldAndNumbered: 0` |
| aliases | 4,412 rows, slug-sorted; 0 dup, 0 missing target, 0 colliding with a real slug, every family has one, every alias → the family's first member | `refint aliases.*` |
| page-index ↔ entries | 32,512 rows, 0 dup rid, 0 missing either way; `page`/`column` byte-equal to every entry's `page` | `refint pageIndex.entryNoPage: 0, pageNoEntry: 0, pageMismatchVsEntry: 0` |
| columns.jsonl | 3,370 rows; 0 `rid` missing, 0 `continuedFrom` missing | `refint pageIndex.columns` |
| letters.json | 22 rows, all column `a`, every rid exists, every row agrees with entries.jsonl | `refint pageIndex.letters.disagreeWithIndex: []` |
| quarantine | `[]`; 0 unresolved targets — consistent | `data/quarantine/internal-targets.json`; migrate gate `internalTargets` 0/0 |
| patches | 302 patches, 302 unique ids, 0 rid missing, 302/302 pins = `snapshot.lock`; manifests: 0 rid missing, 0 dup rid within a file | `refint patches.ids/idDup/ridMissing/pins`, `manifestRidMissing: []` |
| snapshot.lock ↔ manifest | lock pin `sha256:75bbc5ee…`; the two per-file hashes equal `manifest.json` `outputs[].sha256` | both files read |

**Violations: 0.** Quirks worth a note: the N00000 hole (upstream numbering), and 15 descending page steps (§4).

## 4. Sidecar formats

| sev | conf | path | written schema? | README ↔ rows | evidence |
|---|---|---|---|---|---|
| low | high | `data/page-index/columns.jsonl` (3,370) | README field table; no JSON schema; TS types in `admin/pipeline/page-index/` | Keys match the table exactly (`column,confidence,continuedFrom,guideOcr,headword,leaf,letter,letterChange,page,rid,volume` on 3,370/3,370). README says `continuedFrom` is a rid; first row is `null` (undocumented). | `refint pageIndex.columns.keys` |
| med | high | `data/page-index/entries.jsonl` (32,512) | README gives only the row count; fields not tabled; `PagePlacement` type in `migrate/page.ts` | Keys `column,confidence,headword,page,rid,volume` on 32,512/32,512. README says pages "1–1704": **max is 1705**. README: "Monotonicity guaranteed structurally": **15 descending steps** — 14 are letter-change pages (README's own 4-block reading order: `A03456 134b → B00000 134a` etc.), **1 is not**: `G00739 415b → G00740 415a` (a ז entry placed in the bottom band of the ח page). | `schema-extra pageIndex.nonMonotonic` (15 listed); `volRange` |
| med | high | `data/page-index/*` volume boundary | vol 1 rows run to p.690 (`K01393` 690a low, `K01394` 690b medium, leaf 713); vol 2 begins at p.685 (`L00000`, leaf 8). Pages 685–690 are claimed by both volumes; columns.jsonl has the same 2 vol-1 heads. The last two כ entries are almost certainly on vol 1's back-matter leaves. | `schema-extra pageIndex.volRange`; columns query in session (`2` vol-1 rows ≥684) |
| low | high | `data/page-index/letters.json` | README: 22 rows, "where each letter starts"; no field table | Rows agree with entries.jsonl; all column `a` as README requires | `refint pageIndex.letters` |
| low | high | `data/page-index/build-report.json` | none | counts agree with rows (placement 30,321/1,893/298; heads 2,663/680/27) | file read |
| low | high | `data/slug-index/entries.jsonl`, `aliases.jsonl` | README + `SlugRow`/`AliasRow` types + load-time checks (`rejectNonNfc`, rid regex, status enum) | Rows match README: `{rid,slug,status}` rid-sorted, all `live`; `{rid,slug}` slug-sorted. No JSON schema. | `refint slugIndex.keys`, `aliases.keys` |
| med | high | `data/patches/patterns.jsonl` (155) | **none** — no README, no TS type, no schema; 3 key shapes (`blocking,corpusCount,description,id,reason,round,route,status` 106; +`entangledWith` 27; without `blocking`/`route` 22). `route` ∈ {transform 56, judgment 72, blocked 5, absent 22}; `status` ∈ {candidate 131, discarded 24}. Consolidation §4.1 calls these "72 judgment classes… port detectors one class at a time", so it is a live input to future detector work with no contract. | `refint patches.perFile[patterns.jsonl]`; route/status counts run in session |
| low | high | `data/patches/reviewed/` | README + `schema.ts` | 112 patches (96 seeded + 16 from #114), 85 manifest rows (66 repaired + 3 needs + 16), matches README arithmetic. `manifest.jsonl` row shape undocumented beyond prose (5 key shapes across all manifests). | `refint perFile`, `manifestKeys` |
| low | high | `data/patches/pilot/`, `tranches/*` | `schema.ts` for `patches.jsonl`; manifest/verdict/reject shapes undocumented | **Live production inputs**: `apply.ts` `TRANCHES` names 10 dirs in explicit order (`tranche-01` pre-patch, 8 healed, 2 seed dirs); `pilot/patches.jsonl` is the pre-patch carry-over set (5 carried in the local run). Not stale. But each dir also holds `verdicts-*.jsonl` (28 files, 3 key shapes), `report-batch-*.md`, `README.md`, `rejects.jsonl` (all 0 rows except pilot 1) — sweep-era evidence, not inputs — plus an untracked-by-purpose `data/patches/tranches/.claude/` directory. | `apply.ts:118-135`, `refint patches.files`, `verdictKeys`, `rejects` |
| low | high | `data/patches/snapshot.lock` | 3-line text, format undocumented (pin line + 2 `path sha256:` lines) | hashes match `manifest.json` | file read |
| low | high | `data/quarantine/internal-targets.json` | `[]`; row shape (`rid`, `target`, `reviewed`) only in migrate spec §4.1 gate 6 prose; no schema, no README | 0 rows | file read |
| — | high | `data/source/` in git | Tracked: `jastrow-dictionary.jsonl` (42.9 MB), `lexicons.json`, `manifest.json` — purely the fetched snapshot (`fetch.ts`, PR #25). **The four `*-report.json`, `edit-replay.jsonl` (96 MB) and `migration-report.json` are gitignored local files**, not repo content; `.gitignore` already records that five of them have no live writer. Nothing to archive in git; the local copies are harmless leftovers (`body-migration-report.json` 11.7 MB dated Aug 31). | `git ls-files -s data/source`; `.gitignore` |
| med | high | `data/source/migration-written.json` | Consolidation §3.2 makes this committed file (`writtenTree`) the base for the update-run three-way merge. **It does not exist**, and `migrate.ts` has no writer for it. Until it does, `ours − base` is uncomputable and every future update run is a fresh run. | `ls data/source`; grep `migration-written` in `admin/pipeline` → 0 hits |
| low | high | `data/pointers/` (spec §2.4) | Does not exist; nothing reads or writes it. Optional by design; note that compile's browse index will need the "no pointers" case handled. | `ls data/pointers` → ENOENT |

## 5. Patch model

Read: `admin/pipeline/patch/schema.ts` (full), `patch/apply.ts` (loader/order), `data/patches/RUNBOOK.md`, `reviewed/README.md`, consolidation §4.2, #113.

| sev | conf | claim | evidence |
|---|---|---|---|
| **high** | high | **Patches address the source shape, not entry data.** Targets are `sense[<token>]:<anchor>` over `SourceSense.definition`/`number`, `refs[<item>]:<anchor>` over the dropped `refs[]`, `forms:<anchor>` over `headword`+`alt_headwords` strings. `applyPatch(entry: SourceEntry)`. There is no op that names a `gloss`, a `unit`, a `label`, a `stem`, `page` or `grammar`. A post-go-live admin edit therefore cannot be a patch unless the admin tool rewrites it in Sefaria's vocabulary against the pre-composition text. | `schema.ts:38-47` (target regexes), `:316` signature; `body/types.ts` |
| med | high | Op vocabulary (8, not "seven" as the header says): `split`, `join`, `retag`, `move`, `delete`, `replace`, `unref`, `reform`. Missing for #113 and for admin: add-sense, set-gloss (A01175/A01345 have one empty sense and no text to `replace` inside), add/remove unit, edit `page`, edit `grammar`, add/remove an alt form without rewriting the whole block. | `schema.ts:53-61`, header line 5; #113 body |
| med | high | **Authorship is not in the record.** `author?: 'human'` is "set only by the loader, from the directory… A record never carries it." Agent patches carry no agent/model id either; `prompt_version` is overloaded as provenance (`human-review-2026-08-05` 96, `headword-walkthrough-2026-09-20` 16, `doc-08-seed` 76, `v1`–`v10` 91, `doc-08-runs` 23). A human patch moved out of `reviewed/` silently becomes an agent patch and hits the no-new-text floor. | `schema.ts:141-145`; `refint patches.authorFieldPresent: 0`, `promptVersions` |
| low | high | Precondition model: `expected_before` (exact text) + 8-hex content anchor derived from it + `expected_occurrences`/`occurrence_index` + per-patch `snapshot` pin (302/302 = lock). Drift → `upstream-fixed`/`upstream-changed` rows (0/0 locally), `--strict` refuses. Sound for its purpose. | `schema.ts:140-163`; local report `patches`, `snapshot.stalePins: 0` |
| med | high | **Reproducibility hazard 1:** 8 of 10 tranche dirs are `healed` — their `expected_before` is the text *after* both transform phases. A transform-rule revision changes that text and the patch reports drift (or, for carry-overs, `absorbed`). `reviewed/README.md` already names P000210 and P000221 as rule-dependent. Patches are pinned to the snapshot but not to the rule set. | `apply.ts:118-135`; `reviewed/README.md` |
| med | high | Hazard 2: tranche application order is a hardcoded list in code (`TRANCHES`), not data; a new dir is an error, a reorder silently changes results ("one tranche per rid supersedes" — Ruling C). | `apply.ts:110-135` |
| low | high | Hazard 3 (known, §4.2): a carry-over whose target resolves 0 times is `absorbed`, indistinguishable from an upstream rewrite. 61 absorbed in the local run. | local report `patches.absorbed: 61` |
| low | high | `reform` is byte-unbounded (whole headword block); by ruling it may only live in `reviewed/`, but `schema.ts` does not enforce the directory — the loader's `author` stamp is the only guard. | `schema.ts:88-102` |
| low | high | Manifests carry 912 `needs_*` records (`needs_human_judgment` 648, `needs_print_check` 264) across all dirs, 2,204 `defer` review rows in the report — routed post-go-live by ruling. Disposition vocabulary (`clean`/`repaired`/`needs_human_judgment`/`needs_print_check`) is undocumented outside RUNBOOK prose. | `refint patches.manifestDisp`, `manifestUnresolvedNeeds`; `docs/v2/review-report.md` |

## 6. Readiness for compile / admin

Inputs data-architecture §3 needs and their state:

| input | present | stable | note |
|---|---|---|---|
| entry data (32,512, schema-valid) | yes | **one PR behind** — local dry run: `slug-changed` 7 (F00009, I00158, I00654, I00655, M02116, Q00752, Q00000), `patches.reviewed` 112 vs tree written from 96 | `git log -- data/entries` last 7de656a6 (2026-09-18); `reviewed/patches.jsonl` last 12a40a30 (2026-09-20) |
| route map (slug ↔ rid) | `data/slug-index/entries.jsonl` | unfrozen by design (`SLUGS_FROZEN=false`); 2 unsafe | `slug-index.ts:40` |
| alias landing | `aliases.jsonl` 4,412 | data only; redirect-vs-disambiguation is "an app decision" — **undecided** | consolidation §7.2 |
| page index (`/p/2a`) | `page-index/entries.jsonl` | 2,191 non-high placements; the 2-row volume overlap and 1 non-letter-change descending step | §4 |
| quarantine list | `[]` | stable | |
| display headword | regenerable from the form object (`*?text( roman)?( sup)?`): 32,332/32,512 page-index headwords byte-match the regeneration; the 180 differ only by normalisation the pipeline applied | `refint pageIndex.headwordVsEntryRegen` |
| search keys | **no field**: `headword.text` + `altHeadwords[].text`; ~2,474 abbreviated alternates (headword-design X6/H6) are indistinguishable from real keys without `partial` | headword-design §4 |
| sense-level addressing | none (D8): 0 of 71,376 internal refs carry a sense pointer; `<cite>` has no sense attribute; labels are not unique (`1|2|2`) and not stable across the deferred Group D renumbering | consolidation §10 "Group D precondition" |
| reference-index corpus categorisation | no field; 98,758 external ref strings only | §1.3 |
| pointer-entry classification | compile pattern on gloss (`v.`-only); 251 entries have an **empty** gloss and match nothing | §1.2 |
| `grammar` typed index | present on 12,989; **432 wrong `number`**; no `pos` | §1.2 |
| abbreviations.json / override tags | not in data (by design D15); 0 override tags exist | |
| version manifest | build-time (git sha) | no per-entry version | |

**Admin round-trip (read → edit → write):**

| sev | conf | claim | evidence |
|---|---|---|---|
| med | high | Content is lossless (plain JSON, no derived fields, no comments). Form is not: the canonical byte form = `JSON.stringify(entry, null, '\t')` with **finish.ts's insertion order** (top level schema order, nested `gloss,units,label,senses` / `forms,senses,stem` / `text,reconstructed,homograph,disambiguator`) then `biome format --write`. No shared serializer module exists; an admin tool that builds the object any other way reorders keys in every file it touches. | `finish.ts:155-180`, `migrate.ts:597-617`; `schema-extra keyOrder` |
| med | high | Two edits are refused by `bun qa` unless a sidecar moves with them: `slug` (must equal the slug-index row — but `SLUGS_FROZEN=false` means the next `--write` reassigns it anyway) and `page` (must equal the page-index row, R2). The admin tool must write three files for one page correction. | `validate.ts checkSlugs/checkPages`; consolidation §10 |
| med | high | **No provenance/version field per entry.** Spec §3.2 chooses git-tree provenance instead — but the artifact it depends on (`migration-written.json`) does not exist (§4). Today `ours − base` cannot be computed, so an admin edit made now would be overwritten by the next `--write` (which also refuses a non-empty tree). | `migrate.ts` (empty-tree guard), `ls data/source` |
| med | high | Two edit channels that do not meet: patches edit the source shape pre-composition; the admin tool edits entry data post-composition. A hand edit is invisible to every patch precondition and to the review detectors; a patch is invisible to the merge until the next run. The spec accepts this (§3.2 merge), but nothing today records which channel produced a byte. | §5 first row; consolidation §3.2 |

**Headword-design §2 (`headwords[]` + `display` + `partial` + per-form `gender`).** What adopting it changes in the schema: `headword`/`altHeadwords` → `headwords` (`minItems: 1`, index 0 primary); new `display` string with the six §3.1 rules (each `{n}` once; no Hebrew; marker agreement) — not expressible in JSON Schema, needs `validate.ts` code; `partial: true` on a form; `gender` on a form with the cross-field constraint "either `grammar.gender` or every form has `gender`, never both" (also code, not schema); slug derived from `headwords[0]` (stripping notation even when partial); page-index `headword` column semantics; `regen` gate (migrate 2.1) becomes template expansion; `plainFields` in `validate.ts`; the `reform` payload (`headword: string, alt_headwords: string[]` → forms + display); review-row kinds (`paren-group-close-unknown`). **Is adoption before compile necessary?** Compile's emit stage consumes exactly the fields this changes — display headword, browse rows for alternates, search keys (which need `partial` to exclude ~2,474 abbreviations and to keep the 34 truncated primaries), and the browse-row collision rule over alt forms. Writing emit against today's shape means rewriting it. Compile's validate/transform stages (vocabulary, ref resolution, reference-index derivation, abbr detection) do not touch headword shape and can start now. Recommendation: fix the shape (adopt §2, or explicitly defer it with a `schemaVersion`) before emit is coded; there is no `schemaVersion` field today to make a later breaking change safe (spec §2.5 promises "versioned, reviewed import script" but nothing in the data says which version a file is).

## 7. Size / format

| sev | conf | claim | evidence |
|---|---|---|---|
| — | high | Deterministic: `migrate.ts --write` ends with `biome format --write data/entries` (spawned by migrate itself, `biomeBinary()`); `biome.json` includes `data/entries/**/*.json` explicitly with the linter off. `biome format --check` over 32,512 files: "No fixes applied". | `migrate.ts:597`, `biome.json files.includes`, scratchpad `biome-format-check.log` |
| low | high | Keys not sorted (90,855 objects sorted by coincidence, 81,361 not); order is code-defined (§1.2). `useSortedProperties` applies to TS literals, not to emitted JSON. | `schema-extra sortedKeys` |
| — | high | Sizes: 32,512 files, 28,004,739 bytes total; min 197 B, median 540 B, p99 4,817 B, max 18,573 B (`A/…`); **0 files > 1 MB**; 0 non-JSON files in the tree. | `census sizeStats`, `bigFiles: []`, `nonJsonFiles: []`; `schema-extra sizes` |
| low | high | Layout: 22 letter dirs `A`–`V` (A 3,457 … F 118), one per Hebrew letter, final forms have no dir of their own (rid letters are per base letter). Documented in migrate spec §2.6 ("A–V, 22 directories"); **data-architecture §2.1 still says "~26 letter directories"** (stale). No doc gives the letter→rid-prefix table except `data/page-index/letters.json`. | `census letterDirs`, `perDir`; spec grep |

## Schema decisions needed before compile

Numbered; each with a recommended default. "Before" = must be settled before compile's emit stage is written; "can wait" = additive later.

1. **Headword shape (before).** Adopt headword-design §2 (`headwords[]`, `display`, `partial`, per-form `gender`) or freeze today's `headword`/`altHeadwords` with a `schemaVersion`. *Default: adopt §2 now, with `display` optional (unset = flagged) and the §3.1 rules in `validate.ts`; add `"schemaVersion": 2` to every file so the next breaking change has a handle.*
2. **`grammar.number` for `pr. n. pl.` (before).** Stop writing `number: "pl"` for the 432 place names. *Default: map `pr. n. pl.` → `{ pos: "pr.n.pl" }` or `{}`; fix `grammar.ts:53` and `grammar.test.ts:24`; this is a rule change so it needs `transform:invariants`/corpus baselines re-run.*
3. **`grammar.pos` (before, cheaply).** Either drop it from the schema until register #14 produces it, or seed it now from the marker (`pr. n.`, `pr. n. m.`, `pr. n. f.`, `pr. n. pl.` = 1,195 entries) with a closed enum. *Default: seed a closed enum `{"pr.n","pr.n.m","pr.n.f","pr.n.pl"}` from the marker — it is mechanical and the data is already in the gloss; leave verbs/nouns for #14.*
4. **Unused enum members and optionality (before, trivial).** Remove `gender:"c"` and `number:"du"` (0 uses, no marker), make `page` (+`column`) and `sense.units` `required`, set `reconstructed` to `const: true`, add `pattern: "^(\\d+|[a-z])$"` to `label`. *Default: do all five; ajv still passes 32,512/32,512.*
5. **`stems[].stem` vocabulary (before).** Decide whether `stem` is a closed enum (spec: "the closed stem set") or free text. 65 stems are marker residue (`"*."`, `"[."`, `"Compounds…"`). *Default: closed enum of the ~40 real binyan labels; route the 65 to a rule that moves `*`/`[` to the form and a review row for the rest.*
6. **Empty entries (before).** 251 entries are one empty sense. Decide the representation of a cross-reference whose text lives only in the headword (A01175-class) and of genuinely empty senses. *Default: schema keeps `gloss:""` legal but compile treats an all-empty entry as a review row, and #113 gets a `set-gloss`/`add-sense` op.*
7. **Sense addressing (can wait, but decide the rule).** No sense id exists; labels are not unique or stable. *Default: keep D8 (entry-level only); when needed, address by path (`senses[2].senses[0]`) computed at compile, never stored — and finish Group D first.*
8. **Canonical serializer (before the admin tool, not before compile).** Publish one function (`serializeEntry`) that fixes key order (schema order at every depth, not insertion order) and is used by migrate and the admin tool. *Default: schema order everywhere — a one-time reorder of nested keys in 32,512 files, then no further churn.*
9. **Provenance (before the admin tool).** Write `data/source/migration-written.json` (`writtenTree`) at `--write` as §3.2 specifies, or add a per-entry `origin`/`edited` field. *Default: the spec's tree id — no schema change — but it must actually be written before any hand edit lands.*
10. **Patch reach (before the admin tool).** Decide whether admin edits are patches (then add entry-data ops: `set-gloss`, `add-sense`, `set-page`, `set-grammar`, `add-form`) or plain file edits merged by §3.2. *Default: plain edits + the merge; keep patches for source-shape defects; record `author` in the patch record rather than inferring it from the directory.*
11. **Self-cites and Hebrew outside `<he>` (can wait, compile rule).** 2,739 self-references and 543 files with bare Hebrew need a render rule, not a schema change. *Default: self-cite renders as text; renderer applies `dir=rtl` by script detection as a fallback.*
12. **Sidecar contracts (can wait).** JSON schemas (or a documented TS type + README table) for `page-index/entries.jsonl`, `patterns.jsonl`, manifest/verdict rows, `internal-targets.json`; fix the page-index README (1–1705; the 15 descending steps and the vol-1 p.685–690 overlap). *Default: one `admin/pipeline/schema/*.schema.json` per sidecar, validated in `truth.test.ts`.*
13. **Alias landing (can wait, app decision).** Redirect to `stem-1` vs disambiguation page. *Default: disambiguation page, as data-architecture §4 already describes; the alias row needs no change either way.*
