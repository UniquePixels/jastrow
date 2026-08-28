# Headword field integrity — Phase 2 batch 5 design

**Status:** DRAFT 2026-08-27 (scope ruled by Brian; §5.1's paren ruling
settled the same day). Extends
[the transform module design](2026-08-22-transform-module-design.md);
that spec's §3 contract, §5 gates and §6 write-back mechanism hold here
unchanged unless this document says otherwise. The batch boundary that
created this document is ruled in
[the anchor & paren integrity design](2026-08-26-anchor-paren-integrity-design.md)
§1: `parenthesized-alt-headword` *"is a paren-integrity defect, but it
edits `alt_headwords`, which is batch 5's object. Pulling it forward
would take batch 5's largest row."*

Batch 5 is the first batch whose object is a **field**, not markup.
Every previous batch edited HTML inside `definition`; every rule here
edits `headword`, `alt_headwords` or `content.morphology`, none of
which ever carries a tag. `markup.ts` is therefore a no-op for this
batch and `no-new-text.ts` is the only gate with anything to say — a
change in the safety posture that §6 states rather than leaves to be
discovered.

## 1. What this batch is

**Scope, ruled 2026-08-27 (Brian): 5 rows / 879 catalogued instances.**
The set is **entanglement-closed** — no `entangledWith` edge leaves it
and none enters it — so it ships as one pull request without leaving
`unaccountedEdges()` with a dangling endpoint.

> **CORRECTED 2026-08-28 (impl/phase-2-batch-5, Task 3).** Closure at
> the batch BOUNDARY is what that sentence measures, and it still holds.
> But this document also claimed, in the constraints it handed the
> implementation plan, that the batch adds **no** `entangledWith` edge
> at all. **That is false, and it was never measured — the reasoning was
> about other rules and never checked the batch's own pair.**
> `parenthesized-alt-headword` and `phrase-alt-headword-stub` DO NOT
> COMMUTE, by one occurrence in each direction:
>
> - `B00780` holds `'(עֵין ב׳)'`. Phrase-first cannot see it — the stub
>   token is `'ב׳)'` and `expandStub` refuses anything following the
>   geresh. Paren-first strips the delimiters and the item then expands.
> - `A02403` holds `'אסת׳ )'`. The strip leaves a single token, so it
>   LEAVES the phrase population rather than entering it.
>
> Composed paren-first the phrase rule fires **236** times; phrase-first,
> **235**. `parenthesized-alt-headword` therefore registers STRICTLY
> BEFORE `phrase-alt-headword-stub`, the edge is declared on both rows,
> and `checkAdjacency()` holds them gap-free. Pinned in
> `headword.corpus.test.ts` in the shape of the disagreement rather than
> as the winning order, so a later reorder fails with the reason
> attached. **This is what the commutation gate of PR #50 exists to
> catch, and it caught it — in a batch whose spec had argued it could
> not happen.**

```bash
bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
const rows=(await parsePatterns(await Bun.file("data/patches/patterns.jsonl").text())).filter(r=>r.status==="candidate"&&r.route!==undefined);
const by=new Map(rows.map(r=>[r.id,r]));
const set=new Set(["parenthesized-alt-headword","phrase-alt-headword-stub","abbrev-headword-stub","gender-pair-headword-line-collapse","abbrev-fused-headword"]);
let n=0; for(const id of set) n+=by.get(id).corpusCount;
const out=[...set].flatMap(id=>(by.get(id).entangledWith??[]).filter(e=>!set.has(e)));
const inn=rows.filter(r=>!set.has(r.id)&&(r.entangledWith??[]).some(e=>set.has(e))).map(r=>r.id);
console.log({rows:set.size,instances:n,edgesOut:out,edgesIn:inn});'
# → {rows:5, instances:879, edgesOut:[], edgesIn:[]}
```

All five rows are `blocking: true`. Per the triage doc's T6 that means
each *"breaks the render or would be baked in by the transform"* — here
it is uniformly the second reading: `altHeadwords` **survives** into v2
as clean form objects (`entry.schema.json`, `formObject` with `text`
`minLength: 1`), so a defect left in the field is a defect compiled
into the shipped lookup index.

### 1.1 Why these five and not the stem family

The other coherent family in `PENDING` is the stem/grammar set
(`stranded-stem-head` 544, `binyan-form-leading-space` 457,
`binyan-form-empty-slot` 446, `empty-stem-section` 342,
`asterisk-stem-label` 69, `stem-head-marker-chop` 18 = 1,876). It is a
different field object — `sense.grammar.*` rather than the entry's
headword line — and is deferred to batch 6. Split by predicate, not by
adjacency, per batch 4 §1.

