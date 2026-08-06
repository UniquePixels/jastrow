import { describe, expect, it } from 'bun:test';
import { walkSenses } from './census.ts';
import type { FormSectionParts } from './form-sections.ts';
import { joinFormSection, splitFormSection } from './form-sections.ts';
import { splitLettered } from './lettered.ts';
import { readSourceEntries } from './source.ts';
import type { SourceEntry } from './types.ts';

const PLURAL_FIXTURES = 'admin/pipeline/body/fixtures/plural.jsonl';
const FORM_SECTION_FIXTURES =
	'admin/pipeline/body/fixtures/form-sections.jsonl';

/** The 25 rids the design census's coarse `Pl.` detector flags (task
 * report): only these 5 carry a genuine, paren-clear ascending run and
 * actually split — the other 20 are single spurious `(citation N)`
 * matches (see form-sections.ts's header comment). */
const PLURAL_SPLIT_RIDS = ['A01047', 'B01292', 'C00062', 'D00194', 'E00789'];

/** The 9 rids fixtures/form-sections.jsonl carries (B12 extension,
 * maintainer print pass 2026-07-14): the 6 genuine `Part. pass.` splits,
 * the 1 genuine `Fem.` split, D00194 (whose run attributes to its
 * nearer `Pl.`, not its earlier `Fem.` — the nearest-marker-attribution
 * canary), and the 1 genuine `Denom.` split. Keyed by marker so the
 * fixture sweep can assert both which rids split and which marker each
 * one split under. */
const FORM_SECTION_SPLITS: Record<string, string> = {
	A02260: 'Part. pass.',
	A03348: 'Part. pass.',
	C00869: 'Part. pass.',
	C00964: 'Part. pass.',
	C01139: 'Part. pass.',
	D00194: 'Pl.',
	G00644: 'Fem.',
	H01022: 'Part. pass.',
	I00311: 'Denom.',
};

/** Every rid either fixture is expected to split — shared by the "no
 * collateral" sweep over every other fixture class. */
const ALL_EXPECTED_SPLIT_RIDS: string[] = [
	...new Set([...PLURAL_SPLIT_RIDS, ...Object.keys(FORM_SECTION_SPLITS)]),
];

async function loadFixtures(path: string): Promise<SourceEntry[]> {
	const entries: SourceEntry[] = [];
	for await (const entry of readSourceEntries(path)) {
		entries.push(entry);
	}
	return entries;
}

function findFixture(entries: SourceEntry[], rid: string): SourceEntry {
	const entry = entries.find((e) => e.rid === rid);
	if (entry === undefined) {
		throw new Error(`fixture missing: ${rid}`);
	}
	return entry;
}

/** Asserts a split happened and hands back the non-null parts, so
 * callers don't need an `if` guard around a follow-up `expect()`. */
function assertSplit(text: string): FormSectionParts {
	const parts = splitFormSection(text);
	if (parts === null) {
		throw new Error(`expected a split for: ${text}`);
	}
	return parts;
}

/** The text a definition presents to `splitFormSection` in the real
 * composition (design §3 order): after `lettered.ts`'s split, on its
 * resulting head — mirrors `dry-run.ts`'s `buildTextSense`. */
function formSectionInputHead(definition: string): string {
	const lettered = splitLettered(definition);
	return lettered ? lettered.head : definition;
}

interface SweepMismatch {
	detail: string;
	rid: string;
	senseIndex: number;
}

interface SweepResult {
	markersByRid: Record<string, string>;
	mismatches: SweepMismatch[];
	splitRids: string[];
}

/** Runs splitFormSection/joinFormSection over every sense in `entries`
 * (through the same lettered-head narrowing the real composition uses)
 * and reports, per rid + senseIndex, any split that didn't round-trip —
 * so a failure names the offending entry instead of just failing on the
 * first mismatch encountered. Mirrors lettered.test.ts's
 * `sweepFixtures`. Also records which marker split each rid, so a
 * fixture sweep can assert marker attribution (not just split/no-split). */
