/**
 * Class C (batch-3b spec §3) — the two deletion rows whose audits
 * license the deletion.
 *
 * The sub-multiset gate passes ANY deletion by construction, so it
 * cannot tell a correct one from deleting the wrong byte. Both rules
 * below therefore carry a POSITION FILTER, and in both cases the
 * filter is the rule: what makes a byte deletable here is never the
 * byte, always where it sits.
 *
 * ## `emphasisRunEdgeSpace` — a deletion where the space is
 * redundant, a move where deleting it would weld two words
 *
 * The row's `description` states the harm in the RENDERED text —
 * "space captured inside an italic run's boundary (`<i>␣` or `␣</i>`),
 * rendering a doubled space in extracted text" — and under the ruling
 * of 2026-08-25 (Brian) a repair for a rendered harm must fix the
 * rendered text. A pure MOVE across the tag boundary does not: the
 * doubling is a property of the two spaces' rendered adjacency, and
 * moving one of them from one side of a tag to the other leaves them
 * just as adjacent. Measured on the pinned snapshot, the move changes
 * the rendered text of 0 of the row's 304 entries.
 *
 * But the row's own consequence clause is true of only PART of its
 * population, and this is the fact the rule is built around. Of the
 * 388 catalogued occurrences (238 `<i>␣` + 150 `␣</i>`, across 304
 * entries — all four figures reproduce exactly):
 *
 * - **176 render a doubled space** — 92 at a leading edge, 84 at a
 *   trailing one. These are not this rule's own arithmetic: they are
 *   the figures the sibling row
 *   `doubled-space-as-text-loss-locator`'s round-3 audit measured and
 *   handed over, in its own words, "Markup seam (tag between the
 *   spaces: `<i>` 92, `</i>` 84): 176 occurrences / 176 entries …
 *   both belong to the round-3 emphasis-run-edge-space row, not here."
 *   For these the captured space is redundant and is DELETED.
 * - **212 render a single space** that is the only thing separating
 *   two words. Deleting one of those would weld the words together —
 *   inventing a defect, not repairing one. For these the rule performs
 *   the MOVE: the space ends up outside the run, which is the corpus's
 *   own overwhelming convention (space outside an opening run 30,452
 *   times against 238 inside, 0.78%; outside a closing run 11,808
 *   against 150 inside, 1.25%), and which is precisely what the row's
 *   `reason` asks for when it calls this "MARKUP-WHITESPACE DRIFT, NOT
 *   TEXT LOSS … A NORMALIZATION ITEM AT MOST" whose severity is "a
 *   defect only if v2 stores emphasis runs as text without trimming".
 *
 * The two dispositions need no branch, because they converge on the
 * same canonical shape — the space lives outside the run, exactly
 * once. ` ?<i> ` → ` <i>` deletes the inner space when an outer one
 * was consumed and moves it when there was none; ` </i> ?` → `</i> `
 * mirrors it. So the rule is one substitution per edge, it reproduces
 * the catalogued population whole rather than re-scoping it, and its
 * effect on the corpus is measured as a DEFECT COUNT rather than an
 * invariant: rendered doubled spaces in its 304 touched entries go
 * **179 before → 3 after**.
 *
 * The 3 survivors are the standing check's first answer.
 * `doubled-space-as-text-loss-locator` (108, `route: judgment`,
 * `blocking: true`) owns the LITERAL doubled space — both spaces in
 * the raw field, no tag between — and its audit says "DO NOT WIDEN
 * THIS ROW". Both patterns here require the tag BETWEEN the two
 * spaces, so the literal population is declined by construction, in
 * any registration order; the 3 that survive in these entries
 * (`C00779`, `K00980`, `T00907`) are literal ones, and the
 * corpus-tier test asserts their count is the same before and after.
 * That row is `blocking` and routed to judgment, not transform: its
 * doubled spaces are evidence of dropped text, and deleting one would
 * destroy the locator rather than repair anything. Nothing in this
 * rule can create a literal one either — the corpus holds no ` ␣␣<i>␣`
 * or `␣</i>␣␣` shape for the substitution to collapse into one (0
 * occurrences of each).
 *
 * Two more neighbours could be spelled with these characters and are
 * declined the same way, by predicate rather than by registry
 * position: `em-dash-section-break-in-own-italic`'s seam is
 * `.</i> <i>—</i> `, whose spaces sit OUTSIDE both tags, and
 * `italic-lone-punctuation`'s `<i>.</i>` carries no space at either
 * edge. Neither pattern here can reach one.
 *
 * ORDERING, for Task 7. Four seam rules in `seam-space.ts` INSERT the
 * space this rule normalises, at shapes this rule also matches: 37
 * leading-edge occurrences follow `)` or `)</a>` (`paren-tag-no-space`),
 * 4 follow `</a>` (`anchor-italic-no-space`), and 12 trailing-edge
 * occurrences precede `(` (`italic-close-paren-nospace`). Measured
 * both ways, the two orders CONVERGE on the same bytes — the seam rule
 * inserts a space this rule then absorbs, or this rule moves one the
 * seam rule then declines — so ordering against them is free, and only
 * the per-rule record counts differ. The one order that is NOT free is
 * against `italic-swallowed-terminal-period`: 29 trailing-edge
 * occurrences read `<i>gloss.␣</i>`, whose period is hidden from that
 * row by the captured space, and this rule uncovers it. See
 * `edge-trim.test.ts` and task-5-report.md for the measured figure
 * Task 7 needs.
 *
 * ## `trailingWhitespaceDefinition` — the position filter IS the rule
 *
 * Its catalogued population was 2,352 entries and its audit cut it to
 * 10, the largest correction of the whole catalogue audit, because
 * 2,430 of 2,450 occurrences are the FIELD-SPLIT SEPARATOR CONVENTION
 * — the only thing standing between a gloss head and the "1)" that
 * follows it. The audit's own words: "DO NOT WRITE A CORPUS-WIDE
 * trimEnd() ON definition — it would weld gloss heads onto their sense
 * labels across the corpus."
 *
 * Only the last sense of an entry, with nothing following to consume
 * the separator, is trimmed — and "last" is found by walking
 * `sense.senses` recursively, because senses nest: the flat top-level
 * read gives 8 rather than the catalogued 10. The corpus-tier test
 * asserts three figures at once — 10 shipped, 8 for the flat walk,
 * 2,352 for a definition-wide sweep — so the filter cannot be removed
 * silently: `expect(shipped).toBe(10)` fails under BOTH the flat-walk
 * mutation and the widen-to-any-sense one.
 *
 * Read that 2,352 precisely, because it is not this rule's own
 * counterfactual. It is the catalogue's pre-audit figure ("2,352
 * entries with a trailing-whitespace definition"), reproduced by the
 * TEST's own `trailing` predicate, which has no whitespace-only guard.
 * Widening the SHIPPED rule to every sense gives **2,340** — the same
 * 12 the audit subtracts in the very next clause, since `strippable`
 * already declines them. The two numbers reconcile exactly, and 2,340
 * is still 234 times the population this row is allowed to touch.
 *
 * Two declines. A definition that is WHITESPACE AND NOTHING ELSE is
 * left alone: the audit's own arithmetic subtracts those before it
 * counts ("2,352 … minus the 12 whose definition is whitespace and
 * nothing else"), and trimming one would empty the field rather than
 * tidy it. 12 such definitions exist corpus-wide and none currently
 * sits at an entry-final leaf, so the guard is fail-closed against
 * composition rather than a live population. And a deepest-last leaf
 * with no `definition` at all does NOT fall back to its parent —
 * falling back is a different predicate with a different population,
 * and 10 is the leaf figure.
 *
 * The standing check for this row: no other catalogued row claims
 * trailing whitespace on `definition`. `binyan-form-leading-space`
 * (457) is `grammar.binyan_form` — a different field, and the opposite
 * edge. The only rule that could hand this one a new member is
 * `emphasisRunEdgeSpace` above, and BOTH of that rule's edges are
 * pinned in the corpus tier, because it demonstrably moves one of
 * them:
 *
 * - TRAILING, this row's own locus: measured, no `␣</i>` in the corpus
 *   ends its field or is followed only by tags, so the count of
 *   space-TERMINATED fields is identical before and after — 95 → 95.
 * - LEADING, the edge the rule does move: 20 of the 238 `<i>␣`
 *   occurrences open their field, so the move writes a raw leading
 *   space onto 20 fields — 356 → 376, every one of them a
 *   `definition`, with no `headword`, `plural_form` or `quotes`
 *   touched. That lands in no catalogued row's locus either (again,
 *   `binyan-form-leading-space` is a different field), and it is
 *   rendered-neutral: those fields already began with that space once
 *   tags are stripped. It is asserted rather than merely reported
 *   because a measured side-effect that lives only in a report is how
 *   this branch's three population-claiming rules got as far as they
 *   did.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { mapFields } from '../fields.ts';
import type { Rule, TransformResult } from '../types.ts';

/** A space captured just inside an italic run's leading edge,
 * together with any space already sitting outside it. Both are
 * rewritten to a single space outside the run, so the substitution
 * DELETES the captured space when an outer one was consumed and MOVES
 * it when there was none. */
