import { expect, it } from 'bun:test';
import { buildTrace } from '../../body/dry-run.ts';
import { applyRepairs } from '../../body/repairs.ts';
import { readSourceEntries } from '../../body/source.ts';
import type {
	BodyEntry,
	BodySense,
	SourceEntry,
	SourceSense,
} from '../../body/types.ts';
import { RULES } from '../registry.ts';
import { applyTransforms } from '../run.ts';
import { LABELS, strandedStemHead } from './stem-section.ts';

/**
 * `stranded-stem-head`'s population, measured where the rule stands.
 *
 * The row was catalogued at 544 entries with NO predicate recorded
 * anywhere, so "reproduce the count" had no target until this file.
 * Everything here is measured on
 * `applyTransforms(applyRepairs(source).entry, 'text-repairs')` — the
 * entry the `structural-repairs` phase actually receives — with the
 * RAW figure asserted alongside wherever the two differ, which for
 * this row is everywhere that matters.
 *
 * ONE WALK, memoised, in the corpus-tier style
 * `stem-corpus.test.ts` records.
 */

/** The row's own predicate, VERBATIM as `patterns.jsonl`, the spec and
 * the audit state it, with the label alternation built from the rule's
 * exported vocabulary so the two cannot drift.
 *
 * Wider than the RULE's `HEAD` on purpose — it admits the leading `=`,
 * multi-label runs and inner whitespace, so the slices the rule refuses
 * are counted here rather than being invisible. It is NOT wider than
 * the published predicate, and the difference is not academic: a first
 * cut spelled the multi-label continuation `[/,]\s*[^<]*`, which
 * accepts a label followed by a comma and any prose at all. It measures
 * the same 561 on this snapshot — the corpus happens to hold no such
 * definition — so every assertion below would have passed while pinning
 * a number for a predicate no document states. A re-fetch could split
 * the two silently. */
const ALTERNATION = LABELS.map((l) =>
	l.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'),
).join('|');
const OPEN = new RegExp(
	`^(?<pre>[\\s,;.=]*)<i>\\s*(?<run>(?:${ALTERNATION})(?:\\s*[/,]\\s*(?:${ALTERNATION}))*)\\s*</i>(?<rest>[\\s\\S]*)$`,
	'u',
);

interface Census {
	/** Entries whose rendered body loses a codepoint that is not a
	 * space, comma or semicolon. Must be 0. */
	badLosses: number;
	corpusEntries: number;
	/** The `= Label` cross-references. */
	crossEquals: number;
	/** The `Label of X` glosses. */
	crossOf: number;
	/** Entries where the repair would mint a stem name the entry
	 * already carries on another top-level block. Must be 0. */
	duplicateStem: number;
	/** Entries `OPEN` matches, composed. */
	entComposed: number;
	entRaw: number;
	/** How the repaired members' child text OPENS: an rtl anchor, an
	 * rtl span, or something else. The anchor figure is the argument
	 * for leaving `binyan_form` empty, so it is pinned rather than
	 * quoted — a first draft of the rule's docstring quoted 267, which
	 * is the anchor count over the whole 561-member POPULATION and not
	 * over the 436 that ship. */
	formAnchor: number;
	formOther: number;
	formSpan: number;
	/** Codepoints the rendered body gains. Must be 0. */
	gained: number;
	/** Codepoints the rendered body loses, all seam. */
	lost: number;
	/** Occurrences matching `OPEN` at any depth, before and after the
	 * `text-repairs` pass, and after `applyRepairs` alone. */
	occComposed: number;
	occRaw: number;
	occRepaired: number;
	/** Entries with no `verbal_stem` anywhere at all. */
	orphanEntries: number;
	/** `OPEN` matches the rule refuses because they are not sense 0 of
	 * `content.senses`. */
	refusedChild: number;
	refusedLater: number;
	/** `OPEN` matches the rule refuses because `rest` does not open
	 * with a space and then something: the etymology-paren remnants
	 * and the two double heads. Mirrors the rule's own clause exactly:
	 * a Hebrew form is NOT required, because the rule does not require
	 * one either — it never writes `binyan_form`. */
	refusedShape: number;
	/** Entries this rule changed, and the stem blocks they gained. */
	ruleEntries: number;
	stemsGained: number;
	/** `OPEN` matches whose sense ALREADY carries a grammar object.
	 * Must be 0 — it is the row's strongest uniformity claim, and
	 * `tallyRefusals` silently depends on it, since that walk skips a
	 * grammar-bearing sense while `opens` counts it. Were one to
	 * appear, the partition sum would fail without naming the cause. */
	withGrammar: number;
}

function walk(
	senses: readonly SourceSense[],
	visit: (sense: SourceSense, top: boolean, index: number) => void,
	top = true,
): void {
	senses.forEach((sense, index) => {
		visit(sense, top, index);
		walk(sense.senses ?? [], visit, false);
	});
}

/** Occurrences of `OPEN` in one entry. */
function opens(entry: SourceEntry): number {
	let n = 0;
	walk(entry.content.senses, (sense) => {
		if (typeof sense.definition === 'string' && OPEN.test(sense.definition)) {
			n++;
		}
	});
	return n;
}

