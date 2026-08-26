/**
 * `italicSwallowsCloseParen`, FIXTURE TIER. Corpus tier in
 * `italic-paren-corpus.test.ts`.
 *
 * Every decline below names the catalogued row the case belongs to,
 * and each was mutation-checked: removing the sub-sense-marker guard
 * fails 5 assertions across the two tiers, the anchor decline 1, the
 * empty-head guard 1, and the punctuation-only branch 2.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { checkNoNewText } from '../no-new-text.ts';
import { italicSwallowsCloseParen } from './italic-paren.ts';

function entryWith(definition: string): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword: 'x',
		rid: 'A00001',
	} as SourceEntry;
}

const defOf = (e: SourceEntry): string => e.content.senses[0]?.definition ?? '';

// Task 6, the one row of the four escalation rows that turned out
// repairable.
describe('italicSwallowsCloseParen moves the swallowed paren out', () => {
	it('splits the run, moving the tail’s OWN space out with the paren', () => {
		const out = italicSwallowsCloseParen.apply(
			entryWith('(see <i>def) ghi</i>'),
		);
		expect(defOf(out.entry)).toBe('(see <i>def</i>) <i>ghi</i>');
		// Deviates from the task-6 brief's `expect(out.copied).toEqual([' '])`.
		// The brief calls this Class B on the reading that the split
		// "inserts one space", but it does not: the space between `)`
		// and the reopened run is the tail's own leading space, moved
		// from inside the run to outside it. Stripped of tags the text
		// is byte-identical before and after, so a `copied: [' ']`
		// declaration would be a claim about bytes this rule never
		// writes — the false-record defect this branch keeps
		// correcting. See the rule's docstring.
		expect(out.copied).toBeUndefined();
	});

	it('reopens no run when only punctuation follows the paren', () => {
		// U01659's real shape. `<i>.—</i>` would be a new member of
		// `italic-lone-punctuation`, so the remainder goes outside.
		expect(
			defOf(italicSwallowsCloseParen.apply(entryWith('<i>saʿir).—</i>')).entry),
		).toBe('<i>saʿir</i>).—');
	});

	it('closes the run early when nothing at all follows the paren', () => {
		// V00909's real shape: no tail, so no space and no second run.
		expect(
			defOf(italicSwallowsCloseParen.apply(entryWith('<i>Ithpe)</i>')).entry),
		).toBe('<i>Ithpe</i>)');
	});

	it('carries inner markup with the head', () => {
		// U01849's real shape — the head ends in a closed anchor.
		expect(
			defOf(
				italicSwallowsCloseParen.apply(
					entryWith('(cmp. <i><a href="/x">שָׁתָה</a>) to give drink</i>'),
				).entry,
			),
		).toBe('(cmp. <i><a href="/x">שָׁתָה</a></i>) <i>to give drink</i>');
	});
});

// The standing check, pinned. Each decline names the catalogued row
// the case belongs to; delete the guard and the test fails.
//
// Parameterized on `typescript:S5976` (SonarCloud, PR #49). Table rows,
// not a merged assertion: `it.each` registers one test PER ROW, so each
// still runs on its own, reports under its own name, and fails on its
// own — the mutation counts in this file's header are unchanged, and
// were re-measured against this form: removing `SUBSENSE_MARKER` fails
// rows 1 and 2 here and 4 in the corpus tier, disabling the paren-depth
// count fails row 3, inverting the polarity fails row 4, dropping the
// anchor decline fails row 5, and dropping the empty-head guard fails
// row 6 — each by name, and each alone.
describe('italicSwallowsCloseParen declines every neighbouring row', () => {
	const declines = [
		{
			name: 'a lettered sub-sense marker at the run’s head — CONVENTION',
			text: '<i>a) first</i>',
		},
		{
			name: 'a lettered sub-sense marker mid-run — S02102’s real shape',
			text: '<i>any projection, point; a) beam, ray.</i>',
		},
		{
			name: 'a run whose parens balance — the paren is the run’s own',
			text: '<i>(a) foo</i>',
		},
		{
			name: 'the OPEN polarity — open-paren-in-anchor-display, open-paren-in-rtl-span',
			text: '<i>(foo</i>) and <i>(<span dir="rtl">א</span></i>)',
		},
		{
			name: 'a paren swallowed by an ANCHOR — anchor-swallows-close-paren',
			text: '(<i><a href="/x" data-ref="Tosefta 1">VI), 13</a></i>',
		},
		{
			// Fail-closed against composition rather than a live
			// population: no corpus run opens on its own swallowed paren,
			// but a rule running earlier could make one, and `<i></i>` is
			// not a repair.
			name: 'a run the repair would leave empty',
			text: '(x <i>) foo</i>',
		},
	];

	it.each(declines)('declines $name', ({ text }) => {
		const entry = entryWith(text);
		expect(italicSwallowsCloseParen.apply(entry).entry).toBe(entry);
	});

	it('sets no allows — the text multiset is unchanged by construction', () => {
		expect(italicSwallowsCloseParen.allows).toBeUndefined();
	});

	it('passes the text gate with NOTHING declared', () => {
		// The positive form of the `copied` argument in the rule's
		// docstring: the split is a markup move, so the gate is clean
		// with an empty `copied` list. A rule that really inserted a
		// space would report a problem here.
		const before = entryWith('(see <i>def) ghi</i>');
		const after = italicSwallowsCloseParen.apply(before);
		expect(
			checkNoNewText(before, after.entry, italicSwallowsCloseParen, []),
		).toEqual([]);
	});
});
