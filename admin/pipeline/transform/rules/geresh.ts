/**
 * The geresh-abbreviation mislink pair — two catalogue rows written as
 * one module because they are the same defect with and without a
 * proclitic particle in front of it, and because they act on anchors
 * that sit side by side in one definition (F00014's sense 3 carries
 * one of each).
 *
 * Jastrow abbreviates a headword he has just given in full to its
 * first consonant plus a geresh — `א׳` inside the article for
 * אֲלַכְסוֹן, `וַ׳` inside וַדַּאי. The linker read those two characters
 * as a WORD. A bare stub resolves to the numeral article for that
 * letter (`Jastrow, א׳ 1`, the entry documenting aleph's use as the
 * numeral one); a stub with a particle glued on gave the linker two
 * consonants to work with, so it resolves to some unrelated headword
 * that happens to open with them (`בְּוַ׳` inside וַדַּאי →
 * `Jastrow, בַּצּוֹרְתָא 1`). Both point the reader away from the word
 * actually under discussion, which is the containing entry itself.
 *
 * ## The repair: UNLINK, by maintainer ruling
 *
 * These rows were briefed as RETARGET rules — relink the stub to the
 * containing entry. They are not, and the reason is measured rather
 * than stylistic. Spec §3.2 case 2 lets a rule write only a target
 * the entry's own input already holds, and names this pair as its
 * example ("The geresh rows copy the entry's own
 * `Jastrow, <headword> N`"). Searching every field `fieldsOf` walks
 * for an anchor whose `data-ref` is exactly this entry's address,
 * only **81 of 517** bare members and **28 of 185** prefixed members
 * have one: a retarget rule DECLINES 84% of both rows. `composed`
 * cannot close the gap either — A00268's target `Jastrow, אָגוּסְטָא 1`
 * shares only `Jastrow, א` with any input target, and a
 * two-character display cannot account for the nine-character
 * remainder. Assembling an address out of a headword is the
 * fabrication §3.2 exists to stop.
 *
 * Maintainer ruling (Brian, 2026-08-23), on that measurement:
 * "Unlink, but record the others as exceptions, ultimately these
 * exceptions need to be reviewed later." So the anchor is dropped and
 * the stub text kept, repairing **702 occurrences across 640 distinct
 * entries** (475 + 173 minus the 8 both rows share) instead of the
 * 109 occurrences a retarget rule could reach. Two of this batch's
 * own findings back it: Task 4 measured that a self-link promises an
 * article that does not exist,
 * and the body model's standing principle is to show only what
 * Jastrow linked — he wrote the abbreviation; Sefaria's linker added
 * the wrong target. It is the same ruling `rules/unlink.ts` already
 * ships three rows under.
 *
 * The exception register the ruling asks for is
 * `data/patches/catalogue-audit/geresh-abbrev-arms.md`: every
 * population these two rules deliberately do not touch, with its
 * query, its count and its rids, for later human review.
 *
 * The rules live here rather than in `rules/unlink.ts` because that
 * module is already the longest in the family and its three rows
 * share a cue-regex shape these two do not; what is shared is the
 * WALK, so the walk is imported and nothing is restated. In
 * particular `unlinkMatching`, underneath `unlinkOverDefinitions`,
 * re-derives anchors before every removal because anchors nest — a
 * private removal loop here would be the second place that reasoning
 * has to hold, and it has already failed once.
 *
 * ## The population, measured
 *
 * Definition scope, recursive through `sense.senses` (senses nest; a
 * flat walk loses about a quarter of a population), anchors read
 * through `links.ts`. `geresh.test.ts`'s header carries the query
 * shape; the exception register and task-5-report.md have the
 * runnable scripts.
 *
 * Every anchor whose `data-ref` is a letter's numeral article,
 * corpus-wide: **708 occurrences / 608 entries** — which is where the
 * row's superseded `corpusCount` of 608 came from, and the LOOSE
 * reading its audit rejected. (The audit's 707/607 is this minus one
 * anchor whose display is `(ח׳`: an open paren swallowed into the
 * display, the pending `open-paren-in-anchor-display` row's shape,
 * and not a stub by any reading.) Of those 708, the terminator is
 * U+05F3 HEBREW PUNCTUATION GERESH in all 707 stub-shaped displays
 * and nothing else — no ASCII apostrophe, no U+2019 — so the patterns
 * below admit only U+05F3.
 *
 * `geresh-letter-numeral-mislink` is the STRICT reading its round-3
 * re-measurement settled on: the stub letter must abbreviate the
 * CONTAINING entry's headword. **517 occurrences / 475 entries**,
 * reproducing the catalogued 475 exactly and independently. The 191
 * occurrences that reading drops do three different jobs, exactly as
 * the row's `reason` says — see "What the predicate excludes".
 *
 * `prefixed-geresh-abbrev-mislink` (catalogued 173, and UNAUDITED —
 * writing this transform is its audit): a two-letter stub whose
 * SECOND letter abbreviates the containing headword and whose first
 * is a proclitic particle. **185 occurrences / 173 entries**,
 * reproducing 173 exactly. The row is deterministic and stands. Two
 * corrections to its assumed shape, both from corpus bytes: it is not
 * a numeral-article mislink (0 of 1,353 two-letter geresh stubs
 * resolve to one), and a single regex with an optional prefix group
 * pulls `geresh-abbrev-fixed-sink`'s population (`אי׳`, `אב׳`) in with
 * it, so the two shapes are matched by two separate patterns here.
 *
 * Every member of both populations is `usable` (0 malformed, 0
 * interior, 0 unclosed) and none is involved in a nested anchor pair,
 * so `unlinkOverDefinitions` removes all 702 and skips none.
 *
 * ## Entanglement and order
 *
 * The two populations share 8 entries and 7 definitions; no single
 * anchor is in both (one display is one letter long, the other two),
 * so the entanglement is at the definition level — each rule
 * re-serializes a definition the other also rewrites. Both rows carry
 * the other in `entangledWith`, and `checkAdjacency()` keeps them in
 * a gap-free span of `RULES`.
 *
 * ORDER IS MEASURED, not aesthetic (batch 1's RTL trio is the
 * precedent: the wrong order there left 62 entries unfixed and no
 * unit test could see it). Re-measured under UNLINK semantics, which
 * is a stronger test than the retarget measurement it replaces —
 * removing tokens shifts every index after them, where an attribute
 * rewrite shifted none. Running the whole corpus through
 * `applyTransforms` with the pair in each order: **655 records across
 * 640 entries either way, and 0 entries whose output differs by a
 * byte**. A record is one per definition per RULE, so the 702
 * occurrences — which fall in 648 definitions — yield 655: the 7
 * definitions holding a member of each row are recorded once by each.
 * They commute because no member of either population nests
 * inside an anchor of the other (measured: 0 nested involvements
 * across both), and because `unlinkMatching` re-tokenizes and
 * re-derives from the CURRENT text on every pass, so neither rule can
 * hand the other a stale index. `gereshLetterNumeral` is registered
 * first for the pedestrian reason that it is the audited row.
 *
 * ## What the predicate excludes, and why
 *
 * Every exclusion here is SYNTACTIC. There is no enumerated exception
 * list in this module, so the 2026-08-23 loud-on-drift ruling has
 * nothing to bind and nothing here can rot into a silent
 * exclusion-of-nothing. All three arms the row's `reason` names fall
 * out of the one condition "the stub abbreviates THIS headword", and
 * all three are written up for review in
 * `data/patches/catalogue-audit/geresh-abbrev-arms.md`:
 *
 * - **Variant readings, 152 occurrences / 123 entries.** "Ms. K. ב׳",
 *   "ed. Berl. ע׳", "Ar. ע׳" — the stub abbreviates a reading named
 *   in the prose, not the lemma. What a variant reading IS, is a
 *   different word from the headword, so every one of the 152 has a
 *   stub letter differing from the headword's first letter and the
 *   condition drops all of them with no cue regex. The row's `reason`
 *   is emphatic about the cost of getting this wrong under the old
 *   retarget plan: it "would assert the variant reading is the lemma
 *   on all of them". A01905 holds one of each in one sentence and has
 *   a test.
 * - **"ר׳" = Rabbi, 20 occurrences / 19 entries.** Resh plus geresh
 *   before a name, which should not be a lexical link at all — but
 *   `rabbi-name-linked-as-bible-book` is the row that owns that
 *   shape, and these are outside its cue. All 20 sit in entries whose
 *   headword does not begin with resh, so the same condition drops
 *   them. (Seventeen further `ר׳` anchors DO sit in resh entries —
 *   T00033's רִאשׁוֹן and the like — and ARE unlinked with the rest.
 *   The audit's strict 517/475 counts them in; excluding them would
 *   be carving the predicate against the arithmetic that reproduced
 *   the catalogued 475 rather than against the text. Under unlink
 *   they land where a Rabbi abbreviation belongs anyway, but by
 *   inclusion rather than by intent, which the register flags for a
 *   reviewer.)
 * - **Inside the numeral articles, 18 occurrences / 18 entries.** The
 *   article for aleph links `ב׳` to the article for beth; that link
 *   is correct and is the convention. Its letter is not the host's,
 *   so the same condition drops it. The two anchors where a numeral
 *   article links its OWN letter (A00006's `א׳`, M00001's `מ׳`) are
 *   inside the strict population and ARE unlinked: a link from an
 *   article to itself is the self-link Task 4 measured as promising
 *   nothing, so dropping it is the same repair, not an overreach.
 *
 * The prefixed arm's particle set is the closed class of Hebrew and
 * Aramaic proclitics — bet, he, vav, kaf, lamed, mem, shin, dalet —
 * taken from the grammar and from the row's own wording ("particle
 * prefix") before measuring, then measured. It excludes 34 further
 * two-letter stubs whose first letter is a VERBAL preformative
 * (`אִדְּ׳` for the Ithpe'el of דמי, `אַחְ׳` for the Aph'el of חמם,
 * `תִּרְ׳`, `יִדַּ׳`): those abbreviate an inflected FORM of the
 * headword rather than the headword with a particle in front, which
 * is `inflection-abbrev-mislink`'s shape. Registered for review, not
 * annexed here.
 */
