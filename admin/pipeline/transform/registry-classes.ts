/**
 * The registry's rule classes, shared by the two halves of the
 * registry-order check.
 *
 * `registry.order.test.ts` (unit tier) asserts the ORDER the classes
 * imply: every registered rule is classified, unlink rules precede the
 * rules that read a neighbour's target, and the direction pins.
 * `registry.order.corpus.test.ts` (run by `bun run
 * transform:invariants`) EARNS membership over all 32,512 entries: a
 * rule is in `UNLINK` because it removes an anchor there, not because
 * a comment says so.
 *
 * The classes live here rather than in either test so the order
 * assertions run on every `bun qa` without reading the source data.
 */
import type { SourceEntry } from '../body/types.ts';
import type { TagToken } from './html.ts';
import { DIR_RTL, opensScope, tokenize } from './html.ts';
import { fieldsOf } from './no-new-text.ts';

/** Rules that REMOVE an anchor, keeping its display text (link spec
 * §2). Every one of them can destroy an antecedent a retarget rule
 * would otherwise read. */
const UNLINK = new Set([
	'apparatus-cite-linked-as-scripture',
	'ellipsis-fragment-anchored',
	'geresh-letter-numeral-mislink',
	// Batch 4's two doubled-anchor rows. Both drop the OUTER layer of a
	// pair sharing one target, so both declare `unlinks` — and rules 1
	// and 4 then require them above every retarget and every wrap rule,
	// which is why they are registered where they are and not beside
	// the rest of their batch.
	//
	// Listing them here is a CLAIM, not an exemption: the corpus pass
	// in `registry.order.corpus.test.ts` asserts this literal set equals the
	// rules that ever declare an anchor removal across all 32,512
	// entries, so a name that does not belong — or one missing — fails
	// there. The corpus pass FALSIFIES this list; it does not build it.
	'nested-anchor-swallows-punctuation',
	'nonsense-dup-anchor',
	'plural-to-feminine-final-letter-mislink',
	'prefixed-geresh-abbrev-mislink',
	'rabbi-name-linked-as-bible-book',
	// Batch 7's two duplication rules. They are in this set because the
	// the corpus pass in `registry.order.corpus.test.ts` FALSIFIES the list — they declare `unlinks`, so
	// they must be named here — but they are not unlinks in the sense
	// the docstring above describes: they do not keep the display text,
	// they delete the whole duplicated run and the anchor inside it.
	'adjacent-verbatim-repetition',
	'duplicated-definition-opening-run',
]);

/** Rules that WRITE a link target sourced from another anchor in the
 * same entry — gate cases 2, 3 and 4. `registry.ts` calls these
 * retargets; the link spec's §4 table calls the shape "compose". Same
 * set either way. */
const RETARGET = new Set([
	'ib-targum-work-loss',
	'ib-yoma-2a',
	'sifre-ib-resolves-to-yalkut',
]);

/** Rules that neither remove an anchor nor write a target, so rule 1
 * says nothing about where they sit. The RTL trio belongs in `WRAP`
 * rather than here, because rule 4 DOES say where it sits and a set
 * nothing pins is a set a fourth wrap rule can dodge.
 * `shuruk-as-yod-display-corruption` edits DISPLAY text inside an
 * anchor whose target is already correct and leaves every
 * `href`/`data-ref` byte-identical; `ascii-quote-as-gershayim-in-body`
 * repairs a glyph in document text only, every `<…>` tag coming
 * through byte-identical — which is exactly what separates it from its
 * own twin in `GLYPH` below.
 *
 * THE SEAM RULES ARE THIS SET'S REAL TEST. 110 of their seams sit
 * directly against an anchor's closing tag — 57 `</a><i>` and 53
 * `)</a><i>` — so "does not move a target" is a claim about markup
 * they demonstrably edit ADJACENT to, not one they are trivially
 * incapable of breaking, and a link regression that every per-rule
 * measurement missed is exactly the failure this set risks. The
 * corpus pass in `registry.order.corpus.test.ts` is what sees it.
 *
 * Rule 1 says nothing about where any of them sit, but plenty else
 * does: the measured constraints that order them among THEMSELVES
 * live in `registry.ts`'s own block comments, because they are not
 * about unlinks and retargets at all.
 *
 * Membership here is EARNED rather than declared: the corpus pass
 * in `registry.order.corpus.test.ts` checks that no rule in this set ever
 * declares an anchor removal and that none of them changes a single
 * `href` or `data-ref` anywhere in 32,512 entries. */
