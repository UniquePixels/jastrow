/**
 * Full-corpus dry-run round-trip verifier (design doc §6.0,
 * entry-body-model plan Task 11 — the capstone, split across three files
 * only to stay under the per-file line budget). Given a built `Trace`
 * (the (source text, built sense) pairs `dry-run.ts`'s `buildTrace`
 * records), verifies the `rejoin`/`units`/`lettered`/`formSection` rules
 * reconstruct their source byte-for-byte. No dependency on `dry-run.ts`
 * itself (structural types stand in for its `SensePair`/`Trace`), so
 * importing this from `dry-run.ts` never forms a cycle.
 */
import type { FormSectionParts } from './form-sections.ts';
import { joinFormSection, splitFormSection } from './form-sections.ts';
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
	formSectionSibling?: BodySense;
	original: string;
}

interface TraceLike {
	pairs: SensePairLike[];
}

interface RoundTripResult {
	formSection: boolean;
	formSectionMarker: string | null;
	lettered: boolean;
	rejoin: boolean;
	units: boolean;
}

function reconstructText(sense: BodySense): string {
	return sense.gloss + sense.units.join('');
}

/** The text `pair.built`'s own gloss+units are expected to reconstruct —
 * the lettered head, further narrowed to just its host portion when a
 * form-section split (B12) also carved a marker block (`—Pl. …`, `—Part.
 * pass. …`, `—Fem. …`, `—Denom. …`) out of it. */
function expectedHost(
	pair: SensePairLike,
	lettered: LetteredParts | null,
	formSection: FormSectionParts | null,
): string {
	const head = lettered ? lettered.head : pair.original;
	return formSection ? formSection.host : head;
}

/** Verifies the `units` rule for one pair: does `gloss + units.join('')`
 * reconstruct the (form-section- and lettered-narrowed) host text — and,
 * for every lettered child, its own item text. Form-section items are
 * checked separately by `checkFormSection`, since they live on the
 * sibling sense, not on `pair.built`. */
function checkUnits(
	pair: SensePairLike,
	lettered: LetteredParts | null,
	formSection: FormSectionParts | null,
): boolean {
	if (
		reconstructText(pair.built) !== expectedHost(pair, lettered, formSection)
	) {
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

/** What `pair.built` (+ its form-section sibling, if any) reconstructs
 * back to — the lettered head, i.e. the text `joinLettered` needs on its
 * `head` side to reproduce `pair.original`. */
function reconstructHead(
	pair: SensePairLike,
	formSection: FormSectionParts | null,
): string {
	const hostText = reconstructText(pair.built);
	if (formSection === null || pair.formSectionSibling === undefined) {
		return hostText;
	}
	const children = pair.formSectionSibling.senses ?? [];
	return joinFormSection({
		host: hostText,
		intro: pair.formSectionSibling.gloss,
		items: children.map((child) => ({
			label: child.label ?? '',
			text: reconstructText(child),
		})),
		marker: formSection.marker,
	});
}

/** Verifies the `lettered` rule for one pair: the built child senses
 * carry the right letters in the right order, and rejoining them via
 * `joinLettered` reproduces the original text byte-for-byte — using the
 * form-section-aware `reconstructHead` for the `head` side, since a
 * form-section split may have carved part of that head out onto a
 * sibling sense. */
function checkLettered(
	pair: SensePairLike,
	letteredParts: LetteredParts | null,
	formSection: FormSectionParts | null,
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
	// The marker's raw shape (`a)` vs `<i>a</i>)` vs `a</i>)`) isn't
	// stored on the built child (its label is just the letter), so it
	// comes from the fresh re-split of the original text instead.
	const rebuilt = joinLettered({
		head: reconstructHead(pair, formSection),
		items: children.map((child, index) => ({
			letter: child.label ?? '',
			marker: letteredParts.items[index]?.marker ?? '',
			text: reconstructText(child),
		})),
	});
	return rebuilt === pair.original;
}

/** Verifies the `formSection` rule (B12) for one pair: when the lettered
 * head carries a genuine marker block (`—Pl. …`, `—Part. pass. …`,
 * `—Fem. …`, `—Denom. …`), the sibling sense's gloss is the intro
 * verbatim (no units of its own), its children carry the right
 * restarted labels in order, and rejoining host + intro + items via
 * `joinFormSection` reproduces the (lettered) head byte-for-byte. When
 * there's no form-section block, verifies no sibling was built at all. */
function checkFormSection(
	pair: SensePairLike,
	head: string,
	formSection: FormSectionParts | null,
): boolean {
	if (formSection === null) {
		return pair.formSectionSibling === undefined;
	}
	const sibling = pair.formSectionSibling;
	if (sibling === undefined) {
		return false;
	}
	if (sibling.units.length !== 0 || sibling.gloss !== formSection.intro) {
		return false;
	}
	const children = sibling.senses ?? [];
	if (children.length !== formSection.items.length) {
		return false;
	}
	const labelsMatch = formSection.items.every(
		(item, index) => children[index]?.label === item.label,
	);
	if (!labelsMatch) {
		return false;
	}
	const rebuilt = joinFormSection({
		host: reconstructText(pair.built),
		intro: sibling.gloss,
		items: children.map((child) => ({
			label: child.label ?? '',
			text: reconstructText(child),
		})),
		marker: formSection.marker,
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
 * `formSectionMarker` reports which marker (Pl./Part. pass./Fem./Denom.)
 * a split pair carried, or null when no pair in this entry split at all
 * — `dry-run-report.ts`'s `formSectionSplits`/`formSectionSplitsByMarker`
 * counts sum this across the corpus, independent of `census.ts`'s
 * coarser `pluralSections` detector (see form-sections.ts's header
 * comment for why the two counts differ). Corpus-measured: no entry's
 * pairs carry two different markers' splits, so the last split seen
 * (in pair order) is always the only one. */
function evaluateRoundTrip(e: SourceEntry, trace: TraceLike): RoundTripResult {
	let units = true;
	let lettered = true;
	let formSection = true;
	let formSectionMarker: string | null = null;
	for (const pair of trace.pairs) {
		const letteredParts = splitLettered(pair.original);
		const head = letteredParts ? letteredParts.head : pair.original;
		const formSectionParts = splitFormSection(head);
		if (formSectionParts !== null) {
			formSectionMarker = formSectionParts.marker;
		}
		if (!checkUnits(pair, letteredParts, formSectionParts)) {
			units = false;
		}
		if (!checkLettered(pair, letteredParts, formSectionParts)) {
			lettered = false;
		}
		if (!checkFormSection(pair, head, formSectionParts)) {
			formSection = false;
		}
	}
	return {
		formSection,
		formSectionMarker,
		lettered,
		rejoin: checkRejoin(e),
		units,
	};
}

export type { RoundTripResult };
export { evaluateRoundTrip };
