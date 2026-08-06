/**
 * Approved §6.0 migration repair passes (entry-body-model plan Task 16;
 * maintainer review 2026-08-05, docs/v2/body-review/01–06). Pure: takes a
 * SourceEntry, returns a repaired copy plus a record of every change —
 * `migrate.ts` (later) composes this before the body build; until then
 * `bun body:migrate-dry` runs it corpus-wide read-only and reports.
 *
 * Every rid-keyed edit here is literal, reviewed code (same policy as
 * fixtures/extract.ts rid lists), transcribed from the review docs'
 * per-row decisions. Edits assert their find-text matches exactly once
 * in the entry — a source-snapshot change that invalidates a repair
 * fails loudly instead of silently skipping (B9).
 *
 * `deviation: true` marks recorded deviations from the printed text
 * (implied sense-1 labels, D00341's bracket move — upstream-issues
 * register #16): the planned `notes` mechanism will anchor these in-text
 * (TODO: notes spec, see design doc changelog 2026-08-05 "new scope");
 * until it lands, this record + the migration report are the register.
 * Everything else repairs source damage where print HAS the bytes.
 */
import type { SourceEntry, SourceSense } from './types.ts';

// Hoisted per lint/performance/useTopLevelRegex — no state (`g`/`y`)
// flags, so sharing across calls is safe.
const STEM_OPENS_AT_TWO = /^[*—]?2\)/u;
const ORPHAN_REF_ITEM = /^Jastrow, (?<target>.+) (?<n>\d+)$/u;

type PassName =
	| 'rejoin-chopped'
	| 'implied-one'
	| 'marker-reinsert'
	| 'label-repair'
	| 'binyan-cleanup'
	| 'cite-escape'
	| 'cite-wrap'
	| 'refs-removal';

interface RepairRecord {
	detail: string;
	deviation: boolean;
	pass: PassName;
	rid: string;
}

// ---------------------------------------------------------------------
// 01 — crossref/citation-chop rejoins (36 entries, "ALL approved").
// Upstream sense segmentation chopped a parenthesized cross-reference or
// citation at its own `N)`, minting a phantom sense. Heal by rejoining
// number + definition into the preceding flow. rid → phantom number
// token (C00244's chopped citation is the one non-`2)` case).
// ---------------------------------------------------------------------
const CHOPPED: Record<string, string> = {
	A00913: '2)',
	A01662: '2)',
	A03104: '2)',
	A03277: '2)',
	B00534: '2)',
	B00656: '2)',
	B00991: '2)',
	C00244: '4)',
	H00709: '2)',
	H00871: '2)',
	I00137: '2)',
	I00149: '2)',
	I00753: '2)',
	J00301: '2)',
	K01188: '2)',
	L00346: '2)',
	N00327: '2)',
	N00740: '2)',
	N01381: '2)',
	O00821: '2)',
	O01360: '2)',
	O01397: '2)',
	P00286: '2)',
	P00539: '2)',
	P00805: '2)',
	P00859: '2)',
	P01088: '2)',
	P01094: '2)',
	P01436: '2)',
	Q02145: '2)',
	R00096: '2)',
	S01040: '2)',
	U00261: '2)',
	U00398: '2)',
	U01674: '2)',
	V00166: '2)',
};

// ---------------------------------------------------------------------
// 01 Note 1 — implied sense 1) (register #16): print omits `1)` when
// sense 1 is only a cross-reference after the grammatical label; v2
// inserts it as a recorded deviation. Maintainer-confirmed set (the
// chopped-crossref entries above are NOT this class — their `2)` was
// never a sense, so nothing is implied; maintainer 2026-08-05).
// ---------------------------------------------------------------------
/** rid → where the unnumbered sense-1 sits: top-level senses[0], or the
 * first child of the named verbal stem. */
const IMPLIED_ONE: Record<string, 'top' | { stem: string }> = {
	B01321: 'top',
	C01169: 'top',
	U01787: { stem: 'Af.' },
};

