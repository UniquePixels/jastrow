/**
 * The text fields of an entry, each with its path and the markup it
 * may carry.
 */
import type { Entry, Sense } from './schema.ts';

/**
 * Yields the gloss and units of every sense of a sense tree, depth
 * first.
 *
 * @param senses - The senses to walk.
 * @param at - The path of `senses` within the entry.
 * @returns Each field's path and text.
 */
function* senseTexts(
	senses: readonly Sense[],
	at: string,
): Generator<[string, string]> {
	for (const [i, sense] of senses.entries()) {
		yield [`${at}[${i}].gloss`, sense.gloss];
		for (const [j, unit] of sense.units.entries()) {
			yield [`${at}[${i}].units[${j}]`, unit];
		}
		yield* senseTexts(sense.senses ?? [], `${at}[${i}].senses`);
	}
}

/**
 * Yields every field of an entry that may carry the full markup
 * vocabulary: sense glosses and units, and stem labels and forms.
 *
 * @param entry - The entry to walk.
 * @returns Each field's path and text.
 */
function* markupFields(entry: Entry): Generator<[string, string]> {
	yield* senseTexts(entry.senses, 'senses');
	for (const [i, stem] of (entry.stems ?? []).entries()) {
		yield [`stems[${i}].stem`, stem.stem];
		for (const [j, form] of stem.forms.entries()) {
			yield [`stems[${i}].forms[${j}]`, form];
		}
		yield* senseTexts(stem.senses, `stems[${i}].senses`);
	}
}

/**
 * Yields the label of every labelled sense of a sense tree, depth
 * first.
 *
 * @param senses - The senses to walk.
 * @param at - The path of `senses` within the entry.
 * @returns Each label's path and text.
 */
function* senseLabels(
	senses: readonly Sense[],
	at: string,
): Generator<[string, string]> {
	for (const [i, sense] of senses.entries()) {
		if (sense.label !== undefined) {
			yield [`${at}[${i}].label`, sense.label];
		}
		yield* senseLabels(sense.senses ?? [], `${at}[${i}].senses`);
	}
}

/**
 * Yields every field of an entry that may carry no markup:
 * `sefariaHeadword`, headword texts and sense labels.
 *
 * @param entry - The entry to walk.
 * @returns Each field's path and text.
 */
function* plainFields(entry: Entry): Generator<[string, string]> {
	yield ['sefariaHeadword', entry.sefariaHeadword];
	for (const [i, form] of entry.headwords.entries()) {
		yield [`headwords[${i}].text`, form.text];
	}
	yield* senseLabels(entry.senses, 'senses');
	for (const [i, stem] of (entry.stems ?? []).entries()) {
		yield* senseLabels(stem.senses, `stems[${i}].senses`);
	}
}

/**
 * The markup a field may carry: none, the `annotate` tag alone, or the
 * full vocabulary.
 */
type FieldMarkup = 'annotate' | 'none' | 'vocabulary';

/**
 * A text field of an entry: its path, its text and the markup it may
 * carry.
 */
interface EntryField {
	markup: FieldMarkup;
	path: string;
	text: string;
}

/**
 * Yields every text field of an entry: the plain fields, then
 * `display`, then the markup fields. Annotations and non-text values
 * (ids, enums, numbers) are not fields.
 *
 * @param entry - The entry to walk.
 * @returns Each field.
 */
function* entryFields(entry: Entry): Generator<EntryField> {
	for (const [path, text] of plainFields(entry)) {
		yield { markup: 'none', path, text };
	}
	if (entry.display !== undefined) {
		yield { markup: 'annotate', path: 'display', text: entry.display };
	}
	for (const [path, text] of markupFields(entry)) {
		yield { markup: 'vocabulary', path, text };
	}
}

export type { EntryField, FieldMarkup };
export { entryFields, markupFields };
