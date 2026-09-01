import type { SourceEntry } from '../../body/types.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/**
 * `v-sub-redirect-stub-mislink` — a whole-entry redirect stub whose
 * anchor resolved its geresh abbreviation as a standalone lookup and
 * landed on an unrelated lemma.
 *
 * Batch 9, spec `docs/specs/2026-08-31-link-target-gate-case-8.md`,
 * audit `data/patches/catalogue-audit/v-sub-redirect-stub.md`. It is
 * the ONLY rule batch 9 ships; the other seven citation-linking rows
 * withdrew to `judgment`, because the transform route can repair a
 * wrong anchor but cannot build a right one.
 *
 * ## The defect
 *
 * The entry's whole content is a pointer — `", v. sub נִידּ׳."` — and
 * the abbreviation names the OPENING CONSONANTS of the entry the
 * reader is being sent to. Resolved as a standalone lookup it reaches
 * whatever headword happens to start nearby:
 *
 *     N00217  נִדּוּי , v. sub נִידּ׳.   ->  Jastrow, נִדְבַּךְ I 1
 *                                    should be  Jastrow, נִידּוּי 1
 *
 * The correct target is the host's own SPELLING TWIN — the plene or
 * defective spelling of the same word — and it is determinable here
 * and nowhere else in the geresh-abbreviation family, because the
 * stub's host headword supplies the twin that a free-standing
 * abbreviation does not have.
 *
 * ## Why the table is frozen rather than computed
 *
 * Finding the twin needs the whole headword vocabulary and a rule sees
 * one entry. This follows `stem-section.ts`'s pattern: the derived
 * table is a literal here, and `v-sub-twin.corpus.test.ts` re-derives
 * it from the live snapshot so an upstream change fails a test instead
 * of silently changing the population.
 *
 * THE PREFIX ALONE DOES NOT DETERMINE THE REPAIR and the table is not
 * a shortcut around that: `כֹּר׳` has 223 candidate headwords, and it
 * is the CONJUNCTION of the prefix with the twin test that leaves
 * exactly one. Measured across the 50: clauses 2∧3 of case 8 admit one
 * candidate every time, where the prefix alone admits up to 54.
 *
 * ## What the gate can and cannot see
 *
 * Every target written here is absent from its own entry's input, so
 * no pre-existing link-target case licenses it — that is why case 8
 * exists. Case 8 checks STRUCTURE: that the target names the declared
 * headword, that the display abbreviates it, and that it is a twin of
 * this host. **It does NOT check that an entry with that headword
 * exists** — `link-target.ts` is entry-local by construction. The
 * corpus test does that, and neither half is sufficient alone (spec
 * §5).
 *
 * Of the 50 targets, 38 already appear as a `data-ref` elsewhere in
 * the corpus; the other 12 entries take their first anchor here.
 */

/** `[hostRid, currentTarget, twinHeadword, twinRid]`.
 *
 * One-line tuples rather than object literals, per
 * [[feedback_sonar_duplication_tables]] — 50 object literals sharing
 * four keys is what fails SonarCloud's 3% duplication gate. */