interface TextEdit {
	deviation: boolean;
	find: string;
	replace: string;
	rid: string;
}

/** D00072's implied `1)` sits in-text (its `—2)` run lives inside the
 * first sense's definition rather than as a sibling sense). */
const IMPLIED_ONE_TEXT: TextEdit[] = [
	{
		deviation: true,
		find: ' (b. h.) <i>to cleave, adhere, stick</i>',
		replace: ' (b. h.) 1) <i>to cleave, adhere, stick</i>',
		rid: 'D00072',
	},
];

// ---------------------------------------------------------------------
// 01 — numbering-gap marker reinserts. Only the rows whose notes record
// "source data is missing …" (print HAS the marker; the snapshot lost
// it — damage repair, not a deviation). Rows where the marker already
// sits in-text (swallowed boundary, text print-faithful) get no edit —
// migrate-dry reports them as confirmed-no-change.
// ---------------------------------------------------------------------
const REINSERTS: TextEdit[] = [
	{
		deviation: false,
		find: 'Géogr. p. 18; 261) <i>Ulam</i>',
		replace: 'Géogr. p. 18; 26 1) <i>Ulam</i>',
		rid: 'A00675',
	},
	{
		deviation: false,
		find: 'f. (b. h. <i>who? what? which?</i>',
		replace: 'f. (b. h.) <i>who? what? which?</i>',
		rid: 'A01194',
	},
	{
		deviation: false,
		find: '<i>Aryokh</i>, homiletic surname',
		replace: '<i>Aryokh</i>, 1) homiletic surname',
		rid: 'A03089',
	},
	{
		deviation: false,
		find: '‘woe’; a. fr.— הַגְּ׳',
		replace: '‘woe’; a. fr.—2) הַגְּ׳',
		rid: 'C00062',
	},
	{
		deviation: false,
		find: '(cmp. I גָּרָב 1),] <i>griva</i>, a dry measure',
		replace: '(cmp. I גָּרָב 1),] 1) <i>griva</i>, a dry measure',
		rid: 'C01331',
	},
	{
		deviation: false,
		find: 'P. Sm. 1151) <i>to thrust, fling</i>',
		replace: 'P. Sm. 1151) 1) <i>to thrust, fling</i>',
		rid: 'G00655',
	},
	{
		deviation: false,
		find: 'Stud. Bibl. I, p. 61); <span dir="rtl">נ׳ ספרא</span>',
		replace: 'Stud. Bibl. I, p. 61); 1) <span dir="rtl">נ׳ ספרא</span>',
		rid: 'N01153',
	},
	{
		deviation: false,
		find: 'Job VIII, 11</a>) <i>to swell',
		replace: 'Job VIII, 11</a>) 1) <i>to swell',
		rid: 'O00120',
	},
	{
		deviation: false,
		find: '(by charity); a. fr.— <i>lawlessness',
		replace: '(by charity); a. fr.—2) <i>lawlessness',
		rid: 'Q01974',
	},
	{
		deviation: false,
		find: '; a. fr.— <span dir="rtl">פְּתִיחַת נדר</span>',
		replace: '; a. fr.—2) <span dir="rtl">פְּתִיחַת נדר</span>',
		rid: 'Q02162',
	},
	{
		deviation: false,
		find: 'vectis, P. Sm. 3551) <i>lever, carrying pole</i>',
		replace: 'vectis, P. Sm. 3551) 1) <i>lever, carrying pole</i>',
		rid: 'S00490',
	},
	{
		deviation: false,
		find: 'cheerfulness); a. fr.— <i>any organ',
		replace: 'cheerfulness); a. fr.—2) <i>any organ',
		rid: 'U01556',
	},
	{
		deviation: false,
		find: 'Gen. R. s. 85</a>; a. fr.— <i>Absalom’s sister</i>',
		replace: 'Gen. R. s. 85</a>; a. fr.—2) <i>Absalom’s sister</i>',
		rid: 'V00704',
	},
	{
		deviation: false,
		find: '</span>); a. fr.— <i>to spurt.</i>',
		replace: '</span>); a. fr.—2) <i>to spurt.</i>',
		rid: 'V00765',
	},
];

