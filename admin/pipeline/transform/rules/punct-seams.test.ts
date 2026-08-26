/**
 * The em-dash / lone-punctuation pair, fixture tier and corpus tier.
 *
 * The fixture tier uses real corpus bodies for `emDashSectionBreak`
 * (task-4-report.md's derivation), not the brief's synthetic literal
 * — see `punct-seams.ts`'s module doc for why that literal could not
 * survive the `stripTags` invariant. The corpus tier is spec §6
 * measure (1), and it is the ONLY gate that can see a Class A rule at
 * all: `checkNoNewText` compares codepoint multisets, so a run merge
 * that keeps every character but drops a redundant tag pair is
 * invisible to it by construction, and `checkMarkup` is a delta gate
 * that lets pre-existing damage through. `stripTags` equality is
 * order-sensitive, which is the property that actually matters here.
 */
import { describe, expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry } from '../../body/types.ts';
import { fieldsOf, stripTags } from '../no-new-text.ts';
import type { Rule } from '../types.ts';
import { italicGlossPeriodOutside } from './italic-period.ts';
import { emDashSectionBreak, italicLonePunctuation } from './punct-seams.ts';

const PAIR: readonly Rule[] = [emDashSectionBreak, italicLonePunctuation];

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
	// catalogued row.
	it('merges the empty-label section break, preserving both spaces', () => {
		const out = emDashSectionBreak.apply(
			entryWith('<i>noble.</i> <i>—</i> Pl. <span dir="rtl">x</span>'),
		);
		expect(defOf(out.entry)).toBe(
			'<i>noble. —</i> Pl. <span dir="rtl">x</span>',
		);
	});

	// A02503's real text: the labelled shape, the other 48/278 — the
	// label rides through the replacement unchanged.
	it('merges a labelled section break, keeping the label attached', () => {
		const out = emDashSectionBreak.apply(
			entryWith('<i>Spaniard.</i> <i>—Pl</i> good'),
		);
		expect(defOf(out.entry)).toBe('<i>Spaniard. —Pl</i> good');
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

	it('declares no allowance — it moves markup, it does not add text', () => {
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
 * The registry-order hazard the module doc names: `italicGlossPeriodOutside`
 * (`italic-period.ts`) hunts the exact same `<i>gloss.</i>` shape
 * `emDashSectionBreak` needs intact. Pinned here rather than left as
 * a comment because a future edit to either rule's pattern could
 * silently reopen it — 270 of 270 entries, measured on the full
 * corpus (task-4-report.md), if the wrong rule runs first.
 */
describe('registry-order hazard: emDashSectionBreak vs italicGlossPeriodOutside', () => {
	it('italicGlossPeriodOutside destroys the seam if it runs first', () => {
		const entry = entryWith('<i>noble.</i> <i>—</i> Pl.');
		const early = italicGlossPeriodOutside.apply(entry);
		expect(early.records).not.toEqual([]);
		expect(emDashSectionBreak.apply(early.entry).records).toEqual([]);
	});

	it('running emDashSectionBreak first leaves nothing for italicGlossPeriodOutside to move', () => {
		const entry = entryWith('<i>noble.</i> <i>—</i> Pl.');
		const merged = emDashSectionBreak.apply(entry);
		expect(merged.records).not.toEqual([]);
		expect(italicGlossPeriodOutside.apply(merged.entry).records).toEqual([]);
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
		// And the invariant must not be passing vacuously: a predicate
		// narrowed to nothing would satisfy it on an empty population.
		for (const count of touched.values()) {
			expect(count).toBeGreaterThan(0);
		}
	});
});
