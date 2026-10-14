/**
 * The annotation clause of the entry contract (ANNOTATIONS.md §2;
 * ruling `10-13 correction policy`): what an `annotations` list on a
 * form or a sense must satisfy beyond its schema shape.
 *
 * The schema (`data/schema/entry.schema.json`, `$defs.annotation`)
 * holds the shape: the enums, `source` as `P` + 6 digits, `date` as
 * `YYYY-MM-DD`, a non-empty `evidence`, `field` one of the five shapes,
 * and a list never empty. `validate.ts` runs the schema first, so this
 * module assumes the shape and checks what JSON Schema cannot say:
 *
 * - `date` is a real calendar date;
 * - the field resolves on its object: `text` and `homograph` only on a
 *   form, and `homograph` only where the form has one; `gloss`,
 *   `label` and `units[n]` only on a sense, `label` only where it has
 *   one and `units[n]` only for `n < units.length`;
 * - `stored` agrees with the field: equal to `text` or `label`, equal
 *   to the homograph's Roman numeral (`intToRoman`, the rendering the
 *   name uses), a substring of `gloss` or `units[n]`;
 * - `kind: 'kept'` ⇔ `printed === stored`;
 * - at most one annotation per field per object.
 *
 * Every string an annotation holds is in NFC by the validator's
 * generic walk (`checkNfc`), which reads every stored string. Whether
 * `source` names a real patch is not answerable here: the patch records
 * are pipeline data, and only the import's gate 10 holds both sides.
 */
import { intToRoman } from './headwords.ts';
import type { Annotation, Entry, FormObject, Sense } from './types.ts';

/** `YYYY-MM-DD`, the shape the schema's `date` pattern holds; whether
 * the day exists is `isIsoDate`'s second half. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/u;
/** A `units[n]` field, its index captured. */
const UNITS_FIELD = /^units\[(?<n>\d+)\]$/u;

/** Whether `value` is an ISO calendar date: the `YYYY-MM-DD` shape,
 * and a day the calendar has (`2026-02-30` has the shape and is not
 * one). Exported so the patch schema holds a patch's `annotation.date`
 * to the same rule the entry meets. */
function isIsoDate(value: string): boolean {
	if (!ISO_DATE.test(value)) {
		return false;
	}
	const day = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(day.getTime()) && day.toISOString().startsWith(value);
}

/** The object an annotation list sits on. */
type Owner =
	| { form: FormObject; kind: 'form' }
	| { kind: 'sense'; sense: Sense };

/** One object carrying annotations, with a readable path to it. */
interface AnnotatedObject {
	annotations: readonly Annotation[];
	owner: Owner;
	path: string;
}

/** One annotation of an entry, with a readable path to it
 * (`senses[0].annotations[1]`). */
interface EntryAnnotation {
	annotation: Annotation;
	path: string;
}

/** Every sense of a sense tree that carries annotations, depth first. */
function* annotatedSenses(
	senses: readonly Sense[],
	at: string,
): Generator<AnnotatedObject> {
	for (const [i, sense] of senses.entries()) {
		const path = `${at}[${i}]`;
		if (sense.annotations !== undefined) {
			yield {
				annotations: sense.annotations,
				owner: { kind: 'sense', sense },
				path,
			};
		}
		yield* annotatedSenses(sense.senses ?? [], `${path}.senses`);
	}
}

/** Every object of an entry that carries annotations: the forms, then
 * the senses, then each stem's senses, nested senses included. */
function* annotatedObjects(entry: Entry): Generator<AnnotatedObject> {
	for (const [i, form] of entry.headwords.entries()) {
		if (form.annotations !== undefined) {
			yield {
				annotations: form.annotations,
				owner: { form, kind: 'form' },
				path: `headwords[${i}]`,
			};
		}
	}
	yield* annotatedSenses(entry.senses, 'senses');
	for (const [i, stem] of (entry.stems ?? []).entries()) {
		yield* annotatedSenses(stem.senses, `stems[${i}].senses`);
	}
}

/** Every annotation of an entry, in `annotatedObjects` order. The
 * walk a reader that wants them all takes — the import's gate 10, the
 * blessing count, and compile when it is written. */
function* entryAnnotations(entry: Entry): Generator<EntryAnnotation> {
	for (const { annotations, path } of annotatedObjects(entry)) {
		for (const [i, annotation] of annotations.entries()) {
			yield { annotation, path: `${path}.annotations[${i}]` };
		}
	}
}

/** What a field holds on its object: the whole value `stored` must
 * equal, or (`whole: false`) a text `stored` must occur in.
 * `undefined` when the field does not resolve on this object. */
function heldBy(
	owner: Owner,
	field: string,
): { value: string; whole: boolean } | undefined {
	if (owner.kind === 'form') {
		const { form } = owner;
		if (field === 'text') {
			return { value: form.text, whole: true };
		}
		return field === 'homograph' && form.homograph !== undefined
			? { value: intToRoman(form.homograph), whole: true }
			: undefined;
	}
	const { sense } = owner;
	if (field === 'gloss') {
		return { value: sense.gloss, whole: false };
	}
	if (field === 'label') {
		return sense.label === undefined
			? undefined
			: { value: sense.label, whole: true };
	}
	const n = UNITS_FIELD.exec(field)?.groups?.['n'];
	const unit = n === undefined ? undefined : sense.units[Number(n)];
	return unit === undefined ? undefined : { value: unit, whole: false };
}

/** The problems of one annotation against the object it sits on. */
function oneAnnotation(owner: Owner, annotation: Annotation): string[] {
	const { date, field, kind, printed, stored } = annotation;
	const problems: string[] = [];
	if (!isIsoDate(date)) {
		problems.push(`date ${date} is not a calendar date`);
	}
	const held = heldBy(owner, field);
	if (held === undefined) {
		problems.push(`field ${field} does not resolve on a ${owner.kind}`);
	} else if (held.whole && stored !== held.value) {
		problems.push(`stored "${stored}" but ${field} holds "${held.value}"`);
	} else if (!(held.whole || held.value.includes(stored))) {
		problems.push(`stored "${stored}" does not occur in ${field}`);
	}
	if (kind === 'kept' && printed !== stored) {
		problems.push(
			`kind kept, but printed "${printed}" is not stored "${stored}"`,
		);
	} else if (kind !== 'kept' && printed === stored) {
		problems.push(`kind ${kind}, but printed equals stored "${stored}"`);
	}
	return problems;
}

/** The annotation clause over one entry (see the module docstring),
 * every problem as `<id>: <path>: <problem>`. Called by `checkEntry`
 * after the schema passed. */
function checkAnnotations(entry: Entry, problems: string[]): void {
	for (const { annotations, owner, path } of annotatedObjects(entry)) {
		const perField = new Map<string, number>();
		for (const [i, annotation] of annotations.entries()) {
			for (const problem of oneAnnotation(owner, annotation)) {
				problems.push(`${entry.id}: ${path}.annotations[${i}]: ${problem}`);
			}
			perField.set(annotation.field, (perField.get(annotation.field) ?? 0) + 1);
		}
		for (const [field, count] of perField) {
			if (count > 1) {
				problems.push(
					`${entry.id}: ${path}: ${count} annotations on ${field}; at most one per field`,
				);
			}
		}
	}
}

export type { EntryAnnotation };
export { checkAnnotations, entryAnnotations, isIsoDate };
