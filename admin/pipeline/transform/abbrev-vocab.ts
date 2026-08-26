/**
 * The abbreviation vocabulary, DERIVED from the pinned snapshot and
 * frozen here (batch-3b spec §4.2, ruling R1).
 *
 * `label-period-outside-italic` and `italic-swallowed-terminal-period`
 * are one predicate with two polarities: an italic run whose body is a
 * LABEL takes its terminal period inside, an ordinary word-final gloss
 * takes it outside. The discriminator the round-4 audit established is
 * corpus-wide — "the token occurs mid-run inside an <i> elsewhere in
 * the corpus" — and `Rule.apply` sees one entry.
 *
 * Rather than widen the rule interface (rejected in batch 2 as bigger
 * than the rows are worth), the fact is computed once and pinned. The
 * pinning is falsifiable: `abbrev-vocab.test.ts` re-derives from the
 * snapshot and requires an exact match, so the list cannot silently
 * drift away from the corpus it claims to describe.
 *
 * ON A SOURCE RE-FETCH that test SKIPS rather than fails — the frozen
 * list describes a corpus no longer on disk, which is a stale baseline
 * and not a defect, the same position `count.ts` takes. Re-baseline
 * deliberately: run `deriveAbbreviations` over the new snapshot and
 * commit the new list.
 *
 * WHAT THE EVIDENCE IS. A period proves an abbreviation when the text
 * CONTINUES past it in a way a sentence-ending period cannot be
 * followed by: a lowercase letter, or `,` `;` `)`. That continuation
 * may sit inside the same italic run (mid-run — the audit's own test),
 * or immediately after the run's closing tag in the same field.
 *
 * WIDENING 1 (narrowing, in effect): the audit's discriminator written
 * literally is `([^\s.]+)\.\s` inside the run. That also matches a
 * RUN-FINAL period whenever the body carries a trailing space
 * (`<i>stone. </i>`), and matches a genuine sentence period mid-run
 * (`<i>… to think, imagine. Part. pass</i>`). Measured on the pinned
 * snapshot it yielded 58 members of which 14 were ordinary gloss words
 * — stone, vessel, feeble, husks, chosen, dromedary, girdle, imagine,
 * inferior, messenger, treasures, unfinished, dispossession, foam —
 * i.e. the predicate would have kept the period inside for a quarter
 * of what it recognised. Requiring the continuation above removes all
 * 14 and costs nothing the audit named.
 *
 * WIDENING 2: 11 of the 20 labels the round-4 audit names — Ithpa,
 * Ithpe, Part. pass, Fem, Pe, Hithpa, Du, sing, m, ḳ, Saf — never
 * occur mid-run at all; the corpus only ever writes them run-final
 * (`<i>—Ithpe.</i> of …`). Their proof therefore has to come from the
 * text AFTER the run, under the same continuation test. Mid-run
 * evidence names a token; run-final evidence names the whole body
 * minus its period, which is also what carries the multi-word labels
 * (`Part. pass`, `ts. k`) — `Part. pass` cannot have mid-run evidence
 * at all, since a `MID_RUN` token is space-free by construction.
 *
 * The other 9 of the 20 DO occur mid-run — Hif 4, Pl 9, Pi 2, Nif 1,
 * Pa 3, Af 2, pl 8, Nithpa 1, Part 346, counted 2026-08-26 through
 * `fieldsOf` on the pinned snapshot — the scope `deriveAbbreviations`
 * itself reads, and the scope every figure in this docstring is in.
 * Two of them rest on a single occurrence (`Nif` on `<i>Nif., to
 * collect, call to account; …</i>`), so this 9/11 split is a
 * measurement, not a property of the label set: re-derive it with
 * `MID_RUN` after any re-fetch rather than trusting this sentence.
 *
 * WIDENINGS REJECTED, both measured rather than argued:
 * - Accepting any token before a run-final period unconditionally (the
 *   obvious reading of "widen to a closing tag") gives 1,443 members
 *   and admits `locusts`. The predicate, stated so the number is
 *   re-runnable: drop the `CONTINUES` test, and for every run whose
 *   trimmed body ends in `.` add the LAST space-free token of that
 *   body minus the period, unioned with the mid-run evidence.
 *   (Measured 2026-08-26 on the pinned snapshot. The 1,444 first
 *   recorded here named no predicate and no reading of it reproduces:
 *   the same widening taking the WHOLE body rather than its last
 *   token gives 1,745 and does not admit `locusts` at all.) It is not
 *   a widening but the removal of the discriminator: nearly every
 *   italic gloss ends in a period, so nearly every gloss would become
 *   a label.
 * - Accepting a Hebrew-script continuation after the run (`<i>Du.</i>
 *   <span dir="rtl">…`) reaches 122 members but admits gloss bodies —
 *   `reed, bulrush`, `brightness, v`, `firm, irrefutable` — because a
 *   Hebrew citation follows a finished gloss sentence just as readily
 *   as it follows a label. Hebrew has no case, so there is no
 *   continuation signal there to test.
 *
 * Re-derive with:
 *   bun -e 'import {readSourceEntries} from
 *   "./admin/pipeline/body/source.ts"; import {deriveAbbreviations}
 *   from "./admin/pipeline/transform/abbrev-vocab.ts"; const es = [];
 *   for await (const e of readSourceEntries()) es.push(e);
 *   console.log(JSON.stringify([...deriveAbbreviations(es)].sort()))'
 */
