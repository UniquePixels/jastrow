/**
 * `stranded-stem-head` (batch 6c, spec
 * `docs/specs/2026-08-29-stranded-stem-head-design.md`) — the second
 * rule to run in the `structural-repairs` phase, and the first to
 * create a grammar block rather than move a field.
 *
 * ## The defect
 *
 * Print sets a verb-stem section as a heading — `Pi. אִבֵּק, אִיבֵּק
 * (denom. of אָבָק) to cover with powder` — and Sefaria's parser
 * sometimes captured it as a `grammar` block and sometimes left it in
 * the prose of a plain sense. Where it was left, the entry carries no
 * `verbal_stem` for a section the page marks as one: **340 of the 555
 * entries hold no `verbal_stem` anywhere at all**, so `buildStem`
 * builds nothing and `stems[]` is absent from the body.
 *
 * `empty-stem-section` (`judgment`, batch 6b) is the same print
 * phenomenon seen from the other side — there the label got a block
 * and the gloss went to the sibling. Neither row reads without the
 * other.
 *
 * ## Where the population is measured, and why the count moved
 *
 * The row was catalogued at 544 entries with no predicate recorded.
 * Under the predicate stated below the population is **561
 * occurrences / 555 entries**, measured on the entry as this phase
 * receives it — `applyTransforms(applyRepairs(source).entry,
 * 'text-repairs')`. On RAW source the same predicate finds 360 / 359.
 *
 * The whole of that gap is one upstream rule.
 * `label-period-outside-italic` moves a section head's period inside
 * its own italic (`<i>Pa</i>.` → `<i>Pa.</i>`), which takes the
 * population from 360 to 562 in a single step; `italic-swallowed-
 * terminal-period` then returns one. `applyRepairs` alone changes
 * nothing (360 → 360). A predicate about what is INSIDE an italic run
 * therefore cannot be measured before that rule has run — batch 6a's
 * lesson in its sharpest form.
 *
 * ## What this rule repairs, and what it refuses
 *
 * Of the 561, the rule takes the **436** that are a top-level sense
 * at index 0 whose definition opens with a single-label italic run
 * followed by a space and a non-space. The other 125 are refused by
 * the predicate and stay on the queue:
 *
 * | Refused | n | Why |
 * |---|---:|---|
 * | child sense (depth 1) | 100 | `stems[]` has no representation below top level |
 * | `Label of X` stub | 14 | a gloss — the headword IS that stem of X |
 * | etymology-paren residue | 7 | `<i>Pi.</i>) …`, `<i>Pi.</i>; cmp. …` |
 * | `= Label` | 2 | a cross-reference, not a section head |
 * | multi-label / paren-prefixed head | 2 | `I00696`, `O01115` — real, but a shape this rule does not take |
 *
 * **The 100 are the row's hard half and they are a MODEL question.**
 * `buildTrace` (`dry-run.ts:252`) tests `.grammar` on
 * `content.senses` only, and **0 entries in the corpus carry a
 * grammar object below top level** — so writing one there would
 * create a shape nothing reads and nothing else has. They are carried
 * as the new `judgment` row `stem-head-in-child-sense`, on the batch-6b
 * precedent: a row reads `registered` the moment any rule claims its
 * id, so a 436-of-561 rule that kept the whole row would have retired
 * the other 125 into silence.
 *
 * ## The repair
 *
 *     before  senses[0] = { definition: ", <i>Pi.</i> אִבֵּק, … " }
 *     after   senses[0] = { definition: "",
 *                           grammar: { verbal_stem: "Pi." },
 *                           senses: [ { definition: "אִבֵּק, … " } ] }
 *
 * The label MOVES into `grammar.verbal_stem`, which `fieldsOf` walks
 * (`no-new-text.ts:125`), so it is text-neutral to both text gates —
 * the `stemHeadMarkerChop` shape. The rest of the definition moves
 * into a child sense, which is where a parsed stem block keeps its
 * text: `buildStem` reads `sense.senses` and DROPS `sense.definition`
 * entirely, so leaving the text in place would have deleted it at
 * build time, invisibly to all four gates.
 *
 * ## `binyan_form` is left empty, deliberately
 *
 * A parsed block carries the Hebrew forms in `binyan_form`. This rule
 * writes none, and leaves them in the child's prose where they
 * already are. **230 of the 436 open with an `<a dir="rtl">` anchor
 * form** — 199 with an rtl span, 7 with a parenthetical — and
 * `binyan_form` items are plain strings, so lifting one would discard
 * a link target that `checkLinkTargets` is right to defend. (267 is
 * the anchor count over the whole 561-member population, not over the
 * rule's members; the two are not interchangeable.) The reader
 * loses nothing: the form renders in the stem's first child either
 * way. What the entry gains is the stem's NAME, which is the thing
 * that was missing.
 *
 * ## What it deletes, and why that is declared
 *
 * The seam only: the leading punctuation the heading was joined to
 * the headword line with (`", "` 275, `""` 126, `"; "` 26, `" , "` 8,
 * `" ; "` 1) and the single space between the label and the form.
 * Measured over all 436 through `buildTrace`: **1,065 codepoints,
 * every one of them a space, comma or semicolon, and 0 codepoints
 * invented.** Both runs are declared through `removes`.
 *
 * ## The falsifier that had to come back empty
 *
 * A rule that mints a stem section must not mint one the entry
 * already has, and NO GATE IN `run.ts` CAN SEE A DUPLICATE: the label
 * is text the entry already held, so `checkNoNewText` is satisfied and
 * `checkNoLostText` has nothing to say.
 *
 * **In 0 of the 436 does the entry carry another top-level block with
 * the same `verbal_stem`** — 112 carry a block with a DIFFERENT stem
 * name, 317 carry none at all.
 *
 * That measurement is not the defence, though: `alreadyHasStem`
 * refuses the repair outright, so the rule is fail-closed against a
 * source update that ends the coincidence rather than merely lucky in
 * this snapshot.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/**
 * The stem labels, taken from the corpus's own `verbal_stem` field
 * rather than invented: the 70 distinct values it holds, minus the 19
 * that batch 6b enumerated as not binyan names (`stem-corpus.test.ts`
 * `NOT_A_BINYAN`), minus the six multi-label values (`"Hithpa. a.
 * Nithpa."` and kin), whose heads are a different shape. 45 remain.
 *
 * Frozen here in the `abbrev-vocab.ts` style, with the derivation
 * runnable so a re-fetch re-baselines it rather than silently
 * disagreeing:
 *
 *   bun -e 'import {readSourceEntries} from
 *   "./admin/pipeline/body/source.ts"; const v = new Set();
 *   const w = (ss) => { for (const s of ss ?? []) {
 *   if (s.grammar?.verbal_stem) v.add(s.grammar.verbal_stem);
 *   w(s.senses); } };
 *   for await (const e of readSourceEntries()) w(e.content.senses);
 *   console.log(JSON.stringify([...v].sort()))'
 *
 * `stem-section-corpus.test.ts` asserts the vocabulary against a live
 * re-derivation, so a value appearing or vanishing upstream fails a
 * test rather than quietly changing the population.
 */
