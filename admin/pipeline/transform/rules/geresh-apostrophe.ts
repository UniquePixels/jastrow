/**
 * `geresh-apostrophe-as-gershayim` — a geresh followed by an ASCII
 * apostrophe standing where print sets a single `״`.
 *
 * Found by the residue sweep (batch 04, A02072's `Y. Sabb.` quotation)
 * and re-measured here rather than taken from the report.
 *
 * ## The third arm of the gershayim family, and the first that is not
 * in place
 *
 * `rules/gershayim.ts` owns the two ASCII-quote arms and both are
 * length-preserving: `"` → `״`, same offsets, which is what its
 * `sameShape` assertion and its position-for-position `repairedTokens`
 * walk rest on. This arm removes TWO codepoints and writes ONE, so it
 * cannot reuse that module's `build()` and does not try to. It ships
 * here with its own argument.
 *
 * ## The predicate has no residue, and that is the measurement
 *
 * Over all 32,512 entries after `applyRepairs`, every field `fieldsOf`
 * walks:
 *
 * | | |
 * | --- | --- |
 * | `׳'` flanked by Hebrew, in document text | **25 occurrences / 20 entries** |
 * | `׳'` flanked by Hebrew, inside a `<…>` interior | **0** |
 * | `׳'` NOT flanked by Hebrew, anywhere | **0** |
 *
 * So the flanking and the tag mask separate nothing in today's corpus
 * — the bare two-character run would find the same 25. They are kept
 * because they are what makes the rule safe under a RE-FETCH, where
 * the run could land in an attribute or beside a Latin token, and
 * because a predicate that states its scope is checkable where a bare
 * `indexOf` is not. Recording that they cost nothing today is the
 * honest version of the claim: this is a stated scope, not a filter
 * doing work.
 *
 * Controls, each parsed rather than grepped (the escaped-JSON trap
 * `report-batch-04.md` records), and each stated with its BASIS: over
 * RAW fields, 65,702 plain gereshes, 1,349,937 ASCII quotes and 943
 * ASCII apostrophes; read through `stripTags` the geresh figure is
 * 64,254, the 1,448 difference living inside `data-ref` and `href`
 * attributes that carry Hebrew too. The corpus tier asserts both.
 * The other 918 apostrophes are
 * all Latin transliterations inside Sefaria ref attributes
 * (`Tosefta Ma'asrot`, `Shevi'it`) and never Hebrew-flanked, which is
 * why the flanking clause is the right one to have written even
 * though it is currently free.
 *
 * ## Why `allows: ['״']` is safe here
 *
 * The same OCR ruling of 2026-08-11 the gershayim pair cites: a
 * mis-recognized glyph never was the source's content, so correcting
 * it is correction and not composition.
 *
 * And the same by-construction argument, which is what actually bounds
 * it: this module writes a `״` ONLY where it removed a `׳'`, one for
 * one, in place. Every `״` in the output is one this call put there,
 * whatever the input held — so the allowance's blast radius is bounded
 * by the predicate rather than by the corpus fact that U+05F4 occurs 0
 * times in the pinned snapshot. That corpus fact is true of the
 * snapshot and false under composition, since `run.ts` feeds each rule
 * the previous rule's output and `gershayimInBody` runs in the same
 * phase.
 *
 * ## Glyph only, never slot
 *
 * The repair does not move a mark or source it from a twin elsewhere:
 * the gershayim is written exactly where the two damaged codepoints
 * stood. 18 of the 21 distinct repaired tokens happen to be attested
 * elsewhere in the corpus with the ASCII quote in the same slot
 * (`הקב"ה` 228, `אע"פ` 70, `ע"ג` 89, `ע"י` 85, `ד"א` 26), and the
 * three without are `וד״א` — `ד״א` with a vav prefix — `נצטד״ק`,
 * whose entry D00755 also carries the witnessed `דכ״ץ`, and `הב״ע`.
 * **The rule reads none of them.** They are corroboration for the
 * reading, not the licence for the edit, which is what keeps this
 * clear of both the no-vowel-inference ruling and the slot-moving the
 * gershayim pair explicitly declines.
 *
 * ## Scope
 *
 * Document text only. 0 of the 25 sit inside a tag, so this rule
 * writes no link target, declares nothing to `link-target.ts`, and
 * leaves every `<…>` run byte-identical.
 */
import type { SourceEntry } from '../../body/types.ts';
import { mapFields } from '../fields.ts';
import { HEBREW, HEBREW_ATOM } from '../html.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/** U+05F4 HEBREW PUNCTUATION GERSHAYIM — the mark print sets and the
 * only character this module ever produces. */
const GERSHAYIM = '״';

/** U+05F3 HEBREW PUNCTUATION GERESH, then an ASCII apostrophe, with a
 * Hebrew letter either side and both sides zero-width.
 *
 * `HEBREW_ATOM` on the left rather than a bare class, for the reason
 * `gershayim.ts` gives: a Hebrew letter may carry a combining mark
 * between itself and the mark. `HEBREW` already admits the points, so
 * a vowel before the geresh is matched by the class itself. */
