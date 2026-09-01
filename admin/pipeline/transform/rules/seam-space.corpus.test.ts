/**
 * The five Class B seam rules, CORPUS TIER. Fixture tier in
 * `seam-space.test.ts`.
 *
 * These rules INSERT a character, which is the one thing
 * `checkNoNewText` cannot police here: the space is declared `copied`
 * and credited against a multiset, so a space inserted in the wrong
 * PLACE is, to that gate, the same space. `checkMarkup` is a delta
 * gate and no tag moves. Nothing else in the pipeline reads the
 * rendered result of a seam repair.
 *
 * So this file asserts the two things a fixture cannot:
 *
 * 1. **No rule creates a rendered space-before-punctuation** — the
 *    defect two of them shipped with, found by Task 7's registry
 *    order-freedom probe at 13 entries and closed by the
 *    `(?![.,;:?!])` decline in both patterns. Asserted as a DELTA of
 *    zero over the whole corpus rather than as an invariant, and
 *    paired with the population figures below so a rule that stopped
 *    firing altogether cannot satisfy it.
 * 2. **Each rule's own population, with its UNIT stated.** These are
 *    the figures written back to `patterns.jsonl`, and every one of
 *    them has been corrected at least once during this batch — twice
 *    for the two rules in (1). Pinning them here is what makes the
 *    next correction a test failure rather than a discovery.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { fieldsOf, stripTags } from '../no-new-text.ts';
import type { Rule } from '../types.ts';
import { sourceEntries } from './corpus-fixture.ts';
import {
	anchorItalicSpace,
	gereshAbbrevSpace,
	italicParenSpace,
	parenTagSpace,
	translitItalicSpace,
} from './seam-space.ts';

/** Whitespace immediately before a left-attaching punctuation mark, in
 * RENDERED text. `well-covered) ;guarded;` — the harm. Read through
 * `stripTags` because the tag sits between the inserted space and the
 * mark, so the raw field never shows the two adjacent. */
const SPACE_BEFORE_PUNCTUATION = /\s[.,;:?!]/gu;

const RULES: readonly Rule[] = [
	anchorItalicSpace,
	parenTagSpace,
	italicParenSpace,
	translitItalicSpace,
	gereshAbbrevSpace,
];

interface Tally {
	/** Rendered space-before-punctuation occurrences the rule CREATED,
	 * summed over every entry it touched. Must be 0. */
	created: number;
	/** Entries in which the rule fired. */
	entries: number;
	/** Spaces inserted. Every one of these rules inserts exactly one
	 * space per repair and changes nothing else, so the codepoint-length
	 * delta IS the occurrence count. */
	occurrences: number;
}

/** Rendered space-before-punctuation occurrences in `entry` — the
 * defect `parenTagSpace` and `anchorItalicSpace` shipped with, at 13
 * entries, and the harm the `(?![.,;:?!])` decline now prevents.
 * Read as a per-entry before/after DELTA rather than an absolute,
 * because the corpus holds such spaces of its own that are none of
 * these rules' business. */
function renderedDefects(entry: SourceEntry): number {
	let count = 0;
	for (const field of fieldsOf(entry)) {
		count += (stripTags(field).match(SPACE_BEFORE_PUNCTUATION) ?? []).length;
	}
	return count;
}

/** Total raw length of every field `fieldsOf` reads. Each rule here
 * inserts exactly one space per repair and changes nothing else, so
 * the length delta IS the occurrence count — and it stays honest
 * where re-matching the rule's own pattern in the output could not,
 * since a successful repair destroys the very seam that pattern
 * matches. */
function rawLength(entry: SourceEntry): number {
	return fieldsOf(entry).reduce((total, field) => total + field.length, 0);
}

let scanned: Promise<Map<string, Tally>> | null = null;

/** One pass over the corpus, applying each rule ALONE to every entry.
 * Behind a lazily-awaited cached promise rather than at module scope,
 * on `registry.order.corpus.test.ts`'s shape: module evaluation is covered by
 * no test timeout, so a slow corpus there fails the suite with nothing
 * naming the cause. */
function scan(): Promise<Map<string, Tally>> {
	scanned ??= (async (): Promise<Map<string, Tally>> => {
		const tally = new Map<string, Tally>(
			RULES.map((rule) => [
				rule.id,
				{ created: 0, entries: 0, occurrences: 0 },
			]),
		);
		for (const entry of await sourceEntries()) {
			const before = renderedDefects(entry);
			const length = rawLength(entry);
			for (const rule of RULES) {
				const result = rule.apply(entry);
				const found = tally.get(rule.id) as Tally;
				if (result.records.length === 0) {
					continue;
				}
				found.entries += 1;
				found.occurrences += rawLength(result.entry) - length;
				found.created += Math.max(0, renderedDefects(result.entry) - before);
			}
		}
		return tally;
	})();
	return scanned;
}

describe('the seam rules over the whole corpus', () => {
	// The regression this file was written for. Before the punctuation
	// decline these two returned 2 and 11; the other three have always
	// returned 0, and `italicParenSpace` cannot return anything else —
	// its seam runs the other direction, and `</i> (` puts the space
	// before an OPENING paren, which is where the corpus wants one.
	it('no rule creates a rendered space before punctuation', async () => {
		const tally = await scan();
		expect(
			[...tally]
				.filter(([, found]) => found.created > 0)
				.map(([id, found]) => `${id}: ${found.created}`),
		).toEqual([]);
	}, 180_000);

	// Paired with the delta above so a rule that stopped firing cannot
	// satisfy it, and stated in the unit each row is written back in —
	// `paren-tag-no-space` is catalogued in OCCURRENCES, the rest in
	// ENTRIES, and an unlabelled number is not a measurement.
	it('each rule reproduces its written-back population', async () => {
		const tally = await scan();
		expect(
			Object.fromEntries(
				[...tally].map(([id, found]) => [
					id,
					`${found.occurrences} occ / ${found.entries} ent`,
				]),
			),
		).toEqual({
			'anchor-italic-no-space': '57 occ / 56 ent',
			'geresh-abbrev-space-loss': '24 occ / 23 ent',
			'italic-close-paren-nospace': '96 occ / 95 ent',
			'paren-tag-no-space': '115 occ / 108 ent',
			'translit-italic-space-loss': '15 occ / 15 ent',
		});
	}, 180_000);
});
