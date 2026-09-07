/**
 * The finishing stages (migrate spec §2.1–2.6) applied to one composed
 * entry and its body: form objects, translated markup, citation refs,
 * slug and page, assembled in schema key order.
 */
import type {
	BodyEntry,
	BodySense,
	BodyStem,
	SourceEntry,
} from '../body/types.ts';
import { createResolver, type Unresolved } from './cite.ts';
import { decomposeForm, reviewReason } from './headword.ts';
import { translateMarkup } from './markup.ts';
import type { PagePlacement } from './page.ts';
import type { FormObject, TruthEntry, TruthSense, TruthStem } from './types.ts';

interface FinishContext {
	headwordMap: ReadonlyMap<string, string>;
	pages: ReadonlyMap<string, PagePlacement>;
	slugs: ReadonlyMap<string, string>;
}

interface Finished {
	entry: TruthEntry;
	/** `rid: string — reason` lines for the headword review list. */
	headwordReview: string[];
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
	const resolve = createResolver(context.headwordMap, source.rid, unresolved);

	const form = (marked: string): FormObject => {
		const decomposed = decomposeForm(marked);
		const reason = reviewReason(decomposed);
		if (reason !== undefined) {
			headwordReview.push(`${source.rid}: ${marked} — ${reason}`);
		}
		return decomposed.form;
	};
	const text = (html: string): string => {
		const translated = translateMarkup(html, resolve);
		problems.push(...translated.problems.map((p) => `${source.rid}: ${p}`));
		return translated.text;
	};
	const sense = (s: BodySense): TruthSense => {
		const out: TruthSense = { gloss: text(s.gloss), units: s.units.map(text) };
		if (s.label !== undefined) {
			out.label = s.label;
		}
		if (s.senses !== undefined && s.senses.length > 0) {
			out.senses = s.senses.map(sense);
		}
		return out;
	};
	const stem = (st: BodyStem): TruthStem => ({
		forms: [...st.forms],
		senses: st.senses.map(sense),
		stem: st.stem,
	});

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
	const senses = body.senses.map(sense);
	const stems = (body.stems ?? []).map(stem);
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
	return { entry, headwordReview, problems, unresolved };
}

export type { FinishContext, Finished };
export { finishEntry };
