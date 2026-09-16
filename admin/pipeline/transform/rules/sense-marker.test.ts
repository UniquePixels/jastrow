import { describe, expect, it } from 'bun:test';
import { parseLabel, printLabel } from '../../body/labels.ts';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { parsePatterns } from '../../patch/patterns.ts';
import { strandedDashStarMarker } from './sense-marker.ts';

/** A minimal entry around the senses under test. */
const entry = (senses: SourceSense[]): SourceEntry => ({
	content: { senses },
	headword: 'אֲמַאי',
	rid: 'T00001',
});

/** The shape all 101 members share: a definition ending in the bare
 * stranded dash, then a sibling carrying the starred marker the dash
 * belongs to. */
const split = (
	tail = '; a. fr.—',
	marker = '*2)',
	next = '<i>he who</i>. Ib.',
): SourceEntry =>
	entry([
		{ definition: tail, number: '1)' },
		{ definition: next, number: marker },
	]);

/** One top-level sense by position, cast because the fixtures always
 * hold the index they ask for. */
const senseAt = (result: SourceEntry, index: number): SourceSense =>
	result.content.senses[index] as SourceSense;

describe('strandedDashStarMarker', () => {
	it('rejoins the dash onto the starred marker, in one step', () => {
		const { entry: after, records } = strandedDashStarMarker.apply(split());
		expect(senseAt(after, 0).definition).toBe('; a. fr.');
		expect(senseAt(after, 1).number).toBe('—*2)');
		expect(senseAt(after, 1).definition).toBe('<i>he who</i>. Ib.');
		expect(records).toHaveLength(1);
	});

	// The dash MOVES. Deleting it and declaring `removes` would pass
	// both text gates too, and would be a different repair: the row's
	// reading is that the dash is the following marker's separator, not
	// debris to trim.
	it('deletes nothing, so declares neither removes nor allows', () => {
		const result = strandedDashStarMarker.apply(split());
		expect(result.removes).toBeUndefined();
		expect(strandedDashStarMarker.allows).toBeUndefined();
	});

	it('writes a value the label grammar round-trips byte-exactly', () => {
		const after = strandedDashStarMarker.apply(split()).entry;
		const written = senseAt(after, 1).number as string;
		const parsed = parseLabel(written);
		expect(parsed).toEqual({ dash: true, label: '2', star: true });
		expect(printLabel(parsed as never)).toBe(written);
	});

	it('repairs every starred marker the row measured', () => {
		for (const marker of ['*2)', '*3)', '*4)', '*5)', '*6)']) {
			const after = strandedDashStarMarker.apply(split('x.—', marker)).entry;
			expect(senseAt(after, 1).number).toBe(`—${marker}`);
		}
	});

	it('returns the input untouched when nothing matches', () => {
		const input = entry([{ definition: 'plain', number: '1)' }]);
		const result = strandedDashStarMarker.apply(input);
		expect(result.entry).toBe(input);
		expect(result.records).toEqual([]);
	});

	// THE PREDICATE NEEDS BOTH SIDES. These two refusals are the batch's
	// row split: each leaves a measured population on its own catalogue
	// row rather than taking it off the queue.
	it('refuses a stranded dash with no starred sibling', () => {
		for (const next of [
			undefined,
			{ definition: 'x' },
			{ definition: 'x', number: '2)' },
		]) {
			const senses =
				next === undefined
					? [{ definition: 'x.—', number: '1)' }]
					: [{ definition: 'x.—', number: '1)' }, next];
			const input = entry(senses);
			expect(strandedDashStarMarker.apply(input).entry).toBe(input);
		}
	});

	it('refuses a starred marker with no stranded dash', () => {
		const input = split('; a. fr.');
		expect(strandedDashStarMarker.apply(input).entry).toBe(input);
	});

	// A marker introduces text. A sibling with none is not the measured
	// shape — all 101 are leaves holding a definition.
	it('refuses a starred sibling that carries no text', () => {
		const input = entry([
			{ definition: 'x.—', number: '1)' },
			{ number: '*2)' },
		]);
		expect(strandedDashStarMarker.apply(input).entry).toBe(input);
	});

	// ROUND 4'S TRAP FOR ANY RE-MEASURER: senses nest, and a
	// non-recursive walk returns 109 of 132 tails.
	it('repairs a nested pair at its own depth', () => {
		const input = entry([
			{
				definition: 'head',
				number: '1)',
				senses: [
					{ definition: 'inner.—', number: '1)' },
					{ definition: 'more', number: '*2)' },
				],
			},
		]);
		const after = strandedDashStarMarker.apply(input).entry;
		const inner = senseAt(after, 0).senses as SourceSense[];
		expect(inner[0]?.definition).toBe('inner.');
		expect(inner[1]?.number).toBe('—*2)');
	});

	it('treats the input as immutable', () => {
		const input = split();
		const before = structuredClone(input);
		strandedDashStarMarker.apply(input);
		expect(input).toEqual(before);
	});

	it('is idempotent — a repaired pair is no longer a match', () => {
		const once = strandedDashStarMarker.apply(split()).entry;
		const twice = strandedDashStarMarker.apply(once);
		expect(twice.entry).toBe(once);
		expect(twice.records).toEqual([]);
	});
});

// ---- 7. the entanglement edge does not survive the rule ----

// THE DELETION IS PINNED HERE BECAUSE NEITHER GATE CAN WITNESS IT.
// `entangledClusters` derives over REGISTERED rules, so an edge whose
// endpoints are both unregistered — which this one was for the whole of
// Phase 2 until batch 7 — never enters a cluster, and the pinned cluster
// list reads 5 clusters with neither row in any of them BOTH before and
// after the deletion. `unaccountedEdges` excludes both-unregistered
// edges by design. So `registry.ts`'s "only pinning the cluster set
// notices" does not hold for this class, and the assertion below is the
// one thing standing between a measured deletion and a silent one.
it('records the deleted entanglement edge as deleted', async () => {
	const rows = parsePatterns(
		await Bun.file('data/patches/patterns.jsonl').text(),
	);
	const edges = (id: string): readonly string[] =>
		rows.find((row) => row.id === id)?.entangledWith ?? [];
	// THE ASSERTION IS THE ABSENCE OF THIS EDGE, not the absence of all
	// edges. A first version pinned `entangledWith` as `undefined` on
	// both rows, which was stronger than the fact it protects — and the
	// same batch falsified it, when the commutation gate found
	// `trailing-em-dash-tail × continuation-marker-em-dash-loss` and that
	// row correctly gained an edge. Pinning more than the claim needs is
	// how a gate starts failing for reasons it was never about.
	expect(edges('trailing-em-dash-tail')).not.toContain(
		'sense-number-outside-closed-grammar',
	);
	expect(edges('sense-number-outside-closed-grammar')).toEqual([]);
}, 30_000);
