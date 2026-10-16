// biome-ignore-all lint/style/noExcessiveLinesPerFile: the scope and evidence filters and the retarget proof they share one index for, read as one set of rules.
/**
 * The appendix's first two filters (`docs/decisions.md`, 10-16 upstream
 * report): whether a reviewed patch is Sefaria's own error at all, and
 * whether its rationale carries the evidence the maintainer's bar asks
 * for.
 *
 * 1. **Case 1 only** (`scopeReason`): never a correction of print's
 *    error (an annotation, a rationale citing 10-13 case 2/3/4, a
 *    recorded deviation, or a repair that leaves part of print's text
 *    unrestored), never Jastrow's convention or a structure of our own
 *    (`NOT_UPSTREAM_CLASSES`, `NOT_UPSTREAM_OPS`).
 * 2. **Evidence** (`evidenceFor`): the rationale names print evidence
 *    (`evidenceOf`), or, for a cross-reference retarget, the cite's own
 *    words prove the target (`retargetProof`).
 */
import { internalTarget, linkKey } from '../import/cite.ts';
import type { SemanticPatch } from '../patch/schema.ts';
import {
	type Exclusion,
	exclude,
	formsOf,
	nfc,
	type RawRecord,
	toRoman,
} from './sefaria-change.ts';

/** Classes that are not Sefaria's error: Jastrow's own convention, our
 * correction of print, or a structure of our own. Explicit, so a new
 * class is in scope only once someone has looked at it. */
const NOT_UPSTREAM_CLASSES: ReadonlyMap<string, string> = new Map([
	[
		'cross-reference-numeral',
		'a cite renumbered after our own renumber (10-13 case 2)',
	],
	[
		'headword-illegible-pointing',
		'our best reading of illegible print (10-13 case 4)',
	],
	[
		'headword-implied-one',
		'Jastrow’s convention: the implied homograph I (10-13 case 2)',
	],
	['headword-name-collision', 'our URL disambiguator (HW-xref-collision)'],
	[
		'implied-one',
		'Jastrow’s convention: print omits an implied 1) (report §16)',
	],
	['lettered-gap', 'print’s lettering gap, relabelled (10-13 case 2)'],
	['lettered-whole-run', 'our lettered-child structure (relabel)'],
	[
		'self-numbered-intext-marker',
		'print’s own doubled numbers and our nesting (10-12, 10-13 case 2)',
	],
]);

/** Ops that change no Sefaria field or build a structure of our own,
 * whatever their class. */
const NOT_UPSTREAM_OPS: ReadonlyMap<string, string> = new Map([
	['annotate', 'records a print read; changes nothing'],
	['nest', 'our nested sublist (10-12)'],
	['relabel', 'our lettered-child labels'],
]);

const CASE_2_3_4 = /\bcase [234]\b/u;
const RULING_10_13 = /\b10-13\b/u;
const DEVIATION = /\brecorded deviation\b/u;
const PARTIAL = /\bnot restored\b/u;
const HOCR = /\bhOCR\b/u;
const LEAF = /\bleaf (?<leaf>\d+)/u;
const PRINT_READ = /\bprint (?:read|check)\b/iu;
const READ_DATE = /\bprint (?:read|check)\b[^.;]*?(?<date>\d{4}-\d{2}-\d{2})/iu;
const WORKLIST = /docs\/[\w-]+-worklist\.md/u;
const ANCHOR =
	/^(?<before>(?:(?!<a\b).)*)<a\b[^>]*\bhref="(?<href>[^"]*)"[^>]*>(?<inner>.*?)<\/a>(?<after>(?:(?!<a\b).)*)$/su;
const TAG = /<[^>]*>/gu;
const CITED = /^(?<word>.+?)\s+(?<numeral>[IVX]+)$/u;
const ENDS_IN_NUMERAL = /(?:^|\s)(?<numeral>[IVX]+)$/u;
const NOT_HEBREW_LETTER = /[^א-ת]/gu;

// ------------------------------------------------- filter 1: case 1 only

/** Why a patch is out of scope for Sefaria, or `undefined` for a patch
 * that may be Sefaria's own error: not an excluded op or class, no
 * annotation, no 10-13 case 2/3/4, no recorded deviation, and not a
 * partial repair whose corrected text would still differ from print. */
function scopeReason(patch: SemanticPatch): Exclusion | undefined {
	const byOp = NOT_UPSTREAM_OPS.get(patch.op);
	if (byOp !== undefined) {
		return exclude('convention or our structure', `${patch.op}: ${byOp}`);
	}
	const byClass = NOT_UPSTREAM_CLASSES.get(patch.defect_class);
	if (byClass !== undefined) {
		return exclude('convention or our structure', byClass);
	}
	if (patch.annotation !== undefined) {
		return exclude(
			'our correction (annotated)',
			`${patch.annotation.kind} annotation`,
		);
	}
	if (RULING_10_13.test(patch.rationale) && CASE_2_3_4.test(patch.rationale)) {
		return exclude(
			'our correction (10-13 case 2/3/4)',
			CASE_2_3_4.exec(patch.rationale)?.[0] ?? '',
		);
	}
	if (DEVIATION.test(patch.rationale)) {
		return exclude('our deviation from print', 'rationale records a deviation');
	}
	if (PARTIAL.test(patch.rationale)) {
		return exclude(
			'partial: print not fully restored',
			'the rationale says part of print’s text is not restored',
		);
	}
	return;
}