import type { SourceEntry } from '../../body/types.ts';
import type { Anchor } from '../links.ts';
import type { Rule, TransformResult } from '../types.ts';
import { unlinkOverDefinitions } from './unlink.ts';

// Hoisted per lint/performance/useTopLevelRegex.

/** `html.ts`'s `HEBREW` decomposed into the two halves this module
 * has to tell apart, on the ranges its docstring documents: U+05D0–
 * U+05EA the letters (final forms included), U+0591–U+05C7 the points
 * and accents. Importing `HEBREW` whole would not do — a stub is a
 * LETTER carrying optional points, and the combined class cannot say
 * which is which. Written as escapes for the reason that docstring
 * gives about literal characters silently shifting a range. */
const LETTER: string = String.raw`\u05D0-\u05EA`;
const POINT: string = String.raw`\u0591-\u05C7`;

/** U+05F3 HEBREW PUNCTUATION GERESH, the only terminator this
 * population uses: 707 of 707 stub-shaped displays among the anchors
 * that target a numeral article (module doc). The ASCII apostrophe
 * the discovery query allowed for occurs zero times here, so
 * admitting it would widen the predicate past anything measured. */
const GERESH = '׳';

/** One consonant, its points, and a geresh — the whole display, with
 * nothing else in it. A leading paren or a trailing letter means a
 * different row's defect, not this one's. The `[POINT]*` is
 * load-bearing: 17 members of this population are VOCALIZED (`בַּ׳`,
 * `אָ׳`, `נֶ׳`), and a pattern without it silently measures 690 where
 * the truth is 707. */
