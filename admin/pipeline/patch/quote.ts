/**
 * The quoted span a patch rationale carries: what the evidence backfill
 * (`backfill-evidence.ts`) read as an hOCR quote.
 */

/** What may follow a closing `"`: a clause end, or the end. */
const QUOTE_END = /^(?:[;,)]| \/|\.(?:\s|$)|$)/u;

/** The run a backtick at `at` opens, or `undefined` when none closes
 * it or it is empty. */
function backtickRun(text: string, at: number): string | undefined {
	const close = text.indexOf('`', at + 1);
	return close > at + 1 ? text.slice(at + 1, close) : undefined;
}

/** The run a `"` at `at` opens: closed by the first later `"` on the
 * same line that a clause end follows, so a stray `"` of the OCR's own
 * inside a quote is read whole. `undefined` when none closes it. */
function doubleQuotedRun(text: string, at: number): string | undefined {
	const lineEnd = text.indexOf('\n', at + 1);
	const limit = lineEnd === -1 ? text.length : lineEnd;
	for (let close = at + 2; close < limit; close += 1) {
		if (text.charAt(close) === '"' && QUOTE_END.test(text.slice(close + 1))) {
			return text.slice(at + 1, close);
		}
	}
	return undefined;
}

/** The run the character at `at` opens, if it opens one. */
function runAt(text: string, at: number): string | undefined {
	const open = text.charAt(at);
	if (open === '`') {
		return backtickRun(text, at);
	}
	return open === '"' ? doubleQuotedRun(text, at) : undefined;
}

/** The first quoted span of `text`, scanned from the left: a backticked
 * run, or a double-quoted one. Index arithmetic, where a lazy `.+?`
 * with a lookahead backtracked; the readings are the same. */
function firstQuote(text: string): string | undefined {
	for (let at = 0; at < text.length; at += 1) {
		const run = runAt(text, at);
		if (run !== undefined) {
			return run;
		}
	}
	return undefined;
}

export { firstQuote };
