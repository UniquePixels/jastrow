/**
 * Corpus tier — every headword and alt round-trips, and the review
 * list is pinned.
 *
 * `decomposeForm` is the only lossy-looking step in the finishing
 * stages: it parses a marked string (`אָב I ¹`) into a form object and
 * throws the string away. Gate 2 in `migrate.ts` re-checks that per
 * entry against the composed headword; this file asserts the same
 * property standalone, over the whole corpus, so a headword parser
 * change fails here with the offending string rather than inside a
 * 32,512-entry migration run.
 *
 * STAGE: `composedEntries()` — the `text-repairs` output. `migrate.ts`
 * decomposes the entry AFTER `structural-repairs` and the patch corpus
 * as well, one stage later. The two agree today because no
 * structural-repairs rule and no accepted patch touches `headword` or
 * `alt_headwords`, and REVIEW_LIST below is the assertion of that: the
 * number is the one `bun pipeline:migrate` printed as
 * `headwordReview=` on the same commit. If a later batch registers a
 * structural rule that respells a headword, this file and the CLI will
 * disagree — which is the signal to move this test onto the later
 * stage, not to nudge the constant.
 */
import { expect, it } from 'bun:test';
import { composedEntries } from '../transform/rules/corpus-fixture.ts';
import { decomposeForm, regenerateForm, reviewReason } from './headword.ts';

/** Measured 2026-09-07 by the first full dry run (branch
 * feat/migrate-stages): forms whose marked string carried something
 * `decomposeForm` could not account for, listed in the blessing doc for
 * the maintainer to read. Not a gate — a review queue. */
const REVIEW_LIST = 309;

it('round-trips every headword and alt, and pins the review list', async () => {
	let review = 0;
	let forms = 0;
	const broken: string[] = [];
	for (const entry of await composedEntries()) {
		for (const marked of [entry.headword, ...(entry.alt_headwords ?? [])]) {
			forms++;
			const decomposed = decomposeForm(marked);
			if (regenerateForm(decomposed.form) !== marked) {
				broken.push(`${entry.rid}: ${marked}`);
			}
			if (reviewReason(decomposed) !== undefined) {
				review++;
			}
		}
	}
	// Named, not counted: a failure has to say which headword to look at.
	expect(broken).toEqual([]);
	// 32,512 headwords + 11,080 alts — the same population gate 2 walks.
	expect(forms).toBe(43_592);
	expect(review).toBe(REVIEW_LIST);
});
