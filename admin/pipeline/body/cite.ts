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
 * An open tag's extent is found by `findTagEnd`, which reads quoted
 * attribute values the way a browser does: a `>` inside a `"…"` or `'…'`
 * value does not end the tag. The old `<a\b[^>]*class="refLink"[^>]*>`
 * used `[^>]*`, which stopped at the first `>` even inside a quote, so an
 * href carrying one truncated the tag and the anchor came back malformed
 * (or, with `class` after the `>`, not found at all). `findTagEnd` keeps
 * that legacy first-`>` reading only when a quoted value runs into a `<`
 * or off the end of the string before it closes — the shape of the
 * corpus's two damaged anchors (D00478, J00597), which both carry
 * `class="refLink"` ahead of the runaway attribute and so read
 * identically either way.
 *
 * Callers should still scan per-definition strings, not concatenated blobs
 * — that remains the intended usage — but this is no longer a correctness
 * requirement: one character walk per string is linear.
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

const ANCHOR_OPEN = /<a\b/gu;
const REF_LINK_CLASS = 'class="refLink"';
const ANCHOR_CLOSE = '</a>';
const HREF = /href="(?<slash>\/)?(?<target>[^"]+)"/u;
const HREF_LENIENT = /href="(?<slash>\/)?(?<target>[^"]*)/u;
const DATA_REF = /data-ref="(?<value>[^"]+)"/u;

/** The legacy quote-blind tag end: one past the first `>` at or after
 * `start`, or `null` when the string holds no `>` at all. This is what the
 * old `[^>]*` regex read, and it is what `findTagEnd` falls back to once a
 * quoted value proves damaged. */
function legacyTagEnd(text: string, start: number): number | null {
	const legacy = text.indexOf('>', start);
	return legacy === -1 ? null : legacy + 1;
}

/** One character read outside a quoted value: `'"'`/`"'"` opens a quoted
 * value, `'end'` closes the tag, `null` is an ordinary tag character. */
function unquotedStep(ch: string | undefined): '"' | "'" | 'end' | null {
	if (ch === '"' || ch === "'") {
		return ch;
	}
	return ch === '>' ? 'end' : null;
}

/** The end (exclusive — one past the closing `>`) of the tag that starts
 * at `start` (which must index a `<`). Reads quoted attribute values, so a
 * `>` inside a `"…"` or `'…'` value does not end the tag, but falls back
 * to the legacy first-`>` reading — ignoring quotes entirely — the moment
 * an open quote runs into a `<` or off the end of the string before it
 * closes: that shape means the value is already damaged, not a `>` this
 * scan should be protecting. Returns `null` when no `>` exists at all,
 * quote-aware or legacy. */
function findTagEnd(text: string, start: number): number | null {
	let quote: '"' | "'" | null = null;
	for (let i = start; i < text.length; i++) {
		const ch = text[i];
		if (quote !== null) {
			if (ch === quote) {
				quote = null;
			} else if (ch === '<') {
				return legacyTagEnd(text, start);
			}
			continue;
		}
		const step = unquotedStep(ch);
		if (step === 'end') {
			return i + 1;
		}
		quote = step;
	}
	return legacyTagEnd(text, start);
}

interface OpenTag {
	end: number;
	start: number;
	text: string;
}

/** The next refLink open tag at or after `from`: an `<a…>` whose
 * quote-aware extent (`findTagEnd`) contains `class="refLink"`. A plain
 * `<a>` (no refLink class, or one whose tag never closes at all) is
 * skipped rather than treated as a boundary — matching the old regex,
 * which likewise only counted a `<a…>` that matched through to a
 * `class="refLink"`. */
function nextOpenTag(text: string, from: number): OpenTag | null {
	ANCHOR_OPEN.lastIndex = from;
	let match = ANCHOR_OPEN.exec(text);
	while (match !== null) {
		const end = findTagEnd(text, match.index);
		if (end !== null) {
			const tagText = text.slice(match.index, end);
			if (tagText.includes(REF_LINK_CLASS)) {
				return { end, start: match.index, text: tagText };
			}
		}
		ANCHOR_OPEN.lastIndex = match.index + 2;
		match = ANCHOR_OPEN.exec(text);
	}
	return null;
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

interface Boundary {
	close: boolean;
	index: number;
	tag: OpenTag | null;
}

/** Locate the next `</a>` or nested/following refLink open tag after a
 * well-formed open tag, without letting the close-search cross into that
 * neighbor. A source anchor missing its `</a>` must not swallow a neighbor
 * just because some later malformed href happens to contain literal
 * "</a>" text. Returns `null` when nothing at all follows. */
function findNextBoundary(text: string, openEnd: number): Boundary | null {
	const closeIndex = text.indexOf(ANCHOR_CLOSE, openEnd);
	const tag = nextOpenTag(text, openEnd);
	if (tag === null) {
		return closeIndex === -1
			? null
			: { close: true, index: closeIndex, tag: null };
	}
	if (closeIndex !== -1 && closeIndex < tag.start) {
		return { close: true, index: closeIndex, tag: null };
	}
	return { close: false, index: tag.start, tag };
}

/** Find every citation anchor in a definition string, in document order.
 * Returns byte offsets (`start`/`end`) spanning the full `<a…>…</a>` tag,
 * so `text.slice(hit.start, hit.end)` reconstructs it exactly — except for
 * malformed hits, whose `end` is just past the damaged open tag (see
 * `malformed` below). */
function findCitations(text: string): CitationHit[] {
	const hits: CitationHit[] = [];
	let open = nextOpenTag(text, 0);
	while (open !== null) {
		const hit = buildHit(open.text, open.start, open.end);

		if (hit.malformed) {
			// The open tag itself never closed cleanly (its href quote ran
			// into markup). Flag it, but resume right past the damaged open
			// tag — not past whatever it swallowed — so a following valid
			// anchor is still reported as its own hit.
			hits.push(hit);
			open = nextOpenTag(text, open.end);
			continue;
		}

		const next = findNextBoundary(text, open.end);
		if (next === null) {
			// Nothing closes it and nothing follows. Still one hit per open
			// tag: report it as malformed (span = the open tag alone), the
			// same reading a missing close gets when a neighbor follows.
			hits.push({ ...hit, malformed: true });
			break;
		}
		if (next.close) {
			const closeEnd = next.index + ANCHOR_CLOSE.length;
			hits.push({ ...hit, end: closeEnd });
			open = nextOpenTag(text, closeEnd);
			continue;
		}
		// A nested open tag appeared before any close: this anchor's own
		// close is missing from the source. Its open tag still carries a
		// valid href/data-ref, so emit it rather than dropping it — flagged
		// malformed because the span covers only the open tag, not a full
		// `<a…>…</a>` — then resume scanning from the nested open tag so it
		// is picked up on its own terms next.
		hits.push({ ...hit, malformed: true });
		open = next.tag;
	}
	return hits;
}

export type { CitationHit };
export { findCitations };
