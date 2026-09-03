/**
 * Deterministic link-target anomaly rules (batch-02 breach
 * remediation, 2026-08-17; round-1 detector calibration, 2026-08-18;
 * RUNBOOK step 2).
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
 * full 32,512-entry corpus. The figures below are pinned to `isOwn`
 * as actually shipped in this file; an earlier draft of this comment
 * (caught in task-9 review, 2026-08-18) quoted a tuning iteration
 * from *before* `isOwn` was widened to cover an entry's own
 * inflected forms, not just its headword — reverting `isOwn` to
 * headword-only reproduces that draft's 1,164 for `abbrev-mislink`
 * almost exactly. The correct figures are `9bc0e32`'s own commit
 * message:
 *
 * - `abbrev-mislink` — 584 entries (736 before the `v. sub` carve-out
 *   below). A geresh-abbreviated display abbreviates one of *this*
 *   entry's own forms but links elsewhere.
 *   Catches A01486 (`אִסְפַּ׳` under אִיסְפַּקְלַרְיָא, linked to asparagus)
 *   and D00728 (`כד׳`, the particle-prefixed shape, under דִּיר,
 *   linked to כַּדְבָא instead). The `בְּעַע` -> `מַבַּע` case an earlier
 *   draft of this comment cited here is not a catch: `מַבַּע` is the
 *   entry's own participle, `isOwn` rightly suppresses it, and B01058
 *   fires only `one-consonant-diverge`.
 *   Carve-out (sweep tiering 2.3, 2026-09-02): an anchor preceded by
 *   `v. sub` or `v. sub.` is the target of a redirect stub, where
 *   linking away from the host is the entry's whole content. The rule
 *   read `v-sub-redirect-stub-mislink`'s deliberate spelling-twin
 *   retarget as a mislink — 29 of the 50 entries that rule touches
 *   gained a hint from it — and the shape was never a finding on the
 *   raw corpus either: PRE falls 736 -> 584, POST 565 -> 429.
 * - `exact-headword-diverge` — 338 entries. The display is itself a
 *   corpus headword, but the link targets a consonantally different
 *   one. Catches A00988 (displays אָב, targets אַבָּא I). Redirect-stub
 *   resolutions and the editorial `*` are excluded.
 * - `niqqud-twin-target` — 1,321 entries. Display and target share
 *   one consonantal skeleton carrying two or more headwords, so the
 *   niqqud-only carve-out cannot decide the case. Catches A01201
 *   (זְמַר vs זָמַר) and, since the calibration, the unvocalized
 *   displays that carve-out silently collapsed onto one homograph.
 * - `one-consonant-diverge` — 817 entries. The display is no corpus
 *   headword but sits one non-final consonant from its target, the
 *   letter-L shape that could never reach `exact-headword-diverge`.
 * - `inflection-escape-link` — 691 entries. The display is one of the
 *   host entry's own inflected forms yet the link leaves the entry
 *   for a word related to neither. The unique-skeleton carve-out used
 *   to license these (letters J, O, Q, R).
 * - `roman-numeral-display` — 31 entries. An anchor whose display is
 *   a bare Roman numeral, naming no citation. Catches A01133. An
 *   anchor that is its own parenthesis is carved out: that is the
 *   parallel-chapter citation and the shape `anchor-swallows-close-
 *   paren` repairs into, worth 484 entries on the healed corpus.
 *
 * Union of all hint kinds: 4,311 entries, 13.3% of the corpus (4,339,
 * 13.35%, with the Hebrew-side `hebrew-rare-confusable` rule in
 * hebrew-anomalies.ts folded in). Both figures are the pre-carve-out
 * calibration and are kept as written, because
 * `docs/v2/phase-2-residue.md` reproduces them as its positive
 * control; after the `v. sub` carve-out the same union is 4,187.
 *
 * Scope note (task-9 review, 2026-08-18): `abbrev-mislink` and
 * `inflection-escape-link` both judge a display against `ownForms` in
 * headword-index.ts, which reads only structured inflection fields —
 * see that function's doc comment for the ~86-hit inline-prose
 * residual this does not reach.
 */
import {
	baseHeadword,
	consonants,
	type HeadwordIndex,
	type OwnForms,
	skeleton,
	stem,
} from './headword-index.ts';

/** One deterministic link finding. Kind values are a subset of
 * `AnomalyHint['kind']` in anomalies.ts, which owns the union. */
