import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { RULES } from '../registry.ts';
import { applyTransforms } from '../run.ts';
import type { Rule } from '../types.ts';
import {
	bareRtlHebrew,
	latinTokenInsideRtl,
	redundantOuterRtl,
} from './rtl.ts';

const entry = (definition: string): SourceEntry => ({
	content: { senses: [{ definition }] },
	headword: 'x',
	rid: 'A00001',
});

const out = (rule: Rule, definition: string): string | undefined =>
	rule.apply(entry(definition)).entry.content.senses[0]?.definition;

describe('bareRtlHebrew', () => {
	it('wraps a quotation after a citation anchor', () => {
		expect(out(bareRtlHebrew, '<a href="/x">Ber. 2ᵃ</a> שָׁלוֹם')).toBe(
			'<a href="/x">Ber. 2ᵃ</a> <span dir="rtl">שָׁלוֹם</span>',
		);
	});

	it('wraps the run, not the node, when Hebrew and Latin share one node', () => {
		// 4,691 of 5,679 bare nodes are mixed; wrapping the node whole
		// would drag "cmp." and "a. fr." into an RTL context.
		expect(out(bareRtlHebrew, '<a href="/x">Ib.</a> cmp. שָׁלוֹם a. fr.')).toBe(
			'<a href="/x">Ib.</a> cmp. <span dir="rtl">שָׁלוֹם</span> a. fr.',
		);
	});

	it('wraps an etymology parenthetical', () => {
		expect(out(bareRtlHebrew, '(cmp. דֵּיצָא)')).toBe(
			'(cmp. <span dir="rtl">דֵּיצָא</span>)',
		);
	});

	it('leaves the sub-lemma header bare — 473 bare against 0 wrapped', () => {
		const header = '—נ׳ ימא <i>sea-farers</i>';
		expect(out(bareRtlHebrew, header)).toBe(header);
	});

	it('leaves a mid-definition sub-lemma header bare, wrapping the rest', () => {
		// The corpus shape: the header follows the previous sense inside
		// ONE text node, so the node does not start with the em-dash.
		// Testing the node's start instead of the run's matched 8 runs
		// corpus-wide where testing the run's matched 627.
		expect(
			out(
				bareRtlHebrew,
				'<a href="/x">Ber. 2ᵃ</a> שלום; a. e.—א׳ הַשָּׁעוֹת <i>gloss</i>',
			),
		).toBe(
			'<a href="/x">Ber. 2ᵃ</a> <span dir="rtl">שלום</span>; a. e.—א׳ הַשָּׁעוֹת <i>gloss</i>',
		);
	});

	it('leaves a definition-initial sub-lemma header bare', () => {
		// The same construct at the head of a nested sense, with no
		// em-dash: 165 of the 172 definition-initial bare runs.
		const header = 'ה׳ ד־ <i>he who</i>';
		expect(out(bareRtlHebrew, header)).toBe(header);
	});

	it('wraps an em-dash header that is NOT followed by a gloss', () => {
		// The 2.2%-bare slot: em-dash + Hebrew + a citation, not an <i>.
		expect(out(bareRtlHebrew, '—אדרא <a href="/y">Ber. 2ᵃ</a>')).toBe(
			'—<span dir="rtl">אדרא</span> <a href="/y">Ber. 2ᵃ</a>',
		);
	});

	it('never writes a span into a malformed tag\u2019s attribute tail', () => {
		// D00478: an unterminated href swallows the closing tag, so the
		// remaining attributes tokenize as text. Wrapping the Hebrew in
		// there would put a <span> inside the data-ref VALUE, corrupting
		// a machine identifier and leaving a span in the attribute the
		// pending unterminated-href-swallows-closing-tag row must rebuild.
		const damaged =
			'v. <a dir="rtl" class="refLink" href="/Jastrow,_\u05DB\u05B8\u05BC\u05DC\u05D5\u05BC\u05DC.1</a>" data-ref="Jastrow, \u05DB\u05B8\u05BC\u05DC\u05D5\u05BC\u05DC 1">\u05DB\u05B8\u05BC\u05DC\u05D5\u05BC\u05DC</a>.';
		expect(out(bareRtlHebrew, damaged)).toBe(damaged);
	});

	// J00597's shape, where the attribute NEVER recovers: no later text
	// token carries the `>` that would end it, so the whole remainder of
	// the field is attribute interior. A one-token lookback saw only the
	// `</span>` immediately before the tail and would have wrapped it;
	// the region model shared with the markup gate does not.
	it('never writes a span deeper in an unrecovered attribute region', () => {
		const damaged =
			'(cmp. <a dir="rtl" class="refLink" href="/Jastrow,_דִּלְדֵּל.1</a>' +
			'<a class="refLink" href="/Bava_Metzia.38b">B. Mets. 38ᵇ</a> ' +
			'<span dir="rtl">היוֹרֵד</span>' +
			' he who takes possession, cmp. דָּבָר.';
		expect(out(bareRtlHebrew, damaged)).toBe(damaged);
	});

	it('wraps that same tail when no attribute region covers it', () => {
		// The control for the test above: the node is left bare because of
		// the REGION, not because of anything in its own shape — it is not
		// a sub-lemma header and nothing else excludes it.
		expect(
			out(
				bareRtlHebrew,
				'<span dir="rtl">היוֹרֵד</span> he who takes possession, cmp. דָּבָר.',
			),
		).toBe(
			'<span dir="rtl">היוֹרֵד</span> he who takes possession, cmp. <span dir="rtl">דָּבָר</span>.',
		);
	});

	it('leaves already-wrapped Hebrew alone', () => {
		const wrapped = '<span dir="rtl">שָׁלוֹם</span>';
		expect(out(bareRtlHebrew, wrapped)).toBe(wrapped);
	});
});

