/**
 * The headword-field family — Phase 2 batch 5 (spec
 * `docs/specs/2026-08-27-headword-field-integrity-design.md`).
 *
 * **THE FIRST BATCH WHOSE OBJECT IS A FIELD RATHER THAN MARKUP.** Every
 * rule here edits `headword`, `alt_headwords` or `content.morphology`,
 * none of which carries a tag anywhere in this corpus. So `markup.ts`
 * has no delta to compare and `link-target.ts` is never reached:
 * `no-new-text.ts` is the only gate with anything to say about these
 * rules, which is a narrower safety posture than batches 1-4 ran under
 * and is stated here rather than left to be discovered.
 *
 * The rules live in ONE module because they share an OBJECT, not a
 * mechanism. Batch 4 split its rules across four modules because the
 * mechanism determined which gate could see the change; here one gate
 * sees everything, and four modules would be four docstrings repeating
 * one context.
 */
import type { SourceEntry } from '../../body/types.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

// Hoisted per lint/performance/useTopLevelRegex. None carries `g` where
// it is handed to `.test()`; `lastIndex` on a shared literal would
// otherwise make the same input answer differently on alternate calls.
const ANY_PAREN = /[()]/u;
const STRIP_PARENS = /[()]/gu;
const STRIP_WHITESPACE = /\s+/gu;

/**
 * Delete print's grouping delimiters and normalise the whitespace the
 * deletion leaves behind.
 *
 * The collapse is part of the operation and not a tidy-up after it: 7
 * occurrences carry a space adjacent to a delimiter and 12 would hold a
 * doubled space without it, `'(פַּנְיָה ) I'` becoming `'פַּנְיָה  I'`.
 * Deleting whitespace shrinks the text multiset, so neither half of
 * this needs an `allows`.
 */
function strip(item: string): string {
	return item.replace(STRIP_PARENS, '').replace(STRIP_WHITESPACE, ' ').trim();
}

/**
 * The two occurrences whose parentheses are NOT print's grouping
 * delimiters, refused by SHAPE rather than by rid (spec §3.4).
 *
 * - **Interior optional-letter** — one delimiter of each kind, the
 *   close terminal, the open somewhere other than the start:
 *   `'אִיסְפְּלָנִית(א)'`, print's convention for a form attested with and
 *   without the final aleph. Stripping yields the plene reading and
 *   silently discards the other one.
 * - **Stray close** — a close delimiter with no open in the item and
 *   not at its end: `'אֵינָשׁ) אִינְשָׁא'`, the §3.1 tear landing at the
 *   wrong offset, its open living in a different item. Stripping yields
 *   `'אֵינָשׁ אִינְשָׁא'`, a two-word item that is neither a phrase lemma
 *   nor a spelling of anything. Repairing it means re-splitting, which
 *   is a different operation.
 *
 * A rule that quietly widened to cover these would be batch 3b's
 * failure mode — a rule claiming a population nothing gave it. The
 * corpus test asserts that this predicate selects exactly `A01480` and
 * `A01394` and no others.
 */
function refusesStrip(item: string): boolean {
	const trimmed = item.trim();
	const opens = trimmed.split('(').length - 1;
	const closes = trimmed.split(')').length - 1;
	if (opens === 0 && closes === 1) {
		return !trimmed.endsWith(')');
	}
	if (opens !== 1 || closes !== 1 || !trimmed.endsWith(')')) {
		return false;
	}
	return !(trimmed.startsWith('(') || trimmed.startsWith('*('));
}

/**
 * Rewrite `alt_headwords` item by item and collect one record per
 * CHANGED ITEM, so `detail` names the occurrence rather than the entry.
 * `count.ts` measures entries with a non-empty `records`, so the finer
 * granularity costs nothing there and buys a readable migration report.
 *
 * The entry is returned BY IDENTITY when nothing changed. That is the
 * contract `types.ts` states and the reason it matters is not
 * performance: `run.ts` aliases the input and hands both sides to the
 * gates, which compare values, so a rule that mutated in place would
 * make every gate read the already-changed text on both sides and
 * report clean no matter what it did.
 */
