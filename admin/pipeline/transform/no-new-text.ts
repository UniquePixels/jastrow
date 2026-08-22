/**
 * Transform-tier no-new-text gate (spec §5, §5.1).
 *
 * Three layers. Markup is free to change — that is what most of the
 * 81 rules do. TEXT, with tags stripped, must be a sub-multiset of
 * the input's text, unless the rule declares an `allows` list. A
 * per-call COPY of text from elsewhere in the same entry is checked
 * against that entry's own input rather than a static allowance
 * (§5.1) — see `checkNoNewText`'s `copied` parameter.
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

/** Strip markup, keeping only text-token content. A no-op on a field
 * that never carries tags in this corpus (`headword`, `alt_headwords`,
 * `plural_form`) — safe to apply uniformly rather than special-case
 * per field. */
function stripTags(html: string): string {
	return serialize(tokenize(html).filter((t) => t.kind === 'text'));
}

/**
 * Every text-bearing field a rule can edit, tags stripped and
 * concatenated: `headword`, `alt_headwords`, `plural_form`,
 * `language_reference`, `quotes` (each triple's two-or-three strings,
 * nulls skipped), and `content` (morphology, plus every sense's
 * number and definition, recursively through nested senses).
 *
 * `refs[]` is deliberately excluded: it is dropped from truth (body
 * model spec §5, B7) and holds machine identifiers — Sefaria ref
 * strings — not text a rule could be said to invent or preserve.
 *
 * A field outside this set is a field the gate cannot see, and a rule
 * editing only that field would pass vacuously (spec §5) — extend
 * this function, not the call sites, if a rule needs to touch a new
 * field.
 */
function textOf(entry: SourceEntry): string {
	const parts: string[] = [
		stripTags(entry.headword),
		...(entry.alt_headwords ?? []).map(stripTags),
		...(entry.plural_form ?? []).map(stripTags),
		stripTags(entry.language_reference ?? ''),
		...(entry.quotes ?? []).flatMap((quote) =>
			quote.filter((s): s is string => s !== null).map(stripTags),
		),
		stripTags(entry.content.morphology ?? ''),
	];
	const walk = (senses: readonly SourceSense[]): void => {
		for (const sense of senses) {
			parts.push(sense.number ?? '');
			if (sense.definition !== undefined) {
				parts.push(stripTags(sense.definition));
			}
			walk(sense.senses ?? []);
		}
	};
	walk(entry.content.senses);
	return parts.join('');
}

/** Codepoint → count. */
function multiset(text: string): Map<string, number> {
	const counts = new Map<string, number>();
	for (const ch of text) {
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

export { checkNoNewText, textOf };
