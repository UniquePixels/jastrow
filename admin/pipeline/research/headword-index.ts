/**
 * Headword normalization and the corpus index the link-target rules
 * read (round-1 detector calibration, 2026-08-18).
 *
 * Split out of link-anomalies.ts when round 1's six corrections took
 * that module past the 300-line cap. Nothing here decides anything —
 * it only normalizes headword strings and precomputes the three
 * corpus-wide lookups the rules need: every headword, the niqqud
 * families sharing one consonantal skeleton, and the redirect stubs
 * whose whole entry is a bare `, v. Y`.
 */
import type { SourceEntry, SourceSense } from '../body/types.ts';

/** Corpus headword index: every headword in its homograph-stripped
 * form, the niqqud-variant families sharing one skeleton, and the
 * `, v. Y` redirect stubs. */
interface HeadwordIndex {
	/** Headword -> the variants its entry records in `alt_headwords`,
	 * normalized to the form a link display carries. sweep-v5 class 11
	 * licenses these explicitly ("an attested variant recorded in the
	 * target's `alt_headwords`"); before the residue calibration
	 * (2026-09-04) no rule consulted the field, so the diverge rules
	 * fired hints the prompt then told the sweep to reject. */
	alts: Map<string, Set<string>>;
	/** Consonantal skeleton -> the distinct vocalized headwords. */
	bySkeleton: Map<string, Set<string>>;
	/** Every headword, homograph suffix (` I`, ` 2`) removed. */
	exact: Set<string>;
	/** Headword -> the consonantal stems of the forms ITS OWN entry
	 * records (`plural_form`, `alt_headwords`, `grammar.binyan_form`).
	 * `ownForms` answers a similar question for the host of an anchor,
	 * but over a WIDER set — it also harvests binyan forms from the
	 * entry's senses. This map is deliberately narrower, because a
	 * verb's Af'el coinciding with a noun's plural is exactly the
	 * escape `inflection-escape-link` exists to catch. A display that is the host's plural and
	 * also the target's own recorded form is a link between two
	 * entries that agree about the word, not an escape (A00450,
	 * A00516; batch 02, 2026-09-04). */
	formsOf: Map<string, Set<string>>;
	/** Headword -> the SKELETONS (matres kept) of the forms its own
	 * entry records, its headword included. `formsOf` answers the same
	 * question through `stem`, which deletes matres and so cannot tell
	 * a plural from its singular. The adjudicated discriminator — does
	 * the target record the displayed form? — needs the letters
	 * preserved, so it reads this map. */
	recordedSkeletons: Map<string, Set<string>>;
	/** Headword -> the target of its bare `, v. Y` redirect stub. */
	redirect: Map<string, string>;
	/** Consonantal skeleton -> every entry headword carrying it, with
	 * the homograph suffix KEPT. `bySkeleton` deduping strips that
	 * suffix, which is right for deciding whether the niqqud carve-out
	 * applies and wrong for telling an agent how much ambiguity it is
	 * looking at: `אוֹר I` and `אוֹר II` are two words the display
	 * cannot choose between, and the calibration found the hint
	 * reporting them as one (2026-09-04). */
	skeletonOwners: Map<string, string[]>;
}

/** One entry's own surface forms, against which a display is judged. */
interface OwnForms {
	/** Consonantal skeletons of the recorded inflected forms. */
	forms: string[];
	/** The entry's headword, homograph suffix and asterisk removed. */
	headword: string;
	/** Inflected forms named in the SENSE TEXT (`Pl. X`,
	 * `Part. pass. X`, `Fem. X`) and in no structured field. 286 of the
	 * 362 anchors in the adjudicated inflection residue are this shape,
	 * so a rule that reads only `forms` is blind to four fifths of the
	 * class. Skeletons, matres KEPT. */
	prose: string[];
	/** `forms` with matres KEPT. `forms` runs through `consonants`,
	 * which deletes ו and י — exactly the letters distinguishing an
	 * inflected form from its base, so a plural collapses onto its own
	 * singular (A02408) and a four-letter participle onto two letters
	 * (A01023). Any rule comparing a form against its base needs this
	 * one. */
	skeletons: string[];
}

const TAG = /<[^>]*>/gu;
/** How the corpus names an inflected form inside a sense: a stem or
 * number label, then the Hebrew word. Deliberately a small closed list
 * — a wider one starts matching ordinary citations. */
const PROSE_FORM =
	/\b(?<label>Pl\.|Part\. pass\.|Part\.|Fem\.|Constr\.)\s*(?:<[^>]*>\s*)*(?<form>[\u05d0-\u05ea\u0591-\u05c7]{2,})/gu;
/** Hebrew niqqud and cantillation. */
const NIQQUD = /[֑-ׇ]/gu;
/** Matres lectionis, whose plene/defective alternation is free
 * variation here and must not read as a consonant change. */
