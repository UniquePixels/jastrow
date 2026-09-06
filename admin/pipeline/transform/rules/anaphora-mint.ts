/**
 * `unlinked-bare-anaphor` — a bare `Ib.` Jastrow printed as a citation
 * that Sefaria's extraction never anchored.
 *
 * The first rule in the registry to CREATE an anchor. It is licensed
 * by link-target gate case 10
 * (`docs/specs/2026-09-06-link-target-gate-case-10.md`), ruled in by
 * Brian on 2026-09-06 on the precedent that the 2026-08-05 body review
 * approved wrapping unlinked ibid citations
 * (`docs/v2/body-review/02-orphan-refs.md` class 2, "ALL Approved").
 * The "show only what Jastrow linked" principle was written in that
 * review's class 3, about refs with no in-body basis.
 *
 * ## What it does, in one line
 *
 * Wraps the bare anaphor in the ANTECEDENT'S OWN OPENING TAG, byte for
 * byte, and closes it. Not a reconstruction of one: `cite.tag` is the
 * raw `<a …>` the input already holds, so the `class`, the `href` and
 * the `data-ref` all arrive verbatim from the entry's own markup and
 * this rule composes no attribute of its own.
 *
 * ## The population, measured after `applyRepairs`
 *
 * | | |
 * | --- | --- |
 * | bare anaphors outside every anchor | **2,819 occurrences / 2,179 entries** |
 * | …of them in `content.senses[].definition` | **2,819** |
 * | …in every other field `fieldsOf` walks | **0** |
 *
 * Scope MEASURED rather than assumed, which is the `h-cognate-self-link`
 * lesson this registry keeps re-learning.
 *
 * ## What it repairs, at two stages, and why they differ by one
 *
 * | | |
 * | --- | --- |
 * | applied ALONE to the repaired corpus | **2,118 anchors / 1,750 entries** |
 * | applied AT ITS REGISTRY POSITION, last in the phase | **2,119 anchors / 1,750 entries** |
 *
 * A rule above it creates one more site, which is the second reason
 * this rule runs last (see `registry.ts`). The whole phase then
 * reconciles to the digit, which is the check worth having:
 *
 * ```text
 * 2819  bare anaphors before the phase
 * +   1  created by a rule above this one
 * −2119  minted here
 * = 701  bare anaphors left after the phase   (measured: 701 / 570 entries)
 * ```
 *
 * and on the other side, anchored bare anaphors go **2,244 → 4,363**,
 * a gain of exactly the 2,119. `transform:count` measures ENTRIES and
 * so reports 1,750 against a catalogued 2,179; that is the designed
 * unit mismatch — the row counts entries carrying the DEFECT, this
 * rule repairs 1,750 of them and declines in the rest.
 *
 * `report-batch-06.md` published 3,256 for this class. That figure is
 * NOT used and does not reproduce: its own control (`the` = 65,969)
 * matches an unbounded SUBSTRING count while the `Ib.` halves were
 * taken on something narrower. Full working in
 * `docs/v2/phase-2-unlinked-ib.md` §1.
 *
 * ## The predicate
 *
 * A bare anaphor is `Ib.` or `ib.` standing as its own word, in a text
 * token no anchor spans, **with no locus of its own following it**.
 * `Ib. 35ᵃ` and `Ib. V, 1` carry their own address, resolve correctly
 * across the corpus and are not this defect — the same carve-out
 * `anaphora.ts`'s `ANAPHOR` makes on the anchored side.
 *
 * The antecedent is `anaphora.ts`'s, clause for clause, because it is
 * the same question asked at a text position instead of at an anchor:
 * the nearest preceding usable anchor that `isCitation` accepts (so no
 * `Jastrow, …` cross-reference — a headword is not a place) and that
 * `isSpentAnaphor` does not reject (so no anaphor that already failed
 * into the `Yoma 2a` sink), with no `INTERVENING_CITATION` cue in the
 * `gapBetween` them. All of it — `usable` included — is IMPORTED from
 * `anaphora.ts` rather than restated; a second definition of "the
 * antecedent" is how the two would drift apart, and drift here means
 * two rules disagreeing about which citation an `Ib.` refers to.
 *
 * ## What it declines, and why the declines are the honest half
 *
 * Measured over the 2,819:
 *
 * ```text
 * 2819  bare anaphors
 * − 215  no preceding anchor at all
 * −  81  only `Jastrow, …` lexical antecedents
 * − 405  an unanchored citation intervenes
 * =2118  MINT
 * ```
 *
 * Every decline has one root cause and it is the same one
 * `ibAnaphora`'s 33% has: the citation the `Ib.` refers to is in
 * Jastrow's text but never became an anchor. Recovering it means
 * parsing `Y. Ter. VIII, 46ᵇ bot.` into a Sefaria address — the
 * never-linked family, deferred by the batch-2 §1 ruling, and
 * inference rather than movement.
 *
 * ## THE SEGMENT IS INHERITED, AND THAT IS A KNOWN COST
 *
 * The walk was scored against the linker on the 1,859 ANCHORED bare
 * anaphors whose answer is known (the 364 `Yoma 2a*` sink members
 * excluded as known-wrong, 142 declined):
 *
 * | | Agree | |
 * | --- | --- | --- |
 * | exact `data-ref` string | 971 | 52.2% |
 * | **same place, granularity ignored** | **1,857** | **99.9%** |
 * | different place | 2 | 0.1% |
 *
 * The gap is not error. Sefaria addresses a SEGMENT where Jastrow
 * cites the daf, so copying the antecedent whole writes
 * `Sanhedrin 78b:12` where the linker wrote `78b:11`. **The reader
 * lands on the right page and not necessarily the right line.** That
 * is the correct reading of a bare `Ib.` — *the same place* — and it
 * is what `ibAnaphora` already ships; it is recorded here so it is a
 * known property rather than a later surprise.
 *
 * The two survivors are `A01334` (`Mishnah Sukkah 1:1` against
 * `Sukkah 55b:14`, a genuine miss) and `V00899` (`Pesikta Rabbati
 * 27-28` against `27:1`, a range against a segment).
 *
 * **The control cannot speak for the whole population**, and the one
 * specific reason to doubt it was checked: the linker's known blind
 * spot is a Jerusalem Talmud antecedent, which sends all 259 of its
 * members to the sink. Among the 2,118 mints, **71 have a Jerusalem
 * Talmud antecedent and 2,047 do not** — 3.4%, so the target
 * population is not enriched for the case the control could not
 * cover. That removes the reason for doubt; it does not prove the walk
 * right where the linker failed, and nothing here could.
 *
 * ## Scope and gates
 *
 * `definition` only, so `fields.ts`'s `mapFields` is not used — this
 * rule walks senses itself, like `anaphora.ts`. It writes no text a
 * reader sees (`checkNoNewText` strips tags and the display is
 * unchanged), adds a balanced tag pair (`checkMarkup` counts neither
 * an unpopped open nor an unpopping close), and declares every anchor
 * it creates through `minted` for case 10.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { type Token, tokenize } from '../html.ts';
import { type Anchor, anchors } from '../links.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';
import {
	gapBetween,
	INTERVENING_CITATION,
	isCitation,
	isSpentAnaphor,
	usable,
} from './anaphora.ts';

/** Must match an `id` in data/patches/patterns.jsonl, and an entry in
 * `link-target.ts`'s `MINT_DECLARERS`. */
