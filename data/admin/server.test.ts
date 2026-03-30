import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { join } from "path";

const PORT = 3334; // Use non-default port to avoid conflicts
const BASE = `http://localhost:${PORT}`;

let serverProcess: ReturnType<typeof Bun.spawn>;

async function waitForServer(url: string, timeout = 10000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Server not ready yet
    }
    await Bun.sleep(100);
  }
  throw new Error(`Server not ready after ${timeout}ms`);
}

beforeAll(async () => {
  serverProcess = Bun.spawn(["bun", "run", join(import.meta.dir, "server.ts")], {
    env: { ...process.env, PORT: String(PORT) },
    stdout: "pipe",
    stderr: "pipe",
  });
  await waitForServer(`${BASE}/api/entries`);
});

afterAll(() => {
  serverProcess.kill();
});

describe("GET /api/entries", () => {
  test("returns array with splitIndex, entries have hw and id fields", async () => {
    const res = await fetch(`${BASE}/api/entries`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");

    const data = await res.json();
    expect(typeof data.splitIndex).toBe("number");
    expect(data.splitIndex).toBeGreaterThan(0);
    expect(Array.isArray(data.entries)).toBe(true);
    expect(data.entries.length).toBeGreaterThan(0);

    const first = data.entries[0];
    expect(first).toHaveProperty("hw");
    expect(first).toHaveProperty("id");
  });
});

describe("PUT /api/entry/:rid", () => {
  test("updates entry and verifies change", async () => {
    // Get the original entry
    const getRes = await fetch(`${BASE}/api/entries`);
    const { entries } = await getRes.json();
    const original = entries.find((e: any) => e.id === "A00014");
    expect(original).toBeDefined();

    const originalHw = original.hw;

    try {
      // Update the entry
      const modified = { ...original, hw: "__TEST_HW__" };
      const putRes = await fetch(`${BASE}/api/entry/A00014`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modified),
      });
      expect(putRes.status).toBe(200);

      // Verify the change
      const verifyRes = await fetch(`${BASE}/api/entries`);
      const verifyData = await verifyRes.json();
      const updated = verifyData.entries.find((e: any) => e.id === "A00014");
      expect(updated.hw).toBe("__TEST_HW__");
    } finally {
      // Restore original
      const restoreRes = await fetch(`${BASE}/api/entry/A00014`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...original, hw: originalHw }),
      });
      expect(restoreRes.status).toBe(200);
    }
  });
});

describe("GET /api/abbreviations", () => {
  test("returns english and hebrew objects", async () => {
    const res = await fetch(`${BASE}/api/abbreviations`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("english");
    expect(data).toHaveProperty("hebrew");
    expect(typeof data.english).toBe("object");
    expect(typeof data.hebrew).toBe("object");
  });
});

describe("GET /api/sages", () => {
  test("returns sages array with ids", async () => {
    const res = await fetch(`${BASE}/api/sages`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data.sages)).toBe(true);
    expect(data.sages.length).toBeGreaterThan(0);
    expect(data.sages[0]).toHaveProperty("id");
  });
});

describe("GET /api/annotations", () => {
  test("returns object (possibly empty)", async () => {
    const res = await fetch(`${BASE}/api/annotations`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(typeof data).toBe("object");
    expect(data).not.toBeNull();
  });
});

describe("CORS", () => {
  test("OPTIONS returns CORS headers", async () => {
    const res = await fetch(`${BASE}/api/entries`, { method: "OPTIONS" });
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });

  test("GET responses include CORS header", async () => {
    const res = await fetch(`${BASE}/api/entries`);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });
});