const MATRES = /[יו]/gu;
const GERESH = /[׳']/gu;
/** A homograph suffix on a headword or link target. The corpus writes
 * these three ways for the same thing — Roman (` I`), ASCII digit
 * (` 2`) and superscript (` ²`) — so all three strip identically
 * (batch-02 A01346 fired a false `exact-headword-diverge` when a
 * display's Roman numeral met its target's superscript). */
const HOMOGRAPH = /\s+(?:[IVX]+|[0-9]+|[²³¹⁰-⁹]+)$/u;
/** Jastrow's editorial mark on a reconstructed headword. It is stored
 * inside the headword string but is not part of the word, so an anchor
 * displaying the de-asterisked target is a correct link (v2 carries it
 * as the boolean `reconstructed`). Round-1 letters B and J found this
 * independently: 1,339 `*` headwords, 1,412 anchors whose display is
 * exactly the de-asterisked target, all correct. */
const EDITORIAL_ASTERISK = /^\*+/u;
/** Everything a bare redirect stub may put before its one anchor. */
const STUB_LEAD = /^[\s,;.]*v\.\s*$/iu;
/** The `-im`/`-in` plural alternation of Hebrew against Aramaic is
 * free variation in this corpus, so a final mem and a final nun must
 * not read as a consonant change (letter L's one-consonant rule
 * excludes the final position for exactly this reason). */
const FINAL_NASAL = /[םן]$/u;

const JASTROW_ANCHOR =
	/<a [^>]*data-ref="Jastrow, (?<ref>[^"]+)"[^>]*>(?<display>.*?)<\/a>/gu;

/** Drop a homograph suffix and the editorial asterisk:
 * `*זָמַר I` -> `זָמַר`. */
function baseHeadword(s: string): string {
	let out = s.trim().replace(EDITORIAL_ASTERISK, '').trim();
	let previous: string;
	do {
		previous = out;
		out = out.replace(HOMOGRAPH, '').trim();
	} while (out !== previous);
	return out;
}

/** Jastrow parenthesizes a recorded variant whose attestation is
 * indirect — `גְּמַם` records its alt as `(גּוּם)`, and one entry
 * writes `*(נגד)`. The brackets are editorial, like the asterisk, and
 * are no part of the word. */
const EDITORIAL_PARENS = /^\(+|\)+$/gu;

/** One `alt_headwords` string, normalized to the form a link display
 * would carry. */
function recordedVariant(s: string): string {
	return baseHeadword(
		s
			.replace(TAG, ' ')
			.replace(EDITORIAL_ASTERISK, '')
			.replace(EDITORIAL_PARENS, ''),
	);
}

/** Consonantal skeleton: niqqud and geresh removed, matres kept. */
function skeleton(s: string): string {
	return s.replace(NIQQUD, '').replace(GERESH, '').trim();
}

/** Skeleton with matres lectionis removed too, so plene and defective
 * spellings of one word compare equal. */
function consonants(s: string): string {
	return skeleton(s).replace(MATRES, '');
}

/** Consonants with the plural nasal folded, so `-ים` and `-ין` of one
 * word compare equal. */
function stem(s: string): string {
	return consonants(s).replace(FINAL_NASAL, 'ם');
}

/** Every definition string in an entry, nested senses included. */
function entryDefinitions(entry: SourceEntry): string[] {
	const defs: string[] = [];
	const walk = (senses: readonly SourceSense[]): void => {
		for (const sense of senses) {
			if (sense.definition !== undefined) {
				defs.push(sense.definition);
			}
			if (sense.senses !== undefined) {
				walk(sense.senses);
			}
		}
	};
	walk(entry.content.senses);
	return defs;
}

/** The target of a bare `, v. Y` redirect stub, if the whole entry is
 * one. 7,332 corpus entries are; 73 of them are displayed by an anchor
 * that links straight through to Y, a correct resolution that used to
 * fire `exact-headword-diverge` (letter P's `lemma-variant-retarget`). */
function redirectTarget(entry: SourceEntry): string | undefined {
	const senses = entry.content?.senses ?? [];
	const only = senses.length === 1 ? senses[0] : undefined;
	if (only?.definition === undefined || only.senses !== undefined) {
		return;
	}
	const anchors = [...only.definition.matchAll(JASTROW_ANCHOR)];
	const m = anchors.length === 1 ? anchors[0] : undefined;
	if (m === undefined) {
		return;
	}
	const lead = only.definition.slice(0, m.index).replace(TAG, ' ');
	const tail = only.definition
		.slice((m.index ?? 0) + m[0].length)
		.replace(TAG, ' ')
		.trim();
	if (!STUB_LEAD.test(lead) || tail !== '') {
		return;
	}
	return baseHeadword(m.groups?.['ref'] as string);
}

