/**
 * The nested-anchor duplicate-layer pair, fixture tier and corpus
 * tier.
 *
 * The fixture tier is hand-written rather than rid-loaded, unlike
 * `gershayim.test.ts`: what is being tested here is a STRUCTURAL
 * predicate (one anchor strictly inside another, sharing a target)
 * plus a byte-exact removal, and every property that matters — the
 * nesting, the shared target, the trapped mark, the two-pairs-in-one-
 * field re-derive, the refusal on an unclosed outer — is expressible
 * in a literal without appealing to the author's memory of the data.
 * The corpus tier below is what pins the predicate to the real
 * population, and it asserts the trapped-mark census as well as the
 * counts, so a predicate that hit the right total by trapping the
 * wrong text still fails.
 */
import { describe, expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry } from '../../body/types.ts';
import { tokenize } from '../html.ts';
import { anchors } from '../links.ts';
import { fieldsOf } from '../no-new-text.ts';
import { applyTransforms } from '../run.ts';
import {
	dupAnchorLanguageRef,
	nestedAnchorDuplicate,
} from './nested-anchor.ts';

const A =
	'<a dir="rtl" class="refLink" href="/Jastrow,_x.1" data-ref="Jastrow, x 1">';

const withLangRef = (html: string): SourceEntry => ({
	content: { senses: [] },
	headword: 'h',
	language_reference: html,
	rid: 'L1',
});
const withDef = (html: string): SourceEntry => ({
	content: { senses: [{ definition: html }] },
	headword: 'h',
	rid: 'D1',
});

/** Every anchor in every field `fieldsOf` walks — the same view
 * `checkLinkTargets` reconciles `unlinks` against. */
function anchorCount(entry: SourceEntry): number {
	return fieldsOf(entry).reduce(
		(total, field) => total + anchors(tokenize(field)).length,
		0,
	);
}

describe('dupAnchorLanguageRef', () => {
	it('drops the outer layer and keeps the trapped mark', () => {
		const out = dupAnchorLanguageRef.apply(
			withLangRef(`${A}${A}word</a>)</a>`),
		);
		expect(out.entry.language_reference).toBe(`${A}word</a>)`);
		expect(out.records).toHaveLength(1);
		expect(out.records[0]?.detail).toBe(')');
		expect(out.unlinks).toBe(1);
	});

	it('leaves a nested pair with different hrefs alone', () => {
		const other = A.replace('_x.1', '_y.1');
		const input = withLangRef(`${A}${other}word</a>)</a>`);
		const out = dupAnchorLanguageRef.apply(input);
		expect(out.entry).toBe(input);
		expect(out.records).toEqual([]);
	});

	it('leaves two SIBLING anchors sharing an href alone', () => {
		const input = withLangRef(`${A}one</a> and ${A}two</a>`);
		expect(dupAnchorLanguageRef.apply(input).entry).toBe(input);
	});

	it('does not touch a definition', () => {
		const input = withDef(`${A}${A}word</a>.</a>`);
		expect(dupAnchorLanguageRef.apply(input).entry).toBe(input);
	});

	it('refuses an unclosed outer anchor', () => {
		const input = withLangRef(`${A}${A}word</a>)`);
		expect(dupAnchorLanguageRef.apply(input).entry).toBe(input);
	});

	it('declares no allowed codepoints', () => {
		expect(dupAnchorLanguageRef.allows).toBeUndefined();
	});
});

describe('nestedAnchorDuplicate', () => {
	it('drops the outer layer, keeping the trapped period', () => {
		const out = nestedAnchorDuplicate.apply(withDef(`${A}${A}word</a>.</a>`));
		expect(out.entry.content.senses[0]?.definition).toBe(`${A}word</a>.`);
		expect(out.records[0]?.detail).toBe('.');
		expect(out.unlinks).toBe(1);
	});

	it('handles the JT shape, which traps nothing', () => {
		const jt =
			'<a class="refLink" href="Jerusalem_Talmud_Peah.1" data-ref="Jerusalem Talmud Peah 1">';
		const out = nestedAnchorDuplicate.apply(
			withDef(`lead ${jt}${jt}Y. Peah I</a></a> tail`),
		);
		expect(out.entry.content.senses[0]?.definition).toBe(
			`lead ${jt}Y. Peah I</a> tail`,
		);
		expect(out.records).toHaveLength(1);
		expect(out.records[0]?.detail).toBe('');
	});

	it('re-derives after each edit, so two pairs in one field both go', () => {
		const out = nestedAnchorDuplicate.apply(
			withDef(`${A}${A}a</a>.</a> and ${A}${A}b</a>.</a>`),
		);
		expect(out.entry.content.senses[0]?.definition).toBe(
			`${A}a</a>. and ${A}b</a>.`,
		);
		expect(out.records).toHaveLength(2);
		expect(out.unlinks).toBe(2);
	});

	it('reaches a NESTED sense, not only the top level', () => {
		const input: SourceEntry = {
			content: { senses: [{ senses: [{ definition: `${A}${A}w</a>.</a>` }] }] },
			headword: 'h',
			rid: 'D2',
		};
		const out = nestedAnchorDuplicate.apply(input);
		expect(out.entry.content.senses[0]?.senses?.[0]?.definition).toBe(
			`${A}w</a>.`,
		);
		expect(out.records).toHaveLength(1);
	});

	it('does not touch a language_reference', () => {
		const input = withLangRef(`${A}${A}word</a>)</a>`);
		expect(nestedAnchorDuplicate.apply(input).entry).toBe(input);
	});

	it('refuses an unclosed outer anchor', () => {
		const input = withDef(`${A}${A}word</a>.`);
		expect(nestedAnchorDuplicate.apply(input).entry).toBe(input);
	});

	it('declares no allowed codepoints', () => {
		expect(nestedAnchorDuplicate.allows).toBeUndefined();
	});
});

