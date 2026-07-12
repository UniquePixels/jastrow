/**
 * Full-corpus dry-run round-trip verifier (design doc §6.0,
 * entry-body-model plan Task 11 — the capstone, split across three files
 * only to stay under the per-file line budget). Given a built `Trace`
 * (the (source text, built sense) pairs `dry-run.ts`'s `buildTrace`
 * records), verifies the `rejoin`/`units`/`lettered` rules reconstruct
 * their source byte-for-byte. No dependency on `dry-run.ts` itself
 * (structural types stand in for its `SensePair`/`Trace`), so importing
 * this from `dry-run.ts` never forms a cycle.
 */
import type { LetteredParts } from './lettered.ts';
import { joinLettered, splitLettered } from './lettered.ts';
import { rejoinGlossHead, splitGlossHead } from './rejoin.ts';
import type { BodySense, SourceEntry } from './types.ts';

/** Structurally matches `dry-run.ts`'s `SensePair`/`Trace` without
 * importing them. TypeScript's structural typing accepts the real
 * `Trace` `buildTrace` returns here, excess `body`/`problems` fields and
 * all. */
interface SensePairLike {
	built: BodySense;
	original: string;
}

interface TraceLike {
	pairs: SensePairLike[];
}

interface RoundTripResult {
	lettered: boolean;
	rejoin: boolean;
	units: boolean;
}

function reconstructText(sense: BodySense): string {
	return sense.gloss + sense.units.join('');
}

/** Verifies the `units` rule for one pair: does `gloss + units.join('')`
 * reconstruct the head (or, when there's no lettered split, the whole
 * original text) — and, for every lettered child, its own item text. */
function checkUnits(pair: SensePairLike, parts: LetteredParts | null): boolean {
	const head = parts ? parts.head : pair.original;
	if (reconstructText(pair.built) !== head) {
		return false;
	}
	if (parts === null) {
		return true;
	}
	const children = pair.built.senses ?? [];
	if (children.length !== parts.items.length) {
		return false;
	}
	return parts.items.every((item, index) => {
		const child = children[index];
		return child !== undefined && reconstructText(child) === item.text;
	});
}

/** Verifies the `lettered` rule for one pair: the built child senses
 * carry the right letters in the right order, and rejoining them via
 * `joinLettered` reproduces the original text byte-for-byte. */
function checkLettered(
	pair: SensePairLike,
	parts: LetteredParts | null,
): boolean {
	const children = pair.built.senses ?? [];
	if (parts === null) {
		return children.length === 0;
	}
	if (children.length !== parts.items.length) {
		return false;
	}
	const lettersMatch = parts.items.every(
		(item, index) => children[index]?.label === item.letter,
	);
	if (!lettersMatch) {
		return false;
	}
	const rebuilt = joinLettered({
		head: reconstructText(pair.built),
		items: children.map((child) => ({
			letter: child.label ?? '',
			text: reconstructText(child),
		})),
	});
	return rebuilt === pair.original;
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

/** Runs the three structural round-trip gates for one entry. Every pair
 * `buildTrace` recorded must reconstruct its own source text; the whole
 * entry passes a rule only if every one of its pairs does. */
function evaluateRoundTrip(e: SourceEntry, trace: TraceLike): RoundTripResult {
	let units = true;
	let lettered = true;
	for (const pair of trace.pairs) {
		const parts = splitLettered(pair.original);
		if (!checkUnits(pair, parts)) {
			units = false;
		}
		if (!checkLettered(pair, parts)) {
			lettered = false;
		}
	}
	return { lettered, rejoin: checkRejoin(e), units };
}

export type { RoundTripResult };
export { evaluateRoundTrip };
