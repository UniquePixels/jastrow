/**
 * Markup translation (migrate spec §2.2): the source's six tags into
 * the truth vocabulary, over `transform/html.ts` tokens so text bytes
 * are never touched. Anchors become `<cite ref>`; what `ref` holds is
 * the resolver's decision (`cite.ts`), not this module's.
 */
import {
	DIR_RTL,
	type TagToken,
	type Token,
	tokenize,
} from '../transform/html.ts';

type RefResolver = (anchor: { dataRef: string; href: string }) => string;

interface Translated {
	/** Entries closed at the end of this call because the stack was
	 * still open when the tokens ran out. Zero unless `carry` was
	 * passed and something was actually carried. */
	carried: number;
	problems: string[];
	text: string;
}

interface Open {
	he: boolean;
	name: string;
	/** The exact string the open branch emitted for this entry: `<he>`,
	 * `<cite ref="…">` or `<cite ref="…"><he>`, or the raw tag text for
	 * a keep/raw/malformed open. Replayed verbatim when a carry reopens
	 * this entry at the start of the next field. */
	openText: string;
	/** Whether the open branch actually emitted a translated tag (`<he>`
	 * for an rtl span, `<cite …>` for an anchor with a parsed href). A
	 * `false` here means the open was passed through raw — a bare span,
	 * a malformed anchor, a keep-tag, or an unknown tag — so the close
	 * must also pass through raw rather than assume a translated pair. */
	translated: boolean;
}

/** What one field carries into the next when a tag run spans a body
 * unit boundary (e.g. an `<i>` opened in a gloss and closed in the
 * unit that follows it). The caller owns one `TagCarry` per flow —
 * gloss + units of one sense sequence — and shares it call to call. */
interface TagCarry {
	open: Open[];
}

/** The close text for an entry with no matching close token — used
 * only to force-close whatever is left open at the end of a call when
 * a carry is in play. Mirrors the live close-token branch below, but
 * synthesizes the raw close (`</name>`) instead of replaying a token's
 * own text, since there is no token here to replay. */
function closeFor(o: Open): string {
	if (!o.translated) {
		return `</${o.name}>`;
	}
	if (o.name === 'span') {
		return '</he>';
	}
	return o.he ? '</he></cite>' : '</cite>';
}

const KEEP = new Set(['b', 'i', 'sub', 'sup']);
const HREF = /\bhref\s*=\s*"(?<v>[^"]*)"/u;
const DATA_REF = /\bdata-ref\s*=\s*"(?<v>[^"]*)"/u;

/** Whether the anchor opening at `at` holds exactly one rtl span and
 * nothing else — in which case the span supplies the `<he>` layer. */
function wrappedInRtlSpan(tokens: readonly Token[], at: number): boolean {
	const first = tokens[at + 1];
	if (
		first?.kind !== 'tag' ||
		first.close ||
		first.name !== 'span' ||
		!DIR_RTL.test(first.value)
	) {
		return false;
	}
	let depth = 0;
	for (const [j, token] of tokens.entries()) {
		if (j <= at || token.kind !== 'tag') {
			continue;
		}
		depth += token.close ? -1 : 1;
		if (depth === 0) {
			const next = tokens[j + 1];
			return next?.kind === 'tag' && next.close && next.name === 'a';
		}
	}
	return false;
}

/** The three running buffers one `translateMarkup` call threads
 * through its per-token branches. */
interface Emit {
	open: Open[];
	out: string[];
	problems: string[];
}

/** Record an opening entry and emit the text that stands for it. */
function pushOpen(e: Emit, o: Open): void {
	e.open.push(o);
	e.out.push(o.openText);
}

/** A closing tag: pop its opener and emit the matching close, or pass
 * the token through raw when the stack does not agree with it. */
function emitClose(e: Emit, token: TagToken): void {
	const top = e.open.pop();
	if (top?.name !== token.name) {
		e.problems.push(`unbalanced ${token.value}`);
		e.out.push(token.value);
		return;
	}
	if (!top.translated) {
		e.out.push(token.value);
	} else if (token.name === 'span') {
		e.out.push('</he>');
	} else {
		e.out.push(top.he ? '</he></cite>' : '</cite>');
	}
}

