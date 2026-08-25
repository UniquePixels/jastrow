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

The registry now holds fifteen rules. `coverage()` accounts for all 77
catalogued transform rows: 15 registered, 62 pending, 0 unaccounted, 0
duplicated. It read 78 / 63 when the rules landed; the pre-PR review
discarded `ascii-gershayim-outside-body-text`, whose whole population
these two rules already repair (§6).

**§7 is the part to read.** Closing the batch turned up a pre-existing
repair fixing 22 of the same 90 anchors a different way, which cost 22
cross-links through the real pipeline while every per-rule measurement
stayed green. It was escalated rather than patched, ruled on, and
retired. **Through the pipeline — `applyRepairs` then the whole
registry — the batch now gains exactly 90 resolving link targets and
loses 0**, and that is asserted as a test rather than reported as a
number.

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
bun -e '
const {HEBREW,HEBREW_ATOM}=await import("./admin/pipeline/transform/html.ts");
const {fieldsOf}=await import("./admin/pipeline/transform/no-new-text.ts");
const Q=String.fromCharCode(34), P=new RegExp("(?<="+HEBREW_ATOM+")"+Q+"(?=["+HEBREW+"])","gu"), TAG=/<[^<>]*>/gu;
const OUT=new Set(["refs[]","next_hw","prev_hw"]);
const n=(s)=>(s.match(P)??[]).length;
const split=(s)=>{ let text=0,tag=0,at=0,m; TAG.lastIndex=0;
  while((m=TAG.exec(s))!==null){ text+=n(s.slice(at,m.index)); tag+=n(m[0]); at=m.index+m[0].length; }
  return {tag,text:text+n(s.slice(at))}; };
const by=new Map(), tE=new Set(), gE=new Set(), tags=new Set(); let tO=0,gO=0,walked=0;
const bump=(path,s,rid)=>{ const {tag,text}=split(s); if(tag+text===0)return;
  const r=by.get(path)??{e:new Set(),n:0}; r.n+=tag+text; r.e.add(rid); by.set(path,r);
  if(OUT.has(path))return; tO+=text; gO+=tag; if(text)tE.add(rid);
  if(tag){ gE.add(rid); for(const m of s.matchAll(TAG)) if(n(m[0])) tags.add(rid+"|"+m.index); } };
const walk=(v,path,rid)=>{ if(typeof v==="string")return bump(path,v,rid);
  if(Array.isArray(v))return v.forEach(x=>walk(x,path+"[]",rid));
  if(v&&typeof v==="object")for(const [k,x] of Object.entries(v))walk(x,path===""?k:path+"."+k,rid); };
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){
  const e=JSON.parse(l); walk(e,"",e.rid);
  for(const f of fieldsOf(e)){ const {tag,text}=split(f); walked+=tag+text; } }
let total=0;
for(const [p,r] of [...by].sort((a,b)=>b[1].n-a[1].n)){ total+=r.n;
  console.log(String(r.n).padStart(5),"/",String(r.e.size).padStart(4),"entries  ",p,OUT.has(p)?"  OUT OF SCOPE":""); }
console.log("corpus-wide",total,"| in scope",tO+gO,"/",new Set([...tE,...gE]).size,"entries | fieldsOf agrees:",walked===tO+gO);
console.log("text",tO,"/",tE.size,"entries | tag",gO,"/",gE.size,"entries in",tags.size,"tags");'
```

```text
 1852 / 1156 entries   content.senses[].definition
  353 /  256 entries   content.senses[].senses[].definition
   69 /   68 entries   next_hw   OUT OF SCOPE
   69 /   68 entries   headword
   69 /   68 entries   prev_hw   OUT OF SCOPE
   21 /   21 entries   refs[]   OUT OF SCOPE
   19 /   14 entries   alt_headwords[]
    8 /    6 entries   plural_form[]
    4 /    4 entries   quotes[][]
