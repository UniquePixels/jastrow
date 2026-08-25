# Body Migration Dry Run — Task 16 Evidence

The approved §6.0 maintainer-review decisions (2026-08-05, the seven
[body-review](body-review/) docs) implemented as repair passes over the
source corpus. `bun body:migrate-dry` applies every pass
([repairs.ts](../../admin/pipeline/body/repairs.ts)) to all 32,512
entries, re-runs the full §6.0 composition and round-trip gates over the
HEALED corpus, and writes the machine report to
`data/source/body-migration-report.json` (regenerable, not committed).
Read-only apart from that report — truth writing stays with
`migrate.ts`, later; it will compose `applyRepairs` before the body
build.

Every rid-keyed edit is literal, reviewed code transcribed from the
review docs' per-row decisions, and asserts its find-text matches
exactly once — a snapshot change that invalidates a repair fails loudly
instead of silently skipping (B9).

## Headline

| Measure | Result |
|---|---|
| Entries processed / repaired | 32,512 / **812** (was 832 — see the class-1 retirement below) |
| **Rejoin round-trip** (healed corpus) | **32,512 / 32,512** |
| **Units round-trip** (healed corpus) | **32,512 / 32,512** |
| **Lettered round-trip** (healed corpus) | **32,512 / 32,512** |
| **Form-section round-trip** (healed corpus) | **32,512 / 32,512** |
| Schema validation (full corpus, not the dry run's 133-sample) | 32,512 validated, **0 failures** (was 4-in-sample / 486 latent) |
| Label quarantines | **0** (was 6 — see label repairs) |
| Empty or untrimmed binyan forms | **0** (was 486 empty + 523 untrimmed) |
| Broken top-level sense sequences | **34** (was 72 — the 34 remaining are the reviewed swallowed-boundary rows + 3 deferred, below) |
| Repaired orphan refs items without an in-body basis | **0** |

## Passes

| Pass | Records | Entries | Review basis |
|---|---|---|---|
| `rejoin-chopped` | 36 | 36 | [01](body-review/01-broken-sequences.md) crossref-chop (35) + citation-chop (C00244), "ALL approved" |
| `implied-one` | 4 | 4 | 01 Note 1 / register #16 — recorded deviations |
| `marker-reinsert` | 14 | 14 | 01 per-row "source missing" notes |
| `label-repair` | 6 | 6 | [04](body-review/04-label-quarantines.md) — `-2)` → `—2)` (5), D00341 bracket move |
| `binyan-cleanup` | 938 | 751 | [06](body-review/06-empty-binyan-forms.md) — 486 empties dropped, 523 forms trimmed |
| ~~`cite-escape`~~ | ~~21~~ | ~~21~~ | **RETIRED 2026-08-24 — superseded, not withdrawn.** See below. |
| `cite-wrap` | 3 | 3 | 02 class 2 — 5 refs items resolved by 3 wraps |
| `refs-removal` | 3 | 3 | 02 class 3 — "ALL Remove" |

### Chop rejoins (36)

The upstream sense segmentation chopped a parenthesized cross-reference
or citation at its own `N)` (e.g. A00913's `(v. אוֹר 2) evening,
night`), minting a phantom sense. The phantom's number token and text
rejoin the preceding flow byte-exactly (`prev + "2)" + text`); for the
five entry-start chops (J00301, O01360, P01088, P01094, P01436) the
token folds back into the sense's own head. Maintainer clarification
(2026-08-05, Task 16 session): these `2)` tokens were never senses, so
no implied `1)` applies to them — see the register reconciliation below.

A00913, A01662, A03104, A03277, B00534, B00656, B00991, C00244 (`4)`),
H00709, H00871, I00137, I00149, I00753, J00301, K01188, L00346, N00327,
N00740, N01381, O00821, O01360, O01397, P00286, P00539, P00805, P00859,
P01088, P01094, P01436, Q02145, R00096, S01040, U00261, U00398, U01674,
V00166.

### Implied sense 1) — recorded deviations (4, register #16)

Print omits `1)` when sense 1 is only a cross-reference after the
grammatical label; v2 inserts it so the sequence reads 1..n. These are
deviations from print (`deviation: true` in the report): B01321
(top-level), C01169 (top-level; its sense 2 stays `*2)` as printed),
U01787 (Af. stem children), D00072 (in-text, before `to cleave` — its
`—2)` run lives inside the first sense's text). The planned `notes`
mechanism will anchor these in-text (TODO: notes spec — design doc
changelog 2026-08-05 "new scope"); until it lands, the migration
report's `deviation` flag is the register.

### Marker reinserts (14) — damage repairs, print has the bytes

Per 01's per-row "source data is missing" notes, hand-verified against
print: A00675 (space in `261)` → `26 1)`), A01194 (missing `)` after
`b. h.`), A03089, C00062, C01331, G00655, N01153, O00120, Q01974,
Q02162, S00490, U01556, V00704, V00765.

### Orphan refs (02)

- **21 gershayim cross-refs**: the source anchors exist, but the raw
  `"` inside `href="/Jastrow,_א"ט.1"` truncates the attribute at parse
  time, so the ref never resolved (the orphan cause). The repair
  escaped the gershayim as `&quot;` inside href/data-ref values only —
  rendered text kept the raw `"` — and consumers had to HTML-decode the
  entity.

  **This pass is RETIRED as of 2026-08-24 (maintainer ruling), and it
  was superseded rather than withdrawn.** It was correct for its time:
  the embedded quote genuinely broke the attribute, and escaping it was
  the only repair available without touching the parser. Two things
  then changed. [#47](https://github.com/UniquePixels/jastrow/pull/47)
  fixed the parser side of the same family, and
  [transform batch 3a](transform-batch-3a.md) corrects the **character**
  — the corpus writes `"` where Jastrow's print has `״` (U+05F4) —
  across all 90 damaged anchors *and* the headwords they point at, in
  one pass.

  Keeping both would have left the same address with two spellings: the
  escape writes an ASCII quote in entity form, the transform writes a
  gershayim, and 22 cross-links stopped matching as a result. Retiring
  the escape leaves one spelling in the corpus, and it follows the
  standing rulings that the pipeline **corrects** data rather than
  preserving it and that an OCR glyph fix is a correction rather than an
  invention.

  **Nothing was dropped.** All 21 rids remain in
  `REPAIRED_ORPHAN_ITEMS`, respelled with the gershayim, so the
  `unresolvedRepairedOrphans` recount still gates every one of them —
  the escape retired, the obligation did not. The recount stays at
  **0**, and a new corpus test
  (`admin/pipeline/body/pipeline-links.test.ts`) asserts the whole
  pipeline gains exactly 90 resolving link targets and loses none.
- **5 ibid items / 3 wraps**: bare resolved-but-unlinked texts wrapped
  in standard refLink anchors — P00331's `Ib. 88ᵇ` (as Eruvin 88b:1;
  its 88b:17/88b:22 refs items are the same-page citation, absorbed),
  P01404's `ib. XXI, 18` (Targum Jerusalem, Exodus 21:18 — no prior
  anchor for that work existed corpus-wide; href constructed on the
  standard pattern `/Targum_Jerusalem,_Exodus.21.18`), S01230's
  `ib. 85ᵇ` (Yoma 85b:14).
