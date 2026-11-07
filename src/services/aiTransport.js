import { hasDesktopSecrets } from './secrets';
import { bytesToBase64 } from './imageRequests';

import { AI_PROVIDERS } from '../config/aiProviders';

// Maps the API host to the provider id used by the desktop main process (both come from shared/aiProviders.json).
const HOST_TO_PROVIDER = Object.fromEntries(AI_PROVIDERS.map((p) => [p.host, p.id]));

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

// Explicit-provider request, used for image providers (they share hosts with text providers, so the
// host map cannot tell them apart). Returns a plain object:
//   { ok, status, contentType, json, base64, text }
// `json` is set for JSON replies, `base64` for binary replies (binary: true).
export async function providerPost({ providerId, base, path, browserPath, headers = {}, body, signal, binary = false }) {
  const bridge = typeof window !== 'undefined' && window.desktop && window.desktop.ai;

  if (bridge && hasDesktopSecrets()) {
    if (signal && signal.aborted) throw abortError();
    const requestId = newRequestId();
    const call = bridge.request({
      provider: providerId,
      path,
      body,
      requestId,
      responseType: binary ? 'base64' : 'text'
    });

    let onAbort;
    const aborted = new Promise((_, reject) => {
      onAbort = () => {
        if (bridge.cancel) bridge.cancel(requestId).catch(() => {});
        reject(abortError());
      };
      if (signal) signal.addEventListener('abort', onAbort, { once: true });
    });
    try {
      const result = await (signal ? Promise.race([call, aborted]) : call);
      return shape(result.status, result.contentType || '', binary ? null : result.body, binary ? result.body : null);
    } finally {
      if (signal) signal.removeEventListener('abort', onAbort);
    }
  }

  // Browser build: the caller's key is already in `headers`
  const res = await fetch(`${base}${browserPath || path}`, { method: 'POST', headers, body, signal });
  const contentType = res.headers.get('content-type') || '';
  if (binary) {
    const bytes = new Uint8Array(await res.arrayBuffer());
    return shape(res.status, contentType, null, bytesToBase64(bytes));
  }
  return shape(res.status, contentType, await res.text(), null);
}

const shape = (status, contentType, text, base64) => {
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }
  return { ok: status >= 200 && status < 300, status, contentType, json, text, base64 };
};
