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
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { type Token, tokenize } from '../html.ts';
import { type Anchor, anchors } from '../links.ts';
import { applyTransforms } from '../run.ts';
import {
	ANAPHOR,
	antecedentOf,
	gapBetween,
	HREF_LOCUS,
	INTERVENING_CITATION,
	ibAnaphora,
	isCitation,
	isSifreCitation,
	isSinkMember,
	isSpentAnaphor,
	isTargumCitation,
	isTargumMember,
	REF_LOCUS,
	SIFRE_ANAPHOR,
	SIFRE_LABEL,
	SIFRE_WORK,
	sifreAnaphora,
	TARGUM_WORKS,
	targumAnaphora,
	targumWorkOf,
	textBetween,
	usable,
} from './anaphora.ts';
import { sourceEntries } from './corpus-fixture.ts';

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

it('declines an antecedent that ENCLOSES the anaphor rather than preceding it', () => {
	// Anchors nest (477 pairs in definition text). A citation anchor
	// whose `</a>` lands after the anaphor's `<a>` wraps it, so the
	// "text between" them is a backwards range and reads as empty —
	// the gap check would pass vacuously on the one shape it exists to
	// catch. Measured 0 such pairs corpus-wide (2026-08-23), so this is
	// a guard against a shape the corpus does not currently hold.
	const enclosing =
		'<a class="refLink" href="/Shabbat.30b" data-ref="Shabbat 30b">Sabb. 30ᵇ ' +
		'<a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">Ib.</a> tail</a>';
	const list = anchors(tokenize(enclosing));
	const at = list.findIndex(isSinkMember);
	expect(at).toBeGreaterThan(-1);
	const outer = list[at - 1];
	const inner = list[at];
	if (outer === undefined || inner === undefined) {
		throw new Error('expected an enclosing pair');
	}
	expect(outer.close).toBeGreaterThan(inner.open);
	expect(antecedentOf(tokenize(enclosing), list, at)).toBeUndefined();
	const out = run(entry('X00002', enclosing));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(enclosing);
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
	// "bot."/"top" are almost always the tail of the antecedent's OWN
	// citation, so they are not cues. The corpus cost of adding them is
	// measured below, in `POSITION_MARKER`'s own test.
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
	for (const e of await sourceEntries()) {
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
}, 180_000);

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
	for (const e of await sourceEntries()) {
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
}, 180_000);

/** The mechanism (audit §2c). Of every bare anaphor whose nearest
 * citation antecedent is a Jerusalem Talmud reference, ALL land on the
 * sink family; the rate for any other antecedent work is 3.2%. A real
 * counterexample would break the identification, so this is the row's
 * falsifier, run on every pass — and it now has zero survivors.
 *
 * It read `259 of 260` until the apostrophe fix (2026-08-24), with the
 * single exception explained as "O00242's anchor carries NO `data-ref`
 * at all". That was `links.ts`'s value class, not the corpus. O00242's
 * `Ib.` carries `Avot D'Rabbi Natan 1:7`, and once readable its nearest
 * citation antecedent is the `Avot D'Rabbi Natan 1:7` anchor two
 * sentences earlier — so it is not a Yerushalmi case at all and leaves
 * this population for `rest`, which is why `rest.total` moves 1,941 →
 * 1,942 while `jt.sink` does not move. */
it('every bare anaphor with a Jerusalem Talmud antecedent lands on Yoma 2a — all 259, no exception', async () => {
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
	expect(jt).toEqual({ sink: 259, total: 259 });
	expect(rest).toEqual({ sink: 62, total: 1942 });
});

/** The control (audit §3): bare anaphors OUTSIDE this population with a
 * citation antecedent. The linker's own resolution agrees with the
 * antecedent's target byte-for-byte in 997 of 1,880 (53.0%) — the
 * evidence that "Ib." means the antecedent, measured on data the
 * predicate was not fitted to. Had it come back near chance the row
 * would have gone to `judgment`. The antecedent here is the nearest
 * citation ANCHOR with no gap test, which is why the total differs from
 * the fire census.
 *
 * 996 until the apostrophe fix (2026-08-24). The extra agreement is
 * O00242, whose anaphor and antecedent are the SAME address
 * (`Avot D'Rabbi Natan 1:7`) and both unreadable under the old value
 * class. The total is unchanged at 1,880: the sighting was always
 * counted, only its comparison was blind. */
it('the control agrees with the antecedent in 997 of 1,880 outside the population', async () => {
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
	expect(exact).toBe(997);
});

/** The cost of the cue `INTERVENING_CITATION` deliberately omits, as a
 * number rather than a hedge.
 *
 * Task 7's docstring and audit both said `beg.`/`end.`/`top`/`bot.`
 * "trip on 92 of the 272 gaps" and that adding them would "decline a
 * third of the population". Review could not reproduce 92 under any
 * reading, and the correction (task 11, 2026-08-24) goes the other way:
 * 178 of 272, and 133 of the 209 members that actually FIRE — 64% of
 * the repairs, not a third of anything. The omission is more
 * load-bearing than it was described as being.
 *
 * Pinned here rather than restated in prose, because a figure that
 * lives only in a comment is exactly the one that was wrong. */
const POSITION_MARKER = /\bbeg\.|\bend\.|\btop\b|\bbot\./u;

