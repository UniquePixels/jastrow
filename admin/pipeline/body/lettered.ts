/**
 * Lettered-item splitter (design doc §3). Splits ONLY complete
 * ascending a)…b)…c)… runs whose markers sit outside parens and
 * anchors; everything else returns null and the text stays whole.
 * "Outside parens" is `parenFiltered`'s rule: a marker inside an
 * open `(`, at any nesting depth, does not count, and a text whose
 * paren state is unclear (a `)` with no `(` open) does not split.
 *
 * That is the deliberate under-split failure mode (decision B5/B9):
 * an unsplit block is still readable, a wrongly split one is not.
 * This module is the authoritative structural rule. A boolean
 * detector written for corpus-wide sizing (`letteredRun`, in the
 * archived census at `refs/tags/archive/v2-research-2026-09`) may
 * disagree with it on edge cases, and loses.
 */

interface LetteredItem {
	letter: string;
	/** The raw marker text as matched — `a)`, `<i>a</i>)`, `a</i>)`, or
	 * `<i>a)` — so `joinLettered` can invert the lazy-span normalization
	 * (see `splitLettered`) and reproduce the source byte-for-byte. */
	marker: string;
	text: string;
}

/** One text decomposed around a lettered run: the `head` before the
 * `a)` marker, and the lettered `items` in document order.
 *
 * The two only rejoin to the source as `splitLettered` produced them.
 * The split repairs the italic spans it cuts through — appending
 * `</i>` to the segment before a span-end marker, re-opening `<i>` on
 * a span-start marker's own text — and `joinLettered` strips exactly
 * those additions back off, keyed by each item's recorded raw
 * `marker`. Edit a head or an item's text in between and the inverse
 * no longer holds. */
interface LetteredParts {
	head: string;
	items: LetteredItem[];
}

// Shares census.ts's LETTERED caveat: the lookbehind excludes a
// preceding '(' or letter but not a digit, so a folio-style "39a)"
// could in principle be read as marker "a)". Four marker shapes, tried
// in this order at each position (§6.0 review decision 07):
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
//                Corpus-measured: requiring `.`/`,`/`;` +
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

/** Every `MARKER` match in document order, before any filtering —
 * `parenFiltered` needs all of them, anchor-interior ones included,
 * because each one's `)` takes part in the paren count. */
function candidateMarks(text: string): Mark[] {
	const marks: Mark[] = [];
	for (const m of text.matchAll(MARKER)) {
		const letter =
			m.groups?.['full'] ??
			m.groups?.['open'] ??
			m.groups?.['close'] ??
			m.groups?.['plain'];
		if (letter !== undefined) {
			marks.push({ index: m.index, letter, marker: m[0] });
		}
	}
	return marks;
}

