/**
 * The two Class C deletion rows, fixture tier and corpus tier.
 *
 * Both rows are DELETIONS, so neither gets a `stripTags`-equality
 * invariant: the text gate passes any sub-multiset shrink by
 * construction and an equality invariant passes a no-op, which is the
 * failure `punct-seams.test.ts` documents at length. Each corpus-tier
 * test below therefore asserts a DEFECT-COUNT DELTA or a POPULATION
 * FIGURE, never "nothing changed".
 *
 * - `emphasisRunEdgeSpace`: the rendered doubled-space population in
 *   its own touched entries goes 179 -> 3, and the 3 that remain are
 *   the OTHER row's (see below).
 * - `trailingWhitespaceDefinition`: the entry count is 10, against 8
 *   for the flat walk the position filter must not be, and 2,352 for
 *   the corpus-wide `trimEnd()` its audit forbids in capital letters.
 */
import { describe, expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { fieldsOf, stripTags } from '../no-new-text.ts';
import {
	emphasisRunEdgeSpace,
	trailingWhitespaceDefinition,
} from './edge-trim.ts';
import { italicGlossPeriodOutside } from './italic-period.ts';
import { parenTagSpace } from './seam-space.ts';

function entryWith(...definitions: string[]): SourceEntry {
	return {
		content: { senses: definitions.map((definition) => ({ definition })) },
		headword: 'x',
		rid: 'A00001',
	} as SourceEntry;
}

const defsOf = (e: SourceEntry): string[] =>
	e.content.senses.map((s) => s.definition ?? '');

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
describe('emphasisRunEdgeSpace declines the three neighbouring rows', () => {
	// doubled-space-as-text-loss-locator (108, route: judgment,
	// BLOCKING): a literal doubled space with NO tag between. Its own
	// audit hands this rule the 92 + 84 markup-seam cases and says "DO
	// NOT WIDEN THIS ROW" of the literal ones.
	it('never touches a literal doubled space with no tag between it', () => {
		const entry = entryWith('(b. h.;  [something arched');
		expect(emphasisRunEdgeSpace.apply(entry).entry).toBe(entry);
	});

	// em-dash-section-break-in-own-italic (punct-seams.ts): its seam is
	// `.</i> <i>—</i> `, whose spaces sit OUTSIDE both tags. Neither
	// pattern here can reach one.
	it('never touches the em-dash section-break seam', () => {
		const entry = entryWith('<i>noble.</i> <i>—</i> Pl.');
		expect(emphasisRunEdgeSpace.apply(entry).entry).toBe(entry);
	});

	// italic-lone-punctuation (punct-seams.ts): `<i>.</i>` carries no
	// space at either edge.
	it('never touches a lone-punctuation italic run', () => {
		const entry = entryWith('a<i>.</i>b');
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

/** Rendered doubled space — the harm `emphasis-run-edge-space`'s
 * `description` names. Read through `stripTags`, since the two spaces
 * never sit next to each other in the raw markup (the tag is between
 * them). */
const RENDERED_DOUBLE = / {2}/gu;

/** A LITERAL doubled space, both spaces in the raw field with no tag
 * between: `doubled-space-as-text-loss-locator`'s population, not this
 * one's. Counted on the raw field precisely so the tag-hidden variant
 * cannot be mistaken for it. */
const LITERAL_DOUBLE = / {2}/gu;

const EDGE = /<i> | <\/i>/gu;

function countIn(entry: SourceEntry, pattern: RegExp, strip: boolean): number {
	let count = 0;
	for (const field of fieldsOf(entry)) {
		const text = strip ? stripTags(field) : field;
		count += (text.match(pattern) ?? []).length;
	}
	return count;
}

function fieldsEndingInSpace(entry: SourceEntry): number {
	return fieldsOf(entry).filter((field) => /\s$/u.test(field)).length;
}

interface EdgeMeasurement {
	entries: number;
	literalAfter: number;
	literalBefore: number;
	occurrences: number;
	renderedAfter: number;
	renderedBefore: number;
	tailAfter: number;
	tailBefore: number;
}

async function measureEdge(): Promise<EdgeMeasurement> {
	const m: EdgeMeasurement = {
		entries: 0,
		literalAfter: 0,
		literalBefore: 0,
		occurrences: 0,
		renderedAfter: 0,
		renderedBefore: 0,
		tailAfter: 0,
		tailBefore: 0,
	};
	for await (const entry of readSourceEntries()) {
		const out = emphasisRunEdgeSpace.apply(entry);
		if (out.records.length === 0) {
			continue;
		}
		m.entries += 1;
		m.occurrences += countIn(entry, EDGE, false);
		m.renderedBefore += countIn(entry, RENDERED_DOUBLE, true);
		m.renderedAfter += countIn(out.entry, RENDERED_DOUBLE, true);
		m.literalBefore += countIn(entry, LITERAL_DOUBLE, false);
		m.literalAfter += countIn(out.entry, LITERAL_DOUBLE, false);
		m.tailBefore += fieldsEndingInSpace(entry);
		m.tailAfter += fieldsEndingInSpace(out.entry);
	}
	return m;
}

describe('corpus tier: emphasisRunEdgeSpace is Class C — a defect-count delta', () => {
	it('reproduces the catalogued population and collapses 176 of 179 rendered doubled spaces', async () => {
		const m = await measureEdge();
		// The catalogued row, to the unit: 238 + 150 = 388 occurrences
		// across 304 entries.
		expect(m.occurrences).toBe(388);
		expect(m.entries).toBe(304);
		// The defect the row's `description` names. 176 = 92 leading +
		// 84 trailing, exactly the split
		// doubled-space-as-text-loss-locator's audit hands to this row.
		expect(m.renderedBefore).toBe(179);
		expect(m.renderedAfter).toBe(3);
	});

	// The decline, measured rather than asserted in prose: the 3 that
	// survive are literal doubled spaces with no tag between them
	// (C00779 "(Ar.␣␣a defective", K00980 "(b. h.;␣␣[something",
	// T00907 "(b.␣␣h.)"), which belong to the BLOCKING judgment row
	// doubled-space-as-text-loss-locator. This rule leaves that
	// population's count exactly where it found it.
	it('leaves the literal doubled-space population untouched', async () => {
		const m = await measureEdge();
		expect(m.literalBefore).toBe(3);
		expect(m.literalAfter).toBe(3);
	});

	// The overlap with this file's OTHER rule: pushing a space out of a
	// closing run could in principle land it at a field's end, which is
	// trailing-whitespace-definition's locus. Measured, it never does —
	// no ` </i>` in the corpus ends its field or is followed only by
	// tags.
	it('creates no new field-trailing whitespace for the other rule to find', async () => {
		const m = await measureEdge();
		expect(m.tailAfter).toBe(m.tailBefore);
	});
});

const trailing = (text: string | undefined): boolean =>
	text !== undefined && text !== '' && /\s$/u.test(text);

function anySenseTrailing(senses: readonly SourceSense[]): boolean {
	return senses.some(
		(sense) =>
			trailing(sense.definition) || anySenseTrailing(sense.senses ?? []),
	);
}

function flatLastTrailing(entry: SourceEntry): boolean {
	return trailing(entry.content.senses.at(-1)?.definition);
}

describe('corpus tier: the ordering fact Task 7 must act on', () => {
	// Running this rule first hands `italic-swallowed-terminal-period`
	// 11 entries it could not previously see, all of them ordinary
	// word-final gloss runs (A00740, A01190, A02252, A02901, C00200,
	// C00399, C00772, C00872, C00964, C01379, E00196) — that row's own
	// population, not a new one. Registered the other way round, those
	// 11 periods stay inside their runs with nothing left to move them.
	it('hands italicGlossPeriodOutside 11 entries it could not previously see', async () => {
		let before = 0;
		let after = 0;
		for await (const entry of readSourceEntries()) {
			before +=
				italicGlossPeriodOutside.apply(entry).records.length > 0 ? 1 : 0;
			const edged = emphasisRunEdgeSpace.apply(entry).entry;
			after += italicGlossPeriodOutside.apply(edged).records.length > 0 ? 1 : 0;
		}
		expect(before).toBe(1567);
		expect(after).toBe(1578);
	});
});

describe('corpus tier: trailingWhitespaceDefinition is the position filter', () => {
	it('reports 10 entries — not the flat walk’s 8, and not the audit’s forbidden 2,352', async () => {
		let shipped = 0;
		let flat = 0;
		let corpusWide = 0;
		for await (const entry of readSourceEntries()) {
			if (trailingWhitespaceDefinition.apply(entry).records.length > 0) {
				shipped += 1;
			}
			if (flatLastTrailing(entry)) {
				flat += 1;
			}
			if (anySenseTrailing(entry.content.senses)) {
				corpusWide += 1;
			}
		}
		// The catalogued figure, and the proof that the walk is the
		// NESTED one: `content.senses` alone finds only 8 of the 10.
		expect(shipped).toBe(10);
		expect(flat).toBe(8);
		// What the audit forbids in capital letters: a corpus-wide
		// trimEnd() on `definition` would weld a gloss head onto its
		// sense label in this many entries.
		expect(corpusWide).toBe(2352);
	});
});
