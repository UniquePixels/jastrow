// biome-ignore-all lint/style/noExcessiveLinesPerFile: a table-driven suite; the cases and the fixtures they share read as one unit.
import { describe, expect, it } from 'bun:test';
import type { Entry } from '../../entry/types.ts';
import { buildHeadwordIssues } from './headword-issues.ts';

// Two entries whose primary headword is a maqaf fragment (X5), so each
// yields exactly one issue row. Only the first one's line is on the
// processor's review list.
const MAQAF_FORM = 'הֵיכ־';

function entry(id: string): Entry {
	return {
		schemaVersion: 2,
		id,
		sefariaHeadword: MAQAF_FORM,
		headwords: [{ text: MAQAF_FORM }],
		senses: [{ gloss: 'x', units: [] }],
	};
}

/** One csv column, keyed by rid: 6 is `processor_flagged`, 7
 * `reviewed_kept`. */
function columnByRid(csv: string, column = 6): Map<string, string> {
	const out = new Map<string, string>();
	for (const line of csv.trim().split('\n').slice(1)) {
		const cells = line.slice(1, -1).split('","');
		out.set(cells[1] ?? '', cells[column] ?? '');
	}
	return out;
}

describe('buildHeadwordIssues: the flagged column', () => {
	// The detail is what `finishEntry` mints: the whole line, then the
	// parser's reason. The review targets the LINE, so every form on it
	// has been seen.
	const rows = [
		{
			detail: `${MAQAF_FORM}, אַבְיוּ — an item has no Hebrew in it`,
			kind: 'headword-unparsed',
			rid: 'A00001',
		},
		// A non-headword kind on the second rid must not flag it.
		{ detail: 'markup', kind: 'markup-carry', rid: 'A00002' },
	];
	const issues = buildHeadwordIssues([entry('A00001'), entry('A00002')], rows);
	const flagged = columnByRid(issues.csv);

	it('a form whose line the processor reviewed is flagged', () => {
		expect(flagged.get('A00001')).toBe('true');
	});

	it('a form on an unreviewed line is not', () => {
		expect(flagged.get('A00002')).toBe('false');
	});

	it('the summary table counts the flagged row', () => {
		expect(issues.doc).toContain('| X5 maqaf fragment | 2 | 2 | 0 | 1 |');
	});
});

/** One headword form as a tuple: text, then `homograph` and
 * `disambiguator` when the form carries them. */
type Form = readonly [
	text: string,
	homograph?: number | undefined,
	superscript?: number,
];

/** An entry whose `headwords` are `forms`, index 0 the primary. */
function withForms(id: string, ...forms: Form[]): Entry {
	return {
		schemaVersion: 2,
		id,
		sefariaHeadword: forms[0]?.[0] ?? '',
		headwords: forms.map(([text, homograph, disambiguator]) => ({
			text,
			...(homograph === undefined ? {} : { homograph }),
			...(disambiguator === undefined ? {} : { disambiguator }),
		})),
		senses: [{ gloss: 'x', units: [] }],
	};
}

/** `count` entries of one unrelated word each, numbered on from rid
 * `first` within `letter`, to stand between two others in rid order. */
function filler(letter: string, first: number, count: number): Entry[] {
	const alphabet = 'אבגדהוזחטיכלמנסעפצקרשת';
	return Array.from({ length: count }, (_, i) =>
		withForms(`${letter}${String(first + i).padStart(5, '0')}`, [
			`ת${alphabet[Math.floor(i / 22)]}${alphabet[i % 22]}ת`,
		]),
	);
}

/** The csv's rows of one shape, as `[rid, note]`. */
function rowsOf(csv: string, shape: string): Array<[string, string]> {
	return csv
		.trim()
		.split('\n')
		.slice(1)
		.map((line) => line.slice(1, -1).split('","'))
		.filter((cells) => cells[0]?.startsWith(shape))
		.map((cells) => [cells[1] ?? '', cells[5] ?? '']);
}

// The real entries, cut to the forms that decide each case.
const AGORA = [
	withForms('A00278', ['אֱגוֹרָא', 1], ['אֵיגוֹרָא']),
	withForms('A00279', ['אֲגוֹרָא', 2]),
];
const AKHAL = [
	withForms('A01697', ['אֲכַל'], ['אָכַל', 1]),
	withForms('A01698', ['אֲכַל', 2]),
];
const ILFA = [
	withForms('A01310', ['אִילפָא', 1], ['אִלְפָא']),
	withForms('A01311', ['אִילְפָא', 2]),
];
const GARBA = [
	withForms('C01232', ['גָּרָב', 1]),
	withForms('C01233', ['גְּרַב', undefined, 2], ['גַּרְבָּא', 1]),
	withForms('C01234', ['גָּרָב', 2]),
	withForms('C01235', ['גָּרָב'], ['גַּרְבּא', 2]),
];
const BEZA = [
	withForms('B00435', ['בְּזֵי'], ['בְּזָא', 1]),
	withForms('B00436', ['בְּזֵי', undefined, 2], ['בְּזָא', 2]),
	withForms('B00437', ['בִּזָּא', undefined, 2]),
];
const BIZZA = withForms('B00561', ['בִּיזָּא'], ['בִּזָּא', 2]);
const AGMA = [withForms('A00311', ['אַגְמָא']), withForms('A00312', ['אַגְמָא', 2])];
const QARHA = [
	withForms('S01969', ['קְרַח', 1]),
	withForms('S01973', ['קְרַח', 2], ['קַרְחָא', 1], ['קָרָחָא']),
	withForms('S01974', ['קַרְחָא', 2], ['קָרְחָא', 1]),
	withForms('S01975', ['קָרָחָא', 2], ['קָרָחָה']),
	withForms('S01976', ['קָרְחָא', 2]),
];
// `בָּא` with its dagesh typed before its qamats, and in NFC order.
const MARK_ORDER = [
	withForms('B00001', ['\u05D1\u05BC\u05B8\u05D0', 1]),
	withForms('B00002', ['\u05D1\u05BC\u05B8\u05D0'.normalize('NFC'), 2]),
];

