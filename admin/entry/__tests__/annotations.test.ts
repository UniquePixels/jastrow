/**
 * Controls for the annotation clause of the entry contract
 * (`annotations.ts`; ruling `11-15 annotation section`, clause 3). The
 * contract checks the references and nothing else: every id is
 * referenced exactly once, every reference names an annotation the
 * entry holds, an id names one annotation, and a label pointer stands
 * on a sense with a label. Each case plants one
 * defect into an entry that is otherwise valid and names the problem
 * it must raise.
 *
 * Every case runs through `validateEntry`, so the schema half (shape,
 * enums, patterns) and the reference half are held as one contract,
 * the way a hand edit meets it.
 */
import { describe, expect, it } from 'bun:test';
import { type Annotation, type Entry, SCHEMA_VERSION } from '../schema.ts';
import { validateEntry } from '../validate.ts';

const PATH = 'A/A00001.json';

/** One annotation in one positional call, so each table row stays one
 * line. */
function a(id: string, kind: Annotation['kind'] = 'print-error'): Annotation {
	return {
		id,
		kind,
		printed: '',
		note: 'n',
		date: '2026-11-15',
		source: 'P000001',
	};
}

/** The entry every case plants into, valid as it stands: a homograph
 * tag in `display` (a1), a gloss tag (a2), a unit tag inside a cite
 * (a3) and a label pointer on a stem's nested sense (a4). `over`
 * replaces whole top-level keys. */
function base(over: Partial<Entry> = {}): Entry {
	return {
		schemaVersion: SCHEMA_VERSION,
		id: 'A00001',
		sefariaHeadword: 'אב',
		headwords: [{ text: 'אב', homograph: 1 }],
		display: '{0} <annotate id="a1">I</annotate>',
		senses: [
			{
				gloss: 'father, <annotate id="a2">x</annotate>',
				label: '1',
				units: [
					'u0',
					'<cite ref="C00294"><annotate id="a3"><he>אב</he></annotate> I</cite>',
				],
			},
		],
		stems: [
			{
				stem: 'Pi.',
				forms: [],
				senses: [
					{
						gloss: 'g',
						units: [],
						senses: [{ gloss: 'n', label: 'a', annotation: 'a4', units: [] }],
					},
				],
			},
		],
		annotations: [a('a1'), a('a2'), a('a3', 'kept'), a('a4', 'illegible')],
		...over,
	};
}

/** `base` with its first sense's gloss replaced. */
function glossed(gloss: string): Entry {
	const entry = base();
	const [first] = entry.senses;
	return first === undefined
		? entry
		: { ...entry, senses: [{ ...first, gloss }] };
}

const PLAIN_GLOSS = 'father, x';
const TWICE =
	'father, <annotate id="a2">x</annotate> <annotate id="a1">y</annotate>';
const DANGLING =
	'father, <annotate id="a2">x</annotate> <annotate id="a7">y</annotate>';

