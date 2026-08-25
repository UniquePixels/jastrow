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
| **Gershayim (3a, this spec)** | 2 | 2,305 | a wrong CHARACTER in text and in link targets |
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
bun -e 'const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34), P=new RegExp("(?<=["+HEBREW+"]\\u0307*)"+Q+"(?=["+HEBREW+"])","gu"), TAG=/<[^<>]*>/gu;
const t=new Map(), rids=new Set(), tE=new Set(), gE=new Set(), tags=new Set(); let tO=0,gO=0;
const add=(k,s,rid,scoped=true)=>{ if(typeof s!=="string")return; const mask=new Array(s.length).fill(false);
  for(const m of s.matchAll(TAG))for(let i=m.index;i<m.index+m[0].length;i++)mask[i]=true;
  for(const m of s.matchAll(P)){ t.set(k,(t.get(k)??0)+1); rids.add(rid); if(!scoped)continue;
    if(mask[m.index]){gO++;gE.add(rid); const g=[...s.matchAll(TAG)].find(x=>m.index>=x.index&&m.index<x.index+x[0].length); tags.add(rid+"|"+g.index)} else {tO++;tE.add(rid)} } };
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){ const e=JSON.parse(l);
  add("headword",e.headword,e.rid); for(const a of e.alt_headwords??[])add("alt_headwords",a,e.rid);
  for(const p of e.plural_form??[])add("plural_form",p,e.rid); for(const r of e.refs??[])add("refs[] (out, B7)",String(r),e.rid,false);
  const w=(s)=>{ if(!s)return; add("senses[].definition",s.definition,e.rid); add("senses[].number",s.number,e.rid); for(const n of s.senses??[])w(n) };
  for(const s of e.content?.senses??[])w(s); add("content.morphology",e.content?.morphology,e.rid);
  add("language_code",e.language_code,e.rid); add("language_reference",e.language_reference,e.rid);
  for(const q of e.quotes??[])for(const p of q??[])add("quotes[]",p,e.rid); }
console.log("corpus-wide",[...t.values()].reduce((a,b)=>a+b,0),"in",rids.size,"entries | in scope",tO+gO);
console.log("text",tO,"/",tE.size,"entries | tag",gO,"/",gE.size,"entries in",tags.size,"tags");
for(const [k,v] of [...t].sort((a,b)=>b[1]-a[1]))console.log(" ",String(v).padStart(5),k);'
```

Output:

```
corpus-wide 2326 in 1392 entries | in scope 2305
text 2125 / 1386 entries | tag 180 / 85 entries in 90 tags
   2205 senses[].definition
     69 headword
     21 refs[] (out, B7)
     19 alt_headwords
      8 plural_form
      4 quotes[]
```

| Field | Occurrences | In scope |
|---|---:|---|
| `senses[].definition` | 2,205 | yes — includes the 180 inside tag attributes |
| `headword` | 69 | yes |
| `refs[]` | 21 | **no** — see below |
| `alt_headwords` | 19 | yes |
| `plural_form` | 8 | yes |
| `quotes[]` | 4 | yes |
| **Total** | **2,326 / 1,392 entries** | **2,305 in scope** |

The entry count reproduces the audit's 1,392 exactly. **The occurrence
count is settled, and both earlier readings were low** — the audit's
2,317 by 9, and this spec's own first figure of 2,323 by 3. The
reconciliation was Task 0 of the implementation plan and closed with
zero residual; the working is in the audit file under "Reconciliation,
2026-08-24".

Two counting traps produced the three, and both are traps a rule can
fall into as easily as a probe:

- **A consuming pattern skips alternate quotes.** `[HEBREW]"[HEBREW]`
  with the `g` flag matches `X"Y` in `X"Y"Z` and resumes past `Y`, so
  the second quote is never examined. Two occurrences (A00253,
  U01408) hide there. A lookaround predicate — zero-width on both
  sides, consuming only the quote — finds them.
- **A Hebrew letter may carry a combining mark before the quote.** One
  occurrence (M01940) puts U+0307 between the letter and the `"`, so a
  bare `(?<=[HEBREW])` lookbehind misses it. The lookbehind must
  tolerate the mark, which is what `html.ts`'s `HEBREW_ATOM` already
  encodes — `[${HEBREW}]̇*`. That constant is **module-private**
  today (`html.ts:55`, absent from the export list); the rule exports
  it rather than restating the atom, so the corpus keeps one
  definition of "a Hebrew letter with its marks".

Measured on the three readings, in scope: 2,302 consuming, 2,304
lookaround, **2,305 atom-aware**. The third is correct and is the
figure every later section uses. **The counting bug and the rewriting
bug are the same bug**: a rule built on the consuming pattern would
leave three occurrences uncorrected while reporting success.

The audit's own 2,317 has a separate and now-known cause: its
attribute probe recursed only into top-level `senses[].definition` and
never entered nested sub-senses, seeing 86 anchors where the corpus
holds 90. 86 × 2 attributes = 172, which is exactly the figure it
published. Its 172 was internally consistent and measured on an
incomplete walk — the failure mode this project keeps meeting, and the
reason §5 gates on a corpus census rather than on agreement between
two documents.