Two rows sit next to this batch and are deliberately **out** of it:

- **`abbrev-in-alt-headwords`** (2,035) — the parent row
  `phrase-alt-headword-stub` was carved out of. It moved transform →
  judgment on 2026-08-22 and stays there; §4.2 explains why that
  disposition reaches into this batch.
- **`multiword-abbrev-mislink`** (22, judgment) — named by the phrase
  row's own `reason` as its anchor-side counterpart. Anchors are not
  this batch's object.

## 2. Measured scope

**Every one of the five rows reproduced its catalogued count on first
measurement. Nothing was tuned, and no count is corrected by this
batch.** That is worth stating plainly because it has not happened
before: batch 2 corrected three counts, 3a one, 3b seven, batch 4 two.

| Row | Catalogued | Measured | Executable predicate |
|---|---:|---|---|
| `parenthesized-alt-headword` | 580 | **580 ent / 654 occ** | an `alt_headwords` item contains `(` or `)` |
| `phrase-alt-headword-stub` | 236 | **236 ent / 244 occ** | an item contains a geresh **and** has ≥2 tokens once Roman homograph marks are removed |
| `abbrev-headword-stub` | 34 | **34 ent** | `headword` contains a geresh, no whitespace, and >1 Hebrew letter |
| `gender-pair-headword-line-collapse` | 22 | **22 ent** (21 with `content.morphology === 'f.'`) | `alt_headwords` holds the same string twice |
| `abbrev-fused-headword` | 7 | **7 ent** | `headword` contains whitespace **and** a geresh |

Three of the five predicates are one-liners over the pinned snapshot.
The other two needed a discriminator that is itself a finding, and both
are recorded here so no later reader re-derives them:

- **The phrase row's predicate must delete Roman homograph marks before
  counting tokens.** The naive reading — "item contains a geresh and a
  space" — returns **410 entries / 419 occurrences**, not 236 / 244.
  The 175 extra occurrences are single-word stubs carrying a homograph
  numeral (`"אֲמוּ׳ II"`), which the parent audit already classified as
  job 1: *"175 carrying a Roman homograph numeral any expansion must
  preserve"*
  ([abbrev-in-alt-headwords.md:47](../../data/patches/catalogue-audit/abbrev-in-alt-headwords.md)).
  Dropping token shapes matching `^[IVXLC]+$` recovers **236 / 244
  exactly**; the excluded shapes are `I` 92, `II` 77, `III` 5, `IV` 1.
- **The headword-stub row's predicate must exclude the alphabet
  articles.** 55 headwords carry a geresh with no whitespace; 21 of
  them are the one-letter alphabet/numeral articles (`א׳`, `ב׳` … `ת׳`),
  which are genuine lexemes, not stubs. 55 − 21 = **34 exactly**, and
  the row's `reason` predicted both figures.

## 3. `parenthesized-alt-headword` is not the row its description names

The catalogue describes it as *"alt_headwords item wrapped in the print
parentheses, sometimes unclosed"*. **"Sometimes unclosed" is wrong, and
the way it is wrong is the batch's central finding.**

### 3.1 The unclosed items are not unclosed — they are torn

A00083 is canonical:

```
headword: אַבְזָקַת
alt_headwords: ["(אַבְזָקָא", "אַבְזָקָה)"]
```

Print sets **one** parenthetical group holding two variant forms. The
upstream comma-split cut the group at its internal comma and left the
delimiters attached to the fragments on either side. Neither item is
unclosed; together they are one closed group.

Measured over the 654 occurrences:

| Sub-shape | Occ | What it is |
|---|---:|---|
| **A** wrapped-whole | 464 | `(X)` — one form, both delimiters |
| **A′** wrapped-whole behind `*` | 18 | `*(X)` — see §3.3 |
| **A″** wrapped, homograph mark outside | 5 | `(אַפְרִיקָא) I` |
| **B** open-only | 84 | starts `(`, no close — 69 of them pair (below) |
| **B′** close-only | 81 | ends `)`, no open — the same 69 pairings seen from the other side |
| **C** interior optional-letter | 1 | `אִיסְפְּלָנִית(א)` — REFUSED, §3.4 |
| **C′** stray close | 1 | `אֵינָשׁ) אִינְשָׁא` — REFUSED, §3.4 |

