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
 *
 * The design named `ib-targum-work-loss` as case 3's first real use.
 * Task 8 measured that and it is wrong twice over: that row cannot
 * use case 3 at all (see the second half of this doc), and the first
 * real use turned out to be `sifre-ib-resolves-to-yalkut` — on a
 * single anchor.
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
 *
 * ---
 *
 * # `sifre-ib-resolves-to-yalkut` (batch-2 link spec §4 row 10)
 *
 * Task 8's second arm, and the batch's FIRST GENUINE gate case 3.
 * Jastrow writes `Sifré ib. N`; the linker reads the `ib. N` and
 * reuses the section number under the work it was already in, giving
 * `Yalkut Shimoni on Torah N`. The work label sits OUTSIDE the anchor,
 * which is why a display probe could not see the row and why the
 * predicate has to read the text before the tag.
 *
 * ## The population, and a correction to it
 *
 * Display trimmed is `ib. N` (or `Ib. N`) AND the text immediately
 * before the anchor ends in `Sifré`: **6 occurrences / 6 entries**,
 * every one of them landing on `Yalkut Shimoni on Torah` and none on
 * a Sifré work. That last figure is the null model's refutation —
 * had the resolver ever handled this shape, some of the 6 would
 * already be right — and it stands against the row's own clean
 * control, where the spelled-out form resolves correctly at scale
 * (`Sifrei Devarim` 402 anchors, `Sifrei Bamidbar` 193).
 *
 * The catalogued `corpusCount` is **5** (K00811, N00892, Q01325,
 * T00064, V00301). **E00476 is a sixth member the discovery probe
 * missed**: all five catalogued rids are preceded by `; Sifré ` and
 * E00476 by `.—Sifré `. It is a member by the row's own description,
 * and it is the only one of the six that can be repaired — so the
 * miss is not cosmetic, it is the whole of this arm's yield. Task 11
 * owns the write-back.
 *
 * ## Why COMPOSE here, where `ib-yoma-2a` copies whole
 *
 * `Ib.` alone means *the same place*, so the antecedent's address
 * copied whole is the right reading. `Sifré ib. 330` does not: the
 * display carries a locus of its own that the antecedent cannot
 * supply, which is precisely the condition §3.2 case 3 exists for.
 * The work half is copied WHOLE off the antecedent's target
 * (`Sifrei Devarim 309:6` minus its locus tail) and never assembled;
 * the locus half is the number already on the display. The claim
 * leaves the gate a `Sifrei Devarim 3` prefix and a `30` remainder,
 * both characters of which `ib. 330` shows. Run against
 * `checkLinkTargets` itself rather than reasoned about.
 *
 * ## The decline census (accounts for the row's 6)
 *
 * ```
 *   6  population
 * − 5  the entry holds no Sifré anchor at all
 * = 1  RETARGET — 1 occurrence / 1 entry (E00476)
 * ```
 *
 * The 5 all fail for one reason, and it is the same reason
 * `ib-yoma-2a` declines 103: the antecedent exists in Jastrow's text
 * but not as an anchor. Repairing them would mean turning the
 * abbreviation `Sifré` plus a book read off a *Yalkut* anchor's
 * DISPLAY (`Yalk. Deut. 874`) into the work name `Sifrei Devarim` —
 * inventing a string no anchor in the entry supplies. That is
 * inference rather than movement, and §1's ruling puts it with the
 * never-linked family. Declining leaves a wrong link standing, which
 * is worth naming plainly: the alternative considered was to UNLINK
 * the 5, as `geresh.ts` and `misc-links.ts` did when retarget could
 * not reach most of their members. It was not taken because the
 * acceptance criterion for this row asks for a decline in exactly
 * this case, and because an unlink here destroys the section number's
 * only surviving machine-readable trace. Recorded for the maintainer
 * rather than decided here.
 *
 * ## Task 8's other row is NOT in this module
 *
 * `ib-targum-work-loss` (9 occurrences / 8 entries) was read in full
 * and every one confirms the defect, but it is not registered. Its
 * correct target — the antecedent Targum work plus this anchor's OWN
 * already-correct plain-book locus — recombines two input targets,
 * a shape §3.2 has no case for; `checkLinkTargets` rejects all 9. The
 * obstruction is general rather than particular to the row: Jastrow's
 * displays are Roman-numeral abbreviations (`Deut. VI, 22`) and
 * Sefaria's refs are Arabic (`Onkelos Deuteronomy 6:22`), so case 3's
 * display-remainder test can never license a locus in this corpus.
 * Even the one member whose antecedent shares its book fails, on the
 * characters `6` and `:` alone. `task-8-report.md` carries the gate's
 * verbatim verdicts.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { serialize, type Token, tokenize } from '../html.ts';
