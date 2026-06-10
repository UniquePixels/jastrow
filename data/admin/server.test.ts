import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';

const PORT = 3334; // Use non-default port to avoid conflicts
const BASE = `http://localhost:${PORT}`;

// Data files the server reads at startup / serves; copied into an isolated
// temp dir so the test never writes to the repo's tracked data/.
const DATA_FILES = [
	'jastrow-part1.jsonl',
	'jastrow-part2.jsonl',
	'jastrow-abbr.json',
	'jastrow-hebrew-abbr.json',
	'sages.json',
];

let dataDir = '';

interface TestEntry {
	hw?: string;
	id: string;
	[key: string]: unknown;
}

interface EntriesResponse {
	entries: TestEntry[];
	splitIndex: number;
}

interface AbbreviationsResponse {
	english: unknown;
	hebrew: unknown;
}

interface SagesResponse {
	sages: Record<string, unknown>[];
}

let serverProcess: ReturnType<typeof Bun.spawn>;

async function waitForServer(url: string, timeout = 10_000): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		try {
			// biome-ignore lint/performance/noAwaitInLoops: polling the server readiness endpoint is inherently sequential
			const res = await fetch(url);
			if (res.ok) {
				return;
			}
		} catch {
			// Server not ready yet
		}
		await Bun.sleep(100);
	}
	throw new Error(`Server not ready after ${timeout}ms`);
}

beforeAll(async () => {
	// Copy the live data into an isolated temp dir; the server writes there.
	const sourceDir = join(import.meta.dir, '..');
	dataDir = mkdtempSync(join(tmpdir(), 'jastrow-admin-test-'));
	for (const file of DATA_FILES) {
		const source = join(sourceDir, file);
		if (existsSync(source)) {
			copyFileSync(source, join(dataDir, file));
		}
	}
	// handlePutAnnotations writes here; ensure the subdirectory exists.
	mkdirSync(join(dataDir, 'admin'), { recursive: true });

	serverProcess = Bun.spawn(
		['bun', 'run', join(import.meta.dir, 'server.ts')],
		{
			env: { ...process.env, PORT: String(PORT), JASTROW_DATA_DIR: dataDir },
			stdout: 'pipe',
			stderr: 'pipe',
		},
	);
	await waitForServer(`${BASE}/api/entries`);
});

afterAll(() => {
	serverProcess.kill();
	if (dataDir) {
		rmSync(dataDir, { recursive: true, force: true });
	}
});

describe('GET /api/entries', () => {
	it('returns array with splitIndex, entries have hw and id fields', async () => {
		const res = await fetch(`${BASE}/api/entries`);
		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toContain('application/json');

		const data = (await res.json()) as EntriesResponse;
		expect(typeof data.splitIndex).toBe('number');
		expect(data.splitIndex).toBeGreaterThan(0);
		expect(Array.isArray(data.entries)).toBe(true);
		expect(data.entries.length).toBeGreaterThan(0);

		const [first] = data.entries;
		expect(first).toHaveProperty('hw');
		expect(first).toHaveProperty('id');
	});
});

describe('PUT /api/entry/:rid', () => {
	it('updates entry and verifies change', async () => {
		// Get the original entry
		const getRes = await fetch(`${BASE}/api/entries`);
		const { entries } = (await getRes.json()) as EntriesResponse;
		const original = entries.find((e) => e.id === 'A00014');
		expect(original).toBeDefined();
		if (!original) {
			throw new Error('Fixture entry A00014 not found');
		}

		const originalHw = original.hw;

		try {
			// Update the entry
			const modified = { ...original, hw: '__TEST_HW__' };
			const putRes = await fetch(`${BASE}/api/entry/A00014`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(modified),
			});
			expect(putRes.status).toBe(200);

			// Verify the change
			const verifyRes = await fetch(`${BASE}/api/entries`);
			const verifyData = (await verifyRes.json()) as EntriesResponse;
			const updated = verifyData.entries.find((e) => e.id === 'A00014');
			expect(updated?.hw).toBe('__TEST_HW__');
		} finally {
			// Restore original
			const restoreRes = await fetch(`${BASE}/api/entry/A00014`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...original, hw: originalHw }),
			});
			expect(restoreRes.status).toBe(200);
		}
	});
});

describe('PUT /api/entry/:rid sanitization', () => {
	it('rejects a script-laced edit and writes nothing', async () => {
		const getRes = await fetch(`${BASE}/api/entries`);
		const { entries } = (await getRes.json()) as EntriesResponse;
		const original = entries.find((e) => e.id === 'A00014');
		if (!original) {
			throw new Error('Fixture entry A00014 not found');
		}

		const malicious = {
			...original,
			c: { s: [{ d: 'gloss <script>alert(1)</script>' }] },
		};
		const putRes = await fetch(`${BASE}/api/entry/A00014`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(malicious),
		});
		expect(putRes.status).toBe(400);
		const payload = (await putRes.json()) as {
			violations?: { kind: string; detail: string; path: string }[];
		};
		expect(payload.violations).toContainEqual({
			kind: 'tag',
			detail: 'script',
			path: 'c.s[0].d',
		});

		// The on-disk entry must be untouched by the rejected save.
		const verifyRes = await fetch(`${BASE}/api/entries`);
		const verifyData = (await verifyRes.json()) as EntriesResponse;
		const after = verifyData.entries.find((e) => e.id === 'A00014');
		expect(after).toEqual(original);
	});

	it('rejects a javascript: href edit', async () => {
		const getRes = await fetch(`${BASE}/api/entries`);
		const { entries } = (await getRes.json()) as EntriesResponse;
		const original = entries.find((e) => e.id === 'A00014');
		if (!original) {
			throw new Error('Fixture entry A00014 not found');
		}
		const malicious = {
			...original,
			c: { s: [{ d: '<a href="javascript:alert(1)">x</a>' }] },
		};
		const putRes = await fetch(`${BASE}/api/entry/A00014`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(malicious),
		});
		expect(putRes.status).toBe(400);
	});
});

describe('GET /api/abbreviations', () => {
	it('returns english and hebrew objects', async () => {
		const res = await fetch(`${BASE}/api/abbreviations`);
		expect(res.status).toBe(200);

		const data = (await res.json()) as AbbreviationsResponse;
		expect(data).toHaveProperty('english');
		expect(data).toHaveProperty('hebrew');
		expect(typeof data.english).toBe('object');
		expect(typeof data.hebrew).toBe('object');
	});
});

describe('GET /api/sages', () => {
	it('returns sages array with ids', async () => {
		const res = await fetch(`${BASE}/api/sages`);
		expect(res.status).toBe(200);

		const data = (await res.json()) as SagesResponse;
		expect(Array.isArray(data.sages)).toBe(true);
		expect(data.sages.length).toBeGreaterThan(0);
		expect(data.sages[0]).toHaveProperty('id');
	});
});

describe('GET /api/annotations', () => {
	it('returns object (possibly empty)', async () => {
		const res = await fetch(`${BASE}/api/annotations`);
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(typeof data).toBe('object');
		expect(data).not.toBeNull();
	});
});

describe('CORS', () => {
	it('OPTIONS returns CORS headers', async () => {
		const res = await fetch(`${BASE}/api/entries`, { method: 'OPTIONS' });
		expect(res.headers.get('access-control-allow-origin')).toBe(BASE);
	});

	it('GET responses include CORS header', async () => {
		const res = await fetch(`${BASE}/api/entries`);
		expect(res.headers.get('access-control-allow-origin')).toBe(BASE);
	});
});
