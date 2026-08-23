import { expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { checkLinkTargets } from './link-target.ts';
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
