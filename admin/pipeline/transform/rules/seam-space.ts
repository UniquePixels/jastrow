/**
 * Class B (batch-3b spec §3, §5) — five rows whose repair INSERTS a
 * space at a tag or script seam.
 *
 * ## Why `copied: [' ']` and never `allows: [' ']`
 *
 * Ruling R2, Brian, 2026-08-25. `Rule.allows` is a SET, not a budget:
 * `no-new-text.ts:181` builds `new Set(rule.allows.flatMap(…))` and a
 * codepoint in it is exempted from the count comparison entirely. So
 * `allows: [' ']` would license these rules to insert ANY number of
 * spaces into ANY entry, forever — a rule that repairs 119 seams and a
 * rule that pads every field to 80 columns would pass the same gate.
 *
 * `TransformResult.copied` is credited as a MULTISET and verified to
 * occur in the input first, so one declaration buys exactly one space
 * and an off-by-one FAILS the gate instead of passing it. Its
 * docstring frames it as recovering elided text, which a space is not;
 * that is a mechanical fit with a semantic stretch, taken knowingly
 * over a `types.ts` contract change affecting all fifteen shipped
 * rules.
 *
 * A space always occurs in the input for every member of these rows —
 * each is a seam INSIDE a populated definition — so the `copied`
 * occurrence check can never fail spuriously here.
 *
 * ## Two owners, one seam: `)</a><i>` belongs to `parenTagSpace` alone
 *
 * The brief's own two patterns collide: `parenTagSpace`'s
 * `/(\)(?:<\/a>)?)(<i>)/g` and a naive `anchorItalicSpace`
 * `/(<\/a>)(<i>)/g` both match the substring `)</a><i>` — measured at
 * 53 occurrences corpus-wide (of `parenTagSpace`'s 126: 73 bare `)<i>`
 * plus these 53). Neither rule would double-insert — once one rule
 * runs, the seam it closed no longer matches the other's pattern — but
 * WHICH rule claims those 53 depends entirely on registry order, which
 * makes both rules' own occurrence counts unreproducible by a later
 * reader: run the naive `anchorItalicSpace` pattern alone and it
 * measures 112 occurrences / 111 entries (reproducing the catalogued
 * `anchor-italic-no-space` corpusCount of 111 exactly, as an ENTRY
 * count) — but 53 of those occurrences are `parenTagSpace`'s own
 * population under a different name.
 *
 * Resolved here by construction, not by registry position:
 * `parenTagSpace` keeps BOTH shapes — `)<i>` and `)</a><i>` — as its
 * whole locus (this is what its catalogued 126 already counts as an
 * OCCURRENCE total: 73 + 53). `anchorItalicSpace`'s pattern carries a
 * negative lookbehind, `(?<!\))`, that declines every `</a><i>` seam
 * whose anchor display itself ends in `)`. The two predicates are now
 * disjoint on every input, in either registration order:
 * `anchorItalicSpace` measures 59 occurrences / 58 entries — the
 * `</a><i>` seams that are NOT also a `paren-tag-no-space` instance —
 * against its catalogued 111, which (like the naive 112/111 above)
 * counted the 53 shared instances twice across two rows. That
 * catalogue figure does not survive disjoint ownership; see
 * task-3-report.md for the full reconciliation. `italicParenSpace`'s
 * `</i>(` seam runs the opposite direction — open-paren after
 * close-italic, never close-paren before open-italic — so it shares
 * no character with either of the above and needs no resolution.
 *
 * ## `translitItalicSpace`: narrowed from a Latin-letter seam to a
 * transliteration-opening one
 *
 * The mechanical seam "a Latin letter, then `<i>`" fires 85 times
 * corpus-wide — almost all of them an ordinary mid-gloss italic run
 * (`or<i> town`, `esp<i>.`, `pl<i>.`) that already reads correctly
 * with no space, because the seam is inside one continuous phrase, not
 * missing one. The row's own two examples — `Arab.<i>ġaḥama` and
 * `I<i>Hif.` — are not that: in both, the ITALIC RUN'S OWN CONTENT is
 * the transliteration, not the word running up to it. `looksTransliterated`
 * tests exactly that: the run's first token either carries a
 * diacritic outside plain ASCII (the corpus's transliteration letters
 * — ġ ḥ ṭ ḳ š â — span three different Unicode blocks, so "non-ASCII"
 * is the honest test rather than a hand-picked range that would miss
 * one of them) or is itself a grammar-label abbreviation from
 * `abbrev-vocab.ts`'s `ABBREVIATIONS` (`Hif`, the same vocabulary
 * `rules/italic-period.ts` uses for its label/gloss split). Measured
 * this way: **15 occurrences / 15 entries, reproducing the catalogued
 * 15 exactly**, and zero letter-A rids, matching the row's own
 * `reason` field verbatim.
 *
 * Disjoint from `gloss-space-loss` by construction — that row is a
 * bigram frequency check over plain English prose with no tag
 * involved at all, and this rule only ever fires immediately before an
 * `<i>` open tag.
 *
 * ## `gereshAbbrevSpace`: scoped to Hebrew quotation text
 *
 * The bare seam "geresh directly followed by a Hebrew letter" fires 25
 * occurrences / 24 entries corpus-wide (Step 5's naive measurement)
 * against a catalogued 22 entries. One of those 25 is not this row's
 * population at all: `P01521`'s `עַ׳קַרְנַיִם` sits in `alt_headwords`, a
 * plain-text field that never carries markup — not "Hebrew quotation
 * text" by any reading, since there is no quotation there, only a
 * headword variant. Scoping the match to text inside a `dir="rtl"`
 * span (`html.ts`'s `tokenize` ancestry tracking, the same mechanism
 * `rules/rtl.ts` reads) excludes exactly that one entry mechanically,
 * without a per-entry exception list: **24 occurrences / 23 entries**.
 * That is still one entry more than the catalogued 22 (the row's own
 * `reason` states its own count as 23/22, one better than this); the
 * honest remainder is reported in task-3-report.md rather than forced
 * to match by further narrowing the predicate against no further
 * measured criterion — see the parent brief's ruling against tuning a
 * predicate to hit a number.
 */
