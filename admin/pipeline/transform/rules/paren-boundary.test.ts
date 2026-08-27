/**
 * Fixture tier for `rules/paren-boundary.ts`. The corpus tier — the
 * catalogued populations, the per-entry gate stack and the
 * both-orders composition — lives in `paren-boundary-corpus.test.ts`,
 * following this module's convention for a tier that reads all 32,512
 * entries.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { tokenize } from '../html.ts';
import { checkLinkTargets } from '../link-target.ts';
import { anchors } from '../links.ts';
import { fieldsOf } from '../no-new-text.ts';
import type { TransformResult } from '../types.ts';
import {
	openParenInAnchorDisplay,
	toseftaCloseParen,
	toseftaPrimaryHalakha,
} from './paren-boundary.ts';

const PRIMARY =
	'<a class="refLink" href="/Tosefta_Shabbat.16" data-ref="Tosefta Shabbat 16">';
const VARIANT =
	'<a class="refLink" href="/Tosefta_Shabbat.17.6" data-ref="Tosefta Shabbat 17:6">';
const SPLIT = `${PRIMARY}Tosef. Sabb. XVI</a> (${VARIANT}XVII), 6</a>`;

/** `headword` is present because `fieldsOf` walks it unconditionally. */
const def = (html: string): SourceEntry => ({
	content: { senses: [{ definition: html }] },
	headword: 'h',
	rid: 'A00196',
});

const definitionOf = (entry: SourceEntry): string | undefined =>
	entry.content.senses[0]?.definition;

/** The opening-tag token index of the `at`-th anchor of `html` — half
 * of the witness a case-7 claim names, the other half being `html`
 * itself. Read off `links.ts` rather than counted by hand, so the
 * fixtures cannot drift from the gate's own reading. */
const openOf = (html: string, at: number): number =>
	anchors(tokenize(html))[at]?.open ?? -1;

/** The variant anchor of `SPLIT` — the one whose display prints the
 * halakha, and so the one every case-7 claim here cites. */
const VARIANT_OPEN = openOf(SPLIT, 1);

/** Anchors whose DISPLAY is empty — a link with nothing to click.
 * Counted because an invariant anchor count does NOT establish "no
 * link lost": `<a>(</a>)` clears the count and all four gates while
 * being a hollowed-out link. See the rule module's docstring. */
const hollowAnchors = (entry: SourceEntry): number =>
	fieldsOf(entry)
		.flatMap((text) => anchors(tokenize(text)))
		.filter((anchor) => anchor.display === '').length;

/** Freeze an entry all the way down to `senses[0]`, where `definition`
 * actually lives — a shallow freeze to `content` leaves the one object
 * a mutating rule would write to unprotected, so it proves nothing. */
const frozen = (html: string): SourceEntry => {
	const entry = def(html);
	Object.freeze(entry.content.senses[0]);
	Object.freeze(entry.content.senses);
	Object.freeze(entry.content);
	return Object.freeze(entry);
};

describe('toseftaCloseParen', () => {
	it('moves the ")" outside the variant anchor', () => {
		const out = toseftaCloseParen.apply(def(SPLIT));
		expect(definitionOf(out.entry)).toBe(
			`${PRIMARY}Tosef. Sabb. XVI</a> (${VARIANT}XVII</a>), 6`,
		);
		expect(out.records).toHaveLength(1);
	});

	it('leaves a plain Tosefta anchor with no parenthetical alone', () => {
		const plain = def(`${PRIMARY}Tosef. Sabb. XVI, 6</a>`);
		expect(toseftaCloseParen.apply(plain).entry).toBe(plain);
	});

	it('declines a variant with no preceding anchor', () => {
		const orphan = def(`Tosef. Sabb. (${VARIANT}XVII), 6</a>`);
		expect(toseftaCloseParen.apply(orphan).entry).toBe(orphan);
	});

	it('repairs both pairs when one field holds two', () => {
		const out = toseftaCloseParen.apply(def(`${SPLIT} and ${SPLIT}`));
		expect(out.records).toHaveLength(2);
		expect(definitionOf(out.entry)).toBe(
			`${PRIMARY}Tosef. Sabb. XVI</a> (${VARIANT}XVII</a>), 6 and ${PRIMARY}Tosef. Sabb. XVI</a> (${VARIANT}XVII</a>), 6`,
		);
	});

	it('recurses into nested senses', () => {
		const nested: SourceEntry = {
			content: { senses: [{ senses: [{ definition: SPLIT }] }] },
			headword: 'h',
			rid: 'A00196',
		};
		const out = toseftaCloseParen.apply(nested);
		expect(out.records).toHaveLength(1);
		expect(out.entry.content.senses[0]?.senses?.[0]?.definition).toContain(
			'XVII</a>), 6',
		);
	});

	it('changes no target, so the gate passes with nothing declared', () => {
		const src = def(SPLIT);
		const out = toseftaCloseParen.apply(src);
		expect(checkLinkTargets(src, out.entry, out)).toEqual([]);
	});

	it('treats the entry as immutable', () => {
		const src = frozen(SPLIT);
		expect(() => toseftaCloseParen.apply(src)).not.toThrow();
		expect(definitionOf(src)).toBe(SPLIT);
	});

	it('declines a variant carrying inner markup, which would cross', () => {
		const crossed = def(
			`${PRIMARY}Tosef. Sabb. XVI</a> (${VARIANT}<i>XVII), 6</i></a>`,
		);
		expect(toseftaCloseParen.apply(crossed).entry).toBe(crossed);
	});
});

