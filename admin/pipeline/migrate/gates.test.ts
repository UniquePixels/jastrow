import { describe, expect, it } from 'bun:test';
import type { BodyEntry, SourceEntry } from '../body/types.ts';
import {
	checkChain,
	checkHeadwordRoundTrip,
	checkPages,
	checkSlugs,
	checkTextConservation,
} from './gates.ts';
import type { Tally, TruthEntry } from './types.ts';

// A 3-entry chain, in rid order, with `next_hw`/`prev_hw` naming the
// neighbour's headword string (as the composed corpus does).
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

describe('checkSlugs', () => {
	const forms = [
		{ rid: 'A00001', text: 'אב' },
		{ rid: 'A00002', text: 'גד' },
		{ rid: 'A00003', text: 'הו' },
	];

	it('fails a duplicate slug', () => {
		const slugs = new Map([
			['A00001', 'x'],
			['A00002', 'x'],
			['A00003', 'y'],
		]);
		const t = checkSlugs(forms, slugs);
		expect(t.pass).toBe(2);
		expect(t.total).toBe(3);
		expect(t.failures).toEqual(['A00002: slug x taken by A00001']);
	});

	it('fails a collided stem whose owner holds the bare slug', () => {
		const collidedForms = [
			{ rid: 'A00001', text: 'אָב' },
			{ rid: 'A00002', text: 'אב' },
			{ rid: 'A00003', text: 'גד' },
		];
		const slugs = new Map([
			['A00001', 'אב'],
			['A00002', 'אב-2'],
			['A00003', 'גד'],
		]);
		const t = checkSlugs(collidedForms, slugs);
		expect(t.pass).toBe(2);
		expect(t.total).toBe(3);
		expect(t.failures).toEqual(['A00001: slug אב']);
	});
});

function minimalTruth(overrides: Partial<TruthEntry>): TruthEntry {
	return {
		headword: { text: 'x' },
		id: 'A00014',
		senses: [],
		slug: 'x',
		...overrides,
	};
}

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
		// The structural count marks (fix round 1) add the top-level
		// senses-count mark and the stems-count mark (both passing, since
		// neither side has stems here) over the previous 1/2 baseline.
		expect(t.pass).toBe(3);
		expect(t.total).toBe(4);
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
		// Same two structural count marks as above, both passing, over
		// the previous 2/3 baseline.
		expect(t.pass).toBe(4);
		expect(t.total).toBe(5);
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

describe('checkHeadwordRoundTrip', () => {
	it('fails when homograph is altered after decomposition', () => {
		const composed: SourceEntry = {
			content: { senses: [] },
			headword: 'אָב II',
			rid: 'A00014',
		};
		const truth = minimalTruth({ headword: { homograph: 3, text: 'אָב' } });
		const t: Tally = { failures: [], pass: 0, total: 0 };
		checkHeadwordRoundTrip(composed, truth, t);
		expect(t.failures).toEqual(['A00014: headword']);
		expect(t.pass).toBe(1);
		expect(t.total).toBe(2);
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
