// biome-ignore-all lint/style/noExcessiveLinesPerFile: a table-driven suite; the cases and the fixtures they share read as one unit.
import { describe, expect, it } from 'bun:test';
import type { BodyEntry, SourceEntry } from '../body/types.ts';
import {
	checkChain,
	checkHeadwordLine,
	checkNames,
	checkPages,
	checkTextConservation,
} from './gates.ts';
import {
	type FormObject,
	SCHEMA_VERSION,
	type Tally,
	type TruthEntry,
} from './types.ts';

/** A 3-entry chain, in rid order, with `next_hw`/`prev_hw` naming the
 * neighbour's headword string (as the composed corpus does). */
function threeEntryChain(): SourceEntry[] {
	return [
		{ content: { senses: [] }, headword: 'א', next_hw: 'ב', rid: 'A00001' },
		{
			content: { senses: [] },
			headword: 'ב',
			next_hw: 'ג',
			prev_hw: 'א',
			rid: 'A00002',
		},
		{ content: { senses: [] }, headword: 'ג', prev_hw: 'ב', rid: 'A00003' },
	];
}

const CHAIN_MAP = new Map([
	['א', 'A00001'],
	['ב', 'A00002'],
	['ג', 'A00003'],
]);

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('checkChain', () => {
	it('passes an ordered chain', () => {
		const t = checkChain(threeEntryChain(), CHAIN_MAP);
		expect(t.failures).toEqual([]);
		// The unique-head mark (fix round 1) adds one to both pass and
		// total over the previous 4/4 baseline.
		expect(t.pass).toBe(5);
		expect(t.total).toBe(5);
	});

	it('fails a chain with a swapped next_hw', () => {
		// A00001 and A00002's next_hw values are swapped relative to the
		// ordered fixture, so the chain jumps straight to A00003.
		const swapped: SourceEntry[] = [
			{ content: { senses: [] }, headword: 'א', next_hw: 'ג', rid: 'A00001' },
			{
				content: { senses: [] },
				headword: 'ב',
				next_hw: 'ב',
				prev_hw: 'א',
				rid: 'A00002',
			},
			{ content: { senses: [] }, headword: 'ג', prev_hw: 'ב', rid: 'A00003' },
		];
		const t = checkChain(swapped, CHAIN_MAP);
		expect(t.failures.length).toBeGreaterThan(0);
		expect(t.failures).toContain('A00002: chain has A00003');
	});

	it('fails termination when the last next_hw points back into the chain', () => {
		const cyclic: SourceEntry[] = [
			{ content: { senses: [] }, headword: 'א', next_hw: 'ב', rid: 'A00001' },
			{
				content: { senses: [] },
				headword: 'ב',
				next_hw: 'ג',
				prev_hw: 'א',
				rid: 'A00002',
			},
			{
				content: { senses: [] },
				headword: 'ג',
				next_hw: 'א',
				prev_hw: 'ב',
				rid: 'A00003',
			},
		];
		const t = checkChain(cyclic, CHAIN_MAP);
		// The unique-head mark (fix round 1) adds one pass over the
		// previous 3/4 baseline.
		expect(t.pass).toBe(4);
		expect(t.total).toBe(5);
		expect(t.failures).toEqual(['chain does not terminate: next is A00001']);
	});

	it('fails a dangling trailing next_hw on the true tail entry', () => {
		// Finding 1: the tail entry (A00003) names a headword ('PHANTOM')
		// that headwordMap does not contain. Previously this resolved to
		// `undefined` exactly like a legitimately absent next_hw and the
		// chain passed in full; it must now be rejected by name.
		const dangling: SourceEntry[] = [
			{ content: { senses: [] }, headword: 'א', next_hw: 'ב', rid: 'A00001' },
			{
				content: { senses: [] },
				headword: 'ב',
				next_hw: 'ג',
				prev_hw: 'א',
				rid: 'A00002',
			},
			{
				content: { senses: [] },
				headword: 'ג',
				next_hw: 'PHANTOM',
				prev_hw: 'ב',
				rid: 'A00003',
			},
		];
		const t = checkChain(dangling, CHAIN_MAP);
		expect(t.failures).toContain('A00003: next_hw "PHANTOM" names no headword');
		expect(t.pass).toBeLessThan(t.total);
	});

	it('fails head uniqueness when two entries lack prev_hw', () => {
		// Finding 2: A00001 and A00002 both lack prev_hw, so `find()`
		// would previously pick A00001 by array position and the walk
		// would proceed as if nothing were wrong.
		const twoHeads: SourceEntry[] = [
			{ content: { senses: [] }, headword: 'א', next_hw: 'ב', rid: 'A00001' },
			{ content: { senses: [] }, headword: 'ב', next_hw: 'ג', rid: 'A00002' },
			{ content: { senses: [] }, headword: 'ג', prev_hw: 'ב', rid: 'A00003' },
		];
		const t = checkChain(twoHeads, CHAIN_MAP);
		expect(t.failures).toEqual([
			'chain has 2 heads: A00001, A00002',
			'A00001: chain not walked',
			'A00002: chain not walked',
			'A00003: chain not walked',
		]);
		expect(t.pass).toBe(0);
		expect(t.total).toBe(4);
	});
});

