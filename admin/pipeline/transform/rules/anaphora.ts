/**
 * `ib-yoma-2a` (batch-2 link spec §4 row 8): a bare anaphoric citation
 * — "Ib.", *ibidem*, "the same place as the one just named" — anchored
 * to a single fixed address, `Yoma 2a`, whatever place was actually
 * just named. The linker resolves anaphora against the preceding
 * citation, cannot resolve a Yerushalmi citation in that position, and
 * falls through to one sink.
 *
 * This is the batch's first RETARGET: unlike every rule shipped before
 * it, a correct target exists and the entry already holds it. The
 * antecedent anchor is entry-local by construction, so the repair
 * copies a target the input carries (spec §3.2 case 2) and never
 * invents an address. Where it cannot, it DECLINES — a decline is a
 * measurement, not a failure, and the counts are the row's write-back
 * (`data/patches/catalogue-audit/ib-yoma-2a.md`).
 *
 * ## The population
 *
 * `display.trim()` is exactly `Ib.` or `ib.` AND `data-ref` is exactly
 * `Yoma 2a`: **312 occurrences / 274 entries**, all in
 * `senses[].definition` and 0 in any other field `fieldsOf` walks
 * (measured; `h-cognate-self-link` is why scope is measured rather
 * than assumed). 312 reproduces the catalogued `corpusCount` to the
 * occurrence, from the row's own description read literally — no
 * predicate was tuned to reach it.
 *
 * The catalogued 312 is an OCCURRENCE count. `transform:count`
 * measures ENTRIES, so this rule reports 188 against it; the audit's
 * §7 carries the arithmetic.
 *
 * ## Why the sink is wrong in all 312
 *
 * For an `Ib.` to legitimately mean Yoma 2a the entry would have to
 * have cited Yoma 2a immediately before. Measured: **0 of 312** do.
 * And the mechanism separates cleanly — of the 260 bare anaphors
 * corpus-wide whose nearest citation antecedent is a Jerusalem Talmud
 * ref, **259 land on `Yoma 2a*`**; the rate for every other antecedent
 * work is 3.2%. The one exception is not a rival resolution — O00242's
 * anchor carries no `data-ref` at all. Full null model, frequency
 * argument and falsifiers: the audit's §2.
 *
 * ## Why COPY and not COMPOSE
 *
 * The batch's design assigned this row the `compose` shape (§3.2 case
 * 3: the antecedent supplies the work, the display supplies a new
 * locus). The measurement does not support it and this rule does not
 * use it. Every member's display is bare by the population's own
 * definition — but so is its surroundings: the immediate text token
 * FOLLOWING the anchor is a plain space in 299 of 312 and a
 * parenthetical gloss in the other 13, and **0 of 312 carry a locus
 * cue anywhere the gate could see one**. There is no remainder for
 * case 3 to license and none is wanted: a bare `Ib.` means *the same
 * place*, so the antecedent's address copied WHOLE is the correct
 * reading, and composing a different one would be a worse reading of
 * the same bytes. This rule therefore declares no `composed` claims.
 * Case 3's first real use falls to `ib-targum-work-loss`, whose
 * displays do carry a work.
 *
 * ## The antecedent, and the two restrictions the bytes forced
 *
 * The brief defined the antecedent as "the nearest preceding anchor in
 * the same definition whose target is not itself the fixed sink".
 * Reading the members added two restrictions, each of which prevents a
 * WRONG target rather than merely a missing one:
 *
 * 1. **A `Jastrow, …` anchor is not a citation.** It is a dictionary
 *    cross-reference; a headword is not a place, so copying one would
 *    make `Ib.` name something *ibidem* cannot name. 15 members have
 *    nothing else on offer and decline.
 * 2. **The nearest ANCHOR is not always the nearest CITATION.** In 63
 *    members Jastrow printed a citation between the anchored
 *    antecedent and the `Ib.` which the linker never anchored — A03095
 *    reads `…—Y. Yoma VI, 43ᵈ … Y. R. Hash. I, 57ᵃ bot. …` between an
 *    anchored `Aramaic Targum to Job 6:11` and the `Ib.`. Copying the
 *    anchor there writes a DIFFERENT WORK, and `link-target.ts` cannot
 *    catch it: the wrong value is in the entry's own input target set,
 *    which is precisely the "laundering between anchors" case its own
 *    blind-spot list records. So it has to be caught here.
 *    `INTERVENING_CITATION` is that check — syntactic, re-derived from
 *    the text on every corpus pass, with no rid list to go stale, and
 *    deliberately conservative: a Roman numeral in prose costs a
 *    decline, never a mislink.
 *
 * ## The decline census (accounts for the row's 312)
 *
 * ```
 * 312  population (§1 of the audit)
 * − 23  no preceding anchor at all
 * −  2  every preceding anchor is itself a sink member (N00819, R00635)
 * − 15  only `Jastrow, …` lexical antecedents (restriction 1)
 * − 63  an unanchored citation intervenes (restriction 2)
 * =209  RETARGET — 209 occurrences / 188 entries
 * ```
 *
 * Every decline has one root cause, which makes the 33% decline rate a
 * fact about the corpus rather than a weakness here: **the citation the
 * `Ib.` refers to exists in Jastrow's text but not as an anchor.**
 * Recovering it would mean parsing `Y. Ter. VIII, 46ᵇ bot.` into a
 * Sefaria address — the never-linked family, deferred by the batch's
 * §1 ruling, and inference rather than movement.
 *
 * ## What the repair does and does not achieve
 *
 * Validated against 1,880 bare anaphors OUTSIDE this population (the
 * audit's §3 control), on a range-safe comparison — an earlier,
 * folio-range-naive one understated every tier and is corrected in the
 * audit's §3.2:
 *
 * ```
 * 996  53.0%  byte-identical to the antecedent's target
 * 870  99.3%  cumulative: differ ONLY in the trailing segment
 *  11  99.8%  cumulative: same work, different folio
 *   3         different work — one genuine (A01334), two with an
 *             empty `data-ref` on the anaphor, i.e. no rival address
 * ```
 *
 * So copying whole is passage-exact and segment-approximate: it lands
 * the reader on the antecedent's own address, which is what "ib."
 * names, and differs from the linker's own answer in the trailing
 * segment about half the time. That remainder is Sefaria matching
 * quoted Hebrew to a segment, which cannot be reproduced from
 * entry-local data and must not be guessed. Against `Yoma 2a` — a
 * different tractate in a different Talmud — that is a correction
 * under any reading. It is not segment-perfect, and nothing here
 * claims it is.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { serialize, type Token, tokenize } from '../html.ts';
import { type Anchor, anchors, retarget } from '../links.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

// Hoisted per lint/performance/useTopLevelRegex.

/** A bare anaphoric display: `Ib.` or `ib.` and nothing else. Anchored
 * to nothing wider on purpose — `Ib. 35ᵃ`, `Ib. V, 1` and friends
 * carry their own locus, resolve correctly across the corpus, and are
 * no part of this row. `Ibid.`/`ibid.` ARE the same defect in a third
 * spelling but sit outside the catalogued 312 (3 occurrences, audit
 * §8); widening a predicate past the number it reproduces is what this
 * batch's lessons forbid, so they are recorded for the catalogue
 * instead of swept in here. */