const TWINS: readonly (readonly [string, string, string, string])[] = [
	['I00191', 'Jastrow, טָוִי 1', 'טַוָּוס', 'I00133'],
	['H01354', 'Jastrow, חֶסֶד ² 1', 'חִיסּוּלָא', 'H00831'],
	['M01140', 'Jastrow, מִנְיָמִין 1', 'מְיַנְּקָא', 'M01231'],
	['M01283', 'Jastrow, מִיצְטְרָא 1', 'מַצְּרָא', 'M02359'],
	['M01789', 'Jastrow, מִנְיָמִין 1', 'מֵינִיקָה', 'M01225'],
	['M02305', 'Jastrow, מֵצַר ² 1', 'מִיצְטְרָא', 'M01276'],
	['N00217', 'Jastrow, נִדְבַּךְ I 1', 'נִידּוּי', 'N00624'],
	['N00689', 'Jastrow, נִימְפִּיּוֹן 1', 'נִמְרָה', 'N00892'],
	['N00745', 'Jastrow, נִיצּוּחַ 1', 'נִצְבָּא', 'N01099'],
	['N00781', 'Jastrow, נִיקּוּף 1', 'נִקְצָא', 'N01240'],
	['N00800', 'Jastrow, נִישְׁדּוּר 1', 'נִשְׁמָא', 'N01333'],
	['N00804', 'Jastrow, נִיתּוּחַ 1', 'נִתְקָא', 'N01390'],
	['O00864', 'Jastrow, סִיתְוָא 1', 'סִתְוָא', 'O01684'],
	['O00878', 'Jastrow, סִכְתָא 1', 'סִיכּוּי', 'O00642'],
	['O01070', 'Jastrow, סִמְפּוֹרִין 1', 'סִימּוּק', 'O00698'],
	['O00045', 'Jastrow, סִבְנִי 1', 'סִיבּוּר', 'O00536'],
	['P00439', 'Jastrow, עֲטַם 1', 'עִיטּוּף', 'P00532'],
	['P00540', 'Jastrow, עִיטְפָא 1', 'עִטְרָן', 'P00482'],
	['Q00799', 'Jastrow, פִּיקּוּד 1', 'פִּקָּדוֹן', 'Q01451'],
	['Q00869', 'Jastrow, פּוּרְיוֹמָא 1', 'פִּרְסְקָא', 'Q01938'],
	['Q01169', 'Jastrow, פֶּנְטִיגוֹן 1', 'פִּינּוּכָא', 'Q00722'],
	['Q01455', 'Jastrow, פִּקָּדוֹן 1', 'פִּיקּוּד', 'Q00801'],
	['Q01501', 'Jastrow, פִּקְדּוֹנָא 1', 'פִּיקְסִינָה', 'Q00816'],
	['Q01506', 'Jastrow, פִּקְדּוֹנָא 1', 'פִּיקְעָא', 'Q00817'],
	['R00420', 'Jastrow, צִיפּוּנָא 1', 'צִפּוֹרֶת', 'R00688'],
	['R00464', 'Jastrow, צִירְיָא 1', 'צִרְעָא', 'R00793'],
	['Q01726', 'Jastrow, פֵּרוּעַ ² 1', 'פֵּירוּק', 'Q00843'],
	['Q01736', 'Jastrow, פֵּרוּעַ ² 1', 'פֵּירוּר', 'Q00845'],
	['P01331', 'Jastrow, עַרְבּוּבְיָא 1', 'עֵירוּעַ', 'P00685'],
	['P01469', 'Jastrow, עֶשְׁתּוֹנָא 1', 'עִישּׁוּן', 'P00700'],
	['P01471', 'Jastrow, עֶשְׁתּוֹנָא 1', 'עִישּׂוּר', 'P00702'],
	['R00612', 'Jastrow, סִנַּבְרַאי 1', 'צִינוֹק', 'R00391'],
	['Q01996', 'Jastrow, פִּרְזוֹמָא 1', 'פִּירְקוּס', 'Q00875'],
	['S00039', 'Jastrow, קְבל IV 1', 'קִיבּוּץ', 'S00854'],
	['S01719', 'Jastrow, כִּיפֵּחַ 1', 'קִיפּוֹף', 'S01102'],
	['T00596', 'Jastrow, רִיבּוּי 1', 'רִבְקָא', 'T00142'],
	['T01074', 'Jastrow, רִשְׁבָּא 1', 'רִישּׁוּם', 'T00722'],
	['T00641', 'Jastrow, רִיכּוּנָא 1', 'רִכְסָא', 'T00776'],
	['T00703', 'Jastrow, רִיקּוּד 1', 'רִקְמָא', 'T01044'],
	['T00759', 'Jastrow, רִכְבָּא 1', 'רִיכּוּן', 'T00639'],
	['S01266', 'Jastrow, קוֹלְבָן 1', 'קִילּוּחַ', 'S00959'],
	['S01645', 'Jastrow, קוּסְדֹּור 1', 'קִיסְטְ', 'S01064'],
	['U00066', 'Jastrow, שִׁבְּבִין 1', 'שֵּׁיבָבָא', 'U00784'],
	['U00263', 'Jastrow, שִׁדְּפוֹנָא 1', 'שִׁידּוּךְ', 'U00826'],
	['U01836', 'Jastrow, שַׁקְיָינָא 1', 'שִׁיקּוּעַ', 'U01042'],
	['V00414', 'Jastrow, תִּיבּוּרָא 1', 'תִּבְלָלָא', 'V00059'],
	['U01050', 'Jastrow, שִׁיקּוּר 1', 'שִׁקְמָא', 'U01873'],
	['U01052', 'Jastrow, שִׁיקּוּר 1', 'שִׁקְצָא', 'U01888'],
	['U01445', 'Jastrow, שִׁמְצָא 1', 'שִׁימּוּשׁ', 'U00961'],
	['U01722', 'Jastrow, שִׁופּוּט 1', 'שִׁיפּוּל', 'U01015'],
];