function overAltHeadwords(
	entry: SourceEntry,
	ruleId: string,
	rewrite: (item: string) => string,
): { entry: SourceEntry; records: TransformRecord[] } {
	const items = entry.alt_headwords;
	if (items === undefined) {
		return { entry, records: [] };
	}
	const records: TransformRecord[] = [];
	const next = items.map((item) => {
		const written = rewrite(item);
		if (written !== item) {
			records.push({ detail: `${item} → ${written}`, rid: entry.rid, ruleId });
		}
		return written;
	});
	return {
		entry: records.length === 0 ? entry : { ...entry, alt_headwords: next },
		records,
	};
}

/**
 * `parenthesized-alt-headword` — 654 occurrences / 580 entries.
 *
 * **THE CATALOGUE'S DESCRIPTION IS WRONG, AND THE WAY IT IS WRONG IS
 * THIS ROW'S FINDING.** It reads *"alt_headwords item wrapped in the
 * print parentheses, sometimes unclosed"*. The items are not unclosed.
 * Print sets ONE parenthetical group holding several variant forms, and
 * the upstream comma-split cut the group at its internal comma, leaving
 * a delimiter on each fragment:
 *
 * ```
 * A00083  headword אַבְזָקַת   alt_headwords ['(אַבְזָקָא', 'אַבְזָקָה)']
 * ```
 *
 * 69 of the 84 open-only items pair with a later close-only item in the
 * same array — 52 adjacent, 17 spanning one or two intervening items
 * that are inside the parentheses too. Only 28 are genuinely orphaned.
 * All of it is pinned in `headword-census.ts` and asserted in
 * `headword.corpus.test.ts`.
 *
 * **RULING (Brian, 2026-08-27): strip the delimiters, add no new
 * form-object mark.** The parens are print's grouping punctuation
 * around a run of variant readings, not part of any lemma, and
 * `altHeadwords` survives into v2 as form objects whose `text` is a
 * lookup key — one reading `'(אוֹב)'` matches nothing a user will type.
 *
 * Because the ruling is *strip only*, every sub-shape produces the same
 * output under one blanket operation. **The seven-bucket taxonomy is
 * this rule's EVIDENCE that the blanket strip is safe, not a branch in
 * its code**; stating it the other way round would invite three rules
 * where one is correct.
 *
 * Declares nothing on `TransformResult`. It only deletes, so its output
 * is a strict sub-multiset of its input.
 *
 * **FORWARD HAZARD for whoever writes `migrate.ts`:** all 18 starred
 * `alt_headwords` items in the corpus also carry parentheses
 * (`'*(אוּסְיָא)'`), and they are the same 18 the data architecture
 * reports as *"529 Roman, 18 starred"*. After this rule all 18 are bare
 * `*X`, a shape the source has never held. A reconstructed-mark
 * decomposer written to `^\*` works either way; one written to the
 * observed `*(` shape would silently stop marking all 18. Asserted in
 * the corpus test so it is a failing test rather than a lost paragraph.
 */
const parenAltHeadword: Rule = {
	apply: (entry: SourceEntry): TransformResult => {
		const { entry: next, records } = overAltHeadwords(
			entry,
			'parenthesized-alt-headword',
			(item) =>
				ANY_PAREN.test(item) && !refusesStrip(item) ? strip(item) : item,
		);
		return { entry: next, records };
	},
	id: 'parenthesized-alt-headword',
	phase: 'text-repairs',
};

// ---------------------------------------------------------------- rule 2

const GERESH = '׳';
const HEBREW_LETTER = /[א-ת]/u;
const ROMAN_MARK = /^[IVXLC]+$/u;
const SUPERSCRIPT = /[¹²³⁰-₟]/u;
const LEADING_STAR = /^\*/u;
const WHITESPACE_SPLIT = /\s+/u;

