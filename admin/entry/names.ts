/**
 * The name an entry is addressed by (URL names spec
 * `docs/archive/specs/2026-09-21-url-names-design.md` §4, rulings U2 and U5).
 *
 * The name is NOT stored. It is computed from the primary headword
 * form object every time it is needed, so it cannot drift from the
 * headword the way a stored `slug` could (§5.1). `data/entries/`
 * therefore holds no field this module writes.
 *
 * The form object is the unit of derivation rather than the entry.
 * headword-design §2 has since replaced `headword` with `headwords[]`
 * (index 0 primary), and because `deriveFormName` takes the FORM, the
 * rename reached only `getPrimaryName` — which is the point of the
 * split.
 *
 * One function per step, and every caller uses it (ruling
 * `11-07 one comparison rule`): `deriveFormName` makes a form's name,
 * already in comparison form; `getPrimaryName` takes the entry's;
 * `namePath` turns a name into its URL path; and `findNameProblems`
 * checks the PATHS, so what it calls unique is what the URL is.
 */
import { findDuplicates } from '../lib/find-duplicates.ts';
import { toComparisonForm } from '../lib/hebrew.ts';
import { intToRoman, intToSup } from './headwords.ts';
import type { Entry, FormObject } from './schema.ts';

/** Print notation that is ABOUT the word rather than part of it, and
 * so is dropped from the name alone (spec §4): `(`, `)`, `?` and `,`.
 * The headword and its display keep every one of them — B00825 still
 * displays `*(?)בַּלְוָוטִי`, and its name is `*בַּלְוָוטִי`.
 *
 * `*` is NOT here: U5 makes the reconstructed star part of the name.
 * It reaches the name from two directions — `reconstructed` on a
 * parsed form, and the literal star inside an UNPARSED form's `text`
 * — and both are wanted. Without it the 23 `*`/plain pairs
 * (`*טְפֵי` / `טְפֵי`) collide.
 *
 * `=` is NOT here either: it marks a cross-reference that belongs in
 * the gloss, and the odd name keeps a new `X = Y` line visible until
 * it is repaired — rule 4 (`headword-rules.ts`) fails such an entry,
 * so the import's `contract` gate refuses to write it and
 * `bun data:validate` refuses it in the committed tree. A01175 and
 * A01345, the last two, were repaired by patch (#113, #139). */
const NOTATION = /[()?,]/gu;

/** The name a headword form is addressed by (spec §4):
 *
 *     word = text with ( ) ? , removed, in comparison form
 *     name = ("*" if reconstructed) + word
 *          + (" " + Roman if homograph) + superscript(disambiguator)
 *
 * The numeral and the superscript are both in the name, though only
 * the numeral is displayed: a `disambiguator` is never displayed
 * (ruling 10-06 hidden superscript) and still names the entry. An I
 * set by correction (ruling 10-13 correction policy, where Jastrow's
 * text names `X I`) is a plain `homograph` and names the entry like
 * any other numeral.
 *
 * The word is put in comparison form (`toComparisonForm`: NFC, runs of
 * whitespace one space, trimmed), since stripping notation can leave a
 * gap or an edge space where a parenthesis sat, and a name is compared
 * as it comes out. The numeral and superscript appended after it keep
 * that form. Nothing here rewrites stored text: the name is never
 * stored, and the one step that rewrites a file is the import WRITE
 * (`normalizeForWrite`, #110). */
function deriveFormName(form: FormObject): string {
	const word = toComparisonForm(form.text.replace(NOTATION, ''));
	let name = form.reconstructed === true ? `*${word}` : word;
	if (form.homograph !== undefined) {
		name += ` ${intToRoman(form.homograph)}`;
	}
	if (form.disambiguator !== undefined) {
		name += intToSup(form.disambiguator);
	}
	return name;
}

/** A name's URL path: each space as `_` (spec §4). The one function
 * that turns a name into a path; compile imports it, and the
 * uniqueness check compares its output, so two names the path spells
 * alike (`X Y`, `X_Y`) are a collision. Percent-encoding comes after
 * it, in compile, and cannot make two paths equal. */
function namePath(name: string): string {
	return name.replaceAll(' ', '_');
}

/** An entry's current name, from its PRIMARY headword form — the
 * `headwords[0]` of headword-design §2 and URL names spec §4.
 *
 * An entry with no forms at all is not a shape the schema admits
 * (`minItems: 1`), and it names the empty string rather than throwing:
 * `findNameProblems` reports an empty name as its own problem, which is
 * the reading a caller wants from a file that got past the schema by a
 * hand edit. */
function getPrimaryName(entry: Pick<Entry, 'headwords'>): string {
	const primary = entry.headwords[0];
	return primary === undefined ? '' : deriveFormName(primary);
}

/** One entry that cannot hold its name, and why. The rid is a FIELD
 * rather than a prefix a caller re-parses off `line`: gate 7 marks per
 * rid, and recovering the rid by slicing the prose would make every
 * mark miss — silently passing 2n/2n with collisions in place — the
 * day the message gains a prefix. */
interface NameProblem {
	line: string;
	rid: string;
}

/** Every entry whose name path another entry already holds, or whose
 * name is empty, in the order given — the `name-collision` finding of spec
 * §7, and the whole of the "current names unique" gate of §5.2 (both
 * the import gate and the `bun qa` one, so the two cannot drift
 * apart).
 *
 * The EMPTY case is its own clause because uniqueness cannot see it:
 * one entry whose `headwords[0].text` is all notation (`(?)`) strips
 * to nothing and collides with nobody, so it would pass both gates and
 * end up addressable by no URL at all. `slug-unsafe` and `checkSlugs`'
 * presence clause covered that family before; this replaces them.
 * Measured 0 over the committed 32,512.
 *
 * The gates the published-names ledger needs — no current name equals
 * another entry's former name, and each former name appears on
 * exactly one entry — are deliberately NOT here. Spec §5.2's last row
 * says the ledger does not exist before publication, so there is
 * nothing for them to check against; they arrive with §9 step 6.
 * `formerNames` is in the schema and absent from every entry until
 * then. */
function findNameProblems(
	entries: readonly Pick<Entry, 'headwords' | 'id'>[],
): NameProblem[] {
	const named = entries.map((entry) => ({
		entry,
		name: getPrimaryName(entry),
	}));
	const owners = new Map(
		findDuplicates(
			named.filter(({ name }) => name !== ''),
			({ name }) => namePath(name),
		).map(({ item, owner }) => [item, owner.entry.id]),
	);
	return named.flatMap((item) => {
		const { entry, name } = item;
		if (name === '') {
			return [
				{
					line: `${entry.id}: name is empty from ${JSON.stringify(entry.headwords[0]?.text ?? null)}`,
					rid: entry.id,
				},
			];
		}
		const owner = owners.get(item);
		return owner === undefined
			? []
			: [
					{
						line: `${entry.id}: name ${name} taken by ${owner}`,
						rid: entry.id,
					},
				];
	});
}

export type { NameProblem };
export { deriveFormName, findNameProblems, getPrimaryName, namePath };
