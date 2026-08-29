/**
 * `asterisk-stem-label`'s one mechanical sub-shape (batch 6b, spec
 * `docs/specs/2026-08-28-structural-repairs-design.md` §4): a valid
 * binyan label carrying a stray trailing space-period.
 *
 * ## Three of sixty-nine, and the other sixty-six are not this
 *
 * The row holds 69 non-binyan `verbal_stem` values in five sub-shapes
 * (batch-6a report §4). Only this one is repairable by a rule today:
 *
 * | Sub-shape | n | Why it is not here |
 * |---|---:|---|
 * | `"*."` / `"* ."` | 44 | the `*` is v2's reconstruction siglum, and `stems[].forms` are plain strings with no `reconstructed` flag to carry it — a model ruling |
 * | punctuation debris `"[."`, `"(."`, … | 10 | a delimiter torn off the block's own text; may belong to `stranded-open-bracket` |
 * | print section heads `"Compounds: ."`, `"Fem."` | 9 | the block is not a stem section at all |
 * | `"*Pa."`, `"*Nif."`, `"*Ithpe."` | 3 | siglum retained WITH a valid label; reads correctly as it stands |
 * | **stray period `"Pa. ."` ×2, `"Af. ."`** | **3** | **this rule** |
 *
 * So the row is RE-SCOPED rather than claimed whole: `asterisk-stem-label`
 * is now 3, this rule is registered against it, and the other 66 are a
 * new `judgment` row, `stem-label-not-a-binyan-name`. The alternative
 * was cheaper and wrong — `coverage()` reads a row as registered the
 * moment any rule claims its id, so a 3-of-69 rule left against the
 * whole row would have retired 66 live defects into silence. The
 * precedent is batch 4's
 * `superscript-subsection-contradicts-link-sub-section`, split off as
 * `judgment` from birth.
 *
 * ## What it deletes
 *
 * Two characters, ` .`, declared through `removes`. Nothing reads that
 * declaration in `text-repairs` — the loss gate is scoped to
 * `structural-repairs` (spec §2.3) — but the deletion is real and the
 * declaration is the record of it, correct in advance of any later
 * widening of the gate.
 *
 * ## Why the label survives and the debris does not
 *
 * `"Pa. ."` is `"Pa."` plus a space and a period: Sefaria appends a
 * terminating period to a stem label that already carried one. The
 * label is intact and correct; only the appended pair is debris. That
 * is what separates these 3 from the 54 whose stem NAME is gone — no
 * inference is needed to know what `"Pa. ."` was meant to be, and no
 * amount of reading recovers a name from `"*."`.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/** A complete binyan label followed by a stray space-period. Anchored
 * both ends: `"Pa., part. pass."` and `"Compounds: ."` are print
 * section heads, not labels with debris, and must not match. */
const STRAY_PERIOD = /^(?<label>[A-Z][A-Za-z]*\.) \.$/u;

/** The two characters this rule removes, per repaired label. */
const REMOVED = ' .';

/** Rebuild one sense tree with every stray-period label trimmed. */
function trimLevel(
	senses: readonly SourceSense[],
	rid: string,
	records: TransformRecord[],
): SourceSense[] {
	return senses.map((sense) => {
		const deepened =
			sense.senses === undefined
				? sense
				: { ...sense, senses: trimLevel(sense.senses, rid, records) };
		const stem = deepened.grammar?.verbal_stem;
		const label =
			stem === undefined
				? undefined
				: STRAY_PERIOD.exec(stem)?.groups?.['label'];
		if (label === undefined || deepened.grammar === undefined) {
			return deepened;
		}
		records.push({
			detail: `verbal_stem ${JSON.stringify(stem)} → ${JSON.stringify(label)}`,
			rid,
			ruleId: 'asterisk-stem-label',
		});
		return {
			...deepened,
			grammar: { ...deepened.grammar, verbal_stem: label },
		};
	});
}

const asteriskStemStrayPeriod: Rule = {
	apply: (entry: SourceEntry): TransformResult => {
		const records: TransformRecord[] = [];
		const senses = trimLevel(entry.content.senses, entry.rid, records);
		if (records.length === 0) {
			return { entry, records };
		}
		return {
			entry: { ...entry, content: { ...entry.content, senses } },
			records,
			removes: records.map(() => REMOVED),
		};
	},
	id: 'asterisk-stem-label',
	phase: 'text-repairs',
};

export { asteriskStemStrayPeriod };