const NEITHER = new Set([
	'anchor-italic-no-space',
	// Replaces a geresh plus an ASCII apostrophe with one gershayim in
	// DOCUMENT TEXT; measured
	// over all 32,512 entries, 0 of its 25 occurrences sit inside a
	// `<…>` interior, so no tag byte moves, no anchor is removed and no
	// target is written. That is the rule's own docstring claim, and
	// putting it here is what makes the corpus pass in `registry.order.corpus.test.ts` EARN it
	// rather than take the docstring's word — which is the whole point
	// of this set.
	'geresh-apostrophe-as-gershayim',
	// Batch 10. `impossibleDagesh` swaps the letter under a dagesh that
	// cannot be there; measured, 0 of its 19 candidates sit inside a tag
	// and 0 in a headword, so it writes no target and removes no anchor.
	// `FIELD` is not open to it — it edits definitions, which are full
	// of tags.
	'impossible-dagesh',
	// Batch 6b's structural rule. It edits a `definition` — so `FIELD`,
	// whose members' fields never hold a tag, is not open to it — and it
	// removes no anchor and writes no target, which is what this set
	// asserts and the corpus pass in `registry.order.corpus.test.ts` earns. It is also the only
	// member that runs in a different PHASE from the rest.
	'stem-head-marker-chop',
	// Batch 6c's structural rule, and the second member from that
	// phase. It moves a definition's opening label into
	// `grammar.verbal_stem` and the rest into a child sense — the
	// anchors inside that text move WITH it, none is removed, and no
	// `href` or `data-ref` is rewritten, which is what the corpus pass
	// in `registry.order.corpus.test.ts` earns. `FIELD` is not open to it for the same reason as its
	// phase-mate: the field it edits is full of tags.
	'stranded-stem-head',
	// Batch 7's structural rule, and the third from that phase. It
	// moves ONE em dash from the end of a definition into the next
	// sibling's `number` — a field that holds no markup at all — so no
	// anchor is touched, none removed and no target written, which the
	// the corpus pass in `registry.order.corpus.test.ts` earns. `FIELD` is not open to it for the same
	// reason as both phase-mates: the field it trims is full of tags.
	'trailing-em-dash-tail',
	// Batch 10's other target-free rule. `vkhGereshRestore` mints one
	// geresh after a bare `וכ`; measured, 0 of its 11 sit inside a tag
	// and 0 in a headword.
	'vkh-geresh-loss',
	// Batch 7's minting rule, and the fourth member from the structural
	// phase. It writes ONE period before a section head and touches
	// nothing else — no anchor removed, no `href` or `data-ref` written,
	// which is what this set asserts and the corpus pass in `registry.order.corpus.test.ts` earns.
	// `FIELD` is not open to it for the same reason as its phase-mates:
	// the field it edits is full of tags.
	'section-break-terminator-loss',
	// Batch 7's last rule, and the fifth from the structural phase. It
	// writes an em dash into a sense `number` — a field holding no
	// markup at all — so no anchor is touched, none removed and no
	// target written, which the corpus pass in `registry.order.corpus.test.ts` earns.
	'continuation-marker-em-dash-loss',
	// Batch 8's minting rule. It splices `v. ` into a `definition`
	// immediately BEFORE an anchor's opening tag and carries every other
	// byte through untouched, so the anchor is neither removed nor
	// retargeted and no `href` or `data-ref` is written — which is what
	// this set asserts and the corpus pass in `registry.order.corpus.test.ts` earns. `FIELD` is not
	// open to it: the field it edits is, by the rule's own predicate,
	// one that holds a tag.
	'see-particle-lost',
	// THE ANCHOR-BOUNDARY FOUR are this set's other hard case. They
	// move one of the anchor's own tags across the text beside it —
	// `</a>` across a `)`, a `<sup>` run or a digit, and in
	// `open-paren-in-anchor-display` the OPENING tag across a `(`, the
	// opposite polarity in the opposite tag — so "removes no anchor and
	// writes no target" is a claim about markup they demonstrably
	// rewrite INSIDE, not one they are incapable of breaking. The
	// corpus pass in `registry.order.corpus.test.ts` earns it: every
	// anchor's parsed `href`/`data-ref` pair is compared before and
	// after over all 32,512 entries.
	'anchor-swallows-close-paren',
	'ascii-quote-as-gershayim-in-body',
	'citation-number-truncated-outside-anchor',
	'em-dash-section-break-in-own-italic',
	'emphasis-run-edge-space',
	'geresh-abbrev-space-loss',
	'italic-close-paren-nospace',
	'italic-lone-punctuation',
	'italic-swallowed-terminal-period',
	'italic-swallows-close-paren',
	'label-period-outside-italic',
	'open-paren-in-anchor-display',
	'paren-tag-no-space',
	'shuruk-as-yod-display-corruption',
	'superscript-subsection-stranded-outside-anchor',
	'trailing-whitespace-definition',
	'translit-italic-space-loss',
]);

