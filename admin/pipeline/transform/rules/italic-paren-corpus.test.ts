/**
 * `italicSwallowsCloseParen`, CORPUS TIER. Fixture tier in
 * `italic-paren.test.ts`, split for the reason `unlink.test.ts` is
 * split three ways.
 *
 * This row's harm is rendered TYPE, not rendered characters — the
 * `)` is set in italic while its own `(` is roman — so the text is
 * byte-identical before and after and a `stripTags` equality would
 * pass a no-op outright. Every assertion below is therefore a
 * DEFECT-COUNT DELTA measured on the MARKUP, a population figure, or
 * a before/after equality on a population the rule must NOT change,
 * and each of the last two kinds is paired with the delta a no-op
 * fails:
 *
 * - the italic runs holding a surplus `)` go 10 -> 2, and the 2 that
 *   remain are the convention members the row's audit excludes;
 * - the inverse polarity, the row's own falsifier, is 0 of 47,073
 *   before AND after;
 * - `emphasis-run-edge-space`'s population inside the touched entries
 *   is unchanged, which the literal reading of the task-6 brief would
 *   have broken by six;
 * - `paren-tag-no-space`'s population inside them is unchanged too —
 *   the one fail-open this rule keeps. A split whose tail carries no
 *   leading space emits `<i>head</i>)<i>rest</i>`, which IS that
 *   row's seam, and `parenTagSpace` runs EARLIER in the registry, so
 *   such a member would ship unrepaired. All 6 splits carry the space
 *   today; nothing but this assertion says they will tomorrow.
 */
import { describe, expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry } from '../../body/types.ts';
import { fieldsOf, stripTags } from '../no-new-text.ts';
import { italicSwallowsCloseParen } from './italic-paren.ts';

/** An italic run and its whole body, inner markup included — the same
 * walk the rule uses, restated here so a change to the rule's own
 * constant cannot silently move the measurement with it. */
const RUN = /<i>(?:(?!<\/?i>)[\s\S])*<\/i>/gu;
const OPEN_PAREN = /\(/gu;
const CLOSE_PAREN = /\)/gu;

/** `emphasis-run-edge-space`'s locus (304 entries): a space captured
 * just inside an italic run's boundary. Pinned before and after
 * because the brief's literal repair would have created six. */
const EDGE = /<i> | <\/i>/gu;

/** `paren-tag-no-space`'s locus (115 occurrences), restated from
 * `seam-space.ts`'s `PAREN_SEAM` for the reason `RUN` is restated
 * above: a close paren, optionally through an anchor's close tag,
 * directly before `<i>`. This rule's split can emit exactly that
 * shape — see the fail-open in the docstring above. */
const PAREN_TAG_SEAM = /\)(?:<\/a>)?<i>(?![.,;:?!])/gu;

/** The split this rule emits when it reopens the tail, WITH the space
 * the tail carried. Counted in the output so the seam assertion below
 * cannot be satisfied by a rule that simply stopped splitting. */
const SPACED_SPLIT = /<\/i>\) <i>/gu;

interface Balance {
	balanced: number;
	runs: number;
	surplusClose: number;
	surplusOpen: number;
}

function tally(entry: SourceEntry, into: Balance): void {
	for (const field of fieldsOf(entry)) {
		for (const run of field.matchAll(RUN)) {
			// `stripTags`, not a regex pass. A single `<[^>]*>` sweep can
			// leave a tag the sweep itself assembled from the remainder,
			// which is what CodeQL's incomplete-multi-character-sanitization
			// alert names. The tokenizer cannot: it classifies each token
			// once. Nothing here is a sanitizer — this is a measurement —
			// but the repo already exports the correct tool (Task 0) and
			// the counts below prove the two agree.
			const body = stripTags(run[0]);
			const open = (body.match(OPEN_PAREN) ?? []).length;
			const close = (body.match(CLOSE_PAREN) ?? []).length;
			into.runs += 1;
			if (open === close) {
				into.balanced += 1;
			} else if (close > open) {
				into.surplusClose += 1;
			} else {
				into.surplusOpen += 1;
			}
		}
	}
}

function edges(entry: SourceEntry): number {
	let count = 0;
	for (const field of fieldsOf(entry)) {
		count += (field.match(EDGE) ?? []).length;
	}
	return count;
}

function parenSeams(entry: SourceEntry): number {
	let count = 0;
	for (const field of fieldsOf(entry)) {
		count += (field.match(PAREN_TAG_SEAM) ?? []).length;
	}
	return count;
}

function spacedSplits(entry: SourceEntry): number {
	let count = 0;
	for (const field of fieldsOf(entry)) {
		count += (field.match(SPACED_SPLIT) ?? []).length;
	}
	return count;
}

/** Every field's rendered text, joined on the same separator
 * `no-new-text.ts` uses for the same reason: NUL cannot occur in the
 * corpus's text, so a difference can never be an artefact of two
 * fields being compared as though they were adjacent. Written as an
 * ESCAPE, never as the literal byte - a raw NUL makes git classify
 * the file as binary, so it stops diffing and stops matching grep. */
const FIELD_SEP = '\u0000';

function renderedText(entry: SourceEntry): string {
	return fieldsOf(entry).map(stripTags).join(FIELD_SEP);
}

interface Measurement {
	after: Balance;
	before: Balance;
	edgeAfter: number;
	edgeBefore: number;
	seamAfter: number;
	seamBefore: number;
	splits: number;
	survivors: string[];
	textChanged: number;
	touched: string[];
}

function empty(): Balance {
	return { balanced: 0, runs: 0, surplusClose: 0, surplusOpen: 0 };
}

