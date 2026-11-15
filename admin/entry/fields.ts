/**
 * The text fields of an entry, walked once (ruling `11-15 annotation
 * section`): each with a readable path, its text, and what markup it
 * may carry. The contract's markup check (`validate.ts`) and its
 * annotation clause (`annotations.ts`) read the same walk, so a field
 * one of them sees the other cannot miss. A module of its own because
 * `validate.ts` imports `annotations.ts`.
 */
import type { Entry, Sense } from './schema.ts';

/** The HTML fields of a sense tree, with a readable path to each. */
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

/** Every field that may carry markup. */
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

/** The sense labels of a sense tree (`1`, `a`, …), with their paths. */
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

/** Every field that must carry none: the headword forms and
 * `sefariaHeadword` are identifiers that `url-path.ts` and the
 * compiler read as text; sense labels are numbering. */
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

/** What markup a field may carry: `none` (an identifier or a label),
 * `annotate` (`display`, which carries the annotate tag and nothing
 * else) or `vocabulary` (the whole `VOCABULARY` of `validate.ts`). */
type FieldMarkup = 'annotate' | 'none' | 'vocabulary';

/** One text field of an entry: a readable path to it (`senses[0].units[1]`),
 * its text, and what markup it may carry. */
interface EntryField {
	markup: FieldMarkup;
	path: string;
	text: string;
}

/** Every text field of an entry, nested senses and stems included:
 * the plain identifier and label fields first, then `display`, which
 * may carry the annotate tag alone, then every field that may carry
 * the whole vocabulary. The validator's markup checks read through this,
 * so a reader that walks it — compile, when it is written — sees the
 * same fields the contract checked.
 *
 * Codes are not text and are not visited: `id`, `schemaVersion`,
 * `grammar`, `page` and a form's `gender`, `homograph`,
 * `reconstructed` and `partial`.
 *
 * Nor are the entry's `annotations` (ruling `11-15 annotation
 * section`). An annotation is shown to the reader beside the text it
 * is pointed to from, not in it: its strings are plain, its `printed`
 * is print's value and may be `''`. The text carries the pointers,
 * and `annotations.ts` checks them; `checkNfc`, which reads every
 * stored string, covers the annotations' spelling. */
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
