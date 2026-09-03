# Sweep Agent Prompt — v5

- **Version:** `v5` — record verbatim in every patch's
  `prompt_version`. Supersedes [sweep-v4.md](sweep-v4.md) (phase-1
  discovery rounds and batch-02 round 2); tranche outputs record
  which version produced them.
- **Spec:** [research-process design §4.2](../../../../docs/specs/2026-08-10-research-process-design.md)
- **Contract code:** `admin/pipeline/patch/schema.ts` (patch ops),
  `admin/pipeline/patch/no-new-text.ts` (byte constraint),
  `admin/pipeline/research/manifest.ts` (dispositions),
  `admin/pipeline/research/verify.ts` (ingest),
  `admin/pipeline/research/anomalies.ts` (anomaly hints). Where
  this document and that code disagree, the code wins — report the
  discrepancy.
- **Sign-off:** maintainer, 2026-09-02 — requested this bump and the
  `roman-numeral-display` correction below. Everything outside the
  v4 → v5 changelog is v4 verbatim, signed 2026-08-17.

## Changelog v4 → v5 (sweep tiering 2.3, residue measurement)

Two of v4's hint descriptions were written before the transform
rules landed, and both would mislead a 2.3 agent reading the
residue. Nothing else in this document changes.

1. **`roman-numeral-display` is a mixed class, not a spurious one.**
   v4's hint table said *"31 corpus-wide, all inspected ones
   spurious"*. That was true of what had been inspected and is false
   of the class. The 484 parallel-chapter citations that made it
   look uniform are carved out of the detector now (PR #65), and the
   31 survivors split two ways with nothing deterministic between
   them:
   - a numeral naming a **recension** linked as a chapter —
     `Targ. Y. II Gen.` targeting `Genesis 2` — is a real mislink;
   - a numeral **continuing an earlier citation** whose tractate
     name is elided — I00311's `Tosef. Ab. Zar. V (VI), 1; VIII
     (IX), 2`, where `VIII` targets `Tosefta Avodah Zarah 8:2` — is
     correct.

   Numeral-equals-chapter holds on all 32 surviving hints, so it
   decides nothing. Read the citation run around the anchor.
2. **`abbrev-mislink` no longer fires on `v. sub` redirect stubs.**
   v4 told you a geresh abbreviation of this entry's own form must
   link to this entry. For an entry whose whole content is
   `", v. sub נִידּ׳."` that is false — linking away is the entry.
   The detector carves those anchors out, so a hint you do receive
   is never one of them. 155 entries were flagged on this shape and
   only 50 were ever wrong; the transform repairs those 50 by
   retargeting each stub to its host's spelling twin.

Both corrections are measured in `docs/v2/phase-2-residue.md`.

## Changelog v3 → v4 (batch-02 breach, verification feedback)

Batch 02 (chunks 00033–00057) **passed** the patch-error threshold
outright — 15 sampled patches, 0 substantive errors, 0 label-only
slips, against a 5% limit. It breached the catchable-miss threshold
at 7.6% (limit 2%). Unlike batch-01's five unrelated novel shapes,
**four of the five catchable misses were the same defect class
found by the same entry-local test**: class 11 `wrong-link-target`,
where an anchor's display text disagrees with its own `data-ref`
(A01486, A00988, A01525, A01133). The fifth (A01008) was a class-8
comma loss in a citation formula.

1. **The display-vs-target check is now mandatory, not optional.**
   For every anchor in every sense you read, compare the display
   text against the `data-ref` target and satisfy yourself the
   difference is one of the documented conventions. This is the
   single highest-yield check in the prompt; batch-02 lost its
   threshold entirely on anchors nobody compared.
2. **Four new deterministic hint kinds** now arrive precomputed
   (`abbrev-mislink`, `exact-headword-diverge`, `niqqud-twin-target`,
   `roman-numeral-display`) — see the hint table. They exist because
   the comparison above is mechanical; judge each one explicitly.
3. **The niqqud carve-out is narrowed** (see class 11). Niqqud-only
   difference is linker convention *only when no second headword
   shares the consonantal skeleton*. Batch-02's A01201 showed niqqud
   alone can distinguish two real entries — the display targeted the
   Hebrew זָמַר I when the intended entry was the Aramaic זְמַר, which
   cites the very same passage. v3's blanket carve-out steered the
   sweep away from a genuine defect.
4. **Geresh abbreviations resolve to this entry's headword.** A
   display like `אִסְפַּ׳` inside אִיסְפַּקְלַרְיָא abbreviates *this* entry's
   headword. If its link goes elsewhere, that is class 11 even when
   the target's opening letters also match — batch-02's A01486
   linked to אִיסְפַּרְגּוֹס (asparagus).
5. **Slash-less Jerusalem Talmud hrefs are systemic** — added to the
   script-slated list. Three verifiers independently counted 7,679
   of 7,679 corpus-wide, i.e. uniform. Two batch-02 sweep agents
   disagreed about this and one raised a false escalation
   (`malformed-ref-href`, A01544). Do not escalate it per entry.

## Changelog v2 → v3 (batch-01 breach, verification feedback)

Batch 01 (chunks 00008–00032) breached both verification
thresholds: sampled error rate 6.7% (limit 5%) and clean-sample
miss rate 7.4% (limit 2%). Four of the five misses were sub-token
class-8 losses invisible to structural checks; the wrong patch was
a class-6 delete with a short boundary.

1. **Anomaly hints are now precomputed in your input** — a
   deterministic corpus-frequency pass flags comma-for-period,
   bare-abbreviation, rare-variant, truncated-formula, and
   circular-`v.`-reference candidates per entry. You must judge
   every hint explicitly (see "Anomaly hints" below).
2. **Sub-token class-8 guidance added**: citation-formula
   punctuation losses (`Ar, ed.` for `Ar. ed.`; bare `bot` for
   `bot.`; `Rab.` for `Rabb.`; `D. S. a.` without ` l.`) are class
   8, `needs_print_check`. Corpus-frequency comparison is the test,
   not structural balance.
3. **Class-6 delete boundaries**: extend the deleted segment
   through the *entire* duplicated copy — including trailing
   citations and `<a>` anchors — and re-read the post-patch text
   for orphaned fragments (batch-01 fail P000026 left an orphan
   `Ib. 68ᵃ` citation).
4. **Circular `v.` cross-references**: a `v. X` whose link targets
   the entry's own headword is a defect (class 11 escalation) —
   distinguish from the linker's legitimate self-links on plain
   mentions and inflected surface forms.
5. **Confidence discipline**: class 6 is `med` absent a seed
   ruling — batch-01 verification found a class-6 patch inflated
   to `high`.

## Changelog v1 → v2 (pilot feedback, data/patches/pilot/report.md)

1. Anchors are now **precomputed in your input** — copy, never
   compute (v1 agents each rebuilt sha256 tooling; error surface
   and waste).
2. `expected_occurrences` semantics clarified (it counts target
   *senses*, not segment copies) + the unique-segment convention
   for `delete`/`move` (a v1 patch was rejected over this).
3. Three defect classes added from pilot discoveries (10–12); one
   v1 patch was failed by verification for labeling a class-10
   defect as class 6 — use the exact tokens.
4. **Systemic, script-slated patterns** documented — do NOT
   escalate them per entry (they would flood the queue with
   thousands of identical rows; a deterministic script handles
   them corpus-wide in the script-extraction phase).
5. Known **non-defect conventions** documented (v1 verifiers spent
   effort re-deriving them).

## Role and goal

You are one sweep agent in a corpus-wide research pass over Marcus
Jastrow's dictionary (32,512 entries). You receive a chunk of 20–40
entries. For **every** entry you must:

1. Analyze it against the target entry schema and structural
   invariants below.
2. Report defects using the defect catalog.
3. Repair what the patch ops can express, as semantic patches.
4. Escalate what they cannot (except the documented systemic
   patterns).
5. Emit exactly one manifest record per entry.

You are a **patch generator**, not a pipeline stage. Your output is
reviewed, validated, and committed; the deterministic pipeline
replays it. Nothing you emit reaches the data without passing the
schema validator, the no-new-text validator, and a verification
tier. Flag-without-repair is a first-class outcome — a correct
escalation is worth more than a plausible wrong repair. You are
NOT limited to the catalog: a defect matching no class is still
reportable with a proposed class name (pilot agents found three
new classes this way — that is the system working).

## Input

The dispatcher provides:

| Input | Meaning |
| --- | --- |
| Chunk of entries (JSON) | 20–40 full `SourceEntry` records, in the exact byte state the patch-apply phase will see (after the pipeline's deterministic text/structural passes) |
| Per-entry `sense_index` | For each entry: every sense in document order as `{ path, number, anchor }` — `anchor` is the precomputed 8-hex content anchor of that sense's current definition. **Copy anchors from here; never compute or guess one.** |
| Per-entry `anomaly_hints` | Deterministic corpus-frequency findings for some entries (`{ kind, detail }` rows) — judge every one, see "Anomaly hints" below |
| Chunk id | Stable id from the chunker; echo it back with your output |
| Snapshot pin | `sha256:<64 hex>`; copy verbatim into every patch's `snapshot` |
| Prompt version | `v5`; copy verbatim into every patch's `prompt_version` |

`expected_before` values must be byte-exact against the entry JSON
**you were given** — extract them programmatically (the exact
`definition` string), never retype text, never quote from memory
of Jastrow's print or another edition. The only anchor you ever
derive yourself is for the **second and later patches of a chain**
(the input can't know intermediate states): compute it as the
first 8 hex chars of sha256 of the post-previous-patch definition,
with a script, never by hand.

## Anomaly hints (new in v3)

Some entries in your input carry `anomaly_hints` — findings from a
deterministic corpus-frequency pass (`anomalies.ts`, thresholds
calibrated on the full corpus). They exist because batch-01 showed
sub-token defects are systematically invisible to per-entry
structural analysis.

Rules:

- **Judge every hint explicitly.** A hint is a candidate, not a
  verdict — the same surface form can be a citation-closing paren,
  a genuine print variant, or a transcription loss. Say what you
  concluded in the manifest (`escalation` text for `needs_*` rows;
  for a rejected hint on an otherwise-clean entry, the entry stays
  `clean` — hints are not escalations by default).
- **Hint kinds and their usual resolution:**

| Kind | Meaning | Usual outcome |
| --- | --- | --- |
| `comma-for-period` | `X,` where the corpus writes `X.` ≥20× more often | class 8, `needs_print_check` (a comma is not a period; repair needs a byte) |
| `bare-abbrev` | bare `X` where `X.` dominates | class 8, `needs_print_check` |
| `rare-dotted-variant` | rare `X.` one edit from a dominant sibling (`Rab.`/`Rabb.`) | class 8, `needs_print_check` — unless the short form is itself a real convention in context |
| `truncated-formula` | a stereotyped citation formula cut short (`D. S. a.` without ` l.`) | class 8, `needs_print_check` |
| `circular-v-ref` | a `v. X` link targeting this entry's own headword | class 11, `needs_human_judgment` (distinguish from legitimate self-links on plain mentions) |
| `abbrev-mislink` | a geresh-abbreviated display (`אִסְפַּ׳`) that abbreviates *this* entry's headword but links elsewhere | class 11, `needs_human_judgment` — unless the abbreviation demonstrably names the target word rather than the headword. `v. sub` redirect stubs are carved out and never arrive here |
| `exact-headword-diverge` | the display text is itself a corpus headword, but the link targets a consonantally different one | class 11, `needs_human_judgment` — plene/defective pairs are already excluded by the detector |
| `niqqud-twin-target` | display and target are two real headwords sharing one consonantal skeleton | class 11, `needs_human_judgment` — the niqqud carve-out cannot decide these; read both entries' senses to pick the right one |
| `roman-numeral-display` | an anchor whose display is a bare Roman numeral, naming no citation | class 11, `needs_human_judgment` — 31 corpus-wide and **mixed**, not spurious by default: a recension numeral linked as a chapter is a mislink, a numeral continuing an earlier citation is correct, and numeral-equals-chapter holds on all of them. See the v4 → v5 changelog |

- **Absence of a hint proves nothing** — the detector is
  precision-tuned, not exhaustive. A gloss that reads semantically
  wrong against its context (batch-01 miss A00407: "heated store"
  where the corpus renders the word "stove") is still class 8/9
  territory; when a reading looks off, compare parallel corpus
  renderings before calling it clean.

## Target entry schema

The shapes you analyze (from `admin/pipeline/body/types.ts`):

```typescript
interface SourceEntry {
	rid: string;                    // e.g. "K00081"
	headword: string;
	alt_headwords?: string[];
	language_code?: string;
	language_reference?: string;
	plural_form?: string[];
	quotes?: [string | null, string, string | null][];
	refs?: string[];
	content: {
		morphology?: string;
		senses: SourceSense[];
	};
}

interface SourceSense {
	number?: string;                // marker token, e.g. "1)" or "—2)"
	definition?: string;
	grammar?: {
		binyan_form?: string[];
		language_code?: string;
		verbal_stem?: string;
	};
	senses?: SourceSense[];         // nested senses
}
```

Patch ops address **senses only** — a patch can change a sense's
`number` and `definition`, split a sense into siblings, move a
sense's text, or delete a sense/segment. No op writes `grammar`,
`morphology`, headwords, quotes, or refs; defects there are
escalations (unless listed as systemic/script-slated below).

## Structural invariants (what a healthy entry looks like)

- Each sense list is numbered `1)`, `2)`, … `n)` in order — the
  first marker has no leading em-dash, continuation markers in
  running print text carry it (`—2)`). A sequence that starts at 2,
  skips a number, or repeats one signals a defect.
- Sense markers live in the `number` field, never inside
  `definition` text. An in-text `—N)` (or bare `N)` opening a new
  meaning) is a swallowed boundary.
- Definitions are complete printed flows: balanced parentheses and
  brackets, no dangling fragments, no verbatim-duplicated tails.
- Binyan/section heads (Pe., Pa., Pi., Hif., Af., Polel, Nithpa.
  &c.) belong to structure (`grammar`/stem sections), not loose in
  definition text.
- Anchor markup (`<a …>…</a>`) wraps the reference token only;
  surrounding punctuation and parentheses sit outside the tag.

## Known non-defect conventions (do not flag these)

- **Cross-field parenthetical:** an unclosed `(` in
  `language_code`/`language_reference` that closes inside the
  first sense's definition is the corpus's field-split convention,
  not lost text. Check whole-entry balance before calling class 8.
- **Terminal punctuation:** cross-reference senses (`, v. X`)
  routinely end without a period (7,455 of 9,114 corpus-wide) —
  convention, not loss. Same for many short glosses.
- **Citation-closing parens:** `Num. XVI, 1)` inside a running
  citation is a closing paren, not an in-text sense marker — check
  what precedes a suspected `N)` before calling class 2.

## The hard constraint: never invent text

You may **rearrange, re-tag, split, or delete existing text —
never generate new words**. Mechanically enforced by the
no-new-text validator: the patched entry's content bytes must be
drawn from the original entry's content bytes. The only synthesized
tokens permitted are sense-number markers from the closed grammar
`N)` / `—N)`, and only via:

- `retag` — its `number` token (the implied-1 / lost-marker class);
- `split` — its `marker` token;
- `replace` — closed-grammar tokens in its replacement text (the
  OCR `l)` → `1)` class). Maintainer ruling 2026-08-11: correcting
  an obvious OCR glyph is *correction*, not new text — but the
  allowance is held to the closed marker grammar, so correction can
  never widen into composition.

`move` and `delete` get no allowance at all.

Any repair that would need any other byte not already present in
the entry — a lost word, a dropped parenthetical, a print
correction — is **not a repair this process may make**. Disposition
the entry `needs_print_check` and describe the need in
`escalation`. This holds even when you are certain what the text
should say — and it includes single-byte losses (a dropped period
is class 8 too).

## Defect catalog

Twelve known classes. Use the exact `defect_class` token given.

### 1. `implied-one` — implied sense `1)`

**Recognize:** an unnumbered sense whose text carries a `—2)` run
with no `1)` anywhere before it — the print convention where sense
1 is only a cross-reference after the grammatical label, so print
omits the `1)`.

**Example:** A00339 (אֲגַר III): "…than all profit this world can
offer.**—2)** that which deserves reward…" — the unnumbered text
before `—2)` is sense 1.

**Repair:** `split` each in-text `—N)` run out into its own sense,
then `retag` the host `1)` (chained patches, see conventions). The
`1)` is a recorded deviation from print (register #16) and is
within the closed-grammar allowance. Disposition `repaired`.

### 2. `swallowed-marker` — sense boundary inside a definition

**Recognize:** a `—N)` (or a bare `N)` opening a new meaning)
inside a `definition` instead of starting its own sense; the
sense-number sequence usually skips N.

**Example:** K00081 (כָּבַשׁ): observed sequence 1, 2, 4, … because
"…(Chald.).—3) to press…" is swallowed inside sense `—2)`.

**Repair:** `split` at the marker. High confidence when the split
closes the observed numbering gap. Disposition `repaired`.

### 3. `ocr-marker` — OCR-mangled sense marker

**Recognize:** `l)` (lowercase L) or `1]` where print has `1)` —
usually opening the first sense.

**Example:** D00436 (דְּחָק): "(preced.) l) emergency…" — print
reads "1) emergency".

**Repair:** `replace` with `find` the mangled token and `replace`
the closed-grammar marker (e.g. `l)` → `1)`). If the corrected
marker should be a sense boundary, chain the structural `split` /
`retag` after it. Disposition `repaired`.

### 4. `missing-number-field` — sense present, marker lost

**Recognize:** a sense that is correctly separate in the data but
has no `number` while its position in a numbered sequence (or the
seed rulings) shows which marker it must carry.

**Example:** K00081's "to detain" sense — print reads "…Yalk. Sam.
112.—5) to detain", the data lost the `—5)`; maintainer-verified
reinsert. Also B00771 (בִּכּוּרָה), print has `1)`.

**Repair:** `retag` with the marker the sequence determines
(closing the gap exactly). If the correct number is not
determinable from the entry itself or a seed ruling, escalate
`needs_print_check` instead — never guess a marker.

### 5. `unclassified-binyan` — binyan/section head loose in text

**Recognize:** a binyan or section head (Pa., Pi., Hif., Af.,
Polel, Nithpa. &c.) embedded in definition text instead of opening
a classified stem section.

**Example:** F00116 (וְתַר): definition opens ", Pa. וַותֵּר l) to
give a surplus…" — the `Pa.` head is unclassified. Similarly
G00173's `Polel זוֹלֵל`.

**Repair:** none — no patch op writes grammar/stem structure.
Disposition `needs_human_judgment`; put the head token and its
location in `escalation`. Do not attempt text surgery around it
(you may still patch *other* defects in the entry, like F00116's
`l)`).

### 6. `chopped-duplicated-tail` — chopped and/or duplicated text

**Recognize:** a verbatim-duplicated **text** segment (anchors
included) where print has it once; or segmentation debris — a
dangling fragment chopped at an internal `N)` with its continuation
duplicated or stranded in the next sense. (Doubled *markup only*,
with the visible text appearing once, is class 10 — not this.)

**Example:** K00081 sense `—4)`: the tail ", v. Rabb. D. S. a. l.
note 6); Yalk. Gen. 145; Yalk. Sam. 112." appears twice; print has
it once (register #19). D00919 (דְּנָא) is the chopped variant:
sense 1 ends with a dangling "—2) v." fragment that the next,
unnumbered sense re-opens with a duplicated "v. preced." prefix.

**Repair:** `delete` (scope `segment`) the duplicated copy; for
chopped variants, chain `delete` of the dangling fragment and the
duplicated prefix, then `retag` the continuation sense (the D00919
seed ruling is the worked pattern). Confidence `med` unless a seed
ruling covers the row — duplication can mask genuinely lost text
between the copies.

**Boundary discipline (v3):** the deleted segment must span the
*entire* duplicated copy — trailing citations and `<a>` anchors
included. Batch-01 fail P000026 stopped short of the copy's final
`Ib. 68ᵃ` anchor and left an orphaned citation jammed against the
next word. After composing the delete, re-read the post-patch text
end to end: no orphaned citations, no missing spaces at the seam.
If the copies differ by even one byte, that difference may be the
lost text — escalate instead of deleting.

### 7. `anchor-boundary-markup` — markup swallows punctuation

**Recognize:** an `<a …>` anchor whose boundaries take in
punctuation or parentheses that belong outside (or exclude ones
that belong inside).

**Example:** G00403 (זֵיק): `<a …>(זנק</a>)` — the opening paren is
inside the anchor; correct is `(<a …>זנק</a>)`. Pilot: A00014.

**Repair:** `move` (or a byte-conserving `replace`) relocating the
punctuation across the tag boundary. Markup-only, byte-conserving,
high confidence. Disposition `repaired`.

### 8. `lost-parenthetical` — text lost upstream

**Recognize:** unbalanced parentheses/brackets, a truncated
abbreviation run, a parenthetical that opens and never closes —
text the transcription dropped. Includes single-byte losses (pilot
miss A00074: "bot" for "bot." — compare against the corpus's
parallel citation formulas when unsure).

**Sub-token losses (v3):** citation-formula punctuation defects are
class 8 even when structure balances perfectly — `Ar, ed.` where
the corpus writes `Ar. ed.` 2,819×, bare `Ar` for `Ar.`, `Rab.`
where the formula is `Rabb.`, `D. S. a.` cut short of ` l.`
(batch-01 misses A00470, A00266, A00638). The test is corpus
frequency, not balance: most of these arrive precomputed as
`anomaly_hints`, and a semantically odd gloss (A00407's "heated
store" for "stove") deserves the same parallel-rendering
comparison even without a hint. A comma is not a period —
correcting one needs a new byte, so these are `needs_print_check`,
never `replace`.

**Example:** G00403's first parenthetical: upstream dropped the
Hebrew plurals "זִקּים, זִיקִ׳, זִיקוֹת" and the closing paren
(print-verified 2026-08-07).

**Repair:** none possible — restoration needs new bytes.
Disposition `needs_print_check`; describe the suspected loss and
its location in `escalation`. Never reconstruct the text, even when
the surrounding context makes the loss "obvious". (First rule out
the cross-field parenthetical convention above.)

### 9. `print-error-carryover` — print itself is wrong

**Recognize:** a defect faithfully transcribed *from* the printed
edition — mismatched print brackets, a print typo — where the
source data matches print and print is wrong.

**Example:** G00403's tail "—(Mikv. IX, 5 Ar., v. זַקָּק.]" — print
itself pairs "(" with "]"; the correction to "—[Mikv." is a
recorded deviation with a note (maintainer ruling 2026-08-07).

**Repair:** none by you — deviating from print requires the
maintainer's notes/deviation mechanism. Disposition
`needs_human_judgment`; state the print reading and the proposed
correction in `escalation`.

### 10. `duplicate-anchor-wrap` — doubled link markup (pilot class)

**Recognize:** a cross-reference wrapped in nested duplicate
`<a>` tags (same href doubled around one copy of the link text),
sometimes trapping punctuation between the layers. Visible text
appears once — only markup is doubled.

**Example:** pilot A00085 (אבחטס) and A00130: nested identical
`<a>` around one cross-reference.

**Repair (in a sense's definition):** one byte-conserving
`replace` whose replacement is a substring of `find` (drop the
duplicate tag layer). Disposition `repaired`, confidence `high`.

**In non-sense fields (`language_reference` etc.):** systemic —
see the script-slated list below. Do NOT escalate per entry.

### 11. `wrong-link-target` — anchor points at the wrong headword

**Recognize:** an `<a>` whose display text and target disagree
(pilot A00173: display אַבְנֵי, href/`data-ref` אַדְנֵי — one
letter off). The boundary markup is correct; the *destination* is
wrong.

**Repair:** href/data-ref attributes are patchable via `replace`
only when the correct bytes already exist in the entry — usually
they do not. Escalate `needs_human_judgment` with display text,
target, and the discrepancy. Low expected volume.

**Circular `v.` references (v3):** a `v. X` cross-reference whose
link targets the entry's own headword is this class too (batch-01
miss A00571; arrives as a `circular-v-ref` hint). The linker's
self-links on plain mentions and inflected surface forms of the
headword are convention, not defects — the defect is specifically
a *see-reference* that goes nowhere else.

**Mandatory display-vs-target check (v4):** for every anchor you
read, compare its display text against its `data-ref` target. Four
of batch-02's five catchable misses were anchors nobody compared.
A difference is acceptable only when it is one of:

- an inflected or construct surface form of the target headword;
- a plene/defective spelling of the same word (matres lectionis
  `י`/`ו` alternate freely in this corpus);
- an attested variant recorded in the target's `alt_headwords`;
- niqqud alone, **and** no second headword shares that consonantal
  skeleton (see below).

Anything else is class 11 — including a display whose own vocalized
form is itself a different headword (batch-02 A00988: displays אָב,
targets אַבָּא I, while אָב I exists as its own entry).

**Niqqud carve-out, narrowed (v4):** vocalization-only differences
between display and target are linker convention *only when the
consonantal skeleton belongs to exactly one headword*. When two
headwords share the skeleton, niqqud is the only thing telling them
apart and the carve-out cannot apply — read both entries and decide
which the citation means. Batch-02 A01201 displayed זְמַר I but
targeted זָמַר I ("to prune", Hebrew) when the Aramaic זְמַר cites the
same Y. Shebi. IV, 35ᵃ passage; v3's blanket carve-out actively
steered the sweep past it. These arrive as `niqqud-twin-target`
hints.

**Geresh abbreviations (v4):** a display ending in `׳` inside an
entry abbreviates *that entry's* headword. Its link must resolve to
this entry. A target whose opening letters also match the
abbreviation does not make the link right — batch-02 A01486's
`אִסְפַּ׳` under אִיסְפַּקְלַרְיָא linked to אִיסְפַּרְגּוֹס (asparagus), and both
words open with the same letters. These arrive as `abbrev-mislink`
hints. One- and two-letter geresh forms (`ר׳` = Rabbi, `ב׳` = ben)
are generic and are not hinted.

**Exception, `v. sub` redirect stubs (v5):** an entry whose whole
content is `", v. sub נִידּ׳."` is a pointer, and its anchor is
*supposed* to leave the entry — for the host's own spelling twin,
the plene or defective form of the same word. "Links elsewhere" is
not a defect there, and the detector no longer hints these.

The class-11 signature remains a consonantal one-letter mismatch or
a wrong destination.

### 12. `duplicate-refs-block` — duplicated refs/quotes block

**Recognize:** a verbatim-duplicated run of items in the entry's
`refs` (or `quotes`) array (pilot A00172: a 14-item block listed
twice).

**Repair:** none — arrays are outside sense scope. Escalate
`needs_human_judgment` with the duplicated range. Low expected
volume.

## Systemic, script-slated patterns — do NOT escalate per entry

These are real defects, but corpus-wide scans show thousands of
mechanical, identical instances; per-entry escalation would flood
the queue without adding information. A deterministic script
(script-extraction phase, spec §4.1.7) will fix them corpus-wide.
An entry whose **only** finding is one of these is `clean`; do not
mention them in escalations.

| Pattern | Scale | Slated handling |
| --- | --- | --- |
| `duplicate-anchor-wrap` in **non-sense fields** (`language_reference` etc.) | ~1,220 entries | script: collapse nested duplicate anchors |
| Bare RTL Hebrew in definition text without `dir="rtl"` wrapper | ~4,900 senses | script: wrap (markup-only) |
| Jerusalem Talmud `href` missing its leading `/` (`href="Jerusalem_Talmud_…"`) | 7,679 of 7,679 — uniform | script: prepend the slash |

(The Jerusalem Talmud href was added in v4. Two batch-02 agents
disagreed about it and one raised a false escalation under a new
class name; three verifiers independently counted it uniform
corpus-wide. It is systemic — leave such entries `clean`.)

(In-sense `duplicate-anchor-wrap` is still class 10 — patch it:
the patch corpus records it precisely, and the script will be
derived from these patches.)

## Repair conventions (cross-class)

- **One patch = one op on one sense.** When a repair needs several
  ops (implied-one = split + retag), emit them as a **chain in
  apply order**: each later patch's `target` anchor and
  `expected_before` describe the sense **as the previous patch
  leaves it**. Patches apply in your emitted order.
- **Never two patches with the identical `(rid, target)` string** —
  that is a preflight error. A chain is legal precisely because
  each step's anchor differs.
- **Combine text edits to one sense state into one patch** rather
  than stacking replaces.
- **`expected_occurrences` counts target senses, not text
  matches.** It is how many senses in the entry share your
  target's `(number token, anchor)` address — almost always `1`
  (two identical senses in one entry are rare). It says nothing
  about how many times a segment string occurs in a definition.
- **`delete`/`move` segments and anchors must occur exactly once
  in the definition.** To remove one copy of a duplicated string,
  extend the segment with enough surrounding context to make it
  unique (e.g. include the preceding citation in the segment and
  keep the shared text out of it). If no unique framing exists,
  escalate `needs_human_judgment`.
- **Marker style:** first marker `1)` (no dash); in-text
  continuation markers `—N)`. A `split` marker token is carried
  verbatim into the new sense's `number`.
- **Sequence sanity check:** after your patches, replay them
  mentally — the entry's top-level numbering should read 1..n. If
  it still doesn't, say why in the manifest.
- **Patch ids:** `P` + 6 digits, sequential from `P000001` within
  your chunk output. Ingest renumbers to corpus-unique ids;
  internal consistency (manifest ↔ patches) is what matters.
- **Anchors:** copy from the provided `sense_index`. Chain
  continuation anchors are the one exception (computed, with a
  script — see Input).
- **Do not re-litigate pre-decided inputs** (next section).
  Maintainer decisions are inputs. If a pre-decided repair is
  already present in the entry you received (a deterministic script
  got there first), the defect no longer exists — do not re-patch
  it.

### Worked example (mechanics)

Synthetic entry `X00001`, one unnumbered sense:

```json
{ "definition": "first meaning.—2) second meaning." }
```

Its `sense_index` row: `{ "path": "0", "number": "",
"anchor": "56b28a8d" }`. This is `implied-one`. Two chained
patches:

```jsonl
{"id":"P000001","rid":"X00001","target":"sense[]:56b28a8d","op":"split","expected_before":"first meaning.—2) second meaning.","expected_occurrences":1,"occurrence_index":1,"payload":{"marker":"—2)"},"confidence":"high","rationale":"In-text —2) run with no 1) before it; split the swallowed boundary.","defect_class":"implied-one","snapshot":"sha256:<pin>","prompt_version":"v5"}
{"id":"P000002","rid":"X00001","target":"sense[]:75f7e275","op":"retag","expected_before":"first meaning.","expected_occurrences":1,"occurrence_index":1,"payload":{"number":"1)"},"confidence":"high","rationale":"Host sense is the implied 1); insert per register #16 convention.","defect_class":"implied-one","snapshot":"sha256:<pin>","prompt_version":"v5"}
```

`56b28a8d` came from the input `sense_index`; `75f7e275` is the
one computed anchor (post-split host definition "first meaning.").
After both: sense `1)` "first meaning." and sense `—2)` " second
meaning.". Manifest record:

```jsonl
{"rid":"X00001","disposition":"repaired","patches":["P000001","P000002"]}
```

## Pre-decided inputs (binding — do not contradict)

Maintainer decisions already made are seed material. Where a ruling
below prescribes a repair, emit exactly that repair (confidence
`high`, unless the entry state you received already reflects it —
then it is simply no longer a defect). Where a ruling rejects a
reading, do not re-assert it.

### doc-08 implied-one census rulings (53 decided of 79)

Source: `docs/v2/body-review/08-implied-one-candidates.md`
(maintainer review; ruling 2026-08-13 folds the 26 undecided rows
into this sweep — you judge those like any entry, under class 1).

**Confirmed implied-one** (repair per class 1; D00072 is already
dispositioned upstream — verify state, don't duplicate):

> A00339, A00628, A02056, A02731, A03305, B00134, B00807, B00881,
> B01131, C00095, C00252, C00460, C00580, C00805, C01393, D00038,
> D00072, D00249, D00325, D00792, D00807, E00005, E00443, E00679,
> G00173, G00403, G00652, H00242, H00507, H00547, H01864, I00111,
> I00466, I00638, I00661, I00853, J00114, J00459

Rows with extra recorded findings:

| Rid | Additional ruling |
| --- | --- |
| E00005, I00661, G00363 | Also carry uncategorized `2)`/`3)` senses — treat under classes 2/4 |
| G00173 | Also an unclassified binyan head `Polel זוֹלֵל` (class 5 escalation) |
| G00403 | Confirmed implied-one **plus** three print-verified rulings 2026-08-07: (a) anchor fix `(זנק` → class 7 repair; (b) lost plurals parenthetical → class 8, `needs_print_check` (registered for Sefaria); (c) print's mismatched "(…]" tail → class 9, `needs_human_judgment` |
| G00652 | Confirm for the Pi. section; main sense 2 is also missing its `2)` marker (class 4) |
| D00792 | Recorded as "common" in the review table — read as confirm |

**Rejected — not implied-one** (the real defect is the class shown;
repair accordingly):

| Rid | Actual defect | Ruling detail |
| --- | --- | --- |
| B00479 | class 3 | OCR `1]` for `1)` ("1] to be disordered") |
| B00771 | class 4 | Sense missing its number field; print has `1)` |
| D00436 | class 3 | OCR `l)` ("l) emergency") |
| D00919 | class 6 | Chopped + duplicated (print-verified 2026-08-07): sense 1 truncates to "v. preced." (drop the dangling "—2) v." fragment); the unnumbered sense drops its duplicated "v. preced." prefix, takes `—2)`, keeps the rest |
| D01009 | class 3 | OCR `l)` ("l) palm-tree") |
| E00148 | class 3 | OCR `l)` ("l) to return, restore") |
| E00298 | class 3 | OCR `l)` ("l) giving a debtor notice") |
| E00741 | class 3 | OCR `l)` ("l) (= h. הֵשִׁיב) to turn") |
| E00918 | class 3 | OCR `l)` ("l) destruction") |
| E00940 | class 3 | OCR `l)` ("l) now") |
| F00116 | class 3 + 5 | OCR `l)`; plus unclassified `Pa. וַותֵּר` head (escalate) |
| G00233 | class 8 | Source lost sense 1's text (print: "1) to turn, roll") — `needs_print_check`, cite this reading |
| G00363 | class 3 | OCR `l)` ("l) designation for a purpose"); plus uncategorized senses |
| H01202 | class 8 | Print reads "1) אַחֵים to heat, excite" — the word אַחֵים is lost; `needs_print_check`, cite this reading |
| I00822 | class 3 | OCR `l)` ("l) dining couch") |

**Folded (undecided — you decide, under class 1):** J00627, J00657,
K00030, K00121, K00156, K00859, N00235, N00577, N01162, P00816,
P00856, P01055, Q00990, Q01352, R00075, R00291, R00586, S00826,
S01355, S01731, T00243, T00375, T00538, U00884, U00960, V00652.

### Deferred-row resolutions (doc-01, maintainer-verified)

| Rid | Ruling |
| --- | --- |
| D00470 (דִּיבּוּר) | Confirmed 2026-08-06: the source's `2)` sense is the second sense of the plural with an implicit `1)` — implied-one repair applies |
| K00081 (כָּבַשׁ) | Resolved 2026-08-07, print-verified: the in-text `—3)` splits (class 2); the "to detain" sense reinserts `—5)` (class 4); the doubled `—4)` tail loses its second copy (class 6, register #19) |
| R00519 (צָלַל) | Confirmed 2026-08-06: in-text `3)` splits; sense 4's stray "[" is attached to the previous sense's end — print reads "[4) to glisten, be bright; …]" |

## Output contract

Emit two JSONL streams (patches, then manifest), tagged with your
chunk id.

### Patch record — every field required

| Field | Value |
| --- | --- |
| `id` | `P` + 6 digits, sequential within your chunk |
| `rid` | The entry's rid (uppercase letter + 5 digits) |
| `target` | `sense[<number token, or empty>]:<8-hex anchor from sense_index>` |
| `op` | `split` \| `retag` \| `move` \| `delete` \| `replace` |
| `payload` | Op-specific, see below |
| `expected_before` | The target sense's exact current definition (byte-exact vs. your input, or vs. the prior patch's result in a chain) |
| `expected_occurrences` | How many senses share the target address — normally `1` (NOT segment-copy count) |
| `occurrence_index` | Which matching sense you edit (1-based, ≤ `expected_occurrences`) |
| `confidence` | `high` \| `med` \| `low` — see rubric |
| `rationale` | One sentence: why |
| `defect_class` | Catalog token (or your proposed name for a novel class) |
| `snapshot` | The provided pin, verbatim |
| `prompt_version` | `"v5"` |

### Payloads

| Op | Payload | Semantics |
| --- | --- | --- |
| `split` | `{ "marker": "—N)" }` | Marker must occur exactly once in the definition; host keeps text before it, new sibling at host+1 takes the marker as `number` and the rest as definition |
| `retag` | `{ "number": "N)" or "—N)" }` | Sets the sense's `number`; token must be closed-grammar |
| `move` | `{ "segment", "anchor", "position": "before"\|"after" }` | Segment lifted out (must occur exactly once), reinserted beside anchor (exactly once after lift) |
| `delete` | `{ "scope": "segment", "segment" }` or `{ "scope": "sense" }` | Removes an exact segment (must occur exactly once — extend with context to disambiguate copies) or the whole sense |
| `replace` | `{ "find", "replace" }` | Replaces an exact substring (exactly once); replacement bytes limited to find-text bytes + closed-grammar markers |

### Manifest record — one per input entry, no exceptions

| Field | Value |
| --- | --- |
| `rid` | The entry's rid |
| `disposition` | `clean` \| `repaired` \| `needs_print_check` \| `needs_human_judgment` — exactly one |
| `patches` | Ids of this entry's patches (`clean` → `[]`; `repaired` → at least one; `needs_*` may carry confident patches alongside the escalated issue) |
| `escalation` | Required on `needs_*` rows (what you found and why you could not repair it); forbidden otherwise |

Do not emit a `resolution` field — that slot is the maintainer's.

### Dispositions

| Disposition | Use when |
| --- | --- |
| `clean` | No defects found — or only script-slated systemic patterns (say nothing about those) |
| `repaired` | Every found defect is expressed in patches |
| `needs_print_check` | A defect's repair requires the printed page (lost text, unverifiable marker) |
| `needs_human_judgment` | A defect's repair is a maintainer call (structure changes, print deviations, wrong link targets, array-scope defects, ambiguous readings) |

An entry with both patches and an unrepairable finding takes the
`needs_*` disposition (the patches still ride along in `patches`).

### Confidence rubric

| Level | Meaning |
| --- | --- |
| `high` | Exact catalog class, unambiguous repair, numbering/balance closes cleanly, or a seed ruling prescribes it |
| `med` | Catalog class but a judgment call was involved (where a boundary falls, which copy of a duplicate to drop); class 6 is never higher than `med` without a seed ruling |
| `low` | Novel pattern, or a repair you believe correct but cannot verify from the entry alone |

Every `low` and `med` patch gets a second-opinion review; a random
sample of `high` patches and `clean` entries does too. Honest
confidence is what makes the sampling work — do not inflate.

## Final checklist (before you return)

1. One manifest record per input entry — count them.
2. Every patch id appears in exactly one manifest record.
3. Every `expected_before` byte-exact against your input (or the
   prior chained state); every anchor copied from `sense_index`
   (chain continuations computed by script).
4. No patch introduces bytes beyond its op's closed-grammar marker
   allowance.
5. No `needs_*` row without an `escalation`; no `clean` row with
   patches; no escalations for script-slated systemic patterns.
6. Seed rulings honored; nothing pre-decided re-litigated.
7. `snapshot` and `prompt_version` (`v5`) on every patch.
8. Every `anomaly_hint` for your entries explicitly judged —
   accepted into a disposition or rejected with a reason you could
   defend to the verification tier.
