import { expect, it } from 'bun:test';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { composedEntries } from './corpus-fixture.ts';
import { LABELS, sectionBreakTerminator } from './section-break.ts';

/**
 * `section-break-terminator-loss`, measured where the rule stands.
 *
 * The NULL MODEL IS THE ARGUMENT for this row, because the rule mints a
 * byte: the predecessor census below is what says an 11-member exception
 * to a 7,532-strong convention is a defect rather than a variant. It is
 * asserted here rather than quoted in a docstring, so a re-fetch that
 * changed the balance would fail loudly instead of leaving a stale
 * justification in place.
 */

const TAG: string = String.raw`(?:<\/?[a-z][^>]*>)*`;
const SECTION = new RegExp(
	String.raw`(?<pre>.)${TAG}—${TAG}(?:${LABELS.join('|')})\b`,
	'gu',
);

function* walk(
	senses: readonly SourceSense[] | undefined,
): Generator<SourceSense> {
	if (senses === undefined) {
		return;
	}
	for (const sense of senses) {
		yield sense;
		yield* walk(sense.senses);
	}
}

const composed: readonly SourceEntry[] = await composedEntries();

const predecessors = new Map<string, number>();
const defective: string[] = [];
for (const entry of composed) {
	for (const sense of walk(entry.content.senses)) {
		const definition = sense.definition;
		if (definition === undefined) {
			continue;
		}
		for (const match of definition.matchAll(SECTION)) {
			const pre = match.groups?.['pre'] as string;
			predecessors.set(pre, (predecessors.get(pre) ?? 0) + 1);
			if (/[\p{L}\p{N}]/u.test(pre)) {
				defective.push(entry.rid);
			}
		}
	}
}

it('measures the whole corpus', () => {
	expect(composed).toHaveLength(32_512);
}, 30_000);

// THE CONVENTION. 7,250 of 7,532 section heads already carry their
// period, and every non-period predecessor with a count above 4 is a
// legitimate sentence-ender.
it('reproduces the convention and all four falsifier controls', () => {
	expect(predecessors.get('.')).toBe(7250);
	expect(predecessors.get(']')).toBe(241);
	expect(predecessors.get('?')).toBe(54);
	expect(predecessors.get(')')).toBe(17);
	expect(predecessors.get('!')).toBe(4);
}, 30_000);

// THE TWO FALSE-POSITIVE FAMILIES, which is why the row was cut from a
// 15-candidate first pass to 10. Both are excluded by the predecessor
// class rather than by an exception list, and pinning them here is what
// keeps that exclusion honest if the corpus changes.
it('leaves the quotation-closers and ellipses outside the population', () => {
	expect(predecessors.get('’')).toBe(3);
	expect(predecessors.get('…')).toBe(2);
}, 30_000);

it('repairs 11, one above the catalogued 10', () => {
	expect([...new Set(defective)].toSorted()).toEqual([
		'A00519',
		'C00193',
		'C00952',
		'G00323',
		'H00068',
		'M00479',
		'Q01518',
		'R00440',
		'S01514',
		'T00980',
		'V00427',
	]);
	let records = 0;
	for (const entry of composed) {
		records += sectionBreakTerminator.apply(entry).records.length;
	}
	expect(records).toBe(11);
}, 120_000);

// THE PERIOD GOES OUTSIDE THE CLOSING TAGS. Writing it inside would
// manufacture fresh members of `italic-swallowed-terminal-period`
// (1,331, registered) — a rule growing a sibling row's population, the
// failure batch 3b found by hand. Measured over the real members rather
// than a fixture: no repaired definition gains a period immediately
// before a closing tag.
it('never writes the period inside a tag', () => {
	for (const entry of composed) {
		const result = sectionBreakTerminator.apply(entry);
		if (result.records.length === 0) {
			continue;
		}
		// ONLY the definitions this rule CHANGED. Asserting over every
		// sense of a repaired entry would fail on a pre-existing
		// `.</i>—Pl.` in a sense the rule correctly refused — the
		// predecessor there is already a period — and that failure would
		// be about the corpus, not about what the rule wrote.
		const before = [...walk(entry.content.senses)].map(
			(sense) => sense.definition ?? '',
		);
		const after = [...walk(result.entry.content.senses)].map(
			(sense) => sense.definition ?? '',
		);
		for (const [index, written] of after.entries()) {
			if (written === before[index]) {
				continue;
			}
			expect(written).not.toMatch(/\.<\/[a-z]+>—/u);
		}
	}
}, 120_000);
