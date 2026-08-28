# Transform Batch 5 Implementation Plan — headword field integrity

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the five-row headword-field family as four deterministic
transforms plus one audited disposition, and do it under a gate stack
that is mostly inert — because this is the first batch whose object is
a **field** rather than markup.

**Architecture:** Every rule edits `headword`, `alt_headwords` or
`content.morphology`. None of those fields ever carries a tag in this
corpus, so `markup.ts` has nothing to compare and `link-target.ts` is
never reached. `no-new-text.ts` is the only gate with anything to say,
and **one rule deliberately exercises the half of it that has never
run**: `TransformResult.copied`. All rules land in one new module,
`rules/headword.ts`, because they share an object rather than a
mechanism — the opposite of batch 4's four-module split, and the reason
is stated in Task 2.

**Tech Stack:** Bun, TypeScript, Biome. Existing transform module
(`admin/pipeline/transform/`), `patterns.jsonl` catalogue, pinned
snapshot `data/source/jastrow-dictionary.jsonl` (sha256 `4c64ff03…`).

**Spec:** [`docs/specs/2026-08-27-headword-field-integrity-design.md`](../../specs/2026-08-27-headword-field-integrity-design.md).
Every count below is the spec's; if a measurement disagrees, **the
measurement wins and the disagreement is the finding**.

## Global Constraints

- Branch `impl/phase-2-batch-5`, off `v2` @ `4d8fff2`. Never commit to
  `main` or `v2`.
- Every commit signed off (`git commit -s`), subject ≤ 50 chars, format
  `<emoji> <type>(<scope>): <description>`. **1Password must be
  unlocked**; on `failed to fill whole buffer` the work stays staged and
  the commit is retried. Never `--no-gpg-sign`.
- `biome check .` before every commit. Branch baseline is **126 infos,
  0 errors** — a new *error* is a regression; infos are not.
- Baseline test count on `4d8fff2` is **1,007 pass / 0 fail**. Every
  task ends with a strictly larger pass count and 0 fail.
- `Rule.apply` MUST treat `entry` as immutable and return a NEW object,
  or the same reference unchanged. `count.ts` recursively freezes the
  corpus, so an in-place write is a `TypeError`.
- **Only Task 3's rule may declare anything on `TransformResult`, and
  only `copied`.** No rule in this batch sets `allows`, `composed`,
  `recombined`, `restored`, `corroborated`, `glyphCorrected` or
  `unlinks`. Any of those in a diff is a design error, not a ruling.
- Edit `patterns.jsonl` **surgically**, one line at a time —
  `renderPatterns()` reformats all 150 rows.
- Registry order is load-bearing; the order test asserts it against the
  live graph. This batch adds **no** `entangledWith` edges (spec §1).

## File structure

```
admin/pipeline/transform/
  rules/headword.ts             NEW — all four rules + the shared field walk
  rules/headword.test.ts        NEW — fixture tier
  rules/headword.corpus.test.ts NEW — corpus tier (kept separate: noExcessiveLinesPerFile)
  registry.ts                   EDIT — +4 RULES, −4/−5 PENDING
data/patches/
  patterns.jsonl                EDIT — surgical, per §8 of the spec
  catalogue-audit/abbrev-headword-stub.md   NEW (conditional, Task 1)
docs/v2/transform-batch-5.md    NEW — the batch report (Task 6)
```

---

### Task 0: The measurement basis, before any rule exists

**Goal:** Pin all five predicates and the spec's three safety negatives
as tests, so that every later task is measured against something
committed rather than against prose.

This task ships **no rule**. It exists because batch 3b's hardest
finding was a rule silently claiming another row's population, and the
only defence is a population asserted before the rule is written.

- [ ] Create `rules/headword.corpus.test.ts` with a shared loader over
      the pinned snapshot.
- [ ] Assert the five populations by **entry count and occurrence
      count**, exactly as spec §2:
      - `parenthesized-alt-headword` → 580 ent / 654 occ
      - `phrase-alt-headword-stub` → 236 ent / 244 occ
      - `abbrev-headword-stub` → 34 ent (and 55 total geresh headwords,
        21 alphabet articles — assert all three, so a later reader sees
        the subtraction rather than the result)
      - `gender-pair-headword-line-collapse` → 22 ent, 21 with
        `content.morphology === 'f.'`
      - `abbrev-fused-headword` → 7 ent
