/**
 * The loss report: what a patch takes out of an entry (review checklist
 * 2026-10-25, group 2). The mirror of the no-new-text floor
 * (`no-new-text.ts`), which asks what a patch ADDS and exempts a
 * reviewed patch; this asks what it REMOVES, and exempts nothing.
 *
 * The pool is the transform tier's (`fieldsOf`,
 * `transform/no-new-text.ts`), the wider of the two no-new-text pools:
 * every text field a rule or a patch can edit, `display` among them,
 * where the patch floor's `flattenContent` holds neither `display` nor
 * the grammar fields. To it this adds `refs`, which no no-new-text pool
 * holds (an `unref` removes an item a reader sees as a source link).
 * Markup tags are stripped, whitespace and invisible format characters
 * (`\p{Cf}`: bidi marks, joiners) are dropped, and a `display`
 * template's `{n}` slots are cut, since a slot is a pointer to a form,
 * not a character print sets. What is left is the visible codepoints.
 *
 * The removed multiset is the pool before minus the pool after,
 * counted per codepoint: a patch that turns `l)` into `1)` removes one
 * `l`, and a patch that moves a word removes nothing. It is written in
 * the order the codepoints stand in the entry before the patch, so a
 * removed word reads as the word.
 *
 * A reviewed patch declares what it removes in `removes`
 * (`PatchBase.removes`, `schema.ts`); gate 12, `declaredLoss`
 * (`import/gates.ts`), holds the declaration to this computation.
 */
import { fieldsOf, stripTags } from '../transform/no-new-text.ts';
import type { SourceEntry } from '../types.ts';

/** What is not a visible codepoint: whitespace, and the invisible
 * format characters (bidi marks, zero-width joiners). */
const INVISIBLE = /^[\s\p{Cf}]$/u;
/** A `display` template's slot (`{0}`): a pointer to a form. */
const DISPLAY_SLOT = /\{\d+\}/gu;

/** The visible codepoints of a string, in order. */
function visible(text: string): string[] {
	return [...text].filter((cp) => !INVISIBLE.test(cp));
}

/** Codepoint → count over the visible codepoints of `text`. */
function visibleCounts(text: string): Map<string, number> {
	const counts = new Map<string, number>();
	for (const cp of visible(text)) {
		counts.set(cp, (counts.get(cp) ?? 0) + 1);
	}
	return counts;
}

/** The loss pool of an entry: every field `fieldsOf` reads, with the
 * `display` template's slots cut, then every `refs` item, tags
 * stripped, in that order. */
function lossPool(entry: SourceEntry): string {
	const slotless: SourceEntry =
		entry.display === undefined
			? entry
			: { ...entry, display: entry.display.replace(DISPLAY_SLOT, '') };
	return [...fieldsOf(slotless), ...(entry.refs ?? [])].map(stripTags).join('');
}

/** The visible codepoints `after` lost against `before`, as a
 * multiset, written in the order they stand in `before`. Empty when
 * the change removed nothing visible.
 *
 * The two pools are trimmed of their common prefix and suffix first,
 * and the multiset is taken over what is left of each, so a removed
 * run is written as the run it was rather than gathered from wherever
 * its codepoints first occur in the entry (a deleted duplicate would
 * otherwise read scrambled). The trim changes no count: the prefix and
 * suffix are on both sides and cancel. */
function removedCodepoints(before: SourceEntry, after: SourceEntry): string {
	const was = visible(lossPool(before));
	const now = visible(lossPool(after));
	let start = 0;
	while (
		start < was.length &&
		start < now.length &&
		was[start] === now[start]
	) {
		start++;
	}
	let end = 0;
	while (
		end < was.length - start &&
		end < now.length - start &&
		was[was.length - 1 - end] === now[now.length - 1 - end]
	) {
		end++;
	}
	const cut = was.slice(start, was.length - end);
	const deficit = new Map<string, number>();
	for (const cp of cut) {
		deficit.set(cp, (deficit.get(cp) ?? 0) + 1);
	}
	for (const cp of now.slice(start, now.length - end)) {
		deficit.set(cp, (deficit.get(cp) ?? 0) - 1);
	}
	let removed = '';
	for (const cp of cut) {
		const owed = deficit.get(cp) ?? 0;
		if (owed > 0) {
			removed += cp;
			deficit.set(cp, owed - 1);
		}
	}
	return removed;
}

/** How a declaration departs from the computed loss: the codepoints it
 * removes and does not declare, and those it declares and does not
 * remove. Both empty when they agree as multisets (order and
 * whitespace are free in a declaration). */
function lossMismatch(
	declared: string,
	removed: string,
): { undeclared: string; unremoved: string } {
	const want = visibleCounts(declared);
	let undeclared = '';
	for (const cp of visible(removed)) {
		const left = want.get(cp) ?? 0;
		if (left > 0) {
			want.set(cp, left - 1);
		} else {
			undeclared += cp;
		}
	}
	let unremoved = '';
	for (const [cp, count] of want) {
		unremoved += cp.repeat(count);
	}
	return { undeclared, unremoved };
}

export { lossMismatch, lossPool, removedCodepoints, visible };
