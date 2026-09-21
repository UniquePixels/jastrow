/**
 * The commutation gate (batch-4 spec §3.3).
 *
 * `checkAdjacency()` enforces one direction — a pair the catalogue
 * DECLARES entangled must sit gap-free in the registry. Nothing
 * enforced the other: a pair that BEHAVES as entangled must be
 * declared. Without this gate that direction rests on a human
 * noticing, from a sibling row's `reason`, that two rules claim the
 * same members.
 *
 * Two rules contend for the same bytes exactly when their composition
 * is order-dependent, so the invariant is:
 *
 *   A ∘ B ≡ B ∘ A on every entry, unless the pair is entangled.
 *
 * Non-commutation is not itself a defect — it is the DEFINITION of
 * the entanglement the catalogue already models, and the rtl trio is
 * order-dependent by measurement and declared as a 3-clique. What is
 * a defect is non-commutation nobody wrote down.
 *
 * ## The rid-set skip is a UNION, not an intersection
 *
 * Restricting a pair to the entries where BOTH rules fire is UNSOUND,
 * because the premise is evaluated on the RAW entry: if `b` does not
 * change `e` but DOES change `a(e)`, then `b` is not an identity step
 * in the `a`-first order, the two orders disagree, and the
 * intersection has already discarded `e`. That is not a corner case
 * — it is the exact mechanism an unlink/wrap pair exhibits, where the
 * unlink drops an anchor and exposes text the wrap rule then claims.
 * Across the four declared `bare-rtl-hebrew` pairs the intersection
 * discarded ~70% of the disagreeing entries, and caught the 50-entry
 * pair on the strength of seven.
 *
 * The UNION is sound: if NEITHER rule changes `e` then
 * `a(e) = b(e) = e` and both orders land on `e`, so a pair can be
 * skipped only on entries no rule touches at all. It leaves every
 * pair with a non-empty candidate set, so every pair is composed and
 * the skip is an ordinary optimisation: it buys the entries no rule
 * touches, which on this corpus is most of them. Pair count is
 * QUADRATIC in rule count — at 27 rules, 351 pairs over 277,488
 * entry-visits ran in ~34 s against this test's 180,000 ms timeout —
 * so re-measure it when the registry grows rather than assuming the
 * headroom holds.
 *
 * ## What this gate does NOT see
 *
 * - **A `PENDING` row.** A predicate claiming a population that has
 *   no rule yet is untestable by construction. This gate compares
 *   rules that exist.
 * - **Commuting overlap.** Two rules can claim the same bytes and
 *   still commute, if each is idempotent on the other's output. The
 *   design-time byte-span comparison in the spec is the sharper
 *   instrument; this one is the maintainable one.
 * - **Order-dependence that only a THIRD rule exposes.** Every pair
 *   is composed from the RAW entry, and the registry runs 27 rules
 *   deep. If `c` produces the state on which `a` and `b` disagree,
 *   this gate is blind to it — the same shape as the defect above,
 *   one level further out. The union fixes the two-rule case
 *   completely and says nothing about the three-rule one. Batch 1's
 *   remedy is still the backstop: compose the whole registry over the
 *   corpus in both candidate orders and compare bytes.
 * - **Attribution.** `compose()` discards records and compares only
 *   the resulting entry, so a pair whose orders agree on the OUTPUT
 *   while disagreeing about which rule gets credit reads as
 *   commuting. That is deliberate and matches `registry.ts`'s own
 *   ruling on `emphasisRunEdgeSpace` against the seam rules — "only
 *   the per-rule record counts differ, which is a fact about
 *   attribution, not about output" — but a reader consulting this
 *   list should not have to infer it from `compose()`'s docstring.
 */
import type { SourceEntry } from '../body/types.ts';
import type { Rule } from './types.ts';

/** One pair whose two composition orders disagree. */
interface NonCommuting {
	ids: [string, string];
	sampleRid: string;
}

