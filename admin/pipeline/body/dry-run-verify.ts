/**
 * Full-corpus dry-run round-trip verifier (design doc §6.0,
 * entry-body-model plan Task 11 — the capstone, split across three files
 * only to stay under the per-file line budget). Given a built `Trace`
 * (the (source text, built sense) pairs `dry-run.ts`'s `buildTrace`
 * records), verifies the `rejoin`/`units`/`lettered`/`plural` rules
 * reconstruct their source byte-for-byte. No dependency on `dry-run.ts`
 * itself (structural types stand in for its `SensePair`/`Trace`), so
 * importing this from `dry-run.ts` never forms a cycle.
 */
import type { LetteredParts } from './lettered.ts';
import { joinLettered, splitLettered } from './lettered.ts';
import type { PluralParts } from './plural.ts';
import { joinPlural, splitPlural } from './plural.ts';
import { rejoinGlossHead, splitGlossHead } from './rejoin.ts';
import type { BodySense, SourceEntry } from './types.ts';

/** Structurally matches `dry-run.ts`'s `SensePair`/`Trace` without
 * importing them. TypeScript's structural typing accepts the real
 * `Trace` `buildTrace` returns here, excess `body`/`problems` fields and
 * all. */
interface SensePairLike {
	built: BodySense;
	original: string;
	pluralSibling?: BodySense;
}

interface TraceLike {
	pairs: SensePairLike[];
}

interface RoundTripResult {
	lettered: boolean;
	plural: boolean;
	pluralSplit: boolean;
	rejoin: boolean;
	units: boolean;
}

function reconstructText(sense: BodySense): string {
	return sense.gloss + sense.units.join('');
}

/** The text `pair.built`'s own gloss+units are expected to reconstruct —
 * the lettered head, further narrowed to just its host portion when a
 * plural split (B12) also carved a `—Pl. …` block out of it. */
function expectedHost(
	pair: SensePairLike,
	lettered: LetteredParts | null,
	plural: PluralParts | null,
): string {
	const head = lettered ? lettered.head : pair.original;
	return plural ? plural.host : head;
}

/** Verifies the `units` rule for one pair: does `gloss + units.join('')`
 * reconstruct the (plural- and lettered-narrowed) host text — and, for
 * every lettered child, its own item text. Plural items are checked
 * separately by `checkPlural`, since they live on the sibling sense, not
 * on `pair.built`. */
function checkUnits(
	pair: SensePairLike,
	lettered: LetteredParts | null,
	plural: PluralParts | null,
): boolean {
	if (reconstructText(pair.built) !== expectedHost(pair, lettered, plural)) {
		return false;
	}
	if (lettered === null) {
		return true;
	}
	const children = pair.built.senses ?? [];
	if (children.length !== lettered.items.length) {
		return false;
	}
	return lettered.items.every((item, index) => {
		const child = children[index];
		return child !== undefined && reconstructText(child) === item.text;
	});
}

/** What `pair.built` (+ its plural sibling, if any) reconstructs back to
 * — the lettered head, i.e. the text `joinLettered` needs on its `head`
 * side to reproduce `pair.original`. */
function reconstructHead(
	pair: SensePairLike,
	plural: PluralParts | null,
): string {
	const hostText = reconstructText(pair.built);
	if (plural === null || pair.pluralSibling === undefined) {
		return hostText;
	}
	const children = pair.pluralSibling.senses ?? [];
	return joinPlural({
		host: hostText,
		intro: pair.pluralSibling.gloss,
		items: children.map((child) => ({
			label: child.label ?? '',
			text: reconstructText(child),
		})),
	});
}

/** Verifies the `lettered` rule for one pair: the built child senses
 * carry the right letters in the right order, and rejoining them via
 * `joinLettered` reproduces the original text byte-for-byte — using the
 * plural-aware `reconstructHead` for the `head` side, since a plural
 * split may have carved part of that head out onto a sibling sense. */
