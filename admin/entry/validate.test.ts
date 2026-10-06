// biome-ignore-all lint/style/noExcessiveLinesPerFile: a table-driven suite; the cases and the builders they share read as one unit.
/**
 * Controls for `validate.ts`. `bun data:validate` passing on the
 * committed tree is a null result; these show each check CAN fire, one
 * planted defect at a time, and that it names the defect it found.
 */
import { describe, expect, it } from 'bun:test';
import type { PagePlacement } from './page.ts';
import { type Entry, SCHEMA_VERSION } from './types.ts';
import {
	type EntryFile,
	entryFields,
	loadEntryFiles,
	markupProblems,
	RID,
	validateCorpus,
	validateEntries,
	validateEntry,
} from './validate.ts';

/** Shin with qamats and shin dot, marks in the wrong order: canonical
 * order puts qamats (class 18) before the shin dot (class 24), so this
 * spelling is not its own NFC form while looking identical to it — the
 * shape a paste from another editor arrives in. Built from escapes,
 * never a pasted literal, which an editor may normalize silently. */
const NOT_NFC = '\u05E9\u05C1\u05B8';
const NFC = NOT_NFC.normalize('NFC');

/** `headword` and `sefariaHeadword` are both the given word, so a
 * planted defect in either is the only thing the tree disagrees on. */
function entry(id: string, headword: string, gloss: string): Entry {
	return {
		schemaVersion: SCHEMA_VERSION,
		id,
		sefariaHeadword: headword,
		headwords: [{ text: headword }],
		display: '{0}',
		page: { number: 1, column: 'a' },
		senses: [{ gloss, units: [] }],
	};
}

function tree(...entries: Entry[]): EntryFile[] {
	return entries.map((e) => ({
		entry: e,
		path: `${e.id.charAt(0)}/${e.id}.json`,
	}));
}

function pagesFor(...ids: string[]): Map<string, PagePlacement> {
	return new Map(
		ids.map((id) => [id, { column: 'a', confidence: 'high', number: 1 }]),
	);
}

const A = (): Entry =>
	entry('A00001', 'אב', 'father, <cite ref="A00002">אבא</cite> <i>x</i>');
const B = (): Entry =>
	entry(
		'A00002',
		'אבא',
		'<he>אבא</he> <cite ref="Shabbat 104a">Shab. 104ᵃ</cite>',
	);