/** Rendered text of one built body, tags stripped — the only place a
 * structural repair's loss becomes visible, because `buildStem` drops
 * `sense.definition` and `fieldsOf` never runs the builder. */
const sensesText = (senses: readonly BodySense[]): string =>
	senses
		.map((s) => s.gloss + s.units.join('') + sensesText(s.senses ?? []))
		.join('');
const bodyText = (body: BodyEntry): string =>
	(
		sensesText(body.senses) +
		(body.stems ?? [])
			.map((s) => s.stem + s.forms.join('') + sensesText(s.senses))
			.join('')
	).replace(/<[^>]*>/gu, '');

function multiset(text: string): Map<string, number> {
	const counts = new Map<string, number>();
	for (const ch of text) {
		counts.set(ch, (counts.get(ch) ?? 0) + 1);
	}
	return counts;
}

/** How a repaired member's child text opens. */
const RTL_ANCHOR = /^<a\b[^>]*dir="rtl"/u;
const RTL_SPAN = /^<span dir="rtl">/u;

/** Codepoints `x` holds beyond `y`. */
function excess(
	x: Map<string, number>,
	y: Map<string, number>,
): [string, number][] {
	const out: [string, number][] = [];
	for (const [ch, n] of x) {
		const over = n - (y.get(ch) ?? 0);
		if (over > 0) {
			out.push([ch, over]);
		}
	}
	return out;
}

/** The slices the rule refuses, tallied on the composed entry. */
function tallyRefusals(entry: SourceEntry, c: Census): void {
	walk(entry.content.senses, (sense, top, index) => {
		const def = sense.definition;
		if (typeof def !== 'string' || sense.grammar !== undefined) {
			return;
		}
		const match = OPEN.exec(def);
		if (match === null) {
			return;
		}
		const pre = match.groups?.['pre'] ?? '';
		const rest = match.groups?.['rest'] ?? '';
		if (pre.includes('=')) {
			c.crossEquals++;
		} else if (/^\s*of\b/u.test(rest)) {
			c.crossOf++;
		} else if (!top) {
			c.refusedChild++;
		} else if (index !== 0) {
			c.refusedLater++;
		} else if (!/^\s\S/u.test(rest)) {
			c.refusedShape++;
		}
	});
}

async function build(): Promise<Census> {
	const c: Census = {
		badLosses: 0,
		corpusEntries: 0,
		crossEquals: 0,
		crossOf: 0,
		duplicateStem: 0,
		entComposed: 0,
		entRaw: 0,
		formAnchor: 0,
		formOther: 0,
		formSpan: 0,
		gained: 0,
		lost: 0,
		occComposed: 0,
		occRaw: 0,
		occRepaired: 0,
		orphanEntries: 0,
		refusedChild: 0,
		refusedLater: 0,
		refusedShape: 0,
		ruleEntries: 0,
		stemsGained: 0,
		withGrammar: 0,
	};
	for await (const source of readSourceEntries()) {
		c.corpusEntries++;
		const raw = opens(source);
		c.occRaw += raw;
		if (raw > 0) {
			c.entRaw++;
		}
		const healed = applyRepairs(source).entry;
		c.occRepaired += opens(healed);

		const texted = applyTransforms(healed, 'text-repairs').entry;
		const composed = opens(texted);
		c.occComposed += composed;
		if (composed > 0) {
			c.entComposed++;
			let anyStem = false;
			walk(texted.content.senses, (sense) => {
				anyStem ||= sense.grammar?.verbal_stem !== undefined;
			});
			if (!anyStem) {
				c.orphanEntries++;
			}
		}
		walk(texted.content.senses, (sense) => {
			if (
				sense.grammar !== undefined &&
				typeof sense.definition === 'string' &&
				OPEN.test(sense.definition)
			) {
				c.withGrammar++;
			}
		});
		tallyRefusals(texted, c);

		const run = strandedStemHead.apply(texted);
		if (run.records.length === 0) {
			continue;
		}
		c.ruleEntries++;
		const body = run.entry.content.senses[0]?.senses?.[0]?.definition ?? '';
		if (RTL_ANCHOR.test(body)) {
			c.formAnchor++;
		} else if (RTL_SPAN.test(body)) {
			c.formSpan++;
		} else {
			c.formOther++;
		}
		const minted = run.entry.content.senses[0]?.grammar?.verbal_stem;
		if (
			texted.content.senses
				.slice(1)
				.some((s) => s.grammar?.verbal_stem === minted)
		) {
			c.duplicateStem++;
		}
		const before = buildTrace(texted).body;
		const after = buildTrace(run.entry).body;
		c.stemsGained += (after.stems ?? []).length - (before.stems ?? []).length;
		const b = multiset(bodyText(before));
		const a = multiset(bodyText(after));
		for (const [ch, n] of excess(b, a)) {
			c.lost += n;
			if (!' ,;'.includes(ch)) {
				c.badLosses += n;
			}
		}
		for (const [, n] of excess(a, b)) {
			c.gained += n;
		}
	}
	return c;
}

