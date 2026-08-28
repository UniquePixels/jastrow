/**
 * The headword-field family — Phase 2 batch 5 (spec
 * `docs/specs/2026-08-27-headword-field-integrity-design.md`).
 *
 * **THE FIRST BATCH WHOSE OBJECT IS A FIELD RATHER THAN MARKUP.** Every
 * rule here edits `headword`, `alt_headwords` or `content.morphology`,
 * none of which carries a tag anywhere in this corpus. So `markup.ts`
 * has no delta to compare and `link-target.ts` is never reached:
 * `no-new-text.ts` is the only gate with anything to say about these
 * rules, which is a narrower safety posture than batches 1-4 ran under
 * and is stated here rather than left to be discovered.
 *
 * The rules live in ONE module because they share an OBJECT, not a
 * mechanism. Batch 4 split its rules across four modules because the
 * mechanism determined which gate could see the change; here one gate
 * sees everything, and four modules would be four docstrings repeating
 * one context.
 */
import type { SourceEntry } from '../../body/types.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

// Hoisted per lint/performance/useTopLevelRegex. None carries `g` where
// it is handed to `.test()`; `lastIndex` on a shared literal would
// otherwise make the same input answer differently on alternate calls.
const ANY_PAREN = /[()]/u;
const STRIP_PARENS = /[()]/gu;
const STRIP_WHITESPACE = /\s+/gu;

/**
 * Delete print's grouping delimiters and normalise the whitespace the
 * deletion leaves behind.
 *
 * The collapse is part of the operation and not a tidy-up after it: 7
 * occurrences carry a space adjacent to a delimiter and 12 would hold a
 * doubled space without it, `'(פַּנְיָה ) I'` becoming `'פַּנְיָה  I'`.
 * Deleting whitespace shrinks the text multiset, so neither half of
 * this needs an `allows`.
 */
function strip(item: string): string {
	return item.replace(STRIP_PARENS, '').replace(STRIP_WHITESPACE, ' ').trim();
}

/**
 * The two occurrences whose parentheses are NOT print's grouping
 * delimiters, refused by SHAPE rather than by rid (spec §3.4).
 *
 * - **Interior optional-letter** — one delimiter of each kind, the
 *   close terminal, the open somewhere other than the start:
 *   `'אִיסְפְּלָנִית(א)'`, print's convention for a form attested with and
 *   without the final aleph. Stripping yields the plene reading and
 *   silently discards the other one.
 * - **Stray close** — a close delimiter with no open in the item and
 *   not at its end: `'אֵינָשׁ) אִינְשָׁא'`, the §3.1 tear landing at the
 *   wrong offset, its open living in a different item. Stripping yields
 *   `'אֵינָשׁ אִינְשָׁא'`, a two-word item that is neither a phrase lemma
 *   nor a spelling of anything. Repairing it means re-splitting, which
 *   is a different operation.
 *
 * A rule that quietly widened to cover these would be batch 3b's
 * failure mode — a rule claiming a population nothing gave it. The
 * corpus test asserts that this predicate selects exactly `A01480` and
 * `A01394` and no others.
 */
function refusesStrip(item: string): boolean {
	const trimmed = item.trim();
	const opens = trimmed.split('(').length - 1;
	const closes = trimmed.split(')').length - 1;
	if (opens === 0 && closes === 1) {
		return !trimmed.endsWith(')');
	}
	if (opens !== 1 || closes !== 1 || !trimmed.endsWith(')')) {
		return false;
	}
	return !(trimmed.startsWith('(') || trimmed.startsWith('*('));
}

/**
 * Rewrite `alt_headwords` item by item and collect one record per
 * CHANGED ITEM, so `detail` names the occurrence rather than the entry.
 * `count.ts` measures entries with a non-empty `records`, so the finer
 * granularity costs nothing there and buys a readable migration report.
 *
 * The entry is returned BY IDENTITY when nothing changed. That is the
 * contract `types.ts` states and the reason it matters is not
 * performance: `run.ts` aliases the input and hands both sides to the
 * gates, which compare values, so a rule that mutated in place would
 * make every gate read the already-changed text on both sides and
 * report clean no matter what it did.
 */
function overAltHeadwords(
	entry: SourceEntry,
	ruleId: string,
	rewrite: (item: string) => string,
): { entry: SourceEntry; records: TransformRecord[] } {
	const items = entry.alt_headwords;
	if (items === undefined) {
		return { entry, records: [] };
	}
	const records: TransformRecord[] = [];
	const next = items.map((item) => {
		const written = rewrite(item);
		if (written !== item) {
			records.push({ detail: `${item} → ${written}`, rid: entry.rid, ruleId });
		}
		return written;
	});
	return {
		entry: records.length === 0 ? entry : { ...entry, alt_headwords: next },
		records,
	};
}

/**
 * `parenthesized-alt-headword` — 654 occurrences / 580 entries.
 *
 * **THE CATALOGUE'S DESCRIPTION IS WRONG, AND THE WAY IT IS WRONG IS
 * THIS ROW'S FINDING.** It reads *"alt_headwords item wrapped in the
 * print parentheses, sometimes unclosed"*. The items are not unclosed.
 * Print sets ONE parenthetical group holding several variant forms, and
 * the upstream comma-split cut the group at its internal comma, leaving
 * a delimiter on each fragment:
 *
 * ```
 * A00083  headword אַבְזָקַת   alt_headwords ['(אַבְזָקָא', 'אַבְזָקָה)']
 * ```
 *
 * 69 of the 84 open-only items pair with a later close-only item in the
 * same array — 52 adjacent, 17 spanning one or two intervening items
 * that are inside the parentheses too. Only 28 are genuinely orphaned.
 * All of it is pinned in `headword-census.ts` and asserted in
 * `headword.corpus.test.ts`.
 *
 * **RULING (Brian, 2026-08-27): strip the delimiters, add no new
 * form-object mark.** The parens are print's grouping punctuation
 * around a run of variant readings, not part of any lemma, and
 * `altHeadwords` survives into v2 as form objects whose `text` is a
 * lookup key — one reading `'(אוֹב)'` matches nothing a user will type.
 *
 * Because the ruling is *strip only*, every sub-shape produces the same
 * output under one blanket operation. **The seven-bucket taxonomy is
 * this rule's EVIDENCE that the blanket strip is safe, not a branch in
 * its code**; stating it the other way round would invite three rules
 * where one is correct.
 *
 * Declares nothing on `TransformResult`. It only deletes, so its output
 * is a strict sub-multiset of its input.
 *
 * **FORWARD HAZARD for whoever writes `migrate.ts`:** all 18 starred
 * `alt_headwords` items in the corpus also carry parentheses
 * (`'*(אוּסְיָא)'`), and they are the same 18 the data architecture
 * reports as *"529 Roman, 18 starred"*. After this rule all 18 are bare
 * `*X`, a shape the source has never held. A reconstructed-mark
 * decomposer written to `^\*` works either way; one written to the
 * observed `*(` shape would silently stop marking all 18. Asserted in
 * the corpus test so it is a failing test rather than a lost paragraph.
 */
const parenAltHeadword: Rule = {
	apply: (entry: SourceEntry): TransformResult => {
		const { entry: next, records } = overAltHeadwords(
			entry,
			'parenthesized-alt-headword',
			(item) =>
				ANY_PAREN.test(item) && !refusesStrip(item) ? strip(item) : item,
		);
		return { entry: next, records };
	},
	id: 'parenthesized-alt-headword',
	phase: 'text-repairs',
};

export { overAltHeadwords, parenAltHeadword, refusesStrip, strip };
