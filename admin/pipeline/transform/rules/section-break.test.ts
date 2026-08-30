import { describe, expect, it } from 'bun:test';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import {
	LABELS,
	restoreStops,
	STOP,
	sectionBreakTerminator,
} from './section-break.ts';

const one = (definition: string): SourceEntry => ({
	content: { senses: [{ definition }] },
	headword: 'חֲבִילָה',
	rid: 'T00001',
});
const defOf = (e: SourceEntry): string | undefined =>
	e.content.senses[0]?.definition;

describe('restoreStops', () => {
	it('restores the period before a bare section head', () => {
		expect(restoreStops('is severed—Pl. חבילין')?.repaired).toBe(
			'is severed.—Pl. חבילין',
		);
	});

	// THE PERIOD GOES OUTSIDE THE CLOSING TAG. Writing `<i>hill.</i>`
	// would be a fresh member of `italic-swallowed-terminal-period`
	// (1,331, registered) — a rule manufacturing population for a sibling
	// row, which is the failure batch 3b found by hand.
	it('restores it OUTSIDE the closing tag, before the dash', () => {
		const before = 'height, <i>hill</i>—<i>Pl.</i> x';
		expect(restoreStops(before)?.repaired).toBe(
			'height, <i>hill</i>.—<i>Pl.</i> x',
		);
	});

	it('restores it through several closing tags at once', () => {
		expect(restoreStops('<span dir="rtl">רצחנין</span>—Pl. x')?.repaired).toBe(
			'<span dir="rtl">רצחנין</span>.—Pl. x',
		);
	});

	it('reaches every section label', () => {
		for (const label of LABELS) {
			expect(restoreStops(`gloss—${label}. x`)?.repaired).toBe(
				`gloss.—${label}. x`,
			);
		}
	});

	// THE FALSIFIER CONTROLS, and they are the row's own. Every one of
	// these predecessors is a legitimate sentence-ender, and the corpus
	// holds 7,250 correct periods plus 241 `]`, 54 `?`, 17 `)` and 4 `!`.
	it('refuses a predecessor that already ends the sentence', () => {
		for (const pre of ['.', ']', '?', ')', '!', ';']) {
			expect(restoreStops(`gloss${pre}—Pl. x`)).toBeNull();
		}
	});

	// THE TWO FALSE-POSITIVE FAMILIES the row's first pass caught, which
	// is why it was cut from 15 candidates to 10. Excluded by the
	// predecessor class rather than by an exception list.
	// A SPACE IS NOT A LETTER OR DIGIT, so the corpus census does not
	// count it and the rule must not repair it. The census records 2 of
	// these; nothing else in this file pinned the behaviour.
	it('refuses a whitespace predecessor', () => {
		expect(restoreStops('gloss —Pl. x')).toBeNull();
	});

	it('refuses a closing quote and an ellipsis', () => {
		expect(restoreStops('the words’—Pl. x')).toBeNull();
		expect(restoreStops('trailing off…—Pl. x')).toBeNull();
	});

	it('refuses a label that is not a section head', () => {
		expect(restoreStops('gloss—Hithpa. x')).toBeNull();
	});

	it('repairs each head in a definition holding two', () => {
		const result = restoreStops('one—Pl. a, two—Fem. b');
		expect(result?.count).toBe(2);
		expect(result?.repaired).toBe('one.—Pl. a, two.—Fem. b');
	});
});

describe('sectionBreakTerminator', () => {
	it('declares the one codepoint it writes, and only that', () => {
		expect(sectionBreakTerminator.allows).toEqual([STOP]);
		expect(STOP).toBe('.');
	});

	it('records one repair per restored period', () => {
		const { entry: after, records } = sectionBreakTerminator.apply(
			one('is severed—Pl. x'),
		);
		expect(defOf(after)).toBe('is severed.—Pl. x');
		expect(records).toHaveLength(1);
	});

	it('returns the input untouched when nothing matches', () => {
		const input = one('is severed.—Pl. x');
		const result = sectionBreakTerminator.apply(input);
		expect(result.entry).toBe(input);
		expect(result.records).toEqual([]);
	});

	it('deletes nothing and removes no anchor', () => {
		const result = sectionBreakTerminator.apply(one('is severed—Pl. x'));
		expect(result.removes).toBeUndefined();
		expect(result.unlinks).toBeUndefined();
	});

	it('repairs a nested sense at its own depth', () => {
		const input: SourceEntry = {
			content: {
				senses: [
					{ definition: 'head', senses: [{ definition: 'inner—Fem. x' }] },
				],
			},
			headword: 'x',
			rid: 'T00002',
		};
		const after = sectionBreakTerminator.apply(input).entry;
		const inner = after.content.senses[0]?.senses as SourceSense[];
		expect(inner[0]?.definition).toBe('inner.—Fem. x');
	});

	it('treats the input as immutable', () => {
		const input = one('is severed—Pl. x');
		const before = structuredClone(input);
		sectionBreakTerminator.apply(input);
		expect(input).toEqual(before);
	});

	it('is idempotent — a restored period is a refusal next time', () => {
		const once = sectionBreakTerminator.apply(one('is severed—Pl. x')).entry;
		expect(sectionBreakTerminator.apply(once).entry).toBe(once);
	});
});
