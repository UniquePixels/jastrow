/**
 * Plural-section splitter (design doc §2 senses row + §3 B12, decision
 * B12, entry-body-model plan Task 14). Jastrow sometimes ends a noun's
 * singular senses and opens a restarted-numbering plural section:
 * `…a. fr.—Pl. גְּבוּרוֹת 1) manifestations… ?—2) …` (C00062). Maintainer
 * print-verified (2026-07-13): these are separate lemma-level sense sets,
 * not tails of the preceding sense — upstream flattens the block into the
 * prior sense's text. `splitPlural` carves it out into a host (everything
 * before the block) plus intro/items for the restarted run; runs AFTER
 * `lettered.ts`'s split, on its resulting head, in the dry-run
 * composition (design §3 table order).
 *
 * Deliberately more careful than `lettered.ts`'s single-character
 * lookbehind: a bare digit run immediately before `)` collides with an
 * extremely common Jastrow citation idiom — parenthetical references such
 * as `(R. Joḥ. 1)` or `(ref. to Is. LVIII, 1)`, where the digit is a
 * chapter/verse/paragraph number closing a real, already-open
 * parenthetical, not a restarted-list marker. A census-style regex that
 * only checks the single character before the digit (`census.ts`'s
 * `pluralSections`, and the pattern the design census used to count 25
 * candidate entries) can't tell the two apart — measured by hand against
 * the full entry text (task report), only 5 of those 25 carry a genuine,
 * paren-clear ascending run; the other 20 are single spurious
 * citation-close matches that would otherwise slice a built sense open
 * mid-parenthetical (e.g. H01537's would-be item text starts with a bare
 * `)`). So a marker here is only accepted when no unmatched open paren
 * precedes it — paren balance is tracked from the `Pl.` anchor forward,
 * the exact discriminator between the two classes. This mirrors
 * `lettered.ts`'s "authoritative structural rule may disagree with the
 * census's coarse detector" relationship (documented there for
 * `letteredRun` vs `splitLettered`, 189 vs 116) — see this task's
 * `pluralSections` (census, coarse) vs `pluralSplits` (dry-run,
 * authoritative) counts. Failure mode is under-split (B9): anything that
 * isn't a clean, paren-clear, ascending-from-1 run returns null and the
 * block stays inline in its host sense's gloss.
 */

interface PluralItem {
	label: string;
	text: string;
}

interface PluralParts {
	host: string;
	intro: string;
	items: PluralItem[];
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

/** Bare `N)` markers from `from` onward: paren balance is tracked from
 * that point forward, so a `)` closing a paren opened after `from` is
 * recognized as a real parenthetical close (not a marker) rather than a
 * restarted-list digit — the discriminator this module exists for (see
 * header comment). A marker also can't sit immediately after `(` or a
 * word character (the `lettered.ts` lookbehind convention, reused here
 * for the digit run's own start), nor inside an anchor's visible text. */
function findMarkersFrom(text: string, from: number): Mark[] {
	const marks: Mark[] = [];
	let balance = 0;
	for (let i = from; i < text.length; i++) {
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
		let start = i;
		while (start > from && DIGIT.test(text[start - 1] ?? '')) {
			start--;
		}
		if (start === i) {
			continue;
		}
		const before = text[start - 1];
		const excluded =
			before === '(' || (before !== undefined && WORD_CHAR.test(before));
		if (!(excluded || insideAnchor(text, start))) {
			marks.push({ end: i + 1, num: Number(text.slice(start, i)), start });
		}
	}
	return marks;
}

/** The subsequence of `marks` forming a clean 1), 2), 3)… run starting at
 * 1 — mirrors `lettered.ts`'s `ascendingRun`, but a single-item run (just
 * `1)`, no `2)`) is accepted: unlike a)/b) sequences, Jastrow sometimes
 * restarts numbering for a plural section with only one sense. */
function ascendingRun(marks: Mark[]): Mark[] {
	const run: Mark[] = [];
	for (const mark of marks) {
		if (mark.num === run.length + 1) {
			run.push(mark);
		}
	}
	return run;
}

const PL_ANCHOR = /—?Pl\./gu;
const DIGIT = /\d/u;
const WORD_CHAR = /[\p{L}\d_]/u;

/** Split a provable `—Pl. <form> 1)…2)…` block out of `text`. Returns
 * null when no `Pl.` marker is followed by a paren-clear ascending run
 * starting at 1 — the under-split failure mode (B9): callers must leave
 * the text whole rather than guess. `joinPlural(splitPlural(text))`
 * always reconstructs `text` byte-for-byte when the result isn't null. */
function splitPlural(text: string): PluralParts | null {
	for (const m of text.matchAll(PL_ANCHOR)) {
		const anchorStart = m.index ?? 0;
		const run = ascendingRun(findMarkersFrom(text, anchorStart + m[0].length));
		const [first] = run;
		if (first === undefined) {
			continue;
		}
		const host = text.slice(0, anchorStart);
		const intro = text.slice(anchorStart, first.start);
		const items = run.map((mark, i) => ({
			label: String(mark.num),
			text: text.slice(mark.end, run[i + 1]?.start ?? text.length),
		}));
		return { host, intro, items };
	}
	return null;
}

/** Inverse of `splitPlural`: reassembles the original text exactly. */
function joinPlural(parts: PluralParts): string {
	return (
		parts.host +
		parts.intro +
		parts.items.map((item) => `${item.label})${item.text}`).join('')
	);
}

export type { PluralItem, PluralParts };
export { joinPlural, splitPlural };
