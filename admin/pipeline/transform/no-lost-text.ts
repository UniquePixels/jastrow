/**
 * Transform-tier no-LOST-text gate (batch-6b spec
 * `docs/specs/2026-08-28-structural-repairs-design.md` §2).
 *
 * The exact mirror of `checkNoNewText`, over the same `fieldsOf` walk
 * and the same `stripTags`, asking the opposite question: which
 * codepoints did the INPUT hold that the output does not?
 *
 * It exists because the three gates that shipped before it are blind
 * to deletion by construction. `checkNoNewText` is a SUB-multiset
 * test — a rule that empties a definition passes it, since emptiness
 * introduces nothing. `checkMarkup` compares well-formedness damage,
 * not content. `checkLinkTargets` reads anchor targets alone. Between
 * them they can see a rule invent, mangle or mis-address text, and
 * not one of them can see a rule silently drop it.
 *
 * That hole was tolerable while every rule rewrote a glyph inside one
 * field. It stops being tolerable the moment a rule MOVES text
 * between fields or between senses, because "moved" and "dropped"
 * differ only in whether the text arrives somewhere — which is
 * precisely the axis no other gate measures.
 *
 * **Scope, and it is deliberate.** `run.ts` enforces this gate for
 * `structural-repairs` rules only. Measured over all 32,512 entries,
 * 10 of the 39 rules already registered delete text — 4,504
 * codepoints between them, most of it substitution the multiset reads
 * as a deletion plus an addition (`"` → `״` alone is 2,125). Turning
 * the gate on globally would mean retrofitting a declaration onto ten
 * shipped rules in the PR that introduces it. Those ten are pinned by
 * their counts in `deletion-baseline.corpus.test.ts` instead, so an
 * eleventh deleting rule fails a test rather than passing unremarked.
 * Spec §2.3 carries the table and the argument.
 */
import type { SourceEntry } from '../body/types.ts';
import { textOf } from './no-new-text.ts';

/** Codepoint → count, over one field-joined text. Mirrors
 * `no-new-text.ts`'s private helper; the field separator never enters
 * either multiset, so a seam this module introduced cannot be read as
 * a corpus byte. */
function multiset(text: string): Map<string, number> {
	const counts = new Map<string, number>();
	for (const ch of text) {
		counts.set(ch, (counts.get(ch) ?? 0) + 1);
	}
	return counts;
}

/**
 * Codepoints the input holds beyond the output's, after crediting the
 * call's declared `removes`. Empty means the rule dropped nothing it
 * did not say it would.
 *
 * `removes` is the mirror of `TransformResult.copied`: a PER-CALL
 * declaration, verified to occur in the input before it is credited,
 * and credited as a MULTISET — so declaring one deletion permits
 * exactly one, not unlimited ones. A declared removal absent from the
 * input is reported as a violation rather than silently ignored,
 * because a rule that cannot say what it deleted has not shown that
 * it knows.
 *
 * Deliberately NOT expressed through a static `Rule.allows`-style
 * list: what a structural rule deletes is per-entry (one marker's
 * trailing space here, a stray label period there), and a static list
 * would license that codepoint everywhere in the rule's diff. The
 * `allows` blast radius is documented in `no-new-text.ts` and is the
 * thing this parameter exists to avoid inheriting.
 */
function checkNoLostText(
	before: SourceEntry,
	after: SourceEntry,
	removes?: readonly string[],
): string[] {
	const inputText = textOf(before);
	const remaining = multiset(textOf(after));
	const problems: string[] = [];
	for (const removed of removes ?? []) {
		if (!inputText.includes(removed)) {
			problems.push(
				`${after.rid}: declared removal ${JSON.stringify(removed)} does not occur in the input`,
			);
			continue;
		}
		for (const [ch, count] of multiset(removed)) {
			remaining.set(ch, (remaining.get(ch) ?? 0) + count);
		}
	}
	for (const [ch, count] of multiset(inputText)) {
		if (count > (remaining.get(ch) ?? 0)) {
			problems.push(
				`${after.rid}: dropped ${JSON.stringify(ch)} (U+${ch.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')})`,
			);
		}
	}
	return problems;
}

export { checkNoLostText };
