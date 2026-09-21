/**
 * The walk the class detectors share: every sense of a finished truth
 * entry in document order — a top-level sense, then its children, then
 * the next sibling, and finally each stem's sequence the same way —
 * with the path a report row names, and one sense's OWN markup fields.
 *
 * `fieldsOf` yields a sense's gloss and units and never a child's, so
 * a predicate written against "a sense's text" reads exactly that one
 * sense. Walk the children separately when a predicate wants them.
 */
import type { TruthEntry, TruthSense } from '../types.ts';

/** One sense and the path that names it, e.g. `stems[1].senses[0]`. */
interface SenseAt {
	path: string;
	sense: TruthSense;
}

/** One sense sequence and everything under it, in document order. */
function* walkSequence(
	senses: readonly TruthSense[],
	at: string,
): Generator<SenseAt> {
	for (const [i, sense] of senses.entries()) {
		const path = `${at}[${i}]`;
		yield { path, sense };
		yield* walkSequence(sense.senses ?? [], `${path}.senses`);
	}
}

/** Every sense of the entry: the top-level tree, then each stem's. */
function* walkSenses(entry: TruthEntry): Generator<SenseAt> {
	yield* walkSequence(entry.senses, 'senses');
	for (const [i, stem] of (entry.stems ?? []).entries()) {
		yield* walkSequence(stem.senses, `stems[${i}].senses`);
	}
}

/** One sense's own markup fields — gloss then units — each with the
 * path a row names. */
function* fieldsOf({ path, sense }: SenseAt): Generator<[string, string]> {
	yield [`${path}.gloss`, sense.gloss];
	for (const [j, unit] of sense.units.entries()) {
		yield [`${path}.units[${j}]`, unit];
	}
}

/** Every markup field of the entry, in document order. */
function* markupFields(entry: TruthEntry): Generator<[string, string]> {
	for (const at of walkSenses(entry)) {
		yield* fieldsOf(at);
	}
}

export type { SenseAt };
export { fieldsOf, markupFields, walkSenses, walkSequence };
