/**
 * The unlink family: rows whose anchor is wrong and whose correct
 * target does not exist. The maintainer ruling of 2026-08-22 is to
 * drop the anchor and keep the display text — a link Jastrow never
 * made, resolving to an article the reader was never promised, is
 * linker debris. The body model's standing principle is the same one:
 * show only what Jastrow linked.
 *
 * Every rule here returns `unlinks` equal to the anchors it removed.
 * The markup-delta gate reads a dropped tag pair as an improvement, so
 * that count is the only check that the rule dropped what it meant to.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { serialize, type Token, tokenize } from '../html.ts';
import { type Anchor, anchors, unlink } from '../links.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

// Hoisted per lint/performance/useTopLevelRegex.

/**
 * A modern bibliographic apparatus reference to Graetz's "Geschichte
 * der Juden" — "Graetz, Gesch. d." / "Graetz Gesch. d." / (once,
 * S02058) "Grætz, Gesch. d." / (once, B00764) "Graetz Gesch. der" —
 * whose German volume abbreviation the linker read as "Jud." and
 * resolved to the Book of Judges. Measured 5/5 corpus-wide against the
 * catalogue's "5 x Graetz Gesch. d. Jud. <vol> -> Book of Judges":
 * A00135, A03177, B00284, B00764, S02058 (task-2-report.md has the
 * query).
 */
const GRAETZ_CUE = /\bGr(?:ae|æ)tz,?\s+Gesch\.\s+d(?:\.|er)\s*$/u;

/**
 * A modern bibliographic apparatus reference to the Aruch Completum,
 * ed. Kohut — "Ar. ed." (G00065, H00504) / "Ar. Compl. ed." (K00680) —
 * whose editor abbreviates to "Koh.", colliding with Koheleth, the
 * Hebrew name for Ecclesiastes. Measured 3/3 against the catalogue's
 * "3 x Ar. (Compl.) ed. Koh. <vol>, p. N -> Ecclesiastes".
 */
const ARUCH_CUE = /\bAr\.(?:\s*Compl\.)?\s*ed\.\s*$/u;

/**
 * A rabbi's name introduced by "(R. " — in every measured instance,
 * "R. Josh[ua]" — whose abbreviation the linker resolved to the Book
 * of Joshua instead of leaving it as a bare name. Measured 41/41
 * against the catalogue's `corpusCount`. A documented 42nd occurrence
 * (K01198: "…siege (Lam. R. introd., R. Josh. 2 …)" — a COMMA before
 * "R." rather than this cue's open paren) is the same mislink under
 * different lead punctuation; it is deliberately NOT matched here, so
 * this predicate stays at the row's own catalogued population rather
 * than the audit's disclosed-but-uncounted superset of 42. See
 * task-2-report.md, "What my predicate excludes and why".
 */
