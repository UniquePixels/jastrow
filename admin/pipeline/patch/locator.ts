/**
 * Whether a printed page shows a given entry: the one check the
 * Sefaria appendix's scan column (`report/sefaria-report.ts`,
 * `scanProblem`) and the import's `evidenceLocator` gate (ruling
 * `10-26 patch evidence`) both make, so it is written once here.
 * Evidence read off another page is not evidence for this entry.
 */

import { compareByCodeUnit } from '../../entry/compare-by-code-unit.ts';
import { loadPageIndex } from '../page-index.ts';

/** The page index, as a page check reads it: each rid's page and
 * column, and the page the next entry starts on (`lastPage`, the
 * furthest page this one can run to). */
interface PageLookup {
	entries: ReadonlyMap<
		string,
		{ column: string; lastPage: number; page: number }
	>;
}

/** The page lookup. An entry runs at most to the page the next rid
 * starts on. */
async function readPageLookup(): Promise<PageLookup> {
	const entries = new Map<
		string,
		{ column: string; lastPage: number; page: number }
	>();
	// Rid order is print order: an entry runs until the next rid starts.
	const inOrder = [...(await loadPageIndex())].sort(([a], [b]) =>
		compareByCodeUnit(a, b),
	);
	for (const [i, [rid, placement]] of inOrder.entries()) {
		const next = inOrder[i + 1]?.[1].number ?? placement.number;
		entries.set(rid, {
			column: placement.column,
			lastPage: Math.max(next, placement.number),
			page: placement.number,
		});
	}
	return { entries };
}

/** Why printed page `page` is not a page `rid` is on (its own page to
 * the page the next entry starts on), or `undefined` when it is. A rid
 * the page index does not place is outside by definition. */
function pageOutsideEntry(
	pages: PageLookup,
	rid: string,
	page: number,
): string | undefined {
	const entry = pages.entries.get(rid);
	if (entry !== undefined && page >= entry.page && page <= entry.lastPage) {
		return;
	}
	return `p. ${page} is not the entry's (p. ${entry?.page ?? '?'}–${entry?.lastPage ?? '?'})`;
}

export type { PageLookup };
export { pageOutsideEntry, readPageLookup };
