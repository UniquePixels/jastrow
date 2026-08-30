/**
 * Discovery queries behind `rules/geresh.ts` (batch-2 task 5). Every
 * number in that module's docstring came from a corpus walk of this
 * shape — a RECURSIVE `content.senses` walk (senses nest; a flat walk
 * loses about a quarter of the population) and
 * `anchors(tokenize(definition))` for the anchors:
 *
 * ```ts
 * for (const entry of await sourceEntries()) {
 *   for (const definition of definitionsOf(entry)) {
 *     for (const anchor of anchors(tokenize(definition))) {
 *       if (bareStubRaw(entry, anchor)) { … }
 *     }
 *   }
 * }
 * ```
 *
 * task-5-report.md and `data/patches/catalogue-audit/geresh-abbrev-arms.md`
 * have the runnable scripts, including the ones for the arms these
 * rules deliberately leave alone. The corpus-walking tests at the
 * bottom of this file re-run the two that are load-bearing — the
 * population sizes, and the claim that the rules repair all of them —
 * so a corpus edit or a narrowed predicate fails here, on every
 * `bun qa`, rather than only on a `bun transform:count` someone
 * remembers to run.
 */
import { expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { tokenize } from '../html.ts';
import { anchors } from '../links.ts';
import { applyTransforms } from '../run.ts';
import { sourceEntries } from './corpus-fixture.ts';
import {
	bareStubRaw,
	gereshLetterNumeral,
	prefixedGereshAbbrev,
	prefixedStubRaw,
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

/** A01891 sense 2, excerpt: `א׳` standing for אֲלַכְסוֹן, anchored to
 * the numeral article for aleph. */
const A01891_STUB =
	'two feet &c. of a bed cut off <a dir="rtl" class="refLink" ' +
	'href="/Jastrow,_א׳.1" data-ref="Jastrow, א׳ 1">א׳</a> crosswise;';

it('unlinks a one-letter geresh stub, keeping the display', () => {
	const out = applyTransforms(
		entry('A01891', 'אֲלַכְסוֹן', A01891_STUB),
		'text-repairs',
		[gereshLetterNumeral],
	);
	expect(definitionOf(out)).toBe('two feet &c. of a bed cut off א׳ crosswise;');
	expect(out.records).toHaveLength(1);
});

it('declares unlinks equal to the anchors it removed', () => {
	const result = gereshLetterNumeral.apply(
		entry('A01891', 'אֲלַכְסוֹן', A01891_STUB),
	);
	expect(result.unlinks).toBe(1);
});

/** The ruling is "drop the anchor and keep the display text". Jastrow
 * wrote the abbreviation; Sefaria's linker added the target. A rule
 * that swallowed the stub with the tag would still pass the markup
 * gate (fewer tags reads as an improvement) and the text gate (a
 * deletion is a legitimate sub-multiset), so nothing but this
 * assertion stands between that and a silent data loss. */
it('keeps the stub text itself', () => {
	const out = applyTransforms(
		entry('A01891', 'אֲלַכְסוֹן', A01891_STUB),
		'text-repairs',
		[gereshLetterNumeral],
	);
	expect(definitionOf(out)).toContain('א׳');
	expect(definitionOf(out)).not.toContain('<a ');
	expect(definitionOf(out)).not.toContain('</a>');
});

/** A00268, verbatim tail. Under the superseded RETARGET plan this
 * entry was one of the 84% that had to decline — it never links to
 * its own headword, so there was no address to copy. Unlink needs no
 * address, so it is repaired like any other member. */
const A00268 =
	'[Tanʿh. Vaëra 8, <a dir="rtl" class="refLink" href="/Jastrow,_א׳.1" ' +
	'data-ref="Jastrow, א׳ 1">א׳</a>, read <span dir="rtl">טוס …</span>]';

it('repairs a member whose entry never names its own headword', () => {
	const source = entry('A00268', 'אָגוּסְטָא', A00268);
	const out = applyTransforms(source, 'text-repairs', [gereshLetterNumeral]);
	expect(definitionOf(out)).toBe(
		'[Tanʿh. Vaëra 8, א׳, read <span dir="rtl">טוס …</span>]',
	);
	expect(out.records).toHaveLength(1);
});

/** A01905 sense 2, excerpt: "ed. Vien. א׳ (ed. Berl. ע׳ …)". `ע׳`
 * abbreviates the VARIANT READING עלם named in the prose, not the
 * headword אֲלַם. The `א׳` beside it DOES abbreviate the headword and
 * is repaired; the two sit in one definition, which is what makes
 * this fixture worth its length — the exclusion cannot be satisfied
 * by the rule simply doing nothing here. */
const A01905 =
	'Targ. O. Deut. XXXI, 6; 23 ed. Vien. <a dir="rtl" class="refLink" ' +
	'href="/Jastrow,_א׳.1" data-ref="Jastrow, א׳ 1">א׳</a> (ed. Berl. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_ע׳.1" ' +
	'data-ref="Jastrow, ע׳ 1">ע׳</a>, v. Berl. Targ. O. II, p. 59).';

it('leaves a variant-reading stub linked and repairs its neighbour', () => {
	const out = applyTransforms(entry('A01905', 'אֲלַם', A01905), 'text-repairs', [
		gereshLetterNumeral,
	]);
	expect(definitionOf(out)).toBe(
		'Targ. O. Deut. XXXI, 6; 23 ed. Vien. א׳ (ed. Berl. ' +
			'<a dir="rtl" class="refLink" href="/Jastrow,_ע׳.1" ' +
			'data-ref="Jastrow, ע׳ 1">ע׳</a>, v. Berl. Targ. O. II, p. 59).',
	);
	expect(out.records).toHaveLength(1);
});

/** D00921, excerpt: "Var. (ed. Zuck. ר׳)". `ר׳` here is Rabbi before
 * a name, not an abbreviation of *דָּנָב. It should not be a lexical
 * link at all, but `rabbi-name-linked-as-bible-book` owns that shape
 * and these sit outside its cue, so this rule leaves them standing
 * and the exception register records them. */
const D00921 =
	'Tosef. Dem. I, 13 אוצרה של ד׳ Var. (ed. Zuck. <a dir="rtl" ' +
	'class="refLink" href="/Jastrow,_ר׳.1" data-ref="Jastrow, ר׳ 1">ר׳</a>).';

it('leaves ר׳ = Rabbi alone in a non-resh entry', () => {
	const out = applyTransforms(entry('D00921', '*דָּנָב', D00921), 'text-repairs', [
		gereshLetterNumeral,
	]);
	expect(definitionOf(out)).toBe(D00921);
	expect(out.records).toHaveLength(0);
});

/** A00006, excerpt: the numeral article for aleph. Its `ב׳` links to
 * the article for beth — CORRECT, the convention, and left alone. Its
 * `א׳` links to ITSELF, which is inside the strict population and is
 * unlinked: a self-link promises an article the reader is already
 * reading (Task 4's finding). Both halves in one fixture. */
const A00006 =
	'between the full numeral and the numeral letter, <a dir="rtl" ' +
	'class="refLink" href="/Jastrow,_א׳.1" data-ref="Jastrow, א׳ 1">א׳</a> ' +
	'for <span dir="rtl">אחד</span>; <a dir="rtl" class="refLink" ' +
	'href="/Jastrow,_ב׳.1" data-ref="Jastrow, ב׳ 1">ב׳</a> for ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_שְׁנַיִם.1" ' +
	'data-ref="Jastrow, שְׁנַיִם 1">שנים</a>';

it('keeps a numeral article’s link to another letter, drops its self-link', () => {
	const out = applyTransforms(entry('A00006', 'א׳', A00006), 'text-repairs', [
		gereshLetterNumeral,
	]);
	const after = definitionOf(out);
	expect(after).toContain('data-ref="Jastrow, ב׳ 1">ב׳</a>');
	expect(after).toContain('numeral letter, א׳ for');
	expect(after).not.toContain('data-ref="Jastrow, א׳ 1"');
	expect(out.records).toHaveLength(1);
});

/** F00014 sense 3, excerpt: `בְּוַ׳` (bᵉ- + וַדַּאי, "in certainty")
 * read as a standalone word בו and resolved to בַּצּוֹרְתָא, beside
 * `וַ׳` — the bare arm — resolved to the numeral article for vav. ONE
 * definition carrying one member of each row: the entanglement the
 * catalogue records, in bytes. */
const F00014 =
	'—<a dir="rtl" class="refLink" href="/Jastrow,_בַּצּוֹרְתָא.1" ' +
	'data-ref="Jastrow, בַּצּוֹרְתָא 1">בְּוַ׳</a>, <a dir="rtl" ' +
	'class="refLink" href="/Jastrow,_ו׳.1" data-ref="Jastrow, ו׳ 1">וַ׳</a> ' +
	'(adv.) <i>surely, indeed</i>.';

it('the prefixed arm unlinks through its particle', () => {
	const out = applyTransforms(entry('F00014', 'וַדַּאי', F00014), 'text-repairs', [
		prefixedGereshAbbrev,
	]);
	expect(definitionOf(out)).toContain('—בְּוַ׳, ');
	// The bare stub beside it belongs to the other rule.
	expect(definitionOf(out)).toContain('data-ref="Jastrow, ו׳ 1">וַ׳</a>');
	expect(out.records).toHaveLength(1);
});

it('the pair repairs both members of one definition, either order', () => {
	const source = entry('F00014', 'וַדַּאי', F00014);
	const forward = applyTransforms(source, 'text-repairs', [
		gereshLetterNumeral,
		prefixedGereshAbbrev,
	]);
	const backward = applyTransforms(source, 'text-repairs', [
		prefixedGereshAbbrev,
		gereshLetterNumeral,
	]);
	expect(definitionOf(forward)).toBe(definitionOf(backward));
	expect(definitionOf(forward)).toBe('—בְּוַ׳, וַ׳ (adv.) <i>surely, indeed</i>.');
	expect(forward.records).toHaveLength(2);
	expect(backward.records).toHaveLength(2);
});

it('reaches a stub nested inside a sub-sense', () => {
	const source = {
		content: { senses: [{ definition: '', senses: [{ definition: F00014 }] }] },
		headword: 'וַדַּאי',
		rid: 'F00014',
	} as SourceEntry;
	const out = applyTransforms(source, 'text-repairs', [
		gereshLetterNumeral,
		prefixedGereshAbbrev,
	]);
	expect(out.entry.content.senses[0]?.senses?.[0]?.definition).toBe(
		'—בְּוַ׳, וַ׳ (adv.) <i>surely, indeed</i>.',
	);
	expect(out.records).toHaveLength(2);
});

/** Add one entry's members to `tally`, per arm. Split out of the
 * corpus census only to keep the nesting the walk needs under the
 * cognitive-complexity budget. */
function tallyArms(
	source: SourceEntry,
	tally: { bare: number; prefixed: number },
	entries: { bare: Set<string>; prefixed: Set<string> },
): void {
	for (const definition of definitionsOf(source)) {
		for (const anchor of anchors(tokenize(definition))) {
			if (bareStubRaw(source, anchor)) {
				tally.bare += 1;
				entries.bare.add(source.rid);
			} else if (prefixedStubRaw(source, anchor)) {
				tally.prefixed += 1;
				entries.prefixed.add(source.rid);
			}
		}
	}
}

/** The recursive definition walk the corpus tests use — the same
 * shape `unlinkOverDefinitions` walks. Senses nest, and a flat
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

/** The no-op detector. A predicate that silently stops matching — a
 * character class where a digraph was meant, a niqqud-intolerant stub
 * pattern (which measures 690 where the truth is 707) — passes every
 * other test in this file by doing nothing. These counts are the
 * whole population, measured, and they fail on any predicate that
 * narrows. */
it('matches the measured corpus population, both arms', async () => {
	const tally = { bare: 0, prefixed: 0 };
	const entries = { bare: new Set<string>(), prefixed: new Set<string>() };
	for (const source of await sourceEntries()) {
		tallyArms(source, tally, entries);
	}
	expect({ entries: entries.bare.size, occurrences: tally.bare }).toEqual({
		entries: 475,
		occurrences: 517,
	});
	expect({
		entries: entries.prefixed.size,
		occurrences: tally.prefixed,
	}).toEqual({ entries: 173, occurrences: 185 });
}, 120_000);

/** The other half of the pair above: the population is one number,
 * what the rules actually REMOVE is another, and `transform:count`
 * reports only the second. Pinning both means a member the removal
 * loop skips — an anchor it finds unusable, one buried in a nested
 * pair — shows up as a gap here instead of as a quiet shortfall.
 * Measured: zero gap, all 702 occurrences removed. */
it('unlinks every member of both populations', async () => {
	const removed = { bare: 0, prefixed: 0 };
	const entries = { bare: 0, prefixed: 0 };
	for (const source of await sourceEntries()) {
		const bare = gereshLetterNumeral.apply(source);
		const prefixed = prefixedGereshAbbrev.apply(source);
		removed.bare += bare.unlinks ?? 0;
		removed.prefixed += prefixed.unlinks ?? 0;
		entries.bare += bare.records.length > 0 ? 1 : 0;
		entries.prefixed += prefixed.records.length > 0 ? 1 : 0;
	}
	expect(removed).toEqual({ bare: 517, prefixed: 185 });
	expect(entries).toEqual({ bare: 475, prefixed: 173 });
}, 120_000);