import { type Anchor, anchors, retarget, type Target } from '../links.ts';
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

/** Must match an `id` in data/patches/patterns.jsonl. */
const SIFRE_RULE_ID = 'sifre-ib-resolves-to-yalkut';

/**
 * The Sifré work family as Sefaria spells it.
 *
 * A PREFIX, not an enumerated list of works, and the difference is the
 * 2026-08-23 loud-on-drift ruling: the corpus holds exactly two
 * (`Sifrei Devarim`, 402 anchors; `Sifrei Bamidbar`, 193) and
 * `anaphora.test.ts` pins that EVERY `Sifr…` target in the corpus
 * starts with this string. A third work — Sefaria spells the Torat
 * Kohanim `Sifra, …` — appearing in a re-fetch fails that test rather
 * than silently sitting outside an arm that would then under-fire.
 */
const SIFRE_WORK = 'Sifrei ';

/** The work label Jastrow prints OUTSIDE the anchor, immediately
 * before it — the whole reason a display probe could not see this row.
 * Both spellings occur in the corpus; the acute is by far the commoner
 * and the bare `e` is accepted so an OCR variant does not slip the
 * arm. */
const SIFRE_LABEL = /Sifr[eé]\s*$/u;

/** A NUMBERED anaphor display: `ib. 330`. Unlike `ANAPHOR` above, the
 * display carries a locus of its own — the section number the linker
 * reused under the wrong work — and that number is the only part of
 * the corrected target this arm assembles. */
const SIFRE_ANAPHOR = /^[Ii]b\.\s+(?<number>\d+)$/u;

/**
 * A Sefaria locus tail on a `data-ref` (`… 309:6`) and on the matching
 * `href` (`….309.6`). Stripping one off the antecedent's own target is
 * how the work half is taken WHOLE rather than assembled — spec §3.2
 * case 3's first constraint.
 *
 * The optional `-…` arm is not speculative: 5 of the corpus's 402
 * `Sifrei Devarim` anchors carry a RANGE (`Sifrei Devarim 301:3-4`,
 * `/Sifrei_Devarim.301.3-4`), found by the population pin in
 * `anaphora.test.ts` failing on the narrower pattern. No member's
 * antecedent is one today, and `repairSifreAnaphor` would have
 * DECLINED rather than mis-stripped — but declining there would be a
 * silent under-fire, since a range locus leaves the work half every
 * bit as copyable. The test pins both spellings so a re-fetch that
 * introduces a third fails loudly.
 */
const REF_LOCUS = /\s\d+(?::\d+)*(?:-\d+(?::\d+)*)?$/u;
const HREF_LOCUS = /\.\d+(?:\.\d+)*(?:-\d+(?:\.\d+)*)?$/u;

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

/** The default `accept`: a CITATION — a non-empty target that is not a
 * `Jastrow, …` cross-reference. Named so the two arms' antecedent
 * tests read as two values of one parameter rather than as two
 * walks. */
function isCitation(anchor: Anchor): boolean {
	return anchor.dataRef !== '' && !anchor.dataRef.startsWith(LEXICAL);
}

