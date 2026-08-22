/**
 * The `dir="rtl"` wrapper family — three catalogue rows written as one
 * module because they are the same decision seen from three sides: a
 * run that should be wrapped and is not (`bare-rtl-hebrew`), a wrapper
 * that should not be there (`redundant-outer-rtl-span`), and a wrapper
 * that reaches too far (`latin-token-inside-rtl-span`).
 *
 * The audit is explicit: "Any Phase 2 transform should be written
 * against all three at once, or it will trade one for another"
 * (data/patches/catalogue-audit/bare-rtl-hebrew.md, "Overlap"). The
 * catalogue records that entanglement on all three rows and
 * `checkAdjacency()` enforces that they occupy a gap-free span in
 * `RULES`.
 *
 * None of the three declares an `allows` and none returns `copied`.
 * They move wrappers; the text bytes are untouched, so all three are a
 * strict sub-multiset of their input under the no-new-text gate. A gate
 * trip here is a bug in the rule, never a reason for an allowance.
 */
import type { SourceEntry, SourceSense } from '../../body/types.ts';
import type { Token } from '../html.ts';
import {
	HEBREW,
	hebrewRuns,
	opensScope,
	serialize,
	tokenize,
} from '../html.ts';
import type { Rule, TransformRecord, TransformResult } from '../types.ts';

// Hoisted per lint/performance/useTopLevelRegex.

/** A Latin homograph numeral swallowed by the rtl span that should
 * have held only the Hebrew. The lookbehind pins the numeral to a
 * Hebrew base so a wholly-Latin span is never touched. */
const ROMAN_TAIL = new RegExp(`(?<=[${HEBREW}])\\s+(?<roman>[IVX]+)\\s*$`, 'u');

/** The sub-lemma marker immediately before a Hebrew run: U+2014, the
 * corpus's only em-dash (27,712 occurrences against 18 of U+2013, none
 * of which heads a sub-lemma). */
const EM_DASH_BEFORE = /—\s*$/u;

/** Nothing but whitespace — used on both sides of a run to test that
 * the em-dash, the definition start, or the italic gloss sits directly
 * against the Hebrew rather than somewhere else in the same node. */
const ONLY_SPACE = /^\s*$/u;

/** `dir="rtl"` on a tag's own attributes. Quotes optional and either
 * flavour, matching `html.ts`'s own `DIR_RTL`. */
