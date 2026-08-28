import { expect, it } from 'bun:test';
import { applyRepairs } from './repairs.ts';
import { readSourceEntries } from './source.ts';
import type { SourceSense } from './types.ts';

/**
 * The standing gate under batch 6a's two DISCARDS
 * (`binyan-form-leading-space` 457, `binyan-form-empty-slot` 446).
 *
 * Both rows were discarded on one measured ground: `cleanBinyanForms`
 * (`repairs.ts`) already repairs them corpus-wide, and it runs inside
 * `applyRepairs`, which is upstream of every transform. A discard on
 * that ground is only as durable as the pass it names — delete or
 * narrow `cleanBinyanForms` and 523 leading spaces and 486 empty slots
 * return with no row left in the catalogue to describe them, and no
 * other test in the suite counts either shape.
 *
 * So the audit's arithmetic is asserted here rather than only
 * published: RAW figures (the catalogue's own claim), POST figures
 * (zero, the discard's premise), and the pass's own record count. A
 * regression fails on the exact number that changed.
 *
 * ONE WALK, memoised, in the corpus-tier style `headword.corpus.test.ts`
 * records, with an explicit timeout on the `it` that pays for it.
 * Audit: `data/patches/catalogue-audit/binyan-form-cleanup.md`.
 */

interface Census {
	corpusEntries: number;
	/** The same three shapes after `applyRepairs`. Every one is the
	 * discard's premise and must be 0. Wider than the raw pair on one
	 * axis deliberately: the leading count here takes ANY index, so a
	 * repair that moved a defect to index 0 would fail rather than
	 * vanish between the two questions. */
	postEmptySlots: number;
	postLeadOccurrences: number;
	postTrailOccurrences: number;
	/** Entries holding at least one empty `binyan_form` slot, raw. */
	rawEmptyEntries: number;
	/** Empty-string slots across every `binyan_form`, raw. */
	rawEmptySlots: number;
	/** Items at index 0 opening with whitespace, raw. The row's evidence
	 * for a split site rather than a convention: index 0 never carries
	 * it. */
	rawLeadAtZero: number;
	/** Entries holding at least one leading-space item after index 0. */
	rawLeadEntries: number;
	/** Items after index 0 opening with whitespace, raw. */
	rawLeadOccurrences: number;
	/** Items with TRAILING whitespace, raw — `cleanBinyanForms` trims
	 * both edges, so the row's leading-only reading is checked against
	 * the pass's wider one. */
	rawTrailOccurrences: number;
	/** `binyan-cleanup` records `applyRepairs` emitted, and the entries
	 * carrying them. */
	repairEntries: number;
	repairRecords: number;
}

const LEADING = /^\s/u;
const TRAILING = /\s$/u;

function walk(
	senses: readonly SourceSense[],
	visit: (sense: SourceSense) => void,
): void {
	for (const sense of senses) {
		visit(sense);
		walk(sense.senses ?? [], visit);
	}
}

/** Every `binyan_form` item in one entry, senses nested to any depth,
 * paired with its index in its OWN array. The index is load-bearing:
 * the row's whole evidence for a split site is that index 0 never
 * carries the defect. */
function itemsOf(senses: readonly SourceSense[]): [number, string][] {
	const items: [number, string][] = [];
	walk(senses, (sense) => {
		for (const pair of sense.grammar?.binyan_form?.entries() ?? []) {
			items.push(pair);
		}
	});
	return items;
}

function zero(): Census {
	return {
		corpusEntries: 0,
		postEmptySlots: 0,
		postLeadOccurrences: 0,
		postTrailOccurrences: 0,
		rawEmptyEntries: 0,
		rawEmptySlots: 0,
		rawLeadAtZero: 0,
		rawLeadEntries: 0,
		rawLeadOccurrences: 0,
		rawTrailOccurrences: 0,
		repairEntries: 0,
		repairRecords: 0,
	};
}

/** Which of the four raw shapes one `binyan_form` item is, at its own
 * index. An empty slot is only that — it carries no edge to test — and
 * a leading space is either the row's defect or the index-0 shape the
 * row says does not exist, never both. */
