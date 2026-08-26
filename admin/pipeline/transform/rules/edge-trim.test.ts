/**
 * The two Class C deletion rows, FIXTURE TIER. The corpus tier lives
 * in `edge-trim-corpus.test.ts` — split for the same reason
 * `unlink.test.ts` is split across three files, to keep each under the
 * repo's 300-line ceiling.
 *
 * Both rows are DELETIONS, so neither gets a `stripTags`-equality
 * invariant: the text gate passes any sub-multiset shrink by
 * construction and an equality invariant passes a no-op, which is the
 * failure `punct-seams.test.ts` documents at length. Every corpus-tier
 * assertion in the sibling file is therefore a DEFECT-COUNT DELTA or a
 * POPULATION FIGURE, never "nothing changed".
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import {
	emphasisRunEdgeSpace,
	trailingWhitespaceDefinition,
} from './edge-trim.ts';
import { italicGlossPeriodOutside } from './italic-period.ts';
import { parenTagSpace } from './seam-space.ts';

/** A minimal entry whose top-level senses carry just the given
 * definitions. Variadic because `trailingWhitespaceDefinition`'s
 * position filter only means something with more than one sense to
 * choose between. */
function entryWith(...definitions: string[]): SourceEntry {
	return {
		content: { senses: definitions.map((definition) => ({ definition })) },
		headword: 'x',
		rid: 'A00001',
	} as SourceEntry;
}

/** Every top-level sense's definition, in order — for the cases that
 * assert WHICH sense was trimmed. */
const defsOf = (e: SourceEntry): string[] =>
	e.content.senses.map((s) => s.definition ?? '');

/** The first definition, for the single-sense cases. */
const defOf = (e: SourceEntry): string => defsOf(e)[0] ?? '';

describe('emphasisRunEdgeSpace deletes the space when it is redundant', () => {
	// 92 of the 238 leading-edge occurrences: a space already sits
	// outside the tag, so the captured one renders as a doubled space —
	// the harm the row's own `description` names.
	it('drops the captured space at a leading edge that already has one outside', () => {
		expect(
			defOf(emphasisRunEdgeSpace.apply(entryWith('a <i> b</i>')).entry),
		).toBe('a <i>b</i>');
	});

	// 84 of the 150 trailing-edge occurrences. A00740's real shape.
	it('drops the captured space at a trailing edge that already has one outside', () => {
		expect(
			defOf(
				emphasisRunEdgeSpace.apply(
					entryWith('<i>confiscation, dispossession. </i> Pl. <span>x</span>'),
				).entry,
			),
		).toBe('<i>confiscation, dispossession.</i> Pl. <span>x</span>');
	});
});

describe('emphasisRunEdgeSpace moves the space when deleting it would weld two words', () => {
	// The other 212 occurrences render a SINGLE space that is the only
	// thing separating two words. Deleting it would weld them; moving
	// it out normalises the boundary to the shape the corpus writes
	// 30,452 times at an opening run and 11,808 at a closing one.
	it('pushes a leading space out of the run', () => {
		expect(
			defOf(emphasisRunEdgeSpace.apply(entryWith('a<i> b</i>')).entry),
		).toBe('a <i>b</i>');
	});

	it('pushes a trailing space out of the run', () => {
		expect(
			defOf(emphasisRunEdgeSpace.apply(entryWith('<i>b </i>c')).entry),
		).toBe('<i>b</i> c');
	});

	// 20 of the 238 leading-edge occurrences open their field. The
	// rendered text already began with that space; the move only makes
	// the raw bytes agree with it.
	it('pushes a field-opening leading space out of the run', () => {
		expect(
			defOf(emphasisRunEdgeSpace.apply(entryWith('<i> b</i>c')).entry),
		).toBe(' <i>b</i>c');
	});
});

/**
 * THE STANDING CHECK. Three catalogued rows can be spelled with the
 * same characters as this one; the module doc says which locus this
 * rule owns and which it declines, and these pin the declines in the
 * repo's identity-return form.
 */
// Parameterized on `typescript:S5976` (SonarCloud, PR #49). Table rows,
// not a merged assertion: `it.each` registers one test PER ROW, so each
// still runs on its own, reports under its own name, and fails on its
// own the moment the pattern it pins is widened to reach it.
describe('emphasisRunEdgeSpace declines the three neighbouring rows', () => {
	const declines = [
		{
			// doubled-space-as-text-loss-locator (108, route: judgment,
			// BLOCKING): a literal doubled space with NO tag between. Its
			// own audit hands this rule the 92 + 84 markup-seam cases and
			// says "DO NOT WIDEN THIS ROW" of the literal ones.
			name: 'a literal doubled space with no tag between it',
			text: '(b. h.;  [something arched',
		},
		{
			// em-dash-section-break-in-own-italic (punct-seams.ts): its
			// seam is `.</i> <i>—</i> `, whose spaces sit OUTSIDE both
			// tags. Neither pattern here can reach one.
			name: 'the em-dash section-break seam',
			text: '<i>noble.</i> <i>—</i> Pl.',
		},
		{
			// italic-lone-punctuation (punct-seams.ts): `<i>.</i>` carries
			// no space at either edge.
			name: 'a lone-punctuation italic run',
			text: 'a<i>.</i>b',
		},
	];

	it.each(declines)('never touches $name', ({ text }) => {
		const entry = entryWith(text);
		expect(emphasisRunEdgeSpace.apply(entry).entry).toBe(entry);
	});
});

