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
 * A rabbi's name introduced right after "introd." — "(R. " (the
 * common case) or ", R. " (K01198's "…introd., R. Josh. 2…") — in
 * every measured instance "R. Josh[ua]", whose abbreviation the
 * linker resolved to the Book of Joshua instead of leaving it as a
 * bare name. The open-paren and comma leads are the SAME defect: both
 * sit immediately after "introd." (or "Ib." standing in for it), both
 * introduce a rabbi's name, both got read as "Josh." the book. Ruling
 * (maintainer, 2026-08-23): describe the defect, not the catalogued
 * number — a predicate carved to stop one short of a real member,
 * for no reason but matching a count, is not a measurement. Measured
 * 42/42 against this cue; the catalogue's `corpusCount` (41) predates
 * this rule and is corrected by it, the same direction batch 1's
 * `bare-rtl-hebrew` correction ran (4,190 → 4,189) — Task 11 owns the
 * `patterns.jsonl` write-back. See task-2-report.md.
 */
const RABBI_CUE = /[(,]\s*R\.\s*$/u;

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

/**
 * Batch-wide drift check (maintainer ruling, 2026-08-23): an enumerated
 * exception may live inside a transform rule, but it must be LOUD ON
 * DRIFT, the same standing `repairs.ts` was approved on ("pure,
 * rid-keyed literal edits, loud on drift"). The load-bearing half is
 * the drift behaviour, not the list.
 *
 * `repairs.ts`'s find/replace edits can throw from INSIDE their own
 * pass, because the invariant they check ("this rid's text still
 * contains the exact find-string") is local to the one entry `apply`
 * is already holding. A convention-exclusion set can't reuse that
 * trick: the invariant it needs to check is "this `rid|dataRef` key
 * was matched by the rule's raw predicate SOMEWHERE in a corpus run",
 * and `Rule.apply` only ever sees one entry at a time. It has no way
 * to tell "this rid never came through at all this run" (the entry
 * was renamed or deleted) from "this rid came through and the
 * predicate matched" — both look like silence from inside a single
 * `apply` call. So this can't be an in-rule assertion; it has to walk
 * the corpus itself, independently of any single rule invocation.
 *
 * This helper only computes the unobserved keys; `unlink.test.ts` is
 * where it actually runs, as a corpus-walking test rather than a
 * `transform:count` check — chosen deliberately. `transform:count`
 * already catches drift, but only as an aggregate delta on the count
 * of 80: late (visible only on a manual run someone remembers to make)
 * and mute (it says the total moved, never which of the six keys
 * broke). A test runs on every `bun qa`/CI pass and, via this
 * function's return value, names the specific dead key in its failure
 * message — the earliest point, and the most specific one, a human is
 * actually looking.
 *
 * Returns the keys from `convention` that `raw` never matched anywhere
 * in `corpus` — empty means every exclusion is still live. Generic
 * over the raw predicate and the corpus so later convention-exclusion
 * rules (Tasks 5, 6, 9) can call this directly rather than re-deriving
 * it.
 */
/** Recurse `senses` the same shape `unlinkOverDefinitions`'s own walk
 * does, adding `rid|dataRef` to `seen` for every anchor `raw` matches.
 * Split out from `unobservedConvention` as a top-level function, not a
 * closure rebuilt on every loop iteration, to keep both readable and
 * under the lint budget. */
function collectObserved(
	senses: readonly SourceSense[],
	rid: string,
	raw: (tokens: readonly Token[], anchor: Anchor) => boolean,
	seen: Set<string>,
): void {
	for (const sense of senses) {
		if (sense.definition !== undefined) {
			const tokens = tokenize(sense.definition);
			for (const anchor of anchors(tokens)) {
				if (usable(anchor) && raw(tokens, anchor)) {
					seen.add(`${rid}|${anchor.dataRef}`);
				}
			}
		}
		if (sense.senses !== undefined) {
			collectObserved(sense.senses, rid, raw, seen);
		}
	}
}

async function unobservedConvention(
	convention: ReadonlySet<string>,
	corpus: AsyncIterable<SourceEntry>,
	raw: (tokens: readonly Token[], anchor: Anchor) => boolean,
): Promise<string[]> {
	const seen = new Set<string>();
	for await (const entry of corpus) {
		collectObserved(entry.content.senses, entry.rid, raw, seen);
	}
	return [...convention].filter((key) => !seen.has(key));
}

/**
 * Print marks a word-head elision as "…X": the ellipsis stands for a
 * shared stem the compositor didn't re-set, X is the differing tail —
 * almost always inside a manuscript-apparatus note ("(not …X)", "(ed.
 * …X)", "(read …X)", or a plural-declension list, "Pl. חֲתוּלִים,
 * …לִין"). The ellipsis sits as plain TEXT immediately before an
 * anchor, never inside one — no anchor in this corpus opens with "…"
 * in its own display, corpus-wide (task-3-report.md; the brief's own
 * discovery query and its first acceptance criterion assumed the
 * opposite and were corrected by the maintainer, 2026-08-23, after
 * that query measured zero). The linker read the printed tail as if it
 * were the whole lemma and anchored it to a same-spelled headword —
 * `dataRef.startsWith('Jastrow, ')` is load-bearing here, not defense
 * in depth: it is what separates this construct from a structurally
 * different one — ellipsis before a COMPLETE citation ("… Yoma 28ᵇ"),
 * 36 instances, elision of quoted text before a legitimate Talmud/
 * Mishnah/Targum reference, correctly linked and no part of this row.
 *
 * Measured 94 raw (`ELLIPSIS_LEAD` + internal-headword target) against
 * the catalogue's own "88 defect occurrences / 80 entries of 94 raw" —
 * matched independently, derived from this query rather than copied
 * from the catalogue, which is the strongest evidence available that
 * this is the right population (task-3-report.md).
 */
const ELLIPSIS_LEAD = /…\s*$/u;

/**
 * Whether the RAW defect predicate matches — before the convention
 * exclusion is applied. Split out from `ellipsisFragment.apply` so
 * `unobservedConvention` can ask "would this rule have fired here" for
 * an excluded key without re-deriving the cue, and so the exclusion
 * itself (`ELLIPSIS_CONVENTION`) is visibly a filter OVER this
 * predicate rather than folded into it.
 */
function ellipsisRaw(tokens: readonly Token[], anchor: Anchor): boolean {
	return (
		ELLIPSIS_LEAD.test(leadOf(tokens, anchor.open)) &&
		anchor.dataRef.startsWith('Jastrow, ')
	);
}

/**
 * The 6 convention survivors found by reading all 94 raw
 * (task-3-report.md): sole occurrence each, in 6 distinct entries —
 * confirmed by the arithmetic, not merely asserted, since dropping
 * exactly these 6 occurrences is the only way to move BOTH the
 * occurrence count (94 → 88) AND the entry count (86 → 80) by the same
 * 6, which requires every excluded occurrence to be the only one in
 * its entry. In each, the ellipsis marks ordinary sentence-level
 * elision — of a citation ("Ḥull. 64ᵇ …", "Targ. Hos. VI, 2 …") or of
 * English discourse ("if you were to say …", "why do we not say …",
 * "[In compounds: …") — not a word being given a manuscript-variant
 * tail, and the anchored word is complete and contextually correct: a
 * sibling headword form (A01030, K01049), a name or particle glossed
 * immediately after (A01111, A02658, L00584), or a variant spelling
 * confirmed by the English gloss that follows it (D00702). Keyed by
 * `rid|dataRef`, not `rid` alone, so a future corpus edit adding a
 * genuine defect to one of these six entries is not silently swallowed
 * by the exclusion.
 *
 * Maintainer ruling (2026-08-23): an enumerated exception may live
 * inside a transform rule, but it must be LOUD ON DRIFT — same standing
 * as `repairs.ts`'s rid-keyed literal edits. Here that means every key
 * below must be OBSERVED — matched by `ellipsisRaw` somewhere in a
 * corpus pass — which `unlink.test.ts`'s corpus-walking test checks on
 * every run via `unobservedConvention`, above. A key that stops being
 * observed means the corpus moved under this exclusion, or the
 * exclusion was wrong from the start; either way it fails loudly,
 * naming the dead key, rather than degrading into a silent
 * exclusion-of-nothing that only `transform:count`'s aggregate 80
 * would (eventually, and without saying which key) catch.
 */
const ELLIPSIS_CONVENTION: ReadonlySet<string> = new Set([
	'A01030|Jastrow, אַחֲיוֹת 1',
	'A01111|Jastrow, הַיְינוּ 1',
	'A02658|Jastrow, דּוֹסְתַּאי 1',
	'K01049|Jastrow, כְּפַר 1',
	'L00584|Jastrow, וִידּוּי 1',
	'D00702|Jastrow, דיקלאי 1',
]);

const ellipsisFragment: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		unlinkOverDefinitions(
			entry,
			'ellipsis-fragment-anchored',
			(tokens, anchor) =>
				ellipsisRaw(tokens, anchor) &&
				!ELLIPSIS_CONVENTION.has(`${entry.rid}|${anchor.dataRef}`),
		),
	id: 'ellipsis-fragment-anchored',
	phase: 'text-repairs',
};

export {
	apparatusCite,
	ELLIPSIS_CONVENTION,
	ellipsisFragment,
	ellipsisRaw,
	rabbiName,
	unobservedConvention,
};