import type { SourceEntry } from '../body/types.ts';
import { fieldsOf } from './no-new-text.ts';

/** Derived from the pinned snapshot (93 members); see module doc. */
const FROZEN: readonly string[] = [
	'&c',
	'Af',
	'C',
	'Chald',
	'Du',
	'Fem',
	'H',
	'Hebr',
	'Hif',
	'Hithpa',
	'Hof',
	'Ithpa',
	'Ithpe',
	'Ithpol',
	'Ittaf',
	'Ittof',
	'Lam. R',
	'Land of Ḥ',
	'M',
	'Mar Z',
	'Masc',
	'Men',
	'Nif',
	'Nithpa',
	'Pa',
	'Palp',
	'Par',
	'Part',
	'Part. Af',
	'Part. pass',
	'Pass',
	'Pe',
	'Peruz And',
	'Pi',
	'Pilp',
	'Pl',
	'Pol',
	'Pu',
	'R. Z',
	'Saf',
	'Shabur And',
	'Shaf',
	'T',
	'Taf',
	'Tower of Ḥ',
	'Ts',
	'Z',
	'a',
	'adj',
	'any organ of the body resembling teeth, gland.—Du',
	'asaf',
	'asm',
	'constr',
	'detached part.—Pl',
	'esp',
	'f',
	'f.pl',
	'fem',
	'gen',
	'gl',
	'hadr',
	'hard',
	'his &c',
	'i',
	'k',
	'm',
	'masc',
	'n',
	'p',
	'part',
	'pass',
	'pl',
	'r',
	's',
	'sh',
	'sing',
	't',
	'the Cave Region of Y',
	'the Great S',
	'the Small S',
	'trnsf',
	'ts',
	'ts. k',
	'y',
	'ʿa',
	'Ḥ',
	'ḥ',
	'ḥăl',
	'ḳ',
	'—Part',
	'—Pl',
	'—Pt',
	'‘U',
];

/** Two guards, neither of them absolute, and the distinction matters:
 * `ReadonlySet` forbids `add`/`delete` at COMPILE TIME only — it is a
 * type, erased before anything runs — and `Object.freeze` cannot make
 * up the difference, because a `Set`'s contents live in internal slots
 * the freeze does not reach. What the freeze does buy is a block on
 * property tacking at runtime. The residual is therefore real but
 * narrow: a caller that casts the type away could still mutate the
 * contents. Nothing in the tree does, and `abbrev-vocab.test.ts`'s
 * re-derivation check — the whole set rebuilt from the corpus and
 * compared member for member — is the guard that would catch it.
 *
 * The set stays EXPORTED rather than hidden behind membership
 * functions because it is read as a collection, not just queried:
 * `seam-space.ts` calls `.has` on a period-stripped token, and the
 * re-derivation test reads `.size` and iterates it. */
const ABBREVIATIONS: ReadonlySet<string> = Object.freeze(new Set(FROZEN));

