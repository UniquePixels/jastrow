/**
 * Deterministic link-target anomaly rules (batch-02 breach
 * remediation, 2026-08-17; RUNBOOK step 2).
 *
 * Batch 02 passed the patch-error threshold outright (0/15) but
 * breached the catchable-miss threshold at 7.6%. Four of the five
 * catchable misses were class-11 `wrong-link-target`, and every one
 * of them was findable by a single entry-local test the sweep tier
 * did not apply consistently: an anchor's display text disagrees
 * with its own `data-ref`. That comparison is mechanical, so it runs
 * here once per batch instead of relying on agent diligence.
 *
 * These are *hints*: prep attaches them to chunk inputs and the
 * sweep prompt (v4) requires each one to be judged explicitly and
 * either patched or rejected with a stated reason. Calibrated on the
 * full 32,512-entry corpus (2026-08-17); union 1,910 entries (5.9%).
 *
 * - `abbrev-mislink` — 994 entries. A geresh-abbreviated display
 *   abbreviates *this* entry's headword but links elsewhere. Catches
 *   A01486 (`אִסְפַּ׳` under אִיסְפַּקְלַרְיָא, linked to asparagus) and A01525.
 * - `exact-headword-diverge` — 721 entries. The display is itself a
 *   corpus headword, but the link targets a consonantally different
 *   one. Catches A00988 (displays אָב, targets אַבָּא I).
 * - `niqqud-twin-target` — 204 entries. Display and target are two
 *   real headwords sharing one consonantal skeleton, so sweep-v3's
 *   niqqud-only carve-out cannot decide the case. Catches A01201
 *   (זְמַר vs זָמַר), whose verifier note prompted narrowing that rule.
 * - `roman-numeral-display` — 31 entries. An anchor whose display is
 *   a bare Roman numeral, naming no citation. Catches A01133.
 */
import type { SourceEntry } from '../body/types.ts';

/** One deterministic link finding. Kind values are a subset of
 * `AnomalyHint['kind']` in anomalies.ts, which owns the union. */
interface LinkHint {
	detail: string;
	kind:
		| 'abbrev-mislink'
		| 'exact-headword-diverge'
		| 'niqqud-twin-target'
		| 'roman-numeral-display';
}

/** Corpus headword index: every headword in its homograph-stripped
 * form, plus the niqqud-variant families sharing one skeleton. */
interface HeadwordIndex {
	/** Consonantal skeleton -> the distinct vocalized headwords. */
	bySkeleton: Map<string, Set<string>>;
	/** Every headword, homograph suffix (` I`, ` 2`) removed. */
	exact: Set<string>;
}

/** Anchors into the dictionary itself, which the headword rules judge. */
const JASTROW_ANCHOR =
	/<a [^>]*data-ref="Jastrow, (?<ref>[^"]+)"[^>]*>(?<display>.*?)<\/a>/gu;

/** Any anchor, whatever corpus its `data-ref` points into. */
const ANY_ANCHOR =
	/<a [^>]*data-ref="(?<ref>[^"]+)"[^>]*>(?<display>.*?)<\/a>/gu;

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
 * as the boolean `reconstructed`). Round 1 letters B and J found this
 * independently: 1,339 `*` headwords, 1,412 anchors whose display is
 * exactly the de-asterisked target, all correct. */
