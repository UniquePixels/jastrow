# Audit — `ascii-quote-as-gershayim-in-body` (catalogued 1,234)

**Verdict: RE-MEASURE.** The description's *interpretation* is
confirmed — these really are gershayim, not quotation marks — but the
count is scoped narrower than the description says, and the defect is
larger than this row anyway. This audit re-measured its own scope to
**1,908 occurrences / 1,290 entries**; that figure was right about
`dir=rtl` definition text and is **not** what shipped.

> **Superseded, 2026-08-24 — read §Reconciliation before quoting any
> figure above it.** 1,908 / 1,290 reproduces exactly, but only for the
> `dir=rtl` wrapper locus. Phase 2 batch 3a widened the scope to every
> field `fieldsOf` walks and split the tag-interior locus into its own
> row, so the population is **2,305 in scope / 2,326 corpus-wide /
> 1,392 entries**, decomposed line by line in **§Reconciliation,
> 2026-08-24** below — every figure there produced by a command printed
> beside it. What shipped is two rows, counted in ENTRIES:
> `ascii-quote-as-gershayim-in-body` at 1,386 (2,125 occurrences,
> document text) and `gershayim-breaks-ref-attribute` at 85 (180
> occurrences, tag interiors).
>
> ```bash
> bun -e '
> const {parsePatterns}=await import("./admin/pipeline/research/patterns.ts");
> const c=parsePatterns(await Bun.file("data/patches/patterns.jsonl").text());
> for (const r of c) if (r.id==="ascii-quote-as-gershayim-in-body"
>   || r.id==="gershayim-breaks-ref-attribute") console.log(r.id, r.corpusCount);'
> ```
>
> ```
> ascii-quote-as-gershayim-in-body 1386
> gershayim-breaks-ref-attribute 85
> ```

## Probe and raw figure

Reading of the description: inside body text, find ASCII `"` (U+0022)
in a `dir="rtl"` run where print sets gershayim U+05F4. Body text =
`content.senses[].definition` (incl. nested), `content.morphology`,
`quotes[][]`.

```python
RTL = re.compile(r'<(span|a)\b[^>]*\bdir="rtl"[^>]*>(.*?)</\1>', re.S)
TAG = re.compile(r'<[^>]+>')
# for each body field: for each RTL run: count '"' in TAG.sub('', run)
```

**1,912 occurrences / 1,291 entries.** Field split: 1,588 top-level
definitions, 323 nested sub-senses, 1 `quotes[]`, 0 `morphology`.

### Reconciling the catalogued 1,234

| Variant | Occ | Entries |
|---|---|---|
| `<span dir=rtl>` text only | 1,820 | **1,234** |
| `<a dir=rtl>` text only | 92 | 81 |
| union (this probe) | 1,912 | 1,291 |

**`corpusCount: 1234` is distinct *entries* with at least one ASCII `"`
in a `<span dir="rtl">` run — `<a dir="rtl">` link display text silently
excluded.** Re-validated with a real `html.parser` walk tracking
`dir=rtl` ancestry: 1,907 occ / 1,290 entries inside `dir=rtl`, of which
exactly 1,234 entries have a `span` as innermost rtl ancestor. The
figure is reproducible to the entry, but it is an entry count, not an
occurrence count, and it is span-scoped without saying so.

## Does this population have more than one job?

**Essentially one job — but two placement classes with different fixes,
and a third the auditor could not adjudicate.**

By immediate neighbours (niqqud-tolerant), of all 1,912 occurrences:
Hebrew letter on **both** sides 1,908; leading/trailing/whitespace-
flanked (i.e. a quotation mark) **0**; combining-dot-above on the left 1
(M01940, the niqqud skip missed U+0307); regex artifact from malformed
markup 3 (D00478).

**1,909 of 1,912 are inter-letter gershayim; zero are quotation marks.**
No pair of quotes anywhere encloses a phrase — all 92 elements with two
quotes spanning whitespace are two separate abbreviations
(`אח"ס בט"ע`, `ד"א … ד"א`, `ג"ר ד"ק`).

Sub-jobs by gershayim *position* (canonical slot is before the final
letter):

| Sub-job | Occ | Verdict |
|---|---|---|
| **A. Canonical penultimate slot** — plain `"` → `״` is correct and sufficient | 1,826 (95.7%) | **DEFECT** |
| **B. Displaced gershayim** — the token has a penultimate-slot twin that dominates corpus-wide (`הק"בה` 15 vs `הקב"ה` 194; `ב"וד` 9 vs `בו"ד` 19; `בע"הב` 2 vs 12; `להק"בה` 2 vs 14; `גי"מל` 1 vs 8; `רו"הק` 1 vs 6) | 49 (2.6%) | **DEFECT, but a different one** — substituting in place yields a correctly-glyphed gershayim in the wrong slot |
| **C. Non-penultimate, no dominant twin** — `עכ"ום` (12, twin `עכו"ם` 16, a genuine censorship-era variant in 19th-c. prints), `ש"ין`, `דַּלְ"תִים`, `זַיְי"נִין`, `אוכ"טא`, `ע"עז` | 34 (1.8%) | **UNDETERMINED** — displacement cannot be told from print variant without the 1903 scan. Stated plainly rather than assumed |

**No CONVENTION members.** The decisive check: **U+05F4 does not occur
once in the entire 32,512-line file**, while U+05F3 geresh occurs
64,000+ times and appears *in the same strings* as the ASCII quotes
(`משום ח׳ דכה"ג וכ׳`). The corpus has no population of already-correct
gershayim these could be deliberately distinguished from — the
substitution is systematic and total, and there is no competing job for
`"` to hold.

## Sample read

`random.seed(20260818); random.sample(range(1813), 12)` over the
*element* list (weighted by occurrence, not entry), each read with 160
chars of surrounding HTML. Twelve for twelve gershayim, zero
conventions.

| rid | RTL run | Judgement |
|---|---|---|
| M01772 | `שנִתְמַנּוּ ב"ד על וכ׳` | `ב״ד` bet-din — class A |
| D00891 | `לה"ד`, glossed "(abbrev. `מלה"ד`)" | למה הדבר דומה — class A |
| Q00991 | `פְּלַח לע"א` | `לע״א` = עבודה זרה — class A |
| M02939 | `הקב"ה אין לו … ולא מ׳` | `הקב״ה`; a real `׳` in the same run — class A |
| H00365 | `משום ח׳ דכה"ג וכ׳` | `כה״ג`; geresh correct, gershayim ASCII — class A |
| H00133 | `י"ט האחרון וכ׳` | `י״ט` yom tov — class A |
| Q00314 | `ר"י אומר כל שאינו מפיק` | `ר״י` = R. Judah — class A |
| N00681 | `אע"פ שעשה לה נִימוֹסָהּ` | `אע״פ` — class A |
| Q00188 | `שנפ̇ט̇ר מע"ז` | `מע״ז` — class A |
| K00865 | `שירי כה"ג` | `כה״ג` — class A |
| Q00002 | `פ"ה` inside `<a dir="rtl">` | class A — **and invisible to the catalogued count**, being an `<a>`, not a `<span>` |
| Q00936 | `זוכה לפ׳ של הקב"ה` | `הקב״ה` — class A |

Seven targeted class-B/C members also read: B01371 `ב׳ ודם (abbr. ב"וד)`
— Jastrow's own abbreviation of בשר ודם, print `בו״ד`, displaced;
A02325 `הק"בה`; B00435 `בגי׳ 'מל וש"ין` — both marks displaced *and* the
gershayim of `גימ״ל` split into a stray ASCII apostrophe; D00863
`דַּלְ"תִים`; A01394 `ה"דא"א`; P00731 `ע"עז`; A00692 `עכ"ום`.

