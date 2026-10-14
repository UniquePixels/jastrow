// biome-ignore-all lint/style/noExcessiveLinesPerFile: a table-driven suite; the cases and the fixtures they share read as one unit.
import { describe, expect, it } from 'bun:test';
import { entryAnnotations } from '../../entry/annotations.ts';
import { validateEntry } from '../../entry/validate.ts';
import type {
	BodyEntry,
	BodySense,
	FormAnnotationDraft,
	SenseAnnotationDraft,
	SourceEntry,
} from '../types.ts';
import { type Finished, finishEntry } from './finish.ts';

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
	it('assembles the entry in schema key order', () => {
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
	it('sets a patch-supplied homograph on the parsed form', () => {
		// Ruling 10-06 implied I: the numeral rides beside the line, so
		// the headword string (the link namespace) stays Sefaria's.
		const { entry, problems } = finishEntry(
			{
				...source,
				display: '{0}, {1} I',
				headword: 'אָב',
				homographs: [
					{ form: 0, homograph: 1, implied: true },
					{ form: 1, homograph: 1 },
				],
			},
			body,
			context,
		);
		expect(problems).toEqual([]);
		expect(entry.headwords).toEqual([
			{ homograph: 1, implied: true, text: 'אָב' },
			{ homograph: 1, text: 'אבא' },
		]);
		expect(entry.display).toBe('{0}, {1} I');
	});

	it.each([
		[[{ form: 0, homograph: 1 }], 'headwords[0], which already carries II'],
		[[{ form: 2, homograph: 1 }], 'there is no headwords[2]'],
	])(
		'refuses homographs %j where the line cannot take them',
		(homographs, reason) => {
			const { problems } = finishEntry(
				{ ...source, homographs },
				body,
				context,
			);
			expect(problems.join('; ')).toContain(reason);
		},
	);

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
	it('writes a starred label as label plus reconstructed, at every depth', () => {
		// Ruling 10-04 sense star. The flag follows the label onto the
		// written sense, top-level, nested and in a stem, and an unstarred
		// sense gains no key.
		const star = {
			gloss: 'x',
			label: '2',
			reconstructed: true as const,
			units: [],
		};
		const starred: BodyEntry = {
			...body,
			senses: [{ gloss: 'y', label: '1', senses: [star], units: [] }, star],
			stems: [{ forms: [], senses: [star], stem: 'Pa.' }],
		};
		const { entry } = finishEntry(source, starred, context);
		const [first, second] = entry.senses;
		expect(first).toEqual({
			gloss: 'y',
			label: '1',
			senses: [star],
			units: [],
		});
		expect(second).toEqual(star);
		expect(entry.stems?.[0]?.senses).toEqual([star]);
	});
});

