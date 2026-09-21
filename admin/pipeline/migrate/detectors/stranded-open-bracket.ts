/**
 * Review detector — `stranded-open-bracket` (catalogue: 85 entries,
 * 87 occurrences). A sense's text ends with a bare `[`.
 *
 * The print bracket wraps one or more whole numbered senses and its
 * `]` closes it in a later sibling, so the two halves are split across
 * senses the tree gives no span to. The richer clause the class's
 * description states — an orphan `]` in a later same-parent sibling —
 * holds for 86 of the 87 occurrences and lands on the same 85
 * entries, so the detector uses the one-sentence predicate the
 * recount was ruled on (research-backlog, Group A).
 *
 * NOT a deletion candidate: `[...]` around a numbered sense is a live
 * editorial signal marking it supplied or uncertain, so dropping the
 * stray characters would silently discard that marking. A repair must
 * rejoin the span, and only the print page says how far it reaches.
 */
import { textOf } from '../gates.ts';
import type { TruthEntry } from '../types.ts';
import { type ClassRow, entryRow } from './row.ts';
import { fieldsOf, type SenseAt, walkSenses } from './senses.ts';

const STRANDED_OPEN_BRACKET = 'stranded-open-bracket';

/** What the review report tells a reader to do about these rows. */
const STRANDED_OPEN_BRACKET_ACTION =
	'Rejoin the bracketed span against the print page in the admin tool after go-live; deleting the stray bracket would discard the editorial marking it carries.';

/** The visible text of one sense's OWN fields — gloss then units, no
 * child's — which is the unit the class's `[` sits at the end of. */
function ownText(at: SenseAt): string {
	return [...fieldsOf(at)].map(([, html]) => textOf(html)).join('');
}

/** One row per entry naming every sense whose text ends with `[`. */
function detectStrandedOpenBracket(entry: TruthEntry): ClassRow[] {
	const sites = [...walkSenses(entry)]
		.filter((at) => ownText(at).trimEnd().endsWith('['))
		.map((at) => `${at.path}: text ends with a bare "["`);
	return entryRow(entry, STRANDED_OPEN_BRACKET, sites);
}

export {
	detectStrandedOpenBracket,
	STRANDED_OPEN_BRACKET,
	STRANDED_OPEN_BRACKET_ACTION,
};