/**
 * Rids on which `rule` may have changed the entry.
 *
 * DELIBERATELY OVER-INCLUSIVE, and that is what makes the union skip
 * sound rather than merely plausible. The skip needs one direction
 * only — a rid this set omits for BOTH rules must be one where
 * neither rule changed anything — so a false positive here costs a
 * composition and a false negative costs correctness.
 *
 * Two independent signals are OR-ed, so neither has to be exact:
 *
 * - `entry !== result.entry`. `Rule.apply`'s contract in `types.ts`
 *   is explicit that a rule returns a NEW entry object when it
 *   changes anything and the SAME reference when it does not, and
 *   that an in-place mutator is a contract violation nothing else
 *   detects either. A rule that allocates a fresh but identical
 *   entry is a false positive, which is free.
 * - `records.length > 0`. The previous version of this function
 *   rested on this ALONE, unstated — "produced a record" standing in
 *   for "changed the entry" with nothing requiring the two to agree.
 *   It is kept as the second signal rather than the only one, so a
 *   rule that reports a record without returning a new object is
 *   still caught.
 */
function changingRids(
	rule: Rule,
	corpus: readonly SourceEntry[],
): ReadonlySet<string> {
	const rids = new Set<string>();
	for (const entry of corpus) {
		const result = rule.apply(entry);
		if (result.entry !== entry || result.records.length > 0) {
			rids.add(entry.rid);
		}
	}
	return rids;
}

/**
 * `second(first(entry))`, discarding records — only the bytes are
 * compared.
 *
 * The parameters are named for their ROLE IN THE COMPOSITION rather
 * than for the rules of the pair, and that is deliberate. This function
 * is called twice in a row with its two rule arguments REVERSED, which
 * is the whole content of a commutation check — and it is exactly the
 * line where a real argument transposition would hide, because a gate
 * that compared one order against itself would report 0 non-commuting
 * pairs and look indistinguishable from success. No test can catch
 * that: the failure mode is silence.
 *
 * With the parameters called `a` and `b`, the reversed call read
 * `compose(b, a, entry)` against `compose(a: Rule, b: Rule, …)` — a
 * shape SonarQube flags as `typescript:S2234` ("arguments have the same
 * names but not the same order as the parameters"), and it was right to
 * on the shape even though the intent was correct. Names that cannot
 * correspond to the caller's are the fix; suppressing the rule on the
 * one line where transposition is both plausible and invisible would
 * have been the wrong trade.
 */
function compose(first: Rule, second: Rule, entry: SourceEntry): string {
	return JSON.stringify(second.apply(first.apply(entry).entry).entry);
}

/**
 * Counts from one `nonCommutingPairs` run, for the corpus-tier gate's
 * log line AND for its assertions. `totalPairs` is every unordered
 * pair `rules` has; `composedPairs` is the subset whose candidate rid
 * set was non-empty and so was composed at all. Under the union rule
 * these are equal — every registered rule changes SOMETHING — and the
 * honest number on stdout is the point: the previous intersection rule
 * made this read 146 of 351, and that gap was the defect, not the win.
 *
 * `inertRules` is the CAUSE behind any gap between the two, reported
 * separately because a pair count cannot name a culprit. A rule that
 * changes no entry in the whole corpus has an empty candidate set with
 * every partner, so it is trivially order-free with all of them and
 * this gate passes it in silence — the repo's own recurring hazard,
 * stated in `registry.ts`: a rule that does nothing satisfies every
 * gate, and the measurement is the only safety net. Costs nothing
 * extra: the changing-rid sets are already built.
 */
interface PairStats {
	composedPairs: number;
	/** Pairs skipped because their rules run in DIFFERENT PHASES, and
	 * so have only one possible order. Reported rather than silently
	 * dropped: a skip nobody counts is the "silence mistaken for
	 * coverage" failure `link-target.ts` names. */
	crossPhasePairs: number;
	/** Ids of rules that changed no entry in the corpus, sorted. Empty
	 * is the only healthy value. */
	inertRules: string[];
	totalPairs: number;
}

