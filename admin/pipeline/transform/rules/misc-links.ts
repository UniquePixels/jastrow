/**
 * `plural-to-feminine-final-letter-mislink` (batch-2 task 6): a printed
 * plural — "Pl. Xִים, Xִין" — anchored to the entry's FEMININE Xִית
 * sibling instead of to itself. The skeletons differ only in the final
 * letter (ם/ן on the plural display, ת on the target): C01080 גַּנָּב
 * "Pl. גַּנָּבִים, גַּנָּבִין" resolves to C01085 גַּנָּבִית "f., inclined
 * to steal", whose own plural is גַּנָּבִיּוֹת. Catalogue's null model:
 * of 500 corpus headwords ending -ית, 91 declare a plural and 81 of
 * those -יּוֹת; only one of the remaining six could even produce a
 * legitimate member of this shape, and it is not among the members
 * measured below (see "self-link" under Exclusions).
 *
 * ## The locus, corrected
 *
 * The task brief that named this row described its locus as the
 * entry's `plural_form` JSON field, "the locus that holds 58 of 68
 * occurrences." That is the assumed-boundary error the batch's own
 * lessons warn about (three prior mislinks in this batch each came
 * from an unverified boundary), and it does not survive a read of the
 * bytes: `plural_form` is a separate, PLAIN-TEXT array —
 * `grep -c '"plural_form":\[[^]]*<a ' data/source/jastrow-dictionary.jsonl`
 * returns 0, corpus-wide. It carries no markup at all and cannot hold
 * an anchor. What the brief's prose meant, informally, is the
 * definition-embedded "—Pl. X, Y." construct Jastrow prints inline —
 * which lives in `senses[*].definition`, not in a same-named JSON
 * field. A corpus walk over every field `fieldsOf` touches (headword,
 * alt_headwords, `plural_form`, language_reference, and recursive
 * `senses[].definition`) finds every member of this row's raw
 * candidate population inside `senses[].definition` and NONE anywhere
 * else — so `unlinkOverDefinitions`'s existing recursive-senses walk is
 * the exact scope needed, and no field-scope extension to that helper
 * is warranted. (Its docstring's "exported… so a later rule can reuse
 * the walk" already anticipated a rule that needed nothing wider.)
 *
 * ## The population, measured
 *
 * RAW (`pluralToFeminineRaw`): an anchor whose display (niqqud
 * stripped) ends ם or ן, whose `data-ref` parses as `Jastrow, <hw> N`
 * with `<hw>` (niqqud stripped) ending ת, whose display skeleton minus
 * its final letter equals that `<hw>` skeleton minus ITS final letter
 * — the "differ only in the final letter" the row's description names,
 * checked on actual consonant skeletons rather than a suffix regex (a
 * regex on "ends ים/ין" / "ends ית" alone would accept unrelated words
 * that merely share those two letters) — and whose target skeleton is
 * NOT the host's own headword skeleton (the self-link guard, below).
 * **65 occurrences / 55 entries**, corpus-wide, recursive through
 * `sense.senses`.
 *
 * The full decomposition, each step independently re-runnable and
 * none of it fitted to a target number:
 *
 * ```
 * 68/57  the skeleton predicate WITHOUT the self-link guard —
 *        reproduces the catalogued corpusCount EXACTLY, independent
 *        confirmation that the skeleton test (not a suffix regex) is
 *        the right reading of "differ only in the final letter"
 * −3     self-link occurrences removed by the guard (H00796,
 *        K00308×2) — 2 entries
 * =65/55 pluralToFeminineRaw (this function)
 * −5     occurrences outside a printed Pl. construct, removed by
 *        inCleanPlSpan (A02980, K01319, Q02197, U00688, U01486) —
 *        5 entries
 * =60/50 pluralToFeminineMatch — what the rule actually fires on
 * ```
 *
 * The two self-link occurrences the guard removes are genuine
 * self-links, not this row's shape — a headword already ending -ית
 * whose own plural correctly resolves to itself:
 *
 * - **H00796** — the host headword חִילְתִּית already ends -ית; its own
 *   plural חִילְתִּין correctly resolves to itself. This is the
 *   catalogue's own null-model aside made concrete: "exactly one could
 *   produce a member of this shape — it is not among the 68."
 * - **K00308 (×2)** — host headword כּוֹנָנִית already ends -ית; its OWN
 *   plural (כּוֹנָנִיּוֹת) is separately, correctly left unanchored. The
 *   two self-linking anchors here are "(prob. to be read כּוֹנָנִים)"
 *   and a Yalkut citation — textual EMENDATIONS of quoted Aggadic
 *   material, referring back to this entry, not its declared plural.
 *
 * K00357 is NOT part of the 68/57 baseline at all — it fails the
 * skeleton test itself, independent of the guard: its display
 * כָּפִיתִין (skeleton כפיתין) and its target כָּפִית (skeleton כפית) do
 * not "differ only in the final letter" — removing each one's last
 * letter leaves כפיתי against כפי, different lengths. K00357's own
 * plural is printed unanchored (`Pl. כּוֹפְתִין`); the anchor is a
 * SEPARATE citation two sentences later, "(ed. Zuck. a. oth.
 * כָּפִיתִין)", which correctly resolves to K01023 — a redirect-stub
 * entry whose `alt_headwords` is literally `["כָּפִיתִין"]` and whose
 * whole definition is ", v. כּוֹפֶת" back to K00357. A correct link,
 * not a defect, excluded for the right reason on its own bytes rather
 * than by a carve-out — a suffix-only reading (no skeleton check at
 * all) would sweep K00357 in and measure 69/58, one occurrence and one
 * entry ABOVE the catalogued figure; that is not this function's
 * baseline.
 *
 * CLEAN (`pluralToFeminineMatch`): RAW restricted to anchors actually
 * inside the entry's own "Pl."/"pl." construct — nothing but Hebrew
 * letters, points, commas and spaces between the nearest preceding
 * "Pl."/"pl." label and the anchor's own open tag. This is what
 * separates a genuine member of the printed plural list from a
 * same-shaped anchor sitting inside an unrelated citation elsewhere in
 * the definition. **60 occurrences / 50 entries.** The 5 further raw
 * candidates it drops are the row's "variant readings… overlapping
 * corrigendum-reading-linked", each read in full:
 *
 * - **A02980** — not a plural at all. `(= b. h. גִּבְלִים) Giblean…`
 *   cites the BIBLICAL HEBREW cognate (1 Kings 5:32's Gebalites), not
 *   this entry's own plural — which is separately, correctly
 *   self-linked (`Pl. אַרְגּוּבְלַיָּא`). A "premise false" case in the
 *   sense `plural-inflection-anchor-escapes-entry`'s audit names: the
 *   anchor merely string-matches this row's shape.
 * - **K01319** — variant-reading citation, "…כשפין (ed. Bub. …".
 * - **Q02197** — variant-reading citation, "…פתקין some ed., read …".
 * - **U00688** — variant-reading citation with a post-anchor corrigendum
 *   cue, "…שַׁחֲצָנִין (ed. Bub. שקרנין, corr. acc.)"; the entry's own
 *   declared plural (שְׁחָצִים) is separately, correctly unanchored.
 * - **U01486** — a later citation ("Ib. שַׁמְתִּין, v. שַׁמְתָּא")
 *   distinct from the entry's own declared plural (שַׁמִּיתִין,
 *   separately unanchored two clauses earlier in the same sentence).
 *
 * No enumerated exception list backs either exclusion. The self-link
 * guard is a structural `!==` on two skeletons; the CLEAN-span test
 * asks "is everything between the nearest preceding Pl./pl. label and
 * this anchor pure Hebrew" of the text itself, on every corpus pass —
 * neither can go stale the way a fixed rid list can, so neither needs
 * the loud-on-drift machinery `rules/unlink.ts`'s `unobservedConvention`
 * provides for rows that DO carry one.
 *
 * ## The repair: UNLINK, by measurement
 *
 * The brief this task started from was written as a RETARGET rule —
 * "retarget to the host entry that declares the plural" — the same
 * premise Task 5's geresh pair started from and the maintainer
 * overturned (`rules/geresh.ts`'s module doc). Spec §3.2 case 2 permits
 * writing a target only when the entry's OWN input already carries an
 * anchor to it; measuring that directly against the 60-member CLEAN
 * population means asking, per entry, whether SOME anchor's target is
 * the entry's OWN headword — by TARGET-ENTRY IDENTITY
 * (`skeleton(targetHeadword) === skeleton(entry.headword)`), not by a
 * string prefix. A prefix test is unsound in both directions here: it
 * over-counts, because the mislinked anchor's own target (the feminine
 * sibling, e.g. `Jastrow, גַּנָּבִית 1`) STARTS WITH the host's own
 * headword string (`גַּנָּב`) whenever the sibling is spelled
 * `<headword>+ִית` — the exact shape every member of this row has by
 * construction — so a naive prefix scan counts the DEFECT ITSELF as
 * evidence a repair exists; and it under-counts on a homograph
 * headword (`בּוּר II`, `גַּנָּב ²`), whose Roman-numeral or superscript
 * suffix a real target's `data-ref` rarely spells the same way.
 *
 * Under target-entry identity, excluding each occurrence's own
 * (necessarily-mismatched, by the RAW self-link guard) anchor from its
 * own entry's evidence: **17 of 60 (28.3%) have some other anchor
 * reaching their own headword; 43 of 60 (71.7%) do not.** A retarget
 * rule would still DECLINE close to three members out of every four —
 * a smaller majority than the suffix-test's spurious 83.3%, but still
 * a majority, and the conclusion the brief asks for ("if most cannot
 * be retargeted, unlink") does not change under the stricter test.
 *
 * Per the brief's own decision rule and `geresh.ts`'s precedent (which
 * unlinked its WHOLE population rather than splitting out the fraction
 * that could have been retargeted, because splitting one row's repair
 * by an accident of what else happens to sit in the entry is not a
 * principled distinction), this rule unlinks all 60 uniformly rather
 * than retargeting the reachable minority and unlinking the rest. The
 * semantic question the brief raised — that the plural genuinely IS
 * the host's, so a link to the host would mean something a bare
 * self-link would not — does not survive the measurement under EITHER
 * reading: a majority of members have nowhere lawful to point, so a
 * split repair would treat two occurrences of the same defect
 * differently for a reason (what else this entry happens to cite) that
 * has nothing to do with the defect itself.
 *
 * ## corpusCount, corrected
 *
 * This rule reproduces **60 occurrences / 50 entries** against the
 * catalogued 68/57. Nothing in the delta is left unaccounted for — it
 * is exactly the decomposition given above, restated as the write-back
 * this task hands to Task 11:
 *
 * ```
 * 68/57  catalogued, reproduced EXACTLY by the skeleton predicate
 *        (no suffix-only artefact, no self-link guard yet)
 * −3     self-link occurrences (H00796, K00308×2) — 2 entries;
 *        the catalogue's own null model already names the H00796
 *        shape as "not among the 68", so at least this one is not a
 *        new finding
 * =65/55 pluralToFeminineRaw
 * −5     occurrences outside a printed Pl. construct (A02980, K01319,
 *        Q02197, U00688, U01486) — 5 entries; the catalogue's own
 *        `reason` already names these as the "10 variant readings…
 *        overlapping corrigendum-reading-linked" this task's
 *        acceptance criteria ask to exclude (K00308's other 2
 *        occurrences are ALSO variant readings, caught one step
 *        earlier by the self-link guard rather than here)
 * =60/50 pluralToFeminineMatch — what this rule fires on, shipped
 * ```
 *
 * The write-back task owns moving `patterns.jsonl`'s corpusCount to
 * 60/50 and carrying this block into the row's `reason`.
 */