interface LinkHint {
	detail: string;
	kind:
		| 'abbrev-mislink'
		| 'exact-headword-diverge'
		| 'inflection-escape-link'
		| 'niqqud-twin-target'
		| 'one-consonant-diverge'
		| 'roman-numeral-display';
}

/** Anchors into the dictionary itself, which the headword rules judge. */
const JASTROW_ANCHOR =
	/<a [^>]*data-ref="Jastrow, (?<ref>[^"]+)"[^>]*>(?<display>.*?)<\/a>/gu;

/** Any anchor, whatever corpus its `data-ref` points into. */
const ANY_ANCHOR =
	/<a [^>]*data-ref="(?<ref>[^"]+)"[^>]*>(?<display>.*?)<\/a>/gu;

const TAG = /<[^>]*>/gu;
/** Any niqqud at all: its absence is what makes a display ambiguous
 * between the members of a homograph family. */
const VOCALIZED = /[֑-ׇ]/u;
/** Geresh marking an in-entry abbreviation of the headword. */
const GERESH_END = /[׳']\s*$/u;
/** Gershayim inside a display: the raw `"` truncates the `data-ref`
 * attribute upstream, a systemic extraction artifact, not a mislink. */
const GERSHAYIM = /["״]/u;
const ROMAN_NUMERAL = /^[IVXLC]{1,4}$/u;
/** The two halves of the `v. sub` redirect phrase, matched back from
 * the anchor a piece at a time so the whitespace between them is not
 * fixed by a literal. */
const SUB = 'sub';
const V_ABBREV = 'v.';
/** A character that can sit inside a word, in any script the corpus
 * writes. What must NOT precede the `v.`, so the phrase is matched as
 * a token rather than as some longer word's tail. */
const TOKEN_CHAR = /[\p{L}\p{N}]/u;
/** One whitespace character. Used to step over a run of it while
 * looking for the paren on either side of an anchor, which a
 * look-behind of any fixed width would eventually clip. */
const WHITESPACE_CHAR = /\s/u;
/** The proclitic particles Aramaic writes onto the following word. A
 * two-letter geresh form opening with one of these is not the generic
 * `ר׳`/`ב׳` but a prefixed one-letter abbreviation of the host entry
 * (letter J: 195 anchors, 177 entries, ~99% targeting another word). */
const PARTICLE_PREFIX = /^[בדהוכלמש]/u;
/** Shortest abbreviation stem that identifies a headword. Below this
 * the *unprefixed* geresh forms are generic (`ר׳` = Rabbi, `ב׳` = ben);
 * round 1 showed the exemption is wrong once a particle is prefixed. */
const MIN_ABBREV_STEM = 2;
/** Shortest display worth comparing consonant-by-consonant. */
const MIN_DIVERGE_LEN = 3;

/** Whether `stem` opens one of the entry's own surface forms. */
function abbreviates(abbrev: string, own: OwnForms): boolean {
	return (
		consonants(own.headword).startsWith(abbrev) ||
		own.forms.some((form) => form.startsWith(abbrev))
	);
}

/** Whether `target` is one of the entry's own surface forms, either
 * way round — an abbreviation may legitimately link to the entry that
 * carries the inflected form as its own headword. */
function isOwn(target: string, own: OwnForms): boolean {
	const t = consonants(target);
	return (
		skeleton(target) === skeleton(own.headword) ||
		own.forms.some((form) => form.startsWith(t) || t.startsWith(form))
	);
}

/** A geresh abbreviation of one of this entry's own forms must link to
 * this entry, not to some other word sharing the opening letters. */
function abbrevHint(
	display: string,
	target: string,
	own: OwnForms,
): LinkHint | undefined {
	const abbrev = consonants(display);
	// A two-letter form opening with a proclitic particle whose *second*
	// letter alone opens the headword is a prefixed one-letter
	// abbreviation of this entry, not the generic `ר׳`/`ב׳`.
	const prefixed =
		skeleton(display).length === MIN_ABBREV_STEM &&
		PARTICLE_PREFIX.test(abbrev) &&
		!abbreviates(abbrev, own) &&
		abbreviates(abbrev.slice(1), own);
	if (
		abbrev.length < MIN_ABBREV_STEM ||
		!(prefixed || abbreviates(abbrev, own)) ||
		isOwn(target, own)
	) {
		return;
	}
	return {
		detail: `'${display}' abbreviates this entry's own ${prefixed ? 'headword behind a particle prefix' : 'headword or an inflected form'} (${own.headword}) but its link targets ${target}`,
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
	// Display X's own entry is a bare `, v. Y` stub and the link goes
	// to Y: the linker resolved the redirect, which is correct even
	// though X and Y differ consonantally (the ל״ה/ל״י pairs).
	const via = index.redirect.get(base);
	if (via !== undefined && consonants(via) === consonants(target)) {
		return;
	}
	return {
		detail: `display '${base}' is itself a headword, but the link targets the consonantally different ${target}`,
		kind: 'exact-headword-diverge',
	};
}

/** Display and target share a skeleton carried by two or more
 * headwords — the case the niqqud carve-out cannot decide. An
 * unvocalized display is the worst of them: nothing in the string
 * picks a family member, yet every corpus instance resolves to the
 * same one (letter I, 1,160 of 1,160 skeletons). */
function twinHint(
	base: string,
	target: string,
	index: HeadwordIndex,
): LinkHint | undefined {
	const family = index.bySkeleton.get(skeleton(base));
	if (family === undefined || family.size < 2 || base === target) {
		return;
	}
	if (!family.has(target)) {
		return;
	}
	if (family.has(base)) {
		return {
			detail: `'${base}' and '${target}' are both headwords differing only in niqqud — the niqqud-only carve-out cannot decide this one`,
			kind: 'niqqud-twin-target',
		};
	}
	// Two-letter unvocalized displays are the function words (`לא`,
	// `או`, `תו`): the family is real but the reading is fixed by
	// context, so hinting them all is noise rather than signal.
	if (VOCALIZED.test(base) || skeleton(base).length < MIN_DIVERGE_LEN) {
		return;
	}
	return {
		detail: `unvocalized display '${base}' names a skeleton carried by ${family.size} headwords (${[...family].join(', ')}); the link fixes on ${target} with nothing in the display to choose it`,
		kind: 'niqqud-twin-target',
	};
}

/** Equal-length strings differing at exactly one non-final position.
 * The final position is excluded because `-ים`/`-ין` alternate freely.
 */
function oneNonFinalSubstitution(a: string, b: string): boolean {
	if (a.length !== b.length || a.length < MIN_DIVERGE_LEN) {
		return false;
	}
	let at = -1;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			if (at >= 0) {
				return false;
			}
			at = i;
		}
	}
	return at >= 0 && at !== a.length - 1;
}

/** A display that is no headword at all but sits one non-final
 * consonant from its target. `exact-headword-diverge` cannot reach
 * these: the display is unvocalized, so it is not a headword string
 * (letter L, 696 of 751 unreachable). */
function divergeHint(
	base: string,
	target: string,
	index: HeadwordIndex,
): LinkHint | undefined {
	if (
		index.exact.has(base) ||
		!oneNonFinalSubstitution(skeleton(base), skeleton(target))
	) {
		return;
	}
	return {
		detail: `display '${base}' is no corpus headword and differs from its target ${target} by one non-final consonant`,
		kind: 'one-consonant-diverge',
	};
}

/** The display is one of the host entry's own inflected forms (a
 * plural, a construct, a binyan form) but the link leaves the entry
 * for a word related to neither the headword nor the form. The
 * unique-skeleton carve-out used to wave these through. */
function inflectionHint(
	base: string,
	target: string,
	own: OwnForms,
): LinkHint | undefined {
	const form = stem(base);
	if (
		form.length < MIN_ABBREV_STEM ||
		form === stem(own.headword) ||
		!own.forms.some((f) => stem(f) === form) ||
		stem(target) === stem(own.headword) ||
		stem(target) === form
	) {
		return;
	}
	return {
		detail: `display '${base}' is this entry's own inflected form of ${own.headword}, but the link targets ${target}, which matches neither`,
		kind: 'inflection-escape-link',
	};
}

/** Whether the first non-whitespace character before `at` is an open
 * paren. Walks the whitespace run rather than testing the whole prefix,
 * so an anchor late in a long definition costs the same as an early
 * one, and no fixed look-behind window can clip a wide gap. */
function openParenBefore(text: string, at: number): boolean {
	let i = at - 1;
	while (i >= 0 && WHITESPACE_CHAR.test(text[i] as string)) {
		i -= 1;
	}
	return i >= 0 && text[i] === '(';
}

/** Whether the first non-whitespace character at or after `at` is a
 * close paren. The mirror of `openParenBefore`: whitespace is not
 * evidence either way, so neither side of the parenthesis should be
 * decided by it. */
function closeParenAfter(text: string, at: number): boolean {
	let i = at;
	while (i < text.length && WHITESPACE_CHAR.test(text[i] as string)) {
		i += 1;
	}
	return text[i] === ')';
}

/** Bare Roman-numeral displays, over anchors into any corpus.
 *
 * Carve-out (sweep tiering 2.2, 2026-09-02): an anchor that IS its own
 * parenthesis is a parallel-chapter citation, not a mislink. The
 * catalogue's `anchor-swallows-close-paren` (493) repairs the
 * extraction that left the close paren inside the display, so its
 * output — `(<a data-ref="Tosefta Eiruvin 4:1">IV</a>), 1` — is this
 * shape by construction. Measured over the healed corpus the carve-out
 * drops 484 entries and keeps all 31 the rule already had, so it
 * separates the repair's output from the real finds exactly. */
function romanHints(text: string): LinkHint[] {
	const hints: LinkHint[] = [];
	for (const m of text.matchAll(ANY_ANCHOR)) {
		const display = (m.groups?.['display'] as string).replace(TAG, ' ').trim();
		if (!ROMAN_NUMERAL.test(display)) {
			continue;
		}
		const at = m.index;
		if (openParenBefore(text, at) && closeParenAfter(text, at + m[0].length)) {
			continue;
		}
		hints.push({
			detail: `anchor display is the bare Roman numeral '${display}', which names no citation — target '${m.groups?.['ref'] as string}'`,
			kind: 'roman-numeral-display',
		});
	}
	return hints;
}

/** Whether the anchor at `at` is the target of a `v. sub` redirect —
 * `, v. sub <a …>נִידּ׳</a>.` — walking back over whitespace only,
 * because the phrase sits adjacent to the anchor by construction and
 * a wider search would start matching a `v. sub` from a neighbouring
 * clause. Character comparison rather than a slice: an anchor late in
 * a long definition costs the same as an early one. */
function vSubBefore(text: string, at: number): boolean {
	let i = at - 1;
	while (i >= 0 && WHITESPACE_CHAR.test(text[i] as string)) {
		i -= 1;
	}
	// The corpus writes both `v. sub` and `v. sub.`; five of the fifty
	// entries the transform repairs take the second form, so a
	// predicate without this line carves out forty-five of them.
	if (i >= 0 && text[i] === '.') {
		i -= 1;
	}
	if (i < SUB.length - 1 || !text.startsWith(SUB, i - SUB.length + 1)) {
		return false;
	}
	i -= SUB.length;
	while (i >= 0 && WHITESPACE_CHAR.test(text[i] as string)) {
		i -= 1;
	}
	const start = i - V_ABBREV.length + 1;
	if (i < V_ABBREV.length - 1 || !text.startsWith(V_ABBREV, start)) {
		return false;
	}
	// `v.` must open a token, not end one. Without this, `adv. sub`
	// and `rev. sub` match their own last three characters and
	// suppress a hint on a phrase that is not a redirect at all.
	const before = text[start - 1];
	return before === undefined || !TOKEN_CHAR.test(before);
}

/** Hints for one dictionary anchor. */
function anchorHints(
	display: string,
	target: string,
	own: OwnForms,
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
	return [
		exactHint(base, target, index),
		twinHint(base, target, index),
		divergeHint(base, target, index),
		inflectionHint(base, target, own),
	].filter((hint): hint is LinkHint => hint !== undefined);
}

/** Headword-link hints for one text field. */
function headwordHints(
	text: string,
	own: OwnForms,
	index: HeadwordIndex,
): LinkHint[] {
	const hints: LinkHint[] = [];
	for (const m of text.matchAll(JASTROW_ANCHOR)) {
		const target = baseHeadword(m.groups?.['ref'] as string);
		const display = (m.groups?.['display'] as string).replace(TAG, ' ').trim();
		// The `v. sub` carve-out is decided here rather than in
		// `anchorHints`, because it is the only rule that reads the text
		// AROUND the anchor and `anchorHints` is handed the anchor alone.
		// A geresh display is the only shape `abbrevHint` judges, so the
		// two conditions together skip exactly that rule.
		if (GERESH_END.test(display) && vSubBefore(text, m.index)) {
			continue;
		}
		hints.push(...anchorHints(display, target, own, index));
	}
	return hints;
}

/** Every link-target hint in one text field. */
function linkHints(
	text: string,
	own: OwnForms,
	index: HeadwordIndex,
): LinkHint[] {
	return [...romanHints(text), ...headwordHints(text, own, index)];
}

export type { LinkHint };
export { linkHints };
