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
	sefariaHeadwords: new Map([['A00014', 'אָב II']]),
};

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('finishEntry', () => {
	it('assembles the truth entry in schema key order', () => {
		const { entry, problems, unresolved } = finishEntry(source, body, context);
		expect(problems).toEqual([]);
		expect(unresolved).toEqual([]);
		expect(Object.keys(entry)).toEqual([
			'schemaVersion',
			'id',
			'sefariaHeadword',
			'headwords',
			'display',
			'page',
			'grammar',
			'senses',
			'stems',
		]);
		expect(entry.schemaVersion).toBe(2);
		expect(entry.headwords).toEqual([
			{ homograph: 2, text: 'אָב' },
			{ text: 'אבא' },
		]);
		expect(entry.display).toBe('{0} II, {1}');
		expect(entry.page).toEqual({ column: 'a', number: 2 });
		expect(entry.senses[0]?.gloss).toBe('m. <he>אב</he> <i>father</i>');
		expect(entry.senses[0]?.units[0]).toBe(
			'v. <cite ref="A00013"><he>אָב</he></cite>.',
		);
		expect(entry.stems?.[0]?.forms).toEqual(['נֶאֱבַד']);
	});
	it('carries a detector kind on each headword review row', () => {
		// The kind is decided by the parser, not by this call site, and it
		// is the WHOLE LINE that is judged: a `=` anywhere on it is a text
		// defect, and the review line quotes the line rather than one item.
		const { entry, headwordReview } = finishEntry(
			{
				...source,
				alt_headwords: ['פּוּם בְּדִיתָא'],
				headword: 'אִידְרְעָא = אֶדְרְעָא',
			},
			body,
			context,
		);
		expect(headwordReview.map((r) => r.kind)).toEqual(['headword-unparsed']);
		expect(headwordReview[0]?.line).toContain('A00014: אִידְרְעָא = אֶדְרְעָא');
		expect(entry.display).toBeUndefined();
	});

	it('leaves display unset and flags a group the line never closes', () => {
		const { entry, headwordReview } = finishEntry(
			{ ...source, alt_headwords: ['אבא'], headword: '(אָב' },
			body,
			context,
		);
		expect(headwordReview.map((r) => r.kind)).toEqual([
			'paren-group-close-unknown',
		]);
		expect(entry.display).toBeUndefined();
		expect(entry.headwords).toEqual([{ text: 'אָב' }, { text: 'אבא' }]);
	});
	it('reports a missing page and keeps going', () => {
		const { entry, problems } = finishEntry(source, body, {
			...context,
			pages: new Map(),
		});
		expect(entry.page).toBeUndefined();
		expect(problems).toEqual(['A00014: no page-index row']);
	});
	it('reports a missing sefariaHeadword and leaves the field empty', () => {
		// Empty rather than absent, so the schema gate fails on the same
		// entry rather than the field simply going missing.
		const { entry, problems } = finishEntry(source, body, {
			...context,
			sefariaHeadwords: new Map(),
		});
		expect(entry.sefariaHeadword).toBe('');
		expect(problems).toEqual(['A00014: no sefariaHeadword']);
	});
	it('writes the SOURCE headword, not the composed one', () => {
		// U3: the field tracks Sefaria. A transform that respells our
		// headword must leave it alone, so it comes from the context map
		// (built off the pristine entry) rather than off `source.headword`
		// here — which by pass 2 is the COMPOSED spelling.
		const { entry } = finishEntry({ ...source, headword: 'אָב III' }, body, {
			...context,
			sefariaHeadwords: new Map([['A00014', 'אָב II']]),
		});
		expect(entry.sefariaHeadword).toBe('אָב II');
		expect(entry.headwords[0]).toEqual({ homograph: 3, text: 'אָב' });
	});
	it('force-closes an <i> still open at the end of a sequence', () => {
		// The last field of a flow has nowhere to carry to, so its
		// leftover run is closed there and reported as such. This is
		// informational: `markupCarries` fails no gate.
		const dangling: BodyEntry = {
			...body,
			senses: [{ gloss: 'm. <i>father', units: [] }],
			stems: [],
		};
		const { entry, markupCarries, problems } = finishEntry(
			source,
			dangling,
			context,
		);
		expect(entry.senses[0]?.gloss).toBe('m. <i>father</i>');
		expect(problems).toEqual([]);
		expect(markupCarries).toEqual([
			'A00014: senses[0].gloss: closed at sequence end: i',
		]);
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
	it('carries an <i> a parent gloss opens into its first child gloss', () => {
		const crossing: BodyEntry = {
			...body,
			senses: [
				{
					gloss: 'm. <i>father',
					senses: [{ gloss: 'of Abraham</i>.', units: [] }],
					units: [],
				},
			],
		};
		const { entry, markupCarries, problems } = finishEntry(
			source,
			crossing,
			context,
		);
		expect(entry.senses[0]?.gloss).toBe('m. <i>father</i>');
		expect(entry.senses[0]?.senses?.[0]?.gloss).toBe('<i>of Abraham</i>.');
		expect(problems).toEqual([]);
		expect(markupCarries).toEqual([
			'A00014: senses[0].gloss: carried i across a unit boundary',
		]);
	});
});
