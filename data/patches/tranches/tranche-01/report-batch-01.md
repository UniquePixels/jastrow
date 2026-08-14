# Batch 01 report (v3 re-sweep) — 2026-08-14 (chunks 00008–00032)

| Measure | Value |
| --- | --- |
| Entries | 750 |
| clean | 660 |
| repaired | 28 |
| needs_print_check | 33 |
| needs_human_judgment | 29 |
| Patches accepted | 34 |
| Patches rejected at ingest | 0 |
| Patches sampled (Opus tier) | 14 |
| Sampled error rate | 7.1% |
| Clean entries sampled | 66 |
| Clean-sample miss rate | 7.6% |
| Escalation queue | 62 |

Wrong patches: P000037

Missed clean entries: A00680, A00708, A00641, A00563, A00318

THRESHOLDS error 7.1% (limit 5%) BREACH; miss 7.6% (limit 2%) BREACH

## Provenance and maintainer decisions

- **Go:** batch 01 go recorded 2026-08-13 20:59 CDT (25 chunks,
  00008–00032, rids A00210–A00959).
- **Round 1 (sweep-v2):** breached both thresholds (error 6.7%,
  miss 7.4%; 4 of 5 misses sub-token class-8, 1 circular v.-ref;
  wrong patch P000026 short delete boundary). Batch NOT committed
  per runbook; maintainer chose fix-detection-and-re-sweep.
- **Remediation (commit 1c32f6f):** deterministic anomaly-hint
  detector (`anomalies.ts`, 5 precision-tuned rules, 1,087/32,512
  entries hinted) wired into prep; sweep-v3 signed 2026-08-13.
- **Round 2 (sweep-v3, this report):** all five round-1 misses
  correctly dispositioned; hint judgment 14 accepted / ~20
  rejected with reasons. Thresholds numerically breached again —
  error 7.1% (one label-only slip, P000037 `defect_class` token;
  repair verified correct), miss 7.6% (5 novel one-off forensic
  finds by the Opus tier, no systematic class).
- **Acceptance (2026-08-14, maintainer):** accept with
  corrections. P000037's class label normalized to
  `chopped-duplicated-tail`; the 5 verifier finds folded into the
  manifest as escalations (A00680, A00318 → needs_human_judgment;
  A00708, A00641, A00563 → needs_print_check). Post-fold
  dispositions: clean 655 / repaired 28 / needs_print_check 36 /
  needs_human_judgment 31; escalation queue 67.
- **Process note for batch 02:** the miss threshold needs a
  fixed-standard definition — each Opus verification pass finds
  novel defect shapes (moving target), so raw miss-rate does not
  converge under re-sweeps. Candidate detector additions from this
  round: period-before-em-dash at anchor boundaries
  (`</a>—` vs dominant `</a>.—`), tag-adjacent token handling in
  the abbreviation tokenizer.
