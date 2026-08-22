import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { checkNoNewText } from '../no-new-text.ts';
import { abbrevInAltHeadwords } from './headwords.ts';

const entry = (headword: string, alt_headwords: string[]): SourceEntry => ({
	alt_headwords,
	content: { senses: [] },
	headword,
	rid: 'R00001',
});

const alts = (headword: string, list: string[]): string[] | undefined =>
	abbrevInAltHeadwords.apply(entry(headword, list)).entry.alt_headwords;

describe('abbrevInAltHeadwords', () => {
	it('expands a uniquely-anchored stub', () => {
		expect(alts('רִיבְדָּא', ['רִי׳'])).toEqual(['רִיבְדָּא']);
	});

	it('unwraps a parenthesized stub before expanding', () => {
		// 88 members are also parenthesized, one of them unclosed.
		expect(alts('אֲגִיחָא', ['(אֲגִיח׳)'])).toEqual(['אֲגִיחָא']);
	});

	it('leaves an ambiguous stub untouched rather than guessing', () => {
		// Final consonant appears twice in the headword — no unique anchor.
		expect(alts('בָּבָא', ['בָּ׳'])).toEqual(['בָּ׳']);
	});

	it('leaves a stub whose final consonant is absent (ס/צ interchange)', () => {
		expect(alts('קִיצְרָא', ['קִיס׳'])).toEqual(['קִיס׳']);
	});

	it('never touches a gershayim acronym', () => {
		// U+05F4, not U+05F3 — 16 genuine acronym lexemes, correct data.
		expect(alts('רַבָּן', ['רשב״ג'])).toEqual(['רשב״ג']);
	});

	it('preserves a Roman homograph numeral on the headword', () => {
		// 175 members carry one; the tail slice must bring it through.
		expect(alts('קִירְיָה II', ['קִירְ׳'])).toEqual(['קִירְיָה II']);
	});

	it('does not double the niqqud the stub already carries', () => {
		// The stub ends in a consonant PLUS its vowel point, while the
		// tail begins at the headword's matching consonant + 1 — i.e. at
		// that same point. Concatenating the bare stub whole doubles it
		// (1,212 of the 1,468 resolvable occurrences). The stub is cut
		// back to its final consonant so the marks come from the
		// headword, which is also how the audit reads חֵיבְ׳ → חֵיבְלָא.
		expect(alts('חֶבְלָא', ['חֵיבְ׳'])).toEqual(['חֵיבְלָא']);
	});

	it('leaves a phrase lemma to phrase-alt-headword-stub', () => {
		// 244 occurrences carved out to their own row by the audit: a
		// multi-word lemma with the headword token stubbed, not a
		// truncated spelling. Expanding it here would file a phrase into
		// the alt-spelling index as a spelling of the headword.
		expect(alts('אַבְיוּ', ['בַּר א׳'])).toEqual(['בַּר א׳']);
	});

	it('leaves a stub that recovers no lexical tail', () => {
		// R00488, one of the 26. The anchor is the headword's last
		// consonant, so all the "expansion" recovers is a bare vowel
		// point — it would assert that a truncation is a full spelling.
		// Residue, not a transform.
		expect(alts('צְלוֹ', ['צְלוֹתָא', 'צְלוּ׳'])).toEqual(['צְלוֹתָא', 'צְלוּ׳']);
	});

	it('returns the entry by identity when nothing resolves', () => {
		const before = entry('בָּבָא', ['בָּ׳']);
		const result = abbrevInAltHeadwords.apply(before);
		expect(result.entry).toBe(before);
		expect(result.records).toEqual([]);
	});

	it('declares the copied tail so the gate credits it', () => {
		// The tail is copied from this entry's own headword, and textOf
		// covers BOTH headword and alt_headwords — so under a plain
		// sub-multiset the tail reads as invented. `copied` is the
		// mechanism (spec §5.1); it must be the TAIL, not the whole
		// expansion, or the declaration over-credits.
		const before = entry('רִיבְדָּא', ['רִי׳']);
		const result = abbrevInAltHeadwords.apply(before);
		expect(result.copied).toEqual(['בְדָּא']);
		expect(
			checkNoNewText(before, result.entry, abbrevInAltHeadwords, result.copied),
		).toEqual([]);
	});

	it('declares one copy per expansion, not one per entry', () => {
		// A declared copy is credited as a MULTISET, so two expansions
		// that share a tail must declare it twice or the second reads as
		// invention.
		const before = entry('רִיבְדָּא', ['רִי׳', '(רִי׳)']);
		const result = abbrevInAltHeadwords.apply(before);
		expect(result.copied).toEqual(['בְדָּא', 'בְדָּא']);
		expect(
			checkNoNewText(before, result.entry, abbrevInAltHeadwords, result.copied),
		).toEqual([]);
	});

	it('records one entry per changed item', () => {
		const result = abbrevInAltHeadwords.apply(entry('רִיבְדָּא', ['רִי׳']));
		expect(result.records).toEqual([
			{
				detail: 'רִי׳ → רִיבְדָּא',
				rid: 'R00001',
				ruleId: 'abbrev-in-alt-headwords',
			},
		]);
	});

	it('leaves an entry with no alt_headwords alone', () => {
		const before: SourceEntry = {
			content: { senses: [] },
			headword: 'רִיבְדָּא',
			rid: 'R00002',
		};
		const result = abbrevInAltHeadwords.apply(before);
		expect(result.entry).toBe(before);
	});
});