> **CORRECTED 2026-08-28 (impl/phase-2-batch-5, Task 0).** This table
> read *"A 464 · A′ 18 · B 69 groups · C 28 orphans"*, which is four
> buckets summing to nothing: it counted B in GROUPS while the other
> rows counted occurrences, and it omitted the 5 mark-carrying wrapped
> items and the interior-paren item entirely. The seven buckets above
> sum to **654** exactly and are asserted to partition the population —
> `unbucketed` is empty in
> `rules/headword.corpus.test.ts`. Nothing downstream moves: the
> refusals were already 2 and the pairing figures already 69 / 28.

The 84 open-only items resolve as **69 paired** (52 adjacent, 17
non-adjacent) and **15 orphaned**; the 81 close-only items as the same
69 plus **12 orphaned**. Orphans total 28 with the two refusals: 15 + 12
+ 1 stray close. Every figure here is a test, not a paragraph.

The 69 groups split **52 adjacent** (`b+1 === c`) and **17
non-adjacent**, the latter spanning one or two intervening items that
are themselves inside the parentheses:

```
A00888  ["(אוֹרַיְיתָא)", "(אוֹרָיָיתָא", "אוֹרְיָא", "אוֹרַיְתָא", "אוֹרְיָה)"]
D00661  ["(דיסגנים", "דיסגניס", "דיסקניס)"]
```

Reproduce with `bun` over the snapshot: index every item matching
`^\(` with no `)` and every item matching `\)$` with no `(`, then pair
each open with the nearest unconsumed later close in the same array.
The pairing is total for 69 of 84 opens; the residue is §3.4's orphans.

### 3.2 The ruling, and what it costs

**Ruling (Brian, 2026-08-27): strip the delimiters, add no new form-object
mark.** The parens are print's grouping punctuation around a run of
variant readings; they are not part of any lemma, and a lookup key
reading `(אוֹב)` matches nothing a user will type. The grouping signal
is not preserved — print's parentheses remain readable in the
definition prose and in the hOCR, and `entry.schema.json`'s form object
is not widened.

Because the ruling is *strip only*, **sub-shapes A, A′, B and C all
produce the same output under one blanket operation**: delete every
`(` and `)` from the item, collapse the whitespace runs the deletion
creates, and trim. The taxonomy in §3.1 is the batch's **evidence that
the blanket strip is safe**, not a branch in the code. Stating it the
other way round would invite three rules where one is correct.

Whitespace is not optional bookkeeping here: **7 occurrences have a
space adjacent to a delimiter**, and **12 occurrences contain a double
space after a naive strip** — `"(פַּנְיָה ) I"` becomes `"פַּנְיָה  I"`
without the collapse. Deleting whitespace is a sub-multiset shrink, so
the collapse needs no `allows`.

### 3.3 The `*` and the paren are the same 18 items

All 18 starred `alt_headwords` occurrences in the corpus **also carry
parentheses** — `*(אוּסְיָא)`, `*(נגד)`, `*(אונ׳)`. The count is not
approximate: `starOcc: 18, starEnt: 18, starWithParen: 18`, and it is
the same 18 the data architecture reports as *"alts carry marks too:
529 Roman, 18 starred"*
([v2-data-architecture-design.md:83](2026-07-08-v2-data-architecture-design.md)).

**Consequence for whoever writes `migrate.ts`:** the reconstructed-mark
decomposer has never been exercised against a bare `*X` alt, because
none exists in the source today. After this batch all 18 become bare
`*X`. A decomposer written to `^\*` works either way; one written to
match the observed `*(` shape would silently stop marking all 18.
Recorded here, in the rule's docstring, and in §8's write-back.

### 3.4 Two occurrences the rule must REFUSE

A blanket strip is correct for 652 of the 654. Two are not grouping
delimiters and the rule must decline them rather than damage them:

- **`A01480 "אִיסְפְּלָנִית(א)"`** — the parenthesis is *interior* and
  marks an **optional final letter**, print's convention for a form
  attested with and without the aleph. Stripping yields the plene form
  and silently discards the other reading. One occurrence.
- **`A01394 "אֵינָשׁ) אִינְשָׁא"`** — a close delimiter mid-string with
  its open in a *different* item (`"(אֵינָשָׁא"`), i.e. the tear of §3.1
  landing at the wrong offset. A blanket strip yields
  `"אֵינָשׁ אִינְשָׁא"`, a two-word item that is not a phrase lemma and
  is not a spelling of anything. Repairing it means re-splitting, which
  is a different operation. One occurrence.

