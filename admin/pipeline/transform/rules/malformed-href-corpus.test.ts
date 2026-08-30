/**
 * `unterminatedHref` over the whole corpus (batch-4 task 5; gate case 6
 * added 2026-08-27 by `fix/link-target-gate-cases`).
 *
 * Split from `malformed-href.test.ts` on the house pattern
 * (`italic-paren-corpus.test.ts`, `paren-boundary-corpus.test.ts` and
 * the rest): the fixture tier there is cheap and runs on hand-sliced
 * bytes, this one reads all 32,512 entries and is about the two real
 * entries the row names.
 *
 * It pins the population by RID IDENTITY, not by size — a count alone
 * would let a widened predicate swap one member for another and pass —
 * and pins `checkLinkTargets`'s verdict on both entries, which is a
 * MEASUREMENT and not an aspiration.
 *
 * CORRECTED 2026-08-27 (fix/link-target-gate-cases): that last clause
 * read "D00478's repair is not licensed by any of the gate's five
 * cases", and this tier pinned the refusal message. It was written to
 * BREAK the day the gate widened, and it did. The gate now has a sixth
 * case, the rule declares `restored`, and the tier pins the licence —
 * plus the refusal that returns when the declaration is withheld.
 */
import { beforeAll, describe, expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { tokenize } from '../html.ts';
import { checkLinkTargets } from '../link-target.ts';
import { anchors } from '../links.ts';
import { checkMarkup } from '../markup.ts';
import { checkNoNewText, fieldsOf } from '../no-new-text.ts';
import { sourceEntries } from './corpus-fixture.ts';
import { unterminatedHref } from './malformed-href.ts';

/** Every offset at which re-inserting `run` into `tag` reproduces a
 * byte-exact substring of `fields` — link-target case 6's clause 2,
 * recomputed here so the corpus MEASUREMENT is visible rather than
 * inferred from a gate verdict. Clause 3 requires this to hold exactly
 * once. */
function offsetsIn(
	fields: readonly string[],
	tag: string,
	run: string,
): number[] {
	const found: number[] = [];
	for (let at = 0; at <= tag.length; at++) {
		const candidate = `${tag.slice(0, at)}${run}${tag.slice(at)}`;
		if (fields.some((field) => field.includes(candidate))) {
			found.push(at);
		}
	}
	return found;
}

/** The tag of the first anchor pointing into Jastrow itself — the one
 * both entries' damage sits in. */
function jastrowTag(entry: SourceEntry): string {
	return (
		fieldsOf(entry)
			.flatMap((field) => anchors(tokenize(field)))
			.map((anchor) => anchor.tag)
			.find((tag) => tag.includes('/Jastrow,_')) ?? ''
	);
}

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
		for (const entry of await sourceEntries()) {
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

	// MEASURED, and FLIPPED on 2026-08-27 (fix/link-target-gate-cases)
	// rather than deleted. It read `… on J00597 but not on D00478` and
	// pinned `target "Jastrow, כָּלוּל 1" is not in D00478's input`
	// deliberately, so that widening the gate would break a test and
	// send whoever widened it back to `malformed-href.ts`'s docstring.
	// It did exactly that; the docstring now carries the retraction.
	// J00597 is licensed by case 1/2 (its intact twin puts both
	// spellings in the parsed target set) and declares nothing; D00478
	// by case 6, on the `restored` pair the rule declares.
	it('is licensed by the link-target gate on both entries', () => {
		const verdict = new Map<string, string[]>();
		for (const rid of BOTH) {
			const entry = captured(rid);
			const result = unterminatedHref.apply(entry);
			verdict.set(entry.rid, checkLinkTargets(entry, result.entry, result));
		}
		expect(verdict.get('J00597')).toEqual([]);
		expect(verdict.get('D00478')).toEqual([]);
	});

	// The claim, and the licence ATTRIBUTED to it — which the assertion
	// above cannot do on its own, since an empty problem list is also
	// what a gate that had gone quiet returns. The declared pair is the
	// swallowed `</a>` and the opening tag the rule actually emitted
	// (clause 1's key, matched on `anchor.tag`); withholding it and
	// changing nothing else reinstates the exact refusal this tier used
	// to pin.
	it('D00478’s licence is the claim, and goes with it', () => {
		const entry = captured('D00478');
		const result = unterminatedHref.apply(entry);
		const emitted = fieldsOf(result.entry)
			.flatMap((f) => anchors(tokenize(f)))
			.map((a) => a.tag);
		const claim = result.restored?.[0];
		expect(result.restored).toHaveLength(1);
		expect(claim?.removed).toBe('</a>');
		expect(claim?.written).toBe(
			'<a dir="rtl" class="refLink" href="/Jastrow,_כָּלוּל.1" data-ref="Jastrow, כָּלוּל 1">',
		);
		expect(emitted).toContain(claim?.written ?? '');
		// Clause 3's measurement, spelled out: ONE offset, and it is 54.
		expect(offsetsIn(fieldsOf(entry), claim?.written ?? '', '</a>')).toEqual([
			54,
		]);
		// CLAUSE 4's witness, measured the same way rather than restated
		// from the rule: the cited field is one of THIS entry's own, and
		// the bytes clause 2 recovers sit at the cited offset in it —
		// nowhere else in that field, and not in any other field.
		const recovered = `${claim?.written.slice(0, 54)}</a>${claim?.written.slice(54)}`;
		expect(fieldsOf(entry)).toContain(claim?.field ?? '');
		expect(claim?.field.indexOf(recovered)).toBe(claim?.offset);
		expect(
			fieldsOf(entry).filter((field) => field.includes(recovered)),
		).toEqual([claim?.field ?? '']);
		// `restored` OMITTED, not set to `undefined`:
		// `exactOptionalPropertyTypes` distinguishes the two, and the
		// undeclared case is the absent key.
		const { restored: _withheld, ...silent } = result;
		expect(checkLinkTargets(entry, result.entry, silent)).toEqual([
			`target "Jastrow, כָּלוּל 1" is not in D00478's input`,
		]);
		// The WITNESS carries its own share of the licence. The same
		// claim, one byte along the same field, is refused — so clause 4
		// is doing work on the real entry and not only on fixtures.
		const moved =
			claim === undefined ? [] : [{ ...claim, offset: claim.offset + 1 }];
		expect(
			checkLinkTargets(entry, result.entry, { ...result, restored: moved }),
		).toEqual([
			`restored "Jastrow, כָּלוּל 1" re-inserting "</a>" is not at offset ${(claim?.offset ?? 0) + 1} of the cited field in D00478`,
		]);
	});

	// J00597's arm RECONSTRUCTS rather than relocates — it writes a
	// witness `data-ref` the damaged tag never held — so case 6 is false
	// of it and the rule must not claim it. `checkLinkTargets` cannot be
	// asked here: cases 1 and 2 settle both of J00597's values first (the
	// twin puts them in the parsed target set), so a false claim on this
	// entry would be inert rather than reported — the module doc's
	// "Unused claims" blind spot, met in the wild. Clause 2 is measured
	// directly instead.
	it('J00597 declares nothing, and clause 2 would not license it', () => {
		const entry = captured('J00597');
		const result = unterminatedHref.apply(entry);
		expect(result.restored).toBeUndefined();
		const written = jastrowTag(result.entry);
		expect(written).not.toBe('');
		expect(offsetsIn(fieldsOf(entry), written, '</a>')).toEqual([]);
	});
});
