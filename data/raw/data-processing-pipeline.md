# Jastrow Dictionary Data Processing Pipeline

This document describes the data transformation pipeline that converts raw Jastrow dictionary data (sourced from Sefaria) into optimized JSONL files for the web application. The processing scripts lived in `data-processing/` and have been archived after the pipeline reached stability.

## Overview

**Input:** `data/raw/jastrow-part1.jsonl`, `data/raw/jastrow-part2.jsonl` (raw Sefaria exports)
**Output:** `data/jastrow-part1.jsonl`, `data/jastrow-part2.jsonl` (optimized for the client)

The pipeline was run via `node process.js` (or `--dry-run` for statistics only). It processed entries sequentially through 8 transformation stages, then wrote the results with a `version.json` timestamp for IndexedDB cache invalidation.

## Transformation Stages

### Stage 1: Language Extraction (`extract-language.js`)

Extracts structured language metadata from the raw `language_code` and `language_reference` fields.

- **Input fields:** `language_code` (HTML string with abbreviations like "ch.", "b. h.", "Ar."), `language_reference` (HTML with links)
- **Output fields:** `language_info` (merged HTML with rewritten links), `grammar.language` (classification tag)
- **Classification rules** (first match wins):
  - `ch.` + `= h.` → `ar+he` (Aramaic + Hebrew)
  - `ch.` + `= b.` → `ar+bh` (Aramaic + Biblical Hebrew)
  - `h. a. ch.` or `h. = ch.` → `he+ar` (Hebrew + Aramaic)
  - `ch. = <other>` → `ar` (Aramaic equivalent)
  - `b. h.` (no `ch.`) → `bh` (Biblical Hebrew)
  - `ch.` alone → `ar` (Aramaic)
  - `Ar.` → `ab` (Arabic)
  - `h.` alone → `he` (Hebrew)

### Stage 2: Morphology Extraction (`extract-morphology.js`)

Extracts part-of-speech and gender from entry content.

- **Source 1 (priority):** If any sense has `grammar.verbal_stem` or `grammar.binyan_form` → POS = `v` (verb)
- **Source 2:** Pattern matching against the start of the first sense's definition text (HTML-stripped):
  - `pr. n. m.` → noun, masculine
  - `pr. n. f.` → noun, feminine
  - `m. pl.` / `f. pl.` → noun with gender
  - `interj.` → interjection, `part.` → participle, `conj.` → conjunction
  - `adj.` → adjective, `adv.` → adverb
  - `m.` / `f.` / `n.` / `v.` → noun/verb with optional gender

### Stage 3: Link Rewriting (`rewrite-links.js`)

Rewrites Sefaria-format `refLink` anchors into application-appropriate links.

- **Jastrow cross-references** (B1): `<a class="refLink" href="/Jastrow,_WORD.N">` → `<a href="#WORD" class="word-link">` (internal navigation)
- **Sefaria text references** (B2): `<a class="refLink" href="/PATH" data-ref="REF">` → `<a href="https://www.sefaria.org/REF" target="_blank" rel="noopener noreferrer" class="ref-link">` (external links)
- Also extracts `data-ref` values before rewriting for use in reference categorization (Stage 5)
- Processes all senses recursively, including nested sub-senses

### Stage 4: Abbreviation Marking (`mark-abbreviations.js`)

Wraps known dictionary abbreviations with `<abbr>` tags for tooltip display.

- **Source:** `data/raw/jastrow-abbr.json` — list of abbreviation → expansion mappings
- **Minimum length:** 3 characters (shorter abbreviations excluded due to false positives)
- **Application order:** Longest abbreviations first to prevent partial matches
- **Boundary matching:** Custom word boundaries (preceded by whitespace/`(`/`;`, followed by whitespace/`)`/`,`/`;`)
- **HTML safety:** Only applies to text nodes; skips content inside `<a>` and `<abbr>` tags
- After each replacement, re-splits the HTML to prevent nested `<abbr>` tags from subsequent patterns

### Stage 5: Reference Extraction & Categorization (`extract-references.js`, `ref-categories.js`)

Builds structured, categorized reference lists from both inline HTML refs and the entry's `refs[]` array.

- **Categories:**
  - `t` (Talmud) — Bavli, Yerushalmi tractates, Mishnah, Tosefta, Pirkei Avot, minor tractates
  - `b` (Bible) — Torah, Nevi'im, Ketuvim book names
  - `mi` (Midrash) — Rabbah collections, Tanchuma, Pesikta, Mekhilta, Sifra/Sifre, etc.
  - `j` (Jastrow) — Cross-references to other dictionary entries
  - `o` (Other) — Unclassified references
- **Deduplication:** Each unique reference string appears only once per entry
- Replaces the flat `refs[]` array with a structured `references` object

### Stage 6: Field Stripping (`strip-fields.js`)

