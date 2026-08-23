/**
 * `ib-yoma-2a` (batch-2 task 7). Every number in `anaphora.ts`'s module
 * doc and in `data/patches/catalogue-audit/ib-yoma-2a.md` came from a
 * corpus walk of the shape `sightings()` runs below — recursive through
 * `sense.senses` (senses nest) and `anchors(tokenize(definition))` for
 * the anchors. The corpus-walking tests re-run every load-bearing claim
 * (population, fire count, the whole decline census, the control that
 * validates the repair, the mechanism that identifies the defect, and
 * the absence of any locus a compose could have used) so a corpus edit
 * or a narrowed predicate fails here, on every `bun qa`, rather than
 * only on a `bun transform:count` someone remembers to run.
 *
 * The unit tests run through `applyTransforms`, not `ibAnaphora.apply`,
 * so `link-target.ts`'s gate — the whole reason this batch exists —
 * runs on every fixture. A rule writing a target the entry does not
 * hold would throw here rather than pass quietly.
 */
import { expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { type Token, tokenize } from '../html.ts';
import { type Anchor, anchors } from '../links.ts';
import { applyTransforms } from '../run.ts';
import {
	ANAPHOR,
	antecedentOf,
	INTERVENING_CITATION,
	ibAnaphora,
	isSinkMember,
	isSpentAnaphor,
	usable,
} from './anaphora.ts';

const SINK = 'Yoma 2a';
const LEXICAL = 'Jastrow, ';

const entry = (rid: string, ...definitions: string[]): SourceEntry =>
	({
		content: { senses: definitions.map((definition) => ({ definition })) },
		headword: 'אַדְרָא',
		rid,
	}) as SourceEntry;

const definitionOf = (
	out: { entry: SourceEntry },
	at = 0,
): string | undefined => out.entry.content.senses[at]?.definition;

const run = (e: SourceEntry): { entry: SourceEntry; records: unknown[] } =>
	applyTransforms(e, 'text-repairs', [ibAnaphora]);

/** A00445 אַדְרָא, excerpt — the catalogue's worked example, bytes from
 * `data/source/jastrow-dictionary.jsonl`. Three anchors: a `Jastrow, …`
 * cross-reference (skipped — a headword is not a place), the Yerushalmi
 * citation that IS the antecedent, and the bare `Ib.` that fell to the
 * sink. The antecedent's `href` carries no leading slash while the
 * sink's does; the repair copies its spelling verbatim rather than
 * normalising it. */
const A00445 =
	' (v. <a dir="rtl" class="refLink" href="/Jastrow,_אָדַר.1" ' +
	'data-ref="Jastrow, אָדַר 1">אָדַר</a> 3) <i>skin, hide</i>. ' +
	'<a class="refLink" href="Jerusalem_Talmud_Maaser_Sheni.4.6.11" ' +
	'data-ref="Jerusalem Talmud Maaser Sheni 4:6:11">Y. Maas. Sh. IV, 55ᶜ</a> ' +
	'<span dir="rtl">אדר תורתא</span> hide of a cow. ' +
	'<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">Ib.</a> ' +
	'<span dir="rtl">אדרא</span>';

/** A03210 אָרַס, excerpt: the antecedent ("Y. Bets. V, 63ᵃ bot.") is
 * PRINTED but never anchored, so the first anchor is the sink itself. */
const A03210_NO_ANCHOR =
	'to betroth to one’s self. Y. Bets. V, 63ᵃ bot. ' +
	'<span dir="rtl">לְאָרֵס</span>. ' +
	'<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">Ib.</a> ' +
	'<span dir="rtl">הא לארס יְאָרֵס</span> but betroth he may';

/** C00103 גִּיבּוּל, excerpt: the only preceding anchor is a
 * `Jastrow, …` cross-reference; the real antecedent is unanchored. */
const C00103_LEXICAL_ONLY =
	'same. Y. Ter. V, 43ᶜ bot. <span dir="rtl">הפריש ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_גְּבִישָׁתָא.1" ' +
	'data-ref="Jastrow, גְּבִישָׁתָא 1">גי׳</a></span> he set apart. ' +
	'<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">Ib.</a> ' +
	'<span dir="rtl">מיגבול חמש</span>';

/** A03095 אָרַךְ, excerpt: an anchored Targum antecedent, then TWO
 * unanchored Yerushalmi citations, then the sink. The nearest ANCHOR is
 * not the nearest CITATION — copying it would write a different work
 * past a gate that cannot see it. */
const A03095_INTERVENING =
	'<a class="refLink" href="/Aramaic_Targum_to_Job.6.11" ' +
	'data-ref="Aramaic Targum to Job 6:11">Targ. Job VI, 11</a>' +
	'.—Y. Yoma VI, 43ᵈ <span dir="rtl">אורכין צבחר</span> wait a while. ' +
	'Y. R. Hash. I, 57ᵃ bot. <span dir="rtl">הוות מוֹרְכָה וכ׳</span> ' +
	'she waited a whole year. ' +
	'<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">Ib.</a> ' +
	'<span dir="rtl">מוֹרְכָא</span>';

it('a bare Ib. copies the antecedent citation’s target whole (gate case 2)', () => {
	const out = run(entry('A00445', A00445));
	expect(definitionOf(out)).toContain(
		'<a class="refLink" href="Jerusalem_Talmud_Maaser_Sheni.4.6.11" ' +
			'data-ref="Jerusalem Talmud Maaser Sheni 4:6:11">Ib.</a>',
	);
	expect(definitionOf(out)).not.toContain(SINK);
	expect(out.records).toHaveLength(1);
});

it('the copy is a pure attribute rewrite — every other byte is unchanged', () => {
	const after = definitionOf(run(entry('A00445', A00445))) ?? '';
	const undone = after.replace(
		'href="Jerusalem_Talmud_Maaser_Sheni.4.6.11" ' +
			'data-ref="Jerusalem Talmud Maaser Sheni 4:6:11">Ib.',
		'href="/Yoma.2a" data-ref="Yoma 2a">Ib.',
	);
	expect(undone).toBe(A00445);
});

it('declares nothing: no composed claim, no copied strings, no unlinks', () => {
	const result = ibAnaphora.apply(entry('A00445', A00445));
	expect(result.composed).toBeUndefined();
	expect(result.copied).toBeUndefined();
	expect(result.unlinks).toBeUndefined();
});

it('declines when the definition holds no preceding anchor at all', () => {
	const out = run(entry('A03210', A03210_NO_ANCHOR));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(A03210_NO_ANCHOR);
});

it('declines when every preceding anchor is a Jastrow cross-reference', () => {
	const out = run(entry('C00103', C00103_LEXICAL_ONLY));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(C00103_LEXICAL_ONLY);
});

it('declines when an unanchored citation intervenes', () => {
	const out = run(entry('A03095', A03095_INTERVENING));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(A03095_INTERVENING);
});

it('leaves non-members alone: an Ib. outside the sink, and a sink anchor that is not an anaphor', () => {
	const other =
		'<a class="refLink" href="/Gittin.43b" data-ref="Gittin 43b:8">Git. 43ᵇ</a> ' +
		'<a class="refLink" href="/Gittin.43b" data-ref="Gittin 43b:9">Ib.</a> and ' +
		'<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">Yoma 2ᵃ</a>';
	const out = run(entry('X00000', other));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(other);
});

it('a locus in the display is declined, not composed', () => {
	// Synthetic: no member carries a locus (audit §6), so this shape
	// exists only to pin the refusal. `Ib. 35ᵃ` is not a bare anaphor,
	// so the population predicate rejects it and no `composed` claim is
	// ever produced.
	const withLocus =
		'<a class="refLink" href="/Shabbat.30b" data-ref="Shabbat 30b">Sabb. 30ᵇ</a> ' +
		'<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">Ib. 35ᵃ</a>';
	const result = ibAnaphora.apply(entry('X00001', withLocus));
	expect(result.records).toHaveLength(0);
	expect(result.composed).toBeUndefined();
	expect(definitionOf(result)).toBe(withLocus);
});

it('repairs a member inside a nested sense, recursing through sense.senses', () => {
	const nested = {
		content: {
			senses: [{ definition: 'outer.', senses: [{ definition: A00445 }] }],
		},
		headword: 'אַדְרָא',
		rid: 'A00445',
	} as SourceEntry;
	const out = applyTransforms(nested, 'text-repairs', [ibAnaphora]);
	expect(out.entry.content.senses[0]?.senses?.[0]?.definition).toContain(
		'data-ref="Jerusalem Talmud Maaser Sheni 4:6:11">Ib.',
	);
	expect(out.records).toHaveLength(1);
});

it('INTERVENING_CITATION reads the four cues and ignores the antecedent’s own tail', () => {
	// "bot."/"top" trip 92 of the 272 gaps and are almost always the
	// tail of the antecedent's OWN citation, so they are not cues.
	expect(INTERVENING_CITATION.test(' bot. חֲמָרְתִּי my ass. ')).toBe(false);
	expect(INTERVENING_CITATION.test(' top ולא מ׳. Ib. יש לו מ׳ ')).toBe(false);
	expect(INTERVENING_CITATION.test('.—Y. Yoma VI, 43ᵈ wait a while. ')).toBe(
		true,
	);
	expect(INTERVENING_CITATION.test(' (v. Taan. l. c.).—V. ')).toBe(true);
	expect(INTERVENING_CITATION.test(' Gen. R. s. 31 ')).toBe(true);
});

// ---------------------------------------------------------------- corpus

interface Sighting {
	anchor: Anchor;
	at: number;
	list: readonly Anchor[];
	rid: string;
	tokens: readonly Token[];
}

function definitionsOf(
	senses: readonly SourceSense[],
	out: string[],
): string[] {
	for (const sense of senses) {
		if (sense.definition !== undefined) {
			out.push(sense.definition);
		}
		if (sense.senses !== undefined) {
			definitionsOf(sense.senses, out);
		}
	}
	return out;
}

/** Every usable bare-anaphor anchor in the corpus, in document order,
 * with the context each measurement needs. One generator rather than a
 * walk per test: the walks were byte-identical apart from their
 * predicate, and duplicating them is how two readings of "the same"
 * population drift apart. */
async function* sightings(): AsyncGenerator<Sighting> {
	for await (const e of readSourceEntries()) {
		for (const definition of definitionsOf(e.content.senses, [])) {
			if (!definition.includes('<a')) {
				continue;
			}
			const tokens = tokenize(definition);
			const list = anchors(tokens);
			for (const [at, anchor] of list.entries()) {
				if (usable(anchor) && ANAPHOR.test(anchor.display.trim())) {
					yield { anchor, at, list, rid: e.rid, tokens };
				}
			}
		}
	}
}

/** The nearest preceding CITATION anchor, ignoring the gap test — the
 * antecedent `antecedentOf` starts from. */
function citationBefore(s: Sighting): Anchor | undefined {
	return s.list
		.slice(0, s.at)
		.reverse()
		.find(
			(p) =>
				usable(p) &&
				!isSpentAnaphor(p) &&
				p.dataRef !== '' &&
				!p.dataRef.startsWith(LEXICAL),
		);
}

type Disposition =
	| 'fire'
	| 'intervening'
	| 'lexical-only'
	| 'no-anchor'
	| 'spent-only';

/** Why this member fires or declines. `antecedentOf` decides "fire";
 * the decline REASONS are re-derived here, since the rule itself only
 * needs "antecedent or not". */
function dispositionOf(s: Sighting): Disposition {
	if (antecedentOf(s.tokens, s.list, s.at) !== undefined) {
		return 'fire';
	}
	const priors = s.list.slice(0, s.at).filter(usable);
	if (priors.length === 0) {
		return 'no-anchor';
	}
	if (priors.every(isSpentAnaphor)) {
		return 'spent-only';
	}
	return citationBefore(s) === undefined ? 'lexical-only' : 'intervening';
}

interface Census {
	dispositions: Map<Disposition, number>;
	entries: Set<string>;
	fireEntries: Set<string>;
	occurrences: number;
}

async function census(): Promise<Census> {
	const dispositions = new Map<Disposition, number>();
	const entries = new Set<string>();
	const fireEntries = new Set<string>();
	let occurrences = 0;
	for await (const s of sightings()) {
		if (!isSinkMember(s.anchor)) {
			continue;
		}
		occurrences++;
		entries.add(s.rid);
		const what = dispositionOf(s);
		dispositions.set(what, (dispositions.get(what) ?? 0) + 1);
		if (what === 'fire') {
			fireEntries.add(s.rid);
		}
	}
	return { dispositions, entries, fireEntries, occurrences };
}

/** One shared walk: the corpus is 32,512 entries and re-streaming it
 * per assertion is the cost `count.ts` avoids for the same reason. */
let pending: Promise<Census> | undefined;
function censusOnce(): Promise<Census> {
	pending ??= census();
	return pending;
}

it('the population is 312 occurrences / 274 entries, reproducing the catalogued corpusCount to the occurrence', async () => {
	const { entries, occurrences } = await censusOnce();
	expect(occurrences).toBe(312);
	expect(entries.size).toBe(274);
});

it('the decline census accounts for all 312: 209 fire, 103 decline (23 + 2 + 15 + 63)', async () => {
	const { dispositions, fireEntries } = await censusOnce();
	expect(dispositions.get('fire')).toBe(209);
	expect(dispositions.get('no-anchor')).toBe(23);
	expect(dispositions.get('spent-only')).toBe(2);
	expect(dispositions.get('lexical-only')).toBe(15);
	expect(dispositions.get('intervening')).toBe(63);
	expect([...dispositions.values()].reduce((a, b) => a + b, 0)).toBe(312);
	// What `bun transform:count` reports is ENTRIES, not occurrences —
	// this number is the whole of its delta against the catalogued 312.
	expect(fireEntries.size).toBe(188);
});

const sinksIn = (e: SourceEntry): number =>
	(
		definitionsOf(e.content.senses, [])
			.join(' ')
			.match(/data-ref="Yoma 2a"/gu) ?? []
	).length;

const anchorsIn = (e: SourceEntry): number =>
	definitionsOf(e.content.senses, []).flatMap((d) => anchors(tokenize(d)))
		.length;

it('the rule moves exactly those 209 anchors, and adds or removes none, over the whole corpus', async () => {
	let moved = 0;
	let unchangedCounts = 0;
	const rids = new Set<string>();
	for await (const e of readSourceEntries()) {
		const result = ibAnaphora.apply(e);
		if (result.records.length === 0) {
			continue;
		}
		rids.add(e.rid);
		moved += sinksIn(e) - sinksIn(result.entry);
		if (anchorsIn(result.entry) === anchorsIn(e)) {
			unchangedCounts++;
		}
	}
	expect(moved).toBe(209);
	expect(rids.size).toBe(188);
	expect(unchangedCounts).toBe(188);
});

/** The mechanism (audit §2c). Of every bare anaphor whose nearest
 * citation antecedent is a Jerusalem Talmud reference, all but one land
 * on the sink family; the rate for any other antecedent work is 3.2%.
 * The exception, O00242, is not a rival resolution — its anchor carries
 * NO `data-ref` at all, so the linker produced no address rather than a
 * different one. A real counterexample would break the identification,
 * so this is the row's falsifier, run on every pass. */
it('every bare anaphor with a Jerusalem Talmud antecedent lands on Yoma 2a — 259 of 260, the exception having no data-ref at all', async () => {
	const jt = { sink: 0, total: 0 };
	const rest = { sink: 0, total: 0 };
	for await (const s of sightings()) {
		const prior = citationBefore(s);
		if (prior === undefined) {
			continue;
		}
		const side = prior.dataRef.startsWith('Jerusalem Talmud') ? jt : rest;
		side.total++;
		if (s.anchor.dataRef.startsWith(SINK)) {
			side.sink++;
		}
	}
	expect(jt).toEqual({ sink: 259, total: 260 });
	expect(rest).toEqual({ sink: 62, total: 1941 });
});

/** The control (audit §3): bare anaphors OUTSIDE this population with a
 * citation antecedent. The linker's own resolution agrees with the
 * antecedent's target byte-for-byte in 996 of 1,880 (53.0%) — the
 * evidence that "Ib." means the antecedent, measured on data the
 * predicate was not fitted to. Had it come back near chance the row
 * would have gone to `judgment`. The antecedent here is the nearest
 * citation ANCHOR with no gap test, which is why the total differs from
 * the fire census. */
it('the control agrees with the antecedent in 996 of 1,880 outside the population', async () => {
	let total = 0;
	let exact = 0;
	for await (const s of sightings()) {
		if (s.anchor.dataRef.startsWith(SINK)) {
			continue;
		}
		const prior = citationBefore(s);
		if (prior === undefined) {
			continue;
		}
		total++;
		if (prior.dataRef === s.anchor.dataRef) {
			exact++;
		}
	}
	expect(total).toBe(1880);
	expect(exact).toBe(996);
});

/** Compose is unreachable (audit §6): no member's display carries a
 * locus (true by the population's definition) and no member's FOLLOWING
 * text does either, so gate case 3 has no remainder to license. A
 * future corpus edit that introduces one fails here rather than
 * silently going unrepaired. */
const LOCUS = /^[\s,]*(?:[IVXLC]+\s*,|\d|[ᵃᵇᶜᵈ])/u;

function tailAfter(s: Sighting): string {
	let tail = '';
	for (const token of s.tokens.slice(s.anchor.close + 1)) {
		if (token.kind !== 'text') {
			break;
		}
		tail += token.value;
	}
	return tail;
}

it('0 of the 312 carry a locus the display or its following text could supply', async () => {
	let members = 0;
	let withLocus = 0;
	for await (const s of sightings()) {
		if (!isSinkMember(s.anchor)) {
			continue;
		}
		members++;
		// `.slice(3)` drops the "Ib."/"ib." itself, leaving whatever the
		// display shows past it — nothing, in every member.
		if (
			LOCUS.test(s.anchor.display.trim().slice(3)) ||
			LOCUS.test(tailAfter(s))
		) {
			withLocus++;
		}
	}
	expect(members).toBe(312);
	expect(withLocus).toBe(0);
});