function sweepFixtures(entries: SourceEntry[]): SweepResult {
	const mismatches: SweepMismatch[] = [];
	const splitRids = new Set<string>();
	const markersByRid: Record<string, string> = {};
	for (const entry of entries) {
		let senseIndex = 0;
		for (const sense of walkSenses(entry.content.senses)) {
			const head = formSectionInputHead(sense.definition ?? '');
			const parts = splitFormSection(head);
			if (parts !== null) {
				splitRids.add(entry.rid);
				markersByRid[entry.rid] = parts.marker;
				const got = joinFormSection(parts);
				if (got !== head) {
					mismatches.push({ detail: got, rid: entry.rid, senseIndex });
				}
			}
			senseIndex++;
		}
	}
	return {
		markersByRid,
		mismatches,
		splitRids: [...splitRids].sort((a, b) => a.localeCompare(b)),
	};
}

describe('splitFormSection', () => {
	it('splits a C00062-shaped —Pl. block with a restarted 1)…2)…3) run', () => {
		const text =
			'<i>high age</i>, v. infra.—Pl. <span dir="rtl">גְּבוּרוֹת</span> 1) <i>manifestations of Divine power</i> (that we should call Him <a class="refLink" href="/x">גבור</a>)?—2) <i>second def</i>.—3) <i>third def</i>.';
		const parts = assertSplit(text);
		expect(parts.marker).toBe('Pl.');
		expect(parts.host).toBe('<i>high age</i>, v. infra.');
		expect(parts.intro).toBe('—Pl. <span dir="rtl">גְּבוּרוֹת</span> ');
		expect(parts.items.map((i) => i.label)).toEqual(['1', '2', '3']);
		expect(joinFormSection(parts)).toBe(text);
	});

	it('does not split plain Pl. prose with no numbered run', () => {
		expect(
			splitFormSection('a. fr.—Pl. אבות, no numbering here at all.'),
		).toBeNull();
	});

	it('does not split when only a 2) follows Pl. (run must start at 1)', () => {
		expect(
			splitFormSection(
				'a. fr.—Pl. אבות 2) second only, without an earlier item.',
			),
		).toBeNull();
	});

	it('does not count a digit run closing a real parenthetical citation', () => {
		// The exact shape that fooled the census's coarse detector on 20 of
		// its 25 candidates (task report): "(R. Joḥ. 1)" is a citation
		// (Lam. R. introd., R. Joḥanan §1), not a restarted-list marker —
		// the "1" closes a paren that opened before it, so paren balance is
		// nonzero right at the ")" and the marker is rejected.
		const text =
			'gravel, sand.—Pl. <span dir="rtl">חֲצָצֵי</span>. Lam. R. introd. (R. Joh. 1) you have to walk over rocks.';
		expect(splitFormSection(text)).toBeNull();
	});

	it('accepts a genuine single-item run (no 2) required)', () => {
		const text = 'sing.—Pl. formY 1) only sense.';
		const parts = assertSplit(text);
		expect(parts.items.map((i) => i.label)).toEqual(['1']);
	});

	it('round-trips through joinFormSection', () => {
		const text = 'host text.—Pl. form 1) first—2) second';
		const parts = assertSplit(text);
		expect(joinFormSection(parts)).toBe(text);
	});
});

describe('splitFormSection: non-Pl. markers (B12 extension)', () => {
	it('splits a —Part. pass. block (literal marker text)', () => {
		const text = 'host.—Part. pass. form 1) first sense—2) second sense';
		const parts = assertSplit(text);
		expect(parts.marker).toBe('Part. pass.');
		expect(parts.items.map((i) => i.label)).toEqual(['1', '2']);
		expect(joinFormSection(parts)).toBe(text);
	});

	it('splits a —Part. pass. block whose own closing tag interrupts the marker (C00869/H01022 shape: <i>Part. pass</i>.)', () => {
		// Jastrow's markup sometimes italicizes "Part. pass" as a unit and
		// closes the tag before the trailing period lands — so the literal
		// text is "…—<i>Part. pass</i>. form 1)…" rather than the plain
		// "Part. pass." string. buildAnchorPattern tolerates this — the
		// anchor itself starts at the literal "Part" (the leading `—?` only
		// matches a dash immediately before the marker text, so the `<i>`
		// sitting between the dash and "Part" here stays on the host, same
		// as the real corpus shape).
		const text =
			'host.—<i>Part. pass</i>. <span dir="rtl">form</span> 1) only sense.';
		const parts = assertSplit(text);
		expect(parts.marker).toBe('Part. pass.');
		expect(parts.host).toBe('host.—<i>');
		expect(parts.items.map((i) => i.label)).toEqual(['1']);
		expect(joinFormSection(parts)).toBe(text);
	});

	it('splits a —Fem. block', () => {
		const text = 'host.—Fem. form 1) only sense.';
		const parts = assertSplit(text);
		expect(parts.marker).toBe('Fem.');
		expect(joinFormSection(parts)).toBe(text);
	});

	it('splits a —Denom. block', () => {
		const text = 'host.—Denom. form 1) only sense.';
		const parts = assertSplit(text);
		expect(parts.marker).toBe('Denom.');
		expect(joinFormSection(parts)).toBe(text);
	});
});

