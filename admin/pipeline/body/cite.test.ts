import { describe, expect, it } from 'bun:test';
import { findCitations } from './cite.ts';

const EXT =
	'<a class="refLink" href="/Shemot_Rabbah.46.5" data-ref="Shemot Rabbah 46:5">Ex. R. s. 46</a>';
const EXT_NOSLASH =
	'<a class="refLink" href="Jerusalem_Talmud_Nedarim.5.6.3" data-ref="Jerusalem Talmud Nedarim 5:6:3">Y. Ned. V, 39ᵇ</a>';
const INT =
	'<a dir="rtl" class="refLink" href="/Jastrow,_אֵם.1" data-ref="Jastrow, אֵם 1">אֵם</a>';

// J00597 fragment (data/source/jastrow-dictionary.jsonl): a mangled anchor
// whose href quote is never closed — it runs into "</a>" — immediately
// followed by a valid anchor. Pins the fix so the malformed open tag is
// flagged rather than swallowing its valid neighbor and cross-attributing
// its data-ref.
const J00597_MANGLED =
	'(cmp. <a dir="rtl" class="refLink" href="/Jastrow,_דִּלְדֵּל.1</a><a class="refLink" href="/Bava_Metzia.38b" data-ref="Bava Metzia 38b">B. Mets. 38ᵇ</a>';

describe('findCitations', () => {
	it('finds external anchors in both href forms', () => {
		const hits = findCitations(`x. ${EXT} y ${EXT_NOSLASH} z`);
		expect(hits).toHaveLength(2);
		expect(hits[0]?.kind).toBe('external');
		expect(hits[0]?.dataRef).toBe('Shemot Rabbah 46:5');
		expect(hits[0]?.malformed).toBe(false);
		expect(hits[0]?.hadLeadingSlash).toBe(true);
		expect(hits[1]?.kind).toBe('external');
		expect(hits[1]?.malformed).toBe(false);
		expect(hits[1]?.hadLeadingSlash).toBe(false);
	});

	it('classifies Jastrow targets as internal', () => {
		const hits = findCitations(`v. ${INT}.`);
		expect(hits[0]?.kind).toBe('internal');
		expect(hits[0]?.dataRef).toBe('Jastrow, אֵם 1');
		expect(hits[0]?.malformed).toBe(false);
		expect(hits[0]?.hadLeadingSlash).toBe(true);
	});

	it('reports exact spans so slicing reconstructs the input', () => {
		const s = `a ${EXT} b`;
		const [hit] = findCitations(s);
		expect(s.slice(hit?.start, hit?.end)).toContain('</a>');
	});

	it('returns an empty array for a definition with no anchors', () => {
		expect(findCitations('plain text, no markup here.')).toEqual([]);
	});

	it('reports correct non-overlapping spans for adjacent anchors', () => {
		const s = `${EXT}${INT}`;
		const hits = findCitations(s);
		expect(hits).toHaveLength(2);
		expect(hits[0]?.start).toBe(0);
		expect(hits[0]?.end).toBe(EXT.length);
		expect(hits[1]?.start).toBe(EXT.length);
		expect(hits[1]?.end).toBe(s.length);
		expect(s.slice(hits[0]?.start, hits[0]?.end)).toBe(EXT);
		expect(s.slice(hits[1]?.start, hits[1]?.end)).toBe(INT);
	});
});

describe('findCitations malformed anchors', () => {
	it('returns an empty array early when there is no closing </a> at all', () => {
		const s = '<a class="refLink" href="/X.1" data-ref="X 1">no close here';
		expect(findCitations(s)).toEqual([]);
	});

	it('flags a mangled anchor without swallowing the following valid one (J00597)', () => {
		const hits = findCitations(J00597_MANGLED);
		expect(hits).toHaveLength(2);

		const [mangled, valid] = hits;
		expect(mangled?.malformed).toBe(true);
		expect(mangled?.dataRef).toBe('');
		expect(mangled?.href).toContain('</a>');
		expect(mangled?.hadLeadingSlash).toBe(true);

		expect(valid?.malformed).toBe(false);
		expect(valid?.href).toBe('Bava_Metzia.38b');
		expect(valid?.dataRef).toBe('Bava Metzia 38b');
		expect(valid?.hadLeadingSlash).toBe(true);
	});
});
