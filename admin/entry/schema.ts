/**
 * The entry schema: what a file under `data/entries/` holds, whoever
 * wrote it, written once (ruling `11-05 schema source`).
 *
 * Every constant below is a TypeBox schema, which is JSON Schema as it
 * stands: TypeBox's validator checks entries against `EntrySchema`
 * itself, and `schema-build.ts` writes it out as
 * `data/schema/entry.schema.json` for editors (IntelliSense on an
 * entry file) and any reader that is
 * not TypeScript. The types (`Entry`, `Sense`, …) are derived from the
 * same constants, so the schema and the types cannot disagree.
 *
 * A field's `description` is its documentation: it is the hover text
 * an editor shows on an entry file. What a schema cannot express —
 * gender in one place, an annotation's field resolving on its object,
 * NFC, a cite naming an entry that exists — `validate.ts` and
 * `annotations.ts` enforce.
 */
import Type from 'typebox';

/** The entry-file format this schema describes. Version 2 is the
 * headword-design §2 shape: `headwords[]` and an optional `display`
 * in place of `headword`/`altHeadwords`, and `sefariaHeadword` in
 * place of `slug`. Version 3 drops a form's `disambiguator` and the
 * entry's `formerNames` (ruling `11-13 url words`). */
const SCHEMA_VERSION = 3;

/** Fields that are copied from elsewhere VERBATIM and must keep the
 * bytes they were copied from, whatever spelling those are.
 *
 * `sefariaHeadword` is Sefaria's own headword, stored so the Sefaria
 * URL route keeps working after our headword is corrected (URL names
 * spec §5.1, U3). It is a foreign key, not our text: normalizing it
 * would make it a spelling Sefaria does not use. So the import's NFC
 * write (`normalizeForWrite`) leaves it alone, and the contract's NFC
 * check (`validate.ts`) does not ask it to be NFC. One list, read by
 * both, so the writer and the check cannot disagree about which field
 * is exempt. */
const VERBATIM_FIELDS: ReadonlySet<string> = new Set(['sefariaHeadword']);

/** A non-empty string, the shape of most text fields. */
const Text = Type.String({ minLength: 1 });

const AnnotationSchema = Type.Object(
	{
		// The pattern is the schema; the type names what it admits.
		field: Type.Unsafe<
			'gloss' | 'homograph' | 'label' | 'text' | `units[${number}]`
		>(
			Type.String({
				description:
					'Which field of its object: text or homograph on a form; gloss, label or units[n] on a sense.',
				pattern: String.raw`^(?:gloss|homograph|label|text|units\[(?:0|[1-9]\d*)\])$`,
			}),
		),
		kind: Type.Enum(['illegible', 'kept', 'print-error'], {
			description:
				'print-error (case 2, corrected), kept (case 3, kept as printed, so printed equals stored) or illegible (case 4, our best reading).',
		}),
		printed: Type.String({
			description:
				"Print's reading of the field; '' where print sets nothing. A homograph is written as print writes it (I), a label as its token without ) (5).",
		}),
		stored: Type.String({
			description:
				'What the field holds. For gloss and units[n], the substring the note is about.',
		}),
		evidence: Type.String({
			description: 'Case 2: the proof. Case 3: the readings. Case 4: why.',
			minLength: 1,
		}),
		source: Type.String({
			description: 'The patch that wrote it.',
			pattern: String.raw`^P\d{6}$`,
		}),
		date: Type.String({
			description: 'YYYY-MM-DD of the print read or the ruling.',
			pattern: String.raw`^\d{4}-\d{2}-\d{2}$`,
		}),
	},
	{
		additionalProperties: false,
		description:
			"One departure from print, or one print reading checked and kept, on the object whose field it describes (admin/entry/ANNOTATIONS.md §2; ruling 10-13 correction policy). printed is print's reading ('' where print sets nothing), stored what the field holds (for gloss and units[n], the substring the note is about). kind: print-error (case 2), kept (case 3: printed equals stored), illegible (case 4). source is the patch that wrote it. What the schema cannot express — the field resolves on its object, stored agrees with the field, kept iff printed equals stored, one annotation per field, a real calendar date — admin/entry/annotations.ts enforces.",
	},
);

