import { describe, expect, it } from 'bun:test';
import {
	expectedDeployed,
	extractLinks,
	sefariaUrl,
	stripAbbrTags,
	stripLinkAttrs,
} from './baseline-transform.ts';

describe('stripLinkAttrs', () => {
	it('reduces anchor tags to bare <a> on both formats', () => {
		const raw =
			'v. <a dir="rtl" class="refLink" href="/Jastrow,_אֵם.1" data-ref="Jastrow, אֵם 1">אֵם</a>.';
		const dep = 'v. <a href="#rid:A01961" class="word-link">אֵם</a>.';
		expect(stripLinkAttrs(raw)).toBe('v. <a>אֵם</a>.');
		expect(stripLinkAttrs(dep)).toBe(stripLinkAttrs(raw));
	});

	it('leaves non-anchor markup untouched', () => {
		const text = '<i>father</i>, <span dir="rtl">אבה</span>';
		expect(stripLinkAttrs(text)).toBe(text);
	});
});

describe('stripAbbrTags', () => {
	it('unwraps the baseline-injected abbr markup', () => {
		expect(stripAbbrTags('<abbr title="opposed">opp.</abbr> <a>x</a>')).toBe(
			'opp. <a>x</a>',
		);
	});
});

describe('sefariaUrl', () => {
	it('derives the deployed URL from a data-ref', () => {
		expect(sefariaUrl('Shemot Rabbah 46:5')).toBe(
			'https://www.sefaria.org/Shemot%20Rabbah%2046%3A5',
		);
	});
});

describe('extractLinks', () => {
	it('raw side yields data-ref targets in order', () => {
		const raw =
			'<a dir="rtl" class="refLink" href="/Jastrow,_אָב I.1" data-ref="Jastrow, אָב I 1">אַב</a> and ' +
			'<a class="refLink" href="/Proverbs.23.29" data-ref="Proverbs 23:29">Prov. 23:29</a>';
		expect(extractLinks(raw)).toEqual([
			{ target: 'Jastrow, אָב I 1', text: 'אַב' },
			{ target: 'Proverbs 23:29', text: 'Prov. 23:29' },
		]);
	});

	it('deployed side yields href targets in order', () => {
		const dep =
			'<a href="#rid:A00013" class="word-link">אַב</a> and ' +
			'<a href="https://www.sefaria.org/Proverbs%2023%3A29" target="_blank" rel="noopener noreferrer" class="ref-link">Prov. 23:29</a>';
		expect(extractLinks(dep)).toEqual([
			{ target: '#rid:A00013', text: 'אַב' },
			{
				target: 'https://www.sefaria.org/Proverbs%2023%3A29',
				text: 'Prov. 23:29',
			},
		]);
	});

	it('anchor text may contain nested markup', () => {
		expect(
			extractLinks('<a href="#rid:A00016"><span dir="rtl">אָב</span> II</a>'),
		).toEqual([
			{ target: '#rid:A00016', text: '<span dir="rtl">אָב</span> II' },
		]);
	});
});

describe('expectedDeployed', () => {
	const base = {
		_id: { $oid: 'x' },
		headword: 'אָב I',
		parent_lexicon: 'Jastrow Dictionary',
		rid: 'A00013',
		refs: ['Shabbat 104a'],
		content: { senses: [{ definition: 'father' }] },
		quotes: [],
		next_hw: 'אָב II',
		prev_hw: 'אַאיֵל',
		page: 2,
		column: 'a',
		plural_form: [],
		alt_headwords: [],
	};

	it('renames keys and drops _id, parent_lexicon, refs, and empties', () => {
		// refs is not carried: the deployed rf is a derived rollup of
		// link targets, audited as a derived field instead.
		expect(expectedDeployed(base)).toEqual({
			hw: 'אָב I',
			id: 'A00013',
			c: { s: [{ d: 'father' }] },
			nh: 'אָב II',
			ph: 'אַאיֵל',
			p: 2,
			col: 'a',
		});
	});

	it('carries non-empty alts, plurals, and quotes', () => {
		const entry = {
			...base,
			alt_headwords: ['אבא'],
			plural_form: ['אבות'],
			quotes: ['q'],
		};
		expect(expectedDeployed(entry)).toMatchObject({
			ah: ['אבא'],
			pf: ['אבות'],
			q: ['q'],
		});
	});

	it('joins language_code and language_reference into li, trimmed', () => {
		const entry = {
			...base,
			language_code: '(b. h.;',
			language_reference: ' <span dir="rtl">אבה</span>)',
		};
		expect(expectedDeployed(entry)['li']).toBe(
			'(b. h.; <span dir="rtl">אבה</span>)',
		);
		expect(expectedDeployed({ ...base, language_code: '(b. h.)' })['li']).toBe(
			'(b. h.)',
		);
		// reference-only entries lead with a space the extraction trimmed
		expect(
			expectedDeployed({ ...base, language_reference: ' ch. = h.' })['li'],
		).toBe('ch. = h.');
	});

	it('renames sense fields recursively, grammar included', () => {
		const entry = {
			...base,
			content: {
				morphology: 'm.',
				senses: [
					{ definition: 'father', number: '1' },
					{
						grammar: { verbal_stem: 'Nif.', binyan_form: ['נֶאֱבַד'] },
						senses: [{ definition: 'to be lost' }],
					},
				],
			},
		};
		expect(expectedDeployed(entry)['c']).toEqual({
			mo: 'm.',
			s: [
				{ d: 'father', n: '1' },
				{
					g: { vs: 'Nif.', bf: ['נֶאֱבַד'] },
					s: [{ d: 'to be lost' }],
				},
			],
		});
	});
});