describe('markupProblems', () => {
	it.each([
		['<i>a</i> <he>b</he> <b>c</b> <sub>d</sub> <sup>e</sup>', []],
		['<cite ref="A00002">x</cite>', []],
		[
			'<span dir="rtl">x</span>',
			['tag outside the vocabulary: <span dir="rtl">'],
		],
		['<cite>x</cite>', ['tag outside the vocabulary: <cite>']],
		['<cite ref="">x</cite>', ['tag outside the vocabulary: <cite ref="">']],
		['<he dir="rtl">x</he>', ['tag outside the vocabulary: <he dir="rtl">']],
		['<i>x</b>', ['</b> closes <i>']],
		['x</i>', ['</i> closes nothing']],
		['<he>x', ['unclosed: he']],
		['x <i', ['stray angle bracket in text: x <i']],
		['<i>a</i> b>', ['stray angle bracket in text:  b>']],
	])('%s', (html, expected) => {
		expect(markupProblems(html).problems).toEqual(expected);
	});

	it('collects cite refs in order', () => {
		expect(
			markupProblems('<cite ref="A00002">a</cite><cite ref="Ber. 2a">b</cite>')
				.refs,
		).toEqual(['A00002', 'Ber. 2a']);
	});
});

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: one suite per behaviour; its cases share setup and read as a single table.
describe('validateEntries', () => {
	it('a valid tree has no problems', async () => {
		const files = tree(A(), B());
		expect(await validateEntries(files, pagesFor('A00001', 'A00002'))).toEqual(
			[],
		);
	});

	it('reports a schema failure by path and drops the entry from the corpus checks', async () => {
		const files: EntryFile[] = [
			{ entry: { id: 'A00001' }, path: 'A/A00001.json' },
			...tree(B()),
		];
		const problems = await validateEntries(files, pagesFor('A00001', 'A00002'));
		expect(problems).toHaveLength(2);
		expect(problems[0]).toStartWith('A/A00001.json: schema: ');
		expect(problems[1]).toBe('page-index row A00001 has no entry');
	});

	it.each([
		[
			'a file away from its home',
			[{ entry: A(), path: 'B/A00001.json' }, ...tree(B())],
			'B/A00001.json: id A00001 belongs at A/A00001.json',
		],
		[
			'a duplicate current name',
			tree(A(), { ...B(), headwords: [{ text: 'אב' }] }),
			'A00002: name אב taken by A00001',
		],
		[
			'a name that collides only once the notation is stripped',
			// §4 drops `( ) ? ,` from the name: `(אב)` and `אב` are two
			// headwords and one URL, which nothing but this check sees.
			// Rule 4 refuses the same parenthesis: the notation the name
			// strips is exactly what a form's text may not hold. The file's
			// own finding comes first: `validateEntries` runs every file
			// before the corpus.
			tree(A(), { ...B(), headwords: [{ text: '(אב)' }] }),
			[
				'A00002: headwords[0].text carries "(", which belongs in display or the gloss (§3.1 rule 4)',
				'A00002: name אב taken by A00001',
			],
		],
		[
			'a duplicate sefariaHeadword',
			tree(A(), { ...B(), sefariaHeadword: 'אב' }),
			'A00002: sefariaHeadword אב taken by A00001',
		],
		[
			'markup in the headword',
			// A tag is Latin letters, which rule 4 also refuses.
			tree({ ...A(), headwords: [{ text: '<i>אב</i>' }] }, B()),
			[
				'A00001: headwords[0].text carries "i", which belongs in display or the gloss (§3.1 rule 4)',
				'A00001: headwords[0].text: markup in a plain-text field',
			],
		],
		[
			'markup in an alt headword',
			tree(
				{
					...A(),
					headwords: [{ text: 'אב' }, { text: 'אבא</he>' }],
					display: '{0}, {1}',
				},
				B(),
			),
			[
				'A00001: headwords[1].text carries "h", which belongs in display or the gloss (§3.1 rule 4)',
				'A00001: headwords[1].text: markup in a plain-text field',
			],
		],
		[
			'markup in sefariaHeadword',
			tree(A(), { ...B(), sefariaHeadword: '<b>אבא' }),
			'A00002: sefariaHeadword: markup in a plain-text field',
		],
		[
			'markup in a former name',
			// `formerNames` is absent from every entry until publication;
			// the check is in place so the field cannot arrive unguarded.
			tree(A(), { ...B(), formerNames: ['<i>אבא'] }),
			'A00002: formerNames[0]: markup in a plain-text field',
		],
		[
			'markup in a nested stem sense label',
			tree(A(), {
				...B(),
				stems: [
					{
						stem: 'Pi.',
						forms: [],
						senses: [
							{
								gloss: 'g',
								units: [],
								senses: [{ label: '<i>a</i>', gloss: 'n', units: [] }],
							},
						],
					},
				],
			}),
			'A00002: stems[0].senses[0].senses[0].label: markup in a plain-text field',
		],
		[
			'a dangling internal cite',
			tree(A(), entry('A00002', 'אבא', '<cite ref="A09999">x</cite>')),
			'A00002: senses[0].gloss: cite ref A09999 names no entry',
		],
		[
			'a bad tag in a nested sense unit',
			tree(A(), {
				...B(),
				senses: [
					{
						gloss: 'g',
						units: [],
						senses: [{ gloss: 'n', units: ['<u>x</u>'] }],
					},
				],
			}),
			'A00002: senses[0].senses[0].units[0]: tag outside the vocabulary: <u>',
		],
		[
			'a bad tag in a stem form',
			tree(A(), {
				...B(),
				stems: [
					{
						stem: 'Nif.',
						forms: ['<he>x'],
						senses: [{ gloss: 'g', units: [] }],
					},
				],
			}),
			'A00002: stems[0].forms[0]: unclosed: he',
		],
		[
			'a page edited in the entry alone',
			tree(A(), { ...B(), page: { number: 2, column: 'b' } }),
			'A00002: page p2b but the page index says p1a',
		],
		// The §3.1 rules, one planted defect each. Rule 4 halts; its
		// findings appear in the notation and markup cases above, and
		// its own controls live in `headword-rules.test.ts`.
		[
			'a display that names the wrong slots (rule 1)',
			tree(A(), {
				...B(),
				display: '{0}, {2}',
				headwords: [{ text: 'אבא' }, { text: 'אבב' }],
			}),
			'A00002: display names slots [0,2] for 2 form(s) (§3.1 rule 1)',
		],
		[
			'Hebrew written into the display (rule 2)',
			tree(A(), { ...B(), display: '{0} אב' }),
			'A00002: display carries Hebrew "א" (§3.1 rule 2)',
		],
		[
			'a numeral in the display the form does not carry (rule 3)',
			tree(A(), { ...B(), display: '{0} II' }),
			'A00002: display says homograph II but the form says undefined (§3.1 rule 3)',
		],
		[
			'a partial alternate with no full sibling (rule 5)',
			tree(A(), {
				...B(),
				display: '{0}, {1}',
				headwords: [
					{ partial: true, text: 'אבא' },
					{ partial: true, text: 'אבב' },
				],
			}),
			'A00002: headwords[1] is partial with no full sibling, so the entry has no lookup key (§3.1 rule 5)',
		],
	])('reports %s', async (_name, files, expected) => {
		expect(await validateEntries(files, pagesFor('A00001', 'A00002'))).toEqual(
			[expected].flat(),
		);
	});

	it('reads files at every depth, so a misplaced one is reported', async () => {
		const { files, problems } = await loadEntryFiles(
			`${import.meta.dir}/fixtures/entry-tree`,
		);
		expect(problems).toEqual([]);
		expect(files.map((f) => f.path)).toEqual([
			'A/A00001.json',
			'A/old/A00003.json',
			'A00002.json',
		]);
		expect(
			await validateEntries(files, pagesFor('A00001', 'A00002', 'A00003')),
		).toEqual([
			'A/old/A00003.json: id A00003 belongs at A/A00003.json',
			'A00002.json: id A00002 belongs at A/A00002.json',
		]);
	});

	it('reports page-index coverage both ways', async () => {
		expect(
			await validateEntries(tree(A(), B()), pagesFor('A00001', 'A00003')),
		).toEqual([
			'A00002: no page-index row (entry has p1a)',
			'page-index row A00003 has no entry',
		]);
	});
});