// ANNOTATIONS.md §3: the import adds `field` and `stored` to each draft
// a patch left, from where the patched value landed after the build,
// and the result must meet the contract (`admin/entry/annotations.ts`).
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite for the import's half of annotations; its cases share the drafts and the body they land in.
describe('finishEntry: annotation drafts become annotations', () => {
	const NOTE = {
		date: '2026-10-13',
		evidence: 'e',
		kind: 'print-error',
		printed: 'p',
		source: 'P000005',
	} as const;
	/** `body` with the drafts on its first sense, labelled `1`. */
	const drafted = (...annotations: SenseAnnotationDraft[]): BodyEntry => ({
		...body,
		senses: [{ ...body.senses[0], annotations, label: '1' } as BodySense],
	});
	const finished = (b: BodyEntry, s: SourceEntry = source): Finished =>
		finishEntry(s, b, context);

	it('writes field, kind, printed, stored, evidence, source, date, in that order', () => {
		const { entry, problems } = finished(drafted({ ...NOTE, field: 'label' }));
		expect(problems).toEqual([]);
		const [note] = entry.senses[0]?.annotations ?? [];
		expect(note).toEqual({ ...NOTE, field: 'label', stored: '1' });
		expect(Object.keys(note ?? {})).toEqual([
			'field',
			'kind',
			'printed',
			'stored',
			'evidence',
			'source',
			'date',
		]);
	});

	it.each([
		[
			'the gloss',
			'gloss-or-units',
			'<i>father</i>',
			['gloss', '<i>father</i>'],
		],
		[
			'a unit, translated as the unit is',
			'gloss-or-units',
			'<a dir="rtl" class="refLink" href="/Jastrow,_אָב I.1" data-ref="Jastrow, אָב I 1">אָב</a>',
			['units[0]', '<cite ref="A00013"><he>אָב</he></cite>'],
		],
		['the gloss, by name', 'gloss', 'father', ['gloss', 'father']],
		['a unit, by name', 'units', 'v. ', ['units[0]', 'v. ']],
	])('locates text in %s', (_name, field, find, [landed, stored]) => {
		const { entry, problems } = finished(
			drafted({ ...NOTE, field, find } as SenseAnnotationDraft),
		);
		expect(problems).toEqual([]);
		expect(entry.senses[0]?.annotations).toEqual([
			{ ...NOTE, field: landed, stored } as never,
		]);
	});

	it.each([
		[
			'text found nowhere',
			'gloss-or-units',
			'mother',
			'occurs in no gloss or unit of its sense',
		],
		[
			'text in a unit, named as gloss',
			'gloss',
			'v. ',
			'occurs in no gloss of its sense',
		],
		['text in more than one place', 'gloss-or-units', '.', 'occurs 3 times'],
		[
			'markup that does not balance alone',
			'gloss-or-units',
			'<i>father',
			'is not balanced markup on its own',
		],
	])('refuses %s', (_name, field, find, reason) => {
		const { entry, problems } = finished(
			drafted({ ...NOTE, field, find } as SenseAnnotationDraft),
		);
		expect(problems).toHaveLength(1);
		expect(problems[0]).toStartWith(
			'A00014: senses[0]: the annotation from P000005: ',
		);
		expect(problems[0]).toContain(reason);
		expect(entry.senses[0]?.annotations).toBeUndefined();
	});

	it('refuses a label draft on a sense the build left unlabelled', () => {
		const b: BodyEntry = {
			...body,
			senses: [
				{
					...body.senses[0],
					annotations: [{ ...NOTE, field: 'label' }],
				} as BodySense,
			],
		};
		expect(finished(b).problems).toEqual([
			'A00014: senses[0]: the annotation from P000005: the sense has no label',
		]);
	});

	it('resolves drafts on a nested sense and a stem sense', () => {
		const child: BodySense = {
			annotations: [{ ...NOTE, field: 'label' }],
			gloss: 'c',
			label: 'a',
			units: [],
		};
		const b: BodyEntry = {
			...body,
			senses: [{ ...(body.senses[0] as BodySense), senses: [child] }],
			stems: [{ forms: [], senses: [child], stem: 'Pi.' }],
		};
		const { entry, problems } = finished(b);
		expect(problems).toEqual([]);
		expect(entry.senses[0]?.senses?.[0]?.annotations).toEqual([
			{ ...NOTE, field: 'label', stored: 'a' },
		]);
		expect(entry.stems?.[0]?.senses[0]?.annotations).toEqual([
			{ ...NOTE, field: 'label', stored: 'a' },
		]);
	});

	it.each([
		[
			'a homograph, as print writes it',
			{ field: 'homograph', form: 0 },
			{ field: 'homograph', stored: 'II' },
		],
		[
			'a form text',
			{ field: 'text', form: 1 },
			{ field: 'text', stored: 'אבא' },
		],
	])('writes %s on the form', (_name, draft, written) => {
		const { entry, problems } = finished(body, {
			...source,
			formAnnotations: [{ ...NOTE, ...draft } as FormAnnotationDraft],
		});
		expect(problems).toEqual([]);
		const form = entry.headwords[(draft as { form: number }).form];
		expect(form?.annotations).toEqual([{ ...NOTE, ...written } as never]);
		expect(Object.keys(form?.annotations?.[0] ?? {})).toEqual([
			'field',
			'kind',
			'printed',
			'stored',
			'evidence',
			'source',
			'date',
		]);
	});

	it.each([
		[
			'a form the line does not have',
			{ field: 'text', form: 2 },
			'A00014: headwords[2]: the annotation from P000005: there is no headwords[2]',
		],
		[
			'a homograph on a form with none',
			{ field: 'homograph', form: 1 },
			'A00014: headwords[1]: the annotation from P000005: the form has no homograph',
		],
	])('refuses %s', (_name, draft, problem) => {
		const { problems } = finished(body, {
			...source,
			formAnnotations: [{ ...NOTE, ...draft } as FormAnnotationDraft],
		});
		expect(problems).toEqual([problem]);
	});

	it('writes no annotations key where no draft was left', () => {
		const { entry } = finished(body);
		expect(entry.headwords.some((f) => 'annotations' in f)).toBe(false);
		expect(entry.senses.some((s) => 'annotations' in s)).toBe(false);
	});

	it('writes annotations the entry contract accepts', async () => {
		const { entry } = finished(
			drafted(
				{ ...NOTE, field: 'gloss-or-units', find: 'father' },
				{ ...NOTE, field: 'label', source: 'P000006' },
			),
			{
				...source,
				formAnnotations: [
					{
						...NOTE,
						field: 'homograph',
						form: 0,
						printed: 'I',
						source: 'P000007',
					},
				],
			},
		);
		const problems = await validateEntry(entry, 'A/A00014.json');
		expect(problems.filter((p) => p.includes('annotations'))).toEqual([]);
		expect(
			[...entryAnnotations(entry)].map((a) => a.annotation.source),
		).toEqual(['P000007', 'P000005', 'P000006']);
	});
});