describe('openParenInAnchorDisplay', () => {
	const A =
		'<a dir="rtl" class="refLink" href="/Jastrow,_ס.1" data-ref="Jastrow, ס 1">';

	it('moves the opening paren outside, touching no target', () => {
		const out = openParenInAnchorDisplay.apply(def(`${A}(ס</a>)`));
		expect(definitionOf(out.entry)).toBe(`(${A}ס</a>)`);
		expect(out.recombined).toBeUndefined();
		expect(out.records).toHaveLength(1);
	});

	it('leaves an anchor whose paren closes inside alone', () => {
		const B = '<a class="refLink" href="/x.1" data-ref="x 1">';
		const balanced = def(`${B}(both here)</a>`);
		expect(openParenInAnchorDisplay.apply(balanced).entry).toBe(balanced);
	});

	it('declines an anchor carrying inner markup', () => {
		const B = '<a class="refLink" href="/x.1" data-ref="x 1">';
		const inner = def(`${B}(<i>x</i></a>)`);
		expect(openParenInAnchorDisplay.apply(inner).entry).toBe(inner);
	});

	it('changes no target, so the gate passes with nothing declared', () => {
		const src = def(`${A}(ס</a>)`);
		const out = openParenInAnchorDisplay.apply(src);
		expect(checkLinkTargets(src, out.entry, out)).toEqual([]);
	});

	it('declines the opposite polarity, which is the other row', () => {
		const split = def(SPLIT);
		expect(openParenInAnchorDisplay.apply(split).entry).toBe(split);
	});

	it('treats the entry as immutable', () => {
		const src = frozen(`${A}(ס</a>)`);
		expect(() => openParenInAnchorDisplay.apply(src)).not.toThrow();
		expect(definitionOf(src)).toBe(`${A}(ס</a>)`);
	});

	it('would hollow out a one-character display, which is why the corpus tier counts empty displays', () => {
		// Not a repair and not a decline: the rule DOES fire here, and
		// every gate passes. The live population is 0, and the corpus
		// tier's empty-display invariant is what keeps it that way.
		const out = openParenInAnchorDisplay.apply(def(`${A}(</a>)`));
		expect(definitionOf(out.entry)).toBe(`(${A}</a>)`);
		expect(hollowAnchors(out.entry)).toBe(1);
		expect(hollowAnchors(def(`${A}(</a>)`))).toBe(0);
	});
});

/**
 * `keepsParensBalanced`, in its own block because the harm it refuses
 * is invisible to all four gates: moving one `(` past one tag changes
 * no text multiset, no target, no anchor count and no markup delta, so
 * a stranded `)` would ship green. Live population is 0 corpus-wide
 * under either reading of "balanced", which is why both members below
 * are constructed.
 */
describe('openParenInAnchorDisplay — the balance guard', () => {
	const B = '<a class="refLink" href="/x.1" data-ref="x 1">';

	it('declines a display that would strand a ")" inside the link', () => {
		const stranding = def(`${B}(XVII)</a>)`);
		expect(openParenInAnchorDisplay.apply(stranding).entry).toBe(stranding);
	});

	it('still fires when the display balances its own inner parens', () => {
		const out = openParenInAnchorDisplay.apply(def(`${B}(a (b) c</a>)`));
		expect(definitionOf(out.entry)).toBe(`(${B}a (b) c</a>)`);
		expect(out.records).toHaveLength(1);
	});
});

