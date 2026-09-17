# Transform batch 6a — the grammar-field audit

**Status: shipped 2026-08-28.** No rule. Two catalogue rows
**discarded** on measurement, one standing corpus gate added, and the
shape of batch 6 rewritten by what the measurement found. The registry
still holds **39 rules**; `coverage()` reads **0 unaccounted / 0
duplicated** over a transform route that shrank from **71 rows to 69**
and from 21,983 instances to **21,080**.

Audit: `data/patches/catalogue-audit/binyan-form-cleanup.md`.
Gate: `admin/pipeline/body/binyan-cleanup.corpus.test.ts`.
Batch 6's remaining four rows are 6b's; §5 states what they owe.

## The findings that outlive the tasks

**1. TWO OF THE SIX ROWS WERE ALREADY REPAIRED, BY CODE THAT HAS RUN
SINCE BEFORE PHASE 2 BEGAN.** `repairs.ts:445 cleanBinyanForms` trims
both edges of every `binyan_form` item and drops every empty slot,
corpus-wide, inside `applyRepairs` — which runs *before* the transform
registry. Measured over all 32,512 entries, `binyan-form-leading-space`
is 523 → **0** and `binyan-form-empty-slot` is 486 → **0**. A rule for
either would have repaired nothing while its row claimed hundreds.

**2. It was found before the rule existed, and the step that found it
is one line.** This is batch 3a's two-owner collision recurring for the
fourth time; 3a found its own by accident at the last task of the batch,
after the rule had shipped. The difference here is only *where the
population was counted*: in `applyRepairs(entry).entry`, not in `entry`.
**`transform:count` and every census that predates this batch measure
raw source**, and raw-source measurement cannot distinguish "no rule
owns this" from "a rule already owns this and you are about to write a
second one". The gate this PR adds is the first that counts both sides
— `censusRaw` on the source entry and `censusPost` on
`applyRepairs(entry).entry`, in one walk.

**3. `stranded-stem-head` is over-measured by 31, and the discovery
predicate is not recorded anywhere.** The row claims 544 entries. The
nearest reconstruction — a definition opening, after optional leading
punctuation, with an italic run holding only stem labels — gives **575
entries / 582 occurrences**, of which **350 have no `verbal_stem`
anywhere in the entry** against the row's claimed 351. The 350 is close
enough to identify the population; the 575 is not close enough to call
the count reproduced. §3.

**4. The asterisk in `verbal_stem: "*."` is Jastrow's reconstruction
siglum, not a lost stem name — and v2 has already ruled on that
siglum.** Round 1 established it for headwords: *"the asterisk is not
part of the text — `formObject` carries it as the boolean
`reconstructed`"*, over 1,339 asterisked headwords and 2,098 asterisked
refs. **No `binyan_form` item anywhere in the corpus carries an
asterisk** (0 of 5,399), which is exactly what a parser that strips the
siglum into the label field would produce. §4.

**5. But `stems[].stem` is `required`, `minLength: 1` in the v2 schema,
and `stems[].forms` are plain strings.** So the repair those 47 members
need cannot be expressed today: deleting the junk label leaves a stem
section with no label the schema will accept, and moving the `*` onto
the form writes a character v2 has decided is not text into a field with
no `reconstructed` flag to carry it. `asterisk-stem-label` is not a
field-local row after all — 66 of its 69 belong with 6b's structural
work. §4.

## 1. Scope as ruled

Batch 6 was scoped as the stem/grammar family, six rows / 1,876
instances. Brian ruled the split on 2026-08-28: a field half with no new
architecture first, the structural half — which must wire the dormant
`structural-repairs` phase — as its own PR, the #50 shape.

The field half then dissolved under measurement. What shipped is the
audit.

| Row | Catalogued | Measured | Disposition |
|---|---:|---|---|
| `binyan-form-leading-space` | 457 | 523 occ / 457 ent raw, **0 post-repairs** | **DISCARDED** |
| `binyan-form-empty-slot` | 446 | 486 slots / 446 ent raw, **0 post-repairs** | **DISCARDED** |
| `asterisk-stem-label` | 69 | 69, exact, five sub-shapes | to 6b (§4) |
| `empty-stem-section` | 342 | 342 ent / 347 sections | to 6b |
| `stranded-stem-head` | 544 | **575 ent / 582 occ** | to 6b, count open (§3) |
| `stem-head-marker-chop` | 18 | 18 of 28, 37 candidates | to 6b |

Five of the six counts reproduce exactly on first measurement; only
`stranded-stem-head` does not.

## 2. The discards

The full argument is in the audit; three things belong here.

**The incumbent is correct, which is why this is a discard and not a
transfer.** Batch 3a met the same collision and ruled the other way —
the transform took the gershayim defect and `cite-escape` class 1 was
retired — because that pass was doing the job *wrong* (escaping `"` to
`&quot;` where print sets `״`) and composing badly (+90/−0 measured on
the rules, +68/−22 on the pipeline). `cleanBinyanForms` does exactly
what both rows ask, over 100% of both populations, and nothing
downstream reads the field edge: `rejoin.ts` never references
`binyan_form`, and `dry-run.ts:196` passes the array through as discrete
`BodyStem.forms`.