import type { SourceEntry } from '../../body/types.ts';
import type { Token } from '../html.ts';
import type { Anchor } from '../links.ts';
import type { Rule, TransformResult } from '../types.ts';
import { unlinkOverDefinitions } from './unlink.ts';

// Hoisted per lint/performance/useTopLevelRegex.

/** `html.ts`'s Hebrew point/accent range (U+0591–U+05C7), the same
 * span `rules/geresh.ts` uses — see that module's `POINT` for the
 * citation. */
const POINT = '֑-ׇ';
/** Hebrew consonants, final forms included. */
const LETTER = 'א-ת';

const POINTS_RE = new RegExp(`[${POINT}]`, 'gu');
const NON_LETTER_RE = new RegExp(`[^${LETTER}]`, 'gu');

/** Strip Hebrew points/accents only, keeping every other character —
 * used on display/target text where letter ORDER and non-Hebrew
 * characters (a homograph numeral, a geresh) still matter for the
 * "ends in…" tests below. */
function stripPoints(s: string): string {
	return s.replace(POINTS_RE, '');
}

/** Every Hebrew consonant in `s`, in order, with points, spaces,
 * numerals and punctuation removed — the comparable "skeleton" two
 * spellings of the same root can be measured against. */
function skeleton(s: string): string {
	return s.replace(POINTS_RE, '').replace(NON_LETTER_RE, '');
}

