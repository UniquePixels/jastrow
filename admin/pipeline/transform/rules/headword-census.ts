import { readSourceEntries } from '../../body/source.ts';
import { strip } from './headword.ts';

/**
 * The measurement basis for Phase 2 batch 5 (plan Task 0, spec
 * `docs/specs/2026-08-27-headword-field-integrity-design.md` §2).
 *
 * TEST TIER ONLY, in the same sense `count.ts` is. It exists so the
 * five catalogue populations are asserted BEFORE the rules that repair
 * them are written: batch 3b's hardest finding was a rule silently
 * claiming a different row's members, caught by a human reading a
 * sibling row's `reason` rather than by any gate.
 *
 * ONE WALK — a single memoised pass over the 32,512 entries, with the
 * assertions in `headword.corpus.test.ts` arithmetic over the result.
 * Batch 4's review raised three separate redundant-walk findings.
 */

const GERESH = '׳';
const HEBREW_LETTER = /[א-ת]/gu;
const ROMAN_MARK = /^[IVXLC]+$/u;
/** Hoisted to module scope for `useTopLevelRegex`. NONE of the
 * predicates carries `g`: a `g`-flagged literal shared across calls
 * keeps `lastIndex` between `.test()`s and would return alternating
 * answers for the same input. The two that do carry `g` are only ever
 * handed to `.replace` and `.match`, neither of which is stateful. */
const ANY_PAREN = /[()]/u;
const OPEN_PAREN = /\(/gu;
const CLOSE_PAREN = /\)/gu;
const WRAPPED_THEN_MARK = /\)\s*[IVXLC]+$/u;
const WHITESPACE = /\s/u;
const WHITESPACE_RUN = /\s+/u;

/**
 * The safety negatives below are measured against `parenAltHeadword`'s
 * ACTUAL strip, imported rather than copied. Task 0 shipped a copy
 * because this module preceded the rule by one commit; Task 2 replaced
 * it with this import, closing the drift hazard
 * `links.corpus.test.ts` records for `NEW_ATTR` — where a production
 * change and a test copy diverge and the test keeps passing while
 * measuring the wrong thing.
 *
 * NOTE the asymmetry, which is deliberate: the census applies the strip
 * to EVERY item, while the rule refuses two of them (spec §3.4). The
 * negatives are therefore an UPPER BOUND — if a blanket strip creates
 * no duplicate and empties no item, the refusing version cannot either.
 */

interface Census {
	altEntries: number;
	closeOnly: number;
	corpusEntries: number;
	dupEntries: number;
	dupWithMorphologyF: number;
	emptyAfterStrip: number;
	fusedHeadwords: number;
	headwordAlphabetArticles: number;
	headwordGereshTotal: number;
	headwordStubs: number;
	interiorOptional: number;
	markedWrapped: number;
	naivePhraseEntries: number;
	naivePhraseOccurrences: number;
	newDupAfterStrip: number;
	openOnly: number;
	orphanClose: number;
	orphanOpen: number;
	pairedAdjacent: number;
	pairedNonAdjacent: number;
	parenEntries: number;
	parenOccurrences: number;
	romanMarkShapes: Record<string, number>;
	starredEntries: number;
	starredOccurrences: number;
	starredWithParen: number;
	starredWrapped: number;
	strayClose: number;
	strictPhraseEntries: number;
	strictPhraseOccurrences: number;
	unbucketed: string[];
	wrappedWhole: number;
}

const zero = (): Census => ({
	altEntries: 0,
	closeOnly: 0,
	corpusEntries: 0,
	dupEntries: 0,
	dupWithMorphologyF: 0,
	emptyAfterStrip: 0,
	fusedHeadwords: 0,
	headwordAlphabetArticles: 0,
	headwordGereshTotal: 0,
	headwordStubs: 0,
	interiorOptional: 0,
	markedWrapped: 0,
	naivePhraseEntries: 0,
	naivePhraseOccurrences: 0,
	newDupAfterStrip: 0,
	openOnly: 0,
	orphanClose: 0,
	orphanOpen: 0,
	pairedAdjacent: 0,
	pairedNonAdjacent: 0,
	parenEntries: 0,
	parenOccurrences: 0,
	romanMarkShapes: {},
	starredEntries: 0,
	starredOccurrences: 0,
	starredWithParen: 0,
	starredWrapped: 0,
	strayClose: 0,
	strictPhraseEntries: 0,
	strictPhraseOccurrences: 0,
	unbucketed: [],
	wrappedWhole: 0,
});

