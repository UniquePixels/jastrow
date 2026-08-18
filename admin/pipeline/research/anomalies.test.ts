import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import {
	type AbbrevTable,
	buildAbbrevTable,
	editDistanceIsOne,
	entryAnomalyHints,
} from './anomalies.ts';
import { buildHeadwordIndex, type HeadwordIndex } from './headword-index.ts';

function entry(rid: string, definition: string, headword = 'ראש'): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword,
		rid,
	} as SourceEntry;
}

/** A table where `Ar.` dominates and `Rabb.` is a dominant sibling
 * of the rare `Rab.`. */
function calibratedTable(): AbbrevTable {
	return new Map([
		['Ar', { bare: 2, comma: 1, dotted: 200 }],
		['Rab', { bare: 0, comma: 0, dotted: 3 }],
		['Rabb', { bare: 0, comma: 0, dotted: 500 }],
		['in', { bare: 5000, comma: 40, dotted: 2 }],
	]);
}

describe('buildAbbrevTable', () => {
	it('counts dotted, comma, and bare forms across nested senses', () => {
		const e: SourceEntry = {
			content: {
				senses: [
					{
						definition: 'Ar. ed. once',
						senses: [{ definition: 'quot. in Ar, missing' }],
					},
				],
			},
			headword: 'x',
			rid: 'X00001',
		} as SourceEntry;
		const table = buildAbbrevTable([e]);
		expect(table.get('Ar')).toEqual({ bare: 0, comma: 1, dotted: 1 });
		expect(table.get('in')?.bare).toBe(1);
	});

	it('strips markup before tokenizing', () => {
		const table = buildAbbrevTable([entry('X00001', 'see <i>Ar.</i> note')]);
		expect(table.get('Ar')?.dotted).toBe(1);
	});
});

describe('entryAnomalyHints — abbreviation rules', () => {
	it('flags a comma where the dotted form dominates (A00470 shape)', () => {
		const hints = entryAnomalyHints(
			entry('A00470', 'Gen. R. s. 8 Ar, ed. more'),
			calibratedTable(),
		);
		expect(hints.some((h) => h.kind === 'comma-for-period')).toBe(true);
	});

	it('flags a bare abbreviation where the dotted form dominates', () => {
		const hints = entryAnomalyHints(
			entry('A00074', 'at the bottom Ar of the page'),
			calibratedTable(),
		);
		expect(hints.some((h) => h.kind === 'bare-abbrev')).toBe(true);
	});

	it('does not flag common bare words (ratio guard)', () => {
		const hints = entryAnomalyHints(
			entry('X00001', 'found in the text'),
			calibratedTable(),
		);
		expect(hints).toEqual([]);
	});

	it('flags a rare dotted variant beside a dominant sibling (Rab./Rabb.)', () => {
		const hints = entryAnomalyHints(
			entry('A00638', 'v. Rab. D. S.'),
			calibratedTable(),
		);
		const rare = hints.find((h) => h.kind === 'rare-dotted-variant');
		expect(rare?.detail).toContain("'Rabb.'");
	});

	it('dedupes repeated findings for the same token', () => {
		const hints = entryAnomalyHints(
			entry('X00001', 'Ar, once and Ar, twice'),
			calibratedTable(),
		);
		expect(hints.filter((h) => h.kind === 'comma-for-period')).toHaveLength(1);
	});

	it('ignores tokens absent from the table', () => {
		const hints = entryAnomalyHints(entry('X00001', 'Zzz, unknown'), new Map());
		expect(hints).toEqual([]);
	});
});

describe('entryAnomalyHints — formula and link rules', () => {
	it('flags the truncated D. S. a. formula (A00638 shape)', () => {
		const hints = entryAnomalyHints(
			entry('A00638', 'Shebu. 24ᵇ (v. Rab. D. S. a.).'),
			new Map(),
		);
		expect(hints.some((h) => h.kind === 'truncated-formula')).toBe(true);
	});

	it('does not flag the complete D. S. a. l. formula', () => {
		const hints = entryAnomalyHints(
			entry('X00001', 'v. Rabb. D. S. a. l. note 6'),
			new Map(),
		);
		expect(hints.some((h) => h.kind === 'truncated-formula')).toBe(false);
	});

	it('flags a v. cross-reference to the entry itself (A00571 shape)', () => {
		const def =
			', v. <a dir="rtl" class="refLink" href="/Jastrow,_אוּדְרָא.1" data-ref="Jastrow, אוּדְרָא 1">אוּדְרָא</a>.';
		const hints = entryAnomalyHints(entry('A00571', def, 'אוּדְרָא'), new Map());
		expect(hints.some((h) => h.kind === 'circular-v-ref')).toBe(true);
	});

	it('ignores plain self-links outside a v. context (linker convention)', () => {
		const def =
			'Freq. <a class="refLink" href="/Jastrow,_אַבָּא I.1" data-ref="Jastrow, אַבָּא I 1">אַבָּא</a> my father';
		const hints = entryAnomalyHints(entry('A00017', def, 'אַבָּא I'), new Map());
		expect(hints.some((h) => h.kind === 'circular-v-ref')).toBe(false);
	});

	it('ignores v. references to other headwords', () => {
		const def =
			', v. <a class="refLink" href="/Jastrow,_אֵדֶר I.1" data-ref="Jastrow, אֵדֶר I 1">אֵדֶר</a>.';
		const hints = entryAnomalyHints(entry('A00571', def, 'אוּדְרָא'), new Map());
		expect(hints.some((h) => h.kind === 'circular-v-ref')).toBe(false);
	});
});