let pending: Promise<Census> | undefined;
/** Memoised so the composed corpus pass runs once per process. */
const census = (): Promise<Census> => {
	pending ??= build();
	return pending;
};

// The vocabulary first. It is DERIVED from the corpus's own
// `verbal_stem` field, so an upstream value appearing or vanishing
// must fail here rather than silently move the population.
it('derives its 45 labels from the corpus verbal_stem field', async () => {
	const values = new Set<string>();
	for await (const entry of readSourceEntries()) {
		walk(entry.content.senses, (sense) => {
			const stem = sense.grammar?.verbal_stem;
			if (stem !== undefined) {
				values.add(stem);
			}
		});
	}
	expect(values.size).toBe(70);
	// Every frozen label is a value the corpus really spells, and every
	// value the corpus spells that looks like a single binyan name is
	// frozen. The 25 excluded are batch 6b's 19 non-binyan values plus
	// the six multi-label headings (`"Hithpa. a. Nithpa."` and kin).
	expect(LABELS).toHaveLength(45);
	expect(LABELS.every((label) => values.has(label))).toBe(true);
	// The only single-word values the corpus spells that are NOT frozen
	// here are batch 6b's two inflection heads, which a label-shaped
	// test cannot tell from a binyan name and the catalogue names by
	// enumeration.
	expect(
		[...values].filter(
			(v) => /^[A-Za-zëï]+\.$/u.test(v) && !LABELS.includes(v),
		),
	).toEqual(['Fem.', 'Pl.']);
}, 600_000);

// The denominator, and the finding: the population is nearly twice as
// large where the rule stands as it is on raw source, and the whole
// difference is one upstream rule.
it('reproduces the population raw, repaired and composed', async () => {
	const c = await census();
	expect(c.corpusEntries).toBe(32_512);
	expect(c.occRaw).toBe(360);
	expect(c.entRaw).toBe(359);
	// `applyRepairs` touches none of it.
	expect(c.occRepaired).toBe(360);
	expect(c.occComposed).toBe(561);
	expect(c.entComposed).toBe(555);
	expect(c.orphanEntries).toBe(340);
	// EVERY match sits on a sense with no grammar object at all. The
	// row's uniformity claim, and the premise `tallyRefusals` rests on.
	expect(c.withGrammar).toBe(0);
}, 600_000);

// THE ATTRIBUTION, measured rather than argued. A predicate about what
// is INSIDE an italic run cannot be measured before the rule that puts
// the period there has run.
it('attributes the whole raw-to-composed gap to label-period-outside-italic', async () => {
	let before = 0;
	let after = 0;
	const only = RULES.filter((r) => r.id === 'label-period-outside-italic');
	expect(only).toHaveLength(1);
	for await (const source of readSourceEntries()) {
		const healed = applyRepairs(source).entry;
		before += opens(healed);
		after += opens(applyTransforms(healed, 'text-repairs', only).entry);
	}
	expect(before).toBe(360);
	expect(after).toBe(562);
}, 600_000);

it('repairs 436 of the 561 and refuses the rest by the predicate', async () => {
	const c = await census();
	expect(c.ruleEntries).toBe(436);
	expect(c.stemsGained).toBe(436);
	expect(c.refusedChild).toBe(100);
	expect(c.crossOf).toBe(14);
	// 7 etymology-paren remnants plus 2 heads of a shape the rule does
	// not take (`I00696`'s double head, `O01115`'s paren prefix).
	expect(c.refusedShape).toBe(9);
	expect(c.crossEquals).toBe(2);
	// Both top-level non-first matches are cross-references, counted
	// above; nothing reaches this slice.
	expect(c.refusedLater).toBe(0);
	// The partition is exhaustive: nothing in the population is
	// unaccounted for by either the rule or a named refusal.
	expect(
		c.ruleEntries +
			c.refusedChild +
			c.crossOf +
			c.refusedShape +
			c.crossEquals +
			c.refusedLater,
	).toBe(c.occComposed);
});

// THE FALSIFIER. A rule that mints a stem section must not mint one
// the entry already has; no gate in `run.ts` can see a duplicate.
it('mints no stem name the entry already carries', async () => {
	const c = await census();
	expect(c.duplicateStem).toBe(0);
});

// The argument for `binyan_form: []`, pinned rather than quoted. Every
// anchor figure in the docs is about ONE of two populations and they
// differ: 230 of the 436 that ship, 267 across the whole 561-member
// row.
it('leaves an anchor-borne form in the prose for 230 of the 436', async () => {
	const c = await census();
	expect(c.formAnchor).toBe(230);
	expect(c.formSpan).toBe(199);
	expect(c.formOther).toBe(7);
	expect(c.formAnchor + c.formSpan + c.formOther).toBe(c.ruleEntries);
});

// What `fieldsOf` cannot see. `buildStem` DROPS `sense.definition`, so
// a structural repair's real loss only becomes visible after the body
// is built — this walks the rendered body on both sides.
it('invents nothing and loses only seam punctuation in the built body', async () => {
	const c = await census();
	expect(c.gained).toBe(0);
	expect(c.badLosses).toBe(0);
	expect(c.lost).toBe(1065);
});