/** The `headword`-field rows: the fused shape (whitespace AND geresh)
 * and the stub shape (geresh, no whitespace). The stub count is a
 * SUBTRACTION and both operands are recorded, because the row's
 * `reason` predicted both and a reader should see the exclusion rather
 * than only its result. */
function censusHeadword(c: Census, headword: string): void {
	if (!headword.includes(GERESH)) {
		return;
	}
	if (WHITESPACE.test(headword.trim())) {
		c.fusedHeadwords += 1;
		return;
	}
	c.headwordGereshTotal += 1;
	if ((headword.match(HEBREW_LETTER) ?? []).length === 1) {
		c.headwordAlphabetArticles += 1;
	} else {
		c.headwordStubs += 1;
	}
}

/** Items carrying exactly one delimiter of one kind. Split out of
 * `bucketParen` to keep both under the cognitive-complexity ceiling;
 * the split is by BALANCE, which is also the meaningful distinction —
 * an unbalanced item is half of something. */
function bucketUnbalanced(c: Census, item: string): boolean {
	const opens = (item.match(OPEN_PAREN) ?? []).length;
	const closes = (item.match(CLOSE_PAREN) ?? []).length;
	const trimmed = item.trim();
	if (opens === 1 && closes === 0 && trimmed.startsWith('(')) {
		c.openOnly += 1;
		return true;
	}
	if (opens !== 0 || closes !== 1) {
		return false;
	}
	if (trimmed.endsWith(')')) {
		c.closeOnly += 1;
	} else {
		c.strayClose += 1;
	}
	return true;
}

/** Items carrying one of each delimiter. */
function bucketBalanced(c: Census, item: string): boolean {
	const trimmed = item.trim();
	if (trimmed.startsWith('*(') && trimmed.endsWith(')')) {
		c.starredWrapped += 1;
		return true;
	}
	if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
		c.wrappedWhole += 1;
		return true;
	}
	if (trimmed.startsWith('(') && WRAPPED_THEN_MARK.test(trimmed)) {
		c.markedWrapped += 1;
		return true;
	}
	if (!trimmed.startsWith('(') && trimmed.endsWith(')')) {
		c.interiorOptional += 1;
		return true;
	}
	return false;
}

/** Bucket one paren-bearing item. Returns `false` when no bucket claims
 * it — the caller records the item, so the partition claim is
 * falsifiable rather than absorbed by a fallback branch. */
function bucketParen(c: Census, item: string): boolean {
	const opens = (item.match(OPEN_PAREN) ?? []).length;
	const closes = (item.match(CLOSE_PAREN) ?? []).length;
	if (opens === 1 && closes === 1) {
		return bucketBalanced(c, item);
	}
	return bucketUnbalanced(c, item);
}

/** Pair each open-only item with the nearest unconsumed close-only item
 * LATER in the same array. This is the claim spec §3.1 turns on: the
 * items the catalogue calls "unclosed" are mostly one print group torn
 * at its internal comma by the upstream split, with the delimiters left
 * on the fragments. 17 of the pairings span one or two intervening
 * items, which are inside the parentheses too, so the pairing is stated
 * as nearest-unconsumed rather than as adjacency. */
