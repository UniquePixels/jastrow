# Batch 02 report (round 2, sweep-v4) — 2026-08-17 (chunks 00033–00057)

| Measure | Value |
| --- | --- |
| Entries | 750 |
| clean | 608 |
| repaired | 22 |
| needs_print_check | 18 |
| needs_human_judgment | 102 |
| Patches accepted | 30 |
| Patches rejected at ingest | 0 |
| Patches sampled (Opus tier) | 13 |
| Sampled error rate (substantive) | 0.0% |
| Label-only patch slips | 1 |
| Clean entries sampled | 61 |
| Clean-sample miss rate (catchable) | 8.2% |
| Verifier discoveries (not counted) | 2 |
| Escalation queue | 120 |

Label-only slips (corrected, not counted): P000063

Missed clean entries: A01264, A01679, A01315, A00989, A01276

Discoveries (fold in as escalations; shared mechanical root cause
across several forces a detector/prompt update before the next
batch): A01123, A01019

## Provenance and maintainer decisions

- **Go:** batch 02 go recorded 2026-08-17 10:13 CDT (25 chunks,
  00033–00057, rids A00960–A01709).
- **Round 1 (sweep-v3):** error 0.0% (0/15 sampled patches — the first
  batch with no faulted patch), miss 7.6% (5/66). Four of the five
  catchable misses were one class-11 root cause found by one
  entry-local test. Maintainer chose fix-detection-and-re-sweep; round
  1 was not committed.
- **Remediation (commit 8114d2c):** `link-anomalies.ts` (4 rules,
  1,910 entries / 5.9% corpus-wide), a Roman-numeral comma rule in
  `anomalies.ts` (18 instances against 46,161), and sweep-v4 — the
  display-vs-`data-ref` check made mandatory, the niqqud carve-out
  narrowed, the slash-less Jerusalem Talmud href recorded as systemic.
  All five round-1 misses arrive as hints under v4.
- **Round 2 (sweep-v4, this report):** every round-1 miss caught;
  escalation queue 69 → 120, almost entirely class-11 link defects.
  Error 0.0% (0/13, one label-only slip P000063). Miss 8.2% (5/61) —
  breached again, but on five *different* entries across classes 11,
  5 and 8 with no shared mechanical root cause.
- **Tier experiment (2026-08-17):** Opus sweeping chunks 00033, 00043,
  00044 under the same prompt and chunk size found 25 escalations
  against Sonnet's 17 and caught 3 of the 4 known misses — model tier
  is real, but A00989 slipped past both tiers and Opus surfaced four
  findings neither tier had. Upgrading the model does not close the
  gate.
- **Acceptance (2026-08-17, maintainer):** accepted under
  [sweep tiering spec](../../../../docs/specs/2026-08-17-sweep-tiering-design.md)
  decision T1 — the catchable-miss-rate gate is retired in favour of a
  pattern-saturation gate. The eight verifier finds folded into the
  manifest as escalations (A01264, A01679, A01315, A01123, A01546 →
  needs_human_judgment; A00989, A01276, A01019 → needs_print_check).
  Post-fold dispositions: clean 600 / repaired 22 / needs_print_check 21
  / needs_human_judgment 107; escalation queue 128.