const ANAPHOR = /^(?:Ib|ib)\.$/u;

/** The fixed address every member falls to. Exact, not a prefix: a
 * sibling arm of 52 anchors resolves to `Yoma 2a:N` — the identical
 * defect with a segment attached — and is catalogued nowhere (audit
 * §8), so this row does not claim it. `isSpentAnaphor` below DOES use
 * the prefix, for a different question. */
const SINK = 'Yoma 2a';

/** A dictionary cross-reference rather than a citation. */
const LEXICAL = 'Jastrow, ';

/** Must match an `id` in data/patches/patterns.jsonl. Named here
 * rather than read off `ibAnaphora.id` so the walk below does not
 * reference the rule object it is a part of. */
const RULE_ID = 'ib-yoma-2a';

/**
 * A citation Jastrow printed between the antecedent anchor and the
 * anaphor which the linker never anchored — in which case the nearest
 * ANCHOR is not the nearest CITATION and the antecedent is the wrong
 * one to copy (module doc, restriction 2).
 *
 * Four cues, each a typographic mark that appears in Jastrow's
 * citations and effectively nowhere else: a folio or column
 * superscript (`43ᵈ`, `Ib.ᶜ`), a chapter Roman numeral followed by a
 * comma (`VI,`), the `l. c.` back-reference, and a Midrash section
 * number (`s. 31`). Deliberately over-inclusive — 63 of 272 gaps trip
 * it, and hand-reading them found intervening citations in the great
 * majority and prose Roman numerals in the rest. The asymmetry is the
 * point: a false positive costs one decline, a false negative writes
 * a wrong work past a gate that cannot see it.
 *
 * NOT among the cues: `beg.`/`end.`/`top`/`bot.`, which trip on 92 of
 * the 272 gaps and are almost always the TAIL of the antecedent's own
 * citation ("Y. Ter. VIII, 46ᵃ bot.", where `bot.` sits after the
 * anchor's own `</a>`). Treating them as intervening citations would
 * decline a third of the population for evidence of the antecedent
 * this rule is about to copy.
 */
