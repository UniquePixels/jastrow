/**
 * The gershayim pair (batch-3a spec §3, §4). One predicate, two rows,
 * split by locus — `ascii-quote-as-gershayim-in-body` owns document
 * text, `gershayim-breaks-ref-attribute` owns tag interiors.
 *
 * They are one defect. Every one of the 90 damaged tags points at a
 * headword carrying the same ASCII quote — 90 of 90, 0 unresolved — so
 * repairing either side alone breaks all 90 cross-links, and the two
 * rows ship adjacent in the registry for that reason rather than
 * because the catalogue marks them entangled.
 *
 * ## Why `allows: ['״']` is safe, argued by construction
 *
 * It is a maintainer ruling, under the OCR ruling of 2026-08-11 that
 * `no-new-text.ts` already cites: a mis-recognized glyph never was the
 * source's content, so correcting it is correction, not composition.
 *
 * The plan justified the allowance partly by "U+05F4 occurs 0 times in
 * the input corpus", and that phrasing is TRUE OF THE SNAPSHOT AND
 * FALSE UNDER COMPOSITION. `run.ts` applies rules in sequence and
 * hands each one the previous rule's output, so once `gershayimInBody`
 * has run, `gershayimRefAttribute`'s input does contain U+05F4 — and
 * a safety argument that only holds for whichever of the pair runs
 * first is not a safety argument for the pair.
 *
 * The argument that does hold is about the substitution rather than
 * about the corpus: `gershayim.ts` only ever writes a `״` where it
 * removed a `"`, in place, one for one. So every `״` in the output is
 * one this call put there, whatever the input already held, and the
 * allowance's blast radius — per `no-new-text.ts`, a declared
 * codepoint is permitted ANYWHERE in the rule's diff — is bounded by
 * the predicate rather than by an accident of the pinned data. The
 * corpus fact is still worth having, and the corpus tier still asserts
 * it, because it is what makes the count checkable; it is just not
 * what makes the allowance safe.
 *
 * ## Glyph only, never slot
 *
 * Neither rule moves a mark. 55 occurrences sit in a minority slot
 * with a dominant twin elsewhere in the corpus (`הק"בה` 15 against
 * `הקב"ה` 194) and 45 more are undetermined; all 100 are
 * glyph-corrected in place and recorded in the decline register of
 * `data/patches/catalogue-audit/ascii-quote-as-gershayim-in-body.md`,
 * because sourcing a repair from a different token elsewhere in the
 * corpus is the inference shape the no-vowel-inference ruling forbids.
 * It would also silently rewrite `עכ"ום`, which the audit flags as
 * possibly a genuine censorship-era variant rather than a defect.
 *
 * ## The field walk
 *
 * `mapEntry` covers every field `fieldsOf` walks and no other, which
 * is the condition under which the gates can see this rule's work at
 * all: a field outside that set is one the gate cannot read, and a
 * rule editing only such a field passes vacuously. `refs[]` is absent
 * from both by the same ruling (body model spec §5, B7 — dropped at
 * compile). The two lists were compared field by field when this was
 * written, `grammar` included: `sense.grammar`'s three strings hold 0
 * occurrences in the pinned snapshot but ARE walked by `fieldsOf`, so
 * they are mapped here rather than left for a re-fetch to expose.
 */
import type {
	SourceEntry,
	SourceGrammar,
	SourceSense,
} from '../../body/types.ts';
import { GERSHAYIM, repairTags, repairText } from '../gershayim.ts';
import { HEBREW, tokenize } from '../html.ts';
import { anchors } from '../links.ts';
import { fieldsOf } from '../no-new-text.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/** One of `gershayim.ts`'s two locus-scoped substitutions. */
type Repair = (value: string) => string;

/** Threaded through the walk rather than compared at the end, so the
 * rule can hand back the caller's OWN entry object when nothing
 * matched — required by `Rule.apply`'s contract and by `count.ts`,
 * which deep-freezes the corpus. */
interface Moved {
	any: boolean;
}

/** A character that belongs to the abbreviation the mark sits in:
 * Hebrew (U+05F4 included, so a repaired token reads whole) plus the
 * combining dot `html.ts` admits as a suffix. Used only to name the
 * repaired token in a record. */
const TOKEN_CHAR = new RegExp(String.raw`[${HEBREW}\u0307]`, 'u');

/** Repair one string, reporting through `moved` whether it changed. */
function repairOne(value: string, repair: Repair, moved: Moved): string {
	const out = repair(value);
	if (out !== value) {
		moved.any = true;
	}
	return out;
}

