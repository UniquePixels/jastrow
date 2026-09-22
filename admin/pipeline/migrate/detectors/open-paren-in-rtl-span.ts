/**
 * Review detector — `open-paren-in-rtl-span` (catalogue: 89 entries).
 * A `<he>` span whose content opens a paren it does not close (or
 * closes one it did not open), so the paren sits inside the
 * right-to-left run while its partner sits outside it and bidi draws
 * it on the wrong side of the Hebrew.
 *
 * The catalogue's own `reason` records that the count is a judgement
 * call — 89 under the strict rule, 389 and 153 under two looser ones,
 * differing over whether the closer must be adjacent. A row is not a
 * repair, so the strict rule is the one ported: an UNBALANCED span,
 * which is exactly the shape a reader sees go wrong. The row is
 * `route: blocked` in the catalogue precisely because no rule has
 * pinned the wider question, and a detector does not pin it either.
 */
import type { TruthEntry } from '../types.ts';
import { type ClassRow, entryRow } from './row.ts';
import { markupFields } from './senses.ts';

/** Catalogue id and report `kind` for a `<he>` span holding unequal
 * numbers of `(` and `)` — the paren's partner sits outside the
 * right-to-left run, so bidi draws it on the wrong side of the
 * Hebrew. */
const OPEN_PAREN_IN_RTL_SPAN = 'open-paren-in-rtl-span';

/** What the review report tells a reader to do about these rows. */
const OPEN_PAREN_IN_RTL_SPAN_ACTION =
	'Move the paren out of the Hebrew span in the admin tool after go-live so bidi draws it on the side the print page shows.';

const HE_SPAN = /<he>(?<inner>.*?)<\/he>/gsu;

/** How many times `c` occurs in `text`. */
function count(text: string, c: string): number {
	return [...text].filter((ch) => ch === c).length;
}

/** Every unbalanced `<he>` span in one field, as report detail. */
function unbalanced(path: string, html: string): string[] {
	const found: string[] = [];
	for (const m of html.matchAll(HE_SPAN)) {
		const inner = m.groups?.['inner'] ?? '';
		const open = count(inner, '(');
		const close = count(inner, ')');
		if (open !== close) {
			found.push(`${path}: <he> holds ${open} "(" against ${close} ")"`);
		}
	}
	return found;
}

/** One row per entry naming every unbalanced Hebrew span. */
function detectOpenParenInRtlSpan(entry: TruthEntry): ClassRow[] {
	const sites = [...markupFields(entry)].flatMap(([path, html]) =>
		unbalanced(path, html),
	);
	return entryRow(entry, OPEN_PAREN_IN_RTL_SPAN, sites);
}

export {
	detectOpenParenInRtlSpan,
	OPEN_PAREN_IN_RTL_SPAN,
	OPEN_PAREN_IN_RTL_SPAN_ACTION,
};
