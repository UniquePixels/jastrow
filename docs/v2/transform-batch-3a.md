# Transform batch 3a — gershayim

**Closed 2026-08-24** on `impl/phase-2-batch-3a`. Design:
[2026-08-24-gershayim-transform-design.md](../specs/2026-08-24-gershayim-transform-design.md).
Module contract: [2026-08-22-transform-module-design.md](../specs/2026-08-22-transform-module-design.md).

**Two rows, one defect, 2,305 occurrences repaired across 1,392
entries.** Jastrow's print sets Hebrew abbreviations with a gershayim
`״` (U+05F4); the corpus writes an ASCII `"`. In document text that is
a wrong character. Inside a `"`-delimited `href`/`data-ref` it also
terminates the attribute, so 90 link targets were silently truncated.
Both loci are repaired by **one predicate in one pass**, which is what
preserves the `data-ref` ↔ `headword` string identity the catalogue
audit warned about.

The registry now holds fifteen rules. `coverage()` accounts for all 78
catalogued transform rows: 15 registered, 63 pending, 0 unaccounted, 0
duplicated.

**Read §7 before quoting the headline number.** Every census figure in
§2 is measured on **pristine source**; the shipped pipeline runs
transforms on the entry *after* `applyRepairs`, and a pre-existing
rid-keyed repair collides with the attribute row there. §7 is the
batch's one unresolved finding and it needs a maintainer ruling.

---

## 1. What shipped

| Row | Repair | Occ | Entries | vs catalogue |
|---|---|---:|---:|---|
| `ascii-quote-as-gershayim-in-body` | glyph, document text | 2,125 | 1,386 | **1,290 → 1,386** |
| `gershayim-breaks-ref-attribute` | glyph, tag interiors, gate case 5 | 180 | 85 (90 anchors) | MATCH (85) |
| **total** | | **2,305** | **1,392 union** | |

79 entries carry both loci, 6 carry only the tag locus. The catalogued
85 for the attribute row is exact; the 1,290 for the text row is the
audit's narrower `dir=rtl` body-text scope, corrected by this batch's
widening (§6).

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
console.log("text",tO,"/",tE.size,"entries | tag",gO,"/",gE.size,"entries in",tags.size,"tags");'
```

```
corpus-wide 2326 in 1392 entries | in scope 2305
text 2125 / 1386 entries | tag 180 / 85 entries in 90 tags
```

### The shape of the change

One predicate, `(?<=HEBREW_ATOM)"(?=[HEBREW])`, applied to the **raw
field string** before tag stripping. `gershayim.ts` masks `<[^<>]*>`
runs and exposes `repairText` (everything outside them) and
`repairTags` (only inside them); `rules/gershayim.ts` builds both rules
from one shared factory whose only difference is what they declare.
The predicate reads codepoints and nothing else — no `dir="rtl"`, no
tag name, no parsed attribute value — which is load-bearing: two of the
90 damaged anchors (`B00752`, `C01225`) carry no `dir` attribute at
all, so an RTL-scoped walk would leave two broken targets standing and
still report a clean run.

Four pieces of machinery were added or extended for it:

- **`Anchor.tag`** (`links.ts`) — the raw opening-tag token value. The
  gate cannot use `dataRef`/`href` for this purpose because for exactly
  these 90 anchors the parsed values are silently truncated (§7 of the
  design; §2 below).
- **`TransformResult.glyphCorrected`** (`types.ts`) — `{ from, target }`,
  declared per repaired tag, reported like `composed` and `recombined`.
- **Link-target gate case 5, glyph correction** (`link-target.ts`) —
  stated on raw opening-tag bytes: a written tag is licensed if mapping
  every `״` back to `"` makes it byte-identical to an opening tag the
  entry's own input held. Hardened during review with a multiplicity
  cap (a claim cannot license more anchors than the input carried) and
  a Hebrew-flanking requirement on every written `״` (so a claim can
  never convert an attribute *delimiter* — a delimiter always abuts `=`,
  whitespace or `>` and is never Hebrew-flanked). Both hardenings cost
  zero on the corpus: the 90 anchors are 88 distinct tags counted per
  entry, worst multiplicity 2 in 2 entries, so no claim is
  over-subscribed, and all 176 marks those tags receive are
  Hebrew-flanked.

```bash
bun -e '
const {readSourceEntries}=await import("./admin/pipeline/body/source.ts");
const {tokenize}=await import("./admin/pipeline/transform/html.ts");
const {anchors}=await import("./admin/pipeline/transform/links.ts");
const {fieldsOf}=await import("./admin/pipeline/transform/no-new-text.ts");
const {repairTags}=await import("./admin/pipeline/transform/gershayim.ts");
let claims=0, marks=0, worst=0, dup=0;
for await (const e of readSourceEntries()){
  const ts=fieldsOf(e).flatMap(f=>anchors(tokenize(f)).map(a=>a.tag)).filter(t=>repairTags(t)!==t);
  if(ts.length===0)continue;
  const m=new Map(); for(const t of ts) m.set(t,(m.get(t)??0)+1);
  claims+=m.size; if([...m.values()].some(v=>v>1))dup++;
  worst=Math.max(worst,...m.values());
  for(const t of m.keys()) marks+=[...repairTags(t)].filter(c=>c==="״").length; }
console.log({perEntryDistinctTags:claims, marksInThoseTags:marks, worstMultiplicity:worst, entriesWithADuplicateTag:dup});'
```

