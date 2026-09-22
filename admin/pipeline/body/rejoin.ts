/**
 * Gloss-head rejoin (entry-body-model design §3, B2): pure concatenation
 * of the upstream fragments in print order (Sefaria's own `as_strings`
 * order — morphology marker, language code, language reference/etymology
 * paren, sense-1 text). No separators are invented; whatever whitespace
 * or punctuation Sefaria already put at the edges of each fragment is
 * all that ever appears between them. Round-trip is by construction —
 * offsets record each part's span in the joined string, so splitting is
 * just slicing, never re-parsing. This is what heals the K00664-class
 * mid-phrase paren straddle: the etymology parenthesis that opens in
 * `language_reference` and closes inside the sense-1 definition becomes
 * contiguous text again once the two are concatenated in print order.
 */
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
 * the rejoin invents none, and an etymology paren can straddle two
 * fragments with nothing at all marking the seam. */
interface RejoinOffsets {
	languageCode: [number, number];
	languageReference: [number, number];
	morphology: [number, number];
	senseHead: [number, number];
}

/** Concatenate the four gloss-head fragments of `e` in print order,
 * recording each one's [start, end) span in the joined string. Missing
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
