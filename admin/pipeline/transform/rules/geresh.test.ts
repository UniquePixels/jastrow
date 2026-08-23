/**
 * Discovery queries behind `rules/geresh.ts` (batch-2 task 5). Every
 * number in that module's docstring came from a corpus walk of this
 * shape — `fieldsOf` for the target census, a RECURSIVE
 * `content.senses` walk for the population (senses nest; a flat walk
 * loses a quarter of it), `anchors(tokenize(field))` for the anchors:
 *
 * ```ts
 * for await (const entry of readSourceEntries()) {
 *   for (const definition of definitionsOf(entry)) {
 *     for (const anchor of anchors(tokenize(definition))) {
 *       if (bareStubRaw(entry, anchor)) { … }
 *     }
 *   }
 * }
 * ```
 *
 * task-5-report.md has the runnable scripts. The corpus-walking tests
 * at the bottom of this file re-run the two that are load-bearing —
 * the population sizes and the decline counts — so a corpus edit that
 * moves either fails here, on every `bun qa`, rather than only on a
 * `bun transform:count` someone remembers to run.
 */
import { expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry } from '../../body/types.ts';
import { tokenize } from '../html.ts';
import { anchors } from '../links.ts';
import { fieldsOf } from '../no-new-text.ts';
import { applyTransforms } from '../run.ts';
import {
	bareStubRaw,
	gereshLetterNumeral,
	prefixedGereshAbbrev,
	prefixedStubRaw,
	selfTarget,
} from './geresh.ts';

/** `headword` is load-bearing for both rules — it is what the stub
 * must abbreviate — and `fieldsOf` reads it when building the gate's
 * text multiset, so every fixture carries the real one. */
const entry = (
	rid: string,
	headword: string,
	...definitions: string[]
): SourceEntry =>
	({
		content: { senses: definitions.map((definition) => ({ definition })) },
		headword,
		rid,
	}) as SourceEntry;

const definitionOf = (
	out: { entry: SourceEntry },
	at = 0,
): string | undefined => out.entry.content.senses[at]?.definition;

/** A01891 sense 3, excerpt: the entry's own `Jastrow, אֲלַכְסוֹן 1`
 * anchor. This is what makes the retarget a COPY (spec §3.2 case 2)
 * rather than a composition — the address is already in the entry's
 * input, so nothing is synthesized from the headword. */
const A01891_SELF =
	'<a dir="rtl" class="refLink" href="/Jastrow,_אֲלַכְסוֹן.1" ' +
	'data-ref="Jastrow, אֲלַכְסוֹן 1">אֲלַכְסוֹן</a>, ch. form ';

/** A01891 sense 2, excerpt: `א׳` standing for אֲלַכְסוֹן, anchored to
 * the numeral article for aleph. */
const A01891_STUB =
	'two feet &c. of a bed cut off <a dir="rtl" class="refLink" ' +
	'href="/Jastrow,_א׳.1" data-ref="Jastrow, א׳ 1">א׳</a> crosswise;';

it('retargets a one-letter geresh stub to the containing entry', () => {
	const out = applyTransforms(
		entry('A01891', 'אֲלַכְסוֹן', A01891_STUB, A01891_SELF),
		'text-repairs',
		[gereshLetterNumeral],
	);
	expect(definitionOf(out)).toContain(
		'href="/Jastrow,_אֲלַכְסוֹן.1" data-ref="Jastrow, אֲלַכְסוֹן 1">א׳</a>',
	);
	expect(out.records).toHaveLength(1);
});

it('leaves the display text and every other byte alone', () => {
	const out = applyTransforms(
		entry('A01891', 'אֲלַכְסוֹן', A01891_STUB, A01891_SELF),
		'text-repairs',
		[gereshLetterNumeral],
	);
	expect(definitionOf(out)).toBe(
		A01891_STUB.replace('/Jastrow,_א׳.1', '/Jastrow,_אֲלַכְסוֹן.1').replace(
			'Jastrow, א׳ 1',
			'Jastrow, אֲלַכְסוֹן 1',
		),
	);
	// The sibling that supplied the target is untouched.
	expect(definitionOf(out, 1)).toBe(A01891_SELF);
});

/** A00268, verbatim tail: the same defect in an entry that never
 * links to its own headword — 84% of the row (see the module doc). */
