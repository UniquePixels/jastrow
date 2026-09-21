/**
 * Review detector — `empty-stem-section` (catalogue: 342 entries, 347
 * sections). A `stems[]` element whose senses carry no text at all.
 *
 * The mechanism, from the batch-6b audit: print sets a shared heading
 * ("Pa. בַּהַית, Af. אַבְהֵית to put to shame"), Sefaria's parser split it at
 * the comma, and the gloss stayed with the last member — so the label
 * before the comma became a block with nothing under it. Nothing is
 * missing and nothing is malformed; no repair exists that does not
 * invent text or a model the entry schema has not got (maintainer,
 * 2026-08-28). The row records the blank heading a reader meets; the
 * fix is a rendering one (Phase 4), not a data one.
 */
import { textOf } from '../gates.ts';
import type { TruthEntry, TruthStem } from '../types.ts';
import { type ClassRow, entryRow } from './row.ts';
import { fieldsOf, walkSequence } from './senses.ts';

const EMPTY_STEM_SECTION = 'empty-stem-section';

/** Whether nothing under this stem's senses is visible to a reader.
 * An empty `senses` array satisfies it vacuously, which is the shape
 * all 347 sections take; the walk is written over the whole sequence
 * anyway so a stem whose only sense is blank is not missed. */
function carriesNoText(stem: TruthStem): boolean {
	for (const at of walkSequence(stem.senses, 'senses')) {
		for (const [, html] of fieldsOf(at)) {
			if (textOf(html).trim() !== '') {
				return false;
			}
		}
	}
	return true;
}

/** One row per entry naming every senseless stem block it carries. */
function detectEmptyStemSection(entry: TruthEntry): ClassRow[] {
	const sites = (entry.stems ?? [])
		.map((stem, i) => ({ i, stem }))
		.filter(({ stem }) => carriesNoText(stem))
		.map(({ i, stem }) => `stems[${i}] "${stem.stem}" carries no sense text`);
	return entryRow(entry, EMPTY_STEM_SECTION, sites);
}

export { detectEmptyStemSection, EMPTY_STEM_SECTION };