corpus-wide 2464 | in scope 2305 / 1392 entries | fieldsOf agrees: true
text 2125 / 1386 entries | tag 180 / 85 entries in 90 tags
```

**The command walks the corpus twice and the two legs check each
other.** The per-field breakdown is a generic recursion over the raw
JSON keyed by path — no hand-written field list, so it cannot omit a
field. The in-scope total is recomputed from `fieldsOf`, the
production walker `rules/gershayim.ts` maps, and `fieldsOf agrees`
reports whether they match. The census this replaced hand-rolled a
sense walk that visited `definition`, `number` and nested `senses` and
never any `grammar` field, while the report beside it claimed coverage
of each sense's `grammar.*`. The published 2,305 was right — those
fields hold 0 and Task 2 covered them in the mapper — but a command
that cannot validate the claim beside it is not a reproduction, and
this is the same defect class as the 1,310,492 figure the design spec
§2 corrects, where a hand-rolled walk omitted `language_reference`.

That second walk also corrects "corpus-wide". It is **2,464**, not the
2,326 published here at close: `next_hw` and `prev_hw` hold 69 each,
mirroring the same headword occurrences from the neighbouring rows,
and no enumeration of this defect — the audit's seven slots, the
catalogue row's seven, this report's own table — had ever named them.
Both are dropped from truth (data architecture §2.2, "validated then
derived"), so nothing in scope moves. The design spec records the one
consequence worth carrying: whoever writes `migrate.ts` must walk the
`prev_hw`/`next_hw` chain gate on the SOURCE, because this batch
repairs `headword` and leaves the pointers, so for 68 entries the two
stop matching as strings.

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

```text
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

```text
18 pass
0 fail
2839 expect() calls
```

The census test asserts one object:

```text
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

```text
malformed=false  dataRef="Jastrow, אל"  href="/Jastrow,_אל"
```

`opensScope` objects to nothing; the value simply stops at the embedded
quote. A `"` inside a `"`-delimited value is genuinely ambiguous, so
the parser cannot fix it and the data is the only place it can be
repaired. It also means the input target set holds the truncated
`Jastrow, אל`, so a case 5 phrased on parsed targets would reject the
correct output — which differs from that value by truncation as well as
by substitution.

These figures are measured on **pristine source**, which is the right
way to measure a rule and the wrong way to describe a pipeline. §7 is
what happened when the two were finally compared, and
`admin/pipeline/body/pipeline-links.test.ts` is the pipeline-level
version that now runs beside this one.

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

**2,119, not the 2,125 §1 reports for this locus, and the six are
named.** The register classifies by token, and its token model
`[HEBREW]+"[HEBREW]+` is a CONSUMING pattern over bare Hebrew, so it
cannot reach six occurrences the repair predicate does. Five are the
second quote of a two-quote token, which the greedy first match
consumes past — A00253 and U01408 (`יה"ש"ר`), A00409 (`א"תב"ש`),
A01394 (`ה"דא"א`), Q00157 (`פ"וגחמ"ט`) — and one carries a
combining dot between the letter and the quote, M01940 (`מ̇ס̇"ך̇`),
which a bare `[HEBREW]` excludes.

These six SUBSUME the three the predicate section names, and the extra
three are the same trap one notch worse. §2's consuming variant reads
`[HEBREW]"[HEBREW]`, one letter each side, so after `א"ת` it resumes at
`ב"ש` and still catches the second quote — of the five two-quote
tokens it loses only A00253 and U01408. The register's `+` runs are
greedy, so after `א"תב` it resumes at `"ש` and loses those three as
well. M01940 is the separate combining-dot case and is lost by both.
Measured on the text locus: 2,122 consuming, 2,124 bare lookbehind,
2,125 atom-aware — the same deltas §2 reports in scope. Each is listed by rid in the audit
file, and the `SCOPE=audit` run leaves them unclassified rather than
losing them. All six are REPAIRED — only their slot classification
is unavailable — so the residue stays an auditable **100**, not 106.

```bash
bun -e '
const {HEBREW,HEBREW_ATOM}=await import("./admin/pipeline/transform/html.ts");
const {fieldsOf}=await import("./admin/pipeline/transform/no-new-text.ts");
const Q=String.fromCharCode(34);
const P=new RegExp("(?<="+HEBREW_ATOM+")"+Q+"(?=["+HEBREW+"])","gu");
const TOKEN=new RegExp("["+HEBREW+"]+"+Q+"["+HEBREW+"]+","gu"), TAG=/<[^<>]*>/gu;
const textOf=(s)=>{let o="",at=0,m;TAG.lastIndex=0;
  while((m=TAG.exec(s))!==null){o+=s.slice(at,m.index)+" ";at=m.index+m[0].length;}
  return o+s.slice(at);};
let occ=0,tok=0; const short=[];
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){
  const e=JSON.parse(l); let a=0,b=0;
  for(const f of fieldsOf(e)){ const t=textOf(f); a+=(t.match(P)??[]).length;
    for(const m of t.match(TOKEN)??[]) b+=(m.match(P)??[]).length; }
  occ+=a; tok+=b; if(a!==b)short.push(e.rid); }
console.log("text locus",occ,"| tokenised",tok,"| gap",occ-tok,"|",short.join(", "));'
```

