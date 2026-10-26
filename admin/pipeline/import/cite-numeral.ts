/**
 * Gate 13, `citeNumeral` (review checklist 2026-10-25, group 2): a
 * numeral an internal cite names agrees with the entry it links to.
 *
 * Every internal anchor of the composed entry (the source's `<a>`,
 * before markup translation, so its `data-ref` is still there) whose
 * visible text ends in a homograph numeral (`v. חוּל I`, `עָמַד II)`)
 * or whose `data-ref` names one (`Jastrow, אוּלָם I 1`) is one mark.
 * It passes when the target the link resolves to (gate 6's resolution,
 * by the link key) carries every numeral named on one of its forms, or
 * is the `ch.` line under that numeral, or the cite is on the allowlist
 * (`CITE_NUMERAL_KEPT_PATH`).
 *
 * **The `ch.` line** (ruling `10-15 ch. cross-reference`): `X N ch.`
 * names the unnumbered Aramaic line print sets right after `X N`. So a
 * target that carries no numeral, whose first gloss opens `ch.`, and
 * whose predecessor in rid order carries the numeral, agrees: that is
 * the line the ruling says the cite names, read off the stored data.
 *
 * An implied I needs no clause: since 10-13 it is a stored `homograph:
 * 1` like any other, and the target's stored numeral is what is read.
 *
 * **The allowlist** holds what no stored value can settle: a cite kept
 * as printed (10-13 case 3, annotated `kept`), and a genuine mismatch
 * waiting on a print read (`pending: true`, review checklist group 3).
 * A row that matches no failing cite is stale and fails the gate, so a
 * cite a later patch fixes takes its row with it.
 */
import { intToRoman } from '../../entry/headwords.ts';
import { tokenize } from '../../entry/html.ts';
import type { Entry } from '../../entry/types.ts';
import { fieldsOf } from '../transform/no-new-text.ts';
import type { SourceEntry } from '../types.ts';
import { internalTarget, linkKey } from './cite.ts';
import type { CiteNumeralKept } from './cite-numeral-kept.ts';
import { mark, type Tally, tally, textOf } from './gates.ts';

/** A numeral at the end of a cite's visible text, after a space,
 * optionally closed by print's `)` or `.` inside the anchor. */
const TEXT_NUMERAL = /\s(?<n>[IVX]+)\)?\.?$/u;
/** The headword a `data-ref` names (`Jastrow, אוּלָם I 1`), without
 * its trailing sense number. */
const DATA_REF = /^Jastrow, (?<hw>.*?)(?: \d+)?$/u;
/** A numeral at the end of that headword. */
const REF_NUMERAL = /\s(?<n>[IVX]+)$/u;
/** A `ch.` line's gloss opens so (ruling 10-15). */
const CH_LINE = /^ch\./u;
const HREF = /\bhref="(?<v>[^"]*)"/u;
const DATA_REF_ATTR = /\bdata-ref="(?<v>[^"]*)"/u;
/** Roman numeral → number, as far as any family runs. */
const NUMERALS: ReadonlyMap<string, number> = new Map(
	Array.from({ length: 20 }, (_, i) => [intToRoman(i + 1), i + 1]),
);

/** One internal anchor of a composed entry: its `href`, `data-ref` and
 * visible text. */
interface Anchor {
	dataRef: string;
	href: string;
	text: string;
}

/** Every anchor in one HTML field, with its visible text (nested tags
 * stripped). */
function anchorsIn(html: string): Anchor[] {
	const anchors: Anchor[] = [];
	let open: Anchor | undefined;
	for (const token of tokenize(html)) {
		if (token.kind === 'text') {
			if (open !== undefined) {
				open.text += token.value;
			}
		} else if (token.name === 'a' && token.close && open !== undefined) {
			anchors.push(open);
			open = undefined;
		} else if (token.name === 'a' && !token.close) {
			open = {
				dataRef: DATA_REF_ATTR.exec(token.value)?.groups?.['v'] ?? '',
				href: HREF.exec(token.value)?.groups?.['v'] ?? '',
				text: '',
			};
		}
	}
	return anchors;
}

/** The numerals an anchor names: its visible text's, then its
 * `data-ref`'s, each once. */
function numeralsOf(anchor: Anchor): number[] {
	const found = new Set<number>();
	const text = TEXT_NUMERAL.exec(anchor.text.trim())?.groups?.['n'];
	const hw = DATA_REF.exec(anchor.dataRef)?.groups?.['hw'] ?? '';
	const ref = REF_NUMERAL.exec(hw)?.groups?.['n'];
	for (const glyph of [text, ref]) {
		const n = NUMERALS.get(glyph ?? '');
		if (n !== undefined) {
			found.add(n);
		}
	}
	return [...found];
}

/** Whether `entry` carries numeral `n` on any form. */
function carries(entry: Entry | undefined, n: number): boolean {
	return (entry?.headwords ?? []).some((form) => form.homograph === n);
}

/** Whether `target` is the `ch.` line under numeral `n` (ruling 10-15):
 * it carries no numeral, its first gloss opens `ch.`, and the entry
 * print sets right before it carries `n`. */
function isChLine(
	target: Entry,
	before: Entry | undefined,
	n: number,
): boolean {
	return (
		target.headwords.every((form) => form.homograph === undefined) &&
		CH_LINE.test(textOf(target.senses[0]?.gloss ?? '').trim()) &&
		carries(before, n)
	);
}