const EDITORIAL_ASTERISK = /^\*+/u;
/** Geresh marking an in-entry abbreviation of the headword. */
const GERESH_END = /[׳']\s*$/u;
/** Gershayim inside a display: the raw `"` truncates the `data-ref`
 * attribute upstream, a systemic extraction artifact, not a mislink. */
const GERSHAYIM = /["״]/u;
const ROMAN_NUMERAL = /^[IVXLC]{1,4}$/u;
/** Shortest abbreviation stem that identifies a headword; below this
 * the geresh forms are generic (`ר׳` = Rabbi, `ב׳` = ben). */
const MIN_ABBREV_STEM = 2;

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

/** Index the corpus headwords for the link-target rules. */
function buildHeadwordIndex(entries: Iterable<SourceEntry>): HeadwordIndex {
	const exact = new Set<string>();
	const bySkeleton = new Map<string, Set<string>>();
	for (const entry of entries) {
		const base = baseHeadword(entry.headword);
		exact.add(base);
		const key = skeleton(base);
		const family = bySkeleton.get(key) ?? new Set<string>();
		family.add(base);
		bySkeleton.set(key, family);
	}
	return { bySkeleton, exact };
}

/** A geresh abbreviation of this entry's own headword must link to
 * this entry, not to some other word sharing the opening letters. */
function abbrevHint(
	display: string,
	target: string,
	own: string,
): LinkHint | undefined {
	const stem = consonants(display);
	if (
		stem.length < MIN_ABBREV_STEM ||
		!consonants(own).startsWith(stem) ||
		skeleton(target) === skeleton(own)
	) {
		return;
	}
	return {
		detail: `'${display}' abbreviates this entry's own headword (${own}) but its link targets ${target}`,
		kind: 'abbrev-mislink',
	};
}

/** A display that is itself a headword should link to that headword. */
function exactHint(
	base: string,
	target: string,
	index: HeadwordIndex,
): LinkHint | undefined {
	if (!index.exact.has(base) || consonants(base) === consonants(target)) {
		return;
	}
	return {
		detail: `display '${base}' is itself a headword, but the link targets the consonantally different ${target}`,
		kind: 'exact-headword-diverge',
	};
}

/** Display and target are two real headwords differing only in
 * niqqud — the case sweep-v3's carve-out wrongly waved through. */
function twinHint(
	base: string,
	target: string,
	index: HeadwordIndex,
): LinkHint | undefined {
	const family = index.bySkeleton.get(skeleton(base));
	if (
		family === undefined ||
		family.size < 2 ||
		base === target ||
		!family.has(base) ||
		!family.has(target)
	) {
		return;
	}
	return {
		detail: `'${base}' and '${target}' are both headwords differing only in niqqud — the niqqud-only carve-out cannot decide this one`,
		kind: 'niqqud-twin-target',
	};
}

/** Bare Roman-numeral displays, over anchors into any corpus. */
function romanHints(text: string): LinkHint[] {
	const hints: LinkHint[] = [];
	for (const m of text.matchAll(ANY_ANCHOR)) {
		const display = (m.groups?.['display'] as string).replace(TAG, ' ').trim();
		if (ROMAN_NUMERAL.test(display)) {
			hints.push({
				detail: `anchor display is the bare Roman numeral '${display}', which names no citation — target '${m.groups?.['ref'] as string}'`,
				kind: 'roman-numeral-display',
			});
		}
	}
	return hints;
}

/** Hints for one dictionary anchor. */
function anchorHints(
	display: string,
	target: string,
	own: string,
	index: HeadwordIndex,
): LinkHint[] {
	if (display === '' || ROMAN_NUMERAL.test(display)) {
		return [];
	}
	if (GERESH_END.test(display)) {
		const hint = abbrevHint(display, target, own);
		return hint === undefined ? [] : [hint];
	}
	// Gershayim truncates the `data-ref` upstream, so the target we
	// would compare against is an extraction artifact, not a mislink.
	if (GERSHAYIM.test(display)) {
		return [];
	}
	const base = baseHeadword(display);
	return [exactHint(base, target, index), twinHint(base, target, index)].filter(
		(hint): hint is LinkHint => hint !== undefined,
	);
}

/** Headword-link hints for one text field. */
function headwordHints(
	text: string,
	own: string,
	index: HeadwordIndex,
): LinkHint[] {
	const hints: LinkHint[] = [];
	for (const m of text.matchAll(JASTROW_ANCHOR)) {
		const target = baseHeadword(m.groups?.['ref'] as string);
		const display = (m.groups?.['display'] as string).replace(TAG, ' ').trim();
		hints.push(...anchorHints(display, target, own, index));
	}
	return hints;
}

/** Every link-target hint in one text field. */
function linkHints(
	text: string,
	headword: string,
	index: HeadwordIndex,
): LinkHint[] {
	return [
		...romanHints(text),
		...headwordHints(text, baseHeadword(headword), index),
	];
}

export type { HeadwordIndex, LinkHint };
export { baseHeadword, buildHeadwordIndex, consonants, linkHints, skeleton };
