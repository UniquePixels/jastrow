import { describe, expect, it } from 'bun:test';
import type { Chunk } from './chunks.ts';
import { stratifiedRound } from './sample.ts';

/** Three letters, four chunks each. */
function corpus(): Chunk[] {
	const chunks: Chunk[] = [];
	for (const letter of ['A', 'B', 'C']) {
		for (let i = 0; i < 4; i++) {
			chunks.push({
				id: `chunk-${letter}${i}`,
				rids: [`${letter}0000${i}`],
			});
		}
	}
	return chunks;
}

describe('stratifiedRound', () => {
	it('returns one chunk per rid letter', () => {
		const picked = stratifiedRound(corpus(), new Set(), 1);
		expect(picked).toHaveLength(3);
		expect(new Set(picked.map((c) => c.rids[0]?.[0])).size).toBe(3);
	});

	it('is deterministic for the same inputs', () => {
		const a = stratifiedRound(corpus(), new Set(), 1).map((c) => c.id);
		const b = stratifiedRound(corpus(), new Set(), 1).map((c) => c.id);
		expect(a).toEqual(b);
	});

	it('never selects a completed chunk', () => {
		const completed = new Set(['chunk-A0', 'chunk-A1', 'chunk-A2']);
		const picked = stratifiedRound(corpus(), completed, 1);
		const a = picked.find((c) => c.rids[0]?.[0] === 'A');
		expect(a?.id).toBe('chunk-A3');
	});

	it('picks different chunks across rounds', () => {
		const one = stratifiedRound(corpus(), new Set(), 1).map((c) => c.id);
		const two = stratifiedRound(corpus(), new Set(), 2).map((c) => c.id);
		expect(one).not.toEqual(two);
	});

	it('skips a letter whose chunks are all complete', () => {
		const completed = new Set(['chunk-B0', 'chunk-B1', 'chunk-B2', 'chunk-B3']);
		const picked = stratifiedRound(corpus(), completed, 1);
		expect(picked.some((c) => c.rids[0]?.[0] === 'B')).toBe(false);
	});
});
