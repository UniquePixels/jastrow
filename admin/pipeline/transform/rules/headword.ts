/**
 * The headword-field family (spec
 * `docs/specs/2026-08-27-headword-field-integrity-design.md`).
 *
 * **THE FIRST BATCH WHOSE OBJECT IS A FIELD RATHER THAN MARKUP.** Every
 * rule here edits `headword`, `alt_headwords` or `content.morphology`,
 * none of which carries a tag anywhere in this corpus. So `markup.ts`
 * has no delta to compare and `link-target.ts` is never reached:
 * `no-new-text.ts` is the only gate with anything to say about these
 * rules, which is a narrower safety posture than batches 1-4 ran under
 * and is stated here rather than left to be discovered.
 *
 * **TWO OF THE FOUR LEFT ON 2026-09-21** with the headword-design §2
 * adoption. `parenthesized-alt-headword` deleted print's grouping
 * delimiters, which §2 keeps as structure in `display`; and
 * `phrase-alt-headword-stub` expanded a geresh-abbreviated alternate,
 * which §4's HW-no-expand row stops — an abbreviated alternate is now
 * kept as printed and marked `partial`. Neither had anywhere to put
 * what it was deleting; the line parser does. Their sub-shape
 * taxonomies and the seven-bucket evidence live on in
 * `docs/archive/transform-batch-5.md` and the decisions index.
 *
 * The rules live in ONE module because they share an OBJECT, not a
 * mechanism. The anchor-boundary rules split across four modules because the
 * mechanism determined which gate could see the change; here one gate
 * sees everything, and four modules would be four docstrings repeating
 * one context.
 */
import type { SourceEntry } from '../../types.ts';
import type { Rule, TransformResult } from '../types.ts';

// Hoisted per lint/performance/useTopLevelRegex. Neither carries `g`
// where it is handed to `.test()`; `lastIndex` on a shared literal
// would otherwise make the same input answer differently on alternate
// calls.
const GERESH = '׳';
const LEADING_STAR = /^\*/u;
const WHITESPACE_SPLIT = /\s+/u;

// ---------------------------------------------------------------- rule 1

/** Fused headwords some other entry's anchor points at by their OLD
 * string. Rewriting them would break a live link, so they are declined.
 * Asserted EXACTLY equal to the measured set in the corpus test — an
 * enumerated exception that is loud on drift, never a quiet skip. */
const LINKED_HEADWORDS: ReadonlySet<string> = new Set([
	'כִּדְ׳ כַּדְבוּבָא',
	'עָ׳ עַדְיָא',
]);

/**
 * `abbrev-fused-headword` — 7 corpus-wide, 4 repaired, 3 refused.
 *
 * Print sets a lemma and its abbreviated second form on one headword
 * line; the abbreviation was hoisted AHEAD of the lemma into `headword`
 * instead of into `alt_headwords`, so the field reads
 * `'מִי׳ מִנְטַר'` and sorts nowhere near where a reader would look. The
 * rule moves the abbreviation to `alt_headwords` and leaves the lemma —
 * and any homograph mark travelling with it, `'רִי׳ רִכְסָא I'` becoming
 * `'רִכְסָא I'` — as the headword.
 *
 * A PURE MOVE inside the entry. `fieldsOf` enumerates `headword` and
 * `alt_headwords` into one multiset, so nothing is invented and nothing
 * lost; the separating space is deleted, which only shrinks the
 * multiset. No `allows`, no `copied`.
 *
 * **THE ROW'S OWN `reason` IS FALSE FOR ONE OF ITS SEVEN, AND THAT ONE
 * IS REFUSED.** It claims *"In all 7, prev_hw/next_hw alphabetize by
 * the SECOND token, proving the abbreviation is prefix debris."*
 * `A02002` is `'*כְּפַר א׳ אָמוּס'`, sitting between `אֱמוּנָה` and
 * `אֲמוֹרָא` — it alphabetizes by `אָמוּס`, its THIRD token. Its shape is
 * not a hoisted abbreviation at all but the toponym *Kfar Ammus* with
 * its INTERIOR token stubbed: `phrase-alt-headword-stub`'s shape
 * appearing in the `headword` field. The predicate below requires the
 * geresh token to come FIRST, which refuses it by shape; the corpus
 * test asserts that shape selects exactly that rid.
 *
 * **TWO MORE ARE REFUSED BECAUSE ANOTHER ENTRY LINKS TO THEM,
 * AND THAT IS THIS RULE'S SHARPEST FINDING.** Rewriting a headword
 * silently invalidates every anchor whose `data-ref` names the OLD
 * string, and two do:
 *
 * ```
 * K00108 anchor  data-ref="Jastrow, כִּדְ׳ כַּדְבוּבָא 1"   → K00107
 * P00132 anchor  data-ref="Jastrow, עָ׳ עַדְיָא 1"       → P00137
 * ```
 *
 * Found by a corpus check (retired), whose absolute pin fell from
 * 71,385 to 71,383 while its DIFFERENTIAL assertion — "gains 90, loses
 * none" — stayed green, because the rule sits on both sides of that
 * comparison. The differential could not see it; the absolute pin
 * could, which is exactly why it exists.
 *
 * A dead link is worse for a reader than an awkward headword, so these
 * two are declined. The full repair is a headword rewrite AND a retarget
 * of the pointing anchor, which crosses into `link-target.ts` territory
 * and gate work is its own PR here. Carried as an open item.
 *
 * `LINKED_HEADWORDS` is an enumerated exception and therefore MUST BE
 * LOUD ON DRIFT, on the same loud-on-drift ruling `rules/unlink.ts`'s
 * `unobservedConvention` carries. A corpus test asserted it equalled
 * EXACTLY the fused
 * headwords some anchor targets, so a re-fetch that added or removed a
 * pointing anchor would have failed a test rather than silently
 * changing what shipped. It no longer runs; on a new export this is a
 * review-detector candidate (consolidation spec §10), listed in
 * `docs/v2/retired-corpus-checks.md`.
 *
 * **FORWARD HAZARD, and it compounds one the gershayim work recorded:**
 * the data architecture's §5 gate walks the `prev_hw`/`next_hw` chain
 * and compares against `headword` AS A STRING. The gershayim work left 68
 * entries diverging that way; this rule rewrites 4 more headwords and
 * leaves every neighbour's pointer untouched. Whoever writes
 * `migrate.ts` must walk the SOURCE chain or de-map both sides. The
 * exact divergence count was asserted by a corpus check retired in
 * a retired corpus check.
 */
