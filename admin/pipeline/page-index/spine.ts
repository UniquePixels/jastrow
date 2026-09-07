/**
 * The ordered headword "spine" — the sequence the print lays out.
 *
 * Sefaria's `rid` is a letter prefix (`A`-`V`, one per Hebrew letter in
 * alphabet order) plus a zero-padded counter that is contiguous within each
 * letter. Sorting by it therefore reproduces Jastrow's own entry order, which
 * is what lets the page index be derived by alignment rather than by
 * recognising every headword. That the order is genuinely the print's is not
 * assumed: `verify.ts` checks it against the scans.
 */

import { readFileSync } from 'node:fs';
import { looseKey, normalizeHeadword } from './hebrew.ts';

interface SpineEntry {
	/** Alternate spellings Jastrow prints on the same headword line. */
	readonly aliases: readonly string[];
	readonly headword: string;
	/** Position in print order, 0-based. */
	readonly index: number;
	/** Hebrew letter this entry belongs to, derived from the rid prefix. */
	readonly letter: string;
	readonly looseKey: string;
	readonly normalized: string;
	/** Page recorded in the shipped app data — a baseline, not ground truth. */
	readonly priorPage: number | null;
	readonly rid: string;
	/** Latin-script tokens from the definition, for OCR alignment. */
	readonly tokens: readonly string[];
}

/** rid prefix letter -> Hebrew letter. 22 letters in alphabet order. */
const LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת';

const RID_RE = /^(?<letter>[A-Z])(?<seq>\d+)$/u;

function letterForRid(rid: string): string {
	const m = RID_RE.exec(rid);
	if (!m) {
		return '';
	}
	const ord =
		((m.groups?.['letter'] as string).codePointAt(0) ?? 0) -
		('A'.codePointAt(0) ?? 0);
	return LETTERS[ord] ?? '';
}

function ridSortKey(rid: string): readonly [number, number] {
	const m = RID_RE.exec(rid);
	if (!m) {
		return [Number.MAX_SAFE_INTEGER, 0];
	}
	return [
		(m.groups?.['letter'] as string).codePointAt(0) ?? 0,
		Number(m.groups?.['seq']),
	];
}

/**
 * Latin-script word tokens, lowercased.
 *
 * Hebrew is deliberately dropped: Tesseract renders it unreliably enough that
 * including it would add noise to the alignment, whereas the English gloss and
 * the citation strings (`Y. Sabb. V, 7`, `Gen. R. s. 76`) OCR well and are
 * highly distinctive.
 */
function latinTokens(html: string): string[] {
	const text = html
		.replace(/<[^<>]*>/gu, ' ')
		.replace(/&[a-z]+;/giu, ' ')
		.toLowerCase();
	const out: string[] = [];
	for (const m of text.matchAll(/[a-z]+|\d+/gu)) {
		out.push(m[0]);
	}
	return out;
}

interface RawEntry {
	c?: { s?: { d?: string }[] };
	col?: string;
	hw: string;
	id: string;
	p?: number;
}

function definitionHtml(raw: RawEntry): string {
	return (raw.c?.s ?? []).map((s) => s.d ?? '').join(' ');
}

/** Load and order the spine from the shipped dictionary JSONL files. */
function loadSpine(files: readonly string[]): SpineEntry[] {
	const raws: RawEntry[] = [];
	for (const file of files) {
		for (const line of readFileSync(file, 'utf8').split('\n')) {
			if (line.trim()) {
				raws.push(JSON.parse(line) as RawEntry);
			}
		}
	}
	raws.sort((a, b) => {
		const ka = ridSortKey(a.id);
		const kb = ridSortKey(b.id);
		return ka[0] - kb[0] || ka[1] - kb[1];
	});
	return raws.map((raw, index) => ({
		aliases: [],
		headword: raw.hw,
		index,
		letter: letterForRid(raw.id),
		looseKey: looseKey(raw.hw),
		normalized: normalizeHeadword(raw.hw),
		priorPage: typeof raw.p === 'number' ? raw.p : null,
		rid: raw.id,
		tokens: latinTokens(definitionHtml(raw)),
	}));
}

interface SourceSenseLike {
	definition?: string;
	senses?: SourceSenseLike[];
}

interface SourceEntryLike {
	content: { senses: SourceSenseLike[] };
	headword: string;
	rid: string;
}

function definitionsOf(senses: readonly SourceSenseLike[]): string {
	const parts: string[] = [];
	for (const sense of senses) {
		parts.push(sense.definition ?? '');
		if (sense.senses) {
			parts.push(definitionsOf(sense.senses));
		}
	}
	return parts.join(' ');
}

/** Load and order the spine from the v2 source snapshot
 * (`data/source/jastrow-dictionary.jsonl`). `priorPage` is always null
 * here: the v1 baseline is gone from v2, and the page index no longer
 * needs it. */
function loadSourceSpine(
	path = 'data/source/jastrow-dictionary.jsonl',
): SpineEntry[] {
	const raws: SourceEntryLike[] = [];
	for (const line of readFileSync(path, 'utf8').split('\n')) {
		if (line.trim()) {
			raws.push(JSON.parse(line) as SourceEntryLike);
		}
	}
	raws.sort((a, b) => {
		const ka = ridSortKey(a.rid);
		const kb = ridSortKey(b.rid);
		return ka[0] - kb[0] || ka[1] - kb[1];
	});
	return raws.map((raw, index) => ({
		aliases: [],
		headword: raw.headword,
		index,
		letter: letterForRid(raw.rid),
		looseKey: looseKey(raw.headword),
		normalized: normalizeHeadword(raw.headword),
		priorPage: null,
		rid: raw.rid,
		tokens: latinTokens(definitionsOf(raw.content.senses)),
	}));
}

export type { SpineEntry };
export { latinTokens, letterForRid, loadSourceSpine, loadSpine };
