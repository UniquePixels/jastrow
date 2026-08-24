# Link transforms — Phase 2 batch 2 design

**Status:** approved 2026-08-22. Extends
[the transform module design](2026-08-22-transform-module-design.md);
that spec's §3 contract, §5 gates and §6 write-back mechanism all hold
here unchanged unless this document says otherwise.

## 1. What this batch is

Batch 2 in the module spec's §7 table reads *"Links & citations, ~14
rows, ~5,600 instances"*. The membership behind that line was never
recorded, and reading the catalogue splits it into two families that
need different machines:

| Family | Rows | Instances | What a rule must do |
|---|---:|---:|---|
| Never-linked works | 6 | 4,192 | **create** anchors for works absent from the corpus |
| Retarget mislinks | 14 | 1,977 | **change** an existing target to one that already exists |

**Ruling (2026-08-22): batch 2 is retarget only.** The never-linked
family is deferred to its own spec. Two reasons, both measured:

- The corpus carries 170,203 anchors across 304 distinct external
  works. Tanhuma, Sifra, Mekhilta and Pesikta d'Rav Kahana are in none
  of them — `mekhilta-sifra-never-linked` records that no "Sifra" work
  name appears at all — and no Sefaria index exists in `data/`. A rule
  creating those links writes target addresses nothing in the
  repository can check.
- Composing an address the source never held is inference, not
  movement. That is the test §5.2 established when
  `abbrev-in-alt-headwords` was withdrawn: *ask what a rule INFERS as
  opposed to what it MOVES.* It also sits against the body model's
  standing principle, recorded when three refs were removed as
  user-added — **show only what Jastrow linked**
  ([entry-body-model-design.md](2026-07-11-entry-body-model-design.md),
  decision log 2026-08-05).

Of the 14 retarget rows, two need a corpus-wide lookup rather than an
entry-local one: `v-sub-redirect-stub-mislink` (161 — locate a spelling
twin) and `containment-fallback-mislink` (22 — prove a same-skeleton
headword exists). Serving them means extending `Rule.apply(entry)` to
carry a corpus index, a contract the three landed rules depend on, and
pinning a derived index against `snapshot.lock`. Both rows are
non-blocking. **They are deferred with the never-linked family**;
batch 2 ships the twelve entry-local rows, 1,794 instances.

The module spec's §7 table must be amended to record what actually
shipped, the way batch 1's row already is.

## 2. The unlink ruling

Several rows have no correct target to point at: the link is wrong and
nothing right exists to replace it.

| Row | Instances | The audit's finding |
|---|---:|---|
| `h-cognate-self-link` | 85 | "for a biblical form there is no separate article for the link to promise" |
| `ellipsis-fragment-anchored` | 80 | 98.7% of the same construct is unanchored — bare text is the norm |
| `rabbi-name-linked-as-bible-book` | 41 | a rabbi's name anchored to the book of Joshua |
| `apparatus-cite-linked-as-scripture` | 8 | a Graetz volume and page anchored as chapter:verse |
| `geresh-letter-numeral-mislink` | ~20 of 475 | "ר׳" = Rabbi, "which should not be a lexical link at all" |

**Ruling (2026-08-22): unlink.** The rule removes the `<a>` wrapper and
leaves the display text exactly where it was. A link Jastrow never made
that resolves to an article the reader was never promised is linker
debris, not content; the same principle that removed the three baseless
refs removes these. Text is untouched, so the text gate still covers
the edit in full.

## 3. Architecture

Three new files under `admin/pipeline/transform/`, plus one gate wired
into the runner beside the two that exist.

| File | Role |
|---|---|
| `links.ts` | Anchor view over the token stream: reads `<a>` tags into `{href, dataRef, displayTokens, span}` and offers two editors, `retarget` and `unlink`. Rules never do attribute-string surgery. |
| `link-target.ts` | The gate (§3.2). |
| `rules/links.ts` | The batch's rules. Split by sub-family if it outgrows readability. |

`links.ts` sits on `html.ts` and adds no second tokenizer. The token
stream carries raw tag values and resolves `dir="rtl"` ancestry;
attribute parsing is this module's job and belongs in exactly one
place, because two parsers would drift and the corpus contains tags
that defeat a naive one — `unterminated-href-swallows-closing-tag`
(2 instances, batch 4) is an `href` whose missing close quote absorbs
the following `</a>`. `links.ts` reads `attributeInterior` from
`html.ts` rather than re-deriving where a damaged attribute ends, and
declines to edit any anchor whose tag `opensScope` reports malformed.

