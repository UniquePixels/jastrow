/**
 * The gershayim predicate and substitution (batch-3a spec §4.1).
 *
 * Jastrow's print sets Hebrew abbreviations with `״` (U+05F4). The
 * corpus writes an ASCII `"`. The predicate is that quote with a
 * Hebrew letter on BOTH sides, which is what makes it selective enough
 * to be safe: the 256,432 walked fields hold 1,349,919 ASCII quotes
 * and 2,305 of them are this defect. Almost every other one is an
 * attribute delimiter, and a rule that reached for `"` without this
 * test would rewrite the corpus's markup wholesale — invisibly, since
 * the text gate strips tags before comparing and the markup gate
 * compares a well-formedness delta rather than well-formedness.
 *
 * The substitution is IN PLACE and nothing else happens: no character
 * is inserted, deleted or moved, so output length always equals input
 * length. That is the whole safety argument for the rules' `allows`,
 * and it is a statement about this module rather than about the
 * corpus — see `rules/gershayim.ts`, which spells out why the corpus
 * phrasing of it does not survive composition.
 *
 * Two functions rather than one because the two catalogue rows split
 * by LOCUS, not by predicate: `repairText` takes occurrences in
 * document text, `repairTags` takes occurrences inside a `<…>` tag.
 * Their populations are disjoint and neither can create or destroy the
 * other's, because the substitution never introduces or removes a `<`
 * or a `>` — so composing them in either order gives the same string,
 * and `rules/gershayim.test.ts` measures that over all 32,512 entries
 * rather than asserting it.
 *
 * `TAG` here is `<[^<>]*>`, which is deliberately NOT `html.ts`'s
 * tokenizer regex. It is the mask the spec's own scope measurement
 * used, so the counts these functions produce are the counts §2
 * publishes; and it is the conservative reading of the two — a `<`
 * with no `>` before the next `<` is text to it, where the tokenizer's
 * `[^>]*` would swallow across it. The only place the two disagree is
 * the pair of tags whose `href` swallows their own `</a>`, and the
 * corpus tier gates every entry through `checkLinkTargets` precisely
 * so that disagreement cannot become a silent edit inside an
 * attribute.
 */
import { HEBREW, HEBREW_ATOM } from './html.ts';

/** U+05F4 HEBREW PUNCTUATION GERSHAYIM — the mark the corpus should
 * have written and the ONLY character this module ever produces. */
const GERSHAYIM = '״';

/**
 * A `"` with a Hebrew letter either side, both sides zero-width.
 *
 * Every part of this is load-bearing and each was measured (spec §2).
 * LOOKAROUND, not a consuming group: `[HEBREW]"[HEBREW]` with the `g`
 * flag matches `X"Y` in `X"Y"Z` and resumes past `Y`, so the second
 * quote is never seen — 2 occurrences (A00253, U01408). And the
 * lookbehind uses `HEBREW_ATOM`, which carries `̇*`, because a
 * Hebrew letter may hold a combining mark between itself and the
 * quote — 1 occurrence (M01940). In scope: 2,302 with a consuming
 * pattern, 2,304 with a bare lookbehind, 2,305 with this one.
 *
 * The tolerance is load-bearing in the other direction too. `HEBREW`
 * admits the points and accents (U+0591–U+05C7) as class members, so
 * the four `מַנְצְפַ"ךְ` occurrences — a patah between the letter and the
 * quote — are matched by the class itself; narrowing the lookbehind to
 * bare letters would refuse four honest repairs as well as losing one.
 *
 * `HEBREW_ATOM` was module-private in `html.ts` until this batch;
 * batch 3a exports it rather than restating `[HEBREW]̇*` here, so
 * the corpus keeps one definition of "a Hebrew letter with its marks".
 */
const FLANKED = new RegExp(`(?<=${HEBREW_ATOM})"(?=[${HEBREW}])`, 'gu');

/** A `<…>` run holding no angle bracket of its own. See the module
 * doc on why this is not `html.ts`'s tokenizer regex. */
const TAG = /<[^<>]*>/gu;

/** Replace every flanked quote in `value`.
 *
 * The `includes` guard is not only a fast path over a 41 MB corpus: it
 * also returns the SAME string reference for the overwhelming majority
 * of fields, which is what lets the rules above compare with `!==` and
 * hand back the caller's own entry object unchanged. */
function repairAll(value: string): string {
	return value.includes('"') ? value.replace(FLANKED, GERSHAYIM) : value;
}

/** Repair document text, leaving every `<…>` tag byte-identical. */
function repairText(value: string): string {
	if (!value.includes('"')) {
		return value;
	}
	let out = '';
	let at = 0;
	TAG.lastIndex = 0;
	let match = TAG.exec(value);
	while (match !== null) {
		out += repairAll(value.slice(at, match.index)) + match[0];
		at = match.index + match[0].length;
		match = TAG.exec(value);
	}
	return out + repairAll(value.slice(at));
}

/** Repair `<…>` tag interiors, leaving every text run byte-identical. */
function repairTags(value: string): string {
	return value.includes('"') ? value.replace(TAG, repairAll) : value;
}

export { GERSHAYIM, repairTags, repairText };