const RULE_ID = 'unlinked-bare-anaphor';

/** A bare anaphor standing as its own word. The lookarounds are on
 * LETTERS AND DIGITS rather than `\b`, because `\b` puts a boundary
 * between `.` and a following letter and would match the `ib.` inside
 * a longer abbreviation. */
const BARE_ANAPHOR = /(?<![\p{L}\p{N}])(?:Ib|ib)\.(?![\p{L}\p{N}])/gu;

/** A locus of the anaphor's OWN, immediately following it: a daf, a
 * Roman numeral or any digit run. `Ib. 35ᵃ` names its place and is not
 * this defect. Deliberately generous — a false positive here costs a
 * decline, never a wrong link. */
const OWN_LOCUS = /^\s*(?:\d|[IVXLC]+[,.\s]|[a-z]?\d)/u;

/** The cheap pre-test — hoisted per `lint/performance/useTopLevelRegex`.
 * A whole-corpus pass tests this against every definition, so it is
 * worth the fast path: only 2.6% of definitions carry the substring at
 * all. */
const ANY_IB = /[Ii]b\./u;

/**
 * The anchor a bare anaphor at token `at`, offset `offset`, refers
 * back to — or `undefined`, which is a DECLINE and not a failure.
 *
 * `antecedentOf` in `anaphora.ts` asks this of an ANCHOR index; the
 * question is the same one at a text position, and the clauses are
 * identical:
 *
 * 1. The nearest preceding anchor that is usable, is a citation
 *    (`isCitation` — not a `Jastrow, …` cross-reference) and has not
 *    already failed into the sink (`isSpentAnaphor`).
 * 2. It must CLOSE before the token holding the anaphor.
 * 3. No unanchored citation may intervene. `INTERVENING_CITATION` reads
 *    `gapBetween`, which masks text inside anchors — so a Roman numeral
 *    printed between the antecedent and the anaphor costs a decline,
 *    which is the conservative direction.
 *
 * There is no rival clause. `antecedentOf` needs one because its
 * `accept` may skip anchors its `tolerate` then has to excuse; here
 * `accept` IS `isCitation` and the search takes the LAST match, so by
 * construction no accepted citation is skipped.
 *
 * The gap includes the part of the anaphor's own token that precedes
 * it — an unanchored citation two words earlier sits inside that text
 * token, not between tokens, and reading only whole tokens would miss
 * it. Measured: 48 of the 2,166 that clause 3 would otherwise pass.
 */