/** Rules that MOVE `dir="rtl"` wrapper markup — the subject of rule 4's
 * second half, and a set rather than a literal so that a fourth wrap
 * rule cannot land in `NEITHER`, satisfy the exhaustiveness assertion
 * and leave rule 4 passing vacuously above the unlinks.
 *
 * Like `UNLINK`, membership is EARNED over all 32,512 entries, and by
 * the conjunction the rtl module already claims for itself: "They move
 * wrappers; the text bytes are untouched" (`rules/rtl.ts`). So a WRAP
 * rule is one that, somewhere in the corpus,
 *
 *   (a) changes how many characters sit under a `<span dir="rtl">`
 *       scope, AND
 *   (b) never changes the tag-stripped text, in any entry.
 *
 * Both halves are load-bearing, and (b) carries MORE of the weight
 * now that (a) is position-sensitive. Measured over the corpus: under
 * a plain character-count signature (a) alone admitted the trio plus
 * `geresh-abbrev-space-loss`; under the position signature it
 * admits the trio plus SEVEN — every seam rule that inserts or deletes
 * a space, because shifting the stripped text shifts every rtl offset
 * after it. All seven are excluded by (b), and the set is unchanged,
 * but a future weakening of (b) would now over-collect badly rather
 * than by one. (b) alone, meanwhile, admits every unlink rule.
 *
 * Together they measure exactly the trio, and they measure the
 * PROPERTY rather than the names: a fourth rule that moves rtl
 * wrappers joins this set or fails the corpus test in `registry.order.corpus.test.ts`. The
 * conjunction's own blind spot, stated rather than left to be found: a
 * rule that moves a wrapper AND edits text in the same pass fails (b)
 * and would be missed. No shipped rule does both, and the two classes
 * have stayed disjoint through four batches, but that is a fact about
 * today's rules and not a property of the measurement. `dir="rtl"` on an ANCHOR is deliberately not counted — an
 * unlink rule removing `<a dir="rtl">` changes rtl coverage without
 * being a wrap rule, and rule 4 is about the two classes being
 * distinct. */
const WRAP = new Set([
	'bare-rtl-hebrew',
	'latin-token-inside-rtl-span',
	'redundant-outer-rtl-span',
]);

/** Rules that rewrite a link target IN PLACE, by glyph substitution
 * on the anchor's OWN bytes — gate case 5, and a fourth class rather
 * than a corner of `NEITHER` because these rules DO write a target.
 *
 * Rule 1 still says nothing about where they sit, and the reason is
 * the source of the target rather than the fact of writing one: a
 * retarget adopts a NEIGHBOURING anchor, which an unlink rule may be
 * about to delete, while a glyph correction reads only the anchor it
 * is repairing. There is no antecedent to be handed a wrong address
 * by. The registry appends the pair last anyway (see `registry.ts`),
 * and that placement is measured free — moving the pair to the front
 * of `RULES` leaves all 32,512 entries byte-identical, and the pair
 * fires on the same 1,386 / 85 entries composed as it does alone. */
const GLYPH = new Set(['gershayim-breaks-ref-attribute']);

/** Rules that RESTORE a link target by relocating bytes inside the
 * anchor's own damaged tag — gate case 6, and a fifth class on exactly
 * the reasoning that made `GLYPH` a fourth. These rules DO write a
 * target, so `NEITHER` is false of them; they adopt it from no
 * neighbour, so `RETARGET` is false too.
 *
 * Rule 1 says nothing about where they sit, for `GLYPH`'s reason — a
 * restoration reads only the anchor it is repairing, so there is no
 * antecedent an unlink rule could destroy underneath it. Something
 * else does: `unterminatedHref` runs FIRST in `RULES`, because the
 * damage it repairs makes the tokenizer read every following anchor as
 * `interior` and both editors refuse those. That is a placement
 * argument about the PARSER rather than about targets, so it lives in
 * `registry.ts`'s own block and not in one of the four rules here.
 *
 * Membership is EARNED exactly as `GLYPH`'s is, and by the same
 * mechanism: a rule that writes a target this way MUST declare
 * `restored` or `run.ts`'s gate refuses it, so the corpus pass in `registry.order.corpus.test.ts`
 * asserts this literal set equals the rules that ever declare one. */
