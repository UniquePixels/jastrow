/**
 * Round-1 detector calibration (2026-08-18). Every case here is a real
 * corpus shape named in docs/v2/discovery-round-1.md §4.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../body/types.ts';
import { entryAnomalyHints } from './anomalies.ts';
import { buildHeadwordIndex, type HeadwordIndex } from './headword-index.ts';

/** Anchor markup in the corpus's shape. */
function anchor(target: string, display: string): string {
	return `<a class="refLink" href="/Jastrow,_${target}.1" data-ref="Jastrow, ${target}">${display}</a>`;
}

function entry(
	rid: string,
	definition: string,
	headword: string,
	extra: Partial<SourceEntry> = {},
): SourceEntry {
	return {
		content: { senses: [{ definition }] },
		headword,
		rid,
		...extra,
	} as SourceEntry;
}

/** Index over bare headwords plus, optionally, whole entries (which a
 * redirect-stub case needs, since the stub lives in the entry body). */
function index(
	headwords: string[],
	entries: SourceEntry[] = [],
): HeadwordIndex {
	return buildHeadwordIndex([
		...headwords.map((headword) => ({ headword }) as SourceEntry),
		...entries,
	]);
}

function kinds(hints: { kind: string }[]): string[] {
	return hints.map((h) => h.kind);
}

describe('redirect-stub retargets (letter P, lemma-variant-retarget)', () => {
	// C00926: display כָּסָה, whose own entry is the bare stub `, v. כסי`,
	// linked straight through to כסי. A correct resolution.
	const stub = entry('K00001', `, v. ${anchor('כסי', 'כסי')}`, 'כָּסָה');

	it('suppresses a display resolved through its own `, v. Y` stub', () => {
		const hints = entryAnomalyHints(
			entry('C00926', `cmp. ${anchor('כסי', 'כָּסָה')}`, 'גָּמַל'),
			new Map(),
			index(['גָּמַל', 'כסי'], [stub]),
		);
		expect(kinds(hints)).not.toContain('exact-headword-diverge');
	});

	it('still flags a stub headword linked somewhere other than its target', () => {
		const hints = entryAnomalyHints(
			entry('C00926', `cmp. ${anchor('אַבָּא', 'כָּסָה')}`, 'גָּמַל'),
			new Map(),
			index(['גָּמַל', 'כסי', 'אַבָּא'], [stub]),
		);
		expect(kinds(hints)).toContain('exact-headword-diverge');
	});

	it('does not treat a multi-anchor entry as a redirect stub', () => {
		const body = entry(
			'K00001',
			`a ${anchor('כסי', 'כסי')} and ${anchor('אַבָּא', 'אַבָּא')}`,
			'כָּסָה',
		);
		const hints = entryAnomalyHints(
			entry('C00926', `cmp. ${anchor('כסי', 'כָּסָה')}`, 'גָּמַל'),
			new Map(),
			index(['גָּמַל', 'כסי'], [body]),
		);
		expect(kinds(hints)).toContain('exact-headword-diverge');
	});
});

describe('geresh rule extended (letters C, J, P, I)', () => {
	it('flags a particle prefix + one-letter abbrev of the host (B01058)', () => {
		const hints = entryAnomalyHints(
			entry('B01058', `v. ${anchor('מַבַּע', 'מִבְ׳')}`, 'בְּעַע'),
			new Map(),
			index(['בְּעַע', 'מַבַּע']),
		);
		expect(kinds(hints)).toContain('abbrev-mislink');
	});

	it('leaves the generic unprefixed one-letter form alone (ר׳ = Rabbi)', () => {
		const hints = entryAnomalyHints(
			entry('A00018', `${anchor('רַב', 'ר׳')} said`, 'רָבָא'),
			new Map(),
			index(['רָבָא', 'רַב']),
		);
		expect(kinds(hints)).not.toContain('abbrev-mislink');
	});

	it('flags an abbreviation of the entry’s own inflected form (I00740)', () => {
		const hints = entryAnomalyHints(
			entry('I00740', `v. ${anchor('טַלִּית', 'טרכ׳')}`, 'טְרוֹקְסִימָא', {
				plural_form: ['טְרוֹכְסִימֵי'],
			}),
			new Map(),
			index(['טְרוֹקְסִימָא', 'טַלִּית']),
		);
		expect(kinds(hints)).toContain('abbrev-mislink');
	});

	it('accepts a headword abbreviation linked to the entry’s own inflection', () => {
		const hints = entryAnomalyHints(
			entry('I00740', `v. ${anchor('טְרוֹכְסִימֵי', 'טְרוֹ׳')}`, 'טְרוֹקְסִימָא', {
				plural_form: ['טְרוֹכְסִימֵי'],
			}),
			new Map(),
			index(['טְרוֹקְסִימָא', 'טְרוֹכְסִימֵי']),
		);
		expect(kinds(hints)).not.toContain('abbrev-mislink');
	});
});