function censusPairing(c: Census, items: readonly string[]): void {
	const opens: number[] = [];
	const closes: number[] = [];
	items.forEach((item, index) => {
		const trimmed = item.trim();
		if (!ANY_PAREN.test(item)) {
			return;
		}
		if (!trimmed.includes(')') && trimmed.startsWith('(')) {
			opens.push(index);
		} else if (!trimmed.includes('(') && trimmed.endsWith(')')) {
			closes.push(index);
		}
	});
	const consumed = new Set<number>();
	for (const open of opens) {
		const close = closes.find((i) => i > open && !consumed.has(i));
		if (close === undefined) {
			c.orphanOpen += 1;
			continue;
		}
		consumed.add(close);
		if (close === open + 1) {
			c.pairedAdjacent += 1;
		} else {
			c.pairedNonAdjacent += 1;
		}
	}
	for (const close of closes) {
		if (!consumed.has(close)) {
			c.orphanClose += 1;
		}
	}
}

/** The phrase row, counted BOTH ways. The naive reading — geresh plus
 * whitespace — is the one a rule author reaches for first and it is
 * wrong by 175 occurrences; the excluded shapes are single-word stubs
 * carrying a Roman homograph numeral, which the parent audit already
 * classified as its job 1. Recording both readings makes the
 * discriminator a test rather than a footnote. */
function censusPhrase(c: Census, items: readonly string[]): void {
	let naive = false;
	let strict = false;
	for (const item of items) {
		const trimmed = item.trim();
		if (!(trimmed.includes(GERESH) && WHITESPACE.test(trimmed))) {
			continue;
		}
		c.naivePhraseOccurrences += 1;
		naive = true;
		const tokens = trimmed.split(WHITESPACE_RUN);
		if (tokens.filter((t) => !ROMAN_MARK.test(t)).length >= 2) {
			c.strictPhraseOccurrences += 1;
			strict = true;
			continue;
		}
		for (const mark of tokens.filter((t) => ROMAN_MARK.test(t))) {
			c.romanMarkShapes[mark] = (c.romanMarkShapes[mark] ?? 0) + 1;
		}
	}
	if (naive) {
		c.naivePhraseEntries += 1;
	}
	if (strict) {
		c.strictPhraseEntries += 1;
	}
}

/** The duplicate-string row and the two safety negatives rule 1 owes:
 * stripping must create no new duplicate (or it manufactures members of
 * the duplicate row's population) and must empty no item (or it
 * migrates into a `minLength: 1` schema violation). */
function censusAltSafety(
	c: Census,
	items: readonly string[],
	morphology: string | undefined,
): void {
	const distinct = new Set(items);
	if (distinct.size !== items.length) {
		c.dupEntries += 1;
		if (morphology === 'f.') {
			c.dupWithMorphologyF += 1;
		}
	}
	const stripped = items.map(strip);
	if (stripped.some((s) => s.length === 0)) {
		c.emptyAfterStrip += 1;
	}
	if (
		new Set(stripped).size !== stripped.length &&
		distinct.size === items.length
	) {
		c.newDupAfterStrip += 1;
	}
}

function censusMarks(c: Census, items: readonly string[]): void {
	let starred = false;
	let parenthesized = false;
	for (const item of items) {
		if (item.trim().startsWith('*')) {
			c.starredOccurrences += 1;
			starred = true;
			if (ANY_PAREN.test(item)) {
				c.starredWithParen += 1;
			}
		}
		if (!ANY_PAREN.test(item)) {
			continue;
		}
		parenthesized = true;
		c.parenOccurrences += 1;
		if (!bucketParen(c, item)) {
			c.unbucketed.push(JSON.stringify(item));
		}
	}
	if (starred) {
		c.starredEntries += 1;
	}
	if (parenthesized) {
		c.parenEntries += 1;
		censusPairing(c, items);
	}
}

let pending: Promise<Census> | undefined;

async function build(): Promise<Census> {
	const c = zero();
	for await (const entry of readSourceEntries()) {
		c.corpusEntries += 1;
		censusHeadword(c, entry.headword);
		const items = entry.alt_headwords ?? [];
		if (items.length === 0) {
			continue;
		}
		c.altEntries += 1;
		censusAltSafety(c, items, entry.content.morphology);
		censusMarks(c, items);
		censusPhrase(c, items);
	}
	return c;
}

/** Memoised so the walk runs once per process however many `it`s read
 * it. */
const census = (): Promise<Census> => {
	pending ??= build();
	return pending;
};

export type { Census };
export { census, strip };
