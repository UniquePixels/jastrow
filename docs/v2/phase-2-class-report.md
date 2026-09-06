# Phase 2 — consolidated class report (residue sweep)

Task 10 of the research process, and the report the RUNBOOK promised:

> All `needs_*` rows accumulate into one consolidated report at the end
> of the sweep. (`data/patches/RUNBOOK.md`, line 233)

The sweep stopped by maintainer decision on 2026-09-06 after seven
batches. This report groups what it queued into **named classes with
counts**, and separates the classes a deterministic script can repair
corpus-wide from the ones that need per-entry adjudication. It does
**not** adjudicate individual entries; per-entry work moves to
post-go-live via the admin tool, as triage already defaulted it
(RUNBOOK line 236: "every escalation defaults to `post-go-live`").

---

## 1. Population

| Measure | Count |
| --- | --- |
| Manifest rows written across 7 residue batches | 1,050 |
| Distinct entries covered (checkpoint `swept`) | **723** |
| `needs_*` rows | 704 |
| Distinct entries escalated (latest sweep per rid) | **487** |
| — `needs_human_judgment` | 371 |
| — `needs_print_check` | 116 |
| `clean` (latest sweep per rid) | 233 |
| `repaired` (latest sweep per rid) | 3 |
| Patch rows accepted across all 7 batches | 24 |
| Patches surviving on the deduplicated 723 | 14 |

**Rows are not entries.** Calibration, batch 01 and batch 02 re-swept
largely the same entries under successive prompt versions:

| Pair | Shared rids |
| --- | --- |
| calibration × batch-01 | 141 |
| calibration × batch-02 | 139 |
| batch-01 × batch-02 | 147 |
| batch-02 × batch-03 | 29 |
| batch-01 × batch-03 | 26 |
| calibration × batch-03 | 18 |
| batch-03 × batch-04 | 10 |

Every count below is taken over the **latest** sweep of each rid.
That is why 704 rows collapse to 487 entries and 24 patches to 14 —
the superseded runs are not additional findings.

Escalation rate on the three batches that were 150/150 never-swept:

| Batch | Entries | Escalated | Rate |
| --- | --- | --- | --- |
| 04 | 150 | 101 | 67.3% |
| 05 | 150 | 110 | 73.3% |
| 06 | 150 | 110 | 73.3% |

---

## 2. The coverage caveat, before any class frequency is read

The sweep walked the residue in **strict rid order** and never left the
first three letters of the corpus:

| Batch | Rid range |
| --- | --- |
| calibration | A00000 – A00924 |
| batch-01 | A00000 – A00973 |
| batch-02 | A00000 – A00985 |
| batch-03 | A00804 – A01739 |
| batch-04 | A01661 – A02775 |
| batch-05 | A02895 – B00515 |
| batch-06 | B00711 – C00408 |

Covered rids by letter: **A 501, B 155, C 67 — and nothing else.**
The corpus holds 32,512 entries across letters A–V; A+B+C alone are
6,289 of them.

`[sev:med conf:high]` **Every class frequency in this report is
conditioned on the aleph-through-gimel head of the dictionary.** It is
not a random sample of the corpus and must not be quoted as one. The
direction of the bias is unmeasured: aleph is unusually rich in Greek
and Latin loanwords, which is exactly where asterisked headwords and
geresh abbreviations concentrate, so classes 11 and 8 may be
over-represented — or the letters may simply be where the residue
detector fires. Nothing here settles that.

---

## 3. Catalog class distribution

Twelve classes are defined in `admin/pipeline/research/prompts/sweep-v10.md`
(§ Defect catalog, line 554: "Twelve known classes"). Entries citing
more than one class are counted under each; 60 of the 487 cite two or
more.

