/**
 * Shared type vocabulary for the entry-body model (spec
 * docs/archive/plans/2026-07-11-entry-body-model.md): the upstream
 * `Source*` shapes as the pipeline reads them, and the `Body*` shapes
 * it composes. Every module that touches an entry imports these
 * instead of redefining them, so the model has one spelling.
 */

/** Upstream shapes (Sefaria dump,
 * `data/source/jastrow-dictionary.jsonl`), restricted to the fields
 * the body model reads. */
interface SourceGrammar {
	binyan_form?: string[];
	language_code?: string;
	verbal_stem?: string;
}

interface SourceSense {
	definition?: string;
	grammar?: SourceGrammar;
	number?: string;
	senses?: SourceSense[];
}

interface SourceEntry {
	alt_headwords?: string[];
	content: { morphology?: string; senses: SourceSense[] };
	/** **NOT a Sefaria field.** The headword-line layout a `reform`
	 * patch supplied, in the `display` template language of headword
	 * design §2. Absent on every entry the snapshot yields; present
	 * only where a person read the printed line and settled a layout
	 * the source cannot (§4's H2 rows, A01394). `finishEntry` prefers
	 * it over the parser's, and gate 2 knows to expect one. */
	display?: string;
	headword: string;
	language_code?: string;
	language_reference?: string;
	next_hw?: string;
	plural_form?: string[];
	prev_hw?: string;
	quotes?: [string | null, string, string | null][];
	refs?: string[];
	rid: string;
}

/** Target shapes (design doc §2,
 * docs/specs/2026-07-11-entry-body-model-design.md). What the model
 * builds from `SourceEntry`. */
interface BodySense {
	gloss: string;
	label?: string;
	senses?: BodySense[];
	units: string[];
}

interface BodyStem {
	forms: string[];
	senses: BodySense[];
	stem: string;
}

interface BodyEntry {
	grammar?: { gender?: 'm' | 'f' | 'c'; number?: 'pl' | 'du' };
	id: string;
	senses: BodySense[];
	stems?: BodyStem[];
}

export type {
	BodyEntry,
	BodySense,
	BodyStem,
	SourceEntry,
	SourceGrammar,
	SourceSense,
};
