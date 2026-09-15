/**
 * The gershayim pair, FIXTURE TIER.
 *
 * Every fixture is a REAL entry, because each one is here for a
 * property of the data that a hand-written string could not witness:
 * `B00752` and `C01225` are damaged anchors carrying no `dir`
 * attribute, `A00253` and `U01408` put two abbreviations in one token,
 * `M01940` sets a combining dot between the letter and the quote, and
 * `A00692` is on the decline register — a minority slot the rule
 * corrects in place and does not move. Writing those shapes by hand
 * would test the predicate against the author's memory of the data
 * rather than against the data.
 *
 * The eight entries are frozen, byte for byte, in
 * `fixtures/gershayim.jsonl` (extracted from the 2026-07-04 export in
 * consolidation step 5), so this file runs on every `bun qa` without
 * reading the source data. The corpus measurements it used to carry —
 * the locus partition, the link-integrity census, order-freedom over
 * every entry — are listed in `docs/v2/retired-corpus-checks.md`.
 */
import { expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry } from '../../body/types.ts';
import { GERSHAYIM } from '../gershayim.ts';
import { serialize, tokenize } from '../html.ts';
import { type Anchor, anchors } from '../links.ts';
import { fieldsOf } from '../no-new-text.ts';
import { applyTransforms } from '../run.ts';
import type { Rule } from '../types.ts';
import { gershayimInBody, gershayimRefAttribute } from './gershayim.ts';

const Q = String.fromCharCode(34);
const PAIR: Rule[] = [gershayimInBody, gershayimRefAttribute];

const WANTED = new Set([
	'A00000',
	'A00009',
	'A00253',
	'A00692',
	'B00752',
	'C01225',
	'M01940',
	'U01408',
]);

const FIXTURE_PATH = `${import.meta.dir}/fixtures/gershayim.jsonl`;

const FIXTURES = new Map<string, SourceEntry>();
for await (const source of readSourceEntries(FIXTURE_PATH)) {
	FIXTURES.set(source.rid, source);
}

/** One real entry, by rid. Throws rather than returning `undefined`,
 * so a snapshot that lost an entry fails as a missing fixture instead
 * of as a confusing assertion. */
function entry(rid: string): SourceEntry {
	const found = FIXTURES.get(rid);
	if (found === undefined) {
		throw new Error(`fixture ${rid} is not in the snapshot`);
	}
	return found;
}

/** Every tag in every walked field, in walk order — split by
 * `html.ts`'s tokenizer rather than by a regex of this file's own, so
 * "tag" and "text run" mean here exactly what they mean to the
 * `no-new-text` gate that judges the same output
 * (`no-new-text.ts`'s `stripTags`). A hand-rolled strip would be a
 * second parser free to drift from the one under test. */
function tagsOf(source: SourceEntry): string[] {
	return fieldsOf(source).flatMap((field) =>
		tokenize(field)
			.filter((token) => token.kind === 'tag')
			.map((token) => token.value),
	);
}

/**
 * Every anchor, in `fieldsOf` order then `anchors` order — the SAME
 * walk `rules/gershayim.ts` pairs its `glyphCorrected` claims on, so
 * index i names the same anchor before and after the pair runs.
 */
function anchorsOf(source: SourceEntry): Anchor[] {
	return fieldsOf(source).flatMap((field) => anchors(tokenize(field)));
}

/** Every anchor's parsed `data-ref`, in walk order. */
function dataRefsOf(source: SourceEntry): string[] {
	return anchorsOf(source).map((anchor) => anchor.dataRef);
}

/** How many `״` the walked fields hold. */
function marks(source: SourceEntry): number {
	return fieldsOf(source).reduce(
		(total, field) =>
			total + [...field].filter((ch) => ch === GERSHAYIM).length,
		0,
	);
}

it('gershayimInBody repairs body text and declares no link work', () => {
	const before = entry('A00009');
	const result = gershayimInBody.apply(before);
	expect(result.records).toHaveLength(1);
	expect(result.records[0]?.ruleId).toBe('ascii-quote-as-gershayim-in-body');
	expect(result.records[0]?.rid).toBe('A00009');
	expect(result.records[0]?.detail).toContain(`אל${GERSHAYIM}ף`);
	expect(result.glyphCorrected ?? []).toEqual([]);
	expect(marks(result.entry)).toBe(1);
});

it('gershayimInBody leaves every tag byte-identical', () => {
	const before = entry('A00009');
	const after = gershayimInBody.apply(before).entry;
	expect(tagsOf(after)).toEqual(tagsOf(before));
	expect(dataRefsOf(after)).toEqual(dataRefsOf(before));
});

it('gershayimRefAttribute repairs the tag and declares the pair', () => {
	const result = gershayimRefAttribute.apply(entry('A00009'));
	expect(result.glyphCorrected?.length).toBe(1);
	const [claim] = result.glyphCorrected ?? [];
	expect(claim?.target.replaceAll(GERSHAYIM, Q)).toBe(claim?.from);
	// Both attributes of the one anchor, and nothing in the display.
	expect(marks(result.entry)).toBe(2);
});

it('gershayimRefAttribute leaves every text run byte-identical', () => {
	const before = entry('A00009');
	const after = gershayimRefAttribute.apply(before).entry;
	const stripped = (source: SourceEntry): string[] =>
		fieldsOf(source).map((field) =>
			serialize(tokenize(field).filter((token) => token.kind === 'text')),
		);
	expect(stripped(after)).toEqual(stripped(before));
});