const LEADING_EDGE = / ?<i> /gu;

/** The mirror at the closing edge. */
const TRAILING_EDGE = / <\/i> ?/gu;

/** Whitespace at the very end of a field. */
const TRAILING_WHITESPACE = /\s$/u;

const emphasisRunEdgeSpace: Rule = {
	apply(entry: SourceEntry): TransformResult {
		const healed = mapFields(entry, (text) =>
			text.replaceAll(LEADING_EDGE, ' <i>').replaceAll(TRAILING_EDGE, '</i> '),
		);
		return healed === undefined
			? { entry, records: [] }
			: {
					entry: healed,
					records: [
						{
							detail:
								'italic run boundary normalised to a single space outside the run',
							rid: entry.rid,
							ruleId: 'emphasis-run-edge-space',
						},
					],
				};
	},
	id: 'emphasis-run-edge-space',
	phase: 'text-repairs',
};

/** The deepest-last sense in the tree — the one nothing follows. */
function lastPath(senses: readonly SourceSense[]): number[] {
	const at = senses.length - 1;
	if (at < 0) {
		return [];
	}
	const child = senses[at]?.senses ?? [];
	return child.length > 0 ? [at, ...lastPath(child)] : [at];
}

/** Whether this definition is the row's own: trailing whitespace on
 * text that is not ITSELF nothing but whitespace (the audit's 12). */