### 3.1 Why a third gate is needed at all

The text gate strips tags before comparing, and says so in its own
header: *"a rule that merely adds an `<a href>` would read as inventing
text. This gate strips tags first"*
([no-new-text.ts:16](../../admin/pipeline/transform/no-new-text.ts)).
The markup gate compares a well-formedness **delta**, so an anchor
whose target changed from a right address to a wrong one is well-formed
before and after and passes clean.

Every rule in this batch writes into `href` and `data-ref`. Until now
that surface has had no gate at all — a rule could point 538 anchors at
a fabricated address and all three verification layers would report
success. This is spec §5's blind-spot problem in its sharpest form, and
batch 2 is where it has to be closed rather than recorded.

### 3.2 The gate contract

**A rule may only write a link target it can point at in this entry's
own input.** `checkLinkTargets(before, after, result)` fails unless
every anchor in `after` satisfies one of:

1. **Unchanged** — byte-identical `href` and `data-ref` to its
   counterpart in `before`.
2. **Copied** — the written target occurs verbatim as an `href` or
   `data-ref` value elsewhere in the SAME entry's input. The geresh
   rows copy the entry's own `Jastrow, <headword> N`; the `ib-` rows
   copy the antecedent anchor's work.
3. **Composed** — the target's work component is copied per (2) and its
   locus component's characters are a sub-multiset of that anchor's own
   display text. The rule declares the composition explicitly, the way
   §5.1's `copied` is declared; an undeclared compose is a violation.
4. **Recombined** (added 2026-08-23, tightened 2026-08-24) — the
   target is a PREFIX of one input target joined to a SUFFIX of
   another, both declared as `recombined: [{head, tail, target}]`,
   both present in the input, each contributing at least one
   character, with no gap between the halves and no character from
   anywhere else. Two further constraints: the part of the tail the
   split DISCARDS must itself be a prefix of the head, and the head
   and tail must be different targets — enforced per PAIR, so on the
   href side, where each declared target maps to every matching
   anchor's `href`, a pair collapsing to one spelling is skipped too.
   An undeclared recombination is a violation, exactly as for case 3.

Case 3 is constrained on both halves: the work is copied whole (never
assembled character by character) and the locus may introduce no
character the display did not already show.

**Why case 4 exists.** Case 3's locus evidence is the anchor's display,
and Jastrow's displays are Roman-numeral abbreviations
(`Deut. VI, 22`) while Sefaria's refs are Arabic (`6:22`). So case 3
cannot license ANY Jastrow→Sefaria locus, in `ib-targum-work-loss` or
in any future row — a general limit of the case, discovered when all
nine of that row's occurrences failed the gate. Case 4 takes its
evidence from a second input target instead: for `ib-targum-work-loss`
the work comes off the antecedent Targum anchor and the locus off the
anaphor's own current (correct-verse, wrong-work) target.

Case 4 is **better evidenced than case 2**, which already permits
copying a sibling anchor's target wholesale and cannot tell a copy from
a swap; here every character is verbatim from a named input target and
both sources are declared. Corroboration: 5 of the 9 refs it licenses
already occur as anchors elsewhere in the corpus. It is nonetheless a
widening, and the honest cost is recorded in `link-target.ts`'s
blind-spot list rather than here. The material items: case 4 can MINT
an address the entry never held; the head/tail pairing is not checked
for relevance, so a rule that picks the wrong antecedent produces a
well-provenanced wrong address; two SAME-WORK targets still license a
third verse in that work (`13:2` + `1:13` → `13:13`), the residue of
the off-by-one verse family and the reason the tightening below is a
narrowing rather than a fix; and because the target set pools `href`
with `data-ref`, an href spelling can be assembled into a `data-ref`.

**The 2026-08-24 tightening.** The first cut let the split point float
freely, and four probes against it all came back clean: truncating the
head's locus, minting a wrong verse inside the head's own work without
moving the work, `head === tail` self-extension, and a mid-word splice
of two unrelated targets. Requiring the discarded tail prefix to be a
prefix of the head rejects the first, second and fourth while still
licensing A00589 and M00567 on both attributes — the two spellings of
one address differ only in a leading `/`. It does NOT reject
`head === tail`, since a string is its own prefix; that needs the
distinctness rule, and both constraints are load-bearing.

