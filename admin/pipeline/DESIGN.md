# The import module

`admin/pipeline/` turns Sefaria's Jastrow export into the dictionary's
entry data. This document is its design: what the module is, what it
guarantees, what each gate proves, and — at length, in the last
section — what it refuses to do.

It is written in the present tense and describes only this module.
The app, the admin tool, routing and rendering are outside it; where a
fact depends on one of them, the fact is stated and the dependency is
named as unbuilt. Rulings and their dates live in
[`docs/decisions.md`](../../docs/decisions.md); the dated design specs
this document replaces are in [`docs/archive/specs/`](../../docs/archive/specs/).

Facts that are **designed but not built** are marked **UNBUILT**
inline. A reader who assumes otherwise will be wrong about several
important things, so they are marked rather than omitted.

---

## 1. What the module is

The module reads a source snapshot and writes entry data in a schema
it does not own, plus reports about what it did.

**Inputs** (read, never written by the module):

| Path | What it holds |
|---|---|
| `data/source/jastrow-dictionary.jsonl` | the Sefaria export, verbatim, 32,512 entries |
| `data/source/lexicons.json` | the lexicon registry record that travels with it |
| `data/page-index/entries.jsonl` | page, column and confidence per rid, built from the print hOCR |
| [`data/schema/entry.schema.json`](../../data/schema/entry.schema.json) | the entry contract, read at run time |
| `data/quarantine/internal-targets.json` | reviewed unresolved citation targets |

**Import definition** (inside the module, read and written):
`admin/pipeline/patch/records/` — tranches, reviewed patches, the
defect-class catalogue, and the snapshot pin. Patch records are import
definition, not data, which is why they live in the module and not
under `data/`.

**Outputs** (written):

| Path | What it is |
|---|---|
| `data/entries/<L>/<rid>.json` | one file per entry, `<L>` the rid's first letter |
| `data/source/migration-report.json` | the machine-readable account of one run |
| [`docs/reports/migration-blessing.md`](../../docs/reports/migration-blessing.md) | the evidence a person reads before accepting a run |
| [`docs/reports/review-report.md`](../../docs/reports/review-report.md) | one row per item a person must judge |

### The boundary, and `paths.ts`

`paths.ts` is the only file in the module that names anything outside
`admin/pipeline/`. Every constant above is declared there once, with
the reason for its placement in its docstring. `boundary.test.ts`
fails if a path literal for `data/`, `docs/` or `app/` appears
anywhere else in non-test module code. A different project runs the
same pipeline over its own data by editing that one file.

Two identifiers in `paths.ts` are load-bearing beyond their values.
`SOURCE_PATH` and `SNAPSHOT_FILES` are matched **by identifier** in
`test-tiers.test.ts`'s corpus signals, which is how the test-tier
split spots a fast-tier test reaching the 41 MB snapshot. Renaming
either disables that detection without failing anything.

`DESIGN_PATH` points at this file. `report/headword-issues.ts`
computes a relative link to it from the report's own directory rather
than pasting one, so moving either document cannot produce a dead
link.

### Commands

- `bun data:fetch` — source acquisition (§3).
- `bun data:import` — the import run. **Dry by default**; `--write`
  writes entry data, `--strict` promotes a stale snapshot pin and a
  drifted patch precondition from report rows to refusals.
- `bun headword:issues` — the headword-issues report.
- `bun qa` — format, lint, unit tests, `tsc`.
- `bun run transform:invariants` — the two corpus-tier invariant
  tests (§4).
- `bun run transform:count` — the per-rule, rule-alone count.

`bun data:compile` and `compile.ts` do not exist. **UNBUILT.**
Everything the archived specs assign to compile — the route map, the
browse index, abbreviation detection, reference-index derivation,
pointer classification, entry shards, search artifacts — is unbuilt,
and none of it is this module's concern.

### Test tiers

`bun test` splits by filename, and `test-tiers.test.ts` asserts the
split in both directions. The unit tier is `*.test.ts` and runs in
`bun qa` and in CI. The invariant tier is
`transform/commutation.corpus.test.ts` and
`transform/registry.order.corpus.test.ts`, run locally before
rule-code changes; `bun qa` cannot see them. Per-PR CI never reads
`data/source/`, and a new corpus-reading test has to be added to
`transform:invariants` by hand.

---

## 2. The entry model

An entry file is `{ schemaVersion: 2, id, sefariaHeadword, headwords[],
senses[] }` required, plus optional `display`, `page`, `grammar`,
`stems[]` and `formerNames[]`. The schema is
`additionalProperties: false` at every level; the module is handed the
contract and does not own it.

### Headwords and `display`

`headwords[]` holds every form print sets on the headword line, in
print order. `headwords[0]` is the primary form: the name, the search
key and every link derive from it. A form object is
`{ text, homograph?, disambiguator?, reconstructed?, gender?, partial? }`.
`text` holds clean Hebrew; grouping and marks do not live in it.

`display` is an optional template whose `{n}` inserts
`headwords[n].text` and whose every other character is literal
notation. It carries print's layout — parentheses, `?`, `…`, comma
separators. It is **optional and never defaulted**: where the source
cannot settle the layout the key is absent and the row is flagged.

One parser reads the whole headword line in a single pass
(`migrate/headwords.ts`, `parseHeadwordLine`). There is no per-item
regex decomposition and no byte-exact regeneration of Sefaria's split
items; the shape no longer corresponds 1:1 to the source's split
strings, so gate 2 was redefined instead (§9).

Six shape rules are checked by `headwordShapeProblems`
(`migrate/headword-rules.ts`, wired into `migrate/validate.ts`):

1. every form index appears in `display` exactly once (`checkSlots`);
2. `display` holds no Hebrew (`checkNoHebrew`);
3. markers agree with forms — `*`, homograph, gender (`checkMarkers`);
4. a form's `text` holds no `,`, `(`, `)`, `?`, `=`, `…` or Latin
   letter (`textDefects`);
5. a `partial` form is never a lookup key, except at index 0 when it
   is the entry's only name (`checkPartial`);
6. every comparison normalizes to NFC first.