const INTERVENING_CITATION = /[ᵃᵇᶜᵈ]|\b[IVXLC]+,|\bl\.\s?c\.|\bs\.\s*\d/u;

/** Whether an anchor is one `retarget` will accept — the same three
 * refusals `links.ts` throws on, checked here so the predicate can
 * skip rather than crash. Mirrors `rules/unlink.ts`'s `usable`;
 * restated rather than imported because that copy is private to the
 * unlink family and this rule reads it for a different editor. */
function usable(anchor: Anchor): boolean {
	return !(anchor.malformed || anchor.interior) && anchor.close !== -1;
}

/** Whether this anchor is a member of the row: a bare anaphor pointing
 * at the sink. */
function isSinkMember(anchor: Anchor): boolean {
	return anchor.dataRef === SINK && ANAPHOR.test(anchor.display.trim());
}

/**
 * Whether this anchor is an anaphor that ALREADY failed into the sink
 * family — so it names no place of its own and cannot serve as an
 * antecedent.
 *
 * The prefix (`Yoma 2a` OR `Yoma 2a:N`) is wider than `isSinkMember`'s
 * exact match, and that width is load-bearing rather than tidy:
 * N01007's nearest preceding anchor is a bare `Ib.` resolving to
 * `Yoma 2a:8`, a member of the uncatalogued sibling arm. An exact
 * test would accept it as an antecedent and copy a target that is
 * itself the defect. It is the only such case in the corpus today, and
 * one is enough — the arm exists, so the guard has to cover it.
 */
function isSpentAnaphor(anchor: Anchor): boolean {
	return anchor.dataRef.startsWith(SINK) && ANAPHOR.test(anchor.display.trim());
}

/** Every TEXT token's value strictly between two token indices — the
 * span an unanchored citation would sit in. Mirrors `links.ts`'s
 * `displayOf` and `rules/unlink.ts`'s `leadOf`; neither reads a span
 * bounded on both sides, which is what restriction 2 needs. */
function textBetween(
	tokens: readonly Token[],
	from: number,
	to: number,
): string {
	let text = '';
	for (const token of tokens.slice(from, to)) {
		if (token.kind === 'text') {
			text += token.value;
		}
	}
	return text;
}

/**
 * The anchor whose target this anaphor should adopt, or `undefined`
 * when the entry holds none it may lawfully copy.
 *
 * Walks backwards from the anaphor through the same definition,
 * skipping anchors `retarget` could not have produced (`usable`) and
 * anchors that are themselves spent anaphora, and takes the first
 * remaining one that is a CITATION — a non-empty target that is not a
 * `Jastrow, …` cross-reference. Returns `undefined` when the text
 * between that citation and the anaphor holds an unanchored citation
 * of its own, since the antecedent is then not the nearest one.
 *
 * `list` must be the anchors of `tokens`, in document order, and
 * `at` the anaphor's index within it.
 *
 * `citation.close >= anchor.open` DECLINES rather than measuring an
 * empty gap. An earlier-opening anchor whose `</a>` lands after the
 * anaphor's `<a>` ENCLOSES it — anchors nest in this corpus, 477 pairs
 * in definition text — and `textBetween` over a backwards range
 * quietly returns `''`, so the gap check would pass VACUOUSLY on the
 * one shape it exists to catch. Measured 0 such pairs among all bare
 * anaphors corpus-wide (2026-08-23), so this guards a case the corpus
 * does not currently hold; it is here because a vacuous pass is worse
 * than a decline, and because `unlinkMatching`'s docstring records
 * what assuming anchors do not nest already cost this module once.
 */
function antecedentOf(
	tokens: readonly Token[],
	list: readonly Anchor[],
	at: number,
): Anchor | undefined {
	const anchor = list[at];
	if (anchor === undefined) {
		return;
	}
	const citation = list
		.slice(0, at)
		.reverse()
		.find(
			(prior) =>
				usable(prior) &&
				!isSpentAnaphor(prior) &&
				prior.dataRef !== '' &&
				!prior.dataRef.startsWith(LEXICAL),
		);
	if (citation === undefined || citation.close >= anchor.open) {
		return;
	}
	const gap = textBetween(tokens, citation.close + 1, anchor.open);
	return INTERVENING_CITATION.test(gap) ? undefined : citation;
}