const RESTORE = new Set(['unterminated-href-swallows-closing-tag']);

/** Rules that MINT a link target from two the entry's input holds,
 * corroborated by a sibling anchor's printed digits — gate case 7, and
 * a sixth class on the reasoning that made `GLYPH` a fourth and
 * `RESTORE` a fifth.
 *
 * `NEITHER` is false of these: they write a target, and a target the
 * entry never held at that. `RETARGET` is false too, and this is the
 * closest of the six calls. A retarget ADOPTS a neighbouring anchor's
 * whole target; `toseftaPrimaryHalakha` assembles one — the primary's
 * own chapter plus the variant's halakha — that no anchor in the entry
 * carries. Rule 1's hazard nevertheless applies in full: the
 * corroborating sibling is a NEIGHBOUR, and an unlink rule that deleted
 * it would leave this rule reading a different anchor as the variant.
 * So this set sits under rule 1 beside `RETARGET` rather than being
 * exempted the way `GLYPH` and `RESTORE` are, and the ordering assertion in `registry.order.test.ts`
 * asserts it over both sets.
 *
 * Membership is EARNED exactly as `GLYPH`'s and `RESTORE`'s are: a rule
 * that mints this way MUST declare `corroborated` or `run.ts`'s gate
 * refuses it, so the corpus pass in `registry.order.corpus.test.ts` asserts this literal set equals
 * the rules that ever declare one. */
const CORROBORATE = new Set(['tosefta-variant-chapter-halakha-loss']);

/**
 * Rules that write a target naming a headword belonging to ANOTHER
 * ENTRY of the dictionary — link-target gate case 8. A ninth class,
 * on the reasoning that made `RESTORE` a fifth and `CORROBORATE` a
 * sixth: a differently-shaped declaration earns its own set rather
 * than stretching a neighbouring one.
 *
 * IT IS NOT `RETARGET`, and the distinction is the whole of case 8. A
 * retarget ADOPTS a target some anchor of this entry already carries.
 * This names one NO ANCHOR HERE CARRIES and the entry cannot show — a
 * `v. sub` stub holds only an abbreviation of its target, which is
 * exactly why every case before 8 reads the completion as a
 * fabrication. Nor is it `CORROBORATE`: that assembles a target from
 * two the input holds plus a sibling's printed digits, all of it
 * evidence inside the entry.
 *
 * **EXEMPT FROM RULE 1, on `GLYPH` and `RESTORE`'s reasoning rather
 * than `RETARGET`'s and `CORROBORATE`'s.** Rule 1's hazard is an unlink
 * rule deleting the ANTECEDENT a later rule reads, leaving it to read
 * some other anchor as the antecedent. This rule reads no neighbour at
 * all: its table is keyed on the entry's rid AND the anchor's exact
 * current target, so an unlink that removed that anchor makes it match
 * nothing and no-op. It cannot be handed a wrong address, because it is
 * not reading an address from the entry.
 *
 * Membership is EARNED exactly as `GLYPH`'s, `RESTORE`'s and
 * `CORROBORATE`'s are: case 8 licenses such a target only against a
 * `vouched` declaration, so a rule that writes one and does not declare
 * it is refused by `run.ts` rather than quietly classified here. */
const VOUCH = new Set(['v-sub-redirect-stub-mislink']);

/**
 * Rules that repair a link target's POINTING and nothing else —
 * link-target gate case 9. A tenth class, on the reasoning that made
 * `VOUCH` a ninth: a differently-shaped declaration earns its own set
 * rather than stretching a neighbouring one.
 *
 * `NEITHER` is false of them — they write a target. `RETARGET` is false
 * too, and here the call is not close at all: a retarget adopts a
 * NEIGHBOURING anchor's whole target, while these two rewrite the
 * anchor's OWN, leaving its consonants byte-identical and moving or
 * adding a mark.
 *
 * **EXEMPT FROM RULE 1, on `GLYPH` and `RESTORE`'s reasoning.** Rule 1
 * guards against an unlink rule deleting the ANTECEDENT a later rule
 * reads. These read no neighbour: the repair is a function of the
 * target's own bytes, so an unlink that removed some other anchor
 * changes nothing about what they write.
 *
 * Membership is EARNED exactly as the four sets above earn theirs: case
 * 9 licenses such a target only against a `pointed` declaration, so a
 * rule that writes one and does not declare it is refused by `run.ts`
 * rather than quietly classified here. */
