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
 * 2. **Evidence** (`evidenceFor`): the record's `evidence` object is the
 *    authority (DESIGN §5): a row needs `kind` `maintainer-read`, `hOCR`
 *    or `jastrow-text`, never `sefaria-only` (`evidenceKindAdmits`,
 *    ruling 10-26 as amended 2026-10-31). The rationale prose only words
 *    the evidence column (`evidenceOf`), falling back to the object
 *    (`evidenceFromRecord`); a cross-reference retarget's text proof
 *    (`retargetProof`) is checked against Sefaria's data, not the prose.
 */

import { compareByCodeUnit } from '../../lib/compare-by-code-unit.ts';
import { serialize, tokenize } from '../../lib/html.ts';
import { internalTarget, linkKey } from '../import/cite.ts';
import { pageOfUrl, pageUrls } from '../patch/scan.ts';
import type { PatchEvidence, SemanticPatch } from '../patch/schema.ts';
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
		'Jastrow’s convention: print omits an implied 1) (archived report §16, docs/archive/sefaria-report-2026-10-27.md)',
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
const HOCR_MENTIONS = /\bhOCR\b/gu;
/** A mention of the hOCR that says it did NOT witness the text — the
 * 40 characters before it end in `not … in the`, or it is followed by
 * `cannot` / `does not` / `did not`, or by a quoted `not found in the
 * hOCR` — is not evidence (CodeRabbit on PR #213: P000374's
 * "not found in the hOCR" was labelled `hOCR`). */
