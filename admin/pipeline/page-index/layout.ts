/**
 * Page-layout analysis for a scanned Jastrow leaf.
 *
 * Jastrow sets two columns under a header band carrying three items: a guide
 * word centred over the left column, the printed page number centred on the
 * page, and a second guide word centred over the right column. Verified
 * against the scans of pp. 226-227 and 776, the guide words follow the usual
 * dictionary convention:
 *
 *   left  = the first headword that *begins* on the page
 *   right = the last headword that begins on the page
 *
 * "Begins" is load-bearing. On p.227 the left column opens mid-entry, running
 * over from p.226, and the left guide word `גורדייתא` names the entry that
 * starts a third of the way down the column — not the text at the top of it.
 */

import {
	type BBox,
	centerX,
	type HocrLine,
	type HocrPage,
	lineText,
} from './hocr.ts';

type Column = 'a' | 'b';

interface PageLayout {
	/** Body lines assigned to the left (`a`) and right (`b`) columns. */
	readonly body: Readonly<Record<Column, readonly HocrLine[]>>;
	/** Y coordinate below which body text starts. */
	readonly bodyTop: number;
	/** Guide word centred over the left column, as OCR'd. Empty if unread. */
	readonly guideLeft: string;
	/** Guide word centred over the right column, as OCR'd. Empty if unread. */
	readonly guideRight: string;
	/** X coordinate of the gutter between the columns. */
	readonly gutter: number;
	/** Printed page number as OCR'd from the header, or null if unread. */
	readonly printedPage: number | null;
}

/** Fraction of page height within which a header band may be found. */
const HEADER_ZONE = 0.12;

/** A gap this many times the typical line pitch separates header from body. */
const GAP_FACTOR = 1.8;

/**
 * Most guide words are a single word; a few are a word plus a stray mark that
 * Tesseract split off. Beyond this the line is body text, not a running head.
 */
const MAX_GUIDE_WORDS = 3;

function medianPitch(lines: readonly HocrLine[]): number {
	const ys = lines.map((l) => l.bbox[1]).sort((a, b) => a - b);
	const gaps: number[] = [];
	for (let i = 1; i < ys.length; i++) {
		const g = (ys[i] as number) - (ys[i - 1] as number);
		if (g > 0) {
			gaps.push(g);
		}
	}
	if (gaps.length === 0) {
		return 0;
	}
	gaps.sort((a, b) => a - b);
	return gaps[Math.floor(gaps.length / 2)] as number;
}

/**
 * Find the y below which body text begins.
 *
 * Scans the top {@link HEADER_ZONE} of the page for the first vertical gap
 * wider than {@link GAP_FACTOR} times the page's typical line pitch. Returns 0
 * when there is no header band, so every line counts as body.
 */
function findBodyTop(page: HocrPage): number {
	const { bbox, lines } = page;
	const [, , , pageHeight] = bbox;
	const pitch = medianPitch(lines);
	if (pitch <= 0) {
		return 0;
	}
	const ys = [...new Set(lines.map((l) => l.bbox[1]))].sort((a, b) => a - b);
	const limit = pageHeight * HEADER_ZONE;
	for (let i = 1; i < ys.length; i++) {
		const prev = ys[i - 1] as number;
		const cur = ys[i] as number;
		if (prev > limit) {
			break;
		}
		if (cur - prev > pitch * GAP_FACTOR) {
			return cur;
		}
	}
	return 0;
}

/**
 * Locate the gutter between the two columns.
 *
 * The gutter lies between the *right edge* of the left column and the *left
 * edge* of the right column — about x1265 and x1366 on a 2774-wide scan. Both
 * edges are taken as medians over a provisional split at the page centre, so
 * the estimate survives skew, cropping, and the occasional line whose box
 * Tesseract runs across the gutter.
 */
function findGutter(page: HocrPage, bodyTop: number): number {
	const half = page.bbox[2] / 2;
	const body = page.lines.filter((l) => l.bbox[1] >= bodyTop);
	const med = (xs: number[]): number | null => {
		if (xs.length === 0) {
			return null;
		}
		xs.sort((a, b) => a - b);
		return xs[Math.floor(xs.length / 2)] as number;
	};
	// Right edge of lines that clearly belong to the left column, and left
	// edge of those that clearly belong to the right one.
	const leftEnds = med(
		body.filter((l) => centerX(l.bbox) < half).map((l) => l.bbox[2]),
	);
	const rightStarts = med(
		body.filter((l) => centerX(l.bbox) >= half).map((l) => l.bbox[0]),
	);
	if (leftEnds === null || rightStarts === null) {
		return half;
	}
	if (rightStarts <= leftEnds) {
		return half;
	}
	return (leftEnds + rightStarts) / 2;
}