const BARE_STUB = new RegExp(
	`^(?<letter>[${LETTER}])[${POINT}]*${GERESH}$`,
	'u',
);

/** The same, with a proclitic in front. Disjoint from `BARE_STUB` by
 * letter count, which is why no anchor is ever in both populations. */
const PREFIXED_STUB = new RegExp(
	`^(?<prefix>[${LETTER}])[${POINT}]*(?<letter>[${LETTER}])[${POINT}]*${GERESH}$`,
	'u',
);

/** A letter's numeral article — the entry documenting that letter's
 * use as a numeral, whose headword IS the stub (`א׳`). The mislink
 * target of the bare arm, in all 708 measured occurrences. */
const NUMERAL_ARTICLE = new RegExp(
	`^Jastrow, (?<letter>[${LETTER}])${GERESH} \\d+$`,
	'u',
);

/** The headword's first consonant — the one the stub abbreviates.
 * Read as "first Hebrew letter" rather than "first character" so a
 * conjectural asterisk (`*דָּנָב`) or an editorial paren (`(אגוסטה)`)
 * does not hide it. */
const FIRST_LETTER = new RegExp(`[${LETTER}]`, 'u');

/**
 * The proclitic particles of Hebrew and Aramaic: bᵉ- "in", ha- the
 * article, wᵉ- "and", kᵉ- "like", lᵉ- "to", mi- "from", she- "that",
 * dᵉ- "of, that". A closed grammatical class, written from the
 * grammar and from the row's own description ("particle prefix"), and
 * measured afterwards — 185 occurrences / 173 entries against a
 * catalogued 173. What it deliberately leaves out is the verbal
 * preformatives (aleph, yod, taw and the rest); see the module doc
 * and the exception register.
 */
