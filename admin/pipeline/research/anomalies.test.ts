import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import {
	type AbbrevTable,
	buildAbbrevTable,
	editDistanceIsOne,
	entryAnomalyHints,
} from './anomalies.ts';

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
