// biome-ignore-all lint/style/noExcessiveLinesPerFile: the nine blessing gates in one place, so the set a run checks is readable at a glance.
/** Gates 2, 3, 5, 6, 7, 8 of migrate spec §4.1, each a tally. Gate 1
 * (body round-trips), 4 (schema) and 9 (composition failures) live
 * with the composer and the CLI. */
import type { BodyEntry, SourceEntry } from '../body/types.ts';
import { tokenize } from '../transform/html.ts';
import { nameCollisions } from './names.ts';
import type { PagePlacement } from './page.ts';
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

/** The headword line as the composed entry holds it: Sefaria's
 * `headword`, then its `alt_headwords`, in source order. */
function headwordLine(composed: SourceEntry): string {
	return [composed.headword, ...(composed.alt_headwords ?? [])].join(' ');
}

/** Hebrew letters, points, geresh, gershayim and the combining dot
 * above, in order, with everything else dropped. Written out by CODE
 * POINT here rather than imported from the parser: gate 2 is the check
 * ON the parser, and sharing its predicate would put the same code on
 * both sides of the comparison. */
function lexicalOf(line: string): string {
	let out = '';
	for (const ch of line) {
		const c = ch.codePointAt(0) ?? 0;
		if (
			(c >= 0x05_d0 && c <= 0x05_ea) ||
			(c >= 0x05_91 && c <= 0x05_c7) ||
			c === 0x05_f3 ||
			c === 0x05_f4 ||
			c === 0x03_07
		) {
			out += ch;
		}
	}
	return out;
}

/** A `{n}` slot in a display template; group 1 is the form index. */
const SLOT = /\{(\d+)\}/gu;
/** A Latin run, taken whole so a Roman numeral is ONE token: `II` must
 * not count as two `I`s against a line that really holds two. */
const LATIN_RUN = /[A-Za-z]+/gu;
/** The only Latin runs print sets on a headword line: a Roman numeral
 * and the two gender labels. Anything else is a text defect. */
const LATIN_ALLOWED = /^(?:[IVXLC]+|[mf])$/u;

/** The notation of a line as a MULTISET: token → how many times the
 * line sets it. Every non-Hebrew, non-space character counts, with
 * Latin runs kept whole so `II` is one token rather than two `I`s.
 *
 * A counted map rather than a sorted list, which is what a multiset
 * comparison actually needs. The list had to be sorted to be
 * comparable, and a sort ordered by nothing in particular is a
 * question a reader should not have to answer — the order carried no
 * meaning, only the counts ever did.
 *
 * **Commas are excluded, on both sides.** The upstream split cut
 * print's line at its separators and did not keep them (headword
 * design §1), so the source's comma count is not the line's; §4 rules
 * that the app supplies separators, and the template's `, ` is
 * supplied rather than recovered. Counting them would compare a number
 * the source does not carry against one the parser invented. */
function notationOf(line: string): Map<string, number> {
	const counts = new Map<string, number>();
	const bump = (token: string): void => {
		counts.set(token, (counts.get(token) ?? 0) + 1);
	};
	for (const run of line.match(LATIN_RUN) ?? []) {
		bump(run);
	}
	for (const ch of line.replace(LATIN_RUN, '')) {
		const c = ch.codePointAt(0) ?? 0;
		const hebrew =
			(c >= 0x05d0 && c <= 0x05ea) ||
			(c >= 0x0591 && c <= 0x05c7) ||
			c === 0x05f3 ||
			c === 0x05f4 ||
			c === 0x0307;
		if (!(hebrew || ch === ',' || ch.trim() === '')) {
			bump(ch);
		}
	}
	return counts;
}

/** Two notation multisets agree. */
function sameNotation(
	a: ReadonlyMap<string, number>,
	b: ReadonlyMap<string, number>,
): boolean {
	if (a.size !== b.size) {
		return false;
	}
	for (const [token, n] of a) {
		if (b.get(token) !== n) {
			return false;
		}
	}
	return true;
}

/** A multiset for a failure message, in the order the line sets each
 * token — which reads closer to the line than any sort would. */
