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
 * ## Why the rid-set intersection is load-bearing, not a micro-optimisation
 *
 * 34 rules is 561 pairs; composing every pair over 32,512 entries is
 * ~36M `apply` calls. Restricting each pair to the entries where BOTH
 * rules actually fire is exact — a pair cannot disagree on an entry
 * where at least one of them changes nothing, because then one order
 * is the other with an identity step spliced in — and it collapses
 * the work to the handful of pairs whose populations touch at all.
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
 */
import type { SourceEntry } from '../body/types.ts';
import type { Rule } from './types.ts';

/** One pair whose two composition orders disagree. */
interface NonCommuting {
	ids: [string, string];
	sampleRid: string;
}

/** Rids on which `rule` produced at least one record. */
function firingRids(
	rule: Rule,
	corpus: readonly SourceEntry[],
): ReadonlySet<string> {
	const rids = new Set<string>();
	for (const entry of corpus) {
		if (rule.apply(entry).records.length > 0) {
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
 * log line — proof the rid-set-intersection optimisation is doing its
 * job rather than a claim taken on faith. `totalPairs` is every
 * unordered pair `rules` has; `composedPairs` is the (usually much
 * smaller) subset whose firing-rid sets actually intersected and so
 * were composed at all. */
interface PairStats {
	composedPairs: number;
	totalPairs: number;
}

/** Rids both `a` and `b` fire on, per the precomputed `firing` map. */
function sharedFiringRids(
	a: Rule,
	b: Rule,
	firing: ReadonlyMap<string, ReadonlySet<string>>,
): string[] {
	return [...(firing.get(a.id) ?? [])].filter((rid) =>
		firing.get(b.id)?.has(rid),
	);
}

/** The first shared rid on which `a` then `b` disagrees with `b` then
 * `a`, or `undefined` if the two orders agree on every shared rid. */
function firstDisagreement(
	a: Rule,
	b: Rule,
	sharedRids: readonly string[],
	byRid: ReadonlyMap<string, SourceEntry>,
): string | undefined {
	return sharedRids.find((rid) => {
		const entry = byRid.get(rid);
		return entry !== undefined && compose(a, b, entry) !== compose(b, a, entry);
	});
}

/**
 * Every unordered pair of `rules` whose two orders produce different
 * bytes on some entry both of them fire on. Pairs with a disjoint
 * firing set are skipped without composing.
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
	const firing = new Map(rules.map((r) => [r.id, firingRids(r, corpus)]));
	const byRid = new Map(corpus.map((e) => [e.rid, e]));
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
			const shared = sharedFiringRids(a, b, firing);
			if (shared.length === 0) {
				continue;
			}
			composedPairs++;
			const sampleRid = firstDisagreement(a, b, shared, byRid);
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
export { firingRids, nonCommutingPairs };
