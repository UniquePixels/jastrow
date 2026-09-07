/**
 * Citation-anchor detection. Detection only — no rewriting here, so every
 * consumer stays positionally round-trip safe. Matches both href forms
 * ("/X" and the slash-less damage class, entry-body-model design §4).
 *
 * Contract: every refLink open tag in the text yields exactly one hit.
 * `malformed: true` means the hit's span covers only the open tag (not a
 * full `<a…>…</a>`) — either because the open tag itself never closed its
 * href quote, or because no `</a>` was found before the next refLink open
 * tag started. Callers should treat malformed hits with care: two adjacent
 * hits with an identical href are almost always the benign nested-duplicate
 * anchor quirk Sefaria produces (outer wraps an inner anchor with the same
 * href/data-ref) rather than distinct citations.
 *
 * Where a tag begins and ends is read from `tagSpans` — the transform
 * tokenizer's ONE definition of a tag — not from a `<[^>]*>` of this
 * module's own. That copy closed an open tag at the first `>` even inside
 * a quoted attribute value, so a `>` in an href would have truncated the
 * tag and reported the anchor malformed (or, with `class` after the `>`,
 * not at all). `tagSpans` reads quotes as a browser does and keeps the
 * legacy first-`>` reading only for a value that never closes or holds a
 * `<` — the corpus's two damaged anchors (D00478, J00597), which both
 * carry `class="refLink"` before the runaway href and so read identically
 * either way.
 *
 * Callers should still scan per-definition strings, not concatenated blobs
 * — that remains the intended usage — but this is no longer a correctness
 * requirement: one span walk per string is linear.
 */
import { type TagSpan, tagSpans } from '../transform/html.ts';

interface CitationHit {
	dataRef: string;
	end: number;
	hadLeadingSlash: boolean;
	href: string;
	kind: 'internal' | 'external';
	malformed: boolean;
	start: number;
}

const ANCHOR_OPEN = /^<a\b/u;
const REF_LINK_CLASS = 'class="refLink"';
const ANCHOR_CLOSE = '</a>';
const HREF = /href="(?<slash>\/)?(?<target>[^"]+)"/u;
const HREF_LENIENT = /href="(?<slash>\/)?(?<target>[^"]*)/u;
const DATA_REF = /data-ref="(?<value>[^"]+)"/u;

/** Whether a tag's text is a refLink open tag. The legacy reading of a
 * damaged tag (first `>`) only counts when `class="refLink"` sits before
 * the damage, exactly as `<a\b[^>]*class="refLink"[^>]*>` counted it. */
function isRefLinkOpen(tag: string): boolean {
	return ANCHOR_OPEN.test(tag) && tag.includes(REF_LINK_CLASS);
}

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

/** The tag a span covers. */
function tagText(text: string, span: TagSpan): string {
	return text.slice(span.start, span.end);
}

/** Whether a span is exactly `</a>`. No slice: most spans between an
 * anchor and its close are `<span dir="rtl">`, `</span>` or `<i>`. */
function isAnchorClose(text: string, span: TagSpan): boolean {
	return (
		span.end - span.start === ANCHOR_CLOSE.length &&
		text.startsWith(ANCHOR_CLOSE, span.start)
	);
}

/** Whether a span is a refLink open tag; slices only once `<a` has
 * been seen at its start. */
function isRefLinkOpenAt(text: string, span: TagSpan): boolean {
	return (
		text.startsWith('<a', span.start) && isRefLinkOpen(tagText(text, span))
	);
}

/** The boundary of the anchor opened just before span `from`: the
 * first later span that is a `</a>` (`close: true`) or a refLink open
 * tag (`close: false`), or `null` when nothing at all follows. Walking
 * spans rather than the raw text means a literal `</a>` swallowed
 * inside a damaged neighbor's href is that neighbor's own tag body,
 * never this anchor's close. */
function findNextBoundary(
	text: string,
	spans: readonly TagSpan[],
	from: number,
): { close: boolean; index: number; span: TagSpan } | null {
	for (let at = from; at < spans.length; at++) {
		const span = spans[at];
		if (span === undefined) {
			break;
		}
		if (isAnchorClose(text, span)) {
			return { close: true, index: at, span };
		}
		if (isRefLinkOpenAt(text, span)) {
			return { close: false, index: at, span };
		}
	}
	return null;
}

/** Find every citation anchor in a definition string, in document order.
 * Returns byte offsets (`start`/`end`) spanning the full `<a…>…</a>` tag,
 * so `text.slice(hit.start, hit.end)` reconstructs it exactly — except for
 * malformed hits, whose `end` is just past the damaged open tag (see
 * `malformed` below). */
function findCitations(text: string): CitationHit[] {
	if (!text.includes(ANCHOR_CLOSE)) {
		return [];
	}

	const hits: CitationHit[] = [];
	const spans = tagSpans(text);
	let at = 0;
	while (at < spans.length) {
		const span = spans[at];
		if (span === undefined || !isRefLinkOpenAt(text, span)) {
			at++;
			continue;
		}
		const hit = buildHit(tagText(text, span), span.start, span.end);

		if (hit.malformed) {
			// The open tag itself never closed cleanly (its href quote ran
			// into markup). Flag it, but resume right past the damaged open
			// tag — not past whatever it swallowed — so a following valid
			// anchor is still reported as its own hit.
			hits.push(hit);
			at++;
			continue;
		}

		const next = findNextBoundary(text, spans, at + 1);
		if (next === null) {
			// Nothing closes it and nothing follows. Still one hit per open
			// tag: report it as malformed (span = the open tag alone), the
			// same reading a missing close gets when a neighbor follows.
			hits.push({ ...hit, malformed: true });
			break;
		}
		if (next.close) {
			hits.push({ ...hit, end: next.span.end });
			at = next.index + 1;
			continue;
		}
		// A nested open tag appeared before any close: this anchor's own
		// close is missing from the source. Its open tag still carries a
		// valid href/data-ref, so emit it rather than dropping it — flagged
		// malformed because the span covers only the open tag, not a full
		// `<a…>…</a>` — then resume scanning from the nested open tag so it
		// is picked up on its own terms next.
		hits.push({ ...hit, malformed: true });
		at = next.index;
	}
	return hits;
}

export type { CitationHit };
export { findCitations };
