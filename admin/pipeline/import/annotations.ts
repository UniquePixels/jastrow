/**
 * The import's half of annotations (ruling `11-15 annotation
 * section`): a patch left a draft — what it carries to the entry, and
 * its id as `source` — and the import writes the entry's one
 * `annotations` list, numbers the ids and places what points to each:
 * an `<annotate id>` tag around a form's `{n}` or its homograph
 * numeral in `display`, around the one occurrence of a text draft's
 * translated `find` in a gloss or a unit, or a sense's `annotation`
 * pointer for a label. `finishEntry` calls `placeAnnotations` once it
 * has parsed the line and translated every sense, since a text draft
 * is located in the translated text.
 *
 * The contract (`admin/entry/annotations.ts`) checks only that the
 * references agree. What the import writes it checks here: each draft
 * finds exactly one place, and `kind: 'kept'` holds exactly where
 * `printed` equals what the tag wraps (the form's text, the numeral,
 * the label, or the found text).
 */

import type { Annotation, Entry, Sense } from '../../entry/schema.ts';
import { annotateTag } from '../../lib/annotate.ts';
import { intToRoman } from '../../lib/roman.ts';
import { countOccurrences } from '../patch/schema.ts';
import type {
	AnnotationNote,
	FormAnnotationDraft,
	SenseAnnotationDraft,
} from '../types.ts';
import { type RefResolver, translateMarkup } from './markup.ts';

/** A form's slot in `display`, an annotate close the slot's own tag
 * may have left after it, the spaces print sets, then the Roman
 * numeral token beside it: where a homograph tag goes. */
const SLOT_NUMERAL =
	/\{(?<slot>\d+)\}(?<between>(?:<\/annotate>)? *)(?<numeral>[CLXVI]+)(?![A-Za-z])/gu;

/** A built sense whose drafts wait for placement, with a readable path
 * to it (`stems[0].senses[1]`). */
interface SenseDrafts {
	drafts: readonly SenseAnnotationDraft[];
	path: string;
	sense: Sense;
}

/** One text draft's place in a sense: the field, where the found text
 * starts in it, and the found text. */
interface TextPlace {
	at: number;
	field: string;
	found: string;
}

/** A label draft's place: the sense's label. A symbol, not a string,
 * so it cannot be mistaken for a problem's reason. */
const LABEL = Symbol('label');

/** An entry annotation from what the patch carried and the id it
 * takes, in the ruling's key order — the order the file is read in. */
function annotationOf(note: AnnotationNote, id: string): Annotation {
	return {
		id,
		kind: note.kind,
		printed: note.printed,
		...(note.note === undefined ? {} : { note: note.note }),
		date: note.date,
		source: note.source,
	};
}

/** Why `kind` does not fit `printed` against `marked`, the value the
 * tag or pointer marks, or `undefined` when it fits: `kept` holds
 * exactly where print's value is the one stored. */
function kindProblem(note: AnnotationNote, marked: string): string | undefined {
	if (note.kind === 'kept' && note.printed !== marked) {
		return `kind kept, but printed ${JSON.stringify(note.printed)} is not ${JSON.stringify(marked)}, what it marks`;
	}
	if (note.kind !== 'kept' && note.printed === marked) {
		return `kind ${note.kind}, but printed equals ${JSON.stringify(marked)}, what it marks`;
	}
	return undefined;
}

/** The fields of a translated sense a text draft may land in, by name:
 * a `gloss` draft looks in the gloss, a `units` draft in the units, a
 * `gloss-or-units` draft (a `replace`) in both. */
function textFields(
	sense: Sense,
	field: 'gloss' | 'gloss-or-units' | 'units',
): [string, string][] {
	const gloss: [string, string][] = [['gloss', sense.gloss]];
	const units = sense.units.map((unit, j): [string, string] => [
		`units[${j}]`,
		unit,
	]);
	if (field === 'gloss') {
		return gloss;
	}
	return field === 'units' ? units : [...gloss, ...units];
}

/** What a text draft's `find` reads as once translated, alone: the
 * text the tag wraps, since the field it landed in was translated the
 * same way. `undefined` when the fragment does not balance on its own,
 * which leaves what it reads as inside its field a guess. */