async function walk(): Promise<Measurement> {
	const m: Measurement = {
		after: empty(),
		before: empty(),
		edgeAfter: 0,
		edgeBefore: 0,
		seamAfter: 0,
		seamBefore: 0,
		splits: 0,
		survivors: [],
		textChanged: 0,
		touched: [],
	};
	for await (const entry of readSourceEntries()) {
		const out = italicSwallowsCloseParen.apply(entry);
		tally(entry, m.before);
		const after = empty();
		tally(out.entry, after);
		m.after.balanced += after.balanced;
		m.after.runs += after.runs;
		m.after.surplusClose += after.surplusClose;
		m.after.surplusOpen += after.surplusOpen;
		if (after.surplusClose > 0) {
			m.survivors.push(entry.rid);
		}
		if (out.records.length === 0) {
			continue;
		}
		m.touched.push(entry.rid);
		m.edgeBefore += edges(entry);
		m.edgeAfter += edges(out.entry);
		m.seamBefore += parenSeams(entry);
		m.seamAfter += parenSeams(out.entry);
		m.splits += spacedSplits(out.entry);
		if (renderedText(entry) !== renderedText(out.entry)) {
			m.textChanged += 1;
		}
	}
	return m;
}

let measured: Promise<Measurement> | null = null;

/** ONE pass over the corpus, shared by all six assertions below.
 * Behind a lazily-awaited cached promise on
 * `seam-space-corpus.test.ts`'s shape rather than at module scope:
 * module evaluation is covered by no test timeout, so a slow corpus
 * there fails the suite with nothing naming the cause. Every caller
 * gets the same frozen-by-convention `Measurement`; nothing below
 * mutates it. */
function measure(): Promise<Measurement> {
	measured ??= walk();
	return measured;
}

describe('corpus tier: italicSwallowsCloseParen is a defect-count delta', () => {
	it('reproduces the catalogued 10 and takes the shipped 8 to zero', async () => {
		const m = await measure();
		// The catalogued row, as an OCCURRENCE count that here equals
		// the entry count: 10 italic runs hold a paren whose opener sits
		// outside them.
		expect(m.before.surplusClose).toBe(10);
		// The defect population after the rule: only the 2 the row's own
		// audit calls CONVENTION.
		expect(m.after.surplusClose).toBe(2);
		// Vacuity guard. A rule that stopped firing would leave 10 above
		// and 0 here, so the two cannot both be satisfied by a no-op.
		expect(m.touched).toHaveLength(8);
	}, 180_000);

	it('leaves exactly the two lettered sub-sense markers standing', async () => {
		const m = await measure();
		// Q01198 "<i>a) for appearance sake, formally</i>" and S02102
		// "<i>any projection, point; a) beam, ray.</i>" — the second is
		// mid-run, which is why the marker guard is not anchored to a
		// run's head.
		expect(m.survivors).toEqual(['Q01198', 'S02102']);
	}, 180_000);
});

describe('corpus tier: the row’s own falsifier', () => {
	// "If Jastrow's print set the paren inside the italic type, the
	// reverse polarity would also appear." It does not, before or
	// after: a 10-against-0 one-directional tail is what a
	// boundary-drift defect predicts and what a print convention
	// cannot produce. The run total also pins the denominator the
	// 0.02% is a fraction OF.
	it('finds no italic run anywhere with a surplus open paren', async () => {
		const m = await measure();
		expect(m.before.runs).toBe(47_073);
		expect(m.before.balanced).toBe(47_063);
		expect(m.before.surplusOpen).toBe(0);
		expect(m.after.surplusOpen).toBe(0);
	}, 180_000);
});

describe('corpus tier: the three populations this rule must NOT change', () => {
	// The text gate strips tags, so this rule's text multiset is
	// identical by construction and needs no `copied` declaration. The
	// assertion is here rather than in prose because the alternative
	// construction — keeping the tail's space inside the reopened run
	// and adding a second one outside, which is the task-6 brief's
	// literal reading — WOULD change it, in all 8.
	it('changes the rendered text of none of its 8 entries', async () => {
		const m = await measure();
		expect(m.textChanged).toBe(0);
		expect(m.touched).toHaveLength(8);
	}, 180_000);

	// The standing check, measured. `emphasis-run-edge-space` (304)
	// owns the space captured just inside a run's boundary; the
	// brief's literal repair would have handed it six new members,
	// one per split. This construction hands it none.
	it('creates no new emphasis-run-edge-space member', async () => {
		const m = await measure();
		expect(m.edgeBefore).toBe(1);
		expect(m.edgeAfter).toBe(1);
	}, 180_000);

	// The rule's one remaining fail-open, pinned rather than argued.
	// `moveParenOut` reopens the tail as `<i>head</i>)${space}<i>rest`,
	// and `space` is whatever the tail carried — empty for a tail that
	// starts on a letter, which would emit `)<i>` and hand
	// `paren-tag-no-space` a member. That rule runs EARLIER in the
	// registry (`registry.ts` order), so it would ship unrepaired.
	// Zero of the 8 do it today; this fails the day one does.
	it('creates no new paren-tag-no-space seam', async () => {
		const m = await measure();
		// Neither before nor after: the 8 touched entries hold no `)<i>`
		// of their own, and the rule adds none.
		expect(m.seamBefore).toBe(0);
		expect(m.seamAfter).toBe(0);
		// The pairing that stops 0 === 0 from passing vacuously: the
		// rule really did reopen 6 tails, and every one of them carried
		// the space that keeps the seam out of the other row.
		expect(m.splits).toBe(6);
	}, 180_000);
});