// ------------------------------------------------- filter 2: evidence

/** The print evidence a rationale names, or `''`: a maintainer print
 * read with its date (or, where none is given, the worklist it was
 * read in), an hOCR read, a scan leaf. */
function evidenceOf(rationale: string): string {
	const parts: string[] = [];
	if (PRINT_READ.test(rationale)) {
		const date = READ_DATE.exec(rationale)?.groups?.['date'];
		const worklist = WORKLIST.exec(rationale)?.[0];
		if (date !== undefined) {
			parts.push(`maintainer print read ${date}`);
		} else if (worklist !== undefined) {
			parts.push(`maintainer print read (${worklist})`);
		}
	}
	if (HOCR.test(rationale)) {
		parts.push('hOCR');
	}
	const leaf = LEAF.exec(rationale)?.groups?.['leaf'];
	if (leaf !== undefined) {
		parts.push(`scan leaf ${leaf}`);
	}
	return parts.join('; ');
}

/** A numeral Sefaria dropped that a reviewed patch with print evidence
 * sets back on one form (`homographs`, case 1): the form, the numeral
 * and the patch. */
interface Restored {
	form: string;
	numeral: string;
	patch: string;
}

/** The raw source as the retarget proof reads it: rids by link key, by
 * the consonants of every form of their line, and by position in the
 * source; and the numerals the reviewed patches restore. */
interface SourceIndex {
	byKey: Map<string, string[]>;
	bySkeleton: Map<string, string[]>;
	position: Map<string, number>;
	records: ReadonlyMap<string, RawRecord>;
	restored: Map<string, Restored[]>;
}

/** How far apart (in entries) two members of one family may stand: the
 * family is cut into runs wherever they stand further apart (ruling
 * 10-05 homograph sequence; `docs/correction-audit.md` §5). */
const FAMILY_GAP = 5;

/** A form's Hebrew letters alone: its family, ignoring pointing,
 * numerals and punctuation. */
function skeleton(form: string): string {
	return form.normalize('NFD').replaceAll(NOT_HEBREW_LETTER, '');
}

/** Append `value` to `key`'s list, in place. */
function push<K, V>(map: Map<K, V[]>, key: K, value: V): void {
	const list = map.get(key);
	if (list === undefined) {
		map.set(key, [value]);
	} else {
		list.push(value);
	}
}

/** Every numeral a case-1 reviewed reform with print evidence sets on
 * a form, by rid. */
function restoredNumerals(
	patches: readonly SemanticPatch[],
): Map<string, Restored[]> {
	const out = new Map<string, Restored[]>();
	for (const patch of patches) {
		if (
			patch.op !== 'reform' ||
			scopeReason(patch) !== undefined ||
			evidenceOf(patch.rationale) === ''
		) {
			continue;
		}
		for (const { form, homograph } of patch.payload.homographs ?? []) {
			push(out, patch.rid, {
				form: patch.payload.forms[form] ?? '',
				numeral: toRoman(homograph),
				patch: patch.id,
			});
		}
	}
	return out;
}

function indexSource(
	records: ReadonlyMap<string, RawRecord>,
	patches: readonly SemanticPatch[],
): SourceIndex {
	const byKey = new Map<string, string[]>();
	const bySkeleton = new Map<string, string[]>();
	const position = new Map<string, number>();
	for (const record of records.values()) {
		position.set(record.rid, position.size);
		push(byKey, linkKey(record.headword), record.rid);
		for (const key of new Set(formsOf(record).map(skeleton))) {
			push(bySkeleton, key, record.rid);
		}
	}
	return {
		byKey,
		bySkeleton,
		position,
		records,
		restored: restoredNumerals(patches),
	};
}

/** The text outside one internal anchor, and the anchor's target and
 * visible text, or `undefined` unless the html holds exactly one. */
function readAnchor(
	html: string,
): { outside: string; target: string; visible: string } | undefined {
	const m = ANCHOR.exec(html);
	const target = internalTarget(m?.groups?.['href'] ?? '');
	if (m?.groups === undefined || target === undefined) {
		return;
	}
	const inner = m.groups['inner'] ?? '';
	if (inner.includes('<a ')) {
		return;
	}
	return {
		outside: `${m.groups['before']}\n${m.groups['after']}`,
		target,
		visible: inner.replaceAll(TAG, '').trim(),
	};
}

/** The one rid a link key resolves to in the raw source. */
function resolveKey(index: SourceIndex, target: string): string | undefined {
	const rids = index.byKey.get(linkKey(target)) ?? [];
	return rids.length === 1 ? rids[0] : undefined;
}