/** An opening span: `<he>` when it carries dir="rtl", raw otherwise. */
function emitSpanOpen(e: Emit, token: TagToken): void {
	if (!DIR_RTL.test(token.value)) {
		e.problems.push(`span without dir="rtl": ${token.value}`);
		pushOpen(e, {
			he: false,
			name: 'span',
			openText: token.value,
			translated: false,
		});
		return;
	}
	pushOpen(e, { he: false, name: 'span', openText: '<he>', translated: true });
}

/** An opening anchor: `<cite ref>`, with an inner `<he>` when the
 * anchor itself is the rtl layer — which it is not when an rtl span
 * inside it already supplies that layer (`wrapped`, from the caller,
 * since the check needs the whole token run). Raw when the href will
 * not parse. */
function emitAnchorOpen(
	e: Emit,
	token: TagToken,
	resolve: RefResolver,
	wrapped: boolean,
): void {
	const href = HREF.exec(token.value)?.groups?.['v'];
	const dataRef = DATA_REF.exec(token.value)?.groups?.['v'] ?? '';
	if (href === undefined) {
		e.problems.push(`anchor without href: ${token.value}`);
		pushOpen(e, {
			he: false,
			name: 'a',
			openText: token.value,
			translated: false,
		});
		return;
	}
	const ref = resolve({ dataRef, href });
	if (ref.includes('"')) {
		e.problems.push(`ref carries a quote: ${ref}`);
	}
	const he = DIR_RTL.test(token.value) && !wrapped;
	const openText = he ? `<cite ref="${ref}"><he>` : `<cite ref="${ref}">`;
	pushOpen(e, { he, name: 'a', openText, translated: true });
}

/** Any other opening tag, emitted verbatim; off-vocabulary names are
 * reported but still pass through. */
function emitOtherOpen(e: Emit, token: TagToken): void {
	if (!KEEP.has(token.name)) {
		e.problems.push(`tag outside the vocabulary: ${token.value}`);
	}
	pushOpen(e, {
		he: false,
		name: token.name,
		openText: token.value,
		translated: false,
	});
}

/** Settle whatever is still open when the tokens run out: force-closed
 * and handed to the carry when there is one, reported as unclosed when
 * there is not. Returns how many entries were carried. */
function finishOpen(e: Emit, carry: TagCarry | undefined): number {
	if (e.open.length === 0) {
		if (carry !== undefined) {
			carry.open = [];
		}
		return 0;
	}
	if (carry === undefined) {
		e.problems.push(`unclosed: ${e.open.map((o) => o.name).join(',')}`);
		return 0;
	}
	for (let i = e.open.length - 1; i >= 0; i--) {
		const entry = e.open[i];
		if (entry !== undefined) {
			e.out.push(closeFor(entry));
		}
	}
	carry.open = [...e.open];
	return e.open.length;
}

function translateMarkup(
	html: string,
	resolve: RefResolver,
	carry?: TagCarry,
): Translated {
	const tokens = tokenize(html);
	const e: Emit = { open: [], out: [], problems: [] };
	for (const o of carry?.open ?? []) {
		pushOpen(e, o);
	}
	for (const [i, token] of tokens.entries()) {
		if (token.kind === 'text') {
			e.out.push(token.value);
		} else if (token.close) {
			emitClose(e, token);
		} else if (token.name === 'span') {
			emitSpanOpen(e, token);
		} else if (token.name === 'a') {
			emitAnchorOpen(e, token, resolve, wrappedInRtlSpan(tokens, i));
		} else {
			emitOtherOpen(e, token);
		}
	}
	const carried = finishOpen(e, carry);
	return { carried, problems: e.problems, text: e.out.join('') };
}

export type { RefResolver, TagCarry, Translated };
export { translateMarkup };
