/**
 * `abbrev-in-alt-headwords` — an `alt_headwords` item holding a
 * geresh-truncated spelling of the headword (`רִי׳` for `רִיבְדָּא`),
 * unusable as a lookup key.
 *
 * PARTIAL BY CONSTRUCTION, and that is the designed outcome rather
 * than a shortfall. The audit is explicit — "EXPANSION IS NOT
 * DETERMINISTIC HERE" — because the elided tail has to be recovered by
 * aligning the stub to the headword, and the anchor rule (locate the
 * stub's final consonant in the headword) resolves only 1,468 of the
 * 2,241 stubs. Of the residue, 527 have a final consonant absent from
 * the headword entirely (the ס/צ interchange, `אִיצְ׳` for `אִיסְטְבָא`),
 * 220 are ambiguous, and 26 recover no lexical tail. This rule expands
 * what resolves uniquely and leaves everything else EXACTLY as found;
 * the residue is carried in the catalogue as
 * `abbrev-stub-unresolvable-tail`, `route: judgment`.
 *
 * Three scope guards, each one a way to corrupt correct data:
 *
 * - **Geresh U+05F3 only.** A loose apostrophe class would admit 16
 *   genuine acronym lexemes spelled with gershayim U+05F4 — correct
 *   data, and the audit's named failure mode ("that is the failure
 *   mode to guard against").
 * - **Phrase lemmas are not ours.** 244 occurrences are multi-word
 *   compounds with the headword token stubbed (`בֵּית ז׳`, `נְהַר פּ׳`,
 *   `בַּר תַּ׳`). They are not spellings of the headword at all, they
 *   expand by a different rule — substitute the headword, not splice a
 *   tail — and the audit carved them out to `phrase-alt-headword-stub`.
 *   Expanding one here would file a phrase into the alt-spelling index
 *   as a spelling. A trailing Roman homograph numeral is stripped
 *   before the multi-word test, so `זִי׳ II` is not mistaken for one.
 * - **No lexical tail, no expansion.** When the anchor is the
 *   headword's own last consonant, "expanding" would only delete the
 *   geresh and so assert that a truncation is a full spelling.
 *
 * Two shapes the naive splice gets wrong, both load-bearing:
 *
 * - 88 members are also parenthesized (`(אֲגִיח׳)`, and `(אַפִּי׳` with
 *   the paren unclosed), so the stub is unwrapped before expanding.
 * - The stub carries its own niqqud on its final consonant, and the
 *   tail begins at the headword's matching consonant + 1 — the same
 *   point. Concatenating the bare stub whole therefore DOUBLES that
 *   vowel point (`קִירְ׳` + `ְיָה II` → `קִירְְיָה II`), on 1,212 of the
 *   1,468 resolvable occurrences. The stub is cut back to its final
 *   consonant so every mark after the anchor comes from the headword,
 *   which is how the audit reads the expansion too: `חֵיבְ׳` → `חֵיבְלָא`.
 *   175 members carry a Roman homograph numeral, which rides through
 *   on the tail unchanged.
 *
 * `allows` is empty, but the rule DOES duplicate text: the recovered
 * tail is copied out of this entry's own `headword`, and `textOf`
 * covers `headword` and `alt_headwords` alike — so under a plain
 * sub-multiset the tail's codepoints appear twice against an input
 * that held them once, and the gate would reject a rule that invented
 * nothing. `copied` is the mechanism (spec §5.1, maintainer ruling of
 * 2026-08-22): the rule declares the tail, the gate verifies it really
 * occurs in that entry's input before crediting it. A static `allows`
 * cannot express this, because the tail differs per entry. One copy is
 * declared per expansion, never per entry — the credit is a multiset,
 * so two expansions sharing a tail must declare it twice.
 */
import type { SourceEntry } from '../../body/types.ts';
import type { Rule, TransformRecord } from '../types.ts';

// Hoisted per lint/performance/useTopLevelRegex.

/** Hebrew geresh U+05F3, the abbreviation mark — and the whole scope.
 * NOT gershayim U+05F4, which marks acronyms. */
const GERESH = /׳/u;

/** A Hebrew letter, final forms included (U+05D0–U+05EA). Niqqud and
 * the geresh itself sit outside this range, which is what makes it
 * usable as "the last real letter". */
const CONSONANT = /[א-ת]/u;

/** The wrapping an alt-headword stub may carry: the parens of the 88
 * doubly-marked members, and the geresh itself. */
const WRAPPER = /[()׳]/gu;

/** A trailing Roman homograph numeral (`קִירְ׳ II`). Stripped only to
 * ask whether the item is multi-word; the expansion keeps it. */
const ROMAN_TAIL = /\s+[IVX]+\s*$/u;

/** Any whitespace — after the Roman numeral is stripped, its presence
 * means a multi-word phrase lemma, which belongs to
 * `phrase-alt-headword-stub`. */
const SPACE = /\s/u;

/** One resolved expansion: the full replacement item, and the tail
 * spliced onto it — which is the string that must be declared as
 * `copied`, since only the tail is duplicated text. */
interface Expansion {
	expansion: string;
	tail: string;
}

/**
 * Expand one stub against its headword, or `undefined` when the anchor
 * rule does not resolve it uniquely — the 34.5% the audit measured as
 * indeterminate, which this rule leaves exactly as found.
 *
 * The anchor is the stub's final consonant located in the headword. A
 * unique hit means everything after it in the headword is the tail the
 * abbreviation elided; anything else — absent, ambiguous, or leaving
 * no lexical tail — is residue.
 */
function expand(stub: string, headword: string): Expansion | undefined {
	if (SPACE.test(stub.replace(ROMAN_TAIL, '').trim())) {
		return undefined;
	}
	const bare = [...stub.replace(WRAPPER, '')];
	const cut = bare.findLastIndex((ch) => CONSONANT.test(ch));
	const anchorChar = bare[cut];
	if (anchorChar === undefined) {
		return undefined;
	}
	const letters = [...headword];
	const hits = letters.flatMap((ch, at) => (ch === anchorChar ? [at] : []));
	const anchor = hits[0];
	if (hits.length !== 1 || anchor === undefined) {
		return undefined;
	}
	const tail = letters.slice(anchor + 1).join('');
	if (!CONSONANT.test(tail)) {
		return undefined;
	}
	return { expansion: bare.slice(0, cut + 1).join('') + tail, tail };
}

const abbrevInAltHeadwords: Rule = {
	apply: (entry: SourceEntry) => {
		const copied: string[] = [];
		const records: TransformRecord[] = [];
		const next = (entry.alt_headwords ?? []).map((alt) => {
			if (!GERESH.test(alt)) {
				return alt;
			}
			const resolved = expand(alt, entry.headword);
			if (resolved === undefined || resolved.expansion === alt) {
				return alt;
			}
			// The tail came out of this entry's headword — declare it so
			// the gate verifies the copy rather than reading it as
			// invention. One declaration per expansion (spec §5.1).
			copied.push(resolved.tail);
			records.push({
				detail: `${alt} → ${resolved.expansion}`,
				rid: entry.rid,
				ruleId: 'abbrev-in-alt-headwords',
			});
			return resolved.expansion;
		});
		return {
			copied,
			entry: records.length === 0 ? entry : { ...entry, alt_headwords: next },
			records,
		};
	},
	id: 'abbrev-in-alt-headwords',
	phase: 'text-repairs',
};

export type { Expansion };
export { abbrevInAltHeadwords, expand };
