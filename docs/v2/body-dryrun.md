# Body Dry Run — §6.0 Blessing-Gate Evidence

The entry-body-model toolkit ([design doc](../specs/2026-07-11-entry-body-model-design.md),
[implementation plan](../superpowers/plans/2026-07-11-entry-body-model.md))
turns each source entry's free-text `content.senses` into the structured
`BodyEntry` shape the app renders. Tasks 5-9 built and fixtured each rule
in isolation (gloss-head rejoin, grammar-marker parse, sense-label parse,
lettered sub-sense split, citation-unit segmentation); this task —
`bun body:dry-run` — composes all five over every one of the 32,512
corpus entries, READ-ONLY, and verifies the composition reconstructs its
source byte-for-byte. This is the design doc's §7 blessing gate: "per-entry
byte round-trip over all 32,512 … label-regeneration byte-exactness."
Machine output in `data/source/body-dryrun-report.json` (regenerable, not
committed — data-architecture spec D2). Code:
`admin/pipeline/body/dry-run.ts` (composition + entry point),
`dry-run-verify.ts` (round-trip checkers), `dry-run-report.ts`
(accumulator, schema sample, console/report output) — split across three
files only to stay under the project's per-file line budget.

## Headline

| Measure | Result |
|---|---|
| Entries composed | 32,512 |
| **Rejoin round-trip** (morphology/language_code/language_reference/sense-1 text recovered from the rejoined gloss head) | **32,512 / 32,512** |
| **Units round-trip** (`gloss + units.join('')` reconstructs every segmented text, at every level) | **32,512 / 32,512** |
| **Lettered round-trip** (`joinLettered` reconstructs every split source text byte-for-byte) | **32,512 / 32,512** |
| **Form-section round-trip** (`joinFormSection` reconstructs every B12 marker-section split — `Pl.`/`Part. pass.`/`Fem.`/`Denom.` — byte-for-byte) | **32,512 / 32,512** |
| Sense-label occurrences / regenerated / quarantined | 10,186 / 10,180 / **6** |
| Quarantined label shapes | `[1)` ×1, `-2)` ×5 (2 distinct shapes) |
| `content.morphology` occurrences / quarantined | 13,162 / **0** |
| Entries with ≥1 structural lettered split | 116 (census's raw-text detector: 189 — see Finding 2) |
| Entries with a structural form-section split (B12) | **13** — `Pl.` 5, `Part. pass.` 6, `Fem.` 1, `Denom.` 1 (census's coarse detector: `Pl.` 25, `Part. pass.` 10, `Fem.` 2, `Denom.` 1 — see Finding 7) |
| Binyan/stem sections built | 4,390 (across 2,337 entries) |
| `BodySense` unit-count distribution (0/1/2/3/4/5+) | 17,718 / 12,339 / 5,637 / 3,329 / 2,138 / 3,961 |
| Schema-validation sample | 129 validated, **3 failures** (see Finding 3) |

## Finding 1 — the three structural rules hit 32,512/32,512, exactly as designed

Rejoin, unit segmentation, and lettered splitting are all joins of slices
of their own input — by construction, `gloss + units.join('')` and
`joinLettered(splitLettered(text))` can only ever fail to reproduce their
source if the composition wired the wrong text into the wrong place, or
dropped/duplicated a child sense. Composing all three over the full
corpus (not just the Task 5-9 fixture sets) surfaced zero such wiring
bugs: every entry's intro sense (built from the rejoined gloss head, which
also absorbs the 46 entries whose *first* top-level sense is itself a
grammar node — its header material still folds into the same intro
sense, since `rejoinGlossHead` reads `content.senses[0]?.definition`
regardless of what sense 0 actually is), every plain labeled sense, and
every stem child sense round-trips byte-for-byte. This is the design
doc's blessing-gate condition for these three rules, met without
exception.

## Finding 2 — lettered-split count: 116 structural vs. 189 census-detected, fully reconciled

`census.ts`'s `letteredRun` is a boolean *detector* — it strips HTML tags
and tests for an `a)…b)` run anywhere in a definition, sized for corpus
survey, not structural correctness. `lettered.ts`'s `splitLettered` is the
*authoritative* structural rule the body composes with, and its own
header comment already flags that the two "may disagree… on edge cases."
Diffing the two full-corpus results resolves every disagreement:

- **75 entries** counted by the census detector never split
  structurally, because their `a)`/`b)` markers are wrapped in `<i>…</i>`
  tags (e.g. O01078: `<i>a</i>) tied up, hidden … <i>b</i>) blinded,
  blind`). `census.ts` strips tags before testing, so `<i>a</i>)` reads as
  `a)`; `splitLettered` deliberately never strips tags (its `MARKER` regex
  requires the letter immediately adjacent to `)` in the raw string), so
  an italicized marker is invisible to it. This is the module's
  documented under-split failure mode (B9: "an unsplit block is still
  readable, a wrongly split one is not") working exactly as designed —
  confirmed as the *complete* explanation for all 75 (zero residual after
  accounting for it).
- **2 entries** (`A02705`, `B00880`) split structurally but were never
  counted by the census detector, because their `a)`/`b)` markers
  straddle two separate source fields — `B00880`'s `language_reference`
  ends `"…√בל; a)"` and `content.senses[0].definition` continues `" sec.
  r. of … b) √בל to crumble…"`. The census detector only scans one
  `sense.definition` at a time and never sees `language_reference`, so it
  can't find this run at all; the dry-run's composition rejoins the gloss
  head first (healing exactly this class of straddle, per rejoin.ts's own
  K00664 example), which makes the run structurally visible and valid.
  This is a genuine capability the full composition has that the raw
  per-field census scan doesn't.

189 − 75 + 2 = 116, exactly the measured count. No unexplained residual.

## Finding 3 — 3 schema-sample failures, all one root cause: empty-string binyan forms

The ≥100-entry schema sample (every 300th corpus entry plus every
Task 5-9 fixture-class rid — 129 total) found 3 failures, all
`stems[N].forms[M]` violating the schema's `minLength: 1` on form
strings. All three (`P00791`, `P01091`, `Q02144`) come from upstream
`binyan_form` arrays that carry a trailing empty string (e.g. A00338's
`binyan_form: ["אִיתַּגַּר", ""]`, not one of these three but the same
shape) — the dry-run's `buildStem` threads `binyan_form` straight through
per this task's own composition rule (`forms: binyan_form ?? []`, no
filtering), so an empty upstream slot becomes an empty output slot. A
full-corpus recount (not just the 129-sample) found this trait on 486
occurrences across 446 entries (1.4% of the corpus) — common enough that
the 129-entry sample was always going to catch a few. This is a genuine
upstream-data / schema mismatch, not a dry-run composition bug: `forms`
is out of §6.0's scope to alter (Task 11 is read-only measurement), and
the schema itself is prior, reviewed work (B11). Flagged here for
maintainer review — either the schema should accept empty strings (an
empty form is arguably meaningful, marking "no additional attested form"
in that slot) or a later migration task should drop them; not resolved by
this task.

## Finding 4 — label quarantines match Task 7's corpus survey exactly

The 6 quarantined `sense.number` occurrences (`labels.test.ts`'s
`EXPECTED_QUARANTINE`, confirmed here at full-corpus scale rather than
just the fixture/corpus-sweep unit tests) are exactly: `D00341`'s `[1)`
(a bracket where a digit belongs — OCR/transcription damage) and 5
occurrences of `-2)` (`M02309`, `O00408`, `S02030`, `U00745`, `U00939` —
an ASCII hyphen-minus standing in for the em dash used everywhere else
for the same continuation marker). Both shapes fall outside
`parseLabel`'s measured grammar by design (B6) and quarantine to the raw
string rather than being coerced, since coercion would break byte-exact
regeneration for these five source strings. Every other label
occurrence — 10,180 of 10,186 — regenerates through
`printLabel(parseLabel(raw))` byte-for-byte.

## Finding 5 — grammar markers: the closed 8-value vocabulary holds at full scale

All 13,162 `content.morphology` occurrences parse without `{unknown}` —
the `VOCAB` table `grammar.ts` built from the Task 3 census (8 distinct
values) covers the entire corpus, not just the census sample it was
measured from.

## Finding 6 — unit-count distribution: a long tail, not a uniform spread

| Units | Count | Share |
|---|---|---|
| 0 | 17,718 | 39.3% |
| 1 | 12,339 | 27.3% |
| 2 | 5,637 | 12.5% |
| 3 | 3,329 | 7.4% |
| 4 | 2,138 | 4.7% |
| 5+ | 3,961 | 8.8% |

Across 45,122 built `BodySense` nodes (every intro/plain/lettered-child/
form-section-item/stem-child sense in the corpus — 38 more than the count
Task 11 first reported, exactly the 13 form-section sibling senses plus
their 25 restarted-numbered item children across all four markers
(`Pl.` 5 siblings + 11 items, `Part. pass.` 6 siblings + 10 items, `Fem.`
1 sibling + 3 items, `Denom.` 1 sibling + 1 item — B12/Finding 7), a
plurality (39.3%) carry zero citation units at all — short
cross-reference-style senses whose entire content is the gloss itself,
consistent with the parent design doc's note that
8,592 entries are pointer-only (", v. X") bodies. The remaining 60.7%
carry at least one evidentiary citation unit, with a real tail out past 5
(8.8%) for heavily-cited entries (long verb roots with many binyan
sections and citations per sense). No single bucket dominates past 40%,
consistent with the conservative (`.`/`—`/sense-start only) terminator
rule producing a plausible, non-degenerate segmentation shape corpus-wide.

## Finding 7 — form-section split (B12, extended 2026-07-14): 13 structural vs. 38 census-detected, same class of divergence as Finding 2

Originally shipped Pl.-only (`plural.ts`); during maintainer study
(2026-07-14) print-verification found the identical `—<marker> <form>
1)…2)…` convention under three more headers — `Part. pass.` (passive
participle), `Fem.` (feminine), `Denom.` (denominative) — so the module
was generalized in place (`git mv` to `form-sections.ts`) to a
marker-parameterized splitter over `['Pl.', 'Part. pass.', 'Fem.',
'Denom.']`. `census.ts`'s per-marker coarse detectors are boolean —
they strip HTML tags and test for each marker followed by a bare `1)`
within ~120 chars, sized for corpus survey, not structural correctness
(exactly Finding 2's `letteredRun` pattern, reused for B12): `Pl.` 25,
`Part. pass.` 10, `Fem.` 2, `Denom.` 1 — 38 candidates. `form-sections.ts`'s
`splitFormSection` is the *authoritative* structural rule the body
composes with, and it disagrees with the coarse detectors on 25 of the
38 hits.

Diffing the two resolves every disagreement. For `Pl.`, the cause is
singular: 20 of its 25 candidates are a bare `1)` that the coarse
detector's single-character lookbehind can't distinguish from a `1)`
that closes an already-open, unrelated parenthetical citation —
Jastrow's extremely common `Lam. R. introd. (R. Joḥ. 1)`-style
reference (chapter/paragraph number, not a restarted-list marker).
`H01537` is representative: its only "match" is `…(R. Joh. 1) you have
to walk over rocks…` — accepting it would slice a built sense open
mid-parenthetical, with item text starting on a bare `)`.
`splitFormSection` tracks paren balance from the marker anchor forward
and rejects a marker whenever an unmatched open paren precedes it, so
these 20 return null and stay whole (B9's under-split failure mode,
correctly triggered). The remaining 5 `Pl.` candidates — `A01047`,
`B01292`, `C00062`, `D00194`, `E00789` — carry a genuine, paren-clear
ascending `1)…2)…` (`C00062` also `…3)`) run and split cleanly. For
`Part. pass.`, 4 of its 10 candidates are the same citation-close false
positive; the remaining 6 (`A02260`, `A03348`, `C00869`, `C00964`,
`C01139`, `H01022`) are genuine — two of them (`C00869`, `H01022`)
carry the marker with its own closing tag landing mid-phrase
(`<i>Part. pass</i>.` rather than the literal `Part. pass.` string),
which `buildAnchorPattern`'s tag-tolerant matching still recognizes.
For `Fem.`, one of its 2 candidates (`D00194`) is not a false positive
by the paren-balance test but a **nearest-marker-attribution** case:
D00194's text carries both `—Fem. …` and, later, `—Pl. … 1)…2)…`; the
genuine ascending run belongs to the closer `Pl.` anchor, not the
earlier `Fem.` one, so each marker's run-search is bounded to the text
between its own anchor and the next marker anchor of any kind (or the
text's end) rather than left unbounded to the end of the whole text —
without that bound, `Fem.`'s unbounded forward scan would also "see"
`Pl.`'s run and wrongly claim it. That leaves exactly one genuine
`Fem.` split, `G00644`. `Denom.`'s single candidate, `I00311`, is
genuine outright.

13 structural splits total — `Pl.` 5, `Part. pass.` 6, `Fem.` 1,
`Denom.` 1 — all round-trip byte-for-byte, and the extra `BodySense`
nodes they contribute (13 sibling senses + 25 restarted-numbered items)
account exactly for Finding 6's node-count increase over the prior
report. 38 − 25 = 13, exactly the measured count — no unexplained
residual, and `letteredSplitEntries` (116) is unchanged by this task,
confirming the split kinds were kept structurally distinct rather than
double-counted.

## Verdict

This is the §6.0 blessing-gate evidence the design doc's §7 calls for:
per-entry byte round-trip over all 32,512 entries, for every rule that
makes a byte-exactness claim (rejoin, units, lettered) — all three hit
32,512/32,512 with zero exceptions. The two rules whose contract is
explicitly a parse-or-quarantine one (labels, grammar) quarantine exactly
what Tasks 3 and 7's censuses predicted (0 and 6 respectively) and
regenerate everything else byte-exactly. The schema-validation sample
surfaced one real, well-characterized upstream/schema mismatch (empty
binyan-form strings, §Finding 3) — flagged for maintainer review, not
silently patched, per this task's read-only mandate. Nothing here blocks
the §6.0 design from proceeding to migration; the one open item (Finding
3) is a schema-authoring decision for the maintainer, not a defect in the
rule modules Tasks 5-9 built.
