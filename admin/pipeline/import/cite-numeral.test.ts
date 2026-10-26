/** Gate 13, `citeNumeral`: a cite's homograph numeral against its
 * target's stored numerals, the `ch.` line of ruling 10-15, and the
 * allowlist. */
import { describe, expect, it } from 'bun:test';
import type { Entry } from '../../entry/types.ts';
import type { SourceEntry } from '../types.ts';
import { checkCiteNumerals, numeralsOf } from './cite-numeral.ts';
import {
	type CiteNumeralKept,
	parseCiteNumeralKept,
} from './cite-numeral-kept.ts';

/** A finished target: one form, an optional numeral, one gloss. */
function target(id: string, homograph: number | undefined, gloss = 'x'): Entry {
	return {
		headwords: [
			{ text: 'חוּל', ...(homograph === undefined ? {} : { homograph }) },
		],
		id,
		page: { column: 'a', number: 1 },
		schemaVersion: 2,
		sefariaHeadword: 'חוּל',
		senses: [{ gloss, units: [] }],
	} as Entry;
}

/** X00001 `חוּל I`, X00002 its `ch.` line, X00003 `חוּל II`. */
const TARGETS = [
	target('X00001', 1),
	target('X00002', undefined, ' ch. same'),
	target('X00003', 2),
];
const MAP = new Map([
	['חוּל I', 'X00001'],
	['חוּל', 'X00002'],
	['חוּל II', 'X00003'],
]);

/** An anchor as the source writes one. */
function a(href: string, text: string, dataRef = ''): string {
	return `<a class="refLink" href="/Jastrow,_${href}.1" data-ref="${dataRef}">${text}</a>`;
}

/** A citing entry whose one sense holds `html`. */
function citing(html: string): SourceEntry {
	return {
		content: { senses: [{ definition: html }] },
		headword: 'y',
		rid: 'Y00001',
	};
}

const KEPT: CiteNumeralKept = {
	cite: 'חוּל II',
	date: '2026-10-26',
	note: 'review checklist group 3',
	pending: true,
	reason: 'the family is to be read',
	ref: 'X00001',
	rid: 'Y00001',
	source: 'fixture',
};

// [what, html, kept, pass, total, checked, kept, pending]
type Case = readonly [
	string,
	string,
	CiteNumeralKept[],
	number,
	number,
	number,
	number,
	number,
];
const CASES: readonly Case[] = [
	['a numeral the target carries', a('חוּל I', 'חוּל I'), [], 1, 1, 1, 0, 0],
	[
		'a cite with no numeral is not checked',
		a('חוּל I', 'foreg.'),
		[],
		0,
		0,
		0,
		0,
		0,
	],
	['a numeral the target lacks', a('חוּל I', 'חוּל II'), [], 0, 1, 1, 0, 0],
	['print’s `)` inside the cite', a('חוּל I', 'חוּל II)'), [], 0, 1, 1, 0, 0],
	['the ch. line under the I (10-15)', a('חוּל', 'חוּל I'), [], 1, 1, 1, 0, 0],
	['a ch. line under another numeral', a('חוּל', 'חוּל II'), [], 0, 1, 1, 0, 0],
	[
		'a data-ref numeral the target lacks',
		a('חוּל I', 'foreg.', 'Jastrow, חוּל II 1'),
		[],
		0,
		1,
		1,
		0,
		0,
	],
	['an allowlisted mismatch', a('חוּל I', 'חוּל II'), [KEPT], 1, 1, 1, 1, 1],
	['a stale allowlist row', a('חוּל II', 'חוּל II'), [KEPT], 1, 2, 1, 0, 0],
];

describe('checkCiteNumerals (gate 13)', () => {
	it.each(CASES)(
		'%s',
		(...[, html, kept, pass, total, checked, keptN, pending]) => {
			const result = checkCiteNumerals([citing(html)], {
				headwordMap: MAP,
				kept,
				targets: TARGETS,
			});
			expect([result.tally.pass, result.tally.total]).toEqual([pass, total]);
			expect(result.counts).toEqual({ checked, kept: keptN, pending });
		},
	);

	it('names the cite, the numeral and what the target carries', () => {
		const { tally } = checkCiteNumerals([citing(a('חוּל I', 'חוּל II'))], {
			headwordMap: MAP,
			kept: [],
			targets: TARGETS,
		});
		expect(tally.failures).toEqual([
			'Y00001: cite "חוּל II" (data-ref "") names II; X00001 carries I',
		]);
	});
});

// [what, text, dataRef, numerals]
const NUMERALS: readonly (readonly [string, string, string, number[]])[] = [
	['text', 'חוּל II', '', [2]],
	['text with print’s paren', 'עָמַד II)', '', [2]],
	['data-ref with a sense number', 'foreg.', 'Jastrow, אוּלָם I 1', [1]],
	['both, once', 'חוּל I', 'Jastrow, חוּל I 1', [1]],
	['none', 'foreg.', 'Jastrow, אוּלָם 1', []],
	['a Latin word is no numeral', 'v. Kal', '', []],
];

describe('numeralsOf', () => {
	it.each(NUMERALS)('%s', (_what, text, dataRef, numerals) => {
		expect(numeralsOf({ dataRef, href: '', text })).toEqual(numerals);
	});
});

// [what, line, problem]
const ROWS: readonly (readonly [string, string, string])[] = [
	[
		'a pending row without a note',
		JSON.stringify({ ...KEPT, note: undefined }),
		'a pending row needs a note',
	],
	[
		'an unknown key',
		JSON.stringify({ ...KEPT, extra: 1 }),
		'extra is not a field',
	],
	[
		'pending false',
		JSON.stringify({ ...KEPT, pending: false }),
		'pending, when present, is true',
	],
	[
		'a missing reason',
		JSON.stringify({ ...KEPT, reason: '' }),
		'reason missing or empty',
	],
	['not JSON', '{', 'not JSON'],
];

describe('parseCiteNumeralKept', () => {
	it('reads a well-formed row', () => {
		expect(parseCiteNumeralKept(`${JSON.stringify(KEPT)}\n`)).toEqual([KEPT]);
	});

	it.each(ROWS)('refuses %s', (_what, line, problem) => {
		expect(() => parseCiteNumeralKept(line)).toThrow(problem);
	});
});
