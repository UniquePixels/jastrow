/**
 * Transform-tier no-new-text gate (spec §5, §5.1).
 *
 * Three layers. Markup is free to change — that is what most of the
 * 80 rules do — and is checked separately, for a well-formedness
 * DELTA rather than for well-formedness, by `markup.ts`. TEXT, with
 * tags stripped, must be a sub-multiset of the input's text, unless
 * the rule declares an `allows` list. A per-call COPY of text from
 * elsewhere in the same entry is checked against that entry's own
 * input rather than a static allowance (§5.1) — see
 * `checkNoNewText`'s `copied` parameter.
 *
 * The patch-tier validator (`admin/pipeline/patch/no-new-text.ts`)
 * cannot be reused here: its `flattenContent`
 * (`admin/pipeline/patch/schema.ts:579`) joins definitions *including
 * markup*, so a rule that merely adds an `<a href>` would read as
 * inventing text. This gate strips tags first.
 *
 * Every non-empty `allows` is a maintainer ruling in code. The ruling
 * of 2026-08-11 stands behind the OCR class: correcting a
 * mis-recognized glyph is correction, not composition, because the
 * glyph never was the source's content.
 *
 * Two caveats worth stating rather than discovering:
 *
 * - This gate compares raw CODEPOINTS, not grapheme clusters and not
 *   a normalized form. A bug that detaches a combining mark from its
 *   base and reattaches it to a neighbouring word leaves the
 *   multiset unchanged and passes — this gate is not a defense
 *   against mark reattachment, the tokenizer's `dir="rtl"` ancestry
 *   tracking (`html.ts`) is. And a rule that normalized NFD to NFC
 *   would trip the gate although it invented nothing; the corpus is
 *   known to mix normalization forms, so a rule that normalizes needs
 *   its own `allows` or `copied` accounting, not an exemption here.
 * - `allows` flattens every declared string to its individual
 *   codepoints (`rule.allows.flatMap((s) => [...s])`), so
 *   `allows: ['—2)']` permits unlimited `—`, `2` and `)` ANYWHERE in
 *   that rule's diff, not the three-character token together. That is
 *   the established contract from Task 0 — not something this task
 *   changes — documented here so rule authors see the blast radius
 *   before reaching for `allows` on a multi-character token.
 */
import type { SourceEntry, SourceSense } from '../body/types.ts';
import { serialize, tokenize } from './html.ts';

/** Joins `textOf`'s parts. NUL cannot occur in the corpus's text, so
 * it marks a seam between two fields (or two array elements, or two
 * senses) that were never adjacent in the source. Without it, a
 * `copied` string could span two unrelated fields — `headword: 'ab'`
 * plus `alt_headwords: ['cd']` would let `'bc'` pass as a "copy" that
 * no field ever actually contained. `multiset` strips this separator
 * before counting, so it never shows up as a phantom codepoint in the
 * sub-multiset comparison; only the substring check in
 * `checkNoNewText` (over `textOf`'s raw, separator-bearing output)
 * relies on it being present. */
const FIELD_SEP = '\u0000';

/** Strip markup, keeping only text-token content. A no-op on a field
 * that never carries tags in this corpus (`headword`, `alt_headwords`,
 * `plural_form`, `grammar.binyan_form`, `grammar.verbal_stem`,
 * `grammar.language_code`) — safe to apply uniformly rather than
 * special-case per field. */
function stripTags(html: string): string {
	return serialize(tokenize(html).filter((t) => t.kind === 'text'));
}

/**
 * Every text-bearing field a rule can edit, raw and in traversal
 * order: `headword`, `alt_headwords`, `plural_form`, `language_code`,
 * `language_reference`, `quotes` (each triple's two-or-three strings,
 * nulls skipped), and `content` — morphology, plus every sense's
 * `number`, `definition`, `grammar.binyan_form` (each string in the
 * array), `grammar.verbal_stem`, and `grammar.language_code`,
 * recursively through nested senses.
 *
 * `grammar.language_code` is a field distinct from the entry-level
 * `language_code` above, despite the shared name: it lives on a
 * sense's `grammar`, not the entry, and holds the same
 * etymology-fragment shape (`'(b. h.;'`) at 3 occurrences
 * corpus-wide (`admin/pipeline/provenance/baseline-transform.ts:101-103`).
 *
 * This list is exhaustive over `SourceEntry`, `SourceSense`, and
 * `SourceGrammar` by construction. **Two fields are excluded, both
 * deliberately:**
 *
 * - `refs[]` is dropped from truth (body model spec §5, B7) and holds
 *   machine identifiers — Sefaria ref strings — not text a rule could
 *   be said to invent or preserve.
 * - `rid` is the entry's primary key. It is an identifier, not text,
 *   and this gate is a text gate: a rule that rewrote a `rid` would
 *   pass here, and correctly so, because what such a rule needs is an
 *   IDENTITY assertion (the walk's rid must survive its own
 *   transform), not a sub-multiset one. No rule rewrites `rid` today;
 *   one that wants to must bring that assertion with it.
 *
 * A field outside this set is a field the gate cannot see, and a rule
 * editing only that field would pass vacuously (spec §5) — reported
 * as success on unreviewed output, which is worse than failing.
 * Adding a field to any of the three types means adding it here too.
 *
 * Both gates read this one list: `textOf` strips its tags and
 * compares text multisets, `markup.ts` compares its well-formedness
 * delta. One enumeration, so a new field cannot land in one gate's
 * view and not the other's.
 */
