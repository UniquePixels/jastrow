// biome-ignore-all lint/style/noExcessiveLinesPerFile: one describer per op, each reading the raw record the same way; split, they would each re-derive the field walk.
/**
 * What a reviewed patch changes in Sefaria's own record, stated on the
 * raw source string (`docs/decisions.md`, 10-16 upstream report): the
 * appendix's third and fourth filters.
 *
 * Patches apply after the transforms, so a patch's `expected_before` is
 * post-transform text, not Sefaria's string. Each op is located in the
 * RAW record of the same rid instead:
 *
 * - `replace`, a segment `delete` and `split`: the patch's find (its
 *   `find`, `segment` or `marker`), with up to 40 characters of its
 *   context from `expected_before`, must occur exactly once across the
 *   raw definitions (or `language_reference`, for a patch that
 *   addresses it). A span the transforms changed, or one that occurs
 *   twice, is not traceable.
 * - `retag` and `join`: the raw sense whose number is the target's
 *   token and whose definition is `expected_before`, exactly, once. A
 *   `join`'s text is the pipeline's own `applyPatch` on the raw record,
 *   so the space print sets comes back exactly as the import writes it.
 * - `reform`: the one form the patch respells, or the one form it sets
 *   a numeral on, as Sefaria's `headword` or `alt_headwords[k]`, found
 *   in NFC (never a byte comparison of Hebrew).
 * - `unref`: the `refs` list without the item.
 *
 * The source is read as it is now, so a re-fetch in which Sefaria fixed
 * the error leaves the text absent and the row leaves the appendix.
 */
import type { SemanticPatch } from '../patch/schema.ts';
import {
	addressesLanguageReference,
	applyPatch,
	countOccurrences,
	PatchApplyError,
} from '../patch/schema.ts';
import type { SourceEntry, SourceSense } from '../types.ts';

/** One record of `data/source/jastrow-dictionary.jsonl`, with the
 * Mongo id the pipeline itself never reads. */
interface RawRecord extends SourceEntry {
	// biome-ignore lint/style/useNamingConvention: Sefaria's own Mongo field names.
	_id: { $oid: string };
}

/** Why a patch is not an appendix row: the first filter it failed. */
type Reason =
	| 'convention or our structure'
	| 'no change in Sefaria’s fields'
	| 'no longer in source'
	| 'no print evidence'
	| 'no source record'
	| 'no tranche date'
	| 'not mechanical for op'
	| 'not traceable to source'
	| 'our correction (10-13 case 2/3/4)'
	| 'our correction (annotated)'
	| 'our deviation from print'
	| 'partial: print not fully restored'
	| 'scan link outside the entry';

/** A filter's refusal, with what it saw. */
interface Exclusion {
	detail: string;
	reason: Reason;
}

/** What a patch changes in Sefaria's record: the raw field (a path
 * into the record), Sefaria's string and ours. */
interface Change {
	corrected: string;
	field: string;
	sefaria: string;
}

/** The mark the appendix writes at a sense boundary: the text after
 * it is the next sense, its number first. */
const BOUNDARY = '‖';
/** Sefaria's value for a field the record does not carry. */
const ABSENT = '(absent)';
/** A text cell whose string is empty: a delete that leaves nothing. */
const EMPTY = '(empty)';
/** Context kept on each side of a change, longest first. */
const CONTEXT_SIDES = [40, 24, 12] as const;
/** A sense target's token: `sense[<token>]:<anchor>`. */
const SENSE_TOKEN = /^sense\[(?<token>[^\]]*)\]/u;
const MARK = /\p{M}/u;
const DISPLAY_SLOT = /\{\d+\}/gu;
const DISPLAY_PLAIN = /^[\s,IVX]*$/u;

/** A homograph number as Sefaria writes it on a headword. */
function toRoman(value: number): string {
	const table: [number, string][] = [
		[10, 'X'],
		[9, 'IX'],
		[5, 'V'],
		[4, 'IV'],
		[1, 'I'],
	];
	let rest = value;
	let out = '';
	for (const [n, letters] of table) {
		while (rest >= n) {
			out += letters;
			rest -= n;
		}
	}
	return out;
}

const nfc = (text: string): string => text.normalize('NFC');

function exclude(reason: Reason, detail: string): Exclusion {
	return { detail, reason };
}

function isExclusion(value: Change | Exclusion): value is Exclusion {
	return 'reason' in value;
}

