/**
 * The annotation clause of the entry contract (ruling `11-15
 * annotation section`, clause 3): an entry's `annotations` list and
 * the text that points to it agree.
 *
 * The schema (`data/schema/entry.schema.json`, `$defs.annotation`)
 * holds the shape: the id pattern, the enum, `source` as `P` + 6
 * digits, `date` as `YYYY-MM-DD`, a `note` non-empty when present, and
 * a list never empty. `validate.ts` runs the schema first, and its
 * markup check holds every `<annotate>` tag to its one shape and to
 * closing. This module checks the references, and nothing else:
 *
 * - every reference names an annotation the entry holds;
 * - every id is referenced exactly once;
 * - an id names one annotation.
 *
 * A reference is an `<annotate id>` tag in `display`, a `gloss` or a
 * `units[n]` (read by `annotateIds`, `admin/lib/annotate.ts`), or a
 * sense's `annotation` pointer, stems included.
 *
 * It does not compare an annotation with its patch, its `date` or
 * `kind` with anything, or `printed` with the tagged text (the
 * maintainer: "I want to avoid a bunch of checking/comparing in the
 * validate portion here"). The import checks what it writes; a hand
 * edit is judged by its editor and later by the backport.
 */
import { annotateIds } from '../lib/annotate.ts';
import type { Entry, Sense } from './schema.ts';

/** One reference to an annotation: a readable path to the field that
 * carries it, and the id it names. */
type Reference = readonly [path: string, id: string];

/** Every reference a sense tree carries, depth first, a sense before
 * its children: its gloss's tags, its units' tags, then its label
 * pointer. */
function* senseReferences(
	senses: readonly Sense[],
	at: string,
): Generator<Reference> {
	for (const [i, sense] of senses.entries()) {
		const path = `${at}[${i}]`;
		for (const id of annotateIds(sense.gloss)) {
			yield [`${path}.gloss`, id];
		}
		for (const [j, unit] of sense.units.entries()) {
			for (const id of annotateIds(unit)) {
				yield [`${path}.units[${j}]`, id];
			}
		}
		if (sense.annotation !== undefined) {
			yield [`${path}.annotation`, sense.annotation];
		}
		yield* senseReferences(sense.senses ?? [], `${path}.senses`);
	}
}

/** Every reference an entry carries: `display`, then the senses, then
 * each stem's senses. */
function* references(entry: Entry): Generator<Reference> {
	for (const id of annotateIds(entry.display ?? '')) {
		yield ['display', id];
	}
	yield* senseReferences(entry.senses, 'senses');
	for (const [i, stem] of (entry.stems ?? []).entries()) {
		yield* senseReferences(stem.senses, `stems[${i}].senses`);
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