Rule 4 is **implemented but reported, not halted on**:
`HALT_ON_TEXT_DEFECT` is `false` in `migrate/headword-rules.ts`,
because two entries still carry a literal `=` in `headwords[].text`
and no patch op expresses the repair. A reader should not assume rule
4 halts.

`gender` on a form and `grammar.gender` on the entry are mutually
exclusive, and neither is inherited. The schema states the rule in
its description; nothing cross-validates it beyond the schema's own
shape.

### Senses, stems, the gloss head

`senses[]` is a tree of `{ label?, gloss, units[], senses[] }`.

`senses[0]`'s gloss **is the gloss head** — not a first sense. The
gloss head is a pure concatenation of `content.morphology` +
`language_code` + `language_reference` + sense-1 text in print order,
with offsets recorded so the pieces can be sliced apart again
(`body/rejoin.ts`). Dropping an empty lead therefore consumes sense 1,
and does so invisibly to both text-level gates.

The body is derived by four splits, each with a deliberate failure
direction:

- **Labels.** `"—2)"` → `"2"` and so on, with byte-exact print
  regeneration or quarantine to `{unknown}` (`body/labels.ts`).
- **Lettered items.** `a) … b) … c)` split into child senses, but only
  a complete ascending run outside parens and anchors splits.
  Everything else stays whole (`body/lettered.ts`).
- **Form sections.** `Pl.`, `Part. pass.`, `Fem.`, `Denom.` split out
  of their host sense into a sibling with restarted child senses,
  after the lettered split (`body/form-sections.ts`).
- **Units.** A boundary opens only before a well-formed external
  citation whose preceding text ends `.` or `—` or is a sense start
  (`body/units.ts`). `gloss + units.join('') === text` always holds.

All four fail by **under-splitting**, never by inventing a boundary.

`stems[]` holds binyan sections: `{ stem, forms[], senses[] }`, all
three required, `stem` free text with `minLength: 1`. The stem walk
reads only `sense.senses` and drops `sense.definition`; the children of
a stem carry no `grammar` and no nested `senses` (corpus-measured max
depth 1) — `body/trace.ts`.

`grammar.gender` and `grammar.number` are seeded from a closed
eight-value vocabulary of `content.morphology` markers; an
unrecognized value is reported as `{unknown}` and never guessed
(`body/grammar.ts`). `grammar.pos` is declared in the schema, has no
producer, and is absent from every entry. **UNBUILT.**

### The markup vocabulary