const HOCR_NEGATED_BEFORE = /\bnot(?: \w+){0,3} in the $/u;
const HOCR_NEGATED_AFTER =
	/^(?:\s+(?:cannot|does not|did not|has no|is not)\b|[^`]{0,30}`not found in the hOCR`)/u;
const PRINT_READ = /\bprint (?:read|check)\b/iu;
const READ_DATE = /\bprint (?:read|check)\b[^.;]*?(?<date>\d{4}-\d{2}-\d{2})/iu;
/** Where a maintainer's print read is recorded: a worklist, or the
 * checklist the open questions moved to (PR #186) and its post-go-live
 * half (split 2026-10-18). All of them moved to `docs/archive/` on
 * 2026-10-26; a rationale may name either path. */
const WORKLIST =
	/docs\/(?:archive\/)?(?:[\w-]+-worklist|maintainer-checklist|post-go-live-review)\.md/u;
const OPEN_ANCHOR = /<a\b/gu;
const HREF = /\bhref="(?<href>[^"]*)"/u;
const NUMERAL = /^[IVX]+$/u;
const SPACE = /\s/u;
const NOT_HEBREW_LETTER = /[^א-ת]/gu;

/** `text` split at its last whitespace into the words before it and a
 * trailing Roman numeral, or `undefined` when it ends in none. Scanned
 * by index, not by a backtracking pattern. */
function trailingNumeral(
	text: string,
): { numeral: string; word: string } | undefined {
	const trimmed = text.trim();
	let at = trimmed.length - 1;
	while (at >= 0 && !SPACE.test(trimmed[at] ?? '')) {
		at -= 1;
	}
	const numeral = trimmed.slice(at + 1);
	return at > 0 && NUMERAL.test(numeral)
		? { numeral, word: trimmed.slice(0, at).trim() }
		: undefined;
}

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
	return PARTIAL.test(patch.rationale)
		? exclude(
				'partial: print not fully restored',
				'the rationale says part of print’s text is not restored',
			)
		: undefined;
}

// ------------------------------------------------- filter 2: evidence

/** Whether the record's `evidence.kind` can carry an appendix row: a
 * print read (`hOCR`, `maintainer-read`) or Jastrow's own text. A
 * `sefaria-only` record, `pending` or not, is held back whatever its
 * rationale prose names (a scan URL is a locator, not a reading); it
 * returns once its re-read gives it a real kind (issues #207–#210). */
function evidenceKindAdmits(patch: SemanticPatch): boolean {
	const kind = patch.evidence?.kind;
	return (
		kind === 'hOCR' || kind === 'maintainer-read' || kind === 'jastrow-text'
	);
}

/** Whether the rationale names an hOCR read that witnesses the text:
 * at least one mention of the hOCR that is not negated. A rationale
 * that quotes an hOCR line and then says the hOCR cannot read a word
 * still witnesses; one whose every mention is "not found in the hOCR"
 * does not. */
function hocrWitnesses(rationale: string): boolean {
	for (const mention of rationale.matchAll(HOCR_MENTIONS)) {
		const before = rationale.slice(
			Math.max(0, mention.index - 40),
			mention.index,
		);
		const after = rationale.slice(
			mention.index + mention[0].length,
			mention.index + mention[0].length + 60,
		);
		if (!(HOCR_NEGATED_BEFORE.test(before) || HOCR_NEGATED_AFTER.test(after))) {
			return true;
		}
	}
	return false;
}

/** The print evidence a rationale names, or `''`: a maintainer print
 * read with its date (or, where none is given, the worklist it was
 * read in), an hOCR read, a scan page. */
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
	if (hocrWitnesses(rationale)) {
		parts.push('hOCR');
	}
	const [url] = pageUrls(rationale);
	const page = url === undefined ? undefined : pageOfUrl(url);
	if (page !== undefined) {
		parts.push(`scan p. ${page}`);
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
 * the consonants of every form of their line, and by position in
 * `rid` order (print order); and the numerals the reviewed patches restore. */
interface SourceIndex {
	byKey: Map<string, string[]>;
	bySkeleton: Map<string, string[]>;
	position: Map<string, number>;
	records: ReadonlyMap<string, RawRecord>;
	restored: Map<string, Restored[]>;
}

/** How far apart (in entries, in `rid` order, which is print order) two
 * members of one family may stand: the family is cut into runs wherever
 * they stand further apart (ruling 10-05 homograph sequence;
 * `docs/correction-audit.md` §5; ruling 11-05 canonical fetch). */
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

/** Every numeral a case-1 reviewed reform with PRINT evidence (`hOCR` or
 * `maintainer-read`; a `jastrow-text` reform is not print-backed) sets
 * on a form, by rid. The evidence object decides, not the prose. */
function restoredNumerals(
	patches: readonly SemanticPatch[],
): Map<string, Restored[]> {
	const out = new Map<string, Restored[]>();
	for (const patch of patches) {
		const kind = patch.evidence?.kind;
		if (
			patch.op !== 'reform' ||
			scopeReason(patch) !== undefined ||
			(kind !== 'hOCR' && kind !== 'maintainer-read')
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
	for (const [index, rid] of [...records.keys()]
		.sort(compareByCodeUnit)
		.entries()) {
		position.set(rid, index);
	}
	for (const record of records.values()) {
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

/** What a reader sees of `html`: the entry tokenizer's text tokens,
 * never a one-pass tag regex. */
function visibleText(html: string): string {
	return serialize(
		tokenize(html).filter((piece) => piece.kind === 'text'),
	).trim();
}

/** The text outside one internal anchor, and the anchor's target and
 * visible text, or `undefined` unless the html holds exactly one
 * anchor, closed once. */
function readAnchor(
	html: string,
): { outside: string; target: string; visible: string } | undefined {
	const opens = [...html.matchAll(OPEN_ANCHOR)];
	const start = opens[0]?.index;
	const tagEnd = start === undefined ? -1 : html.indexOf('>', start);
	const close = html.indexOf('</a>');
	if (
		opens.length !== 1 ||
		start === undefined ||
		tagEnd === -1 ||
		close < tagEnd ||
		html.includes('</a>', close + 1)
	) {
		return;
	}
	const href = HREF.exec(html.slice(start, tagEnd))?.groups?.['href'];
	const target = internalTarget(href ?? '');
	if (target === undefined) {
		return;
	}
	return {
		outside: `${html.slice(0, start)}\n${html.slice(close + '</a>'.length)}`,
		target,
		visible: visibleText(html.slice(tagEnd + 1, close)),
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
		const m = trailingNumeral(form);
		return m?.numeral === numeral ? [{ form: m.word, source: 'Sefaria' }] : [];
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
		before.outside !== after?.outside ||
		before.visible !== after.visible
	) {
		return {
			failure: 'the patch changes more than one internal anchor’s link',
		};
	}
	const cited = trailingNumeral(after.visible);
	const word = cited?.word ?? '';
	const numeral = cited?.numeral ?? '';
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
	].some(
		(form) => nfc(trailingNumeral(form)?.word ?? form.trim()) === nfc(word),
	);
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

/** The evidence column worded from the record's `evidence` object, for
 * a rationale whose prose names no print read: the object admitted the
 * row, so it also states the evidence. */
function evidenceFromRecord(evidence: PatchEvidence): string {
	if (evidence.kind === 'hOCR') {
		return evidence.page === undefined
			? 'hOCR'
			: `hOCR; scan p. ${evidence.page}`;
	}
	if (evidence.kind === 'maintainer-read') {
		return evidence.date === undefined
			? 'maintainer print read'
			: `maintainer print read ${evidence.date}`;
	}
	return evidence.quote === undefined
		? 'Jastrow’s text'
		: `Jastrow’s text: ${evidence.quote}`;
}

/** The evidence column for a patch, or the exclusion when its record
 * cannot carry a row. The `evidence` object decides. A `jastrow-text`
 * retarget's claim is its text proof, so that proof is checked first,
 * whatever the prose names, and words the column; it is held back when
 * the proof fails in Sefaria's data. Otherwise the prose, then the
 * retarget proof, then the object itself word the column. */
function evidenceFor(
	patch: SemanticPatch,
	index: SourceIndex,
): { evidence: string } | Exclusion {
	const evidence = patch.evidence;
	if (evidence === undefined || !evidenceKindAdmits(patch)) {
		const kind = evidence?.kind ?? 'none';
		const pending = evidence?.pending === true ? ', pending a re-read' : '';
		return exclude('no print evidence', `evidence.kind is ${kind}${pending}`);
	}
	const retarget = patch.defect_class === 'cross-reference-target';
	if (retarget && evidence.kind === 'jastrow-text') {
		const proof = retargetProof(patch, index);
		return 'proof' in proof
			? { evidence: proof.proof }
			: exclude('no print evidence', proof.failure);
	}
	const printed = evidenceOf(patch.rationale);
	if (printed !== '') {
		return { evidence: printed };
	}
	if (retarget) {
		const proof = retargetProof(patch, index);
		if ('proof' in proof) {
			return { evidence: proof.proof };
		}
	}
	return { evidence: evidenceFromRecord(evidence) };
}

export type { SourceIndex };
export {
	evidenceFor,
	evidenceKindAdmits,
	evidenceOf,
	HOCR,
	indexSource,
	NOT_UPSTREAM_CLASSES,
	NOT_UPSTREAM_OPS,
	PRINT_READ,
	READ_DATE,
	retargetProof,
	scopeReason,
};
