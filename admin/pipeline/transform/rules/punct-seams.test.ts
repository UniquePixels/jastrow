/**
 * The em-dash / lone-punctuation pair, fixture tier and corpus tier.
 *
 * The fixture tier uses real corpus bodies for `emDashSectionBreak`
 * (task-4-report.md's derivation), not the brief's synthetic literal.
 *
 * The corpus tier is split by class, per the fix-round-1 ruling
 * (Brian, 2026-08-25) that reclassified `emDashSectionBreak` from
 * Class A to Class C:
 *
 * - `italicLonePunctuation` is still Class A (a pure tag deletion,
 *   text unchanged), so it still gets the `stripTags`-equality
 *   invariant: order-sensitive, stronger than the gate's codepoint
 *   multiset.
 * - `emDashSectionBreak` is Class C: it DELETES the stray space the
 *   row's own `description`/`reason` name as the defect. A
 *   `stripTags`-equality test on this rule would pass on a no-op —
 *   which is exactly what fix round 1 shipped and what the review
 *   caught — so this tier instead asserts a DEFECT-COUNT delta: the
 *   spaced `. —` population (both shapes — the 230 empty-label and the
 *   48 labelled, matched with no trailing-space requirement so both
 *   are caught in one assertion) in touched entries must go 278 → 0.
 *   Fix round 1 pinned only the 230-member shape (`/\. — /gu`, a
 *   trailing space required) and so could not see that its own
 *   repair left a NEW off-norm shape behind — tight-dash-then-space,
 *   `.— ` — which is why a second assertion below checks that shape
 *   too, as a before/after DELTA rather than an absolute count (two
 *   pre-existing, correctly-formed instances of it exist elsewhere in
 *   the touched entries, unrelated to this rule; the delta, not the
 *   raw count, is what proves the rule creates no new ones). A
 *   touch-count vacuity guard alone cannot tell a repair from a
 *   reshuffle; a defect count can.
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
import { emDashSectionBreak, italicLonePunctuation } from './punct-seams.ts';

function entryWith(definition: string): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword: 'x',
		rid: 'A00001',
	} as SourceEntry;
}

const defOf = (e: SourceEntry): string => e.content.senses[0]?.definition ?? '';

describe('emDashSectionBreak', () => {
	// A00144's real text: the empty-label shape, 230/278 of the
	// catalogued row. Closes to the corpus norm ".—" — zero space on
	// EITHER side of the dash (fix round 2: round 1 left the trailing
	// space before "Pl." in place, which is itself an off-norm shape
	// — see the module doc, "fix round 2").
	it('closes the empty-label section break to the corpus norm ".—", zero space', () => {
		const out = emDashSectionBreak.apply(
			entryWith('<i>noble.</i> <i>—</i> Pl. <span dir="rtl">x</span>'),
		);
		expect(defOf(out.entry)).toBe('<i>noble.—</i>Pl. <span dir="rtl">x</span>');
	});

	// A02503's real text: the labelled shape, the other 48/278 — the
	// label rides through the replacement, merged into the same run.
	// Unchanged by fix round 2: this shape never had a trailing space
	// (the label sits inside the merged run, before its own `</i>`).
	it('merges a labelled section break, dropping the space entirely', () => {
		const out = emDashSectionBreak.apply(
			entryWith('<i>Spaniard.</i> <i>—Pl</i> good'),
		);
		expect(defOf(out.entry)).toBe('<i>Spaniard.—Pl</i> good');
	});

	it('leaves an em-dash that is not a section break alone', () => {
		const entry = entryWith('a — b');
		expect(emDashSectionBreak.apply(entry).entry).toBe(entry);
	});

	it('returns the caller’s own object when it changes nothing', () => {
		const entry = entryWith('nothing to do here');
		const out = emDashSectionBreak.apply(entry);
		expect(out.entry).toBe(entry);
		expect(out.records).toEqual([]);
	});

	it('declares no allowance — a sub-multiset shrink needs none', () => {
		expect(emDashSectionBreak.allows).toBeUndefined();
	});
});

describe('italicLonePunctuation', () => {
	it('unwraps a lone period', () => {
		expect(
			defOf(italicLonePunctuation.apply(entryWith('a<i>.</i>b')).entry),
		).toBe('a.b');
	});

	it('unwraps a lone question mark', () => {
		expect(
			defOf(italicLonePunctuation.apply(entryWith('a<i>?</i>b')).entry),
		).toBe('a?b');
	});

	it('unwraps a lone semicolon', () => {
		expect(
			defOf(italicLonePunctuation.apply(entryWith('a<i>;</i>b')).entry),
		).toBe('a;b');
	});

	// B00957's real text: the abbreviation-dot case `italic-period.ts`'s
	// empty-body guard declines specifically because it is this row's.
	it('unwraps esp.’s own abbreviation dot (B00957)', () => {
		const out = italicLonePunctuation.apply(
			entryWith('<i>favor, grant, </i>esp<i>.</i> <i> the rights</i>'),
		);
		expect(defOf(out.entry)).toBe(
			'<i>favor, grant, </i>esp. <i> the rights</i>',
		);
	});

	it('NEVER touches a lone em-dash — that is the other row', () => {
		const entry = entryWith('a<i>—</i>b');
		expect(italicLonePunctuation.apply(entry).entry).toBe(entry);
	});

	it('declines a body with more than the mark alone', () => {
		const entry = entryWith('a<i>. </i>b');
		expect(italicLonePunctuation.apply(entry).entry).toBe(entry);
	});

	it('returns the caller’s own object when it changes nothing', () => {
		const entry = entryWith('nothing to do here');
		const out = italicLonePunctuation.apply(entry);
		expect(out.entry).toBe(entry);
		expect(out.records).toEqual([]);
	});

	it('declares no allowance — it removes tags, it does not add text', () => {
		expect(italicLonePunctuation.allows).toBeUndefined();
	});
});

describe('the exclusion is a predicate, not a registration order', () => {
	it('italicLonePunctuation still declines the em-dash if run first', () => {
		const entry = entryWith('<i>gloss.</i> <i>—</i> Pl.');
		const lonePunctFirst = italicLonePunctuation.apply(entry);
		expect(lonePunctFirst.records).toEqual([]);
		expect(defOf(lonePunctFirst.entry)).toBe(defOf(entry));
	});

	it('emDashSectionBreak’s output never newly matches italicLonePunctuation', () => {
		const merged = emDashSectionBreak.apply(
			entryWith('<i>noble.</i> <i>—</i> Pl.'),
		).entry;
		expect(italicLonePunctuation.apply(merged).records).toEqual([]);
	});
});

/**
 * The registry-order hazard the module doc names, and the one fix
 * round 1 got half right: `italicGlossPeriodOutside` (`italic-period.ts`)
 * hunts the exact same `<i>gloss.</i>` shape `emDashSectionBreak`
 * needs intact, so it MUST run first. `labelPeriodInside` does not
 * share this hazard — pinned here specifically because fix round 1's
 * report claimed otherwise without measuring it.
 */
