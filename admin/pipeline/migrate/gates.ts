/** Gates 2, 3, 5, 6, 7, 8 of migrate spec §4.1, each a tally. Gate 1
 * (body round-trips), 4 (schema) and 9 (composition failures) live
 * with the composer and the CLI. */
import type { BodyEntry, SourceEntry } from '../body/types.ts';
import { tokenize } from '../transform/html.ts';
import { regenerateForm } from './headword.ts';
import type { PagePlacement } from './page.ts';
import { slugStem } from './slug.ts';
import type { Tally, TruthEntry } from './types.ts';

/** An empty tally: no marks, no failures. */
function tally(): Tally {
	return { failures: [], pass: 0, total: 0 };
}

/** Record one gate mark. Every call moves `total`, so a gate's total
 * is the count of things actually checked — which is what lets a 0/0
 * gate be read as "never ran" rather than "nothing was wrong". */
function mark(t: Tally, ok: boolean, failure: string): void {
	t.total++;
	if (ok) {
		t.pass++;
	} else {
		t.failures.push(failure);
	}
}

/** The text a reader sees, tags stripped. Gate 3 compares these, not
 * the markup, so a translation that only rewrites tags conserves it. */
function textOf(html: string): string {
	return tokenize(html)
		.filter((t) => t.kind === 'text')
		.map((t) => t.value)
		.join('');
}

/** Gate 2: every form regenerates to the composed string. */
function checkHeadwordRoundTrip(
	composed: SourceEntry,
	truth: TruthEntry,
	t: Tally,
): void {
	mark(
		t,
		regenerateForm(truth.headword) === composed.headword,
		`${composed.rid}: headword`,
	);
	const alts = composed.alt_headwords ?? [];
	const forms = truth.altHeadwords ?? [];
	mark(t, alts.length === forms.length, `${composed.rid}: alt count`);
	for (const [i, alt] of alts.entries()) {
		const form = forms[i];
		mark(
			t,
			form !== undefined && regenerateForm(form) === alt,
			`${composed.rid}: alt ${i}`,
		);
	}
}

/** The three fields `pairs` reads. `BodySense` and `TruthSense` both
 * satisfy it, so one neutral value can stand in for either side. */
interface WalkedSense {
	gloss: string;
	senses?: readonly WalkedSense[];
	units: readonly string[];
}

/** Stands in for an element the other side does not have, so the side
 * that DOES have it is still walked field by field. */
const ABSENT: WalkedSense = { gloss: '', senses: [], units: [] };

/** Every comparable text field of two sense trees, as
 * `[where, body, truth]` triples the caller marks one by one. */
function* pairs(
	body: readonly WalkedSense[],
	truth: readonly WalkedSense[],
	path: string,
): Generator<[string, string, string]> {
	// A length pair at EVERY depth, not only the two the caller marks.
	// Without one, an element present on a single side leaves no trace
	// whenever its own gloss is empty: this walk used to compare the
	// gloss ALONE for a surplus or missing element, so `['', '']`
	// passed while that element's `units` and child `senses` — which
	// is where its text actually lives — were never read at all.
	yield [`${path} length`, String(body.length), String(truth.length)];
	// Walked to the LONGER of the two: iterating body.entries() alone
	// only ever visits truth[0..body.length), so a sense or unit added
	// to truth with no body counterpart — output-only text — would
	// never reach a mark() and gate 3 would pass with it in place.
	const length = Math.max(body.length, truth.length);
	for (let i = 0; i < length; i++) {
		const b = body[i] ?? ABSENT;
		const t = truth[i] ?? ABSENT;
		const at = `${path}[${i}]`;
		yield [`${at}.gloss`, b.gloss, t.gloss];
		const unitLength = Math.max(b.units.length, t.units.length);
		for (let j = 0; j < unitLength; j++) {
			yield [`${at}.units[${j}]`, b.units[j] ?? '', t.units[j] ?? ''];
		}
		yield* pairs(b.senses ?? [], t.senses ?? [], `${at}.senses`);
	}
}

/** Gate 3: tag-stripped text agrees, field by field. A structural
 * count mark guards every array walked: a surplus element whose own
 * content is empty (e.g. a fabricated stem with `senses: []`) yields
 * no text pairs at all, so without a count it would leave no trace in
 * the tally. `pairs()` emits its own length pair per sense array, at
 * every depth, so only `stems` — which `pairs()` does not walk — is
 * counted here. */
function checkTextConservation(
	body: BodyEntry,
	truth: TruthEntry,
	t: Tally,
): void {
	for (const [where, before, after] of pairs(
		body.senses,
		truth.senses,
		'senses',
	)) {
		mark(t, textOf(before) === textOf(after), `${truth.id}: ${where}`);
	}
	// Walked to the LONGER of the two, same reason `pairs` is: iterating
	// `body.stems` alone would never visit a stem present only in
	// `truth`, and gate 3 would pass with output-only text in it.
	const stemsBody = body.stems ?? [];
	const stemsTruth = truth.stems ?? [];
	mark(
		t,
		stemsBody.length === stemsTruth.length,
		`${truth.id}: stems ${stemsBody.length} → ${stemsTruth.length}`,
	);
	const stemCount = Math.max(stemsBody.length, stemsTruth.length);
	for (let i = 0; i < stemCount; i++) {
		const stem = stemsBody[i];
		const target = stemsTruth[i];
		const stemSensesBody = stem?.senses ?? [];
		const stemSensesTruth = target?.senses ?? [];
		for (const [where, before, after] of pairs(
			stemSensesBody,
			stemSensesTruth,
			`stems[${i}].senses`,
		)) {
			mark(t, textOf(before) === textOf(after), `${truth.id}: ${where}`);
		}
	}
}

