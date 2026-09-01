# The two test tiers

**Status: in force from 2026-08-31.** Ruled by Brian as a follow-up to
batch 8 (PR #58), whose `Test` job was SIGTERM'd at 18m39s by CI's fixed
~20-minute wall with every assertion it reached passing. The suite was
not wrong; it was one job doing two jobs' work.

`bun test` is now split in two, by filename:

| Tier | Files | Command | CI job | Cost |
|---|---|---|---|---|
| Unit | `*.test.ts` | `bun qa:test` | `Test` | **0.53 s** |
| Corpus | `*.corpus.test.ts` | `bun run audit:corpus` | `Corpus Audit` | **429–452 s** |

Nothing was deleted, skipped or relaxed. The corpus tier makes
**1,090,256 `expect()` calls**, the same number it made before any of
this work; the whole-repository total moved from 1,091,890 to 1,091,895,
and the five are `test-tiers.test.ts`'s own.

## 1. The measurement that motivated it

Taken on `v2` at `919aeec`, before any change:

| | Files | Tests | Time |
|---|---:|---:|---:|
| Whole suite (`bun test`) | 90 | 1,261 | 559 s / 600 s |

Two identical runs 7.3% apart, which is the noise floor every figure
below has to clear. 26,565 lines of source have a sub-second unit suite;
everything else streams all 32,512 entries of
`data/source/jastrow-dictionary.jsonl` (41 MB) and runs the transform
pipeline over them.

### The brief's file counts were three files wrong, in the safe direction

The ruling described 40 corpus files and 19 that re-read the snapshot.
Measured by what the files actually call:

| Claim | Measured | Why the difference |
|---|---:|---|
| corpus files | **34** | six call `readSourceEntries(FIXTURE_PATH)` — a body fixture, not the snapshot |
| snapshot re-readers | **12** | the same six, plus `headword.corpus.test.ts`, which matched only inside a comment |
| already conventionally named | **18** | 4 as `*.corpus.test.ts`, 14 as `*-corpus.test.ts` — two conventions, not one |

The six that are NOT corpus tests are
`body/{dry-run,form-sections,lettered,migrate-dry,repairs,source}.test.ts`.
They stay in the fast tier, which is why it holds 912 tests rather than
the 813 the ruling projected.

## 2. How the tier is selected

`bun test` can only select on a path before it evaluates a module, so
the tier IS the filename. All 34 were renamed to one convention,
`*.corpus.test.ts`, collapsing the `-corpus` variant into it.

```jsonc
"qa:test":      "bun test --path-ignore-patterns='**/*.corpus.test.ts'",
"audit:corpus": "bun test .corpus.test.ts"
```

`--path-ignore-patterns` is a Bun 1.3 flag (the version `.mise.toml`
pins). The corpus command relies on Bun's positional filter being a
substring match on the path; `research/corpus-inputs.test.ts` is a unit
test with `corpus` in its name and is correctly not matched, because it
does not contain the dotted infix.

### Rejected: making bare `bun test` the fast tier via `bunfig.toml`

`[test] pathIgnorePatterns` in `bunfig.toml` works, and would make a
bare `bun test` the fast tier — closer to the ruling's wording. It was
rejected because it also makes the corpus tier unreachable by name:
with it in place, `bun test plural-capture.corpus` matches nothing and
prints `Tests need ".test" … in the filename`, which reads as a broken
repository rather than a filtered one. Recovering the file needs
`--config=<other bunfig>` — verified to work, and verified to be a trap.

The cost of the choice made instead: a bare `bun test`, typed by hand,
still runs both tiers and takes ~8 minutes. No script or CI job does
that.

## 3. The guard

`admin/pipeline/test-tiers.test.ts` runs in the fast tier and asserts
the name and the behaviour agree in BOTH directions: no `*.test.ts`
carries a corpus signal, and no `*.corpus.test.ts` lacks one. It names
the offending files rather than counting them, because the failure has
to say which file to rename.

**What it cannot see, stated because a clean sweep can mean the tool
never looked.** It is a static scan for three signals — importing
`corpus-fixture.ts`, calling `readSourceEntries()` with no argument, or
naming `SOURCE_PATH`. It does not see a test that reaches the snapshot
INDIRECTLY through `census.ts`, `review.ts`, `dry-run.ts`,
`migrate-dry.ts`, `count.ts`, `headword-census.ts`, `patch/apply.ts` or
`research/corpus-inputs.ts`, each of which holds its own no-argument
read.

That gap is closed by measurement rather than by the grep: the slowest
file in the fast tier is `patch/snapshot.test.ts` at **0.11 s**, and a
41 MB read does not fit under that. If the gap ever opens, the symptom
is a slow unit tier, not a green guard.

## 4. Sharing the corpus, and what it bought

`corpus-fixture.ts` memoises three stages — `sourceEntries()`,
`repairedEntries()`, `composedEntries()` — once per `bun test` run.
Twelve files were still reading the snapshot themselves; all twelve now
take it from the fixture, and three of them were rebuilding a stage the
fixture already holds:

| File | What it stopped rebuilding |
|---|---|
| `body/pipeline-links.corpus.test.ts` | the full-registry pass (it IS `composedEntries()`) and two extra `applyRepairs` passes |
| `transform/registry.order.corpus.test.ts` | a whole `applyRepairs` + `text-repairs` rebuild of the composed stage |
| `body/deletion-baseline.corpus.test.ts` | one `applyRepairs` pass |

Corpus tier, measured 2026-08-31, arm64 macOS, Bun 1.3.14:

| Variant | Time |
|---|---:|
| after the rename, before any sharing | 542 s |
| everything except the `pipeline-links` conversion | 534 s |
| **all conversions** | **452 s / 429 s** |

**−89 s, −16.5%** against the 542 s rename-only tier (a second run of
the converted tier came in at 429 s, so the figure is a range and the
point estimate is the slower end). The counterfactual row says where it
came from: the `pipeline-links` conversion is worth 82 s of it. The remaining
conversions total 8 s, which is **inside the 7.3% noise floor** and so is
not claimed as a win — they were made because a test that re-reads a
41 MB file it already has in memory is wrong regardless of what the
clock says.

### Per-file timings from a shared-memo run are not attributable

The fixture's build cost lands on whichever file calls it first. That
file changed during this work, so the per-file before/after table looked
like `stem.corpus` improving by 51 s and `pipeline-links` regressing by
5 s when neither had happened — the build had simply moved.

The honest per-file number is the isolated one, and for
`pipeline-links` it is uncomfortable: run ALONE that file went **178 s →
218 s**, because nothing else consumes the three stages it now builds.
Run in the tier, where 21 other files consume them, it is worth 82 s.
Both numbers are in its docstring. Do not "optimise" that file again on
the strength of a shared-run timing.

## 5. Known costs and follow-ups

Not defects; deliberate limits of a file-level split, listed so the next
person does not rediscover them.

1. **274 of the 352 corpus-tier tests run in under 10 ms** — 0.05 s
   between them. They are slow-tier only because they share a file with
   a corpus gate: 33 in `anaphora.corpus.test.ts`, 24 in
   `registry.order.corpus.test.ts`, 21 in `punct-seams.corpus.test.ts`.
   Splitting those files the way `duplication.test.ts` /
   `duplication.corpus.test.ts` are already split would return them to
   the fast gate. It changes no assertion and was left out of this
   change as separable churn.
2. **CI headroom is ~22%, and the ratio was worse than the ruling
   estimated.** MEASURED on PR #59's first run: `Corpus Audit` passed in
   **15m37s** (937 s) against 436 s locally — a ratio of **2.15×**, not
   the 1.85× carried over from #58. The projection written here before
   that run said ~14 minutes and was optimistic by a minute and a half.
   Against the ~20-minute wall that leaves 4m23s.

   `Test` in the same run took 20s wall, nearly all of it checkout and
   `bun ci`; the tests themselves are half a second.

   The lever, when the tier grows: `bun test --shard=N/M` splits
   `Corpus Audit` across parallel jobs. Each shard rebuilds the fixture
   — ~52 s locally, so ~110 s on CI — which makes three shards roughly
   (937 − 110) / 3 + 110 ≈ 6.5 minutes each, at three times the runner
   minutes and two extra required checks. Follow-up 1 is the cheaper
   move and should come first: it takes 274 tests out of this job
   without touching an assertion. `bun test --shard=1/N`
   exists and would split `Corpus Audit` across parallel jobs, at the
   cost of one fixture build per shard. Reach for it when the tier
   passes ~16 minutes on CI, not before.
3. **No `timeout-minutes` was added** to the workflow. The ~20-minute
   wall is a repo/org Actions setting invisible in the repository, and
   guessing at a job-level value that interacts with it would be
   guessing. A short explicit timeout on `Test` — which should never
   exceed a second or two — would make a re-inflated fast tier fail in
   seconds instead of minutes, and is worth considering separately.
4. **`corpus-fixture.ts` still lives in `transform/rules/`** while its
   importers now span `body/`, `transform/` and `transform/rules/`. Its
   docstring says so. Moving it is 22 import rewrites and no behaviour
   change.

5. **A local CodeRabbit pass over this branch raised two structural
   findings in files this change only RENAMED.** Both predate it and
   both are real; neither was fixed here, because touching them would
   mean rewriting a corpus file whose only change so far is its name.

   - `rules/continuation-marker.corpus.test.ts` runs its corpus pass at
     MODULE SCOPE. No `it` timeout covers it, an exception inside it
     surfaces as a module load error rather than a test failure, and
     `bun test -t` on any single test in the file still pays the whole
     cost. `registry.order.corpus.test.ts` states the rule this breaks
     at its own lines 965-971. The fix is the lazily-awaited cached
     promise that file already uses.
   - `registry.order.corpus.test.ts:1412` runs `expect` inside a triple
     loop — every value, every FIELD rule, every one of 32,512 entries.
     That single loop is roughly 95% of the corpus tier's 1,090,256
     matcher calls, and on failure it reports `true !== false` with no
     rule id, rid or value. Collecting offenders and asserting an empty
     list once, as the `orphaned` array at line 1263 already does in
     the same file, is both faster and legible. Note that doing it
     changes the tier's expect() total by about a million, so re-baseline
     the figure this document quotes when it happens.

6. **Rewriting file references in dated batch reports has a failure
   mode**, found the hard way in this change.
   `docs/v2/transform-batch-3a.md` §1233 recorded that a brief had named
   a NONEXISTENT file, `rules/gershayim.corpus.test.ts`, when the real
   one was `rules/gershayim.test.ts`. The mechanical rewrite turned the
   second into the first and left a sentence naming one path twice. The
   two names have genuinely swapped, and the passage now says so rather
   than pretending otherwise. Two other lines in that report claimed the
   corpus tier runs under `bun qa`, which this change made false; both
   are corrected in place with the date.

## 6. Writing a new corpus test

- Name it `*.corpus.test.ts`. The guard fails the build if you do not.
- Take entries from `corpus-fixture.ts`. Never call
  `readSourceEntries()` with no argument.
- The arrays are SHARED and read-only. Rules take them as input and
  return new objects, which is safe; writing to one corrupts every later
  file in the run.
- If your rule is in the phase you are censusing, build the stage with
  your own rule HELD OUT — otherwise the census reads your rule's own
  output. `see-particle.corpus.test.ts`'s `stage()` is the worked
  example, including how to filter the pass down to the entries that can
  matter and pin the soundness argument as an assertion.