const POINT = new Set(['holam-migrated-off-mater-vav', 'shin-sin-dot-drop']);

/**
 * Rules that CREATE an anchor, copying its target whole from a
 * neighbouring one — link-target gate case 10. An eleventh class, on
 * the reasoning that made `VOUCH` a ninth and `POINT` a tenth: a
 * differently-shaped declaration earns its own set rather than
 * stretching a neighbouring one.
 *
 * `NEITHER` is false of them — they write a target. `RETARGET` is
 * false too, and the distinction is the whole of case 10: a retarget
 * changes an anchor the entry ALREADY HAS, while this adds one the
 * entry did not have. Every case before 10 refuses that outright, at
 * the counting invariant rather than at the target, because the target
 * itself is a plain case-2 copy.
 *
 * **SUBJECT TO RULE 1, not exempt from it — unlike `VOUCH` and
 * `POINT`.** Those two read no neighbour: one is keyed on a frozen
 * table, the other on the target's own bytes. This rule's whole
 * mechanism is reading a NEIGHBOURING anchor as the antecedent an
 * `Ib.` refers back to, so an unlink rule that deleted that anchor
 * would leave it copying a different one. That is rule 1's hazard
 * exactly, and it belongs with `RETARGET` and `CORROBORATE` under the
 * the ordering assertion in `registry.order.test.ts`.
 *
 * Membership is EARNED as the five sets above earn theirs: case 10
 * licenses a created anchor only against a `minted` declaration, and
 * only from a rule on `MINT_DECLARERS`, so a rule that creates one and
 * does not declare it is refused by `run.ts` rather than quietly
 * classified here. */
const MINT = new Set(['unlinked-bare-anaphor']);

/**
 * Rules whose object is a FIELD THAT NEVER CARRIES MARKUP — the
 * headword family, and a seventh class rather than four more members
 * of `NEITHER`.
 *
 * The distinction is not bookkeeping. `NEITHER`'s docstring is careful
 * that its members *"demonstrably edit ADJACENT to"* anchors and so
 * earn "removes no anchor and writes no target" as a real claim rather
 * than *"one they are trivially incapable of breaking"*. These four are
 * exactly the trivial case: they edit `headword` and `alt_headwords`,
 * which hold no tag anywhere in the corpus, so the anchor question
 * cannot arise for them. Filing them under `NEITHER` would dilute the
 * one set whose whole value is that its members COULD have broken a
 * link and measurably did not.
 *
 * Rule 1 says nothing about where they sit. Something outside the class
 * DOES read and write these fields, though — `gershayimInBody` is scoped
 * to every field `fieldsOf` walks, `headword` and `alt_headwords`
 * included — and converging is not the same as isolated. This class
 * claims only the former.
 *
 * **The class lost two members on 2026-09-21**,
 * `parenthesized-alt-headword` and `phrase-alt-headword-stub`,
 * unregistered with the headword-design §2 adoption. They were also
 * the only ORDERED pair among these rules; the three that remain are
 * free of each other.
 *
 * Membership is EARNED, by the assertion in `registry.order.corpus.test.ts`:
 * over all 32,512 entries, no field these rules change ever contains a
 * `<`. A future member that edited a definition would fail there rather
 * than inheriting an exemption.
 */
const FIELD = new Set([
	'abbrev-fused-headword',
	// Batch 6b. `asteriskStemStrayPeriod` rewrites `grammar.verbal_stem`,
	// a field that holds no tag anywhere in the corpus, so it earns the
	// class's membership test the same way the other four do.
	'asterisk-stem-label',
	'gender-pair-headword-line-collapse',
]);

/** The eleven classifications, named ONCE. Both halves of the
 * classification test read this — the structural coverage check in
 * `registry.order.test.ts` and the corpus-earned check in
 * `registry.order.corpus.test.ts` — so a twelfth class added to one and
 * forgotten in the other is not a thing that can happen. */