describe('registry-order hazard: emDashSectionBreak vs the label pair', () => {
	it('italicGlossPeriodOutside destroys the seam if it runs first', () => {
		const entry = entryWith('<i>noble.</i> <i>—</i> Pl.');
		const early = italicGlossPeriodOutside.apply(entry);
		expect(early.records).not.toEqual([]);
		expect(emDashSectionBreak.apply(early.entry).records).toEqual([]);
	});

	it('running emDashSectionBreak first leaves nothing for italicGlossPeriodOutside to move at the seam', () => {
		const entry = entryWith('<i>noble.</i> <i>—</i> Pl.');
		const merged = emDashSectionBreak.apply(entry);
		expect(merged.records).not.toEqual([]);
		expect(italicGlossPeriodOutside.apply(merged.entry).records).toEqual([]);
	});

	// Measured (task-4-report.md): unlike italicGlossPeriodOutside,
	// labelPeriodInside never touches this seam in either order —
	// its own pattern needs a period already OUTSIDE the tag, which
	// the raw seam never presents. Ordering relative to it is free.
	it('labelPeriodInside never touches the raw seam, so ordering against it is free', () => {
		const entry = entryWith('<i>noble.</i> <i>—</i> Pl.');
		const early = labelPeriodInside.apply(entry);
		expect(early.records).toEqual([]);
		expect(emDashSectionBreak.apply(early.entry).records).not.toEqual([]);
	});
});

/** ORDER-SENSITIVE field-by-field text equality — Class A only. */
function sameText(before: SourceEntry, after: SourceEntry): boolean {
	const was = fieldsOf(before).map(stripTags);
	const now = fieldsOf(after).map(stripTags);
	return was.length === now.length && was.every((text, at) => text === now[at]);
}

/** Whether `rule` touched this entry, pushing a problem when it
 * touched it AND changed its text. Class A only — see the module doc
 * for why `emDashSectionBreak` (Class C) gets a different tier below
 * instead of this one. */
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

describe('corpus tier: italicLonePunctuation is still Class A', () => {
	it('changes no field’s text on any entry it touches', async () => {
		const problems: string[] = [];
		let touched = 0;
		for await (const entry of readSourceEntries()) {
			touched += auditEntry(italicLonePunctuation, entry, problems) ? 1 : 0;
		}
		expect(problems).toEqual([]);
		// Vacuity guard: a predicate narrowed to nothing would satisfy
		// an empty-population invariant too.
		expect(touched).toBeGreaterThan(0);
	});
});

