/**
 * The two Class C deletion rows, CORPUS TIER. Fixture tier in
 * `edge-trim.test.ts`.
 *
 * Neither rule gets a `stripTags`-equality invariant — an equality
 * invariant passes a no-op, which is the failure `punct-seams.test.ts`
 * documents at length. Every assertion here is a DEFECT-COUNT DELTA, a
 * POPULATION FIGURE, or a before/after equality on a population the
 * rule must NOT change, and the last kind is always paired with a
 * delta that a no-op fails:
 *
 * - `emphasisRunEdgeSpace`: the rendered doubled-space population in
 *   its own touched entries goes 179 -> 3, and the 3 that remain are
 *   the OTHER row's.
 * - `trailingWhitespaceDefinition`: the entry count is 10, against 8
 *   for the flat walk the position filter must not be, and 2,352 for
 *   the definition-wide sweep its audit forbids in capital letters.
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

/** A run of two or more spaces, for the collapse below. */
const RUN = / {2,}/gu;

const LEADING_WS = /^\s/u;
const TRAILING_WS = /\s$/u;

function countIn(entry: SourceEntry, pattern: RegExp, strip: boolean): number {
	let count = 0;
	for (const field of fieldsOf(entry)) {
		const text = strip ? stripTags(field) : field;
		count += (text.match(pattern) ?? []).length;
	}
	return count;
}

function fieldsEndingInSpace(entry: SourceEntry): number {
	return fieldsOf(entry).filter((field) => TRAILING_WS.test(field)).length;
}

function fieldsStartingInSpace(entry: SourceEntry): number {
	return fieldsOf(entry).filter((field) => LEADING_WS.test(field)).length;
}

/** Every field's rendered text with runs of spaces collapsed to one.
 * Equality on THIS is the proof that no word boundary was destroyed:
 * a deletion that welded two words would change it, and the 176
 * doubled spaces this rule does delete would not. */
function collapsed(entry: SourceEntry): string[] {
	return fieldsOf(entry).map((field) => stripTags(field).replaceAll(RUN, ' '));
}

interface EdgeMeasurement {
	entries: number;
	leadAfter: number;
	leadBefore: number;
	literalAfter: number;
	literalBefore: number;
	occurrences: number;
	renderedAfter: number;
	renderedBefore: number;
	tailAfter: number;
	tailBefore: number;
	welded: number;
}

async function measureEdge(): Promise<EdgeMeasurement> {
	const m: EdgeMeasurement = {
		welded: 0,
		entries: 0,
		leadAfter: 0,
		leadBefore: 0,
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
		m.leadBefore += fieldsStartingInSpace(entry);
		m.leadAfter += fieldsStartingInSpace(out.entry);
		const was = collapsed(entry);
		m.welded += collapsed(out.entry).filter(
			(text, at) => text !== was[at],
		).length;
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
});

describe('corpus tier: the two field edges emphasisRunEdgeSpace touches', () => {
	// The overlap with this file's OTHER rule: pushing a space out of a
	// closing run could in principle land it at a field's end, which is
	// trailing-whitespace-definition's locus. Measured, it never does —
	// no ` </i>` in the corpus ends its field or is followed only by
	// tags.
	it('creates no new field-trailing whitespace for the other rule to find', async () => {
		const m = await measureEdge();
		expect(m.tailBefore).toBe(95);
		expect(m.tailAfter).toBe(95);
	});

	// The OTHER edge, and the one the rule does move. 20 of the 238
	// `<i>␣` occurrences open their field, so the move writes a raw
	// leading space onto 20 of them — all `definition`, none of them
	// `headword`, `plural_form` or `quotes`, and in no catalogued row's
	// locus (`binyan-form-leading-space` is `grammar.binyan_form`). It
	// is rendered-neutral, since those fields already began with that
	// space once tags were stripped — but a measured side-effect
	// recorded only in a report is how this branch's three
	// population-claiming rules got as far as they did, so it is
	// asserted here instead.
	it('moves exactly 20 spaces onto a field’s leading edge', async () => {
		const m = await measureEdge();
		expect(m.leadBefore).toBe(356);
		expect(m.leadAfter).toBe(376);
	});

	// The safety property the whole hybrid rests on, and the strongest
	// evidence in this file: with runs of spaces collapsed, the
	// rendered text of every field of every touched entry is IDENTICAL
	// before and after. The 176 deletions remove only redundancy, and
	// the 212 moves change nothing at all — so no word boundary
	// anywhere in the corpus is destroyed. A blanket deletion, the
	// alternative this rule declines, would weld 212 of them and fail
	// here.
	it('destroys no word boundary — collapsed rendered text is identical', async () => {
		const m = await measureEdge();
		expect(m.welded).toBe(0);
		// Vacuity guard: paired with the 179 -> 3 delta above, which a
		// no-op fails, so the two cannot both be satisfied by a rule
		// that does nothing.
		expect(m.entries).toBe(304);
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
