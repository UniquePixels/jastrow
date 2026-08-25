import { expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { tokenize } from './html.ts';
import { checkLinkTargets } from './link-target.ts';
import { anchors } from './links.ts';
import { applyTransforms } from './run.ts';
import type { Rule, TransformResult } from './types.ts';

/** One sense, one definition — the smallest entry the gate accepts.
 * `headword` is present because `fieldsOf` walks it unconditionally
 * (the brief's fixture omitted it, which crashes the shared walk, not
 * this gate). */
const entry = (definition: string): SourceEntry => ({
	content: { senses: [{ definition }] },
	headword: 'x',
	rid: 'T00001',
});

const A = (ref: string, display: string): string =>
	`<a class="refLink" href="/${ref.replaceAll(' ', '_')}" data-ref="${ref}">${display}</a>`;

const result = (
	entryAfter: SourceEntry,
	extra: Partial<TransformResult> = {},
): TransformResult => ({ entry: entryAfter, records: [], ...extra });

const before = entry(
	`${A('Yoma 2a', 'Ib.')} and ${A('Shabbat 30b', 'Sabb. 30ᵇ')}`,
);

it('a fabricated target fails', () => {
	const after = entry(
		`${A('Nedarim 25a', 'Ib.')} and ${A('Shabbat 30b', 'Sabb. 30ᵇ')}`,
	);
	expect(checkLinkTargets(before, after, result(after))).toEqual([
		'target "Nedarim 25a" is not in T00001\'s input',
	]);
});

it('a target copied from a sibling anchor passes', () => {
	const after = entry(
		`${A('Shabbat 30b', 'Ib.')} and ${A('Shabbat 30b', 'Sabb. 30ᵇ')}`,
	);
	expect(checkLinkTargets(before, after, result(after))).toEqual([]);
});

it('an unchanged entry passes', () => {
	expect(checkLinkTargets(before, before, result(before))).toEqual([]);
});

/** The `untouched` fast path settles an unchanged entry without
 * tokenizing it — but a declaration it cannot corroborate must still
 * be reported, or a rule could claim removals it never made. */
it('an unchanged entry with a declared unlink still fails', () => {
	expect(
		checkLinkTargets(before, before, result(before, { unlinks: 1 })),
	).toEqual(['removed 0 anchors in T00001, declared 1']);
});

it('adding an anchor fails', () => {
	const after = entry(
		`${A('Yoma 2a', 'Ib.')} and ${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Yoma 2a', 'x')}`,
	);
	expect(checkLinkTargets(before, after, result(after))).toEqual([
		'anchor count grew 2 → 3 in T00001',
	]);
});

it('an undeclared unlink fails and a declared one passes', () => {
	const after = entry(`Ib. and ${A('Shabbat 30b', 'Sabb. 30ᵇ')}`);
	expect(checkLinkTargets(before, after, result(after))).toEqual([
		'removed 1 anchor in T00001, declared 0',
	]);
	expect(
		checkLinkTargets(before, after, result(after, { unlinks: 1 })),
	).toEqual([]);
});

it('a declaration larger than the removal fails', () => {
	const after = entry(`Ib. and ${A('Shabbat 30b', 'Sabb. 30ᵇ')}`);
	expect(
		checkLinkTargets(before, after, result(after, { unlinks: 2 })),
	).toEqual(['removed 1 anchor in T00001, declared 2']);
});

it('unlinks are counted over the whole entry, not per field', () => {
	const spread = (definition: string, reference: string): SourceEntry => ({
		...entry(definition),
		language_reference: reference,
	});
	const src = spread(
		`${A('Yoma 2a', 'Ib.')} and ${A('Shabbat 30b', 'Sabb. 30ᵇ')}`,
		A('Yoma 2a', 'Ib.'),
	);
	const after = spread('Ib. and Sabb. 30ᵇ', 'Ib.');
	expect(checkLinkTargets(src, after, result(after, { unlinks: 3 }))).toEqual(
		[],
	);
	expect(checkLinkTargets(src, after, result(after, { unlinks: 2 }))).toEqual([
		'removed 3 anchors in T00001, declared 2',
	]);
});

it('compose passes when the locus comes from the display', () => {
	const src = entry(
		`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Yoma 2a', 'Ib. 31a')}`,
	);
	const after = entry(
		`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Shabbat 31a', 'Ib. 31a')}`,
	);
	const claim = { from: 'Shabbat 30b', target: 'Shabbat 31a' };
	expect(
		checkLinkTargets(src, after, result(after, { composed: [claim] })),
	).toEqual([]);
});

it('compose fails when the locus is not in the display', () => {
	const src = entry(`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Yoma 2a', 'Ib.')}`);
	const after = entry(
		`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Shabbat 31a', 'Ib.')}`,
	);
	const claim = { from: 'Shabbat 30b', target: 'Shabbat 31a' };
	expect(
		checkLinkTargets(src, after, result(after, { composed: [claim] })),
	).toEqual(['composed "Shabbat 31a" adds "1a" absent from display "Ib."']);
});

it('an undeclared compose fails', () => {
	const src = entry(
		`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Yoma 2a', 'Ib. 31a')}`,
	);
	const after = entry(
		`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Shabbat 31a', 'Ib. 31a')}`,
	);
	expect(checkLinkTargets(src, after, result(after))).toEqual([
		'target "Shabbat 31a" is not in T00001\'s input',
	]);
});

it('a compose copying from a target the input lacks fails', () => {
	const after = entry(
		`${A('Shabbat 31a', 'Ib. 31a')} and ${A('Shabbat 30b', 'Sabb. 30ᵇ')}`,
	);
	const claim = { from: 'Nedarim 25a', target: 'Shabbat 31a' };
	expect(
		checkLinkTargets(before, after, result(after, { composed: [claim] })),
	).toEqual([
		'composed "Shabbat 31a" copies from "Nedarim 25a", which is not in T00001\'s input',
	]);
});

it('one claim must satisfy every anchor it matches', () => {
	const src = entry(`${A('Shabbat 30b', 'Ib. 31a')} ${A('Yoma 2a', 'Ib.')}`);
	const after = entry(
		`${A('Shabbat 31a', 'Ib. 31a')} ${A('Shabbat 31a', 'Ib.')}`,
	);
	const claim = { from: 'Shabbat 30b', target: 'Shabbat 31a' };
	expect(
		checkLinkTargets(src, after, result(after, { composed: [claim] })),
	).toEqual(['composed "Shabbat 31a" adds "1a" absent from display "Ib."']);
});

it('href and data-ref are checked independently', () => {
	const src = entry(A('Yoma 2a', 'Ib.'));
	const after = entry(
		'<a class="refLink" href="/Nedarim_25a" data-ref="Yoma 2a">Ib.</a>',
	);
	expect(checkLinkTargets(src, after, result(after))).toEqual([
		'target "/Nedarim_25a" is not in T00001\'s input',
	]);
});

it('a fabricated target in a NESTED sense fails', () => {
	const nested = (definition: string): SourceEntry => ({
		content: { senses: [{ senses: [{ definition }] }] },
		headword: 'x',
		rid: 'T00001',
	});
	const after = nested(A('Nedarim 25a', 'Ib.'));
	expect(
		checkLinkTargets(nested(A('Yoma 2a', 'Ib.')), after, result(after)),
	).toEqual(['target "Nedarim 25a" is not in T00001\'s input']);
});

it('a fabricated target in language_reference fails', () => {
	const withRef = (reference: string): SourceEntry => ({
		...entry('a definition with no anchors'),
		language_reference: reference,
	});
	const after = withRef(A('Nedarim 25a', 'Ib.'));
	expect(
		checkLinkTargets(withRef(A('Yoma 2a', 'Ib.')), after, result(after)),
	).toEqual(['target "Nedarim 25a" is not in T00001\'s input']);
});

it('a fabricated target in a quote fails', () => {
	const quoted = (quote: string): SourceEntry => ({
		...entry('a definition with no anchors'),
		quotes: [[null, quote, null]],
	});
	const after = quoted(A('Nedarim 25a', 'Ib.'));
	expect(
		checkLinkTargets(quoted(A('Yoma 2a', 'Ib.')), after, result(after)),
	).toEqual(['target "Nedarim 25a" is not in T00001\'s input']);
});

/** D00478's shape: an unterminated `href` swallows the closing tag, so
 * `links.ts` reports the anchor `malformed` and both editors refuse it.
 * The GATE must still read it — an unusable anchor that a rule somehow
 * retargeted is exactly the case a skip would hide. */
const DAMAGED = (ref: string): string =>
	`<a dir="rtl" href="/Jastrow,_כָּלוּל.1</a>" data-ref="${ref}">כָּלוּל</a>.`;

it('a malformed anchor left alone passes', () => {
	const src = entry(DAMAGED('Jastrow, כָּלוּל 1'));
	expect(checkLinkTargets(src, src, result(src))).toEqual([]);
});

/** Recorded, not celebrated: D00478's `href` swallowed the closing
 * tag, so the tag token ends inside the attribute and the `data-ref`
 * that follows tokenizes as document TEXT. It is not an attribute any
 * more, so this gate cannot see it change — the text gate covers that
 * edit instead, since rewriting the digit introduces a codepoint. */
it('a target inside D00478’s damaged tail is text, not a target', () => {
	const src = entry(DAMAGED('Jastrow, כָּלוּל 1'));
	const after = entry(DAMAGED('Jastrow, כָּלוּל 2'));
	expect(checkLinkTargets(src, after, result(after))).toEqual([]);
});

/** J00597's shape: the trapped second anchor parses perfectly on its
 * own but sits inside the first tag's unrecovered interior, so both
 * editors refuse it. The GATE must still target-check it — an anchor
 * no rule was allowed to touch is exactly the one a silent skip would
 * hide. */
const TRAPPED = (href: string): string =>
	'(cmp. <a dir="rtl" class="refLink" href="/Jastrow,_דִּלְדֵּל.1</a>' +
	`<a class="refLink" href="${href}">B. Mets. 38ᵇ</a> ` +
	'<span dir="rtl">היוֹרֵד</span> he who takes possession.';

it('an interior-trapped anchor is target-checked, not skipped', () => {
	const after = entry(TRAPPED('/Nedarim.25a'));
	expect(
		checkLinkTargets(entry(TRAPPED('/Bava_Metzia.38b')), after, result(after)),
	).toEqual(['target "/Nedarim.25a" is not in T00001\'s input']);
});

it('an unclosed anchor is target-checked, not skipped', () => {
	const open = (ref: string): SourceEntry =>
		entry(`lead <a class="refLink" href="/x" data-ref="${ref}">tail, no close`);
	const after = open('Nedarim 25a');
	expect(checkLinkTargets(open('Yoma 2a'), after, result(after))).toEqual([
		'target "Nedarim 25a" is not in T00001\'s input',
	]);
});

/** Recursively freezes an entry so any in-place write by the gate
 * throws a `TypeError` (ESM is strict mode) instead of passing
 * unnoticed — the same device `count.ts` uses on the corpus. */
function deepFreeze<T>(value: T): T {
	if (value === null || typeof value !== 'object' || Object.isFrozen(value)) {
		return value;
	}
	Object.freeze(value);
	for (const key of Object.keys(value)) {
		deepFreeze((value as Record<string, unknown>)[key]);
	}
	return value;
}

it('the gate mutates neither entry nor the result', () => {
	const after = deepFreeze(
		entry(`${A('Shabbat 30b', 'Ib.')} and ${A('Shabbat 30b', 'Sabb. 30ᵇ')}`),
	);
	const claimed = deepFreeze(
		result(after, { composed: [{ from: 'Yoma 2a', target: 'Yoma 2a' }] }),
	);
	expect(checkLinkTargets(deepFreeze(before), after, claimed)).toEqual([]);
});

it('the runner enforces the gate', () => {
	const fabricator: Rule = {
		apply: (source: SourceEntry) => ({
			entry: entry(
				`${A('Nedarim 25a', 'Ib.')} and ${A('Shabbat 30b', 'Sabb. 30ᵇ')}`,
			),
			records: [
				{ detail: 'retargeted', rid: source.rid, ruleId: 'fabricator' },
			],
		}),
		id: 'fabricator',
		phase: 'text-repairs',
	};
	// The rule name appears exactly ONCE, and `run.ts` is what puts it
	// there — the gate's own messages carry no rule prefix, matching
	// `no-new-text.ts` and `markup.ts`.
	expect(() => applyTransforms(before, 'text-repairs', [fabricator])).toThrow(
		/^fabricator: target "Nedarim 25a" is not in T00001's input$/u,
	);
});

// ————————————————————————————————————————————————————————————————
// Case 4: recombination (spec §3.2 case 4, ruling of 2026-08-23).
// ————————————————————————————————————————————————————————————————

/** A verbatim corpus anchor. Sefaria spells the same address two ways
 * — `/Onkelos_Deuteronomy.13.2` and `Onkelos Deuteronomy 13:2` — so a
 * recombination splits at a different offset on each attribute, and
 * the `A` helper's synthetic hrefs would hide that. */
const S = (href: string, ref: string, display: string): string =>
	`<a class="refLink" href="${href}" data-ref="${ref}">${display}</a>`;

const WORK = A('Work on Exodus 1:1', 'Ex. I, 1');
const LOCUS = A('Leviticus 2:2', 'Lev. II, 2');
const rejoined = entry(
	`${WORK} and Ib. ${A('Work on Leviticus 2:2', 'Lev. II, 2')}`,
);
const split = { head: 'Work on Exodus 1:1', tail: 'Leviticus 2:2' };

it('a declared recombination passes', () => {
	const claim = { ...split, target: 'Work on Leviticus 2:2' };
	expect(
		checkLinkTargets(
			entry(`${WORK} and Ib. ${LOCUS}`),
			rejoined,
			result(rejoined, { recombined: [claim] }),
		),
	).toEqual([]);
});

it('an undeclared recombination fails', () => {
	expect(
		checkLinkTargets(
			entry(`${WORK} and Ib. ${LOCUS}`),
			rejoined,
			result(rejoined),
		),
	).toEqual(['target "Work on Leviticus 2:2" is not in T00001\'s input']);
});

it('a recombination taking a character from neither source fails', () => {
	const after = entry(
		`${WORK} and Ib. ${A('Work on Leviticus 2:3', 'Lev. II, 2')}`,
	);
	const claim = { ...split, target: 'Work on Leviticus 2:3' };
	expect(
		checkLinkTargets(
			entry(`${WORK} and Ib. ${LOCUS}`),
			after,
			result(after, { recombined: [claim] }),
		),
	).toEqual([
		'recombined "Work on Leviticus 2:3" is not a prefix of "Work on Exodus 1:1" joined to a suffix of "Leviticus 2:2"',
	]);
});

it('a recombination from a target the input lacks fails', () => {
	const claim = {
		head: 'Work on Numbers 9:9',
		tail: 'Leviticus 2:2',
		target: 'Work on Leviticus 2:2',
	};
	expect(
		checkLinkTargets(
			entry(`${WORK} and Ib. ${LOCUS}`),
			rejoined,
			result(rejoined, { recombined: [claim] }),
		),
	).toEqual([
		'recombined "Work on Leviticus 2:2" copies from "Work on Numbers 9:9", which is not in T00001\'s input',
	]);
});

it('a recombination whose TAIL is not in the input fails', () => {
	const claim = {
		head: 'Work on Exodus 1:1',
		tail: 'Numbers 9:9',
		target: 'Work on Leviticus 2:2',
	};
	expect(
		checkLinkTargets(
			entry(`${WORK} and Ib. ${LOCUS}`),
			rejoined,
			result(rejoined, { recombined: [claim] }),
		),
	).toEqual([
		'recombined "Work on Leviticus 2:2" copies from "Numbers 9:9", which is not in T00001\'s input',
	]);
});

/** Review probe 1, and the sharpest of the four: truncating the head's
 * own locus. Digit-compatible on purpose — `13:2` ends in the `2` that
 * `Deuteronomy 6:22` also ends in, so the tail really can supply that
 * character and only the tail-prefix rule stands in the way. (The
 * fixture this replaced ended in `1` against a tail ending in `2`, so
 * it passed on a coincidence rather than on the property it claimed.)
 * Off-by-one verse corruption is the likeliest real bug this gate
 * exists to catch. */
it('rejects a truncation of the head, even when the tail ends the same', () => {
	const claim = {
		head: 'Onkelos Deuteronomy 13:22',
		tail: 'Deuteronomy 6:22',
		target: 'Onkelos Deuteronomy 13:2',
	};
	const src = entry(
		`${A('Onkelos Deuteronomy 13:22', 'Targ. O. Deut. XIII, 22')} Ib. ${A('Deuteronomy 6:22', 'Deut. VI, 22')}`,
	);
	const after = entry(
		`${A('Onkelos Deuteronomy 13:22', 'Targ. O. Deut. XIII, 22')} Ib. ${A('Onkelos Deuteronomy 13:2', 'Deut. VI, 22')}`,
	);
	expect(
		checkLinkTargets(src, after, result(after, { recombined: [claim] })),
	).toEqual([
		'recombined "Onkelos Deuteronomy 13:2" is not a prefix of "Onkelos Deuteronomy 13:22" joined to a suffix of "Deuteronomy 6:22"',
	]);
});

/** Review probe 2: the work never moves, only the verse — the case
 * that needs no second work at all and so has no business being a
 * recombination. */
it('rejects a wrong verse minted inside the head’s own work', () => {
	const claim = {
		head: 'Targum Jonathan on Exodus 39:28',
		tail: 'Leviticus 6:3',
		target: 'Targum Jonathan on Exodus 39:3',
	};
	const src = entry(
		`${A('Targum Jonathan on Exodus 39:28', 'Targ. Y. I Ex. XXXIX, 28')} Ib. ${A('Leviticus 6:3', 'Lev. VI, 3')}`,
	);
	const after = entry(
		`${A('Targum Jonathan on Exodus 39:28', 'Targ. Y. I Ex. XXXIX, 28')} Ib. ${A('Targum Jonathan on Exodus 39:3', 'Lev. VI, 3')}`,
	);
	expect(
		checkLinkTargets(src, after, result(after, { recombined: [claim] })),
	).toEqual([
		'recombined "Targum Jonathan on Exodus 39:3" is not a prefix of "Targum Jonathan on Exodus 39:28" joined to a suffix of "Leviticus 6:3"',
	]);
});

/** Review probe 4: a splice through the middle of a word. Every
 * character is verbatim and the result is still gibberish, which is
 * why "verbatim" was never sufficient on its own. */
it('rejects a mid-word splice of two unrelated targets', () => {
	const claim = {
		head: 'Onkelos Deuteronomy 13:2',
		tail: 'Leviticus 6:3',
		target: 'Oeviticus 6:3',
	};
	const src = entry(
		`${A('Onkelos Deuteronomy 13:2', 'Targ. O. Deut. XIII, 2')} Ib. ${A('Leviticus 6:3', 'Lev. VI, 3')}`,
	);
	const after = entry(
		`${A('Onkelos Deuteronomy 13:2', 'Targ. O. Deut. XIII, 2')} Ib. ${A('Oeviticus 6:3', 'Lev. VI, 3')}`,
	);
	expect(
		checkLinkTargets(src, after, result(after, { recombined: [claim] })),
	).toEqual([
		'recombined "Oeviticus 6:3" is not a prefix of "Onkelos Deuteronomy 13:2" joined to a suffix of "Leviticus 6:3"',
	]);
});

/** Review probe 3, and the one the tail-prefix rule does NOT cover: a
 * string is trivially its own prefix, so a lone source could extend
 * itself. Rejected by the distinctness check instead — spec §3.2 says
 * "a suffix of ANOTHER", and the "better evidenced than case 2"
 * argument assumes two independent sources. */
it('rejects a claim naming one target as both head and tail', () => {
	const claim = {
		head: 'Onkelos Deuteronomy 13:2',
		tail: 'Onkelos Deuteronomy 13:2',
		target: 'Onkelos Deuteronomy 13:22',
	};
	const src = entry(
		`${A('Onkelos Deuteronomy 13:2', 'Targ. O. Deut. XIII, 2')}`,
	);
	const after = entry(
		`${A('Onkelos Deuteronomy 13:22', 'Targ. O. Deut. XIII, 2')}`,
	);
	expect(
		checkLinkTargets(src, after, result(after, { recombined: [claim] })),
	).toEqual([
		'recombined "Onkelos Deuteronomy 13:22" names "Onkelos Deuteronomy 13:2" as both head and tail',
	]);
});

/** A00589, verbatim from the corpus — the different-book member, and
 * the shape 8 of `ib-targum-work-loss`'s 9 occurrences take. The gate
 * change is only right if it licenses exactly this. */
it("licenses A00589's claim", () => {
	const anaphor = (href: string, ref: string): string =>
		S(href, ref, 'Lev. VI, 3');
	const definition = (locus: string): string =>
		`${S('/Targum_Jonathan_on_Exodus.39.28', 'Targum Jonathan on Exodus 39:28', 'Targ. Y. I Ex. XXXIX, 28')} Ib. ${locus}`;
	const after = entry(
		definition(
			anaphor(
				'/Targum_Jonathan_on_Leviticus.6.3',
				'Targum Jonathan on Leviticus 6:3',
			),
		),
	);
	const claim = {
		head: 'Targum Jonathan on Exodus 39:28',
		tail: 'Leviticus 6:3',
		target: 'Targum Jonathan on Leviticus 6:3',
	};
	expect(
		checkLinkTargets(
			entry(definition(anaphor('/Leviticus.6.3', 'Leviticus 6:3'))),
			after,
			result(after, { recombined: [claim] }),
		),
	).toEqual([]);
});

/** M00567, verbatim: the same-book member, where the common prefix
 * eats the work AND the book. Case 3 fails it on `6` and `:` alone —
 * Jastrow writes `Deut. VI, 22`, Sefaria writes `6:22` — which is why
 * case 4 exists at all. */
it("licenses M00567's claim", () => {
	const anaphor = (href: string, ref: string): string =>
		S(href, ref, 'Deut. VI, 22');
	const definition = (locus: string): string =>
		`${S('/Onkelos_Deuteronomy.13.2', 'Onkelos Deuteronomy 13:2', 'Targ. O. Deut. XIII, 2')} Ib. ${locus}`;
	const after = entry(
		definition(
			anaphor('/Onkelos_Deuteronomy.6.22', 'Onkelos Deuteronomy 6:22'),
		),
	);
	const claim = {
		head: 'Onkelos Deuteronomy 13:2',
		tail: 'Deuteronomy 6:22',
		target: 'Onkelos Deuteronomy 6:22',
	};
	expect(
		checkLinkTargets(
			entry(definition(anaphor('/Deuteronomy.6.22', 'Deuteronomy 6:22'))),
			after,
			result(after, { recombined: [claim] }),
		),
	).toEqual([]);
});

/** Was pinned as a licensed abuse when case 4 first landed; the
 * tail-prefix tightening of 2026-08-24 rejects it, which is what that
 * pin existed to make visible. Kept as a rejection test: extending the
 * head's own locus with a character borrowed off the tail is the
 * mirror of the truncation above, and both are now closed. */
it('rejects a borrowed tail character extending the head’s locus', () => {
	const anaphor = (href: string, ref: string): string =>
		S(href, ref, 'Deut. VI, 22');
	const definition = (locus: string): string =>
		`${S('/Onkelos_Deuteronomy.13.2', 'Onkelos Deuteronomy 13:2', 'Targ. O. Deut. XIII, 2')} Ib. ${locus}`;
	const after = entry(
		definition(
			anaphor('/Onkelos_Deuteronomy.13.22', 'Onkelos Deuteronomy 13:22'),
		),
	);
	const claim = {
		head: 'Onkelos Deuteronomy 13:2',
		tail: 'Deuteronomy 6:22',
		target: 'Onkelos Deuteronomy 13:22',
	};
	expect(
		checkLinkTargets(
			entry(definition(anaphor('/Deuteronomy.6.22', 'Deuteronomy 6:22'))),
			after,
			result(after, { recombined: [claim] }),
		),
	).toEqual([
		'recombined "Onkelos Deuteronomy 13:22" is not a prefix of "Onkelos Deuteronomy 13:2" joined to a suffix of "Deuteronomy 6:22"',
	]);
});

// ——— what case 4 still licenses. Pinned because they PASS, so the
// accepted surface is visible at review time instead of only to
// someone who runs probes against it. Each has a bullet in the
// module's blind-spot list.

/** Two SAME-WORK targets in one entry — common in this corpus, since
 * an entry often cites a work twice — still let a rule mint a third
 * verse in that work. `Onkelos Deuteronomy 13:2` and
 * `Onkelos Deuteronomy 1:13` license `Onkelos Deuteronomy 13:13`: the
 * discarded tail prefix `Onkelos Deuteronomy 1` IS a prefix of the
 * head, so the tightening cannot see it. This is the residue of the
 * off-by-one verse family, and it survives because the legitimate
 * claim is exactly "two targets that differ in the work" while this
 * one is "two targets that share it" — no rule keyed on the discarded
 * prefix separates them. */
it('still licenses a verse minted from two same-work targets', () => {
	const claim = {
		head: 'Onkelos Deuteronomy 13:2',
		tail: 'Onkelos Deuteronomy 1:13',
		target: 'Onkelos Deuteronomy 13:13',
	};
	const src = entry(
		`${A('Onkelos Deuteronomy 13:2', 'Targ. O. Deut. XIII, 2')} Ib. ${A('Onkelos Deuteronomy 1:13', 'Targ. O. Deut. I, 13')}`,
	);
	const after = entry(
		`${A('Onkelos Deuteronomy 13:2', 'Targ. O. Deut. XIII, 2')} Ib. ${A('Onkelos Deuteronomy 13:13', 'Targ. O. Deut. I, 13')}`,
	);
	expect(
		checkLinkTargets(src, after, result(after, { recombined: [claim] })),
	).toEqual([]);
});

/** The same residue in its uglier form: `13:2:13` is not a
 * well-formed ref at all, and is licensed for exactly the same reason
 * as `13:13` — the discarded prefix `Onkelos Deuteronomy 1` is a
 * prefix of the head, so the tightening cannot see it. Pinned
 * separately because "the address is at least ref-shaped" is not a
 * property this gate has. */
it('still licenses a malformed splice of two same-work targets', () => {
	const claim = {
		head: 'Onkelos Deuteronomy 13:2',
		tail: 'Onkelos Deuteronomy 1:13',
		target: 'Onkelos Deuteronomy 13:2:13',
	};
	const src = entry(
		`${A('Onkelos Deuteronomy 13:2', 'Targ. O. Deut. XIII, 2')} Ib. ${A('Onkelos Deuteronomy 1:13', 'Targ. O. Deut. I, 13')}`,
	);
	const after = entry(
		`${A('Onkelos Deuteronomy 13:2', 'Targ. O. Deut. XIII, 2')} Ib. ${A('Onkelos Deuteronomy 13:2:13', 'Targ. O. Deut. I, 13')}`,
	);
	expect(
		checkLinkTargets(src, after, result(after, { recombined: [claim] })),
	).toEqual([]);
});

/** Distinctness is enforced per PAIR, not only on the declared
 * strings: two different data-refs that share one `href` collapse to
 * a single source on the href side, and the pair is skipped. A
 * fail-closed narrowing — the data-ref half of the same claim is
 * licensed, the href half is not — recorded because the blind-spot
 * list has to describe the code exactly. No corpus rule has met it. */
it('rejects an href pair that collapses to one spelling', () => {
	const src = entry(
		`${S('/Shared.1', 'Alpha 1', 'Al.')} Ib. ${S('/Shared.1', 'Beta 2', 'Be.')}`,
	);
	const after = entry(
		`${S('/Shared.1', 'Alpha 1', 'Al.')} Ib. ${S('/Shhared.1', 'AlBeta 2', 'Be.')}`,
	);
	const claim = { head: 'Alpha 1', tail: 'Beta 2', target: 'AlBeta 2' };
	expect(
		checkLinkTargets(src, after, result(after, { recombined: [claim] })),
	).toEqual([
		'recombined "/Shhared.1" is not a prefix of "/Shared.1" joined to a suffix of "/Shared.1"',
	]);
});

/** The target set pools `href` with `data-ref`, so an href SPELLING is
 * a legal `head` or `tail` on the data-ref side: `/`, `_` and `.` can
 * be written into a `data-ref` that should never hold them. Case 4
 * inherits this from the pooled set rather than adding it, but it is
 * the case that makes it reachable — cases 1-2 can only copy a whole
 * value across, where this assembles one. */
it('still licenses an href spelling written into a data-ref', () => {
	const src = entry(
		`${S('/Onkelos_Deuteronomy.13.2', 'Onkelos Deuteronomy 13:2', 'Targ. O. Deut. XIII, 2')} Ib. ${S('/Deuteronomy.6.22', 'Deuteronomy 6:22', 'Deut. VI, 22')}`,
	);
	const after = entry(
		`${S('/Onkelos_Deuteronomy.13.2', 'Onkelos Deuteronomy 13:2', 'Targ. O. Deut. XIII, 2')} Ib. ${S('/Deuteronomy.6.22', '/Onkelos_Deuteronomy.6.22', 'Deut. VI, 22')}`,
	);
	const claim = {
		head: '/Onkelos_Deuteronomy.13.2',
		tail: '/Deuteronomy.6.22',
		target: '/Onkelos_Deuteronomy.6.22',
	};
	expect(
		checkLinkTargets(src, after, result(after, { recombined: [claim] })),
	).toEqual([]);
});

// ————————————————————————————————————————————————————————————————
// Case 5: glyph correction (batch-3a spec §4.3).
// ————————————————————————————————————————————————————————————————

/** The raw opening-tag token value — what `Anchor.tag` carries and
 * what a `glyphCorrected` claim names on both sides. The claim CANNOT
 * be phrased on parsed targets: the ASCII quote terminates its own
 * attribute, so both damaged tags below parse `malformed: false` with
 * a truncated `data-ref`, and a case stated against the input target
 * set would compare the repair to `Jastrow, אל`. */
const openTagOf = (html: string): string => tokenize(html)[0]?.value ?? '';

const GERSHAYIM = '״';

/** A00009, verbatim: a gershayim written as an ASCII `"` inside a
 * `"`-delimited attribute. 90 corpus anchors are in this state. */
const damaged =
	'<a dir="rtl" class="refLink" href="/Jastrow,_אל"ף.1" data-ref="Jastrow, אל"ף 1">אלף</a>';
const repaired = damaged.replaceAll('"ף', `${GERSHAYIM}ף`);

it('case 5 licenses a tag whose only change is the gershayim glyph', () => {
	const after = entry(repaired);
	expect(
		checkLinkTargets(
			entry(damaged),
			after,
			result(after, {
				glyphCorrected: [
					{ from: openTagOf(damaged), target: openTagOf(repaired) },
				],
			}),
		),
	).toEqual([]);
});

it('an undeclared glyph correction is still a fabrication', () => {
	const after = entry(repaired);
	expect(
		checkLinkTargets(entry(damaged), after, result(after)).length,
	).toBeGreaterThan(0);
});

it('case 5 refuses a claim whose from does not de-map from its target', () => {
	const after = entry(repaired);
	expect(
		checkLinkTargets(
			entry(damaged),
			after,
			result(after, {
				glyphCorrected: [
					{
						from: openTagOf(damaged).replace('אל', 'בל'),
						target: openTagOf(repaired),
					},
				],
			}),
		).length,
	).toBeGreaterThan(0);
});

/** The `from`-membership arm on its own. The probe above never
 * reaches it — retargeting the `from` also breaks the substitution
 * test, which is reported first — so the claim here de-maps EXACTLY
 * and still names a tag this entry's input never held. */
it('case 5 refuses a well-formed claim naming a tag no input anchor carries', () => {
	const stranger =
		'<a dir="rtl" class="refLink" href="/Jastrow,_בל"ם.1" data-ref="Jastrow, בל"ם 1">בלם</a>';
	const after = entry(repaired);
	expect(
		checkLinkTargets(
			entry(stranger),
			after,
			result(after, {
				glyphCorrected: [
					{ from: openTagOf(damaged), target: openTagOf(repaired) },
				],
			}),
		),
	).toEqual([
		`glyph-corrected ${JSON.stringify('Jastrow, אל״ף 1')} is claimed from ${JSON.stringify(openTagOf(damaged))}, which is not a tag in T00001's input`,
	]);
});

/** The corollary `glyphFault`'s condition 1 states and calls
 * fail-closed under composition: a `from` that ALREADY carries a
 * gershayim can never satisfy it, because de-mapping the target
 * leaves none behind. Nothing exercised it — the nearest cases
 * retarget `from` or move a non-quote character, and fail for their
 * own reasons.
 *
 * Set up so condition 2 would pass, which is what isolates the
 * corollary as the reason for the refusal: the input already carries
 * the repaired tag — the state composition leaves it in once an
 * earlier rule has written a mark — so `from` IS a tag this entry
 * held. The anchor needing a licence is a DIFFERENT one, because a
 * claim whose target is already in the input target set is settled by
 * case 1 and never consulted at all. */
it('case 5 refuses a claim whose from already holds a gershayim', () => {
	const other =
		'<a dir="rtl" class="refLink" href="/Jastrow,_עכ"ום.1" data-ref="Jastrow, עכ"ום 1">עכום</a>';
	const otherRepaired = other.replaceAll('"ו', `${GERSHAYIM}ו`);
	const after = entry(`${repaired} ${otherRepaired}`);
	expect(
		checkLinkTargets(
			entry(`${repaired} ${other}`),
			after,
			result(after, {
				glyphCorrected: [
					{ from: openTagOf(repaired), target: openTagOf(otherRepaired) },
				],
			}),
		),
	).toEqual([
		`glyph-corrected ${JSON.stringify('Jastrow, עכ״ום 1')} changes more than the quote`,
	]);
});

/** Case 5 is ALL-claim where cases 3 and 4 are ANY-claim, and the
 * divergence is deliberate — see `glyphFaults`. One honest claim plus
 * one claim stating a false provenance for the SAME repaired tag
 * refuses the anchor rather than letting the honest one carry it. */
it('case 5 refuses an honest claim beside a false one on the same tag', () => {
	const after = entry(repaired);
	expect(
		checkLinkTargets(
			entry(damaged),
			after,
			result(after, {
				glyphCorrected: [
					{ from: openTagOf(damaged), target: openTagOf(repaired) },
					{
						from: openTagOf(damaged).replace('אל', 'בל'),
						target: openTagOf(repaired),
					},
				],
			}),
		),
	).toEqual([
		`glyph-corrected ${JSON.stringify('Jastrow, אל״ף 1')} changes more than the quote`,
	]);
});

it('case 5 refuses a claim that changes a non-quote character', () => {
	const moved = repaired.replace('.1"', '.2"');
	const after = entry(moved);
	expect(
		checkLinkTargets(
			entry(damaged),
			after,
			result(after, {
				glyphCorrected: [
					{ from: openTagOf(damaged), target: openTagOf(moved) },
				],
			}),
		).length,
	).toBeGreaterThan(0);
});

it('a claim does not license a different anchor', () => {
	const other =
		'<a dir="rtl" class="refLink" href="/Jastrow,_עכ"ום.1" data-ref="Jastrow, עכ"ום 1">עכום</a>';
	const otherRepaired = other.replaceAll('"ו', `${GERSHAYIM}ו`);
	const after = entry(repaired + otherRepaired);
	expect(
		checkLinkTargets(
			entry(damaged + other),
			after,
			result(after, {
				glyphCorrected: [
					{ from: openTagOf(damaged), target: openTagOf(repaired) },
				],
			}),
		).length,
	).toBeGreaterThan(0);
});

// ——— the two capability leaks review found in case 5's first cut.
// Both were licensed by "de-maps exactly and `from` is an input tag"
// alone, and both are closed by `glyphFault`.

/** F-1. Claims are matched by TAG VALUE, and tag values repeat — two
 * corpus entries carry a damaged tag twice. So one honest claim also
 * spoke for a SIBLING anchor that another rule had retargeted to the
 * repaired bytes, which is a retarget case 5 has no business
 * licensing. The cap is on multiplicity: no more output anchors than
 * the input held anchors carrying `from`. */
it('case 5 refuses a claim licensing more anchors than the input held', () => {
	const sibling = `${openTagOf(repaired)}עכום</a>`;
	const src = entry(
		`${damaged} <a class="refLink" href="/Yoma.2a" data-ref="Yoma 2a">עכום</a>`,
	);
	const after = entry(`${repaired} ${sibling}`);
	expect(
		checkLinkTargets(
			src,
			after,
			result(after, {
				glyphCorrected: [
					{ from: openTagOf(damaged), target: openTagOf(repaired) },
				],
			}),
		),
	).toEqual([
		// Once per anchor: an over-subscribed claim licenses NEITHER of
		// them, so the honest repair fails alongside the retarget it was
		// made to cover. Fail-closed is the point.
		`glyph-corrected ${JSON.stringify('Jastrow, אל״ף 1')} is claimed for 2 anchors, but T00001's input held 1`,
		`glyph-corrected ${JSON.stringify('Jastrow, אל״ף 1')} is claimed for 2 anchors, but T00001's input held 1`,
	]);
});

/** The cap is a CAP, not a ban on repeats: an entry that repeats a
 * damaged tag verbatim — 2 entries do, worst multiplicity 2 — must
 * still be repairable by one claim. */
it('case 5 licenses a repeated damaged tag under one claim', () => {
	const after = entry(`${repaired} ${repaired}`);
	expect(
		checkLinkTargets(
			entry(`${damaged} ${damaged}`),
			after,
			result(after, {
				glyphCorrected: [
					{ from: openTagOf(damaged), target: openTagOf(repaired) },
				],
			}),
		),
	).toEqual([]);
});

/** F-2. Converting the quotes that DELIMIT an attribute de-maps to the
 * input tag exactly as the honest repair does, and `from` is exactly
 * as much an input tag — so the first cut licensed a tag whose `href`
 * parses to NOTHING. Asserted on the parse, not on the bytes: the
 * point of the finding is what the attributes read as afterwards. */
const delimiterSwap = damaged.replace(
	'href="/Jastrow,_אל"ף.1"',
	`href=${GERSHAYIM}/Jastrow,_אל"ף.1${GERSHAYIM}`,
);

it('the honest repair leaves both attributes parsing to their full values', () => {
	const [anchor] = anchors(tokenize(repaired));
	expect(anchor?.dataRef).toBe('Jastrow, אל״ף 1');
	expect(anchor?.href).toBe('/Jastrow,_אל״ף.1');
});

it('a delimiter conversion de-maps exactly yet destroys the target', () => {
	expect(delimiterSwap.replaceAll(GERSHAYIM, '"')).toBe(damaged);
	const [anchor] = anchors(tokenize(delimiterSwap));
	expect(anchor?.href).toBe('');
});

it('case 5 refuses a claim that converts an attribute delimiter', () => {
	const after = entry(delimiterSwap);
	expect(
		checkLinkTargets(
			entry(damaged),
			after,
			result(after, {
				glyphCorrected: [
					{ from: openTagOf(damaged), target: openTagOf(delimiterSwap) },
				],
			}),
		),
	).toEqual([
		'glyph-corrected "" substitutes a quote that no Hebrew letters flank',
	]);
});

/** The same leak in the form a "is the gershayim inside a parsed
 * value?" guard would MISS: converting both of `href`'s delimiters
 * makes its value swallow `data-ref`, so every gershayim does sit
 * inside a parsed value — and the anchor's `data-ref` is blanked.
 * Hebrew-flanking refuses it because a delimiter always abuts `=` or
 * whitespace. */
it('case 5 refuses a delimiter conversion that swallows the next attribute', () => {
	const swallowed = `<a href="/x${GERSHAYIM} data-ref=${GERSHAYIM}y">ש</a>`;
	const src = entry('<a href="/x" data-ref="y">ש</a>');
	expect(swallowed.replaceAll(GERSHAYIM, '"')).toBe(
		'<a href="/x" data-ref="y">ש</a>',
	);
	const [anchor] = anchors(tokenize(swallowed));
	expect(anchor?.dataRef).toBe('');
	const after = entry(swallowed);
	expect(
		checkLinkTargets(
			src,
			after,
			result(after, {
				glyphCorrected: [
					{
						from: openTagOf('<a href="/x" data-ref="y">ש</a>'),
						target: openTagOf(swallowed),
					},
				],
			}),
		),
	).toEqual([
		'glyph-corrected "" substitutes a quote that no Hebrew letters flank',
	]);
});

/** The tolerance class carries U+0307 as well as the Hebrew points.
 * M01940's `מ̇ס̇"ך̇` is the corpus shape: the combining dot sits
 * between the letter and the mark. That occurrence is in the text
 * locus, so 0 of the 180 tag-locus marks needed this — the case is
 * here for the re-fetch that moves one into an attribute, which would
 * otherwise be refused as a stray gershayim on an honest repair. */
it('case 5 licenses a repair behind a combining dot', () => {
	const dotted =
		'<a class="refLink" href="/x" data-ref="Jastrow, מ̇ס̇"ך 1">ש</a>';
	const healed = dotted.replace(`̇"ך`, `̇${GERSHAYIM}ך`);
	expect(healed.replaceAll(GERSHAYIM, '"')).toBe(dotted);
	const after = entry(healed);
	expect(
		checkLinkTargets(
			entry(dotted),
			after,
			result(after, {
				glyphCorrected: [
					{ from: openTagOf(dotted), target: openTagOf(healed) },
				],
			}),
		),
	).toEqual([]);
});

/** …and the class stays strictly NARROWER than the rule's predicate,
 * which is the whole reason the gate declares its own. The rule admits
 * `html.ts`'s `HEBREW`, presentation forms included; this refuses a
 * mark flanked by one. Pinned so the next person to notice the
 * divergence widens it on a measurement, as U+0307 was widened, rather
 * than by importing `HEBREW_ATOM` and turning the gate into an echo of
 * the rule. */
it('case 5 still refuses a flank the gate does not admit', () => {
	const src =
		'<a class="refLink" href="/x" data-ref="Jastrow, \ufb2a"ב 1">ש</a>';
	const wide = src.replace(`\ufb2a"`, `\ufb2a${GERSHAYIM}`);
	expect(wide.replaceAll(GERSHAYIM, '"')).toBe(src);
	const after = entry(wide);
	expect(
		checkLinkTargets(
			entry(src),
			after,
			result(after, {
				glyphCorrected: [{ from: openTagOf(src), target: openTagOf(wide) }],
			}),
		),
	).toEqual([
		`glyph-corrected ${JSON.stringify(`Jastrow, \ufb2a${GERSHAYIM}ב 1`)} substitutes a quote that no Hebrew letters flank`,
	]);
});
