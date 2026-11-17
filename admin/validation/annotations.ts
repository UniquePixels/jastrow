/**
 * Checks that an entry's `annotations` list and the references to it
 * agree.
 */
import { annotateIds } from '../lib/annotate.ts';
import { entryFields } from './fields.ts';
import type { Entry, Sense } from './schema.ts';

/**
 * A reference to an annotation: the path of the field carrying it, and
 * the id it names.
 */
type Reference = readonly [path: string, id: string];

/** A sense carrying an `annotation` pointer, and the path of that field. */
type Pointer = readonly [path: string, sense: Sense & { annotation: string }];

/**
 * Yields every sense of a sense tree that carries an `annotation`
 * pointer, depth first.
 *
 * @param senses - The senses to walk.
 * @param at - The path of `senses` within the entry.
 * @returns Each pointer's path and sense.
 */
function* senseTreePointers(
	senses: readonly Sense[],
	at: string,
): Generator<Pointer> {
	for (const [i, sense] of senses.entries()) {
		const { annotation } = sense;
		if (annotation !== undefined) {
			yield [`${at}[${i}].annotation`, { ...sense, annotation }];
		}
		yield* senseTreePointers(sense.senses ?? [], `${at}[${i}].senses`);
	}
}

/**
 * Yields every `annotation` pointer of an entry: its own senses first,
 * then each stem's.
 *
 * @param entry - The entry to walk.
 * @returns Each pointer's path and sense.
 */
function* pointers(entry: Entry): Generator<Pointer> {
	yield* senseTreePointers(entry.senses, 'senses');
	for (const [i, stem] of (entry.stems ?? []).entries()) {
		yield* senseTreePointers(stem.senses, `stems[${i}].senses`);
	}
}

/**
 * Yields every reference to an annotation in an entry: each
 * `<annotate>` tag in a field that may carry markup, then each sense
 * pointer.
 *
 * @param entry - The entry to walk.
 * @returns Each reference's path and the id it names.
 */
function* references(entry: Entry): Generator<Reference> {
	for (const { markup, path, text } of entryFields(entry)) {
		if (markup !== 'none') {
			for (const id of annotateIds(text)) {
				yield [path, id];
			}
		}
	}
	for (const [path, sense] of pointers(entry)) {
		yield [path, sense.annotation];
	}
}

/**
 * Reports each `annotation` pointer on a sense that has no `label`.
 *
 * @param entry - The entry to check.
 * @param problems - The list problems are appended to.
 */
function checkPointerLabels(entry: Entry, problems: string[]): void {
	for (const [path, sense] of pointers(entry)) {
		if (sense.label === undefined) {
			problems.push(
				`${entry.id}: ${path}: points to ${sense.annotation} from a sense with no label; the pointer annotates the label`,
			);
		}
	}
}

/**
 * Checks an entry's annotations: each id names one annotation, each
 * reference names an annotation the entry holds, each pointer is on a
 * labelled sense, and each annotation is referenced exactly once.
 *
 * @param entry - A schema-valid entry.
 * @param problems - The list problems are appended to.
 */
function checkAnnotations(entry: Entry, problems: string[]): void {
	const list = entry.annotations ?? [];
	const held = new Map<string, number>();
	for (const [i, { id }] of list.entries()) {
		const first = held.get(id);
		if (first === undefined) {
			held.set(id, i);
		} else {
			problems.push(
				`${entry.id}: annotations[${i}]: ${id} is the id of annotations[${first}] too; an id names one annotation`,
			);
		}
	}
	checkPointerLabels(entry, problems);
	const counts = new Map<string, number>();
	for (const [path, id] of references(entry)) {
		if (held.has(id)) {
			counts.set(id, (counts.get(id) ?? 0) + 1);
		} else {
			problems.push(
				`${entry.id}: ${path}: points to ${id}, which annotations does not hold`,
			);
		}
	}
	for (const [id, i] of held) {
		const count = counts.get(id) ?? 0;
		if (count !== 1) {
			problems.push(
				`${entry.id}: annotations[${i}]: ${id} is referenced ${count} times; it must be referenced once`,
			);
		}
	}
}

export { checkAnnotations };
