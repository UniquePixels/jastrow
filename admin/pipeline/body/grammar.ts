/**
 * Grammar index seeding (design doc §2, decision B3 — a typed index
 * annotates the entry without touching its prose). `content.morphology`
 * is a closed vocabulary: the body census (`bun body:census`) measured
 * EXACTLY 8 distinct values corpus-wide (13,162 markers total). VOCAB
 * gives every one of those 8 an explicit row; nothing outside it is
 * guessed (B9) — `parseMarker` reports unknown values instead.
 */
import type { BodyEntry } from './types.ts';

/** Reuses `BodyEntry.grammar`'s shape rather than redeclaring it. */
type GrammarIndex = NonNullable<BodyEntry['grammar']>;

/**
 * The closed vocabulary observed in `data/source/body-census-report.json`
 * `.markers` (value → corpus count):
 *   'm.'          6,970  gender only
 *   'f.'          4,175  gender only
 *   'm. pl.'        629  gender + plural
 *   'pr. n. m.'     534  proper-noun + gender
 *   'pr. n. pl.'    432  proper-noun + plural
 *   'f. pl.'        193  gender + plural
 *   'pr. n.'        173  proper-noun, bare
 *   'pr. n. f.'      56  proper-noun + gender
 *
 * No `c.` (common gender) or dual (`du.`) marker actually occurs in
 * this corpus — the shapes below are still supported for forward
 * compatibility with the parent spec's closed vocabulary, they just
 * have no census row backing them here.
 *
 * The `pr. n.` prefix is a part-of-speech marker (proper noun) — B3's
 * `pos` field is out of scope for this task (design doc §2: "starts
 * null"), so it contributes nothing to `GrammarIndex`. Only the
 * recognizable gender/number token within a compound value is mapped;
 * bare `pr. n.` carries neither and maps to `null` (no index entry) —
 * this is reading the token that's there, not inventing what "proper
 * noun" implies about gender.
 */
const VOCAB: Record<string, GrammarIndex | null> = {
	'm.': { gender: 'm' },
	'f.': { gender: 'f' },
	'c.': { gender: 'c' },
	'm. pl.': { gender: 'm', number: 'pl' },
	'f. pl.': { gender: 'f', number: 'pl' },
	'm. du.': { gender: 'm', number: 'du' },
	'f. du.': { gender: 'f', number: 'du' },
	'pr. n.': null,
	'pr. n. m.': { gender: 'm' },
	'pr. n. f.': { gender: 'f' },
	'pr. n. pl.': { number: 'pl' },
};

/** Parse one `content.morphology` marker into its grammar index. Trims
 * surrounding whitespace, then looks the value up in the closed VOCAB.
 * Never throws and never guesses: a value outside VOCAB comes back as
 * `{unknown}` for the caller to report rather than a manufactured
 * grammar shape. */
function parseMarker(
	marker: string,
): GrammarIndex | { unknown: string } | null {
	const trimmed = marker.trim();
	// Own-key check so inherited object members ("toString") can never
	// masquerade as vocabulary hits.
	if (Object.hasOwn(VOCAB, trimmed)) {
		return VOCAB[trimmed] ?? null;
	}
	return { unknown: marker };
}

export type { GrammarIndex };
export { parseMarker, VOCAB };
