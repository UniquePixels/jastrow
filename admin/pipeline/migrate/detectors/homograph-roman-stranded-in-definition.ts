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
 * headword rewrites a namespace 37 live anchors name, against the 3
 * that mis-resolve today, and the anchor side
 * (`homograph-numbering-schism`) is itself judgment — so the entry
 * side cannot be repaired alone without making the corpus worse.
 */
import { textOf } from '../gates.ts';
import type { TruthEntry } from '../types.ts';
import { type ClassRow, entryRow } from './row.ts';

const HOMOGRAPH_ROMAN_STRANDED = 'homograph-roman-stranded-in-definition';

/** What the review report tells a reader to do about these rows. */
const HOMOGRAPH_ROMAN_STRANDED_ACTION =
	'Leave it until the anchor side is settled: moving the numeral into the headword alone would dangle 37 live anchors against the 3 that mis-resolve today.';

/** A leading Roman numeral, optionally after a comma, refused before
 * a lower-case letter or an apostrophe. */
const LEADING_ROMAN = /^\s*,?\s*(?<numeral>[IVXLC]+)(?![\p{Ll}'’])/u;

/** One row per entry whose lead gloss opens with a numeral its
 * headword does not carry. */
function detectHomographRomanStranded(entry: TruthEntry): ClassRow[] {
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
