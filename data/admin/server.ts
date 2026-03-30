import { join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";

const DATA_DIR = join(import.meta.dir, "..");
const PORT = parseInt(process.env.PORT || "3333", 10);

// --- Data Loading ---

function loadJsonl(filePath: string): any[] {
  const content = readFileSync(filePath, "utf-8").trimEnd();
  return content.split("\n").map((line) => JSON.parse(line));
}

function readJsonSafe(filePath: string): any {
  try {
    if (!existsSync(filePath)) return {};
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return {};
  }
}

function writeJson(filePath: string, data: any): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function writeJsonl(filePath: string, entries: any[]): void {
  const content = entries.map((e) => JSON.stringify(e)).join("\n") + "\n";
  writeFileSync(filePath, content, "utf-8");
}

function updateVersion(): void {
  writeJson(join(DATA_DIR, "version.json"), {
    v: new Date().toISOString(),
  });
}

// Load entries on startup
const part1Path = join(DATA_DIR, "jastrow-part1.jsonl");
const part2Path = join(DATA_DIR, "jastrow-part2.jsonl");
const part1 = loadJsonl(part1Path);
const part2 = loadJsonl(part2Path);
const splitIndex = part1.length;
let entries: any[] = [...part1, ...part2];

// File paths
const abbrEnglishPath = join(DATA_DIR, "jastrow-abbr.json");
const abbrHebrewPath = join(DATA_DIR, "jastrow-hebrew-abbr.json");
const sagesPath = join(DATA_DIR, "sages.json");
const annotationsPath = join(DATA_DIR, "admin", "annotations.json");
const adminHtmlPath = join(import.meta.dir, "admin.html");

console.log(
  `Loaded ${entries.length} entries (part1: ${splitIndex}, part2: ${entries.length - splitIndex})`
);

// --- Helpers ---

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function saveEntriesToDisk(): void {
  const p1 = entries.slice(0, splitIndex);
  const p2 = entries.slice(splitIndex);
  writeJsonl(part1Path, p1);
  writeJsonl(part2Path, p2);
  updateVersion();
}

// --- Router ---

function matchRoute(
  method: string,
  pathname: string
): { handler: (req: Request, params: Record<string, string>) => Promise<Response> | Response; params: Record<string, string> } | null {
  const routes: Array<{
    method: string;
    pattern: RegExp;
    paramNames: string[];
    handler: (req: Request, params: Record<string, string>) => Promise<Response> | Response;
  }> = [
    // Entries
    {
      method: "GET",
      pattern: /^\/api\/entries$/,
      paramNames: [],
      handler: handleGetEntries,
    },
    {
      method: "PUT",
      pattern: /^\/api\/entry\/([^/]+)$/,
      paramNames: ["rid"],
      handler: handlePutEntry,
    },
    {
      method: "POST",
      pattern: /^\/api\/save-all$/,
      paramNames: [],
      handler: handleSaveAll,
    },
    // Annotations
    {
      method: "GET",
      pattern: /^\/api\/annotations$/,
      paramNames: [],
      handler: handleGetAnnotations,
    },
    {
      method: "PUT",
      pattern: /^\/api\/annotations$/,
      paramNames: [],
      handler: handlePutAnnotations,
    },
    // Abbreviations
    {
      method: "GET",
      pattern: /^\/api\/abbreviations$/,
      paramNames: [],
      handler: handleGetAbbreviations,
    },
    {
      method: "PUT",
      pattern: /^\/api\/abbreviations\/([^/]+)$/,
      paramNames: ["type"],
      handler: handlePutAbbreviations,
    },
    // Sages
    {
      method: "GET",
      pattern: /^\/api\/sages$/,
      paramNames: [],
      handler: handleGetSages,
    },
    {
      method: "PUT",
      pattern: /^\/api\/sage\/([^/]+)$/,
      paramNames: ["id"],
      handler: handlePutSage,
    },
    {
      method: "POST",
      pattern: /^\/api\/sage$/,
      paramNames: [],
      handler: handlePostSage,
    },
    {
      method: "DELETE",
      pattern: /^\/api\/sage\/([^/]+)$/,
      paramNames: ["id"],
      handler: handleDeleteSage,
    },
    {
      method: "POST",
      pattern: /^\/api\/sage\/([^/]+)\/research$/,
      paramNames: ["id"],
      handler: handleSageResearch,
    },
  ];

  for (const route of routes) {
    if (route.method !== method) continue;
    const match = pathname.match(route.pattern);
    if (match) {
      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1]);
      });
      return { handler: route.handler, params };
    }
  }
  return null;
}

// --- Handlers ---

function handleGetEntries(): Response {
  return jsonResponse({ entries, splitIndex });
}

async function handlePutEntry(req: Request, params: Record<string, string>): Promise<Response> {
  const rid = params.rid;
  const idx = entries.findIndex((e) => e.id === rid);
  if (idx === -1) {
    return jsonResponse({ error: `Entry not found: ${rid}` }, 404);
  }
  const body = await req.json();
  entries[idx] = body;
  saveEntriesToDisk();
  return jsonResponse({ ok: true, entry: body });
}