**The round-4 finding stands.** The leading-space row carried an audit
flag asking whether the space was a separator. Round 4 answered no. That
answer is why the existing trim is right; this discard withdraws the
ROW, not the finding.

**A discard grounded in another module needs a gate, or it is a
promise.** Deleting `cleanBinyanForms` would restore 523 leading spaces
and 486 empty slots with no ACTIVE catalogue row left to describe them —
both rows survive as `status: discarded` records of what was repaired
and why, which is not the same as a row anything routes work from — and
no other test in the suite counted either shape.
`binyan-cleanup.corpus.test.ts` asserts the raw figures, both zeroes,
the index-0 evidence (0 — the row's own argument for a split site), the
empty trailing population, and the pass's record count (938 records /
751 entries).

## 3. `stranded-stem-head` — the count is open

The row's predicate was never written down, so "reproduce the count" has
no exact target. Reconstruction, over `definition` at every sense depth:

```text
^[\s,;.=]*<i>\s*STEM\.(\s*[/,]\s*STEM\.)*\s*</i>
```

- strict form (definition must OPEN with the italic): 147 entries
- with leading punctuation and inner spaces allowed: **575 entries /
  582 occurrences**, 350 of them with no `verbal_stem` anywhere
- any italic stem-run anywhere in a definition: 1,006 entries / 1,217
  occurrences — far too wide

The row records 544 and 351. The 350 lands one from the recorded
figure while the entry count lands 31 above it, which says the shape is
right and the boundary is not. **6b must state its predicate in the rule
and correct the count to whatever that predicate measures** — the
programme's rule since batch 3b, where seven counts moved.

## 4. `asterisk-stem-label` — why it is not a field-local row

69 values, none of them a binyan name, in five sub-shapes that need five
different repairs. The 69 are structurally uniform in three respects,
measured: **every one carries no `definition` at all** (69 of 69 —
`undefined`, not empty), every one carries at least one non-empty
`binyan_form`, and 68 of 69 hold their content in child senses.

| Sub-shape | n | What the repair would be |
|---|---:|---|
| `"*."` / `"* ."` | 44 | siglum, no label — see below |
| punctuation-only debris `"[."` ×6, `"[[."`, `"(."`, `",."`, `"."` | 10 | a delimiter torn off the block's own text |
| print section heads `"Compounds: ."`, `"Fem."`, `"Part. Hof."`, … | 9 | the block is not a stem section |
| `"*Pa."`, `"*Nif."`, `"*Ithpe."` | 3 | siglum retained WITH a valid label |
| stray period `"Pa. ."` ×2, `"Af. ."` | 3 | drop the trailing space-period — the only mechanical one |

**The 69th is `S01317`, and it is in two rows at once.** It is the one
member with no child senses and no definition — which is
`empty-stem-section`'s predicate, not this row's. Two of 6b's four rows
therefore share at least one record before either has a rule. Batch 3b's
hardest finding was a rule silently claiming a sibling row's members;
6b should measure this overlap in full rather than meet it in a gate.

**The bracket sub-shape carries its own falsifier, and it points at
`stranded-open-bracket`.** In all 6 `"[."` members the block's own text
is bracket-unbalanced at exactly **−1** — one orphan `]` and no opener —
and the single `"(."` member is paren-unbalanced at −1 with its text
literally beginning `") "`. So the delimiter belongs at the head of the
block's text and moving it restores balance. That is a text-preserving
move with a per-entry test. It is also a population that
`stranded-open-bracket` (audited: 87 occ / 85 ent in job A, 49 in job B,
18 homeless) may already claim from the other side — **6b must check
that collision before writing either rule.** `"[[."` (P01197) is
balance 0 and is not this repair.

**The asterisk members are blocked on the model, not on evidence.** The
siglum reading is well supported (§ finding 4). What it cannot survive
is the target schema: `stems[].stem` is required with `minLength: 1`, so
a stem section with no label is unrepresentable, and `stems[].forms` are
plain strings, so `reconstructed` — the boolean v2 uses for exactly this
siglum on `formObject` — has nowhere to live on a stem form. Either the
schema grows, or these blocks are ruled not to be stem sections. Both
are rulings, not transforms.

## 5. What 6b owes

1. **Wire `structural-repairs`.** `migrate-dry.ts:137-148` throws the
   moment a rule registers for that phase, by design, naming batch 6.
   `markup.ts`'s `totalDamage` fallback already anticipates a rule that
   changes an entry's field count.
2. **A text-LOSS gate.** `checkNoNewText` is a *sub-multiset* test: it
   sees invention and is blind to deletion. Every structural row in 6b
   deletes or moves — and `stem-head-marker-chop`'s own `reason` records
   that 3 of its 28 members hold real text a delete-the-marker rule
   would destroy. Nothing in the current stack could report that.
3. **The four rows**, with `stranded-stem-head`'s count corrected to a
   written predicate and `asterisk-stem-label` split by sub-shape.
4. **The `stranded-open-bracket` collision check** (§4).

## 6. What none of this can see

The gate added here proves `cleanBinyanForms` still repairs both
populations. It does **not** prove that no *third* mechanism repairs
some other catalogued row upstream of its rule. The general check is
still the one 3a proposed and nobody has run: measure every pending
row's population after `applyRepairs` rather than on raw source. Two of
six rows died on it in this batch, on the first occasion anyone tried
it.
