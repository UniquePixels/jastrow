# Residue calibration — residue-01 chunks r00001–r00005

Phase 2.3 item 3, the first residue sweep ever dispatched. Five
chunks of 30 against the healed corpus, run as a calibration before
the remaining 128. Maintainer go recorded **2026-09-04 08:55 CDT**;
usage baseline marked `2026-09-04T13:56:40.961Z`.

Sweep tier Opus (tiering spec §4 Phase 2.3, decision T4), prompt
`sweep-v5`, verification `verify-v2`, corpus stage `healed`, pin
`sha256:75bbc5ee7…`.

## Measured

| Measure | Value |
| --- | --- |
| Entries | 150 |
| clean | 49 |
| repaired | 0 |
| needs_print_check | 34 |
| needs_human_judgment | 67 |
| Patches accepted | 4 |
| Patches rejected at ingest | 0 |
| Patches sampled (Opus tier) | 4 |
| Sampled error rate (substantive) | 0.0% |
| Label-only patch slips | 0 |
| Clean entries sampled | 15 |
| Clean-sample miss rate (catchable) | 26.7% |
| Verifier discoveries (not counted) | 3 |
| Escalation queue | 101 |

Missed clean entries: A00441, A00069, A00226, A00622.
Discoveries: A00575, A00730, A00516.

## Gates

- **Patch error gate (≤5%, kept): PASSES at 0.0%.** All four sampled
  patches verified `ok`, none label-only. The verifier recomputed
  every sense anchor from sha256, confirmed `expected_before`
  byte-exact against the source snapshot, and re-ran the
  codepoint-multiset test from `no-new-text.ts` independently.
- **Catchable-miss gate: retired** (tiering spec T1, 2026-08-17), so
  26.7% does not halt the batch. It is recorded because it is
  **roughly 3× the 7.4–8.2% band the gate was retired over**, and
  three of the four misses trace to defects named below rather than
  to agent inattention.
- **Saturation gate:** not applicable to a single batch.

## Yield

Two of five chunks produced zero patches; the tranche's 150 entries
yielded 4. The agents give a consistent reason: post-heal residue is
dominated by class-8 sub-token byte losses (unrepairable without new
bytes) and class-11 wrong link targets (correct bytes appear nowhere
in the entry). That is the residue behaving as designed — it is what
survived the earlier classes — but it means the error gate is
computed from a very small denominator, and will stay small.

## Defects found in the tooling, not the data

### 1. `ed1DominantSiblings` mis-frames a hint into a false negative

`minSibling: 100` (`anomalies.ts`) excludes any edit-distance-1
sibling below 100 occurrences. For A00622's `Mid.`:

| Form | Corpus count | Named in the hint |
| --- | --- | --- |
| `Midr.` | 1,155 | yes |
| `Mic.` | 111 | yes |
| **`Midd.`** | **97** | **no — 3 below the cutoff** |
| `Mid.` | 3 | the rare token itself |

The sweep was told `Mid.` sits beside *Midrash* and *Micah*, neither
of which it abbreviates, and correctly concluded it was not a
variant of either. The true sibling *Middot* was three occurrences
below an arbitrary round number. The hint did not merely fail to
help — it argued the sweep out of a true positive. Anything in the
50–99 band mis-frames identically.

### 2. Neither diverge detector excludes the target's `alt_headwords`

`alt_headwords` appears nowhere in `link-anomalies.ts`. Its
documented exclusions stop at redirect-stub resolutions and the
editorial `*`. Yet the single most repeated rejection across all
five chunks was "the display is verbatim in the target's own
`alt_headwords`" — אוֹלְיָיר, אגיסטין, אוּדְנָא I, מֵיכְלָא I,
גּוּם, נְגִירָא. On one verifier's five-entry slice that exclusion
alone would have suppressed 4 of 5 hints. Every one of those
rejections costs Opus tokens, 133 times over.

### 3. `niqqud-twin-target` is two shapes, one undocumented

Besides the true twin-headword case, the detector emits
"unvocalized display names a skeleton carried by N headwords", which
fired on **57 of the 150 sampled entries (38%)** — systemic scale,
colliding with the prompt's own do-not-escalate-systemic rule. Its
detail line also under-counts owners, deduping by headword string
after stripping Roman numerals.

### 4. A blind spot the detectors cannot see