Cases 1-3 were not weakened to make room, and case 4 does not subsume
case 3: case 3 reads evidence off the display, which case 4 cannot see,
and case 4 reads it off a second target, which case 3 cannot name.
`sifre-ib-resolves-to-yalkut` still needs case 3.

Two counting invariants, checked on every rule:

- **Anchor count never grows.** Batch 2 creates no links; §1's ruling
  is enforced in code, not left to rule authors.
- **Every anchor present in `before` and absent from `after` is
  declared** by an `unlinks` count on the result. A rule that drops a
  link by accident fails; the markup-delta gate cannot catch it,
  because removing a tag pair reads as an improvement.

### 3.3 Cross-field scope

The gate reads every field that can hold an anchor, on the same
principle §5 states for text: a rule editing a field the gate cannot
see passes vacuously, which is worse than failing. `h-cognate-self-link`
is the reason this is called out rather than assumed — its own
re-measurement found its largest locus in `language_reference`,
"essentially disjoint and ~3.4x larger" than the definition-side probe
the row was written from.

## 4. The twelve rows

Three rule shapes, which is also the build order — each shape reuses
the gate case below it.

| # | Row | Inst. | Shape | Note |
|---|---|---:|---|---|
| 1 | `rabbi-name-linked-as-bible-book` | 41 | unlink | the cleanest of the four |
| 2 | `apparatus-cite-linked-as-scripture` | 8 | unlink | modern bibliography, not scripture |
| 3 | `ellipsis-fragment-anchored` | 80 | unlink | 6 convention members excluded, per the audit |
| 4 | `h-cognate-self-link` | 85 | unlink | withdrawal candidate — §6 |
| 5 | `geresh-letter-numeral-mislink` | 475 | copy | strict arm only; ~152 variant-reading, ~20 "ר׳", ~19 in-article convention all excluded |
| 6 | `prefixed-geresh-abbrev-mislink` | 173 | copy | ⚠ unaudited; overlaps #5 |
| 7 | `plural-to-feminine-final-letter-mislink` | 57 | copy | retarget to the host entry that declares the plural |
| 8 | `ib-yoma-2a` | 312 | compose | ⚠ unaudited; the antecedent anchor supplies the work |
| 9 | `ib-targum-work-loss` | 8 | compose | same machine, Targum arm |
| 10 | `sifre-ib-resolves-to-yalkut` | 5 | compose | declines when the entry holds no Sifré antecedent |
| 11 | `homograph-numeral-mismatch` | 538 | audit first | ⚠ unaudited, and which side is authoritative is unknown — §6 |
| 12 | `shuruk-as-yod-display-corruption` | 12 | text fix | not a target change; needs an `allows` ruling under the OCR class |

Totals: 12 rows, 1,794 instances. Four unlink (214), three copy (705),
three compose (325), two that are neither (550).

**#5 and #6 rewrite the same anchors.** Both are a geresh abbreviation
of the containing entry's headword resolved as a standalone lookup; #6
is the arm carrying a particle prefix. Their overlap is measured before
either is written, and the result is recorded in `entangledWith` — in
the catalogue field the registry gate reads, not in prose. Batch 1's
RTL trio is the precedent: the entanglement was real, recorded only in
an audit report, and `transform:count` could not see it.

**#12 changes display text, not a target.** `יּ` (yod + dagesh) written
where the word and its correctly-resolved target both have `וּ`
(shuruk). It belongs to this batch because it lives inside an anchor
display and is found by the same anchor view, but it is gated as an OCR
correction under the ruling of 2026-08-11, not by §3.2.

## 5. Verification

Four layers. The first three are batch 1's; the fourth is its lesson.

| Layer | What it proves |
|---|---|
| Unit tests per rule | Each fixture is a real entry cited by rid — never a hand-written string that flatters the rule. |
| `bun transform:count` | Each rule ALONE against the pinned snapshot, matched to `patterns.jsonl`. |
| `bun body:migrate-dry` | 32,512/32,512 round-trip gates, 0 schema failures, 0 quarantines. |
| Composed corpus pass | Every registered rule, in registry order, over the full corpus. |