function strippable(text: string | undefined): text is string {
	return (
		text !== undefined && text.trim() !== '' && TRAILING_WHITESPACE.test(text)
	);
}

/** Rebuilds `senses` with the definition at `path` trimmed, copying
 * only the spine it walks.
 *
 * `path` comes from `lastPath`, which recurses into `sense.senses`,
 * so the target is the DEEPEST-last leaf rather than the last
 * top-level sense: the flat read reaches 8 entries where the
 * recursive one reaches the catalogued 10. `strippable` is what keeps
 * this from becoming the corpus-wide `trimEnd()` the row's audit
 * forbids in capital letters — 2,352 entries, gloss heads welded onto
 * their sense labels. Both figures, and the widen-to-any-sense 2,340
 * that reconciles with them, are pinned in `edge-trim-corpus.test.ts`;
 * see the module doc for why each is what it is.
 *
 * Returns `changed: false` for a missing sense or one the filter
 * declines, so the caller can hand back its own entry untouched. */
function trimAt(
	senses: readonly SourceSense[],
	path: readonly number[],
): { changed: boolean; senses: SourceSense[] } {
	const out = [...senses];
	const [at, ...rest] = path;
	const target = out[at as number];
	if (target === undefined) {
		return { changed: false, senses: out };
	}
	if (rest.length > 0) {
		const inner = trimAt(target.senses ?? [], rest);
		out[at as number] = { ...target, senses: inner.senses };
		return { changed: inner.changed, senses: out };
	}
	const text = target.definition;
	if (!strippable(text)) {
		return { changed: false, senses: out };
	}
	out[at as number] = { ...target, definition: text.trimEnd() };
	return { changed: true, senses: out };
}

const trailingWhitespaceDefinition: Rule = {
	apply(entry: SourceEntry): TransformResult {
		const path = lastPath(entry.content.senses);
		if (path.length === 0) {
			return { entry, records: [] };
		}
		const result = trimAt(entry.content.senses, path);
		if (!result.changed) {
			return { entry, records: [] };
		}
		return {
			entry: {
				...entry,
				content: { ...entry.content, senses: result.senses },
			},
			records: [
				{
					detail: 'trailing whitespace stripped from the entry-final sense',
					rid: entry.rid,
					ruleId: 'trailing-whitespace-definition',
				},
			],
		};
	},
	id: 'trailing-whitespace-definition',
	phase: 'text-repairs',
};

export { emphasisRunEdgeSpace, trailingWhitespaceDefinition };
