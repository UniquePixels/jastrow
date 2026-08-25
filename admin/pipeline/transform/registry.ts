/**
 * The ordered rule list and the coverage gate (spec §6).
 *
 * `patterns.jsonl` is the single source of truth. A `route: transform`
 * row must be either registered here or named in PENDING; a row that is
 * neither is a silent skip, and the gate fails on it.
 */
import type { Pattern } from '../research/patterns.ts';
import { ibAnaphora, sifreAnaphora, targumAnaphora } from './rules/anaphora.ts';
import { gereshLetterNumeral, prefixedGereshAbbrev } from './rules/geresh.ts';
import { gershayimInBody, gershayimRefAttribute } from './rules/gershayim.ts';
import {
	pluralToFeminineFinalLetter,
	shurukAsYodDisplayCorruption,
} from './rules/misc-links.ts';
import {
	bareRtlHebrew,
	latinTokenInsideRtl,
	redundantOuterRtl,
} from './rules/rtl.ts';
import { apparatusCite, ellipsisFragment, rabbiName } from './rules/unlink.ts';
import type { Rule } from './types.ts';

/** Rules in execution order. Entangled rows MUST be adjacent — they own
 * the same records and will rewrite each other's work otherwise. */
const RULES: readonly Rule[] = [
	// The rtl wrapper family — adjacent by requirement, a 3-clique in
	// the catalogue's entanglement graph (Task 4).
	//
	// UNWRAP BEFORE WRAP, and the order is measured, not aesthetic.
	// Dropping a redundant outer span re-exposes the Hebrew it covered:
	// that text was `rtl: true` while the wrapper stood, so
	// `bare-rtl-hebrew` correctly skipped it, and running the unwrapper
	// afterwards left 62 entries newly bare with nothing left to wrap
	// them — the audit's "trade one for another" happening in the
	// registry rather than in a predicate. Unwrapping first leaves 0.
	redundantOuterRtl,
	bareRtlHebrew,
	latinTokenInsideRtl,

	// The unlink family (batch 2, tasks 2-3): rows whose anchor is
	// wrong and whose correct target does not exist, so the anchor is
	// dropped. Placed immediately after the rtl trio and BEFORE any
	// future compose rule (Tasks 7-8): a compose rule reads the anchor
	// sequence to build a new target, and must never adopt work from
	// an anchor these rules go on to delete — so unlinking has to run
	// first, not merely somewhere earlier in the list.
	apparatusCite,
	rabbiName,
	ellipsisFragment,

	// The geresh pair (batch 2, task 5). Two more unlink rows, by the
	// maintainer ruling of 2026-08-23 — briefed as retargets, but the
	// address they would have copied is absent from 84% of their own
	// entries (see rules/geresh.ts). Both rows carry the other in
	// `entangledWith` — they share 8 entries and 7 definitions, each
	// re-serializing a definition the other also rewrites — so
	// `checkAdjacency()` requires this gap-free span.
	//
	// Order between them is MEASURED and free: over the whole corpus
	// both orders produce 655 records across 640 entries with 0 entries
	// differing by a byte. No member of either population nests inside
	// an anchor of the other, and `unlinkMatching` re-derives from the
	// current text on every pass, so neither can hand the other a stale
	// index. `gereshLetterNumeral` leads only because it is the audited
	// row of the two.
	gereshLetterNumeral,
	prefixedGereshAbbrev,

	// plural-to-feminine-final-letter-mislink (batch 2, task 6). A
	// third unlink row, by the same measurement `geresh.ts` used:
	// under TARGET-ENTRY IDENTITY, 17 of 60 clean occurrences (28.3%)
	// have some other anchor reaching their own headword and 43 of 60
	// (71.7%) do not, so a retarget rule would decline close to three
	// members out of every four.
	//
	// CORRECTED 2026-08-24 (task 11). This block said "10 of 60
	// (16.7%) … decline five members in six", which is the SUFFIX
	// test — the reading `misc-links.ts`'s own module doc calls
	// unsound in BOTH directions and its 83.3% "spurious", because a
	// prefix scan counts the DEFECT ITSELF as evidence a repair
	// exists. Every other record on the branch already carried 17/60;
	// this one did not, and it is the load-bearing ordering rationale.
	// The conclusion is unchanged — a majority under either reading —
	// but the number quoted here must be the sound one.
	//
	// Unentangled with any other registered rule — its population sits
	// entirely inside the entry's own "Pl." construct, which no other
	// rule here rewrites.
	pluralToFeminineFinalLetter,

	// shuruk-as-yod-display-corruption (batch 2, task 10). Not an
	// unlink and not a retarget — the only rule in the batch that edits
	// DISPLAY text while leaving the target untouched (the link was
	// already correct; only the rendered glyph was OCR-corrupted).
	// Unentangled with any other registered rule: it never writes a
	// `data-ref`/`href`, so it cannot conflict with a retarget or
	// compose rule, and its 12 anchors all resolve to a correct target
	// already, so no unlink rule (which fires on a WRONG target) can
	// claim the same anchor. Placement here, rather than at either end
	// of the list, is free — measured with it run first and last in the
	// registry, both orders produce the identical 12 records byte-for-
	// byte, because no other rule's predicate reads or writes anything
	// inside this rule's matched anchors.
	shurukAsYodDisplayCorruption,

	// ib-yoma-2a (batch 2, task 7) — the batch's first RETARGET, and it
	// runs AFTER EVERY UNLINK RULE for the reason the unlink block
	// above states from the other side. (It said "runs LAST" when it
	// was written and it no longer is: task 8 appended two more
	// retargets below it, as the note at the end of this block asked
	// for. Reworded 2026-08-24, task 11.) This rule copies a target
	// off the nearest preceding
	// citation ANCHOR, so any anchor an unlink rule is going to remove
	// must already be gone before the antecedent search runs. An
	// antecedent that a later rule deletes is a wrong link, and adopting
	// its target would propagate the error into 312 anchors that
	// `transform:count` measures one rule at a time and cannot see.
	//
	// The cost of that ordering is MEASURED, not assumed: composed over
	// the full registry the rule fires on 209 occurrences / 188 entries,
	// exactly what it fires on ALONE. No shipped unlink rule removes an
	// antecedent this rule would have used — their populations are
	// disjoint from its 209 (`anaphora.test.ts` pins the isolated
	// numbers; task-7-report.md has the composed run). Batch 1's RTL
	// trio is why that is checked rather than reasoned about: there the
	// wrong order left 62 entries unfixed with every unit test green.
	//
	// Unentangled: the row carries no `entangledWith` in the catalogue,
	// and no other registered rule reads or writes a `Yoma 2a` anchor.
	//
	// FOR WHOEVER APPENDS THE NEXT RETARGET ROW — Task 8 adds
	// `ib-targum-work-loss` and `sifre-ib-resolves-to-yalkut` directly
	// below, and BOTH retarget. The argument above is about unlink
	// rules, and it does not cover them. The rule for retarget after
	// retarget is the mirror image and just as load-bearing: a retarget
	// rule reading the anchor sequence must run AFTER any rule that
	// REPAIRS an anchor it might adopt, or it will copy a target its
	// neighbour is about to correct. The three `ib-` rows all read the
	// same sequence, so a later one can legitimately adopt an anchor
	// this rule already fixed — that is a repaired address, not a wrong
	// one — but only if it sits below. Appending below is therefore the
	// safe default, and the pair must be MEASURED both ways over the
	// corpus (isolated vs composed, comparing the ADDRESS written and
	// not merely the count) before either order is called free, exactly
	// as `gereshLetterNumeral`/`prefixedGereshAbbrev` did above.
	ibAnaphora,

	// sifre-ib-resolves-to-yalkut (batch 2, task 8) — appended BELOW
	// `ibAnaphora` per the note directly above, which is the rule for a
	// retarget following a retarget. That note requires the pair be
	// MEASURED both ways at ADDRESS level before either order is called
	// free, because `transform:count` measures rules in isolation and
	// cannot see this class of defect. Measured over all 32,512 entries
	// (2026-08-23):
	//
	//   isolated            1 record / 1 entry (E00476)
	//   composed, shipped   1 record / 1 entry, same address, same bytes
	//   ibAnaphora          189 records either way — unchanged by the append
	//   both orders         6,204 records each, and 0 entries whose
	//                       anchor addresses differ between them
	//
	// THE 6,204 IS A REGISTRY-WIDE TOTAL AS OF 2026-08-23 AND HAS
	// MOVED (noted 2026-08-24, task 11). `shurukAsYodDisplayCorruption`
	// was registered afterwards and adds 12, and `targumAnaphora` 8, so
	// the registry now produces **6,224 records** over all 32,512
	// entries. What the measurement above claims is INVARIANCE between
	// the two orders, and that is unaffected: the absolute is a
	// timestamp, not the finding. Re-derive with the composed pass in
	// `docs/v2/transform-batch-2.md` §3 rather than trusting either
	// number here.
	//
	// So the order is free, and the reason it is free is measured too:
	// the two `ib-` rows share **0 entries** corpus-wide. Their
	// populations are disjoint by target (`ib-yoma-2a` requires
	// `data-ref` exactly `Yoma 2a`; this row requires a `Yalkut …`
	// target under an abutting `Sifré` label), and neither can supply
	// the other's antecedent — this row accepts only a `Sifrei …`
	// anchor, which `ibAnaphora` never writes.
	//
	sifreAnaphora,

	// ib-targum-work-loss (batch 2, task 8) — the THIRD retarget, and
	// gate case 4's first user. It was briefed to run here and it must:
	// appended below both `ib-` rows per the retarget-after-retarget
	// rule stated above, so it reads an anchor sequence those two have
	// already finished correcting rather than one they are about to.
	//
	// The case-4 ruling of 2026-08-23 is what let this row ship at all.
	// Its repair joins the antecedent Targum anchor's WORK to this
	// anchor's own already-correct verse, and cases 1-3 cannot license
	// that: case 3's remainder must appear in the DISPLAY, and Jastrow
	// writes `Deut. VI, 22` where Sefaria writes `6:22`. All 9
	// occurrences failed the gate before the amendment.
	//
	// Measured over all 32,512 entries, at ADDRESS level and in every
	// order, not by count:
	//
	//   isolated                      9 occurrences / 8 entries
	//                                 (8 records — C00446 holds two
	//                                 members in one definition)
	//   composed, shipped order       same 9, same addresses, byte
	//                                 for byte
	//   ibAnaphora / sifreAnaphora    189 / 1 records, both unchanged
	//                                 by the append
	//   all 6 permutations of the
	//     three retarget rules        6,212 records each and identical
	//                                 addresses in every one
	//
	// Same caveat as the block above (noted 2026-08-24, task 11): the
	// 6,212 is the registry-wide total as of 2026-08-23, before
	// `shurukAsYodDisplayCorruption`'s 12 were registered; the current
	// total is **6,224**. The claim being made is that all six
	// permutations agree with each other, which does not depend on the
	// absolute.
	//
	// The three populations are pairwise disjoint — 0 entries shared by
	// any pair — so no rule here can consume, create or destroy
	// another's antecedent. That is measured rather than argued, and it
	// is why the order is free; it is NOT a reason to reorder them,
	// since the disjointness is a fact about today's corpus and the
	// ordering rule is what keeps a re-fetch safe.
	targumAnaphora,

	// The gershayim pair (batch 3a). ONE defect, two catalogue rows,
	// split by locus: `gershayimInBody` takes the 2,125 occurrences in
	// document text, `gershayimRefAttribute` the 180 inside tag
	// interiors. Adjacent by requirement — every one of the 90 damaged
	// tags points at a headword carrying the same ASCII quote (90 of
	// 90, 0 unresolved), so repairing either side alone breaks all 90
	// cross-links by string identity.
	//
	// Order between them is MEASURED and free, like the geresh pair's:
	// the substitution never introduces or removes a `<` or a `>`, so
	// neither can move an occurrence into or out of the other's locus,
	// and over the whole corpus both orders produce 0 entries
	// differing by a byte. The pair is also order-free against the rtl
	// trio, which matters because the audit warned that wrapping bare
	// Hebrew would migrate 117 occurrences into scope — it does not,
	// because the predicate reads codepoints and not markup context.
	// Both measurements are `rules/gershayim.test.ts`'s corpus tier,
	// re-run on every `bun qa` rather than recorded here once.
	//
	// Appended at the END of the list, which the measurements above
	// say is free but do not by themselves say is RIGHT. It is the
	// safe default for the same reason the retarget note gives: every
	// rule above reads today's targets, truncation and all, so running
	// last changes nothing any of them sees. Measured too, against the
	// whole shipped registry rather than against the rtl trio alone —
	// composed, the pair produces the same 1,386 and 85 entries it
	// produces alone, so no rule above consumes an occurrence of it,
	// and moving the pair to the FRONT of this list leaves all 32,512
	// entries byte-identical. The claim and its method are spec §4.2
	// (docs/specs/2026-08-24-gershayim-transform-design.md), which is
	// in the repository; the run itself is re-derivable from that
	// section in a few seconds and is deliberately not cited to a
	// working note nobody else can open.
	gershayimInBody,
	gershayimRefAttribute,
];