it('the repaired data-ref now parses in full', () => {
	const before = entry('A00009');
	expect(dataRefsOf(before)).toContain('Jastrow, אל');
	const after = gershayimRefAttribute.apply(before).entry;
	expect(dataRefsOf(after)).toContain(`Jastrow, אל${GERSHAYIM}ף 1`);
});

it('a displaced token is glyph-corrected in place and never moved', () => {
	// A00692's עכ"ום is on the decline register — the dominant twin
	// elsewhere in the corpus is עכו"ם. The mark stays where it is.
	const after = gershayimRefAttribute.apply(entry('A00692')).entry;
	expect(dataRefsOf(after)).toContain(`Jastrow, עכ${GERSHAYIM}ום 1`);
	expect(dataRefsOf(after)).not.toContain(`Jastrow, עכו${GERSHAYIM}ם 1`);
});

it('a damaged anchor with no dir attribute is repaired', () => {
	// Spec §4.1: an RTL-scoped walk would silently skip both of these
	// and still report a clean run.
	for (const [rid, target] of [
		['B00752', `Jastrow, בי${GERSHAYIM}ת 1`],
		['C01225', `Jastrow, ג${GERSHAYIM}ר 1`],
	]) {
		const result = gershayimRefAttribute.apply(entry(rid ?? ''));
		const repaired = result.glyphCorrected ?? [];
		expect(repaired.length).toBeGreaterThan(0);
		// The damaged tag itself carries no `dir` — other tags in the
		// same entry do, which is exactly what makes an RTL-scoped walk
		// look like it works.
		for (const claim of repaired) {
			expect(claim.from).not.toContain('dir=');
		}
		expect(dataRefsOf(result.entry)).toContain(target ?? '');
	}
});

it('both quotes of a two-abbreviation token are repaired', () => {
	// The two occurrences a consuming predicate loses (spec §2).
	for (const rid of ['A00253', 'U01408']) {
		const before = entry(rid);
		const after = gershayimInBody.apply(before).entry;
		expect(marks(after) - marks(before)).toBe(2);
		expect(JSON.stringify(after)).toContain(`יה${GERSHAYIM}ש${GERSHAYIM}ר`);
	}
});

it('a quote behind a combining mark is repaired', () => {
	// M01940's מ̇ס̇"ך̇ — the occurrence a bare lookbehind loses. The
	// entry holds a second, ordinary one (ק"כ) in the same definition.
	const before = entry('M01940');
	const after = gershayimInBody.apply(before).entry;
	expect(marks(after) - marks(before)).toBe(2);
	expect(JSON.stringify(after)).toContain(`ס̇${GERSHAYIM}ך̇`);
});

it('an entry with no match comes back by reference', () => {
	const before = entry('A00000');
	expect(gershayimInBody.apply(before).entry).toBe(before);
	expect(gershayimRefAttribute.apply(before).entry).toBe(before);
	expect(gershayimInBody.apply(before).records).toEqual([]);
});

it('both rules declare the gershayim and run in the text phase', () => {
	for (const rule of PAIR) {
		expect(rule.allows).toEqual([GERSHAYIM]);
		expect(rule.phase).toBe('text-repairs');
	}
});

/**
 * The mapper and `fieldsOf` walk the SAME fields — checked in both
 * directions, because each direction fails differently and silently.
 *
 * A field the mapper edits but `fieldsOf` does not walk is a field no
 * gate can see, so the rule would pass vacuously on unreviewed output
 * (`no-new-text.ts`: "a field outside this set is a field the gate
 * cannot see"). A field `fieldsOf` walks but the mapper does not edit
 * goes unrepaired while the run reports success.
 *
 * This entry puts a repairable token in every field position
 * `fieldsOf` enumerates — thirteen distinct kinds, eighteen positions
 * once the nested sense repeats the five sense-level ones — with
 * `grammar`'s three included: they hold 0 occurrences in the pinned
 * snapshot, so nothing but this test would notice if a re-fetch put
 * one there. `refs[]` carries one
 * too and must come through UNTOUCHED: it is out of scope by ruling
 * (body model spec §5, B7) and `fieldsOf` does not walk it either.
 */
it('the mapper walks every field the gate walks, and no other', () => {
	const token = `א${Q}ב`;
	const sense = {
		definition: `d ${token}`,
		grammar: {
			binyan_form: [`b ${token}`],
			language_code: `g ${token}`,
			verbal_stem: `v ${token}`,
		},
		number: `n ${token}`,
	};
	const before: SourceEntry = {
		alt_headwords: [`a ${token}`],
		content: {
			morphology: `m ${token}`,
			senses: [{ ...sense, senses: [sense] }],
		},
		headword: `h ${token}`,
		language_code: `lc ${token}`,
		language_reference: `lr ${token}`,
		plural_form: [`p ${token}`],
		quotes: [[`q1 ${token}`, `q2 ${token}`, null]],
		refs: [`r ${token}`],
		rid: 'Z99999',
	};
	expect(fieldsOf(before).filter((field) => field.includes(Q))).toHaveLength(
		18,
	);
	const after = gershayimInBody.apply(before).entry;
	expect(fieldsOf(after).filter((field) => field.includes(Q))).toEqual([]);
	expect(
		fieldsOf(after).filter((field) => field.includes(GERSHAYIM)),
	).toHaveLength(18);
	expect(after.refs).toEqual([`r ${token}`]);
});

it('every fixture clears all three gates, in both orders', () => {
	for (const rid of WANTED) {
		const before = entry(rid);
		const forward = applyTransforms(before, 'text-repairs', PAIR);
		const reverse = applyTransforms(
			before,
			'text-repairs',
			[...PAIR].reverse(),
		);
		expect(JSON.stringify(forward.entry)).toBe(JSON.stringify(reverse.entry));
	}
});
