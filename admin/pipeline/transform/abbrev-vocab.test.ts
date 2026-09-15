import { describe, expect, it } from 'bun:test';
import { isLabel } from './abbrev-vocab.ts';

/** The 20 labels `label-period-outside-italic`'s round-4 audit names —
 * 7 cross-letter-unanimous conventions plus the 13 it proved to be
 * processing-batch noise. All 20 take the period INSIDE by the house
 * style ruling of 2026-08-21. */
const AUDIT_LABELS = [
	'Hif',
	'Ithpa',
	'Ithpe',
	'Pl',
	'Pi',
	'Nif',
	'Part. pass',
	'Pa',
	'Af',
	'Fem',
	'pl',
	'Nithpa',
	'Pe',
	'Hithpa',
	'Du',
	'Part',
	'sing',
	'm',
	'ḳ',
	'Saf',
];

/**
 * The re-derivation against the pinned snapshot — measuring the corpus
 * afresh and requiring the frozen `ABBREVIATIONS` set unchanged — was
 * retired in consolidation step 5 and is listed in
 * `docs/v2/retired-corpus-checks.md`.
 */
describe('abbreviation vocabulary', () => {
	it('every label the round-4 audit names is in the frozen set', () => {
		for (const label of AUDIT_LABELS) {
			expect({ isLabel: isLabel(label), label }).toEqual({
				isLabel: true,
				label,
			});
		}
	});

	it('isLabel trims before looking up', () => {
		expect(isLabel(' Part. pass ')).toBe(true);
	});

	it('an ordinary gloss word is not a label', () => {
		expect(isLabel('destruction')).toBe(false);
		expect(isLabel('locusts')).toBe(false);
		expect(isLabel('to be crushed')).toBe(false);
	});

	/**
	 * The regression the widening exists to prevent, pinned as a test
	 * rather than as a paragraph. The audit's discriminator written
	 * literally — a token followed by `.` and any whitespace inside the
	 * run — also matches a RUN-FINAL period when the body carries a
	 * trailing space (`<i>stone. </i>`), which is not mid-run evidence
	 * at all. That reading admitted 14 ordinary gloss words. See
	 * `abbrev-vocab.ts` §Widening 1.
	 */
	it('the trailing-space reading of mid-run evidence stays excluded', () => {
		for (const gloss of ['stone', 'vessel', 'feeble', 'husks', 'chosen']) {
			expect({ gloss, isLabel: isLabel(gloss) }).toEqual({
				gloss,
				isLabel: false,
			});
		}
	});
});
