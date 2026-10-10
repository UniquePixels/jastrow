/**
 * Review detector — `homograph-roman-stranded-in-definition`
 * (catalogue: 23 entries). `senses[0].gloss` opens with the printed
 * Roman homograph numeral while `headword.homograph` carries none, so
 * the entry is unaddressable and an anchor naming the numbered form
 * mis-resolves (`U01138` reads a bare שְׁכַח opening " I ch. (Hebraism)"
 * while `U01139` carries an explicit שְׁכַח II).
 *
 * Two guards the class names for itself: the numeral is refused
 * before a letter or an apostrophe, which is what keeps "V'elleh" and
 * "Cæsarean" out. The comma is optional because the stranded numeral
 * is sometimes preceded by the comma that once separated it.
 *
 * DETECT ONLY, and the row says why: moving the numeral into the
 * headword TEXT rewrites a namespace 37 live anchors name, against the
 * 3 that mis-resolve today, and the anchor side
 * (`homograph-numbering-schism`) is itself judgment — so the entry
 * side cannot be repaired that way without making the corpus worse.
 * Since 2026-10-09 a reviewed `reform` can set the numeral BESIDE the
 * line (`homographs`, decisions.md row 10-09 reform homographs), which
 * leaves the namespace alone; a print read still decides each row, and
 * eight were repaired so from the 2026-10-06 reads.
 */

import type { Entry } from '../../../entry/types.ts';
import { textOf } from '../gates.ts';
import { type ClassRow, entryRow } from './row.ts';

/** Catalogue id and report `kind` for a lead gloss opening with the
 * printed Roman homograph numeral its headword does not carry — the
 * reader sees the definition numbered while the entry presents itself
 * as unnumbered, and an anchor naming the numbered form lands on
 * another entry. */
const HOMOGRAPH_ROMAN_STRANDED = 'homograph-roman-stranded-in-definition';

/** What the review report tells a reader to do about these rows. */
const HOMOGRAPH_ROMAN_STRANDED_ACTION =
	'Read the print. If it sets the numeral beside the headword, a reviewed `reform` sets it with `homographs` (the headword text, which 37 live anchors name, is left alone) and a companion patch takes it out of the definition. Never write the numeral into the headword text.';

/** A leading Roman numeral, optionally after a comma, refused before
 * a lower-case letter or an apostrophe. The lookahead also refuses any
 * further numeral letter, D and M included, so `[IVXLC]+` cannot give
 * back a letter to match a shorter numeral (`IIa` is not `I`, `IVM`
 * is not `IV`). */
const LEADING_ROMAN = /^\s*(?:,\s*)?(?<numeral>[IVXLC]+)(?![IVXLCDM\p{Ll}'’])/u;

/** One row per entry whose lead gloss opens with a numeral its
 * headword does not carry. */
function detectHomographRomanStranded(entry: Entry): ClassRow[] {
	if (entry.headwords[0]?.homograph !== undefined) {
		return entryRow(entry, HOMOGRAPH_ROMAN_STRANDED, []);
	}
	const lead = entry.senses[0];
	const numeral =
		lead === undefined
			? undefined
			: LEADING_ROMAN.exec(textOf(lead.gloss))?.groups?.['numeral'];
	return entryRow(
		entry,
		HOMOGRAPH_ROMAN_STRANDED,
		numeral === undefined
			? []
			: [`senses[0].gloss opens "${numeral}"; headword carries no homograph`],
	);
}

export {
	detectHomographRomanStranded,
	HOMOGRAPH_ROMAN_STRANDED,
	HOMOGRAPH_ROMAN_STRANDED_ACTION,
};