```
{ perEntryDistinctTags: 88, marksInThoseTags: 176,
  worstMultiplicity: 2, entriesWithADuplicateTag: 2 }
```
- **`entangledClusters()`** (`registry.ts`) — see §8.2.

## 2. The link-integrity headline

The design's §5 gate is the number the batch rests on: resolve every
`data-ref` against the set of entry headwords, before and after the
pass. It ships as a test rather than a probe
(`admin/pipeline/transform/rules/gershayim.test.ts`, corpus tier), so a
narrowed predicate fails `bun qa` rather than a report.

```bash
bun test admin/pipeline/transform/rules/gershayim.test.ts
```

```
18 pass
0 fail
2839 expect() calls
```

The census test asserts one object:

```
after:               73,443
anchorDrift:              0
anchors:            170,182
before:              73,353
gained:                  90
gainedNotRewritten:      []
gershayimAfter:       2,305
gershayimBefore:          0
lost:                    []
rewritten:               90
rewrittenNotGained:      []
```

| Claim | Result |
|---|---|
| every target that resolved before still resolves after | `lost: []` — **0 regressions** |
| resolving targets rise by exactly 90 | 73,353 → 73,443 |
| the 90 that newly resolve are the 90 rewritten | `gainedNotRewritten: []` **and** `rewrittenNotGained: []` — the sets are identical, matched by rid *and* walk position |
| the corpus holds 0 `״` before and 2,305 after | 0 → 2,305 |
| the pair never adds or drops an anchor | `anchorDrift: 0` over 32,512 entries |

Two independent routes reach the same 90: the design's §3 probe matched
broken targets against quote-bearing headword *strings*; the census
matches repaired anchors against the healed headword *set* through the
shipped rules. The 90 are also exactly the 90 Jastrow `data-ref`s in
the whole corpus that fail to parse at all — a truncated value carries
no sense number — which is a third arrival at the same population.

**All 90 parse `malformed: false`.** That is why case 5 is written on
bytes:

```
malformed=false  dataRef="Jastrow, אל"  href="/Jastrow,_אל"
```

`opensScope` objects to nothing; the value simply stops at the embedded
quote. A `"` inside a `"`-delimited value is genuinely ambiguous, so
the parser cannot fix it and the data is the only place it can be
repaired. It also means the input target set holds the truncated
`Jastrow, אל`, so a case 5 phrased on parsed targets would reject the
correct output — which differs from that value by truncation as well as
by substitution.

**These figures are measured on pristine source. See §7 for what the
shipped pipeline does instead.**

## 3. What it declined — residue, not coverage

**Glyph only, never slot.** Some occurrences carry the mark in a
minority position (`הק"בה` 15 against `הקב"ה` 194). The rule corrects
the character in place and leaves the position alone.

| Class | Occ | Types |
|---|---:|---:|
| A — mark already in the canonical (penultimate) slot | 2,019 | |
| **B — displaced**: a same-skeleton twin holds the canonical slot more often | **55** | 16 |
| **C — undetermined**: no dominant canonical twin | **45** | 33 |
| total tokenised, in-scope text locus | 2,119 | |

**100 occurrences are left with the mark in the wrong slot**, and they
are recorded as residue rather than counted as coverage. Reproduce with
the `SCOPE`-switched register printed in
[`catalogue-audit/ascii-quote-as-gershayim-in-body.md`](../../data/patches/catalogue-audit/ascii-quote-as-gershayim-in-body.md)
("The decline register"):

```
SCOPE=all     A 2019 | B 55 occ / 16 types | C 45 occ / 33 types | total 2119
SCOPE=audit   A 1820 | B 49 occ / 12 types | C 34 occ / 29 types | total 1903
```

The audit's riders published **49 / 34**, and those reproduce exactly —
but only on the narrower `dir=rtl`-wrapped body-text scope they were
measured on. Over the locus this batch actually repairs the same
criterion returns **55 / 45**. Task 0 identified that scope by
reproducing all three cells of the audit's sub-job table
(A 1,826 / B 49 / C 34) *plus* seven twin frequencies the audit names
only in passing, none of which was fitted to.

Why they are left: moving a mark would source the repair from a
**different token elsewhere in the corpus**, which is the inference
shape the no-vowel-inference ruling forbids; it would need a dominance
threshold that a 16-to-14 twin cannot supply; and it would change token
identity, breaking the `data-ref` ↔ `headword` match this batch exists
to preserve. The `עכ"ום` family is flagged undetermined regardless of
which column the mechanical test puts it in — the audit reads it as a
possible censorship-era variant, and `A00692` is one of the 90 broken
attributes, so the two questions meet.