import type { SourceEntry } from '../../body/types.ts';
import { ABBREVIATIONS } from '../abbrev-vocab.ts';
import { mapFields } from '../fields.ts';
import { serialize, tokenize } from '../html.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

// Hoisted per lint/performance/useTopLevelRegex.

/** `)<i>` and `)</a><i>` — every tag-adjacent close paren directly
 * before an opening italic, whatever tag (if any) sits between the
 * paren and the `<i>`. Owns BOTH shapes; see the module doc, "Two
 * owners, one seam" — `anchorItalicSpace` declines every instance this
 * pattern claims. */
const PAREN_SEAM = /(?<paren>\)(?:<\/a>)?)(?<tag><i>)/gu;

/** `</a><i>` — but only when the anchor's own display does not itself
 * end in `)`. The negative lookbehind is what makes this disjoint from
 * `PAREN_SEAM` rather than merely non-overlapping by registry order:
 * a `)</a><i>` seam belongs to `parenTagSpace` in every registration
 * order, because that rule owns every paren-adjacent instance of this
 * defect regardless of what tag sits between the paren and the
 * italic. */
const ANCHOR_SEAM = /(?<!\))(?<anchor><\/a>)(?<tag><i>)/gu;

/** `</i>(` — the mirror seam, close italic directly before an opening
 * paren. Runs the opposite direction from `PAREN_SEAM`/`ANCHOR_SEAM`
 * (close-italic-then-open-paren, not close-paren-then-open-italic), so
 * no single character can ever serve as both boundaries and no
 * resolution is needed against either. */
