/**
 * `holamMaterMigration` over the whole corpus.
 *
 * ## Why this file carries the whole safety argument
 *
 * The rule MOVES a codepoint, so the multiset is identical on both
 * sides and `checkNoNewText` returns clean whatever it does — the only
 * rule in the registry that gate cannot see. `link-target.ts` case 9
 * verifies the CLASS of edit against each entry's own input and has no
 * corpus to ask about existence. Everything else is here:
 *
 * | Question | §  |
 * |---|---|
 * | Is the population what the row says? | 1 |
 * | Did the repair actually happen? | 2 |
 * | Does it merge two entries? | 3 |
 * | Is the one exception the only one? | 4 |
 * | Does any link stop resolving? | 5 |
 *
 * ## Two stages, and the difference between them is not noise
 *
 * Counts are reported at BOTH the raw-field stage and through
 * `stripTags`, because the two answer different questions. The rule
 * rewrites raw fields, `data-ref` and `href` included, so the raw count
 * is its workload; the reader sees stripped text, so the stripped count
 * is the harm ([[feedback_rendered_harm_rule]]). On stripped text the
 * accounting closes exactly — 565 before, 1 after, and the 1 is the
 * headword §4 holds back.
 */
import { expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { fieldsOf, stripTags } from '../no-new-text.ts';
import { composedEntries, repairedEntries } from './corpus-fixture.ts';
import { COLLIDING_HEADWORD, migrateHolam } from './holam-mater.ts';

const TIMEOUT = 120_000;

/** The defect: a consonant carrying a holam before an UNPOINTED vav. */
const MIGRATED =
	/[\u05D0-\u05EA][\u05B0-\u05B8\u05BA-\u05BC\u05BF\u05C1\u05C2\u05C7]*\u05B9[\u05B0-\u05B8\u05BA-\u05BC\u05BF\u05C1\u05C2\u05C7]*\u05D5(?![\u0591-\u05C7])/gu;
/** The correct encoding, for the null model. */
const CANONICAL =
	/[\u05D0-\u05EA][\u05B0-\u05B8\u05BA-\u05BC\u05BF\u05C1\u05C2\u05C7]*\u05D5\u05B9/gu;
const ANCHOR = /<a\b[^>]*>/gu;
const DATA_REF = /data-ref="([^"]*)"/u;
/** A target's headword: the work stripped, and the homograph index or
 * roman numeral the linker appends dropped. */
const LOCUS = /\s+(?:[IVX]+|\d+)$/u;

interface Census {
	entries: number;
	occurrences: number;
}

/** Migrated holams in `entries`, raw or through `stripTags`. */
function census(entries: readonly SourceEntry[], strip: boolean): Census {
	let occurrences = 0;
	let hit = 0;
	for (const entry of entries) {
		const before = occurrences;
		for (const field of fieldsOf(entry)) {
			const text = strip ? stripTags(field) : field;
			occurrences += [...text.matchAll(MIGRATED)].length;
		}
		if (occurrences > before) {
			hit += 1;
		}
	}
	return { entries: hit, occurrences };
}

it(
	'reproduces the row at 1,007 raw and 565 the reader can see',
	async () => {
		const repaired = await repairedEntries();
		expect(census(repaired, false)).toEqual({
			entries: 457,
			occurrences: 1007,
		});
		expect(census(repaired, true)).toEqual({ entries: 309, occurrences: 565 });
	},
	TIMEOUT,
);

// THE NULL MODEL. 43,664 holam males are already encoded correctly, so
// the defect is 2.3% of the population rather than a convention. If a
// re-fetch ever changes that ratio this file fails before the rule
// ships anything.
it(
	'measures the defect against 43,664 correct holam males',
	async () => {
		let correct = 0;
		for (const entry of await repairedEntries()) {
			for (const field of fieldsOf(entry)) {
				correct += [...field.matchAll(CANONICAL)].length;
			}
		}
		expect(correct).toBe(43_664);
	},
	TIMEOUT,
);