/** Catalogued transform rows with no rule yet. Shrinks batch by batch;
 * empty at the end of Phase 2. */
const PENDING: readonly string[] = [
	'nonsense-dup-anchor',
	'unlinked-v-span',
	'paren-tag-no-space',
	// `homograph-numeral-mismatch` left this list in batch 2 Task 9:
	// audited to `judgment` in `patterns.jsonl`. Its 576 occurrences /
	// 538 entries are three merged defects, the display (Jastrow's print
	// numeral) is the authoritative side — so batch 3 does not own it
	// either — and no rule can name the destination: 40.1% of the
	// population already points where print says, the only family model
	// available scores 87.5% on 3,253 known-correct controls, and gate
	// case 2 reaches the replacement for 3.5% of the candidate defects.
	'anchor-swallows-close-paren',
	'nested-anchor-swallows-punctuation',
	'targum-sheni-never-linked',
	'superscript-subsection-stranded-outside-anchor',
	// `h-cognate-self-link` left this list in batch 2 Task 4: audited to
	// `judgment` in `patterns.jsonl` (no other article exists for any of
	// its 87 anchors, and the construct is 3.2% of a corpus-wide linker
	// behaviour), so `coverage` no longer counts it and neither list may.
	'trailing-whitespace-definition',
	'italic-swallowed-terminal-period',
	'em-dash-section-break-in-own-italic',
	'italic-lone-punctuation',
	'open-paren-in-anchor-display',
	'trailing-em-dash-tail',
	'anchor-italic-no-space',
	'italic-close-paren-nospace',
	'stranded-stem-head',
	'empty-stem-section',
	'sense-number-outside-closed-grammar',
	'bracketed-gloss-lead-sense',
	'asterisk-stem-label',
	'parenthesized-alt-headword',
	'b-h-split-across-field-boundary',
	'mekhilta-sifra-never-linked',
	'label-period-outside-italic',
	'gender-pair-headword-line-collapse',
	'translit-italic-space-loss',
	'orphan-gloss-seam-period',
	'reversed-hebrew-phrase',
	'empty-lead-sense',
	'abbrev-fused-headword',
	'unterminated-href-swallows-closing-tag',
	'stem-head-marker-chop',
	'citation-quote-seam-period',
	'vkh-geresh-loss',
	'tosefta-variant-chapter-halakha-loss',
	'citation-number-truncated-outside-anchor',
	'geresh-abbrev-space-loss',
	'homograph-roman-stranded-in-definition',
	'holam-migrated-off-mater-vav',
	'impossible-dagesh',
	'binyan-form-leading-space',
	'binyan-form-empty-slot',
	'plural-label-rendering-defeats-capture',
	'continuation-marker-em-dash-loss',
	'phrase-alt-headword-stub',
	'tanhuma-never-linked',
	'pesikta-drk-never-linked',
	'duplicated-definition-opening-run',
	'shin-sin-dot-drop',
	'v-sub-redirect-stub-mislink',
	'midrash-petichta-unanchored',
	'emphasis-run-edge-space',
	'adjacent-verbatim-repetition',
	'abbrev-headword-stub',
	'containment-fallback-mislink',
	'gloss-head-seam-period-doubling',
	'post-anchor-numeral-duplication',
	'section-break-terminator-loss',
	'entry-final-comma',
	'italic-swallows-close-paren',
	'see-particle-lost',
	'jt-double-wrapped-citation',
];

