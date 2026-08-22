/**
 * The ordered rule list and the coverage gate (spec §6).
 *
 * `patterns.jsonl` is the single source of truth. A `route: transform`
 * row must be either registered here or named in PENDING; a row that is
 * neither is a silent skip, and the gate fails on it.
 */
import type { Pattern } from '../research/patterns.ts';
import type { Rule } from './types.ts';

/** Rules in execution order. Entangled rows MUST be adjacent — they own
 * the same records and will rewrite each other's work otherwise. */
const RULES: readonly Rule[] = [];

/** Catalogued transform rows with no rule yet. Shrinks batch by batch;
 * empty at the end of Phase 2. */
const PENDING: readonly string[] = [
	'bare-rtl-hebrew',
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
	'redundant-outer-rtl-span',
	'em-dash-section-break-in-own-italic',
	'italic-lone-punctuation',
	'open-paren-in-anchor-display',
	'latin-token-inside-rtl-span',
	'trailing-em-dash-tail',
	'anchor-italic-no-space',
	'italic-close-paren-nospace',
	'gershayim-breaks-ref-attribute',
	'stranded-stem-head',
	'empty-stem-section',
	'sense-number-outside-closed-grammar',
	'bracketed-gloss-lead-sense',
	'asterisk-stem-label',
	'abbrev-in-alt-headwords',
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

/** Entangled rows own the same records; a gap between them in
 * execution order means one rewrites the other's output. */
function checkAdjacency(catalogue: readonly Pattern[]): string[] {
	const index = new Map(RULES.map((rule, at) => [rule.id, at]));
	const problems: string[] = [];
	for (const row of catalogue) {
		const at = index.get(row.id);
		if (at === undefined) {
			continue;
		}
		for (const partner of row.entangledWith ?? []) {
			const other = index.get(partner);
			if (other !== undefined && Math.abs(other - at) > 1) {
				problems.push(
					`${row.id} and ${partner} are ${Math.abs(other - at)} apart`,
				);
			}
		}
	}
	return problems;
}

export type { Coverage };
export { checkAdjacency, coverage, PENDING, RULES };
