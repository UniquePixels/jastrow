/**
 * The ordered rule list and the coverage gate (spec §6).
 *
 * `patterns.jsonl` is the single source of truth. A `route: transform`
 * row must be either registered here or named in PENDING; a row that is
 * neither is a silent skip, and the gate fails on it.
 */
import type { Pattern } from '../research/patterns.ts';
import {
	bareRtlHebrew,
	latinTokenInsideRtl,
	redundantOuterRtl,
} from './rules/rtl.ts';
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
];

/** Catalogued transform rows with no rule yet. Shrinks batch by batch;
 * empty at the end of Phase 2. */
const PENDING: readonly string[] = [
	'nonsense-dup-anchor',
	'unlinked-v-span',
	'ib-yoma-2a',
	'paren-tag-no-space',
	'geresh-letter-numeral-mislink',
	'homograph-numeral-mismatch',
	'anchor-swallows-close-paren',
	'nested-anchor-swallows-punctuation',
	'targum-sheni-never-linked',
	'prefixed-geresh-abbrev-mislink',
	'superscript-subsection-stranded-outside-anchor',
	'h-cognate-self-link',
	'trailing-whitespace-definition',
	'ascii-quote-as-gershayim-in-body',
	'italic-swallowed-terminal-period',
	'em-dash-section-break-in-own-italic',
	'italic-lone-punctuation',
	'open-paren-in-anchor-display',
	'trailing-em-dash-tail',
	'anchor-italic-no-space',
	'italic-close-paren-nospace',
	'gershayim-breaks-ref-attribute',
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
	'shuruk-as-yod-display-corruption',
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
	'rabbi-name-linked-as-bible-book',
	'binyan-form-empty-slot',
	'sifre-ib-resolves-to-yalkut',
	'plural-label-rendering-defeats-capture',
	'continuation-marker-em-dash-loss',
	'phrase-alt-headword-stub',
	'tanhuma-never-linked',
	'pesikta-drk-never-linked',
	'ascii-gershayim-outside-body-text',
	'duplicated-definition-opening-run',
	'shin-sin-dot-drop',
	'ellipsis-fragment-anchored',
	'v-sub-redirect-stub-mislink',
	'midrash-petichta-unanchored',
	'emphasis-run-edge-space',
	'adjacent-verbatim-repetition',
	'plural-to-feminine-final-letter-mislink',
	'abbrev-headword-stub',
	'containment-fallback-mislink',
	'gloss-head-seam-period-doubling',
	'post-anchor-numeral-duplication',
	'section-break-terminator-loss',
	'entry-final-comma',
	'italic-swallows-close-paren',
	'ib-targum-work-loss',
	'apparatus-cite-linked-as-scripture',
	'see-particle-lost',
	'jt-double-wrapped-citation',
];

interface Coverage {
	pending: number;
	registered: number;
	total: number;
	/** Transform rows that are neither registered nor pending. */
	unaccounted: string[];
}

function coverage(catalogue: readonly Pattern[]): Coverage {
	const rows = catalogue.filter(
		(row) => row.route === 'transform' && row.status === 'candidate',
	);
	const known = new Set([...RULES.map((rule) => rule.id), ...PENDING]);
	const registered = new Set(RULES.map((rule) => rule.id));
	return {
		pending: rows.filter((row) => !registered.has(row.id)).length,
		registered: rows.filter((row) => registered.has(row.id)).length,
		total: rows.length,
		unaccounted: rows.filter((row) => !known.has(row.id)).map((row) => row.id),
	};
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
 */
function checkAdjacency(
	catalogue: readonly Pattern[],
	rules: readonly Rule[] = RULES,
): string[] {
	const index = new Map(rules.map((rule, at) => [rule.id, at]));
	const partners = new Map(
		catalogue.map((row) => [row.id, row.entangledWith ?? []]),
	);
	const seen = new Set<string>();
	const problems: string[] = [];
	for (const rule of rules) {
		if (seen.has(rule.id)) {
			continue;
		}
		// Breadth-first over the entanglement graph: one component per
		// pass, so a cluster reports once rather than once per edge.
		const cluster: string[] = [];
		const queue = [rule.id];
		while (queue.length > 0) {
			const id = queue.pop() as string;
			if (seen.has(id)) {
				continue;
			}
			seen.add(id);
			cluster.push(id);
			queue.push(...(partners.get(id) ?? []).filter((p) => !seen.has(p)));
		}
		const at = cluster.flatMap((id) => {
			const found = index.get(id);
			return found === undefined ? [] : [found];
		});
		if (at.length < 2) {
			continue;
		}
		const span = Math.max(...at) - Math.min(...at) + 1;
		if (span !== at.length) {
			problems.push(
				`${cluster.join(', ')} span ${span} slots for ${at.length} registered rule(s)`,
			);
		}
	}
	return problems;
}

export type { Coverage };
export { checkAdjacency, coverage, PENDING, RULES };