interface Coverage {
	/** Rows claimed by BOTH `RULES` and `PENDING` — a row that has a
	 * rule and is still listed as waiting for one. Always empty; a
	 * non-empty value means the two lists disagree about who owns the
	 * row, and `registered + pending` over-counts `total`. */
	duplicated: string[];
	pending: number;
	registered: number;
	total: number;
	/** Transform rows that are neither registered nor pending. */
	unaccounted: string[];
}

/**
 * Partition the catalogue's transform rows across `RULES` and
 * `PENDING`.
 *
 * `pending` is counted from `PENDING`, NOT as the complement of
 * `registered`. The complement reading makes `registered + pending ===
 * total` an arithmetic identity — true for any input, unable to fail,
 * and therefore not a test. Counting each side from its own list makes
 * the sum a real claim: it holds only if every row belongs to exactly
 * one list, so a row in neither (also reported as `unaccounted`) or in
 * both (`duplicated`) breaks it.
 */
function coverage(catalogue: readonly Pattern[]): Coverage {
	const rows = catalogue.filter(
		(row) => row.route === 'transform' && row.status === 'candidate',
	);
	const registered = new Set(RULES.map((rule) => rule.id));
	const pending = new Set(PENDING);
	return {
		duplicated: rows
			.filter((row) => registered.has(row.id) && pending.has(row.id))
			.map((row) => row.id),
		pending: rows.filter((row) => pending.has(row.id)).length,
		registered: rows.filter((row) => registered.has(row.id)).length,
		total: rows.length,
		unaccounted: rows
			.filter((row) => !(registered.has(row.id) || pending.has(row.id)))
			.map((row) => row.id),
	};
}

