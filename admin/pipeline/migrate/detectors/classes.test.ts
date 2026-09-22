import { describe, expect, it } from 'bun:test';
import { PUBLICATION } from '../publication.ts';
import { SCHEMA_VERSION, type TruthEntry, type TruthSense } from '../types.ts';
import { DETECTED_CLASSES, detectClasses } from './classes.ts';
import { detectEmptyStemSection } from './empty-stem-section.ts';
import { detectHomographRomanStranded } from './homograph-roman-stranded-in-definition.ts';
import { detectOpenParenInRtlSpan } from './open-paren-in-rtl-span.ts';
import { detectStrandedOpenBracket } from './stranded-open-bracket.ts';
import { detectSuperscriptSubsectionContradicts } from './superscript-subsection-contradicts-link-sub-section.ts';

/** One sense; `units` defaults to none so a fixture states only the
 * field its class turns on. */
function sense(over: Partial<TruthSense> = {}): TruthSense {
	return { gloss: '', units: [], ...over };
}

/** A minimal valid truth entry, overridden per fixture. */
function entry(over: Partial<TruthEntry> = {}): TruthEntry {
	return {
		headwords: [{ text: 'אבג' }],
		id: 'A00001',
		schemaVersion: SCHEMA_VERSION,
		sefariaHeadword: 'אבג',
		senses: [sense()],
		...over,
	};
}

/** The detail of the one row, or `undefined` when nothing matched —
 * so a test states both the count and what the row says. */
function only(rows: readonly { detail: string }[]): string | undefined {
	expect(rows.length).toBeLessThanOrEqual(1);
	return rows[0]?.detail;
}

describe('empty-stem-section', () => {
	it('names a stem block whose senses carry no text', () => {
		const rows = detectEmptyStemSection(
			entry({
				stems: [
					{
						forms: ['אוֹגַר'],
						senses: [sense({ gloss: 'to hire' })],
						stem: 'Af.',
					},
					{ forms: ['אִיתַּגַּר'], senses: [], stem: 'Ithpa.' },
				],
			}),
		);
		expect(only(rows)).toBe('stems[1] "Ithpa." carries no sense text');
	});
	it('is silent when every stem carries a gloss', () => {
		const rows = detectEmptyStemSection(
			entry({
				stems: [
					{ forms: [], senses: [sense({ gloss: 'to hire' })], stem: 'Af.' },
				],
			}),
		);
		expect(rows).toEqual([]);
	});
	it('sees a stem whose only sense is blank, not just an empty array', () => {
		const rows = detectEmptyStemSection(
			entry({ stems: [{ forms: [], senses: [sense()], stem: 'Ithpa.' }] }),
		);
		expect(only(rows)).toContain('stems[0]');
	});
});

describe('stranded-open-bracket', () => {
	it('names a sense whose text ends with a bare open bracket', () => {
		const rows = detectStrandedOpenBracket(
			entry({ senses: [sense({ gloss: 'to tie.—[', units: [] })] }),
		);
		expect(only(rows)).toBe('senses[0]: text ends with a bare "["');
	});
	it('reads the bracket through the markup, at the end of the last unit', () => {
		const rows = detectStrandedOpenBracket(
			entry({ senses: [sense({ gloss: 'x', units: ['y.—[<i></i>'] })] }),
		);
		expect(only(rows)).toBe('senses[0]: text ends with a bare "["');
	});
	it('is silent when the bracket is closed inside the same sense', () => {
		const rows = detectStrandedOpenBracket(
			entry({ senses: [sense({ gloss: 'to tie [read: tie].' })] }),
		);
		expect(rows).toEqual([]);
	});
});

describe('superscript-subsection-contradicts-link-sub-section', () => {
	it('names an anchor whose trailing superscript differs from the ref', () => {
		const rows = detectSuperscriptSubsectionContradicts(
			entry({
				senses: [
					sense({
						units: [
							'<cite ref="Bamidbar Rabbah 14:12">Num. R. s. 14<sup>7</sup></cite>.',
						],
					}),
				],
			}),
		);
		expect(only(rows)).toBe(
			'senses[0].units[0]: printed sup 7 against ref "Bamidbar Rabbah 14:12"',
		);
	});
	it('is silent when the superscript agrees with the ref', () => {
		const rows = detectSuperscriptSubsectionContradicts(
			entry({
				senses: [
					sense({
						units: [
							'<cite ref="Bamidbar Rabbah 14:7">Num. R. s. 14<sup>7</sup></cite>.',
						],
					}),
				],
			}),
		);
		expect(rows).toEqual([]);
	});
	it('is silent when the ref carries no sub-section at all', () => {
		const rows = detectSuperscriptSubsectionContradicts(
			entry({
				senses: [
					sense({
						units: ['<cite ref="Bamidbar Rabbah">R. s. 14<sup>7</sup></cite>.'],
					}),
				],
			}),
		);
		expect(rows).toEqual([]);
	});
});