Removes unnecessary fields to reduce data size.

- **Always removed:** `_id`, `parent_lexicon`, `language_code`, `language_reference` (data extracted in earlier stages)
- **Removed when empty:** `quotes`, `plural_form`, `alt_headwords` (only stripped if empty arrays)
- The old `refs[]` array is deleted after reference extraction (handled in `process.js`)

### Stage 7: HTML Sanitization (`sanitize-html.js`)

Validates all HTML content against an allowlist. Runs last so all prior transforms are covered.

- **Allowed tags:** `a`, `abbr`, `b`, `br`, `div`, `em`, `i`, `p`, `span`, `strong`, `sub`, `sup`
- **Allowed attributes:** `href`/`class`/`target`/`rel` on `<a>`, `title` on `<abbr>`, `dir`/`class` on `<span>`, `class` on `<div>`, `class`/`dir` globally
- **Security:** Blocks `javascript:` in href attributes
- **Behavior:** Reports violations as warnings (does not strip) — unexpected content should be investigated, not silently removed
- Checks all sense definitions recursively plus the `language_info` field

### Stage 8: Key Shortening (`shorten-keys.js`, `key-map.js`)

Compresses JSON keys to reduce payload size. Applied recursively to all nested objects and arrays.

**Entry-level key mappings:**
| Long Key | Short | Description |
|---|---|---|
| headword | hw | Hebrew/Aramaic headword |
| rid | id | Unique entry identifier |
| page | p | Printed page number |
| column | col | Column on printed page |
| content | c | Entry content wrapper |
| next_hw | nh | Next headword |
| prev_hw | ph | Previous headword |
| grammar | g | Grammar metadata |
| language_info | li | Language info HTML |
| references | rf | Categorized references |
| alt_headwords | ah | Alternative headwords |
| plural_form | pf | Plural form |
| quotes | q | Quotations |
| morphology | mo | Raw morphology string |

**Sense-level:** `senses` → `s`, `definition` → `d`, `number` → `n`, `verbal_stem` → `vs`, `binyan_form` → `bf`

**Grammar values:** Languages: `ar`/`he`/`bh`/`ar+he`/`ar+bh`/`he+ar`/`ab`. POS: `n`/`v`/`a`/`av`/`pt`/`ij`/`cj`. Gender: `m`/`f`.

**Reference categories:** `t` (talmud), `b` (bible), `mi` (midrash), `j` (jastrow), `o` (other)

## Post-Processing: Word Link Resolution (`resolve-word-links.js`)

A separate script run after the main pipeline to resolve word-links from `#headword` format to `#rid:ID` format.

- **Problem:** Word-links use `href="#שָׁחוֹר II"` with vowels and disambiguation, but the search system normalizes these away
- **Solution:** Builds a headword → rid index, then rewrites all `word-link` hrefs to `#rid:ENTRY_ID`
- **Unresolved links:** 34 headword targets could not be resolved (mostly abbreviated letter-name entries). These are tracked in the output for future manual review.

## Sages Data Processing (`process-sages.js`)

Separate pipeline for Talmudic Sages data.

- **Input:** `data/sages-source.json`
- **Output:** `data/sages.json`
- **Validation:** Checks required fields (id, name.en, name.he, era, generation, location), validates enums (era: tanna/amorai, location: israel/bavel), verifies relationship target IDs exist, checks for duplicate IDs
- **Statistics:** Reports counts by era, location, relationships, and landmarks

## Data Format Example

**Raw entry (before processing):**
```json
{
  "_id": "...",
  "parent_lexicon": "Jastrow Dictionary",
  "headword": "אָב",
  "rid": "A00001",
  "page": "1",
  "language_code": "<i>b. h.</i>",
  "language_reference": "",
  "content": {
    "senses": [{
      "definition": "m. <a class=\"refLink\" href=\"/Jastrow,_אַב.1\" data-ref=\"...\">...</a>"
    }]
  },
  "refs": ["Genesis 2:24", "Berakhot 16b"],
  "quotes": [],
  "alt_headwords": [],
  "plural_form": []
}
```

**Processed entry (after all stages):**
```json
{
  "hw": "אָב",
  "id": "A00001",
  "p": "1",
  "c": {
    "s": [{
      "d": "<abbr title=\"masculine\">m.</abbr> <a href=\"#rid:A00002\" class=\"word-link\">...</a>"
    }]
  },
  "g": { "l": "bh", "ps": "n", "gn": "m" },
  "rf": {
    "b": ["Genesis 2:24"],
    "t": ["Berakhot 16b"]
  }
}
```

## Statistics Profile

The pipeline typically processes ~64,000 entries across the two JSONL parts, achieving approximately 20-25% size reduction through field stripping and key shortening. The abbreviation marker typically identifies thousands of abbreviation instances across definitions.