## Letter A

**86 entries / 127 occurrences** span-only, matching the catalogued
scope (86 of the 1,234). A is 10.6% of the corpus but 6.7% of member
entries; hit rate 2.49% of A entries against 3.97% corpus-wide.
Under-represented ~1.6×, not absent; the range across 22 letters is
2.49% (A) to 7.39% (J), so A is at the low end of an ordinary spread.

## Disposition

**RE-MEASURE to 1,908 occurrences / 1,290 entries** *(2026-06
proposal; superseded — see the note below)*, recording occurrences as
the primary figure. Probe: as above, restricted to
Hebrew-flanked quotes (drops the 3 D00478 artifacts) — both neighbours,
skipping U+0591–U+05C7 and U+0307, matching `[א-ת]`.

> **Superseded, 2026-08-24.** This disposition is the 2026-06 proposal,
> kept as the record of what was decided then. It was NOT applied as
> written. §Reconciliation below re-measures the population to **2,305
> in scope / 2,326 corpus-wide / 1,392 entries** and Phase 2 batch 3a
> shipped it as two rows counted in ENTRIES —
> `ascii-quote-as-gershayim-in-body` at **1,386** (2,125 occurrences,
> document text) and `gershayim-breaks-ref-attribute` at **85** (180
> occurrences, tag interiors) — with the description below amended as
> noted. Reproduce both counts with the command at the top of this file.

- `corpusCount: 1234` → **1908**, entry count 1,290 recorded alongside.
  The +56 entries are ones whose only body-text gershayim lives in
  `<a dir="rtl">` display text (Q00002, A00009, A01065 …).
  **Superseded:** the row ships `corpusCount: 1386`, in entries, over
  the wider walked-field scope.
- New description: *ASCII double quote (U+0022) used as gershayim inside
  dir=rtl body-text runs — span and anchor display text alike — where
  print has ״.*

  The proposal as first drafted ended *"; U+05F4 occurs 0 times in the
  corpus"*. **That clause is struck, and does not appear in the shipped
  description.** It is true of the pinned snapshot and false under
  composition: `run.ts` hands each rule the previous rule's output, so
  once `gershayimInBody` has run, the second rule's input holds 2,125 of
  them. The argument that survives is about the SUBSTITUTION, not about
  the corpus — `admin/pipeline/transform/gershayim.ts` only ever writes
  a `״` where it removed a `"`, in place, one for one, so every `״`
  in the output is one that call put there whatever the input already
  held. The corpus fact is still worth having, because it is what makes
  the count checkable; it is just not what makes the repair safe. See
  `admin/pipeline/transform/rules/gershayim.ts`'s module doc,
  `link-target.ts`'s case-5 condition 1, and batch report §9.4.

### Two riders the transform author needs

1. **49 occurrences are displaced** (class B). A blind `"` → `״`
   substitution glyph-corrects them while leaving the mark in the wrong
   slot. They need a reposition rule keyed to the dominant penultimate
   twin, or explicit deferral. Another 34 (class C) are undetermined.
2. **The same defect is much larger than this row's scope.**
   Corpus-wide, ASCII-quote-as-gershayim occurs **2,317 times across
   1,392 entries**: 1,907 in `dir=rtl` definition text, 172 inside
   `href`/`data-ref` attribute values (81 entries), 117 in bare RTL
   definition text with no wrapper (109 entries), 69 in `headword`, 21
   in `refs[]`, 19 in `alt_headwords`, 8 in `plural_form`, 4 in
   `quotes[]`. **Superseded, 2026-08-24:** the true figures are **2,326
   corpus-wide / 2,305 in scope**, with **1,908** in the `dir=rtl`
   wrapper and **180 across 85 entries** in attributes; the entry count
   is unchanged at 1,392. §Reconciliation decomposes all nine of the
   differences line by line, with the command. Because `refs[]`
   and `data-ref` carry the same abbreviations (`Jastrow, א"ת 1`),
   **fixing body text without fixing headwords, `refs[]` and `data-ref`
   in the same pass will break cross-links that currently match by
   string identity.** This row cannot be dispositioned in isolation.

## What would have falsified this

The count is not confirmed but its *interpretation* is, so the test
still applies. Two findings would have overturned it; both were looked
for:

- **Any ASCII `"` in `dir=rtl` body text functioning as a quotation
  mark** — string-initial, string-final, whitespace-flanked, or a
  matched pair enclosing a phrase. Those would be CONVENTION under a
  different typographic rule, and a `"`→`״` transform would corrupt
  them. **Found: 0 of 1,912.** All 92 two-quote elements re-read
  manually; all are multiple abbreviations.
- **Any real U+05F4 already present**, which would mean the corpus
  distinguishes the two. **Found: 0 in the entire raw file** — of the
  PINNED SNAPSHOT, as an input measurement — against 64,000+ U+05F3,
  including geresh and ASCII-gershayim coexisting in single strings
  (H00365, E00298, M02939). This is what makes the count checkable and
  nothing more: it does not survive composition, and must not be
  reached for as a safety argument. See the struck clause under
  §Disposition.

**Not falsifiable here:** the clause "where print has ״". The 1903 print
was never inspected. For the 1,826 canonical-slot members the inference
from Hebrew orthography is near-certain; for the 34 class-C members
(notably the 17 `עכ"ום`-family occurrences) it is not, and that is
flagged undetermined rather than assumed.

## Overlap with other catalogue rows

- **`gershayim-breaks-ref-attribute` (85)** — direct sibling. 172
  `href`/`data-ref` early-terminations across 81 entries (~86 distinct
  anchors, matching their 85) measured independently. **Superseded,
  2026-08-24:** **180 occurrences across 85 entries on 90 anchors**,
  exactly 2 per anchor; the attribute probe behind the 172 recursed
  only into top-level `content.senses[].definition` and missed 4
  anchors in nested sub-senses. §Reconciliation carries the command. The 56 entries
  this row gains over 1,234 are the **display-text** side of those same
  anchors, which that row does not cover. **The two rows leave a
  56-entry gap between them and must be transformed together, or link
  text and link target will disagree.**
- **`bare-rtl-hebrew` (4,900)** — 117 occ / 109 entries of ASCII
  gershayim in unwrapped RTL definition text belong to that row today.
  **Ordering dependency:** if `bare-rtl-hebrew` runs first and wraps
  them, they migrate into this row's scope and this count rises to
  ~2,025 occ.
- **`unterminated-href-swallows-closing-tag` (2)** — D00478 is one of
  them and is the sole source of the 3 spurious occurrences here.
- **`abbrev-in-alt-headwords` (2,265)**, **`redundant-outer-rtl-span`
  (529)** — the 19 `alt_headwords` occurrences fall inside the former;
  the latter's nested spans are why the regex was cross-checked against
  a real HTML parser (they agree).
