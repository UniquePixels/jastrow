/**
 * The nested-anchor duplicate-layer pair (batch-4 spec §5 rules 1, 2).
 *
 * One defect, two rows, split by LOCUS — `nonsense-dup-anchor` owns
 * `language_reference`, `nested-anchor-swallows-punctuation` owns
 * `definition` — which is the shape `rules/gershayim.ts` uses and the
 * shape the catalogue records: the two rows were catalogued over the
 * same records until the Task 10 audit re-scoped the first to its 755
 * language-reference members. Before that re-scope both rows counted
 * the same 465 sense-side entries, so a single rule spanning both loci
 * would have been one transform answering to two `corpusCount`s that
 * double-count each other.
 *
 * `jt-double-wrapped-citation` (10 entries / 20 pairs) has NO rule of
 * its own. It is a strict subset of the definition row — the arm that
 * traps nothing between the two layers — established by the batch-4
 * span comparison and now declared with a mutual `entangledWith` edge.
 * Its `href`-missing-a-leading-slash half belongs to the discarded
 * `jt-href-slash` row and is NOT repaired here: `href` strings are not
 * stored in v2 at all, so that half of the defect dies at compile.
 *
 * ## The outer layer is the one that goes
 *
 * The inner anchor is the citation; the outer adds nothing but a
 * second layer around it and, in most cases, one trailing punctuation
 * mark. Dropping the outer keeps the mark as document text where a
 * reader already sees it, and the inner anchor's target is untouched,
 * so no `link-target.ts` case is engaged: every target in the output
 * is a target the input held, unmoved, and every output byte is an
 * input byte. Neither rule sets `allows` — a pure deletion cannot
 * introduce a codepoint — and the anchor each removes is declared
 * through `unlinks`, which is the only thing standing between this and
 * an accidental unlink (the markup gate reads a dropped tag pair as an
 * improvement, and the text gate is a sub-multiset check that reads a
 * deletion as legitimate).
 *
 * ## Re-derive after every edit
 *
 * Anchors NEST in this corpus — 477 pairs in `definition`, 757 in
 * `language_reference` — so a token index taken before an edit is
 * stale after it. `unlinkMatching` (`rules/unlink.ts`) was written
 * against the opposite (false) claim and carried a real bug for it: a
 * removal shifts every later index down by two, so a `close` captured
 * beforehand silently names nothing and a stray `</a>` survives. The
 * loop below re-tokenizes on each pass and stops when a pass finds
 * nothing, which is correct regardless of nesting depth or shape.
 *
 * This is not `unlinkMatching` itself, and the difference is why:
 * that helper selects anchors by a per-anchor predicate over
 * `(tokens, anchor)`, and the predicate here is about a PAIR — an
 * anchor is removable only in virtue of another anchor strictly
 * inside it sharing its target. Squeezing a pair test through a
 * single-anchor predicate would mean re-deriving the sibling set
 * inside the predicate on every call, so the pair walk lives here and
 * shares what it can: `usable`'s three refusals are the same three,
 * and the removal itself goes through `links.ts`'s `unlink`, whose
 * `assertUsable` is the one gate both editors share.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { serialize, type Token, tokenize } from '../html.ts';
import { type Anchor, anchors, unlink } from '../links.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

/** Which spelling of the target the two layers must share. The
 * catalogue measured the outer and inner attribute sets byte-identical
 * in 1,230 of 1,230 pairs, so the two keys select the same population
 * wherever both attributes parse; each row is keyed on the attribute
 * its own audit measured, rather than on whichever happens to be
 * equivalent today. */
type Which = 'dataRef' | 'href';

const LANG_ID = 'nonsense-dup-anchor';
const DEF_ID = 'nested-anchor-swallows-punctuation';

/** Whether `anchor` is one `unlink` will accept — the same three
 * refusals `assertUsable` throws on (`links.ts`), checked here so the
 * pair walk can skip a malformed, interior or unclosed anchor rather
 * than crash on it. Mirrors `rules/unlink.ts`'s `usable`. */
function usable(anchor: Anchor): boolean {
	return !(anchor.malformed || anchor.interior) && anchor.close !== -1;
}

/** Whether `inner` sits strictly inside `outer`'s token span.
 *
 * The `close !== -1` test is what makes that true as stated rather
 * than true by luck. `anchors()` reports an UNCLOSED anchor with
 * `close: -1`, and `-1` is less than every real `outer.close`, so
 * without it an unclosed inner would read as "strictly inside" — the
 * docstring would be false, and the helper would be correct only
 * because its one call site happens to evaluate `usable(candidate)`
 * first and `&&` short-circuits. Reordering that predicate for
 * readability, or calling `within` from anywhere else, would then
 * silently admit an unclosed inner. The guard is redundant with
 * `usable` today and kept anyway, so the helper stands on its own.
 *
 * The mirror case needs no guard: an unclosed OUTER has
 * `outer.close === -1`, and no anchor's `close` is less than `-1`, so
 * `inner.close < outer.close` already rejects every candidate. */
