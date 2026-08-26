/**
 * The entangled label pair, fixture tier and corpus tier.
 *
 * The fixture tier states the two polarities and, in its own describe
 * block, the GRANULARITY decision — the one design question the brief
 * left open. Every string in that block is a real corpus body, taken
 * from the measurement in `task-2-report.md`, because what it pins is
 * a claim about the data and a hand-written example could not witness
 * it.
 *
 * The corpus tier is spec §6 measure (1), and it is the ONLY gate that
 * can see a Class A rule at all: `checkNoNewText` compares codepoint
 * MULTISETS, so a period moved from one side of a tag to the other is
 * invisible to it by construction, and `checkMarkup` is a delta gate
 * that lets pre-existing damage through. `stripTags` equality is
 * stronger than the sub-multiset test in the way that matters here —
 * it is ORDER-SENSITIVE, so a period landing on the wrong side of the
 * wrong tag fails it even though every codepoint count still balances.
 *
 * The `stripTags` equality runs unconditionally rather than under
 * `it.skipIf(stale)`, unlike `abbrev-vocab.test.ts`'s re-derivation:
 * what it asserts is a property of the rules, not a count of today's
 * corpus, so a source re-fetch changes how many entries it inspects
 * and never whether it should hold.
 *
 * The two POPULATION figures pinned alongside it — 1,567 and 979
 * entries, this batch's two largest catalogue corrections — ARE
 * counts of today's corpus, and are pinned here for the reason
 * `seam-space-corpus.test.ts` pins its five: they are the numbers
 * written back to `patterns.jsonl`, and nothing else in the tree
 * re-measures them, so an uncorrected drift would otherwise be a
 * discovery rather than a test failure. After a source re-fetch a
 * failure there is a stale baseline, not a defect — re-measure and
 * write the row and the test back together.
 */
import { describe, expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry } from '../../body/types.ts';
import { fieldsOf, stripTags } from '../no-new-text.ts';
import type { Rule } from '../types.ts';
import {
	italicGlossPeriodOutside,
	labelPeriodInside,
} from './italic-period.ts';

const PAIR: readonly Rule[] = [labelPeriodInside, italicGlossPeriodOutside];

function entryWith(definition: string): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword: 'x',
		rid: 'A00001',
	} as SourceEntry;
}

function defOf(entry: SourceEntry): string {
	return entry.content.senses[0]?.definition ?? '';
}

/** One rule's output definition, for the single-sense fixtures. */
function ran(rule: Rule, definition: string): string {
	return defOf(rule.apply(entryWith(definition)).entry);
}

describe('labelPeriodInside', () => {
	it('moves the period inside for a label', () => {
		const out = labelPeriodInside.apply(entryWith('see <i>Af</i>. and'));
		expect(defOf(out.entry)).toBe('see <i>Af.</i> and');
		expect(out.records).toHaveLength(1);
	});

	// The 2026-08-21 ruling's ACCEPTED COST, asserted rather than left
	// for a later reader to mistake for a bug. `Part. pass.` is a
	// genuine 10-letter unanimous period-OUTSIDE convention in the
	// corpus, and house style overrides it: 266 occurrences are
	// normalised against their own attested usage. Safe only because
	// both forms strip to byte-identical text — which the corpus tier
	// below is what actually checks.
	it('moves Part. pass. too — the accepted cost of the 2026-08-21 ruling', () => {
		expect(ran(labelPeriodInside, '<i>Part. pass</i>. of')).toBe(
			'<i>Part. pass.</i> of',
		);
	});

	it('leaves an ordinary gloss alone', () => {
		const entry = entryWith('the <i>destruction</i>. of');
		expect(labelPeriodInside.apply(entry).entry).toBe(entry);
	});

	it('returns the caller’s own object when it changes nothing', () => {
		const entry = entryWith('nothing to do here');
		const out = labelPeriodInside.apply(entry);
		expect(out.entry).toBe(entry);
		expect(out.records).toEqual([]);
	});

	it('declares no allowance — it moves a byte, it does not add one', () => {
		expect(labelPeriodInside.allows).toBeUndefined();
	});
});

