/**
 * The finishing stages (migrate spec §2.1–2.6) applied to one composed
 * entry and its body: form objects, translated markup, citation refs,
 * slug and page, assembled in schema key order.
 */
import type { BodyEntry, BodySense, SourceEntry } from '../body/types.ts';
import { createResolver, type Unresolved } from './cite.ts';
import { decomposeForm, reviewReason } from './headword.ts';
import { type TagCarry, translateMarkup } from './markup.ts';
import type { PagePlacement } from './page.ts';
import type { FormObject, TruthEntry, TruthSense } from './types.ts';

interface FinishContext {
	headwordMap: ReadonlyMap<string, string>;
	pages: ReadonlyMap<string, PagePlacement>;
	slugs: ReadonlyMap<string, string>;
}

interface Finished {
	entry: TruthEntry;
	/** `rid: string — reason` lines for the headword review list. */
	headwordReview: string[];
	/** `rid: path: …` lines noting an inline tag run that crossed a
	 * body-unit boundary (carried and reopened) or was still open at
	 * the end of its sense sequence (closed there instead). Neither is
	 * a `problems` entry — see `translateSequence`. */
	markupCarries: string[];
	problems: string[];
	unresolved: Unresolved[];
}

function finishEntry(
	source: SourceEntry,
	body: BodyEntry,
	context: FinishContext,
): Finished {
	const problems: string[] = [];
	const unresolved: Unresolved[] = [];
	const headwordReview: string[] = [];
	const markupCarries: string[] = [];
	const resolve = createResolver(context.headwordMap, source.rid, unresolved);

	const form = (marked: string): FormObject => {
		const decomposed = decomposeForm(marked);
		const reason = reviewReason(decomposed);
		if (reason !== undefined) {
			headwordReview.push(`${source.rid}: ${marked} — ${reason}`);
		}
		return decomposed.form;
	};

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

	const slug = context.slugs.get(source.rid);
	if (slug === undefined) {
		problems.push(`${source.rid}: no slug assigned`);
	}
	const page = context.pages.get(source.rid);
	if (page === undefined) {
		problems.push(`${source.rid}: no page-index row`);
	}
	// Every part first, then ONE literal in schema key order (Global
	// Constraints): JSON.stringify writes keys in insertion order and
	// the files are reviewed by eye. Conditional spreads keep absent
	// optionals out of the object entirely (exactOptionalPropertyTypes).
	const headword = form(source.headword);
	const altHeadwords = (source.alt_headwords ?? []).map(form);
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
		id: source.rid,
		slug: slug ?? '',
		headword,
		...(altHeadwords.length > 0 ? { altHeadwords } : {}),
		...(page === undefined
			? {}
			: { page: { number: page.number, column: page.column } }),
		...(grammar === undefined ? {} : { grammar }),
		senses,
		...(stems.length > 0 ? { stems } : {}),
	};
	return { entry, headwordReview, markupCarries, problems, unresolved };
}

export type { FinishContext, Finished };
export { finishEntry };