describe('editDistanceIsOne', () => {
	it.each([
		['Rab', 'Rabb', true],
		['Ar', 'Ar', false],
		['Ar', 'Arr', true],
		['bot', 'both', true],
		['a', 'ab', true],
		['abc', 'abd', true],
		['abc', 'dbe', false],
		['ab', 'abcd', false],
	])('%s vs %s -> %p', (a, b, want) => {
		expect(editDistanceIsOne(a, b)).toBe(want);
	});
});

/** Anchor markup in the corpus's shape: `href` plus the `data-ref`
 * the link rules read. */
function anchor(target: string, display: string): string {
	return `<a class="refLink" href="/Jastrow,_${target}.1" data-ref="Jastrow, ${target}">${display}</a>`;
}

/** Index over the headwords each link-rule test needs. */
function headwordIndex(...headwords: string[]): HeadwordIndex {
	return buildHeadwordIndex(
		headwords.map((headword) => ({ headword }) as SourceEntry),
	);
}

describe('entryAnomalyHints — link-target rules (batch-02 remediation)', () => {
	it('flags a headword abbreviation linked elsewhere (A01486 shape)', () => {
		const def = `, v. ${anchor('אִיסְפַּרְגּוֹס', 'אִסְפַּ׳')}`;
		const hints = entryAnomalyHints(
			entry('A01486', def, 'אִיסְפַּקְלַרְיָא'),
			new Map(),
			headwordIndex('אִיסְפַּקְלַרְיָא', 'אִיסְפַּרְגּוֹס'),
		);
		expect(hints.some((h) => h.kind === 'abbrev-mislink')).toBe(true);
	});

	it('leaves a headword abbreviation linked to its own entry alone', () => {
		const def = `, v. ${anchor('אִיסְפַּקְלַרְיָא', 'אִסְפַּ׳')}`;
		const hints = entryAnomalyHints(
			entry('A01486', def, 'אִיסְפַּקְלַרְיָא'),
			new Map(),
			headwordIndex('אִיסְפַּקְלַרְיָא'),
		);
		expect(hints.some((h) => h.kind === 'abbrev-mislink')).toBe(false);
	});

	it('ignores generic one-letter abbreviations (ר׳ = Rabbi)', () => {
		const def = `${anchor('רַב', 'ר׳')} said`;
		const hints = entryAnomalyHints(
			entry('A00018', def, 'רָבָא'),
			new Map(),
			headwordIndex('רָבָא', 'רַב'),
		);
		expect(hints.some((h) => h.kind === 'abbrev-mislink')).toBe(false);
	});
});