const abbrevFusedHeadword: Rule = {
	apply: (entry: SourceEntry): TransformResult => {
		const trimmed = entry.headword.trim();
		if (LINKED_HEADWORDS.has(trimmed)) {
			return { entry, records: [] };
		}
		const star = trimmed.startsWith('*') ? '*' : '';
		const tokens = trimmed.replace(LEADING_STAR, '').split(WHITESPACE_SPLIT);
		const [first, ...rest] = tokens;
		if (
			first === undefined ||
			rest.length === 0 ||
			!first.includes(GERESH) ||
			rest.some((t) => t.includes(GERESH))
		) {
			return { entry, records: [] };
		}
		const headword = `${star}${rest.join(' ')}`;
		return {
			entry: {
				...entry,
				alt_headwords: [...(entry.alt_headwords ?? []), first],
				headword,
			},
			records: [
				{
					detail: `${entry.headword} → ${headword} + alt ${first}`,
					rid: entry.rid,
					ruleId: 'abbrev-fused-headword',
				},
			],
		};
	},
	id: 'abbrev-fused-headword',
	phase: 'text-repairs',
};

// ---------------------------------------------------------------- rule 2

/**
 * `gender-pair-headword-line-collapse` — 22 entries.
 *
 * Print reads `'X, Xָא m., Xְתָּא f.'`. The extractor stored the masculine
 * emphatic TWICE in `alt_headwords` and wrote the trailing feminine
 * label into `content.morphology`, so the entry is a masculine
 * adjective labelled `f.` with the `m.` lost. One operation covers both
 * sub-shapes — 17 adjacent duplicates and 5 `'abbrev, full, abbrev'`
 * repetitions at a distance — because it keys on the value, not the
 * position:
 *
 * ```
 * A00648  ['אוּכָּמָא', 'אוּכָּמָא', 'אוּכַּמְתָּא']  → ['אוּכָּמָא', 'אוּכַּמְתָּא']
 * H00875  ['חֵר׳', 'חֵירוּפִין', 'חֵר׳']        → ['חֵר׳', 'חֵירוּפִין']
 * ```
 *
 * **`content.morphology` IS DELIBERATELY NOT REPAIRED, AND THE REASON
 * IS THE GATE.** 21 of the 22 carry `'f.'`, which is wrong about the
 * headword. Writing `'m.'` is text the entry does not hold: it would
 * need `allows: ['m.']`, every non-empty `allows` is a maintainer
 * ruling in code, and `allows` flattens to CODEPOINTS — that
 * declaration would permit unlimited `m` and `.` anywhere in this
 * rule's diff, for a two-character token. Clearing the field instead
 * would delete a label print actually sets. **Nothing is lost by
 * repairing the array alone:** the feminine form the label describes is
 * already present as a sibling `alt_headwords` item in every member.
 * Carried to a `judgment` row instead (spec §7.3).
 */
const genderPairAltDuplicate: Rule = {
	apply: (entry: SourceEntry): TransformResult => {
		const items = entry.alt_headwords;
		if (items === undefined) {
			return { entry, records: [] };
		}
		const seen = new Set<string>();
		const kept = items.filter((item) => {
			if (seen.has(item)) {
				return false;
			}
			seen.add(item);
			return true;
		});
		if (kept.length === items.length) {
			return { entry, records: [] };
		}
		// What the filter dropped, in the order it dropped it. The
		// no-lost-text gate runs for this phase too (2026-09-21) and the
		// dropped bytes are a whole alt-headword — per-ENTRY text, which
		// a static allowance would have had to cover by naming most of
		// the Hebrew alphabet. `removes` is the per-call declaration for
		// exactly this: each string is verified to occur in the input
		// before it is credited, and the duplicate this rule drops is by
		// definition still there as the item that was kept.
		const dropped: string[] = [];
		const held = new Set<string>();
		for (const item of items) {
			if (held.has(item)) {
				dropped.push(item);
			}
			held.add(item);
		}
		return {
			entry: { ...entry, alt_headwords: kept },
			records: [
				{
					detail: `${items.join(', ')} → ${kept.join(', ')}`,
					rid: entry.rid,
					ruleId: 'gender-pair-headword-line-collapse',
				},
			],
			removes: dropped,
		};
	},
	id: 'gender-pair-headword-line-collapse',
	phase: 'text-repairs',
};

export { abbrevFusedHeadword, genderPairAltDuplicate };