/**
 * Each mapper below copies its input and then rewrites only the keys
 * that were PRESENT, so an entry without `language_reference` does not
 * gain one — a rule that handed `body:migrate-dry` a field holding
 * `undefined` would be inventing a field, not repairing a glyph.
 *
 * Written as guarded assignment rather than as `key: mapText(...)`
 * because `exactOptionalPropertyTypes` is on: assigning `undefined` to
 * an optional field is a type error here, so the compiler enforces
 * this rather than the convention having to be remembered.
 */
function mapGrammar(
	grammar: SourceGrammar,
	repair: Repair,
	moved: Moved,
): SourceGrammar {
	const out: SourceGrammar = { ...grammar };
	if (grammar.binyan_form !== undefined) {
		out.binyan_form = grammar.binyan_form.map((value) =>
			repairOne(value, repair, moved),
		);
	}
	if (grammar.language_code !== undefined) {
		out.language_code = repairOne(grammar.language_code, repair, moved);
	}
	if (grammar.verbal_stem !== undefined) {
		out.verbal_stem = repairOne(grammar.verbal_stem, repair, moved);
	}
	return out;
}

function mapSense(
	sense: SourceSense,
	repair: Repair,
	moved: Moved,
): SourceSense {
	const out: SourceSense = { ...sense };
	if (sense.definition !== undefined) {
		out.definition = repairOne(sense.definition, repair, moved);
	}
	if (sense.grammar !== undefined) {
		out.grammar = mapGrammar(sense.grammar, repair, moved);
	}
	if (sense.number !== undefined) {
		out.number = repairOne(sense.number, repair, moved);
	}
	if (sense.senses !== undefined) {
		out.senses = sense.senses.map((child) => mapSense(child, repair, moved));
	}
	return out;
}

function mapContent(
	content: SourceEntry['content'],
	repair: Repair,
	moved: Moved,
): SourceEntry['content'] {
	const out: SourceEntry['content'] = {
		...content,
		senses: content.senses.map((sense) => mapSense(sense, repair, moved)),
	};
	if (content.morphology !== undefined) {
		out.morphology = repairOne(content.morphology, repair, moved);
	}
	return out;
}

/** One `quotes` triple, nulls preserved in place. */
function mapQuote(
	triple: readonly (string | null)[],
	repair: Repair,
	moved: Moved,
): [string | null, string, string | null] {
	return triple.map((part) =>
		part === null ? null : repairOne(part, repair, moved),
	) as [string | null, string, string | null];
}

/** A new entry with every walked field repaired, or `undefined` when
 * the repair changed nothing — which is what lets `apply` hand back
 * the caller's own object, as `Rule.apply`'s contract requires. */
function mapEntry(entry: SourceEntry, repair: Repair): SourceEntry | undefined {
	const moved: Moved = { any: false };
	const out: SourceEntry = {
		...entry,
		content: mapContent(entry.content, repair, moved),
		headword: repairOne(entry.headword, repair, moved),
	};
	if (entry.alt_headwords !== undefined) {
		out.alt_headwords = entry.alt_headwords.map((value) =>
			repairOne(value, repair, moved),
		);
	}
	if (entry.plural_form !== undefined) {
		out.plural_form = entry.plural_form.map((value) =>
			repairOne(value, repair, moved),
		);
	}
	if (entry.language_code !== undefined) {
		out.language_code = repairOne(entry.language_code, repair, moved);
	}
	if (entry.language_reference !== undefined) {
		out.language_reference = repairOne(entry.language_reference, repair, moved);
	}
	if (entry.quotes !== undefined) {
		out.quotes = entry.quotes.map((triple) => mapQuote(triple, repair, moved));
	}
	return moved.any ? out : undefined;
}

/** The abbreviation surrounding the mark at `at`, for a record's
 * detail. Bounded by `TOKEN_CHAR`, so it stops at the space or `=`
 * that ends the word rather than running to the end of an attribute. */
function tokenAt(text: string, at: number): string {
	let start = at;
	let end = at + 1;
	while (start > 0 && TOKEN_CHAR.test(text[start - 1] ?? '')) {
		start -= 1;
	}
	while (end < text.length && TOKEN_CHAR.test(text[end] ?? '')) {
		end += 1;
	}
	return text.slice(start, end);
}

/**
 * Every token this call repaired, by comparing the two field walks
 * position for position.
 *
 * Sound only because the substitution is in place — same field count,
 * same length, same offsets — which `apply` asserts before calling
 * this rather than assuming.
 */
