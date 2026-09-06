/**
 * `unlinkedBareAnaphor` over the whole corpus.
 *
 * Four things need asserting rather than arguing: the population and
 * its SCOPE, the funnel that turns it into a repair count, the phase's
 * arithmetic closing to the digit, and the three gates holding on
 * every entry the rule touches — not on the one fixture the unit tier
 * uses.
 *
 * The fifth thing, whether the antecedent chosen is the RIGHT one, is
 * not here and cannot be: this file can only compare the rule against
 * itself. It is measured in `docs/v2/phase-2-unlinked-ib.md` §4 against
 * the linker's own resolution of 1,859 known-answer anchored anaphors.
 * Neither half is sufficient alone — see [[feedback_vacuous_gates]].
 */
import { expect, it } from 'bun:test';
import type { SourceEntry } from '../../body/types.ts';
import { tokenize } from '../html.ts';
import { checkLinkTargets } from '../link-target.ts';
import { anchors } from '../links.ts';
import { checkMarkup } from '../markup.ts';
import { checkNoNewText, fieldsOf } from '../no-new-text.ts';
import { applyTransforms } from '../run.ts';
import { unlinkedBareAnaphor } from './anaphora-mint.ts';
import { composedEntries, repairedEntries } from './corpus-fixture.ts';

const TIMEOUT = 300_000;

const BARE = /(?<![\p{L}\p{N}])(?:Ib|ib)\.(?![\p{L}\p{N}])/gu;
const OWN_LOCUS = /^\s*(?:\d|[IVXLC]+[,.\s]|[a-z]?\d)/u;
const ANAPHOR_DISPLAY = /^(?:Ib|ib)\.$/u;

/** Bare anaphors — outside every anchor, carrying no locus of their
 * own — with the entries holding them. */
function bareAnaphors(entries: readonly SourceEntry[]): {
	entries: number;
	occurrences: number;
} {
	let occurrences = 0;
	let hit = 0;
	for (const entry of entries) {
		const before = occurrences;
		for (const field of fieldsOf(entry)) {
			if (!/[Ii]b\./u.test(field)) {
				continue;
			}
			const tokens = tokenize(field);
			const list = anchors(tokens);
			const spanned = new Set<number>();
			for (const anchor of list) {
				const end = anchor.close === -1 ? tokens.length : anchor.close;
				for (let at = anchor.open; at <= end; at += 1) {
					spanned.add(at);
				}
			}
			for (const [at, token] of tokens.entries()) {
				if (token.kind !== 'text' || spanned.has(at)) {
					continue;
				}
				for (const match of token.value.matchAll(BARE)) {
					const after = token.value.slice(match.index + match[0].length);
					if (!OWN_LOCUS.test(after)) {
						occurrences += 1;
					}
				}
			}
		}
		if (occurrences > before) {
			hit += 1;
		}
	}
	return { entries: hit, occurrences };
}

/** Anchors whose display is a bare anaphor — the other side of the
 * same ledger. */
function anchoredAnaphors(entries: readonly SourceEntry[]): number {
	let total = 0;
	for (const entry of entries) {
		for (const field of fieldsOf(entry)) {
			if (!/[Ii]b\./u.test(field)) {
				continue;
			}
			total += anchors(tokenize(field)).filter((anchor) =>
				ANAPHOR_DISPLAY.test(anchor.display.trim()),
			).length;
		}
	}
	return total;
}

it(
	'the population is 2,819 occurrences across 2,179 entries',
	async () => {
		expect(bareAnaphors(await repairedEntries())).toEqual({
			entries: 2179,
			occurrences: 2819,
		});
	},
	TIMEOUT,
);