- Geresh-family rows (`vkh-geresh-loss` 11, `geresh-abbrev-space-loss`
  22) are the single-mark analogue — related but disjoint. 36 ASCII
  apostrophes sit in `dir=rtl` body text and are not in this population;
  B00435's `בגי׳ 'מל` shows one abbreviation corrupted across both
  families at once.

---

## Reconciliation, 2026-08-24

Written during Phase 2 batch 3a implementation (Task 0), before any
transform rule was written. **Every figure in this section and the two
that follow is produced by the command printed beside it.** Nothing is
carried in from the design spec or the implementation plan; where a
command disagreed with them, the command won and the disagreement is
recorded as a finding.

Snapshot: `data/source/jastrow-dictionary.jsonl`, pinned by
`data/patches/snapshot.lock`. Hebrew character classes come from
`HEBREW` as exported by `admin/pipeline/transform/html.ts`, never a
pasted literal range.

### The gap, and its exact decomposition

The batch 3a design spec measured **2,323** occurrences corpus-wide
(2,302 in scope) against this audit's **2,317**. The two differ by 6.
**The reconciliation closes exactly, with zero residual.** Both
readings were low, in different places and for unrelated reasons, and
the true corpus-wide figure is **2,326 / 2,305 in scope**.

The canonical measurement — a per-character scan (so overlapping
matches are not lost) whose neighbour test tolerates a combining dot
above, split by locus and by the same line items this audit used:

```bash
bun -e 'const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34), TAG=/<[^<>]*>/gu, DOT="̇";
const H=new RegExp("^["+HEBREW+"]$","u");
const RTLW=/<(span|a)\b[^<>]*\bdir="rtl"[^<>]*>([\s\S]*?)<\/\1>/gu;
const scan=(s)=>{const o=[];for(let i=0;i<s.length;i++){if(s[i]!==Q)continue;
 let j=i-1;while(j>=0&&s[j]===DOT)j--;let k=i+1;while(k<s.length&&s[k]===DOT)k++;
 if(j>=0&&k<s.length&&H.test(s[j])&&H.test(s[k]))o.push(i);}return o;};
const acc={};const bump=(k,rid)=>{(acc[k]??=({n:0,e:new Set()})).n++;acc[k].e.add(rid);};
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){
 const e=JSON.parse(l);
 const go=(k,f)=>{if(typeof f!=="string")return;
  const mask=new Array(f.length).fill(false);
  for(const m of f.matchAll(TAG))for(let i=m.index;i<m.index+m[0].length;i++)mask[i]=true;
  const rtl=new Array(f.length).fill(false);
  for(const m of f.matchAll(RTLW))for(let i=m.index+m[0].indexOf(">")+1;i<m.index+m[0].length;i++)rtl[i]=true;
  for(const p of scan(f)) bump(mask[p]?k+" [TAG attr]":(k==="senses[].definition"?(rtl[p]?"senses[].definition (in dir=rtl wrapper)":"senses[].definition (bare RTL)"):k), e.rid);};
 go("headword",e.headword); for(const a of e.alt_headwords??[])go("alt_headwords",a);
 for(const x of e.plural_form??[])go("plural_form",x); for(const r of e.refs??[])go("refs[] OUT OF SCOPE",String(r));
 const w=(s)=>{if(!s)return; go("senses[].definition",s.definition); go("senses[].number",s.number); for(const n of s.senses??[])w(n)};
 for(const s of e.content?.senses??[])w(s); go("content.morphology",e.content?.morphology);
 for(const q of e.quotes??[])for(const x of q??[])go("quotes[]",x); }
let tot=0,ins=0;
for(const [k,v] of Object.entries(acc).sort((a,b)=>b[1].n-a[1].n)){ tot+=v.n; if(!k.startsWith("refs["))ins+=v.n;
 console.log(String(v.n).padStart(5),"/",String(v.e.size).padStart(4),"entries  ",k); }
console.log("TOTAL",tot,"| IN SCOPE",ins);'
```

```
 1908 / 1290 entries   senses[].definition (in dir=rtl wrapper)
  180 /   85 entries   senses[].definition [TAG attr]
  117 /  109 entries   senses[].definition (bare RTL)
   69 /   68 entries   headword
   21 /   21 entries   refs[] OUT OF SCOPE
   19 /   14 entries   alt_headwords
    8 /    6 entries   plural_form
    4 /    4 entries   quotes[]
TOTAL 2326 | IN SCOPE 2305
```

Against this audit's own rider (`:183`), line for line:

| Line item | This audit | Measured | Δ | Why |
|---|---:|---:|---:|---|
| `dir=rtl` definition text | 1,907 | **1,908** | +1 | the rider quoted the `html.parser` figure (`:62`); this audit's *own* disposition (`:138`) says 1,908, and 1,908 / 1,290 entries reproduces exactly. The audit was internally inconsistent by 1; the disposition figure is the right one |
| `href`/`data-ref` attributes | 172 | **180** | +8 | the attribute probe recursed only into top-level `content.senses[].definition`; 4 anchors live in nested sub-senses. See below |
| bare RTL definition text | 117 | 117 | 0 | exact, entries too (109) |
| `headword` | 69 | 69 | 0 | exact |
| `refs[]` — **out of scope** | 21 | 21 | 0 | exact; dropped at compile (body model spec §5, B7) |
| `alt_headwords` | 19 | 19 | 0 | exact |
| `plural_form` | 8 | 8 | 0 | exact |
| `quotes[]` | 4 | 4 | 0 | exact |
| **Total** | **2,317** | **2,326** | **+9** | |
| **In scope** (−`refs[]`) | **2,296** | **2,305** | **+9** | |

And against the design spec's 2,302 in scope, the spec is **3 low**,
all three being artifacts of its probe rather than population:

| rid | field | text | Why the spec's probe missed it |
|---|---|---|---|
| A00253 | `senses[].definition` | `יה"ש"ר` | two Hebrew-flanked quotes share the `ש`; `matchAll` is non-overlapping, so the second is consumed away |
| U01408 | `senses[].definition` | `יה"ש"ר` | same |
| M01940 | `senses[].definition` | `מ̇ס̇"ך̇` | U+0307 combining dot above sits between the `ס` and the quote; bare `[HEBREW]` excludes U+0307 |

2,302 + 3 = **2,305**. The entry count is unaffected: 1,392 either way.

**Both artifacts are actionable for the rule author, not just for the
count.** A rule written as a non-overlapping global replace will leave
the second quote of `X"Y"Z` uncorrected in A00253, U01408, A00409
(`א"תב"ש`), A01394 (`ה"דא"א`) and Q00157 (headword `פ"וגחמ"ט`). And a
predicate written as bare `[HEBREW]"[HEBREW]` will skip M01940.

`html.ts` already contemplates that case internally —
`const HEBREW_ATOM = String.raw`[${HEBREW}]̇*`` at `html.ts:55` —
but **`HEBREW_ATOM` was module-private and unexported when this was
written.** The export list — `html.ts:239–247` in the pre-batch file,
as was the `html.ts:55` above — held `HEBREW`, `hebrewRuns`, `tokenize`,
`serialize`, `attributeInterior`, `opensScope` and `DIR_RTL`, and no
atom. A consumer that imported it got `undefined` and failed at
runtime. So a rule that wants atom semantics must either add
`HEBREW_ATOM` to that export list or inline `[${HEBREW}]̇*` for
itself — the point stands that the predicate should be built on the
atom rather than the bare class.

> **Discharged by batch 3a (2026-08-24).** The first arm was taken:
> `HEBREW_ATOM` is now **exported**, at `html.ts:252`, and is defined at
> `html.ts:64` — the export block runs `html.ts:248–257` and holds
> `attributeInterior`, `DIR_RTL`, `HEBREW`, `HEBREW_ATOM`, `hebrewRuns`,
> `opensScope`, `serialize`, `tokenize`. `transform/gershayim.ts` builds
> its predicate on the imported atom rather than restating it, so the
> paragraph above is a record of the pre-batch state, not of this tree.
> Reproduce: `grep -n 'HEBREW_ATOM' admin/pipeline/transform/html.ts
> admin/pipeline/transform/gershayim.ts`.

