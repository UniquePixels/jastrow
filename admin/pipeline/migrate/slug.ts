/**
 * Slug assignment (migrate spec §2.4, data-architecture §4). The stem
 * is the headword text without points; a unique stem is its own slug,
 * a colliding one numbers every member in rid order and leaves the bare
 * form for the disambiguation page. Assigned once, then frozen.
 */
// Escapes, never pasted literals: a combining mark typed into a class
// attaches to its neighbour and the range silently widens (html.ts).
// U+0591-05C7 points and accents · U+0307 combining dot above, split
// into its own alternative — biome's noMisleadingCharacterClass rejects
// a mark escape sitting next to a base-character escape in one class
// as ambiguous (headword.ts).
const MARKS = /(?:[\u0591-\u05C7]|\u0307)/gu;
const SPACES = /\s+/gu;

/** The unpointed, hyphen-joined stem a headword string slugs to. */
function slugStem(text: string): string {
	return text
		.normalize('NFD')
		.replace(MARKS, '')
		.normalize('NFC')
		.trim()
		.replace(SPACES, '-');
}

interface SlugAssignment {
	problems: string[];
	/** rid → slug, in the order the forms were given. */
	slugs: Map<string, string>;
}

/** Assign every form a frozen slug: a unique stem gets the bare slug,
 * a colliding stem numbers its members `stem-1`, `stem-2` … in rid
 * order — a function of the corpus, never of the order `forms` lists
 * them in. An empty stem is reported by rid, never thrown. */
function assignSlugs(
	forms: ReadonlyArray<{ rid: string; text: string }>,
): SlugAssignment {
	const byStem = new Map<string, string[]>();
	const problems: string[] = [];
	for (const { rid, text } of forms) {
		const stem = slugStem(text);
		if (stem === '') {
			problems.push(`${rid}: empty stem from "${text}"`);
			continue;
		}
		const list = byStem.get(stem) ?? [];
		list.push(rid);
		byStem.set(stem, list);
	}
	const chosen = new Map<string, string>();
	for (const [stem, rids] of byStem) {
		// Rids are fixed-width (`<letter><NNNNN>`), so a plain string
		// sort is a rid-order sort. `localeCompare` over the default
		// `sort()` per Sonar S2871 — both agree on this ASCII alphabet.
		const ordered = [...rids].sort((a, b) => a.localeCompare(b));
		for (const [i, rid] of ordered.entries()) {
			chosen.set(rid, ordered.length === 1 ? stem : `${stem}-${i + 1}`);
		}
	}
	const slugs = new Map<string, string>();
	for (const { rid } of forms) {
		const slug = chosen.get(rid);
		if (slug !== undefined) {
			slugs.set(rid, slug);
		}
	}
	return { problems, slugs };
}

export type { SlugAssignment };
export { assignSlugs, slugStem };