/** The run of `word`'s family that holds `rid`: the entries sharing its
 * consonants, cut wherever two stand more than `FAMILY_GAP` apart. */
function familyRun(index: SourceIndex, word: string, rid: string): string[] {
	const at = (r: string): number => index.position.get(r) ?? -1;
	const members = [...(index.bySkeleton.get(skeleton(word)) ?? [])].sort(
		(a, b) => at(a) - at(b),
	);
	const runs: string[][] = [];
	for (const member of members) {
		const run = runs.at(-1);
		const last = run?.at(-1);
		if (
			run === undefined ||
			last === undefined ||
			at(member) - at(last) > FAMILY_GAP
		) {
			runs.push([member]);
		} else {
			run.push(member);
		}
	}
	return runs.find((run) => run.includes(rid)) ?? [];
}

/** The forms of `rid`'s line that carry `numeral` (Sefaria sets a
 * line's numeral after its last form), numeral stripped, each with
 * where the numeral comes from: Sefaria's line, or the reviewed patch
 * that restores it. */
function carriedForms(
	index: SourceIndex,
	rid: string,
	numeral: string,
): { form: string; source: string }[] {
	const record = index.records.get(rid);
	const own = (record === undefined ? [] : formsOf(record)).flatMap((form) => {
		const m = ENDS_IN_NUMERAL.exec(form.trim());
		return m?.groups?.['numeral'] === numeral
			? [
					{
						form: form.trim().slice(0, -numeral.length).trim(),
						source: 'Sefaria',
					},
				]
			: [];
	});
	const restored = (index.restored.get(rid) ?? [])
		.filter((r) => r.numeral === numeral)
		.map((r) => ({ form: r.form, source: r.patch }));
	return [...own, ...restored];
}

/** A cross-reference retarget's deterministic text proof: the anchor's
 * visible words name `X N` and are unchanged; the old link and the new
 * resolve to two entries; and the new one is the only entry of the
 * old one's family run, other than the old one, whose line carries
 * `N`, and it has a form spelled as the cite. `N` is read from Sefaria's own line, or
 * from a reviewed case-1 patch with print evidence that restores a
 * numeral Sefaria dropped. The proof, or why it fails. */
function retargetProof(
	patch: SemanticPatch,
	index: SourceIndex,
): { proof: string } | { failure: string } {
	if (patch.op !== 'replace') {
		return { failure: 'not a replace' };
	}
	const before = readAnchor(patch.payload.find);
	const after = readAnchor(patch.payload.replace);
	if (
		before === undefined ||
		after === undefined ||
		before.outside !== after.outside ||
		before.visible !== after.visible
	) {
		return {
			failure: 'the patch changes more than one internal anchor’s link',
		};
	}
	const cited = CITED.exec(after.visible)?.groups;
	const word = cited?.['word'] ?? '';
	const numeral = cited?.['numeral'] ?? '';
	if (word === '') {
		return { failure: `the cite's text "${after.visible}" names no numeral` };
	}
	const was = resolveKey(index, before.target);
	const now = resolveKey(index, after.target);
	if (was === undefined || now === undefined || was === now) {
		return { failure: 'the old and new links do not resolve to two entries' };
	}
	const carriers = familyRun(index, word, was).filter(
		(rid) => rid !== was && carriedForms(index, rid, numeral).length > 0,
	);
	if (carriers.length !== 1 || carriers[0] !== now) {
		return {
			failure: `family members carrying ${numeral}: ${carriers.join(', ') || 'none'}`,
		};
	}
	const carried = carriedForms(index, now, numeral);
	const record = index.records.get(now);
	const spelled = [
		...(record === undefined ? [] : formsOf(record)),
		...carried.map((c) => c.form),
	].some((form) => nfc(form.replace(ENDS_IN_NUMERAL, '').trim()) === nfc(word));
	if (!spelled) {
		return { failure: `${now} has no form spelled "${word}"` };
	}
	const restoredBy = carried.find((c) => c.source !== 'Sefaria')?.source;
	const from =
		carried.some((c) => c.source === 'Sefaria') || restoredBy === undefined
			? ''
			: ` (restored by ${restoredBy})`;
	return {
		proof: `text: the cite reads "${word} ${numeral}"; only ${now} carries ${numeral}${from}`,
	};
}

/** The evidence column for a patch, or the exclusion when it has none. */
function evidenceFor(
	patch: SemanticPatch,
	index: SourceIndex,
): { evidence: string } | Exclusion {
	const printed = evidenceOf(patch.rationale);
	if (printed !== '') {
		return { evidence: printed };
	}
	if (patch.defect_class === 'cross-reference-target') {
		const proof = retargetProof(patch, index);
		return 'proof' in proof
			? { evidence: proof.proof }
			: exclude('no print evidence', proof.failure);
	}
	return exclude('no print evidence', 'the rationale names no print read');
}

export type { SourceIndex };
export {
	evidenceFor,
	evidenceOf,
	indexSource,
	NOT_UPSTREAM_CLASSES,
	NOT_UPSTREAM_OPS,
	retargetProof,
	scopeReason,
};
