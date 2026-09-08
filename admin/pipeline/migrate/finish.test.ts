import { describe, expect, it } from 'bun:test';
import type { BodyEntry, SourceEntry } from '../body/types.ts';
import { finishEntry } from './finish.ts';

const source: SourceEntry = {
	alt_headwords: ['אבא'],
	content: { senses: [] },
	headword: 'אָב II',
	rid: 'A00014',
};
const body: BodyEntry = {
	grammar: { gender: 'm' },
	id: 'A00014',
	senses: [
		{
			gloss: 'm. <span dir="rtl">אב</span> <i>father</i>',
			units: [
				'v. <a dir="rtl" class="refLink" href="/Jastrow,_אָב I.1" data-ref="Jastrow, אָב I 1">אָב</a>.',
			],
		},
	],
	stems: [
		{ forms: ['נֶאֱבַד'], senses: [{ gloss: 'x', units: [] }], stem: 'Nif.' },
	],
};
const context = {
	headwordMap: new Map([['אָב I', 'A00013']]),
	pages: new Map([
		[
			'A00014',
			{ column: 'a' as const, confidence: 'high' as const, number: 2 },
		],
	]),
	slugs: new Map([['A00014', 'אב-2']]),
};

describe('finishEntry', () => {
	it('assembles the truth entry in schema key order', () => {
		const { entry, problems, unresolved } = finishEntry(source, body, context);
		expect(problems).toEqual([]);
		expect(unresolved).toEqual([]);
		expect(Object.keys(entry)).toEqual([
			'id',
			'slug',
			'headword',
			'altHeadwords',
			'page',
			'grammar',
			'senses',
			'stems',
		]);
		expect(entry.headword).toEqual({ homograph: 2, text: 'אָב' });
		expect(entry.altHeadwords).toEqual([{ text: 'אבא' }]);
		expect(entry.page).toEqual({ column: 'a', number: 2 });
		expect(entry.senses[0]?.gloss).toBe('m. <he>אב</he> <i>father</i>');
		expect(entry.senses[0]?.units[0]).toBe(
			'v. <cite ref="A00013"><he>אָב</he></cite>.',
		);
		expect(entry.stems?.[0]?.forms).toEqual(['נֶאֱבַד']);
	});
	it('reports a missing page and keeps going', () => {
		const { entry, problems } = finishEntry(source, body, {
			...context,
			pages: new Map(),
		});
		expect(entry.page).toBeUndefined();
		expect(problems).toEqual(['A00014: no page-index row']);
	});
	it('carries an <i> a gloss opens into the unit that closes it', () => {
		const crossing: BodyEntry = {
			...body,
			senses: [{ gloss: 'm. <i>father', units: ['of Abraham</i>.'] }],
		};
		const { entry, markupCarries, problems } = finishEntry(
			source,
			crossing,
			context,
		);
		expect(entry.senses[0]?.gloss).toBe('m. <i>father</i>');
		expect(entry.senses[0]?.units[0]).toBe('<i>of Abraham</i>.');
		expect(problems).toEqual([]);
		expect(markupCarries).toEqual([
			'A00014: senses[0].gloss: carried i across a unit boundary',
		]);
	});
});