/**
 * Rids where `a` or `b` changed the entry, in corpus order.
 *
 * The UNION, not the intersection — see the module doc. Corpus order
 * rather than set-insertion order so that `sampleRid` names the
 * FIRST disagreeing entry in the file and is stable across runs.
 */
function candidateRids(
	a: Rule,
	b: Rule,
	changing: ReadonlyMap<string, ReadonlySet<string>>,
	orderOf: ReadonlyMap<string, number>,
): string[] {
	const union = new Set([
		...(changing.get(a.id) ?? []),
		...(changing.get(b.id) ?? []),
	]);
	return [...union].toSorted(
		(x, y) => (orderOf.get(x) ?? 0) - (orderOf.get(y) ?? 0),
	);
}

/** The first candidate rid on which `a` then `b` disagrees with `b`
 * then `a`, or `undefined` if the two orders agree on every one. */
function firstDisagreement(
	a: Rule,
	b: Rule,
	candidates: readonly string[],
	byRid: ReadonlyMap<string, SourceEntry>,
): string | undefined {
	return candidates.find((rid) => {
		const entry = byRid.get(rid);
		if (entry === undefined) {
			return false;
		}
		// Named rather than inlined so the REVERSAL is visible as an
		// intention. Inlined, the two calls differ by one transposed
		// argument and read as a typo either way round; named, the
		// comparison says what it is.
		const aThenB = compose(a, b, entry);
		const bThenA = compose(b, a, entry);
		return aThenB !== bThenA;
	});
}

/**
 * Whether this pair has only ONE possible order, and so nothing for a
 * commutation check to compare.
 *
 * `apply.ts`'s committed phase manifest runs `text-repairs` to
 * completion and only then `structural-repairs`, so `structural ∘
 * text` is the only composition the pipeline can produce and `text ∘
 * structural` is not an alternative the registry could be reordered
 * into. Comparing them asks whether a counterfactual the manifest
 * forbids agrees with the real one; a disagreement there is the phase
 * boundary WORKING, not an undeclared entanglement.
 *
 * `stranded-stem-head` is the live example: it reports four such
 * pairs, one of them `label-period-outside-italic`, whose output the
 * structural rule's population DEPENDS on (360 → 562 occurrences).
 * That dependency is real. What it is not is a registry-adjacency
 * constraint, which is the only thing `entangledWith` can express.
 */
function oneOrderOnly(a: Rule, b: Rule): boolean {
	return a.phase !== b.phase;
}

/** What one pair resolves to: skipped for having a single order,
 * skipped for an empty candidate set, or composed — with the rid of
 * the first disagreement when the two orders differ. */
type PairVerdict =
	| { kind: 'composed'; sampleRid: string | undefined }
	| { kind: 'crossPhase' }
	| { kind: 'noCandidates' };

/** The three lookups every pair needs, built once per run. Passed as
 * one object rather than three parameters so `verdictFor` stays inside
 * biome's `useMaxParams`. */
interface PairContext {
	byRid: ReadonlyMap<string, SourceEntry>;
	changing: ReadonlyMap<string, ReadonlySet<string>>;
	orderOf: ReadonlyMap<string, number>;
}

/** One pair's verdict. Extracted from `nonCommutingPairs` so the loop
 * there stays a tally rather than a decision procedure — SonarQube's
 * `typescript:S3776` flagged the merged version at 16 against a budget
 * of 15, and the split is the honest fix rather than a suppression. */
function verdictFor(a: Rule, b: Rule, ctx: PairContext): PairVerdict {
	if (oneOrderOnly(a, b)) {
		return { kind: 'crossPhase' };
	}
	const candidates = candidateRids(a, b, ctx.changing, ctx.orderOf);
	if (candidates.length === 0) {
		return { kind: 'noCandidates' };
	}
	return {
		kind: 'composed',
		sampleRid: firstDisagreement(a, b, candidates, ctx.byRid),
	};
}

