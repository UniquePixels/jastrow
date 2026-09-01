/**
 * `shin-sin-dot-drop` — a Hebrew ש in an otherwise-pointed token that
 * has lost its shin or sin point while the form it names carries one.
 *
 * ## The comparator, not the raw count
 *
 * The raw population is misleading and the row's own audit says so.
 * Measured over all 32,512 entries after `applyRepairs`, PER
 * COMPARATOR rather than in aggregate:
 *
 * | Position | Dotted | Bare | Dotted rate |
 * |---|---:|---:|---:|
 * | shin carrying a vowel or dagesh | 32,014 | **102** | **99.68%** |
 * | proclitic ש־ before a word | free variation | | a coin flip |
 *
 * Only the first is a defect. The proclitic position is genuine free
 * variation, so absence there carries no signal and the naive count
 * must never be reported.
 *
 * ## What ships: 52 of the 102, and the other 50 are not withheld out
 * of caution
 *
 * Restoring the dot means choosing between שׁ and שׂ, and a rule that
 * chooses is doing the reconstruction [[project_no_vowel_inference]]
 * rules out. So the rule restores a dot only where the corpus itself
 * spells the word out: a TWIN, byte-identical to the damaged word
 * except for the dot. The vowels are the same by construction, so
 * nothing is inferred from them.
 *
 * Measured over the corpus vocabulary: of 54 distinct damaged words,
 * **23 have exactly one such twin** (52 occurrences), **0 have more
 * than one**, and 31 have none (50 occurrences). Zero ambiguity is what
 * makes the table a lookup rather than a choice.
 *
 * THE CATALOGUE'S OWN WITNESS CLAIM DOES NOT REPRODUCE, and it is
 * weaker than this one. It reads "28 of the 89 sit inside anchor
 * displays with a Jastrow data-ref, and 28 OF 28 TARGETS CARRY THE
 * POINT THE DISPLAY LOST". Re-measured: **22** sit inside anchor
 * displays and **15** have a dotted target. That test is stated on
 * SKELETONS, so it admits a target whose VOWELS differ —
 * `שָלַב` reaching `שְׁלַב`, a different vocalization
 * and possibly a different lemma. The twin test is byte-exact and does
 * not.
 *
 * ## Why the corruption is invisible to a link check
 *
 * Five members sit in a headword, each the corpus's only spelling of
 * that lemma, and the neighbouring entry's `refs[]` repeats the same
 * dotless string. The reference resolves only because both sides are
 * equally wrong. **26 of the 52 repairs sit inside a `data-ref` or
 * `href`**, so this rule declares each repaired target through
 * `TransformResult.pointed` — case 9, spec
 * `docs/specs/2026-09-01-link-target-gate-case-9.md`.
 *
 * Not `initial-niqqud-drop`, which is a LOST VOWEL and a complementary
 * shape: the two overlap in 1 of 89.
 */
import type { SourceEntry } from '../../body/types.ts';
import { mapFields } from '../fields.ts';
import { tokenize } from '../html.ts';
import { anchors } from '../links.ts';
import { fieldsOf } from '../no-new-text.ts';
import type { Rule, TransformResult } from '../types.ts';

/** The shin dot and the sin dot — the only marks this rule writes. */
const DOT = /[\u05C1\u05C2]/gu;
/** A Hebrew letter or point, for the word boundary the table keys are
 * matched at. A key inside a longer word is a different word. */
const HEBREW = '(?:[\\u05D0-\\u05EA]|\\p{Mn})';

/**
 * Every damaged word the corpus attests a UNIQUE dotted twin for, and
 * that twin. Frozen here because a rule cannot see the corpus;
 * `shin-sin.corpus.test.ts` re-derives the whole table from the live
 * snapshot and fails if it drifts.
 *
 * 23 rows, 52 occurrences, and no key has a second candidate. Do not
 * add a row by hand: a key with two candidates is a row this rule may
 * not take, and the corpus test is what proves there are none.
 */
