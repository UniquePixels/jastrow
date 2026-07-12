/**
 * Shared type vocabulary for the entry-body-model toolkit (spec
 * docs/superpowers/plans/2026-07-11-entry-body-model.md). Every later
 * module — citation detector, census, grammar/label extraction, unit
 * builder, dry-run — imports these instead of redefining the shapes.
 */

/** Upstream shapes (Sefaria dump, `data/source/jastrow-dictionary.jsonl`),
 * restricted to the fields the body model reads. See
 * `admin/pipeline/provenance/baseline-transform.ts` for the sibling model
 * of the deployed v1 shape these fields fed. */
interface SourceGrammar {
	// biome-ignore lint/style/useNamingConvention: upstream field name
	binyan_form?: string[];
	// biome-ignore lint/style/useNamingConvention: upstream field name
	language_code?: string;
	// biome-ignore lint/style/useNamingConvention: upstream field name
	verbal_stem?: string;
}

interface SourceSense {
	definition?: string;
	grammar?: SourceGrammar;
	number?: string;
	senses?: SourceSense[];
}

interface SourceEntry {
	// biome-ignore lint/style/useNamingConvention: upstream field name
	alt_headwords?: string[];
	content: { morphology?: string; senses: SourceSense[] };
	headword: string;
	// biome-ignore lint/style/useNamingConvention: upstream field name
	language_code?: string;
	// biome-ignore lint/style/useNamingConvention: upstream field name
	language_reference?: string;
	// biome-ignore lint/style/useNamingConvention: upstream field name
	plural_form?: string[];
	quotes?: [string | null, string, string | null][];
	refs?: string[];
	rid: string;
}

/** Target shapes (design doc §2,
 * docs/specs/2026-07-11-entry-body-model-design.md). What the body model
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
