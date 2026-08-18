/**
 * Deterministic Hebrew-side frequency rule (round-1 detector
 * calibration, 2026-08-18; RUNBOOK step 2).
 *
 * Round 1's highest-value finding (letter F): every hint rule the
 * detector had — `comma-for-period`, `bare-abbrev`,
 * `rare-dotted-variant`, `truncated-formula` — fires only on
 * Latin-script citation tokens. Hebrew quotation text, most of the
 * corpus by volume, got no corpus-frequency comparison at all, and it
 * carries the same OCR confusions that broke batch-01 on the Latin
 * side. This is the Hebrew analogue of that class-8 sub-token rule,
 * split into its own module the way link-anomalies.ts was.
 *
 * The comparison is over *consonantal skeletons* (niqqud and other
 * combining marks stripped): vocalized tokens are far too sparse for
 * a frequency threshold to mean anything, and the confusions are
 * consonantal anyway.
 *
 * Round 1 measured 1,053 rare Hebrew tokens one *unrestricted*
 * substitution from a dominant token — mostly real words — and
 * proposed narrowing to twelve confusable glyph pairs (~76
 * candidates). Full-corpus calibration (2026-08-18) sampled every
 * candidate against its actual surrounding text, not just the
 * frequency numbers, and found that framing did not hold: read in
 * context, most twelve-pair candidates are real, distinct words that
 * happen to be rare and one glyph from something common (plurals,
 * construct forms, Biblical quotations, Jastrow's own citations of
 * manuscript variants already marked `corr. acc.` or `read: X` in the
 * print) — not digitization slips. Two mechanical bugs inflated the
 * count further: the tokenizer split words containing a Yiddish
 * double-vav ligature (`חװרבר` became `ח` + `רבר`) and dropped a
 * mnemonic combining-dot mark mid-word (`יוסֿף` became `יוס` + `ף`);
 * both are fixed here. A geresh or gershayim immediately after a
 * token also marks a Jastrow abbreviation, not a misspelling
 * (`אתד׳`, `לחו׳`), and is excluded.
 *
 * With those fixes, only the ה/ח pair (guttural confusion — the most
 * visually similar letters in Jastrow's typeface) cleared "roughly
 * two in three": 14 corpus-wide hits, all 14 read against their
 * surrounding definition, 9 true positives (`שחוא` for `שהוא` twice,
 * `אהר` for `אחר`, `למח` for `למה`, `הזח` for `הזה`, `וחוא` for
 * `והוא`, `שהיח` for `שהיה`, `חיו` for `היו`, `חמר אהד` for `חמר
 * אחד`) against 5 false (`חיתה` and `חאי`, both attested
 * inflected/participle forms; `שחיה`, a reading Jastrow's own note
 * already marks for correction; `חוו`, an entry's own cited
 * etymological root) — 64%.
 *
 * A first pass shipped that pair alone. Task-9 review overruled the
 * single-pair narrowing on volume grounds: the full twelve-pair set
 * is only 59 hinted entries corpus-wide (0.18% of the corpus), so a
 * pair clearing under 64% still buys real, otherwise-unreachable
 * defects at negligible absolute cost — hints are judged individually
 * by the sweep agent, not auto-applied, so a false positive costs a
 * rejection, not a corruption. Widened to the four next-best pairs,
 * each read in full against its surrounding definitions:
 *
 * - ה/ח — 14 hits, 9 true (64%, detailed above).
 * - ו/ן — 8 hits, 2 true (`שאיו` for `שאין`, round 1's own worked
 *   example, previously unreached because it sits in this pair and no
 *   other; `שהין` for the semantically-fitting `שחין`, "boil", found
 *   via its dominant neighbour `שהיו`) — 25%.
 * - צ/ע — 3 hits, 1 true (`צליו` for `עליו`) — 33%.
 * - ד/ר — 3 hits, 1 true (`רלא` for `דלא`, round 1's other worked
 *   example) — 33%.
 * - ו/י — 11 hits, 2 true (`וכול` for `יכול`, `תירה` for `תורה`) —
 *   18%.
 *
 * Combined: 39 corpus-wide hits, 15 true — 38%, well under "roughly
 * two in three" as a blended figure, but every non-shipped pair
 * measured at a flat 0% (ה/ת, ח/ת, ב/כ, כ/פ, ג/נ, ן/ר) and stays
 * dropped; nothing here is guessed. The five shipped pairs are the
 * only ones with *any* confirmed true positive in full-corpus
 * sampling, and the reviewer's volume argument — 39 hints is 0.12%
 * of the corpus either way — outweighs holding out for a higher
 * blended percentage on a rule this small.
 */
import type { SourceEntry } from '../body/types.ts';
import { entryDefinitions } from './headword-index.ts';

/** One deterministic Hebrew-frequency finding. The kind value is a
 * member of `AnomalyHint['kind']` in anomalies.ts, which owns the
 * union. */
interface HebrewHint {
	detail: string;
	kind: 'hebrew-rare-confusable';
}

/** Corpus-wide occurrence counts of Hebrew consonantal skeletons. */
type HebrewTable = Map<string, number>;