describe('the NFC clause', () => {
	it('the planted spelling is a real NFC defect — positive control', () => {
		// Without this, a constant that an editor had normalized would
		// make every case below pass for the wrong reason.
		expect(NOT_NFC).not.toBe(NFC);
		expect(NOT_NFC.normalize('NFD')).toBe(NFC.normalize('NFD'));
	});

	it('passes the same word in NFC', async () => {
		expect(
			await validateEntry(
				entry('A00001', 'אב', `gloss ${NFC}`),
				'A/A00001.json',
			),
		).toEqual([]);
	});

	it.each([
		[
			'a gloss',
			{ ...A(), senses: [{ gloss: NOT_NFC, units: [] }] },
			'senses[0].gloss',
		],
		[
			'a nested stem sense unit',
			{
				...A(),
				stems: [
					{
						stem: 'Pi.',
						forms: [],
						senses: [
							{
								gloss: 'g',
								units: [],
								senses: [{ gloss: 'n', units: ['x', NOT_NFC] }],
							},
						],
					},
				],
			},
			'stems[0].senses[0].senses[0].units[1]',
		],
		[
			'a headword form',
			{ ...A(), headwords: [{ text: `אב${NOT_NFC}` }] },
			'headwords[0].text',
		],
	])('fires on a decomposed spelling in %s, naming the field', async (_name, planted, field) => {
		expect(await validateEntry(planted, 'A/A00001.json')).toEqual([
			`A00001: ${field}: not NFC`,
		]);
	});

	it('does not ask sefariaHeadword to be NFC — it is Sefaria’s bytes', async () => {
		// `VERBATIM_FIELDS`: the import's NFC write leaves this field
		// alone, so the contract must not refuse what the import writes.
		expect(
			await validateEntry(
				{ ...A(), sefariaHeadword: NOT_NFC },
				'A/A00001.json',
			),
		).toEqual([]);
	});
});

