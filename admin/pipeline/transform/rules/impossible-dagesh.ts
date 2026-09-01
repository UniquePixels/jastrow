/**
 * `impossible-dagesh` — a dagesh standing on a letter that cannot take
 * one, announcing its own correction.
 *
 * ## The defect
 *
 * Measured over all 32,512 entries after `applyRepairs`: **19
 * occurrences across 17 entries**, reproducing the catalogue exactly,
 * and splitting ר **15** / ח **4**. א, ע and ה yield **zero**, so the
 * signal is clean rather than a threshold — a ה carrying a dagesh is an
 * ordinary mappiq and the corpus holds **1,268** of them, every one of
 * which this rule must leave alone.
 *
 * ## Why this is a CORRECTION and not an invention
 *
 * Maintainer ruling (Brian, 2026-08-11), carried as
 * [[project_ocr_correction_ruling]]: "Correcting an obvious OCR error
 * is not adding to the text." A mis-recognized glyph was never the
 * source's content, so restoring it does not compose content. The
 * ruling's own condition is that a new confusion class be held to "an
 * equally closed, enumerable grammar", and this one is closed by the
 * MARK rather than by a word list:
 *
 * - **The forte arm.** A dagesh between vowels is forte, and a forte
 *   dagesh marks a DOUBLED letter. ר is not a letter Hebrew doubles, so
 *   the mark itself says the letter beneath it is wrong, and ד is the
 *   letter ר is confused with — the canonical scribal pair, and the one
 *   the row's own `reason` names. `קִירּוּשׁ` for `קִידּוּשׁ`,
 *   `סִירּוּק` for `סִידּוּק`, `פַּנְרּוּרָה` for `פַּנְדּוּרָה`.
 * - **The mappiq arm.** A word-final dagesh is a mappiq, and ה is the
 *   only letter that takes one. `הִכְחִישָׁחּ` for `הִכְחִישָׁהּ`.
 *
 * ## What it declines, and why the decline is the argument
 *
 * **13 of the 19.** The other 6 are refused because the mark announces
 * NOTHING there, which is exactly the row's own reasoning applied
 * honestly:
 *
 * | Shape | Count | Why it is refused |
 * |---|---:|---|
 * | ר + dagesh, no vowel after | 5 | neither forte nor mappiq |
 * | ח + dagesh, mid-word | 1 | not a mappiq position |
 *
 * `A01756 כרּז`, `K00311 שָׁרּ`, `R00344` twice, `R00346 צירּ` and
 * `Q00891 פִּיחּוּחֵי` stay on the row, recorded in
 * `docs/v2/transform-batch-10.md` §3 rather than by a second entry in
 * `PENDING` — a row named in `RULES` and in that list is `duplicated`,
 * which `registry.test.ts` forbids.
 *
 * ATTESTATION IS NOT THE STANDARD HERE, and it was measured before
 * being set aside: only **5 of the 19** corrections are attested
 * verbatim elsewhere in the corpus, because Jastrow spells most of
 * these words plene in other entries (`חִידּוּשׁ` beside `חִדּוּשׁ`).
 * A twin test would ship 5 and refuse 8 correct repairs. The evidence
 * for this row is the MARK, not the vocabulary — which is the whole
 * difference between a glyph correction and the spelling
 * reconstruction [[project_no_vowel_inference]] rules out.
 *
 * The rule sits BESIDE the recalibrated `hebrew-rare-confusable`
 * detector rather than inside it: `פַּנְדּוּרָה` and `סִידּוּק` do not
 * clear that detector's ≥100x threshold.
 *
 * ## Scope
 *
 * Measured: **0 of the 19 sit inside a tag and 0 sit in a headword.**
 * So this rule writes no link target and no namespace key, and needs
 * neither a `link-target.ts` case nor an exception table — unlike its
 * two batch-10 siblings, which need both.
 */
import type { SourceEntry } from '../../body/types.ts';
import { mapFields } from '../fields.ts';
import type { Rule, TransformResult } from '../types.ts';

/** The two letters that cannot carry a dagesh and do occur with one.
 * א and ע cannot either and occur with one ZERO times, so naming them
 * would be a claim about the corpus this rule has no instance of. */
const IMPOSSIBLE = /([\u05E8\u05D7])\u05BC/gu;
/** What makes a dagesh FORTE: a vowel point, or the mater vav that
 * spells one. All 10 forte instances in the corpus are followed by a
 * vav; the class is written for the linguistic fact rather than for
 * that coincidence, and `impossible-dagesh.corpus.test.ts` pins 10. */
const VOWEL_FOLLOWS = /^(?:[\u05B0-\u05BC\u05C7]|\u05D5)/u;
/** A Hebrew letter or point — what a word-final mark is NOT followed
 * by. */
const WORD_CONTINUES = /^(?:[\u05D0-\u05EA]|\p{Mn})/u;
const RESH = 'ר';
const DALET = 'ד';
const HE = 'ה';

/** The letter `mark` should be standing on, or `undefined` when it
 * stands on nothing this rule can name. `after` is the text following
 * the dagesh, which is what decides both arms. */
function correction(letter: string, after: string): string | undefined {
	if (letter === RESH) {
		return VOWEL_FOLLOWS.test(after) ? DALET : undefined;
	}
	return WORD_CONTINUES.test(after) ? undefined : HE;
}

/** `text` with every announced glyph corrected, or `null` when the
 * rule declines every candidate it found — which is what lets
 * `mapFields` hand a declining call the caller's own entry back. */
function repairDagesh(text: string): string | null {
	let moved = false;
	const out = text.replace(IMPOSSIBLE, (whole, letter: string, at: number) => {
		const swap = correction(letter, text.slice(at + whole.length));
		if (swap === undefined) {
			return whole;
		}
		moved = true;
		return `${swap}ּ`;
	});
	return moved ? out : null;
}

/**
 * Corrects the letter beneath an impossible dagesh.
 *
 * `allows` NAMES TWO LETTERS AND THAT IS A MAINTAINER RULING, not a
 * convenience: `checkNoNewText` compares codepoint multisets, and
 * swapping ר for ד raises this entry's ד count by one. The ruling is
 * [[project_ocr_correction_ruling]]; the blast radius is the predicate
 * above, which fires only where a dagesh already stands on a letter
 * that cannot carry one — 19 places in 32,512 entries.
 */
const impossibleDagesh: Rule = {
	allows: [DALET, HE],
	apply(entry: SourceEntry): TransformResult {
		const healed = mapFields(entry, (text) => repairDagesh(text) ?? text);
		return healed === undefined
			? { entry, records: [] }
			: {
					entry: healed,
					records: [
						{
							detail: 'letter under an impossible dagesh corrected',
							rid: entry.rid,
							ruleId: 'impossible-dagesh',
						},
					],
				};
	},
	id: 'impossible-dagesh',
	phase: 'text-repairs',
};

export { impossibleDagesh, repairDagesh };
