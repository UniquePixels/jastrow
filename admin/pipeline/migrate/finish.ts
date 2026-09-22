/**
 * The finishing stages (migrate spec §2.1–2.6) applied to one composed
 * entry and its body: form objects, translated markup, citation refs,
 * `sefariaHeadword` and page, assembled in schema key order.
 */
import type { BodyEntry, BodySense, SourceEntry } from '../types.ts';
import { createResolver, type Unresolved } from './cite.ts';
import { type HeadwordReviewKind, parseHeadwordLine } from './headwords.ts';
import { type TagCarry, translateMarkup } from './markup.ts';
import type { PagePlacement } from './page.ts';
import { SCHEMA_VERSION, type TruthEntry, type TruthSense } from './types.ts';

/** The corpus-wide lookups a single entry's finishing needs. Each is
 * built once over the whole snapshot and passed in, because every one
 * of them answers a question an entry cannot answer about itself: what
 * other headwords exist, which page a rid sits on, what Sefaria called
 * it. Passing the maps rather than reading them per entry also keeps
 * `finishEntry` pure enough to test on one record. */
interface FinishContext {
	headwordMap: ReadonlyMap<string, string>;
	pages: ReadonlyMap<string, PagePlacement>;
	/** rid → Sefaria's `headword`, verbatim from the source snapshot
	 * (URL names spec U3). Taken from the PRISTINE source entry, never
	 * the composed one: a transform that respells our headword must
	 * not move the field that tracks Sefaria's. */
	sefariaHeadwords: ReadonlyMap<string, string>;
}

/** One headword review row: the report kind the detector chose, and
 * the `rid: string — reason` line that renders under it. The kind
 * travels with the line so the split lives in the detector rather than
 * in a filter over the finished report. */
interface HeadwordReviewRow {
	kind: HeadwordReviewKind;
	line: string;
}

/** Everything one entry's finishing produced: the entry itself plus
 * the four streams the run collects across the corpus. The review
 * rows, carries, problems and unresolved refs travel BESIDE the entry
 * rather than inside it — none of them is entry data, and writing any
 * of them into the file would make a report row indistinguishable from
 * a fact about the dictionary. */
interface Finished {
	entry: TruthEntry;
	/** Headword review rows, each already carrying its report kind. */
	headwordReview: HeadwordReviewRow[];
	/** `rid: path: …` lines noting an inline tag run that crossed a
	 * body-unit boundary (carried and reopened) or was still open at
	 * the end of its sense sequence (closed there instead). Neither is
	 * a `problems` entry — see `translateSequence`. */
	markupCarries: string[];
	problems: string[];
	unresolved: Unresolved[];
}

