/**
 * The name an entry is addressed by (URL names spec
 * `docs/specs/2026-09-21-url-names-design.md` §4, rulings U2 and U5).
 *
 * The name is NOT stored. It is computed from the primary headword
 * form object every time it is needed, so it cannot drift from the
 * headword the way a stored `slug` could (§5.1). `data/entries/`
 * therefore holds no field this module writes.
 *
 * The form object is the unit of derivation rather than the entry.
 * headword-design §2 has since replaced `headword` with `headwords[]`
 * (index 0 primary), and because `deriveName` takes the FORM, the
 * rename reached only `nameOf` — which is the point of the split.
 */
import { intToRoman, intToSup } from './headwords.ts';
import type { FormObject, TruthEntry } from './types.ts';

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
 * `=` is NOT here either: it marks a cross-reference the headword
 * itself still owes, and the odd name keeps that visible until the
 * headword work resolves A01175 and A01345 (spec §4). */
const NOTATION = /[()?,]/gu;
/** Runs of whitespace collapse to one space, and the ends are
 * trimmed: stripping notation can leave a gap or an edge space where
 * a parenthesis used to sit. */
const WHITESPACE = /\s+/gu;

/** The name a headword form is addressed by (spec §4):
 *
 *     word = text with ( ) ? , removed; whitespace collapsed; trimmed
 *     name = ("*" if reconstructed) + word
 *          + (" " + Roman if homograph) + superscript(disambiguator)
 *
 * Returns the name in the form's OWN normalization; `nameKey` is what
 * comparison uses. Nothing here rewrites stored text — the one step
 * that does is the migrate WRITE (`normalizeForWrite`, #110), which
 * runs long after this and puts the file into NFC. */
function deriveName(form: FormObject): string {
	const word = form.text.replace(NOTATION, '').replace(WHITESPACE, ' ').trim();
	let name = form.reconstructed === true ? `*${word}` : word;
	if (form.homograph !== undefined) {
		name += ` ${intToRoman(form.homograph)}`;
	}
	if (form.disambiguator !== undefined) {
		name += intToSup(form.disambiguator);
	}
	return name;
}

/** The key a name is compared and looked up by: NFC, and nothing
 * else (spec §4, §3). Hebrew combining marks order differently under
 * NFD, so two spellings of one name are two Map keys and a uniqueness
 * check over the raw strings would pass on a pair that resolves to
 * one URL. The data is clean today (0 non-NFC headwords); this covers
 * a URL typed or pasted from elsewhere with its marks in a different
 * order, and a hand edit that arrives decomposed. */
function nameKey(name: string): string {
	return name.normalize('NFC');
}

/** An entry's current name, from its PRIMARY headword form — the
 * `headwords[0]` of headword-design §2 and URL names spec §4.
 *
 * An entry with no forms at all is not a shape the schema admits
 * (`minItems: 1`), and it names the empty string rather than throwing:
 * `nameCollisions` reports an empty name as its own problem, which is
 * the reading a caller wants from a file that got past the schema by a
 * hand edit. */
function nameOf(entry: Pick<TruthEntry, 'headwords'>): string {
	const primary = entry.headwords[0];
	return primary === undefined ? '' : deriveName(primary);
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

/** Every entry whose name another entry already holds, or whose name
 * is empty, in the order given — the `name-collision` finding of spec
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
function nameCollisions(
	entries: readonly Pick<TruthEntry, 'headwords' | 'id'>[],
): NameProblem[] {
	const owners = new Map<string, string>();
	const problems: NameProblem[] = [];
	for (const entry of entries) {
		const name = nameOf(entry);
		const key = nameKey(name);
		if (key === '') {
			problems.push({
				line: `${entry.id}: name is empty from ${JSON.stringify(entry.headwords[0]?.text ?? null)}`,
				rid: entry.id,
			});
			continue;
		}
		const owner = owners.get(key);
		if (owner === undefined) {
			owners.set(key, entry.id);
		} else {
			problems.push({
				line: `${entry.id}: name ${name} taken by ${owner}`,
				rid: entry.id,
			});
		}
	}
	return problems;
}

export type { NameProblem };
export { deriveName, nameCollisions, nameKey, nameOf };
