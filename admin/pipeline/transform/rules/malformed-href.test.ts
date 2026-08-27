/**
 * Fixtures for `unterminatedHref` (batch-4 task 5).
 *
 * `D_BAD` and `J_BAD` are VERBATIM slices of
 * `data/source/jastrow-dictionary.jsonl` — extracted from the pinned
 * snapshot rather than retyped, because a fixture typed by hand tests
 * the typist and not the corpus. `J_BAD` deliberately runs from the
 * damaged tag through the intact twin the repair reads its
 * `data-ref` off, so the witness is part of the fixture rather than
 * an assumption about the entry; the near-verbatim duplicated passage
 * between the two is corpus reality and a different (declined)
 * catalogue row.
 *
 * The corpus tier below pins the population by RID IDENTITY, not by
 * size — a count alone would let a widened predicate swap one member
 * for another and pass — and pins `checkLinkTargets`'s verdict on
 * both real entries, which is a MEASUREMENT and not an aspiration:
 * D00478's repair is not licensed by any of the gate's five cases,
 * for the reason set out in `malformed-href.ts`'s docstring.
 */
import { beforeAll, describe, expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry } from '../../body/types.ts';
import { tokenize } from '../html.ts';
import { checkLinkTargets } from '../link-target.ts';
import { type Anchor, anchors } from '../links.ts';
import { checkMarkup } from '../markup.ts';
import { checkNoNewText, fieldsOf, textOf } from '../no-new-text.ts';
import { unterminatedHref } from './malformed-href.ts';

// Verbatim from D00478's sense definition.
const D_BAD =
	'<a class="refLink" href="/Mekhilta_d\'Rabbi_Yishmael.1" data-ref="Mekhilta d\'Rabbi Yishmael 1">Mekh. I. c., v. <a dir="rtl" class="refLink" href="/Jastrow,_כָּלוּל.1</a>" data-ref="Jastrow, כָּלוּל 1">כָּלוּל</a>.';

// Verbatim from J00597's sense definition.
const J_BAD =
	'(cmp. <a dir="rtl" class="refLink" href="/Jastrow,_דִּלְדֵּל.1</a><a class="refLink" href="/Bava_Metzia.38b" data-ref="Bava Metzia 38b">B. Mets. 38ᵇ</a> <span dir="rtl">היוֹרֵד לנ׳ שבוים</span> he who takes possession of the property of captives. <a class="refLink" href="/Tosefta_Ketubot.8.2" data-ref="Tosefta Ketubot 8:2">Tosef. Keth. VIII, 2</a>, sq.; a. fr.—י׳ מנכסיו <i>to be compelled to leave an estate, to become poor</i> (cmp. <a dir="rtl" class="refLink" href="/Jastrow,_דִּלְדֵּל.1" data-ref="Jastrow, דִּלְדֵּל 1">דִּלְדִּל</a>).';

const def = (html: string, rid: string): SourceEntry => ({
	content: { senses: [{ definition: html }] },
	headword: 'h',
	rid,
});

const out = (html: string, rid: string): string =>
	unterminatedHref.apply(def(html, rid)).entry.content.senses[0]?.definition ??
	'';

const found = (html: string): Anchor[] => anchors(tokenize(html));

const usable = (html: string): boolean =>
	found(html).every((a) => !(a.malformed || a.interior) && a.close !== -1);

/** Codepoints of a string, sorted — equal multisets mean the rewrite
 * only moved bytes around. */
const bag = (s: string): string[] => [...s].sort();