/** The five pairs with a confirmed true positive in full-corpus
 * sampling — see the module comment for the per-pair breakdown. The
 * other six pairs round 1 proposed (ה/ת, ב/כ, ג/נ, ם/ס, כ/פ, ח/ת,
 * ן/ר) measured a flat 0% and are not shipped. */
const CONFUSABLE_PAIRS = ['הח', 'ון', 'צע', 'דר', 'וי'] as const;

/** Calibrated thresholds (2026-08-18). A token is anomalous when it
 * occurs at most MAX_RARE times corpus-wide and one confusable-pair
 * substitution reaches a token occurring at least MIN_COMMON times.
 * MIN_LENGTH excludes the two-letter particles, where a substitution
 * usually produces a different real word rather than a misreading. */
const HEBREW_THRESHOLDS = {
	maxRare: 2,
	minCommon: 100,
	minLength: 3,
};

const TAG = /<[^>]*>/gu;
/** Hebrew niqqud, cantillation, and other combining marks (the
 * mnemonic combining-dot Jastrow uses over acrostic letters, e.g.
 * `יוסֿף`, sits outside the Hebrew block and would otherwise split
 * the token in two). */
const COMBINING_MARKS = /[\u0300-\u036F\u0591-\u05C7]/gu;
/** A run of Hebrew letters, final forms and the Yiddish double-vav
 * ligatures (`װ ױ ײ`) included — dropping the ligatures used to
 * split words like `חװרבר` into `ח` and a spurious `רבר`. */
const HEBREW_TOKEN = /[א-תװ-ײ]+/gu;
/** Geresh or gershayim immediately after a token: a Jastrow
 * abbreviation marker (`אתד׳`, `לחו׳`), not a misspelling. */
const ABBREV_MARK = /^[׳'״"]/u;

/** Each confusable letter mapped to the letters it swaps with. */
const SWAPS = ((): Map<string, string[]> => {
	const map = new Map<string, string[]>();
	for (const pair of CONFUSABLE_PAIRS) {
		const [a, b] = [pair[0], pair[1]];
		map.set(a, [...(map.get(a) ?? []), b]);
		map.set(b, [...(map.get(b) ?? []), a]);
	}
	return map;
})();

/** The consonantal skeletons of one text field, markup and combining
 * marks removed, abbreviation stubs (a token immediately followed by
 * a geresh or gershayim) excluded. */
function hebrewTokens(text: string): string[] {
	const stripped = text.replace(TAG, ' ').replace(COMBINING_MARKS, '');
	const tokens: string[] = [];
	for (const m of stripped.matchAll(HEBREW_TOKEN)) {
		const end = (m.index ?? 0) + m[0].length;
		if (!ABBREV_MARK.test(stripped.slice(end, end + 1))) {
			tokens.push(m[0]);
		}
	}
	return tokens;
}

/** Count every Hebrew skeleton across every definition in the corpus.
 * Build once per batch over the pre-patch corpus, exactly as
 * `buildAbbrevTable` does for the Latin side. Abbreviation stubs are
 * excluded from the table too, so a common word's geresh-truncated
 * form never inflates its own count. */
function buildHebrewTable(entries: Iterable<SourceEntry>): HebrewTable {
	const table: HebrewTable = new Map();
	for (const entry of entries) {
		for (const def of entryDefinitions(entry)) {
			for (const token of hebrewTokens(def)) {
				table.set(token, (table.get(token) ?? 0) + 1);
			}
		}
	}
	return table;
}

/** Every one-substitution neighbour of `token` over the confusable
 * pairs. At most two per position, so this stays linear. */
function confusableVariants(token: string): string[] {
	const out: string[] = [];
	for (let i = 0; i < token.length; i++) {
		for (const alt of SWAPS.get(token[i] as string) ?? []) {
			out.push(`${token.slice(0, i)}${alt}${token.slice(i + 1)}`);
		}
	}
	return out;
}

/** The dominant neighbour of a rare token, if it has one. */
function dominantNeighbour(
	token: string,
	table: HebrewTable,
): { count: number; word: string } | undefined {
	const seen = table.get(token) ?? 0;
	if (
		token.length < HEBREW_THRESHOLDS.minLength ||
		seen === 0 ||
		seen > HEBREW_THRESHOLDS.maxRare
	) {
		return;
	}
	let best: { count: number; word: string } | undefined;
	for (const variant of confusableVariants(token)) {
		const count = table.get(variant) ?? 0;
		if (count >= HEBREW_THRESHOLDS.minCommon && count > (best?.count ?? 0)) {
			best = { count, word: variant };
		}
	}
	return best;
}

/** Hebrew-frequency hints for one text field. */
function hebrewHints(text: string, table: HebrewTable): HebrewHint[] {
	const hints: HebrewHint[] = [];
	for (const token of new Set(hebrewTokens(text))) {
		const neighbour = dominantNeighbour(token, table);
		if (neighbour === undefined) {
			continue;
		}
		hints.push({
			detail: `Hebrew '${token}' occurs ${table.get(token) ?? 0}x corpus-wide beside '${neighbour.word}' at ${neighbour.count}x, one confusable-glyph substitution away`,
			kind: 'hebrew-rare-confusable',
		});
	}
	return hints;
}

export type { HebrewHint, HebrewTable };
export { buildHebrewTable, CONFUSABLE_PAIRS, HEBREW_THRESHOLDS, hebrewHints };
