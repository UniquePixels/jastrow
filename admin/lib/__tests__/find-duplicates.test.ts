import { describe, expect, it } from 'bun:test';
import { findDuplicates } from '../find-duplicates.ts';

describe('findDuplicates', () => {
	it('reports each later claimant with the first owner', () => {
		const items = ['a1', 'b1', 'a2', 'a3'];
		expect(findDuplicates(items, (s) => s.slice(0, 1))).toEqual([
			{ item: 'a2', owner: 'a1' },
			{ item: 'a3', owner: 'a1' },
		]);
	});

	it('reports nothing when every key is held once', () => {
		expect(findDuplicates(['a', 'b'], (s) => s)).toEqual([]);
	});
});
