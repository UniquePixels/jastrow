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
 * **Where it sits, and why that matters.** It runs in the import
 * write step, on the way to disk, AFTER every source gate has read
 * the in-memory entries. So it cannot move one: gate 3
 * (`checkTextConservation`) compares the composed body against that
 * same in-memory entries, string for string, and never sees a
 * normalized value. A green gate 3 on the rewritten tree is therefore
 * evidence about the transforms, not about this function — which is
 * the right division, because what makes THIS step safe is what NFC
 * is (below), not a gate downstream of it.
 *
 * The one gate that reads its OUTPUT is gate 10, `contract`: the
 * entry contract (`admin/entry/`) over exactly what is about to be
 * written. Its NFC clause is the other half of this module — it holds
 * a file this step never saw, a hand edit, to the same property.
 *
 * **Why it needs no guard of its own.** NFC changes a string only
 * into a canonically equivalent one — Unicode defines it that way —
 * so it cannot add, drop or exchange text a reader can see. This
 * module once asserted `NFD(before) === NFD(after)` on every rewrite
 * and refused the write on a mismatch. That comparison IS the
 * definition of canonical equivalence, so it could not fail on any
 * input; its one test reached the refusal only by monkey-patching
 * `String.prototype.normalize` (review ledger L10). A singleton such
 * as U+212A KELVIN SIGN → `K` passed it too, since both sides
 * decompose to `K`. It was removed rather than kept as a check that
 * reads as protection and is not.
 *
 * On Hebrew this only ever reorders: no Hebrew letter+point sequence
 * composes to a presentation form, since those are on Unicode's
 * composition-exclusion list. Latin and Greek diacritics (`Ḥ`, `ḳ`,
 * `ḫ`, `ṇ`, `Ἀ`, `ά`) do compose, which changes the code point count
 * and nothing a reader sees.
 *
 * **`data/source/` is never touched.** The snapshot is pinned by
 * sha256 and belongs upstream; its own 201 non-NFC strings are
 * reported to Sefaria, not repaired here. Nor is the one field an
 * entry copies from it verbatim — see `VERBATIM_FIELDS`.
 *
 * Idempotent: NFC is a fixed point, so a second run rewrites nothing.
 */

import { VERBATIM_FIELDS } from '../../entry/types.ts';

/** What one normalization pass changed. `strings` counts the values
 * rewritten, not the values visited. */
interface NormalizeCount {
	strings: number;
}

/** One string, normalized, counted when the pass rewrote it. */
function normalizeString(value: string, count: NormalizeCount): string {
	const normalized = value.normalize('NFC');
	if (normalized !== value) {
		count.strings++;
	}
	return normalized;
}

/** Walk any JSON value, normalizing every string it holds — except
 * under `VERBATIM_FIELDS` (the entry contract's list, `admin/entry/
 * types.ts`). Gate 7 asserts `sefariaHeadword` byte for byte against
 * the snapshot BEFORE this step runs, so nothing downstream would
 * catch a normalization of it. The snapshot holds no non-NFC headword
 * today, which is why this is a guard rather than a repair — the next
 * refresh that carries one is what it is for.
 *
 * Object KEYS are left alone and are not counted: they are the
 * schema's field names, which `validate.ts` holds to a fixed ASCII
 * vocabulary. A key outside it is a schema error and is refused
 * there, where the message can say so — silently renaming one here
 * would hide it. */
function walk(value: unknown, count: NormalizeCount): unknown {
	if (typeof value === 'string') {
		return normalizeString(value, count);
	}
	if (Array.isArray(value)) {
		return value.map((item) => walk(item, count));
	}
	if (typeof value === 'object' && value !== null) {
		const out: Record<string, unknown> = {};
		for (const [key, item] of Object.entries(value)) {
			out[key] = VERBATIM_FIELDS.has(key) ? item : walk(item, count);
		}
		return out;
	}
	return value;
}

/** Every string field of `entry`, NFC-normalized, as a deep copy —
 * the input is never mutated. Returns the copy beside the number of
 * strings it rewrote, so the write step can report how much of the
 * tree this touched (164 strings in 150 files when #110 measured it). */
function normalizeForWrite<T>(entry: T): [T, number] {
	const count: NormalizeCount = { strings: 0 };
	const value = walk(entry, count) as T;
	return [value, count.strings];
}

export { normalizeForWrite };
