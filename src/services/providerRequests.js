// Builds JSON-mode chat requests and reads their replies for each API format in shared/aiProviders.json.
// Pure functions (no imports) so they can be tested in Node. Gemini has its own path in ai.js.

const userMessage = (prompt) => [{ role: 'user', content: prompt }];

// Request for a provider. `provider` is one catalog entry, `key` is the API key (browser build only).
export function buildJsonRequest(provider, { key, model, prompt }) {
  const headers = { 'Content-Type': 'application/json' };
  if (provider.auth && provider.auth.header) {
    headers[provider.auth.header] = `${provider.auth.prefix || ''}${key}`;
  }
  Object.assign(headers, provider.headers || {});

  let body;
  switch (provider.format) {
    case 'openai':
      body = { model, messages: userMessage(prompt), response_format: { type: 'json_object' } };
      break;
    case 'anthropic':
      body = { model, max_tokens: 4096, messages: userMessage(prompt) };
      break;
    case 'cohere':
      body = { model, messages: userMessage(prompt), response_format: { type: 'json_object' } };
      break;
    default:
      throw new Error(`Unsupported API format: ${provider.format}`);
  }

  return { url: `${provider.base}${provider.path}`, headers, body };
}

// Text of the model's reply, or '' when the response has no content.
export function readJsonResponse(provider, json) {
  switch (provider.format) {
    case 'openai':
      return json?.choices?.[0]?.message?.content || '';
    case 'anthropic':
      return (json?.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    case 'cohere':
      return (json?.message?.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    default:
      return '';
  }
}

// Pulls a JSON object out of a model reply, even when it is wrapped in code fences or prose.
export function parseJsonLoose(raw) {
  let text = String(raw || '').trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(text);
  } catch {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last > first) return JSON.parse(text.slice(first, last + 1));
    throw new Error('The AI reply was not valid JSON');
  }
}
