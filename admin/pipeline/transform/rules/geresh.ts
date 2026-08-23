/**
 * The geresh-abbreviation mislink pair — the first RETARGET rules in
 * the pipeline, written as one module because they are the same
 * defect with and without a proclitic particle in front of it, and
 * because they rewrite anchors that sit side by side in one
 * definition (F00014's sense 3 carries one of each).
 *
 * Jastrow abbreviates a headword he has just given in full to its
 * first consonant plus a geresh — `א׳` inside the article for
 * אֲלַכְסוֹן, `וַ׳` inside וַדַּאי. The linker read those two characters
 * as a WORD. A bare stub resolves to the numeral article for that
 * letter (`Jastrow, א׳ 1`, the entry that documents aleph's use as
 * the numeral one); a stub with a particle glued on resolves to some
 * unrelated headword that happens to open with the same two
 * consonants (`בְּוַ׳` inside וַדַּאי → `Jastrow, בַּצּוֹרְתָא 1`). Both
 * point the reader away from the word actually under discussion,
 * which is the containing entry itself.
 *
 * ## The population, measured
 *
 * Definition scope, recursive through `sense.senses`, anchors read
 * through `links.ts`. `geresh.test.ts`'s header carries the query
 * shape and task-5-report.md the runnable scripts.
 *
 * Every anchor whose `data-ref` is a letter's numeral article,
 * corpus-wide: **708 occurrences / 608 entries** — which is where the
 * row's superseded `corpusCount` of 608 came from, and the LOOSE
 * reading its audit rejected. (The audit's 707/607 is this minus one
 * anchor whose display is `(ח׳`: an open paren swallowed into the
 * display, the pending `open-paren-in-anchor-display` row's shape,
 * and not a stub by any reading.) Of those 708 the terminator is
 * U+05F3 HEBREW PUNCTUATION GERESH in all 707 stub-shaped displays
 * and nothing else — no ASCII apostrophe, no U+2019 — so the
 * patterns below admit only U+05F3.
 *
 * `geresh-letter-numeral-mislink` is the STRICT reading its round-3
 * re-measurement settled on: the stub letter must abbreviate the
 * CONTAINING entry's headword. **517 occurrences / 475 entries**,
 * reproducing the catalogued 475 exactly and independently. The 191
 * occurrences that reading drops decompose, as the row's `reason`
 * says they do, into three arms this module must NOT transform — see
 * "What the predicate excludes" below.
 *
 * `prefixed-geresh-abbrev-mislink` (catalogued 173, and UNAUDITED —
 * writing this transform is its audit): a two-letter stub whose
 * SECOND letter abbreviates the containing headword and whose first
 * is a proclitic particle. **185 occurrences / 173 entries**,
 * reproducing 173 exactly. The row is deterministic and stands.
 *
 * ## Entanglement and order
 *
 * The two populations share 8 entries and 7 definitions; no single
 * anchor is in both (one display is one letter long, the other two),
 * so the entanglement is at the definition level — each rule
 * re-serializes a definition the other also rewrites. Both rows now
 * carry the other in `entangledWith`, and `checkAdjacency()` keeps
 * them in a gap-free span of `RULES`.
 *
 * ORDER IS MEASURED, not aesthetic (batch 1's RTL trio is the
 * precedent: the wrong order there left 62 entries unfixed and no
 * unit test could see it). Running the whole corpus through
 * `applyTransforms` with the pair in each order: 98 records across 92
 * entries either way, and 0 entries whose output differs by a byte.
 * They commute because `retarget` rewrites only
 * the attribute VALUES of one opening tag: it returns an array of the
 * same length with every other token reference-equal, so neither rule
 * moves a token index the other depends on, and neither rule's
 * predicate reads any byte the other writes. `gereshLetterNumeral`
 * is registered first for the pedestrian reason that it is the
 * audited row of the two.
 *
 * ## Why these rules DECLINE, and how often
 *
 * Spec §3.2 case 2 lets a rule write only a target the entry's own
 * input already holds, and §3.2 names this pair as its example: "The
 * geresh rows copy the entry's own `Jastrow, <headword> N`." In the
 * corpus that anchor usually is not there. Searching every field
 * `fieldsOf` walks for an anchor whose `data-ref` is exactly
 * `Jastrow, <this entry's headword> <n>`, only **81 of 517** bare
 * members (73 of 475 entries) and **28 of 185** prefixed members (25
 * of 173 entries) have one. The rest DECLINE: `selfTarget` returns
 * `undefined`, `apply` returns the entry by identity, and nothing is
 * recorded.
 *
 * `bun transform:count` therefore reports **71 against a catalogued
 * 475** and **24 against 173**. The three entries between those and
 * the 73/25 above are the members that are already CORRECT — A00006's
 * and M00001's numeral articles linking their own letter, and
 * K00250's `כֹּכְ׳` already resolving to `כּוֹכָב ²` — where the address
 * this rule would write is the one the anchor carries, so `moves` is
 * false and no record is produced. The shortfall is the gate's, not
 * the predicate's, and `geresh.test.ts` pins it from both sides (the
 * full population AND the decline split) so the two can never drift
 * into each other unnoticed. Task 11 owns the `corpusCount`
 * write-back; nothing here edits it.
 *
 * Case 3 (`composed`) cannot close the gap and is deliberately not
 * used. For A00268 — headword אָגוּסְטָא, display `א׳` — the target
 * `Jastrow, אָגוּסְטָא 1` shares only `Jastrow, א` with any input
 * target, leaving a remainder of nine characters that a two-character
 * display cannot account for. The gate would reject it, and it should:
 * assembling an address out of a headword is exactly the fabrication
 * §3.2 exists to stop.
 *
 * ## What the predicate excludes, and why
 *
 * Every exclusion here is SYNTACTIC — there is no enumerated
 * exception list in this module, and so nothing that could rot
 * silently (the 2026-08-23 loud-on-drift ruling has nothing to bind).
 * The three arms the row's `reason` names fall out of the one
 * condition "the stub abbreviates THIS headword":
 *
 * - **Variant readings, 152 occurrences / 123 entries.** "Ms. K. ב׳",
 *   "ed. Berl. ע׳", "Ar. ע׳" — the stub abbreviates a reading named
 *   in the prose, not the lemma. Every one of them has a stub letter
 *   DIFFERENT from the headword's first letter, which is what a
 *   variant reading is, so requiring the letters to agree drops all
 *   152 without a cue regex. The row's `reason` is emphatic about the
 *   cost of getting this wrong: a transform written to the
 *   superseded description "would assert the variant reading is the
 *   lemma on all of them". A01905 holds one of each in one sentence
 *   and has a test.
 * - **"ר׳" = Rabbi, 20 occurrences / 19 entries.** Resh plus geresh
 *   before a name, which should not be a lexical link at all. All 20
 *   sit in entries whose headword does not begin with resh, so the
 *   same condition drops them. They are left standing, not unlinked:
 *   unlinking is `rules/unlink.ts`'s machine and a different row.
 *   (Seventeen further `ר׳` anchors DO sit in resh entries — T00033's
 *   רִאשׁוֹן and the like — and are retargeted with the rest. The
 *   audit's strict 517/475 counts them in; excluding them would be
 *   carving the predicate against the arithmetic that reproduced the
 *   catalogued 475, not against the text.)
 * - **Inside the numeral articles, 18 occurrences / 18 entries.** The
 *   article for aleph links `ב׳` to the article for beth; that link
 *   is correct and is the convention. Its letter is not the host's,
 *   so the same condition drops it. The two anchors where a numeral
 *   article links its OWN letter need no exclusion at all: the target
 *   this rule would write is the address the anchor already carries,
 *   so `moves` is false and nothing is recorded (K00250 has the
 *   test).
 *
 * The prefixed arm's particle set is the closed list of Hebrew and
 * Aramaic proclitics — bet, he, vav, kaf, lamed, mem, shin, dalet —
 * taken from the grammar and from the row's own wording ("particle
 * prefix"), not fitted to a number. It excludes 34 further two-letter
 * stubs whose first letter is a VERBAL preformative (`אִדְּ׳` for the
 * Ithpe'el of דמי, `אַחְ׳` for the Aph'el of חמם, `תִּרְ׳`, `יִדַּ׳`):
 * those abbreviate an inflected FORM of the headword rather than the
 * headword with a particle in front, which is `inflection-abbrev-
 * mislink`'s shape, not this row's. Recorded for Task 11 rather than
 * annexed here.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { serialize, type Token, tokenize } from '../html.ts';
import { type Anchor, anchors, retarget, type Target } from '../links.ts';
import { fieldsOf } from '../no-new-text.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

// Hoisted per lint/performance/useTopLevelRegex.

/** `html.ts`'s `HEBREW` decomposed into the two halves this module
 * has to tell apart, on the ranges its docstring documents: U+05D0–
 * U+05EA the letters (final forms included), U+0591–U+05C7 the points
 * and accents. Importing `HEBREW` whole would not do — a stub is a
 * LETTER carrying optional points, and the combined class cannot say
 * which is which. */
