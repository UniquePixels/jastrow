import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { checkLinkTargets } from '../link-target.ts';
import { checkMarkup } from '../markup.ts';
import { checkNoNewText } from '../no-new-text.ts';
import { mintOver, unlinkedBareAnaphor } from './anaphora-mint.ts';

const A = (ref: string, display: string): string =>
	`<a class="refLink" href="/${ref.replaceAll(' ', '_')}" data-ref="${ref}">${display}</a>`;

const entry = (definition: string): SourceEntry =>
	({
		content: { senses: [{ definition }] },
		headword: 'x',
		rid: 'T00001',
	}) as SourceEntry;

describe('mintOver', () => {
	it('wraps a bare anaphor in the antecedent’s own opening tag', () => {
		const { mints, text } = mintOver(
			`${A('Shabbat 30b', 'Sabb. 30ᵇ')} Ib. more`,
		);
		expect(text).toBe(
			`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Shabbat 30b', 'Ib.')} more`,
		);
		expect(mints).toHaveLength(1);
		expect(mints[0]?.target).toBe('Shabbat 30b');
	});

	// The tag is COPIED, not rebuilt. A rebuilt tag would be
	// indistinguishable here if the antecedent used the same attribute
	// order and class — so the antecedent below deliberately does not.
	it('copies the antecedent’s tag byte for byte, attribute order included', () => {
		const odd = `<a data-ref="Yoma 2a" class="oddClass" href="/Yoma.2a">Yoma 2ᵃ</a>`;
		const { text } = mintOver(`${odd} Ib. more`);
		expect(text).toBe(
			`${odd} <a data-ref="Yoma 2a" class="oddClass" href="/Yoma.2a">Ib.</a> more`,
		);
	});

	it('takes the lowercase form too', () => {
		const { mints } = mintOver(`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ib. more`);
		expect(mints[0]?.display).toBe('ib.');
	});

	it('chains: each anaphor resolves against the PRE-EDIT anchors', () => {
		// Both `Ib.`s take the same antecedent — the citation — rather
		// than the second taking the first's freshly minted anchor.
		const { mints, text } = mintOver(
			`${A('Shabbat 30b', 'Sabb. 30ᵇ')} Ib. then Ib. end`,
		);
		expect(mints.map((m) => m.target)).toEqual(['Shabbat 30b', 'Shabbat 30b']);
		expect(text).toContain(`${A('Shabbat 30b', 'Ib.')} then`);
	});

	// ---- the declines ----

	it('declines with no preceding anchor at all', () => {
		expect(mintOver(`Ib. and ${A('Shabbat 30b', 'Sabb. 30ᵇ')}`).mints).toEqual(
			[],
		);
	});

	it('declines a `Jastrow, …` cross-reference antecedent', () => {
		// A headword is not a place, so copying one would make `Ib.` name
		// something *ibidem* cannot name.
		expect(mintOver(`${A('Jastrow, אָב 1', 'אב')} Ib. more`).mints).toEqual([]);
	});

	it('declines when an unanchored citation intervenes', () => {
		// `Y. R. Hash. I, 57ᵃ` never became an anchor; copying past it
		// would write a DIFFERENT WORK, and `link-target.ts` cannot catch
		// that because the wrong value is in the entry's own input set.
		expect(
			mintOver(`${A('Shabbat 30b', 'Sabb. 30ᵇ')} Y. R. Hash. I, 57ᵃ Ib. more`)
				.mints,
		).toEqual([]);
	});

	it('reads the cue inside the anaphor’s own token, not only between tokens', () => {
		// The intervening citation sits in the SAME text token as the
		// anaphor. Reading whole tokens only would miss it — measured at
		// 48 sites corpus-wide.
		const { mints } = mintOver(
			`${A('Shabbat 30b', 'Sabb. 30ᵇ')} and Sabb. VII, 2 Ib. more`,
		);
		expect(mints).toEqual([]);
	});

	it('declines an anaphor that already failed into the Yoma 2a sink', () => {
		// `isSpentAnaphor`: that anchor names no place of its own, so
		// copying it would propagate the defect.
		expect(mintOver(`${A('Yoma 2a', 'Ib.')} Ib. more`).mints).toEqual([]);
	});

	it('declines an anaphor carrying a locus of its own', () => {
		for (const locus of ['Ib. 35ᵃ', 'Ib. V, 1', 'Ib. 7']) {
			expect(
				mintOver(`${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${locus} more`).mints,
			).toEqual([]);
		}
	});

	it('never touches an `Ib.` already inside an anchor', () => {
		const already = `${A('Shabbat 30b', 'Sabb. 30ᵇ')} ${A('Yoma 2a:8', 'Ib.')} more`;
		expect(mintOver(already).text).toBe(already);
	});

	it('does not match the `ib.` inside a longer abbreviation', () => {
		// `\\b` would put a boundary between `.` and a following letter.
		const { mints } = mintOver(`${A('Shabbat 30b', 'Sabb. 30ᵇ')} Zeib.x more`);
		expect(mints).toEqual([]);
	});

	it('returns the input unchanged when there is nothing to do', () => {
		const plain = 'no anaphor here';
		expect(mintOver(plain).text).toBe(plain);
	});
});