/** The headword as a lookup token: the reconstruction mark and the
 * homograph/disambiguator marks removed, leaving the spelling itself.
 * Substituting `*כְּפַר` would file a reconstruction mark into the middle
 * of a phrase, and `מְקוֹשֵׁשׁ II` would carry a homograph numeral into a
 * toponym.
 *
 * **FAIL-CLOSED ON A MARK THIS DOES NOT KNOW HOW TO SEPARATE.**
 * `ROMAN_MARK` is anchored and so only ever drops a whole token, but
 * `SUPERSCRIPT` is a bare character class: a token like `'אב²'` would be
 * dropped ENTIRELY, silently losing its letters into a substitution that
 * still looks plausible. Measured at ZERO in this corpus — no headword
 * token carries a superscript attached to letters — but that is a fact
 * about today's snapshot, and this pipeline re-fetches. So a dropped
 * token that carried a Hebrew letter returns `''` instead, which
 * `expandStub` reads as a refusal.
 *
 * The alternative, stripping the mark out of the token, would invent a
 * spelling decision the source did not make. Declining is the same
 * answer this family gives everywhere else it cannot see the whole
 * picture. */
function headwordToken(headword: string): string {
	const tokens = headword
		.trim()
		.replace(LEADING_STAR, '')
		.split(WHITESPACE_SPLIT);
	const dropped = tokens.filter(
		(t) => ROMAN_MARK.test(t) || SUPERSCRIPT.test(t),
	);
	if (dropped.some((t) => HEBREW_LETTER.test(t))) {
		return '';
	}
	return tokens
		.filter((t) => !(ROMAN_MARK.test(t) || SUPERSCRIPT.test(t)))
		.join(' ')
		.trim();
}

/** Index of the last Hebrew letter in `text`, or −1. Points are not
 * letters, so this finds the consonant the geresh truncates. */
function lastLetterIndex(text: string): number {
	let found = -1;
	for (let i = 0; i < text.length; i++) {
		if (HEBREW_LETTER.test(text.charAt(i))) {
			found = i;
		}
	}
	return found;
}

/** The run of points sitting on `text`'s FIRST Hebrew letter. */
function leadingMarks(text: string): string {
	let i = 1;
	while (i < text.length && !HEBREW_LETTER.test(text.charAt(i))) {
		i++;
	}
	return text.slice(1, i);
}

/**
 * Expand one geresh-stubbed token against the entry's headword, or
 * return `undefined` to refuse.
 *
 * **WHAT THIS INFERS, WHICH IS THE ONLY QUESTION THAT MATTERS HERE.**
 * Brian's ruling of 2026-08-22 killed `abbrev-in-alt-headwords`'s
 * already-written rule because expansion there *"assumes the headword's
 * remaining vowels are the variant's"* — a variant spelling exists
 * BECAUSE it differs, so the transfer is untestable. That ruling names
 * this row as *"probably survives — substitutes a whole headword token,
 * no vowel inference"*, and the distinction is real: these stubs are
 * not variant spellings OF the headword, they are the headword itself
 * standing inside a phrase lemma, so restoring it infers nothing.
 *
 * **BUT THE MEASUREMENT FOUND AN EDGE THE RULING DID NOT ANTICIPATE.**
 * 58 of the 244 stubs carry points on their final letter, and in 6 of
 * those the stub's own pointing DISAGREES with the headword's —
 * `T00566` writes `רְ׳` where the headword reads `רִטִיבְתָּא`, sheva
 * against hiriq. Substituting would override a vowel the source
 * explicitly wrote in this very field with a different one from
 * another field, which is the ruling's own half 2 applied to one
 * letter. **Those six are REFUSED**, fail-closed: where the source's
 * two fields disagree about a vowel, this rule declines rather than
 * picks. The other 52 agree exactly, so nothing is chosen there.
 *
 * Four further refusals by shape, all of them ambiguity rather than
 * damage:
 *
 * - more than one geresh token in the item (`H00247`, `'בַּר׳ ח׳'` —
 *   which token is the headword's?);
 * - a stub whose final letter is not the headword's first (`A02403`,
 *   `'אסת׳'` against `אַסְטְרוֹלוֹגְיָא`, a three-consonant truncation
 *   rather than an initial);
 * - anything following the geresh inside the token;
 * - no Hebrew letter before the geresh at all.
 */