const LETTER: string = String.raw`\u05D0-\u05EA`;
const POINT: string = String.raw`\u0591-\u05C7`;

/** U+05F3 HEBREW PUNCTUATION GERESH, the only terminator this
 * population uses: 707 of 707 stub-shaped displays among the anchors
 * that target a numeral article (module doc). The ASCII apostrophe
 * the discovery query allowed for occurs zero times here, so
 * admitting it would widen the predicate past anything measured. */
const GERESH = '׳';

/** One consonant, its points, and a geresh — the whole display, with
 * nothing else in it. A leading paren or a trailing letter means a
 * different row's defect, not this one's. */
const BARE_STUB = new RegExp(
	`^(?<letter>[${LETTER}])[${POINT}]*${GERESH}$`,
	'u',
);

/** The same, with a proclitic in front. Disjoint from `BARE_STUB` by
 * letter count, which is why no anchor is ever in both populations. */
const PREFIXED_STUB = new RegExp(
	`^(?<prefix>[${LETTER}])[${POINT}]*(?<letter>[${LETTER}])[${POINT}]*${GERESH}$`,
	'u',
);

/** A letter's numeral article — the entry documenting that letter's
 * use as a numeral, whose headword IS the stub (`א׳`). The mislink
 * target of the bare arm, in all 708 measured occurrences. */