/** One entry as gate 7 reads it: the form the name derives from, and
 * the `sefariaHeadword` the run wrote. */
function named(
	id: string,
	primary: FormObject,
	sefariaHeadword: string,
): TruthEntry {
	return {
		headwords: [primary],
		id,
		schemaVersion: SCHEMA_VERSION,
		sefariaHeadword,
		senses: [],
	};
}

const SOURCE = new Map([
	['A00001', 'אָב'],
	['A00002', 'אב'],
	['A00003', 'גד'],
]);

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('checkNames', () => {
	it('passes distinct names carrying the snapshot headword', () => {
		const t = checkNames(
			[
				named('A00001', { text: 'אָב' }, 'אָב'),
				named('A00002', { text: 'אב' }, 'אב'),
				named('A00003', { text: 'גד' }, 'גד'),
			],
			SOURCE,
		);
		// Two marks per entry: unique, and verbatim.
		expect(t.failures).toEqual([]);
		expect(t.pass).toBe(6);
		expect(t.total).toBe(6);
	});

	it('fails the second entry to hold a name', () => {
		const t = checkNames(
			[
				named('A00001', { text: 'אָב' }, 'אָב'),
				named('A00002', { homograph: 1, text: 'אָב' }, 'אב'),
				named('A00003', { text: 'אָב' }, 'גד'),
			],
			SOURCE,
		);
		expect(t.failures).toEqual(['A00003: name אָב taken by A00001']);
		expect(t.pass).toBe(5);
		expect(t.total).toBe(6);
	});

	it('compares in NFC, so a decomposed name still collides', () => {
		// The dangerous shape: two spellings of one word are two distinct
		// JS strings and one URL. Without the normalization the gate
		// passes and the route map has an ambiguous key.
		const t = checkNames(
			[
				named('A00001', { text: 'אָב'.normalize('NFC') }, 'אָב'),
				named('A00002', { text: 'אָב'.normalize('NFD') }, 'אב'),
			],
			SOURCE,
		);
		expect(t.failures).toHaveLength(1);
		expect(t.failures[0]).toContain('taken by A00001');
	});

	it('keeps a reconstructed form distinct from its plain twin (U5)', () => {
		// The 23 `*`/plain pairs. Drop the star from the formula and this
		// case collides.
		const t = checkNames(
			[
				named('A00001', { reconstructed: true, text: 'אָב' }, 'אָב'),
				named('A00002', { text: 'אָב' }, 'אב'),
			],
			SOURCE,
		);
		expect(t.failures).toEqual([]);
	});

	it('fails an entry whose name strips to nothing', () => {
		// Not a collision — it is alone — so only the empty clause sees
		// it. Without that clause the entry passes and has no URL.
		const t = checkNames([named('A00001', { text: '(?)' }, 'אָב')], SOURCE);
		expect(t.failures).toEqual(['A00001: name is empty from "(?)"']);
		expect(t.pass).toBe(1);
		expect(t.total).toBe(2);
	});

	it('fails a sefariaHeadword that is not the snapshot string', () => {
		const t = checkNames(
			[named('A00001', { text: 'אָב' }, 'אָב edited by hand')],
			SOURCE,
		);
		expect(t.failures).toHaveLength(1);
		expect(t.failures[0]).toContain('but the source says');
	});

	it('fails a rid the snapshot does not name', () => {
		// `undefined` must not pass against an absent field: an entry with
		// no source line has nothing to be verbatim from.
		const t = checkNames([named('A09999', { text: 'אָב' }, 'אָב')], SOURCE);
		expect(t.failures).toHaveLength(1);
		expect(t.failures[0]).toContain('the source says null');
	});
});

