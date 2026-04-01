/**
 * Constants for Jastrow Dictionary Application
 *
 * This file uses IIFE pattern to attach constants to window object
 * for compatibility with vanilla JS without build process.
 */

((window) => {
	/**
	 * Pagination settings for search results and page navigation
	 */
	window.PAGINATION = {
		RESULTS_PER_PAGE: 10, // Results shown per page in search
		MAX_ENTRIES_PER_PAGE: 50, // Maximum entries to prevent browser crash
		MAX_REFERENCES_DISPLAY: 10, // Maximum references shown in entry
		MAX_REFERENCE_RESULTS: 50, // Maximum reference search results before "Show more"
	};

	window.SCROLL = {
		DOM_CAP: 250, // Maximum entries in DOM before eviction
		LOAD_THRESHOLD: 800, // px from edge to trigger chunk load
		URL_UPDATE_DEBOUNCE: 500, // Debounce for URL hash updates on scroll
		RESIZE_SETTLE_MS: 100, // ResizeObserver settle time for scroll-to-entry
		RESIZE_SAFETY_TIMEOUT: 3000, // Safety timeout for ResizeObserver
		LOADING_BANNER_MIN: 1000, // Minimum display time (ms) for scroll loading banner
	};

	/**
	 * Dictionary metadata and data source configuration
	 */
	window.DICTIONARY = {
		TOTAL_PAGES: 1704, // Total pages in printed Jastrow dictionary
		// Split data files to comply with Cloudflare Pages 25MB limit
		DATA_URLS: [
			'data/jastrow-part1.jsonl', // First half of dictionary data
			'data/jastrow-part2.jsonl', // Second half of dictionary data
		],
		ARCHIVE_IMAGE_OFFSET: 15, // Offset for Archive.org image files (page 1 is at index 16, so offset is 15)
	};

	/**
	 * Search autocomplete and history settings
	 */
	window.SEARCH = {
		AUTOCOMPLETE_DEBOUNCE: 150, // ms debounce for autocomplete input
		MAX_SUGGESTIONS: 8, // max autocomplete dropdown items
		MAX_HISTORY: 20, // max search history entries
		HISTORY_KEY: 'jastrow-search-history', // localStorage key
	};

	/**
	 * Timeouts and debounce delays (in milliseconds)
	 */
	window.TIMEOUTS = {
		SCROLL_HIGHLIGHT_DURATION: 3000, // How long to highlight scrolled-to element
		SW_UPDATE_INTERVAL: 3600000, // SW update check interval (1 hour)
	};

	/**
	 * IndexedDB configuration for persistent data caching
	 */
	window.IDB = {
		DATABASE_NAME: 'jastrow-dictionary',
		ENTRIES_STORE: 'entries',
		METADATA_STORE: 'metadata',
		ABBR_STORE: 'abbreviations',
		SCHEMA_VERSION: 2,
		BATCH_SIZE: 500,
		VERSION_URL: 'data/version.json',
		ABBR_URL: 'data/jastrow-abbr.json',
		VERSION_TIMEOUT: 2000,
	};

	/**
	 * Input validation limits
	 */
	window.VALIDATION = {
		MAX_SEARCH_LENGTH: 100, // Maximum characters in search query
		PAGE_NUMBER_MIN: 1, // Minimum valid page number
		PAGE_NUMBER_MAX: 1704, // Maximum valid page number (same as TOTAL_PAGES)
	};

	/**
	 * External service URLs
	 */
	window.EXTERNAL_URLS = {
		SEFARIA_BASE: 'https://www.sefaria.org',

		// Archive.org - Jastrow Dictionary (single volume, 1:1 page mapping)
		// Uses IIIF Image API for stable URLs that don't depend on specific IA servers
		ARCHIVE_IIIF_BASE: 'https://iiif.archive.org/image/iiif/2',
		ARCHIVE_IIIF_PATH: 'Jastrow%2fJastrow_jp2.zip%2fJastrow_jp2%2fJastrow_',
		ARCHIVE_ID: 'Jastrow',
	};

	// Debug logging — enabled on localhost only
	window.DEBUG =
		location.hostname === 'localhost' || location.hostname === '127.0.0.1';
})(window);
