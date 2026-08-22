import { describe, expect, it } from 'bun:test';
import { parsePatterns } from '../research/patterns.ts';
import { coverage, PENDING, RULES } from './registry.ts';

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

	it('the catalogue still holds 81 transform rows', () => {
		expect(coverage(catalogue).total).toBe(81);
	});

	it('pending ids all exist in the catalogue', () => {
		const ids = new Set(catalogue.map((row) => row.id));
		for (const id of PENDING) {
			expect(ids).toContain(id);
		}
	});
});
