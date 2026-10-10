import { describe, expect, it } from 'bun:test';
import {
	type Entry,
	SCHEMA_VERSION,
	type Sense,
} from '../../../entry/types.ts';
import { detectInflectionSublistFlattened } from './inflection-sublist-numbering-flattened.ts';

/** One sense; `units` defaults to none so a fixture states only the
 * field its case turns on. */
function sense(over: Partial<Sense> = {}): Sense {
	return { gloss: '', units: [], ...over };
}

/** A minimal valid entry, overridden per fixture. */
function entry(over: Partial<Entry> = {}): Entry {
	return {
		headwords: [{ text: 'חָבִיב' }],
		id: 'H00052',
		schemaVersion: SCHEMA_VERSION,
		sefariaHeadword: 'חָבִיב',
		senses: [sense()],
		...over,
	};
}

/** A lead ending on `tail`, then senses labelled `1` and `2`. */
function flattened(tail: string, units: string[] = []): Sense[] {
	return [
		sense({ gloss: ` m. ch. same. ${tail}`, units }),
		sense({ gloss: ' <i>aunt</i>.', label: '1' }),
		sense({ gloss: ' <i>beloved</i>.', label: '2' }),
	];
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('inflection-sublist-numbering-flattened', () => {
	it('names H00052: the lead ends on a feminine form, sense 1 is a sibling', () => {
		const rows = detectInflectionSublistFlattened(
			entry({
				senses: flattened('a. fr.—<i>Fem.</i> <he>חֲבִיבְתָּא</he>'),
			}),
		);
		expect(rows).toEqual([
			{
				detail:
					'senses[0] ends "—Fem. חֲבִיבְתָּא", and senses[1] (labelled 1) follows it as a sibling',
				kind: 'inflection-sublist-numbering-flattened',
				rid: 'H00052',
				severity: 'review',
			},
		]);
	});

	// Each tail a lead may end on: the label, then one or more forms.
	const positives: ReadonlyArray<readonly [string, string]> = [
		['two forms (M02479)', '—Fem. <he>מָרְתָא, מָרְתָה</he>'],
		['a plural (A00994)', 'v. חֲדַת.—Pl. <he>אֲחָדִים</he>'],
		['a participle (E00230)', 'a. v. fr.—Part. <he>הוֶֹה, הוֶוֹה</he>'],
		['a passive participle', 'a. e.—Part. pass. <he>חָבִיב</he>'],
		['a dual', 'a. fr.—Du. <he>אָזְנַיִם</he>'],
		['trailing space', 'a. fr.—Fem. <he>חֲבִיבְתָּא</he> '],
	];
	for (const [what, tail] of positives) {
		it(`names a lead ending on ${what}`, () => {
			const rows = detectInflectionSublistFlattened(
				entry({ senses: flattened(tail) }),
			);
			expect(rows).toHaveLength(1);
		});
	}

	it('reads the tail at the end of the last unit, not the gloss', () => {
		const rows = detectInflectionSublistFlattened(
			entry({
				senses: flattened('', [
					'<cite ref="x">B. Kam. X</cite>; a. fr.—Fem. <he>חֲבִיבְתָּא</he>',
				]),
			}),
		);
		expect(rows).toHaveLength(1);
	});

	it('names a stem section’s lead, with its path (H00553)', () => {
		const rows = detectInflectionSublistFlattened(
			entry({
				senses: [sense({ gloss: ' m.' })],
				stems: [
					{
						forms: ['הוּחְזַק'],
						senses: flattened('bathed.—Part. <he>מוּחֲזָק</he>'),
						stem: 'Hof.',
					},
				],
			}),
		);
		expect(rows[0]?.detail).toStartWith(
			'stems[0].senses[0] ends "—Part. מוּחֲזָק"',
		);
	});

	// Negative controls: the same tail where the class does not hold.
	const negatives: ReadonlyArray<readonly [string, Sense[]]> = [
		[
			'the next sense is labelled 2, not 1',
			[sense({ gloss: 'a. fr.—Fem. חֲבִיבְתָּא' }), sense({ label: '2' })],
		],
		[
			'the lead itself carries a label',
			[
				sense({ gloss: 'a. fr.—Fem. חֲבִיבְתָּא', label: '3' }),
				sense({ label: '1' }),
			],
		],
		[
			'text follows the form',
			[sense({ gloss: '—Pl. אֲחָדִים. Targ. Gen. I, 1.' }), sense({ label: '1' })],
		],
		[
			'the label is a stem head, not a form label',
			[sense({ gloss: '—Pi. דִּדָּה' }), sense({ label: '1' })],
		],
		['no sense follows the lead', [sense({ gloss: 'a. fr.—Fem. חֲבִיבְתָּא' })]],
	];
	for (const [what, senses] of negatives) {
		it(`is silent when ${what}`, () => {
			expect(detectInflectionSublistFlattened(entry({ senses }))).toEqual([]);
		});
	}

	it('is silent on C00062, where the form section already owns its senses', () => {
		// The control the worklist names: the form-section split made
		// `—Pl. גְּבוּרוֹת` a sibling whose numbered senses are its children.
		const rows = detectInflectionSublistFlattened(
			entry({
				id: 'C00062',
				senses: [
					sense({ gloss: ' <i>high age</i>, v. infra.', label: '3' }),
					sense({
						gloss: '—Pl. <he>גְּבוּרוֹת</he>',
						senses: [
							sense({ gloss: ' <i>wonders</i>.', label: '1' }),
							sense({ gloss: ' <i>G’buroth</i>.', label: '2' }),
						],
					}),
				],
			}),
		);
		expect(rows).toEqual([]);
	});

	it('emits one row for an entry with two sites', () => {
		const rows = detectInflectionSublistFlattened(
			entry({
				senses: flattened('—Fem. חֲבִיבְתָּא'),
				stems: [
					{
						forms: [],
						senses: flattened('—Pl. אֲחָדִים'),
						stem: 'Pa.',
					},
				],
			}),
		);
		expect(rows).toHaveLength(1);
		expect(rows[0]?.detail.split('; ')).toHaveLength(2);
	});
});
