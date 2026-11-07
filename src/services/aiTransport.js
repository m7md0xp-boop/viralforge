import { hasDesktopSecrets } from './secrets';

// Maps the API host to the provider id used by the desktop main process.
// Provider ids match src/config/aiProviders.js and electron/main.cjs.
const HOST_TO_PROVIDER = {
  'generativelanguage.googleapis.com': 'gemini',
  'api.anthropic.com': 'claude',
  'api.deepseek.com': 'deepseek',
  'api.openai.com': 'chatgpt'
};

const abortError = () => new DOMException('Aborted', 'AbortError');
const newRequestId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

// Drop-in replacement for fetch() for the AI providers.
// Desktop: the request goes to the main process, which adds the real API key and calls the API.
//          If the caller aborts, the renderer rejects at once and the main process request is cancelled.
// Browser: a normal fetch() with the key the caller passed in the headers.
export async function providerFetch(url, init = {}) {
  const parsed = new URL(url);
  const provider = HOST_TO_PROVIDER[parsed.hostname];
  const bridge = typeof window !== 'undefined' && window.desktop && window.desktop.ai;

  if (provider && bridge && hasDesktopSecrets()) {
    const signal = init.signal;
    if (signal && signal.aborted) throw abortError();

    const requestId = newRequestId();
    const call = bridge.request({
      provider,
      path: parsed.pathname + parsed.search,
      body: typeof init.body === 'string' ? init.body : '',
      requestId
    });

    if (!signal) {
      const result = await call;
      return new Response(result.body, { status: result.status, headers: { 'Content-Type': 'application/json' } });
    }

    let onAbort;
    const aborted = new Promise((_, reject) => {
      onAbort = () => {
        if (bridge.cancel) bridge.cancel(requestId).catch(() => {});
        reject(abortError());
      };
      signal.addEventListener('abort', onAbort, { once: true });
    });
    try {
      const result = await Promise.race([call, aborted]);
      return new Response(result.body, { status: result.status, headers: { 'Content-Type': 'application/json' } });
    } finally {
      signal.removeEventListener('abort', onAbort);
    }
  }
  return fetch(url, init);
}