- [ ] Assert the phrase row's **discriminator**, not just its result:
      the naive predicate (geresh + whitespace) returns **410 / 419**,
      and the excluded Roman-mark shapes are `I` 92, `II` 77, `III` 5,
      `IV` 1. A future reader who deletes the mark exclusion must fail a
      test that names why it is there.
- [ ] Assert spec §3.1's paren taxonomy: 464 wrapped-whole, 18 starred,
      84 open-only, 81 close-only; **69 opens pair** (52 adjacent, 17
      non-adjacent), **28 orphans** (15 open, 12 close, 1 exotic).
- [ ] Assert spec §3.5's three negatives over all 8,673
      `alt_headwords`-carrying entries: `dupBefore: 22`,
      `dupAfterStripOnly_NEW: 0`, `emptyAfterStrip: 0`.
- [ ] Assert spec §3.3: **all 18 starred alts also carry parens**
      (`starOcc: 18, starEnt: 18, starWithParen: 18`).
- [ ] `biome check .`; full suite green.
- [ ] Commit: `🧺 chore(transform): pin batch 5 populations`

**Verification:** every assertion above passes on the pristine snapshot
with zero rules registered. If any figure disagrees with spec §2, STOP
and record the disagreement — do not adjust the test to match the spec.

---

### Task 1: Audit `abbrev-headword-stub` (34)

**Goal:** Decide whether the row is transformable, and publish the
reasoning either way.

The row's own `reason` ends **"RAISE ONLY IF THAT ROW'S DISPOSITION IS
UPHELD"**, naming `abbrev-in-alt-headwords` — whose disposition was
**not** upheld (transform → judgment, 2026-08-22). Spec §4.2.

- [ ] Enumerate the 34 and read them against their entries.
- [ ] Test the parent audit's anchor rule on this population: locate
      the stub's final consonant in — what? The parent recovered the
      tail from the *headword*; here the stub **is** the headword, so
      there is no second spelling in the field to align against. State
      explicitly what, if anything, could supply the tail: `refs[]`, the
      definition's own anchors, `prev_hw`/`next_hw` alphabetization.
- [ ] Follow up the row's two self-linkers — *"TWO OF THEM SELF-LINK:
      their own data-ref is their own truncated headword, so the
      redirect terminates on itself."* Confirm or correct by rid.
- [ ] **Decide.** If a deterministic expansion exists for all 34, the
      rule ships in Task 4. If not, withdraw the row to `judgment`.
- [ ] Publish `data/patches/catalogue-audit/abbrev-headword-stub.md`
      with the population, the probes, the negative result and the
      disposition — the batch-2/3b/4 withdrawal format.
- [ ] `biome check .`; full suite green.
- [ ] Commit: `📖 doc(catalogue): audit abbrev-headword-stub`

**Verification:** the audit names an executable predicate for every
claim it makes, and its disposition is written back in Task 5, not here.

**Expected outcome:** withdrawal to `judgment`. Plan for both; neither
changes the other four rows.

---

### Task 2: `parenAltHeadword` — the 654

**Goal:** Strip print's grouping delimiters from `alt_headwords`,
refusing the two occurrences that are not grouping delimiters.

**Why one module and not four.** Batch 4 split rules by *repair
mechanism* because the mechanism determined which gate could see the
change. Here every rule faces the same gate and the same field family,
and three of the four are a handful of entries each; four modules would
be four docstrings repeating one context. Split by mechanism when the
gate differs; split by object when it does not.

- [ ] Create `rules/headword.ts` with a shared, immutable
      `alt_headwords` walk — map to a new array, return the SAME entry
      reference when nothing changed.
- [ ] Implement the blanket strip: delete every `(` and `)`, collapse
      whitespace runs the deletion creates, trim.
- [ ] Implement the two refusals **by shape, not by rid** — an interior
      open paren (one not at string start, after an optional `*`), and a
      close paren with no open anywhere in the item. Assert in the test
      that these shapes select exactly `A01480` and `A01394`.
- [ ] Docstring: the §3.1 tear with A00083 shown, the four sub-shapes as
      EVIDENCE that the blanket strip is safe rather than as branches,
      the §3.5 negatives, and the §3.3 forward hazard to `migrate.ts`
      (all 18 starred alts become bare `*X`; a decomposer matching `*(`
      would silently stop marking them).
