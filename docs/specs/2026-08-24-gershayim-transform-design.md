# Gershayim transforms — Phase 2 batch 3a design

**Status:** approved 2026-08-24 (Brian). Extends
[the transform module design](2026-08-22-transform-module-design.md);
that spec's §3 contract, §5 gates and §6 write-back mechanism hold here
unchanged unless this document says otherwise. The link-target gate of
[the batch 2 link spec](2026-08-22-link-transform-design.md) §3.2 is
extended by §4 below, not replaced.

## 1. What this batch is, and why it is a batch of its own

The module spec's §7 table reads *"3 — Italics & punctuation seams,
~16 rows, ~3,900 instances"*. Reading the catalogue splits that line
into two families that repair different kinds of damage:

| Family | Rows | Instances | What is wrong |
|---|---:|---:|---|
| **Gershayim (3a, this spec)** | 2 | 2,302 | a wrong CHARACTER in text and in link targets |
| Italic & punctuation seams (3b) | ~15 | ~2,600 | markup boundaries around correct characters |

**Ruling (2026-08-24): batch 3 splits into 3a and 3b, and 3a ships
first.** The two families fail differently and need different review.
3a is a data repair that crosses five fields plus link attributes and
can break links; every
member of 3b is a byte-identical typographic normalisation, and two of
its rows say so in their own audits — `italic-swallowed-terminal-period`
records *"THIS IS A TYPOGRAPHIC-CONSISTENCY ROW, NOT A TEXT-INTEGRITY
ROW"*, and `emphasis-run-edge-space` records *"nothing is visibly wrong
today"*. Mixing a cross-field data repair with 2,600 instances of
invisible normalisation in one pull request would put both under the
wrong kind of scrutiny.

3b keeps the batch number and gets its own spec. Batches 4–7 do not
renumber.

### The two rows

| Row | Catalogued | Blocking |
|---|---:|---|
| `ascii-quote-as-gershayim-in-body` | 1,290 entries | no |
| `gershayim-breaks-ref-attribute` | 85 entries | **yes** |

They ship together. §3 shows they are one defect seen from two sides.

## 2. The defect

Jastrow's print sets Hebrew abbreviations with a gershayim, `״`
(U+05F4). The corpus writes an ASCII `"` instead — `הקב"ה` where print
has `הקב״ה`.

The interpretation is confirmed rather than assumed, and the catalogue
audit did the confirming: of 1,912 raw body-text occurrences, 1,908
have a Hebrew letter on both sides and **zero** are quotation marks
(all 92 two-quote elements were re-read by hand and are multiple
abbreviations). U+05F4 does not occur once in the entire 32,512-line
file, against 64,000+ U+05F3 geresh — including strings where both
marks would have to coexist. Full report:
`data/patches/catalogue-audit/ascii-quote-as-gershayim-in-body.md`.

### Measured scope

Reproduce on the pinned snapshot
(`data/patches/snapshot.lock`, sha256 `4c64ff03…`):

```bash
bun -e 'const Q=String.fromCharCode(34), P=new RegExp("[֐-׿]"+Q+"[֐-׿]","gu");
const t=new Map(), rids=new Set(); let all=0;
const add=(k,s,rid)=>{ if(typeof s!=="string")return; all+=s.split(Q).length-1; const n=[...s.matchAll(P)].length; if(!n)return; t.set(k,(t.get(k)??0)+n); rids.add(rid); };
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){ const e=JSON.parse(l);
  add("headword",e.headword,e.rid); for(const a of e.alt_headwords??[])add("alt_headwords",a,e.rid);
  for(const p of e.plural_form??[])add("plural_form",p,e.rid); for(const r of e.refs??[])add("refs[] (out, B7)",String(r),e.rid);
  const w=(s)=>{ if(!s)return; add("senses[].definition",s.definition,e.rid); add("senses[].number",s.number,e.rid); for(const n of s.senses??[])w(n); };
  for(const s of e.content?.senses??[])w(s); add("content.morphology",e.content?.morphology,e.rid);
  for(const q of e.quotes??[])for(const p of q??[])add("quotes[]",p,e.rid); }
console.log("ASCII quotes, all fields:",all); console.log("Hebrew-flanked:",[...t.values()].reduce((a,b)=>a+b,0),"in",rids.size,"entries");
for(const [k,v] of [...t].sort((a,b)=>b[1]-a[1]))console.log(" ",String(v).padStart(5),k);'
```

