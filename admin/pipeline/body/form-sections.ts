/**
 * Form-section splitter (design doc §2 senses row + §3 B12, decision
 * B12, entry-body-model plan Task 14). Jastrow sometimes ends one
 * form's senses and opens a restarted-numbering section for a related
 * grammatical form: `…a. fr.—Pl. גְּבוּרוֹת 1) manifestations… ?—2) …`
 * (C00062). Maintainer print-verified (2026-07-13) that this convention
 * covers `Pl.` (plural); a second print pass (2026-07-14, during study)
 * found the identical convention under `Part. pass.` (passive
 * participle), `Fem.` (feminine), and `Denom.` (denominative) headers —
 * these are separate lemma-level sense sets, not tails of the preceding
 * sense; upstream flattens the block into the prior sense's text.
 * `splitFormSection` carves it out into a host (everything before the
 * block) plus intro/items for the restarted run; runs AFTER
 * `lettered.ts`'s split, on its resulting head, in the dry-run
 * composition (design §3 table order). Originally shipped as
 * `plural.ts` (Pl.-only); generalized in place (`git mv`) once the
 * `Part. pass.`/`Fem.`/`Denom.` sections were print-verified to carry
 * the same shape — the discriminator, ascending-run, and byte
 * round-trip semantics are unchanged, only the marker anchor is now
 * parameterized over `MARKERS`.
 *
 * Deliberately more careful than `lettered.ts`'s single-character
 * lookbehind: a bare digit run immediately before `)` collides with an
 * extremely common Jastrow citation idiom — parenthetical references such
 * as `(R. Joḥ. 1)` or `(ref. to Is. LVIII, 1)`, where the digit is a
 * chapter/verse/paragraph number closing a real, already-open
 * parenthetical, not a restarted-list marker. A census-style regex that
 * only checks the single character before the digit (`census.ts`'s
 * `pluralSection`, and the pattern the design census used to count 25
 * candidate entries) can't tell the two apart — measured by hand against
 * the full entry text (task report), only 5 of those 25 carry a genuine,
 * paren-clear ascending run for `Pl.`; the other 20 are single spurious
 * citation-close matches that would otherwise slice a built sense open
 * mid-parenthetical (e.g. H01537's would-be item text starts with a bare
 * `)`). So a marker here is only accepted when no unmatched open paren
 * precedes it — paren balance is tracked from the marker anchor forward,
 * the exact discriminator between the two classes. This mirrors
 * `lettered.ts`'s "authoritative structural rule may disagree with the
 * census's coarse detector" relationship (documented there for
 * `letteredRun` vs `splitLettered`, 189 detected vs 191 structural
 * since Task 15's italic extension; 116 before it) — see this task's
 * `pluralSections` (census, coarse) vs `formSectionSplits` (dry-run,
 * authoritative) counts. Failure mode is under-split (B9): anything that
 * isn't a clean, paren-clear, ascending-from-1 run returns null and the
 * block stays inline in its host sense's gloss.
 *
 * When a text carries more than one marker (e.g. D00194: `—Fem. … —Pl.
 * … 1) … —2) …`), each marker's ascending-run search is bounded to the
 * text between its own anchor and the NEXT marker anchor of any kind
 * (or the text's end) — not left unbounded to the end of the whole
 * text. Sections are sequential, so a digit run genuinely belongs to
 * the CLOSEST preceding marker; without this bound, an earlier
 * marker's unbounded forward scan would also "see" a later marker's
 * run and wrongly steal it (D00194's `1)…2)` run is the `Pl.`
 * section's, not the earlier `Fem.` section's — measured: with the
 * bound, `Fem.` alone has exactly one genuine hit corpus-wide,
 * G00644; without it, D00194 would double-count). Anchors are tried
 * in document order and the first one (of any marker) whose bounded
 * window holds a genuine run wins — one section split per sense text,
 * same as the original Pl.-only behavior.
 */

interface FormSectionItem {
	label: string;
	text: string;
}

interface FormSectionParts {
	host: string;
	intro: string;
	items: FormSectionItem[];
	marker: string;
}

/** An `<a href="/x">…</a>` anchor's visible text can itself contain a
 * digit run immediately before `)` by coincidence — shares `lettered.ts`'s
 * reasoning for excluding anchor-interior hits. */
function insideAnchor(text: string, index: number): boolean {
	return text.lastIndexOf('<a ', index) > text.lastIndexOf('</a>', index);
}

interface Mark {
	end: number;
	num: number;
	start: number;
}

/** Tests whether a `)` at `i` (with `from` as the digit run's leftmost
 * possible start, i.e. the marker anchor) is a genuine restarted-list
 * marker: finds the digit run immediately before it and applies the
 * exclusions — a marker can't sit immediately after `(` or a word
 * character (the `lettered.ts` lookbehind convention, reused here for the
 * digit run's own start), nor inside an anchor's visible text. Returns
 * null when `i` isn't preceded by a qualifying digit run. */
function markerAt(text: string, from: number, i: number): Mark | null {
	let start = i;
	while (start > from && DIGIT.test(text[start - 1] ?? '')) {
		start--;
	}
	if (start === i) {
		return null;
	}
	const before = text[start - 1];
	const excluded =
		before === '(' || (before !== undefined && WORD_CHAR.test(before));
	if (excluded || insideAnchor(text, start)) {
		return null;
	}
	return { end: i + 1, num: Number(text.slice(start, i)), start };
}