function repairedTokens(
	before: readonly string[],
	after: readonly string[],
): string[] {
	const found: string[] = [];
	for (const [at, field] of after.entries()) {
		const source = before[at] ?? '';
		if (source === field) {
			continue;
		}
		for (let i = 0; i < field.length; i += 1) {
			if (field[i] === GERSHAYIM && source[i] === '"') {
				found.push(tokenAt(field, i));
			}
		}
	}
	return found;
}

/** Whether the two walks agree field for field on CODEPOINT length —
 * the invariant the whole batch rests on, asserted per call rather
 * than assumed. Codepoints rather than UTF-16 units because that is
 * how the claim is stated; the two coincide for `"` and `״`. */
function sameShape(
	before: readonly string[],
	after: readonly string[],
): boolean {
	return (
		before.length === after.length &&
		before.every(
			(field, at) => [...field].length === [...(after[at] ?? '')].length,
		)
	);
}

/**
 * Every anchor's opening tag, in `fieldsOf` order then `anchors`
 * order — the SAME walk on both sides, so index i on one side is
 * index i on the other.
 *
 * Sound here only because this rule never adds, removes or reorders a
 * tag: the substitution writes no `<` and no `>`, so both walks see
 * an identical token structure and pair the same opens with the same
 * closes. `checkLinkTargets` fails loudly on an anchor-count change,
 * so a violation of that premise cannot pass quietly.
 */
function openTags(entry: SourceEntry): string[] {
	return fieldsOf(entry).flatMap((field) =>
		anchors(tokenize(field)).map((anchor) => anchor.tag),
	);
}

/** One `glyphCorrected` claim per repaired opening tag, `{ from,
 * target }` on RAW TAG BYTES — the parsed targets are truncated for
 * exactly these anchors, which is why `link-target.ts` case 5 is
 * stated on bytes (spec §4.3). */
function claimsFor(
	entry: SourceEntry,
	healed: SourceEntry,
): { from: string; target: string }[] {
	const from = openTags(entry);
	return openTags(healed)
		.map((tag, at) => ({ from: from[at] ?? '', target: tag }))
		.filter((claim) => claim.from !== claim.target);
}

/** The one record this call produces, naming what it repaired. */
function recordFor(
	id: string,
	entry: SourceEntry,
	tokens: readonly string[],
): TransformRecord {
	const unique = [...new Set(tokens)];
	return {
		detail: `${tokens.length} restored: ${unique.join(', ')}`,
		rid: entry.rid,
		ruleId: id,
	};
}

/**
 * One rule over one locus. `declare` is what separates the two: the
 * tag-locus rule rewrites link targets and must declare each repaired
 * tag for `link-target.ts` case 5, while the text-locus rule leaves
 * every tag byte-identical and has nothing to declare.
 */
function build(id: string, repair: Repair, declare: boolean): Rule {
	return {
		// The OCR ruling of 2026-08-11, and the by-construction argument
		// in this module's docstring: the substitution only ever writes a
		// `״` where it removed a `"`, so every one in the output is this
		// call's own work.
		allows: [GERSHAYIM],
		apply(entry: SourceEntry): TransformResult {
			const healed = mapEntry(entry, repair);
			if (healed === undefined) {
				return { entry, records: [] };
			}
			const before = fieldsOf(entry);
			const after = fieldsOf(healed);
			if (!sameShape(before, after)) {
				throw new Error(`${id}: ${entry.rid} changed length, not just glyphs`);
			}
			const records = [recordFor(id, entry, repairedTokens(before, after))];
			return declare
				? { entry: healed, glyphCorrected: claimsFor(entry, healed), records }
				: { entry: healed, records };
		},
		id,
		phase: 'text-repairs',
	};
}

/**
 * The ASCII quote standing for a gershayim in DOCUMENT TEXT — 2,125
 * occurrences across 1,386 entries. Every `<…>` tag comes through
 * byte-identical, so this rule writes no link target and declares
 * nothing to `link-target.ts`.
 */
const gershayimInBody: Rule = build(
	'ascii-quote-as-gershayim-in-body',
	repairText,
	false,
);

/**
 * The same quote INSIDE a tag, where it terminates the `"`-delimited
 * attribute it sits in — 180 occurrences across 90 anchors in 85
 * entries, two attributes (`href` and `data-ref`) on each anchor.
 *
 * All 90 parse as well-formed with silently truncated targets, so the
 * repair is declared on raw tag bytes through `glyphCorrected`.
 */
const gershayimRefAttribute: Rule = build(
	'gershayim-breaks-ref-attribute',
	repairTags,
	true,
);

export { gershayimInBody, gershayimRefAttribute };