const FLANKED = new RegExp(`(?<=${HEBREW_ATOM})׳'(?=[${HEBREW}])`, 'gu');

/** A `<…>` run holding no angle bracket of its own — the same mask
 * `gershayim.ts` uses, and deliberately not `html.ts`'s tokenizer
 * regex: it is the conservative reading of the two, treating a `<`
 * with no `>` before the next `<` as text. */
const TAG = /<[^<>]*>/gu;

/** A character belonging to the abbreviation the mark sits in —
 * Hebrew (U+05F4 included, so a repaired token reads whole) plus the
 * combining dot `html.ts` admits as a suffix. Used only to name the
 * repaired token in a record. */
const TOKEN_CHAR = new RegExp(`[${HEBREW}̇]`, 'u');

/**
 * Replace every flanked run in `value`, leaving tag interiors alone.
 *
 * The mask is built by blanking each `<…>` run to spaces of the same
 * length, so offsets in the masked copy are the offsets in `value` and
 * a match found on the mask can be spliced out of the original. Spaces
 * cannot themselves satisfy the lookaround, so nothing inside a tag
 * can match and nothing that spans a tag boundary can either.
 *
 * The `includes` guard is a fast path over a 41 MB corpus, and it also
 * returns the SAME string reference for almost every field — which is
 * what lets the rule compare with `!==` and hand back the caller's own
 * entry object unchanged.
 *
 * When `tokens` is given, the abbreviation surrounding each run this
 * CALL replaces is pushed onto it, read off the ORIGINAL `value` at
 * the match's own position — never off the field this rule hands
 * back, and never by re-scanning for `GERSHAYIM` after the fact.
 *
 * That distinction is the fix for CodeRabbit PR #71 comment
 * 3951117393: `applyTransforms` feeds each rule the previous rule's
 * output, `gershayimInBody` runs earlier in the same `text-repairs`
 * phase and routinely leaves `״` behind it, and a field this rule
 * touches can carry BOTH marks — its own and one already written by
 * an earlier rule. Attributing a record's tokens by rescanning the
 * healed field for every `״` credited both to this one call; deriving
 * them from the matches `FLANKED` itself found is immune to whatever
 * a prior rule already wrote, because it never looks at that mark at
 * all.
 */
function repairText(value: string, tokens?: string[]): string {
	if (!value.includes(`׳'`)) {
		return value;
	}
	const masked = value.replace(TAG, (tag) => ' '.repeat(tag.length));
	let out = '';
	let read = 0;
	for (const match of masked.matchAll(FLANKED)) {
		const at = match.index;
		out += value.slice(read, at) + GERSHAYIM;
		tokens?.push(tokenAround(value, at));
		read = at + 2;
	}
	return out + value.slice(read);
}

/** The abbreviation surrounding the two-codepoint run at `at` in the
 * PRE-replacement `value`, with the run itself rendered as the
 * `GERSHAYIM` it becomes. Bounded by `TOKEN_CHAR`, so it stops at the
 * space that ends the word rather than running to the end of the
 * field. */
function tokenAround(value: string, at: number): string {
	let start = at;
	let end = at + 2;
	while (start > 0 && TOKEN_CHAR.test(value[start - 1] ?? '')) {
		start -= 1;
	}
	while (end < value.length && TOKEN_CHAR.test(value[end] ?? '')) {
		end += 1;
	}
	return value.slice(start, at) + GERSHAYIM + value.slice(at + 2, end);
}

/** The one record this call produces, naming what it repaired. */
function recordFor(
	entry: SourceEntry,
	tokens: readonly string[],
): TransformRecord {
	return {
		detail: `${tokens.length} restored: ${[...new Set(tokens)].join(', ')}`,
		rid: entry.rid,
		ruleId: 'geresh-apostrophe-as-gershayim',
	};
}

const gereshApostropheGershayim: Rule = {
	// The OCR ruling of 2026-08-11, and the by-construction argument in
	// this module's docstring: a `״` is only ever written where a `׳'`
	// was removed, so every one in the output is this call's own work.
	allows: [GERSHAYIM],
	apply(entry: SourceEntry): TransformResult {
		const tokens: string[] = [];
		const healed = mapFields(entry, (value) => repairText(value, tokens));
		if (healed === undefined) {
			return { entry, records: [] };
		}
		return {
			entry: healed,
			records: [recordFor(entry, tokens)],
			// Two codepoints leave for every one written. Credited as a
			// MULTISET — one declaration permits one deletion — so this is
			// N entries and not one repeated string. `removes` is read only
			// by `structural-repairs`, so nothing checks it in this phase;
			// it is declared because the deletion is real and a later phase
			// move should not have to rediscover it.
			removes: tokens.map(() => `׳'`),
		};
	},
	id: 'geresh-apostrophe-as-gershayim',
	phase: 'text-repairs',
};

export { gereshApostropheGershayim, repairText };
