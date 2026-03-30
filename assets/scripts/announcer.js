/**
 * Screen reader live region announcer.
 *
 * Injects two visually-hidden aria-live regions (polite + assertive)
 * and exposes window.announce(message, priority) for any module to use.
 *
 * Clear-then-set pattern ensures repeated identical messages are announced.
 */
document.addEventListener("DOMContentLoaded", () => {
	const regions = {};

	for (const priority of ["polite", "assertive"]) {
		const el = document.createElement("div");
		el.className = "wa-visually-hidden";
		el.setAttribute("aria-live", priority);
		el.setAttribute("aria-atomic", "true");
		document.body.appendChild(el);
		regions[priority] = el;
	}

	/**
	 * Announce a message to screen readers.
	 * @param {string} message - The text to announce
	 * @param {'polite'|'assertive'} [priority='polite'] - Announcement urgency
	 */
	window.announce = (message, priority = "polite") => {
		const region = regions[priority] || regions.polite;
		region.textContent = "";
		setTimeout(() => {
			region.textContent = message;
		}, 50);
	};
});