describe('unlinkedBareAnaphor', () => {
	it('hands back the caller’s own entry when nothing matches', () => {
		const source = entry('nothing to do');
		const result = unlinkedBareAnaphor.apply(source);
		expect(result.entry).toBe(source);
		expect(result.records).toEqual([]);
		expect(result.minted).toBeUndefined();
	});

	it('declares every anchor it creates, naming the input field', () => {
		const definition = `${A('Shabbat 30b', 'Sabb. 30ᵇ')} Ib. more`;
		const result = unlinkedBareAnaphor.apply(entry(definition));
		expect(result.minted).toHaveLength(1);
		// The claim names the field as the input held it, which is what
		// case 10's clause 3 checks against.
		expect(result.minted?.[0]?.field).toBe(definition);
		expect(result.records[0]?.detail).toBe('1 anchored: Shabbat 30b');
	});

	it('walks nested senses', () => {
		const definition = `${A('Shabbat 30b', 'Sabb. 30ᵇ')} Ib. more`;
		const nested = {
			content: { senses: [{ definition: 'lead', senses: [{ definition }] }] },
			headword: 'x',
			rid: 'T00001',
		} as SourceEntry;
		expect(unlinkedBareAnaphor.apply(nested).minted).toHaveLength(1);
	});

	it('runs in the text-repairs phase and declares no allowance', () => {
		expect(unlinkedBareAnaphor.phase).toBe('text-repairs');
		expect(unlinkedBareAnaphor.allows).toBeUndefined();
	});

	// ---- the three gates, on the same repair ----

	it('clears all three transform gates', () => {
		const source = entry(`${A('Shabbat 30b', 'Sabb. 30ᵇ')} Ib. more`);
		const result = unlinkedBareAnaphor.apply(source);
		// No text a reader sees is added: `textOf` strips tags and the
		// display was already there. So no `allows` is needed at all.
		expect(checkNoNewText(source, result.entry, unlinkedBareAnaphor)).toEqual(
			[],
		);
		// A balanced pair is neither an unpopped open nor an unpopping
		// close, so the well-formedness delta is zero.
		expect(checkMarkup(source, result.entry)).toEqual([]);
		expect(
			checkLinkTargets(source, result.entry, result, unlinkedBareAnaphor.id),
		).toEqual([]);
	});

	it('is refused by the gate when the declaration is withheld', () => {
		// The count invariant, which is the whole of what case 10 lifts.
		const source = entry(`${A('Shabbat 30b', 'Sabb. 30ᵇ')} Ib. more`);
		// `exactOptionalPropertyTypes` forbids writing `minted: undefined`,
		// so the declaration is DROPPED rather than blanked — which is
		// also the truer simulation of a rule that never declared one.
		const { minted, ...undeclared } = unlinkedBareAnaphor.apply(source);
		expect(minted).toHaveLength(1);
		expect(
			checkLinkTargets(
				source,
				undeclared.entry,
				undeclared,
				unlinkedBareAnaphor.id,
			),
		).toEqual(['anchor count grew 1 → 2 in T00001']);
	});

	it('is refused when a rule not on the allowlist declares the same mint', () => {
		// The licence is bound to this rule id and to no other.
		const source = entry(`${A('Shabbat 30b', 'Sabb. 30ᵇ')} Ib. more`);
		const result = unlinkedBareAnaphor.apply(source);
		expect(
			checkLinkTargets(source, result.entry, result, 'some-other-rule'),
		).toEqual([
			'1 minted anchor declared by "some-other-rule", which case 10\'s declarer allowlist does not admit',
		]);
	});
});