const AnnotationsSchema = Type.Array(Type.Ref('#/$defs/annotation'), {
	description: 'Absent when there are none, never [].',
	minItems: 1,
});

const FormObjectSchema = Type.Object(
	{
		annotations: Type.Optional(Type.Ref('#/$defs/annotations')),
		text: Type.String({
			description:
				'The form as clean Hebrew: meaning only. Everything print sets around the forms lives in the entry’s display.',
			minLength: 1,
		}),
		homograph: Type.Optional(
			Type.Integer({
				description:
					"The Roman numeral beside this form, as a number. Part of the name, and always shown in display. Print sets it, or (ruling 10-13 correction policy) Jastrow's own text names it and a homograph annotation says so.",
				minimum: 1,
			}),
		),
		reconstructed: Type.Optional(
			Type.Literal(true, {
				description:
					'Print stars this form as a reconstructed word (headword design §3.1 rule 3). Only ever true.',
			}),
		),
		gender: Type.Optional(
			Type.Enum(['f', 'm'], {
				description:
					"This form's gender label, as print sets it beside the form (headword design §4). An entry carries at most one of a per-form gender on EVERY headword or a grammar.gender, never both, and neither is inherited (ruling HW-gender). This schema cannot express it; admin/entry/validate.ts enforces it.",
			}),
		),
		partial: Type.Optional(
			Type.Literal(true, {
				description:
					'This form is shown exactly as printed and is never a lookup key (headword design §2): an ending after an ellipsis, or a phrase holding an abbreviated word. Only ever true.',
			}),
		),
	},
	{
		additionalProperties: false,
		description:
			'One headword form. It holds only meaning; how print sets the forms around each other is the entry’s display (headword design §2, §3.1).',
	},
);

const SenseSchema = Type.Object(
	{
		annotations: Type.Optional(Type.Ref('#/$defs/annotations')),
		label: Type.Optional(Text),
		reconstructed: Type.Optional(
			Type.Literal(true, {
				description:
					"Print stars this sense's number (*2)), as it stars a reconstructed headword form (ruling 10-04 sense star). Only ever true, and only beside a label. The dash print sets before a later sense is not stored.",
			}),
		),
		gloss: Type.String({
			description:
				"The sense's own head text. On the entry's senses[0] it is the lead text, usually the whole definition (ruling 10-04 lead text).",
		}),
		units: Type.Array(Type.String(), {
			description: "The sense's numbered or lettered parts.",
		}),
		senses: Type.Optional(
			Type.Array(Type.Ref('#/$defs/sense'), { description: 'Sub-senses.' }),
		),
	},
	{
		additionalProperties: false,
		dependentRequired: { reconstructed: ['label'] },
		description:
			'One sense of a written entry. Every label is an explicit string, so a reader that drops an empty lead renumbers nothing (ruling 10-04 lead text).',
	},
);

const StemSchema = Type.Object(
	{
		stem: Type.String({
			description: 'The stem label print gives (Pa., Hithpa., …).',
			minLength: 1,
		}),
		forms: Type.Array(Text, {
			description: 'The headword forms this stem governs.',
		}),
		senses: Type.Array(Type.Ref('#/$defs/sense')),
	},
	{
		additionalProperties: false,
		description:
			"A binyan section of a written entry. Sibling to the entry's own senses, so both can be present on one entry.",
	},
);