- [ ] Fixture tests: one per sub-shape (A, A′, B adjacent, B
      non-adjacent, C open orphan, C close orphan), plus both refusals,
      plus the two double-space cases (`"(פַּנְיָה ) I"` → `"פַּנְיָה I"`).
- [ ] Corpus test: **652 occurrences repaired, 2 refused, 0 emptied, 0
      duplicates created.**
- [ ] `biome check .`; full suite green.
- [ ] Commit: `🦄 new(transform): strip alt-headword parens`

**Verification:** `bun transform:count` reports MATCH for
`parenthesized-alt-headword` at 580. The rule declares nothing on
`TransformResult` — deletion only.

---

### Task 3: `phraseAltHeadwordStub` — the registry's first `copied` user

**Goal:** Expand the geresh-stubbed token in 244 phrase lemmas by
substituting the entry's own headword, declared through `copied`.

**This is the only rule in the batch that adds text**, and the gate was
designed for exactly it. `types.ts:262` on `allows`: *"A copy of
existing per-entry text (the tail of a headword recovered into an
alt-headword, say) cannot be expressed here — the copied bytes differ
per entry, not per rule. Declare those through `TransformResult.copied`
instead."*

- [ ] Implement the predicate from Task 0's test — geresh present,
      **≥2 tokens after removing `^[IVXLC]+$` marks**. Reuse the test's
      helper; do not re-spell it.
- [ ] Strip the headword's own marks (`*`, Roman, superscript) before
      substitution. Substituting `*כְּפַר` would file a reconstruction
      mark into the middle of a phrase.
- [ ] Declare `copied: [<the substituted headword text>]` per call, one
      declaration per substitution. `copied` is credited as a MULTISET,
      so N substitutions in one entry need N declarations.
- [ ] Write a test that **proves the gate is live**: a deliberately
      wrong `copied` (a string the entry does not hold) must be reported
      as a violation, not silently permitted. Without this the batch
      cannot claim the mechanism works — only that it did not complain.
- [ ] Fixture tests: `בַּר א׳` / `בֵּי א׳` / `כְּפַר א׳` shapes, a member
      carrying a Roman mark that must survive, and a member whose
      headword carries `*`.
- [ ] Corpus test: 244 occ / 236 ent, and **0 items containing a geresh
      remain among them** after the rule.
- [ ] `biome check .`; full suite green.
- [ ] Commit: `🦄 new(transform): expand phrase headword stubs`

**Verification:** `bun transform:count` MATCH at 236. `checkNoNewText`
green with `copied` declared, and RED when the negative test's bad
declaration is used.

---

### Task 4: The two small rules

**Goal:** `abbrevFusedHeadword` (7, minus A02002) and
`genderPairAltDuplicate` (22).

**4a — `abbrevFusedHeadword`.** Move the leading geresh abbreviation out
of `headword` into `alt_headwords`, leaving the lemma as the headword.
`fieldsOf` enumerates both fields into one multiset, so a move needs no
allowance.

- [ ] Implement over the 7-member predicate (whitespace + geresh in
      `headword`).
- [ ] **Refuse `A02002`** per spec §7.2's default: `*כְּפַר א׳ אָמוּס`
      alphabetizes by its THIRD token and is a phrase stub, not prefix
      debris. Select it by shape — the geresh token is not first — and
      assert the shape picks exactly that rid.
- [ ] Docstring records spec §4.1: the row's `reason` claim *"in all 7
      … the SECOND token"* is **false for A02002**, with the
      `prev_hw`/`next_hw` evidence.
- [ ] Corpus test: 6 repaired, 1 refused.

**4b — `genderPairAltDuplicate`.** Delete the duplicated
`alt_headwords` string, keeping first-occurrence order.

- [ ] Implement; one operation covers both sub-shapes (17 adjacent
      duplicates, 5 at distance).
- [ ] **Do not touch `content.morphology`** — spec §5.4 and §7.3.
      Writing `'m.'` is text the entry does not hold, and `allows`
      flattens to codepoints, so `allows: ['m.']` would permit unlimited
      `m` and `.` anywhere in the rule's diff. Docstring says so, and
      says the feminine form is already present as a sibling item.
- [ ] Corpus test: 22 entries, 22 duplicates removed, `morphology`
      byte-identical on all 22.
- [ ] `biome check .`; full suite green.
- [ ] Commit: `🦄 new(transform): fused headwords, gender dupes`