**`refs[]` is out of scope by ruling, not by neglect.** Its 21
occurrences are measured and excluded: the body model spec drops
`refs[]` at compile (§5, B7), and the transform gate already excludes
it for the same reason. Repairing a field that does not survive compile
would be work with no output.

## 4. `bun transform:count`

Before this task's write-backs — the evidence they were made from:

```
ascii-quote-as-gershayim-in-body       measured(entries)= 1386 catalogued= 1290  DELTA +96
gershayim-breaks-ref-attribute         measured(entries)=   85 catalogued=   85  MATCH

15 rule(s), 3 mismatch(es).
```

After them, **15 rules, 13 MATCH, 2 findings, and both findings are
batch 2's**:

```
$ bun transform:count
redundant-outer-rtl-span               measured(entries)=  529 catalogued=  529  MATCH
bare-rtl-hebrew                        measured(entries)= 4189 catalogued= 4189  MATCH
latin-token-inside-rtl-span            measured(entries)=  130 catalogued=  130  MATCH
apparatus-cite-linked-as-scripture     measured(entries)=    8 catalogued=    8  MATCH
rabbi-name-linked-as-bible-book        measured(entries)=   42 catalogued=   42  MATCH
ellipsis-fragment-anchored             measured(entries)=   80 catalogued=   80  MATCH
geresh-letter-numeral-mislink          measured(entries)=  475 catalogued=  475  MATCH
prefixed-geresh-abbrev-mislink         measured(entries)=  173 catalogued=  173  MATCH
plural-to-feminine-final-letter-mislink measured(entries)=   50 catalogued=   50  MATCH
shuruk-as-yod-display-corruption       measured(entries)=   12 catalogued=   12  MATCH
ib-yoma-2a                             measured(entries)=  188 catalogued=  312  DELTA -124
sifre-ib-resolves-to-yalkut            measured(entries)=    1 catalogued=    6  DELTA -5
ib-targum-work-loss                    measured(entries)=    8 catalogued=    8  MATCH
ascii-quote-as-gershayim-in-body       measured(entries)= 1386 catalogued= 1386  MATCH
gershayim-breaks-ref-attribute         measured(entries)=   85 catalogued=   85  MATCH

15 rule(s), 2 mismatch(es).
```

`ib-yoma-2a` −124 and `sifre-ib-resolves-to-yalkut` −5 are batch 2's
designed findings (a catalogued occurrence count against an entry
measurement, and a decline census). **They are unchanged to the
digit**, which is the check that matters here: a shift on either would
mean this batch moved something it should not have.

## 5. `bun body:migrate-dry`

```
entries=32512 repaired=832
binyan-cleanup: 938 record(s) across 751 entries
marker-reinsert: 14 record(s) across 14 entries
rejoin-chopped: 36 record(s) across 36 entries
cite-escape: 21 record(s) across 21 entries
implied-one: 4 record(s) across 4 entries
label-repair: 6 record(s) across 6 entries
refs-removal: 3 record(s) across 3 entries
cite-wrap: 3 record(s) across 3 entries
gate formSection=32512/32512
gate lettered=32512/32512
gate rejoin=32512/32512
gate units=32512/32512
brokenTopSequences=34
startsAtTwo=8
labelQuarantines=0
binyanEmptyOrUntrimmed=0
schemaFailures=0
repairFailures=0
transformFailures=0
patchCorpus=0 patchesApplied=0 patchProblems=0
unresolvedRepairedOrphans=0
deferred=3 confirmedNoChange=19
transform redundant-outer-rtl-span: 531 instance(s)
transform bare-rtl-hebrew: 4516 instance(s)
transform latin-token-inside-rtl-span: 131 instance(s)
transform apparatus-cite-linked-as-scripture: 8 instance(s)
transform rabbi-name-linked-as-bible-book: 42 instance(s)
transform ellipsis-fragment-anchored: 80 instance(s)
transform geresh-letter-numeral-mislink: 481 instance(s)
transform prefixed-geresh-abbrev-mislink: 174 instance(s)
transform plural-to-feminine-final-letter-mislink: 50 instance(s)
transform shuruk-as-yod-display-corruption: 12 instance(s)
transform ib-yoma-2a: 189 instance(s)
transform sifre-ib-resolves-to-yalkut: 1 instance(s)
transform ib-targum-work-loss: 8 instance(s)
transform ascii-quote-as-gershayim-in-body: 1386 instance(s)
transform gershayim-breaks-ref-attribute: 65 instance(s)
```

**32,512/32,512 on all four round-trip gates; 0 schema failures, 0
quarantines, 0 repair failures, 0 transform failures, 0 unresolved
repaired orphans.** Every batch-2 instance count is unchanged.