describe('the two rules are disjoint', () => {
	it('neither rule declares an allowance', () => {
		expect(toseftaCloseParen.allows).toBeUndefined();
		expect(openParenInAnchorDisplay.allows).toBeUndefined();
	});

	it('a field holding both shapes is repaired by each in its own place', () => {
		const A = '<a class="refLink" href="/x.1" data-ref="x 1">';
		const both = def(`${SPLIT} — ${A}(y</a>)`);
		const close = toseftaCloseParen.apply(both);
		const open = openParenInAnchorDisplay.apply(both);
		expect(close.records).toHaveLength(1);
		expect(open.records).toHaveLength(1);
		expect(definitionOf(close.entry)).toContain(`${A}(y</a>)`);
		expect(definitionOf(open.entry)).toContain('XVII), 6</a>');
	});
});

/**
 * The third row, SHIPPED — and the tripwire that guarded it, flipped.
 *
 * CORRECTED 2026-08-27 (fix/link-target-gate-cases). This block was
 * titled `tosefta-variant-chapter-halakha-loss (blocked)` and held one
 * test, `case 4 refuses the halakha recombination`, kept green ON THE
 * REFUSAL "so that the day `link-target.ts` is widened by a ruling,
 * this test FAILS and whoever made the ruling is sent straight here".
 *
 * The day came, the test failed, and this is whoever made the ruling
 * arriving. It is FLIPPED rather than deleted, and it is flipped into
 * a PAIR, because two separate things are worth holding:
 *
 * - Case 4 still refuses the `recombined` phrasing, word for word. The
 *   original assertion is intact below. Nothing about case 4 was
 *   loosened to make room for case 7, and a future widening of case 4
 *   would still break a test right here.
 * - Case 7 licenses the `corroborated` phrasing of the same repair. The
 *   two claims describe the same bytes and differ only in what
 *   provenance they assert, which is exactly the point: the repair was
 *   never the problem, the DECLARATION available for it was.
 */
/** `SPLIT` with the primary's two attributes repaired: the bytes case 4
 * refuses and case 7 licenses, and the ones the declarer allowlist
 * decides who may write. Shared by both blocks below so all three
 * questions are asked of one repair. */
const REPAIRED = SPLIT.replace(
	'Tosefta_Shabbat.16"',
	'Tosefta_Shabbat.16.6"',
).replace('data-ref="Tosefta Shabbat 16"', 'data-ref="Tosefta Shabbat 16:6"');

/** One case-7 claim, shaped by the result contract rather than
 * inferred, so a change to the declaration is a type error here. */
type Corroborate = NonNullable<TransformResult['corroborated']>[number];

/** The corroboration `toseftaPrimaryHalakha` declares for that repair,
 * witness included: the VARIANT anchor, cited by its field's bytes and
 * its opening-tag token index. */
const CORROBORATION: Corroborate = {
	field: SPLIT,
	from: 'Tosefta Shabbat 17:6',
	head: 'Tosefta Shabbat 16',
	open: VARIANT_OPEN,
	tail: ':6',
	target: 'Tosefta Shabbat 16:6',
};

/** The real gate over the repaired pair: one claim, declared by one
 * rule id, the way `run.ts` presents them. */
const gate = (claim: Corroborate, ruleId: string): string[] =>
	checkLinkTargets(
		def(SPLIT),
		def(REPAIRED),
		{ corroborated: [claim] },
		ruleId,
	);

describe('tosefta-variant-chapter-halakha-loss (shipped)', () => {
	it('case 4 still refuses the halakha recombination', () => {
		expect(
			checkLinkTargets(def(SPLIT), def(REPAIRED), {
				recombined: [
					{
						head: 'Tosefta Shabbat 16',
						tail: 'Tosefta Shabbat 17:6',
						target: 'Tosefta Shabbat 16:6',
					},
				],
			}),
		).toEqual([
			'recombined "Tosefta Shabbat 16:6" is not a prefix of "Tosefta Shabbat 16" joined to a suffix of "Tosefta Shabbat 17:6"',
		]);
	});

	it('case 7 licenses the same repair, declared as a corroboration', () => {
		expect(gate(CORROBORATION, toseftaPrimaryHalakha.id)).toEqual([]);
	});

	// The witness is the VARIANT anchor, and naming the other one is a
	// refusal rather than a technicality: the primary's display
	// (`Tosef. Sabb. XVI`) does not carry the address the claim copies
	// its tail from, so the anchor cited cannot be the one that
	// corroborated anything. Added 2026-08-27 with the witness itself.
	it('case 7 refuses the same repair citing the primary anchor', () => {
		expect(
			gate(
				{ ...CORROBORATION, open: openOf(SPLIT, 0) },
				toseftaPrimaryHalakha.id,
			),
		).toEqual([
			'corroborated "Tosefta Shabbat 16:6" cites an anchor that does not carry "Tosefta Shabbat 17:6"',
		]);
	});
});

