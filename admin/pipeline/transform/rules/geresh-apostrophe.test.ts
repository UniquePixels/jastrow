import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { checkNoNewText } from '../no-new-text.ts';
import { gereshApostropheGershayim, repairText } from './geresh-apostrophe.ts';
import { gershayimInBody } from './gershayim.ts';

/** A minimal entry carrying `definition` as its only interesting
 * field, so a test asserts on the repair and not on the field walk. */
function entryWith(definition: string): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword: 'אָב',
		rid: 'A00001',
	} as SourceEntry;
}

describe('repairText', () => {
	it('writes one gershayim where the two damaged codepoints stood', () => {
		expect(repairText(`הקב׳'ה`)).toBe('הקב״ה');
	});

	it('takes every occurrence in one field', () => {
		expect(repairText(`ד׳'א וד׳'א`)).toBe('ד״א וד״א');
	});

	it('returns the same reference when the run is absent', () => {
		const value = 'הקב״ה a plain string';
		expect(repairText(value)).toBe(value);
	});

	// The flanking clause. Both sides are required, and the corpus
	// measurement says neither currently separates anything — these
	// pin the SCOPE the module documents, so a re-fetch that lands the
	// run beside a Latin token cannot silently widen the rule.
	it('refuses a run with no Hebrew letter before it', () => {
		expect(repairText(`x׳'א`)).toBe(`x׳'א`);
	});

	it('refuses a run with no Hebrew letter after it', () => {
		expect(repairText(`א׳'x`)).toBe(`א׳'x`);
	});

	it('tolerates a combining mark between the letter and the geresh', () => {
		// `HEBREW_ATOM` on the left, exactly as `gershayim.ts` needs it.
		expect(repairText(`א̇׳'ב`)).toBe('א̇״ב');
	});

	it('admits a pointed letter before the mark', () => {
		// The points are class members of `HEBREW`, so the lookbehind
		// reaches them without a second clause.
		expect(repairText(`הַקָּב׳'ה`)).toBe('הַקָּב״ה');
	});

	// The tag mask. 0 of the corpus's 25 occurrences sit inside a tag,
	// so this is scope rather than a live filter — and it is the clause
	// that keeps the rule clear of `link-target.ts` entirely.
	it('leaves a run inside a tag interior alone', () => {
		const tagged = `<a data-ref="Jastrow, א׳'ב 1">א׳'ב</a>`;
		expect(repairText(tagged)).toBe(`<a data-ref="Jastrow, א׳'ב 1">א״ב</a>`);
	});

	it('cannot match across a tag boundary', () => {
		expect(repairText(`א׳<i>'ב</i>`)).toBe(`א׳<i>'ב</i>`);
	});

	it('leaves a plain geresh abbreviation untouched', () => {
		expect(repairText('וכ׳ גי׳')).toBe('וכ׳ גי׳');
	});

	it('leaves an ASCII quote to the gershayim pair', () => {
		expect(repairText('הקב"ה')).toBe('הקב"ה');
	});
});

describe('gereshApostropheGershayim', () => {
	it('hands back the caller’s own entry when nothing matches', () => {
		const entry = entryWith('nothing to do here');
		const result = gereshApostropheGershayim.apply(entry);
		expect(result.entry).toBe(entry);
		expect(result.records).toEqual([]);
	});

	it('records the repaired token, not the mark', () => {
		const result = gereshApostropheGershayim.apply(entryWith(`את הקב׳'ה וכ׳`));
		expect(result.records).toEqual([
			{
				detail: '1 restored: הקב״ה',
				rid: 'A00001',
				ruleId: 'geresh-apostrophe-as-gershayim',
			},
		]);
	});

	it('names each distinct token once but counts every occurrence', () => {
		const result = gereshApostropheGershayim.apply(entryWith(`ד׳'א ד׳'א ע׳'י`));
		expect(result.records[0]?.detail).toBe('3 restored: ד״א, ע״י');
	});

	it('declares one deletion per occurrence, as a multiset', () => {
		const result = gereshApostropheGershayim.apply(entryWith(`ד׳'א ע׳'י`));
		expect(result.removes).toEqual([`׳'`, `׳'`]);
	});

	it('declares the gershayim it writes and nothing else', () => {
		expect(gereshApostropheGershayim.allows).toEqual(['״']);
	});

	// The gate the allowance exists for. Without `allows` this repair is
	// a fabricated codepoint; with it, and only it, the diff clears.
	it('clears the no-new-text gate under its declaration', () => {
		const before = entryWith(`את הקב׳'ה`);
		const after = gereshApostropheGershayim.apply(before);
		expect(
			checkNoNewText(before, after.entry, gereshApostropheGershayim),
		).toEqual([]);
	});

	it('fails the no-new-text gate with the declaration withheld', () => {
		const before = entryWith(`את הקב׳'ה`);
		const after = gereshApostropheGershayim.apply(before);
		expect(
			checkNoNewText(before, after.entry, { allows: [] }).length,
		).toBeGreaterThan(0);
	});

	it('runs in the text-repairs phase', () => {
		expect(gereshApostropheGershayim.phase).toBe('text-repairs');
	});

	// CodeRabbit PR #71 comment 3951117393: `applyTransforms` feeds
	// each rule the previous rule's output, and `gershayimInBody` runs
	// earlier in the same `text-repairs` phase and can already have
	// written a `״` into this same entry. The old implementation
	// attributed a record's tokens by rescanning the healed field for
	// every `״`, so it credited this call with a mark it never wrote.
	// This reproduces the live composed order rather than running the
	// rule in isolation.
	it('does not credit an earlier rule’s gershayim to this one', () => {
		// `gershayimInBody` runs first and converts `ד"א`'s ASCII quote
		// to `ד״א`, doing real work before this rule ever sees the
		// entry — composing exactly as `run.ts` would.
		const composedInput = entryWith(`ד"א ד׳'א`);
		const afterGershayim = gershayimInBody.apply(composedInput).entry;
		// Sanity: the prior rule did write a second, unrelated gershayim
		// into this entry before ours ever runs.
		expect(
			(afterGershayim.content?.senses[0]?.definition?.match(/״/gu) ?? [])
				.length,
		).toBe(1);
		const result = gereshApostropheGershayim.apply(afterGershayim);
		expect(result.records).toEqual([
			{
				detail: '1 restored: ד״א',
				rid: 'A00001',
				ruleId: 'geresh-apostrophe-as-gershayim',
			},
		]);
		expect(result.removes).toEqual([`׳'`]);
	});
});
