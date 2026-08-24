/**
 * The gershayim pair, fixture tier and corpus tier.
 *
 * Every fixture is a REAL entry, loaded from the pinned snapshot by
 * rid, because each one is here for a property of the corpus that a
 * hand-written string could not witness: `B00752` and `C01225` are
 * damaged anchors carrying no `dir` attribute, `A00253` and `U01408`
 * put two abbreviations in one token, `M01940` sets a combining dot
 * between the letter and the quote, and `A00692` is on the decline
 * register — a minority slot the rule corrects in place and does not
 * move. Writing those shapes by hand would test the predicate against
 * the author's memory of the data rather than against the data.
 *
 * The corpus tier at the bottom re-measures spec §2's locus partition
 * and §3's disjointness through the rules themselves, and runs every
 * entry the pair touches through `applyTransforms` so all three gates
 * judge the real output. A narrowed predicate or a corpus edit fails
 * here, on every `bun qa`, rather than only on a `transform:count`
 * someone remembers to run.
 */
import { expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry } from '../../body/types.ts';
import { GERSHAYIM } from '../gershayim.ts';
import { tokenize } from '../html.ts';
import { anchors } from '../links.ts';
import { fieldsOf } from '../no-new-text.ts';
import { applyTransforms } from '../run.ts';
import type { Rule } from '../types.ts';
import { gershayimInBody, gershayimRefAttribute } from './gershayim.ts';

const Q = String.fromCharCode(34);
const TAG = /<[^<>]*>/gu;
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

const FIXTURES = new Map<string, SourceEntry>();
for await (const source of readSourceEntries()) {
	if (WANTED.has(source.rid)) {
		FIXTURES.set(source.rid, source);
	}
	if (FIXTURES.size === WANTED.size) {
		break;
	}
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

/** Every `<…>` tag in every walked field, in walk order. */
function tagsOf(source: SourceEntry): string[] {
	return fieldsOf(source).flatMap((field) =>
		[...field.matchAll(TAG)].map(([tag]) => tag),
	);
}

/** Every anchor's parsed `data-ref`, in walk order. */
function dataRefsOf(source: SourceEntry): string[] {
	return fieldsOf(source).flatMap((field) =>
		anchors(tokenize(field)).map((anchor) => anchor.dataRef),
	);
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
	expect(result.records.length).toBe(1);
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
		fieldsOf(source).map((field) => field.replaceAll(TAG, ''));
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
	expect(fieldsOf(before).filter((field) => field.includes(Q)).length).toBe(18);
	const after = gershayimInBody.apply(before).entry;
	expect(fieldsOf(after).filter((field) => field.includes(Q))).toEqual([]);
	expect(
		fieldsOf(after).filter((field) => field.includes(GERSHAYIM)).length,
	).toBe(18);
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

/**
 * Spec §2's locus partition, re-measured through the rules rather than
 * through a probe: 2,125 occurrences / 1,386 entries in document text,
 * 180 / 85 in tag interiors, over 90 anchors, 2,305 and 1,392 union.
 *
 * Also the disjointness claim of §3 and of `gershayim.ts`'s docstring,
 * which is the reason the two rows may ship in either registry order:
 * applying the pair in one order and in the other produces
 * byte-identical entries, and the two loci's counts sum to the count a
 * single unrestricted pass would produce. Neither rule can move an
 * occurrence into or out of the other's locus, because the
 * substitution never writes or removes a `<` or a `>`.
 *
 * And the gates: every entry either rule touches goes through
 * `applyTransforms`, so `checkNoNewText`, `checkMarkup` and
 * `checkLinkTargets` all judge the real output on the real corpus.
 */
it('the corpus splits exactly as the spec measures it', async () => {
	const seen = { body: 0, bodyRids: 0, tag: 0, tagRids: 0, tags: 0 };
	const union = new Set<string>();
	for await (const source of readSourceEntries()) {
		const body = gershayimInBody.apply(source);
		const tag = gershayimRefAttribute.apply(source);
		const bodyCount = marks(body.entry) - marks(source);
		const tagCount = marks(tag.entry) - marks(source);
		seen.body += bodyCount;
		seen.tag += tagCount;
		seen.tags += tag.glyphCorrected?.length ?? 0;
		if (bodyCount > 0) {
			seen.bodyRids += 1;
			union.add(source.rid);
		}
		if (tagCount > 0) {
			seen.tagRids += 1;
			union.add(source.rid);
		}
		if (union.has(source.rid)) {
			const forward = applyTransforms(source, 'text-repairs', PAIR);
			const reverse = applyTransforms(source, 'text-repairs', [
				gershayimRefAttribute,
				gershayimInBody,
			]);
			expect(JSON.stringify(forward.entry)).toBe(JSON.stringify(reverse.entry));
			expect(marks(forward.entry)).toBe(bodyCount + tagCount);
		}
	}
	expect(seen).toEqual({
		body: 2125,
		bodyRids: 1386,
		tag: 180,
		tagRids: 85,
		tags: 90,
	});
	expect(union.size).toBe(1392);
}, 300_000);

/** The corpus fact behind the `allows` allowance — worth pinning
 * because it is what makes the count above checkable, even though the
 * allowance's safety rests on the substitution rather than on it
 * (`rules/gershayim.ts` docstring). */
it('the input corpus holds no gershayim of its own', async () => {
	let found = 0;
	for await (const source of readSourceEntries()) {
		found += marks(source);
	}
	expect(found).toBe(0);
}, 300_000);
