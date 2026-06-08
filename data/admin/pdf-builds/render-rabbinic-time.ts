/**
 * Render data/admin/pdf-builds/rabbinic-time.html → assets/pdfs/rabbinic-time.pdf
 * via headless Chromium (Playwright).
 *
 * The HTML loads the live website source verbatim (../../../assets/scripts/
 * rabbinic-time.js and ../../../assets/styles/rabbinic-time.css), so any change
 * to those files flows into the next build automatically. Chart.js and the
 * woff2 fonts are bundled locally because headless Chromium with file:// origin
 * cannot reach CDNs.
 *
 * Used by `POST /api/builds/rabbinic-time-pdf` in server.ts. Also runnable
 * directly: `bun pdf-builds/render-rabbinic-time.ts`.
 */
import { mkdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const HERE: string = import.meta.dir;
const HTML = join(HERE, 'rabbinic-time.html');
const REPO_ROOT = join(HERE, '..', '..', '..');
const OUT = join(REPO_ROOT, 'assets', 'pdfs', 'rabbinic-time.pdf');

export type BuildResult = {
	bytes: number;
	durationMs: number;
	outPath: string;
	logs: string[];
};

type PrintWindow = typeof globalThis & {
	// biome-ignore lint/style/useNamingConvention: window-global signal flags polled by the Playwright build driver
	PRINT_READY?: boolean;
	// biome-ignore lint/style/useNamingConvention: window-global signal flags polled by the Playwright build driver
	PRINT_ERROR?: string;
};

export async function buildRabbinicTimePdf(): Promise<BuildResult> {
	const started = Date.now();
	const logs: string[] = [];
	mkdirSync(dirname(OUT), { recursive: true });

	const browser = await chromium.launch();
	try {
		const ctx = await browser.newContext();
		const page = await ctx.newPage();

		page.on('pageerror', (exc) => logs.push(`[pageerror] ${exc.message}`));
		page.on('console', (msg) => {
			if (msg.type() === 'error' || msg.type() === 'warning') {
				logs.push(`[console.${msg.type()}] ${msg.text()}`);
			}
		});

		await page.goto(`file://${HTML}`, { waitUntil: 'networkidle' });
		await page.waitForFunction(
			() => (globalThis as PrintWindow).PRINT_READY === true,
			{ timeout: 30_000 },
		);

		const err = await page.evaluate(
			() => (globalThis as PrintWindow).PRINT_ERROR ?? null,
		);
		if (err) {
			throw new Error(`print driver error: ${err}`);
		}

		// Settle any pending Chart.js animation frames
		await page.waitForTimeout(400);

		await page.pdf({
			path: OUT,
			format: 'Letter',
			landscape: true,
			printBackground: true,
			margin: {
				top: '0.5in',
				right: '0.55in',
				bottom: '0.7in',
				left: '0.55in',
			},
			preferCSSPageSize: true,
			displayHeaderFooter: true,
			headerTemplate: '<span></span>',
			footerTemplate: [
				'<div style="width:100%;padding:0 0.55in;',
				"font-family:'Lexend','Helvetica',sans-serif;",
				'font-size:8pt;color:#525258;',
				'display:flex;justify-content:space-between;',
				'letter-spacing:0.04em;">',
				'<span>Rabbinic Time · Page <span class="pageNumber"></span> of ',
				'<span class="totalPages"></span></span>',
				'<span>jastrow.app/#rabbinic-time</span>',
				'</div>',
			].join(''),
		});
	} finally {
		await browser.close();
	}

	const bytes = statSync(OUT).size;
	return {
		bytes,
		durationMs: Date.now() - started,
		outPath: OUT,
		logs,
	};
}

if (import.meta.main) {
	try {
		const r = await buildRabbinicTimePdf();
		const rel = relative(REPO_ROOT, r.outPath);
		console.log(
			`Wrote ${rel} (${(r.bytes / 1024).toFixed(1)} KB) in ${r.durationMs} ms`,
		);
		for (const line of r.logs) {
			console.log(line);
		}
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}