| Field | Occurrences | In scope |
|---|---:|---|
| `senses[].definition` | 2,202 | yes — includes the 90 inside tag attributes |
| `headword` | 69 | yes |
| `refs[]` | 21 | **no** — see below |
| `alt_headwords` | 19 | yes |
| `plural_form` | 8 | yes |
| `quotes[]` | 4 | yes |
| **Total** | **2,323 / 1,392 entries** | **2,302 in scope** |

The entry count reproduces the audit's 1,392 exactly. The occurrence
count is 6 above the audit's 2,317; the implementation reconciles that
difference before the rule is written, and records which reading is
right. It is most likely a Hebrew-block boundary difference, but a
likely explanation is not a measurement.

**`refs[]` is out of scope by ruling, not by neglect.** The body model
spec drops it: *"`refs` | **Dropped — derived at compile** (§5) | B7"*
([entry-body-model-design.md:115](2026-07-11-entry-body-model-design.md)).
The transform gate already excludes it for the same reason — *"`refs[]`
is dropped from truth (body model spec §5, B7) and holds machine
identifiers"* (`admin/pipeline/transform/no-new-text.ts`). Repairing a
field that does not survive compile would be work with no output.

### Scale, and why the predicate carries the safety burden

The in-scope fields hold **1,310,492** ASCII quotes. All but 2,323 are
HTML attribute delimiters or ordinary punctuation. A rule that reached
for `"` without the Hebrew-flanked test would rewrite the corpus's
markup wholesale. Nothing downstream would catch it: the text gate
strips tags before comparing, so attribute damage is invisible to it,
and the markup gate compares a well-formedness delta rather than
well-formedness.

## 3. Why the two rows are one defect

An ASCII `"` inside a `"`-delimited attribute value terminates the
attribute. So a gershayim in a link target does not merely look wrong;
it makes the tag unparseable:

```
A00009  <a dir="rtl" class="refLink" href="/Jastrow,_אל"ף.1" data-ref="Jastrow, אל"ף 1">
```