Stored markup is six tags and nothing else: `b`, `cite`, `he`, `i`,
`sub`, `sup` (`migrate/validate.ts`'s `VOCABULARY`). `markup.ts` keeps
four of the source's six tags and translates the other two —
`span[dir=rtl]` becomes `<he>`, `a` becomes `<cite ref="…">`. Text
bytes are never touched by the translation. A `cite` carries exactly
one attribute, a non-empty `ref`; every other vocabulary tag carries
none.

`ref` holds either a rid (internal) or an external reference taken
from `data-ref` verbatim, falling back to `href` only when `data-ref`
is empty. Sefaria's two ref spellings are not canonicalized. Internal
targets resolve through an NFC-keyed headword → rid map built from all
32,512 composed headwords; an unresolved internal target stays
byte-preserving in the text and must be on the reviewed quarantine
list.

There is no link-kind (`k`) field. The markers stay in the text.

Not stored, deliberately: `refs`, `quotes`, `slug`, any URL, any
page-confidence field, and the current name (§7). A cross-reference
entry is an ordinary entry with one unlabeled sense whose gloss is the
pointer text — there is no dedicated field, and classifying that shape
for presentation is a compile concern. **UNBUILT.**

A `notes` mechanism for intentional deviations from print does not
exist. **UNBUILT.**

---

## 3. Source acquisition

`fetch.ts` is the one channel. It streams Sefaria's public MongoDB
dump (`sefaria-mongo-backup/dump_small.tar.gz`), gunzipping and
parsing tar in memory, extracts only the lexicon-related BSON members,
and never writes the ~2.4 GB dump to disk. The download is cancelled
as soon as all targets are captured. The alternatives — Sefaria-Export,
Sefaria-Data, the Words API — carry no Jastrow lexicon source or
require a ~30k-request crawl of the same database.

**One lexicon, not two.** Sefaria's own code maps a second parent
lexicon, `Jastrow Unabbreviated`, but the deployed database carries no
such record and zero entries under that name. Only
`Jastrow Dictionary` is emitted.

`fetch.ts` **fails fast on schema drift**: a renamed `name` or
`parent_lexicon` field, or a lexicon with zero entries, throws rather
than emitting a silent empty output. A Sefaria schema change is a code
change.

Documents are emitted unmodified. `data/source/` is a faithful
snapshot, which is why it still holds the non-NFC strings Sefaria
serves — the module normalizes only what it writes (§11).

### The snapshot pin

`patch/snapshot.ts` computes a sha256 over `SNAPSHOT_FILES`
(`jastrow-dictionary.jsonl` then `lexicons.json`, fixed order), folded
with their paths so a rename or a reorder changes the value. It is
committed at `patch/records/snapshot.lock`, and **every patch record
pins it**.

The pin's purpose is to catch a patch whose precondition assumed older
source bytes. Its limit is structural: a new export mismatches every
patch at once, so the pin cannot say which patches still hold. A stale
pin is therefore **one header count** on the report
(`report.snapshot.stalePins`) and skips nothing; `--strict` restores
the refusal. The pin is evidence about the corpus, never the thing
that decides a patch.

---

## 4. Transform rules

A rule detects and fixes a general defect class. The registry
(`transform/registry.ts`) holds **53** rules today — the length of the
`RULES` array, which is the set of rules the import composes, one per
catalogued `route: transform` row.

Rules run inside per-entry composition (`compose.ts`), over the healed
entry, after `applyRepairs`. They run in two phases: `text-repairs`
first, then `structural-repairs`, which begins only after the whole
text pass completes.

### The rule contract

- A rule carries a predicate and **no expected count**.
  `records.length > 0` is how it reports that it fired
  (`transform/types.ts`).
- `Rule.apply` **must treat `entry` as immutable** and return a new
  object, or the same reference unchanged. A mutator, or a
  same-reference return that also carries records, throws in `run.ts`,
  which compares `fieldsOf(before)` across the call to catch a
  mutate-then-shallow-spread.
- A rule that throws is contained to its entry: the failure is
  recorded, gate 9 reds, and the walk continues.

`fieldsOf` (`transform/no-new-text.ts`) is the one exhaustive field
enumeration for **reading**, and `transform/fields.ts` is the one
writer over the same set, with `fields.test.ts` asserting their parity
rather than a comment claiming it. A second, drifting walk is exactly
the shape of the failure the parity test closes: a rule writing a
field `fieldsOf` does not read is invisible to the text gate.
`fieldsOf` has two deliberate exclusions — `refs[]` (dropped from
truth, machine identifiers) and `rid` (an identifier, needing an
identity assertion rather than a sub-multiset one).

### Ordering, coverage, commutation

**Coverage is a bijection.** Every catalogued `route: transform` row
must be registered in `RULES`, covered by another rule (`COVERED`),
still owed one (`PENDING`), or retired by ruling (`RETIRED`). A row in
none of the four fails the registry test.

**`entangledWith` is adjacency.** Two rows that contend for the same
records must occupy a gap-free span in the registry, checked by
cluster contiguity rather than pairwise distance (`checkAdjacency`).

**`ORDERED` is direction.** Adjacency does not say which of two rules
runs first; `ORDERED` declares a required sequence where one rule reads
what another writes. Two standing constraints are stated as numbered
rules in `registry.ts`'s header: unlink rules run before compose rules,
and a retarget-after-retarget runs after every rule that repairs an
anchor it might adopt.

**Commutation.** For every unordered rule pair not declared
`entangledWith`, `A ∘ B ≡ B ∘ A`, checked over the **union** (not the
intersection) of each rule's changing-rid set. Two rules contend for
the same bytes exactly when their composition is order-dependent. The
gate is phase-blind by design and counts cross-phase pairs rather than
dropping them.

The two invariant-tier tests are
`transform/commutation.corpus.test.ts` and
`transform/registry.order.corpus.test.ts`. There is no
`body/pipeline-links.corpus.test.ts`; no corpus test asserts a
composed-pipeline link-count delta.

### Rule counts

A rule's count in the run report is **composed**: each rule sees the
text the rules before it left, so it is not `transform:count`'s
rule-alone figure. A rule firing many times on one entry counts as one
entry. A count of zero is information — either Sefaria fixed it or the
rule is dead — and every registered rule gets a row, zeros included.
No count is ever a gate.

---

## 5. Patches

A patch is one entry's judged fix, applied when its precondition
holds. Records live at `patch/records/`, in four parts: `tranches/`
(agent sweeps), `reviewed/` (human-authored), `patterns.jsonl` (the
defect-class catalogue), `snapshot.lock` (the pin).

**Tranches and stages.** `TRANCHES` (`patch/apply.ts`) is the explicit
ingest order, each directory tagged with its corpus stage — `pre-patch`
or `healed`. Directory names do not sort chronologically, so the order
is written out, and a directory the list does not name is an error,
never a silent guess. **Import accepts healed tranches only.**

**One manifest record per rid; the latest wins.** A patch that *no*
record lists throws — that is an ingest bug, never folded into the
supersession count.

**`expected_before` and the precondition.** A patch carries
`expected_before`, `expected_occurrences` and `occurrence_index`; the
target anchor is a sha256 of `expected_before` and must agree
(`patch/schema.ts`). When it does not, `classifyDrift`
(`patch/drift.ts`) judges the failure: `upstream-fixed` **only when
the post-state can be seen**, everything else `upstream-changed`. A
multi-occurrence patch is never called `upstream-fixed`. The asymmetry
is the point — a wrong "fixed" archives a patch still needed, a wrong
"changed" costs one look.

**Carry-over** is the set of pre-patch patches consolidation excluded,
minus those an accepted patch already covers. `applyCarryOver` runs
them in patch-id order after the rid's accepted patches:
`found === 0` → `absorbed`; `found === expected_occurrences` →
`carried`; **any other count is a problem, never a silent drop**.

**Manifests.** One JSONL record per input rid, exactly one disposition:
`clean`, `repaired`, `needs_print_check`, `needs_human_judgment`.
Flag-without-repair is a first-class outcome, not a fallback. Import
runs with `escalations: 'defer'`, so each reviewed `needs_*` becomes a
`review-deferred` row.

**Reviewed patches** load with `author: 'human'`, apply **first**, are
exempt from the no-new-text floor, and are reconciled against their own
manifest separately — because a reviewed patch may add bytes, and one
that no record accounts for must not apply unflagged.

**Apply-time gates** (`postApplyAssertions`): the patched entry
survives a JSON round-trip unchanged, and the apply must have changed
something.

**Phase order** is `PHASE_MANIFEST` in `patch/apply.ts`, asserted at
run time: `text-repairs` → `structural-repairs` → `patch-apply` →
`consumer-output`. A stage out of order aborts the run.

The invariant holding all of it together: every patch is judged only by
its own precondition on the entry it meets, and every patch the run
does not apply leaves both a row and a header count.

### Patch ops

The op grammar is `delete`, `join`, `move`, `replace`, `retag`,
`split`, `reform`, `unref`. Some entries need text relocated into a
gloss and no op expresses that shape.

---

## 6. Repairs and detectors

Three buckets, and nothing else: a **rule** detects and fixes a general
class; a **patch** is one entry's judged fix; a **review detector**
detects only. Anything outside the three is research and is archived.

**`body/repairs.ts`** holds the pre-transform healing pass.
`applyRepairs` runs `cleanBinyanForms` (`binyan-cleanup`), one
corpus-wide pass that drops a trailing empty `binyan_form` slot before
any transform runs. Rid-keyed literal edits are not in this file; a
per-entry judged fix is a reviewed patch.

**Review detectors** (`migrate/detectors/`) are `(entry) => ClassRow[]`
with no repair. `detectors/classes.ts` stamps `bucket: 'review'` in
one place so no detector can file itself as a pipeline fault.
Detectors run on the **finished** entry: a predicate written against
the snapshot would measure zero once the transforms have run. A class
detector emits **one row per entry, never per site**, because the
catalogue's `corpusCount` counts entries.

### What the repairs decline to guess

The pattern is consistent enough to state as a rule: where a repair
can separate a mechanical case from a judgment case, it ships for the
mechanical case only, and the remainder becomes its own `judgment`
catalogue row rather than a partial transform.

- `stem-head-marker-chop` moves a chopped `—N)` marker from sense 1's
  definition into the next sibling's `number` field, declaring
  `removes` for the marker's trailing space. Its predicate matches
  only an **empty** residue; the residue-bearing members are refused
  and become `chopped-marker-with-residue`.
- `asterisk-stem-label` drops a stray trailing `" ."` after a valid
  binyan label. It refuses the non-mechanical members, which become
  `stem-label-not-a-binyan-name` — the schema cannot express a stem
  section with no label and a reconstructed form, so no inference is
  attempted.
- `stranded-stem-head` moves a stranded binyan label into
  `grammar.verbal_stem` plus a child sense holding the rest of the
  text, against a 45-label vocabulary derived from the corpus's own
  `verbal_stem` field. `alreadyHasStem` is a **fail-closed** falsifier:
  the repair is refused when the entry already carries the stem,
  because "no member does this" is a fact about one snapshot, not a
  proof. It leaves `binyan_form` empty deliberately rather than lift an
  anchor-borne Hebrew form, which would strip the anchor and discard a
  link target.
- `empty-stem-section` is withdrawn to `judgment` entire. Duplicating
  the shared gloss onto each member invents text; merging blocks
  invents a joining string the input does not attest at that point;
  expressing shared-gloss structurally needs a schema field that does
  not exist.
- `abbrevFusedHeadword` moves a leading geresh abbreviation out of
  `headwords` into the alternates. It refuses a line whose geresh token
  is not first, and it refuses — via an enumerated `LINKED_HEADWORDS`
  set asserted exactly equal to the corpus-measured targets, loud on
  drift — any headword another entry's anchor still names by its old
  string.
- `genderPairAltDuplicate` deletes a duplicated alternate, keeping
  first-occurrence order, and deliberately does not touch
  `content.morphology`.

Moving a marker into `sense.number`, or a label into
`grammar.verbal_stem`, is text-neutral to the text gates because
`fieldsOf` walks those fields recursively. That is why the moves are
expressible at all.

### The text floor: three layers plus loss

Per rule, per call:

1. **Markup** (`transform/markup.ts`) — a **delta** gate. The output
   must be no less well-formed than the input, never absolutely
   well-formed, measured on two axes: tag balance (opens never popped,
   closes that popped nothing) and tags written inside an attribute
   value.
2. **Text** (`transform/no-new-text.ts`) — the tag-stripped output must
   be a **sub-multiset** of the tag-stripped input, unless the rule
   declares `allows`.
3. **Per-call copies** — `copied` must be shown to occur in that
   entry's own input first, then is credited as a **multiset** (counts
   added, not a set union): one declaration buys exactly one
   duplication.