```text
text locus 2125 | tokenised 2119 | gap 6 | A00253, A00409, A01394, M01940, Q00157, U01408
```

**100 occurrences are left with the mark in the wrong slot**, and they
are recorded as residue rather than counted as coverage. Reproduce with
the `SCOPE`-switched register printed in
[`catalogue-audit/ascii-quote-as-gershayim-in-body.md`](../../data/patches/catalogue-audit/ascii-quote-as-gershayim-in-body.md)
("The decline register"):

```text
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
occurrences are measured and excluded, and `fieldsOf` is where the
exclusion lives: that walk omits `refs[]` because it holds machine
identifiers rather than text, and B7 drops it at compile besides, so
repairing it would produce no output either. Note which of those is
the rule's scope test — it is the first. "Survives compile" is not the
boundary: `plural_form` and `quotes` do not survive it and are
repaired, because `fieldsOf` walks them (§6).

## 4. `bun transform:count`

Before this task's write-backs — the evidence they were made from:

```text
ascii-quote-as-gershayim-in-body       measured(entries)= 1386 catalogued= 1290  DELTA +96
gershayim-breaks-ref-attribute         measured(entries)=   85 catalogued=   85  MATCH

15 rule(s), 3 mismatch(es).
```

After them, **15 rules, 13 MATCH, 2 findings, and both findings are
batch 2's**:

```text
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

```text
entries=32512 repaired=812
binyan-cleanup: 938 record(s) across 751 entries
marker-reinsert: 14 record(s) across 14 entries
rejoin-chopped: 36 record(s) across 36 entries
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
transform gershayim-breaks-ref-attribute: 85 instance(s)
```

**32,512/32,512 on all four round-trip gates; 0 schema failures, 0
quarantines, 0 repair failures, 0 transform failures, 0 unresolved
repaired orphans.** Every batch-2 instance count is unchanged.

`gershayim-breaks-ref-attribute` reads **85** here, matching the count
the rule fires on in isolation. It read **65** before §7's retirement,
and `repaired` was 832 rather than 812 — the 20 entries whose only
repair record was the now-retired escape (the 21st, `C00473`, still has
a `binyan-cleanup` record and stays in the count).

`brokenTopSequences=34` and `startsAtTwo=8` are pre-existing
observations belonging to other rows, not gate failures.

## 6. Catalogue write-backs

Surgical. `renderPatterns()` was never called — it emits compact JSON
while the file uses spaced separators, so it would reformat all 149
rows. The serializer used instead was verified to round-trip the two
target lines byte for byte before any edit, and the diff is two lines:

```bash
git diff --stat -- data/patches/patterns.jsonl
```

```text
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
repairs **every field `fieldsOf` walks** — `headword`,
`alt_headwords[]`, `plural_form[]`, `language_code`,
`language_reference`, `quotes[][]`, `content.morphology`, and each
sense's `definition`, `number` and `grammar.*`, nested sub-senses
included. The +96 entries are ones whose only gershayim lives outside
the audit's window.

**Not "every field that survives compile", which is what this
paragraph claimed until 2026-08-25 and is not true.** `plural_form`
and `quotes` are both dropped from v2 truth — B2 and B8, the ground on
which the catalogue discards **eight** rows and **two** respectively
(counted below, not eight-ish: seven `plural-form-*` plus
`geresh-abbrev-in-plural-form`) — and the rule repairs them anyway,
because `fieldsOf` walks them. The rule follows `fieldsOf` deliberately, and that is the
clause worth keeping: `fieldsOf` is every TEXT-BEARING field of
`SourceEntry`, `SourceSense` and `SourceGrammar`, and it is the single
enumeration both text gates read, so a rule editing a field outside it
would pass VACUOUSLY — unreviewed output reported as success. Covering
a field that later drops costs a few instructions; missing one costs
the gate. `refs[]` is outside `fieldsOf` on its own footing: it holds
machine identifiers rather than text (§3).

```bash
bun -e 'import {parsePatterns} from "./admin/pipeline/research/patterns.ts";
const rows=await parsePatterns(await Bun.file("data/patches/patterns.jsonl").text());
const on=(p)=>rows.filter(r=>r.status==="discarded"&&(r.reason??"").startsWith(p));
console.log("discarded on plural_form:",on("plural_form is not a v2 field").length,
            "| on quotes:",on("quotes is dropped entirely").length);
