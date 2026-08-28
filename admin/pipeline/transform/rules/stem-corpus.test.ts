import { expect, it } from 'bun:test';
import { applyRepairs } from '../../body/repairs.ts';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { applyTransforms } from '../run.ts';

/**
 * Batch 6b's two populations, measured where the rules actually stand.
 *
 * A `structural-repairs` rule never sees raw source and never sees the
 * output of `applyRepairs` alone: the whole `text-repairs` pass — 40
 * rules — runs first. Batch 6a's finding was that measuring a row on
 * raw source cannot tell "unrepaired" from "already repaired by
 * something upstream", so every count here is taken on the composed
 * entry, and the raw figure is asserted alongside only where the two
 * differ.
 *
 * ONE WALK, memoised, in the corpus-tier style
 * `headword.corpus.test.ts` records.
 */

/** A definition ending in a chopped marker and its single space. */
const CHOPPED_TAIL = /(?<marker>—\d+\)) $/u;
/** The same marker with anything at all after it — the 10 the rule
 * refuses, and the reason the row is not 28. */
const MARKER_ANYWHERE = /—\d+\)/u;
const STRAY_PERIOD = /^[A-Z][A-Za-z]*\. \.$/u;
/** The 18 distinct values behind `stem-label-not-a-binyan-name`'s 66,
 * enumerated rather than matched by shape. A pattern cannot draw this
 * line: `"Fem."` and `"Pl."` are print inflection heads that a
 * label-shaped regex reads as binyan names, and `"Pa., part. pass."`
 * is a section head that one reads as a label with debris. The
 * catalogue states the population by enumeration, so this measures it
 * the same way — which also means a rule widening onto a value NOT in
 * this list shows up as a `strayAfter` change rather than here. */
const NOT_A_BINYAN = new Set([
	'*.',
	'* .',
	'*Ithpe.',
	'*Nif.',
	'*Pa.',
	',.',
	'.',
	'(.',
	'[.',
	'[[.',
	'Chief compounds:.',
	'Compounds and combinations: .',
	'Compounds of .',
	'Compounds: .',
	'Fem.',
	'Pa., part. pass.',
	'Part. Hof.',
	'Pl.',
	'נִסְתַּר.',
]);

interface Census {
	/** Entries the structural phase changed, and records it emitted. */
	chopEntries: number;
	/** Chopped-marker pairs before the structural phase runs: the
	 * empty-residue 18 the rule takes, and the residue-bearing rest it
	 * refuses. */
	choppedEmpty: number;
	/** Marker tails still present after the phase — must be 0 for the
	 * empty-residue shape and unchanged for the residue shape. */
	choppedEmptyAfter: number;
	choppedResidue: number;
	choppedResidueAfter: number;
	chopRecords: number;
	corpusEntries: number;
	/** Senses carrying `—2)` before the structural pass and after it.
	 * The rule's yield is the DIFFERENCE: asserting the total would
	 * pin a figure this batch does not own, and an upstream rule that
	 * changed a sense number would then fail here for the wrong
	 * reason. */
	markersAfter: number;
	markersBefore: number;
	nonBinyanAfter: number;
	/** `verbal_stem` values that are not binyan names, before and
	 * after the text-repairs pass, and the stray-period sub-shape. */
	nonBinyanBefore: number;
	strayAfter: number;
	strayBefore: number;
}

function walk(
	senses: readonly SourceSense[],
	visit: (sense: SourceSense, next: SourceSense | undefined) => void,
): void {
	senses.forEach((sense, index) => {
		visit(sense, senses[index + 1]);
		walk(sense.senses ?? [], visit);
	});
}

/** Chopped pairs in one entry, split by whether residue follows. */
function chopCounts(entry: SourceEntry): { empty: number; residue: number } {
	let empty = 0;
	let residue = 0;
	walk(entry.content.senses, (sense, next) => {
		if (sense.definition === undefined || sense.number !== '1)') {
			return;
		}
		if (
			next === undefined ||
			next.definition === undefined ||
			(next.number !== undefined && next.number !== null)
		) {
			return;
		}
		if (CHOPPED_TAIL.test(sense.definition)) {
			empty++;
		} else if (MARKER_ANYWHERE.test(sense.definition)) {
			residue++;
		}
	});
	return { empty, residue };
}