4. **Loss** (`transform/no-lost-text.ts`) — the exact mirror of layer
   2, run for **every phase**. A rule not named in `LOSS_ALLOWANCES`
   and not declaring per-call `removes` may not lose a single
   codepoint.

`allows` is a **static codepoint set, not a budget**:
`rule.allows.flatMap(s => [...s])` permits every listed codepoint an
unlimited number of times, anywhere in that rule's diff. Every
non-empty `allows` is a maintainer ruling in code, and so is every
`LOSS_ALLOWANCES` row — the table is keyed by rule id rather than
declared on the rules, because it is the list a reviewer reads to know
which rules delete text, and spread over ten files nobody reads it.
`LOSS_ALLOWANCES` names seven rules today; four more declare per-call
`removes` because what they drop is per-entry and a static list would
have had to name most of the Hebrew alphabet. (The module's own
docstring says "nine" and "seventeen"; the literal map holds seven.
Trust the map.)

### The link-target gate

`transform/link-target.ts` has one contract: **a rule may only write a
link target it can point at in this entry's own input.** Every claim is
**fail-closed** — an anchor with no matching claim of a recognized
shape is reported as fabrication, and the case list is exhaustive, not
suggestive.

There are ten cases.

| # | Case | What it licenses |
|---|---|---|
| 1 | Unchanged | the target is in the input's target set |
| 2 | Copied | same membership test |
| 3 | Composed | work copied whole from an input `from` target, locus assembled from the anchor's own display |
| 4 | Recombined | a prefix of one input target joined to a suffix of another; no gap, no outside characters |
| 5 | Glyph-corrected | raw tag bytes, gershayim mapped to ASCII, byte-identical to an input tag |
| 6 | Restored | a run deleted from a damaged opening tag is re-inserted; requires a byte-exact, uniquely-offset, field-and-offset-pinned match in the input |
| 7 | Corroborated | a target minted from `head` + `tail` where `tail`'s digits are witnessed by **one named** sibling anchor's display |
| 8 | Vouched | a headword that exists elsewhere as a spelling twin of the host entry's own headword, abbreviated by a geresh display |
| 9 | Pointed | Hebrew pointing only — holam move, shin/sin dot add — skeleton and consonants byte-identical |
| 10 | Minted | a bare `Ib.`/`ib.` anaphor wrapped in a new anchor whose target is copied whole from one named **preceding** input anchor of the same entry |

Cases 8, 9 and 10 are additive; none loosens 1–7.

**Three of the ten ship behind an allowlist of declaring rule ids**
rather than on clause-only safety: `CORROBORATION_DECLARERS` (case 7),
`VOUCH_DECLARERS` (case 8), `MINT_DECLARERS` (case 10), plus
`POINT_DECLARERS` for case 9. The pattern originated with case 7, whose
residue at the stated clauses is 29 of 68 structurally analogous pairs
— not zero — so it ships on the argument that the case buys
attribution, not safety. It is the gate's only less-than-fully-safe
case by its own documentation, and the allowlist was then applied
proactively to every later minting or evidence-importing case even
where the residue was tighter.