/** A candidate antecedent for the Sifré arm: an anchor the linker
 * already resolved to a Sifré work. Narrower than `isCitation` on
 * purpose — this arm's anaphor NAMES its work in the running text, so
 * the nearest citation of ANY work is not its antecedent and copying
 * one would repeat the very error the row is about. */
function isSifreCitation(anchor: Anchor): boolean {
	return anchor.dataRef.startsWith(SIFRE_WORK);
}

/**
 * The anchor whose target this anaphor should adopt, or `undefined`
 * when the entry holds none it may lawfully copy.
 *
 * Walks backwards from the anaphor through the same definition,
 * skipping anchors `retarget` could not have produced (`usable`) and
 * anchors that are themselves spent anaphora, and takes the first
 * remaining one `accept` admits. Returns `undefined` when the text
 * between that citation and the anaphor holds an unanchored citation
 * of its own, since the antecedent is then not the nearest one.
 *
 * `accept` is a PARAMETER rather than two copies of this walk because
 * the arms differ only in which prior anchor counts: `ib-yoma-2a`'s
 * bare `Ib.` names no work, so any citation will do (`isCitation`,
 * the default, which keeps that rule's behaviour byte-identical);
 * `sifre-ib-resolves-to-yalkut`'s `Sifré ib. N` names its work in the
 * running text, so only a Sifré anchor will (`isSifreCitation`).
 * Everything else here — the `usable` skip, the spent-anaphor skip,
 * the enclosure refusal, the gap-purity decline — is shared, and was
 * paid for once by Task 7's corpus reading.
 *
 * The gap test applies to BOTH arms even though the Sifré arm walks
 * past anchors of other works to reach its antecedent. It costs that
 * arm nothing measured (E00476's gap, which spans an intervening
 * anchored `Yalk. ib. 542`, trips none of the four cues) and it still
 * catches the shape that matters there: an unanchored Sifré citation
 * printed between the anchored one and the anaphor, which would make
 * the anchored one the wrong section to count from.
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
	accept: (anchor: Anchor) => boolean = isCitation,
): Anchor | undefined {
	const anchor = list[at];
	if (anchor === undefined) {
		return;
	}
	const citation = list
		.slice(0, at)
		.reverse()
		.find((prior) => usable(prior) && !isSpentAnaphor(prior) && accept(prior));
	if (citation === undefined || citation.close >= anchor.open) {
		return;
	}
	const gap = textBetween(tokens, citation.close + 1, anchor.open);
	return INTERVENING_CITATION.test(gap) ? undefined : citation;
}

/** One declared composition, mirroring `TransformResult.composed`'s
 * element shape. Declared locally rather than exported from
 * `types.ts`, which spells it inline. */
interface Compose {
	from: string;
	target: string;
}

/** What one arm wants written on one anchor: the new target, and the
 * `composed` claim the gate needs to license it — absent when the
 * target is copied WHOLE off an input anchor (spec §3.2 case 2), which
 * needs no declaration and is the stronger of the two. */
interface Repair {
	claim?: Compose;
	target: Target;
}

/** An arm's whole per-anchor decision: `undefined` to decline. Takes
 * the pre-edit tokens and anchor list so it can run `antecedentOf`
 * and read the text around the anchor. */
type Repairer = (
	tokens: readonly Token[],
	list: readonly Anchor[],
	at: number,
) => Repair | undefined;

/**
 * Retarget every repairable anaphor in one definition, returning the
 * new text, how many anchors moved, and any claims the arm made.
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
 *
 * A `repair` that returns the anchor's own current target is treated
 * as a decline — the arms differ in how they build a target and not in
 * what a no-op means, so the check sits here rather than in each arm.
 */