### The falsified hypothesis stays falsified

The design spec's cheap explanation was a Hebrew-block boundary
difference between the wide `[U+0590-U+05FF]` and `html.ts`'s canonical
`HEBREW`. Re-tested on the real field strings:

```bash
bun -e 'const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34);
const wide=new RegExp("[֐-׿]"+Q+"[֐-׿]","gu"), canon=new RegExp("["+HEBREW+"]"+Q+"["+HEBREW+"]","gu");
const fields=(e)=>{const o=[],p=(s)=>{typeof s==="string"&&o.push(s)};
  p(e.headword); for(const a of e.alt_headwords??[])p(a); for(const x of e.plural_form??[])p(x);
  const w=(s)=>{if(!s)return; p(s.definition); p(s.number); for(const n of s.senses??[])w(n)};
  for(const s of e.content?.senses??[])w(s); p(e.content?.morphology);
  for(const q of e.quotes??[])for(const x of q??[])p(x); return o};
let w=0,c=0;
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){
  const e=JSON.parse(l);
  for(const f of fields(e)){ w+=[...f.matchAll(wide)].length; c+=[...f.matchAll(canon)].length; } }
console.log("wide",w,"canonical",c,"delta",w-c);'
```

```
wide 2302 canonical 2302 delta 0
```

**Confirmed falsified.** The class is not where the difference lives.

**Probe defect worth recording.** The version of this test carried in
the batch 3a implementation plan ran its regexes over
`JSON.stringify(...)` output, where every `"` is escaped to `\"`, so
the left neighbour of every quote is a backslash and neither class can
ever match. Run as it was written:

```bash
bun -e 'const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34);
const wide=new RegExp("[֐-׿]"+Q+"[֐-׿]","gu"), canon=new RegExp("["+HEBREW+"]"+Q+"["+HEBREW+"]","gu");
let w=0,c=0;
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){
  const e=JSON.parse(l), s=JSON.stringify(e.content)+JSON.stringify(e.headword)+JSON.stringify(e.alt_headwords??[])+JSON.stringify(e.plural_form??[])+JSON.stringify(e.quotes??[]);
  w+=[...s.matchAll(wide)].length; c+=[...s.matchAll(canon)].length; }
console.log("wide",w,"canonical",c,"delta",w-c);'
```

```
wide 0 canonical 0 delta 0
```

A delta of 0 between two zeros is not a test. The command earlier in
this section is the corrected form and is the one that carries the
result.

### Where the missing 8 attribute occurrences are

Every defective tag carries the same gershayim twice, once in `href`
and once in `data-ref`. **This is measured, not assumed** — the
headline 180 is derived below as `anchors × 2`, so the distribution of
occurrences-per-tag has to be checked before that multiplication is
allowed:

```bash
bun -e 'const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34), P=new RegExp("["+HEBREW+"]"+Q+"["+HEBREW+"]","gu"), TAG=/<[^<>]*>/gu;
const dist=new Map(); let tags=0, occ=0; const noDir=[];
const fields=(e)=>{const o=[],p=(s)=>{typeof s==="string"&&o.push(s)};
  p(e.headword); for(const a of e.alt_headwords??[])p(a); for(const x of e.plural_form??[])p(x);
  const w=(s)=>{if(!s)return; p(s.definition); p(s.number); for(const n of s.senses??[])w(n)};
  for(const s of e.content?.senses??[])w(s); p(e.content?.morphology);
  for(const q of e.quotes??[])for(const x of q??[])p(x); return o};
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){
 const e=JSON.parse(l);
 for(const f of fields(e)) for(const m of f.matchAll(TAG)){
  const n=[...m[0].matchAll(P)].length; if(!n)continue;
  tags++; occ+=n; dist.set(n,(dist.get(n)??0)+1);
  if(!/\bdir="rtl"/u.test(m[0])) noDir.push([e.rid,m[0]]); } }
console.log("defective tags:",tags,"| total occurrences:",occ);
console.log("occurrences-per-tag distribution:",JSON.stringify(Object.fromEntries([...dist].sort())));
console.log("tags with NO dir=\"rtl\" attribute:",noDir.length);
for(const [r,t] of noDir) console.log("   ",r,t);'
```

```
defective tags: 90 | total occurrences: 180
occurrences-per-tag distribution: {"2":90}
tags with NO dir="rtl" attribute: 2
    B00752 <a class="refLink" href="/Jastrow,_בי"ת.1" data-ref="Jastrow, בי"ת 1">
    C01225 <a class="refLink" href="/Jastrow,_ג"ר.1" data-ref="Jastrow, ג"ר 1">
```

**Every one of the 90 defective tags carries exactly 2, with no
exceptions in either direction** — no tag carries 1, none carries 3.
So `anchors × 2` is a sound derivation here, the tag locus is always
even, and `180 = 90 × 2` is a usable post-condition for the rule's
test. The same command establishes the two `dir`-less anchors cited
at the end of this section.

The anchor split that explains the audit's 172:

```bash
bun -e 'const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34), P=new RegExp("["+HEBREW+"]"+Q+"["+HEBREW+"]","u"), TAG=/<[^<>]*>/gu;
const top=[],nested=[];
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){
 const e=JSON.parse(l);
 const w=(s,d)=>{if(!s)return; if(typeof s.definition==="string")
   for(const m of s.definition.matchAll(TAG)) if(P.test(m[0])) (d===0?top:nested).push([e.rid,m[0]]);
  for(const n of s.senses??[])w(n,d+1)};
 for(const s of e.content?.senses??[])w(s,0); }
const E=(a)=>new Set(a.map(x=>x[0])).size;
console.log("top-level definitions only:",top.length,"anchors,",top.length*2,"occ,",E(top),"entries");
console.log("nested sub-senses only    :",nested.length,"anchors,",nested.length*2,"occ,",E(nested),"entries");
console.log("both                      :",top.length+nested.length,"anchors,",(top.length+nested.length)*2,"occ,",E([...top,...nested]),"entries");
for(const [r,t] of nested) console.log("   missed:",r,t);'
```

```
top-level definitions only: 86 anchors, 172 occ, 81 entries
nested sub-senses only    : 4 anchors, 8 occ, 4 entries
both                      : 90 anchors, 180 occ, 85 entries
   missed: B00752 <a class="refLink" href="/Jastrow,_בי"ת.1" data-ref="Jastrow, בי"ת 1">
   missed: M01801 <a dir="rtl" class="refLink" href="/Jastrow,_ה"א.1" data-ref="Jastrow, ה"א 1">
   missed: J00552 <a dir="rtl" class="refLink" href="/Jastrow,_א"ת.1" data-ref="Jastrow, א"ת 1">
   missed: V00773 <a dir="rtl" class="refLink" href="/Jastrow,_א"ת.1" data-ref="Jastrow, א"ת 1">
```

**86 anchors / 172 occurrences / 81 entries reproduces this audit's
"172 … (81 entries), ~86 distinct anchors" (`:184`, `:228`) to the
occurrence, the anchor and the entry.** The attribute probe descended
only into top-level `content.senses[].definition`. Four anchors sit in
nested sub-senses, and none of their four entries has a top-level
defective anchor, so all four entries were lost too — hence 81 rather
than 85.