Both refusals are pinned as fixtures. **A rule that quietly widened to
cover them would be the failure mode batch 3b named** — a rule claiming
a population nothing gave it. See [[feedback_rendered_harm_rule]].

### 3.5 Stripping creates no duplicate, measured

`gender-pair-headword-line-collapse` is *defined* by a duplicate string
in `alt_headwords` (§5.4). If stripping parens could produce a second
copy of a sibling item, rule 1 would manufacture members of rule 4's
population — exactly the collision batch 3b found four times and gated
zero times.

Measured over all 8,673 entries carrying `alt_headwords`:

```
{ dupBefore: 22, dupAfterStripOnly_NEW: 0, bothDup: 22, emptyAfterStrip: 0 }
```

**Zero new duplicates**, and the 22 pre-existing ones are exactly rule
4's population, unmoved. `emptyAfterStrip: 0` also discharges the
schema risk: no item strips to `""`, so `formObject`'s
`text: minLength 1` cannot be violated. All three figures are pinned in
the corpus test.

## 4. Two rows whose own records are wrong or conditional

### 4.1 `abbrev-fused-headword`'s reason is false for 1 of its 7

The row's `reason` states: *"In all 7, prev_hw/next_hw alphabetize by
the SECOND token, proving the abbreviation is prefix debris."* Six of
seven hold. **A02002 does not.**

```
rid A02002   headword *כְּפַר א׳ אָמוּס   prev_hw אֱמוּנָה   next_hw אֲמוֹרָא
```

It alphabetizes between אֱמוּנָה and אֲמוֹרָא — by `אָמוּס`, the **third**
token, not the second. And its shape is not an abbreviation hoisted
ahead of a lemma: it is the toponym *Kfar Ammus* with its **interior**
token stubbed, which is `phrase-alt-headword-stub`'s shape appearing in
the `headword` field.

So the row holds **6 prefix-debris members plus 1 phrase stub**. The
rule ships for the 6; A02002 is handled by rule 2's mechanism against
the headword field, or refused. §7.2 carries the ruling.

This is [[feedback_reorder_falsifies_records]] recurring in its plainest
form — a permanent record asserting a uniformity that a seven-member
population does not have. The `reason` is corrected in §8.

### 4.2 `abbrev-headword-stub` (34) may not be transformable at all

The row's own `reason` ends: **"RAISE ONLY IF THAT ROW'S DISPOSITION IS
UPHELD"**, naming `abbrev-in-alt-headwords`. That row's disposition was
**not** upheld — it moved transform → judgment on 2026-08-22 — and the
audit that moved it found no deterministic expansion:

> the simplest anchor rule (locate the stub's final consonant in the
> headword) is unique for only 1,468 of 2,241 stubs (65.5%)
> — [abbrev-in-alt-headwords.md:69](../../data/patches/catalogue-audit/abbrev-in-alt-headwords.md)

`abbrev-headword-stub` is the same operation on the same shape in a
different field. **The expectation is that it withdraws to `judgment`
with a published audit**, following batches 2, 3b and 4. Task 1 audits
it; if any deterministic expansion exists for the 34 — the row notes
that two of them self-link, which is evidence about the *defect*, not
about repairability — the rule ships instead.

The batch is planned for both outcomes and neither changes the other
four rows.

## 5. What each rule does

### 5.1 `parenAltHeadword` — `parenthesized-alt-headword` (654 occ / 580 ent)

Delete every `(` and `)` from each `alt_headwords` item, collapse the
resulting whitespace runs, trim. **Refuse** the two occurrences of
§3.4. No `allows`, no `copied` — deletion only, so the sub-multiset
shrinks.

Expected: **652 occurrences repaired, 2 refused, 0 items emptied, 0
duplicates created.**

### 5.2 `phraseAltHeadwordStub` — `phrase-alt-headword-stub` (244 occ / 236 ent)

Substitute the entry's own headword for the geresh-stubbed token,
leaving the phrase's other tokens and any Roman homograph mark
untouched. The parent audit establishes determinism for this job and
only this job: *"Job 2 expands deterministically (substitute the
headword). Job 1 does not."*

This is the one rule in the batch that adds text, and the gate already
has the mechanism designed for it. `no-new-text.ts`'s docstring names
this exact case:

> `copied` (spec §5.1) declares text this call duplicated from
> elsewhere in the SAME entry — e.g. an abbreviation's elided tail,
> recovered from the entry's own `headword` into `alt_headwords`.