function expandStub(
	item: string,
	headword: string,
): { copied: string; written: string } | undefined {
	const tokens = item.trim().split(WHITESPACE_SPLIT);
	if (tokens.filter((t) => !ROMAN_MARK.test(t)).length < 2) {
		return;
	}
	const stubs = tokens.filter((t) => t.includes(GERESH));
	if (stubs.length !== 1) {
		return;
	}
	const stub = stubs[0] ?? '';
	const cut = stub.indexOf(GERESH);
	if (stub.slice(cut + 1) !== '') {
		return;
	}
	const head = stub.slice(0, cut);
	const at = lastLetterIndex(head);
	const lemma = headwordToken(headword);
	if (at < 0 || head.charAt(at) !== lemma.charAt(0)) {
		return;
	}
	const onStub = head.slice(at + 1);
	if (onStub !== '' && onStub !== leadingMarks(lemma)) {
		return;
	}
	const written = `${head.slice(0, at)}${lemma}`;
	return {
		copied: lemma,
		written: tokens.map((t) => (t === stub ? written : t)).join(' '),
	};
}

/**
 * `phrase-alt-headword-stub` — 244 occurrences / 236 entries.
 *
 * A complete multi-word lemma — usually a toponym or a compound —
 * whose headword token print abbreviated to an initial plus geresh:
 * `בֵּית ז׳` (Beth Zabdin), `נְהַר פּ׳` (Nehar Papa), `כְּפַר א׳`. The row was
 * CARVED OUT of `abbrev-in-alt-headwords` by that row's audit precisely
 * because a transform written to the parent's description *"would file
 * 236 phrases into the alt-spelling index as spellings"* of the
 * headword, which they are not.
 *
 * **THE PREDICATE MUST DELETE ROMAN HOMOGRAPH MARKS BEFORE COUNTING
 * TOKENS.** The naive reading — a geresh and a space — selects 410
 * entries / 419 occurrences, and the 175 extra are single-word stubs
 * carrying a homograph numeral (`'אֲמוּ׳ II'`) that belong to the
 * parent's job 1, for which no deterministic expansion exists. A rule
 * that expanded those would be inventing spellings. Pinned in
 * `headword.corpus.test.ts` in the shape of the mistake.
 *
 * **THE REGISTRY'S FIRST `copied` USER.** This is the only rule in
 * batch 5 that adds text, and `types.ts` names this exact case on
 * `allows`: *"A copy of existing per-entry text (the tail of a headword
 * recovered into an alt-headword, say) cannot be expressed here — the
 * copied bytes differ per entry, not per rule. Declare those through
 * `TransformResult.copied` instead."* One declaration per substitution,
 * credited as a multiset, each verified against the entry's own input
 * before it is allowed.
 *
 * What `expandStub` refuses, and why, is on that function.
 */
const phraseAltHeadwordStub: Rule = {
	apply: (entry: SourceEntry): TransformResult => {
		const copied: string[] = [];
		const { entry: next, records } = overAltHeadwords(
			entry,
			'phrase-alt-headword-stub',
			(item) => {
				if (!item.includes(GERESH)) {
					return item;
				}
				const done = expandStub(item, entry.headword);
				if (done === undefined) {
					return item;
				}
				copied.push(done.copied);
				return done.written;
			},
		);
		return { copied, entry: next, records };
	},
	id: 'phrase-alt-headword-stub',
	phase: 'text-repairs',
};

// ---------------------------------------------------------------- rule 3

/** Fused headwords some other entry's anchor points at by their OLD
 * string. Rewriting them would break a live link, so they are declined.
 * Asserted EXACTLY equal to the measured set in the corpus test — an
 * enumerated exception that is loud on drift, never a quiet skip. */
