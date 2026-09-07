/**
 * Markup translation (migrate spec §2.2): the source's six tags into
 * the truth vocabulary, over `transform/html.ts` tokens so text bytes
 * are never touched. Anchors become `<cite ref>`; what `ref` holds is
 * the resolver's decision (`cite.ts`), not this module's.
 */
import { DIR_RTL, type Token, tokenize } from '../transform/html.ts';

type RefResolver = (anchor: { dataRef: string; href: string }) => string;

interface Translated {
	problems: string[];
	text: string;
}

interface Open {
	he: boolean;
	name: string;
	/** Whether the open branch actually emitted a translated tag (`<he>`
	 * for an rtl span, `<cite …>` for an anchor with a parsed href). A
	 * `false` here means the open was passed through raw — a bare span,
	 * a malformed anchor, a keep-tag, or an unknown tag — so the close
	 * must also pass through raw rather than assume a translated pair. */
	translated: boolean;
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

function translateMarkup(html: string, resolve: RefResolver): Translated {
	const tokens = tokenize(html);
	const out: string[] = [];
	const problems: string[] = [];
	const open: Open[] = [];
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
				open.push({ he: false, name: 'span', translated: false });
				out.push(token.value);
				continue;
			}
			open.push({ he: false, name: 'span', translated: true });
			out.push('<he>');
			continue;
		}
		if (token.name === 'a') {
			const href = HREF.exec(token.value)?.groups?.['v'];
			const dataRef = DATA_REF.exec(token.value)?.groups?.['v'] ?? '';
			if (href === undefined) {
				problems.push(`anchor without href: ${token.value}`);
				open.push({ he: false, name: 'a', translated: false });
				out.push(token.value);
				continue;
			}
			const ref = resolve({ dataRef, href });
			if (ref.includes('"')) {
				problems.push(`ref carries a quote: ${ref}`);
			}
			const he = DIR_RTL.test(token.value) && !wrappedInRtlSpan(tokens, i);
			open.push({ he, name: 'a', translated: true });
			out.push(he ? `<cite ref="${ref}"><he>` : `<cite ref="${ref}">`);
			continue;
		}
		if (!KEEP.has(token.name)) {
			problems.push(`tag outside the vocabulary: ${token.value}`);
		}
		open.push({ he: false, name: token.name, translated: false });
		out.push(token.value);
	}
	if (open.length > 0) {
		problems.push(`unclosed: ${open.map((o) => o.name).join(',')}`);
	}
	return { problems, text: out.join('') };
}

export type { RefResolver, Translated };
export { translateMarkup };
