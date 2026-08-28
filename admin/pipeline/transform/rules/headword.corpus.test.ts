import { expect, it } from 'bun:test';
import { census } from './headword-census.ts';

/**
 * Phase 2 batch 5's populations, asserted BEFORE any rule that repairs
 * them exists (plan Task 0, spec
 * `docs/specs/2026-08-27-headword-field-integrity-design.md` §2).
 *
 * The walk itself is in `headword-census.ts` and runs once; everything
 * here is arithmetic over its result. EXPLICIT TIMEOUT on the first
 * `it`, which is the one that pays for the walk — the convention
 * `anaphora.test.ts` records, where a corpus pass on bun's 5,000ms
 * default failed intermittently on whichever test lost the race, a
 * false red that trains a reader to re-run rather than look.
 */

// ------------------------------------------------- the five populations

it('reproduces every batch-5 catalogued count', async () => {
	const c = await census();
	// The walk completes in well under a second, which is fast enough to
	// be worth distrusting: a loader that yielded nothing would make
	// every count below 0, and a partial read would make them merely
	// wrong. Assert the denominator first, so a silent under-read fails
	// here rather than surfacing later as a "corrected" count.
	expect(c.corpusEntries).toBe(32_512);
	expect({
		abbrevFusedHeadword: c.fusedHeadwords,
		abbrevHeadwordStub: c.headwordStubs,
		genderPairCollapse: c.dupEntries,
		parenthesizedAltHeadword: c.parenEntries,
		phraseAltHeadwordStub: c.strictPhraseEntries,
	}).toEqual({
		abbrevFusedHeadword: 7,
		abbrevHeadwordStub: 34,
		genderPairCollapse: 22,
		parenthesizedAltHeadword: 580,
		phraseAltHeadwordStub: 236,
	});
	expect(c.parenOccurrences).toBe(654);
	expect(c.strictPhraseOccurrences).toBe(244);
	expect(c.dupWithMorphologyF).toBe(21);
}, 180_000);

/** The stub count is 55 − 21, and both operands are asserted. The 21
 * are the one-letter alphabet and numeral articles (`א׳`, `ב׳` … `ת׳`),
 * genuine lexemes rather than truncations; a predicate that forgot to
 * exclude them would report 55 and file 21 real headwords as defects. */
it('derives the headword-stub count as a stated subtraction', async () => {
	const c = await census();
	expect({
		articles: c.headwordAlphabetArticles,
		stubs: c.headwordStubs,
		total: c.headwordGereshTotal,
	}).toEqual({ articles: 21, stubs: 34, total: 55 });
	expect(c.headwordAlphabetArticles + c.headwordStubs).toBe(
		c.headwordGereshTotal,
	);
});

// ------------------------------------------- the phrase discriminator

/**
 * The naive predicate is wrong by 175 occurrences, and this test says
 * so in the shape of the mistake rather than in the shape of the fix.
 * Delete the Roman-mark exclusion from the rule and the population
 * becomes 410 / 419 — the extra 174 entries are single-word stubs the
 * parent audit classified as its JOB 1, for which *"no deterministic
 * expansion rule was found"*. A rule that expanded them would be
 * inventing spellings, so this is the boundary between batch 5 and a
 * row that lives on the judgment route.
 */
it('excludes Roman homograph marks, and records what that excludes', async () => {
	const c = await census();
	expect({
		naiveEntries: c.naivePhraseEntries,
		naiveOccurrences: c.naivePhraseOccurrences,
		strictEntries: c.strictPhraseEntries,
		strictOccurrences: c.strictPhraseOccurrences,
	}).toEqual({
		naiveEntries: 410,
		naiveOccurrences: 419,
		strictEntries: 236,
		strictOccurrences: 244,
	});
	expect(c.romanMarkShapes).toEqual({ I: 92, II: 77, III: 5, IV: 1 });
	const excluded = Object.values(c.romanMarkShapes).reduce((a, b) => a + b, 0);
	expect(c.naivePhraseOccurrences - excluded).toBe(c.strictPhraseOccurrences);
});

// ------------------------------------------------ the paren taxonomy

/**
 * SEVEN BUCKETS, AND THEY PARTITION THE POPULATION. `unbucketed` is
 * asserted empty and the seven sum to `parenOccurrences`, so a paren
 * shape nobody anticipated fails this test rather than falling into a
 * default branch — which is how `parenthesized-alt-headword` came to be
 * described as *"sometimes unclosed"* in the first place.
 */
