/**
 * Deterministic anomaly hints for sweep inputs (batch-01 breach
 * remediation, 2026-08-13; RUNBOOK step 2).
 *
 * The batch-01 verification tier showed the sweep systematically
 * misses sub-token class-8 losses (a comma where the corpus's
 * citation formula has a period, a bare abbreviation missing its
 * period, a truncated formula) and circular `v.` cross-references —
 * defects invisible to structural checks and only detectable by
 * corpus-frequency comparison. That comparison is deterministic, so
 * it runs here once per batch instead of inside every sweep agent.
 *
 * Hints are *hints*: prep attaches them to chunk inputs and the
 * sweep prompt (v3) directs agents to judge each one against the
 * entry. Rules are precision-tuned on the full corpus
 * (2026-08-13 calibration):
 *
 * - `comma-for-period` — 101 entries corpus-wide; catches the
 *   batch-01 misses A00470 (`Ar, ed.`) and A00266 (`in Ar,`).
 * - `bare-abbrev` — 395 entries; catches the pilot-miss shape
 *   A00074 (`bot` for `bot.`).
 * - `rare-dotted-variant` — 247 entries; catches `Rab.` where the
 *   corpus formula is `Rabb.` (edit distance 1).
 * - `circular-v-ref` — 59 entries; catches A00571 (`, v. <self>`).
 * - `truncated-formula` — 5 entries; catches A00638
 *   (`D. S. a.` with no ` l.`).
 *
 * Link-target rules (`abbrev-mislink`, `exact-headword-diverge`,
 * `niqqud-twin-target`, `roman-numeral-display`) live in
 * link-anomalies.ts — batch-02 remediation, 2026-08-17.
 *
 * `hebrew-rare-confusable` — the Hebrew-side analogue of the Latin
 * frequency rules above — lives in hebrew-anomalies.ts, round-1
 * detector calibration, 2026-08-18.
 */
import type { SourceEntry } from '../body/types.ts';
import {
	entryDefinitions,
	type HeadwordIndex,
	ownForms,
} from './headword-index.ts';
import type { HebrewTable } from './hebrew-anomalies.ts';
import { hebrewHints } from './hebrew-anomalies.ts';
import { linkHints } from './link-anomalies.ts';

/** One deterministic finding attached to a chunk-input entry. */
interface AnomalyHint {
	detail: string;
	kind:
		| 'abbrev-mislink'
		| 'bare-abbrev'
		| 'circular-v-ref'
		| 'comma-for-period'
		| 'exact-headword-diverge'
		| 'hebrew-rare-confusable'
		| 'inflection-escape-link'
		| 'niqqud-twin-target'
		| 'one-consonant-diverge'
		| 'rare-dotted-variant'
		| 'roman-numeral-display'
		| 'truncated-formula';
}

/** Corpus-wide counts of a short Latin token's punctuation forms. */
interface AbbrevCounts {
	bare: number;
	comma: number;
	dotted: number;
}

/** Frequency table over every definition in the corpus. */
type AbbrevTable = Map<string, AbbrevCounts>;

/** Calibrated thresholds (2026-08-13). A form is anomalous when the
 * dotted form both clears MIN_DOTTED and outnumbers the observed
 * form RATIO-fold; a dotted token is "rare" at or below MAX_RARE
 * with an edit-distance-1 sibling at or above MIN_SIBLING. */
const ABBREV_THRESHOLDS = {
	maxRare: 5,
	minDotted: 50,
	minSibling: 100,
	ratio: 20,
};

/** Stereotyped citation formulas whose truncation is a class-8
 * signal. Each regex matches the *defective* (truncated) form. */
