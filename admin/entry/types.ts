/**
 * The entry shapes: the entry and its nested sense/stem/form pieces
 * (data-architecture spec §2.2, migrate spec §2.6, headword design §2)
 * — what a file under `data/entries/` holds, whoever wrote it. The
 * schema (`paths.ts` `SCHEMA_PATH`) is the same contract for a reader
 * that is not TypeScript; `validate.ts` holds a file to the schema and
 * to the rules neither can express.
 */

/** The entry-file format this pipeline writes. Version 2 is the
 * headword-design §2 shape: `headwords[]` and an optional `display`
 * in place of `headword`/`altHeadwords`, and `sefariaHeadword` in
 * place of `slug`. Stamped on every file so a reader — the app, the
 * admin tool, a later import — can tell the two apart without
 * guessing from which keys are present. */
const SCHEMA_VERSION = 2;

/** Fields that are copied from elsewhere VERBATIM and must keep the
 * bytes they were copied from, whatever spelling those are.
 *
 * `sefariaHeadword` is Sefaria's own headword, stored so the Sefaria
 * URL route keeps working after our headword is corrected (URL names
 * spec §5.1, U3). It is a foreign key, not our text: normalizing it
 * would make it a spelling Sefaria does not use. So the import's NFC
 * write (`normalizeForWrite`) leaves it alone, and the contract's NFC
 * check (`validate.ts`) does not ask it to be NFC. One list, read by
 * both, so the writer and the check cannot disagree about which field
 * is exempt. */
const VERBATIM_FIELDS: ReadonlySet<string> = new Set(['sefariaHeadword']);

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
interface Sense {
	gloss: string;
	label?: string;
	senses?: Sense[];
	units: string[];
}

/** A binyan section of a written entry: the stem label print gives,
 * the headword forms it governs, and its senses. Sibling to the
 * entry's own `senses`, so both can be present on one entry. */
interface Stem {
	forms: string[];
	senses: Sense[];
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
interface Entry {
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
	/** `pos` is declared in the schema and has no producer: no entry
	 * carries it (`docs/ideas.md`, Schema). It is here so the type
	 * names every key the schema allows. */
	grammar?: { gender?: 'm' | 'f' | 'c'; number?: 'pl' | 'du'; pos?: string };
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
	senses: Sense[];
	stems?: Stem[];
}

export type { Entry, FormObject, Sense, Stem };
export { SCHEMA_VERSION, VERBATIM_FIELDS };
