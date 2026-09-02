/**
 * `vkh-geresh-loss` — the ubiquitous abbreviation `וכ׳` written bare
 * as `וכ`, its geresh dropped.
 *
 * ## The null model is the argument
 *
 * Measured over all 32,512 entries after `applyRepairs`: **11
 * occurrences across 11 entries** against **17,254** correct
 * spellings — 99.94%. The catalogue's figures exactly.
 *
 * That ratio is what licenses a MINT here, and it is the same argument
 * `sectionBreakTerminator` shipped on in batch 7 (7,250 correct against
 * 11). A slot that is populated 17,254 times and empty 11 is not a
 * convention with a minority form; it is one form with eleven defects.
 *
 * The generalised probe behind the row is worth keeping: over every
 * geresh abbreviation of ≥2 letters with ≥200 corpus occurrences, `וכ`
 * is the ONLY clean signal — the other candidates, `אפי׳` and `בק׳`,
 * are also real words, so their bare forms carry no information.
 *
 * ## The four refusals, and one of them is the whole of the difference
 *
 * A naive probe returns 17, not 11, and the six it adds are not this
 * defect:
 *
 * - **Notarikon.** `K00463`, `K01215`, `K01217`, `K01358` and `S00372`
 *   write `וכ̇` with a combining dot inside an acrostic —
 *   `ז̇ת̇ר̇ וכ̇ר̇כ̇ס`. The dot is the acrostic's own mark and the
 *   word is not an abbreviation.
 * - **Longer words**, **an already-correct geresh** and **a preceding
 *   Hebrew letter** account for the rest.
 *
 * ## Scope
 *
 * Measured: **0 of the 11 sit inside a tag and 0 sit in a headword.**
 * All eleven are inside a `dir="rtl"` run in a definition. So this rule
 * writes no link target and no namespace key.
 */
import type { SourceEntry } from '../../body/types.ts';
import { mapFields } from '../fields.ts';
import type { Rule, TransformResult } from '../types.ts';

/** U+05F3 HEBREW PUNCTUATION GERESH — the mark this rule mints. */
const GERESH = '׳';
/** The abbreviation with nothing of its own word around it: no Hebrew
 * letter or mark before the vav, and nothing after the kaf that would
 * make it part of a word, a notarikon or an already-correct spelling.
 *
 * The trailing class names the ASCII and Hebrew quote marks as well as
 * the geresh, because Jastrow's own text writes `וכ"` where a
 * gershayim stands and a rule that took those for bare abbreviations
 * would mint a second mark beside an existing one.
 *
 * THE MARK SIDE IS `\\p{Mn}`, NOT A HEBREW RANGE, AND THAT IS THE
 * NOTARIKON CLAUSE. The acrostic dot Jastrow prints over each letter is
 * U+0307 COMBINING DOT ABOVE — a GENERIC nonspacing mark, outside the
 * Hebrew block entirely. A lookaround that stopped at U+05C7 reads
 * `וכ̇ר̇` as a bare abbreviation and mints a geresh between the kaf and
 * its own dot. */
const BARE_VKH =
	/(?<!(?:[\u05D0-\u05EA]|\p{Mn}))וכ(?!(?:[\u05D0-\u05EA\u05F3\u05F4'"]|\p{Mn}))/gu;

/** `text` with the geresh restored on every bare abbreviation, or
 * `null` when it holds none.
 *
 * The decline is read off the RESULT rather than from a `.test` guard,
 * and deliberately: `RegExp.prototype.test` on a `/g` pattern advances
 * `lastIndex` and leaves it advanced, so a hoisted regex asked twice
 * answers the second question from the middle of the first string. */
function restoreVkhGeresh(text: string): string | null {
	const out = text.replace(BARE_VKH, (whole) => `${whole}${GERESH}`);
	return out === text ? null : out;
}

/**
 * Restores the geresh on `וכ`.
 *
 * `allows` NAMES THE GERESH AND THAT IS A MINT — the second in the
 * registry after `sectionBreakTerminator`'s period and
 * `seeParticleRestore`'s word. It is justified by the null model in the
 * module doc and by nothing else; the predicate is what bounds it.
 */
const vkhGereshRestore: Rule = {
	allows: [GERESH],
	apply(entry: SourceEntry): TransformResult {
		const healed = mapFields(entry, (text) => restoreVkhGeresh(text) ?? text);
		return healed === undefined
			? { entry, records: [] }
			: {
					entry: healed,
					records: [
						{
							detail: 'geresh restored on the abbreviation וכ׳',
							rid: entry.rid,
							ruleId: 'vkh-geresh-loss',
						},
					],
				};
	},
	id: 'vkh-geresh-loss',
	phase: 'text-repairs',
};

export { GERESH, restoreVkhGeresh, vkhGereshRestore };
