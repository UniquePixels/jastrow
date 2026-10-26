/**
 * Where a scan leaf sits in the print, and whether it shows a given
 * entry: the one check the Sefaria appendix's scan column
 * (`report/sefaria-report.ts`, `scanProblem`) and the import's
 * `evidenceLocator` gate (ruling `10-26 patch evidence`) both make, so
 * it is written once here. Evidence read off another leaf is not
 * evidence for this entry.
 */
import { loadPageIndex } from '../../entry/page.ts';
import { PAGE_COLUMNS_PATH } from '../paths.ts';

/** The page index, as a leaf check reads it: each rid's page, column
 * and volume, the page the next entry starts on (`lastPage`, the
 * furthest page this one can run to), and each page's scan leaf
 * (`volume:page` → leaf). */
interface PageLookup {
	entries: ReadonlyMap<
		string,
		{ column: string; lastPage: number; page: number; volume: number }
	>;
	leaves: ReadonlyMap<string, number>;
}

/** Each page's scan leaf, from the column records. */
async function readLeaves(
	path: string = PAGE_COLUMNS_PATH,
): Promise<Map<string, number>> {
	const leaves = new Map<string, number>();
	for (const line of (await Bun.file(path).text()).split('\n')) {
		if (line.trim() !== '') {
			const row = JSON.parse(line) as {
				leaf: number;
				page: number;
				volume: number;
			};
			leaves.set(`${row.volume}:${row.page}`, row.leaf);
		}
	}
	return leaves;
}

/** The page lookup. Volume is not in the entry rows, so it comes from
 * the page's column record: page numbers run on across the two
 * volumes, so a page names one volume. An entry runs at most to the
 * page the next rid starts on. */
async function readPageLookup(): Promise<PageLookup> {
	const leaves = await readLeaves();
	const volumeOf = new Map(
		[...leaves.keys()].map((key) => {
			const [volume = '', page = ''] = key.split(':');
			return [Number(page), Number(volume)];
		}),
	);
	const entries = new Map<
		string,
		{ column: string; lastPage: number; page: number; volume: number }
	>();
	// Rid order is print order: an entry runs until the next rid starts.
	const inOrder = [...(await loadPageIndex())].sort(([a], [b]) =>
		a.localeCompare(b),
	);
	for (const [i, [rid, placement]] of inOrder.entries()) {
		const volume = volumeOf.get(placement.number);
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
	return { entries, leaves };
}

/** The page a scan leaf shows, from the page index's column records. */
function pageOfLeaf(
	pages: PageLookup,
	volume: number,
	leaf: number,
): number | undefined {
	const hit = [...pages.leaves].find(
		([key, l]) => l === leaf && key.startsWith(`${volume}:`),
	);
	return hit === undefined ? undefined : Number(hit[0].split(':')[1]);
}

/** Why leaf `leaf` of volume `volume` is not a page `rid` is on (its
 * own page to the page the next entry starts on), or `undefined` when
 * it is. A leaf the column records do not name, and a rid the page
 * index does not place, are outside by definition. */
function leafOutsideEntry(
	pages: PageLookup,
	rid: string,
	volume: number,
	leaf: number,
): string | undefined {
	const entry = pages.entries.get(rid);
	const page = pageOfLeaf(pages, volume, leaf);
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
export { leafOutsideEntry, pageOfLeaf, readPageLookup };