The fourth layer is not optional here. Batch 1 recorded that
`transform:count` "measures rules in isolation and **cannot see this
class of defect**" — rules that rewrite the same records trade one
defect for another, and only a composed pass finds it. Rows #5 and #6
are exactly that shape, and #8–#10 all read the anchor sequence, so an
earlier rule's unlink changes what a later rule sees as the antecedent.

Registry order is therefore load-bearing and is asserted in a test:
unlink rules run before compose rules, so a compose rule never adopts a
work from an anchor a later rule would have removed.

`bun qa` (format, lint, test, tsc) passes before every commit.

## 6. Expected write-backs and withdrawals

Every row leaves the batch with its catalogue entry true. Edits to
`patterns.jsonl` are **surgical** — never through `renderPatterns()`,
which reformats all 149 rows and drops any field it does not
round-trip.

| Write-back | Rows |
|---|---|
| `reason` recorded where there was none | #6, #8, #11 |
| `corpusCount` corrected to what the rule reproduces | any row whose measurement disagrees |
| `entangledWith` pair added | #5 ↔ #6, if the overlap measures real |
| `route` changed to `judgment` with the count recorded | any row that withdraws |

Two rows are expected to move:

- **#4 `h-cognate-self-link` is a withdrawal candidate.** Its audit
  reports 77 self-links in the etymology slot, 75 of them after
  "b. h.", and warns that any rule matching " h." as a substring sweeps
  in ~75 convention cases. If the measurement holds, the row is
  convention rather than defect and goes to `judgment` with the number,
  the way `abbrev-in-alt-headwords` did. It also carries a standing
  merge flag with `homograph-numbering-schism`; merging is a catalogue
  decision, not a transform, and is recorded rather than acted on here.
- **#11 `homograph-numeral-mismatch` may produce no rule.** Its 538
  anchors end in a Roman homograph numeral disagreeing with the numeral
  in their own `data-ref`. Which side is authoritative has never been
  measured. If the `data-ref` is right, the repair is a display-text
  edit — batch 3's family, not this one — and batch 2 lands 11 rows /
  1,256 instances.

Neither outcome is a failure. §5.2's mechanism exists because a route
label is a reading of a row, and the transform is the first thing that
tests it.

## 7. Risks

| Risk | Mitigation |
|---|---|
| A composed target is plausible and wrong | Case 3's two constraints, plus every compose rule declining rather than guessing when the antecedent is absent |
| An unlink removes a correct link | The audits' convention arms are excluded by predicate, and the `unlinks` count is asserted per rule against the audited number |
| The registry (3 landed + up to 12 new) outgrows one PR | Split at row #7 rather than weaken the composed pass |
| The deferred 183 instances get forgotten | They stay `route: transform` in the catalogue and are named in the deferral spec |

## 8. Decision log

| Date | Decision |
|---|---|
| 2026-08-22 | Batch 2 is retarget only; the never-linked family (6 rows / 4,192) is deferred to its own spec, which must settle the Sefaria-index question and the linker-coverage ruling together |
| 2026-08-22 | Wrong link with no correct target → **unlink**, keeping the display text |
| 2026-08-22 | Entry-local scope: `v-sub-redirect-stub-mislink` (161) and `containment-fallback-mislink` (22) deferred rather than extend `Rule.apply` with a corpus index |
| 2026-08-22 | Gate case 3 (compose) kept, constrained to work-copied-whole plus locus ⊆ display |
| 2026-08-23 | Gate gains **case 4, recombination** (prefix of one input target + suffix of another, both declared): case 3's display-remainder test can never license a Sefaria locus, since Jastrow's displays are Roman numerals — measured on all 9 `ib-targum-work-loss` occurrences, decisively on M00567 where the remainder is `6:22` alone. Accepted as better evidenced than case 2; cases 1-3 unchanged |
| 2026-08-24 | Case 4 **tightened**: the tail's discarded prefix must itself be a prefix of the head, and head ≠ tail. Four probes against the first cut passed — locus truncation, wrong verse in the head's own work, self-extension, mid-word splice — and both constraints are needed, the prefix rule alone missing `head === tail`. Task 8's 9 fires still pass; same-work sibling mints remain licensed and are recorded |
