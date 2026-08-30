import { expect, it } from 'bun:test';
import { buildBody } from '../../body/dry-run.ts';
import type {
	BodyEntry,
	BodySense,
	SourceEntry,
	SourceSense,
} from '../../body/types.ts';
import { composedEntries } from './corpus-fixture.ts';

/**
 * The standing gate under batch 8's first DISCARD,
 * `plural-label-rendering-defeats-capture` (358).
 *
 * ## What the discard rests on, and why it needed measuring
 *
 * Nine sibling `plural_form` rows were discarded on one shared ground:
 * the field is not a v2 field. `entry.schema.json` sets
 * `additionalProperties: false` over `{id, slug, headword, altHeadwords,
 * page, grammar, senses, stems}`, and `rejoin.ts` concatenates only
 * `content.morphology`, `language_code`, `language_reference` and the
 * sense-1 text.
 *
 * This row was deliberately held back from that fold, because its shape
 * is an ABSENCE rather than debris and it made a second claim the others
 * did not: that "the plural forms remain present verbatim in the
 * definition text that v2 does carry". That claim was never measured.
 * It is measured here, and it is what the discard turns on — a defect
 * confined to a dropped field, whose content is entirely in a kept one,
 * reaches no reader.
 *
 * ## Why this file exists after the ruling
 *
 * A discard leaves `status: discarded` in `patterns.jsonl`, which routes
 * no work. If the survival ever stopped holding, 523 entries would lose
 * their declared plurals with no ACTIVE catalogue row left to describe
 * the loss and no other test in the suite counting the shape. So the
 * audit's arithmetic is asserted rather than only published.
 *
 * ## The count is 523 here and 358 in the catalogue
 *
 * Asserted as measured rather than as catalogued, and the difference is
 * recorded rather than reconciled: the row's buckets over ALL senses
 * read 523. The disposition does not turn on which is right — 523 is a
 * superset of any narrower predicate and survival is 100% — but the
 * catalogued 358 should not be read as verified.
 *
 * Audit: `data/patches/catalogue-audit/plural-label-capture.md`.
 */

const TIMEOUT = 120_000;

const HEB = /[֐-׿]/u;
const HEB_RUN = /[֐-׿‎‏]+/gu;
const BIDI = /[‎‏]/gu;

/** The six label renderings the row buckets by. The near-perfect
 * `Pl. ` bucket is the row's INTERNAL CONTROL: it is what makes label
 * rendering, rather than semantics, the cause of the capture failure. */
const LABELS: readonly [string, RegExp][] = [
	['<i>Pl.</i>', /<i>Pl\.<\/i>/gu],
	['<i>pl.</i>', /<i>pl\.<\/i>/gu],
	['<i>Pl</i>.', /<i>Pl<\/i>\./gu],
	['<i>pl</i>.', /<i>pl<\/i>\./gu],
	['Pl. ', /(?<!<i>)\bPl\.\s/gu],
	['pl. ', /(?<!<i>)\bpl\.\s/gu],
];

function* walk(s: readonly SourceSense[] | undefined): Generator<SourceSense> {
	for (const x of s ?? []) {
		yield x;
		yield* walk(x.senses);
	}
}

/** The tokens — tags and text runs alike — of the window a plural
 * declaration is read in. Four is the row's own window. */
function windowAfter(text: string, at: number): string[] {
	return (text.slice(at).match(/<[^>]*>|[^<]+/gu) ?? []).slice(0, 4);
}

/** Hebrew runs declared as the plural in that window. */
function declaredRuns(text: string, at: number): string[] {
	const out: string[] = [];
	for (const token of windowAfter(text, at)) {
		if (token.startsWith('<')) {
			continue;
		}
		for (const run of token.match(HEB_RUN) ?? []) {
			const value = run.replace(BIDI, '').trim();
			if (value.length > 1) {
				out.push(value);
			}
		}
	}
	return out;
}

/** Every string a reader can be shown, joined. */
function bodyText(body: BodyEntry): string {
	const parts: string[] = [];
	const push = (senses: readonly BodySense[] | undefined): void => {
		for (const sense of senses ?? []) {
			parts.push(sense.gloss, sense.label ?? '', ...sense.units);
			push(sense.senses);
		}
	};
	push(body.senses);
	for (const stem of body.stems ?? []) {
		parts.push(stem.stem, ...stem.forms);
		push(stem.senses);
	}
	return parts
		.join(' ')
		.replace(/<[^>]*>/gu, '')
		.replace(BIDI, '');
}

