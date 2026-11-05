/**
 * Where a scan leaf sits in the print, and whether it shows a given
 * entry: the one check the Sefaria appendix's scan column
 * (`report/sefaria-report.ts`, `scanProblem`) and the import's
 * `evidenceLocator` gate (ruling `10-26 patch evidence`) both make, so
 * it is written once here. Evidence read off another leaf is not
 * evidence for this entry.
 */
import { loadPageIndex } from '../page-index.ts';
import { pageOfLeaf, volumeOfPage } from './scan.ts';

/** The page index, as a leaf check reads it: each rid's page, column
 * and volume, and the page the next entry starts on (`lastPage`, the
 * furthest page this one can run to). Which leaf shows which page is
 * the evidence scan's business (`scan.ts`), not the page index's. */
interface PageLookup {
	entries: ReadonlyMap<
		string,
		{ column: string; lastPage: number; page: number; volume: number }
	>;
}

/** The page lookup. An entry runs at most to the page the next rid
 * starts on; its volume is the printed volume its page is in. */
async function readPageLookup(): Promise<PageLookup> {
	const entries = new Map<
		string,
		{ column: string; lastPage: number; page: number; volume: number }
	>();
	// Rid order is print order: an entry runs until the next rid starts.
	const inOrder = [...(await loadPageIndex())].sort(([a], [b]) =>
		a.localeCompare(b),
	);
	for (const [i, [rid, placement]] of inOrder.entries()) {
		const volume = volumeOfPage(placement.number);
		const next = inOrder[i + 1]?.[1].number ?? placement.number;
		if (volume !== undefined) {
			entries.set(rid, {
				column: placement.column,
				lastPage: Math.max(next, placement.number),
				page: placement.number,
				volume,
			});
		}
	}
	return { entries };
}

/** Why leaf `leaf` of volume `volume` is not a page `rid` is on (its
 * own page to the page the next entry starts on), or `undefined` when
 * it is. A leaf that is no dictionary page, and a rid the page index
 * does not place, are outside by definition. */
function leafOutsideEntry(
	pages: PageLookup,
	rid: string,
	volume: number,
	leaf: number,
): string | undefined {
	const entry = pages.entries.get(rid);
	const page = pageOfLeaf(volume, leaf);
	if (
		entry !== undefined &&
		page !== undefined &&
		page >= entry.page &&
		page <= entry.lastPage
	) {
		return;
	}
	return `leaf ${leaf} is p. ${page ?? '?'}; the entry is on p. ${entry?.page ?? '?'}–${entry?.lastPage ?? '?'}`;
}

export type { PageLookup };
export { leafOutsideEntry, readPageLookup };