const DIR_RTL = /\bdir\s*=\s*(?<q>["']?)rtl\k<q>/u;

/**
 * Rewrite every definition in the entry, recursing through nested
 * senses, and collect one record per changed definition. The shared
 * shape of all three rules: they differ only in `rewrite`.
 *
 * The entry is returned by identity when nothing changed, so a
 * no-op rule costs no allocation and `records.length` is the honest
 * "did this fire" signal `count.ts` measures.
 */
function overDefinitions(
	entry: SourceEntry,
	ruleId: string,
	rewrite: (definition: string) => string,
): { entry: SourceEntry; records: TransformRecord[] } {
	const records: TransformRecord[] = [];
	const walk = (senses: readonly SourceSense[]): SourceSense[] =>
		senses.map((sense) => {
			const next =
				sense.definition === undefined ? undefined : rewrite(sense.definition);
			if (next !== undefined && next !== sense.definition) {
				records.push({ detail: next, rid: entry.rid, ruleId });
			}
			return {
				...sense,
				...(next === undefined ? {} : { definition: next }),
				...(sense.senses === undefined ? {} : { senses: walk(sense.senses) }),
			};
		});
	const rewritten = walk(entry.content.senses);
	return {
		entry:
			records.length === 0
				? entry
				: { ...entry, content: { ...entry.content, senses: rewritten } },
		records,
	};
}

/**
 * `overDefinitions` plus the entry-level `language_reference` — the
 * etymology field, which carries the same `<span dir="rtl">` markup as
 * a definition does.
 *
 * Only `latin-token-inside-rtl-span` uses this, and the wider scope is
 * measured rather than assumed. Its catalogued 130 is exactly 122
 * definition entries plus 8 disjoint `language_reference` entries, all
 * 8 the same `<span dir="rtl">חוּד II</span>` cross-reference shape;
 * scoping the rule to definitions alone measured 122 and left those 8
 * blocking instances unfixed.
 *
 * The two sibling rules keep the narrower scope, also on measurement:
 * `redundant-outer-rtl-span` matches 0 `language_reference` values, so
 * the scope is moot for it, and `bare-rtl-hebrew` matches 14 — a real
 * population, but one its audit deliberately excluded (its probe reads
 * `content.senses[].definition` only, and its 4,190 reproduces exactly
 * under that scope). Widening it would break an audited derivation to
 * chase an uncatalogued 14. Recorded for a future row instead.
 */
function overEtymologyToo(
	entry: SourceEntry,
	ruleId: string,
	rewrite: (definition: string) => string,
): { entry: SourceEntry; records: TransformRecord[] } {
	const base = overDefinitions(entry, ruleId, rewrite);
	const before = entry.language_reference;
	const after = before === undefined ? undefined : rewrite(before);
	if (after === undefined || after === before) {
		return base;
	}
	return {
		entry: { ...base.entry, language_reference: after },
		records: [...base.records, { detail: after, rid: entry.rid, ruleId }],
	};
}

/** One Hebrew run in its immediate surroundings: the text node holding
 * it, the offsets that bound it, and where that node sits in the
 * stream. The unit the audit classifies slots by. */
interface RunContext {
	/** Index of the text token in `tokens`. */
	at: number;
	end: number;
	start: number;
	tokens: readonly Token[];
	value: string;
}

/**
 * The sub-lemma header — Jastrow's way of introducing a sub-entry (an
 * idiom, a construct phrase, a prefixed form) as
 * `—<Hebrew phrase> <i>gloss</i>`, or the same construct with no
 * em-dash at the head of a nested sense.
 *
 * The corpus writes it bare in 473 of 473 em-dash instances — 0
 * wrapped — and none of the 606 distinct header strings appears
 * wrapped anywhere else in the corpus. It is a construct with its own
 * rule, not an omission: a transform written to the row's old
 * description would treat these 545 senses as identical omissions and
 * insert a wrapper the source uses NOWHERE in that position (audit,
 * "Does this population have more than one job?").
 *
 * The definition-initial arm is the same construct at the head of a
 * nested sense: 165 of its 172 bare instances are followed immediately
 * by an `<i>` gloss, against 28 of the 195 wrapped ones.
 *
 * The test is on the RUN's own surroundings, not the text node's,
 * because a sub-lemma header almost never starts its node — the header
 * follows the end of the previous sense inside a single text token
 * (`…a. e.—א׳ הַשָּׁעוֹת <i>…`). Testing `value.startsWith('—')` instead
 * matched 8 runs corpus-wide where this matches 627; testing the
 * node's start instead of the run's over-excluded 630 entries.
 */
function isSubLemmaHeader(run: RunContext): boolean {
	const before = run.value.slice(0, run.start);
	const head =
		EM_DASH_BEFORE.test(before) || (run.at === 0 && ONLY_SPACE.test(before));
	if (!head) {
		return false;
	}
	// The gloss must follow the Hebrew directly: anything but space
	// between the run and the `<i>` is some other construct that merely
	// happens to precede an italic.
	const next = run.tokens[run.at + 1];
	return (
		ONLY_SPACE.test(run.value.slice(run.end)) &&
		next?.kind === 'tag' &&
		next.name === 'i' &&
		!next.close
	);
}

/**
 * Whether this text token is not document text at all, but the tail of
 * the PREVIOUS tag's own attributes.
 *
 * When an unterminated `href` swallows a closing tag —
 * `<a … href="/Jastrow,_כָּלוּל.1</a>" data-ref="Jastrow, כָּלוּל 1">` — the
 * swallowed `</a>` supplies the `>` that ends the tag token, and
 * everything after it up to the real `>` tokenizes as text. Wrapping
 * the Hebrew in there writes a `<span>` INSIDE a `data-ref` attribute
 * value, corrupting a machine identifier and leaving a span embedded
 * in the very attribute the still-pending row
 * `unterminated-href-swallows-closing-tag` has to reconstruct.
 *
 * The predicate is `html.ts`'s own `opensScope`, imported rather than
 * restated so the tokenizer stays the single authority on what counts
 * as a malformed open tag — the same judgement that keeps such a tag
 * off the ancestry stack. Corpus-wide this skips exactly one node in
 * one entry (D00478; J00597 carries the same malformed tag but no bare
 * Hebrew after it). `opensScope` is also false for a self-closing tag,
 * whose following text IS ordinary document text — no self-closing tag
 * occurs anywhere in the corpus (measured: 0), so the two readings
 * cannot diverge here.
 */
function isAttributeTail(tokens: readonly Token[], at: number): boolean {
	const previous = tokens[at - 1];
	return (
		previous?.kind === 'tag' && !previous.close && !opensScope(previous.value)
	);
}

/** Wrap each Hebrew RUN inside one text node, leaving everything
 * around it — and every run the slot test excludes — untouched. 4,691
 * of the 5,679 bare nodes mix Hebrew and Latin, so wrapping the node
 * whole would drag English words, Roman numerals and parentheses into
 * an RTL context (audit, "Could not determine"). `hebrewRuns` never
 * starts or ends a run on whitespace, so slicing by its offsets cannot
 * strand a space inside the wrapper. */
function wrapRuns(tokens: readonly Token[], at: number, value: string): string {
	let wrapped = '';
	let cursor = 0;
	for (const { end, start } of hebrewRuns(value)) {
		if (isSubLemmaHeader({ at, end, start, tokens, value })) {
			continue;
		}
		wrapped += value.slice(cursor, start);
		wrapped += `<span dir="rtl">${value.slice(start, end)}</span>`;
		cursor = end;
	}
	return cursor === 0 ? value : wrapped + value.slice(cursor);
}

/**
 * Wrap bare Hebrew runs in the slots where the corpus demonstrably
 * wraps and this instance does not — quotation after a citation anchor
 * (9.0% bare), etymology/variant parenthetical (20.3%), after an
 * italic gloss (10.0%), em-dash header without a gloss (2.2%) —
 * leaving the sub-lemma-header construct alone.
 *
 * The slot test is by exclusion rather than enumeration, and that is
 * deliberate: the audit's own slot table classifies 5,668 of the 6,248
 * bare runs, and its disposition is the complement — 6,248 runs minus
 * the 625-run sub-lemma population is exactly the 5,623 it calls the
 * defensible defect subset. Enumerating the four defect slots would
 * silently drop the 580 unclassified runs the audit deliberately keeps.
 */
const bareRtlHebrew: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		overDefinitions(entry, 'bare-rtl-hebrew', (definition) => {
			const tokens = tokenize(definition);
			return serialize(
				tokens.map((token, at) =>
					token.kind !== 'text' || token.rtl || isAttributeTail(tokens, at)
						? token
						: { ...token, value: wrapRuns(tokens, at, token.value) },
				),
			);
		}),
	id: 'bare-rtl-hebrew',
	phase: 'text-repairs',
};

/** Index of the close tag that pops each opening tag, by opening-tag
 * index. Mirrors `tokenize`'s tolerance exactly: a close pops the TOP
 * of the stack whatever element it names, and a tag that opens no
 * scope (self-closing, or visibly malformed) is never pushed. An
 * opening tag that is never closed simply has no entry. */
function closers(tokens: readonly Token[]): Map<number, number> {
	const found = new Map<number, number>();
	const stack: number[] = [];
	for (const [at, token] of tokens.entries()) {
		if (token.kind !== 'tag') {
			continue;
		}
		if (token.close) {
			const open = stack.pop();
			if (open !== undefined) {
				found.set(open, at);
			}
		} else if (
			!(token.value.endsWith('/>') || token.value.slice(1).includes('<'))
		) {
			stack.push(at);
		}
	}
	return found;
}

/**
 * Drop an outer `<span dir="rtl">` whose content already carries an
 * inner `dir="rtl"` element. The outer wrapper does nothing the inner
 * one is not already doing, and it defeats run-level bidi isolation by
 * pulling the Latin text between the inner runs into an RTL context.
 *
 * Only a span with no rtl ancestor is considered — a nested rtl span
 * inside another is the same defect seen from the inner side, and
 * dropping both ends of an inner one would leave the outer wrapper
 * spanning text it never covered. An unclosed span is left alone:
 * there is no close tag to remove with it.
 */
const redundantOuterRtl: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		overDefinitions(entry, 'redundant-outer-rtl-span', (definition) => {
			const tokens = tokenize(definition);
			const closeOf = closers(tokens);
			const drop = new Set<number>();
			for (const [at, token] of tokens.entries()) {
				const closesAt = closeOf.get(at);
				if (
					token.kind !== 'tag' ||
					token.close ||
					token.rtl ||
					token.name !== 'span' ||
					closesAt === undefined ||
					!DIR_RTL.test(token.value)
				) {
					continue;
				}
				const inner = tokens
					.slice(at + 1, closesAt)
					.some((t) => t.kind === 'tag' && !t.close && DIR_RTL.test(t.value));
				if (inner) {
					drop.add(at);
					drop.add(closesAt);
				}
			}
			return serialize(tokens.filter((_, at) => !drop.has(at)));
		}),
	id: 'redundant-outer-rtl-span',
	phase: 'text-repairs',
};