// ---------------------------------------------------------------------
// 04 — sense-label quarantine repairs. `-2)` → em-dash `—2)` (data
// error, 5 entries); D00341's `[1)` → `1)` with the bracket moved into
// the sense text (maintainer decision — recorded deviation).
// ---------------------------------------------------------------------
const DASH_LABELS = new Set(['M02309', 'O00408', 'S02030', 'U00745', 'U00939']);

// ---------------------------------------------------------------------
// 02 — orphan refs. Class 1 (21 items): the source anchors exist but a
// raw gershayim `"` inside href/data-ref truncates the attribute; escape
// it as `&quot;` so the citation detector recovers the full ref. rid →
// orphan refs item. Class 2 (5 items / 3 texts): wrap the bare ibid text
// in a refLink anchor carrying the old refs value (P00331's three refs
// items are all covered by its one `Ib. 88ᵇ` citation). Class 3
// (3 items): remove — judged user-added via Sefaria's interface; show
// only what Jastrow linked.
// ---------------------------------------------------------------------
const CITE_ESCAPES: Record<string, string> = {
	A01069: 'Jastrow, א"ט 1',
	A01940: 'Jastrow, אלפ"א 1',
	B00752: 'Jastrow, בי"ת 1',
	B00757: 'Jastrow, בי"ת 1',
	C00473: 'Jastrow, ג"ר 1',
	C01036: 'Jastrow, גימ"ל 1',
	C01224: 'Jastrow, א"ת 1',
	C01225: 'Jastrow, ג"ר 1',
	D00791: 'Jastrow, אח"ס 1',
	E00326: 'Jastrow, ה"א 1',
	E00686: 'Jastrow, ה"א 1',
	J00083: 'Jastrow, יג"ל 1',
	M01200: 'Jastrow, מ"ם 1',
	M01490: 'Jastrow, דל"ה 1',
	M01690: 'Jastrow, אאלר"ן 1',
	N00910: 'Jastrow, אאלר"ן 1',
	P00169: 'Jastrow, דצ"ך 1',
	P00600: 'Jastrow, עיי"ן 1',
	Q00002: 'Jastrow, פ"ה 1',
	U02063: 'Jastrow, א"ת 1',
	V00042: 'Jastrow, תבש"ט 1',
};

const CITE_WRAPS: TextEdit[] = [
	{
		deviation: false,
		find: 'two S’ah. Ib. 88ᵇ <span',
		replace:
			'two S’ah. <a class="refLink" href="/Eruvin.88b.1" data-ref="Eruvin 88b:1">Ib. 88ᵇ</a> <span',
		rid: 'P00331',
	},
	{
		deviation: false,
		find: 'Targ. Y. II ib. XXI, 18; a. fr.',
		replace:
			'Targ. Y. II <a class="refLink" href="/Targum_Jerusalem,_Exodus.21.18" data-ref="Targum Jerusalem, Exodus 21:18">ib. XXI, 18</a>; a. fr.',
		rid: 'P01404',
	},
	{
		deviation: false,
		find: 'attached); ib. 85ᵇ <span',
		replace:
			'attached); <a class="refLink" href="/Yoma.85b.14" data-ref="Yoma 85b:14">ib. 85ᵇ</a> <span',
		rid: 'S01230',
	},
];

const REFS_REMOVALS: Record<string, string> = {
	D00541: 'Yoma 2a',
	M01355: 'Rosh Hashanah 23b',
	Q00890: 'Yoma 2a:3',
};

// ---------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------

