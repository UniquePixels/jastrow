/**
 * Regression coverage for the reverse-order-deletion bug fixed
 * 2026-08-23 in `unlinkMatching` (see that function's docstring in
 * `unlink.ts` for the full mechanism, and `links.ts`'s `anchors`
 * docstring for the corpus-wide nesting counts). Split into its own
 * file rather than folded into `unlink.test.ts`: this is a property of
 * the SHARED removal machinery, not any one rule. The corpus-wide
 * tag-balance check that ran this machinery over every entry was
 * retired in consolidation step 5 and is listed in
 * `docs/v2/retired-corpus-checks.md`.
 */
import { expect, it } from 'bun:test';
import { unlinkMatching } from './unlink.ts';

/** Count of `<a` opens vs `</a` closes in a string — the tag-balance
 * check the reviewer ran corpus-wide against the reverse-order-
 * deletion bug. `\b` after `a` keeps `<abbr`-style tags (none exist in
 * this corpus, but the guard is free) from matching. */
function tagBalance(text: string): { closes: number; opens: number } {
	return {
		closes: (text.match(/<\/a>/gu) ?? []).length,
		opens: (text.match(/<a\b/gu) ?? []).length,
	};
}

// A00282, verbatim: the reviewer's proof shape, a real nested
// duplicate anchor pair sharing one data-ref — regression test for
// the 2026-08-23 reverse-order-deletion bug (unlinkMatching's
// docstring has the mechanism). Must remove BOTH anchors cleanly,
// not just avoid a stray tag.
const A00282 =
	' (v. <a dir="rtl" class="refLink" href="/Jastrow,_אֵגוֹר.1" data-ref="Jastrow, אֵגוֹר 1">אֵגוֹר</a>, ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_*אֲגוֹרָה.1" data-ref="Jastrow, *אֲגוֹרָה 1">' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_*אֲגוֹרָה.1" data-ref="Jastrow, *אֲגוֹרָה 1">אֲגוֹרָה</a>)</a>' +
	'<i>fit for storage, of good quality.</i>';

it('removes both members of a nested duplicate anchor pair cleanly (A00282)', () => {
	const result = unlinkMatching(
		A00282,
		(_tokens, anchor) => anchor.dataRef === 'Jastrow, *אֲגוֹרָה 1',
	);
	expect(result.removed).toBe(2);
	expect(result.text).toBe(
		' (v. <a dir="rtl" class="refLink" href="/Jastrow,_אֵגוֹר.1" data-ref="Jastrow, אֵגוֹר 1">אֵגוֹר</a>, ' +
			'אֲגוֹרָה)<i>fit for storage, of good quality.</i>',
	);
	const balance = tagBalance(result.text);
	expect(balance.opens).toBe(balance.closes);
});