**One line disagrees with §1 and it is not cosmetic:**
`gershayim-breaks-ref-attribute` reads **65** here against the 85 the
rule fires on in isolation. That is §7.

## 6. Catalogue write-backs

Surgical. `renderPatterns()` was never called — it emits compact JSON
while the file uses spaced separators, so it would reformat all 149
rows. The serializer used instead was verified to round-trip the two
target lines byte for byte before any edit, and the diff is two lines:

```bash
git diff --stat -- data/patches/patterns.jsonl
```

```
 data/patches/patterns.jsonl | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
```

| Row | Field | Change |
|---|---|---|
| `ascii-quote-as-gershayim-in-body` | `corpusCount` | 1,290 → **1,386** |
| `ascii-quote-as-gershayim-in-body` | `reason` | the widening, the `refs[]` exclusion, the locus partition, the reconciliation, the residue, the §7 carry |
| `gershayim-breaks-ref-attribute` | `reason` | the unit, the 90/90, `malformed: false`, the census, the §7 collision |

Both rows already gained an `entangledWith` naming the other, and the
attribute row its first `reason`, in Task 3 — written **before** the
rules were registered, for the reason in §8.2.

**`ascii-quote-as-gershayim-in-body` 1,290 → 1,386 is a SCOPE
correction, not population growth.** The audit measured entries with at
least one Hebrew-flanked quote in `dir=rtl` body text. This batch
repairs every field that survives compile — `headword`,
`alt_headwords[]`, `plural_form[]`, `language_code`,
`language_reference`, `quotes[][]`, `content.morphology`, and each
sense's `definition`, `number` and `grammar.*`, nested sub-senses
included — minus `refs[]` under B7. The +96 entries are ones whose only
gershayim lives outside the audit's window.

`gershayim-breaks-ref-attribute` stays at 85 and the row is now right
for the right reason. The catalogued 85 was reached by a walk that
recursed only into top-level `senses[].definition` and saw **86 of the
90 anchors** (86 × 2 = 172, exactly the figure the audit published),
missing four in nested sub-senses — `B00752`, `M01801`, `J00552`,
`V00773` — none of whose entries had a top-level damaged anchor either,
which is why that walk also reported 81 entries rather than 85. The
unit is now stated on the row: **90 anchors / 180 occurrences / 85
entries.**

## 7. The collision, found at batch close and NOT resolved

**`repairs.ts` already repairs 22 of the 90 damaged anchors, by a
different mechanism, and the two mechanisms disagree about what the
repaired byte should be.**

`migrate-dry` runs `applyRepairs` first and transforms on the **healed**
entry (transform spec §2, "Placement"). Among those repairs is
`cite-escape` — a pre-existing, rid-keyed pass under "02 — orphan refs,
class 1" (`repairs.ts`, `CITE_ESCAPES`, 21 entries) whose docstring
reads: *"Escape the gershayim `"` inside the malformed anchor's
href/data-ref attribute values as `&quot;` so both attributes parse to
the full ref."* It is the same defect, found earlier, fixed by
escaping rather than by correcting.

By the time `gershayim-breaks-ref-attribute` runs, those anchors carry
no ASCII quote at all — they carry `&quot;` — so the predicate does not
see them.

```bash
bun -e '
const {readSourceEntries}=await import("./admin/pipeline/body/source.ts");
const {applyRepairs}=await import("./admin/pipeline/body/repairs.ts");
const {fieldsOf}=await import("./admin/pipeline/transform/no-new-text.ts");
const {tokenize}=await import("./admin/pipeline/transform/html.ts");
const {anchors}=await import("./admin/pipeline/transform/links.ts");
const {repairTags}=await import("./admin/pipeline/transform/gershayim.ts");
const dmg=(x)=>fieldsOf(x).flatMap(f=>anchors(tokenize(f)).map(a=>a.tag)).filter(t=>repairTags(t)!==t);
let p=0,h=0,pe=0,he=0;
for await (const e of readSourceEntries()){ const a=dmg(e).length, b=dmg(applyRepairs(e).entry).length;
  p+=a; h+=b; if(a>0)pe++; if(b>0)he++; }