- **3 baseless items removed** (D00541 → Yoma 2a, M01355 → Rosh
  Hashanah 23b, Q00890 → Yoma 2a:3): judged user-added via Sefaria's
  interface — v2 shows only what Jastrow linked.

## Confirmed no-change (18) and deferred (3)

18 numbering-gap rows carry their marker **in-text** (the upstream
segmentation swallowed the sense *boundary*, not the marker bytes), so
the text already matches print and no byte changes: A01350, A01989,
C00328, C00581, E00024, H00301, H01701, J00501, J00515, M00252, N01155,
O00321, P00882, P01426, Q00547, R00536, S02265, U00764. These stay on
the upstream report (bad segmentation) but need no repair.

Deferred to eyes-on, no repair applied:

| Rid | Why |
|---|---|
| D00470 | The implied `1)` belongs inside a Pl. section flow (01 note ends "Confirm") — structure unresolved |
| K00081 | Print sense 5 label missing and the 01 note is unresolved; its in-text `—3)` is confirmed no-change |
| R00519 | Sense 4's `[` attaches to the end of sense 3 (print `—[4)…`) — bracket move not yet decided (cmp. D00341); its in-text `—3)` is confirmed no-change |

## Register #16 reconciliation ("39 occurrences")

The register's original 39 = the measured sense lists whose numbering
starts at 2 (46) minus the 7 rows whose print carries a `1)` glued to a
citation number (the reinsert class). That population mixes two causes
with different fixes: 36 chop phantoms (rejoined — their `2)` was never
a sense, so nothing is implied) and the genuine print convention (the 4
implied-one inserts above). Register #16 in
[upstream-issues.md](upstream-issues.md) is corrected accordingly; the
chop class is now its own register row. After repairs, 8 lists still
start at 2: the 7 reinsert rows (their restored `1)` is in-text; the
upstream sense boundary remains swallowed) and deferred D00470.

## Verdict

All four §6.0 round-trip gates hold over the healed corpus at
32,512/32,512; the schema now validates the **full corpus** with zero
failures; every damage census the review targeted (label quarantines,
binyan empties/spaces, orphan basis) recounts to zero; and the
sense-sequence census falls 72 → 34, with each survivor individually
accounted for above. Deviations from print are flagged per-record
(`deviation: true`) pending the notes-mechanism spec.

## Phase 2 batch 1 — transform wiring

