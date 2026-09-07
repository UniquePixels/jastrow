import { describe, expect, it } from 'bun:test';
import { assignSlugs, slugStem } from './slug.ts';

describe('slugStem', () => {
	it('strips points, dagesh and the combining dot', () => {
		expect(slugStem('אָב')).toBe('אב');
		expect(slugStem('בַּד')).toBe('בד');
		expect(slugStem('מנא̇')).toBe('מנא');
	});
	it('joins words with a hyphen and keeps geresh', () => {
		expect(slugStem('כְּפַר א׳')).toBe('כפר-א׳');
	});
	it('folds pointed homographs onto one stem', () => {
		// אָב and אֵב differ only in points: same stem, so they collide.
		expect(slugStem('אֵב')).toBe(slugStem('אָב'));
	});
});

describe('assignSlugs', () => {
	it('numbers collisions in rid order regardless of input order', () => {
		const { problems, slugs } = assignSlugs([
			{ rid: 'A00014', text: 'אָב' },
			{ rid: 'A00016', text: 'אֵיב' },
			{ rid: 'A00013', text: 'אָב' },
		]);
		expect(problems).toEqual([]);
		expect([...slugs]).toEqual([
			['A00014', 'אב-2'],
			['A00016', 'איב'],
			['A00013', 'אב-1'],
		]);
	});
	it('reports an empty stem instead of throwing', () => {
		const { problems, slugs } = assignSlugs([{ rid: 'Z00001', text: 'ָ' }]);
		expect(problems).toEqual(['Z00001: empty stem from "ָ"']);
		expect(slugs.size).toBe(0);
	});
});
