import { describe, expect, it } from 'bun:test';
import { planWrites } from './review.ts';

describe('planWrites', () => {
	const docs = { 'a.md': 'alpha\n', 'b.md': 'beta\n' };

	it('missing files are written', () => {
		expect(planWrites(docs, new Map(), false)).toEqual({
			refused: [],
			unchanged: [],
			writes: ['a.md', 'b.md'],
		});
	});

	it('byte-identical files need no write', () => {
		const existing = new Map([
			['a.md', 'alpha\n'],
			['b.md', 'beta\n'],
		]);
		expect(planWrites(docs, existing, false)).toEqual({
			refused: [],
			unchanged: ['a.md', 'b.md'],
			writes: [],
		});
	});

	it('a differing file is refused without force', () => {
		const existing = new Map([
			['a.md', 'alpha\n\n| A00913 | ALL approved |\n'],
			['b.md', 'beta\n'],
		]);
		expect(planWrites(docs, existing, false)).toEqual({
			refused: ['a.md'],
			unchanged: ['b.md'],
			writes: [],
		});
	});

	it('force overwrites differing files', () => {
		const existing = new Map([['a.md', 'alpha edited\n']]);
		expect(planWrites(docs, existing, true)).toEqual({
			refused: [],
			unchanged: [],
			writes: ['a.md', 'b.md'],
		});
	});
});
