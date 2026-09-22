/**
 * Controls for the §3.1 rules. `validate.test.ts` plants one defect
 * per rule through the whole tree check; these read the rules
 * directly, and cover the two things that check cannot see — rule 4,
 * which is armed and HELD, and the shapes rules 1–3 must ACCEPT.
 */
import { describe, expect, it } from 'bun:test';
import {
	headwordShapeProblems,
	textDefects,
	textDefectsHalt,
} from './headword-rules.ts';
import { parseHeadwordLine } from './headwords.ts';
import type { TruthEntry } from './types.ts';

/** An entry as the rules read it: the id, the forms and the template. */
function shaped(
	headwords: TruthEntry['headwords'],
	display?: string,
): Pick<TruthEntry, 'display' | 'headwords' | 'id'> {
	return {
		headwords,
		id: 'A00001',
		...(display === undefined ? {} : { display }),
	};
}

describe('rule 4 — armed and held', () => {
	it('is HELD: a text defect is reported, never an error', () => {
		// The switch's own control. When the maintainer flips it after
		// A01175 and A01345 are repaired, this case fails and says so.
		expect(textDefectsHalt()).toBe(false);
		expect(headwordShapeProblems(shaped([{ text: 'אִידְרְעָא = אֶדְרְעָא' }]))).toEqual(
			[],
		);
	});

	it('names every character §3.1 keeps out of a form text', () => {
		for (const text of ['א=ב', 'א(ב', 'א)ב', 'א?ב', 'א,ב', 'א…ב', 'אb']) {
			expect(textDefects({ headwords: [{ text }], id: 'A00001' })).toHaveLength(
				1,
			);
		}
	});

	it('passes the notation §4 rules part of the word', () => {
		// The geresh of an abbreviation, the gershayim of an acronym, the
		// maqaf of a prefix entry and the space of a phrase lemma are all
		// inside a form's text by ruling, not by accident.
		for (const text of ['אנטג׳', 'א״ל', 'אַב־', 'אדני מריונים']) {
			expect(textDefects({ headwords: [{ text }], id: 'A00001' })).toEqual([]);
		}
	});

	it('names the form by index, so a long line says which one', () => {
		expect(
			textDefects({
				headwords: [{ text: 'אב' }, { text: 'א=ב' }],
				id: 'A00001',
			})[0],
		).toContain('headwords[1].text');
	});
});

describe('rules 1–3 accept what the parser writes', () => {
	it.each([
		[['מְסַר', '(מָסַר) I']],
		[['כַּרְשִׁינָה I', '(כַּרְשִׁינָא  II)']],
		[['*(אוזפיה)', 'אוֹזְפֵי']],
		[['*(?)בַּלְוָוטִי']],
		[['אוּרְיָה  I, II']],
		[['שִׁיף m.', 'שִׁיפָה f.']],
		[['אוֹרָיָיא', '(אוֹרַיְיתָא)', '(אוֹרָיָיתָא', 'אוֹרְיָא', 'אוֹרְיָה)']],
		[['סוֹפִיסְטָא', '… טָה', 'סוֹפִיסְטֵיס']],
	])('%s', (items) => {
		const parsed = parseHeadwordLine(items);
		expect(
			headwordShapeProblems(shaped(parsed.headwords, parsed.display)),
		).toEqual([]);
	});

	it('accepts a line the source could not settle, with no display', () => {
		const parsed = parseHeadwordLine(['(זִימְרָא', 'זִימְרָה']);
		expect(parsed.display).toBeUndefined();
		expect(headwordShapeProblems(shaped(parsed.headwords))).toEqual([]);
	});
});

describe('rule 3 — the numeral clause', () => {
	it('accepts TWO numerals beside a form that carries none', () => {
		// §4's H1 row: a cross-reference naming two other entries. The
		// naive reading — "a numeral in the gap means a homograph" —
		// would reject all six.
		expect(
			headwordShapeProblems(shaped([{ text: 'אוּרְיָה' }], '{0} I, II')),
		).toEqual([]);
	});

	it('rejects a single numeral the form does not carry', () => {
		expect(
			headwordShapeProblems(shaped([{ text: 'אוּרְיָה' }], '{0} I')),
		).toHaveLength(1);
	});

	it('rejects a star the form does not carry, and the reverse', () => {
		expect(
			headwordShapeProblems(shaped([{ text: 'אב' }], '*{0}')),
		).toHaveLength(1);
		expect(
			headwordShapeProblems(
				shaped([{ reconstructed: true, text: 'אב' }], '{0}'),
			),
		).toHaveLength(1);
	});

	it('lets a star reach its form through the group it opens', () => {
		expect(
			headwordShapeProblems(
				shaped([{ reconstructed: true, text: 'אב' }], '*(?){0}'),
			),
		).toEqual([]);
	});
});

describe('rule 5 — a partial form is never the only key', () => {
	it('accepts a partial PRIMARY with no full sibling', () => {
		// §4's H6 row marks three primary headwords partial on purpose;
		// the slug still derives from them with the notation stripped.
		expect(
			headwordShapeProblems(
				shaped([{ partial: true, text: 'כִּדְ׳ כַּדְבוּבָא' }], '{0}'),
			),
		).toEqual([]);
	});

	it('accepts partial alternates beside a full primary', () => {
		expect(
			headwordShapeProblems(
				shaped(
					[{ text: 'כְּמֵיהוֹת' }, { partial: true, text: 'יהִים' }],
					'{0}, … {1}',
				),
			),
		).toEqual([]);
	});

	it('rejects an entry whose every form is partial once it has alternates', () => {
		expect(
			headwordShapeProblems(
				shaped(
					[
						{ partial: true, text: 'אב' },
						{ partial: true, text: 'אבא' },
					],
					'{0}, {1}',
				),
			),
		).toHaveLength(1);
	});
});