/** Indexed by host rid, built once. */
const BY_RID = new Map(
	TWINS.map(([rid, was, headword, twinRid]) => [
		rid,
		{ headword, twinRid, was },
	]),
);

/** Hoisted to module scope for `useTopLevelRegex`, as
 * `headword-census.ts` hoists its own. Only `OPEN_TAG` and `TAGS` carry
 * `g`, and both are used with `matchAll`/`replace`, neither of which is
 * stateful across calls the way a shared `.test()`/`.exec()` is. */
const OPEN_TAG = /<a\b[^>]*>/gu;
const HREF_ATTR = /href="[^"]*"/u;
const TAGS = /<[^>]*>/gu;
const CLOSE_TAG = '</a>';

/** The sense index every written target carries.
 *
 * FIXED AT 1, NOT INHERITED. An earlier cut parsed it off the OLD
 * target — the mislink being repaired — which carries the sense index
 * of an unrelated entry and would write `Jastrow, <twin> 2` for a
 * twin that may have one sense. Nothing would catch it: case 8's
 * clause 1 accepts any positive integer and the corpus test checks the
 * headword's existence, not the index's.
 *
 * 1 is what the corpus itself uses. Of the 50 twins, 38 are anchored
 * somewhere else already, across **111 anchors, every one of them
 * index 1** — and the 50 old targets are all ` 1` too, so this changes
 * no written byte today and removes the way it could go wrong later. */
const SENSE_INDEX = '1';

/** Jastrow's own hrefs spell a self-link as `/Jastrow,_<headword>.<n>`,
 * verified against real anchors (`Jastrow, נִידּוּי 1` carries
 * `/Jastrow,_נִידּוּי.1`). Constructed rather than copied for the 12
 * targets nothing else in the corpus anchors. */
function hrefFor(headword: string): string {
	return `/Jastrow,_${headword}.${SENSE_INDEX}`;
}

/** The opening tag carrying `refAttr`, with where it sits — or
 * `undefined` when no anchor does.
 *
 * THE WHOLE POINT IS THAT THE REWRITE IS TAG-SCOPED. An earlier cut
 * checked that the `data-ref` occurred once and then did three more
 * positional lookups — a backward window for the `href`, a whole-string
 * `.replace`, and a first-anchor `exec` for the display — each of which
 * silently assumed the target anchor was the only one. With a
 * preceding anchor sharing an href value, the `href` was written onto
 * THAT anchor and the retargeted one kept a stale one. Working inside
 * the located tag makes all three assumptions unnecessary rather than
 * merely checked. */
