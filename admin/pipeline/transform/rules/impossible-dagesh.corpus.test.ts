/**
 * `impossibleDagesh` over the whole corpus, and `vkhGereshRestore`
 * beside it.
 *
 * Two rows in one file because they are the two batch-10 rules that
 * touch NO link target and NO headword — measured, 0 of 19 and 0 of 11
 * sit inside a tag — so neither needs the case-9 machinery its two
 * siblings do, and neither has a namespace question to answer. What
 * each needs is a population, a null model and a delta, and those are
 * three assertions apiece.
 */
import { expect, it } from 'bun:test';
import { fieldsOf, stripTags } from '../no-new-text.ts';
import { composedEntries, repairedEntries } from './corpus-fixture.ts';

const TIMEOUT = 120_000;

/** A dagesh on one of the two letters that cannot carry one. */
const IMPOSSIBLE = /([רח])ּ/gu;
/** A dagesh on ה — the MAPPIQ, ordinary Hebrew, and the null model the
 * rule must leave entirely alone. */
const MAPPIQ = /הּ/gu;
/** The letters that also cannot carry a dagesh and never do. */
const NEVER = /([אע])ּ/gu;
/** The abbreviation with nothing of its own word around it. */
const BARE_VKH = /(?<!(?:[א-ת]|\p{Mn}))וכ(?!(?:[א-ת׳״'"]|\p{Mn}))/gu;
/** The same abbreviation spelled correctly. */
const WHOLE_VKH = /(?<!(?:[א-ת]|\p{Mn}))וכ[׳']/gu;

/** How many times `pattern` matches across the corpus, and in how many
 * entries.
 *
 * READ THROUGH `stripTags` THROUGHOUT. For the two defect populations
 * that is also the raw figure — measured, neither row has a member
 * inside a tag — but it is NOT for the mappiq null model, where raw
 * fields hold 216 more because a `data-ref` carries Hebrew too. Using
 * one basis for all of them keeps the deltas comparable. */
function census(
	entries: readonly { rid: string }[],
	pattern: RegExp,
): { entries: number; occurrences: number } {
	let occurrences = 0;
	let hit = 0;
	for (const entry of entries) {
		const before = occurrences;
		for (const field of fieldsOf(entry as never)) {
			occurrences += [...stripTags(field).matchAll(pattern)].length;
		}
		if (occurrences > before) {
			hit += 1;
		}
	}
	return { entries: hit, occurrences };
}

it(
	'reproduces the impossible-dagesh row at 19 over 17 entries',
	async () => {
		const repaired = await repairedEntries();
		expect(census(repaired, IMPOSSIBLE)).toEqual({
			entries: 17,
			occurrences: 19,
		});
		const resh = census(repaired, /רּ/gu).occurrences;
		const het = census(repaired, /חּ/gu).occurrences;
		expect({ het, resh }).toEqual({ het: 4, resh: 15 });
	},
	TIMEOUT,
);

/** THE SIGNAL IS CLEAN RATHER THAN THRESHOLDED. א and ע cannot take a
 * dagesh either and never carry one, so the row is not a tail of a
 * distribution — there is no distribution. */
it(
	'finds no dagesh at all on aleph or ayin',
	async () => {
		expect(census(await repairedEntries(), NEVER).occurrences).toBe(0);
	},
	TIMEOUT,
);

/** THE NULL MODEL, and the population the rule is most dangerous to.
 * 1,052 reader-visible mappiqs are ordinary Hebrew — `בָּהּ`,
 * `אֱלָהּ` — and a rule that read ה as "cannot take a dagesh" would
 * corrupt every one. The count may only GROW, by the three word-final
 * ח this rule corrects, and it grows by exactly three.
 *
 * READ THROUGH `stripTags`, AND THE RAW FIGURE WOULD NOT CLOSE. Raw
 * fields hold 1,268 before and 1,269 after — a delta of ONE, not three,
 * because a `data-ref` carries Hebrew too and the unlink rules earlier
 * in this phase delete whole tags. The raw number is a true count of a
 * quantity no reader sees, and it would have this assertion silently
 * measuring another rule's deletions. */
it(
	'leaves all 1,052 mappiqs standing and adds exactly three',
	async () => {
		expect(census(await repairedEntries(), MAPPIQ).occurrences).toBe(1052);
		expect(census(await composedEntries(), MAPPIQ).occurrences).toBe(1055);
	},
	TIMEOUT,
);

/** THE DELTA, and the refusals named rather than counted. 13 of the 19
 * are corrected; the 6 that survive are the ones where the mark
 * announces nothing — 5 resh-dageshes with no vowel after them and 1
 * mid-word het-dagesh. Naming them is what stops this passing on a rule
 * that repaired six different ones. */
it(
	'corrects 13 and leaves the 6 the mark does not determine',
	async () => {
		const composed = await composedEntries();
		expect(census(composed, IMPOSSIBLE).occurrences).toBe(6);
		const survivors: string[] = [];
		for (const entry of composed) {
			for (const field of fieldsOf(entry)) {
				for (const _ of stripTags(field).matchAll(IMPOSSIBLE)) {
					survivors.push(entry.rid);
				}
			}
		}
		expect(survivors.toSorted()).toEqual([
			'A01756',
			'K00311',
			'Q00891',
			'R00344',
			'R00344',
			'R00346',
		]);
	},
	TIMEOUT,
);

it(
	'reproduces the vkh row at 11 against 17,254 correct',
	async () => {
		const repaired = await repairedEntries();
		expect(census(repaired, BARE_VKH)).toEqual({
			entries: 11,
			occurrences: 11,
		});
		expect(census(repaired, WHOLE_VKH).occurrences).toBe(17_254);
	},
	TIMEOUT,
);

/** THE DELTA. Every bare abbreviation gains its geresh, and the correct
 * population grows by exactly the eleven — so the rule moved members
 * from one side to the other rather than minting a twelfth. */
it(
	'restores all 11 geresh and grows the correct population by 11',
	async () => {
		const composed = await composedEntries();
		expect(census(composed, BARE_VKH).occurrences).toBe(0);
		expect(census(composed, WHOLE_VKH).occurrences).toBe(17_265);
	},
	TIMEOUT,
);