// `בָּא` I with two accents of one combining class (etnahta, tipeha),
// and II with the same two the other way round: NFC keeps both orders.
const ACCENT_ORDER = [
	withForms('B00003', ['\u05D1\u05B8\u0591\u0596\u05D0', 1]),
	withForms('B00004', ['\u05D1\u05B8\u0596\u0591\u05D0', 2]),
];
// `בָּא` I, and II with its qamats typed twice.
const DOUBLED = [
	withForms('B00005', ['\u05D1\u05B8\u05D0', 1]),
	withForms('B00006', ['\u05D1\u05B8\u05B8\u05D0', 2]),
];
// [case, entries, X8 rids, X9 rows as [rid, how the note opens]]
const SEQUENCE_CASES: Array<
	[string, Entry[], string[], Array<[string, string]>]
> = [
	[
		'אֱגוֹרָא I, אֲגוֹרָא II',
		AGORA,
		[],
		[['A00279', 'vowels differ: א (letter 1) hataf segol vs hataf patah']],
	],
	[
		'אָכַל I on an alternate, אֲכַל II',
		AKHAL,
		[],
		[['A01698', 'vowels differ: א (letter 1) qamats vs hataf patah']],
	],
	[
		'אִילפָא I, אִילְפָא II',
		ILFA,
		[],
		[['A01311', 'mark missing: ל (letter 3) no mark vs sheva']],
	],
	[
		'גַּרְבָּא I, גַּרְבּא II past another word',
		GARBA,
		[],
		[['C01235', 'mark missing: ב (letter 3) qamats and dagesh vs dagesh']],
	],
	[
		'בִּזָּא II, 125 entries after בְּזָא I, II',
		[...BEZA, ...filler('B', 438, 123), BIZZA],
		['B00561'],
		[],
	],
	[
		'בִּזָּא II beside בְּזָא II, no superscript: not cleared (X10, below)',
		[...BEZA, withForms('B00438', ['בִּיזָּא'], ['בִּזָּא', 2])],
		[],
		[],
	],
	['אַגְמָא II, a bare form just before it (X10, below)', AGMA, [], []],
	['קרחא: three IIs and two Is, no superscript', QARHA, ['S01975'], []],
	['one spelling, its marks in two orders', MARK_ORDER, [], []],
	[
		'two accents in two orders',
		ACCENT_ORDER,
		[],
		[['B00004', 'marks in another order']],
	],
	[
		'a mark typed twice',
		DOUBLED,
		[],
		[['B00006', 'mark missing: ב (letter 1) qamats vs qamats and qamats']],
	],
];

describe('buildHeadwordIssues: homograph numerals number a sequence', () => {
	for (const [name, entries, gaps, pointing] of SEQUENCE_CASES) {
		const { csv } = buildHeadwordIssues(entries, []);
		it(`${name}: X8 rows`, () => {
			expect(rowsOf(csv, 'X8').map(([rid]) => rid)).toEqual(gaps);
		});
		it(`${name}: X9 rows`, () => {
			const opening = new Map(pointing);
			const rows = rowsOf(csv, 'X9').map(([rid, note]) => [
				rid,
				note.slice(0, opening.get(rid)?.length ?? 0),
			]);
			expect(rows).toEqual(pointing);
		});
	}
});

// Ruling 10-06 implied I, amended by 10-13 correction policy: X10 still
// names the candidate, but an I is set only where Jastrow's text names
// it. `[case, entries, X8 rids, X10 rows as [rid, the candidate the note
// opens with]]`.
const CANDIDATE_CASES: Array<
	[string, Entry[], string[], Array<[string, string]>]
