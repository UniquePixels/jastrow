/**
 * Truth-layer shapes shared by the migrate finishing stages: the entry
 * and its nested sense/stem/form pieces (data-architecture spec §2.2,
 * migrate spec §2.6, headword design §2), plus the gate tally every
 * stage's checks report through (migrate spec §4.1).
 */

/** The entry-file format this pipeline writes. Version 2 is the
 * headword-design §2 shape: `headwords[]` and an optional `display`
 * in place of `headword`/`altHeadwords`, and `sefariaHeadword` in
 * place of `slug`. Stamped on every file so a reader — the app, the
 * admin tool, a later migration — can tell the two apart without
 * guessing from which keys are present. */
const SCHEMA_VERSION = 2;

/** One headword form. It holds only MEANING: `text` is clean Hebrew
 * and everything print sets AROUND the forms lives in the entry's
 * `display` (headword design §2, §3.1).
 *
 * `partial` marks a form that is shown exactly as printed and is never
 * a lookup key — an ending after an ellipsis (`… טָה`), a phrase with
 * an abbreviated word (`נְהַר פּ׳`). `gender` is per-form, and the entry
 * carries at most one of it or `grammar.gender`, never both (§4). */
interface FormObject {
	disambiguator?: number;
	gender?: 'f' | 'm';
	homograph?: number;
	partial?: true;
	reconstructed?: true;
	text: string;
}

/** One sense of a written entry. `gloss` is the sense's own head text
 * and `units` its numbered or lettered parts; `senses` nests for a
 * sub-sense tree.
 *
 * `senses[0]` of the ENTRY is the gloss head, not a first numbered
 * sense — a reader that drops an empty lead consumes sense 1. The
 * distinction is invisible to a text-conservation check, because the
 * bytes survive either way. */
interface TruthSense {
	gloss: string;
	label?: string;
	senses?: TruthSense[];
	units: string[];
}

/** A binyan section of a written entry: the stem label print gives,
 * the headword forms it governs, and its senses. Sibling to the
 * entry's own `senses`, so both can be present on one entry. */
interface TruthStem {
	forms: string[];
	senses: TruthSense[];
	stem: string;
}

/** One entry file under `data/entries/` — the unit the app reads, the
 * admin tool edits and the update run merges into. It is the
 * pipeline's OUTPUT contract: a field absent here is a field no
 * consumer may assume, and a field present is one the gates check.
 *
 * The entry is addressed by `id` (the rid). Its NAME is not stored —
 * it is derived from `headwords[0]` on demand, so it cannot drift from
 * the headword the way a stored slug could (URL names spec §5.1). */
interface TruthEntry {
	/** How print laid the headword line out: a template whose `{n}`
	 * inserts `headwords[n].text` and whose every other character is
	 * literal notation, never Hebrew (headword design §2, §3.1).
	 *
	 * **Optional, and never defaulted.** Where the source cannot settle
	 * the layout the entry is still written, this is left unset and the
	 * row is flagged for review (§3). A flagged row is a ticket, not a
	 * guess. */
	display?: string;
	/** Names this entry has published under and no longer holds (URL
	 * names spec §5.1, U6). **Absent until publication**: nothing in
	 * the pipeline writes it, and the gates that would check it arrive
	 * with the published-names ledger (§5.2's last row, §9 step 6). */
	formerNames?: string[];
	grammar?: { gender?: 'm' | 'f' | 'c'; number?: 'pl' | 'du' };
	/** Every form print sets on the headword line, in its order.
	 * `headwords[0]` is the primary: the name, the search key and every
	 * link are derived from it (headword design §2). */
	headwords: FormObject[];
	id: string;
	page?: { number: number; column?: 'a' | 'b' };
	schemaVersion: typeof SCHEMA_VERSION;
	/** Sefaria's `headword` for this rid, byte for byte (U3). Import
	 * is the only writer; the admin tool and hand edits never touch
	 * it. It keeps the Sefaria URL route (§3.3) working after our own
	 * headword is corrected. */
	sefariaHeadword: string;
	senses: TruthSense[];
	stems?: TruthStem[];
}

/** A gate result: a count against a fixed total, plus the failing lines. */
interface Tally {
	failures: string[];
	pass: number;
	total: number;
}

export type { FormObject, Tally, TruthEntry, TruthSense, TruthStem };
export { SCHEMA_VERSION };
