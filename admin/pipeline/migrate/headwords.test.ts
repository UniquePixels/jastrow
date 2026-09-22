/**
 * The headword-line parser against the corpus shapes
 * `docs/v2/headword-design.md` settles: every worked example of the §2
 * table, and one case per row of the §4 decision table.
 *
 * The inputs are the real lines, copied from the snapshot (and from a
 * shipped patch's post-state where §4.1 repairs one), so a case that
 * passes here is a case the corpus run will meet.
 */
import { describe, expect, it } from 'bun:test';
import { parseHeadwordLine, renderDisplay } from './headwords.ts';

/** The three things a case asserts, in one shape: what print laid out,
 * what the forms mean, and what was flagged. */
function read(items: readonly string[]): {
	display: string | undefined;
	forms: unknown[];
	kinds: string[];
} {
	const parsed = parseHeadwordLine(items);
	return {
		display: parsed.display,
		forms: parsed.headwords,
		kinds: parsed.reviews.map((r) => r.kind),
	};
}

/** One line against all three at once. A helper rather than the same
 * `toEqual({ display, forms, kinds })` literal in twenty-odd cases:
 * the wrapper is identical every time and only the arguments ever
 * differ, which is what a reader — and Sonar's duplication gate —
 * should see. */
function expectLine(
	items: readonly string[],
	display: string | undefined,
	forms: unknown[],
	kinds: string[] = [],
): void {
	expect(read(items)).toEqual({ display, forms, kinds });
}

describe('§2 worked examples', () => {
	it('M02007 — comma, numeral after the parenthesis', () => {
		expectLine(['מְסַר', '(מָסַר) I'], '{0}, ({1}) I', [
			{ text: 'מְסַר' },
			{ homograph: 1, text: 'מָסַר' },
		]);
	});

	// §2's table gives this row as `({0}) {1} I` — print's OWN layout,
	// which §5 and §6 record as CONFIRMED AGAINST THE PRINT and
	// different from the source's: Sefaria put the group on the
	// alternate. §5 rules that until the ~580 parenthesis placements are
	// checked, "only what the source shows is recorded", so the parser
	// emits the source's placement rather than moving a delimiter it
	// cannot verify. The comma is the second half of the same story: the
	// upstream split dropped print's separators (§1), so no parser can
	// tell M02007's line (which has one) from this one (which does not).
	it('A02823 — the source puts the group on the alternate, and it stays there', () => {
		expectLine(['אַפְרִיקִי', '(אַפְרִיקָא) I'], '{0}, ({1}) I', [
			{ text: 'אַפְרִיקִי' },
			{ homograph: 1, text: 'אַפְרִיקָא' },
		]);
	});

	it('K01275 — numeral inside the parentheses', () => {
		expectLine(['כַּרְשִׁינָה I', '(כַּרְשִׁינָא  II)'], '{0} I, ({1} II)', [
			{ homograph: 1, text: 'כַּרְשִׁינָה' },
			{ homograph: 2, text: 'כַּרְשִׁינָא' },
		]);
	});

	it('A00888 — a 1-form group, then a 4-form group spanning four items', () => {
		const parsed = parseHeadwordLine([
			'אוֹרָיָיא',
			'(אוֹרַיְיתָא)',
			'(אוֹרָיָיתָא',
			'אוֹרְיָא',
			'אוֹרַיְתָא',
			'אוֹרְיָה)',
		]);
		expect(parsed.display).toBe('{0}, ({1}), ({2}, {3}, {4}, {5})');
		expect(parsed.headwords.map((f) => f.text)).toEqual([
			'אוֹרָיָיא',
			'אוֹרַיְיתָא',
			'אוֹרָיָיתָא',
			'אוֹרְיָא',
			'אוֹרַיְתָא',
			'אוֹרְיָה',
		]);
		expect(parsed.reviews).toEqual([]);
	});

	it('G00374 — a group that opens on the headword and never closes', () => {
		expectLine(
			['(זִימְרָא', 'זִימְרָה'],
			undefined,
			[{ text: 'זִימְרָא' }, { text: 'זִימְרָה' }],
			['paren-group-close-unknown'],
		);
	});

	it('A00610 — the star sits outside the parentheses', () => {
		expectLine(['*(אוזפיה)', 'אוֹזְפֵי'], '*({0}), {1}', [
			{ reconstructed: true, text: 'אוזפיה' },
			{ text: 'אוֹזְפֵי' },
		]);
	});

	it('B00825 — a (?) query mark, kept out of the text', () => {
		expectLine(['*(?)בַּלְוָוטִי'], '*(?){0}', [
			{ reconstructed: true, text: 'בַּלְוָוטִי' },
		]);
	});

	it('A00883 — a cross-reference naming two homographs takes no number', () => {
		expectLine(['אוּרְיָה  I, II'], '{0} I, II', [{ text: 'אוּרְיָה' }]);
	});

	it('O00394 — an ending after an ellipsis is partial', () => {
		expectLine(['סוֹפִיסְטָא', '… טָה', 'סוֹפִיסְטֵיס'], '{0}, … {1}, {2}', [
			{ text: 'סוֹפִיסְטָא' },
			{ partial: true, text: 'טָה' },
			{ text: 'סוֹפִיסְטֵיס' },
		]);
	});
});

