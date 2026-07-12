/**
 * Citation-anchor detection. Detection only — no rewriting here, so every
 * consumer stays positionally round-trip safe. Matches both href forms
 * ("/X" and the slash-less damage class, entry-body-model design §4).
 *
 * Callers must scan per-definition strings, not concatenated blobs: the
 * closing-tag search below is worst-case O(N) per open tag, so scanning a
 * blob of many definitions joined together is O(N²) on pathological
 * unclosed-anchor input (see D00478 / J00597).
 */
interface CitationHit {
	dataRef: string;
	end: number;
	hadLeadingSlash: boolean;
	href: string;
	kind: 'internal' | 'external';
	malformed: boolean;
	start: number;
}

const OPEN_TAG = /<a\b[^>]*class="refLink"[^>]*>/gu;
const CLOSE_OR_NEXT_OPEN = /<\/a>|<a\b[^>]*class="refLink"[^>]*>/gu;
const HREF = /href="(?<slash>\/)?(?<target>[^"]+)"/u;
const HREF_LENIENT = /href="(?<slash>\/)?(?<target>[^"]*)/u;
const DATA_REF = /data-ref="(?<value>[^"]+)"/u;

/** Best-effort href/slash extraction for a possibly-malformed open tag: try
 * the strict (properly quote-terminated) form first, and fall back to a
 * lenient scan (no terminating quote required) when the quote was never
 * closed. Malformed whenever the strict form fails, or its target still
 * contains markup that the regex ate. */
function extractHref(openTag: string): {
	hadLeadingSlash: boolean;
	href: string;
	malformed: boolean;
} {
	const strict = HREF.exec(openTag);
	if (strict && !strict.groups?.['target']?.includes('<')) {
		return {
			hadLeadingSlash: strict.groups?.['slash'] === '/',
			href: strict.groups?.['target'] ?? '',
			malformed: false,
		};
	}
	const lenient = HREF_LENIENT.exec(openTag);
	return {
		hadLeadingSlash: lenient?.groups?.['slash'] === '/',
		href: lenient?.groups?.['target'] ?? '',
		malformed: true,
	};
}

/** Build a hit from an open tag and the span it should report. */
function buildHit(openTag: string, start: number, end: number): CitationHit {
	const { hadLeadingSlash, href, malformed } = extractHref(openTag);
	const dataRef = DATA_REF.exec(openTag)?.groups?.['value'] ?? '';
	const kind = href.startsWith('Jastrow,') ? 'internal' : 'external';
	return { dataRef, end, hadLeadingSlash, href, kind, malformed, start };
}

/** Locate the next `</a>` or nested/following anchor open tag after a
 * well-formed open tag, without letting the close-search cross into that
 * neighbor. A source anchor missing its `</a>` must not swallow a neighbor
 * just because some later malformed href happens to contain literal
 * "</a>" text. Returns `null` when nothing at all follows. */
function findNextBoundary(
	text: string,
	openEnd: number,
): RegExpExecArray | null {
	CLOSE_OR_NEXT_OPEN.lastIndex = openEnd;
	return CLOSE_OR_NEXT_OPEN.exec(text);
}

/** Find every citation anchor in a definition string, in document order.
 * Returns byte offsets (`start`/`end`) spanning the full `<a…>…</a>` tag,
 * so `text.slice(hit.start, hit.end)` reconstructs it exactly — except for
 * malformed hits, whose `end` is just past the damaged open tag (see
 * `malformed` below). */
function findCitations(text: string): CitationHit[] {
	if (!text.includes('</a>')) {
		return [];
	}

	const hits: CitationHit[] = [];
	OPEN_TAG.lastIndex = 0;
	let openMatch = OPEN_TAG.exec(text);
	while (openMatch !== null) {
		const [openTag] = openMatch;
		const start = openMatch.index;
		const openEnd = start + openTag.length;
		const hit = buildHit(openTag, start, openEnd);

		if (hit.malformed) {
			// The open tag itself never closed cleanly (its href quote ran
			// into markup). Flag it, but resume right past the damaged open
			// tag — not past whatever it swallowed — so a following valid
			// anchor is still reported as its own hit.
			hits.push(hit);
			OPEN_TAG.lastIndex = openEnd;
			openMatch = OPEN_TAG.exec(text);
			continue;
		}

		const next = findNextBoundary(text, openEnd);
		if (next === null) {
			// Nothing closes it and nothing follows; nothing more to find.
			break;
		}
		if (next[0] === '</a>') {
			const closeEnd = next.index + next[0].length;
			hits.push({ ...hit, end: closeEnd });
			OPEN_TAG.lastIndex = closeEnd;
			openMatch = OPEN_TAG.exec(text);
			continue;
		}
		// A nested open tag appeared before any close: this anchor's own
		// close is missing from the source. Drop it silently rather than
		// swallowing into the neighbor, and let that neighbor be scanned on
		// its own terms next.
		OPEN_TAG.lastIndex = next.index;
		openMatch = OPEN_TAG.exec(text);
	}
	return hits;
}

export type { CitationHit };
export { findCitations };
