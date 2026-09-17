/**
 * Sense-tree and tag helpers shared across the body model. Extracted
 * from `census.ts`, archived at `refs/tags/archive/v2-research-2026-09`
 * (consolidation spec §8), so the census tool could be archived
 * without taking its callers with it; the bodies are unchanged from
 * that file.
 */
import type { SourceSense } from './types.ts';

type Boundary =
	| 'sense-start'
	| 'period'
	| 'dash'
	| 'semicolon'
	| 'comma'
	| 'embedded';

/** One stripping pass: remove every `<…>` tag, left to right.
 *
 * This is the exact language the `/<[^>]+>/gu` replace it supersedes
 * matched — `<`, one or more non-`>` characters, `>` — scanned
 * linearly instead of by backtracking. The regex was quadratic
 * (SonarCloud typescript:S8786): on a long run of `<` with no `>`,
 * `[^>]+` ran to the end of the input at every start position before
 * failing (measured 2026-09-17: 21,644 ms on 200,000 `<`, against
 * under 1 ms here).
 *
 * The equivalence was re-established for the rewrite, not inherited:
 * 4,479,410 comparisons over all 32,512 source entries — every string
 * field, and every prefix cut at a `<` or `>`, which is the shape
 * `units.ts` actually feeds in — with zero mismatches. The obvious
 * alternative fix, narrowing the class to `[^<>]`, was rejected by
 * that same run: it differs on 360 of those slices and changes 5
 * boundary classifications. `sense-walk.test.ts` carries the regex as
 * an oracle so the equivalence stays pinned. */
const stripTagsOnce = (text: string): string => {
	let out = '';
	let kept = 0;
	let open = text.indexOf('<');
	while (open !== -1) {
		const close = text.indexOf('>', open + 1);
		if (close === -1) {
			break;
		}
		if (close === open + 1) {
			// `<>` — `[^>]+` needs a character, so no match starts
			// here; the regex would resume from the next `<`.
			open = text.indexOf('<', open + 1);
			continue;
		}
		out += text.slice(kept, open);
		kept = close + 1;
		open = text.indexOf('<', kept);
	}
	// `kept` only moves on a match, so 0 means nothing was stripped.
	return kept === 0 ? text : out + text.slice(kept);
};

// Strips to a fixed point so fragments re-composed by one pass
// (`<scr<i>ipt>`-style) can't survive (CodeQL js/incomplete-
// multi-character-sanitization); corpus-verified byte-identical to
// the single-pass version over all 32,512 entries. The loop is
// defensive rather than load-bearing: because the match class admits
// `<`, an earlier `<` always wins the leftmost match, so no pass can
// hand the next one a tag it didn't already have. That is why the
// fixed point costs nothing — and it is still what answers the
// CodeQL rule, so it stays.
const stripTags = (text: string): string => {
	let out = text;
	let prev: string;
	do {
		prev = out;
		out = stripTagsOnce(out);
	} while (out !== prev);
	return out;
};

/** Classify the (tag-stripped) text immediately before a citation
 * anchor into the punctuation class it ends on. Empty text means the
 * anchor opens its sense outright. */
function classifyBoundary(before: string): Boundary {
	const t = stripTags(before).trimEnd();
	if (t === '') {
		return 'sense-start';
	}
	if (t.endsWith('—')) {
		return 'dash';
	}
	if (t.endsWith('.')) {
		return 'period';
	}
	if (t.endsWith(';')) {
		return 'semicolon';
	}
	if (t.endsWith(',')) {
		return 'comma';
	}
	return 'embedded';
}

/** Depth-first walk over a sense tree, yielding every node including
 * nested sub-senses. Shared with later tasks (grammar/labels/units). */
function* walkSenses(senses: SourceSense[]): Generator<SourceSense> {
	for (const sense of senses) {
		yield sense;
		if (sense.senses) {
			yield* walkSenses(sense.senses);
		}
	}
}

export type { Boundary };
export { classifyBoundary, stripTags, walkSenses };