const {fieldsOf}=await import("./admin/pipeline/transform/no-new-text.ts");
const e={content:{morphology:"M",senses:[]},headword:"H",plural_form:["P"],
         quotes:[[null,"Q",null]],refs:["R"],rid:"X"};
const walked=fieldsOf(e);
console.log("fieldsOf walks plural_form:",walked.includes("P"),
            "| quotes:",walked.includes("Q"),"| refs:",walked.includes("R"));'
```

```text
discarded on plural_form: 8 | on quotes: 2
fieldsOf walks plural_form: true | quotes: true | refs: false
```

`gershayim-breaks-ref-attribute` stays at 85 and the row is now right
for the right reason. The catalogued 85 was reached by a walk that
recursed only into top-level `senses[].definition` and saw **86 of the
90 anchors** (86 × 2 = 172, exactly the figure the audit published),
missing four in nested sub-senses — `B00752`, `M01801`, `J00552`,
`V00773` — none of whose entries had a top-level damaged anchor either,
which is why that walk also reported 81 entries rather than 85. The
unit is now stated on the row: **90 anchors / 180 occurrences / 85
entries.**

### A third row, discarded: `ascii-gershayim-outside-body-text` (409)

**Found in the pre-PR review, and it is the write-back that mattered
most.** That row is `blocking: true`, `route: transform`, and its
`reason` enumerates our population verbatim — *"href/data-ref 172,
bare RTL text 117, headword 69, refs[] 21, alt_headwords 19,
plural_form 8, quotes[] 4"*. It was catalogued in round 3 as the
same defect seen OUTSIDE the audit's `dir=rtl` window, at a time when
`ascii-quote-as-gershayim-in-body` was scoped to that window. Widening
that row to every field `fieldsOf` walks, as this batch did, moved six
of the seven slots under a shipped rule and left the row as a second
owner of records those rules already repair — exactly the failure this
batch existed to fix.

Whether anything survived was MEASURED, not argued, with §1's census:

| Slot | Occ | Now owned by |
|---|---:|---|
| `href`/`data-ref` | 172 (measured 180) | `gershayim-breaks-ref-attribute` |
| bare RTL text | 117 | `ascii-quote-as-gershayim-in-body` |
| `headword` | 69 | same |
| `alt_headwords` | 19 | same |
| `plural_form` | 8 | same |
| `quotes[]` | 4 | same |
| `refs[]` | 21 | nobody — dropped at compile, B7 |

The unowned surviving population is **zero**, so the row is discarded
rather than narrowed. The cascade, all of it recomputed from the
catalogue rather than edited by hand: `PENDING` 63 → 62 ids (56 of
them edgeless, was 57), `coverage().total` 78 → 77 with
`registry.test.ts` asserting the new figure and carrying the reason,
the transform route 78 rows / 22,087 instances → 77 / 21,678, the
cutover cross-cut 59 / 16,085 → 58 / 15,676, and the candidate count
132 → 131. `count.ts`'s module doc lost its unit-mismatch example with
it and names two live rows instead.

## 7. The collision: the same defect was already being repaired, differently

**Found at batch close, escalated rather than patched, ruled on, and
fixed.** This is the batch's most useful result and it is a process
finding as much as a data one.

### What was wrong

`migrate-dry` runs `applyRepairs` first and transforms on the **healed**
entry (transform spec §2, "Placement"). Among those repairs was
`cite-escape` — a rid-keyed pass under "02 — orphan refs, class 1"
(`repairs.ts`, `CITE_ESCAPES`, 21 entries) whose docstring read:
*"Escape the gershayim `"` inside the malformed anchor's href/data-ref
attribute values as `&quot;` so both attributes parse to the full ref."*
The same 90-anchor population, found a year earlier in the body-model
work, repaired by **escaping** rather than by **correcting**.

