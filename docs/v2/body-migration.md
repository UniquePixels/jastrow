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
| Entries processed / repaired | 32,512 / 832 |
| **Rejoin round-trip** (healed corpus) | **32,512 / 32,512** |
| **Units round-trip** (healed corpus) | **32,512 / 32,512** |
| **Lettered round-trip** (healed corpus) | **32,512 / 32,512** |
| **Form-section round-trip** (healed corpus) | **32,512 / 32,512** |
| Schema validation (full corpus, not the dry run's 129-sample) | 32,512 validated, **0 failures** (was 3-in-sample / 486 latent) |
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
| `cite-escape` | 21 | 21 | [02](body-review/02-orphan-refs.md) class 1 — gershayim attribute repair |
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
  escapes the gershayim as `&quot;` inside href/data-ref values only —
  rendered text keeps the raw `"`. Consumers matching data-refs against
  Sefaria-style refs must HTML-decode the entity (the report's
  resolution recount does).
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