function antecedentFor(
	tokens: readonly Token[],
	list: readonly Anchor[],
	at: number,
	offset: number,
): Anchor | undefined {
	const cite = [...list]
		.reverse()
		.find(
			(prior) =>
				usable(prior) &&
				prior.close < at &&
				isCitation(prior) &&
				!isSpentAnaphor(prior),
		);
	if (cite === undefined) {
		return;
	}
	const token = tokens[at];
	const lead = token?.kind === 'text' ? token.value.slice(0, offset) : '';
	const gap = gapBetween(tokens, list, cite.close + 1, at) + lead;
	return INTERVENING_CITATION.test(gap) ? undefined : cite;
}

/** Whether any usable anchor spans this token — the same masked
 * reading `gapBetween` performs, and what makes the text this rule
 * wraps BARE. */
function spanned(list: readonly Anchor[], at: number): boolean {
	return list.some(
		(anchor) => usable(anchor) && anchor.open <= at && anchor.close >= at,
	);
}

/** One anchor this rule created, in `TransformResult.minted`'s element
 * shape. Declared locally rather than exported from `types.ts`, which
 * spells it inline — the convention `anaphora.ts` set for `Compose`. */
interface Mint {
	display: string;
	field: string;
	from: number;
	target: string;
}

/**
 * Mint every resolvable anaphor in one definition.
 *
 * The token array is never mutated and the output is BUILT AS A
 * STRING, which is what makes a chain of anaphora in one definition
 * safe. Wrapping splits one text token into five, so every later index
 * would shift — `anaphora.ts` can reuse indices across edits precisely
 * because `retarget` replaces a tag value in place and this editor
 * does not. Building the string sidesteps it entirely, and it also
 * gives the property `retargetAnaphora` documents for its own walk:
 * every anaphor resolves against the PRE-EDIT anchor sequence rather
 * than against its predecessors' output.
 */
function mintOver(definition: string): { mints: Mint[]; text: string } {
	if (!ANY_IB.test(definition)) {
		return { mints: [], text: definition };
	}
	const tokens = tokenize(definition);
	const list = anchors(tokens);
	const mints: Mint[] = [];
	const out: string[] = [];
	for (const [at, token] of tokens.entries()) {
		if (token.kind !== 'text' || spanned(list, at)) {
			out.push(token.value);
			continue;
		}
		let read = 0;
		let text = '';
		for (const match of token.value.matchAll(BARE_ANAPHOR)) {
			const start = match.index;
			const display = match[0];
			if (OWN_LOCUS.test(token.value.slice(start + display.length))) {
				continue;
			}
			const cite = antecedentFor(tokens, list, at, start);
			if (cite === undefined) {
				continue;
			}
			text += `${token.value.slice(read, start) + cite.tag + display}</a>`;
			read = start + display.length;
			mints.push({
				display,
				field: definition,
				from: cite.open,
				target: cite.dataRef,
			});
		}
		out.push(text + token.value.slice(read));
	}
	return { mints, text: out.join('') };
}

/** Every sense's definition, recursively — the shape `anaphora.ts`
 * walks, and the only field this rule touches. */
function walk(
	senses: readonly SourceSense[],
	mints: Mint[],
	repaired: { count: number },
): SourceSense[] {
	return senses.map((sense) => {
		let next = sense;
		if (sense.definition !== undefined) {
			const found = mintOver(sense.definition);
			if (found.mints.length > 0) {
				mints.push(...found.mints);
				repaired.count += found.mints.length;
				next = { ...next, definition: found.text };
			}
		}
		if (next.senses !== undefined) {
			next = { ...next, senses: walk(next.senses, mints, repaired) };
		}
		return next;
	});
}

const unlinkedBareAnaphor: Rule = {
	apply(entry: SourceEntry): TransformResult {
		const mints: Mint[] = [];
		const repaired = { count: 0 };
		const senses = walk(entry.content?.senses ?? [], mints, repaired);
		if (mints.length === 0) {
			return { entry, records: [] };
		}
		const records: TransformRecord[] = [
			{
				detail: `${mints.length} anchored: ${[...new Set(mints.map((m) => m.target))].join(', ')}`,
				rid: entry.rid,
				ruleId: RULE_ID,
			},
		];
		return {
			entry: { ...entry, content: { ...entry.content, senses } },
			minted: mints,
			records,
		};
	},
	id: RULE_ID,
	phase: 'text-repairs',
};

export { antecedentFor, mintOver, unlinkedBareAnaphor };