function within(inner: Anchor, outer: Anchor): boolean {
	return (
		inner.open > outer.open && inner.close !== -1 && inner.close < outer.close
	);
}

interface Pair {
	inner: Anchor;
	outer: Anchor;
}

/**
 * The first duplicate-layer pair in `found` — an outer anchor with a
 * usable anchor strictly inside it carrying the same non-empty
 * target.
 *
 * "First" is in document order over the OUTER anchor, which
 * `anchors()` already sorts by `open`, so on a three-deep nest the
 * outermost layer goes first and the next pass re-derives against the
 * shortened stream. An empty target is never matched: the two anchors
 * in the corpus that carry an `href` and no `data-ref` would otherwise
 * pair with each other on a shared `''`.
 *
 * One accumulator and one lazy `break` rather than an early `return`,
 * because TS7030 (`noImplicitReturns`) and biome's
 * `noUselessUndefined` between them forbid a bare fall-through.
 */
function firstDuplicatePair(
	found: readonly Anchor[],
	key: Which,
): Pair | undefined {
	let hit: Pair | undefined;
	for (const outer of found) {
		if (!usable(outer) || outer[key] === '') {
			continue;
		}
		const inner = found.find(
			(candidate) =>
				usable(candidate) &&
				within(candidate, outer) &&
				candidate[key] === outer[key],
		);
		if (inner !== undefined) {
			hit = { inner, outer };
			break;
		}
	}
	return hit;
}

/**
 * The text the outer layer traps — every text token inside `outer` but
 * outside `inner`, in document order.
 *
 * Carried onto `TransformRecord.detail` so the trapped-mark census is
 * read straight off the records rather than re-derived by whoever
 * reads the migration report: `)` 702 / `.` 52 / `,` 1 in
 * `language_reference`, `.` 387 / `)` 68 / nothing 20 in `definition`,
 * pinned in `nested-anchor.test.ts`. The empty arm is the 20 JT
 * pairs, and it is `''` rather than absent for the same reason —
 * "trapped nothing" is a census bucket, not a missing measurement.
 *
 * READ THIS BEFORE TREATING THE CENSUS AS A SAFETY CHECK. It is
 * measured HERE, on the input stream, before `unlink` runs — so on its
 * own it is a description of what went in, and would read exactly the
 * same if the rule started eating the punctuation on the way out. What
 * makes the census an assertion about the OUTPUT is a separate check
 * in the corpus tier: `textOf` byte equality across every entry either
 * rule touches. That is strictly stronger and subsumes this — no text
 * byte moves, so every mark counted here is still there afterwards, in
 * the same quantity. An earlier version of this comment claimed the
 * census carried that weight by itself; it did not, and the equality
 * check was added in review.
 */
function trappedText(tokens: readonly Token[], pair: Pair): string {
	let text = '';
	for (const [at, token] of tokens.entries()) {
		if (at <= pair.outer.open || at >= pair.outer.close) {
			continue;
		}
		if (at >= pair.inner.open && at <= pair.inner.close) {
			continue;
		}
		if (token.kind === 'text') {
			text += token.value;
		}
	}
	return text;
}

/**
 * Drop every duplicate outer layer in one field, re-deriving the
 * anchor view from the CURRENT token stream on every pass — see the
 * module docstring on why a pre-computed index is stale after the
 * first removal.
 *
 * Returns the rewritten text and one trapped string per layer
 * removed, so the caller's record count is the occurrence count. The
 * text comes back by reference when nothing matched, so a
 * `Rule.apply` above can hand its caller back the same entry object.
 */
function dropOuterLayers(
	html: string,
	key: Which,
): { text: string; trapped: string[] } {
	let next: readonly Token[] = tokenize(html);
	const trapped: string[] = [];
	for (;;) {
		const pair = firstDuplicatePair(anchors(next), key);
		if (pair === undefined) {
			break;
		}
		trapped.push(trappedText(next, pair));
		// `unlink` re-checks `assertUsable` on the anchor `usable` already
		// cleared — the shared gate, not this walk's own reading, is what
		// licenses the edit.
		next = unlink(next, pair.outer);
	}
	return {
		text: trapped.length === 0 ? html : serialize(next),
		trapped,
	};
}