function* walkSensesDeep(list: SourceSense[]): Generator<SourceSense> {
	for (const sense of list) {
		yield sense;
		if (sense.senses) {
			yield* walkSensesDeep(sense.senses);
		}
	}
}

function countOccurrences(text: string, find: string): number {
	return text.split(find).length - 1;
}

/** Apply `edit` to whichever walked definition contains its find-text,
 * asserting it occurs exactly once across the whole entry. */
function applyTextEdit(
	entry: SourceEntry,
	edit: TextEdit,
	pass: PassName,
	records: RepairRecord[],
): void {
	let total = 0;
	for (const sense of walkSensesDeep(entry.content.senses)) {
		total += countOccurrences(sense.definition ?? '', edit.find);
	}
	if (total !== 1) {
		throw new Error(
			`${edit.rid}: ${pass} find-text matched ${total}× (want 1): ${edit.find}`,
		);
	}
	for (const sense of walkSensesDeep(entry.content.senses)) {
		const definition = sense.definition ?? '';
		if (definition.includes(edit.find)) {
			sense.definition = definition.replace(edit.find, edit.replace);
			break;
		}
	}
	records.push({
		detail: `${JSON.stringify(edit.find)} → ${JSON.stringify(edit.replace)}`,
		deviation: edit.deviation,
		pass,
		rid: edit.rid,
	});
}

/** Merge the phantom sense (its chopped `N)` plus following text) back
 * into the flow it was cut from: the preceding sense's definition, or —
 * when the chop hit the very first sense — its own definition's head. */
function rejoinChopped(
	entry: SourceEntry,
	token: string,
	records: RepairRecord[],
): void {
	const senses = entry.content.senses;
	const index = senses.findIndex((s) => s.number === token);
	const phantom = senses[index];
	if (index === -1 || phantom === undefined) {
		throw new Error(`${entry.rid}: no phantom sense numbered "${token}"`);
	}
	const previous = senses[index - 1];
	if (index === 0) {
		phantom.definition = token + (phantom.definition ?? '');
		// exactOptionalPropertyTypes forbids assigning undefined to the
		// optional `number`; the key must actually vanish so serialization
		// matches an unnumbered sense.
		// biome-ignore lint/performance/noDelete: see above — key must vanish
		delete phantom.number;
	} else if (previous === undefined || previous.grammar) {
		throw new Error(`${entry.rid}: phantom "${token}" has no text flow`);
	} else {
		previous.definition =
			(previous.definition ?? '') + token + (phantom.definition ?? '');
		senses.splice(index, 1);
	}
	records.push({
		detail: `rejoined phantom "${token}" into preceding flow`,
		deviation: false,
		pass: 'rejoin-chopped',
		rid: entry.rid,
	});
}

/** Insert the implied `1)` label (register #16): the unnumbered sense
 * before the entry's `2)`-opening run gets its omitted number. */
function insertImpliedOne(
	entry: SourceEntry,
	where: 'top' | { stem: string },
	records: RepairRecord[],
): void {
	const list =
		where === 'top'
			? entry.content.senses
			: (entry.content.senses.find((s) => s.grammar?.verbal_stem === where.stem)
					?.senses ?? []);
	const [first, second] = list;
	const opensAtTwo = STEM_OPENS_AT_TWO.test(second?.number ?? '');
	if (
		first === undefined ||
		first.number !== undefined ||
		first.grammar !== undefined ||
		!opensAtTwo
	) {
		throw new Error(`${entry.rid}: implied-one shape mismatch`);
	}
	first.number = '1)';
	records.push({
		detail: `inserted implied "1)" (${where === 'top' ? 'top-level' : where.stem})`,
		deviation: true,
		pass: 'implied-one',
		rid: entry.rid,
	});
}