it('partitions the 654 paren occurrences into seven shapes', async () => {
	const c = await census();
	expect(c.unbucketed).toEqual([]);
	const buckets = {
		closeOnly: c.closeOnly,
		interiorOptional: c.interiorOptional,
		markedWrapped: c.markedWrapped,
		openOnly: c.openOnly,
		starredWrapped: c.starredWrapped,
		strayClose: c.strayClose,
		wrappedWhole: c.wrappedWhole,
	};
	expect(buckets).toEqual({
		closeOnly: 81,
		interiorOptional: 1,
		markedWrapped: 5,
		openOnly: 84,
		starredWrapped: 18,
		strayClose: 1,
		wrappedWhole: 464,
	});
	expect(Object.values(buckets).reduce((a, b) => a + b, 0)).toBe(
		c.parenOccurrences,
	);
});

/**
 * The batch's central finding, as a test. The catalogue calls these
 * items *"sometimes unclosed"*; 69 of the 84 open-only items pair with
 * a later close-only item in the SAME array, which means they were
 * never unclosed — one print group was torn at its internal comma by
 * the upstream split, and the delimiters stayed with the fragments.
 * A00083 is canonical: `['(אַבְזָקָא', 'אַבְזָקָה)']`.
 *
 * 17 of the 69 span one or two intervening items, and those items are
 * inside the parentheses too (`['(דיסגנים', 'דיסגניס', 'דיסקניס)']`),
 * which is why the pairing is nearest-unconsumed rather than adjacency.
 */
it('pairs 69 of 84 open-only items with a later close', async () => {
	const c = await census();
	expect({
		orphanClose: c.orphanClose,
		orphanOpen: c.orphanOpen,
		pairedAdjacent: c.pairedAdjacent,
		pairedNonAdjacent: c.pairedNonAdjacent,
	}).toEqual({
		orphanClose: 12,
		orphanOpen: 15,
		pairedAdjacent: 52,
		pairedNonAdjacent: 17,
	});
	const paired = c.pairedAdjacent + c.pairedNonAdjacent;
	expect(paired + c.orphanOpen).toBe(c.openOnly);
	expect(paired + c.orphanClose).toBe(c.closeOnly);
});

// -------------------------------------------------- safety negatives

/**
 * `gender-pair-headword-line-collapse` is DEFINED by a duplicate string
 * in `alt_headwords`. If stripping parens could produce a second copy
 * of a sibling item, rule 1 would manufacture members of rule 4's
 * population — the collision batch 3b found four times and gated zero
 * times. Measured over all 8,673 entries carrying the field: it cannot.
 *
 * `emptyAfterStrip` discharges a second risk in the same walk. v2's
 * form object is `text` with `minLength: 1`, so an item stripping to
 * `''` would migrate into a schema violation.
 */
it('stripping parens creates no duplicate and empties no item', async () => {
	const c = await census();
	expect({
		altEntries: c.altEntries,
		dupBefore: c.dupEntries,
		emptyAfterStrip: c.emptyAfterStrip,
		newDupAfterStrip: c.newDupAfterStrip,
	}).toEqual({
		altEntries: 8673,
		dupBefore: 22,
		emptyAfterStrip: 0,
		newDupAfterStrip: 0,
	});
});

/**
 * FORWARD HAZARD for whoever writes `migrate.ts`, pinned as a test
 * rather than left in a paragraph. Every starred `alt_headwords` item
 * in the corpus also carries parentheses — `*(אוּסְיָא)` — and they are
 * the same 18 the data architecture reports as *"529 Roman, 18
 * starred"*. After batch 5 all 18 become bare `*X`, a shape the source
 * has never held. A reconstructed-mark decomposer written to `^\*`
 * works either way; one written to the observed `*(` shape would
 * silently stop marking all 18.
 */
it('every starred alt-headword also carries parens, all 18', async () => {
	const c = await census();
	expect({
		entries: c.starredEntries,
		occurrences: c.starredOccurrences,
		withParen: c.starredWithParen,
	}).toEqual({ entries: 18, occurrences: 18, withParen: 18 });
	expect(c.starredWithParen).toBe(c.starredWrapped);
});
