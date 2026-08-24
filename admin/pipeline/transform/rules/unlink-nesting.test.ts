/**
 * Regression coverage for the reverse-order-deletion bug fixed
 * 2026-08-23 in `unlinkMatching` (see that function's docstring in
 * `unlink.ts` for the full mechanism, and `links.ts`'s `anchors`
 * docstring for the corpus-wide nesting counts). Split into its own
 * file rather than folded into `unlink.test.ts`: this is a property of
 * the SHARED removal machinery, not any one rule, and `unlink.test.ts`
 * was already at the file's line budget before these two tests.
 */
import { expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceSense } from '../../body/types.ts';
import { applyTransforms } from '../run.ts';
import {
	apparatusCite,
	ellipsisFragment,
	rabbiName,
	unlinkMatching,
} from './unlink.ts';

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

/** Every `definition` in `senses`, recursing through nested senses —
 * the same shape `unlink.ts`'s own `unlinkOverDefinitions` walks. */
function* definitionsOf(senses: readonly SourceSense[]): Generator<string> {
	for (const sense of senses) {
		if (sense.definition !== undefined) {
			yield sense.definition;
		}
		if (sense.senses !== undefined) {
			yield* definitionsOf(sense.senses);
		}
	}
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

// Corpus-wide tag-balance check (maintainer request, 2026-08-23),
// kept as a permanent test rather than a one-off command so a future
// rule sharing this machinery gets the same net.
it('keeps every rewritten definition tag-balanced corpus-wide', async () => {
	// 32k+ entries read from disk and tokenized; bun's 5s default test
	// timeout is too tight for a full corpus pass.
	const broken: string[] = [];
	for await (const source of readSourceEntries()) {
		const { entry: out, records } = applyTransforms(source, 'text-repairs', [
			apparatusCite,
			rabbiName,
			ellipsisFragment,
		]);
		if (records.length === 0) {
			continue;
		}
		for (const definition of definitionsOf(out.content.senses)) {
			const balance = tagBalance(definition);
			if (balance.opens !== balance.closes) {
				broken.push(source.rid);
			}
		}
	}
	expect(broken).toEqual([]);
}, 30_000);
