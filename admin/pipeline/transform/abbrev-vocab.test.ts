import { describe, expect, it } from 'bun:test';
import { readSourceEntries } from '../body/source.ts';
import type { SourceEntry } from '../body/types.ts';
import { computeSnapshot, LOCK_PATH, parseLock } from '../patch/snapshot.ts';
import { ABBREVIATIONS, deriveAbbreviations, isLabel } from './abbrev-vocab.ts';

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
 * The re-derivation below measures the PINNED snapshot. When the
 * snapshot has moved, the frozen list describes a corpus that is no
 * longer on disk, so a mismatch would be a stale baseline rather than
 * a defect — `count.ts` takes the same position and skips instead of
 * reporting up to 80 false deltas. Re-baselining is deliberate: run
 * the derivation in `abbrev-vocab.ts`'s docstring and commit the new
 * list.
 */
const pinned = parseLock(await Bun.file(LOCK_PATH).text());
const onPinnedSnapshot = pinned.combined === (await computeSnapshot()).combined;

describe('abbreviation vocabulary', () => {
	it('every label the round-4 audit names is in the frozen set', () => {
		for (const label of AUDIT_LABELS) {
			expect({ isLabel: isLabel(label), label }).toEqual({
				isLabel: true,
				label,
			});
		}
	});

	it.skipIf(!onPinnedSnapshot)(
		're-derives from the pinned snapshot unchanged',
		async () => {
			const entries: SourceEntry[] = [];
			for await (const entry of readSourceEntries()) {
				entries.push(entry);
			}
			const derived = deriveAbbreviations(entries);
			// biome-ignore lint/suspicious/noConsole: the derived size on stdout is this test's evidence it measured the corpus rather than skipping
			console.log(
				`derived ${derived.size} abbreviations from ${entries.length} entries (frozen: ${ABBREVIATIONS.size})`,
			);
			expect(derived.size).toBe(ABBREVIATIONS.size);
			expect([...derived].sort()).toEqual([...ABBREVIATIONS].sort());
		},
	);

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