function tagCarrying(
	text: string,
	refAttr: string,
): { end: number; start: number; tag: string } | undefined {
	const match = [...text.matchAll(OPEN_TAG)].find((candidate) =>
		candidate[0].includes(refAttr),
	);
	return match === undefined
		? undefined
		: {
				end: match.index + match[0].length,
				start: match.index,
				tag: match[0],
			};
}

/** The anchor's display as `links.ts` reports it: text tokens only,
 * and **NOT trimmed**.
 *
 * The trim matters and its absence is deliberate. `displayOf`
 * (`links.ts`) concatenates text tokens verbatim, and gate clause 4
 * compares this rule's declared display against exactly those values.
 * An earlier cut trimmed, so an anchor whose text carried surrounding
 * whitespace declared a display the input provably held and was
 * refused for it — a correct repair rejected on a whitespace
 * difference between two sides of one contract. */
function displayAfter(text: string, end: number): string {
	const close = text.indexOf(CLOSE_TAG, end);
	return text.slice(end, close === -1 ? text.length : close).replace(TAGS, '');
}

/** Rewrite the one `v. sub` anchor's two attributes in `text`, or
 * return `undefined` when the expected target is not there exactly
 * once. Fail-closed: a definition that has been reshaped by an earlier
 * rule, or that carries the target twice, is left alone rather than
 * guessed at. */
function retarget(
	text: string,
	was: string,
	headword: string,
):
	| { detail: string; display: string; target: string; written: string }
	| undefined {
	const refAttr = `data-ref="${was}"`;
	if (text.split(refAttr).length !== 2) {
		return;
	}
	const found = tagCarrying(text, refAttr);
	if (found === undefined || !HREF_ATTR.test(found.tag)) {
		return;
	}
	const target = `Jastrow, ${headword} ${SENSE_INDEX}`;
	// Both replacements are scoped to the one located tag, where each
	// attribute occurs exactly once.
	const rewritten = found.tag
		.replace(refAttr, `data-ref="${target}"`)
		.replace(HREF_ATTR, `href="${hrefFor(headword)}"`);
	return {
		detail: `${was} -> ${target}`,
		display: displayAfter(text, found.end),
		target,
		written: text.slice(0, found.start) + rewritten + text.slice(found.end),
	};
}

/**
 * Retarget the stub's anchor at the host's spelling twin.
 *
 * Declares `vouched` (link-target gate case 8). Every claim names the
 * twin's rid and headword, so a wrong repair is a wrong claim with
 * this rule's name on it.
 */
function apply(entry: SourceEntry): TransformResult {
	const twin = BY_RID.get(entry.rid);
	const senses = entry.content?.senses;
	if (twin === undefined || senses === undefined) {
		return { entry, records: [] };
	}
	const records: TransformRecord[] = [];
	const vouched: {
		display: string;
		headword: string;
		rid: string;
		target: string;
	}[] = [];
	let changed = false;
	const next = senses.map((sense) => {
		const text = sense.definition;
		if (changed || typeof text !== 'string') {
			return sense;
		}
		const done = retarget(text, twin.was, twin.headword);
		if (done === undefined) {
			return sense;
		}
		changed = true;
		records.push({
			detail: done.detail,
			rid: entry.rid,
			ruleId: vSubRedirectTwin.id,
		});
		vouched.push({
			display: done.display,
			headword: twin.headword,
			rid: twin.twinRid,
			target: done.target,
		});
		return { ...sense, definition: done.written };
	});
	if (!changed) {
		return { entry, records: [] };
	}
	return {
		entry: { ...entry, content: { ...entry.content, senses: next } },
		records,
		vouched,
	};
}

const vSubRedirectTwin: Rule = {
	apply,
	id: 'v-sub-redirect-stub-mislink',
	phase: 'text-repairs',
};

export { TWINS, vSubRedirectTwin };