const NUMERAL_ARTICLE = new RegExp(
	`^Jastrow, (?<letter>[${LETTER}])${GERESH} \\d+$`,
	'u',
);

/** The headword's first consonant — the one the stub abbreviates.
 * Read as "first Hebrew letter" rather than "first character" so a
 * conjectural asterisk (`*דָּנָב`) or an editorial paren (`(אגוסטה)`)
 * does not hide it. */
const FIRST_LETTER = new RegExp(`[${LETTER}]`, 'u');

/** What must follow `Jastrow, <headword> ` for a `data-ref` to name
 * THIS entry rather than a homograph of it. Without it the prefix
 * test alone would accept `Jastrow, טוּשׁ I 1` for headword `טוּשׁ`,
 * and retarget a mislink onto a different article. */
const SENSE_NUMBER = /^\d+$/u;

/**
 * The proclitic particles of Hebrew and Aramaic: bᵉ- "in", ha- the
 * article, wᵉ- "and", kᵉ- "like", lᵉ- "to", mi- "from", she- "that",
 * dᵉ- "of, that". A closed grammatical class, written from the
 * grammar and from the row's own description ("particle prefix"), and
 * measured afterwards — 185 occurrences / 173 entries against a
 * catalogued 173. What it deliberately leaves out is the verbal
 * preformatives (aleph, yod, taw and the rest); see the module doc.
 */
const PARTICLES: ReadonlySet<string> = new Set([...'בהוכלמשד']);

/** The containing entry's first consonant, or `''` for a headword
 * holding no Hebrew letter at all — which never equals a stub letter,
 * so such an entry simply never matches. */
function headLetter(headword: string): string {
	return FIRST_LETTER.exec(headword)?.[0] ?? '';
}

/** Whether `retarget` will accept this anchor — the same three
 * refusals it throws on (`links.ts`: `malformed`, `interior`,
 * unclosed), asked here so a predicate can skip such an anchor rather
 * than crash on it. `rules/unlink.ts` has the identical helper and
 * does not export it; this task's file scope forbids editing that
 * module, so the two-line predicate is restated rather than shared. */
