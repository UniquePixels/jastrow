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
	/** Headword -> the targets of the bare `, v. Y` redirect stubs
	 * written under it. A SET, not one target, because the key is
	 * `baseHeadword` and a homograph family shares it: `גְּלָל` and
	 * `גְּלָל II` may both be stubs pointing different ways, and the
	 * question every caller asks is a membership one — does ANY stub
	 * named X lead here? */
	redirect: Map<string, Set<string>>;
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
 * display's Roman numeral met its target's superscript).
 *
 * The separator admits a COMMA, because an entry covering two
 * homographs writes the run as `I, II` and sometimes closes it with a
 * trailing comma. Nine of 32,512 headwords are written that way, and
 * on all nine the old pattern stopped at the comma and left it in the
 * base — `בִּזְיוּנָא , II` based to `בִּזְיוּנָא ,`, which equals no
 * link target and no redirect. That was one of batch 05's two
 * `own-form-escape-link` false positives (B00443), and the sweep
 * agent's other proposed cause for it was inert: `baseHeadword` strips
 * `I` and `II` identically, so the stub's data-ref/display mismatch
 * changed nothing. */
const HOMOGRAPH = /[\s,]+(?:[IVX]+|\d+|[²³¹⁰-⁹]+),?$/u;
/** Jastrow's editorial mark on a reconstructed headword. It is stored
 * inside the headword string but is not part of the word (v2 carries
 * it as the boolean `reconstructed`).
 *
 * Round-1 letters B and J found, independently: 1,339 `*` headwords,
 * 1,412 anchors whose display is exactly the de-asterisked target,
 * **"all correct"**.
 *
 * THAT LAST CLAIM IS FALSE, and this docstring is why it survived —
 * `twinHint` returns early on `base === target`, and this pattern is
 * what makes the two equal, so an anchor displaying `ארז` at target
 * `*ארז` can never be hinted even when a second, non-asterisked entry
 * carries the same skeleton.
 *
 * Two named counter-examples, found in different batches by readers
 * who had not seen each other's: **A03269** displays `ארז` for
 * "male cedar" and lands on A03047 `*ארז`, a verb root glossed "to be
 * prickly, dry, hard" (the cedar is A03048); **C00849** displays
 * `גַּלִּין`, the first string in its OWN `plural_form`, and lands on
 * C00929 `*גַּלִּי`, "galium, bed-straw".
 *
 * Sized 2026-09-05: of the 2,210 anchors targeting a `*` headword,
 * **471** have a de-asterisked skeleton carried by two or more
 * entries. Twenty of those, sampled systematically and adjudicated by
 * two independent readers, came back **5 wrong / 13 correct / 2
 * undecidable** — but the halves split 1-of-10 against 4-of-10, so the
 * class is established and its magnitude is not.
 *
 * A fix must NOT be built around the asterisk: one failure has two
 * starred owners and is a Roman-numeral mis-target inside the starred
 * population, which `baseHeadword` flattens identically. Build it
 * around a skeleton with more than one owner, and prefer the two
 * corroborators that decided the sample — a reciprocal back-link, and
 * a citation shared between host and target.
 *
 * Full record and the `preced.` gate found alongside it:
 * docs/v2/phase-2-asterisk-exposure.md. */
const EDITORIAL_ASTERISK = /^\*+/u;
/** Everything a bare redirect stub may put before its one anchor,
 * once its citations are removed. A stub may cite the attestation it
 * is redirecting from — A00926's whole content is
 * `Targ. I Chr. I, 20, v. אַשְׁלָא` — and that citation is an anchor
 * element, so `ANCHOR_ELEMENT` takes it out and only punctuation is
 * left to match. Batch 05's other `own-form-escape-link` false
 * positive was this shape. Prose is deliberately still refused: a real
 * definition ending in `, v. X` keeps its words here and fails. */
const STUB_LEAD = /^[\s,;.]*v\.\s*$/iu;
/** A whole anchor element, display text included. `TAG` alone strips
 * the markup and LEAVES the display, which is what a citation's text
 * is; a lead test has to lose both. */
const ANCHOR_ELEMENT = /<a\b[^>]*>[\s\S]*?<\/a>/gu;
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
			.trim()
			.replace(EDITORIAL_ASTERISK, '')
			.trim()
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
 * one. 73 of them are displayed by an anchor that links straight
 * through to Y, a correct resolution that used to fire
 * `exact-headword-diverge` (letter P's `lemma-variant-retarget`).
 *
 * The population was 7,332 entries while the lead test ran against the
 * citation text; stripping anchor elements first (see `STUB_LEAD`)
 * makes it **7,690**, gaining 358 and losing none, measured over
 * 32,512 healed entries with A00926 asserted present. `redirect` holds
 * 7,680 of them: it is keyed by base headword, and ten bases carry two
 * stub entries between them.
 *
 * The 73 is NOT a reproduction of the round-1 predicate, which is not
 * recorded here. Counting anchors whose display bases to a stub whose
 * redirect is the anchor's own target, over 66,761 Jastrow anchors on
 * the healed corpus, gives **69**. Two different questions may be
 * being asked; neither number should be leaned on without restating
 * its predicate. */
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
	const lead = only.definition
		.slice(0, m.index)
		.replace(ANCHOR_ELEMENT, ' ')
		.replace(TAG, ' ');
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
		.map((f) => consonants(recordedVariant(f)))
		.filter((f) => f.length >= 2);
	const skeletons = raw
		.map((f) => skeleton(recordedVariant(f)))
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
	const redirect = new Map<string, Set<string>>();
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
		// MERGE, never replace. `base` is `baseHeadword`, which strips
		// the homograph numeral, so `בַּר I` … `בַּר IV` are one key and
		// a plain `.set` keeps whichever entry the corpus happens to
		// write last. Batch 06 (chunk-r00023) found `own-form-escape-link`
		// firing on a correct link because of it: five entries base to
		// `בַּר`, B01153 records `בָּרָא`, and B01156 is written last, so
		// the key held nothing and the exemption could not see the form
		// the target really records. 2,053 base keys carry two or more
		// entries and 2,434 entries were losing their contribution;
		// `alts`, `bySkeleton`, `skeletonOwners` and `formsOf` above all
		// merged already, and only these two did not.
		const seenSkel = recordedSkeletons.get(base);
		if (seenSkel === undefined) {
			recordedSkeletons.set(base, recordedSkel);
		} else {
			for (const sk of recordedSkel) {
				seenSkel.add(sk);
			}
		}
		const to = redirectTarget(entry);
		if (to !== undefined) {
			// 121 stubs were shadowed by a same-base sibling.
			const targets = redirect.get(base) ?? new Set<string>();
			targets.add(to);
			redirect.set(base, targets);
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