async function handleSaveAll(req: Request): Promise<Response> {
  const body = await req.json();
  if (Array.isArray(body.updates)) {
    for (const update of body.updates) {
      const idx = entries.findIndex((e) => e.id === update.id);
      if (idx !== -1) {
        entries[idx] = update;
      }
    }
  }
  saveEntriesToDisk();
  return jsonResponse({ ok: true, count: body.updates?.length ?? 0 });
}

function handleGetAnnotations(): Response {
  return jsonResponse(readJsonSafe(annotationsPath));
}

async function handlePutAnnotations(req: Request): Promise<Response> {
  const body = await req.json();
  writeJson(annotationsPath, body);
  updateVersion();
  return jsonResponse({ ok: true });
}

function handleGetAbbreviations(): Response {
  const english = readJsonSafe(abbrEnglishPath);
  const hebrew = readJsonSafe(abbrHebrewPath);
  return jsonResponse({ english, hebrew });
}

async function handlePutAbbreviations(req: Request, params: Record<string, string>): Promise<Response> {
  const type = params.type;
  const body = await req.json();
  if (type === "english") {
    writeJson(abbrEnglishPath, body);
  } else if (type === "hebrew") {
    writeJson(abbrHebrewPath, body);
  } else {
    return jsonResponse({ error: `Unknown abbreviation type: ${type}` }, 400);
  }
  updateVersion();
  return jsonResponse({ ok: true });
}

function handleGetSages(): Response {
  const data = readJsonSafe(sagesPath);
  return jsonResponse(data);
}

async function handlePutSage(req: Request, params: Record<string, string>): Promise<Response> {
  const id = params.id;
  const body = await req.json();
  const data = readJsonSafe(sagesPath);
  const sages: any[] = data.sages || [];
  const idx = sages.findIndex((s) => s.id === id);
  if (idx === -1) {
    return jsonResponse({ error: `Sage not found: ${id}` }, 404);
  }
  sages[idx] = { ...body, id };
  writeJson(sagesPath, { sages });
  updateVersion();
  return jsonResponse({ ok: true, sage: sages[idx] });
}

async function handlePostSage(req: Request): Promise<Response> {
  const body = await req.json();
  if (!body.id) {
    return jsonResponse({ error: "Sage must have an id" }, 400);
  }
  const data = readJsonSafe(sagesPath);
  const sages: any[] = data.sages || [];
  if (sages.some((s) => s.id === body.id)) {
    return jsonResponse({ error: `Sage already exists: ${body.id}` }, 409);
  }
  sages.push(body);
  writeJson(sagesPath, { sages });
  updateVersion();
  return jsonResponse({ ok: true, sage: body }, 201);
}

async function handleDeleteSage(_req: Request, params: Record<string, string>): Promise<Response> {
  const id = params.id;
  const data = readJsonSafe(sagesPath);
  const sages: any[] = data.sages || [];
  const idx = sages.findIndex((s) => s.id === id);
  if (idx === -1) {
    return jsonResponse({ error: `Sage not found: ${id}` }, 404);
  }
  sages.splice(idx, 1);
  writeJson(sagesPath, { sages });
  updateVersion();
  return jsonResponse({ ok: true });
}

async function handleSageResearch(
  _req: Request,
  params: Record<string, string>
): Promise<Response> {
  const id = params.id;
  const data = readJsonSafe(sagesPath);
  const sage = (data.sages || []).find((s: any) => s.id === id);
  if (!sage) return jsonResponse({ error: "Sage not found" }, 404);

  const prompt = `You have access to the Sefaria MCP server. Research the Talmudic sage "${sage.name.en}" (${sage.name.he}).
Current data: ${JSON.stringify(sage, null, 2)}
Return a JSON object with suggested additions:
{ "bio": "...", "teachings": ["..."], "stories": ["..."], "relationships": [{"type": "...", "target": "...", "note": "..."}] }
Only include fields where you have substantive new information to add.`;

  try {
    const proc = Bun.spawn(
      ["claude", "-p", "--output-format", "json", prompt],
      {
        stdout: "pipe",
        stderr: "pipe",
      }
    );
    const output = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      return jsonResponse({ error: "Claude CLI failed" }, 503);
    }
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return jsonResponse({ suggestions });
  } catch {
    return jsonResponse({ error: "Claude CLI not available" }, 503);
  }
}

// --- Server ---

function serveAdminHtml(): Response {
  try {
    const html = readFileSync(adminHtmlPath, "utf-8");
    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response("admin.html not found", { status: 404 });
  }
}

const server = Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Serve admin.html
    if (pathname === "/" || pathname === "/admin.html") {
      return serveAdminHtml();
    }

    // API routes
    const route = matchRoute(method, pathname);
    if (route) {
      return route.handler(req, route.params);
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
});

const url = `http://localhost:${server.port}`;
console.log(
  `Admin server running on \x1b]8;;${url}\x1b\\\x1b[36;4m${url}\x1b[0m\x1b]8;;\x1b\\`
);