Case 10 is the one case that lifts the "anchors never grow" invariant.
It replaces it with a reconciling count equation plus an anaphor-count
clause that closes the unlink-one/mint-one blind spot **only for
anaphor-for-anaphor pairs**. Building it surfaced a second gate gap —
commutation is adjacency-only — answered with `ORDERED` (§4).

Two rules the archived specs record as deliberately unregistered,
`toseftaPrimaryHalakha` and `unterminatedHref`, **are registered
today**, unblocked by cases 7 and 6 respectively.
`toseftaPrimaryHalakha` registers strictly before `toseftaCloseParen`,
and the direction is the whole point of the pairing.

---

## 7. Names and addressing

**The name is not stored.** There is no `name` field and no `slug`
field; there is no slug index. The name is computed from
`headwords[0]` every time it is needed (`migrate/names.ts`), so it
cannot drift the way a stored slug could.

```
word = headwords[0].text with ( ) ? , removed, whitespace collapsed, trimmed
name = ("*" if reconstructed) + word
     + (" " + Roman numeral if homograph)
     + (superscript digits if disambiguator)
```

It derives from the **primary form only**, never the full headword
line.

**`sefariaHeadword`** is Sefaria's own headword for that rid, byte for
byte. It is written from the **pristine** snapshot entry, never the
composed or transformed one, and import is its only writer. It is the
field URL routes key on.

**Comparison is NFC and nothing else.** `nameKey` normalizes both
sides to NFC for comparison and lookup; nothing stored is rewritten by
this step. A byte-exact match on Hebrew is a bug — combining-mark order
varies in the source.

**Collisions.** The first entry (in rid order during import) to compute
a given NFC-keyed name owns it; every later entry whose name is
already owned is a `name-collision` problem and reds the run. A name
that strips to the empty string is its own problem class, checked
separately because uniqueness alone cannot see it. The escape hatch is
a maintainer-supplied `disambiguator` on the form — the same tool
Sefaria uses.

