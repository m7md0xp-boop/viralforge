// Reads the system clipboard. Desktop: through the main process (no permission prompt).
// Browser: navigator.clipboard, which needs the page to be focused and the user to allow it.
export async function readClipboardText() {
  if (typeof window !== 'undefined' && window.desktop && window.desktop.clipboard) {
    return (await window.desktop.clipboard.readText()) || '';
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
    return (await navigator.clipboard.readText()) || '';
  }
  throw new Error('Clipboard is not available');
}