/**
 * …AND THE LICENCE IS ONLY THIS RULE'S. Ruled 2026-08-27 (Brian), on a
 * review finding that "nothing else declares case 7 today" describes a
 * registry rather than a gate: the case is bound to an allowlist of
 * declaring rule ids (`CORROBORATION_DECLARERS` in `link-target.ts`),
 * and the identical claim from any other id is refused.
 *
 * The pair below is the point — same entry, same bytes, same claim,
 * same witness, and the only difference is who declared it. The second
 * name is this module's own neighbour, which is the rule most likely to
 * reach for the case next and the one this test exists to stop.
 */
describe('case 7’s declarer allowlist', () => {
	it('licenses the mint for the rule on the list', () => {
		expect(gate(CORROBORATION, toseftaPrimaryHalakha.id)).toEqual([]);
	});

	it('refuses the same claim declared by another rule', () => {
		expect(gate(CORROBORATION, 'anchor-swallows-close-paren')).toEqual([
			`corroborated "Tosefta Shabbat 16:6" is declared by "anchor-swallows-close-paren", which case 7's declarer allowlist does not admit`,
		]);
	});
});

describe('toseftaPrimaryHalakha', () => {
	it('writes the variant’s halakha onto the primary, both attributes', () => {
		const out = toseftaPrimaryHalakha.apply(def(SPLIT));
		expect(definitionOf(out.entry)).toBe(
			SPLIT.replace('Tosefta_Shabbat.16"', 'Tosefta_Shabbat.16.6"').replace(
				'data-ref="Tosefta Shabbat 16"',
				'data-ref="Tosefta Shabbat 16:6"',
			),
		);
		expect(out.records).toHaveLength(1);
	});

	// The rule's output must clear the REAL gate, not a fixture of one.
	// This is the assertion that would have caught the deferral from the
	// other side, and it is why the rule declares at all. The id is
	// passed the way `run.ts` passes it — case 7 reads it against its
	// declarer allowlist, and withholding it here would fail.
	it('its own output passes the real link-target gate', () => {
		const src = def(SPLIT);
		const out = toseftaPrimaryHalakha.apply(src);
		expect(
			checkLinkTargets(src, out.entry, out, toseftaPrimaryHalakha.id),
		).toEqual([]);
	});

	// WITHHOLD THE DECLARATION AND THE REFUSAL COMES BACK. Case 7 is a
	// licence attached to a CLAIM, so the pass above must be
	// attributable to what the rule declared rather than to the gate
	// having gone quiet about minted targets in general.
	it('the same output is a fabrication when the claim is withheld', () => {
		const src = def(SPLIT);
		const out = toseftaPrimaryHalakha.apply(src);
		expect(checkLinkTargets(src, out.entry, {})).toEqual([
			`target "Tosefta Shabbat 16:6" is not in A00196's input`,
		]);
	});

	it('declares one corroboration, naming both targets and the witness', () => {
		const out = toseftaPrimaryHalakha.apply(def(SPLIT));
		expect(out.corroborated).toEqual([
			{
				field: SPLIT,
				from: 'Tosefta Shabbat 17:6',
				head: 'Tosefta Shabbat 16',
				open: VARIANT_OPEN,
				tail: ':6',
				target: 'Tosefta Shabbat 16:6',
			},
		]);
		// …and the anchor those two members name is the variant: the one
		// carrying `from`, and the one whose display prints the halakha.
		const cited = anchors(tokenize(SPLIT)).find(
			(anchor) => anchor.open === VARIANT_OPEN,
		);
		expect(cited?.dataRef).toBe('Tosefta Shabbat 17:6');
		expect(cited?.display).toBe('XVII), 6');
	});

	// The 111 pairs whose primary ALREADY carries a halakha are a
	// different row with a different repair — the primary disagrees with
	// print rather than lacking a number — and this rule must not touch
	// them. Condition 1 of `halakhaRepair`.
	it('declines a primary that already carries a halakha', () => {
		const already = def(SPLIT.replaceAll('Shabbat 16"', 'Shabbat 16:2"'));
		expect(toseftaPrimaryHalakha.apply(already).entry).toBe(already);
	});

	// Condition 3, and the rule's own statement of case 7's two-witness
	// warrant: print and the address must say the same thing. The gate
	// alone would license this — `7` is in the display of an anchor
	// carrying `from` — so the refusal is the RULE's, not the gate's,
	// which is the division of labour the module docstring argues for.
	it('declines a variant whose printed halakha contradicts its ref', () => {
		const disagrees = def(SPLIT.replace('XVII), 6', 'XVII), 7'));
		expect(toseftaPrimaryHalakha.apply(disagrees).entry).toBe(disagrees);
	});

	// Condition 2. A pair naming two different works is a different
	// citation, not a recension variant.
	it('declines a pair naming two different works', () => {
		const other = def(
			SPLIT.replaceAll('Tosefta_Shabbat.17', 'Tosefta_Eiruvin.17').replaceAll(
				'Tosefta Shabbat 17',
				'Tosefta Eiruvin 17',
			),
		);
		expect(toseftaPrimaryHalakha.apply(other).entry).toBe(other);
	});

	// Condition 4. An href that does not end where the halakha is
	// appended would be handed a suffix belonging nowhere, and the gate
	// would REFUSE the result — which, since `run.ts` throws on a gate
	// problem, halts the migration rather than skipping an entry.
	it('declines a primary whose href does not end in its chapter', () => {
		const odd = def(
			SPLIT.replace('/Tosefta_Shabbat.16', '/Tosefta_Shabbat.16a'),
		);
		expect(toseftaPrimaryHalakha.apply(odd).entry).toBe(odd);
	});

	it('declines a variant with no preceding anchor', () => {
		const orphan = def(`Tosef. Sabb. (${VARIANT}XVII), 6</a>`);
		expect(toseftaPrimaryHalakha.apply(orphan).entry).toBe(orphan);
	});

	it('repairs both pairs when one field holds two', () => {
		const out = toseftaPrimaryHalakha.apply(def(`${SPLIT} and ${SPLIT}`));
		expect(out.records).toHaveLength(2);
		expect(out.corroborated).toHaveLength(2);
	});

	it('recurses into nested senses', () => {
		const nested: SourceEntry = {
			content: { senses: [{ senses: [{ definition: SPLIT }] }] },
			headword: 'h',
			rid: 'A00196',
		};
		const out = toseftaPrimaryHalakha.apply(nested);
		expect(out.records).toHaveLength(1);
		expect(out.entry.content.senses[0]?.senses?.[0]?.definition).toContain(
			'data-ref="Tosefta Shabbat 16:6"',
		);
	});

	it('moves no text and no anchor', () => {
		const out = toseftaPrimaryHalakha.apply(def(SPLIT));
		const anchorsOf = (html: string): number => anchors(tokenize(html)).length;
		expect(anchorsOf(definitionOf(out.entry) ?? '')).toBe(anchorsOf(SPLIT));
		expect(out.unlinks).toBeUndefined();
		expect(toseftaPrimaryHalakha.allows).toBeUndefined();
	});

	it('treats the entry as immutable', () => {
		const src = frozen(SPLIT);
		expect(() => toseftaPrimaryHalakha.apply(src)).not.toThrow();
		expect(definitionOf(src)).toBe(SPLIT);
	});
});