const PARTICLES: ReadonlySet<string> = new Set([...'בהוכלמשד']);

/** The containing entry's first consonant, or `''` for a headword
 * holding no Hebrew letter at all — which never equals a stub letter,
 * so such an entry simply never matches. */
function headLetter(headword: string): string {
	return FIRST_LETTER.exec(headword)?.[0] ?? '';
}

/**
 * Whether the BARE defect predicate matches. Exported so
 * `geresh.test.ts` can measure the population corpus-wide
 * independently of what the rule then does with it: `transform:count`
 * reports only the ENTRIES a rule touched, and cannot tell a
 * predicate that quietly narrowed from a rule that fired everywhere
 * it should.
 */
function bareStubRaw(entry: SourceEntry, anchor: Anchor): boolean {
	const stub = BARE_STUB.exec(anchor.display.trim())?.groups?.['letter'];
	if (stub === undefined) {
		return false;
	}
	const article = NUMERAL_ARTICLE.exec(anchor.dataRef)?.groups?.['letter'];
	return article === stub && headLetter(entry.headword) === stub;
}

/**
 * Whether the PREFIXED defect predicate matches. The target is only
 * required to be a Jastrow article — unlike the bare arm it is never
 * a numeral article (measured: 0 of 1,353 two-letter stubs resolve to
 * one), because two consonants gave the linker a real headword to
 * find.
 */
function prefixedStubRaw(entry: SourceEntry, anchor: Anchor): boolean {
	const stub = PREFIXED_STUB.exec(anchor.display.trim())?.groups;
	if (stub === undefined) {
		return false;
	}
	return (
		PARTICLES.has(stub['prefix'] ?? '') &&
		headLetter(entry.headword) === stub['letter'] &&
		anchor.dataRef.startsWith('Jastrow, ')
	);
}

/**
 * A one-consonant abbreviation of the containing entry's own headword,
 * anchored to that letter's numeral article. The anchor goes; the
 * stub text stays, because Jastrow wrote it.
 *
 * `unlinkOverDefinitions` supplies the recursive sense walk, the
 * nesting-safe removal loop and the `unlinks` declaration the gate
 * checks. The `tokens` half of its `match` signature is unused here:
 * unlike the three cue-driven rows it was built for, this predicate
 * reads nothing of the text before the anchor — the defect is
 * entirely in the anchor's own display and target.
 */
const gereshLetterNumeral: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		unlinkOverDefinitions(entry, 'geresh-letter-numeral-mislink', (_, anchor) =>
			bareStubRaw(entry, anchor),
		),
	id: 'geresh-letter-numeral-mislink',
	phase: 'text-repairs',
};

/**
 * The same abbreviation with a proclitic particle glued to its front,
 * which gave the linker two consonants and so an unrelated headword
 * to resolve to instead of a numeral article.
 */
const prefixedGereshAbbrev: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		unlinkOverDefinitions(
			entry,
			'prefixed-geresh-abbrev-mislink',
			(_, anchor) => prefixedStubRaw(entry, anchor),
		),
	id: 'prefixed-geresh-abbrev-mislink',
	phase: 'text-repairs',
};

export {
	bareStubRaw,
	gereshLetterNumeral,
	prefixedGereshAbbrev,
	prefixedStubRaw,
};