function formsOf(record: RawRecord): string[] {
	return [record.headword, ...(record.alt_headwords ?? [])];
}

// ------------------------------------------- filter 3: traceable to source

/** One raw string field of a record, by its path. */
interface RawField {
	path: string;
	text: string;
}

/** Every sense of the record in document order, with its path, its
 * index and the array that holds it. */
interface RawSense {
	index: number;
	parent: string;
	path: string;
	sense: SourceSense;
	siblings: SourceSense[];
}

function rawSenses(record: SourceEntry): RawSense[] {
	const out: RawSense[] = [];
	const walk = (siblings: SourceSense[], parent: string): void => {
		for (const [index, sense] of siblings.entries()) {
			const path = `${parent}[${index}]`;
			out.push({ index, parent, path, sense, siblings });
			if (sense.senses !== undefined) {
				walk(sense.senses, `${path}.senses`);
			}
		}
	};
	walk(record.content.senses, 'content.senses');
	return out;
}

/** The raw fields a sense-text change may sit in: every definition, or
 * `language_reference` alone for a patch that addresses it. */
function textFields(patch: SemanticPatch, record: RawRecord): RawField[] {
	if (patch.op === 'replace' && addressesLanguageReference(patch)) {
		return [
			{ path: 'language_reference', text: record.language_reference ?? '' },
		];
	}
	return rawSenses(record).map((s) => ({
		path: `${s.path}.definition`,
		text: s.sense.definition ?? '',
	}));
}

/** `at` moved back out of a tag or a run of combining marks, so a span
 * never opens mid-tag or on a mark that belongs to the letter before. */
function snapStart(text: string, at: number): number {
	let a = at;
	if (text.lastIndexOf('<', a - 1) > text.lastIndexOf('>', a - 1)) {
		a = text.lastIndexOf('<', a - 1);
	}
	while (a > 0 && MARK.test(text[a] ?? '')) {
		a -= 1;
	}
	return a;
}

/** `at` moved forward out of a tag or a run of combining marks. */
function snapEnd(text: string, at: number): number {
	let b = at;
	if (text.lastIndexOf('<', b - 1) > text.lastIndexOf('>', b - 1)) {
		const close = text.indexOf('>', b);
		b = close === -1 ? text.length : close + 1;
	}
	while (b < text.length && MARK.test(text[b] ?? '')) {
		b += 1;
	}
	return b;
}

/** The span `[start, end)` of `text` widened by `side` characters each
 * way and snapped. */
function widen(
	text: string,
	[start, end]: readonly [number, number],
	side: number,
): [number, number] {
	return [
		snapStart(text, Math.max(0, start - side)),
		snapEnd(text, Math.min(text.length, end + side)),
	];
}

/** The widest span of `text` around `[start, end)` that occurs exactly
 * once across `fields`, and the field holding it; `undefined` when every
 * width occurs zero times or more than once. */
function uniqueSpan(
	text: string,
	range: readonly [number, number],
	fields: readonly RawField[],
): { field: string; from: number; span: string } | undefined {
	let found: { field: string; from: number; span: string } | undefined;
	for (const side of CONTEXT_SIDES) {
		const [a, b] = widen(text, range, side);
		const span = text.slice(a, b);
		const holders = fields.filter((f) => f.text.includes(span));
		const count = holders.reduce(
			(n, f) => n + countOccurrences(f.text, span),
			0,
		);
		if (count === 1 && holders[0] !== undefined) {
			found = { field: holders[0].path, from: a, span };
		}
		// Once a width occurs at all, a narrower one occurs at least as
		// often, so the search ends here either way.
		if (count > 0) {
			break;
		}
	}
	return found;
}

/** The text a sense-text op looks for, and what it makes of it. */
function textEdit(
	patch: SemanticPatch,
): { edit: (found: string) => string; needle: string } | undefined {
	switch (patch.op) {
		case 'replace':
			return { edit: () => patch.payload.replace, needle: patch.payload.find };
		case 'delete':
			return patch.payload.scope === 'segment' &&
				patch.payload.segment !== undefined
				? { edit: () => '', needle: patch.payload.segment }
				: undefined;
		case 'split':
			return {
				edit: (found: string): string => BOUNDARY + found,
				needle: patch.payload.marker,
			};
		default:
			return;
	}
}

/** A `replace`, segment `delete` or `split`, located in the raw record
 * by its text and context. */
