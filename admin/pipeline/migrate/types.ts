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
	grammar?: { gender?: 'm' | 'f' | 'c'; number?: 'pl' | 'du' };
	headword: FormObject;
	id: string;
	page?: { number: number; column?: 'a' | 'b' };
	senses: TruthSense[];
	slug: string;
	stems?: TruthStem[];
}

/** A gate result: a count against a fixed total, plus the failing lines. */
interface Tally {
	failures: string[];
	pass: number;
	total: number;
}

export type { FormObject, Tally, TruthEntry, TruthSense, TruthStem };