By the time `gershayim-breaks-ref-attribute` ran, those anchors carried
no ASCII quote at all, so the predicate did not see them. Measured
against the pre-retirement code:

| | |
|---|---:|
| entries carrying a class-1 escape | 21 |
| damaged tags inside those 21 entries | 23 |
| damaged tags the escape neutralised | **22** |
| `&quot;` entities it wrote (2 attributes × 22 tags) | 44 |
| damaged anchors surviving to the transform | 90 → **68** |
| entries the attribute rule fired on | 85 → **65** |

That last line is the whole of the `65 instance(s)` that `migrate-dry`
reported and the isolated measurement did not.

**These are the only claims in this report that cannot be reproduced
against the current tree** — the six rows above plus the `gained 68 /
lost 22` pair and the `migrate-dry.ts` decode they cite, because the
code that produced all of them is gone. They do NOT depend on git
history: the retired pass was 21 rid-keyed substitutions, so the probe
below carries the table inline and reconstructs it on top of today's
`applyRepairs`.

```bash
bun -e '
// The retired class-1 escape, reconstructed inline so this probe needs no
// git history. Table and substitution are verbatim from the pass that was
// removed in `repairs.ts` (see docs/v2/body-migration.md).
const Q = String.fromCharCode(34);
const CLASS1 = {A01069:"א״ט",A01940:"אלפ״א",B00752:"בי״ת",B00757:"בי״ת",
 C00473:"ג״ר",C01036:"גימ״ל",C01224:"א״ת",C01225:"ג״ר",D00791:"אח״ס",
 E00326:"ה״א",E00686:"ה״א",J00083:"יג״ל",M01200:"מ״ם",M01490:"דל״ה",
 M01690:"אאלר״ן",N00910:"אאלר״ן",P00169:"דצ״ך",P00600:"עיי״ן",
 Q00002:"פ״ה",U02063:"א״ת",V00042:"תבש״ט"};
const {readSourceEntries}=await import("./admin/pipeline/body/source.ts");
const {applyRepairs,walkSensesDeep}=await import("./admin/pipeline/body/repairs.ts");
const {fieldsOf}=await import("./admin/pipeline/transform/no-new-text.ts");
const {tokenize}=await import("./admin/pipeline/transform/html.ts");
const {anchors}=await import("./admin/pipeline/transform/links.ts");
const {repairTags}=await import("./admin/pipeline/transform/gershayim.ts");
const escape1=(entry,target)=>{ const esc=target.split(Q).join("&quot;"); let n=0;
  const pairs=[["/Jastrow,_"+target+".1"+Q,"/Jastrow,_"+esc+".1"+Q],
               [Q+"Jastrow, "+target+" 1"+Q,Q+"Jastrow, "+esc+" 1"+Q]];
  for(const s of walkSensesDeep(entry.content.senses)){ let d=s.definition; if(d===undefined)continue;
    for(const [f,r] of pairs){ n+=d.split(f).length-1; d=d.split(f).join(r); }
    if(d!==s.definition)s.definition=d; }
  return n; };
const dmg=(e)=>fieldsOf(e).flatMap(f=>anchors(tokenize(f))).filter(a=>repairTags(a.tag)!==a.tag).length;
let escaped=0,entities=0,tagged=0,before=0,after=0;
for await (const e of readSourceEntries()){
  const healed=applyRepairs(e).entry; before+=dmg(healed);
  const target=CLASS1[e.rid];
  if(target!==undefined){ const n=escape1(healed,target.split("״").join(Q));
    if(n===0)throw new Error(e.rid+": no malformed anchor found"); escaped++; }
  after+=dmg(healed);
  for(const f of fieldsOf(healed)){ entities+=f.split("&quot;").length-1;
    tagged+=anchors(tokenize(f)).filter(a=>a.tag.includes("&quot;")).length; } }
console.log({escapedEntries:escaped, entitiesWritten:entities, tagsCarryingAnEntity:tagged,
  damagedBeforeTheEscape:before, damagedAfterTheEscape:after});'
```

```text
{ escapedEntries: 21, entitiesWritten: 44, tagsCarryingAnEntity: 22,
  damagedBeforeTheEscape: 90, damagedAfterTheEscape: 68 }
```

