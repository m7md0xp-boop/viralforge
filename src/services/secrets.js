// API keys.
// Desktop app: keys are encrypted by the OS (Electron safeStorage) in the main process and are NEVER
// sent to the renderer. The renderer only learns whether a key is saved.
// Browser build: keys stay in localStorage. That is NOT secure: any script on the page can read them.
export const SECRET_KEYS = ['gemini_api_key', 'openai_api_key', 'groq_api_key', 'openrouter_api_key'];

// Placeholder returned in desktop mode. It means "a key is saved", and it is never sent to any API.
const SAVED_MARKER = '__saved_in_desktop__';

const cache = {};
const bridge = () => (typeof window !== 'undefined' && window.desktop && window.desktop.secrets) || null;

const readBrowserKey = (name) => {
  try {
    return (localStorage.getItem(name) || '').trim();
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
  const api = bridge();
  if (api) {
    const status = await api.status();
    for (const name of SECRET_KEYS) {
      cache[name] = status && status[name] ? SAVED_MARKER : '';
      // Migrate keys saved by the old browser build into encrypted storage
      const legacy = readBrowserKey(name);
      if (legacy) {
        if (!status || !status[name]) {
          await api.set(name, legacy);
        }
        cache[name] = SAVED_MARKER;
        removeBrowserKey(name);
      }
    }
  } else {
    for (const name of SECRET_KEYS) cache[name] = readBrowserKey(name);
  }
  return cache;
}

export const hasDesktopSecrets = () => Boolean(bridge());

export function getSecret(name) {
  return (cache[name] || '').trim();
}

// Returns the saved key so the Settings fields can show it. Desktop: fetched from this profile's
// encrypted store on demand, and never kept in the cache. Browser: read from localStorage.
export async function revealSecret(name) {
  const api = bridge();
  if (api) {
    try {
      return ((await api.reveal(name)) || '').trim();
    } catch (err) {
      console.warn('Failed to read saved key', err);
      return '';
    }
  }
  return readBrowserKey(name);
}

export function setSecret(name, value) {
  const v = (value || '').trim();
  const api = bridge();
  if (api) {
    cache[name] = v ? SAVED_MARKER : '';
    api.set(name, v).catch((err) => console.warn('Failed to save key', err));
    return;
  }
  cache[name] = v;
  try {
    if (v) localStorage.setItem(name, v);
    else localStorage.removeItem(name);
  } catch (err) {
    console.warn('Failed to save key in browser storage', err);
  }
}
