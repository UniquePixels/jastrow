/**
 * Monotonic alignment between the spine's text and the scans' OCR text.
 *
 * Both streams are the same book, so the mapping between them is monotonic.
 * Rather than trying to *recognise* each headword — which Tesseract does badly
 * on small pointed Hebrew — we anchor on n-grams of Latin words that occur
 * exactly once in each stream. Jastrow's glosses and citation strings
 * (`Y. Sabb. V, 7`, `Gen. R. s. 76`) make such n-grams plentiful.
 *
 * The anchors are then reduced to a longest strictly-increasing subsequence,
 * which discards the false pairs that hash collisions and repeated boilerplate
 * would otherwise contribute.
 */

/** An n-gram matched to exactly one position in each stream. */
interface Anchor {
	readonly ocrPos: number;
	readonly refPos: number;
}

/** Number of consecutive tokens forming an anchor key. */
const NGRAM = 4;

/** Anchors either side of a position are this many apart when measuring slope. */
const SLOPE_WINDOW = 30;

/** FNV-1a over a token. */
function hashToken(tok: string): number {
	let h = 2_166_136_261;
	for (let i = 0; i < tok.length; i++) {
		// biome-ignore lint/suspicious/noBitwiseOperators: FNV-1a mixing step.
		h ^= tok.charCodeAt(i);
		h = Math.imul(h, 16_777_619);
	}
	// biome-ignore lint/suspicious/noBitwiseOperators: coerce to unsigned 32-bit.
	return h >>> 0;
}

/** Rolling hashes of every {@link NGRAM}-length window of `tokens`. */
function ngramHashes(tokens: readonly string[]): Int32Array {
	const n = tokens.length - NGRAM + 1;
	if (n <= 0) {
		return new Int32Array(0);
	}
	const th = new Int32Array(tokens.length);
	for (let i = 0; i < tokens.length; i++) {
		th[i] = hashToken(tokens[i] as string);
	}
	const out = new Int32Array(n);
	for (let i = 0; i < n; i++) {
		let h = 0;
		for (let k = 0; k < NGRAM; k++) {
			// Int32Array assignment truncates to 32 bits, keeping the mix stable.
			h = Math.imul(h, 31) + (th[i + k] as number);
		}
		out[i] = h;
	}
	return out;
}

/**
 * Map each hash that occurs exactly once to its position.
 *
 * Hashes seen more than once are recorded as -1 and skipped: an n-gram that
 * repeats carries no positional information.
 */
function uniquePositions(hashes: Int32Array): Map<number, number> {
	const seen = new Map<number, number>();
	for (let i = 0; i < hashes.length; i++) {
		const h = hashes[i] as number;
		const prev = seen.get(h);
		if (prev === undefined) {
			seen.set(h, i);
		} else if (prev >= 0) {
			seen.set(h, -1);
		}
	}
	for (const [h, pos] of seen) {
		if (pos < 0) {
			seen.delete(h);
		}
	}
	return seen;
}

/**
 * Longest strictly-increasing subsequence of `ocrPos`, over anchors already
 * sorted by `refPos`. Returns the retained anchors in order.
 */
function longestIncreasing(anchors: readonly Anchor[]): Anchor[] {
	if (anchors.length === 0) {
		return [];
	}
	// tails[k] = index into anchors of the smallest ocrPos ending an
	// increasing run of length k+1.
	const tails: number[] = [];
	const prev = new Int32Array(anchors.length).fill(-1);
	for (let i = 0; i < anchors.length; i++) {
		const v = (anchors[i] as Anchor).ocrPos;
		let lo = 0;
		let hi = tails.length;
		while (lo < hi) {
			const mid = Math.floor((lo + hi) / 2);
			if ((anchors[tails[mid] as number] as Anchor).ocrPos < v) {
				lo = mid + 1;
			} else {
				hi = mid;
			}
		}
		if (lo > 0) {
			prev[i] = tails[lo - 1] as number;
		}
		tails[lo] = i;
	}
	const out: Anchor[] = [];
	let k = tails.at(-1) as number;
	while (k >= 0) {
		out.push(anchors[k] as Anchor);
		k = prev[k] as number;
	}
	return out.reverse();
}

/** Build the monotonic anchor chain between a reference and an OCR stream. */
function buildAnchors(
	refTokens: readonly string[],
	ocrTokens: readonly string[],
): Anchor[] {
	const refUniq = uniquePositions(ngramHashes(refTokens));
	const ocrUniq = uniquePositions(ngramHashes(ocrTokens));
	const pairs: Anchor[] = [];
	for (const [h, refPos] of refUniq) {
		const ocrPos = ocrUniq.get(h);
		if (ocrPos !== undefined) {
			pairs.push({ ocrPos, refPos });
		}
	}
	pairs.sort((a, b) => a.refPos - b.refPos);
	return longestIncreasing(pairs);
}

/** Index of the first anchor with `refPos` strictly greater than the argument. */
function upperBound(anchors: readonly Anchor[], refPos: number): number {
	let lo = 0;
	let hi = anchors.length;
	while (lo < hi) {
		const mid = Math.floor((lo + hi) / 2);
		if ((anchors[mid] as Anchor).refPos <= refPos) {
			lo = mid + 1;
		} else {
			hi = mid;
		}
	}
	return lo;
}

/**
 * For a reference position, the anchors that bracket it.
 *
 * `before` is the last anchor at or before `refPos`; `after` the first strictly
 * after it. Either may be null at the ends of the book.
 */
function bracket(
	anchors: readonly Anchor[],
	refPos: number,
): { after: Anchor | null; before: Anchor | null } {
	const lo = upperBound(anchors, refPos);
	return {
		after: lo < anchors.length ? (anchors[lo] as Anchor) : null,
		before: lo > 0 ? (anchors[lo - 1] as Anchor) : null,
	};
}

/**
 * Local ratio of OCR tokens to reference tokens around a position.
 *
 * This is not 1. Tesseract renders much of the Hebrew as Latin-looking
 * gibberish, which the tokeniser keeps, so the OCR stream runs about 1.5x the
 * length of the reference — and the ratio drifts with how much Hebrew a given
 * stretch of the dictionary carries. Extrapolating at slope 1 therefore pulls
 * column-initial entries back into the previous column: p.19's first headword
 * `אדריכולין` landed on p.18b, contradicting the printed guide word.
 */
function localSlope(anchors: readonly Anchor[], index: number): number {
	if (anchors.length < 2) {
		return 1;
	}
	const lo = Math.max(0, index - SLOPE_WINDOW);
	const hi = Math.min(anchors.length - 1, index + SLOPE_WINDOW);
	if (hi <= lo) {
		return 1;
	}
	const a = anchors[lo] as Anchor;
	const b = anchors[hi] as Anchor;
	const dRef = b.refPos - a.refPos;
	if (dRef <= 0) {
		return 1;
	}
	const slope = (b.ocrPos - a.ocrPos) / dRef;
	// Guard against a degenerate window; the true ratio stays near 1-2.
	return slope > 0.2 && slope < 5 ? slope : 1;
}

export type { Anchor };
export {
	bracket,
	buildAnchors,
	localSlope,
	longestIncreasing,
	NGRAM,
	ngramHashes,
	uniquePositions,
	upperBound,
};
