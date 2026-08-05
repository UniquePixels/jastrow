/**
 * Lettered-item splitter (design doc §3, entry-body-model plan Task 8).
 * Splits ONLY complete ascending a)…b)…c)… runs whose markers sit
 * outside parens/anchors; everything else returns null and the text
 * stays whole — the deliberate under-split failure mode (decision
 * B5/B9): an unsplit block is still readable, a wrongly split one is
 * not. Runs before unit segmentation in the dry-run composition
 * (design §3). `census.ts` carries a separate boolean detector for
 * corpus-wide sizing (`letteredRun`) — this module is the
 * authoritative structural rule and may disagree with it on edge
 * cases.
 */

interface LetteredItem {
	letter: string;
	/** The raw marker text as matched — `a)`, `<i>a</i>)`, `a</i>)`, or
	 * `<i>a)` — so `joinLettered` can invert the lazy-span normalization
	 * (see `splitLettered`) and reproduce the source byte-for-byte. */
	marker: string;
	text: string;
}

interface LetteredParts {
	head: string;
	items: LetteredItem[];
}

// Shares census.ts's LETTERED caveat: the lookbehind excludes a
// preceding '(' or letter but not a digit, so a folio-style "39a)"
// could in principle be read as marker "a)". Four marker shapes, tried
// in this order at each position (Task 15, §6.0 review decision 07):
//   <i>a</i>)  — the whole italic pair is the marker (75-entry class);
//   <i>a)      — span-start laziness: the source opened one italic span
//                across marker AND item text (Q01198's `<i>a) for
//                appearance sake…`) instead of two; the marker claims
//                `<i>a)` and the split re-opens `<i>` on the item text;
//   a</i>)     — span-end laziness, the mirror image: the source merged
//                the preceding italic gloss and the marker into one
//                span (Q01353's `<i>section, a</i>)` for `<i>section,
//                </i><i>a</i>)`); the marker claims `a</i>)` and the
//                split closes the preceding segment with `</i>`.
//                Corpus-measured (2026-08-05): requiring `.`/`,`/`;` +
//                space before the letter keeps all 6 genuine markers of
//                this shape and excludes all 15 possessive/
//                parenthetical false positives (`(<i>camel’s</i>)`,
//                `(<i>in a</i>)`, `(<i>half a</i>)` — a `)` closing a
//                parenthetical, not a marker);
//   a)         — the original plain shape.
// The full-italic alternative sits first so the scan consumes it at the
// `<` and neither partial-span alternative can shave it down.
const MARKER =
	/(?:(?<![(\p{L}])<i>(?<full>[a-z])<\/i>\)|(?<![(\p{L}])<i>(?<open>[a-z])\)|(?<=[.,;] )(?<close>[a-z])<\/i>\)|(?<![(\p{L}])(?<plain>[a-z])\))/gu;

/** Span-end laziness: the marker letter closed a longer italic span. */
function isCloseMarker(marker: string): boolean {
	return marker.endsWith('</i>)') && !marker.startsWith('<i>');
}

/** Span-start laziness: the marker letter opened an italic span that
 * runs on into the item text. */
function isOpenMarker(marker: string): boolean {
	return marker.startsWith('<i>') && !marker.endsWith('</i>)');
}

/** A marker sitting inside an unclosed `<a>…</a>` anchor doesn't count
 * — anchor visible text ("next w.") can itself contain a bare letter
 * immediately before ")" by coincidence, and that isn't a structural
 * marker. */
function insideAnchor(text: string, index: number): boolean {
	return text.lastIndexOf('<a ', index) > text.lastIndexOf('</a>', index);
}

interface Mark {
	index: number;
	letter: string;
	marker: string;
}

/** Every candidate marker in document order, minus anchor-interior
 * hits. Does not yet enforce ascending order — that's the caller's
 * job, since a single stray marker breaking the run should stop the
 * sequence there rather than reject the whole text. */
function findMarks(text: string): Mark[] {
	const marks: Mark[] = [];
	for (const m of text.matchAll(MARKER)) {
		const letter =
			m.groups?.['full'] ??
			m.groups?.['open'] ??
			m.groups?.['close'] ??
			m.groups?.['plain'];
		if (letter !== undefined && !insideAnchor(text, m.index)) {
			marks.push({ index: m.index, letter, marker: m[0] });
		}
	}
	return marks;
}

/** The subsequence of `marks` that forms a clean a), b), c)… sequence
 * starting at 'a'. A marker that doesn't match the next expected
 * letter is skipped rather than ending the scan, so noise between
 * genuine markers (a stray out-of-sequence letter) doesn't break an
 * otherwise-real run. */
function ascendingRun(marks: Mark[]): Mark[] {
	const run: Mark[] = [];
	for (const mark of marks) {
		const expected = String.fromCharCode(97 + run.length);
		if (mark.letter === expected) {
			run.push(mark);
		}
	}
	return run;
}

/** Split provable `a)…b)…c)…` runs into a head plus lettered items.
 * Returns null when fewer than two markers form an ascending run from
 * 'a' — the under-split failure mode (B9): callers must leave the text
 * whole rather than guess. `joinLettered(splitLettered(text))` always
 * reconstructs `text` byte-for-byte when the result isn't null.
 *
 * Lazy-span normalization: the source sometimes merges an italic gloss
 * and its marker into one `<i>…</i>` span (see `MARKER`'s shape
 * comment). Splitting at such a marker would strand an unbalanced tag,
 * so the split repairs the boundary it cuts: a span-end marker
 * (`a</i>)`) appends the missing `</i>` to the segment before it (the
 * head, or the previous item's text), and a span-start marker (`<i>a)`)
 * re-opens `<i>` on its own item text. `joinLettered` strips exactly
 * these additions back off, keyed by each item's recorded raw marker —
 * so parts must keep marker/text/head together as split produced them. */
function splitLettered(text: string): LetteredParts | null {
	const run = ascendingRun(findMarks(text));
	const [first] = run;
	if (run.length < 2 || first === undefined) {
		return null;
	}
	let head = text.slice(0, first.index);
	const items = run.map((mark, i) => ({
		letter: mark.letter,
		marker: mark.marker,
		text: text.slice(
			mark.index + mark.marker.length,
			run[i + 1]?.index ?? text.length,
		),
	}));
	for (const [i, item] of items.entries()) {
		if (isCloseMarker(item.marker)) {
			const previous = items[i - 1];
			if (previous === undefined) {
				head += '</i>';
			} else {
				previous.text += '</i>';
			}
		}
		if (isOpenMarker(item.marker)) {
			item.text = `<i>${item.text}`;
		}
	}
	return { head, items };
}

/** Inverse of `splitLettered`: reassembles the original text exactly,
 * undoing the lazy-span normalization (the `</i>`/`<i>` the split added
 * at partial-span marker boundaries) before rejoining. */
function joinLettered(parts: LetteredParts): string {
	const segments = [parts.head, ...parts.items.map((item) => item.text)];
	for (const [i, item] of parts.items.entries()) {
		const before = segments[i];
		const own = segments[i + 1];
		if (isCloseMarker(item.marker) && before !== undefined) {
			segments[i] = before.slice(0, -'</i>'.length);
		}
		if (isOpenMarker(item.marker) && own !== undefined) {
			segments[i + 1] = own.slice('<i>'.length);
		}
	}
	return (
		segments[0] +
		parts.items.map((item, i) => item.marker + segments[i + 1]).join('')
	);
}

export type { LetteredItem, LetteredParts };
export { joinLettered, splitLettered };