/** The spaced section-break defect, read the way the row's own
 * `reason` counts it: through `stripTags`, since the space never sits
 * next to the dash in the raw markup (a tag always separates them).
 * No trailing-space requirement — unlike fix round 1's `/\. — /gu`,
 * which pinned only the 230-member empty-label shape, this catches
 * BOTH shapes (a labelled occurrence strips to `. —Label`, which this
 * still matches on the `. —` prefix). */
const SPACED_DEFECT = /\. —/gu;

/** The shape fix round 2 exists to close: a tight dash immediately
 * followed by a space. Round 1's own repair created this 230 times
 * and round 1's corpus test could not see it, because it never
 * measured this shape at all. */
const TIGHT_THEN_SPACE = /\.— /gu;

function countMatches(entry: SourceEntry, pattern: RegExp): number {
	let count = 0;
	for (const field of fieldsOf(entry)) {
		count += (stripTags(field).match(pattern) ?? []).length;
	}
	return count;
}

interface DefectDelta {
	after: number;
	before: number;
	touched: number;
}

/** Runs `emDashSectionBreak` over the full corpus once, measuring
 * `pattern`'s occurrence count before and after on every entry the
 * rule touches. Shared by both defect-count assertions below so
 * neither `it` needs its own corpus walk. */
async function measureDefectDelta(pattern: RegExp): Promise<DefectDelta> {
	let before = 0;
	let after = 0;
	let touched = 0;
	for await (const entry of readSourceEntries()) {
		const out = emDashSectionBreak.apply(entry);
		if (out.records.length === 0) {
			continue;
		}
		touched += 1;
		before += countMatches(entry, pattern);
		after += countMatches(out.entry, pattern);
	}
	return { after, before, touched };
}

/** At ENTRY granularity, how many of `emDashSectionBreak`'s touched
 * entries `italicGlossPeriodOutside` still fires on afterward, at a
 * different, unrelated locus in the same body. */
async function countEntryLevelRetouches(): Promise<{
	alsoTouchedElsewhere: number;
	seamTouched: number;
}> {
	let seamTouched = 0;
	let alsoTouchedElsewhere = 0;
	for await (const entry of readSourceEntries()) {
		const merged = emDashSectionBreak.apply(entry);
		if (merged.records.length === 0) {
			continue;
		}
		seamTouched += 1;
		if (italicGlossPeriodOutside.apply(merged.entry).records.length > 0) {
			alsoTouchedElsewhere += 1;
		}
	}
	return { alsoTouchedElsewhere, seamTouched };
}

describe('corpus tier: emDashSectionBreak is Class C — a defect-count delta, not an invariant', () => {
	it('the rendered spaced em-dash population (both shapes) goes 278 before to 0 after', async () => {
		const { after, before, touched } = await measureDefectDelta(SPACED_DEFECT);
		// Vacuity guard: the rule must actually have fired.
		expect(touched).toBeGreaterThan(0);
		expect(before).toBe(278);
		expect(after).toBe(0);
	});

	// The metric that would have caught fix round 1's gap: round 1's
	// repair left the empty-label shape reading ".— Pl." — tight dash,
	// then a space — which is itself off-norm (59/20,420 corpus-wide,
	// 0.29%). Asserted as a BEFORE/AFTER delta rather than an absolute
	// zero: two pre-existing, correctly-formed instances of this exact
	// shape exist elsewhere in the touched entries (Q01352, U00925 —
	// see the module doc), unrelated to this rule's own edit, so an
	// absolute-zero assertion would fail on legitimate text. The delta
	// isolates what THIS RULE creates, which must be nothing.
	it('creates zero new instances of the tight-dash-then-space shape', async () => {
		const { after, before, touched } =
			await measureDefectDelta(TIGHT_THEN_SPACE);
		expect(touched).toBeGreaterThan(0);
		expect(after - before).toBe(0);
		// Pinned absolute values too, so a future change that shifts
		// which entries carry the pre-existing instances is visible
		// rather than silently absorbed by the delta check alone.
		expect(before).toBe(2);
		expect(after).toBe(2);
	});

	// The granularity distinction fix round 1's docstring drew but did
	// not pin: at the SEAM this rule owns, nothing downstream re-touches
	// it once it runs first (asserted above). At ENTRY granularity,
	// italicGlossPeriodOutside still fires afterward on a measured
	// minority — a different, unrelated period elsewhere in the same
	// body — which is expected and not this rule's defect to prevent.
	it('at entry granularity, 23 of 270 still get touched elsewhere by italicGlossPeriodOutside', async () => {
		const { alsoTouchedElsewhere, seamTouched } =
			await countEntryLevelRetouches();
		expect(seamTouched).toBe(270);
		expect(alsoTouchedElsewhere).toBe(23);
	});
});