function translatedFind(
	find: string,
	resolve: RefResolver,
): string | undefined {
	const alone = translateMarkup(find, resolve);
	return alone.problems.length === 0 ? alone.text : undefined;
}

/** Where one sense draft lands on its translated sense, or why it
 * cannot: a `label` draft on the label, a text draft on the one gloss
 * or unit its translated `find` occurs in, exactly once across the
 * fields it may land in. Read before any tag is placed on the sense,
 * so a tag cannot be found as text. */
function resolveSenseDraft(
	sense: Sense,
	draft: SenseAnnotationDraft,
	resolve: RefResolver,
): typeof LABEL | TextPlace | string {
	if (draft.field === 'label') {
		return sense.label === undefined ? 'the sense has no label' : LABEL;
	}
	const found = translatedFind(draft.find, resolve);
	if (found === undefined) {
		return `the text ${JSON.stringify(draft.find)} is not balanced markup on its own, so where it lands cannot be read`;
	}
	const hits = textFields(sense, draft.field).flatMap(([field, text]) =>
		Array.from({ length: countOccurrences(text, found) }, () => ({
			at: text.indexOf(found),
			field,
			found,
		})),
	);
	const [only] = hits;
	if (hits.length === 1 && only !== undefined) {
		return only;
	}
	const where = {
		gloss: 'gloss',
		'gloss-or-units': 'gloss or unit',
		units: 'unit',
	}[draft.field];
	return hits.length === 0
		? `the text ${JSON.stringify(found)} occurs in no ${where} of its sense`
		: `the text ${JSON.stringify(found)} occurs ${hits.length} times in its sense's ${where}s; it must occur once`;
}

/** Read one field of a sense by name (`gloss`, `units[2]`). */
function fieldText(sense: Sense, field: string): string {
	return field === 'gloss'
		? sense.gloss
		: (sense.units[Number(field.slice('units['.length, -1))] ?? '');
}

/** Write one field of a sense by name. */
function setFieldText(sense: Sense, field: string, text: string): void {
	if (field === 'gloss') {
		sense.gloss = text;
	} else {
		sense.units[Number(field.slice('units['.length, -1))] = text;
	}
}

/** The ids, numbered in the order annotations are placed: `a1`, `a2`… */
interface Numbering {
	list: Annotation[];
}

/** Take the next id for `note` and append its annotation. */
function take(numbering: Numbering, note: AnnotationNote): string {
	const id = `a${numbering.list.length + 1}`;
	numbering.list.push(annotationOf(note, id));
	return id;
}

/** Place one form draft's tag in `display`, returning the new display
 * or why it cannot: around the form's `{n}` for a `text` draft, around
 * the numeral beside it for a `homograph` draft. */
function placeFormDraft(
	entry: Entry,
	draft: FormAnnotationDraft,
	numbering: Numbering,
): string | undefined {
	const form = entry.headwords[draft.form];
	if (form === undefined) {
		return `there is no headwords[${draft.form}]`;
	}
	if (draft.field === 'homograph' && form.homograph === undefined) {
		return 'the form has no homograph';
	}
	const { display } = entry;
	if (display === undefined) {
		return 'the entry has no display to carry its tag';
	}
	const slot = `{${draft.form}}`;
	if (draft.field === 'text') {
		if (countOccurrences(display, slot) !== 1) {
			return `display holds ${slot} ${countOccurrences(display, slot)} times; it must hold it once`;
		}
		const id = take(numbering, draft);
		entry.display = display.replace(slot, annotateTag(id, slot));
		return kindProblem(draft, form.text);
	}
	const numeral = intToRoman(form.homograph ?? 0);
	const match = [...display.matchAll(SLOT_NUMERAL)].find(
		(m) => m.groups?.['slot'] === String(draft.form),
	);
	if (match?.groups?.['numeral'] !== numeral) {
		return `display sets no ${numeral} beside ${slot}`;
	}
	const id = take(numbering, draft);
	const start = (match.index ?? 0) + match[0].length - numeral.length;
	entry.display =
		display.slice(0, start) +
		annotateTag(id, numeral) +
		display.slice(start + numeral.length);
	return kindProblem(draft, numeral);
}

/** A text draft's place, with the id it took. */
type PlacedTag = TextPlace & { id: string };

/** The placement state of one sense: the entry's numbering, and the
 * text tags queued for `placeSenseDrafts` to write. */