**Correction to the sibling row.** `gershayim-breaks-ref-attribute`
is catalogued at 85 and this audit called 86 anchors "matching their
85". The real figure is **90 anchors / 180 occurrences / 85 entries**.
The catalogued 85 is an *entry* count that happens to be right; the
anchor count is 90. Two of the 90 additionally lack `dir="rtl"`
altogether — **B00752 and C01225, both printed by the distribution
command above** — so any repair keyed to a `dir=rtl` anchor will miss
them.

## Locus partition

The population splits into a **text locus** (repair the character) and
a **tag locus** (repair the character *inside an attribute value*,
where the ASCII quote also terminates the attribute). The rule needs
both, and needs to know which is which.

```bash
bun -e 'const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34), P=new RegExp("["+HEBREW+"]"+Q+"["+HEBREW+"]","gu"), TAG=/<[^<>]*>/gu;
const textE=new Set(), tagE=new Set(); let textO=0, tagO=0;
const fields=(e)=>{const o=[],p=(s)=>{typeof s==="string"&&o.push(s)};
  p(e.headword); for(const a of e.alt_headwords??[])p(a); for(const x of e.plural_form??[])p(x);
  const w=(s)=>{if(!s)return; p(s.definition); p(s.number); for(const n of s.senses??[])w(n)};
  for(const s of e.content?.senses??[])w(s); p(e.content?.morphology);
  for(const q of e.quotes??[])for(const x of q??[])p(x); return o};
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){
  const e=JSON.parse(l);
  for(const f of fields(e)){ const mask=new Array(f.length).fill(false);
    for(const m of f.matchAll(TAG))for(let i=m.index;i<m.index+m[0].length;i++)mask[i]=true;
    for(const m of f.matchAll(P)){ if(mask[m.index+1]){tagO++;tagE.add(e.rid)} else {textO++;textE.add(e.rid)} } } }
console.log("text",textO,"occ /",textE.size,"entries");
console.log("tag ",tagO,"occ /",tagE.size,"entries");
console.log("union",new Set([...textE,...tagE]).size,"| total",textO+tagO);'
```

```
text 2122 occ / 1386 entries
tag  180 occ / 85 entries
union 1392 | total 2302
```

| Locus | Occurrences | Entries | Note |
|---|---:|---:|---|
| Text | 2,122 | 1,386 | **2,125** under the overlap- and U+0307-tolerant scan above; the +3 are A00253, U01408, M01940 |
| Tag attribute | 180 | 85 | 90 anchors × 2 attributes (`href`, `data-ref`); exactly even, always |
| **Union** | **2,302** *(true 2,305)* | **1,392** | entry count identical under both scans |

`refs[]` (21 occurrences / 21 entries) is **excluded from every figure
above**. It is dropped at compile — body model spec §5, B7 — and
`admin/pipeline/transform/no-new-text.ts` already gates it out.

## Decline register

The two riders at `:177` name **49 displaced** (class B) and **34
undetermined** (class C). Both are reproduced here, by rid, so the
post-launch judgement pass can find them without re-deriving the set.

### Method, and what the audit's scope turned out to be

Class assignment is by **gershayim slot**: canonical is immediately
before the final Hebrew letter. A token whose quote is not in that slot
is *displaced* (class B) if a same-skeleton twin with the quote in the
canonical slot occurs more often, and *undetermined* (class C)
otherwise.

```bash
bun -e 'const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34), TAG=/<[^<>]*>/gu, LET=/^[א-ת]$/u;
const TOK=new RegExp("["+HEBREW+"]+"+Q+"["+HEBREW+"]+","gu");
const RTLW=/<(span|a)\b[^<>]*\bdir="rtl"[^<>]*>([\s\S]*?)<\/\1>/gu;
const SCOPE=process.env.SCOPE??"all";   // "all" = whole in-scope text locus; "audit" = dir=rtl wrapped definition text
const freq=new Map(), where=new Map();
const fields=(e)=>{const o=[],p=(k,s)=>{typeof s==="string"&&o.push([k,s])};
  p("headword",e.headword); for(const a of e.alt_headwords??[])p("alt",a); for(const x of e.plural_form??[])p("plural",x);
  const w=(s)=>{if(!s)return; p("def",s.definition); p("num",s.number); for(const n of s.senses??[])w(n)};
  for(const s of e.content?.senses??[])w(s); p("morph",e.content?.morphology);
  for(const q of e.quotes??[])for(const x of q??[])p("quotes",x); return o};
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){
 const e=JSON.parse(l);
 for(const [k,f] of fields(e)){
  if(SCOPE==="audit"&&k!=="def")continue;
  const mask=new Array(f.length).fill(false);
  for(const m of f.matchAll(TAG))for(let i=m.index;i<m.index+m[0].length;i++)mask[i]=true;
  const rtl=new Array(f.length).fill(false);
  for(const m of f.matchAll(RTLW))for(let i=m.index+m[0].indexOf(">")+1;i<m.index+m[0].length;i++)rtl[i]=true;
  for(const m of f.matchAll(TOK)){ const p=m.index+m[0].indexOf(Q);
   if(mask[p]) continue; if(SCOPE==="audit"&&!rtl[p]) continue;
   freq.set(m[0],(freq.get(m[0])??0)+1); (where.get(m[0])??where.set(m[0],new Set()).get(m[0])).add(e.rid); } } }
const pen=(t)=>[...t.slice(t.indexOf(Q)+1)].filter(c=>LET.test(c)).length===1;
const bare=(t)=>t.split(Q).join("");
const byBare=new Map(); for(const t of freq.keys()){const b=bare(t);(byBare.get(b)??byBare.set(b,[]).get(b)).push(t);}
let A=0,B=0,C=0; const rb=[],rc=[];
for(const [t,n] of freq){ if(pen(t)){A+=n;continue;}
  const tw=(byBare.get(bare(t))||[]).filter(x=>x!==t&&pen(x)).sort((x,y)=>freq.get(y)-freq.get(x))[0];
  if(tw&&freq.get(tw)>n){B+=n;rb.push([n,t,tw,freq.get(tw),[...where.get(t)]]);}
  else {C+=n;rc.push([n,t,tw??"(none)",tw?freq.get(tw):0,[...where.get(t)]]);} }
console.log("A",A,"| B",B,"occ /",rb.length,"types | C",C,"occ /",rc.length,"types | total",A+B+C);
for(const r of rb.sort((a,b)=>b[0]-a[0]))console.log("B",String(r[0]).padStart(3),r[1],"-> twin",r[2],"("+r[3]+")","|",r[4].join(" "));
for(const r of rc.sort((a,b)=>b[0]-a[0]))console.log("C",String(r[0]).padStart(3),r[1],"| twin",r[2],"("+r[3]+")","|",r[4].join(" "));'
```

Run with `SCOPE=audit`, this returns **`A 1820 | B 49 occ / 12 types |
C 34 occ / 29 types | total 1903`** — reproducing the riders' 49 and 34
exactly.

Run with `SCOPE=all` over the whole in-scope text locus (bare RTL,
`headword`, `alt_headwords`, `plural_form`, `quotes[]` included), the
register is larger: **`A 2019 | B 55 occ / 16 types | C 45 occ / 33
types | total 2119`**. The riders' 49/34 are a subset; the figures the
transform author must plan for are **55 and 45**.

The register's token model (`[HEBREW]+"[HEBREW]+`) covers 2,119 of the
2,125 text-locus occurrences. The 6 it cannot tokenise are the
double-quote and combining-dot tokens already named above — A00253,
U01408 (`יה"ש"ר`), A00409 (`א"תב"ש`), A01394 (`ה"דא"א`), Q00157
(`פ"וגחמ"ט`), M01940 (`מ̇ס̇"ך̇`) — and the `SCOPE=audit` run leaves
them unclassified rather than losing them.

