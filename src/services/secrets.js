// API keys. In the desktop app they are encrypted by the OS (Electron safeStorage) in the main process.
// In the browser build they fall back to localStorage, which is NOT secure: any script on the page can read it.
export const SECRET_KEYS = ['gemini_api_key', 'openai_api_key', 'groq_api_key', 'openrouter_api_key'];

const cache = {};
const desktop = () => (typeof window !== 'undefined' && window.desktop && window.desktop.secrets) || null;

const readBrowserKey = (name) => {
  try {
    return localStorage.getItem(name) || '';
  } catch {
    return '';
  }
};
const removeBrowserKey = (name) => {
  try {
    localStorage.removeItem(name);
  } catch {}
};

// Must be awaited once at startup (see main.jsx) before the UI reads keys.
export async function initSecrets() {
  const bridge = desktop();
  if (bridge) {
    const stored = await bridge.getAll();
    Object.assign(cache, stored);
    // Migrate keys saved by the old browser build into encrypted storage, then delete them from localStorage
    for (const name of SECRET_KEYS) {
      const legacy = readBrowserKey(name).trim();
      if (legacy) {
        if (!cache[name]) {
          cache[name] = legacy;
          await bridge.set(name, legacy);
        }
        removeBrowserKey(name);
      }
    }
  } else {
    for (const name of SECRET_KEYS) cache[name] = readBrowserKey(name).trim();
  }
  return cache;
}

export function getSecret(name) {
  return (cache[name] || '').trim();
}

export function setSecret(name, value) {
  const v = (value || '').trim();
  cache[name] = v;
  const bridge = desktop();
  if (bridge) {
    bridge.set(name, v).catch((err) => console.warn('Failed to save key', err));
    return;
  }
  try {
    if (v) localStorage.setItem(name, v);
    else localStorage.removeItem(name);
  } catch (err) {
    console.warn('Failed to save key in browser storage', err);
  }
}

export const hasDesktopSecrets = () => Boolean(desktop());