const LINKED_HEADWORDS: ReadonlySet<string> = new Set([
	'כִּדְ׳ כַּדְבוּבָא',
	'עָ׳ עַדְיָא',
]);

/**
 * `abbrev-fused-headword` — 7 corpus-wide, 4 repaired, 3 refused.
 *
 * Print sets a lemma and its abbreviated second form on one headword
 * line; the abbreviation was hoisted AHEAD of the lemma into `headword`
 * instead of into `alt_headwords`, so the field reads
 * `'מִי׳ מִנְטַר'` and sorts nowhere near where a reader would look. The
 * rule moves the abbreviation to `alt_headwords` and leaves the lemma —
 * and any homograph mark travelling with it, `'רִי׳ רִכְסָא I'` becoming
 * `'רִכְסָא I'` — as the headword.
 *
 * A PURE MOVE inside the entry. `fieldsOf` enumerates `headword` and
 * `alt_headwords` into one multiset, so nothing is invented and nothing
 * lost; the separating space is deleted, which only shrinks the
 * multiset. No `allows`, no `copied`.
 *
 * **THE ROW'S OWN `reason` IS FALSE FOR ONE OF ITS SEVEN, AND THAT ONE
 * IS REFUSED.** It claims *"In all 7, prev_hw/next_hw alphabetize by
 * the SECOND token, proving the abbreviation is prefix debris."*
 * `A02002` is `'*כְּפַר א׳ אָמוּס'`, sitting between `אֱמוּנָה` and
 * `אֲמוֹרָא` — it alphabetizes by `אָמוּס`, its THIRD token. Its shape is
 * not a hoisted abbreviation at all but the toponym *Kfar Ammus* with
 * its INTERIOR token stubbed: `phrase-alt-headword-stub`'s shape
 * appearing in the `headword` field. The predicate below requires the
 * geresh token to come FIRST, which refuses it by shape; the corpus
 * test asserts that shape selects exactly that rid.
 *
 * **TWO MORE ARE REFUSED BECAUSE ANOTHER ENTRY LINKS TO THEM,
 * AND THAT IS THIS RULE'S SHARPEST FINDING.** Rewriting a headword
 * silently invalidates every anchor whose `data-ref` names the OLD
 * string, and two do:
 *
 * ```
 * K00108 anchor  data-ref="Jastrow, כִּדְ׳ כַּדְבוּבָא 1"   → K00107
 * P00132 anchor  data-ref="Jastrow, עָ׳ עַדְיָא 1"       → P00137
 * ```
 *
 * Found by `body/pipeline-links.corpus.test.ts`, whose absolute pin fell from
 * 71,385 to 71,383 while its DIFFERENTIAL assertion — "gains 90, loses
 * none" — stayed green, because the rule sits on both sides of that
 * comparison. The differential could not see it; the absolute pin
 * could, which is exactly why it exists.
 *
 * A dead link is worse for a reader than an awkward headword, so these
 * two are declined. The full repair is a headword rewrite AND a retarget
 * of the pointing anchor, which crosses into `link-target.ts` territory
 * — and gate work is its own PR here, Brian's ruling of 2026-08-26.
 * Carried as an open item.
 *
 * `LINKED_HEADWORDS` is an enumerated exception and therefore MUST BE
 * LOUD ON DRIFT (`rules/unlink.ts`'s `unobservedConvention`, the ruling
 * of 2026-08-23). The corpus test asserts it equals EXACTLY the fused
 * headwords some anchor targets, so a re-fetch that adds or removes a
 * pointing anchor fails a test rather than silently changing what
 * ships.
 *
 * **FORWARD HAZARD, and it compounds one batch 3a already recorded:**
 * the data architecture's §5 gate walks the `prev_hw`/`next_hw` chain
 * and compares against `headword` AS A STRING. Batch 3a left 68
 * entries diverging that way; this rule rewrites 4 more headwords and
 * leaves every neighbour's pointer untouched. Whoever writes
 * `migrate.ts` must walk the SOURCE chain or de-map both sides. The
 * exact divergence count is asserted in `headword.corpus.test.ts`.
 */