describe('§4 decision table', () => {
	it('commas — the leaked comma is patched away and the numerals stay in display (A02356)', () => {
		expectLine(['אִסְטְוָוא I, II'], '{0} I, II', [{ text: 'אִסְטְוָוא' }]);
	});

	it('parentheses — a group is structure in display, never inside text (A00077)', () => {
		expectLine(['אֵבוּס', 'אֵיבוּס', '(?אִיבּוּס)'], '{0}, {1}, (?{2})', [
			{ text: 'אֵבוּס' },
			{ text: 'אֵיבוּס' },
			{ text: 'אִיבּוּס' },
		]);
	});

	it('Roman numerals — never moved, inside the parens or after them', () => {
		expect(parseHeadwordLine(['כַּרְשִׁינָה I', '(כַּרְשִׁינָא  II)']).display).toBe(
			'{0} I, ({1} II)',
		);
		expect(parseHeadwordLine(['מְסַר', '(מָסַר) I']).display).toBe('{0}, ({1}) I');
	});

	it('gender — a label beside a form lands on that form (the §2 headline)', () => {
		expectLine(['שִׁיף m.', 'שִׁיפָה f.'], '{0} m., {1} f.', [
			{ gender: 'm', text: 'שִׁיף' },
			{ gender: 'f', text: 'שִׁיפָה' },
		]);
	});

	it('A01480 — an optional ending attached with no space is partial', () => {
		expectLine(
			['אִיסְפְּלִידָא', 'איספליטון', 'אִיסְפְּלָנִית(א)', 'אִיסְפַּמְיָא'],
			'{0}, {1}, {2}({3}), {4}',
			[
				{ text: 'אִיסְפְּלִידָא' },
				{ text: 'איספליטון' },
				{ text: 'אִיסְפְּלָנִית' },
				{ partial: true, text: 'א' },
				{ text: 'אִיסְפַּמְיָא' },
			],
		);
	});

	it('H1 numeral lists on a cross-reference — display only, no homograph', () => {
		const parsed = parseHeadwordLine(['הָכֵין  I, II']);
		expect(parsed.display).toBe('{0} I, II');
		expect(parsed.headwords[0]?.homograph).toBeUndefined();
	});

	it('H2 an unclosed group — every one of the six leaves display unset', () => {
		for (const items of [
			['(זִימְרָא', 'זִימְרָה'],
			['(לִסְטֵם', 'לִסְטֵס'],
			['(עוּזְרָד', 'עוּזְרָר I'],
			['(עוּזְרָד ²', 'עוּזְרָר II'],
			['(פורסישמנג', 'פּוֹרְסִישְׁנָמַג'],
			['(קַלְקַנְתּוּם', 'קַלְקַנְתּוֹס', 'קַנְ׳'],
		]) {
			const parsed = parseHeadwordLine(items);
			expect(parsed.display).toBeUndefined();
			expect(parsed.reviews.map((r) => r.kind)).toContain(
				'paren-group-close-unknown',
			);
		}
	});

	it('A01394 — a stray close is flagged, not guessed', () => {
		const parsed = parseHeadwordLine([
			'אֱינָשׁ',
			'אֵינָשׁ) אִינְשָׁא',
			'(אֵינָשָׁא',
			'אִינִישׁ',
			'אֱנַשׁ',
		]);
		expect(parsed.display).toBeUndefined();
		expect(parsed.reviews.map((r) => r.kind)).toContain(
			'paren-group-close-unknown',
		);
		// The forms are clean and ARE written (§4): the tear splits the
		// item at its stray delimiter rather than keeping the pair as one
		// two-word lemma.
		expect(parsed.headwords.map((f) => f.text)).toEqual([
			'אֱינָשׁ',
			'אֵינָשׁ',
			'אִינְשָׁא',
			'אֵינָשָׁא',
			'אִינִישׁ',
			'אֱנַשׁ',
		]);
	});

	it('H4 `=` in a headword — a text defect, kept whole and flagged', () => {
		for (const line of ['אִידְרְעָא = אֶדְרְעָא', 'אִימְנוֹן = הִמְנוֹן']) {
			expectLine([line], undefined, [{ text: line }], ['headword-unparsed']);
		}
	});

	it('H5 ellipsis endings — partial, with the mark in display (K00798)', () => {
		expectLine(
			['כְּמֵיהוֹת', '… יהִים', '… יהִין'],
			'{0}, … {1}, … {2}',
			[
				{ text: 'כְּמֵיהוֹת' },
				{ partial: true, text: 'יהִים' },
				{ partial: true, text: 'יהִין' },
			],
			['headword-partial-only'],
		);
	});

	it('H5 an ellipsis inside one item makes every form it holds partial (S00469)', () => {
		const parsed = parseHeadwordLine(['קוּסְטַנְטִינָא', 'ק … טִינֵי']);
		expect(parsed.display).toBe('{0}, {1} … {2}');
		expect(parsed.headwords.map((f) => f.partial)).toEqual([
			undefined,
			true,
			true,
		]);
	});

	it('H6 two spellings in one item — the patch splits them (I00158)', () => {
		expectLine(['טְוִיָּיה', 'טְוִיָּה', 'טְוִויָּה'], '{0}, {1}, {2}', [
			{ text: 'טְוִיָּיה' },
			{ text: 'טְוִיָּה' },
			{ text: 'טְוִויָּה' },
		]);
	});

	it('H6 reduplication — one expression spoken twice is one form (D00004)', () => {
		expectLine(['דָּא II', 'דא דא'], '{0} II, {1}', [
			{ homograph: 2, text: 'דָּא' },
			{ text: 'דא דא' },
		]);
	});

	it('H6 abbreviated phrase alternates — partial, kept as printed (Q00053)', () => {
		expectLine(['פַּגֵּי', 'בֵּית פַּ׳', '(בֵּי)'], '{0}, {1}, ({2})', [
			{ text: 'פַּגֵּי' },
			{ partial: true, text: 'בֵּית פַּ׳' },
			{ text: 'בֵּי' },
		]);
	});

	it('H6 an abbreviation in a PRIMARY headword is partial (K00107)', () => {
		expectLine(['כִּדְ׳ כַּדְבוּבָא'], '{0}', [{ partial: true, text: 'כִּדְ׳ כַּדְבוּבָא' }]);
	});

	it('H6 spaced variants — the same word written as two words (Q00248)', () => {
		expectLine(['פּוּמְבְּדִיתָא', 'פּוּם בְּדִיתָא'], '{0}, {1}', [
			{ text: 'פּוּמְבְּדִיתָא' },
			{ text: 'פּוּם בְּדִיתָא' },
		]);
	});

	it('H6 a phrase headword is a legitimate lemma (A00436)', () => {
		expectLine(['אדני מריונים'], '{0}', [{ text: 'אדני מריונים' }]);
	});

	it('X1/X3 a torn headword, rejoined by its patch (U01000)', () => {
		expectLine(['שִׁיף', 'שִׁיפָה'], '{0}, {1}', [
			{ text: 'שִׁיף' },
			{ text: 'שִׁיפָה' },
		]);
	});

	it('X2 the OCR glyph patch leaves an ordinary form (F00009)', () => {
		expectLine(['וַארְדּוּנְיָא'], '{0}', [{ text: 'וַארְדּוּנְיָא' }]);
	});

	it('X5 a prefix keeps its maqaf and an ending its leading vowel', () => {
		expect(parseHeadwordLine(['אַב־']).headwords).toEqual([{ text: 'אַב־' }]);
		expect(parseHeadwordLine(['ַיְידָא']).headwords).toEqual([{ text: 'ַיְידָא' }]);
	});

	it('X6 an abbreviated alternate beside a full form is partial (K01196)', () => {
		expectLine(['*כַּרְכּוּז', 'עִיזָּא', 'כ׳', '(ד)'], '*{0}, {1}, {2}, ({3})', [
			{ reconstructed: true, text: 'כַּרְכּוּז' },
			{ text: 'עִיזָּא' },
			{ partial: true, text: 'כ׳' },
			{ text: 'ד' },
		]);
	});

	it('X7 an abbreviation that is the entry’s ONLY name stays a lookup key', () => {
		// The `abbrev-headword-stub` population: 28 of the 34 have no
		// other form at all, so `partial` would leave them unfindable.
		expectLine(['אנטג׳'], '{0}', [{ text: 'אנטג׳' }]);
	});

	it('X7 a numeral letter and a gershayim acronym are ordinary forms', () => {
		expect(parseHeadwordLine(['א׳']).headwords).toEqual([{ text: 'א׳' }]);
		expect(parseHeadwordLine(['א״ל']).headwords).toEqual([{ text: 'א״ל' }]);
	});

	it('H1 a separator defect, once its patch has run (B00098)', () => {
		expectLine(['בַּד V'], '{0} V', [{ homograph: 5, text: 'בַּד' }]);
	});
});