/**
 * Every unordered pair of `rules` whose two orders produce different
 * bytes on some entry at least one of them changes. Pairs whose
 * candidate set is empty are skipped without composing, and so are
 * pairs whose rules run in different PHASES — see the comment on that
 * branch, and `PairStats.crossPhasePairs`, which counts them.
 *
 * When `stats` is passed, it is filled in with the pair counts (see
 * `PairStats`) — an optional out-param rather than a second return
 * value, so the two-argument call every other caller and both unit
 * tests use is unaffected.
 */
/** Every unordered pair of `rules`, in registry order. A generator so
 * the enumeration is separable from the decision — see `tallyPair`. */
function* unorderedPairs(rules: readonly Rule[]): Generator<[Rule, Rule]> {
	for (let i = 0; i < rules.length; i++) {
		for (let j = i + 1; j < rules.length; j++) {
			const a = rules[i];
			const b = rules[j];
			if (a !== undefined && b !== undefined) {
				yield [a, b];
			}
		}
	}
}

/** The running counts one `nonCommutingPairs` call accumulates. */
interface Tally {
	composedPairs: number;
	crossPhasePairs: number;
	found: NonCommuting[];
	totalPairs: number;
}

/** Fold one pair into the tally.
 *
 * Split out of `nonCommutingPairs` along with `unorderedPairs` and
 * `verdictFor` to keep each under SonarQube's `typescript:S3776`
 * complexity budget: three named steps — enumerate, decide, tally —
 * rather than a suppression. */
function tallyPair(a: Rule, b: Rule, ctx: PairContext, tally: Tally): void {
	tally.totalPairs++;
	// See `oneOrderOnly`: a cross-phase pair has ONE order, so it is
	// skipped and COUNTED rather than compared.
	const verdict = verdictFor(a, b, ctx);
	if (verdict.kind === 'crossPhase') {
		tally.crossPhasePairs++;
		return;
	}
	if (verdict.kind === 'noCandidates') {
		return;
	}
	tally.composedPairs++;
	if (verdict.sampleRid !== undefined) {
		tally.found.push({ ids: [a.id, b.id], sampleRid: verdict.sampleRid });
	}
}

/**
 * Every unordered pair of `rules` whose two orders produce different
 * bytes on some entry at least one of them changes. Pairs whose
 * candidate set is empty are skipped without composing, and so are
 * pairs whose rules run in different PHASES — see `oneOrderOnly`, and
 * `PairStats.crossPhasePairs`, which counts them.
 *
 * When `stats` is passed, it is filled in with the pair counts (see
 * `PairStats`) — an optional out-param rather than a second return
 * value, so the two-argument call every other caller and both unit
 * tests use is unaffected.
 */
function nonCommutingPairs(
	rules: readonly Rule[],
	corpus: readonly SourceEntry[],
	stats?: PairStats,
): NonCommuting[] {
	const changing = new Map(rules.map((r) => [r.id, changingRids(r, corpus)]));
	const ctx: PairContext = {
		byRid: new Map(corpus.map((e) => [e.rid, e])),
		changing,
		orderOf: new Map(corpus.map((e, at) => [e.rid, at])),
	};
	const tally: Tally = {
		composedPairs: 0,
		crossPhasePairs: 0,
		found: [],
		totalPairs: 0,
	};
	for (const [a, b] of unorderedPairs(rules)) {
		tallyPair(a, b, ctx, tally);
	}
	if (stats !== undefined) {
		stats.totalPairs = tally.totalPairs;
		stats.composedPairs = tally.composedPairs;
		stats.crossPhasePairs = tally.crossPhasePairs;
		stats.inertRules = [...changing]
			.filter(([, rids]) => rids.size === 0)
			.map(([id]) => id)
			.toSorted((x, y) => x.localeCompare(y));
	}
	return tally.found;
}

export type { NonCommuting, PairStats };
export { changingRids, nonCommutingPairs };
