/**
 * Gloss-head rejoin (entry-body-model design §3, B2): the upstream
 * fragments joined in print order (Sefaria's own `as_strings` order —
 * morphology marker, language code, language reference/etymology
 * paren, sense-1 text). Round-trip is by construction — offsets record
 * each part's span in the joined string, so splitting is just slicing,
 * never re-parsing. This is what heals the K00664-class mid-phrase
 * paren straddle: the etymology parenthesis that opens in
 * `language_reference` and closes inside the sense-1 definition becomes
 * contiguous text again once the two are joined in print order.
 *
 * The one thing the join adds is the space print sets between two
 * fields (review ledger L69). Sefaria's extraction trimmed it off both
 * edges at 6,161 seams in 4,884 entries (`m.(b. h.;v. X2)`, `ch.
 * same<i>to tie</i>`), where print reads `m. (b. h.; v. X 2)` and `ch.
 * same to tie`. One space goes between two fields when neither spaces
 * the edge they meet at and print sets none tight there (`seam`):
 * nothing else is added, and whatever whitespace or punctuation the
 * fields carry is kept as it is.
 */
import { serialize, tokenize } from '../../entry/html.ts';
import type { SourceEntry } from '../types.ts';

/** The four fragments a gloss head was concatenated from, recovered:
 * the morphology marker, the language code, the language
 * reference/etymology paren, and sense 1's definition text. Field
 * order here is alphabetical; print order is the order
 * `rejoinGlossHead` joins them in.
 *
 * A fragment the source entry lacked comes back as the empty string,
 * because that is what the rejoin contributed for it — this record
 * cannot tell an absent upstream field from a present empty one, and
 * does not need to, since the joined text is identical either way. */
interface GlossHeadParts {
	languageCode: string;
	languageReference: string;
	morphology: string;
	senseHead: string;
}

// print order is defined in rejoinGlossHead's parts array, not by this
// interface's (alphabetized) field order
/** Each gloss-head fragment's `[start, end)` span in the string
 * `rejoinGlossHead` returned, recorded as it concatenated.
 *
 * Carrying the spans is what makes the round trip exact by
 * construction: `splitGlossHead` recovers the fragments by slicing, so
 * no separator ever has to be parsed back out. That matters because
 * a space between two spans is the rejoin's, in neither field, and an
 * etymology paren can straddle two fragments with nothing at all
 * marking the seam. */
interface RejoinOffsets {
	languageCode: [number, number];
	languageReference: [number, number];
	morphology: [number, number];
	senseHead: [number, number];
}

/** The visible text of an HTML fragment: the entry tokenizer's text
 * tokens, tags skipped, never a one-pass tag regex. */
function visibleText(html: string): string {
	return serialize(tokenize(html).filter((piece) => piece.kind === 'text'));
}

/** What the text before a seam may end in for print to set it tight:
 * whitespace (already spaced), a dash, a hyphen, or an opening paren or
 * bracket. */
const TIGHT_BEFORE_SEAM: RegExp = /[\s([—–-]$/u;

/** What the text after a seam may start with for print to set it
 * tight: whitespace (already spaced), punctuation print sets hard
 * against the word before (`, . : ; ! ?`), a closing paren or bracket,
 * a dash or hyphen, or a closing quote or geresh. */
const TIGHT_AFTER_SEAM: RegExp = /^[\s,.:;!?)\]—–\-’'׳״]/u;

/** A digit at the end, and at the start, of a side's visible text. */
const ENDS_IN_DIGIT: RegExp = /\d$/u;
const STARTS_WITH_DIGIT: RegExp = /^\d/u;

/** The separator between the gloss head built so far (`before`) and
 * the next field (`next`): one space, unless either side's visible
 * text is empty, a side's edge is tight (`TIGHT_BEFORE_SEAM`,
 * `TIGHT_AFTER_SEAM`), or a number runs across the seam (`2` + `2)`:
 * no seam has one, but a space there would split it). */
function seam(before: string, next: string): '' | ' ' {
	const left = visibleText(before);
	const right = visibleText(next);
	if (left === '' || right === '') {
		return '';
	}
	if (TIGHT_BEFORE_SEAM.test(left) || TIGHT_AFTER_SEAM.test(right)) {
		return '';
	}
	return ENDS_IN_DIGIT.test(left) && STARTS_WITH_DIGIT.test(right) ? '' : ' ';
}

/** Join the four gloss-head fragments of `e` in print order, with the
 * space print sets between two of them where neither has kept it
 * (`seam`), recording each one's [start, end) span in the joined
 * string; a separator sits between two spans, in neither. Missing
 * upstream fields contribute an empty string (a zero-length span), not
 * an invented placeholder. */
function rejoinGlossHead(e: SourceEntry): {
	joined: string;
	offsets: RejoinOffsets;
} {
	const parts: [keyof RejoinOffsets, string][] = [
		['morphology', e.content.morphology ?? ''],
		['languageCode', e.language_code ?? ''],
		['languageReference', e.language_reference ?? ''],
		['senseHead', e.content.senses[0]?.definition ?? ''],
	];
	let joined = '';
	const offsets = {} as RejoinOffsets;
	for (const [key, part] of parts) {
		joined += part === '' ? '' : seam(joined, part);
		offsets[key] = [joined.length, joined.length + part.length];
		joined += part;
	}
	return { joined, offsets };
}

/** Recover the four gloss-head fragments from a string previously built
 * by `rejoinGlossHead`, byte-for-byte, using only the recorded offsets —
 * no parsing or pattern matching. */
function splitGlossHead(
	joined: string,
	offsets: RejoinOffsets,
): GlossHeadParts {
	return {
		languageCode: joined.slice(...offsets.languageCode),
		languageReference: joined.slice(...offsets.languageReference),
		morphology: joined.slice(...offsets.morphology),
		senseHead: joined.slice(...offsets.senseHead),
	};
}

export type { GlossHeadParts, RejoinOffsets };
export { rejoinGlossHead, splitGlossHead };
