// biome-ignore-all lint/style/noExcessiveLinesPerFile: a table-driven suite; the cases and the fixtures they share read as one unit.
import { describe, expect, it } from 'bun:test';
import { validateEntry } from '../../entry/validate.ts';
import type {
	BodyEntry,
	BodySense,
	FormAnnotationDraft,
	SenseAnnotationDraft,
	SourceEntry,
} from '../types.ts';
import { type Finished, finishEntry } from './finish.ts';
import { checkTextConservation, type Tally } from './gates.ts';

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
	pages: new Map([['A00014', { column: 'a' as const, number: 2 }]]),
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
		expect(entry.schemaVersion).toBe(3);
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
		// Ruling 10-09 reform homographs: the numeral rides beside the
		// line, so the headword string (the link namespace) stays Sefaria's.
		const { entry, problems } = finishEntry(
			{
				...source,
				display: '{0} I, {1} II',
				headword: 'אָב',
				homographs: [
					{ form: 0, homograph: 1 },
					{ form: 1, homograph: 2 },
				],
			},
			body,
			context,
		);
		expect(problems).toEqual([]);
		expect(entry.headwords).toEqual([
			{ homograph: 1, text: 'אָב' },
			{ homograph: 2, text: 'אבא' },
		]);
		expect(entry.display).toBe('{0} I, {1} II');
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

