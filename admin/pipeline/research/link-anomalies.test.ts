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

/** A citation anchor: an anchor whose `data-ref` points OUT of the
 * dictionary, so the headword rules never judge it. */
function citation(ref: string, display: string): string {
	return `<a class="refLink" href="/x" data-ref="${ref}">${display}</a>`;
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
		// Wording only: the detail counts entries rather than deduped
		// headwords since 2026-09-04. Here the two agree — three
		// headwords, three entries, no homograph among them.
		expect(hint?.detail).toContain('3 entries');
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

describe('abbrev-mislink v. sub redirect carve-out (2.3)', () => {
	/** H01354's shape: the host is the defective spelling, the stub
	 * abbreviates the plene one, and `v-sub-redirect-stub-mislink`
	 * sends it to the plene twin. Linking away from the host is the
	 * repair, not a mislink. */
	const HOST = 'חִסּוּלָא';
	const TWIN = 'חִיסּוּלָא';
	const ABBREV = 'חִיסּ׳';

	function stub(lead: string): SourceEntry {
		return entry('H01354', `${lead} ${anchor(TWIN, ABBREV)}.`, HOST);
	}

	const idx = index([HOST, TWIN]);

	/** `[name, text before the anchor, whether the hint fires]`.
	 * One-line tuples rather than a body per case, per
	 * [[feedback_sonar_duplication_tables]] — five `it` blocks
	 * differing only in a string and a negation is 43% duplication on
	 * SonarCloud's 3% gate. */
	const CASES: readonly (readonly [string, string, boolean])[] = [
		['fires when no v. sub precedes the anchor', ', cmp.', true],
		['ignores a v. sub redirect (H01354 post-repair)', ', v. sub', false],
		[
			'ignores the `v. sub.` spelling (O00878, 5 of the 50)',
			', v. sub.',
			false,
		],
		['reads the phrase across wide whitespace gaps', ', v.\n\tsub \n ', false],
		['still fires on a bare `sub` with no `v.`', ', sub', true],
		['still fires when `v.` only ends a longer word', ', adv. sub', true],
	];

	// The rows expecting `true` are what keep the carve-out rows from
	// being vacuous: with the phrase absent or half-present, the same
	// markup MUST still fire. Lose them and the `false` rows stop
	// meaning anything, so the table is held to carrying both.
	it('the table tests both verdicts, not just the carve-out', () => {
		expect(new Set(CASES.map(([, , fires]) => fires))).toEqual(
			new Set([true, false]),
		);
	});

	for (const [name, lead, fires] of CASES) {
		it(name, () => {
			const hints = entryAnomalyHints(stub(lead), new Map(), idx);
			expect(kinds(hints).includes('abbrev-mislink')).toBe(fires);
		});
	}
});

describe('attested-variant carve-out (residue calibration 2026-09-04)', () => {
	// sweep-v5 §class 11 licenses "an attested variant recorded in the
	// target's `alt_headwords`", but no rule consulted the field, so
	// `one-consonant-diverge` fired hints the prompt then told the
	// sweep to reject — the calibration's most repeated rejection
	// (A00892, A00520 among others).
	it('does not flag an unvocalized display recorded in the target alt_headwords', () => {
		const olyar = entry('A00671', 'bath attendant', 'אוֹלְיָאר', {
			alt_headwords: ['אוֹלְיָיר'],
		});
		const hints = entryAnomalyHints(
			entry('A00892', `v. ${anchor('אוֹלְיָאר', 'אוֹלְיָיר')}`, 'אולירין'),
			new Map(),
			index(['אולירין'], [olyar]),
		);
		expect(kinds(hints)).not.toContain('one-consonant-diverge');
	});

	it('strips the editorial parens and asterisk off a recorded alt', () => {
		const gamam = entry('G00100', 'to cut', 'גְּמַם', {
			alt_headwords: ['*(גומ)'],
		});
		const hints = entryAnomalyHints(
			entry('A00307', `cmp. ${anchor('גְּמַם', 'גומ')}`, 'אגם'),
			new Map(),
			index(['אגם'], [gamam]),
		);
		expect(kinds(hints)).not.toContain('one-consonant-diverge');
	});

	// The guard that matters. `אַבָּא I` really does record `אָב` in
	// alt_headwords while `אָב I` is its own entry, so a carve-out
	// applied to exactHint would silence the rule's named control.
	// Measured: it dropped exact-headword-diverge 338 -> 34.
	it('never applies the carve-out to a display that is itself a headword', () => {
		const abba = entry('A00017', 'father', 'אַבָּא I', {
			alt_headwords: ['אָב'],
		});
		const hints = entryAnomalyHints(
			entry('A00988', `v. ${anchor('אַבָּא I', 'אָב')}`, 'אָח'),
			new Map(),
			index(['אָב', 'אָח'], [abba]),
		);
		expect(kinds(hints)).toContain('exact-headword-diverge');
	});
});

describe('niqqud-twin owner count (residue calibration 2026-09-04)', () => {
	// The detail said "carried by 2 headwords" for a skeleton five
	// entries share, because bySkeleton dedupes after stripping the
	// homograph suffix. Homographs are exactly what the display cannot
	// choose between, so the number understated the ambiguity it exists
	// to report.
	const family = [
		entry('A00001', 'light', 'אוֹר I'),
		entry('A00002', 'fire', 'אוֹר II'),
		entry('A00003', 'stable', 'אוּר'),
	];

	it('counts every entry on the skeleton, homographs included', () => {
		const hints = entryAnomalyHints(
			entry('A00520', `v. ${anchor('אוּר', 'אור')}`, 'אוירא'),
			new Map(),
			index(['אוירא'], family),
		);
		const twin = hints.find((h) => h.kind === 'niqqud-twin-target');
		expect(twin?.detail).toContain('3 entries');
		expect(twin?.detail).toContain('אוֹר II');
	});

	it('still does not fire where one vocalized headword owns the skeleton', () => {
		const hints = entryAnomalyHints(
			entry('A00521', `v. ${anchor('אוֹר I', 'אור')}`, 'אוירא'),
			new Map(),
			index(['אוירא'], [family[0], family[1]] as SourceEntry[]),
		);
		expect(kinds(hints)).not.toContain('niqqud-twin-target');
	});
});

describe('attested-variant carve-out is skeleton-level (batch 01, 2026-09-04)', () => {
	// A00307/A00529: the recorded alt is stored vocalized and the
	// display is bare consonants, so exact string membership never
	// matched and the hint fired anyway — while sweep-v6's hint table
	// asserted the exclusion had already handled it.
	it('suppresses an unvocalized display of a vocalized recorded alt', () => {
		const gamam = entry('C01055', 'to cut off', 'גְּמַם', {
			alt_headwords: ['(גּוּם)'],
		});
		const hints = entryAnomalyHints(
			entry('A00307', `cmp. ${anchor('גְּמַם', 'גום')}`, 'אגם'),
			new Map(),
			index(['אגם'], [gamam]),
		);
		expect(kinds(hints)).not.toContain('one-consonant-diverge');
	});

	it('still flags a display the target records no form of', () => {
		const other = entry('C01056', 'unrelated', 'גְּמַם', {
			alt_headwords: ['זזז'],
		});
		const hints = entryAnomalyHints(
			entry('A00308', `cmp. ${anchor('גְּמַם', 'גום')}`, 'אגם'),
			new Map(),
			index(['אגם'], [other]),
		);
		expect(kinds(hints)).toContain('one-consonant-diverge');
	});
});

describe('inflection-escape-link consults the target (batch 02, 2026-09-04)', () => {
	// A00450/A00516: the hint says the target "matches neither the
	// headword nor the form" while the target records that very form in
	// its own plural_form and cross-refs back. A verifier measured the
	// kind's premise — a `Pl.` anchor targets a headword other than its
	// host in 1,021 of 1,349 cases corpus-wide — so escaping is the
	// norm, and the target's own forms have to be consulted.
	it('does not flag an escape to an entry that records the form', () => {
		const target = entry('A00451', 'a garment', 'אִדְרַבְלִיס', {
			plural_form: ['אִדְרַבְלִין'],
		});
		const hints = entryAnomalyHints(
			entry('A00450', `Pl. ${anchor('אִדְרַבְלִיס', 'אִדְרַבְלִין')}`, 'אִדְרַבְלָא', {
				plural_form: ['אִדְרַבְלִין'],
			}),
			new Map(),
			index(['אִדְרַבְלָא'], [target]),
		);
		expect(kinds(hints)).not.toContain('inflection-escape-link');
	});

	it('still flags an escape to an entry that records nothing of the kind', () => {
		const target = entry('A00302', 'unrelated', 'גְּלֵי');
		const hints = entryAnomalyHints(
			entry('A00301', `Pl. ${anchor('גְּלֵי', 'אִגְלֵי')}`, 'אִגְלָא', {
				plural_form: ['אִגְלֵי'],
			}),
			new Map(),
			index(['אִגְלָא'], [target]),
		);
		expect(kinds(hints)).toContain('inflection-escape-link');
	});
});

describe('formsOf is narrower than ownForms (batch 02 fix, 2026-09-04)', () => {
	// The first cut of the target-side check used `ownForms`, which
	// harvests binyan forms out of the target's senses. C00927 `גְּלֵי`
	// yields `אגל` that way — which is A00301 `אִגְלָא`'s own plural and
	// round 1's named catch. Suppressing on it silenced the control.
	it('still flags when the target carries the form only as a binyan', () => {
		const verb = entry(
			'C00927',
			`Af. ${anchor('גְּלֵי', 'אִגְלֵי')} to reveal`,
			'גְּלֵי',
			{ alt_headwords: ['גְּלָא'] },
		);
		const hints = entryAnomalyHints(
			entry('A00301', `Pl. ${anchor('גְּלֵי', 'אִגְלֵי')}`, 'אִגְלָא', {
				plural_form: ['אִגְלֵי'],
			}),
			new Map(),
			index(['אִגְלָא'], [verb]),
		);
		expect(kinds(hints)).toContain('inflection-escape-link');
	});
});

describe('own-form-escape-link (inflection residue adjudication, 2026-09-05)', () => {
	// Both adjudicators of the 20-entry sample arrived, independently
	// and unprompted, at one discriminator: does the TARGET record the
	// displayed form among its own headword / alt_headwords /
	// plural_form, matres kept? It sorted 19 of 20 where three
	// code-derived predicates had sorted none. docs/v2/phase-2-inflection-gap.md.

	it('fires when the target is an independent lemma (A00277 shape)', () => {
		// Host אֵגוֹר "heap, hill", Pl. אֵגוֹרִים stated in sense prose.
		// Target אֵגוֹרִי is its own lemma, "fit for storage", whose own
		// plural is אֵגוֹרִין — it does not record אֵגוֹרִים.
		const host = entry(
			'A00277',
			`a mound rises out of it.—Pl. אֵגוֹרִים ${anchor('אֵגוֹרִי', 'אֵגוֹרִים')}`,
			'אֵגוֹר',
		);
		const target = entry('A00282', 'fit for storage', 'אֵגוֹרִי', {
			plural_form: ['אֵגוֹרִין'],
		} as Partial<SourceEntry>);
		const hints = entryAnomalyHints(host, new Map(), index([], [host, target]));
		expect(kinds(hints)).toContain('own-form-escape-link');
	});

	it('stays silent when the target records the displayed form (H00109 shape)', () => {
		// Host חָבֵר, Pl. חֲבֵרוֹת. Target חֲבֵרָה is the feminine's own
		// stub and lists חֲבֵרוֹת among its alt_headwords — two entries
		// agreeing about a word, which is the legitimate shape.
		const host = entry(
			'H00109',
			`Fem. חֲבֵרָה.—Pl. חֲבֵרוֹת ${anchor('חֲבֵרָה', 'חֲבֵרוֹת')}`,
			'חָבֵר',
		);
		const target = entry('H00118', ', v. חָבֵר', 'חֲבֵרָה', {
			alt_headwords: ['חֲבֵרוֹת'],
		} as Partial<SourceEntry>);
		const hints = entryAnomalyHints(host, new Map(), index([], [host, target]));
		expect(kinds(hints)).not.toContain('own-form-escape-link');
	});

	it('reaches a form stated only in sense prose (A01023 shape)', () => {
		// 286 of the 362 residue anchors are this: the form appears as
		// `Part. pass. X` in the sense text and in no structured field,
		// so `ownForms` never sees it and every inflection rule is blind.
		const host = entry(
			'A01023',
			`Part. pass. אָחוּי united ${anchor('חוי', 'אָחוּי')}`,
			'אחי',
		);
		const target = entry('H00309', 'Pa. to show; to tell', 'חוי');
		const hints = entryAnomalyHints(host, new Map(), index([], [host, target]));
		expect(kinds(hints)).toContain('own-form-escape-link');
	});

	it('does not fire when the link stays inside the host entry', () => {
		const host = entry(
			'X00001',
			`—Pl. אֵגוֹרִים ${anchor('אֵגוֹר', 'אֵגוֹרִים')}`,
			'אֵגוֹר',
		);
		const hints = entryAnomalyHints(host, new Map(), index([], [host]));
		expect(kinds(hints)).not.toContain('own-form-escape-link');
	});

	// Batch 05 produced this rule's first out-of-sample reading — 30
	// hints, 28 real, 2 false positives — and BOTH false positives were
	// the redirect-stub exemption matched too narrowly. Each shape below
	// is one of them, verified against the corpus rather than against
	// the reporting agent's diagnosis: the sweep attributed B00443 to a
	// data-ref/display mismatch as well, and that half is inert, because
	// `baseHeadword` strips `I` and `II` identically.

	it('exempts a stub that cites its attestation before the `v.`', () => {
		// A03316 -> A00926. The stub's whole content is
		// `Targ. I Chr. I, 20, v. אַשְׁלָא` — it redirects straight home,
		// but the citation ahead of the `v.` defeated a lead pattern
		// that allowed only punctuation. Reciprocity is exact: the
		// host's own next clause quotes the same citation back.
		const host = entry(
			'A03316',
			`rope.—Pl. אַשְׁלַיָּא ${anchor('אוּשְׁלַיָּא', 'אַשְׁלַיָּא')}`,
			'אַשְׁלָא',
		);
		const stub = entry(
			'A00926',
			`${citation('Targum of I Chronicles 1:20', 'Targ. I Chr. I, 20')}, v. ${anchor('אַשְׁלָא', 'אַשְׁלָא')}`,
			'אוּשְׁלַיָּא',
		);
		const hints = entryAnomalyHints(host, new Map(), index([], [host, stub]));
		expect(kinds(hints)).not.toContain('own-form-escape-link');
	});

	it('exempts a stub whose host headword carries a stray comma', () => {
		// B00443 -> B00450. The stub redirects home and `redirect` holds
		// it; the comparison failed on the HOST side, because
		// `baseHeadword('בִּזְיוּנָא , II')` left the comma behind. Nine
		// of 32,512 headwords are written this way, all of them a
		// homograph run like `I, II`.
		const host = entry(
			'B00443',
			`slit.—Pl. בִּיזְיָינֵי ${anchor('בִּזְיָינֵי', 'בִּיזְיָינֵי')}`,
			'בִּזְיוּנָא , II',
			{ plural_form: ['בִּזֵיוּנֵי', 'בִּיזְיָינֵי'] } as Partial<SourceEntry>,
		);
		const stub = entry(
			'B00450',
			`, v. ${anchor('בִּזְיוּנָא I', 'בִּזְיוּנָא II')}`,
			'בִּזְיָינֵי',
		);
		const hints = entryAnomalyHints(host, new Map(), index([], [host, stub]));
		expect(kinds(hints)).not.toContain('own-form-escape-link');
	});

	it('still fires when the stub redirects to the etymon, not the host', () => {
		// B00138 -> B00137, the third shape batch 05 met and the one
		// DECLINED. The stub `, v. בְּדַח` sends the reader to the host's
		// own etymon rather than to the host, so the two entries have
		// not agreed about the word — the reader still does not land on
		// בְּדִיחָא. Widening the exemption to cover it would suppress a
		// live escalation on an argument nothing has adjudicated.
		const host = entry(
			'B00138',
			`(בדח) joy. Constr. ${anchor('בְּדִיחַ', 'בְּדִיחַת')}`,
			'בְּדִיחָא',
			{ plural_form: ['בְּדִיחַת'] } as Partial<SourceEntry>,
		);
		const stub = entry('B00137', `, v. ${anchor('בְּדַח', 'בְּדַח')}`, 'בְּדִיחַ');
		const hints = entryAnomalyHints(host, new Map(), index([], [host, stub]));
		expect(kinds(hints)).toContain('own-form-escape-link');
	});

	it('exempts a geresh-abbreviated display, where the test is known to fail', () => {
		// T00697, the sample's one discriminator failure: host רִיקּוּחַ
		// "perfume", Pl. רִיקּוּחִים abbreviated רִקּ׳ — and the WRONG
		// target רִיקּוּד "dancing" records רִקּ׳ among its own forms too,
		// so the orthographic test says "recorded" and is wrong. These
		// need a sense read; `abbrev-mislink` already judges the shape.
		const host = entry(
			'T00697',
			`perfume.—Pl. רִיקּוּחִים, רִקּ׳ ${anchor('רִיקּוּד', 'רִקּ׳')}`,
			'רִיקּוּחַ',
		);
		const target = entry('T00695', 'dancing', 'רִיקּוּד', {
			alt_headwords: ['רִקּ׳'],
		} as Partial<SourceEntry>);
		const hints = entryAnomalyHints(host, new Map(), index([], [host, target]));
		expect(kinds(hints)).not.toContain('own-form-escape-link');
	});
});