const A00268 =
	'[Tanʿh. Vaëra 8, <a dir="rtl" class="refLink" href="/Jastrow,_א׳.1" ' +
	'data-ref="Jastrow, א׳ 1">א׳</a>, read <span dir="rtl">טוס …</span>]';

it('declines when the entry holds no anchor to its own headword', () => {
	const source = entry('A00268', 'אָגוּסְטָא', A00268);
	const out = applyTransforms(source, 'text-repairs', [gereshLetterNumeral]);
	expect(definitionOf(out)).toBe(A00268);
	expect(out.records).toHaveLength(0);
	// Declined, not unmatched: the defect predicate does fire here.
	const [anchor] = anchors(tokenize(A00268));
	expect(anchor).toBeDefined();
	expect(anchor !== undefined && bareStubRaw(source, anchor)).toBe(true);
	expect(selfTarget(source)).toBeUndefined();
});

/** A01905 sense 2, excerpt: "ed. Vien. א׳ (ed. Berl. ע׳ …)". `ע׳`
 * abbreviates the VARIANT READING עלם named in the prose, not the
 * headword אֲלַם — retargeting it would assert the variant is the
 * lemma. The `א׳` beside it DOES abbreviate the headword and is
 * repaired; the two sit in one definition, which is what makes this
 * fixture worth its length. */
const A01905 =
	'Targ. O. Deut. XXXI, 6; 23 ed. Vien. <a dir="rtl" class="refLink" ' +
	'href="/Jastrow,_א׳.1" data-ref="Jastrow, א׳ 1">א׳</a> (ed. Berl. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_ע׳.1" ' +
	'data-ref="Jastrow, ע׳ 1">ע׳</a>, v. Berl. Targ. O. II, p. 59).';

/** A01905 sense 2, excerpt: the entry's own anchor. */
const A01905_SELF =
	'<a dir="rtl" class="refLink" href="/Jastrow,_אֲלַם.1" ' +
	'data-ref="Jastrow, אֲלַם 1">אֲלַם</a> (h. text …)';

it('leaves a variant-reading stub alone and repairs its neighbour', () => {
	const out = applyTransforms(
		entry('A01905', 'אֲלַם', A01905, A01905_SELF),
		'text-repairs',
		[gereshLetterNumeral],
	);
	const after = definitionOf(out);
	expect(after).toContain('data-ref="Jastrow, ע׳ 1">ע׳</a>');
	expect(after).toContain('data-ref="Jastrow, אֲלַם 1">א׳</a>');
	expect(out.records).toHaveLength(1);
});

/** D00921, excerpt: "Var. (ed. Zuck. ר׳)". `ר׳` here is Rabbi before
 * a name, not an abbreviation of *דָּנָב — it should not be a lexical
 * link at all, but unlinking is `rules/unlink.ts`'s machine and a
 * different row. This rule leaves it standing. The entry's own
 * `Jastrow, *דָּנָב 1` anchor is present, so the rule would have had a
 * target to write: the exclusion is the predicate, not a decline. */
const D00921 =
	'Tosef. Dem. I, 13 אוצרה של ד׳ Var. (ed. Zuck. <a dir="rtl" ' +
	'class="refLink" href="/Jastrow,_ר׳.1" data-ref="Jastrow, ר׳ 1">ר׳</a>). ' +
	'(Var. ed. Zuck. <span dir="rtl">דגב</span>, <a dir="rtl" ' +
	'class="refLink" href="/Jastrow,_*דָּנָב.1" ' +
	'data-ref="Jastrow, *דָּנָב 1">דנב</a>, text)';

it('leaves ר׳ = Rabbi alone', () => {
	const source = entry('D00921', '*דָּנָב', D00921);
	const out = applyTransforms(source, 'text-repairs', [gereshLetterNumeral]);
	expect(definitionOf(out)).toBe(D00921);
	expect(out.records).toHaveLength(0);
	// A target WAS available — this is an exclusion, not a decline.
	expect(selfTarget(source)).toEqual({
		dataRef: 'Jastrow, *דָּנָב 1',
		href: '/Jastrow,_*דָּנָב.1',
	});
});

/** A00006, excerpt: the numeral article for aleph, whose own text
 * links `א׳` to itself and `ב׳` to the article for beth. Both links
 * are CORRECT — this is the convention, not the defect. */
