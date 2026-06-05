/**
 * Stage bundled assets out of node_modules into pdf-builds/ so headless
 * Chromium can load them via file://. Exposed from the root package.json as
 * `bun run stage` and as part of `bun run setup:pdf`.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const HERE = import.meta.dir;
const ADMIN = dirname(HERE);
// Deps are consolidated at the repo root (../../node_modules), not under
// data/admin — see the root package.json.
const NODE_MODULES = join(ADMIN, '..', '..', 'node_modules');

function copy(src: string, dst: string): void {
	if (!existsSync(src)) {
		console.error(`[stage] missing: ${src}`);
		process.exit(1);
	}
	mkdirSync(dirname(dst), { recursive: true });
	copyFileSync(src, dst);
}

const FONT_FILES = [
	'atkinson-hyperlegible-next-latin-400-normal',
	'atkinson-hyperlegible-next-latin-400-italic',
	'atkinson-hyperlegible-next-latin-700-normal',
	'atkinson-hyperlegible-next-latin-700-italic',
	'lexend-latin-400-normal',
	'lexend-latin-600-normal',
	'lexend-latin-700-normal',
	'frank-ruhl-libre-hebrew-400-normal',
	'frank-ruhl-libre-hebrew-500-normal',
	'frank-ruhl-libre-hebrew-700-normal',
];

function fontPkg(name: string): string {
	if (name.startsWith('atkinson')) {
		return '@fontsource/atkinson-hyperlegible-next';
	}
	if (name.startsWith('lexend')) {
		return '@fontsource/lexend';
	}
	return '@fontsource/frank-ruhl-libre';
}

copy(
	join(NODE_MODULES, 'chart.js/dist/chart.umd.js'),
	join(HERE, 'chart.umd.js'),
);

for (const file of FONT_FILES) {
	copy(
		join(NODE_MODULES, fontPkg(file), 'files', `${file}.woff2`),
		join(HERE, 'fonts', `${file}.woff2`),
	);
}

console.log(`[stage] chart.umd.js + ${FONT_FILES.length} fonts staged.`);