/** The smallest schema-valid truth entry, for tests that care about
 * one field and need the rest merely to exist. */
function minimalTruth(overrides: Partial<TruthEntry>): TruthEntry {
	return {
		headwords: [{ text: 'x' }],
		id: 'A00014',
		schemaVersion: SCHEMA_VERSION,
		sefariaHeadword: 'x',
		senses: [],
		...overrides,
	};
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('checkTextConservation', () => {
	it('fails when a truth gloss drops a word', () => {
		const body: BodyEntry = {
			id: 'A00014',
			senses: [{ gloss: 'm. father of all', units: ['x'] }],
		};
		const truth = minimalTruth({
			senses: [{ gloss: 'm. father all', units: ['x'] }],
		});
		const t: Tally = { failures: [], pass: 0, total: 0 };
		checkTextConservation(body, truth, t);
		expect(t.failures).toEqual(['A00014: senses[0].gloss']);
		// Four passing structural/text marks around the one failure: the
		// `senses` length pair, `units[0]`, the length pair for the empty
		// child `senses` of the one sense, and the stems count.
		expect(t.pass).toBe(4);
		expect(t.total).toBe(5);
	});

	it('fails when truth carries a surplus unit', () => {
		const body: BodyEntry = {
			id: 'A00014',
			senses: [{ gloss: 'm. father', units: ['a'] }],
		};
		const truth = minimalTruth({
			senses: [{ gloss: 'm. father', units: ['a', 'b'] }],
		});
		const t: Tally = { failures: [], pass: 0, total: 0 };
		checkTextConservation(body, truth, t);
		expect(t.failures).toEqual(['A00014: senses[0].units[1]']);
		// The same passing marks as above plus `units[0]`.
		expect(t.pass).toBe(5);
		expect(t.total).toBe(6);
	});

	it('fails when a truth-only subsense holds text in units alone', () => {
		// The walk used to compare a one-sided element's `gloss` and
		// nothing else. A subsense present only in truth, whose gloss is
		// empty and whose text sits in `units`, therefore yielded the pair
		// ['', ''] and passed — fabricated output-only text, invisible to
		// gate 3 at every depth below the top level.
		const body: BodyEntry = {
			id: 'A00014',
			senses: [{ gloss: 'm. father', senses: [], units: [] }],
		};
		const truth = minimalTruth({
			senses: [
				{
					gloss: 'm. father',
					senses: [{ gloss: '', units: ['invented'] }],
					units: [],
				},
			],
		});
		const t: Tally = { failures: [], pass: 0, total: 0 };
		checkTextConservation(body, truth, t);
		expect(t.failures).toEqual([
			'A00014: senses[0].senses length',
			'A00014: senses[0].senses[0].units[0]',
		]);
	});

	it('fails when truth carries a fabricated stem with no sense text', () => {
		// Finding 3: a stem present only in truth, with `senses: []`,
		// yields no pairs at all (pairs([], []) is empty) so the content
		// walk alone never marks it. The stems-count structural mark
		// must catch it.
		const body: BodyEntry = {
			id: 'A00014',
			senses: [{ gloss: 'm. father', units: ['a'] }],
			stems: [{ forms: [], senses: [{ gloss: 'y', units: [] }], stem: 'Qal' }],
		};
		const truth = minimalTruth({
			senses: [{ gloss: 'm. father', units: ['a'] }],
			stems: [
				{ forms: [], senses: [{ gloss: 'y', units: [] }], stem: 'Qal' },
				{ forms: [], senses: [], stem: 'Pi.' },
			],
		});
		const t: Tally = { failures: [], pass: 0, total: 0 };
		checkTextConservation(body, truth, t);
		expect(t.failures).toEqual(['A00014: stems 1 → 2']);
		expect(t.total).toBeGreaterThan(0);
		expect(t.pass).toBe(t.total - 1);
	});
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('checkHeadwordLine', () => {
	/** One line through gate 2: the composed source items, and the
	 * entry the run wrote for them. */
	function gate(items: readonly string[], truth: Partial<TruthEntry>): Tally {
		const [headword = '', ...alts] = items;
		const composed: SourceEntry = {
			content: { senses: [] },
			headword,
			rid: 'A00014',
			...(alts.length > 0 ? { alt_headwords: alts } : {}),
		};
		const t: Tally = { failures: [], pass: 0, total: 0 };
		checkHeadwordLine(composed, minimalTruth(truth), t);
		return t;
	}

	it('passes a settleable line, all three marks', () => {
		const t = gate(['אָב I', '(אַבָּא) II'], {
			display: '{0} I, ({1} II)',
			headwords: [
				{ homograph: 1, text: 'אָב' },
				{ homograph: 2, text: 'אַבָּא' },
			],
		});
		expect(t.failures).toEqual([]);
		expect(t.pass).toBe(3);
		expect(t.total).toBe(3);
	});

	it('fails when a form drops a letter the line holds', () => {
		const t = gate(['אָב II'], {
			display: '{0} II',
			headwords: [{ homograph: 2, text: 'אָ' }],
		});
		expect(t.failures[0]).toContain('headword text not conserved');
		expect(t.pass).toBe(2);
	});

	it('fails when a form invents a letter the line does not hold', () => {
		const t = gate(['אָב'], { display: '{0}', headwords: [{ text: 'אָבא' }] });
		expect(t.failures[0]).toContain('headword text not conserved');
	});

	it('fails a parenthesis the template dropped', () => {
		// Exactly what the retired `parenthesized-alt-headword` rule did:
		// the Hebrew is conserved, so only the notation multiset sees it.
		const t = gate(['אָב', '(אַבָּא)'], {
			display: '{0}, {1}',
			headwords: [{ text: 'אָב' }, { text: 'אַבָּא' }],
		});
		expect(t.failures).toHaveLength(1);
		expect(t.failures[0]).toContain('notation');
	});

	it('fails a numeral the template invented', () => {
		const t = gate(['אָב'], {
			display: '{0} II',
			headwords: [{ homograph: 2, text: 'אָב' }],
		});
		expect(t.failures[0]).toContain('notation');
	});

	it('reads a Roman numeral as ONE token, not a run of letters', () => {
		// `II` against `I I` conserves every character and is a different
		// line. A per-character multiset would pass it.
		const t = gate(['אָב II'], {
			display: '{0} I I',
			headwords: [{ text: 'אָב' }],
		});
		expect(t.failures.some((f) => f.includes('notation'))).toBe(true);
	});

	it('ignores the separator commas, which the source never carried', () => {
		// §1: the upstream split cut print's line at its commas. The
		// template's `, ` is supplied (§4), so counting it would compare
		// the parser's invention against a number the source lacks.
		const t = gate(['אָב', 'אַבָּא'], {
			display: '{0}, {1}',
			headwords: [{ text: 'אָב' }, { text: 'אַבָּא' }],
		});
		expect(t.failures).toEqual([]);
	});

	it('passes an unsettleable line with no display', () => {
		const t = gate(['(אָב', 'אַבָּא'], {
			headwords: [{ text: 'אָב' }, { text: 'אַבָּא' }],
		});
		expect(t.failures).toEqual([]);
		// Two marks: the notation multiset has no template to read.
		expect(t.pass).toBe(2);
		expect(t.total).toBe(2);
	});

	it('fails a display written for a line that cannot be laid out', () => {
		const t = gate(['(אָב', 'אַבָּא'], {
			display: '({0}, {1})',
			headwords: [{ text: 'אָב' }, { text: 'אַבָּא' }],
		});
		expect(t.failures[0]).toContain('unsettleable');
	});

	it('fails a display quietly dropped from a line that has one', () => {
		// The mark that keeps the other two from passing on a run that
		// stopped writing templates: without it, mark 2 simply returns.
		const t = gate(['אָב'], { headwords: [{ text: 'אָב' }] });
		expect(t.failures[0]).toContain('display is unset');
	});

	/** One line whose composed entry ALREADY carries a patch-supplied
	 * template, which `gate` above cannot express: its composed entry
	 * is built from the items alone. */
	function patched(
		items: readonly string[],
		supplied: string,
		written: string,
	): Tally {
		const [headword = '', ...alts] = items;
		const t: Tally = { failures: [], pass: 0, total: 0 };
		checkHeadwordLine(
			{
				alt_headwords: alts,
				content: { senses: [] },
				display: supplied,
				headword,
				rid: 'A00014',
			},
			minimalTruth({
				display: written,
				headwords: [{ text: 'אָב' }, { text: 'אַבָּא' }],
			}),
			t,
		);
		return t;
	}

	it('carries a patch-supplied template through to the entry', () => {
		const t = patched(['(אָב', 'אַבָּא'], '({0}, {1})', '({0}, {1})');
		expect(t.failures).toEqual([]);
		// Two marks plus the carried-through one and the slot-order one.
		// The line is UNSETTLEABLE, so the notation multiset is
		// deliberately not among them: print set a layout the source did
		// not keep.
		expect(t.total).toBe(4);
	});

	it('allows a patch to correct a PLACEMENT on a settleable line', () => {
		// §4 "Parentheses" (ruled 2026-09-22): A02823's parentheses sit
		// on the wrong form in the source and the parser stays
		// source-faithful, so the print's reading arrives as a patch.
		// The notation is rearranged, not changed, so mark 2 still runs.
		const t = patched(['(אָב)', 'אַבָּא'], '{0} ({1})', '{0} ({1})');
		expect(t.failures).toEqual([]);
		expect(t.total).toBe(5);
	});

	it('refuses a patch-supplied template that PERMUTES the forms', () => {
		// `{1}, {0}` renders the alternate where print sets the headword,
		// and `headwords[0]` is what the name, the search key and every
		// link derive from. Rule 1 sorts the slots, so it sees a set; the
		// notation multiset is blind to order. This mark is the only one
		// that looks.
		const t = patched(['אָב', 'אַבָּא'], '{1}, {0}', '{1}, {0}');
		expect(t.failures).toHaveLength(1);
		expect(t.failures[0]).toContain('not in form order');
	});

	it('refuses a patch-supplied template that INVENTS notation', () => {
		// The door the mark above keeps shut: on a line the source
		// settles, a supplied template may move the notation between the
		// forms and may not add any. Here the line holds no parentheses.
		const t = patched(['אָב', 'אַבָּא'], '({0}) {1}', '({0}) {1}');
		expect(t.failures).toHaveLength(1);
		expect(t.failures[0]).toContain('does not conserve');
	});

	it('fails a patch template the run altered on the way', () => {
		const t = patched(['(אָב', 'אַבָּא'], '({0}, {1})', '({0}) {1}');
		expect(t.failures[0]).toContain('the patch supplied');
	});

	it('counts an `=` line as unsettleable', () => {
		const t = gate(['אִידְרְעָא = אֶדְרְעָא'], {
			headwords: [{ text: 'אִידְרְעָא = אֶדְרְעָא' }],
		});
		expect(t.failures).toEqual([]);
	});
});

describe('checkPages', () => {
	it('fails a missing rid', () => {
		const pages = new Map([
			[
				'A00001',
				{ column: 'a' as const, confidence: 'high' as const, number: 1 },
			],
			[
				'A00003',
				{ column: 'b' as const, confidence: 'high' as const, number: 2 },
			],
		]);
		const t = checkPages(['A00001', 'A00002', 'A00003'], pages);
		expect(t.failures).toEqual(['A00002: no page']);
		expect(t.pass).toBe(2);
		expect(t.total).toBe(3);
	});
});
