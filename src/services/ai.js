import { getSecret } from './secrets';
import { providerFetch } from './aiTransport';
import { AI_PROVIDERS, getProvider, PROVIDER_IDS } from '../config/aiProviders';
import { buildJsonRequest, readJsonResponse, parseJsonLoose, normalizeAiResponse } from './providerRequests';
import { translate } from '../i18n/translate';
import { schemaExample } from '../config/prompts';

// One request (or one Gemini retry chain) may take up to this long. Long prompts are slow on every provider.
export const AI_REQUEST_TIMEOUT_MS = 90000;

const ACTIVE_KEY = 'text_provider';

// The provider chosen in Settings. Unknown or legacy values fall back to Gemini.
export const getActiveProviderId = () => {
  try {
    const saved = localStorage.getItem(ACTIVE_KEY);
    return PROVIDER_IDS.includes(saved) ? saved : 'gemini';
  } catch {
    return 'gemini';
  }
};

export const setActiveProviderId = (id) => {
  try {
    localStorage.setItem(ACTIVE_KEY, PROVIDER_IDS.includes(id) ? id : 'gemini');
  } catch (err) {
    console.warn('Failed to save provider choice', err);
  }
};

const abortError = () => new DOMException('Aborted', 'AbortError');

// Gemini: up to 3 attempts. The whole chain shares one 90s budget.
export const callGeminiWithRetry = async (apiKey, requestBody) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${getProvider('gemini').model}:generateContent`;

  let lastStatus = 'Network error';
  const maxAttempts = 3;
  const wait = (ms) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      controller.signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(abortError());
        },
        { once: true }
      );
    });

  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (controller.signal.aborted) throw abortError();

        const res = await providerFetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        if (res.ok) {
          const json = await res.json();
          const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) throw new Error('Empty response');
          return normalizeAiResponse(JSON.parse(rawText));
        }

        lastStatus = res.status;
        if ([400, 401, 403, 404, 429].includes(res.status)) {
          let errMsg = `Status ${res.status}`;
          try {
            const errJson = await res.json();
            if (errJson?.error?.message) errMsg = errJson.error.message;
          } catch {
            // Body is not JSON: keep the status text
          }
          const err = new Error(errMsg);
          err.status = res.status;
          throw err;
        }

        if (attempt < maxAttempts) await wait(1000 * attempt);
      } catch (err) {
        if (err.name === 'AbortError' || controller.signal.aborted) throw err;
        if (err.status && [400, 401, 403, 404, 429].includes(err.status)) throw err;
        lastStatus = err.status || err.message || 'Network error';
        if (attempt < maxAttempts) await wait(1000 * attempt);
      }
    }

    const finalErr = new Error(`Text generation failed after ${maxAttempts} attempts: ${lastStatus}`);
    finalErr.status = lastStatus;
    throw finalErr;
  } finally {
    clearTimeout(timeoutId);
  }
};

const callJsonProvider = async (provider, key, prompt, signal) => {
  const { url, headers, body } = buildJsonRequest(provider, { key, model: provider.model, prompt });
  const res = await providerFetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal
  });

  if (!res.ok) {
    let message = `Status ${res.status}`;
    try {
      const errJson = await res.json();
      message = errJson?.error?.message || errJson?.message || message;
    } catch {
      // Body is not JSON: keep the status text
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  const json = await res.json();
  const content = readJsonResponse(provider, json);
  if (!content) throw new Error(`Empty content from ${provider.label.en}`);
  return normalizeAiResponse(parseJsonLoose(content));
};

// Runs the request on the active provider.
// `geminiRequestBody` carries the response schema; other providers get the same schema as a JSON example.
// Returns { data, provider } or null when no key is saved. Errors are thrown as { provider, error }.
export const executeTextGeneration = async (prompt, geminiRequestBody, ui) => {
  const providerId = getActiveProviderId();
  const provider = getProvider(providerId);
  const key = getSecret(provider.keyName).trim();

  if (!key) {
    ui.showToast(ui.t('settings.keyRequired', { provider: provider.label.en }), 'error');
    return null;
  }

  try {
    if (providerId === 'gemini') {
      const data = await callGeminiWithRetry(key, geminiRequestBody);
      return { data, provider: providerId };
    }

    const schema = geminiRequestBody?.generationConfig?.responseSchema;
    const fullPrompt = schema
      ? `${prompt}\n\nReturn ONLY one JSON object matching this example exactly (same keys, no markdown):\n${schemaExample(schema)}`
      : prompt;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
    try {
      const data = await callJsonProvider(provider, key, fullPrompt, controller.signal);
      return { data, provider: providerId };
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    throw { provider: providerId, error };
  }
};

// Friendly, translated message for a failed text request. `t` is the UI translator (English when omitted).
export const getSpecificApiErrorMessage = (err, provider = 'gemini', t = (key, vars) => translate('en', key, vars)) => {
  if (!err) return t('errors.unknown');
  if (err.name === 'AbortError') return t('errors.timeout', { seconds: Math.round(AI_REQUEST_TIMEOUT_MS / 1000) });
  const name = getProvider(provider).label.en;
  // HTTP status from the error, or found in its message (some providers only put it there)
  const status = Number(
    err?.status || (typeof err === 'number' ? err : 0) || err?.message?.match(/\b(401|402|403|404|429|500|503)\b/)?.[1] || 0
  );
  const message = err?.message || (typeof err === 'string' ? err : '');
  const lower = message.toLowerCase();

  if (status === 401 || status === 403 || /api[_ ]?key|unauthori[sz]ed|invalid.*key|permission/.test(lower)) {
    return t('errors.invalidKey', { provider: name });
  }
  if (status === 402 || lower.includes('insufficient') || lower.includes('balance')) {
    return t('errors.noCredit', { provider: name });
  }
  if (status === 429 || lower.includes('quota') || lower.includes('rate limit') || lower.includes('resource_exhausted')) {
    return t('errors.rateLimited', { provider: name });
  }
  return message ? t('errors.generic', { provider: name, message }) : t('errors.network', { provider: name, status: status || '-' });
};

export { AI_PROVIDERS };
