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
	/** Consonantal skeleton -> the distinct vocalized headwords. */
	bySkeleton: Map<string, Set<string>>;
	/** Every headword, homograph suffix (` I`, ` 2`) removed. */
	exact: Set<string>;
	/** Headword -> the target of its bare `, v. Y` redirect stub. */
	redirect: Map<string, string>;
}

/** One entry's own surface forms, against which a display is judged. */
interface OwnForms {
	/** Consonantal skeletons of the recorded inflected forms. */
	forms: string[];
	/** The entry's headword, homograph suffix and asterisk removed. */
	headword: string;
}

const TAG = /<[^>]*>/gu;
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
 * headword itself (letter I's `inflection-abbrev-mislink`). */
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
	return { forms: [...new Set(forms)], headword: baseHeadword(entry.headword) };
}

/** Index the corpus headwords for the link-target rules. */
function buildHeadwordIndex(entries: Iterable<SourceEntry>): HeadwordIndex {
	const exact = new Set<string>();
	const bySkeleton = new Map<string, Set<string>>();
	const redirect = new Map<string, string>();
	for (const entry of entries) {
		const base = baseHeadword(entry.headword);
		exact.add(base);
		const key = skeleton(base);
		const family = bySkeleton.get(key) ?? new Set<string>();
		family.add(base);
		bySkeleton.set(key, family);
		const to = redirectTarget(entry);
		if (to !== undefined) {
			redirect.set(base, to);
		}
	}
	return { bySkeleton, exact, redirect };
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
