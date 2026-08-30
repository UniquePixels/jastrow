/**
 * `see-particle-lost` (batch 8, `docs/v2/transform-batch-8.md` §3) — the
 * second rule in the registry to MINT text, and the first to mint a
 * word rather than a codepoint.
 *
 * ## The defect
 *
 * Jastrow sets a whole class of entries as a bare redirect: the lemma,
 * a comma, a see-particle, and the article it points at. The entry has
 * one sense and that sense's whole definition is the pointer.
 *
 *     E00226  הוּזְמָא   ", v. הִיזְמָא."
 *
 * In four entries the particle slot is EMPTY — the definition opens on
 * the comma and runs straight into the anchor. A reader is shown
 * `הוּזְמָא, הִיזְמָא` with nothing saying what the second word is doing
 * there, and the sentence has lost the only word that carried its
 * meaning.
 *
 * ## Why minting is licensed here, measured rather than argued
 *
 * `sectionBreakTerminator` minted a period against a null model of
 * 7,250 correct to 11 missing. This rule's is of the same shape and
 * slightly stronger. Measured over all 32,512 entries at the stage this
 * rule runs — one top-level sense, no children, the anchor the whole
 * definition — the slot is populated **7,270** times and empty **4**:
 *
 *     "v."  6844   "v. sub"  196   "read"  29   "pl. of"  29
 *     "read:"  16  "v. sub."  12   "part. of"  8  "fem. of"  5
 *     "Pi. of"  4  "v,"  4        "constr. of"  4  "imper. of"  3
 *
 * Those twelve are the HEAD of the distribution, not the whole of it:
 * they account for 7,154 of the 7,270, with 116 more spread over a tail
 * of rarer particles.
 *
 * That vocabulary is the argument. A slot whose fillers were being
 * normalised away would show a SINGLE surviving value; this one retains
 * a dozen distinct particles, several of them themselves damaged
 * (`v,` ×4, `read:` ×16). A convention that varied this much everywhere
 * it was kept did not silently mean "nothing" in four places. So the
 * empty slot is loss, and `v.` — 94% of the populated slots, and the
 * only value that fits a bare article pointer — is what was lost.
 *
 * ## The predicate is what isolates the defect, and the row says so
 *
 * The broader shape `, <a Jastrow…>` at definition START occurs 87
 * times and is overwhelmingly legitimate: it is the print headword
 * line's SECOND FORM, not a redirect. Restricting to "the anchor is the
 * entire definition" is what cuts a 95%-noise candidate down to four.
 *
 * A second restriction is this batch's own, and it is the difference
 * between 4 and 18. The same string shape occurs in **14 child senses**
 * of large articles — `D00892`, `Q00548` and twelve others — where a
 * sub-sense that is nothing but a cross-reference is ordinary. The rule
 * therefore fires only when the stub IS the entry: one top-level sense,
 * no children below it. Measured that way the population is exactly the
 * four the catalogue names.
 *
 * ## What it declares
 *
 * `allows: ['v', '.', ' ']`. All three are minted: the input's only
 * period is the stub's own terminator, and `checkNoNewText` is a
 * multiset test, so a second one needs an allowance of its own.
 *
 * The particle is written OUTSIDE the anchor, immediately before the
 * opening tag. Writing it into the display would corrupt the link text
 * and would put a Latin abbreviation inside a `dir="rtl"` run, which
 * renders reversed — the same class of mistake `sectionBreakTerminator`
 * avoids by putting its period outside the closing `</i>`.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/** The word this rule writes. */
const PARTICLE = 'v.';

/**
 * A whole-definition redirect stub with an EMPTY particle slot: a
 * leading comma, optional horizontal space, then the anchor and nothing
 * after it but an optional terminating period.
 *
 * `[^<]*` between the comma and the tag is what reads the slot, and
 * anchoring both ends is what refuses the 87 second-form headword lines
 * — those carry gloss text the anchor does not exhaust.
 *
 * THE SEPARATING SPACE IS REQUIRED (`[ \t]+`, not `*`), which is
 * fail-closed rather than strict for its own sake. All four members read
 * `", <a"`, so the space is part of the shape; admitting `",<a"` would
 * have the rule emit `",v. <a"`, a particle fused to the comma and a
 * spelling the corpus holds nowhere. The population is pinned at 4 in
 * the corpus gate, so a shape this refuses that ought to be repaired
 * fails a test rather than passing silently.
 */
const STUB =
	/^(?<head>[ \t]*,[ \t]+)(?<slot>[^<]*)<a\b[^>]*>[^<]*<\/a>[ \t]*\.?[ \t]*$/u;

/**
 * `definition` with the see-particle restored, or `null` when this is
 * not a bare stub — including every stub whose slot is already filled.
 *
 * A PURE INSERTION. The particle is spliced in at the anchor's own
 * offset and every other byte is carried through untouched, edge
 * whitespace included. Rebuilding the string from the captured groups
 * instead would silently trim those edges: an undeclared deletion that
 * `checkNoNewText` cannot see (it is a sub-multiset test) and that
 * would move `trailing-whitespace-definition`'s population without
 * saying so.
 */
function restoreParticle(definition: string): string | null {
	const match = STUB.exec(definition);
	if (match === null || (match.groups?.['slot'] ?? '').trim() !== '') {
		return null;
	}
	const at =
		(match.groups?.['head'] ?? '').length +
		(match.groups?.['slot'] ?? '').length;
	return `${definition.slice(0, at)}${PARTICLE} ${definition.slice(at)}`;
}

/** Is this entry's content nothing but one childless sense? The
 * restriction that separates the 4 whole-entry stubs from the 14 child
 * senses carrying the same string shape. */
function isWholeEntryStub(senses: readonly SourceSense[]): boolean {
	return senses.length === 1 && (senses[0]?.senses ?? []).length === 0;
}

const seeParticleRestore: Rule = {
	// THE RULING (Brian, 2026-08-30). See the header: a null model of
	// 7,270 populated slots against 4 empty ones, with a vocabulary of a
	// dozen distinct particles that was retained everywhere else.
	allows: ['v', '.', ' '],
	apply: (entry: SourceEntry): TransformResult => {
		const senses = entry.content.senses;
		if (!isWholeEntryStub(senses)) {
			return { entry, records: [] };
		}
		const sense = senses[0] as SourceSense;
		const repaired = restoreParticle(sense.definition ?? '');
		if (repaired === null) {
			return { entry, records: [] };
		}
		const records: TransformRecord[] = [
			{
				detail: 'restored the see-particle to a bare redirect stub',
				rid: entry.rid,
				ruleId: 'see-particle-lost',
			},
		];
		return {
			entry: {
				...entry,
				content: {
					...entry.content,
					senses: [{ ...sense, definition: repaired }],
				},
			},
			records,
		};
	},
	id: 'see-particle-lost',
	phase: 'text-repairs',
};

export {
	isWholeEntryStub,
	PARTICLE,
	restoreParticle,
	STUB,
	seeParticleRestore,
};
