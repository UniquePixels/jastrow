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

describe('unbasedOrphans', () => {
	it('names an obligated entry that lost its anchor', () => {
		expect(unbasedOrphans([withAnchor('P00331', 'Yoma 2a')])).toEqual([
			'P00331: Eruvin 88b:1',
		]);
	});
	it('passes when the anchor is present', () => {
		expect(unbasedOrphans([withAnchor('P00331', 'Eruvin 88b:1')])).toEqual([]);
	});
	it('ignores entries outside the table', () => {
		expect(unbasedOrphans([withAnchor('A00001', 'x')])).toEqual([]);
	});
});
