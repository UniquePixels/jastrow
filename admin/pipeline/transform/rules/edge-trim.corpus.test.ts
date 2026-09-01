/**
 * The two Class C deletion rows, CORPUS TIER. Fixture tier in
 * `edge-trim.test.ts`.
 *
 * Neither rule gets a `stripTags`-equality invariant — an equality
 * invariant passes a no-op, which is the failure `punct-seams.corpus.test.ts`
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
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { fieldsOf, stripTags } from '../no-new-text.ts';
import { sourceEntries } from './corpus-fixture.ts';
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

/** Occurrences of `pattern` across every field `fieldsOf` reads,
 * optionally through `stripTags`. The `strip` flag is the whole
 * reason this is one helper and not two: `RENDERED_DOUBLE` and
 * `LITERAL_DOUBLE` are the SAME pattern, and only the rendering
 * separates this row's population (a tag between the two spaces) from
 * `doubled-space-as-text-loss-locator`'s (both spaces raw, a row
 * routed to judgment whose evidence this rule must not destroy). */
function countIn(entry: SourceEntry, pattern: RegExp, strip: boolean): number {
	let count = 0;
	for (const field of fieldsOf(entry)) {
		const text = strip ? stripTags(field) : field;
		count += (text.match(pattern) ?? []).length;
	}
	return count;
}

/** Fields whose RAW text ends in whitespace — the sibling row
 * `trailingWhitespaceDefinition` owns this locus. Counted across
 * `emphasisRunEdgeSpace`'s touched entries to show that rule hands it
 * no new member: 95 → 95, because no `␣</i>` in the corpus ends its
 * field or is followed only by tags. */
function fieldsEndingInSpace(entry: SourceEntry): number {
	return fieldsOf(entry).filter((field) => TRAILING_WS.test(field)).length;
}

/** The opposite edge, and the side-effect `emphasisRunEdgeSpace`
 * demonstrably DOES have: 20 of its 238 leading-edge occurrences open
 * their field, so moving the space outside the run writes a raw
 * leading space onto 20 definitions — 356 → 376. Rendered-neutral,
 * in no catalogued row's locus, and asserted rather than merely
 * reported, because a measured side-effect that lives only in a
 * report is how this branch's population-claiming rules got as far as
 * they did. */
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

/** Trailing whitespace on a non-empty definition. Deliberately WITHOUT
 * the shipped rule's whitespace-only guard: this is the predicate that
 * reproduces the catalogue's pre-audit figure of 2,352 entries, and
 * adding the guard here would quietly redefine the number the two
 * counterfactuals below are measured against. */
const trailing = (text: string | undefined): boolean =>
	text !== undefined && text !== '' && /\s$/u.test(text);

/** Whether ANY sense in the tree, at any depth, carries a trailing
 * space — the definition-wide sweep the row's audit forbids. Its
 * corpus figure, 2,352 entries, is the ceiling the shipped 10 is
 * asserted against: 2,430 of those occurrences are the field-split
 * separator convention, the only thing standing between a gloss head
 * and the "1)" that follows it. */
function anySenseTrailing(senses: readonly SourceSense[]): boolean {
	return senses.some(
		(sense) =>
			trailing(sense.definition) || anySenseTrailing(sense.senses ?? []),
	);
}

/** The same question asked of the LAST TOP-LEVEL sense only — the
 * flat walk `trimAt` must not be. It finds 8 against the shipped
 * rule's 10, so pinning both is what turns "replace the recursive
 * `lastPath` with a flat one" into a test failure rather than a
 * silent two-entry loss. */
function flatLastTrailing(entry: SourceEntry): boolean {
	return trailing(entry.content.senses.at(-1)?.definition);
}

/** Every figure this file pins, gathered in ONE corpus walk. The
 * five `emphasisRunEdgeSpace` fields are measured on the entries that
 * rule touches; the `order*` and `shipped`/`flat`/`corpusWide` fields
 * are measured on EVERY entry, so they are accumulated above the
 * touched-only guard in the loop below. */
interface EdgeMeasurement {
	corpusWide: number;
	entries: number;
	flat: number;
	leadAfter: number;
	leadBefore: number;
	literalAfter: number;
	literalBefore: number;
	occurrences: number;
	orderAfter: number;
	orderBefore: number;
	renderedAfter: number;
	renderedBefore: number;
	shipped: number;
	tailAfter: number;
	tailBefore: number;
	welded: number;
}

