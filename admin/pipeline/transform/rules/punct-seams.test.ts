/**
 * The em-dash / lone-punctuation pair, fixture tier.
 *
 * The fixture tier uses real corpus bodies for `emDashSectionBreak`
 * (task-4-report.md's derivation), not the brief's synthetic literal.
 *
 * The corpus tier — split by class, per the fix-round-1 ruling (Brian,
 * 2026-08-25) that reclassified `emDashSectionBreak` from Class A to
 * Class C, into a `stripTags`-equality invariant for
 * `italicLonePunctuation` and a defect-count delta (278 → 0, plus the
 * tight-dash-then-space regression check) for `emDashSectionBreak` —
 * was retired in consolidation step 5 and is listed in
 * `docs/archive/retired-corpus-checks.md`.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../types.ts';
import {
	italicGlossPeriodOutside,
	labelPeriodInside,
} from './italic-period.ts';
import { emDashSectionBreak, italicLonePunctuation } from './punct-seams.ts';

/** A minimal single-sense entry: both rules read `definition` and
 * nothing else. */
function entryWith(definition: string): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword: 'x',
		rid: 'A00001',
	} as SourceEntry;
}

/** The one definition back out. */
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