Phase 2 batch 1's three corpus-correction rules
([transform/registry.ts](../../admin/pipeline/transform/registry.ts))
now run inside the `text-repairs` phase, **second**, on the entry
`applyRepairs` already healed — `repairs.ts`'s exactly-once find-text
assertions still see pristine source, since transforms run after it,
not before. A maintainer ruling (2026-08-22) reclassified
`abbrev-in-alt-headwords` from transform to judgment and deleted its
rule (spec §5.2, "Inference is not transformation"); the registry holds
exactly three rules, not four.

### Catalogue vs. dry-run counts — a unit change, not "more matches"

`bun transform:count` counts **entries**: one rule, run in isolation,
against the raw corpus, one tally per matching entry. `bun
body:migrate-dry` counts **`TransformRecord`s**: the composed, in-order
run over the healed corpus, one record per changed *definition* — an
entry with two changed senses contributes two records. Reading the
529 → 531 and 4,189 → 4,516 gaps as the rules "catching more" is a
misread; the decomposition below (measured, not estimated) accounts for
each column:

| rule | catalogue (entries) | records basis (unit change) | +composition | +repairs | dry run (records) |
|---|---|---|---|---|---|
| `redundant-outer-rtl-span` | 529 | 531 | +0 | 0 | 531 |
| `bare-rtl-hebrew` | 4,189 | 4,471 | +46 | −1 | 4,516 |
| `latin-token-inside-rtl-span` | 130 | 131 | +0 | 0 | 131 |

For the two small rows the entries→records unit change (catalogue →
"records basis") is the **entire** gap — composition and repairs
contribute nothing. For `bare-rtl-hebrew` the unit change accounts for
282 of the 327-wide gap (4,189 → 4,471); the remaining 46 is the
registry's mandatory unwrap-then-wrap ordering (`redundantOuterRtl`
before `bareRtlHebrew` — dropping a redundant outer span re-exposes
Hebrew that was `rtl: true`, and so invisible to `bareRtlHebrew`, while
the wrapper stood), and the final −1 is the repairs interaction below.

### The repairs interaction — N00327

The composed run over the **healed** corpus (`bun body:migrate-dry`)
emits 4,516 `bare-rtl-hebrew` records; the same composed pass run over
the **raw**, unrepaired corpus emits 4,517. The one-record difference is
entirely N00327: `rejoin-chopped` (a `repairs.ts` pass) merges two of
N00327's sense definitions into one before `bare-rtl-hebrew` ever runs,
and `bare-rtl-hebrew` emits one record per changed *definition* — so the
two records the raw-corpus pass would have emitted for N00327's two
separate definitions fold into the one record the healed-corpus pass
emits for its single merged definition. No Hebrew run is lost: N00327
carries 8 bare Hebrew spans in the source, wrapped to 10 `<span
dir="rtl">` spans on both the raw and the healed path alike — same
wrapping outcome, one fewer bookkeeping record. This is the batch's
first measured instance of a rid-keyed repair and a transform meeting on
the same entry, and it is composition working as designed, not a
dropped fix.

### Gate tallies — before and after wiring transforms

| Gate | Before | After |
|---|---|---|
| `entries` / `repaired` | 32512 / 832 | 32512 / 832 |
| `gate formSection` | 32512/32512 | 32512/32512 |
| `gate lettered` | 32512/32512 | 32512/32512 |
| `gate rejoin` | 32512/32512 | 32512/32512 |
| `gate units` | 32512/32512 | 32512/32512 |
| `schemaFailures` | 0 | 0 |
| `labelQuarantines` | 0 | 0 |
| `repairFailures` | 0 | 0 |
| `transformFailures` | 0 | 0 |

`diff` of the gate lines between the before/after `bun body:migrate-dry`
runs is empty. The tokenizer round-trip (Task 1 Step 5, re-run verbatim
per its corrected `for await` form) is unchanged:
`entries=32512 definitions=44668 lossy=0`.

That re-run is a `html.ts` REGRESSION check and nothing more: its script
reads `readSourceEntries()`, the raw corpus, so no transform output is
ever in its path and its result is invariant under any rule change
whatsoever. It says the tokenizer — which did change — still
round-trips every definition losslessly. It cannot say anything about
what the rules did.

The claim that no rule moved a definition between senses needs a
measurement that walks the TRANSFORMED corpus, so here is one. Walking
every entry's sense tree before and after `applyTransforms(entry,
'text-repairs')`, in order, and comparing the definition slots:

```
entries=32512 definitionsBefore=44668 definitionsAfter=44668
senseShapeDrift=0 slotDrift=0
```

`senseShapeDrift` counts entries whose flattened sense tree changed
length; `slotDrift` counts entries where a slot gained or lost its
definition. Both zero: the batch's three rules rewrite definition
strings in place and touch neither the tree nor which slots hold text.
`bun body:migrate-dry`'s four round-trip gates are structural and
would not have caught the difference.