/** One italic run's body, as the corpus writes it. */
const RUN = /<i>(?<body>[^<>]*)<\/i>/gu;
/**
 * A token inside a run whose period is followed by a continuation no
 * sentence-ending period can take — the proof the corpus treats it as
 * an abbreviation (module doc, WHAT THE EVIDENCE IS).
 *
 * The leading `(?<![^\s.])` is not a predicate change. It pins the
 * token to the START of its own non-space non-period run, and it is
 * here on `typescript:S8786` (SonarCloud, PR #49).
 *
 * The tempting reading of that finding is that it is a false positive:
 * `[^\s.]+` excludes `.`, so the token can never eat the period the
 * pattern goes on to require, and the match itself is therefore
 * unambiguous. That is true and it is not the point. The give-backs
 * are FUTILE, not absent — the engine still performs one per consumed
 * character before failing, and `matchAll` then restarts the whole
 * futile scan one character further into the same run. Measured on
 * JavaScriptCore over `'a'.repeat(n)` for n = 4k/8k/16k/32k:
 * **11.9 / 45.6 / 185.1 / 732.5 ms** without the lookbehind — a clean
 * quadrupling per doubling — against **0.11 / 0.16 / 0.34 / 0.63 ms**
 * with it. Sonar is right; the exclusion buys correctness, not time.
 *
 * The lookbehind is what makes it linear: a start offset inside a run
 * is rejected in one step instead of rescanning the run, so the total
 * work is the sum of the run lengths rather than of their squares.
 *
 * INERT, by construction and by measurement. A start offset the old
 * pattern could match from is always one this one can too: `matchAll`
 * reaches an offset either at 0, or after a match (which ends past a
 * `.` or the whitespace following it), or by stepping one character on
 * from a FAILED offset — and a failure inside a run implies failure at
 * every later offset in that run, since both see the same period and
 * the same continuation. Checked exhaustively against the old pattern
 * over all 960,800 strings of length <= 7 in the alphabet
 * `a A . ␣ , ; )` — every class boundary the pattern can see —
 * comparing offset, whole match AND captured token: 0 disagreements.
 * `abbrev-vocab.test.ts` re-derives the vocabulary from the corpus and
 * requires it to equal `FROZEN` member for member; it does, at 93.
 */
const MID_RUN = /(?<![^\s.])(?<token>[^\s.]+)\.\s*(?=[,;)]|\p{Ll})/gu;
/** The same continuation test applied to the field text following a
 * run's closing tag (module doc, WIDENING 2). Deliberately un-`g`:
 * `test` on a global regex carries `lastIndex` between calls. */
const CONTINUES = /^\s*(?:[,;)]|\p{Ll})/u;

/** A run body's text minus its terminal period, or `''` when the body
 * does not end in one. */
function runFinalStem(body: string): string {
	const trimmed = body.trim();
	return trimmed.endsWith('.') ? trimmed.slice(0, -1).trim() : '';
}

/** Add every abbreviation one field's italic runs prove, in both
 * evidence positions. */
function collectFromField(field: string, found: Set<string>): void {
	for (const run of field.matchAll(RUN)) {
		const body = run.groups?.['body'] ?? '';
		for (const token of body.matchAll(MID_RUN)) {
			found.add(token.groups?.['token'] ?? '');
		}
		const after = field.slice((run.index ?? 0) + run[0].length);
		if (CONTINUES.test(after)) {
			found.add(runFinalStem(body));
		}
	}
}

/** Re-derive the vocabulary from a corpus. Exported so the test can
 * falsify `FROZEN` rather than trust it. */
function deriveAbbreviations(
	entries: readonly SourceEntry[],
): ReadonlySet<string> {
	const found = new Set<string>();
	for (const entry of entries) {
		for (const field of fieldsOf(entry)) {
			collectFromField(field, found);
		}
	}
	found.delete('');
	return found;
}

/** True when this italic run's body is a grammatical or abbreviation
 * label, and therefore takes its terminal period INSIDE the italic. */
function isLabel(body: string): boolean {
	return ABBREVIATIONS.has(body.trim());
}

export { ABBREVIATIONS, deriveAbbreviations, isLabel };