function renderNotation(counts: ReadonlyMap<string, number>): string {
	return [...counts].map(([token, n]) => `${token}×${n}`).join(' ');
}

/** Whether the source line is one no parser can lay out: its
 * parentheses do not balance (headword design §4's H2 rows and
 * A01394), or it carries a `=` or a Latin word that is neither a
 * Roman numeral nor a gender label (§3's text defects).
 *
 * Written HERE, against the source, so the gate can ask "should this
 * line have a display?" without consulting the parser that decided it
 * did not. That is what keeps the third mark from passing on whatever
 * the parser happened to do. */
function lineIsUnsettleable(line: string): boolean {
	let depth = 0;
	for (const ch of line) {
		if (ch === '(') {
			depth++;
		} else if (ch === ')' && --depth < 0) {
			return true;
		}
	}
	if (depth !== 0 || line.includes('=')) {
		return true;
	}
	return (line.match(LATIN_RUN) ?? []).some((run) => !LATIN_ALLOWED.test(run));
}

/** Gate 2, redefined (headword design §2's ruling). Three marks per
 * entry, each comparing the composed SOURCE line against the written
 * entry — never against the parser that produced it.
 *
 * **Byte regeneration is gone, and it had to be.** The old gate
 * rebuilt each of Sefaria's split strings from its form object and
 * compared bytes. Under §2 the parentheses, the `?` and the `…` live
 * in `display`, and the forms no longer correspond one-to-one with the
 * source's items: a group split across four items is four forms and
 * one template, and a word torn in two and rejoined by a patch is one
 * form from two items. Bytes cannot round-trip through a shape that
 * deliberately regroups them. What can is:
 *
 * 1. **text conservation** — every Hebrew character of the line
 *    reaches a form, in order, and no form invents one. This is the
 *    half that matters: `text` is the lookup key, the slug and the
 *    link target.
 * 2. **the notation multiset** — the line's `(`, `)`, `*`, `?`, `…`,
 *    superscripts and Roman numerals are exactly the template's. A
 *    parenthesis dropped, a numeral invented or a star moved onto a
 *    different form all fail here. It holds for a template a `reform`
 *    patch SUPPLIED too, as long as the source line is one this gate
 *    can settle: §4 "Parentheses" (ruled 2026-09-22) lets such a
 *    patch correct a placement, which rearranges notation rather than
 *    changing what there is of it. Only an unsettleable line is
 *    exempt, because there print set a layout the source did not keep.
 * 3. **display present iff settleable** — a template is absent
 *    exactly for a line this gate independently judges unsettleable.
 *    Without it marks 1 and 2 could both pass on a run that quietly
 *    stopped writing `display` at all, since mark 2 has nothing to
 *    compare when the template is missing. */
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: gate 2's three marks in one place; each is only meaningful against the other two.
function checkHeadwordLine(
	composed: SourceEntry,
	truth: TruthEntry,
	t: Tally,
): void {
	const line = headwordLine(composed);
	const before = lexicalOf(line);
	const after = lexicalOf(truth.headwords.map((f) => f.text).join(' '));
	mark(
		t,
		before === after,
		`${composed.rid}: headword text not conserved: ${JSON.stringify(before)} → ${JSON.stringify(after)}`,
	);
	const cannotSettle = lineIsUnsettleable(line);
	// Read off the COMPOSED entry, which is where the patch put it —
	// not off the parser's decision.
	const unsettleable = cannotSettle && composed.display === undefined;
	mark(
		t,
		unsettleable === (truth.display === undefined),
		`${composed.rid}: display is ${truth.display === undefined ? 'unset' : JSON.stringify(truth.display)} for a line that is ${unsettleable ? '' : 'not '}unsettleable`,
	);
	if (truth.display === undefined) {
		return;
	}
	const source = notationOf(line);
	const written = notationOf(truth.display.replace(SLOT, ''));
	if (composed.display !== undefined) {
		// What could actually go wrong with a supplied template is that
		// the run failed to carry it through to the entry.
		mark(
			t,
			truth.display === composed.display,
			`${composed.rid}: the patch supplied ${JSON.stringify(composed.display)} but the entry carries ${JSON.stringify(truth.display)}`,
		);
		// The slots read in FORM ORDER. §3.1 rule 1 sorts them before
		// counting, so it sees a set and a permutation passes it; the
		// notation multiset is blind to order by construction. Neither
		// would notice `{1}, {0}`, which renders the alternate where
		// print sets the headword — and `headwords[0]` is what the name,
		// the search key and every link are derived from. The parser's
		// own templates are always in order, because the forms are
		// flattened in the line's order, so this binds a supplied
		// template to the same shape.
		const slots = [...truth.display.matchAll(SLOT)].map((m) =>
			Number(m[1] ?? Number.NaN),
		);
		mark(
			t,
			slots.every((slot, at) => slot === at),
			`${composed.rid}: a patch supplied a display whose slots run [${slots.join(',')}], not in form order`,
		);
		// On an UNSETTLEABLE line the multiset cannot agree — print set a
		// layout the source did not keep, and demanding agreement would
		// refuse every such patch. On a settleable line it can and must:
		// headword design §4 "Parentheses" (ruled 2026-09-22) lets a
		// reviewed patch correct a PLACEMENT the source got wrong
		// (A02823), which moves notation between the forms without
		// adding or dropping any. Checking the multiset is what keeps
		// that from becoming a door to inventing notation — the
		// placement is the only thing the patch may change, because the
		// multiset is the only thing this mark cannot see.
		if (!cannotSettle) {
			mark(
				t,
				sameNotation(source, written),
				`${composed.rid}: a patch supplied a display that does not conserve the line's notation: [${renderNotation(source)}] → [${renderNotation(written)}]`,
			);
		}
		return;
	}
	mark(
		t,
		sameNotation(source, written),
		`${composed.rid}: notation [${renderNotation(source)}] → [${renderNotation(written)}]`,
	);
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

/** Gate 7: every entry's current NAME is unique, and its
 * `sefariaHeadword` is Sefaria's `headword` for that rid byte for
 * byte (URL names spec §5.2, U2, U3). It replaces the `slugs` gate:
 * there is no stem numbering left to have a bare owner, and the name
 * is computed from the headword rather than stored beside it.
 *
 * Two marks per entry, both over the FINISHED entries rather than
 * over the inputs they were built from — the artefact is what a
 * reader and the route map will read.
 *
 * - **addressable** is the `name-collision` failure of spec §7,
 *   compared in NFC (`names.ts`): the name is not already another
 *   entry's, and it is not empty. A correction that makes two current
 *   names equal fails here and the editor adds a disambiguator (§4);
 *   a headword that is all notation strips to nothing, collides with
 *   nobody, and would otherwise be reachable by no URL at all.
 * - **verbatim** compares the written `sefariaHeadword` against the
 *   source snapshot line for the same rid. It lives on the import
 *   path alone because per-PR CI never reads `data/source/` (R9).
 *   What it witnesses is this run's write path — that the rid → value
 *   map reached the right entry and nothing downstream rewrote the
 *   field. A hand edit to a COMMITTED entry is a different question:
 *   `validate.ts` checks that field's uniqueness over the tree in
 *   `bun qa`, and nothing outside import can compare it to Sefaria.
 *
 * `sourceHeadwords` is rid → the pristine `headword` string, so a
 * missing rid fails rather than passing against `undefined`. */
function checkNames(
	truths: readonly TruthEntry[],
	sourceHeadwords: ReadonlyMap<string, string>,
): Tally {
	const t = tally();
	const collided = new Map(nameCollisions(truths).map((p) => [p.rid, p.line]));
	for (const truth of truths) {
		const collision = collided.get(truth.id);
		mark(t, collision === undefined, collision ?? '');
		const source = sourceHeadwords.get(truth.id);
		mark(
			t,
			source !== undefined && truth.sefariaHeadword === source,
			`${truth.id}: sefariaHeadword ${JSON.stringify(truth.sefariaHeadword)} but the source says ${JSON.stringify(source ?? null)}`,
		);
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
	checkHeadwordLine,
	checkNames,
	checkPages,
	checkTextConservation,
	mark,
	tally,
	textOf,
};