**It throws rather than reporting zeros if the reconstruction stops
matching the corpus** — `escape1` returning 0 for any rid is the same
assertion the retired pass made. An earlier draft of this block restored
the old file with `git show HEAD~1`, and that had already rotted by
review: a later commit moved `HEAD~1` past the retirement, so the probe
ran clean and printed every figure as 0 or 90. A probe that fails by
returning plausible wrong numbers is worse than no probe, and the squash
merge into `v2` would have destroyed the referenced commits anyway.

The "23 damaged tags inside the 21 entries" row does reproduce today,
and it is what reconciles 22 with 23 — `C01224` holds a second damaged
anchor that the rid-keyed escape never targeted:

```bash
bun -e '
const {readSourceEntries}=await import("./admin/pipeline/body/source.ts");
const {REPAIRED_ORPHAN_ITEMS}=await import("./admin/pipeline/body/repairs.ts");
const {fieldsOf}=await import("./admin/pipeline/transform/no-new-text.ts");
const {tokenize}=await import("./admin/pipeline/transform/html.ts");
const {anchors}=await import("./admin/pipeline/transform/links.ts");
const {repairTags}=await import("./admin/pipeline/transform/gershayim.ts");
const RIDS=new Set(Object.keys(REPAIRED_ORPHAN_ITEMS).filter(r=>!["P00331","P01404","S01230"].includes(r)));
let n=0; for await (const e of readSourceEntries()){ if(!RIDS.has(e.rid))continue;
  for(const f of fieldsOf(e)) n+=anchors(tokenize(f)).filter(a=>repairTags(a.tag)!==a.tag).length; }
console.log("former class-1 rids:",RIDS.size,"| damaged tags inside them:",n);'
```

```text
former class-1 rids: 21 | damaged tags inside them: 23
```

**And it was not merely reduced coverage — under one reading of the
entity, though not under both.** `&quot;` encodes an ASCII quote, and
the pipeline said so itself: `migrate-dry`'s orphan recount read values
back with `.split('&quot;').join('"')` before this batch removed the
line, and `escapeCiteAttributes`'s own comment called the entity the
form of "the headword's own gershayim". Under that reading those 22
targets still meant a quote while `ascii-quote-as-gershayim-in-body`
had corrected their target headwords to a gershayim — **one address,
two spellings** — and the batch as first written gained 68 cross-links
and **lost 22**.

**The caveat belongs beside the number.** Scored WITHOUT decoding the
entity, the same census reads `gained 68 | lost 0`, because the raw
`Jastrow, א&quot;ט 1` matched no headword under either reading. So the
22 is a loss against the pipeline's own stated semantics for the
entity, not against a naive string comparison. Which one a consumer
would have experienced depended on whether `compile` — still unwritten
— decoded it. **That ambiguity is itself the argument for the ruling:**
a corpus in which the answer to "does this link resolve" depends on how
a downstream stage reads an escape is a corpus with two spellings of
one address, whichever number you quote.

Both readings, and the citation for the decode, are among the
unreproducible figures listed above — the `migrate-dry` line they rest
on was deleted by this same change.

### The ruling

**Maintainer ruling, 2026-08-24 (Brian): retire the class-1 escape; the
transform owns the gershayim defect, and all 90 damaged anchors are
corrected to `״`.**