describe('redundantOuterRtl', () => {
	it('unwraps an outer span whose content already carries rtl', () => {
		expect(
			out(
				redundantOuterRtl,
				'<span dir="rtl">a <span dir="rtl">שלום</span></span>',
			),
		).toBe('a <span dir="rtl">שלום</span>');
	});

	it('leaves a lone rtl span alone', () => {
		const lone = '<span dir="rtl">שלום</span>';
		expect(out(redundantOuterRtl, lone)).toBe(lone);
	});
});

describe('latinTokenInsideRtl', () => {
	it('moves a trailing Roman numeral outside the span', () => {
		expect(out(latinTokenInsideRtl, '<span dir="rtl">שלום II</span>')).toBe(
			'<span dir="rtl">שלום</span> II',
		);
	});

	it('leaves a Roman numeral already outside the span alone', () => {
		const clean = '<span dir="rtl">שלום</span> II';
		expect(out(latinTokenInsideRtl, clean)).toBe(clean);
	});

	it('reaches the language_reference etymology field too', () => {
		// 8 of the row's catalogued 130 entries carry the defect only
		// here (A00614, A00840, A00939, A02475, B00294, C00204, H01837,
		// S02223); definitions alone measured 122.
		const source: SourceEntry = {
			content: { senses: [{ definition: 'no hebrew here' }] },
			headword: 'x',
			language_reference: 'v. <span dir="rtl">חוּד II</span>)',
			rid: 'A00614',
		};
		const result = latinTokenInsideRtl.apply(source);
		expect(result.entry.language_reference).toBe(
			'v. <span dir="rtl">חוּד</span> II)',
		);
		expect(result.records).toHaveLength(1);
	});
});

describe('the family composed', () => {
	const compose = (
		rules: readonly Rule[],
		definition: string,
	): string | undefined =>
		applyTransforms(entry(definition), 'text-repairs', rules).entry.content
			.senses[0]?.definition;

	// The audit's warning made concrete: "Any Phase 2 transform should be
	// written against all three at once, or it will trade one for
	// another." Here the trade is in the registry ORDER, not a predicate.
	it('unwrapping after wrapping strands the re-exposed Hebrew', () => {
		expect(
			compose(
				[bareRtlHebrew, redundantOuterRtl],
				'<span dir="rtl">a שלום <span dir="rtl">ב</span></span>',
			),
		).toBe('a שלום <span dir="rtl">ב</span>');
	});

	it('the registry order unwraps first, so nothing is left bare', () => {
		expect(
			compose(RULES, '<span dir="rtl">a שלום <span dir="rtl">ב</span></span>'),
		).toBe('a <span dir="rtl">שלום</span> <span dir="rtl">ב</span>');
	});

	it('registers the unwrapper ahead of the wrapper', () => {
		const at = (rule: Rule): number =>
			RULES.findIndex((other) => other.id === rule.id);
		expect(at(redundantOuterRtl)).toBeLessThan(at(bareRtlHebrew));
	});
});