> = [
	[
		'an unnumbered form just before a II',
		AGMA,
		[],
		[['A00312', 'A00311 אַגְמָא']],
	],
	[
		'a II beside another II, an unnumbered form just before it',
		[...BEZA, withForms('B00438', ['בִּיזָּא'], ['בִּזָּא', 2])],
		[],
		[['B00438', 'B00437 בִּזָּא']],
	],
	[
		'a bare II, no unnumbered neighbour',
		[withForms('A00311', ['תבבת']), AGMA[1] as Entry],
		['A00312'],
		[],
	],
	[
		'an unnumbered form too far back',
		[withForms('A00300', ['אַגְמָא']), ...filler('A', 301, 10), AGMA[1] as Entry],
		['A00312'],
		[],
	],
	[
		'a numbered I between (A03215–A03218)',
		[
			withForms('A03215', ['אָרַע']),
			withForms('A03216', ['אֲרַע', 1]),
			withForms('A03217', ['אָרַע', 2]),
			withForms('A03218', ['אֲרַע', 2]),
		],
		['A03217'],
		[],
	],
	[
		'a line numbered on another form (M02161)',
		[
			withForms('M02161', ['מַעְצַרְתָּא'], ['מַעֲצַ׳', 1]),
			withForms('M02162', ['מַעְצַרְתָּא', 2]),
		],
		['M02162'],
		[],
	],
	[
		'a missing II is not an X10 candidate',
		[
			withForms('G00527', ['זְמַם', 1]),
			withForms('G00528', ['זְמַם']),
			withForms('G00529', ['זְמַם', 3]),
		],
		['G00527'],
		[],
	],
	[
		'an I already stored (one set by correction, 10-13)',
		[withForms('A00311', ['אַגְמָא', 1]), AGMA[1] as Entry],
		[],
		[],
	],
];

describe('buildHeadwordIssues: the X10 candidate', () => {
	for (const [name, entries, gaps, candidates] of CANDIDATE_CASES) {
		const { csv } = buildHeadwordIssues(entries, []);
		it(`${name}: X8 rows`, () => {
			expect(rowsOf(csv, 'X8').map(([rid]) => rid)).toEqual(gaps);
		});
		it(`${name}: X10 rows`, () => {
			const opening = new Map(candidates);
			const rows = rowsOf(csv, 'X10').map(([rid, note]) => [
				rid,
				note.slice(0, opening.get(rid)?.length ?? 0),
			]);
			expect(rows).toEqual(candidates);
		});
	}

	it('names the candidate and what proves an I (10-13)', () => {
		const [[, note] = ['', '']] = rowsOf(
			buildHeadwordIssues(AGMA, []).csv,
			'X10',
		);
		expect(note).toContain(
			"A00311 אַגְמָא is a bare first form before a II; an I is set only where Jastrow's text names `אַגְמָא I` (10-13)",
		);
		expect(note).not.toContain('implied');
	});

	it("names the candidate's own spelling, not the II's (C00619)", () => {
		// The I would sit on the candidate, so a cite proving it names the
		// candidate's form: C00619's alternate is pointed apart from the
		// II it stands before.
		const [[, note] = ['', '']] = rowsOf(
			buildHeadwordIssues(
				[
					withForms('C00619', ['גִּיבָּרָא'], ['גִּבּ׳']),
					withForms('C00620', ['גִּיבָּרָא'], ['גִּבָּ׳', 2]),
				],
				[],
			).csv,
			'X10',
		);
		expect(note).toContain("Jastrow's text names `גִּבּ׳ I`");
	});
});

describe('buildHeadwordIssues: X11 one-letter primary', () => {
	// The opening of a letter's section: the letter, its numeral value
	// and its prefix uses, each one consonant and all before the first
	// word (review ledger L39).
	const OPENING = [
		withForms('H00000', ['ח']),
		withForms('H00001', ['ח׳']),
		withForms('F00002', ['וְ'], ['וּ']),
		withForms('F00003', ['וַאֲדַר']),
	];
	const { csv: opening } = buildHeadwordIssues(OPENING, []);

	it("a letter's opening entries are not reported", () => {
		expect(rowsOf(opening, 'X11')).toEqual([]);
	});

	// The real entries: Sefaria split `חָרַת` and `תִּכְבּוֹסֶת` at a
	// vowel, as it split U00489's `שׁוּף` before #179 rejoined it.
	const { csv: split } = buildHeadwordIssues(
		[
			withForms('H00000', ['ח']),
			withForms('H01791', ['חָרַשׁ']),
			withForms('H01792', ['חָ'], ['רַ'], ['ת']),
			withForms('V00523', ['תִּכְבּוֹן']),
			withForms('V00524', ['תִּ'], ['כְבּוֹסֶת']),
			withForms('V00525', ['ת']),
		],
		[],
	);

	it('a one-consonant primary past the opening is reported once', () => {
		expect(rowsOf(split, 'X11')).toEqual([
			['H01792', 'the line reads חָ, רַ, ת'],
			['V00524', 'the line reads תִּ, כְבּוֹסֶת'],
			['V00525', 'the line reads ת'],
		]);
	});

	it('an abbreviation or a prefix past the opening is not X11', () => {
		const { csv } = buildHeadwordIssues(
			[
				withForms('S00000', ['ק']),
				withForms('S00010', ['קָבַל']),
				withForms('S00011', ['ק׳']),
				withForms('S00012', ['קָ־']),
			],
			[],
		);
		expect(rowsOf(csv, 'X11')).toEqual([]);
	});
});