const RABBI_CUE = /\(R\.\s*$/u;

/**
 * Every preceding TEXT token's value, concatenated up to `open` — the
 * immediate lexical context an apparatus or rabbi-name cue must sit at
 * the tail of. Mirrors `links.ts`'s `displayOf`, but reads the text
 * BEFORE an anchor rather than inside one.
 */
function leadOf(tokens: readonly Token[], open: number): string {
	let text = '';
	for (const token of tokens.slice(0, open)) {
		if (token.kind === 'text') {
			text += token.value;
		}
	}
	return text;
}

/** Whether `anchor` is one `unlink` will accept — the same three
 * refusals `retarget`/`unlink` throw on (`links.ts`), checked here so
 * a rule's predicate can skip such an anchor rather than crash on
 * it. */
function usable(anchor: Anchor): boolean {
	return !(anchor.malformed || anchor.interior) && anchor.close !== -1;
}

/**
 * Drop every anchor in one definition that `match` selects, working
 * from the LAST anchor to the first so removing one never invalidates
 * the token index of another still to come. Safe because anchors do
 * not nest in this corpus (`links.ts`'s `anchors` docstring), so no
 * two selected anchors ever share a token.
 */
function unlinkMatching(
	definition: string,
	match: (tokens: readonly Token[], anchor: Anchor) => boolean,
): { removed: number; text: string } {
	const tokens = tokenize(definition);
	const targets = anchors(tokens)
		.filter((anchor) => usable(anchor) && match(tokens, anchor))
		.sort((a, b) => b.open - a.open);
	let next: readonly Token[] = tokens;
	for (const anchor of targets) {
		next = unlink(next, anchor);
	}
	return {
		removed: targets.length,
		text: targets.length === 0 ? definition : serialize(next),
	};
}

/**
 * Rewrite every definition in the entry, recursing through nested
 * senses — `rules/rtl.ts`'s `overDefinitions` walks the same shape for
 * the same reason — and total the anchors dropped across all of them
 * into `unlinks`. `TransformResult.unlinks` is counted per ENTRY, not
 * per field, so the total accumulates across every definition this
 * call touches rather than resetting per sense.
 *
 * Neither rule built on this reaches `language_reference`: measured 0
 * Judges/Ecclesiastes/Joshua anchors there corpus-wide (task-2-report.md),
 * so the narrower scope is on the same footing as `rtl.ts`'s
 * `redundant-outer-rtl-span` — moot rather than assumed.
 */
function unlinkOverDefinitions(
	entry: SourceEntry,
	ruleId: string,
	match: (tokens: readonly Token[], anchor: Anchor) => boolean,
): TransformResult {
	const records: TransformRecord[] = [];
	let unlinks = 0;
	const walk = (senses: readonly SourceSense[]): SourceSense[] =>
		senses.map((sense) => {
			let definition = sense.definition;
			if (definition !== undefined) {
				const { removed, text } = unlinkMatching(definition, match);
				if (removed > 0) {
					definition = text;
					unlinks += removed;
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
		...(unlinks > 0 ? { unlinks } : {}),
	};
}

/**
 * A modern apparatus citation — Graetz's history, or the Aruch
 * Completum's editor — whose volume/page happened to parse as a
 * biblical chapter:verse and was linked as scripture. The audit's
 * falsifier (a corpus-wide census of Bible data-refs with verse > 90,
 * impossible outside Ps. 119) independently catches 2 of these 8
 * (B00764's `Judges 4:168`, K00680's `Ecclesiastes 4:235`) — evidence
 * the cue is finding the same population a structurally different
 * check would.
 */
const apparatusCite: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		unlinkOverDefinitions(
			entry,
			'apparatus-cite-linked-as-scripture',
			(tokens, anchor) => {
				const lead = leadOf(tokens, anchor.open);
				return (
					(GRAETZ_CUE.test(lead) && anchor.dataRef.startsWith('Judges ')) ||
					(ARUCH_CUE.test(lead) && anchor.dataRef.startsWith('Ecclesiastes '))
				);
			},
		),
	id: 'apparatus-cite-linked-as-scripture',
	phase: 'text-repairs',
};

/**
 * A rabbi's name anchored to the Book of Joshua because its
 * abbreviation collides with the book's own. The `dataRef` check is
 * defense in depth, not the load-bearing test: the audit found "every
 * anchor immediately following 'R. ' … resolves to Joshua; no
 * counterexample" corpus-wide, so `RABBI_CUE` alone would already be
 * exact here — the `startsWith('Joshua ')` guard costs nothing and
 * means a future corpus edit introducing a counterexample fails
 * loudly (an unmatched anchor) instead of silently mislinking further.
 */
const rabbiName: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		unlinkOverDefinitions(
			entry,
			'rabbi-name-linked-as-bible-book',
			(tokens, anchor) =>
				RABBI_CUE.test(leadOf(tokens, anchor.open)) &&
				anchor.dataRef.startsWith('Joshua '),
		),
	id: 'rabbi-name-linked-as-bible-book',
	phase: 'text-repairs',
};

export { apparatusCite, rabbiName };
