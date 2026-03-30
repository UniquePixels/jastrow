const Keyboard = window.SimpleKeyboard.default;
const KeyboardLayouts = window.SimpleKeyboardLayouts.default;

const layout = new KeyboardLayouts().get("hebrew");

let keyboard = null;

/**
 * Initialize the keyboard lazily — called the first time the overlay is shown.
 * Simple Keyboard cannot measure its container when display:none (hidden attribute).
 */
function initKeyboard() {
	if (keyboard) return;

	keyboard = new Keyboard({
		onKeyPress: (button) => onKeyPress(button),
		...layout,
		// Disable default onChange behavior - we'll handle it manually
		syncInstanceInputs: true,
		preventMouseDownDefault: true
	});
}

/**
 * Update simple-keyboard when input is changed directly.
 * Deferred to DOMContentLoaded to ensure wa-input is upgraded.
 */
let searchInput = null;
document.addEventListener("DOMContentLoaded", () => {
	searchInput = document.querySelector(".search");
	if (searchInput) {
		searchInput.addEventListener("input", (event) => {
			if (keyboard) {
				keyboard.setInput(event.target.value);
			}
		});
	}
});

// Watch for keyboard overlay becoming visible to trigger lazy init
const overlay = document.getElementById("keyboard-overlay");
if (overlay) {
	const observer = new MutationObserver(() => {
		if (!overlay.hidden) {
			initKeyboard();
			observer.disconnect();
		}
	});
	observer.observe(overlay, { attributes: true, attributeFilter: ["hidden"] });
}

function onKeyPress(button) {
	// Get the actual input element (handle shadow DOM for wa-input)
	const actualInput = searchInput.shadowRoot?.querySelector('input') || searchInput;

	if (button === "{shift}" || button === "{lock}") {
		handleShift();
		return;
	} else if (button === "{enter}") {
		// Trigger search when Enter is pressed on virtual keyboard
		// Must dispatch 'keydown' to match the listener in app.js
		searchInput.dispatchEvent(new KeyboardEvent('keydown', {
			key: 'Enter',
			bubbles: true
		}));
		return;
	} else if (button === "{bksp}") {
		// Handle backspace
		const start = actualInput.selectionStart || 0;
		const end = actualInput.selectionEnd || 0;
		const currentValue = actualInput.value || '';

		let newValue;
		let newCursorPos;

		if (start !== end) {
			// Delete selection
			newValue = currentValue.substring(0, start) + currentValue.substring(end);
			newCursorPos = start;
		} else if (start > 0) {
			// Delete character before cursor
			newValue = currentValue.substring(0, start - 1) + currentValue.substring(start);
			newCursorPos = start - 1;
		} else {
			return;
		}

		actualInput.value = newValue;
		searchInput.value = newValue;
		keyboard.setInput(newValue);
		actualInput.setSelectionRange(newCursorPos, newCursorPos);
		searchInput.dispatchEvent(new Event('input', { bubbles: true }));
		searchInput.focus({ preventScroll: true });
		return;
	}

	// Regular character input - insert at cursor position
	const start = actualInput.selectionStart || 0;
	const end = actualInput.selectionEnd || 0;
	const currentValue = actualInput.value || '';

	// Insert character at cursor position, replacing selection if any
	const before = currentValue.substring(0, start);
	const after = currentValue.substring(end);
	const newValue = before + button + after;
	const newCursorPos = start + button.length;

	actualInput.value = newValue;
	searchInput.value = newValue;
	keyboard.setInput(newValue);
	actualInput.setSelectionRange(newCursorPos, newCursorPos);
	searchInput.dispatchEvent(new Event('input', { bubbles: true }));
	searchInput.focus({ preventScroll: true });
}

function handleShift() {
	if (!keyboard) return;
	const currentLayout = keyboard.options.layoutName;
	const shiftToggle = currentLayout === "default" ? "shift" : "default";

	keyboard.setOptions({
		layoutName: shiftToggle,
	});
}