/** `Jastrow, <headword> <sense number>` — the address format every
 * member of this row's target takes. Captures the headword portion so
 * its skeleton can be compared to the display's. */
const TARGET_RE = /^Jastrow, (?<hw>[^0-9]+?) \d+$/u;

/** The TARGET-ENTRY IDENTITY of a `data-ref` — the skeleton of the
 * headword portion `TARGET_RE` captures, or `undefined` when the value
 * does not parse as one of this row's addresses. Exported so a test
 * measuring "does this entry carry an anchor to its OWN headword" (the
 * reachability question spec §3.2 case 2 asks) can compare identity
 * rather than a string prefix — a prefix test over-counts a sibling
 * spelled `<headword>+ִית` (which STARTS WITH the host's own headword
 * string) and under-counts a homograph headword whose Roman-numeral or
 * superscript suffix a target rarely spells the same way. See the
 * module doc's "The repair: UNLINK, by measurement" section. */
function targetHeadwordSkeleton(dataRef: string): string | undefined {
	const match = TARGET_RE.exec(stripPoints(dataRef));
	const hw = match?.groups?.['hw'];
	return hw === undefined ? undefined : skeleton(hw);
}

/** Every preceding TEXT token's value, concatenated up to `open` —
 * mirrors `rules/unlink.ts`'s private `leadOf`, restated here rather
 * than imported because that copy is not exported and this module's
 * needs (finding a "Pl." label, not a fixed cue regex) are shaped
 * differently enough that sharing one helper would blur both call
 * sites' intent. */