/** Non-binyan `verbal_stem` values in one entry, and the stray-period
 * subset of them. */
function stemCounts(entry: SourceEntry): { stray: number; other: number } {
	let stray = 0;
	let other = 0;
	walk(entry.content.senses, (sense) => {
		const stem = sense.grammar?.verbal_stem;
		if (stem === undefined) {
			return;
		}
		if (STRAY_PERIOD.test(stem)) {
			stray++;
		} else if (NOT_A_BINYAN.has(stem)) {
			other++;
		}
	});
	return { other, stray };
}

async function build(): Promise<Census> {
	const c: Census = {
		chopEntries: 0,
		chopRecords: 0,
		choppedEmpty: 0,
		choppedEmptyAfter: 0,
		choppedResidue: 0,
		choppedResidueAfter: 0,
		corpusEntries: 0,
		markersAfter: 0,
		markersBefore: 0,
		nonBinyanAfter: 0,
		nonBinyanBefore: 0,
		strayAfter: 0,
		strayBefore: 0,
	};
	for await (const source of readSourceEntries()) {
		c.corpusEntries++;
		const healed = applyRepairs(source).entry;
		const before = stemCounts(healed);
		c.strayBefore += before.stray;
		c.nonBinyanBefore += before.other;

		const texted = applyTransforms(healed, 'text-repairs').entry;
		const after = stemCounts(texted);
		c.strayAfter += after.stray;
		c.nonBinyanAfter += after.other;
		const pre = chopCounts(texted);
		c.choppedEmpty += pre.empty;
		c.choppedResidue += pre.residue;
		walk(texted.content.senses, (sense) => {
			if (sense.number === '—2)') {
				c.markersBefore++;
			}
		});

		const run = applyTransforms(texted, 'structural-repairs');
		c.chopRecords += run.records.length;
		if (run.records.length > 0) {
			c.chopEntries++;
		}
		const post = chopCounts(run.entry);
		c.choppedEmptyAfter += post.empty;
		c.choppedResidueAfter += post.residue;
		walk(run.entry.content.senses, (sense) => {
			if (sense.number === '—2)') {
				c.markersAfter++;
			}
		});
	}
	return c;
}

let pending: Promise<Census> | undefined;
/** Memoised so the composed corpus pass runs once per process. */
const census = (): Promise<Census> => {
	pending ??= build();
	return pending;
};

// The denominator first: a short read would make every "after" figure
// 0 and pass this file for the wrong reason.
it('reproduces the chopped-marker population the phase receives', async () => {
	const c = await census();
	expect(c.corpusEntries).toBe(32_512);
	expect(c.choppedEmpty).toBe(18);
	expect(c.choppedResidue).toBe(9);
}, 600_000);

it('repairs every empty-residue member and no other', async () => {
	const c = await census();
	expect(c.chopRecords).toBe(18);
	expect(c.chopEntries).toBe(18);
	expect(c.choppedEmptyAfter).toBe(0);
});

// THE REFUSAL, measured rather than argued: the residue-bearing pairs
// are the same count before and after, so none of the three that hold
// the real opening of sense 2 was touched.
it('leaves every residue-bearing member exactly as it found it', async () => {
	const c = await census();
	expect(c.choppedResidueAfter).toBe(c.choppedResidue);
});

// `—2)` is the corpus's own spelling of a second sense marker, and the
// population it joins is three orders of magnitude larger — 3,985 at
// the time of writing. The assertion is the DELTA, not the total: the
// total is not this batch's to own, and pinning it would fail here the
// day an unrelated rule touched a sense number.
it('adds exactly 18 sense markers, and writes them nowhere else', async () => {
	const c = await census();
	expect(c.markersAfter - c.markersBefore).toBe(18);
	expect(c.markersBefore).toBeGreaterThan(3000);
});

it('repairs the three stray-period stem labels', async () => {
	const c = await census();
	expect(c.strayBefore).toBe(3);
	expect(c.strayAfter).toBe(0);
});

// The row was re-scoped 69 → 3 and the other 66 became
// `stem-label-not-a-binyan-name`. That split is only honest if the 66
// are still there afterwards — a rule quietly widening to claim them
// would show up here.
it('leaves all 66 non-binyan labels untouched', async () => {
	const c = await census();
	expect(c.nonBinyanBefore).toBe(66);
	expect(c.nonBinyanAfter).toBe(66);
});
