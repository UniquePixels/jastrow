/**
 * Review detector — `inflection-sublist-numbering-flattened`
 * (catalogue: 3 entries; 8 on the committed entries of 2026-10-10).
 * An unlabelled sense ends with an inflection label and its form
 * (`—Fem. חֲבִיבְתָּא`, `—Pl. אֲחָדִים`), and the next sense in the same
 * sequence is labelled `1`: print's `1)`, `—2)` … enumerate THAT form,
 * yet they sit as siblings of the lead, so sense 1 reads as a sense of
 * the headword.
 *
 * The mirror of `inline-inflection-sublist`, which the form-section
 * split (decision B12, `body/form-sections.ts`) now carves into a
 * sibling with nested senses (C00062's `—Pl. גְּבוּרוֹת`). Here upstream
 * had already split the numbered senses into siblings, so there is no
 * text left to carve, and no patch op nests one sense under another.
 * The page reads as print; only the structure is wrong, and the
 * structure is what a sense address would name (worklist §9,
 * maintainer ruling 2026-10-10: port a detector).
 *
 * `defer`: the app displays the text as printed, and nesting the
 * senses later moves no URL.
 */

import type { Entry, Sense } from '../../../entry/types.ts';
import { textOf } from '../gates.ts';
import { type ClassRow, entryRow } from './row.ts';
import { fieldsOf } from './senses.ts';

/** Catalogue id and report `kind` for a lead that ends on a form
 * label whose numbered senses follow it as siblings. */
const INFLECTION_SUBLIST_FLATTENED = 'inflection-sublist-numbering-flattened';

/** What the review report tells a reader to do about these rows. */
const INFLECTION_SUBLIST_FLATTENED_ACTION =
	'Before senses are addressed, nest the numbered senses under the form label that ends the lead (a nesting patch op, or the form-section split extended to siblings), reading the label on the scan first in case it is an OCR stem head; the text is print’s, so the page needs nothing meanwhile.';

/** The tail the class turns on: an em dash, a form label of the
 * form-section split's kind (plus `Du.` and `Sing.`, worklist §9), an
 * optional voice, then one or more comma-separated Hebrew words (a
 * letter, then letters, points, geresh and gershayim), and nothing
 * after them. */
const HEBREW_WORD: string = String.raw`[\u05D0-\u05EA][\u0591-\u05C7\u05D0-\u05EA\u05F3\u05F4]*`;
const FORM_LABEL: string = String.raw`—\s*(?:Pl|Fem|Du|Part|Denom|Sing)\.(?:\s*(?:pass|act)\.)?`;
const FORM_LABEL_TAIL: RegExp = new RegExp(
	String.raw`${FORM_LABEL}\s*${HEBREW_WORD}(?:,\s*${HEBREW_WORD})*$`,
	'u',
);

/** One sense sequence and the path prefix that names its members. */
interface Sequence {
	at: string;
	senses: readonly Sense[];
}

/** Every sense sequence of the entry, in document order: the top
 * level, each sense's children, then each stem's sequence the same
 * way. The class is about two NEIGHBOURS in one sequence, which
 * `walkSenses` does not give. */
function* sequencesOf(entry: Entry): Generator<Sequence> {
	function* from(senses: readonly Sense[], at: string): Generator<Sequence> {
		yield { at, senses };
		for (const [i, sense] of senses.entries()) {
			if ((sense.senses ?? []).length > 0) {
				yield* from(sense.senses ?? [], `${at}[${i}].senses`);
			}
		}
	}
	yield* from(entry.senses, 'senses');
	for (const [i, stem] of (entry.stems ?? []).entries()) {
		yield* from(stem.senses, `stems[${i}].senses`);
	}
}

/** The visible text of one sense's own fields, gloss then units. */
function ownText(path: string, sense: Sense): string {
	return [...fieldsOf({ path, sense })]
		.map(([, html]) => textOf(html))
		.join('');
}

/** The sites in one sequence: an unlabelled sense ending on a form
 * label and its form, followed by a sibling labelled `1`. */
function sitesIn({ at, senses }: Sequence): string[] {
	const sites: string[] = [];
	for (const [i, sense] of senses.entries()) {
		const next = senses[i + 1];
		if (next?.label !== '1' || (sense.label ?? '') !== '') {
			continue;
		}
		const path = `${at}[${i}]`;
		const tail = FORM_LABEL_TAIL.exec(ownText(path, sense).trimEnd());
		if (tail !== null) {
			sites.push(
				`${path} ends "${tail[0]}", and ${at}[${i + 1}] (labelled 1) follows it as a sibling`,
			);
		}
	}
	return sites;
}

/** One row per entry naming every lead whose form's numbered senses
 * were left at its own level. */
function detectInflectionSublistFlattened(entry: Entry): ClassRow[] {
	const sites = [...sequencesOf(entry)].flatMap(sitesIn);
	return entryRow(entry, INFLECTION_SUBLIST_FLATTENED, sites);
}

export {
	detectInflectionSublistFlattened,
	INFLECTION_SUBLIST_FLATTENED,
	INFLECTION_SUBLIST_FLATTENED_ACTION,
};
