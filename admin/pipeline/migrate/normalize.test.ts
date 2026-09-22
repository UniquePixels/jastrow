import { describe, expect, it } from 'bun:test';
import { NormalizeError, normalizeForWrite } from './normalize.ts';

/**
 * Every fixture here is written as `\uXXXX` escapes ON PURPOSE. The
 * two Hebrew spellings differ only in the ORDER of two combining
 * marks, so as literal characters they are indistinguishable in a
 * diff, in a review and in this file — and an editor or formatter
 * that normalized the source would quietly turn the first test into
 * one that compares a string with itself.
 */

/** `בִּ` with the marks in the order the source sometimes carries
 * them: DAGESH (U+05BC, canonical combining class 21) before HIRIQ
 * (U+05B4, class 14). Canonical ordering sorts by class, so NFC swaps
 * them to HIRIQ then DAGESH — the reorder #110's 164 strings are. */
const MARKS_OUT_OF_ORDER = '\u05D1\u05BC\u05B4';
const MARKS_IN_NFC_ORDER = '\u05D1\u05B4\u05BC';

/** `Ḥ` written as H + COMBINING DOT BELOW. Unlike Hebrew, this one
 * COMPOSES, to U+1E24 — the case a code-point count would misread. */
const LATIN_DECOMPOSED = 'H\u0323';
const LATIN_COMPOSED = '\u1E24';

/** Runs `body` with `String.prototype.normalize` lying about NFC.
 *
 * The refusal branch cannot be reached through real text — NFC is
 * lossless on every string Unicode defines it for — so the only way
 * to prove the assertion fires is to break it deliberately. Without
 * this the branch would be code no test has ever run. */
function withBrokenNFC(body: () => void): void {
	const original = String.prototype.normalize;
	String.prototype.normalize = function (form?: string): string {
		return form === 'NFC' ? 'X' : (original.call(this, form) as string);
	};
	try {
		body();
	} finally {
		String.prototype.normalize = original;
	}
}

describe('normalizeForWrite', () => {
	it('has two fixtures that really differ', () => {
		// The control for every reorder assertion below: if these two
		// ever become the same string, those tests pass vacuously.
		expect(MARKS_OUT_OF_ORDER).not.toBe(MARKS_IN_NFC_ORDER);
		expect(LATIN_DECOMPOSED).not.toBe(LATIN_COMPOSED);
	});

	it('reorders Hebrew combining marks into NFC order', () => {
		const [value, changed] = normalizeForWrite({ text: MARKS_OUT_OF_ORDER });
		expect(value.text).toBe(MARKS_IN_NFC_ORDER);
		expect(changed).toBe(1);
	});

	it('conserves every code point when Hebrew reorders', () => {
		const [value] = normalizeForWrite({ text: MARKS_OUT_OF_ORDER });
		expect([...value.text].toSorted()).toEqual(
			[...MARKS_OUT_OF_ORDER].toSorted(),
		);
	});

	it('composes a Latin diacritic', () => {
		const [value, changed] = normalizeForWrite({ gloss: LATIN_DECOMPOSED });
		expect(value.gloss).toBe(LATIN_COMPOSED);
		expect(changed).toBe(1);
		// The composed form is ONE code point where the input was two:
		// this is why losslessness is asserted through NFD rather than
		// through a character count.
		expect([...value.gloss]).toHaveLength(1);
		expect(value.gloss.normalize('NFD')).toBe(LATIN_DECOMPOSED);
	});

	it('leaves a string already in NFC alone', () => {
		const [value, changed] = normalizeForWrite({ text: MARKS_IN_NFC_ORDER });
		expect(value.text).toBe(MARKS_IN_NFC_ORDER);
		expect(changed).toBe(0);
	});

	it('is idempotent: a second pass changes nothing', () => {
		const [once] = normalizeForWrite({ text: MARKS_OUT_OF_ORDER });
		const [twice, changed] = normalizeForWrite(once);
		expect(twice).toEqual(once);
		expect(changed).toBe(0);
	});

	it('reaches every string of a nested entry, and counts them', () => {
		const [value, changed] = normalizeForWrite({
			content: {
				senses: [
					{ definition: LATIN_DECOMPOSED },
					{ senses: [{ definition: MARKS_OUT_OF_ORDER }] },
				],
			},
			headwords: [
				{ text: MARKS_OUT_OF_ORDER },
				{ text: '\u05E9\u05DC\u05D5\u05DD' },
			],
			id: 'A00001',
		});
		expect(changed).toBe(3);
		expect(value.headwords[0]?.text).toBe(MARKS_IN_NFC_ORDER);
		expect(value.content.senses[0]?.definition).toBe(LATIN_COMPOSED);
		expect(value.content.senses[1]?.senses?.[0]?.definition).toBe(
			MARKS_IN_NFC_ORDER,
		);
	});

	it('never mutates its input', () => {
		const entry = { headwords: [{ text: MARKS_OUT_OF_ORDER }] };
		normalizeForWrite(entry);
		expect(entry.headwords[0]?.text).toBe(MARKS_OUT_OF_ORDER);
	});

	it('leaves non-string values as they are', () => {
		const [value, changed] = normalizeForWrite({
			display: undefined,
			homograph: 2,
			partial: true,
			refs: null,
		});
		expect(value).toEqual({
			display: undefined,
			homograph: 2,
			partial: true,
			refs: null,
		});
		expect(changed).toBe(0);
	});

	it('refuses the write when NFC would not be lossless', () => {
		withBrokenNFC(() => {
			expect(() => normalizeForWrite({ text: '\u05D0' }, 'A00001')).toThrow(
				NormalizeError,
			);
		});
	});

	it('names the offending field in the refusal', () => {
		withBrokenNFC(() => {
			expect(() => normalizeForWrite({ text: '\u05D0' }, 'A00001')).toThrow(
				'A00001.text',
			);
		});
	});
});
