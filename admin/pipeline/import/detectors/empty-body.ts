/**
 * Review detector — `empty-body`. An entry whose senses carry no text
 * at all and which has no stem block: the reader meets a headword with
 * nothing under it.
 *
 * Two entries on the run of 2026-10-03, P01112 and U00622, each
 * written as one gloss head with no text and no units. The Sefaria
 * source is empty for both, so nothing was lost on the way: the text
 * was never there. No repair exists that does not invent it; the print
 * is the only witness, and the admin tool is where it is supplied.
 *
 * Narrower than the catalogue's `contentless-entry` (6), which also
 * counted entries carrying a grammar label and no definition (H00049
 * `pr. n. m.`, Q00078 `m.`) and two the #113 patches since filled
 * (A01175, A01345). A reader of those sees the label; this kind is the
 * part of that class where the reader sees nothing, which is why it
 * does not take the catalogue id.
 *
 * `defer`: the app can display the headword, and the admin tool
 * corrects the entry after go-live without moving its URL.
 */

import type { Entry } from '../../../entry/types.ts';
import { textOf } from '../gates.ts';
import { type ClassRow, entryRow } from './row.ts';
import { fieldsOf, walkSenses } from './senses.ts';

/** Report `kind` for an entry with no body text. */
const EMPTY_BODY = 'empty-body';

/** What the review report tells a reader to do about these rows. */
const EMPTY_BODY_ACTION =
	'Read the printed entry and supply its body in the admin tool; the Sefaria source is empty too, and the app shows the headword alone meanwhile.';

/** Whether any sense, at any depth, shows a reader something: a field
 * with visible text, or a label. A stem block counts too, since its
 * heading is printed whether or not its senses carry text. */
function showsAnything(entry: Entry): boolean {
	if ((entry.stems ?? []).length > 0) {
		return true;
	}
	for (const at of walkSenses(entry)) {
		if (at.sense.label !== undefined && at.sense.label.trim() !== '') {
			return true;
		}
		for (const [, html] of fieldsOf(at)) {
			if (textOf(html).trim() !== '') {
				return true;
			}
		}
	}
	return false;
}

/** One row for an entry whose body shows the reader nothing. */
function detectEmptyBody(entry: Entry): ClassRow[] {
	return entryRow(
		entry,
		EMPTY_BODY,
		showsAnything(entry) ? [] : ['senses and stems carry no text'],
	);
}

export { detectEmptyBody, EMPTY_BODY, EMPTY_BODY_ACTION };
