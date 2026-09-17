/**
 * Slug assignment (migrate spec §2.4, data-architecture §4,
 * consolidation spec §7). The stem is the headword text without
 * points; a unique stem is its own slug, a colliding one numbers every
 * member in rid order. The bare form of a colliding stem is reached
 * through `data/slug-index/aliases.jsonl`, not by an entry holding it.
 *
 * "Assigned once, then frozen" was a comment this file did not keep
 * until step 7: `assignSlugs` now takes the prior assignment and only
 * fills in what has none. Before that it renumbered every family from
 * scratch, so a headword respelling moved published URLs — 20% of
 * slugs differ between the source and composed spellings.
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
	/** rids assigned a slug by THIS call: the `slug-new` report rows. */
	assigned: string[];
	/** rids whose frozen slug no longer matches their headword's stem.
	 * The slug stands — that is what freezing means — and the run says
	 * so (`slug-frozen-stem-drift`, spec §7.3). */
	drift: string[];
	problems: string[];
	/** rid → slug, in the order the forms were given. */
	slugs: Map<string, string>;
}

/** A slug split into the stem it belongs to and its number, read off
 * the slug's own text rather than off any entry's current headword. A
 * frozen slug outlives the spelling that produced it, so the family a
 * slug reserves a place in is the one its text names. `\d` is ASCII
 * here on purpose: P00224's slug ends `-²`, Sefaria's homograph mark,
 * which is part of the stem and not an index. */
const NUMBERED = /^(.+)-(\d+)$/u;

/** The numbers already taken in each stem's family, from slugs that
 * are held — every prior assignment, live or retired, plus whatever
 * this run has frozen. A bare stem is recorded with index 0 so the
 * stem itself counts as held without competing for a number. */
function heldByStem(slugs: Iterable<string>): Map<string, Set<number>> {
	const held = new Map<string, Set<number>>();
	for (const slug of slugs) {
		const match = NUMBERED.exec(slug);
		const stem = match?.[1] ?? slug;
		const index = match?.[2];
		const taken = held.get(stem) ?? new Set<number>();
		taken.add(index === undefined ? 0 : Number(index));
		held.set(stem, taken);
	}
	return held;
}

/** Assign a slug to every form that has none, and keep every slug
 * `prior` already records (spec §7.3, R10).
 *
 * `prior` is rid → slug for every row of the slug index, including
 * `retired` rows: a retired rid has no form here, but its slug stays
 * held so the URL is never handed to a different word.
 *
 * A stem nobody holds, claimed by exactly one new rid, gets the bare
 * slug. Otherwise every new rid takes the lowest free number in its
 * family, in rid order — which on an empty `prior` is the old
 * behaviour exactly: unique stems bare, colliding stems `stem-1`,
 * `stem-2` … An empty stem is reported by rid, never thrown. */
function assignSlugs(
	forms: ReadonlyArray<{ rid: string; text: string }>,
	prior: ReadonlyMap<string, string> = new Map(),
): SlugAssignment {
	const byStem = new Map<string, string[]>();
	const problems: string[] = [];
	const drift: string[] = [];
	const chosen = new Map<string, string>();
	for (const { rid, text } of forms) {
		const stem = slugStem(text);
		if (stem === '') {
			problems.push(`${rid}: empty stem from "${text}"`);
			continue;
		}
		const frozen = prior.get(rid);
		if (frozen !== undefined) {
			chosen.set(rid, frozen);
			const match = NUMBERED.exec(frozen);
			if ((match?.[1] ?? frozen) !== stem) {
				drift.push(`${rid}: slug ${frozen} but stem ${stem}`);
			}
			continue;
		}
		byStem.set(stem, [...(byStem.get(stem) ?? []), rid]);
	}
	const held = heldByStem(prior.values());
	const assigned: string[] = [];
	for (const [stem, rids] of byStem) {
		// Rids are fixed-width (`<letter><NNNNN>`), so a plain string
		// sort is a rid-order sort. `localeCompare` over the default
		// `sort()` per Sonar S2871 — both agree on this ASCII alphabet.
		const ordered = [...rids].sort((a, b) => a.localeCompare(b));
		const taken = held.get(stem) ?? new Set<number>();
		const only = ordered.length === 1 ? ordered[0] : undefined;
		if (taken.size === 0 && only !== undefined) {
			chosen.set(only, stem);
			assigned.push(only);
			continue;
		}
		let next = 1;
		for (const rid of ordered) {
			while (taken.has(next)) {
				next++;
			}
			taken.add(next);
			chosen.set(rid, `${stem}-${next}`);
			assigned.push(rid);
		}
		held.set(stem, taken);
	}
	const slugs = new Map<string, string>();
	for (const { rid } of forms) {
		const slug = chosen.get(rid);
		if (slug !== undefined) {
			slugs.set(rid, slug);
		}
	}
	return { assigned, drift, problems, slugs };
}

export type { SlugAssignment };
export { assignSlugs, slugStem };