/** One connected component of the catalogue's entanglement graph that
 * has at least two REGISTERED members — the only kind execution order
 * can be wrong about. */
interface Cluster {
	/** Registry positions of the members that are registered, ascending. */
	at: number[];
	/** Every id in the component, registered or not, sorted. */
	ids: string[];
}

/**
 * The `entangledWith` graph as an UNDIRECTED adjacency map: every edge
 * is stored on both endpoints, whichever side of it the catalogue
 * actually recorded.
 *
 * Reading `row.id -> row.entangledWith` alone builds a DIRECTED graph,
 * and `componentOf` traverses in that one direction only. A one-sided
 * edge — `a` names `b`, `b` does not name `a` — is then invisible from
 * `b`: if `b` sits earlier in `RULES` it is walked first, enters
 * `seen` as a singleton, and the later walk from `a` skips it. The
 * component never forms, so `checkAdjacency` passes on a SPLIT
 * recorded entanglement. Adding the reverse edge makes the traversal
 * find it from either end.
 *
 * `checkEntanglement` reports an unreciprocated edge as a catalogue
 * problem, and today every edge is reciprocated — 18 recorded entries,
 * 9 undirected edges, 0 one-sided, 0 dangling — so nothing in the
 * corpus reaches this. That is exactly why it is worth building
 * correctly rather than leaving: this is the code Task 3 added to make
 * the adjacency gate FALSIFIABLE, and a gate whose correctness rests
 * on a property of its own input is the failure mode it exists to
 * catch. Pinned by `registry.test.ts`, walked from the side holding no
 * edge.
 *
 * Edges to ids the catalogue does not hold are kept, as they were
 * before: they contribute no registry position, so they widen no span.
 * `checkEntanglement` is what names them.
 */