// A markup tag, skipped by the paren count: an attribute value (an
// href, a data-ref) is not text, and a paren in it is not a paren.
// A quoted attribute value may hold `>` (`title="a>b"`), so the scan
// steps over quoted strings whole; outside quotes a tag holds neither
// `<` nor `>`, and excluding `<` keeps the scan linear on text with a
// stray `<` (Sonar S8786). The corpus has no such attribute today.
const TAG = /<(?:[^<>"]|"[^"]*")*>/gu;

// A numbered marker's `)` — an inline sense number (`—2)`) the source
// left in the text, or a verse number closing a citation paren (`(Is.
// XL, 1)`). The paren count reads it exactly like a lettered
// candidate's `)`: its own outside a paren, the paren's close inside
// one. Without it every inline `—2)` read as a `)` with nothing open,
// and 11 entries' lettered runs went unsplit as unclear (L53,
// measured over the import's inputs).
const NUMBERED = /(?<![(\p{L}\d])\d+\)/gu;

/** The offset of every `(` and `)` in `text`'s own characters, in
 * order — tags masked out (see `TAG`), anchor visible text kept, since
 * a paren a reader sees in a link is still a paren. */
function parenOffsets(text: string): number[] {
	const masked = text.replace(TAG, (tag) => ' '.repeat(tag.length));
	// UTF-16 offsets, the unit `matchAll`'s `index` counts in.
	const offsets: number[] = [];
	for (let index = 0; index < masked.length; index++) {
		const char = masked[index];
		if (char === '(' || char === ')') {
			offsets.push(index);
		}
	}
	return offsets;
}

/** Every `NUMBERED` match, shaped as a letterless `Mark` so the paren
 * count reads its `)` exactly as it reads a lettered candidate's. */
function numberedMarks(text: string): Mark[] {
	return [...text.matchAll(NUMBERED)].map((m) => ({
		index: m.index,
		letter: '',
		marker: m[0],
	}));
}

/** The candidates and the paren offsets merged in text order: a
 * candidate sorts at its start, so it is placed before its own `)`. A
 * candidate never starts on a paren (it starts on a letter, a digit or
 * `<`), so no two events share a position. */
function parenEvents(
	text: string,
	candidates: readonly Mark[],
): (Mark | number)[] {
	const at = (event: Mark | number): number =>
		typeof event === 'number' ? event : event.index;
	return [...candidates, ...parenOffsets(text)].toSorted(
		(a, b) => at(a) - at(b),
	);
}

/** `marks` minus every candidate inside an open paren, or null when
 * the paren state is unclear (L53, P00790's `b) (v. Kal, c) to
 * neutralize`, where the cross-reference's own `c)` was taken as a
 * marker).
 *
 * Every candidate ends in a `)` that is either its own (a lettered
 * marker outside parens) or the close of the paren it sits in (`(v.
 * Kal, c)` — print sets one `)` for both). The count reads it by the
 * candidate's depth: inside a paren it closes it, outside it is the
 * marker's and leaves the depth alone. Numbered markers (`NUMBERED`)
 * take part on the same terms, though they never split. Nesting
 * counts: a candidate at any depth above zero is inside. A `(` never
 * closed puts every later candidate inside, so the run ends before it.
 *
 * Unclear is a `)` that is no candidate's and has no `(` open. It
 * means some earlier paren was misread — a lost `(`, or a candidate
 * whose `)` was not the paren's close (`(see a) above)`) — and then
 * any earlier depth may be wrong, so the whole text stays unsplit:
 * the under-split failure direction (B9), never a guessed boundary. */
function parenFiltered(text: string, marks: readonly Mark[]): Mark[] | null {
	const candidates = [...marks, ...numberedMarks(text)];
	const closers = new Map(
		candidates.map((mark) => [mark.index + mark.marker.length - 1, mark]),
	);
	const inside = new Set<Mark>();
	let depth = 0;
	for (const event of parenEvents(text, candidates)) {
		if (typeof event === 'number') {
			depth += depthStep(text[event], closers.get(event), inside);
			if (depth < 0) {
				return null;
			}
		} else if (depth > 0) {
			inside.add(event);
		}
	}
	return marks.filter((mark) => !inside.has(mark));
}

/** What one paren does to the depth: `(` opens (+1); a `)` closes
 * (-1) unless it is the own `)` of a candidate found outside every
 * paren (0) — see `parenFiltered`. `own` is the candidate whose `)`
 * this is, if any. */
function depthStep(
	char: string | undefined,
	own: Mark | undefined,
	inside: ReadonlySet<Mark>,
): number {
	if (char === '(') {
		return 1;
	}
	return own === undefined || inside.has(own) ? -1 : 0;
}

/** Every counted marker in document order: the candidates outside
 * parens (`parenFiltered`) and anchors (`insideAnchor`), or null when
 * the paren state is unclear. Does not yet enforce ascending order —
 * that's the caller's job, since a single stray marker breaking the
 * run should stop the sequence there rather than reject the whole
 * text. */
function findMarks(text: string): Mark[] | null {
	const outside = parenFiltered(text, candidateMarks(text));
	if (outside === null) {
		return null;
	}
	return outside.filter((mark) => !insideAnchor(text, mark.index));
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
 * 'a', or when the text's paren state is unclear (`parenFiltered`) —
 * the under-split failure mode (B9): callers must leave the text
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
	const marks = findMarks(text);
	if (marks === null) {
		return null;
	}
	const run = ascendingRun(marks);
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