A00575 and A00730 share a shape: an unvocalized display that
*exactly equals* some headword passes the mandatory display-vs-target
check and never triggers `niqqud-twin-target`, even where the
skeleton is carried by 3–5 headwords. Both landed the reader on a
semantically unrelated entry. Nothing in v5 asks the sweep to look.

## Contract and prompt drift

| Where | Says | Reality |
| --- | --- | --- |
| `sweep-v5` hint table | documents 9 kinds | `AnomalyHint.kind` is a 12-member union |
| `sweep-v5` class 10 | "replacement is a substring of `find`" | `no-new-text.ts` is a sub-multiset check |
| `sweep-v5` op table (:763) | "find-text bytes + closed-grammar markers" | correct — contradicts :494 |
| `verify-v2` Companion | names `sweep-v3.md` | batch ran `sweep-v5` |

The three undocumented kinds are `hebrew-rare-confusable`,
`inflection-escape-link` and `one-consonant-diverge`. All four sweep
agents reported the gap independently; between them the undocumented
kinds accounted for 33 of ~190 hints, with no prescribed outcome.
The `substring` wording matters: the one reordering patch produced
(P000071) is legal under the code, illegal under :494, and passed
`validateNoNewText` at ingest.

Two structural gaps in the manifest and sample contracts:

- `escalation` is forbidden on non-`needs_*` rows (`manifest.ts`), so
  a `clean` row has nowhere to record why a hint was rejected — yet
  the sweep checklist requires every hint judged "with a reason you
  could defend to the verification tier". One chunk alone lost 8 such
  rationales. Suggested v6 fix: an optional `hint_notes` on clean rows.
- `sample-clean.json` carries only `{entry}` — no `sense_index`, no
  `anomaly_hints`. Judging `catchable` fairly required recovering
  hints from the chunk inputs by hand; a verifier taking the sample
  at face value would have scored the hint-related entries wrongly.
  The gate cannot presently audit hint judgment, which is where the
  sweep did most of its reasoning.

## Disposition convention, unratified

Entries carrying both a class-8 and a class-11 finding allow exactly
one disposition, and the prompt gives no tie-break. Agents chose
`needs_print_check`. The codebase's stated principle agrees —
"print-check outranks human-judgment — a print need is the harder
queue" (`verify.ts`) — but that comment governs reject-folding at
ingest, not an agent's own choice. It should be written into the
prompt rather than re-invented per agent. One inter-agent
inconsistency was observed: A00556 escalated the unvocalized-root
twin shape that A00441 and A00069 were dispositioned clean on.

## Known-gap re-reports

A00451 reports the `Ib.`→`Yoma 2a:N` sibling arm as a defect. It is
documented, measured (52 anchors; 221 bare vs 38 suffixed in the
audit) and deliberately excluded from `ib-yoma-2a` because widening
a predicate past the number it reproduces is what the batch's own
lessons forbid. Expect this shape to recur and fill the escalation
queue unless the prompt names it.

## Cost

Measured from the Claude Code transcripts, whole calibration (5
sweep agents + 4 verification agents + orchestration):

| Origin | Msgs | Input | Output |
| --- | --- | --- | --- |
| subagent (Opus) | 529 | 71,945,819 | 60,962 |
| main (Opus) | 106 | 15,705,904 | 121,246 |
| **total** | **635** | **87,651,723** | **182,208** |

Input is fresh 1,270 · cache-write 3,301,072 · cache-read
84,349,381. Cache re-reads dominate: each agent re-reads the 42KB
prompt and its chunk across every turn. Tokens only — the
transcripts carry no billing.

Sweep-only portion, before verification: 59,145,620 in / 105,682
out. Extrapolating the sweep alone to 133 chunks gives **≈1.57
billion input tokens**; confidence is moderate, since per-agent turn
counts varied 30–48 tool uses over a 5-chunk base.

The statusline's window percentage excludes the subagent row
entirely, so it understates a sweep by 71.9M of the 87.7M.

## Recommendation

Do not dispatch the remaining 128 chunks yet. Three of the four
catchable misses trace to defects 1–3 above, all of which are
cheap detector or prompt fixes, and all of which would otherwise be
paid for 128 more times at roughly 10M input tokens per chunk.
Fix, re-run a calibration slice, then decide on the full sweep.