/** The one corpus pass every figure in this file is read off.
 *
 * Both rules and the ordering probe run against the SAME entry, so no
 * two numbers here can drift apart across separate walks. Each rule
 * is applied ALONE — no registry, no siblings — so every count is
 * that rule's own rather than a composition artefact.
 *
 * `orderBefore`/`orderAfter` are the ordering constraint Task 7 needs
 * and the only one in this module that is NOT free: 29 trailing-edge
 * occurrences read `<i>gloss.␣</i>`, whose period is hidden from
 * `italicGlossPeriodOutside` by the captured space, and
 * `emphasisRunEdgeSpace` uncovers it. */
async function walkEdge(): Promise<EdgeMeasurement> {
	const m: EdgeMeasurement = {
		welded: 0,
		corpusWide: 0,
		entries: 0,
		flat: 0,
		leadAfter: 0,
		leadBefore: 0,
		literalAfter: 0,
		literalBefore: 0,
		occurrences: 0,
		orderAfter: 0,
		orderBefore: 0,
		renderedAfter: 0,
		renderedBefore: 0,
		shipped: 0,
		tailAfter: 0,
		tailBefore: 0,
	};
	for (const entry of await sourceEntries()) {
		const out = emphasisRunEdgeSpace.apply(entry);
		// Whole-corpus figures, accumulated BEFORE the touched-only
		// guard below. `out.entry` is the caller's own object when the
		// rule declines, so this is the same `edged` the standalone
		// walk used to build.
		m.orderBefore +=
			italicGlossPeriodOutside.apply(entry).records.length > 0 ? 1 : 0;
		m.orderAfter +=
			italicGlossPeriodOutside.apply(out.entry).records.length > 0 ? 1 : 0;
		if (trailingWhitespaceDefinition.apply(entry).records.length > 0) {
			m.shipped += 1;
		}
		if (flatLastTrailing(entry)) {
			m.flat += 1;
		}
		if (anySenseTrailing(entry.content.senses)) {
			m.corpusWide += 1;
		}
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

let measured: Promise<EdgeMeasurement> | null = null;

/** The walk above, behind a lazily-awaited cached promise so all
 * seven assertions in this file share ONE pass. Lazy rather than at
 * module scope on `seam-space.corpus.test.ts`'s shape: module
 * evaluation is covered by no test timeout, so a slow corpus there
 * fails the suite with nothing naming the cause. Callers read the
 * shared `EdgeMeasurement`; none mutates it. */
function measureEdge(): Promise<EdgeMeasurement> {
	measured ??= walkEdge();
	return measured;
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
	}, 180_000);

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
	}, 180_000);
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
	}, 180_000);

	// The OTHER edge, and the one the rule does move. 20 of the 238
	// `<i>␣` occurrences open their field, so the move writes a raw
	// leading space onto 20 of them — all `definition`, none of them
	// `headword`, `plural_form` or `quotes`, and in no catalogued row's
	// locus (`binyan-form-leading-space` was `grammar.binyan_form`, and
	// is `discarded` since batch 6a — `repairs.ts`'s `cleanBinyanForms`
	// already owns that field). It
	// is rendered-neutral, since those fields already began with that
	// space once tags were stripped — but a measured side-effect
	// recorded only in a report is how this branch's three
	// population-claiming rules got as far as they did, so it is
	// asserted here instead.
	it('moves exactly 20 spaces onto a field’s leading edge', async () => {
		const m = await measureEdge();
		expect(m.leadBefore).toBe(356);
		expect(m.leadAfter).toBe(376);
	}, 180_000);

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
	}, 180_000);
});

describe('corpus tier: the ordering fact Task 7 must act on', () => {
	// Running this rule first hands `italic-swallowed-terminal-period`
	// 11 entries it could not previously see, all of them ordinary
	// word-final gloss runs (A00740, A01190, A02252, A02901, C00200,
	// C00399, C00772, C00872, C00964, C01379, E00196) — that row's own
	// population, not a new one. Registered the other way round, those
	// 11 periods stay inside their runs with nothing left to move them.
	it('hands italicGlossPeriodOutside 11 entries it could not previously see', async () => {
		const m = await measureEdge();
		expect(m.orderBefore).toBe(1567);
		expect(m.orderAfter).toBe(1578);
	}, 180_000);
});

describe('corpus tier: trailingWhitespaceDefinition is the position filter', () => {
	it('reports 10 entries — not the flat walk’s 8, and not the audit’s forbidden 2,352', async () => {
		const m = await measureEdge();
		// The catalogued figure, and the proof that the walk is the
		// NESTED one: `content.senses` alone finds only 8 of the 10.
		expect(m.shipped).toBe(10);
		expect(m.flat).toBe(8);
		// What the audit forbids in capital letters: a corpus-wide
		// trimEnd() on `definition` would weld a gloss head onto its
		// sense label in this many entries.
		expect(m.corpusWide).toBe(2352);
	}, 180_000);
});