function textChange(
	patch: SemanticPatch,
	record: RawRecord,
): Change | Exclusion {
	const op = textEdit(patch);
	if (op === undefined) {
		return exclude('not mechanical for op', `${patch.op} of a whole sense`);
	}
	const before = patch.expected_before;
	if (countOccurrences(before, op.needle) !== 1) {
		return exclude(
			'not traceable to source',
			'the find is not once in expected_before',
		);
	}
	const start = before.indexOf(op.needle);
	const end = start + op.needle.length;
	const found = uniqueSpan(before, [start, end], textFields(patch, record));
	if (found === undefined) {
		return exclude(
			'not traceable to source',
			'the find and its context are not once in the raw record',
		);
	}
	const at = start - found.from;
	const corrected =
		found.span.slice(0, at) +
		op.edit(op.needle) +
		found.span.slice(at + op.needle.length);
	return {
		corrected: corrected === '' ? EMPTY : corrected,
		field: found.field,
		sefaria: found.span,
	};
}

/** The one raw sense a `retag` or `join` target names: its number is
 * the target's token and its definition is `expected_before`, exactly. */
function targetSense(
	patch: SemanticPatch,
	record: RawRecord,
): RawSense | undefined {
	const token = SENSE_TOKEN.exec(patch.target)?.groups?.['token'];
	const hits = rawSenses(record).filter(
		(s) =>
			(s.sense.number ?? '') === token &&
			(s.sense.definition ?? '') === patch.expected_before,
	);
	return hits.length === 1 ? hits[0] : undefined;
}

function retagChange(
	patch: Extract<SemanticPatch, { op: 'retag' }>,
	record: RawRecord,
): Change | Exclusion {
	const sense = targetSense(patch, record);
	if (sense === undefined) {
		return exclude(
			'not traceable to source',
			'no raw sense reads as the target',
		);
	}
	return {
		corrected: patch.payload.number,
		field: `${sense.path}.number`,
		sefaria: sense.sense.number ?? ABSENT,
	};
}

/** The tail of `text`, at most `side` characters, snapped. */
function tail(text: string, side: number): string {
	return text.slice(snapStart(text, Math.max(0, text.length - side)));
}

/** The head of `text`, at most `side` characters, snapped. */
function head(text: string, side: number): string {
	return text.slice(0, snapEnd(text, Math.min(text.length, side)));
}

/** A `join`: the raw pair of senses, Sefaria's boundary between them,
 * and the one flow the pipeline's own join makes of them (`applyPatch`
 * on the raw record, so the space print sets comes back exactly as the
 * import writes it). */
function joinChange(
	patch: SemanticPatch,
	record: RawRecord,
): Change | Exclusion {
	const target = targetSense(patch, record);
	const previous = target?.siblings[target.index - 1];
	if (target === undefined) {
		return exclude(
			'not traceable to source',
			'no raw sense reads as the target',
		);
	}
	if (previous === undefined) {
		return exclude('not mechanical for op', 'join into its own head');
	}
	let joined: SourceEntry;
	try {
		joined = applyPatch(record, patch);
	} catch (error) {
		if (error instanceof PatchApplyError) {
			return exclude('not mechanical for op', error.message);
		}
		throw error;
	}
	const prev = previous.definition ?? '';
	const def = target.sense.definition ?? '';
	const flow =
		rawSenses(joined).find(
			(s) => s.path === `${target.parent}[${target.index - 1}]`,
		)?.sense.definition ?? '';
	if (!(flow.startsWith(prev) && flow.endsWith(def))) {
		return exclude(
			'not mechanical for op',
			'the joined text is not prev + def',
		);
	}
	const [side] = CONTEXT_SIDES;
	const fold = flow.slice(prev.length, flow.length - def.length);
	return {
		corrected: tail(prev, side) + fold + head(def, side),
		field: `${target.parent}[${target.index - 1}–${target.index}]`,
		sefaria: `${tail(prev, side)}${BOUNDARY}${target.sense.number ?? ''}${head(def, side)}`,
	};
}

/** An `unref`: the refs list without the item. */
function unrefChange(
	patch: SemanticPatch,
	record: RawRecord,
): Change | Exclusion {
	const refs = record.refs ?? [];
	if (refs.filter((r) => r === patch.expected_before).length !== 1) {
		return exclude('not traceable to source', 'the item is not once in refs');
	}
	return {
		corrected: JSON.stringify(refs.filter((r) => r !== patch.expected_before)),
		field: 'refs',
		sefaria: JSON.stringify(refs),
	};
}

