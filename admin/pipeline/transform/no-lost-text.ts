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
 * **Scope.** `run.ts` runs this gate for EVERY phase. It ran for
 * `structural-repairs` alone until 2026-09-21, and the review that
 * closed that hole put it plainly: a `text-repairs` rule that deleted
 * text passed all four gates and every test, because the other three
 * are blind to deletion by construction and `migrate`'s
 * `checkTextConservation` compares the composed body against the
 * finished entry, not one rule against its own input.
 *
 * The reason the gate was scoped in the first place was real and has
 * not gone away. Measured over all 32,512 entries on 2026-09-21,
 * SEVENTEEN registered rules drop codepoints: four in
 * `structural-repairs`, which already declared theirs per call
 * through `removes`, and thirteen in `text-repairs`, which did not
 * have to. Turning the gate on globally means retrofitting a
 * declaration onto all thirteen.
 *
 * Nine of them carry it in `LOSS_ALLOWANCES` below — one table, each
 * row a rule id and the exact codepoints that rule was measured to
 * drop, which is what the retired per-rule corpus check used to pin.
 * The other four declare theirs per call through `removes`, because
 * what they drop is per-ENTRY and a static list would have had to
 * name most of the Hebrew alphabet: `gender-pair-headword-line-collapse`
 * (a duplicate alt-headword), `unterminated-href-swallows-closing-tag`
 * (a tag tail that was text only while the tag was broken),
 * `geresh-apostrophe-as-gershayim` and `asterisk-stem-label`. The last
 * two already declared `removes` before this gate read it in their
 * phase; those declarations are load-bearing now.
 */
import type { SourceEntry } from '../body/types.ts';
import { multiset, textOf } from './no-new-text.ts';

/**
 * Text-phase rules measured to drop codepoints, and the exact set
 * each one drops. Every row is a maintainer ruling in code, the same
 * standing a non-empty `Rule.allows` has on the other gate, and every
 * count below comes from a run over all 32,512 entries on
 * 2026-09-21.
 *
 * The table is keyed by rule id rather than declared on the rules
 * themselves for one reason: it is the list a reviewer has to read to
 * know which rules delete text, and spread over ten rule files nobody
 * reads it. A rule NOT named here may not lose a codepoint — which is
 * the hole this closes. Adding a row is a deliberate act with the
 * measurement attached, not a way past a failing gate: a new rule
 * that trips the gate is a finding first.
 *
 * `allowsLoss` flattens to codepoints and is credited without limit,
 * so a row licenses its characters ANYWHERE in that rule's diff —
 * `no-new-text.ts` documents the same blast radius for `allows`. It
 * is bounded here by the sets being tiny: a space, an ASCII quote, a
 * geresh, two Hebrew letters a substitution replaces.
 */
const LOSS_ALLOWANCES: ReadonlyMap<string, readonly string[]> = new Map([
	// Splits a fused headword at the space it was fused across (4
	// entries, 4 codepoints).
	['abbrev-fused-headword', [' ']],
	// `"` → `״`. The multiset reads a substitution as a deletion plus
	// an addition; the addition is already licensed by the rule's
	// `allows` (1,386 entries, 2,125 codepoints).
	['ascii-quote-as-gershayim-in-body', ['"']],
	// Normalises the spacing around an em-dash section break (270
	// entries, 508 spaces).
	['em-dash-section-break-in-own-italic', [' ']],
	// Trims the space at the edge of an emphasis run (214 entries, 229
	// spaces).
	['emphasis-run-edge-space', [' ']],
	// `ר`/`ח` → `ד`/`ה`: a dagesh that cannot occur identifies an
	// OCR confusion between two letter shapes, and the substitution
	// reads as a deletion (12 entries, 13 codepoints).
	['impossible-dagesh', ['ר', 'ח']],
	// Lifts a parenthesized alternate out of the headword, dropping the
	// parentheses that held it — and, in 13 of the 579, a space beside
	// them (579 entries, 1,152 codepoints: `(` ×571, `)` ×568, space
	// ×13).
	['parenthesized-alt-headword', ['(', ')', ' ']],
	// Expands a geresh-abbreviated phrase stub to the full form, so the
	// geresh itself goes (228 entries, 236 codepoints).
	['phrase-alt-headword-stub', ['׳']],
	// `י` → shuruk: the display corruption spelled a shuruk as a yod,
	// and the repair reads as a deletion (12 entries, 12 codepoints).
	['shuruk-as-yod-display-corruption', ['י']],
	// Trims trailing whitespace from a definition (10 entries).
	['trailing-whitespace-definition', [' ']],
]);

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
 * The declarations share ONE budget drawn from the input, and that is
 * where the mirror stops being exact. `removes: ['a', 'a']` against an
 * input holding a single `a` is refused: an entry cannot lose more of
 * a codepoint than it had. `copied` must NOT work that way — each
 * declaration there licenses one duplication of text the input holds
 * once, which is the whole point of a copy. Deleting the same
 * character twice is not an operation; copying it twice is.
 *
 * `removes` is deliberately NOT a static `Rule.allows`-style list:
 * what a structural rule deletes is per-entry (one marker's trailing
 * space here, a stray label period there), and a static list would
 * license that codepoint everywhere in the rule's diff. The `allows`
 * blast radius is documented in `no-new-text.ts`.
 *
 * `allowsLoss` is that static list all the same, for the text-phase
 * rules whose deletion is a per-RULE fact rather than a per-entry one
 * — a substitution the multiset reads as a deletion plus an addition,
 * or a whitespace trim. It is flattened to codepoints and credited
 * without limit, exactly as `Rule.allows` is on the other gate, and
 * carries the same blast radius: name a codepoint here and the rule
 * may drop it anywhere in its diff. `LOSS_ALLOWANCES` below is the
 * only caller that supplies it, and every entry there is a measured
 * maintainer ruling.
 */
function checkNoLostText(
	before: SourceEntry,
	after: SourceEntry,
	removes?: readonly string[],
	allowsLoss?: readonly string[],
): string[] {
	const permitted = new Set((allowsLoss ?? []).flatMap((c) => [...c]));
	const inputText = textOf(before);
	const available = multiset(inputText);
	const remaining = multiset(textOf(after));
	const problems: string[] = [];
	// Declarations are credited against a shared budget, not checked one
	// at a time. `removes: ['a', 'a']` over an input holding one `a`
	// must fail: you cannot delete more of a codepoint than the entry
	// had. THIS IS THE OPPOSITE OF `copied` in `no-new-text.ts`, where
	// each declaration legitimately licenses one DUPLICATION of text the
	// input holds once — copying a headword tail twice is a real
	// operation, deleting a character twice is not.
	for (const removed of removes ?? []) {
		const claim = multiset(removed);
		const short = [...claim.entries()].some(
			([ch, count]) => count > (available.get(ch) ?? 0),
		);
		if (short || !inputText.includes(removed)) {
			problems.push(
				`${after.rid}: declared removal ${JSON.stringify(removed)} does not occur in the input`,
			);
			continue;
		}
		for (const [ch, count] of claim) {
			available.set(ch, (available.get(ch) ?? 0) - count);
			remaining.set(ch, (remaining.get(ch) ?? 0) + count);
		}
	}
	for (const [ch, count] of multiset(inputText)) {
		if (count > (remaining.get(ch) ?? 0) && !permitted.has(ch)) {
			problems.push(
				`${after.rid}: dropped ${JSON.stringify(ch)} (U+${ch.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')})`,
			);
		}
	}
	return problems;
}

export { checkNoLostText, LOSS_ALLOWANCES };
