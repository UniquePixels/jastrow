/**
 * The entry schema: the shape of a file under `data/entries/`, as
 * TypeBox schemas, and the types derived from them. `schema-build.ts`
 * writes it to `data/schema/entry.schema.json`.
 */
import Type from 'typebox';

/** The entry-file format version this schema describes. */
const SCHEMA_VERSION = 3;

/**
 * Fields that hold bytes copied from another source. They are exempt
 * from NFC normalization on write and from the NFC check.
 */
const VERBATIM_FIELDS: ReadonlySet<string> = new Set(['sefariaHeadword']);

/**
 * A form's placeholder in a `display` template (`{0}`); group 1 is the
 * form index. Global: use it with `matchAll` or `replace`, not `test`.
 */
const PLACEHOLDER = /\{(\d+)\}/gu;

/** A rid, the id of an entry (`A00001`). */
const RID = /^[A-Z]\d{5}$/u;

/** A non-empty string. */
const Text = Type.String({ minLength: 1 });

/** The pattern of an annotation id: `a1`, `a2`, … */
const ANNOTATION_ID: string = String.raw`^a[1-9]\d*$`;

const AnnotationSchema = Type.Object(
	{
		id: Type.String({
			description:
				'Local to the entry: a1, a2, … in the order the import places them: headword forms by index (text before homograph), then senses in document order (depth first), then stems, and within one object, draft order. The text points to it: an <annotate id> tag in display, a gloss or a unit, or a sense annotation.',
			pattern: ANNOTATION_ID,
		}),
		kind: Type.Enum(['illegible', 'kept', 'print-error'], {
			description:
				'print-error (a departure from print, corrected), kept (an oddity print sets, kept as printed) or illegible (print cannot be read; our best reading).',
		}),
		printed: Type.String({
			description:
				"Print's original value, shown to the reader; '' where print sets nothing. A homograph is written as print writes it (I), a label as its token without ) (5).",
		}),
		note: Type.String({
			description: 'The sentence the reader sees.',
			minLength: 1,
		}),
		date: Type.String({
			description: 'YYYY-MM-DD of the print read or the ruling.',
			pattern: String.raw`^\d{4}-\d{2}-\d{2}$`,
		}),
		source: Type.Optional(
			Type.String({
				description:
					'The patch that wrote it: a reverse lookup, and the link to follow if that patch changes. Absent on an annotation made in the admin tool until a backport writes its patch.',
				pattern: String.raw`^P\d{6}$`,
			}),
		),
	},
	{
		additionalProperties: false,
		description:
			"Where the entry departs from print, or keeps an oddity print sets, and why (ruling 11-15 annotation section). The patch holds the technical record; this is the reader's. The text points to it by id. That every id is referenced exactly once and every reference names an annotation the entry holds, admin/validation/annotations.ts enforces.",
	},
);

const FormObjectSchema = Type.Object(
	{
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
					"This form's gender label, as print sets it beside the form (headword design §4). An entry carries at most one of a per-form gender on EVERY headword or a grammar.gender, never both, and neither is inherited (ruling HW-gender). This schema cannot express it; admin/validation/validate.ts enforces it.",
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
		label: Type.Optional(Text),
		annotation: Type.Optional(
			Type.String({
				description:
					"The id of the entry annotation this sense's label points to. A label is a bare token and cannot hold an <annotate> tag (ruling 11-15 annotation section). Only on a sense with a label: admin/validation/annotations.ts refuses it on one without.",
				pattern: ANNOTATION_ID,
			}),
		),
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

/** The entry's own fields, without the shared definitions. */
const EntryBodySchema = Type.Object(
	{
		schemaVersion: Type.Literal(SCHEMA_VERSION, {
			description:
				'The entry-file format version. 2 is the headword-design §2 shape, ruled 2026-09-21; 3 drops the superscript disambiguator and formerNames (ruling 11-13 url words). Stamped on every file so a reader can tell the versions apart without inferring it from which keys are present.',
		}),
		id: Type.String({
			description:
				'The rid, which the entry is addressed by. The name is not stored: it is derived from headwords[0], so it cannot drift from the headword (URL names spec §5.1).',
			pattern: RID.source,
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
					"How print laid the headword line out: a template whose {n} inserts headwords[n].text and whose every other character is literal notation, never Hebrew (headword design §2, §3.1). It never carries Sefaria's superscript: print sets none (ruling 11-13 url words). Its only markup is <annotate id> around a {n} or a homograph numeral, pointing to the entry's annotations (ruling 11-15 annotation section). Optional and never defaulted — where the source cannot settle the layout the key is absent and the row is flagged (§3).",
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
		annotations: Type.Optional(
			Type.Array(Type.Ref('#/$defs/annotation'), {
				description:
					"The entry's annotations, one list the text points to by id (ruling 11-15 annotation section). Absent when there are none, never [].",
				minItems: 1,
			}),
		),
	},
	{ additionalProperties: false },
);

/**
 * The entry schema: the entry's fields and the `$defs` its references
 * resolve to.
 */
const EntrySchema = Type.Object(EntryBodySchema.properties, {
	// biome-ignore lint/style/useNamingConvention: a JSON Schema keyword, named by the spec.
	$schema: 'https://json-schema.org/draft/2020-12/schema',
	// biome-ignore lint/style/useNamingConvention: a JSON Schema keyword, named by the spec.
	$id: 'https://jastrow.app/schema/entry.schema.json',
	title: 'Jastrow v2 entry',
	description:
		'One entry of Jastrow’s dictionary at schemaVersion 3 (headword design §2). Generated from admin/validation/schema.ts by bun schema:build; never edit this file by hand.',
	additionalProperties: false,
	// biome-ignore lint/style/useNamingConvention: a JSON Schema keyword, named by the spec.
	$defs: {
		annotation: AnnotationSchema,
		formObject: FormObjectSchema,
		sense: SenseSchema,
	},
});

/**
 * The definitions keyed by the pointer each `Type.Ref` names, for
 * deriving the types.
 */
type Pointers = {
	'#/$defs/annotation': typeof AnnotationSchema;
	'#/$defs/formObject': typeof FormObjectSchema;
	'#/$defs/sense': typeof SenseSchema;
	entry: typeof EntryBodySchema;
};

/** The static type of one definition. */
type Of<Key extends keyof Pointers> = Type.Static<Type.TCyclic<Pointers, Key>>;

type Entry = Of<'entry'>;
type Annotation = Of<'#/$defs/annotation'>;
type FormObject = Of<'#/$defs/formObject'>;
type Sense = Of<'#/$defs/sense'>;
type Stem = NonNullable<Entry['stems']>[number];

export type { Annotation, Entry, FormObject, Sense, Stem };
export { EntrySchema, PLACEHOLDER, RID, SCHEMA_VERSION, VERBATIM_FIELDS };
