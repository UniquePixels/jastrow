import { describe, expect, it } from 'bun:test';
import { parseLabel } from '../../body/labels.ts';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { continuationMarkerDash, DASH } from './continuation-marker.ts';

const entry = (senses: SourceSense[]): SourceEntry => ({
	content: { senses },
	headword: 'אַדְרָא',
	rid: 'T00001',
});
const at = (e: SourceEntry, i: number): SourceSense =>
	e.content.senses[i] as SourceSense;

/** The measured shape: a mixed list whose other members carry the dash,
 * and one bare marker whose predecessor ends in ordinary prose. */
const mixed = (bare = '3)'): SourceEntry =>
	entry([
		{ definition: 'first sense.', number: '1)' },
		{ definition: 'second sense.', number: '—2)' },
		{ definition: 'third sense.', number: bare },
	]);

describe('continuationMarkerDash', () => {
	it('restores the dash on a marker its siblings witness', () => {
		const { entry: after, records } = continuationMarkerDash.apply(mixed());
		expect(at(after, 2).number).toBe('—3)');
		expect(at(after, 1).number).toBe('—2)');
		expect(records).toHaveLength(1);
	});

	// THE DECLARATION IS THE SAFETY ARGUMENT. `allows: ['—']` would
	// license an em dash anywhere in the rule's diff on a maintainer's
	// word; `copied` is verified against THIS ENTRY'S input, and the
	// mixed-list predicate is what guarantees the witness is there.
	it('declares the dash as COPIED, never as allowed', () => {
		const result = continuationMarkerDash.apply(mixed());
		expect(result.copied).toEqual([DASH]);
		expect(continuationMarkerDash.allows).toBeUndefined();
	});

	it('writes a value the label grammar round-trips', () => {
		const written = at(continuationMarkerDash.apply(mixed()).entry, 2)
			.number as string;
		expect(parseLabel(written)).toEqual({
			dash: true,
			label: '3',
			star: false,
		});
	});

	// THE WITNESS IS LOAD-BEARING. Without a dashed sibling nothing in
	// the entry demonstrates the convention, the `copied` declaration
	// would have nothing to verify against, and the 22 members in this
	// position stay on the row.
	it('refuses a list with no dashed sibling', () => {
		const input = entry([
			{ definition: 'first sense.', number: '1)' },
			{ definition: 'second sense.', number: '2)' },
		]);
		expect(continuationMarkerDash.apply(input).entry).toBe(input);
	});

	// The three arms that belong to other rows or to no defect at all.
	// Each fixture puts the excluded tail on the predecessor of the ONLY
	// bare marker, so a pass cannot come from some other sibling.
	it('refuses residue that belongs to another row', () => {
		for (const tail of ['stranded dash—', 'stranded bracket[']) {
			const input = entry([
				{ definition: 'first.', number: '1)' },
				{ definition: tail, number: '—2)' },
				{ definition: 'y', number: '3)' },
			]);
			expect(continuationMarkerDash.apply(input).entry).toBe(input);
		}
	});

	it('refuses a print run continuing with ";" or ","', () => {
		for (const tail of ['a run;', 'a run,']) {
			const input = entry([
				{ definition: 'first.', number: '1)' },
				{ definition: tail, number: '—2)' },
				{ definition: 'y', number: '3)' },
			]);
			expect(continuationMarkerDash.apply(input).entry).toBe(input);
		}
	});

	it('refuses the first sibling and refuses "1)"', () => {
		const input = entry([
			{ definition: 'first.', number: '1)' },
			{ definition: 'x.', number: '—2)' },
		]);
		expect(continuationMarkerDash.apply(input).entry).toBe(input);
	});

	it('refuses a marker that already carries a dash', () => {
		const input = entry([
			{ definition: 'first.', number: '1)' },
			{ definition: 'x.', number: '—2)' },
			{ definition: 'y.', number: '—3)' },
		]);
		expect(continuationMarkerDash.apply(input).entry).toBe(input);
	});

	// Stripped, so a closing tag cannot hide the residue from the test.
	it('sees residue through a closing tag', () => {
		const input = entry([
			{ definition: 'first.', number: '1)' },
			{ definition: '<i>stranded—</i>', number: '—2)' },
			{ definition: 'y', number: '3)' },
		]);
		expect(continuationMarkerDash.apply(input).entry).toBe(input);
	});

	it('repairs a nested list at its own depth', () => {
		const input = entry([
			{
				definition: 'head',
				number: '1)',
				senses: [
					{ definition: 'inner.', number: '1)' },
					{ definition: 'more.', number: '—2)' },
					{ definition: 'last.', number: '3)' },
				],
			},
		]);
		const inner = at(continuationMarkerDash.apply(input).entry, 0)
			.senses as SourceSense[];
		expect(inner[2]?.number).toBe('—3)');
	});

	it('treats the input as immutable', () => {
		const input = mixed();
		const before = structuredClone(input);
		continuationMarkerDash.apply(input);
		expect(input).toEqual(before);
	});

	it('is idempotent', () => {
		const once = continuationMarkerDash.apply(mixed()).entry;
		expect(continuationMarkerDash.apply(once).entry).toBe(once);
	});
});