`nameCollisions` is one function backing **both** the import gate
(`migrate/gates.ts`'s `checkNames`) and the `bun qa` check
(`migrate/validate.ts`'s `checkNames`), so a hand edit and a run cannot
disagree about what a collision is.

`formerNames` is declared in the schema and in `TruthEntry`, is
optional, and **nothing writes it**. The two publication-time gates
that would read it — no current name equals another entry's former
name, every former name appears on exactly one entry — do not exist,
because the published-names ledger they check against does not exist
before publication. **UNBUILT.**

**Addressing stops at the entry.** Every internal target resolves to a
rid, never to a sense; `cite.ts`'s `internalTarget` strips a `.N` sense
suffix and never stores it.

---

## 8. Page placement

`data/page-index/entries.jsonl` carries one row per rid: page number,
column and a confidence value. It was built once from the print hOCR;
the build tool is archived, and entry-level corrections are made by
hand thereafter.

`migrate/page.ts` copies `page: { number, column }` onto the entry by
rid. All 32,512 rids are present; a duplicate rid throws.

**Confidence is read and never written onto the entry.** `high`,
`medium` and `low` become `page-confidence-*` review rows and nothing
else. The schema carries no confidence field and entry data does not
either.

The placement is best-effort. Gate 8 proves every entry *has* a row
with an a/b column; it cannot prove the placement is *correct*, and a
low confidence is a review row, never a gate failure.

Matching an OCR'd running head against a headword requires three
neutralizations (`page-index/hebrew.ts`): **all combining marks are
stripped**, because Jastrow sets running heads sometimes vocalised and
sometimes bare and Tesseract drops or invents niqqud freely;
disambiguators are removed for matching but preserved on the record;
and a second, looser key folds final forms, which Tesseract confuses
often enough to be worth carrying. The page index therefore never
carries an inferred point.

Entry data and the page index must agree **both ways**:
`migrate/validate.ts`'s `checkPages` is the one check a hand edit
meets, and an edit that changes a page must also update the index. The
tool obliged to do that does not exist. **UNBUILT.**

---

## 9. The gates

Nine gates, defined as one list — `GATE_NAMES` in
`migrate/report.ts` — from which `GateName` derives and from which
`createReport` seeds a tally each, so a gate cannot silently go
missing. `isGreen` requires each gate to have been **reached**
(`total > 0`) as well as failure-free, and refuses on `entries === 0`.
A red gate refuses the write.

For each: what it proves, and — the half that matters more — what it
cannot see.

**1. `bodyRoundTrips`** (`body/round-trip.ts`, per entry).
*Proves:* the consumer body re-derives with its four structural
properties intact — rejoin, units, lettered, form-section.
*Cannot see:* anything the body model does not represent. It is a
round-trip of that model, not a comparison against the source bytes.

**2. `headwordLine`** (`migrate/gates.ts`, `checkHeadwordLine`).
Three marks per entry, each comparing the composed **source** line
against the written entry — never against the parser that produced it:
(a) every Hebrew character of the line reaches a form, in order, and no
form invents one; (b) the line's notation **multiset** — `(`, `)`, `*`,
`?`, `…`, superscripts, Roman numerals — is exactly the template's;
(c) `display` is absent exactly for a line the gate independently
judges unsettleable (`lineIsUnsettleable`). A patch-supplied template
adds two more marks.
*Cannot see:* byte regeneration of Sefaria's split items — deliberately
gone, because it cannot round-trip through a shape whose items no
longer correspond 1:1 to the source's strings; **commas, excluded on
both sides**, because the upstream split cut print's separators and did
not keep them; an unsettleable line's notation; and which form a mark
belongs to beyond the multiset. Mark (b) is therefore the only thing
standing between a placement correction and invented notation.

**3. `textConservation`** (`migrate/gates.ts`).
*Proves:* tag-stripped text agrees field by field between the composed
body and the finished entry, with `pairs()` walking to the **longer**
of the two sides at every depth and emitting an array-length pair at
every depth, plus a `stems` length mark.
*Cannot see:* markup — `textOf` strips tags by design, so a
translation that only rewrites tags conserves text. And it compares
composed-against-finished, never a rule against its own input, which
is why `transform/no-lost-text.ts` exists.

**4. `schema`** (Ajv 2020, `strict: true`, `allErrors: true`, compiled
at run time from `data/schema/entry.schema.json`).
*Proves:* every finished entry satisfies the contract.
*Cannot see:* anything the schema does not constrain. The module does
not own the contract, it is handed one.

**5. `chain`** (`migrate/gates.ts`, `checkChain`).
*Proves:* exactly one entry has no `prev_hw`; following `next_hw` from
it visits every rid in rid order; a `next_hw` naming no headword or a
rid outside the corpus fails; the walk terminates, rejecting both a
cycle and a dangling trailing link. Walked on **source** spellings,
because the chain is a source artefact.
*Cannot see:* anything about composed or transformed text.

**6. `internalTargets`** (`migrate.ts`'s `gateQuarantine`).
*Proves:* every unresolved internal cite target is on the quarantine
list, every listed pair is still unresolved, and every listed pair has
been reviewed.
*Cannot see:* **anything at all when the quarantine is empty.** It
legitimately reads 0/0, and it is the one gate `isGreen` exempts from
the reached test. It reads 0/0 today.

**7. `names`** (`migrate/gates.ts`, `checkNames`, two marks per entry
over the **finished** entries).
*Proves:* the current name is unique in NFC and non-empty; and
`sefariaHeadword` equals the snapshot's headword for that rid, compared
against a **fresh** streaming read of the snapshot rather than the map
that wrote it, so nothing downstream can have rewritten the field
unnoticed.
*Cannot see:* whether a **committed** entry's `sefariaHeadword` still
equals Sefaria's. Outside an import run nothing can ask, because
per-PR CI never reads `data/source/`.

**8. `pages`** (`migrate/gates.ts`).
*Proves:* every entry has a page-index row with an a/b column.
*Cannot see:* whether the placement is correct. Confidence is a review
row, never a gate failure.

**9. `composition`** — the fault gate, marked from five sites: patch
apply problems, a composer throw, unbased orphan-ref obligations,
finish problems, and a patch whose rid never streamed past.
*Proves:* every pipeline fault also reds gate 9, so any fault refuses
the write.
*Cannot see:* anything the composer handled without throwing or
recording a problem.

### What no gate sees

Collected, because this is the list a future reader needs and will not
assemble from the nine entries above:

- **Text relocated across fields.** Two senses swapping definitions, or
  headword text moved into a definition, is invisible to all three
  transform-tier layers together — not just to the markup layer.
  `textConservation` is blind to it for the same reason: the text is
  still there.
- **Crossed nesting, tag-name mismatch, and attribute-value corruption
  inside an otherwise well-formed tag** all pass the markup gate's two
  axes untouched.
- **Marks reattaching to a different base.** The text gate counts
  codepoints, not graphemes.
- **An unrecorded entanglement.** `checkAdjacency` proves that no
  *recorded* entanglement is split, which is not the same as proving
  no entanglement is split.
- **Order-dependence a third rule exposes.** If `c` produces the state
  on which `a` and `b` disagree, the commutation gate is blind to it.
  So is a pair that claims overlapping bytes but commutes anyway
  because each is idempotent on the other's output. So is a `PENDING`
  row, which has no rule to test.
- **Corpus-wide existence of a link target.** `link-target.ts` is
  entry-local by construction; case 8's first clause and the whole of
  case 9 deliberately do not assert it.
- **A rule that unlinks one anchor and mints another** nets to zero on
  the anchor-count invariant. Closing that needs anchor *identity*
  reconciliation, which no case does.
- **A sense dropped at index 0.** `senses[0]` is the gloss head, so
  dropping an empty lead consumes sense 1 invisibly to both text-level
  gates.
- **A data regression in CI.** Per-PR CI never reads `data/source/` and
  never runs import, so it cannot see one. That is a deliberate,
  stated cost.

---

## 10. Review rows

Every row the run emits is `{ bucket, detail, kind, publication?, rid,
severity }`. `severity` has a third value, **`info`** — a row that
flags nothing to act on, but is still a row so the count is never
silent.

`publication` takes three values — `blocks`, `defer`, `note` — fixed
per row **kind**, never per row. `KIND_RULES` and `CLASS_KINDS` in
`migrate/publication.ts` are one line per kind, each carrying the
publication value **and** the one imperative sentence the report prints
at the head of that kind's section.

**The bar for `blocks`:** *the reader sees a defect that cannot be
corrected in the admin tool after go-live.* It is stated in
`publication.ts` and printed in the report header.

- `blocks` — `headword-unparsed`, `upstream-changed`, `upstream-fixed`.
- `defer` — `headword-duplicate-form`, `paren-group-close-unknown`,
  `markup-carry`, `page-confidence-low`, `page-confidence-medium`,
  `review-deferred`, `patch-consolidated-away`, plus the five detected
  classes.
- `note` — `headword-partial-only`.

A kind the table does not name **throws** (`ruleOf`), so a new kind
cannot ship unclassified; `assertClassified` throws if any non-pipeline
row reached the report unstamped. **Pipeline faults carry no
`publication`** — they already refuse the write via gate 9.

"Catalogued, not yet detected" is rendered from `patterns.jsonl` and
counted apart from the row totals, because those classes have no rid. A
class leaves the list the moment its detector is registered.

**The publication gate is a process rule.** Nothing in code refuses a
publish while `blocks` rows exist.

### The report

One run's complete account of itself (`migrate/report.ts`). It is the
pipeline's only witness: a class not represented on the report object
is one no reviewer can be shown. Two runs are diffable row by row.

Three documents are written **every run, dry included**: the machine
report, the blessing doc, and the review doc. The blessing doc renders
the report and nothing in it is hand-written; every list renders
`_empty_` rather than vanishing, so a missing section is a bug.

### What a hand edit meets

Entry-data validation (`migrate/validate.ts`, run over the committed
tree by `migrate/truth.test.ts`) is the only check a hand edit meets:
schema; file at `<letter>/<id>.json`; current-name uniqueness in NFC;
`sefariaHeadword` uniqueness; the six headword shape rules; the closed
tag vocabulary and balanced markup per field; no markup in plain
identifier fields; every rid-shaped cite ref names an existing entry;
and page agreeing with the page-index row both ways.

---

## 11. What the pipeline will not do

The prohibitions are the design. Most of them describe an absence and
so cannot be inferred from reading the code that is there.

### The text floor

1. **A rule may not invent text.** Tag-stripped output must be a
   sub-multiset of the input's, unless the rule declares `allows` —
   and every non-empty `allows` is a maintainer ruling in code
   (`transform/no-new-text.ts:1-23`). It states its own blind spot:
   codepoints, not graphemes, so mark reattachment passes.
2. **A rule may not reach outside the entry for text.** `copied` is
   checked against *that entry's own* input, never the corpus
   (`transform/no-new-text.ts:190-210`).
3. **A rule may not silently drop text**, in any phase
   (`transform/no-lost-text.ts:64`, enforced at
   `transform/run.ts:122-127`).
4. **A rule may not mutate its input**
   (`transform/types.ts:492-519`; `transform/run.ts:97-117`).
5. **An agent patch may not add bytes.** The applied entry's content
   codepoints must be a sub-multiset of the original's, plus the op's
   closed-grammar marker allowance and nothing else. **`move` and
   `delete` get no allowance at all.** A rejection re-dispositions the
   entry `needs_print_check` (`patch/no-new-text.ts:89`, allowance at
   `:62`).
6. **Correction may not widen into composition.** The marker allowance
   is deliberately held to the closed grammar `N)` / `—N)` for exactly
   this reason (`patch/no-new-text.ts:22-26`;
   `transform/no-new-text.ts:20-23`).
7. **A human patch is exempt from the text floor; an agent patch is
   not.** `patch/apply.ts:683` returns early only on
   `author === 'human'`.
8. **A rule may not degrade markup well-formedness.** Pre-existing
   damage passes through untouched; an *increase* on either axis fails
   (`transform/markup.ts:16-38`).

### The link floor

9. **A rule may not fabricate a link address.** It may rearrange one
   the input holds; it may not mint one
   (`transform/link-target.ts:6-30`, `:365`).
10. **A rule may not invent a link target via `allows`.** `allows` is
    text-codepoint scoped; nothing in `Rule` licenses inventing an
    attribute value. The only paths to a changed `href`/`data-ref` are
    the gate's cases, each independently checked.
11. **Every claim is fail-closed.** An anchor with no matching claim of
    a recognized shape is reported as fabrication; the case list is
    exhaustive, not suggestive (`transform/link-target.ts`,
    `checkValue`).
12. **Case 6 refuses on ambiguity, not just absence.** More than one
    insertion offset satisfying the byte-match test is a refusal, not a
    choice between them (`restoreFault`).
13. **Case 7 refuses any `corroborated` claim from a rule not on
    `CORROBORATION_DECLARERS`**, however perfect the claim — checked
    before any evidentiary clause. The gate also declines to adopt the
    rule's own semantic discriminator into itself, on the stated
    principle that *a gate whose predicate is the rule's can no longer
    catch a rule that widened its own.*
14. **Case 8 was deliberately not widened** to admit
    `containment-fallback-mislink`, whose weaker skeleton-equality
    shape reaches only 1 of 18 repairs uniquely. It was measured and
    withdrawn rather than folded in.
15. **Case 8's first clause and the whole of case 9 do not assert
    corpus-wide existence** of the target. `link-target.ts` is
    entry-local by construction.
16. **Case 9 refuses** any point change that alters the skeleton, any
    point *removal* (`adds` only ever grows the multiset), any dot but
    shin/sin (`U+05C1`/`U+05C2`), and a second or different
    normalization without its own measurement.
17. **Case 9's rule refuses one entry's `headword` field
    specifically** (repairing its other fields normally), because the
    repair would create a second entry with the same headword as its
    twin. The namespace collision is load-bearing.
18. **Case 10 refuses to mint an address.** Every character of the
    target must be copied whole from one named input anchor — no
    composition, no prefix, no truncation.
19. **Case 10 excludes `Ibid.`/`ibid.`** from the closed anaphor set
    (`MINTABLE_ANAPHOR = /^(?:Ib|ib)\.$/u`) as unsized.
20. **Case 10 does not require the copied-from anchor to be the
    nearest preceding one** — only a preceding one. Adopting the rule's
    own semantic clauses into the gate would let the gate rubber-stamp
    a later widening of them.

### What a rule may not assume

21. **A rule may not depend on another rule having run**, except
    through the two explicit, checked mechanisms: `entangledWith`
    (population collision — same records, must be adjacent) and
    `ORDERED` (sequence dependency — one rule reads what another
    writes). An undeclared dependency of either kind is what the
    commutation gate exists to surface.
22. **A rule infers nothing; it only moves.** Relocation, re-tagging
    and wrapper moves are transforms. Reconstructing elided text by
    inferring vocalization from a neighbouring field is research. This
    is not a coded gate — it is the classification test applied before
    a catalogue row is routed `transform` at all.
23. **No rule sources a vowel correction from a different token
    elsewhere in the corpus.** A glyph is corrected in place, never
    replaced by a "dominant" spelling found somewhere else
    (`transform/rules/gershayim.ts:45`,
    `transform/rules/geresh-apostrophe.ts:77`).
24. **No count is ever a gate.** A rule count of 0 is information, not
    a failure (`migrate/report.ts:200-204`), and there is no second
    copy of the counts: per-rule count pins and an expected-counts file
    were withdrawn and never built.

### What the parsers refuse to guess

25. **No value is guessed that the corpus has not shown.**
    Grammar-marker parsing reports `{unknown}` for an unrecognized
    `content.morphology` value rather than mapping it by inference
    (`body/grammar.ts:65-78`); sense-label parsing quarantines to
    `{unknown}` rather than guess outside its measured shape
    (`body/labels.ts:7,51`).
26. **Unit segmentation never over-splits.** The terminator rule is
    deliberately conservative; its only failure mode is reading two
    units as one, never a false boundary (`body/units.ts:1-9`).
27. **No separators are invented on rejoin** (`body/rejoin.ts:5`;
    `:53` refuses an invented placeholder).
28. **The headword parser never moves or reassigns notation it cannot
    place.** A line whose grammar does not read is kept whole per item
    and flagged `headword-unparsed`, never partially parsed — *a line
    that is wrong in one place gives no ground to trust the rest of
    it* (`migrate/headwords.ts:592-617`).
29. **No `display` template is ever invented.** A line the source
    cannot settle is written with `display` unset and the row flagged.
    A flagged row is a ticket, not a guess
    (`migrate/headword-rules.ts:263-268`; `migrate/publication.ts:80`).
    A reviewed patch may correct a **placement** but not the notation
    (`migrate/gates.ts:244-260`).
30. **Parenthesis placement is never corrected by the parser.** Only
    what the source shows is recorded
    (`migrate/headwords.ts:28-34`).
31. **Roman numerals are never moved** off the form they are attached
    to in the source (`migrate/headwords.ts:396-460`).
32. **`partial` forms are never expanded or joined.** Joining an
    ellipsis ending would require assuming the letters before the seam
    keep the base form's vowels, which prohibition 23 forbids
    (`migrate/headwords.ts:462-484`).
33. **A `partial` form is never a lookup key**, except at index 0 when
    it is the entry's only name
    (`migrate/headword-rules.ts:213-236`).
34. **`display` may hold no Hebrew**, and a form's `text` may hold no
    comma, parenthesis, `?`, `=`, `…` or Latin letter — both checked by
    `headwordShapeProblems`, though the second currently reports rather
    than halts (§2).
35. **No vowel is inferred from OCR.** All marks are stripped before an
    OCR'd running head is matched against a headword, because Tesseract
    drops and invents niqqud freely; the page index never carries an
    inferred point (`page-index/hebrew.ts:9`).

### What individual repairs refuse

36. **`stem-head-marker-chop` will not touch a residue-bearing
    member** rather than guess whether the residue is duplicated-token
    noise or real stranded text.
37. **`asterisk-stem-label` will not claim the whole catalogue row.**
    The schema cannot express a labelless reconstructed stem, so no
    inference is attempted.
38. **`empty-stem-section` attempts no repair that would invent text
    or invent model structure**, and is withdrawn to `judgment` rather
    than shipped as a partial transform.
39. **`strandedStemHead` will not mint a stem section the entry
    already has** — `alreadyHasStem` is fail-closed, not a population
    argument — and will not lift an anchor-borne Hebrew form into
    `binyan_form`, because lifting would strip the anchor and discard a
    link target.
40. **`abbrevFusedHeadword` will not rewrite a headword another
    entry's anchor still points at by its old string**
    (`transform/rules/headword.ts:42-49,99-107`).
41. **`genderPairAltDuplicate` will not write a corrected gender into
    `content.morphology`** without a maintainer `allows` ruling in
    code, because `allows` flattens to codepoints and would permit
    those characters anywhere in the rule's diff
    (`transform/rules/headword.ts:173-183`).

### What the run refuses to do

42. **No patch is skipped silently.** Five sites enforce it: stale
    pins, drift rows, consolidation drops, a patch whose rid never
    appeared (fault row **and** red gate 9), and a carry-over resolving
    an unexpected non-zero count.
43. **No review row reaches the report unclassified**
    (`migrate/publication.ts:147` throws on an unknown kind;
    `migrate/review-report.ts:126` throws on an unstamped row).
44. **No detector may repair, and none may file itself as a fault.**
45. **The write does not begin until every gate has passed, and it is
    not interactive.** The biome binary is resolved before anything is
    composed, so a missing biome refuses at the start rather than after
    32,512 unformatted files.
46. **No full-corpus write over a populated tree.** `--write` refuses
    outright on any existing file under `data/entries/`. The guard is
    deliberate scaffolding, not an oversight: it stands in for the
    unbuilt update run, so a second write cannot overwrite hand edits
    blindly. **The atomic write that would replace it is UNBUILT** —
    `writeAll` writes 32,512 files one at a time — and so is the update
    run itself, with its three-way merge, its base recovery and its
    conflict rows.
47. **No blind overwrite of hand-edited entry data.** Today that is
    enforced by refusal, not by merge (see 46).
48. **CI never reads the source data and never runs import**, and CI
    never rewrites or commits. The module's single write of anything
    outside `data/entries/` content is `formatTruth`, and the tier
    boundary is asserted by filename in both directions.
49. **A failing entry is dropped, not emitted from source bytes.**
    `composeOne` catches, reds gate 9, files a `composition-failed`
    fault row, and the entry never reaches pass 2 — so the run refuses
    to write at all. Resilient always-emitted output is **UNBUILT**,
    and the current behaviour is its opposite.

### What is never stored, and where text is rewritten

50. **Stored text is rewritten in exactly one place, and only into its
    own NFC spelling.** `normalizeForWrite` runs after every gate has
    read the in-memory truth and before the first file is written,
    under an `NFD(before) == NFD(after)` assertion, so a normalization
    that would not be lossless refuses the write. `data/source/` is
    never touched.
51. **No canonicalization of stored text at lookup time.** NFC is a
    *comparison* key in `names.ts` and `cite.ts`; nothing stored is
    rewritten by those steps.
52. **The current name is never stored.**
53. **No URLs are stored** in entry data.
54. **No page-confidence field is written onto an entry.**
55. **No link-kind (`k`) typing at import.** The markers stay in the
    text.
56. **No deeper-than-entry addressing.** Every internal target
    resolves to an entry; a `.N` sense suffix is stripped and never
    stored.
57. **`refs` and `quotes` are not stored fields.** The schema has
    neither, and `additionalProperties: false`.

### Process rules with no code enforcement

These four are real constraints and nothing in the module checks them.

58. **No sense is renumbered while nothing addresses a sense.** The
    measurement behind it: 0 of 71,376 internal refs carry a sense
    pointer. The dangerous half is prohibition-adjacent rather than
    prohibited — `senses[0]` is the gloss head, so dropping an empty
    lead consumes sense 1 invisibly to the text gates.
59. **The publication gate is a process rule.** Nothing refuses a
    publish while `blocks` rows exist.
60. **Import is the only writer of `sefariaHeadword`.** The admin tool
    and hand edits never touch it. Enforcing that against the admin
    tool is outside this module; the field contract is not.
61. **The admin tool does not create patches.** An admin edit is a file
    edit, never a patch record. The admin tool does not exist yet;
    when it does, this is the contract it inherits.