describe('the two halves', () => {
	it('validateEntry answers only what one file can: a dangling cite is not its finding', async () => {
		const dangling = entry('A00002', 'אבא', '<cite ref="A09999">x</cite>');
		expect(await validateEntry(dangling, 'A/A00002.json')).toEqual([]);
		expect(
			validateCorpus([A(), dangling], pagesFor('A00001', 'A00002')),
		).toEqual(['A00002: senses[0].gloss: cite ref A09999 names no entry']);
	});

	it('validateCorpus answers only what the tree can: markup is not its finding', () => {
		const bad = { ...B(), senses: [{ gloss: '<he>x', units: [] }] };
		expect(validateCorpus([A(), bad], pagesFor('A00001', 'A00002'))).toEqual(
			[],
		);
	});

	// Ruling 10-06 implied I: `implied` says a homograph numeral is ours,
	// so it means nothing without one. The schema refuses it first
	// (`dependentRequired`); `headword-rules.test.ts` holds the same
	// clause in the shape rules, for a caller that has no schema.
	it('validateEntry refuses implied without a homograph', async () => {
		const planted = { ...A(), headwords: [{ implied: true, text: 'אב' }] };
		const problems = await validateEntry(planted, 'A/A00001.json');
		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('dependentRequired');
		expect(problems[0]).toContain('implied');
	});

	it('validateEntry passes an implied I that display does not number', async () => {
		const planted = {
			...A(),
			headwords: [{ homograph: 1, implied: true, text: 'אב' }],
		};
		expect(await validateEntry(planted, 'A/A00001.json')).toEqual([]);
	});

	it('validateEntry reports a schema failure by path and stops there', async () => {
		const problems = await validateEntry({ id: 'A00001' }, 'A/A00001.json');
		expect(problems).toHaveLength(1);
		expect(problems[0]).toStartWith('A/A00001.json: schema: ');
	});
});

// Ruling HW-gender (headword design §4): an entry's gender lives in
// `grammar.gender` OR in a `gender` on every headword — never both, and
// neither is inherited. The committed tree carries no form gender at
// all (the parser never mints one), so `bun data:validate` passing is
// a null result for this rule; these are its controls.
describe('gender exclusivity (HW-gender)', () => {
	/** Two forms, each slot followed by `after[n]` in the display. */
	const pair = (
		genders: [('f' | 'm')?, ('f' | 'm')?],
		after: [string, string],
	): Entry => ({
		...A(),
		display: `{0}${after[0]}, {1}${after[1]}`,
		headwords: [
			{ text: 'אב', ...(genders[0] && { gender: genders[0] }) },
			{ text: 'אבה', ...(genders[1] && { gender: genders[1] }) },
		],
	});

	it.each([
		['neither', pair([], ['', ''])],
		[
			'grammar.gender alone',
			{ ...pair([], ['', '']), grammar: { gender: 'm' } },
		],
		['a gender on every headword', pair(['m', 'f'], [' m.', ' f.'])],
	] as [string, Entry][])('passes %s', async (_name, planted) => {
		expect(await validateEntry(planted, 'A/A00001.json')).toEqual([]);
	});

	it.each([
		[
			'grammar.gender beside a gender on every headword',
			{ ...pair(['m', 'f'], [' m.', ' f.']), grammar: { gender: 'm' } },
			[
				'A00001: grammar.gender beside a form gender on headwords [0,1]; an entry carries one or the other, never both (HW-gender)',
			],
		],
		[
			'a gender on some headwords but not every one',
			pair(['m'], [' m.', '']),
			[
				'A00001: a form gender on headwords [0] but none on [1]; it goes on every headword or none (HW-gender)',
			],
		],
		[
			'both at once',
			{ ...pair(['m'], [' m.', '']), grammar: { gender: 'm' } },
			[
				'A00001: grammar.gender beside a form gender on headwords [0]; an entry carries one or the other, never both (HW-gender)',
				'A00001: a form gender on headwords [0] but none on [1]; it goes on every headword or none (HW-gender)',
			],
		],
	] as [
		string,
		Entry,
		string[],
	][])('refuses %s', async (_name, planted, expected) => {
		expect(await validateEntry(planted, 'A/A00001.json')).toEqual(expected);
	});
});