function leadOf(tokens: readonly Token[], open: number): string {
	let text = '';
	for (const token of tokens.slice(0, open)) {
		if (token.kind === 'text') {
			text += token.value;
		}
	}
	return text;
}

/** The nearest preceding "Pl."/"pl." label's END index in `lead`, or
 * `undefined` if none exists. Scans the WHOLE lead rather than a fixed
 * window: what matters is not proximity but PURITY of everything after
 * the label (see `inCleanPlSpan`), so a label many characters back is
 * exactly as usable as one nearby, provided nothing non-Hebrew
 * intervenes. Measured over all 60 CLEAN members: the label→anchor
 * span is min 0, median 0, max 23 characters — nothing in this
 * population is anywhere near the range where an unbounded scan could
 * misfire on a stray earlier "Pl." token, so the design choice above
 * has headroom on the current corpus even though it is not itself
 * bounded. A reuser scanning a field with much longer runs of pure
 * Hebrew between citations should re-measure before relying on this. */
const PL_LABEL_RE = /(?:^|[\s—])[Pp]l\.\s*/gu;
function plLabelBoundary(lead: string): number | undefined {
	let last: number | undefined;
	PL_LABEL_RE.lastIndex = 0;
	for (
		let match = PL_LABEL_RE.exec(lead);
		match !== null;
		match = PL_LABEL_RE.exec(lead)
	) {
		last = match.index + match[0].length;
	}
	return last;
}

