/**
 * `plural-to-feminine-final-letter-mislink` (batch-2 task 6). Every
 * number in `misc-links.ts`'s module doc came from a corpus walk of
 * this shape — recursive through `sense.senses` (senses nest) and
 * `anchors(tokenize(definition))` for the anchors. This file's
 * corpus-walking tests at the bottom re-run the load-bearing claims
 * (raw population, clean population, retarget reachability) so a
 * corpus edit or a narrowed predicate fails here, on every `bun qa`,
 * rather than only on a `bun transform:count` someone remembers to
 * run.
 */
import { expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { tokenize } from '../html.ts';
import { anchors } from '../links.ts';
import { applyTransforms } from '../run.ts';
import {
	inCleanPlSpan,
	pluralToFeminineFinalLetter,
	pluralToFeminineMatch,
	pluralToFeminineRaw,
} from './misc-links.ts';

/** `headword` and `content.senses` are load-bearing for this row —
 * the predicate reads the host headword's own skeleton and every
 * sense's definition text — so every fixture carries them, in the
 * shape `rules/geresh.ts`'s tests use. */
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

/** C01080 גַּנָּב, excerpt: the catalogue's own worked example. Both
 * plural variants (גַּנָּבִים, גַּנָּבִין) anchor to the feminine
 * sibling גַּנָּבִית instead of to themselves. */
const C01080_PLURAL =
	'thief in Nisan or in Tishri is not a thief; a. fr.—Pl. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_גַּנָּבִית.1" ' +
	'data-ref="Jastrow, גַּנָּבִית 1">גַּנָּבִים</a>, ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_גַּנָּבִית.1" ' +
	'data-ref="Jastrow, גַּנָּבִית 1">גַּנָּבִין</a>. Tosef. B. Kam. VII, 8.';

/** A01423 אִיסְטְוָונִית, excerpt: a genuinely feminine headword's OWN
 * plural, ending -יּוֹת, correctly self-linked. Must never fire —
 * the display's final letter is ת, not ם/ן, and the target IS the
 * host. */
const A01423_OWN_PLURAL =
	'basilica. Tosef. Sabb. I, 4; a. fr.—Pl. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_אִיסְטְוָונִית.1" ' +
	'data-ref="Jastrow, אִיסְטְוָונִית 1">אִיסְטְוָונִיֹּות</a>. Ohol. l. c.';

/** H00796 חִילְתִּית, excerpt: a headword that ALREADY ends -ית. Its
 * own plural (חִילְתִּין) correctly resolves to itself — a self-link,
 * not a mislink to a "sibling", since there is no sibling. The
 * catalogue's own null model names this exact shape as the one
 * legitimate member the description could produce. */
const H00796_SELF_LINK =
	'(140ᵃ) אין שורין את הח׳ וכ׳ (Mish. ed. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_חִילְתִּית.1" ' +
	'data-ref="Jastrow, חִילְתִּית 1">חִילְתִּין</a>) you must not dissolve ' +
	'the resin of asa-foetida in warm water (on the Sabbath).';

/** K00357 כּוֹפֶת, excerpt: the entry's OWN plural (כּוֹפְתִין) is
 * printed unanchored right after "Pl."; a SEPARATE citation two
 * sentences later gives an edition's variant reading
 * (כָּפִיתִין), correctly anchored to a redirect-stub entry whose
 * `alt_headwords` is that exact spelling. Not part of the clean
 * Pl.-construct span, so it must not fire even though it matches the
 * raw shape. */
const K00357_VARIANT_READING =
	'a. e.—Pl. כּוֹפְתִין. Ib. in R. S. to Ohol l. c. (ed. Zuck. a. oth. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_כָּפִית.1" ' +
	'data-ref="Jastrow, כָּפִית 1">כָּפִיתִין</a>).';

/** A02980 אַרְגּוּבְלָא, excerpt: opens with a biblical-Hebrew cognate
 * citation, "(= b. h. גִּבְלִים)" — not this entry's plural at all
 * (which is separately, correctly self-linked later in the same
 * definition as אַרְגּוּבְלַיָּא). A "premise false" case: the anchor
 * merely string-matches the row's shape without being a printed
 * plural. */
const A02980_COGNATE_CITATION =
	' (= b. h. <a dir="rtl" class="refLink" href="/Jastrow,_גִּבְלִית.1" ' +
	'data-ref="Jastrow, גִּבְלִית 1">גִּבְלִים</a>) <i>Giblean</i>. Pl. ' +
	'<a dir="rtl" class="refLink" href="/Jastrow,_אַרְגּוּבְלָא.1" ' +
	'data-ref="Jastrow, אַרְגּוּבְלָא 1">אַרְגּוּבְלַיָּא</a>.';

it('unlinks a printed plural anchored to the feminine sibling, keeping the display', () => {
	const out = applyTransforms(
		entry('C01080', 'גַּנָּב', C01080_PLURAL),
		'text-repairs',
		[pluralToFeminineFinalLetter],
	);
	expect(definitionOf(out)).toBe(
		'thief in Nisan or in Tishri is not a thief; a. fr.—Pl. ' +
			'גַּנָּבִים, גַּנָּבִין. Tosef. B. Kam. VII, 8.',
	);
	expect(out.records).toHaveLength(1);
});

it('declares unlinks equal to the anchors it removed', () => {
	const result = pluralToFeminineFinalLetter.apply(
		entry('C01080', 'גַּנָּב', C01080_PLURAL),
	);
	expect(result.unlinks).toBe(2);
});

it('leaves a feminine headword’s own -יּוֹת plural alone', () => {
	const out = applyTransforms(
		entry('A01423', 'אִיסְטְוָונִית', A01423_OWN_PLURAL),
		'text-repairs',
		[pluralToFeminineFinalLetter],
	);
	expect(out.records).toHaveLength(0);
	expect(definitionOf(out)).toBe(A01423_OWN_PLURAL);
});

it('leaves a self-link alone (host headword already ends -ית)', () => {
	const out = applyTransforms(
		entry('H00796', 'חִילְתִּית', H00796_SELF_LINK),
		'text-repairs',
		[pluralToFeminineFinalLetter],
	);
	expect(out.records).toHaveLength(0);
});

it('leaves a variant-reading citation outside the Pl. construct alone', () => {
	const out = applyTransforms(
		entry('K00357', 'כּוֹפֶת', K00357_VARIANT_READING),
		'text-repairs',
		[pluralToFeminineFinalLetter],
	);
	expect(out.records).toHaveLength(0);
});

it('leaves a biblical-cognate citation alone (not the entry’s own plural)', () => {
	const out = applyTransforms(
		entry('A02980', 'אַרְגּוּבְלָא', A02980_COGNATE_CITATION),
		'text-repairs',
		[pluralToFeminineFinalLetter],
	);
	expect(out.records).toHaveLength(0);
});

it('a no-op entry produces no records and no unlinks', () => {
	const result = pluralToFeminineFinalLetter.apply(
		entry('Z99999', 'זְמַן', ' an ordinary entry with no plural anchor at all.'),
	);
	expect(result.records).toHaveLength(0);
	expect(result.unlinks).toBeUndefined();
});

/**
 * Corpus-walking measurements, restated from `misc-links.ts`'s module
 * doc so a corpus edit or a narrowed predicate fails here rather than
 * only on a manually-run `bun transform:count`. Written as plain
 * top-level recursive counters — never a closure declared inside the
 * `for await` loops below — the shape `lint/nursery/noLoopFunc` (and
 * `rules/unlink.ts`'s own note on the same rule) asks for: a closure
 * created fresh every corpus iteration and captured by a `let` outside
 * the loop is exactly what that rule flags, even when — as here — the
 * closure runs and is discarded synchronously before the next
 * iteration.
 */

/** Count of `pluralToFeminineRaw` matches across `senses`, recursive
 * through `sense.senses`. */
function countRaw(e: SourceEntry, senses: readonly SourceSense[]): number {
	let count = 0;
	for (const sense of senses) {
		if (sense.definition !== undefined) {
			for (const anchor of anchors(tokenize(sense.definition))) {
				if (pluralToFeminineRaw(e, anchor)) {
					count++;
				}
			}
		}
		if (sense.senses !== undefined) {
			count += countRaw(e, sense.senses);
		}
	}
	return count;
}

/** Count of `pluralToFeminineMatch` matches across `senses` — the
 * rule's actual firing set. */
function countClean(e: SourceEntry, senses: readonly SourceSense[]): number {
	let count = 0;
	for (const sense of senses) {
		if (sense.definition !== undefined) {
			const tokens = tokenize(sense.definition);
			for (const anchor of anchors(tokens)) {
				if (pluralToFeminineMatch(e, tokens, anchor)) {
					count++;
				}
			}
		}
		if (sense.senses !== undefined) {
			count += countClean(e, sense.senses);
		}
	}
	return count;
}

/** Count of anchors across `senses` (recursive) whose `data-ref` starts
 * `prefix` — the only thing that would license a retarget under spec
 * §3.2 case 2. */
function countOwnTargets(
	prefix: string,
	senses: readonly SourceSense[],
): number {
	let count = 0;
	for (const sense of senses) {
		if (sense.definition !== undefined) {
			for (const anchor of anchors(tokenize(sense.definition))) {
				if (anchor.dataRef.startsWith(prefix)) {
					count++;
				}
			}
		}
		if (sense.senses !== undefined) {
			count += countOwnTargets(prefix, sense.senses);
		}
	}
	return count;
}

it('the raw population is 65 occurrences / 55 entries, corpus-wide', async () => {
	let occurrences = 0;
	const rids = new Set<string>();
	for await (const e of readSourceEntries()) {
		const n = countRaw(e, e.content.senses);
		occurrences += n;
		if (n > 0) {
			rids.add(e.rid);
		}
	}
	expect(occurrences).toBe(65);
	expect(rids.size).toBe(55);
});

it('the clean population (the rule’s actual firing set) is 60 occurrences / 50 entries', async () => {
	let occurrences = 0;
	const rids = new Set<string>();
	for await (const e of readSourceEntries()) {
		const n = countClean(e, e.content.senses);
		occurrences += n;
		if (n > 0) {
			rids.add(e.rid);
		}
	}
	expect(occurrences).toBe(60);
	expect(rids.size).toBe(50);
});

/** Gate-case-2 reachability: of the clean population, how many
 * OCCURRENCES sit in an entry that carries SOME anchor (anywhere
 * `fieldsOf` would walk) whose `data-ref` starts `Jastrow, <this
 * entry's own headword>` — the only thing that would license a
 * retarget under spec §3.2 case 2. Measured at 10/60 (16.7%), which is
 * why this row unlinks instead of retargeting; see the module doc. */
it('retarget is reachable for only 10 of 60 clean occurrences (16.7%)', async () => {
	let total = 0;
	let reachable = 0;
	for await (const e of readSourceEntries()) {
		const n = countClean(e, e.content.senses);
		if (n === 0) {
			continue;
		}
		total += n;
		if (countOwnTargets(`Jastrow, ${e.headword}`, e.content.senses) > 0) {
			reachable += n;
		}
	}
	expect(total).toBe(60);
	expect(reachable).toBe(10);
});

it('inCleanPlSpan is exported and agrees with the module doc’s classification', () => {
	// K00357's variant-reading anchor sits outside the clean span even
	// though it matches the raw shape — the direct regression the unit
	// test above exercises through applyTransforms.
	const tokens = tokenize(K00357_VARIANT_READING);
	const [anchor] = anchors(tokens);
	if (anchor === undefined) {
		throw new Error('expected K00357_VARIANT_READING to contain one anchor');
	}
	expect(inCleanPlSpan(tokens, anchor.open)).toBe(false);
});