/** One record per layer removed, each naming what that layer trapped. */
function recordsFor(
	trapped: readonly string[],
	rid: string,
	ruleId: string,
): TransformRecord[] {
	return trapped.map((detail) => ({ detail, rid, ruleId }));
}

/**
 * `nonsense-dup-anchor`: the doubled anchor in `language_reference`,
 * 755 occurrences across 755 entries, keyed on the shared `href`.
 *
 * Scoped to the ONE non-sense field that carries anchors at all — the
 * audit confirmed `headword`, `alt_headwords`, `plural_form`, `refs`,
 * `quotes`, `morphology` and `language_code` all score zero against a
 * populated corpus — so a `mapFields` walk would be a walk over seven
 * fields that cannot match, and would additionally reach into
 * `definition`, which is the sibling row's population. This edits the
 * single field directly and rebuilds the entry around it.
 */
const dupAnchorLanguageRef: Rule = {
	apply(entry: SourceEntry): TransformResult {
		const html = entry.language_reference;
		if (html === undefined) {
			return { entry, records: [] };
		}
		const { text, trapped } = dropOuterLayers(html, 'href');
		if (trapped.length === 0) {
			return { entry, records: [] };
		}
		return {
			entry: { ...entry, language_reference: text },
			records: recordsFor(trapped, entry.rid, LANG_ID),
			unlinks: trapped.length,
		};
	},
	id: LANG_ID,
	phase: 'text-repairs',
};

/**
 * Rewrite every definition in the entry, recursing through nested
 * senses — the recursion is the part that is easy to leave out and
 * impossible to notice missing, and `fields.ts`'s `mapSense` and
 * `rules/unlink.ts`'s `unlinkOverDefinitions` walk the same shape for
 * the same reason. One record per PAIR rather than per definition, so
 * the record count is the occurrence count the catalogue row states.
 */
function overDefinitions(entry: SourceEntry): {
	records: TransformRecord[];
	senses: SourceSense[];
} {
	const records: TransformRecord[] = [];
	const walk = (senses: readonly SourceSense[]): SourceSense[] =>
		senses.map((sense) => {
			const out: SourceSense = { ...sense };
			if (sense.definition !== undefined) {
				const { text, trapped } = dropOuterLayers(sense.definition, 'dataRef');
				out.definition = text;
				records.push(...recordsFor(trapped, entry.rid, DEF_ID));
			}
			if (sense.senses !== undefined) {
				out.senses = walk(sense.senses);
			}
			return out;
		});
	return { records, senses: walk(entry.content.senses) };
}

/**
 * `nested-anchor-swallows-punctuation`: the doubled anchor inside a
 * sense, 475 occurrences across 465 entries, keyed on the shared
 * `data-ref`.
 *
 * This row owns ALL 465 entries, the 10 `jt-double-wrapped-citation`
 * ones included — that row is exactly this one's empty-trapped-text
 * arm and registers no rule of its own.
 *
 * NO GATE KNOWS THAT, and an earlier version of this comment claimed
 * one did. The mutual `entangledWith` edge in `patterns.jsonl` is
 * real, but it is documentary in both directions: `coverage()`
 * (`registry.ts`) filters the catalogue to `route === 'transform' &&
 * status === 'candidate'` and partitions it across `RULES` and
 * `PENDING` — it never reads `entangledWith` at all — and
 * `entangledClusters` keeps a component only when it has at least two
 * REGISTERED members or names a stale endpoint, which this one will
 * have neither of once this rule is the component's only rule. So the
 * edge records the entanglement for a human and changes what no check
 * sees.
 *
 * What that leaves open is a real, currently-false claim, not a
 * cosmetic one: `jt-double-wrapped-citation` is still in
 * `registry.ts`'s `PENDING` list, and that file's own comment defines
 * a `PENDING` entry as "a standing claim that a row is still owed a
 * rule". Shipping this rule makes that claim false. TASK 7 MUST
 * RESOLVE IT — by withdrawing the row to `judgment` or otherwise
 * accounting for it — and no gate will fail until it does, because a
 * row in `PENDING` is exactly what `coverage()` expects to find.
 */
const nestedAnchorDuplicate: Rule = {
	apply(entry: SourceEntry): TransformResult {
		const { records, senses } = overDefinitions(entry);
		if (records.length === 0) {
			return { entry, records: [] };
		}
		return {
			entry: { ...entry, content: { ...entry.content, senses } },
			records,
			unlinks: records.length,
		};
	},
	id: DEF_ID,
	phase: 'text-repairs',
};

export { dupAnchorLanguageRef, nestedAnchorDuplicate };