describe('homograph-roman-stranded-in-definition', () => {
	it('names a lead gloss opening with a numeral the headword lacks', () => {
		const rows = detectHomographRomanStranded(
			entry({ senses: [sense({ gloss: ' I ch. (Hebraism) to forget. ' })] }),
		);
		expect(only(rows)).toBe(
			'senses[0].gloss opens "I"; headword carries no homograph',
		);
	});
	it('is silent when the headword already carries the homograph', () => {
		const rows = detectHomographRomanStranded(
			entry({
				headwords: [{ homograph: 2, text: 'אבג' }],
				senses: [sense({ gloss: ' II ch. to forget. ' })],
			}),
		);
		expect(rows).toEqual([]);
	});
	it('refuses a numeral that opens a word, not a homograph', () => {
		// The two false positives the catalogue names for itself: an
		// apostrophe ("V'elleh") and a letter ("Cæsarean") after the run.
		for (const gloss of ["V'elleh, v. אבג.", 'Cæsarean, v. קִיסְרִין.']) {
			expect(
				detectHomographRomanStranded(entry({ senses: [sense({ gloss })] })),
			).toEqual([]);
		}
	});
});

describe('open-paren-in-rtl-span', () => {
	it('names a Hebrew span that opens a paren it does not close', () => {
		const rows = detectOpenParenInRtlSpan(
			entry({ senses: [sense({ gloss: '<he>אבג (דהו</he> tail)' })] }),
		);
		expect(only(rows)).toBe('senses[0].gloss: <he> holds 1 "(" against 0 ")"');
	});
	it('is silent when the span balances its parens', () => {
		const rows = detectOpenParenInRtlSpan(
			entry({ senses: [sense({ gloss: '<he>אבג (דהו)</he> tail' })] }),
		);
		expect(rows).toEqual([]);
	});
	it('does not read a paren pair that never enters the span', () => {
		const rows = detectOpenParenInRtlSpan(
			entry({ senses: [sense({ gloss: '(v. <he>אבג</he>)' })] }),
		);
		expect(rows).toEqual([]);
	});
});

describe('detectClasses', () => {
	it('buckets every row as review and stamps the class id as the kind', () => {
		const rows = detectClasses(
			entry({
				senses: [sense({ gloss: ' I to tie.—[' })],
				stems: [{ forms: [], senses: [], stem: 'Ithpa.' }],
			}),
		);
		expect(rows.map((r) => r.kind).toSorted()).toEqual([
			'empty-stem-section',
			'homograph-roman-stranded-in-definition',
			'stranded-open-bracket',
		]);
		for (const row of rows) {
			expect(row.bucket).toBe('review');
			expect(row.severity).toBe('review');
			expect(row.rid).toBe('A00001');
		}
	});
	it('emits nothing for an entry no class matches', () => {
		expect(
			detectClasses(entry({ senses: [sense({ gloss: 'to tie.' })] })),
		).toEqual([]);
	});
	it('emits at most one row per entry per class', () => {
		// Two sites of the same class in one entry: the catalogue counts
		// entries, so both must land in a single row's detail.
		const rows = detectClasses(
			entry({
				stems: [
					{ forms: [], senses: [], stem: 'Ithpa.' },
					{ forms: [], senses: [], stem: 'Ithpe.' },
				],
			}),
		);
		expect(rows.length).toBe(1);
		expect(rows[0]?.detail).toBe(
			'stems[0] "Ithpa." carries no sense text; stems[1] "Ithpe." carries no sense text',
		);
	});
});

describe('DETECTED_CLASSES', () => {
	it('names these five catalogue ids, spelled out', () => {
		// Spelled out rather than derived from `CLASS_DETECTORS`: the set
		// IS `new Set(CLASS_DETECTORS.keys())`, so comparing the two
		// asserts nothing. These ids are what `patterns.jsonl` spells and
		// what the review report subtracts, so a typo in one must fail
		// here rather than silently leave a class on the catalogued list.
		expect([...DETECTED_CLASSES].toSorted()).toEqual([
			'empty-stem-section',
			'homograph-roman-stranded-in-definition',
			'open-paren-in-rtl-span',
			'stranded-open-bracket',
			'superscript-subsection-contradicts-link-sub-section',
		]);
	});
	it('gives every detected class a defer rule in the kind table', () => {
		// Without this, a detector could emit rows of a kind `ruleOf`
		// throws on — a red run rather than a triaged row.
		for (const id of DETECTED_CLASSES) {
			expect(PUBLICATION.get(id)?.publication).toBe('defer');
		}
	});
});
