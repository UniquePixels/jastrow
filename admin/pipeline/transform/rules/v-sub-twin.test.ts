/**
 * `vSubRedirectTwin` and link-target gate case 8, FIXTURE TIER. The
 * corpus tier lives in `v-sub-twin.corpus.test.ts`, and the split is
 * not cosmetic here: **the two halves check different things and
 * neither is sufficient alone** (spec
 * `docs/specs/2026-08-31-link-target-gate-case-8.md` §5).
 *
 * This file checks the gate's five CLAUSES — that each refuses when
 * violated, and that the allowlist refuses on the licence rather than
 * on a clause. It cannot check that any headword exists, because the
 * gate cannot; that is the corpus file's whole job.
 *
 * Every claim below is deliberately well-formed except in the one
 * respect under test. A fixture that fails two clauses at once would
 * pass this file while proving nothing about the clause it names.
 */
import { describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { checkLinkTargets } from '../link-target.ts';
import type { TransformResult } from '../types.ts';
import { TWINS, vSubRedirectTwin } from './v-sub-twin.ts';

const RULE_ID = 'v-sub-redirect-stub-mislink';

/** The N00217 repair, which every fixture here is a variation on:
 * `נִדּוּי`'s stub points at `נִדְבַּךְ I` and should point at its own
 * plene twin `נִידּוּי`. */
const HOST = 'נִדּוּי';
const DISPLAY = 'נִידּ׳';
const TWIN = 'נִידּוּי';
const WAS = 'Jastrow, נִדְבַּךְ I 1';
const TARGET = `Jastrow, ${TWIN} 1`;

/** An anchor as the corpus spells one: `dir` on the `<a>`, display as
 * bare inner text. */
function anchorWith(target: string, display: string): string {
	const href = `/Jastrow,_${target.replace(/^Jastrow,\s*/u, '').replace(/\s+(\d+)$/u, '')}.1`;
	return `<a dir="rtl" class="refLink" href="${href}" data-ref="${target}">${display}</a>`;
}

function stubWith(
	target: string,
	display: string,
	headword: string,
): SourceEntry {
	return {
		content: {
			senses: [{ definition: `, v. sub ${anchorWith(target, display)}.` }],
		},
		headword,
		rid: 'N00217',
	} as SourceEntry;
}

/** The gate's verdict on a hand-built claim against a hand-built
 * before/after pair — the shape every clause test uses. */
function verdict(
	claim: Partial<{
		display: string;
		headword: string;
		rid: string;
		target: string;
	}>,
	options: { host?: string; ruleId?: string | undefined } = {},
): string[] {
	const host = options.host ?? HOST;
	const target = claim.target ?? TARGET;
	const before = stubWith(WAS, DISPLAY, host);
	// The written anchor carries the CLAIM's target, because claims are
	// matched to anchors by `target === anchor.dataRef`. Building `after`
	// from the constant instead would leave every altered-target fixture
	// unmatched, and it would fail on the fabrication fallback rather
	// than on the clause under test — passing while proving nothing.
	const after = stubWith(target, DISPLAY, host);
	const result: Pick<TransformResult, 'vouched'> = {
		vouched: [
			{
				display: claim.display ?? DISPLAY,
				headword: claim.headword ?? TWIN,
				rid: claim.rid ?? 'N00624',
				target,
			},
		],
	};
	return checkLinkTargets(
		before,
		after,
		result,
		'ruleId' in options ? options.ruleId : RULE_ID,
	);
}

describe('vSubRedirectTwin', () => {
	it('retargets the stub at the host spelling twin', () => {
		const out = vSubRedirectTwin.apply(stubWith(WAS, DISPLAY, HOST));
		expect(out.records).toHaveLength(1);
		expect(out.entry.content.senses[0]?.definition).toContain(
			`data-ref="${TARGET}"`,
		);
		expect(out.entry.content.senses[0]?.definition).toContain(
			`href="/Jastrow,_${TWIN}.1"`,
		);
	});

	it('declares a vouch naming the twin entry', () => {
		const out = vSubRedirectTwin.apply(stubWith(WAS, DISPLAY, HOST));
		expect(out.vouched).toEqual([
			{ display: DISPLAY, headword: TWIN, rid: 'N00624', target: TARGET },
		]);
	});

	it('leaves an entry it does not name untouched, by reference', () => {
		const other = stubWith(WAS, DISPLAY, HOST);
		const stranger = { ...other, rid: 'Z99999' } as SourceEntry;
		const out = vSubRedirectTwin.apply(stranger);
		expect(out.entry).toBe(stranger);
		expect(out.records).toHaveLength(0);
	});

	it('FAILS CLOSED when the expected target is not there exactly once', () => {
		const doubled = {
			content: {
				senses: [
					{
						definition: `, v. sub ${anchorWith(WAS, DISPLAY)} ${anchorWith(WAS, DISPLAY)}.`,
					},
				],
			},
			headword: HOST,
			rid: 'N00217',
		} as SourceEntry;
		const out = vSubRedirectTwin.apply(doubled);
		expect(out.entry).toBe(doubled);
		expect(out.records).toHaveLength(0);
	});

	it('is registered under the id the catalogue row carries', () => {
		expect(vSubRedirectTwin.id).toBe(RULE_ID);
		expect(vSubRedirectTwin.phase).toBe('text-repairs');
	});

	it('holds 50 rows, each with a distinct host', () => {
		expect(TWINS).toHaveLength(50);
		expect(new Set(TWINS.map(([rid]) => rid)).size).toBe(50);
	});
});

describe('link-target case 8', () => {
	it('licenses the honest claim', () => {
		expect(verdict({})).toEqual([]);
	});

	it('clause 1 — refuses a target that does not name the headword', () => {
		const [problem] = verdict({ headword: 'נִידּוּיָא' });
		expect(problem).toContain('does not name');
	});

	it('clause 2 — refuses a display that is not a geresh abbreviation', () => {
		const [problem] = verdict({ display: 'נִידּ' });
		expect(problem).toContain('not a geresh abbreviation');
	});

	it('clause 2 — refuses an abbreviation the headword does not begin with', () => {
		const [problem] = verdict({ display: 'קִבּ׳' });
		expect(problem).toContain('does not abbreviate');
	});

	it('clause 3 — refuses a headword that is not a twin of the host', () => {
		const [problem] = verdict({}, { host: 'קִבּוּץ' });
		expect(problem).toContain('not a spelling twin');
	});

	it('clause 4 — refuses a display the input never held', () => {
		// `נִי׳` clears clause 2 — its skeleton IS a prefix of `נידוי` —
		// so this fixture reaches clause 4 and no earlier one, which is
		// what makes it a test of clause 4 rather than of clause 2.
		const [problem] = verdict({ display: 'נִי׳' });
		expect(problem).toContain('input does not hold');
	});

	it('clause 5 — refuses an unlisted rule ON THE LICENCE, not a clause', () => {
		const [problem] = verdict({}, { ruleId: 'some-other-row' });
		expect(problem).toContain('not licensed for case 8');
		expect(problem).not.toContain('does not abbreviate');
		expect(problem).not.toContain('spelling twin');
	});

	it('clause 5 — refuses an unnamed rule too', () => {
		const [problem] = verdict({}, { ruleId: undefined });
		expect(problem).toContain('not licensed for case 8');
	});

	it('CLAUSE 3 IS WHAT HOLDS THE RESIDUE — clause 2 alone would not', () => {
		// `נִידּוּי` and `נִידּוּנָא` both begin with the abbreviated
		// consonants, so clause 2 admits both. Only the first is a twin
		// of `נִדּוּי`, and that is the whole of the narrowing.
		expect(verdict({})).toEqual([]);
		const [problem] = verdict({
			headword: 'נִידּוּנָא',
			target: 'Jastrow, נִידּוּנָא 1',
		});
		expect(problem).toContain('not a spelling twin');
	});

	it('final forms fold, or an honest abbreviation would be refused', () => {
		// `עוּלֵימ׳` abbreviates `עוּלֵים`: medial mem in the stub,
		// final mem in the headword. Without the fold clause 2 scores
		// this correct pair a mismatch.
		const before = stubWith('Jastrow, עוּלָם 1', 'עוּלֵימ׳', 'עוּלֵם');
		const after = stubWith('Jastrow, עוּלֵים 1', 'עוּלֵימ׳', 'עוּלֵם');
		expect(
			checkLinkTargets(
				before,
				after,
				{
					vouched: [
						{
							display: 'עוּלֵימ׳',
							headword: 'עוּלֵים',
							rid: 'P00266',
							target: 'Jastrow, עוּלֵים 1',
						},
					],
				},
				RULE_ID,
			),
		).toEqual([]);
	});
});