| # | Class | Entries | Findings | Disposition split |
| --- | --- | --- | --- | --- |
| 11 | `wrong-link-target` | **406** | 428 | 362 judgment / 44 print |
| 8 | `lost-parenthetical` | **116** | 132 | 2 judgment / 114 print |
| 2 | `swallowed-marker` | 8 | 8 | 4 / 4 |
| 6 | `chopped-duplicated-tail` | 7 | 8 | 2 / 5 |
| 5 | `unclassified-binyan` | 5 | 6 | 4 / 1 |
| 9 | `print-error-carryover` | 5 | 5 | 0 / 5 |
| 7 | `anchor-boundary-markup` | 2 | 2 | 2 / 0 |
| 4 | `missing-number-field` | 2 | 2 | 0 / 2 |
| 12 | `duplicate-refs-block` | 1 | 1 | 1 / 0 |
| 1 | `implied-one` | 0 | 0 | — |
| 3 | `ocr-marker` | 0 | 0 | — |
| 10 | `duplicate-anchor-wrap` | 0 | 0 | — |
| — | no catalog class (proposed new) | 3 | 3 | 3 / 0 |

**Two classes are 98% of the queue** — 478 of 487 entries cite class 11
or class 8. 353 are class 11 alone, 66 are class 8 alone, 44 cite both,
and 9 more pair class 11 with something else.

Classes 1, 3 and 10 are absent because they are *repairable* — an
entry whose only defect is one of those leaves as `repaired`, not as
an escalation. Their absence here says nothing about their corpus
frequency.

---

## 4. Class 11 — `wrong-link-target`, by mechanism

Mechanism is read from the accepted detector hint named in each
escalation. Restricted to the **353 entries whose only class is 11**,
so no finding is attributed to the wrong class:

| Mechanism (accepted hint) | Entries | What it is |
| --- | --- | --- |
| `niqqud-twin-target` | 92 | display and target are two real headwords sharing one consonantal skeleton |
| `abbrev-mislink` | 56 | a geresh-abbreviated display that abbreviates *this* entry's headword but links elsewhere |
| `one-consonant-diverge` | 49 | display is no corpus headword and sits one non-final consonant from its target |
| `own-form-escape-link` | 47 | display is one of the host's own inflected forms; the target does not record that form |
| `inflection-escape-link` | 38 | display is one of this entry's inflected forms; the link leaves for an unrelated word |
| `exact-headword-diverge` | 18 | display *is* a corpus headword, target is a consonantally different one |
| `circular-v-ref` | 4 | a `v. X` see-reference targeting the entry's own headword |
| **no accepted hint named** | **84** | of which 38 say "unhinted" outright |

Entries can carry more than one accepted hint, so the column sums
past 353.

