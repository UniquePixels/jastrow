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
	/** The raw marker text as matched — `a)`, `<i>a</i>)`, or `a</i>)` —
	 * so `joinLettered` reproduces the source byte-for-byte without the
	 * caller tracking which shape each marker took. */
	marker: string;
	text: string;
}

interface LetteredParts {
	head: string;
	items: LetteredItem[];
}

// Shares census.ts's LETTERED caveat: the lookbehind excludes a
// preceding '(' or letter but not a digit, so a folio-style "39a)"
// could in principle be read as marker "a)". Three marker shapes, tried
// in this order at each position (Task 15, §6.0 review decision 07):
//   <i>a</i>)  — the whole italic pair is the marker (75-entry class);
//   a</i>)     — the letter ends a longer italic span (e.g. Q01353's
//                `<i>section, a</i>)`), so only letter+close+paren is
//                the marker and the span's `<i>` stays in the head;
//   a)         — the original plain shape.
// The full-italic alternative sits first so the scan consumes it at the
// `<` and the span-end alternative can't shave it to `a</i>)`. The
// span-end lookbehind additionally excludes `>`: a letter right after a
// tag close is the `<i>a</i>)` shape, which only the full alternative
// (with its own paren/letter guard) may claim — otherwise a
// parenthesized `(<i>a</i>)`, whose full match the `(` guard blocks,
// would leak back in as a span-end match.
const MARKER =
	/(?:(?<![(\p{L}])<i>(?<full>[a-z])<\/i>\)|(?<![(\p{L}>])(?<close>[a-z])<\/i>\)|(?<![(\p{L}])(?<plain>[a-z])\))/gu;

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
			m.groups?.['full'] ?? m.groups?.['close'] ?? m.groups?.['plain'];
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
 * reconstructs `text` byte-for-byte when the result isn't null. */
function splitLettered(text: string): LetteredParts | null {
	const run = ascendingRun(findMarks(text));
	const [first] = run;
	if (run.length < 2 || first === undefined) {
		return null;
	}
	const head = text.slice(0, first.index);
	const items = run.map((mark, i) => ({
		letter: mark.letter,
		marker: mark.marker,
		text: text.slice(
			mark.index + mark.marker.length,
			run[i + 1]?.index ?? text.length,
		),
	}));
	return { head, items };
}

/** Inverse of `splitLettered`: reassembles the original text exactly. */
function joinLettered(parts: LetteredParts): string {
	return (
		parts.head + parts.items.map((item) => item.marker + item.text).join('')
	);
}

export type { LetteredItem, LetteredParts };
export { joinLettered, splitLettered };