console.log("damaged anchors: pristine",p,"| after applyRepairs",h,"|| entries:",pe,"->",he);'
```

```
damaged anchors: pristine 90 | after applyRepairs 68 || entries: 85 -> 65
```

**22 anchors across 21 entries** are neutralised (one entry, `C01224`,
keeps a second damaged anchor, which is why the rule's entry count
falls to 65 rather than 64). That is the whole of the `65 instance(s)`
line in §5.

### The part that matters

`&quot;` is not a gershayim; it is an escaped ASCII quote, and the
pipeline itself says so — `migrate-dry.ts:121` reads `data-ref` values
back with `.split('&quot;').join('"')` when checking that the repaired
orphan refs still have an in-body citation basis. Under the pipeline's
own reading, those 22 targets still decode to a **quote**, while
`ascii-quote-as-gershayim-in-body` has corrected their target
headwords to a **gershayim**. Measured through the real pipeline
(`applyRepairs` then the full registry), with and without the two new
rules, decoding `&quot;` as the pipeline does:

```bash
bun -e '
const {readSourceEntries}=await import("./admin/pipeline/body/source.ts");
const {applyRepairs}=await import("./admin/pipeline/body/repairs.ts");
const {applyTransforms}=await import("./admin/pipeline/transform/run.ts");
const {RULES}=await import("./admin/pipeline/transform/registry.ts");
const {fieldsOf}=await import("./admin/pipeline/transform/no-new-text.ts");
const {tokenize}=await import("./admin/pipeline/transform/html.ts");
const {anchors}=await import("./admin/pipeline/transform/links.ts");
const NEW=new Set(["ascii-quote-as-gershayim-in-body","gershayim-breaks-ref-attribute"]);
const OLD=RULES.filter(r=>!NEW.has(r.id));
const REF=/^Jastrow, (.+) (\d+)$/u;
const es=[]; for await (const e of readSourceEntries()) es.push(e);
const run=(rules)=>es.map(e=>applyTransforms(applyRepairs(e).entry,"text-repairs",rules).entry);
const score=(corp)=>{const hw=new Set(corp.map(e=>e.headword)); const keys=new Set(); let i=0;
  for(const e of corp) for(const f of fieldsOf(e)) for(const a of anchors(tokenize(f))){
    const v=a.dataRef.split("&quot;").join(String.fromCharCode(34));
    if(!v.startsWith("Jastrow, "))continue; const k=e.rid+"|"+(i++);
    const m=REF.exec(v); if(m&&hw.has(m[1]))keys.add(k); }
  return keys;};
const b=score(run(OLD)), a=score(run(RULES));
console.log("before",b.size,"| after",a.size,
  "| gained",[...a].filter(k=>!b.has(k)).length,"| LOST",[...b].filter(k=>!a.has(k)).length);'
```

```
before 72525 | after 72571 | gained 68 | LOST 22
```

**Through the shipped pipeline the batch gains 68 cross-links and loses
22, not "gains 90 and loses 0".** The 22 resolved before this batch —
`cite-escape` had made them whole — and do not resolve after it,
because their headword moved and their target did not. This is exactly
the failure the audit warned about, reached by a path nobody looked at:
the repairs layer.

Read without decoding the entity, the same census reports
`gained 68 | lost 0`, because the raw `Jastrow, א&quot;ט 1` matched no
headword under either reading. Which of the two is the truth depends on
whether the still-unwritten `compile` decodes the entity. The pipeline's
one existing statement on the question decodes it.

### Why the census could not see this

`rules/gershayim.test.ts`'s census applies the rules to **pristine
source**, which is right for measuring a rule and wrong for describing
a pipeline. Both figures are true of what they measure. The gap between
them is the finding.

### What is NOT being done here, and why

Three fixes are available and all three are maintainer decisions, not
batch-close decisions:

1. **Retire `cite-escape` class 1** and let the general rule own all
   90. But `unresolvedRepairedOrphans` is gated on
   `REPAIRED_ORPHAN_ITEMS`, whose literal items carry the ASCII quote,
   so retiring the pass without rewriting that table fails the gate.
2. **Widen the rule's predicate to `&quot;` between Hebrew letters.**
   Same gate problem, from the other side: the repaired items would
   then read `Jastrow, א״ט 1` and stop matching the table.
3. **Decide that `&quot;` is the intended encoding** and correct the
   *headwords* to match — which contradicts the whole batch.

Either of the first two also raises the question of whether a rid-keyed
repair should survive at all once a general rule covers its population.
That is the same "which mechanism owns this defect" question the
catalogue exists to answer, and it is recorded on both rows'
`reason` and here rather than settled by whoever closed the batch.

## 8. Findings that must outlive the task reports

### 8.1 The counting bug and the rewriting bug are the same bug

Three readings of the same predicate over the same fields:

```bash
bun -e 'const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const {fieldsOf}=await import("./admin/pipeline/transform/no-new-text.ts");
const {readSourceEntries}=await import("./admin/pipeline/body/source.ts");
const Q=String.fromCharCode(34);
const CONSUME=new RegExp("["+HEBREW+"]"+Q+"["+HEBREW+"]","gu");
const BARE=new RegExp("(?<=["+HEBREW+"])"+Q+"(?=["+HEBREW+"])","gu");
const ATOM=new RegExp("(?<=["+HEBREW+"]\\u0307*)"+Q+"(?=["+HEBREW+"])","gu");
let c=0,b=0,a=0;
for await (const e of readSourceEntries()) for(const f of fieldsOf(e)){
  c+=[...f.matchAll(CONSUME)].length; b+=[...f.matchAll(BARE)].length; a+=[...f.matchAll(ATOM)].length; }