const TRUNCATED_FORMULAS: readonly { detail: string; pattern: RegExp }[] = [
	{
		detail:
			"'D. S. a.' without the ' l.' that completes the corpus formula 'Rabb. D. S. a. l.'",
		pattern: /D\. S\. a\.(?!\s*l\.)/u,
	},
	{
		detail:
			"a Roman numeral followed by a bare number where the corpus citation formula puts a comma ('I 60ᶜ' for 'I, 60ᶜ'): 18 corpus instances against 46,161 with the comma",
		pattern: /\b(?<!\w)[IVX]{1,6}\s+\d/u,
	},
];

/** A short Latin word with optional attached punctuation, as it
 * appears in tag-stripped definition text. */
const WORD =
	/^[([{'"“‘]*(?<word>[A-Za-z]{1,6})(?<punct>[.,])?[)\]}'"”’.,;:]*$/u;

const ANCHOR =
	/<a [^>]*data-ref="Jastrow, (?<ref>[^"]+)"[^>]*>(?<display>.*?)<\/a>/gu;

const TAG = /<[^>]*>/gu;
const WHITESPACE = /\s+/u;
const TRAILING_SENSE_NUMBER = / \d+$/u;
const V_ABBREV_BEFORE = /\bv\.\s*$/iu;

function stripTags(s: string): string {
	return s.replace(TAG, ' ');
}

/** Fold one raw whitespace-token into the table. */
function countToken(table: AbbrevTable, raw: string): void {
	const m = WORD.exec(raw);
	if (m === null) {
		return;
	}
	const word = m.groups?.['word'] as string;
	const counts = table.get(word) ?? { bare: 0, comma: 0, dotted: 0 };
	if (m.groups?.['punct'] === '.') {
		counts.dotted += 1;
	} else if (m.groups?.['punct'] === ',') {
		counts.comma += 1;
	} else {
		counts.bare += 1;
	}
	table.set(word, counts);
}

/** Count dotted/comma/bare forms of short Latin tokens across every
 * definition of every entry. Build once per batch over the
 * pre-patch corpus. */
function buildAbbrevTable(entries: Iterable<SourceEntry>): AbbrevTable {
	const table: AbbrevTable = new Map();
	for (const entry of entries) {
		for (const def of entryDefinitions(entry)) {
			for (const raw of stripTags(def).split(WHITESPACE)) {
				countToken(table, raw);
			}
		}
	}
	return table;
}

/** Dominant dotted forms one edit away from `word` (the
 * `Rab.`/`Rabb.` relationship), via deletion-variant matching. */
function ed1DominantSiblings(word: string, table: AbbrevTable): string[] {
	const siblings: string[] = [];
	for (const [other, counts] of table) {
		if (other === word || counts.dotted < ABBREV_THRESHOLDS.minSibling) {
			continue;
		}
		if (editDistanceIsOne(word, other)) {
			siblings.push(other);
		}
	}
	return siblings;
}

/** Whether two words are exactly one insert/delete/substitute
 * apart. */
function editDistanceIsOne(a: string, b: string): boolean {
	if (a === b || Math.abs(a.length - b.length) > 1) {
		return false;
	}
	const [short, long] = a.length <= b.length ? [a, b] : [b, a];
	if (short.length === long.length) {
		let diff = 0;
		for (let i = 0; i < short.length; i++) {
			if (short[i] !== long[i]) {
				diff += 1;
			}
		}
		return diff === 1;
	}
	let i = 0;
	let j = 0;
	let skipped = false;
	while (i < short.length && j < long.length) {
		if (short[i] === long[j]) {
			i += 1;
			j += 1;
			continue;
		}
		if (skipped) {
			return false;
		}
		skipped = true;
		j += 1;
	}
	return true;
}

/** Abbreviation-frequency hints for one raw token. */
function tokenHints(raw: string, table: AbbrevTable): AnomalyHint[] {
	const m = WORD.exec(raw);
	if (m === null) {
		return [];
	}
	const word = m.groups?.['word'] as string;
	const counts = table.get(word);
	if (counts === undefined) {
		return [];
	}
	const hints: AnomalyHint[] = [];
	const dominant = counts.dotted >= ABBREV_THRESHOLDS.minDotted;
	if (
		m.groups?.['punct'] === ',' &&
		dominant &&
		counts.dotted >= ABBREV_THRESHOLDS.ratio * counts.comma
	) {
		hints.push({
			detail: `'${word},' where the corpus writes '${word}.' ${counts.dotted}x vs ',' ${counts.comma}x`,
			kind: 'comma-for-period',
		});
	}
	if (
		m.groups?.['punct'] === undefined &&
		dominant &&
		counts.dotted >= ABBREV_THRESHOLDS.ratio * counts.bare
	) {
		hints.push({
			detail: `bare '${word}' where the corpus writes '${word}.' ${counts.dotted}x vs bare ${counts.bare}x`,
			kind: 'bare-abbrev',
		});
	}
	if (
		m.groups?.['punct'] === '.' &&
		counts.dotted <= ABBREV_THRESHOLDS.maxRare
	) {
		const siblings = ed1DominantSiblings(word, table);
		if (siblings.length > 0) {
			hints.push({
				detail: `rare '${word}.' (${counts.dotted}x) beside dominant '${siblings.join(".', '")}.'`,
				kind: 'rare-dotted-variant',
			});
		}
	}
	return hints;
}

/** Truncated stereotyped-formula hints in one definition. */
function formulaHints(def: string): AnomalyHint[] {
	const stripped = stripTags(def);
	return TRUNCATED_FORMULAS.filter((f) => f.pattern.test(stripped)).map(
		(f) => ({ detail: f.detail, kind: 'truncated-formula' as const }),
	);
}

/** Circular `v.`-reference hints in one definition. */
function circularHints(def: string, headword: string): AnomalyHint[] {
	const hints: AnomalyHint[] = [];
	for (const m of def.matchAll(ANCHOR)) {
		const target = (m.groups?.['ref'] as string).replace(
			TRAILING_SENSE_NUMBER,
			'',
		);
		const before = def.slice(Math.max(0, (m.index ?? 0) - 12), m.index);
		if (target === headword && V_ABBREV_BEFORE.test(before)) {
			hints.push({
				detail: `'v.' cross-reference targets this entry's own headword (${headword})`,
				kind: 'circular-v-ref',
			});
		}
	}
	return hints;
}

/** Deterministic hints for one entry against the corpus table. */
function entryAnomalyHints(
	entry: SourceEntry,
	table: AbbrevTable,
	index?: HeadwordIndex,
	hebrewTable?: HebrewTable,
): AnomalyHint[] {
	const hints: AnomalyHint[] = [];
	const linkFields = [...entryDefinitions(entry)];
	// The batch-02 miss A00988 sat in `language_reference`, so the
	// link rules read the etymology field as well as the senses.
	if (typeof entry.language_reference === 'string') {
		linkFields.push(entry.language_reference);
	}
	for (const def of entryDefinitions(entry)) {
		for (const raw of stripTags(def).split(WHITESPACE)) {
			hints.push(...tokenHints(raw, table));
		}
		hints.push(...formulaHints(def));
		hints.push(...circularHints(def, entry.headword));
		if (hebrewTable !== undefined) {
			hints.push(...hebrewHints(def, hebrewTable));
		}
	}
	if (index !== undefined) {
		const own = ownForms(entry);
		for (const text of linkFields) {
			hints.push(...linkHints(text, own, index));
		}
	}
	// One hint per distinct finding, however often the token recurs.
	const seen = new Set<string>();
	return hints.filter((h) => {
		const key = `${h.kind}|${h.detail}`;
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

export type { AbbrevCounts, AbbrevTable, AnomalyHint };
export {
	ABBREV_THRESHOLDS,
	buildAbbrevTable,
	editDistanceIsOne,
	entryAnomalyHints,
	TRUNCATED_FORMULAS,
};