describe('italicGlossPeriodOutside', () => {
	it('moves the period outside for a gloss', () => {
		expect(ran(italicGlossPeriodOutside, 'the <i>destruction.</i> of')).toBe(
			'the <i>destruction</i>. of',
		);
	});

	it('leaves a label alone — that is the other rule’s row', () => {
		const entry = entryWith('see <i>Af.</i> and');
		expect(italicGlossPeriodOutside.apply(entry).entry).toBe(entry);
	});

	it('leaves a single-word run that is an abbreviation alone', () => {
		const entry = entryWith('cf. <i>Pl.</i> there');
		expect(italicGlossPeriodOutside.apply(entry).entry).toBe(entry);
	});

	it('declares no allowance — it moves a byte, it does not add one', () => {
		expect(italicGlossPeriodOutside.allows).toBeUndefined();
	});
});

/**
 * THE GRANULARITY DECISION (task 2, measured 2026-08-25).
 *
 * `ABBREVIATIONS` mixes granularities: mid-run evidence names a TOKEN
 * (`Hif`, `pass`, `hard`), run-final evidence names a whole BODY
 * (`Part. pass`, `—Pl`). Both rules therefore had a choice — test the
 * whole run body, its final token, or both — and they test the WHOLE
 * BODY.
 *
 * The measurement, over the pinned snapshot: widening either rule to
 * `isLabel(finalToken)` adds 87 occurrences to the period-outside
 * population of which 25 (28.7%) are ordinary glosses, and removes 32
 * from the period-inside population of which 13 (40.6%) are ordinary
 * glosses. In BOTH directions the mistakes manufacture the sibling
 * row's defect. The whole-body test has no disagreement to trade
 * against that: every body-granular match is also token-consistent.
 *
 * The reason behind the numbers is that a token-granular member's
 * evidence is a claim about a token sitting INSIDE a run, which says
 * nothing about a body that happens to END with it — `hard` earned
 * its membership from a mid-run continuation, not from `<i>to become
 * hard</i>.`.
 *
 * The cost is stated too, and it is the third fixture here: a genuine
 * label the vocabulary only holds token-granularly (`Part. Hof`,
 * `—Part. pass`) is left alone. 62 such occurrences corpus-wide.
 */
describe('granularity: the whole run body, not its final token', () => {
	it('leaves a gloss whose final token is an abbreviation elsewhere', () => {
		const entry = entryWith('<i>to become hard</i>.');
		expect(labelPeriodInside.apply(entry).entry).toBe(entry);
	});

	it('still moves that gloss’s period out when it sits inside', () => {
		expect(ran(italicGlossPeriodOutside, '<i>the smooth part.</i>')).toBe(
			'<i>the smooth part</i>.',
		);
	});

	it('declines a label the vocabulary holds only token-granularly', () => {
		const entry = entryWith('<i>Part. Hof</i>. of');
		expect(labelPeriodInside.apply(entry).entry).toBe(entry);
	});
});

/**
 * The short members (`k`, `n`, `r`, `M`, `y`, …) get no guard, because
 * measured as whole run bodies they are Jastrow's headword-initial
 * abbreviation in running text — 80 period-outside occurrences
 * against 43 already period-inside, and not a gloss among them.
 *
 * Both fixtures are `T00309`'s own sentence, which writes the SAME
 * abbreviation both ways five words apart. A guard would have to call
 * one of these two spellings correct, and the row exists precisely
 * because the corpus cannot say which.
 */
describe('short members are abbreviations, not a false-positive class', () => {
	it('moves the period inside for a one-letter abbreviation', () => {
		expect(
			ran(labelPeriodInside, 'even to a <i>r.</i> and a half-<i>r</i>.'),
		).toBe('even to a <i>r.</i> and a half-<i>r.</i>');
	});

	it('leaves the same abbreviation alone when it is already inside', () => {
		const entry = entryWith('even to a <i>r.</i> and a half');
		expect(italicGlossPeriodOutside.apply(entry).entry).toBe(entry);
	});
});

/**
 * `italic-lone-punctuation`'s population, declined.
 *
 * The fixture is `B00957`'s real text, not a synthetic one, because
 * what makes this case wrong is not the empty tag on its own — it is
 * that the period being moved is `esp.`'s ABBREVIATION DOT, and only
 * the surrounding run shows that. Rewriting it to `<i></i>.` clears
 * every gate this repo has: multiset-blind text gate, balanced-tag
 * markup gate, and even the corpus-tier invariant below, whose
 * stripped text would be unchanged.
 */