/** A trailing Roman numeral the rtl span swallowed, as the offset at
 * which the text token should be cut and the numeral itself. Matches
 * only a text token that is inside rtl and whose very next token
 * closes a tag — i.e. the numeral is the last thing in the span. */
function swallowedRoman(
	token: Token,
	closer: Token | undefined,
): { cut: number; roman: string } | undefined {
	if (token.kind !== 'text' || !token.rtl) {
		return;
	}
	if (closer?.kind !== 'tag' || !closer.close) {
		return;
	}
	const match = ROMAN_TAIL.exec(token.value);
	return match === null
		? undefined
		: { cut: match.index, roman: match.groups?.['roman'] ?? '' };
}

/**
 * Move a trailing Latin token — always a Roman homograph numeral, the
 * `II` of `גָּדַד II` — out of the rtl span that swallowed it. Inside the
 * span, bidi orders the numeral against the Hebrew and it lands on the
 * wrong side of the word it disambiguates.
 *
 * The numeral is re-emitted after the closing tag with a single
 * separating space, so any whitespace the span held after the numeral
 * is dropped. That is a strict sub-multiset and passes the gate.
 */
const latinTokenInsideRtl: Rule = {
	apply: (entry: SourceEntry): TransformResult =>
		overEtymologyToo(entry, 'latin-token-inside-rtl-span', (definition) => {
			const tokens = tokenize(definition);
			const parts: string[] = [];
			const consumed = new Set<number>();
			for (const [at, token] of tokens.entries()) {
				if (consumed.has(at)) {
					continue;
				}
				const closer = tokens[at + 1];
				const found = swallowedRoman(token, closer);
				if (found === undefined) {
					parts.push(token.value);
					continue;
				}
				// Text without its tail, then the closing tag, then the
				// numeral — the order that puts it outside the span.
				consumed.add(at + 1);
				parts.push(
					token.value.slice(0, found.cut),
					closer?.value ?? '',
					` ${found.roman}`,
				);
			}
			return parts.join('');
		}),
	id: 'latin-token-inside-rtl-span',
	phase: 'text-repairs',
};

export { bareRtlHebrew, latinTokenInsideRtl, redundantOuterRtl };
