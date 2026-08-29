import { describe, expect, it } from 'bun:test';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { applyTransforms } from '../run.ts';
import { asteriskStemStrayPeriod } from './stem-label.ts';

/** A stem block carrying the label under test, with a real form and a
 * child sense — the shape all 69 members share. */
const withStem = (verbal_stem: string): SourceEntry => ({
	content: {
		senses: [
			{
				grammar: { binyan_form: ['יַיעֵץ'], verbal_stem },
				senses: [{ definition: 'same.' }],
			},
		],
	},
	headword: 'יְעַץ',
	rid: 'T00001',
});

/** The label the rule left behind. */
const stemOf = (entry: SourceEntry): string | undefined =>
	(entry.content.senses[0] as SourceSense).grammar?.verbal_stem;

describe('asteriskStemStrayPeriod', () => {
	it('drops the appended space-period', () => {
		const result = asteriskStemStrayPeriod.apply(withStem('Pa. .'));
		expect(stemOf(result.entry)).toBe('Pa.');
		expect(result.records).toHaveLength(1);
		expect(result.removes).toEqual([' .']);
	});

	it('leaves a clean label alone', () => {
		const input = withStem('Pa.');
		const result = asteriskStemStrayPeriod.apply(input);
		expect(result.entry).toBe(input);
		expect(result.records).toEqual([]);
	});

	// The rule's refusals. The first six are one value from each of the
	// four sub-shapes of `stem-label-not-a-binyan-name` (66), whose
	// repair is a model ruling or a per-entry reading; the seventh,
	// `"Hithpa. a. Nithpa."`, is in NO catalogue row — it is a
	// legitimate multi-stem heading the corpus spells 7 times, included
	// here as a guard because a looser predicate would eat it. So is
	// `"Pa., part. pass."`, which is a print section head rather than a
	// label with debris.
	const refused: [string, string][] = [
		['siglum alone', '*.'],
		['siglum with a space', '* .'],
		['siglum with a label', '*Pa.'],
		['punctuation debris', '[.'],
		['print section head', 'Compounds: .'],
		['inflection head', 'Pa., part. pass.'],
		['multi-stem heading', 'Hithpa. a. Nithpa.'],
	];
	for (const [name, value] of refused) {
		it(`refuses ${name}: ${JSON.stringify(value)}`, () => {
			expect(asteriskStemStrayPeriod.apply(withStem(value)).records).toEqual(
				[],
			);
		});
	}

	it('passes every gate through applyTransforms', () => {
		const result = applyTransforms(withStem('Af. .'), 'text-repairs', [
			asteriskStemStrayPeriod,
		]);
		expect(stemOf(result.entry)).toBe('Af.');
	});

	// The loss gate is scoped to `structural-repairs` (spec §2.3), so
	// this rule's deletion is NOT gated where it runs. Asserted rather
	// than assumed, because the declaration would otherwise look like
	// protection it is not: the same rule moved to the other phase is
	// accepted only because it declares.
	it('is ungated on deletion in text-repairs, and would pass if gated', () => {
		const asStructural = {
			...asteriskStemStrayPeriod,
			phase: 'structural-repairs' as const,
		};
		expect(() =>
			applyTransforms(withStem('Pa. .'), 'structural-repairs', [asStructural]),
		).not.toThrow();
	});
});