describe('splitFormSection: nearest-marker attribution (D00194 shape)', () => {
	it('a later marker’s run is not stolen by an earlier marker', () => {
		// —Fem. opens first with no numbered run of its own, then —Pl.
		// opens and immediately carries the genuine 1)…2) run. Without
		// bounding each marker's search window to the next marker anchor,
		// Fem.'s unbounded forward scan would also "see" this run and
		// wrongly claim it — measured against D00194 (task report).
		const text =
			'host.—Fem. femForm aunt.—Pl. plForm 1) first sense—2) second sense';
		const parts = assertSplit(text);
		expect(parts.marker).toBe('Pl.');
		expect(parts.host).toBe('host.—Fem. femForm aunt.');
		expect(parts.items.map((i) => i.label)).toEqual(['1', '2']);
		expect(joinFormSection(parts)).toBe(text);
	});
});

describe('fixture sweep (fixtures/plural.jsonl)', () => {
	it('splits exactly the 5 measured Pl. rids; every hit round-trips; the other 20 stay whole', async () => {
		const entries = await loadFixtures(PLURAL_FIXTURES);
		expect(entries.length).toBe(25);

		const { mismatches, splitRids } = sweepFixtures(entries);
		expect(mismatches).toEqual([]);
		// Measured against the full 32,512-entry corpus (task report): the
		// design census's coarse detector flags 25 candidate entries, but
		// only these 5 carry a genuine paren-clear ascending run — see
		// form-sections.ts's header comment for why the other 20 are
		// excluded.
		expect(splitRids).toEqual(PLURAL_SPLIT_RIDS);
	});

	it("C00062's tail-of-sense-3 block splits into 1)/2)/3), print-verified", async () => {
		const entries = await loadFixtures(PLURAL_FIXTURES);
		const entry = findFixture(entries, 'C00062');
		const definition = entry.content.senses[1]?.definition ?? '';
		const head = formSectionInputHead(definition);
		const parts = assertSplit(head);
		expect(parts.items.map((i) => i.label)).toEqual(['1', '2', '3']);
		expect(joinFormSection(parts)).toBe(head);
	});
});

describe('fixture sweep (fixtures/form-sections.jsonl)', () => {
	it('splits exactly the 9 measured rids under the right marker; every hit round-trips', async () => {
		const entries = await loadFixtures(FORM_SECTION_FIXTURES);
		expect(entries.length).toBe(9);

		const { markersByRid, mismatches, splitRids } = sweepFixtures(entries);
		expect(mismatches).toEqual([]);
		expect(splitRids).toEqual(
			Object.keys(FORM_SECTION_SPLITS).sort((a, b) => a.localeCompare(b)),
		);
		expect(markersByRid).toEqual(FORM_SECTION_SPLITS);
	});
});

describe('no collateral: every other fixture class', () => {
	const OTHER_FIXTURES = [
		'baseline',
		'broken-sequences',
		'label-quarantines',
		'lettered',
		'numbering-extras',
		'origin-splits',
		'orphans',
		'quotes-stragglers',
		'stems',
		'units-hard',
	];

	for (const cls of OTHER_FIXTURES) {
		it(`${cls}.jsonl: splitFormSection never fires outside the measured set`, async () => {
			const entries = await loadFixtures(
				`admin/pipeline/body/fixtures/${cls}.jsonl`,
			);
			const { mismatches, splitRids } = sweepFixtures(entries);
			expect(mismatches).toEqual([]);
			// broken-sequences.jsonl happens to also carry C00062 (it's
			// fixtured there for its own top-level 1)/—3) sequence gap) —
			// the only rid, across every other fixture class, that this
			// module is expected to split.
			const unexpected = splitRids.filter(
				(rid) => !ALL_EXPECTED_SPLIT_RIDS.includes(rid),
			);
			expect(unexpected).toEqual([]);
		});
	}
});