**`refs[]` is out of scope by ruling, not by neglect.** The body model
spec drops it: *"`refs` | **Dropped — derived at compile** (§5) | B7"*
([entry-body-model-design.md:115](2026-07-11-entry-body-model-design.md)).
The transform gate already excludes it for the same reason — *"`refs[]`
is dropped from truth (body model spec §5, B7) and holds machine
identifiers"* (`admin/pipeline/transform/no-new-text.ts`). Repairing a
field that does not survive compile would be work with no output.

### Scale, and why the predicate carries the safety burden

The fields the gates walk hold **1,349,919** ASCII quotes across
256,432 fields. All but 2,305 are HTML attribute delimiters or
ordinary punctuation. A rule that reached for `"` without the
Hebrew-flanked test would rewrite the corpus's markup wholesale.
Nothing downstream would catch it: the text gate strips tags before
comparing, so attribute damage is invisible to it, and the markup gate
compares a well-formedness delta rather than well-formedness.

```bash
bun -e 'const {fieldsOf}=await import("./admin/pipeline/transform/no-new-text.ts");
const Q=String.fromCharCode(34); let q=0,f=0;
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean))
  for(const s of fieldsOf(JSON.parse(l))){ f++; q+=s.split(Q).length-1; }
console.log(q,"ASCII quotes across",f,"fields");'
```

**Corrected 2026-08-24, and the correction is itself the lesson.** This
paragraph first read 1,310,492, which was measured on a hand-rolled
field walk that omitted `language_reference` — the field holding 39,198
of them, and the one this codebase has already been caught by once
(`h-cognate-self-link`). It was published with no reproducing command,
which is how it survived. The figure above walks `fieldsOf`, the single
enumeration both gates read, and prints the command that produces it.

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

**This probe's lazy read is scope-local. Do not reuse it as a general
resolution rule.** `([\s\S]*?)` stops at the first candidate split,
which is right here — the 68 quote-bearing headwords include **0**
ending in a roman numeral or a superscript, so nothing can be
truncated. Corpus-wide it is a different story: 2,871 headwords end in
a roman numeral and 807 in a superscript, both part of the headword,
and the lazy read resolves 65,817 of 73,468 Jastrow addresses against
a greedy read's 73,353. It does not merely lose 7,536 links — **1,131
addresses resolve under both reads and to DIFFERENT headwords**, so a
lazy general rule mis-points them silently. Task 4's census uses the
greedy read, and measured that it cannot mis-resolve here: of 22,906
distinct Jastrow addresses, 0 admit more than one valid headword
split, and 0 headwords end in a digit.

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
population; the exact figure is 180, two attributes on each of 90 tags.

### The locus partition, which is also the row split

Each row owns one locus, and the two partition the population exactly:

| Locus | Occurrences | Entries | Row |
|---|---:|---:|---|
| Document text | 2,125 | 1,386 | `ascii-quote-as-gershayim-in-body` |
| Tag interior | 180 | 85 | `gershayim-breaks-ref-attribute` |
| **Total** | **2,305** | **1,392 union** | |

79 entries carry both loci; 6 carry only the tag locus. The catalogued
85 for the attribute row is exact. The catalogued 1,290 for the text
row is the audit's narrower body-text scope and is corrected to 1,386
by the widening in §2 — a §6 write-back, not a discrepancy.

This is what lets the two rows ship as two `Rule` objects over one
shared predicate: `Rule.id` must name a single catalogue row, and
`transform:count` measures each row against its own count. One
predicate, one substitution, two loci, two ids.

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
the same 2,305 either way.

**And it must stay independent of `dir="rtl"`, which is not a
free choice.** Two of the 90 damaged anchors — `B00752` and `C01225` —
carry no `dir="rtl"` at all, so a predicate keyed to RTL context would
silently leave two broken link targets in place and still report a
clean run. The predicate reads codepoints only, and a unit test pins
both rids so a later "optimisation" that scopes the walk to RTL runs
fails a test rather than losing two repairs.

The predicate must also be written as **lookaround, with the
combining mark tolerated in the lookbehind** — `(?<=[HEBREW]̇*)"(?=[HEBREW])`.
§2 measures what the alternatives cost: a consuming pattern leaves
three occurrences unrepaired, a bare lookbehind leaves one.

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

**Case 5 — glyph correction.** Written against the RAW OPENING TAG,
not against the parsed target set, for a reason found while planning
and recorded here rather than discovered in review: **all 90 damaged
anchors parse as well-formed with silently truncated targets.**

```
malformed=false  dataRef="Jastrow, אל"  href="/Jastrow,_אל"
```

