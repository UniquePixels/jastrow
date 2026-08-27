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
import {
	openParenInAnchorDisplay,
	toseftaCloseParen,
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
 * The blocked third row, pinned rather than shipped.
 *
 * `tosefta-variant-chapter-halakha-loss` would carry the variant's own
 * halakha onto the primary through spec §3.2 case 4. The gate refuses
 * it, and this test is the proof — kept green ON THE REFUSAL so that
 * the day `link-target.ts` is widened by a ruling, this test FAILS and
 * whoever made the ruling is sent straight here.
 */
describe('tosefta-variant-chapter-halakha-loss (blocked)', () => {
	it('case 4 refuses the halakha recombination', () => {
		const src = def(SPLIT);
		const after = def(
			SPLIT.replace('Tosefta_Shabbat.16"', 'Tosefta_Shabbat.16.6"').replace(
				'data-ref="Tosefta Shabbat 16"',
				'data-ref="Tosefta Shabbat 16:6"',
			),
		);
		expect(
			checkLinkTargets(src, after, {
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
});