### Closing the register against the sub-job table

The `SCOPE=audit` run above matches B and C but its total is 1,903 and
its A is 1,820, where the sub-job table at `:86–90` totals
**1,826 + 49 + 34 = 1,909**. Six occurrences short, and they are all on
the A side. Two adjustments close it exactly, and both are scope
corrections to the probe rather than to the audit:

1. **The riders' scope is `dir=rtl`-wrapped *body text*, not
   definition text.** The body-text probe at `:42` covers
   `senses[].definition` (incl. nested), `content.morphology` **and
   `quotes[][]`**, and its field split at `:49` records exactly 1
   occurrence in `quotes[]`. `SCOPE=audit` filters to `def` and drops
   that one.
2. **The 5 untokenisable occurrences inside that scope are class A.**

```bash
bun -e 'const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34), TAG=/<[^<>]*>/gu, DOT="̇";
const H=new RegExp("^["+HEBREW+"]$","u"), LET=/^[א-ת]$/u;
const TOK=new RegExp("["+HEBREW+"]+"+Q+"["+HEBREW+"]+","gu");
const RTLW=/<(span|a)\b[^<>]*\bdir="rtl"[^<>]*>([\s\S]*?)<\/\1>/gu;
const scan=(s)=>{const o=[];for(let i=0;i<s.length;i++){if(s[i]!==Q)continue;
 let j=i-1;while(j>=0&&s[j]===DOT)j--;let k=i+1;while(k<s.length&&s[k]===DOT)k++;
 if(j>=0&&k<s.length&&H.test(s[j])&&H.test(s[k]))o.push(i);}return o;};
const slot=(s,p)=>{let n=0;for(let i=p+1;i<s.length;i++){const c=s[i];
 if(LET.test(c))n++; else if(c===Q||c===DOT||H.test(c))continue; else break;} return n;};
let pop=0, tokd=0, quotesField=0; const un=[];
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){
 const e=JSON.parse(l);
 const go=(k,f)=>{if(typeof f!=="string")return;
  const mask=new Array(f.length).fill(false);
  for(const m of f.matchAll(TAG))for(let i=m.index;i<m.index+m[0].length;i++)mask[i]=true;
  const rtl=new Array(f.length).fill(false);
  for(const m of f.matchAll(RTLW))for(let i=m.index+m[0].indexOf(">")+1;i<m.index+m[0].length;i++)rtl[i]=true;
  const tq=new Set(); for(const m of f.matchAll(TOK)) tq.add(m.index+m[0].indexOf(Q));
  for(const p of scan(f)){ if(mask[p]||!rtl[p])continue; pop++; if(k==="quotes[]")quotesField++;
   if(tq.has(p)) tokd++; else un.push([e.rid,slot(f,p)]); }};
 const w=(s)=>{if(!s)return; go("definition",s.definition); go("number",s.number); for(const n of s.senses??[])w(n)};
 for(const s of e.content?.senses??[])w(s); go("morphology",e.content?.morphology);
 for(const q of e.quotes??[])for(const x of q??[])go("quotes[]",x); }
console.log("audit body-text population:",pop,"| tokenised:",tokd,"| untokenisable:",un.length);
console.log("of which in quotes[] (dropped by SCOPE=audit):",quotesField);
for(const [r,s] of un.sort()) console.log("   ",r,"letters after quote:",s,s===1?"=> penultimate => class A":"=> NOT class A");'
```

```
audit body-text population: 1909 | tokenised: 1904 | untokenisable: 5
of which in quotes[] (dropped by SCOPE=audit): 1
    A00253 letters after quote: 1 => penultimate => class A
    A00409 letters after quote: 1 => penultimate => class A
    A01394 letters after quote: 1 => penultimate => class A
    M01940 letters after quote: 1 => penultimate => class A
    U01408 letters after quote: 1 => penultimate => class A
```

All five sit in the canonical penultimate slot, so 1,820 + 5 + the 1
`quotes[]` occurrence = **1,826**, and 1,903 + 5 + 1 = **1,909**.

Classifying per *occurrence* rather than per token, so nothing is
untokenisable, over the audit's full body-text scope:

```bash
cat > "${TMPDIR:-/tmp}/subjob.ts" <<'TS'
const {HEBREW}=await import(process.cwd()+"/admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34), TAG=/<[^<>]*>/gu, DOT="̇";
const H=new RegExp("^["+HEBREW+"]$","u"), LET=/^[א-ת]$/u;
const TOK=new RegExp("["+HEBREW+"]+"+Q+"["+HEBREW+"]+","gu");
const RTLW=/<(span|a)\b[^<>]*\bdir="rtl"[^<>]*>([\s\S]*?)<\/\1>/gu;
const scan=(s)=>{const o=[];for(let i=0;i<s.length;i++){if(s[i]!==Q)continue;
 let j=i-1;while(j>=0&&s[j]===DOT)j--;let k=i+1;while(k<s.length&&s[k]===DOT)k++;
 if(j>=0&&k<s.length&&H.test(s[j])&&H.test(s[k]))o.push(i);}return o;};
const slot=(s,p)=>{let n=0;for(let i=p+1;i<s.length;i++){const c=s[i];
 if(LET.test(c))n++; else if(c===Q||c===DOT||H.test(c))continue; else break;} return n;};
const freq=new Map(), where=new Map(); const occs=[];
for(const l of (await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean)){
 const e=JSON.parse(l);
 const go=(f)=>{if(typeof f!=="string")return;
  const mask=new Array(f.length).fill(false);
  for(const m of f.matchAll(TAG))for(let i=m.index;i<m.index+m[0].length;i++)mask[i]=true;
  const rtl=new Array(f.length).fill(false);
  for(const m of f.matchAll(RTLW))for(let i=m.index+m[0].indexOf(">")+1;i<m.index+m[0].length;i++)rtl[i]=true;
  const tq=new Map(); for(const m of f.matchAll(TOK)) tq.set(m.index+m[0].indexOf(Q), m[0]);
  for(const p of scan(f)){ if(mask[p]||!rtl[p])continue;
   const t=tq.get(p);
   if(t!==undefined){ freq.set(t,(freq.get(t)??0)+1); (where.get(t)??where.set(t,new Set()).get(t)).add(e.rid); }
   occs.push({rid:e.rid, tok:t, slot:slot(f,p)}); }};
 const w=(s)=>{if(!s)return; go(s.definition); go(s.number); for(const n of s.senses??[])w(n)};
 for(const s of e.content?.senses??[])w(s); go(e.content?.morphology);
 for(const q of e.quotes??[])for(const x of q??[])go(x); }
const pen=(t)=>[...t.slice(t.indexOf(Q)+1)].filter(c=>LET.test(c)).length===1;
const bare=(t)=>t.split(Q).join("");
const byBare=new Map(); for(const t of freq.keys()){const b=bare(t);(byBare.get(b)??byBare.set(b,[]).get(b)).push(t);}
let A=0,B=0,C=0; const rb=new Map(), rc=new Map();
for(const o of occs){
 if(o.tok===undefined){ if(o.slot===1){A++;continue;} C++; continue; }
 if(pen(o.tok)){A++;continue;}
 const tw=(byBare.get(bare(o.tok))||[]).filter(x=>x!==o.tok&&pen(x)).sort((x,y)=>freq.get(y)-freq.get(x))[0];
 if(tw&&freq.get(tw)>freq.get(o.tok)){B++; rb.set(o.tok,[freq.get(o.tok),tw,freq.get(tw),[...where.get(o.tok)]]);}
 else {C++; rc.set(o.tok,[freq.get(o.tok),tw??"(none)",tw?freq.get(tw):0,[...where.get(o.tok)]]);} }
console.log("A",A,"| B",B,"occ /",rb.size,"types | C",C,"occ /",rc.size,"types | total",A+B+C);
if(process.env.LIST){
 console.log("\n== CLASS B (49) ==");
 for(const [t,v] of [...rb].sort((a,b)=>b[1][0]-a[1][0])) console.log("|",v[0],"| `"+t+"` | `"+v[1]+"` ("+v[2]+") |",v[3].join(" "),"|");
 console.log("\n== CLASS C (34) ==");
 for(const [t,v] of [...rc].sort((a,b)=>b[1][0]-a[1][0])) console.log("|",v[0],"| `"+t+"` |",v[1]==="(none)"?"—":"`"+v[1]+"` ("+v[2]+")","|",v[3].join(" "),"|");
}
TS
bun "${TMPDIR:-/tmp}/subjob.ts"
```