The value stops at the embedded quote. `opensScope` does not object,
because nothing about the tag is visibly malformed — this is the same
plausible-but-wrong parser reading that [#47](https://github.com/UniquePixels/jastrow/pull/47)
found, in the one form a parser cannot fix: a `"` inside a
`"`-delimited value is genuinely ambiguous, so the data is the only
place it can be repaired. It also means the input target set holds
`Jastrow, אל`, and a case 5 phrased as *"differs from an input target
by quote substitution"* would reject the correct output, which differs
from that truncated value by truncation as well.

So the contract is stated on bytes the parser cannot mangle: **an
output anchor's opening tag is licensed if, mapping every `״` back to
`"`, its token value is byte-identical to that anchor's opening tag in
the input.** Declared through a new `TransformResult.glyphCorrected`
field — `{ from, target }`, where `from` is the input tag value and
`target` the written one — so it is a rule author's assertion rather
than a silent widening, and reported like `composed` and `recombined`.

Fail-closed by construction, and tighter than the target-set phrasing
it replaces: every character except the substituted quotes is pinned,
so the case cannot move a link from one entry to another, cannot alter
a locus, and cannot recover an address the input did not spell out.

### 4.4 What the rule will not do

Glyph only, never slot. Some occurrences carry the mark in a minority
position (`הק"בה` 15 against `הקב"ה` 194); the rule corrects the
character in place and leaves the position alone.

**The register is 55 displaced and 45 undetermined — 100, not the 83
this spec first carried.** The audit's 49 / 34 was measured on a
narrower population than this batch repairs: applying its own slot
criterion to `dir="rtl"`-wrapped **body text** — nested
`senses[].definition`, `content.morphology` and `quotes[][]` — returns
**A 1,826 / B 49 / C 34**, reproducing all three cells of the audit's
sub-job table, which is how Task 0 identified what that scope had
been. Over the full in-scope text locus the same criterion returns
55 / 45. Both sets are listed by rid in the audit file, each labelled
with its scope.

The match is stronger than three cells: the same run reproduces all
six twin frequencies the audit names in passing (194, 19, 12, 14, 8,
6) and its `עכ"ום` 12 against `עכו"ם` 16. Those figures are
scope-sensitive — over the full in-scope locus they read 200, 19, 12,
15, 9, 6 — and were not fitted to, so matching seven independent
values is what makes this a scope identification rather than a
coincidence.

Moving the mark would source the repair from a *different token
elsewhere in the corpus*, which is the inference shape the
no-vowel-inference ruling forbids. It would also need its own dominance
threshold, and it would silently rewrite `עכ"ום`, which the audit flags
as possibly a genuine censorship-era variant rather than a defect —
`A00692` is one of the 90 broken attributes, so the two questions meet.

The 100 are recorded as residue in
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

- `ascii-quote-as-gershayim-in-body` — count reconciled to 2,305 in
  scope / 2,326 corpus-wide (the audit's 2,317 and this spec's first
  2,323 were both low; §2), `refs[]` scoped out under B7, the 100
  slot-residue occurrences recorded.
- `gershayim-breaks-ref-attribute` — the 90/90 cross-link result, and
  the note that it is not an independent row but the attribute face of
  its sibling. Its unit is stated explicitly: **90 anchors, 180
  occurrences, 85 entries.** The catalogued 85 is correct as an entry
  count and was reached by a walk that saw only 86 of the 90 anchors
  (§2), so the row is right for the wrong reason until this reason is
  written.

No withdrawal to `judgment` is expected. If the count reconciliation
turns up a population that is not the described defect, §6's mechanism
applies as it did for `h-cognate-self-link` in batch 2.

## 7. Risks

| Risk | Mitigation |
|---|---|
| The predicate catches a real quotation mark | 92 two-quote elements already hand-read in the audit; unit tests hold off Latin-flanked and mixed-script quotes |
| Case 5 widens the link gate too far | byte-identity of the whole opening tag under `״`→`"`; declared per call; no address enters that the input lacked |
| The truncated targets misled a shipped batch-2 rule | the 90 tags are checked against every registered rule's population before the batch closes |
| The 6-occurrence discrepancy hides a second shape | reconciled before the rule is written, and the finding recorded either way |
| Slot residue is read as "fixed" | recorded explicitly as residue in the audit file and in both rows' `reason` |

## 8. Decision log

| Date | Decision |
|---|---|
| 2026-08-24 | Batch 3 splits: 3a gershayim (this spec) ships before 3b italic & punctuation seams |
| 2026-08-24 | Gershayim widens to all surviving fields rather than body text alone; `refs[]` excluded under B7 |
| 2026-08-24 | `gershayim-breaks-ref-attribute` joins 3a; the two rows are one defect (90/90) |
| 2026-08-24 | Glyph only, never slot; the 100 displaced-or-undetermined occurrences (55 + 45) are recorded residue |
| 2026-08-24 | Link-target gate gains case 5, glyph correction, rather than exempting the rule |
| 2026-08-24 | Case 5 is stated on raw opening-tag bytes, not on parsed targets — the 90 damaged anchors parse well-formed with truncated targets (amended during planning) |
| 2026-08-24 | Two `Rule` objects over one shared predicate, partitioned by locus, so each catalogue row keeps its own id and its own count |
