import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { checkMarkup, damageOf } from './markup.ts';

function entry(definition: string, headword = 'x'): SourceEntry {
	return { content: { senses: [{ definition }] }, headword, rid: 'A00001' };
}

/** D00478's real shape: an unterminated `href` swallows the `</a>` that
 * should have closed the anchor, so the attribute's tail — `data-ref`
 * and all — tokenizes as document text. The still-pending catalogue row
 * `unterminated-href-swallows-closing-tag` exists to repair this; until
 * it lands, the damage must survive every other rule untouched. */
const D00478 =
	'Mekh. I. c., v. <a dir="rtl" class="refLink" ' +
	'href="/Jastrow,_כָּלוּל.1</a>" data-ref="Jastrow, כָּלוּל 1">כָּלוּל</a>. tail דָּבָר here.';

/** J00597 carries the same defect in a harsher position: the malformed
 * tag is followed immediately by another tag rather than by the
 * attribute's tail, so the unterminated value runs on past it. */
const J00597 =
	'(cmp. <a dir="rtl" class="refLink" href="/Jastrow,_דִּלְדֵּל.1</a>' +
	'<a class="refLink" href="/Bava_Metzia.38b">B. Mets. 38ᵇ</a> ' +
	'<span dir="rtl">היוֹרֵד</span> he who takes possession.';

describe('damageOf', () => {
	it('reports nothing for well-formed markup', () => {
		expect(damageOf('a <span dir="rtl">שלום</span> <i>b</i>')).toEqual({
			attribute: 0,
			closes: 0,
			opens: 0,
		});
	});

	it('counts an unmatched open and an unmatched close', () => {
		expect(damageOf('<i>a').opens).toBe(1);
		expect(damageOf('a</i>').closes).toBe(1);
	});

	it('counts no attribute damage in the corpus D00478 shape', () => {
		// The swallowed `</a>` ends the tag token and the attribute's real
		// tail closes on its own `>`, so nothing is written inside it.
		expect(damageOf(D00478).attribute).toBe(0);
	});
});

describe('checkMarkup', () => {
	it('passes a rule that only wraps existing text', () => {
		expect(
			checkMarkup(entry('a שלום b'), entry('a <span dir="rtl">שלום</span> b')),
		).toEqual([]);
	});

	it('passes a rule that only unwraps', () => {
		expect(
			checkMarkup(entry('a <span dir="rtl">שלום</span> b'), entry('a שלום b')),
		).toEqual([]);
	});

	// Probe 1 of the four the final review ran against `checkNoNewText`,
	// all four of which it returned `[]` for. `stripTags` uses the same
	// tokenizer, so a span written INSIDE an attribute value is stripped
	// as a tag and the text multiset never moves. This is the D00478
	// defect this branch found and fixed by hand.
	it('catches a tag injected inside an attribute value', () => {
		const corrupted = D00478.replace(
			'data-ref="Jastrow, כָּלוּל 1"',
			'data-ref="Jastrow, <span dir="rtl">כָּלוּל</span> 1"',
		);
		const problems = checkMarkup(entry(D00478), entry(corrupted));
		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('inside an attribute value');
	});

	// Probe 2. `checkNoNewText` is a SUB-multiset check, so a deletion of
	// any kind reads as legitimate — including the deletion of a tag that
	// was holding the document together.
	it('catches a deleted closing tag', () => {
		const problems = checkMarkup(
			entry('a <span dir="rtl">שלום</span> b'),
			entry('a <span dir="rtl">שלום b'),
		);
		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('unmatched opening tag');
	});

	it('catches a deleted opening tag', () => {
		const problems = checkMarkup(entry('a <i>g</i> b'), entry('a g</i> b'));
		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('unmatched closing tag');
	});

	// Probes 3 and 4 are text RELOCATION, not markup damage, and this
	// gate does not claim them — spec §5 records the residue explicitly
	// rather than implying coverage it does not have. Frozen here so the
	// blind spot is a documented, tested fact rather than a surprise.
	it('does NOT catch two senses swapping definitions', () => {
		const before: SourceEntry = {
			content: { senses: [{ definition: 'first' }, { definition: 'second' }] },
			headword: 'x',
			rid: 'A00001',
		};
		const after: SourceEntry = {
			content: { senses: [{ definition: 'second' }, { definition: 'first' }] },
			headword: 'x',
			rid: 'A00001',
		};
		expect(checkMarkup(before, after)).toEqual([]);
	});

	it('does NOT catch text moved out of the headword', () => {
		expect(checkMarkup(entry('b', 'ab'), entry('ab', 'b'))).toEqual([]);
	});

	// The gate is a DELTA: pre-existing damage must pass, or every rule
	// that so much as touches these two entries fails, and the row that
	// exists to REPAIR them could never run at all.
	it('passes pre-existing damage that a rule left alone', () => {
		const touched = D00478.replace(
			'tail דָּבָר here',
			'tail <span dir="rtl">דָּבָר</span> here',
		);
		expect(checkMarkup(entry(D00478), entry(touched))).toEqual([]);
		// J00597's other fields are ordinary and unaffected by the damage
		// sitting in this one.
		expect(checkMarkup(entry('a', J00597), entry('b', J00597))).toEqual([]);
	});

	// Not a false positive: J00597's malformed tag never recovers — no
	// later text token supplies the `>` that would end the attribute — so
	// on the tokenizer's own reading the whole remainder of that field is
	// attribute interior, exactly as a browser would read it (the
	// unterminated `href` swallows on to the next quote). Writing markup
	// in there is the D00478 defect, one entry over. The constraint lifts
	// when `unterminated-href-swallows-closing-tag` repairs the tag.
	it('flags markup added after an unrecovered malformed tag', () => {
		const j = J00597.replace('he who', '<i>he who</i>');
		expect(checkMarkup(entry(J00597), entry(j))).toHaveLength(1);
	});

	it('passes a rule that repairs pre-existing damage', () => {
		const repaired = D00478.replace('.1</a>"', '.1"');
		expect(checkMarkup(entry(D00478), entry(repaired))).toEqual([]);
	});

	it('falls back to entry totals when the field count changes', () => {
		const before = entry('a <i>g</i> b');
		const after: SourceEntry = {
			content: { senses: [{ definition: 'a <i>g' }, { definition: 'b' }] },
			headword: 'x',
			rid: 'A00001',
		};
		expect(checkMarkup(before, after)).toHaveLength(1);
	});
});
