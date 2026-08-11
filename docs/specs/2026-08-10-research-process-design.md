# Research Process — LLM-Assisted Data Cleanup Design

- **Date:** 2026-08-10
- **Status:** Draft — pending maintainer review
- **Parent:** [2026-07-03-v2-overhaul-design.md](2026-07-03-v2-overhaul-design.md).
  Pivots the open-ended defect-discovery work (the manual review-doc
  grind) to an LLM sweep that emits an auditable patch corpus.
  Validated rule-based fixes (tail duplications, marker reinserts,
  deferred-row rulings) are unaffected and remain deterministic
  pipeline steps.

## 1. Context

Manual entry-by-entry review (docs/v2/body-review) keeps surfacing
new defect variations — each review doc catches one class, and each
session finds classes no detector anticipated. The maintainer ruling
stands: the pipeline must *correct* the data, not certify that it is
accurately flawed. An intelligent per-entry pass is the only method
that generalizes to "find whatever is wrong with this entry."

An LLM pass is non-deterministic, so it cannot *be* a pipeline
stage. Instead it is a **patch generator**: its reviewed output — a
committed corpus of semantic patches — is what the deterministic
pipeline replays. Recreatability lives in the reviewed patch file,
not in re-running the model.

## 2. The three tracks

| Track | Runs | Deliverable |
| --- | --- | --- |
| **Research** (this spec's core) | Once, documented | Deterministic scripts + semantic patch corpus |
| **Pipeline** | Reproducibly, on demand | Per-entry JSON files the admin tool and compiler consume |
| **Maintenance** | Each upstream pull | Report of upstream changes; updated/retired patches |

## 3. Locked decisions (2026-08-10 session)

| Decision | Choice |
| --- | --- |
| Execution | Tranches on plan usage; maintainer gates each tranche against current usage windows. Batch API (own key, ~$100 at Sonnet intro pricing, ends 2026-08-31) remains the fallback. |
| Model mix | Sonnet 5 for sweep agents; Opus 5 escalation tier for entries the sweep flags as hard. Spend for quality; optimize by using the right model per tier. |
| Chunk size | ~20–40 entries per agent, to avoid long-context quality degradation |
| Repair constraint | Agents may **rearrange, re-tag, split, or delete existing text — never generate new words**. Any repair that would require new content is automatically `needs_print_check`. |
| Patch format | Semantic patches keyed by rid + field with `expected_before`, not line diffs |
| Print lookup | Agents never fetch/OCR print in pass 1; they log and escalate. A later tier uses page images with a vision-capable model (or maintainer + assistant on scans). |
| Snapshot pinning | Every patch records the source snapshot hash. Sefaria offers no historical versions, but the pipeline commits each decoded snapshot to `data/source/`, so git history is our version store. |

## 4. Research track

### 4.1 Steps

1. **Pull** current Sefaria data (done; documented for completeness).
   Hash the decoded snapshot; the hash pins the patch corpus.
2. **Chunk** the corpus into ~20–40-entry chunks, checkpointed by
   rid so any tranche is resumable.
3. **Dispatch sweep agents** (Sonnet 5) per chunk with the
   documented prompt (§4.2). Each agent analyzes every entry for
   structural defects, malformation, missing/implied senses,
   unclassified binyanim/sections, OCR artifacts (`l)` for `1)`),
   chopped or duplicated text — the full range of defects manual
   review has surfaced.
4. **Agents return**, per entry: a disposition (§4.4), zero or more
   semantic patches (§4.3) with confidence and rationale, and any
   issue they detected but could not repair (escalation queue).
5. **Synthesis pass** over all findings: aggregate corpus-wide,
   looking for cross-entry patterns invisible to per-entry agents
   (e.g. the K00081 tail duplication class). New defect classes
   found here feed back into the defect catalog; affected chunks
   may be re-swept.
6. **Verification pass**: second-opinion review (Opus 5) of all
   low-confidence patches plus a random sample of high-confidence
   ones, to measure the miss/error rate. A schema validator over
   all output is the cheap floor and runs on everything.
7. **Script extraction loop**: examine the patch corpus for defect
   classes that generalize into deterministic scripts. Then loop:
   write script → re-run pipeline → recompute which patches are now
   redundant (their `expected_before` no longer matches) → retire
   them → repeat until stable. What remains in the corpus is only
   the one-off, infeasible-to-script residue.

Deliverables: the deterministic script set (including final-schema
conversion and per-entry JSON splitting) and the residual patch
corpus, both committed.

### 4.2 Sweep agent prompt (documented, versioned)

The prompt is a committed artifact; every tranche records which
prompt version produced it. It must contain:

- **Role and goal:** analyze each entry against the target entry
  schema (provided in full) and report defects.
- **Defect catalog:** known classes with one example each —
  implied-1 senses, swallowed `—N)` markers, OCR `l)`/`1)`
  confusion, unnumbered senses missing their number field,
  unclassified binyan/section heads, chopped + duplicated tails,
  anchor-boundary markup errors, lost text (parentheticals),
  print-error carryovers. The catalog grows as synthesis (§4.1.5)
  finds new classes.
- **Canonical repair conventions:** how each class is repaired, so
  1,000+ independent agent runs make identical judgment calls on
  identical defects.
- **The hard constraint:** never invent text. Rearrange, re-tag,
  split, delete only. Repairs requiring new content →
  `needs_print_check`.
- **Output contract:** the patch schema (§4.3) and disposition
  taxonomy (§4.4), emitted as JSONL.

### 4.3 Semantic patch schema

One JSONL record per patch:

```jsonc
{
  "id": "P000123",            // stable patch id
  "rid": "K00081",
  "field": "body.senses[4].definition",
  "op": "split | retag | move | delete | replace",
  "expected_before": "…",     // exact current content; apply fails loudly on mismatch
  "after": "…",               // rearrangement of existing bytes only
  "confidence": "high | med | low",
  "rationale": "one-sentence why",
  "defect_class": "implied-one | swallowed-marker | …",
  "snapshot": "sha256:…",     // source snapshot the patch is valid against
  "prompt_version": "v1"
}
```

The `expected_before` assertion is the safety mechanism: it makes
application self-verifying, and it is what detects upstream drift
in the maintenance track (§6).

### 4.4 Disposition taxonomy

Every entry gets exactly one:

| Disposition | Meaning |
| --- | --- |
| `clean` | No defects found |
| `repaired` | One or more patches emitted, agent confident |
| `needs_print_check` | Defect found; repair requires the printed text (queued for the vision/print tier) |
| `needs_human_judgment` | Defect found; repair is a maintainer call, not a print question |

Flag-without-repair is a first-class outcome, not a fallback.

### 4.5 Tranche procedure

- Fixed-size tranches (e.g. 2–4K entries), checkpointed by rid.
- Before each tranche the maintainer checks current usage windows
  and gives the go/no-go — usage cannot be reliably monitored from
  inside a session, so the gate is manual by design.
- Each tranche's output (JSONL + escalation queue) is committed
  before the next tranche starts; a failed run loses at most one
  chunk.

## 5. Pipeline track

1. Pull data from Sefaria (commit decoded snapshot; hash it).
2. Run deterministic scripts against the data.
3. Apply the patch corpus. Any `expected_before` mismatch aborts
   loudly and names the patch.
4. Run post-patch scripts if needed (final schema, split into
   per-entry JSON files).

Output: the structured data directory of individual JSON entry
files consumed by the admin tool and compiler.

## 6. Maintenance track

1. Pull current Sefaria data.
2. Diff the new pull against the last committed pull (git history
   is the version store).
3. Analyze the diff against current production JSON files.
4. Produce a report of changes needing action.
5. Update the main pipeline's patches accordingly: when an upstream
   change touches a patched entry, the patch's `expected_before`
   fails to match — that loud mismatch *is* the worklist. Each
   flagged patch is updated (rebased onto the new upstream bytes)
   or retired (upstream fixed it). The main pipeline must always
   run clean against current Sefaria data.

Findings that are genuine Sefaria errors feed
[upstream-issues.md](../v2/upstream-issues.md) — upstream may fix
them for free over time, at which point step 5 retires our patch.

## 7. Known limits

- **Recall is not 100%.** One sweep catches most-but-not-all; the
  verification sample (§4.1.6) measures the miss rate and tells us
  whether a second sweep pays for itself.
- **Per-entry agents cannot see cross-entry patterns** — that is
  what the synthesis pass exists for.
- **Plausible-but-wrong repairs happen** — that is what the
  verification pass and the never-invent-text constraint contain.

## 8. Relationship to in-flight work

The sense-structure-repair plan
([2026-08-06](../superpowers/plans/2026-08-06-sense-structure-repair.md))
is paused at Task 3 (doc-08 review, 26 rows undecided). Its
validated repairs stay in the deterministic script set. Whether the
remaining doc-08 rows are finished manually or folded into the
sweep (implied-one is a cataloged defect class the agents will
detect) is a maintainer call recorded at review of this spec.