function undirectedGraph(catalogue: readonly Pattern[]): Map<string, string[]> {
	const edges = new Map<string, Set<string>>();
	const of = (id: string): Set<string> => {
		const found = edges.get(id) ?? new Set<string>();
		edges.set(id, found);
		return found;
	};
	for (const row of catalogue) {
		of(row.id);
		for (const other of row.entangledWith ?? []) {
			of(row.id).add(other);
			of(other).add(row.id);
		}
	}
	return new Map([...edges].map(([id, set]) => [id, [...set]]));
}

/** The connected component containing `from`, marking each id seen so
 * a component is walked once rather than once per member. */
function componentOf(
	from: string,
	partners: ReadonlyMap<string, readonly string[]>,
	seen: Set<string>,
): string[] {
	const cluster: string[] = [];
	const queue = [from];
	while (queue.length > 0) {
		const id = queue.pop() as string;
		if (seen.has(id)) {
			continue;
		}
		seen.add(id);
		cluster.push(id);
		queue.push(...(partners.get(id) ?? []).filter((p) => !seen.has(p)));
	}
	return cluster;
}

/**
 * Every entanglement cluster the registry can currently get wrong,
 * DERIVED from the catalogue rather than listed anywhere.
 *
 * Exported because a hand-written test per cluster is a convention
 * with nothing enforcing it: `checkAdjacency` skips a component with
 * fewer than two registered members, so the day a pending row's rule
 * ships, its cluster starts mattering and no existing test knows.
 * Tests assert against THIS list, so the set of clusters under test is
 * the set that exists.
 */
