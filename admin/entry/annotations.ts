/**
 * The annotation clause of the entry contract (ruling `11-15
 * annotation section`, clause 3): an entry's `annotations` list and
 * the text that points to it agree.
 *
 * The schema (`data/schema/entry.schema.json`, `$defs.annotation`)
 * holds the shape: the id pattern, the enum, `source` as `P` + 6
 * digits, `date` as `YYYY-MM-DD`, a non-empty `note`, and
 * a list never empty. `validate.ts` runs the schema first, and its
 * markup check holds every `<annotate>` tag to its one shape and to
 * closing. This module checks the references, and nothing else:
 *
 * - every reference names an annotation the entry holds;
 * - every id is referenced exactly once;
 * - an id names one annotation;
 * - a sense's `annotation` pointer stands on a sense with a `label`,
 *   the one thing it can annotate (the maintainer, 2026-11-16).
 *
 * A reference is an `<annotate id>` tag in any field that may carry
 * markup (`entryFields`, read by `annotateIds`, `admin/lib/annotate.ts`)
 * — `display`, a `gloss` or a `units[n]` where the import writes them,
 * but a hand edit's tag in a stem field counts too — or a sense's
 * `annotation` pointer, stems included.
 *
 * It does not compare an annotation with its patch, its `date` or
 * `kind` with anything, or `printed` with the tagged text (the
 * maintainer: "I want to avoid a bunch of checking/comparing in the
 * validate portion here"). The import checks what it writes; a hand
 * edit is judged by its editor and later by the backport.
 */
import { annotateIds } from '../lib/annotate.ts';
import { entryFields } from './fields.ts';
import type { Entry, Sense } from './schema.ts';

/** One reference to an annotation: a readable path to the field that
 * carries it, and the id it names. */
type Reference = readonly [path: string, id: string];

/** A sense that carries a label pointer, and the readable path to its
 * `annotation` field. */
type Pointer = readonly [path: string, sense: Sense & { annotation: string }];

/** Every label pointer a sense tree carries, depth first. */
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

/** Every label pointer an entry carries, the entry's senses before
 * each stem's. */
function* pointers(entry: Entry): Generator<Pointer> {
	yield* senseTreePointers(entry.senses, 'senses');
	for (const [i, stem] of (entry.stems ?? []).entries()) {
		yield* senseTreePointers(stem.senses, `stems[${i}].senses`);
	}
}

/** Every reference an entry carries: the tag ids of every field that
 * may carry markup (`entryFields`, so a tag the markup check accepts
 * is a tag counted here, wherever it stands), then every sense's
 * label pointer. */
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

/** A label pointer annotates the label, so it stands only on a sense
 * that has one. */
function checkPointerLabels(entry: Entry, problems: string[]): void {
	for (const [path, sense] of pointers(entry)) {
		if (sense.label === undefined) {
			problems.push(
				`${entry.id}: ${path}: points to ${sense.annotation} from a sense with no label; the pointer annotates the label`,
			);
		}
	}
}

/** The annotation clause over one entry (see the module docstring),
 * every problem as `<id>: <path>: <problem>`. Called by `checkEntry`
 * after the schema passed. */
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