// Ruling 11-15 annotation section: the import writes one `annotations`
// list from the drafts the patches left, numbers the ids in the
// Global Constraints order (forms by index, a form's text before its
// homograph; then senses in document order, a sense before its
// children, the entry's senses before each stem's) and places what
// points to each: a tag in `display`, a gloss or a unit, or a sense's
// `annotation`. The result must meet the contract.
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite for the import's half of annotations; its cases share the drafts and the body they land in.
describe('finishEntry: drafts become one annotations list', () => {
	const NOTE = {
		date: '2026-10-13',
		kind: 'print-error',
		printed: 'p',
		note: 'n',
		source: 'P000005',
	} as const;
	const labelDraft = (patch: string = NOTE.source): SenseAnnotationDraft => ({
		...NOTE,
		field: 'label',
		source: patch,
	});
	/** `body` with the drafts on its first sense, labelled `1`. */
	const drafted = (...annotations: SenseAnnotationDraft[]): BodyEntry => ({
		...body,
		senses: [{ ...body.senses[0], annotations, label: '1' } as BodySense],
	});
	/** `source` with the line `אָב I, אבא`, form 0 numbered by a patch,
	 * and the form drafts given. */
	const numbered = (
		...formAnnotations: FormAnnotationDraft[]
	): SourceEntry => ({
		...source,
		display: '{0} I, {1}',
		formAnnotations,
		headword: 'אָב',
		homographs: [{ form: 0, homograph: 1 }],
	});
	const finished = (b: BodyEntry, s: SourceEntry = source): Finished =>
		finishEntry(s, b, context);

	it('writes a homograph draft as a tag on the numeral and one list item, last', () => {
		const { entry, problems } = finished(
			body,
			numbered({ ...NOTE, field: 'homograph', form: 0, printed: '' }),
		);
		expect(problems).toEqual([]);
		expect(entry.display).toBe('{0} <annotate id="a1">I</annotate>, {1}');
		expect(entry.annotations).toEqual([
			{
				id: 'a1',
				kind: 'print-error',
				printed: '',
				note: 'n',
				date: NOTE.date,
				source: NOTE.source,
			},
		]);
		expect(Object.keys(entry.annotations?.[0] ?? {})).toEqual([
			'id',
			'kind',
			'printed',
			'note',
			'date',
			'source',
		]);
		expect(Object.keys(entry).at(-1)).toBe('annotations');
		expect(entry.headwords[0]).toEqual({ homograph: 1, text: 'אָב' });
	});

	it('carries a note, after printed', () => {
		const { entry } = finished(
			body,
			numbered({
				...NOTE,
				field: 'homograph',
				form: 0,
				note: 'Print sets no numeral.',
				printed: '',
			}),
		);
		expect(Object.keys(entry.annotations?.[0] ?? {})).toEqual([
			'id',
			'kind',
			'printed',
			'note',
			'date',
			'source',
		]);
	});

	it('wraps {n} for a text draft, and numbers text before homograph on one form', () => {
		// Review Focus 1: the homograph draft is listed first, and the
		// text still takes a1.
		const { entry, problems } = finished(
			body,
			numbered(
				{
					...NOTE,
					field: 'homograph',
					form: 0,
					printed: '',
					source: 'P000006',
				},
				{ ...NOTE, field: 'text', form: 0, printed: 'אד' },
			),
		);
		expect(problems).toEqual([]);
		expect(entry.display).toBe(
			'<annotate id="a1">{0}</annotate> <annotate id="a2">I</annotate>, {1}',
		);
		expect(entry.annotations?.map((a) => `${a.id} ${a.source}`)).toEqual([
			'a1 P000005',
			'a2 P000006',
		]);
	});

	it('numbers forms by index, before every sense', () => {
		const { entry } = finished(
			drafted(labelDraft('P000009')),
			numbered(
				{ ...NOTE, field: 'text', form: 1, printed: 'אד', source: 'P000008' },
				{ ...NOTE, field: 'text', form: 0, printed: 'אד', source: 'P000007' },
			),
		);
		expect(entry.display).toBe(
			'<annotate id="a1">{0}</annotate> I, <annotate id="a2">{1}</annotate>',
		);
		expect(entry.annotations?.map((a) => `${a.id} ${a.source}`)).toEqual([
			'a1 P000007',
			'a2 P000008',
			'a3 P000009',
		]);
	});

	it('points a sense to a label draft', () => {
		const { entry, problems } = finished(drafted(labelDraft()));
		expect(problems).toEqual([]);
		expect(entry.senses[0]?.annotation).toBe('a1');
		expect(entry.senses[0]?.label).toBe('1');
		expect(entry.annotations?.map((a) => a.id)).toEqual(['a1']);
	});

	it.each([
		[
			'the gloss',
			'gloss-or-units',
			'<i>father</i>',
			'm. <he>אב</he> <annotate id="a1"><i>father</i></annotate>',
		],
		[
			'the gloss, by name',
			'gloss',
			'father',
			'm. <he>אב</he> <i><annotate id="a1">father</annotate></i>',
		],
		[
			'a unit, by name',
			'units',
			'v. ',
			'<annotate id="a1">v. </annotate><cite ref="A00013"><he>אָב</he></cite>.',
		],
		[
			'a unit, inside a cite (Review Focus 3)',
			'gloss-or-units',
			'<span dir="rtl">אָב</span>',
			'v. <cite ref="A00013"><annotate id="a1"><he>אָב</he></annotate></cite>.',
		],
	])(
		'wraps the one occurrence of the translated find in %s',
		(_name, field, find, text) => {
			const { entry, problems } = finished(
				drafted({ ...NOTE, field, find } as SenseAnnotationDraft),
			);
			expect(problems).toEqual([]);
			const sense = entry.senses[0];
			expect([sense?.gloss, ...(sense?.units ?? [])]).toContain(text);
			expect(sense?.annotation).toBeUndefined();
		},
	);

	it('wraps two finds in one field, each where it stands', () => {
		const { entry, problems } = finished(
			drafted(
				{ ...NOTE, field: 'gloss', find: 'father', source: 'P000006' },
				{ ...NOTE, field: 'gloss', find: 'm. ' },
			),
		);
		expect(problems).toEqual([]);
		expect(entry.senses[0]?.gloss).toBe(
			'<annotate id="a2">m. </annotate><he>אב</he> <i><annotate id="a1">father</annotate></i>',
		);
	});

	it('leaves the tagged text as gate 3 reads it', () => {
		const b = drafted({
			...NOTE,
			field: 'gloss-or-units',
			find: '<span dir="rtl">אָב</span>',
		});
		const { entry } = finished(b);
		const t: Tally = { failures: [], pass: 0, total: 0 };
		checkTextConservation(b, entry, t);
		expect(t.failures).toEqual([]);
		expect(t.pass).toBeGreaterThan(0);
	});

	it('numbers a relabel’s three labels in document order, a parent before its children', () => {
		// Review Focus 2: P00790's P000812 writes one label annotation per
		// changed child; each child gets its own id and pointer.
		const child = (letter: string): BodySense => ({
			annotations: [labelDraft('P000812')],
			gloss: letter,
			label: letter,
			units: [],
		});
		const b: BodyEntry = {
			...body,
			senses: [
				{
					...(body.senses[0] as BodySense),
					annotations: [
						{ ...NOTE, field: 'gloss', find: 'father', source: 'P000001' },
					],
					senses: [child('e'), child('f'), child('g')],
				},
			],
			stems: [
				{
					forms: [],
					senses: [{ ...child('a'), annotations: [labelDraft('P000002')] }],
					stem: 'Pi.',
				},
			],
		};
		const { entry, problems } = finished(b);
		expect(problems).toEqual([]);
		expect(entry.senses[0]?.gloss).toContain(
			'<annotate id="a1">father</annotate>',
		);
		expect(entry.senses[0]?.senses?.map((s) => s.annotation)).toEqual([
			'a2',
			'a3',
			'a4',
		]);
		expect(entry.stems?.[0]?.senses[0]?.annotation).toBe('a5');
		expect(entry.annotations?.map((a) => `${a.id} ${a.source}`)).toEqual([
			'a1 P000001',
			'a2 P000812',
			'a3 P000812',
			'a4 P000812',
			'a5 P000002',
		]);
	});

	it('reports a form draft on an entry with no display, never throws', () => {
		// Review Focus 4.
		const { entry, problems } = finished(body, {
			...source,
			alt_headwords: ['אבא'],
			formAnnotations: [{ ...NOTE, field: 'text', form: 0 }],
			headword: '(אָב',
		});
		expect(entry.display).toBeUndefined();
		expect(problems).toEqual([
			'A00014: headwords[0]: the annotation from P000005: the entry has no display to carry its tag',
		]);
		expect(entry.annotations).toBeUndefined();
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
		const { entry, problems } = finished(
			body,
			numbered({ ...NOTE, ...draft } as FormAnnotationDraft),
		);
		expect(problems).toEqual([problem]);
		expect(entry.annotations).toBeUndefined();
	});

	it('refuses a homograph draft whose numeral display does not set', () => {
		const { problems } = finished(body, {
			...numbered({ ...NOTE, field: 'homograph', form: 0, printed: '' }),
			display: '{0}, {1}',
		});
		expect(problems).toEqual([
			'A00014: headwords[0]: the annotation from P000005: display sets no I beside {0}',
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
		expect(entry.annotations).toBeUndefined();
	});

	it('refuses a label draft on a sense the build left unlabelled', () => {
		const b: BodyEntry = {
			...body,
			senses: [{ ...body.senses[0], annotations: [labelDraft()] } as BodySense],
		};
		expect(finished(b).problems).toEqual([
			'A00014: senses[0]: the annotation from P000005: the sense has no label',
		]);
	});

	it.each([
		[
			'kept, text unequal to printed',
			numbered({
				...NOTE,
				field: 'text',
				form: 0,
				kind: 'kept',
				printed: 'אד',
			}),
			'headwords[0]: the annotation from P000005: kind kept, but printed "אד" is not "אָב", what it marks',
		],
		[
			'print-error, text equal to printed',
			numbered({ ...NOTE, field: 'text', form: 0, printed: 'אָב' }),
			'headwords[0]: the annotation from P000005: kind print-error, but printed equals "אָב", what it marks',
		],
		[
			'illegible, numeral equal to printed',
			numbered({
				...NOTE,
				field: 'homograph',
				form: 0,
				kind: 'illegible',
				printed: 'I',
			}),
			'headwords[0]: the annotation from P000005: kind illegible, but printed equals "I", what it marks',
		],
		[
			'kept, numeral unequal to printed',
			numbered({
				...NOTE,
				field: 'homograph',
				form: 0,
				kind: 'kept',
				printed: '',
			}),
			'headwords[0]: the annotation from P000005: kind kept, but printed "" is not "I", what it marks',
		],
	])('refuses a kind that does not fit: %s', (_name, s, tail) => {
		expect(finished(body, s).problems).toEqual([`A00014: ${tail}`]);
	});

	it.each([
		[
			'kept, label equal to printed',
			{ ...NOTE, field: 'label', kind: 'kept', printed: '1' },
			[],
		],
		[
			'print-error, label equal to printed',
			{ ...NOTE, field: 'label', printed: '1' },
			['kind print-error, but printed equals "1", what it marks'],
		],
		[
			'kept, found text equal to printed',
			{
				...NOTE,
				field: 'gloss',
				find: 'father',
				kind: 'kept',
				printed: 'father',
			},
			[],
		],
		[
			'kept, found text unequal to printed',
			{
				...NOTE,
				field: 'gloss',
				find: 'father',
				kind: 'kept',
				printed: 'fathr',
			},
			['kind kept, but printed "fathr" is not "father", what it marks'],
		],
	])('compares the label or found text: %s', (_name, draft, tails) => {
		const { problems } = finished(drafted(draft as SenseAnnotationDraft));
		expect(problems).toEqual(
			tails.map((t) => `A00014: senses[0]: the annotation from P000005: ${t}`),
		);
	});

	it('writes no annotation keys where no draft was left', () => {
		const { entry } = finished(body);
		expect('annotations' in entry).toBe(false);
		expect(entry.senses.some((s) => 'annotation' in s)).toBe(false);
	});

	it('writes annotations the entry contract accepts', () => {
		const { entry } = finished(
			drafted(
				{ ...NOTE, field: 'gloss-or-units', find: 'father' },
				{ ...NOTE, field: 'label', source: 'P000006' },
			),
			numbered({
				...NOTE,
				field: 'homograph',
				form: 0,
				printed: '',
				source: 'P000007',
			}),
		);
		expect(validateEntry(entry, 'A/A00014.json')).toEqual([]);
		expect(entry.annotations?.map((a) => `${a.id} ${a.source}`)).toEqual([
			'a1 P000007',
			'a2 P000005',
			'a3 P000006',
		]);
	});
});
