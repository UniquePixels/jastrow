/**
 * Baseline transform model: what the pre-git v1 extraction did to turn
 * a raw Sefaria-shaped entry into the deployed compact shape, minus
 * markup link rewriting (compared separately — see baseline-audit.ts).
 * Anything the real baseline files contain beyond this model is a
 * candidate pre-git hand edit.
 */

interface RawSense {
	definition?: string;
	grammar?: {
		binyan_form?: unknown;
		language_code?: unknown;
		verbal_stem?: unknown;
	};
	number?: string;
	senses?: RawSense[];
}

interface RawEntry {
	alt_headwords?: string[];
	column?: string;
	content?: { morphology?: string; senses?: RawSense[] };
	headword: string;
	language_code?: string;
	language_reference?: string;
	next_hw?: string;
	page?: number;
	plural_form?: string[];
	prev_hw?: string;
	quotes?: string[];
	refs?: string[];
	rid: string;
	[key: string]: unknown;
}

interface Link {
	target: string;
	text: string;
}

const ANCHOR_OPEN = /<a [^>]*>/g;
const ABBR_TAG = /<abbr [^>]*>(.*?)<\/abbr>/g;
const ANCHOR = /<a ([^>]*)>(.*?)<\/a>/g;
const DATA_REF_ATTR = /data-ref="([^"]*)"/;
const HREF_ATTR = /href="([^"]*)"/;

/** Reduce every anchor's open tag to a bare `<a>` so raw refLinks and
 * deployed word-links compare as their visible text. */
function stripLinkAttrs(html: string): string {
	return html.replace(ANCHOR_OPEN, '<a>');
}

/** Unwrap the `<abbr title="…">` tags the extraction injected into
 * deployed text (made dynamic later, in 6831afc). */
function stripAbbrTags(html: string): string {
	return html.replace(ABBR_TAG, '$1');
}

/** The deployed external-link URL the v1 extraction derived from a
 * refLink's data-ref. */
function sefariaUrl(dataRef: string): string {
	return `https://www.sefaria.org/${encodeURIComponent(dataRef)}`;
}

/** Anchor targets in document order: `data-ref` when present (raw
 * refLinks), else `href` (deployed links). */
function extractLinks(html: string): Link[] {
	const links: Link[] = [];
	for (const m of html.matchAll(ANCHOR)) {
		const attrs = m[1] ?? '';
		const dataRef = DATA_REF_ATTR.exec(attrs);
		const href = HREF_ATTR.exec(attrs);
		links.push({
			target: dataRef?.[1] ?? href?.[1] ?? '',
			text: m[2] ?? '',
		});
	}
	return links;
}

function transformSense(sense: RawSense): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	if (sense.definition !== undefined) {
		out['d'] = sense.definition;
	}
	if (sense.number !== undefined) {
		out['n'] = sense.number;
	}
	if (sense.grammar !== undefined) {
		const g: Record<string, unknown> = {};
		if (sense.grammar.verbal_stem !== undefined) {
			g['vs'] = sense.grammar.verbal_stem;
		}
		if (sense.grammar.binyan_form !== undefined) {
			g['bf'] = sense.grammar.binyan_form;
		}
		// carried through unrenamed (3 grammar nodes corpus-wide)
		if (sense.grammar.language_code !== undefined) {
			g['language_code'] = sense.grammar.language_code;
		}
		out['g'] = g;
	}
	if (sense.senses !== undefined) {
		out['s'] = sense.senses.map(transformSense);
	}
	return out;
}

const isEmpty = (v: unknown): boolean =>
	v === undefined ||
	v === null ||
	v === '' ||
	(Array.isArray(v) && v.length === 0);

/** The deployed shape the documented v1 transform predicts for a raw
 * entry. Derived-only fields (`g` language/POS/gender, link markup
 * rewrites) are outside this model. */
function expectedDeployed(raw: RawEntry): Record<string, unknown> {
	const out: Record<string, unknown> = { hw: raw.headword, id: raw.rid };
	const carry: [string, unknown][] = [
		['nh', raw.next_hw],
		['ph', raw.prev_hw],
		['p', raw.page],
		['col', raw.column],
		['ah', raw.alt_headwords],
		['pf', raw.plural_form],
		['q', raw.quotes],
	];
	for (const [key, value] of carry) {
		if (!isEmpty(value)) {
			out[key] = value;
		}
	}
	const li = `${raw.language_code ?? ''}${raw.language_reference ?? ''}`.trim();
	if (li !== '') {
		out['li'] = li;
	}
	const c: Record<string, unknown> = {};
	if (!isEmpty(raw.content?.morphology)) {
		c['mo'] = raw.content?.morphology;
	}
	c['s'] = (raw.content?.senses ?? []).map(transformSense);
	out['c'] = c;
	return out;
}

export type { Link, RawEntry };
export {
	expectedDeployed,
	extractLinks,
	sefariaUrl,
	stripAbbrTags,
	stripLinkAttrs,
};