So the rule declares `copied: [<the substituted headword text>]` per
call. `copied` is verified to occur in the entry's own input before it
is credited, and credited as a multiset, so one declaration permits one
duplication. **No `allows` — no static allowance is correct here,
because the bytes differ per entry.**

The headword must be stripped of its own marks (`*`, Roman, superscript)
before substitution; substituting `*כְּפַר` would file the reconstruction
mark into the middle of a phrase.

### 5.3 `abbrevFusedHeadword` — `abbrev-fused-headword` (7)

Move the leading geresh abbreviation out of `headword` and into
`alt_headwords`, leaving the lemma as the headword. A pure move within
the entry: `fieldsOf` enumerates `headword` and `alt_headwords` into
the same multiset, so the text is neither invented nor lost and no
allowance is needed.

> **CORRECTED 2026-08-28 (impl/phase-2-batch-5, Task 5).** This read
> *"Ships for 6; A02002 per §7.2."* It ships for **FOUR**. A02002 is
> refused by shape as planned, and TWO MORE are refused for a reason
> this document did not anticipate: **rewriting a headword invalidates
> every anchor whose `data-ref` names the old string**, and two do —
> `K00108` names `'Jastrow, כִּדְ׳ כַּדְבוּבָא 1'`, `P00132` names
> `'Jastrow, עָ׳ עַדְיָא 1'`. `body/pipeline-links.test.ts`'s ABSOLUTE pin
> fell 71,385 → 71,383 while its differential assertion ("gains 90,
> loses none") stayed green, the rule sitting on both sides of that
> comparison.
>
> A dead link is worse for a reader than an awkward headword, so both
> are declined through a `LINKED_HEADWORDS` allowlist asserted equal to
> exactly the fused-shape headwords the corpus targets. The full repair
> — headword rewrite plus retarget — is gate work and therefore its own
> PR, per Brian's ruling of 2026-08-26.
>
> **The generalisation this document should have carried: a rule that
> rewrites `headword` is a LINK rule whether or not it touches an
> anchor,** because the corpus addresses entries by headword string.
> §6's gate table calls `link-target.ts` a no-op for this batch; that is
> true of the gate and false of the exposure.
>
> Downstream: the chain hazard below is **8** stale pointers, not 12.

### 5.4 `genderPairAltDuplicate` — `gender-pair-headword-line-collapse` (22)

Delete the duplicated `alt_headwords` string, keeping first occurrence
order. Both sub-shapes fall out of one operation — the 17 m./f. pair
collapses (duplicate adjacent) and the 5 "abbrev, full, abbrev"
repetitions (duplicate at distance):

```
A00648  ["אוּכָּמָא", "אוּכָּמָא", "אוּכַּמְתָּא"]      → ["אוּכָּמָא", "אוּכַּמְתָּא"]
H00875  ["חֵר׳", "חֵירוּפִין", "חֵר׳"]              → ["חֵר׳", "חֵירוּפִין"]
```

**The morphology half of this row is NOT repaired here, and the reason
is the gate.** 21 of the 22 carry `content.morphology === 'f.'`, which
labels a masculine headword feminine — print reads *"X, Xָא m., Xְתָּא
f."* and the `m.` was lost. Writing `'m.'` into the field is text the
entry does not contain; it would need an `allows: ['m.']`, which
§5's contract makes a maintainer ruling in code, and `allows` flattens
to codepoints, so that declaration would permit unlimited `m` and `.`
anywhere in the rule's diff. **The feminine form itself is already
present** as a sibling `alt_headwords` item in every case examined, so
nothing is lost by the array repair alone. §7.3 carries the ruling on
the morphology field.

### 5.5 `abbrevHeadwordStub` — `abbrev-headword-stub` (34), conditional

Ships only if Task 1's audit finds a deterministic expansion (§4.2).
Otherwise the row is withdrawn to `judgment` with a published audit
under `data/patches/catalogue-audit/`.

## 6. Verification

The safety posture differs from every previous batch and the plan must
not carry batch 4's checklist forward unexamined.

| Gate | Batch 1–4 | This batch |
|---|---|---|
| `markup.ts` | the working gate | **no-op** — no field here carries a tag |
| `link-target.ts` | three cases exercised | **no-op** — no anchors touched |
| `no-new-text.ts` | usually satisfied by deletion | **the only live gate**; rule 2 is the first `copied` user in the registry |
| `registry.ts` coverage / entanglement | as before | as before; 0 edges either way (§1) |
| commutation gate (PR #50) | 595 pairs | grows by the batch's rules; all four fields are disjoint from every shipped rule's object |

Additional checks this batch owes:

1. **`transform:count` MATCH for all five rows** against the pinned
   snapshot — the predicates of §2 are what the counts must reproduce.
2. **The three §3.5 figures pinned** (`dupAfterStripOnly_NEW: 0`,
   `emptyAfterStrip: 0`, `bothDup: 22`), so a later widening of rule 1
   fails a test rather than a lookup index.
3. **The two §3.4 refusals pinned as fixtures**, asserted by rid.
4. **`bun body:migrate-dry` diffed**, not assumed byte-identical — this
   is the first batch that changes fields the dry run reports on.
5. **The 18 starred alts asserted bare after the batch** (§3.3), so the
   forward hazard to `migrate.ts` is a test, not a paragraph.
6. **Full suite green from the branch baseline of 1,007 pass / 0 fail.**

What none of these can see, stated rather than implied: **nothing gates
`alt_headwords` for meaning.** Every check above is arithmetic over
codepoints and array lengths. A rule that stripped the correct
delimiters from the wrong 654 items would pass all six.

## 7. Rulings and open items before implementation

1. **SETTLED 2026-08-27 (Brian):** parens are stripped, no new
   form-object mark, no schema change (§3.2).
2. **OPEN — A02002.** Its shape is a phrase stub in the `headword`
   field (§4.1). Expand it with rule 2's mechanism, or refuse it and
   route it to `judgment` with the row's `reason` corrected? Default if
   unruled: **refuse and correct the reason**, since a 1-member
   sub-shape is not a population.
3. **OPEN — `content.morphology` on the 21** (§5.4). Leave `'f.'`
   standing (wrong but untouched), clear it, or rule an `allows: ['m.']`.
   Default if unruled: **leave it and record a new `judgment` row**, so
   the batch invents no text.
4. **SETTLED 2026-08-28 (Brian): `abbrev-headword-stub` WITHDRAWN to
   `judgment`** (§4.2), on the Task 1 audit
   [`abbrev-headword-stub.md`](../../data/patches/catalogue-audit/abbrev-headword-stub.md).
   At most 4 of 34 hold any source for the elided tail against the
   parent row's 65.5%, and the shortfall is structural: the stub IS the
   headword, so no fuller spelling of the lexeme exists in the entry by
   construction. **Batch 5 therefore ships four rules over four rows.**
   The audit also confirms the row's two self-linkers as LIVE
   definition anchors — a rendered defect no row owns, not repaired
   here, raised when the link family is next opened.

## 8. Expected write-backs to `patterns.jsonl`

Edit surgically — `renderPatterns()` reformats all 150 rows.

| Row | Change |
|---|---|
| `parenthesized-alt-headword` | first `reason` written: the §3.1 tear, the four sub-shapes, the 2 refusals, the §3.5 negatives |
| `parenthesized-alt-headword` | `description` corrected — "sometimes unclosed" → a torn print group |
| `abbrev-fused-headword` | `reason` corrected: 6 of 7 alphabetize by the second token; A02002 by the third and is a phrase stub |
| `phrase-alt-headword-stub` | `reason` gains the executable predicate (Roman-mark exclusion, 419 → 244) |
| `abbrev-headword-stub` | `route` → `judgment` **if** §4.2 resolves that way, with the audit path |
| `gender-pair-headword-line-collapse` | `reason` gains the morphology carve-out per §7.3 |

No `corpusCount` changes are expected — all five reproduce (§2). If one
moves, the move is the finding and gets its own section in the batch
report.

## 9. Decision log

| Date | Decision |
|---|---|
| 2026-08-26 | Batch 4 declines `parenthesized-alt-headword`, naming it batch 5's largest row |
| 2026-08-27 | Scope ruled: the 5-row headword family, 879 instances, entanglement-closed |
| 2026-08-27 | Parens stripped, no new form-object mark, no schema change |
| 2026-08-27 | Stem/grammar family (1,876) deferred to batch 6 — different field object |
| 2026-08-28 | `abbrev-headword-stub` withdrawn to `judgment`; batch ships 4 rules over 4 rows |
| 2026-08-28 | The batch's own two rules do not commute; paren-first pinned, edge declared |
| 2026-08-28 | Six pointing-conflict stubs REFUSED rather than resolved, under the 2026-08-22 no-vowel-inference ruling |