describe('flags and edges', () => {
	it('a superscript disambiguator is read off the form (J00288)', () => {
		const parsed = parseHeadwordLine(['יְחִידִי ²', '(… דַי)', 'יְחִידָאָה']);
		expect(parsed.display).toBe('{0} ², (… {1}), {2}');
		expect(parsed.headwords[0]).toEqual({ disambiguator: 2, text: 'יְחִידִי' });
		expect(parsed.headwords[1]?.partial).toBe(true);
	});

	it('headword-partial-only fires only when EVERY alternate is partial', () => {
		expect(parseHeadwordLine(['כְּמֵיהוֹת', '… יהִים']).reviews).toEqual([
			{
				kind: 'headword-partial-only',
				reason:
					'all 1 alternate(s) are partial; the entry has no alternate lookup key',
			},
		]);
		expect(parseHeadwordLine(['כְּמֵיהוֹת', '… יהִים', 'אָב']).reviews).toEqual([]);
	});

	it('an entry with no alternates never files headword-partial-only', () => {
		expect(parseHeadwordLine(['כִּדְ׳ כַּדְבוּבָא']).reviews).toEqual([]);
	});

	it('a Latin word that is no numeral is a text defect, and the line is kept whole', () => {
		expectLine(
			['אָב cf.', 'אַבָּא'],
			undefined,
			[{ text: 'אָב cf.' }, { text: 'אַבָּא' }],
			['headword-unparsed'],
		);
	});

	it('an item with no Hebrew at all is a text defect', () => {
		expect(parseHeadwordLine(['אָב', '()']).reviews.map((r) => r.kind)).toEqual([
			'headword-unparsed',
		]);
	});

	it('a Roman numeral that does not read is a text defect', () => {
		expect(parseHeadwordLine(['אָב IIII']).reviews).toEqual([]);
		expect(parseHeadwordLine(['אָב IC']).reviews.map((r) => r.kind)).toEqual([
			'headword-unparsed',
		]);
	});

	it('renderDisplay puts the forms back into the template', () => {
		const parsed = parseHeadwordLine(['מְסַר', '(מָסַר) I']);
		expect(renderDisplay(parsed.display ?? '', parsed.headwords)).toBe(
			'מְסַר, (מָסַר) I',
		);
	});
});

describe('duplicate forms', () => {
	it('reports a line that names one form twice', () => {
		expect(
			parseHeadwordLine(['אָב', 'אַבָּא', 'אָב']).reviews.map((r) => r.kind),
		).toEqual(['headword-duplicate-form']);
	});

	it('compares in NFC, so a differently ordered pair is one form', () => {
		// The shape a byte comparison misses: two canonically equal
		// spellings are two JS strings and one word (§3.1 rule 6).
		expect(
			parseHeadwordLine([
				'אָב'.normalize('NFC'),
				'אָב'.normalize('NFD'),
			]).reviews.map((r) => r.kind),
		).toEqual(['headword-duplicate-form']);
	});

	it('keeps two homographs of one spelling distinct', () => {
		expect(parseHeadwordLine(['אָב I', 'אָב II']).reviews).toEqual([]);
	});
});
