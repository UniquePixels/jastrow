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
 *
 * Then the link-integrity census (spec §5) — the batch's headline
 * claim, that exactly 90 link targets start resolving and none stop —
 * measured by resolving every `data-ref` in the corpus against the
 * entry headwords, before the pass and after it. It carries the
 * gershayim total (0 in, 2,305 out) on the same walk.
 *
 * The last two tests are the registry's order-freedom claim (spec
 * §4.2, task 3): the pair against itself and against the rtl trio,
 * over every entry rather than over the ones it touches. They live
 * with the rules rather than in `registry.order.test.ts` because what
 * they measure is a property of these predicates — that neither reads
 * markup context — and it is the predicates a later edit would
 * narrow.
 */
import { expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry } from '../../body/types.ts';
import { GERSHAYIM } from '../gershayim.ts';
import { tokenize } from '../html.ts';
import { type Anchor, anchors } from '../links.ts';
import { fieldsOf } from '../no-new-text.ts';
import { applyTransforms } from '../run.ts';
import type { Rule } from '../types.ts';
import { gershayimInBody, gershayimRefAttribute } from './gershayim.ts';
import {
	bareRtlHebrew,
	latinTokenInsideRtl,
	redundantOuterRtl,
} from './rtl.ts';

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

/** The Jastrow address shape: `Jastrow, ` then the headword VERBATIM,
 * then the sense number. Greedy on purpose — see the census below. */
const JASTROW_REF = /^Jastrow, (.+) (\d+)$/u;

/** The headword a `data-ref` names, or `undefined` when it names none
 * — a Sefaria citation, or a target truncated at an embedded quote
 * (`Jastrow, אל`), which is this batch's defect. */
function targetHeadword(dataRef: string): string | undefined {
	return JASTROW_REF.exec(dataRef)?.[1];
}

/**
 * THE LINK-INTEGRITY CENSUS (batch-3a spec §5) — the batch's headline
 * number, measured over all 170,182 anchors rather than argued.
 *
 * ## What "resolves" means, and why the reading is greedy
 *
 * A `data-ref` is one of two things: a Sefaria citation
 * (`Bereishit Rabbah 53:13` — 96,714 of them) or a Jastrow address
 * (`Jastrow, חָבַב I 1` — 73,468). Only the second names a headword, so
 * only the second is counted. Folding the citations in would add
 * 96,714 constant non-matches to both sides of a difference and hide
 * nothing they could catch: they resolve against a corpus this
 * repository does not hold.
 *
 * A Jastrow address is the headword string with the sense number
 * appended, so the target is read GREEDILY — everything between
 * `Jastrow, ` and the final space-delimited number. That is
 * load-bearing: 2,871 headwords END in a roman numeral (`אָמוֹן I`) and
 * 807 in a superscript, both part of the headword itself. The lazy
 * `\s(?:[IVXL]+\s)?\d+` reading of spec §3's probe strips the numeral
 * — correct there, because that probe runs on RAW TAG BYTES and never
 * sees a parsed value, and wrong here: it resolves 65,817 addresses
 * against these same headwords, losing 7,536 honest links.
 *
 * Before any repair the greedy rule resolves 73,353 of 73,468 — 99.84%.
 * The 115 that do not are the 90 truncations this batch repairs plus
 * 25 addresses naming a headword the corpus does not hold at all,
 * which no rule in this batch touches and which stay unresolved on
 * both sides.
 *
 * ## Why `after` is scored against the HEALED headwords
 *
 * Both ends of every damaged link move in the same pass: `mapEntry`
 * repairs `headword` alongside the definitions, so the denominator on
 * the `after` side is the healed headword set. Scoring repaired
 * targets against the INPUT headwords reports 0 newly-resolving links
 * and reads as a broken rule rather than a broken measurement. That
 * is why the census takes two passes — the healed headword set is not
 * known until the whole corpus has been read.
 *
 * ## What the numbers have to be
 *
 * `lost` empty is the safety half: every address that resolved before
 * still resolves. `gained: 90` is the headline. `rewritten` is the
 * anchors whose OPENING TAG the pair changed, and the two empty
 * cross-difference lists are what make the 90 the right 90 — not
 * merely 90 of something, but exactly the anchors this batch repaired,
 * matched by rid and walk position. Every damaged anchor lands: none
 * of the 90 points at a headword that is still missing after repair.
 *
 * The gershayim total rides along on the second pass rather than
 * taking a third of its own. It is the same walk, and it is what makes
 * the link numbers checkable — `״` does not occur once in the input,
 * so every one in the output is this pair's own work.
 */