const CLASSES: ReadonlySet<string>[] = [
	UNLINK,
	RETARGET,
	CORROBORATE,
	MINT,
	NEITHER,
	FIELD,
	GLYPH,
	RESTORE,
	WRAP,
	VOUCH,
	POINT,
];
/** An opening tag that puts text into rtl.
 *
 * `<span dir="rtl">` only. Scopes are tracked by hand rather than read
 * off `Token.rtl`, which reports ANY rtl ancestor and so counts
 * `<a dir="rtl">` too — counting anchors would put every unlink rule in
 * `WRAP`, which is precisely the distinction rule 4 rests on. */
function opensRtlSpan(token: TagToken): boolean {
	return token.name === 'span' && DIR_RTL.test(token.value);
}

/** Append `[from, to)` to `runs`, extending the previous run instead
 * when the two abut. The merge is not cosmetic: without it, inserting
 * or removing a NON-span tag inside an rtl span splits one run into
 * several and the rule reads as a wrapper move. `italicLonePunctuation`
 * unwrapping `<i>.</i>` is the live case. */
function extend(runs: number[][], from: number, to: number): void {
	const last = runs.at(-1);
	if (last?.[1] === from) {
		last[1] = to;
		return;
	}
	runs.push([from, to]);
}

/**
 * WHERE the `<span dir="rtl">` wrappers sit in one field: how many
 * there are, and which offset ranges of the TAG-STRIPPED text they
 * cover, contiguous runs merged.
 *
 * POSITION-SENSITIVE, and it has to be. A plain character COUNT per
 * field lets a rule that MOVES a wrapper without changing how much
 * text it covers — `covers 4 characters from offset 0` becoming
 * `covers 4 characters from offset 7` — produce the same count and
 * the same stripped text, satisfy NEITHER half of the `WRAP`
 * conjunction, and land in `NEITHER` where rule 4 cannot see it: the
 * same evasion a hand-written id list allows, one level down.
 *
 * WHAT THE SIGNATURE DISTINGUISHES, since the next reader needs the
 * boundary rather than the intent:
 *
 * - a wrapper appearing or disappearing (the count moves);
 * - a wrapper growing, shrinking, or SLIDING along the text (the
 *   ranges move) — which only the position signature sees;
 * - a wrapper whose text is edited underneath it, only insofar as the
 *   edit changes lengths. Text edits are the OTHER half of the
 *   conjunction and are caught there, by `textOf`.
 *
 * WHAT IT DOES NOT DISTINGUISH:
 *
 * - splitting one rtl span into two that abut and cover exactly the
 *   same characters, or the reverse. The merge makes those identical
 *   ranges — but not identical COUNTS, so the span tally catches it.
 *   Both halves are needed; neither is sufficient.
 * - which span covers which range, when two spans swap identical
 *   ranges. No rule can do this without moving text, which `textOf`
 *   catches.
 * - anything about `<a dir="rtl">`, deliberately — see
 *   `opensRtlSpan`.
 */
function coverageSignatureIn(field: string): [number, number[][]] {
	const scopes: boolean[] = [];
	const runs: number[][] = [];
	let opens = 0;
	// `offset`, not `at` — `at(id)` (the registry-position helper from
	// `admin/pipeline/transform/registry.order.test.ts`) would be shadowed
	// and raise a `noShadow` warning that `qa:lint --error-on-warnings` fails on.
	let offset = 0;
	for (const token of tokenize(field)) {
		if (token.kind === 'text') {
			if (scopes.includes(true) && token.value.length > 0) {
				extend(runs, offset, offset + token.value.length);
			}
			offset += token.value.length;
		} else if (token.close) {
			scopes.pop();
		} else if (opensScope(token.value)) {
			const rtl = opensRtlSpan(token);
			opens += rtl ? 1 : 0;
			scopes.push(rtl);
		}
	}
	return [opens, runs];
}

/** One entry's whole rtl-wrapper signature: `coverageSignatureIn`
 * over every field `fieldsOf` walks, serialised so two entries
 * compare with `===`.
 *
 * This is half (a) of the `WRAP` conjunction. A rule that leaves this
 * string alone across the corpus moved no wrapper; one that changes it
 * and leaves the tag-stripped text alone is a wrap rule, and must be
 * named in `WRAP` or fail the corpus pass. */
function rtlSpanCoverageOf(entry: SourceEntry): string {
	return JSON.stringify(fieldsOf(entry).map(coverageSignatureIn));
}

export {
	CLASSES,
	CORROBORATE,
	FIELD,
	GLYPH,
	MINT,
	NEITHER,
	POINT,
	RESTORE,
	RETARGET,
	rtlSpanCoverageOf,
	UNLINK,
	VOUCH,
	WRAP,
};