/** An entry's own fields; `EntrySchema` adds the definitions. */
const EntryBodySchema = Type.Object(
	{
		schemaVersion: Type.Literal(SCHEMA_VERSION, {
			description:
				'The entry-file format version. 2 is the headword-design §2 shape, ruled 2026-09-21; 3 drops the superscript disambiguator and formerNames (ruling 11-13 url words). Stamped on every file so a reader can tell the versions apart without inferring it from which keys are present.',
		}),
		id: Type.String({
			description:
				'The rid, which the entry is addressed by. The name is not stored: it is derived from headwords[0], so it cannot drift from the headword (URL names spec §5.1).',
			pattern: String.raw`^[A-Z]\d{5}$`,
		}),
		sefariaHeadword: Type.String({
			description:
				"Sefaria's headword for this rid, byte for byte (URL names spec §5.1, U3). Import is the only writer.",
			minLength: 1,
		}),
		headwords: Type.Array(Type.Ref('#/$defs/formObject'), {
			description:
				'Every form print sets on the headword line, in its order. headwords[0] is the primary form: the name, the search key and every link derive from it (headword design §2).',
			minItems: 1,
		}),
		display: Type.Optional(
			Type.String({
				description:
					"How print laid the headword line out: a template whose {n} inserts headwords[n].text and whose every other character is literal notation, never Hebrew (headword design §2, §3.1). It never carries Sefaria's superscript: print sets none (ruling 11-13 url words). Optional and never defaulted — where the source cannot settle the layout the key is absent and the row is flagged (§3).",
				minLength: 1,
			}),
		),
		page: Type.Optional(
			Type.Object(
				{
					number: Type.Integer({ minimum: 1 }),
					column: Type.Optional(Type.Enum(['a', 'b'])),
				},
				{
					additionalProperties: false,
					description:
						'Where print sets this entry: page, and column a or b. The entry file is the record (ruling 11-05 page index).',
				},
			),
		),
		grammar: Type.Optional(
			Type.Object(
				{
					gender: Type.Optional(Type.Enum(['m', 'f', 'c'])),
					number: Type.Optional(Type.Enum(['pl', 'du'])),
					pos: Type.Optional(
						Type.String({
							description:
								'Part of speech. Declared, with no producer: no entry carries it (docs/ideas.md, Schema).',
						}),
					),
				},
				{ additionalProperties: false, minProperties: 1 },
			),
		),
		senses: Type.Array(Type.Ref('#/$defs/sense'), { minItems: 1 }),
		stems: Type.Optional(Type.Array(StemSchema)),
	},
	{ additionalProperties: false },
);

/** The whole contract: one entry file. A reference is a JSON pointer
 * (`#/$defs/sense`), the form every JSON Schema reader resolves —
 * VS Code's included, which does not follow TypeBox's name-only
 * `Type.Cyclic` references. */
const EntrySchema = Type.Object(EntryBodySchema.properties, {
	// biome-ignore lint/style/useNamingConvention: a JSON Schema keyword, named by the spec.
	$schema: 'https://json-schema.org/draft/2020-12/schema',
	// biome-ignore lint/style/useNamingConvention: a JSON Schema keyword, named by the spec.
	$id: 'https://jastrow.app/schema/entry.schema.json',
	title: 'Jastrow v2 entry',
	description:
		'One entry of Jastrow’s dictionary at schemaVersion 2 (headword design §2). Generated from admin/entry/schema.ts by bun schema:build; never edit this file by hand.',
	additionalProperties: false,
	// biome-ignore lint/style/useNamingConvention: a JSON Schema keyword, named by the spec.
	$defs: {
		annotation: AnnotationSchema,
		annotations: AnnotationsSchema,
		formObject: FormObjectSchema,
		sense: SenseSchema,
	},
});

/** The same definitions keyed by the pointer each `Type.Ref` names,
 * which is how TypeBox resolves a reference's type. Types only: the
 * schema above is the runtime form. */
type Pointers = {
	'#/$defs/annotation': typeof AnnotationSchema;
	'#/$defs/annotations': typeof AnnotationsSchema;
	'#/$defs/formObject': typeof FormObjectSchema;
	'#/$defs/sense': typeof SenseSchema;
	entry: typeof EntryBodySchema;
};

/** The type a definition validates to. */
type Of<Key extends keyof Pointers> = Type.Static<Type.TCyclic<Pointers, Key>>;

type Entry = Of<'entry'>;
type Annotation = Of<'#/$defs/annotation'>;
type FormObject = Of<'#/$defs/formObject'>;
type Sense = Of<'#/$defs/sense'>;
type Stem = NonNullable<Entry['stems']>[number];

export type { Annotation, Entry, FormObject, Sense, Stem };
export { EntrySchema, SCHEMA_VERSION, VERBATIM_FIELDS };