it('the omitted position-marker cue would trip 178 of the 272 gaps and cost 133 of the 209 fires', async () => {
	let gaps = 0;
	let fires = 0;
	let marked = 0;
	let markedFires = 0;
	for await (const s of sightings()) {
		if (!isSinkMember(s.anchor)) {
			continue;
		}
		const prior = citationBefore(s);
		if (prior === undefined) {
			continue;
		}
		gaps++;
		const gap = gapBetween(s.tokens, s.list, prior.close + 1, s.anchor.open);
		const marker = POSITION_MARKER.test(gap);
		if (marker) {
			marked++;
		}
		if (!INTERVENING_CITATION.test(gap)) {
			fires++;
			if (marker) {
				markedFires++;
			}
		}
	}
	expect(gaps).toBe(272);
	expect(fires).toBe(209);
	expect(marked).toBe(178);
	expect(markedFires).toBe(133);
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

// ------------------------------------------------- sifre-ib-resolves-to-yalkut

/** E00476 הִיפָּטִיקוֹס, excerpt — the only member of the Sifré row the
 * entry's own input can repair, and the one instance in this batch
 * that exercises gate case 3. Three things have to be true at once and
 * all three are real bytes: the anchored `Sifré Deut. 309` supplies
 * the work, an unrelated `Yalk. ib. 542` sits BETWEEN it and the
 * anaphor (so the arm has to walk past a nearer citation of another
 * work), and the anaphor's own display carries the section number. */
const E00476 =
	'<a class="refLink" href="/Sifrei_Devarim.309.6" ' +
	'data-ref="Sifrei Devarim 309:6">Sifré Deut. 309</a> [read:] ' +
	'<span dir="rtl">אם היה ה׳ שגדול משניהם</span> if he were a hypaticos ' +
	'who is higher than either of them; ' +
	'<a class="refLink" href="/Yalkut_Shimoni_on_Torah.542" ' +
	'data-ref="Yalkut Shimoni on Torah 542">Yalk. ib. 542</a>.—Sifré ' +
	'<a class="refLink" href="/Yalkut_Shimoni_on_Torah.330.3" ' +
	'data-ref="Yalkut Shimoni on Torah 330:3">ib. 330</a>.—Pl. ' +
	'<span dir="rtl">הִיפָּטִיקִין</span>.';

/** V00301 תורמין, excerpt: `Sifré ib. 218` with a Yalkut antecedent and
 * no Sifré anchor anywhere in the entry. The work name `Sifrei
 * Devarim` would have to be invented out of the abbreviation plus the
 * book shown on the Yalkut anchor's DISPLAY — inference, not
 * movement. Four of its five siblings (K00811, N00892, Q01325,
 * T00064) are the same shape. */
const V00301_NO_SIFRE =
	', <a class="refLink" href="/Yalkut_Shimoni_on_Torah.929" ' +
	'data-ref="Yalkut Shimoni on Torah 929">Yalk. Deut. 929</a>; Sifré ' +
	'<a class="refLink" href="/Yalkut_Shimoni_on_Torah.218" ' +
	'data-ref="Yalkut Shimoni on Torah 218">ib. 218</a> (added in ed. Fr.)';

const sifre = (e: SourceEntry): { entry: SourceEntry; records: unknown[] } =>
	applyTransforms(e, 'text-repairs', [sifreAnaphora]);

it('Sifré ib. N composes the antecedent’s work with the display’s own number (gate case 3)', () => {
	const out = sifre(entry('E00476', E00476));
	expect(definitionOf(out)).toContain(
		'<a class="refLink" href="/Sifrei_Devarim.330" ' +
			'data-ref="Sifrei Devarim 330">ib. 330</a>',
	);
	expect(definitionOf(out)).not.toContain('Yalkut_Shimoni_on_Torah.330.3');
	expect(out.records).toHaveLength(1);
});

it('the compose is declared, and declared with the target the gate keys on', () => {
	const result = sifreAnaphora.apply(entry('E00476', E00476));
	// `link-target.ts` matches a claim to an anchor by
	// `claim.target === anchor.dataRef`, so a claim naming anything
	// else licenses nothing and the anchor fails as fabricated.
	expect(result.composed).toEqual([
		{ from: 'Sifrei Devarim 309:6', target: 'Sifrei Devarim 330' },
	]);
	expect(result.copied).toBeUndefined();
	expect(result.unlinks).toBeUndefined();
});

it('the compose is a pure attribute rewrite — every other byte is unchanged', () => {
	const after = definitionOf(sifre(entry('E00476', E00476))) ?? '';
	const undone = after.replace(
		'href="/Sifrei_Devarim.330" data-ref="Sifrei Devarim 330">ib. 330',
		'href="/Yalkut_Shimoni_on_Torah.330.3" ' +
			'data-ref="Yalkut Shimoni on Torah 330:3">ib. 330',
	);
	expect(undone).toBe(E00476);
});

it('declines when the entry holds no Sifré antecedent', () => {
	const out = sifre(entry('V00301', V00301_NO_SIFRE));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(V00301_NO_SIFRE);
	expect(
		sifreAnaphora.apply(entry('V00301', V00301_NO_SIFRE)).composed,
	).toBeUndefined();
});

it('the nearest citation is not the antecedent — only a Sifré anchor is', () => {
	// The arm must walk PAST `Yalk. ib. 542`, which is nearer. Copying
	// the nearest citation is what `ib-yoma-2a` does and what this row
	// must not do: it would rewrite one Yalkut target as another and
	// pass the gate, since both are in the entry's input set. That is
	// the gate's own "laundering between anchors" blind spot, so it has
	// to be caught here.
	const list = anchors(tokenize(E00476));
	const at = list.length - 1;
	expect(list[at]?.display).toBe('ib. 330');
	expect(antecedentOf(tokenize(E00476), list, at)?.dataRef).toBe(
		'Yalkut Shimoni on Torah 542',
	);
	expect(
		antecedentOf(tokenize(E00476), list, at, {
			accept: isSifreCitation,
			tolerate: () => true,
		})?.dataRef,
	).toBe('Sifrei Devarim 309:6');
});

it('leaves the row’s non-members alone: a bare ib., and an ib. N already on a Sifré work', () => {
	const bare =
		'<a class="refLink" href="/Sifrei_Devarim.309.6" ' +
		'data-ref="Sifrei Devarim 309:6">Sifré Deut. 309</a>; Sifré ' +
		'<a class="refLink" href="/Yalkut_Shimoni_on_Torah.330" ' +
		'data-ref="Yalkut Shimoni on Torah 330">ib.</a>';
	const already =
		'<a class="refLink" href="/Sifrei_Devarim.309.6" ' +
		'data-ref="Sifrei Devarim 309:6">Sifré Deut. 309</a>; Sifré ' +
		'<a class="refLink" href="/Sifrei_Devarim.330" ' +
		'data-ref="Sifrei Devarim 330">ib. 330</a>';
	for (const text of [bare, already]) {
		const out = sifre(entry('X00003', text));
		expect(out.records).toHaveLength(0);
		expect(definitionOf(out)).toBe(text);
	}
});

it('declines when the Sifré label is not the text immediately before the anchor', () => {
	// The label has to ABUT the anchor. A `Sifré` earlier in the
	// sentence with other prose between it and the `ib. N` is not this
	// construct, and adopting one would widen the arm past the six
	// members it reproduces.
	const distant =
		'<a class="refLink" href="/Sifrei_Devarim.309.6" ' +
		'data-ref="Sifrei Devarim 309:6">Sifré Deut. 309</a>; Sifré has it, ' +
		'but the reading in Yalk. is ' +
		'<a class="refLink" href="/Yalkut_Shimoni_on_Torah.330" ' +
		'data-ref="Yalkut Shimoni on Torah 330">ib. 330</a>';
	const out = sifre(entry('X00004', distant));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(distant);
});

/** The population pin. A rule that does nothing passes every gate, so
 * the six members are counted from the corpus on every `bun qa` rather
 * than trusted to the catalogue — which is 5, and wrong. */
interface SifreCensus {
	entries: Set<string>;
	fireEntries: Set<string>;
	fires: number;
	occurrences: number;
	sinks: Map<string, number>;
}

/**
 * Every usable `Sifré ib. N` anchor in the corpus, on TWO of the
 * arm's three conditions — the display and the abutting label, but NOT
 * `!dataRef.startsWith(SIFRE_WORK)`.
 *
 * Dropping the third is deliberate and is what makes the `sinks`
 * assertion below a real claim: measuring the population on the two
 * conditions that describe the CONSTRUCT, then reporting what the
 * linker did with each, is how "all 6 land on Yalkut and none on a
 * Sifré work" can be observed at all. Folding the sink test into the
 * population would make that assertion true by construction.
 *
 * Shaped like `sightings()` above for the same reason it exists: one
 * walk, so two readings of "the same" population cannot drift.
 */
async function* sifreSightings(): AsyncGenerator<Sighting> {
	for (const e of await sourceEntries()) {
		for (const definition of definitionsOf(e.content.senses, [])) {
			if (!definition.includes('<a')) {
				continue;
			}
			const tokens = tokenize(definition);
			const list = anchors(tokens);
			for (const [at, anchor] of list.entries()) {
				if (
					usable(anchor) &&
					SIFRE_ANAPHOR.test(anchor.display.trim()) &&
					SIFRE_LABEL.test(textBetween(tokens, 0, anchor.open))
				) {
					yield { anchor, at, list, rid: e.rid, tokens };
				}
			}
		}
	}
}

async function sifreCensus(): Promise<SifreCensus> {
	const entries = new Set<string>();
	const fireEntries = new Set<string>();
	const sinks = new Map<string, number>();
	let occurrences = 0;
	let fires = 0;
	for await (const s of sifreSightings()) {
		occurrences++;
		entries.add(s.rid);
		const work = s.anchor.dataRef.replace(REF_LOCUS, '');
		sinks.set(work, (sinks.get(work) ?? 0) + 1);
		if (
			antecedentOf(s.tokens, s.list, s.at, {
				accept: isSifreCitation,
				tolerate: () => true,
			}) !== undefined
		) {
			fires++;
			fireEntries.add(s.rid);
		}
	}
	return { entries, fireEntries, fires, occurrences, sinks };
}

let sifrePending: Promise<SifreCensus> | undefined;
function sifreCensusOnce(): Promise<SifreCensus> {
	sifrePending ??= sifreCensus();
	return sifrePending;
}

it('the Sifré population is 6 occurrences / 6 entries — one more than the catalogued 5', async () => {
	const { entries, occurrences } = await sifreCensusOnce();
	expect(occurrences).toBe(6);
	expect(entries.size).toBe(6);
}, 180_000);

it('all 6 land on Yalkut and none on a Sifré work — the row’s null model, refuted', async () => {
	// If the resolver ever handled `Sifré ib. N`, some member would
	// already be right. None is. Against the row's clean control
	// (`Sifrei Devarim` 402 anchors) that isolates the `ib.` form as
	// the whole of the defect.
	const { sinks } = await sifreCensusOnce();
	expect([...sinks]).toEqual([['Yalkut Shimoni on Torah', 6]]);
});

it('the Sifré decline census accounts for all 6: 1 fires, 5 hold no Sifré anchor', async () => {
	const { fireEntries, fires } = await sifreCensusOnce();
	expect(fires).toBe(1);
	expect(fireEntries).toEqual(new Set(['E00476']));
});

it('the rule itself moves exactly that 1 anchor over the whole corpus, adding and removing none', async () => {
	const rids = new Set<string>();
	let moved = 0;
	for (const e of await sourceEntries()) {
		const result = sifreAnaphora.apply(e);
		if (result.records.length === 0) {
			continue;
		}
		rids.add(e.rid);
		moved += result.composed?.length ?? 0;
		expect(anchorsIn(result.entry)).toBe(anchorsIn(e));
	}
	expect(moved).toBe(1);
	expect(rids).toEqual(new Set(['E00476']));
}, 180_000);

/** LOUD ON DRIFT (maintainer ruling 2026-08-23). `SIFRE_WORK` is a
 * prefix rather than a list of works, and that is only safe while
 * Sefaria spells every Sifré work this way. Sefaria's Torat Kohanim is
 * `Sifra, …`, which the prefix would miss — so if a re-fetch brings
 * one in, this fails here instead of the arm quietly under-firing. */
it('every Sifr… target in the corpus starts with SIFRE_WORK', async () => {
	const works = new Map<string, number>();
	for (const e of await sourceEntries()) {
		for (const definition of definitionsOf(e.content.senses, [])) {
			for (const anchor of anchors(tokenize(definition))) {
				if (!anchor.dataRef.startsWith('Sifr')) {
					continue;
				}
				const work = anchor.dataRef.replace(REF_LOCUS, '');
				works.set(work, (works.get(work) ?? 0) + 1);
			}
		}
	}
	expect([...works.keys()].every((w) => w.startsWith(SIFRE_WORK))).toBe(true);
	expect([...works].sort()).toEqual([
		['Sifrei Bamidbar', 193],
		['Sifrei Devarim', 402],
	]);
}, 180_000);

/** The two locus spellings `REF_LOCUS`/`HREF_LOCUS` have to strip, both
 * taken from real anchors. The range arm exists because the pin above
 * FAILED on the narrower pattern — 5 of the 402 `Sifrei Devarim`
 * anchors carry one — and a locus the strippers do not recognise makes
 * `repairSifreAnaphor` decline rather than mis-compose, which is safe
 * but is a silent under-fire. A third spelling fails here. */
it('REF_LOCUS and HREF_LOCUS strip both the plain and the range locus', () => {
	expect('Sifrei Devarim 309:6'.replace(REF_LOCUS, '')).toBe('Sifrei Devarim');
	expect('Sifrei Devarim 301:3-4'.replace(REF_LOCUS, '')).toBe(
		'Sifrei Devarim',
	);
	expect('Yalkut Shimoni on Torah 330'.replace(REF_LOCUS, '')).toBe(
		'Yalkut Shimoni on Torah',
	);
	expect('/Sifrei_Devarim.309.6'.replace(HREF_LOCUS, '')).toBe(
		'/Sifrei_Devarim',
	);
	expect('/Sifrei_Devarim.301.3-4'.replace(HREF_LOCUS, '')).toBe(
		'/Sifrei_Devarim',
	);
});

/**
 * EVERY CORPUS WALK IN THIS FILE CARRIES AN EXPLICIT 180s TIMEOUT, added
 * 2026-08-27 (fix/link-target-gate-cases). Eleven `it`s here read all
 * 32,512 entries and ran on bun's 5,000ms DEFAULT, several of them
 * within a few hundred milliseconds of it. Which one lost the race
 * depended on machine load, so the suite failed intermittently with a
 * timeout on a different test each run — a FALSE red, and one that
 * trains a reader to re-run rather than look.
 *
 * It is a timeout, not an assertion: nothing here is weakened, and the
 * figure matches the convention `registry.order.test.ts` already uses
 * for a corpus pass. Found while measuring case 7, where the extra
 * ~17% suite time made it fire more often; it reproduces on this branch
 * point without any of that work.
 */

/** Every Sifré-arm claim the corpus produces is one the GATE accepts.
 * `applyTransforms` runs `checkLinkTargets`, so this walk is the real
 * thing rather than a re-derivation of its rules — the distinction
 * that matters, since the arm's whole justification is that its
 * compose is licensable and the Targum arm's is not. */
it('every Sifré compose the corpus produces passes checkLinkTargets', async () => {
	let fired = 0;
	for (const e of await sourceEntries()) {
		const out = applyTransforms(e, 'text-repairs', [sifreAnaphora]);
		fired += out.records.length;
	}
	expect(fired).toBe(1);
}, 180_000);

// ------------------------------------------------------ ib-targum-work-loss

/** A00589 *אַוְורַקְסִין, excerpt — the plain different-book shape, and the
 * commonest of the nine. `Targ. Y. I Ex. XXXIX, 28` then `Ib.` then a
 * Leviticus verse: the work carries over, the book does not. */
const A00589 =
	'<i>trowsers</i>. <a class="refLink" ' +
	'href="/Targum_Jonathan_on_Exodus.39.28" ' +
	'data-ref="Targum Jonathan on Exodus 39:28">Targ. Y. I Ex. XXXIX, 28</a> ' +
	'<span dir="rtl">אוורקסי</span>. Ib. ' +
	'<a class="refLink" href="/Leviticus.6.3" ' +
	'data-ref="Leviticus 6:3">Lev. VI, 3</a> (ed. Vien.).';

/** M00567 מוֹפֵת ², excerpt — the SAME-book member, and the one that
 * settled the ruling. Its common prefix with the head eats the work
 * AND the book, leaving `6:22`, which case 3 still could not license
 * because the display writes `VI`. */
const M00567 =
	'<a class="refLink" href="/Onkelos_Deuteronomy.13.2" ' +
	'data-ref="Onkelos Deuteronomy 13:2">Targ. O. Deut. XIII, 2</a>; a. e.—Pl. ' +
	'<span dir="rtl">מוֹפְתִין</span>. Ib. ' +
	'<a class="refLink" href="/Deuteronomy.6.22" ' +
	'data-ref="Deuteronomy 6:22">Deut. VI, 22</a>. ' +
	'<a class="refLink" href="/Onkelos_Exodus.4.21" ' +
	'data-ref="Onkelos Exodus 4:21">Targ. O. Ex. IV, 21</a>; a. fr.';

/** C00446 גּוּס, excerpt — the CHAIN. The second `Ib.`'s nearest anchor
 * is the first member, which is itself defective, so the arm must walk
 * past it to the Targum anchor. Its display `Lev. IX, 7` also carries
 * the Roman numeral that `INTERVENING_CITATION` looks for, which is
 * why `gapBetween` has to mask text inside anchors. */
const C00446_CHAIN =
	' as h. Hif.—<a class="refLink" ' +
	'href="/Targum_Jonathan_on_Deuteronomy.17.20" ' +
	'data-ref="Targum Jonathan on Deuteronomy 17:20">Targ. Y. Deut. XVII, 20</a>' +
	'. Ib. <a class="refLink" href="/Leviticus.9.7" ' +
	'data-ref="Leviticus 9:7">Lev. IX, 7</a> ' +
	'<span dir="rtl">א׳ מנדעך</span> take courage. Ib. ' +
	'<a class="refLink" href="/Exodus.28.39" ' +
	'data-ref="Exodus 28:39">Ex. XXVIII, 39</a> the haughty.';

const targum = (e: SourceEntry): { entry: SourceEntry; records: unknown[] } =>
	applyTransforms(e, 'text-repairs', [targumAnaphora]);

/** The antecedent search with the SAME tolerance `repairTargumAnaphor`
 * ships — only a fellow row member may be stepped over. Restated once
 * here rather than at each call site: a test that passed the default
 * tolerance would be measuring a stricter rule than the one shipped,
 * and would have reported 8 fires for a rule that produces 9. */
const targumAntecedentOf = (
	tokens: readonly Token[],
	list: readonly Anchor[],
	at: number,
): Anchor | undefined =>
	antecedentOf(tokens, list, at, {
		accept: isTargumCitation,
		tolerate: (skipped: Anchor): boolean =>
			isTargumMember(textBetween(tokens, 0, skipped.open), skipped),
	});

it('a different-book ib. adopts the antecedent’s Targum work (gate case 4)', () => {
	const out = targum(entry('A00589', A00589));
	expect(definitionOf(out)).toContain(
		'<a class="refLink" href="/Targum_Jonathan_on_Leviticus.6.3" ' +
			'data-ref="Targum Jonathan on Leviticus 6:3">Lev. VI, 3</a>',
	);
	expect(out.records).toHaveLength(1);
});

it('the same-book member is repaired too — M00567, the one that carried the ruling', () => {
	const out = targum(entry('M00567', M00567));
	expect(definitionOf(out)).toContain(
		'<a class="refLink" href="/Onkelos_Deuteronomy.6.22" ' +
			'data-ref="Onkelos Deuteronomy 6:22">Deut. VI, 22</a>',
	);
	// The antecedent itself must NOT move: it is the head, not a member.
	expect(definitionOf(out)).toContain(
		'data-ref="Onkelos Deuteronomy 13:2">Targ. O. Deut. XIII, 2</a>',
	);
	expect(out.records).toHaveLength(1);
});

it('the C00446 chain repairs BOTH links, and both take the run’s opening work', () => {
	const result = targumAnaphora.apply(entry('C00446', C00446_CHAIN));
	// Both heads are the INPUT Targum anchor — never the first member's
	// repaired target, which is not in the input and could not be
	// declared. See `repairTargumAnaphor` on why that is the lawful
	// reading as well as the correct one.
	expect(result.recombined).toEqual([
		{
			head: 'Targum Jonathan on Deuteronomy 17:20',
			tail: 'Leviticus 9:7',
			target: 'Targum Jonathan on Leviticus 9:7',
		},
		{
			head: 'Targum Jonathan on Deuteronomy 17:20',
			tail: 'Exodus 28:39',
			target: 'Targum Jonathan on Exodus 28:39',
		},
	]);
	const after = definitionOf(result) ?? '';
	expect(after).toContain('data-ref="Targum Jonathan on Leviticus 9:7"');
	expect(after).toContain('data-ref="Targum Jonathan on Exodus 28:39"');
});

it('the chain’s second link would decline if the gap counted its sibling’s display', () => {
	// The regression this pins: `Lev. IX, 7` holds `IX,`, which is one
	// of INTERVENING_CITATION's four cues. Measuring the gap with
	// `textBetween` (anchor display included) declines the second link;
	// `gapBetween` masks text inside anchors and it fires. Neither
	// reading changes `ib-yoma-2a` — 272 of 272 gaps agree, 209 either
	// way — so this is the only place the difference is observable.
	const tokens = tokenize(C00446_CHAIN);
	const list = anchors(tokens);
	const at = list.length - 1;
	const [head] = list;
	const member = list[at];
	if (head === undefined || member === undefined) {
		throw new Error('expected a Targum antecedent and a chained member');
	}
	const naive = textBetween(tokens, head.close + 1, member.open);
	const masked = gapBetween(tokens, list, head.close + 1, member.open);
	expect(INTERVENING_CITATION.test(naive)).toBe(true);
	expect(INTERVENING_CITATION.test(masked)).toBe(false);
	expect(targumAntecedentOf(tokens, list, at)?.dataRef).toBe(
		'Targum Jonathan on Deuteronomy 17:20',
	);
});

it('the written target is the work joined to the anchor’s WHOLE own target', () => {
	// The invariant that puts case 4's derived-split abuse out of
	// reach. The head contributes a prefix ending in a separator, so no
	// digit of its own locus can enter; the tail is contributed whole,
	// so no sibling can be paired in. Checked on every fire below.
	for (const [rid, text] of [
		['A00589', A00589],
		['M00567', M00567],
		['C00446', C00446_CHAIN],
	] as const) {
		for (const claim of targumAnaphora.apply(entry(rid, text)).recombined ??
			[]) {
			const work = TARGUM_WORKS.find((w) => claim.target.startsWith(w));
			expect(work).toBeDefined();
			expect(claim.target).toBe(`${work ?? ''}${claim.tail}`);
			expect(claim.head.startsWith(work ?? '')).toBe(true);
		}
	}
});

it('declines when no Targum anchor precedes the ib.', () => {
	const noTargum =
		'<a class="refLink" href="/Chullin.139a" ' +
		'data-ref="Chullin 139a">Ḥull. 139ᵃ</a>. Ib. ' +
		'<a class="refLink" href="/Leviticus.6.3" ' +
		'data-ref="Leviticus 6:3">Lev. VI, 3</a>';
	const out = targum(entry('X00005', noTargum));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(noTargum);
	expect(
		targumAnaphora.apply(entry('X00005', noTargum)).recombined,
	).toBeUndefined();
});

it('declines when an UNANCHORED citation intervenes — the guard gapBetween keeps', () => {
	// Masking anchor text must not disarm restriction 2. Here the
	// Yerushalmi citation between the Targum anchor and the `Ib.` is
	// bare text, so it still trips the cue and the arm declines.
	const intervening =
		'<a class="refLink" href="/Onkelos_Genesis.24.16" ' +
		'data-ref="Onkelos Genesis 24:16">Targ. O. Gen. XXIV, 16</a>' +
		'.—Y. Yoma VI, 43ᵈ <span dir="rtl">אורכין</span> wait a while. Ib. ' +
		'<a class="refLink" href="/Numbers.12.8" ' +
		'data-ref="Numbers 12:8">Num. XII, 8</a>';
	const out = targum(entry('X00006', intervening));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(intervening);
});

it('leaves non-members alone: a lexical target, a folio, and an already-correct Targum ref', () => {
	const cases = [
		// A03251's shape — `Targ. O. ib.` before a Jastrow cross-reference.
		// Prepending a work to a headword would be nonsense.
		'<a class="refLink" href="/Genesis.10.17" ' +
			'data-ref="Genesis 10:17">Gen. X, 17</a>; Targ. O. ib. ' +
			'<a dir="rtl" class="refLink" href="/Jastrow,_אַנְתּוּסָאֵי.1" ' +
			'data-ref="Jastrow, אַנְתּוּסָאֵי 1">אַנְתּוּסָאֵי</a>',
		// A Talmud folio is not a book:chapter:verse and no work governs it.
		'<a class="refLink" href="/Onkelos_Genesis.24.16" ' +
			'data-ref="Onkelos Genesis 24:16">Targ. O. Gen. XXIV, 16</a>. Ib. ' +
			'<a class="refLink" href="/Chullin.139a" ' +
			'data-ref="Chullin 139a">Ḥull. 139ᵃ</a>',
		// The row's own control: the resolver got this one right.
		'<a class="refLink" href="/Onkelos_Genesis.24.16" ' +
			'data-ref="Onkelos Genesis 24:16">Targ. O. Gen. XXIV, 16</a>. Ib. ' +
			'<a class="refLink" href="/Onkelos_Numbers.12.8" ' +
			'data-ref="Onkelos Numbers 12:8">Targ. Num. XII, 8</a>',
	];
	for (const text of cases) {
		const out = targum(entry('X00007', text));
		expect(out.records).toHaveLength(0);
		expect(definitionOf(out)).toBe(text);
	}
});

it('declines when the antecedent’s href does not match the derived prefix', () => {
	// The `href` work prefix is spelled from the `data-ref` work by
	// Sefaria's URL convention, which is an assumption about URLs. It
	// is verified against the antecedent's real href rather than
	// trusted, so a respelling declines instead of minting.
	const oddHref =
		'<a class="refLink" href="/tj-deut.17.20" ' +
		'data-ref="Targum Jonathan on Deuteronomy 17:20">Targ. Y. Deut. XVII, 20</a>' +
		'. Ib. <a class="refLink" href="/Leviticus.9.7" ' +
		'data-ref="Leviticus 9:7">Lev. IX, 7</a>';
	const out = targum(entry('X00008', oddHref));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(oddHref);
});

/** The population pin. */
interface TargumCensus {
	entries: Set<string>;
	fireEntries: Set<string>;
	fires: number;
	occurrences: number;
}

async function* targumSightings(): AsyncGenerator<Sighting> {
	for (const e of await sourceEntries()) {
		for (const definition of definitionsOf(e.content.senses, [])) {
			if (!definition.includes('<a')) {
				continue;
			}
			const tokens = tokenize(definition);
			const list = anchors(tokens);
			for (const [at, anchor] of list.entries()) {
				if (
					usable(anchor) &&
					isTargumMember(textBetween(tokens, 0, anchor.open), anchor) &&
					list.slice(0, at).some((p) => usable(p) && isTargumCitation(p))
				) {
					yield { anchor, at, list, rid: e.rid, tokens };
				}
			}
		}
	}
}

async function targumCensus(): Promise<TargumCensus> {
	const entries = new Set<string>();
	const fireEntries = new Set<string>();
	let occurrences = 0;
	let fires = 0;
	for await (const s of targumSightings()) {
		occurrences++;
		entries.add(s.rid);
		if (targumAntecedentOf(s.tokens, s.list, s.at) !== undefined) {
			fires++;
			fireEntries.add(s.rid);
		}
	}
	return { entries, fireEntries, fires, occurrences };
}

let targumPending: Promise<TargumCensus> | undefined;
function targumCensusOnce(): Promise<TargumCensus> {
	targumPending ??= targumCensus();
	return targumPending;
}

it('the Targum population is 9 occurrences / 8 entries, reproducing the catalogued count', async () => {
	const { entries, occurrences } = await targumCensusOnce();
	expect(occurrences).toBe(9);
	expect(entries.size).toBe(8);
}, 180_000);

it('the Targum census accounts for all 9: 9 fire, 0 decline', async () => {
	const { fireEntries, fires } = await targumCensusOnce();
	expect(fires).toBe(9);
	expect(fireEntries).toEqual(
		new Set([
			'A00589',
			'A02457',
			'A02461',
			'C00446',
			'E00776',
			'G00622',
			'H00506',
			'M00567',
		]),
	);
});

it('8 of the 9 name a different book from their antecedent — the row’s null model', async () => {
	// "ib. means the same BOOK, so the plain verse is right" would make
	// the row noise. It cannot hold where the books differ, and they
	// differ in 8 of 9.
	let differing = 0;
	for await (const s of targumSightings()) {
		const head = targumAntecedentOf(s.tokens, s.list, s.at);
		if (head === undefined) {
			continue;
		}
		const work = targumWorkOf(head) ?? '';
		const headBook = head.dataRef.slice(work.length).replace(REF_LOCUS, '');
		if (headBook !== s.anchor.dataRef.replace(REF_LOCUS, '')) {
			differing++;
		}
	}
	expect(differing).toBe(8);
});

it('the rule moves exactly those 9 anchors corpus-wide, adding and removing none', async () => {
	const rids = new Set<string>();
	let moved = 0;
	for (const e of await sourceEntries()) {
		const result = targumAnaphora.apply(e);
		if (result.records.length === 0) {
			continue;
		}
		rids.add(e.rid);
		moved += result.recombined?.length ?? 0;
		expect(anchorsIn(result.entry)).toBe(anchorsIn(e));
	}
	expect(moved).toBe(9);
	expect(rids.size).toBe(8);
}, 180_000);

it('every Targum recombination the corpus produces passes checkLinkTargets', async () => {
	let fired = 0;
	for (const e of await sourceEntries()) {
		fired += applyTransforms(e, 'text-repairs', [targumAnaphora]).records
			.length;
	}
	expect(fired).toBe(8);
}, 180_000);

/** LOUD ON DRIFT. `TARGUM_WORKS` is the one enumerated list in this
 * module, so a sixth Sefaria spelling must fail here rather than
 * quietly shrink the arm. */
it('every Targum target in the corpus starts with one of TARGUM_WORKS', async () => {
	const unmatched = new Set<string>();
	const works = new Set<string>();
	for (const e of await sourceEntries()) {
		for (const definition of definitionsOf(e.content.senses, [])) {
			for (const anchor of anchors(tokenize(definition))) {
				if (!/Targum|Onkelos/u.test(anchor.dataRef)) {
					continue;
				}
				const work = targumWorkOf(anchor);
				if (work === undefined) {
					unmatched.add(anchor.dataRef);
				} else {
					works.add(anchor.dataRef.replace(REF_LOCUS, ''));
				}
			}
		}
	}
	expect([...unmatched]).toEqual([]);
	expect(works.size).toBe(45);
}, 180_000);

it('declines when an ANCHORED citation of another work intervenes', () => {
	// Reviewer finding, 2026-08-24. `accept` and `gapBetween` are each
	// sound and jointly unsafe: a skipping `accept` steps over an
	// anchored rival and `gapBetween` then masks its text, so it is
	// invisible to the walk AND to the cue. Here `ibidem` names
	// `Gen. XXIV, 17` — the plain Bible — and repairing would mint
	// `Onkelos Numbers 12:8`, which the gate cannot catch because case
	// 4 never checks the head/tail pairing. `tolerate` catches it
	// exactly, rather than hoping the fuzzy cue does.
	//
	// The corpus holds 0 instances today: 8 of the 9 members skip no
	// anchor at all, and C00446's second link skips exactly one, its
	// own row-member sibling, which is excused.
	const rival =
		'<a class="refLink" href="/Onkelos_Genesis.24.16" ' +
		'data-ref="Onkelos Genesis 24:16">Targ. O. Gen. XXIV, 16</a> ' +
		'<span dir="rtl">למיחזי</span> ' +
		'<a class="refLink" href="/Genesis.24.17" ' +
		'data-ref="Genesis 24:17">Gen. XXIV, 17</a> and so. Ib. ' +
		'<a class="refLink" href="/Numbers.12.8" ' +
		'data-ref="Numbers 12:8">Num. XII, 8</a>';
	const out = targum(entry('X00009', rival));
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(rival);
	expect(
		targumAnaphora.apply(entry('X00009', rival)).recombined,
	).toBeUndefined();

	// And the reason is the rival anchor specifically, not the cue:
	// masking leaves the gap clean, so without `tolerate` this fires.
	const tokens = tokenize(rival);
	const list = anchors(tokens);
	const at = list.length - 1;
	const [head] = list;
	const member = list[at];
	if (head === undefined || member === undefined) {
		throw new Error('expected an antecedent and a member');
	}
	expect(
		INTERVENING_CITATION.test(
			gapBetween(tokens, list, head.close + 1, member.open),
		),
	).toBe(false);
	expect(
		antecedentOf(tokens, list, at, { accept: isTargumCitation })?.dataRef,
	).toBeUndefined();
	expect(targumAntecedentOf(tokens, list, at)).toBeUndefined();
});

it('tolerate is vacuous for ib-yoma-2a — no member skips a usable citation', async () => {
	// Its `accept` is `isCitation`, so every anchor it steps over
	// already fails `usable`, fails `isCitation`, or is a spent
	// anaphor. The new check therefore cannot fire for it, which is
	// why 209/188 is unchanged. Proved over the corpus rather than
	// argued from the predicate.
	let skippedCitations = 0;
	for await (const s of sightings()) {
		if (!isSinkMember(s.anchor)) {
			continue;
		}
		const found = s.list
			.slice(0, s.at)
			.map((prior, index): [Anchor, number] => [prior, index])
			.reverse()
			.find(([p]) => usable(p) && !isSpentAnaphor(p) && isCitation(p));
		if (found === undefined) {
			continue;
		}
		skippedCitations += s.list
			.slice(found[1] + 1, s.at)
			.filter((p) => usable(p) && isCitation(p) && !isSpentAnaphor(p)).length;
	}
	expect(skippedCitations).toBe(0);
});

it('the Targum arm skips exactly one anchor corpus-wide, and it is a row member', async () => {
	// The measurement behind "0 live instances". 8 members skip
	// nothing; C00446's second link skips its own sibling.
	let skipped = 0;
	let excused = 0;
	for await (const s of targumSightings()) {
		const found = s.list
			.slice(0, s.at)
			.map((prior, index): [Anchor, number] => [prior, index])
			.reverse()
			.find(([p]) => usable(p) && !isSpentAnaphor(p) && isTargumCitation(p));
		if (found === undefined) {
			continue;
		}
		for (const p of s.list.slice(found[1] + 1, s.at)) {
			if (!(usable(p) && isCitation(p) && !isSpentAnaphor(p))) {
				continue;
			}
			skipped++;
			if (isTargumMember(textBetween(s.tokens, 0, p.open), p)) {
				excused++;
			}
		}
	}
	expect(skipped).toBe(1);
	expect(excused).toBe(1);
});

it('the Targum population’s 0 declines is partly definitional — 77 of 86 fall outside it', async () => {
	// `isTargumMember` alone selects 86; requiring a preceding Targum
	// anchor excludes 77, leaving the 9. So "9 fire, 0 decline" means
	// every member of a Targum-context row is repairable, NOT that the
	// walk never refuses — the commonest refusal is outside the census
	// by construction. Pinned so the framing cannot drift from it.
	let members = 0;
	let withTargum = 0;
	for (const e of await sourceEntries()) {
		for (const definition of definitionsOf(e.content.senses, [])) {
			if (!definition.includes('<a')) {
				continue;
			}
			const tokens = tokenize(definition);
			const list = anchors(tokens);
			for (const [at, anchor] of list.entries()) {
				if (
					!(
						usable(anchor) &&
						isTargumMember(textBetween(tokens, 0, anchor.open), anchor)
					)
				) {
					continue;
				}
				members++;
				if (list.slice(0, at).some((p) => usable(p) && isTargumCitation(p))) {
					withTargum++;
				}
			}
		}
	}
	// 85 until the apostrophe fix (2026-08-24). The 86th is U02038,
	// whose anchor `data-ref="Tosefta Shevi'it 2:5"` was unreadable
	// under the old value class; it joins the outside-the-census side,
	// so `withTargum` does not move and the framing is unaffected.
	expect(members).toBe(86);
	expect(withTargum).toBe(9);
}, 180_000);
