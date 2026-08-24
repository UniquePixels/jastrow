/**
 * The SCOPE claim in `unlinkOverDefinitions`'s docstring, pinned.
 *
 * That walk reads `senses[].definition` only, recursively. SIX rules
 * now build on it — `apparatusCite`, `rabbiName`, `ellipsisFragment`,
 * `gereshLetterNumeral`, `prefixedGereshAbbrev`,
 * `pluralToFeminineFinalLetter` — and the narrowing is safe only
 * because every one of their populations happens to live there. That
 * is a measured fact about six populations, not a property of the
 * walk, and it is exactly the kind of fact that rots: the docstring
 * carried "neither rule built on this reaches `language_reference`"
 * for three tasks after there stopped being two rules (corrected
 * 2026-08-24, task 11).
 *
 * Task 2 measured its own two rows and recorded it in
 * `task-2-report.md`. The geresh pair and the plural row never had a
 * field-scope pin at all, so this file adds one for all three, over
 * every field `fieldsOf` enumerates: headword, alt_headwords,
 * plural_form, language_code, language_reference, quotes, morphology,
 * every sense number and every grammar slot.
 *
 * A SEVENTH row reusing the walk should extend this rather than
 * assume it. Its own file rather than an addition to
 * `unlink.test.ts`, following `unlink-nesting.test.ts`: the shared
 * walk's properties are tested beside the walk, not inside one row's
 * fixtures.
 */
import { expect, it } from 'bun:test';
import { readSourceEntries } from '../../body/source.ts';
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import { tokenize } from '../html.ts';
import { anchors } from '../links.ts';
import { fieldsOf } from '../no-new-text.ts';
import { bareStubRaw, prefixedStubRaw } from './geresh.ts';
import { pluralToFeminineRaw } from './misc-links.ts';

interface Tally {
	bare: number;
	plural: number;
	prefixed: number;
}

const definitionsOf = (senses: readonly SourceSense[]): string[] =>
	senses.flatMap((sense) => [
		...(sense.definition === undefined ? [] : [sense.definition]),
		...definitionsOf(sense.senses ?? []),
	]);

/** Every member of the three raw populations in one field's markup. */
const tally = (source: SourceEntry, text: string): Tally => {
	const found: Tally = { bare: 0, plural: 0, prefixed: 0 };
	for (const anchor of anchors(tokenize(text))) {
		found.bare += bareStubRaw(source, anchor) ? 1 : 0;
		found.prefixed += prefixedStubRaw(source, anchor) ? 1 : 0;
		found.plural += pluralToFeminineRaw(source, anchor) ? 1 : 0;
	}
	return found;
};

const add = (into: Tally, from: Tally): void => {
	into.bare += from.bare;
	into.prefixed += from.prefixed;
	into.plural += from.plural;
};

/** Each anchor-bearing field of one entry, paired with whether it is
 * one of that entry's own definitions.
 *
 * `fieldsOf` returns bare strings with no field labels, so a
 * definition is identified by VALUE. The multiset drain keeps a
 * non-definition field that merely EQUALS a definition (a one-word
 * `plural_form` repeating a short sense, say) from being credited to
 * the definition side twice. */
function* linkedFields(
	source: SourceEntry,
): Generator<{ isDefinition: boolean; text: string }> {
	const remaining = new Map<string, number>();
	for (const text of definitionsOf(source.content.senses)) {
		remaining.set(text, (remaining.get(text) ?? 0) + 1);
	}
	for (const text of fieldsOf(source)) {
		if (!text.includes('<a')) {
			continue;
		}
		const left = remaining.get(text) ?? 0;
		remaining.set(text, Math.max(0, left - 1));
		yield { isDefinition: left > 0, text };
	}
}

it('every population built on unlinkOverDefinitions lives wholly in senses[].definition', async () => {
	const inside: Tally = { bare: 0, plural: 0, prefixed: 0 };
	const outside: Tally = { bare: 0, plural: 0, prefixed: 0 };
	for await (const source of readSourceEntries()) {
		for (const { isDefinition, text } of linkedFields(source)) {
			add(isDefinition ? inside : outside, tally(source, text));
		}
	}
	expect(outside).toEqual({ bare: 0, plural: 0, prefixed: 0 });
	// The same three raw populations `geresh.test.ts` and
	// `misc-links.test.ts` pin from the definition side, reached here
	// through a walk that would also have found them anywhere else.
	expect(inside).toEqual({ bare: 517, plural: 65, prefixed: 185 });
}, 30_000);