console.log("consuming",c,"| bare lookbehind",b,"| atom-aware",a);'
```

```
consuming 2302 | bare lookbehind 2304 | atom-aware 2305
```

A consuming `[HEBREW]"[HEBREW]` predicate matches `X"Y` in `X"Y"Z` and
resumes past `Y`, so the second quote is never examined — two
occurrences hide there (`A00253`, `U01408`). A bare lookbehind loses
one more: `M01940` puts U+0307 between the letter and the quote.

**A rule built on the consuming pattern would have reported a clean run
over an incomplete repair.** The same three occurrences that made the
count wrong are the ones the rewrite would have skipped, and nothing
downstream distinguishes "repaired everything it saw" from "repaired
everything". This is why the shipped predicate is lookaround with the
combining mark tolerated, and why `HEBREW_ATOM` was exported from
`html.ts` rather than restated: one definition of "a Hebrew letter with
its marks".

The reconciliation that produced 2,305 closed with **zero residual**,
and both earlier readings were low — the audit's 2,317 by 9 (its
attribute probe's recursion depth, §6, plus a rider quoting 1,907 where
its own disposition said 1,908) and the design spec's first 2,323 by 3
(the two traps above). Full working in the audit file under
"Reconciliation, 2026-08-24".

### 8.2 `checkAdjacency()` could pass vacuously, and for 57 pending rows it still can

`checkAdjacency()` builds each rule's entanglement cluster from the
catalogue's `entangledWith` graph and skipped any cluster with fewer
than two **registered** members. Before Task 3 neither gershayim row
named the other, so registering the pair adjacent would have satisfied
the gate no matter where in `RULES` the two rules sat — including at
opposite ends. **This was live for the already-shipped rtl trio**, not
a hypothetical.

The fix makes it falsifiable rather than merely correct: a derived
`entangledClusters(catalogue, rules)` is exported and used by both the
production gate and the tests, and `registry.order.test.ts` now asserts
(1) the derived cluster set equals a pinned list of three, so stripping
an edge fails, and (2) each cluster occupies a gap-free span, so
scattering fails. The two mutations fail *different* assertions, which
is why both exist; both were mutation-proved against the live catalogue
and registry.

**What remains open, and it is catalogue work rather than transform
work:** the gate reads `entangledWith` and nothing else, so a row
carrying no edge is a singleton it cannot judge.

```bash
bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
import {PENDING} from "./admin/pipeline/transform/registry.ts";
const rows=await parsePatterns(await Bun.file("data/patches/patterns.jsonl").text());
const by=new Map(rows.map(r=>[r.id,r]));
const noEdge=[...PENDING].filter(id=>(by.get(id)?.entangledWith??[]).length===0);
console.log("PENDING:",PENDING.length,"| no edge:",noEdge.length);'
```

```
PENDING: 63 | no edge: 57
```

**57 of the 63 pending rows carry no edge at all**, so for most of the
work ahead the gate is unfalsifiable by construction. A clean run means
"no RECORDED entanglement is split", never "no entanglement is split".
Carried into
[phase-2-triage.md](phase-2-triage.md#sequencing-advice) as open. The
cheapest guard that needs no catalogue edge remains the both-orders
corpus comparison, which this batch ran and which returned 0 entries
differing by a byte.

### 8.3 The design's §3 probe reads its headword lazily, and that is scope-local

§3's cross-link probe extracts the headword with `([\s\S]*?)` and an
optional roman group. That is correct where it is used — the 68
quote-bearing headwords include 0 ending in a roman numeral or a
superscript, so nothing can be truncated — and **wrong as a general
resolution rule**, because 2,871 corpus headwords end in a roman
numeral and 807 in a superscript, both part of the headword string.

```bash
bun -e '
const {readSourceEntries}=await import("./admin/pipeline/body/source.ts");
const {tokenize}=await import("./admin/pipeline/transform/html.ts");
const {anchors}=await import("./admin/pipeline/transform/links.ts");
const {fieldsOf}=await import("./admin/pipeline/transform/no-new-text.ts");
const es=[]; for await (const e of readSourceEntries()) es.push(e);
const hw=new Set(es.map((e)=>e.headword));
const GREEDY=/^Jastrow, (.+) (\d+)$/u;
const LAZY=/^Jastrow,\s([\s\S]*?)\s(?:[IVXL]+\s)?\d+$/u;
let jas=0,g=0,l=0,both=0,diff=0;
for(const e of es) for(const f of fieldsOf(e)) for(const a of anchors(tokenize(f))){
  const v=a.dataRef; if(!v.startsWith("Jastrow, "))continue; jas++;
  const m=GREEDY.exec(v), n=LAZY.exec(v);
  const gh=m&&hw.has(m[1])?m[1]:null, lh=n&&hw.has(n[1])?n[1]:null;
  if(gh)g++; if(lh)l++; if(gh&&lh){both++; if(gh!==lh)diff++;} }
console.log({jastrowAnchors:jas, greedyResolves:g, lazyResolves:l, resolveUnderBoth:both, andToDifferentHeadwords:diff});'
```

```
{ jastrowAnchors: 73468, greedyResolves: 73353, lazyResolves: 65817,
  resolveUnderBoth: 65817, andToDifferentHeadwords: 1131 }