/** What the gate needs beside the composed entries. */
interface CiteNumeralSources {
	/** The link key → rid map gate 6 resolves by (row `10-09 link key`). */
	headwordMap: ReadonlyMap<string, string>;
	/** The allowlist (`parseCiteNumeralKept`). */
	kept: readonly CiteNumeralKept[];
	/** The finished entries: whose stored numerals a target carries. */
	targets: readonly Entry[];
}

/** The gate's tally and what the blessing counts: the cites checked,
 * the allowlist rows that kept one, and how many of those are pending
 * a read. */
interface CiteNumeralResult {
	counts: { checked: number; kept: number; pending: number };
	tally: Tally;
}

/** The key a cite and an allowlist row are matched on: citing rid,
 * target rid and the cite's text in NFC. */
function keyOf(rid: string, ref: string, cite: string): string {
	return [rid, ref, cite.normalize('NFC').trim()].join('\n');
}

/** The run's view of the finished targets: by rid, and each rid's
 * predecessor in rid order (the entry a `ch.` line sits under). */
interface Targets {
	before: ReadonlyMap<string, Entry>;
	byId: ReadonlyMap<string, Entry>;
}

/** Index the finished entries by rid and by predecessor. */
function indexTargets(entries: readonly Entry[]): Targets {
	const byId = new Map(entries.map((e) => [e.id, e]));
	const order = [...byId.keys()].sort();
	const before = new Map<string, Entry>();
	for (const [i, id] of order.entries()) {
		const prior = byId.get(order[i - 1] ?? '');
		if (prior !== undefined) {
			before.set(id, prior);
		}
	}
	return { before, byId };
}

/** The entry an anchor links to, by the link key; `undefined` for an
 * external link, or one gate 6 reports unresolved. */
function resolved(
	anchor: Anchor,
	headwordMap: ReadonlyMap<string, string>,
	targets: Targets,
): Entry | undefined {
	const target = internalTarget(anchor.href);
	const ref =
		target === undefined ? undefined : headwordMap.get(linkKey(target));
	return ref === undefined ? undefined : targets.byId.get(ref);
}

/** The numerals of `named` that `target` disagrees with: carried on
 * no form, and not the `ch.` line under them. */
function disagreeing(
	named: readonly number[],
	target: Entry,
	targets: Targets,
): number[] {
	const before = targets.before.get(target.id);
	return named.filter(
		(n) => !(carries(target, n) || isChLine(target, before, n)),
	);
}

/** One failure line: the cite, what it names, what its target carries. */
function failure(
	rid: string,
	anchor: Anchor,
	wrong: readonly number[],
	target: Entry,
): string {
	const homographs = target.headwords
		.map((form) => form.homograph)
		.filter((n) => n !== undefined);
	const carried =
		homographs.length === 0 ? 'none' : homographs.map(intToRoman).join(', ');
	return `${rid}: cite "${anchor.text.trim()}" (data-ref "${anchor.dataRef}") names ${wrong.map(intToRoman).join(', ')}; ${target.id} carries ${carried}`;
}

/** What one run of the gate carries from anchor to anchor. */
interface Run {
	counts: CiteNumeralResult['counts'];
	headwordMap: ReadonlyMap<string, string>;
	rows: ReadonlyMap<string, CiteNumeralKept>;
	t: Tally;
	targets: Targets;
	/** The allowlist keys that kept a failing cite. */
	used: Set<string>;
}

/** One anchor's mark, when it names a numeral and links internally:
 * it passes when its target agrees, or an allowlist row keeps it. */
function markAnchor(run: Run, rid: string, anchor: Anchor): void {
	const named = numeralsOf(anchor);
	const target = resolved(anchor, run.headwordMap, run.targets);
	if (named.length === 0 || target === undefined) {
		return;
	}
	run.counts.checked++;
	const wrong = disagreeing(named, target, run.targets);
	const key = keyOf(rid, target.id, anchor.text);
	const row = wrong.length > 0 ? run.rows.get(key) : undefined;
	if (row !== undefined) {
		run.used.add(key);
		run.counts.kept++;
		run.counts.pending += row.pending === true ? 1 : 0;
	}
	mark(
		run.t,
		wrong.length === 0 || row !== undefined,
		failure(rid, anchor, wrong, target),
	);
}

/** Gate 13 over the composed entries (see the module comment). */
function checkCiteNumerals(
	composed: readonly SourceEntry[],
	sources: CiteNumeralSources,
): CiteNumeralResult {
	const run: Run = {
		counts: { checked: 0, kept: 0, pending: 0 },
		headwordMap: sources.headwordMap,
		rows: new Map(
			sources.kept.map((row) => [keyOf(row.rid, row.ref, row.cite), row]),
		),
		t: tally(),
		targets: indexTargets(sources.targets),
		used: new Set<string>(),
	};
	for (const entry of composed) {
		for (const anchor of fieldsOf(entry).flatMap(anchorsIn)) {
			markAnchor(run, entry.rid, anchor);
		}
	}
	for (const [key, row] of run.rows) {
		if (!run.used.has(key)) {
			mark(
				run.t,
				false,
				`${row.rid}: cite-numeral-kept row for "${row.cite}" → ${row.ref} matches no failing cite: stale, remove it`,
			);
		}
	}
	return { counts: run.counts, tally: run.t };
}

export type { CiteNumeralResult, CiteNumeralSources };
export { anchorsIn, checkCiteNumerals, numeralsOf };
