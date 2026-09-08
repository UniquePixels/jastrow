/**
 * Markup translation (migrate spec §2.2): the source's six tags into
 * the truth vocabulary, over `transform/html.ts` tokens so text bytes
 * are never touched. Anchors become `<cite ref>`; what `ref` holds is
 * the resolver's decision (`cite.ts`), not this module's.
 */
import { DIR_RTL, type Token, tokenize } from '../transform/html.ts';

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
		first === undefined ||
		first.kind !== 'tag' ||
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
			return (
				next !== undefined &&
				next.kind === 'tag' &&
				next.close &&
				next.name === 'a'
			);
		}
	}
	return false;
}

function translateMarkup(
	html: string,
	resolve: RefResolver,
	carry?: TagCarry,
): Translated {
	const tokens = tokenize(html);
	const out: string[] = [];
	const problems: string[] = [];
	const open: Open[] = [];
	if (carry !== undefined) {
		for (const o of carry.open) {
			open.push(o);
			out.push(o.openText);
		}
	}
	for (const [i, token] of tokens.entries()) {
		if (token.kind === 'text') {
			out.push(token.value);
			continue;
		}
		if (token.close) {
			const top = open.pop();
			if (top === undefined || top.name !== token.name) {
				problems.push(`unbalanced ${token.value}`);
				out.push(token.value);
				continue;
			}
			if (!top.translated) {
				out.push(token.value);
			} else if (token.name === 'span') {
				out.push('</he>');
			} else {
				out.push(top.he ? '</he></cite>' : '</cite>');
			}
			continue;
		}
		if (token.name === 'span') {
			if (!DIR_RTL.test(token.value)) {
				problems.push(`span without dir="rtl": ${token.value}`);
				open.push({
					he: false,
					name: 'span',
					openText: token.value,
					translated: false,
				});
				out.push(token.value);
				continue;
			}
			open.push({
				he: false,
				name: 'span',
				openText: '<he>',
				translated: true,
			});
			out.push('<he>');
			continue;
		}
		if (token.name === 'a') {
			const href = HREF.exec(token.value)?.groups?.['v'];
			const dataRef = DATA_REF.exec(token.value)?.groups?.['v'] ?? '';
			if (href === undefined) {
				problems.push(`anchor without href: ${token.value}`);
				open.push({
					he: false,
					name: 'a',
					openText: token.value,
					translated: false,
				});
				out.push(token.value);
				continue;
			}
			const ref = resolve({ dataRef, href });
			if (ref.includes('"')) {
				problems.push(`ref carries a quote: ${ref}`);
			}
			const he = DIR_RTL.test(token.value) && !wrappedInRtlSpan(tokens, i);
			const openText = he ? `<cite ref="${ref}"><he>` : `<cite ref="${ref}">`;
			open.push({ he, name: 'a', openText, translated: true });
			out.push(openText);
			continue;
		}
		if (!KEEP.has(token.name)) {
			problems.push(`tag outside the vocabulary: ${token.value}`);
		}
		open.push({
			he: false,
			name: token.name,
			openText: token.value,
			translated: false,
		});
		out.push(token.value);
	}
	let carried = 0;
	if (open.length > 0) {
		if (carry === undefined) {
			problems.push(`unclosed: ${open.map((o) => o.name).join(',')}`);
		} else {
			for (let i = open.length - 1; i >= 0; i--) {
				const entry = open[i];
				if (entry !== undefined) {
					out.push(closeFor(entry));
				}
			}
			carried = open.length;
			carry.open = [...open];
		}
	} else if (carry !== undefined) {
		carry.open = [];
	}
	return { carried, problems, text: out.join('') };
}

export type { RefResolver, TagCarry, Translated };
export { translateMarkup };