```
A 1826 | B 49 occ / 12 types | C 34 occ / 29 types | total 1909
```

**All three cells of the sub-job table reproduce exactly** — 1,826 /
49 / 34, totalling 1,909, which is the 1,912 of `:48` less the 3 D00478
artifacts of `:75`. The riders' 49 and 34 are confirmed, and their
scope is pinned: **`dir=rtl`-wrapped body text — `senses[].definition`
(incl. nested), `content.morphology` and `quotes[][]`.**

A fourth check falls out of the same run. This audit's class-B row at
`:89` names six twin frequencies in passing; the register reproduces
**all six** in this scope, none of which it was fitted to:

| `:89` says | Register |
|---|---|
| `הק"בה` 15 vs `הקב"ה` 194 | 15 vs 194 |
| `ב"וד` 9 vs `בו"ד` 19 | 9 vs 19 |
| `בע"הב` 2 vs 12 | 2 vs 12 |
| `להק"בה` 2 vs 14 | 2 vs 14 |
| `גי"מל` 1 vs 8 | 1 vs 8 |
| `רו"הק` 1 vs 6 | 1 vs 6 |

and the class-C row at `:90`'s `עכ"ום` "(12, twin `עכו"ם` 16)" comes
back as 12 vs 16. These frequencies are scope-sensitive — over the full
in-scope text locus the same twins read 200, 19, 12, 15, 9, 6 — so
matching all seven is independent evidence that the scope above is the
right one.

> **Correction, recorded.** An earlier draft of this section claimed
> `A 1820` matched the sub-job table at `:88`. It does not: `:88` reads
> **1,826**. The 1,820 coincides with the *`<span dir=rtl>` text only*
> figure at `:55`, which is a different scope and a coincidence, not a
> corroboration. The argument above replaces it.

### The heuristic that does *not* work, and why

A frequency-only variant — "flag every token that shares a bare
skeleton with a more frequent twin", with no slot test at all:

```bash
bun -e 'const {HEBREW}=await import("./admin/pipeline/transform/html.ts");
const Q=String.fromCharCode(34), TOK=new RegExp("["+HEBREW+"]+"+Q+"["+HEBREW+"]+","gu");
const freq=new Map(), where=new Map();
const fields=(e)=>{const o=[],p=(s)=>{typeof s==="string"&&o.push(s)};
  p(e.headword); for(const a of e.alt_headwords??[])p(a); for(const x of e.plural_form??[])p(x);
  const w=(s)=>{if(!s)return; p(s.definition); p(s.number); for(const n of s.senses??[])w(n)};
  for(const s of e.content?.senses??[])w(s); p(e.content?.morphology);
  for(const q of e.quotes??[])for(const x of q??[])p(x); return o};
const es=(await Bun.file("data/source/jastrow-dictionary.jsonl").text()).split("\n").filter(Boolean).map(l=>JSON.parse(l));
for(const e of es) for(const f of fields(e)) for(const m of f.matchAll(TOK)){
  freq.set(m[0],(freq.get(m[0])??0)+1); (where.get(m[0])??where.set(m[0],new Set()).get(m[0])).add(e.rid); }
const bare=(t)=>t.split(Q).join("");
const byBare=new Map();
for(const t of freq.keys()){ const b=bare(t); (byBare.get(b)??byBare.set(b,[]).get(b)).push(t); }
for(const [b,ts] of byBare){ if(ts.length<2) continue;
  const sorted=ts.sort((x,y)=>freq.get(y)-freq.get(x));
  for(const t of sorted.slice(1)) console.log(freq.get(t), JSON.stringify(t), "vs dominant", JSON.stringify(sorted[0]), freq.get(sorted[0]), "|", [...where.get(t)].join(" ")); }' \
 | sort -rn | tee /dev/stderr | awk '{s+=$1; n++} END {print "rows:", n, "occurrences:", s}'
```

```
rows: 21 occurrences: 66
```

whose first row is

```
16 "עכו\"ם" vs dominant "עכ\"ום" 24 | C00358 C00785 H00553 K00249 K00425 M00511 M00761 N00201 N00847 Q01379 P01490 T00082
```

**21 token types / 66 occurrences, and the direction is inverted.** It
flags the *canonical* `עכו"ם` as the decline, because the displaced
`עכ"ום` happens to be the more frequent of the pair. Frequency alone
does not identify displacement; the slot test is what does, and that is
why the register above tests the slot first and consults frequency only
to rank twins.

### The riders' 49 and 34, by rid — narrower scope

Run the sub-job command above with `LIST=1`. These are the sets the
riders at `:177` refer to: `dir=rtl`-wrapped body text only. The wider
in-scope sets (55 and 45) follow in the next two subsections; **both
are recorded, because the riders' figures are what the audit committed
to and the wider figures are what the transform must actually handle.**

**Class B — displaced, audit scope (49 occ, 12 types)**

| Occ | Token | Canonical twin (occ) | rids |
|---:|---|---|---|
| 15 | `הק"בה` | `הקב"ה` (194) | A02325 B01335 C00049 E00668 I00749 M00957 O00478 Q00926 Q00997 P01130 P01362 Q02054 S00277 T00538 U01960 |
| 12 | `עכ"ום` | `עכו"ם` (16) | A00692 A03169 B01347 C00901 J00631 M02983 M02997 M00273 P00026 Q00870 |
| 9 | `ב"וד` | `בו"ד` (19) | B01371 K01339 M00607 N01108 N01113 N01118 Q00557 U00122 |
| 2 | `בע"הב` | `בעה"ב` (12) | B01100 C00907 |
| 2 | `שהק"בה` | `שהקב"ה` (5) | K01339 Q00380 |
| 2 | `לעכ"ום` | `לעכו"ם` (3) | N00072 S00375 |
| 2 | `להק"בה` | `להקב"ה` (14) | N00500 N01304 |
| 1 | `או"הע` | `אוה"ע` (3) | A00692 |
| 1 | `גי"מל` | `גימ"ל` (8) | C00994 |
| 1 | `בעו"הז` | `בעוה"ז` (3) | K01280 |
| 1 | `רו"הק` | `רוה"ק` (6) | O01233 |
| 1 | `עי"ין` | `עיי"ן` (2) | P00000 |

**Class C — undetermined, audit scope (34 occ, 29 types)**

