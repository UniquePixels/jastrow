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
 *   have broken by six.
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
const TAG = /<[^>]*>/gu;
const OPEN_PAREN = /\(/gu;
const CLOSE_PAREN = /\)/gu;

/** `emphasis-run-edge-space`'s locus (304 entries): a space captured
 * just inside an italic run's boundary. Pinned before and after
 * because the brief's literal repair would have created six. */
const EDGE = /<i> | <\/i>/gu;

interface Balance {
	balanced: number;
	runs: number;
	surplusClose: number;
	surplusOpen: number;
}

function tally(entry: SourceEntry, into: Balance): void {
	for (const field of fieldsOf(entry)) {
		for (const run of field.matchAll(RUN)) {
			const body = run[0].replace(TAG, '');
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
	survivors: string[];
	textChanged: number;
	touched: string[];
}

function empty(): Balance {
	return { balanced: 0, runs: 0, surplusClose: 0, surplusOpen: 0 };
}

async function measure(): Promise<Measurement> {
	const m: Measurement = {
		after: empty(),
		before: empty(),
		edgeAfter: 0,
		edgeBefore: 0,
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
		if (renderedText(entry) !== renderedText(out.entry)) {
			m.textChanged += 1;
		}
	}
	return m;
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
	});

	it('leaves exactly the two lettered sub-sense markers standing', async () => {
		const m = await measure();
		// Q01198 "<i>a) for appearance sake, formally</i>" and S02102
		// "<i>any projection, point; a) beam, ray.</i>" — the second is
		// mid-run, which is why the marker guard is not anchored to a
		// run's head.
		expect(m.survivors).toEqual(['Q01198', 'S02102']);
	});
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
	});
});

describe('corpus tier: the two populations this rule must NOT change', () => {
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
	});

	// The standing check, measured. `emphasis-run-edge-space` (304)
	// owns the space captured just inside a run's boundary; the
	// brief's literal repair would have handed it six new members,
	// one per split. This construction hands it none.
	it('creates no new emphasis-run-edge-space member', async () => {
		const m = await measure();
		expect(m.edgeBefore).toBe(1);
		expect(m.edgeAfter).toBe(1);
	});
});
