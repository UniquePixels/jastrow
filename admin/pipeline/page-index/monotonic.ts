/**
 * Isotonic regression by pool-adjacent-violators (PAVA).
 *
 * Each entry's OCR offset is estimated independently from whichever anchor sits
 * nearest to it, which means neighbouring entries can be estimated from
 * different anchors and come out in the wrong order. The print cannot do that:
 * entry *i+1* never begins before entry *i*. Projecting the raw estimates onto
 * the nearest non-decreasing sequence restores that guarantee while moving each
 * estimate as little as possible.
 *
 * Weights let a confident estimate hold its ground against a doubtful
 * neighbour, so a block of weak placements is pulled to the strong ones rather
 * than the average being split between them.
 */

/**
 * Project `values` onto the nearest non-decreasing sequence under weighted
 * least squares. Returns a new array; inputs are not modified.
 */
function isotonic(
	values: readonly number[],
	weights?: readonly number[],
): number[] {
	const n = values.length;
	if (weights && weights.length !== n) {
		throw new Error(
			`isotonic: weights length ${weights.length} does not match values length ${n}`,
		);
	}
	if (n === 0) {
		return [];
	}

	// Each block holds a pooled mean over a run of the input.
	const mean = new Float64Array(n);
	const weight = new Float64Array(n);
	const size = new Int32Array(n);
	let blocks = 0;

	for (let i = 0; i < n; i++) {
		let m = values[i] as number;
		let w = weights ? (weights[i] as number) : 1;
		if (w <= 0) {
			w = 1e-9;
		}
		let s = 1;
		// Merge backwards while the previous block sits above this one.
		while (blocks > 0 && (mean[blocks - 1] as number) > m) {
			const pw = weight[blocks - 1] as number;
			const pm = mean[blocks - 1] as number;
			const total = pw + w;
			m = (pm * pw + m * w) / total;
			w = total;
			s += size[blocks - 1] as number;
			blocks--;
		}
		mean[blocks] = m;
		weight[blocks] = w;
		size[blocks] = s;
		blocks++;
	}

	const out: number[] = new Array(n);
	let k = 0;
	for (let b = 0; b < blocks; b++) {
		const v = mean[b] as number;
		const count = size[b] as number;
		for (let j = 0; j < count; j++) {
			out[k++] = v;
		}
	}
	return out;
}

/** True when `values` is non-decreasing. */
function isNonDecreasing(values: readonly number[]): boolean {
	for (let i = 1; i < values.length; i++) {
		if ((values[i] as number) < (values[i - 1] as number)) {
			return false;
		}
	}
	return true;
}

export { isNonDecreasing, isotonic };
