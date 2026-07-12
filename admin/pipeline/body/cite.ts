/**
 * Citation-anchor detection. Detection only — no rewriting here, so every
 * consumer stays positionally round-trip safe. Matches both href forms
 * ("/X" and the slash-less damage class, entry-body-model design §4).
 */
interface CitationHit {
	dataRef: string;
	end: number;
	href: string;
	kind: 'internal' | 'external';
	start: number;
}

const ANCHOR = /<a\b[^>]*class="refLink"[^>]*>[\s\S]*?<\/a>/gu;
const HREF = /href="\/?(?<target>[^"]+)"/u;
const DATA_REF = /data-ref="(?<value>[^"]+)"/u;

/** Find every citation anchor in a definition string, in document order.
 * Returns byte offsets (`start`/`end`) spanning the full `<a…>…</a>` tag,
 * so `text.slice(hit.start, hit.end)` reconstructs it exactly. */
function findCitations(text: string): CitationHit[] {
	const hits: CitationHit[] = [];
	for (const m of text.matchAll(ANCHOR)) {
		const [tag] = m;
		const href = HREF.exec(tag)?.groups?.['target'] ?? '';
		const dataRef = DATA_REF.exec(tag)?.groups?.['value'] ?? '';
		hits.push({
			dataRef,
			end: m.index + tag.length,
			href,
			kind: href.startsWith('Jastrow,') ? 'internal' : 'external',
			start: m.index,
		});
	}
	return hits;
}

export type { CitationHit };
export { findCitations };
