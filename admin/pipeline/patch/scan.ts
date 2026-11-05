/**
 * Links to the evidence scan: the two Internet Archive items reviewed
 * patches cite (ruling `11-01 print images`), addressed by printed
 * page.
 *
 * Evidence names a printed page, which every copy of the 1903 edition
 * shares; a link is how a reader reaches that page on one scan, and is
 * built here and nowhere else (ruling `11-05 page index`). The book
 * viewer opens an item at a printed page by its label,
 * `…/details/<item>/page/<page>`. Internet Archive labels every text
 * page of both items except eleven (`UNLABELLED`, read from each
 * item's `_page_numbers.json` on 2026-11-05, whose 1,723 labels all
 * agreed with the offsets below); those open by leaf index,
 * `…/page/n<leaf>`, which is the only use of `leafOffset`.
 *
 * `firstPage`–`lastPage` is the dictionary's text in each volume:
 * vol. 1 ends on p. 683 and vol. 2 opens on p. 685 and ends on
 * p. 1705, where the Addenda follow.
 */

interface Scan {
	/** The first printed text page in this volume. */
	firstPage: number;
	/** The Internet Archive identifier. */
	item: string;
	/** The last printed text page in this volume. */
	lastPage: number;
	/** Leaf index minus printed page, the same on every text leaf. */
	leafOffset: number;
}

const SCANS: Readonly<Record<1 | 2, Scan>> = {
	1: {
		firstPage: 1,
		item: 'dictionaryoftarg01jastuoft',
		lastPage: 683,
		leafOffset: 23,
	},
	2: {
		firstPage: 685,
		item: 'dictionaryoftarg02jastuoft',
		lastPage: 1705,
		leafOffset: -677,
	},
};

/** Text pages the viewer has no label for. */
const UNLABELLED: ReadonlySet<number> = new Set([
	1, 2, 3, 4, 5, 6, 7, 8, 9, 683, 685,
]);

const VOLUMES = [1, 2] as const;

/** A link to one page of the evidence scan, in either form. */
const PAGE_URL =
	/https:\/\/archive\.org\/details\/dictionaryoftarg0(?<volume>[12])jastuoft\/page\/(?<n>n?)(?<number>\d+)/u;
const PAGE_URL_ALL = new RegExp(PAGE_URL.source, 'gu');

/** The printed volume a page is in, or `undefined` for a number that is
 * no dictionary page. */
function volumeOfPage(page: number): 1 | 2 | undefined {
	return VOLUMES.find(
		(volume) =>
			page >= SCANS[volume].firstPage && page <= SCANS[volume].lastPage,
	);
}

/** The link that opens printed page `page` on the evidence scan, or
 * `undefined` for a number that is no dictionary page. */
function pageUrl(page: number): string | undefined {
	const volume = volumeOfPage(page);
	if (volume === undefined) {
		return undefined;
	}
	const { item, leafOffset } = SCANS[volume];
	const at = UNLABELLED.has(page) ? `n${page + leafOffset}` : String(page);
	return `https://archive.org/details/${item}/page/${at}`;
}

/** The printed page a link opens, or `undefined` when it is not a link
 * `pageUrl` would build: a page outside its volume, a label the viewer
 * lacks (p. 683 by label), or a leaf index for a labelled page. */
function pageOfUrl(url: string): number | undefined {
	const m = PAGE_URL.exec(url);
	if (m?.groups === undefined) {
		return undefined;
	}
	const volume = Number(m.groups['volume']) as 1 | 2;
	const number = Number(m.groups['number']);
	const page =
		m.groups['n'] === 'n' ? number - SCANS[volume].leafOffset : number;
	// Only a link the builder would make: the viewer opens an unlabelled
	// page by leaf index alone, and a labelled one by its label.
	return volumeOfPage(page) === volume && pageUrl(page) === m[0]
		? page
		: undefined;
}

/** Every evidence-scan link in `text`, in order. */
function pageUrls(text: string): string[] {
	return [...text.matchAll(PAGE_URL_ALL)].map((m) => m[0]);
}

export { pageOfUrl, pageUrl, pageUrls, SCANS, volumeOfPage };
