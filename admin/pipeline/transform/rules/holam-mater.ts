/**
 * `holam-migrated-off-mater-vav` — the holam of a holam male attached
 * to the consonant BEFORE its mater vav instead of to the vav itself.
 *
 * ## The defect
 *
 * The corpus stores `<letter, dagesh, holam> + bare ו` where it should
 * store `<letter, dagesh> + <ו, holam>`. The dot renders over the wrong
 * letter and exact-string lookup fails.
 *
 * Measured over all 32,512 entries after `applyRepairs`, in the fields
 * `fields.ts` writes: **1,007 occurrences across 457 entries** against
 * **43,664** correctly-encoded holam males. Headwords alone are **106
 * occurrences across 103 entries**, reproducing the catalogue exactly.
 *
 * TWO CONTROLS KILL THE "IT IS JUST THIS CORPUS'S CONVENTION" READING,
 * both from the row's own audit: ten headwords carry BOTH encodings in
 * ONE string (`A02608 אָפֹּובַּלְסְמוֹן` is wrong on `פֹּו` and right on
 * `מוֹן`), and 56 of the 103 bad headwords have their corrected
 * spelling attested verbatim elsewhere. A preceding dagesh raises the
 * failure rate about twentyfold (87/860 against 19/3,647) without being
 * deterministic.
 *
 * ## The repair moves a codepoint and invents nothing
 *
 * Which is why it survives [[project_no_vowel_inference]] — nothing is
 * inferred from a neighbouring field; the mark is already there and is
 * put where it belongs. It is also why `checkNoNewText` is BLIND to
 * this rule: a move preserves the multiset, so that gate returns clean
 * over all 457 touched entries no matter where the mark lands. The
 * safety argument lives in `holam-mater.corpus.test.ts` and in
 * `link-target.ts` case 9, not in the text gate.
 *
 * ## It rewrites link targets, and it has to
 *
 * **442 of the 1,007 sit inside a `data-ref` or `href`.** The
 * corruption is self-consistent: all 218 anchors carrying it point at a
 * headword carrying the same defect, measured `refResolvesNeither`
 * **0**. Repair one side and every one of those links breaks; repair
 * both and all 218 keep resolving. So the rule declares each repaired
 * target through `TransformResult.pointed` — case 9, spec
 * `docs/specs/2026-09-01-link-target-gate-case-9.md`.
 *
 * ## The one headword it refuses
 *
 * Repairing every defect makes exactly ONE pair of entries share a
 * headword:
 *
 * ```text
 * T00795  רִמּוֹן   (b. h.)   already correct
 * T00796  רִמֹּון   ( ch. )   damaged — and its own language_reference
 *                             points at `Jastrow, רִמּוֹן 1` as `same`
 * ```
 *
 * Two entries spelled alike leave `Jastrow, רִמּוֹן 1` naming neither —
 * [[feedback_headword_is_a_namespace]]. A rule cannot see the corpus,
 * so the exception is frozen here as one headword and re-derived from
 * the live snapshot by `holam-mater.corpus.test.ts`, the way
 * `vSubRedirectTwin` carries its 50-row table. The entry's other fields
 * are repaired normally: only the namespace key is held back.
 */
import type { SourceEntry } from '../../body/types.ts';
import { mapFields } from '../fields.ts';
import { tokenize } from '../html.ts';
import { anchors } from '../links.ts';
import { fieldsOf } from '../no-new-text.ts';
import type { Rule, TransformResult } from '../types.ts';

/** A consonant, its other marks, the HOLAM, its other marks, then an
 * UNPOINTED vav.
 *
 * U+05B9 is cut out of both mark classes rather than left to
 * backtracking: the class it sits in would otherwise let a greedy run
 * swallow the very mark the pattern is looking for. THE TRAILING
 * LOOKAHEAD IS WHAT MAKES THE VAV A MATER — a vav carrying a point of
 * its own is a consonant, and `שָׁוֶה` holds no holam male at all. */
const MIGRATED =
	/([\u05D0-\u05EA])([\u05B0-\u05B8\u05BA-\u05BC\u05BF\u05C1\u05C2\u05C7]*)\u05B9([\u05B0-\u05B8\u05BA-\u05BC\u05BF\u05C1\u05C2\u05C7]*)\u05D5(?![\u0591-\u05C7])/gu;

/** `T00796`'s headword — the single repair this rule declines, because
 * it would collide with `T00795`'s. Frozen here and re-derived from the
 * snapshot by the corpus gate. */
const COLLIDING_HEADWORD = 'רִמֹּון';

/** `text` with every migrated holam moved onto its mater vav, or
 * `null` when it holds none.
 *
 * The decline is read off the RESULT rather than from a `.test` guard:
 * `test` on a `/g` pattern leaves `lastIndex` advanced, so a hoisted
 * regex asked twice answers the second question from the middle of the
 * first string. */
function migrateHolam(text: string): string | null {
	const out = text.replace(
		MIGRATED,
		(_match, letter: string, before: string, after: string) =>
			`${letter}${before}${after}\u05D5\u05B9`,
	);
	return out === text ? null : out;
}

/** Every `href` and `data-ref` the entry's input holds, deduplicated —
 * the strings a case-9 claim's `from` must come from. */
function targetsOf(entry: SourceEntry): Set<string> {
	const found = new Set<string>();
	for (const field of fieldsOf(entry)) {
		for (const anchor of anchors(tokenize(field))) {
			found.add(anchor.dataRef);
			found.add(anchor.href);
		}
	}
	found.delete('');
	return found;
}

/** One case-9 claim for every input target the repair rewrites, sorted
 * so two runs declare the same list in the same order.
 *
 * No `adds`: this rule only ever MOVES a mark, so `target`'s point
 * multiset is `from`'s, and clause 5 has nothing to account for. */
function claimsFor(entry: SourceEntry): { from: string; target: string }[] {
	const claims: { from: string; target: string }[] = [];
	for (const from of [...targetsOf(entry)].sort()) {
		const target = migrateHolam(from);
		if (target !== null) {
			claims.push({ from, target });
		}
	}
	return claims;
}

/**
 * Moves a migrated holam onto its mater vav.
 *
 * No `allows`: the repair relocates a codepoint the input already
 * holds, so the text gate's sub-multiset test passes by construction —
 * which is exactly why it cannot see this rule and why the corpus gate
 * exists.
 */
const holamMaterMigration: Rule = {
	apply(entry: SourceEntry): TransformResult {
		const healed = mapFields(entry, (text) => migrateHolam(text) ?? text);
		if (healed === undefined) {
			return { entry, records: [] };
		}
		const kept =
			entry.headword === COLLIDING_HEADWORD
				? { ...healed, headword: entry.headword }
				: healed;
		return {
			entry: kept,
			pointed: claimsFor(entry),
			records: [
				{
					detail: 'holam moved onto its mater vav',
					rid: entry.rid,
					ruleId: 'holam-migrated-off-mater-vav',
				},
			],
		};
	},
	id: 'holam-migrated-off-mater-vav',
	phase: 'text-repairs',
};

export { COLLIDING_HEADWORD, holamMaterMigration, migrateHolam };