/** One entry with every text field filled, two levels of senses
 * under the entry and under a stem. */
const FULL: Entry = {
	...A(),
	display: '{0}, {1}',
	formerNames: ['אבו'],
	grammar: { gender: 'm', number: 'pl' },
	headwords: [{ text: 'אב' }, { text: 'אבה' }],
	senses: [
		{
			gloss: 'head',
			units: ['u0', 'u1'],
			senses: [
				{
					label: '1',
					gloss: 'one',
					units: [],
					senses: [{ label: 'a', gloss: 'deep', units: ['d0'] }],
				},
			],
		},
	],
	stems: [
		{
			stem: 'Pi.',
			forms: ['f0', 'f1'],
			senses: [
				{
					label: '1',
					gloss: 'pi',
					units: ['p0'],
					senses: [{ label: 'a', gloss: 'pi-a', units: ['pa0'] }],
				},
			],
		},
	],
};

/** Every string `value` holds, by the walker's path spelling. */
function* stringPaths(value: unknown, at: string): Generator<string> {
	if (typeof value === 'string') {
		yield at;
		return;
	}
	if (typeof value !== 'object' || value === null) {
		return;
	}
	const array = Array.isArray(value);
	for (const [key, item] of Object.entries(value)) {
		yield* stringPaths(item, childPath(at, key, array));
	}
}

/** The path of `key` under `at`, spelled as `entryFields` spells one:
 * `[i]` for an array index, a dot before an object key. */
function childPath(at: string, key: string, array: boolean): string {
	if (array) {
		return `${at}[${key}]`;
	}
	return at === '' ? key : `${at}.${key}`;
}

/** Strings that are codes or keys, not text: the rid, the schema's
 * enums and the page column. */
const NOT_TEXT = /^(id|grammar\..*|page\..*|headwords\[\d+\]\.gender)$/u;

// The walker compile will read every text field through (review ledger
// L04). The expected set is computed by a generic JSON walk written
// here, not by the walker's own helpers, so a field the walker skips
// shows up as a difference rather than agreeing with itself.
describe('entryFields', () => {
	it('visits every text field, nested senses and stems included', () => {
		const expected = [...stringPaths(FULL, '')].filter(
			(p) => !NOT_TEXT.test(p),
		);
		expect(expected).toContain('stems[0].senses[0].senses[0].units[0]');
		expect([...entryFields(FULL)].map((f) => f.path).toSorted()).toEqual(
			expected.toSorted(),
		);
	});

	it('marks the identifier and label fields plain, the rest markup', () => {
		expect(
			[...entryFields(FULL)].filter((f) => !f.markup).map((f) => f.path),
		).toEqual([
			'sefariaHeadword',
			'headwords[0].text',
			'headwords[1].text',
			'display',
			'formerNames[0]',
			'senses[0].senses[0].label',
			'senses[0].senses[0].senses[0].label',
			'stems[0].senses[0].label',
			'stems[0].senses[0].senses[0].label',
		]);
	});

	it('hands back the text of each field', () => {
		const byPath = new Map([...entryFields(FULL)].map((f) => [f.path, f.text]));
		expect(byPath.get('stems[0].forms[1]')).toBe('f1');
		expect(byPath.get('senses[0].senses[0].senses[0].gloss')).toBe('deep');
	});
});

describe('RID', () => {
	it.each([
		['A00001', true],
		['Z99999', true],
		['A0001', false],
		['a00001', false],
		['A000011', false],
		['Shabbat 104a', false],
	])('%s → %p', (ref, expected) => {
		expect(RID.test(ref)).toBe(expected);
	});
});