/** Bare `N)` markers in `[from, to)`: paren balance is tracked from
 * `from` forward within that bounded window, so a `)` closing a paren
 * opened after `from` is recognized as a real parenthetical close (not
 * a marker) rather than a restarted-list digit — the discriminator
 * this module exists for (see header comment). The window's upper
 * bound is the next marker anchor (or the text's end) — the
 * nearest-marker-attribution bound (see header comment). */
function findMarksInWindow(text: string, from: number, to: number): Mark[] {
	const marks: Mark[] = [];
	let balance = 0;
	for (let i = from; i < to; i++) {
		const ch = text[i];
		if (ch === '(') {
			balance++;
			continue;
		}
		if (ch !== ')') {
			continue;
		}
		if (balance > 0) {
			balance--;
			continue;
		}
		const mark = markerAt(text, from, i);
		if (mark !== null) {
			marks.push(mark);
		}
	}
	return marks;
}

/** The subsequence of `marks` forming a clean 1), 2), 3)… run starting at
 * 1 — mirrors `lettered.ts`'s `ascendingRun`, but a single-item run (just
 * `1)`, no `2)`) is accepted: unlike a)/b) sequences, Jastrow sometimes
 * restarts numbering for a form section with only one sense. */
function ascendingRun(marks: Mark[]): Mark[] {
	const run: Mark[] = [];
	for (const mark of marks) {
		if (mark.num === run.length + 1) {
			run.push(mark);
		}
	}
	return run;
}

const DIGIT = /\d/u;
const WORD_CHAR = /[\p{L}\d_]/u;

/** Form-section markers this module splits. Order here is
 * documentation order, not match priority — `findAnchors` below sorts
 * candidate anchors by matched length itself, so a marker that's a
 * textual prefix of another (a hypothetical future `Part.` alongside
 * `Part. pass.`) never needs manual reordering: the longer match wins
 * at a shared start index either way. */
const MARKERS = ['Pl.', 'Part. pass.', 'Fem.', 'Denom.'];

/** Tag-tolerant so both markup shapes match: Jastrow usually renders a
 * marker as plain text (`—Pl.`, `—Fem.`), but `Part. pass.` sometimes
 * has its own closing `<i>` land between `pass` and its period —
 * `<i>Part. pass</i>.` (C00869, H01022) — rather than the literal
 * string. Each literal `.` and ` ` in `marker` becomes tolerant of an
 * inline tag around it so both shapes match; a leading `—` is
 * optional, same as the original `Pl.`-only anchor. */
function buildAnchorPattern(marker: string): RegExp {
	const tagGap = '(?:<\\/?[a-z][^>]*>)*';
	const pattern = marker
		.replace(/\./gu, `${tagGap}\\.`)
		.replace(/ /gu, `\\s*${tagGap}`);
	return new RegExp(`—?${pattern}`, 'gu');
}

const ANCHOR_PATTERNS = new Map(
	MARKERS.map((marker) => [marker, buildAnchorPattern(marker)]),
);

interface Anchor {
	end: number;
	marker: string;
	start: number;
}

/** Every anchor occurrence of every marker in `MARKERS`, across the
 * whole text, in document order. When two anchors start at the same
 * index, only the longest (by matched text) is kept — the
 * longest-match-first contract `MARKERS`'s comment documents. */
function findAnchors(text: string): Anchor[] {
	const hits: Anchor[] = [];
	for (const marker of MARKERS) {
		const pattern = ANCHOR_PATTERNS.get(marker);
		if (pattern === undefined) {
			continue;
		}
		for (const m of text.matchAll(pattern)) {
			const start = m.index ?? 0;
			hits.push({ end: start + m[0].length, marker, start });
		}
	}
	hits.sort((a, b) => a.start - b.start || b.end - a.end);
	const deduped: Anchor[] = [];
	for (const hit of hits) {
		if (deduped.at(-1)?.start === hit.start) {
			continue;
		}
		deduped.push(hit);
	}
	return deduped;
}

/** Split a provable `—<marker> <form> 1)…2)…` block out of `text`, for
 * whichever marker in `MARKERS` first (document order) has a
 * paren-clear ascending run starting at 1 within its bounded window
 * (see header comment for the nearest-marker-attribution bound).
 * Returns null when no marker anchor qualifies — the under-split
 * failure mode (B9): callers must leave the text whole rather than
 * guess. `joinFormSection(splitFormSection(text))` always reconstructs
 * `text` byte-for-byte when the result isn't null. */
function splitFormSection(text: string): FormSectionParts | null {
	const anchors = findAnchors(text);
	for (const [index, anchor] of anchors.entries()) {
		const windowEnd = anchors[index + 1]?.start ?? text.length;
		const run = ascendingRun(findMarksInWindow(text, anchor.end, windowEnd));
		const [first] = run;
		if (first === undefined) {
			continue;
		}
		const host = text.slice(0, anchor.start);
		const intro = text.slice(anchor.start, first.start);
		const items = run.map((mark, i) => ({
			label: text.slice(mark.start, mark.end - 1),
			text: text.slice(mark.end, run[i + 1]?.start ?? text.length),
		}));
		return { host, intro, items, marker: anchor.marker };
	}
	return null;
}

/** Inverse of `splitFormSection`: reassembles the original text
 * exactly. `parts.marker` is metadata only (which anchor matched) —
 * the raw marker text itself is already part of `intro`, so it plays
 * no part in reconstruction. */
function joinFormSection(parts: FormSectionParts): string {
	return (
		parts.host +
		parts.intro +
		parts.items.map((item) => `${item.label})${item.text}`).join('')
	);
}

export type { FormSectionItem, FormSectionParts };
export { joinFormSection, MARKERS, splitFormSection };