const ITALIC_PAREN_SEAM = /(?<tag><\/i>)(?<paren>\()/gu;

/** A Latin letter — optionally an abbreviation's own trailing period —
 * then an opening italic, capturing the run's own leading text as
 * group 3 so `looksTransliterated` can judge it without a second pass
 * over the string. Firing is gated on that group, not on this pattern
 * alone: see `looksTransliterated` and the module doc. */
const TRANSLIT_SEAM = /(?<letter>[A-Za-zÀ-ɏ]\.?)(?<tag><i>)(?<run>[^<]*)/gu;

/** The first token of an italic run's body: everything up to
 * whitespace or seam-adjacent punctuation, with one trailing
 * abbreviation period folded in (`Hif.`, not `Hif`). */
const FIRST_TOKEN = /^[^\s.,;()<]+\.?/u;

/** An abbreviation's own trailing period, stripped before an
 * `ABBREVIATIONS` lookup (`Hif.` → `Hif`). */
const TRAILING_PERIOD = /\.$/u;

/** Geresh directly followed by a bare Hebrew letter — the
 * abbreviation-continuation seam. Scoped to `dir="rtl"` text by the
 * CALLER (`gereshAbbrevSpace`'s mapper walks `tokenize`'s output and
 * only rewrites `rtl` text tokens), never by widening this pattern, so
 * "geresh then letter" stays legible as the whole predicate on its
 * own. */
const GERESH_SEAM = /(?<geresh>׳)(?<letter>[א-ת])/gu;

/** Whether `token` holds a codepoint outside the ASCII range. The
 * corpus's transliteration diacritics — ġ ḥ ṭ ḳ š â and their kin —
 * span Latin-1 Supplement, Latin Extended-A and Latin Extended
 * Additional, three separate Unicode blocks, so a codepoint walk is
 * the honest test rather than a hand-picked regex range that would
 * silently miss one of them (and a `\x00`-anchored range trips
 * Biome's `noControlCharactersInRegex` besides). */
function hasNonAscii(token: string): boolean {
	for (const ch of token) {
		if ((ch.codePointAt(0) ?? 0) > 0x7f) {
			return true;
		}
	}
	return false;
}

/**
 * Whether an italic run beginning with `firstChars` opens a
 * transliteration rather than continuing an ordinary English gloss —
 * see the module doc's measurement (15/15, zero letter-A rids).
 */
function looksTransliterated(firstChars: string): boolean {
	const token = FIRST_TOKEN.exec(firstChars)?.[0];
	if (token === undefined) {
		return false;
	}
	if (hasNonAscii(token)) {
		return true;
	}
	return ABBREVIATIONS.has(token.replace(TRAILING_PERIOD, ''));
}

/** One declared copy per inserted space (ruling R2, module doc). */
function spaceCopies(inserted: number): string[] {
	return Array.from({ length: inserted }, () => ' ');
}

interface SimpleSeam {
	readonly id: string;
	readonly pattern: RegExp;
	readonly what: string;
}

/** Builds a rule whose repair is "insert one space at `$1|$2`", for
 * the three seams whose firing condition is the pattern alone —
 * `translitItalicSpace` and `gereshAbbrevSpace` need more than a bare
 * pattern match and are built separately below. */
function buildSimpleSeam(seam: SimpleSeam): Rule {
	return {
		apply(entry: SourceEntry): TransformResult {
			let inserted = 0;
			const healed = mapFields(entry, (text) =>
				text.replaceAll(seam.pattern, (_whole, left: string, right: string) => {
					inserted += 1;
					return `${left} ${right}`;
				}),
			);
			if (healed === undefined) {
				return { entry, records: [] };
			}
			const record: TransformRecord = {
				detail: `${inserted} space(s) restored at ${seam.what}`,
				rid: entry.rid,
				ruleId: seam.id,
			};
			return {
				copied: spaceCopies(inserted),
				entry: healed,
				records: [record],
			};
		},
		id: seam.id,
		phase: 'text-repairs',
	};
}

/** `</a><i>` seams whose anchor display does not end in `)` — see the
 * module doc, "Two owners, one seam". A `)</a><i>` instance is
 * `parenTagSpace`'s to repair, in full. */
const anchorItalicSpace: Rule = buildSimpleSeam({
	id: 'anchor-italic-no-space',
	pattern: ANCHOR_SEAM,
	what: 'the </a><i> seam, rendering "preced.Pi." (paren-adjacent instances declined to parenTagSpace)',
});

/** Every tag-adjacent close paren directly before `<i>` — `)<i>` and
 * `)</a><i>` both, in full. Owns the seam this module's docstring
 * resolves the collision with `anchorItalicSpace` in favour of. */
const parenTagSpace: Rule = buildSimpleSeam({
	id: 'paren-tag-no-space',
	pattern: PAREN_SEAM,
	what: "a tag-adjacent close paren before <i> ()<i> and )</a><i>, this rule's whole locus)",
});

/** The mirror seam: close italic directly before an opening paren. */
const italicParenSpace: Rule = buildSimpleSeam({
	id: 'italic-close-paren-nospace',
	pattern: ITALIC_PAREN_SEAM,
	what: 'the </i>( seam, mirror of )<i>',
});

/** A Latin token directly abutting an italic that opens a
 * transliteration, rather than continuing an ordinary gloss — see the
 * module doc's narrowing and measurement. */
const translitItalicSpace: Rule = {
	apply(entry: SourceEntry): TransformResult {
		let inserted = 0;
		const healed = mapFields(entry, (text) =>
			text.replaceAll(
				TRANSLIT_SEAM,
				(whole, left: string, tag: string, run: string) => {
					if (!looksTransliterated(run)) {
						return whole;
					}
					inserted += 1;
					return `${left} ${tag}${run}`;
				},
			),
		);
		if (healed === undefined) {
			return { entry, records: [] };
		}
		return {
			copied: spaceCopies(inserted),
			entry: healed,
			records: [
				{
					detail: `${inserted} space(s) restored before a transliteration-opening italic`,
					rid: entry.rid,
					ruleId: 'translit-italic-space-loss',
				},
			],
		};
	},
	id: 'translit-italic-space-loss',
	phase: 'text-repairs',
};

/** A geresh directly followed by a Hebrew letter, inside Hebrew
 * quotation text — see the module doc's `dir="rtl"` scoping and
 * measurement. */
const gereshAbbrevSpace: Rule = {
	apply(entry: SourceEntry): TransformResult {
		let inserted = 0;
		const healed = mapFields(entry, (text) =>
			serialize(
				tokenize(text).map((token) => {
					if (token.kind !== 'text' || !token.rtl) {
						return token;
					}
					const value = token.value.replaceAll(
						GERESH_SEAM,
						(_whole, geresh: string, letter: string) => {
							inserted += 1;
							return `${geresh} ${letter}`;
						},
					);
					return value === token.value ? token : { ...token, value };
				}),
			),
		);
		if (healed === undefined) {
			return { entry, records: [] };
		}
		return {
			copied: spaceCopies(inserted),
			entry: healed,
			records: [
				{
					detail: `${inserted} space(s) restored after a geresh abbreviation mark`,
					rid: entry.rid,
					ruleId: 'geresh-abbrev-space-loss',
				},
			],
		};
	},
	id: 'geresh-abbrev-space-loss',
	phase: 'text-repairs',
};

export {
	anchorItalicSpace,
	gereshAbbrevSpace,
	italicParenSpace,
	parenTagSpace,
	translitItalicSpace,
};