function repairLabels(entry: SourceEntry, records: RepairRecord[]): void {
	if (DASH_LABELS.has(entry.rid)) {
		// U00745's damaged label sits in a stem-child list, so search the
		// whole sense tree, not just the top level.
		let sense: SourceSense | undefined;
		for (const candidate of walkSensesDeep(entry.content.senses)) {
			if (candidate.number === '-2)') {
				sense = candidate;
				break;
			}
		}
		if (sense === undefined) {
			throw new Error(`${entry.rid}: no "-2)" label to repair`);
		}
		sense.number = '—2)';
		records.push({
			detail: '"-2)" → "—2)" (ASCII hyphen for em dash — data error)',
			deviation: false,
			pass: 'label-repair',
			rid: entry.rid,
		});
	}
	if (entry.rid === 'D00341') {
		const sense = entry.content.senses.find((s) => s.number === '[1)');
		if (sense === undefined) {
			throw new Error('D00341: no "[1)" label to repair');
		}
		sense.number = '1)';
		sense.definition = `[${sense.definition ?? ''}`;
		records.push({
			detail: '"[1)" → "1)", bracket moved into sense text (04 decision)',
			deviation: true,
			pass: 'label-repair',
			rid: entry.rid,
		});
	}
}

/** Drop empty strings and trim stray spaces in binyan_form arrays
 * (06 decision; upstream-issues #9/#17). Corpus-wide, not rid-keyed. */
function cleanBinyanForms(entry: SourceEntry, records: RepairRecord[]): void {
	for (const sense of walkSensesDeep(entry.content.senses)) {
		const forms = sense.grammar?.binyan_form;
		if (forms === undefined || sense.grammar === undefined) {
			continue;
		}
		const cleaned = forms.map((f) => f.trim()).filter((f) => f !== '');
		const dropped = forms.length - cleaned.length;
		const trimmed = forms.filter((f) => f !== f.trim() && f.trim() !== '');
		if (dropped === 0 && trimmed.length === 0) {
			continue;
		}
		sense.grammar.binyan_form = cleaned;
		records.push({
			detail: `binyan_form: dropped ${dropped} empty, trimmed ${trimmed.length}`,
			deviation: false,
			pass: 'binyan-cleanup',
			rid: entry.rid,
		});
	}
}

/** Escape the gershayim `"` inside the malformed anchor's href/data-ref
 * attribute values as `&quot;` so both attributes parse to the full ref. */
function escapeCiteAttributes(
	entry: SourceEntry,
	item: string,
	records: RepairRecord[],
): void {
	const match = ORPHAN_REF_ITEM.exec(item);
	const target = match?.groups?.['target'];
	const n = match?.groups?.['n'];
	if (target === undefined || n === undefined || !target.includes('"')) {
		throw new Error(`${entry.rid}: unexpected orphan refs item "${item}"`);
	}
	// Not input sanitization: a byte-level repair of a known, reviewed
	// attribute value (the headword's own gershayim), swapping the one
	// character that truncates the attribute for its entity form.
	const escaped = target.split('"').join('&quot;');
	const pairs: [string, string][] = [
		[`/Jastrow,_${target}.${n}"`, `/Jastrow,_${escaped}.${n}"`],
		[`"Jastrow, ${target} ${n}"`, `"Jastrow, ${escaped} ${n}"`],
	];
	let total = 0;
	for (const sense of walkSensesDeep(entry.content.senses)) {
		const original = sense.definition;
		let definition = original ?? '';
		for (const [find, replace] of pairs) {
			total += countOccurrences(definition, find);
			definition = definition.replaceAll(find, replace);
		}
		// Only write back on change — a grammar-only sense with no
		// definition must not gain a materialized empty string.
		if (original !== undefined && definition !== original) {
			sense.definition = definition;
		}
	}
	if (total === 0) {
		throw new Error(`${entry.rid}: no malformed anchor found for "${item}"`);
	}
	records.push({
		detail: `escaped gershayim in ${total} attribute value(s) for "${item}"`,
		deviation: false,
		pass: 'cite-escape',
		rid: entry.rid,
	});
}

