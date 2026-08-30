import { describe, expect, it } from 'bun:test';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import {
	adjacentVerbatimRepeat,
	duplicatedOpeningRun,
	MIN_ADJACENT,
	MIN_OPENING,
	squarePrefix,
} from './duplication.ts';

const entry = (senses: SourceSense[]): SourceEntry => ({
	content: { senses },
	headword: 'אֲחַד',
	rid: 'T00001',
});
const one = (definition: string): SourceEntry => entry([{ definition }]);
const defOf = (e: SourceEntry, i = 0): string | undefined =>
	e.content.senses[i]?.definition;

/** A run long enough to clear both minimums, with a period at its end so
 * the adjacent rule can see it. */
const RUN = ' part. pass. of.';

describe('squarePrefix', () => {
	it('finds the maximal repeated prefix, not a suffix of it', () => {
		expect(squarePrefix(`${RUN}${RUN}tail`)).toBe(RUN.length);
	});

	it('returns 0 below the minimum', () => {
		expect(squarePrefix('ababX')).toBe(0);
		expect(squarePrefix('')).toBe(0);
	});

	// THE CAP TRAP, as a test. A proper suffix of the first copy is
	// followed by the second copy's PREFIX, not by itself — so a bounded
	// search does not shorten a long member, it loses it. This fixture is
	// 200 characters, past the 120 a first pass used.
	it('finds a run longer than any plausible cap', () => {
		const long = `${'ab'.repeat(99)}c.`;
		expect(long).toHaveLength(200);
		expect(squarePrefix(`${long}${long}`)).toBe(200);
	});
});

describe('duplicatedOpeningRun', () => {
	it('deletes the duplicated opening and keeps the rest', () => {
		const { entry: after, records } = duplicatedOpeningRun.apply(
			one(`${RUN}${RUN}אֲחַד`),
		);
		expect(defOf(after)).toBe(`${RUN}אֲחַד`);
		expect(records).toHaveLength(1);
	});

	it('declares exactly what it removed', () => {
		const result = duplicatedOpeningRun.apply(one(`${RUN}${RUN}x`));
		expect(result.removes).toEqual([RUN]);
	});

	it('declares the anchors it removed', () => {
		const anchored = ' <a href="/x" data-ref="X">same</a>, ';
		const result = duplicatedOpeningRun.apply(
			one(`${anchored}${anchored}rest`),
		);
		expect(result.unlinks).toBe(1);
		// STRIPPED, because the loss gate compares `textOf`, which strips
		// tags. Declaring the raw run is refused as absent from the input.
		expect(result.removes).toEqual([' same, ']);
	});

	it('declares no unlinks when the run holds no anchor', () => {
		expect(
			duplicatedOpeningRun.apply(one(`${RUN}${RUN}x`)).unlinks,
		).toBeUndefined();
	});

	it('returns the input untouched when nothing matches', () => {
		const input = one('a plain definition with no repetition at all.');
		const result = duplicatedOpeningRun.apply(input);
		expect(result.entry).toBe(input);
		expect(result.records).toEqual([]);
	});

	it(`refuses a repeat shorter than ${MIN_OPENING}`, () => {
		const input = one('ababrest');
		expect(duplicatedOpeningRun.apply(input).entry).toBe(input);
	});

	// 65 of the 88 members sit in a nested (stem-section) sense, so a
	// non-recursive walk would miss three quarters of the population.
	it('repairs a nested sense at its own depth', () => {
		const input = entry([
			{ definition: 'head', senses: [{ definition: `${RUN}${RUN}inner` }] },
		]);
		const after = duplicatedOpeningRun.apply(input).entry;
		expect(after.content.senses[0]?.senses?.[0]?.definition).toBe(
			`${RUN}inner`,
		);
	});

	it('treats the input as immutable', () => {
		const input = one(`${RUN}${RUN}x`);
		const before = structuredClone(input);
		duplicatedOpeningRun.apply(input);
		expect(input).toEqual(before);
	});

	it('is idempotent', () => {
		const once = duplicatedOpeningRun.apply(one(`${RUN}${RUN}x`)).entry;
		expect(duplicatedOpeningRun.apply(once).entry).toBe(once);
	});
});

describe('adjacentVerbatimRepeat', () => {
	it('deletes the second copy and keeps the first', () => {
		const { entry: after, records } = adjacentVerbatimRepeat.apply(
			one(`lead${RUN}${RUN}tail`),
		);
		expect(defOf(after)).toBe(`lead${RUN}tail`);
		expect(records).toHaveLength(1);
		expect(after.content.senses).toHaveLength(1);
	});

	it('declares exactly what it removed', () => {
		expect(
			adjacentVerbatimRepeat.apply(one(`lead${RUN}${RUN}x`)).removes,
		).toEqual([RUN]);
	});

	// THE BOUNDARY BETWEEN THE TWO ROWS, as a test. Offset 0 belongs to
	// `duplicatedOpeningRun`; this rule must not see it, or the two rows
	// would both claim the same run.
	it('refuses a repeat anchored at offset 0', () => {
		const input = one(`${RUN}${RUN}tail`);
		expect(adjacentVerbatimRepeat.apply(input).entry).toBe(input);
	});

	it('refuses a run not ending in a period', () => {
		const noStop = ' part pass of ';
		const input = one(`lead${noStop}${noStop}x`);
		expect(adjacentVerbatimRepeat.apply(input).entry).toBe(input);
	});

	it(`refuses a repeat shorter than ${MIN_ADJACENT}`, () => {
		const input = one('leadab.ab.tail');
		expect(adjacentVerbatimRepeat.apply(input).entry).toBe(input);
	});

	it('declares the anchors it removed', () => {
		const anchored = ' v. <a href="/x" data-ref="X">supra</a>.';
		const result = adjacentVerbatimRepeat.apply(
			one(`lead${anchored}${anchored}x`),
		);
		expect(result.unlinks).toBe(1);
		expect(result.removes).toEqual([' v. supra.']);
	});

	it('treats the input as immutable', () => {
		const input = one(`lead${RUN}${RUN}x`);
		const before = structuredClone(input);
		adjacentVerbatimRepeat.apply(input);
		expect(input).toEqual(before);
	});

	it('is idempotent', () => {
		const once = adjacentVerbatimRepeat.apply(one(`lead${RUN}${RUN}x`)).entry;
		expect(adjacentVerbatimRepeat.apply(once).entry).toBe(once);
	});
});

describe('the two rules together', () => {
	// `I00509` is the one corpus entry both rules touch. They take
	// different runs and compose to the same entry in either order —
	// asserted here on a fixture of the same shape, and on the entry
	// itself in `duplication-corpus.test.ts`.
	it('compose order-independently when one entry holds both', () => {
		const input = one(`${RUN}${RUN}middle${RUN}${RUN}tail`);
		const ab = adjacentVerbatimRepeat.apply(
			duplicatedOpeningRun.apply(input).entry,
		);
		const ba = duplicatedOpeningRun.apply(
			adjacentVerbatimRepeat.apply(input).entry,
		);
		expect(ab.entry).toEqual(ba.entry);
	});
});
