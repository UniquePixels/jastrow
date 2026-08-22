/**
 * Transform-tier no-new-text gate (spec §5).
 *
 * Two layers. Markup is free to change — that is what most of the 81
 * rules do. TEXT, with tags stripped, must be a sub-multiset of the
 * input's text, unless the rule declares an `allows` list.
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
 */
import type { SourceEntry, SourceSense } from '../body/types.ts';
import { serialize, tokenize } from './html.ts';

/** Every definition and sense number in the entry, tags stripped. */
function textOf(entry: SourceEntry): string {
	const parts: string[] = [entry.content.morphology ?? ''];
	const walk = (senses: readonly SourceSense[]): void => {
		for (const sense of senses) {
			parts.push(sense.number ?? '');
			if (sense.definition !== undefined) {
				parts.push(
					serialize(
						tokenize(sense.definition).filter((t) => t.kind === 'text'),
					),
				);
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

/** Codepoints the output holds beyond the input's, minus the rule's
 * declared allowance. Empty means the rule invented nothing. */
function checkNoNewText(
	before: SourceEntry,
	after: SourceEntry,
	rule: { allows?: readonly string[] },
): string[] {
	const permitted = new Set((rule.allows ?? []).flatMap((s) => [...s]));
	const input = multiset(textOf(before));
	const problems: string[] = [];
	for (const [ch, count] of multiset(textOf(after))) {
		if (count > (input.get(ch) ?? 0) && !permitted.has(ch)) {
			problems.push(
				`${after.rid}: introduced ${JSON.stringify(ch)} (U+${ch.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')})`,
			);
		}
	}
	return problems;
}

export { checkNoNewText, textOf };