/**
 * The two ORDERING facts Task 7 needs, measured rather than asserted.
 * `seam-space.ts`'s rules INSERT the space this rule normalises, at
 * shapes this rule also matches, so the obvious worry is that the two
 * orders disagree. They do not — the seam rule inserts a space this
 * rule then absorbs, or this rule moves one the seam rule then
 * declines. `italic-swallowed-terminal-period` is the one that is NOT
 * free: the captured space HIDES a terminal period from it.
 */
describe('emphasisRunEdgeSpace against the rules that share its seams', () => {
	it('converges with parenTagSpace in either order', () => {
		const entry = entryWith('(a)<i> gloss</i>');
		const seamFirst = emphasisRunEdgeSpace.apply(
			parenTagSpace.apply(entry).entry,
		).entry;
		const edgeFirst = parenTagSpace.apply(
			emphasisRunEdgeSpace.apply(entry).entry,
		).entry;
		expect(defOf(edgeFirst)).toBe(defOf(seamFirst));
		expect(defOf(edgeFirst)).toBe('(a) <i>gloss</i>');
	});

	// A01190's real text. The captured space stands between the gloss's
	// terminal period and its `</i>`, so `italic-swallowed-terminal-period`
	// — which needs the period IMMEDIATELY before the tag — cannot see
	// it. This rule uncovers it, which is why the ordering matters.
	it('uncovers a terminal period italicGlossPeriodOutside could not see', () => {
		const entry = entryWith('<i>messenger. </i> Pl. <span>x</span>');
		expect(italicGlossPeriodOutside.apply(entry).entry).toBe(entry);
		const edged = emphasisRunEdgeSpace.apply(entry).entry;
		expect(italicGlossPeriodOutside.apply(edged).records).not.toEqual([]);
	});
});

describe('emphasisRunEdgeSpace contract', () => {
	it('returns the caller’s own object when it changes nothing', () => {
		const entry = entryWith('nothing to do here');
		const out = emphasisRunEdgeSpace.apply(entry);
		expect(out.entry).toBe(entry);
		expect(out.records).toEqual([]);
	});

	it('declares no allowance — it never adds a codepoint', () => {
		expect(emphasisRunEdgeSpace.allows).toBeUndefined();
	});
});

describe('trailingWhitespaceDefinition', () => {
	it('strips the last sense only', () => {
		const out = trailingWhitespaceDefinition.apply(entryWith('one ', 'two '));
		expect(defsOf(out.entry)).toEqual(['one ', 'two']);
	});

	it('THE AUDIT WARNING: this is not a corpus-wide trimEnd', () => {
		// trailing-whitespace-definition's audit: "DO NOT WRITE A
		// CORPUS-WIDE trimEnd() ON definition — it would weld gloss heads
		// onto their sense labels across the corpus." 2,430 of 2,450
		// occurrences are the field-split separator convention.
		const out = trailingWhitespaceDefinition.apply(
			entryWith('gloss head ', '1) sense'),
		);
		expect(defsOf(out.entry)[0]).toBe('gloss head ');
	});

	it('walks nested senses to find the true last one', () => {
		const entry = {
			content: {
				senses: [{ definition: 'outer ', senses: [{ definition: 'inner ' }] }],
			},
			headword: 'x',
			rid: 'A00001',
		} as SourceEntry;
		const out = trailingWhitespaceDefinition.apply(entry);
		expect(out.entry.content.senses[0]?.definition).toBe('outer ');
		expect(out.entry.content.senses[0]?.senses?.[0]?.definition).toBe('inner');
	});
});

describe('trailingWhitespaceDefinition declines what the audit excluded', () => {
	// The audit's own arithmetic subtracts these before it counts:
	// "2,352 entries with a trailing-whitespace definition, minus the 12
	// whose definition is whitespace and nothing else". 12 such
	// definitions exist corpus-wide; none currently sits at an
	// entry-final leaf, so this guard is fail-closed against
	// composition rather than a live population — see the module doc.
	it('declines a final definition that is whitespace and nothing else', () => {
		const entry = entryWith('gloss', '   ');
		expect(trailingWhitespaceDefinition.apply(entry).entry).toBe(entry);
	});

	it('returns the caller’s own object when the last sense is clean', () => {
		const entry = entryWith('one ', 'two');
		const out = trailingWhitespaceDefinition.apply(entry);
		expect(out.entry).toBe(entry);
		expect(out.records).toEqual([]);
	});

	it('returns the caller’s own object for an entry with no senses', () => {
		const entry = entryWith();
		expect(trailingWhitespaceDefinition.apply(entry).entry).toBe(entry);
	});

	// The deepest-last leaf may carry no `definition` at all. Falling
	// back to its parent would be a different rule with a different
	// population; the row's 10 is the leaf figure, so the leaf is what
	// this reads.
	it('declines when the deepest-last leaf carries no definition', () => {
		const entry = {
			content: {
				senses: [{ definition: 'outer ', senses: [{ number: '1' }] }],
			},
			headword: 'x',
			rid: 'A00001',
		} as SourceEntry;
		expect(trailingWhitespaceDefinition.apply(entry).entry).toBe(entry);
	});

	it('declares no allowance — it only deletes', () => {
		expect(trailingWhitespaceDefinition.allows).toBeUndefined();
	});
});