```

It does not merely lose 7,536 honest links: **1,131 addresses resolve
under both reads and to DIFFERENT headwords**, so a lazy general rule
mis-points them silently. The census therefore uses the greedy read,
and the greedy read is measured to be unambiguous here:

```bash
bun -e '
const {readSourceEntries}=await import("./admin/pipeline/body/source.ts");
const {tokenize}=await import("./admin/pipeline/transform/html.ts");
const {anchors}=await import("./admin/pipeline/transform/links.ts");
const {fieldsOf}=await import("./admin/pipeline/transform/no-new-text.ts");
const es=[]; for await (const e of readSourceEntries()) es.push(e);
const hw=new Set(es.map(e=>e.headword));
const addrs=new Set();
for(const e of es) for(const f of fieldsOf(e)) for(const a of anchors(tokenize(f)))
  if(a.dataRef.startsWith("Jastrow, ")) addrs.add(a.dataRef);
let multi=0;
for(const v of addrs){ const body=v.slice(9); let n=0;
  for(let i=0;i<body.length;i++)
    if(body[i]===" "&&/^\d+$/u.test(body.slice(i+1))&&hw.has(body.slice(0,i))) n++;
  if(n>1) multi++; }
console.log({headwords:es.length, romanEnding:es.filter(e=>/\s[IVXL]+$/u.test(e.headword)).length,
  superscript:es.filter(e=>/[²³¹⁰-⁹]/u.test(e.headword)).length,
  endsInDigit:es.filter(e=>/\d$/u.test(e.headword)).length,
  distinctJastrowAddresses:addrs.size, addressesWithMoreThanOneValidSplit:multi});'
```

```
{ headwords: 32512, romanEnding: 2871, superscript: 807, endsInDigit: 0,
  distinctJastrowAddresses: 22906, addressesWithMoreThanOneValidSplit: 0 }
```

Of 22,906 distinct Jastrow addresses, **0** admit more than one valid
headword split, and **0** headwords end in a digit — so the greedy read
has exactly one candidate everywhere it resolves. The design carries a
note saying the probe is
scope-local; this is the number behind it, and the census docstring
records both readings so they do not get "unified" later.

### 8.4 The shipped-rule scan closes negative, under composition as well as in isolation

Design §7's risk row — *"the truncated targets misled a shipped batch-2
rule"* — is **closed negative**. The 90 truncations sat in the corpus
through batches 1 and 2 without any registered rule reading them.

```bash
bun -e '
const {readSourceEntries}=await import("./admin/pipeline/body/source.ts");
const {RULES}=await import("./admin/pipeline/transform/registry.ts");
const {applyTransforms}=await import("./admin/pipeline/transform/run.ts");
const {tokenize}=await import("./admin/pipeline/transform/html.ts");
const {anchors}=await import("./admin/pipeline/transform/links.ts");
const {fieldsOf}=await import("./admin/pipeline/transform/no-new-text.ts");
const {repairTags}=await import("./admin/pipeline/transform/gershayim.ts");
const NEW=new Set(["ascii-quote-as-gershayim-in-body","gershayim-breaks-ref-attribute"]);
const OLD=RULES.filter(r=>!NEW.has(r.id));
const bad=(e)=>fieldsOf(e).flatMap((f)=>anchors(tokenize(f)).map((a)=>a.tag)).filter((t)=>repairTags(t)!==t);
const dmg=[]; for await (const e of readSourceEntries()) if(bad(e).length>0) dmg.push(e);
console.log("damaged entries:",dmg.length,"| damaged tags:",dmg.reduce((n,e)=>n+bad(e).length,0));
for(const r of OLD){ let fired=0,moved=0;
  for(const e of dmg){ const b=bad(e), o=r.apply(e);
    if(o.records.length>0)fired++;
    if(JSON.stringify(b)!==JSON.stringify(bad(o.entry)))moved++; }
  if(fired>0||moved>0)console.log(" ",r.id,"records:",fired,"| damaged tags changed:",moved); }
let composed=0;
for(const e of dmg){ const b=bad(e); const o=applyTransforms(e,"text-repairs",OLD).entry;
  if(JSON.stringify(b)!==JSON.stringify(bad(o)))composed++; }
console.log("COMPOSED (whole pre-existing registry in sequence): damaged tags changed in",composed,"of",dmg.length,"entries");'
```

```
damaged entries: 85 | damaged tags: 90
  redundant-outer-rtl-span records: 2 | damaged tags changed: 0
  bare-rtl-hebrew records: 12 | damaged tags changed: 0
  geresh-letter-numeral-mislink records: 3 | damaged tags changed: 0
  ib-yoma-2a records: 2 | damaged tags changed: 0