/** §2. A DEFECT-COUNT DELTA, not an invariant — the one shape that can
 * fail when the rule regresses. The survivor is the headword §4 holds
 * back, and asserting the count without asserting WHICH would pass on a
 * rule that repaired that headword and missed a different one. */
it(
	'leaves exactly one migrated holam, and it is the refused headword',
	async () => {
		const composed = await composedEntries();
		expect(census(composed, false)).toEqual({ entries: 1, occurrences: 1 });
		// `String.match` rather than `RegExp.test`: `test` on a `/g`
		// pattern leaves `lastIndex` advanced, so a hoisted regex asked
		// once per field answers later questions from the middle of an
		// earlier string. The rules carry the same note.
		const survivors = composed.filter((entry) =>
			fieldsOf(entry).some((field) => field.match(MIGRATED) !== null),
		);
		expect(survivors.map((entry) => entry.rid)).toEqual(['T00796']);
		expect(survivors[0]?.headword).toBe(COLLIDING_HEADWORD);
	},
	TIMEOUT,
);

/** §3. THE NAMESPACE. Every headword is distinct before the rule and
 * must still be distinct after it — [[feedback_headword_is_a_namespace]].
 * A merge would leave `Jastrow, <headword> 1` naming neither entry. */
it(
	'leaves all 32,512 headwords distinct',
	async () => {
		const composed = await composedEntries();
		expect(new Set(composed.map((entry) => entry.headword)).size).toBe(
			composed.length,
		);
	},
	TIMEOUT,
);

/** §4. THE EXCEPTION, RE-DERIVED. The rule freezes one headword because
 * a rule cannot see the corpus. This recomputes the set from the live
 * snapshot: repair every headword, and report any that lands on another
 * entry's. Exactly one, and it is the one the rule names.
 *
 * Without this the frozen constant is a claim nothing checks, and the
 * day a re-fetch adds a second collision the rule would repair it
 * silently. */
it(
	'names every headword whose repair would collide, and there is one',
	async () => {
		const repaired = await repairedEntries();
		const taken = new Set(repaired.map((entry) => entry.headword));
		const colliding = repaired.filter((entry) => {
			const fixed = migrateHolam(entry.headword);
			return fixed !== null && taken.has(fixed);
		});
		expect(colliding.map((entry) => entry.rid)).toEqual(['T00796']);
		expect(colliding[0]?.headword).toBe(COLLIDING_HEADWORD);
	},
	TIMEOUT,
);

/** §5. THE LINKS, and the reason this is an absolute rather than a
 * delta. The rule rewrites both sides of every internal reference it
 * touches, so a before/after comparison is blind to it by construction
 * — [[feedback_headword_is_a_namespace]] again. What is NOT blind is
 * the absolute count of internal anchors naming a headword no entry
 * has: 25 over 6 distinct targets, every one of them pre-existing and
 * none of them this rule's. */
it(
	'leaves 25 unresolved internal anchors over 6 distinct targets',
	async () => {
		const composed = await composedEntries();
		const known = new Set(composed.map((entry) => entry.headword));
		let unresolved = 0;
		const distinct = new Set<string>();
		for (const entry of composed) {
			for (const field of fieldsOf(entry)) {
				for (const tag of field.matchAll(ANCHOR)) {
					const ref = DATA_REF.exec(tag[0])?.[1];
					if (ref === undefined || !ref.startsWith('Jastrow,')) {
						continue;
					}
					const headword = ref.slice('Jastrow, '.length).replace(LOCUS, '');
					if (!known.has(headword)) {
						unresolved += 1;
						distinct.add(ref);
					}
				}
			}
		}
		expect({ distinct: distinct.size, unresolved }).toEqual({
			distinct: 6,
			unresolved: 25,
		});
	},
	TIMEOUT,
);