/** Whether `anchor` sits inside the entry's own printed "Pl."/"pl."
 * list — the text from the nearest preceding label up to the anchor's
 * open tag holds nothing but Hebrew letters, points, commas and
 * spaces. A citation, an edition variant, or a cross-reference cue
 * anywhere in that span (Latin letters, digits, parentheses) means
 * this anchor is NOT the entry's own declared plural, whatever else it
 * looks like — see the module doc's nine excluded raw candidates, each
 * caught by exactly this test. */
const CLEAN_SPAN_RE = /^[א-ת֑-ׇ\s,]*$/u;
function inCleanPlSpan(tokens: readonly Token[], open: number): boolean {
	const lead = leadOf(tokens, open);
	const boundary = plLabelBoundary(lead);
	return boundary !== undefined && CLEAN_SPAN_RE.test(lead.slice(boundary));
}

/**
 * The RAW defect predicate, before the CLEAN-span restriction: display
 * ends ם/ן, target parses as `Jastrow, <hw> N` with `<hw>` ending ת,
 * the two skeletons agree everywhere except that final letter, and the
 * target is not a self-link. Exported so `misc-links.test.ts` can
 * measure the raw population (65/55) independently of the clean
 * restriction, the way `rules/geresh.ts`'s `bareStubRaw` separates
 * "does the shape match" from "does the rule fire".
 */
function pluralToFeminineRaw(entry: SourceEntry, anchor: Anchor): boolean {
	const dispSkel = skeleton(stripPoints(anchor.display));
	if (dispSkel.length === 0) {
		return false;
	}
	const lastDisplay = dispSkel.at(-1);
	if (lastDisplay !== 'ם' && lastDisplay !== 'ן') {
		return false;
	}
	const match = TARGET_RE.exec(stripPoints(anchor.dataRef));
	const targetHw = match?.groups?.['hw'];
	if (targetHw === undefined) {
		return false;
	}
	const targetSkel = skeleton(targetHw);
	if (targetSkel.length === 0 || targetSkel.at(-1) !== 'ת') {
		return false;
	}
	if (dispSkel.slice(0, -1) !== targetSkel.slice(0, -1)) {
		return false;
	}
	// Self-link guard: a headword already ending -ית whose own plural
	// resolves to itself is not a mislink to a "sibling" — there is no
	// sibling, the target IS the host. Load-bearing, not defense in
	// depth: H00796 and K00308 (module doc) both pass every check above
	// and are removed ONLY here, which is what takes the catalogued
	// 68/57 reading (the skeleton predicate without this guard) down to
	// this function's own 65/55.
	return targetSkel !== skeleton(entry.headword);
}

/**
 * The defect predicate a `Rule` fires on: `pluralToFeminineRaw`
 * restricted to anchors inside the entry's own clean "Pl." construct
 * (`inCleanPlSpan`). Exported for the same reason `rules/geresh.ts`
 * exports its raw predicates — so a corpus-walking test can pin both
 * the raw and the final population sizes independently of what
 * `applyTransforms` then does with them.
 */
function pluralToFeminineMatch(
	entry: SourceEntry,
	tokens: readonly Token[],
	anchor: Anchor,
): boolean {
	return (
		pluralToFeminineRaw(entry, anchor) && inCleanPlSpan(tokens, anchor.open)
	);
}

/**
 * A printed plural anchored to the entry's feminine `-ית` sibling
 * instead of to itself — unlinked, keeping the display text, by the
 * measurement in the module doc (retarget is reachable by target-entry
 * identity for only 28.3% of the population, a minority under every
 * reading measured, so the row is repaired the way `geresh.ts`'s pair
 * is: unlink uniformly rather than split by what else the entry
 * happens to cite).
 */
const pluralToFeminineFinalLetter: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		unlinkOverDefinitions(
			entry,
			'plural-to-feminine-final-letter-mislink',
			(tokens, anchor) => pluralToFeminineMatch(entry, tokens, anchor),
		),
	id: 'plural-to-feminine-final-letter-mislink',
	phase: 'text-repairs',
};

export {
	inCleanPlSpan,
	pluralToFeminineFinalLetter,
	pluralToFeminineMatch,
	pluralToFeminineRaw,
	skeleton,
	targetHeadwordSkeleton,
};