describe('unterminatedHref', () => {
	it('D00478: leaves no anchor malformed, interior or unclosed', () => {
		expect(usable(D_BAD)).toBe(false);
		expect(usable(out(D_BAD, 'D00478'))).toBe(true);
	});

	it('D00478: no href still carries a close tag', () => {
		expect(
			found(out(D_BAD, 'D00478')).some((a) => a.href.includes('</a>')),
		).toBe(false);
	});

	it('D00478: both targets become readable', () => {
		const refs = found(out(D_BAD, 'D00478')).map((a) => a.dataRef);
		expect(refs).toContain("Mekhilta d'Rabbi Yishmael 1");
		expect(refs).toContain('Jastrow, כָּלוּל 1');
	});

	it('D00478: the repair moves bytes and adds none', () => {
		expect(bag(out(D_BAD, 'D00478'))).toEqual(bag(D_BAD));
	});

	it('D00478: the enclosing anchor closes where its tag was taken from', () => {
		const mekh = found(out(D_BAD, 'D00478')).find((a) =>
			a.href.startsWith('/Mekhilta'),
		);
		expect(mekh?.display).toBe('Mekh. I. c., v. ');
	});

	it('J00597: every anchor in the fragment becomes usable', () => {
		expect(usable(J_BAD)).toBe(false);
		expect(usable(out(J_BAD, 'J00597'))).toBe(true);
	});

	it('J00597: the repaired anchor matches its intact twin', () => {
		const pair = found(out(J_BAD, 'J00597')).filter((a) =>
			a.href.startsWith('/Jastrow,_'),
		);
		expect(pair).toHaveLength(2);
		expect(pair[0]?.dataRef).toBe(pair[1]?.dataRef);
		expect(pair[0]?.dataRef).toBe('Jastrow, דִּלְדֵּל 1');
	});

	// The batch-4 brief expected the anchor COUNT to rise by one here.
	// It does not, and it must not: `anchors()` reports one Anchor per
	// opening `<a>` tag, and the absorbed `<a href="/Bava_Metzia.38b">`
	// is already a tag token today (`interior: true`, which is what the
	// repair clears). Restoring the markup adds a CLOSE tag, never an
	// open — and `checkLinkTargets` fails outright on
	// `anchor count grew`, so a rise would be a defect, not a goal.
	it('J00597: the anchor count holds and every interior anchor is freed', () => {
		const before = found(J_BAD);
		const after = found(out(J_BAD, 'J00597'));
		expect(after).toHaveLength(before.length);
		expect(before.filter((a) => a.interior).length).toBeGreaterThan(0);
		expect(after.filter((a) => a.interior)).toHaveLength(0);
	});

	it('J00597: the reconstructed markup adds no text', () => {
		const before = def(J_BAD, 'J00597');
		expect(textOf(unterminatedHref.apply(before).entry)).toBe(textOf(before));
	});

	it('leaves a sound anchor alone, by reference', () => {
		const sound = def(
			'<a class="refLink" href="/x.1" data-ref="x 1">x</a>',
			'A00001',
		);
		const result = unterminatedHref.apply(sound);
		expect(result.entry).toBe(sound);
		expect(result.records).toHaveLength(0);
	});

	it('declines a damaged tag with no witness and no surviving tail', () => {
		const orphan =
			'(cmp. <a dir="rtl" class="refLink" href="/Jastrow,_ז.1</a>' +
			'<a class="refLink" href="/Bava_Metzia.38b" data-ref="Bava Metzia 38b">B</a>';
		const entry = def(orphan, 'Z00001');
		expect(unterminatedHref.apply(entry).entry).toBe(entry);
	});

	it('declines a surviving tail with no anchor open to receive the close', () => {
		const stray =
			'<a dir="rtl" class="refLink" href="/Jastrow,_ז.1</a>" data-ref="Jastrow, ז 1">ז</a>';
		const entry = def(stray, 'Z00002');
		expect(unterminatedHref.apply(entry).entry).toBe(entry);
	});

	it('treats the entry as immutable', () => {
		const entry = def(D_BAD, 'D00478');
		Object.freeze(entry);
		Object.freeze(entry.content);
		Object.freeze(entry.content.senses);
		Object.freeze(entry.content.senses[0]);
		expect(() => unterminatedHref.apply(entry)).not.toThrow();
	});

	it('declares no allows, no copied, no unlinks and no target claim', () => {
		expect(unterminatedHref.allows).toBeUndefined();
		const result = unterminatedHref.apply(def(J_BAD, 'J00597'));
		expect(result.copied).toBeUndefined();
		expect(result.unlinks).toBeUndefined();
		expect(result.composed).toBeUndefined();
		expect(result.recombined).toBeUndefined();
		expect(result.glyphCorrected).toBeUndefined();
	});

	it('is registered under the catalogue row id', () => {
		expect(unterminatedHref.id).toBe('unterminated-href-swallows-closing-tag');
		expect(unterminatedHref.phase).toBe('text-repairs');
	});
});

