/**
 * Shared HTML allow-list validator for dictionary entry content.
 *
 * The browser renders two entry fields as trusted HTML (see
 * `assets/scripts/app.js` `formatSenses` / `trustedHTML`): each sense's
 * `d` (definition, recursively through nested `s` senses) and the
 * entry-level `li` (language info). Everything else is rendered as text.
 *
 * This module is the single source of truth for what HTML is permitted in
 * those fields. It is used by the admin save path (rejects a bad edit
 * before it touches disk) and by the `validate:data` CI gate (fails a PR
 * that introduces disallowed markup). The allow-list mirrors the archived
 * pipeline's Stage-7 sanitizer, widened to the attributes the live data
 * actually uses (audited 2026-06-08).
 *
 * It DETECTS violations rather than stripping them: clean content is never
 * rewritten, so entry serialization stays byte-stable and diffs stay small.
 */

import { Parser } from 'htmlparser2';

export const ALLOWED_TAGS: ReadonlySet<string> = new Set([
	'a',
	'abbr',
	'b',
	'br',
	'div',
	'em',
	'i',
	'p',
	'span',
	'strong',
	'sub',
	'sup',
]);

// Attributes permitted regardless of element.
export const GLOBAL_ATTRS: ReadonlySet<string> = new Set([
	'class',
	'dir',
	'data-ref',
]);

// Additional attributes permitted only on specific elements.
export const ALLOWED_ATTRS_BY_TAG: Readonly<
	Record<string, ReadonlySet<string>>
> = {
	a: new Set(['href', 'target', 'rel']),
	abbr: new Set(['title']),
};

// Schemes permitted in an <a href>. Relative URLs, fragment links
// (`#rid:...`), and query/path-only values carry no scheme and are allowed.
export const ALLOWED_HREF_SCHEMES: ReadonlySet<string> = new Set([
	'http',
	'https',
]);

export interface HtmlViolation {
	detail: string;
	kind: 'tag' | 'attr' | 'scheme';
}

export interface EntryViolation extends HtmlViolation {
	path: string;
}

// Leading scheme of a URL, e.g. "javascript" in "javascript:alert(1)".
// A value with no match is relative/fragment and carries no scheme.
const URL_SCHEME_RE = /^\s*([a-z][a-z0-9+.-]*):/iu;

// Protocol-relative prefix, e.g. "//evil.example".
const PROTOCOL_RELATIVE_RE = /^\s*\/\//u;

function isAttrAllowed(tag: string, attr: string): boolean {
	if (GLOBAL_ATTRS.has(attr)) {
		return true;
	}
	return ALLOWED_ATTRS_BY_TAG[tag]?.has(attr) ?? false;
}

function hrefSchemeViolation(value: string): string | null {
	// Protocol-relative URLs (`//host`) bypass the scheme check but still
	// navigate off-site; treat them as a disallowed scheme.
	if (PROTOCOL_RELATIVE_RE.test(value)) {
		return 'href=//';
	}
	const match = value.match(URL_SCHEME_RE);
	if (!match) {
		return null;
	}
	const scheme = (match[1] ?? '').toLowerCase();
	if (ALLOWED_HREF_SCHEMES.has(scheme)) {
		return null;
	}
	return `href=${scheme}:`;
}

/**
 * Find every allow-list violation in a single HTML string. Entities are
 * decoded before inspection so obfuscated schemes (e.g. `java&#115;cript:`)
 * are still caught.
 */
export function findHtmlViolations(html: string): HtmlViolation[] {
	if (!html || typeof html !== 'string') {
		return [];
	}
	const violations: HtmlViolation[] = [];
	const parser = new Parser(
		{
			onopentag(name: string, attribs: Record<string, string>): void {
				const tag = name.toLowerCase();
				if (!ALLOWED_TAGS.has(tag)) {
					violations.push({ kind: 'tag', detail: tag });
					return;
				}
				for (const rawAttr of Object.keys(attribs)) {
					const attr = rawAttr.toLowerCase();
					if (!isAttrAllowed(tag, attr)) {
						violations.push({ kind: 'attr', detail: `${tag}[${attr}]` });
						continue;
					}
					if (attr === 'href') {
						const scheme = hrefSchemeViolation(attribs[rawAttr] ?? '');
						if (scheme) {
							violations.push({ kind: 'scheme', detail: scheme });
						}
					}
				}
			},
		},
		{
			decodeEntities: true,
			lowerCaseTags: true,
			lowerCaseAttributeNames: true,
		},
	);
	parser.write(html);
	parser.end();
	return violations;
}

interface Sense {
	d?: unknown;
	s?: unknown;
}

function walkSenses(
	senses: unknown,
	path: string,
	out: EntryViolation[],
): void {
	if (!Array.isArray(senses)) {
		return;
	}
	senses.forEach((sense: Sense, i) => {
		const base = `${path}[${i}]`;
		if (typeof sense?.d === 'string') {
			for (const v of findHtmlViolations(sense.d)) {
				out.push({ ...v, path: `${base}.d` });
			}
		}
		if (Array.isArray(sense?.s)) {
			walkSenses(sense.s, `${base}.s`, out);
		}
	});
}

interface EntryShape {
	c?: { s?: unknown };
	li?: unknown;
}

/**
 * Find every allow-list violation across an entry's HTML-bearing fields
 * (`c.s[].d` recursively and `li`), each tagged with its field path.
 */
export function findEntryViolations(entry: unknown): EntryViolation[] {
	const out: EntryViolation[] = [];
	const e = entry as EntryShape;
	if (typeof e?.li === 'string') {
		for (const v of findHtmlViolations(e.li)) {
			out.push({ ...v, path: 'li' });
		}
	}
	if (e?.c?.s) {
		walkSenses(e.c.s, 'c.s', out);
	}
	return out;
}
