/**
 * The control under the review report's empty "Catalogued, not yet
 * detected" section: every registered detector still fires on the
 * committed truth tree.
 *
 * Registration alone is what takes a class off that list, so a
 * detector whose predicate quietly stops matching — a transform
 * reordered ahead of it, a tag renamed — would erase the class from
 * the report in BOTH directions at once: no rows under its kind, and
 * no catalogue line either, reading exactly as though it had been
 * resolved. Nothing else in the unit tier would notice.
 *
 * Floors, not counts: the committed tree is regenerated and an entry
 * moving in or out must not fail this. The exact figures of a run are
 * the header of `docs/reports/review-report.md`. It reads
 * `data/entries/` and never the source snapshot, so it belongs to the
 * unit tier (consolidation spec R9).
 */
import { expect, it } from 'bun:test';
import type { TruthEntry } from '../../../entry/types.ts';
import { loadTruthFiles } from '../../../entry/validate.ts';
import { DETECTED_CLASSES, detectClasses } from './classes.ts';

/** Well under each class's catalogued `corpusCount` (342, 89, 85, 33,
 * 23), and well over the handful a degraded predicate would leave. */
const FLOOR: ReadonlyMap<string, number> = new Map([
	['empty-stem-section', 300],
	['homograph-roman-stranded-in-definition', 15],
	['open-paren-in-rtl-span', 70],
	['stranded-open-bracket', 70],
	['superscript-subsection-contradicts-link-sub-section', 25],
]);

/** Written while the committed tree was the PRE-REWRITE shape; the
 * batched rewrite of 2026-09-22 ended that, so every committed entry
 * now carries `headwords` and is handed on whole. The detectors read
 * `headwords[]`, so an old `headword`/`altHeadwords` pair is folded
 * into it. Nothing else about the entry is touched. */
function asHeadwords(raw: unknown): TruthEntry {
	const entry = raw as TruthEntry & {
		altHeadwords?: TruthEntry['headwords'];
		headword?: TruthEntry['headwords'][number];
	};
	if (entry.headwords !== undefined || entry.headword === undefined) {
		return entry;
	}
	return {
		...entry,
		headwords: [entry.headword, ...(entry.altHeadwords ?? [])],
	};
}

it('every registered class detector still fires on the committed tree', async () => {
	const { files } = await loadTruthFiles();
	// A floor, not the count: fails if the glob silently stops matching.
	expect(files.length).toBeGreaterThan(32_000);
	const counts = new Map([...DETECTED_CLASSES].map((kind) => [kind, 0]));
	for (const file of files) {
		for (const row of detectClasses(asHeadwords(file.entry))) {
			counts.set(row.kind, (counts.get(row.kind) ?? 0) + 1);
		}
	}
	// One assertion over the whole map: a failure names every class that
	// fell through, not just the first.
	expect([...counts].filter(([kind, n]) => n < (FLOOR.get(kind) ?? 1))).toEqual(
		[],
	);
});

it('gives every registered class a floor, so none is checked at zero', () => {
	expect([...FLOOR.keys()].toSorted()).toEqual(
		[...DETECTED_CLASSES].toSorted(),
	);
});