function fieldsOf(entry: SourceEntry): string[] {
	const parts: string[] = [
		entry.headword,
		...(entry.alt_headwords ?? []),
		...(entry.plural_form ?? []),
		entry.language_code ?? '',
		entry.language_reference ?? '',
		...(entry.quotes ?? []).flatMap((quote) =>
			quote.filter((s): s is string => s !== null),
		),
		entry.content.morphology ?? '',
	];
	const walk = (senses: readonly SourceSense[]): void => {
		for (const sense of senses) {
			parts.push(sense.number ?? '');
			if (sense.definition !== undefined) {
				parts.push(sense.definition);
			}
			parts.push(...(sense.grammar?.binyan_form ?? []));
			if (sense.grammar?.verbal_stem !== undefined) {
				parts.push(sense.grammar.verbal_stem);
			}
			if (sense.grammar?.language_code !== undefined) {
				parts.push(sense.grammar.language_code);
			}
			walk(sense.senses ?? []);
		}
	};
	walk(entry.content.senses);
	return parts;
}

/** `fieldsOf` with every field's tags stripped, joined with
 * `FIELD_SEP`. The text the sub-multiset comparison counts. */
function textOf(entry: SourceEntry): string {
	return fieldsOf(entry).map(stripTags).join(FIELD_SEP);
}

/** Codepoint → count. Skips `FIELD_SEP` — it marks a seam `textOf`
 * introduced between fields, not a corpus byte, so it must never
 * enter a sub-multiset comparison as a phantom codepoint. */
function multiset(text: string): Map<string, number> {
	const counts = new Map<string, number>();
	for (const ch of text) {
		if (ch === FIELD_SEP) {
			continue;
		}
		counts.set(ch, (counts.get(ch) ?? 0) + 1);
	}
	return counts;
}

/**
 * Codepoints the output holds beyond the input's — after crediting
 * the rule's declared `allows` codepoints and any declared `copied`
 * strings — minus that allowance. Empty means the rule invented
 * nothing.
 *
 * `copied` (spec §5.1) declares text this call duplicated from
 * elsewhere in the SAME entry — e.g. an abbreviation's elided tail,
 * recovered from the entry's own `headword` into `alt_headwords`. A
 * static `allows` cannot express this because the duplicated bytes
 * differ per entry. Each declared string is verified to occur in
 * `before`'s own text first — a declared copy that is not in the
 * source is reported as a violation, not silently permitted — and
 * only then credited to the budget, as a MULTISET (codepoint counts
 * added, not a set union), so declaring one copy permits exactly one
 * duplication, not unlimited ones.
 */
function checkNoNewText(
	before: SourceEntry,
	after: SourceEntry,
	rule: { allows?: readonly string[] },
	copied?: readonly string[],
): string[] {
	const permitted = new Set((rule.allows ?? []).flatMap((s) => [...s]));
	const inputText = textOf(before);
	const budget = multiset(inputText);
	const problems: string[] = [];
	for (const copy of copied ?? []) {
		if (!inputText.includes(copy)) {
			problems.push(
				`${after.rid}: declared copy ${JSON.stringify(copy)} does not occur in the input`,
			);
			continue;
		}
		for (const [ch, count] of multiset(copy)) {
			budget.set(ch, (budget.get(ch) ?? 0) + count);
		}
	}
	for (const [ch, count] of multiset(textOf(after))) {
		if (count > (budget.get(ch) ?? 0) && !permitted.has(ch)) {
			problems.push(
				`${after.rid}: introduced ${JSON.stringify(ch)} (U+${ch.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')})`,
			);
		}
	}
	return problems;
}

export { checkNoNewText, fieldsOf, stripTags, textOf };
