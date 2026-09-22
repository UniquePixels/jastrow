/**
 * NFC on write ([#110](https://github.com/UniquePixels/jastrow/issues/110)).
 *
 * Text reaches the pipeline with combining marks in a non-canonical
 * order, so two visually identical words can compare unequal byte for
 * byte. Headword design §3.1 rule 6 answers the READ side of that —
 * every comparison normalizes first — and this module answers the
 * write side, so the property holds by construction rather than by a
 * one-off script the next run undoes.
 *
 * **Where it sits, and why that matters.** It runs in the migrate
 * write step, on the way to disk, AFTER every gate has read the
 * in-memory truth. So it cannot move a gate: gate 3
 * (`checkTextConservation`) compares the composed body against that
 * same in-memory truth, string for string, and never sees a
 * normalized value. A green gate 3 on the rewritten tree is therefore
 * evidence about the transforms, not about this function — which is
 * the right division, because what makes THIS step safe is its own
 * assertion, not a gate downstream of it.
 *
 * **What makes it provably lossless.** Every rewritten string must
 * satisfy `NFD(before) === NFD(after)`: the two spellings decompose
 * to the same sequence, so nothing was added, dropped or exchanged —
 * only reordered or composed. A string that fails REFUSES the write
 * rather than being written normalized, because a normalization that
 * is not lossless is a text edit, and this module has no mandate to
 * edit text. Measured 2026-09-20, all 164 non-NFC strings in
 * `data/entries/` satisfy it.
 *
 * On Hebrew this only ever reorders: no Hebrew letter+point sequence
 * composes to a presentation form, since those are on Unicode's
 * composition-exclusion list. Latin and Greek diacritics (`Ḥ`, `ḳ`,
 * `ḫ`, `ṇ`, `Ἀ`, `ά`) do compose, which changes the code point count
 * — the NFD assertion is what covers that case rather than a count.
 *
 * **`data/source/` is never touched.** The snapshot is pinned by
 * sha256 and belongs upstream; its own 201 non-NFC strings are
 * reported to Sefaria, not repaired here. Nor is the one field an
 * entry copies from it verbatim — see `VERBATIM_FIELDS`.
 *
 * Idempotent: NFC is a fixed point, so a second run rewrites nothing.
 */

/** A string whose NFC form does not decompose back to the original —
 * normalizing it would be a text edit, not a spelling change. */
class NormalizeError extends Error {
	readonly path: string;

	constructor(path: string, before: string, after: string) {
		super(
			`${path}: NFC is not lossless here — ${JSON.stringify(before)} → ${JSON.stringify(after)} (NFD differs); refusing the write`,
		);
		this.name = 'NormalizeError';
		this.path = path;
	}
}

/** What one normalization pass changed. `strings` counts the values
 * rewritten, not the values visited. */
interface NormalizeCount {
	strings: number;
}

/** One string, normalized, with the losslessness assertion.
 *
 * The assertion is made on a string the pass actually REWRITES. An
 * unchanged string is its own NFC form, so `NFD(before)` and
 * `NFD(after)` are decompositions of one string and the comparison
 * could not fail — checking it would be a mark that cannot fire. */
function normalizeString(
	value: string,
	path: string,
	count: NormalizeCount,
): string {
	const normalized = value.normalize('NFC');
	if (normalized === value) {
		return value;
	}
	if (normalized.normalize('NFD') !== value.normalize('NFD')) {
		throw new NormalizeError(path, value, normalized);
	}
	count.strings++;
	return normalized;
}

/** Fields that are copied from elsewhere VERBATIM and must keep the
 * bytes they were copied from, whatever spelling those are.
 *
 * `sefariaHeadword` is Sefaria's own headword, stored so the Sefaria
 * URL route keeps working after our headword is corrected (URL names
 * spec §5.1, U3). It is a foreign key, not our text: normalizing it
 * would make it a spelling Sefaria does not use, and gate 7 asserts
 * it byte for byte against the snapshot BEFORE this step runs, so
 * nothing downstream would catch the drift. The snapshot holds no
 * non-NFC headword today, which is why this is a guard rather than a
 * repair — the next refresh that carries one is what it is for. */
const VERBATIM_FIELDS: ReadonlySet<string> = new Set(['sefariaHeadword']);

/** Walk any JSON value, normalizing every string it holds.
 *
 * Object KEYS are left alone and are not counted: they are the
 * schema's field names, which `validate.ts` holds to a fixed ASCII
 * vocabulary. A key outside it is a schema error and is refused
 * there, where the message can say so — silently renaming one here
 * would hide it. */
function walk(value: unknown, path: string, count: NormalizeCount): unknown {
	if (typeof value === 'string') {
		return normalizeString(value, path, count);
	}
	if (Array.isArray(value)) {
		return value.map((item, i) => walk(item, `${path}[${i}]`, count));
	}
	if (typeof value === 'object' && value !== null) {
		const out: Record<string, unknown> = {};
		for (const [key, item] of Object.entries(value)) {
			out[key] = VERBATIM_FIELDS.has(key)
				? item
				: walk(item, `${path}.${key}`, count);
		}
		return out;
	}
	return value;
}

/** Every string field of `entry`, NFC-normalized, as a deep copy —
 * the input is never mutated. Returns the copy beside the number of
 * strings it rewrote, so the write step can report how much of the
 * tree this touched (164 strings in 150 files when #110 measured it).
 *
 * Throws `NormalizeError` on the first string NFC would not carry
 * losslessly, which refuses the whole write. */
function normalizeForWrite<T>(entry: T, path = 'entry'): [T, number] {
	const count: NormalizeCount = { strings: 0 };
	const value = walk(entry, path, count) as T;
	return [value, count.strings];
}

export { NormalizeError, normalizeForWrite };