const WHITESPACE_RE = /\s/u;
const NON_DIGIT_RE = /\D/gu;

function digitRatio(text: string): number {
	const chars = [...text].filter((c) => !WHITESPACE_RE.test(c));
	if (chars.length === 0) {
		return 0;
	}
	return chars.filter((c) => c >= '0' && c <= '9').length / chars.length;
}

/**
 * Assign a line to a column.
 *
 * Uses the line's centre rather than its left edge: Tesseract sometimes runs a
 * right-column line's box back across the gutter, but its centre stays firmly
 * on its own side.
 */
function columnOf(bbox: BBox, gutter: number): Column {
	return centerX(bbox) < gutter ? 'a' : 'b';
}

/** Median horizontal centre of a set of lines, or a fallback if empty. */
function columnCenter(lines: readonly HocrLine[], fallback: number): number {
	if (lines.length === 0) {
		return fallback;
	}
	const cs = lines.map((l) => centerX(l.bbox)).sort((a, b) => a - b);
	return cs[Math.floor(cs.length / 2)] as number;
}

interface HeaderRead {
	guideLeft: string;
	guideRight: string;
	printedPage: number | null;
}

/** Pick the page number out of the header band, leaving the guide words. */
function splitHeader(header: readonly HocrLine[]): {
	guides: HocrLine[];
	printedPage: number | null;
} {
	let numberLine: HocrLine | null = null;
	let bestDigits = 0.5;
	for (const line of header) {
		const r = digitRatio(lineText(line));
		if (r >= bestDigits) {
			bestDigits = r;
			numberLine = line;
		}
	}
	const guides: HocrLine[] = [];
	let printedPage: number | null = null;
	for (const line of header) {
		if (line === numberLine) {
			const n = Number.parseInt(lineText(line).replace(NON_DIGIT_RE, ''), 10);
			if (Number.isFinite(n)) {
				printedPage = n;
				continue;
			}
		}
		guides.push(line);
	}
	return { guides, printedPage };
}

/**
 * Read the header band into its three slots.
 *
 * Assigning each header line to the nearest of the three expected centres
 * beats splitting on the page centre: the guide words are centred on their
 * columns, so a long one can reach past the middle of the page and steal the
 * wrong slot.
 */
function readHeader(
	header: readonly HocrLine[],
	targets: { left: number; page: number; right: number },
): HeaderRead {
	const { guides, printedPage } = splitHeader(header);
	let guideLeft = '';
	let guideRight = '';
	let bestLeft = Number.POSITIVE_INFINITY;
	let bestRight = Number.POSITIVE_INFINITY;
	for (const line of guides) {
		// A guide word is one short, isolated word. Anything longer is a body
		// line that the header/body gap failed to separate, and letting it into
		// a guide slot would put noise where the check expects ground truth.
		if (line.words.length > MAX_GUIDE_WORDS) {
			continue;
		}
		const cx = centerX(line.bbox);
		const dLeft = Math.abs(cx - targets.left);
		const dRight = Math.abs(cx - targets.right);
		// A line closest to the page centre is an unread page number, not a
		// guide word; dropping it keeps it out of both slots.
		if (Math.abs(cx - targets.page) < Math.min(dLeft, dRight)) {
			continue;
		}
		if (dLeft <= dRight) {
			if (dLeft < bestLeft) {
				bestLeft = dLeft;
				guideLeft = lineText(line);
			}
		} else if (dRight < bestRight) {
			bestRight = dRight;
			guideRight = lineText(line);
		}
	}
	return { guideLeft, guideRight, printedPage };
}

/** Analyse one page's header band and column split. */
function analysePage(page: HocrPage): PageLayout {
	const bodyTop = findBodyTop(page);
	const gutter = findGutter(page, bodyTop);
	const pageCenter = page.bbox[2] / 2;

	const body = page.lines.filter((l) => l.bbox[1] >= bodyTop);
	const byY = (a: HocrLine, b: HocrLine): number => a.bbox[1] - b.bbox[1];
	const bodyA = body.filter((l) => columnOf(l.bbox, gutter) === 'a').sort(byY);
	const bodyB = body.filter((l) => columnOf(l.bbox, gutter) === 'b').sort(byY);

	const header = page.lines.filter((l) => l.bbox[1] < bodyTop);
	const read = readHeader(header, {
		left: columnCenter(bodyA, pageCenter / 2),
		page: pageCenter,
		right: columnCenter(bodyB, pageCenter * 1.5),
	});

	return {
		body: { a: bodyA, b: bodyB },
		bodyTop,
		guideLeft: read.guideLeft,
		guideRight: read.guideRight,
		gutter,
		printedPage: read.printedPage,
	};
}

export type { Column, PageLayout };
export { analysePage, columnOf, findBodyTop, findGutter };