it(
	'every one of them is in a sense definition and nowhere else',
	async () => {
		// SCOPE MEASURED, NOT ASSUMED — `h-cognate-self-link`'s lesson.
		// The rule walks `content.senses[].definition` only, so a member
		// in any other field would be silently unrepairable.
		const walk = (senses: readonly { definition?: string }[]): string[] =>
			senses.flatMap((sense) => [
				sense.definition ?? '',
				...walk(
					(sense as { senses?: readonly { definition?: string }[] }).senses ??
						[],
				),
			]);
		let outside = 0;
		for (const entry of await repairedEntries()) {
			const inDefinitions = new Set(walk(entry.content?.senses ?? []));
			const rest = fieldsOf(entry).filter((field) => !inDefinitions.has(field));
			outside += bareAnaphors([
				{ content: { senses: rest.map((definition) => ({ definition })) } },
			] as unknown as SourceEntry[]).occurrences;
		}
		expect(outside).toBe(0);
	},
	TIMEOUT,
);

it(
	'mints 2,118 alone and 2,119 at its registry position',
	async () => {
		const repaired = await repairedEntries();
		let alone = 0;
		let entries = 0;
		for (const entry of repaired) {
			const result = unlinkedBareAnaphor.apply(entry);
			if (result.minted === undefined) {
				continue;
			}
			entries += 1;
			alone += result.minted.length;
		}
		expect({ alone, entries }).toEqual({ alone: 2118, entries: 1750 });

		// AT ITS POSITION it takes one more, because a rule above creates
		// one site. That is the second reason it runs last, and asserting
		// both figures is what makes the claim checkable rather than a
		// note in the registry comment.
		let placed = 0;
		for (const entry of repaired) {
			for (const record of applyTransforms(entry, 'text-repairs').records) {
				if (record.ruleId === unlinkedBareAnaphor.id) {
					placed += Number(record.detail.split(' ')[0]);
				}
			}
		}
		expect(placed).toBe(2119);
	},
	TIMEOUT,
);

it(
	'the phase arithmetic closes to the digit',
	async () => {
		const repaired = await repairedEntries();
		const composed = await composedEntries();
		// 2,819 before, one created above, 2,119 minted, 701 left.
		expect(bareAnaphors(composed)).toEqual({ entries: 570, occurrences: 701 });
		// And the other side of the ledger gains exactly the 2,119, which
		// is the assertion that says the rule ANCHORED them rather than
		// deleting them. A rule that dropped the text would satisfy the
		// line above on its own.
		expect(anchoredAnaphors(repaired)).toBe(2244);
		expect(anchoredAnaphors(composed)).toBe(2244 + 2119);
	},
	TIMEOUT,
);

it(
	'clears all three gates on every entry it touches',
	async () => {
		// The unit tier gates ONE fixture. This is the same three checks
		// over all 1,750, which is where a case-10 claim naming the wrong
		// field or a tag copied from an unusable anchor would surface.
		const problems: string[] = [];
		for (const entry of await repairedEntries()) {
			const result = unlinkedBareAnaphor.apply(entry);
			if (result.minted === undefined) {
				continue;
			}
			problems.push(
				...checkNoNewText(entry, result.entry, unlinkedBareAnaphor),
				...checkMarkup(entry, result.entry),
				...checkLinkTargets(
					entry,
					result.entry,
					result,
					unlinkedBareAnaphor.id,
				),
			);
		}
		expect(problems).toEqual([]);
	},
	TIMEOUT,
);

it(
	'writes no target the entry did not already hold',
	async () => {
		// Case 10 checks this per claim; this checks the OUTCOME, which is
		// the thing a reader cares about — no address in the corpus after
		// this rule that was not in it before.
		const novel: string[] = [];
		for (const entry of await repairedEntries()) {
			const result = unlinkedBareAnaphor.apply(entry);
			if (result.minted === undefined) {
				continue;
			}
			const held = new Set(
				fieldsOf(entry).flatMap((field) =>
					anchors(tokenize(field)).flatMap((anchor) => [
						anchor.dataRef,
						anchor.href,
					]),
				),
			);
			for (const field of fieldsOf(result.entry)) {
				for (const anchor of anchors(tokenize(field))) {
					if (!held.has(anchor.dataRef) || !held.has(anchor.href)) {
						novel.push(`${entry.rid}: ${anchor.dataRef}`);
					}
				}
			}
		}
		expect(novel).toEqual([]);
	},
	TIMEOUT,
);