function checkLettered(
	pair: SensePairLike,
	letteredParts: LetteredParts | null,
	plural: PluralParts | null,
): boolean {
	const children = pair.built.senses ?? [];
	if (letteredParts === null) {
		return children.length === 0;
	}
	if (children.length !== letteredParts.items.length) {
		return false;
	}
	const lettersMatch = letteredParts.items.every(
		(item, index) => children[index]?.label === item.letter,
	);
	if (!lettersMatch) {
		return false;
	}
	const rebuilt = joinLettered({
		head: reconstructHead(pair, plural),
		items: children.map((child) => ({
			letter: child.label ?? '',
			text: reconstructText(child),
		})),
	});
	return rebuilt === pair.original;
}

/** Verifies the `plural` rule (B12) for one pair: when the lettered head
 * carries a genuine `—Pl. …` block, the sibling sense's gloss is the
 * intro verbatim (no units of its own), its children carry the right
 * restarted labels in order, and rejoining host + intro + items via
 * `joinPlural` reproduces the (lettered) head byte-for-byte. When there's
 * no plural block, verifies no sibling was built at all. */
function checkPlural(
	pair: SensePairLike,
	head: string,
	plural: PluralParts | null,
): boolean {
	if (plural === null) {
		return pair.pluralSibling === undefined;
	}
	const sibling = pair.pluralSibling;
	if (sibling === undefined) {
		return false;
	}
	if (sibling.units.length !== 0 || sibling.gloss !== plural.intro) {
		return false;
	}
	const children = sibling.senses ?? [];
	if (children.length !== plural.items.length) {
		return false;
	}
	const labelsMatch = plural.items.every(
		(item, index) => children[index]?.label === item.label,
	);
	if (!labelsMatch) {
		return false;
	}
	const rebuilt = joinPlural({
		host: reconstructText(pair.built),
		intro: sibling.gloss,
		items: children.map((child) => ({
			label: child.label ?? '',
			text: reconstructText(child),
		})),
	});
	return rebuilt === head;
}

/** Verifies the `rejoin` rule: splitting the freshly rejoined gloss head
 * back apart, using the offsets `rejoinGlossHead` itself recorded,
 * reproduces the four source fields exactly. */
function checkRejoin(e: SourceEntry): boolean {
	const { joined, offsets } = rejoinGlossHead(e);
	const split = splitGlossHead(joined, offsets);
	return (
		split.morphology === (e.content.morphology ?? '') &&
		split.languageCode === (e.language_code ?? '') &&
		split.languageReference === (e.language_reference ?? '') &&
		split.senseHead === (e.content.senses[0]?.definition ?? '')
	);
}

/** Runs the four structural round-trip gates for one entry. Every pair
 * `buildTrace` recorded must reconstruct its own source text; the whole
 * entry passes a rule only if every one of its pairs does.
 * `pluralSplit` reports whether any pair actually carried a plural block
 * (B12) — `dry-run-report.ts`'s `pluralSplits` count sums this across the
 * corpus, independent of `census.ts`'s coarser `pluralSections` detector
 * (see plural.ts's header comment for why the two counts differ). */
function evaluateRoundTrip(e: SourceEntry, trace: TraceLike): RoundTripResult {
	let units = true;
	let lettered = true;
	let plural = true;
	let pluralSplit = false;
	for (const pair of trace.pairs) {
		const letteredParts = splitLettered(pair.original);
		const head = letteredParts ? letteredParts.head : pair.original;
		const pluralParts = splitPlural(head);
		if (pluralParts !== null) {
			pluralSplit = true;
		}
		if (!checkUnits(pair, letteredParts, pluralParts)) {
			units = false;
		}
		if (!checkLettered(pair, letteredParts, pluralParts)) {
			lettered = false;
		}
		if (!checkPlural(pair, head, pluralParts)) {
			plural = false;
		}
	}
	return { lettered, plural, pluralSplit, rejoin: checkRejoin(e), units };
}

export type { RoundTripResult };
export { evaluateRoundTrip };