/** One source entry plus its composed body into a truth entry, with
 * everything a human or a gate needs to judge the result: the
 * problems that block a write, the headwords wanting review, the
 * unresolved citation targets, and the tag runs that crossed a field
 * boundary. Never throws — a problem is reported, not raised. */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: the branches are the schema's optional fields; flattening them would not remove a decision, only move it.
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: the finishing stages in schema key order; each one reads what the last wrote.
function finishEntry(
	source: SourceEntry,
	body: BodyEntry,
	context: FinishContext,
): Finished {
	const problems: string[] = [];
	const unresolved: Unresolved[] = [];
	const headwordReview: HeadwordReviewRow[] = [];
	const markupCarries: string[] = [];
	const resolve = createResolver(context.headwordMap, source.rid, unresolved);

	interface Field {
		assign: (value: string) => void;
		html: string;
		path: string;
	}

	/** Walk one document FLOW — a `senses` tree in document order: for
	 * each sense, its gloss, then its units, then each child sense
	 * recursively (gloss, units, grandchildren…), then the next sibling
	 * — building the output tree and, in the same order, the flat field
	 * list that `runFlow` below will translate against ONE shared
	 * `TagCarry`. Lettered and form-section children were cut from the
	 * same source definition as their parent (and consecutive top-level
	 * senses can share a boundary too), so a tag run open at the end of
	 * a parent's last field must be able to reopen inside its own first
	 * child rather than starting that child's translation fresh. */
	function buildSenseTree(
		sequence: readonly BodySense[],
		path: string,
		fields: Field[],
	): TruthSense[] {
		return sequence.map((s, i) => {
			const sensePath = `${path}[${i}]`;
			const out: TruthSense = { gloss: '', units: new Array(s.units.length) };
			fields.push({
				assign: (value: string): void => {
					out.gloss = value;
				},
				html: s.gloss,
				path: `${sensePath}.gloss`,
			});
			s.units.forEach((u, j) => {
				fields.push({
					assign: (value: string): void => {
						out.units[j] = value;
					},
					html: u,
					path: `${sensePath}.units[${j}]`,
				});
			});
			if (s.label !== undefined) {
				out.label = s.label;
			}
			if (s.senses !== undefined && s.senses.length > 0) {
				out.senses = buildSenseTree(s.senses, `${sensePath}.senses`, fields);
			}
			return out;
		});
	}

	/** Translate every field of one flow against ONE `TagCarry`, in the
	 * document order `buildSenseTree` laid them out in. The last field
	 * of the flow is the only one whose leftover carry is reported as
	 * "closed at sequence end" rather than "carried … across a unit
	 * boundary" — a balanced field contributes nothing, so sharing the
	 * carry further (across sibling top-level senses, or into a child
	 * sequence) is harmless. */
	function runFlow(fields: readonly Field[]): void {
		const carry: TagCarry = { open: [] };
		fields.forEach((field, index) => {
			const translated = translateMarkup(field.html, resolve, carry);
			problems.push(...translated.problems.map((p) => `${source.rid}: ${p}`));
			field.assign(translated.text);
			if (translated.carried > 0) {
				const names = carry.open.map((o) => o.name).join(',');
				markupCarries.push(
					index === fields.length - 1
						? `${source.rid}: ${field.path}: closed at sequence end: ${names}`
						: `${source.rid}: ${field.path}: carried ${names} across a unit boundary`,
				);
			}
		});
	}

	/** One document flow, start to finish: build the output tree and
	 * field list, then translate the fields against one shared carry. */
	function translateSequence(
		sequence: readonly BodySense[],
		path: string,
	): TruthSense[] {
		const fields: Field[] = [];
		const out = buildSenseTree(sequence, path, fields);
		runFlow(fields);
		return out;
	}

	const sefariaHeadword = context.sefariaHeadwords.get(source.rid);
	if (sefariaHeadword === undefined) {
		problems.push(`${source.rid}: no sefariaHeadword`);
	}
	const page = context.pages.get(source.rid);
	if (page === undefined) {
		problems.push(`${source.rid}: no page-index row`);
	}
	// Every part first, then ONE literal in schema key order (Global
	// Constraints): JSON.stringify writes keys in insertion order and
	// the files are reviewed by eye. Conditional spreads keep absent
	// optionals out of the object entirely (exactOptionalPropertyTypes).
	// ONE parse of the whole headword line, not one per item: print's
	// grouping, its `?` and its `…` all sit BETWEEN the forms, and a
	// parenthesis group opened in the headword can close in an
	// alternate four items later (headword design §2).
	const line = [source.headword, ...(source.alt_headwords ?? [])];
	const parsed = parseHeadwordLine(line);
	// A `reform` patch's `display` WINS, and only ever adds. §3 leaves
	// the template unset where the source cannot settle it, and a
	// person reading the print is the only thing that can — so a
	// supplied layout is taken, and the review row that asked for it
	// stops being filed. Every other review the parser raised still is:
	// the layout is the one thing the patch settled.
	const display = source.display ?? parsed.display;
	for (const review of parsed.reviews) {
		if (
			source.display !== undefined &&
			review.kind === 'paren-group-close-unknown'
		) {
			continue;
		}
		headwordReview.push({
			kind: review.kind,
			line: `${source.rid}: ${line.join(', ')} — ${review.reason}`,
		});
	}
	const grammar =
		body.grammar !== undefined && Object.keys(body.grammar).length > 0
			? { ...body.grammar }
			: undefined;
	const senses = translateSequence(body.senses, 'senses');
	const stems = (body.stems ?? []).map((st, i) => ({
		forms: [...st.forms],
		senses: translateSequence(st.senses, `stems[${i}].senses`),
		stem: st.stem,
	}));
	const entry: TruthEntry = {
		schemaVersion: SCHEMA_VERSION,
		id: source.rid,
		sefariaHeadword: sefariaHeadword ?? '',
		headwords: parsed.headwords,
		...(display === undefined ? {} : { display }),
		...(page === undefined
			? {}
			: { page: { number: page.number, column: page.column } }),
		...(grammar === undefined ? {} : { grammar }),
		senses,
		...(stems.length > 0 ? { stems } : {}),
	};
	return { entry, headwordReview, markupCarries, problems, unresolved };
}

export type { FinishContext, Finished, HeadwordReviewRow };
export { finishEntry };