COMPOSED (whole pre-existing registry in sequence): damaged tags changed in 0 of 85 entries
```

Four rules do work in 19 of the 85 damaged entries, and **none of them
changes a single one of the 90 damaged opening tags** — byte-identical
before and after, rule by rule and composed. A per-anchor scan adds
that no truncated value was ever propagated: the one rule that changes
an anchor count, `geresh-letter-numeral-mislink`, is an unlink rule
removing a *different* anchor, and the truncated-ref count is unchanged
in all three of its entries.

The distinction is worth keeping: "produced a record on a damaged
entry" is not "acted on a truncated target", and the coarse reading
answers "four rules fire", which sounds alarming and is not.

### 8.5 Order freedom, measured rather than argued

| Comparison | Entries differing |
|---|---:|
| `gershayimInBody` → `gershayimRefAttribute` vs. the reverse | **0** of 32,512 |
| rtl trio → pair vs. pair → rtl trio | **0** of 32,512 |
| whole registry with the pair last vs. the pair first | **0** of 32,512 |

The first two are tests in `rules/gershayim.test.ts` and run on every
`bun qa`; the third was a throwaway four-pass run recorded in the design
§4.2. This answers the audit's ordering rider — *"if bare-rtl-hebrew
runs first and wraps its 117, they migrate into this row's scope"* —
with a measurement: wrapping bare Hebrew in a `<span dir="rtl">` moves
no quote across the boundary between document text and tag interior,
because the predicate reads codepoints and the quote's own neighbours
are unchanged.

The two loci are not merely disjoint. Over all 32,512 entries and
256,432 walked fields, `repairTags(repairText(f))` ===
`repairText(repairTags(f))` === a single unrestricted pass, with 0
length changes anywhere: together they are exactly the whole
population, in either order.

## 9. Concerns

1. **§7 is unresolved and it is the batch's headline caveat.** The
   pipeline gains 68 and loses 22 where the census says +90 / −0. It
   needs a maintainer ruling on which mechanism owns the defect. Until
   then, quoting "+90" without §7 beside it overstates what ships.
2. **The census measures rules, not the pipeline, and nothing in the
   suite measures the pipeline.** `migrate-dry` counts records and
   never scores link resolution, so the collision surfaced only because
   one instance count was read against the isolated figure. A
   pipeline-level link census — `applyRepairs` then transforms — would
   have caught it at Task 4 and would catch the next one. Recommended
   for CP-2, not opened here.
3. **`gershayim-breaks-ref-attribute` is `blocking: true` and its
   pipeline coverage is 65 of 85 entries.** If the cutover gate is read
   as "this row is fixed", that reading is wrong until §7 is settled.
4. **The `allows: ['״']` blast radius is bounded by the predicate, not
   by the corpus.** The reasoning that "U+05F4 occurs 0 times in the
   input" is false under composition — once `gershayimInBody` has run,
   the second rule's input holds 2,125 of them. The argument that
   survives is about the substitution: the rule only ever writes a `״`
   where it removed a `"`, in place, one for one. The corpus fact is
   kept as what makes the count checkable, not as what makes the
   allowance safe.
5. **The gate's `FLANKED_GERSHAYIM` is deliberately narrower than the
   rule's predicate** on three remaining points — presentation forms
   U+FB1D–U+FB4F, `׳`/`״` as flanks, and bare points as bases. Cost
   today is 0 of 180. If a future corpus puts one of those inside a
   tag, the pipeline fails **closed** at the gate rather than
   mis-repairing, and the fix is a measurement plus a test, never an
   import of `HEBREW_ATOM`.
6. **Case 5 licenses a TAG, not an ADDRESS.** A rule that corrected the
   glyph while also pointing at the wrong entry would be licensed,
   because the case asks only whether the bytes moved. Correct for a
   glyph rule, wrong for anything else, which is why the case is keyed
   to an exact substitution rather than to a rule id. The multiplicity
   cap bounds how many anchors a claim reaches, not which ones.
7. **A correction to Task 4's report, which is deleted with the
   workspace.** It states that a `bun test` command naming a
   nonexistent file *"would have reported no tests found as a PASS"*.
   That was reasoned, not measured, and it is **false**: `bun test`
   exits 1 on a missing file in both filter and path form. The brief
   did name a nonexistent file (`rules/gershayim.corpus.test.ts`; the
   corpus tier lives in `rules/gershayim.test.ts`), but it fails
   closed.
8. **`brokenTopSequences=34` and `startsAtTwo=8`** are unchanged
   pre-existing `migrate-dry` observations, not gate failures, and
   belong to other rows.

---

## Verification, reproducible

```bash
bun qa                  # format, lint, test, tsc — exit 0
bun transform:count     # 15 rules; the two surviving deltas are batch 2's — §4
bun body:migrate-dry    # §5 — and the 65-instance line that opens §7
bun test admin/pipeline/transform/rules/gershayim.test.ts     # the census — §2
bun test admin/pipeline/transform/registry.order.test.ts      # cluster derivation — §8.2
bun test admin/pipeline/transform/link-target.test.ts         # gate case 5
```
