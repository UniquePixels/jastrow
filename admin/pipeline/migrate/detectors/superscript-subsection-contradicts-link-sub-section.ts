/**
 * Review detector — `superscript-subsection-contradicts-link-sub-
 * section` (catalogue: 33 entries, 38 occurrences). A `<sup>N</sup>`
 * last inside a `<cite>` whose `ref` ends `:M`, with N ≠ M — the
 * printed sub-section disagreeing with the one the link lands on
 * (`T00292`: `Num. R. s. 14⁷` against `Bamidbar Rabbah 14:12`).
 *
 * The PREDICATE IS WRITTEN AGAINST THE TRUTH SHAPE, deliberately: the
 * source spells this `</a><sup>N</sup>` and `superscriptInsideAnchor`
 * moves the superscript inside before the entry is finished, so a
 * predicate written for the snapshot would measure zero here.
 *
 * Nothing mechanical recovers the right value — the deltas spread
 * -17 to +20 with no constant offset and no dominant direction — so
 * each one is adjudicated against the linked text by hand. The
 * chapter never disagrees; only the second component is ever in
 * dispute.
 */
import type { TruthEntry } from '../types.ts';
import { type ClassRow, entryRow } from './row.ts';
import { markupFields } from './senses.ts';

const SUPERSCRIPT_SUBSECTION_CONTRADICTS =
	'superscript-subsection-contradicts-link-sub-section';

const CITE = /<cite ref="(?<ref>[^"]*)">(?<inner>.*?)<\/cite>/gsu;
const REF_SUB_SECTION = /:(?<sub>\d+)$/u;
const TRAILING_SUP = /<sup>(?<printed>\d+)<\/sup>\s*$/u;

/** Every disagreeing anchor in one field, as report detail. */
function contradictions(path: string, html: string): string[] {
	const found: string[] = [];
	for (const m of html.matchAll(CITE)) {
		const ref = m.groups?.['ref'] ?? '';
		const sub = REF_SUB_SECTION.exec(ref)?.groups?.['sub'];
		const printed = TRAILING_SUP.exec(m.groups?.['inner'] ?? '')?.groups?.[
			'printed'
		];
		if (sub !== undefined && printed !== undefined && sub !== printed) {
			found.push(`${path}: printed sup ${printed} against ref "${ref}"`);
		}
	}
	return found;
}

/** One row per entry naming every anchor whose superscript and ref
 * disagree about the sub-section. */
function detectSuperscriptSubsectionContradicts(entry: TruthEntry): ClassRow[] {
	const sites = [...markupFields(entry)].flatMap(([path, html]) =>
		contradictions(path, html),
	);
	return entryRow(entry, SUPERSCRIPT_SUBSECTION_CONTRADICTS, sites);
}

export {
	detectSuperscriptSubsectionContradicts,
	SUPERSCRIPT_SUBSECTION_CONTRADICTS,
};
