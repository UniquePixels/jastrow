import { describe, expect, it } from 'bun:test';
import {
	type Entry,
	SCHEMA_VERSION,
	type Sense,
} from '../../../entry/types.ts';
import { detectSelfNumberedIntextMarker } from './self-numbered-intext-marker.ts';

/** One sense; `units` defaults to none so a fixture states only the
 * field its case turns on. */
function sense(over: Partial<Sense> = {}): Sense {
	return { gloss: '', units: [], ...over };
}

/** A minimal valid entry, overridden per fixture. */
function entry(over: Partial<Entry> = {}): Entry {
	return {
		headwords: [{ text: 'חָתַם' }],
		id: 'H01899',
		schemaVersion: SCHEMA_VERSION,
		sefariaHeadword: 'חָתַם',
		senses: [sense()],
		...over,
	};
}

/** Sense 1, then a sense labelled `label` whose last unit is `unit`. */
function hosting(label: string, unit: string): Sense[] {
	return [
		sense({ gloss: '<i>to tie up</i>. ', label: '1' }),
		sense({ gloss: '<i>to seal</i>. ', label, units: [unit] }),
	];
}

/** H01899's sense 2 as the entry holds it (cut): print sets `—2) to
 * seal` and then `—2) to sign`, the same numeral twice (513b). */
const H01899_UNIT: string =
	'<cite ref="Tosefta Avodah Zarah 5:2">Tosef. ib. V</cite> (<cite ref="Tosefta Avodah Zarah 6:2">VI</cite>), 2; a. fr.—2) <i>to sign, subscribe</i> (as witness, judge &c.) <cite ref="Mishnah Gittin 6:7">Gitt. VI, 7</cite>.';

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('self-numbered-intext-marker', () => {
	it('names H01899, the worklist’s control: sense 2 holds print’s second —2)', () => {
		const rows = detectSelfNumberedIntextMarker(
			entry({ senses: hosting('2', H01899_UNIT) }),
		);
		expect(rows).toEqual([
			{
				detail:
					'senses[1] (labelled 2) holds "—2)": "…f. ib. V (VI), 2; a. fr.—2) to sign, subscribe (as…"',
				kind: 'self-numbered-intext-marker',
				rid: 'H01899',
				severity: 'review',
			},
		]);
	});

	it('names B01299: sense 3 runs on into print’s —3) interj. (196a)', () => {
		const rows = detectSelfNumberedIntextMarker(
			entry({
				id: 'B01299',
				senses: [
					sense({ gloss: '<i>besides</i>.', label: '1' }),
					sense({ gloss: '<i>however</i>.', label: '2' }),
					sense({
						gloss: '<i>only, but</i>. ',
						label: '3',
						units: [
							'fact they said this. <cite ref="Bava Metzia 114a">B. Mets. 114ᵃ</cite>.—3) <i>interj.</i> <i>truly!, surely!</i>',
						],
					}),
				],
			}),
		);
		expect(rows[0]?.detail).toStartWith('senses[2] (labelled 3) holds "—3)"');
	});

	it('names a stem section’s sense, with its path, and a starred marker', () => {
		const rows = detectSelfNumberedIntextMarker(
			entry({
				stems: [
					{
						forms: ['הִשְׁמִיעַ'],
						senses: hosting('2', 'a. fr.—*2) <i>inferred</i>.'),
						stem: 'Hif.',
					},
				],
			}),
		);
		expect(rows[0]?.detail).toStartWith(
			'stems[0].senses[1] (labelled 2) holds "—*2)"',
		);
	});

	it('still names class 4’s residue (A00982), which the worklist keeps as a row', () => {
		// `—Du. אָזְנַיִם 1) ears … —2) handles`: the marker is the second
		// item of a sublist restarting at `1)` inside sense 2. Print's
		// structure, not a doubled numeral, but nothing else shows it.
		const rows = detectSelfNumberedIntextMarker(
			entry({
				id: 'A00982',
				senses: hosting(
					'2',
					'a. fr.—<i>Du.</i> <he>אָזְנַיִם</he> 1) <i>ears</i>. Lev. R. s. 32 (be on your guard); a. fr.—2) <i>handles</i>.',
				),
			}),
		);
		expect(rows).toHaveLength(1);
	});

	// Negative controls: an in-text marker where the class does not hold.
	const negatives: ReadonlyArray<readonly [string, string, string]> = [
		[
			'the marker is the next number (class 7’s split, A01002)',
			'2',
			'a. fr.—3) <i>to sign</i>.',
		],
		['the marker is an earlier number', '3', 'a. fr.—2) <i>to sign</i>.'],
		['the number only ends with the label', '2', 'a. fr.—12) <i>to sign</i>.'],
		[
			'there is no dash (the class’s blind spot)',
			'2',
			'a. fr. 2) <i>to sign</i>.',
		],
		[
			'the dash follows a semicolon, not a full stop',
			'2',
			'Gitt. VI, 7;—2) <i>to sign</i>.',
		],
		[
			'the marker sits inside an open paren',
			'2',
			'(v. Gitt. VI, 7.—2) <i>to sign</i>).',
		],
		[
			'the marker sits inside an open bracket',
			'2',
			'[v. Gitt. VI, 7.—2) <i>to sign</i>].',
		],
		[
			'the marker is a citation’s own text',
			'2',
			'<cite ref="x">Gitt. VI.—2)</cite> <i>to sign</i>.',
		],
	];
	for (const [what, label, unit] of negatives) {
		it(`is silent when ${what}`, () => {
			expect(
				detectSelfNumberedIntextMarker(entry({ senses: hosting(label, unit) })),
			).toEqual([]);
		});
	}

	it('is silent on an unlabelled or lettered sense', () => {
		const rows = detectSelfNumberedIntextMarker(
			entry({
				senses: [
					sense({ gloss: 'a. fr.—1) <i>to seal</i>.' }),
					sense({ gloss: 'a. fr.—a) <i>to seal</i>.', label: 'a' }),
				],
			}),
		);
		expect(rows).toEqual([]);
	});

	it('reads a closer with nothing open as a marker, not a close', () => {
		// U01512: `a) understood … (it may mean …); a. fr.—2)` — the
		// lettered `a)` closes nothing, so the depth stays at zero.
		const rows = detectSelfNumberedIntextMarker(
			entry({
				senses: hosting(
					'2',
					'Part. pass. a) <i>understood</i>; a. fr.—2) <i>inferred</i>.',
				),
			}),
		);
		expect(rows).toHaveLength(1);
	});

	it('emits one row for an entry with two sites', () => {
		const rows = detectSelfNumberedIntextMarker(
			entry({
				senses: [
					...hosting('2', H01899_UNIT),
					sense({ gloss: 'a. e.—3) <i>to close</i>.', label: '3' }),
				],
			}),
		);
		expect(rows).toHaveLength(1);
		expect(rows[0]?.detail.split(' (labelled ')).toHaveLength(3);
	});
});