This is the same defect class as the apostrophe-in-attribute parser
bug fixed in [#47](https://github.com/UniquePixels/jastrow/pull/47),
approached from the data side rather than the parser side.

Measured: **90 occurrences across 85 entries** carry a Hebrew-flanked
quote inside a tag, which reproduces `gershayim-breaks-ref-attribute`'s
catalogued 85 exactly.

**And every one of them points at a headword that carries the same
defect — 90 of 90, with 0 unresolved.** Extract each broken
`data-ref`'s Jastrow target and test it against the 68 distinct
headwords containing an ASCII quote:

```bash
bun -e 'const Q=String.fromCharCode(34), P=new RegExp("[֐-׿]"+Q+"[֐-׿ ]","u");
const DR=/data-ref="Jastrow,\s([\s\S]*?)\s(?:[IVXL]+\s)?\d+"/u, TAG=/<[^<>]*>/gu;
const es=(await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean).map(l=>JSON.parse(l));
const hw=new Set(es.map(e=>e.headword).filter(h=>h.includes(Q)));
let tags=0, matched=0; const bad=[];
for(const e of es){ const out=[]; const w=(s)=>{ if(!s)return; if(typeof s.definition==="string")out.push(s.definition); for(const n of s.senses??[])w(n); };
  for(const s of e.content?.senses??[])w(s); if(typeof e.content?.morphology==="string")out.push(e.content.morphology);
  for(const q of e.quotes??[])for(const p of q??[])if(typeof p==="string")out.push(p);
  for(const t of out)for(const m of t.matchAll(TAG)){ if(!P.test(m[0]))continue; tags++; const g=DR.exec(m[0])?.[1];
    if(g!==undefined&&hw.has(g))matched++; else bad.push(e.rid+" "+m[0].slice(0,80)); } }
console.log("quote-bearing headwords:",hw.size); console.log("broken tags:",tags,"| target is a quote-bearing headword:",matched,"| unresolved:",bad.length);
console.log(bad.slice(0,3).join("\n"));'
```

(69 occurrences across 68 distinct headword strings — one headword
carries two.)

This is the measurement the whole batch rests on, and it converts the
audit's warning —

> "FIXING BODY TEXT WITHOUT FIXING HEADWORDS, refs[] AND data-ref IN
> THE SAME PASS WILL BREAK CROSS-LINKS THAT CURRENTLY MATCH BY STRING
> IDENTITY"

— from an assertion into a number. Fix the headwords alone and all 90
links break. Fix the attributes alone and all 90 point at addresses
that no longer exist. Fix both in one pass and identity is preserved by
construction, because both sides are rewritten by the same substitution.

The audit's figure of "172 inside href/data-ref values" counts `href`
and `data-ref` separately over these same 90 tags. It is not a third
population.

## 4. Architecture

### 4.1 One predicate, on the raw string

The rule matches an ASCII `"` with a Hebrew letter on both sides,
applied to the **raw field string** — before tag stripping, not after.

One regex therefore repairs body text and broken attribute values in a
single uniform pass. The text occurrence of `אל"ף` in a definition and
the `data-ref` occurrence of `אל"ף` in the anchor pointing at it are
the same shape, so they receive the same treatment by construction
rather than by two rules kept in step by hand — which is the failure
mode §3 measures.

It also makes the rule independent of markup context, and that
dissolves the audit's ordering rider:

> "Ordering dependency: if bare-rtl-hebrew runs first and wraps its
> 117, they migrate into this row's scope."

Wrapped or bare, the codepoints are identical, so the predicate sees
the same 2,302 either way.

### 4.2 Registry placement

`text-repairs` phase. Order relative to the rtl trio and the batch-2
unlink family is **free**, because no rule in either family reads or
writes a Hebrew-flanked quote.

That is a claim about other people's code, so it is proven the way the
geresh pair's order was proven (`registry.ts`): run the corpus under
both orders and show 0 entries differing by a byte. A measured
statement in the registry comment, not an aesthetic one.

### 4.3 The gates, and the one new case

| Gate | What it needs |
|---|---|
| `no-new-text` | `allows: ['״']` — a maintainer ruling, under the OCR ruling of 2026-08-11 already cited in that file |
| `markup` | unchanged; the fix strictly improves well-formedness by closing 90 broken attributes |
| `link-target` | **one new case** — see below |

The `allows` blast radius is stated rather than discovered: per
`no-new-text.ts`, a declared allowance permits that codepoint
*anywhere* in the rule's diff. `״` is a good citizen for this — it does
not occur once in the input corpus, so any occurrence in the output is
this rule's own work and the rule's unit tests can assert the exact
count.

**The link-target gate rejects a corrected target as a fabrication,
and is right to under its current cases.** Its contract is *"a rule may
only write a link target it can point at in this entry's own input"*.
A corrected `data-ref` is absent from the input's target set. Case 3
cannot license it — the remainder must appear in the anchor's display
text, and in the input the display carries the ASCII quote too. Case 4
cannot either; a mid-string substitution is not a prefix of one target
joined to a suffix of another.

**Case 5 — glyph correction.** A written target is accepted if it
differs from some input target by ASCII `"` → `״` substitution and by
nothing else: same length, same codepoints at every other position.
Declared through a new `TransformResult.glyphCorrected` field —
`{ from, target }`, where `from` is a target in this entry's input — so
it is a rule author's assertion rather than a silent widening, matched
to anchors the same way `composed` and `recombined` are.

Fail-closed by construction. The case admits no address the input did
not already hold, in any spelling other than the corrected one, and it
cannot move a link from one entry to another — every non-quote
character is pinned.

### 4.4 What the rule will not do

Glyph only, never slot. The audit found 49 occurrences whose mark sits
in a minority position (`הק"בה` 15 against `הקב"ה` 194) and 34 more
undetermined. The rule corrects the character in place and leaves the
position alone.

Moving the mark would source the repair from a *different token
elsewhere in the corpus*, which is the inference shape the
no-vowel-inference ruling forbids. It would also need its own dominance
threshold, and it would silently rewrite `עכ"ום`, which the audit flags
as possibly a genuine censorship-era variant rather than a defect —
`A00692` is one of the 90 broken attributes, so the two questions meet.

The 83 are recorded as residue in
`data/patches/catalogue-audit/ascii-quote-as-gershayim-in-body.md` for
the post-launch judgment pass, with a `reason` written back to both
catalogue rows per §6 of the module spec.

## 5. Verification

The standard battery, plus one gate this batch needs and no other has.

| Tier | What it proves |
|---|---|
| Unit | the predicate fires on Hebrew-flanked quotes and holds off the 1.31M attribute delimiters |
| `transform:count` | the predicate reproduces the catalogue counts, both rows |
| `no-new-text` | nothing beyond `״` enters, and `״` enters exactly as often as `"` leaves |
| `markup` | 90 previously-unparseable tags now parse; no tag becomes worse |
| Order probe | both registry orders produce byte-identical corpora |
| **Link integrity** | **see below** |
| `body:migrate-dry` | 32,512/32,512, 0 schema failures, 0 quarantines |

**The link-integrity gate is the batch's headline number.** Resolve
every `data-ref` in the corpus against the set of entry headwords,
before and after the pass:

- every target that resolved before MUST still resolve after
- the 90 that resolved to nothing MUST now resolve to their targets
- the count of resolving targets MUST go up by exactly 90 and by
  nothing else

Measured, not predicted. If the number is not 90 the rule is wrong,
and that is the point of stating it in advance.

## 6. Expected write-backs

Per module spec §6, every catalogue row this batch touches gets a
`reason` recorded whether or not a rule ships:

- `ascii-quote-as-gershayim-in-body` — count reconciled (2,317 vs the
  2,323 measured here), `refs[]` scoped out under B7, the 83
  slot-residue occurrences recorded.
- `gershayim-breaks-ref-attribute` — the 90/90 cross-link result, and
  the note that it is not an independent row but the attribute face of
  its sibling.

No withdrawal to `judgment` is expected. If the count reconciliation
turns up a population that is not the described defect, §6's mechanism
applies as it did for `h-cognate-self-link` in batch 2.

## 7. Risks

| Risk | Mitigation |
|---|---|
| The predicate catches a real quotation mark | 92 two-quote elements already hand-read in the audit; unit tests hold off Latin-flanked and mixed-script quotes |
| Case 5 widens the link gate too far | same-length, same-position, substitution-only; declared per call; no address enters that the input lacked |
| The 6-occurrence discrepancy hides a second shape | reconciled before the rule is written, and the finding recorded either way |
| Slot residue is read as "fixed" | recorded explicitly as residue in the audit file and in both rows' `reason` |

## 8. Decision log

| Date | Decision |
|---|---|
| 2026-08-24 | Batch 3 splits: 3a gershayim (this spec) ships before 3b italic & punctuation seams |
| 2026-08-24 | Gershayim widens to all surviving fields rather than body text alone; `refs[]` excluded under B7 |
| 2026-08-24 | `gershayim-breaks-ref-attribute` joins 3a; the two rows are one defect (90/90) |
| 2026-08-24 | Glyph only, never slot; the 83 displaced-or-undetermined occurrences are recorded residue |
| 2026-08-24 | Link-target gate gains case 5, glyph correction, rather than exempting the rule |
