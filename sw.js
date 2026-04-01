/**
 * Service Worker for Jastrow Dictionary
 * Provides offline functionality and caching for the 42MB dictionary data
 * Uses vanilla Service Worker API (no build process, no Workbox)
 */

// Update this timestamp whenever you deploy changes
// This forces the service worker to update and clear old caches
const CACHE_VERSION = '2026-03-31T00:00:00.000Z';

// Assets to cache immediately on install
const STATIC_ASSETS = [
	'/',
	'/index.html',
	'/assets/styles/styles.css',
	'/assets/scripts/constants.js',
	'/assets/scripts/sanitizer.js',
	'/assets/scripts/keyboard.js',
	'/assets/scripts/data-loader.js',
	'/assets/scripts/app.js',
	'/assets/images/logo.svg',
	'/assets/images/sefarialogo.svg',
	'/assets/images/favicon/favicon.svg',
	'/assets/images/favicon/favicon-96x96.png',
	'/assets/images/favicon/favicon.ico',
	'/assets/images/favicon/apple-touch-icon.png',
	'/assets/images/favicon/site.webmanifest',
	'/assets/styles/sages.css',
	'/assets/scripts/sages-data.js',
	'/assets/scripts/sages-graph.js',
	'/assets/scripts/sages-sidebar.js',
	'/assets/scripts/sages.js',
	'/assets/scripts/scroll-manager.js',
	'/data/sages.json',
	'/data/jastrow-abbr.json',
	'/data/jastrow-hebrew-abbr.json',
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
	console.log('[Service Worker] Installing...');

	event.waitUntil(
		caches
			.open(CACHE_VERSION)
			.then((cache) => {
				console.log('[Service Worker] Caching static assets');
				return cache.addAll(STATIC_ASSETS);
			})
			.then(() => {
				console.log('[Service Worker] Static assets cached successfully');
			})
			.catch((error) => {
				console.error('[Service Worker] Failed to cache static assets:', error);
			}),
	);
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
	console.log('[Service Worker] Activating...');

	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== CACHE_VERSION) {
							console.log('[Service Worker] Deleting old cache:', cacheName);
							return caches.delete(cacheName);
						}
					}),
				);
			})
			.then(() => {
				console.log('[Service Worker] Activated successfully');
				// Take control of all pages immediately
				return self.clients.claim();
			}),
	);
});

/**
 * Fetch event - serve from cache, fallback to network
 * Strategy:
 * - Network-first for HTML/JS/CSS (ensures updates are detected)
 * - Cache-first for static assets and data
 * - Network-first for external resources
 */
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Cross-origin requests (CDN scripts, fonts, etc.) — let the browser handle directly
	if (url.origin !== location.origin) {
		return;
	}

	// Data files and version.json bypass SW cache — IDB handles data persistence
	// Critical: version.json must never be cached by SW or update detection breaks
	if (
		url.pathname.includes('/data/') &&
		!url.pathname.endsWith('/sages.json')
	) {
		event.respondWith(fetch(request));
		return;
	}

	// Network-first for HTML, JS, CSS to ensure users get updates quickly
	const isAppFile =
		url.pathname.endsWith('.html') ||
		url.pathname.endsWith('.js') ||
		url.pathname.endsWith('.css') ||
		url.pathname === '/' ||
		url.pathname === '';

	if (isAppFile) {
		event.respondWith(
			fetch(request)
				.then((networkResponse) => {
					// Cache the new version
					if (networkResponse && networkResponse.status === 200) {
						const responseClone = networkResponse.clone();
						caches.open(CACHE_VERSION).then((cache) => {
							cache.put(request, responseClone);
						});
					}
					return networkResponse;
				})
				.catch(() => {
					// Network failed, fall back to cache
					return caches.match(request);
				}),
		);
		return;
	}

	// Cache-first strategy for other static assets (images, fonts, etc.)
	event.respondWith(
		caches
			.match(request)
			.then((cachedResponse) => {
				if (cachedResponse) {
					// Return cached version
					return cachedResponse;
				}

				// Not in cache, fetch from network and cache it
				return fetch(request).then((networkResponse) => {
					// Only cache successful responses
					if (networkResponse && networkResponse.status === 200) {
						const responseClone = networkResponse.clone();
						caches.open(CACHE_VERSION).then((cache) => {
							cache.put(request, responseClone);
						});
					}
					return networkResponse;
				});
			})
			.catch((error) => {
				console.error('[Service Worker] Fetch failed:', error);
				// Could return a custom offline page here
				throw error;
			}),
	);
});

/**
 * Message event - handle messages from the app
 */
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		console.log('[Service Worker] Received SKIP_WAITING message');
		self.skipWaiting();
	}
	if (event.data && event.data.type === 'GET_VERSION') {
		event.ports[0]?.postMessage({ cacheVersion: CACHE_VERSION });
	}
});

console.log('[Service Worker] Script loaded');