const abbrevFusedHeadword: Rule = {
	apply: (entry: SourceEntry): TransformResult => {
		const trimmed = entry.headword.trim();
		if (LINKED_HEADWORDS.has(trimmed)) {
			return { entry, records: [] };
		}
		const star = trimmed.startsWith('*') ? '*' : '';
		const tokens = trimmed.replace(LEADING_STAR, '').split(WHITESPACE_SPLIT);
		const [first, ...rest] = tokens;
		if (
			first === undefined ||
			rest.length === 0 ||
			!first.includes(GERESH) ||
			rest.some((t) => t.includes(GERESH))
		) {
			return { entry, records: [] };
		}
		const headword = `${star}${rest.join(' ')}`;
		return {
			entry: {
				...entry,
				alt_headwords: [...(entry.alt_headwords ?? []), first],
				headword,
			},
			records: [
				{
					detail: `${entry.headword} → ${headword} + alt ${first}`,
					rid: entry.rid,
					ruleId: 'abbrev-fused-headword',
				},
			],
		};
	},
	id: 'abbrev-fused-headword',
	phase: 'text-repairs',
};

// ---------------------------------------------------------------- rule 4

/**
 * `gender-pair-headword-line-collapse` — 22 entries.
 *
 * Print reads `'X, Xָא m., Xְתָּא f.'`. The extractor stored the masculine
 * emphatic TWICE in `alt_headwords` and wrote the trailing feminine
 * label into `content.morphology`, so the entry is a masculine
 * adjective labelled `f.` with the `m.` lost. One operation covers both
 * sub-shapes — 17 adjacent duplicates and 5 `'abbrev, full, abbrev'`
 * repetitions at a distance — because it keys on the value, not the
 * position:
 *
 * ```
 * A00648  ['אוּכָּמָא', 'אוּכָּמָא', 'אוּכַּמְתָּא']  → ['אוּכָּמָא', 'אוּכַּמְתָּא']
 * H00875  ['חֵר׳', 'חֵירוּפִין', 'חֵר׳']        → ['חֵר׳', 'חֵירוּפִין']
 * ```
 *
 * **`content.morphology` IS DELIBERATELY NOT REPAIRED, AND THE REASON
 * IS THE GATE.** 21 of the 22 carry `'f.'`, which is wrong about the
 * headword. Writing `'m.'` is text the entry does not hold: it would
 * need `allows: ['m.']`, every non-empty `allows` is a maintainer
 * ruling in code, and `allows` flattens to CODEPOINTS — that
 * declaration would permit unlimited `m` and `.` anywhere in this
 * rule's diff, for a two-character token. Clearing the field instead
 * would delete a label print actually sets. **Nothing is lost by
 * repairing the array alone:** the feminine form the label describes is
 * already present as a sibling `alt_headwords` item in every member.
 * Carried to a `judgment` row instead (spec §7.3).
 */
const genderPairAltDuplicate: Rule = {
	apply: (entry: SourceEntry): TransformResult => {
		const items = entry.alt_headwords;
		if (items === undefined) {
			return { entry, records: [] };
		}
		const seen = new Set<string>();
		const kept = items.filter((item) => {
			if (seen.has(item)) {
				return false;
			}
			seen.add(item);
			return true;
		});
		if (kept.length === items.length) {
			return { entry, records: [] };
		}
		return {
			entry: { ...entry, alt_headwords: kept },
			records: [
				{
					detail: `${items.join(', ')} → ${kept.join(', ')}`,
					rid: entry.rid,
					ruleId: 'gender-pair-headword-line-collapse',
				},
			],
		};
	},
	id: 'gender-pair-headword-line-collapse',
	phase: 'text-repairs',
};

export {
	abbrevFusedHeadword,
	expandStub,
	genderPairAltDuplicate,
	headwordToken,
	LINKED_HEADWORDS,
	overAltHeadwords,
	parenAltHeadword,
	phraseAltHeadwordStub,
	refusesStrip,
	strip,
};