const A00006 =
	'between the full numeral and the numeral letter, <a dir="rtl" ' +
	'class="refLink" href="/Jastrow,_א׳.1" data-ref="Jastrow, א׳ 1">א׳</a> ' +
	'for <span dir="rtl">אחד</span>; <a dir="rtl" class="refLink" ' +
	'href="/Jastrow,_ב׳.1" data-ref="Jastrow, ב׳ 1">ב׳</a> for ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_שְׁנַיִם.1" ' +
	'data-ref="Jastrow, שְׁנַיִם 1">שנים</a>';

it('leaves the numeral articles’ own links alone', () => {
	const out = applyTransforms(entry('A00006', 'א׳', A00006), 'text-repairs', [
		gereshLetterNumeral,
	]);
	expect(definitionOf(out)).toBe(A00006);
	expect(out.records).toHaveLength(0);
});

/** F00014 sense 3, excerpt: `בְּוַ׳` (bᵉ- + וַדַּאי, "in certainty")
 * read as a standalone word בו and resolved to בַּצּוֹרְתָא, beside
 * `וַ׳` — the bare arm — resolved to the numeral article for vav.
 * ONE definition carrying one member of each row: the entanglement
 * the catalogue now records, in bytes. */
const F00014 =
	'—<a dir="rtl" class="refLink" href="/Jastrow,_בַּצּוֹרְתָא.1" ' +
	'data-ref="Jastrow, בַּצּוֹרְתָא 1">בְּוַ׳</a>, <a dir="rtl" ' +
	'class="refLink" href="/Jastrow,_ו׳.1" data-ref="Jastrow, ו׳ 1">וַ׳</a> ' +
	'(adv.) <i>surely, indeed</i>.';

/** F00014 sense 2, excerpt: the entry's own anchor. */
const F00014_SELF =
	'<a dir="rtl" class="refLink" href="/Jastrow,_וַדַּאי.1" ' +
	'data-ref="Jastrow, וַדַּאי 1">וַודָּיָיהּ</a> where there is no doubt';

it('the prefixed arm retargets through its particle', () => {
	const out = applyTransforms(
		entry('F00014', 'וַדַּאי', F00014, F00014_SELF),
		'text-repairs',
		[prefixedGereshAbbrev],
	);
	expect(definitionOf(out)).toContain('data-ref="Jastrow, וַדַּאי 1">בְּוַ׳</a>');
	// The bare stub beside it belongs to the other rule.
	expect(definitionOf(out)).toContain('data-ref="Jastrow, ו׳ 1">וַ׳</a>');
	expect(out.records).toHaveLength(1);
});

it('the pair repairs both members of one definition, either order', () => {
	const source = entry('F00014', 'וַדַּאי', F00014, F00014_SELF);
	const forward = applyTransforms(source, 'text-repairs', [
		gereshLetterNumeral,
		prefixedGereshAbbrev,
	]);
	const backward = applyTransforms(source, 'text-repairs', [
		prefixedGereshAbbrev,
		gereshLetterNumeral,
	]);
	expect(definitionOf(forward)).toBe(definitionOf(backward));
	expect(definitionOf(forward)).toContain('data-ref="Jastrow, וַדַּאי 1">בְּוַ׳</a>');
	expect(definitionOf(forward)).toContain('data-ref="Jastrow, וַדַּאי 1">וַ׳</a>');
	expect(forward.records).toHaveLength(2);
	expect(backward.records).toHaveLength(2);
});

/** K00250: the entry IS `כּוֹכָב ²` and its `כֹּכְ׳` already points at
 * `Jastrow, כּוֹכָב ² 1`. The rule's own target and the anchor's
 * current one are the same string, so the write is a no-op and no
 * record is produced — the reason the two "host is the article it
 * links to" members need no exception list. */
const K00250 =
	'Pl. <span dir="rtl">כּוֹכְבֵי</span>, <a dir="rtl" class="refLink" ' +
	'href="/Jastrow,_כּוֹכָב ².1" data-ref="Jastrow, כּוֹכָב ² 1">כֹּכְ׳</a>. ' +
	'Targ. Gen. I, 16; a. fr.';

it('does not record a retarget that would rewrite nothing', () => {
	const out = applyTransforms(
		entry('K00250', 'כּוֹכָב ²', K00250),
		'text-repairs',
		[prefixedGereshAbbrev],
	);
	expect(definitionOf(out)).toBe(K00250);
	expect(out.records).toHaveLength(0);
});

