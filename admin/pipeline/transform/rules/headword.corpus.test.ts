import { expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import { applyTransforms } from '../run.ts';
import {
	abbrevFusedHeadword,
	genderPairAltDuplicate,
	parenAltHeadword,
	phraseAltHeadwordStub,
} from './headword.ts';
import { census } from './headword-census.ts';

/** Hoisted per `lint/performance/useTopLevelRegex`; no `g`, so the
 * shared literal keeps no `lastIndex` between `.test()` calls. */
const PAREN = /[()]/u;
const GERESH = '׳';
const ROMAN_MARK = /^[IVXLC]+$/u;
const WHITESPACE_SPLIT = /\s+/u;

/** The phrase row's predicate, spelled independently of the rule so the
 * "what did it refuse" assertions measure the POPULATION rather than
 * the rule's own opinion of it. */
const isPhraseStub = (item: string): boolean => {
	const trimmed = item.trim();
	return (
		trimmed.includes(GERESH) &&
		trimmed.split(WHITESPACE_SPLIT).filter((t) => !ROMAN_MARK.test(t)).length >=
			2
	);
};

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

// ------------------------------------------- the rule against the corpus

/**
 * `parenAltHeadword` over all 32,512 entries, THROUGH THE GATES.
 * `applyTransforms` runs `checkNoNewText` on every call and throws on a
 * problem, so this walk is the real thing rather than a re-derivation
 * of the rule's own logic — the distinction that matters, because the
 * rule's whole safety argument is that it only ever deletes.
 *
 * 652 of the 654 occurrences repaired and 2 refused. The refusals are
 * asserted BY RID here while the rule selects them BY SHAPE, so a
 * predicate that crept wider or narrower fails this test rather than
 * silently changing what ships.
 *
 * **THE ENTRY COUNT IS 579, AGAINST A CATALOGUED 580, AND BOTH ARE
 * RIGHT.** The row's population is 580 entries carrying the shape; the
 * rule fires on 579 because `A01480`'s ONLY paren occurrence is one of
 * the two refusals, so that entry produces no record. `A01394` still
 * counts — one of its items is refused and another is repaired.
 *
 * `bun transform:count` measures entries with a non-empty `records` and
 * will therefore report `DELTA -1` for this row, permanently. That is a
 * FINDING carried in the row's `reason`, not a number to suppress: the
 * alternative — writing 579 into `corpusCount` — would assert that only
 * 579 entries carry the defect, and the 580th carries it just as
 * visibly (a lookup key rendering as `אִיסְפְּלָנִית(א)`). It needs a
 * different operation, not a different count. Same shape as batch 4's
 * `citation-number-truncated-outside-anchor`, where the audit harness
 * and the migration disagreed and neither was wrong.
 */
it('repairs 652 paren occurrences and refuses exactly two', async () => {
	let repaired = 0;
	let entries = 0;
	const survivors: string[] = [];
	for await (const source of readSourceEntries()) {
		const out = applyTransforms(source, 'text-repairs', [parenAltHeadword]);
		if (out.records.length > 0) {
			entries += 1;
			repaired += out.records.length;
		}
		for (const item of out.entry.alt_headwords ?? []) {
			if (PAREN.test(item)) {
				survivors.push(source.rid);
			}
		}
	}
	expect({ entries, repaired, survivors }).toEqual({
		entries: 579,
		repaired: 652,
		survivors: ['A01394', 'A01480'],
	});
}, 180_000);

/**
 * The two safety negatives of spec §3.5, re-measured on the RULE's
 * output rather than on the census's blanket strip. The census figure
 * is an upper bound; this is the thing that actually ships.
 *
 * A duplicate created here would manufacture members of
 * `gender-pair-headword-line-collapse`'s population — the collision
 * batch 3b found four times and gated zero times. An emptied item would
 * migrate into a `formObject` whose `text` is `minLength: 1`.
 */
const tallyOutput = (
	before: readonly string[],
	after: readonly string[],
): { bare: number; emptied: number; newDuplicate: number } => ({
	bare: after.filter((item) => item.startsWith('*') && !PAREN.test(item))
		.length,
	emptied: after.some((item) => item.length === 0) ? 1 : 0,
	newDuplicate:
		new Set(after).size !== after.length &&
		new Set(before).size === before.length
			? 1
			: 0,
});

it('creates no duplicate and empties no item, on the rule output', async () => {
	let newDuplicates = 0;
	let emptied = 0;
	let starredBare = 0;
	for await (const source of readSourceEntries()) {
		const before = source.alt_headwords ?? [];
		if (before.length === 0) {
			continue;
		}
		const after =
			applyTransforms(source, 'text-repairs', [parenAltHeadword]).entry
				.alt_headwords ?? [];
		const tally = tallyOutput(before, after);
		emptied += tally.emptied;
		newDuplicates += tally.newDuplicate;
		starredBare += tally.bare;
	}
	// `starredBare` is the §3.3 forward hazard closing: 0 bare `*X` alts
	// exist in the source and 18 exist after this rule, which is the
	// shape `migrate.ts`'s reconstructed-mark decomposer will meet.
	expect({ emptied, newDuplicates, starredBare }).toEqual({
		emptied: 0,
		newDuplicates: 0,
		starredBare: 18,
	});
}, 180_000);

/**
 * `phraseAltHeadwordStub` over the corpus, THROUGH THE GATES —
 * `applyTransforms` runs `checkNoNewText` on every call, so all 235
 * `copied` declarations are verified against their own entry's input
 * here rather than merely declared.
 *
 * **235 OCCURRENCES / 228 ENTRIES AGAINST A CATALOGUED 244 / 236, AND
 * THE SHORTFALL IS THE POINT.** The row's population is 244; the rule
 * repairs what it can lawfully repair and refuses 9. Seven of the nine
 * are the pointing conflicts and ambiguities on `expandStub`; the other
 * two need the paren rule to run first (below). `bun transform:count`
 * measures rules ALONE and will therefore report `DELTA -8` on entries
 * for this row, permanently and by design.
 */
it('expands 235 phrase stubs alone, refusing nine', async () => {
	let entries = 0;
	let occurrences = 0;
	const refused: string[] = [];
	for await (const source of readSourceEntries()) {
		const out = applyTransforms(source, 'text-repairs', [
			phraseAltHeadwordStub,
		]);
		if (out.records.length > 0) {
			entries += 1;
			occurrences += out.records.length;
		}
		for (const item of out.entry.alt_headwords ?? []) {
			if (isPhraseStub(item)) {
				refused.push(source.rid);
			}
		}
	}
	expect({ entries, occurrences, refused }).toEqual({
		entries: 228,
		occurrences: 235,
		refused: [
			'A02403',
			'B00780',
			'D01080',
			'H00247',
			'M00643',
			'Q01399',
			'T00566',
			'U01905',
			'V00924',
		],
	});
}, 180_000);

/**
 * **THE TWO RULES DO NOT COMMUTE, AND THE SPEC SAID THEY WOULD.**
 * §1 claimed this batch adds no `entangledWith` edge, on the reasoning
 * that its rules touch fields no shipped rule touches. That reasoning
 * was about OTHER rules and never checked the batch's own pair.
 *
 * `B00780` carries `'(עֵין ב׳)'`. Phrase-first cannot see it: the stub
 * token is `'ב׳)'`, and `expandStub` refuses anything following the
 * geresh. Paren-first strips the delimiters, and the same item then
 * expands normally. `A02403`'s `'אסת׳ )'` moves the other way — the
 * strip leaves a single token, so it LEAVES the phrase population
 * rather than entering it.
 *
 * So `parenthesized-alt-headword` must register STRICTLY BEFORE
 * `phrase-alt-headword-stub`, the edge is declared in the catalogue,
 * and `checkAdjacency()` holds them gap-free. Pinned here in the shape
 * of the disagreement, not just as the winning order — a later reorder
 * fails with the reason attached.
 */
it('the paren rule must run first, and the orders disagree', async () => {
	const tally = async (
		rules: readonly [typeof parenAltHeadword, typeof parenAltHeadword],
	): Promise<{ paren: number; phrase: number }> => {
		let paren = 0;
		let phrase = 0;
		for await (const source of readSourceEntries()) {
			for (const record of applyTransforms(source, 'text-repairs', rules)
				.records) {
				if (record.ruleId === 'phrase-alt-headword-stub') {
					phrase += 1;
				} else {
					paren += 1;
				}
			}
		}
		return { paren, phrase };
	};
	const first = await tally([parenAltHeadword, phraseAltHeadwordStub]);
	const second = await tally([phraseAltHeadwordStub, parenAltHeadword]);
	expect(first).toEqual({ paren: 652, phrase: 236 });
	expect(second).toEqual({ paren: 652, phrase: 235 });
	expect(first.phrase).toBeGreaterThan(second.phrase);
}, 180_000);

/**
 * The two small rules over the corpus, through the gates. Both counts
 * reproduce their catalogued figures exactly — 6 of `abbrev-fused-
 * headword`'s 7 plus the one refusal, and all 22 of the duplicate row.
 *
 * `morphologyChanged: 0` is the guard on a decision, not a
 * description of one: 21 of the 22 carry a `'f.'` that is wrong about
 * the headword, and the rule leaves it because `'m.'` is text the entry
 * does not hold (spec §5.4, §7.3).
 */
it('repairs 6 fused headwords and 22 duplicate arrays', async () => {
	let fusedRecords = 0;
	let duplicateRecords = 0;
	let morphologyChanged = 0;
	const fusedLeft: string[] = [];
	for await (const source of readSourceEntries()) {
		const out = applyTransforms(source, 'text-repairs', [
			abbrevFusedHeadword,
			genderPairAltDuplicate,
		]);
		for (const record of out.records) {
			if (record.ruleId === 'abbrev-fused-headword') {
				fusedRecords += 1;
			} else {
				duplicateRecords += 1;
			}
		}
		if (out.entry.content.morphology !== source.content.morphology) {
			morphologyChanged += 1;
		}
		const headword = out.entry.headword.trim();
		if (headword.includes(GERESH) && WHITESPACE_SPLIT.test(headword)) {
			fusedLeft.push(source.rid);
		}
	}
	expect({
		duplicateRecords,
		fusedLeft,
		fusedRecords,
		morphologyChanged,
	}).toEqual({
		duplicateRecords: 22,
		fusedLeft: ['A02002'],
		fusedRecords: 6,
		morphologyChanged: 0,
	});
}, 180_000);

/**
 * **FORWARD HAZARD, MEASURED.** The data architecture's §5 gate walks
 * the `prev_hw`/`next_hw` chain and compares against `headword` AS A
 * STRING. `abbrevFusedHeadword` rewrites 6 headwords and touches no
 * neighbour's pointer, so 12 pointers — one on each side of each
 * repaired entry, perfectly uniform — now name a string no entry
 * carries. Batch 3a left 68 entries diverging the same way; this is
 * additive to that, not a repeat of it.
 *
 * Whoever writes `migrate.ts` must walk the SOURCE chain or de-map both
 * sides. Asserted rather than described so the number cannot rot.
 */
it('leaves exactly 12 stale prev_hw/next_hw pointers', async () => {
	// `SourceEntry` does not model the headword chain: `prev_hw` and
	// `next_hw` are in the JSONL and survive `readSourceEntries`, but the
	// TYPE the migration reads has no such properties. Read them through
	// a narrow structural type rather than widening a production type to
	// serve a test — and note that this absence is part of why the hazard
	// is easy to miss, since nothing in the type system points at the
	// chain the architecture's §5 gate walks.
	type Chained = { next_hw?: string; prev_hw?: string };
	const rewritten = new Map<string, string>();
	const pointers: string[] = [];
	for await (const source of readSourceEntries()) {
		const after = applyTransforms(source, 'text-repairs', [abbrevFusedHeadword])
			.entry.headword;
		if (after !== source.headword) {
			rewritten.set(source.headword, after);
		}
		const chained = source as Chained;
		for (const pointer of [chained.prev_hw, chained.next_hw]) {
			if (pointer !== undefined) {
				pointers.push(pointer);
			}
		}
	}
	expect(rewritten.size).toBe(6);
	expect(pointers.filter((p) => rewritten.has(p))).toHaveLength(12);
}, 180_000);