/** Each form of a reform's line as Sefaria would store it: the form,
 * with the numeral the patch sets beside it (`homographs`) written on
 * it the way Sefaria writes a headword's numeral. */
function reformForms(
	patch: Extract<SemanticPatch, { op: 'reform' }>,
): string[] {
	const numerals = new Map(
		(patch.payload.homographs ?? []).map((h) => [h.form, toRoman(h.homograph)]),
	);
	return patch.payload.forms.map((form, i) => {
		const numeral = numerals.get(i);
		return numeral === undefined || form.endsWith(` ${numeral}`)
			? form
			: `${form} ${numeral}`;
	});
}

/** The raw path of the form at `i` of a line whose forms were `before`,
 * or `undefined` when the raw record does not hold it exactly once. */
function rawFormPath(
	record: RawRecord,
	before: readonly string[],
	i: number,
): { path: string; text: string } | undefined {
	const raw = formsOf(record);
	const want = nfc(before[i] ?? '');
	if (i === 0) {
		return nfc(record.headword) === want
			? { path: 'headword', text: record.headword }
			: undefined;
	}
	const hits = raw
		.map((text, j) => ({ j, text }))
		.filter(({ j, text }) => j > 0 && nfc(text) === want);
	const [hit] = hits;
	return hits.length === 1 && hit !== undefined
		? { path: `alt_headwords[${hit.j - 1}]`, text: hit.text }
		: undefined;
}

/** A reform that changes how many forms the line has, stated on the
 * alternates when the headword is untouched. */
function reformCountChange(
	record: RawRecord,
	before: readonly string[],
	after: readonly string[],
): Change | Exclusion {
	const alts = record.alt_headwords ?? [];
	const same =
		nfc(before[0] ?? '') === nfc(after[0] ?? '') &&
		nfc(record.headword) === nfc(before[0] ?? '') &&
		nfc(JSON.stringify(alts)) === nfc(JSON.stringify(before.slice(1)));
	if (!same) {
		return exclude(
			'not mechanical for op',
			'the reform changes the headword and the number of forms together',
		);
	}
	return {
		corrected: JSON.stringify(after.slice(1)),
		field: 'alt_headwords',
		sefaria: JSON.stringify(alts),
	};
}

/** A `reform`: the one form it respells, or the one form it sets a
 * numeral on, as Sefaria's `headword` or `alt_headwords[k]`. */
function reformChange(
	patch: Extract<SemanticPatch, { op: 'reform' }>,
	record: RawRecord,
): Change | Exclusion {
	const { display, gloss } = patch.payload;
	if (gloss !== undefined) {
		return exclude(
			'not mechanical for op',
			'the reform lifts text into a new sense',
		);
	}
	if (
		display !== undefined &&
		!DISPLAY_PLAIN.test(display.replaceAll(DISPLAY_SLOT, ''))
	) {
		return exclude(
			'not mechanical for op',
			`display "${display}" sets a layout`,
		);
	}
	const before = patch.expected_before.split('\n');
	const after = reformForms(patch);
	if (before.length !== after.length) {
		return reformCountChange(record, before, after);
	}
	const changed = after.flatMap((form, k) =>
		nfc(form) === nfc(before[k] ?? '') ? [] : [k],
	);
	const [i] = changed;
	if (changed.length !== 1 || i === undefined) {
		return exclude(
			'not mechanical for op',
			`the reform changes ${changed.length} forms`,
		);
	}
	const raw = rawFormPath(record, before, i);
	if (raw === undefined) {
		return exclude(
			'not traceable to source',
			'the form is not once in the raw line',
		);
	}
	return { corrected: after[i] ?? '', field: raw.path, sefaria: raw.text };
}

/** What a patch changes in Sefaria's record, or why that cannot be
 * stated mechanically or traced to the raw source. */
function changeOf(patch: SemanticPatch, record: RawRecord): Change | Exclusion {
	switch (patch.op) {
		case 'reform':
			return reformChange(patch, record);
		case 'retag':
			return retagChange(patch, record);
		case 'join':
			return joinChange(patch, record);
		case 'unref':
			return unrefChange(patch, record);
		case 'replace':
		case 'delete':
		case 'split':
			return textChange(patch, record);
		default:
			return exclude('not mechanical for op', patch.op);
	}
}

export type { Change, Exclusion, RawRecord, Reason };
export {
	ABSENT,
	BOUNDARY,
	changeOf,
	EMPTY,
	exclude,
	formsOf,
	isExclusion,
	nfc,
	toRoman,
};