function classify(
	value: string,
	index: number,
): { empty: boolean; lead: boolean; leadAtZero: boolean; trail: boolean } {
	const empty = value === '';
	const leading = !empty && LEADING.test(value);
	return {
		empty,
		lead: leading && index > 0,
		leadAtZero: leading && index === 0,
		trail: !empty && TRAILING.test(value),
	};
}

/** One entry's raw figures, folded in. Returns per-entry presence so
 * the caller can tally ENTRIES as well as occurrences — the catalogue
 * states both, and only the pair distinguishes 523 items from 457
 * entries. */
function censusRaw(c: Census, senses: readonly SourceSense[]): void {
	let empty = 0;
	let lead = 0;
	for (const [index, value] of itemsOf(senses)) {
		const shape = classify(value, index);
		empty += Number(shape.empty);
		lead += Number(shape.lead);
		c.rawLeadAtZero += Number(shape.leadAtZero);
		c.rawTrailOccurrences += Number(shape.trail);
	}
	c.rawEmptySlots += empty;
	c.rawLeadOccurrences += lead;
	if (empty > 0) {
		c.rawEmptyEntries++;
	}
	if (lead > 0) {
		c.rawLeadEntries++;
	}
}

/** The same shapes, counted on the REPAIRED entry through the same
 * `classify` — one predicate, both sides, so a post figure of 0 cannot
 * be an artefact of the two sides asking different questions. Each must
 * total 0 corpus-wide; that is the discard's whole premise. */
function censusPost(c: Census, senses: readonly SourceSense[]): void {
	for (const [index, value] of itemsOf(senses)) {
		const shape = classify(value, index);
		c.postEmptySlots += Number(shape.empty);
		c.postLeadOccurrences += Number(shape.lead || shape.leadAtZero);
		c.postTrailOccurrences += Number(shape.trail);
	}
}

async function build(): Promise<Census> {
	const c = zero();
	for await (const source of readSourceEntries()) {
		c.corpusEntries++;
		censusRaw(c, source.content.senses);
		const { entry, records } = applyRepairs(source);
		const cleanup = records.filter(
			(record) => record.pass === 'binyan-cleanup',
		);
		c.repairRecords += cleanup.length;
		if (cleanup.length > 0) {
			c.repairEntries++;
		}
		censusPost(c, entry.content.senses);
	}
	return c;
}

let pending: Promise<Census> | undefined;

/** Memoised so the walk runs once per process however many `it`s read
 * it — the convention `headword-census.ts` records. */
const census = (): Promise<Census> => {
	pending ??= build();
	return pending;
};

// The denominator first: a loader that yielded nothing would make every
// "post" figure 0 and pass this file for the wrong reason.
it('reproduces both discarded rows at their catalogued size', async () => {
	const c = await census();
	expect(c.corpusEntries).toBe(32_512);
	expect(c.rawLeadOccurrences).toBe(523);
	expect(c.rawLeadEntries).toBe(457);
	expect(c.rawEmptySlots).toBe(486);
	expect(c.rawEmptyEntries).toBe(446);
}, 180_000);

// The round-2 evidence that the leading space is a split site rather
// than a separator: index 0 never carries one.
it('finds no leading space at index 0', async () => {
	expect((await census()).rawLeadAtZero).toBe(0);
});

// `cleanBinyanForms` trims BOTH edges. The trailing edge has no
// catalogued row because the corpus holds no member of it — recorded so
// a future trailing population is a failure here rather than a silent
// widening of what the pass repairs.
it('finds no trailing whitespace to trim', async () => {
	const c = await census();
	expect(c.rawTrailOccurrences).toBe(0);
	expect(c.postTrailOccurrences).toBe(0);
});

// THE DISCARD'S PREMISE. Nothing downstream of `applyRepairs` — no
// transform, no gate, no report — can see either defect, because the
// pass has already repaired every instance of both.
it('leaves neither defect for a transform to own', async () => {
	const c = await census();
	expect(c.postLeadOccurrences).toBe(0);
	expect(c.postEmptySlots).toBe(0);
});

// The pass's own accounting. 751 entries is smaller than 457 + 446 =
// 903 because one record covers a sense that carries both defects, and
// an entry may carry several senses.
it('emits one binyan-cleanup record per repaired sense', async () => {
	const c = await census();
	expect(c.repairRecords).toBe(938);
	expect(c.repairEntries).toBe(751);
});