**Verification:** `transform:count` MATCH for both rows at 7 and 22.

---

### Task 5: Register, compose, write back

**Goal:** Put the rules in the registry, prove they compose, and correct
the catalogue.

- [ ] Add the four rules to `RULES`; remove their ids from `PENDING`
      (plus `abbrev-headword-stub`'s if Task 1 withdrew it — a withdrawn
      row leaves `PENDING` because it leaves the transform route, and
      `coverage().total` drops by one).
- [ ] Run `coverage()` and record: registered / pending / covered /
      total / unaccounted / duplicated. **0 unaccounted, 0 duplicated**
      or the task is not done.
- [ ] Run the commutation gate. All four rules touch fields no shipped
      rule touches, so the expectation is **0 new non-commuting pairs**.
      If one appears, it is a finding and gets a section in the report.
- [ ] Run the whole registry composed over the corpus **both orders**,
      as batch 4 §2 did — `transform:count` measures rules alone and
      cannot see composition.
- [ ] `bun body:migrate-dry` and **diff it**. Batches 3b and 4 could
      assert byte-identical; this batch changes fields the dry run
      reports, so the diff is expected to be non-empty and must be
      read, not waved through.
- [ ] Assert the §3.3 forward hazard as a test: after the batch, all 18
      starred alts are bare `*X` with no paren.
- [ ] Write back `patterns.jsonl` surgically, per spec §8:
      `parenthesized-alt-headword` gains its first `reason` and a
      corrected `description`; `abbrev-fused-headword`'s `reason` is
      corrected for A02002; `phrase-alt-headword-stub` gains the
      executable predicate; `gender-pair-headword-line-collapse` gains
      the morphology carve-out; `abbrev-headword-stub` re-routes if
      Task 1 said so.
- [ ] Recompute route totals from the catalogue — never type them.
- [ ] `biome check .`; full suite green.
- [ ] Commit: `🌈 improve(transform): register batch 5 rules`

**Verification:** `coverage()` 0 unaccounted / 0 duplicated;
`unaccountedEdges()` unchanged; every `transform:count` row MATCH.

---

### Task 6: The batch report

**Goal:** `docs/v2/transform-batch-5.md`, in the batch-2/3a/3b/4 form.

- [ ] Scope as ruled vs scope as shipped, with the three units named
      separately (catalogue rows, designed rules, registered `Rule`
      objects) — batch 4's plan was corrected twice for conflating them.
- [ ] **Lead with the findings that outlive the tasks.** Candidates, to
      be confirmed by what actually happens:
      1. All five counts reproduced on first measurement — a first for
         this program.
      2. `parenthesized-alt-headword`'s "unclosed" items are torn print
         groups, and the tear is an upstream split-site bug of the same
         family as `binyan-form-leading-space`.
      3. The registry's first `copied` user, and whether the gate's
         negative test caught what it claims to.
      4. Two permanent records were false or conditional before this
         batch read them (§4.1, §4.2).
      5. `markup.ts` and `link-target.ts` are inert for a whole batch —
         what that costs, stated rather than implied.
- [ ] State what none of the gates can see: **nothing gates
      `alt_headwords` for meaning.** A rule stripping the right
      delimiters from the wrong 654 items passes every check.
- [ ] Record open items and any new `judgment` rows the batch created.
- [ ] `biome check .`; full suite green.
- [ ] Commit: `📖 doc(v2): batch 5 report`

---

## Before the pull request

- [ ] `git fetch` and reason about branch state from the fetched refs,
      not from the session's opening snapshot.
- [ ] Full local review battery over the **whole diff** — cloud
      CodeRabbit is skipped on this repo, so local is the only review.
- [ ] `biome check .` — 0 errors.
- [ ] Full suite — strictly more than 1,007 pass, 0 fail.
- [ ] `bun transform:count` — every batch-5 row MATCH.
- [ ] Re-read every `reason` this batch wrote **against what the shipped
      code actually does**. Nothing gates prose; reviewers found ~15
      stale claims on batch 4's branch for exactly this reason.
- [ ] PR into `v2`. Workers Builds will be red — `wrangler.jsonc:9`
      points at `./app`, which arrives in Phase 4. Not a regression.
- [ ] Expect CodeRabbit `CHANGES_REQUESTED` then `APPROVED` on a later
      pass. Do not ask Brian to dismiss it; wait or nudge with
      `@coderabbitai review`.