describe('an empty run body belongs to italic-lone-punctuation', () => {
	it('declines `<i>.</i>` rather than leaving `<i></i>.` behind', () => {
		const entry = entryWith(
			'<i>favor, grant, </i>esp<i>.</i> <i> the rights</i>',
		);
		expect(italicGlossPeriodOutside.apply(entry).entry).toBe(entry);
	});

	it('declines a whitespace-only body on the label side too', () => {
		const entry = entryWith('foo <i> </i>. bar');
		expect(labelPeriodInside.apply(entry).entry).toBe(entry);
	});
});

describe('the pair', () => {
	it('is a fixed point of itself — neither rule re-fires on its own output', () => {
		for (const [rule, definition] of [
			[labelPeriodInside, 'see <i>Af</i>. and'],
			[italicGlossPeriodOutside, 'the <i>destruction.</i> of'],
		] as const) {
			const once = rule.apply(entryWith(definition));
			expect(rule.apply(once.entry).records).toEqual([]);
		}
	});

	it('each rule is a fixed point of the other’s output', () => {
		const labelled = labelPeriodInside.apply(entryWith('see <i>Af</i>. and'));
		expect(italicGlossPeriodOutside.apply(labelled.entry).records).toEqual([]);
		const glossed = italicGlossPeriodOutside.apply(
			entryWith('the <i>destruction.</i> of'),
		);
		expect(labelPeriodInside.apply(glossed.entry).records).toEqual([]);
	});

	it('treats a frozen entry as immutable', () => {
		const entry = entryWith('see <i>Af</i>. and');
		Object.freeze(entry.content.senses[0]);
		Object.freeze(entry.content.senses);
		Object.freeze(entry.content);
		Object.freeze(entry);
		expect(ran(labelPeriodInside, 'see <i>Af</i>. and')).toBe(
			'see <i>Af.</i> and',
		);
		expect(defOf(labelPeriodInside.apply(entry).entry)).toBe(
			'see <i>Af.</i> and',
		);
		expect(defOf(entry)).toBe('see <i>Af</i>. and');
	});
});

/** ORDER-SENSITIVE field-by-field text equality — the whole point of
 * using `stripTags` here rather than the gate's codepoint multiset. */
function sameText(before: SourceEntry, after: SourceEntry): boolean {
	const was = fieldsOf(before).map(stripTags);
	const now = fieldsOf(after).map(stripTags);
	return was.length === now.length && was.every((text, at) => text === now[at]);
}

/** Whether `rule` touched this entry, pushing a problem when it
 * touched it AND changed its text. */
function auditEntry(
	rule: Rule,
	entry: SourceEntry,
	problems: string[],
): boolean {
	const out = rule.apply(entry);
	if (out.records.length === 0) {
		return false;
	}
	if (!sameText(entry, out.entry)) {
		problems.push(`${rule.id} changed text in ${entry.rid}`);
	}
	return true;
}

describe('corpus tier: the Class A invariant', () => {
	it('changes no field’s text on any entry either rule touches', async () => {
		const touched = new Map(PAIR.map((rule) => [rule.id, 0]));
		const problems: string[] = [];
		for await (const entry of readSourceEntries()) {
			for (const rule of PAIR) {
				const hit = auditEntry(rule, entry, problems) ? 1 : 0;
				touched.set(rule.id, (touched.get(rule.id) ?? 0) + hit);
			}
		}
		expect(problems).toEqual([]);
		// The invariant must not pass vacuously — a predicate narrowed
		// to nothing satisfies it on an empty population — and the
		// guard is stated as the EXACT written-back population of each
		// rule rather than as `> 0`, in the unit `patterns.jsonl`
		// writes: ENTRIES. These are the batch's two largest
		// corrections (1,098 -> 1,567 and 945 -> 979) and this is the
		// only place either is re-measured.
		expect(Object.fromEntries(touched)).toEqual({
			'italic-swallowed-terminal-period': 1567,
			'label-period-outside-italic': 979,
		});
	});
});
