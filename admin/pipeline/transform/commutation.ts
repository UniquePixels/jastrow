/**
 * The commutation gate (batch-4 spec §3.3).
 *
 * `checkAdjacency()` enforces one direction — a pair the catalogue
 * DECLARES entangled must sit gap-free in the registry. Nothing
 * enforced the other: a pair that BEHAVES as entangled must be
 * declared. That gap is what let batch 3b write four rules which
 * could have claimed another catalogue row's members, three of which
 * would have shipped that way; all four were caught by a human
 * reading a sibling row's `reason`.
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
 * ## The rid-set skip is a UNION, and the first version of it was wrong
 *
 * CORRECTED 2026-08-26 (fix/rtl-unlink-order, review round 1). This
 * section used to be headed "Why the rid-set intersection is
 * load-bearing, not a micro-optimisation" and it claimed:
 *
 *   "Restricting each pair to the entries where BOTH rules actually
 *    fire is exact — a pair cannot disagree on an entry where at
 *    least one of them changes nothing, because then one order is
 *    the other with an identity step spliced in."
 *
 * **Neither half is true.** The premise is evaluated on the RAW
 * entry. If `b` does not change `e` but DOES change `a(e)`, then `b`
 * is not an identity step in the `a`-first order, the two orders
 * disagree, and the intersection has already discarded `e`. That is
 * not a corner case: it is the exact mechanism this branch exists to
 * repair — an unlink rule drops an anchor and exposes text a wrap
 * rule then claims.
 *
 * Measured over all 32,512 entries, for the four pairs this branch
 * declares, in ENTRIES whose two orders disagree:
 *
 *   pair                                             total  seen  lost
 *   bare-rtl-hebrew × geresh-letter-numeral-mislink    441   132   309
 *   bare-rtl-hebrew × prefixed-geresh-abbrev-mislink   170    41   129
 *   bare-rtl-hebrew × ellipsis-fragment-anchored        80    24    56
 *   bare-rtl-hebrew × plural-to-feminine-…-mislink      50     7    43
 *
 * ~70% of the evidence was thrown away before the comparison ran, and
 * the 50-entry pair was caught on the strength of seven entries —
 * entries where `bare-rtl-hebrew` happened to fire somewhere ELSE in
 * the same entry for an unrelated reason. This gate found the defect
 * it was written to find; it did not have to.
 *
 * The UNION is the sound restriction, and its justification does
 * hold: if NEITHER rule changes `e`, then `a(e) = b(e) = e` and both
 * orders land on `e`. So a pair can only be skipped on entries no
 * rule touches at all.
 *
 * ## What the union costs, stated rather than argued
 *
 * 27 rules is 351 unordered pairs. Under the union every pair has a
 * non-empty candidate set, so all 351 are composed, over 277,488
 * entry-visits, in ~34 seconds — against this test's own 180,000 ms
 * timeout. It finds the identical 8 pairs and the identical sample
 * rids the unsound version reported. The skip is therefore an
 * ordinary optimisation and is described as one: it buys the entries
 * no rule touches, which on this corpus is most of them.
 *
 * ## What this gate does NOT see
 *
 * - **A `PENDING` row.** 46 catalogue rows have no rule, so a
 *   predicate claiming a population that has no predicate yet stays
 *   untestable by construction. This gate compares rules that exist.
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

/** `b(a(entry))`, discarding records — only the bytes are compared. */
function compose(a: Rule, b: Rule, entry: SourceEntry): string {
	return JSON.stringify(b.apply(a.apply(entry).entry).entry);
}

/** Counts from one `nonCommutingPairs` run, for the corpus-tier gate's
 * log line. `totalPairs` is every unordered pair `rules` has;
 * `composedPairs` is the subset whose candidate rid set was non-empty
 * and so was composed at all. Under the union rule these are usually
 * equal — every registered rule changes SOMETHING — and the honest
 * number on stdout is the point: the previous intersection rule made
 * this read 146 of 351 and that gap was the defect, not the win. */
interface PairStats {
	composedPairs: number;
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
		return entry !== undefined && compose(a, b, entry) !== compose(b, a, entry);
	});
}

/**
 * Every unordered pair of `rules` whose two orders produce different
 * bytes on some entry at least one of them changes. Pairs whose
 * candidate set is empty are skipped without composing.
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
	const byRid = new Map(corpus.map((e) => [e.rid, e]));
	const orderOf = new Map(corpus.map((e, at) => [e.rid, at]));
	const found: NonCommuting[] = [];
	let totalPairs = 0;
	let composedPairs = 0;
	for (let i = 0; i < rules.length; i++) {
		for (let j = i + 1; j < rules.length; j++) {
			const a = rules[i];
			const b = rules[j];
			if (a === undefined || b === undefined) {
				continue;
			}
			totalPairs++;
			const candidates = candidateRids(a, b, changing, orderOf);
			if (candidates.length === 0) {
				continue;
			}
			composedPairs++;
			const sampleRid = firstDisagreement(a, b, candidates, byRid);
			if (sampleRid !== undefined) {
				found.push({ ids: [a.id, b.id], sampleRid });
			}
		}
	}
	if (stats !== undefined) {
		stats.totalPairs = totalPairs;
		stats.composedPairs = composedPairs;
	}
	return found;
}

export type { NonCommuting, PairStats };
export { changingRids, nonCommutingPairs };