The rationale, recorded because it generalises: it is the only option
that leaves **one spelling of the address in the corpus**, and it
follows two standing rulings — that the pipeline must **correct** data
rather than preserve it, and that an OCR glyph fix is a correction
rather than an invention. The escape was a workaround for a parser
limitation; [#47](https://github.com/UniquePixels/jastrow/pull/47) and
this batch remove the limitation, so the workaround now costs more than
it buys.

**Superseded, not withdrawn.** The 21 repairs were correct for their
time. Nothing about them was wrong; a better mechanism arrived.

### What changed

| File | Change |
|---|---|
| `repairs.ts` | `CITE_ESCAPES`, `escapeCiteAttributes`, its `ORPHAN_REF_ITEM` regex and the `'cite-escape'` pass name all removed — the code path went dead with the table, so it went with it rather than staying as a mechanism nothing reaches. The 02 comment block now records the supersession and why. |
| `repairs.ts` | `REPAIRED_ORPHAN_ITEMS` rewritten: the 21 rids stay, respelled with the gershayim, because **the escape retired and the obligation did not**. If the transform ever stops reaching one of those anchors the recount says so instead of the item quietly going orphan again. |
| `migrate-dry.ts` | the `&quot;` read-back removed. The corpus holds **zero** `&quot;` of its own and no pass writes one now, so the decode had nothing left to decode. The docstring records that it existed and why it went. |
| `repairs.test.ts` | the escape's test is **inverted, not deleted** — `applyRepairs` must now leave A01069's anchor byte-identical, carry no `&quot;`, and leave the target truncated for the transform to fix. A re-introduced escape fails it. |
| `docs/v2/body-migration.md` | the permanent record of those 21 repairs now carries the retirement, the rationale, and the fact that nothing was dropped. |

### The result, measured through the pipeline

```bash
bun test admin/pipeline/body/pipeline-links.test.ts
```

```text
3 pass
0 fail
Ran 3 tests across 1 file. [44.89s]
```

The first of the three asserts, over `applyRepairs` + the whole
registry on all 32,512 entries, with the pair withheld and then
applied:

```text
{ entries: 32512, gained: 90, lost: [], lostCount: 0 }
```

**Gained exactly 90, lost 0 — through the pipeline, not on pristine
source.** The other two assert that the corpus ends with **0** escaped
quotes and 2,305 gershayim, and that every item in
`REPAIRED_ORPHAN_ITEMS` — the 21 retired-escape rids included — still
has an in-body citation basis, which is `migrate-dry`'s
`unresolvedRepairedOrphans` recount asserted at test time.

`migrate-dry` agrees: `gershayim-breaks-ref-attribute` now reports **85
instance(s)**, matching the isolated count exactly, and
`unresolvedRepairedOrphans=0` (§5).

### Why nothing caught it earlier, and what now does

The per-rule census applies rules to pristine source. `migrate-dry`
counts records and never scores links. **Nothing in the suite ran the
two layers in sequence and asked whether links still resolved**, so a
repair and a transform could disagree about the same bytes with every
test green. The gap — not the incident — is what
`admin/pipeline/body/pipeline-links.test.ts` closes, and it is worth
being exact about how far it reaches rather than claiming the layer.

**The `gained`/`lost` arms are DIFFERENTIAL.** Both run `applyRepairs`
and every non-gershayim rule, so a change elsewhere in either layer
appears on both sides and cancels. What they catch is anything that
*interferes with the withheld pair* — another layer consuming its
population, moving its targets, or moving the headwords those targets
point at. That is precisely this collision, and it is a narrow window.

**The absolute pin is what widens it.** The same test asserts that the
post-pipeline corpus holds exactly **72,593** resolving Jastrow targets
(`before` is 72,503). Any change in any layer that moves the
corpus-wide total fails there instead, at no extra runtime. A new
unlink rule will move it legitimately; the number is updated with the
measurement that justifies it, never to turn a red test green.

The two together still do not cover everything — §9.2 records the
sweep that would, and the recipe for it.

It costs two full pipeline passes (~45s). That is deliberate. The
cheaper measurement is the one that missed this.

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

```text
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

### 8.2 `checkAdjacency()` could pass vacuously, and for 56 pending rows it still can

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

```text
PENDING: 62 | no edge: 56
```

**56 of the 62 pending rows carry no edge at all**, so for most of the
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

```text
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

```text
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

```text
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

1. **The batch was one report line away from shipping a 22-link
   regression with every test green** (§7). It was caught by reading
   `migrate-dry`'s instance count against the isolated one, which is
   not a control — it is a person noticing. The control that now exists
   is `pipeline-links.test.ts`; the habit that produced it is the one
   worth keeping, which is treating a number that disagrees with
   another number as a question rather than as noise.
2. **A repair and a transform can own the same defect, and nothing
   declares it.** `patterns.jsonl` routes catalogue rows; `repairs.ts`
   carries rid-keyed decisions from the body-model work; neither knows
   about the other. Batch 3a found the overlap by accident.

   **The sweep was run rather than estimated, and it found exactly one
   interaction, benign** — `bare-rtl-hebrew` on **N00327**, 2 records →
   1, because `rejoin-chopped` merges two chopped senses so one wrap
   covers both. No second collision exists in today's registry.

   ```bash
   bun -e '
   const {readSourceEntries}=await import("./admin/pipeline/body/source.ts");
   const {applyRepairs}=await import("./admin/pipeline/body/repairs.ts");
   const {RULES}=await import("./admin/pipeline/transform/registry.ts");
   let repaired=0; const delta=[];
   for await (const e of readSourceEntries()){ const r=applyRepairs(e);
     if(r.records.length===0)continue; repaired++;
     for(const rule of RULES){ const a=rule.apply(e).records.length, b=rule.apply(r.entry).records.length;
       if(a!==b)delta.push(e.rid+" "+rule.id+" "+a+"->"+b); } }
   console.log("repaired entries:",repaired,"| rules:",RULES.length,"| interactions:",delta.length);
   console.log(delta.join("\n"));'
   ```

   ```text
   repaired entries: 812 | rules: 15 | interactions: 1
   N00327 bare-rtl-hebrew 2->1
   ```

   Note what that means about the method: the gershayim collision
   **would** have shown in this sweep as 85 → 65, so it is a direct
   detector rather than a proxy for one. It is also 15 rules of ~80, so
   it is a snapshot, not a guarantee.

   **CP-2 item, with the recipe, so nobody has to rediscover it:**
   promote that ~20-line probe to a corpus test — for every entry, run
   each rule on the pristine entry and on `applyRepairs(entry).entry`,
   collect the rules whose record count differs, and assert the
   resulting delta set equals a checked-in allowlist. Today that
   allowlist is one row, `bare-rtl-hebrew` on N00327, carrying its
   reason. Roughly 40s, one file, no new infrastructure, and it fails
   the moment a repair and a rule start disagreeing about the same
   bytes. `pipeline-links.test.ts` only sees such a disagreement when it
   moves a LINK; this sees it whenever it moves a RECORD.
3. **Retiring a repair changes `repaired=` and that is not drift.**
   `migrate-dry` reports 812 repaired entries where every prior record
   says 832. The 20-entry difference is exactly the retired escapes
   (21 entries, less `C00473` which keeps a `binyan-cleanup` record).
   `docs/v2/body-migration.md` carries the new figure and the reason.
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
   import of `HEBREW_ATOM`. **All three run that one way, and the
   enumeration is a claim rather than a description.** Final review
   found a fourth point where the class ran the OTHER way: the flank
   ranges read `ׯ-ײ`, admitting U+05EF HEBREW YOD
   TRIANGLE, which `HEBREW` does not hold. The class was narrowed to
   `װ-ײ` rather than the divergence documented — a
   gate wider than the rule rubber-stamps a rule that widened its own
   predicate, which is the one thing this class exists to catch. Cost
   was zero and stays zero: U+05EF occurs 0 times in the walked fields,
   and `bun qa` and `bun body:migrate-dry` report identical counts
   before and after.

   ```bash
   bun -e '
   const {readSourceEntries}=await import("./admin/pipeline/body/source.ts");
   const {fieldsOf}=await import("./admin/pipeline/transform/no-new-text.ts");
   let n=0; for await (const e of readSourceEntries()) {
     for (const f of fieldsOf(e)) { n += [...f.matchAll(/\u05ef/gu)].length; } }
   console.log({u05efInWalkedFields:n});'
   ```

   ```text
   { u05efInWalkedFields: 0 }
   ```
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
bun qa                  # format, lint, test, tsc — exit 0, 0 fail
bun transform:count     # 15 rules; the two surviving deltas are batch 2's — §4
bun body:migrate-dry    # §5 — 32,512/32,512 ×4, 0 failures, 0 quarantines
bun test admin/pipeline/body/pipeline-links.test.ts           # the PIPELINE census — §7
bun test admin/pipeline/transform/rules/gershayim.test.ts     # the per-rule census — §2
bun test admin/pipeline/transform/registry.order.test.ts      # cluster derivation — §8.2
bun test admin/pipeline/transform/link-target.test.ts         # gate case 5
bun test admin/pipeline/body/repairs.test.ts                  # the inverted escape test — §7
```

The `bun qa` line pins **exit 0 and 0 failures**, deliberately not a
pass COUNT. The count moved 724 → 726 → 729 across this branch alone
and goes stale on the next test anyone adds, so a figure here would
read as a claim about the suite while actually being a claim about the
day it was typed. Dated for the record rather than as an expectation:
the batch-close run on **2026-08-25** reported 729 passing, 0 failing,
4,306 assertions across 51 files.