describe('annotations: what passes', () => {
	it('an entry whose every id is referenced once, in display, gloss, unit and pointer', () => {
		expect(validateEntry(base(), PATH)).toEqual([]);
	});

	it('an entry with no annotations and no tags', () => {
		const { annotations: _list, stems: _stems, ...rest } = base();
		expect(
			validateEntry(
				{ ...rest, display: '{0} I', senses: [{ gloss: 'g', units: [] }] },
				PATH,
			),
		).toEqual([]);
	});

	it('an annotation with a note and without a source', () => {
		const { source: _source, ...bare } = a('a1');
		const list = [
			{ ...bare, note: 'Print sets no numeral.' },
			a('a2'),
			a('a3'),
			a('a4'),
		];
		expect(validateEntry(base({ annotations: list }), PATH)).toEqual([]);
	});
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one table, one row per planted defect; splitting it would scatter the clause it pins.
describe('annotations: the reference half', () => {
	it.each([
		[
			'an id referenced 0 times',
			glossed(PLAIN_GLOSS),
			['annotations[1]: a2 is referenced 0 times; it must be referenced once'],
		],
		[
			'an id referenced twice',
			glossed(TWICE),
			['annotations[0]: a1 is referenced 2 times; it must be referenced once'],
		],
		[
			'a tag naming an id the list lacks',
			glossed(DANGLING),
			['senses[0].gloss: points to a7, which annotations does not hold'],
		],
		[
			'a display tag naming an id the list lacks',
			base({ display: '{0} <annotate id="a9">I</annotate>' }),
			[
				'display: points to a9, which annotations does not hold',
				'annotations[0]: a1 is referenced 0 times; it must be referenced once',
			],
		],
		[
			'two items with one id',
			base({ annotations: [a('a1'), a('a2'), a('a3'), a('a4'), a('a2')] }),
			[
				'annotations[4]: a2 is the id of annotations[1] too; an id names one annotation',
			],
		],
		[
			'a malformed tag, which carries no id',
			base({ display: '{0} <annotate id="a01">I</annotate>' }),
			[
				'annotations[0]: a1 is referenced 0 times; it must be referenced once',
				'display: tag outside the vocabulary: <annotate id="a01">',
			],
		],
	] as [string, Entry, string[]][])('refuses %s', (_name, entry, tails) => {
		expect(validateEntry(entry, PATH)).toEqual(
			tails.map((t) => `A00001: ${t}`),
		);
	});

	it.each([
		[
			'a dangling id in a stem label',
			'Pi. <annotate id="a9">x</annotate>',
			[],
			['stems[0].stem: points to a9, which annotations does not hold'],
		],
		[
			'a second reference to a1 in a stem form',
			'Pi.',
			['<annotate id="a1">y</annotate>'],
			['annotations[0]: a1 is referenced 2 times; it must be referenced once'],
		],
	] as [string, string, string[], string[]][])(
		'refuses %s',
		(_name, stem, forms, tails) => {
			const entry = base();
			const [first] = entry.stems ?? [];
			if (first !== undefined) {
				first.stem = stem;
				first.forms = forms;
			}
			expect(validateEntry(entry, PATH)).toEqual(
				tails.map((t) => `A00001: ${t}`),
			);
		},
	);

	it('refuses a label pointer naming an id the list lacks', () => {
		const entry = base();
		const nested = entry.stems?.[0]?.senses[0]?.senses?.[0];
		if (nested !== undefined) {
			nested.annotation = 'a5';
		}
		expect(validateEntry(entry, PATH)).toEqual([
			'A00001: stems[0].senses[0].senses[0].annotation: points to a5, which annotations does not hold',
			'A00001: annotations[3]: a4 is referenced 0 times; it must be referenced once',
		]);
	});

	it('refuses a label pointer on a sense with no label', () => {
		const entry = base();
		const parent = entry.stems?.[0]?.senses[0];
		if (parent !== undefined) {
			parent.senses = [{ gloss: 'n', annotation: 'a4', units: [] }];
		}
		expect(validateEntry(entry, PATH)).toEqual([
			'A00001: stems[0].senses[0].senses[0].annotation: points to a4 from a sense with no label; the pointer annotates the label',
		]);
	});
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one table, one row per planted defect; splitting it would scatter the clause it pins.
describe('annotations: the schema half', () => {
	it.each([
		['an empty list, never []', base({ annotations: [] }), 'minItems'],
		[
			'an id that is not a + a number from 1',
			base({ annotations: [{ ...a('a1'), id: 'a0' }] }),
			'pattern',
		],
		[
			'a kind outside the enum',
			base({
				annotations: [{ ...a('a1'), kind: 'typo' as Annotation['kind'] }],
			}),
			'allowedValues',
		],
		[
			'a source that is not P + 6 digits',
			base({ annotations: [{ ...a('a1'), source: 'P00001' }] }),
			'pattern',
		],
		[
			'a date that is not YYYY-MM-DD',
			base({ annotations: [{ ...a('a1'), date: '13/10/2026' }] }),
			'pattern',
		],
		[
			'an empty note',
			base({ annotations: [{ ...a('a1'), note: '' }] }),
			'minLength',
		],
		[
			'a key the shape does not name',
			base({ annotations: [{ ...a('a1'), field: 'gloss' } as Annotation] }),
			'additionalProperties',
		],
		[
			'a pointer that is not an id',
			base({
				senses: [{ annotation: 'x1', gloss: 'g', label: '1', units: [] }],
			}),
			'pattern',
		],
		[
			'an annotations key on a form',
			base({
				headwords: [
					{ text: 'אב', annotations: [] } as Entry['headwords'][number],
				],
			}),
			'additionalProperties',
		],
	] as [string, Entry, string][])('refuses %s', (_name, entry, keyword) => {
		const problems = validateEntry(entry, PATH);
		expect(problems).toHaveLength(1);
		expect(problems[0]).toStartWith(`${PATH}: schema: `);
		expect(problems[0]).toContain(keyword);
	});
});
