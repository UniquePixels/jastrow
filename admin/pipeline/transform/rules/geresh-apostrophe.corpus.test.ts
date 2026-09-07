/**
 * `gereshApostropheGershayim` over the whole corpus.
 *
 * The row needs four things asserted rather than argued: the
 * population it claims, the two clauses that scope it, the delta the
 * rule actually produces, and the corpus fact its `allows` rests on.
 *
 * It touches NO link target and NO headword — 0 of 25 occurrences sit
 * inside a tag — so none of the case-9 machinery its family's
 * tag-locus sibling needs applies here.
 */
import { expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { fieldsOf, stripTags } from '../no-new-text.ts';
import { composedEntries, repairedEntries } from './corpus-fixture.ts';
import { gereshApostropheGershayim } from './geresh-apostrophe.ts';

const TIMEOUT = 120_000;

/** The defect: geresh, ASCII apostrophe, Hebrew either side. */
const FLANKED = /(?<=[֐-ׇא-ת]̇*)׳'(?=[֐-ׇא-ת])/gu;
/** The same two-codepoint run with NO flanking requirement — the
 * clause's own null model. */
const BARE_RUN = /׳'/gu;
/** The mark the rule writes, and the one no input may hold. */
const GERSHAYIM = /״/gu;
/** A plain geresh abbreviation — the ambient the rule must not touch. */
const PLAIN_GERESH = /׳/gu;

/** How many times `pattern` matches, and in how many entries. `read`
 * chooses the basis: `stripTags` for document text, identity for the
 * raw field including tag interiors. */
function census(
	entries: readonly SourceEntry[],
	pattern: RegExp,
	read: (field: string) => string = stripTags,
): { entries: number; occurrences: number } {
	let occurrences = 0;
	let hit = 0;
	for (const entry of entries) {
		const before = occurrences;
		for (const field of fieldsOf(entry)) {
			occurrences += [...read(field).matchAll(pattern)].length;
		}
		if (occurrences > before) {
			hit += 1;
		}
	}
	return { entries: hit, occurrences };
}

it(
	'the population is 25 occurrences across 20 entries',
	async () => {
		const repaired = await repairedEntries();
		expect(census(repaired, FLANKED)).toEqual({
			entries: 20,
			occurrences: 25,
		});
	},
	TIMEOUT,
);

it(
	'both scoping clauses are free today, and the module says so',
	async () => {
		const repaired = await repairedEntries();
		// The flanking clause separates nothing: the unguarded run finds
		// exactly the same 25. This is the module's own claim, asserted
		// rather than restated — if a re-fetch ever puts the run beside a
		// Latin token, this test fails and the docstring is wrong.
		expect(census(repaired, BARE_RUN).occurrences).toBe(25);
		// Nor does the tag mask: reading raw fields, tag interiors
		// included, still finds 25 and not one more.
		expect(census(repaired, BARE_RUN, (field) => field).occurrences).toBe(25);
	},
	TIMEOUT,
);

it(
	'the rule takes all 25, and the composed phase leaves none',
	async () => {
		const repaired = await repairedEntries();
		let occurrences = 0;
		let touched = 0;
		for (const entry of repaired) {
			const result = gereshApostropheGershayim.apply(entry);
			if (result.records.length === 0) {
				continue;
			}
			touched += 1;
			occurrences += result.removes?.length ?? 0;
		}
		expect({ entries: touched, occurrences }).toEqual({
			entries: 20,
			occurrences: 25,
		});
		// The delta that matters: after the whole `text-repairs` phase,
		// the defect is gone from the corpus. A rule can fire 25 times and
		// still leave the population standing if a later rule undoes it.
		const composed = await composedEntries();
		expect(census(composed, FLANKED).occurrences).toBe(0);
		expect(census(composed, BARE_RUN, (field) => field).occurrences).toBe(0);
	},
	TIMEOUT,
);

it(
	'the ambient geresh is untouched, and the delta is attributable',
	async () => {
		const repaired = await repairedEntries();
		// The null model, and BOTH BASES are stated because they differ:
		// 65,702 plain gereshes in the raw fields, 64,254 through
		// `stripTags`, the 1,448 between them living inside `data-ref`
		// and `href` attributes that also carry Hebrew. A control quoted
		// without its basis is the failure `phase-2-asterisk-exposure.md`
		// records for its own first cut.
		expect(census(repaired, PLAIN_GERESH, (field) => field).occurrences).toBe(
			65_702,
		);
		expect(census(repaired, PLAIN_GERESH).occurrences).toBe(64_254);

		// MEASURED AGAINST THIS RULE ALONE, not against the composed
		// phase. An earlier cut of this test asserted the composed delta
		// and read 64,413 where it expected 65,677: `vkhGereshRestore`
		// MINTS eleven gereshes in the same phase and the geresh link
		// rules rewrite attributes carrying more, so a composed geresh
		// count is not this rule's to claim. Running the rule alone is
		// what makes the 25 attributable.
		const alone = repaired.map(
			(entry) => gereshApostropheGershayim.apply(entry).entry,
		);
		expect(census(alone, PLAIN_GERESH, (field) => field).occurrences).toBe(
			65_702 - 25,
		);
		expect(census(alone, PLAIN_GERESH).occurrences).toBe(64_254 - 25);
		// And it writes exactly as many gershayim as it removed runs.
		expect(census(alone, GERSHAYIM, (field) => field).occurrences).toBe(25);

		// The corpus fact `allows` is checkable against: no input field
		// holds a U+05F4, so every one above was written by this call.
		expect(census(repaired, GERSHAYIM, (field) => field).occurrences).toBe(0);
	},
	TIMEOUT,
);