/**
 * Retarget every repairable anaphor in one definition, returning the
 * new text and how many anchors moved.
 *
 * Anchors are derived ONCE and the indices reused across edits, which
 * is safe HERE and would not be in `rules/unlink.ts`: `retarget` maps
 * the token array and replaces one tag token's value in place, so the
 * array length never changes and no later index shifts. `unlink`
 * FILTERS two tokens out, which is why `unlinkMatching` has to
 * re-derive before every removal (see its docstring — a stale index
 * there left a stray `</a>` behind, in a nested pair, invisible to
 * every gate). The distinction is the editor, not the corpus: anchors
 * nest here (477 pairs in definition text), and nesting is exactly
 * what makes a removal shift a sibling's index and a value rewrite
 * not.
 *
 * The antecedent search reads `list` — the anchors as they were BEFORE
 * any edit in this definition — so a chain of anaphora all resolve
 * against the same pre-edit sequence rather than against each other's
 * fresh output. Both readings give the same answer, since
 * `isSpentAnaphor` skips an unrepaired member and a repaired one
 * carries the antecedent's own target, but only the pre-edit reading
 * says so without depending on the order edits happen to run in.
 */
function retargetAnaphora(definition: string): {
	moved: number;
	text: string;
} {
	const tokens = tokenize(definition);
	const list = anchors(tokens);
	let next: readonly Token[] = tokens;
	let moved = 0;
	list.forEach((anchor, at) => {
		if (!(usable(anchor) && isSinkMember(anchor))) {
			return;
		}
		const antecedent = antecedentOf(tokens, list, at);
		if (
			antecedent === undefined ||
			(antecedent.dataRef === anchor.dataRef && antecedent.href === anchor.href)
		) {
			return;
		}
		next = retarget(next, anchor, {
			dataRef: antecedent.dataRef,
			href: antecedent.href,
		});
		moved += 1;
	});
	return { moved, text: moved === 0 ? definition : serialize(next) };
}

/**
 * Rewrite every definition in the entry, recursing through nested
 * senses — `rules/unlink.ts`'s `unlinkOverDefinitions` walks the same
 * shape, and is not reused because it is built around an editor that
 * REMOVES anchors and reports `unlinks`. This rule removes none: the
 * anchor count is identical on both sides, so `unlinks` stays absent
 * and the gate's count invariant passes on equality rather than on a
 * declaration.
 *
 * Nothing is declared at all, in fact. Both written values come
 * verbatim off an anchor in the same entry's input, so `link-target.ts`
 * settles them by set membership (§3.2 cases 1–2) with no `composed`
 * claim; and `no-new-text.ts` strips tags before comparing, so an
 * attribute rewrite introduces no text and needs no `copied`.
 */
function retargetOverDefinitions(entry: SourceEntry): TransformResult {
	const records: TransformRecord[] = [];
	const walk = (senses: readonly SourceSense[]): SourceSense[] =>
		senses.map((sense) => {
			let { definition } = sense;
			if (definition !== undefined) {
				const { moved, text } = retargetAnaphora(definition);
				if (moved > 0) {
					definition = text;
					records.push({ detail: text, rid: entry.rid, ruleId: RULE_ID });
				}
			}
			return {
				...sense,
				...(definition === undefined ? {} : { definition }),
				...(sense.senses === undefined ? {} : { senses: walk(sense.senses) }),
			};
		});
	const rewritten = walk(entry.content.senses);
	return {
		entry:
			records.length === 0
				? entry
				: { ...entry, content: { ...entry.content, senses: rewritten } },
		records,
	};
}

/**
 * A bare `Ib.` retargeted from the `Yoma 2a` sink to the citation it
 * actually names — the nearest preceding citation anchor in the same
 * definition, copied whole (gate case 2). Declines where the entry
 * holds no anchor it may lawfully copy: 209 of 312 fire, 103 decline,
 * per the module doc's census.
 */
const ibAnaphora: Rule = {
	apply: retargetOverDefinitions,
	id: RULE_ID,
	phase: 'text-repairs',
};

export {
	ANAPHOR,
	antecedentOf,
	INTERVENING_CITATION,
	ibAnaphora,
	isSinkMember,
	isSpentAnaphor,
	usable,
};
