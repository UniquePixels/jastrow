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
				"Unique within the entry: a1, a2, … The text points to it with an <annotate id> tag in display, a gloss or a unit, or with a sense's annotation.",
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
					'The id of the patch that wrote it. Absent on an annotation no patch wrote.',
				pattern: String.raw`^P\d{6}$`,
			}),
		),
	},
	{
		additionalProperties: false,
		description:
			'Where the entry departs from print, or keeps an oddity print sets, and why. The text points to it by id; every annotation is referenced exactly once.',
	},
);

const FormObjectSchema = Type.Object(
	{
		text: Type.String({
			description:
				"The form as Hebrew text alone. The notation print sets around it is in the entry's display.",
			minLength: 1,
		}),
		homograph: Type.Optional(
			Type.Integer({
				description:
					'The Roman numeral beside this form, as a number. Shown in display when the entry has one.',
				minimum: 1,
			}),
		),
		reconstructed: Type.Optional(
			Type.Literal(true, {
				description:
					'Print stars this form as a reconstructed word. Only ever true.',
			}),
		),
		gender: Type.Optional(
			Type.Enum(['f', 'm'], {
				description:
					"This form's gender label, as print sets it beside the form. An entry may have a gender on every headword or a grammar.gender, never both.",
			}),
		),
		partial: Type.Optional(
			Type.Literal(true, {
				description:
					'This form is shown as printed and is never a lookup key: an ending after an ellipsis, or a phrase holding an abbreviated word. Only ever true.',
			}),
		),
	},
	{
		additionalProperties: false,
		description:
			"One headword form. How print sets the forms around each other is the entry's display.",
	},
);

const SenseSchema = Type.Object(
	{
		label: Type.Optional(Text),
		annotation: Type.Optional(
			Type.String({
				description:
					"The id of the annotation this sense's label points to. Only on a sense with a label.",
				pattern: ANNOTATION_ID,
			}),
		),
		reconstructed: Type.Optional(
			Type.Literal(true, {
				description:
					"Print stars this sense's number (*2)). Only ever true, and only beside a label.",
			}),
		),
		gloss: Type.String({
			description:
				"The sense's head text. On the entry's senses[0] it is the lead text, usually the whole definition.",
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
		description: 'One sense of an entry.',
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
		description: "A binyan section of an entry, beside the entry's own senses.",
	},
);

/** The entry's own fields, without the shared definitions. */
const EntryBodySchema = Type.Object(
	{
		schemaVersion: Type.Literal(SCHEMA_VERSION, {
			description: 'The entry-file format version.',
		}),
		id: Type.String({
			description: 'The rid, the id the entry is addressed by.',
			pattern: RID.source,
		}),
		sefariaHeadword: Type.String({
			description: "Sefaria's headword for this rid, byte for byte.",
			minLength: 1,
		}),
		headwords: Type.Array(Type.Ref('#/$defs/formObject'), {
			description:
				'Every form print sets on the headword line, in order. headwords[0] is the primary form.',
			minItems: 1,
		}),
		display: Type.Optional(
			Type.String({
				description:
					'How print lays out the headword line: a template whose {n} inserts headwords[n].text and whose every other character is literal notation, never Hebrew. Its only markup is <annotate id> around a {n} or a homograph numeral. Absent where the layout is not settled.',
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
					description: 'Where print sets this entry: page, and column a or b.',
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
							description: 'Part of speech. No entry carries it.',
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
					"The entry's annotations, which the text points to by id. Absent when there are none, never [].",
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
		"One entry of Jastrow's dictionary. Generated from admin/validation/schema.ts by bun schema:build; never edit this file by hand.",
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
