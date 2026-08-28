import { describe, expect, it } from 'bun:test';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { applyTransforms } from '../run.ts';
import { stemHeadMarkerChop } from './stem-head.ts';

const entry = (senses: SourceSense[]): SourceEntry => ({
	content: { senses },
	headword: 'חֲבַק',
	rid: 'T00001',
});

/** The shape all 18 members share: a numbered `1)` ending in the
 * chopped marker and its single space, then an unnumbered sibling
 * holding what the marker introduces. */
const chopped = (tail = 'v. supra.—2) ', next = 'to associate'): SourceEntry =>
	entry([{ definition: tail, number: '1)' }, { definition: next }]);

const senseAt = (result: SourceEntry, index: number): SourceSense =>
	result.content.senses[index] as SourceSense;

describe('stemHeadMarkerChop', () => {
	it('moves the marker into the sibling’s number', () => {
		const { entry: after, records } = stemHeadMarkerChop.apply(chopped());
		expect(senseAt(after, 0).definition).toBe('v. supra.');
		expect(senseAt(after, 1).number).toBe('—2)');
		expect(senseAt(after, 1).definition).toBe('to associate');
		expect(records).toHaveLength(1);
	});

	it('declares the marker’s trailing space, once per repair', () => {
		expect(stemHeadMarkerChop.apply(chopped()).removes).toEqual([' ']);
	});

	it('returns the input untouched when nothing matches', () => {
		const input = entry([{ definition: 'plain', number: '1)' }]);
		const result = stemHeadMarkerChop.apply(input);
		expect(result.entry).toBe(input);
		expect(result.records).toEqual([]);
		expect(result.removes).toBeUndefined();
	});

	// THE REFUSAL THE ROW EXISTS FOR. Three of the ten residue-bearing
	// members hold the real opening of sense 2; a rule that trimmed
	// them would destroy text no other gate would report, since
	// deletion is a sub-multiset and passes `checkNoNewText`.
	it('refuses a marker with residue after it', () => {
		const withText = chopped('v. supra.—2) (of wine) ');
		expect(stemHeadMarkerChop.apply(withText).records).toEqual([]);
		const withToken = chopped('v. supra.—2) same.');
		expect(stemHeadMarkerChop.apply(withToken).records).toEqual([]);
	});

	it('refuses a sibling that already carries a number', () => {
		const numbered = entry([
			{ definition: 'v. supra.—2) ', number: '1)' },
			{ definition: 'x', number: '—3)' },
		]);
		expect(stemHeadMarkerChop.apply(numbered).records).toEqual([]);
	});

	// The sibling of an empty stem section, for one: `grammar` and no
	// text. Nothing for the marker to introduce, so nothing to renumber.
	it('refuses a sibling with no definition of its own', () => {
		const empty = entry([
			{ definition: 'v. supra.—2) ', number: '1)' },
			{ grammar: { binyan_form: ['אַחְבֵּיק'], verbal_stem: 'Af.' } },
		]);
		expect(stemHeadMarkerChop.apply(empty).records).toEqual([]);
	});

	it('refuses a chopped tail on an unnumbered sense', () => {
		const unnumbered = entry([
			{ definition: 'v. supra.—2) ' },
			{ definition: 'x' },
		]);
		expect(stemHeadMarkerChop.apply(unnumbered).records).toEqual([]);
	});

	it('refuses a marker that is not at the very end', () => {
		expect(stemHeadMarkerChop.apply(chopped('—2) v. supra.')).records).toEqual(
			[],
		);
	});

	// 17 of the 18 sit inside a stem block, so the nested arm is the
	// common case rather than an edge.
	it('repairs a nested pair inside a stem block', () => {
		const nested = entry([
			{
				grammar: { binyan_form: ['אַחְבֵּיק'], verbal_stem: 'Af.' },
				senses: [
					{ definition: 'same; v. supra.—2) ', number: '1)' },
					{ definition: 'to associate' },
				],
			},
		]);
		const after = stemHeadMarkerChop.apply(nested).entry;
		const kids = senseAt(after, 0).senses ?? [];
		expect(kids[0]?.definition).toBe('same; v. supra.');
		expect(kids[1]?.number).toBe('—2)');
	});

	// The rule is only ever run by `applyTransforms`, which gates it —
	// including with the loss gate, which no other registered rule
	// meets. Running the real runner is the only way to assert the
	// declaration is actually accepted.
	it('passes every gate through applyTransforms', () => {
		const result = applyTransforms(chopped(), 'structural-repairs', [
			stemHeadMarkerChop,
		]);
		expect(result.records).toHaveLength(1);
		expect(senseAt(result.entry, 1).number).toBe('—2)');
	});

	// And the negative that proves the gate is live rather than quiet:
	// the same repair with the declaration withheld must fail.
	it('would fail the loss gate without its declaration', () => {
		const undeclared = {
			...stemHeadMarkerChop,
			apply: (input: SourceEntry) => {
				const result = stemHeadMarkerChop.apply(input);
				return { entry: result.entry, records: result.records };
			},
		};
		expect(() =>
			applyTransforms(chopped(), 'structural-repairs', [undeclared]),
		).toThrow(/dropped " "/u);
	});
});