| Occ | Token | Twin, if any (occ) | rids |
|---:|---|---|---|
| 3 | `ש"ין` | `שי"ן` (2) | N01300 Q00883 |
| 2 | `עו"הב` | `עוה"ב` (2) | B00007 B01368 |
| 2 | `בי"תא` | `בית"א` (2) | B00578 B00751 |
| 2 | `לעו"הב` | `לעוה"ב` (1) | H01114 K00762 |
| 1 | `אברוש"די` | — | A00218 |
| 1 | `א"תב` | — | A00409 |
| 1 | `אוכ"טא` | — | A01208 |
| 1 | `אפ"טא` | — | A01208 |
| 1 | `ה"דא` | — | A01394 |
| 1 | `אלפ"ין` | — | A01935 |
| 1 | `דת"המ` | — | A02918 |
| 1 | `לא"הק` | — | A03192 |
| 1 | `וש"ין` | `ושי"ן` (1) | B00435 |
| 1 | `העו"הב` | — | B01368 |
| 1 | `דַּלְ"תִים` | — | D00863 |
| 1 | `דַּלְ"תִין` | — | D00863 |
| 1 | `הֵי"הִין` | — | E00004 |
| 1 | `זַיְי"נִין` | — | G00338 |
| 1 | `ט"ית` | `טי"ת` (1) | I00777 |
| 1 | `חֵי"תִין` | — | H00897 |
| 1 | `מעכ"ום` | — | K00464 |
| 1 | `ח"ית` | `חי"ת` (1) | K01339 |
| 1 | `העכ"ום` | — | N00387 |
| 1 | `העב"ום` | — | N00403 |
| 1 | `ע"עז` | — | P00731 |
| 1 | `בעו"הב` | — | R00266 |
| 1 | `לע"ין` | — | Q00141 |
| 1 | `בב"הק` | — | S00097 |
| 1 | `בשִׁ"ין` | — | U00243 |

Every class-C example this audit names in prose at `:90` — `ש"ין`,
`דַּלְ"תִים`, `זַיְי"נִין`, `אוכ"טא`, `ע"עז` — appears in that table.

### Class B — displaced, full in-scope text locus (55 occ, 16 types)

| Occ | Token | Canonical twin (occ) | rids |
|---:|---|---|---|
| 15 | `הק"בה` | `הקב"ה` (200) | A02325 B01335 C00049 E00668 I00749 M00957 O00478 Q00926 Q00997 P01130 P01362 Q02054 S00277 T00538 U01960 |
| 14 | `עכ"ום` | `עכו"ם` (16) | A00692 A03169 B01347 C00901 H01214 J00631 M02983 M02997 M00273 P00026 P00731 Q00870 |
| 9 | `ב"וד` | `בו"ד` (19) | B01371 K01339 M00607 N01108 N01113 N01118 Q00557 U00122 |
| 2 | `בע"הב` | `בעה"ב` (12) | B01100 C00907 |
| 2 | `שהק"בה` | `שהקב"ה` (6) | K01339 Q00380 |
| 2 | `לעכ"ום` | `לעכו"ם` (3) | N00072 S00375 |
| 2 | `להק"בה` | `להקב"ה` (15) | N00500 N01304 |
| 1 | `או"הע` | `אוה"ע` (3) | A00692 |
| 1 | `אט"בח` | `אטב"ח` (2) | A01069 |
| 1 | `א"הר` | `אה"ר` (3) | B00074 |
| 1 | `גי"מל` | `גימ"ל` (9) | C00994 |
| 1 | `ט"ית` | `טי"ת` (3) | I00777 |
| 1 | `בעו"הז` | `בעוה"ז` (3) | K01280 |
| 1 | `ח"ית` | `חי"ת` (2) | K01339 |
| 1 | `רו"הק` | `רוה"ק` (6) | O01233 |
| 1 | `עי"ין` | `עיי"ן` (3) | P00000 |

The `עכ"ום` family is the one to watch: this audit flagged it at `:90`
as a **genuine censorship-era print variant**, not a scribal slip, and
placed it in class C on that ground. The mechanical slot test puts it
in class B because a canonical twin does exist and is (barely) more
frequent — 16 against 14. **The slot test is not adjudicating the
history here, and 16-to-14 is not dominance.** Treat the
`עכ"ום`/`לעכ"ום`/`מעכ"ום`/`העכ"ום` group as undetermined regardless of
which column it lands in.

### Class C — undetermined, full in-scope text locus (45 occ, 33 types)

| Occ | Token | Twin, if any (occ) | rids |
|---:|---|---|---|
| 3 | `בי"תא` | `בית"א` (2) | B00578 B00751 B00757 |
| 3 | `ש"ין` | `שי"ן` (3) | N01300 Q00883 |
| 2 | `אלפ"ין` | — | A01935 |
| 2 | `עו"הב` | `עוה"ב` (2) | B00007 B01368 |
| 2 | `דַּלְ"תִים` | — | D00863 |
| 2 | `דַּלְ"תִין` | — | D00863 |
| 2 | `הֵי"הִין` | — | E00004 |
| 2 | `זַיְי"נִין` | — | G00338 |
| 2 | `חֵי"תִין` | — | H00897 |
| 2 | `לעו"הב` | `לעוה"ב` (1) | H01114 K00762 |
| 1 | `אברוש"די` | — | A00218 |
| 1 | `א"תב` | — | A00409 |
| 1 | `אוכ"טא` | — | A01208 |
| 1 | `אפ"טא` | — | A01208 |
| 1 | `ה"דא` | — | A01394 |
| 1 | `דת"המ` | — | A02918 |
| 1 | `לא"הק` | — | A03192 |
| 1 | `באת"בש` | — | A03391 |
| 1 | `וש"ין` | `ושי"ן` (1) | B00435 |
| 1 | `בס"גר` | — | B00974 |
| 1 | `העו"הב` | — | B01368 |
| 1 | `הז"יו` | — | E00295 |
| 1 | `זַיִ"ין` | — | G00338 |
| 1 | `מעכ"ום` | — | K00464 |
| 1 | `מ"ים` | — | M01200 |
| 1 | `העכ"ום` | — | N00387 |
| 1 | `העב"ום` | — | N00403 |
| 1 | `ע"עז` | — | P00731 |
| 1 | `בעו"הב` | — | R00266 |
| 1 | `לע"ין` | — | Q00141 |
| 1 | `פ"וגחמ` | — | Q00157 |
| 1 | `בב"הק` | — | S00097 |
| 1 | `בשִׁ"ין` | — | U00243 |

### Ruling

**Every member of both classes is glyph-corrected in place and never
moved.** The transform replaces the ASCII `"` with `״` at the position
it already occupies. It does not reposition the mark, and it does not
reorder letters, for any of the 100 occurrences above.

The reasons are the ones this audit already gave, now with the set
pinned. Repositioning would be text invention rather than glyph
correction: for class C the 1903 print was never inspected and
displacement cannot be told from print variant (`:220`), and for class
B a "dominant twin" as thin as 16-to-14 is a frequency observation, not
evidence about what the page says. Moving a mark also changes the token
identity, which would silently break the `data-ref` ↔ `headword`
string-identity match that `:195` warns about.

What the rule *does* owe them: the ASCII quote is a wrong character
wherever it stands, so all 100 are in the population and all 100 get
`״`. They leave the transform correctly glyphed and still displaced,
which is a strictly smaller defect than the one they carry now, and
they are listed here by rid so a later judgement pass — with the print
in hand — can find them.
