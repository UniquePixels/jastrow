/**
 * `section-break-terminator-loss` (batch 7,
 * `docs/v2/transform-batch-7.md` §6) — **the only rule in this registry
 * that MINTS a byte into the text**, and the reason its `allows` is a
 * maintainer ruling rather than a convenience.
 *
 * ## The defect
 *
 * Jastrow ends a sense and opens a form section with `.—Pl.`: a
 * terminal period, an em dash, the label. In 11 places the period is
 * gone, so the sense runs straight into the section head —
 * `…is severed—Pl.` (`H00068`, the row's own published example).
 *
 * ## The null model is the argument, and it reproduces exactly
 *
 * Predecessor census for `—<label>` over all 32,512 entries, measured
 * on `applyTransforms(applyRepairs(source).entry, 'text-repairs')`,
 * tag-tolerant on both sides of the dash:
 *
 *     "."  7,250     "]" 241     "?" 54     ")" 17     "!" 4
 *     ";"  3         "’"  3      "ᵃ"  2     "…"  2     " " 2
 *     "e"  2         "s"  1      "l"  1     "d"  1
 *
 * Four of those are the catalogue's own falsifier controls and all four
 * reproduce to the digit — `]` 241 against a recorded 242, `?` 54, `)`
 * 17, `!` 4. They are legitimate sentence-enders, and the rule refuses
 * them.
 *
 * **The catalogue's two false-positive families are visible in the same
 * census**, which is why the row was cut from a 15-candidate first pass
 * to 10: the three `’` are quotations closing with the period already
 * present, and the two `…` are ellipses. Requiring a LETTER OR DIGIT
 * predecessor excludes both families by construction rather than by a
 * hand-maintained exception list.
 *
 * ## What it writes, and why one codepoint is the whole ruling
 *
 * `allows: ['.']` — Brian's ruling 2026-08-29. The rule inserts exactly
 * one period per member, immediately before the em dash, and nothing
 * else. `allows` licenses that codepoint across the rule's whole diff,
 * which is the blast radius `no-new-text.ts` documents; it is
 * acceptable here only because the predicate is anchored at a
 * `—<label>` boundary that occurs 7,532 times corpus-wide and matches
 * 11.
 *
 * This is a CORRECTION, not composition: the period is print's, dropped
 * in transcription, and `[[project_ocr_correction_ruling]]` is the
 * standing decision that such glyph restoration is repair rather than
 * invention.
 *
 * ## The 11, in three shapes
 *
 * - **abbreviation** — `a. e—Pl.` (`M00479`, `S01514`), where the
 *   corpus writes `a. e.` everywhere else;
 * - **citation locator** — `Ḥull. 51ᵃ—Pl.` (`C00193`), `B. Bath.
 *   60ᵃ—Pl.` (`G00323`), `Ib. 5—Fem.` (`V00427`);
 * - **gloss or quotation** — `says—Fem.` (`A00519`), `hill—Pl.`
 *   (`C00952`), `severed—Pl.` (`H00068`), `v. infra—Part. pass.`
 *   (`Q01518`), and two Hebrew runs (`R00440`, `T00980`).
 *
 * The count is corrected 10 → **11**.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/** The section-head labels, as `body/form-sections.ts` names them —
 * matched on the label's opening word so `Part. pass.` is reached by
 * `Part`. */
const LABELS = ['Pl', 'Part', 'Fem', 'Denom'] as const;

/** Inline tags may sit on either side of the dash: Jastrow renders a
 * label as plain text or inside its own `<i>`, and the sense before it
 * often closes a `</span>` or `</a>` first. */
const TAG: string = String.raw`(?:<\/?[a-z][^>]*>)*`;

/**
 * A letter or digit, then optional tags, an em dash, optional tags, and
 * a section label.
 *
 * The predecessor class is the whole discriminator. Anything that is
 * already a sentence-ender — `.` `]` `?` `)` `!` — fails to match, and
 * so do the two false-positive families the row's first pass caught:
 * the closing quote `’` and the ellipsis `…` are neither letters nor
 * digits under `\p{L}`/`\p{N}`.
 */
const MISSING_STOP = new RegExp(
	String.raw`(?<pre>[\p{L}\p{N}])(?<tags>${TAG})(?<head>—${TAG}(?:${LABELS.join('|')})\b)`,
	'gu',
);

/** The one codepoint this rule writes. */
const STOP: string = '.';

/** `definition` with a period restored before every section head that
 * lost one, or `null` when there is nothing to repair. */
function restoreStops(
	definition: string,
): { repaired: string; count: number } | null {
	let count = 0;
	const repaired = definition.replace(MISSING_STOP, (...args) => {
		const groups = args.at(-1) as { head: string; pre: string; tags: string };
		count++;
		// THE PERIOD GOES OUTSIDE THE CLOSING TAGS, immediately before the
		// em dash — never straight after the letter. `height, <i>hill</i>`
		// must become `<i>hill</i>.` and not `<i>hill.</i>`: the second is
		// a fresh member of `italic-swallowed-terminal-period` (1,331,
		// registered), so writing it would have a rule MANUFACTURE
		// population for a sibling row. That is the failure batch 3b found
		// by hand and `stem-head.ts` names in its own deletion note.
		return `${groups.pre}${groups.tags}${STOP}${groups.head}`;
	});
	return count === 0 ? null : { count, repaired };
}

/** Recurses, because senses NEST. */
function repairSenses(
	senses: readonly SourceSense[],
	rid: string,
	out: { count: number; records: TransformRecord[] },
): SourceSense[] {
	return senses.map((sense) => {
		const deepened =
			sense.senses === undefined
				? sense
				: { ...sense, senses: repairSenses(sense.senses, rid, out) };
		if (deepened.definition === undefined) {
			return deepened;
		}
		const result = restoreStops(deepened.definition);
		if (result === null) {
			return deepened;
		}
		out.count += result.count;
		for (let i = 0; i < result.count; i++) {
			out.records.push({
				detail: 'restored the terminal period before a section head',
				rid,
				ruleId: 'section-break-terminator-loss',
			});
		}
		return { ...deepened, definition: result.repaired };
	});
}

const sectionBreakTerminator: Rule = {
	// THE RULING, and it is one codepoint. See the header: the period is
	// print's, dropped in transcription, and the predicate is anchored at
	// a boundary that occurs 7,532 times corpus-wide and matches 11.
	allows: [STOP],
	apply: (entry: SourceEntry): TransformResult => {
		const out = { count: 0, records: [] as TransformRecord[] };
		const senses = repairSenses(entry.content.senses, entry.rid, out);
		if (out.records.length === 0) {
			return { entry, records: out.records };
		}
		return {
			entry: { ...entry, content: { ...entry.content, senses } },
			records: out.records,
		};
	},
	id: 'section-break-terminator-loss',
	phase: 'structural-repairs',
};

export { LABELS, MISSING_STOP, restoreStops, STOP, sectionBreakTerminator };
