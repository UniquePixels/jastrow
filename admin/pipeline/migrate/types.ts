/**
 * Truth-layer shapes shared by the migrate finishing stages: the entry
 * and its nested sense/stem/form pieces (data-architecture spec §2.2,
 * migrate spec §2.6), plus the gate tally every stage's checks report
 * through (migrate spec §4.1).
 */

interface FormObject {
	disambiguator?: number;
	homograph?: number;
	reconstructed?: true;
	text: string;
}

interface TruthSense {
	gloss: string;
	label?: string;
	senses?: TruthSense[];
	units: string[];
}

interface TruthStem {
	forms: string[];
	senses: TruthSense[];
	stem: string;
}

interface TruthEntry {
	altHeadwords?: FormObject[];
	/** Names this entry has published under and no longer holds (URL
	 * names spec §5.1, U6). **Absent until publication**: nothing in
	 * the pipeline writes it, and the gates that would check it arrive
	 * with the published-names ledger (§5.2's last row, §9 step 6). */
	formerNames?: string[];
	grammar?: { gender?: 'm' | 'f' | 'c'; number?: 'pl' | 'du' };
	headword: FormObject;
	id: string;
	page?: { number: number; column?: 'a' | 'b' };
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
