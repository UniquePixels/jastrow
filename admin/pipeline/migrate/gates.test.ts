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
		expect(t.pass).toBe(4);
		expect(t.total).toBe(4);
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
		expect(t.pass).toBe(3);
		expect(t.total).toBe(4);
		expect(t.failures).toEqual(['chain does not terminate: next is A00001']);
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
		expect(t.pass).toBe(1);
		expect(t.total).toBe(2);
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
		expect(t.pass).toBe(2);
		expect(t.total).toBe(3);
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
