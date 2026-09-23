/**
 * The nested-anchor duplicate-layer pair, fixture tier.
 *
 * The fixture tier is hand-written rather than rid-loaded, unlike
 * `gershayim.test.ts`: what is being tested here is a STRUCTURAL
 * predicate (one anchor strictly inside another, sharing a target)
 * plus a byte-exact removal, and every property that matters — the
 * nesting, the shared target, the trapped mark, the two-pairs-in-one-
 * field re-derive, the refusal on an unclosed outer — is expressible
 * in a literal without appealing to the author's memory of the data.
 *
 * The corpus tier that pinned the predicate to the real population —
 * the trapped-mark census, the disjoint-population check, and the
 * three-gate `applyTransforms` sweep — was retired in consolidation
 * step 5 and is listed in `docs/archive/retired-corpus-checks.md`.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../types.ts';
import {
	dupAnchorLanguageRef,
	nestedAnchorDuplicate,
} from './nested-anchor.ts';

const A =
	'<a dir="rtl" class="refLink" href="/Jastrow,_x.1" data-ref="Jastrow, x 1">';

const withLangRef = (html: string): SourceEntry => ({
	content: { senses: [] },
	headword: 'h',
	language_reference: html,
	rid: 'L1',
});
const withDef = (html: string): SourceEntry => ({
	content: { senses: [{ definition: html }] },
	headword: 'h',
	rid: 'D1',
});

describe('dupAnchorLanguageRef', () => {
	it('drops the outer layer and keeps the trapped mark', () => {
		const out = dupAnchorLanguageRef.apply(
			withLangRef(`${A}${A}word</a>)</a>`),
		);
		expect(out.entry.language_reference).toBe(`${A}word</a>)`);
		expect(out.records).toHaveLength(1);
		expect(out.records[0]?.detail).toBe(')');
		expect(out.unlinks).toBe(1);
	});

	it('leaves a nested pair with different hrefs alone', () => {
		const other = A.replace('_x.1', '_y.1');
		const input = withLangRef(`${A}${other}word</a>)</a>`);
		const out = dupAnchorLanguageRef.apply(input);
		expect(out.entry).toBe(input);
		expect(out.records).toEqual([]);
	});

	it('leaves two SIBLING anchors sharing an href alone', () => {
		const input = withLangRef(`${A}one</a> and ${A}two</a>`);
		expect(dupAnchorLanguageRef.apply(input).entry).toBe(input);
	});

	it('does not touch a definition', () => {
		const input = withDef(`${A}${A}word</a>.</a>`);
		expect(dupAnchorLanguageRef.apply(input).entry).toBe(input);
	});

	it('refuses an unclosed outer anchor', () => {
		const input = withLangRef(`${A}${A}word</a>)`);
		expect(dupAnchorLanguageRef.apply(input).entry).toBe(input);
	});

	it('declares no allowed codepoints', () => {
		expect(dupAnchorLanguageRef.allows).toBeUndefined();
	});
});

describe('nestedAnchorDuplicate', () => {
	it('drops the outer layer, keeping the trapped period', () => {
		const out = nestedAnchorDuplicate.apply(withDef(`${A}${A}word</a>.</a>`));
		expect(out.entry.content.senses[0]?.definition).toBe(`${A}word</a>.`);
		expect(out.records[0]?.detail).toBe('.');
		expect(out.unlinks).toBe(1);
	});

	it('handles the JT shape, which traps nothing', () => {
		const jt =
			'<a class="refLink" href="Jerusalem_Talmud_Peah.1" data-ref="Jerusalem Talmud Peah 1">';
		const out = nestedAnchorDuplicate.apply(
			withDef(`lead ${jt}${jt}Y. Peah I</a></a> tail`),
		);
		expect(out.entry.content.senses[0]?.definition).toBe(
			`lead ${jt}Y. Peah I</a> tail`,
		);
		expect(out.records).toHaveLength(1);
		expect(out.records[0]?.detail).toBe('');
	});

	it('re-derives after each edit, so two pairs in one field both go', () => {
		const out = nestedAnchorDuplicate.apply(
			withDef(`${A}${A}a</a>.</a> and ${A}${A}b</a>.</a>`),
		);
		expect(out.entry.content.senses[0]?.definition).toBe(
			`${A}a</a>. and ${A}b</a>.`,
		);
		expect(out.records).toHaveLength(2);
		expect(out.unlinks).toBe(2);
	});

	it('reaches a NESTED sense, not only the top level', () => {
		const input: SourceEntry = {
			content: { senses: [{ senses: [{ definition: `${A}${A}w</a>.</a>` }] }] },
			headword: 'h',
			rid: 'D2',
		};
		const out = nestedAnchorDuplicate.apply(input);
		expect(out.entry.content.senses[0]?.senses?.[0]?.definition).toBe(
			`${A}w</a>.`,
		);
		expect(out.records).toHaveLength(1);
	});

	it('does not touch a language_reference', () => {
		const input = withLangRef(`${A}${A}word</a>)</a>`);
		expect(nestedAnchorDuplicate.apply(input).entry).toBe(input);
	});

	it('refuses an unclosed outer anchor', () => {
		const input = withDef(`${A}${A}word</a>.`);
		expect(nestedAnchorDuplicate.apply(input).entry).toBe(input);
	});

	it('declares no allowed codepoints', () => {
		expect(nestedAnchorDuplicate.allows).toBeUndefined();
	});
});
