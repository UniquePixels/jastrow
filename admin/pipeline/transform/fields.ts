/**
 * The one WRITER over the field set `no-new-text.ts`'s `fieldsOf`
 * reads.
 *
 * `fieldsOf` is the single field enumeration for READING (spec
 * §5). Until batch 3b every rule that needed to WRITE carried its
 * own walk, and `rules/gershayim.ts` was the only one that had a
 * complete one. A second, drifting copy of that walk is the exact
 * shape of the "gate cannot see it" failure batch 3a closed: a rule
 * writing a field `fieldsOf` does not read is invisible to
 * `checkNoNewText`.
 *
 * `fields.test.ts` asserts the parity rather than asserting it here
 * in a comment.
 */
import type { SourceEntry, SourceGrammar, SourceSense } from '../body/types.ts';

/** Set by `one()` the first time the mapper returns something new, so
 * `mapFields` can hand back `undefined` for an unchanged entry. */
interface Moved {
	any: boolean;
}

type Mapper = (text: string) => string;

/** Applies `map` to one field and records on `moved` that something
 * changed. The flag is threaded through every helper below rather
 * than recovered by comparing the two entries at the end, because
 * `mapFields` has to be able to return `undefined` for an unchanged
 * entry — that is what lets a `Rule.apply` hand the caller back its
 * own object, as its contract requires — and a deep structural
 * comparison would cost more than the mapping it followed. */
function one(text: string, map: Mapper, moved: Moved): string {
	const out = map(text);
	if (out !== text) {
		moved.any = true;
	}
	return out;
}

/** A copy of `grammar` with every text-bearing field mapped:
 * `binyan_form` (each string in the array), `language_code` and
 * `verbal_stem`. Those three and no others, because they are exactly
 * what `fieldsOf` reads off a `SourceGrammar` — a fourth written here
 * and not read there would be a field the text gate cannot see, which
 * is the drift the module doc names. */
function mapGrammar(
	grammar: SourceGrammar,
	map: Mapper,
	moved: Moved,
): SourceGrammar {
	const out: SourceGrammar = { ...grammar };
	if (grammar.binyan_form !== undefined) {
		out.binyan_form = grammar.binyan_form.map((v) => one(v, map, moved));
	}
	if (grammar.language_code !== undefined) {
		out.language_code = one(grammar.language_code, map, moved);
	}
	if (grammar.verbal_stem !== undefined) {
		out.verbal_stem = one(grammar.verbal_stem, map, moved);
	}
	return out;
}

/** A copy of `sense` with `definition`, `number` and `grammar`
 * mapped, recursing through `senses`. The recursion is the part that
 * is easy to leave out and impossible to notice missing: senses NEST,
 * and a walk stopping at the top level would leave every nested
 * definition both unmapped and outside the gate's view. `fieldsOf`
 * recurses the same way, for the same reason. */
function mapSense(sense: SourceSense, map: Mapper, moved: Moved): SourceSense {
	const out: SourceSense = { ...sense };
	if (sense.definition !== undefined) {
		out.definition = one(sense.definition, map, moved);
	}
	if (sense.grammar !== undefined) {
		out.grammar = mapGrammar(sense.grammar, map, moved);
	}
	if (sense.number !== undefined) {
		out.number = one(sense.number, map, moved);
	}
	if (sense.senses !== undefined) {
		out.senses = sense.senses.map((child) => mapSense(child, map, moved));
	}
	return out;
}

/** A copy of `content` with `morphology` mapped and every top-level
 * sense handed to `mapSense`. `senses` is always present and
 * `morphology` is optional — the same two-field shape `fieldsOf`
 * reads off `content`. */
function mapContent(
	content: SourceEntry['content'],
	map: Mapper,
	moved: Moved,
): SourceEntry['content'] {
	const out: SourceEntry['content'] = {
		...content,
		senses: content.senses.map((sense) => mapSense(sense, map, moved)),
	};
	if (content.morphology !== undefined) {
		out.morphology = one(content.morphology, map, moved);
	}
	return out;
}

/** A quote triple with each string mapped and each `null` left where
 * it was. Position carries meaning in a triple — the middle element
 * is always a string, the outer two may be absent — so a null is
 * never dropped and never coerced to `''`, which would both change
 * the triple's shape and add a phantom field to `fieldsOf`'s read.
 * The cast restores the tuple type `Array.map` widens away. */
function mapQuote(
	triple: readonly (string | null)[],
	map: Mapper,
	moved: Moved,
): [string | null, string, string | null] {
	return triple.map((part) =>
		part === null ? null : one(part, map, moved),
	) as [string | null, string, string | null];
}

/**
 * A new entry with `map` applied to every field, or `undefined` when
 * `map` returned every field unchanged — which is what lets a
 * `Rule.apply` hand back the caller's own object, as its contract
 * requires.
 */
function mapFields(entry: SourceEntry, map: Mapper): SourceEntry | undefined {
	const moved: Moved = { any: false };
	const out: SourceEntry = {
		...entry,
		content: mapContent(entry.content, map, moved),
		headword: one(entry.headword, map, moved),
	};
	if (entry.alt_headwords !== undefined) {
		out.alt_headwords = entry.alt_headwords.map((v) => one(v, map, moved));
	}
	if (entry.plural_form !== undefined) {
		out.plural_form = entry.plural_form.map((v) => one(v, map, moved));
	}
	if (entry.language_code !== undefined) {
		out.language_code = one(entry.language_code, map, moved);
	}
	if (entry.language_reference !== undefined) {
		out.language_reference = one(entry.language_reference, map, moved);
	}
	if (entry.quotes !== undefined) {
		out.quotes = entry.quotes.map((t) => mapQuote(t, map, moved));
	}
	return moved.any ? out : undefined;
}

export type { Mapper };
export { mapFields };
