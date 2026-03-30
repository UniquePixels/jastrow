/**
 * HTML Sanitization Utilities
 * Provides XSS protection for user-generated content and external data
 *
 * This file is loaded as a regular script (not ES module) and attaches functions to window object
 */

(function(window) {
	// Install the DOMPurify hook once at init time — forces external links to open in new tab
	if (window.DOMPurify) {
		window.DOMPurify.addHook('afterSanitizeAttributes', function(node) {
			if (node.tagName === 'A' && node.getAttribute('href') && !node.getAttribute('href').startsWith('#')) {
				node.setAttribute('target', '_blank');
				node.setAttribute('rel', 'noopener noreferrer');
			}
		});
	}

	/**
	 * Validate URL against whitelist of allowed domains
	 * @param {string} url - URL to validate
	 * @param {string[]} allowedDomains - Array of allowed domain names
	 * @returns {boolean} - True if URL is safe, false otherwise
	 */
	window.sanitizeURL = function(url, allowedDomains) {
		allowedDomains = allowedDomains || ['sefaria.org', 'archive.org'];

		if (!url || typeof url !== 'string') {
			return false;
		}

		// Allow hash-only URLs (internal navigation)
		if (url.startsWith('#')) {
			return true;
		}

		try {
			const urlObj = new URL(url);

			// Only allow http and https protocols
			if (!['http:', 'https:'].includes(urlObj.protocol)) {
				return false;
			}

			// Check if hostname contains any of the allowed domains
			return allowedDomains.some(function(domain) {
				return urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain);
			});
		} catch (error) {
			// Invalid URL
			console.warn('Invalid URL:', url, error);
			return false;
		}
	};

	/**
	 * Sanitize search query input
	 * @param {string} query - User search input
	 * @param {number} maxLength - Maximum allowed length
	 * @returns {Object} - { valid: boolean, query: string, error?: string }
	 */
	window.sanitizeSearchQuery = function(query, maxLength) {
		maxLength = maxLength || 100;

		if (!query || typeof query !== 'string') {
			return { valid: false, error: 'Empty query' };
		}

		const trimmed = query.trim();

		if (trimmed.length === 0) {
			return { valid: false, error: 'Empty query' };
		}

		if (trimmed.length > maxLength) {
			return { valid: false, error: 'Query too long (max ' + maxLength + ' characters)' };
		}

		// Strip all HTML tags, keeping only text content
		const cleanQuery = window.DOMPurify
			? window.DOMPurify.sanitize(trimmed, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
			: trimmed.replace(/<[^>]*>/g, '');

		// Check if anything remains after stripping HTML
		if (cleanQuery.length === 0) {
			return { valid: false, error: 'Invalid query content' };
		}

		return { valid: true, query: cleanQuery };
	};

	/**
	 * Validate page number input
	 * @param {any} pageNumber - Page number to validate
	 * @param {number} min - Minimum valid page number
	 * @param {number} max - Maximum valid page number
	 * @returns {Object} - { valid: boolean, page?: number, error?: string }
	 */
	window.validatePageNumber = function(pageNumber, min, max) {
		min = min || 1;
		max = max || 1704;

		const parsed = parseInt(pageNumber, 10);

		if (Number.isNaN(parsed)) {
			return { valid: false, error: 'Invalid page number' };
		}

		if (parsed < min || parsed > max) {
			return { valid: false, error: 'Page number must be between ' + min + ' and ' + max };
		}

		return { valid: true, page: parsed };
	};

})(window);
