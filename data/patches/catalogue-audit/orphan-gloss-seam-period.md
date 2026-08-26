# Audit — `orphan-gloss-seam-period` (catalogued 19 entries)

**Verdict: WITHDRAWN from `transform` to `judgment`.** The seam is a
real defect — the corpus writes it 12 times against 30,087 clean ones
— but the byte a repair would delete is a candidate TEXT-LOSS MARKER,
and the corpus holds 41 intact instances of the shape whose Hebrew
loss produces this one byte for byte. Deleting it destroys the only
surviving trace at each of the 19 sites.

`corpusCount` UNCHANGED at **19 entries** (19 occurrences, of 56 `. . `
occurrences corpus-wide). Every figure below is an OCCURRENCE count
unless it says otherwise.

## The decision rule, stated BEFORE the number was seen

Taken verbatim from the task-6 brief, which took it from this row's own
`reason` ("The 37-strong sibling family suggests the orphan period
MARKS dropped text rather than being stray debris"):

> If the 19 clean members show the same lost-`(h.` neighbourhood as the
> 37, the period is a loss marker and deleting it destroys evidence →
> `judgment`. If they are clean by the same test that separated them →
> `transform`.

## Measurement 1 — the published separation does not reproduce

The brief's script windows ±60 characters around each `. . ` and calls
a member MARKED when the window matches `/\(h\.|\(ch\.|h\.$/`:

```text
{ clean: 29, marked: 27 }
```

Against the catalogued 19/37. The 56 total reproduces exactly; the
split does not, and the reason is mechanical: the pattern requires a
literal `(h.` and the cognate marker is written `(b. h.` just as often.
Nine members it calls "clean" are plainly the marked family —
C00157 `<i>Gaddai</i>(b. h. . <a>`, G00093, H01222, M00248, M00661,
P00217, S00199, U00883, and Q00580 `(rendering h. . <a>`.

Corrected test — *the first period of the pair terminates an
`h.` / `b. h.` / `ch.` cognate token*, read off the 24 characters
BEFORE the match rather than from a symmetric window, so the marker
has to OWN the period rather than merely sit near it.

**This is the executable form. Run this one, not the one above.**

```ts
// bun run, from the repo root
import { readSourceEntries } from './admin/pipeline/body/source.ts';
import { fieldsOf } from './admin/pipeline/transform/no-new-text.ts';

/** The text running up to the first period ends in `h` or `ch`,
 * optionally prefixed `b.` / `b`, and that token either starts the
 * field or follows a space, `(` or `;`. The catalogue's own
 * `/\(h\.|\(ch\.|h\.$/` misses every `(b. h.` spelling, which is 9
 * members — the whole of the 29/27 discrepancy. */
const H_MARKER = /(?:^|[\s(;])(?:b\.?\s*)?(?:c?h)$/u;
const SEAM = /\. \. /gu;

let marked = 0;
let clean = 0;
for await (const entry of readSourceEntries()) {
	for (const field of fieldsOf(entry)) {
		for (const seam of field.matchAll(SEAM)) {
			const at = seam.index ?? 0;
			const before = field.slice(Math.max(0, at - 24), at);
			if (H_MARKER.test(before)) {
				marked += 1;
			} else {
				clean += 1;
			}
		}
	}
}
console.log({ clean, marked });
```

```text
{ clean: 20, marked: 36 }
```

One member separates 36/20 from the catalogued 37/19: **A00505**,
whose `. . ` follows `)` but whose own parenthesis reads
`(prob. in b. h. , <i>perfumes</i>)` — the Hebrew dropped, a comma left
dangling, which is `lost-hebrew-after-h-marker`'s catalogued shape
exactly. Counting it marked reproduces **37 / 19** to the unit.

So the row's own separation is recoverable, but only under a test the
catalogue never published, and the published one is off by ten.

## Measurement 2 — the loss generator the stated test never looks for

The stated test looks for ONE loss signature, the `(h.` marker. There
is a second, and it is live:

```text
</i>. <span dir="rtl">HEBREW</span>. <a class="refLink"     41 occurrences
```

Drop that Hebrew span and what remains is `</i>. . <a` — **this row's
exact shape, byte for byte**. The generator is not hypothetical:
Hebrew-span loss is precisely what the two BLOCKING judgment rows
`lost-h-equivalent` (32) and `lost-hebrew-after-h-marker` (13) record,
and those two rows ARE 37 of this shape's own 56 occurrences. A shorter
non-tag sentence between gloss and citation — the other thing that
could have been dropped between the two periods — occurs 175 times.

## Measurement 3 — the clean set is contaminated at the member level

**P01106** is inside the "clean" 19 and carries the sibling family's
signature in its own field:

```text
(b h.;<i>strong, mighty</i>. . <a>Lam. R. to III, 4</a>
```

An unclosed paren, an `h.` marker, and no Hebrew after it. The
corrected test calls it clean only because its `. . ` attaches to the
gloss rather than to the marker.

## The other side, stated rather than buried

The seam is genuinely anomalous and this row should not be read as
"no defect here":

| Separator between a closing gloss/anchor tag and a citation anchor | Occ |
|---|---|
| `. ` — one period | **30,087** |
| `.—` | 1,349 |
| `. . ` — this row | **12** |

0.04%. Whatever produced it, the corpus does not do this on purpose.
What the withdrawal says is that WHICH byte is surplus — or whether
either is — cannot be determined from the entry.

## Precedent

`doubled-space-as-text-loss-locator` (108, `blocking: true`,
`route: judgment`) is this project already ruling that a doubled seam
token marks dropped text and must not be deleted, with an audit that
says "DO NOT WIDEN THIS ROW". An orphan period at a seam is the same
object with a different character.

## Which test this row failed

**No repair exists** — one of the two tests named in
`batch-3b-withdrawals.md`, and the same test
`homograph-numeral-mismatch` failed in batch 2: a real defect whose
repair cannot be named from the data. A deletion is writable and would
fix the rendered text; it is not defensible, because the byte it
deletes is the marker.

## What a re-run will find

On the pinned snapshot, and stated so a later reader can falsify it:
56 `. . ` occurrences corpus-wide; 37 with an `h.`-family marker owning
the first period, 19 without; 41 intact `</i>. <span dir="rtl">…</span>. <a>`
instances; 12 `</[ia]>. . <a class="refLink"` seams against 30,087
single-period ones.