describe('entryAnomalyHints — headword-identity link rules', () => {
	it('flags a display that is itself a headword linked elsewhere (A00988)', () => {
		const hints = entryAnomalyHints(
			{
				content: { senses: [{ definition: 'x' }] },
				headword: 'אָח I',
				language_reference: `cmp. ${anchor('אַבָּא I', 'אָב')}`,
				rid: 'A00988',
			} as SourceEntry,
			new Map(),
			headwordIndex('אָח I', 'אָב I', 'אַבָּא I'),
		);
		expect(hints.some((h) => h.kind === 'exact-headword-diverge')).toBe(true);
	});

	it('does not fire on plene/defective spelling of one word', () => {
		const def = `v. ${anchor('אִבּוּל', 'אִיבּוּל')}`;
		const hints = entryAnomalyHints(
			entry('A00068', def, 'אַבָּל'),
			new Map(),
			headwordIndex('אַבָּל', 'אִבּוּל', 'אִיבּוּל'),
		);
		expect(hints.some((h) => h.kind === 'exact-headword-diverge')).toBe(false);
	});

	it('flags niqqud twins that are both real headwords (A01201 shape)', () => {
		const def = `v. ${anchor('זָמַר I', 'זְמַר I')}`;
		const hints = entryAnomalyHints(
			entry('A01201', def, 'איזמר'),
			new Map(),
			headwordIndex('איזמר', 'זָמַר I', 'זְמַר I'),
		);
		expect(hints.some((h) => h.kind === 'niqqud-twin-target')).toBe(true);
	});

	it('ignores the editorial asterisk on a reconstructed target', () => {
		const def = `v. ${anchor('*אָכוּז', 'אָכוּז')}`;
		const hints = entryAnomalyHints(
			entry('B00293', def, 'בְּדַל'),
			new Map(),
			headwordIndex('בְּדַל', '*אָכוּז', 'אָכוּז'),
		);
		expect(hints.some((h) => h.kind === 'exact-headword-diverge')).toBe(false);
	});

	it('still flags a de-asterisked display linked elsewhere', () => {
		const def = `v. ${anchor('אַבָּא', 'אָכוּז')}`;
		const hints = entryAnomalyHints(
			entry('B00293', def, 'בְּדַל'),
			new Map(),
			headwordIndex('בְּדַל', '*אָכוּז', 'אַבָּא'),
		);
		expect(hints.some((h) => h.kind === 'exact-headword-diverge')).toBe(true);
	});

	it('treats a Roman homograph and a superscript as one headword', () => {
		const def = `v. ${anchor('אֵימוּרִים ²', 'אֵימוּרִים II')}`;
		const hints = entryAnomalyHints(
			entry('A01346', def, 'אִימְרָא'),
			new Map(),
			headwordIndex('אִימְרָא', 'אֵימוּרִים ²'),
		);
		expect(hints.some((h) => h.kind === 'exact-headword-diverge')).toBe(false);
	});
});

describe('entryAnomalyHints — anchor-shape link rules', () => {
	it('flags a bare Roman numeral display (A01133 shape)', () => {
		const def =
			'<a class="refLink" data-ref="Targum Jonathan on Genesis 1:27">I</a> ibid.';
		const hints = entryAnomalyHints(
			entry('A01133', def, 'אֵיבָרָא'),
			new Map(),
			headwordIndex('אֵיבָרָא'),
		);
		expect(hints.some((h) => h.kind === 'roman-numeral-display')).toBe(true);
	});

	it('skips gershayim displays, whose data-ref is truncated upstream', () => {
		const def = `v. <a class="refLink" data-ref="Jastrow, אל">אל"ף</a>`;
		const hints = entryAnomalyHints(
			entry('A00009', def, 'אָלֶף'),
			new Map(),
			headwordIndex('אָלֶף', 'אל"ף', 'אל'),
		);
		expect(hints.some((h) => h.kind === 'exact-headword-diverge')).toBe(false);
	});

	it('emits no link hints when no headword index is supplied', () => {
		const def = `, v. ${anchor('אִיסְפַּרְגּוֹס', 'אִסְפַּ׳')}`;
		const hints = entryAnomalyHints(
			entry('A01486', def, 'אִיסְפַּקְלַרְיָא'),
			new Map(),
		);
		expect(hints).toEqual([]);
	});
});

describe('entryAnomalyHints — Hebrew frequency rule (round-1 calibration)', () => {
	it('flags a Hebrew rare-confusable hint when a hebrewTable is supplied', () => {
		const hebrewTable = new Map([
			['שהוא', 400],
			['שחוא', 2],
		]);
		const hints = entryAnomalyHints(
			entry('H01109', 'בזמן שחוא חולץ מן הגל'),
			new Map(),
			undefined,
			hebrewTable,
		);
		expect(hints.some((h) => h.kind === 'hebrew-rare-confusable')).toBe(true);
	});

	it('emits no Hebrew hints when no hebrewTable is supplied', () => {
		const hints = entryAnomalyHints(
			entry('H01109', 'בזמן שחוא חולץ מן הגל'),
			new Map(),
		);
		expect(hints.some((h) => h.kind === 'hebrew-rare-confusable')).toBe(false);
	});
});

describe('entryAnomalyHints — citation comma rule (batch-02 remediation)', () => {
	it('flags a Roman numeral followed by a bare number (A01008 shape)', () => {
		const hints = entryAnomalyHints(
			entry('A01008', 'inheritance. Y. Kidd. I 60ᶜ top; a. e.'),
			new Map(),
		);
		expect(hints.some((h) => h.kind === 'truncated-formula')).toBe(true);
	});

	it('does not flag the comma-bearing corpus formula', () => {
		const hints = entryAnomalyHints(
			entry('X00001', 'Y. Ḥall. IV, 60ᵇ; Gen. XLI, 2'),
			new Map(),
		);
		expect(hints.some((h) => h.kind === 'truncated-formula')).toBe(false);
	});
});