interface SensePlacing {
	numbering: Numbering;
	tags: PlacedTag[];
}

/** Place one sense draft: point the sense to a label draft, or queue a
 * text draft's tag in `tags` for `placeSenseDrafts` to write. Returns
 * why it cannot be placed, or why its `kind` does not fit what it
 * marks; `undefined` when neither. */
function placeSenseDraft(
	sense: Sense,
	draft: SenseAnnotationDraft,
	place: typeof LABEL | TextPlace,
	{ numbering, tags }: SensePlacing,
): string | undefined {
	if (place === LABEL) {
		if (sense.annotation !== undefined) {
			return `the label already points to ${sense.annotation}`;
		}
		sense.annotation = take(numbering, draft);
		return kindProblem(draft, sense.label ?? '');
	}
	const overlap = tags.find(
		(t) =>
			t.field === place.field &&
			t.at < place.at + place.found.length &&
			place.at < t.at + t.found.length,
	);
	if (overlap !== undefined) {
		return `its text overlaps the text ${overlap.id} marks`;
	}
	tags.push({ ...place, id: take(numbering, draft) });
	return kindProblem(draft, place.found);
}

/** Place every draft of one sense: each resolved against the sense as
 * translated, numbered in draft order, then the text tags written from
 * the end of each field back, so one tag cannot move another's place.
 * Returns the problems, each `<reason>` for the caller to prefix. */
function placeSenseDrafts(
	{ drafts, sense }: SenseDrafts,
	resolve: RefResolver,
	numbering: Numbering,
): [AnnotationNote, string][] {
	const problems: [AnnotationNote, string][] = [];
	const tags: PlacedTag[] = [];
	for (const draft of drafts) {
		const place = resolveSenseDraft(sense, draft, resolve);
		const problem =
			typeof place === 'string'
				? place
				: placeSenseDraft(sense, draft, place, { numbering, tags });
		if (problem !== undefined) {
			problems.push([draft, problem]);
		}
	}
	for (const tag of tags.toSorted((a, b) => b.at - a.at)) {
		const text = fieldText(sense, tag.field);
		setFieldText(
			sense,
			tag.field,
			text.slice(0, tag.at) +
				annotateTag(tag.id, tag.found) +
				text.slice(tag.at + tag.found.length),
		);
	}
	return problems;
}

/** Where a form's field falls among its drafts: text first. */
const FIELD_RANK: Record<FormAnnotationDraft['field'], number> = {
	homograph: 1,
	text: 0,
};

/** The order form drafts take ids in: by form index, a form's `text`
 * before its `homograph`, then draft order (a stable sort). */
function formOrder(a: FormAnnotationDraft, b: FormAnnotationDraft): number {
	return a.form - b.form || FIELD_RANK[a.field] - FIELD_RANK[b.field];
}

/** Write the entry's annotations from the drafts its patches left:
 * the form drafts, then each sense's in `senses` order (document order,
 * a sense before its children, the entry's senses before each stem's).
 * Sets `entry.annotations` (absent when none is placed), the tags in
 * `display`, each gloss and unit, and each sense's `annotation`. Every
 * draft that cannot be placed, or whose `kind` does not fit what it
 * marks, is a problem; none throws. */
function placeAnnotations(
	entry: Entry,
	forms: readonly FormAnnotationDraft[],
	senses: readonly SenseDrafts[],
	resolve: RefResolver,
): string[] {
	const problems: string[] = [];
	const numbering: Numbering = { list: [] };
	for (const draft of forms.toSorted(formOrder)) {
		const problem = placeFormDraft(entry, draft, numbering);
		if (problem !== undefined) {
			problems.push(
				`${entry.id}: headwords[${draft.form}]: the annotation from ${draft.source}: ${problem}`,
			);
		}
	}
	for (const pending of senses) {
		for (const [draft, problem] of placeSenseDrafts(
			pending,
			resolve,
			numbering,
		)) {
			problems.push(
				`${entry.id}: ${pending.path}: the annotation from ${draft.source}: ${problem}`,
			);
		}
	}
	if (numbering.list.length > 0) {
		entry.annotations = numbering.list;
	}
	return problems;
}

export type { SenseDrafts };
export { placeAnnotations };