interface Census {
	/** Entries declaring a plural while `plural_form` is empty/absent. */
	flagged: number;
	/** Any entry losing at least one run. Must be 0. */
	lost: string[];
	/** `plural_form`'s shape across the flagged set. */
	shape: Record<string, number>;
	/** Of those, entries every one of whose declared runs is in the
	 * built body. The discard's premise. */
	survived: number;
}

function isMissing(entry: SourceEntry): string | undefined {
	const value = entry.plural_form;
	if (value === undefined) {
		return 'absent';
	}
	if (value.length === 0) {
		return 'empty';
	}
	return value.every((item) => item.trim() === '') ? 'blank' : undefined;
}

function census(entries: readonly SourceEntry[]): Census {
	const out: Census = { flagged: 0, lost: [], shape: {}, survived: 0 };
	for (const entry of entries) {
		const shape = isMissing(entry);
		if (shape === undefined) {
			continue;
		}
		const runs = new Set<string>();
		for (const sense of walk(entry.content.senses)) {
			const text = sense.definition ?? '';
			for (const [, pattern] of LABELS) {
				pattern.lastIndex = 0;
				for (const match of text.matchAll(pattern)) {
					const at = match.index + match[0].length;
					if (
						!windowAfter(text, at).some(
							(token) => !token.startsWith('<') && HEB.test(token),
						)
					) {
						continue;
					}
					for (const run of declaredRuns(text, at)) {
						runs.add(run);
					}
				}
			}
		}
		if (runs.size === 0) {
			continue;
		}
		out.flagged++;
		out.shape[shape] = (out.shape[shape] ?? 0) + 1;
		const built = bodyText(buildBody(entry).body);
		if ([...runs].every((run) => built.includes(run))) {
			out.survived++;
		} else {
			out.lost.push(entry.rid);
		}
	}
	return out;
}

let memo: Census | undefined;
async function measured(): Promise<Census> {
	memo ??= census(await composedEntries());
	return memo;
}

// §1 — THE PREMISE OF THE DISCARD, and the only thing that made this
// row different from its nine siblings. Every plural the definition
// declares is present in what `buildBody` produces.
it(
	'every declared plural survives into the built body',
	async () => {
		const { flagged, lost, survived } = await measured();
		expect(lost).toEqual([]);
		expect(survived).toBe(flagged);
	},
	TIMEOUT,
);

// §2 — THE POPULATION, asserted as MEASURED rather than as catalogued.
// The row says 358; the same buckets over all senses say 523. Pinning
// the measured figure is what makes a change in either direction
// visible.
it(
	'flags 523 entries, not the catalogued 358',
	async () => {
		const { flagged } = await measured();
		expect(flagged).toBe(523);
	},
	TIMEOUT,
);

// §3 — THE FIELD SIDE, which is the siblings' argument and is a fact
// about the SCHEMA rather than about the corpus. Asserted here because
// the discard is only as durable as this: give `plural_form` a v2
// destination and every one of the ten rows reopens.
it(
	'has no v2 destination to be repaired into',
	async () => {
		const schema = (await Bun.file(
			'admin/pipeline/schema/entry.schema.json',
		).json()) as {
			additionalProperties: boolean;
			properties: Record<string, unknown>;
		};
		expect(schema.additionalProperties).toBe(false);
		expect(Object.keys(schema.properties)).not.toContain('plural_form');
	},
	TIMEOUT,
);

// §4 — THE SHAPE OF THE ABSENCE, and it corrects the row by one.
//
// The row records "90 entries have no plural_form key at all and 268
// have [], **none a blank-string slot**" as its overlap argument against
// `plural-form-empty-slot` (703). Measured over the wider 523, that
// last clause is off by one: there IS a single blank-string slot. The
// overlap argument survives — 1 of 523 is not an overlap — but the
// claim as written is false, so the shape is pinned as measured rather
// than as recorded.
it(
	'is an absent or empty array, and a blank-string slot exactly once',
	async () => {
		const { shape } = await measured();
		expect(shape['blank'] ?? 0).toBe(1);
		expect((shape['absent'] ?? 0) + (shape['empty'] ?? 0)).toBe(522);
	},
	TIMEOUT,
);