/**
 * The two rows re-measured on the pinned snapshot, with the trapped
 * text carried on each record so the census is read straight off them.
 *
 * A mismatch here is a FINDING, not a test to relax — see the
 * catalogue reasons on both rows, which are themselves the product of
 * one such re-measurement.
 */
describe('corpus tier', () => {
	it('reproduces both rows and loses no trapped text', async () => {
		let langOcc = 0;
		let defOcc = 0;
		const langEnt = new Set<string>();
		const defEnt = new Set<string>();
		const langTrapped = new Map<string, number>();
		const defTrapped = new Map<string, number>();
		const jt = new Set<string>();
		// Entries whose anchor count moved by anything other than the
		// number of layers the rule says it removed. Accumulated and
		// asserted once at the end rather than expected per entry, so a
		// failure names every offender instead of only the first.
		const miscounted: string[] = [];
		for await (const entry of readSourceEntries()) {
			const before = anchorCount(entry);
			const a = dupAnchorLanguageRef.apply(entry);
			if (a.records.length > 0) {
				langOcc += a.records.length;
				langEnt.add(entry.rid);
			}
			if (anchorCount(a.entry) !== before - a.records.length) {
				miscounted.push(`${entry.rid} (language_reference)`);
			}
			for (const r of a.records) {
				langTrapped.set(r.detail, (langTrapped.get(r.detail) ?? 0) + 1);
			}
			const b = nestedAnchorDuplicate.apply(entry);
			if (b.records.length > 0) {
				defOcc += b.records.length;
				defEnt.add(entry.rid);
			}
			if (anchorCount(b.entry) !== before - b.records.length) {
				miscounted.push(`${entry.rid} (definition)`);
			}
			for (const r of b.records) {
				defTrapped.set(r.detail, (defTrapped.get(r.detail) ?? 0) + 1);
				if (r.detail === '') {
					jt.add(entry.rid);
				}
			}
		}
		// Neither rule may change an entry's anchor count by more than
		// the layers it removed — the property `unlinks` declares to
		// `checkLinkTargets`, measured here on every entry rather than
		// only on the ones the gate test below re-runs.
		expect(miscounted).toEqual([]);
		expect(langOcc).toBe(755);
		expect(langEnt.size).toBe(755);
		expect(defOcc).toBe(475);
		expect(defEnt.size).toBe(465);
		expect(Object.fromEntries(langTrapped)).toEqual({
			')': 702,
			'.': 52,
			',': 1,
		});
		expect(Object.fromEntries(defTrapped)).toEqual({
			'': 20,
			')': 68,
			'.': 387,
		});
		// The `jt-double-wrapped-citation` row's 10 entries, which this
		// rule owns and which register no rule of their own.
		// DISJOINT, measured not assumed: no entry is a member of both
		// rows. 755 + 465 = 1,220 reproduces `nonsense-dup-anchor`'s
		// PRE-RE-SCOPE catalogued figure to the digit, which is the
		// audit's decomposition (1,220 = 755 language_reference + 465
		// sense-side) confirmed from the opposite direction.
		expect([...langEnt].filter((rid) => defEnt.has(rid))).toEqual([]);
		expect([...jt].sort()).toEqual([
			'A00722',
			'C01048',
			'J00603',
			'K00021',
			'K01007',
			'M01214',
			'N00255',
			'P01456',
			'S00534',
			'U00888',
		]);
	}, 300_000);

	/**
	 * Every entry either rule touches, run through `applyTransforms` so
	 * all three gates judge the real output — the text sub-multiset, the
	 * markup delta, and `checkLinkTargets`, which is the one that
	 * reconciles the removed anchor against `unlinks` and would fail on
	 * an undeclared removal in either direction.
	 */
	it('passes all three gates on every entry either rule touches', async () => {
		let gated = 0;
		for await (const entry of readSourceEntries()) {
			if (
				dupAnchorLanguageRef.apply(entry).records.length === 0 &&
				nestedAnchorDuplicate.apply(entry).records.length === 0
			) {
				continue;
			}
			applyTransforms(entry, 'text-repairs', [
				dupAnchorLanguageRef,
				nestedAnchorDuplicate,
			]);
			gated++;
		}
		// The union of the two disjoint populations: 755 + 465.
		expect(gated).toBe(1220);
	}, 300_000);
});