it('reaches a stub nested inside a sub-sense', () => {
	const source = {
		content: {
			senses: [
				{ definition: A01891_SELF, senses: [{ definition: A01891_STUB }] },
			],
		},
		headword: 'אֲלַכְסוֹן',
		rid: 'A01891',
	} as SourceEntry;
	const out = applyTransforms(source, 'text-repairs', [gereshLetterNumeral]);
	expect(out.entry.content.senses[0]?.senses?.[0]?.definition).toContain(
		'data-ref="Jastrow, אֲלַכְסוֹן 1">א׳</a>',
	);
	expect(out.records).toHaveLength(1);
});

/** The no-op detector. A predicate that silently stops matching — a
 * character class where a digraph was meant, a niqqud-intolerant stub
 * pattern — passes every other gate in this file by doing nothing.
 * These two counts are the whole population, measured; they fail on
 * any predicate that narrows, and on any corpus edit that moves the
 * row out from under it. */
it('matches the measured corpus population, both arms', async () => {
	let bare = 0;
	let prefixed = 0;
	const bareEntries = new Set<string>();
	const prefixedEntries = new Set<string>();
	for await (const source of readSourceEntries()) {
		for (const definition of definitionsOf(source)) {
			for (const anchor of anchors(tokenize(definition))) {
				if (bareStubRaw(source, anchor)) {
					bare += 1;
					bareEntries.add(source.rid);
				}
				if (prefixedStubRaw(source, anchor)) {
					prefixed += 1;
					prefixedEntries.add(source.rid);
				}
			}
		}
	}
	expect({ bare, entries: bareEntries.size }).toEqual({
		bare: 517,
		entries: 475,
	});
	expect({ entries: prefixedEntries.size, prefixed }).toEqual({
		entries: 173,
		prefixed: 185,
	});
}, 120_000);

/** The decline census, run as a test for the reason `unlink.ts`'s
 * `unobservedConvention` is: `bun transform:count` sees only the
 * entries a rule TOUCHED, so the gap between the population above and
 * what `transform:count` reports is invisible to it. Pinning the
 * declines here says which half moved when one of them does. */
it('declines exactly the members whose entry holds no self anchor', async () => {
	const fired = { bare: 0, prefixed: 0 };
	const declined = { bare: 0, prefixed: 0 };
	for await (const source of readSourceEntries()) {
		tallyArms(source, selfTarget(source) === undefined ? declined : fired);
	}
	expect(fired).toEqual({ bare: 81, prefixed: 28 });
	expect(declined).toEqual({ bare: 436, prefixed: 157 });
}, 120_000);

/** Add one entry's members to `tally`, per arm. Split out of the
 * decline census only to keep the four nesting levels the walk needs
 * under the cognitive-complexity budget. */
function tallyArms(
	source: SourceEntry,
	tally: { bare: number; prefixed: number },
): void {
	for (const definition of definitionsOf(source)) {
		for (const anchor of anchors(tokenize(definition))) {
			if (bareStubRaw(source, anchor)) {
				tally.bare += 1;
			} else if (prefixedStubRaw(source, anchor)) {
				tally.prefixed += 1;
			}
		}
	}
}

/** The recursive definition walk both corpus tests above use — the
 * same shape `retargetOverDefinitions` walks. Senses nest, and a flat
 * `content.senses` walk loses about a quarter of this population. */
function* definitionsOf(source: SourceEntry): Generator<string> {
	const walk = function* (
		senses: readonly { definition?: string; senses?: unknown[] }[],
	): Generator<string> {
		for (const sense of senses) {
			if (sense.definition !== undefined) {
				yield sense.definition;
			}
			if (sense.senses !== undefined) {
				yield* walk(
					sense.senses as { definition?: string; senses?: unknown[] }[],
				);
			}
		}
	};
	yield* walk(source.content.senses);
}

it('finds the self target in a field outside the definitions', () => {
	const source = {
		content: { senses: [{ definition: A01891_STUB }] },
		headword: 'אֲלַכְסוֹן',
		language_reference: A01891_SELF,
		rid: 'A01891',
	} as SourceEntry;
	expect(fieldsOf(source)).toContain(A01891_SELF);
	expect(selfTarget(source)?.dataRef).toBe('Jastrow, אֲלַכְסוֹן 1');
});
