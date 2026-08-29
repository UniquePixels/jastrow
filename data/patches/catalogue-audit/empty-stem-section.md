# Audit — `empty-stem-section` (catalogued 342)

**RULED 2026-08-28 (Brian): WITHDRAWN to `route: judgment`,** on the
distinction that decides the whole row — **this is a DISPLAY concern,
not a data one.** The count reproduces, the mechanism is settled, and
no repair is available that does not invent. Written in batch 6b; the
row was one of four that had no `reason` at all, and the largest of
them. Transform route **69 → 68 rows**, 21,014 → **20,672** instances;
`PENDING` 27 → **26**.

Nothing is missing and nothing is malformed. The label and the form
both reach `BodyStem`, the schema permits an empty `senses` array, and
the shape mirrors the print heading it came from. The one piece of
debris the row ever carried — the trailing empty `binyan_form` slot —
is dropped by `cleanBinyanForms` before any rule runs (batch 6a).
**What is left is a Phase 4 rendering item:** show consecutive stem
blocks where all but the last are senseless as one run. Leaving the row
on the transform queue as `blocking` asserted that a rule was owed
before cutover, and none is.

Not a recommendation to `discard`: that would claim there is no defect,
and a reader meeting a bare `Pa. בַּהַית` with no gloss under it cannot
tell that it shares the next block's. What is missing is a way to say
so, not a repair anyone has been unable to write.

## The population, and it is 100% uniform

347 sections across 342 entries — the catalogued 342 reproduces
exactly. Every one of them:

- sits at TOP LEVEL, never nested (347/347)
- carries a `verbal_stem` and at least one real `binyan_form`
- has no `definition` and no child senses
- is followed immediately by ANOTHER stem block — never by a plain
  sense, never last in the entry (347/347)
- **ends its `binyan_form` array with an empty slot** (347/347)

and no two of them are adjacent (0/347).

## The mechanism, which that last figure gives away

Jastrow sets a shared heading:

```text
Pa. בַּהַית, Af. אַבְהֵית to put to shame.
```

Sefaria's parser split it at the comma. The label before the comma
became a block of its own with nothing after it; the gloss stayed with
the last member of the group. **The empty trailing slot is the residue
of that split** — the parser took the text between the comma and the
next label, and there was none.

That slot is already gone by the time any transform runs:
`repairs.ts:445 cleanBinyanForms` drops it corpus-wide inside
`applyRepairs` (batch 6a's discard). So what reaches the model is a
stem block with a real label, a real form, and no senses.

`stranded-stem-head` (582 occ / 575 ent) is the same print phenomenon
seen from the other side — there the parser left the second label
*inside* the first block's prose instead of making a block for it.
Neither row can be read without the other.

## Nothing is lost

`dry-run.ts:193 buildStem` maps the block to
`{forms, senses: [], stem}`: the label and the form both reach
`BodyStem`, and `entry.schema.json` permits an empty `senses` array. So
the reader is shown the stem and its form, with the group's gloss on
the last member — which is what the print page shows.

The next block's own first text opens with a normal italic gloss in
**275** of 347, with a comma or semicolon seam in **29**, and with
something else in **43**.

## Why no repair is available

| Candidate | Why not |
|---|---|
| Duplicate the group's gloss onto each member | Invents text; `checkNoNewText` would reject it, and rightly |
| Merge the members into one block | Needs a joining string. The corpus does spell one — `"Hithpa. a. Nithpa."` ×7, `"Nif. a. Nithpa."`, `"Hithpo. a. Nithpo."` — but `" a. "` is text the input does not hold at that point, and merging would erase the difference between a heading print set as one and a heading print set as several |
| Say structurally that the stems share a gloss | `entry.schema.json` has no way to express it: `stems[]` carries `stem`, `forms`, `senses` and nothing that points at a sibling |
| Leave it | What ships today. Faithful to the print, and opaque to a reader who does not know the convention |

The third line is the real finding: **this is a model question wearing
a transform row's clothes.** The same sentence closes
`stem-label-not-a-binyan-name`, opened in the same batch — two of batch
6's rows turn out to need a decision about `entry.schema.json` rather
than a predicate.

## What a ruling would need to decide

1. Whether `stems[]` gains a way to express a shared heading (a group
   id, a `sharesGlossWith`, or a merged block with an explicit
   `members` list), or
2. whether the renderer is told to present consecutive stem blocks
   where all but the last are senseless as one run — a Phase 4
   presentation rule, with no data change at all, or
3. whether the shape is accepted as print-faithful and the row is
   discarded.

Option 2 costs nothing in the data and is reversible; option 1 is the
only one that lets a consumer other than this app understand the
grouping.

## Reproduce

```bash
bun -e 'import {readSourceEntries} from "./admin/pipeline/body/source.ts";
let sections=0,entries=0,slot=0,nextIsStem=0;
for await (const e of readSourceEntries()){let hit=false;
  // TOP LEVEL ONLY — the audit measures `content.senses`, not the tree.
  e.content.senses.forEach((s,i)=>{const g=s.grammar; if(g===undefined) return;
    const has=(g.binyan_form??[]).length>0||g.verbal_stem!==undefined;
    const content=(s.definition!==undefined&&s.definition!=="")||(s.senses??[]).length>0;
    if(!has||content) return;
    sections++; hit=true;
    if((g.binyan_form??[]).at(-1)==="") slot++;
    if(e.content.senses[i+1]?.grammar!==undefined) nextIsStem++;});
  if(hit) entries++;}
console.log({sections,entries,trailingEmptySlot:slot,nextIsStem});'
```

    { sections: 347, entries: 342, trailingEmptySlot: 347, nextIsStem: 347 }

The three 347s are the audit: every section carries the split residue,
and every one is followed by another stem block.