it('exactly 90 link targets start resolving, and none stop', async () => {
	const healed = (source: SourceEntry): SourceEntry =>
		gershayimRefAttribute.apply(gershayimInBody.apply(source).entry).entry;
	const resolves = (dataRef: string, against: ReadonlySet<string>): boolean => {
		const target = targetHeadword(dataRef);
		return target !== undefined && against.has(target);
	};
	const headwords = new Set<string>();
	const healedHeadwords = new Set<string>();
	for await (const source of readSourceEntries()) {
		headwords.add(source.headword);
		healedHeadwords.add(healed(source).headword);
	}
	const before = new Set<string>();
	const after = new Set<string>();
	const rewritten = new Set<string>();
	const seen = {
		anchorDrift: 0,
		anchors: 0,
		gershayimAfter: 0,
		gershayimBefore: 0,
	};
	for await (const source of readSourceEntries()) {
		const fixed = healed(source);
		seen.gershayimBefore += marks(source);
		seen.gershayimAfter += marks(fixed);
		const was = anchorsOf(source);
		const now = anchorsOf(fixed);
		if (was.length !== now.length) {
			seen.anchorDrift += 1;
		}
		seen.anchors += was.length;
		for (const [at, anchor] of was.entries()) {
			const key = `${source.rid}|${at}`;
			const repaired = now[at];
			if (resolves(anchor.dataRef, headwords)) {
				before.add(key);
			}
			if (repaired === undefined) {
				continue;
			}
			if (resolves(repaired.dataRef, healedHeadwords)) {
				after.add(key);
			}
			if (repaired.tag !== anchor.tag) {
				rewritten.add(key);
			}
		}
	}
	const gained = [...after].filter((key) => !before.has(key));
	expect({
		...seen,
		after: after.size,
		before: before.size,
		gained: gained.length,
		gainedNotRewritten: gained.filter((key) => !rewritten.has(key)),
		lost: [...before].filter((key) => !after.has(key)),
		rewritten: rewritten.size,
		rewrittenNotGained: [...rewritten].filter((key) => !gained.includes(key)),
	}).toEqual({
		after: 73_443,
		anchorDrift: 0,
		anchors: 170_182,
		before: 73_353,
		gained: 90,
		gainedNotRewritten: [],
		gershayimAfter: 2305,
		gershayimBefore: 0,
		lost: [],
		rewritten: 90,
		rewrittenNotGained: [],
	});
}, 300_000);

/**
 * Registry order-freedom, batch-3a spec §4.2 — the claim
 * `registry.ts`'s gershayim block makes, measured here rather than
 * asserted there.
 *
 * The test above already compares the two orders on every entry the
 * pair TOUCHES. This one compares them on every entry in the corpus,
 * because "the loci are disjoint" and "the pair is order-free" are
 * different claims: the second one also has to hold where neither
 * rule fires, and a rule that fired only under one order would show
 * up here and nowhere else.
 */
it('the pair is order-free against itself, over the whole corpus', async () => {
	let differing = 0;
	let seen = 0;
	for await (const source of readSourceEntries()) {
		seen += 1;
		const ab = gershayimRefAttribute.apply(
			gershayimInBody.apply(source).entry,
		).entry;
		const ba = gershayimInBody.apply(
			gershayimRefAttribute.apply(source).entry,
		).entry;
		if (JSON.stringify(ab) !== JSON.stringify(ba)) {
			differing += 1;
		}
	}
	expect(seen).toBe(32_512);
	expect(differing).toBe(0);
}, 300_000);

/**
 * The rtl trio, which is the one ordering rider the catalogue audit
 * actually named:
 *
 * > "Ordering dependency: if bare-rtl-hebrew runs first and wraps its
 * > 117, they migrate into this row's scope."
 *
 * They do not, and this is why the predicate reads codepoints instead
 * of markup context (spec §4.1): wrapping a bare Hebrew run in a
 * `<span dir="rtl">` moves no quote across the boundary between
 * document text and tag interior, because the quote's own neighbours
 * are unchanged. Run the trio before the pair and after it and the
 * corpus comes out byte-identical.
 *
 * Raw `apply` rather than `applyTransforms` on purpose: what is under
 * test is the composition, and routing it through the gates would
 * make a gate failure in some other rule read as an ordering defect
 * here. The gates judge this pair's output in the corpus test above.
 */
it('the pair is order-free against the rtl trio', async () => {
	const chain =
		(rules: readonly Rule[]) =>
		(source: SourceEntry): SourceEntry =>
			rules.reduce((carried, rule) => rule.apply(carried).entry, source);
	const both = chain(PAIR);
	const applyRtl = chain([
		redundantOuterRtl,
		bareRtlHebrew,
		latinTokenInsideRtl,
	]);
	let differing = 0;
	let seen = 0;
	for await (const source of readSourceEntries()) {
		seen += 1;
		const rtlFirst = both(applyRtl(source));
		const gershayimFirst = applyRtl(both(source));
		if (JSON.stringify(rtlFirst) !== JSON.stringify(gershayimFirst)) {
			differing += 1;
		}
	}
	// Pinned like the test above: `differing === 0` is also what an
	// empty walk reports, so the corpus size is part of the claim.
	expect(seen).toBe(32_512);
	expect(differing).toBe(0);
}, 300_000);