const TWINS: ReadonlyMap<string, string> = new Map([
	['אַשְוָתָא', 'אַשְׁוָתָא'],
	['אוּשְפַּרְתִּי', 'אוּשְׁפַּרְתִּי'],
	['גֵּרוּשִין', 'גֵּרוּשִׁין'],
	['חָשֵיךְ', 'חָשֵׂיךְ'],
	['יְרוּשַלְמִי', 'יְרוּשַׁלְמִי'],
	['יְשֵי', 'יְשֵׁי'],
	['כְּחוּשָה', 'כְּחוּשָׁה'],
	['כְּרוֹשְיָיתָא', 'כְּרוֹשְׁיָיתָא'],
	['מְשַךְ', 'מְשַׁךְ'],
	['מְשָאכָה', 'מְשָׁאכָה'],
	['מַחֲרֶשֶת', 'מַחֲרֶשֶׁת'],
	['מָשַךְ', 'מָשַׁךְ'],
	['נָשַךְ', 'נָשַׁךְ'],
	['פָּשַר', 'פָּשַׁר'],
	['קְשֵי', 'קְשֵׁי'],
	['שְחָקִים', 'שְׁחָקִים'],
	['שְכֵב', 'שְׁכֵב'],
	['שְנוּ', 'שְׁנוּ'],
	['שִבְיָה', 'שִׁבְיָה'],
	['שִלְטוֹנִין', 'שִׁלְטוֹנִין'],
	['שֵיץ', 'שֵׁיץ'],
	['שָכֵן', 'שָׁכֵן'],
	['תֵּעָשֶה', 'תֵּעָשֶׂה'],
]);

/** The table keys, longest first, so a key that is a prefix of another
 * never wins the alternation. */
const KEYS = [...TWINS.keys()].sort((a, b) => b.length - a.length);
const DAMAGED = new RegExp(
	`(?<!${HEBREW})(${KEYS.join('|')})(?!${HEBREW})`,
	'gu',
);

/** `text` with every attested twin restored, or `null` when it holds
 * no table key at a word boundary. */
function restoreShinSin(text: string): string | null {
	const out = text.replace(DAMAGED, (whole) => TWINS.get(whole) ?? whole);
	return out === text ? null : out;
}

/** The dots `target` carries beyond `from`, in `target`'s own order —
 * what a case-9 claim declares as `adds`. */
function dotsAdded(from: string, target: string): string {
	const had = (from.match(DOT) ?? []).length;
	const now = target.match(DOT) ?? [];
	return now.slice(had).join('');
}

/** Every `href` and `data-ref` the entry's input holds, deduplicated. */
function targetsOf(entry: SourceEntry): Set<string> {
	const found = new Set<string>();
	for (const field of fieldsOf(entry)) {
		for (const anchor of anchors(tokenize(field))) {
			found.add(anchor.dataRef);
			found.add(anchor.href);
		}
	}
	found.delete('');
	return found;
}

/** One case-9 claim per repaired input target, sorted so two runs
 * declare the same list in the same order. */
function claimsFor(
	entry: SourceEntry,
): { adds: string; from: string; target: string }[] {
	const claims: { adds: string; from: string; target: string }[] = [];
	for (const from of [...targetsOf(entry)].sort()) {
		const target = restoreShinSin(from);
		if (target !== null) {
			claims.push({ adds: dotsAdded(from, target), from, target });
		}
	}
	return claims;
}

/**
 * Restores the shin or sin dot the corpus attests for this exact word.
 *
 * `allows` NAMES THE TWO DOTS, and the justification is the twin table
 * rather than a ratio: every dot this rule writes stands in a spelling
 * the corpus already holds, byte for byte. The dots identify a LETTER
 * rather than supply a vowel, which is why the case-9 gate admits them
 * and no other mark.
 */
const shinSinDotRestore: Rule = {
	allows: ['\u05C1', '\u05C2'],
	apply(entry: SourceEntry): TransformResult {
		const healed = mapFields(entry, (text) => restoreShinSin(text) ?? text);
		return healed === undefined
			? { entry, records: [] }
			: {
					entry: healed,
					pointed: claimsFor(entry),
					records: [
						{
							detail: 'shin or sin dot restored from an attested twin',
							rid: entry.rid,
							ruleId: 'shin-sin-dot-drop',
						},
					],
				};
	},
	id: 'shin-sin-dot-drop',
	phase: 'text-repairs',
};

export { restoreShinSin, shinSinDotRestore, TWINS };