/**
 * THE ORDER, demonstrated rather than only asserted in
 * `registry.order.test.ts`. Running `toseftaCloseParen` first destroys
 * `VARIANT_DISPLAY`'s match and the halakha rule then repairs NOTHING,
 * silently — no throw, no record, an entry returned by reference. This
 * is the failure the registry comment describes, reproduced in two
 * lines so nobody has to take it on trust.
 */
describe('the two tosefta rules do not commute', () => {
	it('halakha-first repairs both halves', () => {
		const first = toseftaPrimaryHalakha.apply(def(SPLIT));
		expect(first.records).toHaveLength(1);
		const second = toseftaCloseParen.apply(first.entry);
		expect(second.records).toHaveLength(1);
		expect(definitionOf(second.entry)).toContain(
			'data-ref="Tosefta Shabbat 16:6"',
		);
		expect(definitionOf(second.entry)).toContain('XVII</a>), 6');
	});

	it('close-paren-first silently repairs only one', () => {
		const first = toseftaCloseParen.apply(def(SPLIT));
		expect(first.records).toHaveLength(1);
		const second = toseftaPrimaryHalakha.apply(first.entry);
		// No throw, no record, the same object back — the "green
		// everywhere, nothing done" shape.
		expect(second.entry).toBe(first.entry);
		expect(second.records).toEqual([]);
		expect(definitionOf(second.entry)).toContain(
			'data-ref="Tosefta Shabbat 16"',
		);
	});
});
