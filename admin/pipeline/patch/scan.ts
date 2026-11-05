/**
 * The evidence scan: the two Internet Archive items reviewed patches
 * cite (ruling `11-01 print images`), and where each volume's printed
 * pages fall on their leaves.
 *
 * Scan information lives here, beside the hOCR read from the same two
 * items, and nowhere in the page index (ruling `11-05 page index`): a
 * printed page number holds in every copy of the 1903 edition, while a
 * leaf belongs to one scan. A leaf converts to a page by one offset per
 * volume, checked on 2026-11-05 against every column the old page index
 * recorded (3,369 of 3,369).
 *
 * `firstPage`–`lastPage` is the dictionary's text in that volume. Vol. 1
 * ends on p. 683 (leaf 706; leaves 707–717 are blank, stamped or the
 * cover) and vol. 2 opens on p. 685 (leaf 8) and ends on p. 1705
 * (leaf 1028; the Addenda follow). A leaf outside that range is not a
 * dictionary page.
 */

interface Scan {
	/** The printed page's first text page in this volume. */
	firstPage: number;
	/** The Internet Archive identifier. */
	item: string;
	/** The printed page's last text page in this volume. */
	lastPage: number;
	/** Leaf minus printed page, the same on every text leaf. */
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

const VOLUMES = [1, 2] as const;

/** The printed volume a page is in, or `undefined` for a number that is
 * no dictionary page. */
function volumeOfPage(page: number): 1 | 2 | undefined {
	return VOLUMES.find(
		(volume) =>
			page >= SCANS[volume].firstPage && page <= SCANS[volume].lastPage,
	);
}

/** The printed page a leaf of `volume` shows, or `undefined` when the
 * leaf is not a dictionary page of that volume. */
function pageOfLeaf(volume: number, leaf: number): number | undefined {
	if (volume !== 1 && volume !== 2) {
		return undefined;
	}
	const page = leaf - SCANS[volume].leafOffset;
	return volumeOfPage(page) === volume ? page : undefined;
}

/** The volume and leaf a printed page is on, or `undefined` for a
 * number that is no dictionary page. */
function leafOfPage(page: number): { leaf: number; volume: 1 | 2 } | undefined {
	const volume = volumeOfPage(page);
	return volume === undefined
		? undefined
		: { leaf: page + SCANS[volume].leafOffset, volume };
}

export { leafOfPage, pageOfLeaf, SCANS, volumeOfPage };