const RID = /^(?<letter>[A-Z])(?<seq>\d+)$/u;

/** Corpus order for two rids: letter first, then the sequence number
 * NUMERICALLY, so A00009 precedes A00010 as a plain string sort would
 * not. A rid that does not parse sorts as letter '' and sequence 0. */
function ridOrder(a: string, b: string): number {
	const ma = RID.exec(a)?.groups;
	const mb = RID.exec(b)?.groups;
	const la = ma?.['letter'] ?? '';
	const lb = mb?.['letter'] ?? '';
	return (
		la.localeCompare(lb) || Number(ma?.['seq'] ?? 0) - Number(mb?.['seq'] ?? 0)
	);
}

/** One hop of `checkChain`'s walk: resolves `link.next_hw` to the
 * entry it names, marking a failure (and returning `undefined`, which
 * halts the walk) when the name resolves to no headword or to a rid
 * outside the corpus — either would otherwise collapse to `undefined`
 * exactly like a legitimately absent `next_hw`. */
function resolveNext(
	t: Tally,
	link: SourceEntry,
	headwordMap: ReadonlyMap<string, string>,
	byRid: ReadonlyMap<string, SourceEntry>,
): SourceEntry | undefined {
	const next = link.next_hw;
	if (next === undefined) {
		return;
	}
	const rid = headwordMap.get(next);
	if (rid === undefined) {
		mark(t, false, `${link.rid}: next_hw "${next}" names no headword`);
		return;
	}
	const resolved = byRid.get(rid);
	if (resolved === undefined) {
		mark(
			t,
			false,
			`${link.rid}: next_hw "${next}" names a rid outside the corpus`,
		);
		return;
	}
	return resolved;
}

/** Gate 5: exactly one entry has no `prev_hw`, and following `next_hw`
 * from it visits every rid in rid order. See `resolveNext` for what a
 * corrupt `next_hw` link is rejected against. */
function checkChain(
	entries: readonly SourceEntry[],
	headwordMap: ReadonlyMap<string, string>,
): Tally {
	const t = tally();
	const sorted = entries.map((e) => e.rid).sort(ridOrder);
	const byRid = new Map(entries.map((e) => [e.rid, e]));
	// The head must be unique: `find()` would silently pick whichever
	// prev_hw-less entry comes first in `entries`, so two of them would
	// pass by array position instead of failing.
	const heads = entries.filter((e) => e.prev_hw === undefined);
	mark(
		t,
		heads.length === 1,
		`chain has ${heads.length} heads: ${heads.map((e) => e.rid).join(', ')}`,
	);
	if (heads.length !== 1) {
		for (const expected of sorted) {
			mark(t, false, `${expected}: chain not walked`);
		}
		return t;
	}
	let current: SourceEntry | undefined = heads[0];
	for (const expected of sorted) {
		mark(
			t,
			current?.rid === expected,
			`${expected}: chain has ${current?.rid ?? 'nothing'}`,
		);
		current =
			current === undefined
				? undefined
				: resolveNext(t, current, headwordMap, byRid);
	}
	// The loop above runs exactly `entries.length` times, so a chain
	// that revisits an earlier rid before reaching the end passes every
	// check above it and is never asked to terminate. Walking one more
	// hop past the last expected rid and requiring it to be undefined
	// rejects both a cycle and a dangling trailing link.
	mark(
		t,
		current === undefined,
		`chain does not terminate: next is ${current?.rid ?? 'nothing'}`,
	);
	return t;
}

/** Gate 7: unique slugs; a collided stem has no bare owner. */
function checkSlugs(
	forms: ReadonlyArray<{ rid: string; text: string }>,
	slugs: ReadonlyMap<string, string>,
): Tally {
	const t = tally();
	const seen = new Map<string, string>();
	const stems = new Map<string, number>();
	for (const { text } of forms) {
		const stem = slugStem(text);
		stems.set(stem, (stems.get(stem) ?? 0) + 1);
	}
	for (const { rid, text } of forms) {
		const slug = slugs.get(rid);
		const owner = slug === undefined ? undefined : seen.get(slug);
		const collided = (stems.get(slugStem(text)) ?? 0) > 1;
		const takenBy = owner === undefined ? '' : ` taken by ${owner}`;
		mark(
			t,
			slug !== undefined &&
				owner === undefined &&
				!(collided && slug === slugStem(text)),
			`${rid}: slug ${slug ?? '(none)'}${takenBy}`,
		);
		if (slug !== undefined) {
			seen.set(slug, rid);
		}
	}
	return t;
}

/** Gate 8: every entry has a page row with an a/b column. */
function checkPages(
	rids: readonly string[],
	pages: ReadonlyMap<string, PagePlacement>,
): Tally {
	const t = tally();
	for (const rid of rids) {
		mark(t, pages.has(rid), `${rid}: no page`);
	}
	return t;
}

export {
	checkChain,
	checkHeadwordRoundTrip,
	checkPages,
	checkSlugs,
	checkTextConservation,
	mark,
	tally,
	textOf,
};
