# Residue batch 02 — error-gate breach, 2026-09-04

Batch 02 (residue-01, chunks r00001–r00005, `sweep-v7`) **breached the
patch error gate and was not committed**. This records what happened,
what it cost, and what remediation it earns, per RUNBOOK step 6.

## Measured

| Measure | Batch 02 | Batch 01 | v5 calibration |
| --- | --- | --- | --- |
| Entries | 150 | 150 | 150 |
| Patches accepted / rejected at ingest | 5 / 0 | 5 / 0 | 4 / 0 |
| Patches sampled | 5 of 5 | 5 of 5 | 4 of 4 |
| **Sampled error rate (substantive)** | **20.0%** | 0.0% | 0.0% |
| Clean entries sampled | 15 | 15 | 15 |
| Clean-sample miss rate (catchable) | 26.7% | 13.3% | 26.7% |
| Verifier discoveries | 1 | 1 | 3 |

Catchable misses: A00644, A00229, A00952, A00519. Discovery: A00818.

Every accepted patch was sampled, so 20.0% is a count of 1 in 5, not
an estimate from a subsample.

## The failing patch

`P000080` — A00475, `replace`, class 7 `anchor-boundary-markup`,
confidence `med`.

```
find:    Keth. 104ᵇ. 2</a>)
replace: Keth. 104ᵇ.</a> 2)
```

The defect is real and the class is right: the anchor swallows the
next sense marker's digit. The repair introduces a second
anchor-boundary error of the same class by pulling the terminal
period **inside** the tag.

Corpus evidence, with a positive control:

| Shape | Count |
| --- | --- |
| `[ᵃᵇ]</a>.` — period outside the tag | 1,820 |
| `[ᵃᵇ].</a>` — period inside | **0** |
| `.</a>` anywhere — control | 6,821 |

The control matters: the predicate fires 6,821 times corpus-wide, so
the zero is evidence rather than a dead search. The correct form
`Keth. 104ᵇ</a>. 2)` is byte-identical and was available.

**This is an agent error against a stated rule, not a prompt gap.**
sweep-v7 already carries the invariant ("surrounding punctuation sits
outside the tag"). What it does not carry is the evidence, and the
same agent used exactly this kind of corpus check correctly elsewhere
in its own chunk. A bare invariant loses to a plausible-looking
alternative; 1,820 against 0 does not.

## Process error, recorded because it nearly hid the breach

The batch was committed **before** its threshold check. A prompt-fix
commit used `git add -A` and swept the un-verified tranche and
checkpoint in with it (`e26688b`); the removal is `c0cc625`. RUNBOOK
step 7 commits a batch after step 6 for exactly this reason. Batch
commits use explicit paths from here, never `-A`.

## Why the miss rate rose, and why that is not a quality regression

13.3% → 26.7% looks like a regression. Three of the four catchable
misses were found by the verifier reading the sweep's own **stated
reason** for rejecting a hint and finding the premise false:

- **A00519** — rejected because "no headword is exactly `הִי`".
  `הִי I` (E00329, glossed "she, v. הוּ") and `הִי II` (E00330) both
  exist.
- **A00952** — rejected because the target records `אִיזְ׳` in
  `alt_headwords`. That is the v7 §11 collision: recorded makes a
  link possible, not correct.
- **A00229** — rejected on "names a consonant string, not a lexeme",
  which is not a documented carve-out and concedes that nothing picks
  the target.

Those reasons exist only because `hint_notes` shipped with v7. Batch
01 had no field to hold them, so equivalent errors were invisible to
the tier. The likeliest reading is that auditability rose and the
measured rate followed it — not that the sweep got worse. It is a
reading, not a proof: re-running batch 01 with `hint_notes` is the
only way to separate the two, and that is not worth the spend.

`hint_notes` also caught a **positive control that never fired**:
A00818's rejection cited two sibling ו-letter entries as precedent,
and both are sentence-final, so neither licenses the mid-sentence
abbreviation dot actually at issue.

## Findings this batch earned

**Act on:**

1. **Class 7 needs the corpus evidence, not just the invariant** —
   the 1,820 / 0 / 6,821 table above. Prompt-only, no re-chunk.
2. **`inflection-escape-link` ignores the target's `plural_form`.**
   A00450's hint claims the target "matches neither the headword nor
   the form" while A00451 records `אִדְרַבְלִין` in its own
   `plural_form` and cross-refs back. Two independent reports. A
   verifier also measured the kind's premise: **a `Pl.` anchor targets
   a headword other than its host in 1,021 of 1,349 cases
   corpus-wide** — escaping is the norm, not a defect signature. Code
   fix, therefore re-chunks.
3. **The empty `{}` sense-head node belongs on the script-slated
   table** — 73 entries corpus-wide (72 with `sense[1] = "1)"`), plus
   11 whitespace-only heads, against 2,212 contentful heads. Counted,
   not extrapolated.

**Do NOT act on — claims that did not survive checking:**

- `exact-headword-diverge` "fires on the non-headword `הִי`". False;
  `הִי I` and `הִי II` exist and the detector was right. Acting on
  this would have weakened a working rule on a false premise. The
  verification tier flagged it explicitly to prevent that.
- The `√אב` root-sigil shape as "thousands corpus-wide", proposed for
  script-slating. Counted: **17 anchors display bare `אב` in the whole
  corpus**, and 74 anchors follow a root sigil at all. Script-slating
  it would tell every future agent to stay silent about a real defect.
- v6's class-10 wording as "too narrow". Withdrawn; see the batch 01
  report's struck item and v7's erratum.

## The pattern worth carrying forward

Across three runs, sweep agents have reliably **located** anomalies
and unreliably **diagnosed or quantified** them — six cases now,
three of which reached a fix queue before being checked. Every
mechanism claim and every corpus-scale claim from this tier needs
verifying against the code or the corpus before it is acted on. The
verification tier caught one of them; the other five were caught by
checking.

## Remediation

RUNBOOK step 6: the batch is not committed and the affected chunks
re-sweep. Affected: **`chunk-r00003`** only — the other four chunks'
patches all verified `ok`.

Recommended order:

1. Land finding 1 (prompt-only, no re-chunk).
2. Re-sweep `chunk-r00003`, re-ingest all five chunks, re-verify the
   replacement patch.
3. Land finding 2 (code) **after** batch 02 commits, since it
   re-chunks and would otherwise discard these 150 entries.
