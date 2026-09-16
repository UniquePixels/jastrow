/**
 * Sense-tree and tag helpers shared across the body model. Extracted
 * from `census.ts` (consolidation spec §8) so the census tool could be
 * archived without taking its callers with it; the bodies are
 * unchanged from that file.
 */
import type { SourceSense } from './types.ts';

type Boundary =
	| 'sense-start'
	| 'period'
	| 'dash'
	| 'semicolon'
	| 'comma'
	| 'embedded';

const TAGS = /<[^>]+>/gu;
// Strips to a fixed point so fragments re-composed by one pass
// (`<scr<i>ipt>`-style) can't survive (CodeQL js/incomplete-
// multi-character-sanitization); corpus-verified byte-identical to
// the single-pass version over all 32,512 entries.
const stripTags = (text: string): string => {
	let out = text;
	let prev: string;
	do {
		prev = out;
		out = out.replace(TAGS, '');
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
 * nested sub-senses. */
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