function editable(anchor: Anchor): boolean {
	return !(anchor.malformed || anchor.interior) && anchor.close !== -1;
}

/**
 * Whether the BARE defect predicate matches — the raw row, before any
 * question of whether a target is available. Exported so
 * `geresh.test.ts` can measure the population and the declines
 * separately: `transform:count` sees only entries the rule touched,
 * and cannot tell a predicate that narrowed from a gate that
 * declined.
 */
function bareStubRaw(entry: SourceEntry, anchor: Anchor): boolean {
	const stub = BARE_STUB.exec(anchor.display.trim())?.groups?.['letter'];
	if (stub === undefined) {
		return false;
	}
	const article = NUMERAL_ARTICLE.exec(anchor.dataRef)?.groups?.['letter'];
	return article === stub && headLetter(entry.headword) === stub;
}

/**
 * Whether the PREFIXED defect predicate matches. The target is only
 * required to be a Jastrow article — unlike the bare arm it is never
 * a numeral article (measured: 0 of 1,353 two-letter stubs resolve to
 * one), because the linker had two consonants to work with and found
 * a real headword opening with them.
 */
function prefixedStubRaw(entry: SourceEntry, anchor: Anchor): boolean {
	const stub = PREFIXED_STUB.exec(anchor.display.trim())?.groups;
	if (stub === undefined) {
		return false;
	}
	return (
		PARTICLES.has(stub['prefix'] ?? '') &&
		headLetter(entry.headword) === stub['letter'] &&
		anchor.dataRef.startsWith('Jastrow, ')
	);
}

/**
 * The entry's own address as some anchor in its own input already
 * spells it, or `undefined` when no anchor does — which is the
 * DECLINE, and the common case (module doc: 84% of both rows).
 *
 * Both attributes are copied verbatim off one anchor, never
 * assembled, which is what makes every write here spec §3.2 case 2
 * and lets both rules run with no `composed` declaration. The scope
 * is `fieldsOf` — the same walk `checkLinkTargets` builds its
 * permitted-target set from — so a target found here is a target the
 * gate will accept by construction; narrowing to definitions alone
 * would decline entries whose only self-reference sits in
 * `language_reference`.
 *
 * The first match in `fieldsOf` order, then document order, so the
 * choice is deterministic when an entry names itself twice.
 * Unusable anchors are skipped: a malformed opening tag can have
 * swallowed its own closing tag into the `href`, and that string is
 * not an address.
 */
function selfTarget(entry: SourceEntry): Target | undefined {
	const lemma = `Jastrow, ${entry.headword} `;
	const names = (anchor: Anchor): boolean =>
		editable(anchor) &&
		anchor.dataRef.startsWith(lemma) &&
		SENSE_NUMBER.test(anchor.dataRef.slice(lemma.length));
	let found: Anchor | undefined;
	// Field by field rather than one flattened list, so an entry whose
	// first definition names itself never tokenizes the rest.
	for (const field of fieldsOf(entry)) {
		found = anchors(tokenize(field)).find(names);
		if (found !== undefined) {
			break;
		}
	}
	return found === undefined
		? undefined
		: { dataRef: found.dataRef, href: found.href };
}

/** Whether pointing this anchor at `target` would change anything.
 * False on the two members that are already correct — a numeral
 * article linking its own letter (A00006's `א׳`), K00250's `כֹּכְ׳`
 * already resolving to `כּוֹכָב ²` — so they produce no record instead
 * of needing an exception list, and so the loop below terminates. */
function moves(anchor: Anchor, target: Target): boolean {
	return anchor.dataRef !== target.dataRef || anchor.href !== target.href;
}

/**
 * Point every anchor in one definition that `match` selects at
 * `target`.
 *
 * Re-derives `anchors(next)` before each rewrite, the shape
 * `unlink.ts`'s `unlinkMatching` was corrected into after a nested
 * pair defeated a compute-once list. The hazard that forced it there
 * cannot arise here — `retarget` maps the token array to one of the
 * SAME length, replacing a single opening tag and returning every
 * other token by reference, so no index any anchor holds is ever
 * invalidated, and anchors do nest in this corpus (477 pairs in
 * definition text). Re-deriving anyway costs one extra scan per
 * rewrite and means this loop stays correct if `retarget` ever stops
 * being index-preserving.
 *
 * Terminates because `moves` is part of the selection: a rewritten
 * anchor carries `target` afterwards, so it is never selected twice,
 * and rewriting it changes no byte any other anchor's verdict is read
 * from. The count of selectable anchors therefore strictly decreases.
 */