/** The entry's own recorded inflections, as consonantal stems: the
 * shapes an in-entry display may legitimately take besides the
 * headword itself (letter I's `inflection-abbrev-mislink`).
 *
 * Scope note (task-9 review, 2026-08-18): this reads only the three
 * structured fields below — `plural_form`, `alt_headwords`, and
 * `grammar.binyan_form` — reaching ~51 of the abbreviated-inflection
 * hits round 1's estimate of 137 assumed. The gap (~86, estimated) is
 * inflected forms stated only in definition prose (`ib. pl. X`, `cmp.
 * Y`, &c.), which this function does not scan: distinguishing a
 * prose-cited inflected form of *this* entry from a prose-cited form
 * of some other word needs more context than a structured-field read
 * gives, and getting it wrong would feed `abbrevHint`/`inflectionHint` false
 * positives of exactly the kind task 9's Hebrew-frequency rule spent
 * its calibration budget cutting back. Kept at structured-field scope
 * rather than risk that; not extended to inline prose. */
function ownForms(entry: SourceEntry): OwnForms {
	const raw = [...(entry.plural_form ?? []), ...(entry.alt_headwords ?? [])];
	const walk = (senses: readonly SourceSense[]): void => {
		for (const sense of senses) {
			raw.push(...(sense.grammar?.binyan_form ?? []));
			if (sense.senses !== undefined) {
				walk(sense.senses);
			}
		}
	};
	walk(entry.content?.senses ?? []);
	const forms = raw
		.map((f) => consonants(baseHeadword(f.replace(TAG, ' '))))
		.filter((f) => f.length >= 2);
	const skeletons = raw
		.map((f) => skeleton(baseHeadword(f.replace(TAG, ' '))))
		.filter((f) => f.length >= 2);
	const known = new Set(skeletons);
	const prose = new Set<string>();
	for (const def of entryDefinitions(entry)) {
		for (const m of def.replace(TAG, ' ').matchAll(PROSE_FORM)) {
			const f = skeleton(m.groups?.['form'] as string);
			if (f.length >= 2 && !known.has(f)) {
				prose.add(f);
			}
		}
	}
	return {
		forms: [...new Set(forms)],
		headword: baseHeadword(entry.headword),
		prose: [...prose],
		skeletons: [...known],
	};
}

/** Index the corpus headwords for the link-target rules. */
function buildHeadwordIndex(entries: Iterable<SourceEntry>): HeadwordIndex {
	const exact = new Set<string>();
	const alts = new Map<string, Set<string>>();
	const bySkeleton = new Map<string, Set<string>>();
	const redirect = new Map<string, string>();
	const skeletonOwners = new Map<string, string[]>();
	const formsOf = new Map<string, Set<string>>();
	const recordedSkeletons = new Map<string, Set<string>>();
	for (const entry of entries) {
		const base = baseHeadword(entry.headword);
		exact.add(base);
		for (const raw of entry.alt_headwords ?? []) {
			const variant = recordedVariant(raw);
			if (variant === '' || variant === base) {
				continue;
			}
			const recorded = alts.get(base) ?? new Set<string>();
			recorded.add(variant);
			// The consonantal form too. A recorded alt is stored the way
			// print writes it — vocalized — while the display that names
			// it in running text is usually bare consonants, so exact
			// membership missed the very cases the carve-out exists for
			// (A00307, A00529; batch 01, 2026-09-04). Both forms live in
			// the set so the caller can ask either question.
			recorded.add(skeleton(variant));
			alts.set(base, recorded);
		}
		const key = skeleton(base);
		const family = bySkeleton.get(key) ?? new Set<string>();
		family.add(base);
		bySkeleton.set(key, family);
		const owners = skeletonOwners.get(key) ?? [];
		owners.push(entry.headword.trim().replace(EDITORIAL_ASTERISK, ''));
		skeletonOwners.set(key, owners);
		// `plural_form` and `alt_headwords` ONLY — deliberately NOT
		// `ownForms`, which also harvests binyan forms out of the
		// entry's senses. A verb's Af'el routinely coincides with some
		// noun's plural: C00927 `גְּלֵי` contributes `אגל`, which is
		// A00301 `אִגְלָא`'s own plural and round 1's named catch for
		// this kind. Suppressing on the wider set silenced it.
		const recorded = [
			...(entry.plural_form ?? []),
			...(entry.alt_headwords ?? []),
		]
			.map((f) => stem(recordedVariant(f)))
			.filter((f) => f.length >= 2);
		if (recorded.length > 0) {
			const known = formsOf.get(base) ?? new Set<string>();
			for (const f of recorded) {
				known.add(f);
			}
			formsOf.set(base, known);
		}
		const recordedSkel = new Set<string>([skeleton(base)]);
		for (const f of [
			...(entry.plural_form ?? []),
			...(entry.alt_headwords ?? []),
		]) {
			const sk = skeleton(recordedVariant(f));
			if (sk.length >= 2) {
				recordedSkel.add(sk);
			}
		}
		recordedSkeletons.set(base, recordedSkel);
		const to = redirectTarget(entry);
		if (to !== undefined) {
			redirect.set(base, to);
		}
	}
	return {
		alts,
		bySkeleton,
		exact,
		formsOf,
		recordedSkeletons,
		redirect,
		skeletonOwners,
	};
}

export type { HeadwordIndex, OwnForms };
export {
	baseHeadword,
	buildHeadwordIndex,
	consonants,
	entryDefinitions,
	ownForms,
	skeleton,
	stem,
};