function entangledClusters(
	catalogue: readonly Pattern[],
	rules: readonly Rule[] = RULES,
): Cluster[] {
	const index = new Map(rules.map((rule, at) => [rule.id, at]));
	const partners = undirectedGraph(catalogue);
	const seen = new Set<string>();
	const clusters: Cluster[] = [];
	for (const rule of rules) {
		if (seen.has(rule.id)) {
			continue;
		}
		const ids = componentOf(rule.id, partners, seen);
		const at = ids
			.flatMap((id) => {
				const found = index.get(id);
				return found === undefined ? [] : [found];
			})
			.toSorted((a, b) => a - b);
		if (at.length >= 2) {
			clusters.push({
				at,
				ids: ids.toSorted((a, b) => a.localeCompare(b)),
			});
		}
	}
	return clusters.toSorted((a, b) =>
		(a.ids[0] ?? '').localeCompare(b.ids[0] ?? ''),
	);
}

/**
 * Entangled rows own the same records; a gap between them in execution
 * order means one rewrites the other's output.
 *
 * The check is CLUSTER CONTIGUITY, not pairwise distance. Entanglement
 * is transitive — the RTL family is a 3-clique — and in any contiguous
 * run of three the two endpoints are 2 apart, so a pairwise "≤ 1" test
 * can never be satisfied by a group larger than a pair. What "adjacent"
 * means for a cluster is that its members occupy a gap-free span, in
 * any order.
 *
 * ## What this gate CANNOT prove, stated rather than implied
 *
 * It reads the catalogue's `entangledWith` graph and nothing else, so
 * an entanglement nobody recorded does not exist as far as it is
 * concerned. A row carrying NO edge is invisible to it: the row's
 * component is a singleton, `entangledClusters` drops it, and the gate
 * returns clean whatever the registry does with that rule. 56 of the
 * 62 rows still in `PENDING` carry no edge at all (measured
 * 2026-08-25), so for most of the work ahead this gate is
 * unfalsifiable BY CONSTRUCTION — not because the check is weak, but
 * because its input is incomplete.
 *
 * That is a catalogue-completeness problem and it is not fixable
 * here. What a rule author gets from a clean run is therefore: no
 * RECORDED entanglement is split. Not: no entanglement is split. The
 * cheapest guard remains the one batch 1 learned the hard way — run
 * the corpus under both orders and compare bytes — which needs no
 * edge in the catalogue to work.
 */
function checkAdjacency(
	catalogue: readonly Pattern[],
	rules: readonly Rule[] = RULES,
): string[] {
	return entangledClusters(catalogue, rules).flatMap((cluster) => {
		const span = Math.max(...cluster.at) - Math.min(...cluster.at) + 1;
		return span === cluster.at.length
			? []
			: [
					`${cluster.ids.join(', ')} span ${span} slots for ${cluster.at.length} registered rule(s)`,
				];
	});
}

export type { Cluster, Coverage };
export { checkAdjacency, coverage, entangledClusters, PENDING, RULES };