function removeBaselessRef(
	entry: SourceEntry,
	item: string,
	records: RepairRecord[],
): void {
	const refs = entry.refs ?? [];
	if (!refs.includes(item)) {
		throw new Error(`${entry.rid}: refs item "${item}" not present`);
	}
	entry.refs = refs.filter((r) => r !== item);
	records.push({
		detail: `removed baseless refs item "${item}" (02 decision)`,
		deviation: false,
		pass: 'refs-removal',
		rid: entry.rid,
	});
}

/** Apply every approved repair to (a deep copy of) `source`. Pure. */
function applyRepairs(source: SourceEntry): {
	entry: SourceEntry;
	records: RepairRecord[];
} {
	const entry = structuredClone(source);
	const records: RepairRecord[] = [];
	const rid = entry.rid;

	const chopToken = CHOPPED[rid];
	if (chopToken !== undefined) {
		rejoinChopped(entry, chopToken, records);
	}
	const impliedWhere = IMPLIED_ONE[rid];
	if (impliedWhere !== undefined) {
		insertImpliedOne(entry, impliedWhere, records);
	}
	for (const edit of IMPLIED_ONE_TEXT) {
		if (edit.rid === rid) {
			applyTextEdit(entry, edit, 'implied-one', records);
		}
	}
	for (const edit of REINSERTS) {
		if (edit.rid === rid) {
			applyTextEdit(entry, edit, 'marker-reinsert', records);
		}
	}
	repairLabels(entry, records);
	cleanBinyanForms(entry, records);
	const escapeItem = CITE_ESCAPES[rid];
	if (escapeItem !== undefined) {
		escapeCiteAttributes(entry, escapeItem, records);
	}
	for (const edit of CITE_WRAPS) {
		if (edit.rid === rid) {
			applyTextEdit(entry, edit, 'cite-wrap', records);
		}
	}
	const removal = REFS_REMOVALS[rid];
	if (removal !== undefined) {
		removeBaselessRef(entry, removal, records);
	}
	return { entry, records };
}

/** Rows the review left to eyes-on — no repair applied; migrate-dry
 * lists them so they stay visible until decided. */
const DEFERRED: Record<string, string> = {
	D00470:
		'implied 1) belongs inside a Pl. section flow (01 note: "Confirm") — structure unresolved',
	K00081:
		'print sense 5 label missing and note is unresolved (01: "does not have the 5 label") — eyes-on',
	R00519:
		'sense 4\'s "[" attaches to the end of sense 3 (print "—[4)…") — bracket move not yet decided (cmp. D00341)',
};

/** Rows whose swallowed sense boundary leaves the marker in-text: text
 * already matches print, so no byte change — upstream issue only. */
const CONFIRMED_NO_CHANGE = [
	'A01350',
	'A01989',
	'C00328',
	'C00581',
	'E00024',
	'H00301',
	'H01701',
	'J00501',
	'J00515',
	'M00252',
	'N01155',
	'O00321',
	'P00882',
	'P01426',
	'Q00547',
	'R00536',
	'S02265',
	'U00764',
];

/** The orphan refs items each repaired entry's body must now carry an
 * inline citation basis for (migrate-dry's resolution recount). P00331's
 * two finer-grained refs items (Eruvin 88b:17, 88b:22) are absorbed by
 * the one `Ib. 88ᵇ` wrap — same page citation — and are not expected to
 * match an anchor of their own. */
const REPAIRED_ORPHAN_ITEMS: Record<string, string[]> = {
	...Object.fromEntries(
		Object.entries(CITE_ESCAPES).map(([rid, item]) => [rid, [item]]),
	),
	P00331: ['Eruvin 88b:1'],
	P01404: ['Targum Jerusalem, Exodus 21:18'],
	S01230: ['Yoma 85b:14'],
};

export type { PassName, RepairRecord };
export { applyRepairs, CONFIRMED_NO_CHANGE, DEFERRED, REPAIRED_ORPHAN_ITEMS };
