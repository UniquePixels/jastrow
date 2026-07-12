/**
 * Sense-label normalization + print regeneration (design doc §2/§3 B6,
 * entry-body-model plan Task 7). `sense.number` in the source is a raw
 * print-form token ("1)", "—2)", "*2)") — this module parses it into the
 * normalized `{ label, star, dash }` triple the body model stores, and
 * regenerates the exact source string back from that triple. Anything
 * outside the measured shape is quarantined: `parseLabel` returns `null`
 * rather than guessing.
 *
 * Value space measured across the full corpus (32,512 entries,
 * `data/source/jastrow-dictionary.jsonl`, 10,186 sense.number
 * occurrences, 22 distinct values): every value is `N)` (bare digits,
 * 4,631 occurrences across "1)".."4)"), `—N)` (em-dash prefixed, 5,442
 * occurrences across "—1)".."—10)"), or `*N)` (star prefixed, no dash
 * combination observed, 107 occurrences across "*1)".."*6)"). Two shapes
 * fall outside that grammar and are unparseable by design: `"[1)"` (one
 * occurrence, rid D00341 — a bracket where a digit belongs, upstream
 * OCR/transcription damage) and `"-2)"` (five occurrences — ASCII
 * hyphen-minus U+002D standing in for the em dash U+2014 elsewhere used
 * for the same continuation marker). Both quarantine to `null` rather
 * than being silently coerced into the em-dash form, since coercing
 * would break byte-exact regeneration for those five source strings.
 *
 * Letter labels ("a)", "—b)") are not attested in the raw `number` field
 * anywhere in the corpus today — lettered sub-senses (Task 6, B5) are
 * split from running prose, not carried as a `number` value — but the
 * grammar here accepts a single letter alongside digits so the same
 * parser covers labels synthesized for lettered sub-senses later.
 */

interface ParsedLabel {
	dash: boolean;
	label: string;
	star: boolean;
}

// `dash`: leading em dash (U+2014). `star`: star flag. `label`: the
// label body — one or more digits, or a single letter. No other
// character survives between the optional prefixes and the closing
// paren; anything else (bracket, ASCII hyphen, missing paren, bare
// number with no paren) fails to match and quarantines to null.
const LABEL = /^(?<dash>—)?(?<star>\*)?(?<label>\d+|[A-Za-z])\)$/u;

/** Parse a raw source `sense.number` token into its normalized parts, or
 * `null` when the token falls outside the measured print-form grammar
 * (quarantine — never guess at a value not seen in the corpus). */
function parseLabel(raw: string): ParsedLabel | null {
	const match = LABEL.exec(raw);
	if (!match?.groups) {
		return null;
	}
	const { dash, star, label } = match.groups;
	return {
		dash: dash !== undefined,
		label: label ?? '',
		star: star !== undefined,
	};
}

/** Regenerate the exact source print-form string for a parsed label.
 * Byte-exact inverse of `parseLabel` for every value it accepts: dash
 * prefix first, then star, then the label body and closing paren. */
function printLabel(parsed: ParsedLabel): string {
	const dash = parsed.dash ? '—' : '';
	const star = parsed.star ? '*' : '';
	return `${dash}${star}${parsed.label})`;
}

export type { ParsedLabel };
export { parseLabel, printLabel };
