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

describe('assignSlugs with prior assignments', () => {
	const FAMILY = new Map([
		['A00012', 'אב-1'],
		['A00013', 'אב-2'],
	]);

	it('keeps a frozen slug when the headword is respelled', () => {
		// The whole point of R10: a transform that respells a headword
		// must not rewrite a published URL.
		const { assigned, drift, slugs } = assignSlugs(
			[{ rid: 'A00013', text: 'גמל' }],
			FAMILY,
		);
		expect(slugs.get('A00013')).toBe('אב-2');
		expect(assigned).toEqual([]);
		expect(drift).toEqual(['A00013: slug אב-2 but stem גמל']);
	});

	it('gives a new family member the next free number, moving nobody', () => {
		const { assigned, slugs } = assignSlugs(
			[
				{ rid: 'A00012', text: 'אַב־' },
				{ rid: 'A00013', text: 'אָב' },
				{ rid: 'A00099', text: 'אֵב' },
			],
			FAMILY,
		);
		expect([...slugs]).toEqual([
			['A00012', 'אב-1'],
			['A00013', 'אב-2'],
			['A00099', 'אב-3'],
		]);
		expect(assigned).toEqual(['A00099']);
	});

	it('numbers a newcomer even when the incumbent holds the bare slug', () => {
		// A stem first held by one entry keeps that entry on the bare
		// slug; the newcomer starts the numbering at 1 (spec §7.3).
		const { slugs } = assignSlugs(
			[
				{ rid: 'A00012', text: 'אַב־' },
				{ rid: 'A00099', text: 'אָב' },
			],
			new Map([['A00012', 'אב']]),
		);
		expect(slugs.get('A00012')).toBe('אב');
		expect(slugs.get('A00099')).toBe('אב-1');
	});

	it('does not reissue a retired slug', () => {
		// A00013 is gone from the corpus but keeps its row, so אב-2 is
		// reserved and the newcomer skips to אב-3.
		const { slugs } = assignSlugs(
			[
				{ rid: 'A00012', text: 'אַב־' },
				{ rid: 'A00099', text: 'אָב' },
			],
			FAMILY,
		);
		expect(slugs.get('A00099')).toBe('אב-3');
		expect(slugs.has('A00013')).toBe(false);
	});

	it('fills a gap left in the middle of a family', () => {
		const { slugs } = assignSlugs(
			[{ rid: 'A00099', text: 'אָב' }],
			new Map([
				['A00012', 'אב-1'],
				['A00014', 'אב-3'],
			]),
		);
		expect(slugs.get('A00099')).toBe('אב-2');
	});

	it('leaves a drifted slug reserved under the family it names', () => {
		// A00013's slug says אב-2 while its headword now stems to גמל.
		// A new אב entry must still skip 2 — the slug is what is held,
		// not the headword.
		const { slugs } = assignSlugs(
			[
				{ rid: 'A00013', text: 'גמל' },
				{ rid: 'A00099', text: 'אָב' },
			],
			FAMILY,
		);
		expect(slugs.get('A00099')).toBe('אב-3');
	});

	it('gives a new unique stem the bare slug', () => {
		const { assigned, slugs } = assignSlugs(
			[{ rid: 'B00001', text: 'בַּד' }],
			FAMILY,
		);
		expect(slugs.get('B00001')).toBe('בד');
		expect(assigned).toEqual(['B00001']);
	});

	it('treats a non-ASCII trailing marker as stem, not index', () => {
		// P00224's real slug is `(עוזרד-²`: Sefaria's homograph mark, not
		// a family number. Reading it as one would reserve index 2 in a
		// family that does not exist.
		const { slugs } = assignSlugs(
			[{ rid: 'P00225', text: '(עוּזְרָד ²' }],
			new Map([['P00224', '(עוזרד-²']]),
		);
		expect(slugs.get('P00225')).toBe('(עוזרד-²-1');
	});
});
