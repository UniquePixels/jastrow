/**
 * The import's half of annotations (ANNOTATIONS.md §3; ruling `10-13
 * correction policy`): a patch left a draft — what it states, and its
 * id as `source` — and the import adds the rest of the entry's
 * `Annotation`, `field` and `stored`, from where the patched value
 * landed once the build has run. `finishEntry` calls these after it
 * has parsed the line and translated each sense, since `stored` is
 * the value as written.
 */
import { intToRoman } from '../../entry/headwords.ts';
import type { Annotation, FormObject, Sense } from '../../entry/types.ts';
import { countOccurrences } from '../patch/schema.ts';
import type {
	AnnotationNote,
	FormAnnotationDraft,
	SenseAnnotationDraft,
} from '../types.ts';
import { type RefResolver, translateMarkup } from './markup.ts';

/** An entry annotation from what the patch stated and what the import
 * found, in ANNOTATIONS.md §2's key order — the order the file is
 * read in. */
function annotationOf(
	note: AnnotationNote,
	field: Annotation['field'],
	stored: string,
): Annotation {
	return {
		field,
		kind: note.kind,
		printed: note.printed,
		stored,
		evidence: note.evidence,
		source: note.source,
		date: note.date,
	};
}

/** Put each form draft a patch left (`SourceEntry.formAnnotations`) on
 * the parsed form it names, with `stored` read off that form: its
 * `text`, or its homograph as print writes it (`intToRoman`, as the
 * name does). A problem for every draft the line cannot take: an index
 * the parse did not produce, or a homograph draft on a form with none.
 * Run after `applyHomographs`, which is what gives a form the numeral
 * an annotated `reform` set. */
function applyFormAnnotations(
	rid: string,
	forms: readonly FormObject[],
	drafts: readonly FormAnnotationDraft[],
): string[] {
	const problems: string[] = [];
	for (const draft of drafts) {
		const form = forms[draft.form];
		const where = `${rid}: headwords[${draft.form}]: the annotation from ${draft.source}`;
		if (form === undefined) {
			problems.push(`${where}: there is no headwords[${draft.form}]`);
			continue;
		}
		if (draft.field === 'homograph' && form.homograph === undefined) {
			problems.push(`${where}: the form has no homograph`);
			continue;
		}
		const stored =
			draft.field === 'text' ? form.text : intToRoman(form.homograph ?? 0);
		form.annotations = [
			...(form.annotations ?? []),
			annotationOf(draft, draft.field, stored),
		];
	}
	return problems;
}

/** The fields of a translated sense a text draft may land in, by name:
 * a `gloss` draft looks in the gloss, a `units` draft in the units, a
 * `gloss-or-units` draft (a `replace`) in both. */
function textFields(
	sense: Sense,
	field: 'gloss' | 'gloss-or-units' | 'units',
): [Annotation['field'], string][] {
	const gloss: [Annotation['field'], string][] = [['gloss', sense.gloss]];
	const units = sense.units.map((unit, j): [Annotation['field'], string] => [
		`units[${j}]`,
		unit,
	]);
	if (field === 'gloss') {
		return gloss;
	}
	return field === 'units' ? units : [...gloss, ...units];
}

/** What a text draft's `find` reads as once translated, alone: the
 * text `stored` must hold, since the field it landed in was translated
 * the same way. `undefined` when the fragment does not balance on its
 * own, which leaves what it reads as inside its field a guess. */
function translatedFind(
	find: string,
	resolve: RefResolver,
): string | undefined {
	const alone = translateMarkup(find, resolve);
	return alone.problems.length === 0 ? alone.text : undefined;
}

/** One sense draft resolved against its translated sense: the
 * annotation, or why it cannot be written. A `label` draft takes the
 * label; a text draft takes the one gloss or unit its `find` occurs in,
 * exactly once across the fields it may land in. */
function resolveSenseDraft(
	sense: Sense,
	draft: SenseAnnotationDraft,
	resolve: RefResolver,
): Annotation | string {
	if (draft.field === 'label') {
		return sense.label === undefined
			? 'the sense has no label'
			: annotationOf(draft, 'label', sense.label);
	}
	const stored = translatedFind(draft.find, resolve);
	if (stored === undefined) {
		return `the text ${JSON.stringify(draft.find)} is not balanced markup on its own, so where it lands cannot be read`;
	}
	const fields = textFields(sense, draft.field);
	const hits = fields.flatMap(([field, text]) =>
		Array.from({ length: countOccurrences(text, stored) }, () => field),
	);
	const [only] = hits;
	if (hits.length === 1 && only !== undefined) {
		return annotationOf(draft, only, stored);
	}
	const where = {
		gloss: 'gloss',
		'gloss-or-units': 'gloss or unit',
		units: 'unit',
	}[draft.field];
	return hits.length === 0
		? `the text ${JSON.stringify(stored)} occurs in no ${where} of its sense`
		: `the text ${JSON.stringify(stored)} occurs ${hits.length} times in its sense's ${where}s; it must occur once`;
}

export { applyFormAnnotations, resolveSenseDraft };
