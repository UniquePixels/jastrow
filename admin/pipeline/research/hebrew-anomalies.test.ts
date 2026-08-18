/**
 * Round-1 detector calibration (2026-08-18). Cases mirror real corpus
 * shapes measured during full-corpus calibration (see the module
 * comment in hebrew-anomalies.ts for the precision figures).
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import {
	buildHebrewTable,
	type HebrewTable,
	hebrewHints,
} from './hebrew-anomalies.ts';

function entry(rid: string, definition: string, headword = 'ראש'): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword,
		rid,
	} as SourceEntry;
}

/** A table where `שהוא` dominates and a lone `שחוא` sits one ה/ח
 * substitution away — the H01109 shape. */
function calibratedTable(): HebrewTable {
	return new Map([
		['שהוא', 400],
		['שחוא', 2],
	]);
}

describe('buildHebrewTable', () => {
	it('counts Hebrew skeletons across nested senses, tags stripped', () => {
		const e: SourceEntry = {
			content: {
				senses: [
					{
						definition: 'see <i>שהוא</i> above',
						senses: [{ definition: 'cmp. שהוא too' }],
					},
				],
			},
			headword: 'x',
			rid: 'X00001',
		} as SourceEntry;
		const table = buildHebrewTable([e]);
		expect(table.get('שהוא')).toBe(2);
	});

	it('strips niqqud and cantillation before counting', () => {
		const table = buildHebrewTable([entry('X00001', 'שֶׁהוּא נִכְנָס')]);
		expect(table.get('שהוא')).toBe(1);
	});

	it('does not split a word on a Yiddish double-vav ligature', () => {
		// The H00115 shape: חװרבר must count as one token, not ח + רבר.
		const table = buildHebrewTable([entry('X00001', 'top חװרבר.')]);
		expect(table.get('חװרבר')).toBe(1);
		expect(table.has('רבר')).toBe(false);
	});

	it('excludes a token immediately followed by geresh or gershayim', () => {
		// The D00892 shape: אתד׳ is a Jastrow abbreviation, not a word.
		const table = buildHebrewTable([entry('X00001', 'read: אתד׳ , v. דמי')]);
		expect(table.has('אתד')).toBe(false);
		const gershayim = buildHebrewTable([entry('X00001', 'חקב"ה מתאוה')]);
		expect(gershayim.has('חקב')).toBe(false);
	});
});

describe('hebrewHints', () => {
	it('flags a rare token one ה/ח substitution from a dominant token (H01109 shape)', () => {
		const hints = hebrewHints('בזמן שחוא חולץ מן הגל', calibratedTable());
		expect(hints).toEqual([
			{
				detail:
					"Hebrew 'שחוא' occurs 2x corpus-wide beside 'שהוא' at 400x, one confusable-glyph substitution away",
				kind: 'hebrew-rare-confusable',
			},
		]);
	});

	it('flags the ד/ר pair (H01486 shape: רלא for דלא)', () => {
		const table = new Map([
			['דלא', 284],
			['רלא', 1],
		]);
		const hints = hebrewHints('מאנין רלא חסרין', table);
		expect(hints.some((h) => h.detail.includes("'רלא'"))).toBe(true);
	});

	it('flags the ו/ן pair (F00066 shape: שאיו for שאין, round-1’s worked example)', () => {
		const table = new Map([
			['שאין', 185],
			['שאיו', 1],
		]);
		const hints = hebrewHints('אשה שאיו לה וסת', table);
		expect(hints.some((h) => h.detail.includes("'שאיו'"))).toBe(true);
	});
});

describe('hebrewHints — thresholds and calibrated-out pairs', () => {
	it('does not flag a pair calibrated out at 0% (ה/ת: M00022 shape אחה for אחת)', () => {
		// אחה is a real, distinct word ("seam") in every corpus reading;
		// ה/ת measured a flat 0% true-positive rate and is not shipped.
		const table = new Map([
			['אחת', 270],
			['אחה', 2],
		]);
		const hints = hebrewHints('אחה לתפור יחד', table);
		expect(hints).toEqual([]);
	});

	it('does not flag a token below the minimum length', () => {
		const table = new Map([
			['הח', 1],
			['חח', 500],
		]);
		expect(hebrewHints('הח שם', table)).toEqual([]);
	});

	it('does not flag a token at or above the rare ceiling', () => {
		const table = new Map([
			['שחוא', 3],
			['שהוא', 400],
		]);
		expect(hebrewHints('שחוא כאן', table)).toEqual([]);
	});

	it('does not flag when the common neighbour falls short of the floor', () => {
		const table = new Map([
			['שחוא', 1],
			['שהוא', 99],
		]);
		expect(hebrewHints('שחוא כאן', table)).toEqual([]);
	});

	it('returns one hint per distinct token even if it recurs', () => {
		const hints = hebrewHints('שחוא ושוב שחוא', calibratedTable());
		expect(hints).toHaveLength(1);
	});
});
