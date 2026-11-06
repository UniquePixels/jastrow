/**
 * Hebrew character classes and run-finding for markup text.
 *
 * Not HTML: these read the TEXT between tags, which `html.ts` hands
 * over. Kept apart from the tokenizer so each file holds one job.
 */

import type { Span } from './html.ts';

/**
 * Hebrew, built from explicit ranges — NEVER a pasted literal class.
 * A literal `יִ` decomposes to yod + hiriq, and a pasted range built
 * from one silently becomes U+05B4–U+FB4F, which swallows em-dashes,
 * superscript letters and curly quotes (catalogue audit,
 * docs/archive/catalogue-audit/bare-rtl-hebrew.md).
 *
 * U+0591–U+05C7 points and accents · U+05D0–U+05EA letters (final
 * forms included) · U+05F0–U+05F4 the yod-yod/vav-yod ligatures plus
 * geresh and gershayim · U+FB1D–U+FB4F presentation forms.
 */
const HEBREW: string = String.raw`\u0591-\u05C7\u05D0-\u05EA\u05F0-\u05F4\uFB1D-\uFB4F`;

/**
 * What may sit INSIDE a Hebrew run but not in `HEBREW` itself.
 *
 * U+0307 combining dot above is a combining mark on a Hebrew base
 * (1,635 corpus tokens: `מנא̇ מנא̇ תקל̇ ופר̇סין̇`). It must stay inside the
 * run — a bare dot left after a `</span>` reattaches to the wrong base.
 * It is matched only as a SUFFIX of a Hebrew base, never as a class
 * member in its own right: U+0307 also spells Jastrow's Latin
 * transliterations (`haġan` is g + U+0307), and admitting it to the
 * class opened a Hebrew run around that Latin letter's diacritic.
 *
 * ASCII `'` and `"` are geresh and gershayim typed as ASCII (2,024 and
 * 27 tokens: `אל"ף`). They are interior JOINERS only, never class
 * members, so `[HEBREW]` still rejects a bare quote per the acceptance
 * criterion. Without them a single word splits into two runs and Task
 * 5 would wrap each half in its own bidi span, reordering the word.
 *
 * A literal TAB joins Hebrew in 4 tokens and is deliberately excluded —
 * a tab inside a wrapper span is not clearly desirable.
 *
 * Exported since batch 3a: the gershayim predicate
 * (`transform/gershayim.ts`) needs "a Hebrew letter with its marks" in
 * its LOOKBEHIND, because one corpus occurrence (M01940) puts U+0307
 * between the letter and the ASCII quote and a bare `(?<=[HEBREW])`
 * misses it. Exporting the atom rather than restating it there keeps
 * that definition in one place — the two would otherwise be free to
 * drift, and the drift would be invisible: a narrower copy repairs one
 * occurrence fewer while reporting a clean run.
 */
const HEBREW_ATOM: string = String.raw`[${HEBREW}]\u0307*`;
const HEBREW_RUN = new RegExp(
	String.raw`(?:${HEBREW_ATOM})+(?:[ \u00A0'"](?:${HEBREW_ATOM})+)*`,
	'gu',
);

/** Maximal Hebrew runs within one text value, as [start, end) offsets.
 * Interior single spaces between Hebrew tokens stay inside the run;
 * 4,691 of 5,679 bare nodes mix Hebrew and Latin, so a rule must wrap
 * the RUN, never the node. */
function hebrewRuns(value: string): Span[] {
	const runs: Span[] = [];
	HEBREW_RUN.lastIndex = 0;
	let match = HEBREW_RUN.exec(value);
	while (match !== null) {
		runs.push({ end: match.index + match[0].length, start: match.index });
		match = HEBREW_RUN.exec(value);
	}
	return runs;
}

export { HEBREW, HEBREW_ATOM, hebrewRuns };
