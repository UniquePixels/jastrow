import { expect, it } from 'bun:test';

/**
 * The standing gate under batch 8's first DISCARD,
 * `plural-label-rendering-defeats-capture` (358).
 *
 * Nine sibling `plural_form` rows were discarded on one shared ground:
 * the field is not a v2 field. `entry.schema.json` sets
 * `additionalProperties: false` over `{id, sefariaHeadword, headword, altHeadwords,
 * page, grammar, senses, stems}`, and `rejoin.ts` concatenates only
 * `content.morphology`, `language_code`, `language_reference` and the
 * sense-1 text. That field-side argument is what the one test below
 * asserts.
 *
 * This row was held back from that fold because it made a second claim
 * the others did not: that the plural forms remain present verbatim in
 * the definition text v2 does carry. The corpus measurement of that
 * claim — the survival census, the measured population (523 against
 * the catalogued 358), and the shape of the absence — was retired in
 * consolidation step 5 and is listed in
 * `docs/v2/retired-corpus-checks.md`.
 *
 * Audit: `docs/archive/catalogue-audit/plural-label-capture.md`.
 */

const TIMEOUT = 120_000;

// §3 — THE FIELD SIDE, which is the siblings' argument and is a fact
// about the SCHEMA rather than about the corpus. Asserted here because
// the discard is only as durable as this: give `plural_form` a v2
// destination and every one of the ten rows reopens.
it(
	'has no v2 destination to be repaired into',
	async () => {
		const schema = (await Bun.file('data/schema/entry.schema.json').json()) as {
			additionalProperties: boolean;
			properties: Record<string, unknown>;
		};
		expect(schema.additionalProperties).toBe(false);
		expect(Object.keys(schema.properties)).not.toContain('plural_form');
	},
	TIMEOUT,
);