/** The two entries every assertion in this tier is about. */
const BOTH = ['D00478', 'J00597'] as const;

describe('unterminatedHref over the corpus', () => {
	// ONE corpus walk, not four. Reading all 32,512 entries dominates
	// this tier's cost, and the walk that pins the population by identity
	// is already holding the two entries the other three assertions want,
	// so it keeps them. `Rule.apply` MUST treat `entry` as immutable
	// (`transform/types.ts`), so the captured references are still the
	// source bytes after the population walk has applied the rule to them.
	const fired: string[] = [];
	const kept = new Map<string, SourceEntry>();

	beforeAll(async () => {
		for await (const entry of readSourceEntries()) {
			if (unterminatedHref.apply(entry).records.length > 0) {
				fired.push(entry.rid);
			}
			if (entry.rid === BOTH[0] || entry.rid === BOTH[1]) {
				kept.set(entry.rid, entry);
			}
		}
	}, 600_000);

	/** Throws rather than returning `undefined`, so a capture that
	 * silently missed fails loudly instead of emptying a loop body and
	 * letting the assertions inside it pass vacuously. */
	const captured = (rid: string): SourceEntry => {
		const entry = kept.get(rid);
		if (entry === undefined) {
			throw new Error(`${rid} was never captured from the corpus`);
		}
		return entry;
	};

	it('fires on exactly D00478 and J00597, and on no other entry', () => {
		expect(fired.sort()).toEqual(['D00478', 'J00597']);
	});

	// Over EVERY field `fieldsOf` walks, not just the first definition:
	// a rewrite that landed somewhere else would otherwise go unseen.
	//
	// The `close === -1` residue is pinned by IDENTITY and is not a
	// shortfall of this rule. `/Shir_HaShirim_Rabbah.1` in J00597 has
	// no `</a>` anywhere in the source — it is one of the corpus's three
	// unclosed anchors and a different catalogue row. This rule
	// relocates a closing tag that EXISTS; minting one is not its job,
	// and the assertion says so out loud rather than quietly relaxing
	// to `<= 1`.
	it('clears both entries of malformed and interior anchors', () => {
		const unclosed = new Map<string, string[]>();
		for (const rid of BOTH) {
			const entry = captured(rid);
			const after = unterminatedHref.apply(entry).entry;
			const all = fieldsOf(after).flatMap((f) => anchors(tokenize(f)));
			for (const anchor of all) {
				expect(anchor.malformed).toBe(false);
				expect(anchor.interior).toBe(false);
			}
			unclosed.set(
				entry.rid,
				all.filter((a) => a.close === -1).map((a) => a.href),
			);
		}
		expect(unclosed.get('D00478')).toEqual([]);
		expect(unclosed.get('J00597')).toEqual(['/Shir_HaShirim_Rabbah.1']);
	});

	it('passes the text and markup gates on both entries with no allowance', () => {
		for (const rid of BOTH) {
			const entry = captured(rid);
			const result = unterminatedHref.apply(entry);
			expect(
				checkNoNewText(entry, result.entry, unterminatedHref, result.copied),
			).toEqual([]);
			expect(checkMarkup(entry, result.entry)).toEqual([]);
		}
	});

	// MEASURED, not aspirational. J00597's repair is licensed by case
	// 1/2 — its intact twin puts both spellings in the input's parsed
	// target set. D00478's is NOT licensed by any of the five cases:
	// the damaged tag parses to `href: ''` / `data-ref: ''`, so the
	// bytes that prove the repair are invisible to a gate that reads
	// PARSED targets. Closing that needs a new gate case, which is a
	// maintainer ruling. This test pins the gap so registration does
	// not discover it by throwing.
	it('is licensed by the link-target gate on J00597 but not on D00478', () => {
		const verdict = new Map<string, string[]>();
		for (const rid of BOTH) {
			const entry = captured(rid);
			const result = unterminatedHref.apply(entry);
			verdict.set(entry.rid, checkLinkTargets(entry, result.entry, result));
		}
		expect(verdict.get('J00597')).toEqual([]);
		expect(verdict.get('D00478')).toEqual([
			`target "Jastrow, כָּלוּל 1" is not in D00478's input`,
		]);
	});
});
