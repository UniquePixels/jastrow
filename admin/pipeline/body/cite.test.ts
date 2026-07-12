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

// A00085 fragment (data/source/jastrow-dictionary.jsonl): an outer refLink
// anchor whose open tag immediately wraps an inner refLink anchor with an
// identical href/data-ref — a benign nested-duplicate quirk Sefaria
// produces (471 of 474 corpus-wide occurrences of the "nested open tag
// before any close" case are this class). Pins the fix so the outer still
// yields a hit — malformed, span limited to its own open tag — instead of
// vanishing, while the inner is unaffected.
const A00085_OUTER_OPEN =
	'<a dir="rtl" class="refLink" href="/Jastrow,_אבהנוס.1" data-ref="Jastrow, אבהנוס 1">';
const A00085_INNER =
	'<a dir="rtl" class="refLink" href="/Jastrow,_אבהנוס.1" data-ref="Jastrow, אבהנוס 1">אבהנוס</a>';
const A00085_NESTED_DUP = `${A00085_OUTER_OPEN}${A00085_INNER}.</a>`;

// J00603 fragment (data/source/jastrow-dictionary.jsonl): the
// `Shir_HaShirim_Rabbah.1` anchor opens cleanly but its own `</a>` is
// missing from the source — the next thing in the text is another refLink
// open tag (itself the outer half of a nested-duplicate pair). Before the
// fix this anchor produced no hit and no flag at all — a genuine citation
// loss (only 3 of 474 corpus-wide occurrences of this shape are this
// class, the other two being D00478 and a second anchor within J00597
// itself).
const J00603_SHIR_OPEN =
	'<a class="refLink" href="/Shir_HaShirim_Rabbah.1" data-ref="Shir HaShirim Rabbah 1">';
const J00603_FRAGMENT = `${J00603_SHIR_OPEN}Cant. R. to I, 2ᵇ <span dir="rtl">י׳ שבכלים</span> the commonest of vessels (earthen); (Taan. 7ᵃ <span dir="rtl">פחות</span>, Sifré Deut. 48 <span dir="rtl">גרוע</span>). <a class="refLink" href="Jerusalem_Talmud_Bava_Metzia.5.8.2" data-ref="Jerusalem Talmud Bava Metzia 5:8:2"><a class="refLink" href="Jerusalem_Talmud_Bava_Metzia.5.8.2" data-ref="Jerusalem Talmud Bava Metzia 5:8:2">Y. B. Mets. V, beg. 9ᶜ</a></a>`;

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
		// Unaffected by the nested-open-tag fix below: this fixture's loss is
		// the runaway-href-quote case (extractHref-level), a different code
		// path from the "nested open tag before any close" case. Counts are
		// unchanged (still 2 hits) — pinned here so a future change to either
		// path can't silently regress this one.
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

describe('findCitations never-drops-a-valid-anchor recovery', () => {
	it('flags the outer of a nested-duplicate anchor pair instead of dropping it (A00085)', () => {
		const hits = findCitations(A00085_NESTED_DUP);
		expect(hits).toHaveLength(2);

		const [outer, inner] = hits;
		expect(outer?.malformed).toBe(true);
		expect(outer?.href).toBe('Jastrow,_אבהנוס.1');
		expect(outer?.dataRef).toBe('Jastrow, אבהנוס 1');
		expect(A00085_NESTED_DUP.slice(outer?.start, outer?.end)).toBe(
			A00085_OUTER_OPEN,
		);

		expect(inner?.malformed).toBe(false);
		expect(inner?.href).toBe(outer?.href);
		expect(inner?.dataRef).toBe(outer?.dataRef);
		expect(A00085_NESTED_DUP.slice(inner?.start, inner?.end)).toBe(
			A00085_INNER,
		);
	});

	it('recovers a previously-invisible anchor whose close is missing (J00603)', () => {
		const hits = findCitations(J00603_FRAGMENT);

		// Before the fix this anchor produced no hit at all: the boundary
		// search found the next refLink open tag before any `</a>` and the
		// outer was silently dropped.
		const shir = hits.find((hit) => hit.href === 'Shir_HaShirim_Rabbah.1');
		expect(shir).toBeDefined();
		expect(shir?.malformed).toBe(true);
		expect(shir?.dataRef).toBe('Shir HaShirim Rabbah 1');
		expect(shir?.hadLeadingSlash).toBe(true);
		expect(J00603_FRAGMENT.slice(shir?.start, shir?.end)).toBe(
			J00603_SHIR_OPEN,
		);
	});
});