describe('niqqud carve-out narrowed (letters J, O, Q, R)', () => {
	it('flags an own inflected form whose link leaves the entry (A00301)', () => {
		const hints = entryAnomalyHints(
			entry('A00301', `Pl. ${anchor('גְּלֵי', 'אִגְלֵי')}`, 'אִגְלָא', {
				plural_form: ['אִגְלֵי'],
			}),
			new Map(),
			index(['אִגְלָא', 'גְּלֵי', 'אִגְלֵי']),
		);
		expect(kinds(hints)).toContain('inflection-escape-link');
	});

	it('accepts an own plural linked to the entry that carries it', () => {
		const hints = entryAnomalyHints(
			entry('A00017', `Pl. ${anchor('אֲבָהָתָא', 'אֲבָהָתָא')}`, 'אַבָּא', {
				plural_form: ['אֲבָהָתָא'],
			}),
			new Map(),
			index(['אַבָּא', 'אֲבָהָתָא']),
		);
		expect(kinds(hints)).not.toContain('inflection-escape-link');
	});

	it('accepts the -ים/-ין plural alternation as free variation', () => {
		const hints = entryAnomalyHints(
			entry('A00154', `Pl. ${anchor('אֲבֵילִין', 'אֲבֵילִים')}`, 'אָבֵל', {
				plural_form: ['אֲבֵילִים'],
			}),
			new Map(),
			index(['אָבֵל', 'אֲבֵילִין']),
		);
		expect(kinds(hints)).not.toContain('inflection-escape-link');
	});
});

describe('unvocalized displays made reachable (letters L and I)', () => {
	it('flags a display one non-final consonant off its target (A00018)', () => {
		const hints = entryAnomalyHints(
			entry('A00018', `read ${anchor('אַבּוּן', 'אבין')}`, 'אַבָּא'),
			new Map(),
			index(['אַבָּא', 'אַבּוּן']),
		);
		expect(kinds(hints)).toContain('one-consonant-diverge');
	});

	it('ignores a final-consonant difference (the plural alternation)', () => {
		const hints = entryAnomalyHints(
			entry('A00018', `read ${anchor('גרדין', 'גרדים')}`, 'אַבָּא'),
			new Map(),
			index(['אַבָּא', 'גרדין']),
		);
		expect(kinds(hints)).not.toContain('one-consonant-diverge');
	});

	it('flags an unvocalized display collapsing a homograph family (A00645)', () => {
		const hints = entryAnomalyHints(
			entry('A00645', `v. ${anchor('אֲכַל', 'אכל')}`, 'אַגָּנָא'),
			new Map(),
			index(['אַגָּנָא', 'אָכַל', 'אֲכַל', 'אֹכֶל']),
		);
		const hint = hints.find((h) => h.kind === 'niqqud-twin-target');
		expect(hint?.detail).toContain('3 headwords');
	});

	it('leaves two-letter function words alone (לא, או, תו)', () => {
		const hints = entryAnomalyHints(
			entry('B01165', `v. ${anchor('אוֹ', 'או')}`, 'אַגָּנָא'),
			new Map(),
			index(['אַגָּנָא', 'אוֹ', 'אוּ']),
		);
		expect(kinds(hints)).not.toContain('niqqud-twin-target');
	});

	it('keeps firing on vocalized twins that are both headwords (A01201)', () => {
		const hints = entryAnomalyHints(
			entry('A01201', `v. ${anchor('זָמַר I', 'זְמַר I')}`, 'איזמר'),
			new Map(),
			index(['איזמר', 'זָמַר I', 'זְמַר I']),
		);
		expect(kinds(hints)).toContain('niqqud-twin-target');
	});
});

describe('roman-numeral-display parallel-chapter carve-out (2.2)', () => {
	/** A citation anchor into another corpus, the shape the Tosefta and
	 * Targum rows produce. */
	function cite(ref: string, display: string): string {
		return `<a class="refLink" href="/x" data-ref="${ref}">${display}</a>`;
	}

	it('ignores an anchor that is its own parenthesis (A00152 post-repair)', () => {
		const hints = entryAnomalyHints(
			entry(
				'A00152',
				`Tosef. Erub. III, 1 (${cite('Tosefta Eiruvin 4:1', 'IV')}), 1 ed. Zuck.`,
				'אגן',
			),
			new Map(),
			index(['אגן']),
		);
		expect(kinds(hints)).not.toContain('roman-numeral-display');
	});

	it('still fires on a recension numeral linked as a chapter (A01133)', () => {
		const hints = entryAnomalyHints(
			entry(
				'A01133',
				`Targ. Y. Gen. XIV, 2; ${cite('Targum Jonathan on Genesis 1:27', 'I')} a. e.`,
				'אדם',
			),
			new Map(),
			index(['אדם']),
		);
		expect(kinds(hints)).toContain('roman-numeral-display');
	});

	it('sees the open paren across a wide whitespace gap', () => {
		const hints = entryAnomalyHints(
			entry(
				'A00152',
				`Tosef. Erub. III, 1 (\n\t  ${cite('Tosefta Eiruvin 4:1', 'IV')}), 1`,
				'אגן',
			),
			new Map(),
			index(['אגן']),
		);
		expect(kinds(hints)).not.toContain('roman-numeral-display');
	});

	it('sees the close paren across a wide whitespace gap', () => {
		const hints = entryAnomalyHints(
			entry(
				'A00152',
				`Tosef. Erub. III, 1 (${cite('Tosefta Eiruvin 4:1', 'IV')} \n\t), 1`,
				'אגן',
			),
			new Map(),
			index(['אגן']),
		);
		expect(kinds(hints)).not.toContain('roman-numeral-display');
	});

	it('still fires when the parenthesis holds more than the anchor (A00717)', () => {
		const hints = entryAnomalyHints(
			entry(
				'A00717',
				`Tosef. Ab. Zar. III, 16 (${cite('Tosefta Avodah Zarah 4', 'IV')}, beg.) ed. Zuck.`,
				'אונו',
			),
			new Map(),
			index(['אונו']),
		);
		expect(kinds(hints)).toContain('roman-numeral-display');
	});
});
