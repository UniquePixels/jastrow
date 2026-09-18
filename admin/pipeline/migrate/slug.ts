/**
 * Slug assignment (migrate spec §2.4, data-architecture §4,
 * consolidation spec §7). The stem is the headword text without
 * points; a unique stem is its own slug, a colliding one numbers every
 * member in rid order. The bare form of a colliding stem is reached
 * through `data/slug-index/aliases.jsonl`, not by an entry holding it.
 *
 * `assignSlugs` can take a prior assignment and only fill in what has
 * none — that is freezing (R10). Whether a run passes one is decided by
 * `SLUGS_FROZEN` (`slug-index.ts`): until v2 is published every run
 * assigns from scratch, as it composes every entry from scratch.
 */
// Escapes, never pasted literals: a combining mark typed into a class
// attaches to its neighbour and the range silently widens (html.ts).
// U+0591-05C7 points and accents · U+0307 combining dot above, split
// into its own alternative — biome's noMisleadingCharacterClass rejects
// a mark escape sitting next to a base-character escape in one class
// as ambiguous (headword.ts).
const MARKS = /(?:[\u0591-\u05C7]|\u0307)/gu;
const SPACES = /\s+/u;
/** Jastrow's editorial notation, which is about the word and not part
 * of it: `*` hypothetical, `(…)` uncertain, `?` doubtful, `,` between
 * homograph numerals, and superscript disambiguators (U+00B9/B2/B3 and
 * U+2070-209F). A parsed headword has already lost `*`, the numeral and
 * the superscript by the time it reaches here — 1,337, 2,870 and 806
 * entries — so stripping them from the unparsed rest makes the two
 * agree. `=` is kept: it marks a cross reference the headword itself
 * still owes, and the odd slug keeps that visible (A01175, A01345). */
const NOTATION = /[*()?,\u00B9\u00B2\u00B3\u2070-\u209F]/gu;
/** A homograph numeral: a whole word, never a run inside one. */
const ROMAN = /^[IVXLC]+$/u;

/** The unpointed, hyphen-joined stem a headword string slugs to. */
function slugStem(text: string): string {
	return text
		.normalize('NFD')
		.replace(MARKS, '')
		.replace(NOTATION, '')
		.normalize('NFC')
		.split(SPACES)
		.filter((word) => word !== '' && !ROMAN.test(word))
		.join('-');
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

/** What the first pass over `forms` separates out: the slugs already
 * frozen, the rids still needing one grouped by stem, and what the
 * headwords themselves got wrong. */
interface Partitioned {
	byStem: Map<string, string[]>;
	chosen: Map<string, string>;
	drift: string[];
	problems: string[];
}

/** One form against the prior assignment. The frozen lookup comes
 * FIRST: a headword that strips to nothing is a defect in the headword,
 * not a licence to drop a published slug, so the rid keeps what it was
 * assigned and the empty stem is still reported. */
function partitionOne(
	rid: string,
	text: string,
	prior: ReadonlyMap<string, string>,
	out: Partitioned,
): void {
	const stem = slugStem(text);
	const frozen = prior.get(rid);
	if (frozen === undefined) {
		if (stem === '') {
			out.problems.push(`${rid}: empty stem from "${text}"`);
			return;
		}
		out.byStem.set(stem, [...(out.byStem.get(stem) ?? []), rid]);
		return;
	}
	out.chosen.set(rid, frozen);
	if (stem === '') {
		out.problems.push(`${rid}: empty stem from "${text}"`);
		return;
	}
	if ((NUMBERED.exec(frozen)?.[1] ?? frozen) !== stem) {
		out.drift.push(`${rid}: slug ${frozen} but stem ${stem}`);
	}
}

/** What is already spoken for, in the two shapes the assigner needs.
 * Both, deliberately: `byFamily` knows a family's numbers, `slugs`
 * knows every slug STRING — including one a family processed earlier in
 * the same call took as its bare slug. Without the second the result
 * would depend on family order. */
interface Reservations {
	byFamily: Map<string, Set<number>>;
	slugs: Set<string>;
}

/** One stem's unassigned rids. A stem nobody holds, claimed by exactly
 * one rid, gets the bare slug; otherwise each takes the lowest free
 * number in rid order. */
function fillFamily(
	stem: string,
	rids: readonly string[],
	reserved: Reservations,
	out: { assigned: string[]; chosen: Map<string, string> },
): void {
	// Rids are fixed-width (`<letter><NNNNN>`), so a plain string sort is
	// a rid-order sort. `localeCompare` over the default `sort()` per
	// Sonar S2871 — both agree on this ASCII alphabet.
	const ordered = [...rids].sort((a, b) => a.localeCompare(b));
	const taken = reserved.byFamily.get(stem) ?? new Set<number>();
	const only = ordered.length === 1 ? ordered[0] : undefined;
	if (taken.size === 0 && only !== undefined && !reserved.slugs.has(stem)) {
		out.chosen.set(only, stem);
		reserved.slugs.add(stem);
		out.assigned.push(only);
		return;
	}
	let next = 1;
	for (const rid of ordered) {
		while (taken.has(next) || reserved.slugs.has(`${stem}-${next}`)) {
			next++;
		}
		taken.add(next);
		out.chosen.set(rid, `${stem}-${next}`);
		reserved.slugs.add(`${stem}-${next}`);
		out.assigned.push(rid);
	}
	reserved.byFamily.set(stem, taken);
}

/** Assign a slug to every form that has none, and keep every slug
 * `prior` already records (spec §7.3, R10).
 *
 * `prior` is rid → slug for every row of the slug index, including
 * `retired` rows: a retired rid has no form here, but its slug stays
 * held so the URL is never handed to a different word.
 *
 * On an empty `prior` this is the old behaviour exactly: unique stems
 * bare, colliding stems `stem-1`, `stem-2` … in rid order. An empty
 * stem is reported by rid, never thrown. */
function assignSlugs(
	forms: ReadonlyArray<{ rid: string; text: string }>,
	prior: ReadonlyMap<string, string> = new Map(),
): SlugAssignment {
	const part: Partitioned = {
		byStem: new Map(),
		chosen: new Map(),
		drift: [],
		problems: [],
	};
	for (const { rid, text } of forms) {
		partitionOne(rid, text, prior, part);
	}
	const reserved: Reservations = {
		byFamily: heldByStem(prior.values()),
		slugs: new Set(prior.values()),
	};
	const fill = { assigned: [] as string[], chosen: part.chosen };
	for (const [stem, rids] of part.byStem) {
		fillFamily(stem, rids, reserved, fill);
	}
	const slugs = new Map<string, string>();
	for (const { rid } of forms) {
		const slug = part.chosen.get(rid);
		if (slug !== undefined) {
			slugs.set(rid, slug);
		}
	}
	return {
		assigned: fill.assigned,
		drift: part.drift,
		problems: part.problems,
		slugs,
	};
}

export type { SlugAssignment };
export { assignSlugs, slugStem };