function retargetMatching(
	definition: string,
	target: Target,
	match: (anchor: Anchor) => boolean,
): { changed: number; text: string } {
	let next: readonly Token[] = tokenize(definition);
	let changed = 0;
	for (;;) {
		const found = firstMatch(next, target, match);
		if (found === undefined) {
			break;
		}
		next = retarget(next, found, target);
		changed += 1;
	}
	return { changed, text: changed === 0 ? definition : serialize(next) };
}

/** The first anchor in `tokens` this rule may and should rewrite. A
 * top-level function rather than a closure declared inside
 * `retargetMatching`'s loop, for the reason `unlink.ts`'s
 * `firstUsableMatch` is one: `next` is reassigned every iteration and
 * lint/nursery/noLoopFunc flags a fresh closure over it. */
function firstMatch(
	tokens: readonly Token[],
	target: Target,
	match: (anchor: Anchor) => boolean,
): Anchor | undefined {
	return anchors(tokens).find(
		(anchor) => editable(anchor) && moves(anchor, target) && match(anchor),
	);
}

/**
 * Rewrite every definition in the entry, recursing through nested
 * senses — `rules/rtl.ts`'s `overDefinitions` and `unlink.ts`'s walk
 * the same shape, and for the same reason: senses nest, and a flat
 * walk loses about a quarter of this population.
 *
 * Returns the entry by identity when the rule declines or matches
 * nothing, so `records.length` stays the honest "did this fire"
 * signal `count.ts` measures. No `unlinks` and no `composed`: this
 * removes no anchor and assembles no address.
 *
 * Scope is definitions only. The bare arm measures 0 members in
 * `language_reference` corpus-wide, so the narrower scope is moot
 * rather than assumed — the standing `rtl.ts` set for
 * `redundant-outer-rtl-span`. `selfTarget` still reads every field,
 * because supplying a target is not the same as holding a defect.
 */
function retargetOverDefinitions(
	entry: SourceEntry,
	ruleId: string,
	match: (entry: SourceEntry, anchor: Anchor) => boolean,
): TransformResult {
	const target = selfTarget(entry);
	if (target === undefined) {
		return { entry, records: [] };
	}
	const records: TransformRecord[] = [];
	const walk = (senses: readonly SourceSense[]): SourceSense[] =>
		senses.map((sense) => {
			let { definition } = sense;
			if (definition !== undefined) {
				const { changed, text } = retargetMatching(definition, target, (a) =>
					match(entry, a),
				);
				if (changed > 0) {
					definition = text;
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
		entry:
			records.length === 0
				? entry
				: { ...entry, content: { ...entry.content, senses: rewritten } },
		records,
	};
}

/**
 * A one-consonant abbreviation of the containing entry's own headword,
 * anchored to that letter's numeral article. Retargeted to the entry
 * itself wherever the entry's input spells its own address; declined
 * otherwise (module doc).
 */
const gereshLetterNumeral: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		retargetOverDefinitions(
			entry,
			'geresh-letter-numeral-mislink',
			bareStubRaw,
		),
	id: 'geresh-letter-numeral-mislink',
	phase: 'text-repairs',
};

/**
 * The same abbreviation with a proclitic particle glued to its front,
 * which gave the linker two consonants and so an unrelated headword
 * to resolve to instead of a numeral article.
 */
const prefixedGereshAbbrev: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		retargetOverDefinitions(
			entry,
			'prefixed-geresh-abbrev-mislink',
			prefixedStubRaw,
		),
	id: 'prefixed-geresh-abbrev-mislink',
	phase: 'text-repairs',
};

export {
	bareStubRaw,
	gereshLetterNumeral,
	prefixedGereshAbbrev,
	prefixedStubRaw,
	selfTarget,
};