function retargetAnaphora(
	definition: string,
	repair: Repairer,
): {
	claims: Compose[];
	moved: number;
	text: string;
} {
	const tokens = tokenize(definition);
	const list = anchors(tokens);
	let next: readonly Token[] = tokens;
	let moved = 0;
	const claims: Compose[] = [];
	list.forEach((anchor, at) => {
		if (!usable(anchor)) {
			return;
		}
		const found = repair(tokens, list, at);
		if (
			found === undefined ||
			(found.target.dataRef === anchor.dataRef &&
				found.target.href === anchor.href)
		) {
			return;
		}
		next = retarget(next, anchor, found.target);
		if (found.claim !== undefined) {
			claims.push(found.claim);
		}
		moved += 1;
	});
	return { claims, moved, text: moved === 0 ? definition : serialize(next) };
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
 * `ib-yoma-2a` declares nothing at all: both its written values come
 * verbatim off an anchor in the same entry's input, so
 * `link-target.ts` settles them by set membership (§3.2 cases 1–2)
 * with no `composed` claim. The Sifré arm below does declare, and
 * `composed` is carried up from the per-definition walk — left ABSENT
 * rather than set to `[]` when no claim was made, so a copy-whole arm
 * reads exactly as it did before this parameter existed.
 *
 * `no-new-text.ts` strips tags before comparing, so an attribute
 * rewrite introduces no text and neither arm needs `copied`.
 */
function retargetOverDefinitions(
	entry: SourceEntry,
	ruleId: string,
	repair: Repairer,
): TransformResult {
	const records: TransformRecord[] = [];
	const composed: Compose[] = [];
	const walk = (senses: readonly SourceSense[]): SourceSense[] =>
		senses.map((sense) => {
			let { definition } = sense;
			if (definition !== undefined) {
				const { claims, moved, text } = retargetAnaphora(definition, repair);
				if (moved > 0) {
					definition = text;
					composed.push(...claims);
					records.push({ detail: text, rid: entry.rid, ruleId });
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
		...(composed.length === 0 ? {} : { composed }),
		entry:
			records.length === 0
				? entry
				: { ...entry, content: { ...entry.content, senses: rewritten } },
		records,
	};
}

/** `ib-yoma-2a`'s per-anchor decision: a bare `Ib.` on the sink adopts
 * the nearest preceding citation's target WHOLE — no claim, gate case
 * 2. */
const repairBareAnaphor: Repairer = (
	tokens: readonly Token[],
	list: readonly Anchor[],
	at: number,
): Repair | undefined => {
	const anchor = list[at];
	if (anchor === undefined || !isSinkMember(anchor)) {
		return;
	}
	const antecedent = antecedentOf(tokens, list, at);
	return antecedent === undefined
		? undefined
		: { target: { dataRef: antecedent.dataRef, href: antecedent.href } };
};

/**
 * Whether this anchor is a member of the Sifré row: Jastrow printed
 * `Sifré` immediately before it, the display is a numbered anaphor
 * (`ib. 330`), and the linker did NOT resolve it to a Sifré work.
 *
 * All three conditions are syntactic and re-derived from the text on
 * every corpus pass — no rid list to go stale. Measured 2026-08-23:
 * the first two alone select **6 occurrences / 6 entries** corpus-wide
 * and **all 6** land on `Yalkut Shimoni on Torah`, 0 on any Sifré
 * work. The third condition therefore removes nothing today; it is
 * here because a member the linker gets RIGHT must not be moved, and
 * because it states the defect rather than the sink — `ib-yoma-2a`'s
 * fixed-address predicate is the shape this row is deliberately not
 * copying, since the wrong target here varies with the section number.
 *
 * The catalogued `corpusCount` is **5**, and the sixth (E00476) is a
 * real member the discovery probe missed: all five catalogued rids are
 * preceded by `; Sifré ` and E00476 by `.—Sifré `. Task 11 owns the
 * write-back.
 */
function isSifreMember(lead: string, anchor: Anchor): boolean {
	return (
		SIFRE_ANAPHOR.test(anchor.display.trim()) &&
		SIFRE_LABEL.test(lead) &&
		!anchor.dataRef.startsWith(SIFRE_WORK)
	);
}

/**
 * `sifre-ib-resolves-to-yalkut`'s per-anchor decision, and the batch's
 * first genuine gate case 3.
 *
 * The work half is copied WHOLE off the antecedent's own target —
 * `Sifrei Devarim 309:6` minus its locus tail — and the locus half is
 * the number the display already shows. So the claim
 * `{from: 'Sifrei Devarim 309:6', target: 'Sifrei Devarim 330'}`
 * leaves the gate a common prefix of `Sifrei Devarim 3` and a
 * remainder of `30`, both characters of which the display `ib. 330`
 * supplies; the `href` reduces identically
 * (`/Sifrei_Devarim.309.6` → `/Sifrei_Devarim.330`, remainder `30`).
 * Verified against `checkLinkTargets` itself, not reasoned about.
 *
 * DECLINES when the entry holds no Sifré anchor — 5 of the 6 members.
 * Their correct target would have to be assembled from the
 * abbreviation `Sifré` plus a book read off a *Yalkut* anchor's
 * DISPLAY (`Yalk. Deut. 874` → `Sifrei Devarim`), which invents a work
 * name no anchor in the entry supplies. That is inference rather than
 * movement, and the batch's §1 ruling puts it with the never-linked
 * family. A decline is the measurement, not a shortfall.
 *
 * Also declines if the antecedent's target carries no locus tail to
 * strip, which would mean the work half could not be taken whole. No
 * member does that today; the guard is here so the arm fails loudly
 * rather than composing off a shape it never read.
 */
const repairSifreAnaphor: Repairer = (
	tokens: readonly Token[],
	list: readonly Anchor[],
	at: number,
): Repair | undefined => {
	const anchor = list[at];
	if (anchor === undefined) {
		return;
	}
	const number = SIFRE_ANAPHOR.exec(anchor.display.trim())?.groups?.['number'];
	if (
		number === undefined ||
		!isSifreMember(textBetween(tokens, 0, anchor.open), anchor)
	) {
		return;
	}
	const antecedent = antecedentOf(tokens, list, at, isSifreCitation);
	if (antecedent === undefined) {
		return;
	}
	const work = antecedent.dataRef.replace(REF_LOCUS, '');
	const hrefWork = antecedent.href.replace(HREF_LOCUS, '');
	if (work === antecedent.dataRef || hrefWork === antecedent.href) {
		return;
	}
	const dataRef = `${work} ${number}`;
	return {
		claim: { from: antecedent.dataRef, target: dataRef },
		target: { dataRef, href: `${hrefWork}.${number}` },
	};
};

/**
 * A bare `Ib.` retargeted from the `Yoma 2a` sink to the citation it
 * actually names — the nearest preceding citation anchor in the same
 * definition, copied whole (gate case 2). Declines where the entry
 * holds no anchor it may lawfully copy: 209 of 312 fire, 103 decline,
 * per the module doc's census.
 */
const ibAnaphora: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		retargetOverDefinitions(entry, RULE_ID, repairBareAnaphor),
	id: RULE_ID,
	phase: 'text-repairs',
};

/**
 * `Sifré ib. N` retargeted off `Yalkut Shimoni on Torah N` and onto
 * the Sifré work the entry's own input names, composed from that
 * work and the display's own section number (gate case 3). 1 of 6
 * fires; the other 5 hold no Sifré anchor and decline. See
 * `repairSifreAnaphor`.
 */
const sifreAnaphora: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		retargetOverDefinitions(entry, SIFRE_RULE_ID, repairSifreAnaphor),
	id: SIFRE_RULE_ID,
	phase: 'text-repairs',
};

export {
	ANAPHOR,
	antecedentOf,
	HREF_LOCUS,
	INTERVENING_CITATION,
	ibAnaphora,
	isCitation,
	isSifreCitation,
	isSifreMember,
	isSinkMember,
	isSpentAnaphor,
	REF_LOCUS,
	SIFRE_ANAPHOR,
	SIFRE_LABEL,
	SIFRE_WORK,
	sifreAnaphora,
	textBetween,
	usable,
};
