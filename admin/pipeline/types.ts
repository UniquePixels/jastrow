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

/** One node of the upstream sense tree, as the Sefaria dump spells it.
 * Every field is optional because the dump omits rather than empties:
 * a sense with no `definition` and no `senses` is a real shape there,
 * and the composer has to decide what it means rather than assume the
 * key is present. `senses` nests to arbitrary depth, so a reader that
 * handles only two levels is reading a subset. */
interface SourceSense {
	definition?: string;
	grammar?: SourceGrammar;
	number?: string;
	senses?: SourceSense[];
}

/** One dictionary entry as the pipeline reads it — the upstream record
 * plus the small number of fields a patch may supply. `rid` is the
 * identity every report, patch and gate addresses the entry by; it is
 * the only field guaranteed stable across a re-fetch.
 *
 * `content.senses` is the body; everything beside it is headword-line
 * material the parser turns into form objects. */
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

/** A binyan section of the body: the stem label as the print gives it,
 * the headword forms that section governs, and the senses beneath it.
 * A stem is a SIBLING of the entry's own senses rather than a wrapper
 * around them, because an entry can carry both — ungoverned senses
 * first, then one section per stem. */
interface BodyStem {
	forms: string[];
	senses: BodySense[];
	stem: string;
}

/** A composed entry body: the shape the model produces from a
 * `SourceEntry` and the shape every later stage reads. `senses` is
 * always present, `stems` only where the print has binyan sections, so
 * a consumer walking `senses` alone sees a complete entry for the
 * common case and an incomplete one for a verb. */
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
