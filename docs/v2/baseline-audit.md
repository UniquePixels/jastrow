# Baseline Audit — Raw Extraction vs Deployed at First Commit

The edit-mining stage (spec 1.3, `mine.ts`) skips the baseline import
commit on the assumption that the deployed JSONL entered git without
edits. This audit tests that assumption: it transforms
`data/raw/jastrow-part{1,2}.jsonl` at the baseline commit (`8c10b59`,
2026-03-30) through the documented v1 extraction transform
(`baseline-transform.ts`) and diffs the prediction against the actual
deployed `data/jastrow-part{1,2}.jsonl` at the same commit. Anything
the model cannot explain is a candidate pre-git hand edit. Produced by
`bun admin/pipeline/provenance/baseline-audit.ts`; machine output in
`data/source/baseline-audit-report.json` (regenerable, not committed —
data-architecture spec D2).

## Headline

| Measure | Count |
|---|---|
| Entries compared (rid-aligned) | 32,512 / 32,512 |
| Byte-equivalent after modeled transform | 32,329 |
| Entries with unexplained differences | **183** |
| — column resolved `?` → `a`/`b` | 182 |
| — page number corrected (−1) | 3 (overlap with column fixes) |
| — content text differing | 1 (malformed-markup quirk, not an edit) |
| Links verified (internal + external) | 72,257 + 96,691 |
| Link issues (all malformed-source quirks) | 84 |

## Finding 1 — one pre-git fix session: rids C00363–C00544

**The assumption was wrong, in a bounded way.** All 182 column fixes
and all 3 page fixes fall in a single perfectly contiguous rid block —
C00363 through C00544 (גְּוִיְיתָא … גְּזִיזָא, printed pages
221–229). Every one resolves a `column: "?"` to a real `a`/`b` (99 b,
83 a); three of them also shift the page down by one (C00411 223→222,
C00435 224→223, C00455 225→224). This is the fingerprint of one
manual print-locator fix pass over a stretch of the gimel section,
made after extraction and before the first commit — invisible to
`mine.ts`.

**Consequence for migration rule 6:** the v1 `page`/`column`
enrichment must be sourced from the **baseline deployed files**, not
from `data/raw` — sourcing raw would silently undo these 185
field-level fixes. (The divergence audit's R1 already leaned this way;
this finding makes it a requirement.)

## Finding 2 — the transform model (what v1's extraction did)

Recovered empirically and encoded in `baseline-transform.ts`,
unit-tested:

| Raw | Deployed | Notes |
|---|---|---|
| `rid`, `headword` | `id`, `hw` | verbatim |
| `page`, `column` | `p`, `col` | verbatim (except Finding 1) |
| `next_hw`, `prev_hw` | `nh`, `ph` | verbatim |
| `alt_headwords`, `plural_form`, `quotes` | `ah`, `pf`, `q` | empties omitted (8,673 / 6,113 / 301 non-empty) |
| `language_code` + `language_reference` | `li` | concatenated, trimmed (5,842) |
| `content.senses`, `.morphology` | `c.s`, `c.mo` | sense keys `definition`/`number`/`grammar`/`senses` → `d`/`n`/`g`/`s`, recursive; grammar `verbal_stem`/`binyan_form` → `vs`/`bf` (`language_code` passes through on 3 nodes) |
| `refs` | — | dropped; deployed `rf` is a **derived** categorized rollup of link targets (`j`/`t`/`b`/`mi`/`o`), excluded from comparison |
| — | `g` (entry level) | **derived** language/POS/gender (`l`/`ps`/`gn`, 7,611 entries) — v1 already computed the enrichments the v2 cleanup register lists as future item #11 |
| refLink → internal | `<a href="#rid:X" class="word-link">` | resolved headword→rid; unresolvable targets fall back to `#<headword>` (83) |
| refLink → external | `https://www.sefaria.org/<encoded data-ref>` | URL fully derivable from `data-ref` |
| — | `<abbr title="…">` in text | injected at extraction; made dynamic later (6831afc) |

## Finding 3 — malformed source markup, not edits

The remaining residue is upstream data damage that both sides carry
mechanically: raw contains refLinks whose open tag is never closed
(e.g. J00597's `href="/Jastrow,_דִּלְדֵּל.1</a>`), which the v1
rewrite mangled deterministically (D00478's nested-link fragment is
the same family — cousins of the 1,212 nested refLinks later stripped
by script). The 83 `#<headword>` link fallbacks are unresolvable or
suffix-less `data-ref`s — the baseline-era face of the 88 broken
internal targets the v2 spec already tracks (cleanup register #3).

## Verdict

Mining's skip-baseline assumption misses exactly **one bounded fix
session (185 field fixes across 182 entries, all print locators)**
and no content edits. Combined with the 107 hand page fixes from
caf242a, the full human-edit ledger of v1 is: **289 print-locator
fixes, zero text edits.** Migration must take `page`/`column` from
baseline deployed (rule 6 amendment) and replay the 107 — nothing
else from v1's lifetime touches v2 truth.