`[sev:med conf:high]` **84 of 353 class-11 entries — 24% — were found
without a detector hint.** These are the mandatory display-vs-target
reads the prompt requires (sweep-v10 §11, "Mandatory display-vs-target
check"). A script built only on the existing hint kinds would miss
roughly a quarter of what a reading agent finds.

`[sev:low conf:high]` `roman-numeral-display` produced **zero**
escalations across all seven batches. Positive control: the token
`roman` appears 5 times in the residue manifests, all of them inside
the English words *romancer* / *romancy*; the earlier chunk sweep
(`tranche-01`) has 3 real mentions. The kind is genuinely quiet in
A–C, not silently broken — but this is a null result on a 723-entry
slice, not a corpus verdict.

### Detector precision, as the sweep read it

Hint acceptance across all 487 escalated entries, counting an entry
once per kind:

| Kind | Accepted | Rejected | Unclear |
| --- | --- | --- | --- |
| `niqqud-twin-target` | 102 | 33 | 3 |
| `one-consonant-diverge` | 63 | 4 | 11 |
| `abbrev-mislink` | 58 | 0 | 1 |
| `own-form-escape-link` | 54 | 2 | 6 |
| `inflection-escape-link` | 46 | 2 | 10 |
| `exact-headword-diverge` | 23 | 3 | 4 |
| `rare-dotted-variant` | 17 | **32** | 6 |
| `bare-abbrev` | 16 | 6 | 1 |
| `circular-v-ref` | 5 | 1 | 1 |
| `comma-for-period` | 4 | 4 | 0 |
| `truncated-formula` | 3 | 0 | 0 |
| `hebrew-rare-confusable` | 0 | 1 | 0 |
| `roman-numeral-display` | 0 | 0 | 0 |

`[sev:med conf:med]` **`rare-dotted-variant` is rejected more often
than accepted (32 vs 17)** — the only kind with that shape. Batch 04
diagnosed the residual cause: bibliographic abbreviations that appear
bare zero times (`Aft.`, `Ep.`, `Gott. Vortr.`, `Teb. Yom`), which
v9's `maxBareForRare` guard was never going to reach
(`report-batch-04.md`, "Between-batch candidates" §1). This is a
detector-precision figure read off sweep prose, not an independent
audit — hence `conf:med`.

---

## 5. Class 8 — `lost-parenthetical`, by mechanism

Restricted to the 66 entries whose only class is 8:

| Mechanism (accepted hint) | Entries |
| --- | --- |
| `bare-abbrev` (citation sub-token loss) | 13 |
| `rare-dotted-variant` | 12 |
| `comma-for-period` | 4 |
| `truncated-formula` | 2 |
| no accepted hint named | 33 |

Class 8 is 114-of-116 `needs_print_check` — by construction: the
repair needs a byte that is not in the entry, and the hard constraint
forbids inventing it (sweep-v10, "The hard constraint: never invent
text"). **This class cannot be scripted at all** without a print
source. It is the cleanest candidate for the `needs_print_check`
backlog, not for the repair pipeline.

---

## 6. Classes with no catalog row

Three entries were escalated under names the agent proposed because
nothing in the catalog fits. Each is one named entry, not a measured
population.

| Proposed class | Entry | Finding | Why no patch |
| --- | --- | --- | --- |
| `corrupt-headword` | C00299 `גּוּך` | headword written with final kaf while every form the entry attests ends in dalet (`גִּיד`, `גּוֹדֵד`, `לֹא תָגוּדוּ`); corpus orders it out of alphabet | **no patch op writes headwords** |
| `malformed-headword-field` | B00443 | headword reads `בִזְיוּנָא , II` — stray comma and space before the Roman numeral; identical in the source snapshot | same |
| `truncated-quote-translation` | A02378 | `quotes` holds `[null, 'עמון ומואב עשו אִיסְטְלִים', 'Am']` — the English side cut at the first abbreviation period | arrays are outside sense scope |

C00299 has a knock-on the sweep also caught: **C00170's `v. גּוּד`
lands on C00300** (a pointer entry reading `, forms of גדד a. נגד.`)
rather than on the root entry, precisely because the headword is
corrupt.

`[sev:med conf:low]` Whether C00299 is a one-off or the tip of a ד/ך
population is **unmeasured**. The batch-06 verifier declined to claim
either way, and its two corroborating signals are weak on their own
(277 of 32,511 adjacent pairs violate ordering anyway; 9,619 entries
have no inbound anchor).

---

## 7. Script-slatable now

These improve the dataset corpus-wide without per-entry adjudication.
Every figure carries the positive control it was measured with.

`[sev:high conf:high]` **CORRECTED 2026-09-06.** The first version of
this table listed `Tanḥ.` (134/134) and three fixed-target uniforms as
slatable. Both were wrong, and `data/patches/patterns.jsonl` already
said so — checking the catalogue before implementing is what caught it.
`Tanḥ.` sits inside `midrash-section-cite-as-bible-chapter`
(`route: judgment`, 255) and its repair needs `tanhuma-never-linked`,
withdrawn to `judgment` on 2026-08-31 because a rule there **mints a
work name the corpus attests zero times** across 170,184 anchors and
23,211 distinct work names. The fixed-target uniforms are
`geresh-abbrev-fixed-sink` (`route: judgment`, 970). Both are moved to
§8. A batch report's "counted, not escalated" figure is a measurement,
not a routing decision.

| Class | Scale | Control | Confidence |
| --- | --- | --- | --- |
| **`preced.` gate** — anchors displaying exactly `preced.` where `data-ref === host.prev_hw`. **A GATE, NOT A REPAIR**: it locks in 3,051 already-correct links and changes at most 3 entries, so its value is as a regression guard, not as data quality | **3,051 of 3,054**; the 3 residuals (D01034, C01221, C01225) are niqqud/abbreviation normalisation noise | measured by parsing, with control; 62 starred `prev_hw` cases all match | `conf:high` |
| **`׳'` for gershayim** (geresh + ASCII apostrophe) — **SHIPPED 2026-09-06** as `geresh-apostrophe-as-gershayim` | 25 occurrences / 20 entries, every one a Hebrew acronym; 0 inside a tag, 0 unflanked | raw fields: 65,702 plain gereshes, 1,349,937 ASCII quotes, 943 apostrophes (918 of them Latin, inside ref attributes); U+05F4 occurs 0 times | `conf:high` — re-measured, `transform:count` MATCH at 20 |
| **`גבר` etymology cluster** — `b. h.` root anchored to Chaldaic `גְּבַר I` instead of Hebrew `גָּבַר` | exactly 4 corpus-wide (C00059, C00062, C00101, C00130), all in one chunk | 4,174 entries carry any `language_reference` data-ref | `conf:high` — one ruling settles all four |

Already slated in sweep-v10's systemics table and needing no new
decision: non-sense `duplicate-anchor-wrap` (~1,220 entries), bare RTL
Hebrew without `dir="rtl"` (~4,900 senses), Jerusalem Talmud href
missing its leading slash (7,679 of 7,679 — uniform), empty trailing
`plural_form` slot (703 of 6,113), empty `content.senses[0]` lead node
(73 empty + 11 whitespace-only), `refs` rebuilt from anchors (20,476
of 32,512 disagree), unlinked `Y. <tractate>` (893 across 768 entries).

---

## 8. Named, sized, and *not* script-slatable

`[sev:high conf:high]` These look scriptable and are not. Each has a
measured reason. Two of them arrived here from §7 after being checked
against `patterns.jsonl` or against the gates — the pattern is that a
batch report's *count* says nothing about whether a repair is
expressible.

| Class | Scale | Why a blanket script is wrong |
| --- | --- | --- |
| **Geresh-abbreviation resolver** | 39 anchors across 5 displays (`אִיסְ׳` 18, `אפי׳` 11, `אִי׳` 5, `אִצְ׳` 3, `אִיצְ׳` 2), each resolving to exactly 1 target | The load-bearing number is the **1**, not the sizes: this is one resolver behaviour, not 39 mislinks. `אִיסְ׳` genuinely abbreviates several different words and the fixed target is right for some. Tractable form: a **detector** flagging any geresh-abbreviated display with >1 plausible expansion |
| **Editorial-asterisk / skeleton-multi-owner** | 471 anchors whose de-asterisked skeleton is carried by ≥2 entries | 20 systematically sampled, read by two independent adjudicators: **5 wrong, 13 correct, 2 undecidable** — but the halves split 1-of-10 against 4-of-10. The class is established; its magnitude is not. Build the detector on *skeleton has >1 owner*, not on the asterisk. See `phase-2-asterisk-exposure.md` |
| **`same` displays** | 3,428 anchors; 3,408 target the immediately preceding entry | **593 sit inside a stem-marked sense where the rule is wrong** — the referent is the host's own Pe. A blanket "link to prev entry" script would write 593 new defects |
| **Top-level `2)` without its em-dash** | 138, against 2,961 `—2)` | No catalog class covers a marker missing its em-dash; the repair is a byte the entry does not have |
| **`Tanḥ.` → plain Torah book** | 134 of 134 (control: 168,913 anchors parsed) | Re-pointing needs a `Midrash Tanchuma` ref, and that work name occurs **0 times** in 170,184 corpus anchors. Every minting rule in the registry is verified against an in-corpus witness; there is none here. Catalogued `tanhuma-never-linked` (1,137), withdrawn to `judgment` 2026-08-31 |
| **Fixed-target uniforms** — `בִּי׳`→`בִּדּוּר` 10/10, `בער`→`בְּעַר I` 10/10, `Esth. R. to I, 3` 25/25 | 39 anchors in the wider family | Catalogued `geresh-abbrev-fixed-sink` (970, `route: judgment`). Uniformity of the *observed* target is not evidence the target is right — it is the same fixed-sink behaviour the geresh row above describes |
| **Unbalanced delimiters** | 1,210 paren-unbalanced and 121 bracket-unbalanced entries against 31,252 balanced | Too heterogeneous for one rule — which is why B00181, B00220 and B00270 were escalated per entry rather than proposed as a row |
| **Unlinked `Ib.` citations** — SIZED 2026-09-06, `phase-2-unlinked-ib.md` | **2,819 occurrences / 2,179 entries** (not the 3,256 quoted from `report-batch-06.md`, whose control does not reproduce); 2,118 of them resolvable, the walk validated at 99.9% place-accuracy on an 1,859-case control | Not a predicate problem — a GATE problem. The repair **mints an anchor**, and `link-target.ts:2207` refuses any net anchor-count increase outright; `unlinks` reconciles removals only. Needs a new gate case for a minted anchor whose target is copied from a named input anchor. `no-new-text` and `markup` both pass |

---

### The transform queue is empty

`[sev:low conf:high]` Worth recording, because it changes what "script
it" means from here: `registry.ts`'s `PENDING` list — "catalogued
transform rows with no rule yet" — holds **zero ids**. Every one of the
catalogue's `route: transform` rows is registered. So a new script is
now a new catalogue row, not a queue item being worked off, and
`geresh-apostrophe-as-gershayim` is the first row the residue sweep
contributed rather than a discovery round.

## 9. Deferred to per-entry, post-go-live

Everything in §4, §5 and §6 that is not covered by §7: **487 entries**,
of which 371 need a human reading and 116 need the print page. At the
observed 24 patches per 723 entries, enumerating the remaining ~2,945
residue entries would cost roughly 2.4B tokens for something on the
order of 100 more patches — the arithmetic behind the 2026-09-06 stop
decision.

The `needs_print_check` half (116) is a genuinely different queue from
the judgment half (371): it cannot be closed by reading the corpus at
all, only by consulting the print edition.

---

## 10. Method and limits

- Source: the seven residue-sweep manifests under
  `data/patches/tranches/` (calibration, batch-01…05, residue-01).
  `data/patches/pilot/` and `data/patches/tranches/tranche-01/` are the
  **earlier chunk sweep** and are excluded; 280 of the 723 residue rids
  also appear there, so their escalations are a separate corpus.
- Deduplication keeps the highest-ordered batch per rid. Class and
  mechanism labels are parsed from escalation prose (`class N` tokens;
  `<hint-kind> accepted` / `REJECTED` within 70 characters).
- `[sev:med conf:high]` **Prose parsing is the weak joint.** 3 of 487
  escalations name no catalog class at all (all three are §6's proposed
  classes, verified by reading them). Mechanism attribution for the 44
  entries citing both class 11 and class 8 is ambiguous, which is why
  §4 and §5 restrict to single-class entries and report the mixed 44
  separately.
- Counts are entry-level unless a column says "findings".
- **No corpus-scale claim in §7 or §8 was re-measured for this report.**
  Each is quoted with the control the originating batch report stated.
  The two figures worth re-deriving before anyone builds on them are
  the `preced.` 3,051 and the `Ib.` 3,256, because they are the two
  largest free wins.

## Provenance

Aggregated 2026-09-06 from `data/patches/tranches/*/manifest.jsonl`
(1,050 rows), cross-checked against
`data/patches/checkpoints/residue-01.json` (`swept` = 723). Class names
from `admin/pipeline/research/prompts/sweep-v10.md` § Defect catalog.
Corpus-scale figures from `report-batch-04.md`, `report-batch-05.md`,
`report-batch-06.md` and `phase-2-asterisk-exposure.md`.
