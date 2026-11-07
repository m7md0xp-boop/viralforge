import { hasDesktopSecrets } from './secrets';

// Maps the API host to the provider id used by the desktop main process.
const HOST_TO_PROVIDER = {
  'generativelanguage.googleapis.com': 'gemini',
  'api.groq.com': 'groq',
  'api.openai.com': 'openai',
  'openrouter.ai': 'openrouter'
};

// Drop-in replacement for fetch() for the AI providers.
// Desktop: the request goes to the main process, which adds the real API key and calls the API.
// Browser: a normal fetch() with the key the caller passed in the headers.
export async function providerFetch(url, init = {}) {
  const parsed = new URL(url);
  const provider = HOST_TO_PROVIDER[parsed.hostname];
  const bridge = typeof window !== 'undefined' && window.desktop && window.desktop.ai;

  if (provider && bridge && hasDesktopSecrets()) {
    if (init.signal && init.signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const result = await bridge.request({
      provider,
      path: parsed.pathname + parsed.search,
      body: typeof init.body === 'string' ? init.body : ''
    });
    return new Response(result.body, {
      status: result.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return fetch(url, init);
}