const LABELS: readonly string[] = [
	'Af.',
	'Hif.',
	'Hithp.',
	'Hithpa.',
	'Hithpalp.',
	'Hithpol.',
	'Hitpa.',
	'Hitpol.',
	'Hof.',
	'Ishtaf.',
	'Ithpa.',
	'Ithpaeli.',
	'Ithpalp.',
	'Ithpar.',
	'Ithpe.',
	'Ithpo.',
	'Ithpol.',
	'Ithpolel.',
	'Ithpoli.',
	'Ithpoël.',
	'Itphe.',
	'Ittaf.',
	'Ittafel.',
	'Ittof.',
	'Nef.',
	'Nif.',
	'Nithpa.',
	'Nithpalp.',
	'Nittaf.',
	'Pa.',
	'Paeli.',
	'Pali.',
	'Palp.',
	'Palpel.',
	'Pe.',
	'Pi.',
	'Pilp.',
	'Pilpel.',
	'Pirel.',
	'Po.',
	'Pol.',
	'Polel.',
	'Poël.',
	'Pu.',
	'Pulpel.',
];

/** Regex-safe spelling of a label. Every member ends in `.`, which is
 * a metacharacter, so this is not decoration. Not called `escape`:
 * that is a restricted global name. */
function escapeLabel(label: string): string {
	return label.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

/**
 * The one shape this rule accepts. Every clause is a refusal the §
 * table above counts:
 *
 * - `pre` admits whitespace, comma and semicolon and NOTHING else, so
 *   the two `" = "` cross-references are refused rather than trimmed.
 * - the italic holds exactly ONE label with no inner whitespace, so
 *   `I00696`'s `<i>Pa.</i>, … <i>Af.</i>` double head is refused
 *   rather than half-repaired.
 * - `rest` must open `\s\S` — a space then something. That single
 *   clause refuses the seven etymology-paren remnants
 *   (`<i>Pi.</i>) …`, `<i>Pi.</i>; cmp. …`), where the character
 *   after the run is punctuation continuing an enclosing parenthesis
 *   rather than the space before a form.
 */
const HEAD = new RegExp(
	`^(?<pre>[\\s,;]*)<i>(?<run>(?:${LABELS.map(escapeLabel).join('|')}))</i>(?<rest>\\s\\S[\\s\\S]*)$`,
	'u',
);

/** The whitespace between the label run and what follows it — the
 * second of the rule's two deletions. Top level so the literal is not
 * re-compiled per entry. */
const LABEL_SPACE = /^\s+/u;

/** `Label of X` — the headword IS that stem of another article, so
 * the label is a gloss and not a section head. Tested on `rest`
 * because `HEAD` has already consumed the run. */
const CROSS_REFERENCE = /^\s*of\b/u;

interface Repair {
	/** The text moved into the new block's child sense. */
	body: string;
	/** The two runs deleted: the seam prefix and the label's own
	 * following space. Declared verbatim through `removes`. */
	removed: readonly string[];
	/** The value written to `grammar.verbal_stem`. */
	stem: string;
}

/** The repair this sense licenses, or `null`. */
function repairFor(sense: SourceSense): Repair | null {
	if (sense.grammar !== undefined || sense.definition === undefined) {
		return null;
	}
	const match = HEAD.exec(sense.definition);
	const stem = match?.groups?.['run'];
	const rest = match?.groups?.['rest'];
	const pre = match?.groups?.['pre'];
	if (stem === undefined || rest === undefined || pre === undefined) {
		return null;
	}
	if (CROSS_REFERENCE.test(rest)) {
		return null;
	}
	const body = rest.replace(LABEL_SPACE, '');
	return {
		body,
		removed: [pre, rest.slice(0, rest.length - body.length)],
		stem,
	};
}

/** The stem block one licensed repair builds. The original sense's
 * own children follow the new text child, so an entry whose sense 0
 * already had sub-senses keeps them in order. */
function blockFor(sense: SourceSense, repair: Repair): SourceSense {
	const child: SourceSense = {
		definition: repair.body,
		...(sense.number === undefined ? {} : { number: sense.number }),
	};
	return {
		definition: '',
		grammar: { verbal_stem: repair.stem },
		senses: [child, ...(sense.senses ?? [])],
	};
}

/** Whether a LATER top-level sense already carries this stem name.
 *
 * The rule MINTS a stem section, and no gate in `run.ts` can see a
 * duplicate one: the label is text the entry already held, so
 * `checkNoNewText` is satisfied and `checkNoLostText` has nothing to
 * say. Minting a second `Pa.` beside an existing `Pa.` would therefore
 * ship green.
 *
 * 0 of the 436 members trip this today — the corpus test asserts it —
 * which is exactly why it is a GUARD and not a comment. "No member
 * does this" is a fact about one snapshot; a re-fetch could end it,
 * and the failure it would then permit is invisible to everything
 * else. Fail-closed, in the shape `link-target.ts` established. */
function alreadyHasStem(entry: SourceEntry, stem: string): boolean {
	return entry.content.senses
		.slice(1)
		.some((sense) => sense.grammar?.verbal_stem === stem);
}

const strandedStemHead: Rule = {
	apply: (entry: SourceEntry): TransformResult => {
		const [first] = entry.content.senses;
		const repair = first === undefined ? null : repairFor(first);
		if (first === undefined || repair === null) {
			return { entry, records: [] };
		}
		if (alreadyHasStem(entry, repair.stem)) {
			return { entry, records: [] };
		}
		const records: TransformRecord[] = [
			{
				detail: `lifted stranded stem head ${JSON.stringify(repair.stem)} into a grammar block`,
				rid: entry.rid,
				ruleId: 'stranded-stem-head',
			},
		];
		return {
			entry: {
				...entry,
				content: {
					...entry.content,
					senses: [blockFor(first, repair), ...entry.content.senses.slice(1)],
				},
			},
			records,
			// The seam prefix and the label's following space. Credited
			// as a multiset, so an empty `pre` declares nothing and a
			// rule that dropped a second space would still fail.
			removes: repair.removed.filter((run) => run.length > 0),
		};
	},
	id: 'stranded-stem-head',
	phase: 'structural-repairs',
};

export { LABELS, strandedStemHead };
