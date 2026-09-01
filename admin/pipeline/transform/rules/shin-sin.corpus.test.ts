/**
 * `shinSinDotRestore` over the whole corpus.
 *
 * ## What this file is for
 *
 * The rule carries a FROZEN TABLE, because a rule cannot see the corpus
 * and the evidence for every repair is a spelling somewhere else in it.
 * A frozen table is a claim nothing checks unless something re-derives
 * it, so §1 rebuilds all 23 rows from the live snapshot and §2 asserts
 * the property that makes a table a lookup rather than a choice: no key
 * has a second candidate.
 *
 * §3 pins the comparator the row is measured at, and §4 the delta.
 *
 * ## The comparator is the whole of the row's honesty
 *
 * A shin carrying a vowel or dagesh is dotted 32,014 times against 102,
 * so absence there is a defect. The proclitic ש־ is dotted about half
 * the time, so absence THERE is free variation and the naive count that
 * mixes them is meaningless. §3 asserts the first and nothing else.
 */
import { expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { fieldsOf, stripTags } from '../no-new-text.ts';
import { composedEntries, repairedEntries } from './corpus-fixture.ts';
import { TWINS } from './shin-sin.ts';

const TIMEOUT = 120_000;

/** A shin with everything attached to it. */
const SHIN = /ש(\p{Mn}*)/gu;
/** The two dots that identify the letter. */
const DOT = /[ׁׂ]/u;
/** A vowel or a dagesh — what makes a bare shin a DEFECT rather than an
 * ordinary unpointed letter. */
const VOWEL = /[ְ-ׇּֿ]/u;
/** A whole Hebrew word, for the vocabulary §1 derives the table from. */
const WORD = /[א-ת][א-ת\p{Mn}]*/gu;
/** Every dot in a word, for the twin test. */
const DOTS = /[ׁׂ]/gu;

/** Every distinct Hebrew word the corpus holds, read the way the rule
 * reads text. */
function vocabulary(entries: readonly SourceEntry[]): Set<string> {
	const found = new Set<string>();
	for (const entry of entries) {
		for (const field of fieldsOf(entry)) {
			for (const word of field.matchAll(WORD)) {
				found.add(word[0]);
			}
		}
	}
	return found;
}

/** Words holding a shin that carries a vowel or dagesh but no dot,
 * with how many times each occurs. */
function damaged(entries: readonly SourceEntry[]): Map<string, number> {
	const found = new Map<string, number>();
	for (const entry of entries) {
		for (const field of fieldsOf(entry)) {
			for (const word of field.matchAll(WORD)) {
				const bad = [...word[0].matchAll(SHIN)].some(
					(shin) => VOWEL.test(shin[1] ?? '') && !DOT.test(shin[1] ?? ''),
				);
				if (bad) {
					found.set(word[0], (found.get(word[0]) ?? 0) + 1);
				}
			}
		}
	}
	return found;
}

/** §1. THE TABLE, RE-DERIVED. For every damaged word, the corpus
 * spellings that differ from it by dots alone. */
it(
	'rebuilds all 23 frozen rows from the live snapshot',
	async () => {
		const repaired = await repairedEntries();
		const words = vocabulary(repaired);
		const rebuilt = new Map<string, string>();
		for (const word of damaged(repaired).keys()) {
			const twins = [...words].filter(
				(candidate) =>
					candidate !== word && candidate.replace(DOTS, '') === word,
			);
			if (twins.length === 1 && twins[0] !== undefined) {
				rebuilt.set(word, twins[0]);
			}
		}
		expect([...rebuilt].toSorted()).toEqual([...TWINS].toSorted());
	},
	TIMEOUT,
);

/** §2. NO KEY HAS TWO CANDIDATES, and this is what separates a lookup
 * from a choice. A word with two attested dotted spellings would have
 * the RULE deciding between שׁ and שׂ, which is the reconstruction
 * [[project_no_vowel_inference]] rules out — and
 * [[feedback_determinable_is_not_verifiable]] is about exactly this
 * distinction. Measured zero. */
it(
	'finds no damaged word with a second attested twin',
	async () => {
		const repaired = await repairedEntries();
		const words = vocabulary(repaired);
		const ambiguous = [...damaged(repaired).keys()].filter(
			(word) =>
				[...words].filter(
					(candidate) =>
						candidate !== word && candidate.replace(DOTS, '') === word,
				).length > 1,
		);
		expect(ambiguous).toEqual([]);
	},
	TIMEOUT,
);

/** §3. THE COMPARATOR: a shin that carries a vowel or a dagesh. 102
 * bare against 32,014 dotted, 99.68%.
 *
 * ASSERTED HERE AND NOWHERE ELSE, because a count that mixed
 * comparators would be meaningless rather than merely large. A shin in
 * the PROCLITIC position — the relative ש־ before a pointed word —
 * carries no dot most of the time, and that is free variation, not
 * damage. Any figure that pools the two says nothing about either. */
it(
	'measures 102 bare against 32,014 dotted at the pointed comparator',
	async () => {
		let bare = 0;
		let dotted = 0;
		for (const entry of await repairedEntries()) {
			for (const field of fieldsOf(entry)) {
				for (const shin of field.matchAll(SHIN)) {
					const marks = shin[1] ?? '';
					if (!VOWEL.test(marks)) {
						continue;
					}
					if (DOT.test(marks)) {
						dotted += 1;
					} else {
						bare += 1;
					}
				}
			}
		}
		expect({ bare, dotted }).toEqual({ bare: 102, dotted: 32_014 });
	},
	TIMEOUT,
);

/** §4. THE DELTA, at the unit the reader sees. In stripped text the
 * accounting closes exactly: 64 damaged occurrences before, 38 after,
 * and the 26 taken are precisely the table-key occurrences. The other
 * 38 have no attested twin and stay on the row.
 *
 * Raw fields carry more of both — 102 and 52 — because a `data-ref`
 * holds Hebrew too; the reader-visible figure is the one that says
 * whether the defect was repaired ([[feedback_rendered_harm_rule]]). */
it(
	'repairs 26 of 64 reader-visible occurrences and leaves 38 witnessed by nothing',
	async () => {
		const count = (entries: readonly SourceEntry[]): number => {
			let bare = 0;
			for (const entry of entries) {
				for (const field of fieldsOf(entry)) {
					for (const shin of stripTags(field).matchAll(SHIN)) {
						const marks = shin[1] ?? '';
						if (VOWEL.test(marks) && !DOT.test(marks)) {
							bare += 1;
						}
					}
				}
			}
			return bare;
		};
		expect(count(await repairedEntries())).toBe(64);
		expect(count(await composedEntries())).toBe(38);
	},
	TIMEOUT,
);
