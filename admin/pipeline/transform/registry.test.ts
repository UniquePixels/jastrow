import { describe, expect, it } from 'bun:test';
import { type Pattern, parsePatterns } from '../research/patterns.ts';
import { checkAdjacency, coverage, PENDING, RULES } from './registry.ts';
import type { Rule } from './types.ts';

const catalogue = parsePatterns(
	await Bun.file('data/patches/patterns.jsonl').text(),
);

describe('registry coverage', () => {
	it('every rule id exists in the catalogue', () => {
		const ids = new Set(catalogue.map((row) => row.id));
		for (const rule of RULES) {
			expect(ids).toContain(rule.id);
		}
	});

	it('every transform row is registered or explicitly pending', () => {
		const report = coverage(catalogue);
		expect(report.unaccounted).toEqual([]);
		expect(report.registered + report.pending).toBe(report.total);
	});

	// 80, not the 81 this asserted through batch 1: abbrev-in-alt-headwords
	// was reclassified from transform to judgment on 2026-08-22. Expanding a
	// geresh stub needs the headword's remaining vowels to carry over to the
	// variant, and a variant spelling exists precisely because it differs —
	// so the transfer is an assumption the corpus cannot test, not a
	// derivation. Maintainer ruling; see that row's reason.
	it('the catalogue still holds 80 transform rows', () => {
		expect(coverage(catalogue).total).toBe(80);
	});

	it('pending ids all exist in the catalogue', () => {
		const ids = new Set(catalogue.map((row) => row.id));
		for (const id of PENDING) {
			expect(ids).toContain(id);
		}
	});
});

describe('checkAdjacency', () => {
	// The RTL family is a 3-clique (Task 4), registered consecutively in
	// Task 5. Under a pairwise "≤ 1 apart" rule the endpoints are 2 apart
	// and no arrangement can pass — hence cluster contiguity.
	const clique = (ids: string[]): Pattern[] =>
		ids.map((id) => ({
			corpusCount: 0,
			description: '',
			entangledWith: ids.filter((other) => other !== id),
			id,
			round: 0,
			status: 'candidate' as const,
		}));

	it('a contiguous three-way cluster passes', () => {
		const rules = ['a', 'b', 'c'].map((id) => ({ id }) as Rule);
		expect(checkAdjacency(clique(['a', 'b', 'c']), rules)).toEqual([]);
	});

	it('a split cluster is reported once, not once per edge', () => {
		const rules = ['a', 'b', 'x', 'c'].map((id) => ({ id }) as Rule);
		expect(checkAdjacency(clique(['a', 'b', 'c']), rules)).toHaveLength(1);
	});
});
