import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { unbasedOrphans } from './orphan-refs.ts';

const withAnchor = (rid: string, ref: string): SourceEntry => ({
	content: {
		senses: [{ definition: `<a class="refLink" data-ref="${ref}">Ib.</a>` }],
	},
	headword: 'x',
	rid,
});

const ONE_OBLIGATION = { P00331: ['Eruvin 88b:1'] };

describe('unbasedOrphans', () => {
	it('names an obligated entry that lost its anchor', () => {
		expect(
			unbasedOrphans([withAnchor('P00331', 'Yoma 2a')], ONE_OBLIGATION),
		).toEqual(['P00331: Eruvin 88b:1']);
	});
	it('passes when the anchor is present', () => {
		expect(
			unbasedOrphans([withAnchor('P00331', 'Eruvin 88b:1')], ONE_OBLIGATION),
		).toEqual([]);
	});
	it('ignores entries outside the table', () => {
		expect(
			unbasedOrphans(
				[withAnchor('P00331', 'Eruvin 88b:1'), withAnchor('A00001', 'x')],
				ONE_OBLIGATION,
			),
		).toEqual([]);
	});
	it('names an obligated rid missing from the composed set', () => {
		expect(unbasedOrphans([], { S01230: ['Yoma 85b:14'] })).toEqual([
			'S01230: (entry missing)',
		]);
	});
	it('checks every obligated rid against the default table', () => {
		const lines = unbasedOrphans([withAnchor('P00331', 'Eruvin 88b:1')]);
		expect(lines).toContain('S01230: (entry missing)');
		expect(lines.some((l) => l.startsWith('P00331'))).toBe(false);
	});
});
